import DevicePairPressureSensorDataManager, { DevicePairPressureDataEventMessages } from "./DevicePairPressureSensorDataManager";
import { InsoleSide } from "../InformationManager";
import { SpecificDeviceEvent } from "../Device";
import EventDispatcher from "../utils/EventDispatcher";
import DevicePair from "./DevicePair";
import { AddKeysAsPropertyToInterface, ExtendInterfaceValues, ValueOf } from "../utils/TypeScriptUtils";
export declare const DevicePairSensorTypes: readonly ["pressure", "sensorData"];
export type DevicePairSensorType = (typeof DevicePairSensorTypes)[number];
export declare const DevicePairSensorDataEventTypes: readonly ["pressure", "sensorData"];
export type DevicePairSensorDataEventType = (typeof DevicePairSensorDataEventTypes)[number];
export type DevicePairSensorDataTimestamps = {
    [insoleSide in InsoleSide]: number;
};
interface BaseDevicePairSensorDataEventMessage {
    timestamps: DevicePairSensorDataTimestamps;
}
type BaseDevicePairSensorDataEventMessages = DevicePairPressureDataEventMessages;
type _DevicePairSensorDataEventMessages = ExtendInterfaceValues<AddKeysAsPropertyToInterface<BaseDevicePairSensorDataEventMessages, "sensorType">, BaseDevicePairSensorDataEventMessage>;
export type DevicePairSensorDataEventMessage = ValueOf<_DevicePairSensorDataEventMessages>;
interface AnyDevicePairSensorDataEventMessages {
    sensorData: DevicePairSensorDataEventMessage;
}
export type DevicePairSensorDataEventMessages = _DevicePairSensorDataEventMessages & AnyDevicePairSensorDataEventMessages;
export type DevicePairSensorDataEventDispatcher = EventDispatcher<DevicePair, DevicePairSensorDataEventType, DevicePairSensorDataEventMessages>;
declare class DevicePairSensorDataManager {
    #private;
    eventDispatcher: DevicePairSensorDataEventDispatcher;
    get dispatchEvent(): <T extends "pressure" | "sensorData">(type: T, message: DevicePairSensorDataEventMessages[T]) => void;
    pressureSensorDataManager: DevicePairPressureSensorDataManager;
    resetPressureRange(): void;
    onDeviceSensorData(event: SpecificDeviceEvent<"sensorData">): void;
}
export default DevicePairSensorDataManager;
