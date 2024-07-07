import { createConsole } from "./utils/Console.js";
import EventDispatcher from "./utils/EventDispatcher.js";
import { textDecoder, textEncoder } from "./utils/Text.js";
import SensorDataManager from "./sensor/SensorDataManager.js";
import { arrayWithoutDuplicates } from "./utils/ArrayUtils.js";
import SensorConfigurationManager from "./sensor/SensorConfigurationManager.js";
import { parseTimestamp } from "./utils/MathUtils.js";

const _console = createConsole("TfliteManager", { log: true });

/**
 * @typedef { "getTfliteName" |
 * "setTfliteName" |
 * "getTfliteTask" |
 * "setTfliteTask" |
 * "getTfliteSampleRate" |
 * "setTfliteSampleRate" |
 * "getTfliteSensorTypes" |
 * "setTfliteSensorTypes" |
 * "tfliteIsReady" |
 * "getTfliteCaptureDelay" |
 * "setTfliteCaptureDelay" |
 * "getTfliteThreshold" |
 * "setTfliteThreshold" |
 * "getTfliteInferencingEnabled" |
 * "setTfliteInferencingEnabled" |
 * "tfliteInference"
 * } TfliteMessageType
 */

/** @typedef {"classification" | "regression"} TfliteTask */

/** @typedef {import("./sensor/SensorDataManager.js").SensorType} SensorType */

/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherOptions} EventDispatcherOptions */

/** @typedef {TfliteMessageType} TfliteManagerEventType */

/** @typedef {import("./Device.js").BaseDeviceEvent} BaseDeviceEvent */

/**
 * @typedef {Object} BaseTfliteNameEvent
 * @property {"getTfliteName"} type
 * @property {{tfliteName: string}} message
 */
/** @typedef {BaseDeviceEvent & BaseTfliteNameEvent} TfliteNameEvent */

/**
 * @typedef {Object} BaseTfliteTaskEvent
 * @property {"getTfliteTask"} type
 * @property {{tfliteTask: TfliteTask}} message
 */
/** @typedef {BaseDeviceEvent & BaseTfliteNameEvent} TfliteTaskEvent */

/**
 * @typedef {Object} BaseTfliteSampleRateEvent
 * @property {"getTfliteSampleRate"} type
 * @property {{tfliteSampleRate: number}} message
 */
/** @typedef {BaseDeviceEvent & BaseTfliteSampleRateEvent} TfliteSampleRateEvent */

/**
 * @typedef {Object} BaseTfliteSensorTypesEvent
 * @property {"getTfliteSensorTypes"} type
 * @property {{tfliteSensorTypes: SensorType[]}} message
 */
/** @typedef {BaseDeviceEvent & BaseTfliteSensorTypesEvent} TfliteSensorTypesEvent */

/**
 * @typedef {Object} BaseTfliteIsReadyEvent
 * @property {"tfliteIsReady"} type
 * @property {{tfliteIsReady: boolean}} message
 */
/** @typedef {BaseDeviceEvent & BaseTfliteIsReadyEvent} TfliteIsReadyEvent */

/**
 * @typedef {Object} BaseTfliteCaptureDelayEvent
 * @property {"getTfliteCaptureDelay"} type
 * @property {{tfliteCaptureDelay: number}} message
 */
/** @typedef {BaseDeviceEvent & BaseTfliteCaptureDelayEvent} TfliteCaptureDelayEvent */

/**
 * @typedef {Object} BaseTfliteThresholdEvent
 * @property {"getTfliteThreshold"} type
 * @property {{tfliteThreshold: number}} message
 */
/** @typedef {BaseDeviceEvent & BaseTfliteThresholdEvent} TfliteThresholdEvent */

/**
 * @typedef {Object} BaseTfliteInferencingEnabledEvent
 * @property {"getTfliteInferencingEnabled"} type
 * @property {{tfliteInferencingEnabled: boolean}} message
 */
/** @typedef {BaseDeviceEvent & BaseTfliteInferencingEnabledEvent} TfliteInferencingEnabledEvent */

