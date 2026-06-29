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
import BaseClient, {
  ClientEventType,
  ClientEventTypes,
  BoundClientEventListeners,
  ClientEventMap,
  ClientEventMessages,
} from "./BaseClient.ts";
import { Client } from "./Client.ts";
import { capitalizeFirstCharacter } from "../utils/stringUtils.ts";

const _console = createConsole("ClientManager", { log: true });

interface BaseClientManagerClientEventMessage {
  client: Client;
}
type ClientManagerClientEventMessages = ExtendInterfaceValues<
  AddPrefixToInterfaceKeys<ClientEventMessages, "client">,
  BaseClientManagerClientEventMessage
>;
type ClientManagerClientEventType = KeyOf<ClientManagerClientEventMessages>;
function getClientManagerClientEventTypes(clientEventType: ClientEventType) {
  return ["client"].map(
    (prefix) =>
      `${prefix}${capitalizeFirstCharacter(
        clientEventType,
      )}` as ClientManagerClientEventType,
  );
}
const ClientManagerClientEventTypes = ClientEventTypes.flatMap((eventType) =>
  getClientManagerClientEventTypes(eventType),
) as ClientManagerClientEventType[];

export const wildcardClientEventType = "client*" as const;
export type WildcardClientEventType = typeof wildcardClientEventType;

const BaseClientManagerEventTypes = [
  "client",
  "clients",
  wildcardClientEventType,
] as const;
type BaseClientManagerEventType = (typeof BaseClientManagerEventTypes)[number];

export type WildcardClientEventMessage<BaseMessage> = {
  [K in ClientEventType]: BaseMessage &
    (K extends keyof ClientEventMessages
      ? IfAny<ClientEventMessages[K], {}, ClientEventMessages[K]>
      : {}) & {
      clientEventType: K;
      client: Client;
    };
}[ClientEventType];

interface BaseClientManagerEventMessages {
  client: { client: Client };
  clients: { clients: Client[] };
  [wildcardClientEventType]: WildcardClientEventMessage<BaseClientManagerClientEventMessage>;
}

export const ClientManagerEventTypes = [
  ...ClientManagerClientEventTypes,
  ...BaseClientManagerEventTypes,
] as const;
export type ClientManagerEventType = (typeof ClientManagerEventTypes)[number];

export type ClientManagerEventMessages = ClientManagerClientEventMessages &
  BaseClientManagerEventMessages;

export type ClientManagerEventDisptcherTypes = EventDispatcherTypes<
  ClientManager,
  ClientManagerEventType,
  ClientManagerEventMessages
>;
export type ClientManagerEvent = ClientManagerEventDisptcherTypes["Event"];
export type ClientManagerEventMap =
  ClientManagerEventDisptcherTypes["EventMap"];
export type ClientManagerEventListenerMap =
  ClientManagerEventDisptcherTypes["EventListenerMap"];
export type ClientManagerEventDispatcher =
  ClientManagerEventDisptcherTypes["EventDispatcher"];
export type BoundClientManagerEventListeners =
  ClientManagerEventDisptcherTypes["BoundEventListeners"];

@Singleton
class ClientManager {
  static readonly shared: ClientManager;

  constructor() {
    // @ts-expect-error
    BaseClient.OnClient = this.#onClient.bind(this);
  }

  #clients: Client[] = [];
  get clients() {
    return this.#clients;
  }

  #boundClientEventListeners: BoundClientEventListeners = {
    [wildcardEventType]: this.#onClientEvent.bind(this),
  };
  #onClient(client: Client) {
    _console.log("onClient", client);
    addEventListeners(client, this.#boundClientEventListeners);
    if (!this.#clients.includes(client)) {
      _console.log("client", client);
      this.#clients.push(client);
      this.#dispatchEvent("client", { client });
      this.#dispatchEvent("clients", {
        clients: this.clients,
      });
    }
  }
  #onClientEvent(clientEvent: ClientEventMap[WildcardEventType]) {
    const { type: clientEventType, target: client, message } = clientEvent;

    _console.log("onClientEvent", clientEvent);

    this.#dispatchEvent(wildcardClientEventType, {
      ...message,
      client: client as Client,
      clientEventType,
    });

    getClientManagerClientEventTypes(
      clientEventType as ClientEventType,
    ).forEach((eventType) => {
      this.#dispatchEvent(eventType, {
        ...message,
        client: client as Client,
      });
    });
  }

  // STATIC EVENTLISTENERS
  #eventDispatcher: ClientManagerEventDispatcher = new EventDispatcher(
    this as ClientManager,
    ClientManagerEventTypes,
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
}

export default ClientManager.shared;
