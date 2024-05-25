import { createConsole } from "../utils/Console.js";

/**
 * @typedef { "acceleration" |
 * "gravity" |
 * "linearAcceleration" |
 * "gyroscope" |
 * "magnetometer" |
 * "gameRotation" |
 * "rotation" |
 * "orientation" |
 * "activity" |
 * "stepCounter" |
 * "deviceOrientation"
 * } MotionSensorType
 */

const _console = createConsole("MotionSensorDataManager", { log: true });

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

/**
 * @typedef {"still" |
 * "walking" |
 * "running" |
 * "bicycle" |
 * "vehicle" |
 * "tilting"
 * } ActivityType
 */

/**
 * @typedef Activity
 * @type {Object}
 * @property {boolean} still
 * @property {boolean} walking
 * @property {boolean} running
 * @property {boolean} bicycle
 * @property {boolean} vehicle
 * @property {boolean} tilting
 */

/**
 * @typedef {"portraitUpright" |
 * "landscapeLeft" |
 * "portraitUpsideDown" |
 * "landscapeRight" |
 * "unknown"
 * } DeviceOrientation
 */

class MotionSensorDataManager {
    /** @type {MotionSensorType[]} */
    static #Types = [
        "acceleration",
        "gravity",
        "linearAcceleration",
        "gyroscope",
        "magnetometer",
        "gameRotation",
        "rotation",
        "orientation",
        "activity",
        "stepCounter",
        "deviceOrientation",
    ];
    static get Types() {
        return this.#Types;
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

        pitch *= -1;
        heading *= -1;

        /** @type {Euler} */
        const euler = { heading, pitch, roll };

        _console.log({ euler });
        return euler;
    }

    /** @param {DataView} dataView */
    parseStepCounter(dataView) {
        _console.log("parseStepCounter", dataView);
        const stepCount = dataView.getUint32(0, true);
        _console.log({ stepCount });
        return stepCount;
    }

    /** @type {ActivityType[]} */
    static #ActivityTypes = ["still", "walking", "running", "bicycle", "vehicle", "tilting"];
    static get ActivityTypes() {
        return this.#ActivityTypes;
    }
    get #activityTypes() {
        return MotionSensorDataManager.#ActivityTypes;
    }
    /** @param {DataView} dataView */
    parseActivity(dataView) {
        _console.log("parseActivity", dataView);
        /** @type {Activity} */
        const activity = {};

        const activityBitfield = dataView.getUint8(0);
        _console.log("activityBitfield", activityBitfield.toString(2));
        this.#activityTypes.forEach((activityType, index) => {
            activity[activityType] = Boolean(activityBitfield & (1 << index));
        });

        _console.log("activity", activity);

        return activity;
    }

    /** @type {DeviceOrientation[]} */
    static #DeviceOrientations = [
        "portraitUpright",
        "landscapeLeft",
        "portraitUpsideDown",
        "landscapeRight",
        "unknown",
    ];
    static get DeviceOrientations() {
        return this.#DeviceOrientations;
    }
    get #deviceOrientations() {
        return MotionSensorDataManager.#DeviceOrientations;
    }
    /** @param {DataView} dataView */
    parseDeviceOrientation(dataView) {
        _console.log("parseDeviceOrientation", dataView);
        const index = dataView.getUint8(0);
        const deviceOrientation = this.#deviceOrientations[index];
        _console.assertWithError(deviceOrientation, "undefined deviceOrientation");
        _console.log({ deviceOrientation });
        return deviceOrientation;
    }
}

export default MotionSensorDataManager;
