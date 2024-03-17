import DevicePairPressureSensorDataManager from "./DevicePairPressureSensorDataManager.js";
import { createConsole } from "../utils/Console.js";
import Device from "../Device.js";

const _console = createConsole("DevicePairSensorDataManager", { log: true });

/** @typedef {import("../Device.js").SensorType} SensorType */
/** @typedef {import("../Device.js").InsoleSide} InsoleSide */

/** @typedef {import("../sensor/SensorDataManager.js").SensorDataCallback} SensorDataCallback */

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
            this[side].resetPressureRange();
        });
        this.pressureSensorDataManager.resetPressureRange();
    }

    /** @param {DeviceEvent} event  */
    onDeviceSensorData(event) {
        const { type, timestamp } = event.message;

        /** @type {SensorType} */
        const sensorType = type;

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
                _console.warn(`uncaught sensorType "${sensorType}"`);
                break;
        }

        if (value) {
            const timestamps = Object.assign({}, this.#timestamps[sensorType]);
            this.onDataReceived?.(sensorType, { timestamps, [sensorType]: value });
        } else {
            _console.warn("no value received");
        }
    }

    /** @type {SensorDataCallback?} */
    onDataReceived;
}

export default DevicePairSensorDataManager;
