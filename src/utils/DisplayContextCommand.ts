import { DisplayBitmap, DisplayBitmapColorPair } from "../DisplayManager.ts";
import { createConsole } from "./Console.ts";
import {
  DisplayContextState,
  DisplaySegmentCap,
} from "./DisplayContextState.ts";
import { DisplayColorRGB } from "./DisplayUtils.ts";
import { Vector2 } from "./MathUtils.ts";

const _console = createConsole("DisplayContextCommand", { log: false });

export const DisplayContextCommands = [
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
] as const;
export type DisplayContextCommand = (typeof DisplayContextCommands)[number];

interface BaseDisplayContextCommandMessage {
  command: DisplayContextCommand;
  contextState: DisplayContextState;
}

interface SimpleDisplayCommandMessage extends BaseDisplayContextCommandMessage {
  command:
    | "show"
    | "clear"
    | "saveContext"
    | "restoreContext"
    | "clearRotation"
    | "clearCrop"
    | "clearRotationCrop"
    | "resetBitmapScale";
}

interface SetDisplayColorCommandMessage
  extends BaseDisplayContextCommandMessage {
  command: "setColor";
  colorIndex: number;
  color: DisplayColorRGB | string;
}
interface SetDisplayColorOpacityCommandMessage
  extends BaseDisplayContextCommandMessage {
  command: "setColorOpacity";
  colorIndex: number;
  opacity: number;
}
interface SetDisplayOpacityCommandMessage
  extends BaseDisplayContextCommandMessage {
  command: "setOpacity";
  opacity: number;
}

interface SelectDisplayFillColorCommandMessage
  extends BaseDisplayContextCommandMessage {
  command: "selectFillColor";
  fillColorIndex: number;
}
interface SelectDisplayLineColorCommandMessage
  extends BaseDisplayContextCommandMessage {
  command: "selectLineColor";
  lineColorIndex: number;
}
interface SetDisplayLineWidthCommandMessage
  extends BaseDisplayContextCommandMessage {
  command: "setLineWidth";
  lineWidth: number;
}
interface SetDisplayRotationCommandMessage
  extends BaseDisplayContextCommandMessage {
  command: "setRotation";
  rotation: number;
  isRadians?: boolean;
}

interface SetDisplaySegmentStartCapCommandMessage
  extends BaseDisplayContextCommandMessage {
  command: "setSegmentStartCap";
  segmentStartCap: DisplaySegmentCap;
}
interface SetDisplaySegmentEndCapCommandMessage
  extends BaseDisplayContextCommandMessage {
  command: "setSegmentEndCap";
  segmentEndCap: DisplaySegmentCap;
}
interface SetDisplaySegmentCapCommandMessage
  extends BaseDisplayContextCommandMessage {
  command: "setSegmentCap";
  segmentCap: DisplaySegmentCap;
}

interface SetDisplaySegmentStartRadiusCommandMessage
  extends BaseDisplayContextCommandMessage {
  command: "setSegmentStartRadius";
  segmentStartRadius: number;
}
interface SetDisplaySegmentEndRadiusCommandMessage
  extends BaseDisplayContextCommandMessage {
  command: "setSegmentEndRadius";
  segmentEndRadius: number;
}
interface SetDisplaySegmentRadiusCommandMessage
  extends BaseDisplayContextCommandMessage {
  command: "setSegmentRadius";
  segmentRadius: number;
}

interface SetDisplayCropTopCommandMessage
  extends BaseDisplayContextCommandMessage {
  command: "setCropTop";
  cropTop: number;
}
interface SetDisplayCropRightCommandMessage
  extends BaseDisplayContextCommandMessage {
  command: "setCropRight";
  cropRight: number;
}
interface SetDisplayCropBottomCommandMessage
  extends BaseDisplayContextCommandMessage {
  command: "setCropBottom";
  cropBottom: number;
}
interface SetDisplayCropLeftCommandMessage
  extends BaseDisplayContextCommandMessage {
  command: "setCropLeft";
  cropLeft: number;
}

interface SetDisplayRotationCropTopCommandMessage
  extends BaseDisplayContextCommandMessage {
  command: "setRotationCropTop";
  rotationCropTop: number;
}
interface SetDisplayRotationCropRightCommandMessage
  extends BaseDisplayContextCommandMessage {
  command: "setRotationCropRight";
  rotationCropRight: number;
}
interface SetDisplayRotationCropBottomCommandMessage
  extends BaseDisplayContextCommandMessage {
  command: "setRotationCropBottom";
  rotationCropBottom: number;
}
interface SetDisplayRotationCropLeftCommandMessage
  extends BaseDisplayContextCommandMessage {
  command: "setRotationCropLeft";
  rotationCropLeft: number;
}

interface SelectDisplayBitmapColorIndexCommandMessage
  extends BaseDisplayContextCommandMessage {
  command: "selectBitmapColor";
  bitmapColorIndex: number;
  colorIndex: number;
}
interface SelectDisplayBitmapColorIndicesCommandMessage
  extends BaseDisplayContextCommandMessage {
  command: "selectBitmapColors";
  bitmapColorPairs: DisplayBitmapColorPair[];
}

