import { createConsole } from "../utils/Console.js";
import Timer from "../utils/Timer.js";

import FileTransferManager from "../FileTransferManager.js";
import TfliteManager from "../TfliteManager.js";
import { concatenateArrayBuffers } from "../utils/ArrayBufferUtils.js";
import { parseMessage } from "../utils/ParseUtils.js";
import DeviceInformationManager from "../DeviceInformationManager.js";
import InformationManager from "../InformationManager.js";
import VibrationManager from "../vibration/VibrationManager.js";
import SensorConfigurationManager from "../sensor/SensorConfigurationManager.js";

const _console = createConsole("BaseConnectionManager", { log: true });

/** @typedef {import("../FileTransferManager.js").FileTransferMessageType} FileTransferMessageType */
/** @typedef {import("../TfliteManager.js").TfliteMessageType} TfliteMessageType */
/** @typedef {import("../FirmwareManager.js").FirmwareMessageType} FirmwareMessageType */
/** @typedef {import("../DeviceInformationManager.js").DeviceInformationMessageType} DeviceInformationMessageType */
/** @typedef {import("../InformationManager.js").InformationMessageType} InformationMessageType */
/** @typedef {import("../sensor/SensorConfigurationManager.js").SensorConfigurationMessageType} SensorConfigurationMessageType */
/** @typedef {import("../vibration/VibrationManager.js").VibrationMessageType} VibrationMessageType */

/** @typedef {"webBluetooth" | "noble" | "webSocketClient"} ConnectionType */
/** @typedef {"not connected" | "connecting" | "connected" | "disconnecting"} ConnectionStatus */

/**
 * @typedef { SensorConfigurationMessageType |
 * "pressurePositions" |
 * "sensorScalars" |
 * "sensorData" |
 * VibrationMessageType |
 * InformationMessageType |
 * TfliteMessageType |
 * FileTransferMessageType |
 * FirmwareMessageType
 * } TxRxMessageType
 */

/**
 * @typedef TxMessage
 * @type {Object}
 * @property {TxRxMessageType} type
 * @property {ArrayBuffer?} data
 */

/**
 * @typedef { DeviceInformationMessageType |
 * "batteryLevel" |
 * "smp" |
 * "rx" |
 * "tx" |
 * TxRxMessageType
 * } ConnectionMessageType
 */

/**
 * @callback ConnectionStatusCallback
 * @param {ConnectionStatus} status
 */

/**
 * @callback MessageReceivedCallback
 * @param {ConnectionMessageType} messageType
 * @param {DataView} dataView
 */

class BaseConnectionManager {
    // MESSAGES

    /** @type {TxRxMessageType[]} */
    static #TxRxMessageTypes = [
        ...InformationManager.MessageTypes,
        ...SensorConfigurationManager.MessageTypes,

        "pressurePositions",
        "sensorScalars",
        "sensorData",

