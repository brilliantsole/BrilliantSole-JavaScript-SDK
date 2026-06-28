import { createConsole } from "../../utils/Console.ts";
import { addEventListeners } from "../../utils/EventUtils.ts";
import BaseServer, { BaseServerClient } from "../BaseServer.ts";
import {
  default as WindowManagerServer,
  WindowManagerServerClient,
  WindowManagerServerEventMap,
} from "../../window/WindowManagerServer.ts";

const _console = createConsole("WindowServer", { log: false });

export interface WindowServerClient
  extends BaseServerClient, WindowManagerServerClient {
  type: "window";
}

class WindowServer extends BaseServer<WindowServerClient> {
  static type = "window" as const;
  readonly type = WindowServer.type;

  static readonly shared = new WindowServer();

  protected init() {
    addEventListeners(
      WindowManagerServer,
      this.#boundWindowManagerServerEventListeners,
    );
  }

  constructor() {
    super();

    this.clearSensorConfigurationsWhenNoClients = false; // may set to true if it's a headless "app" hub

    if (WindowServer.shared && this != WindowServer.shared) {
      throw Error("WindowServer is a singleton - use WindowServer.shared");
    }
  }

  // CLIENTS

  protected sendToClient(client: WindowServerClient, message: ArrayBuffer) {
    WindowManagerServer.sendToClient(client, {
      type: "serverMessage",
      data: message,
    });
  }

  // WINDOW
  #boundWindowManagerServerEventListeners: {
    [K in keyof WindowManagerServerEventMap]?: (
      event: WindowManagerServerEventMap[K],
    ) => void;
  } = {
    clientConnected: this.#onWindowManagerServerClientConnected.bind(this),
    clientDisconnected:
      this.#onWindowManagerServerClientDisconnected.bind(this),
  };
  #onWindowManagerServerClientConnected(
    event: WindowManagerServerEventMap["clientConnected"],
  ) {
    const { client } = event.message;
    _console.log("onWindowManagerServerClientConnected", client);
    this.dispatchEvent("clientConnected", { client });
  }
  #onWindowManagerServerClientDisconnected(
    event: WindowManagerServerEventMap["clientDisconnected"],
  ) {
    const { client } = event.message;
    _console.log("onWindowManagerServerClientDisconnected", client);
    this.dispatchEvent("clientDisconnected", { client });
  }
}
export { WindowServer };

export default WindowServer.shared;
