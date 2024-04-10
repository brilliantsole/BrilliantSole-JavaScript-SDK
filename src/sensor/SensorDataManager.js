import { createConsole } from "../utils/Console.js";
import { Uint16Max } from "../utils/MathUtils.js";
import PressureSensorDataManager from "./PressureSensorDataManager.js";
import MotionSensorDataManager from "./MotionSensorDataManager.js";
import BarometerSensorDataManager from "./BarometerSensorDataManager.js";
import { parseMessage } from "../utils/ParseUtils.js";

const _console = createConsole("SensorDataManager", { log: true });

/** @typedef {import("./MotionSensorDataManager.js").MotionSensorType} MotionSensorType */
/** @typedef {import("./PressureSensorDataManager.js").PressureSensorType} PressureSensorType */
/** @typedef {import("./BarometerSensorDataManager.js").BarometerSensorType} BarometerSensorType */

/** @typedef {MotionSensorType | PressureSensorType | BarometerSensorType} SensorType */

/**
 * @callback SensorDataCallback
 * @param {SensorType} sensorType
 * @param {Object} data
 * @param {number} data.timestamp
 */

class SensorDataManager {
    pressureSensorDataManager = new PressureSensorDataManager();
    motionSensorDataManager = new MotionSensorDataManager();
    barometerSensorDataManager = new BarometerSensorDataManager();

    /** @type {SensorType[]} */
    static #Types = [
        "pressure",
        "acceleration",
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
    get types() {
        return SensorDataManager.Types;
    }

    /** @type {Map.<SensorType, number>} */
    #scalars = new Map();

    /** @param {string} sensorType */
    static AssertValidSensorType(sensorType) {
        _console.assertTypeWithError(sensorType, "string");
        _console.assertWithError(this.#Types.includes(sensorType), `invalid sensorType "${sensorType}"`);
    }
    /** @param {number} sensorTypeEnum */
    static AssertValidSensorTypeEnum(sensorTypeEnum) {
        _console.assertTypeWithError(sensorTypeEnum, "number");
        _console.assertWithError(sensorTypeEnum in this.#Types, `invalid sensorTypeEnum ${sensorTypeEnum}`);
    }

    /** @type {SensorDataCallback?} */
    onDataReceived;

    #timestampOffset = 0;
    #lastRawTimestamp = 0;
    clearTimestamp() {
        _console.log("clearing sensorDataManager timestamp data");
        this.#timestampOffset = 0;
        this.#lastRawTimestamp = 0;
    }

    /**
     * @param {DataView} dataView
     * @param {number} byteOffset
     */
    #parseTimestamp(dataView, byteOffset) {
        const rawTimestamp = dataView.getUint16(byteOffset, true);
        if (rawTimestamp < this.#lastRawTimestamp) {
            this.#timestampOffset += Uint16Max;
        }
        this.#lastRawTimestamp = rawTimestamp;
        const timestamp = rawTimestamp + this.#timestampOffset;
        return timestamp;
    }

    /** @param {DataView} dataView */
    parseData(dataView) {
        _console.log("sensorData", Array.from(new Uint8Array(dataView.buffer)));

        let byteOffset = 0;
        const timestamp = this.#parseTimestamp(dataView, byteOffset);
        byteOffset += 2;

        const _dataView = new DataView(dataView.buffer, byteOffset);

        parseMessage(_dataView, SensorDataManager.Types, (messageType, dataView) => {
            /** @type {SensorType} */
            const sensorType = messageType;

            const scalar = this.#scalars.get(sensorType);

            let value;
            switch (sensorType) {
                case "pressure":
                    value = this.pressureSensorDataManager.parseData(dataView);
                    break;
                case "acceleration":
                case "gravity":
                case "linearAcceleration":
                case "gyroscope":
                case "magnetometer":
                    value = this.motionSensorDataManager.parseVector3(dataView, scalar);
                    break;
                case "gameRotation":
                case "rotation":
                    value = this.motionSensorDataManager.parseQuaternion(dataView, scalar);
                    break;
                case "barometer":
                    // FILL
                    break;
                default:
                    _console.error(`uncaught sensorType "${sensorType}"`);
            }

            _console.assertWithError(value, `no value defined for sensorType "${sensorType}"`);
            this.onDataReceived?.(sensorType, { timestamp, [sensorType]: value });
        });
    }

    /** @param {DataView} dataView */
    parseScalars(dataView) {
        for (let byteOffset = 0; byteOffset < dataView.byteLength; byteOffset += 5) {
            const sensorTypeIndex = dataView.getUint8(byteOffset);
            const sensorType = SensorDataManager.Types[sensorTypeIndex];
            if (!sensorType) {
                _console.warn(`unknown sensorType index ${sensorTypeIndex}`);
                continue;
            }
            const sensorScalar = dataView.getFloat32(byteOffset + 1, true);
            _console.log({ sensorType, sensorScalar });
            this.#scalars.set(sensorType, sensorScalar);
        }
    }
}

export default SensorDataManager;
