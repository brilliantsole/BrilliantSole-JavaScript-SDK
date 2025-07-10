import { createConsole } from "./Console.ts";

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
  "sprite",

  "selectFont",
  "drawText",
] as const;
export type DisplayContextCommand = (typeof DisplayContextCommands)[number];
