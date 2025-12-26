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
declare class SensorConfigurationManager {
    #private;
    constructor();
    sendMessage: SendSensorConfigurationMessageCallback;
    eventDispatcher: SensorConfigurationEventDispatcher;
    get addEventListener(): <T extends "getSensorConfiguration" | "setSensorConfiguration">(type: T, listener: (event: {
        type: T;
        target: Device;
        message: SensorConfigurationEventMessages[T];
    }) => void, options?: {
        once?: boolean;
    }) => void;
    get waitForEvent(): <T extends "getSensorConfiguration" | "setSensorConfiguration">(type: T) => Promise<{
        type: T;
        target: Device;
        message: SensorConfigurationEventMessages[T];
    }>;
    get availableSensorTypes(): ("pressure" | "barometer" | "acceleration" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation" | "orientation" | "stepDetector" | "stepCounter" | "activity" | "deviceOrientation" | "tapDetector" | "camera" | "microphone")[];
    hasSensorType(sensorType: SensorType): boolean;
    get configuration(): SensorConfiguration;
    clear(): void;
    setConfiguration(newSensorConfiguration: SensorConfiguration, clearRest?: boolean, sendImmediately?: boolean): Promise<void>;
    static get ZeroSensorConfiguration(): SensorConfiguration;
    get zeroSensorConfiguration(): SensorConfiguration;
    clearSensorConfiguration(): Promise<void>;
    parseMessage(messageType: SensorConfigurationMessageType, dataView: DataView<ArrayBuffer>): void;
}
export default SensorConfigurationManager;
