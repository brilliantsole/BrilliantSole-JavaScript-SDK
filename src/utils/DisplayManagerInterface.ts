import DisplayManager, {
  DisplayBitmapColorPair,
  DisplayBrightness,
  DisplaySpriteColorPair,
  DisplayBitmap,
  DisplayBezierCurve,
  DisplayBezierCurveType,
  DisplayWireframe,
} from "../DisplayManager.ts";
import { createConsole } from "./Console.ts";
import DisplayCanvasHelper from "./DisplayCanvasHelper.ts";
import { DisplayContextCommand } from "./DisplayContextCommand.ts";
import {
  DisplayAlignment,
  DisplayAlignmentDirection,
  DisplayContextState,
  DisplayDirection,
  DisplaySegmentCap,
  PartialDisplayContextState,
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
  serializeContextState(
    other?: PartialDisplayContextState,
  ): DisplayContextCommand[];

  setContextState(
    newState: PartialDisplayContextState,
    sendImmediately?: boolean,
  ): Promise<void>;

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
    isSending?: boolean,
  ): Promise<void>;
  clear(
    sendImmediately?: boolean,
    waitUntilReady?: boolean,
    isSending?: boolean,
  ): Promise<void>;

  get colors(): string[];
  get numberOfColors(): number;
  setColor(
    colorIndex: number,
    color: DisplayColorRGBOrString,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  serializeColors(other?: string[]): DisplayContextCommand[];

  assertValidColorIndex(colorIndex: number): void;
  assertValidLineWidth(lineWidth: number): void;
  assertValidNumberOfColors(numberOfColors: number): void;
  assertValidBitmap(bitmap: DisplayBitmap, checkSize?: boolean): void;

  get opacities(): number[];
  setColorOpacity(
    colorIndex: number,
    opacity: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  setOpacity(
    opacity: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  serializeOpacities(other?: number[]): DisplayContextCommand[];

  saveContext(sendImmediately?: boolean, isSending?: boolean): Promise<void>;
  restoreContext(sendImmediately?: boolean, isSending?: boolean): Promise<void>;

  selectFillColor(
    fillColorIndex: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  selectBackgroundColor(
    backgroundColorIndex: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  selectLineColor(
    lineColorIndex: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  setLineWidth(
    lineWidth: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;

  setIgnoreFill(
    ignoreFill: boolean,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  setIgnoreLine(
    ignoreLine: boolean,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  setFillBackground(
    fillBackground: boolean,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;

  setAlignment(
    alignmentDirection: DisplayAlignmentDirection,
    alignment: DisplayAlignment,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  setHorizontalAlignment(
    horizontalAlignment: DisplayAlignment,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  setVerticalAlignment(
    verticalAlignment: DisplayAlignment,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  resetAlignment(sendImmediately?: boolean, isSending?: boolean): Promise<void>;

  setRotation(
    rotation: number,
    isRadians?: boolean,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  clearRotation(sendImmediately?: boolean, isSending?: boolean): Promise<void>;

  setSegmentStartCap(
    segmentStartCap: DisplaySegmentCap,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  setSegmentEndCap(
    segmentEndCap: DisplaySegmentCap,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  setSegmentCap(
    segmentCap: DisplaySegmentCap,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;

  setSegmentStartRadius(
    segmentStartRadius: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  setSegmentEndRadius(
    segmentEndRadius: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  setSegmentRadius(
    segmentRadius: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;

  setCrop(
    cropDirection: DisplayCropDirection,
    crop: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  setCropTop(
    cropTop: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  setCropRight(
    cropRight: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  setCropBottom(
    cropBottom: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  setCropLeft(
    cropLeft: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  clearCrop(sendImmediately?: boolean, isSending?: boolean): Promise<void>;

  setRotationCrop(
    cropDirection: DisplayCropDirection,
    crop: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  setRotationCropTop(
    rotationCropTop: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  setRotationCropRight(
    rotationCropRight: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  setRotationCropBottom(
    rotationCropBottom: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  setRotationCropLeft(
    rotationCropLeft: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  clearRotationCrop(
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;

  selectBitmapColor(
    bitmapColorIndex: number,
    colorIndex: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;

  get bitmapColorIndices(): number[];
  get bitmapColors(): string[];
  selectBitmapColors(
    bitmapColorPairs: DisplayBitmapColorPair[],
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;

  setBitmapColor(
    bitmapColorIndex: number,
    color: DisplayColorRGBOrString,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  setBitmapColorOpacity(
    bitmapColorIndex: number,
    opacity: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;

  setBitmapScaleDirection(
    direction: DisplayScaleDirection,
    bitmapScale: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  setBitmapScaleX(
    bitmapScaleX: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  setBitmapScaleY(
    bitmapScaleY: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  setBitmapScale(
    bitmapScale: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  resetBitmapScale(
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;

  selectSpriteColor(
    spriteColorIndex: number,
    colorIndex: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;

  get spriteColorIndices(): number[];
  get spriteColors(): string[];
  selectSpriteColors(
    spriteColorPairs: DisplaySpriteColorPair[],
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  resetSpriteColors(
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;

  setSpriteColor(
    spriteColorIndex: number,
    color: DisplayColorRGBOrString,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  setSpriteColorOpacity(
    spriteColorIndex: number,
    opacity: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;

  setSpriteScaleDirection(
    direction: DisplayScaleDirection,
    spriteScale: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  setSpriteScaleX(
    spriteScaleX: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  setSpriteScaleY(
    spriteScaleY: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  setSpriteScale(
    spriteScale: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  resetSpriteScale(
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;

  setSpritesLineHeight(
    spritesLineHeight: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;

  setSpritesDirectionGeneric(
    direction: DisplayDirection,
    isOrthogonal: boolean,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  setSpritesDirection(
    spritesDirection: DisplayDirection,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  setSpritesLineDirection(
    spritesLineDirection: DisplayDirection,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;

  setSpritesSpacingGeneric(
    spacing: number,
    isOrthogonal: boolean,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  setSpritesSpacing(
    spritesSpacing: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  setSpritesLineSpacing(
    spritesSpacing: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;

  setSpritesAlignmentGeneric(
    alignment: DisplayAlignment,
    isOrthogonal: boolean,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  setSpritesAlignment(
    spritesAlignment: DisplayAlignment,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  setSpritesLineAlignment(
    spritesLineAlignment: DisplayAlignment,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;

  clearRect(
    x: number,
    y: number,
    width: number,
    height: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  drawRect(
    offsetX: number,
    offsetY: number,
    width: number,
    height: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  drawRoundRect(
    offsetX: number,
    offsetY: number,
    width: number,
    height: number,
    borderRadius: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  drawCircle(
    offsetX: number,
    offsetY: number,
    radius: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  drawEllipse(
    offsetX: number,
    offsetY: number,
    radiusX: number,
    radiusY: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  drawRegularPolygon(
    offsetX: number,
    offsetY: number,
    radius: number,
    numberOfSides: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  drawPolygon(
    points: Vector2[],
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;

  drawWireframe(
    wireframe: DisplayWireframe,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;

  drawCurve(
    curveType: DisplayBezierCurveType,
    controlPoints: Vector2[],
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  drawCurves(
    curveType: DisplayBezierCurveType,
    controlPoints: Vector2[],
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;

  drawQuadraticBezierCurve(
    controlPoints: Vector2[],
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  drawQuadraticBezierCurves(
    controlPoints: Vector2[],
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;

  drawCubicBezierCurve(
    controlPoints: Vector2[],
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  drawCubicBezierCurves(
    controlPoints: Vector2[],
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;

  _drawPath(
    isClosed: boolean,
    curves: DisplayBezierCurve[],
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  drawPath(
    curves: DisplayBezierCurve[],
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  drawClosedPath(
    curves: DisplayBezierCurve[],
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;

  drawSegment(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  drawSegments(
    points: Vector2[],
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;

  drawArc(
    offsetX: number,
    offsetY: number,
    radius: number,
    startAngle: number,
    angleOffset: number,
    isRadians?: boolean,
    sendImmediately?: boolean,
    isSending?: boolean,
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
    isSending?: boolean,
  ): Promise<void>;

  drawBitmap(
    offsetX: number,
    offsetY: number,
    bitmap: DisplayBitmap,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;

  runContextCommand(
    command: DisplayContextCommand,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;

  runContextCommands(
    commands: DisplayContextCommand[],
    sendImmediately?: boolean,
    isSending?: boolean,
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
    isSending?: boolean,
  ): Promise<void>;
  drawSprite(
    offsetX: number,
    offsetY: number,
    spriteName: string,
    sendImmediately?: boolean,
    isSending?: boolean,
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
    isSending?: boolean,
  ): Promise<void>;
  drawSpritesString(
    offsetX: number,
    offsetY: number,
    string: string,
    requireAll?: boolean,
    maxLineBreadth?: number,
    separators?: string[],
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  assertLoadedSpriteSheet(spriteSheetName: string): void;
  assertSelectedSpriteSheet(spriteSheetName: string, isSending?: boolean): void;
  assertAnySelectedSpriteSheet(isSending?: boolean): void;
  assertSprite(spriteName: string, isSending?: boolean): void;
  getSprite(spriteName: string, isSending?: boolean): DisplaySprite | undefined;
  getSpriteSheetPalette(
    paletteName: string,
    isSending?: boolean,
  ): DisplaySpriteSheetPalette | undefined;
  getSpriteSheetPaletteSwap(
    paletteSwapName: string,
    isSending?: boolean,
  ): DisplaySpriteSheetPaletteSwap | undefined;
  getSpritePaletteSwap(
    spriteName: string,
    paletteSwapName: string,
    isSending?: boolean,
  ): DisplaySpritePaletteSwap | undefined;

  drawSpriteFromSpriteSheet(
    offsetX: number,
    offsetY: number,
    spriteName: string,
    spriteSheet: DisplaySpriteSheet,
    paletteName?: string,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;

  getSelectedSpriteSheet(isSending?: boolean): DisplaySpriteSheet | undefined;
  getSelectedSpriteSheetIndex(isSending?: boolean): number | undefined;
  getSelectedSpriteSheetName(isSending?: boolean): string | undefined;

  spriteSheets: Record<string, DisplaySpriteSheet>;
  spriteSheetIndices: Record<string, number>;

  getSpriteSheetByIndex(index: number): DisplaySpriteSheet | undefined;

  assertSpriteSheetPalette(paletteName: string, isSending?: boolean): void;
  assertSpriteSheetPaletteSwap(
    paletteSwapName: string,
    isSending?: boolean,
  ): void;
  assertSpritePaletteSwap(
    spriteName: string,
    paletteSwapName: string,
    isSending?: boolean,
  ): void;
  selectSpriteSheetPalette(
    paletteName: string,
    offset?: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  selectSpriteSheetPaletteSwap(
    paletteSwapName: string,
    offset?: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  selectSpritePaletteSwap(
    spriteName: string,
    paletteSwapName: string,
    offset?: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;

  serializeSpriteSheet(
    spriteSheet: DisplaySpriteSheet,
    includeHeader?: boolean,
  ): ArrayBuffer;
  parseSpriteSheet(
    dataView: DataView<ArrayBuffer>,
    name?: string,
    includesHeader?: boolean,
  ): DisplaySpriteSheet;

  startSprite(
    offsetX: number,
    offsetY: number,
    width: number,
    height: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ): Promise<void>;
  endSprite(sendImmediately?: boolean, isSending?: boolean): Promise<void>;
  clearContext(sendImmediately?: boolean, isSending?: boolean): Promise<void>;
}

export async function runDisplayContextCommand(
  displayManager: DisplayManagerInterface,
  command: DisplayContextCommand,
  sendImmediately?: boolean,
  isSending?: boolean,
) {
  _console.log("runDisplayContextCommand", command, {
    sendImmediately,
    isSending,
  });
  if (command.hide) {
    return;
  }
  switch (command.type) {
    case "show":
      await displayManager.show(sendImmediately, false, isSending);
      break;
    case "clear":
      await displayManager.clear(sendImmediately, false, isSending);
      break;
    case "saveContext":
      // await displayManager.saveContext(sendImmediately, isSending);
      break;
    case "restoreContext":
      // await displayManager.restoreContext(sendImmediately, isSending);
      break;
    case "clearRotation":
      await displayManager.clearRotation(sendImmediately, isSending);
      break;
    case "clearCrop":
      await displayManager.clearCrop(sendImmediately, isSending);
      break;
    case "clearRotationCrop":
      await displayManager.clearRotationCrop(sendImmediately, isSending);
      break;
    case "resetBitmapScale":
      await displayManager.resetBitmapScale(sendImmediately, isSending);
      break;
    case "resetSpriteScale":
      await displayManager.resetSpriteScale(sendImmediately, isSending);
      break;
    case "setColor":
      {
        const { colorIndex, color } = command;
        await displayManager.setColor(
          colorIndex,
          color,
          sendImmediately,
          isSending,
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
          isSending,
        );
      }
      break;
    case "setOpacity":
      {
        const { opacity } = command;
        await displayManager.setOpacity(opacity, sendImmediately, isSending);
      }
      break;
    case "selectBackgroundColor":
      {
        const { backgroundColorIndex } = command;
        await displayManager.selectBackgroundColor(
          backgroundColorIndex,
          sendImmediately,
          isSending,
        );
      }
      break;
    case "selectFillColor":
      {
        const { fillColorIndex } = command;
        await displayManager.selectFillColor(
          fillColorIndex,
          sendImmediately,
          isSending,
        );
      }
      break;
    case "selectLineColor":
      {
        const { lineColorIndex } = command;
        await displayManager.selectLineColor(
          lineColorIndex,
          sendImmediately,
          isSending,
        );
      }
      break;
    case "setIgnoreFill":
      {
        const { ignoreFill } = command;
        await displayManager.setIgnoreFill(
          ignoreFill,
          sendImmediately,
          isSending,
        );
      }
      break;
    case "setIgnoreLine":
      {
        const { ignoreLine } = command;
        await displayManager.setIgnoreLine(
          ignoreLine,
          sendImmediately,
          isSending,
        );
      }
      break;
    case "setFillBackground":
      {
        const { fillBackground } = command;
        await displayManager.setFillBackground(
          fillBackground,
          sendImmediately,
          isSending,
        );
      }
      break;
    case "setLineWidth":
      {
        const { lineWidth } = command;
        await displayManager.setLineWidth(
          lineWidth,
          sendImmediately,
          isSending,
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
          isSending,
        );
      }
      break;
    case "setSegmentStartCap":
      {
        const { segmentStartCap } = command;
        await displayManager.setSegmentStartCap(
          segmentStartCap,
          sendImmediately,
          isSending,
        );
      }
      break;
    case "setSegmentEndCap":
      {
        const { segmentEndCap } = command;
        await displayManager.setSegmentEndCap(
          segmentEndCap,
          sendImmediately,
          isSending,
        );
      }
      break;
    case "setSegmentCap":
      {
        const { segmentCap } = command;
        await displayManager.setSegmentCap(
          segmentCap,
          sendImmediately,
          isSending,
        );
      }
      break;
    case "setSegmentStartRadius":
      {
        const { segmentStartRadius } = command;
        await displayManager.setSegmentStartRadius(
          segmentStartRadius,
          sendImmediately,
          isSending,
        );
      }
      break;
    case "setSegmentEndRadius":
      {
        const { segmentEndRadius } = command;
        await displayManager.setSegmentEndRadius(
          segmentEndRadius,
          sendImmediately,
          isSending,
        );
      }
      break;
    case "setSegmentRadius":
      {
        const { segmentRadius } = command;
        await displayManager.setSegmentRadius(
          segmentRadius,
          sendImmediately,
          isSending,
        );
      }
      break;
    case "setHorizontalAlignment":
      {
        const { horizontalAlignment } = command;
        await displayManager.setHorizontalAlignment(
          horizontalAlignment,
          sendImmediately,
          isSending,
        );
      }
      break;
    case "setVerticalAlignment":
      {
        const { verticalAlignment } = command;
        await displayManager.setVerticalAlignment(
          verticalAlignment,
          sendImmediately,
          isSending,
        );
      }
      break;
    case "resetAlignment":
      {
        await displayManager.resetAlignment(sendImmediately, isSending);
      }
      break;
    case "setCropTop":
      {
        const { cropTop } = command;
        await displayManager.setCropTop(cropTop, sendImmediately, isSending);
      }
      break;
    case "setCropRight":
      {
        const { cropRight } = command;
        await displayManager.setCropRight(
          cropRight,
          sendImmediately,
          isSending,
        );
      }
      break;
    case "setCropBottom":
      {
        const { cropBottom } = command;
        await displayManager.setCropBottom(
          cropBottom,
          sendImmediately,
          isSending,
        );
      }
      break;
    case "setCropLeft":
      {
        const { cropLeft } = command;
        await displayManager.setCropLeft(cropLeft, sendImmediately, isSending);
      }
      break;
    case "setRotationCropTop":
      {
        const { rotationCropTop } = command;
        await displayManager.setRotationCropTop(
          rotationCropTop,
          sendImmediately,
          isSending,
        );
      }
      break;
    case "setRotationCropRight":
      {
        const { rotationCropRight } = command;
        await displayManager.setRotationCropRight(
          rotationCropRight,
          sendImmediately,
          isSending,
        );
      }
      break;
    case "setRotationCropBottom":
      {
        const { rotationCropBottom } = command;
        await displayManager.setRotationCropBottom(
          rotationCropBottom,
          sendImmediately,
          isSending,
        );
      }
      break;
    case "setRotationCropLeft":
      {
        const { rotationCropLeft } = command;
        await displayManager.setRotationCropLeft(
          rotationCropLeft,
          sendImmediately,
          isSending,
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
          isSending,
        );
      }
      break;
    case "selectBitmapColors":
      {
        const { bitmapColorPairs } = command;
        await displayManager.selectBitmapColors(
          bitmapColorPairs,
          sendImmediately,
          isSending,
        );
      }
      break;
    case "setBitmapScaleX":
      {
        const { bitmapScaleX } = command;
        await displayManager.setBitmapScaleX(
          bitmapScaleX,
          sendImmediately,
          isSending,
        );
      }
      break;
    case "setBitmapScaleY":
      {
        const { bitmapScaleY } = command;
        await displayManager.setBitmapScaleY(
          bitmapScaleY,
          sendImmediately,
          isSending,
        );
      }
      break;
    case "setBitmapScale":
      {
        const { bitmapScale } = command;
        await displayManager.setBitmapScale(
          bitmapScale,
          sendImmediately,
          isSending,
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
          isSending,
        );
      }
      break;
    case "selectSpriteColors":
      {
        const { spriteColorPairs } = command;
        await displayManager.selectSpriteColors(
          spriteColorPairs,
          sendImmediately,
          isSending,
        );
      }
      break;
    case "setSpriteScaleX":
      {
        const { spriteScaleX } = command;
        await displayManager.setSpriteScaleX(
          spriteScaleX,
          sendImmediately,
          isSending,
        );
      }
      break;
    case "setSpriteScaleY":
      {
        const { spriteScaleY } = command;
        await displayManager.setSpriteScaleY(
          spriteScaleY,
          sendImmediately,
          isSending,
        );
      }
      break;
    case "setSpriteScale":
      {
        const { spriteScale } = command;
        await displayManager.setSpriteScale(
          spriteScale,
          sendImmediately,
          isSending,
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
          isSending,
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
          isSending,
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
          isSending,
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
          isSending,
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
          isSending,
        );
      }
      break;
    case "drawPolygon":
      {
        const { points } = command;
        await displayManager.drawPolygon(points, sendImmediately, isSending);
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
          isSending,
        );
      }
      break;
    case "drawWireframe":
      {
        const { wireframe } = command;
        await displayManager.drawWireframe(
          wireframe,
          sendImmediately,
          isSending,
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
          isSending,
        );
      }
      break;
    case "drawSegments":
      {
        const { points } = command;
        await displayManager.drawSegments(
          points.map(({ x, y }) => ({ x: x, y: y })),
          sendImmediately,
          isSending,
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
          isSending,
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
          isSending,
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
          isSending,
        );
      }
      break;
    case "drawSprite":
      {
        const { offsetX, offsetY, spriteIndex } = command;
        const spriteName =
          displayManager.getSelectedSpriteSheet(isSending)?.sprites[spriteIndex]
            .name!;
        await displayManager.drawSprite(
          offsetX,
          offsetY,
          spriteName,
          sendImmediately,
          isSending,
        );
      }
      break;
    case "setSpritesLineHeight":
      {
        const { spritesLineHeight } = command;
        await displayManager.setSpritesLineHeight(
          spritesLineHeight,
          sendImmediately,
          isSending,
        );
      }
      break;
    case "setSpritesSpacing":
      {
        const { spritesSpacing } = command;
        await displayManager.setSpritesSpacing(
          spritesSpacing,
          sendImmediately,
          isSending,
        );
      }
      break;
    case "setSpritesAlignment":
      {
        const { spritesAlignment } = command;
        await displayManager.setSpritesAlignment(
          spritesAlignment,
          sendImmediately,
          isSending,
        );
      }
      break;
    case "setSpritesDirection":
      {
        const { spritesDirection } = command;
        await displayManager.setSpritesDirection(
          spritesDirection,
          sendImmediately,
          isSending,
        );
      }
      break;
    case "setSpritesLineAlignment":
      {
        const { spritesLineAlignment } = command;
        await displayManager.setSpritesLineAlignment(
          spritesLineAlignment,
          sendImmediately,
          isSending,
        );
      }
      break;
    case "setSpritesLineDirection":
      {
        const { spritesLineDirection } = command;
        await displayManager.setSpritesLineDirection(
          spritesLineDirection,
          sendImmediately,
          isSending,
        );
      }
      break;
    case "setSpritesLineSpacing":
      {
        const { spritesLineSpacing } = command;
        await displayManager.setSpritesLineSpacing(
          spritesLineSpacing,
          sendImmediately,
          isSending,
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
          isSending,
        );
      }
      break;
    case "selectSpriteSheet":
      {
        const { spriteSheetIndex } = command;
        const spriteSheetName = Object.entries(
          displayManager.spriteSheetIndices,
        ).find((entry) => entry[1] == spriteSheetIndex)?.[0];
        if (spriteSheetName != undefined) {
          await displayManager.selectSpriteSheet(
            spriteSheetName!,
            sendImmediately,
            isSending,
          );
        } else {
          console.warn(
            `no spriteSheet found at index #${spriteSheetIndex} - storing for later`,
          );

          let deviceDisplayManager: DisplayManager | undefined;
          if (displayManager instanceof DisplayManager) {
            deviceDisplayManager = displayManager;
          } else if (displayManager instanceof DisplayCanvasHelper) {
            deviceDisplayManager = displayManager.deviceDisplayManager;
          }
          _console.assertWithError(
            deviceDisplayManager,
            "deviceDisplayManager not found",
          );
          // @ts-expect-error
          deviceDisplayManager._pendingSelectedSpriteSheetIndex =
            spriteSheetIndex;
        }
      }
      break;
    case "resetSpriteColors":
      await displayManager.resetSpriteColors(sendImmediately, isSending);
      break;

    case "drawQuadraticBezierCurve":
      {
        const { controlPoints } = command;
        await displayManager.drawQuadraticBezierCurve(
          controlPoints,
          sendImmediately,
          isSending,
        );
      }
      break;
    case "drawQuadraticBezierCurves":
      {
        const { controlPoints } = command;
        await displayManager.drawQuadraticBezierCurves(
          controlPoints,
          sendImmediately,
          isSending,
        );
      }
      break;
    case "drawCubicBezierCurve":
      {
        const { controlPoints } = command;
        await displayManager.drawCubicBezierCurve(
          controlPoints,
          sendImmediately,
          isSending,
        );
      }
      break;
    case "drawCubicBezierCurves":
      {
        const { controlPoints } = command;
        await displayManager.drawCubicBezierCurves(
          controlPoints,
          sendImmediately,
          isSending,
        );
      }
      break;
    case "drawClosedPath":
      {
        const { curves } = command;
        await displayManager.drawClosedPath(curves, sendImmediately, isSending);
      }
      break;
    case "drawPath":
      {
        const { curves } = command;
        await displayManager.drawPath(curves, sendImmediately, isSending);
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
          isSending,
        );
      }
      break;
    case "endSprite":
      await displayManager.endSprite(sendImmediately, isSending);
      break;
    case "clearContext":
      await displayManager.clearContext(sendImmediately, isSending);
      break;
  }
}

export async function runDisplayContextCommands(
  displayManager: DisplayManagerInterface,
  commands: DisplayContextCommand[],
  sendImmediately?: boolean,
  isSending?: boolean,
) {
  _console.log("runDisplayContextCommands", commands, {
    sendImmediately,
    isSending,
  });

  commands = commands.filter((command) => !command.hide);

  for (let command of commands) {
    runDisplayContextCommand(displayManager, command, false, isSending);
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
  isSending?: boolean,
) {
  displayManager.assertLoadedSpriteSheet(spriteSheetName);
  _console.assertWithError(
    displayManager.getSelectedSpriteSheetName(isSending) == spriteSheetName,
    `spriteSheet "${spriteSheetName}" not selected`,
  );
}
export function assertAnySelectedSpriteSheet(
  displayManager: DisplayManagerInterface,
  isSending?: boolean,
) {
  _console.assertWithError(
    displayManager.getSelectedSpriteSheet(isSending),
    "no spriteSheet selected",
  );
}
export function getSprite(
  displayManager: DisplayManagerInterface,
  spriteName: string,
  isSending?: boolean,
): DisplaySprite | undefined {
  displayManager.assertAnySelectedSpriteSheet();
  return displayManager
    .getSelectedSpriteSheet(isSending)!
    .sprites.find((sprite) => sprite.name == spriteName);
}
export function assertSprite(
  displayManager: DisplayManagerInterface,
  spriteName: string,
  isSending?: boolean,
) {
  displayManager.assertAnySelectedSpriteSheet();
  const sprite = displayManager.getSprite(spriteName, isSending);
  _console.assertWithError(sprite, `no sprite found with name "${spriteName}"`);
}
export function getSpriteSheetPalette(
  displayManager: DisplayManagerInterface,
  paletteName: string,
  isSending?: boolean,
): DisplaySpriteSheetPalette | undefined {
  return displayManager
    .getSelectedSpriteSheet(isSending)
    ?.palettes?.find((palette) => palette.name == paletteName);
}
export function getSpriteSheetPaletteSwap(
  displayManager: DisplayManagerInterface,
  paletteSwapName: string,
  isSending?: boolean,
): DisplaySpriteSheetPaletteSwap | undefined {
  return displayManager
    .getSelectedSpriteSheet(isSending)
    ?.paletteSwaps?.find((paletteSwap) => paletteSwap.name == paletteSwapName);
}
export function getSpritePaletteSwap(
  displayManager: DisplayManagerInterface,
  spriteName: string,
  paletteSwapName: string,
  isSending?: boolean,
): DisplaySpritePaletteSwap | undefined {
  return displayManager
    .getSprite(spriteName, isSending)
    ?.paletteSwaps?.find((paletteSwap) => paletteSwap.name == paletteSwapName);
}

export function assertSpriteSheetPalette(
  displayManagerInterface: DisplayManagerInterface,
  paletteName: string,
  isSending?: boolean,
) {
  const spriteSheetPalette = displayManagerInterface.getSpriteSheetPalette(
    paletteName,
    isSending,
  );
  _console.assertWithError(
    spriteSheetPalette,
    `no spriteSheetPalette found with name "${paletteName}"`,
  );
}
export function assertSpriteSheetPaletteSwap(
  displayManagerInterface: DisplayManagerInterface,
  paletteSwapName: string,
  isSending?: boolean,
) {
  const spriteSheetPaletteSwap =
    displayManagerInterface.getSpriteSheetPaletteSwap(
      paletteSwapName,
      isSending,
    );
  _console.assertWithError(
    spriteSheetPaletteSwap,
    `no paletteSwapName found with name "${paletteSwapName}"`,
  );
}
export function assertSpritePaletteSwap(
  displayManagerInterface: DisplayManagerInterface,
  spriteName: string,
  paletteSwapName: string,
  isSending?: boolean,
) {
  const spritePaletteSwap = displayManagerInterface.getSpritePaletteSwap(
    spriteName,
    paletteSwapName,
    isSending,
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
  isSending?: boolean,
) {
  offset = offset || 0;

  displayManagerInterface.assertAnySelectedSpriteSheet(isSending);
  displayManagerInterface.assertSpriteSheetPalette(paletteName, isSending);
  const palette = displayManagerInterface.getSpriteSheetPalette(
    paletteName,
    isSending,
  )!;

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
      displayManagerInterface.setColor(index + offset, color, false, isSending);
      displayManagerInterface.setColorOpacity(
        index + offset,
        opacity,
        false,
        isSending,
      );
    }
    displayManagerInterface.selectSpriteColor(
      index,
      index + offset,
      false,
      isSending,
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
  isSending?: boolean,
) {
  offset = offset || 0;
  displayManagerInterface.assertAnySelectedSpriteSheet(isSending);
  displayManagerInterface.assertSpriteSheetPaletteSwap(
    paletteSwapName,
    isSending,
  );

  const paletteSwap = displayManagerInterface.getSpriteSheetPaletteSwap(
    paletteSwapName,
    isSending,
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
    isSending,
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
  isSending?: boolean,
) {
  offset = offset || 0;
  displayManagerInterface.assertAnySelectedSpriteSheet(isSending);

  const paletteSwap = displayManagerInterface.getSpritePaletteSwap(
    spriteName,
    paletteSwapName,
    isSending,
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
    isSending,
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
  isSending?: boolean,
) {
  const reducedSpriteSheet = reduceSpriteSheet(spriteSheet, [spriteName]);
  await displayManagerInterface.uploadSpriteSheet(reducedSpriteSheet);
  await displayManagerInterface.selectSpriteSheet(
    spriteSheet.name,
    sendImmediately,
    isSending,
  );
  await displayManagerInterface.drawSprite(
    offsetX,
    offsetY,
    spriteName,
    false,
    isSending,
  );
  if (paletteName != undefined) {
    await displayManagerInterface.selectSpriteSheetPalette(
      paletteName,
      undefined,
      false,
      isSending,
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
