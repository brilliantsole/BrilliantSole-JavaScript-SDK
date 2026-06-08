import { createConsole } from "../../utils/Console.ts";
import {
  addEventListeners,
  removeEventListeners,
} from "../../utils/EventUtils.ts";
import {
  concatenateArrayBuffers,
  dataToArrayBuffer,
} from "../../utils/ArrayBufferUtils.ts";
import { Timer } from "../../utils/Timer.ts";
import BaseServer, {
  BaseServerClient,
  BaseServerClientContext,
} from "../BaseServer.ts";
import {
  webSocketPingMessage,
  webSocketPongMessage,
  WebSocketMessageType,
  WebSocketMessageTypes,
  webSocketPingTimeout,
  createWebSocketMessage,
} from "./WebSocketUtils.ts";

const _console = createConsole("WebSocketServer", { log: false });

/** NODE_START */
import type * as ws from "ws";
import { parseMessage } from "../../utils/ParseUtils.ts";
/** NODE_END */

interface WebSocketServerClient extends ws.WebSocket, BaseServerClient {
  isAlive: boolean;
  pingClientTimer?: Timer;
}

export interface WebSocketServerClientContext extends BaseServerClientContext<WebSocketServerClient> {}

class WebSocketServer extends BaseServer<WebSocketServerClient> {
  // WEBSOCKET SERVER

  #server?: ws.WebSocketServer;
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
  #onWebSocketServerConnection(client: WebSocketServerClient) {
    _console.log("server.connection");
    client.isAlive = true;
    client.pingClientTimer = new Timer(
      () => this.#pingClient(client),
      webSocketPingTimeout,
    );
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
    const client = event.target as WebSocketServerClient;
    client.isAlive = true;
    client.pingClientTimer!.restart();
    const dataView = new DataView(
      dataToArrayBuffer(event.data as Buffer),
    ) as DataView<ArrayBuffer>;
    _console.log(`received ${dataView.byteLength} bytes`, dataView.buffer);
    this.#parseWebSocketClientMessage(client, dataView);
  }
  #onWebSocketClientClose(event: ws.CloseEvent) {
    _console.log("client.close");
    const client = event.target as WebSocketServerClient;
    client.pingClientTimer!.stop();
    removeEventListeners(client, this.#boundWebSocketClientListeners);
    this.dispatchEvent("clientDisconnected", { client });
  }
  #onWebSocketClientError(event: ws.ErrorEvent) {
    _console.error("client.error", event.message);
  }

  // PARSING
  #parseWebSocketClientMessage(
    client: WebSocketServerClient,
    dataView: DataView<ArrayBuffer>,
  ) {
    let responseMessages: ArrayBuffer[] = [];

    const context: WebSocketServerClientContext = { responseMessages, client };

    parseMessage(
      dataView,
      WebSocketMessageTypes,
      this.#onClientMessage.bind(this),
      context,
      true,
    );

    responseMessages = responseMessages.filter(Boolean);

    const responseMessage = concatenateArrayBuffers(responseMessages);
    _console.log(`sending ${responseMessage.byteLength} bytes to client...`);
    try {
      this.#sendToClient(client, responseMessage);
    } catch (error) {
      _console.log("error sending message", error);
    }
  }

  #onClientMessage(
    messageType: WebSocketMessageType,
    dataView: DataView<ArrayBuffer>,
    context: WebSocketServerClientContext,
  ) {
    const { responseMessages, client } = context;

    _console.log("onClientMessage", { messageType });

    switch (messageType) {
      case "ping":
        responseMessages.push(webSocketPongMessage);
        break;
      case "pong":
        break;
      case "serverMessage":
        const responseMessage = this.parseClientMessage(client, dataView);
        if (responseMessage) {
          responseMessages.push(
            createWebSocketMessage({
              type: "serverMessage",
              data: responseMessage,
            }),
          );
        }
        break;
      default:
        _console.error(`uncaught messageType "${messageType}"`);
        break;
    }
  }

  // CLIENT MESSAGING
  #sendToClient(client: WebSocketServerClient, message: ArrayBuffer) {
    if (message.byteLength == 0) {
      _console.log("nothing to send back");
      return;
    }

    _console.log(`sending ${message.byteLength} bytes to client`);

    client.send(message);
  }
  protected sendToClient(client: WebSocketServerClient, message: ArrayBuffer) {
    this.#sendToClient(
      client,
      createWebSocketMessage({ type: "serverMessage", data: message }),
    );
  }

  // PING
  #pingClient(client: WebSocketServerClient) {
    if (!client.isAlive) {
      client.terminate();
      return;
    }
    client.isAlive = false;
    this.#sendToClient(client, webSocketPingMessage);
  }
}

export default WebSocketServer;
