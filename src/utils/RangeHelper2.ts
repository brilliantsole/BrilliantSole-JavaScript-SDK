import RangeHelper from "./RangeHelper.ts";
import { Vector2 } from "./MathUtils.ts";

class RangeHelper2 {
  #range = {
    x: new RangeHelper(),
    y: new RangeHelper(),
  };
  reset() {
    this.#range.x.reset();
    this.#range.y.reset();
  }

  update(vector2: Vector2) {
    this.#range.x.update(vector2.x);
    this.#range.y.update(vector2.y);
  }
  getNormalization(
    vector2: Vector2,
    weightByRange?: boolean,
    clampValue?: boolean
  ): Vector2 {
    return {
      x: this.#range.x.getNormalization(vector2.x, weightByRange, clampValue),
      y: this.#range.y.getNormalization(vector2.y, weightByRange, clampValue),
    };
  }

  updateAndGetNormalization(vector2: Vector2, weightByRange?: boolean) {
    this.update(vector2);
    return this.getNormalization(vector2, weightByRange);
  }
}

export default RangeHelper2;
