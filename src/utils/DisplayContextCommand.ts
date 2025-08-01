import {
  DisplayBitmap,
  DisplayBitmapColorPair,
  DisplaySpriteColorPair,
} from "../DisplayManager.ts";
import {
  concatenateArrayBuffers,
  UInt8ByteBuffer,
} from "./ArrayBufferUtils.ts";
import { rgbToHex, stringToRGB } from "./ColorUtils.ts";
import { createConsole } from "./Console.ts";
import { drawBitmapHeaderLength, getBitmapData } from "./DisplayBitmapUtils.ts";
import {
  DisplaySegmentCap,
  DisplaySegmentCaps,
} from "./DisplayContextState.ts";
import { DisplayManagerInterface } from "./DisplayManagerInterface.ts";
import { DisplaySpriteSheet } from "./DisplaySpriteSheetUtils.ts";
import {
  assertValidColor,
  assertValidOpacity,
  assertValidSegmentCap,
  DisplayColorRGB,
  DisplayCropDirectionToCommandType,
  displayScaleStep,
  formatRotation,
  formatScale,
  maxDisplayScale,
  roundScale,
} from "./DisplayUtils.ts";
import {
  clamp,
  degToRad,
  Int16Max,
  Int16Min,
  normalizeRadians,
  twoPi,
  Vector2,
} from "./MathUtils.ts";

const _console = createConsole("DisplayContextCommand", { log: true });

export const DisplayContextCommandTypes = [
  "show",
  "clear",

  "setColor",
  "setColorOpacity",
  "setOpacity",

  "saveContext",
  "restoreContext",

  "selectFillColor",
  "selectLineColor",
  "setLineWidth",
  "setRotation",
  "clearRotation",

  "setSegmentStartCap",
  "setSegmentEndCap",
  "setSegmentCap",

  "setSegmentStartRadius",
  "setSegmentEndRadius",
  "setSegmentRadius",

  "setCropTop",
  "setCropRight",
  "setCropBottom",
  "setCropLeft",
  "clearCrop",

  "setRotationCropTop",
  "setRotationCropRight",
  "setRotationCropBottom",
  "setRotationCropLeft",
  "clearRotationCrop",

  "selectBitmapColor",
  "selectBitmapColors",
  "setBitmapScaleX",
  "setBitmapScaleY",
  "setBitmapScale",
  "resetBitmapScale",

  "selectSpriteColor",
  "selectSpriteColors",
  "resetSpriteColors",
  "setSpriteScaleX",
  "setSpriteScaleY",
  "setSpriteScale",
  "resetSpriteScale",

  "clearRect",

  "drawRect",
  "drawRoundRect",
  "drawCircle",
  "drawEllipse",
  "drawPolygon",
  "drawSegment",
  "drawSegments",

  "drawArc",
  "drawArcEllipse",

  "drawBitmap",

  "selectSpriteSheet",
  "drawSprite",
  //"drawSprites",
] as const;
export type DisplayContextCommandType =
  (typeof DisplayContextCommandTypes)[number];

export const DisplaySpriteContextCommandTypes = [
  "selectFillColor",
  "selectLineColor",
  "setLineWidth",
  "setRotation",
  "clearRotation",

  "setSegmentStartCap",
  "setSegmentEndCap",
  "setSegmentCap",

  "setSegmentStartRadius",
  "setSegmentEndRadius",
  "setSegmentRadius",

  "setCropTop",
  "setCropRight",
  "setCropBottom",
  "setCropLeft",
  "clearCrop",

  "setRotationCropTop",
  "setRotationCropRight",
  "setRotationCropBottom",
  "setRotationCropLeft",
  "clearRotationCrop",

  "selectBitmapColor",
  "selectBitmapColors",
  "setBitmapScaleX",
  "setBitmapScaleY",
  "setBitmapScale",
  "resetBitmapScale",

  "selectSpriteColor",
  "selectSpriteColors",
  "resetSpriteColors",
  "setSpriteScaleX",
  "setSpriteScaleY",
  "setSpriteScale",
  "resetSpriteScale",

  "clearRect",

  "drawRect",
  "drawRoundRect",
  "drawCircle",
  "drawEllipse",
  "drawPolygon",
  "drawSegment",
  "drawSegments",

  "drawArc",
  "drawArcEllipse",

  "drawBitmap",
  "drawSprite",
] as const satisfies readonly DisplayContextCommandType[];
export type DisplaySpriteContextCommandType =
  (typeof DisplaySpriteContextCommandTypes)[number];

