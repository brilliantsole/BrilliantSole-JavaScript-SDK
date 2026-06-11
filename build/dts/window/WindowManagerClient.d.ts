import EventDispatcher, { BoundEventListeners, Event, EventListenerMap, EventMap } from "../utils/EventDispatcher.ts";
import { WindowManagerMessage } from "./WindowManagerUtils.ts";
export declare const ClientConnectionStatuses: readonly ["notConnected", "connecting", "connected", "disconnecting"];
export type ClientConnectionStatus = (typeof ClientConnectionStatuses)[number];
export declare const WindowManagerClientEventTypes: readonly ["notConnected", "connecting", "connected", "disconnecting", "connectionStatus", "isConnected", "serverMessage"];
export type WindowManagerClientEventType = (typeof WindowManagerClientEventTypes)[number];
interface WindowManagerClientEventMessages {
    connectionStatus: {
        connectionStatus: ClientConnectionStatus;
    };
    isConnected: {
        isConnected: boolean;
    };
    serverMessage: {
        dataView: DataView<ArrayBuffer>;
    };
}
export type WindowManagerClientEventDispatcher = EventDispatcher<WindowManagerClient, WindowManagerClientEventType, WindowManagerClientEventMessages>;
export type WindowManagerClientEvent = Event<WindowManagerClient, WindowManagerClientEventType, WindowManagerClientEventMessages>;
export type WindowManagerClientEventMap = EventMap<WindowManagerClient, WindowManagerClientEventType, WindowManagerClientEventMessages>;
export type WindowManagerClientEventListenerMap = EventListenerMap<WindowManagerClient, WindowManagerClientEventType, WindowManagerClientEventMessages>;
export type BoundWindowManagerClientEventListeners = BoundEventListeners<WindowManagerClient, WindowManagerClientEventType, WindowManagerClientEventMessages>;
declare class WindowManagerClient {
    #private;
    get addEventListener(): <T extends "serverMessage" | "notConnected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isConnected">(type: T, listener: (event: {
        type: T;
        target: WindowManagerClient;
        message: WindowManagerClientEventMessages[T];
    }) => void, options?: {
        once?: boolean;
    }) => void;
    get removeEventListener(): <T extends "serverMessage" | "notConnected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isConnected">(type: T, listener: (event: {
        type: T;
        target: WindowManagerClient;
        message: WindowManagerClientEventMessages[T];
    }) => void) => void;
    get waitForEvent(): <T extends "serverMessage" | "notConnected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isConnected">(type: T) => Promise<{
        type: T;
        target: WindowManagerClient;
        message: WindowManagerClientEventMessages[T];
    }>;
    get removeEventListeners(): <T extends "serverMessage" | "notConnected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isConnected">(type: T) => void;
    get removeAllEventListeners(): () => void;
    static readonly shared: WindowManagerClient;
    constructor();
    get connectionStatus(): "notConnected" | "connecting" | "connected" | "disconnecting";
    protected set connectionStatus(newConnectionStatus: "notConnected" | "connecting" | "connected" | "disconnecting");
    get isConnected(): boolean;
    get isDisconnected(): boolean;
    connect(): void;
    disconnect(): void;
    reconnect(): void;
    toggleConnection(): void;
    sendMessage(...messages: WindowManagerMessage[]): void;
}
declare const _default: WindowManagerClient;
export default _default;
