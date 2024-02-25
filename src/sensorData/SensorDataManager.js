import { createConsole } from "../utils/Console.js";

/** @typedef {"pressure" | "accelerometer" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation" | "barometer"} BrilliantSoleSensorType */
/** @typedef {"hallux" | "digits" | "metatarsal_inner" | "metatarsal_center" | "metatarsal_outer" | "lateral" | "arch" | "heel"} BrilliantSolePessureType */

const _console = createConsole("SensorDataManager", { log: false });

/**
 * @callback BrilliantSoleSensorDataCallback
 * @param {BrilliantSoleSensorType} sensorType
 * @param {DataView} data
 */

class SensorDataManager {
    /** @type {BrilliantSoleSensorDataCallback?} */
    onDataReceived;
}

export default SensorDataManager;
