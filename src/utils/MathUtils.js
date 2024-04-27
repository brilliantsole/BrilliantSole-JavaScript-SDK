/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 */
export function getInterpolation(value, min, max) {
    return (value - min) / (max - min);
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
