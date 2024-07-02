import { createConsole } from "../utils/Console.js";
import CenterOfPressureHelper from "../utils/CenterOfPressureHelper.js";
import RangeHelper from "../utils/RangeHelper.js";
import { createArray } from "../utils/ArrayUtils.js";

/** @typedef {"pressure"} PressureSensorType */
/** @typedef {import("../utils/MathUtils.js").Vector2} Vector2 */

/** @typedef {Vector2} PressureSensorPosition */

/** @typedef {import("../utils/CenterOfPressureHelper.js").CenterOfPressure} CenterOfPressure */

/**
 * @typedef PressureSensorValue
 * @type {Object}
 * @property {PressureSensorPosition} position
 * @property {number} rawValue
 * @property {number} scaledValue
 * @property {number} normalizedValue
 * @property {number} weightedValue
 */

/**
 * @typedef PressureData
 * @type {Object}
 * @property {PressureSensorValue[]} sensors
 *
 * @property {number} scaledSum
 * @property {number} normalizedSum
 *
 * @property {CenterOfPressure} [center]
 * @property {CenterOfPressure} [normalizedCenter]
 */

/** @typedef {import("./SensorDataManager.js").BaseSensorDataEventMessage} BaseSensorDataEventMessage */

/**
 * @typedef {Object} PressureSensorDataEventMessage
 * @property {PressureData} pressure
 */

/**
 * @typedef {Object} PressureSensorDataEvent
 * @property {"pressure"} type
 * @property {PressureSensorDataEventMessage & BaseSensorDataEventMessage} message
 */

const _console = createConsole("PressureSensorDataManager", { log: true });

class PressureSensorDataManager {
  /** @type {PressureSensorType[]} */
  static #Types = ["pressure"];
  static get Types() {
    return this.#Types;
  }
  static get ContinuousTypes() {
    return this.Types;
  }

  /** @type {PressureSensorPosition[]} */
  #positions = [];
  get positions() {
    return this.#positions;
  }

  get numberOfSensors() {
    return this.positions.length;
  }

  /** @param {DataView} dataView */
  parsePositions(dataView) {
    /** @type {PressureSensorPosition[]} */
    const positions = [];

    for (
      let pressureSensorIndex = 0, byteOffset = 0;
      byteOffset < dataView.byteLength;
      pressureSensorIndex++, byteOffset += 2
    ) {
      positions.push({
        x: dataView.getUint8(byteOffset) / 2 ** 8,
        y: dataView.getUint8(byteOffset + 1) / 2 ** 8,
      });
    }

    _console.log({ positions });

    this.#positions = positions;

    this.#sensorRangeHelpers = createArray(this.numberOfSensors, () => new RangeHelper());

    this.resetRange();
  }

  /** @type {RangeHelper[]?} */
  #sensorRangeHelpers;

  #centerOfPressureHelper = new CenterOfPressureHelper();

  resetRange() {
    this.#sensorRangeHelpers.forEach((rangeHelper) => rangeHelper.reset());
    this.#centerOfPressureHelper.reset();
  }

  /**
   * @param {DataView} dataView
   * @param {number} scalar
   */
  parseData(dataView, scalar) {
    /** @type {PressureData} */
    const pressure = { sensors: [], scaledSum: 0, normalizedSum: 0 };
    for (let index = 0, byteOffset = 0; byteOffset < dataView.byteLength; index++, byteOffset += 2) {
      const rawValue = dataView.getUint16(byteOffset, true);
      const scaledValue = rawValue * scalar;
      const rangeHelper = this.#sensorRangeHelpers[index];
      const normalizedValue = rangeHelper.updateAndGetNormalization(scaledValue);
      const position = this.positions[index];
      pressure.sensors[index] = { rawValue, scaledValue, normalizedValue, position, weightedValue: 0 };

      pressure.scaledSum += scaledValue;
      pressure.normalizedSum += normalizedValue / this.numberOfSensors;
    }

    if (pressure.scaledSum > 0) {
      pressure.center = { x: 0, y: 0 };
      pressure.sensors.forEach((sensor) => {
        sensor.weightedValue = sensor.scaledValue / pressure.scaledSum;
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
