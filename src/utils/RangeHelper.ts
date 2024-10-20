import { getInterpolation } from "./MathUtils.ts";

interface Range {
  min: number;
  max: number;
  span: number;
}

const initialRange: Range = { min: Infinity, max: -Infinity, span: 0 };

class RangeHelper {
  #range: Range = Object.assign({}, initialRange);
  get min() {
    return this.#range.min;
  }
  get max() {
    return this.#range.max;
  }

  set min(newMin) {
    this.#range.min = newMin;
    this.#range.max = Math.max(newMin, this.#range.max);
    this.#updateSpan();
  }
  set max(newMax) {
    this.#range.max = newMax;
    this.#range.min = Math.min(newMax, this.#range.min);
    this.#updateSpan();
  }

  #updateSpan() {
    this.#range.span = this.#range.max - this.#range.min;
  }

  reset() {
    Object.assign(this.#range, initialRange);
  }

  update(value: number) {
    this.#range.min = Math.min(value, this.#range.min);
    this.#range.max = Math.max(value, this.#range.max);
    this.#updateSpan();
  }

  getNormalization(value: number, weightByRange: boolean) {
    let normalization = getInterpolation(value, this.#range.min, this.#range.max, this.#range.span);
    if (weightByRange) {
      normalization *= this.#range.span;
    }
    return normalization || 0;
  }

  updateAndGetNormalization(value: number, weightByRange: boolean) {
    this.update(value);
    return this.getNormalization(value, weightByRange);
  }
}

export default RangeHelper;
