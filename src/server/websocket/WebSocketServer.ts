import { createConsole } from "../../utils/Console.ts";
import { addEventListeners, removeEventListeners } from "../../utils/EventUtils.ts";
import { concatenateArrayBuffers, dataToArrayBuffer } from "../../utils/ArrayBufferUtils.ts";
import Timer from "../../utils/Timer.ts";
import BaseServer from "../BaseServer.ts";
import {
  webSocketPingMessage,
  webSocketPongMessage,
  WebSocketMessageType,
  WebSocketMessageTypes,
  webSocketPingTimeout,
  createWebSocketMessage,
} from "./WebSocketUtils.ts";

const _console = createConsole("WebSocketServer", { log: true });

/** NODE_START */
import type * as ws from "ws";
import { parseMessage } from "../../utils/ParseUtils.ts";
/** NODE_END */

interface WebSocketClient extends ws.WebSocket {
  isAlive: boolean;
  pingClientTimer?: Timer;
}
interface WebSocketServer extends ws.WebSocketServer {}

class WebSocketServer extends BaseServer {
  get numberOfClients() {
    return this.#server?.clients.size || 0;
  }

  // WEBSOCKET SERVER

  #server?: WebSocketServer;
  get server() {
    return this.#server;
  }
  set server(newServer) {
    if (this.#server == newServer) {
      _console.log("redundant WebSocket server assignment");
      return;
    }
    _console.log("assigning WebSocket server...");

    if (this.#server) {
      _console.log("clearing existing WebSocket server...");
      removeEventListeners(this.#server, this.#boundWebSocketServerListeners);
    }

    addEventListeners(newServer, this.#boundWebSocketServerListeners);
    this.#server = newServer;

    _console.log("assigned WebSocket server");
  }

  // WEBSOCKET SERVER LISTENERS

  #boundWebSocketServerListeners = {
    close: this.#onWebSocketServerClose.bind(this),
    connection: this.#onWebSocketServerConnection.bind(this),
    error: this.#onWebSocketServerError.bind(this),
    headers: this.#onWebSocketServerHeaders.bind(this),
    listening: this.#onWebSocketServerListening.bind(this),
  };

  #onWebSocketServerClose() {
    _console.log("server.close");
  }
  #onWebSocketServerConnection(client: WebSocketClient) {
    _console.log("server.connection");
    client.isAlive = true;
    client.pingClientTimer = new Timer(() => this.#pingClient(client), webSocketPingTimeout);
    client.pingClientTimer.start();
    addEventListeners(client, this.#boundWebSocketClientListeners);
    this.dispatchEvent("clientConnected", { client });
  }
  #onWebSocketServerError(error: Error) {
    _console.error(error);
  }
  #onWebSocketServerHeaders() {
    //_console.log("server.headers");
  }
  #onWebSocketServerListening() {
    _console.log("server.listening");
  }

  // WEBSOCKET CLIENT LISTENERS

  #boundWebSocketClientListeners: { [eventType: string]: Function } = {
    open: this.#onWebSocketClientOpen.bind(this),
    message: this.#onWebSocketClientMessage.bind(this),
    close: this.#onWebSocketClientClose.bind(this),
    error: this.#onWebSocketClientError.bind(this),
  };
  #onWebSocketClientOpen(event: ws.Event) {
    _console.log("client.open");
  }
  #onWebSocketClientMessage(event: ws.MessageEvent) {
    _console.log("client.message");
    const client = event.target as WebSocketClient;
    client.isAlive = true;
    client.pingClientTimer!.restart();
    const dataView = new DataView(dataToArrayBuffer(event.data as Buffer));
    _console.log(`received ${dataView.byteLength} bytes`, dataView.buffer);
    this.#parseWebSocketClientMessage(client, dataView);
  }
  #onWebSocketClientClose(event: ws.CloseEvent) {
    _console.log("client.close");
    const client = event.target as WebSocketClient;
    client.pingClientTimer!.stop();
    removeEventListeners(client, this.#boundWebSocketClientListeners);
    this.dispatchEvent("clientDisconnected", { client });
  }
  #onWebSocketClientError(event: ws.ErrorEvent) {
    _console.error("client.error", event.message);
  }

  // PARSING
  #parseWebSocketClientMessage(client: WebSocketClient, dataView: DataView) {
    let responseMessages: ArrayBuffer[] = [];

    parseMessage(dataView, WebSocketMessageTypes, this.#onClientMessage.bind(this), { responseMessages }, true);

    responseMessages = responseMessages.filter(Boolean);

    if (responseMessages.length == 0) {
      _console.log("nothing to send back");
      return;
    }

    const responseMessage = concatenateArrayBuffers(responseMessages);
    client.send(responseMessage);
  }

  #onClientMessage(
    messageType: WebSocketMessageType,
    dataView: DataView,
    context: { responseMessages: (ArrayBuffer | undefined)[] }
  ) {
    const { responseMessages } = context;
    switch (messageType) {
      case "ping":
        responseMessages.push(webSocketPongMessage);
        break;
      case "pong":
        break;
      case "serverMessage":
        const responseMessage = this.parseClientMessage(dataView);
        if (responseMessage) {
          responseMessages.push(createWebSocketMessage({ type: "serverMessage", data: responseMessage }));
        }
        break;
      default:
        _console.error(`uncaught messageType "${messageType}"`);
        break;
    }
  }

  // CLIENT MESSAGING
  broadcastMessage(message: ArrayBuffer) {
    super.broadcastMessage(message);
    this.server!.clients.forEach((client) => {
      client.send(createWebSocketMessage({ type: "serverMessage", data: message }));
    });
  }

  // PING
  #pingClient(client: WebSocketClient) {
    if (!client.isAlive) {
      client.terminate();
      return;
    }
    client.isAlive = false;
    client.send(webSocketPingMessage);
  }
}

export default WebSocketServer;
