import { Font } from "opentype.js";
import {
  DisplayBitmapColorPair,
  DisplayBrightness,
  DisplaySpriteColorPair,
  DisplayBitmap,
  DisplayWireframeEdge,
  DisplayBezierCurve,
  DisplayBezierCurveType,
} from "../DisplayManager.ts";
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
  DisplaySpritePaletteSwap,
  DisplaySpriteSheet,
  DisplaySpriteSheetPalette,
  DisplaySpriteSheetPaletteSwap,
  reduceSpriteSheet,
} from "./DisplaySpriteSheetUtils.ts";
import {
  DisplayScaleDirection,
  DisplayColorRGB,
  DisplayCropDirection,
} from "./DisplayUtils.ts";
import { degToRad, Vector2 } from "./MathUtils.ts";

const _console = createConsole("DisplayManagerInterface", { log: true });

export type DisplaySpriteSubLine = {
  spriteSheetName: string;
  spriteNames: string[];
};
export type DisplaySpriteLine = DisplaySpriteSubLine[];
export type DisplaySpriteLines = DisplaySpriteLine[];

export type DisplaySpriteSerializedSubLine = {
  spriteSheetIndex: number;
  spriteIndices: number[];
  use2Bytes: boolean;
};
export type DisplaySpriteSerializedLine = DisplaySpriteSerializedSubLine[];
export type DisplaySpriteSerializedLines = DisplaySpriteSerializedLine[];

export interface DisplayManagerInterface {
  get isReady(): boolean;

  get contextState(): DisplayContextState;

  flushContextCommands(): Promise<void>;

  get brightness(): DisplayBrightness;
  setBrightness(
    newDisplayBrightness: DisplayBrightness,
    sendImmediately?: boolean
  ): Promise<void>;

  show(sendImmediately?: boolean): Promise<void>;
  clear(sendImmediately?: boolean): Promise<void>;

  get colors(): string[];
  get numberOfColors(): number;
  setColor(
    colorIndex: number,
    color: DisplayColorRGB | string,
    sendImmediately?: boolean
  ): Promise<void>;

  assertValidColorIndex(colorIndex: number): void;
  assertValidLineWidth(lineWidth: number): void;
  assertValidNumberOfColors(numberOfColors: number): void;
  assertValidBitmap(bitmap: DisplayBitmap, checkSize?: boolean): void;

  get opacities(): number[];
  setColorOpacity(
    colorIndex: number,
    opacity: number,
    sendImmediately?: boolean
  ): Promise<void>;
  setOpacity(opacity: number, sendImmediately?: boolean): Promise<void>;

  saveContext(sendImmediately?: boolean): Promise<void>;
  restoreContext(sendImmediately?: boolean): Promise<void>;

  selectFillColor(
    fillColorIndex: number,
    sendImmediately?: boolean
  ): Promise<void>;
  selectBackgroundColor(
    backgroundColorIndex: number,
    sendImmediately?: boolean
  ): Promise<void>;
  selectLineColor(
    lineColorIndex: number,
    sendImmediately?: boolean
  ): Promise<void>;
  setLineWidth(lineWidth: number, sendImmediately?: boolean): Promise<void>;

  setIgnoreFill(ignoreFill: boolean, sendImmediately?: boolean): Promise<void>;
  setIgnoreLine(ignoreLine: boolean, sendImmediately?: boolean): Promise<void>;
  setFillBackground(
    fillBackground: boolean,
    sendImmediately?: boolean
  ): Promise<void>;

  setAlignment(
    alignmentDirection: DisplayAlignmentDirection,
    alignment: DisplayAlignment,
    sendImmediately?: boolean
  ): Promise<void>;
  setHorizontalAlignment(
    horizontalAlignment: DisplayAlignment,
    sendImmediately?: boolean
  ): Promise<void>;
  setVerticalAlignment(
    verticalAlignment: DisplayAlignment,
    sendImmediately?: boolean
  ): Promise<void>;
  resetAlignment(sendImmediately?: boolean): Promise<void>;

  setRotation(
    rotation: number,
    isRadians?: boolean,
    sendImmediately?: boolean
  ): Promise<void>;
  clearRotation(sendImmediately?: boolean): Promise<void>;

  setSegmentStartCap(
    segmentStartCap: DisplaySegmentCap,
    sendImmediately?: boolean
  ): Promise<void>;
  setSegmentEndCap(
    segmentEndCap: DisplaySegmentCap,
    sendImmediately?: boolean
  ): Promise<void>;
  setSegmentCap(
    segmentCap: DisplaySegmentCap,
    sendImmediately?: boolean
  ): Promise<void>;

