import { createConsole } from "../utils/Console.js";

/** @typedef {"pressure" | "accelerometer" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation" | "barometer"} BrilliantSoleSensorType */
/** @typedef {"hallux" | "digits" | "metatarsal_inner" | "metatarsal_center" | "metatarsal_outer" | "lateral" | "arch" | "heel"} BrilliantSolePessureType */

/** @typedef {import("../BrilliantSole.js").BrilliantSoleDeviceType} BrilliantSoleDeviceType */

const _console = createConsole("SensorDataManager", { log: true });

/**
 * @callback BrilliantSoleSensorDataCallback
 * @param {BrilliantSoleSensorType} sensorType
 * @param {Object} data
 * @param {number} data.timestamp
 */

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

        // FILL
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

    /** @type {BrilliantSoleSensorDataCallback?} */
    onDataReceived;

    #timestampOffset = 0;
    #lastRawTimestamp = 0;

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

        while (offset < dataView.byteLength) {
            const sensorTypeEnum = dataView.getUint8(offset++);
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
                    byteOffset += 7;
                    break;
                case "gameRotation":
                case "rotation":
                    value = this.#parseQuaternion(dataViw, byteOffset, sensorType);
                    byteOffset += 10;
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
        _console.log({ pressure });
        return pressure;
    }

    /**
     * @param {DataView} dataView
     * @param {number} byteOffset
     */
    #parseVector3(dataView, byteOffset) {
        let [x, y, z] = [
            dataView.getUint16(byteOffset, true),
            dataView.getUint16(byteOffset + 2, true),
            dataView.getUint16(byteOffset + 4, true),
        ];

        // FILL
        // arrange values
        // scalar

        const vector = { x, y, z };

        _console.log({ vector });
        return vector;
    }
    /**
     * @param {DataView} dataView
     * @param {number} byteOffset
     */
    #parseQuaternion(dataView, byteOffset) {
        let [x, y, z, w] = [
            dataView.getUint16(byteOffset, true),
            dataView.getUint16(byteOffset + 2, true),
            dataView.getUint16(byteOffset + 4, true),
            dataView.getUint16(byteOffset + 6, true),
        ];

        // FILL
        // arrange values
        // scalar

        const quaternion = { x, y, z, w };

        _console.log({ quaternion });
        return quaternion;
    }
}

export default SensorDataManager;
