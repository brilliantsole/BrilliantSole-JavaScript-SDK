import { getInterpolation } from "./MathUtils.ts";

interface Range {
  min: number;
  max: number;
  span: number;
}

const initialRange: Range = { min: Infinity, max: -Infinity, span: 0 };

class RangeHelper {
  #range: Range = Object.assign({}, initialRange);

  reset() {
    Object.assign(this.#range, initialRange);
  }

  update(value: number) {
    this.#range.min = Math.min(value, this.#range.min);
    this.#range.max = Math.max(value, this.#range.max);
    this.#range.span = this.#range.max - this.#range.min;
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
