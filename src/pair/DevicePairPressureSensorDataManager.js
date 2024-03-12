import PressureSensorDataManager from "../sensor/PressureSensorDataManager.js";
import CenterOfPressureHelper from "../utils/CenterOfPressureHelper.js";
import { createConsole } from "../utils/Console.js";
import Device from "../Device.js";

const _console = createConsole("DevicePairPressureSensorDataManager", { log: true });

/** @typedef {import("../Device.js").SensorType} SensorType */

/** @typedef {import("../sensor/PressureSensorDataManager.js").PressureData} PressureData */

/**
 * @typedef DevicePairRawPressureData
 * @type {Object}
 * @property {PressureData} left
 * @property {PressureData} right
 */

/**
 * @typedef DevicePairPressureData
 * @type {Object}
 *
 * @property {number} rawSum
 * @property {number} normalizedSum
 *
 * @property {CenterOfPressure?} center
 * @property {CenterOfPressure?} calibratedCenter
 */

class DevicePairPressureSensorDataManager {
    static get Sides() {
        return Device.InsoleSides;
    }
    get sides() {
        return Device.InsoleSides;
    }

    // PRESSURE DATA

    /** @type {DevicePairRawPressureData} */
    #rawPressureData = {};

    #centerOfPressureHelper = new CenterOfPressureHelper();

    resetPressureRange() {
        this.#centerOfPressureHelper.resetRange();
    }

    /** @param {DeviceEvent} event  */
    onDevicePressureData(event) {
        const { pressure } = event.message;
        this.#rawPressureData[event.target.insoleSide] = pressure;
        if (this.#hasAllPressureData) {
            return this.#updatePressureData();
        }
    }

    get #hasAllPressureData() {
        this.sides.every((side) => side in this.#rawPressureData);
    }

    static #Scalars = {
        pressure: PressureSensorDataManager.Scalars.pressure / this.Sides.length,
    };
    static get Scalars() {
        return this.#Scalars;
    }
    get scalars() {
        return DevicePair.Scalars;
    }

    #updatePressureData() {
        const scalar = this.scalars.pressure;

        /** @type {DevicePairPressureData} */
        const pressure = { rawSum: 0, normalizedSum: 0 };

        this.#rawPressureData.left.data.rawSum;
        this.sides.forEach((side) => {
            pressure.rawSum += this.#rawPressureData[side].data.rawSum;
        });

        if (pressure.rawSum > 0) {
            pressure.normalizedSum = pressure.rawSum * scalar;

            pressure.center = { x: 0, y: 0 };
            this.sides.forEach((side) => {
                const sidePressureData = this.#rawPressureData[side].data;
                const rawPressureSumWeight = sidePressureData.rawSum / rawPressureSum;
                pressure.center.y += sidePressureData.center.y * rawPressureSumWeight;
                if (side == "right") {
                    pressure.center.x = rawPressureSumWeight;
                }
            });

            this.#centerOfPressureHelper.updateCenterOfPressureRange(pressure.center);
            pressure.calibratedCenter = this.#centerOfPressureHelper.getCalibratedCenterOfPressure(pressure.center);
        }

        _console.log({ pressure });

        return pressure;
    }
}

export default DevicePairPressureSensorDataManager;
