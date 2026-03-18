import { createConsole } from "../utils/Console.ts";
import CenterOfPressureHelper from "../utils/CenterOfPressureHelper.ts";
import RangeHelper from "../utils/RangeHelper.ts";
import { createArray } from "../utils/ArrayUtils.ts";

/** NODE_START */ import * as tf from "@tensorflow/tfjs"; /** NODE_END */
import CenterOfPressureModel, {
  CenterOfPressureModelData,
  CenterOfPressureModelDataHeatmap,
} from "../utils/CenterOfPressureModel.ts";

const _console = createConsole("PressureDataManager", { log: true });

export const PressureSensorTypes = ["pressure"] as const;
export type PressureSensorType = (typeof PressureSensorTypes)[number];

export const ContinuousPressureSensorTypes = PressureSensorTypes;
export type ContinuousPressureSensorType =
  (typeof ContinuousPressureSensorTypes)[number];

import { defaultEuler, Euler, Vector2 } from "../utils/MathUtils.ts";
export type PressureSensorPosition = Vector2;

import { CenterOfPressure } from "../utils/CenterOfPressureHelper.ts";
import { isTensorFlowAvailable } from "../BS.ts";
import Device from "../Device.ts";
import EventDispatcher from "../utils/EventDispatcher.ts";
import autoBind from "auto-bind";

export interface PressureSensorValue {
  position: PressureSensorPosition;
  rawValue: number;
  scaledValue: number;
  truncatedScaledValue: number;
  normalizedValue: number;
  weightedValue: number;
}

export interface PressureData {
  sensors: PressureSensorValue[];
  scaledSum: number;
  normalizedSum: number;
  center?: CenterOfPressure;
  normalizedCenter?: CenterOfPressure;
  motionCenter?: CenterOfPressure;
  calibratedCenter?: CenterOfPressure;
}

export interface PressureDataEventMessages {
  pressure: { pressure: PressureData };
}

export const PressureSensorEventTypes = [
  "isRecordingPressureCalibrationData",
  "pressureCalibrationDataRecordStart",
  "pressureCalibrationDataRecordStop",
  "pressureCalibrationDataRecordingProgress",
  "isTrainingPressureCalibration",
  "pressureCalibrationTrainStart",
  "pressureCalibrationTrainEnd",
  "pressureCalibrationTrainProgress",
  "calibratedPressureModel",
] as const;
export type PressureSensorEventType = (typeof PressureSensorEventTypes)[number];

export interface PressureSensorEventMessages {
  isRecordingPressureCalibrationData: {
    isRecordingPressureCalibrationData: boolean;
  };
  pressureCalibrationDataRecordStart: {};
  pressureCalibrationDataRecordStop: {};
  pressureCalibrationDataRecordingProgress: {
    numberOfSamples: number;
    data: CenterOfPressureModelData;
  };
  isTrainingPressureCalibration: {
    isTrainingPressureCalibration: boolean;
  };
  pressureCalibrationTrainStart: {};
  pressureCalibrationTrainEnd: {};
  pressureCalibrationTrainProgress: {
    pressureCalibrationTrainProgress: number;
    epoch: number;
    epochs: number;
    batchSize: number;
    loss: number;
  };
  calibratedPressureModel: {
    model: tf.Sequential;
    wasLoaded: boolean;
  };
}

export type PressureSensorEventDispatcher = EventDispatcher<
  Device,
  PressureSensorEventType,
  PressureSensorEventMessages
>;

export const DefaultNumberOfPressureSensors = 8;

class PressureSensorDataManager {
  constructor() {
    autoBind(this);
  }

  #eventDispatcher!: PressureSensorEventDispatcher;
  get eventDispatcher() {
    return this.#eventDispatcher;
  }
  set eventDispatcher(eventDispatcher) {
    if (this.#eventDispatcher == eventDispatcher) {
      return;
    }
    _console.assertWithError(
      !this.#eventDispatcher,
      "eventDispatcher already defined"
    );
    this.#eventDispatcher = eventDispatcher;
    this.#centerOfPressureModel.eventDispatcher =
      eventDispatcher as PressureSensorEventDispatcher;
  }
  get dispatchEvent() {
    return this.eventDispatcher.dispatchEvent;
  }

