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
declare const isInNode: boolean;
declare let isBluetoothSupported: boolean;
declare const isInBluefy: boolean;
declare const isInWebBLE: boolean;
declare const isAndroid: boolean;
declare const isSafari: boolean;
declare const isIOS: boolean;
declare const isMac: boolean;
declare const isInLensStudio: boolean;

declare const environment_d_isAndroid: typeof isAndroid;
declare const environment_d_isBluetoothSupported: typeof isBluetoothSupported;
declare const environment_d_isIOS: typeof isIOS;
declare const environment_d_isInBluefy: typeof isInBluefy;
declare const environment_d_isInBrowser: typeof isInBrowser;
declare const environment_d_isInDev: typeof isInDev;
declare const environment_d_isInLensStudio: typeof isInLensStudio;
declare const environment_d_isInNode: typeof isInNode;
declare const environment_d_isInProduction: typeof isInProduction;
declare const environment_d_isInWebBLE: typeof isInWebBLE;
declare const environment_d_isMac: typeof isMac;
declare const environment_d_isSafari: typeof isSafari;
declare namespace environment_d {
  export { environment_d_isAndroid as isAndroid, environment_d_isBluetoothSupported as isBluetoothSupported, environment_d_isIOS as isIOS, environment_d_isInBluefy as isInBluefy, environment_d_isInBrowser as isInBrowser, environment_d_isInDev as isInDev, environment_d_isInLensStudio as isInLensStudio, environment_d_isInNode as isInNode, environment_d_isInProduction as isInProduction, environment_d_isInWebBLE as isInWebBLE, environment_d_isMac as isMac, environment_d_isSafari as isSafari };
}

declare class RangeHelper {
    #private;
    get min(): number;
    get max(): number;
    set min(newMin: number);
    set max(newMax: number);
    reset(): void;
    update(value: number): void;
    getNormalization(value: number, weightByRange: boolean): number;
    updateAndGetNormalization(value: number, weightByRange: boolean): number;
}

type CenterOfPressure = Vector2;

type PressureSensorPosition = Vector2;

interface PressureSensorValue {
    position: PressureSensorPosition;
    rawValue: number;
    scaledValue: number;
    normalizedValue: number;
    weightedValue: number;
}
interface PressureData {
    sensors: PressureSensorValue[];
    scaledSum: number;
    normalizedSum: number;
    center?: CenterOfPressure;
    normalizedCenter?: CenterOfPressure;
}
interface PressureDataEventMessages {
    pressure: {
        pressure: PressureData;
    };
}
declare const DefaultNumberOfPressureSensors = 8;

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
}

type EventMap<Target extends any, EventType extends string, EventMessages extends Partial<Record<EventType, any>>> = {
    [T in keyof EventMessages]: {
        type: T;
        target: Target;
        message: EventMessages[T];
    };
};
type EventListenerMap<Target extends any, EventType extends string, EventMessages extends Partial<Record<EventType, any>>> = {
    [T in keyof EventMessages]: (event: {
        type: T;
        target: Target;
        message: EventMessages[T];
    }) => void;
};
type Event<Target extends any, EventType extends string, EventMessages extends Partial<Record<EventType, any>>> = EventMap<Target, EventType, EventMessages>[keyof EventMessages];
type SpecificEvent<Target extends any, EventType extends string, EventMessages extends Partial<Record<EventType, any>>, SpecificEventType extends EventType> = {
    type: SpecificEventType;
    target: Target;
    message: EventMessages[SpecificEventType];
};
type BoundEventListeners<Target extends any, EventType extends string, EventMessages extends Partial<Record<EventType, any>>> = {
    [SpecificEventType in keyof EventMessages]?: (event: SpecificEvent<Target, EventType, EventMessages, SpecificEventType>) => void;
};
declare class EventDispatcher<Target extends any, EventType extends string, EventMessages extends Partial<Record<EventType, any>>> {
    private target;
    private validEventTypes;
    private listeners;
    constructor(target: Target, validEventTypes: readonly EventType[]);
    private isValidEventType;
    private updateEventListeners;
    addEventListener<T extends EventType>(type: T, listener: (event: {
        type: T;
        target: Target;
        message: EventMessages[T];
    }) => void, options?: {
        once?: boolean;
    }): void;
    removeEventListener<T extends EventType>(type: T, listener: (event: {
        type: T;
        target: Target;
        message: EventMessages[T];
    }) => void): void;
    removeEventListeners<T extends EventType>(type: T): void;
    removeAllEventListeners(): void;
    dispatchEvent<T extends EventType>(type: T, message: EventMessages[T]): void;
    waitForEvent<T extends EventType>(type: T): Promise<{
        type: T;
        target: Target;
        message: EventMessages[T];
    }>;
}

declare const DisplaySegmentCaps: readonly ["flat", "round"];
type DisplaySegmentCap = (typeof DisplaySegmentCaps)[number];
type DisplayContextState = {
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
    bitmapColorIndices: number[];
    bitmapScaleX: number;
    bitmapScaleY: number;
    spriteColorIndices: number[];
    spriteScaleX: number;
    spriteScaleY: number;
    spriteSheetName?: string;
};
type DisplayContextStateKey = keyof DisplayContextState;
type PartialDisplayContextState = Partial<DisplayContextState>;

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

interface DisplayManagerInterface {
    get isReady(): boolean;
    get contextState(): DisplayContextState;
    flushContextCommands(): Promise<void>;
    get brightness(): DisplayBrightness;
    setBrightness(newDisplayBrightness: DisplayBrightness, sendImmediately?: boolean): Promise<void>;
    show(sendImmediately?: boolean): Promise<void>;
    clear(sendImmediately?: boolean): Promise<void>;
    get colors(): string[];
    get numberOfColors(): number;
    setColor(colorIndex: number, color: DisplayColorRGB | string, sendImmediately?: boolean): Promise<void>;
    assertValidColorIndex(colorIndex: number): void;
    assertValidLineWidth(lineWidth: number): void;
    assertValidNumberOfColors(numberOfColors: number): void;
    assertValidBitmap(bitmap: DisplayBitmap, checkSize?: boolean): void;
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
    resetSpriteColors(sendImmediately?: boolean): Promise<void>;
    setSpriteColor(spriteColorIndex: number, color: DisplayColorRGB | string, sendImmediately?: boolean): Promise<void>;
    setSpriteColorOpacity(spriteColorIndex: number, opacity: number, sendImmediately?: boolean): Promise<void>;
    setSpriteScaleX(spriteScaleX: number, sendImmediately?: boolean): Promise<void>;
    setSpriteScaleY(spriteScaleY: number, sendImmediately?: boolean): Promise<void>;
    setSpriteScale(spriteScale: number, sendImmediately?: boolean): Promise<void>;
    resetSpriteScale(sendImmediately?: boolean): Promise<void>;
    clearRect(x: number, y: number, width: number, height: number, sendImmediately?: boolean): Promise<void>;
    drawRect(offsetX: number, offsetY: number, width: number, height: number, sendImmediately?: boolean): Promise<void>;
    drawRoundRect(offsetX: number, offsetY: number, width: number, height: number, borderRadius: number, sendImmediately?: boolean): Promise<void>;
    drawCircle(offsetX: number, offsetY: number, radius: number, sendImmediately?: boolean): Promise<void>;
    drawEllipse(offsetX: number, offsetY: number, radiusX: number, radiusY: number, sendImmediately?: boolean): Promise<void>;
    drawRegularPolygon(offsetX: number, offsetY: number, radius: number, numberOfSides: number, sendImmediately?: boolean): Promise<void>;
    drawSegment(startX: number, startY: number, endX: number, endY: number, sendImmediately?: boolean): Promise<void>;
    drawSegments(points: Vector2[], sendImmediately?: boolean): Promise<void>;
    drawArc(offsetX: number, offsetY: number, radius: number, startAngle: number, angleOffset: number, isRadians?: boolean, sendImmediately?: boolean): Promise<void>;
    drawArcEllipse(offsetX: number, offsetY: number, radiusX: number, radiusY: number, startAngle: number, angleOffset: number, isRadians?: boolean, sendImmediately?: boolean): Promise<void>;
    drawBitmap(offsetX: number, offsetY: number, bitmap: DisplayBitmap, sendImmediately?: boolean): Promise<void>;
    runContextCommand(command: DisplayContextCommand, sendImmediately?: boolean): Promise<void>;
    runContextCommands(commands: DisplayContextCommand[], sendImmediately?: boolean): Promise<void>;
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
        colorIndices: number[];
    }>;
    uploadSpriteSheet(spriteSheet: DisplaySpriteSheet): Promise<void>;
    uploadSpriteSheets(spriteSheets: DisplaySpriteSheet[]): Promise<void>;
    selectSpriteSheet(spriteSheetName: string, sendImmediately?: boolean): Promise<void>;
    drawSprite(offsetX: number, offsetY: number, spriteName: string, sendImmediately?: boolean): Promise<void>;
    assertLoadedSpriteSheet(spriteSheetName: string): void;
    assertSelectedSpriteSheet(spriteSheetName: string): void;
    assertAnySelectedSpriteSheet(): void;
    assertSprite(spriteName: string): void;
    getSprite(spriteName: string): DisplaySprite | undefined;
    getSpriteSheetPalette(paletteName: string): DisplaySpriteSheetPalette | undefined;
    getSpriteSheetPaletteSwap(paletteSwapName: string): DisplaySpriteSheetPaletteSwap | undefined;
    getSpritePaletteSwap(spriteName: string, paletteSwapName: string): DisplaySpritePaletteSwap | undefined;
    drawSpriteFromSpriteSheet(offsetX: number, offsetY: number, spriteName: string, spriteSheet: DisplaySpriteSheet, sendImmediately?: boolean): Promise<void>;
    get selectedSpriteSheet(): DisplaySpriteSheet | undefined;
    get selectedSpriteSheetName(): string | undefined;
    spriteSheets: Record<string, DisplaySpriteSheet>;
    spriteSheetIndices: Record<string, number>;
    assertSpriteSheetPalette(paletteName: string): void;
    assertSpriteSheetPaletteSwap(paletteSwapName: string): void;
    assertSpritePaletteSwap(spriteName: string, paletteSwapName: string): void;
    selectSpriteSheetPalette(paletteName: string, offset?: number, sendImmediately?: boolean): Promise<void>;
    selectSpriteSheetPaletteSwap(paletteSwapName: string, offset?: number, sendImmediately?: boolean): Promise<void>;
    selectSpritePaletteSwap(spriteName: string, paletteSwapName: string, offset?: number, sendImmediately?: boolean): Promise<void>;
    serializeSpriteSheet(spriteSheet: DisplaySpriteSheet): ArrayBuffer;
    fontToSpriteSheet(arrayBuffer: ArrayBuffer, fontSize: number, spriteSheetName?: string): Promise<DisplaySpriteSheet>;
}

