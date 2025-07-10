import PressureSensorDataManager, { PressureDataEventMessages } from "./PressureSensorDataManager.ts";
import MotionSensorDataManager, { MotionSensorDataEventMessages } from "./MotionSensorDataManager.ts";
import BarometerSensorDataManager, { BarometerSensorDataEventMessages } from "./BarometerSensorDataManager.ts";
import EventDispatcher from "../utils/EventDispatcher.ts";
import Device from "../Device.ts";
import { AddKeysAsPropertyToInterface, ExtendInterfaceValues, ValueOf } from "../utils/TypeScriptUtils.ts";
export declare const SensorTypes: readonly ["pressure", "acceleration", "gravity", "linearAcceleration", "gyroscope", "magnetometer", "gameRotation", "rotation", "orientation", "activity", "stepCounter", "stepDetector", "deviceOrientation", "tapDetector", "barometer", "camera", "microphone"];
export type SensorType = (typeof SensorTypes)[number];
export declare const ContinuousSensorTypes: readonly ["pressure", "acceleration", "gravity", "linearAcceleration", "gyroscope", "magnetometer", "gameRotation", "rotation", "orientation", "barometer"];
export type ContinuousSensorType = (typeof ContinuousSensorTypes)[number];
export declare const SensorDataMessageTypes: readonly ["getPressurePositions", "getSensorScalars", "sensorData"];
export type SensorDataMessageType = (typeof SensorDataMessageTypes)[number];
export declare const RequiredPressureMessageTypes: SensorDataMessageType[];
export declare const SensorDataEventTypes: readonly ["getPressurePositions", "getSensorScalars", "sensorData", "pressure", "acceleration", "gravity", "linearAcceleration", "gyroscope", "magnetometer", "gameRotation", "rotation", "orientation", "activity", "stepCounter", "stepDetector", "deviceOrientation", "tapDetector", "barometer", "camera", "microphone"];
export type SensorDataEventType = (typeof SensorDataEventTypes)[number];
interface BaseSensorDataEventMessage {
    timestamp: number;
}
type BaseSensorDataEventMessages = BarometerSensorDataEventMessages & MotionSensorDataEventMessages & PressureDataEventMessages;
type _SensorDataEventMessages = ExtendInterfaceValues<AddKeysAsPropertyToInterface<BaseSensorDataEventMessages, "sensorType">, BaseSensorDataEventMessage>;
export type SensorDataEventMessage = ValueOf<_SensorDataEventMessages>;
interface AnySensorDataEventMessages {
    sensorData: SensorDataEventMessage;
}
export type SensorDataEventMessages = _SensorDataEventMessages & AnySensorDataEventMessages;
export type SensorDataEventDispatcher = EventDispatcher<Device, SensorDataEventType, SensorDataEventMessages>;
declare class SensorDataManager {
    #private;
    pressureSensorDataManager: PressureSensorDataManager;
    motionSensorDataManager: MotionSensorDataManager;
    barometerSensorDataManager: BarometerSensorDataManager;
    static AssertValidSensorType(sensorType: SensorType): void;
    static AssertValidSensorTypeEnum(sensorTypeEnum: number): void;
    eventDispatcher: SensorDataEventDispatcher;
    get dispatchEvent(): <T extends "rotation" | "getPressurePositions" | "getSensorScalars" | "sensorData" | "pressure" | "acceleration" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "orientation" | "activity" | "stepCounter" | "stepDetector" | "deviceOrientation" | "tapDetector" | "barometer" | "camera" | "microphone">(type: T, message: SensorDataEventMessages[T]) => void;
    parseMessage(messageType: SensorDataMessageType, dataView: DataView): void;
    parseScalars(dataView: DataView): void;
    private parseData;
    private parseDataCallback;
}
export default SensorDataManager;
