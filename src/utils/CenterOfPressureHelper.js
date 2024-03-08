import { getInterpolation } from "./MathUtils";

/**
 * @typedef Vector2
 * @type {Object}
 * @property {number} x
 * @property {number} y
 */

/** @typedef {Vector2} CenterOfPressure */
/**
 * @typedef CenterOfPressureRange
 * @type {Object}
 * @property {Vector2} min
 * @property {Vector2} max
 */

class CenterOfPressureHelper {
    /** @type {CenterOfPressure} */
    #centerOfPressureRange;
    resetCenterOfPressureRange() {
        this.#centerOfPressureRange = {
            min: { x: Infinity, y: Infinity },
            max: { x: -Infinity, y: -Infinity },
        };
    }

    constructor() {
        this.resetCenterOfPressureRange();
    }

    /** @param {CenterOfPressure} centerOfPressure  */
    updateCenterOfPressureRange(centerOfPressure) {
        this.#centerOfPressureRange.min.x = Math.min(centerOfPressure.x, this.#centerOfPressureRange.min.x);
        this.#centerOfPressureRange.min.y = Math.min(centerOfPressure.y, this.#centerOfPressureRange.min.y);

        this.#centerOfPressureRange.max.x = Math.max(centerOfPressure.x, this.#centerOfPressureRange.max.x);
        this.#centerOfPressureRange.max.y = Math.max(centerOfPressure.y, this.#centerOfPressureRange.max.y);
    }
    /** @param {CenterOfPressure} centerOfPressure  */
    getCalibratedCenterOfPressure(centerOfPressure) {
        /** @type {CenterOfPressure} */
        const calibratedCenterOfPressure = {
            x: getInterpolation(
                centerOfPressure.x,
                this.#centerOfPressureRange.min.x,
                this.#centerOfPressureRange.max.x
            ),
            y: getInterpolation(
                centerOfPressure.y,
                this.#centerOfPressureRange.min.y,
                this.#centerOfPressureRange.max.y
            ),
        };
        return calibratedCenterOfPressure;
    }
}

export default CenterOfPressureHelper;
