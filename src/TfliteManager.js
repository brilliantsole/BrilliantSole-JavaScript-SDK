import { createConsole } from "./utils/Console.js";

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
 * "getTfliteEnableInferencing" |
 * "setTfliteEnableInferencing" |
 * "tfliteModelInference"
 * } TfliteMessageType
 */

/**
 * @callback SendMessageCallback
 * @param {TfliteMessageType} messageType
 * @param {DataView|ArrayBuffer} data
 */

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
        "getTfliteEnableInferencing",
        "setTfliteEnableInferencing",
        "tfliteModelInference",
    ];
    static get MessageTypes() {
        return this.#MessageTypes;
    }
    get messageTypes() {
        return TfliteManager.MessageTypes;
    }

    /** @param {DataView} dataView */
    #parseName(dataView) {
        // FILL
        _console.log("parseName", dataView);
    }
    /** @param {DataView} dataView */
    #parseTask(dataView) {
        // FILL
        _console.log("parseTask", dataView);
    }
    /** @param {DataView} dataView */
    #parseSampleRate(dataView) {
        // FILL
        _console.log("parseSampleRate", dataView);
    }
    /** @param {DataView} dataView */
    #parseSensorTypes(dataView) {
        // FILL
        _console.log("parseSensorTypes", dataView);
    }
    /** @param {DataView} dataView */
    #parseNumberOfClasses(dataView) {
        // FILL
        _console.log("parseNumberOfClasses", dataView);
    }
    /** @param {DataView} dataView */
    #parseIsReady(dataView) {
        // FILL
        _console.log("parseIsReady", dataView);
    }
    /** @param {DataView} dataView */
    #parseCaptureDelay(dataView) {
        // FILL
        _console.log("parseCaptureDelay", dataView);
    }
    /** @param {DataView} dataView */
    #parseThreshold(dataView) {
        // FILL
        _console.log("parseThreshold", dataView);
    }
    /** @param {DataView} dataView */
    #parseEnableInferencing(dataView) {
        // FILL
        _console.log("parseEnableInferencing", dataView);
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
            case "getTfliteEnableInferencing":
                this.#parseEnableInferencing(dataView);
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
