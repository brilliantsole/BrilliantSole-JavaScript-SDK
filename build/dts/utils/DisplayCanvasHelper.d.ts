import Device from "../Device.ts";
import { DisplayBrightness, DisplayColorRGB, DisplayContextState, DisplayContextStateKey, DisplaySegmentCap } from "../DisplayManager.ts";
import { DisplayCropDirection } from "./DisplayUtils.ts";
import EventDispatcher, { BoundEventListeners, Event, EventListenerMap, EventMap } from "./EventDispatcher.ts";
export declare const DisplayCanvasHelperEventTypes: readonly ["displayContextState"];
export type DisplayCanvasHelperEventType = (typeof DisplayCanvasHelperEventTypes)[number];
export interface DisplayCanvasHelperEventMessages {
    displayContextState: {
        displayContextState: DisplayContextState;
        differences: DisplayContextStateKey[];
    };
}
export type DisplayCanvasHelperEventDispatcher = EventDispatcher<DisplayCanvasHelper, DisplayCanvasHelperEventType, DisplayCanvasHelperEventMessages>;
export type DisplayCanvasHelperEvent = Event<DisplayCanvasHelper, DisplayCanvasHelperEventType, DisplayCanvasHelperEventMessages>;
export type DisplayCanvasHelperEventMap = EventMap<DisplayCanvasHelper, DisplayCanvasHelperEventType, DisplayCanvasHelperEventMessages>;
export type DisplayCanvasHelperEventListenerMap = EventListenerMap<DisplayCanvasHelper, DisplayCanvasHelperEventType, DisplayCanvasHelperEventMessages>;
export type BoundDisplayCanvasHelperEventListeners = BoundEventListeners<DisplayCanvasHelper, DisplayCanvasHelperEventType, DisplayCanvasHelperEventMessages>;
export type DisplayBoundingBox = {
    x: number;
    y: number;
    width: number;
    height: number;
};
declare class DisplayCanvasHelper {
    #private;
    constructor();
    get addEventListener(): <T extends "displayContextState">(type: T, listener: (event: {
        type: T;
        target: DisplayCanvasHelper;
        message: DisplayCanvasHelperEventMessages[T];
    }) => void, options?: {
        once?: boolean;
    }) => void;
    get removeEventListener(): <T extends "displayContextState">(type: T, listener: (event: {
        type: T;
        target: DisplayCanvasHelper;
        message: DisplayCanvasHelperEventMessages[T];
    }) => void) => void;
    get waitForEvent(): <T extends "displayContextState">(type: T) => Promise<{
        type: T;
        target: DisplayCanvasHelper;
        message: DisplayCanvasHelperEventMessages[T];
    }>;
    get removeEventListeners(): <T extends "displayContextState">(type: T) => void;
    get removeAllEventListeners(): () => void;
    get canvas(): HTMLCanvasElement | undefined;
    set canvas(newCanvas: HTMLCanvasElement | undefined);
    get context(): CanvasRenderingContext2D;
    get width(): number;
    get height(): number;
    get device(): Device | undefined;
    set device(newDevice: Device | undefined);
    get numberOfColors(): number;
    set numberOfColors(newNumberOfColors: number);
    get colors(): string[];
    get opacities(): number[];
    get displayContextState(): DisplayContextState;
    get contextState(): DisplayContextState;
    showDisplay(sendImmediately?: boolean): void;
    clearDisplay(sendImmediately?: boolean): void;
    setColor(colorIndex: number, color: DisplayColorRGB | string, sendImmediately?: boolean): void;
    setColorOpacity(colorIndex: number, opacity: number, sendImmediately?: boolean): void;
    setOpacity(opacity: number, sendImmediately?: boolean): void;
    selectFillColor(fillColorIndex: number, sendImmediately?: boolean): void;
    selectLineColor(lineColorIndex: number, sendImmediately?: boolean): void;
    setLineWidth(lineWidth: number, sendImmediately?: boolean): void;
    setRotation(rotation: number, isRadians: boolean, sendImmediately?: boolean): void;
    clearRotation(sendImmediately?: boolean): void;
    setSegmentStartCap(segmentStartCap: DisplaySegmentCap, sendImmediately?: boolean): void;
    setSegmentEndCap(segmentEndCap: DisplaySegmentCap, sendImmediately?: boolean): void;
    setSegmentCap(segmentCap: DisplaySegmentCap, sendImmediately?: boolean): void;
    setSegmentStartRadius(segmentStartRadius: number, sendImmediately?: boolean): void;
    setSegmentEndRadius(segmentEndRadius: number, sendImmediately?: boolean): void;
    setSegmentRadius(segmentRadius: number, sendImmediately?: boolean): void;
    setCrop(cropDirection: DisplayCropDirection, crop: number, sendImmediately?: boolean): void;
    setCropTop(cropTop: number, sendImmediately?: boolean): void;
    setCropRight(cropRight: number, sendImmediately?: boolean): void;
    setCropBottom(cropBottom: number, sendImmediately?: boolean): void;
    setCropLeft(cropLeft: number, sendImmediately?: boolean): void;
    clearCrop(sendImmediately?: boolean): void;
    setRotationCrop(cropDirection: DisplayCropDirection, crop: number, sendImmediately?: boolean): void;
    setRotationCropTop(rotationCropTop: number, sendImmediately?: boolean): void;
    setRotationCropRight(rotationCropRight: number, sendImmediately?: boolean): void;
    setRotationCropBottom(rotationCropBottom: number, sendImmediately?: boolean): void;
    setRotationCropLeft(rotationCropLeft: number, sendImmediately?: boolean): void;
    clearRotationCrop(sendImmediately?: boolean): void;
    clearRect(x: number, y: number, width: number, height: number, sendImmediately?: boolean): void;
    drawRect(centerX: number, centerY: number, width: number, height: number, sendImmediately?: boolean): void;
    drawRoundRect(centerX: number, centerY: number, width: number, height: number, borderRadius: number, sendImmediately?: boolean): void;
    drawCircle(centerX: number, centerY: number, radius: number, sendImmediately?: boolean): void;
    drawEllipse(centerX: number, centerY: number, radiusX: number, radiusY: number, sendImmediately?: boolean): void;
    drawPolygon(x: number, y: number, radius: number, numberOfSides: number, sendImmediately?: boolean): void;
    drawSegment(startX: number, startY: number, endX: number, endY: number, sendImmediately?: boolean): void;
    get brightness(): "veryLow" | "low" | "medium" | "high" | "veryHigh";
    setBrightness(newBrightness: DisplayBrightness, sendImmediately?: boolean): void;
}
export default DisplayCanvasHelper;
