import opentype, { Font } from 'opentype.js';
import * as tf from '@tensorflow/tfjs';
import * as _tensorflow_tfjs_core_dist_io_types from '@tensorflow/tfjs-core/dist/io/types';
import * as _tensorflow_tfjs_layers from '@tensorflow/tfjs-layers';
import * as ws from 'ws';
import * as dgram from 'dgram';

interface ConsoleLevelFlags {
    log?: boolean;
    warn?: boolean;
    error?: boolean;
    assert?: boolean;
    table?: boolean;
}
/** @throws {Error} if no console with type is found */
declare function setConsoleLevelFlagsForType(type: string, levelFlags: ConsoleLevelFlags): void;
declare function setAllConsoleLevelFlags(levelFlags: ConsoleLevelFlags): void;

declare const isInProduction: boolean;
declare const isInDev: boolean;
declare const isInBrowser: boolean;
declare let isInIframe: boolean;
declare const isWKWebView: boolean;
declare const isInNode: boolean;
declare let isBluetoothSupported: boolean;
declare const isInBluefy: boolean;
declare const isInWebBLE: boolean;
declare const isAndroid: boolean;
declare const isSafari: boolean;
declare const isIOS: boolean;
declare const isMac: boolean;

declare const environment_d_isAndroid: typeof isAndroid;
declare const environment_d_isBluetoothSupported: typeof isBluetoothSupported;
declare const environment_d_isIOS: typeof isIOS;
declare const environment_d_isInBluefy: typeof isInBluefy;
declare const environment_d_isInBrowser: typeof isInBrowser;
declare const environment_d_isInDev: typeof isInDev;
declare const environment_d_isInIframe: typeof isInIframe;
declare const environment_d_isInNode: typeof isInNode;
declare const environment_d_isInProduction: typeof isInProduction;
declare const environment_d_isInWebBLE: typeof isInWebBLE;
declare const environment_d_isMac: typeof isMac;
declare const environment_d_isSafari: typeof isSafari;
declare const environment_d_isWKWebView: typeof isWKWebView;
declare namespace environment_d {
  export {
    environment_d_isAndroid as isAndroid,
    environment_d_isBluetoothSupported as isBluetoothSupported,
    environment_d_isIOS as isIOS,
    environment_d_isInBluefy as isInBluefy,
    environment_d_isInBrowser as isInBrowser,
    environment_d_isInDev as isInDev,
    environment_d_isInIframe as isInIframe,
    environment_d_isInNode as isInNode,
    environment_d_isInProduction as isInProduction,
    environment_d_isInWebBLE as isInWebBLE,
    environment_d_isMac as isMac,
    environment_d_isSafari as isSafari,
    environment_d_isWKWebView as isWKWebView,
  };
}

interface Vector2 {
    x: number;
    y: number;
}
interface Vector3 extends Vector2 {
    z: number;
}
interface Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;
}
interface Euler {
    heading: number;
    pitch: number;
    roll: number;
    absolute?: boolean;
}

type ValueOf<T> = T[keyof T];
type AddProperty<T, Key extends string, Value> = T & {
    [K in Key]: Value;
};
type AddKeysAsPropertyToInterface<Interface, Key extends string> = {
    [Value in keyof Interface]: AddProperty<Interface[Value], Key, Value>;
};
type ExtendInterfaceValues<Interface, T> = {
    [Key in keyof Interface]: [Interface[Key]] extends [undefined] ? T : Interface[Key] & T;
};
type CapitalizeFirstLetter<S extends string> = S extends `${infer First}${infer Rest}` ? `${Uppercase<First>}${Rest}` : S;
type AddPrefix<P extends string, S extends string> = `${P}${CapitalizeFirstLetter<S>}`;
type AddPrefixToInterfaceKeys<Interface, P extends string> = {
    [Key in keyof Interface as `${AddPrefix<P, Key & string>}`]: Interface[Key];
};
type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;
type OneOrMany<T> = T | T[];

declare const wildcardEventType: "*";
type WildcardEventType = typeof wildcardEventType;
type EventMap<Target, EventType extends string, EventMessages extends Partial<Record<EventType, any>>> = {
    [T in keyof EventMessages]: {
        type: T;
        target: Target;
        message: EventMessages[T];
    };
} & {
    [wildcardEventType]: {
        [T in keyof EventMessages]: {
            type: T;
            target: Target;
            message: EventMessages[T];
        };
    }[keyof EventMessages];
};
type EventListenerMap<Target extends any, EventType extends string, EventMessages extends Partial<Record<EventType, any>>> = {
    [T in keyof EventMessages]: (event: {
        type: T;
        target: Target;
        message: EventMessages[T];
    }) => void;
} & {
    [wildcardEventType]: (event: Event<Target, EventType, EventMessages>) => void;
};
type Event<Target extends any, EventType extends string, EventMessages extends Partial<Record<EventType, any>>> = EventMap<Target, EventType, EventMessages>[keyof EventMessages];
type SpecificEvent<Target extends any, EventType extends string, EventMessages extends Partial<Record<EventType, any>>, SpecificEventType extends EventType> = {
    type: SpecificEventType;
    target: Target;
    message: EventMessages[SpecificEventType];
};
type ListenerEvent<Target, EventType extends string, EventMessages extends Partial<Record<EventType, any>>, T extends EventType | WildcardEventType> = T extends WildcardEventType ? Event<Target, EventType, EventMessages> : SpecificEvent<Target, EventType, EventMessages, T & EventType>;
type BoundEventListener<Target, EventType extends string, EventMessages extends Partial<Record<EventType, any>>, K extends EventType | typeof wildcardEventType> = K extends typeof wildcardEventType ? (event: Event<Target, EventType, EventMessages>) => void : (event: SpecificEvent<Target, EventType, EventMessages, K & EventType>) => void;
type BoundEventListeners<Target, EventType extends string, EventMessages extends Partial<Record<EventType, any>>> = {
    [K in EventType | typeof wildcardEventType]?: OneOrMany<BoundEventListener<Target, EventType, EventMessages, K>>;
};
type EventDispatcherTypes<Target, EventType extends string, EventMessages extends Partial<Record<EventType, any>>> = {
    Event: Event<Target, EventType, EventMessages>;
    EventMap: EventMap<Target, EventType, EventMessages>;
    EventListenerMap: EventListenerMap<Target, EventType, EventMessages>;
    BoundEventListeners: BoundEventListeners<Target, EventType, EventMessages>;
    EventDispatcher: EventDispatcher<Target, EventType, EventMessages>;
};
type EventDispatcherOptions = {
    once?: boolean;
    immediate?: boolean;
};
declare class EventDispatcher<Target extends any, EventType extends string, EventMessages extends Partial<Record<EventType, any>>> {
    #private;
    constructor(target: Target, validEventTypes: readonly EventType[]);
    addEventListener<T extends EventType | WildcardEventType>(type: T, listener: (event: ListenerEvent<Target, EventType, EventMessages, T>) => void, options?: EventDispatcherOptions): void;
    removeEventListener<T extends EventType | WildcardEventType>(type: T, listener: (event: ListenerEvent<Target, EventType, EventMessages, T>) => void): void;
    removeEventListeners<T extends EventType | WildcardEventType>(type: T): void;
    removeAllEventListeners(): void;
    dispatchEvent<T extends EventType>(type: T, message: EventMessages[T]): void;
    waitForEvent<T extends EventType>(type: T, options?: {
        immediate?: boolean;
    }): Promise<ListenerEvent<Target, EventType, EventMessages, T>>;
}

interface Range {
    min: number;
    max: number;
    span: number;
}
declare class RangeHelper {
    #private;
    get updatedAtLeastOnce(): boolean;
    get min(): number;
    get max(): number;
    get span(): number;
    get range(): Range;
    set min(newMin: number);
    set max(newMax: number);
    reset(): void;
    update(value: number): void;
    getNormalization(value: number, weightByRange?: boolean, clampValue?: boolean): number;
    updateAndGetNormalization(value: number, weightByRange?: boolean): number;
}

declare const DisplaySegmentCaps: readonly ["flat", "round"];
type DisplaySegmentCap = (typeof DisplaySegmentCaps)[number];
declare const DisplayAlignments: readonly ["start", "center", "end"];
type DisplayAlignment = (typeof DisplayAlignments)[number];
declare const DisplayAlignmentDirections: readonly ["horizontal", "vertical"];
type DisplayAlignmentDirection = (typeof DisplayAlignmentDirections)[number];
declare const DisplayDirections: readonly ["right", "left", "up", "down"];
type DisplayDirection = (typeof DisplayDirections)[number];
type DisplayContextState = {
    backgroundColorIndex: number;
    fillColorIndex: number;
    lineColorIndex: number;
    ignoreFill: boolean;
    ignoreLine: boolean;
    fillBackground: boolean;
    lineWidth: number;
    rotation: number;
    horizontalAlignment: DisplayAlignment;
    verticalAlignment: DisplayAlignment;
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
    bitmapColorIndices: number[];
    bitmapScaleX: number;
    bitmapScaleY: number;
    spriteColorIndices: number[];
    spriteScaleX: number;
    spriteScaleY: number;
    spriteSheetName?: string;
    spritesLineHeight: number;
    spritesDirection: DisplayDirection;
    spritesLineDirection: DisplayDirection;
    spritesSpacing: number;
    spritesLineSpacing: number;
    spritesAlignment: DisplayAlignment;
    spritesLineAlignment: DisplayAlignment;
};
type DisplayContextStateKey = keyof DisplayContextState;
type PartialDisplayContextState = Partial<DisplayContextState>;

