import { createConsole } from "../../utils/Console.js";
import { isInNode } from "../../utils/environment.js";
import { addListeners, removeListeners } from "../../utils/ListenerUtils.js";
import { addEventListeners, removeEventListeners } from "../../utils/EventDispatcher.js";
import { pingTimeout, pingMessage, MessageTypes, pongMessage } from "../ServerUtils.js";
import { dataToArrayBuffer } from "../../utils/ArrayBufferUtils.js";
import IntervalManager from "../../utils/IntervalManager.js";

const _console = createConsole("WebSocketServer", { log: true });

if (isInNode) {
    var ws = require("ws");
}

class WebSocketServer {
    /** @type {ws.WebSocketServer?} */
    #server;
    get server() {
        return this.#server;
    }
    set server(newServer) {
        if (this.#server == newServer) {
            _console.warn("redundant WebSocket assignment");
            return;
        }
        _console.log("assigning server...");

        if (this.#server) {
            _console.log("clearing existing server...");
            removeListeners(this.#server, this.#boundServerListeners);
        }

        addListeners(newServer, this.#boundServerListeners);
        this.#server = newServer;

        _console.log("assigned server");
    }

    // SERVER LISTENERS
    #boundServerListeners = {
        close: this.#onServerClose.bind(this),
        connection: this.#onServerConnection.bind(this),
        error: this.#onServerError.bind(this),
        headers: this.#onServerHeaders.bind(this),
        listening: this.#onServerListening.bind(this),
    };

    #onServerClose() {
        _console.log("server.close");
    }
    /** @param {ws.WebSocket} client */
    #onServerConnection(client) {
        _console.log("server.connection");
        client.isAlive = true;
        client.pingClientIntervalManager = new IntervalManager(() => this.#pingClient(client), pingTimeout);
        client.pingClientIntervalManager.start();
        addEventListeners(client, this.#boundClientListeners);
    }
    /** @param {Error} error */
    #onServerError(error) {
        _console.error(error);
    }
    #onServerHeaders() {
        //_console.log("server.headers");
    }
    #onServerListening() {
        _console.log("server.listening");
    }

    // CLIENT LISTENERS
    #boundClientListeners = {
        open: this.#onClientOpen.bind(this),
        message: this.#onClientMessage.bind(this),
        close: this.#onClientClose.bind(this),
        error: this.#onClientError.bind(this),
    };
    /** @param {ws.Event} event */
    #onClientOpen(event) {
        _console.log("client.open");
    }
    /** @param {ws.MessageEvent} event */
    #onClientMessage(event) {
        _console.log("client.message");
        const client = event.target;
        client.isAlive = true;
        client.pingClientIntervalManager.restart();
        const dataView = new DataView(dataToArrayBuffer(event.data));
        this.#parseClientMessage(client, dataView);
    }
    /** @param {ws.CloseEvent} event */
    #onClientClose(event) {
        _console.log("client.close");
        const client = event.target;
        client.pingClientIntervalManager.stop();
        removeEventListeners(client, this.#boundClientListeners);
    }
    /** @param {ws.ErrorEvent} event */
    #onClientError(event) {
        _console.log("client.error");
    }

    /**
     * @param {ws.WebSocket} client
     * @param {DataView} dataView
     */
    #parseClientMessage(client, dataView) {
        let byteOffset = 0;
        while (byteOffset < dataView.byteLength) {
            const messageTypeEnum = dataView.getUint8(byteOffset++);
            const messageType = MessageTypes[messageTypeEnum];

            _console.log({ messageTypeEnum, messageType });
            _console.assertWithError(messageType, `invalid messageTypeEnum ${messageTypeEnum}`);

            switch (messageType) {
                case "ping":
                    client.send(pongMessage);
                    break;
                case "pong":
                    break;
                default:
                    _console.error(`uncaught messageType "${messageType}"`);
                    break;
            }
        }
    }

    // PING
    /** @param {ws.WebSocket} client */
    #pingClient(client) {
        if (!client.isAlive) {
            client.terminate();
            return;
        }
        client.isAlive = false;
        client.send(pingMessage);
    }
}

export default WebSocketServer;
