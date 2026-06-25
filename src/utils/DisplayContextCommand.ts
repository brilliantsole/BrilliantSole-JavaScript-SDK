import {
  DisplayBezierCurve,
  DisplayBezierCurveType,
  DisplayBezierCurveTypes,
  DisplayBitmap,
  DisplayBitmapColorPair,
  displayCurveTypeBitWidth,
  DisplayPointDataTypes,
  displayCurveTypesPerByte,
  DisplaySpriteColorPair,
  DisplayWireframe,
  DisplayWireframeEdge,
  displayPointDataTypeToSize,
} from "../DisplayManager.ts";
import {
  concatenateArrayBuffers,
  UInt8ByteBuffer,
} from "./ArrayBufferUtils.ts";
import { rgbToHex, stringToRGB } from "./ColorUtils.ts";
import { createConsole } from "./Console.ts";
import {
  drawBitmapHeaderLength,
  getBitmapData,
  parseBitmap,
} from "./DisplayBitmapUtils.ts";
import {
  DisplayAlignment,
  DisplayAlignments,
  DisplayDirection,
  DisplayDirections,
  DisplaySegmentCap,
  DisplaySegmentCaps,
} from "./DisplayContextState.ts";
import { DisplayManagerInterface } from "./DisplayManagerInterface.ts";
import {
  DisplaySpriteSerializedLine,
  DisplaySpriteSerializedLines,
} from "./DisplaySpriteSheetUtils.ts";
import {
  assertValidAlignment,
  assertValidColor,
  assertValidDirection,
  assertValidPathNumberOfControlPoints,
  assertValidNumberOfControlPoints,
  assertValidOpacity,
  assertValidPath,
  assertValidSegmentCap,
  assertValidWireframe,
  DisplayColorRGB,
  formatRotation,
  formatScale,
  maxDisplayScale,
  minDisplayScale,
  roundScale,
  serializePoints,
  getPointDataType,
  DisplayColorRGBOrString,
  parseRotation,
  parseScale,
  parsePoints,
  getNumberOfConrolPoints,
} from "./DisplayUtils.ts";
import { clamp, degToRad, normalizeRadians, Vector2 } from "./MathUtils.ts";
import { deepEqual } from "./ObjectUtils.ts";

const _console = createConsole("DisplayContextCommand", { log: false });

export const DisplayContextCommandTypes = [
  "show",
  "clear",

  "setColor",
  "setColorOpacity",
  "setOpacity",

  "saveContext",
  "restoreContext",

  "selectBackgroundColor",
  "selectFillColor",
  "selectLineColor",

  "setIgnoreFill",
  "setIgnoreLine",
  "setFillBackground",

  "setLineWidth",
  "setRotation",
  "clearRotation",

  "setHorizontalAlignment",
  "setVerticalAlignment",
  "resetAlignment",

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

  "setSpritesLineHeight",
  "setSpritesDirection",
  "setSpritesLineDirection",
  "setSpritesSpacing",
  "setSpritesLineSpacing",
  "setSpritesAlignment",
  "setSpritesLineAlignment",

  "clearRect",

  "drawRect",
  "drawRoundRect",

  "drawCircle",
  "drawArc",

  "drawEllipse",
  "drawArcEllipse",

  "drawSegment",
  "drawSegments",

  "drawRegularPolygon",
  "drawPolygon",

  "drawWireframe",

  "drawQuadraticBezierCurve",
  "drawQuadraticBezierCurves",
  "drawCubicBezierCurve",
  "drawCubicBezierCurves",

  "drawPath",
  "drawClosedPath",

  "drawBitmap",

  "selectSpriteSheet",
  "drawSprite",
  "drawSprites",

  "startSprite",
  "endSprite",

  "clearContext",
] as const;
export type DisplayContextCommandType =
  (typeof DisplayContextCommandTypes)[number];

export const DisplaySpriteContextCommandTypes = [
  "selectFillColor",
  "selectLineColor",
  // "selectBackgroundColor",

  "setIgnoreFill",
  "setIgnoreLine",
  // "setFillBackground",

  "setLineWidth",
  "setRotation",
  "clearRotation",

  "setVerticalAlignment",
  "setHorizontalAlignment",
  "resetAlignment",

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

  "drawRegularPolygon",
  "drawPolygon",

  "drawWireframe",

  "drawQuadraticBezierCurve",
  "drawQuadraticBezierCurves",
  "drawCubicBezierCurve",
  "drawCubicBezierCurves",

  "drawPath",
  "drawClosedPath",

  "drawSegment",
  "drawSegments",

  "drawArc",
  "drawArcEllipse",

  "drawBitmap",
  "drawSprite",
] as const satisfies readonly DisplayContextCommandType[];
export type DisplaySpriteContextCommandType =
  (typeof DisplaySpriteContextCommandTypes)[number];

export interface BaseDisplayContextCommand {
  type: DisplayContextCommandType | "runDisplayContextCommands";
  hide?: boolean;
}

export interface SimpleDisplayCommand extends BaseDisplayContextCommand {
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
    | "resetSpriteScale"
    | "resetAlignment"
    | "endSprite"
    | "clearContext";
}

export interface SetDisplayColorCommand extends BaseDisplayContextCommand {
  type: "setColor";
  colorIndex: number;
  color: DisplayColorRGBOrString;
}
export interface SetDisplayColorOpacityCommand extends BaseDisplayContextCommand {
  type: "setColorOpacity";
  colorIndex: number;
  opacity: number;
}
export interface SetDisplayOpacityCommand extends BaseDisplayContextCommand {
  type: "setOpacity";
  opacity: number;
}

export interface SetDisplayHorizontalAlignmentCommand extends BaseDisplayContextCommand {
  type: "setHorizontalAlignment";
  horizontalAlignment: DisplayAlignment;
}
export interface SetDisplayVerticalAlignmentCommand extends BaseDisplayContextCommand {
  type: "setVerticalAlignment";
  verticalAlignment: DisplayAlignment;
}

export interface SelectDisplayBackgroundColorCommand extends BaseDisplayContextCommand {
  type: "selectBackgroundColor";
  backgroundColorIndex: number;
}
export interface SelectDisplayFillColorCommand extends BaseDisplayContextCommand {
  type: "selectFillColor";
  fillColorIndex: number;
}
export interface SelectDisplayLineColorCommand extends BaseDisplayContextCommand {
  type: "selectLineColor";
  lineColorIndex: number;
}
export interface SelectDisplayIgnoreFillCommand extends BaseDisplayContextCommand {
  type: "setIgnoreFill";
  ignoreFill: boolean;
}
export interface SelectDisplayIgnoreLineCommand extends BaseDisplayContextCommand {
  type: "setIgnoreLine";
  ignoreLine: boolean;
}
export interface SelectDisplayFillBackgroundCommand extends BaseDisplayContextCommand {
  type: "setFillBackground";
  fillBackground: boolean;
}
export interface SetDisplayLineWidthCommand extends BaseDisplayContextCommand {
  type: "setLineWidth";
  lineWidth: number;
}
export interface SetDisplayRotationCommand extends BaseDisplayContextCommand {
  type: "setRotation";
  rotation: number;
  isRadians?: boolean;
}

export interface SetDisplaySegmentStartCapCommand extends BaseDisplayContextCommand {
  type: "setSegmentStartCap";
  segmentStartCap: DisplaySegmentCap;
}
export interface SetDisplaySegmentEndCapCommand extends BaseDisplayContextCommand {
  type: "setSegmentEndCap";
  segmentEndCap: DisplaySegmentCap;
}
export interface SetDisplaySegmentCapCommand extends BaseDisplayContextCommand {
  type: "setSegmentCap";
  segmentCap: DisplaySegmentCap;
}

export interface SetDisplaySegmentStartRadiusCommand extends BaseDisplayContextCommand {
  type: "setSegmentStartRadius";
  segmentStartRadius: number;
}
export interface SetDisplaySegmentEndRadiusCommand extends BaseDisplayContextCommand {
  type: "setSegmentEndRadius";
  segmentEndRadius: number;
}
export interface SetDisplaySegmentRadiusCommand extends BaseDisplayContextCommand {
  type: "setSegmentRadius";
  segmentRadius: number;
}

export interface SetDisplayCropTopCommand extends BaseDisplayContextCommand {
  type: "setCropTop";
  cropTop: number;
}
export interface SetDisplayCropRightCommand extends BaseDisplayContextCommand {
  type: "setCropRight";
  cropRight: number;
}
export interface SetDisplayCropBottomCommand extends BaseDisplayContextCommand {
  type: "setCropBottom";
  cropBottom: number;
}
export interface SetDisplayCropLeftCommand extends BaseDisplayContextCommand {
  type: "setCropLeft";
  cropLeft: number;
}

