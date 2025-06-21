import Device from "../Device.ts";
import { DisplayBrightness, DisplayColorRGB, DisplayContextState } from "../DisplayManager.ts";
import EventDispatcher, { BoundEventListeners, Event, EventListenerMap, EventMap } from "./EventDispatcher.ts";
export declare const DisplayCanvasHelperEventTypes: readonly [];
export type DisplayCanvasHelperEventType = (typeof DisplayCanvasHelperEventTypes)[number];
export interface DisplayCanvasHelperEventMessages {
}
export type DisplayCanvasHelperEventDispatcher = EventDispatcher<DisplayCanvasHelper, DisplayCanvasHelperEventType, DisplayCanvasHelperEventMessages>;
export type DisplayCanvasHelperEvent = Event<DisplayCanvasHelper, DisplayCanvasHelperEventType, DisplayCanvasHelperEventMessages>;
export type DisplayCanvasHelperEventMap = EventMap<DisplayCanvasHelper, DisplayCanvasHelperEventType, DisplayCanvasHelperEventMessages>;
export type DisplayCanvasHelperEventListenerMap = EventListenerMap<DisplayCanvasHelper, DisplayCanvasHelperEventType, DisplayCanvasHelperEventMessages>;
export type BoundDisplayCanvasHelperEventListeners = BoundEventListeners<DisplayCanvasHelper, DisplayCanvasHelperEventType, DisplayCanvasHelperEventMessages>;
declare class DisplayCanvasHelper {
    #private;
    constructor();
    get addEventListener(): <T extends never>(type: T, listener: (event: {
        type: T;
        target: DisplayCanvasHelper;
        message: DisplayCanvasHelperEventMessages[T];
    }) => void, options?: {
        once?: boolean;
    }) => void;
    get removeEventListener(): <T extends never>(type: T, listener: (event: {
        type: T;
        target: DisplayCanvasHelper;
        message: DisplayCanvasHelperEventMessages[T];
    }) => void) => void;
    get waitForEvent(): <T extends never>(type: T) => Promise<{
        type: T;
        target: DisplayCanvasHelper;
        message: DisplayCanvasHelperEventMessages[T];
    }>;
    get removeEventListeners(): <T extends never>(type: T) => void;
    get removeAllEventListeners(): () => void;
    get canvas(): HTMLCanvasElement | undefined;
    set canvas(newCanvas: HTMLCanvasElement | undefined);
    get context(): CanvasRenderingContext2D;
    get device(): Device | undefined;
    set device(newDevice: Device | undefined);
    get numberOfColors(): number;
    set numberOfColors(newNumberOfColors: number);
    get colors(): string[];
    get opacities(): number[];
    get contextState(): DisplayContextState;
    setColor(colorIndex: number, color: DisplayColorRGB | string, sendImmediately?: boolean): void;
    setColorOpacity(colorIndex: number, opacity: number, sendImmediately?: boolean): void;
    setOpacity(opacity: number, sendImmediately?: boolean): void;
    get brightness(): "veryLow" | "low" | "medium" | "high" | "veryHigh";
    get applyBrightnessToGlobalAlpha(): boolean;
    set applyBrightnessToGlobalAlpha(newValue: boolean);
    setBrightness(newBrightness: DisplayBrightness, sendImmediately?: boolean): void;
}
export default DisplayCanvasHelper;
