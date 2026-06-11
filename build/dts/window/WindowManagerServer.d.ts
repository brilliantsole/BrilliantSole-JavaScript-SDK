import EventDispatcher, { BoundEventListeners, Event, EventListenerMap, EventMap } from "../utils/EventDispatcher.ts";
import { WindowManagerMessage } from "./WindowManagerUtils.ts";
export interface WindowManagerServerClient {
    iframe: HTMLIFrameElement;
    messageChannel?: MessageChannel;
    didSendMessagePort?: boolean;
    didLoad?: boolean;
    allowRedirects?: boolean;
}
export interface WindowManagerServerClientContext {
    client: WindowManagerServerClient;
    responseMessages: (ArrayBuffer | undefined)[];
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
export type WindowManagerServerEventDispatcher = EventDispatcher<WindowManagerServer, WindowManagerServerEventType, WindowManagerServerEventMessages>;
export type WindowManagerServerEvent = Event<WindowManagerServer, WindowManagerServerEventType, WindowManagerServerEventMessages>;
export type WindowManagerServerEventMap = EventMap<WindowManagerServer, WindowManagerServerEventType, WindowManagerServerEventMessages>;
export type WindowManagerServerEventListenerMap = EventListenerMap<WindowManagerServer, WindowManagerServerEventType, WindowManagerServerEventMessages>;
export type BoundWindowManagerServerEventListeners = BoundEventListeners<WindowManagerServer, WindowManagerServerEventType, WindowManagerServerEventMessages>;
declare class WindowManagerServer {
    #private;
    get addEventListener(): <T extends "clientConnected" | "clientDisconnected">(type: T, listener: (event: {
        type: T;
        target: WindowManagerServer;
        message: WindowManagerServerEventMessages[T];
    }) => void, options?: {
        once?: boolean;
    }) => void;
    get removeEventListener(): <T extends "clientConnected" | "clientDisconnected">(type: T, listener: (event: {
        type: T;
        target: WindowManagerServer;
        message: WindowManagerServerEventMessages[T];
    }) => void) => void;
    get waitForEvent(): <T extends "clientConnected" | "clientDisconnected">(type: T) => Promise<{
        type: T;
        target: WindowManagerServer;
        message: WindowManagerServerEventMessages[T];
    }>;
    get removeEventListeners(): <T extends "clientConnected" | "clientDisconnected">(type: T) => void;
    get removeAllEventListeners(): () => void;
    static readonly shared: WindowManagerServer;
    constructor();
    get clients(): WindowManagerServerClient[];
    sendToClient(client: WindowManagerServerClient, ...messages: WindowManagerMessage[]): void;
    broadcast(...messages: WindowManagerMessage[]): void;
}
declare const _default: WindowManagerServer;
export default _default;
