import Device, { SendMessageCallback } from "./Device.ts";
import EventDispatcher from "./utils/EventDispatcher.ts";
import { DisplayCropDirection } from "./utils/DisplayUtils.ts";
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
export declare const DisplayMessageTypes: readonly ["isDisplayAvailable", "displayStatus", "displayInformation", "displayCommand", "getDisplayBrightness", "setDisplayBrightness", "displayContextCommands"];
export type DisplayMessageType = (typeof DisplayMessageTypes)[number];
export declare const DisplaySegmentCaps: readonly ["flat", "round"];
export type DisplaySegmentCap = (typeof DisplaySegmentCaps)[number];
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
export type DisplayColorRGB = {
    r: number;
    g: number;
    b: number;
};
export type DisplayColorYCbCr = {
    y: number;
    cb: number;
    cr: number;
};
export type DisplayContextState = {
    fillColorIndex: number;
    lineColorIndex: number;
    lineWidth: number;
    rotation: number;
    segmentStartCap: DisplaySegmentCap;
    segmentEndCap: DisplaySegmentCap;
    segmentStartRadius: number;
    segmentEndRadius: number;
    cropTop: number;
    cropRight: number;
    cropBottom: number;
    cropLeft: number;
    rotationCropTop: number;
    rotationCropRight: number;
    rotationCropBottom: number;
    rotationCropLeft: number;
};
export type DisplayContextStateKey = keyof DisplayContextState;
export type PartialDisplayContextState = Partial<DisplayContextState>;
export declare const DefaultDisplayContextState: DisplayContextState;
export declare const DisplayInformationValues: {
    type: readonly ["none", "generic", "monocularLeft", "monocularRight", "binocular"];
    pixelDepth: readonly ["1", "2", "4"];
};
export declare const DisplayContextCommands: readonly ["show", "clear", "setColor", "setColorOpacity", "setOpacity", "saveContext", "restoreContext", "selectFillColor", "selectLineColor", "setLineWidth", "setRotation", "clearRotation", "setSegmentStartCap", "setSegmentEndCap", "setSegmentCap", "setSegmentStartRadius", "setSegmentEndRadius", "setSegmentRadius", "setCropTop", "setCropRight", "setCropBottom", "setCropLeft", "clearCrop", "setRotationCropTop", "setRotationCropRight", "setRotationCropBottom", "setRotationCropLeft", "clearRotationCrop", "clearRect", "drawRect", "drawRoundRect", "drawCircle", "drawEllipse", "drawPolygon", "drawSegment", "selectSpriteSheet", "sprite", "selectFont", "drawText"];
export type DisplayContextCommand = (typeof DisplayContextCommands)[number];
export declare const RequiredDisplayMessageTypes: DisplayMessageType[];
export declare const DisplayEventTypes: readonly ["isDisplayAvailable", "displayStatus", "displayInformation", "displayCommand", "getDisplayBrightness", "setDisplayBrightness", "displayContextCommands", "displayContextState", "displayColor", "displayColorOpacity", "displayOpacity"];
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
        color: DisplayColorRGB;
        colorHex: string;
    };
    displayColorOpacity: {
        opacity: number;
        colorIndex: number;
    };
    displayOpacity: {
        opacity: number;
    };
}
export type DisplayEventDispatcher = EventDispatcher<Device, DisplayEventType, DisplayEventMessages>;
export type SendDisplayMessageCallback = SendMessageCallback<DisplayMessageType>;
declare class DisplayManager {
    #private;
    constructor();
    sendMessage: SendDisplayMessageCallback;
    eventDispatcher: DisplayEventDispatcher;
    get waitForEvent(): <T extends "isDisplayAvailable" | "displayStatus" | "displayInformation" | "displayCommand" | "getDisplayBrightness" | "setDisplayBrightness" | "displayContextCommands" | "displayContextState" | "displayColor" | "displayColorOpacity" | "displayOpacity">(type: T) => Promise<{
        type: T;
        target: Device;
        message: DisplayEventMessages[T];
    }>;
    requestRequiredInformation(): void;
    get isDisplayAvailable(): boolean;
    get displayContextState(): DisplayContextState;
    setContextState(newState: PartialDisplayContextState): Promise<void>;
    get displayStatus(): "awake" | "asleep";
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
    get type(): "none" | "generic" | "monocularLeft" | "monocularRight" | "binocular";
    get displayBrightness(): "veryLow" | "low" | "medium" | "high" | "veryHigh";
    setDisplayBrightness(newDisplayBrightness: DisplayBrightness, sendImmediately?: boolean): Promise<void>;
    get flushDisplayContextCommands(): () => Promise<void>;
    showDisplay(sendImmediately?: boolean): void;
    clearDisplay(sendImmediately?: boolean): void;
    get colors(): string[];
    setColor(colorIndex: number, color: DisplayColorRGB | string, sendImmediately?: boolean): void;
    get opacities(): number[];
    setColorOpacity(colorIndex: number, opacity: number, sendImmediately?: boolean): void;
    setOpacity(opacity: number, sendImmediately?: boolean): void;
    saveContext(sendImmediately?: boolean): void;
    restoreContext(sendImmediately?: boolean): void;
    selectFillColor(fillColorIndex: number, sendImmediately?: boolean): void;
    selectLineColor(lineColorIndex: number, sendImmediately?: boolean): void;
    setLineWidth(lineWidth: number, sendImmediately?: boolean): void;
    setRotation(rotation: number, isRadians?: boolean, sendImmediately?: boolean): void;
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
    drawPolygon(centerX: number, centerY: number, radius: number, numberOfSides: number, sendImmediately?: boolean): void;
    drawSegment(startX: number, startY: number, endX: number, endY: number, sendImmediately?: boolean): void;
    selectSpriteSheet(index: number, sendImmediately?: boolean): void;
    drawSprite(index: number, x: number, y: number, sendImmediately?: boolean): void;
    parseMessage(messageType: DisplayMessageType, dataView: DataView): void;
    clear(): void;
    get mtu(): number;
    set mtu(newMtu: number);
}
export default DisplayManager;
