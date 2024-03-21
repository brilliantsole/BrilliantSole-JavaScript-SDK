import { createConsole } from "../utils/Console.js";
import CenterOfPressureHelper from "../utils/CenterOfPressureHelper.js";
import RangeHelper from "../utils/RangeHelper.js";
import { createArray } from "../utils/ArrayUtils.js";

/** @typedef {import("../Device.js").DeviceType} DeviceType */

/** @typedef {"hallux" | "digits" | "innerMetatarsal" | "centerMetatarsal" | "outerMetatarsal" | "arch" | "lateral" | "heel"} PressureSensorName */
/** @typedef {"pressure"} PressureSensorType */

/**
 * @typedef Vector2
 * @type {Object}
 * @property {number} x
 * @property {number} y
 */

/** @typedef {Vector2} PressureSensorPosition */

/** @typedef {import("../utils/CenterOfPressureHelper.js").CenterOfPressure} CenterOfPressure */

/**
 * @typedef PressureSensorValue
 * @type {Object}
 * @property {PressureSensorName} name
 * @property {PressureSensorPosition} position
 * @property {number} rawValue
 * @property {number} normalizedValue
 * @property {number?} weightedValue
 */

/**
 * @typedef PressureData
 * @type {Object}
 * @property {PressureSensorValue[]} sensors
 *
 * @property {number} rawSum
 * @property {number} normalizedSum
 *
 * @property {CenterOfPressure?} center
 * @property {CenterOfPressure?} normalizedCenter
 */

const _console = createConsole("PressureSensorDataManager", { log: true });

class PressureSensorDataManager {
    /** @type {DeviceType} */
    #deviceType;
    get deviceType() {
        return this.#deviceType;
    }
    set deviceType(newDeviceType) {
        _console.assertTypeWithError(newDeviceType, "string");
        if (this.#deviceType == newDeviceType) {
            _console.log(`redundant deviceType assignment "${newDeviceType}"`);
            return;
        }
        _console.log({ newDeviceType });
        this.#deviceType = newDeviceType;

        this.#updatePressureSensorPositions();
        this.resetRange();
    }

    /** @type {PressureSensorName[]} */
    static #Names = [
        "hallux",
        "digits",
        "innerMetatarsal",
        "centerMetatarsal",
        "outerMetatarsal",
        "arch",
        "lateral",
        "heel",
    ];
    static get Names() {
        return this.#Names;
    }
    get names() {
        return PressureSensorDataManager.Names;
    }

    static #Scalars = {
        pressure: 2 ** -16,
    };
    static get Scalars() {
        return this.#Scalars;
    }
    get scalars() {
        return PressureSensorDataManager.Scalars;
    }

    static #NumberOfPressureSensors = 8;
    static get NumberOfPressureSensors() {
        return this.#NumberOfPressureSensors;
    }
    get numberOfPressureSensors() {
        return PressureSensorDataManager.NumberOfPressureSensors;
    }

    /**
     * positions the right insole (top to bottom) - mirror horizontally for the left insole.
     *
     * xy positions are the centers of each sensor in the .svg file (y is from the top)
     * @type {PressureSensorPosition[]}
     */
    static #PressureSensorPositions = [
        { x: 110, y: 73 },
        { x: 250, y: 155 },
        { x: 56, y: 236 },
        { x: 185, y: 277 },
        { x: 305, y: 337 },
        { x: 69, y: 584 },
        { x: 285, y: 635 },
        { x: 162, y: 914 },
    ].map(({ x, y }) => ({ x: x / 365, y: 1 - y / 1000 }));
    static get PressureSensorPositions() {
        return this.#PressureSensorPositions;
    }
    /** @type {PressureSensorPosition[]} */
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

    /** @type {RangeHelper[]} */
    #pressureSensorRangeHelpers = createArray(this.numberOfPressureSensors, () => new RangeHelper());
    // FILL -

    #centerOfPressureHelper = new CenterOfPressureHelper();
    resetRange() {
        this.#pressureSensorRangeHelpers.forEach((rangeHelper) => rangeHelper.reset());
        this.#centerOfPressureHelper.reset();
    }

    /**
     * @param {DataView} dataView
     * @param {number} byteOffset
     */
    parsePressure(dataView, byteOffset) {
        const scalar = this.scalars.pressure;

        /** @type {PressureData} */
        const pressure = { sensors: [], rawSum: 0, normalizedSum: 0 };
        for (let index = 0; index < this.numberOfPressureSensors; index++, byteOffset += 2) {
            const rawValue = dataView.getUint16(byteOffset, true);
            const rangeHelper = this.#pressureSensorRangeHelpers[index];
            const normalizedValue = rangeHelper.updateAndGetNormalization(rawValue);
            const position = this.pressureSensorPositions[index];
            const name = this.names[index];
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
            pressure.normalizedCenter = this.#centerOfPressureHelper.updateAndGetNormalization(pressure.center);
        }

        _console.log({ pressure });
        return pressure;
    }
}

export default PressureSensorDataManager;
