import { getInterpolation } from "./MathUtils.js";

/**
 * @typedef Range
 * @type {Object}
 * @property {number} min
 * @property {number} max
 */

/** @type {Range} */
const initialRange = { min: Infinity, max: -Infinity };

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
    }

    /** @param {number} value */
    getNormalization(value) {
        return getInterpolation(value, this.#range.min, this.#range.max);
    }

    /** @param {number} value */
    updateAndGetNormalization(value) {
        this.update(value);
        return this.getNormalization(value);
    }
}

export default RangeHelper;
