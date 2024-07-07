import { getInterpolation } from "./MathUtils.js";

/**
 * @typedef {Object} Range
 * @property {number} min
 * @property {number} max
 * @property {number} range
 */

/** @type {Range} */
const initialRange = { min: Infinity, max: -Infinity, range: 0 };

class RangeHelper {
  /** @type {Range} */
  #range = Object.assign({}, initialRange);

  reset() {
    Object.assign(this.#range, initialRange);
  }

  /** @param {number} value */
  update(value) {
    this.#range.min = Math.min(value, this.#range.min);
    this.#range.max = Math.max(value, this.#range.max);
    this.#range.range = this.#range.max - this.#range.min;
  }

  /** @param {number} value */
  getNormalization(value) {
    return this.#range.range * value || 0;
  }

  /** @param {number} value */
  updateAndGetNormalization(value) {
    this.update(value);
    return this.getNormalization(value);
  }
}

export default RangeHelper;
