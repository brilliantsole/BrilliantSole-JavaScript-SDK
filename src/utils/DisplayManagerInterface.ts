import {
  DisplayBitmap,
  DisplayBitmapColorPair,
  DisplayBrightness,
} from "../DisplayManager.ts";
import { DisplayContextCommandMessage } from "./DisplayContextCommand.ts";
import {
  DisplayContextState,
  DisplaySegmentCap,
} from "./DisplayContextState.ts";
import {
  DisplayBitmapScaleDirection,
  DisplayColorRGB,
  DisplayCropDirection,
} from "./DisplayUtils.ts";
import { Vector2 } from "./MathUtils.ts";

export interface DisplayManagerInterface {
  get isReady(): boolean;

  get contextState(): DisplayContextState;

  get brightness(): DisplayBrightness;
  setBrightness(
    newDisplayBrightness: DisplayBrightness,
    sendImmediately?: boolean
  ): Promise<void>;

  showDisplay(sendImmediately?: boolean): Promise<void>;
  clearDisplay(sendImmediately?: boolean): Promise<void>;

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
    direction: DisplayBitmapScaleDirection,
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

  runContextCommandMessage(
    commandMessage: DisplayContextCommandMessage,
    position?: Vector2,
    sendImmediately?: boolean
  ): Promise<void>;
}

