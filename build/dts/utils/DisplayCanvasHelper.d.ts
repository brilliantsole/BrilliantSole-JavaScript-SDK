import Device from "../Device.ts";
import { DisplayBitmapColorPair, DisplayBrightness, DisplayColorRGB, DisplayContextState, DisplayContextStateKey, DisplaySegmentCap } from "../DisplayManager.ts";
import { DisplayCropDirection } from "./DisplayUtils.ts";
import EventDispatcher, { BoundEventListeners, Event, EventListenerMap, EventMap } from "./EventDispatcher.ts";
import { Vector2 } from "./MathUtils.ts";
export declare const DisplayCanvasHelperEventTypes: readonly ["contextState", "numberOfColors", "brightness", "color", "colorOpacity", "opacity", "resize", "update", "ready"];
export type DisplayCanvasHelperEventType = (typeof DisplayCanvasHelperEventTypes)[number];
export interface DisplayCanvasHelperEventMessages {
    contextState: {
        contextState: DisplayContextState;
        differences: DisplayContextStateKey[];
    };
    numberOfColors: {
        numberOfColors: number;
    };
    brightness: {
        brightness: DisplayBrightness;
    };
    color: {
        colorIndex: number;
        color: DisplayColorRGB;
        colorHex: string;
    };
    colorOpacity: {
        opacity: number;
        colorIndex: number;
    };
    opacity: {
        opacity: number;
    };
    resize: {
        width: number;
        height: number;
    };
    update: {};
    ready: {};
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
    get addEventListener(): <T extends "opacity" | "numberOfColors" | "resize" | "contextState" | "brightness" | "color" | "colorOpacity" | "update" | "ready">(type: T, listener: (event: {
        type: T;
        target: DisplayCanvasHelper;
        message: DisplayCanvasHelperEventMessages[T];
    }) => void, options?: {
        once?: boolean;
    }) => void;
    get removeEventListener(): <T extends "opacity" | "numberOfColors" | "resize" | "contextState" | "brightness" | "color" | "colorOpacity" | "update" | "ready">(type: T, listener: (event: {
        type: T;
        target: DisplayCanvasHelper;
        message: DisplayCanvasHelperEventMessages[T];
    }) => void) => void;
    get waitForEvent(): <T extends "opacity" | "numberOfColors" | "resize" | "contextState" | "brightness" | "color" | "colorOpacity" | "update" | "ready">(type: T) => Promise<{
        type: T;
        target: DisplayCanvasHelper;
        message: DisplayCanvasHelperEventMessages[T];
    }>;
    get removeEventListeners(): <T extends "opacity" | "numberOfColors" | "resize" | "contextState" | "brightness" | "color" | "colorOpacity" | "update" | "ready">(type: T) => void;
    get removeAllEventListeners(): () => void;
    get canvas(): HTMLCanvasElement | undefined;
    set canvas(newCanvas: HTMLCanvasElement | undefined);
    get context(): CanvasRenderingContext2D;
    get width(): number;
    get height(): number;
    get aspectRatio(): number;
    get applyTransparency(): boolean;
    set applyTransparency(newValue: boolean);
    get device(): Device | undefined;
    set device(newDevice: Device | undefined);
    get numberOfColors(): number;
    set numberOfColors(newNumberOfColors: number);
    get colors(): string[];
    get opacities(): number[];
    get contextState(): DisplayContextState;
    showDisplay(sendImmediately?: boolean): Promise<void>;
    get interval(): number;
    set interval(newInterval: number);
    get isReady(): boolean;
    clearDisplay(sendImmediately?: boolean): Promise<void>;
    setColor(colorIndex: number, color: DisplayColorRGB | string, sendImmediately?: boolean): Promise<void>;
    setColorOpacity(colorIndex: number, opacity: number, sendImmediately?: boolean): Promise<void>;
    setOpacity(opacity: number, sendImmediately?: boolean): Promise<void>;
    selectFillColor(fillColorIndex: number, sendImmediately?: boolean): Promise<void>;
    selectLineColor(lineColorIndex: number, sendImmediately?: boolean): Promise<void>;
    setLineWidth(lineWidth: number, sendImmediately?: boolean): Promise<void>;
    setRotation(rotation: number, isRadians: boolean, sendImmediately?: boolean): Promise<void>;
    clearRotation(sendImmediately?: boolean): Promise<void>;
    setSegmentStartCap(segmentStartCap: DisplaySegmentCap, sendImmediately?: boolean): Promise<void>;
    setSegmentEndCap(segmentEndCap: DisplaySegmentCap, sendImmediately?: boolean): Promise<void>;
    setSegmentCap(segmentCap: DisplaySegmentCap, sendImmediately?: boolean): Promise<void>;
    setSegmentStartRadius(segmentStartRadius: number, sendImmediately?: boolean): Promise<void>;
    setSegmentEndRadius(segmentEndRadius: number, sendImmediately?: boolean): Promise<void>;
    setSegmentRadius(segmentRadius: number, sendImmediately?: boolean): Promise<void>;
    setCrop(cropDirection: DisplayCropDirection, crop: number, sendImmediately?: boolean): Promise<void>;
    setCropTop(cropTop: number, sendImmediately?: boolean): Promise<void>;
    setCropRight(cropRight: number, sendImmediately?: boolean): Promise<void>;
    setCropBottom(cropBottom: number, sendImmediately?: boolean): Promise<void>;
    setCropLeft(cropLeft: number, sendImmediately?: boolean): Promise<void>;
    clearCrop(sendImmediately?: boolean): Promise<void>;
    setRotationCrop(cropDirection: DisplayCropDirection, crop: number, sendImmediately?: boolean): Promise<void>;
    setRotationCropTop(rotationCropTop: number, sendImmediately?: boolean): Promise<void>;
    setRotationCropRight(rotationCropRight: number, sendImmediately?: boolean): Promise<void>;
    setRotationCropBottom(rotationCropBottom: number, sendImmediately?: boolean): Promise<void>;
    setRotationCropLeft(rotationCropLeft: number, sendImmediately?: boolean): Promise<void>;
    clearRotationCrop(sendImmediately?: boolean): Promise<void>;
    selectBitmapColorIndex(bitmapColorIndex: number, colorIndex: number, sendImmediately?: boolean): Promise<void>;
    selectDisplayBitmapColorIndices(bitmapColors: DisplayBitmapColorPair[], sendImmediately?: boolean): Promise<void>;
    setBitmapScale(bitmapScale: number, sendImmediately?: boolean): Promise<void>;
    clearRect(x: number, y: number, width: number, height: number, sendImmediately?: boolean): Promise<void>;
    drawRect(centerX: number, centerY: number, width: number, height: number, sendImmediately?: boolean): Promise<void>;
    drawRoundRect(centerX: number, centerY: number, width: number, height: number, borderRadius: number, sendImmediately?: boolean): Promise<void>;
    drawCircle(centerX: number, centerY: number, radius: number, sendImmediately?: boolean): Promise<void>;
    drawEllipse(centerX: number, centerY: number, radiusX: number, radiusY: number, sendImmediately?: boolean): Promise<void>;
    drawPolygon(centerX: number, centerY: number, radius: number, numberOfSides: number, sendImmediately?: boolean): Promise<void>;
    drawSegment(startX: number, startY: number, endX: number, endY: number, sendImmediately?: boolean): Promise<void>;
    drawSegments(points: Vector2[], sendImmediately?: boolean): Promise<void>;
    drawArc(centerX: number, centerY: number, radius: number, startAngle: number, angleOffset: number, isRadians?: boolean, sendImmediately?: boolean): Promise<void>;
    drawArcEllipse(centerX: number, centerY: number, radiusX: number, radiusY: number, startAngle: number, angleOffset: number, isRadians?: boolean, sendImmediately?: boolean): Promise<void>;
    get brightness(): "veryLow" | "low" | "medium" | "high" | "veryHigh";
    setBrightness(newBrightness: DisplayBrightness, sendImmediately?: boolean): Promise<void>;
}
export default DisplayCanvasHelper;
