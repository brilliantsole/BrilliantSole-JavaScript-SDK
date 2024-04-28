import { createConsole } from "./utils/Console.js";
import EventDispatcher from "./utils/EventDispatcher.js";
import { textDecoder, textEncoder } from "./utils/Text.js";
import SensorDataManager from "./sensor/SensorDataManager.js";
import { arrayWithoutDuplicates } from "./utils/ArrayUtils.js";
import SensorConfigurationManager from "./sensor/SensorConfigurationManager.js";
import { parseTimestamp } from "./utils/MathUtils.js";

const _console = createConsole("TfliteManager", { log: false });

/**
 * @typedef { "getTfliteName" |
 * "setTfliteName" |
 * "getTfliteTask" |
 * "setTfliteTask" |
 * "getTfliteSampleRate" |
 * "setTfliteSampleRate" |
 * "getTfliteNumberOfSamples" |
 * "setTfliteNumberOfSamples" |
 * "getTfliteSensorTypes" |
 * "setTfliteSensorTypes" |
 * "getTfliteNumberOfClasses" |
 * "setTfliteNumberOfClasses" |
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

/** @typedef {"classification" | "regression"} TfliteTask */

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
        "getTfliteName",
        "setTfliteName",
        "getTfliteTask",
        "setTfliteTask",
        "getTfliteSampleRate",
        "setTfliteSampleRate",
        "getTfliteNumberOfSamples",
        "setTfliteNumberOfSamples",
        "getTfliteSensorTypes",
        "setTfliteSensorTypes",
        "getTfliteNumberOfClasses",
        "setTfliteNumberOfClasses",
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

    /** @type {TfliteTask[]} */
    static #Tasks = ["classification", "regression"];
    static get Tasks() {
        return this.#Tasks;
    }
    get tasks() {
        return TfliteManager.Tasks;
    }
    /** @param {TfliteTask} task */
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
        this.#dispatchEvent({ type: "getTfliteName", message: { tfliteModelName: name } });
    }
    /** @param {string} newName */
    async setName(newName) {
        _console.assertTypeWithError(newName, "string");
        if (this.name == newName) {
            _console.log(`redundant name assignment ${newName}`);
            return;
        }

        const promise = this.waitForEvent("getTfliteName");

        const setNameData = textEncoder.encode(newName);
        this.sendMessage("setTfliteName", setNameData);

        await promise;
    }

    /** @type {TfliteTask} */
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
    /** @param {TfliteTask} task */
    #updateTask(task) {
        _console.log({ task });
        this.#task = task;
        this.#dispatchEvent({ type: "getTfliteTask", message: { tfliteModelTask: task } });
    }
    /** @param {TfliteTask} newTask */
    async setTask(newTask) {
        this.#assertValidTask(newTask);
        if (this.task == newTask) {
            _console.log(`redundant task assignment ${newTask}`);
            return;
        }

        const promise = this.waitForEvent("getTfliteTask");

        const taskEnum = this.tasks.indexOf(newTask);
        this.sendMessage("setTfliteTask", Uint8Array.from([taskEnum]));

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
        this.#dispatchEvent({ type: "getTfliteSampleRate", message: { tfliteModelSampleRate: sampleRate } });
    }
    /** @param {number} newSampleRate */
    async setSampleRate(newSampleRate) {
        _console.assertTypeWithError(newSampleRate, "number");
        newSampleRate -= newSampleRate % SensorConfigurationManager.SensorRateStep;
        _console.assertWithError(
            newSampleRate >= SensorConfigurationManager.SensorRateStep,
            `sampleRate must be multiple of ${SensorConfigurationManager.SensorRateStep} greater than 0 (got ${newSampleRate})`
        );
        if (this.#sampleRate == newSampleRate) {
            _console.log(`redundant sampleRate assignment ${newSampleRate}`);
            return;
        }

        const promise = this.waitForEvent("getTfliteSampleRate");

        const dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint16(0, newSampleRate, true);
        this.sendMessage("setTfliteSampleRate", dataView);

        await promise;
    }

    /** @type {number} */
    #numberOfSamples;
    get numberOfSamples() {
        return this.#numberOfSamples;
    }
    /** @param {DataView} dataView */
    #parseNumberOfSamples(dataView) {
        _console.log("parseNumberOfSamples", dataView);
        const numberOfSamples = dataView.getUint16(0, true);
        this.#updateNumberOfSamples(numberOfSamples);
    }
    #updateNumberOfSamples(numberOfSamples) {
        _console.log({ numberOfSamples });
        this.#numberOfSamples = numberOfSamples;
        this.#dispatchEvent({
            type: "getTfliteNumberOfSamples",
            message: { tfliteModelNumberOfSamples: numberOfSamples },
        });
    }
    /** @param {number} newNumberOfSamples */
    async setNumberOfSamples(newNumberOfSamples) {
        _console.assertTypeWithError(newNumberOfSamples, "number");
        _console.assertWithError(
            newNumberOfSamples > 0,
            `numberOfSamples must be greater than 1 (got ${newNumberOfSamples})`
        );
        if (this.#numberOfSamples == newNumberOfSamples) {
            _console.log(`redundant numberOfSamples assignment ${newNumberOfSamples}`);
            return;
        }

        const promise = this.waitForEvent("getTfliteNumberOfSamples");

        const dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint16(0, newNumberOfSamples, true);
        this.sendMessage("setTfliteNumberOfSamples", dataView);

        await promise;
    }

    /** @type {SensorType[]} */
    static #SensorTypes = ["pressure", "linearAcceleration", "gyroscope", "magnetometer"];
    static get SensorTypes() {
        return this.#SensorTypes;
    }

    static AssertValidSensorType(sensorType) {
        SensorDataManager.AssertValidSensorType(sensorType);
        _console.assertWithError(this.#SensorTypes.includes(sensorType), `invalid tflite sensorType "${sensorType}"`);
    }

    /** @type {SensorType[]} */
    #sensorTypes = [];
    get sensorTypes() {
        return this.#sensorTypes.slice();
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
        this.#dispatchEvent({ type: "getTfliteSensorTypes", message: { tfliteModelSensorTypes: sensorTypes } });
    }
    /** @param {SensorType[]} newSensorTypes */
    async setSensorTypes(newSensorTypes) {
        newSensorTypes.forEach((sensorType) => {
            TfliteManager.AssertValidSensorType(sensorType);
        });

        const promise = this.waitForEvent("getTfliteSensorTypes");

        newSensorTypes = arrayWithoutDuplicates(newSensorTypes);
        const newSensorTypeEnums = newSensorTypes
            .map((sensorType) => SensorDataManager.Types.indexOf(sensorType))
            .sort();
        _console.log(newSensorTypes, newSensorTypeEnums);
        this.sendMessage("setTfliteSensorTypes", Uint8Array.from(newSensorTypeEnums));

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
            type: "getTfliteNumberOfClasses",
            message: { tfliteModelNumberOfClasses: numberOfClasses },
        });
    }
    /** @param {number} newNumberOfClasses */
    async setNumberOfClasses(newNumberOfClasses) {
        _console.assertTypeWithError(newNumberOfClasses, "number");
        _console.assertWithError(
            newNumberOfClasses > 1,
            `numberOfClasses must be greated than 1 (received ${newNumberOfClasses})`
        );
        if (this.#numberOfClasses == newNumberOfClasses) {
            _console.log(`redundant numberOfClasses assignment ${newNumberOfClasses}`);
            return;
        }

        const promise = this.waitForEvent("getTfliteNumberOfClasses");

        this.sendMessage("setTfliteNumberOfClasses", Uint8Array.from([newNumberOfClasses]));

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
    #assertIsReady() {
        _console.assertWithError(this.isReady, `tflite is not ready`);
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
    async setCaptureDelay(newCaptureDelay) {
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
    async setThreshold(newThreshold) {
        _console.assertTypeWithError(newThreshold, "number");
        _console.assertWithError(newThreshold >= 0, `threshold must be positive (got ${newThreshold})`);
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
    async setInferencingEnabled(newInferencingEnabled) {
        _console.assertTypeWithError(newInferencingEnabled, "boolean");
        this.#assertIsReady();
        if (this.#inferencingEnabled == newInferencingEnabled) {
            _console.log(`redundant inferencingEnabled assignment ${newInferencingEnabled}`);
            return;
        }

        const promise = this.waitForEvent("getTfliteInferencingEnabled");

        this.sendMessage("setTfliteInferencingEnabled", Uint8Array.from([newInferencingEnabled]));

        await promise;
    }
    async toggleInferencingEnabled() {
        return this.setInferencingEnabled(!this.inferencingEnabled);
    }

    async enableInferencing() {
        if (this.inferencingEnabled) {
            return;
        }
        this.setInferencingEnabled(true);
    }
    async disableInferencing() {
        if (!this.inferencingEnabled) {
            return;
        }
        this.setInferencingEnabled(false);
    }

    /**
     * @typedef TfliteModelInference
     * @type {object}
     * @property {number} timestamp
     * @property {number[]} values
     */

    /** @param {DataView} dataView */
    #parseInference(dataView) {
        _console.log("parseInference", dataView);

        const timestamp = parseTimestamp(dataView, 0);
        _console.log({ timestamp });

        /** @type {number[]} */
        const values = [];
        for (let index = 0, byteOffset = 2; byteOffset < dataView.byteLength; index++, byteOffset += 4) {
            const value = dataView.getFloat32(byteOffset, true);
            values.push(value);
        }
        _console.log("values", values);

        /** @type {TfliteModelInference} */
        const inference = {
            timestamp,
            values,
        };

        this.#dispatchEvent({ type: "tfliteModelInference", message: { tfliteModelInference: inference } });
    }

    /**
     * @param {TfliteMessageType} messageType
     * @param {DataView} dataView
     */
    parseMessage(messageType, dataView) {
        _console.log({ messageType });

        switch (messageType) {
            case "getTfliteName":
                this.#parseName(dataView);
                break;
            case "getTfliteTask":
                this.#parseTask(dataView);
                break;
            case "getTfliteSampleRate":
                this.#parseSampleRate(dataView);
                break;
            case "getTfliteNumberOfSamples":
                this.#parseNumberOfSamples(dataView);
                break;
            case "getTfliteSensorTypes":
                this.#parseSensorTypes(dataView);
                break;
            case "getTfliteNumberOfClasses":
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

    /**
     * @callback SendMessageCallback
     * @param {TfliteMessageType} messageType
     * @param {DataView|ArrayBuffer} data
     */

    /** @type {SendMessageCallback} */
    sendMessage;
}

export default TfliteManager;
