import { createConsole } from "../utils/Console.js";

/** @typedef {import("../BS.js").BrilliantSoleDeviceType} BrilliantSoleDeviceType */

/** @typedef {"pressure" | "accelerometer" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation" | "barometer"} BrilliantSoleSensorType */
/** @typedef {"hallux" | "digits" | "metatarsal_inner" | "metatarsal_center" | "metatarsal_outer" | "lateral" | "arch" | "heel"} BrilliantSolePessureType */

const _console = createConsole("SensorDataManager", { log: true });

class SensorDataManager {
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

        // FILL - pressure sensor remapping?
    }

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
    get #types() {
        return SensorDataManager.#Types;
    }

    /** @param {string} sensorType */
    static assertValidSensorType(sensorType) {
        _console.assertTypeWithError(sensorType, "string");
        _console.assertWithError(this.#Types.includes(sensorType), `invalid sensorType "${sensorType}"`);
    }
    /** @param {number} sensorTypeEnum */
    static assertValidSensorTypeEnum(sensorTypeEnum) {
        _console.assertTypeWithError(sensorTypeEnum, "number");
        _console.assertWithError(sensorTypeEnum in this.#Types, `invalid sensorTypeEnum ${sensorTypeEnum}`);
    }

    /**
     * @callback BrilliantSoleSensorDataCallback
     * @param {BrilliantSoleSensorType} sensorType
     * @param {Object} data
     * @param {number} data.timestamp
     */

    /** @type {BrilliantSoleSensorDataCallback?} */
    onDataReceived;

    #timestampOffset = 0;
    #lastRawTimestamp = 0;
    clearTimestamp() {
        _console.log("clearing sensorDataManager timestamp data");
        this.#timestampOffset = 0;
        this.#lastRawTimestamp = 0;
    }

    static #Uint16Max = 2 ** 16;
    get Uint16Max() {
        return SensorDataManager.#Uint16Max;
    }

    /** @param {DataView} dataView */
    #parseTimestamp(dataView, byteOffset) {
        const rawTimestamp = dataView.getUint16(byteOffset, true);
        if (rawTimestamp < this.#lastRawTimestamp) {
            this.#timestampOffset += this.Uint16Max;
        }
        this.#lastRawTimestamp = rawTimestamp;
        const timestamp = rawTimestamp + this.#timestampOffset;
        return timestamp;
    }

    /** @param {DataView} dataView */
    parse(dataView) {
        _console.log("sensorData", Array.from(new Uint8Array(dataView.buffer)));

        let byteOffset = 0;
        const timestamp = this.#parseTimestamp(dataView, byteOffset);
        byteOffset += 2;

        while (byteOffset < dataView.byteLength) {
            const sensorTypeEnum = dataView.getUint8(byteOffset++);
            SensorDataManager.assertValidSensorTypeEnum(sensorTypeEnum);

            let value;

            const sensorType = this.#types[sensorTypeEnum];
            switch (sensorType) {
                case "pressure":
                    value = this.#parsePressure(dataView, byteOffset);
                    byteOffset += this.numberOfPressureSensors * 2;
                    break;
                case "accelerometer":
                case "gravity":
                case "linearAcceleration":
                case "gyroscope":
                case "magnetometer":
                    value = this.#parseVector3(dataView, byteOffset, sensorType);
                    byteOffset += 6;
                    break;
                case "gameRotation":
                case "rotation":
                    value = this.#parseQuaternion(dataView, byteOffset, sensorType);
                    byteOffset += 8;
                    break;
                case "barometer":
                    // FILL
                    break;
                default:
                    throw Error(`uncaught sensorType "${sensorType}"`);
            }

            _console.assertWithError(value, `no value defined for sensorType "${sensorType}"`);
            this.onDataReceived?.(sensorType, { timestamp, [sensorType]: value });
        }
    }

    static #Scalars = {
        pressure: 2 ** 16,

        accelerometer: 2 ** -12,
        gravity: 2 ** -12,
        linearAcceleration: 2 ** -12,

        gyroscope: 2000 * 2 ** -15,

        magnetometer: 2500 * 2 ** -15,

        gameRotation: 2 ** -14,
        rotation: 2 ** -14,

        barometer: 100 * 2 ** -7,
    };
    get #scalars() {
        return SensorDataManager.#Scalars;
    }

    static #numberOfPressureSensors = 8;
    get numberOfPressureSensors() {
        return SensorDataManager.#numberOfPressureSensors;
    }

    /**
     * @param {DataView} dataView
     * @param {number} byteOffset
     */
    #parsePressure(dataView, byteOffset) {
        const pressure = [];
        for (let index = 0; index < this.numberOfPressureSensors; index++, byteOffset += 2) {
            pressure[index] = dataView.getUint16(byteOffset, true);
        }
        // FILL - calculate center of mass, normalized pressure, etc
        _console.log({ pressure });
        return pressure;
    }

    /**
     * @param {DataView} dataView
     * @param {number} byteOffset
     * @param {BrilliantSoleSensorType} sensorType
     */
    #parseVector3(dataView, byteOffset, sensorType) {
        let [x, y, z] = [
            dataView.getInt16(byteOffset, true),
            dataView.getInt16(byteOffset + 2, true),
            dataView.getInt16(byteOffset + 4, true),
        ].map((value) => value * this.#scalars[sensorType]);

        const vector = { x, y, z };

        _console.log({ vector });
        return vector;
    }
    /**
     * @param {DataView} dataView
     * @param {number} byteOffset
     * @param {BrilliantSoleSensorType} sensorType
     */
    #parseQuaternion(dataView, byteOffset, sensorType) {
        let [x, y, z, w] = [
            dataView.getInt16(byteOffset, true),
            dataView.getInt16(byteOffset + 2, true),
            dataView.getInt16(byteOffset + 4, true),
            dataView.getInt16(byteOffset + 6, true),
        ].map((value) => value * this.#scalars[sensorType]);

        const quaternion = { x, y, z, w };

        _console.log({ quaternion });
        return quaternion;
    }
}

export default SensorDataManager;