interface DisplayManagerInterface {
    get isReady(): boolean;
    get contextState(): DisplayContextState;
    serializeContextState(): DisplayContextCommand[];
    parseContextCommands(dataView: DataView): Promise<void>;
    flushContextCommands(): Promise<void>;
    get brightness(): DisplayBrightness;
    setBrightness(newDisplayBrightness: DisplayBrightness, sendImmediately?: boolean): Promise<void>;
    show(sendImmediately?: boolean, waitUntilReady?: boolean, isSending?: boolean): Promise<void>;
    clear(sendImmediately?: boolean, waitUntilReady?: boolean, isSending?: boolean): Promise<void>;
    get colors(): string[];
    get numberOfColors(): number;
    setColor(colorIndex: number, color: DisplayColorRGBOrString, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    serializeColors(): DisplayContextCommand[];
    assertValidColorIndex(colorIndex: number): void;
    assertValidLineWidth(lineWidth: number): void;
    assertValidNumberOfColors(numberOfColors: number): void;
    assertValidBitmap(bitmap: DisplayBitmap, checkSize?: boolean): void;
    get opacities(): number[];
    setColorOpacity(colorIndex: number, opacity: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setOpacity(opacity: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    serializeOpacities(): DisplayContextCommand[];
    saveContext(sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    restoreContext(sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    selectFillColor(fillColorIndex: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    selectBackgroundColor(backgroundColorIndex: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    selectLineColor(lineColorIndex: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setLineWidth(lineWidth: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setIgnoreFill(ignoreFill: boolean, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setIgnoreLine(ignoreLine: boolean, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setFillBackground(fillBackground: boolean, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setAlignment(alignmentDirection: DisplayAlignmentDirection, alignment: DisplayAlignment, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setHorizontalAlignment(horizontalAlignment: DisplayAlignment, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setVerticalAlignment(verticalAlignment: DisplayAlignment, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    resetAlignment(sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setRotation(rotation: number, isRadians?: boolean, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    clearRotation(sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setSegmentStartCap(segmentStartCap: DisplaySegmentCap, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setSegmentEndCap(segmentEndCap: DisplaySegmentCap, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setSegmentCap(segmentCap: DisplaySegmentCap, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setSegmentStartRadius(segmentStartRadius: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setSegmentEndRadius(segmentEndRadius: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setSegmentRadius(segmentRadius: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setCrop(cropDirection: DisplayCropDirection, crop: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setCropTop(cropTop: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setCropRight(cropRight: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setCropBottom(cropBottom: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setCropLeft(cropLeft: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    clearCrop(sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setRotationCrop(cropDirection: DisplayCropDirection, crop: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setRotationCropTop(rotationCropTop: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setRotationCropRight(rotationCropRight: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setRotationCropBottom(rotationCropBottom: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setRotationCropLeft(rotationCropLeft: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    clearRotationCrop(sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    selectBitmapColor(bitmapColorIndex: number, colorIndex: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    get bitmapColorIndices(): number[];
    get bitmapColors(): string[];
    selectBitmapColors(bitmapColorPairs: DisplayBitmapColorPair[], sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setBitmapColor(bitmapColorIndex: number, color: DisplayColorRGBOrString, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setBitmapColorOpacity(bitmapColorIndex: number, opacity: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setBitmapScaleDirection(direction: DisplayScaleDirection, bitmapScale: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setBitmapScaleX(bitmapScaleX: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setBitmapScaleY(bitmapScaleY: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setBitmapScale(bitmapScale: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    resetBitmapScale(sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    selectSpriteColor(spriteColorIndex: number, colorIndex: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    get spriteColorIndices(): number[];
    get spriteColors(): string[];
    selectSpriteColors(spriteColorPairs: DisplaySpriteColorPair[], sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    resetSpriteColors(sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setSpriteColor(spriteColorIndex: number, color: DisplayColorRGBOrString, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setSpriteColorOpacity(spriteColorIndex: number, opacity: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setSpriteScaleDirection(direction: DisplayScaleDirection, spriteScale: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setSpriteScaleX(spriteScaleX: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setSpriteScaleY(spriteScaleY: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setSpriteScale(spriteScale: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    resetSpriteScale(sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setSpritesLineHeight(spritesLineHeight: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setSpritesDirectionGeneric(direction: DisplayDirection, isOrthogonal: boolean, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setSpritesDirection(spritesDirection: DisplayDirection, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setSpritesLineDirection(spritesLineDirection: DisplayDirection, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setSpritesSpacingGeneric(spacing: number, isOrthogonal: boolean, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setSpritesSpacing(spritesSpacing: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setSpritesLineSpacing(spritesSpacing: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setSpritesAlignmentGeneric(alignment: DisplayAlignment, isOrthogonal: boolean, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setSpritesAlignment(spritesAlignment: DisplayAlignment, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    setSpritesLineAlignment(spritesLineAlignment: DisplayAlignment, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    clearRect(x: number, y: number, width: number, height: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    drawRect(offsetX: number, offsetY: number, width: number, height: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    drawRoundRect(offsetX: number, offsetY: number, width: number, height: number, borderRadius: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    drawCircle(offsetX: number, offsetY: number, radius: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    drawEllipse(offsetX: number, offsetY: number, radiusX: number, radiusY: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    drawRegularPolygon(offsetX: number, offsetY: number, radius: number, numberOfSides: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    drawPolygon(points: Vector2[], sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    drawWireframe(wireframe: DisplayWireframe, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    drawCurve(curveType: DisplayBezierCurveType, controlPoints: Vector2[], sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    drawCurves(curveType: DisplayBezierCurveType, controlPoints: Vector2[], sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    drawQuadraticBezierCurve(controlPoints: Vector2[], sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    drawQuadraticBezierCurves(controlPoints: Vector2[], sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    drawCubicBezierCurve(controlPoints: Vector2[], sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    drawCubicBezierCurves(controlPoints: Vector2[], sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    _drawPath(isClosed: boolean, curves: DisplayBezierCurve[], sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    drawPath(curves: DisplayBezierCurve[], sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    drawClosedPath(curves: DisplayBezierCurve[], sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    drawSegment(startX: number, startY: number, endX: number, endY: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    drawSegments(points: Vector2[], sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    drawArc(offsetX: number, offsetY: number, radius: number, startAngle: number, angleOffset: number, isRadians?: boolean, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    drawArcEllipse(offsetX: number, offsetY: number, radiusX: number, radiusY: number, startAngle: number, angleOffset: number, isRadians?: boolean, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    drawBitmap(offsetX: number, offsetY: number, bitmap: DisplayBitmap, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    runContextCommand(command: DisplayContextCommand, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    runContextCommands(commands: DisplayContextCommand[], sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    imageToBitmap(image: HTMLImageElement, width: number, height: number, numberOfColors?: number): Promise<{
        blob: Blob;
        bitmap: DisplayBitmap;
    }>;
    quantizeImage(image: HTMLImageElement, width: number, height: number, numberOfColors: number, colors?: string[], canvas?: HTMLCanvasElement): Promise<{
        blob: Blob;
        colors: string[];
        colorIndices: number[];
    }>;
    resizeAndQuantizeImage(image: HTMLImageElement, width: number, height: number, numberOfColors: number, colors?: string[], canvas?: HTMLCanvasElement): Promise<{
        blob: Blob;
        colors: string[];
        colorIndices: number[];
    }>;
    uploadSpriteSheet(spriteSheet: DisplaySpriteSheet): Promise<void>;
    uploadSpriteSheets(spriteSheets: DisplaySpriteSheet[]): Promise<void>;
    selectSpriteSheet(spriteSheetName: string, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    drawSprite(offsetX: number, offsetY: number, spriteName: string, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    stringToSpriteLines(string: string, requireAll?: boolean, maxLineBreadth?: number, separators?: string[]): DisplaySpriteLines;
    stringToSpriteLinesMetrics(string: string, requireAll?: boolean, maxLineBreadth?: number, separators?: string[]): DisplaySpriteLinesMetrics;
    drawSprites(offsetX: number, offsetY: number, spriteLines: DisplaySpriteLines, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    drawSpritesString(offsetX: number, offsetY: number, string: string, requireAll?: boolean, maxLineBreadth?: number, separators?: string[], sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    assertLoadedSpriteSheet(spriteSheetName: string): void;
    assertSelectedSpriteSheet(spriteSheetName: string): void;
    assertAnySelectedSpriteSheet(): void;
    assertSprite(spriteName: string): void;
    getSprite(spriteName: string): DisplaySprite | undefined;
    getSpriteSheetPalette(paletteName: string): DisplaySpriteSheetPalette | undefined;
    getSpriteSheetPaletteSwap(paletteSwapName: string): DisplaySpriteSheetPaletteSwap | undefined;
    getSpritePaletteSwap(spriteName: string, paletteSwapName: string): DisplaySpritePaletteSwap | undefined;
    drawSpriteFromSpriteSheet(offsetX: number, offsetY: number, spriteName: string, spriteSheet: DisplaySpriteSheet, paletteName?: string, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    get selectedSpriteSheet(): DisplaySpriteSheet | undefined;
    get selectedSpriteSheetName(): string | undefined;
    spriteSheets: Record<string, DisplaySpriteSheet>;
    spriteSheetIndices: Record<string, number>;
    getSpriteSheetByIndex(index: number): DisplaySpriteSheet | undefined;
    assertSpriteSheetPalette(paletteName: string): void;
    assertSpriteSheetPaletteSwap(paletteSwapName: string): void;
    assertSpritePaletteSwap(spriteName: string, paletteSwapName: string): void;
    selectSpriteSheetPalette(paletteName: string, offset?: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    selectSpriteSheetPaletteSwap(paletteSwapName: string, offset?: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    selectSpritePaletteSwap(spriteName: string, paletteSwapName: string, offset?: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    serializeSpriteSheet(spriteSheet: DisplaySpriteSheet): ArrayBuffer;
    startSprite(offsetX: number, offsetY: number, width: number, height: number, sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    endSprite(sendImmediately?: boolean, isSending?: boolean): Promise<void>;
    clearContext(sendImmediately?: boolean, isSending?: boolean): Promise<void>;
}

declare const DisplayContextCommandTypes: readonly ["show", "clear", "setColor", "setColorOpacity", "setOpacity", "saveContext", "restoreContext", "selectBackgroundColor", "selectFillColor", "selectLineColor", "setIgnoreFill", "setIgnoreLine", "setFillBackground", "setLineWidth", "setRotation", "clearRotation", "setHorizontalAlignment", "setVerticalAlignment", "resetAlignment", "setSegmentStartCap", "setSegmentEndCap", "setSegmentCap", "setSegmentStartRadius", "setSegmentEndRadius", "setSegmentRadius", "setCropTop", "setCropRight", "setCropBottom", "setCropLeft", "clearCrop", "setRotationCropTop", "setRotationCropRight", "setRotationCropBottom", "setRotationCropLeft", "clearRotationCrop", "selectBitmapColor", "selectBitmapColors", "setBitmapScaleX", "setBitmapScaleY", "setBitmapScale", "resetBitmapScale", "selectSpriteColor", "selectSpriteColors", "resetSpriteColors", "setSpriteScaleX", "setSpriteScaleY", "setSpriteScale", "resetSpriteScale", "setSpritesLineHeight", "setSpritesDirection", "setSpritesLineDirection", "setSpritesSpacing", "setSpritesLineSpacing", "setSpritesAlignment", "setSpritesLineAlignment", "clearRect", "drawRect", "drawRoundRect", "drawCircle", "drawArc", "drawEllipse", "drawArcEllipse", "drawSegment", "drawSegments", "drawRegularPolygon", "drawPolygon", "drawWireframe", "drawQuadraticBezierCurve", "drawQuadraticBezierCurves", "drawCubicBezierCurve", "drawCubicBezierCurves", "drawPath", "drawClosedPath", "drawBitmap", "selectSpriteSheet", "drawSprite", "drawSprites", "startSprite", "endSprite", "clearContext"];
type DisplayContextCommandType = (typeof DisplayContextCommandTypes)[number];
declare const DisplaySpriteContextCommandTypes: readonly ["selectFillColor", "selectLineColor", "setIgnoreFill", "setIgnoreLine", "setLineWidth", "setRotation", "clearRotation", "setVerticalAlignment", "setHorizontalAlignment", "resetAlignment", "setSegmentStartCap", "setSegmentEndCap", "setSegmentCap", "setSegmentStartRadius", "setSegmentEndRadius", "setSegmentRadius", "setCropTop", "setCropRight", "setCropBottom", "setCropLeft", "clearCrop", "setRotationCropTop", "setRotationCropRight", "setRotationCropBottom", "setRotationCropLeft", "clearRotationCrop", "selectBitmapColor", "selectBitmapColors", "setBitmapScaleX", "setBitmapScaleY", "setBitmapScale", "resetBitmapScale", "selectSpriteColor", "selectSpriteColors", "resetSpriteColors", "setSpriteScaleX", "setSpriteScaleY", "setSpriteScale", "resetSpriteScale", "clearRect", "drawRect", "drawRoundRect", "drawCircle", "drawEllipse", "drawRegularPolygon", "drawPolygon", "drawWireframe", "drawQuadraticBezierCurve", "drawQuadraticBezierCurves", "drawCubicBezierCurve", "drawCubicBezierCurves", "drawPath", "drawClosedPath", "drawSegment", "drawSegments", "drawArc", "drawArcEllipse", "drawBitmap", "drawSprite"];
type DisplaySpriteContextCommandType = (typeof DisplaySpriteContextCommandTypes)[number];
interface BaseDisplayContextCommand {
    type: DisplayContextCommandType | "runDisplayContextCommands";
    hide?: boolean;
}
interface SimpleDisplayCommand extends BaseDisplayContextCommand {
    type: "show" | "clear" | "saveContext" | "restoreContext" | "clearRotation" | "clearCrop" | "clearRotationCrop" | "resetBitmapScale" | "resetSpriteColors" | "resetSpriteScale" | "resetAlignment" | "endSprite" | "clearContext";
}
interface SetDisplayColorCommand extends BaseDisplayContextCommand {
    type: "setColor";
    colorIndex: number;
    color: DisplayColorRGBOrString;
}
interface SetDisplayColorOpacityCommand extends BaseDisplayContextCommand {
    type: "setColorOpacity";
    colorIndex: number;
    opacity: number;
}
interface SetDisplayOpacityCommand extends BaseDisplayContextCommand {
    type: "setOpacity";
    opacity: number;
}
interface SetDisplayHorizontalAlignmentCommand extends BaseDisplayContextCommand {
    type: "setHorizontalAlignment";
    horizontalAlignment: DisplayAlignment;
}
interface SetDisplayVerticalAlignmentCommand extends BaseDisplayContextCommand {
    type: "setVerticalAlignment";
    verticalAlignment: DisplayAlignment;
}
interface SelectDisplayBackgroundColorCommand extends BaseDisplayContextCommand {
    type: "selectBackgroundColor";
    backgroundColorIndex: number;
}
interface SelectDisplayFillColorCommand extends BaseDisplayContextCommand {
    type: "selectFillColor";
    fillColorIndex: number;
}
interface SelectDisplayLineColorCommand extends BaseDisplayContextCommand {
    type: "selectLineColor";
    lineColorIndex: number;
}
interface SelectDisplayIgnoreFillCommand extends BaseDisplayContextCommand {
    type: "setIgnoreFill";
    ignoreFill: boolean;
}
interface SelectDisplayIgnoreLineCommand extends BaseDisplayContextCommand {
    type: "setIgnoreLine";
    ignoreLine: boolean;
}
interface SelectDisplayFillBackgroundCommand extends BaseDisplayContextCommand {
    type: "setFillBackground";
    fillBackground: boolean;
}
interface SetDisplayLineWidthCommand extends BaseDisplayContextCommand {
    type: "setLineWidth";
    lineWidth: number;
}
interface SetDisplayRotationCommand extends BaseDisplayContextCommand {
    type: "setRotation";
    rotation: number;
    isRadians?: boolean;
}
interface SetDisplaySegmentStartCapCommand extends BaseDisplayContextCommand {
    type: "setSegmentStartCap";
    segmentStartCap: DisplaySegmentCap;
}
interface SetDisplaySegmentEndCapCommand extends BaseDisplayContextCommand {
    type: "setSegmentEndCap";
    segmentEndCap: DisplaySegmentCap;
}
interface SetDisplaySegmentCapCommand extends BaseDisplayContextCommand {
    type: "setSegmentCap";
    segmentCap: DisplaySegmentCap;
}
interface SetDisplaySegmentStartRadiusCommand extends BaseDisplayContextCommand {
    type: "setSegmentStartRadius";
    segmentStartRadius: number;
}
interface SetDisplaySegmentEndRadiusCommand extends BaseDisplayContextCommand {
    type: "setSegmentEndRadius";
    segmentEndRadius: number;
}
interface SetDisplaySegmentRadiusCommand extends BaseDisplayContextCommand {
    type: "setSegmentRadius";
    segmentRadius: number;
}
interface SetDisplayCropTopCommand extends BaseDisplayContextCommand {
    type: "setCropTop";
    cropTop: number;
}
interface SetDisplayCropRightCommand extends BaseDisplayContextCommand {
    type: "setCropRight";
    cropRight: number;
}
interface SetDisplayCropBottomCommand extends BaseDisplayContextCommand {
    type: "setCropBottom";
    cropBottom: number;
}
interface SetDisplayCropLeftCommand extends BaseDisplayContextCommand {
    type: "setCropLeft";
    cropLeft: number;
}
interface SetDisplayRotationCropTopCommand extends BaseDisplayContextCommand {
    type: "setRotationCropTop";
    rotationCropTop: number;
}
interface SetDisplayRotationCropRightCommand extends BaseDisplayContextCommand {
    type: "setRotationCropRight";
    rotationCropRight: number;
}
interface SetDisplayRotationCropBottomCommand extends BaseDisplayContextCommand {
    type: "setRotationCropBottom";
    rotationCropBottom: number;
}
interface SetDisplayRotationCropLeftCommand extends BaseDisplayContextCommand {
    type: "setRotationCropLeft";
    rotationCropLeft: number;
}
interface SelectDisplayBitmapColorIndexCommand extends BaseDisplayContextCommand {
    type: "selectBitmapColor";
    bitmapColorIndex: number;
    colorIndex: number;
}
interface SelectDisplayBitmapColorIndicesCommand extends BaseDisplayContextCommand {
    type: "selectBitmapColors";
    bitmapColorPairs: DisplayBitmapColorPair[];
}
interface SetDisplayBitmapScaleXCommand extends BaseDisplayContextCommand {
    type: "setBitmapScaleX";
    bitmapScaleX: number;
}
interface SetDisplayBitmapScaleYCommand extends BaseDisplayContextCommand {
    type: "setBitmapScaleY";
    bitmapScaleY: number;
}
interface SetDisplayBitmapScaleCommand extends BaseDisplayContextCommand {
    type: "setBitmapScale";
    bitmapScale: number;
}
interface SelectDisplaySpriteColorIndexCommand extends BaseDisplayContextCommand {
    type: "selectSpriteColor";
    spriteColorIndex: number;
    colorIndex: number;
}
interface SelectDisplaySpriteColorIndicesCommand extends BaseDisplayContextCommand {
    type: "selectSpriteColors";
    spriteColorPairs: DisplaySpriteColorPair[];
}
interface SetDisplaySpriteScaleXCommand extends BaseDisplayContextCommand {
    type: "setSpriteScaleX";
    spriteScaleX: number;
}
interface SetDisplaySpriteScaleYCommand extends BaseDisplayContextCommand {
    type: "setSpriteScaleY";
    spriteScaleY: number;
}
interface SetDisplaySpriteScaleCommand extends BaseDisplayContextCommand {
    type: "setSpriteScale";
    spriteScale: number;
}
interface SetDisplaySpritesLineHeightCommand extends BaseDisplayContextCommand {
    type: "setSpritesLineHeight";
    spritesLineHeight: number;
}
interface SetDisplaySpritesDirectionCommand extends BaseDisplayContextCommand {
    type: "setSpritesDirection";
    spritesDirection: DisplayDirection;
}
interface SetDisplaySpritesLineDirectionCommand extends BaseDisplayContextCommand {
    type: "setSpritesLineDirection";
    spritesLineDirection: DisplayDirection;
}
interface SetDisplaySpritesSpacingCommand extends BaseDisplayContextCommand {
    type: "setSpritesSpacing";
    spritesSpacing: number;
}
interface SetDisplaySpritesLineSpacingCommand extends BaseDisplayContextCommand {
    type: "setSpritesLineSpacing";
    spritesLineSpacing: number;
}
interface SetDisplaySpritesAlignmentCommand extends BaseDisplayContextCommand {
    type: "setSpritesAlignment";
    spritesAlignment: DisplayAlignment;
}
interface SetDisplaySpritesLineAlignmentCommand extends BaseDisplayContextCommand {
    type: "setSpritesLineAlignment";
    spritesLineAlignment: DisplayAlignment;
}
interface BasePositionDisplayContextCommand extends BaseDisplayContextCommand {
    x: number;
    y: number;
}
interface BaseOffsetPositionDisplayContextCommand extends BaseDisplayContextCommand {
    offsetX: number;
    offsetY: number;
}
interface BaseSizeDisplayContextCommand extends BaseDisplayContextCommand {
    width: number;
    height: number;
}
interface BaseDisplayRectCommand extends BasePositionDisplayContextCommand, BaseSizeDisplayContextCommand {
}
interface BaseDisplayCenterRectCommand extends BaseOffsetPositionDisplayContextCommand, BaseSizeDisplayContextCommand {
}
interface ClearDisplayRectCommand extends BaseDisplayRectCommand {
    type: "clearRect";
}
interface DrawDisplayRectCommand extends BaseDisplayCenterRectCommand {
    type: "drawRect";
}
interface DrawDisplayRoundedRectCommand extends BaseOffsetPositionDisplayContextCommand, BaseSizeDisplayContextCommand {
    type: "drawRoundRect";
    borderRadius: number;
}
interface DrawDisplayCircleCommand extends BaseOffsetPositionDisplayContextCommand {
    type: "drawCircle";
    radius: number;
}
interface DrawDisplayEllipseCommand extends BaseOffsetPositionDisplayContextCommand {
    type: "drawEllipse";
    radiusX: number;
    radiusY: number;
}
interface DrawDisplayRegularPolygonCommand extends BaseOffsetPositionDisplayContextCommand {
    type: "drawRegularPolygon";
    radius: number;
    numberOfSides: number;
}
interface DrawDisplayPolygonCommand extends BaseDisplayContextCommand {
    type: "drawPolygon";
    points: Vector2[];
}
interface DrawDisplaySegmentCommand extends BaseDisplayContextCommand {
    type: "drawSegment";
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}
interface DrawDisplaySegmentsCommand extends BaseDisplayContextCommand {
    type: "drawSegments";
    points: Vector2[];
}
interface DrawDisplayBezierCurveCommand extends BaseDisplayContextCommand {
    type: "drawQuadraticBezierCurve" | "drawQuadraticBezierCurves" | "drawCubicBezierCurve" | "drawCubicBezierCurves";
    controlPoints: Vector2[];
}
interface DrawDisplayPathCommand extends BaseDisplayContextCommand {
    type: "drawPath" | "drawClosedPath";
    curves: DisplayBezierCurve[];
}
interface DrawDisplayWireframeCommand extends BaseDisplayContextCommand {
    type: "drawWireframe";
    wireframe: DisplayWireframe;
}
interface DrawDisplayArcCommand extends BaseOffsetPositionDisplayContextCommand {
    type: "drawArc";
    radius: number;
    startAngle: number;
    angleOffset: number;
    isRadians?: boolean;
}
interface DrawDisplayArcEllipseCommand extends BaseOffsetPositionDisplayContextCommand {
    type: "drawArcEllipse";
    radiusX: number;
    radiusY: number;
    startAngle: number;
    angleOffset: number;
    isRadians?: boolean;
}
interface DrawDisplayBitmapCommand extends BaseOffsetPositionDisplayContextCommand {
    type: "drawBitmap";
    bitmap: DisplayBitmap;
}
interface SelectDisplaySpriteSheetCommand extends BaseDisplayContextCommand {
    type: "selectSpriteSheet";
    spriteSheetIndex: number;
}
interface DrawDisplaySpriteCommand extends BaseOffsetPositionDisplayContextCommand {
    type: "drawSprite";
    spriteIndex: number;
    use2Bytes: boolean;
}
interface DrawDisplaySpritesCommand extends BaseOffsetPositionDisplayContextCommand {
    type: "drawSprites";
    spriteSerializedLines: DisplaySpriteSerializedLines;
}
interface StartDisplaySpriteCommand extends BaseDisplayCenterRectCommand {
    type: "startSprite";
}
type DisplayContextCommand = SimpleDisplayCommand | SetDisplayColorCommand | SetDisplayColorOpacityCommand | SetDisplayOpacityCommand | SelectDisplayBackgroundColorCommand | SelectDisplayFillColorCommand | SelectDisplayLineColorCommand | SetDisplayLineWidthCommand | SetDisplayRotationCommand | SetDisplaySegmentStartCapCommand | SetDisplaySegmentEndCapCommand | SetDisplaySegmentCapCommand | SetDisplaySegmentStartRadiusCommand | SetDisplaySegmentEndRadiusCommand | SetDisplaySegmentRadiusCommand | SetDisplayCropTopCommand | SetDisplayCropRightCommand | SetDisplayCropBottomCommand | SetDisplayCropLeftCommand | SetDisplayRotationCropTopCommand | SetDisplayRotationCropRightCommand | SetDisplayRotationCropBottomCommand | SetDisplayRotationCropLeftCommand | SelectDisplayBitmapColorIndexCommand | SelectDisplayBitmapColorIndicesCommand | SetDisplayBitmapScaleXCommand | SetDisplayBitmapScaleYCommand | SetDisplayBitmapScaleCommand | SelectDisplaySpriteColorIndexCommand | SelectDisplaySpriteColorIndicesCommand | SetDisplaySpriteScaleXCommand | SetDisplaySpriteScaleYCommand | SetDisplaySpriteScaleCommand | ClearDisplayRectCommand | DrawDisplayRectCommand | DrawDisplayRoundedRectCommand | DrawDisplayCircleCommand | DrawDisplayEllipseCommand | DrawDisplayRegularPolygonCommand | DrawDisplayPolygonCommand | DrawDisplaySegmentCommand | DrawDisplaySegmentsCommand | DrawDisplayArcCommand | DrawDisplayArcEllipseCommand | DrawDisplayBitmapCommand | DrawDisplaySpriteCommand | DrawDisplaySpritesCommand | SelectDisplaySpriteSheetCommand | SetDisplayHorizontalAlignmentCommand | SetDisplayVerticalAlignmentCommand | SetDisplaySpritesDirectionCommand | SetDisplaySpritesLineDirectionCommand | SetDisplaySpritesSpacingCommand | SetDisplaySpritesLineSpacingCommand | SetDisplaySpritesAlignmentCommand | SetDisplaySpritesLineAlignmentCommand | SetDisplaySpritesLineHeightCommand | DrawDisplayWireframeCommand | DrawDisplayBezierCurveCommand | DrawDisplayPathCommand | SelectDisplayIgnoreFillCommand | SelectDisplayIgnoreLineCommand | SelectDisplayFillBackgroundCommand | StartDisplaySpriteCommand;

type DisplaySpriteSubLine = {
    spriteSheetName: string;
    spriteNames: string[];
};
type DisplaySpriteLine = DisplaySpriteSubLine[];
type DisplaySpriteLines = DisplaySpriteLine[];
type DisplaySpriteSerializedSubLine = {
    spriteSheetIndex: number;
    spriteIndices: number[];
    use2Bytes: boolean;
};
type DisplaySpriteSerializedLine = DisplaySpriteSerializedSubLine[];
type DisplaySpriteSerializedLines = DisplaySpriteSerializedLine[];
type DisplaySpritePaletteSwap = {
    name: string;
    numberOfColors: number;
    spriteColorIndices: number[];
};
type DisplaySprite = {
    name: string;
    width: number;
    height: number;
    paletteSwaps?: DisplaySpritePaletteSwap[];
    commands: DisplayContextCommand[];
};
type DisplaySpriteSheetPaletteSwap = {
    name: string;
    numberOfColors: number;
    spriteColorIndices: number[];
};
type DisplaySpriteSheetPalette = {
    name: string;
    numberOfColors: number;
    colors: string[];
    opacities?: number[];
};
type DisplaySpriteSheet = {
    name: string;
    palettes?: DisplaySpriteSheetPalette[];
    paletteSwaps?: DisplaySpriteSheetPaletteSwap[];
    sprites: DisplaySprite[];
};
type FontToSpriteSheetOptions = {
    stroke?: boolean;
    strokeWidth?: number;
    unicodeOnly?: boolean;
    englishOnly?: boolean;
    usePath?: boolean;
    script?: string;
    string?: string;
    minSpriteY?: number;
    maxSpriteY?: number;
    maxSpriteHeight?: number;
    overrideMaxSpriteHeight?: boolean;
};
declare function parseFont(arrayBuffer: ArrayBuffer): Promise<opentype.Font>;
declare function getFontUnicodeRange(font: Font): Range | undefined;
declare const englishRegex: RegExp;
type FontMetrics = {
    maxSpriteHeight: number;
    maxSpriteY: number;
    minSpriteY: number;
};
declare function getFontMetrics(font: Font | Font[], fontSize: number, options?: FontToSpriteSheetOptions): FontMetrics;
declare function fontToSpriteSheet(font: Font | Font[], fontSize: number, spriteSheetName?: string, options?: FontToSpriteSheetOptions): Promise<DisplaySpriteSheet>;
declare function stringToSprites(string: string, spriteSheet: DisplaySpriteSheet, requireAll?: boolean): DisplaySprite[];
declare function getFontMaxHeight(font: Font, fontSize: number): number;
declare function getMaxSpriteSheetSize(spriteSheet: DisplaySpriteSheet): DisplaySize;
type DisplaySpriteLinesMetrics = {
    localSize: DisplaySize;
    size: DisplaySize;
    lineBreadths: number[];
    expandedSpritesLines: DisplaySprite[][];
    numberOfLines: number;
};

declare function concatenateArrayBuffers(...arrayBuffers: any[]): ArrayBuffer;
type FileLike = number[] | ArrayBuffer | DataView | URL | string | File | Buffer;

declare const FileTypes: readonly ["tflite", "wifiServerCert", "wifiServerKey", "spriteSheet", "cameraImage"];
type FileType = (typeof FileTypes)[number];
declare const FileTransferStatuses: readonly ["idle", "sending", "receiving"];
type FileTransferStatus = (typeof FileTransferStatuses)[number];
declare const FileTransferDirections: readonly ["sending", "receiving"];
type FileTransferDirection = (typeof FileTransferDirections)[number];
interface FileConfiguration {
    file: FileLike;
    type: FileType;
}
interface FileTransferEventMessages {
    getFileTypes: {
        fileTypes: FileType[];
    };
    maxFileLength: {
        maxFileLength: number;
    };
    getFileType: {
        fileType: FileType;
    };
    getFileLength: {
        fileLength: number;
    };
    getFileChecksum: {
        fileChecksum: number;
    };
    fileTransferStatus: {
        fileType: FileType;
        fileTransferStatus: FileTransferStatus;
    };
    getFileBlock: {
        fileTransferBlock: DataView;
    };
    fileTransferProgress: {
        fileType: FileType;
        progress: number;
    };
    fileTransferComplete: {
        fileType: FileType;
        direction: FileTransferDirection;
    };
    fileReceived: {
        fileType: FileType;
        file: File | Blob;
    };
}

declare const DefaultNumberOfDisplayColors = 16;
declare const DisplayStatuses: readonly ["awake", "asleep"];
type DisplayStatus = (typeof DisplayStatuses)[number];
declare const DisplayTypes: readonly ["none", "generic", "monocularLeft", "monocularRight", "binocular"];
type DisplayType = (typeof DisplayTypes)[number];
declare const DisplayPixelDepths: readonly ["1", "2", "4"];
type DisplayPixelDepth = (typeof DisplayPixelDepths)[number];
declare const DisplayBrightnesses: readonly ["veryLow", "low", "medium", "high", "veryHigh"];
type DisplayBrightness = (typeof DisplayBrightnesses)[number];
type DisplaySize = {
    width: number;
    height: number;
};
type DisplayInformation = {
    type: DisplayType;
    width: number;
    height: number;
    pixelDepth: DisplayPixelDepth;
};
type DisplayBitmapColorPair = {
    bitmapColorIndex: number;
    colorIndex: number;
};
type DisplaySpriteColorPair = {
    spriteColorIndex: number;
    colorIndex: number;
};
type DisplayWireframeEdge = {
    startIndex: number;
    endIndex: number;
};
type DisplayWireframe = {
    points: Vector2[];
    edges: DisplayWireframeEdge[];
};
declare const DisplayBezierCurveTypes: readonly ["segment", "quadratic", "cubic"];
type DisplayBezierCurveType = (typeof DisplayBezierCurveTypes)[number];
type DisplayBezierCurve = {
    type: DisplayBezierCurveType;
    controlPoints: Vector2[];
};
interface DisplayEventMessages {
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
    displayContextCommands: {
        displayContextCommands: DisplayContextCommand[];
    };
}
declare const MinSpriteSheetNameLength = 1;
declare const MaxSpriteSheetNameLength = 30;
type DisplayBitmap = {
    width: number;
    height: number;
    numberOfColors: number;
    pixels: number[];
};

declare const maxDisplayScale = 50;
declare const DisplayCropDirections: readonly ["top", "right", "bottom", "left"];
type DisplayCropDirection = (typeof DisplayCropDirections)[number];
declare function pixelDepthToNumberOfColors(pixelDepth: DisplayPixelDepth): number;
declare const DisplayScaleDirections: readonly ["x", "y", "all"];
type DisplayScaleDirection = (typeof DisplayScaleDirections)[number];
type DisplayColorRGB = {
    r: number;
    g: number;
    b: number;
};
type DisplayColorRGBOrString = DisplayColorRGB | string;
declare const displayCurveTypeToNumberOfControlPoints: Record<DisplayBezierCurveType, number>;
declare function isWireframePolygon({ points, edges, }: DisplayWireframe): Vector2[] | undefined;
declare function mergeWireframes(a: DisplayWireframe, b: DisplayWireframe): DisplayWireframe;
declare function intersectWireframes(a: DisplayWireframe, b: DisplayWireframe, ignoreDirection?: boolean): DisplayWireframe;

declare const LedTypes: readonly ["digitalSingle", "analogSingle", "digitalRGB", "analogRGB"];
type LedType = (typeof LedTypes)[number];
declare const LedValueTypes: readonly ["color", "brightness"];
type LedValueType = (typeof LedValueTypes)[number];
type LedValue = DisplayColorRGB | number;
type Led = {
    index: number;
    type: LedType;
    color: DisplayColorRGB;
    maxColor: DisplayColorRGB;
    isSingle: boolean;
    isRGB: boolean;
    isAnalog: boolean;
    isDigital: boolean;
};
interface LedEventMessages {
    getLedInformation: {
        leds: Led[];
    };
    setLed: {
        ledIndex: number;
        led: Led;
    };
}
interface LedColorConfiguration {
    index: number;
    color: DisplayColorRGBOrString;
}
interface LedBrightnessConfiguration {
    index: number;
    brightness: number;
}
type LedConfiguration = LedColorConfiguration | LedBrightnessConfiguration;

declare const MicrophoneCommands: readonly ["start", "stop", "vad", "inferencing"];
type MicrophoneCommand = (typeof MicrophoneCommands)[number];
declare const MicrophoneStatuses: readonly ["idle", "streaming", "vad", "inferencing"];
type MicrophoneStatus = (typeof MicrophoneStatuses)[number];
declare const MicrophoneConfigurationTypes: readonly ["sampleRate", "bitDepth"];
type MicrophoneConfigurationType = (typeof MicrophoneConfigurationTypes)[number];
declare const MicrophoneSampleRates: readonly ["8000", "16000"];
type MicrophoneSampleRate = (typeof MicrophoneSampleRates)[number];
declare const MicrophoneBitDepths: readonly ["8", "16"];
type MicrophoneBitDepth = (typeof MicrophoneBitDepths)[number];
type MicrophoneConfiguration = {
    sampleRate?: MicrophoneSampleRate;
    bitDepth?: MicrophoneBitDepth;
};
declare const MicrophoneConfigurationValues: {
    sampleRate: readonly ["8000", "16000"];
    bitDepth: readonly ["8", "16"];
};
interface MicrophoneEventMessages {
    microphoneStatus: {
        microphoneStatus: MicrophoneStatus;
        previousMicrophoneStatus: MicrophoneStatus;
    };
    getMicrophoneConfiguration: {
        microphoneConfiguration: MicrophoneConfiguration;
    };
    microphoneData: {
        samples: Float32Array;
        sampleRate: MicrophoneSampleRate;
        bitDepth: MicrophoneBitDepth;
    };
    isRecordingMicrophone: {
        isRecordingMicrophone: boolean;
    };
    microphoneRecording: {
        samples: Float32Array;
        configuration: MicrophoneConfiguration;
        blob: Blob;
        url: string;
    };
    startRecordingMicrophone: {};
    stopRecordingMicrophone: {};
}

declare const CameraCommands: readonly ["focus", "takePicture", "stop", "sleep", "wake"];
type CameraCommand = (typeof CameraCommands)[number];
declare const CameraStatuses: readonly ["idle", "focusing", "takingPicture", "asleep"];
type CameraStatus = (typeof CameraStatuses)[number];
declare const CameraDataTypes: readonly ["headerSize", "header", "imageSize", "image", "footerSize", "footer"];
type CameraDataType = (typeof CameraDataTypes)[number];
declare const CameraConfigurationTypes: readonly ["resolution", "qualityFactor", "shutter", "gain", "redGain", "greenGain", "blueGain", "autoWhiteBalanceEnabled", "autoGainEnabled", "exposure", "autoExposureEnabled", "autoExposureLevel", "brightness", "saturation", "contrast", "sharpness"];
type CameraConfigurationType = (typeof CameraConfigurationTypes)[number];
type CameraConfiguration = {
    [cameraConfigurationType in CameraConfigurationType]?: number;
};
type CameraConfigurationRanges = {
    [cameraConfigurationType in CameraConfigurationType]: {
        min: number;
        max: number;
    };
};
interface CameraImage {
    blob: Blob;
    url: string;
    arrayBuffer: ArrayBuffer;
    timestamp: number;
    latency: number;
}
interface CameraImageFrame extends CameraImage {
    duration: number;
    timeOffset: number;
}
interface CameraEventMessages {
    cameraStatus: {
        cameraStatus: CameraStatus;
        previousCameraStatus: CameraStatus;
    };
    getCameraConfiguration: {
        cameraConfiguration: CameraConfiguration;
    };
    cameraImageProgress: {
        progress: number;
        type: CameraDataType;
    };
    cameraImage: CameraImage;
    isRecordingCamera: {
        isRecordingCamera: boolean;
    };
    cameraRecording: {
        imageFrames: CameraImageFrame[];
        configuration: CameraConfiguration;
        blob: Blob;
        url: string;
    };
    autoPicture: {
        autoPicture: boolean;
    };
    startRecordingCamera: {};
    stopRecordingCamera: {};
}

declare const FirmwareStatuses: readonly ["idle", "uploading", "uploaded", "pending", "testing", "erasing"];
type FirmwareStatus = (typeof FirmwareStatuses)[number];
interface FirmwareImage {
    slot: number;
    active: boolean;
    confirmed: boolean;
    pending: boolean;
    permanent: boolean;
    bootable: boolean;
    version: string;
    hash?: Uint8Array;
    empty?: boolean;
}
interface FirmwareEventMessages {
    smp: {
        dataView: DataView<ArrayBuffer>;
    };
    firmwareImages: {
        firmwareImages: FirmwareImage[];
    };
    firmwareUploadProgress: {
        progress: number;
    };
    firmwareStatus: {
        firmwareStatus: FirmwareStatus;
    };
}

type CenterOfPressureModelData = {
    inputs: number[][];
    outputs: number[][];
};
declare class CenterOfPressureModel {
    #private;
    constructor();
    eventDispatcher: PressureSensorEventDispatcher;
    get dispatchEvent(): <T extends "pressureAutoRangeEnabled" | "pressureAutoRangeDisabled" | "pressureAutoRange" | "pressureMotionAutoRangeEnabled" | "pressureMotionAutoRangeDisabled" | "pressureMotionAutoRange" | "isRecordingPressureCalibrationData" | "pressureCalibrationDataRecordStart" | "pressureCalibrationDataRecordStop" | "pressureCalibrationDataRecordingProgress" | "isTrainingPressureCalibration" | "pressureCalibrationTrainStart" | "pressureCalibrationTrainEnd" | "pressureCalibrationTrainProgress" | "calibratedPressureModel">(type: T, message: PressureSensorEventMessages[T]) => void;
    get model(): tf.Sequential | undefined;
    get numberOfSensors(): number;
    set numberOfSensors(newNumberOfSensors: number);
    get data(): CenterOfPressureModelData;
    clearData(): void;
    onSensorData(pressureData: PressureData, euler: Euler): void;
    get numberOfSamples(): number;
    addData(inputs: number[], outputs: number[]): void;
    get isTrained(): boolean;
    get isTraining(): boolean;
    train(): Promise<void>;
    predict(pressureData: PressureData): {
        x: number;
        y: number;
    } | undefined;
    saveModel(handlerOrURL: tf.io.IOHandler | string, config?: tf.io.SaveConfig): Promise<boolean>;
    loadModel(pathOrIOHandlerOrFileList: string | tf.io.IOHandler | FileList, options?: tf.io.LoadOptions): Promise<boolean>;
}

declare class RangeHelper2 {
    #private;
    get updatedAtLeastOnce(): boolean;
    reset(): void;
    update(vector2: Vector2): void;
    getNormalization(vector2: Vector2, weightByRange?: boolean, clampValue?: boolean): Vector2;
    updateAndGetNormalization(vector2: Vector2, weightByRange?: boolean): Vector2;
}

type CenterOfPressure = Vector2;

type PressureSensorPosition = Vector2;

interface PressureSensorValue {
    position: PressureSensorPosition;
    rawValue: number;
    scaledValue: number;
    truncatedScaledValue: number;
    normalizedValue: number;
    weightedValue: number;
}
interface PressureData {
    sensors: PressureSensorValue[];
    scaledSum: number;
    normalizedSum: number;
    center?: CenterOfPressure;
    normalizedCenter?: CenterOfPressure;
    motionCenter?: CenterOfPressure;
    calibratedCenter?: CenterOfPressure;
}
interface PressureDataEventMessages {
    pressure: {
        pressure: PressureData;
    };
}
declare const PressureSensorEventTypes: readonly ["pressureAutoRangeEnabled", "pressureAutoRangeDisabled", "pressureAutoRange", "pressureMotionAutoRangeEnabled", "pressureMotionAutoRangeDisabled", "pressureMotionAutoRange", "isRecordingPressureCalibrationData", "pressureCalibrationDataRecordStart", "pressureCalibrationDataRecordStop", "pressureCalibrationDataRecordingProgress", "isTrainingPressureCalibration", "pressureCalibrationTrainStart", "pressureCalibrationTrainEnd", "pressureCalibrationTrainProgress", "calibratedPressureModel"];
type PressureSensorEventType = (typeof PressureSensorEventTypes)[number];
interface PressureSensorEventMessages {
    pressureAutoRangeEnabled: {};
    pressureAutoRangeDisabled: {};
    pressureAutoRange: {
        pressureAutoRange: boolean;
    };
    pressureMotionAutoRangeEnabled: {};
    pressureMotionAutoRangeDisabled: {};
    pressureMotionAutoRange: {
        pressureMotionAutoRange: boolean;
    };
    isRecordingPressureCalibrationData: {
        isRecordingPressureCalibrationData: boolean;
    };
    pressureCalibrationDataRecordStart: {};
    pressureCalibrationDataRecordStop: {};
    pressureCalibrationDataRecordingProgress: {
        numberOfSamples: number;
        data: CenterOfPressureModelData;
    };
    isTrainingPressureCalibration: {
        isTrainingPressureCalibration: boolean;
    };
    pressureCalibrationTrainStart: {};
    pressureCalibrationTrainEnd: {};
    pressureCalibrationTrainProgress: {
        pressureCalibrationTrainProgress: number;
        epoch: number;
        epochs: number;
        batchSize: number;
        loss: number;
    };
    calibratedPressureModel: {
        model: tf.Sequential;
        wasLoaded: boolean;
    };
}
type PressureSensorEventDispatcher = EventDispatcher<Device, PressureSensorEventType, PressureSensorEventMessages>;
declare const DefaultNumberOfPressureSensors = 8;

interface Activity {
    still: boolean;
    walking: boolean;
    running: boolean;
    bicycle: boolean;
    vehicle: boolean;
    tilting: boolean;
}
declare const DeviceOrientations: readonly ["portraitUpright", "landscapeLeft", "portraitUpsideDown", "landscapeRight", "unknown"];
type DeviceOrientation = (typeof DeviceOrientations)[number];
interface MotionSensorDataEventMessages {
    acceleration: {
        acceleration: Vector3;
    };
    gravity: {
        gravity: Vector3;
    };
    linearAcceleration: {
        linearAcceleration: Vector3;
    };
    gyroscope: {
        gyroscope: Vector3;
    };
    magnetometer: {
        magnetometer: Vector3;
    };
    gameRotation: {
        gameRotation: Quaternion;
        gameRotationEuler: Euler;
    };
    rotation: {
        rotation: Quaternion;
        rotationEuler: Euler;
    };
    orientation: {
        orientation: Euler;
    };
    stepDetector: {
        stepDetector: Object;
    };
    stepCounter: {
        stepCounter: number;
    };
    activity: {
        activity: Activity;
    };
    deviceOrientation: {
        deviceOrientation: DeviceOrientation;
    };
    tapDetector: {
        tapDetector: Object;
    };
}

interface BarometerSensorDataEventMessages {
    barometer: {
        barometer: number;
    };
}

interface Button {
    index: number;
    value: number;
    isDown: boolean;
}
interface ButtonSensorDataEventMessages {
    buttons: {
        buttons: Button[];
    };
}
interface ButtonSensorEventMessages {
    numberOfButtons: {
        numberOfButtons: number;
    };
    button: {
        button: Button;
    };
    buttonDown: {
        button: Button;
    };
    buttonUp: {
        button: Button;
        duration: number;
    };
}

interface Touch {
    index: number;
    value: number;
    isDown: boolean;
}
interface TouchSensorDataEventMessages {
    touches: {
        touches: Touch[];
    };
}
interface TouchSensorEventMessages {
    numberOfTouches: {
        numberOfTouches: number;
    };
    touch: {
        touch: Touch;
    };
    touchDown: {
        touch: Touch;
    };
    touchUp: {
        touch: Touch;
        duration: number;
    };
}

interface LightSensorDataEventMessages {
    light: {
        light: number;
    };
}

declare const SensorTypes: readonly ["pressure", "acceleration", "gravity", "linearAcceleration", "gyroscope", "magnetometer", "gameRotation", "rotation", "orientation", "activity", "stepCounter", "stepDetector", "deviceOrientation", "tapDetector", "barometer", "camera", "microphone", "buttons", "touches", "light"];
type SensorType = (typeof SensorTypes)[number];
declare const ContinuousSensorTypes: readonly ["pressure", "acceleration", "gravity", "linearAcceleration", "gyroscope", "magnetometer", "gameRotation", "rotation", "orientation", "barometer", "light"];
type ContinuousSensorType = (typeof ContinuousSensorTypes)[number];
interface BaseSensorDataEventMessage {
    timestamp: number;
    isLast: boolean;
}
type BaseSensorDataEventMessages = BarometerSensorDataEventMessages & MotionSensorDataEventMessages & PressureDataEventMessages & ButtonSensorDataEventMessages & TouchSensorDataEventMessages & LightSensorDataEventMessages;
type _SensorDataEventMessages = ExtendInterfaceValues<AddKeysAsPropertyToInterface<BaseSensorDataEventMessages, "sensorType">, BaseSensorDataEventMessage>;
type SensorDataEventMessage = ValueOf<_SensorDataEventMessages>;
interface AnySensorDataEventMessages {
    sensorData: SensorDataEventMessage;
    isLast: boolean;
}
type SensorDataEventMessages = (_SensorDataEventMessages & AnySensorDataEventMessages) & PressureSensorEventMessages & ButtonSensorEventMessages & TouchSensorEventMessages;
interface SensorMetaDataEventMessages {
}

declare const TfliteTasks: readonly ["classification", "regression"];
type TfliteTask = (typeof TfliteTasks)[number];
interface TfliteEventMessages {
    getTfliteName: {
        tfliteName: string;
    };
    getTfliteTask: {
        tfliteTask: TfliteTask;
    };
    getTfliteSampleRate: {
        tfliteSampleRate: number;
    };
    getTfliteSensorTypes: {
        tfliteSensorTypes: SensorType[];
    };
    tfliteIsReady: {
        tfliteIsReady: boolean;
    };
    getTfliteCaptureDelay: {
        tfliteCaptureDelay: number;
    };
    getTfliteThreshold: {
        tfliteThreshold: number;
    };
    getTfliteInferencingEnabled: {
        tfliteInferencingEnabled: boolean;
    };
    tfliteInference: {
        tfliteInference: TfliteInference;
    };
}
interface TfliteInference {
    timestamp: number;
    values: number[];
    maxValue?: number;
    maxIndex?: number;
    maxClass?: string;
    classValues?: {
        [key: string]: number;
    };
}
declare const TfliteSensorTypes: readonly ["pressure", "linearAcceleration", "gyroscope", "magnetometer", "microphone", "camera"];
type TfliteSensorType = (typeof TfliteSensorTypes)[number];
interface TfliteFileConfiguration extends FileConfiguration {
    type: "tflite";
    name: string;
    sensorTypes: TfliteSensorType[];
    task: TfliteTask;
    sampleRate: number;
    captureDelay?: number;
    threshold?: number;
    classes?: string[];
}

interface PnpId {
    source: "Bluetooth" | "USB";
    vendorId: number;
    productId: number;
    productVersion: number;
}
interface DeviceInformation {
    manufacturerName: string;
    modelNumber: string;
    softwareRevision: string;
    hardwareRevision: string;
    firmwareRevision: string;
    pnpId: PnpId;
    serialNumber: string;
}
interface DeviceInformationEventMessages {
    manufacturerName: {
        manufacturerName: string;
    };
    modelNumber: {
        modelNumber: string;
    };
    softwareRevision: {
        softwareRevision: string;
    };
    hardwareRevision: {
        hardwareRevision: string;
    };
    firmwareRevision: {
        firmwareRevision: string;
    };
    pnpId: {
        pnpId: PnpId;
    };
    serialNumber: {
        serialNumber: string;
    };
    deviceInformation: {
        deviceInformation: DeviceInformation;
    };
}

declare const ConnectionTypes: readonly ["webBluetooth", "noble", "client", "webSocket", "udp"];
type ConnectionType = (typeof ConnectionTypes)[number];
interface BaseConnectOptions {
    type?: ConnectionType;
}
interface WebBluetoothConnectOptions extends BaseConnectOptions {
    type: "webBluetooth";
}
interface BaseWifiConnectOptions extends BaseConnectOptions {
    ipAddress: string;
}
interface ClientConnectOptions extends BaseConnectOptions {
    type: "client";
    subType?: "noble" | "webSocket" | "udp";
}
interface WebSocketConnectOptions extends BaseWifiConnectOptions {
    type: "webSocket";
    isWifiSecure?: boolean;
}
interface UDPConnectOptions extends BaseWifiConnectOptions {
    type: "udp";
    receivePort?: number;
}
interface NobleConnectOptions extends BaseConnectOptions {
    type: "noble";
}
type ConnectOptions = {
    reconnect?: boolean;
} & (WebBluetoothConnectOptions | WebSocketConnectOptions | UDPConnectOptions | ClientConnectOptions | NobleConnectOptions);
declare const ConnectionStatuses: readonly ["notConnected", "connecting", "connected", "disconnecting"];
type ConnectionStatus = (typeof ConnectionStatuses)[number];
declare const ConnectionEventTypes: readonly ["notConnected", "connecting", "connected", "disconnecting", "connectionStatus", "isConnected"];
type ConnectionEventType = (typeof ConnectionEventTypes)[number];
interface ConnectionStatusEventMessages {
    notConnected: any;
    connecting: any;
    connected: any;
    disconnecting: any;
    connectionStatus: {
        connectionStatus: ConnectionStatus;
    };
    isConnected: {
        isConnected: boolean;
    };
}
interface TxMessage {
    type: TxRxMessageType;
    data?: ArrayBuffer;
}
declare const TxRxMessageTypes: readonly ["isCharging", "getBatteryCurrent", "getMtu", "getId", "getName", "setName", "getType", "setType", "getCurrentTime", "setCurrentTime", "getSensorConfiguration", "setSensorConfiguration", "getPressurePositions", "getSensorScalars", "sensorData", "getVibrationLocations", "triggerVibration", "getFileTypes", "maxFileLength", "getFileType", "setFileType", "getFileLength", "setFileLength", "getFileChecksum", "setFileChecksum", "setFileTransferCommand", "fileTransferStatus", "getFileBlock", "setFileBlock", "fileBytesTransferred", "getTfliteName", "setTfliteName", "getTfliteTask", "setTfliteTask", "getTfliteSampleRate", "setTfliteSampleRate", "getTfliteSensorTypes", "setTfliteSensorTypes", "tfliteIsReady", "getTfliteCaptureDelay", "setTfliteCaptureDelay", "getTfliteThreshold", "setTfliteThreshold", "getTfliteInferencingEnabled", "setTfliteInferencingEnabled", "tfliteInference", "isWifiAvailable", "getWifiSSID", "setWifiSSID", "getWifiPassword", "setWifiPassword", "getWifiConnectionEnabled", "setWifiConnectionEnabled", "isWifiConnected", "ipAddress", "isWifiSecure", "cameraStatus", "cameraCommand", "getCameraConfiguration", "setCameraConfiguration", "cameraData", "microphoneStatus", "microphoneCommand", "getMicrophoneConfiguration", "setMicrophoneConfiguration", "microphoneData", "isDisplayAvailable", "displayStatus", "displayInformation", "displayCommand", "getDisplayBrightness", "setDisplayBrightness", "displayContextCommands", "displayReady", "getSpriteSheetName", "setSpriteSheetName", "spriteSheetIndex", "getSensorCounts", "getLedInformation", "setLeds", "clearLeds"];
type TxRxMessageType = (typeof TxRxMessageTypes)[number];
declare const ConnectionMessageTypes: readonly ["batteryLevel", "manufacturerName", "modelNumber", "hardwareRevision", "firmwareRevision", "softwareRevision", "pnpId", "serialNumber", "rx", "tx", "isCharging", "getBatteryCurrent", "getMtu", "getId", "getName", "setName", "getType", "setType", "getCurrentTime", "setCurrentTime", "getSensorConfiguration", "setSensorConfiguration", "getPressurePositions", "getSensorScalars", "sensorData", "getVibrationLocations", "triggerVibration", "getFileTypes", "maxFileLength", "getFileType", "setFileType", "getFileLength", "setFileLength", "getFileChecksum", "setFileChecksum", "setFileTransferCommand", "fileTransferStatus", "getFileBlock", "setFileBlock", "fileBytesTransferred", "getTfliteName", "setTfliteName", "getTfliteTask", "setTfliteTask", "getTfliteSampleRate", "setTfliteSampleRate", "getTfliteSensorTypes", "setTfliteSensorTypes", "tfliteIsReady", "getTfliteCaptureDelay", "setTfliteCaptureDelay", "getTfliteThreshold", "setTfliteThreshold", "getTfliteInferencingEnabled", "setTfliteInferencingEnabled", "tfliteInference", "isWifiAvailable", "getWifiSSID", "setWifiSSID", "getWifiPassword", "setWifiPassword", "getWifiConnectionEnabled", "setWifiConnectionEnabled", "isWifiConnected", "ipAddress", "isWifiSecure", "cameraStatus", "cameraCommand", "getCameraConfiguration", "setCameraConfiguration", "cameraData", "microphoneStatus", "microphoneCommand", "getMicrophoneConfiguration", "setMicrophoneConfiguration", "microphoneData", "isDisplayAvailable", "displayStatus", "displayInformation", "displayCommand", "getDisplayBrightness", "setDisplayBrightness", "displayContextCommands", "displayReady", "getSpriteSheetName", "setSpriteSheetName", "spriteSheetIndex", "getSensorCounts", "getLedInformation", "setLeds", "clearLeds", "smp"];
type ConnectionMessageType = (typeof ConnectionMessageTypes)[number];
type ConnectionStatusCallback = (status: ConnectionStatus) => void;
type MessageReceivedCallback = (messageType: ConnectionMessageType, dataView: DataView<ArrayBuffer>) => void;
type MessagesReceivedCallback = () => void;
type MessageSentCallback = (message: TxMessage) => void;
type MessagesSentCallback = (messages: TxMessage[]) => void;
declare abstract class BaseConnectionManager {
    #private;
    abstract get bluetoothId(): string;
    onStatusUpdated?: ConnectionStatusCallback;
    onMessageReceived?: MessageReceivedCallback;
    onMessagesReceived?: MessagesReceivedCallback;
    onMessageSent?: MessageSentCallback;
    onMessagesSent?: MessagesSentCallback;
    protected get baseConstructor(): typeof BaseConnectionManager;
    static get isSupported(): boolean;
    get isSupported(): boolean;
    get canUpdateFirmware(): boolean;
    static type: ConnectionType;
    get type(): ConnectionType;
    constructor();
    get status(): "notConnected" | "connecting" | "connected" | "disconnecting";
    protected set status(newConnectionStatus: "notConnected" | "connecting" | "connected" | "disconnecting");
    get isConnected(): boolean;
    get isAvailable(): boolean;
    /** @throws {Error} if connected */
    protected assertIsNotConnected(): void;
    /** @throws {Error} if not connected */
    protected assertIsConnected(): void;
    /** @throws {Error} if not connected or is disconnecting */
    assertIsConnectedAndNotDisconnecting(): void;
    connect(): Promise<boolean>;
    get canReconnect(): boolean;
    reconnect(): Promise<boolean>;
    disconnect(): Promise<boolean>;
    sendSmpMessage(data: ArrayBuffer): Promise<void>;
    sendTxMessages(messages: TxMessage[] | undefined, sendImmediately?: boolean): Promise<void>;
    protected defaultMtu: number;
    mtu?: number;
    sendTxData(data: ArrayBuffer): Promise<void>;
    protected parseRxMessage(dataView: DataView<ArrayBuffer>): void;
    clear(): void;
    remove(): void;
}

type SensorConfiguration = {
    [sensorType in SensorType]?: number;
};
declare const MaxSensorRate: number;
declare const SensorRateStep = 5;
interface SensorConfigurationEventMessages {
    getSensorConfiguration: {
        sensorConfiguration: SensorConfiguration;
    };
}

declare const VibrationWaveformEffects: readonly ["none", "strongClick100", "strongClick60", "strongClick30", "sharpClick100", "sharpClick60", "sharpClick30", "softBump100", "softBump60", "softBump30", "doubleClick100", "doubleClick60", "tripleClick100", "softFuzz60", "strongBuzz100", "alert750ms", "alert1000ms", "strongClick1_100", "strongClick2_80", "strongClick3_60", "strongClick4_30", "mediumClick100", "mediumClick80", "mediumClick60", "sharpTick100", "sharpTick80", "sharpTick60", "shortDoubleClickStrong100", "shortDoubleClickStrong80", "shortDoubleClickStrong60", "shortDoubleClickStrong30", "shortDoubleClickMedium100", "shortDoubleClickMedium80", "shortDoubleClickMedium60", "shortDoubleSharpTick100", "shortDoubleSharpTick80", "shortDoubleSharpTick60", "longDoubleSharpClickStrong100", "longDoubleSharpClickStrong80", "longDoubleSharpClickStrong60", "longDoubleSharpClickStrong30", "longDoubleSharpClickMedium100", "longDoubleSharpClickMedium80", "longDoubleSharpClickMedium60", "longDoubleSharpTick100", "longDoubleSharpTick80", "longDoubleSharpTick60", "buzz100", "buzz80", "buzz60", "buzz40", "buzz20", "pulsingStrong100", "pulsingStrong60", "pulsingMedium100", "pulsingMedium60", "pulsingSharp100", "pulsingSharp60", "transitionClick100", "transitionClick80", "transitionClick60", "transitionClick40", "transitionClick20", "transitionClick10", "transitionHum100", "transitionHum80", "transitionHum60", "transitionHum40", "transitionHum20", "transitionHum10", "transitionRampDownLongSmooth2_100", "transitionRampDownLongSmooth1_100", "transitionRampDownMediumSmooth1_100", "transitionRampDownMediumSmooth2_100", "transitionRampDownShortSmooth1_100", "transitionRampDownShortSmooth2_100", "transitionRampDownLongSharp1_100", "transitionRampDownLongSharp2_100", "transitionRampDownMediumSharp1_100", "transitionRampDownMediumSharp2_100", "transitionRampDownShortSharp1_100", "transitionRampDownShortSharp2_100", "transitionRampUpLongSmooth1_100", "transitionRampUpLongSmooth2_100", "transitionRampUpMediumSmooth1_100", "transitionRampUpMediumSmooth2_100", "transitionRampUpShortSmooth1_100", "transitionRampUpShortSmooth2_100", "transitionRampUpLongSharp1_100", "transitionRampUpLongSharp2_100", "transitionRampUpMediumSharp1_100", "transitionRampUpMediumSharp2_100", "transitionRampUpShortSharp1_100", "transitionRampUpShortSharp2_100", "transitionRampDownLongSmooth1_50", "transitionRampDownLongSmooth2_50", "transitionRampDownMediumSmooth1_50", "transitionRampDownMediumSmooth2_50", "transitionRampDownShortSmooth1_50", "transitionRampDownShortSmooth2_50", "transitionRampDownLongSharp1_50", "transitionRampDownLongSharp2_50", "transitionRampDownMediumSharp1_50", "transitionRampDownMediumSharp2_50", "transitionRampDownShortSharp1_50", "transitionRampDownShortSharp2_50", "transitionRampUpLongSmooth1_50", "transitionRampUpLongSmooth2_50", "transitionRampUpMediumSmooth1_50", "transitionRampUpMediumSmooth2_50", "transitionRampUpShortSmooth1_50", "transitionRampUpShortSmooth2_50", "transitionRampUpLongSharp1_50", "transitionRampUpLongSharp2_50", "transitionRampUpMediumSharp1_50", "transitionRampUpMediumSharp2_50", "transitionRampUpShortSharp1_50", "transitionRampUpShortSharp2_50", "longBuzz100", "smoothHum50", "smoothHum40", "smoothHum30", "smoothHum20", "smoothHum10"];
type VibrationWaveformEffect = (typeof VibrationWaveformEffects)[number];

declare const VibrationLocations: readonly ["front", "rear", "left", "right"];
type VibrationLocation = (typeof VibrationLocations)[number];
declare const VibrationTypes: readonly ["waveformEffect", "waveform"];
type VibrationType = (typeof VibrationTypes)[number];
interface VibrationWaveformEffectSegment {
    effect?: VibrationWaveformEffect;
    delay?: number;
    loopCount?: number;
}
interface VibrationWaveformSegment {
    /** in ms */
    duration: number;
    /** [0, 1] */
    amplitude: number;
}
declare const MaxNumberOfVibrationWaveformEffectSegments = 8;
declare const MaxVibrationWaveformSegmentDuration = 2550;
declare const MaxVibrationWaveformEffectSegmentDelay = 1270;
declare const MaxVibrationWaveformEffectSegmentLoopCount = 3;
declare const MaxNumberOfVibrationWaveformSegments = 20;
declare const MaxVibrationWaveformEffectSequenceLoopCount = 6;
interface BaseVibrationConfiguration {
    type: VibrationType;
    locations?: VibrationLocation[];
}
interface VibrationWaveformEffectConfiguration extends BaseVibrationConfiguration {
    type: "waveformEffect";
    segments: VibrationWaveformEffectSegment[];
    loopCount?: number;
}
interface VibrationWaveformConfiguration extends BaseVibrationConfiguration {
    type: "waveform";
    segments: VibrationWaveformSegment[];
}
type VibrationConfiguration = VibrationWaveformEffectConfiguration | VibrationWaveformConfiguration;

declare const DeviceTypes: readonly ["leftInsole", "rightInsole", "leftGlove", "rightGlove", "glasses", "generic"];
type DeviceType = (typeof DeviceTypes)[number];
declare const Sides: readonly ["left", "right"];
type Side = (typeof Sides)[number];
declare const MinNameLength = 2;
declare const MaxNameLength = 30;
interface InformationEventMessages {
    isCharging: {
        isCharging: boolean;
    };
    getBatteryCurrent: {
        batteryCurrent: number;
    };
    getMtu: {
        mtu: number;
    };
    getId: {
        id: string;
    };
    getName: {
        name: string;
    };
    getType: {
        type: DeviceType;
    };
    getCurrentTime: {
        currentTime: number;
    };
}

declare const MinWifiSSIDLength = 1;
declare const MaxWifiSSIDLength = 32;
declare const MinWifiPasswordLength = 8;
declare const MaxWifiPasswordLength = 64;
interface WifiEventMessages {
    isWifiAvailable: {
        isWifiAvailable: boolean;
    };
    getWifiSSID: {
        wifiSSID: string;
    };
    getWifiPassword: {
        wifiPassword: string;
    };
    getEnableWifiConnection: {
        wifiConnectionEnabled: boolean;
    };
    isWifiConnected: {
        isWifiConnected: boolean;
    };
    ipAddress: {
        ipAddress?: string;
    };
}

declare const DeviceEventTypes: readonly ["connectionMessage", "notConnected", "connecting", "connected", "disconnecting", "connectionStatus", "isConnected", "rx", "tx", "batteryLevel", "isCharging", "getBatteryCurrent", "getMtu", "getId", "getName", "setName", "getType", "setType", "getCurrentTime", "setCurrentTime", "manufacturerName", "modelNumber", "hardwareRevision", "firmwareRevision", "softwareRevision", "pnpId", "serialNumber", "deviceInformation", "getSensorConfiguration", "setSensorConfiguration", "getPressurePositions", "getSensorScalars", "sensorData", "pressure", "acceleration", "gravity", "linearAcceleration", "gyroscope", "magnetometer", "gameRotation", "rotation", "orientation", "activity", "stepCounter", "stepDetector", "deviceOrientation", "tapDetector", "barometer", "camera", "microphone", "buttons", "touches", "light", "pressureAutoRangeEnabled", "pressureAutoRangeDisabled", "pressureAutoRange", "pressureMotionAutoRangeEnabled", "pressureMotionAutoRangeDisabled", "pressureMotionAutoRange", "isRecordingPressureCalibrationData", "pressureCalibrationDataRecordStart", "pressureCalibrationDataRecordStop", "pressureCalibrationDataRecordingProgress", "isTrainingPressureCalibration", "pressureCalibrationTrainStart", "pressureCalibrationTrainEnd", "pressureCalibrationTrainProgress", "calibratedPressureModel", "numberOfButtons", "button", "buttonDown", "buttonUp", "numberOfTouches", "touch", "touchDown", "touchUp", "getVibrationLocations", "triggerVibration", "getFileTypes", "maxFileLength", "getFileType", "setFileType", "getFileLength", "setFileLength", "getFileChecksum", "setFileChecksum", "setFileTransferCommand", "fileTransferStatus", "getFileBlock", "setFileBlock", "fileBytesTransferred", "fileTransferProgress", "fileTransferComplete", "fileReceived", "getTfliteName", "setTfliteName", "getTfliteTask", "setTfliteTask", "getTfliteSampleRate", "setTfliteSampleRate", "getTfliteSensorTypes", "setTfliteSensorTypes", "tfliteIsReady", "getTfliteCaptureDelay", "setTfliteCaptureDelay", "getTfliteThreshold", "setTfliteThreshold", "getTfliteInferencingEnabled", "setTfliteInferencingEnabled", "tfliteInference", "isWifiAvailable", "getWifiSSID", "setWifiSSID", "getWifiPassword", "setWifiPassword", "getWifiConnectionEnabled", "setWifiConnectionEnabled", "isWifiConnected", "ipAddress", "isWifiSecure", "cameraStatus", "cameraCommand", "getCameraConfiguration", "setCameraConfiguration", "cameraData", "cameraImageProgress", "cameraImage", "isRecordingCamera", "startRecordingCamera", "stopRecordingCamera", "cameraRecording", "autoPicture", "microphoneStatus", "microphoneCommand", "getMicrophoneConfiguration", "setMicrophoneConfiguration", "microphoneData", "isRecordingMicrophone", "startRecordingMicrophone", "stopRecordingMicrophone", "microphoneRecording", "isDisplayAvailable", "displayStatus", "displayInformation", "displayCommand", "getDisplayBrightness", "setDisplayBrightness", "displayContextCommands", "displayReady", "getSpriteSheetName", "setSpriteSheetName", "spriteSheetIndex", "displayContextState", "displayColor", "displayColorOpacity", "displayOpacity", "displaySpriteSheetUploadStart", "displaySpriteSheetUploadProgress", "displaySpriteSheetUploadComplete", "getSensorCounts", "getLedInformation", "setLeds", "clearLeds", "setLed", "smp", "firmwareImages", "firmwareUploadProgress", "firmwareStatus", "firmwareUploadComplete"];
type DeviceEventType = (typeof DeviceEventTypes)[number];
interface DeviceEventMessages extends ConnectionStatusEventMessages, DeviceInformationEventMessages, InformationEventMessages, SensorDataEventMessages, SensorConfigurationEventMessages, TfliteEventMessages, FileTransferEventMessages, WifiEventMessages, CameraEventMessages, MicrophoneEventMessages, DisplayEventMessages, SensorMetaDataEventMessages, LedEventMessages, FirmwareEventMessages {
    batteryLevel: {
        batteryLevel: number;
    };
    connectionMessage: {
        messageType: ConnectionMessageType;
        dataView: DataView<ArrayBuffer>;
    };
}
type DeviceEventDispatcherTypes = EventDispatcherTypes<Device, DeviceEventType, DeviceEventMessages>;
type DeviceEvent = DeviceEventDispatcherTypes["Event"];
type DeviceEventMap = DeviceEventDispatcherTypes["EventMap"];
type DeviceEventListenerMap = DeviceEventDispatcherTypes["EventListenerMap"];
type BoundDeviceEventListeners = DeviceEventDispatcherTypes["BoundEventListeners"];
declare class Device {
    #private;
    private static OnDevice;
    private static OnDeviceConnectionStatusUpdated;
    get bluetoothId(): string | undefined;
    get isAvailable(): boolean | undefined;
    constructor();
    get addEventListener(): <T extends "pressure" | "pressureAutoRangeEnabled" | "pressureAutoRangeDisabled" | "pressureAutoRange" | "pressureMotionAutoRangeEnabled" | "pressureMotionAutoRangeDisabled" | "pressureMotionAutoRange" | "isRecordingPressureCalibrationData" | "pressureCalibrationDataRecordStart" | "pressureCalibrationDataRecordStop" | "pressureCalibrationDataRecordingProgress" | "isTrainingPressureCalibration" | "pressureCalibrationTrainStart" | "pressureCalibrationTrainEnd" | "pressureCalibrationTrainProgress" | "calibratedPressureModel" | "getTfliteName" | "setTfliteName" | "getTfliteTask" | "setTfliteTask" | "getTfliteSampleRate" | "setTfliteSampleRate" | "getTfliteSensorTypes" | "setTfliteSensorTypes" | "tfliteIsReady" | "getTfliteCaptureDelay" | "setTfliteCaptureDelay" | "getTfliteThreshold" | "setTfliteThreshold" | "getTfliteInferencingEnabled" | "setTfliteInferencingEnabled" | "tfliteInference" | "acceleration" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation" | "orientation" | "activity" | "stepCounter" | "stepDetector" | "deviceOrientation" | "tapDetector" | "barometer" | "camera" | "microphone" | "buttons" | "touches" | "light" | "*" | "connectionMessage" | "notConnected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isConnected" | "rx" | "tx" | "batteryLevel" | "isCharging" | "getBatteryCurrent" | "getMtu" | "getId" | "getName" | "setName" | "getType" | "setType" | "getCurrentTime" | "setCurrentTime" | "manufacturerName" | "modelNumber" | "hardwareRevision" | "firmwareRevision" | "softwareRevision" | "pnpId" | "serialNumber" | "deviceInformation" | "getSensorConfiguration" | "setSensorConfiguration" | "getPressurePositions" | "getSensorScalars" | "sensorData" | "numberOfButtons" | "button" | "buttonDown" | "buttonUp" | "numberOfTouches" | "touch" | "touchDown" | "touchUp" | "getVibrationLocations" | "triggerVibration" | "getFileTypes" | "maxFileLength" | "getFileType" | "setFileType" | "getFileLength" | "setFileLength" | "getFileChecksum" | "setFileChecksum" | "setFileTransferCommand" | "fileTransferStatus" | "getFileBlock" | "setFileBlock" | "fileBytesTransferred" | "fileTransferProgress" | "fileTransferComplete" | "fileReceived" | "isWifiAvailable" | "getWifiSSID" | "setWifiSSID" | "getWifiPassword" | "setWifiPassword" | "getWifiConnectionEnabled" | "setWifiConnectionEnabled" | "isWifiConnected" | "ipAddress" | "isWifiSecure" | "cameraStatus" | "cameraCommand" | "getCameraConfiguration" | "setCameraConfiguration" | "cameraData" | "cameraImageProgress" | "cameraImage" | "isRecordingCamera" | "startRecordingCamera" | "stopRecordingCamera" | "cameraRecording" | "autoPicture" | "microphoneStatus" | "microphoneCommand" | "getMicrophoneConfiguration" | "setMicrophoneConfiguration" | "microphoneData" | "isRecordingMicrophone" | "startRecordingMicrophone" | "stopRecordingMicrophone" | "microphoneRecording" | "isDisplayAvailable" | "displayStatus" | "displayInformation" | "displayCommand" | "getDisplayBrightness" | "setDisplayBrightness" | "displayContextCommands" | "displayReady" | "getSpriteSheetName" | "setSpriteSheetName" | "spriteSheetIndex" | "displayContextState" | "displayColor" | "displayColorOpacity" | "displayOpacity" | "displaySpriteSheetUploadStart" | "displaySpriteSheetUploadProgress" | "displaySpriteSheetUploadComplete" | "getSensorCounts" | "getLedInformation" | "setLeds" | "clearLeds" | "setLed" | "smp" | "firmwareImages" | "firmwareUploadProgress" | "firmwareStatus" | "firmwareUploadComplete">(type: T, listener: (event: ListenerEvent<Device, "pressure" | "pressureAutoRangeEnabled" | "pressureAutoRangeDisabled" | "pressureAutoRange" | "pressureMotionAutoRangeEnabled" | "pressureMotionAutoRangeDisabled" | "pressureMotionAutoRange" | "isRecordingPressureCalibrationData" | "pressureCalibrationDataRecordStart" | "pressureCalibrationDataRecordStop" | "pressureCalibrationDataRecordingProgress" | "isTrainingPressureCalibration" | "pressureCalibrationTrainStart" | "pressureCalibrationTrainEnd" | "pressureCalibrationTrainProgress" | "calibratedPressureModel" | "getTfliteName" | "setTfliteName" | "getTfliteTask" | "setTfliteTask" | "getTfliteSampleRate" | "setTfliteSampleRate" | "getTfliteSensorTypes" | "setTfliteSensorTypes" | "tfliteIsReady" | "getTfliteCaptureDelay" | "setTfliteCaptureDelay" | "getTfliteThreshold" | "setTfliteThreshold" | "getTfliteInferencingEnabled" | "setTfliteInferencingEnabled" | "tfliteInference" | "acceleration" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation" | "orientation" | "activity" | "stepCounter" | "stepDetector" | "deviceOrientation" | "tapDetector" | "barometer" | "camera" | "microphone" | "buttons" | "touches" | "light" | "connectionMessage" | "notConnected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isConnected" | "rx" | "tx" | "batteryLevel" | "isCharging" | "getBatteryCurrent" | "getMtu" | "getId" | "getName" | "setName" | "getType" | "setType" | "getCurrentTime" | "setCurrentTime" | "manufacturerName" | "modelNumber" | "hardwareRevision" | "firmwareRevision" | "softwareRevision" | "pnpId" | "serialNumber" | "deviceInformation" | "getSensorConfiguration" | "setSensorConfiguration" | "getPressurePositions" | "getSensorScalars" | "sensorData" | "numberOfButtons" | "button" | "buttonDown" | "buttonUp" | "numberOfTouches" | "touch" | "touchDown" | "touchUp" | "getVibrationLocations" | "triggerVibration" | "getFileTypes" | "maxFileLength" | "getFileType" | "setFileType" | "getFileLength" | "setFileLength" | "getFileChecksum" | "setFileChecksum" | "setFileTransferCommand" | "fileTransferStatus" | "getFileBlock" | "setFileBlock" | "fileBytesTransferred" | "fileTransferProgress" | "fileTransferComplete" | "fileReceived" | "isWifiAvailable" | "getWifiSSID" | "setWifiSSID" | "getWifiPassword" | "setWifiPassword" | "getWifiConnectionEnabled" | "setWifiConnectionEnabled" | "isWifiConnected" | "ipAddress" | "isWifiSecure" | "cameraStatus" | "cameraCommand" | "getCameraConfiguration" | "setCameraConfiguration" | "cameraData" | "cameraImageProgress" | "cameraImage" | "isRecordingCamera" | "startRecordingCamera" | "stopRecordingCamera" | "cameraRecording" | "autoPicture" | "microphoneStatus" | "microphoneCommand" | "getMicrophoneConfiguration" | "setMicrophoneConfiguration" | "microphoneData" | "isRecordingMicrophone" | "startRecordingMicrophone" | "stopRecordingMicrophone" | "microphoneRecording" | "isDisplayAvailable" | "displayStatus" | "displayInformation" | "displayCommand" | "getDisplayBrightness" | "setDisplayBrightness" | "displayContextCommands" | "displayReady" | "getSpriteSheetName" | "setSpriteSheetName" | "spriteSheetIndex" | "displayContextState" | "displayColor" | "displayColorOpacity" | "displayOpacity" | "displaySpriteSheetUploadStart" | "displaySpriteSheetUploadProgress" | "displaySpriteSheetUploadComplete" | "getSensorCounts" | "getLedInformation" | "setLeds" | "clearLeds" | "setLed" | "smp" | "firmwareImages" | "firmwareUploadProgress" | "firmwareStatus" | "firmwareUploadComplete", DeviceEventMessages, T>) => void, options?: EventDispatcherOptions) => void;
    get removeEventListener(): <T extends "pressure" | "pressureAutoRangeEnabled" | "pressureAutoRangeDisabled" | "pressureAutoRange" | "pressureMotionAutoRangeEnabled" | "pressureMotionAutoRangeDisabled" | "pressureMotionAutoRange" | "isRecordingPressureCalibrationData" | "pressureCalibrationDataRecordStart" | "pressureCalibrationDataRecordStop" | "pressureCalibrationDataRecordingProgress" | "isTrainingPressureCalibration" | "pressureCalibrationTrainStart" | "pressureCalibrationTrainEnd" | "pressureCalibrationTrainProgress" | "calibratedPressureModel" | "getTfliteName" | "setTfliteName" | "getTfliteTask" | "setTfliteTask" | "getTfliteSampleRate" | "setTfliteSampleRate" | "getTfliteSensorTypes" | "setTfliteSensorTypes" | "tfliteIsReady" | "getTfliteCaptureDelay" | "setTfliteCaptureDelay" | "getTfliteThreshold" | "setTfliteThreshold" | "getTfliteInferencingEnabled" | "setTfliteInferencingEnabled" | "tfliteInference" | "acceleration" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation" | "orientation" | "activity" | "stepCounter" | "stepDetector" | "deviceOrientation" | "tapDetector" | "barometer" | "camera" | "microphone" | "buttons" | "touches" | "light" | "*" | "connectionMessage" | "notConnected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isConnected" | "rx" | "tx" | "batteryLevel" | "isCharging" | "getBatteryCurrent" | "getMtu" | "getId" | "getName" | "setName" | "getType" | "setType" | "getCurrentTime" | "setCurrentTime" | "manufacturerName" | "modelNumber" | "hardwareRevision" | "firmwareRevision" | "softwareRevision" | "pnpId" | "serialNumber" | "deviceInformation" | "getSensorConfiguration" | "setSensorConfiguration" | "getPressurePositions" | "getSensorScalars" | "sensorData" | "numberOfButtons" | "button" | "buttonDown" | "buttonUp" | "numberOfTouches" | "touch" | "touchDown" | "touchUp" | "getVibrationLocations" | "triggerVibration" | "getFileTypes" | "maxFileLength" | "getFileType" | "setFileType" | "getFileLength" | "setFileLength" | "getFileChecksum" | "setFileChecksum" | "setFileTransferCommand" | "fileTransferStatus" | "getFileBlock" | "setFileBlock" | "fileBytesTransferred" | "fileTransferProgress" | "fileTransferComplete" | "fileReceived" | "isWifiAvailable" | "getWifiSSID" | "setWifiSSID" | "getWifiPassword" | "setWifiPassword" | "getWifiConnectionEnabled" | "setWifiConnectionEnabled" | "isWifiConnected" | "ipAddress" | "isWifiSecure" | "cameraStatus" | "cameraCommand" | "getCameraConfiguration" | "setCameraConfiguration" | "cameraData" | "cameraImageProgress" | "cameraImage" | "isRecordingCamera" | "startRecordingCamera" | "stopRecordingCamera" | "cameraRecording" | "autoPicture" | "microphoneStatus" | "microphoneCommand" | "getMicrophoneConfiguration" | "setMicrophoneConfiguration" | "microphoneData" | "isRecordingMicrophone" | "startRecordingMicrophone" | "stopRecordingMicrophone" | "microphoneRecording" | "isDisplayAvailable" | "displayStatus" | "displayInformation" | "displayCommand" | "getDisplayBrightness" | "setDisplayBrightness" | "displayContextCommands" | "displayReady" | "getSpriteSheetName" | "setSpriteSheetName" | "spriteSheetIndex" | "displayContextState" | "displayColor" | "displayColorOpacity" | "displayOpacity" | "displaySpriteSheetUploadStart" | "displaySpriteSheetUploadProgress" | "displaySpriteSheetUploadComplete" | "getSensorCounts" | "getLedInformation" | "setLeds" | "clearLeds" | "setLed" | "smp" | "firmwareImages" | "firmwareUploadProgress" | "firmwareStatus" | "firmwareUploadComplete">(type: T, listener: (event: ListenerEvent<Device, "pressure" | "pressureAutoRangeEnabled" | "pressureAutoRangeDisabled" | "pressureAutoRange" | "pressureMotionAutoRangeEnabled" | "pressureMotionAutoRangeDisabled" | "pressureMotionAutoRange" | "isRecordingPressureCalibrationData" | "pressureCalibrationDataRecordStart" | "pressureCalibrationDataRecordStop" | "pressureCalibrationDataRecordingProgress" | "isTrainingPressureCalibration" | "pressureCalibrationTrainStart" | "pressureCalibrationTrainEnd" | "pressureCalibrationTrainProgress" | "calibratedPressureModel" | "getTfliteName" | "setTfliteName" | "getTfliteTask" | "setTfliteTask" | "getTfliteSampleRate" | "setTfliteSampleRate" | "getTfliteSensorTypes" | "setTfliteSensorTypes" | "tfliteIsReady" | "getTfliteCaptureDelay" | "setTfliteCaptureDelay" | "getTfliteThreshold" | "setTfliteThreshold" | "getTfliteInferencingEnabled" | "setTfliteInferencingEnabled" | "tfliteInference" | "acceleration" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation" | "orientation" | "activity" | "stepCounter" | "stepDetector" | "deviceOrientation" | "tapDetector" | "barometer" | "camera" | "microphone" | "buttons" | "touches" | "light" | "connectionMessage" | "notConnected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isConnected" | "rx" | "tx" | "batteryLevel" | "isCharging" | "getBatteryCurrent" | "getMtu" | "getId" | "getName" | "setName" | "getType" | "setType" | "getCurrentTime" | "setCurrentTime" | "manufacturerName" | "modelNumber" | "hardwareRevision" | "firmwareRevision" | "softwareRevision" | "pnpId" | "serialNumber" | "deviceInformation" | "getSensorConfiguration" | "setSensorConfiguration" | "getPressurePositions" | "getSensorScalars" | "sensorData" | "numberOfButtons" | "button" | "buttonDown" | "buttonUp" | "numberOfTouches" | "touch" | "touchDown" | "touchUp" | "getVibrationLocations" | "triggerVibration" | "getFileTypes" | "maxFileLength" | "getFileType" | "setFileType" | "getFileLength" | "setFileLength" | "getFileChecksum" | "setFileChecksum" | "setFileTransferCommand" | "fileTransferStatus" | "getFileBlock" | "setFileBlock" | "fileBytesTransferred" | "fileTransferProgress" | "fileTransferComplete" | "fileReceived" | "isWifiAvailable" | "getWifiSSID" | "setWifiSSID" | "getWifiPassword" | "setWifiPassword" | "getWifiConnectionEnabled" | "setWifiConnectionEnabled" | "isWifiConnected" | "ipAddress" | "isWifiSecure" | "cameraStatus" | "cameraCommand" | "getCameraConfiguration" | "setCameraConfiguration" | "cameraData" | "cameraImageProgress" | "cameraImage" | "isRecordingCamera" | "startRecordingCamera" | "stopRecordingCamera" | "cameraRecording" | "autoPicture" | "microphoneStatus" | "microphoneCommand" | "getMicrophoneConfiguration" | "setMicrophoneConfiguration" | "microphoneData" | "isRecordingMicrophone" | "startRecordingMicrophone" | "stopRecordingMicrophone" | "microphoneRecording" | "isDisplayAvailable" | "displayStatus" | "displayInformation" | "displayCommand" | "getDisplayBrightness" | "setDisplayBrightness" | "displayContextCommands" | "displayReady" | "getSpriteSheetName" | "setSpriteSheetName" | "spriteSheetIndex" | "displayContextState" | "displayColor" | "displayColorOpacity" | "displayOpacity" | "displaySpriteSheetUploadStart" | "displaySpriteSheetUploadProgress" | "displaySpriteSheetUploadComplete" | "getSensorCounts" | "getLedInformation" | "setLeds" | "clearLeds" | "setLed" | "smp" | "firmwareImages" | "firmwareUploadProgress" | "firmwareStatus" | "firmwareUploadComplete", DeviceEventMessages, T>) => void) => void;
    get waitForEvent(): <T extends "pressure" | "pressureAutoRangeEnabled" | "pressureAutoRangeDisabled" | "pressureAutoRange" | "pressureMotionAutoRangeEnabled" | "pressureMotionAutoRangeDisabled" | "pressureMotionAutoRange" | "isRecordingPressureCalibrationData" | "pressureCalibrationDataRecordStart" | "pressureCalibrationDataRecordStop" | "pressureCalibrationDataRecordingProgress" | "isTrainingPressureCalibration" | "pressureCalibrationTrainStart" | "pressureCalibrationTrainEnd" | "pressureCalibrationTrainProgress" | "calibratedPressureModel" | "getTfliteName" | "setTfliteName" | "getTfliteTask" | "setTfliteTask" | "getTfliteSampleRate" | "setTfliteSampleRate" | "getTfliteSensorTypes" | "setTfliteSensorTypes" | "tfliteIsReady" | "getTfliteCaptureDelay" | "setTfliteCaptureDelay" | "getTfliteThreshold" | "setTfliteThreshold" | "getTfliteInferencingEnabled" | "setTfliteInferencingEnabled" | "tfliteInference" | "acceleration" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation" | "orientation" | "activity" | "stepCounter" | "stepDetector" | "deviceOrientation" | "tapDetector" | "barometer" | "camera" | "microphone" | "buttons" | "touches" | "light" | "connectionMessage" | "notConnected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isConnected" | "rx" | "tx" | "batteryLevel" | "isCharging" | "getBatteryCurrent" | "getMtu" | "getId" | "getName" | "setName" | "getType" | "setType" | "getCurrentTime" | "setCurrentTime" | "manufacturerName" | "modelNumber" | "hardwareRevision" | "firmwareRevision" | "softwareRevision" | "pnpId" | "serialNumber" | "deviceInformation" | "getSensorConfiguration" | "setSensorConfiguration" | "getPressurePositions" | "getSensorScalars" | "sensorData" | "numberOfButtons" | "button" | "buttonDown" | "buttonUp" | "numberOfTouches" | "touch" | "touchDown" | "touchUp" | "getVibrationLocations" | "triggerVibration" | "getFileTypes" | "maxFileLength" | "getFileType" | "setFileType" | "getFileLength" | "setFileLength" | "getFileChecksum" | "setFileChecksum" | "setFileTransferCommand" | "fileTransferStatus" | "getFileBlock" | "setFileBlock" | "fileBytesTransferred" | "fileTransferProgress" | "fileTransferComplete" | "fileReceived" | "isWifiAvailable" | "getWifiSSID" | "setWifiSSID" | "getWifiPassword" | "setWifiPassword" | "getWifiConnectionEnabled" | "setWifiConnectionEnabled" | "isWifiConnected" | "ipAddress" | "isWifiSecure" | "cameraStatus" | "cameraCommand" | "getCameraConfiguration" | "setCameraConfiguration" | "cameraData" | "cameraImageProgress" | "cameraImage" | "isRecordingCamera" | "startRecordingCamera" | "stopRecordingCamera" | "cameraRecording" | "autoPicture" | "microphoneStatus" | "microphoneCommand" | "getMicrophoneConfiguration" | "setMicrophoneConfiguration" | "microphoneData" | "isRecordingMicrophone" | "startRecordingMicrophone" | "stopRecordingMicrophone" | "microphoneRecording" | "isDisplayAvailable" | "displayStatus" | "displayInformation" | "displayCommand" | "getDisplayBrightness" | "setDisplayBrightness" | "displayContextCommands" | "displayReady" | "getSpriteSheetName" | "setSpriteSheetName" | "spriteSheetIndex" | "displayContextState" | "displayColor" | "displayColorOpacity" | "displayOpacity" | "displaySpriteSheetUploadStart" | "displaySpriteSheetUploadProgress" | "displaySpriteSheetUploadComplete" | "getSensorCounts" | "getLedInformation" | "setLeds" | "clearLeds" | "setLed" | "smp" | "firmwareImages" | "firmwareUploadProgress" | "firmwareStatus" | "firmwareUploadComplete">(type: T, options?: {
        immediate?: boolean;
    }) => Promise<ListenerEvent<Device, "pressure" | "pressureAutoRangeEnabled" | "pressureAutoRangeDisabled" | "pressureAutoRange" | "pressureMotionAutoRangeEnabled" | "pressureMotionAutoRangeDisabled" | "pressureMotionAutoRange" | "isRecordingPressureCalibrationData" | "pressureCalibrationDataRecordStart" | "pressureCalibrationDataRecordStop" | "pressureCalibrationDataRecordingProgress" | "isTrainingPressureCalibration" | "pressureCalibrationTrainStart" | "pressureCalibrationTrainEnd" | "pressureCalibrationTrainProgress" | "calibratedPressureModel" | "getTfliteName" | "setTfliteName" | "getTfliteTask" | "setTfliteTask" | "getTfliteSampleRate" | "setTfliteSampleRate" | "getTfliteSensorTypes" | "setTfliteSensorTypes" | "tfliteIsReady" | "getTfliteCaptureDelay" | "setTfliteCaptureDelay" | "getTfliteThreshold" | "setTfliteThreshold" | "getTfliteInferencingEnabled" | "setTfliteInferencingEnabled" | "tfliteInference" | "acceleration" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation" | "orientation" | "activity" | "stepCounter" | "stepDetector" | "deviceOrientation" | "tapDetector" | "barometer" | "camera" | "microphone" | "buttons" | "touches" | "light" | "connectionMessage" | "notConnected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isConnected" | "rx" | "tx" | "batteryLevel" | "isCharging" | "getBatteryCurrent" | "getMtu" | "getId" | "getName" | "setName" | "getType" | "setType" | "getCurrentTime" | "setCurrentTime" | "manufacturerName" | "modelNumber" | "hardwareRevision" | "firmwareRevision" | "softwareRevision" | "pnpId" | "serialNumber" | "deviceInformation" | "getSensorConfiguration" | "setSensorConfiguration" | "getPressurePositions" | "getSensorScalars" | "sensorData" | "numberOfButtons" | "button" | "buttonDown" | "buttonUp" | "numberOfTouches" | "touch" | "touchDown" | "touchUp" | "getVibrationLocations" | "triggerVibration" | "getFileTypes" | "maxFileLength" | "getFileType" | "setFileType" | "getFileLength" | "setFileLength" | "getFileChecksum" | "setFileChecksum" | "setFileTransferCommand" | "fileTransferStatus" | "getFileBlock" | "setFileBlock" | "fileBytesTransferred" | "fileTransferProgress" | "fileTransferComplete" | "fileReceived" | "isWifiAvailable" | "getWifiSSID" | "setWifiSSID" | "getWifiPassword" | "setWifiPassword" | "getWifiConnectionEnabled" | "setWifiConnectionEnabled" | "isWifiConnected" | "ipAddress" | "isWifiSecure" | "cameraStatus" | "cameraCommand" | "getCameraConfiguration" | "setCameraConfiguration" | "cameraData" | "cameraImageProgress" | "cameraImage" | "isRecordingCamera" | "startRecordingCamera" | "stopRecordingCamera" | "cameraRecording" | "autoPicture" | "microphoneStatus" | "microphoneCommand" | "getMicrophoneConfiguration" | "setMicrophoneConfiguration" | "microphoneData" | "isRecordingMicrophone" | "startRecordingMicrophone" | "stopRecordingMicrophone" | "microphoneRecording" | "isDisplayAvailable" | "displayStatus" | "displayInformation" | "displayCommand" | "getDisplayBrightness" | "setDisplayBrightness" | "displayContextCommands" | "displayReady" | "getSpriteSheetName" | "setSpriteSheetName" | "spriteSheetIndex" | "displayContextState" | "displayColor" | "displayColorOpacity" | "displayOpacity" | "displaySpriteSheetUploadStart" | "displaySpriteSheetUploadProgress" | "displaySpriteSheetUploadComplete" | "getSensorCounts" | "getLedInformation" | "setLeds" | "clearLeds" | "setLed" | "smp" | "firmwareImages" | "firmwareUploadProgress" | "firmwareStatus" | "firmwareUploadComplete", DeviceEventMessages, T>>;
    get removeEventListeners(): <T extends "pressure" | "pressureAutoRangeEnabled" | "pressureAutoRangeDisabled" | "pressureAutoRange" | "pressureMotionAutoRangeEnabled" | "pressureMotionAutoRangeDisabled" | "pressureMotionAutoRange" | "isRecordingPressureCalibrationData" | "pressureCalibrationDataRecordStart" | "pressureCalibrationDataRecordStop" | "pressureCalibrationDataRecordingProgress" | "isTrainingPressureCalibration" | "pressureCalibrationTrainStart" | "pressureCalibrationTrainEnd" | "pressureCalibrationTrainProgress" | "calibratedPressureModel" | "getTfliteName" | "setTfliteName" | "getTfliteTask" | "setTfliteTask" | "getTfliteSampleRate" | "setTfliteSampleRate" | "getTfliteSensorTypes" | "setTfliteSensorTypes" | "tfliteIsReady" | "getTfliteCaptureDelay" | "setTfliteCaptureDelay" | "getTfliteThreshold" | "setTfliteThreshold" | "getTfliteInferencingEnabled" | "setTfliteInferencingEnabled" | "tfliteInference" | "acceleration" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation" | "orientation" | "activity" | "stepCounter" | "stepDetector" | "deviceOrientation" | "tapDetector" | "barometer" | "camera" | "microphone" | "buttons" | "touches" | "light" | "*" | "connectionMessage" | "notConnected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isConnected" | "rx" | "tx" | "batteryLevel" | "isCharging" | "getBatteryCurrent" | "getMtu" | "getId" | "getName" | "setName" | "getType" | "setType" | "getCurrentTime" | "setCurrentTime" | "manufacturerName" | "modelNumber" | "hardwareRevision" | "firmwareRevision" | "softwareRevision" | "pnpId" | "serialNumber" | "deviceInformation" | "getSensorConfiguration" | "setSensorConfiguration" | "getPressurePositions" | "getSensorScalars" | "sensorData" | "numberOfButtons" | "button" | "buttonDown" | "buttonUp" | "numberOfTouches" | "touch" | "touchDown" | "touchUp" | "getVibrationLocations" | "triggerVibration" | "getFileTypes" | "maxFileLength" | "getFileType" | "setFileType" | "getFileLength" | "setFileLength" | "getFileChecksum" | "setFileChecksum" | "setFileTransferCommand" | "fileTransferStatus" | "getFileBlock" | "setFileBlock" | "fileBytesTransferred" | "fileTransferProgress" | "fileTransferComplete" | "fileReceived" | "isWifiAvailable" | "getWifiSSID" | "setWifiSSID" | "getWifiPassword" | "setWifiPassword" | "getWifiConnectionEnabled" | "setWifiConnectionEnabled" | "isWifiConnected" | "ipAddress" | "isWifiSecure" | "cameraStatus" | "cameraCommand" | "getCameraConfiguration" | "setCameraConfiguration" | "cameraData" | "cameraImageProgress" | "cameraImage" | "isRecordingCamera" | "startRecordingCamera" | "stopRecordingCamera" | "cameraRecording" | "autoPicture" | "microphoneStatus" | "microphoneCommand" | "getMicrophoneConfiguration" | "setMicrophoneConfiguration" | "microphoneData" | "isRecordingMicrophone" | "startRecordingMicrophone" | "stopRecordingMicrophone" | "microphoneRecording" | "isDisplayAvailable" | "displayStatus" | "displayInformation" | "displayCommand" | "getDisplayBrightness" | "setDisplayBrightness" | "displayContextCommands" | "displayReady" | "getSpriteSheetName" | "setSpriteSheetName" | "spriteSheetIndex" | "displayContextState" | "displayColor" | "displayColorOpacity" | "displayOpacity" | "displaySpriteSheetUploadStart" | "displaySpriteSheetUploadProgress" | "displaySpriteSheetUploadComplete" | "getSensorCounts" | "getLedInformation" | "setLeds" | "clearLeds" | "setLed" | "smp" | "firmwareImages" | "firmwareUploadProgress" | "firmwareStatus" | "firmwareUploadComplete">(type: T) => void;
    removeAllEventListeners(): void;
    get connectionManager(): BaseConnectionManager | undefined;
    set connectionManager(newConnectionManager: BaseConnectionManager | undefined);
    private sendTxMessages;
    connect(options?: ConnectOptions): Promise<boolean | undefined>;
    get isConnected(): boolean;
    get canReconnect(): boolean | undefined;
    reconnect(): Promise<boolean | undefined>;
    static Connect(): Promise<Device>;
    static get ReconnectOnDisconnection(): boolean;
    static set ReconnectOnDisconnection(newReconnectOnDisconnection: boolean);
    get reconnectOnDisconnection(): boolean;
    set reconnectOnDisconnection(newReconnectOnDisconnection: boolean);
    get connectionType(): "webBluetooth" | "noble" | "client" | "webSocket" | "udp" | undefined;
    disconnect(): Promise<boolean | undefined>;
    toggleConnection(options: ConnectOptions): Promise<void>;
    toggleConnection(reconnect?: boolean): Promise<void>;
    get connectionStatus(): ConnectionStatus;
    get isConnectionBusy(): boolean;
    _onRemoteConnectionMessageSent(messageType: ConnectionMessageType, dataView: DataView<ArrayBuffer>): void;
    latestConnectionMessages: Map<ConnectionMessageType, DataView>;
    get deviceInformation(): DeviceInformation;
    get batteryLevel(): number;
    private _informationManager;
    get id(): string;
    get isCharging(): boolean;
    get batteryCurrent(): number;
    get getBatteryCurrent(): () => Promise<void>;
    get name(): string;
    get setName(): (newName: string) => Promise<void>;
    get type(): "leftInsole" | "rightInsole" | "leftGlove" | "rightGlove" | "glasses" | "generic";
    get setType(): (newType: DeviceType) => Promise<void>;
    get isInsole(): boolean;
    get isGlove(): boolean;
    get isGlasses(): boolean;
    get isGeneric(): boolean;
    get side(): "left" | "right";
    get mtu(): number;
    get sensorTypes(): SensorType[];
    get continuousSensorTypes(): ("pressure" | "acceleration" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation" | "orientation" | "barometer" | "light")[];
    get sensorConfiguration(): SensorConfiguration;
    get setSensorConfiguration(): (newSensorConfiguration: SensorConfiguration, clearRest?: boolean, sendImmediately?: boolean) => Promise<void>;
    get toggleSensor(): (sensorType: SensorType, sensorRate: number, clearRest?: boolean, sendImmediately?: boolean) => Promise<void>;
    get availableSensorTypes(): ("pressure" | "acceleration" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation" | "orientation" | "activity" | "stepCounter" | "stepDetector" | "deviceOrientation" | "tapDetector" | "barometer" | "camera" | "microphone" | "buttons" | "touches" | "light")[];
    get hasSensorType(): (sensorType: SensorType) => boolean;
    clearSensorConfiguration(): Promise<void>;
    static get ClearSensorConfigurationOnLeave(): boolean;
    static set ClearSensorConfigurationOnLeave(newClearSensorConfigurationOnLeave: boolean);
    get clearSensorConfigurationOnLeave(): boolean;
    set clearSensorConfigurationOnLeave(newClearSensorConfigurationOnLeave: boolean);
    get numberOfPressureSensors(): number;
    get pressureSensorPositions(): Vector2[];
    get autoPressureRange(): boolean;
    get setPressureAutoRange(): (newAutoRange: boolean) => void;
    get togglePressureAutoRange(): () => void;
    get autoPressureMotionRange(): boolean;
    get setPressureMotionAutoRange(): (newMotionAutoRange: boolean) => void;
    get togglePressureMotionAutoRange(): () => void;
    get resetPressureRange(): () => void;
    get canCalibratePressure(): boolean;
    get isRecordingPressureCalibrationData(): boolean;
    get isTrainingPressureCalibrationModel(): boolean;
    get startRecordingPressureCalibrationData(): () => void;
    get stopRecordingPressureCalibrationData(): () => void;
    toggleRecordingPressureCalibrationData(): void;
    get pressureCalibrationModel(): _tensorflow_tfjs_layers.Sequential | undefined;
    get isPressureCalibrationModelTrained(): boolean;
    trainPressureCalibrationModel(): Promise<void>;
    get savePressureCalibrationModel(): (handlerOrURL: _tensorflow_tfjs_core_dist_io_types.IOHandler | string, config?: _tensorflow_tfjs_core_dist_io_types.SaveConfig) => Promise<boolean>;
    get loadPressureCalibrationModel(): (pathOrIOHandlerOrFileList: string | _tensorflow_tfjs_core_dist_io_types.IOHandler | FileList, options?: _tensorflow_tfjs_core_dist_io_types.LoadOptions) => Promise<boolean>;
    get addPressureCalibrationModelData(): (inputs: number[], outputs: number[]) => void;
    get clearPressureCalibrationModelData(): () => void;
    get pressureCalibrationModelData(): CenterOfPressureModelData;
    get hasButtons(): boolean;
    get numberOfButtons(): number;
    get hasTouches(): boolean;
    get numberOfTouches(): number;
    get vibrationLocations(): ("left" | "right" | "front" | "rear")[];
    get hasVibration(): boolean;
    get triggerVibration(): {
        (vibrationConfiguration: VibrationConfiguration, sendImmediately?: boolean): Promise<void>;
        (vibrationConfigurations: VibrationConfiguration[], sendImmediately?: boolean): Promise<void>;
    };
    get fileTypes(): ("cameraImage" | "tflite" | "wifiServerCert" | "wifiServerKey" | "spriteSheet")[];
    get maxFileLength(): number;
    get validFileTypes(): ("cameraImage" | "tflite" | "wifiServerCert" | "wifiServerKey" | "spriteSheet")[];
    sendFile(fileType: FileType, file: FileLike): Promise<void>;
    receiveFile(fileType: FileType): Promise<void>;
    get fileTransferStatus(): "idle" | "sending" | "receiving";
    cancelFileTransfer(): void;
    get isTfliteAvailable(): boolean;
    get tfliteName(): string;
    get setTfliteName(): (newName: string, sendImmediately?: boolean) => Promise<void>;
    sendTfliteConfiguration(configuration: TfliteFileConfiguration): Promise<void>;
    get tfliteClasses(): string[] | undefined;
    get setTfliteClasses(): (newClasses?: string[]) => void;
    get tfliteTask(): "classification" | "regression";
    get setTfliteTask(): (newTask: TfliteTask, sendImmediately?: boolean) => Promise<void>;
    get tfliteSampleRate(): number;
    get setTfliteSampleRate(): (newSampleRate: number, sendImmediately?: boolean) => Promise<void>;
    get tfliteSensorTypes(): ("pressure" | "linearAcceleration" | "gyroscope" | "magnetometer" | "camera" | "microphone")[];
    get allowedTfliteSensorTypes(): TfliteSensorType[];
    get setTfliteSensorTypes(): (newSensorTypes: SensorType[], sendImmediately?: boolean) => Promise<void>;
    get tfliteIsReady(): boolean;
    get tfliteInferencingEnabled(): boolean;
    get setTfliteInferencingEnabled(): (newInferencingEnabled: boolean, sendImmediately?: boolean) => Promise<void>;
    enableTfliteInferencing(): Promise<void>;
    disableTfliteInferencing(): Promise<void>;
    get toggleTfliteInferencing(): () => Promise<void>;
    get tfliteCaptureDelay(): number;
    get setTfliteCaptureDelay(): (newCaptureDelay: number, sendImmediately: boolean) => Promise<void>;
    get tfliteThreshold(): number;
    get setTfliteThreshold(): (newThreshold: number, sendImmediately: boolean) => Promise<void>;
    get canUpdateFirmware(): boolean | undefined;
    private sendSmpMessage;
    get uploadFirmware(): (file: FileLike) => Promise<void>;
    get canReset(): boolean | undefined;
    reset(): Promise<boolean>;
    get firmwareStatus(): "idle" | "uploading" | "uploaded" | "pending" | "testing" | "erasing";
    get getFirmwareImages(): () => Promise<void>;
    get firmwareImages(): FirmwareImage[];
    get eraseFirmwareImage(): () => Promise<void>;
    get confirmFirmwareImage(): (imageIndex?: number) => Promise<void>;
    get testFirmwareImage(): (imageIndex?: number) => Promise<void>;
    get isWifiAvailable(): boolean;
    get wifiSSID(): string;
    setWifiSSID(newWifiSSID: string): Promise<void>;
    get wifiPassword(): string;
    setWifiPassword(newWifiPassword: string): Promise<void>;
    get isWifiConnected(): boolean;
    get ipAddress(): string | undefined;
    get wifiConnectionEnabled(): boolean;
    get enableWifiConnection(): () => Promise<void>;
    get setWifiConnectionEnabled(): (newWifiConnectionEnabled: boolean, sendImmediately?: boolean) => Promise<void>;
    get disableWifiConnection(): () => Promise<void>;
    get toggleWifiConnection(): () => Promise<void>;
    get isWifiSecure(): boolean;
    reconnectViaWebSockets(): Promise<void>;
    reconnectViaUDP(): Promise<void>;
    private get _buildCameraData();
    get hasCamera(): boolean;
    get cameraStatus(): "idle" | "focusing" | "takingPicture" | "asleep";
    takePicture(sensorRate?: number): Promise<void>;
    get autoPicture(): boolean;
    set autoPicture(newAutoPicture: boolean);
    focusCamera(sensorRate?: number): Promise<void>;
    stopCamera(): Promise<void>;
    wakeCamera(): Promise<void>;
    sleepCamera(): Promise<void>;
    get cameraConfiguration(): CameraConfiguration;
    get availableCameraConfigurationTypes(): ("resolution" | "qualityFactor" | "shutter" | "gain" | "redGain" | "greenGain" | "blueGain" | "autoWhiteBalanceEnabled" | "autoGainEnabled" | "exposure" | "autoExposureEnabled" | "autoExposureLevel" | "brightness" | "saturation" | "contrast" | "sharpness")[];
    get cameraConfigurationRanges(): CameraConfigurationRanges;
    get setCameraConfiguration(): (newCameraConfiguration: CameraConfiguration, sendImmediately?: boolean) => Promise<void>;
    get isRecordingCamera(): boolean;
    get startRecordingCamera(): (audioStream?: MediaStream) => void;
    get stopRecordingCamera(): () => Promise<void>;
    get toggleCameraRecording(): (audioStream?: MediaStream) => void;
    get hasMicrophone(): boolean;
    get microphoneStatus(): "idle" | "streaming" | "vad" | "inferencing";
    startMicrophone(sensorRate?: number): Promise<void>;
    stopMicrophone(): Promise<void>;
    enableMicrophoneVad(): Promise<void>;
    toggleMicrophone(sensorRate?: number): Promise<void>;
    get microphoneConfiguration(): MicrophoneConfiguration;
    get availableMicrophoneConfigurationTypes(): ("sampleRate" | "bitDepth")[];
    get setMicrophoneConfiguration(): (newMicrophoneConfiguration: MicrophoneConfiguration) => Promise<void>;
    get audioContext(): AudioContext | undefined;
    set audioContext(newAudioContext: AudioContext | undefined);
    get microphoneMediaStreamDestination(): MediaStreamAudioDestinationNode;
    get microphoneGainNode(): GainNode;
    get isRecordingMicrophone(): boolean;
    startRecordingMicrophone(): void;
    stopRecordingMicrophone(): void;
    toggleMicrophoneRecording(): void;
    get isDisplayAvailable(): boolean;
    get isDisplayReady(): boolean;
    get displayContextState(): DisplayContextState;
    get displayColors(): string[];
    get displayBitmapColors(): string[];
    get displayBitmapColorIndices(): number[];
    get displayColorOpacities(): number[];
    get displayStatus(): "asleep" | "awake";
    get displayBrightness(): "veryLow" | "low" | "medium" | "high" | "veryHigh";
    get setDisplayBrightness(): (newDisplayBrightness: DisplayBrightness, sendImmediately?: boolean) => Promise<void>;
    get displayInformation(): DisplayInformation;
    get numberOfDisplayColors(): number;
    get wakeDisplay(): () => Promise<void>;
    get sleepDisplay(): () => Promise<void>;
    get toggleDisplay(): () => Promise<void>;
    get isDisplayAwake(): boolean;
    get showDisplay(): (sendImmediately?: boolean, waitUntilReady?: boolean, isSending?: boolean) => Promise<void>;
    get clearDisplay(): (sendImmediately?: boolean, waitUntilReady?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplayColor(): (colorIndex: number, color: DisplayColorRGBOrString, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplayColorOpacity(): (colorIndex: number, opacity: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplayOpacity(): (opacity: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get saveDisplayContext(): (sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get restoreDisplayContext(): (sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get clearDisplayRect(): (x: number, y: number, width: number, height: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get selectDisplayBackgroundColor(): (backgroundColorIndex: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get selectDisplayFillColor(): (fillColorIndex: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get selectDisplayLineColor(): (lineColorIndex: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplayIgnoreFill(): (ignoreFill: boolean, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplayIgnoreLine(): (ignoreLine: boolean, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplayFillBackground(): (fillBackground: boolean, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplayLineWidth(): (lineWidth: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplayRotation(): (rotation: number, isRadians?: boolean, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get clearDisplayRotation(): (sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplaySegmentStartCap(): (segmentStartCap: DisplaySegmentCap, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplaySegmentEndCap(): (segmentEndCap: DisplaySegmentCap, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplaySegmentCap(): (segmentCap: DisplaySegmentCap, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplaySegmentStartRadius(): (segmentStartRadius: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplaySegmentEndRadius(): (segmentEndRadius: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplaySegmentRadius(): (segmentRadius: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplayCropTop(): (cropTop: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplayCropRight(): (cropRight: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplayCropBottom(): (cropBottom: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplayCropLeft(): (cropLeft: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplayCrop(): (cropDirection: DisplayCropDirection, crop: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get clearDisplayCrop(): (sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplayRotationCropTop(): (rotationCropTop: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplayRotationCropRight(): (rotationCropRight: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplayRotationCropBottom(): (rotationCropBottom: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplayRotationCropLeft(): (rotationCropLeft: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplayRotationCrop(): (cropDirection: DisplayCropDirection, crop: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get clearDisplayRotationCrop(): (sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get flushDisplayContextCommands(): () => Promise<void>;
    get drawDisplayRect(): (offsetX: number, offsetY: number, width: number, height: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get drawDisplayCircle(): (offsetX: number, offsetY: number, radius: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get drawDisplayEllipse(): (offsetX: number, offsetY: number, radiusX: number, radiusY: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get drawDisplayRoundRect(): (offsetX: number, offsetY: number, width: number, height: number, borderRadius: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get drawDisplayRegularPolygon(): (offsetX: number, offsetY: number, radius: number, numberOfSides: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get drawDisplayPolygon(): (points: Vector2[], sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get drawDisplayWireframe(): (wireframe: DisplayWireframe, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get drawDisplaySegment(): (startX: number, startY: number, endX: number, endY: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get drawDisplaySegments(): (points: Vector2[], sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get drawDisplayArc(): (offsetX: number, offsetY: number, radius: number, startAngle: number, angleOffset: number, isRadians?: boolean, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get drawDisplayArcEllipse(): (offsetX: number, offsetY: number, radiusX: number, radiusY: number, startAngle: number, angleOffset: number, isRadians?: boolean, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get drawDisplayBitmap(): (offsetX: number, offsetY: number, bitmap: DisplayBitmap, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get imageToDisplayBitmap(): (image: HTMLImageElement, width: number, height: number, numberOfColors?: number) => Promise<{
        blob: Blob;
        bitmap: DisplayBitmap;
    }>;
    get quantizeDisplayImage(): (image: HTMLImageElement, width: number, height: number, numberOfColors: number) => Promise<{
        blob: Blob;
        colors: string[];
        colorIndices: number[];
    }>;
    get resizeAndQuantizeDisplayImage(): (image: HTMLImageElement, width: number, height: number, numberOfColors: number, colors?: string[]) => Promise<{
        blob: Blob;
        colors: string[];
        colorIndices: number[];
    }>;
    get setDisplayContextState(): (newState: PartialDisplayContextState, sendImmediately?: boolean) => Promise<void>;
    get selectDisplayBitmapColor(): (bitmapColorIndex: number, colorIndex: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get selectDisplayBitmapColors(): (bitmapColorPairs: DisplayBitmapColorPair[], sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplayBitmapColor(): (bitmapColorIndex: number, color: DisplayColorRGBOrString, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplayBitmapColorOpacity(): (bitmapColorIndex: number, opacity: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplayBitmapScaleDirection(): (direction: DisplayScaleDirection, bitmapScale: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplayBitmapScaleX(): (bitmapScaleX: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplayBitmapScaleY(): (bitmapScaleY: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplayBitmapScale(): (bitmapScale: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get resetDisplayBitmapScale(): (sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get selectDisplaySpriteColor(): (spriteColorIndex: number, colorIndex: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get selectDisplaySpriteColors(): (spriteColorPairs: DisplaySpriteColorPair[], sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplaySpriteColor(): (spriteColorIndex: number, color: DisplayColorRGBOrString, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplaySpriteColorOpacity(): (spriteColorIndex: number, opacity: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get resetDisplaySpriteColors(): (sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplaySpriteScaleDirection(): (direction: DisplayScaleDirection, spriteScale: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplaySpriteScaleX(): (spriteScaleX: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplaySpriteScaleY(): (spriteScaleY: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplaySpriteScale(): (spriteScale: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get resetDisplaySpriteScale(): (sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get displayManager(): DisplayManagerInterface;
    get uploadDisplaySpriteSheet(): (spriteSheet: DisplaySpriteSheet) => Promise<void>;
    get uploadDisplaySpriteSheets(): (spriteSheets: DisplaySpriteSheet[]) => Promise<void>;
    get selectDisplaySpriteSheet(): (spriteSheetName: string, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get drawDisplaySprite(): (offsetX: number, offsetY: number, spriteName: string, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get startDisplaySprite(): (offsetX: number, offsetY: number, width: number, height: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get endDisplaySprite(): (sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get displaySpriteSheets(): Record<string, DisplaySpriteSheet>;
    get serializeDisplaySpriteSheet(): (spriteSheet: DisplaySpriteSheet) => ArrayBuffer;
    get setDisplayAlignment(): (alignmentDirection: DisplayAlignmentDirection, alignment: DisplayAlignment, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplayVerticalAlignment(): (verticalAlignment: DisplayAlignment, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplayHorizontalAlignment(): (horizontalAlignment: DisplayAlignment, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get resetDisplayAlignment(): (sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplaySpritesDirection(): (spritesDirection: DisplayDirection, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplaySpritesLineDirection(): (spritesLineDirection: DisplayDirection, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplaySpritesSpacing(): (spritesSpacing: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplaySpritesLineSpacing(): (spritesSpacing: number, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get setDisplaySpritesAlignment(): (spritesAlignment: DisplayAlignment, sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get drawDisplayQuadraticBezierCurve(): (controlPoints: Vector2[], sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get drawDisplayQuadraticBezierCurves(): (controlPoints: Vector2[], sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get drawDisplayCubicBezierCurve(): (controlPoints: Vector2[], sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get drawDisplayCubicBezierCurves(): (controlPoints: Vector2[], sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get drawDisplayPath(): (curves: DisplayBezierCurve[], sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get drawDisplayClosedPath(): (curves: DisplayBezierCurve[], sendImmediately?: boolean, isSending?: boolean) => Promise<void>;
    get leds(): Led[];
    get hasLeds(): boolean;
    get setLed(): (ledConfiguration: LedConfiguration, sendImmediately?: boolean) => Promise<void>;
    get setLeds(): (ledConfigurations: LedConfiguration[], sendImmediately?: boolean) => Promise<void>;
    get clearLeds(): (sendImmediately?: boolean) => Promise<void>;
}

declare function isTensorFlowAvailable(): boolean;
declare function listTensorflowModels(): Promise<{
    [url: string]: tf.io.ModelArtifactsInfo;
}>;
declare function getTensorFlowModel(url: string): Promise<tf.io.ModelArtifactsInfo | undefined>;
declare function isTensorFlowModelAvailable(url: string): Promise<boolean>;

interface BaseDeviceManagerDeviceEventMessage {
    device: Device;
}
type DeviceManagerDeviceEventMessages = ExtendInterfaceValues<AddPrefixToInterfaceKeys<DeviceEventMessages, "device">, BaseDeviceManagerDeviceEventMessage>;
declare const wildcardDeviceEventType: "device*";
type WildcardDeviceEventMessage<BaseMessage> = {
    [K in DeviceEventType]: BaseMessage & (K extends keyof DeviceEventMessages ? IfAny<DeviceEventMessages[K], {}, DeviceEventMessages[K]> : {}) & {
        deviceType: K;
        device: Device;
    };
}[DeviceEventType];
interface BaseDeviceManagerEventMessages {
    availableDevice: {
        availableDevice: Device;
    };
    availableDevices: {
        availableDevices: Device[];
    };
    connectedDevices: {
        connectedDevices: Device[];
    };
    [wildcardDeviceEventType]: WildcardDeviceEventMessage<BaseDeviceManagerDeviceEventMessage>;
}
declare const DeviceManagerEventTypes: readonly [...("deviceOrientation" | "devicePressure" | "devicePressureAutoRangeEnabled" | "devicePressureAutoRangeDisabled" | "devicePressureAutoRange" | "devicePressureMotionAutoRangeEnabled" | "devicePressureMotionAutoRangeDisabled" | "devicePressureMotionAutoRange" | "deviceIsRecordingPressureCalibrationData" | "devicePressureCalibrationDataRecordStart" | "devicePressureCalibrationDataRecordStop" | "devicePressureCalibrationDataRecordingProgress" | "deviceIsTrainingPressureCalibration" | "devicePressureCalibrationTrainStart" | "devicePressureCalibrationTrainEnd" | "devicePressureCalibrationTrainProgress" | "deviceCalibratedPressureModel" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "deviceTapDetector" | "deviceBarometer" | "deviceButtons" | "deviceTouches" | "deviceLight" | "deviceConnectionMessage" | "deviceNotConnected" | "deviceConnecting" | "deviceConnected" | "deviceDisconnecting" | "deviceConnectionStatus" | "deviceIsConnected" | "deviceBatteryLevel" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceManufacturerName" | "deviceModelNumber" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "deviceSoftwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceDeviceInformation" | "deviceGetSensorConfiguration" | "deviceSensorData" | "deviceNumberOfButtons" | "deviceButton" | "deviceButtonDown" | "deviceButtonUp" | "deviceNumberOfTouches" | "deviceTouch" | "deviceTouchDown" | "deviceTouchUp" | "deviceGetFileTypes" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "deviceIsWifiAvailable" | "deviceGetWifiSSID" | "deviceGetWifiPassword" | "deviceIsWifiConnected" | "deviceIpAddress" | "deviceCameraStatus" | "deviceGetCameraConfiguration" | "deviceCameraImageProgress" | "deviceCameraImage" | "deviceIsRecordingCamera" | "deviceStartRecordingCamera" | "deviceStopRecordingCamera" | "deviceCameraRecording" | "deviceAutoPicture" | "deviceMicrophoneStatus" | "deviceGetMicrophoneConfiguration" | "deviceMicrophoneData" | "deviceIsRecordingMicrophone" | "deviceStartRecordingMicrophone" | "deviceStopRecordingMicrophone" | "deviceMicrophoneRecording" | "deviceIsDisplayAvailable" | "deviceDisplayStatus" | "deviceDisplayInformation" | "deviceGetDisplayBrightness" | "deviceDisplayContextCommands" | "deviceDisplayReady" | "deviceGetSpriteSheetName" | "deviceDisplayContextState" | "deviceDisplayColor" | "deviceDisplayColorOpacity" | "deviceDisplayOpacity" | "deviceDisplaySpriteSheetUploadStart" | "deviceDisplaySpriteSheetUploadProgress" | "deviceDisplaySpriteSheetUploadComplete" | "deviceGetLedInformation" | "deviceSetLed" | "deviceSmp" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus" | "deviceIsLast" | "deviceGetEnableWifiConnection")[], "availableDevice", "availableDevices", "connectedDevices", "device*"];
type DeviceManagerEventType = (typeof DeviceManagerEventTypes)[number];
type DeviceManagerEventMessages = DeviceManagerDeviceEventMessages & BaseDeviceManagerEventMessages;
type DeviceManagerEventDisptcherTypes = EventDispatcherTypes<DeviceManager, DeviceManagerEventType, DeviceManagerEventMessages>;
type DeviceManagerEvent = DeviceManagerEventDisptcherTypes["Event"];
type DeviceManagerEventMap = DeviceManagerEventDisptcherTypes["EventMap"];
type DeviceManagerEventListenerMap = DeviceManagerEventDisptcherTypes["EventListenerMap"];
type BoundDeviceManagerEventListeners = DeviceManagerEventDisptcherTypes["BoundEventListeners"];
declare class DeviceManager {
    #private;
    static readonly shared: DeviceManager;
    constructor();
    /** @private */
    onDevice(device: Device): void;
    /** @private */
    onDeviceConnectionStatusUpdated(device: Device, connectionStatus: ConnectionStatus): void;
    get connectedDevices(): Device[];
    get useLocalStorage(): boolean;
    set useLocalStorage(newUseLocalStorage: boolean);
    get canUseLocalStorage(): false | Storage;
    get availableDevices(): Device[];
    get canGetDevices(): false | (() => Promise<BluetoothDevice[]>);
    /**
     * retrieves devices already connected via web bluetooth in other tabs/windows
     *
     * _only available on web-bluetooth enabled browsers_
     */
    getDevices(): Promise<Device[] | undefined>;
    get addEventListener(): <T extends "deviceOrientation" | "*" | "connectedDevices" | "device*" | "devicePressure" | "devicePressureAutoRangeEnabled" | "devicePressureAutoRangeDisabled" | "devicePressureAutoRange" | "devicePressureMotionAutoRangeEnabled" | "devicePressureMotionAutoRangeDisabled" | "devicePressureMotionAutoRange" | "deviceIsRecordingPressureCalibrationData" | "devicePressureCalibrationDataRecordStart" | "devicePressureCalibrationDataRecordStop" | "devicePressureCalibrationDataRecordingProgress" | "deviceIsTrainingPressureCalibration" | "devicePressureCalibrationTrainStart" | "devicePressureCalibrationTrainEnd" | "devicePressureCalibrationTrainProgress" | "deviceCalibratedPressureModel" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "deviceTapDetector" | "deviceBarometer" | "deviceButtons" | "deviceTouches" | "deviceLight" | "deviceConnectionMessage" | "deviceNotConnected" | "deviceConnecting" | "deviceConnected" | "deviceDisconnecting" | "deviceConnectionStatus" | "deviceIsConnected" | "deviceBatteryLevel" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceManufacturerName" | "deviceModelNumber" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "deviceSoftwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceDeviceInformation" | "deviceGetSensorConfiguration" | "deviceSensorData" | "deviceNumberOfButtons" | "deviceButton" | "deviceButtonDown" | "deviceButtonUp" | "deviceNumberOfTouches" | "deviceTouch" | "deviceTouchDown" | "deviceTouchUp" | "deviceGetFileTypes" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "deviceIsWifiAvailable" | "deviceGetWifiSSID" | "deviceGetWifiPassword" | "deviceIsWifiConnected" | "deviceIpAddress" | "deviceCameraStatus" | "deviceGetCameraConfiguration" | "deviceCameraImageProgress" | "deviceCameraImage" | "deviceIsRecordingCamera" | "deviceStartRecordingCamera" | "deviceStopRecordingCamera" | "deviceCameraRecording" | "deviceAutoPicture" | "deviceMicrophoneStatus" | "deviceGetMicrophoneConfiguration" | "deviceMicrophoneData" | "deviceIsRecordingMicrophone" | "deviceStartRecordingMicrophone" | "deviceStopRecordingMicrophone" | "deviceMicrophoneRecording" | "deviceIsDisplayAvailable" | "deviceDisplayStatus" | "deviceDisplayInformation" | "deviceGetDisplayBrightness" | "deviceDisplayContextCommands" | "deviceDisplayReady" | "deviceGetSpriteSheetName" | "deviceDisplayContextState" | "deviceDisplayColor" | "deviceDisplayColorOpacity" | "deviceDisplayOpacity" | "deviceDisplaySpriteSheetUploadStart" | "deviceDisplaySpriteSheetUploadProgress" | "deviceDisplaySpriteSheetUploadComplete" | "deviceGetLedInformation" | "deviceSetLed" | "deviceSmp" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus" | "deviceIsLast" | "deviceGetEnableWifiConnection" | "availableDevice" | "availableDevices">(type: T, listener: (event: ListenerEvent<DeviceManager, "deviceOrientation" | "connectedDevices" | "device*" | "devicePressure" | "devicePressureAutoRangeEnabled" | "devicePressureAutoRangeDisabled" | "devicePressureAutoRange" | "devicePressureMotionAutoRangeEnabled" | "devicePressureMotionAutoRangeDisabled" | "devicePressureMotionAutoRange" | "deviceIsRecordingPressureCalibrationData" | "devicePressureCalibrationDataRecordStart" | "devicePressureCalibrationDataRecordStop" | "devicePressureCalibrationDataRecordingProgress" | "deviceIsTrainingPressureCalibration" | "devicePressureCalibrationTrainStart" | "devicePressureCalibrationTrainEnd" | "devicePressureCalibrationTrainProgress" | "deviceCalibratedPressureModel" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "deviceTapDetector" | "deviceBarometer" | "deviceButtons" | "deviceTouches" | "deviceLight" | "deviceConnectionMessage" | "deviceNotConnected" | "deviceConnecting" | "deviceConnected" | "deviceDisconnecting" | "deviceConnectionStatus" | "deviceIsConnected" | "deviceBatteryLevel" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceManufacturerName" | "deviceModelNumber" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "deviceSoftwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceDeviceInformation" | "deviceGetSensorConfiguration" | "deviceSensorData" | "deviceNumberOfButtons" | "deviceButton" | "deviceButtonDown" | "deviceButtonUp" | "deviceNumberOfTouches" | "deviceTouch" | "deviceTouchDown" | "deviceTouchUp" | "deviceGetFileTypes" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "deviceIsWifiAvailable" | "deviceGetWifiSSID" | "deviceGetWifiPassword" | "deviceIsWifiConnected" | "deviceIpAddress" | "deviceCameraStatus" | "deviceGetCameraConfiguration" | "deviceCameraImageProgress" | "deviceCameraImage" | "deviceIsRecordingCamera" | "deviceStartRecordingCamera" | "deviceStopRecordingCamera" | "deviceCameraRecording" | "deviceAutoPicture" | "deviceMicrophoneStatus" | "deviceGetMicrophoneConfiguration" | "deviceMicrophoneData" | "deviceIsRecordingMicrophone" | "deviceStartRecordingMicrophone" | "deviceStopRecordingMicrophone" | "deviceMicrophoneRecording" | "deviceIsDisplayAvailable" | "deviceDisplayStatus" | "deviceDisplayInformation" | "deviceGetDisplayBrightness" | "deviceDisplayContextCommands" | "deviceDisplayReady" | "deviceGetSpriteSheetName" | "deviceDisplayContextState" | "deviceDisplayColor" | "deviceDisplayColorOpacity" | "deviceDisplayOpacity" | "deviceDisplaySpriteSheetUploadStart" | "deviceDisplaySpriteSheetUploadProgress" | "deviceDisplaySpriteSheetUploadComplete" | "deviceGetLedInformation" | "deviceSetLed" | "deviceSmp" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus" | "deviceIsLast" | "deviceGetEnableWifiConnection" | "availableDevice" | "availableDevices", DeviceManagerEventMessages, T>) => void, options?: EventDispatcherOptions) => void;
    get removeEventListener(): <T extends "deviceOrientation" | "*" | "connectedDevices" | "device*" | "devicePressure" | "devicePressureAutoRangeEnabled" | "devicePressureAutoRangeDisabled" | "devicePressureAutoRange" | "devicePressureMotionAutoRangeEnabled" | "devicePressureMotionAutoRangeDisabled" | "devicePressureMotionAutoRange" | "deviceIsRecordingPressureCalibrationData" | "devicePressureCalibrationDataRecordStart" | "devicePressureCalibrationDataRecordStop" | "devicePressureCalibrationDataRecordingProgress" | "deviceIsTrainingPressureCalibration" | "devicePressureCalibrationTrainStart" | "devicePressureCalibrationTrainEnd" | "devicePressureCalibrationTrainProgress" | "deviceCalibratedPressureModel" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "deviceTapDetector" | "deviceBarometer" | "deviceButtons" | "deviceTouches" | "deviceLight" | "deviceConnectionMessage" | "deviceNotConnected" | "deviceConnecting" | "deviceConnected" | "deviceDisconnecting" | "deviceConnectionStatus" | "deviceIsConnected" | "deviceBatteryLevel" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceManufacturerName" | "deviceModelNumber" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "deviceSoftwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceDeviceInformation" | "deviceGetSensorConfiguration" | "deviceSensorData" | "deviceNumberOfButtons" | "deviceButton" | "deviceButtonDown" | "deviceButtonUp" | "deviceNumberOfTouches" | "deviceTouch" | "deviceTouchDown" | "deviceTouchUp" | "deviceGetFileTypes" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "deviceIsWifiAvailable" | "deviceGetWifiSSID" | "deviceGetWifiPassword" | "deviceIsWifiConnected" | "deviceIpAddress" | "deviceCameraStatus" | "deviceGetCameraConfiguration" | "deviceCameraImageProgress" | "deviceCameraImage" | "deviceIsRecordingCamera" | "deviceStartRecordingCamera" | "deviceStopRecordingCamera" | "deviceCameraRecording" | "deviceAutoPicture" | "deviceMicrophoneStatus" | "deviceGetMicrophoneConfiguration" | "deviceMicrophoneData" | "deviceIsRecordingMicrophone" | "deviceStartRecordingMicrophone" | "deviceStopRecordingMicrophone" | "deviceMicrophoneRecording" | "deviceIsDisplayAvailable" | "deviceDisplayStatus" | "deviceDisplayInformation" | "deviceGetDisplayBrightness" | "deviceDisplayContextCommands" | "deviceDisplayReady" | "deviceGetSpriteSheetName" | "deviceDisplayContextState" | "deviceDisplayColor" | "deviceDisplayColorOpacity" | "deviceDisplayOpacity" | "deviceDisplaySpriteSheetUploadStart" | "deviceDisplaySpriteSheetUploadProgress" | "deviceDisplaySpriteSheetUploadComplete" | "deviceGetLedInformation" | "deviceSetLed" | "deviceSmp" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus" | "deviceIsLast" | "deviceGetEnableWifiConnection" | "availableDevice" | "availableDevices">(type: T, listener: (event: ListenerEvent<DeviceManager, "deviceOrientation" | "connectedDevices" | "device*" | "devicePressure" | "devicePressureAutoRangeEnabled" | "devicePressureAutoRangeDisabled" | "devicePressureAutoRange" | "devicePressureMotionAutoRangeEnabled" | "devicePressureMotionAutoRangeDisabled" | "devicePressureMotionAutoRange" | "deviceIsRecordingPressureCalibrationData" | "devicePressureCalibrationDataRecordStart" | "devicePressureCalibrationDataRecordStop" | "devicePressureCalibrationDataRecordingProgress" | "deviceIsTrainingPressureCalibration" | "devicePressureCalibrationTrainStart" | "devicePressureCalibrationTrainEnd" | "devicePressureCalibrationTrainProgress" | "deviceCalibratedPressureModel" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "deviceTapDetector" | "deviceBarometer" | "deviceButtons" | "deviceTouches" | "deviceLight" | "deviceConnectionMessage" | "deviceNotConnected" | "deviceConnecting" | "deviceConnected" | "deviceDisconnecting" | "deviceConnectionStatus" | "deviceIsConnected" | "deviceBatteryLevel" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceManufacturerName" | "deviceModelNumber" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "deviceSoftwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceDeviceInformation" | "deviceGetSensorConfiguration" | "deviceSensorData" | "deviceNumberOfButtons" | "deviceButton" | "deviceButtonDown" | "deviceButtonUp" | "deviceNumberOfTouches" | "deviceTouch" | "deviceTouchDown" | "deviceTouchUp" | "deviceGetFileTypes" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "deviceIsWifiAvailable" | "deviceGetWifiSSID" | "deviceGetWifiPassword" | "deviceIsWifiConnected" | "deviceIpAddress" | "deviceCameraStatus" | "deviceGetCameraConfiguration" | "deviceCameraImageProgress" | "deviceCameraImage" | "deviceIsRecordingCamera" | "deviceStartRecordingCamera" | "deviceStopRecordingCamera" | "deviceCameraRecording" | "deviceAutoPicture" | "deviceMicrophoneStatus" | "deviceGetMicrophoneConfiguration" | "deviceMicrophoneData" | "deviceIsRecordingMicrophone" | "deviceStartRecordingMicrophone" | "deviceStopRecordingMicrophone" | "deviceMicrophoneRecording" | "deviceIsDisplayAvailable" | "deviceDisplayStatus" | "deviceDisplayInformation" | "deviceGetDisplayBrightness" | "deviceDisplayContextCommands" | "deviceDisplayReady" | "deviceGetSpriteSheetName" | "deviceDisplayContextState" | "deviceDisplayColor" | "deviceDisplayColorOpacity" | "deviceDisplayOpacity" | "deviceDisplaySpriteSheetUploadStart" | "deviceDisplaySpriteSheetUploadProgress" | "deviceDisplaySpriteSheetUploadComplete" | "deviceGetLedInformation" | "deviceSetLed" | "deviceSmp" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus" | "deviceIsLast" | "deviceGetEnableWifiConnection" | "availableDevice" | "availableDevices", DeviceManagerEventMessages, T>) => void) => void;
    get removeEventListeners(): <T extends "deviceOrientation" | "*" | "connectedDevices" | "device*" | "devicePressure" | "devicePressureAutoRangeEnabled" | "devicePressureAutoRangeDisabled" | "devicePressureAutoRange" | "devicePressureMotionAutoRangeEnabled" | "devicePressureMotionAutoRangeDisabled" | "devicePressureMotionAutoRange" | "deviceIsRecordingPressureCalibrationData" | "devicePressureCalibrationDataRecordStart" | "devicePressureCalibrationDataRecordStop" | "devicePressureCalibrationDataRecordingProgress" | "deviceIsTrainingPressureCalibration" | "devicePressureCalibrationTrainStart" | "devicePressureCalibrationTrainEnd" | "devicePressureCalibrationTrainProgress" | "deviceCalibratedPressureModel" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "deviceTapDetector" | "deviceBarometer" | "deviceButtons" | "deviceTouches" | "deviceLight" | "deviceConnectionMessage" | "deviceNotConnected" | "deviceConnecting" | "deviceConnected" | "deviceDisconnecting" | "deviceConnectionStatus" | "deviceIsConnected" | "deviceBatteryLevel" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceManufacturerName" | "deviceModelNumber" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "deviceSoftwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceDeviceInformation" | "deviceGetSensorConfiguration" | "deviceSensorData" | "deviceNumberOfButtons" | "deviceButton" | "deviceButtonDown" | "deviceButtonUp" | "deviceNumberOfTouches" | "deviceTouch" | "deviceTouchDown" | "deviceTouchUp" | "deviceGetFileTypes" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "deviceIsWifiAvailable" | "deviceGetWifiSSID" | "deviceGetWifiPassword" | "deviceIsWifiConnected" | "deviceIpAddress" | "deviceCameraStatus" | "deviceGetCameraConfiguration" | "deviceCameraImageProgress" | "deviceCameraImage" | "deviceIsRecordingCamera" | "deviceStartRecordingCamera" | "deviceStopRecordingCamera" | "deviceCameraRecording" | "deviceAutoPicture" | "deviceMicrophoneStatus" | "deviceGetMicrophoneConfiguration" | "deviceMicrophoneData" | "deviceIsRecordingMicrophone" | "deviceStartRecordingMicrophone" | "deviceStopRecordingMicrophone" | "deviceMicrophoneRecording" | "deviceIsDisplayAvailable" | "deviceDisplayStatus" | "deviceDisplayInformation" | "deviceGetDisplayBrightness" | "deviceDisplayContextCommands" | "deviceDisplayReady" | "deviceGetSpriteSheetName" | "deviceDisplayContextState" | "deviceDisplayColor" | "deviceDisplayColorOpacity" | "deviceDisplayOpacity" | "deviceDisplaySpriteSheetUploadStart" | "deviceDisplaySpriteSheetUploadProgress" | "deviceDisplaySpriteSheetUploadComplete" | "deviceGetLedInformation" | "deviceSetLed" | "deviceSmp" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus" | "deviceIsLast" | "deviceGetEnableWifiConnection" | "availableDevice" | "availableDevices">(type: T) => void;
    private _checkDeviceAvailability;
}
declare const _default: DeviceManager;

declare function wait(delay: number): Promise<void>;
declare class Timer {
    #private;
    get callback(): Function;
    set callback(newCallback: Function);
    get interval(): number;
    set interval(newInterval: number);
    constructor(callback: Function, interval: number);
    get isRunning(): boolean;
    start(immediately?: boolean): void;
    stop(): void;
    restart(startImmediately?: boolean): void;
}

declare function simplifyCurves(curves: DisplayBezierCurve[], epsilon?: number): DisplayBezierCurve[];
declare function simplifyPoints(points: Vector2[], tolerance?: number): Vector2[];
declare function simplifyPointsAsCubicCurveControlPoints(points: Vector2[], error?: number): Vector2[];

declare function hexToRGB(hex: string): DisplayColorRGB;
declare function projectColor(color: DisplayColorRGB, maxColor: DisplayColorRGB): number;
declare function rgbToHex({ r, g, b }: DisplayColorRGB): string;

interface DevicePairPressureData {
    sides: {
        [key in Side]: PressureData;
    };
    sensors: {
        [key in Side]: PressureSensorValue[];
    };
    scaledSum: number;
    normalizedSum: number;
    center?: CenterOfPressure;
    normalizedCenter?: CenterOfPressure;
}
interface DevicePairPressureDataEventMessage {
    pressure: DevicePairPressureData;
}
interface DevicePairPressureDataEventMessages {
    pressure: DevicePairPressureDataEventMessage;
}

type DevicePairSensorDataTimestamps = {
    [side in Side]: number;
};
interface BaseDevicePairSensorDataEventMessage {
    timestamps: DevicePairSensorDataTimestamps;
}
type BaseDevicePairSensorDataEventMessages = DevicePairPressureDataEventMessages;
type _DevicePairSensorDataEventMessages = ExtendInterfaceValues<AddKeysAsPropertyToInterface<BaseDevicePairSensorDataEventMessages, "sensorType">, BaseDevicePairSensorDataEventMessage>;
type DevicePairSensorDataEventMessage = ValueOf<_DevicePairSensorDataEventMessages>;
interface AnyDevicePairSensorDataEventMessages {
    sensorData: DevicePairSensorDataEventMessage;
}
type DevicePairSensorDataEventMessages = _DevicePairSensorDataEventMessages & AnyDevicePairSensorDataEventMessages;

interface BaseDevicePairDeviceEventMessage {
    device: Device;
    side: Side;
}
type DevicePairDeviceEventMessages = ExtendInterfaceValues<AddPrefixToInterfaceKeys<DeviceEventMessages, "device" | Side>, BaseDevicePairDeviceEventMessage>;
interface BaseDevicePairEventMessages {
    isConnected: {
        isConnected: boolean;
    };
    [wildcardDeviceEventType]: WildcardDeviceEventMessage<BaseDevicePairDeviceEventMessage>;
}
declare const DevicePairEventTypes: readonly ["isConnected", "device*", "pressure", "sensorData", ...("deviceOrientation" | "leftPressure" | "leftPressureAutoRangeEnabled" | "leftPressureAutoRangeDisabled" | "leftPressureAutoRange" | "leftPressureMotionAutoRangeEnabled" | "leftPressureMotionAutoRangeDisabled" | "leftPressureMotionAutoRange" | "leftIsRecordingPressureCalibrationData" | "leftPressureCalibrationDataRecordStart" | "leftPressureCalibrationDataRecordStop" | "leftPressureCalibrationDataRecordingProgress" | "leftIsTrainingPressureCalibration" | "leftPressureCalibrationTrainStart" | "leftPressureCalibrationTrainEnd" | "leftPressureCalibrationTrainProgress" | "leftCalibratedPressureModel" | "leftGetTfliteName" | "leftGetTfliteTask" | "leftGetTfliteSampleRate" | "leftGetTfliteSensorTypes" | "leftTfliteIsReady" | "leftGetTfliteCaptureDelay" | "leftGetTfliteThreshold" | "leftGetTfliteInferencingEnabled" | "leftTfliteInference" | "leftAcceleration" | "leftGravity" | "leftLinearAcceleration" | "leftGyroscope" | "leftMagnetometer" | "leftGameRotation" | "leftRotation" | "leftOrientation" | "leftActivity" | "leftStepCounter" | "leftStepDetector" | "leftDeviceOrientation" | "leftTapDetector" | "leftBarometer" | "leftButtons" | "leftTouches" | "leftLight" | "leftConnectionMessage" | "leftNotConnected" | "leftConnecting" | "leftConnected" | "leftDisconnecting" | "leftConnectionStatus" | "leftIsConnected" | "leftBatteryLevel" | "leftIsCharging" | "leftGetBatteryCurrent" | "leftGetMtu" | "leftGetId" | "leftGetName" | "leftGetType" | "leftGetCurrentTime" | "leftManufacturerName" | "leftModelNumber" | "leftHardwareRevision" | "leftFirmwareRevision" | "leftSoftwareRevision" | "leftPnpId" | "leftSerialNumber" | "leftDeviceInformation" | "leftGetSensorConfiguration" | "leftSensorData" | "leftNumberOfButtons" | "leftButton" | "leftButtonDown" | "leftButtonUp" | "leftNumberOfTouches" | "leftTouch" | "leftTouchDown" | "leftTouchUp" | "leftGetFileTypes" | "leftMaxFileLength" | "leftGetFileType" | "leftGetFileLength" | "leftGetFileChecksum" | "leftFileTransferStatus" | "leftGetFileBlock" | "leftFileTransferProgress" | "leftFileTransferComplete" | "leftFileReceived" | "leftIsWifiAvailable" | "leftGetWifiSSID" | "leftGetWifiPassword" | "leftIsWifiConnected" | "leftIpAddress" | "leftCameraStatus" | "leftGetCameraConfiguration" | "leftCameraImageProgress" | "leftCameraImage" | "leftIsRecordingCamera" | "leftStartRecordingCamera" | "leftStopRecordingCamera" | "leftCameraRecording" | "leftAutoPicture" | "leftMicrophoneStatus" | "leftGetMicrophoneConfiguration" | "leftMicrophoneData" | "leftIsRecordingMicrophone" | "leftStartRecordingMicrophone" | "leftStopRecordingMicrophone" | "leftMicrophoneRecording" | "leftIsDisplayAvailable" | "leftDisplayStatus" | "leftDisplayInformation" | "leftGetDisplayBrightness" | "leftDisplayContextCommands" | "leftDisplayReady" | "leftGetSpriteSheetName" | "leftDisplayContextState" | "leftDisplayColor" | "leftDisplayColorOpacity" | "leftDisplayOpacity" | "leftDisplaySpriteSheetUploadStart" | "leftDisplaySpriteSheetUploadProgress" | "leftDisplaySpriteSheetUploadComplete" | "leftGetLedInformation" | "leftSetLed" | "leftSmp" | "leftFirmwareImages" | "leftFirmwareUploadProgress" | "leftFirmwareStatus" | "leftIsLast" | "leftGetEnableWifiConnection" | "rightPressure" | "rightPressureAutoRangeEnabled" | "rightPressureAutoRangeDisabled" | "rightPressureAutoRange" | "rightPressureMotionAutoRangeEnabled" | "rightPressureMotionAutoRangeDisabled" | "rightPressureMotionAutoRange" | "rightIsRecordingPressureCalibrationData" | "rightPressureCalibrationDataRecordStart" | "rightPressureCalibrationDataRecordStop" | "rightPressureCalibrationDataRecordingProgress" | "rightIsTrainingPressureCalibration" | "rightPressureCalibrationTrainStart" | "rightPressureCalibrationTrainEnd" | "rightPressureCalibrationTrainProgress" | "rightCalibratedPressureModel" | "rightGetTfliteName" | "rightGetTfliteTask" | "rightGetTfliteSampleRate" | "rightGetTfliteSensorTypes" | "rightTfliteIsReady" | "rightGetTfliteCaptureDelay" | "rightGetTfliteThreshold" | "rightGetTfliteInferencingEnabled" | "rightTfliteInference" | "rightAcceleration" | "rightGravity" | "rightLinearAcceleration" | "rightGyroscope" | "rightMagnetometer" | "rightGameRotation" | "rightRotation" | "rightOrientation" | "rightActivity" | "rightStepCounter" | "rightStepDetector" | "rightDeviceOrientation" | "rightTapDetector" | "rightBarometer" | "rightButtons" | "rightTouches" | "rightLight" | "rightConnectionMessage" | "rightNotConnected" | "rightConnecting" | "rightConnected" | "rightDisconnecting" | "rightConnectionStatus" | "rightIsConnected" | "rightBatteryLevel" | "rightIsCharging" | "rightGetBatteryCurrent" | "rightGetMtu" | "rightGetId" | "rightGetName" | "rightGetType" | "rightGetCurrentTime" | "rightManufacturerName" | "rightModelNumber" | "rightHardwareRevision" | "rightFirmwareRevision" | "rightSoftwareRevision" | "rightPnpId" | "rightSerialNumber" | "rightDeviceInformation" | "rightGetSensorConfiguration" | "rightSensorData" | "rightNumberOfButtons" | "rightButton" | "rightButtonDown" | "rightButtonUp" | "rightNumberOfTouches" | "rightTouch" | "rightTouchDown" | "rightTouchUp" | "rightGetFileTypes" | "rightMaxFileLength" | "rightGetFileType" | "rightGetFileLength" | "rightGetFileChecksum" | "rightFileTransferStatus" | "rightGetFileBlock" | "rightFileTransferProgress" | "rightFileTransferComplete" | "rightFileReceived" | "rightIsWifiAvailable" | "rightGetWifiSSID" | "rightGetWifiPassword" | "rightIsWifiConnected" | "rightIpAddress" | "rightCameraStatus" | "rightGetCameraConfiguration" | "rightCameraImageProgress" | "rightCameraImage" | "rightIsRecordingCamera" | "rightStartRecordingCamera" | "rightStopRecordingCamera" | "rightCameraRecording" | "rightAutoPicture" | "rightMicrophoneStatus" | "rightGetMicrophoneConfiguration" | "rightMicrophoneData" | "rightIsRecordingMicrophone" | "rightStartRecordingMicrophone" | "rightStopRecordingMicrophone" | "rightMicrophoneRecording" | "rightIsDisplayAvailable" | "rightDisplayStatus" | "rightDisplayInformation" | "rightGetDisplayBrightness" | "rightDisplayContextCommands" | "rightDisplayReady" | "rightGetSpriteSheetName" | "rightDisplayContextState" | "rightDisplayColor" | "rightDisplayColorOpacity" | "rightDisplayOpacity" | "rightDisplaySpriteSheetUploadStart" | "rightDisplaySpriteSheetUploadProgress" | "rightDisplaySpriteSheetUploadComplete" | "rightGetLedInformation" | "rightSetLed" | "rightSmp" | "rightFirmwareImages" | "rightFirmwareUploadProgress" | "rightFirmwareStatus" | "rightIsLast" | "rightGetEnableWifiConnection" | "devicePressure" | "devicePressureAutoRangeEnabled" | "devicePressureAutoRangeDisabled" | "devicePressureAutoRange" | "devicePressureMotionAutoRangeEnabled" | "devicePressureMotionAutoRangeDisabled" | "devicePressureMotionAutoRange" | "deviceIsRecordingPressureCalibrationData" | "devicePressureCalibrationDataRecordStart" | "devicePressureCalibrationDataRecordStop" | "devicePressureCalibrationDataRecordingProgress" | "deviceIsTrainingPressureCalibration" | "devicePressureCalibrationTrainStart" | "devicePressureCalibrationTrainEnd" | "devicePressureCalibrationTrainProgress" | "deviceCalibratedPressureModel" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "deviceTapDetector" | "deviceBarometer" | "deviceButtons" | "deviceTouches" | "deviceLight" | "deviceConnectionMessage" | "deviceNotConnected" | "deviceConnecting" | "deviceConnected" | "deviceDisconnecting" | "deviceConnectionStatus" | "deviceIsConnected" | "deviceBatteryLevel" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceManufacturerName" | "deviceModelNumber" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "deviceSoftwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceDeviceInformation" | "deviceGetSensorConfiguration" | "deviceSensorData" | "deviceNumberOfButtons" | "deviceButton" | "deviceButtonDown" | "deviceButtonUp" | "deviceNumberOfTouches" | "deviceTouch" | "deviceTouchDown" | "deviceTouchUp" | "deviceGetFileTypes" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "deviceIsWifiAvailable" | "deviceGetWifiSSID" | "deviceGetWifiPassword" | "deviceIsWifiConnected" | "deviceIpAddress" | "deviceCameraStatus" | "deviceGetCameraConfiguration" | "deviceCameraImageProgress" | "deviceCameraImage" | "deviceIsRecordingCamera" | "deviceStartRecordingCamera" | "deviceStopRecordingCamera" | "deviceCameraRecording" | "deviceAutoPicture" | "deviceMicrophoneStatus" | "deviceGetMicrophoneConfiguration" | "deviceMicrophoneData" | "deviceIsRecordingMicrophone" | "deviceStartRecordingMicrophone" | "deviceStopRecordingMicrophone" | "deviceMicrophoneRecording" | "deviceIsDisplayAvailable" | "deviceDisplayStatus" | "deviceDisplayInformation" | "deviceGetDisplayBrightness" | "deviceDisplayContextCommands" | "deviceDisplayReady" | "deviceGetSpriteSheetName" | "deviceDisplayContextState" | "deviceDisplayColor" | "deviceDisplayColorOpacity" | "deviceDisplayOpacity" | "deviceDisplaySpriteSheetUploadStart" | "deviceDisplaySpriteSheetUploadProgress" | "deviceDisplaySpriteSheetUploadComplete" | "deviceGetLedInformation" | "deviceSetLed" | "deviceSmp" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus" | "deviceIsLast" | "deviceGetEnableWifiConnection")[]];
type DevicePairEventType = (typeof DevicePairEventTypes)[number];
type DevicePairEventMessages = BaseDevicePairEventMessages & DevicePairSensorDataEventMessages & DevicePairDeviceEventMessages;
type DevicePairEventDispatcherTypes = EventDispatcherTypes<DevicePair, DevicePairEventType, DevicePairEventMessages>;
type DevicePairEvent = DevicePairEventDispatcherTypes["Event"];
type DevicePairEventMap = DevicePairEventDispatcherTypes["EventMap"];
type DevicePairEventListenerMap = DevicePairEventDispatcherTypes["EventListenerMap"];
type BoundDevicePairEventListeners = DevicePairEventDispatcherTypes["BoundEventListeners"];
declare const DevicePairTypes: readonly ["insoles", "gloves"];
type DevicePairType = (typeof DevicePairTypes)[number];
declare class DevicePair {
    #private;
    constructor(type: DevicePairType);
    get sides(): readonly ["left", "right"];
    get type(): "insoles" | "gloves";
    get addEventListener(): <T extends "pressure" | "deviceOrientation" | "*" | "isConnected" | "sensorData" | "device*" | "leftPressure" | "leftPressureAutoRangeEnabled" | "leftPressureAutoRangeDisabled" | "leftPressureAutoRange" | "leftPressureMotionAutoRangeEnabled" | "leftPressureMotionAutoRangeDisabled" | "leftPressureMotionAutoRange" | "leftIsRecordingPressureCalibrationData" | "leftPressureCalibrationDataRecordStart" | "leftPressureCalibrationDataRecordStop" | "leftPressureCalibrationDataRecordingProgress" | "leftIsTrainingPressureCalibration" | "leftPressureCalibrationTrainStart" | "leftPressureCalibrationTrainEnd" | "leftPressureCalibrationTrainProgress" | "leftCalibratedPressureModel" | "leftGetTfliteName" | "leftGetTfliteTask" | "leftGetTfliteSampleRate" | "leftGetTfliteSensorTypes" | "leftTfliteIsReady" | "leftGetTfliteCaptureDelay" | "leftGetTfliteThreshold" | "leftGetTfliteInferencingEnabled" | "leftTfliteInference" | "leftAcceleration" | "leftGravity" | "leftLinearAcceleration" | "leftGyroscope" | "leftMagnetometer" | "leftGameRotation" | "leftRotation" | "leftOrientation" | "leftActivity" | "leftStepCounter" | "leftStepDetector" | "leftDeviceOrientation" | "leftTapDetector" | "leftBarometer" | "leftButtons" | "leftTouches" | "leftLight" | "leftConnectionMessage" | "leftNotConnected" | "leftConnecting" | "leftConnected" | "leftDisconnecting" | "leftConnectionStatus" | "leftIsConnected" | "leftBatteryLevel" | "leftIsCharging" | "leftGetBatteryCurrent" | "leftGetMtu" | "leftGetId" | "leftGetName" | "leftGetType" | "leftGetCurrentTime" | "leftManufacturerName" | "leftModelNumber" | "leftHardwareRevision" | "leftFirmwareRevision" | "leftSoftwareRevision" | "leftPnpId" | "leftSerialNumber" | "leftDeviceInformation" | "leftGetSensorConfiguration" | "leftSensorData" | "leftNumberOfButtons" | "leftButton" | "leftButtonDown" | "leftButtonUp" | "leftNumberOfTouches" | "leftTouch" | "leftTouchDown" | "leftTouchUp" | "leftGetFileTypes" | "leftMaxFileLength" | "leftGetFileType" | "leftGetFileLength" | "leftGetFileChecksum" | "leftFileTransferStatus" | "leftGetFileBlock" | "leftFileTransferProgress" | "leftFileTransferComplete" | "leftFileReceived" | "leftIsWifiAvailable" | "leftGetWifiSSID" | "leftGetWifiPassword" | "leftIsWifiConnected" | "leftIpAddress" | "leftCameraStatus" | "leftGetCameraConfiguration" | "leftCameraImageProgress" | "leftCameraImage" | "leftIsRecordingCamera" | "leftStartRecordingCamera" | "leftStopRecordingCamera" | "leftCameraRecording" | "leftAutoPicture" | "leftMicrophoneStatus" | "leftGetMicrophoneConfiguration" | "leftMicrophoneData" | "leftIsRecordingMicrophone" | "leftStartRecordingMicrophone" | "leftStopRecordingMicrophone" | "leftMicrophoneRecording" | "leftIsDisplayAvailable" | "leftDisplayStatus" | "leftDisplayInformation" | "leftGetDisplayBrightness" | "leftDisplayContextCommands" | "leftDisplayReady" | "leftGetSpriteSheetName" | "leftDisplayContextState" | "leftDisplayColor" | "leftDisplayColorOpacity" | "leftDisplayOpacity" | "leftDisplaySpriteSheetUploadStart" | "leftDisplaySpriteSheetUploadProgress" | "leftDisplaySpriteSheetUploadComplete" | "leftGetLedInformation" | "leftSetLed" | "leftSmp" | "leftFirmwareImages" | "leftFirmwareUploadProgress" | "leftFirmwareStatus" | "leftIsLast" | "leftGetEnableWifiConnection" | "rightPressure" | "rightPressureAutoRangeEnabled" | "rightPressureAutoRangeDisabled" | "rightPressureAutoRange" | "rightPressureMotionAutoRangeEnabled" | "rightPressureMotionAutoRangeDisabled" | "rightPressureMotionAutoRange" | "rightIsRecordingPressureCalibrationData" | "rightPressureCalibrationDataRecordStart" | "rightPressureCalibrationDataRecordStop" | "rightPressureCalibrationDataRecordingProgress" | "rightIsTrainingPressureCalibration" | "rightPressureCalibrationTrainStart" | "rightPressureCalibrationTrainEnd" | "rightPressureCalibrationTrainProgress" | "rightCalibratedPressureModel" | "rightGetTfliteName" | "rightGetTfliteTask" | "rightGetTfliteSampleRate" | "rightGetTfliteSensorTypes" | "rightTfliteIsReady" | "rightGetTfliteCaptureDelay" | "rightGetTfliteThreshold" | "rightGetTfliteInferencingEnabled" | "rightTfliteInference" | "rightAcceleration" | "rightGravity" | "rightLinearAcceleration" | "rightGyroscope" | "rightMagnetometer" | "rightGameRotation" | "rightRotation" | "rightOrientation" | "rightActivity" | "rightStepCounter" | "rightStepDetector" | "rightDeviceOrientation" | "rightTapDetector" | "rightBarometer" | "rightButtons" | "rightTouches" | "rightLight" | "rightConnectionMessage" | "rightNotConnected" | "rightConnecting" | "rightConnected" | "rightDisconnecting" | "rightConnectionStatus" | "rightIsConnected" | "rightBatteryLevel" | "rightIsCharging" | "rightGetBatteryCurrent" | "rightGetMtu" | "rightGetId" | "rightGetName" | "rightGetType" | "rightGetCurrentTime" | "rightManufacturerName" | "rightModelNumber" | "rightHardwareRevision" | "rightFirmwareRevision" | "rightSoftwareRevision" | "rightPnpId" | "rightSerialNumber" | "rightDeviceInformation" | "rightGetSensorConfiguration" | "rightSensorData" | "rightNumberOfButtons" | "rightButton" | "rightButtonDown" | "rightButtonUp" | "rightNumberOfTouches" | "rightTouch" | "rightTouchDown" | "rightTouchUp" | "rightGetFileTypes" | "rightMaxFileLength" | "rightGetFileType" | "rightGetFileLength" | "rightGetFileChecksum" | "rightFileTransferStatus" | "rightGetFileBlock" | "rightFileTransferProgress" | "rightFileTransferComplete" | "rightFileReceived" | "rightIsWifiAvailable" | "rightGetWifiSSID" | "rightGetWifiPassword" | "rightIsWifiConnected" | "rightIpAddress" | "rightCameraStatus" | "rightGetCameraConfiguration" | "rightCameraImageProgress" | "rightCameraImage" | "rightIsRecordingCamera" | "rightStartRecordingCamera" | "rightStopRecordingCamera" | "rightCameraRecording" | "rightAutoPicture" | "rightMicrophoneStatus" | "rightGetMicrophoneConfiguration" | "rightMicrophoneData" | "rightIsRecordingMicrophone" | "rightStartRecordingMicrophone" | "rightStopRecordingMicrophone" | "rightMicrophoneRecording" | "rightIsDisplayAvailable" | "rightDisplayStatus" | "rightDisplayInformation" | "rightGetDisplayBrightness" | "rightDisplayContextCommands" | "rightDisplayReady" | "rightGetSpriteSheetName" | "rightDisplayContextState" | "rightDisplayColor" | "rightDisplayColorOpacity" | "rightDisplayOpacity" | "rightDisplaySpriteSheetUploadStart" | "rightDisplaySpriteSheetUploadProgress" | "rightDisplaySpriteSheetUploadComplete" | "rightGetLedInformation" | "rightSetLed" | "rightSmp" | "rightFirmwareImages" | "rightFirmwareUploadProgress" | "rightFirmwareStatus" | "rightIsLast" | "rightGetEnableWifiConnection" | "devicePressure" | "devicePressureAutoRangeEnabled" | "devicePressureAutoRangeDisabled" | "devicePressureAutoRange" | "devicePressureMotionAutoRangeEnabled" | "devicePressureMotionAutoRangeDisabled" | "devicePressureMotionAutoRange" | "deviceIsRecordingPressureCalibrationData" | "devicePressureCalibrationDataRecordStart" | "devicePressureCalibrationDataRecordStop" | "devicePressureCalibrationDataRecordingProgress" | "deviceIsTrainingPressureCalibration" | "devicePressureCalibrationTrainStart" | "devicePressureCalibrationTrainEnd" | "devicePressureCalibrationTrainProgress" | "deviceCalibratedPressureModel" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "deviceTapDetector" | "deviceBarometer" | "deviceButtons" | "deviceTouches" | "deviceLight" | "deviceConnectionMessage" | "deviceNotConnected" | "deviceConnecting" | "deviceConnected" | "deviceDisconnecting" | "deviceConnectionStatus" | "deviceIsConnected" | "deviceBatteryLevel" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceManufacturerName" | "deviceModelNumber" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "deviceSoftwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceDeviceInformation" | "deviceGetSensorConfiguration" | "deviceSensorData" | "deviceNumberOfButtons" | "deviceButton" | "deviceButtonDown" | "deviceButtonUp" | "deviceNumberOfTouches" | "deviceTouch" | "deviceTouchDown" | "deviceTouchUp" | "deviceGetFileTypes" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "deviceIsWifiAvailable" | "deviceGetWifiSSID" | "deviceGetWifiPassword" | "deviceIsWifiConnected" | "deviceIpAddress" | "deviceCameraStatus" | "deviceGetCameraConfiguration" | "deviceCameraImageProgress" | "deviceCameraImage" | "deviceIsRecordingCamera" | "deviceStartRecordingCamera" | "deviceStopRecordingCamera" | "deviceCameraRecording" | "deviceAutoPicture" | "deviceMicrophoneStatus" | "deviceGetMicrophoneConfiguration" | "deviceMicrophoneData" | "deviceIsRecordingMicrophone" | "deviceStartRecordingMicrophone" | "deviceStopRecordingMicrophone" | "deviceMicrophoneRecording" | "deviceIsDisplayAvailable" | "deviceDisplayStatus" | "deviceDisplayInformation" | "deviceGetDisplayBrightness" | "deviceDisplayContextCommands" | "deviceDisplayReady" | "deviceGetSpriteSheetName" | "deviceDisplayContextState" | "deviceDisplayColor" | "deviceDisplayColorOpacity" | "deviceDisplayOpacity" | "deviceDisplaySpriteSheetUploadStart" | "deviceDisplaySpriteSheetUploadProgress" | "deviceDisplaySpriteSheetUploadComplete" | "deviceGetLedInformation" | "deviceSetLed" | "deviceSmp" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus" | "deviceIsLast" | "deviceGetEnableWifiConnection">(type: T, listener: (event: ListenerEvent<DevicePair, "pressure" | "deviceOrientation" | "isConnected" | "sensorData" | "device*" | "leftPressure" | "leftPressureAutoRangeEnabled" | "leftPressureAutoRangeDisabled" | "leftPressureAutoRange" | "leftPressureMotionAutoRangeEnabled" | "leftPressureMotionAutoRangeDisabled" | "leftPressureMotionAutoRange" | "leftIsRecordingPressureCalibrationData" | "leftPressureCalibrationDataRecordStart" | "leftPressureCalibrationDataRecordStop" | "leftPressureCalibrationDataRecordingProgress" | "leftIsTrainingPressureCalibration" | "leftPressureCalibrationTrainStart" | "leftPressureCalibrationTrainEnd" | "leftPressureCalibrationTrainProgress" | "leftCalibratedPressureModel" | "leftGetTfliteName" | "leftGetTfliteTask" | "leftGetTfliteSampleRate" | "leftGetTfliteSensorTypes" | "leftTfliteIsReady" | "leftGetTfliteCaptureDelay" | "leftGetTfliteThreshold" | "leftGetTfliteInferencingEnabled" | "leftTfliteInference" | "leftAcceleration" | "leftGravity" | "leftLinearAcceleration" | "leftGyroscope" | "leftMagnetometer" | "leftGameRotation" | "leftRotation" | "leftOrientation" | "leftActivity" | "leftStepCounter" | "leftStepDetector" | "leftDeviceOrientation" | "leftTapDetector" | "leftBarometer" | "leftButtons" | "leftTouches" | "leftLight" | "leftConnectionMessage" | "leftNotConnected" | "leftConnecting" | "leftConnected" | "leftDisconnecting" | "leftConnectionStatus" | "leftIsConnected" | "leftBatteryLevel" | "leftIsCharging" | "leftGetBatteryCurrent" | "leftGetMtu" | "leftGetId" | "leftGetName" | "leftGetType" | "leftGetCurrentTime" | "leftManufacturerName" | "leftModelNumber" | "leftHardwareRevision" | "leftFirmwareRevision" | "leftSoftwareRevision" | "leftPnpId" | "leftSerialNumber" | "leftDeviceInformation" | "leftGetSensorConfiguration" | "leftSensorData" | "leftNumberOfButtons" | "leftButton" | "leftButtonDown" | "leftButtonUp" | "leftNumberOfTouches" | "leftTouch" | "leftTouchDown" | "leftTouchUp" | "leftGetFileTypes" | "leftMaxFileLength" | "leftGetFileType" | "leftGetFileLength" | "leftGetFileChecksum" | "leftFileTransferStatus" | "leftGetFileBlock" | "leftFileTransferProgress" | "leftFileTransferComplete" | "leftFileReceived" | "leftIsWifiAvailable" | "leftGetWifiSSID" | "leftGetWifiPassword" | "leftIsWifiConnected" | "leftIpAddress" | "leftCameraStatus" | "leftGetCameraConfiguration" | "leftCameraImageProgress" | "leftCameraImage" | "leftIsRecordingCamera" | "leftStartRecordingCamera" | "leftStopRecordingCamera" | "leftCameraRecording" | "leftAutoPicture" | "leftMicrophoneStatus" | "leftGetMicrophoneConfiguration" | "leftMicrophoneData" | "leftIsRecordingMicrophone" | "leftStartRecordingMicrophone" | "leftStopRecordingMicrophone" | "leftMicrophoneRecording" | "leftIsDisplayAvailable" | "leftDisplayStatus" | "leftDisplayInformation" | "leftGetDisplayBrightness" | "leftDisplayContextCommands" | "leftDisplayReady" | "leftGetSpriteSheetName" | "leftDisplayContextState" | "leftDisplayColor" | "leftDisplayColorOpacity" | "leftDisplayOpacity" | "leftDisplaySpriteSheetUploadStart" | "leftDisplaySpriteSheetUploadProgress" | "leftDisplaySpriteSheetUploadComplete" | "leftGetLedInformation" | "leftSetLed" | "leftSmp" | "leftFirmwareImages" | "leftFirmwareUploadProgress" | "leftFirmwareStatus" | "leftIsLast" | "leftGetEnableWifiConnection" | "rightPressure" | "rightPressureAutoRangeEnabled" | "rightPressureAutoRangeDisabled" | "rightPressureAutoRange" | "rightPressureMotionAutoRangeEnabled" | "rightPressureMotionAutoRangeDisabled" | "rightPressureMotionAutoRange" | "rightIsRecordingPressureCalibrationData" | "rightPressureCalibrationDataRecordStart" | "rightPressureCalibrationDataRecordStop" | "rightPressureCalibrationDataRecordingProgress" | "rightIsTrainingPressureCalibration" | "rightPressureCalibrationTrainStart" | "rightPressureCalibrationTrainEnd" | "rightPressureCalibrationTrainProgress" | "rightCalibratedPressureModel" | "rightGetTfliteName" | "rightGetTfliteTask" | "rightGetTfliteSampleRate" | "rightGetTfliteSensorTypes" | "rightTfliteIsReady" | "rightGetTfliteCaptureDelay" | "rightGetTfliteThreshold" | "rightGetTfliteInferencingEnabled" | "rightTfliteInference" | "rightAcceleration" | "rightGravity" | "rightLinearAcceleration" | "rightGyroscope" | "rightMagnetometer" | "rightGameRotation" | "rightRotation" | "rightOrientation" | "rightActivity" | "rightStepCounter" | "rightStepDetector" | "rightDeviceOrientation" | "rightTapDetector" | "rightBarometer" | "rightButtons" | "rightTouches" | "rightLight" | "rightConnectionMessage" | "rightNotConnected" | "rightConnecting" | "rightConnected" | "rightDisconnecting" | "rightConnectionStatus" | "rightIsConnected" | "rightBatteryLevel" | "rightIsCharging" | "rightGetBatteryCurrent" | "rightGetMtu" | "rightGetId" | "rightGetName" | "rightGetType" | "rightGetCurrentTime" | "rightManufacturerName" | "rightModelNumber" | "rightHardwareRevision" | "rightFirmwareRevision" | "rightSoftwareRevision" | "rightPnpId" | "rightSerialNumber" | "rightDeviceInformation" | "rightGetSensorConfiguration" | "rightSensorData" | "rightNumberOfButtons" | "rightButton" | "rightButtonDown" | "rightButtonUp" | "rightNumberOfTouches" | "rightTouch" | "rightTouchDown" | "rightTouchUp" | "rightGetFileTypes" | "rightMaxFileLength" | "rightGetFileType" | "rightGetFileLength" | "rightGetFileChecksum" | "rightFileTransferStatus" | "rightGetFileBlock" | "rightFileTransferProgress" | "rightFileTransferComplete" | "rightFileReceived" | "rightIsWifiAvailable" | "rightGetWifiSSID" | "rightGetWifiPassword" | "rightIsWifiConnected" | "rightIpAddress" | "rightCameraStatus" | "rightGetCameraConfiguration" | "rightCameraImageProgress" | "rightCameraImage" | "rightIsRecordingCamera" | "rightStartRecordingCamera" | "rightStopRecordingCamera" | "rightCameraRecording" | "rightAutoPicture" | "rightMicrophoneStatus" | "rightGetMicrophoneConfiguration" | "rightMicrophoneData" | "rightIsRecordingMicrophone" | "rightStartRecordingMicrophone" | "rightStopRecordingMicrophone" | "rightMicrophoneRecording" | "rightIsDisplayAvailable" | "rightDisplayStatus" | "rightDisplayInformation" | "rightGetDisplayBrightness" | "rightDisplayContextCommands" | "rightDisplayReady" | "rightGetSpriteSheetName" | "rightDisplayContextState" | "rightDisplayColor" | "rightDisplayColorOpacity" | "rightDisplayOpacity" | "rightDisplaySpriteSheetUploadStart" | "rightDisplaySpriteSheetUploadProgress" | "rightDisplaySpriteSheetUploadComplete" | "rightGetLedInformation" | "rightSetLed" | "rightSmp" | "rightFirmwareImages" | "rightFirmwareUploadProgress" | "rightFirmwareStatus" | "rightIsLast" | "rightGetEnableWifiConnection" | "devicePressure" | "devicePressureAutoRangeEnabled" | "devicePressureAutoRangeDisabled" | "devicePressureAutoRange" | "devicePressureMotionAutoRangeEnabled" | "devicePressureMotionAutoRangeDisabled" | "devicePressureMotionAutoRange" | "deviceIsRecordingPressureCalibrationData" | "devicePressureCalibrationDataRecordStart" | "devicePressureCalibrationDataRecordStop" | "devicePressureCalibrationDataRecordingProgress" | "deviceIsTrainingPressureCalibration" | "devicePressureCalibrationTrainStart" | "devicePressureCalibrationTrainEnd" | "devicePressureCalibrationTrainProgress" | "deviceCalibratedPressureModel" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "deviceTapDetector" | "deviceBarometer" | "deviceButtons" | "deviceTouches" | "deviceLight" | "deviceConnectionMessage" | "deviceNotConnected" | "deviceConnecting" | "deviceConnected" | "deviceDisconnecting" | "deviceConnectionStatus" | "deviceIsConnected" | "deviceBatteryLevel" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceManufacturerName" | "deviceModelNumber" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "deviceSoftwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceDeviceInformation" | "deviceGetSensorConfiguration" | "deviceSensorData" | "deviceNumberOfButtons" | "deviceButton" | "deviceButtonDown" | "deviceButtonUp" | "deviceNumberOfTouches" | "deviceTouch" | "deviceTouchDown" | "deviceTouchUp" | "deviceGetFileTypes" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "deviceIsWifiAvailable" | "deviceGetWifiSSID" | "deviceGetWifiPassword" | "deviceIsWifiConnected" | "deviceIpAddress" | "deviceCameraStatus" | "deviceGetCameraConfiguration" | "deviceCameraImageProgress" | "deviceCameraImage" | "deviceIsRecordingCamera" | "deviceStartRecordingCamera" | "deviceStopRecordingCamera" | "deviceCameraRecording" | "deviceAutoPicture" | "deviceMicrophoneStatus" | "deviceGetMicrophoneConfiguration" | "deviceMicrophoneData" | "deviceIsRecordingMicrophone" | "deviceStartRecordingMicrophone" | "deviceStopRecordingMicrophone" | "deviceMicrophoneRecording" | "deviceIsDisplayAvailable" | "deviceDisplayStatus" | "deviceDisplayInformation" | "deviceGetDisplayBrightness" | "deviceDisplayContextCommands" | "deviceDisplayReady" | "deviceGetSpriteSheetName" | "deviceDisplayContextState" | "deviceDisplayColor" | "deviceDisplayColorOpacity" | "deviceDisplayOpacity" | "deviceDisplaySpriteSheetUploadStart" | "deviceDisplaySpriteSheetUploadProgress" | "deviceDisplaySpriteSheetUploadComplete" | "deviceGetLedInformation" | "deviceSetLed" | "deviceSmp" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus" | "deviceIsLast" | "deviceGetEnableWifiConnection", DevicePairEventMessages, T>) => void, options?: EventDispatcherOptions) => void;
    get removeEventListener(): <T extends "pressure" | "deviceOrientation" | "*" | "isConnected" | "sensorData" | "device*" | "leftPressure" | "leftPressureAutoRangeEnabled" | "leftPressureAutoRangeDisabled" | "leftPressureAutoRange" | "leftPressureMotionAutoRangeEnabled" | "leftPressureMotionAutoRangeDisabled" | "leftPressureMotionAutoRange" | "leftIsRecordingPressureCalibrationData" | "leftPressureCalibrationDataRecordStart" | "leftPressureCalibrationDataRecordStop" | "leftPressureCalibrationDataRecordingProgress" | "leftIsTrainingPressureCalibration" | "leftPressureCalibrationTrainStart" | "leftPressureCalibrationTrainEnd" | "leftPressureCalibrationTrainProgress" | "leftCalibratedPressureModel" | "leftGetTfliteName" | "leftGetTfliteTask" | "leftGetTfliteSampleRate" | "leftGetTfliteSensorTypes" | "leftTfliteIsReady" | "leftGetTfliteCaptureDelay" | "leftGetTfliteThreshold" | "leftGetTfliteInferencingEnabled" | "leftTfliteInference" | "leftAcceleration" | "leftGravity" | "leftLinearAcceleration" | "leftGyroscope" | "leftMagnetometer" | "leftGameRotation" | "leftRotation" | "leftOrientation" | "leftActivity" | "leftStepCounter" | "leftStepDetector" | "leftDeviceOrientation" | "leftTapDetector" | "leftBarometer" | "leftButtons" | "leftTouches" | "leftLight" | "leftConnectionMessage" | "leftNotConnected" | "leftConnecting" | "leftConnected" | "leftDisconnecting" | "leftConnectionStatus" | "leftIsConnected" | "leftBatteryLevel" | "leftIsCharging" | "leftGetBatteryCurrent" | "leftGetMtu" | "leftGetId" | "leftGetName" | "leftGetType" | "leftGetCurrentTime" | "leftManufacturerName" | "leftModelNumber" | "leftHardwareRevision" | "leftFirmwareRevision" | "leftSoftwareRevision" | "leftPnpId" | "leftSerialNumber" | "leftDeviceInformation" | "leftGetSensorConfiguration" | "leftSensorData" | "leftNumberOfButtons" | "leftButton" | "leftButtonDown" | "leftButtonUp" | "leftNumberOfTouches" | "leftTouch" | "leftTouchDown" | "leftTouchUp" | "leftGetFileTypes" | "leftMaxFileLength" | "leftGetFileType" | "leftGetFileLength" | "leftGetFileChecksum" | "leftFileTransferStatus" | "leftGetFileBlock" | "leftFileTransferProgress" | "leftFileTransferComplete" | "leftFileReceived" | "leftIsWifiAvailable" | "leftGetWifiSSID" | "leftGetWifiPassword" | "leftIsWifiConnected" | "leftIpAddress" | "leftCameraStatus" | "leftGetCameraConfiguration" | "leftCameraImageProgress" | "leftCameraImage" | "leftIsRecordingCamera" | "leftStartRecordingCamera" | "leftStopRecordingCamera" | "leftCameraRecording" | "leftAutoPicture" | "leftMicrophoneStatus" | "leftGetMicrophoneConfiguration" | "leftMicrophoneData" | "leftIsRecordingMicrophone" | "leftStartRecordingMicrophone" | "leftStopRecordingMicrophone" | "leftMicrophoneRecording" | "leftIsDisplayAvailable" | "leftDisplayStatus" | "leftDisplayInformation" | "leftGetDisplayBrightness" | "leftDisplayContextCommands" | "leftDisplayReady" | "leftGetSpriteSheetName" | "leftDisplayContextState" | "leftDisplayColor" | "leftDisplayColorOpacity" | "leftDisplayOpacity" | "leftDisplaySpriteSheetUploadStart" | "leftDisplaySpriteSheetUploadProgress" | "leftDisplaySpriteSheetUploadComplete" | "leftGetLedInformation" | "leftSetLed" | "leftSmp" | "leftFirmwareImages" | "leftFirmwareUploadProgress" | "leftFirmwareStatus" | "leftIsLast" | "leftGetEnableWifiConnection" | "rightPressure" | "rightPressureAutoRangeEnabled" | "rightPressureAutoRangeDisabled" | "rightPressureAutoRange" | "rightPressureMotionAutoRangeEnabled" | "rightPressureMotionAutoRangeDisabled" | "rightPressureMotionAutoRange" | "rightIsRecordingPressureCalibrationData" | "rightPressureCalibrationDataRecordStart" | "rightPressureCalibrationDataRecordStop" | "rightPressureCalibrationDataRecordingProgress" | "rightIsTrainingPressureCalibration" | "rightPressureCalibrationTrainStart" | "rightPressureCalibrationTrainEnd" | "rightPressureCalibrationTrainProgress" | "rightCalibratedPressureModel" | "rightGetTfliteName" | "rightGetTfliteTask" | "rightGetTfliteSampleRate" | "rightGetTfliteSensorTypes" | "rightTfliteIsReady" | "rightGetTfliteCaptureDelay" | "rightGetTfliteThreshold" | "rightGetTfliteInferencingEnabled" | "rightTfliteInference" | "rightAcceleration" | "rightGravity" | "rightLinearAcceleration" | "rightGyroscope" | "rightMagnetometer" | "rightGameRotation" | "rightRotation" | "rightOrientation" | "rightActivity" | "rightStepCounter" | "rightStepDetector" | "rightDeviceOrientation" | "rightTapDetector" | "rightBarometer" | "rightButtons" | "rightTouches" | "rightLight" | "rightConnectionMessage" | "rightNotConnected" | "rightConnecting" | "rightConnected" | "rightDisconnecting" | "rightConnectionStatus" | "rightIsConnected" | "rightBatteryLevel" | "rightIsCharging" | "rightGetBatteryCurrent" | "rightGetMtu" | "rightGetId" | "rightGetName" | "rightGetType" | "rightGetCurrentTime" | "rightManufacturerName" | "rightModelNumber" | "rightHardwareRevision" | "rightFirmwareRevision" | "rightSoftwareRevision" | "rightPnpId" | "rightSerialNumber" | "rightDeviceInformation" | "rightGetSensorConfiguration" | "rightSensorData" | "rightNumberOfButtons" | "rightButton" | "rightButtonDown" | "rightButtonUp" | "rightNumberOfTouches" | "rightTouch" | "rightTouchDown" | "rightTouchUp" | "rightGetFileTypes" | "rightMaxFileLength" | "rightGetFileType" | "rightGetFileLength" | "rightGetFileChecksum" | "rightFileTransferStatus" | "rightGetFileBlock" | "rightFileTransferProgress" | "rightFileTransferComplete" | "rightFileReceived" | "rightIsWifiAvailable" | "rightGetWifiSSID" | "rightGetWifiPassword" | "rightIsWifiConnected" | "rightIpAddress" | "rightCameraStatus" | "rightGetCameraConfiguration" | "rightCameraImageProgress" | "rightCameraImage" | "rightIsRecordingCamera" | "rightStartRecordingCamera" | "rightStopRecordingCamera" | "rightCameraRecording" | "rightAutoPicture" | "rightMicrophoneStatus" | "rightGetMicrophoneConfiguration" | "rightMicrophoneData" | "rightIsRecordingMicrophone" | "rightStartRecordingMicrophone" | "rightStopRecordingMicrophone" | "rightMicrophoneRecording" | "rightIsDisplayAvailable" | "rightDisplayStatus" | "rightDisplayInformation" | "rightGetDisplayBrightness" | "rightDisplayContextCommands" | "rightDisplayReady" | "rightGetSpriteSheetName" | "rightDisplayContextState" | "rightDisplayColor" | "rightDisplayColorOpacity" | "rightDisplayOpacity" | "rightDisplaySpriteSheetUploadStart" | "rightDisplaySpriteSheetUploadProgress" | "rightDisplaySpriteSheetUploadComplete" | "rightGetLedInformation" | "rightSetLed" | "rightSmp" | "rightFirmwareImages" | "rightFirmwareUploadProgress" | "rightFirmwareStatus" | "rightIsLast" | "rightGetEnableWifiConnection" | "devicePressure" | "devicePressureAutoRangeEnabled" | "devicePressureAutoRangeDisabled" | "devicePressureAutoRange" | "devicePressureMotionAutoRangeEnabled" | "devicePressureMotionAutoRangeDisabled" | "devicePressureMotionAutoRange" | "deviceIsRecordingPressureCalibrationData" | "devicePressureCalibrationDataRecordStart" | "devicePressureCalibrationDataRecordStop" | "devicePressureCalibrationDataRecordingProgress" | "deviceIsTrainingPressureCalibration" | "devicePressureCalibrationTrainStart" | "devicePressureCalibrationTrainEnd" | "devicePressureCalibrationTrainProgress" | "deviceCalibratedPressureModel" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "deviceTapDetector" | "deviceBarometer" | "deviceButtons" | "deviceTouches" | "deviceLight" | "deviceConnectionMessage" | "deviceNotConnected" | "deviceConnecting" | "deviceConnected" | "deviceDisconnecting" | "deviceConnectionStatus" | "deviceIsConnected" | "deviceBatteryLevel" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceManufacturerName" | "deviceModelNumber" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "deviceSoftwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceDeviceInformation" | "deviceGetSensorConfiguration" | "deviceSensorData" | "deviceNumberOfButtons" | "deviceButton" | "deviceButtonDown" | "deviceButtonUp" | "deviceNumberOfTouches" | "deviceTouch" | "deviceTouchDown" | "deviceTouchUp" | "deviceGetFileTypes" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "deviceIsWifiAvailable" | "deviceGetWifiSSID" | "deviceGetWifiPassword" | "deviceIsWifiConnected" | "deviceIpAddress" | "deviceCameraStatus" | "deviceGetCameraConfiguration" | "deviceCameraImageProgress" | "deviceCameraImage" | "deviceIsRecordingCamera" | "deviceStartRecordingCamera" | "deviceStopRecordingCamera" | "deviceCameraRecording" | "deviceAutoPicture" | "deviceMicrophoneStatus" | "deviceGetMicrophoneConfiguration" | "deviceMicrophoneData" | "deviceIsRecordingMicrophone" | "deviceStartRecordingMicrophone" | "deviceStopRecordingMicrophone" | "deviceMicrophoneRecording" | "deviceIsDisplayAvailable" | "deviceDisplayStatus" | "deviceDisplayInformation" | "deviceGetDisplayBrightness" | "deviceDisplayContextCommands" | "deviceDisplayReady" | "deviceGetSpriteSheetName" | "deviceDisplayContextState" | "deviceDisplayColor" | "deviceDisplayColorOpacity" | "deviceDisplayOpacity" | "deviceDisplaySpriteSheetUploadStart" | "deviceDisplaySpriteSheetUploadProgress" | "deviceDisplaySpriteSheetUploadComplete" | "deviceGetLedInformation" | "deviceSetLed" | "deviceSmp" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus" | "deviceIsLast" | "deviceGetEnableWifiConnection">(type: T, listener: (event: ListenerEvent<DevicePair, "pressure" | "deviceOrientation" | "isConnected" | "sensorData" | "device*" | "leftPressure" | "leftPressureAutoRangeEnabled" | "leftPressureAutoRangeDisabled" | "leftPressureAutoRange" | "leftPressureMotionAutoRangeEnabled" | "leftPressureMotionAutoRangeDisabled" | "leftPressureMotionAutoRange" | "leftIsRecordingPressureCalibrationData" | "leftPressureCalibrationDataRecordStart" | "leftPressureCalibrationDataRecordStop" | "leftPressureCalibrationDataRecordingProgress" | "leftIsTrainingPressureCalibration" | "leftPressureCalibrationTrainStart" | "leftPressureCalibrationTrainEnd" | "leftPressureCalibrationTrainProgress" | "leftCalibratedPressureModel" | "leftGetTfliteName" | "leftGetTfliteTask" | "leftGetTfliteSampleRate" | "leftGetTfliteSensorTypes" | "leftTfliteIsReady" | "leftGetTfliteCaptureDelay" | "leftGetTfliteThreshold" | "leftGetTfliteInferencingEnabled" | "leftTfliteInference" | "leftAcceleration" | "leftGravity" | "leftLinearAcceleration" | "leftGyroscope" | "leftMagnetometer" | "leftGameRotation" | "leftRotation" | "leftOrientation" | "leftActivity" | "leftStepCounter" | "leftStepDetector" | "leftDeviceOrientation" | "leftTapDetector" | "leftBarometer" | "leftButtons" | "leftTouches" | "leftLight" | "leftConnectionMessage" | "leftNotConnected" | "leftConnecting" | "leftConnected" | "leftDisconnecting" | "leftConnectionStatus" | "leftIsConnected" | "leftBatteryLevel" | "leftIsCharging" | "leftGetBatteryCurrent" | "leftGetMtu" | "leftGetId" | "leftGetName" | "leftGetType" | "leftGetCurrentTime" | "leftManufacturerName" | "leftModelNumber" | "leftHardwareRevision" | "leftFirmwareRevision" | "leftSoftwareRevision" | "leftPnpId" | "leftSerialNumber" | "leftDeviceInformation" | "leftGetSensorConfiguration" | "leftSensorData" | "leftNumberOfButtons" | "leftButton" | "leftButtonDown" | "leftButtonUp" | "leftNumberOfTouches" | "leftTouch" | "leftTouchDown" | "leftTouchUp" | "leftGetFileTypes" | "leftMaxFileLength" | "leftGetFileType" | "leftGetFileLength" | "leftGetFileChecksum" | "leftFileTransferStatus" | "leftGetFileBlock" | "leftFileTransferProgress" | "leftFileTransferComplete" | "leftFileReceived" | "leftIsWifiAvailable" | "leftGetWifiSSID" | "leftGetWifiPassword" | "leftIsWifiConnected" | "leftIpAddress" | "leftCameraStatus" | "leftGetCameraConfiguration" | "leftCameraImageProgress" | "leftCameraImage" | "leftIsRecordingCamera" | "leftStartRecordingCamera" | "leftStopRecordingCamera" | "leftCameraRecording" | "leftAutoPicture" | "leftMicrophoneStatus" | "leftGetMicrophoneConfiguration" | "leftMicrophoneData" | "leftIsRecordingMicrophone" | "leftStartRecordingMicrophone" | "leftStopRecordingMicrophone" | "leftMicrophoneRecording" | "leftIsDisplayAvailable" | "leftDisplayStatus" | "leftDisplayInformation" | "leftGetDisplayBrightness" | "leftDisplayContextCommands" | "leftDisplayReady" | "leftGetSpriteSheetName" | "leftDisplayContextState" | "leftDisplayColor" | "leftDisplayColorOpacity" | "leftDisplayOpacity" | "leftDisplaySpriteSheetUploadStart" | "leftDisplaySpriteSheetUploadProgress" | "leftDisplaySpriteSheetUploadComplete" | "leftGetLedInformation" | "leftSetLed" | "leftSmp" | "leftFirmwareImages" | "leftFirmwareUploadProgress" | "leftFirmwareStatus" | "leftIsLast" | "leftGetEnableWifiConnection" | "rightPressure" | "rightPressureAutoRangeEnabled" | "rightPressureAutoRangeDisabled" | "rightPressureAutoRange" | "rightPressureMotionAutoRangeEnabled" | "rightPressureMotionAutoRangeDisabled" | "rightPressureMotionAutoRange" | "rightIsRecordingPressureCalibrationData" | "rightPressureCalibrationDataRecordStart" | "rightPressureCalibrationDataRecordStop" | "rightPressureCalibrationDataRecordingProgress" | "rightIsTrainingPressureCalibration" | "rightPressureCalibrationTrainStart" | "rightPressureCalibrationTrainEnd" | "rightPressureCalibrationTrainProgress" | "rightCalibratedPressureModel" | "rightGetTfliteName" | "rightGetTfliteTask" | "rightGetTfliteSampleRate" | "rightGetTfliteSensorTypes" | "rightTfliteIsReady" | "rightGetTfliteCaptureDelay" | "rightGetTfliteThreshold" | "rightGetTfliteInferencingEnabled" | "rightTfliteInference" | "rightAcceleration" | "rightGravity" | "rightLinearAcceleration" | "rightGyroscope" | "rightMagnetometer" | "rightGameRotation" | "rightRotation" | "rightOrientation" | "rightActivity" | "rightStepCounter" | "rightStepDetector" | "rightDeviceOrientation" | "rightTapDetector" | "rightBarometer" | "rightButtons" | "rightTouches" | "rightLight" | "rightConnectionMessage" | "rightNotConnected" | "rightConnecting" | "rightConnected" | "rightDisconnecting" | "rightConnectionStatus" | "rightIsConnected" | "rightBatteryLevel" | "rightIsCharging" | "rightGetBatteryCurrent" | "rightGetMtu" | "rightGetId" | "rightGetName" | "rightGetType" | "rightGetCurrentTime" | "rightManufacturerName" | "rightModelNumber" | "rightHardwareRevision" | "rightFirmwareRevision" | "rightSoftwareRevision" | "rightPnpId" | "rightSerialNumber" | "rightDeviceInformation" | "rightGetSensorConfiguration" | "rightSensorData" | "rightNumberOfButtons" | "rightButton" | "rightButtonDown" | "rightButtonUp" | "rightNumberOfTouches" | "rightTouch" | "rightTouchDown" | "rightTouchUp" | "rightGetFileTypes" | "rightMaxFileLength" | "rightGetFileType" | "rightGetFileLength" | "rightGetFileChecksum" | "rightFileTransferStatus" | "rightGetFileBlock" | "rightFileTransferProgress" | "rightFileTransferComplete" | "rightFileReceived" | "rightIsWifiAvailable" | "rightGetWifiSSID" | "rightGetWifiPassword" | "rightIsWifiConnected" | "rightIpAddress" | "rightCameraStatus" | "rightGetCameraConfiguration" | "rightCameraImageProgress" | "rightCameraImage" | "rightIsRecordingCamera" | "rightStartRecordingCamera" | "rightStopRecordingCamera" | "rightCameraRecording" | "rightAutoPicture" | "rightMicrophoneStatus" | "rightGetMicrophoneConfiguration" | "rightMicrophoneData" | "rightIsRecordingMicrophone" | "rightStartRecordingMicrophone" | "rightStopRecordingMicrophone" | "rightMicrophoneRecording" | "rightIsDisplayAvailable" | "rightDisplayStatus" | "rightDisplayInformation" | "rightGetDisplayBrightness" | "rightDisplayContextCommands" | "rightDisplayReady" | "rightGetSpriteSheetName" | "rightDisplayContextState" | "rightDisplayColor" | "rightDisplayColorOpacity" | "rightDisplayOpacity" | "rightDisplaySpriteSheetUploadStart" | "rightDisplaySpriteSheetUploadProgress" | "rightDisplaySpriteSheetUploadComplete" | "rightGetLedInformation" | "rightSetLed" | "rightSmp" | "rightFirmwareImages" | "rightFirmwareUploadProgress" | "rightFirmwareStatus" | "rightIsLast" | "rightGetEnableWifiConnection" | "devicePressure" | "devicePressureAutoRangeEnabled" | "devicePressureAutoRangeDisabled" | "devicePressureAutoRange" | "devicePressureMotionAutoRangeEnabled" | "devicePressureMotionAutoRangeDisabled" | "devicePressureMotionAutoRange" | "deviceIsRecordingPressureCalibrationData" | "devicePressureCalibrationDataRecordStart" | "devicePressureCalibrationDataRecordStop" | "devicePressureCalibrationDataRecordingProgress" | "deviceIsTrainingPressureCalibration" | "devicePressureCalibrationTrainStart" | "devicePressureCalibrationTrainEnd" | "devicePressureCalibrationTrainProgress" | "deviceCalibratedPressureModel" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "deviceTapDetector" | "deviceBarometer" | "deviceButtons" | "deviceTouches" | "deviceLight" | "deviceConnectionMessage" | "deviceNotConnected" | "deviceConnecting" | "deviceConnected" | "deviceDisconnecting" | "deviceConnectionStatus" | "deviceIsConnected" | "deviceBatteryLevel" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceManufacturerName" | "deviceModelNumber" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "deviceSoftwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceDeviceInformation" | "deviceGetSensorConfiguration" | "deviceSensorData" | "deviceNumberOfButtons" | "deviceButton" | "deviceButtonDown" | "deviceButtonUp" | "deviceNumberOfTouches" | "deviceTouch" | "deviceTouchDown" | "deviceTouchUp" | "deviceGetFileTypes" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "deviceIsWifiAvailable" | "deviceGetWifiSSID" | "deviceGetWifiPassword" | "deviceIsWifiConnected" | "deviceIpAddress" | "deviceCameraStatus" | "deviceGetCameraConfiguration" | "deviceCameraImageProgress" | "deviceCameraImage" | "deviceIsRecordingCamera" | "deviceStartRecordingCamera" | "deviceStopRecordingCamera" | "deviceCameraRecording" | "deviceAutoPicture" | "deviceMicrophoneStatus" | "deviceGetMicrophoneConfiguration" | "deviceMicrophoneData" | "deviceIsRecordingMicrophone" | "deviceStartRecordingMicrophone" | "deviceStopRecordingMicrophone" | "deviceMicrophoneRecording" | "deviceIsDisplayAvailable" | "deviceDisplayStatus" | "deviceDisplayInformation" | "deviceGetDisplayBrightness" | "deviceDisplayContextCommands" | "deviceDisplayReady" | "deviceGetSpriteSheetName" | "deviceDisplayContextState" | "deviceDisplayColor" | "deviceDisplayColorOpacity" | "deviceDisplayOpacity" | "deviceDisplaySpriteSheetUploadStart" | "deviceDisplaySpriteSheetUploadProgress" | "deviceDisplaySpriteSheetUploadComplete" | "deviceGetLedInformation" | "deviceSetLed" | "deviceSmp" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus" | "deviceIsLast" | "deviceGetEnableWifiConnection", DevicePairEventMessages, T>) => void) => void;
    get waitForEvent(): <T extends "pressure" | "deviceOrientation" | "isConnected" | "sensorData" | "device*" | "leftPressure" | "leftPressureAutoRangeEnabled" | "leftPressureAutoRangeDisabled" | "leftPressureAutoRange" | "leftPressureMotionAutoRangeEnabled" | "leftPressureMotionAutoRangeDisabled" | "leftPressureMotionAutoRange" | "leftIsRecordingPressureCalibrationData" | "leftPressureCalibrationDataRecordStart" | "leftPressureCalibrationDataRecordStop" | "leftPressureCalibrationDataRecordingProgress" | "leftIsTrainingPressureCalibration" | "leftPressureCalibrationTrainStart" | "leftPressureCalibrationTrainEnd" | "leftPressureCalibrationTrainProgress" | "leftCalibratedPressureModel" | "leftGetTfliteName" | "leftGetTfliteTask" | "leftGetTfliteSampleRate" | "leftGetTfliteSensorTypes" | "leftTfliteIsReady" | "leftGetTfliteCaptureDelay" | "leftGetTfliteThreshold" | "leftGetTfliteInferencingEnabled" | "leftTfliteInference" | "leftAcceleration" | "leftGravity" | "leftLinearAcceleration" | "leftGyroscope" | "leftMagnetometer" | "leftGameRotation" | "leftRotation" | "leftOrientation" | "leftActivity" | "leftStepCounter" | "leftStepDetector" | "leftDeviceOrientation" | "leftTapDetector" | "leftBarometer" | "leftButtons" | "leftTouches" | "leftLight" | "leftConnectionMessage" | "leftNotConnected" | "leftConnecting" | "leftConnected" | "leftDisconnecting" | "leftConnectionStatus" | "leftIsConnected" | "leftBatteryLevel" | "leftIsCharging" | "leftGetBatteryCurrent" | "leftGetMtu" | "leftGetId" | "leftGetName" | "leftGetType" | "leftGetCurrentTime" | "leftManufacturerName" | "leftModelNumber" | "leftHardwareRevision" | "leftFirmwareRevision" | "leftSoftwareRevision" | "leftPnpId" | "leftSerialNumber" | "leftDeviceInformation" | "leftGetSensorConfiguration" | "leftSensorData" | "leftNumberOfButtons" | "leftButton" | "leftButtonDown" | "leftButtonUp" | "leftNumberOfTouches" | "leftTouch" | "leftTouchDown" | "leftTouchUp" | "leftGetFileTypes" | "leftMaxFileLength" | "leftGetFileType" | "leftGetFileLength" | "leftGetFileChecksum" | "leftFileTransferStatus" | "leftGetFileBlock" | "leftFileTransferProgress" | "leftFileTransferComplete" | "leftFileReceived" | "leftIsWifiAvailable" | "leftGetWifiSSID" | "leftGetWifiPassword" | "leftIsWifiConnected" | "leftIpAddress" | "leftCameraStatus" | "leftGetCameraConfiguration" | "leftCameraImageProgress" | "leftCameraImage" | "leftIsRecordingCamera" | "leftStartRecordingCamera" | "leftStopRecordingCamera" | "leftCameraRecording" | "leftAutoPicture" | "leftMicrophoneStatus" | "leftGetMicrophoneConfiguration" | "leftMicrophoneData" | "leftIsRecordingMicrophone" | "leftStartRecordingMicrophone" | "leftStopRecordingMicrophone" | "leftMicrophoneRecording" | "leftIsDisplayAvailable" | "leftDisplayStatus" | "leftDisplayInformation" | "leftGetDisplayBrightness" | "leftDisplayContextCommands" | "leftDisplayReady" | "leftGetSpriteSheetName" | "leftDisplayContextState" | "leftDisplayColor" | "leftDisplayColorOpacity" | "leftDisplayOpacity" | "leftDisplaySpriteSheetUploadStart" | "leftDisplaySpriteSheetUploadProgress" | "leftDisplaySpriteSheetUploadComplete" | "leftGetLedInformation" | "leftSetLed" | "leftSmp" | "leftFirmwareImages" | "leftFirmwareUploadProgress" | "leftFirmwareStatus" | "leftIsLast" | "leftGetEnableWifiConnection" | "rightPressure" | "rightPressureAutoRangeEnabled" | "rightPressureAutoRangeDisabled" | "rightPressureAutoRange" | "rightPressureMotionAutoRangeEnabled" | "rightPressureMotionAutoRangeDisabled" | "rightPressureMotionAutoRange" | "rightIsRecordingPressureCalibrationData" | "rightPressureCalibrationDataRecordStart" | "rightPressureCalibrationDataRecordStop" | "rightPressureCalibrationDataRecordingProgress" | "rightIsTrainingPressureCalibration" | "rightPressureCalibrationTrainStart" | "rightPressureCalibrationTrainEnd" | "rightPressureCalibrationTrainProgress" | "rightCalibratedPressureModel" | "rightGetTfliteName" | "rightGetTfliteTask" | "rightGetTfliteSampleRate" | "rightGetTfliteSensorTypes" | "rightTfliteIsReady" | "rightGetTfliteCaptureDelay" | "rightGetTfliteThreshold" | "rightGetTfliteInferencingEnabled" | "rightTfliteInference" | "rightAcceleration" | "rightGravity" | "rightLinearAcceleration" | "rightGyroscope" | "rightMagnetometer" | "rightGameRotation" | "rightRotation" | "rightOrientation" | "rightActivity" | "rightStepCounter" | "rightStepDetector" | "rightDeviceOrientation" | "rightTapDetector" | "rightBarometer" | "rightButtons" | "rightTouches" | "rightLight" | "rightConnectionMessage" | "rightNotConnected" | "rightConnecting" | "rightConnected" | "rightDisconnecting" | "rightConnectionStatus" | "rightIsConnected" | "rightBatteryLevel" | "rightIsCharging" | "rightGetBatteryCurrent" | "rightGetMtu" | "rightGetId" | "rightGetName" | "rightGetType" | "rightGetCurrentTime" | "rightManufacturerName" | "rightModelNumber" | "rightHardwareRevision" | "rightFirmwareRevision" | "rightSoftwareRevision" | "rightPnpId" | "rightSerialNumber" | "rightDeviceInformation" | "rightGetSensorConfiguration" | "rightSensorData" | "rightNumberOfButtons" | "rightButton" | "rightButtonDown" | "rightButtonUp" | "rightNumberOfTouches" | "rightTouch" | "rightTouchDown" | "rightTouchUp" | "rightGetFileTypes" | "rightMaxFileLength" | "rightGetFileType" | "rightGetFileLength" | "rightGetFileChecksum" | "rightFileTransferStatus" | "rightGetFileBlock" | "rightFileTransferProgress" | "rightFileTransferComplete" | "rightFileReceived" | "rightIsWifiAvailable" | "rightGetWifiSSID" | "rightGetWifiPassword" | "rightIsWifiConnected" | "rightIpAddress" | "rightCameraStatus" | "rightGetCameraConfiguration" | "rightCameraImageProgress" | "rightCameraImage" | "rightIsRecordingCamera" | "rightStartRecordingCamera" | "rightStopRecordingCamera" | "rightCameraRecording" | "rightAutoPicture" | "rightMicrophoneStatus" | "rightGetMicrophoneConfiguration" | "rightMicrophoneData" | "rightIsRecordingMicrophone" | "rightStartRecordingMicrophone" | "rightStopRecordingMicrophone" | "rightMicrophoneRecording" | "rightIsDisplayAvailable" | "rightDisplayStatus" | "rightDisplayInformation" | "rightGetDisplayBrightness" | "rightDisplayContextCommands" | "rightDisplayReady" | "rightGetSpriteSheetName" | "rightDisplayContextState" | "rightDisplayColor" | "rightDisplayColorOpacity" | "rightDisplayOpacity" | "rightDisplaySpriteSheetUploadStart" | "rightDisplaySpriteSheetUploadProgress" | "rightDisplaySpriteSheetUploadComplete" | "rightGetLedInformation" | "rightSetLed" | "rightSmp" | "rightFirmwareImages" | "rightFirmwareUploadProgress" | "rightFirmwareStatus" | "rightIsLast" | "rightGetEnableWifiConnection" | "devicePressure" | "devicePressureAutoRangeEnabled" | "devicePressureAutoRangeDisabled" | "devicePressureAutoRange" | "devicePressureMotionAutoRangeEnabled" | "devicePressureMotionAutoRangeDisabled" | "devicePressureMotionAutoRange" | "deviceIsRecordingPressureCalibrationData" | "devicePressureCalibrationDataRecordStart" | "devicePressureCalibrationDataRecordStop" | "devicePressureCalibrationDataRecordingProgress" | "deviceIsTrainingPressureCalibration" | "devicePressureCalibrationTrainStart" | "devicePressureCalibrationTrainEnd" | "devicePressureCalibrationTrainProgress" | "deviceCalibratedPressureModel" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "deviceTapDetector" | "deviceBarometer" | "deviceButtons" | "deviceTouches" | "deviceLight" | "deviceConnectionMessage" | "deviceNotConnected" | "deviceConnecting" | "deviceConnected" | "deviceDisconnecting" | "deviceConnectionStatus" | "deviceIsConnected" | "deviceBatteryLevel" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceManufacturerName" | "deviceModelNumber" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "deviceSoftwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceDeviceInformation" | "deviceGetSensorConfiguration" | "deviceSensorData" | "deviceNumberOfButtons" | "deviceButton" | "deviceButtonDown" | "deviceButtonUp" | "deviceNumberOfTouches" | "deviceTouch" | "deviceTouchDown" | "deviceTouchUp" | "deviceGetFileTypes" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "deviceIsWifiAvailable" | "deviceGetWifiSSID" | "deviceGetWifiPassword" | "deviceIsWifiConnected" | "deviceIpAddress" | "deviceCameraStatus" | "deviceGetCameraConfiguration" | "deviceCameraImageProgress" | "deviceCameraImage" | "deviceIsRecordingCamera" | "deviceStartRecordingCamera" | "deviceStopRecordingCamera" | "deviceCameraRecording" | "deviceAutoPicture" | "deviceMicrophoneStatus" | "deviceGetMicrophoneConfiguration" | "deviceMicrophoneData" | "deviceIsRecordingMicrophone" | "deviceStartRecordingMicrophone" | "deviceStopRecordingMicrophone" | "deviceMicrophoneRecording" | "deviceIsDisplayAvailable" | "deviceDisplayStatus" | "deviceDisplayInformation" | "deviceGetDisplayBrightness" | "deviceDisplayContextCommands" | "deviceDisplayReady" | "deviceGetSpriteSheetName" | "deviceDisplayContextState" | "deviceDisplayColor" | "deviceDisplayColorOpacity" | "deviceDisplayOpacity" | "deviceDisplaySpriteSheetUploadStart" | "deviceDisplaySpriteSheetUploadProgress" | "deviceDisplaySpriteSheetUploadComplete" | "deviceGetLedInformation" | "deviceSetLed" | "deviceSmp" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus" | "deviceIsLast" | "deviceGetEnableWifiConnection">(type: T, options?: {
        immediate?: boolean;
    }) => Promise<ListenerEvent<DevicePair, "pressure" | "deviceOrientation" | "isConnected" | "sensorData" | "device*" | "leftPressure" | "leftPressureAutoRangeEnabled" | "leftPressureAutoRangeDisabled" | "leftPressureAutoRange" | "leftPressureMotionAutoRangeEnabled" | "leftPressureMotionAutoRangeDisabled" | "leftPressureMotionAutoRange" | "leftIsRecordingPressureCalibrationData" | "leftPressureCalibrationDataRecordStart" | "leftPressureCalibrationDataRecordStop" | "leftPressureCalibrationDataRecordingProgress" | "leftIsTrainingPressureCalibration" | "leftPressureCalibrationTrainStart" | "leftPressureCalibrationTrainEnd" | "leftPressureCalibrationTrainProgress" | "leftCalibratedPressureModel" | "leftGetTfliteName" | "leftGetTfliteTask" | "leftGetTfliteSampleRate" | "leftGetTfliteSensorTypes" | "leftTfliteIsReady" | "leftGetTfliteCaptureDelay" | "leftGetTfliteThreshold" | "leftGetTfliteInferencingEnabled" | "leftTfliteInference" | "leftAcceleration" | "leftGravity" | "leftLinearAcceleration" | "leftGyroscope" | "leftMagnetometer" | "leftGameRotation" | "leftRotation" | "leftOrientation" | "leftActivity" | "leftStepCounter" | "leftStepDetector" | "leftDeviceOrientation" | "leftTapDetector" | "leftBarometer" | "leftButtons" | "leftTouches" | "leftLight" | "leftConnectionMessage" | "leftNotConnected" | "leftConnecting" | "leftConnected" | "leftDisconnecting" | "leftConnectionStatus" | "leftIsConnected" | "leftBatteryLevel" | "leftIsCharging" | "leftGetBatteryCurrent" | "leftGetMtu" | "leftGetId" | "leftGetName" | "leftGetType" | "leftGetCurrentTime" | "leftManufacturerName" | "leftModelNumber" | "leftHardwareRevision" | "leftFirmwareRevision" | "leftSoftwareRevision" | "leftPnpId" | "leftSerialNumber" | "leftDeviceInformation" | "leftGetSensorConfiguration" | "leftSensorData" | "leftNumberOfButtons" | "leftButton" | "leftButtonDown" | "leftButtonUp" | "leftNumberOfTouches" | "leftTouch" | "leftTouchDown" | "leftTouchUp" | "leftGetFileTypes" | "leftMaxFileLength" | "leftGetFileType" | "leftGetFileLength" | "leftGetFileChecksum" | "leftFileTransferStatus" | "leftGetFileBlock" | "leftFileTransferProgress" | "leftFileTransferComplete" | "leftFileReceived" | "leftIsWifiAvailable" | "leftGetWifiSSID" | "leftGetWifiPassword" | "leftIsWifiConnected" | "leftIpAddress" | "leftCameraStatus" | "leftGetCameraConfiguration" | "leftCameraImageProgress" | "leftCameraImage" | "leftIsRecordingCamera" | "leftStartRecordingCamera" | "leftStopRecordingCamera" | "leftCameraRecording" | "leftAutoPicture" | "leftMicrophoneStatus" | "leftGetMicrophoneConfiguration" | "leftMicrophoneData" | "leftIsRecordingMicrophone" | "leftStartRecordingMicrophone" | "leftStopRecordingMicrophone" | "leftMicrophoneRecording" | "leftIsDisplayAvailable" | "leftDisplayStatus" | "leftDisplayInformation" | "leftGetDisplayBrightness" | "leftDisplayContextCommands" | "leftDisplayReady" | "leftGetSpriteSheetName" | "leftDisplayContextState" | "leftDisplayColor" | "leftDisplayColorOpacity" | "leftDisplayOpacity" | "leftDisplaySpriteSheetUploadStart" | "leftDisplaySpriteSheetUploadProgress" | "leftDisplaySpriteSheetUploadComplete" | "leftGetLedInformation" | "leftSetLed" | "leftSmp" | "leftFirmwareImages" | "leftFirmwareUploadProgress" | "leftFirmwareStatus" | "leftIsLast" | "leftGetEnableWifiConnection" | "rightPressure" | "rightPressureAutoRangeEnabled" | "rightPressureAutoRangeDisabled" | "rightPressureAutoRange" | "rightPressureMotionAutoRangeEnabled" | "rightPressureMotionAutoRangeDisabled" | "rightPressureMotionAutoRange" | "rightIsRecordingPressureCalibrationData" | "rightPressureCalibrationDataRecordStart" | "rightPressureCalibrationDataRecordStop" | "rightPressureCalibrationDataRecordingProgress" | "rightIsTrainingPressureCalibration" | "rightPressureCalibrationTrainStart" | "rightPressureCalibrationTrainEnd" | "rightPressureCalibrationTrainProgress" | "rightCalibratedPressureModel" | "rightGetTfliteName" | "rightGetTfliteTask" | "rightGetTfliteSampleRate" | "rightGetTfliteSensorTypes" | "rightTfliteIsReady" | "rightGetTfliteCaptureDelay" | "rightGetTfliteThreshold" | "rightGetTfliteInferencingEnabled" | "rightTfliteInference" | "rightAcceleration" | "rightGravity" | "rightLinearAcceleration" | "rightGyroscope" | "rightMagnetometer" | "rightGameRotation" | "rightRotation" | "rightOrientation" | "rightActivity" | "rightStepCounter" | "rightStepDetector" | "rightDeviceOrientation" | "rightTapDetector" | "rightBarometer" | "rightButtons" | "rightTouches" | "rightLight" | "rightConnectionMessage" | "rightNotConnected" | "rightConnecting" | "rightConnected" | "rightDisconnecting" | "rightConnectionStatus" | "rightIsConnected" | "rightBatteryLevel" | "rightIsCharging" | "rightGetBatteryCurrent" | "rightGetMtu" | "rightGetId" | "rightGetName" | "rightGetType" | "rightGetCurrentTime" | "rightManufacturerName" | "rightModelNumber" | "rightHardwareRevision" | "rightFirmwareRevision" | "rightSoftwareRevision" | "rightPnpId" | "rightSerialNumber" | "rightDeviceInformation" | "rightGetSensorConfiguration" | "rightSensorData" | "rightNumberOfButtons" | "rightButton" | "rightButtonDown" | "rightButtonUp" | "rightNumberOfTouches" | "rightTouch" | "rightTouchDown" | "rightTouchUp" | "rightGetFileTypes" | "rightMaxFileLength" | "rightGetFileType" | "rightGetFileLength" | "rightGetFileChecksum" | "rightFileTransferStatus" | "rightGetFileBlock" | "rightFileTransferProgress" | "rightFileTransferComplete" | "rightFileReceived" | "rightIsWifiAvailable" | "rightGetWifiSSID" | "rightGetWifiPassword" | "rightIsWifiConnected" | "rightIpAddress" | "rightCameraStatus" | "rightGetCameraConfiguration" | "rightCameraImageProgress" | "rightCameraImage" | "rightIsRecordingCamera" | "rightStartRecordingCamera" | "rightStopRecordingCamera" | "rightCameraRecording" | "rightAutoPicture" | "rightMicrophoneStatus" | "rightGetMicrophoneConfiguration" | "rightMicrophoneData" | "rightIsRecordingMicrophone" | "rightStartRecordingMicrophone" | "rightStopRecordingMicrophone" | "rightMicrophoneRecording" | "rightIsDisplayAvailable" | "rightDisplayStatus" | "rightDisplayInformation" | "rightGetDisplayBrightness" | "rightDisplayContextCommands" | "rightDisplayReady" | "rightGetSpriteSheetName" | "rightDisplayContextState" | "rightDisplayColor" | "rightDisplayColorOpacity" | "rightDisplayOpacity" | "rightDisplaySpriteSheetUploadStart" | "rightDisplaySpriteSheetUploadProgress" | "rightDisplaySpriteSheetUploadComplete" | "rightGetLedInformation" | "rightSetLed" | "rightSmp" | "rightFirmwareImages" | "rightFirmwareUploadProgress" | "rightFirmwareStatus" | "rightIsLast" | "rightGetEnableWifiConnection" | "devicePressure" | "devicePressureAutoRangeEnabled" | "devicePressureAutoRangeDisabled" | "devicePressureAutoRange" | "devicePressureMotionAutoRangeEnabled" | "devicePressureMotionAutoRangeDisabled" | "devicePressureMotionAutoRange" | "deviceIsRecordingPressureCalibrationData" | "devicePressureCalibrationDataRecordStart" | "devicePressureCalibrationDataRecordStop" | "devicePressureCalibrationDataRecordingProgress" | "deviceIsTrainingPressureCalibration" | "devicePressureCalibrationTrainStart" | "devicePressureCalibrationTrainEnd" | "devicePressureCalibrationTrainProgress" | "deviceCalibratedPressureModel" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "deviceTapDetector" | "deviceBarometer" | "deviceButtons" | "deviceTouches" | "deviceLight" | "deviceConnectionMessage" | "deviceNotConnected" | "deviceConnecting" | "deviceConnected" | "deviceDisconnecting" | "deviceConnectionStatus" | "deviceIsConnected" | "deviceBatteryLevel" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceManufacturerName" | "deviceModelNumber" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "deviceSoftwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceDeviceInformation" | "deviceGetSensorConfiguration" | "deviceSensorData" | "deviceNumberOfButtons" | "deviceButton" | "deviceButtonDown" | "deviceButtonUp" | "deviceNumberOfTouches" | "deviceTouch" | "deviceTouchDown" | "deviceTouchUp" | "deviceGetFileTypes" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "deviceIsWifiAvailable" | "deviceGetWifiSSID" | "deviceGetWifiPassword" | "deviceIsWifiConnected" | "deviceIpAddress" | "deviceCameraStatus" | "deviceGetCameraConfiguration" | "deviceCameraImageProgress" | "deviceCameraImage" | "deviceIsRecordingCamera" | "deviceStartRecordingCamera" | "deviceStopRecordingCamera" | "deviceCameraRecording" | "deviceAutoPicture" | "deviceMicrophoneStatus" | "deviceGetMicrophoneConfiguration" | "deviceMicrophoneData" | "deviceIsRecordingMicrophone" | "deviceStartRecordingMicrophone" | "deviceStopRecordingMicrophone" | "deviceMicrophoneRecording" | "deviceIsDisplayAvailable" | "deviceDisplayStatus" | "deviceDisplayInformation" | "deviceGetDisplayBrightness" | "deviceDisplayContextCommands" | "deviceDisplayReady" | "deviceGetSpriteSheetName" | "deviceDisplayContextState" | "deviceDisplayColor" | "deviceDisplayColorOpacity" | "deviceDisplayOpacity" | "deviceDisplaySpriteSheetUploadStart" | "deviceDisplaySpriteSheetUploadProgress" | "deviceDisplaySpriteSheetUploadComplete" | "deviceGetLedInformation" | "deviceSetLed" | "deviceSmp" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus" | "deviceIsLast" | "deviceGetEnableWifiConnection", DevicePairEventMessages, T>>;
    get removeEventListeners(): <T extends "pressure" | "deviceOrientation" | "*" | "isConnected" | "sensorData" | "device*" | "leftPressure" | "leftPressureAutoRangeEnabled" | "leftPressureAutoRangeDisabled" | "leftPressureAutoRange" | "leftPressureMotionAutoRangeEnabled" | "leftPressureMotionAutoRangeDisabled" | "leftPressureMotionAutoRange" | "leftIsRecordingPressureCalibrationData" | "leftPressureCalibrationDataRecordStart" | "leftPressureCalibrationDataRecordStop" | "leftPressureCalibrationDataRecordingProgress" | "leftIsTrainingPressureCalibration" | "leftPressureCalibrationTrainStart" | "leftPressureCalibrationTrainEnd" | "leftPressureCalibrationTrainProgress" | "leftCalibratedPressureModel" | "leftGetTfliteName" | "leftGetTfliteTask" | "leftGetTfliteSampleRate" | "leftGetTfliteSensorTypes" | "leftTfliteIsReady" | "leftGetTfliteCaptureDelay" | "leftGetTfliteThreshold" | "leftGetTfliteInferencingEnabled" | "leftTfliteInference" | "leftAcceleration" | "leftGravity" | "leftLinearAcceleration" | "leftGyroscope" | "leftMagnetometer" | "leftGameRotation" | "leftRotation" | "leftOrientation" | "leftActivity" | "leftStepCounter" | "leftStepDetector" | "leftDeviceOrientation" | "leftTapDetector" | "leftBarometer" | "leftButtons" | "leftTouches" | "leftLight" | "leftConnectionMessage" | "leftNotConnected" | "leftConnecting" | "leftConnected" | "leftDisconnecting" | "leftConnectionStatus" | "leftIsConnected" | "leftBatteryLevel" | "leftIsCharging" | "leftGetBatteryCurrent" | "leftGetMtu" | "leftGetId" | "leftGetName" | "leftGetType" | "leftGetCurrentTime" | "leftManufacturerName" | "leftModelNumber" | "leftHardwareRevision" | "leftFirmwareRevision" | "leftSoftwareRevision" | "leftPnpId" | "leftSerialNumber" | "leftDeviceInformation" | "leftGetSensorConfiguration" | "leftSensorData" | "leftNumberOfButtons" | "leftButton" | "leftButtonDown" | "leftButtonUp" | "leftNumberOfTouches" | "leftTouch" | "leftTouchDown" | "leftTouchUp" | "leftGetFileTypes" | "leftMaxFileLength" | "leftGetFileType" | "leftGetFileLength" | "leftGetFileChecksum" | "leftFileTransferStatus" | "leftGetFileBlock" | "leftFileTransferProgress" | "leftFileTransferComplete" | "leftFileReceived" | "leftIsWifiAvailable" | "leftGetWifiSSID" | "leftGetWifiPassword" | "leftIsWifiConnected" | "leftIpAddress" | "leftCameraStatus" | "leftGetCameraConfiguration" | "leftCameraImageProgress" | "leftCameraImage" | "leftIsRecordingCamera" | "leftStartRecordingCamera" | "leftStopRecordingCamera" | "leftCameraRecording" | "leftAutoPicture" | "leftMicrophoneStatus" | "leftGetMicrophoneConfiguration" | "leftMicrophoneData" | "leftIsRecordingMicrophone" | "leftStartRecordingMicrophone" | "leftStopRecordingMicrophone" | "leftMicrophoneRecording" | "leftIsDisplayAvailable" | "leftDisplayStatus" | "leftDisplayInformation" | "leftGetDisplayBrightness" | "leftDisplayContextCommands" | "leftDisplayReady" | "leftGetSpriteSheetName" | "leftDisplayContextState" | "leftDisplayColor" | "leftDisplayColorOpacity" | "leftDisplayOpacity" | "leftDisplaySpriteSheetUploadStart" | "leftDisplaySpriteSheetUploadProgress" | "leftDisplaySpriteSheetUploadComplete" | "leftGetLedInformation" | "leftSetLed" | "leftSmp" | "leftFirmwareImages" | "leftFirmwareUploadProgress" | "leftFirmwareStatus" | "leftIsLast" | "leftGetEnableWifiConnection" | "rightPressure" | "rightPressureAutoRangeEnabled" | "rightPressureAutoRangeDisabled" | "rightPressureAutoRange" | "rightPressureMotionAutoRangeEnabled" | "rightPressureMotionAutoRangeDisabled" | "rightPressureMotionAutoRange" | "rightIsRecordingPressureCalibrationData" | "rightPressureCalibrationDataRecordStart" | "rightPressureCalibrationDataRecordStop" | "rightPressureCalibrationDataRecordingProgress" | "rightIsTrainingPressureCalibration" | "rightPressureCalibrationTrainStart" | "rightPressureCalibrationTrainEnd" | "rightPressureCalibrationTrainProgress" | "rightCalibratedPressureModel" | "rightGetTfliteName" | "rightGetTfliteTask" | "rightGetTfliteSampleRate" | "rightGetTfliteSensorTypes" | "rightTfliteIsReady" | "rightGetTfliteCaptureDelay" | "rightGetTfliteThreshold" | "rightGetTfliteInferencingEnabled" | "rightTfliteInference" | "rightAcceleration" | "rightGravity" | "rightLinearAcceleration" | "rightGyroscope" | "rightMagnetometer" | "rightGameRotation" | "rightRotation" | "rightOrientation" | "rightActivity" | "rightStepCounter" | "rightStepDetector" | "rightDeviceOrientation" | "rightTapDetector" | "rightBarometer" | "rightButtons" | "rightTouches" | "rightLight" | "rightConnectionMessage" | "rightNotConnected" | "rightConnecting" | "rightConnected" | "rightDisconnecting" | "rightConnectionStatus" | "rightIsConnected" | "rightBatteryLevel" | "rightIsCharging" | "rightGetBatteryCurrent" | "rightGetMtu" | "rightGetId" | "rightGetName" | "rightGetType" | "rightGetCurrentTime" | "rightManufacturerName" | "rightModelNumber" | "rightHardwareRevision" | "rightFirmwareRevision" | "rightSoftwareRevision" | "rightPnpId" | "rightSerialNumber" | "rightDeviceInformation" | "rightGetSensorConfiguration" | "rightSensorData" | "rightNumberOfButtons" | "rightButton" | "rightButtonDown" | "rightButtonUp" | "rightNumberOfTouches" | "rightTouch" | "rightTouchDown" | "rightTouchUp" | "rightGetFileTypes" | "rightMaxFileLength" | "rightGetFileType" | "rightGetFileLength" | "rightGetFileChecksum" | "rightFileTransferStatus" | "rightGetFileBlock" | "rightFileTransferProgress" | "rightFileTransferComplete" | "rightFileReceived" | "rightIsWifiAvailable" | "rightGetWifiSSID" | "rightGetWifiPassword" | "rightIsWifiConnected" | "rightIpAddress" | "rightCameraStatus" | "rightGetCameraConfiguration" | "rightCameraImageProgress" | "rightCameraImage" | "rightIsRecordingCamera" | "rightStartRecordingCamera" | "rightStopRecordingCamera" | "rightCameraRecording" | "rightAutoPicture" | "rightMicrophoneStatus" | "rightGetMicrophoneConfiguration" | "rightMicrophoneData" | "rightIsRecordingMicrophone" | "rightStartRecordingMicrophone" | "rightStopRecordingMicrophone" | "rightMicrophoneRecording" | "rightIsDisplayAvailable" | "rightDisplayStatus" | "rightDisplayInformation" | "rightGetDisplayBrightness" | "rightDisplayContextCommands" | "rightDisplayReady" | "rightGetSpriteSheetName" | "rightDisplayContextState" | "rightDisplayColor" | "rightDisplayColorOpacity" | "rightDisplayOpacity" | "rightDisplaySpriteSheetUploadStart" | "rightDisplaySpriteSheetUploadProgress" | "rightDisplaySpriteSheetUploadComplete" | "rightGetLedInformation" | "rightSetLed" | "rightSmp" | "rightFirmwareImages" | "rightFirmwareUploadProgress" | "rightFirmwareStatus" | "rightIsLast" | "rightGetEnableWifiConnection" | "devicePressure" | "devicePressureAutoRangeEnabled" | "devicePressureAutoRangeDisabled" | "devicePressureAutoRange" | "devicePressureMotionAutoRangeEnabled" | "devicePressureMotionAutoRangeDisabled" | "devicePressureMotionAutoRange" | "deviceIsRecordingPressureCalibrationData" | "devicePressureCalibrationDataRecordStart" | "devicePressureCalibrationDataRecordStop" | "devicePressureCalibrationDataRecordingProgress" | "deviceIsTrainingPressureCalibration" | "devicePressureCalibrationTrainStart" | "devicePressureCalibrationTrainEnd" | "devicePressureCalibrationTrainProgress" | "deviceCalibratedPressureModel" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "deviceTapDetector" | "deviceBarometer" | "deviceButtons" | "deviceTouches" | "deviceLight" | "deviceConnectionMessage" | "deviceNotConnected" | "deviceConnecting" | "deviceConnected" | "deviceDisconnecting" | "deviceConnectionStatus" | "deviceIsConnected" | "deviceBatteryLevel" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceManufacturerName" | "deviceModelNumber" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "deviceSoftwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceDeviceInformation" | "deviceGetSensorConfiguration" | "deviceSensorData" | "deviceNumberOfButtons" | "deviceButton" | "deviceButtonDown" | "deviceButtonUp" | "deviceNumberOfTouches" | "deviceTouch" | "deviceTouchDown" | "deviceTouchUp" | "deviceGetFileTypes" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "deviceIsWifiAvailable" | "deviceGetWifiSSID" | "deviceGetWifiPassword" | "deviceIsWifiConnected" | "deviceIpAddress" | "deviceCameraStatus" | "deviceGetCameraConfiguration" | "deviceCameraImageProgress" | "deviceCameraImage" | "deviceIsRecordingCamera" | "deviceStartRecordingCamera" | "deviceStopRecordingCamera" | "deviceCameraRecording" | "deviceAutoPicture" | "deviceMicrophoneStatus" | "deviceGetMicrophoneConfiguration" | "deviceMicrophoneData" | "deviceIsRecordingMicrophone" | "deviceStartRecordingMicrophone" | "deviceStopRecordingMicrophone" | "deviceMicrophoneRecording" | "deviceIsDisplayAvailable" | "deviceDisplayStatus" | "deviceDisplayInformation" | "deviceGetDisplayBrightness" | "deviceDisplayContextCommands" | "deviceDisplayReady" | "deviceGetSpriteSheetName" | "deviceDisplayContextState" | "deviceDisplayColor" | "deviceDisplayColorOpacity" | "deviceDisplayOpacity" | "deviceDisplaySpriteSheetUploadStart" | "deviceDisplaySpriteSheetUploadProgress" | "deviceDisplaySpriteSheetUploadComplete" | "deviceGetLedInformation" | "deviceSetLed" | "deviceSmp" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus" | "deviceIsLast" | "deviceGetEnableWifiConnection">(type: T) => void;
    get removeAllEventListeners(): () => void;
    get left(): Device | undefined;
    get right(): Device | undefined;
    get isConnected(): boolean;
    get isPartiallyConnected(): boolean;
    get isHalfConnected(): boolean;
    assignDevice(device: Device): Device | undefined;
    setSensorConfiguration(sensorConfiguration: SensorConfiguration): Promise<void>;
    resetPressureRange(resetSides?: boolean): void;
    setPressureAutoRange(newPressureAutoRange: boolean): void;
    togglePressureAutoRange(): void;
    setPressureMotionAutoRange(newPressureMotionAutoRange: boolean): void;
    togglePressureMotionAutoRange(): void;
    triggerVibration(vibrationConfigurations: VibrationConfiguration[], sendImmediately?: boolean): Promise<PromiseSettledResult<void | undefined>[]>;
    static get insoles(): DevicePair;
    static get gloves(): DevicePair;
}

type BoundGenericEventListeners = {
    [eventType: string]: Function | Function[];
};
declare function addEventListeners(target: any, boundEventListeners: BoundGenericEventListeners): void;
declare function removeEventListeners(target: any, boundEventListeners: BoundGenericEventListeners): void;

declare function throttle<T extends (...args: any[]) => void>(fn: T, interval: number, trailing?: boolean): (...args: Parameters<T>) => void;
declare function debounce<T extends (...args: any[]) => void>(fn: T, interval: number, callImmediately?: boolean): (...args: Parameters<T>) => void;

interface DiscoveredDevice {
    bluetoothId: string;
    name: string;
    deviceType: DeviceType;
    rssi: number;
    ipAddress?: string;
    isWifiSecure?: boolean;
}
interface ScannerDiscoveredDeviceEventMessage {
    discoveredDevice: DiscoveredDevice;
}
interface ScannerEventMessages {
    discoveredDevice: ScannerDiscoveredDeviceEventMessage;
    expiredDiscoveredDevice: ScannerDiscoveredDeviceEventMessage;
    isScanningAvailable: {
        isScanningAvailable: boolean;
    };
    isScanning: {
        isScanning: boolean;
    };
    scanning: {};
    notScanning: {};
    scanningAvailable: {};
    scanningNotAvailable: {};
}
type DiscoveredDevicesMap = {
    [deviceId: string]: DiscoveredDevice;
};
declare abstract class BaseScanner {
    #private;
    protected get baseConstructor(): typeof BaseScanner;
    static get isSupported(): boolean;
    get isSupported(): boolean;
    constructor();
    get addEventListener(): <T extends "*" | "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice" | "scanningAvailable" | "scanningNotAvailable" | "scanning" | "notScanning">(type: T, listener: (event: ListenerEvent<BaseScanner, "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice" | "scanningAvailable" | "scanningNotAvailable" | "scanning" | "notScanning", ScannerEventMessages, T>) => void, options?: EventDispatcherOptions) => void;
    protected get dispatchEvent(): <T extends "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice" | "scanningAvailable" | "scanningNotAvailable" | "scanning" | "notScanning">(type: T, message: ScannerEventMessages[T]) => void;
    get removeEventListener(): <T extends "*" | "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice" | "scanningAvailable" | "scanningNotAvailable" | "scanning" | "notScanning">(type: T, listener: (event: ListenerEvent<BaseScanner, "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice" | "scanningAvailable" | "scanningNotAvailable" | "scanning" | "notScanning", ScannerEventMessages, T>) => void) => void;
    get waitForEvent(): <T extends "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice" | "scanningAvailable" | "scanningNotAvailable" | "scanning" | "notScanning">(type: T, options?: {
        immediate?: boolean;
    }) => Promise<ListenerEvent<BaseScanner, "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice" | "scanningAvailable" | "scanningNotAvailable" | "scanning" | "notScanning", ScannerEventMessages, T>>;
    get isScanningAvailable(): boolean;
    get isScanning(): boolean;
    startScan(): boolean;
    stopScan(): boolean;
    get discoveredDevices(): Readonly<DiscoveredDevicesMap>;
    get discoveredDevicesArray(): DiscoveredDevice[];
    static get DiscoveredDeviceExpirationTimeout(): number;
    connectToDevice(deviceId: string, connectionType?: ConnectionType): Promise<void>;
    disconnectFromDevice(deviceId: string): Promise<void>;
    abstract devices: {
        [bluetoothId: string]: Device;
    };
    get canReset(): boolean;
    reset(): void;
}

declare let scanner: BaseScanner;

declare const ServerMessageTypes: readonly ["isScanningAvailable", "isScanning", "startScan", "stopScan", "discoveredDevice", "discoveredDevices", "expiredDiscoveredDevice", "connectToDevice", "disconnectFromDevice", "connectedDevices", "deviceMessage", "requiredDeviceInformation"];
type ServerMessageType = (typeof ServerMessageTypes)[number];
type MessageLike = number | number[] | ArrayBufferLike | DataView<ArrayBuffer> | boolean | string | any;
interface Message<MessageType extends string> {
    type: MessageType;
    data?: MessageLike | MessageLike[];
}
type ServerMessage = Message<ServerMessageType>;
type DeviceMessage = Message<DeviceEventType>;

type Guard<TArgs extends unknown[]> = (...args: TArgs) => boolean;
declare class GuardManager<TArgs extends unknown[]> {
    #private;
    add(guard: Guard<TArgs>): void;
    remove(guard: Guard<TArgs>): void;
    evaluate(...args: TArgs): boolean;
    clear(): void;
    get length(): number;
    set length(newLength: number);
    get isEmpty(): boolean;
}

interface BaseServerClient {
}
interface ServerEventMessages<ServerClient extends BaseServerClient> {
    clientConnected: {
        client: ServerClient;
    };
    clientDisconnected: {
        client: ServerClient;
    };
}
interface BaseServerClientGuardManagerArg<Server extends BaseServer<ServerClient>, ServerClient extends BaseServerClient> {
    client: ServerClient;
    message?: ServerMessage;
    server: Server;
}
interface BaseServerClientDeviceGuardManagerArg<Server extends BaseServer<ServerClient>, ServerClient extends BaseServerClient> {
    device: Device;
    client: ServerClient;
    message?: DeviceMessage;
    server: Server;
}
interface BaseServerClientDeviceSensorDataGuardManagerArg<Server extends BaseServer<ServerClient>, ServerClient extends BaseServerClient> {
    device: Device;
    client: ServerClient;
    sensorType: SensorType;
    sensorData: DataView;
    server: Server;
}
interface BaseServerClientDeviceSensorConfigurationGuardManagerArg<Server extends BaseServer<ServerClient>, ServerClient extends BaseServerClient> {
    device: Device;
    client: ServerClient;
    sensorType: SensorType;
    sensorRate: number;
    server: Server;
}
interface BaseServerClientDeviceDisplayContextCommandGuardManagerArg<Server extends BaseServer<ServerClient>, ServerClient extends BaseServerClient> {
    device: Device;
    client: ServerClient;
    displayContextCommand: DisplayContextCommand;
    server: Server;
}
declare abstract class BaseServer<ServerClient extends BaseServerClient> {
    #private;
    get addEventListener(): <T extends "*" | "clientConnected" | "clientDisconnected">(type: T, listener: (event: ListenerEvent<BaseServer<ServerClient>, "clientConnected" | "clientDisconnected", ServerEventMessages<ServerClient>, T>) => void, options?: EventDispatcherOptions) => void;
    protected get dispatchEvent(): <T extends "clientConnected" | "clientDisconnected">(type: T, message: ServerEventMessages<ServerClient>[T]) => void;
    get removeEventListener(): <T extends "*" | "clientConnected" | "clientDisconnected">(type: T, listener: (event: ListenerEvent<BaseServer<ServerClient>, "clientConnected" | "clientDisconnected", ServerEventMessages<ServerClient>, T>) => void) => void;
    get waitForEvent(): <T extends "clientConnected" | "clientDisconnected">(type: T, options?: {
        immediate?: boolean;
    }) => Promise<ListenerEvent<BaseServer<ServerClient>, "clientConnected" | "clientDisconnected", ServerEventMessages<ServerClient>, T>>;
    constructor();
    clients: ServerClient[];
    static get ClearSensorConfigurationsWhenNoClients(): boolean;
    static set ClearSensorConfigurationsWhenNoClients(newValue: boolean);
    get clearSensorConfigurationsWhenNoClients(): boolean;
    set clearSensorConfigurationsWhenNoClients(newValue: boolean);
    protected abstract sendToClient(client: ServerClient, message: ArrayBuffer): void;
    broadcastMessage(message: ArrayBuffer, clients?: ServerClient[]): void;
    clientToServerGuardManager: GuardManager<[BaseServerClientGuardManagerArg<BaseServer<ServerClient>, ServerClient>]>;
    serverToClientGuardManager: GuardManager<[BaseServerClientGuardManagerArg<BaseServer<ServerClient>, ServerClient>]>;
    clientToDeviceGuardManager: GuardManager<[BaseServerClientDeviceGuardManagerArg<BaseServer<ServerClient>, ServerClient>]>;
    deviceToClientGuardManager: GuardManager<[BaseServerClientDeviceGuardManagerArg<BaseServer<ServerClient>, ServerClient>]>;
    deviceSensorDataToClientGuardManager: GuardManager<[BaseServerClientDeviceSensorDataGuardManagerArg<BaseServer<ServerClient>, ServerClient>]>;
    clientSensorConfigurationToDeviceGuardManager: GuardManager<[BaseServerClientDeviceSensorConfigurationGuardManagerArg<BaseServer<ServerClient>, ServerClient>]>;
    clientDisplayContextCommandToDeviceGuardManager: GuardManager<[BaseServerClientDeviceDisplayContextCommandGuardManagerArg<BaseServer<ServerClient>, ServerClient>]>;
    deviceDisplayContextCommandToClientGuardManager: GuardManager<[BaseServerClientDeviceDisplayContextCommandGuardManagerArg<BaseServer<ServerClient>, ServerClient>]>;
    protected parseClientMessage(client: ServerClient, dataView: DataView<ArrayBuffer>): ArrayBuffer | undefined;
    protected parseClientDeviceMessage(client: ServerClient, device: Device, dataView: DataView<ArrayBuffer>): ArrayBuffer | undefined;
}

interface WebSocketServerClient extends ws.WebSocket, BaseServerClient {
    isAlive: boolean;
    pingClientTimer?: Timer;
}
declare class WebSocketServer extends BaseServer<WebSocketServerClient> {
    #private;
    get server(): ws.WebSocketServer | undefined;
    set server(newServer: ws.WebSocketServer | undefined);
    protected sendToClient(client: WebSocketServerClient, message: ArrayBuffer): void;
}

interface UDPServerClient extends dgram.RemoteInfo, BaseServerClient {
    receivePort?: number;
    isAlive?: boolean;
    removeSelfTimer: Timer;
    lastTimeSentData: number;
}
declare class UDPServer extends BaseServer<UDPServerClient> {
    #private;
    get socket(): dgram.Socket | undefined;
    set socket(newSocket: dgram.Socket | undefined);
    protected sendToClient(client: UDPServerClient, message: ArrayBuffer): void;
}

declare const EventUtils: {
    addEventListeners: typeof addEventListeners;
    removeEventListeners: typeof removeEventListeners;
};

declare const ThrottleUtils: {
    throttle: typeof throttle;
    debounce: typeof debounce;
};

export { CameraCommands, CameraConfigurationTypes, CenterOfPressureModel, ConnectionEventTypes, ConnectionMessageTypes, ContinuousSensorTypes, DefaultNumberOfDisplayColors, DefaultNumberOfPressureSensors, Device, DeviceEventTypes, _default as DeviceManager, DevicePair, DevicePairTypes, DeviceTypes, DisplayAlignments, DisplayBezierCurveTypes, DisplayBrightnesses, DisplayContextCommandTypes, DisplayDirections, DisplayPixelDepths, DisplaySegmentCaps, DisplaySpriteContextCommandTypes, environment_d as Environment, EventUtils, FileTransferDirections, FileTypes, LedTypes, LedValueTypes, MaxNameLength, MaxNumberOfVibrationWaveformEffectSegments, MaxNumberOfVibrationWaveformSegments, MaxSensorRate, MaxSpriteSheetNameLength, MaxVibrationWaveformEffectSegmentDelay, MaxVibrationWaveformEffectSegmentLoopCount, MaxVibrationWaveformEffectSequenceLoopCount, MaxVibrationWaveformSegmentDuration, MaxWifiPasswordLength, MaxWifiSSIDLength, MicrophoneBitDepths, MicrophoneCommands, MicrophoneConfigurationTypes, MicrophoneConfigurationValues, MicrophoneSampleRates, MinNameLength, MinSpriteSheetNameLength, MinWifiPasswordLength, MinWifiSSIDLength, RangeHelper, RangeHelper2, scanner as Scanner, SensorRateStep, SensorTypes, Sides, TfliteSensorTypes, TfliteTasks, ThrottleUtils, Timer, TxRxMessageTypes, UDPServer, VibrationLocations, VibrationTypes, VibrationWaveformEffects, WebSocketServer, concatenateArrayBuffers, displayCurveTypeToNumberOfControlPoints, englishRegex, fontToSpriteSheet, getFontMaxHeight, getFontMetrics, getFontUnicodeRange, getMaxSpriteSheetSize, getTensorFlowModel, hexToRGB, intersectWireframes, isTensorFlowAvailable, isTensorFlowModelAvailable, isWireframePolygon, listTensorflowModels, maxDisplayScale, mergeWireframes, parseFont, pixelDepthToNumberOfColors, projectColor, rgbToHex, setAllConsoleLevelFlags, setConsoleLevelFlagsForType, simplifyCurves, simplifyPoints, simplifyPointsAsCubicCurveControlPoints, stringToSprites, wait, wildcardEventType };
export type { BoundDeviceEventListeners, BoundDeviceManagerEventListeners, BoundDevicePairEventListeners, CameraCommand, CameraConfiguration, CameraConfigurationType, CenterOfPressure, ConnectionEventType, ConnectionMessageType, ContinuousSensorType, DeviceEvent, DeviceEventListenerMap, DeviceEventMap, DeviceEventType, DeviceInformation, DeviceManagerEvent, DeviceManagerEventListenerMap, DeviceManagerEventMap, DevicePairEvent, DevicePairEventListenerMap, DevicePairEventMap, DevicePairType, DeviceType, DiscoveredDevice, DisplayAlignment, DisplayBezierCurveType, DisplayBitmap, DisplayBitmapColorPair, DisplayBrightness, DisplayColorRGB, DisplayColorRGBOrString, DisplayContextCommand, DisplayContextCommandType, DisplayDirection, DisplaySegmentCap, DisplaySize, DisplaySprite, DisplaySpriteColorPair, DisplaySpriteContextCommandType, DisplaySpriteLine, DisplaySpriteLines, DisplaySpritePaletteSwap, DisplaySpriteSheet, DisplaySpriteSheetPalette, DisplaySpriteSubLine, DisplayWireframe, DisplayWireframeEdge, Euler, FileTransferDirection, FileType, FontMetrics, FontToSpriteSheetOptions, Led, LedConfiguration, LedType, LedValue, LedValueType, MicrophoneBitDepth, MicrophoneCommand, MicrophoneConfiguration, MicrophoneConfigurationType, MicrophoneSampleRate, PressureData, PressureSensorPosition, PressureSensorValue, Quaternion, Range, SensorConfiguration, SensorType, Side, TfliteFileConfiguration, TfliteSensorType, TfliteTask, TxRxMessageType, Vector2, Vector3, VibrationConfiguration, VibrationLocation, VibrationType, VibrationWaveformConfiguration, VibrationWaveformEffect, VibrationWaveformEffectConfiguration, VibrationWaveformEffectSegment, VibrationWaveformSegment, WildcardEventType };
