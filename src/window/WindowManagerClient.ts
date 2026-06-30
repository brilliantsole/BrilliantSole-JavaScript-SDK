import { createConsole } from "../utils/Console.ts";
import EventDispatcher, {
  EventDispatcherTypes,
} from "../utils/EventDispatcher.ts";
import {
  addEventListeners,
  removeEventListeners,
} from "../utils/EventUtils.ts";
import {
  createWindowManagerMessage,
  WindowManagerMessage,
  windowManagerMessageKey,
  WindowManagerMessageType,
  WindowManagerMessageTypes,
  windowManagerPingMessage,
  windowManagerPongMessage,
} from "./WindowManagerUtils.ts";

import { parseMessage } from "../utils/ParseUtils.ts";
import { MessageLike } from "../server/ServerUtils.ts";
import { Singleton } from "../utils/TypeScriptUtils.ts";

const _console = createConsole("WindowManagerClient", { log: false });

export const WindowManagerClientConnectionStatuses = [
  "notConnected",
  "connecting",
  "connected",
  "disconnecting",
] as const;
export type ClientConnectionStatus =
  (typeof WindowManagerClientConnectionStatuses)[number];

export const WindowManagerClientEventTypes = [
  ...WindowManagerClientConnectionStatuses,
  "connectionStatus",
  "isConnected",
  "serverMessage",
] as const;
export type WindowManagerClientEventType =
  (typeof WindowManagerClientEventTypes)[number];

interface WindowManagerClientEventMessages {
  connectionStatus: { connectionStatus: ClientConnectionStatus };
  isConnected: { isConnected: boolean };
  serverMessage: { dataView: DataView<ArrayBuffer> };
}

export type WindowManagerClientEventDispatcherTypes = EventDispatcherTypes<
  WindowManagerClient,
  WindowManagerClientEventType,
  WindowManagerClientEventMessages
>;
export type WindowManagerClientEvent =
  WindowManagerClientEventDispatcherTypes["Event"];
export type WindowManagerClientEventMap =
  WindowManagerClientEventDispatcherTypes["EventMap"];
export type WindowManagerClientEventListenerMap =
  WindowManagerClientEventDispatcherTypes["EventListenerMap"];
export type WindowManagerClientEventDispatcher =
  WindowManagerClientEventDispatcherTypes["EventDispatcher"];
export type BoundWindowManagerClientEventListeners =
  WindowManagerClientEventDispatcherTypes["BoundEventListeners"];

