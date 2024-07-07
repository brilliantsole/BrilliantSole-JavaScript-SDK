import DevicePairPressureSensorDataManager from "./DevicePairPressureSensorDataManager";
import { createConsole } from "../utils/Console";
import Device from "../Device";

const _console = createConsole("DevicePairSensorDataManager", { log: true });

/** @typedef {import("../Device").SensorType} SensorType */
/** @typedef {import("../Device").InsoleSide} InsoleSide */

/** @typedef {import("../sensor/SensorDataManager").SensorDataCallback} SensorDataCallback */

class DevicePairSensorDataManager {
  static get Sides() {
    return Device.InsoleSides;
  }
  get sides() {
    return Device.InsoleSides;
  }

  /** @type {Object.<SensorType, Object.<InsoleSide, number>>} */
  #timestamps = {};

  pressureSensorDataManager = new DevicePairPressureSensorDataManager();
  resetPressureRange() {
    this.sides.forEach((side) => {
      this[side]?.resetPressureRange();
    });
    this.pressureSensorDataManager.resetPressureRange();
  }

  /** @typedef {import("../Device").DeviceEvent} DeviceEvent */

  /** @param {DeviceEvent} event */
  onDeviceSensorData(event) {
    const { timestamp } = event.message;

    /** @type {SensorType} */
    const sensorType = event.message.sensorType;

    _console.log({ sensorType, timestamp, event });

    if (!this.#timestamps[sensorType]) {
      this.#timestamps[sensorType] = {};
    }
    this.#timestamps[sensorType][event.target.insoleSide] = timestamp;

    let value;
    switch (sensorType) {
      case "pressure":
        value = this.pressureSensorDataManager.onDevicePressureData(event);
        break;
      default:
        _console.log(`uncaught sensorType "${sensorType}"`);
        break;
    }

    if (value) {
      const timestamps = Object.assign({}, this.#timestamps[sensorType]);
      this.onDataReceived?.(sensorType, { timestamps, [sensorType]: value });
    } else {
      _console.log("no value received");
    }
  }

  /** @type {SensorDataCallback?} */
  onDataReceived;
}

export default DevicePairSensorDataManager;
