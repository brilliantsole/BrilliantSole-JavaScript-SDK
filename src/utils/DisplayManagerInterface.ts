import {
  DisplayBitmapColorPair,
  DisplayBrightness,
  DisplaySpriteColorPair,
  DisplayBitmap,
  DisplayBezierCurve,
  DisplayBezierCurveType,
  DisplayWireframe,
} from "../DisplayManager.ts";
import { colorDistanceSq } from "./ColorUtils.ts";
import { createConsole } from "./Console.ts";
import { DisplayContextCommand } from "./DisplayContextCommand.ts";
import {
  DisplayAlignment,
  DisplayAlignmentDirection,
  DisplayContextState,
  DisplayDirection,
  DisplaySegmentCap,
} from "./DisplayContextState.ts";
import {
  DisplaySprite,
  DisplaySpriteLine,
  DisplaySpriteLines,
  DisplaySpriteLinesMetrics,
  DisplaySpritePaletteSwap,
  DisplaySpriteSheet,
  DisplaySpriteSheetPalette,
  DisplaySpriteSheetPaletteSwap,
  DisplaySpriteSubLine,
  reduceSpriteSheet,
} from "./DisplaySpriteSheetUtils.ts";
import {
  DisplayScaleDirection,
  DisplayCropDirection,
  DisplayColorRGBOrString,
} from "./DisplayUtils.ts";
import { degToRad, Vector2 } from "./MathUtils.ts";

const _console = createConsole("DisplayManagerInterface", { log: false });

export interface DisplayManagerInterface {
  get isReady(): boolean;

  get contextState(): DisplayContextState;
  serializeContextState(): DisplayContextCommand[];

  parseContextCommands(dataView: DataView): Promise<void>;

  flushContextCommands(): Promise<void>;

  get brightness(): DisplayBrightness;
  setBrightness(
    newDisplayBrightness: DisplayBrightness,
    sendImmediately?: boolean,
  ): Promise<void>;

