/** NODE_START */ import * as tf from "@tensorflow/tfjs"; /** NODE_END */
import { Euler, PressureData } from "../BS.ts";
import { PressureSensorEventDispatcher } from "../sensor/PressureSensorDataManager.ts";
export type CenterOfPressureModelData = {
    inputs: number[][];
    outputs: number[][];
};
declare class CenterOfPressureModel {
    #private;
    constructor();
    eventDispatcher: PressureSensorEventDispatcher;
    get dispatchEvent(): <T extends "isRecordingPressureCalibrationData" | "pressureCalibrationDataRecordStart" | "pressureCalibrationDataRecordStop" | "pressureCalibrationDataRecordingProgress" | "isTrainingPressureCalibration" | "pressureCalibrationTrainStart" | "pressureCalibrationTrainEnd" | "pressureCalibrationTrainProgress" | "calibratedPressureModel">(type: T, message: import("../sensor/PressureSensorDataManager.ts").PressureSensorEventMessages[T]) => void;
    get model(): tf.Sequential | undefined;
    get numberOfSensors(): number;
    set numberOfSensors(newNumberOfSensors: number);
    clearData(): void;
    addData(pressureData: PressureData, euler: Euler): void;
    get isTrained(): boolean;
    get isTraining(): boolean;
    train(): Promise<void>;
    predict(pressureData: PressureData): {
        x: number;
        y: number;
    } | undefined;
    saveModel(handlerOrURL: tf.io.IOHandler | string, config?: tf.io.SaveConfig): Promise<boolean>;
    loadModel(pathOrIOHandlerOrFileList: string | tf.io.IOHandler | FileList, options?: tf.io.LoadOptions): Promise<boolean>;
}
export default CenterOfPressureModel;