/**
 * @typedef {Object} BaseTfliteInferenceEvent
 * @property {"tfliteInference"} type
 * @property {{tfliteInference: TfliteInference}} message
 */
/** @typedef {BaseDeviceEvent & BaseTfliteInferenceEvent} TfliteInferenceEvent */

/**
 * @typedef {TfliteNameEvent |
 * TfliteTaskEvent |
 * TfliteSampleRateEvent |
 * TfliteSensorTypesEvent |
 * TfliteIsReadyEvent |
 * TfliteCaptureDelayEvent |
 * TfliteThresholdEvent |
 * TfliteInferencingEnabledEvent |
 * BaseTfliteInferenceEvent
 * } TfliteManagerEvent
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
    "getTfliteSensorTypes",
    "setTfliteSensorTypes",
    "tfliteIsReady",
    "getTfliteCaptureDelay",
    "setTfliteCaptureDelay",
    "getTfliteThreshold",
    "setTfliteThreshold",
    "getTfliteInferencingEnabled",
    "setTfliteInferencingEnabled",
    "tfliteInference",
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
   * @param {EventDispatcherOptions} [options]
   */
  addEventListener(type, listener, options) {
    this.eventDispatcher.addEventListener(type, listener, options);
  }

  /** @param {TfliteManagerEvent} event */
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
    this.#dispatchEvent({ type: "getTfliteName", message: { tfliteName: name } });
  }
  /**
   * @param {string} newName
   * @param {boolean} sendImmediately
   */
  async setName(newName, sendImmediately) {
    _console.assertTypeWithError(newName, "string");
    if (this.name == newName) {
      _console.log(`redundant name assignment ${newName}`);
      return;
    }

    const promise = this.waitForEvent("getTfliteName");

    const setNameData = textEncoder.encode(newName);
    this.sendMessage([{ type: "setTfliteName", data: setNameData.buffer }], sendImmediately);

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
    this.#dispatchEvent({ type: "getTfliteTask", message: { tfliteTask: task } });
  }
  /**
   * @param {TfliteTask} newTask
   * @param {boolean} sendImmediately
   */
  async setTask(newTask, sendImmediately) {
    this.#assertValidTask(newTask);
    if (this.task == newTask) {
      _console.log(`redundant task assignment ${newTask}`);
      return;
    }

    const promise = this.waitForEvent("getTfliteTask");

    const taskEnum = this.tasks.indexOf(newTask);
    this.sendMessage([{ type: "setTfliteTask", data: Uint8Array.from([taskEnum]).buffer }], sendImmediately);

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
    this.#dispatchEvent({ type: "getTfliteSampleRate", message: { tfliteSampleRate: sampleRate } });
  }
  /**
   * @param {number} newSampleRate
   * @param {boolean} sendImmediately
   */
  async setSampleRate(newSampleRate, sendImmediately) {
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
    this.sendMessage([{ type: "setTfliteSampleRate", data: dataView.buffer }], sendImmediately);

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
    this.#dispatchEvent({ type: "getTfliteSensorTypes", message: { tfliteSensorTypes: sensorTypes } });
  }
  /**
   * @param {SensorType[]} newSensorTypes
   * @param {boolean} sendImmediately
   */
  async setSensorTypes(newSensorTypes, sendImmediately) {
    newSensorTypes.forEach((sensorType) => {
      TfliteManager.AssertValidSensorType(sensorType);
    });

    const promise = this.waitForEvent("getTfliteSensorTypes");

    newSensorTypes = arrayWithoutDuplicates(newSensorTypes);
    const newSensorTypeEnums = newSensorTypes.map((sensorType) => SensorDataManager.Types.indexOf(sensorType)).sort();
    _console.log(newSensorTypes, newSensorTypeEnums);
    this.sendMessage(
      [{ type: "setTfliteSensorTypes", data: Uint8Array.from(newSensorTypeEnums).buffer }],
      sendImmediately
    );

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
      type: "tfliteIsReady",
      message: { tfliteIsReady: isReady },
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
  /**
   * @param {number} newCaptureDelay
   * @param {boolean} sendImmediately
   */
  async setCaptureDelay(newCaptureDelay, sendImmediately) {
    _console.assertTypeWithError(newCaptureDelay, "number");
    if (this.#captureDelay == newCaptureDelay) {
      _console.log(`redundant captureDelay assignment ${newCaptureDelay}`);
      return;
    }

    const promise = this.waitForEvent("getTfliteCaptureDelay");

    const dataView = new DataView(new ArrayBuffer(2));
    dataView.setUint16(0, newCaptureDelay, true);
    this.sendMessage([{ type: "setTfliteCaptureDelay", data: dataView.buffer }], sendImmediately);

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
  /**
   * @param {number} newThreshold
   * @param {boolean} sendImmediately
   */
  async setThreshold(newThreshold, sendImmediately) {
    _console.assertTypeWithError(newThreshold, "number");
    _console.assertWithError(newThreshold >= 0, `threshold must be positive (got ${newThreshold})`);
    if (this.#threshold == newThreshold) {
      _console.log(`redundant threshold assignment ${newThreshold}`);
      return;
    }

    const promise = this.waitForEvent("getTfliteThreshold");

    const dataView = new DataView(new ArrayBuffer(4));
    dataView.setFloat32(0, newThreshold, true);
    this.sendMessage([{ type: "setTfliteThreshold", data: dataView.buffer }], sendImmediately);

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
  /**
   * @param {boolean} newInferencingEnabled
   * @param {boolean} sendImmediately
   */
  async setInferencingEnabled(newInferencingEnabled, sendImmediately) {
    _console.assertTypeWithError(newInferencingEnabled, "boolean");
    if (!newInferencingEnabled && !this.isReady) {
      return;
    }
    this.#assertIsReady();
    if (this.#inferencingEnabled == newInferencingEnabled) {
      _console.log(`redundant inferencingEnabled assignment ${newInferencingEnabled}`);
      return;
    }

    const promise = this.waitForEvent("getTfliteInferencingEnabled");

    this.sendMessage(
      [
        {
          type: "setTfliteInferencingEnabled",
          data: Uint8Array.from([newInferencingEnabled]).buffer,
        },
      ],
      sendImmediately
    );

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
   * @typedef {Object} TfliteInference
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

    /** @type {TfliteInference} */
    const inference = {
      timestamp,
      values,
    };

    this.#dispatchEvent({ type: "tfliteInference", message: { tfliteInference: inference } });
  }

  /**
   * @param {TfliteMessageType} messageType
   * @param {DataView} dataView
   */
  parseMessage(messageType, dataView) {
    _console.log({ messageType });

    switch (messageType) {
      case "getTfliteName":
      case "setTfliteName":
        this.#parseName(dataView);
        break;
      case "getTfliteTask":
      case "setTfliteTask":
        this.#parseTask(dataView);
        break;
      case "getTfliteSampleRate":
      case "setTfliteSampleRate":
        this.#parseSampleRate(dataView);
        break;
      case "getTfliteSensorTypes":
      case "setTfliteSensorTypes":
        this.#parseSensorTypes(dataView);
        break;
      case "tfliteIsReady":
        this.#parseIsReady(dataView);
        break;
      case "getTfliteCaptureDelay":
      case "setTfliteCaptureDelay":
        this.#parseCaptureDelay(dataView);
        break;
      case "getTfliteThreshold":
      case "setTfliteThreshold":
        this.#parseThreshold(dataView);
        break;
      case "getTfliteInferencingEnabled":
      case "setTfliteInferencingEnabled":
        this.#parseInferencingEnabled(dataView);
        break;
      case "tfliteInference":
        this.#parseInference(dataView);
        break;
      default:
        throw Error(`uncaught messageType ${messageType}`);
    }
  }

  /**
   * @callback SendMessageCallback
   * @param {{type: TfliteMessageType, data: ArrayBuffer}[]} messages
   * @param {boolean} sendImmediately
   */

  /** @type {SendMessageCallback} */
  sendMessage;
}

export default TfliteManager;