  setSegmentStartRadius(
    segmentStartRadius: number,
    sendImmediately?: boolean
  ): Promise<void>;
  setSegmentEndRadius(
    segmentEndRadius: number,
    sendImmediately?: boolean
  ): Promise<void>;
  setSegmentRadius(
    segmentRadius: number,
    sendImmediately?: boolean
  ): Promise<void>;

  setCrop(
    cropDirection: DisplayCropDirection,
    crop: number,
    sendImmediately?: boolean
  ): Promise<void>;
  setCropTop(cropTop: number, sendImmediately?: boolean): Promise<void>;
  setCropRight(cropRight: number, sendImmediately?: boolean): Promise<void>;
  setCropBottom(cropBottom: number, sendImmediately?: boolean): Promise<void>;
  setCropLeft(cropLeft: number, sendImmediately?: boolean): Promise<void>;
  clearCrop(sendImmediately?: boolean): Promise<void>;

  setRotationCrop(
    cropDirection: DisplayCropDirection,
    crop: number,
    sendImmediately?: boolean
  ): Promise<void>;
  setRotationCropTop(
    rotationCropTop: number,
    sendImmediately?: boolean
  ): Promise<void>;
  setRotationCropRight(
    rotationCropRight: number,
    sendImmediately?: boolean
  ): Promise<void>;
  setRotationCropBottom(
    rotationCropBottom: number,
    sendImmediately?: boolean
  ): Promise<void>;
  setRotationCropLeft(
    rotationCropLeft: number,
    sendImmediately?: boolean
  ): Promise<void>;
  clearRotationCrop(sendImmediately?: boolean): Promise<void>;

  selectBitmapColor(
    bitmapColorIndex: number,
    colorIndex: number,
    sendImmediately?: boolean
  ): Promise<void>;

  get bitmapColorIndices(): number[];
  get bitmapColors(): string[];
  selectBitmapColors(
    bitmapColorPairs: DisplayBitmapColorPair[],
    sendImmediately?: boolean
  ): Promise<void>;

  setBitmapColor(
    bitmapColorIndex: number,
    color: DisplayColorRGB | string,
    sendImmediately?: boolean
  ): Promise<void>;
  setBitmapColorOpacity(
    bitmapColorIndex: number,
    opacity: number,
    sendImmediately?: boolean
  ): Promise<void>;

  setBitmapScaleDirection(
    direction: DisplayScaleDirection,
    bitmapScale: number,
    sendImmediately?: boolean
  ): Promise<void>;
  setBitmapScaleX(
    bitmapScaleX: number,
    sendImmediately?: boolean
  ): Promise<void>;
  setBitmapScaleY(
    bitmapScaleY: number,
    sendImmediately?: boolean
  ): Promise<void>;
  setBitmapScale(bitmapScale: number, sendImmediately?: boolean): Promise<void>;
  resetBitmapScale(sendImmediately?: boolean): Promise<void>;

  selectSpriteColor(
    spriteColorIndex: number,
    colorIndex: number,
    sendImmediately?: boolean
  ): Promise<void>;

  get spriteColorIndices(): number[];
  get spriteColors(): string[];
  selectSpriteColors(
    spriteColorPairs: DisplaySpriteColorPair[],
    sendImmediately?: boolean
  ): Promise<void>;
  resetSpriteColors(sendImmediately?: boolean): Promise<void>;

  setSpriteColor(
    spriteColorIndex: number,
    color: DisplayColorRGB | string,
    sendImmediately?: boolean
  ): Promise<void>;
  setSpriteColorOpacity(
    spriteColorIndex: number,
    opacity: number,
    sendImmediately?: boolean
  ): Promise<void>;

  setSpriteScaleDirection(
    direction: DisplayScaleDirection,
    spriteScale: number,
    sendImmediately?: boolean
  ): Promise<void>;
  setSpriteScaleX(
    spriteScaleX: number,
    sendImmediately?: boolean
  ): Promise<void>;
  setSpriteScaleY(
    spriteScaleY: number,
    sendImmediately?: boolean
  ): Promise<void>;
  setSpriteScale(spriteScale: number, sendImmediately?: boolean): Promise<void>;
  resetSpriteScale(sendImmediately?: boolean): Promise<void>;

  setSpritesLineHeight(
    spritesLineHeight: number,
    sendImmediately?: boolean
  ): Promise<void>;

