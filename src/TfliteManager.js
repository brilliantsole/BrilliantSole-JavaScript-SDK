import { createConsole } from "./utils/Console";

const _console = createConsole("TfliteManager", { log: true });

class TfliteManager {
    /** @param {DataView} dataView */
    parseName(dataView) {
        // FILL
        _console.log("parseName", dataView);
    }
    /** @param {DataView} dataView */
    parseTask(dataView) {
        // FILL
        _console.log("parseTask", dataView);
    }
    /** @param {DataView} dataView */
    parseSampleRate(dataView) {
        // FILL
        _console.log("parseSampleRate", dataView);
    }
    /** @param {DataView} dataView */
    parseSensorTypes(dataView) {
        // FILL
        _console.log("parseSensorTypes", dataView);
    }
    /** @param {DataView} dataView */
    parseNumberOfClasses(dataView) {
        // FILL
        _console.log("parseNumberOfClasses", dataView);
    }
    /** @param {DataView} dataView */
    parseIsReady(dataView) {
        // FILL
        _console.log("parseIsReady", dataView);
    }
    /** @param {DataView} dataView */
    parseCaptureDelay(dataView) {
        // FILL
        _console.log("parseCaptureDelay", dataView);
    }
    /** @param {DataView} dataView */
    parseThreshold(dataView) {
        // FILL
        _console.log("parseThreshold", dataView);
    }
    /** @param {DataView} dataView */
    parseEnableInferencing(dataView) {
        // FILL
        _console.log("parseEnableInferencing", dataView);
    }
    /** @param {DataView} dataView */
    parseInference(dataView) {
        // FILL
        _console.log("parseInference", dataView);
    }
}

export default TfliteManager;
