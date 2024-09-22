import { ConnectionMessageType } from "../connection/BaseConnectionManager.ts";
import { DeviceEventType } from "../Device.ts";
export declare const ServerMessageTypes: readonly ["isScanningAvailable", "isScanning", "startScan", "stopScan", "discoveredDevice", "discoveredDevices", "expiredDiscoveredDevice", "connectToDevice", "disconnectFromDevice", "connectedDevices", "deviceMessage"];
export type ServerMessageType = (typeof ServerMessageTypes)[number];
export declare const DeviceMessageTypes: readonly ["connectionStatus", "batteryLevel", "deviceInformation", "rx", "smp"];
export type DeviceMessageType = (typeof DeviceMessageTypes)[number];
export type MessageLike = number | number[] | ArrayBufferLike | DataView | boolean | string | any;
export interface Message<MessageType extends string> {
    type: MessageType;
    data?: MessageLike | MessageLike[];
}
export declare function createMessage<MessageType extends string>(enumeration: readonly MessageType[], ...messages: (Message<MessageType> | MessageType)[]): ArrayBuffer;
export type ServerMessage = ServerMessageType | Message<ServerMessageType>;
export declare function createServerMessage(...messages: ServerMessage[]): ArrayBuffer;
export type DeviceMessage = DeviceEventType | Message<DeviceEventType>;
export declare function createDeviceMessage(...messages: DeviceMessage[]): ArrayBuffer;
export type ClientDeviceMessage = ConnectionMessageType | Message<ConnectionMessageType>;
export declare function createClientDeviceMessage(...messages: ClientDeviceMessage[]): ArrayBuffer;
export declare const isScanningAvailableRequestMessage: ArrayBuffer;
export declare const isScanningRequestMessage: ArrayBuffer;
export declare const startScanRequestMessage: ArrayBuffer;
export declare const stopScanRequestMessage: ArrayBuffer;
export declare const discoveredDevicesMessage: ArrayBuffer;
