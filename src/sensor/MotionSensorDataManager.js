import { createConsole } from "../utils/Console.js";

/** @typedef {"acceleration" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation"} MotionSensorType */

const _console = createConsole("MotionSensorDataManager", { log: false });

/**
 * @typedef Vector3
 * @type {Object}
 * @property {number} x
 * @property {number} y
 * @property {number} z
 */

/**
 * @typedef Quaternion
 * @type {Object}
 * @property {number} x
 * @property {number} y
 * @property {number} z
 * @property {number} w
 */

/**
 * @typedef Euler
 * @type {Object}
 * @property {number} heading
 * @property {number} pitch
 * @property {number} roll
 */

class MotionSensorDataManager {
    static #Vector3Size = 3 * 2;
    static get Vector3Size() {
        return this.#Vector3Size;
    }
    get vector3Size() {
        return MotionSensorDataManager.Vector3Size;
    }

    /**
     * @param {DataView} dataView
     * @param {number} scalar
     * @returns {Vector3}
     */
    parseVector3(dataView, scalar) {
        let [x, y, z] = [dataView.getInt16(0, true), dataView.getInt16(2, true), dataView.getInt16(4, true)].map(
            (value) => value * scalar
        );

        /** @type {Vector3} */
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
     * @param {number} scalar
     * @returns {Quaternion}
     */
    parseQuaternion(dataView, scalar) {
        let [x, y, z, w] = [
            dataView.getInt16(0, true),
            dataView.getInt16(2, true),
            dataView.getInt16(4, true),
            dataView.getInt16(6, true),
        ].map((value) => value * scalar);

        /** @type {Quaternion} */
        const quaternion = { x, y, z, w };

        _console.log({ quaternion });
        return quaternion;
    }

    static #EulerSize = 3 * 2;
    static get EulerSize() {
        return this.#EulerSize;
    }
    get eulerSize() {
        return MotionSensorDataManager.EulerSize;
    }

    /**
     * @param {DataView} dataView
     * @param {number} scalar
     * @returns {Euler}
     */
    parseEuler(dataView, scalar) {
        let [heading, pitch, roll] = [
            dataView.getInt16(0, true),
            dataView.getInt16(2, true),
            dataView.getInt16(4, true),
        ].map((value) => value * scalar);

        /** @type {Euler} */
        const euler = { heading, pitch, roll };

        _console.log({ euler });
        return euler;
    }
}

export default MotionSensorDataManager;