  setSpritesDirectionGeneric(
    direction: DisplayDirection,
    isOrthogonal: boolean,
    sendImmediately?: boolean
  ): Promise<void>;
  setSpritesDirection(
    spritesDirection: DisplayDirection,
    sendImmediately?: boolean
  ): Promise<void>;
  setSpritesLineDirection(
    spritesLineDirection: DisplayDirection,
    sendImmediately?: boolean
  ): Promise<void>;

  setSpritesSpacingGeneric(
    spacing: number,
    isOrthogonal: boolean,
    sendImmediately?: boolean
  ): Promise<void>;
  setSpritesSpacing(
    spritesSpacing: number,
    sendImmediately?: boolean
  ): Promise<void>;
  setSpritesLineSpacing(
    spritesSpacing: number,
    sendImmediately?: boolean
  ): Promise<void>;

  setSpritesAlignmentGeneric(
    alignment: DisplayAlignment,
    isOrthogonal: boolean,
    sendImmediately?: boolean
  ): Promise<void>;
  setSpritesAlignment(
    spritesAlignment: DisplayAlignment,
    sendImmediately?: boolean
  ): Promise<void>;
  setSpritesLineAlignment(
    spritesLineAlignment: DisplayAlignment,
    sendImmediately?: boolean
  ): Promise<void>;

  clearRect(
    x: number,
    y: number,
    width: number,
    height: number,
    sendImmediately?: boolean
  ): Promise<void>;
  drawRect(
    offsetX: number,
    offsetY: number,
    width: number,
    height: number,
    sendImmediately?: boolean
  ): Promise<void>;
  drawRoundRect(
    offsetX: number,
    offsetY: number,
    width: number,
    height: number,
    borderRadius: number,
    sendImmediately?: boolean
  ): Promise<void>;
  drawCircle(
    offsetX: number,
    offsetY: number,
    radius: number,
    sendImmediately?: boolean
  ): Promise<void>;
  drawEllipse(
    offsetX: number,
    offsetY: number,
    radiusX: number,
    radiusY: number,
    sendImmediately?: boolean
  ): Promise<void>;
  drawRegularPolygon(
    offsetX: number,
    offsetY: number,
    radius: number,
    numberOfSides: number,
    sendImmediately?: boolean
  ): Promise<void>;
  drawPolygon(
    offsetX: number,
    offsetY: number,
    points: Vector2[],
    sendImmediately?: boolean
  ): Promise<void>;

  drawWireframe(
    points: Vector2[],
    edges: DisplayWireframeEdge[],
    sendImmediately?: boolean
  ): Promise<void>;

  drawCurve(
    curveType: DisplayBezierCurveType,
    controlPoints: Vector2[],
    sendImmediately?: boolean
  ): Promise<void>;
  drawCurves(
    curveType: DisplayBezierCurveType,
    controlPoints: Vector2[],
    sendImmediately?: boolean
  ): Promise<void>;

  drawQuadraticBezierCurve(
    controlPoints: Vector2[],
    sendImmediately?: boolean
  ): Promise<void>;
  drawQuadraticBezierCurves(
    controlPoints: Vector2[],
    sendImmediately?: boolean
  ): Promise<void>;

  drawCubicBezierCurve(
    controlPoints: Vector2[],
    sendImmediately?: boolean
  ): Promise<void>;
  drawCubicBezierCurves(
    controlPoints: Vector2[],
    sendImmediately?: boolean
  ): Promise<void>;

  _drawPath(
    isClosed: boolean,
    curves: DisplayBezierCurve[],
    sendImmediately?: boolean
  ): Promise<void>;
  drawPath(
    curves: DisplayBezierCurve[],
    sendImmediately?: boolean
  ): Promise<void>;
  drawClosedPath(
    curves: DisplayBezierCurve[],
    sendImmediately?: boolean
  ): Promise<void>;

  drawSegment(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    sendImmediately?: boolean
  ): Promise<void>;
  drawSegments(points: Vector2[], sendImmediately?: boolean): Promise<void>;

  drawArc(
    offsetX: number,
    offsetY: number,
    radius: number,
    startAngle: number,
    angleOffset: number,
    isRadians?: boolean,
    sendImmediately?: boolean
  ): Promise<void>;
  drawArcEllipse(
    offsetX: number,
    offsetY: number,
    radiusX: number,
    radiusY: number,
    startAngle: number,
    angleOffset: number,
    isRadians?: boolean,
    sendImmediately?: boolean
  ): Promise<void>;

  drawBitmap(
    offsetX: number,
    offsetY: number,
    bitmap: DisplayBitmap,
    sendImmediately?: boolean
  ): Promise<void>;

