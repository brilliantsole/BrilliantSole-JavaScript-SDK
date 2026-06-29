import { EventDispatcherTypes } from "../utils/EventDispatcher.ts";
import { AddPrefixToInterfaceKeys, ExtendInterfaceValues, IfAny } from "../utils/TypeScriptUtils.ts";
import { ServerEventType } from "./BaseServer.ts";
import { Server, ServerEventMessages } from "./Server.ts";
interface BaseServerManagerServerEventMessage {
    server: Server;
}
type ServerManagerServerEventMessages = ExtendInterfaceValues<AddPrefixToInterfaceKeys<ServerEventMessages, "server">, BaseServerManagerServerEventMessage>;
export declare const wildcardServerEventType: "server*";
export type WildcardServerEventType = typeof wildcardServerEventType;
export type WildcardServerEventMessage<BaseMessage> = {
    [K in ServerEventType]: BaseMessage & (K extends keyof ServerEventMessages ? IfAny<ServerEventMessages[K], {}, ServerEventMessages[K]> : {}) & {
        serverEventType: K;
        server: Server;
    };
}[ServerEventType];
interface BaseServerManagerEventMessages {
    server: {
        server: Server;
    };
    servers: {
        servers: Server[];
    };
    [wildcardServerEventType]: WildcardServerEventMessage<BaseServerManagerServerEventMessage>;
}
export declare const ServerManagerEventTypes: readonly [...("serverClientConnected" | "serverClientDisconnected")[], "server", "servers", "server*"];
export type ServerManagerEventType = (typeof ServerManagerEventTypes)[number];
export type ServerManagerEventMessages = ServerManagerServerEventMessages & BaseServerManagerEventMessages;
export type ServerManagerEventDisptcherTypes = EventDispatcherTypes<ServerManager, ServerManagerEventType, ServerManagerEventMessages>;
export type ServerManagerEvent = ServerManagerEventDisptcherTypes["Event"];
export type ServerManagerEventMap = ServerManagerEventDisptcherTypes["EventMap"];
export type ServerManagerEventListenerMap = ServerManagerEventDisptcherTypes["EventListenerMap"];
export type ServerManagerEventDispatcher = ServerManagerEventDisptcherTypes["EventDispatcher"];
export type BoundServerManagerEventListeners = ServerManagerEventDisptcherTypes["BoundEventListeners"];
declare class ServerManager {
    #private;
    static readonly shared: ServerManager;
    constructor();
    get servers(): Server[];
    get addEventListener(): <T extends "server*" | "server" | "serverClientConnected" | "serverClientDisconnected" | "servers" | "*">(type: T, listener: (event: import("../utils/EventDispatcher.ts").ListenerEvent<ServerManager, "server*" | "server" | "serverClientConnected" | "serverClientDisconnected" | "servers", ServerManagerEventMessages, T>) => void, options?: import("../utils/EventDispatcher.ts").EventDispatcherOptions) => void;
    get removeEventListener(): <T extends "server*" | "server" | "serverClientConnected" | "serverClientDisconnected" | "servers" | "*">(type: T, listener: (event: import("../utils/EventDispatcher.ts").ListenerEvent<ServerManager, "server*" | "server" | "serverClientConnected" | "serverClientDisconnected" | "servers", ServerManagerEventMessages, T>) => void) => void;
    get removeEventListeners(): <T extends "server*" | "server" | "serverClientConnected" | "serverClientDisconnected" | "servers" | "*">(type: T) => void;
}
declare const _default: ServerManager;
export default _default;
