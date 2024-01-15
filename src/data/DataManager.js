import EventDispatcher from "../utils/EventDispatcher.js";
import { createConsole } from "../utils/Console.js";

/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherListener} EventDispatcherListener */
/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherOptions} EventDispatcherOptions */

/** @typedef {"start" | "sync" | "logging" | "sensor"} BrilliantSoleDataManagerState */
/** @typedef {"padding" | "sync" | "log" | "sensor"} BrilliantSoleDataManagerMessageType */
/** @typedef {"pressure" | "acceleration" | "linearAcceleration" | "quaternion" | "magneticRotation"} BrilliantSoleSensorType */
/** @typedef {"log" | BrilliantSoleSensorType} BrilliantSoleDataManagerEventType */
/** @typedef {"setSensorDataRate" | "setVibrationStrength" | "triggerVibration" | "stopVibration"} BrilliantSoleCommandType */
/** @typedef {"front" | "back" | "both"} BrilliantSoleVibrationMotor */
/** @typedef {"hallux" | "digits" | "metatarsal_inner" | "metatarsal_center" | "metatarsal_outer" | "lateral" | "arch" | "heel"} BrilliantSolePessureType */

/**
 * @typedef BrilliantSoleDataManagerEvent
 * @type {object}
 * @property {BrilliantSoleDataManagerEventType} type
 * @property {object} message
 */

const _console = createConsole("DataManager", { log: false });

class DataManager {
    /** @type {BrilliantSoleDataManagerEventType[]} */
    static #EventTypes = ["log", "pressure", "acceleration", "linearAcceleration", "quaternion", "magneticRotation"];
    static get EventTypes() {
        return this.#EventTypes;
    }
    get eventTypes() {
        return DataManager.#EventTypes;
    }
    #eventDispatcher = new EventDispatcher(this.eventTypes);

    /**
     * @param {BrilliantSoleDataManagerEventType} type
     * @param {EventDispatcherListener} listener
     * @param {EventDispatcherOptions?} options
     * @throws {Error}
     */
    addEventListener(type, listener, options) {
        return this.#eventDispatcher.addEventListener(...arguments);
    }

