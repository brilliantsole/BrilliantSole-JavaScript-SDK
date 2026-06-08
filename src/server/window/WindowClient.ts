import { createConsole } from "../../utils/Console.ts";
import {
  addEventListeners,
  removeEventListeners,
} from "../../utils/EventUtils.ts";
import { parseMessage } from "../../utils/ParseUtils.ts";
import BaseClient from "../BaseClient.ts";
import {
  createServerMessage,
  MessageLike,
  ServerMessage,
} from "../ServerUtils.ts";
import {
  createWindowMessage,
  windowMessageKey,
  WindowMessageType,
  WindowMessageTypes,
  windowPingMessage,
  windowPongMessage,
} from "./WindowUtils.ts";

const _console = createConsole("WindowClient", { log: false });

class WindowClient extends BaseClient {
  static readonly shared = new WindowClient();

  constructor() {
    super();

    if (WindowClient.shared && this != WindowClient.shared) {
      throw Error("WindowClient is a singleton - use WindowClient.shared");
    }

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
    // _console.log("onWindowMessage", event);

    const arrayBuffer: ArrayBuffer | undefined = event.data[windowMessageKey];
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
    this.#parseWindowMessage(dataView);

    if (!this.#isConnected) {
      this.#isConnected = true;
      this._sendRequiredMessages();
    }
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
    this.#parseWindowMessage(dataView);
  }

  // PARSING

  #parseWindowMessage(dataView: DataView<ArrayBuffer>) {
    parseMessage(
      dataView,
      WindowMessageTypes,
      this.#onServerMessage.bind(this),
      null,
      true,
    );
  }

  #onServerMessage(
    messageType: WindowMessageType,
    dataView: DataView<ArrayBuffer>,
  ) {
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

  // CONNECTION

  #isConnected = false;
  get isConnected() {
    return this.#isConnected;
  }
  get isDisconnected() {
    return !this.isConnected;
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
    if (message != windowPingMessage) {
      this.assertConnection();
    }
    _console.log("sendMessage", message, { transfer });
    if (this.#port) {
      this.#port.postMessage(message, { transfer });
    } else {
      window.parent.postMessage(
        {
          [windowMessageKey]: message,
        },
        "*",
        transfer,
      );
    }
  }

  sendServerMessage(...messages: ServerMessage[]) {
    this.#sendMessage(
      createWindowMessage({
        type: "serverMessage",
        data: createServerMessage(...messages),
      }),
    );
  }

  // PING
  #ping() {
    this.#sendMessage(windowPingMessage);
  }
  #pong() {
    this.#sendMessage(windowPongMessage);
  }
}

export default WindowClient.shared;
