import { createConsole } from "./Console.ts";
import { deepEqual } from "./ObjectUtils.ts";

const _console = createConsole("DisplayContextState", { log: true });

export const DisplaySegmentCaps = ["flat", "round"] as const;
export type DisplaySegmentCap = (typeof DisplaySegmentCaps)[number];

export const DisplayAlignments = ["start", "center", "end"] as const;
export type DisplayAlignment = (typeof DisplayAlignments)[number];

export const DisplayAlignmentDirections = ["horizontal", "vertical"] as const;
export type DisplayAlignmentDirection =
  (typeof DisplayAlignmentDirections)[number];

export const DisplayDirections = ["right", "left", "up", "down"] as const;
export type DisplayDirection = (typeof DisplayDirections)[number];

export type DisplayContextState = {
  backgroundColorIndex: number;
  fillColorIndex: number;
  lineColorIndex: number;

  ignoreFill: boolean;
  ignoreLine: boolean;
  fillBackground: boolean;

  lineWidth: number;
  rotation: number;

  horizontalAlignment: DisplayAlignment;
  verticalAlignment: DisplayAlignment;

  segmentStartCap: DisplaySegmentCap;
  segmentEndCap: DisplaySegmentCap;

  segmentStartRadius: number;
  segmentEndRadius: number;

  cropTop: number;
  cropRight: number;
  cropBottom: number;
  cropLeft: number;

  rotationCropTop: number;
  rotationCropRight: number;
  rotationCropBottom: number;
  rotationCropLeft: number;

  bitmapColorIndices: number[];
  bitmapScaleX: number;
  bitmapScaleY: number;

  spriteColorIndices: number[];
  spriteScaleX: number;
  spriteScaleY: number;

  spriteSheetName?: string;

  spritesLineHeight: number;
  spritesDirection: DisplayDirection;
  spritesLineDirection: DisplayDirection;
  spritesSpacing: number;
  spritesLineSpacing: number;
  spritesAlignment: DisplayAlignment;
  spritesLineAlignment: DisplayAlignment;
};
export type DisplayContextStateKey = keyof DisplayContextState;
export type PartialDisplayContextState = Partial<DisplayContextState>;

export const DefaultDisplayContextState: DisplayContextState = {
  backgroundColorIndex: 0,
  fillColorIndex: 1,
  lineColorIndex: 1,

  ignoreFill: false,
  ignoreLine: false,
  fillBackground: false,

  lineWidth: 0,
  rotation: 0,

  horizontalAlignment: "center",
  verticalAlignment: "center",

  segmentStartCap: "flat",
  segmentEndCap: "flat",

  segmentStartRadius: 1,
  segmentEndRadius: 1,

  cropTop: 0,
  cropRight: 0,
  cropBottom: 0,
  cropLeft: 0,

  rotationCropTop: 0,
  rotationCropRight: 0,
  rotationCropBottom: 0,
  rotationCropLeft: 0,

  bitmapColorIndices: new Array(0).fill(0),
  bitmapScaleX: 1,
  bitmapScaleY: 1,

  spriteColorIndices: new Array(0).fill(0),
  spriteScaleX: 1,
  spriteScaleY: 1,

  spriteSheetName: undefined,

  spritesLineHeight: 0,

  spritesDirection: "right",
  spritesLineDirection: "down",

  spritesSpacing: 0,
  spritesLineSpacing: 0,

  spritesAlignment: "end",
  spritesLineAlignment: "start",
};

export function isDirectionPositive(direction: DisplayDirection) {
  switch (direction) {
    case "right":
    case "down":
      return true;
    case "left":
    case "up":
      return false;
  }
}
export function isDirectionHorizontal(direction: DisplayDirection) {
  switch (direction) {
    case "right":
    case "left":
      return true;
    case "down":
    case "up":
      return false;
  }
}

export function diffContextState(
  state: PartialDisplayContextState,
  other: PartialDisplayContextState = DefaultDisplayContextState,
) {
  let differences: DisplayContextStateKey[] = [];
  const keys = Object.keys(other) as DisplayContextStateKey[];
  keys.forEach((key) => {
    const value = other[key]!;

    // if (Array.isArray(value) && value.length == 0) {
    //   return;
    // }

    if (!deepEqual(state[key], value)) {
      differences.push(key);
    }
  });
  _console.log("diff displayContextState", other, differences);
  return differences;
}

export function updateContextState(
  state: DisplayContextState,
  newState: PartialDisplayContextState,
) {
  let differences = diffContextState(state, newState);
  if (differences.length == 0) {
    _console.log("redundant contextState", newState);
  } else {
    _console.log("found contextState differences", newState);
  }
  differences.forEach((key) => {
    const value = newState[key]!;
    // @ts-expect-error
    state[key] = value;
    _console.log("updated state", { key, value }, state);
  });
  return differences;
}

export function resetContextState(
  state: DisplayContextState,
  numberOfColors: number,
  keepColorIndices?: boolean,
  keepSpriteColorIndices?: boolean,
) {
  _console.log("reset", {
    numberOfColors,
    keepColorIndices,
    keepSpriteColorIndices,
  });

  const spriteColorIndices = state.spriteColorIndices.slice();
  const { fillColorIndex, lineColorIndex, backgroundColorIndex } = state;

  const differences = diffContextState(state, DefaultDisplayContextState);
  _console.log("reset differences", differences);

  Object.assign(state, DefaultDisplayContextState);

  if (keepColorIndices) {
    state.fillColorIndex = fillColorIndex;
    state.lineColorIndex = lineColorIndex;
    state.backgroundColorIndex = backgroundColorIndex;
  }

  if (keepSpriteColorIndices) {
    state.spriteColorIndices = spriteColorIndices;
  } else {
    state.spriteColorIndices = new Array(numberOfColors).fill(0);
  }

  state.bitmapColorIndices = new Array(numberOfColors).fill(0);

  return differences;
}
