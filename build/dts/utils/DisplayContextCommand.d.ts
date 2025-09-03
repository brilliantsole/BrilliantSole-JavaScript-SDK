import { DisplayBitmap, DisplayBitmapColorPair, DisplaySpriteColorPair } from "../DisplayManager.ts";
import { DisplayAlignment, DisplayDirection, DisplaySegmentCap } from "./DisplayContextState.ts";
import { DisplayManagerInterface, DisplaySpriteSerializedLines } from "./DisplayManagerInterface.ts";
import { DisplayColorRGB } from "./DisplayUtils.ts";
import { Vector2 } from "./MathUtils.ts";
export declare const DisplayContextCommandTypes: readonly ["show", "clear", "setColor", "setColorOpacity", "setOpacity", "saveContext", "restoreContext", "selectBackgroundColor", "selectFillColor", "selectLineColor", "setLineWidth", "setRotation", "clearRotation", "setHorizontalAlignment", "setVerticalAlignment", "resetAlignment", "setSegmentStartCap", "setSegmentEndCap", "setSegmentCap", "setSegmentStartRadius", "setSegmentEndRadius", "setSegmentRadius", "setCropTop", "setCropRight", "setCropBottom", "setCropLeft", "clearCrop", "setRotationCropTop", "setRotationCropRight", "setRotationCropBottom", "setRotationCropLeft", "clearRotationCrop", "selectBitmapColor", "selectBitmapColors", "setBitmapScaleX", "setBitmapScaleY", "setBitmapScale", "resetBitmapScale", "selectSpriteColor", "selectSpriteColors", "resetSpriteColors", "setSpriteScaleX", "setSpriteScaleY", "setSpriteScale", "resetSpriteScale", "setSpritesLineHeight", "setSpritesDirection", "setSpritesLineDirection", "setSpritesSpacing", "setSpritesLineSpacing", "setSpritesAlignment", "setSpritesLineAlignment", "clearRect", "drawRect", "drawRoundRect", "drawCircle", "drawArc", "drawEllipse", "drawArcEllipse", "drawSegment", "drawSegments", "drawRegularPolygon", "drawPolygon", "drawQuadraticCurve", "drawQuadraticCurves", "drawBezierCurve", "drawBezierCurves", "drawPath", "drawClosedPath", "drawBitmap", "selectSpriteSheet", "drawSprite", "drawSprites"];
export type DisplayContextCommandType = (typeof DisplayContextCommandTypes)[number];
export declare const DisplaySpriteContextCommandTypes: readonly ["selectFillColor", "selectLineColor", "setLineWidth", "setRotation", "clearRotation", "setVerticalAlignment", "setHorizontalAlignment", "resetAlignment", "setSegmentStartCap", "setSegmentEndCap", "setSegmentCap", "setSegmentStartRadius", "setSegmentEndRadius", "setSegmentRadius", "setCropTop", "setCropRight", "setCropBottom", "setCropLeft", "clearCrop", "setRotationCropTop", "setRotationCropRight", "setRotationCropBottom", "setRotationCropLeft", "clearRotationCrop", "selectBitmapColor", "selectBitmapColors", "setBitmapScaleX", "setBitmapScaleY", "setBitmapScale", "resetBitmapScale", "selectSpriteColor", "selectSpriteColors", "resetSpriteColors", "setSpriteScaleX", "setSpriteScaleY", "setSpriteScale", "resetSpriteScale", "clearRect", "drawRect", "drawRoundRect", "drawCircle", "drawEllipse", "drawRegularPolygon", "drawSegment", "drawSegments", "drawArc", "drawArcEllipse", "drawBitmap", "drawSprite"];
export type DisplaySpriteContextCommandType = (typeof DisplaySpriteContextCommandTypes)[number];
export interface BaseDisplayContextCommand {
    type: DisplayContextCommandType | "runDisplayContextCommands";
    hide?: boolean;
}
export interface SimpleDisplayCommand extends BaseDisplayContextCommand {
    type: "show" | "clear" | "saveContext" | "restoreContext" | "clearRotation" | "clearCrop" | "clearRotationCrop" | "resetBitmapScale" | "resetSpriteColors" | "resetSpriteScale" | "resetAlignment";
}
export interface SetDisplayColorCommand extends BaseDisplayContextCommand {
    type: "setColor";
    colorIndex: number;
    color: DisplayColorRGB | string;
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
export interface SelectDisplayFillColorCommand extends BaseDisplayContextCommand {
    type: "selectFillColor";
    fillColorIndex: number;
}
export interface SelectDisplayLineColorCommand extends BaseDisplayContextCommand {
    type: "selectLineColor";
    lineColorIndex: number;
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
export interface BaseDisplayRectCommand extends BasePositionDisplayContextCommand, BaseSizeDisplayContextCommand {
}
export interface BaseDisplayCenterRectCommand extends BaseOffsetPositionDisplayContextCommand, BaseSizeDisplayContextCommand {
}
export interface ClearDisplayRectCommand extends BaseDisplayRectCommand {
    type: "clearRect";
}
export interface DrawDisplayRectCommand extends BaseDisplayCenterRectCommand {
    type: "drawRect";
}
export interface DrawDisplayRoundedRectCommand extends BaseOffsetPositionDisplayContextCommand, BaseSizeDisplayContextCommand {
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
export type DisplayContextCommand = SimpleDisplayCommand | SetDisplayColorCommand | SetDisplayColorOpacityCommand | SetDisplayOpacityCommand | SelectDisplayFillColorCommand | SelectDisplayLineColorCommand | SetDisplayLineWidthCommand | SetDisplayRotationCommand | SetDisplaySegmentStartCapCommand | SetDisplaySegmentEndCapCommand | SetDisplaySegmentCapCommand | SetDisplaySegmentStartRadiusCommand | SetDisplaySegmentEndRadiusCommand | SetDisplaySegmentRadiusCommand | SetDisplayCropTopCommand | SetDisplayCropRightCommand | SetDisplayCropBottomCommand | SetDisplayCropLeftCommand | SetDisplayRotationCropTopCommand | SetDisplayRotationCropRightCommand | SetDisplayRotationCropBottomCommand | SetDisplayRotationCropLeftCommand | SelectDisplayBitmapColorIndexCommand | SelectDisplayBitmapColorIndicesCommand | SetDisplayBitmapScaleXCommand | SetDisplayBitmapScaleYCommand | SetDisplayBitmapScaleCommand | SelectDisplaySpriteColorIndexCommand | SelectDisplaySpriteColorIndicesCommand | SetDisplaySpriteScaleXCommand | SetDisplaySpriteScaleYCommand | SetDisplaySpriteScaleCommand | ClearDisplayRectCommand | DrawDisplayRectCommand | DrawDisplayRoundedRectCommand | DrawDisplayCircleCommand | DrawDisplayEllipseCommand | DrawDisplayRegularPolygonCommand | DrawDisplaySegmentCommand | DrawDisplaySegmentsCommand | DrawDisplayArcCommand | DrawDisplayArcEllipseCommand | DrawDisplayBitmapCommand | DrawDisplaySpriteCommand | DrawDisplaySpritesCommand | SelectDisplaySpriteSheetCommand | SetDisplayHorizontalAlignmentCommand | SetDisplayVerticalAlignmentCommand | SetDisplaySpritesDirectionCommand | SetDisplaySpritesLineDirectionCommand | SetDisplaySpritesSpacingCommand | SetDisplaySpritesLineSpacingCommand | SetDisplaySpritesAlignmentCommand | SetDisplaySpritesLineAlignmentCommand | SetDisplaySpritesLineHeightCommand;
export declare function serializeContextCommand(displayManager: DisplayManagerInterface, command: DisplayContextCommand): DataView | undefined;
export declare function serializeContextCommands(displayManager: DisplayManagerInterface, commands: DisplayContextCommand[]): ArrayBuffer;
