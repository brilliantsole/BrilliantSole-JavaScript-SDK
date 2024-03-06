import { createConsole } from "../utils/Console.js";

/** @typedef {import("../Device.js").BrilliantSoleDeviceType} BrilliantSoleDeviceType */

/** @typedef {"accelerometer" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation"} BrilliantSoleMotionSensorType */

const _console = createConsole("MotionSensorDataManager", { log: true });

class MotionSensorDataManager {
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
    }

    static #Scalars = {
        accelerometer: 2 ** -12,
        gravity: 2 ** -12,
        linearAcceleration: 2 ** -12,

        gyroscope: 2000 * 2 ** -15,

        magnetometer: 2500 * 2 ** -15,

        gameRotation: 2 ** -14,
        rotation: 2 ** -14,
    };
    static get Scalars() {
        return this.#Scalars;
    }
    get scalars() {
        return MotionSensorDataManager.Scalars;
    }

    static #Vector3Size = 3 * 2;
    static get Vector3Size() {
        return this.#Vector3Size;
    }
    get vector3Size() {
        return MotionSensorDataManager.Vector3Size;
    }

    /**
     * @param {DataView} dataView
     * @param {number} byteOffset
     * @param {BrilliantSoleMotionSensorType} sensorType
     */
    parseVector3(dataView, byteOffset, sensorType) {
        let [x, y, z] = [
            dataView.getInt16(byteOffset, true),
            dataView.getInt16(byteOffset + 2, true),
            dataView.getInt16(byteOffset + 4, true),
        ].map((value) => value * this.scalars[sensorType]);

        const vector = { x, y, z };

        _console.log({ vector });
        return vector;
    }

    static #QuaternionSize = 4 * 2;
    static get QuaternionSize() {
        return this.#QuaternionSize;
    }
    get quaternionSize() {
        return MotionSensorDataManager.QuaternionSize;
    }

    /**
     * @param {DataView} dataView
     * @param {number} byteOffset
     * @param {BrilliantSoleMotionSensorType} sensorType
     */
    parseQuaternion(dataView, byteOffset, sensorType) {
        let [x, y, z, w] = [
            dataView.getInt16(byteOffset, true),
            dataView.getInt16(byteOffset + 2, true),
            dataView.getInt16(byteOffset + 4, true),
            dataView.getInt16(byteOffset + 6, true),
        ].map((value) => value * this.scalars[sensorType]);

        const quaternion = { x, y, z, w };

        _console.log({ quaternion });
        return quaternion;
    }
}

export default MotionSensorDataManager;
