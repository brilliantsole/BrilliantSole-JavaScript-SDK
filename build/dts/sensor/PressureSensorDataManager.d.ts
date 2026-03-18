/** NODE_START */ import * as tf from "@tensorflow/tfjs"; /** NODE_END */
import { CenterOfPressureModelData } from "../utils/CenterOfPressureModel.ts";
export declare const PressureSensorTypes: readonly ["pressure"];
export type PressureSensorType = (typeof PressureSensorTypes)[number];
export declare const ContinuousPressureSensorTypes: readonly ["pressure"];
export type ContinuousPressureSensorType = (typeof ContinuousPressureSensorTypes)[number];
import { Euler, Vector2 } from "../utils/MathUtils.ts";
export type PressureSensorPosition = Vector2;
import { CenterOfPressure } from "../utils/CenterOfPressureHelper.ts";
import Device from "../Device.ts";
import EventDispatcher from "../utils/EventDispatcher.ts";
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
    pressure: {
        pressure: PressureData;
    };
}
export declare const PressureSensorEventTypes: readonly ["isRecordingPressureCalibrationData", "pressureCalibrationDataRecordStart", "pressureCalibrationDataRecordStop", "pressureCalibrationDataRecordingProgress", "isTrainingPressureCalibration", "pressureCalibrationTrainStart", "pressureCalibrationTrainEnd", "pressureCalibrationTrainProgress", "calibratedPressureModel"];
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
export type PressureSensorEventDispatcher = EventDispatcher<Device, PressureSensorEventType, PressureSensorEventMessages>;
export declare const DefaultNumberOfPressureSensors = 8;
declare class PressureSensorDataManager {
    #private;
    constructor();
    get eventDispatcher(): PressureSensorEventDispatcher;
    set eventDispatcher(eventDispatcher: PressureSensorEventDispatcher);
    get dispatchEvent(): <T extends "isRecordingPressureCalibrationData" | "pressureCalibrationDataRecordStart" | "pressureCalibrationDataRecordStop" | "pressureCalibrationDataRecordingProgress" | "isTrainingPressureCalibration" | "pressureCalibrationTrainStart" | "pressureCalibrationTrainEnd" | "pressureCalibrationTrainProgress" | "calibratedPressureModel">(type: T, message: PressureSensorEventMessages[T]) => void;
    get positions(): Vector2[];
    get numberOfSensors(): number;
    parsePositions(dataView: DataView<ArrayBuffer>): void;
    resetRange(): void;
    onEuler(euler: Euler, timestamp: number): void;
    get calibrationModel(): tf.Sequential | undefined;
    get isCalibrationModelTrained(): boolean;
    get isTrainingCalibrationModel(): boolean;
    get addCalibrationModelData(): (inputs: number[], outputs: number[]) => void;
    get clearCalibrationModelData(): () => void;
    get calibrationModelData(): CenterOfPressureModelData;
    saveCalibrationModel(handlerOrURL: tf.io.IOHandler | string, config?: tf.io.SaveConfig): Promise<boolean>;
    loadCalibrationModel(pathOrIOHandlerOrFileList: string | tf.io.IOHandler | FileList, options?: tf.io.LoadOptions): Promise<boolean>;
    get isRecordingCalibrationData(): boolean;
    get canCalibrate(): boolean;
    startRecordingCalibrationData(): void;
    stopRecordingCalibrationData(): void;
    toggleRecordingCalibrationData(): void;
    train(): Promise<void>;
    parseData(dataView: DataView<ArrayBuffer>, scalar: number, timestamp: number): PressureData;
}
export default PressureSensorDataManager;