declare const DisplayContextCommandTypes: readonly ["show", "clear", "setColor", "setColorOpacity", "setOpacity", "saveContext", "restoreContext", "selectBackgroundColor", "selectFillColor", "selectLineColor", "setLineWidth", "setRotation", "clearRotation", "setHorizontalAlign", "setVerticalAlign", "setSegmentStartCap", "setSegmentEndCap", "setSegmentCap", "setSegmentStartRadius", "setSegmentEndRadius", "setSegmentRadius", "setCropTop", "setCropRight", "setCropBottom", "setCropLeft", "clearCrop", "setRotationCropTop", "setRotationCropRight", "setRotationCropBottom", "setRotationCropLeft", "clearRotationCrop", "selectBitmapColor", "selectBitmapColors", "setBitmapScaleX", "setBitmapScaleY", "setBitmapScale", "resetBitmapScale", "selectSpriteColor", "selectSpriteColors", "resetSpriteColors", "setSpriteScaleX", "setSpriteScaleY", "setSpriteScale", "resetSpriteScale", "setSpritesDirection", "setSpritesAlign", "setSpritesSpacing", "setSpritesLineSpacing", "clearRect", "drawRect", "drawRoundRect", "drawCircle", "drawArc", "drawEllipse", "drawArcEllipse", "drawSegment", "drawSegments", "drawRegularPolygon", "drawPolygon", "drawQuadraticCurve", "drawQuadraticCurves", "drawBezierCurve", "drawBezierCurves", "drawPath", "drawClosedPath", "drawBitmap", "selectSpriteSheet", "drawSprite", "drawSprites"];
type DisplayContextCommandType = (typeof DisplayContextCommandTypes)[number];
declare const DisplaySpriteContextCommandTypes: readonly ["selectFillColor", "selectLineColor", "setLineWidth", "setRotation", "clearRotation", "setSegmentStartCap", "setSegmentEndCap", "setSegmentCap", "setSegmentStartRadius", "setSegmentEndRadius", "setSegmentRadius", "setCropTop", "setCropRight", "setCropBottom", "setCropLeft", "clearCrop", "setRotationCropTop", "setRotationCropRight", "setRotationCropBottom", "setRotationCropLeft", "clearRotationCrop", "selectBitmapColor", "selectBitmapColors", "setBitmapScaleX", "setBitmapScaleY", "setBitmapScale", "resetBitmapScale", "selectSpriteColor", "selectSpriteColors", "resetSpriteColors", "setSpriteScaleX", "setSpriteScaleY", "setSpriteScale", "resetSpriteScale", "clearRect", "drawRect", "drawRoundRect", "drawCircle", "drawEllipse", "drawRegularPolygon", "drawSegment", "drawSegments", "drawArc", "drawArcEllipse", "drawBitmap", "drawSprite"];
type DisplaySpriteContextCommandType = (typeof DisplaySpriteContextCommandTypes)[number];
interface BaseDisplayContextCommand {
    type: DisplayContextCommandType | "runDisplayContextCommands";
    hide?: boolean;
}
interface SimpleDisplayCommand extends BaseDisplayContextCommand {
    type: "show" | "clear" | "saveContext" | "restoreContext" | "clearRotation" | "clearCrop" | "clearRotationCrop" | "resetBitmapScale" | "resetSpriteColors" | "resetSpriteScale";
}
interface SetDisplayColorCommand extends BaseDisplayContextCommand {
    type: "setColor";
    colorIndex: number;
    color: DisplayColorRGB | string;
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
interface SelectDisplayFillColorCommand extends BaseDisplayContextCommand {
    type: "selectFillColor";
    fillColorIndex: number;
}
interface SelectDisplayLineColorCommand extends BaseDisplayContextCommand {
    type: "selectLineColor";
    lineColorIndex: number;
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
type DisplayContextCommand = SimpleDisplayCommand | SetDisplayColorCommand | SetDisplayColorOpacityCommand | SetDisplayOpacityCommand | SelectDisplayFillColorCommand | SelectDisplayLineColorCommand | SetDisplayLineWidthCommand | SetDisplayRotationCommand | SetDisplaySegmentStartCapCommand | SetDisplaySegmentEndCapCommand | SetDisplaySegmentCapCommand | SetDisplaySegmentStartRadiusCommand | SetDisplaySegmentEndRadiusCommand | SetDisplaySegmentRadiusCommand | SetDisplayCropTopCommand | SetDisplayCropRightCommand | SetDisplayCropBottomCommand | SetDisplayCropLeftCommand | SetDisplayRotationCropTopCommand | SetDisplayRotationCropRightCommand | SetDisplayRotationCropBottomCommand | SetDisplayRotationCropLeftCommand | SelectDisplayBitmapColorIndexCommand | SelectDisplayBitmapColorIndicesCommand | SetDisplayBitmapScaleXCommand | SetDisplayBitmapScaleYCommand | SetDisplayBitmapScaleCommand | SelectDisplaySpriteColorIndexCommand | SelectDisplaySpriteColorIndicesCommand | SetDisplaySpriteScaleXCommand | SetDisplaySpriteScaleYCommand | SetDisplaySpriteScaleCommand | ClearDisplayRectCommand | DrawDisplayRectCommand | DrawDisplayRoundedRectCommand | DrawDisplayCircleCommand | DrawDisplayEllipseCommand | DrawDisplayRegularPolygonCommand | DrawDisplaySegmentCommand | DrawDisplaySegmentsCommand | DrawDisplayArcCommand | DrawDisplayArcEllipseCommand | DrawDisplayBitmapCommand | DrawDisplaySpriteCommand | SelectDisplaySpriteSheetCommand;

type FileLike = number[] | ArrayBuffer | DataView | URL | string | File;

declare const FileTypes: readonly ["tflite", "wifiServerCert", "wifiServerKey", "spriteSheet"];
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

declare const MicrophoneCommands: readonly ["start", "stop", "vad"];
type MicrophoneCommand = (typeof MicrophoneCommands)[number];
declare const MicrophoneStatuses: readonly ["idle", "streaming", "vad"];
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
        sampleRate: MicrophoneSampleRate;
        bitDepth: MicrophoneBitDepth;
        blob: Blob;
        url: string;
    };
}

declare const CameraCommands: readonly ["focus", "takePicture", "stop", "sleep", "wake"];
type CameraCommand = (typeof CameraCommands)[number];
declare const CameraStatuses: readonly ["idle", "focusing", "takingPicture", "asleep"];
type CameraStatus = (typeof CameraStatuses)[number];
declare const CameraDataTypes: readonly ["headerSize", "header", "imageSize", "image", "footerSize", "footer"];
type CameraDataType = (typeof CameraDataTypes)[number];
declare const CameraConfigurationTypes: readonly ["resolution", "qualityFactor", "shutter", "gain", "redGain", "greenGain", "blueGain"];
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
    cameraImage: {
        blob: Blob;
        url: string;
    };
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
        dataView: DataView;
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

