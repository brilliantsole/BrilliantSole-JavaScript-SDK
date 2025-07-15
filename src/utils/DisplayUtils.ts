import {
  DisplayBrightness,
  DisplayBrightnesses,
  DisplayPixelDepth,
  DisplayPixelDepths,
} from "../DisplayManager.ts";
import { createConsole } from "./Console.ts";
import { DisplayContextCommandType } from "./DisplayContextCommand.ts";
import {
  DisplayContextStateKey,
  DisplaySegmentCap,
  DisplaySegmentCaps,
} from "./DisplayContextState.ts";
import { Int16Max, Uint16Max } from "./MathUtils.ts";

const _console = createConsole("DisplayUtils", { log: false });

export function formatRotation(
  rotation: number,
  isRadians?: boolean,
  isSigned?: boolean
) {
  if (isRadians) {
    const rotationRad = rotation;
    _console.log({ rotationRad });
    rotation %= 2 * Math.PI;
    rotation /= 2 * Math.PI;
  } else {
    const rotationDeg = rotation;
    _console.log({ rotationDeg });
    rotation %= 360;
    rotation /= 360;
  }
  if (isSigned) {
    rotation *= Int16Max;
  } else {
    rotation *= Uint16Max;
  }
  rotation = Math.floor(rotation);
  _console.log({ formattedRotation: rotation });
  return rotation;
}

export function roundToStep(value: number, step: number) {
  const roundedValue = Math.floor(value / step) * step;
  _console.log(value, step, roundedValue);
  return roundedValue;
}

export const maxDisplayScale = 100;
export const displayScaleStep = 0.002;
export function formatScale(bitmapScale: number) {
  bitmapScale /= displayScaleStep;
  _console.log({ formattedBitmapScale: bitmapScale });
  return bitmapScale;
}
export function roundScale(bitmapScale: number) {
  return roundToStep(bitmapScale, displayScaleStep);
}

export function assertValidSegmentCap(segmentCap: DisplaySegmentCap) {
  _console.assertEnumWithError(segmentCap, DisplaySegmentCaps);
}

export function assertValidDisplayBrightness(
  displayBrightness: DisplayBrightness
) {
  _console.assertEnumWithError(displayBrightness, DisplayBrightnesses);
}

export function assertValidColorValue(name: string, value: number) {
  _console.assertRangeWithError(name, value, 0, 255);
}
export function assertValidColor(color: DisplayColorRGB) {
  assertValidColorValue("red", color.r);
  assertValidColorValue("green", color.g);
  assertValidColorValue("blue", color.b);
}

export function assertValidOpacity(value: number) {
  _console.assertRangeWithError("opacity", value, 0, 1);
}

export const DisplayCropDirections = [
  "top",
  "right",
  "bottom",
  "left",
] as const;
export type DisplayCropDirection = (typeof DisplayCropDirections)[number];

export const DisplayCropDirectionToStateKey: Record<
  DisplayCropDirection,
  DisplayContextStateKey
> = {
  top: "cropTop",
  right: "cropRight",
  bottom: "cropBottom",
  left: "cropLeft",
};
export const DisplayCropDirectionToCommand: Record<
  DisplayCropDirection,
  DisplayContextCommandType
> = {
  top: "setCropTop",
  right: "setCropRight",
  bottom: "setCropBottom",
  left: "setCropLeft",
};

export const DisplayRotationCropDirectionToStateKey: Record<
  DisplayCropDirection,
  DisplayContextStateKey
> = {
  top: "rotationCropTop",
  right: "rotationCropRight",
  bottom: "rotationCropBottom",
  left: "rotationCropLeft",
};
export const DisplayRotationCropDirectionToCommand: Record<
  DisplayCropDirection,
  DisplayContextCommandType
> = {
  top: "setRotationCropTop",
  right: "setRotationCropRight",
  bottom: "setRotationCropBottom",
  left: "setRotationCropLeft",
};

export function pixelDepthToNumberOfColors(pixelDepth: DisplayPixelDepth) {
  return 2 ** Number(pixelDepth);
}
export function pixelDepthToPixelsPerByte(pixelDepth: DisplayPixelDepth) {
  return 8 / Number(pixelDepth);
}
export function pixelDepthToPixelBitWidth(pixelDepth: DisplayPixelDepth) {
  return Number(pixelDepth);
}
export function numberOfColorsToPixelDepth(numberOfColors: number) {
  return DisplayPixelDepths.find(
    (pixelDepth) => numberOfColors <= pixelDepthToNumberOfColors(pixelDepth)
  );
}

export const DisplayScaleDirections = ["x", "y", "all"] as const;
export type DisplayScaleDirection = (typeof DisplayScaleDirections)[number];

export const DisplayBitmapScaleDirectionToCommand: Record<
  DisplayScaleDirection,
  DisplayContextCommandType
> = {
  x: "setBitmapScaleX",
  y: "setBitmapScaleY",
  all: "setBitmapScale",
};

export const DisplaySpriteScaleDirectionToCommand: Record<
  DisplayScaleDirection,
  DisplayContextCommandType
> = {
  x: "setSpriteScaleX",
  y: "setSpriteScaleY",
  all: "setSpriteScale",
};

export type DisplayColorRGB = {
  r: number;
  g: number;
  b: number;
};
export type DisplayColorYCbCr = {
  y: number;
  cb: number;
  cr: number;
};
