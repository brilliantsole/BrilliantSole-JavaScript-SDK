import {
  DisplayBezierCurve,
  DisplayBezierCurveType,
  DisplayBrightness,
  DisplayBrightnesses,
  DisplayPixelDepth,
  DisplayPixelDepths,
  DisplayPointDataType,
  DisplayPointDataTypes,
  displayPointDataTypeToRange,
  displayPointDataTypeToSize,
  DisplayWireframe,
  DisplayWireframeEdge,
} from "../DisplayManager.ts";
import { createConsole } from "./Console.ts";
import { DisplayContextCommandType } from "./DisplayContextCommand.ts";
import {
  DisplayAlignment,
  DisplayAlignmentDirection,
  DisplayAlignmentDirections,
  DisplayAlignments,
  DisplayContextStateKey,
  DisplayDirection,
  DisplayDirections,
  DisplaySegmentCap,
  DisplaySegmentCaps,
} from "./DisplayContextState.ts";
import {
  getVector2Distance,
  Int16Max,
  Uint16Max,
  Vector2,
} from "./MathUtils.ts";
import RangeHelper from "./RangeHelper.ts";

const _console = createConsole("DisplayUtils", { log: true });

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
  const roundedValue = Math.round(value / step) * step;
  //_console.log(value, step, roundedValue);
  return roundedValue;
}