type ValueOf<T> = T[keyof T];
type AddProperty<T, Key extends string, Value> = T & {
    [K in Key]: Value;
};
type AddKeysAsPropertyToInterface<Interface, Key extends string> = {
    [Value in keyof Interface]: AddProperty<Interface[Value], Key, Value>;
};
type ExtendInterfaceValues<Interface, T> = {
    [Key in keyof Interface]: Interface[Key] & T;
};
type CapitalizeFirstLetter<S extends string> = S extends `${infer First}${infer Rest}` ? `${Uppercase<First>}${Rest}` : S;
type AddPrefix<P extends string, S extends string> = `${P}${CapitalizeFirstLetter<S>}`;
type AddPrefixToInterfaceKeys<Interface, P extends string> = {
    [Key in keyof Interface as `${AddPrefix<P, Key & string>}`]: Interface[Key];
};

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
    };
    rotation: {
        rotation: Quaternion;
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

declare const SensorTypes: readonly ["pressure", "acceleration", "gravity", "linearAcceleration", "gyroscope", "magnetometer", "gameRotation", "rotation", "orientation", "activity", "stepCounter", "stepDetector", "deviceOrientation", "tapDetector", "barometer", "camera", "microphone"];
type SensorType = (typeof SensorTypes)[number];
declare const ContinuousSensorTypes: readonly ["pressure", "acceleration", "gravity", "linearAcceleration", "gyroscope", "magnetometer", "gameRotation", "rotation", "orientation", "barometer"];
type ContinuousSensorType = (typeof ContinuousSensorTypes)[number];
interface BaseSensorDataEventMessage {
    timestamp: number;
}
type BaseSensorDataEventMessages = BarometerSensorDataEventMessages & MotionSensorDataEventMessages & PressureDataEventMessages;
type _SensorDataEventMessages = ExtendInterfaceValues<AddKeysAsPropertyToInterface<BaseSensorDataEventMessages, "sensorType">, BaseSensorDataEventMessage>;
type SensorDataEventMessage = ValueOf<_SensorDataEventMessages>;
interface AnySensorDataEventMessages {
    sensorData: SensorDataEventMessage;
}
type SensorDataEventMessages = _SensorDataEventMessages & AnySensorDataEventMessages;

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
declare const TfliteSensorTypes: readonly ["pressure", "linearAcceleration", "gyroscope", "magnetometer"];
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
declare const ClientConnectionTypes: readonly ["noble", "webSocket", "udp"];
type ClientConnectionType = (typeof ClientConnectionTypes)[number];
interface BaseConnectOptions {
    type: "client" | "webBluetooth" | "webSocket" | "udp";
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
type ConnectOptions = WebBluetoothConnectOptions | WebSocketConnectOptions | UDPConnectOptions | ClientConnectOptions;
declare const ConnectionStatuses: readonly ["notConnected", "connecting", "connected", "disconnecting"];
type ConnectionStatus = (typeof ConnectionStatuses)[number];
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
declare const TxRxMessageTypes: readonly ["isCharging", "getBatteryCurrent", "getMtu", "getId", "getName", "setName", "getType", "setType", "getCurrentTime", "setCurrentTime", "getSensorConfiguration", "setSensorConfiguration", "getPressurePositions", "getSensorScalars", "sensorData", "getVibrationLocations", "triggerVibration", "getFileTypes", "maxFileLength", "getFileType", "setFileType", "getFileLength", "setFileLength", "getFileChecksum", "setFileChecksum", "setFileTransferCommand", "fileTransferStatus", "getFileBlock", "setFileBlock", "fileBytesTransferred", "getTfliteName", "setTfliteName", "getTfliteTask", "setTfliteTask", "getTfliteSampleRate", "setTfliteSampleRate", "getTfliteSensorTypes", "setTfliteSensorTypes", "tfliteIsReady", "getTfliteCaptureDelay", "setTfliteCaptureDelay", "getTfliteThreshold", "setTfliteThreshold", "getTfliteInferencingEnabled", "setTfliteInferencingEnabled", "tfliteInference", "isWifiAvailable", "getWifiSSID", "setWifiSSID", "getWifiPassword", "setWifiPassword", "getWifiConnectionEnabled", "setWifiConnectionEnabled", "isWifiConnected", "ipAddress", "isWifiSecure", "cameraStatus", "cameraCommand", "getCameraConfiguration", "setCameraConfiguration", "cameraData", "microphoneStatus", "microphoneCommand", "getMicrophoneConfiguration", "setMicrophoneConfiguration", "microphoneData", "isDisplayAvailable", "displayStatus", "displayInformation", "displayCommand", "getDisplayBrightness", "setDisplayBrightness", "displayContextCommands", "displayReady", "getSpriteSheetName", "setSpriteSheetName", "spriteSheetIndex"];
type TxRxMessageType = (typeof TxRxMessageTypes)[number];
declare const ConnectionMessageTypes: readonly ["batteryLevel", "manufacturerName", "modelNumber", "hardwareRevision", "firmwareRevision", "softwareRevision", "pnpId", "serialNumber", "rx", "tx", "isCharging", "getBatteryCurrent", "getMtu", "getId", "getName", "setName", "getType", "setType", "getCurrentTime", "setCurrentTime", "getSensorConfiguration", "setSensorConfiguration", "getPressurePositions", "getSensorScalars", "sensorData", "getVibrationLocations", "triggerVibration", "getFileTypes", "maxFileLength", "getFileType", "setFileType", "getFileLength", "setFileLength", "getFileChecksum", "setFileChecksum", "setFileTransferCommand", "fileTransferStatus", "getFileBlock", "setFileBlock", "fileBytesTransferred", "getTfliteName", "setTfliteName", "getTfliteTask", "setTfliteTask", "getTfliteSampleRate", "setTfliteSampleRate", "getTfliteSensorTypes", "setTfliteSensorTypes", "tfliteIsReady", "getTfliteCaptureDelay", "setTfliteCaptureDelay", "getTfliteThreshold", "setTfliteThreshold", "getTfliteInferencingEnabled", "setTfliteInferencingEnabled", "tfliteInference", "isWifiAvailable", "getWifiSSID", "setWifiSSID", "getWifiPassword", "setWifiPassword", "getWifiConnectionEnabled", "setWifiConnectionEnabled", "isWifiConnected", "ipAddress", "isWifiSecure", "cameraStatus", "cameraCommand", "getCameraConfiguration", "setCameraConfiguration", "cameraData", "microphoneStatus", "microphoneCommand", "getMicrophoneConfiguration", "setMicrophoneConfiguration", "microphoneData", "isDisplayAvailable", "displayStatus", "displayInformation", "displayCommand", "getDisplayBrightness", "setDisplayBrightness", "displayContextCommands", "displayReady", "getSpriteSheetName", "setSpriteSheetName", "spriteSheetIndex", "smp"];
type ConnectionMessageType = (typeof ConnectionMessageTypes)[number];
type ConnectionStatusCallback = (status: ConnectionStatus) => void;
type MessageReceivedCallback = (messageType: ConnectionMessageType, dataView: DataView) => void;
type MessagesReceivedCallback = () => void;
declare abstract class BaseConnectionManager {
    #private;
    abstract get bluetoothId(): string;
    onStatusUpdated?: ConnectionStatusCallback;
    onMessageReceived?: MessageReceivedCallback;
    onMessagesReceived?: MessagesReceivedCallback;
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
    connect(): Promise<void>;
    get canReconnect(): boolean;
    reconnect(): Promise<void>;
    disconnect(): Promise<void>;
    sendSmpMessage(data: ArrayBuffer): Promise<void>;
    sendTxMessages(messages: TxMessage[] | undefined, sendImmediately?: boolean): Promise<void>;
    protected defaultMtu: number;
    mtu?: number;
    sendTxData(data: ArrayBuffer): Promise<void>;
    parseRxMessage(dataView: DataView): void;
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

declare const VibrationLocations: readonly ["front", "rear"];
type VibrationLocation = (typeof VibrationLocations)[number];
declare const VibrationTypes: readonly ["waveformEffect", "waveform"];
type VibrationType = (typeof VibrationTypes)[number];
interface VibrationWaveformEffectSegment {
    effect?: VibrationWaveformEffect;
    delay?: number;
    loopCount?: number;
}
interface VibrationWaveformSegment {
    duration: number;
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
declare const InformationMessageTypes: readonly ["isCharging", "getBatteryCurrent", "getMtu", "getId", "getName", "setName", "getType", "setType", "getCurrentTime", "setCurrentTime"];
type InformationMessageType = (typeof InformationMessageTypes)[number];
declare const InformationEventTypes: readonly ["isCharging", "getBatteryCurrent", "getMtu", "getId", "getName", "setName", "getType", "setType", "getCurrentTime", "setCurrentTime"];
type InformationEventType = (typeof InformationEventTypes)[number];
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
type InformationEventDispatcher = EventDispatcher<Device, InformationEventType, InformationEventMessages>;
type SendInformationMessageCallback = SendMessageCallback<InformationMessageType>;
declare class InformationManager {
    #private;
    constructor();
    sendMessage: SendInformationMessageCallback;
    eventDispatcher: InformationEventDispatcher;
    get waitForEvent(): <T extends "isCharging" | "getBatteryCurrent" | "getMtu" | "getId" | "getName" | "setName" | "getType" | "setType" | "getCurrentTime" | "setCurrentTime">(type: T) => Promise<{
        type: T;
        target: Device;
        message: InformationEventMessages[T];
    }>;
    get isCharging(): boolean;
    get batteryCurrent(): number;
    getBatteryCurrent(): Promise<void>;
    get id(): string;
    get name(): string;
    updateName(updatedName: string): void;
    setName(newName: string): Promise<void>;
    get type(): "leftInsole" | "rightInsole" | "leftGlove" | "rightGlove" | "glasses" | "generic";
    get typeEnum(): number;
    updateType(updatedType: DeviceType): void;
    setType(newType: DeviceType): Promise<void>;
    get isInsole(): boolean;
    get isGlove(): boolean;
    get side(): Side;
    get mtu(): number;
    get isCurrentTimeSet(): boolean;
    parseMessage(messageType: InformationMessageType, dataView: DataView): void;
    clear(): void;
    connectionType?: ConnectionType;
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

declare const DeviceEventTypes: readonly ["connectionMessage", "notConnected", "connecting", "connected", "disconnecting", "connectionStatus", "isConnected", "rx", "tx", "batteryLevel", "isCharging", "getBatteryCurrent", "getMtu", "getId", "getName", "setName", "getType", "setType", "getCurrentTime", "setCurrentTime", "manufacturerName", "modelNumber", "hardwareRevision", "firmwareRevision", "softwareRevision", "pnpId", "serialNumber", "deviceInformation", "getSensorConfiguration", "setSensorConfiguration", "getPressurePositions", "getSensorScalars", "sensorData", "pressure", "acceleration", "gravity", "linearAcceleration", "gyroscope", "magnetometer", "gameRotation", "rotation", "orientation", "activity", "stepCounter", "stepDetector", "deviceOrientation", "tapDetector", "barometer", "camera", "microphone", "getVibrationLocations", "triggerVibration", "getFileTypes", "maxFileLength", "getFileType", "setFileType", "getFileLength", "setFileLength", "getFileChecksum", "setFileChecksum", "setFileTransferCommand", "fileTransferStatus", "getFileBlock", "setFileBlock", "fileBytesTransferred", "fileTransferProgress", "fileTransferComplete", "fileReceived", "getTfliteName", "setTfliteName", "getTfliteTask", "setTfliteTask", "getTfliteSampleRate", "setTfliteSampleRate", "getTfliteSensorTypes", "setTfliteSensorTypes", "tfliteIsReady", "getTfliteCaptureDelay", "setTfliteCaptureDelay", "getTfliteThreshold", "setTfliteThreshold", "getTfliteInferencingEnabled", "setTfliteInferencingEnabled", "tfliteInference", "isWifiAvailable", "getWifiSSID", "setWifiSSID", "getWifiPassword", "setWifiPassword", "getWifiConnectionEnabled", "setWifiConnectionEnabled", "isWifiConnected", "ipAddress", "isWifiSecure", "cameraStatus", "cameraCommand", "getCameraConfiguration", "setCameraConfiguration", "cameraData", "cameraImageProgress", "cameraImage", "microphoneStatus", "microphoneCommand", "getMicrophoneConfiguration", "setMicrophoneConfiguration", "microphoneData", "isRecordingMicrophone", "microphoneRecording", "isDisplayAvailable", "displayStatus", "displayInformation", "displayCommand", "getDisplayBrightness", "setDisplayBrightness", "displayContextCommands", "displayReady", "getSpriteSheetName", "setSpriteSheetName", "spriteSheetIndex", "displayContextState", "displayColor", "displayColorOpacity", "displayOpacity", "displaySpriteSheetUploadStart", "displaySpriteSheetUploadProgress", "displaySpriteSheetUploadComplete", "smp", "firmwareImages", "firmwareUploadProgress", "firmwareStatus", "firmwareUploadComplete"];
type DeviceEventType = (typeof DeviceEventTypes)[number];
interface DeviceEventMessages extends ConnectionStatusEventMessages, DeviceInformationEventMessages, InformationEventMessages, SensorDataEventMessages, SensorConfigurationEventMessages, TfliteEventMessages, FileTransferEventMessages, WifiEventMessages, CameraEventMessages, MicrophoneEventMessages, DisplayEventMessages, FirmwareEventMessages {
    batteryLevel: {
        batteryLevel: number;
    };
    connectionMessage: {
        messageType: ConnectionMessageType;
        dataView: DataView;
    };
}
type SendMessageCallback<MessageType extends string> = (messages?: {
    type: MessageType;
    data?: ArrayBuffer;
}[], sendImmediately?: boolean) => Promise<void>;
type DeviceEvent = Event<Device, DeviceEventType, DeviceEventMessages>;
type DeviceEventMap = EventMap<Device, DeviceEventType, DeviceEventMessages>;
type DeviceEventListenerMap = EventListenerMap<Device, DeviceEventType, DeviceEventMessages>;
type BoundDeviceEventListeners = BoundEventListeners<Device, DeviceEventType, DeviceEventMessages>;
declare class Device {
    #private;
    get bluetoothId(): string | undefined;
    get isAvailable(): boolean | undefined;
    constructor();
    get addEventListener(): <T extends "pressure" | "getFileTypes" | "maxFileLength" | "getFileType" | "setFileType" | "getFileLength" | "setFileLength" | "getFileChecksum" | "setFileChecksum" | "setFileTransferCommand" | "fileTransferStatus" | "getFileBlock" | "setFileBlock" | "fileBytesTransferred" | "fileTransferProgress" | "fileTransferComplete" | "fileReceived" | "acceleration" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation" | "orientation" | "activity" | "stepCounter" | "stepDetector" | "deviceOrientation" | "tapDetector" | "barometer" | "camera" | "cameraStatus" | "cameraCommand" | "getCameraConfiguration" | "setCameraConfiguration" | "cameraData" | "cameraImageProgress" | "cameraImage" | "microphone" | "microphoneStatus" | "microphoneCommand" | "getMicrophoneConfiguration" | "setMicrophoneConfiguration" | "microphoneData" | "isRecordingMicrophone" | "microphoneRecording" | "getPressurePositions" | "getSensorScalars" | "sensorData" | "getSensorConfiguration" | "setSensorConfiguration" | "getTfliteName" | "setTfliteName" | "getTfliteTask" | "setTfliteTask" | "getTfliteSampleRate" | "setTfliteSampleRate" | "getTfliteSensorTypes" | "setTfliteSensorTypes" | "tfliteIsReady" | "getTfliteCaptureDelay" | "setTfliteCaptureDelay" | "getTfliteThreshold" | "setTfliteThreshold" | "getTfliteInferencingEnabled" | "setTfliteInferencingEnabled" | "tfliteInference" | "manufacturerName" | "modelNumber" | "hardwareRevision" | "firmwareRevision" | "softwareRevision" | "pnpId" | "serialNumber" | "deviceInformation" | "isCharging" | "getBatteryCurrent" | "getMtu" | "getId" | "getName" | "setName" | "getType" | "setType" | "getCurrentTime" | "setCurrentTime" | "getVibrationLocations" | "triggerVibration" | "isWifiAvailable" | "getWifiSSID" | "setWifiSSID" | "getWifiPassword" | "setWifiPassword" | "getWifiConnectionEnabled" | "setWifiConnectionEnabled" | "isWifiConnected" | "ipAddress" | "isWifiSecure" | "spriteSheetIndex" | "isDisplayAvailable" | "displayStatus" | "displayInformation" | "displayCommand" | "getDisplayBrightness" | "setDisplayBrightness" | "displayContextCommands" | "displayReady" | "getSpriteSheetName" | "setSpriteSheetName" | "displayContextState" | "displayColor" | "displayColorOpacity" | "displayOpacity" | "displaySpriteSheetUploadStart" | "displaySpriteSheetUploadProgress" | "displaySpriteSheetUploadComplete" | "notConnected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isConnected" | "smp" | "batteryLevel" | "rx" | "tx" | "firmwareImages" | "firmwareUploadProgress" | "firmwareStatus" | "firmwareUploadComplete" | "connectionMessage">(type: T, listener: (event: {
        type: T;
        target: Device;
        message: DeviceEventMessages[T];
    }) => void, options?: {
        once?: boolean;
    }) => void;
    get removeEventListener(): <T extends "pressure" | "getFileTypes" | "maxFileLength" | "getFileType" | "setFileType" | "getFileLength" | "setFileLength" | "getFileChecksum" | "setFileChecksum" | "setFileTransferCommand" | "fileTransferStatus" | "getFileBlock" | "setFileBlock" | "fileBytesTransferred" | "fileTransferProgress" | "fileTransferComplete" | "fileReceived" | "acceleration" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation" | "orientation" | "activity" | "stepCounter" | "stepDetector" | "deviceOrientation" | "tapDetector" | "barometer" | "camera" | "cameraStatus" | "cameraCommand" | "getCameraConfiguration" | "setCameraConfiguration" | "cameraData" | "cameraImageProgress" | "cameraImage" | "microphone" | "microphoneStatus" | "microphoneCommand" | "getMicrophoneConfiguration" | "setMicrophoneConfiguration" | "microphoneData" | "isRecordingMicrophone" | "microphoneRecording" | "getPressurePositions" | "getSensorScalars" | "sensorData" | "getSensorConfiguration" | "setSensorConfiguration" | "getTfliteName" | "setTfliteName" | "getTfliteTask" | "setTfliteTask" | "getTfliteSampleRate" | "setTfliteSampleRate" | "getTfliteSensorTypes" | "setTfliteSensorTypes" | "tfliteIsReady" | "getTfliteCaptureDelay" | "setTfliteCaptureDelay" | "getTfliteThreshold" | "setTfliteThreshold" | "getTfliteInferencingEnabled" | "setTfliteInferencingEnabled" | "tfliteInference" | "manufacturerName" | "modelNumber" | "hardwareRevision" | "firmwareRevision" | "softwareRevision" | "pnpId" | "serialNumber" | "deviceInformation" | "isCharging" | "getBatteryCurrent" | "getMtu" | "getId" | "getName" | "setName" | "getType" | "setType" | "getCurrentTime" | "setCurrentTime" | "getVibrationLocations" | "triggerVibration" | "isWifiAvailable" | "getWifiSSID" | "setWifiSSID" | "getWifiPassword" | "setWifiPassword" | "getWifiConnectionEnabled" | "setWifiConnectionEnabled" | "isWifiConnected" | "ipAddress" | "isWifiSecure" | "spriteSheetIndex" | "isDisplayAvailable" | "displayStatus" | "displayInformation" | "displayCommand" | "getDisplayBrightness" | "setDisplayBrightness" | "displayContextCommands" | "displayReady" | "getSpriteSheetName" | "setSpriteSheetName" | "displayContextState" | "displayColor" | "displayColorOpacity" | "displayOpacity" | "displaySpriteSheetUploadStart" | "displaySpriteSheetUploadProgress" | "displaySpriteSheetUploadComplete" | "notConnected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isConnected" | "smp" | "batteryLevel" | "rx" | "tx" | "firmwareImages" | "firmwareUploadProgress" | "firmwareStatus" | "firmwareUploadComplete" | "connectionMessage">(type: T, listener: (event: {
        type: T;
        target: Device;
        message: DeviceEventMessages[T];
    }) => void) => void;
    get waitForEvent(): <T extends "pressure" | "getFileTypes" | "maxFileLength" | "getFileType" | "setFileType" | "getFileLength" | "setFileLength" | "getFileChecksum" | "setFileChecksum" | "setFileTransferCommand" | "fileTransferStatus" | "getFileBlock" | "setFileBlock" | "fileBytesTransferred" | "fileTransferProgress" | "fileTransferComplete" | "fileReceived" | "acceleration" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation" | "orientation" | "activity" | "stepCounter" | "stepDetector" | "deviceOrientation" | "tapDetector" | "barometer" | "camera" | "cameraStatus" | "cameraCommand" | "getCameraConfiguration" | "setCameraConfiguration" | "cameraData" | "cameraImageProgress" | "cameraImage" | "microphone" | "microphoneStatus" | "microphoneCommand" | "getMicrophoneConfiguration" | "setMicrophoneConfiguration" | "microphoneData" | "isRecordingMicrophone" | "microphoneRecording" | "getPressurePositions" | "getSensorScalars" | "sensorData" | "getSensorConfiguration" | "setSensorConfiguration" | "getTfliteName" | "setTfliteName" | "getTfliteTask" | "setTfliteTask" | "getTfliteSampleRate" | "setTfliteSampleRate" | "getTfliteSensorTypes" | "setTfliteSensorTypes" | "tfliteIsReady" | "getTfliteCaptureDelay" | "setTfliteCaptureDelay" | "getTfliteThreshold" | "setTfliteThreshold" | "getTfliteInferencingEnabled" | "setTfliteInferencingEnabled" | "tfliteInference" | "manufacturerName" | "modelNumber" | "hardwareRevision" | "firmwareRevision" | "softwareRevision" | "pnpId" | "serialNumber" | "deviceInformation" | "isCharging" | "getBatteryCurrent" | "getMtu" | "getId" | "getName" | "setName" | "getType" | "setType" | "getCurrentTime" | "setCurrentTime" | "getVibrationLocations" | "triggerVibration" | "isWifiAvailable" | "getWifiSSID" | "setWifiSSID" | "getWifiPassword" | "setWifiPassword" | "getWifiConnectionEnabled" | "setWifiConnectionEnabled" | "isWifiConnected" | "ipAddress" | "isWifiSecure" | "spriteSheetIndex" | "isDisplayAvailable" | "displayStatus" | "displayInformation" | "displayCommand" | "getDisplayBrightness" | "setDisplayBrightness" | "displayContextCommands" | "displayReady" | "getSpriteSheetName" | "setSpriteSheetName" | "displayContextState" | "displayColor" | "displayColorOpacity" | "displayOpacity" | "displaySpriteSheetUploadStart" | "displaySpriteSheetUploadProgress" | "displaySpriteSheetUploadComplete" | "notConnected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isConnected" | "smp" | "batteryLevel" | "rx" | "tx" | "firmwareImages" | "firmwareUploadProgress" | "firmwareStatus" | "firmwareUploadComplete" | "connectionMessage">(type: T) => Promise<{
        type: T;
        target: Device;
        message: DeviceEventMessages[T];
    }>;
    get removeEventListeners(): <T extends "pressure" | "getFileTypes" | "maxFileLength" | "getFileType" | "setFileType" | "getFileLength" | "setFileLength" | "getFileChecksum" | "setFileChecksum" | "setFileTransferCommand" | "fileTransferStatus" | "getFileBlock" | "setFileBlock" | "fileBytesTransferred" | "fileTransferProgress" | "fileTransferComplete" | "fileReceived" | "acceleration" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation" | "orientation" | "activity" | "stepCounter" | "stepDetector" | "deviceOrientation" | "tapDetector" | "barometer" | "camera" | "cameraStatus" | "cameraCommand" | "getCameraConfiguration" | "setCameraConfiguration" | "cameraData" | "cameraImageProgress" | "cameraImage" | "microphone" | "microphoneStatus" | "microphoneCommand" | "getMicrophoneConfiguration" | "setMicrophoneConfiguration" | "microphoneData" | "isRecordingMicrophone" | "microphoneRecording" | "getPressurePositions" | "getSensorScalars" | "sensorData" | "getSensorConfiguration" | "setSensorConfiguration" | "getTfliteName" | "setTfliteName" | "getTfliteTask" | "setTfliteTask" | "getTfliteSampleRate" | "setTfliteSampleRate" | "getTfliteSensorTypes" | "setTfliteSensorTypes" | "tfliteIsReady" | "getTfliteCaptureDelay" | "setTfliteCaptureDelay" | "getTfliteThreshold" | "setTfliteThreshold" | "getTfliteInferencingEnabled" | "setTfliteInferencingEnabled" | "tfliteInference" | "manufacturerName" | "modelNumber" | "hardwareRevision" | "firmwareRevision" | "softwareRevision" | "pnpId" | "serialNumber" | "deviceInformation" | "isCharging" | "getBatteryCurrent" | "getMtu" | "getId" | "getName" | "setName" | "getType" | "setType" | "getCurrentTime" | "setCurrentTime" | "getVibrationLocations" | "triggerVibration" | "isWifiAvailable" | "getWifiSSID" | "setWifiSSID" | "getWifiPassword" | "setWifiPassword" | "getWifiConnectionEnabled" | "setWifiConnectionEnabled" | "isWifiConnected" | "ipAddress" | "isWifiSecure" | "spriteSheetIndex" | "isDisplayAvailable" | "displayStatus" | "displayInformation" | "displayCommand" | "getDisplayBrightness" | "setDisplayBrightness" | "displayContextCommands" | "displayReady" | "getSpriteSheetName" | "setSpriteSheetName" | "displayContextState" | "displayColor" | "displayColorOpacity" | "displayOpacity" | "displaySpriteSheetUploadStart" | "displaySpriteSheetUploadProgress" | "displaySpriteSheetUploadComplete" | "notConnected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isConnected" | "smp" | "batteryLevel" | "rx" | "tx" | "firmwareImages" | "firmwareUploadProgress" | "firmwareStatus" | "firmwareUploadComplete" | "connectionMessage">(type: T) => void;
    get removeAllEventListeners(): () => void;
    get connectionManager(): BaseConnectionManager | undefined;
    set connectionManager(newConnectionManager: BaseConnectionManager | undefined);
    private sendTxMessages;
    connect(options?: ConnectOptions): Promise<void>;
    get isConnected(): boolean;
    get canReconnect(): boolean | undefined;
    reconnect(): Promise<void | undefined>;
    static Connect(): Promise<Device>;
    static get ReconnectOnDisconnection(): boolean;
    static set ReconnectOnDisconnection(newReconnectOnDisconnection: boolean);
    get reconnectOnDisconnection(): boolean;
    set reconnectOnDisconnection(newReconnectOnDisconnection: boolean);
    get connectionType(): "webBluetooth" | "noble" | "client" | "webSocket" | "udp" | undefined;
    disconnect(): Promise<void>;
    toggleConnection(): void;
    get connectionStatus(): ConnectionStatus;
    get isConnectionBusy(): boolean;
    latestConnectionMessages: Map<ConnectionMessageType, DataView>;
    get deviceInformation(): DeviceInformation;
    get batteryLevel(): number;
    /** @private */
    _informationManager: InformationManager;
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
    get side(): "left" | "right";
    get mtu(): number;
    get sensorTypes(): SensorType[];
    get continuousSensorTypes(): ("pressure" | "acceleration" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation" | "orientation" | "barometer")[];
    get sensorConfiguration(): SensorConfiguration;
    get setSensorConfiguration(): (newSensorConfiguration: SensorConfiguration, clearRest?: boolean, sendImmediately?: boolean) => Promise<void>;
    clearSensorConfiguration(): Promise<void>;
    static get ClearSensorConfigurationOnLeave(): boolean;
    static set ClearSensorConfigurationOnLeave(newClearSensorConfigurationOnLeave: boolean);
    get clearSensorConfigurationOnLeave(): boolean;
    set clearSensorConfigurationOnLeave(newClearSensorConfigurationOnLeave: boolean);
    get numberOfPressureSensors(): number;
    resetPressureRange(): void;
    get vibrationLocations(): ("front" | "rear")[];
    triggerVibration(vibrationConfigurations: VibrationConfiguration[], sendImmediately?: boolean): Promise<void>;
    get fileTypes(): ("tflite" | "wifiServerCert" | "wifiServerKey" | "spriteSheet")[];
    get maxFileLength(): number;
    get validFileTypes(): ("tflite" | "wifiServerCert" | "wifiServerKey" | "spriteSheet")[];
    sendFile(fileType: FileType, file: FileLike): Promise<void>;
    receiveFile(fileType: FileType): Promise<void>;
    get fileTransferStatus(): "idle" | "sending" | "receiving";
    cancelFileTransfer(): void;
    get tfliteName(): string;
    get setTfliteName(): (newName: string, sendImmediately?: boolean) => Promise<void>;
    sendTfliteConfiguration(configuration: TfliteFileConfiguration): Promise<void>;
    get tfliteTask(): "classification" | "regression";
    get setTfliteTask(): (newTask: TfliteTask, sendImmediately?: boolean) => Promise<void>;
    get tfliteSampleRate(): number;
    get setTfliteSampleRate(): (newSampleRate: number, sendImmediately?: boolean) => Promise<void>;
    get tfliteSensorTypes(): ("pressure" | "linearAcceleration" | "gyroscope" | "magnetometer")[];
    get allowedTfliteSensorTypes(): ("pressure" | "acceleration" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation" | "orientation" | "activity" | "stepCounter" | "stepDetector" | "deviceOrientation" | "tapDetector" | "barometer" | "camera" | "microphone")[];
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
    reset(): Promise<void>;
    get firmwareStatus(): "idle" | "uploading" | "uploaded" | "pending" | "testing" | "erasing";
    get getFirmwareImages(): () => Promise<void>;
    get firmwareImages(): FirmwareImage[];
    get eraseFirmwareImage(): () => Promise<void>;
    get confirmFirmwareImage(): (imageIndex?: number) => Promise<void>;
    get testFirmwareImage(): (imageIndex?: number) => Promise<void>;
    get isServerSide(): boolean;
    set isServerSide(newIsServerSide: boolean);
    get isUkaton(): boolean;
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
    get hasCamera(): boolean;
    get cameraStatus(): "idle" | "focusing" | "takingPicture" | "asleep";
    takePicture(sensorRate?: number): Promise<void>;
    focusCamera(sensorRate?: number): Promise<void>;
    stopCamera(): Promise<void>;
    wakeCamera(): Promise<void>;
    sleepCamera(): Promise<void>;
    get cameraConfiguration(): CameraConfiguration;
    get availableCameraConfigurationTypes(): ("resolution" | "qualityFactor" | "shutter" | "gain" | "redGain" | "greenGain" | "blueGain")[];
    get cameraConfigurationRanges(): CameraConfigurationRanges;
    get setCameraConfiguration(): (newCameraConfiguration: CameraConfiguration) => Promise<void>;
    get hasMicrophone(): boolean;
    get microphoneStatus(): "idle" | "vad" | "streaming";
    startMicrophone(): Promise<void>;
    stopMicrophone(): Promise<void>;
    enableMicrophoneVad(): Promise<void>;
    toggleMicrophone(): Promise<void>;
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
    get showDisplay(): (sendImmediately?: boolean) => Promise<void>;
    get clearDisplay(): (sendImmediately?: boolean) => Promise<void>;
    get setDisplayColor(): (colorIndex: number, color: DisplayColorRGB | string, sendImmediately?: boolean) => Promise<void>;
    get setDisplayColorOpacity(): (colorIndex: number, opacity: number, sendImmediately?: boolean) => Promise<void>;
    get setDisplayOpacity(): (opacity: number, sendImmediately?: boolean) => Promise<void>;
    get saveDisplayContext(): (sendImmediately?: boolean) => Promise<void>;
    get restoreDisplayContext(): (sendImmediately?: boolean) => Promise<void>;
    get clearDisplayRect(): (x: number, y: number, width: number, height: number, sendImmediately?: boolean) => Promise<void>;
    get selectDisplayFillColor(): (fillColorIndex: number, sendImmediately?: boolean) => Promise<void>;
    get selectDisplayLineColor(): (lineColorIndex: number, sendImmediately?: boolean) => Promise<void>;
    get setDisplayLineWidth(): (lineWidth: number, sendImmediately?: boolean) => Promise<void>;
    get setDisplayRotation(): (rotation: number, isRadians?: boolean, sendImmediately?: boolean) => Promise<void>;
    get clearDisplayRotation(): (sendImmediately?: boolean) => Promise<void>;
    get setDisplaySegmentStartCap(): (segmentStartCap: DisplaySegmentCap, sendImmediately?: boolean) => Promise<void>;
    get setDisplaySegmentEndCap(): (segmentEndCap: DisplaySegmentCap, sendImmediately?: boolean) => Promise<void>;
    get setDisplaySegmentCap(): (segmentCap: DisplaySegmentCap, sendImmediately?: boolean) => Promise<void>;
    get setDisplaySegmentStartRadius(): (segmentStartRadius: number, sendImmediately?: boolean) => Promise<void>;
    get setDisplaySegmentEndRadius(): (segmentEndRadius: number, sendImmediately?: boolean) => Promise<void>;
    get setDisplaySegmentRadius(): (segmentRadius: number, sendImmediately?: boolean) => Promise<void>;
    get setDisplayCropTop(): (cropTop: number, sendImmediately?: boolean) => Promise<void>;
    get setDisplayCropRight(): (cropRight: number, sendImmediately?: boolean) => Promise<void>;
    get setDisplayCropBottom(): (cropBottom: number, sendImmediately?: boolean) => Promise<void>;
    get setDisplayCropLeft(): (cropLeft: number, sendImmediately?: boolean) => Promise<void>;
    get setDisplayCrop(): (cropDirection: DisplayCropDirection, crop: number, sendImmediately?: boolean) => Promise<void>;
    get clearDisplayCrop(): (sendImmediately?: boolean) => Promise<void>;
    get setDisplayRotationCropTop(): (rotationCropTop: number, sendImmediately?: boolean) => Promise<void>;
    get setDisplayRotationCropRight(): (rotationCropRight: number, sendImmediately?: boolean) => Promise<void>;
    get setDisplayRotationCropBottom(): (rotationCropBottom: number, sendImmediately?: boolean) => Promise<void>;
    get setDisplayRotationCropLeft(): (rotationCropLeft: number, sendImmediately?: boolean) => Promise<void>;
    get setDisplayRotationCrop(): (cropDirection: DisplayCropDirection, crop: number, sendImmediately?: boolean) => Promise<void>;
    get clearDisplayRotationCrop(): (sendImmediately?: boolean) => Promise<void>;
    get flushDisplayContextCommands(): () => Promise<void>;
    get drawDisplayRect(): (offsetX: number, offsetY: number, width: number, height: number, sendImmediately?: boolean) => Promise<void>;
    get drawDisplayCircle(): (offsetX: number, offsetY: number, radius: number, sendImmediately?: boolean) => Promise<void>;
    get drawDisplayEllipse(): (offsetX: number, offsetY: number, radiusX: number, radiusY: number, sendImmediately?: boolean) => Promise<void>;
    get drawDisplayRoundRect(): (offsetX: number, offsetY: number, width: number, height: number, borderRadius: number, sendImmediately?: boolean) => Promise<void>;
    get drawDisplayRegularPolygon(): (offsetX: number, offsetY: number, radius: number, numberOfSides: number, sendImmediately?: boolean) => Promise<void>;
    get drawDisplaySegment(): (startX: number, startY: number, endX: number, endY: number, sendImmediately?: boolean) => Promise<void>;
    get drawDisplaySegments(): (points: Vector2[], sendImmediately?: boolean) => Promise<void>;
    get drawDisplayArc(): (offsetX: number, offsetY: number, radius: number, startAngle: number, angleOffset: number, isRadians?: boolean, sendImmediately?: boolean) => Promise<void>;
    get drawDisplayArcEllipse(): (offsetX: number, offsetY: number, radiusX: number, radiusY: number, startAngle: number, angleOffset: number, isRadians?: boolean, sendImmediately?: boolean) => Promise<void>;
    get drawDisplayBitmap(): (offsetX: number, offsetY: number, bitmap: DisplayBitmap, sendImmediately?: boolean) => Promise<void>;
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
        colorIndices: number[];
    }>;
    get setDisplayContextState(): (newState: PartialDisplayContextState, sendImmediately?: boolean) => Promise<void>;
    get selectDisplayBitmapColor(): (bitmapColorIndex: number, colorIndex: number, sendImmediately?: boolean) => Promise<void>;
    get selectDisplayBitmapColors(): (bitmapColorPairs: DisplayBitmapColorPair[], sendImmediately?: boolean) => Promise<void>;
    get setDisplayBitmapColor(): (bitmapColorIndex: number, color: DisplayColorRGB | string, sendImmediately?: boolean) => Promise<void>;
    get setDisplayBitmapColorOpacity(): (bitmapColorIndex: number, opacity: number, sendImmediately?: boolean) => Promise<void>;
    get setDisplayBitmapScaleDirection(): (direction: DisplayScaleDirection, bitmapScale: number, sendImmediately?: boolean) => Promise<void>;
    get setDisplayBitmapScaleX(): (bitmapScaleX: number, sendImmediately?: boolean) => Promise<void>;
    get setDisplayBitmapScaleY(): (bitmapScaleY: number, sendImmediately?: boolean) => Promise<void>;
    get setDisplayBitmapScale(): (bitmapScale: number, sendImmediately?: boolean) => Promise<void>;
    get resetDisplayBitmapScale(): (sendImmediately?: boolean) => Promise<void>;
    get selectDisplaySpriteColor(): (spriteColorIndex: number, colorIndex: number, sendImmediately?: boolean) => Promise<void>;
    get selectDisplaySpriteColors(): (spriteColorPairs: DisplaySpriteColorPair[], sendImmediately?: boolean) => Promise<void>;
    get setDisplaySpriteColor(): (spriteColorIndex: number, color: DisplayColorRGB | string, sendImmediately?: boolean) => Promise<void>;
    get setDisplaySpriteColorOpacity(): (spriteColorIndex: number, opacity: number, sendImmediately?: boolean) => Promise<void>;
    get resetDisplaySpriteColors(): (sendImmediately?: boolean) => Promise<void>;
    get setDisplaySpriteScaleDirection(): (direction: DisplayScaleDirection, spriteScale: number, sendImmediately?: boolean) => Promise<void>;
    get setDisplaySpriteScaleX(): (spriteScaleX: number, sendImmediately?: boolean) => Promise<void>;
    get setDisplaySpriteScaleY(): (spriteScaleY: number, sendImmediately?: boolean) => Promise<void>;
    get setDisplaySpriteScale(): (spriteScale: number, sendImmediately?: boolean) => Promise<void>;
    get resetDisplaySpriteScale(): (sendImmediately?: boolean) => Promise<void>;
    get displayManager(): DisplayManagerInterface;
    get uploadDisplaySpriteSheet(): (spriteSheet: DisplaySpriteSheet) => Promise<void>;
    get uploadDisplaySpriteSheets(): (spriteSheets: DisplaySpriteSheet[]) => Promise<void>;
    get selectDisplaySpriteSheet(): (spriteSheetName: string, sendImmediately?: boolean) => Promise<void>;
    get drawDisplaySprite(): (offsetX: number, offsetY: number, spriteName: string, sendImmediately?: boolean) => Promise<void>;
    get displaySpriteSheets(): Record<string, DisplaySpriteSheet>;
    get serializeDisplaySpriteSheet(): (spriteSheet: DisplaySpriteSheet) => ArrayBuffer;
}

