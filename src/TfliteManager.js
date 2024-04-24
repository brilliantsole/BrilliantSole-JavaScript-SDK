import { createConsole } from "./utils/Console.js";
import EventDispatcher from "./utils/EventDispatcher.js";
import { textDecoder, textEncoder } from "./utils/Text.js";
import SensorDataManager from "./sensor/SensorDataManager.js";
import { concatenateArrayBuffers } from "./utils/ArrayBufferUtils.js";
import { arrayWithoutDuplicates } from "./utils/ArrayUtils.js";

const _console = createConsole("TfliteManager", { log: true });

/**
 * @typedef { "getTfliteModelName" |
 * "setTfliteModelName" |
 * "getTfliteModelTask" |
 * "setTfliteModelTask" |
 * "getTfliteModelSampleRate" |
 * "setTfliteModelSampleRate" |
 * "getTfliteModelSensorTypes" |
 * "setTfliteModelSensorTypes" |
 * "getTfliteModelNumberOfClasses" |
 * "setTfliteModelNumberOfClasses" |
 * "tfliteModelIsReady" |
 * "getTfliteCaptureDelay" |
 * "setTfliteCaptureDelay" |
 * "getTfliteThreshold" |
 * "setTfliteThreshold" |
 * "getTfliteInferencingEnabled" |
 * "setTfliteInferencingEnabled" |
 * "tfliteModelInference"
 * } TfliteMessageType
 */

/** @typedef {"classification" | "regression"} TfliteModelTask */

/**
 * @callback SendMessageCallback
 * @param {TfliteMessageType} messageType
 * @param {DataView|ArrayBuffer} data
 */

/** @typedef {import("./sensor/SensorDataManager.js").SensorType} SensorType */

/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherListener} EventDispatcherListener */
/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherOptions} EventDispatcherOptions */

/** @typedef {TfliteMessageType} TfliteManagerEventType */

/**
 * @typedef TfliteManagerEvent
 * @type {Object}
 * @property {TfliteManager} target
 * @property {TfliteManagerEventType} type
 * @property {Object} message
 */

/** @typedef {(event: TfliteManagerEvent) => void} TfliteManagerEventListener */