interface SetDisplayBitmapScaleXCommandMessage
  extends BaseDisplayContextCommandMessage {
  command: "setBitmapScaleX";
  bitmapScaleX: number;
}
interface SetDisplayBitmapScaleYCommandMessage
  extends BaseDisplayContextCommandMessage {
  command: "setBitmapScaleY";
  bitmapScaleY: number;
}
interface SetDisplayBitmapScaleCommandMessage
  extends BaseDisplayContextCommandMessage {
  command: "setBitmapScale";
  bitmapScale: number;
}

interface BasePositionDisplayContextCommandMessage
  extends BaseDisplayContextCommandMessage {
  x: number;
  y: number;
}
interface BaseCenterPositionDisplayContextCommandMessage
  extends BaseDisplayContextCommandMessage {
  centerX: number;
  centerY: number;
}
interface BaseSizeDisplayContextCommandMessage
  extends BaseDisplayContextCommandMessage {
  width: number;
  height: number;
}

interface BaseDisplayRectCommandMessage
  extends BasePositionDisplayContextCommandMessage,
    BaseSizeDisplayContextCommandMessage {}
interface BaseDisplayCenterRectCommandMessage
  extends BaseCenterPositionDisplayContextCommandMessage,
    BaseSizeDisplayContextCommandMessage {}

interface ClearDisplayRectCommandMessage extends BaseDisplayRectCommandMessage {
  command: "clearRect";
}
interface DrawDisplayRectCommandMessage
  extends BaseDisplayCenterRectCommandMessage {
  command: "drawRect";
}

interface DrawDisplayRoundedRectCommandMessage
  extends BaseCenterPositionDisplayContextCommandMessage,
    BaseSizeDisplayContextCommandMessage {
  command: "drawRoundRect";
  borderRadius: number;
}

interface DrawDisplayCircleCommandMessage
  extends BaseCenterPositionDisplayContextCommandMessage {
  command: "drawCircle";
  radius: number;
}
interface DrawDisplayEllipseCommandMessage
  extends BaseCenterPositionDisplayContextCommandMessage {
  command: "drawEllipse";
  radiusX: number;
  radiusY: number;
}

interface DrawDisplayPolygonCommandMessage
  extends BaseCenterPositionDisplayContextCommandMessage {
  command: "drawPolygon";
  radius: number;
  numberOfSides: number;
}
interface DrawDisplaySegmentCommandMessage
  extends BaseCenterPositionDisplayContextCommandMessage {
  command: "drawSegment";
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}
interface DrawDisplaySegmentsCommandMessage
  extends BaseCenterPositionDisplayContextCommandMessage {
  command: "drawSegments";
  points: Vector2[];
}

interface DrawDisplayArcCommandMessage
  extends BaseCenterPositionDisplayContextCommandMessage {
  command: "drawArc";
  radius: number;
  startAngle: number;
  angleOffset: number;
  isRadians?: boolean;
}
interface DrawDisplayArcEllipseCommandMessage
  extends BaseCenterPositionDisplayContextCommandMessage {
  command: "drawArcEllipse";
  radiusX: number;
  radiusY: number;
  startAngle: number;
  angleOffset: number;
  isRadians?: boolean;
}

interface DrawDisplayBitmapCommandMessage
  extends BaseCenterPositionDisplayContextCommandMessage {
  command: "drawBitmap";
  centerX: number;
  centerY: number;
  bitmap: DisplayBitmap;
}

export type DisplayContextCommandMessage =
  | SimpleDisplayCommandMessage
  | SetDisplayColorCommandMessage
  | SetDisplayColorOpacityCommandMessage
  | SetDisplayOpacityCommandMessage
  | SelectDisplayFillColorCommandMessage
  | SelectDisplayLineColorCommandMessage
  | SetDisplayLineWidthCommandMessage
  | SetDisplayRotationCommandMessage
  | SetDisplaySegmentStartCapCommandMessage
  | SetDisplaySegmentEndCapCommandMessage
  | SetDisplaySegmentCapCommandMessage
  | SetDisplaySegmentStartRadiusCommandMessage
  | SetDisplaySegmentEndRadiusCommandMessage
  | SetDisplaySegmentRadiusCommandMessage
  | SetDisplayCropTopCommandMessage
  | SetDisplayCropRightCommandMessage
  | SetDisplayCropBottomCommandMessage
  | SetDisplayCropLeftCommandMessage
  | SetDisplayRotationCropTopCommandMessage
  | SetDisplayRotationCropRightCommandMessage
  | SetDisplayRotationCropBottomCommandMessage
  | SetDisplayRotationCropLeftCommandMessage
  | SelectDisplayBitmapColorIndexCommandMessage
  | SelectDisplayBitmapColorIndicesCommandMessage
  | SetDisplayBitmapScaleXCommandMessage
  | SetDisplayBitmapScaleYCommandMessage
  | SetDisplayBitmapScaleCommandMessage
  | ClearDisplayRectCommandMessage
  | DrawDisplayRectCommandMessage
  | DrawDisplayRoundedRectCommandMessage
  | DrawDisplayCircleCommandMessage
  | DrawDisplayEllipseCommandMessage
  | DrawDisplayPolygonCommandMessage
  | DrawDisplaySegmentCommandMessage
  | DrawDisplaySegmentsCommandMessage
  | DrawDisplayArcCommandMessage
  | DrawDisplayArcEllipseCommandMessage
  | DrawDisplayBitmapCommandMessage;