declare const DeviceManagerEventTypes: readonly ["deviceConnected", "deviceDisconnected", "deviceIsConnected", "availableDevices", "connectedDevices"];
type DeviceManagerEventType = (typeof DeviceManagerEventTypes)[number];
interface DeviceManagerEventMessage {
    device: Device;
}
interface DeviceManagerEventMessages {
    deviceConnected: DeviceManagerEventMessage;
    deviceDisconnected: DeviceManagerEventMessage;
    deviceIsConnected: DeviceManagerEventMessage;
    availableDevices: {
        availableDevices: Device[];
    };
    connectedDevices: {
        connectedDevices: Device[];
    };
}
type DeviceManagerEventMap = EventMap<typeof Device, DeviceManagerEventType, DeviceManagerEventMessages>;
type DeviceManagerEventListenerMap = EventListenerMap<typeof Device, DeviceManagerEventType, DeviceManagerEventMessages>;
type DeviceManagerEvent = Event<typeof Device, DeviceManagerEventType, DeviceManagerEventMessages>;
type BoundDeviceManagerEventListeners = BoundEventListeners<typeof Device, DeviceManagerEventType, DeviceManagerEventMessages>;
declare class DeviceManager {
    #private;
    static readonly shared: DeviceManager;
    constructor();
    /** @private */
    onDevice(device: Device): void;
    /** @private */
    OnDeviceConnectionStatusUpdated(device: Device, connectionStatus: ConnectionStatus): void;
    get ConnectedDevices(): Device[];
    get UseLocalStorage(): boolean;
    set UseLocalStorage(newUseLocalStorage: boolean);
    get CanUseLocalStorage(): false | Storage;
    get AvailableDevices(): Device[];
    get CanGetDevices(): false | (() => Promise<BluetoothDevice[]>);
    /**
     * retrieves devices already connected via web bluetooth in other tabs/windows
     *
     * _only available on web-bluetooth enabled browsers_
     */
    GetDevices(): Promise<Device[] | undefined>;
    get AddEventListener(): <T extends "deviceConnected" | "deviceDisconnected" | "deviceIsConnected" | "availableDevices" | "connectedDevices">(type: T, listener: (event: {
        type: T;
        target: DeviceManager;
        message: DeviceManagerEventMessages[T];
    }) => void, options?: {
        once?: boolean;
    }) => void;
    get RemoveEventListener(): <T extends "deviceConnected" | "deviceDisconnected" | "deviceIsConnected" | "availableDevices" | "connectedDevices">(type: T, listener: (event: {
        type: T;
        target: DeviceManager;
        message: DeviceManagerEventMessages[T];
    }) => void) => void;
    get RemoveEventListeners(): <T extends "deviceConnected" | "deviceDisconnected" | "deviceIsConnected" | "availableDevices" | "connectedDevices">(type: T) => void;
    get RemoveAllEventListeners(): () => void;
    _CheckDeviceAvailability(device: Device): void;
}
declare const _default: DeviceManager;