        ...VibrationManager.MessageTypes,
        ...TfliteManager.MessageTypes,
        ...FileTransferManager.MessageTypes,
    ];
    static get TxRxMessageTypes() {
        return this.#TxRxMessageTypes;
    }
    /** @type {ConnectionMessageType[]} */
    static #MessageTypes = [
        ...DeviceInformationManager.MessageTypes,
        "batteryLevel",
        "smp",
        "rx",
        "tx",
        ...this.TxRxMessageTypes,
    ];
    static get MessageTypes() {
        return this.#MessageTypes;
    }
    /** @param {ConnectionMessageType} messageType */
    static #AssertValidTxRxMessageType(messageType) {
        _console.assertEnumWithError(messageType, this.#TxRxMessageTypes);
    }

    // ID

    /** @type {string?} */
    get id() {
        this.#throwNotImplementedError("id");
    }

    // CALLBACKS
    /** @type {ConnectionStatusCallback?} */
    onStatusUpdated;
    /** @type {MessageReceivedCallback?} */
    onMessageReceived;

    /** @param {string} name */
    static #staticThrowNotImplementedError(name) {
        throw new Error(`"${name}" is not implemented by "${this.name}" subclass`);
    }
    /** @param {string} name */
    #throwNotImplementedError(name) {
        throw new Error(`"${name}" is not implemented by "${this.constructor.name}" subclass`);
    }

    static get isSupported() {
        return false;
    }
    /** @type {boolean} */
    get isSupported() {
        return this.constructor.isSupported;
    }

    /** @type {ConnectionType} */
    static get type() {
        this.#staticThrowNotImplementedError("type");
    }
    /** @type {ConnectionType} */
    get type() {
        return this.constructor.type;
    }

    /** @throws {Error} if not supported */
    #assertIsSupported() {
        _console.assertWithError(this.isSupported, `${this.constructor.name} is not supported`);
    }

    /** @throws {Error} if abstract class */
    #assertIsSubclass() {
        _console.assertWithError(
            this.constructor != BaseConnectionManager,
            `${this.constructor.name} must be subclassed`
        );
    }

    constructor() {
        this.#assertIsSubclass();
        this.#assertIsSupported();
    }

    /** @type {ConnectionStatus} */
    #status = "not connected";
    get status() {
        return this.#status;
    }
    /** @protected */
    set status(newConnectionStatus) {
        _console.assertTypeWithError(newConnectionStatus, "string");
        if (this.#status == newConnectionStatus) {
            _console.log(`tried to assign same connection status "${newConnectionStatus}"`);
            return;
        }
        _console.log(`new connection status "${newConnectionStatus}"`);
        this.#status = newConnectionStatus;
        this.onStatusUpdated?.(this.status);

        if (this.isConnected) {
            this.#timer.start();
        } else {
            this.#timer.stop();
        }

        if (this.#status == "not connected") {
            this.#mtu = null;
        }
    }

    get isConnected() {
        return this.status == "connected";
    }

    /** @throws {Error} if connected */
    #assertIsNotConnected() {
        _console.assertWithError(!this.isConnected, "device is already connected");
    }
    /** @throws {Error} if connecting */
    #assertIsNotConnecting() {
        _console.assertWithError(this.status != "connecting", "device is already connecting");
    }
    /** @throws {Error} if not connected */
    #assertIsConnected() {
        _console.assertWithError(this.isConnected, "device is not connected");
    }
    /** @throws {Error} if disconnecting */
    #assertIsNotDisconnecting() {
        _console.assertWithError(this.status != "disconnecting", "device is already disconnecting");
    }
    /** @throws {Error} if not connected or is disconnecting */
    #assertIsConnectedAndNotDisconnecting() {
        this.#assertIsConnected();
        this.#assertIsNotDisconnecting();
    }

    async connect() {
        this.#assertIsNotConnected();
        this.#assertIsNotConnecting();
        this.status = "connecting";
    }
    /** @type {boolean} */
    get canReconnect() {
        return false;
    }
    async reconnect() {
        this.#assertIsNotConnected();
        this.#assertIsNotConnecting();
        _console.assert(this.canReconnect, "unable to reconnect");
    }
    async disconnect() {
        this.#assertIsConnected();
        this.#assertIsNotDisconnecting();
        this.status = "disconnecting";
        _console.log("disconnecting from device...");
    }

    /** @param {ArrayBuffer} data */
    async sendSmpMessage(data) {
        this.#assertIsConnectedAndNotDisconnecting();
        _console.log("sending smp message", data);
    }

    /** @type {TxMessage[]} */
    #pendingMessages = [];

    /**
     * @param {TxMessage[]?} messages
     * @param {boolean} sendImmediately
     */
    async sendTxMessages(messages, sendImmediately = true) {
        this.#assertIsConnectedAndNotDisconnecting();

        if (messages) {
            this.#pendingMessages.push(...messages);
        }

        if (!sendImmediately) {
            return;
        }

        _console.log("sendTxMessages", this.#pendingMessages.slice());

        const arrayBuffers = this.#pendingMessages.map((message) => {
            BaseConnectionManager.#AssertValidTxRxMessageType(message.type);
            const messageTypeEnum = BaseConnectionManager.TxRxMessageTypes.indexOf(message.type);
            const dataLength = new DataView(new ArrayBuffer(2));
            dataLength.setUint16(0, message.data?.byteLength || 0, true);
            return concatenateArrayBuffers(messageTypeEnum, dataLength, message.data);
        });

        if (this.#mtu) {
            while (arrayBuffers.length > 0) {
                let arrayBufferByteLength = 0;
                let arrayBufferCount = 0;
                arrayBuffers.some((arrayBuffer) => {
                    if (arrayBufferByteLength + arrayBuffer.byteLength > this.#mtu - 3) {
                        return true;
                    }
                    arrayBufferCount++;
                    arrayBufferByteLength += arrayBuffer.byteLength;
                });
                const arrayBuffersToSend = arrayBuffers.splice(0, arrayBufferCount);
                _console.log({ arrayBufferCount, arrayBuffersToSend });

                const arrayBuffer = concatenateArrayBuffers(...arrayBuffersToSend);
                _console.log("sending arrayBuffer", arrayBuffer);
                await this.sendTxData(arrayBuffer);
            }
        } else {
            const arrayBuffer = concatenateArrayBuffers(...arrayBuffers);
            _console.log("sending arrayBuffer", arrayBuffer);
            await this.sendTxData(arrayBuffer);
        }

        this.#pendingMessages.length = 0;
    }

    /** @param {number?} */
    #mtu;
    get mtu() {
        return this.#mtu;
    }
    set mtu(newMtu) {
        this.#mtu = newMtu;
    }

    /** @param {ArrayBuffer} data */
    async sendTxData(data) {
        _console.log("sendTxData", data);
    }

    /** @param {DataView} dataView */
    parseRxMessage(dataView) {
        parseMessage(dataView, BaseConnectionManager.#TxRxMessageTypes, this.#onRxMessage.bind(this), null, true);
    }

    /**
     * @param {TxRxMessageType} messageType
     * @param {DataView} dataView
     */
    #onRxMessage(messageType, dataView) {
        _console.log({ messageType, dataView });
        this.onMessageReceived?.(messageType, dataView);
    }

    #timer = new Timer(this.#checkConnection.bind(this), 5000);
    #checkConnection() {
        //console.log("checking connection...");
        if (!this.isConnected) {
            _console.log("timer detected disconnection");
            this.status = "not connected";
        }
    }
}

export default BaseConnectionManager;
