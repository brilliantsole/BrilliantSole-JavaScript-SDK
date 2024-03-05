import { createConsole } from "../utils/Console.js";
import { getInterpolation } from "../utils/MathUtils.js";

/** @typedef {import("../Device.js").BrilliantSoleDeviceType} BrilliantSoleDeviceType */

/** @typedef {"hallux" | "digits" | "metatarsal_inner" | "metatarsal_center" | "metatarsal_outer" | "arch" | "lateral" | "heel"} BrilliantSolePessureSensorType */
/** @typedef {"pressure"} BrilliantSolePressureSensorType */

/**
 * @typedef Vector2
 * @type {Object}
 * @property {number} x
 * @property {number} y
 */

/** @typedef {Vector2} BrilliantSolePressureSensorPosition */
/** @typedef {Vector2} BrilliantSoleCenterOfPressure */
/**
 * @typedef BrilliantSoleCenterOfPressureRange
 * @type {Object}
 * @property {Vector2} min
 * @property {Vector2} max
 */

/**
 * @typedef BrilliantSolePressureSensorValue
 * @type {Object}
 * @property {BrilliantSolePessureSensorType} name
 * @property {BrilliantSolePressureSensorPosition} position
 * @property {number} rawValue
 * @property {number} normalizedValue
 * @property {number?} weightedValue
 */

/**
 * @typedef BrilliantSolePessureData
 * @type {Object}
 * @property {BrilliantSolePressureSensorValue[]} sensors
 *
 * @property {number} rawSum
 * @property {number} normalizedSum
 *
 * @property {BrilliantSoleCenterOfPressure?} center
 * @property {BrilliantSoleCenterOfPressure?} calibratedCenter
 */

const _console = createConsole("PressureSensorDataManager", { log: true });

class PressureSensorDataManager {
    /** @type {BrilliantSoleDeviceType} */
    #deviceType;
    get deviceType() {
        return this.#deviceType;
    }
    set deviceType(newDeviceType) {
        _console.assertTypeWithError(newDeviceType, "string");
        if (this.#deviceType == newDeviceType) {
            _console.warn(`redundant deviceType assignment "${newDeviceType}"`);
            return;
        }
        _console.log({ newDeviceType });
        this.#deviceType = newDeviceType;

        this.#updatePressureSensorPositions();
        this.resetCenterOfPressureRange();
    }

    /** @type {BrilliantSolePessureSensorType[]} */
    static #Types = [
        "hallux",
        "digits",
        "metatarsal_inner",
        "metatarsal_center",
        "metatarsal_outer",
        "arch",
        "lateral",
        "heel",
    ];
    static get Types() {
        return this.#Types;
    }
    get types() {
        return PressureSensorDataManager.#Types;
    }

    static #Scalars = {
        pressure: 2 ** -16,
    };
    static get Scalars() {
        return this.#Scalars;
    }
    get scalars() {
        return PressureSensorDataManager.#Scalars;
    }

    static #NumberOfPressureSensors = 8;
    static get NumberOfPressureSensors() {
        return this.#NumberOfPressureSensors;
    }
    get numberOfPressureSensors() {
        return PressureSensorDataManager.#NumberOfPressureSensors;
    }

    /**
     * positions the right insole (top to bottom) - mirror horizontally for the left insole.
     *
     * xy positions are the centers of each sensor in the .svg file (y is from the top)
     * @type {BrilliantSolePressureSensorPosition[]}
     */
    static #PressureSensorPositions = [
        { x: 109, y: 74 },
        { x: 249, y: 154 },
        { x: 56, y: 236 },
        { x: 185, y: 277 },
        { x: 305, y: 337 },
        { x: 69, y: 584 },
        { x: 285, y: 635 },
        { x: 162, y: 914 },
    ].map(({ x, y }) => ({ x: x / 362, y: 1 - y / 1000 }));
    static get PressureSensorPositions() {
        console.log(this.#PressureSensorPositions);
        return this.#PressureSensorPositions;
    }
    /** @type {BrilliantSolePressureSensorPosition[]} */
    #pressureSensorPositions;
    get pressureSensorPositions() {
        return this.#pressureSensorPositions;
    }
    #updatePressureSensorPositions() {
        const pressureSensorPositions = PressureSensorDataManager.PressureSensorPositions.map(({ x, y }) => {
            if (this.deviceType == "leftInsole") {
                x = 1 - x;
            }
            return { x, y };
        });
        _console.log({ pressureSensorPositions });
        this.#pressureSensorPositions = pressureSensorPositions;
    }

    /** @type {BrilliantSoleCenterOfPressureRange} */
    #centerOfPressureRange;
    resetCenterOfPressureRange() {
        this.#centerOfPressureRange = {
            min: { x: Infinity, y: Infinity },
            max: { x: -Infinity, y: -Infinity },
        };
    }
    /** @param {BrilliantSoleCenterOfPressure} centerOfPressure  */
    #updateCenterOfPressureRange(centerOfPressure) {
        this.#centerOfPressureRange.min.x = Math.min(centerOfPressure.x, this.#centerOfPressureRange.min.x);
        this.#centerOfPressureRange.min.y = Math.min(centerOfPressure.y, this.#centerOfPressureRange.min.y);

        this.#centerOfPressureRange.max.x = Math.max(centerOfPressure.x, this.#centerOfPressureRange.max.x);
        this.#centerOfPressureRange.max.y = Math.max(centerOfPressure.y, this.#centerOfPressureRange.max.y);
    }
    /** @param {BrilliantSoleCenterOfPressure} centerOfPressure  */
    #getCalibratedCenterOfPressure(centerOfPressure) {
        /** @type {BrilliantSoleCenterOfPressure} */
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

    /**
     * @param {DataView} dataView
     * @param {number} byteOffset
     */
    parsePressure(dataView, byteOffset) {
        const scalar = this.scalars.pressure;

        /** @type {BrilliantSolePessureData} */
        const pressure = { sensors: [], rawSum: 0, normalizedSum: 0 };
        for (let index = 0; index < this.numberOfPressureSensors; index++, byteOffset += 2) {
            const rawValue = dataView.getUint16(byteOffset, true);
            const normalizedValue = rawValue * scalar;
            const position = this.pressureSensorPositions[index];
            const name = this.types[index];
            pressure.sensors[index] = { rawValue, normalizedValue, position, name };

            pressure.rawSum += rawValue;
            pressure.normalizedSum = normalizedValue / this.numberOfPressureSensors;
        }

        if (pressure.rawSum > 0) {
            pressure.center = { x: 0, y: 0 };
            pressure.sensors.forEach((sensor) => {
                sensor.weightedValue = sensor.rawValue / pressure.rawSum;
                pressure.center.x += sensor.position.x * sensor.weightedValue;
                pressure.center.y += sensor.position.y * sensor.weightedValue;
            });
            this.#updateCenterOfPressureRange(pressure.center);
            pressure.calibratedCenter = this.#getCalibratedCenterOfPressure(pressure.center);
        }

        _console.log({ pressure });
        return pressure;
    }
}

export default PressureSensorDataManager;