declare function wait(delay: number): Promise<unknown>;

declare const DisplayCanvasHelperEventTypes: readonly ["contextState", "numberOfColors", "brightness", "color", "colorOpacity", "opacity", "resize", "update", "ready", "device", "deviceIsConnected", "deviceConnected", "deviceNotConnected", "deviceSpriteSheetUploadStart", "deviceSpriteSheetUploadProgress", "deviceSpriteSheetUploadComplete"];
type DisplayCanvasHelperEventType = (typeof DisplayCanvasHelperEventTypes)[number];
interface DisplayCanvasHelperEventMessages {
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
type DisplayCanvasHelperEvent = Event<DisplayCanvasHelper, DisplayCanvasHelperEventType, DisplayCanvasHelperEventMessages>;
type DisplayCanvasHelperEventMap = EventMap<DisplayCanvasHelper, DisplayCanvasHelperEventType, DisplayCanvasHelperEventMessages>;
type DisplayCanvasHelperEventListenerMap = EventListenerMap<DisplayCanvasHelper, DisplayCanvasHelperEventType, DisplayCanvasHelperEventMessages>;
declare class DisplayCanvasHelper implements DisplayManagerInterface {
    #private;
    constructor();
    get addEventListener(): <T extends "color" | "opacity" | "numberOfColors" | "deviceConnected" | "deviceIsConnected" | "device" | "resize" | "contextState" | "brightness" | "colorOpacity" | "update" | "ready" | "deviceNotConnected" | "deviceSpriteSheetUploadStart" | "deviceSpriteSheetUploadProgress" | "deviceSpriteSheetUploadComplete">(type: T, listener: (event: {
        type: T;
        target: DisplayCanvasHelper;
        message: DisplayCanvasHelperEventMessages[T];
    }) => void, options?: {
        once?: boolean;
    }) => void;
    get removeEventListener(): <T extends "color" | "opacity" | "numberOfColors" | "deviceConnected" | "deviceIsConnected" | "device" | "resize" | "contextState" | "brightness" | "colorOpacity" | "update" | "ready" | "deviceNotConnected" | "deviceSpriteSheetUploadStart" | "deviceSpriteSheetUploadProgress" | "deviceSpriteSheetUploadComplete">(type: T, listener: (event: {
        type: T;
        target: DisplayCanvasHelper;
        message: DisplayCanvasHelperEventMessages[T];
    }) => void) => void;
    get waitForEvent(): <T extends "color" | "opacity" | "numberOfColors" | "deviceConnected" | "deviceIsConnected" | "device" | "resize" | "contextState" | "brightness" | "colorOpacity" | "update" | "ready" | "deviceNotConnected" | "deviceSpriteSheetUploadStart" | "deviceSpriteSheetUploadProgress" | "deviceSpriteSheetUploadComplete">(type: T) => Promise<{
        type: T;
        target: DisplayCanvasHelper;
        message: DisplayCanvasHelperEventMessages[T];
    }>;
    get removeEventListeners(): <T extends "color" | "opacity" | "numberOfColors" | "deviceConnected" | "deviceIsConnected" | "device" | "resize" | "contextState" | "brightness" | "colorOpacity" | "update" | "ready" | "deviceNotConnected" | "deviceSpriteSheetUploadStart" | "deviceSpriteSheetUploadProgress" | "deviceSpriteSheetUploadComplete">(type: T) => void;
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
    clearRect(x: number, y: number, width: number, height: number, sendImmediately?: boolean): Promise<void>;
    drawRect(offsetX: number, offsetY: number, width: number, height: number, sendImmediately?: boolean): Promise<void>;
    drawRoundRect(offsetX: number, offsetY: number, width: number, height: number, borderRadius: number, sendImmediately?: boolean): Promise<void>;
    drawCircle(offsetX: number, offsetY: number, radius: number, sendImmediately?: boolean): Promise<void>;
    drawEllipse(offsetX: number, offsetY: number, radiusX: number, radiusY: number, sendImmediately?: boolean): Promise<void>;
    drawRegularPolygon(offsetX: number, offsetY: number, radius: number, numberOfSides: number, sendImmediately?: boolean): Promise<void>;
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
    drawSpriteFromSpriteSheet(offsetX: number, offsetY: number, spriteName: string, spriteSheet: DisplaySpriteSheet, sendImmediately?: boolean): Promise<void>;
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
        colorIndices: number[];
    }>;
    serializeSpriteSheet(spriteSheet: DisplaySpriteSheet): ArrayBuffer;
    fontToSpriteSheet(arrayBuffer: ArrayBuffer, fontSize: number, spriteSheetName?: string): Promise<DisplaySpriteSheet>;
}

