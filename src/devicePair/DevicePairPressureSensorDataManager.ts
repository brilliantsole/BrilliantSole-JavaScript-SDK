import PressureSensorDataManager from "../sensor/PressureSensorDataManager.js";
import CenterOfPressureHelper from "../utils/CenterOfPressureHelper.js";
import { createConsole } from "../utils/Console.js";
import Device from "../Device.js";

const _console = createConsole("DevicePairPressureSensorDataManager", { log: true });

/** @typedef {import("../Device.js").SensorType} SensorType */

/** @typedef {import("../sensor/PressureSensorDataManager.js").PressureData} PressureData */

/** @typedef {import("../utils/CenterOfPressureHelper.js").CenterOfPressure} CenterOfPressure */

/**
 * @typedef {Object} DevicePairRawPressureData
 * @property {PressureData} left
 * @property {PressureData} right
 */

/**
 * @typedef {Object} DevicePairPressureData
 *
 * @property {number} rawSum
 * @property {number} normalizedSum
 *
 * @property {CenterOfPressure} [center]
 * @property {CenterOfPressure} [normalizedCenter]
 */

/** @typedef {import("../Device.js").DeviceEvent} DeviceEvent */

class DevicePairPressureSensorDataManager {
  static get Sides() {
    return Device.InsoleSides;
  }
  get sides() {
    return Device.InsoleSides;
  }

  // PRESSURE DATA

  /** @type {DevicePairRawPressureData} */
  #rawPressure = {};

  #centerOfPressureHelper = new CenterOfPressureHelper();

  resetPressureRange() {
    this.#centerOfPressureHelper.reset();
  }

  /** @param {DeviceEvent} event  */
  onDevicePressureData(event) {
    const { pressure } = event.message;
    const insoleSide = event.target.insoleSide;
    _console.log({ pressure, insoleSide });
    this.#rawPressure[insoleSide] = pressure;
    if (this.#hasAllPressureData) {
      return this.#updatePressureData();
    } else {
      _console.log("doesn't have all pressure data yet...");
    }
  }

  get #hasAllPressureData() {
    return this.sides.every((side) => side in this.#rawPressure);
  }

  #updatePressureData() {
    /** @type {DevicePairPressureData} */
    const pressure = { rawSum: 0, normalizedSum: 0 };

    this.sides.forEach((side) => {
      pressure.rawSum += this.#rawPressure[side].rawSum;
      pressure.normalizedSum += this.#rawPressure[side].normalizedSum;
    });

    if (pressure.normalizedSum > 0) {
      pressure.center = { x: 0, y: 0 };
      this.sides.forEach((side) => {
        const sidePressure = this.#rawPressure[side];
        const normalizedPressureSumWeight = sidePressure.normalizedSum / pressure.normalizedSum;
        if (normalizedPressureSumWeight > 0) {
          pressure.center.y += sidePressure.normalizedCenter.y * normalizedPressureSumWeight;
          if (side == "right") {
            pressure.center.x = normalizedPressureSumWeight;
          }
        }
      });

      pressure.normalizedCenter = this.#centerOfPressureHelper.updateAndGetNormalization(pressure.center);
    }

    _console.log({ devicePairPressure: pressure });

    return pressure;
  }
}

export default DevicePairPressureSensorDataManager;
