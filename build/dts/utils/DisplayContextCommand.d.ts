import { DisplayBitmap, DisplayBitmapColorPair, DisplaySpriteColorPair } from "../DisplayManager.ts";
import { DisplaySegmentCap } from "./DisplayContextState.ts";
import { DisplayColorRGB } from "./DisplayUtils.ts";
import { Vector2 } from "./MathUtils.ts";
export declare const DisplayContextCommandTypes: readonly ["show", "clear", "setColor", "setColorOpacity", "setOpacity", "saveContext", "restoreContext", "selectFillColor", "selectLineColor", "setLineWidth", "setRotation", "clearRotation", "setSegmentStartCap", "setSegmentEndCap", "setSegmentCap", "setSegmentStartRadius", "setSegmentEndRadius", "setSegmentRadius", "setCropTop", "setCropRight", "setCropBottom", "setCropLeft", "clearCrop", "setRotationCropTop", "setRotationCropRight", "setRotationCropBottom", "setRotationCropLeft", "clearRotationCrop", "selectBitmapColor", "selectBitmapColors", "setBitmapScaleX", "setBitmapScaleY", "setBitmapScale", "resetBitmapScale", "selectSpriteColor", "selectSpriteColors", "resetSpriteColors", "setSpriteScale", "resetSpriteScale", "clearRect", "drawRect", "drawRoundRect", "drawCircle", "drawEllipse", "drawPolygon", "drawSegment", "drawSegments", "drawArc", "drawArcEllipse", "drawBitmap", "selectSpriteSheet", "drawSprite"];
export type DisplayContextCommandType = (typeof DisplayContextCommandTypes)[number];
export declare const DisplaySpriteContextCommandTypes: readonly ["selectFillColor", "selectLineColor", "setLineWidth", "setRotation", "clearRotation", "setSegmentStartCap", "setSegmentEndCap", "setSegmentCap", "setSegmentStartRadius", "setSegmentEndRadius", "setSegmentRadius", "setCropTop", "setCropRight", "setCropBottom", "setCropLeft", "clearCrop", "setRotationCropTop", "setRotationCropRight", "setRotationCropBottom", "setRotationCropLeft", "clearRotationCrop", "selectBitmapColor", "selectBitmapColors", "setBitmapScaleX", "setBitmapScaleY", "setBitmapScale", "resetBitmapScale", "clearRect", "drawRect", "drawRoundRect", "drawCircle", "drawEllipse", "drawPolygon", "drawSegment", "drawSegments", "drawArc", "drawArcEllipse", "drawBitmap", "drawSprite"];
export type DisplaySpriteContextCommandType = (typeof DisplaySpriteContextCommandTypes)[number];
interface BaseDisplayContextCommand {
    type: DisplayContextCommandType | "runDisplayContextCommands";
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
interface SetDisplaySpriteScaleCommand extends BaseDisplayContextCommand {
    type: "setSpriteScale";
    spriteScale: number;
}
interface BasePositionDisplayContextCommand extends BaseDisplayContextCommand {
    x: number;
    y: number;
}
interface BaseCenterPositionDisplayContextCommand extends BaseDisplayContextCommand {
    centerX: number;
    centerY: number;
}
interface BaseSizeDisplayContextCommand extends BaseDisplayContextCommand {
    width: number;
    height: number;
}
interface BaseDisplayRectCommand extends BasePositionDisplayContextCommand, BaseSizeDisplayContextCommand {
}
interface BaseDisplayCenterRectCommand extends BaseCenterPositionDisplayContextCommand, BaseSizeDisplayContextCommand {
}
interface ClearDisplayRectCommand extends BaseDisplayRectCommand {
    type: "clearRect";
}
interface DrawDisplayRectCommand extends BaseDisplayCenterRectCommand {
    type: "drawRect";
}
interface DrawDisplayRoundedRectCommand extends BaseCenterPositionDisplayContextCommand, BaseSizeDisplayContextCommand {
    type: "drawRoundRect";
    borderRadius: number;
}
interface DrawDisplayCircleCommand extends BaseCenterPositionDisplayContextCommand {
    type: "drawCircle";
    radius: number;
}
interface DrawDisplayEllipseCommand extends BaseCenterPositionDisplayContextCommand {
    type: "drawEllipse";
    radiusX: number;
    radiusY: number;
}
interface DrawDisplayPolygonCommand extends BaseCenterPositionDisplayContextCommand {
    type: "drawPolygon";
    radius: number;
    numberOfSides: number;
}
interface DrawDisplaySegmentCommand extends BaseCenterPositionDisplayContextCommand {
    type: "drawSegment";
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}
interface DrawDisplaySegmentsCommand extends BaseCenterPositionDisplayContextCommand {
    type: "drawSegments";
    points: Vector2[];
}
interface DrawDisplayArcCommand extends BaseCenterPositionDisplayContextCommand {
    type: "drawArc";
    radius: number;
    startAngle: number;
    angleOffset: number;
    isRadians?: boolean;
}
interface DrawDisplayArcEllipseCommand extends BaseCenterPositionDisplayContextCommand {
    type: "drawArcEllipse";
    radiusX: number;
    radiusY: number;
    startAngle: number;
    angleOffset: number;
    isRadians?: boolean;
}
interface DrawDisplayBitmapCommand extends BaseCenterPositionDisplayContextCommand {
    type: "drawBitmap";
    bitmap: DisplayBitmap;
}
interface DrawDisplaySpriteCommand extends BaseCenterPositionDisplayContextCommand {
    type: "drawSprite";
    spriteSheetName: string;
    spriteName: string;
}
export type DisplayContextCommand = SimpleDisplayCommand | SetDisplayColorCommand | SetDisplayColorOpacityCommand | SetDisplayOpacityCommand | SelectDisplayFillColorCommand | SelectDisplayLineColorCommand | SetDisplayLineWidthCommand | SetDisplayRotationCommand | SetDisplaySegmentStartCapCommand | SetDisplaySegmentEndCapCommand | SetDisplaySegmentCapCommand | SetDisplaySegmentStartRadiusCommand | SetDisplaySegmentEndRadiusCommand | SetDisplaySegmentRadiusCommand | SetDisplayCropTopCommand | SetDisplayCropRightCommand | SetDisplayCropBottomCommand | SetDisplayCropLeftCommand | SetDisplayRotationCropTopCommand | SetDisplayRotationCropRightCommand | SetDisplayRotationCropBottomCommand | SetDisplayRotationCropLeftCommand | SelectDisplayBitmapColorIndexCommand | SelectDisplayBitmapColorIndicesCommand | SetDisplayBitmapScaleXCommand | SetDisplayBitmapScaleYCommand | SetDisplayBitmapScaleCommand | SelectDisplaySpriteColorIndexCommand | SelectDisplaySpriteColorIndicesCommand | SetDisplaySpriteScaleCommand | ClearDisplayRectCommand | DrawDisplayRectCommand | DrawDisplayRoundedRectCommand | DrawDisplayCircleCommand | DrawDisplayEllipseCommand | DrawDisplayPolygonCommand | DrawDisplaySegmentCommand | DrawDisplaySegmentsCommand | DrawDisplayArcCommand | DrawDisplayArcEllipseCommand | DrawDisplayBitmapCommand | DrawDisplaySpriteCommand;
export {};