  runContextCommand(
    command: DisplayContextCommand,
    sendImmediately?: boolean
  ): Promise<void>;

  runContextCommands(
    commands: DisplayContextCommand[],
    sendImmediately?: boolean
  ): Promise<void>;

  imageToBitmap(
    image: HTMLImageElement,
    width: number,
    height: number,
    numberOfColors?: number
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
    canvas?: HTMLCanvasElement
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
    canvas?: HTMLCanvasElement
  ): Promise<{
    blob: Blob;
    colors: string[];
    colorIndices: number[];
  }>;

  uploadSpriteSheet(spriteSheet: DisplaySpriteSheet): Promise<void>;
  uploadSpriteSheets(spriteSheets: DisplaySpriteSheet[]): Promise<void>;
  selectSpriteSheet(
    spriteSheetName: string,
    sendImmediately?: boolean
  ): Promise<void>;
  drawSprite(
    offsetX: number,
    offsetY: number,
    spriteName: string,
    sendImmediately?: boolean
  ): Promise<void>;
  stringToSpriteLines(string: string, requireAll?: boolean): DisplaySpriteLines;
  drawSprites(
    offsetX: number,
    offsetY: number,
    spriteLines: DisplaySpriteLines,
    sendImmediately?: boolean
  ): Promise<void>;
  drawSpritesString(
    offsetX: number,
    offsetY: number,
    string: string,
    sendImmediately?: boolean
  ): Promise<void>;
  assertLoadedSpriteSheet(spriteSheetName: string): void;
  assertSelectedSpriteSheet(spriteSheetName: string): void;
  assertAnySelectedSpriteSheet(): void;
  assertSprite(spriteName: string): void;
  getSprite(spriteName: string): DisplaySprite | undefined;
  getSpriteSheetPalette(
    paletteName: string
  ): DisplaySpriteSheetPalette | undefined;
  getSpriteSheetPaletteSwap(
    paletteSwapName: string
  ): DisplaySpriteSheetPaletteSwap | undefined;
  getSpritePaletteSwap(
    spriteName: string,
    paletteSwapName: string
  ): DisplaySpritePaletteSwap | undefined;

  drawSpriteFromSpriteSheet(
    offsetX: number,
    offsetY: number,
    spriteName: string,
    spriteSheet: DisplaySpriteSheet,
    paletteName?: string,
    sendImmediately?: boolean
  ): Promise<void>;

  get selectedSpriteSheet(): DisplaySpriteSheet | undefined;
  get selectedSpriteSheetName(): string | undefined;

  spriteSheets: Record<string, DisplaySpriteSheet>;
  spriteSheetIndices: Record<string, number>;

  assertSpriteSheetPalette(paletteName: string): void;
  assertSpriteSheetPaletteSwap(paletteSwapName: string): void;
  assertSpritePaletteSwap(spriteName: string, paletteSwapName: string): void;
  selectSpriteSheetPalette(
    paletteName: string,
    offset?: number,
    sendImmediately?: boolean
  ): Promise<void>;
  selectSpriteSheetPaletteSwap(
    paletteSwapName: string,
    offset?: number,
    sendImmediately?: boolean
  ): Promise<void>;
  selectSpritePaletteSwap(
    spriteName: string,
    paletteSwapName: string,
    offset?: number,
    sendImmediately?: boolean
  ): Promise<void>;

  serializeSpriteSheet(spriteSheet: DisplaySpriteSheet): ArrayBuffer;

  fontToSpriteSheet(
    font: Font,
    fontSize: number,
    spriteSheetName?: string
  ): Promise<DisplaySpriteSheet>;
}

