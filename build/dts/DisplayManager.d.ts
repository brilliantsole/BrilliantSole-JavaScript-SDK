import Device, { SendMessageCallback } from "./Device.ts";
import EventDispatcher from "./utils/EventDispatcher.ts";
import { Vector2 } from "./utils/MathUtils.ts";
import { DisplayScaleDirection, DisplayColorRGB, DisplayCropDirection } from "./utils/DisplayUtils.ts";
import { DisplayAlignment, DisplayAlignmentDirection, DisplayContextState, DisplayContextStateKey, DisplayDirection, DisplaySegmentCap, PartialDisplayContextState } from "./utils/DisplayContextState.ts";
import { DisplayContextCommand } from "./utils/DisplayContextCommand.ts";
import { DisplayManagerInterface } from "./utils/DisplayManagerInterface.ts";
import { SendFileCallback } from "./FileTransferManager.ts";
import { DisplaySprite, DisplaySpritePaletteSwap, DisplaySpriteSheetPalette, DisplaySpriteSheetPaletteSwap, DisplaySpriteSheet, DisplaySpriteLines } from "./utils/DisplaySpriteSheetUtils.ts";
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
export declare const DisplayMessageTypes: readonly ["isDisplayAvailable", "displayStatus", "displayInformation", "displayCommand", "getDisplayBrightness", "setDisplayBrightness", "displayContextCommands", "displayReady", "getSpriteSheetName", "setSpriteSheetName", "spriteSheetIndex"];
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
export type DisplayWireframeEdge = {
    startIndex: number;
    endIndex: number;
};
export type DisplaySegment = {
    start: Vector2;
    end: Vector2;
};
export type DisplayWireframe = {
    points: Vector2[];
    edges: DisplayWireframeEdge[];
};
export declare const DisplayBezierCurveTypes: readonly ["segment", "quadratic", "cubic"];
export type DisplayBezierCurveType = (typeof DisplayBezierCurveTypes)[number];
export type DisplayBezierCurve = {
    type: DisplayBezierCurveType;
    controlPoints: Vector2[];
};
export declare const displayCurveTypeBitWidth = 2;
export declare const displayCurveTypesPerByte: number;
export declare const DisplayPointDataTypes: readonly ["int8", "int16", "float"];
export type DisplayPointDataType = (typeof DisplayPointDataTypes)[number];
export declare const displayPointDataTypeToSize: Record<DisplayPointDataType, number>;
export declare const displayPointDataTypeToRange: Record<DisplayPointDataType, {
    min: number;
    max: number;
}>;
export declare const DisplayInformationValues: {
    type: readonly ["none", "generic", "monocularLeft", "monocularRight", "binocular"];
    pixelDepth: readonly ["1", "2", "4"];
};
export declare const RequiredDisplayMessageTypes: DisplayMessageType[];
export declare const DisplayEventTypes: readonly ["isDisplayAvailable", "displayStatus", "displayInformation", "displayCommand", "getDisplayBrightness", "setDisplayBrightness", "displayContextCommands", "displayReady", "getSpriteSheetName", "setSpriteSheetName", "spriteSheetIndex", "displayContextState", "displayColor", "displayColorOpacity", "displayOpacity", "displaySpriteSheetUploadStart", "displaySpriteSheetUploadProgress", "displaySpriteSheetUploadComplete"];
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
    getSpriteSheetName: {
        spriteSheetName: string;
    };
    displaySpriteSheetUploadStart: {
        spriteSheetName: string;
        spriteSheet: DisplaySpriteSheet;
    };
    displaySpriteSheetUploadProgress: {
        spriteSheetName: string;
        spriteSheet: DisplaySpriteSheet;
        progress: number;
    };
    displaySpriteSheetUploadComplete: {
        spriteSheetName: string;
        spriteSheet: DisplaySpriteSheet;
    };
    displayContextCommands: {};
}
export type DisplayEventDispatcher = EventDispatcher<Device, DisplayEventType, DisplayEventMessages>;
export type SendDisplayMessageCallback = SendMessageCallback<DisplayMessageType>;
export declare const MinSpriteSheetNameLength = 1;
export declare const MaxSpriteSheetNameLength = 30;
export type DisplayBitmap = {
    width: number;
    height: number;
    numberOfColors: number;
    pixels: number[];
};
declare class DisplayManager implements DisplayManagerInterface {
    #private;
    constructor();
    sendMessage: SendDisplayMessageCallback;
    eventDispatcher: DisplayEventDispatcher;
    get waitForEvent(): <T extends "spriteSheetIndex" | "isDisplayAvailable" | "displayStatus" | "displayInformation" | "displayCommand" | "getDisplayBrightness" | "setDisplayBrightness" | "displayContextCommands" | "displayReady" | "getSpriteSheetName" | "setSpriteSheetName" | "displayContextState" | "displayColor" | "displayColorOpacity" | "displayOpacity" | "displaySpriteSheetUploadStart" | "displaySpriteSheetUploadProgress" | "displaySpriteSheetUploadComplete">(type: T) => Promise<{
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
    get displayInformation(): DisplayInformation;
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
    assertValidColorIndex(colorIndex: number): void;
    get colors(): string[];
    setColor(colorIndex: number, color: DisplayColorRGB | string, sendImmediately?: boolean): Promise<void>;
    get opacities(): number[];
    setColorOpacity(colorIndex: number, opacity: number, sendImmediately?: boolean): Promise<void>;
    setOpacity(opacity: number, sendImmediately?: boolean): Promise<void>;
    saveContext(sendImmediately?: boolean): Promise<void>;
    restoreContext(sendImmediately?: boolean): Promise<void>;
    selectFillColor(fillColorIndex: number, sendImmediately?: boolean): Promise<void>;
    selectBackgroundColor(backgroundColorIndex: number, sendImmediately?: boolean): Promise<void>;
    selectLineColor(lineColorIndex: number, sendImmediately?: boolean): Promise<void>;
    setIgnoreFill(ignoreFill: boolean, sendImmediately?: boolean): Promise<void>;
    setIgnoreLine(ignoreLine: boolean, sendImmediately?: boolean): Promise<void>;
    setFillBackground(fillBackground: boolean, sendImmediately?: boolean): Promise<void>;
    assertValidLineWidth(lineWidth: number): void;
    setLineWidth(lineWidth: number, sendImmediately?: boolean): Promise<void>;
    setAlignment(alignmentDirection: DisplayAlignmentDirection, alignment: DisplayAlignment, sendImmediately?: boolean): Promise<void>;
    setHorizontalAlignment(horizontalAlignment: DisplayAlignment, sendImmediately?: boolean): Promise<void>;
    setVerticalAlignment(verticalAlignment: DisplayAlignment, sendImmediately?: boolean): Promise<void>;
    resetAlignment(sendImmediately?: boolean): Promise<void>;
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
    setSpriteScaleDirection(direction: DisplayScaleDirection, spriteScale: number, sendImmediately?: boolean): Promise<void>;
    setSpriteScaleX(spriteScaleX: number, sendImmediately?: boolean): Promise<void>;
    setSpriteScaleY(spriteScaleY: number, sendImmediately?: boolean): Promise<void>;
    setSpriteScale(spriteScale: number, sendImmediately?: boolean): Promise<void>;
    resetSpriteScale(sendImmediately?: boolean): Promise<void>;
    setSpritesLineHeight(spritesLineHeight: number, sendImmediately?: boolean): Promise<void>;
    setSpritesDirectionGeneric(direction: DisplayDirection, isOrthogonal: boolean, sendImmediately?: boolean): Promise<void>;
    setSpritesDirection(spritesDirection: DisplayDirection, sendImmediately?: boolean): Promise<void>;
    setSpritesLineDirection(spritesLineDirection: DisplayDirection, sendImmediately?: boolean): Promise<void>;
    setSpritesSpacingGeneric(spacing: number, isOrthogonal: boolean, sendImmediately?: boolean): Promise<void>;
    setSpritesSpacing(spritesSpacing: number, sendImmediately?: boolean): Promise<void>;
    setSpritesLineSpacing(spritesSpacing: number, sendImmediately?: boolean): Promise<void>;
    setSpritesAlignmentGeneric(alignment: DisplayAlignment, isOrthogonal: boolean, sendImmediately?: boolean): Promise<void>;
    setSpritesAlignment(spritesAlignment: DisplayAlignment, sendImmediately?: boolean): Promise<void>;
    setSpritesLineAlignment(spritesLineAlignment: DisplayAlignment, sendImmediately?: boolean): Promise<void>;
    clearRect(x: number, y: number, width: number, height: number, sendImmediately?: boolean): Promise<void>;
    drawRect(offsetX: number, offsetY: number, width: number, height: number, sendImmediately?: boolean): Promise<void>;
    drawRoundRect(offsetX: number, offsetY: number, width: number, height: number, borderRadius: number, sendImmediately?: boolean): Promise<void>;
    drawCircle(offsetX: number, offsetY: number, radius: number, sendImmediately?: boolean): Promise<void>;
    drawEllipse(offsetX: number, offsetY: number, radiusX: number, radiusY: number, sendImmediately?: boolean): Promise<void>;
    drawRegularPolygon(offsetX: number, offsetY: number, radius: number, numberOfSides: number, sendImmediately?: boolean): Promise<void>;
    drawPolygon(points: Vector2[], sendImmediately?: boolean): Promise<void>;
    drawWireframe(wireframe: DisplayWireframe, sendImmediately?: boolean): Promise<void>;
    drawCurve(curveType: DisplayBezierCurveType, controlPoints: Vector2[], sendImmediately?: boolean): Promise<void>;
    drawCurves(curveType: DisplayBezierCurveType, controlPoints: Vector2[], sendImmediately?: boolean): Promise<void>;
    drawQuadraticBezierCurve(controlPoints: Vector2[], sendImmediately?: boolean): Promise<void>;
    drawQuadraticBezierCurves(controlPoints: Vector2[], sendImmediately?: boolean): Promise<void>;
    drawCubicBezierCurve(controlPoints: Vector2[], sendImmediately?: boolean): Promise<void>;
    drawCubicBezierCurves(controlPoints: Vector2[], sendImmediately?: boolean): Promise<void>;
    _drawPath(isClosed: boolean, curves: DisplayBezierCurve[], sendImmediately?: boolean): Promise<void>;
    drawPath(curves: DisplayBezierCurve[], sendImmediately?: boolean): Promise<void>;
    drawClosedPath(curves: DisplayBezierCurve[], sendImmediately?: boolean): Promise<void>;
    drawSegment(startX: number, startY: number, endX: number, endY: number, sendImmediately?: boolean): Promise<void>;
    drawSegments(points: Vector2[], sendImmediately?: boolean): Promise<void>;
    drawArc(offsetX: number, offsetY: number, radius: number, startAngle: number, angleOffset: number, isRadians?: boolean, sendImmediately?: boolean): Promise<void>;
    drawArcEllipse(offsetX: number, offsetY: number, radiusX: number, radiusY: number, startAngle: number, angleOffset: number, isRadians?: boolean, sendImmediately?: boolean): Promise<void>;
    assertValidNumberOfColors(numberOfColors: number): void;
    assertValidBitmap(bitmap: DisplayBitmap, checkSize?: boolean): void;
    drawBitmap(offsetX: number, offsetY: number, bitmap: DisplayBitmap, sendImmediately?: boolean): Promise<void>;
    imageToBitmap(image: HTMLImageElement, width: number, height: number, numberOfColors?: number): Promise<{
        blob: Blob;
        bitmap: DisplayBitmap;
    }>;
    quantizeImage(image: HTMLImageElement, width: number, height: number, numberOfColors: number): Promise<{
        blob: Blob;
        colors: string[];
        colorIndices: number[];
    }>;
    resizeAndQuantizeImage(image: HTMLImageElement, width: number, height: number, numberOfColors: number, colors?: string[]): Promise<{
        blob: Blob;
        colors: string[];
        colorIndices: number[];
    }>;
    runContextCommand(command: DisplayContextCommand, sendImmediately?: boolean): Promise<void>;
    runContextCommands(commands: DisplayContextCommand[], sendImmediately?: boolean): Promise<void>;
    get isReady(): boolean;
    get spriteSheets(): Record<string, DisplaySpriteSheet>;
    get spriteSheetIndices(): Record<string, number>;
    get pendingSpriteSheet(): DisplaySpriteSheet | undefined;
    get pendingSpriteSheetName(): string | undefined;
    sendFile: SendFileCallback;
    serializeSpriteSheet(spriteSheet: DisplaySpriteSheet): ArrayBuffer;
    uploadSpriteSheet(spriteSheet: DisplaySpriteSheet): Promise<void>;
    uploadSpriteSheets(spriteSheets: DisplaySpriteSheet[]): Promise<void>;
    assertLoadedSpriteSheet(spriteSheetName: string): void;
    assertSelectedSpriteSheet(spriteSheetName: string): void;
    assertAnySelectedSpriteSheet(): void;
    assertSprite(spriteName: string): void;
    getSprite(spriteName: string): DisplaySprite | undefined;
    getSpriteSheetPalette(paletteName: string): DisplaySpriteSheetPalette | undefined;
    getSpriteSheetPaletteSwap(paletteSwapName: string): DisplaySpriteSheetPaletteSwap | undefined;
    getSpritePaletteSwap(spriteName: string, paletteSwapName: string): DisplaySpritePaletteSwap | undefined;
    get selectedSpriteSheet(): DisplaySpriteSheet | undefined;
    get selectedSpriteSheetName(): string | undefined;
    selectSpriteSheet(spriteSheetName: string, sendImmediately?: boolean): Promise<void>;
    drawSprite(offsetX: number, offsetY: number, spriteName: string, sendImmediately?: boolean): Promise<void>;
    drawSprites(offsetX: number, offsetY: number, spriteLines: DisplaySpriteLines, sendImmediately?: boolean): Promise<void>;
    drawSpritesString(offsetX: number, offsetY: number, string: string, requireAll?: boolean, maxLineBreadth?: number, separators?: string[], sendImmediately?: boolean): Promise<void>;
    stringToSpriteLines(string: string, requireAll?: boolean, maxLineBreadth?: number, separators?: string[]): DisplaySpriteLines;
    stringToSpriteLinesMetrics(string: string, requireAll?: boolean, maxLineBreadth?: number, separators?: string[]): import("./utils/DisplaySpriteSheetUtils.ts").DisplaySpriteLinesMetrics;
    drawSpriteFromSpriteSheet(offsetX: number, offsetY: number, spriteName: string, spriteSheet: DisplaySpriteSheet, paletteName?: string, sendImmediately?: boolean): Promise<void>;
    parseMessage(messageType: DisplayMessageType, dataView: DataView<ArrayBuffer>): void;
    assertSpriteSheetPalette(paletteName: string): void;
    assertSpriteSheetPaletteSwap(paletteSwapName: string): void;
    assertSpritePaletteSwap(spriteName: string, paletteSwapName: string): void;
    selectSpriteSheetPalette(paletteName: string, offset?: number, indicesOnly?: boolean, sendImmediately?: boolean): Promise<void>;
    selectSpriteSheetPaletteSwap(paletteSwapName: string, offset?: number, sendImmediately?: boolean): Promise<void>;
    selectSpritePaletteSwap(spriteName: string, paletteSwapName: string, offset?: number, sendImmediately?: boolean): Promise<void>;
    startSprite(offsetX: number, offsetY: number, width: number, height: number, sendImmediately?: boolean): Promise<void>;
    endSprite(sendImmediately?: boolean): Promise<void>;
    reset(): void;
    get mtu(): number;
    set mtu(newMtu: number);
    get isServerSide(): boolean;
    set isServerSide(newIsServerSide: boolean);
}
export default DisplayManager;
