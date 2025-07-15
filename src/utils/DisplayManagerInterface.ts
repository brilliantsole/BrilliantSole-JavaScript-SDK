import {
  DisplayBitmap,
  DisplayBitmapColorPair,
  DisplayBrightness,
  DisplaySpriteColorPair,
} from "../DisplayManager.ts";
import { DisplayContextCommand } from "./DisplayContextCommand.ts";
import {
  DisplayContextState,
  DisplaySegmentCap,
} from "./DisplayContextState.ts";
import {
  DisplaySprite,
  DisplaySpriteSheet,
} from "./DisplaySpriteSheetUtils.ts";
import {
  DisplayScaleDirection,
  DisplayColorRGB,
  DisplayCropDirection,
} from "./DisplayUtils.ts";
import { Vector2 } from "./MathUtils.ts";

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
  setColor(
    colorIndex: number,
    color: DisplayColorRGB | string,
    sendImmediately?: boolean
  ): Promise<void>;

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

  drawSprite(
    centerX: number,
    centerY: number,
    spriteName: string,
    sendImmediately?: boolean
  ): Promise<void>;

  runContextCommandMessage(
    commandMessage: DisplayContextCommand,
    position?: Vector2,
    sendImmediately?: boolean
  ): Promise<void>;
}

export async function runDisplayContextCommand(
  displayManager: DisplayManagerInterface,
  command: DisplayContextCommand,
  position?: Vector2,
  sendImmediately?: boolean
) {
  const { x: _x, y: _y } = position || { x: 0, y: 0 };

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
        const { rotation, isRadians } = command;
        await displayManager.setRotation(rotation, isRadians, sendImmediately);
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
        await displayManager.clearRect(
          x + _x,
          y + _y,
          width,
          height,
          sendImmediately
        );
      }
      break;
    case "drawRect":
      {
        const { centerX, centerY, width, height } = command;
        await displayManager.drawRect(
          centerX + _x,
          centerY + _y,
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
          centerX + _x,
          centerY + _y,
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
          centerX + _x,
          centerY + _y,
          radius,
          sendImmediately
        );
      }
      break;
    case "drawEllipse":
      {
        const { centerX, centerY, radiusX, radiusY } = command;
        await displayManager.drawEllipse(
          centerX + _x,
          centerY + _y,
          radiusX,
          radiusY,
          sendImmediately
        );
      }
      break;
    case "drawPolygon":
      {
        const { centerX, centerY, radius, numberOfSides } = command;
        await displayManager.drawEllipse(
          centerX + _x,
          centerY + _y,
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
          startX + _x,
          startY + _y,
          endX + _x,
          endY + _y,
          sendImmediately
        );
      }
      break;
    case "drawSegments":
      {
        const { points } = command;
        await displayManager.drawSegments(
          points.map(({ x, y }) => ({ x: x + _x, y: y + _y })),
          sendImmediately
        );
      }
      break;
    case "drawArc":
      {
        const { centerX, centerY, radius, startAngle, angleOffset, isRadians } =
          command;
        await displayManager.drawArc(
          centerX + _x,
          centerY + _y,
          radius,
          startAngle,
          angleOffset,
          isRadians,
          sendImmediately
        );
      }
      break;
    case "drawArcEllipse":
      {
        const {
          centerX,
          centerY,
          radiusX,
          radiusY,
          startAngle,
          angleOffset,
          isRadians,
        } = command;
        await displayManager.drawArcEllipse(
          centerX + _x,
          centerY + _y,
          radiusX,
          radiusY,
          startAngle,
          angleOffset,
          isRadians,
          sendImmediately
        );
      }
      break;
    case "drawBitmap":
      {
        const { centerX, centerY, bitmap } = command;
        await displayManager.drawBitmap(
          centerX + _x,
          centerY + _y,
          bitmap,
          sendImmediately
        );
      }
      break;
    case "drawSprite":
      {
        const { centerX, centerY, spriteName } = command;
        await displayManager.drawSprite(centerX + _x, centerY + _y, spriteName);
      }
      break;
  }
}