export async function runDisplayContextCommand(
  displayManager: DisplayManagerInterface,
  command: DisplayContextCommand,
  sendImmediately?: boolean
) {
  if (command.hide) {
    return;
  }
  switch (command.type) {
    case "show":
      await displayManager.show(sendImmediately);
      break;
    case "clear":
      await displayManager.clear(sendImmediately);
      break;
    case "saveContext":
      await displayManager.saveContext(sendImmediately);
      break;
    case "restoreContext":
      await displayManager.restoreContext(sendImmediately);
      break;
    case "clearRotation":
      await displayManager.clearRotation(sendImmediately);
      break;
    case "clearCrop":
      await displayManager.clearCrop(sendImmediately);
      break;
    case "clearRotationCrop":
      await displayManager.clearRotationCrop(sendImmediately);
      break;
    case "resetBitmapScale":
      await displayManager.resetBitmapScale(sendImmediately);
      break;
    case "resetSpriteScale":
      await displayManager.resetSpriteScale(sendImmediately);
      break;
    case "setColor":
      {
        const { colorIndex, color } = command;
        await displayManager.setColor(colorIndex, color, sendImmediately);
      }
      break;
    case "setColorOpacity":
      {
        const { colorIndex, opacity } = command;
        await displayManager.setColorOpacity(
          colorIndex,
          opacity,
          sendImmediately
        );
      }
      break;
    case "setOpacity":
      {
        const { opacity } = command;
        await displayManager.setOpacity(opacity, sendImmediately);
      }
      break;
    case "selectBackgroundColor":
      {
        const { backgroundColorIndex } = command;
        await displayManager.selectBackgroundColor(
          backgroundColorIndex,
          sendImmediately
        );
      }
      break;
    case "selectFillColor":
      {
        const { fillColorIndex } = command;
        await displayManager.selectFillColor(fillColorIndex, sendImmediately);
      }
      break;
    case "selectLineColor":
      {
        const { lineColorIndex } = command;
        await displayManager.selectLineColor(lineColorIndex, sendImmediately);
      }
      break;
    case "setIgnoreFill":
      {
        const { ignoreFill } = command;
        await displayManager.setIgnoreFill(ignoreFill, sendImmediately);
      }
      break;
    case "setIgnoreLine":
      {
        const { ignoreLine } = command;
        await displayManager.setIgnoreLine(ignoreLine, sendImmediately);
      }
      break;
    case "setFillBackground":
      {
        const { fillBackground } = command;
        await displayManager.setFillBackground(fillBackground, sendImmediately);
      }
      break;
    case "setLineWidth":
      {
        const { lineWidth } = command;
        await displayManager.setLineWidth(lineWidth, sendImmediately);
      }
      break;
    case "setRotation":
      {
        let { rotation, isRadians } = command;
        rotation = isRadians ? rotation : degToRad(rotation);
        rotation;
        await displayManager.setRotation(rotation, true, sendImmediately);
      }
      break;
    case "setSegmentStartCap":
      {
        const { segmentStartCap } = command;
        await displayManager.setSegmentStartCap(
          segmentStartCap,
          sendImmediately
        );
      }
      break;
    case "setSegmentEndCap":
      {
        const { segmentEndCap } = command;
        await displayManager.setSegmentEndCap(segmentEndCap, sendImmediately);
      }
      break;
    case "setSegmentCap":
      {
        const { segmentCap } = command;
        await displayManager.setSegmentCap(segmentCap, sendImmediately);
      }
      break;
    case "setSegmentStartRadius":
      {
        const { segmentStartRadius } = command;
        await displayManager.setSegmentStartRadius(
          segmentStartRadius,
          sendImmediately
        );
      }
      break;
    case "setSegmentEndRadius":
      {
        const { segmentEndRadius } = command;
        await displayManager.setSegmentEndRadius(
          segmentEndRadius,
          sendImmediately
        );
      }
      break;
    case "setSegmentRadius":
      {
        const { segmentRadius } = command;
        await displayManager.setSegmentRadius(segmentRadius, sendImmediately);
      }
      break;
    case "setHorizontalAlignment":
      {
        const { horizontalAlignment } = command;
        await displayManager.setHorizontalAlignment(
          horizontalAlignment,
          sendImmediately
        );
      }
      break;
    case "setVerticalAlignment":
      {
        const { verticalAlignment } = command;
        await displayManager.setVerticalAlignment(
          verticalAlignment,
          sendImmediately
        );
      }
      break;
    case "resetAlignment":
      {
        await displayManager.resetAlignment(sendImmediately);
      }
      break;
    case "setCropTop":
      {
        const { cropTop } = command;
        await displayManager.setCropTop(cropTop, sendImmediately);
      }
      break;
    case "setCropRight":
      {
        const { cropRight } = command;
        await displayManager.setCropRight(cropRight, sendImmediately);
      }
      break;
    case "setCropBottom":
      {
        const { cropBottom } = command;
        await displayManager.setCropBottom(cropBottom, sendImmediately);
      }
      break;
    case "setCropLeft":
      {
        const { cropLeft } = command;
        await displayManager.setCropLeft(cropLeft, sendImmediately);
      }
      break;
    case "setRotationCropTop":
      {
        const { rotationCropTop } = command;
        await displayManager.setRotationCropTop(
          rotationCropTop,
          sendImmediately
        );
      }
      break;
    case "setRotationCropRight":
      {
        const { rotationCropRight } = command;
        await displayManager.setRotationCropRight(
          rotationCropRight,
          sendImmediately
        );
      }
      break;
    case "setRotationCropBottom":
      {
        const { rotationCropBottom } = command;
        await displayManager.setRotationCropBottom(
          rotationCropBottom,
          sendImmediately
        );
      }
      break;
    case "setRotationCropLeft":
      {
        const { rotationCropLeft } = command;
        await displayManager.setRotationCropLeft(
          rotationCropLeft,
          sendImmediately
        );
      }
      break;
    case "selectBitmapColor":
      {
        const { bitmapColorIndex, colorIndex } = command;
        await displayManager.selectBitmapColor(
          bitmapColorIndex,
          colorIndex,
          sendImmediately
        );
      }
      break;
    case "selectBitmapColors":
      {
        const { bitmapColorPairs } = command;
        await displayManager.selectBitmapColors(
          bitmapColorPairs,
          sendImmediately
        );
      }
      break;
    case "setBitmapScaleX":
      {
        const { bitmapScaleX } = command;
        await displayManager.setBitmapScaleX(bitmapScaleX, sendImmediately);
      }
      break;
    case "setBitmapScaleY":
      {
        const { bitmapScaleY } = command;
        await displayManager.setBitmapScaleY(bitmapScaleY, sendImmediately);
      }
      break;
    case "setBitmapScale":
      {
        const { bitmapScale } = command;
        await displayManager.setBitmapScale(bitmapScale, sendImmediately);
      }
      break;
    case "selectSpriteColor":
      {
        const { spriteColorIndex, colorIndex } = command;
        await displayManager.selectSpriteColor(
          spriteColorIndex,
          colorIndex,
          sendImmediately
        );
      }
      break;
    case "selectSpriteColors":
      {
        const { spriteColorPairs } = command;
        await displayManager.selectSpriteColors(
          spriteColorPairs,
          sendImmediately
        );
      }
      break;
    case "setSpriteScaleX":
      {
        const { spriteScaleX } = command;
        await displayManager.setSpriteScaleX(spriteScaleX, sendImmediately);
      }
      break;
    case "setSpriteScaleY":
      {
        const { spriteScaleY } = command;
        await displayManager.setSpriteScaleY(spriteScaleY, sendImmediately);
      }
      break;
    case "setSpriteScale":
      {
        const { spriteScale } = command;
        await displayManager.setSpriteScale(spriteScale, sendImmediately);
      }
      break;

    case "clearRect":
      {
        const { x, y, width, height } = command;
        await displayManager.clearRect(x, y, width, height, sendImmediately);
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
          sendImmediately
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
          sendImmediately
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
          sendImmediately
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
          sendImmediately
        );
      }
      break;
    case "drawPolygon":
      {
        const { offsetX, offsetY, points } = command;
        await displayManager.drawPolygon(
          offsetX,
          offsetY,
          points,
          sendImmediately
        );
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
          sendImmediately
        );
      }
      break;
    case "drawWireframe":
      {
        const { points, edges } = command;
        await displayManager.drawWireframe(points, edges, sendImmediately);
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
          sendImmediately
        );
      }
      break;
    case "drawSegments":
      {
        const { points } = command;
        await displayManager.drawSegments(
          points.map(({ x, y }) => ({ x: x, y: y })),
          sendImmediately
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
          sendImmediately
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
          sendImmediately
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
          sendImmediately
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
          sendImmediately
        );
      }
      break;
    case "selectSpriteSheet":
      {
        const { spriteSheetIndex } = command;
        const spriteSheetName = Object.entries(
          displayManager.spriteSheetIndices
        ).find((entry) => entry[1] == spriteSheetIndex)?.[0];
        await displayManager.selectSpriteSheet(
          spriteSheetName!,
          sendImmediately
        );
      }
      break;
    case "resetSpriteColors":
      await displayManager.resetSpriteColors(sendImmediately);
      break;

    case "drawQuadraticBezierCurve":
      {
        const { controlPoints } = command;
        await displayManager.drawQuadraticBezierCurve(
          controlPoints,
          sendImmediately
        );
      }
      break;
    case "drawQuadraticBezierCurves":
      {
        const { controlPoints } = command;
        await displayManager.drawQuadraticBezierCurves(
          controlPoints,
          sendImmediately
        );
      }
      break;
    case "drawCubicBezierCurve":
      {
        const { controlPoints } = command;
        await displayManager.drawCubicBezierCurve(
          controlPoints,
          sendImmediately
        );
      }
      break;
    case "drawCubicBezierCurves":
      {
        const { controlPoints } = command;
        await displayManager.drawCubicBezierCurves(
          controlPoints,
          sendImmediately
        );
      }
      break;
    case "drawClosedPath":
      {
        const { curves } = command;
        await displayManager.drawClosedPath(curves, sendImmediately);
      }
      break;
    case "drawPath":
      {
        const { curves } = command;
        await displayManager.drawPath(curves, sendImmediately);
      }
      break;
  }
}

