import { createConsole } from "../../utils/Console.js";
import { isInNode } from "../../utils/environment.js";
import { addListeners, removeListeners } from "../../utils/ListenerUtils.js";
import { addEventListeners, removeEventListeners } from "../../utils/EventDispatcher.js";
import { pingTimeout, pingMessage } from "../ServerUtils.js";

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
        if (!this.#isPingingClients) {
            this.#startPingingClients();
        }
        client.isAlive = true;
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
        _console.log(event.data);
        // FILL
    }
    /** @param {ws.CloseEvent} event */
    #onClientClose(event) {
        _console.log("client.close");
        removeEventListeners(event.target, this.#boundClientListeners);
    }
    /** @param {ws.ErrorEvent} event */
    #onClientError(event) {
        _console.log("client.error");
    }

    // PING
    /** @type {number?} */
    #pingIntervalId;
    get #isPingingClients() {
        return this.#pingIntervalId != null;
    }
    #startPingingClients() {
        _console.assertWithError(!this.#isPingingClients, "already pinging clients");
        _console.log("startPingingClients");
        this.#pingIntervalId = setInterval(this.#pingClients.bind(this), pingTimeout);
    }
    #stopPingingClients() {
        _console.assertWithError(this.#isPingingClients, "already not pinging clients");
        _console.log("stopPingingClients");
        clearInterval(this.#pingIntervalId);
        this.#pingIntervalId = null;
    }

    #pingClients() {
        _console.log("pingClients");
        if (!this.server || this.server.clients.size == 0) {
            this.#stopPingingClients();
            return;
        }
        _console.log("pingingClients...");
        this.server.clients.forEach((client) => {
            if (!client.isAlive) {
                client.terminate();
                return;
            }
            client.isAlive = false;
            this.#pingClient(client);
        });
    }

    /** @param {ws.WebSocket} client */
    #pingClient(client) {
        client.send(pingMessage);
    }
}

export default WebSocketServer;
