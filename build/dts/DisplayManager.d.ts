import Device, { SendMessageCallback } from "./Device.ts";
import EventDispatcher from "./utils/EventDispatcher.ts";
import { Vector2 } from "./utils/MathUtils.ts";
import { DisplayScaleDirection, DisplayColorRGB, DisplayCropDirection } from "./utils/DisplayUtils.ts";
import { DisplayContextState, DisplayContextStateKey, DisplaySegmentCap, PartialDisplayContextState } from "./utils/DisplayContextState.ts";
import { DisplayContextCommand } from "./utils/DisplayContextCommand.ts";
import { DisplayManagerInterface } from "./utils/DisplayManagerInterface.ts";
export declare const DefaultNumberOfDisplayColors = 16;
export declare const DisplayCommands: readonly ["sleep", "wake"];
export type DisplayCommand = (typeof DisplayCommands)[number];
export declare const DisplayStatuses: readonly ["awake", "asleep"];
export type DisplayStatus = (typeof DisplayStatuses)[number];
export declare const DisplayInformationTypes: readonly ["type", "width", "height", "pixelDepth"];
export type DisplayInformationType = (typeof DisplayInformationTypes)[number];
export declare const DisplayTypes: readonly ["none", "generic", "monocularLeft", "monocularRight", "binocular"];
export type DisplayType = (typeof DisplayTypes)[number];
export declare const DisplayPixelDepths: readonly ["1", "2", "4"];
export type DisplayPixelDepth = (typeof DisplayPixelDepths)[number];
export declare const DisplayBrightnesses: readonly ["veryLow", "low", "medium", "high", "veryHigh"];
export type DisplayBrightness = (typeof DisplayBrightnesses)[number];
export declare const DisplayMessageTypes: readonly ["isDisplayAvailable", "displayStatus", "displayInformation", "displayCommand", "getDisplayBrightness", "setDisplayBrightness", "displayContextCommands", "displayReady"];
export type DisplayMessageType = (typeof DisplayMessageTypes)[number];
export type DisplaySize = {
    width: number;
    height: number;
};
export type DisplayInformation = {
    type: DisplayType;
    width: number;
    height: number;
    pixelDepth: DisplayPixelDepth;
};
export type DisplayBitmapColorPair = {
    bitmapColorIndex: number;
    colorIndex: number;
};
export type DisplaySpriteColorPair = {
    spriteColorIndex: number;
    colorIndex: number;
};
export type DisplayBitmap = {
    width: number;
    height: number;
    numberOfColors: number;
    pixels: number[];
};
export declare const DisplayInformationValues: {
    type: readonly ["none", "generic", "monocularLeft", "monocularRight", "binocular"];
    pixelDepth: readonly ["1", "2", "4"];
};
export declare const RequiredDisplayMessageTypes: DisplayMessageType[];
export declare const DisplayEventTypes: readonly ["isDisplayAvailable", "displayStatus", "displayInformation", "displayCommand", "getDisplayBrightness", "setDisplayBrightness", "displayContextCommands", "displayReady", "displayContextState", "displayColor", "displayColorOpacity", "displayOpacity"];
export type DisplayEventType = (typeof DisplayEventTypes)[number];
export interface DisplayEventMessages {
    isDisplayAvailable: {
        isDisplayAvailable: boolean;
    };
    displayStatus: {
        displayStatus: DisplayStatus;
        previousDisplayStatus: DisplayStatus;
    };
    displayInformation: {
        displayInformation: DisplayInformation;
    };
    getDisplayBrightness: {
        displayBrightness: DisplayBrightness;
    };
    displayContextState: {
        displayContextState: DisplayContextState;
        differences: DisplayContextStateKey[];
    };
    displayColor: {
        colorIndex: number;
        colorRGB: DisplayColorRGB;
        colorHex: string;
    };
    displayColorOpacity: {
        opacity: number;
        colorIndex: number;
    };
    displayOpacity: {
        opacity: number;
    };
    displayReady: {};
}
export type DisplayEventDispatcher = EventDispatcher<Device, DisplayEventType, DisplayEventMessages>;
export type SendDisplayMessageCallback = SendMessageCallback<DisplayMessageType>;
declare class DisplayManager implements DisplayManagerInterface {
    #private;
    constructor();
    sendMessage: SendDisplayMessageCallback;
    eventDispatcher: DisplayEventDispatcher;
    get waitForEvent(): <T extends "isDisplayAvailable" | "displayStatus" | "displayInformation" | "displayCommand" | "getDisplayBrightness" | "setDisplayBrightness" | "displayContextCommands" | "displayReady" | "displayContextState" | "displayColor" | "displayColorOpacity" | "displayOpacity">(type: T) => Promise<{
        type: T;
        target: Device;
        message: DisplayEventMessages[T];
    }>;
    requestRequiredInformation(): void;
    get isAvailable(): boolean;
    get contextState(): DisplayContextState;
    setContextState(newState: PartialDisplayContextState, sendImmediately?: boolean): Promise<void>;
    get displayStatus(): "asleep" | "awake";
    get isDisplayAwake(): boolean;
    wake(): Promise<void>;
    sleep(): Promise<void>;
    toggle(): Promise<void>;
    get numberOfColors(): number;
    get displayInformation(): DisplayInformation | undefined;
    get pixelDepth(): "1" | "2" | "4";
    get width(): number;
    get height(): number;
    get size(): {
        width: number;
        height: number;
    };
    get type(): "generic" | "none" | "monocularLeft" | "monocularRight" | "binocular";
    get brightness(): "veryLow" | "low" | "medium" | "high" | "veryHigh";
    setBrightness(newDisplayBrightness: DisplayBrightness, sendImmediately?: boolean): Promise<void>;
    flushContextCommands(): Promise<void>;
    show(sendImmediately?: boolean): Promise<void>;
    clear(sendImmediately?: boolean): Promise<void>;
    get colors(): string[];
    setColor(colorIndex: number, color: DisplayColorRGB | string, sendImmediately?: boolean): Promise<void>;
    get opacities(): number[];
    setColorOpacity(colorIndex: number, opacity: number, sendImmediately?: boolean): Promise<void>;
    setOpacity(opacity: number, sendImmediately?: boolean): Promise<void>;
    saveContext(sendImmediately?: boolean): Promise<void>;
    restoreContext(sendImmediately?: boolean): Promise<void>;
    selectFillColor(fillColorIndex: number, sendImmediately?: boolean): Promise<void>;
    selectLineColor(lineColorIndex: number, sendImmediately?: boolean): Promise<void>;
    setLineWidth(lineWidth: number, sendImmediately?: boolean): Promise<void>;
    setRotation(rotation: number, isRadians?: boolean, sendImmediately?: boolean): Promise<void>;
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
    selectBitmapColor(bitmapColorIndex: number, colorIndex: number, sendImmediately?: boolean): Promise<void>;
    get bitmapColorIndices(): number[];
    get bitmapColors(): string[];
    selectBitmapColors(bitmapColorPairs: DisplayBitmapColorPair[], sendImmediately?: boolean): Promise<void>;
    setBitmapColor(bitmapColorIndex: number, color: DisplayColorRGB | string, sendImmediately?: boolean): Promise<void>;
    setBitmapColorOpacity(bitmapColorIndex: number, opacity: number, sendImmediately?: boolean): Promise<void>;
    setBitmapScaleDirection(direction: DisplayScaleDirection, bitmapScale: number, sendImmediately?: boolean): Promise<void>;
    setBitmapScaleX(bitmapScaleX: number, sendImmediately?: boolean): Promise<void>;
    setBitmapScaleY(bitmapScaleY: number, sendImmediately?: boolean): Promise<void>;
    setBitmapScale(bitmapScale: number, sendImmediately?: boolean): Promise<void>;
    resetBitmapScale(sendImmediately?: boolean): Promise<void>;
    selectSpriteColor(spriteColorIndex: number, colorIndex: number, sendImmediately?: boolean): Promise<void>;
    get spriteColorIndices(): number[];
    get spriteColors(): string[];
    selectSpriteColors(spriteColorPairs: DisplaySpriteColorPair[], sendImmediately?: boolean): Promise<void>;
    setSpriteColor(spriteColorIndex: number, color: DisplayColorRGB | string, sendImmediately?: boolean): Promise<void>;
    setSpriteColorOpacity(spriteColorIndex: number, opacity: number, sendImmediately?: boolean): Promise<void>;
    resetSpriteColors(sendImmediately?: boolean): Promise<void>;
    setSpriteScale(spriteScale: number, sendImmediately?: boolean): Promise<void>;
    resetSpriteScale(sendImmediately?: boolean): Promise<void>;
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
    drawSprite(centerX: number, centerY: number, spriteSheetName: string, spriteName: string, sendImmediately?: boolean): Promise<void>;
    drawBitmap(centerX: number, centerY: number, bitmap: DisplayBitmap, sendImmediately?: boolean): Promise<void>;
    imageToBitmap(image: HTMLImageElement, width: number, height: number, numberOfColors?: number): Promise<{
        blob: Blob;
        bitmap: DisplayBitmap;
    }>;
    quantizeImage(image: HTMLImageElement, width: number, height: number, numberOfColors: number): Promise<{
        blob: Blob;
        colors: string[];
        colorIndices: number[];
    }>;
    resizeAndQuantizeImage(image: HTMLImageElement, width: number, height: number, colors: string[]): Promise<{
        blob: Blob;
        colorIndices: number[];
    }>;
    selectSpriteSheet(index: number, sendImmediately?: boolean): void;
    runContextCommand(command: DisplayContextCommand, sendImmediately?: boolean): Promise<void>;
    runContextCommands(commands: DisplayContextCommand[], sendImmediately?: boolean): Promise<void>;
    get isReady(): boolean;
    parseMessage(messageType: DisplayMessageType, dataView: DataView): void;
    reset(): void;
    get mtu(): number;
    set mtu(newMtu: number);
}
export default DisplayManager;
