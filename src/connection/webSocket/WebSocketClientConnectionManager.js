import { createConsole } from "../../utils/Console.js";
import { isInBrowser } from "../../utils/environment.js";
import { addEventListeners, removeEventListeners } from "../../utils/EventDispatcher.js";
import ConnectionManager from "../ConnectionManager.js";

const _console = createConsole("WebSocketClientConnectionManager", { log: true });

/** @typedef {import("../ConnectionManager.js").ConnectionMessageType} ConnectionMessageType */

class WebSocketClientConnectionManager extends ConnectionManager {
    static get isSupported() {
        return isInBrowser;
    }
    /** @type {import("../ConnectionManager.js").ConnectionType} */
    static get type() {
        return "webSocketClient";
    }

    get isConnected() {
        // FILL
        return false;
    }

    async connect() {
        await super.connect();
        // FILL
    }
    async disconnect() {
        await super.disconnect();
        _console.log("disconnecting from device...");
        // FILL
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
        // FILL
        return false;
    }
    async reconnect() {
        await super.reconnect();
        _console.log("attempting to reconnect...");
        // FILL
    }
}

export default WebSocketClientConnectionManager;
