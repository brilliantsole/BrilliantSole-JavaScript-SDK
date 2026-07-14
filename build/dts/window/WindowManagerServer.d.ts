import { EventDispatcherTypes } from "../utils/EventDispatcher.ts";
import { BaseServerClientContext } from "../server/BaseServer.ts";
export interface WindowManagerServerClient {
    type: "window";
    iframe: HTMLIFrameElement;
    messageChannel?: MessageChannel;
    didSendMessagePort?: boolean;
    didLoad?: boolean;
    transfer?: Transferable[];
}
export interface WindowManagerServerClientContext extends BaseServerClientContext<WindowManagerServerClient> {
    transfer: Transferable[];
}
export declare const WindowManagerServerEventTypes: readonly ["clientConnected", "clientDisconnected"];
export type WindowManagerServerEventType = (typeof WindowManagerServerEventTypes)[number];
interface WindowManagerServerEventMessages {
    clientConnected: {
        client: WindowManagerServerClient;
    };
    clientDisconnected: {
        client: WindowManagerServerClient;
    };
}
export type WindowManagerServerEventDispatcherTypes = EventDispatcherTypes<WindowManagerServer, WindowManagerServerEventType, WindowManagerServerEventMessages>;
export type WindowManagerServerEvent = WindowManagerServerEventDispatcherTypes["Event"];
export type WindowManagerServerEventMap = WindowManagerServerEventDispatcherTypes["EventMap"];
export type WindowManagerServerEventListenerMap = WindowManagerServerEventDispatcherTypes["EventListenerMap"];
export type WindowManagerServerEventDispatcher = WindowManagerServerEventDispatcherTypes["EventDispatcher"];
export type BoundWindowManagerServerEventListeners = WindowManagerServerEventDispatcherTypes["BoundEventListeners"];
declare class WindowManagerServer {
    #private;
    get addEventListener(): <T extends "*" | "clientConnected" | "clientDisconnected">(type: T, listener: (event: import("../utils/EventDispatcher.ts").ListenerEvent<WindowManagerServer, "clientConnected" | "clientDisconnected", WindowManagerServerEventMessages, T>) => void, options?: import("../utils/EventDispatcher.ts").EventDispatcherOptions) => void;
    get removeEventListener(): <T extends "*" | "clientConnected" | "clientDisconnected">(type: T, listener: (event: import("../utils/EventDispatcher.ts").ListenerEvent<WindowManagerServer, "clientConnected" | "clientDisconnected", WindowManagerServerEventMessages, T>) => void) => void;
    get waitForEvent(): <T extends "clientConnected" | "clientDisconnected">(type: T, options?: {
        immediate?: boolean;
    }) => Promise<import("../utils/EventDispatcher.ts").ListenerEvent<WindowManagerServer, "clientConnected" | "clientDisconnected", WindowManagerServerEventMessages, T>>;
    get removeEventListeners(): <T extends "*" | "clientConnected" | "clientDisconnected">(type: T) => void;
    removeAllEventListeners(): void;
    static readonly shared: WindowManagerServer;
    constructor();
    get clients(): WindowManagerServerClient[];
    sendToClient(client: WindowManagerServerClient, arrayBuffer: ArrayBuffer): boolean;
}
declare const _default: WindowManagerServer;
export default _default;
