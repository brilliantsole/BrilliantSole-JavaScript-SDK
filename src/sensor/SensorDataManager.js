import { createConsole } from "../utils/Console.js";
import { Uint16Max } from "../utils/MathUtils.js";
import PressureSensorDataManager from "./PressureSensorDataManager.js";
import MotionSensorDataManager from "./MotionSensorDataManager.js";
import BarometerSensorDataManager from "./BarometerSensorDataManager.js";

/** @typedef {import("../Device.js").DeviceType} DeviceType */

/** @typedef {import("./MotionSensorDataManager.js").MotionSensorType} MotionSensorType */
/** @typedef {import("./PressureSensorDataManager.js").PressureSensorType} PressureSensorType */
/** @typedef {import("./BarometerSensorDataManager.js").BarometerSensorType} BarometerSensorType */

/** @typedef {MotionSensorType | PressureSensorType | BarometerSensorType} SensorType */

const _console = createConsole("SensorDataManager", { log: true });

class SensorDataManager {
    /** @type {DeviceType} */
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

        this.pressureSensorDataManager.deviceType = newDeviceType;
        this.motionSensorDataManager.deviceType = newDeviceType;
    }

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
    get #types() {
        return SensorDataManager.Types;
    }

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

    /**
     * @callback SensorDataCallback
     * @param {SensorType} sensorType
     * @param {Object} data
     * @param {number} data.timestamp
     */

    /** @type {SensorDataCallback?} */
    onDataReceived;

    #timestampOffset = 0;
    #lastRawTimestamp = 0;
    clearTimestamp() {
        _console.log("clearing sensorDataManager timestamp data");
        this.#timestampOffset = 0;
        this.#lastRawTimestamp = 0;
    }

    /** @param {DataView} dataView */
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
    parse(dataView) {
        _console.log("sensorData", Array.from(new Uint8Array(dataView.buffer)));

        let byteOffset = 0;
        const timestamp = this.#parseTimestamp(dataView, byteOffset);
        byteOffset += 2;

        while (byteOffset < dataView.byteLength) {
            const sensorTypeEnum = dataView.getUint8(byteOffset++);
            SensorDataManager.AssertValidSensorTypeEnum(sensorTypeEnum);

            let value;

            const sensorTypeDataSize = dataView.getUint8(byteOffset++);
            const sensorType = this.#types[sensorTypeEnum];

            _console.log({ sensorTypeEnum, sensorType, sensorTypeDataSize });
            switch (sensorType) {
                case "pressure":
                    value = this.pressureSensorDataManager.parsePressure(dataView, byteOffset);
                    break;
                case "acceleration":
                case "gravity":
                case "linearAcceleration":
                case "gyroscope":
                case "magnetometer":
                    value = this.motionSensorDataManager.parseVector3(dataView, byteOffset, sensorType);
                    break;
                case "gameRotation":
                case "rotation":
                    value = this.motionSensorDataManager.parseQuaternion(dataView, byteOffset, sensorType);
                    break;
                case "barometer":
                    // FILL
                    break;
                default:
                    _console.error(`uncaught sensorType "${sensorType}"`);
            }

            byteOffset += sensorTypeDataSize;

            _console.assertWithError(value, `no value defined for sensorType "${sensorType}"`);
            this.onDataReceived?.(sensorType, { timestamp, [sensorType]: value });
        }
    }

    static get NumberOfPressureSensors() {
        return PressureSensorDataManager.NumberOfPressureSensors;
    }
    get numberOfPressureSensors() {
        return SensorDataManager.NumberOfPressureSensors;
    }

    static get PressureSensorNames() {
        return PressureSensorDataManager.Names;
    }
    get pressureSensorNames() {
        return SensorDataManager.PressureSensorNames;
    }
}

export default SensorDataManager;
