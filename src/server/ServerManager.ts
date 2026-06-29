import EventDispatcher, {
  EventDispatcherTypes,
  WildcardEventType,
  wildcardEventType,
} from "../utils/EventDispatcher.ts";
import { createConsole } from "../utils/Console.ts";
import { addEventListeners } from "../utils/EventUtils.ts";
import {
  AddPrefixToInterfaceKeys,
  ExtendInterfaceValues,
  IfAny,
  KeyOf,
  Singleton,
} from "../utils/TypeScriptUtils.ts";
import BaseServer, { ServerEventType, ServerEventTypes } from "./BaseServer.ts";
import {
  BoundServerEventListeners,
  Server,
  ServerClient,
  ServerEventMap,
  ServerEventMessages,
} from "./Server.ts";
import { capitalizeFirstCharacter } from "../utils/stringUtils.ts";

const _console = createConsole("ServerManager", { log: true });

interface BaseServerManagerServerEventMessage {
  server: Server;
}
type ServerManagerServerEventMessages = ExtendInterfaceValues<
  AddPrefixToInterfaceKeys<ServerEventMessages, "server">,
  BaseServerManagerServerEventMessage
>;
type ServerManagerServerEventType = KeyOf<ServerManagerServerEventMessages>;
function getServerManagerServerEventTypes(serverEventType: ServerEventType) {
  return ["server"].map(
    (prefix) =>
      `${prefix}${capitalizeFirstCharacter(
        serverEventType,
      )}` as ServerManagerServerEventType,
  );
}
const ServerManagerServerEventTypes = ServerEventTypes.flatMap((eventType) =>
  getServerManagerServerEventTypes(eventType),
) as ServerManagerServerEventType[];

export const wildcardServerEventType = "server*" as const;
export type WildcardServerEventType = typeof wildcardServerEventType;

const BaseServerManagerEventTypes = [
  "server",
  "servers",
  wildcardServerEventType,
] as const;
type BaseServerManagerEventType = (typeof BaseServerManagerEventTypes)[number];

export type WildcardServerEventMessage<BaseMessage> = {
  [K in ServerEventType]: BaseMessage &
    (K extends keyof ServerEventMessages
      ? IfAny<ServerEventMessages[K], {}, ServerEventMessages[K]>
      : {}) & {
      serverEventType: K;
      server: Server;
    };
}[ServerEventType];

interface BaseServerManagerEventMessages {
  server: { server: Server };
  servers: { servers: Server[] };
  [wildcardServerEventType]: WildcardServerEventMessage<BaseServerManagerServerEventMessage>;
}

export const ServerManagerEventTypes = [
  ...ServerManagerServerEventTypes,
  ...BaseServerManagerEventTypes,
] as const;
export type ServerManagerEventType = (typeof ServerManagerEventTypes)[number];

export type ServerManagerEventMessages = ServerManagerServerEventMessages &
  BaseServerManagerEventMessages;

export type ServerManagerEventDisptcherTypes = EventDispatcherTypes<
  ServerManager,
  ServerManagerEventType,
  ServerManagerEventMessages
>;
export type ServerManagerEvent = ServerManagerEventDisptcherTypes["Event"];
export type ServerManagerEventMap =
  ServerManagerEventDisptcherTypes["EventMap"];
export type ServerManagerEventListenerMap =
  ServerManagerEventDisptcherTypes["EventListenerMap"];
export type ServerManagerEventDispatcher =
  ServerManagerEventDisptcherTypes["EventDispatcher"];
export type BoundServerManagerEventListeners =
  ServerManagerEventDisptcherTypes["BoundEventListeners"];

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
      this.#dispatchEvent("server", { server });
      this.#dispatchEvent("servers", {
        servers: this.servers,
      });
    }
  }
  #onServerEvent(serverEvent: ServerEventMap[WildcardEventType]) {
    const { type: serverEventType, target: server, message } = serverEvent;

    _console.log("onServerEvent", serverEvent);

    this.#dispatchEvent(wildcardServerEventType, {
      ...message,
      server: server as Server,
      serverEventType,
    });

    getServerManagerServerEventTypes(
      serverEventType as ServerEventType,
    ).forEach((eventType) => {
      this.#dispatchEvent(eventType, {
        ...message,
        server: server as Server,
      });
    });
  }

  // STATIC EVENTLISTENERS
  #eventDispatcher: ServerManagerEventDispatcher = new EventDispatcher(
    this as ServerManager,
    ServerManagerEventTypes,
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
  get removeEventListeners() {
    return this.#eventDispatcher.removeEventListeners;
  }
  // removeAllEventListeners() {
  //   this.#eventDispatcher.removeAllEventListeners();
  // }

  // MESSAGING
  // FILL - more "message" stuff
  #broadcastMessage(message: ArrayBuffer, clients?: ServerClient[]) {
    this.servers.forEach((server) => {
      // @ts-expect-error
      server.broadcastMessage(message, clients);
    });
  }
}

export default ServerManager.shared;