declare function quantizeImage(image: HTMLImageElement, width: number, height: number, numberOfColors: number, colors?: string[], canvas?: HTMLCanvasElement): Promise<{
    blob: Blob;
    colors: string[];
    colorIndices: number[];
}>;
declare function resizeAndQuantizeImage(image: HTMLImageElement, width: number, height: number, numberOfColors: number, colors?: string[], canvas?: HTMLCanvasElement): Promise<{
    blob: Blob;
    colors: string[];
    colorIndices: number[];
}>;
declare function canvasToSprite(canvas: HTMLCanvasElement, spriteName: string, numberOfColors: number, paletteName: string, overridePalette: boolean, spriteSheet: DisplaySpriteSheet, paletteOffset: number): Promise<{
    sprite: DisplaySprite;
    blob: Blob;
}>;
declare function imageToSprite(image: HTMLImageElement, spriteName: string, width: number, height: number, numberOfColors: number, paletteName: string, overridePalette: boolean, spriteSheet: DisplaySpriteSheet, paletteOffset: number): Promise<{
    sprite: DisplaySprite;
    blob: Blob;
}>;
declare function canvasToSpriteSheet(canvas: HTMLCanvasElement, spriteSheetName: string, numberOfColors: number, paletteName: string, maxFileLength?: number): Promise<DisplaySpriteSheet>;
declare function imageToSpriteSheet(image: HTMLImageElement, spriteSheetName: string, width: number, height: number, numberOfColors: number, paletteName: string, maxFileLength?: number): Promise<DisplaySpriteSheet>;

