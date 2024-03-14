import { createConsole } from "../../utils/Console.js";
import { MessageTypes, getMessageTypeEnum, pingMessage, pongMessage } from "../ServerUtils.js";
import { addEventListeners, removeEventListeners } from "../../utils/EventDispatcher.js";

const _console = createConsole("WebSocketClient", { log: true });

class WebSocketClient {
    /** @param {string | URL} url */
    constructor(url = `wss://${location.host}`) {
        this.webSocket = new WebSocket(url);
    }

    /** @type {WebSocket} */
    #webSocket;
    get webSocket() {
        return this.#webSocket;
    }
    set webSocket(newWebSocket) {
        if (this.#webSocket == newWebSocket) {
            _console.warn("redundant webSocket assignment");
            return;
        }

        _console.log("assigning webSocket", newWebSocket);

        if (this.#webSocket) {
            removeEventListeners(this.#webSocket, this.#boundWebSocketEventListeners);
        }

        addEventListeners(newWebSocket, this.#boundWebSocketEventListeners);
        this.#webSocket = newWebSocket;

        _console.log("assigned webSocket");
    }

    get isConnected() {
        return this.webSocket?.readyState == WebSocket.OPEN;
    }
    #assertConnection() {
        _console.assertWithError(this.isConnected, "not connected");
    }

    #boundWebSocketEventListeners = {
        close: this.#onWebSocketClose.bind(this),
        error: this.#onWebSocketError.bind(this),
        message: this.#onWebSocketMessage.bind(this),
        open: this.#onWebSocketOpen.bind(this),
        ping: this.#onWebSocketPing.bind(this),
    };

    /** @param {import("ws").CloseEvent} event  */
    #onWebSocketClose(event) {
        _console.log("webSocket.close", event);
    }
    /** @param {Event} event */
    #onWebSocketError(event) {
        _console.log("webSocket.error", event);
    }
    /** @param {import("ws").MessageEvent} event */
    async #onWebSocketMessage(event) {
        _console.log("webSocket.message", event);
        const arrayBuffer = await event.data.arrayBuffer();
        const dataView = new DataView(arrayBuffer);
        this.#parseMessage(dataView);
    }
    /** @param {Event} event */
    #onWebSocketOpen(event) {
        _console.log("webSocket.open", event);
    }
    /** @param {Event} event */
    #onWebSocketPing(event) {
        _console.log("webSocket.ping", event);
    }

    /** @param {DataView} dataView */
    #parseMessage(dataView) {
        _console.log({ dataView });
        let byteOffset = 0;
        while (byteOffset < dataView.byteLength) {
            const messageTypeEnum = dataView.getUint8(byteOffset++);
            const messageType = MessageTypes[messageTypeEnum];

            _console.log({ messageTypeEnum, messageType });
            _console.assertWithError(messageType, `invalid messageTypeEnum ${messageTypeEnum}`);

            switch (messageType) {
                case "ping":
                    this.#ping();
                    break;
                default:
                    _console.error(`uncaught messageType "${messageType}"`);
                    break;
            }
        }
    }

    #ping() {
        this.#assertConnection();
        this.webSocket.send(pingMessage);
    }
    #pong() {
        this.#assertConnection();
        this.webSocket.send(pongMessage);
    }
}

export default WebSocketClient;
