import { createConsole } from "../../utils/Console";
import { addEventListeners, removeEventListeners } from "../../utils/EventUtils";
import { pingTimeout, pingMessage } from "../ServerUtils";
import { dataToArrayBuffer } from "../../utils/ArrayBufferUtils";
import Timer from "../../utils/Timer";
import BaseServer from "../BaseServer";

const _console = createConsole("WebSocketServer", { log: true });

// NODE_START
import * as ws from "ws";
// NODE_END

/** @typedef {import("../BaseServer").ServerEventType} ServerEventType */

/** @typedef {import("../BaseServer").ClientConnectedEvent} ClientConnectedEvent */
/**
 * @typedef {Object} BaseWebSocketClientConnectedEvent
 * @property {{client: ws.WebSocket}} message
 */
/** @typedef {ClientConnectedEvent & BaseWebSocketClientConnectedEvent} WebSocketClientConnectedEvent */

/** @typedef {import("../BaseServer").ClientDisconnectedEvent} ClientDisconnectedEvent */
/**
 * @typedef {Object} BaseWebSocketClientDisconnectedEvent
 * @property {{client: ws.WebSocket}} message
 */
/** @typedef {ClientDisconnectedEvent & BaseWebSocketClientDisconnectedEvent} WebSocketClientDisconnectedEvent */

/** @typedef {WebSocketClientConnectedEvent | WebSocketClientDisconnectedEvent} WebSocketServerEvent */
/** @typedef {(event: WebSocketServerEvent) => void} WebSocketServerEventListener */

class WebSocketServer extends BaseServer {
  addEventListener(type: ServerEventType, listener: WebSocketServerEventListener, options: EventDispatcherOptions) {
    super.addEventListener(type, listener, options);
  }

  protected dispatchEvent(event: WebSocketServerEvent) {
    super.dispatchEvent(event);
  }

  get numberOfClients() {
    return this.#server?.clients.size || 0;
  }

  // WEBSOCKET SERVER

  #server?: ws.WebSocketServer;
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
  #onServerConnection(client: ws.WebSocket) {
    _console.log("server.connection");
    client.isAlive = true;
    client.pingClientTimer = new Timer(() => this.#pingClient(client), pingTimeout);
    client.pingClientTimer.start();
    addEventListeners(client, this.#boundClientListeners);
    this.dispatchEvent({ type: "clientConnected", message: { client } });
  }
  #onServerError(error: Error) {
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
  #onClientOpen(event: ws.Event) {
    _console.log("client.open");
  }
  #onClientMessage(event: ws.MessageEvent) {
    _console.log("client.message");
    const client = event.target;
    client.isAlive = true;
    client.pingClientTimer.restart();
    const dataView = new DataView(dataToArrayBuffer(event.data));
    this.#parseClientMessage(client, dataView);
  }
  #onClientClose(event: ws.CloseEvent) {
    _console.log("client.close");
    const client = event.target;
    client.pingClientTimer.stop();
    removeEventListeners(client, this.#boundClientListeners);
    this.dispatchEvent({ type: "clientDisconnected", message: { client } });
  }
  #onClientError(event: ws.ErrorEvent) {
    _console.log("client.error");
  }

  // PARSING

  #parseClientMessage(client: ws.WebSocket, dataView: DataView) {
    const responseMessage = this.parseClientMessage(dataView);
    if (responseMessage) {
      client.send(responseMessage);
    }
  }

  // CLIENT MESSAGING
  broadcastMessage(message: ArrayBuffer) {
    super.broadcastMessage(message);
    this.server.clients.forEach((client) => {
      client.send(message);
    });
  }

  // PING
  #pingClient(client: ws.WebSocket) {
    if (!client.isAlive) {
      client.terminate();
      return;
    }
    client.isAlive = false;
    client.send(pingMessage);
  }
}

export default WebSocketServer;