declare function hexToRGB(hex: string): DisplayColorRGB;
declare function rgbToHex({ r, g, b }: DisplayColorRGB): string;

interface DevicePairPressureData {
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
type DevicePairDeviceEventMessages = ExtendInterfaceValues<AddPrefixToInterfaceKeys<DeviceEventMessages, "device">, BaseDevicePairDeviceEventMessage>;
interface DevicePairConnectionEventMessages {
    isConnected: {
        isConnected: boolean;
    };
}
type DevicePairEventMessages = DevicePairConnectionEventMessages & DevicePairSensorDataEventMessages & DevicePairDeviceEventMessages;
type DevicePairEventMap = EventMap<DevicePair, DeviceEventType, DevicePairEventMessages>;
type DevicePairEventListenerMap = EventListenerMap<DevicePair, DeviceEventType, DevicePairEventMessages>;
type DevicePairEvent = Event<DevicePair, DeviceEventType, DevicePairEventMessages>;
type BoundDevicePairEventListeners = BoundEventListeners<DevicePair, DeviceEventType, DevicePairEventMessages>;
declare const DevicePairTypes: readonly ["insoles", "gloves"];
type DevicePairType = (typeof DevicePairTypes)[number];
declare class DevicePair {
    #private;
    constructor(type: DevicePairType);
    get sides(): readonly ["left", "right"];
    get type(): "insoles" | "gloves";
    get addEventListener(): <T extends "pressure" | "deviceOrientation" | "sensorData" | "isConnected" | "deviceConnected" | "deviceIsConnected" | "deviceNotConnected" | "devicePressure" | "deviceGetFileTypes" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "deviceTapDetector" | "deviceBarometer" | "deviceCameraStatus" | "deviceGetCameraConfiguration" | "deviceCameraImageProgress" | "deviceCameraImage" | "deviceMicrophoneStatus" | "deviceGetMicrophoneConfiguration" | "deviceMicrophoneData" | "deviceIsRecordingMicrophone" | "deviceMicrophoneRecording" | "deviceSensorData" | "deviceGetSensorConfiguration" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceManufacturerName" | "deviceModelNumber" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "deviceSoftwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceDeviceInformation" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceIsWifiAvailable" | "deviceGetWifiSSID" | "deviceGetWifiPassword" | "deviceIsWifiConnected" | "deviceIpAddress" | "deviceIsDisplayAvailable" | "deviceDisplayStatus" | "deviceDisplayInformation" | "deviceGetDisplayBrightness" | "deviceDisplayReady" | "deviceGetSpriteSheetName" | "deviceDisplayContextState" | "deviceDisplayColor" | "deviceDisplayColorOpacity" | "deviceDisplayOpacity" | "deviceDisplaySpriteSheetUploadStart" | "deviceDisplaySpriteSheetUploadProgress" | "deviceDisplaySpriteSheetUploadComplete" | "deviceConnecting" | "deviceDisconnecting" | "deviceConnectionStatus" | "deviceSmp" | "deviceBatteryLevel" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus" | "deviceConnectionMessage" | "deviceGetEnableWifiConnection">(type: T, listener: (event: {
        type: T;
        target: DevicePair;
        message: DevicePairEventMessages[T];
    }) => void, options?: {
        once?: boolean;
    }) => void;
    get removeEventListener(): <T extends "pressure" | "deviceOrientation" | "sensorData" | "isConnected" | "deviceConnected" | "deviceIsConnected" | "deviceNotConnected" | "devicePressure" | "deviceGetFileTypes" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "deviceTapDetector" | "deviceBarometer" | "deviceCameraStatus" | "deviceGetCameraConfiguration" | "deviceCameraImageProgress" | "deviceCameraImage" | "deviceMicrophoneStatus" | "deviceGetMicrophoneConfiguration" | "deviceMicrophoneData" | "deviceIsRecordingMicrophone" | "deviceMicrophoneRecording" | "deviceSensorData" | "deviceGetSensorConfiguration" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceManufacturerName" | "deviceModelNumber" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "deviceSoftwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceDeviceInformation" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceIsWifiAvailable" | "deviceGetWifiSSID" | "deviceGetWifiPassword" | "deviceIsWifiConnected" | "deviceIpAddress" | "deviceIsDisplayAvailable" | "deviceDisplayStatus" | "deviceDisplayInformation" | "deviceGetDisplayBrightness" | "deviceDisplayReady" | "deviceGetSpriteSheetName" | "deviceDisplayContextState" | "deviceDisplayColor" | "deviceDisplayColorOpacity" | "deviceDisplayOpacity" | "deviceDisplaySpriteSheetUploadStart" | "deviceDisplaySpriteSheetUploadProgress" | "deviceDisplaySpriteSheetUploadComplete" | "deviceConnecting" | "deviceDisconnecting" | "deviceConnectionStatus" | "deviceSmp" | "deviceBatteryLevel" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus" | "deviceConnectionMessage" | "deviceGetEnableWifiConnection">(type: T, listener: (event: {
        type: T;
        target: DevicePair;
        message: DevicePairEventMessages[T];
    }) => void) => void;
    get waitForEvent(): <T extends "pressure" | "deviceOrientation" | "sensorData" | "isConnected" | "deviceConnected" | "deviceIsConnected" | "deviceNotConnected" | "devicePressure" | "deviceGetFileTypes" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "deviceTapDetector" | "deviceBarometer" | "deviceCameraStatus" | "deviceGetCameraConfiguration" | "deviceCameraImageProgress" | "deviceCameraImage" | "deviceMicrophoneStatus" | "deviceGetMicrophoneConfiguration" | "deviceMicrophoneData" | "deviceIsRecordingMicrophone" | "deviceMicrophoneRecording" | "deviceSensorData" | "deviceGetSensorConfiguration" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceManufacturerName" | "deviceModelNumber" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "deviceSoftwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceDeviceInformation" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceIsWifiAvailable" | "deviceGetWifiSSID" | "deviceGetWifiPassword" | "deviceIsWifiConnected" | "deviceIpAddress" | "deviceIsDisplayAvailable" | "deviceDisplayStatus" | "deviceDisplayInformation" | "deviceGetDisplayBrightness" | "deviceDisplayReady" | "deviceGetSpriteSheetName" | "deviceDisplayContextState" | "deviceDisplayColor" | "deviceDisplayColorOpacity" | "deviceDisplayOpacity" | "deviceDisplaySpriteSheetUploadStart" | "deviceDisplaySpriteSheetUploadProgress" | "deviceDisplaySpriteSheetUploadComplete" | "deviceConnecting" | "deviceDisconnecting" | "deviceConnectionStatus" | "deviceSmp" | "deviceBatteryLevel" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus" | "deviceConnectionMessage" | "deviceGetEnableWifiConnection">(type: T) => Promise<{
        type: T;
        target: DevicePair;
        message: DevicePairEventMessages[T];
    }>;
    get removeEventListeners(): <T extends "pressure" | "deviceOrientation" | "sensorData" | "isConnected" | "deviceConnected" | "deviceIsConnected" | "deviceNotConnected" | "devicePressure" | "deviceGetFileTypes" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "deviceTapDetector" | "deviceBarometer" | "deviceCameraStatus" | "deviceGetCameraConfiguration" | "deviceCameraImageProgress" | "deviceCameraImage" | "deviceMicrophoneStatus" | "deviceGetMicrophoneConfiguration" | "deviceMicrophoneData" | "deviceIsRecordingMicrophone" | "deviceMicrophoneRecording" | "deviceSensorData" | "deviceGetSensorConfiguration" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceManufacturerName" | "deviceModelNumber" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "deviceSoftwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceDeviceInformation" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceIsWifiAvailable" | "deviceGetWifiSSID" | "deviceGetWifiPassword" | "deviceIsWifiConnected" | "deviceIpAddress" | "deviceIsDisplayAvailable" | "deviceDisplayStatus" | "deviceDisplayInformation" | "deviceGetDisplayBrightness" | "deviceDisplayReady" | "deviceGetSpriteSheetName" | "deviceDisplayContextState" | "deviceDisplayColor" | "deviceDisplayColorOpacity" | "deviceDisplayOpacity" | "deviceDisplaySpriteSheetUploadStart" | "deviceDisplaySpriteSheetUploadProgress" | "deviceDisplaySpriteSheetUploadComplete" | "deviceConnecting" | "deviceDisconnecting" | "deviceConnectionStatus" | "deviceSmp" | "deviceBatteryLevel" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus" | "deviceConnectionMessage" | "deviceGetEnableWifiConnection">(type: T) => void;
    get removeAllEventListeners(): () => void;
    get left(): Device | undefined;
    get right(): Device | undefined;
    get isConnected(): boolean;
    get isPartiallyConnected(): boolean;
    get isHalfConnected(): boolean;
    assignDevice(device: Device): Device | undefined;
    setSensorConfiguration(sensorConfiguration: SensorConfiguration): Promise<void>;
    resetPressureRange(): void;
    triggerVibration(vibrationConfigurations: VibrationConfiguration[], sendImmediately?: boolean): Promise<PromiseSettledResult<void | undefined>[]>;
    static get insoles(): DevicePair;
    static get gloves(): DevicePair;
}

