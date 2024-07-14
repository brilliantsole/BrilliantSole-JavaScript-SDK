export function getInterpolation(value: number, min: number, max: number, range: number) {
  if (range == undefined) {
    range = max - min;
  }
  return (value - min) / range;
}

const Uint16Max = 2 ** 16;

function removeLower2Bytes(number: number) {
  const lower2Bytes = number % Uint16Max;
  return number - lower2Bytes;
}

export function parseTimestamp(dataView: DataView, byteOffset: number) {
  const now = Date.now();
  const nowWithoutLower2Bytes = removeLower2Bytes(now);
  const lower2Bytes = dataView.getUint16(byteOffset, true);
  const timestamp = nowWithoutLower2Bytes + lower2Bytes;
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
