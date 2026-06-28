import {
  WildcardEventType,
  wildcardEventType,
} from "../utils/EventDispatcher.ts";
import { createConsole } from "../utils/Console.ts";
import { addEventListeners } from "../utils/EventUtils.ts";
import { Singleton } from "../utils/TypeScriptUtils.ts";
import BaseServer, { ServerEventType } from "./BaseServer.ts";
import { BoundServerEventListeners, Server, ServerEventMap } from "./Server.ts";

const _console = createConsole("ServerManager", { log: true });

@Singleton
class ServerManager {
  static readonly shared: ServerManager;

  constructor() {
    // @ts-expect-error
    BaseServer.OnServer = this.#onServer.bind(this);
  }

  #servers: Server[] = [];
  get servers() {
    return this.#servers;
  }

  #boundServerEventListeners: BoundServerEventListeners = {
    [wildcardEventType]: this.#onServerEvent.bind(this),
  };
  #onServer(server: Server) {
    _console.log("onServer", server);
    addEventListeners(server, this.#boundServerEventListeners);
    if (!this.#servers.includes(server)) {
      _console.log("server", server);
      this.#servers.push(server);
      //   this.#dispatchEvent("server", { server });
      //   this.#dispatchEvent("servers", {
      //     servers: this.servers,
      //   });
    }
  }
  #onServerEvent(serverEvent: ServerEventMap[WildcardEventType]) {
    const { type: serverEventType, target: server, message } = serverEvent;

    _console.log("onServerEvent", serverEvent);
    return; // FIX
    // @ts-expect-error
    this.#dispatchEvent(wildcardServerEventType, {
      ...message,
      server,
      serverEventType,
    });

    getServerManagerServerEventTypes(
      serverEventType as ServerEventType,
    ).forEach((eventType) => {
      this.#dispatchEvent(eventType, {
        ...message,
        server,
      });
    });
  }
}

export default ServerManager.shared;