export async function runDisplayContextCommands(
  displayManager: DisplayManagerInterface,
  commands: DisplayContextCommand[],
  sendImmediately?: boolean
) {
  _console.log("runDisplayContextCommands", commands);
  commands
    .filter((command) => !command.hide)
    .forEach((command) => {
      runDisplayContextCommand(displayManager, command, false);
    });
  if (sendImmediately) {
    displayManager.flushContextCommands();
  }
}

export function assertLoadedSpriteSheet(
  displayManager: DisplayManagerInterface,
  spriteSheetName: string
) {
  _console.assertWithError(
    displayManager.spriteSheets[spriteSheetName],
    `spriteSheet "${spriteSheetName}" not loaded`
  );
}
export function assertSelectedSpriteSheet(
  displayManager: DisplayManagerInterface,
  spriteSheetName: string
) {
  displayManager.assertLoadedSpriteSheet(spriteSheetName);
  _console.assertWithError(
    displayManager.selectedSpriteSheetName == spriteSheetName,
    `spriteSheet "${spriteSheetName}" not selected`
  );
}
export function assertAnySelectedSpriteSheet(
  displayManager: DisplayManagerInterface
) {
  _console.assertWithError(
    displayManager.selectedSpriteSheet,
    "no spriteSheet selected"
  );
}
export function getSprite(
  displayManager: DisplayManagerInterface,
  spriteName: string
): DisplaySprite | undefined {
  displayManager.assertAnySelectedSpriteSheet();
  return displayManager.selectedSpriteSheet!.sprites.find(
    (sprite) => sprite.name == spriteName
  );
}
export function assertSprite(
  displayManager: DisplayManagerInterface,
  spriteName: string
) {
  displayManager.assertAnySelectedSpriteSheet();
  const sprite = displayManager.getSprite(spriteName);
  _console.assertWithError(sprite, `no sprite found with name "${spriteName}"`);
}
export function getSpriteSheetPalette(
  displayManager: DisplayManagerInterface,
  paletteName: string
): DisplaySpriteSheetPalette | undefined {
  return displayManager.selectedSpriteSheet?.palettes?.find(
    (palette) => palette.name == paletteName
  );
}
export function getSpriteSheetPaletteSwap(
  displayManager: DisplayManagerInterface,
  paletteSwapName: string
): DisplaySpriteSheetPaletteSwap | undefined {
  return displayManager.selectedSpriteSheet?.paletteSwaps?.find(
    (paletteSwap) => paletteSwap.name == paletteSwapName
  );
}
export function getSpritePaletteSwap(
  displayManager: DisplayManagerInterface,
  spriteName: string,
  paletteSwapName: string
): DisplaySpritePaletteSwap | undefined {
  return displayManager
    .getSprite(spriteName)
    ?.paletteSwaps?.find((paletteSwap) => paletteSwap.name == paletteSwapName);
}

