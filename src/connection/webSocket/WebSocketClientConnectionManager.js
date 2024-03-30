import { createConsole } from "../../utils/Console.js";
import { isInBrowser } from "../../utils/environment.js";
import ConnectionManager from "../ConnectionManager.js";
import Device from "../../Device.js";
import { parseStringFromDataView } from "../../utils/ArrayBufferUtils.js";

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
        // TEST
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

        let byteOffset = 0;

        while (byteOffset < dataView.byteLength) {
            const messageTypeEnum = dataView.getUint8(byteOffset++);
            /** @type {DeviceEventType} */
            const messageType = Device.EventTypes[messageTypeEnum];
            const messageByteLength = dataView.getUint16(byteOffset, true);
            byteOffset += 2;

            _console.log({ messageTypeEnum, messageType, messageByteLength });
            _console.assertEnumWithError(messageType, Device.EventTypes);

            let _byteOffset = byteOffset;

            switch (messageType) {
                case "isConnected":
                    const isConnected = dataView.getUint8(_byteOffset++);
                    this.#isConnected = isConnected;
                    this.status = isConnected ? "connected" : "not connected";
                    if (this.isConnected) {
                        this.#requestAllDeviceInformation();
                    }
                    break;
                case "deviceInformation":
                    const _dataView = new DataView(dataView.buffer, _byteOffset + dataView.byteOffset);
                    this.onMessageReceived("deviceInformation", _dataView);
                    break;
                case "batteryLevel":
                    // FILL
                    break;
                case "getName":
                    // FILL
                    break;
                case "getType":
                    // FILL
                    break;
                case "getSensorConfiguration":
                    // FILL
                    break;
                default:
                    _console.error(`uncaught messageType "${messageType}"`);
                    break;
            }
            byteOffset += messageByteLength;
        }
    }

    #requestAllDeviceInformation() {
        this.sendWebSocketMessage("deviceInformation", "batteryLevel", "getName", "getType", "getSensorConfiguration");
    }
}

export default WebSocketClientConnectionManager;