export const minDisplayScale = -50;
export const maxDisplayScale = 50;
export const displayScaleStep = 0.002;
export function formatScale(bitmapScale: number) {
  bitmapScale /= displayScaleStep;
  //_console.log({ formattedBitmapScale: bitmapScale });
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

export const DisplayContextCropStateKeys = [
  "cropTop",
  "cropRight",
  "cropBottom",
  "cropLeft",
] as const satisfies readonly DisplayContextStateKey[];
export type DisplayContextCropStateKey =
  (typeof DisplayContextCropStateKeys)[number];

export const DisplayCropDirectionToStateKey: Record<
  DisplayCropDirection,
  DisplayContextCropStateKey
> = {
  top: "cropTop",
  right: "cropRight",
  bottom: "cropBottom",
  left: "cropLeft",
};

export const DisplayContextCropCommandTypes = [
  "setCropTop",
  "setCropRight",
  "setCropBottom",
  "setCropLeft",
] as const satisfies readonly DisplayContextCommandType[];
export type DisplayContextCropCommandType =
  (typeof DisplayContextCropCommandTypes)[number];

export const DisplayCropDirectionToCommandType: Record<
  DisplayCropDirection,
  DisplayContextCropCommandType
> = {
  top: "setCropTop",
  right: "setCropRight",
  bottom: "setCropBottom",
  left: "setCropLeft",
};

export const DisplayContextRotationCropStateKeys = [
  "rotationCropTop",
  "rotationCropRight",
  "rotationCropBottom",
  "rotationCropLeft",
] as const satisfies readonly DisplayContextStateKey[];
export type DisplayContextRotationCropStateKey =
  (typeof DisplayContextRotationCropStateKeys)[number];

export const DisplayRotationCropDirectionToStateKey: Record<
  DisplayCropDirection,
  DisplayContextRotationCropStateKey
> = {
  top: "rotationCropTop",
  right: "rotationCropRight",
  bottom: "rotationCropBottom",
  left: "rotationCropLeft",
};

export const DisplayContextRotationCropCommandTypes = [
  "setRotationCropTop",
  "setRotationCropRight",
  "setRotationCropBottom",
  "setRotationCropLeft",
] as const satisfies readonly DisplayContextCommandType[];
export type DisplayContextRotationCropCommandType =
  (typeof DisplayContextRotationCropCommandTypes)[number];

export const DisplayRotationCropDirectionToCommandType: Record<
  DisplayCropDirection,
  DisplayContextRotationCropCommandType
> = {
  top: "setRotationCropTop",
  right: "setRotationCropRight",
  bottom: "setRotationCropBottom",
  left: "setRotationCropLeft",
};

export const DisplayContextAlignmentCommandTypes = [
  "setVerticalAlignment",
  "setHorizontalAlignment",
] as const satisfies readonly DisplayContextCommandType[];
export type DisplayContextAlignmentCommandType =
  (typeof DisplayContextAlignmentCommandTypes)[number];
export const DisplayAlignmentDirectionToCommandType: Record<
  DisplayAlignmentDirection,
  DisplayContextAlignmentCommandType
> = {
  horizontal: "setHorizontalAlignment",
  vertical: "setVerticalAlignment",
};

export const DisplayContextAlignmentStateKeys = [
  "verticalAlignment",
  "horizontalAlignment",
] as const satisfies readonly DisplayContextStateKey[];
export type DisplayContextAlignmentStateKey =
  (typeof DisplayContextAlignmentStateKeys)[number];

export const DisplayAlignmentDirectionToStateKey: Record<
  DisplayAlignmentDirection,
  DisplayContextAlignmentStateKey
> = {
  horizontal: "horizontalAlignment",
  vertical: "verticalAlignment",
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

export const DisplayBitmapScaleDirectionToCommandType: Record<
  DisplayScaleDirection,
  DisplayContextCommandType
> = {
  x: "setBitmapScaleX",
  y: "setBitmapScaleY",
  all: "setBitmapScale",
};

export const DisplaySpriteScaleDirectionToCommandType: Record<
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

export function assertValidAlignment(alignment: DisplayAlignment) {
  _console.assertEnumWithError(alignment, DisplayAlignments);
}

export function assertValidDirection(direction: DisplayDirection) {
  _console.assertEnumWithError(direction, DisplayDirections);
}

export function assertValidAlignmentDirection(
  direction: DisplayAlignmentDirection
) {
  _console.assertEnumWithError(direction, DisplayAlignmentDirections);
}

export const displayCurveTypeToNumberOfControlPoints: Record<
  DisplayBezierCurveType,
  number
> = {
  segment: 2,
  quadratic: 3,
  cubic: 4,
};
export const displayCurveTolerance = 3.0;
export const displayCurveToleranceSquared = displayCurveTolerance ** 2;

export const maxNumberOfDisplayCurvePoints = 150;
export function assertValidNumberOfControlPoints(
  curveType: DisplayBezierCurveType,
  controlPoints: Vector2[],
  isPath = false
) {
  let numberOfControlPoints =
    displayCurveTypeToNumberOfControlPoints[curveType];
  if (isPath) {
    numberOfControlPoints -= 1;
  }
  _console.assertWithError(
    controlPoints.length == numberOfControlPoints,
    `invalid number of control points ${controlPoints.length}, expected ${numberOfControlPoints}`
  );
}
export function assertValidPathNumberOfControlPoints(
  curveType: DisplayBezierCurveType,
  controlPoints: Vector2[]
) {
  const numberOfControlPoints =
    displayCurveTypeToNumberOfControlPoints[curveType];
  _console.assertWithError(
    (controlPoints.length - 1) % (numberOfControlPoints - 1) == 0,
    `invalid number of path control points ${controlPoints.length} for path "${curveType}"`
  );
}

export function assertValidPath(curves: DisplayBezierCurve[]) {
  curves.forEach((curve, index) => {
    const { type, controlPoints } = curve;
    assertValidNumberOfControlPoints(type, controlPoints, index > 0);
  });
}

export function assertValidWireframe({ points, edges }: DisplayWireframe) {
  _console.assertRangeWithError("numberOfPoints", points.length, 2, 255);
  _console.assertRangeWithError("numberOfEdges", edges.length, 1, 255);

  edges.forEach((edge, index) => {
    _console.assertRangeWithError(
      `edgeStartIndex.${index}`,
      edge.startIndex,
      0,
      points.length
    );
    _console.assertRangeWithError(
      `edgeEndIndex.${index}`,
      edge.endIndex,
      0,
      points.length
    );
  });
}

export function mergeWireframes(a: DisplayWireframe, b: DisplayWireframe) {
  const wireframe: DisplayWireframe = structuredClone(a);
  const pointIndexOffset = a.points.length;
  b.points.forEach((point) => {
    wireframe.points.push(point);
  });
  b.edges.forEach(({ startIndex, endIndex }) => {
    wireframe.edges.push({
      startIndex: startIndex + pointIndexOffset,
      endIndex: endIndex + pointIndexOffset,
    });
  });
  return trimWireframe(wireframe);
}

export function intersectWireframes(
  a: DisplayWireframe,
  b: DisplayWireframe,
  ignoreDirection = true
) {
  a = trimWireframe(a);
  b = trimWireframe(b);
  //_console.log("intersectWireframes", a, b);
  const wireframe: DisplayWireframe = { points: [], edges: [] };
  const pointIndices: { a: number; b: number }[] = [];
  const aPointIndices: number[] = [];
  const bPointIndices: number[] = [];
  a.points.forEach((point, aPointIndex) => {
    const bPointIndex = b.points.findIndex((_point) => {
      const distance = getVector2Distance(point, _point);
      return distance == 0;
    });
    if (bPointIndex != -1) {
      pointIndices.push({ a: aPointIndex, b: bPointIndex });
      aPointIndices.push(aPointIndex);
      bPointIndices.push(bPointIndex);
      wireframe.points.push(structuredClone(point));
    }
  });
  a.edges.forEach((aEdge) => {
    if (
      !aPointIndices.includes(aEdge.startIndex) ||
      !aPointIndices.includes(aEdge.endIndex)
    ) {
      return;
    }
    const startIndex = aPointIndices.indexOf(aEdge.startIndex);
    const endIndex = aPointIndices.indexOf(aEdge.endIndex);

    const bEdge = b.edges.find((bEdge) => {
      if (
        !bPointIndices.includes(bEdge.startIndex) ||
        !bPointIndices.includes(bEdge.endIndex)
      ) {
        return false;
      }
      const bStartIndex = bPointIndices.indexOf(bEdge.startIndex);
      const bEndIndex = bPointIndices.indexOf(bEdge.endIndex);
      if (ignoreDirection) {
        return (
          (startIndex == bStartIndex && endIndex == bEndIndex) ||
          (startIndex == bEndIndex && endIndex == bStartIndex)
        );
      } else {
        return startIndex == bStartIndex && endIndex == bEndIndex;
      }
    });

    if (!bEdge) {
      return;
    }

    wireframe.edges.push({
      startIndex,
      endIndex,
    });
  });
  //_console.log("intersectedWireframe", wireframe);
  return wireframe;
}

export function trimWireframe(wireframe: DisplayWireframe): DisplayWireframe {
  _console.log("trimming wireframe", wireframe);
  const { points, edges } = wireframe;
  const trimmedPoints: Vector2[] = [];
  const trimmedEdges: DisplayWireframeEdge[] = [];
  edges.forEach((edge) => {
    const { startIndex, endIndex } = edge;
    let startPoint = points[startIndex];
    let endPoint = points[endIndex];

    let trimmedStartIndex = trimmedPoints.findIndex(
      ({ x, y }) => startPoint.x == x && startPoint.y == y
    );
    if (trimmedStartIndex == -1) {
      //_console.log("adding startPoint", startPoint);
      trimmedPoints.push(startPoint);
      trimmedStartIndex = trimmedPoints.length - 1;
    }

    let trimmedEndIndex = trimmedPoints.findIndex(
      ({ x, y }) => endPoint.x == x && endPoint.y == y
    );
    if (trimmedEndIndex == -1) {
      //_console.log("adding endPoint", endPoint);
      trimmedPoints.push(endPoint);
      trimmedEndIndex = trimmedPoints.length - 1;
    }

    const trimmedEdge: DisplayWireframeEdge = {
      startIndex: trimmedStartIndex,
      endIndex: trimmedEndIndex,
    };
    let trimmedEdgeIndex = trimmedEdges.findIndex(
      ({ startIndex, endIndex }) =>
        startIndex == trimmedEdge.startIndex && endIndex == trimmedEdge.endIndex
    );
    if (trimmedEdgeIndex == -1) {
      //_console.log("adding edge", trimmedEdge);
      trimmedEdges.push(trimmedEdge);
      trimmedEdgeIndex = trimmedEdges.length - 1;
    }
  });
  _console.log("trimmedWireframe", trimmedPoints, trimmedEdges);
  return { points: trimmedPoints, edges: trimmedEdges };
}

export function getPointDataType(points: Vector2[]): DisplayPointDataType {
  const range = new RangeHelper();
  points.forEach(({ x, y }) => {
    range.update(x);
    range.update(y);
  });
  const pointDataType = DisplayPointDataTypes.find((pointDataType) => {
    const { min, max } = displayPointDataTypeToRange[pointDataType];
    return range.min >= min && range.max <= max;
  })!;
  _console.log("pointDataType", pointDataType, points);
  return pointDataType!;
}
export function serializePoints(
  points: Vector2[],
  pointDataType?: DisplayPointDataType,
  isPath = false
) {
  pointDataType = pointDataType || getPointDataType(points);
  _console.assertEnumWithError(pointDataType, DisplayPointDataTypes);
  const pointDataSize = displayPointDataTypeToSize[pointDataType];
  let dataViewLength = points.length * pointDataSize;
  if (!isPath) {
    dataViewLength += 2; // pointDataType + points.length
  }
  const dataView = new DataView(new ArrayBuffer(dataViewLength));
  _console.log(
    `serializing ${points.length} ${pointDataType} points (${dataView.byteLength} bytes)...`
  );
  let offset = 0;
  if (!isPath) {
    dataView.setUint8(offset++, DisplayPointDataTypes.indexOf(pointDataType));
    dataView.setUint8(offset++, points.length);
  }
  points.forEach(({ x, y }) => {
    switch (pointDataType) {
      case "int8":
        dataView.setInt8(offset, x);
        offset += 1;
        dataView.setInt8(offset, y);
        offset += 1;
        break;
      case "int16":
        dataView.setInt16(offset, x, true);
        offset += 2;
        dataView.setInt16(offset, y, true);
        offset += 2;
        break;
      case "float":
        dataView.setFloat32(offset, x, true);
        offset += 4;
        dataView.setFloat32(offset, y, true);
        offset += 4;
        break;
    }
  });
  return dataView;
}
