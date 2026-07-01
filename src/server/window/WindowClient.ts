import { createConsole } from "../../utils/Console.ts";
import { addEventListeners } from "../../utils/EventUtils.ts";
import BaseClient from "../BaseClient.ts";
import {
  createServerMessage,
  ServerMessageOrMessageType,
} from "../ServerUtils.ts";

import {
  default as WindowManagerClient,
  WindowManagerClientEventMap,
} from "../../window/WindowManagerClient.ts";
import { Singleton } from "../../utils/TypeScriptUtils.ts";

const _console = createConsole("WindowClient", { log: false });

@Singleton
class WindowClient extends BaseClient {
  static type = "window" as const;
  readonly type = WindowClient.type;

  static readonly shared: WindowClient;

  constructor() {
    super();

    addEventListeners(WindowManagerClient, this.#boundWindowEventListeners);
  }

  // WINDOW
  #boundWindowEventListeners: {
    [K in keyof WindowManagerClientEventMap]?: (
      event: WindowManagerClientEventMap[K],
    ) => void;
  } = {
    connectionStatus: this.#onWindowManagerClientConnectionStatus.bind(this),
    serverMessage: this.#onWindowManagerClientServerMessage.bind(this),
  };
  #onWindowManagerClientConnectionStatus(
    event: WindowManagerClientEventMap["connectionStatus"],
  ) {
    _console.log(
      "onWindowManagerClientConnectionStatus",
      event.message.connectionStatus,
    );
    this._sendRequiredMessages();
  }
  #onWindowManagerClientServerMessage(
    event: WindowManagerClientEventMap["serverMessage"],
  ) {
    _console.log("onWindowManagerClientServerMessage", event.message.dataView);
    this.parseMessage(event.message.dataView);
  }

  // CONNECTION
  get isConnected() {
    return WindowManagerClient.isConnected;
  }
  get isDisconnected() {
    return WindowManagerClient.isDisconnected;
  }

  connect() {
    this.#onConnectionCommand();
  }
  disconnect() {
    this.#onConnectionCommand();
  }
  reconnect() {
    this.#onConnectionCommand();
  }
  toggleConnection() {
    this.#onConnectionCommand();
  }
  #onConnectionCommand() {
    throw new Error("WindowClient connection is automatic");
  }

  // MESSAGING
  sendServerMessage(...messages: ServerMessageOrMessageType[]) {
    _console.log("sendServerMessage", messages);
    WindowManagerClient.sendMessage({
      type: "serverMessage",
      data: createServerMessage(...messages),
    });
  }
}

export { WindowClient };
export default WindowClient.shared;
