import EventDispatcher from "../utils/EventDispatcher.js";
import { createConsole } from "../utils/Console.js";

/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherListener} EventDispatcherListener */
/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherOptions} EventDispatcherOptions */

/** @typedef {"start" | "sync" | "logging" | "sensor"} BrilliantSoleDataManagerState */
/** @typedef {"startSync" | "continueSync" | "logHeader" | "sensorHeader"} BrilliantSoleDataManagerMessageType */
/** @typedef {"pressure" | "acceleration" | "linearAcceleration" | "quaternion"} BrilliantSoleSensorType */
/** @typedef {"log" | BrilliantSoleSensorType} BrilliantSoleDataManagerEventType */

/**
 * @typedef BrilliantSoleDataManagerEvent
 * @type {object}
 * @property {BrilliantSoleDataManagerEventType} type
 * @property {object} message
 */

const _console = createConsole("DataManager");

class DataManager {
    /** @type {BrilliantSoleDataManagerEventType[]} */
    static #EventTypes = ["log", "pressure", "acceleration", "linearAcceleration", "quaternion"];
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
        0: "startSync",
        1: "continueSync",
        2: "logHeader",
        3: "sensorHeader",
    };
    get #MessageType() {
        return DataManager.#_MessageType;
    }

    /** @type {Object.<number, BrilliantSoleSensorType?>} */
    static #_SensorType = {
        0: "pressure",
        0: "acceleration",
        0: "linearAcceleration",
        0: "quaternion",
    };
    get #SensorType() {
        return DataManager.#_SensorType;
    }
    /** @type {BrilliantSoleSensorType} */
    #sensorType;

    /** @type {Object.<BrilliantSoleSensorType, number>} */
    static #_SensorDataLength = {
        pressure: 16,
        acceleration: 6,
        linearAcceleration: 6,
        quaternion: 8,
    };
    get #SensorDataLength() {
        return DataManager.#_SensorDataLength;
    }
    /* @type {Object.<BrilliantSoleSensorType, number?>} */
    /** @type {Object.<string, number?>} */
    static #_SensorDataScalar = {
        pressure: 1,
        acceleration: 2 ** -12,
        linearAcceleration: 2 ** -12,
        quaternion: 2 ** -14,
    };
    get #SensorDataScalar() {
        return DataManager.#_SensorDataScalar;
    }

    /** @type {number[]} */
    #sensorDataBuffer = [];
    /** @type {number} */
    #sensorDataBufferFinalLength = 0;

    /** @type {Object.<BrilliantSoleSensorType, number>} */
    static #_SensorTypeLength = {
        pressure: 16,
        acceleration: 6,
        linearAcceleration: 6,
        quaternion: 8,
    };
    get #SensorTypeLength() {
        return DataManager.#_SensorTypeLength;
    }

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
            _console.log(`byte at offset #${byteOffset}: ${byte}`);
            const messageType = this.#MessageType[byte];
            _console.log("messageType?", messageType);
            switch (this.#state) {
                case "start":
                    if (messageType == "startSync") {
                        this.state = "sync";
                    } else {
                        _console.error(`uncaught message in "${this.state}" state`, messageType);
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
     *
     * @param {BrilliantSoleSensorType} sensorType
     * @param {DataView} sensorData
     */
    #parseSensorData(sensorType, sensorData) {
        _console.assertWithError(sensorType in this.#SensorDataScalar, `no scalar found for sensorType ${sensorType}`);
        const scalar = this.#SensorDataScalar[sensorType];

        switch (sensorType) {
            case "pressure":
                // FILL
                const rawPressureValues = new Uint16Array(sensorData.buffer);
                _console.log("rawPressureValues", rawPressureValues);
                break;
            case "acceleration":
            case "linearAcceleration":
                // FILL
                const rawVectorValues = new Int16Array(sensorData.buffer);
                _console.log("rawVectorValues", rawVectorValues);
                break;
            case "quaternion":
                // FILL
                const rawQuaternionValues = new Int16Array(sensorData.buffer);
                _console.log("rawQuaternionValues", rawQuaternionValues);
                break;
            default:
                throw new Error(`uncaught sensorType "${sensorType}"`);
        }
    }
}

export default DataManager;
