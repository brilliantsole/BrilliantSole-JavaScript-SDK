import { createConsole } from "./utils/Console.ts";
import EventDispatcher from "./utils/EventDispatcher.ts";
import { textDecoder, textEncoder } from "./utils/Text.ts";
import SensorDataManager, { SensorTypes } from "./sensor/SensorDataManager.ts";
import { arrayWithoutDuplicates } from "./utils/ArrayUtils.ts";
import { SensorRateStep } from "./sensor/SensorConfigurationManager.ts";
import { parseTimestamp } from "./utils/MathUtils.ts";
import { SensorType } from "./sensor/SensorDataManager.ts";
import Device, { SendMessageCallback } from "./Device.ts";
import autoBind from "auto-bind";
import { FileConfiguration as BaseFileConfiguration } from "./FileTransferManager.ts";
import { UInt8ByteBuffer } from "./utils/ArrayBufferUtils.ts";

const _console = createConsole("TfliteManager", { log: false });

export const TfliteMessageTypes = [
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
] as const;
export type TfliteMessageType = (typeof TfliteMessageTypes)[number];

export const TfliteEventTypes = TfliteMessageTypes;
export type TfliteEventType = (typeof TfliteEventTypes)[number];

export const RequiredTfliteMessageTypes: TfliteMessageType[] = [
  "getTfliteName",
  "getTfliteTask",
  "getTfliteSampleRate",
  "getTfliteSensorTypes",
  "tfliteIsReady",
  "getTfliteCaptureDelay",
  "getTfliteThreshold",
  "getTfliteInferencingEnabled",
];

export const TfliteTasks = ["classification", "regression"] as const;
export type TfliteTask = (typeof TfliteTasks)[number];

export interface TfliteEventMessages {
  getTfliteName: { tfliteName: string };
  getTfliteTask: { tfliteTask: TfliteTask };
  getTfliteSampleRate: { tfliteSampleRate: number };
  getTfliteSensorTypes: { tfliteSensorTypes: SensorType[] };
  tfliteIsReady: { tfliteIsReady: boolean };
  getTfliteCaptureDelay: { tfliteCaptureDelay: number };
  getTfliteThreshold: { tfliteThreshold: number };
  getTfliteInferencingEnabled: { tfliteInferencingEnabled: boolean };
  tfliteInference: { tfliteInference: TfliteInference };
}

export interface TfliteInference {
  timestamp: number;
  values: number[];
  maxValue?: number;
  maxIndex?: number;
  maxClass?: string;
  classValues?: { [key: string]: number };
}

export type TfliteEventDispatcher = EventDispatcher<
  Device,
  TfliteEventType,
  TfliteEventMessages
>;
export type SendTfliteMessageCallback = SendMessageCallback<TfliteMessageType>;

export const TfliteSensorTypes = [
  "pressure",
  "linearAcceleration",
  "gyroscope",
  "magnetometer",
] as const satisfies readonly SensorType[];
export type TfliteSensorType = (typeof TfliteSensorTypes)[number];

export interface TfliteFileConfiguration extends BaseFileConfiguration {
  type: "tflite";
  name: string;
  sensorTypes: TfliteSensorType[];
  task: TfliteTask;
  sampleRate: number;
  captureDelay?: number;
  threshold?: number;
  classes?: string[];
}

class TfliteManager {
  constructor() {
    autoBind(this);
  }

  sendMessage!: SendTfliteMessageCallback;

