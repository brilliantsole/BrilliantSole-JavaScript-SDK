import RangeHelper from "./RangeHelper.js";

/** @typedef {import("./MathUtils.js").Vector2} Vector2 */

/** @typedef {Vector2} CenterOfPressure */

/**
 * @typedef {Object} CenterOfPressureRange
 * @property {RangeHelper} x
 * @property {RangeHelper} y
 */

class CenterOfPressureHelper {
  /** @type {CenterOfPressureRange} */
  #range = {
    x: new RangeHelper(),
    y: new RangeHelper(),
  };
  reset() {
    this.#range.x.reset();
    this.#range.y.reset();
  }

  /** @param {CenterOfPressure} centerOfPressure  */
  update(centerOfPressure) {
    this.#range.x.update(centerOfPressure.x);
    this.#range.y.update(centerOfPressure.y);
  }
  /**
   * @param {CenterOfPressure} centerOfPressure
   * @returns {CenterOfPressure}
   */
  getNormalization(centerOfPressure) {
    return {
      x: this.#range.x.getNormalization(centerOfPressure.x),
      y: this.#range.y.getNormalization(centerOfPressure.y),
    };
  }

  /** @param {CenterOfPressure} centerOfPressure  */
  updateAndGetNormalization(centerOfPressure) {
    this.update(centerOfPressure);
    return this.getNormalization(centerOfPressure);
  }
}

export default CenterOfPressureHelper;
