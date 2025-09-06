import { PressureSensorPosition } from "../sensor/PressureSensorDataManager.ts";
import { createConsole } from "./Console.ts";

const _console = createConsole("MathUtils", { log: false });

export function getInterpolation(
  value: number,
  min: number,
  max: number,
  span: number
) {
  if (span == undefined) {
    span = max - min;
  }
  return (value - min) / span;
}

export const Uint16Max = 2 ** 16;
export const Int16Max = 2 ** 15;
export const Int16Min = -(2 ** 15) - 1;

function removeLower2Bytes(number: number) {
  const lower2Bytes = number % Uint16Max;
  return number - lower2Bytes;
}

const timestampThreshold = 60_000;

export function parseTimestamp(dataView: DataView, byteOffset: number) {
  const now = Date.now();
  const nowWithoutLower2Bytes = removeLower2Bytes(now);
  const lower2Bytes = dataView.getUint16(byteOffset, true);
  let timestamp = nowWithoutLower2Bytes + lower2Bytes;
  if (Math.abs(now - timestamp) > timestampThreshold) {
    _console.log("correcting timestamp delta");
    timestamp += Uint16Max * Math.sign(now - timestamp);
  }
  return timestamp;
}

export interface Vector2 {
  x: number;
  y: number;
}

export function getVector2Length(vector: Vector2) {
  const { x, y } = vector;
  return Math.sqrt(x ** 2 + y ** 2);
}

export function getVector2Angle(vector: Vector2) {
  const { x, y } = vector;
  return Math.atan2(y, x);
}

export function multiplyVector2ByScalar(
  vector: Vector2,
  scalar: number
): Vector2 {
  let { x, y } = vector;
  x *= scalar;
  y *= scalar;
  return { x, y };
}
export function normalizedVector2(vector: Vector2): Vector2 {
  return multiplyVector2ByScalar(vector, 1 / getVector2Length(vector));
}

export interface Vector3 extends Vector2 {
  z: number;
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface Euler {
  heading: number;
  pitch: number;
  roll: number;
}

export function computeVoronoiWeights(
  points: PressureSensorPosition[],
  sampleCount = 100000
) {
  const n = points.length;
  const counts = new Array(n).fill(0);

  for (let i = 0; i < sampleCount; i++) {
    const x = Math.random();
    const y = Math.random();

    // Find the closest input point
    let minDist = Infinity;
    let closestIndex = -1;

    for (let j = 0; j < n; j++) {
      const { x: px, y: py } = points[j];
      const dist = (px - x) ** 2 + (py - y) ** 2; // Squared Euclidean distance
      if (dist < minDist) {
        minDist = dist;
        closestIndex = j;
      }
    }

    // Increment count for the closest point
    counts[closestIndex]++;
  }

  // Convert counts to weights (sum to 1)
  return counts.map((c) => c / sampleCount);
}

export function getVector3Length(vector: Vector3) {
  const { x, y, z } = vector;
  return Math.sqrt(x ** 2 + y ** 2 + z ** 2);
}

export function clamp(value: number, min: number = 0, max: number = 1) {
  return Math.min(Math.max(value, min), max);
}

export function degToRad(deg: number) {
  return deg * (Math.PI / 180);
}

export function radToDeg(rad: number) {
  return rad * (180 / Math.PI);
}

export const twoPi = Math.PI * 2;
export function normalizeRadians(rad: number): number {
  return ((rad % twoPi) + twoPi) % twoPi;
}

export function isAngleInRange(
  angle: number,
  start: number,
  end: number,
  isPositive: boolean
): boolean {
  angle = normalizeRadians(angle);
  start = normalizeRadians(start);
  end = normalizeRadians(end);

  if (isPositive) {
    if (end < start) end += twoPi;
    if (angle < start) angle += twoPi;
    return angle >= start && angle <= end;
  } else {
    if (start < end) start += twoPi;
    if (angle > start) angle -= twoPi;
    return angle <= start && angle >= end;
  }
}