type BoundGenericEventListeners = {
    [eventType: string]: Function;
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
}
type DiscoveredDevicesMap = {
    [deviceId: string]: DiscoveredDevice;
};

declare const ServerMessageTypes: readonly ["isScanningAvailable", "isScanning", "startScan", "stopScan", "discoveredDevice", "discoveredDevices", "expiredDiscoveredDevice", "connectToDevice", "disconnectFromDevice", "connectedDevices", "deviceMessage", "requiredDeviceInformation"];
type ServerMessageType = (typeof ServerMessageTypes)[number];
type MessageLike = number | number[] | ArrayBufferLike | DataView | boolean | string | any;
interface Message<MessageType extends string> {
    type: MessageType;
    data?: MessageLike | MessageLike[];
}
type ServerMessage = ServerMessageType | Message<ServerMessageType>;
type ClientDeviceMessage = ConnectionMessageType | Message<ConnectionMessageType>;

declare const ClientConnectionStatuses: readonly ["notConnected", "connecting", "connected", "disconnecting"];
type ClientConnectionStatus = (typeof ClientConnectionStatuses)[number];
interface ClientConnectionEventMessages {
    connectionStatus: {
        connectionStatus: ClientConnectionStatus;
    };
    isConnected: {
        isConnected: boolean;
    };
}
type ClientEventMessages = ClientConnectionEventMessages & ScannerEventMessages;
type ServerURL = string | URL;
type DevicesMap = {
    [deviceId: string]: Device;
};
declare abstract class BaseClient {
    #private;
    protected get baseConstructor(): typeof BaseClient;
    get devices(): Readonly<DevicesMap>;
    get addEventListener(): <T extends "notConnected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isConnected" | "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice">(type: T, listener: (event: {
        type: T;
        target: BaseClient;
        message: ClientEventMessages[T];
    }) => void, options?: {
        once?: boolean;
    }) => void;
    protected get dispatchEvent(): <T extends "notConnected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isConnected" | "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice">(type: T, message: ClientEventMessages[T]) => void;
    get removeEventListener(): <T extends "notConnected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isConnected" | "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice">(type: T, listener: (event: {
        type: T;
        target: BaseClient;
        message: ClientEventMessages[T];
    }) => void) => void;
    get waitForEvent(): <T extends "notConnected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isConnected" | "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice">(type: T) => Promise<{
        type: T;
        target: BaseClient;
        message: ClientEventMessages[T];
    }>;
    abstract isConnected: boolean;
    protected assertConnection(): void;
    abstract isDisconnected: boolean;
    protected assertDisconnection(): void;
    abstract connect(): void;
    abstract disconnect(): void;
    abstract reconnect(): void;
    abstract toggleConnection(url?: ServerURL): void;
    static _reconnectOnDisconnection: boolean;
    static get ReconnectOnDisconnection(): boolean;
    static set ReconnectOnDisconnection(newReconnectOnDisconnection: boolean);
    protected _reconnectOnDisconnection: boolean;
    get reconnectOnDisconnection(): boolean;
    set reconnectOnDisconnection(newReconnectOnDisconnection: boolean);
    abstract sendServerMessage(...messages: ServerMessage[]): void;
    protected get _connectionStatus(): "notConnected" | "connecting" | "connected" | "disconnecting";
    protected set _connectionStatus(newConnectionStatus: "notConnected" | "connecting" | "connected" | "disconnecting");
    get connectionStatus(): "notConnected" | "connecting" | "connected" | "disconnecting";
    protected _sendRequiredMessages(): void;
    protected parseMessage(dataView: DataView): void;
    get isScanningAvailable(): boolean;
    protected requestIsScanningAvailable(): void;
    get isScanning(): boolean;
    startScan(): void;
    stopScan(): void;
    toggleScan(): void;
    get discoveredDevices(): Readonly<DiscoveredDevicesMap>;
    protected onDiscoveredDevice(discoveredDevice: DiscoveredDevice): void;
    requestDiscoveredDevices(): void;
    connectToDevice(bluetoothId: string, connectionType?: ClientConnectionType): Device;
    protected requestConnectionToDevice(bluetoothId: string, connectionType?: ClientConnectionType): Device;
    protected sendConnectToDeviceMessage(bluetoothId: string, connectionType?: ClientConnectionType): void;
    createDevice(bluetoothId: string): Device;
    protected onConnectedBluetoothDeviceIds(bluetoothIds: string[]): void;
    disconnectFromDevice(bluetoothId: string): void;
    protected requestDisconnectionFromDevice(bluetoothId: string): Device;
    protected sendDisconnectFromDeviceMessage(bluetoothId: string): void;
    protected sendDeviceMessage(bluetoothId: string, ...messages: ClientDeviceMessage[]): void;
    protected sendRequiredDeviceInformationMessage(bluetoothId: string): void;
}

declare class WebSocketClient extends BaseClient {
    #private;
    get webSocket(): WebSocket | undefined;
    set webSocket(newWebSocket: WebSocket | undefined);
    get readyState(): number | undefined;
    get isConnected(): boolean;
    get isDisconnected(): boolean;
    connect(url?: string | URL): void;
    disconnect(): void;
    reconnect(): void;
    toggleConnection(url?: ServerURL): void;
    sendMessage(message: MessageLike): void;
    sendServerMessage(...messages: ServerMessage[]): void;
}

declare const EventUtils: {
    addEventListeners: typeof addEventListeners;
    removeEventListeners: typeof removeEventListeners;
};

declare const ThrottleUtils: {
    throttle: typeof throttle;
    debounce: typeof debounce;
};

export { type BoundDeviceEventListeners, type BoundDeviceManagerEventListeners, type BoundDevicePairEventListeners, type CameraCommand, CameraCommands, type CameraConfiguration, type CameraConfigurationType, CameraConfigurationTypes, type CenterOfPressure, type ContinuousSensorType, ContinuousSensorTypes, DefaultNumberOfDisplayColors, DefaultNumberOfPressureSensors, Device, type DeviceEvent, type DeviceEventListenerMap, type DeviceEventMap, type DeviceInformation, _default as DeviceManager, type DeviceManagerEvent, type DeviceManagerEventListenerMap, type DeviceManagerEventMap, DevicePair, type DevicePairEvent, type DevicePairEventListenerMap, type DevicePairEventMap, type DevicePairType, DevicePairTypes, type DeviceType, DeviceTypes, type DiscoveredDevice, type DisplayBitmap, type DisplayBitmapColorPair, type DisplayBrightness, DisplayBrightnesses, DisplayCanvasHelper, type DisplayCanvasHelperEvent, type DisplayCanvasHelperEventListenerMap, type DisplayCanvasHelperEventMap, type DisplayColorRGB, type DisplayContextCommand, type DisplayContextCommandType, DisplayContextCommandTypes, DisplayPixelDepths, type DisplaySegmentCap, DisplaySegmentCaps, type DisplaySize, type DisplaySprite, type DisplaySpriteColorPair, type DisplaySpriteContextCommandType, DisplaySpriteContextCommandTypes, type DisplaySpritePaletteSwap, type DisplaySpriteSheet, type DisplaySpriteSheetPalette, environment_d as Environment, type Euler, EventUtils, type FileTransferDirection, FileTransferDirections, type FileType, FileTypes, MaxNameLength, MaxNumberOfVibrationWaveformEffectSegments, MaxNumberOfVibrationWaveformSegments, MaxSensorRate, MaxSpriteSheetNameLength, MaxVibrationWaveformEffectSegmentDelay, MaxVibrationWaveformEffectSegmentLoopCount, MaxVibrationWaveformEffectSequenceLoopCount, MaxVibrationWaveformSegmentDuration, MaxWifiPasswordLength, MaxWifiSSIDLength, type MicrophoneCommand, MicrophoneCommands, type MicrophoneConfiguration, type MicrophoneConfigurationType, MicrophoneConfigurationTypes, MicrophoneConfigurationValues, MinNameLength, MinSpriteSheetNameLength, MinWifiPasswordLength, MinWifiSSIDLength, type PressureData, type Quaternion, RangeHelper, type SensorConfiguration, SensorRateStep, type SensorType, SensorTypes, type Side, Sides, type TfliteFileConfiguration, type TfliteSensorType, TfliteSensorTypes, type TfliteTask, TfliteTasks, ThrottleUtils, type Vector2, type Vector3, type VibrationConfiguration, type VibrationLocation, VibrationLocations, type VibrationType, VibrationTypes, type VibrationWaveformEffect, VibrationWaveformEffects, WebSocketClient, canvasToSprite, canvasToSpriteSheet, hexToRGB, imageToSprite, imageToSpriteSheet, maxDisplayScale, pixelDepthToNumberOfColors, quantizeImage, resizeAndQuantizeImage, rgbToHex, setAllConsoleLevelFlags, setConsoleLevelFlagsForType, wait };
