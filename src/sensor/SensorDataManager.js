import { createConsole } from "../utils/Console.js";

/** @typedef {"pressure" | "accelerometer" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation" | "barometer"} BrilliantSoleSensorType */
/** @typedef {"hallux" | "digits" | "metatarsal_inner" | "metatarsal_center" | "metatarsal_outer" | "lateral" | "arch" | "heel"} BrilliantSolePessureType */

const _console = createConsole("SensorDataManager", { log: true });

/**
 * @callback BrilliantSoleSensorDataCallback
 * @param {BrilliantSoleSensorType} sensorType
 * @param {DataView} data
 */

class SensorDataManager {
    /** @type {BrilliantSoleSensorType[]} */
    static #Types = [
        "pressure",
        "accelerometer",
        "gravity",
        "linearAcceleration",
        "gyroscope",
        "magnetometer",
        "gameRotation",
        "rotation",
        "barometer",
    ];
    static get Types() {
        return this.#Types;
    }

    /** @param {string} sensorType */
    static assertValidSensorType(sensorType) {
        _console.assertTypeWithError(sensorType, "string");
        _console.assertWithError(this.#Types.includes(sensorType), `invalid sensorType "${sensorType}"`);
    }
    /** @param {number} sensorTypeEnum */
    static assertValidSensorTypeEnum(sensorTypeEnum) {
        _console.assertTypeWithError(sensorTypeEnum, "number");
        _console.assertWithError(sensorTypeEnum in this.#Types`invalid sensorTypeEnum ${sensorTypeEnum}`);
    }

    /** @type {BrilliantSoleSensorDataCallback?} */
    onDataReceived;
}

export default SensorDataManager;
