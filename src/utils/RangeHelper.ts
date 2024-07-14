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
    return this.#range.range * value || 0;
  }

  updateAndGetNormalization(value: any) {
    this.update(value);
    return this.getNormalization(value);
  }
}

export default RangeHelper;