    /**
     * @param {BrilliantSoleDataManagerEvent} event
     * @throws {Error} if type is not valid
     */
    #dispatchEvent(event) {
        this.#eventDispatcher.dispatchEvent(event);
    }

    /**
     * @param {BrilliantSoleDataManagerEventType} type
     * @param {EventDispatcherListener} listener
     * @returns {boolean}
     * @throws {Error}
     */
    removeEventListener(type, listener) {
        return this.#eventDispatcher.removeEventListener(...arguments);
    }

    /** @type {BrilliantSoleDataManagerState} */
    #state = "start";
    /** @private */
    get state() {
        return this.#state;
    }
    /** @private */
    set state(newState) {
        if (this.#state == newState) {
            _console.warn(`attempted to assign same state "${newState}"`);
            return;
        }
        this.#state = newState;
        _console.log(`newState "${this.state}"`);
    }

    /** @type {Object.<number, BrilliantSoleDataManagerMessageType?>} */
    static #_MessageType = {
        0: "padding",
        1: "sync",
        2: "log",
        3: "sensor",
    };
    get #MessageType() {
        return DataManager.#_MessageType;
    }

    /** @type {Object.<number, BrilliantSoleSensorType>} */
    static #_SensorType = {
        2: "pressure",
        6: "acceleration",
        32: "linearAcceleration",
        38: "quaternion",
        41: "magneticRotation",
    };
    get #SensorType() {
        return DataManager.#_SensorType;
    }
    /** @type {BrilliantSoleSensorType} */
    #sensorType;

    /* @type {Object.<BrilliantSoleSensorType, number>} */
    static #_SensorId = {
        pressure: 2,
        acceleration: 6,
        linearAcceleration: 32,
        quaternion: 38,
        magneticRotation: 41,
    };
    get #SensorId() {
        return DataManager.#_SensorId;
    }

    /* @type {Object.<BrilliantSoleSensorType, number>} */
    static #_SensorDataLength = {
        pressure: 16,
        acceleration: 6,
        linearAcceleration: 6,
        quaternion: 8,
    };
    get #SensorDataLength() {
        return DataManager.#_SensorDataLength;
    }
    /* @type {Object.<BrilliantSoleSensorType, number>} */
    static #_SensorDataScalar = {
        pressure: 1,
        acceleration: 2 ** -12,
        linearAcceleration: 2 ** -12,
        quaternion: 2 ** -14,
    };
    get #SensorDataScalar() {
        return DataManager.#_SensorDataScalar;
    }

    /* @type {Object.<BrilliantSoleCommandType, number>} */
    static #_CommandType = {
        setSensorDataRate: 1,
        setVibrationStrength: 2,
        triggerVibration: 3,
        stopVibration: 4,
    };
    get #CommandType() {
        return DataManager.#_CommandType;
    }

    /* @type {Object.<number, number>} */
    static #_SensorDataRate = {
        0: 0,
        1: 1.5625,
        2: 3.125,
        3: 6.25,
        4: 12.5,
        5: 25.0,
        6: 50.0,
    };
    get #SensorDataRate() {
        return DataManager.#_SensorDataRate;
    }

    /* @type {Object.<BrilliantSoleVibrationMotor, number>} */
    static #_VibrationMotor = {
        front: 1 << 0,
        back: 1 << 1,
        get both() {
            return this.front | this.back;
        },
    };
    get #VibrationMotor() {
        return DataManager.#_VibrationMotor;
    }

    /** @type {number[]} */
    #sensorDataBuffer = [];
    /** @type {number} */
    #sensorDataBufferFinalLength = 0;

    /** @type {number[]} */
    #logBuffer = [];
    /** @type {number} */
    #logBufferFinalLength = 0;

    /** @param {DataView} dataView */
    parseData(dataView) {
        _console.log(`parsing ${dataView.byteLength} bytes`, dataView);
        var byteOffset = 0;

        while (byteOffset < dataView.byteLength) {
            const byte = dataView.getUint8(byteOffset++);
            _console.log(`byte at offset #${byteOffset - 1}: ${byte}`);
            const messageType = this.#MessageType[byte];
            _console.log("messageType?", messageType);
            switch (this.#state) {
                case "start":
                    if (messageType == "startSync") {
                        this.state = "sync";
                    } else {
                        //_console.error(`uncaught message in "${this.state}" state`, messageType);
                    }
                    break;
                case "sync":
                    switch (messageType) {
                        case "continueSync":
                            break;
                        case "logHeader":
                            this.#logBufferFinalLength = dataView.getUint16(byteOffset);
                            this.#logBuffer.length = 0;
                            byteOffset += 2;
                            _console.log(`logBufferFinalLength: ${this.#logBufferFinalLength} bytes`);
                            this.state = "logging";
                            break;
                        case "sensorHeader":
                            const sensorType = this.#SensorType[byte];
                            _console.assertWithError(sensorType, `invalid sensorId ${byte}`);
                            _console.log(`sensor type: "${sensorType}"`);
                            this.#sensorType = sensorType;
                            this.#sensorDataBuffer.length = 0;
                            this.#sensorDataBufferFinalLength = this.#SensorDataLength[this.#sensorType];
                            this.state = "sensor";
                            break;
                        default:
                            //_console.error(`uncaught message in "${this.state}" state`, messageType);
                            this.state = "start";
                            break;
                    }
                    break;
                case "logging":
                    this.#logBuffer.push(byte);
                    _console.log(`log buffer length: ${this.#logBuffer.length}/${this.#logBufferFinalLength} bytes`);
                    if (this.#logBuffer.length == this.#logBufferFinalLength) {
                        const log = this.#logBuffer.slice();
                        _console.log("log completed", log);
                        this.#dispatchEvent({ type: "log", message: { log } });
                        this.state = "start";
                    }
                    break;
                case "sensor":
                    this.#sensorDataBuffer.push(byte);
                    _console.log(
                        `sensor buffer length: ${this.#sensorDataBuffer.length}/${
                            this.#sensorDataBufferFinalLength
                        } bytes`
                    );
                    if (this.#sensorDataBuffer.length == this.#sensorDataBufferFinalLength) {
                        const sensorDataBuffer = this.#sensorDataBuffer.slice();
                        _console.log("sensorDataBuffer completed", sensorDataBuffer);
                        const sensorData = new DataView(Uint8Array.from(sensorDataBuffer).buffer);
                        _console.log("sensorData", sensorData);
                        this.#parseSensorData(this.#sensorType, sensorDataBuffer);
                    }
                    break;
                default:
                    throw `uncaught state "${this.#state}"`;
            }
        }
    }

    /**
     * @param {BrilliantSoleSensorType} sensorType
     * @throws {Error} if invalid sensorType
     */
    #assertValidSensorType(sensorType) {
        _console.assert(sensorType in this.#SensorId, `invalid sensorType "${sensorType}"`);
    }

    /**
     * @param {number} sensorDataRate
     * @throws {Error} if invalid dataRate
     */
    #assertValidSensorDataRate(sensorDataRate) {
        _console.assert(sensorDataRate in this.#SensorDataRate, `invalid sensorDataRate "${sensorDataRate}"`);
    }

    /**
     * @param {BrilliantSoleVibrationMotor} vibrationMotor
     * @throws {Error} if invalid dataRate
     */
    #assertValidVibrationMotor(vibrationMotor) {
        _console.assert(vibrationMotor in this.#VibrationMotor, `invalid vibrationMotor "${vibrationMotor}"`);
    }

    /**
     *
     * @param {BrilliantSoleSensorType} sensorType
     * @param {number} dataRate
     * @returns {ArrayBuffer} message
     */
    createSetSensorDataRateMessage(sensorType, sensorDataRate) {
        this.#assertValidSensorType(sensorType);
        this.#assertValidSensorDataRate(sensorDataRate);
        const sensorId = this.#SensorId[sensorType];
        const message = Uint8Array.from([this.#CommandType.setSensorDataRate, sensorId, sensorDataRate]);
        return message;
    }

    /**
     * @param {BrilliantSoleVibrationMotor} vibrationMotor
     * @param {number} vibrationStrength
     * @returns {Uint8Array} message
     */
    createSetVibrationStrengthMessage(vibrationMotor, vibrationStrength) {
        this.#assertValidVibrationMotor(vibrationMotor);
        const vibrationMotorBitmask = this.#VibrationMotor[vibrationMotor];
        const message = Uint8Array.from([
            this.#CommandType.setVibrationStrength,
            vibrationMotorBitmask,
            vibrationStrength,
        ]);
        return message;
    }

    /**
     * @param {BrilliantSoleVibrationMotor} vibrationMotor
     * @param {number} duration (ms)
     * @returns {DataView} message
     */
    createTriggerVibrationMessage(vibrationMotor, duration) {
        this.#assertValidVibrationMotor(vibrationMotor);
        const vibrationMotorBitmask = this.#VibrationMotor[vibrationMotor];

        const message = new DataView(new ArrayBuffer(4));
        message.setUint8(0, this.#CommandType.triggerVibration);
        message.setUint8(1, vibrationMotorBitmask);
        message.setUint16(2, duration, true);
        return message;
    }

    /**
     * @param {BrilliantSoleVibrationMotor} vibrationMotor
     * @returns {Uint8Array} message
     */
    createStopVibrationMessage(vibrationMotor) {
        this.#assertValidVibrationMotor(vibrationMotor);
        const vibrationMotorBitmask = this.#VibrationMotor[vibrationMotor];
        const message = Uint8Array.from([this.#CommandType.stopVibration, vibrationMotorBitmask]);
        return message;
    }

    #stopVibrationMessage = Uint8Array.from([this.#CommandType.stopVibration]);
    get stopVibrationMessage() {
        return this.#stopVibrationMessage;
    }

    /**
     *
     * @param {BrilliantSoleSensorType} sensorType
     * @param {DataView} sensorData
     */
    #parseSensorData(sensorType, sensorData) {
        _console.assertWithError(sensorType in this.#SensorDataScalar, `no scalar found for sensorType ${sensorType}`);
        const scalar = this.#SensorDataScalar[sensorType];

        switch (sensorType) {
            case "pressure":
                const rawPressureValues = new Uint16Array(sensorData.buffer);
                _console.log("rawPressureValues", rawPressureValues);
                // FILL
                break;
            case "acceleration":
            case "linearAcceleration":
                const rawVectorValues = new Int16Array(sensorData.buffer);
                _console.log("rawVectorValues", rawVectorValues);
                // FILL
                break;
            case "quaternion":
                const rawQuaternionValues = new Int16Array(sensorData.buffer);
                _console.log("rawQuaternionValues", rawQuaternionValues);
                // FILL
                break;
            default:
                throw new Error(`uncaught sensorType "${sensorType}"`);
        }
    }
}

export default DataManager;
