import RangeHelper from "./RangeHelper.ts";

import { Vector2 } from "./MathUtils.ts";

export type CenterOfPressure = Vector2;

export interface CenterOfPressureRange {
  x: RangeHelper;
  y: RangeHelper;
}

class CenterOfPressureHelper {
  #range: CenterOfPressureRange = {
    x: new RangeHelper(),
    y: new RangeHelper(),
  };
  reset() {
    this.#range.x.reset();
    this.#range.y.reset();
  }

  update(centerOfPressure: CenterOfPressure) {
    this.#range.x.update(centerOfPressure.x);
    this.#range.y.update(centerOfPressure.y);
  }
  getNormalization(centerOfPressure: CenterOfPressure): CenterOfPressure {
    return {
      x: this.#range.x.getNormalization(centerOfPressure.x),
      y: this.#range.y.getNormalization(centerOfPressure.y),
    };
  }

  updateAndGetNormalization(centerOfPressure: CenterOfPressure) {
    this.update(centerOfPressure);
    return this.getNormalization(centerOfPressure);
  }
}

export default CenterOfPressureHelper;