  show(
    sendImmediately?: boolean,
    waitUntilReady?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  clear(
    sendImmediately?: boolean,
    waitUntilReady?: boolean,
    isParsing?: boolean,
  ): Promise<void>;

  get colors(): string[];
  get numberOfColors(): number;
  setColor(
    colorIndex: number,
    color: DisplayColorRGBOrString,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  serializeColors(): DisplayContextCommand[];

  assertValidColorIndex(colorIndex: number): void;
  assertValidLineWidth(lineWidth: number): void;
  assertValidNumberOfColors(numberOfColors: number): void;
  assertValidBitmap(bitmap: DisplayBitmap, checkSize?: boolean): void;

  get opacities(): number[];
  setColorOpacity(
    colorIndex: number,
    opacity: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  setOpacity(
    opacity: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  serializeOpacities(): DisplayContextCommand[];

  saveContext(sendImmediately?: boolean, isParsing?: boolean): Promise<void>;
  restoreContext(sendImmediately?: boolean, isParsing?: boolean): Promise<void>;

  selectFillColor(
    fillColorIndex: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  selectBackgroundColor(
    backgroundColorIndex: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  selectLineColor(
    lineColorIndex: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  setLineWidth(
    lineWidth: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;

  setIgnoreFill(
    ignoreFill: boolean,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  setIgnoreLine(
    ignoreLine: boolean,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  setFillBackground(
    fillBackground: boolean,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;

  setAlignment(
    alignmentDirection: DisplayAlignmentDirection,
    alignment: DisplayAlignment,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  setHorizontalAlignment(
    horizontalAlignment: DisplayAlignment,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  setVerticalAlignment(
    verticalAlignment: DisplayAlignment,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  resetAlignment(sendImmediately?: boolean, isParsing?: boolean): Promise<void>;

  setRotation(
    rotation: number,
    isRadians?: boolean,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  clearRotation(sendImmediately?: boolean, isParsing?: boolean): Promise<void>;

  setSegmentStartCap(
    segmentStartCap: DisplaySegmentCap,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  setSegmentEndCap(
    segmentEndCap: DisplaySegmentCap,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  setSegmentCap(
    segmentCap: DisplaySegmentCap,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;

  setSegmentStartRadius(
    segmentStartRadius: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  setSegmentEndRadius(
    segmentEndRadius: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  setSegmentRadius(
    segmentRadius: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;

  setCrop(
    cropDirection: DisplayCropDirection,
    crop: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  setCropTop(
    cropTop: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  setCropRight(
    cropRight: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  setCropBottom(
    cropBottom: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  setCropLeft(
    cropLeft: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  clearCrop(sendImmediately?: boolean, isParsing?: boolean): Promise<void>;

  setRotationCrop(
    cropDirection: DisplayCropDirection,
    crop: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  setRotationCropTop(
    rotationCropTop: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  setRotationCropRight(
    rotationCropRight: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  setRotationCropBottom(
    rotationCropBottom: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  setRotationCropLeft(
    rotationCropLeft: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  clearRotationCrop(
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;

  selectBitmapColor(
    bitmapColorIndex: number,
    colorIndex: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;

  get bitmapColorIndices(): number[];
  get bitmapColors(): string[];
  selectBitmapColors(
    bitmapColorPairs: DisplayBitmapColorPair[],
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;

  setBitmapColor(
    bitmapColorIndex: number,
    color: DisplayColorRGBOrString,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  setBitmapColorOpacity(
    bitmapColorIndex: number,
    opacity: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;

  setBitmapScaleDirection(
    direction: DisplayScaleDirection,
    bitmapScale: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  setBitmapScaleX(
    bitmapScaleX: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  setBitmapScaleY(
    bitmapScaleY: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  setBitmapScale(
    bitmapScale: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  resetBitmapScale(
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;

  selectSpriteColor(
    spriteColorIndex: number,
    colorIndex: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;

  get spriteColorIndices(): number[];
  get spriteColors(): string[];
  selectSpriteColors(
    spriteColorPairs: DisplaySpriteColorPair[],
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  resetSpriteColors(
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;

  setSpriteColor(
    spriteColorIndex: number,
    color: DisplayColorRGBOrString,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  setSpriteColorOpacity(
    spriteColorIndex: number,
    opacity: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;

  setSpriteScaleDirection(
    direction: DisplayScaleDirection,
    spriteScale: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  setSpriteScaleX(
    spriteScaleX: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  setSpriteScaleY(
    spriteScaleY: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  setSpriteScale(
    spriteScale: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  resetSpriteScale(
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;

  setSpritesLineHeight(
    spritesLineHeight: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;

  setSpritesDirectionGeneric(
    direction: DisplayDirection,
    isOrthogonal: boolean,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  setSpritesDirection(
    spritesDirection: DisplayDirection,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  setSpritesLineDirection(
    spritesLineDirection: DisplayDirection,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;

  setSpritesSpacingGeneric(
    spacing: number,
    isOrthogonal: boolean,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  setSpritesSpacing(
    spritesSpacing: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  setSpritesLineSpacing(
    spritesSpacing: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;

  setSpritesAlignmentGeneric(
    alignment: DisplayAlignment,
    isOrthogonal: boolean,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  setSpritesAlignment(
    spritesAlignment: DisplayAlignment,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  setSpritesLineAlignment(
    spritesLineAlignment: DisplayAlignment,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;

  clearRect(
    x: number,
    y: number,
    width: number,
    height: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  drawRect(
    offsetX: number,
    offsetY: number,
    width: number,
    height: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  drawRoundRect(
    offsetX: number,
    offsetY: number,
    width: number,
    height: number,
    borderRadius: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  drawCircle(
    offsetX: number,
    offsetY: number,
    radius: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  drawEllipse(
    offsetX: number,
    offsetY: number,
    radiusX: number,
    radiusY: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  drawRegularPolygon(
    offsetX: number,
    offsetY: number,
    radius: number,
    numberOfSides: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  drawPolygon(
    points: Vector2[],
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;

  drawWireframe(
    wireframe: DisplayWireframe,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;

  drawCurve(
    curveType: DisplayBezierCurveType,
    controlPoints: Vector2[],
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  drawCurves(
    curveType: DisplayBezierCurveType,
    controlPoints: Vector2[],
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;

  drawQuadraticBezierCurve(
    controlPoints: Vector2[],
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  drawQuadraticBezierCurves(
    controlPoints: Vector2[],
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;

  drawCubicBezierCurve(
    controlPoints: Vector2[],
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  drawCubicBezierCurves(
    controlPoints: Vector2[],
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;

  _drawPath(
    isClosed: boolean,
    curves: DisplayBezierCurve[],
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  drawPath(
    curves: DisplayBezierCurve[],
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  drawClosedPath(
    curves: DisplayBezierCurve[],
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;

  drawSegment(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  drawSegments(
    points: Vector2[],
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;

  drawArc(
    offsetX: number,
    offsetY: number,
    radius: number,
    startAngle: number,
    angleOffset: number,
    isRadians?: boolean,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  drawArcEllipse(
    offsetX: number,
    offsetY: number,
    radiusX: number,
    radiusY: number,
    startAngle: number,
    angleOffset: number,
    isRadians?: boolean,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;

  drawBitmap(
    offsetX: number,
    offsetY: number,
    bitmap: DisplayBitmap,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;

  runContextCommand(
    command: DisplayContextCommand,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;

  runContextCommands(
    commands: DisplayContextCommand[],
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;

  imageToBitmap(
    image: HTMLImageElement,
    width: number,
    height: number,
    numberOfColors?: number,
  ): Promise<{
    blob: Blob;
    bitmap: DisplayBitmap;
  }>;
  quantizeImage(
    image: HTMLImageElement,
    width: number,
    height: number,
    numberOfColors: number,
    colors?: string[],
    canvas?: HTMLCanvasElement,
  ): Promise<{
    blob: Blob;
    colors: string[];
    colorIndices: number[];
  }>;
  resizeAndQuantizeImage(
    image: HTMLImageElement,
    width: number,
    height: number,
    numberOfColors: number,
    colors?: string[],
    canvas?: HTMLCanvasElement,
  ): Promise<{
    blob: Blob;
    colors: string[];
    colorIndices: number[];
  }>;

  uploadSpriteSheet(spriteSheet: DisplaySpriteSheet): Promise<void>;
  uploadSpriteSheets(spriteSheets: DisplaySpriteSheet[]): Promise<void>;
  selectSpriteSheet(
    spriteSheetName: string,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  drawSprite(
    offsetX: number,
    offsetY: number,
    spriteName: string,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  stringToSpriteLines(
    string: string,
    requireAll?: boolean,
    maxLineBreadth?: number,
    separators?: string[],
  ): DisplaySpriteLines;
  stringToSpriteLinesMetrics(
    string: string,
    requireAll?: boolean,
    maxLineBreadth?: number,
    separators?: string[],
  ): DisplaySpriteLinesMetrics;
  drawSprites(
    offsetX: number,
    offsetY: number,
    spriteLines: DisplaySpriteLines,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  drawSpritesString(
    offsetX: number,
    offsetY: number,
    string: string,
    requireAll?: boolean,
    maxLineBreadth?: number,
    separators?: string[],
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  assertLoadedSpriteSheet(spriteSheetName: string): void;
  assertSelectedSpriteSheet(spriteSheetName: string): void;
  assertAnySelectedSpriteSheet(): void;
  assertSprite(spriteName: string): void;
  getSprite(spriteName: string): DisplaySprite | undefined;
  getSpriteSheetPalette(
    paletteName: string,
  ): DisplaySpriteSheetPalette | undefined;
  getSpriteSheetPaletteSwap(
    paletteSwapName: string,
  ): DisplaySpriteSheetPaletteSwap | undefined;
  getSpritePaletteSwap(
    spriteName: string,
    paletteSwapName: string,
  ): DisplaySpritePaletteSwap | undefined;

  drawSpriteFromSpriteSheet(
    offsetX: number,
    offsetY: number,
    spriteName: string,
    spriteSheet: DisplaySpriteSheet,
    paletteName?: string,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;

  get selectedSpriteSheet(): DisplaySpriteSheet | undefined;
  get selectedSpriteSheetName(): string | undefined;

  spriteSheets: Record<string, DisplaySpriteSheet>;
  spriteSheetIndices: Record<string, number>;

  getSpriteSheetByIndex(index: number): DisplaySpriteSheet | undefined;

  assertSpriteSheetPalette(paletteName: string): void;
  assertSpriteSheetPaletteSwap(paletteSwapName: string): void;
  assertSpritePaletteSwap(spriteName: string, paletteSwapName: string): void;
  selectSpriteSheetPalette(
    paletteName: string,
    offset?: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  selectSpriteSheetPaletteSwap(
    paletteSwapName: string,
    offset?: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  selectSpritePaletteSwap(
    spriteName: string,
    paletteSwapName: string,
    offset?: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;

  serializeSpriteSheet(spriteSheet: DisplaySpriteSheet): ArrayBuffer;

  startSprite(
    offsetX: number,
    offsetY: number,
    width: number,
    height: number,
    sendImmediately?: boolean,
    isParsing?: boolean,
  ): Promise<void>;
  endSprite(sendImmediately?: boolean, isParsing?: boolean): Promise<void>;
  clearContext(sendImmediately?: boolean, isParsing?: boolean): Promise<void>;
}

export async function runDisplayContextCommand(
  displayManager: DisplayManagerInterface,
  command: DisplayContextCommand,
  sendImmediately?: boolean,
  isParsing?: boolean,
) {
  if (command.hide) {
    return;
  }
  switch (command.type) {
    case "show":
      await displayManager.show(sendImmediately, false, isParsing);
      break;
    case "clear":
      await displayManager.clear(sendImmediately, false, isParsing);
      break;
    case "saveContext":
      // await displayManager.saveContext(sendImmediately, isParsing);
      break;
    case "restoreContext":
      // await displayManager.restoreContext(sendImmediately, isParsing);
      break;
    case "clearRotation":
      await displayManager.clearRotation(sendImmediately, isParsing);
      break;
    case "clearCrop":
      await displayManager.clearCrop(sendImmediately, isParsing);
      break;
    case "clearRotationCrop":
      await displayManager.clearRotationCrop(sendImmediately, isParsing);
      break;
    case "resetBitmapScale":
      await displayManager.resetBitmapScale(sendImmediately, isParsing);
      break;
    case "resetSpriteScale":
      await displayManager.resetSpriteScale(sendImmediately, isParsing);
      break;
    case "setColor":
      {
        const { colorIndex, color } = command;
        await displayManager.setColor(
          colorIndex,
          color,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "setColorOpacity":
      {
        const { colorIndex, opacity } = command;
        await displayManager.setColorOpacity(
          colorIndex,
          opacity,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "setOpacity":
      {
        const { opacity } = command;
        await displayManager.setOpacity(opacity, sendImmediately, isParsing);
      }
      break;
    case "selectBackgroundColor":
      {
        const { backgroundColorIndex } = command;
        await displayManager.selectBackgroundColor(
          backgroundColorIndex,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "selectFillColor":
      {
        const { fillColorIndex } = command;
        await displayManager.selectFillColor(
          fillColorIndex,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "selectLineColor":
      {
        const { lineColorIndex } = command;
        await displayManager.selectLineColor(
          lineColorIndex,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "setIgnoreFill":
      {
        const { ignoreFill } = command;
        await displayManager.setIgnoreFill(
          ignoreFill,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "setIgnoreLine":
      {
        const { ignoreLine } = command;
        await displayManager.setIgnoreLine(
          ignoreLine,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "setFillBackground":
      {
        const { fillBackground } = command;
        await displayManager.setFillBackground(
          fillBackground,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "setLineWidth":
      {
        const { lineWidth } = command;
        await displayManager.setLineWidth(
          lineWidth,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "setRotation":
      {
        let { rotation, isRadians } = command;
        rotation = isRadians ? rotation : degToRad(rotation);
        rotation;
        await displayManager.setRotation(
          rotation,
          true,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "setSegmentStartCap":
      {
        const { segmentStartCap } = command;
        await displayManager.setSegmentStartCap(
          segmentStartCap,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "setSegmentEndCap":
      {
        const { segmentEndCap } = command;
        await displayManager.setSegmentEndCap(
          segmentEndCap,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "setSegmentCap":
      {
        const { segmentCap } = command;
        await displayManager.setSegmentCap(
          segmentCap,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "setSegmentStartRadius":
      {
        const { segmentStartRadius } = command;
        await displayManager.setSegmentStartRadius(
          segmentStartRadius,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "setSegmentEndRadius":
      {
        const { segmentEndRadius } = command;
        await displayManager.setSegmentEndRadius(
          segmentEndRadius,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "setSegmentRadius":
      {
        const { segmentRadius } = command;
        await displayManager.setSegmentRadius(
          segmentRadius,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "setHorizontalAlignment":
      {
        const { horizontalAlignment } = command;
        await displayManager.setHorizontalAlignment(
          horizontalAlignment,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "setVerticalAlignment":
      {
        const { verticalAlignment } = command;
        await displayManager.setVerticalAlignment(
          verticalAlignment,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "resetAlignment":
      {
        await displayManager.resetAlignment(sendImmediately, isParsing);
      }
      break;
    case "setCropTop":
      {
        const { cropTop } = command;
        await displayManager.setCropTop(cropTop, sendImmediately, isParsing);
      }
      break;
    case "setCropRight":
      {
        const { cropRight } = command;
        await displayManager.setCropRight(
          cropRight,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "setCropBottom":
      {
        const { cropBottom } = command;
        await displayManager.setCropBottom(
          cropBottom,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "setCropLeft":
      {
        const { cropLeft } = command;
        await displayManager.setCropLeft(cropLeft, sendImmediately, isParsing);
      }
      break;
    case "setRotationCropTop":
      {
        const { rotationCropTop } = command;
        await displayManager.setRotationCropTop(
          rotationCropTop,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "setRotationCropRight":
      {
        const { rotationCropRight } = command;
        await displayManager.setRotationCropRight(
          rotationCropRight,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "setRotationCropBottom":
      {
        const { rotationCropBottom } = command;
        await displayManager.setRotationCropBottom(
          rotationCropBottom,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "setRotationCropLeft":
      {
        const { rotationCropLeft } = command;
        await displayManager.setRotationCropLeft(
          rotationCropLeft,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "selectBitmapColor":
      {
        const { bitmapColorIndex, colorIndex } = command;
        await displayManager.selectBitmapColor(
          bitmapColorIndex,
          colorIndex,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "selectBitmapColors":
      {
        const { bitmapColorPairs } = command;
        await displayManager.selectBitmapColors(
          bitmapColorPairs,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "setBitmapScaleX":
      {
        const { bitmapScaleX } = command;
        await displayManager.setBitmapScaleX(
          bitmapScaleX,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "setBitmapScaleY":
      {
        const { bitmapScaleY } = command;
        await displayManager.setBitmapScaleY(
          bitmapScaleY,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "setBitmapScale":
      {
        const { bitmapScale } = command;
        await displayManager.setBitmapScale(
          bitmapScale,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "selectSpriteColor":
      {
        const { spriteColorIndex, colorIndex } = command;
        await displayManager.selectSpriteColor(
          spriteColorIndex,
          colorIndex,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "selectSpriteColors":
      {
        const { spriteColorPairs } = command;
        await displayManager.selectSpriteColors(
          spriteColorPairs,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "setSpriteScaleX":
      {
        const { spriteScaleX } = command;
        await displayManager.setSpriteScaleX(
          spriteScaleX,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "setSpriteScaleY":
      {
        const { spriteScaleY } = command;
        await displayManager.setSpriteScaleY(
          spriteScaleY,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "setSpriteScale":
      {
        const { spriteScale } = command;
        await displayManager.setSpriteScale(
          spriteScale,
          sendImmediately,
          isParsing,
        );
      }
      break;

    case "clearRect":
      {
        const { x, y, width, height } = command;
        await displayManager.clearRect(
          x,
          y,
          width,
          height,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "drawRect":
      {
        const { offsetX, offsetY, width, height } = command;
        await displayManager.drawRect(
          offsetX,
          offsetY,
          width,
          height,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "drawRoundRect":
      {
        const { offsetX, offsetY, width, height, borderRadius } = command;
        await displayManager.drawRoundRect(
          offsetX,
          offsetY,
          width,
          height,
          borderRadius,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "drawCircle":
      {
        const { offsetX, offsetY, radius } = command;
        await displayManager.drawCircle(
          offsetX,
          offsetY,
          radius,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "drawEllipse":
      {
        const { offsetX, offsetY, radiusX, radiusY } = command;
        await displayManager.drawEllipse(
          offsetX,
          offsetY,
          radiusX,
          radiusY,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "drawPolygon":
      {
        const { points } = command;
        await displayManager.drawPolygon(points, sendImmediately, isParsing);
      }
      break;
    case "drawRegularPolygon":
      {
        const { offsetX, offsetY, radius, numberOfSides } = command;
        await displayManager.drawRegularPolygon(
          offsetX,
          offsetY,
          radius,
          numberOfSides,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "drawWireframe":
      {
        const { wireframe } = command;
        await displayManager.drawWireframe(
          wireframe,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "drawSegment":
      {
        const { startX, startY, endX, endY } = command;
        await displayManager.drawSegment(
          startX,
          startY,
          endX,
          endY,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "drawSegments":
      {
        const { points } = command;
        await displayManager.drawSegments(
          points.map(({ x, y }) => ({ x: x, y: y })),
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "drawArc":
      {
        let { offsetX, offsetY, radius, startAngle, angleOffset, isRadians } =
          command;
        startAngle = isRadians ? startAngle : degToRad(startAngle);
        angleOffset = isRadians ? angleOffset : degToRad(angleOffset);

        await displayManager.drawArc(
          offsetX,
          offsetY,
          radius,
          startAngle,
          angleOffset,
          true,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "drawArcEllipse":
      {
        let {
          offsetX,
          offsetY,
          radiusX,
          radiusY,
          startAngle,
          angleOffset,
          isRadians,
        } = command;
        startAngle = isRadians ? startAngle : degToRad(startAngle);
        angleOffset = isRadians ? angleOffset : degToRad(angleOffset);

        await displayManager.drawArcEllipse(
          offsetX,
          offsetY,
          radiusX,
          radiusY,
          startAngle,
          angleOffset,
          true,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "drawBitmap":
      {
        const { offsetX, offsetY, bitmap } = command;
        await displayManager.drawBitmap(
          offsetX,
          offsetY,
          bitmap,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "drawSprite":
      {
        const { offsetX, offsetY, spriteIndex } = command;
        const spriteName =
          displayManager.selectedSpriteSheet?.sprites[spriteIndex].name!;
        await displayManager.drawSprite(
          offsetX,
          offsetY,
          spriteName,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "setSpritesLineHeight":
      {
        const { spritesLineHeight } = command;
        await displayManager.setSpritesLineHeight(
          spritesLineHeight,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "setSpritesSpacing":
      {
        const { spritesSpacing } = command;
        await displayManager.setSpritesSpacing(
          spritesSpacing,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "setSpritesAlignment":
      {
        const { spritesAlignment } = command;
        await displayManager.setSpritesAlignment(
          spritesAlignment,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "setSpritesDirection":
      {
        const { spritesDirection } = command;
        await displayManager.setSpritesDirection(
          spritesDirection,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "setSpritesLineAlignment":
      {
        const { spritesLineAlignment } = command;
        await displayManager.setSpritesLineAlignment(
          spritesLineAlignment,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "setSpritesLineDirection":
      {
        const { spritesLineDirection } = command;
        await displayManager.setSpritesLineDirection(
          spritesLineDirection,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "setSpritesLineSpacing":
      {
        const { spritesLineSpacing } = command;
        await displayManager.setSpritesLineSpacing(
          spritesLineSpacing,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "drawSprites":
      {
        const { offsetX, offsetY, spriteSerializedLines } = command;
        //_console.log({ offsetX, offsetY, spriteSerializedLines });
        const spriteLines: DisplaySpriteLines = [];
        spriteSerializedLines.forEach((spriteSerializedLine) => {
          const spriteLine: DisplaySpriteLine = [];
          spriteSerializedLine.forEach((spriteSerializedSubLine) => {
            const { spriteIndices, spriteSheetIndex } = spriteSerializedSubLine;
            // _console.log(
            //   { spriteIndices, spriteSheetIndex },
            //   displayManager.spriteSheetIndices
            // );
            const spriteSheetName = Object.entries(
              displayManager.spriteSheetIndices,
            ).find(([_spriteSheetName, _spriteSheetIndex]) => {
              return _spriteSheetIndex == spriteSheetIndex;
            })![0];
            //_console.log({ spriteSheetName });
            const spriteSheet = displayManager.spriteSheets[spriteSheetName];
            const spriteSubLine: DisplaySpriteSubLine = {
              spriteSheetName: spriteSheet.name,
              spriteNames: spriteIndices.map(
                (spriteIndex) => spriteSheet.sprites[spriteIndex].name,
              ),
            };
            spriteLine.push(spriteSubLine);
          });
          spriteLines.push(spriteLine);
        });
        //_console.log({ spriteLines });
        await displayManager.drawSprites(
          offsetX,
          offsetY,
          spriteLines,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "selectSpriteSheet":
      {
        const { spriteSheetIndex } = command;
        const spriteSheetName = Object.entries(
          displayManager.spriteSheetIndices,
        ).find((entry) => entry[1] == spriteSheetIndex)?.[0];
        await displayManager.selectSpriteSheet(
          spriteSheetName!,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "resetSpriteColors":
      await displayManager.resetSpriteColors(sendImmediately, isParsing);
      break;

    case "drawQuadraticBezierCurve":
      {
        const { controlPoints } = command;
        await displayManager.drawQuadraticBezierCurve(
          controlPoints,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "drawQuadraticBezierCurves":
      {
        const { controlPoints } = command;
        await displayManager.drawQuadraticBezierCurves(
          controlPoints,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "drawCubicBezierCurve":
      {
        const { controlPoints } = command;
        await displayManager.drawCubicBezierCurve(
          controlPoints,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "drawCubicBezierCurves":
      {
        const { controlPoints } = command;
        await displayManager.drawCubicBezierCurves(
          controlPoints,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "drawClosedPath":
      {
        const { curves } = command;
        await displayManager.drawClosedPath(curves, sendImmediately, isParsing);
      }
      break;
    case "drawPath":
      {
        const { curves } = command;
        await displayManager.drawPath(curves, sendImmediately, isParsing);
      }
      break;
    case "startSprite":
      {
        const { offsetX, offsetY, width, height } = command;
        await displayManager.startSprite(
          offsetX,
          offsetY,
          width,
          height,
          sendImmediately,
          isParsing,
        );
      }
      break;
    case "endSprite":
      await displayManager.endSprite(sendImmediately, isParsing);
      break;
    case "clearContext":
      await displayManager.clearContext(sendImmediately, isParsing);
      break;
  }
}

export async function runDisplayContextCommands(
  displayManager: DisplayManagerInterface,
  commands: DisplayContextCommand[],
  sendImmediately?: boolean,
  isParsing?: boolean,
) {
  _console.log("runDisplayContextCommands", commands, {
    sendImmediately,
  });

  commands = commands.filter((command) => !command.hide);

  for (let command of commands) {
    await runDisplayContextCommand(displayManager, command, false, isParsing);
  }
  if (sendImmediately) {
    await displayManager.flushContextCommands();
  }
}

export function assertLoadedSpriteSheet(
  displayManager: DisplayManagerInterface,
  spriteSheetName: string,
) {
  _console.assertWithError(
    displayManager.spriteSheets[spriteSheetName],
    `spriteSheet "${spriteSheetName}" not loaded`,
  );
}
export function assertSelectedSpriteSheet(
  displayManager: DisplayManagerInterface,
  spriteSheetName: string,
) {
  displayManager.assertLoadedSpriteSheet(spriteSheetName);
  _console.assertWithError(
    displayManager.selectedSpriteSheetName == spriteSheetName,
    `spriteSheet "${spriteSheetName}" not selected`,
  );
}
export function assertAnySelectedSpriteSheet(
  displayManager: DisplayManagerInterface,
) {
  _console.assertWithError(
    displayManager.selectedSpriteSheet,
    "no spriteSheet selected",
  );
}
export function getSprite(
  displayManager: DisplayManagerInterface,
  spriteName: string,
): DisplaySprite | undefined {
  displayManager.assertAnySelectedSpriteSheet();
  return displayManager.selectedSpriteSheet!.sprites.find(
    (sprite) => sprite.name == spriteName,
  );
}
export function assertSprite(
  displayManager: DisplayManagerInterface,
  spriteName: string,
) {
  displayManager.assertAnySelectedSpriteSheet();
  const sprite = displayManager.getSprite(spriteName);
  _console.assertWithError(sprite, `no sprite found with name "${spriteName}"`);
}
export function getSpriteSheetPalette(
  displayManager: DisplayManagerInterface,
  paletteName: string,
): DisplaySpriteSheetPalette | undefined {
  return displayManager.selectedSpriteSheet?.palettes?.find(
    (palette) => palette.name == paletteName,
  );
}
export function getSpriteSheetPaletteSwap(
  displayManager: DisplayManagerInterface,
  paletteSwapName: string,
): DisplaySpriteSheetPaletteSwap | undefined {
  return displayManager.selectedSpriteSheet?.paletteSwaps?.find(
    (paletteSwap) => paletteSwap.name == paletteSwapName,
  );
}
export function getSpritePaletteSwap(
  displayManager: DisplayManagerInterface,
  spriteName: string,
  paletteSwapName: string,
): DisplaySpritePaletteSwap | undefined {
  return displayManager
    .getSprite(spriteName)
    ?.paletteSwaps?.find((paletteSwap) => paletteSwap.name == paletteSwapName);
}

export function assertSpriteSheetPalette(
  displayManagerInterface: DisplayManagerInterface,
  paletteName: string,
) {
  const spriteSheetPalette =
    displayManagerInterface.getSpriteSheetPalette(paletteName);
  _console.assertWithError(
    spriteSheetPalette,
    `no spriteSheetPalette found with name "${paletteName}"`,
  );
}
export function assertSpriteSheetPaletteSwap(
  displayManagerInterface: DisplayManagerInterface,
  paletteSwapName: string,
) {
  const spriteSheetPaletteSwap =
    displayManagerInterface.getSpriteSheetPaletteSwap(paletteSwapName);
  _console.assertWithError(
    spriteSheetPaletteSwap,
    `no paletteSwapName found with name "${paletteSwapName}"`,
  );
}
export function assertSpritePaletteSwap(
  displayManagerInterface: DisplayManagerInterface,
  spriteName: string,
  paletteSwapName: string,
) {
  const spritePaletteSwap = displayManagerInterface.getSpritePaletteSwap(
    spriteName,
    paletteSwapName,
  );
  _console.assertWithError(
    spritePaletteSwap,
    `no spritePaletteSwap found for sprite "${spriteName}" name "${paletteSwapName}"`,
  );
}
export async function selectSpriteSheetPalette(
  displayManagerInterface: DisplayManagerInterface,
  paletteName: string,
  offset?: number,
  indicesOnly?: boolean,
  sendImmediately?: boolean,
  isParsing?: boolean,
) {
  offset = offset || 0;

  displayManagerInterface.assertAnySelectedSpriteSheet();
  displayManagerInterface.assertSpriteSheetPalette(paletteName);
  const palette = displayManagerInterface.getSpriteSheetPalette(paletteName)!;

  _console.assertWithError(
    palette.numberOfColors + offset <= displayManagerInterface.numberOfColors,
    `invalid offset ${offset} and palette.numberOfColors ${palette.numberOfColors} (max ${displayManagerInterface.numberOfColors})`,
  );

  //_console.log({ indicesOnly });
  for (let index = 0; index < palette.numberOfColors; index++) {
    if (!indicesOnly) {
      const color = palette.colors[index];
      let opacity = palette.opacities?.[index];
      if (opacity == undefined) {
        opacity = 1;
      }
      //_console.log({ index, offset, color });
      displayManagerInterface.setColor(index + offset, color, false, isParsing);
      displayManagerInterface.setColorOpacity(
        index + offset,
        opacity,
        false,
        isParsing,
      );
    }
    displayManagerInterface.selectSpriteColor(
      index,
      index + offset,
      false,
      isParsing,
    );
  }

  if (sendImmediately) {
    displayManagerInterface.flushContextCommands();
  }
}
export async function selectSpriteSheetPaletteSwap(
  displayManagerInterface: DisplayManagerInterface,
  paletteSwapName: string,
  offset?: number,
  sendImmediately?: boolean,
  isParsing?: boolean,
) {
  offset = offset || 0;
  displayManagerInterface.assertAnySelectedSpriteSheet();
  displayManagerInterface.assertSpriteSheetPaletteSwap(paletteSwapName);

  const paletteSwap =
    displayManagerInterface.getSpriteSheetPaletteSwap(paletteSwapName)!;

  const spriteColorPairs: DisplaySpriteColorPair[] = [];
  for (
    let spriteColorIndex = 0;
    spriteColorIndex < paletteSwap.numberOfColors;
    spriteColorIndex++
  ) {
    const colorIndex = paletteSwap.spriteColorIndices[spriteColorIndex];
    spriteColorPairs.push({
      spriteColorIndex: spriteColorIndex + offset,
      colorIndex,
    });
  }
  displayManagerInterface.selectSpriteColors(
    spriteColorPairs,
    false,
    isParsing,
  );

  if (sendImmediately) {
    displayManagerInterface.flushContextCommands();
  }
}
export async function selectSpritePaletteSwap(
  displayManagerInterface: DisplayManagerInterface,
  spriteName: string,
  paletteSwapName: string,
  offset?: number,
  sendImmediately?: boolean,
  isParsing?: boolean,
) {
  offset = offset || 0;
  displayManagerInterface.assertAnySelectedSpriteSheet();

  const paletteSwap = displayManagerInterface.getSpritePaletteSwap(
    spriteName,
    paletteSwapName,
  )!;

  const spriteColorPairs: DisplaySpriteColorPair[] = [];
  for (
    let spriteColorIndex = 0;
    spriteColorIndex < paletteSwap.numberOfColors;
    spriteColorIndex++
  ) {
    const colorIndex = paletteSwap.spriteColorIndices[spriteColorIndex];
    spriteColorPairs.push({
      spriteColorIndex: spriteColorIndex + offset,
      colorIndex,
    });
  }
  displayManagerInterface.selectSpriteColors(
    spriteColorPairs,
    false,
    isParsing,
  );

  if (sendImmediately) {
    displayManagerInterface.flushContextCommands();
  }
}

export async function drawSpriteFromSpriteSheet(
  displayManagerInterface: DisplayManagerInterface,
  offsetX: number,
  offsetY: number,
  spriteName: string,
  spriteSheet: DisplaySpriteSheet,
  paletteName?: string,
  sendImmediately?: boolean,
  isParsing?: boolean,
) {
  const reducedSpriteSheet = reduceSpriteSheet(spriteSheet, [spriteName]);
  await displayManagerInterface.uploadSpriteSheet(reducedSpriteSheet);
  await displayManagerInterface.selectSpriteSheet(spriteSheet.name);
  await displayManagerInterface.drawSprite(offsetX, offsetY, spriteName, false);
  if (paletteName != undefined) {
    await displayManagerInterface.selectSpriteSheetPalette(
      paletteName,
      undefined,
      false,
      isParsing,
    );
  }
  if (sendImmediately) {
    await displayManagerInterface.flushContextCommands();
  }
}

export function getSpriteSheetByIndex(
  displayManagerInterface: DisplayManagerInterface,
  index: number,
) {
  for (const [spriteSheetName, _index] of Object.entries(
    displayManagerInterface.spriteSheetIndices,
  )) {
    if (_index == index) {
      return displayManagerInterface.spriteSheets[spriteSheetName];
    }
  }
}

export function serializeColors(
  displayManager: DisplayManagerInterface,
  other?: string[],
): DisplayContextCommand[] {
  other = other ?? new Array(displayManager.numberOfColors).fill("#000000");
  const commands: DisplayContextCommand[] = [];
  displayManager.colors.forEach((color, colorIndex) => {
    if (color != other[colorIndex]) {
      commands.push({ type: "setColor", colorIndex, color });
    }
  });
  return commands;
}
export function serializeOpacities(
  displayManager: DisplayManagerInterface,
  other?: number[],
): DisplayContextCommand[] {
  other = other ?? new Array(displayManager.numberOfColors).fill(1);
  const commands: DisplayContextCommand[] = [];
  displayManager.opacities.forEach((opacity, colorIndex) => {
    if (opacity != other[colorIndex]) {
      commands.push({ type: "setColorOpacity", colorIndex, opacity });
    }
  });
  return commands;
}
