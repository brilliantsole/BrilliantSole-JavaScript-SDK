import { PressureSensorPosition } from "../sensor/PressureSensorDataManager.ts";
import { createConsole } from "./Console.ts";

const _console = createConsole("MathUtils", { log: false });

export function getInterpolation(value: number, min: number, max: number, span: number) {
  if (span == undefined) {
    span = max - min;
  }
  return (value - min) / span;
}

export const Uint16Max = 2 ** 16;

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

export function computeVoronoiWeights(points: PressureSensorPosition[], sampleCount = 100000) {
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