class TfliteManager {
    /** @type {TfliteMessageType[]} */
    static #MessageTypes = [
        "getTfliteModelName",
        "setTfliteModelName",
        "getTfliteModelTask",
        "setTfliteModelTask",
        "getTfliteModelSampleRate",
        "setTfliteModelSampleRate",
        "getTfliteModelSensorTypes",
        "setTfliteModelSensorTypes",
        "getTfliteModelNumberOfClasses",
        "setTfliteModelNumberOfClasses",
        "tfliteModelIsReady",
        "getTfliteCaptureDelay",
        "setTfliteCaptureDelay",
        "getTfliteThreshold",
        "setTfliteThreshold",
        "getTfliteInferencingEnabled",
        "setTfliteInferencingEnabled",
        "tfliteModelInference",
    ];
    static get MessageTypes() {
        return this.#MessageTypes;
    }
    get messageTypes() {
        return TfliteManager.MessageTypes;
    }

    // TASK

    /** @type {TfliteModelTask[]} */
    static #Tasks = ["classification", "regression"];
    static get Tasks() {
        return this.#Tasks;
    }
    get tasks() {
        return TfliteManager.Tasks;
    }
    /** @param {TfliteModelTask} task */
    #assertValidTask(task) {
        _console.assertEnumWithError(task, this.tasks);
    }
    /** @param {number} taskEnum */
    #assertValidTaskEnum(taskEnum) {
        _console.assertWithError(this.tasks[taskEnum], `invalid taskEnum ${taskEnum}`);
    }

    // EVENT DISPATCHER

    /** @type {TfliteManagerEventType[]} */
    static #EventTypes = [...this.#MessageTypes];
    static get EventTypes() {
        return this.#EventTypes;
    }
    get eventTypes() {
        return TfliteManager.#EventTypes;
    }
    /** @type {EventDispatcher} */
    eventDispatcher;

    /**
     * @param {TfliteManagerEventType} type
     * @param {TfliteManagerEventListener} listener
     * @param {EventDispatcherOptions} options
     */
    addEventListener(type, listener, options) {
        this.eventDispatcher.addEventListener(type, listener, options);
    }

    /**
     * @param {TfliteManagerEvent} event
     */
    #dispatchEvent(event) {
        this.eventDispatcher.dispatchEvent(event);
    }

    /**
     * @param {TfliteManagerEventType} type
     * @param {TfliteManagerEventListener} listener
     */
    removeEventListener(type, listener) {
        return this.eventDispatcher.removeEventListener(type, listener);
    }

    /** @param {TfliteManagerEventType} eventType */
    waitForEvent(eventType) {
        return this.eventDispatcher.waitForEvent(eventType);
    }

    // PROPERTIES

    /** @type {string} */
    #name;
    get name() {
        return this.#name;
    }
    /** @param {DataView} dataView */
    #parseName(dataView) {
        _console.log("parseName", dataView);
        const name = textDecoder.decode(dataView);
        this.#updateName(name);
    }
    /** @param {string} name */
    #updateName(name) {
        _console.log({ name });
        this.#name = name;
        this.#dispatchEvent({ type: "getTfliteModelName", message: { tfliteModelName: name } });
    }
    /** @param {string} newName */
    async #setName(newName) {
        _console.assertTypeWithError(newName, "string");
        if (this.name == newName) {
            _console.log(`redundant name assignment ${newName}`);
            return;
        }

        const promise = this.waitForEvent("getTfliteModelName");

        const setNameData = textEncoder.encode(newName);
        this.sendMessage("setTfliteModelName", setNameData);

        await promise;
    }

    /** @type {TfliteModelTask} */
    #task;
    get task() {
        return this.#task;
    }
    /** @param {DataView} dataView */
    #parseTask(dataView) {
        _console.log("parseTask", dataView);
        const taskEnum = dataView.getUint8(0);
        this.#assertValidTaskEnum(taskEnum);
        const task = this.tasks[taskEnum];
        this.#updateTask(task);
    }
    /** @param {TfliteModelTask} task */
    #updateTask(task) {
        _console.log({ task });
        this.#task = task;
        this.#dispatchEvent({ type: "getTfliteModelTask", message: { tfliteModelTask: task } });
    }
    /** @param {TfliteModelTask} newTask */
    async #setTask(newTask) {
        this.#assertValidTask(newTask);
        if (this.task == newTask) {
            _console.log(`redundant task assignment ${newTask}`);
            return;
        }

        const promise = this.waitForEvent("getTfliteModelTask");

        const taskEnum = this.tasks.indexOf(newTask);
        this.sendMessage("setTfliteModelTask", Uint8Array.from([taskEnum]));

        await promise;
    }

    /** @type {number} */
    #sampleRate;
    get sampleRate() {
        return this.#sampleRate;
    }
    /** @param {DataView} dataView */
    #parseSampleRate(dataView) {
        _console.log("parseSampleRate", dataView);
        const sampleRate = dataView.getUint16(0, true);
        this.#updateSampleRate(sampleRate);
    }
    #updateSampleRate(sampleRate) {
        _console.log({ sampleRate });
        this.#sampleRate = sampleRate;
        this.#dispatchEvent({ type: "getTfliteModelSampleRate", message: { tfliteModelSampleRate: sampleRate } });
    }
    /** @param {number} newSampleRate */
    async #setSampleRate(newSampleRate) {
        _console.assertTypeWithError(newSampleRate, "number");
        if (this.#sampleRate == newSampleRate) {
            _console.log(`redundant sampleRate assignment ${newSampleRate}`);
            return;
        }

        const promise = this.waitForEvent("getTfliteModelSampleRate");

        const dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint16(0, newSampleRate, true);
        this.sendMessage("setTfliteModelSampleRate", dataView);

        await promise;
    }

    /** @type {SensorType[]} */
    #sensorTypes;
    get sensorTypes() {
        return this.#sensorTypes;
    }
    /** @param {DataView} dataView */
    #parseSensorTypes(dataView) {
        _console.log("parseSensorTypes", dataView);
        /** @type {SensorType[]} */
        const sensorTypes = [];
        for (let index = 0; index < dataView.byteLength; index++) {
            const sensorTypeEnum = dataView.getUint8(index);
            const sensorType = SensorDataManager.Types[sensorTypeEnum];
            if (sensorType) {
                sensorTypes.push(sensorType);
            } else {
                _console.error(`invalid sensorTypeEnum ${sensorTypeEnum}`);
            }
        }
        this.#updateSensorTypes(sensorTypes);
    }
    /** @param {SensorType[]} sensorTypes */
    #updateSensorTypes(sensorTypes) {
        _console.log({ sensorTypes });
        this.#sensorTypes = sensorTypes;
        this.#dispatchEvent({ type: "getTfliteModelSensorTypes", message: { tfliteModelSensorTypes: sensorTypes } });
    }
    /** @param {...SensorType} newSensorTypes */
    async #setSensorTypes(...newSensorTypes) {
        newSensorTypes.forEach((sensorType) => {
            SensorDataManager.AssertValidSensorType(sensorType);
        });

        const promise = this.waitForEvent("getTfliteModelSensorTypes");

        newSensorTypes = arrayWithoutDuplicates(newSensorTypes);
        const newSensorTypeEnums = newSensorTypes
            .map((sensorType) => SensorDataManager.Types.indexOf(sensorType))
            .sort();
        this.sendMessage("setTfliteModelSensorTypes", Uint8Array.from([newSensorTypeEnums]));

        await promise;
    }

    /** @type {number} */
    #numberOfClasses;
    get numberOfClasses() {
        return this.#numberOfClasses;
    }
    /** @param {DataView} dataView */
    #parseNumberOfClasses(dataView) {
        _console.log("parseNumberOfClasses", dataView);
        const numberOfClasses = dataView.getUint8(0);
        this.#updateNumberOfClasses(numberOfClasses);
    }
    /** @param {number} numberOfClasses */
    #updateNumberOfClasses(numberOfClasses) {
        _console.log({ numberOfClasses });
        this.#numberOfClasses = numberOfClasses;
        this.#dispatchEvent({
            type: "getTfliteModelNumberOfClasses",
            message: { tfliteModelNumberOfClasses: numberOfClasses },
        });
    }
    /** @param {number} newNumberOfClasses */
    async #setNumberOfClasses(newNumberOfClasses) {
        _console.assertTypeWithError(newNumberOfClasses, "number");
        _console.assertWithError(
            newNumberOfClasses > 1,
            `numberOfClasses must be greated than 1 (received ${newNumberOfClasses})`
        );
        if (this.#numberOfClasses == newNumberOfClasses) {
            _console.log(`redundant numberOfClasses assignment ${newNumberOfClasses}`);
            return;
        }

        const promise = this.waitForEvent("getTfliteModelNumberOfClasses");

        this.sendMessage("setTfliteModelNumberOfClasses", Uint8Array.from([newNumberOfClasses]));

        await promise;
    }

    /** @type {boolean} */
    #isReady;
    get isReady() {
        return this.#isReady;
    }
    /** @param {DataView} dataView */
    #parseIsReady(dataView) {
        _console.log("parseIsReady", dataView);
        const isReady = Boolean(dataView.getUint8(0));
        this.#updateIsReady(isReady);
    }
    /** @param {boolean} isReady */
    #updateIsReady(isReady) {
        _console.log({ isReady });
        this.#isReady = isReady;
        this.#dispatchEvent({
            type: "tfliteModelIsReady",
            message: { tfliteModelIsReady: isReady },
        });
    }

    /** @type {number} */
    #captureDelay;
    get captureDelay() {
        return this.#captureDelay;
    }
    /** @param {DataView} dataView */
    #parseCaptureDelay(dataView) {
        _console.log("parseCaptureDelay", dataView);
        const captureDelay = dataView.getUint16(0, true);
        this.#updateCaptueDelay(captureDelay);
    }
    /** @param {number} captureDelay */
    #updateCaptueDelay(captureDelay) {
        _console.log({ captureDelay });
        this.#captureDelay = captureDelay;
        this.#dispatchEvent({
            type: "getTfliteCaptureDelay",
            message: { tfliteCaptureDelay: captureDelay },
        });
    }
    /** @param {number} newCaptureDelay */
    async #setCaptureDelay(newCaptureDelay) {
        _console.assertTypeWithError(newCaptureDelay, "number");
        if (this.#captureDelay == newCaptureDelay) {
            _console.log(`redundant captureDelay assignment ${newCaptureDelay}`);
            return;
        }

        const promise = this.waitForEvent("getTfliteCaptureDelay");

        const dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint16(0, newCaptureDelay, true);
        this.sendMessage("setTfliteCaptureDelay", dataView);

        await promise;
    }

    /** @type {number} */
    #threshold;
    get threshold() {
        return this.#threshold;
    }
    /** @param {DataView} dataView */
    #parseThreshold(dataView) {
        _console.log("parseThreshold", dataView);
        const threshold = dataView.getFloat32(0, true);
        this.#updateThreshold(threshold);
    }
    /** @param {number} threshold */
    #updateThreshold(threshold) {
        _console.log({ threshold });
        this.#threshold = threshold;
        this.#dispatchEvent({
            type: "getTfliteThreshold",
            message: { tfliteThreshold: threshold },
        });
    }
    /** @param {number} newThreshold */
    async #setThreshold(newThreshold) {
        _console.assertTypeWithError(newThreshold, "number");
        if (this.#threshold == newThreshold) {
            _console.log(`redundant threshold assignment ${newThreshold}`);
            return;
        }

        const promise = this.waitForEvent("getTfliteThreshold");

        const dataView = new DataView(new ArrayBuffer(4));
        dataView.setFloat32(0, newThreshold, true);
        this.sendMessage("setTfliteThreshold", dataView);

        await promise;
    }

    /** @type {boolean} */
    #inferencingEnabled;
    get inferencingEnabled() {
        return this.#inferencingEnabled;
    }
    /** @param {DataView} dataView */
    #parseInferencingEnabled(dataView) {
        _console.log("parseInferencingEnabled", dataView);
        const inferencingEnabled = Boolean(dataView.getUint8(0));
        this.#updateInferencingEnabled(inferencingEnabled);
    }
    #updateInferencingEnabled(inferencingEnabled) {
        _console.log({ inferencingEnabled });
        this.#inferencingEnabled = inferencingEnabled;
        this.#dispatchEvent({
            type: "getTfliteInferencingEnabled",
            message: { tfliteInferencingEnabled: inferencingEnabled },
        });
    }
    /** @param {boolean} newInferencingEnabled */
    async #setInferencingEnabled(newInferencingEnabled) {
        _console.assertTypeWithError(newInferencingEnabled, "boolean");
        if (this.#inferencingEnabled == newInferencingEnabled) {
            _console.log(`redundant inferencingEnabled assignment ${newInferencingEnabled}`);
            return;
        }

        const promise = this.waitForEvent("getTfliteInferencingEnabled");

        this.sendMessage("setTfliteInferencingEnabled", Uint8Array.from([newInferencingEnabled]));

        await promise;
    }

    async enableInferencing() {
        if (this.inferencingEnabled) {
            return;
        }
        this.#setInferencingEnabled(true);
    }
    async disableInferencing() {
        if (!this.inferencingEnabled) {
            return;
        }
        this.#setInferencingEnabled(false);
    }

    /** @param {DataView} dataView */
    #parseInference(dataView) {
        // FILL
        _console.log("parseInference", dataView);
    }

    /**
     * @param {TfliteManager} messageType
     * @param {DataView} dataView
     */
    parseMessage(messageType, dataView) {
        _console.log({ messageType });

        switch (messageType) {
            case "getTfliteModelName":
                this.#parseName(dataView);
                break;
            case "getTfliteModelTask":
                this.#parseTask(dataView);
                break;
            case "getTfliteModelSampleRate":
                this.#parseSampleRate(dataView);
                break;
            case "getTfliteModelSensorTypes":
                this.#parseSensorTypes(dataView);
                break;
            case "getTfliteModelNumberOfClasses":
                this.#parseNumberOfClasses(dataView);
                break;
            case "tfliteModelIsReady":
                this.#parseIsReady(dataView);
                break;
            case "getTfliteCaptureDelay":
                this.#parseCaptureDelay(dataView);
                break;
            case "getTfliteThreshold":
                this.#parseThreshold(dataView);
                break;
            case "getTfliteInferencingEnabled":
                this.#parseInferencingEnabled(dataView);
                break;
            case "tfliteModelInference":
                this.#parseInference(dataView);
                break;
            default:
                throw Error(`uncaught messageType ${messageType}`);
        }
    }

    /** @type {SendMessageCallback} */
    sendMessage;
}

export default TfliteManager;
