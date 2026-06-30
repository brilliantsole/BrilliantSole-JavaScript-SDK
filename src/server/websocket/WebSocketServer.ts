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

const _console = createConsole("WebSocketServer", { log: true });

/** NODE_START */
import type * as ws from "ws";
import { parseMessage } from "../../utils/ParseUtils.ts";
/** NODE_END */

export interface WebSocketServerClient extends ws.WebSocket, BaseServerClient {
  isAlive: boolean;
  pingClientTimer?: Timer;
  type: "webSocket";
}

export interface WebSocketServerClientContext extends BaseServerClientContext<WebSocketServerClient> {}

class WebSocketServer extends BaseServer<WebSocketServerClient> {
  static type = "webSocket" as const;
  readonly type = WebSocketServer.type;

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
    _console.log("parseWebSocketClientMessage", client, dataView);

    const clientContext: WebSocketServerClientContext = {
      responseMessages: [],
      client,
      localBroadcastMessages: [],
      broadcastMessages: [],
    };

    parseMessage(
      dataView,
      WebSocketMessageTypes,
      this.#onClientMessage.bind(this),
      clientContext,
      true,
    );

    clientContext.responseMessages =
      clientContext.responseMessages.filter(Boolean);
    clientContext.broadcastMessages =
      clientContext.broadcastMessages.filter(Boolean);
    clientContext.localBroadcastMessages =
      clientContext.localBroadcastMessages.filter(Boolean);

    const responseMessage = concatenateArrayBuffers(
      clientContext.responseMessages,
    );
    _console.log(`sending ${responseMessage.byteLength} bytes to client...`);
    this.#sendToClient(client, responseMessage);

    const localBroadcastMessage = concatenateArrayBuffers(
      clientContext.localBroadcastMessages,
    );

    _console.log(
      `locally broadcasting ${localBroadcastMessage.byteLength} bytes...`,
    );
    this.#broadcast(
      localBroadcastMessage,
      this.clients.filter((_client) => _client != client),
    );

    const broadcastMessage = concatenateArrayBuffers(
      clientContext.broadcastMessages,
    );
    _console.log(`broadcasting ${broadcastMessage.byteLength} bytes...`);
    // @ts-expect-error
    ServerManager.broadcast(broadcastMessage);
  }

  #onClientMessage(
    messageType: WebSocketMessageType,
    dataView: DataView<ArrayBuffer>,
    context: WebSocketServerClientContext,
  ) {
    const {
      responseMessages,
      client,
      broadcastMessages,
      localBroadcastMessages,
    } = context;

    _console.log("onClientMessage", { messageType });

    switch (messageType) {
      case "ping":
        responseMessages.push(webSocketPongMessage);
        break;
      case "pong":
        break;
      case "serverMessage":
        const _clientContext = this.parseClientMessage(client, dataView);
        if (_clientContext) {
          if (_clientContext.responseMessages.length > 0) {
            responseMessages.push(
              createWebSocketMessage({
                type: "serverMessage",
                data: concatenateArrayBuffers(_clientContext.responseMessages),
              }),
            );
          }
          if (_clientContext.broadcastMessages.length > 0) {
            broadcastMessages.push(
              createWebSocketMessage({
                type: "serverMessage",
                data: concatenateArrayBuffers(_clientContext.broadcastMessages),
              }),
            );
          }
          if (_clientContext.localBroadcastMessages.length > 0) {
            localBroadcastMessages.push(
              createWebSocketMessage({
                type: "serverMessage",
                data: concatenateArrayBuffers(
                  _clientContext.localBroadcastMessages,
                ),
              }),
            );
          }
        }
        break;
      default:
        _console.error(`uncaught messageType "${messageType}"`);
        break;
    }
  }

  // CLIENT MESSAGING
  #broadcast(
    message: ArrayBuffer,
    clients: WebSocketServerClient[] = this.clients,
  ) {
    if (message.byteLength == 0) {
      return;
    }
    clients.forEach((client) => {
      this.#sendToClient(client, message);
    });
  }
  #sendToClient(client: WebSocketServerClient, message: ArrayBuffer) {
    if (message.byteLength == 0) {
      _console.log("nothing to send back");
      return;
    }

    _console.log(`sending ${message.byteLength} bytes to client`);

    try {
      client.send(message);
    } catch (error) {
      _console.log("error sending message", error);
    }
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

import { default as ServerManager } from "../ServerManager.ts";