export function assertSpriteSheetPalette(
  displayManagerInterface: DisplayManagerInterface,
  paletteName: string
) {
  const spriteSheetPalette =
    displayManagerInterface.getSpriteSheetPalette(paletteName);
  _console.assertWithError(
    spriteSheetPalette,
    `no spriteSheetPalette found with name "${paletteName}"`
  );
}
export function assertSpriteSheetPaletteSwap(
  displayManagerInterface: DisplayManagerInterface,
  paletteSwapName: string
) {
  const spriteSheetPaletteSwap =
    displayManagerInterface.getSpriteSheetPaletteSwap(paletteSwapName);
  _console.assertWithError(
    spriteSheetPaletteSwap,
    `no paletteSwapName found with name "${paletteSwapName}"`
  );
}
export function assertSpritePaletteSwap(
  displayManagerInterface: DisplayManagerInterface,
  spriteName: string,
  paletteSwapName: string
) {
  const spritePaletteSwap = displayManagerInterface.getSpritePaletteSwap(
    spriteName,
    paletteSwapName
  );
  _console.assertWithError(
    spritePaletteSwap,
    `no spritePaletteSwap found for sprite "${spriteName}" name "${paletteSwapName}"`
  );
}
export async function selectSpriteSheetPalette(
  displayManagerInterface: DisplayManagerInterface,
  paletteName: string,
  offset?: number,
  sendImmediately?: boolean
) {
  offset = offset || 0;

  displayManagerInterface.assertAnySelectedSpriteSheet();
  displayManagerInterface.assertSpriteSheetPalette(paletteName);
  const palette = displayManagerInterface.getSpriteSheetPalette(paletteName)!;

  _console.assertWithError(
    palette.numberOfColors + offset <= displayManagerInterface.numberOfColors,
    `invalid offset ${offset} and palette.numberOfColors ${palette.numberOfColors} (max ${displayManagerInterface.numberOfColors})`
  );

  for (let index = 0; index < palette.numberOfColors; index++) {
    const color = palette.colors[index];
    let opacity = palette.opacities?.[index];
    if (opacity == undefined) {
      opacity = 1;
    }
    displayManagerInterface.setColor(index + offset, color, false);
    displayManagerInterface.setColorOpacity(index + offset, opacity, false);
    displayManagerInterface.selectSpriteColor(index, index + offset);
  }

  if (sendImmediately) {
    displayManagerInterface.flushContextCommands();
  }
}
export async function selectSpriteSheetPaletteSwap(
  displayManagerInterface: DisplayManagerInterface,
  paletteSwapName: string,
  offset?: number,
  sendImmediately?: boolean
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
  displayManagerInterface.selectSpriteColors(spriteColorPairs, false);

  if (sendImmediately) {
    displayManagerInterface.flushContextCommands();
  }
}
export async function selectSpritePaletteSwap(
  displayManagerInterface: DisplayManagerInterface,
  spriteName: string,
  paletteSwapName: string,
  offset?: number,
  sendImmediately?: boolean
) {
  offset = offset || 0;
  displayManagerInterface.assertAnySelectedSpriteSheet();

  const paletteSwap = displayManagerInterface.getSpritePaletteSwap(
    spriteName,
    paletteSwapName
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
  displayManagerInterface.selectSpriteColors(spriteColorPairs, false);

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
  sendImmediately?: boolean
) {
  const reducedSpriteSheet = reduceSpriteSheet(spriteSheet, [spriteName]);
  await displayManagerInterface.uploadSpriteSheet(reducedSpriteSheet);
  await displayManagerInterface.selectSpriteSheet(spriteSheet.name);
  await displayManagerInterface.drawSprite(
    offsetX,
    offsetY,
    spriteName,
    sendImmediately
  );
  if (paletteName != undefined) {
    await displayManagerInterface.selectSpriteSheetPalette(paletteName);
  }
}

export function stringToSpriteLines(
  string: string,
  spriteSheets: Record<string, DisplaySpriteSheet>,
  requireAll = false
): DisplaySpriteLines {
  const lineStrings = string.split("\n");
  const spriteLines = lineStrings.map((lineString) => {
    const spriteLine: DisplaySpriteLine = [];
    let spriteSubLine: DisplaySpriteSubLine | undefined;
    let lineSubstring = lineString;
    while (lineSubstring.length > 0) {
      let longestSprite: DisplaySprite | undefined;
      let longestSpriteSheet: DisplaySpriteSheet | undefined;
      for (let spriteSheetName in spriteSheets) {
        const spriteSheet = spriteSheets[spriteSheetName];
        spriteSheet.sprites.forEach((sprite) => {
          if (lineSubstring.startsWith(sprite.name)) {
            if (
              !longestSprite ||
              sprite.name.length > longestSprite.name.length
            ) {
              longestSprite = sprite;
              longestSpriteSheet = spriteSheet;
            }
          }
        });
      }
      _console.log("longestSprite", longestSprite);
      if (requireAll) {
        _console.assertWithError(
          longestSprite,
          `couldn't find sprite with name prefixing "${lineSubstring}"`
        );
      }

      if (longestSprite && longestSpriteSheet) {
        if (
          !spriteSubLine ||
          spriteSubLine.spriteSheetName != longestSpriteSheet.name
        ) {
          spriteSubLine = {
            spriteSheetName: longestSpriteSheet.name,
            spriteNames: [],
          };
          spriteLine.push(spriteSubLine);
        }
        spriteSubLine.spriteNames.push(longestSprite.name);
        lineSubstring = lineSubstring.substring(longestSprite!.name.length);
      } else {
        lineSubstring = lineSubstring.substring(1);
      }

      _console.log("new substring", lineSubstring);
    }
    _console.log("spriteLine", spriteLine);
    return spriteLine;
  });
  _console.log(`spriteLines for "${string}"`, spriteLines);
  return spriteLines;
}
