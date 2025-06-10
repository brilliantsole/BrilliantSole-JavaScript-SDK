import Device, { SendMessageCallback } from "./Device.ts";
import EventDispatcher from "./utils/EventDispatcher.ts";
export declare const DisplayCommands: readonly ["sleep", "wake"];
export type DisplayCommand = (typeof DisplayCommands)[number];
export declare const DisplayStatuses: readonly ["awake", "asleep"];
export type DisplayStatus = (typeof DisplayStatuses)[number];
export declare const DisplayInformationTypes: readonly ["type", "width", "height", "pixelDepth"];
export type DisplayInformationType = (typeof DisplayInformationTypes)[number];
export declare const DisplayTypes: readonly ["none", "monocularLeft", "monocularRight", "binocular"];
export type DisplayType = (typeof DisplayTypes)[number];
export declare const DisplayPixelDepths: readonly ["1", "2", "4"];
export type DisplayPixelDepth = (typeof DisplayPixelDepths)[number];
export declare const DisplayBrightnesses: readonly ["veryLow", "low", "medium", "high", "veryHigh"];
export type DisplayBrightness = (typeof DisplayBrightnesses)[number];
export declare const DisplayMessageTypes: readonly ["isDisplayAvailable", "displayStatus", "displayInformation", "displayCommand", "getDisplayBrightness", "setDisplayBrightness", "displayContextCommands"];
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
export declare const DisplayInformationValues: {
    type: readonly ["none", "monocularLeft", "monocularRight", "binocular"];
    pixelDepth: readonly ["1", "2", "4"];
};
export declare const DisplayContextCommands: readonly ["show", "clear", "setColor", "setColorOpacity", "setOpacity", "saveContext", "restoreContext", "selectFillColor", "selectStrokeColor", "clearRect", "fillRect", "fillRoundRect", "fillCircle", "fillEllipse", "selectSpriteSheet", "sprite", "selectFont", "text"];
export type DisplayContextCommand = (typeof DisplayContextCommands)[number];
export declare const RequiredDisplayMessageTypes: DisplayMessageType[];
export declare const DisplayEventTypes: readonly ["isDisplayAvailable", "displayStatus", "displayInformation", "displayCommand", "getDisplayBrightness", "setDisplayBrightness", "displayContextCommands"];
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
}
export type DisplayEventDispatcher = EventDispatcher<Device, DisplayEventType, DisplayEventMessages>;
export type SendDisplayMessageCallback = SendMessageCallback<DisplayMessageType>;
declare class DisplayManager {
    #private;
    constructor();
    sendMessage: SendDisplayMessageCallback;
    eventDispatcher: DisplayEventDispatcher;
    get waitForEvent(): <T extends "isDisplayAvailable" | "displayStatus" | "displayInformation" | "displayCommand" | "getDisplayBrightness" | "setDisplayBrightness" | "displayContextCommands">(type: T) => Promise<{
        type: T;
        target: Device;
        message: DisplayEventMessages[T];
    }>;
    requestRequiredInformation(): void;
    get isDisplayAvailable(): boolean;
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
    get type(): "none" | "monocularLeft" | "monocularRight" | "binocular";
    get displayBrightness(): "veryLow" | "low" | "medium" | "high" | "veryHigh";
    setDisplayBrightness(newDisplayBrightness: DisplayBrightness): Promise<void>;
    showDisplay(sendImmediately?: boolean): void;
    clearDisplay(sendImmediately?: boolean): void;
    setColor(colorIndex: number, color: DisplayColorRGB | string, sendImmediately: boolean): void;
    setColorOpacity(index: number, opacity: number, sendImmediately: boolean): void;
    setOpacity(opacity: number, sendImmediately: boolean): void;
    saveContext(sendImmediately: boolean): void;
    restoreContext(sendImmediately: boolean): void;
    selectFillColor(colorIndex: number, sendImmediately: boolean): void;
    selectStrokeColor(colorIndex: number, sendImmediately: boolean): void;
    clearRect(x: number, y: number, width: number, height: number, sendImmediately: boolean): void;
    fillRect(x: number, y: number, width: number, height: number, sendImmediately: boolean): void;
    fillRoundRect(x: number, y: number, width: number, height: number, sendImmediately: boolean): void;
    fillCircle(x: number, y: number, width: number, height: number, sendImmediately: boolean): void;
    fillEllipse(x: number, y: number, width: number, height: number, sendImmediately: boolean): void;
    selectSpriteSheet(index: number, sendImmediately: boolean): void;
    drawSprite(index: number, x: number, y: number, sendImmediately: boolean): void;
    parseMessage(messageType: DisplayMessageType, dataView: DataView): void;
    clear(): void;
    get mtu(): number;
    set mtu(newMtu: number);
}
export default DisplayManager;
