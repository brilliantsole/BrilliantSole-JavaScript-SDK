import { DeviceInformationTypes } from "../../DeviceInformationManager.ts";
import {
  createMessage,
  Message,
  MessageLike,
} from "../../server/ServerUtils.ts";
import { webSocketPingTimeout } from "../../server/websocket/WebSocketUtils.ts";
import { createConsole } from "../../utils/Console.ts";
import {
  addEventListeners,
  removeEventListeners,
} from "../../utils/EventUtils.ts";
import { parseMessage } from "../../utils/ParseUtils.ts";
import { Timer } from "../../utils/Timer.ts";
import BaseConnectionManager, {
  ConnectionType,
} from "../BaseConnectionManager.ts";
import type * as ws from "ws";

const _console = createConsole("WebSocketConnectionManager", { log: false });

const WebSocketMessageTypes = [
  "ping",
  "pong",
  "batteryLevel",
  "deviceInformation",
  "message",
] as const;
type WebSocketMessageType = (typeof WebSocketMessageTypes)[number];

type WebSocketMessage = WebSocketMessageType | Message<WebSocketMessageType>;
function createWebSocketMessage(...messages: WebSocketMessage[]) {
  _console.log("createWebSocketMessage", ...messages);
  return createMessage(WebSocketMessageTypes, ...messages);
}

const WebSocketDeviceInformationMessageTypes: WebSocketMessageType[] = [
  "deviceInformation",
  "batteryLevel",
];

class WebSocketConnectionManager extends BaseConnectionManager {
  #bluetoothId?: string;
  get bluetoothId() {
    return this.#bluetoothId ?? "";
  }

  defaultMtu = 2 ** 10;

  constructor(
    ipAddress: string,
    isSecure: boolean = false,
    bluetoothId?: string
  ) {
    super();
    this.ipAddress = ipAddress;
    this.isSecure = isSecure;
    this.mtu = this.defaultMtu;
    this.#bluetoothId = bluetoothId;
  }

  get isAvailable() {
    return true;
  }

  static get isSupported() {
    return true;
  }
  static get type(): ConnectionType {
    return "webSocket";
  }

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
      if (this.#webSocket.readyState == this.#webSocket.OPEN) {
        this.#webSocket.close();
      }
    }

    if (newWebSocket) {
      addEventListeners(newWebSocket, this.#boundWebSocketEventListeners);
    }
    this.#webSocket = newWebSocket;

    _console.log("assigned webSocket");
  }

  // IP ADDRESS
  #ipAddress!: string;
  get ipAddress() {
    return this.#ipAddress;
  }
  set ipAddress(newIpAddress) {
    this.assertIsNotConnected();
    if (this.#ipAddress == newIpAddress) {
      _console.log(`redundnant ipAddress assignment "${newIpAddress}"`);
      return;
    }
    this.#ipAddress = newIpAddress;
    _console.log(`updated ipAddress to "${this.ipAddress}"`);
  }

  // IS SECURE
  #isSecure = false;
  get isSecure() {
    return this.#isSecure;
  }
  set isSecure(newIsSecure) {
    this.assertIsNotConnected();
    if (this.#isSecure == newIsSecure) {
      _console.log(`redundant isSecure assignment ${newIsSecure}`);
      return;
    }
    this.#isSecure = newIsSecure;
    _console.log(`updated isSecure to "${this.isSecure}"`);
  }

  // URL
  get url() {
    return `${this.isSecure ? "wss" : "ws"}://${this.ipAddress}/ws`;
  }

  // CONNECTION
  async connect() {
    const canContinue = await super.connect();
    if (!canContinue) {
      return false;
    }
    try {
      this.webSocket = new WebSocket(this.url);
      return true;
    } catch (error) {
      _console.error("error connecting to webSocket", error);
      this.status = "notConnected";
      return false;
    }
  }
  async disconnect() {
    const canContinue = await super.disconnect();
    if (!canContinue) {
      return false;
    }
    _console.log("closing websocket");
    this.#pingTimer.stop();
    this.#webSocket?.close();
    return true;
  }

  get canReconnect() {
    return Boolean(this.webSocket);
  }
  async reconnect() {
    const canContinue = await super.reconnect();
    if (!canContinue) {
      return false;
    }
    this.webSocket = new WebSocket(this.url);
    return true;
  }

  // BASE CONNECTION MANAGER
  async sendSmpMessage(data: ArrayBuffer) {
    super.sendSmpMessage(data);
    _console.error("smp not supported on webSockets");
  }

  async sendTxData(data: ArrayBuffer) {
    await super.sendTxData(data);
    if (data.byteLength == 0) {
      return;
    }
    this.#sendWebSocketMessage({ type: "message", data });
  }

  // WEBSOCKET MESSAGING
  #sendMessage(message: MessageLike) {
    this.assertIsConnected();
    _console.log("sending webSocket message", message);
    this.#webSocket!.send(message);
    this.#pingTimer.restart();
  }

  #sendWebSocketMessage(...messages: WebSocketMessage[]) {
    this.#sendMessage(createWebSocketMessage(...messages));
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
    this.status = "connected";
    this.#requestDeviceInformation();
  }
  async #onWebSocketMessage(event: ws.MessageEvent) {
    // this.#pingTimer.restart();
    //@ts-expect-error
    const arrayBuffer = await event.data.arrayBuffer();
    const dataView = new DataView(arrayBuffer);
    _console.log(`webSocket.message (${dataView.byteLength} bytes)`);
    this.#parseWebSocketMessage(dataView);
  }
  #onWebSocketClose(event: ws.CloseEvent) {
    _console.log("webSocket.close", event);
    this.status = "notConnected";
    this.#pingTimer.stop();
  }
  #onWebSocketError(event: ws.ErrorEvent) {
    _console.error("webSocket.error", event);
  }

  // PARSING
  #parseWebSocketMessage(dataView: DataView<ArrayBuffer>) {
    parseMessage(
      dataView,
      WebSocketMessageTypes,
      this.#onMessage.bind(this),
      null,
      true
    );
  }

  #onMessage(
    messageType: WebSocketMessageType,
    dataView: DataView<ArrayBuffer>
  ) {
    _console.log(
      `received "${messageType}" message (${dataView.byteLength} bytes)`
    );
    switch (messageType) {
      case "ping":
        this.#pong();
        break;
      case "pong":
        break;
      case "batteryLevel":
        this.onMessageReceived?.("batteryLevel", dataView);
        break;
      case "deviceInformation":
        parseMessage(
          dataView,
          DeviceInformationTypes,
          (deviceInformationType, dataView) => {
            this.onMessageReceived!(deviceInformationType, dataView);
          }
        );
        break;
      case "message":
        this.parseRxMessage(dataView);
        break;
      default:
        _console.error(`uncaught messageType "${messageType}"`);
        break;
    }
  }

  // PING
  #pingTimer = new Timer(this.#ping.bind(this), webSocketPingTimeout - 1_000);
  #ping() {
    _console.log("pinging");
    this.#sendWebSocketMessage("ping");
  }
  #pong() {
    _console.log("ponging");
    this.#sendWebSocketMessage("pong");
  }

  // DEVICE INFORMATION
  #requestDeviceInformation() {
    this.#sendWebSocketMessage(...WebSocketDeviceInformationMessageTypes);
  }

  remove() {
    super.remove();
    this.webSocket = undefined;
  }
}

export default WebSocketConnectionManager;
