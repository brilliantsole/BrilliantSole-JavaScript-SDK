import EventDispatcher from "../utils/EventDispatcher";
import Device, { SendMessageCallback } from "../Device";
import { SensorType } from "./SensorDataManager";
export type SensorConfiguration = {
    [sensorType in SensorType]?: number;
};
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
    get configuration(): SensorConfiguration;
    setConfiguration(newSensorConfiguration: SensorConfiguration, clearRest?: boolean): Promise<void>;
    static get MaxSensorRate(): number;
    get maxSensorRate(): number;
    static get SensorRateStep(): number;
    get sensorRateStep(): number;
    static get ZeroSensorConfiguration(): SensorConfiguration;
    get zeroSensorConfiguration(): SensorConfiguration;
    clearSensorConfiguration(): Promise<void>;
    parseMessage(messageType: SensorConfigurationMessageType, dataView: DataView): void;
}
export default SensorConfigurationManager;
