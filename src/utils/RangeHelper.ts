import { getInterpolation } from "./MathUtils.ts";

interface Range {
  min: number;
  max: number;
  range: number;
}

const initialRange: Range = { min: Infinity, max: -Infinity, range: 0 };

class RangeHelper {
  #range: Range = Object.assign({}, initialRange);

  reset() {
    Object.assign(this.#range, initialRange);
  }

  update(value: number) {
    this.#range.min = Math.min(value, this.#range.min);
    this.#range.max = Math.max(value, this.#range.max);
    this.#range.range = this.#range.max - this.#range.min;
  }

  getNormalization(value: number) {
    return getInterpolation(value, this.#range.min, this.#range.max, this.#range.range) * this.#range.range;
  }

  updateAndGetNormalization(value: number) {
    this.update(value);
    return this.getNormalization(value);
  }
}

export default RangeHelper;
