import { createConsole } from "../utils/Console.js";
import { parseTimestamp } from "../utils/MathUtils.js";
import PressureSensorDataManager from "./PressureSensorDataManager.js";
import MotionSensorDataManager from "./MotionSensorDataManager.js";
import BarometerSensorDataManager from "./BarometerSensorDataManager.js";
import { parseMessage } from "../utils/ParseUtils.js";
import EventDispatcher from "../utils/EventDispatcher.js";

const _console = createConsole("SensorDataManager", { log: true });

/** @typedef {import("./MotionSensorDataManager.js").MotionSensorType} MotionSensorType */
/** @typedef {import("./PressureSensorDataManager.js").PressureSensorType} PressureSensorType */
/** @typedef {import("./BarometerSensorDataManager.js").BarometerSensorType} BarometerSensorType */

/** @typedef {MotionSensorType | PressureSensorType | BarometerSensorType} SensorType */

/** @typedef {"getPressurePositions" | "getSensorScalars" | "sensorData"} SensorDataMessageType */
/** @typedef {SensorDataMessageType | SensorType} SensorDataManagerEventType */

/** @typedef {import("../utils/EventDispatcher.js").EventDispatcherListener} EventDispatcherListener */
/** @typedef {import("../utils/EventDispatcher.js").EventDispatcherOptions} EventDispatcherOptions */

/** @typedef {import("../Device.js").Device} Device */
/**
 * @typedef SensorDataManagerEvent
 * @type {Object}
 * @property {Device} target
 * @property {SensorDataManagerEventType} type
 * @property {Object} message
 */

class SensorDataManager {
    // MESSAGE TYPES

    /** @type {SensorDataMessageType[]} */
    static #MessageTypes = ["getPressurePositions", "getSensorScalars", "sensorData"];
    static get MessageTypes() {
        return this.#MessageTypes;
    }
    get messageTypes() {
        return SensorDataManager.MessageTypes;
    }

    // MANAGERS

    pressureSensorDataManager = new PressureSensorDataManager();
    motionSensorDataManager = new MotionSensorDataManager();
    barometerSensorDataManager = new BarometerSensorDataManager();

    // TYPES

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
        "orientation",

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

    // EVENT DISPATCHER

    /** @type {SensorDataManagerEventType[]} */
    static #EventTypes = [...this.#MessageTypes, ...this.#Types];
    static get EventTypes() {
        return this.#EventTypes;
    }
    get eventTypes() {
        return SensorDataManager.#EventTypes;
    }
    /** @type {EventDispatcher} */
    eventDispatcher;

    /** @param {SensorDataManagerEvent} event */
    #dispatchEvent(event) {
        this.eventDispatcher.dispatchEvent(event);
    }

    /** @param {SensorDataManagerEventType} eventType */
    waitForEvent(eventType) {
        return this.eventDispatcher.waitForEvent(eventType);
    }

    // DATA

    /** @param {DataView} dataView */
    #parseData(dataView) {
        _console.log("sensorData", Array.from(new Uint8Array(dataView.buffer)));

        let byteOffset = 0;
        const timestamp = parseTimestamp(dataView, byteOffset);
        byteOffset += 2;

        const _dataView = new DataView(dataView.buffer, byteOffset);

        parseMessage(_dataView, SensorDataManager.Types, this.#parseDataCallback.bind(this), { timestamp });
    }

    /**
     * @param {SensorType} sensorType
     * @param {DataView} dataView
     * @param {{timestamp: number}} context
     */
    #parseDataCallback(sensorType, dataView, { timestamp }) {
        const scalar = this.#scalars.get(sensorType);

        let sensorData;
        switch (sensorType) {
            case "pressure":
                sensorData = this.pressureSensorDataManager.parseData(dataView);
                break;
            case "acceleration":
            case "gravity":
            case "linearAcceleration":
            case "gyroscope":
            case "magnetometer":
                sensorData = this.motionSensorDataManager.parseVector3(dataView, scalar);
                break;
            case "gameRotation":
            case "rotation":
                sensorData = this.motionSensorDataManager.parseQuaternion(dataView, scalar);
                break;
            case "orientation":
                sensorData = this.motionSensorDataManager.parseEuler(dataView, scalar);
                break;
            case "barometer":
                sensorData = this.barometerSensorDataManager.parseData(dataView, scalar);
                break;
            default:
                _console.error(`uncaught sensorType "${sensorType}"`);
        }

        _console.assertWithError(sensorData, `no sensorData defined for sensorType "${sensorType}"`);

        _console.log({ sensorType, sensorData, sensorData });
        this.#dispatchEvent({ type: sensorType, message: { [sensorType]: sensorData } });
        this.#dispatchEvent({ type: "sensorData", message: { [sensorType]: sensorData, sensorType } });
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

    // MESSAGE

    /**
     * @param {SensorDataMessageType} messageType
     * @param {DataView} dataView
     */
    parseMessage(messageType, dataView) {
        _console.log({ messageType });

        switch (messageType) {
            case "getSensorScalars":
                this.parseScalars(dataView);
                break;
            case "getPressurePositions":
                this.pressureSensorDataManager.parsePositions(dataView);
                break;
            case "sensorData":
                this.#parseData(dataView);
                break;
            default:
                throw Error(`uncaught messageType ${messageType}`);
        }
    }

    /**
     * @callback SendMessageCallback
     * @param {{type: SensorDataMessageType, data: ArrayBuffer}[]} messages
     * @param {boolean} sendImmediately
     */

    /** @type {SendMessageCallback} */
    sendMessage;
}

export default SensorDataManager;
