import { createConsole } from "../../utils/Console.ts";
import {
  createServerMessage,
  MessageLike,
  ServerMessage,
} from "../ServerUtils.ts";
import {
  addEventListeners,
  removeEventListeners,
} from "../../utils/EventUtils.ts";
import ClientConnectionManager from "../../connection/ClientConnectionManager.ts";
import BaseClient, { ServerURL } from "../BaseClient.ts";
import type * as ws from "ws";
import Timer from "../../utils/Timer.ts";
import {
  createWebSocketMessage,
  WebSocketMessageType,
  WebSocketMessageTypes,
  webSocketPingTimeout,
  webSocketReconnectTimeout,
  WebSocketMessage,
} from "./WebSocketUtils.ts";
import { parseMessage } from "../../utils/ParseUtils.ts";

const _console = createConsole("WebSocketClient", { log: false });

class WebSocketClient extends BaseClient {
  // WEBSOCKET
  #webSocket?: WebSocket;
  get webSocket() {
    return this.#webSocket;
  }
  set webSocket(newWebSocket) {
    if (this.#webSocket == newWebSocket) {
      _console.log("redundant webSocket assignment");
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
  get readyState() {
    return this.webSocket?.readyState;
  }
  get isConnected() {
    return this.readyState == WebSocket.OPEN;
  }
  get isDisconnected() {
    return this.readyState == WebSocket.CLOSED;
  }

  connect(url: string | URL = `wss://${location.host}`) {
    if (this.webSocket) {
      this.assertDisconnection();
    }
    this._connectionStatus = "connecting";
    this.webSocket = new WebSocket(url);
  }

  disconnect() {
    this.assertConnection();
    if (this.reconnectOnDisconnection) {
      this.reconnectOnDisconnection = false;
      this.webSocket!.addEventListener(
        "close",
        () => {
          this.reconnectOnDisconnection = true;
        },
        { once: true }
      );
    }
    this._connectionStatus = "disconnecting";
    this.webSocket!.close();
  }

  reconnect() {
    this.assertDisconnection();
    this.connect(this.webSocket!.url);
  }

  toggleConnection(url?: ServerURL) {
    if (this.isConnected) {
      this.disconnect();
    } else if (url && this.webSocket?.url == url) {
      this.reconnect();
    } else {
      this.connect(url);
    }
  }

  // WEBSOCKET MESSAGING
  sendMessage(message: MessageLike) {
    this.assertConnection();
    this.#webSocket!.send(message);
    this.#pingTimer.restart();
  }

  sendServerMessage(...messages: ServerMessage[]) {
    this.sendMessage(
      createWebSocketMessage({
        type: "serverMessage",
        data: createServerMessage(...messages),
      })
    );
  }

  #sendWebSocketMessage(...messages: WebSocketMessage[]) {
    this.sendMessage(createWebSocketMessage(...messages));
  }

  // WEBSOCKET EVENTS
  #boundWebSocketEventListeners: { [eventType: string]: Function } = {
    open: this.#onWebSocketOpen.bind(this),
    message: this.#onWebSocketMessage.bind(this),
    close: this.#onWebSocketClose.bind(this),
    error: this.#onWebSocketError.bind(this),
  };

  #onWebSocketOpen(event: ws.Event) {
    _console.log("webSocket.open", event);
    this.#pingTimer.start();
    //this._connectionStatus = "connected";
    this._sendRequiredMessages();
  }
  async #onWebSocketMessage(event: ws.MessageEvent) {
    _console.log("webSocket.message", event);
    //this.#pingTimer.restart();
    //@ts-expect-error
    const arrayBuffer = await event.data.arrayBuffer();
    const dataView = new DataView(arrayBuffer);
    this.#parseWebSocketMessage(dataView);
  }
  #onWebSocketClose(event: ws.CloseEvent) {
    _console.log("webSocket.close", event);

    this._connectionStatus = "notConnected";

    Object.entries(this.devices).forEach(([id, device]) => {
      const connectionManager =
        device.connectionManager! as ClientConnectionManager;
      connectionManager.isConnected = false;
    });

    this.#pingTimer.stop();
    if (this.reconnectOnDisconnection) {
      setTimeout(() => {
        this.reconnect();
      }, webSocketReconnectTimeout);
    }
  }
  #onWebSocketError(event: ws.ErrorEvent) {
    _console.error("webSocket.error", event);
  }

  // PARSING
  #parseWebSocketMessage(dataView: DataView) {
    parseMessage(
      dataView,
      WebSocketMessageTypes,
      this.#onServerMessage.bind(this),
      null,
      true
    );
  }

  #onServerMessage(messageType: WebSocketMessageType, dataView: DataView) {
    switch (messageType) {
      case "ping":
        this.#pong();
        break;
      case "pong":
        break;
      case "serverMessage":
        this.parseMessage(dataView);
        break;
      default:
        _console.error(`uncaught messageType "${messageType}"`);
        break;
    }
  }

  // PING
  #pingTimer = new Timer(this.#ping.bind(this), webSocketPingTimeout);
  #ping() {
    this.#sendWebSocketMessage("ping");
  }
  #pong() {
    this.#sendWebSocketMessage("pong");
  }
}

export default WebSocketClient;