export interface SetDisplayRotationCropTopCommand extends BaseDisplayContextCommand {
  type: "setRotationCropTop";
  rotationCropTop: number;
}
export interface SetDisplayRotationCropRightCommand extends BaseDisplayContextCommand {
  type: "setRotationCropRight";
  rotationCropRight: number;
}
export interface SetDisplayRotationCropBottomCommand extends BaseDisplayContextCommand {
  type: "setRotationCropBottom";
  rotationCropBottom: number;
}
export interface SetDisplayRotationCropLeftCommand extends BaseDisplayContextCommand {
  type: "setRotationCropLeft";
  rotationCropLeft: number;
}

export interface SelectDisplayBitmapColorIndexCommand extends BaseDisplayContextCommand {
  type: "selectBitmapColor";
  bitmapColorIndex: number;
  colorIndex: number;
}
export interface SelectDisplayBitmapColorIndicesCommand extends BaseDisplayContextCommand {
  type: "selectBitmapColors";
  bitmapColorPairs: DisplayBitmapColorPair[];
}

export interface SetDisplayBitmapScaleXCommand extends BaseDisplayContextCommand {
  type: "setBitmapScaleX";
  bitmapScaleX: number;
}
export interface SetDisplayBitmapScaleYCommand extends BaseDisplayContextCommand {
  type: "setBitmapScaleY";
  bitmapScaleY: number;
}
export interface SetDisplayBitmapScaleCommand extends BaseDisplayContextCommand {
  type: "setBitmapScale";
  bitmapScale: number;
}

export interface SelectDisplaySpriteColorIndexCommand extends BaseDisplayContextCommand {
  type: "selectSpriteColor";
  spriteColorIndex: number;
  colorIndex: number;
}
export interface SelectDisplaySpriteColorIndicesCommand extends BaseDisplayContextCommand {
  type: "selectSpriteColors";
  spriteColorPairs: DisplaySpriteColorPair[];
}

export interface SetDisplaySpriteScaleXCommand extends BaseDisplayContextCommand {
  type: "setSpriteScaleX";
  spriteScaleX: number;
}
export interface SetDisplaySpriteScaleYCommand extends BaseDisplayContextCommand {
  type: "setSpriteScaleY";
  spriteScaleY: number;
}
export interface SetDisplaySpriteScaleCommand extends BaseDisplayContextCommand {
  type: "setSpriteScale";
  spriteScale: number;
}

export interface SetDisplaySpritesLineHeightCommand extends BaseDisplayContextCommand {
  type: "setSpritesLineHeight";
  spritesLineHeight: number;
}

export interface SetDisplaySpritesDirectionCommand extends BaseDisplayContextCommand {
  type: "setSpritesDirection";
  spritesDirection: DisplayDirection;
}
export interface SetDisplaySpritesLineDirectionCommand extends BaseDisplayContextCommand {
  type: "setSpritesLineDirection";
  spritesLineDirection: DisplayDirection;
}

export interface SetDisplaySpritesSpacingCommand extends BaseDisplayContextCommand {
  type: "setSpritesSpacing";
  spritesSpacing: number;
}
export interface SetDisplaySpritesLineSpacingCommand extends BaseDisplayContextCommand {
  type: "setSpritesLineSpacing";
  spritesLineSpacing: number;
}

export interface SetDisplaySpritesAlignmentCommand extends BaseDisplayContextCommand {
  type: "setSpritesAlignment";
  spritesAlignment: DisplayAlignment;
}
export interface SetDisplaySpritesLineAlignmentCommand extends BaseDisplayContextCommand {
  type: "setSpritesLineAlignment";
  spritesLineAlignment: DisplayAlignment;
}

export interface BasePositionDisplayContextCommand extends BaseDisplayContextCommand {
  x: number;
  y: number;
}
export interface BaseOffsetPositionDisplayContextCommand extends BaseDisplayContextCommand {
  offsetX: number;
  offsetY: number;
}
export interface BaseSizeDisplayContextCommand extends BaseDisplayContextCommand {
  width: number;
  height: number;
}

export interface BaseDisplayRectCommand
  extends BasePositionDisplayContextCommand, BaseSizeDisplayContextCommand {}
export interface BaseDisplayCenterRectCommand
  extends
    BaseOffsetPositionDisplayContextCommand,
    BaseSizeDisplayContextCommand {}

export interface ClearDisplayRectCommand extends BaseDisplayRectCommand {
  type: "clearRect";
}
export interface DrawDisplayRectCommand extends BaseDisplayCenterRectCommand {
  type: "drawRect";
}

export interface DrawDisplayRoundedRectCommand
  extends
    BaseOffsetPositionDisplayContextCommand,
    BaseSizeDisplayContextCommand {
  type: "drawRoundRect";
  borderRadius: number;
}

export interface DrawDisplayCircleCommand extends BaseOffsetPositionDisplayContextCommand {
  type: "drawCircle";
  radius: number;
}
export interface DrawDisplayEllipseCommand extends BaseOffsetPositionDisplayContextCommand {
  type: "drawEllipse";
  radiusX: number;
  radiusY: number;
}

export interface DrawDisplayRegularPolygonCommand extends BaseOffsetPositionDisplayContextCommand {
  type: "drawRegularPolygon";
  radius: number;
  numberOfSides: number;
}
export interface DrawDisplayPolygonCommand extends BaseDisplayContextCommand {
  type: "drawPolygon";
  points: Vector2[];
}
export interface DrawDisplaySegmentCommand extends BaseDisplayContextCommand {
  type: "drawSegment";
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}
export interface DrawDisplaySegmentsCommand extends BaseDisplayContextCommand {
  type: "drawSegments";
  points: Vector2[];
}

export interface DrawDisplayBezierCurveCommand extends BaseDisplayContextCommand {
  type:
    | "drawQuadraticBezierCurve"
    | "drawQuadraticBezierCurves"
    | "drawCubicBezierCurve"
    | "drawCubicBezierCurves";
  controlPoints: Vector2[];
}

export interface DrawDisplayPathCommand extends BaseDisplayContextCommand {
  type: "drawPath" | "drawClosedPath";
  curves: DisplayBezierCurve[];
}

export interface DrawDisplayWireframeCommand extends BaseDisplayContextCommand {
  type: "drawWireframe";
  wireframe: DisplayWireframe;
}

export interface DrawDisplayArcCommand extends BaseOffsetPositionDisplayContextCommand {
  type: "drawArc";
  radius: number;
  startAngle: number;
  angleOffset: number;
  isRadians?: boolean;
}
export interface DrawDisplayArcEllipseCommand extends BaseOffsetPositionDisplayContextCommand {
  type: "drawArcEllipse";
  radiusX: number;
  radiusY: number;
  startAngle: number;
  angleOffset: number;
  isRadians?: boolean;
}

export interface DrawDisplayBitmapCommand extends BaseOffsetPositionDisplayContextCommand {
  type: "drawBitmap";
  bitmap: DisplayBitmap;
}

export interface SelectDisplaySpriteSheetCommand extends BaseDisplayContextCommand {
  type: "selectSpriteSheet";
  spriteSheetIndex: number;
}

export interface DrawDisplaySpriteCommand extends BaseOffsetPositionDisplayContextCommand {
  type: "drawSprite";
  spriteIndex: number;
  use2Bytes: boolean;
}

export interface DrawDisplaySpritesCommand extends BaseOffsetPositionDisplayContextCommand {
  type: "drawSprites";
  spriteSerializedLines: DisplaySpriteSerializedLines;
}

export interface StartDisplaySpriteCommand extends BaseDisplayCenterRectCommand {
  type: "startSprite";
}

export type DisplayContextCommand =
  | SimpleDisplayCommand
  | SetDisplayColorCommand
  | SetDisplayColorOpacityCommand
  | SetDisplayOpacityCommand
  | SelectDisplayBackgroundColorCommand
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
  | DrawDisplayRegularPolygonCommand
  | DrawDisplayPolygonCommand
  | DrawDisplaySegmentCommand
  | DrawDisplaySegmentsCommand
  | DrawDisplayArcCommand
  | DrawDisplayArcEllipseCommand
  | DrawDisplayBitmapCommand
  | DrawDisplaySpriteCommand
  | DrawDisplaySpritesCommand
  | SelectDisplaySpriteSheetCommand
  | SetDisplayHorizontalAlignmentCommand
  | SetDisplayVerticalAlignmentCommand
  | SetDisplaySpritesDirectionCommand
  | SetDisplaySpritesLineDirectionCommand
  | SetDisplaySpritesSpacingCommand
  | SetDisplaySpritesLineSpacingCommand
  | SetDisplaySpritesAlignmentCommand
  | SetDisplaySpritesLineAlignmentCommand
  | SetDisplaySpritesLineHeightCommand
  | DrawDisplayWireframeCommand
  | DrawDisplayBezierCurveCommand
  | DrawDisplayPathCommand
  | SelectDisplayIgnoreFillCommand
  | SelectDisplayIgnoreLineCommand
  | SelectDisplayFillBackgroundCommand
  | StartDisplaySpriteCommand;

