import { createConsole } from "../../utils/Console.js";
import { addEventListeners, removeEventListeners } from "../../utils/EventDispatcher.js";
import { pingTimeout, pingMessage } from "../ServerUtils.js";
import { dataToArrayBuffer } from "../../utils/ArrayBufferUtils.js";
import Timer from "../../utils/Timer.js";
import BaseServer from "../BaseServer.js";

const _console = createConsole("WebSocketServer", { log: true });

// NODE_START
import ws from "ws";
// NODE_END

/** @typedef {import("../BaseServer.js").ServerEventType} ServerEventType */

/** @typedef {import("../BaseServer.js").ClientConnectedEvent} ClientConnectedEvent */
/**
 * @typedef {Object} BaseWebSocketClientConnectedEvent
 * @property {{client: ws.WebSocket}} message
 */
/** @typedef {ClientConnectedEvent & BaseWebSocketClientConnectedEvent} WebSocketClientConnectedEvent */

/** @typedef {import("../BaseServer.js").ClientDisconnectedEvent} ClientDisconnectedEvent */
/**
 * @typedef {Object} BaseWebSocketClientDisconnectedEvent
 * @property {{client: ws.WebSocket}} message
 */
/** @typedef {ClientDisconnectedEvent & BaseWebSocketClientDisconnectedEvent} WebSocketClientDisconnectedEvent */

/** @typedef {WebSocketClientConnectedEvent | WebSocketClientDisconnectedEvent} WebSocketServerEvent */
/** @typedef {(event: WebSocketServerEvent) => void} WebSocketServerEventListener */

class WebSocketServer extends BaseServer {
  /**
   * @param {ServerEventType} type
   * @param {WebSocketServerEventListener} listener
   * @param {EventDispatcherOptions} [options]
   */
  addEventListener(type, listener, options) {
    super.addEventListener(type, listener, options);
  }

  /**
   * @protected
   * @param {WebSocketServerEvent} event
   */
  dispatchEvent(event) {
    super.dispatchEvent(event);
  }

  get numberOfClients() {
    return this.#server?.clients.size || 0;
  }

  // WEBSOCKET SERVER

  /** @type {ws.WebSocketServer?} */
  #server;
  get server() {
    return this.#server;
  }
  set server(newServer) {
    if (this.#server == newServer) {
      _console.log("redundant WebSocket assignment");
      return;
    }
    _console.log("assigning server...");

    if (this.#server) {
      _console.log("clearing existing server...");
      removeEventListeners(this.#server, this.#boundServerListeners);
    }

    addEventListeners(newServer, this.#boundServerListeners);
    this.#server = newServer;

    _console.log("assigned server");
  }

  // WEBSOCKET SERVER LISTENERS

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
    client.pingClientTimer = new Timer(() => this.#pingClient(client), pingTimeout);
    client.pingClientTimer.start();
    addEventListeners(client, this.#boundClientListeners);
    this.dispatchEvent({ type: "clientConnected", message: { client } });
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

  // WEBSOCKET CLIENT LISTENERS

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
    client.pingClientTimer.restart();
    const dataView = new DataView(dataToArrayBuffer(event.data));
    this.#parseClientMessage(client, dataView);
  }
  /** @param {ws.CloseEvent} event */
  #onClientClose(event) {
    _console.log("client.close");
    const client = event.target;
    client.pingClientTimer.stop();
    removeEventListeners(client, this.#boundClientListeners);
    this.dispatchEvent({ type: "clientDisconnected", message: { client } });
  }
  /** @param {ws.ErrorEvent} event */
  #onClientError(event) {
    _console.log("client.error");
  }

  // PARSING

  /**
   * @param {ws.WebSocket} client
   * @param {DataView} dataView
   */
  #parseClientMessage(client, dataView) {
    const responseMessage = this.parseClientMessage(dataView);
    if (responseMessage) {
      client.send(responseMessage);
    }
  }

  // CLIENT MESSAGING

  /** @param {ArrayBuffer} message */
  broadcastMessage(message) {
    super.broadcastMessage(message);
    this.server.clients.forEach((client) => {
      client.send(message);
    });
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
