import { createConsole } from "../../utils/Console.js";
import { isInBrowser } from "../../utils/environment.js";
import ConnectionManager from "../ConnectionManager.js";
import Device from "../../Device.js";

const _console = createConsole("WebSocketClientConnectionManager", { log: true });

/** @typedef {import("../ConnectionManager.js").ConnectionMessageType} ConnectionMessageType */

/** @typedef {import("../../server/websocket/WebSocketClient.js").WebSocketClient} WebSocketClient */
/** @typedef {import("../../Device.js").DeviceEventType} DeviceEventType */

/**
 * @callback SendWebSocketMessageCallback
 * @param {ConnectionMessageType} messageType
 * @param {DataView|ArrayBuffer} data
 */

class WebSocketClientConnectionManager extends ConnectionManager {
    static get isSupported() {
        return isInBrowser;
    }
    /** @type {import("../ConnectionManager.js").ConnectionType} */
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
                // FILL
                break;
            case "setType":
                // FILL
                break;
            case "setSensorConfiguration":
                // FILL
                break;
            case "triggerVibration":
                // FILL
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

    // WebSocket Client

    // /** @type {WebSocketClient?} */
    // #webSocketClient;
    // get webSocketClient() {
    //     return this.#webSocketClient;
    // }
    // set webSocketClient(newWebSocketClient) {
    //     _console.assertTypeWithError(newWebSocketClient, "object");
    //     if (this.webSocketClient == newWebSocketClient) {
    //         _console.log("redundant webSocketClient assignment");
    //         return;
    //     }
    //     _console.log({ newWebSocketClient });
    //     this.#webSocketClient = newWebSocketClient;
    // }

    // #assertWebSocketClient() {
    //     _console.assertWithError(this.#webSocketClient, "webSocketClient not defined");
    // }

    /** @type {SendWebSocketMessageCallback?} */
    sendWebSocketMessage;
    /** @type {function?} */
    sendWebSocketConnectMessage;
    /** @type {function?} */
    sendWebSocketDisconnectMessage;
    /** @param {DataView} dataView */
    onWebSocketMessage(dataView) {
        _console.log({ dataView });

        let byteOffset = 0;

        while (byteOffset < dataView.byteLength) {
            const messageTypeEnum = dataView.getUint8(byteOffset++);
            /** @type {DeviceEventType} */
            const messageType = Device.EventTypes[messageTypeEnum];
            const messageByteLength = dataView.getUint8(byteOffset++);

            _console.log({ messageTypeEnum, messageType, messageByteLength });
            _console.assertEnumWithError(messageType, Device.EventTypes);

            let _byteOffset = byteOffset;

            // FILL
            switch (messageType) {
                case "isConnected":
                    const isConnected = dataView.getUint8(_byteOffset++);
                    this.#isConnected = isConnected;
                    this.status = isConnected ? "connected" : "not connected";
                    break;
                default:
                    _console.error(`uncaught messageType "${messageType}"`);
                    break;
            }
            byteOffset += messageByteLength;
        }
    }
}

export default WebSocketClientConnectionManager;
