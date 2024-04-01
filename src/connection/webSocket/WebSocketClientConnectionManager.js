import { createConsole } from "../../utils/Console.js";
import { isInBrowser } from "../../utils/environment.js";
import ConnectionManager from "../ConnectionManager.js";
import Device from "../../Device.js";
import { parseMessage } from "../../utils/ParseUtils.js";

const _console = createConsole("WebSocketClientConnectionManager", { log: true });

/** @typedef {import("../ConnectionManager.js").ConnectionMessageType} ConnectionMessageType */
/** @typedef {import("../ConnectionManager.js").ConnectionType} ConnectionType */

/** @typedef {import("../../server/websocket/WebSocketClient.js").WebSocketClient} WebSocketClient */
/** @typedef {import("../../Device.js").DeviceEventType} DeviceEventType */

/** @typedef {import("../../server/ServerUtils.js").ClientDeviceMessage} ClientDeviceMessage */

class WebSocketClientConnectionManager extends ConnectionManager {
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

    #isConnectedToServer = false;
    get isConnectedToServer() {
        return this.#isConnectedToServer;
    }
    set isConnectedToServer(newIsConnectedToServer) {
        _console.assertTypeWithError(newIsConnectedToServer, "boolean");
        if (this.#isConnectedToServer == newIsConnectedToServer) {
            _console.log("redundant isConnectedToServer assignment", newIsConnectedToServer);
            return;
        }
        this.#isConnectedToServer = newIsConnectedToServer;

        if (this.#isConnectedToServer) {
            this.#requestAllDeviceInformation();
        }
    }

    #_isConnected = false;
    get #isConnected() {
        return this.#_isConnected;
    }
    set #isConnected(newIsConnected) {
        _console.assertTypeWithError(newIsConnected, "boolean");
        if (this.#_isConnected == newIsConnected) {
            _console.log("redundant newIsConnected assignment", newIsConnected);
            return;
        }
        this.#_isConnected = newIsConnected;
        this.status = this.#_isConnected ? "connected" : "not connected";
    }
    get isConnected() {
        return this.#isConnected;
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
                this.sendWebSocketMessage({ type: "setName", data });
                break;
            case "setType":
                this.sendWebSocketMessage({ type: "setType", data });
                break;
            case "setSensorConfiguration":
                this.sendWebSocketMessage({ type: "setSensorConfiguration", data });
                break;
            case "triggerVibration":
                this.sendWebSocketMessage({ type: "triggerVibration", data });
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
                        const isConnectedToServer = Boolean(dataView.getUint8(byteOffset++));
                        this.isConnectedToServer = isConnectedToServer;
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

                if (this.#allDeviceInformationConnectionMessageTypes.includes(messageType)) {
                    this.#didReceiveConnectionMessage.set(messageType, true);
                    if (!this.#isConnected && this.#didReceiveAllDeviceInformationMessages) {
                        this.#isConnected = true;
                    }
                }
            },
            true
        );
    }

    /** @type {Map.<ConnectionMessageType, boolean>} */
    #didReceiveConnectionMessage = new Map();

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
    get #didReceiveAllDeviceInformationMessages() {
        return this.#allDeviceInformationConnectionMessageTypes.every((messageType) => {
            return this.#didReceiveConnectionMessage.get(messageType);
        });
    }

    #requestAllDeviceInformation() {
        this.#allDeviceInformationConnectionMessageTypes.forEach((messageType) => {
            this.#didReceiveConnectionMessage.set(messageType, false);
        });
        this.sendWebSocketMessage(...this.#allDeviceInformationConnectionMessageTypes);
    }
}

export default WebSocketClientConnectionManager;
