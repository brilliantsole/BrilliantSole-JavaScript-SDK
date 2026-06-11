import { createConsole } from "../../utils/Console.ts";
import { addEventListeners } from "../../utils/EventUtils.ts";
import BaseServer, { BaseServerClient } from "../BaseServer.ts";
import {
  default as WindowManagerServer,
  WindowManagerServerClient,
  WindowManagerServerEventMap,
} from "../../window/WindowManagerServer.ts";

const _console = createConsole("WindowServer", { log: false });

interface WindowServerClient
  extends BaseServerClient, WindowManagerServerClient {}

class WindowServer extends BaseServer<WindowServerClient> {
  static readonly shared = new WindowServer();

  init() {
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
    clientConnected: this.#onWindowManaagerServerClientConnected.bind(this),
    clientDisconnected:
      this.#onWindowManaagerServerClientDisconnected.bind(this),
  };
  #onWindowManaagerServerClientConnected(
    event: WindowManagerServerEventMap["clientConnected"],
  ) {
    const { client } = event.message;
    _console.log("onWindowManaagerServerClientConnected", client);
    this.dispatchEvent("clientConnected", { client });
  }
  #onWindowManaagerServerClientDisconnected(
    event: WindowManagerServerEventMap["clientDisconnected"],
  ) {
    const { client } = event.message;
    _console.log("onWindowManaagerServerClientDisconnected", client);
    this.dispatchEvent("clientDisconnected", { client });
  }
}

export default WindowServer.shared;
