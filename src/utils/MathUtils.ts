import { createConsole } from "./Console.ts";

const _console = createConsole("MathUtils", { log: true });

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