export function serializeDisplayContextCommandData(
  displayManager: DisplayManagerInterface,
  command: DisplayContextCommand,
) {
  let dataView: DataView<ArrayBuffer> | undefined;

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
    case "resetAlignment":
    case "endSprite":
    case "clearContext":
      break;
    case "setColor":
      {
        const { color, colorIndex } = command;
        displayManager.assertValidColorIndex(colorIndex);

        let colorRGB: DisplayColorRGB;
        if (typeof color == "string") {
          colorRGB = stringToRGB(color);
        } else {
          colorRGB = color;
        }
        //_console.log(`setting color #${colorIndex}`, colorRGB);
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
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint8(0, colorIndex);
        dataView.setUint8(1, Math.round(opacity * 255));
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
    case "selectBackgroundColor":
      {
        const { backgroundColorIndex } = command;
        displayManager.assertValidColorIndex(backgroundColorIndex);
        dataView = new DataView(new ArrayBuffer(1));
        dataView.setUint8(0, backgroundColorIndex);
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
    case "setIgnoreFill":
      {
        const { ignoreFill } = command;
        dataView = new DataView(new ArrayBuffer(1));
        dataView.setUint8(0, ignoreFill ? 1 : 0);
      }
      break;
    case "setIgnoreLine":
      {
        const { ignoreLine } = command;
        dataView = new DataView(new ArrayBuffer(1));
        dataView.setUint8(0, ignoreLine ? 1 : 0);
      }
      break;
    case "setFillBackground":
      {
        const { fillBackground } = command;
        dataView = new DataView(new ArrayBuffer(1));
        dataView.setUint8(0, fillBackground ? 1 : 0);
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
    case "setHorizontalAlignment":
      {
        const { horizontalAlignment } = command;
        assertValidAlignment(horizontalAlignment);
        //_console.log({ horizontalAlignment });
        dataView = new DataView(new ArrayBuffer(1));
        const alignmentEnum = DisplayAlignments.indexOf(horizontalAlignment);
        dataView.setUint8(0, alignmentEnum);
      }
      break;
    case "setVerticalAlignment":
      {
        const { verticalAlignment } = command;
        assertValidAlignment(verticalAlignment);
        //_console.log({ verticalAlignment });
        dataView = new DataView(new ArrayBuffer(1));
        const alignmentEnum = DisplayAlignments.indexOf(verticalAlignment);
        dataView.setUint8(0, alignmentEnum);
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
        //_console.log({ segmentStartCap });
        dataView = new DataView(new ArrayBuffer(1));
        const segmentCapEnum = DisplaySegmentCaps.indexOf(segmentStartCap);
        dataView.setUint8(0, segmentCapEnum);
      }
      break;
    case "setSegmentEndCap":
      {
        const { segmentEndCap } = command;
        assertValidSegmentCap(segmentEndCap);
        //_console.log({ segmentEndCap });
        dataView = new DataView(new ArrayBuffer(1));
        const segmentCapEnum = DisplaySegmentCaps.indexOf(segmentEndCap);
        dataView.setUint8(0, segmentCapEnum);
      }
      break;
    case "setSegmentCap":
      {
        const { segmentCap } = command;
        assertValidSegmentCap(segmentCap);
        //_console.log({ segmentCap });
        dataView = new DataView(new ArrayBuffer(1));
        const segmentCapEnum = DisplaySegmentCaps.indexOf(segmentCap);
        dataView.setUint8(0, segmentCapEnum);
      }
      break;
    case "setSegmentStartRadius":
      {
        const { segmentStartRadius } = command;
        //_console.log({ segmentStartRadius });
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint16(0, segmentStartRadius, true);
      }
      break;
    case "setSegmentEndRadius":
      {
        const { segmentEndRadius } = command;
        //_console.log({ segmentEndRadius });
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint16(0, segmentEndRadius, true);
      }
      break;
    case "setSegmentRadius":
      {
        const { segmentRadius } = command;
        //_console.log({ segmentRadius });
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint16(0, segmentRadius, true);
      }
      break;
    case "setCropTop":
      {
        const { cropTop } = command;
        //_console.log({ cropTop });
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint16(0, cropTop, true);
      }
      break;
    case "setCropRight":
      {
        const { cropRight } = command;
        //_console.log({ cropRight });
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint16(0, cropRight, true);
      }
      break;
    case "setCropBottom":
      {
        const { cropBottom } = command;
        //_console.log({ cropBottom });
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint16(0, cropBottom, true);
      }
      break;
    case "setCropLeft":
      {
        const { cropLeft } = command;
        //_console.log({ cropLeft });
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint16(0, cropLeft, true);
      }
      break;
    case "setRotationCropTop":
      {
        const { rotationCropTop } = command;
        // _console.log({ rotationCropTop });
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint16(0, rotationCropTop, true);
      }
      break;
    case "setRotationCropRight":
      {
        const { rotationCropRight } = command;
        //_console.log({ rotationCropRight });
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint16(0, rotationCropRight, true);
      }
      break;
    case "setRotationCropBottom":
      {
        const { rotationCropBottom } = command;
        //_console.log({ rotationCropBottom });
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint16(0, rotationCropBottom, true);
      }
      break;
    case "setRotationCropLeft":
      {
        const { rotationCropLeft } = command;
        //_console.log({ rotationCropLeft });
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
          displayManager.numberOfColors,
        );
        const bitmapColorIndices =
          displayManager.contextState.bitmapColorIndices.slice();
        bitmapColorPairs.forEach(({ bitmapColorIndex, colorIndex }) => {
          displayManager.assertValidColorIndex(bitmapColorIndex);
          displayManager.assertValidColorIndex(colorIndex);
          bitmapColorIndices[bitmapColorIndex] = colorIndex;
        });

        dataView = new DataView(
          new ArrayBuffer(bitmapColorPairs.length * 2 + 1),
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
        bitmapScaleX = clamp(bitmapScaleX, minDisplayScale, maxDisplayScale);
        bitmapScaleX = roundScale(bitmapScaleX);
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setInt16(0, formatScale(bitmapScaleX), true);
      }
      break;
    case "setBitmapScaleY":
      {
        let { bitmapScaleY } = command;
        bitmapScaleY = clamp(bitmapScaleY, minDisplayScale, maxDisplayScale);
        bitmapScaleY = roundScale(bitmapScaleY);
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setInt16(0, formatScale(bitmapScaleY), true);
      }
      break;
    case "setBitmapScale":
      {
        let { bitmapScale } = command;
        bitmapScale = clamp(bitmapScale, minDisplayScale, maxDisplayScale);
        bitmapScale = roundScale(bitmapScale);
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setInt16(0, formatScale(bitmapScale), true);
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
          displayManager.numberOfColors,
        );
        const spriteColorIndices =
          displayManager.contextState.spriteColorIndices.slice();
        spriteColorPairs.forEach(({ spriteColorIndex, colorIndex }) => {
          displayManager.assertValidColorIndex(spriteColorIndex);
          displayManager.assertValidColorIndex(colorIndex);
          spriteColorIndices[spriteColorIndex] = colorIndex;
        });

        dataView = new DataView(
          new ArrayBuffer(spriteColorPairs.length * 2 + 1),
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
        spriteScaleX = clamp(spriteScaleX, minDisplayScale, maxDisplayScale);
        spriteScaleX = roundScale(spriteScaleX);
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setInt16(0, formatScale(spriteScaleX), true);
      }
      break;
    case "setSpriteScaleY":
      {
        let { spriteScaleY } = command;
        spriteScaleY = clamp(spriteScaleY, minDisplayScale, maxDisplayScale);
        spriteScaleY = roundScale(spriteScaleY);
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setInt16(0, formatScale(spriteScaleY), true);
      }
      break;
    case "setSpriteScale":
      {
        let { spriteScale } = command;
        spriteScale = clamp(spriteScale, minDisplayScale, maxDisplayScale);
        spriteScale = roundScale(spriteScale);
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setInt16(0, formatScale(spriteScale), true);
      }
      break;
    case "setSpritesLineHeight":
      {
        const { spritesLineHeight } = command;
        displayManager.assertValidLineWidth(spritesLineHeight);
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint16(0, spritesLineHeight, true);
      }
      break;
    case "setSpritesDirection":
      {
        const { spritesDirection } = command;
        assertValidDirection(spritesDirection);
        _console.log({ spritesDirection });
        dataView = new DataView(new ArrayBuffer(1));
        const alignmentEnum = DisplayDirections.indexOf(spritesDirection);
        dataView.setUint8(0, alignmentEnum);
      }
      break;
    case "setSpritesLineDirection":
      {
        const { spritesLineDirection } = command;
        assertValidDirection(spritesLineDirection);
        _console.log({ spritesLineDirection });
        dataView = new DataView(new ArrayBuffer(1));
        const alignmentEnum = DisplayDirections.indexOf(spritesLineDirection);
        dataView.setUint8(0, alignmentEnum);
      }
      break;
    case "setSpritesSpacing":
      {
        const { spritesSpacing } = command;
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setInt16(0, spritesSpacing, true);
      }
      break;
    case "setSpritesLineSpacing":
      {
        const { spritesLineSpacing } = command;
        dataView = new DataView(new ArrayBuffer(2));
        dataView.setInt16(0, spritesLineSpacing, true);
      }
      break;
    case "setSpritesAlignment":
      {
        const { spritesAlignment } = command;
        assertValidAlignment(spritesAlignment);
        _console.log({ spritesAlignment });
        dataView = new DataView(new ArrayBuffer(1));
        const alignmentEnum = DisplayAlignments.indexOf(spritesAlignment);
        dataView.setUint8(0, alignmentEnum);
      }
      break;
    case "setSpritesLineAlignment":
      {
        const { spritesLineAlignment } = command;
        assertValidAlignment(spritesLineAlignment);
        _console.log({ spritesLineAlignment });
        dataView = new DataView(new ArrayBuffer(1));
        const alignmentEnum = DisplayAlignments.indexOf(spritesLineAlignment);
        dataView.setUint8(0, alignmentEnum);
      }
      break;
    case "clearRect":
      {
        const { x, y, width, height } = command;
        dataView = new DataView(new ArrayBuffer(2 * 4));
        dataView.setInt16(0, x, true);
        dataView.setInt16(2, y, true);
        dataView.setUint16(4, width, true);
        dataView.setUint16(6, height, true);
      }
      break;
    case "drawRect":
      {
        const { offsetX, offsetY, width, height } = command;
        dataView = new DataView(new ArrayBuffer(2 * 4));
        dataView.setInt16(0, offsetX, true);
        dataView.setInt16(2, offsetY, true);
        dataView.setUint16(4, width, true);
        dataView.setUint16(6, height, true);
      }
      break;
    case "drawRoundRect":
      {
        const { offsetX, offsetY, width, height, borderRadius } = command;
        dataView = new DataView(new ArrayBuffer(2 * 4 + 1));
        dataView.setInt16(0, offsetX, true);
        dataView.setInt16(2, offsetY, true);
        dataView.setUint16(4, width, true);
        dataView.setUint16(6, height, true);
        dataView.setUint8(8, borderRadius);
      }
      break;
    case "drawCircle":
      {
        const { offsetX, offsetY, radius } = command;
        dataView = new DataView(new ArrayBuffer(2 * 3));
        dataView.setInt16(0, offsetX, true);
        dataView.setInt16(2, offsetY, true);
        dataView.setUint16(4, radius, true);
      }
      break;
    case "drawEllipse":
      {
        const { offsetX, offsetY, radiusX, radiusY } = command;
        dataView = new DataView(new ArrayBuffer(2 * 4));
        dataView.setInt16(0, offsetX, true);
        dataView.setInt16(2, offsetY, true);
        dataView.setUint16(4, radiusX, true);
        dataView.setUint16(6, radiusY, true);
      }
      break;
    case "drawRegularPolygon":
      {
        const { offsetX, offsetY, radius, numberOfSides } = command;
        dataView = new DataView(new ArrayBuffer(2 * 3 + 1));
        dataView.setInt16(0, offsetX, true);
        dataView.setInt16(2, offsetY, true);
        dataView.setUint16(4, radius, true);
        dataView.setUint8(6, numberOfSides);
      }
      break;
    case "drawPolygon":
      {
        const { points } = command;
        _console.assertRangeWithError("numberOfPoints", points.length, 2, 255);
        dataView = serializePoints(points);
      }
      break;
    case "drawWireframe":
      {
        const { wireframe } = command;
        const { points, edges } = wireframe;
        if (wireframe.points.length == 0) {
          return;
        }
        assertValidWireframe(wireframe);
        // [pointDataType, numberOfPoints, ...points, numberOfEdges, ...edges]
        const pointsDataView = serializePoints(points);

        const edgesDataView = new DataView(
          new ArrayBuffer(1 + 2 * edges.length),
        );
        let edgesDataOffset = 0;
        edgesDataView.setUint8(edgesDataOffset++, edges.length);
        edges.forEach((edge) => {
          edgesDataView.setUint8(edgesDataOffset++, edge.startIndex);
          edgesDataView.setUint8(edgesDataOffset++, edge.endIndex);
        });

        dataView = new DataView(
          concatenateArrayBuffers(pointsDataView, edgesDataView),
        );
      }
      break;
    case "drawQuadraticBezierCurve":
    case "drawCubicBezierCurve":
      {
        const { controlPoints } = command;
        const curveType: DisplayBezierCurveType =
          command.type == "drawCubicBezierCurve" ? "cubic" : "quadratic";
        assertValidNumberOfControlPoints(curveType, controlPoints);
        dataView = new DataView(new ArrayBuffer(4 * controlPoints.length));
        let offset = 0;
        controlPoints.forEach((controlPoint) => {
          dataView!.setInt16(offset, controlPoint.x, true);
          offset += 2;
          dataView!.setInt16(offset, controlPoint.y, true);
          offset += 2;
        });
      }
      break;
    case "drawQuadraticBezierCurves":
    case "drawCubicBezierCurves":
      {
        const { controlPoints } = command;
        const curveType: DisplayBezierCurveType =
          command.type == "drawCubicBezierCurves" ? "cubic" : "quadratic";
        assertValidPathNumberOfControlPoints(curveType, controlPoints);
        dataView = serializePoints(controlPoints);
      }
      break;
    case "drawPath":
    case "drawClosedPath":
      {
        const { curves } = command;
        // _console.log("curves", curves);
        assertValidPath(curves);
        const typesDataView = new DataView(
          new ArrayBuffer(Math.ceil(curves.length / displayCurveTypesPerByte)),
        );
        // _console.log({ "curves.length": curves.length, typesDataView });
        const controlPointsDataViews: DataView[] = [];

        // [pointDataType, numberOfCurves, numberOfPoints, ...curveTypes, ...points]

        const allControlPoints: Vector2[] = [];
        curves.forEach((curve) => {
          allControlPoints.push(...curve.controlPoints);
        });
        const pointDataType = getPointDataType(allControlPoints);
        const numberOfControlPoints = allControlPoints.length;
        //_console.log({ numberOfControlPoints });

        curves.forEach((curve, index) => {
          const { type, controlPoints } = curve;
          const typeByteIndex = Math.floor(index / displayCurveTypesPerByte);
          const typeBitShift =
            (index % displayCurveTypesPerByte) * displayCurveTypeBitWidth;
          // _console.log({ type, typeByteIndex, typeBitShift });
          let typeValue = typesDataView.getUint8(typeByteIndex) || 0;
          typeValue |= DisplayBezierCurveTypes.indexOf(type) << typeBitShift;
          typesDataView.setUint8(typeByteIndex, typeValue);

          const controlPointsDataView = serializePoints(
            controlPoints,
            pointDataType,
            true,
          );
          controlPointsDataViews.push(controlPointsDataView);
        });

        const controlPointsBuffer = concatenateArrayBuffers(
          ...controlPointsDataViews,
        );
        const headerDataView = new DataView(new ArrayBuffer(3));
        headerDataView.setUint8(
          0,
          DisplayPointDataTypes.indexOf(pointDataType),
        );
        headerDataView.setUint8(1, curves.length);
        headerDataView.setUint8(2, numberOfControlPoints);
        dataView = new DataView(
          concatenateArrayBuffers(
            headerDataView,
            typesDataView,
            controlPointsBuffer,
          ),
        );
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
        dataView = serializePoints(points);
      }
      break;
    case "drawArc":
      {
        let { offsetX, offsetY, radius, isRadians, startAngle, angleOffset } =
          command;

        startAngle = isRadians ? startAngle : degToRad(startAngle);
        startAngle = normalizeRadians(startAngle);

        angleOffset = isRadians ? angleOffset : degToRad(angleOffset);
        angleOffset = normalizeRadians(angleOffset);

        isRadians = true;

        dataView = new DataView(new ArrayBuffer(2 * 5));
        dataView.setInt16(0, offsetX, true);
        dataView.setInt16(2, offsetY, true);
        dataView.setUint16(4, radius, true);
        dataView.setUint16(6, formatRotation(startAngle, isRadians), true);
        dataView.setInt16(
          8,
          formatRotation(angleOffset, isRadians, true),
          true,
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
          isRadians,
          startAngle,
          angleOffset,
        } = command;

        startAngle = isRadians ? startAngle : degToRad(startAngle);
        startAngle = normalizeRadians(startAngle);

        angleOffset = isRadians ? angleOffset : degToRad(angleOffset);
        angleOffset = normalizeRadians(angleOffset);

        isRadians = true;

        dataView = new DataView(new ArrayBuffer(2 * 6));
        dataView.setInt16(0, offsetX, true);
        dataView.setInt16(2, offsetY, true);
        dataView.setUint16(4, radiusX, true);
        dataView.setUint16(6, radiusY, true);
        dataView.setUint16(8, formatRotation(startAngle, isRadians), true);
        dataView.setUint16(10, angleOffset, true);
      }
      break;
    case "drawBitmap":
      {
        const { bitmap, offsetX, offsetY } = command;
        displayManager.assertValidBitmap(bitmap, false);
        dataView = new DataView(new ArrayBuffer(drawBitmapHeaderLength));
        dataView.setInt16(0, offsetX, true);
        dataView.setInt16(2, offsetY, true);
        dataView.setUint16(4, bitmap.width, true);
        dataView.setUint32(6, bitmap.pixels.length, true);
        dataView.setUint8(10, bitmap.numberOfColors);

        const bitmapData = getBitmapData(bitmap);
        dataView.setUint16(11, bitmapData.byteLength, true);
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
        const { offsetX, offsetY, spriteIndex, use2Bytes } = command;
        dataView = new DataView(new ArrayBuffer(2 * 2 + (use2Bytes ? 2 : 1)));
        let offset = 0;
        dataView.setInt16(offset, offsetX, true);
        offset += 2;
        dataView.setInt16(offset, offsetY, true);
        offset += 2;
        if (use2Bytes) {
          dataView.setUint16(offset, spriteIndex, true);
          offset += 2;
        } else {
          dataView.setUint8(offset++, spriteIndex!);
        }
      }
      break;
    case "drawSprites":
      {
        const { offsetX, offsetY, spriteSerializedLines } = command;
        const lineArrayBuffers: ArrayBuffer[] = [];
        spriteSerializedLines.forEach((spriteLines) => {
          const subLineArrayBuffers: ArrayBuffer[] = [];
          spriteLines.forEach((subSpriteLine) => {
            const { spriteSheetIndex, spriteIndices, use2Bytes } =
              subSpriteLine;
            const subLineSpriteIndicesDataView = new DataView(
              new ArrayBuffer(spriteIndices.length * (use2Bytes ? 2 : 1)),
            );
            spriteIndices.forEach((spriteIndex, i) => {
              if (use2Bytes) {
                subLineSpriteIndicesDataView.setUint16(
                  i * 2,
                  spriteIndex,
                  true,
                );
              } else {
                subLineSpriteIndicesDataView.setUint8(i, spriteIndex);
              }
            });
            const subLineHeaderDataView = new DataView(new ArrayBuffer(2));
            subLineHeaderDataView.setUint8(0, spriteSheetIndex);
            subLineHeaderDataView.setUint8(1, spriteIndices.length);
            subLineArrayBuffers.push(
              concatenateArrayBuffers(
                subLineHeaderDataView,
                subLineSpriteIndicesDataView,
              ),
            );
          });
          const lineArrayHeaderDataView = new DataView(new ArrayBuffer(2));
          const concatenatedSubLineArrayBuffers = concatenateArrayBuffers(
            ...subLineArrayBuffers,
          );
          lineArrayHeaderDataView.setUint16(
            0,
            concatenatedSubLineArrayBuffers.byteLength,
            true,
          );
          lineArrayBuffers.push(
            concatenateArrayBuffers(
              lineArrayHeaderDataView,
              concatenatedSubLineArrayBuffers,
            ),
          );
        });

        const concatenatedLineArrayBuffers = concatenateArrayBuffers(
          ...lineArrayBuffers,
        );

        dataView = new DataView(new ArrayBuffer(2 * 3));
        let offset = 0;
        dataView.setInt16(offset, offsetX, true);
        offset += 2;
        dataView.setInt16(offset, offsetY, true);
        offset += 2;
        dataView.setUint16(
          offset,
          concatenatedLineArrayBuffers.byteLength,
          true,
        );
        offset += 2;

        const buffer = concatenateArrayBuffers(
          dataView,
          concatenatedLineArrayBuffers,
        );
        dataView = new DataView(buffer);
      }
      break;
    case "startSprite":
      {
        const { offsetX, offsetY, width, height } = command;
        dataView = new DataView(new ArrayBuffer(2 * 4));
        dataView.setInt16(0, offsetX, true);
        dataView.setInt16(2, offsetY, true);
        dataView.setUint16(4, width, true);
        dataView.setUint16(6, height, true);
      }
      break;
  }

  return dataView;
}
export function serializeDisplayContextCommand(
  displayManager: DisplayManagerInterface,
  command: DisplayContextCommand,
) {
  if (command.hide) {
    return;
  }

  const displayContextCommandEnum = DisplayContextCommandTypes.indexOf(
    command.type,
  );
  const serializedContextCommand = serializeDisplayContextCommandData(
    displayManager,
    command,
  );
  return concatenateArrayBuffers(
    UInt8ByteBuffer(displayContextCommandEnum),
    serializedContextCommand,
  );
}
export function serializeDisplayContextCommands(
  displayManager: DisplayManagerInterface,
  commands: DisplayContextCommand[],
) {
  const serializedContextCommandArray = commands.map((command) =>
    serializeDisplayContextCommand(displayManager, command),
  );
  const serializedContextCommands = concatenateArrayBuffers(
    serializedContextCommandArray,
  );
  _console.log(
    "serializedContextCommands",
    commands,
    serializedContextCommandArray,
    serializedContextCommands,
  );
  return serializedContextCommands;
}

export function parseDisplayContextCommands(
  displayManager: DisplayManagerInterface,
  dataView: DataView,
) {
  _console.log("parseContextCommands", displayManager, dataView);
  const contextCommands: DisplayContextCommand[] = [];
  let offset = 0;
  while (offset < dataView.byteLength) {
    const commandTypeIndex = dataView.getUint8(offset++);
    const type = DisplayContextCommandTypes[commandTypeIndex];
    _console.assertWithError(
      type,
      `invalid commandTypeIndex ${commandTypeIndex}`,
    );
    let command: DisplayContextCommand | undefined;
    _console.log(`parsing "${type}" (${offset}/${dataView.byteLength})`);

    switch (type) {
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
      case "resetAlignment":
      case "endSprite":
      case "clearContext":
        command = { type };
        break;
      case "setColor":
        {
          const colorIndex = dataView.getUint8(offset++);
          const r = dataView.getUint8(offset++);
          const g = dataView.getUint8(offset++);
          const b = dataView.getUint8(offset++);
          command = { type, colorIndex, color: { r, g, b } };
        }
        break;
      case "setColorOpacity":
        {
          const colorIndex = dataView.getUint8(offset++);
          const opacity = dataView.getUint8(offset++) / 255;
          command = { type, colorIndex, opacity };
        }
        break;
      case "setOpacity":
        {
          const opacity = dataView.getUint8(offset++) / 255;
          command = { type, opacity };
        }
        break;
      case "selectFillColor":
        {
          const fillColorIndex = dataView.getUint8(offset++);
          command = { type, fillColorIndex };
        }
        break;
      case "selectBackgroundColor":
        {
          const backgroundColorIndex = dataView.getUint8(offset++);
          command = { type, backgroundColorIndex };
        }
        break;
      case "selectLineColor":
        {
          const lineColorIndex = dataView.getUint8(offset++);
          command = { type, lineColorIndex };
        }
        break;
      case "setIgnoreFill":
        {
          const ignoreFill = Boolean(dataView.getUint8(offset++));
          command = { type, ignoreFill };
        }
        break;
      case "setIgnoreLine":
        {
          const ignoreLine = Boolean(dataView.getUint8(offset++));
          command = { type, ignoreLine };
        }
        break;
      case "setFillBackground":
        {
          const fillBackground = Boolean(dataView.getUint8(offset++));
          command = { type, fillBackground };
        }
        break;
      case "setLineWidth":
        {
          const lineWidth = dataView.getUint16(offset, true);
          offset += 2;
          command = { type, lineWidth };
        }
        break;
      case "setHorizontalAlignment":
        {
          const horizontalAlignment =
            DisplayAlignments[dataView.getUint8(offset++)];
          _console.assertEnumWithError(horizontalAlignment, DisplayAlignments);
          command = { type, horizontalAlignment };
        }
        break;
      case "setVerticalAlignment":
        {
          const verticalAlignment =
            DisplayAlignments[dataView.getUint8(offset++)];
          _console.assertEnumWithError(verticalAlignment, DisplayAlignments);
          command = { type, verticalAlignment };
        }
        break;
      case "setRotation":
        {
          const isRadians = true;
          const rotation = parseRotation(
            dataView.getUint16(offset, true),
            isRadians,
          );
          offset += 2;
          command = { type, rotation, isRadians };
        }
        break;
      case "setSegmentStartCap":
        {
          const segmentStartCap =
            DisplaySegmentCaps[dataView.getUint8(offset++)];
          _console.assertEnumWithError(segmentStartCap, DisplaySegmentCaps);
          command = { type, segmentStartCap };
        }
        break;
      case "setSegmentEndCap":
        {
          const segmentEndCap = DisplaySegmentCaps[dataView.getUint8(offset++)];
          _console.assertEnumWithError(segmentEndCap, DisplaySegmentCaps);
          command = { type, segmentEndCap };
        }
        break;
      case "setSegmentCap":
        {
          const segmentCap = DisplaySegmentCaps[dataView.getUint8(offset++)];
          _console.assertEnumWithError(segmentCap, DisplaySegmentCaps);
          command = { type, segmentCap };
        }
        break;
      case "setSegmentStartRadius":
        {
          const segmentStartRadius = dataView.getUint16(offset, true);
          offset += 2;
          command = { type, segmentStartRadius };
        }
        break;
      case "setSegmentEndRadius":
        {
          const segmentEndRadius = dataView.getUint16(offset, true);
          offset += 2;
          command = { type, segmentEndRadius };
        }
        break;
      case "setSegmentRadius":
        {
          const segmentRadius = dataView.getUint16(offset, true);
          offset += 2;
          command = { type, segmentRadius };
        }
        break;
      case "setCropTop":
        {
          const cropTop = dataView.getUint16(offset, true);
          offset += 2;
          command = { type, cropTop };
        }
        break;
      case "setCropRight":
        {
          const cropRight = dataView.getUint16(offset, true);
          offset += 2;
          command = { type, cropRight };
        }
        break;
      case "setCropBottom":
        {
          const cropBottom = dataView.getUint16(offset, true);
          offset += 2;
          command = { type, cropBottom };
        }
        break;
      case "setCropLeft":
        {
          const cropLeft = dataView.getUint16(offset, true);
          offset += 2;
          command = { type, cropLeft };
        }
        break;
      case "setRotationCropTop":
        {
          const rotationCropTop = dataView.getUint16(offset, true);
          offset += 2;
          command = { type, rotationCropTop };
        }
        break;
      case "setRotationCropRight":
        {
          const rotationCropRight = dataView.getUint16(offset, true);
          offset += 2;
          command = { type, rotationCropRight };
        }
        break;
      case "setRotationCropBottom":
        {
          const rotationCropBottom = dataView.getUint16(offset, true);
          offset += 2;
          command = { type, rotationCropBottom };
        }
        break;
      case "setRotationCropLeft":
        {
          const rotationCropLeft = dataView.getUint16(offset, true);
          offset += 2;
          command = { type, rotationCropLeft };
        }
        break;
      case "selectBitmapColor":
        {
          const bitmapColorIndex = dataView.getUint8(offset++);
          const colorIndex = dataView.getUint8(offset++);
          command = { type, bitmapColorIndex, colorIndex };
        }
        break;
      case "selectBitmapColors":
        {
          const numberOfBitmapColorPairs = dataView.getUint8(offset++);
          const bitmapColorPairs: DisplayBitmapColorPair[] = [];
          for (let i = 0; i < numberOfBitmapColorPairs; i++) {
            const bitmapColorIndex = dataView.getUint8(offset++);
            const colorIndex = dataView.getUint8(offset++);
            bitmapColorPairs.push({ bitmapColorIndex, colorIndex });
          }
          command = { type, bitmapColorPairs };
        }
        break;
      case "setBitmapScaleX":
        {
          const bitmapScaleX = parseScale(dataView.getInt16(offset, true));
          offset += 2;
          command = { type, bitmapScaleX };
        }
        break;
      case "setBitmapScaleY":
        {
          const bitmapScaleY = parseScale(dataView.getInt16(offset, true));
          offset += 2;
          command = { type, bitmapScaleY };
        }
        break;
      case "setBitmapScale":
        {
          const bitmapScale = parseScale(dataView.getInt16(offset, true));
          offset += 2;
          command = { type, bitmapScale };
        }
        break;
      case "selectSpriteColor":
        {
          const spriteColorIndex = dataView.getUint8(offset++);
          const colorIndex = dataView.getUint8(offset++);
          command = { type, spriteColorIndex, colorIndex };
        }
        break;
      case "selectSpriteColors":
        {
          const numberOfSpriteColorPairs = dataView.getUint8(offset++);
          const spriteColorPairs: DisplaySpriteColorPair[] = [];
          for (let i = 0; i < numberOfSpriteColorPairs; i++) {
            const spriteColorIndex = dataView.getUint8(offset++);
            const colorIndex = dataView.getUint8(offset++);
            spriteColorPairs.push({ spriteColorIndex, colorIndex });
          }
          command = { type, spriteColorPairs };
        }
        break;
      case "setSpriteScaleX":
        {
          const spriteScaleX = parseScale(dataView.getInt16(offset, true));
          offset += 2;
          command = { type, spriteScaleX };
        }
        break;
      case "setSpriteScaleY":
        {
          const spriteScaleY = parseScale(dataView.getInt16(offset, true));
          offset += 2;
          command = { type, spriteScaleY };
        }
        break;
      case "setSpriteScale":
        {
          const spriteScale = parseScale(dataView.getInt16(offset, true));
          offset += 2;
          command = { type, spriteScale };
        }
        break;
      case "setSpritesLineHeight":
        {
          const spritesLineHeight = dataView.getUint16(offset, true);
          offset += 2;
          command = { type, spritesLineHeight };
        }
        break;
      case "setSpritesDirection":
        {
          const spritesDirection =
            DisplayDirections[dataView.getUint8(offset++)];
          _console.assertEnumWithError(spritesDirection, DisplayDirections);
          command = { type, spritesDirection };
        }
        break;
      case "setSpritesLineDirection":
        {
          const spritesLineDirection =
            DisplayDirections[dataView.getUint8(offset++)];
          _console.assertEnumWithError(spritesLineDirection, DisplayDirections);
          command = { type, spritesLineDirection };
        }
        break;
      case "setSpritesSpacing":
        {
          const spritesSpacing = dataView.getInt16(offset, true);
          offset += 2;
          command = { type, spritesSpacing };
        }
        break;
      case "setSpritesLineSpacing":
        {
          const spritesLineSpacing = dataView.getInt16(offset, true);
          offset += 2;
          command = { type, spritesLineSpacing };
        }
        break;
      case "setSpritesAlignment":
        {
          const spritesAlignment =
            DisplayAlignments[dataView.getUint8(offset++)];
          _console.assertEnumWithError(spritesAlignment, DisplayAlignments);
          command = { type, spritesAlignment };
        }
        break;
      case "setSpritesLineAlignment":
        {
          const spritesLineAlignment =
            DisplayAlignments[dataView.getUint8(offset++)];
          _console.assertEnumWithError(spritesLineAlignment, DisplayAlignments);
          command = { type, spritesLineAlignment };
        }
        break;
      case "clearRect":
        {
          const x = dataView.getInt16(offset, true);
          offset += 2;
          const y = dataView.getInt16(offset, true);
          offset += 2;
          const width = dataView.getUint16(offset, true);
          offset += 2;
          const height = dataView.getUint16(offset, true);
          offset += 2;
          command = { type, x, y, width, height };
        }
        break;
      case "drawRect":
        {
          const offsetX = dataView.getInt16(offset, true);
          offset += 2;
          const offsetY = dataView.getInt16(offset, true);
          offset += 2;
          const width = dataView.getUint16(offset, true);
          offset += 2;
          const height = dataView.getUint16(offset, true);
          offset += 2;
          command = { type, offsetX, offsetY, width, height };
        }
        break;
      case "drawRoundRect":
        {
          const offsetX = dataView.getInt16(offset, true);
          offset += 2;
          const offsetY = dataView.getInt16(offset, true);
          offset += 2;
          const width = dataView.getUint16(offset, true);
          offset += 2;
          const height = dataView.getUint16(offset, true);
          offset += 2;
          const borderRadius = dataView.getUint8(offset++);
          command = { type, offsetX, offsetY, width, height, borderRadius };
        }
        break;
      case "drawCircle":
        {
          const offsetX = dataView.getInt16(offset, true);
          offset += 2;
          const offsetY = dataView.getInt16(offset, true);
          offset += 2;
          const radius = dataView.getUint16(offset, true);
          offset += 2;
          command = { type, offsetX, offsetY, radius };
        }
        break;
      case "drawEllipse":
        {
          const offsetX = dataView.getInt16(offset, true);
          offset += 2;
          const offsetY = dataView.getInt16(offset, true);
          offset += 2;
          const radiusX = dataView.getUint16(offset, true);
          offset += 2;
          const radiusY = dataView.getUint16(offset, true);
          offset += 2;
          command = { type, offsetX, offsetY, radiusX, radiusY };
        }
        break;
      case "drawRegularPolygon":
        {
          const offsetX = dataView.getInt16(offset, true);
          offset += 2;
          const offsetY = dataView.getInt16(offset, true);
          offset += 2;
          const radius = dataView.getUint16(offset, true);
          offset += 2;
          const numberOfSides = dataView.getUint8(offset++);
          command = { type, offsetX, offsetY, radius, numberOfSides };
        }
        break;
      case "drawPolygon":
        {
          const { points, offset: newOffset } = parsePoints(dataView, offset);
          offset = newOffset;
          command = { type, points };
        }
        break;
      case "drawWireframe":
        {
          const { points, offset: newOffset } = parsePoints(dataView, offset);
          offset = newOffset;

          const numberOfEdges = dataView.getUint8(offset++);
          _console.assertWithError(
            numberOfEdges >= 2,
            `numberOfEdges ${numberOfEdges} must be at least 2`,
          );
          const edges: DisplayWireframeEdge[] = [];
          for (let i = 0; i < numberOfEdges; i++) {
            const startIndex = dataView.getUint8(offset++);
            const endIndex = dataView.getUint8(offset++);
            edges.push({ startIndex, endIndex });
          }

          const wireframe: DisplayWireframe = { points, edges };
          command = { type, wireframe };
        }
        break;
      case "drawQuadraticBezierCurve":
      case "drawCubicBezierCurve":
        {
          const controlPoints: Vector2[] = [];
          const curveType: DisplayBezierCurveType =
            type == "drawCubicBezierCurve" ? "cubic" : "quadratic";
          const numberOfConrolPoints = getNumberOfConrolPoints(curveType);
          for (let i = 0; i < numberOfConrolPoints; i++) {
            const x = dataView.getInt16(offset, true);
            offset += 2;
            const y = dataView.getInt16(offset, true);
            offset += 2;
            controlPoints.push({ x, y });
          }
          command = { type, controlPoints };
        }
        break;
      case "drawQuadraticBezierCurves":
      case "drawCubicBezierCurves":
        {
          const { points: controlPoints, offset: newOffset } = parsePoints(
            dataView,
            offset,
          );
          offset = newOffset;
          command = { type, controlPoints };
        }
        break;
      case "drawPath":
      case "drawClosedPath":
        {
          const curves: DisplayBezierCurve[] = [];
          const pointDataType =
            DisplayPointDataTypes[dataView.getUint8(offset++)];
          _console.assertEnumWithError(pointDataType, DisplayPointDataTypes);
          const numberOfCurves = dataView.getUint8(offset++);
          const curveTypeDataLength = Math.ceil(
            numberOfCurves / displayCurveTypesPerByte,
          );
          const totalNumberOfControlPoints = dataView.getUint8(offset++);
          const pathDataLength =
            curveTypeDataLength +
            totalNumberOfControlPoints *
              displayPointDataTypeToSize[pointDataType];
          _console.assertWithError(
            offset + pathDataLength > dataView.byteLength,
            `offset + pathDataLength ${offset + pathDataLength} exceeds dataView.byteLength ${dataView.byteLength}`,
          );

          const curveTypeDataOffset = offset;
          offset += curveTypeDataLength;

          for (let index = 0; index < numberOfCurves; index++) {
            const typeByteIndex = Math.floor(index / displayCurveTypesPerByte);
            const typeBitShift =
              (index % displayCurveTypesPerByte) * displayCurveTypeBitWidth;
            const typeValue = dataView.getUint8(
              curveTypeDataOffset + typeByteIndex,
            );
            const typeIndex =
              (typeValue >> typeBitShift) &
              ((1 << displayCurveTypeBitWidth) - 1);
            const type = DisplayBezierCurveTypes[typeIndex];

            const { points: controlPoints, offset: newOffset } = parsePoints(
              dataView,
              offset,
            );
            offset = newOffset;
            curves.push({ type, controlPoints });
          }

          command = { type, curves };
        }
        break;
      case "drawSegment":
        {
          const startX = dataView.getInt16(offset, true);
          offset += 2;
          const startY = dataView.getInt16(offset, true);
          offset += 2;
          const endX = dataView.getInt16(offset, true);
          offset += 2;
          const endY = dataView.getInt16(offset, true);
          offset += 2;
          command = { type, startX, startY, endX, endY };
        }
        break;
      case "drawSegments":
        {
          const { points, offset: newOffset } = parsePoints(dataView, offset);
          offset = newOffset;
          command = { type, points };
        }
        break;
      case "drawArc":
        {
          const offsetX = dataView.getInt16(offset, true);
          offset += 2;
          const offsetY = dataView.getInt16(offset, true);
          offset += 2;

          const isRadians = true;

          const radius = dataView.getUint16(offset, true);
          offset += 2;

          const startAngle = parseRotation(
            dataView.getUint16(offset, true),
            isRadians,
          );
          offset += 2;

          const angleOffset = parseRotation(
            dataView.getInt16(offset, true),
            isRadians,
          );
          offset += 2;

          command = {
            type,
            offsetX,
            offsetY,
            radius,
            isRadians,
            startAngle,
            angleOffset,
          };
        }
        break;
      case "drawArcEllipse":
        {
          const offsetX = dataView.getInt16(offset, true);
          offset += 2;
          const offsetY = dataView.getInt16(offset, true);
          offset += 2;

          const isRadians = true;

          const radiusX = dataView.getUint16(offset, true);
          offset += 2;
          const radiusY = dataView.getUint16(offset, true);
          offset += 2;

          const startAngle = parseRotation(
            dataView.getUint16(offset, true),
            isRadians,
          );
          offset += 2;

          const angleOffset = parseRotation(
            dataView.getInt16(offset, true),
            isRadians,
          );
          offset += 2;

          command = {
            type,
            offsetX,
            offsetY,
            radiusX,
            radiusY,
            isRadians,
            startAngle,
            angleOffset,
          };
        }
        break;
      case "drawBitmap":
        {
          const offsetX = dataView.getInt16(offset, true);
          offset += 2;
          const offsetY = dataView.getInt16(offset, true);
          offset += 2;
          const { bitmap, offset: newOffset } = parseBitmap(dataView, offset);
          offset = newOffset;
          command = { type, offsetX, offsetY, bitmap };
        }
        break;
      case "selectSpriteSheet":
        {
          const spriteSheetIndex = dataView.getUint8(offset++);
          command = { type, spriteSheetIndex };
        }
        break;
      case "drawSprite":
        {
          const offsetX = dataView.getInt16(offset, true);
          offset += 2;
          const offsetY = dataView.getInt16(offset, true);
          offset += 2;

          _console.assertWithError(
            displayManager.selectedSpriteSheet,
            "displayManager doesn't have a selected spriteSheet",
          );
          const use2Bytes =
            displayManager.selectedSpriteSheet!.sprites.length > 255;
          let spriteIndex: number;
          if (use2Bytes) {
            spriteIndex = dataView.getUint16(offset, true);
            offset += 2;
          } else {
            spriteIndex = dataView.getUint8(offset++);
          }

          command = { type, offsetX, offsetY, spriteIndex, use2Bytes };
        }
        break;
      case "drawSprites":
        {
          const offsetX = dataView.getInt16(offset, true);
          offset += 2;
          const offsetY = dataView.getInt16(offset, true);
          offset += 2;
          const linesDataLength = dataView.getUint16(offset, true);
          offset += 2;

          const linesDataEnd = offset + linesDataLength;

          const spriteSerializedLines: DisplaySpriteSerializedLines = [];

          while (offset < linesDataEnd) {
            const lineDataLength = dataView.getUint16(offset, true);
            offset += 2;

            const lineDataEnd = offset + lineDataLength;

            const spriteLine: DisplaySpriteSerializedLine = [];

            while (offset < lineDataEnd) {
              const spriteSheetIndex = dataView.getUint8(offset++);
              const spriteCount = dataView.getUint8(offset++);

              const spriteSheet =
                displayManager.getSpriteSheetByIndex(spriteSheetIndex);
              _console.assertWithError(
                spriteSheet,
                `no spriteSheet found for spriteSheetIndex ${spriteSheetIndex}`,
              );

              const use2Bytes = spriteSheet!.sprites.length > 255;

              const spriteIndices: number[] = [];
              for (let i = 0; i < spriteCount; i++) {
                spriteIndices.push(
                  use2Bytes
                    ? dataView.getUint16(offset, true)
                    : dataView.getUint8(offset),
                );
                offset += use2Bytes ? 2 : 1;
              }

              spriteLine.push({
                spriteSheetIndex,
                spriteIndices,
                use2Bytes,
              });
            }

            spriteSerializedLines.push(spriteLine);
          }

          command = { type, offsetX, offsetY, spriteSerializedLines };
        }
        break;
      case "startSprite":
        {
          const offsetX = dataView.getInt16(offset, true);
          offset += 2;
          const offsetY = dataView.getInt16(offset, true);
          offset += 2;
          const width = dataView.getUint16(offset, true);
          offset += 2;
          const height = dataView.getUint16(offset, true);
          offset += 2;
          command = { type, offsetX, offsetY, width, height };
        }
        break;
      default:
        _console.error(`uncaught commandType "${type}"`);
        break;
    }

    _console.log("command", command);

    _console.assertWithError(
      command,
      `no command found for commandType "${type}"`,
    );

    contextCommands.push(command!);
  }
  _console.log("parsed contextCommands", contextCommands);
  return contextCommands;
}

const DrawDisplayContextCommandTypes = [
  "drawRect",
  "drawRoundRect",

  "drawCircle",
  "drawArc",

  "drawEllipse",
  "drawArcEllipse",

  "drawSegment",
  "drawSegments",

  "drawRegularPolygon",
  "drawPolygon",

  "drawWireframe",

  "drawQuadraticBezierCurve",
  "drawQuadraticBezierCurves",
  "drawCubicBezierCurve",
  "drawCubicBezierCurves",

  "drawPath",
  "drawClosedPath",

  "drawBitmap",

  "drawSprite",
  "drawSprites",
] as const satisfies readonly DisplayContextCommandType[];
type DrawDisplayContextCommandType =
  (typeof DrawDisplayContextCommandTypes)[number];

const StateDisplayContextCommandTypes = [
  "setColor",
  "setColorOpacity",
  "setOpacity",

  "saveContext",
  "restoreContext",

  "selectBackgroundColor",
  "selectFillColor",
  "selectLineColor",

  "setIgnoreFill",
  "setIgnoreLine",
  "setFillBackground",

  "setLineWidth",
  "setRotation",
  "clearRotation",

  "setHorizontalAlignment",
  "setVerticalAlignment",
  "resetAlignment",

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

  "setSpritesLineHeight",
  "setSpritesDirection",
  "setSpritesLineDirection",
  "setSpritesSpacing",
  "setSpritesLineSpacing",
  "setSpritesAlignment",
  "setSpritesLineAlignment",

  "selectSpriteSheet",
] as const satisfies readonly DisplayContextCommandType[];
type StateDisplayContextCommandType =
  (typeof StateDisplayContextCommandTypes)[number];

const SpritesDisplayContextCommandTypes = [
  "selectSpriteColor",
  "selectSpriteColors",
  "resetSpriteColors",
  "setSpriteScaleX",
  "setSpriteScaleY",
  "setSpriteScale",
  "resetSpriteScale",

  "setSpritesLineHeight",
  "setSpritesDirection",
  "setSpritesLineDirection",
  "setSpritesSpacing",
  "setSpritesLineSpacing",
  "setSpritesAlignment",
  "setSpritesLineAlignment",

  "selectSpriteSheet",
] as const satisfies readonly DisplayContextCommandType[];
export type SpritesDisplayContextCommandType =
  (typeof SpritesDisplayContextCommandTypes)[number];

const PathDrawDisplayContextCommandTypes = [
  "drawSegment",
  "drawSegments",
  "drawQuadraticBezierCurve",
  "drawQuadraticBezierCurves",
  "drawCubicBezierCurve",
  "drawCubicBezierCurves",
  "drawPath",
  "drawWireframe",
] as const satisfies readonly DisplayContextCommandType[];
export type PathDrawDisplayContextCommandType =
  (typeof PathDrawDisplayContextCommandTypes)[number];

const PathStateDisplayContextCommandTypes = [
  "setSegmentRadius",
  "setSegmentEndRadius",
  "setSegmentStartRadius",
  "setSegmentCap",
  "setSegmentStartCap",
  "setSegmentEndCap",
] as const satisfies readonly DisplayContextCommandType[];
export type PathStateDisplayContextCommandType =
  (typeof PathStateDisplayContextCommandTypes)[number];

const BitmapDisplayContextCommandTypes = [
  "selectBitmapColor",
  "selectBitmapColors",
  "setBitmapScaleX",
  "setBitmapScaleY",
  "setBitmapScale",
  "resetBitmapScale",
] as const satisfies readonly DisplayContextCommandType[];
export type BitmapDisplayContextCommandType =
  (typeof BitmapDisplayContextCommandTypes)[number];

const contextCommandDependencies: Map<
  Set<DisplayContextCommandType>,
  Set<DisplayContextCommandType>
> = new Map();
function appendContextCommandDependencyPair(
  key: DisplayContextCommandType[],
  value: DisplayContextCommandType[],
) {
  contextCommandDependencies.set(new Set(key), new Set(value));
}
appendContextCommandDependencyPair(
  [...PathStateDisplayContextCommandTypes],
  [...PathDrawDisplayContextCommandTypes],
);
appendContextCommandDependencyPair(
  [...StateDisplayContextCommandTypes],
  [...DrawDisplayContextCommandTypes],
);
appendContextCommandDependencyPair(
  [...SpritesDisplayContextCommandTypes],
  ["drawSprite", "drawSprites"],
);
appendContextCommandDependencyPair(
  [...BitmapDisplayContextCommandTypes],
  ["drawBitmap"],
);

// TODO - can refine more (e.g. if ignoreLine, then skip setLineWidth, or skip if a set value is already default, etc)

export function trimContextCommands(commands: DisplayContextCommand[]) {
  _console.log("trimming commands", commands);
  const trimmedCommands: DisplayContextCommand[] = [];

  commands
    .slice()
    .reverse()
    .forEach((command) => {
      let include = true;

      let dependencies: Set<DisplayContextCommandType> | undefined;
      for (const [keys, values] of contextCommandDependencies) {
        if (keys.has(command.type)) {
          dependencies = values;
          break;
        }
      }

      _console.log("command", command, "dependencies", dependencies);

      let similarCommandIndex = -1;
      let dependentCommandIndex = -1;
      if (dependencies) {
        similarCommandIndex = trimmedCommands.findIndex((trimmedCommand) => {
          // FILL - expand, e.g. clearRotation is similar to setRotation
          return trimmedCommand.type == command.type;
        });
        dependentCommandIndex = trimmedCommands.findIndex((trimmedCommand) =>
          dependencies.has(trimmedCommand.type),
        );

        _console.log({ similarCommandIndex, dependentCommandIndex });

        if (dependentCommandIndex == -1) {
          include = false;
        } else if (similarCommandIndex != -1) {
          include = similarCommandIndex > dependentCommandIndex;
        }
      }
      if (include) {
        if (
          similarCommandIndex != -1 &&
          deepEqual(command, trimmedCommands[similarCommandIndex])
        ) {
          // FILL - replace deepEqual with "isSimilarCommand"
          trimmedCommands.splice(similarCommandIndex, 1);
        }
        trimmedCommands.unshift(command);
      } else {
        _console.log("skipping command", command);
      }
    });

  _console.log("trimmedCommands", trimmedCommands);
  return trimmedCommands;
}