export async function runDisplayContextCommand(
  displayManager: DisplayManagerInterface,
  commandMessage: DisplayContextCommandMessage,
  position?: Vector2,
  sendImmediately?: boolean
) {
  const { x: _x, y: _y } = position || { x: 0, y: 0 };

  switch (commandMessage.command) {
    case "show":
      await displayManager.showDisplay(sendImmediately);
      break;
    case "clear":
      await displayManager.clearDisplay(sendImmediately);
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
    case "setColor":
      {
        const { colorIndex, color } = commandMessage;
        await displayManager.setColor(colorIndex, color, sendImmediately);
      }
      break;
    case "setColorOpacity":
      {
        const { colorIndex, opacity } = commandMessage;
        await displayManager.setColorOpacity(
          colorIndex,
          opacity,
          sendImmediately
        );
      }
      break;
    case "setOpacity":
      {
        const { opacity } = commandMessage;
        await displayManager.setOpacity(opacity, sendImmediately);
      }
      break;
    case "selectFillColor":
      {
        const { fillColorIndex } = commandMessage;
        await displayManager.selectFillColor(fillColorIndex, sendImmediately);
      }
      break;
    case "selectLineColor":
      {
        const { lineColorIndex } = commandMessage;
        await displayManager.selectLineColor(lineColorIndex, sendImmediately);
      }
      break;
    case "setLineWidth":
      {
        const { lineWidth } = commandMessage;
        await displayManager.setLineWidth(lineWidth, sendImmediately);
      }
      break;
    case "setRotation":
      {
        const { rotation, isRadians } = commandMessage;
        await displayManager.setRotation(rotation, isRadians, sendImmediately);
      }
      break;
    case "setSegmentStartCap":
      {
        const { segmentStartCap } = commandMessage;
        await displayManager.setSegmentStartCap(
          segmentStartCap,
          sendImmediately
        );
      }
      break;
    case "setSegmentEndCap":
      {
        const { segmentEndCap } = commandMessage;
        await displayManager.setSegmentEndCap(segmentEndCap, sendImmediately);
      }
      break;
    case "setSegmentCap":
      {
        const { segmentCap } = commandMessage;
        await displayManager.setSegmentCap(segmentCap, sendImmediately);
      }
      break;
    case "setSegmentStartRadius":
      {
        const { segmentStartRadius } = commandMessage;
        await displayManager.setSegmentStartRadius(
          segmentStartRadius,
          sendImmediately
        );
      }
      break;
    case "setSegmentEndRadius":
      {
        const { segmentEndRadius } = commandMessage;
        await displayManager.setSegmentEndRadius(
          segmentEndRadius,
          sendImmediately
        );
      }
      break;
    case "setSegmentRadius":
      {
        const { segmentRadius } = commandMessage;
        await displayManager.setSegmentRadius(segmentRadius, sendImmediately);
      }
      break;
    case "setCropTop":
      {
        const { cropTop } = commandMessage;
        await displayManager.setCropTop(cropTop, sendImmediately);
      }
      break;
    case "setCropRight":
      {
        const { cropRight } = commandMessage;
        await displayManager.setCropRight(cropRight, sendImmediately);
      }
      break;
    case "setCropBottom":
      {
        const { cropBottom } = commandMessage;
        await displayManager.setCropBottom(cropBottom, sendImmediately);
      }
      break;
    case "setCropLeft":
      {
        const { cropLeft } = commandMessage;
        await displayManager.setCropLeft(cropLeft, sendImmediately);
      }
      break;
    case "setRotationCropTop":
      {
        const { rotationCropTop } = commandMessage;
        await displayManager.setRotationCropTop(
          rotationCropTop,
          sendImmediately
        );
      }
      break;
    case "setRotationCropRight":
      {
        const { rotationCropRight } = commandMessage;
        await displayManager.setRotationCropRight(
          rotationCropRight,
          sendImmediately
        );
      }
      break;
    case "setRotationCropBottom":
      {
        const { rotationCropBottom } = commandMessage;
        await displayManager.setRotationCropBottom(
          rotationCropBottom,
          sendImmediately
        );
      }
      break;
    case "setRotationCropLeft":
      {
        const { rotationCropLeft } = commandMessage;
        await displayManager.setRotationCropLeft(
          rotationCropLeft,
          sendImmediately
        );
      }
      break;
    case "selectBitmapColor":
      {
        const { bitmapColorIndex, colorIndex } = commandMessage;
        await displayManager.selectBitmapColor(
          bitmapColorIndex,
          colorIndex,
          sendImmediately
        );
      }
      break;
    case "selectBitmapColors":
      {
        const { bitmapColorPairs } = commandMessage;
        await displayManager.selectBitmapColors(
          bitmapColorPairs,
          sendImmediately
        );
      }
      break;
    case "setBitmapScaleX":
      {
        const { bitmapScaleX } = commandMessage;
        await displayManager.setBitmapScaleX(bitmapScaleX, sendImmediately);
      }
      break;
    case "setBitmapScaleY":
      {
        const { bitmapScaleY } = commandMessage;
        await displayManager.setBitmapScaleY(bitmapScaleY, sendImmediately);
      }
      break;
    case "setBitmapScale":
      {
        const { bitmapScale } = commandMessage;
        await displayManager.setBitmapScale(bitmapScale, sendImmediately);
      }
      break;
    case "clearRect":
      {
        const { x, y, width, height } = commandMessage;
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
        const { x, y, width, height } = commandMessage;
        await displayManager.drawRect(
          x + _x,
          y + _y,
          width,
          height,
          sendImmediately
        );
      }
      break;
    case "drawRoundRect":
      {
        const { centerX, centerY, width, height, borderRadius } =
          commandMessage;
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
        const { centerX, centerY, radius } = commandMessage;
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
        const { centerX, centerY, radiusX, radiusY } = commandMessage;
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
        const { centerX, centerY, radius, numberOfSides } = commandMessage;
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
        const { startX, startY, endX, endY } = commandMessage;
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
        const { points } = commandMessage;
        await displayManager.drawSegments(
          points.map(({ x, y }) => ({ x: x + _x, y: y + _y })),
          sendImmediately
        );
      }
      break;
    case "drawArc":
      {
        const { centerX, centerY, radius, startAngle, angleOffset, isRadians } =
          commandMessage;
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
        } = commandMessage;
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
        const { centerX, centerY, bitmap } = commandMessage;
        await displayManager.drawBitmap(
          centerX + _x,
          centerY + _y,
          bitmap,
          sendImmediately
        );
      }
      break;
  }
}