@Singleton
class WindowManagerClient {
  // EVENT DISPATCHER
  #eventDispatcher: WindowManagerClientEventDispatcher = new EventDispatcher(
    this as WindowManagerClient,
    WindowManagerClientEventTypes,
  );
  get addEventListener() {
    return this.#eventDispatcher.addEventListener;
  }
  get #dispatchEvent() {
    return this.#eventDispatcher.dispatchEvent;
  }
  get removeEventListener() {
    return this.#eventDispatcher.removeEventListener;
  }
  get waitForEvent() {
    return this.#eventDispatcher.waitForEvent;
  }
  get removeEventListeners() {
    return this.#eventDispatcher.removeEventListeners;
  }
  get removeAllEventListeners() {
    return this.#eventDispatcher.removeAllEventListeners;
  }

  static readonly shared: WindowManagerClient;

  constructor() {
    addEventListeners(window, this.#boundWindowEventListeners);

    this.connect();
  }

  // WINDOW
  #boundWindowEventListeners: {
    [K in keyof WindowEventMap]?: (event: WindowEventMap[K]) => void;
  } = {
    message: this.#onWindowMessage.bind(this),
  };
  #onWindowMessage(event: WindowEventMap["message"]) {
    if (event.source == window) {
      return;
    }
    if (!event.source) {
      return;
    }
    if (event.source != window.parent) {
      return;
    }
    _console.log("onWindowMessage", event);

    const arrayBuffer: ArrayBuffer | undefined =
      event.data[windowManagerMessageKey];
    if (!arrayBuffer) {
      return;
    }
    const { ports } = event;
    if (ports?.length > 0) {
      this.#onMessagePort(ports[0]);
    }

    _console.log("onWindowMessage", arrayBuffer, ports);
    const dataView = new DataView(arrayBuffer) as DataView<ArrayBuffer>;
    _console.log(`received ${dataView.byteLength} bytes`, dataView.buffer);
    this.#parseWindowManagerMessage(dataView);
  }

  #port?: MessagePort;
  #onMessagePort(port: MessagePort) {
    if (this.#port == port) {
      return;
    }
    if (this.#port) {
      removeEventListeners(
        this.#port,
        this.#boundMessageChannelPortEventListeners,
      );
      this.#port.close();
    }
    this.#port = port;
    _console.log("port", this.#port);
    addEventListeners(this.#port, this.#boundMessageChannelPortEventListeners);
    this.#port.start();
  }

  // MESSAGE PORT
  #boundMessageChannelPortEventListeners: {
    [K in keyof MessagePortEventMap]?: (event: MessagePortEventMap[K]) => void;
  } = {
    message: this.#onMessagePortMessage.bind(this),
  };

  #onMessagePortMessage(event: MessagePortEventMap["message"]) {
    _console.log("onMessagePortMessage", event);
    const port = event.currentTarget as MessagePort;
    if (this.#port != port) {
      _console.error("received message from wrong port");
      return;
    }
    const arrayBuffer = event.data as ArrayBuffer;
    const dataView = new DataView(arrayBuffer) as DataView<ArrayBuffer>;
    _console.log(`received ${dataView.byteLength} bytes`, dataView.buffer);
    this.#parseWindowManagerMessage(dataView);
  }

  // PARSING

  #parseWindowManagerMessage(dataView: DataView<ArrayBuffer>) {
    parseMessage(
      dataView,
      WindowManagerMessageTypes,
      this.#onWindowManagerMessage.bind(this),
      null,
      true,
    );
  }

  #onWindowManagerMessage(
    messageType: WindowManagerMessageType,
    dataView: DataView<ArrayBuffer>,
  ) {
    switch (messageType) {
      case "ping":
        this.#pong();
        break;
      case "pong":
        this.connectionStatus = "connected";
        break;
      case "serverMessage":
        this.#dispatchEvent("serverMessage", { dataView });
        break;
      default:
        _console.error(`uncaught messageType "${messageType}"`);
        break;
    }
  }

  // CONNECTION STATUS
  #connectionStatus: ClientConnectionStatus = "notConnected";
  get connectionStatus() {
    return this.#connectionStatus;
  }
  protected set connectionStatus(newConnectionStatus) {
    _console.assertTypeWithError(newConnectionStatus, "string");
    _console.log({ newConnectionStatus });
    if (this.#connectionStatus == newConnectionStatus) {
      return;
    }
    this.#connectionStatus = newConnectionStatus;

    this.#dispatchEvent("connectionStatus", {
      connectionStatus: this.connectionStatus,
    });
    this.#dispatchEvent(this.connectionStatus, {});

    switch (newConnectionStatus) {
      case "connected":
      case "notConnected":
        this.#dispatchEvent("isConnected", { isConnected: this.isConnected });
        break;
    }
  }

  // CONNECTION

  get isConnected() {
    return this.connectionStatus == "connected";
  }
  get isDisconnected() {
    return !this.isConnected;
  }

  #assertConnection() {
    _console.assertWithError(this.isConnected, "notConnected");
  }
  #assertDisconnection() {
    _console.assertWithError(this.isDisconnected, "not disconnected");
  }

  // connection is automatic for now
  connect() {
    this.#ping();
  }
  disconnect(): void {
    throw new Error("Method not implemented.");
  }
  reconnect(): void {
    throw new Error("Method not implemented.");
  }
  toggleConnection(): void {
    throw new Error("Method not implemented.");
  }

  // MESSAGING
  #sendMessage(message: MessageLike, transfer?: Transferable[] | undefined) {
    if (message != windowManagerPingMessage) {
      this.#assertConnection();
    }
    _console.log("sendMessage", message, { transfer });
    if (this.#port) {
      this.#port.postMessage(message, { transfer });
    } else {
      window.parent.postMessage(
        {
          [windowManagerMessageKey]: message,
        },
        "*",
        transfer,
      );
    }
  }

  sendMessage(...messages: WindowManagerMessage[]) {
    _console.log("sendMessage", ...messages);
    this.#sendMessage(createWindowManagerMessage(...messages));
  }

  // PING
  #ping() {
    this.#sendMessage(windowManagerPingMessage);
  }
  #pong() {
    this.#sendMessage(windowManagerPongMessage);
  }
}

export default WindowManagerClient.shared;
