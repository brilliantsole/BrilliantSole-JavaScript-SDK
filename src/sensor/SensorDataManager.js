import { createConsole } from "../utils/Console.js";

/** @typedef {"pressure" | "accelerometer" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation" | "barometer"} BrilliantSoleSensorType */
/** @typedef {"hallux" | "digits" | "metatarsal_inner" | "metatarsal_center" | "metatarsal_outer" | "lateral" | "arch" | "heel"} BrilliantSolePessureType */

const _console = createConsole("SensorDataManager", { log: true });

/**
 * @callback BrilliantSoleSensorDataCallback
 * @param {BrilliantSoleSensorType} sensorType
 * @param {Object} data
 * @param {number} data.timestamp
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
    #timestamp = 0;

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
        this.#timestamp = rawTimestamp + this.#timestampOffset;
        byteOffset += 2;
        return byteOffset;
    }

    /**
     * @param {DataView} dataView
     * @param {number} byteOffset
     */
    parse(dataView, byteOffset = 0) {
        _console.log("sensorData", Array.from(new Uint8Array(dataView.buffer)));

        let byteOffset = 0;
        byteOffset = this.#parseTimestamp(dataView, byteOffset);

        while (offset < dataView.byteLength) {
            const sensorTypeEnum = dataView.getUint8(offset++);
            SensorDataManager.assertValidSensorTypeEnum(sensorTypeEnum);

            let value;

            const sensorType = this.#types[sensorTypeEnum];
            switch (sensorType) {
                case "pressure":
                    // FILL

                    break;
                case "accelerometer":
                case "gravity":
                case "linearAcceleration":
                case "gyroscope":
                case "magnetometer":
                    // FILL
                    byteOffset = this.#parseVector3(dataView, byteOffset);
                    break;
                case "gameRotation":
                case "rotation":
                    // FILL
                    break;
                case "barometer":
                    // FILL
                    break;
                default:
                    throw Error(`uncaught sensorType "${sensorType}"`);
            }

            _console.assertWithError(value, `no value defined for sensorType "${sensorType}"`);
            this.onDataReceived?.(sensorType, { timestamp: this.#timestamp, [sensorType]: value });
        }

        return byteOffset;
    }

    #parsePressure() {
        // FILL
    }
    #parseVector3() {
        // FILL
    }
    #parseQuaternion() {
        // FILL
    }
}

export default SensorDataManager;
