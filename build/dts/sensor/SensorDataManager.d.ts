import PressureSensorDataManager, { PressureDataEventMessages } from "./PressureSensorDataManager";
import MotionSensorDataManager, { MotionSensorDataEventMessages } from "./MotionSensorDataManager";
import BarometerSensorDataManager, { BarometerSensorDataEventMessages } from "./BarometerSensorDataManager";
import EventDispatcher from "../utils/EventDispatcher";
import Device from "../Device";
import { AddKeysAsPropertyToInterface, ExtendInterfaceValues, ValueOf } from "../utils/TypeScriptUtils";
export declare const SensorTypes: readonly ["acceleration", "gravity", "linearAcceleration", "gyroscope", "magnetometer", "gameRotation", "rotation", "orientation", "activity", "stepCounter", "stepDetector", "deviceOrientation", "pressure", "barometer"];
export type SensorType = (typeof SensorTypes)[number];
export declare const ContinuousSensorTypes: readonly ["acceleration", "gravity", "linearAcceleration", "gyroscope", "magnetometer", "gameRotation", "rotation", "pressure", "barometer"];
export type ContinuousSensorType = (typeof ContinuousSensorTypes)[number];
export declare const SensorDataMessageTypes: readonly ["getPressurePositions", "getSensorScalars", "sensorData"];
export type SensorDataMessageType = (typeof SensorDataMessageTypes)[number];
export declare const SensorDataEventTypes: readonly ["getPressurePositions", "getSensorScalars", "sensorData", "acceleration", "gravity", "linearAcceleration", "gyroscope", "magnetometer", "gameRotation", "rotation", "orientation", "activity", "stepCounter", "stepDetector", "deviceOrientation", "pressure", "barometer"];
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
    pressureSensorDataManager: PressureSensorDataManager;
    motionSensorDataManager: MotionSensorDataManager;
    barometerSensorDataManager: BarometerSensorDataManager;
    private scalars;
    static AssertValidSensorType(sensorType: SensorType): void;
    static AssertValidSensorTypeEnum(sensorTypeEnum: number): void;
    eventDispatcher: SensorDataEventDispatcher;
    get dispatchEvent(): <T extends "pressure" | "acceleration" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation" | "orientation" | "activity" | "stepCounter" | "stepDetector" | "deviceOrientation" | "barometer" | "getPressurePositions" | "getSensorScalars" | "sensorData">(type: T, message: SensorDataEventMessages[T]) => void;
    parseMessage(messageType: SensorDataMessageType, dataView: DataView): void;
    parseScalars(dataView: DataView): void;
    private parseData;
    private parseDataCallback;
}
export default SensorDataManager;
