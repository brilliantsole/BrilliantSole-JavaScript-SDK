/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @param {number} [range]
 */
export function getInterpolation(value, min, max, range) {
  if (range == undefined) {
    range = max - min;
  }
  return (value - min) / range;
}

const Uint16Max = 2 ** 16;

/** @param {number} number */
function removeLower2Bytes(number) {
  const lower2Bytes = number % Uint16Max;
  return number - lower2Bytes;
}

/**
 * @param {DataView} dataView
 * @param {number} byteOffset
 */
export function parseTimestamp(dataView, byteOffset) {
  const now = Date.now();
  const nowWithoutLower2Bytes = removeLower2Bytes(now);
  const lower2Bytes = dataView.getUint16(byteOffset, true);
  const timestamp = nowWithoutLower2Bytes + lower2Bytes;
  return timestamp;
}

/**
 * @typedef {Object} Vector2
 * @property {number} x
 * @property {number} y
 */
