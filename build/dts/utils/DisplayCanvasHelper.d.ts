import Device from "../Device.ts";
import { DisplayBitmapColorPair, DisplayBrightness, DisplaySpriteColorPair, DisplayBitmap, DisplayWireframeEdge } from "../DisplayManager.ts";
import { DisplayAlignment, DisplayAlignmentDirection, DisplayContextState, DisplayContextStateKey, DisplayDirection, DisplaySegmentCap } from "./DisplayContextState.ts";
import { DisplaySpriteLines, DisplayManagerInterface } from "./DisplayManagerInterface.ts";
import { DisplayScaleDirection, DisplayColorRGB, DisplayCropDirection } from "./DisplayUtils.ts";
import EventDispatcher, { BoundEventListeners, Event, EventListenerMap, EventMap } from "./EventDispatcher.ts";
import { Vector2 } from "./MathUtils.ts";
import { DisplayContextCommand } from "./DisplayContextCommand.ts";
import { DisplaySprite, DisplaySpritePaletteSwap, DisplaySpriteSheet, DisplaySpriteSheetPalette, DisplaySpriteSheetPaletteSwap } from "./DisplaySpriteSheetUtils.ts";
import { Font } from "opentype.js";
export declare const DisplayCanvasHelperEventTypes: readonly ["contextState", "numberOfColors", "brightness", "color", "colorOpacity", "opacity", "resize", "update", "ready", "device", "deviceIsConnected", "deviceConnected", "deviceNotConnected", "deviceSpriteSheetUploadStart", "deviceSpriteSheetUploadProgress", "deviceSpriteSheetUploadComplete"];
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
        colorRGB: DisplayColorRGB;
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
    device: {
        device?: Device;
    };
    deviceIsConnected: {
        device: Device;
        isConnected: boolean;
    };
    deviceConnected: {
        device: Device;
    };
    deviceNotConnected: {
        device: Device;
    };
    deviceSpriteSheetUploadStart: {
        device: Device;
        spriteSheet: DisplaySpriteSheet;
        spriteSheetName: string;
    };
    deviceSpriteSheetUploadProgress: {
        device: Device;
        spriteSheet: DisplaySpriteSheet;
        spriteSheetName: string;
        progress: number;
    };
    deviceSpriteSheetUploadComplete: {
        device: Device;
        spriteSheet: DisplaySpriteSheet;
        spriteSheetName: string;
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
declare class DisplayCanvasHelper implements DisplayManagerInterface {
    #private;
    constructor();
    get addEventListener(): <T extends "contextState" | "numberOfColors" | "brightness" | "color" | "colorOpacity" | "opacity" | "resize" | "update" | "ready" | "device" | "deviceIsConnected" | "deviceConnected" | "deviceNotConnected" | "deviceSpriteSheetUploadStart" | "deviceSpriteSheetUploadProgress" | "deviceSpriteSheetUploadComplete">(type: T, listener: (event: {
        type: T;
        target: DisplayCanvasHelper;
        message: DisplayCanvasHelperEventMessages[T];
    }) => void, options?: {
        once?: boolean;
    }) => void;
    get removeEventListener(): <T extends "contextState" | "numberOfColors" | "brightness" | "color" | "colorOpacity" | "opacity" | "resize" | "update" | "ready" | "device" | "deviceIsConnected" | "deviceConnected" | "deviceNotConnected" | "deviceSpriteSheetUploadStart" | "deviceSpriteSheetUploadProgress" | "deviceSpriteSheetUploadComplete">(type: T, listener: (event: {
        type: T;
        target: DisplayCanvasHelper;
        message: DisplayCanvasHelperEventMessages[T];
    }) => void) => void;
    get waitForEvent(): <T extends "contextState" | "numberOfColors" | "brightness" | "color" | "colorOpacity" | "opacity" | "resize" | "update" | "ready" | "device" | "deviceIsConnected" | "deviceConnected" | "deviceNotConnected" | "deviceSpriteSheetUploadStart" | "deviceSpriteSheetUploadProgress" | "deviceSpriteSheetUploadComplete">(type: T) => Promise<{
        type: T;
        target: DisplayCanvasHelper;
        message: DisplayCanvasHelperEventMessages[T];
    }>;
    get removeEventListeners(): <T extends "contextState" | "numberOfColors" | "brightness" | "color" | "colorOpacity" | "opacity" | "resize" | "update" | "ready" | "device" | "deviceIsConnected" | "deviceConnected" | "deviceNotConnected" | "deviceSpriteSheetUploadStart" | "deviceSpriteSheetUploadProgress" | "deviceSpriteSheetUploadComplete">(type: T) => void;
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
    get deviceDisplayManager(): DisplayManagerInterface | undefined;
    set device(newDevice: Device | undefined);
    flushContextCommands(): Promise<void>;
    get numberOfColors(): number;
    set numberOfColors(newNumberOfColors: number);
    assertValidColorIndex(colorIndex: number): void;
    get colors(): string[];
    get opacities(): number[];
    get contextState(): DisplayContextState;
    show(sendImmediately?: boolean): Promise<void>;
    get interval(): number;
    set interval(newInterval: number);
    get isReady(): boolean;
    clear(sendImmediately?: boolean): Promise<void>;
    setColor(colorIndex: number, color: DisplayColorRGB | string, sendImmediately?: boolean): Promise<void>;
    setColorOpacity(colorIndex: number, opacity: number, sendImmediately?: boolean): Promise<void>;
    setOpacity(opacity: number, sendImmediately?: boolean): Promise<void>;
    saveContext(sendImmediately?: boolean): Promise<void>;
    restoreContext(sendImmediately?: boolean): Promise<void>;
    selectFillColor(fillColorIndex: number, sendImmediately?: boolean): Promise<void>;
    selectLineColor(lineColorIndex: number, sendImmediately?: boolean): Promise<void>;
    assertValidLineWidth(lineWidth: number): void;
    setLineWidth(lineWidth: number, sendImmediately?: boolean): Promise<void>;
    setAlignment(alignmentDirection: DisplayAlignmentDirection, alignment: DisplayAlignment, sendImmediately?: boolean): Promise<void>;
    setHorizontalAlignment(horizontalAlignment: DisplayAlignment, sendImmediately?: boolean): Promise<void>;
    setVerticalAlignment(verticalAlignment: DisplayAlignment, sendImmediately?: boolean): Promise<void>;
    resetAlignment(sendImmediately?: boolean): Promise<void>;
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
    get bitmapColorIndices(): number[];
    get bitmapColors(): string[];
    selectBitmapColor(bitmapColorIndex: number, colorIndex: number, sendImmediately?: boolean): Promise<void>;
    selectBitmapColors(bitmapColorPairs: DisplayBitmapColorPair[], sendImmediately?: boolean): Promise<void>;
    setBitmapColor(bitmapColorIndex: number, color: DisplayColorRGB | string, sendImmediately?: boolean): Promise<void>;
    setBitmapColorOpacity(bitmapColorIndex: number, opacity: number, sendImmediately?: boolean): Promise<void>;
    setBitmapScaleDirection(direction: DisplayScaleDirection, bitmapScale: number, sendImmediately?: boolean): Promise<void>;
    setBitmapScaleX(bitmapScaleX: number, sendImmediately?: boolean): Promise<void>;
    setBitmapScaleY(bitmapScaleY: number, sendImmediately?: boolean): Promise<void>;
    setBitmapScale(bitmapScale: number, sendImmediately?: boolean): Promise<void>;
    resetBitmapScale(sendImmediately?: boolean): Promise<void>;
    get spriteColorIndices(): number[];
    get spriteColors(): string[];
    get spriteBitmapColorIndices(): number[];
    get spriteBitmapColors(): string[];
    selectSpriteColor(spriteColorIndex: number, colorIndex: number, sendImmediately?: boolean): Promise<void>;
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
    drawPolygon(offsetX: number, offsetY: number, points: Vector2[], sendImmediately?: boolean): Promise<void>;
    drawWireframe(points: Vector2[], edges: DisplayWireframeEdge[], sendImmediately?: boolean): Promise<void>;
    drawSegment(startX: number, startY: number, endX: number, endY: number, sendImmediately?: boolean): Promise<void>;
    drawSegments(points: Vector2[], sendImmediately?: boolean): Promise<void>;
    drawArc(offsetX: number, offsetY: number, radius: number, startAngle: number, angleOffset: number, isRadians?: boolean, sendImmediately?: boolean): Promise<void>;
    drawArcEllipse(offsetX: number, offsetY: number, radiusX: number, radiusY: number, startAngle: number, angleOffset: number, isRadians?: boolean, sendImmediately?: boolean): Promise<void>;
    assertValidNumberOfColors(numberOfColors: number): void;
    assertValidBitmap(bitmap: DisplayBitmap): void;
    drawBitmap(offsetX: number, offsetY: number, bitmap: DisplayBitmap, sendImmediately?: boolean): Promise<void>;
    get spriteSheets(): Record<string, DisplaySpriteSheet>;
    get spriteSheetIndices(): Record<string, number>;
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
    drawSpriteFromSpriteSheet(offsetX: number, offsetY: number, spriteName: string, spriteSheet: DisplaySpriteSheet, paletteName?: string, sendImmediately?: boolean): Promise<void>;
    drawSpritesString(offsetX: number, offsetY: number, string: string, requireAll?: boolean, sendImmediately?: boolean): Promise<void>;
    stringToSpriteLines(string: string, requireAll?: boolean): DisplaySpriteLines;
    get brightness(): "veryLow" | "low" | "medium" | "high" | "veryHigh";
    setBrightness(newBrightness: DisplayBrightness, sendImmediately?: boolean): Promise<void>;
    runContextCommand(command: DisplayContextCommand, sendImmediately?: boolean): Promise<void>;
    runContextCommands(commands: DisplayContextCommand[], sendImmediately?: boolean): Promise<void>;
    previewSprite(offsetX: number, offsetY: number, sprite: DisplaySprite, spriteSheet: DisplaySpriteSheet): void;
    assertSpriteSheetPalette(paletteName: string): void;
    assertSpriteSheetPaletteSwap(paletteSwapName: string): void;
    assertSpritePaletteSwap(spriteName: string, paletteSwapName: string): void;
    selectSpriteSheetPalette(paletteName: string, offset?: number, sendImmediately?: boolean): Promise<void>;
    selectSpriteSheetPaletteSwap(paletteSwapName: string, offset?: number, sendImmediately?: boolean): Promise<void>;
    selectSpritePaletteSwap(spriteName: string, paletteSwapName: string, offset?: number, sendImmediately?: boolean): Promise<void>;
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
    serializeSpriteSheet(spriteSheet: DisplaySpriteSheet): ArrayBuffer;
    fontToSpriteSheet(font: Font, fontSize: number, spriteSheetName?: string): Promise<DisplaySpriteSheet>;
}
export default DisplayCanvasHelper;
