/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 */
function getInterpolation(value, min, max) {
    return (value - min) / (max - min);
}

const Uint16Max = 2 ** 16;

export { getInterpolation, Uint16Max };
