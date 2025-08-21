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
  fillColorIndex: number;
  lineColorIndex: number;
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

  // FILL - sprite spacing, direction, etc
};
export type DisplayContextStateKey = keyof DisplayContextState;
export type PartialDisplayContextState = Partial<DisplayContextState>;

export const DefaultDisplayContextState: DisplayContextState = {
  fillColorIndex: 1,

  lineColorIndex: 1,
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
};
