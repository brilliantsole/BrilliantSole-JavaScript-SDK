import {
  DisplayBitmapColorPair,
  DisplayBrightness,
  DisplaySpriteColorPair,
  DisplayBitmap,
} from "../DisplayManager.ts";
import { createConsole } from "./Console.ts";
import { DisplayContextCommand } from "./DisplayContextCommand.ts";
import {
  DisplayContextState,
  DisplaySegmentCap,
} from "./DisplayContextState.ts";
import {
  DisplaySprite,
  DisplaySpritePaletteSwap,
  DisplaySpriteSheet,
  DisplaySpriteSheetPalette,
  DisplaySpriteSheetPaletteSwap,
} from "./DisplaySpriteSheetUtils.ts";
import {
  DisplayScaleDirection,
  DisplayColorRGB,
  DisplayCropDirection,
} from "./DisplayUtils.ts";
import { degToRad, Vector2 } from "./MathUtils.ts";

export type DisplayTransform = {
  rotation: number;
  scale: number;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
};
export const defaultDisplayTransform: DisplayTransform = {
  rotation: 0,
  scale: 1,
  centerX: 0,
  centerY: 0,
  width: 0,
  height: 0,
};

const _console = createConsole("DisplayManagerInterface", { log: true });

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
  selectLineColor(
    lineColorIndex: number,
    sendImmediately?: boolean
  ): Promise<void>;
  setLineWidth(lineWidth: number, sendImmediately?: boolean): Promise<void>;

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

  clearRect(
    x: number,
    y: number,
    width: number,
    height: number,
    sendImmediately?: boolean
  ): Promise<void>;
  drawRect(
    centerX: number,
    centerY: number,
    width: number,
    height: number,
    sendImmediately?: boolean
  ): Promise<void>;
  drawRoundRect(
    centerX: number,
    centerY: number,
    width: number,
    height: number,
    borderRadius: number,
    sendImmediately?: boolean
  ): Promise<void>;
  drawCircle(
    centerX: number,
    centerY: number,
    radius: number,
    sendImmediately?: boolean
  ): Promise<void>;
  drawEllipse(
    centerX: number,
    centerY: number,
    radiusX: number,
    radiusY: number,
    sendImmediately?: boolean
  ): Promise<void>;
  drawPolygon(
    centerX: number,
    centerY: number,
    radius: number,
    numberOfSides: number,
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
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    angleOffset: number,
    isRadians?: boolean,
    sendImmediately?: boolean
  ): Promise<void>;
  drawArcEllipse(
    centerX: number,
    centerY: number,
    radiusX: number,
    radiusY: number,
    startAngle: number,
    angleOffset: number,
    isRadians?: boolean,
    sendImmediately?: boolean
  ): Promise<void>;

  drawBitmap(
    centerX: number,
    centerY: number,
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
    numberOfColors: number
  ): Promise<{
    blob: Blob;
    colors: string[];
    colorIndices: number[];
  }>;

  resizeAndQuantizeImage(
    image: HTMLImageElement,
    width: number,
    height: number,
    colors: string[]
  ): Promise<{
    blob: Blob;
    colorIndices: number[];
  }>;

  uploadSpriteSheet(spriteSheet: DisplaySpriteSheet): Promise<void>;
  uploadSpriteSheets(spriteSheets: DisplaySpriteSheet[]): Promise<void>;
  selectSpriteSheet(
    spriteSheetName: string,
    sendImmediately?: boolean
  ): Promise<void>;
  drawSprite(
    centerX: number,
    centerY: number,
    spriteName: string,
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
    arrayBuffer: ArrayBuffer,
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
        const { centerX, centerY, width, height } = command;
        await displayManager.drawRect(
          centerX,
          centerY,
          width,
          height,
          sendImmediately
        );
      }
      break;
    case "drawRoundRect":
      {
        const { centerX, centerY, width, height, borderRadius } = command;
        await displayManager.drawRoundRect(
          centerX,
          centerY,
          width,
          height,
          borderRadius,
          sendImmediately
        );
      }
      break;
    case "drawCircle":
      {
        const { centerX, centerY, radius } = command;
        await displayManager.drawCircle(
          centerX,
          centerY,
          radius,
          sendImmediately
        );
      }
      break;
    case "drawEllipse":
      {
        const { centerX, centerY, radiusX, radiusY } = command;
        await displayManager.drawEllipse(
          centerX,
          centerY,
          radiusX,
          radiusY,
          sendImmediately
        );
      }
      break;
    case "drawPolygon":
      {
        const { centerX, centerY, radius, numberOfSides } = command;
        await displayManager.drawPolygon(
          centerX,
          centerY,
          radius,
          numberOfSides,
          sendImmediately
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
        let { centerX, centerY, radius, startAngle, angleOffset, isRadians } =
          command;
        startAngle = isRadians ? startAngle : degToRad(startAngle);
        angleOffset = isRadians ? angleOffset : degToRad(angleOffset);

        await displayManager.drawArc(
          centerX,
          centerY,
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
          centerX,
          centerY,
          radiusX,
          radiusY,
          startAngle,
          angleOffset,
          isRadians,
        } = command;
        startAngle = isRadians ? startAngle : degToRad(startAngle);
        angleOffset = isRadians ? angleOffset : degToRad(angleOffset);

        await displayManager.drawArcEllipse(
          centerX,
          centerY,
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
        const { centerX, centerY, bitmap } = command;
        await displayManager.drawBitmap(
          centerX,
          centerY,
          bitmap,
          sendImmediately
        );
      }
      break;
    case "drawSprite":
      {
        const { centerX, centerY, spriteIndex } = command;
        const spriteName =
          displayManager.selectedSpriteSheet?.sprites[spriteIndex].name!;
        await displayManager.drawSprite(
          centerX,
          centerY,
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