  #positions: PressureSensorPosition[] = [];
  get positions() {
    return this.#positions;
  }

  get numberOfSensors() {
    return this.positions.length;
  }

  parsePositions(dataView: DataView<ArrayBuffer>) {
    const positions: PressureSensorPosition[] = [];

    for (
      let pressureSensorIndex = 0, byteOffset = 0;
      byteOffset < dataView.byteLength;
      pressureSensorIndex++, byteOffset += 2
    ) {
      positions.push({
        x: dataView.getUint8(byteOffset) / 2 ** 8,
        y: dataView.getUint8(byteOffset + 1) / 2 ** 8,
      });
    }

    _console.log({ positions });

    this.#positions = positions;
    this.#centerOfPressureModel.numberOfSensors = this.numberOfSensors;

    this.#sensorRangeHelpers = createArray(
      this.numberOfSensors,
      () => new RangeHelper()
    );
    this.resetRange();
  }

  #sensorRangeHelpers!: RangeHelper[];
  #normalizedSumRangeHelper = new RangeHelper();

  #centerOfPressureHelper = new CenterOfPressureHelper();

  resetRange() {
    this.stopRecordingCalibrationData();
    this.#sensorRangeHelpers?.forEach((rangeHelper) => rangeHelper.reset());
    this.#centerOfPressureHelper.reset();
    this.#normalizedSumRangeHelper.reset();

    Object.assign(this.#euler, defaultEuler);
    this.#eulerCenterOfPressureRangeHelper.reset();
  }

  #euler: Euler = structuredClone(defaultEuler);
  #eulerTimestamp = 0;
  #eulerCenterOfPressureRangeHelper = new CenterOfPressureHelper();
  onEuler(euler: Euler, timestamp: number) {
    // _console.log("onEuler", euler, { timestamp });
    Object.assign(this.#euler, euler);
    this.#eulerTimestamp = timestamp;
  }

  #centerOfPressureModel = new CenterOfPressureModel();
  get calibrationModel() {
    return this.#centerOfPressureModel.model;
  }
  get isCalibrationModelTrained() {
    return this.#centerOfPressureModel.isTrained;
  }
  get isTrainingCalibrationModel() {
    return this.#centerOfPressureModel.isTraining;
  }
  get addCalibrationModelData() {
    return this.#centerOfPressureModel.addData;
  }
  get clearCalibrationModelData() {
    return this.#centerOfPressureModel.clearData;
  }
  get calibrationModelData() {
    return this.#centerOfPressureModel.data;
  }

  saveCalibrationModel(
    handlerOrURL: tf.io.IOHandler | string,
    config?: tf.io.SaveConfig
  ) {
    return this.#centerOfPressureModel.saveModel(handlerOrURL, config);
  }
  loadCalibrationModel(
    pathOrIOHandlerOrFileList: string | tf.io.IOHandler | FileList,
    options?: tf.io.LoadOptions
  ) {
    return this.#centerOfPressureModel.loadModel(
      pathOrIOHandlerOrFileList,
      options
    );
  }

  #isRecordingCalibrationData = false;
  get isRecordingCalibrationData() {
    return this.#isRecordingCalibrationData;
  }
  #setIsRecordingCalibrationData(newIsRecordingCalibrationData: boolean) {
    if (this.#isRecordingCalibrationData == newIsRecordingCalibrationData) {
      return;
    }
    this.#isRecordingCalibrationData = newIsRecordingCalibrationData;
    _console.log({
      isRecordingCalibrationData: this.isRecordingCalibrationData,
    });
    this.dispatchEvent("isRecordingPressureCalibrationData", {
      isRecordingPressureCalibrationData: this.isRecordingCalibrationData,
    });
    if (this.isRecordingCalibrationData) {
      this.dispatchEvent("pressureCalibrationDataRecordStart", {});
    } else {
      this.dispatchEvent("pressureCalibrationDataRecordStop", {});
    }
  }

  get canCalibrate() {
    return isTensorFlowAvailable();
  }
  startRecordingCalibrationData() {
    if (!this.canCalibrate) {
      _console.error("cannot calibrate pressure - tensorflow is not available");
      return;
    }
    this.#setIsRecordingCalibrationData(true);
  }
  stopRecordingCalibrationData() {
    this.#setIsRecordingCalibrationData(false);
  }
  toggleRecordingCalibrationData() {
    if (this.isRecordingCalibrationData) {
      this.stopRecordingCalibrationData();
    } else {
      this.startRecordingCalibrationData();
    }
  }

  async train() {
    if (this.isRecordingCalibrationData) {
      this.stopRecordingCalibrationData();
    }
    await this.#centerOfPressureModel.train();
  }

  #scaledSumThreshold = 0.03;
  parseData(
    dataView: DataView<ArrayBuffer>,
    scalar: number,
    timestamp: number
  ) {
    const pressureData: PressureData = {
      sensors: [],
      scaledSum: 0,
      normalizedSum: 0,
    };
    for (
      let index = 0, byteOffset = 0;
      byteOffset < dataView.byteLength;
      index++, byteOffset += 2
    ) {
      const rawValue = dataView.getUint16(byteOffset, true);
      // _console.log({ rawValue, scalar, numberOfSensors: this.numberOfSensors });
      const scaledValue = (rawValue * scalar) / this.numberOfSensors;
      const rangeHelper = this.#sensorRangeHelpers[index];
      const normalizedValue =
        rangeHelper.updateAndGetNormalization(scaledValue);
      const truncatedScaledValue = scaledValue - rangeHelper.min;

      const position = this.positions[index];
      pressureData.sensors[index] = {
        rawValue,
        scaledValue,
        truncatedScaledValue,
        normalizedValue,
        position,
        weightedValue: 0,
      };

      pressureData.scaledSum += truncatedScaledValue;
    }
    pressureData.normalizedSum =
      this.#normalizedSumRangeHelper.updateAndGetNormalization(
        pressureData.scaledSum
      );

    const isPressureAboveThreshold =
      pressureData.scaledSum > this.#scaledSumThreshold;
    // _console.log({
    //   isPressureAboveThreshold,
    //   scaledSum: pressureData.scaledSum,
    //   scaledSumThreshold: this.#scaledSumThreshold,
    // });

    const hasEuler =
      this.#euler && Math.abs(timestamp - this.#eulerTimestamp) < 100;
    if (hasEuler) {
      if (isPressureAboveThreshold) {
        if (this.isRecordingCalibrationData) {
          this.#eulerCenterOfPressureRangeHelper.update({
            x: -this.#euler.roll,
            y: -this.#euler.pitch,
          });
        }
        pressureData.motionCenter =
          this.#eulerCenterOfPressureRangeHelper.getNormalization({
            x: -this.#euler.roll,
            y: -this.#euler.pitch,
          });
      }
    }

    if (isPressureAboveThreshold) {
      pressureData.center = { x: 0, y: 0 };
      pressureData.sensors.forEach((sensor) => {
        sensor.weightedValue =
          sensor.truncatedScaledValue / pressureData.scaledSum;
        pressureData.center!.x += sensor.position.x * sensor.weightedValue;
        pressureData.center!.y += sensor.position.y * sensor.weightedValue;
      });
      this.#centerOfPressureHelper.update(pressureData.center);
      pressureData.normalizedCenter =
        this.#centerOfPressureHelper.getNormalization(pressureData.center);
      // console.log(pressureData.center);
    }

    if (
      this.isRecordingCalibrationData &&
      hasEuler &&
      isPressureAboveThreshold
    ) {
      this.#centerOfPressureModel.onSensorData(pressureData, this.#euler);
    }

    if (
      isPressureAboveThreshold &&
      !this.isRecordingCalibrationData &&
      !this.isTrainingCalibrationModel
    ) {
      pressureData.calibratedCenter =
        this.#centerOfPressureModel.predict(pressureData);
    }

    //_console.log({ pressureData });
    return pressureData;
  }
}

export default PressureSensorDataManager;