  #assertValidTask(task: TfliteTask) {
    _console.assertEnumWithError(task, TfliteTasks);
  }
  #assertValidTaskEnum(taskEnum: number) {
    _console.assertWithError(
      taskEnum in TfliteTasks,
      `invalid taskEnum ${taskEnum}`
    );
  }

  eventDispatcher!: TfliteEventDispatcher;
  get addEventListenter() {
    return this.eventDispatcher.addEventListener;
  }
  get #dispatchEvent() {
    return this.eventDispatcher.dispatchEvent;
  }
  get removeEventListener() {
    return this.eventDispatcher.removeEventListener;
  }
  get waitForEvent() {
    return this.eventDispatcher.waitForEvent;
  }

  // PROPERTIES

  #name!: string;
  get name() {
    return this.#name;
  }
  #parseName(dataView: DataView) {
    _console.log("parseName", dataView);
    const name = textDecoder.decode(dataView.buffer);
    this.#updateName(name);
  }
  #updateName(name: string) {
    _console.log({ name });
    this.#name = name;
    this.#dispatchEvent("getTfliteName", { tfliteName: name });
  }
  async setName(newName: string, sendImmediately?: boolean) {
    _console.assertTypeWithError(newName, "string");
    if (this.name == newName) {
      _console.log(`redundant name assignment ${newName}`);
      return;
    }

    const promise = this.waitForEvent("getTfliteName");

    const setNameData = textEncoder.encode(newName);
    this.sendMessage(
      [{ type: "setTfliteName", data: setNameData.buffer }],
      sendImmediately
    );

    await promise;
  }

  #task!: TfliteTask;
  get task() {
    return this.#task;
  }
  #parseTask(dataView: DataView) {
    _console.log("parseTask", dataView);
    const taskEnum = dataView.getUint8(0);
    this.#assertValidTaskEnum(taskEnum);
    const task = TfliteTasks[taskEnum];
    this.#updateTask(task);
  }
  #updateTask(task: TfliteTask) {
    _console.log({ task });
    this.#task = task;
    this.#dispatchEvent("getTfliteTask", { tfliteTask: task });
  }
  async setTask(newTask: TfliteTask, sendImmediately?: boolean) {
    this.#assertValidTask(newTask);
    if (this.task == newTask) {
      _console.log(`redundant task assignment ${newTask}`);
      return;
    }

    const promise = this.waitForEvent("getTfliteTask");

    const taskEnum = TfliteTasks.indexOf(newTask);
    this.sendMessage(
      [{ type: "setTfliteTask", data: UInt8ByteBuffer(taskEnum) }],
      sendImmediately
    );

    await promise;
  }

  #sampleRate!: number;
  get sampleRate() {
    return this.#sampleRate;
  }
  #parseSampleRate(dataView: DataView) {
    _console.log("parseSampleRate", dataView);
    const sampleRate = dataView.getUint16(0, true);
    this.#updateSampleRate(sampleRate);
  }
  #updateSampleRate(sampleRate: number) {
    _console.log({ sampleRate });
    this.#sampleRate = sampleRate;
    this.#dispatchEvent("getTfliteSampleRate", {
      tfliteSampleRate: sampleRate,
    });
  }
  async setSampleRate(newSampleRate: number, sendImmediately?: boolean) {
    _console.assertTypeWithError(newSampleRate, "number");
    newSampleRate -= newSampleRate % SensorRateStep;
    _console.assertWithError(
      newSampleRate >= SensorRateStep,
      `sampleRate must be multiple of ${SensorRateStep} greater than 0 (got ${newSampleRate})`
    );
    if (this.#sampleRate == newSampleRate) {
      _console.log(`redundant sampleRate assignment ${newSampleRate}`);
      return;
    }

    const promise = this.waitForEvent("getTfliteSampleRate");

    const dataView = new DataView(new ArrayBuffer(2));
    dataView.setUint16(0, newSampleRate, true);
    this.sendMessage(
      [{ type: "setTfliteSampleRate", data: dataView.buffer }],
      sendImmediately
    );

    await promise;
  }

  static AssertValidSensorType(sensorType: SensorType) {
    SensorDataManager.AssertValidSensorType(sensorType);
    const tfliteSensorType = sensorType as TfliteSensorType;
    _console.assertWithError(
      TfliteSensorTypes.includes(tfliteSensorType),
      `invalid tflite sensorType "${sensorType}"`
    );
  }

  #sensorTypes: TfliteSensorType[] = [];
  get sensorTypes() {
    return this.#sensorTypes.slice();
  }
  #parseSensorTypes(dataView: DataView) {
    _console.log("parseSensorTypes", dataView);
    const sensorTypes: TfliteSensorType[] = [];
    for (let index = 0; index < dataView.byteLength; index++) {
      const sensorTypeEnum = dataView.getUint8(index);
      const sensorType = SensorTypes[sensorTypeEnum] as TfliteSensorType;
      if (sensorType) {
        if (TfliteSensorTypes.includes(sensorType)) {
          sensorTypes.push(sensorType);
        } else {
          _console.error(`invalid tfliteSensorType ${sensorType}`);
        }
      } else {
        _console.error(`invalid sensorTypeEnum ${sensorTypeEnum}`);
      }
    }
    this.#updateSensorTypes(sensorTypes);
  }
  #updateSensorTypes(sensorTypes: TfliteSensorType[]) {
    _console.log({ sensorTypes });
    this.#sensorTypes = sensorTypes;
    this.#dispatchEvent("getTfliteSensorTypes", {
      tfliteSensorTypes: sensorTypes,
    });
  }
  async setSensorTypes(
    newSensorTypes: SensorType[],
    sendImmediately?: boolean
  ) {
    newSensorTypes.forEach((sensorType) => {
      TfliteManager.AssertValidSensorType(sensorType);
    });

    const promise = this.waitForEvent("getTfliteSensorTypes");

    newSensorTypes = arrayWithoutDuplicates(newSensorTypes);
    const newSensorTypeEnums = newSensorTypes
      .map((sensorType) => SensorTypes.indexOf(sensorType))
      .sort();
    _console.log(newSensorTypes, newSensorTypeEnums);
    this.sendMessage(
      [
        {
          type: "setTfliteSensorTypes",
          data: Uint8Array.from(newSensorTypeEnums).buffer,
        },
      ],
      sendImmediately
    );

    await promise;
  }

  #isReady!: boolean;
  get isReady() {
    return this.#isReady;
  }
  #parseIsReady(dataView: DataView) {
    _console.log("parseIsReady", dataView);
    const isReady = Boolean(dataView.getUint8(0));
    this.#updateIsReady(isReady);
  }
  #updateIsReady(isReady: boolean) {
    _console.log({ isReady });
    this.#isReady = isReady;
    this.#dispatchEvent("tfliteIsReady", { tfliteIsReady: isReady });
  }
  #assertIsReady() {
    _console.assertWithError(this.isReady, `tflite is not ready`);
  }

  #captureDelay!: number;
  get captureDelay() {
    return this.#captureDelay;
  }
  #parseCaptureDelay(dataView: DataView) {
    _console.log("parseCaptureDelay", dataView);
    const captureDelay = dataView.getUint16(0, true);
    this.#updateCaptueDelay(captureDelay);
  }
  #updateCaptueDelay(captureDelay: number) {
    _console.log({ captureDelay });
    this.#captureDelay = captureDelay;
    this.#dispatchEvent("getTfliteCaptureDelay", {
      tfliteCaptureDelay: captureDelay,
    });
  }
  async setCaptureDelay(newCaptureDelay: number, sendImmediately: boolean) {
    _console.assertTypeWithError(newCaptureDelay, "number");
    if (this.#captureDelay == newCaptureDelay) {
      _console.log(`redundant captureDelay assignment ${newCaptureDelay}`);
      return;
    }

    const promise = this.waitForEvent("getTfliteCaptureDelay");

    const dataView = new DataView(new ArrayBuffer(2));
    dataView.setUint16(0, newCaptureDelay, true);
    this.sendMessage(
      [{ type: "setTfliteCaptureDelay", data: dataView.buffer }],
      sendImmediately
    );

    await promise;
  }

  #threshold!: number;
  get threshold() {
    return this.#threshold;
  }
  #parseThreshold(dataView: DataView) {
    _console.log("parseThreshold", dataView);
    const threshold = dataView.getFloat32(0, true);
    this.#updateThreshold(threshold);
  }
  #updateThreshold(threshold: number) {
    _console.log({ threshold });
    this.#threshold = threshold;
    this.#dispatchEvent("getTfliteThreshold", { tfliteThreshold: threshold });
  }
  async setThreshold(newThreshold: number, sendImmediately: boolean) {
    _console.assertTypeWithError(newThreshold, "number");
    _console.assertWithError(
      newThreshold >= 0,
      `threshold must be positive (got ${newThreshold})`
    );
    if (this.#threshold == newThreshold) {
      _console.log(`redundant threshold assignment ${newThreshold}`);
      return;
    }

    const promise = this.waitForEvent("getTfliteThreshold");

    const dataView = new DataView(new ArrayBuffer(4));
    dataView.setFloat32(0, newThreshold, true);
    this.sendMessage(
      [{ type: "setTfliteThreshold", data: dataView.buffer }],
      sendImmediately
    );

    await promise;
  }

  #inferencingEnabled!: boolean;
  get inferencingEnabled() {
    return this.#inferencingEnabled;
  }
  #parseInferencingEnabled(dataView: DataView) {
    _console.log("parseInferencingEnabled", dataView);
    const inferencingEnabled = Boolean(dataView.getUint8(0));
    this.#updateInferencingEnabled(inferencingEnabled);
  }
  #updateInferencingEnabled(inferencingEnabled: boolean) {
    _console.log({ inferencingEnabled });
    this.#inferencingEnabled = inferencingEnabled;
    this.#dispatchEvent("getTfliteInferencingEnabled", {
      tfliteInferencingEnabled: inferencingEnabled,
    });
  }
  async setInferencingEnabled(
    newInferencingEnabled: boolean,
    sendImmediately: boolean = true
  ) {
    _console.assertTypeWithError(newInferencingEnabled, "boolean");
    if (!newInferencingEnabled && !this.isReady) {
      return;
    }
    this.#assertIsReady();
    if (this.#inferencingEnabled == newInferencingEnabled) {
      _console.log(
        `redundant inferencingEnabled assignment ${newInferencingEnabled}`
      );
      return;
    }

    const promise = this.waitForEvent("getTfliteInferencingEnabled");

    this.sendMessage(
      [
        {
          type: "setTfliteInferencingEnabled",

          data: UInt8ByteBuffer(Number(newInferencingEnabled)),
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

  #parseInference(dataView: DataView) {
    _console.log("parseInference", dataView);

    const timestamp = parseTimestamp(dataView, 0);
    _console.log({ timestamp });

    const values: number[] = [];
    for (
      let index = 0, byteOffset = 2;
      byteOffset < dataView.byteLength;
      index++, byteOffset += 4
    ) {
      const value = dataView.getFloat32(byteOffset, true);
      values.push(value);
    }
    _console.log("values", values);

    const inference: TfliteInference = {
      timestamp,
      values,
    };

    if (this.task == "classification") {
      let maxValue = 0;
      let maxIndex = 0;
      values.forEach((value, index) => {
        if (value > maxValue) {
          maxValue = value;
          maxIndex = index;
        }
      });
      _console.log({ maxIndex, maxValue });
      inference.maxIndex = maxIndex;
      inference.maxValue = maxValue;
      if (this.#configuration?.classes) {
        const { classes } = this.#configuration;
        inference.maxClass = classes[maxIndex];
        inference.classValues = {};
        values.forEach((value, index) => {
          const key = classes[index];
          inference.classValues![key] = value;
        });
      }
    }

    this.#dispatchEvent("tfliteInference", { tfliteInference: inference });
  }

  parseMessage(messageType: TfliteMessageType, dataView: DataView) {
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

  #configuration?: TfliteFileConfiguration;
  get configuration() {
    return this.#configuration;
  }
  sendConfiguration(
    configuration: TfliteFileConfiguration,
    sendImmediately?: boolean
  ) {
    if (configuration == this.#configuration) {
      _console.log("redundant tflite configuration assignment");
      return;
    }
    this.#configuration = configuration;
    _console.log("assigned new tflite configuration", this.configuration);
    if (!this.configuration) {
      return;
    }
    const { name, task, captureDelay, sampleRate, threshold, sensorTypes } =
      this.configuration;
    this.setName(name, false);
    this.setTask(task, false);
    if (captureDelay != undefined) {
      this.setCaptureDelay(captureDelay, false);
    }
    this.setSampleRate(sampleRate, false);
    if (threshold != undefined) {
      this.setThreshold(threshold, false);
    }
    this.setSensorTypes(sensorTypes, sendImmediately);
  }

  clear() {
    this.#configuration = undefined;
    this.#inferencingEnabled = false;
    this.#sensorTypes = [];
    this.#sampleRate = 0;
    this.#isReady = false;
  }

  requestRequiredInformation() {
    _console.log("requesting required tflite information");
    const messages = RequiredTfliteMessageTypes.map((messageType) => ({
      type: messageType,
    }));
    this.sendMessage(messages, false);
  }
}

export default TfliteManager;
