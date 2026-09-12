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
export declare const WindowManagerServerEventTypes: readonly ["clientConnected", "clientNotConnected"];
export type WindowManagerServerEventType = (typeof WindowManagerServerEventTypes)[number];
interface WindowManagerServerEventMessages {
    clientConnected: {
        client: WindowManagerServerClient;
    };
    clientNotConnected: {
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
    get addEventListener(): <T extends "*" | "clientNotConnected" | "clientConnected">(type: T, listener: (event: import("../utils/EventDispatcher.ts").ListenerEvent<WindowManagerServer, "clientNotConnected" | "clientConnected", WindowManagerServerEventMessages, T>) => void, options?: import("../utils/EventDispatcher.ts").EventDispatcherOptions) => void;
    get removeEventListener(): <T extends "*" | "clientNotConnected" | "clientConnected">(type: T, listener: (event: import("../utils/EventDispatcher.ts").ListenerEvent<WindowManagerServer, "clientNotConnected" | "clientConnected", WindowManagerServerEventMessages, T>) => void) => void;
    get waitForEvent(): <T extends "clientNotConnected" | "clientConnected">(type: T, options?: {
        immediate?: boolean;
        signal?: AbortSignal;
    }) => Promise<import("../utils/EventDispatcher.ts").ListenerEvent<WindowManagerServer, "clientNotConnected" | "clientConnected", WindowManagerServerEventMessages, T>>;
    get removeEventListeners(): <T extends "*" | "clientNotConnected" | "clientConnected">(type: T) => void;
    removeAllEventListeners(): void;
    static readonly shared: WindowManagerServer;
    constructor();
    get clients(): WindowManagerServerClient[];
    sendToClient(client: WindowManagerServerClient, arrayBuffer: ArrayBuffer): boolean;
    addIframe(iframe: HTMLIFrameElement): void;
}
declare const _default: WindowManagerServer;
export default _default;
