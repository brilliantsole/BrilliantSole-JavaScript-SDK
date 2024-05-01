import { createConsole } from "../utils/Console.js";
import Timer from "../utils/Timer.js";

import FileTransferManager from "../FileTransferManager.js";
import TfliteManager from "../TfliteManager.js";

/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherListener} EventDispatcherListener */
/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherOptions} EventDispatcherOptions */

/** @typedef {import("../FileTransferManager.js").FileTransferMessageType} FileTransferMessageType */
/** @typedef {import("../TfliteManager.js").TfliteMessageType} TfliteMessageType */
/** @typedef {import("../FirmwareManager.js").FirmwareMessageType} FirmwareMessageType */

/** @typedef {"webBluetooth" | "noble" | "webSocketClient"} ConnectionType */
/** @typedef {"not connected" | "connecting" | "connected" | "disconnecting"} ConnectionStatus */
/**
 * @typedef { "manufacturerName" |
 * "modelNumber" |
 * "softwareRevision" |
 * "hardwareRevision" |
 * "firmwareRevision" |
 * "pnpId" |
 * "serialNumber" |
 * "batteryLevel" |
 * "getName" |
 * "setName" |
 * "getType" |
 * "setType" |
 * "getSensorConfiguration" |
 * "setSensorConfiguration" |
 * "sensorScalars" |
 * "pressurePositions" |
 * "sensorData" |
 * "setCurrentTime" |
 * "getCurrentTime" |
 * "triggerVibration" |
 * FileTransferMessageType |
 * TfliteMessageType |
 * "mtu" |
 * FirmwareMessageType
 * } ConnectionMessageType
 */

const _console = createConsole("ConnectionManager", { log: true });

/**
 * @callback ConnectionStatusCallback
 * @param {ConnectionStatus} status
 */

/**
 * @callback MessageReceivedCallback
 * @param {ConnectionMessageType} messageType
 * @param {DataView} data
 */

class BaseConnectionManager {
    /** @type {ConnectionMessageType[]} */
    static #MessageTypes = [
        "manufacturerName",
        "modelNumber",
        "softwareRevision",
        "hardwareRevision",
        "firmwareRevision",
        "pnpId",
        "serialNumber",
        "batteryLevel",
        "getName",
        "setName",
        "getType",
        "setType",
        "getSensorConfiguration",
        "setSensorConfiguration",
        "sensorScalars",
        "pressurePositions",
        "sensorData",
        "getCurrentTime",
        "setCurrentTime",
        "triggerVibration",

        ...FileTransferManager.MessageTypes,
        ...TfliteManager.MessageTypes,
    ];
    static get MessageTypes() {
        return this.#MessageTypes;
    }

    /** @type {string?} */
    get id() {
        this.#throwNotImplementedError("id");
    }

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

    /**
     * @param {ConnectionMessageType} messageType
     * @param {DataView|ArrayBuffer} data
     */
    async sendMessage(messageType, data) {
        this.#assertIsConnectedAndNotDisconnecting();
        _console.log("sending message", { messageType, data });
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