interface BaseDisplayContextCommand {
  type: DisplayContextCommandType | "runDisplayContextCommands";
}

interface SimpleDisplayCommand extends BaseDisplayContextCommand {
  type:
    | "show"
    | "clear"
    | "saveContext"
    | "restoreContext"
    | "clearRotation"
    | "clearCrop"
    | "clearRotationCrop"
    | "resetBitmapScale"
    | "resetSpriteColors"
    | "resetSpriteScale";
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

interface SetDisplaySegmentStartRadiusCommand
  extends BaseDisplayContextCommand {
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
interface SetDisplayRotationCropBottomCommand
  extends BaseDisplayContextCommand {
  type: "setRotationCropBottom";
  rotationCropBottom: number;
}
interface SetDisplayRotationCropLeftCommand extends BaseDisplayContextCommand {
  type: "setRotationCropLeft";
  rotationCropLeft: number;
}

interface SelectDisplayBitmapColorIndexCommand
  extends BaseDisplayContextCommand {
  type: "selectBitmapColor";
  bitmapColorIndex: number;
  colorIndex: number;
}
interface SelectDisplayBitmapColorIndicesCommand
  extends BaseDisplayContextCommand {
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

interface SelectDisplaySpriteColorIndexCommand
  extends BaseDisplayContextCommand {
  type: "selectSpriteColor";
  spriteColorIndex: number;
  colorIndex: number;
}
interface SelectDisplaySpriteColorIndicesCommand
  extends BaseDisplayContextCommand {
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
interface BaseCenterPositionDisplayContextCommand
  extends BaseDisplayContextCommand {
  centerX: number;
  centerY: number;
}
interface BaseSizeDisplayContextCommand extends BaseDisplayContextCommand {
  width: number;
  height: number;
}

interface BaseScaleDisplayContextCommand extends BaseDisplayContextCommand {
  scaleX: number;
  scaleY: number;
}

interface BaseDisplayRectCommand
  extends BasePositionDisplayContextCommand,
    BaseSizeDisplayContextCommand {}
interface BaseDisplayCenterRectCommand
  extends BaseCenterPositionDisplayContextCommand,
    BaseSizeDisplayContextCommand {}

interface ClearDisplayRectCommand extends BaseDisplayRectCommand {
  type: "clearRect";
}
interface DrawDisplayRectCommand extends BaseDisplayCenterRectCommand {
  type: "drawRect";
}

interface DrawDisplayRoundedRectCommand
  extends BaseCenterPositionDisplayContextCommand,
    BaseSizeDisplayContextCommand {
  type: "drawRoundRect";
  borderRadius: number;
}

interface DrawDisplayCircleCommand
  extends BaseCenterPositionDisplayContextCommand {
  type: "drawCircle";
  radius: number;
}
interface DrawDisplayEllipseCommand
  extends BaseCenterPositionDisplayContextCommand {
  type: "drawEllipse";
  radiusX: number;
  radiusY: number;
}

interface DrawDisplayPolygonCommand
  extends BaseCenterPositionDisplayContextCommand {
  type: "drawPolygon";
  radius: number;
  numberOfSides: number;
}
interface DrawDisplaySegmentCommand {
  type: "drawSegment";
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}
interface DrawDisplaySegmentsCommand {
  type: "drawSegments";
  points: Vector2[];
}

interface DrawDisplayArcCommand
  extends BaseCenterPositionDisplayContextCommand {
  type: "drawArc";
  radius: number;
  startAngle: number;
  angleOffset: number;
  isRadians?: boolean;
}
interface DrawDisplayArcEllipseCommand
  extends BaseCenterPositionDisplayContextCommand {
  type: "drawArcEllipse";
  radiusX: number;
  radiusY: number;
  startAngle: number;
  angleOffset: number;
  isRadians?: boolean;
}

interface DrawDisplayBitmapCommand
  extends BaseCenterPositionDisplayContextCommand {
  type: "drawBitmap";
  bitmap: DisplayBitmap;
}

interface SelectDisplaySpriteSheetCommand {
  type: "selectSpriteSheet";
  spriteSheetIndex: number;
}

interface DrawDisplaySpriteCommand
  extends BaseCenterPositionDisplayContextCommand {
  type: "drawSprite";
  spriteIndex: number;
  use2Bytes: boolean;
}

export type DisplayContextCommand =
  | SimpleDisplayCommand
  | SetDisplayColorCommand
  | SetDisplayColorOpacityCommand
  | SetDisplayOpacityCommand
  | SelectDisplayFillColorCommand
  | SelectDisplayLineColorCommand
  | SetDisplayLineWidthCommand
  | SetDisplayRotationCommand
  | SetDisplaySegmentStartCapCommand
  | SetDisplaySegmentEndCapCommand
  | SetDisplaySegmentCapCommand
  | SetDisplaySegmentStartRadiusCommand
  | SetDisplaySegmentEndRadiusCommand
  | SetDisplaySegmentRadiusCommand
  | SetDisplayCropTopCommand
  | SetDisplayCropRightCommand
  | SetDisplayCropBottomCommand
  | SetDisplayCropLeftCommand
  | SetDisplayRotationCropTopCommand
  | SetDisplayRotationCropRightCommand
  | SetDisplayRotationCropBottomCommand
  | SetDisplayRotationCropLeftCommand
  | SelectDisplayBitmapColorIndexCommand
  | SelectDisplayBitmapColorIndicesCommand
  | SetDisplayBitmapScaleXCommand
  | SetDisplayBitmapScaleYCommand
  | SetDisplayBitmapScaleCommand
  | SelectDisplaySpriteColorIndexCommand
  | SelectDisplaySpriteColorIndicesCommand
  | SetDisplaySpriteScaleXCommand
  | SetDisplaySpriteScaleYCommand
  | SetDisplaySpriteScaleCommand
  | ClearDisplayRectCommand
  | DrawDisplayRectCommand
  | DrawDisplayRoundedRectCommand
  | DrawDisplayCircleCommand
  | DrawDisplayEllipseCommand
  | DrawDisplayPolygonCommand
  | DrawDisplaySegmentCommand
  | DrawDisplaySegmentsCommand
  | DrawDisplayArcCommand
  | DrawDisplayArcEllipseCommand
  | DrawDisplayBitmapCommand
  | DrawDisplaySpriteCommand
  | SelectDisplaySpriteSheetCommand;

export function serializeContextCommand(
  displayManager: DisplayManagerInterface,
  command: DisplayContextCommand
) {
  let dataView: DataView | undefined;

  switch (command.type) {
    case "show":
    case "clear":
    case "saveContext":
    case "restoreContext":
    case "clearRotation":
    case "clearCrop":
    case "clearRotationCrop":
    case "resetBitmapScale":
    case "resetSpriteColors":
    case "resetSpriteScale":
      break;
    case "setColor":
      {
        const { color, colorIndex } = command;

        let colorRGB: DisplayColorRGB;
        if (typeof color == "string") {
          colorRGB = stringToRGB(color);
        } else {
          colorRGB = color;
        }
        const colorHex = rgbToHex(colorRGB);
        if (displayManager.colors[colorIndex] == colorHex) {
          _console.log(`redundant color #${colorIndex} ${colorHex}`);
          return;
        }

        _console.log(`setting color #${colorIndex}`, colorRGB);
        displayManager.assertValidColorIndex(colorIndex);
        assertValidColor(colorRGB);
        dataView = new DataView(new ArrayBuffer(4));
        dataView.setUint8(0, colorIndex);
        dataView.setUint8(1, colorRGB.r);
        dataView.setUint8(2, colorRGB.g);
        dataView.setUint8(3, colorRGB.b);
      }
      break;
    case "setColorOpacity":
      {
        const { colorIndex, opacity } = command;
        displayManager.assertValidColorIndex(colorIndex);
        assertValidOpacity(opacity);
        if (
          Math.floor(255 * displayManager.opacities[colorIndex]) ==
          Math.floor(255 * opacity)
        ) {
          _console.log(`redundant opacity #${colorIndex} ${opacity}`);
          return;
        }
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint8(0, colorIndex);
        dataView.setUint8(1, opacity * 255);
      }
      break;
    case "setOpacity":
      {
        const { opacity } = command;
        assertValidOpacity(opacity);
        dataView = new DataView(new ArrayBuffer(1));
        dataView.setUint8(0, Math.round(opacity * 255));
      }
      break;
    case "selectFillColor":
      {
        const { fillColorIndex } = command;
        displayManager.assertValidColorIndex(fillColorIndex);
        dataView = new DataView(new ArrayBuffer(1));
        dataView.setUint8(0, fillColorIndex);
      }
      break;
    case "selectLineColor":
      {
        const { lineColorIndex } = command;
        displayManager.assertValidColorIndex(lineColorIndex);
        dataView = new DataView(new ArrayBuffer(1));
        dataView.setUint8(0, lineColorIndex);
      }
      break;
    case "setLineWidth":
      {
        const { lineWidth } = command;
        displayManager.assertValidLineWidth(lineWidth);
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint16(0, lineWidth, true);
      }
      break;
    case "setRotation":
      {
        let { rotation, isRadians } = command;
        rotation = isRadians ? rotation : degToRad(rotation);
        rotation = normalizeRadians(rotation);
        isRadians = true;
        // _console.log({ rotation, isRadians });
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint16(0, formatRotation(rotation, isRadians), true);
      }
      break;
    case "setSegmentStartCap":
      {
        const { segmentStartCap } = command;
        assertValidSegmentCap(segmentStartCap);
        _console.log({ segmentStartCap });
        dataView = new DataView(new ArrayBuffer(1));
        const segmentCapEnum = DisplaySegmentCaps.indexOf(segmentStartCap);
        dataView.setUint8(0, segmentCapEnum);
      }
      break;
    case "setSegmentEndCap":
      {
        const { segmentEndCap } = command;
        assertValidSegmentCap(segmentEndCap);
        _console.log({ segmentEndCap });
        dataView = new DataView(new ArrayBuffer(1));
        const segmentCapEnum = DisplaySegmentCaps.indexOf(segmentEndCap);
        dataView.setUint8(0, segmentCapEnum);
      }
      break;
    case "setSegmentCap":
      {
        const { segmentCap } = command;
        assertValidSegmentCap(segmentCap);
        _console.log({ segmentCap });
        dataView = new DataView(new ArrayBuffer(1));
        const segmentCapEnum = DisplaySegmentCaps.indexOf(segmentCap);
        dataView.setUint8(0, segmentCapEnum);
      }
      break;
    case "setSegmentStartRadius":
      {
        const { segmentStartRadius } = command;
        _console.log({ segmentStartRadius });
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint16(0, segmentStartRadius, true);
      }
      break;
    case "setSegmentEndRadius":
      {
        const { segmentEndRadius } = command;
        _console.log({ segmentEndRadius });
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint16(0, segmentEndRadius, true);
      }
      break;
    case "setSegmentRadius":
      {
        const { segmentRadius } = command;
        _console.log({ segmentRadius });
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint16(0, segmentRadius, true);
      }
      break;
    case "setCropTop":
      {
        const { cropTop } = command;
        _console.log({ cropTop });
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint16(0, cropTop, true);
      }
      break;
    case "setCropRight":
      {
        const { cropRight } = command;
        _console.log({ cropRight });
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint16(0, cropRight, true);
      }
      break;
    case "setCropBottom":
      {
        const { cropBottom } = command;
        _console.log({ cropBottom });
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint16(0, cropBottom, true);
      }
      break;
    case "setCropLeft":
      {
        const { cropLeft } = command;
        _console.log({ cropLeft });
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint16(0, cropLeft, true);
      }
      break;
    case "setRotationCropTop":
      {
        const { rotationCropTop } = command;
        _console.log({ rotationCropTop });
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint16(0, rotationCropTop, true);
      }
      break;
    case "setRotationCropRight":
      {
        const { rotationCropRight } = command;
        _console.log({ rotationCropRight });
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint16(0, rotationCropRight, true);
      }
      break;
    case "setRotationCropBottom":
      {
        const { rotationCropBottom } = command;
        _console.log({ rotationCropBottom });
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint16(0, rotationCropBottom, true);
      }
      break;
    case "setRotationCropLeft":
      {
        const { rotationCropLeft } = command;
        _console.log({ rotationCropLeft });
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint16(0, rotationCropLeft, true);
      }
      break;
    case "selectBitmapColor":
      {
        const { bitmapColorIndex, colorIndex } = command;
        displayManager.assertValidColorIndex(bitmapColorIndex);
        displayManager.assertValidColorIndex(colorIndex);
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint8(0, bitmapColorIndex);
        dataView.setUint8(1, colorIndex);
      }
      break;
    case "selectBitmapColors":
      {
        const { bitmapColorPairs } = command;

        _console.assertRangeWithError(
          "bitmapColors",
          bitmapColorPairs.length,
          1,
          displayManager.numberOfColors
        );
        const bitmapColorIndices =
          displayManager.contextState.bitmapColorIndices.slice();
        bitmapColorPairs.forEach(({ bitmapColorIndex, colorIndex }) => {
          displayManager.assertValidColorIndex(bitmapColorIndex);
          displayManager.assertValidColorIndex(colorIndex);
          bitmapColorIndices[bitmapColorIndex] = colorIndex;
        });

        dataView = new DataView(
          new ArrayBuffer(bitmapColorPairs.length * 2 + 1)
        );
        let offset = 0;
        dataView.setUint8(offset++, bitmapColorPairs.length);
        bitmapColorPairs.forEach(({ bitmapColorIndex, colorIndex }) => {
          dataView!.setUint8(offset, bitmapColorIndex);
          dataView!.setUint8(offset + 1, colorIndex);
          offset += 2;
        });
      }
      break;
    case "setBitmapScaleX":
      {
        let { bitmapScaleX } = command;
        bitmapScaleX = clamp(bitmapScaleX, displayScaleStep, maxDisplayScale);
        bitmapScaleX = roundScale(bitmapScaleX);
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint16(0, formatScale(bitmapScaleX), true);
      }
      break;
    case "setBitmapScaleY":
      {
        let { bitmapScaleY } = command;
        bitmapScaleY = clamp(bitmapScaleY, displayScaleStep, maxDisplayScale);
        bitmapScaleY = roundScale(bitmapScaleY);
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint16(0, formatScale(bitmapScaleY), true);
      }
      break;
    case "setBitmapScale":
      {
        let { bitmapScale } = command;
        bitmapScale = clamp(bitmapScale, displayScaleStep, maxDisplayScale);
        bitmapScale = roundScale(bitmapScale);
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint16(0, formatScale(bitmapScale), true);
      }
      break;
    case "selectSpriteColor":
      {
        const { spriteColorIndex, colorIndex } = command;
        displayManager.assertValidColorIndex(spriteColorIndex);
        displayManager.assertValidColorIndex(colorIndex);
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint8(0, spriteColorIndex);
        dataView.setUint8(1, colorIndex);
      }
      break;
    case "selectSpriteColors":
      {
        const { spriteColorPairs } = command;
        _console.assertRangeWithError(
          "spriteColors",
          spriteColorPairs.length,
          1,
          displayManager.numberOfColors
        );
        const spriteColorIndices =
          displayManager.contextState.spriteColorIndices.slice();
        spriteColorPairs.forEach(({ spriteColorIndex, colorIndex }) => {
          displayManager.assertValidColorIndex(spriteColorIndex);
          displayManager.assertValidColorIndex(colorIndex);
          spriteColorIndices[spriteColorIndex] = colorIndex;
        });

        dataView = new DataView(
          new ArrayBuffer(spriteColorPairs.length * 2 + 1)
        );
        let offset = 0;
        dataView.setUint8(offset++, spriteColorPairs.length);
        spriteColorPairs.forEach(({ spriteColorIndex, colorIndex }) => {
          dataView!.setUint8(offset, spriteColorIndex);
          dataView!.setUint8(offset + 1, colorIndex);
          offset += 2;
        });
      }
      break;
    case "setSpriteScaleX":
      {
        let { spriteScaleX } = command;
        spriteScaleX = clamp(spriteScaleX, displayScaleStep, maxDisplayScale);
        spriteScaleX = roundScale(spriteScaleX);
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint16(0, formatScale(spriteScaleX), true);
      }
      break;
    case "setSpriteScaleY":
      {
        let { spriteScaleY } = command;
        spriteScaleY = clamp(spriteScaleY, displayScaleStep, maxDisplayScale);
        spriteScaleY = roundScale(spriteScaleY);
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint16(0, formatScale(spriteScaleY), true);
      }
      break;
    case "setSpriteScale":
      {
        let { spriteScale } = command;
        spriteScale = clamp(spriteScale, displayScaleStep, maxDisplayScale);
        spriteScale = roundScale(spriteScale);
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint16(0, formatScale(spriteScale), true);
      }
      break;
    case "clearRect":
      {
        const { x, y, width, height } = command;
        dataView = new DataView(new ArrayBuffer(2 * 4));
        dataView.setUint16(0, x, true);
        dataView.setUint16(2, y, true);
        dataView.setUint16(4, width, true);
        dataView.setUint16(6, height, true);
      }
      break;
    case "drawRect":
      {
        const { centerX, centerY, width, height } = command;
        dataView = new DataView(new ArrayBuffer(2 * 4));
        dataView.setInt16(0, centerX, true);
        dataView.setInt16(2, centerY, true);
        dataView.setUint16(4, width, true);
        dataView.setUint16(6, height, true);
      }
      break;
    case "drawRoundRect":
      {
        const { centerX, centerY, width, height, borderRadius } = command;
        dataView = new DataView(new ArrayBuffer(2 * 4 + 1));
        dataView.setInt16(0, centerX, true);
        dataView.setInt16(2, centerY, true);
        dataView.setUint16(4, width, true);
        dataView.setUint16(6, height, true);
        dataView.setUint8(8, borderRadius);
      }
      break;
    case "drawCircle":
      {
        const { centerX, centerY, radius } = command;
        dataView = new DataView(new ArrayBuffer(2 * 3));
        dataView.setInt16(0, centerX, true);
        dataView.setInt16(2, centerY, true);
        dataView.setUint16(4, radius, true);
      }
      break;
    case "drawEllipse":
      {
        const { centerX, centerY, radiusX, radiusY } = command;
        dataView = new DataView(new ArrayBuffer(2 * 4));
        dataView.setInt16(0, centerX, true);
        dataView.setInt16(2, centerY, true);
        dataView.setUint16(4, radiusX, true);
        dataView.setUint16(6, radiusY, true);
      }
      break;
    case "drawPolygon":
      {
        const { centerX, centerY, radius, numberOfSides } = command;
        dataView = new DataView(new ArrayBuffer(2 * 3 + 1));
        dataView.setInt16(0, centerX, true);
        dataView.setInt16(2, centerY, true);
        dataView.setUint16(4, radius, true);
        dataView.setUint8(6, numberOfSides);
      }
      break;
    case "drawSegment":
      {
        const { startX, startY, endX, endY } = command;
        dataView = new DataView(new ArrayBuffer(2 * 4));
        dataView.setInt16(0, startX, true);
        dataView.setInt16(2, startY, true);
        dataView.setInt16(4, endX, true);
        dataView.setInt16(6, endY, true);
      }
      break;
    case "drawSegments":
      {
        const { points } = command;
        _console.assertRangeWithError("numberOfPoints", points.length, 2, 255);
        const dataViewLength = 1 + points.length * 4;
        dataView = new DataView(new ArrayBuffer(dataViewLength));
        let offset = 0;
        dataView.setUint8(offset++, points.length);
        points.forEach((segment) => {
          dataView!.setInt16(offset, segment.x, true);
          offset += 2;
          dataView!.setInt16(offset, segment.y, true);
          offset += 2;
        });
      }
      break;
    case "drawArc":
      {
        let { centerX, centerY, radius, isRadians, startAngle, angleOffset } =
          command;

        startAngle = isRadians ? startAngle : degToRad(startAngle);
        startAngle = normalizeRadians(startAngle);

        angleOffset = isRadians ? angleOffset : degToRad(angleOffset);
        angleOffset = clamp(angleOffset, -twoPi, twoPi);

        angleOffset /= twoPi;
        angleOffset *= (angleOffset > 0 ? Int16Max - 1 : -Int16Min) - 1;

        isRadians = true;

        dataView = new DataView(new ArrayBuffer(2 * 5));
        dataView.setInt16(0, centerX, true);
        dataView.setInt16(2, centerY, true);
        dataView.setUint16(4, radius, true);
        dataView.setUint16(6, formatRotation(startAngle, isRadians), true);
        dataView.setInt16(8, angleOffset, true);
      }
      break;
    case "drawArcEllipse":
      {
        let {
          centerX,
          centerY,
          radiusX,
          radiusY,
          isRadians,
          startAngle,
          angleOffset,
        } = command;

        startAngle = isRadians ? startAngle : degToRad(startAngle);
        startAngle = normalizeRadians(startAngle);

        angleOffset = isRadians ? angleOffset : degToRad(angleOffset);
        angleOffset = clamp(angleOffset, -twoPi, twoPi);

        angleOffset /= twoPi;
        angleOffset *= (angleOffset > 0 ? Int16Max : -Int16Min) - 1;

        isRadians = true;

        dataView = new DataView(new ArrayBuffer(2 * 6));
        dataView.setInt16(0, centerX, true);
        dataView.setInt16(2, centerY, true);
        dataView.setUint16(4, radiusX, true);
        dataView.setUint16(6, radiusY, true);
        dataView.setUint16(8, formatRotation(startAngle, isRadians), true);
        dataView.setUint16(10, angleOffset, true);
      }
      break;
    case "drawBitmap":
      {
        const { bitmap, centerX, centerY } = command;
        displayManager.assertValidBitmap(bitmap);
        dataView = new DataView(new ArrayBuffer(drawBitmapHeaderLength));
        dataView.setInt16(0, centerX, true);
        dataView.setInt16(2, centerY, true);
        dataView.setUint16(4, bitmap.width, true);
        dataView.setUint16(6, bitmap.pixels.length, true);
        dataView.setUint8(8, bitmap.numberOfColors);

        const bitmapData = getBitmapData(bitmap);
        dataView.setUint16(9, bitmapData.byteLength, true);
        const buffer = concatenateArrayBuffers(dataView, bitmapData);
        dataView = new DataView(buffer);
      }
      break;
    case "selectSpriteSheet":
      {
        const { spriteSheetIndex } = command;
        dataView = new DataView(new ArrayBuffer(1));
        dataView.setUint8(0, spriteSheetIndex);
      }
      break;
    case "drawSprite":
      {
        const { centerX, centerY, spriteIndex, use2Bytes } = command;
        dataView = new DataView(new ArrayBuffer(1 + 2 * 2));
        let offset = 0;
        dataView.setUint16(offset, centerX, true);
        offset += 2;
        dataView.setUint16(offset, centerY, true);
        offset += 2;
        if (use2Bytes) {
          dataView.setUint16(offset, spriteIndex, true);
          offset += 2;
        } else {
          dataView.setUint8(offset++, spriteIndex!);
        }
      }
      break;
  }

  return dataView;
}
export function serializeContextCommands(
  displayManager: DisplayManagerInterface,
  commands: DisplayContextCommand[]
) {
  const serializedContextCommandArray = commands.map((command) => {
    const displayContextCommandEnum = DisplayContextCommandTypes.indexOf(
      command.type
    );
    const serializedContextCommand = serializeContextCommand(
      displayManager,
      command
    );
    return concatenateArrayBuffers(
      UInt8ByteBuffer(displayContextCommandEnum),
      serializedContextCommand
    );
  });
  const serializedContextCommands = concatenateArrayBuffers(
    serializedContextCommandArray
  );
  _console.log(
    "serializedContextCommands",
    commands,
    serializedContextCommandArray,
    serializedContextCommands
  );
  return serializedContextCommands;
}
