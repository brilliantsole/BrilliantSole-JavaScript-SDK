import { createConsole } from "../../utils/Console.js";
import { isInBrowser } from "../../utils/environment.js";
import BaseConnectionManager from "../BaseConnectionManager.js";
import Device from "../../Device.js";
import { parseMessage } from "../../utils/ParseUtils.js";

const _console = createConsole("WebSocketClientConnectionManager", { log: true });

/** @typedef {import("../BaseConnectionManager.js").ConnectionMessageType} ConnectionMessageType */
/** @typedef {import("../BaseConnectionManager.js").ConnectionType} ConnectionType */

/** @typedef {import("../../server/websocket/WebSocketClient.js").WebSocketClient} WebSocketClient */
/** @typedef {import("../../Device.js").DeviceEventType} DeviceEventType */

/** @typedef {import("../../server/ServerUtils.js").ClientDeviceMessage} ClientDeviceMessage */

class WebSocketClientConnectionManager extends BaseConnectionManager {
    static get isSupported() {
        return isInBrowser;
    }
    /** @type {ConnectionType} */
    static get type() {
        return "webSocketClient";
    }

    /** @type {string?} */
    #id;
    get id() {
        return this.#id;
    }
    set id(newId) {
        _console.assertTypeWithError(newId, "string");
        if (this.#id == newId) {
            _console.log("redundant id assignment");
            return;
        }
        this.#id = newId;
    }

    #isConnected = false;
    get isConnected() {
        return this.#isConnected;
    }
    set isConnected(newIsConnected) {
        _console.assertTypeWithError(newIsConnected, "boolean");
        if (this.#isConnected == newIsConnected) {
            _console.log("redundant newIsConnected assignment", newIsConnected);
            return;
        }
        this.#isConnected = newIsConnected;

        this.status = this.#isConnected ? "connected" : "not connected";

        if (this.#isConnected) {
            this.#requestAllDeviceInformation();
        }
    }

    async connect() {
        await super.connect();
        this.sendWebSocketConnectMessage();
    }
    async disconnect() {
        await super.disconnect();
        this.sendWebSocketDisconnectMessage();
    }

    /**
     * @param {ConnectionMessageType} messageType
     * @param {DataView|ArrayBuffer} data
     */
    async sendMessage(messageType, data) {
        await super.sendMessage(...arguments);
        switch (messageType) {
            case "setName":
            case "setType":
            case "setSensorConfiguration":
            case "triggerVibration":
                this.sendWebSocketMessage({ type: messageType, data });
                break;
            default:
                throw Error(`uncaught messageType "${messageType}"`);
        }
    }

    /** @type {boolean} */
    get canReconnect() {
        return true;
    }
    async reconnect() {
        await super.reconnect();
        _console.log("attempting to reconnect...");
        this.connect();
    }

    /**
     * @callback SendWebSocketMessageCallback
     * @param {...(ConnectionMessageType|ClientDeviceMessage)} messages
     */

    /** @type {SendWebSocketMessageCallback?} */
    sendWebSocketMessage;
    /** @type {function?} */
    sendWebSocketConnectMessage;
    /** @type {function?} */
    sendWebSocketDisconnectMessage;
    /** @param {DataView} dataView */
    onWebSocketMessage(dataView) {
        _console.log({ dataView });

        parseMessage(
            dataView,
            Device.EventTypes,
            (_messageType, dataView) => {
                /** @type {DeviceEventType} */
                const messageType = _messageType;

                let byteOffset = 0;

                switch (messageType) {
                    case "isConnected":
                        const isConnected = Boolean(dataView.getUint8(byteOffset++));
                        _console.log({ isConnected });
                        this.isConnected = isConnected;
                        break;
                    case "manufacturerName":
                    case "modelNumber":
                    case "softwareRevision":
                    case "hardwareRevision":
                    case "firmwareRevision":
                    case "pnpId":
                    case "batteryLevel":
                    case "getName":
                    case "getType":
                    case "getSensorConfiguration":
                    case "sensorData":
                        this.onMessageReceived(messageType, dataView);
                        break;
                    default:
                        _console.error(`uncaught messageType "${messageType}"`);
                        break;
                }
            },
            true
        );
    }

    /** @type {ConnectionMessageType[]} */
    static #AllDeviceInformationConnectionMessageTypes = [
        "manufacturerName",
        "modelNumber",
        "softwareRevision",
        "hardwareRevision",
        "firmwareRevision",
        "pnpId",
        "batteryLevel",
        "getName",
        "getType",
        "getSensorConfiguration",
    ];
    get #allDeviceInformationConnectionMessageTypes() {
        return WebSocketClientConnectionManager.#AllDeviceInformationConnectionMessageTypes;
    }
    #requestAllDeviceInformation() {
        this.sendWebSocketMessage(...this.#allDeviceInformationConnectionMessageTypes);
    }
}

export default WebSocketClientConnectionManager;
