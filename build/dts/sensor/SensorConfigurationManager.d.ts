import { SensorType } from "./SensorDataManager.ts";
import EventDispatcher from "../utils/EventDispatcher.ts";
import Device, { SendMessageCallback } from "../Device.ts";
export type SensorConfiguration = {
    [sensorType in SensorType]?: number;
};
export declare const MaxSensorRate: number;
export declare const SensorRateStep = 5;
export declare const SensorConfigurationMessageTypes: readonly ["getSensorConfiguration", "setSensorConfiguration"];
export type SensorConfigurationMessageType = (typeof SensorConfigurationMessageTypes)[number];
export declare const SensorConfigurationEventTypes: readonly ["getSensorConfiguration", "setSensorConfiguration"];
export type SensorConfigurationEventType = (typeof SensorConfigurationEventTypes)[number];
export interface SensorConfigurationEventMessages {
    getSensorConfiguration: {
        sensorConfiguration: SensorConfiguration;
    };
}
export type SensorConfigurationEventDispatcher = EventDispatcher<Device, SensorConfigurationEventType, SensorConfigurationEventMessages>;
export type SendSensorConfigurationMessageCallback = SendMessageCallback<SensorConfigurationMessageType>;
export declare function parseSensorConfiguration(dataView: DataView<ArrayBuffer>, callback?: (sensorType: SensorType, sensorRate: number, context?: any) => boolean, context?: any): SensorConfiguration;
export declare function assertValidSensorRate(sensorRate: number): void;
export declare function serializeSensorConfiguration(sensorConfiguration: SensorConfiguration, availableSensorTypes?: SensorType[]): DataView<ArrayBuffer>;
declare class SensorConfigurationManager {
    #private;
    constructor();
    sendMessage: SendSensorConfigurationMessageCallback;
    eventDispatcher: SensorConfigurationEventDispatcher;
    get addEventListener(): <T extends "*" | "getSensorConfiguration" | "setSensorConfiguration">(type: T, listener: (event: import("../utils/EventDispatcher.ts").ListenerEvent<Device, "getSensorConfiguration" | "setSensorConfiguration", SensorConfigurationEventMessages, T>) => void, options?: {
        once?: boolean;
    }) => void;
    get waitForEvent(): <T extends "getSensorConfiguration" | "setSensorConfiguration">(type: T) => Promise<import("../utils/EventDispatcher.ts").ListenerEvent<Device, "getSensorConfiguration" | "setSensorConfiguration", SensorConfigurationEventMessages, T>>;
    get availableSensorTypes(): ("pressure" | "barometer" | "acceleration" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation" | "orientation" | "stepDetector" | "stepCounter" | "activity" | "deviceOrientation" | "tapDetector" | "buttons" | "touches" | "light" | "camera" | "microphone")[];
    hasSensorType(sensorType: SensorType): boolean;
    get configuration(): SensorConfiguration;
    clear(): void;
    setConfiguration(newSensorConfiguration: SensorConfiguration, clearRest?: boolean, sendImmediately?: boolean): Promise<void>;
    toggleSensor(sensorType: SensorType, sensorRate: number, clearRest?: boolean, sendImmediately?: boolean): Promise<void>;
    static get ZeroSensorConfiguration(): SensorConfiguration;
    get zeroSensorConfiguration(): SensorConfiguration;
    clearSensorConfiguration(): Promise<void>;
    parseMessage(messageType: SensorConfigurationMessageType, dataView: DataView<ArrayBuffer>): void;
}
export default SensorConfigurationManager;
