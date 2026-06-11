import EventDispatcher, { BoundEventListeners, Event, EventListenerMap, EventMap } from "../utils/EventDispatcher.ts";
interface WindowManagerClient {
    iframe: HTMLIFrameElement;
    messageChannel?: MessageChannel;
    didSendMessagePort?: boolean;
}
export declare const WindowManagerEventTypes: readonly [];
export type WindowManagerEventType = (typeof WindowManagerEventTypes)[number];
interface WindowManagerEventMessages {
}
export type WindowManagerEventDispatcher = EventDispatcher<WindowManager, WindowManagerEventType, WindowManagerEventMessages>;
export type WindowManagerEvent = Event<WindowManager, WindowManagerEventType, WindowManagerEventMessages>;
export type WindowManagerEventMap = EventMap<WindowManager, WindowManagerEventType, WindowManagerEventMessages>;
export type WindowManagerEventListenerMap = EventListenerMap<WindowManager, WindowManagerEventType, WindowManagerEventMessages>;
export type BoundWindowManagerEventListeners = BoundEventListeners<WindowManager, WindowManagerEventType, WindowManagerEventMessages>;
declare class WindowManager {
    #private;
    static readonly shared: WindowManager;
    get clients(): WindowManagerClient[];
    get addEventListener(): <T extends never>(type: T, listener: (event: {
        type: T;
        target: WindowManager;
        message: WindowManagerEventMessages[T];
    }) => void, options?: {
        once?: boolean;
    }) => void;
    get removeEventListener(): <T extends never>(type: T, listener: (event: {
        type: T;
        target: WindowManager;
        message: WindowManagerEventMessages[T];
    }) => void) => void;
    get waitForEvent(): <T extends never>(type: T) => Promise<{
        type: T;
        target: WindowManager;
        message: WindowManagerEventMessages[T];
    }>;
    get removeEventListeners(): <T extends never>(type: T) => void;
    get removeAllEventListeners(): () => void;
    constructor();
    protected sendToClient(client: WindowManagerClient, message: ArrayBuffer): void;
}
declare const _default: WindowManager;
export default _default;
