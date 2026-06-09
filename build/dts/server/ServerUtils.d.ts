import { ConnectionMessageType } from "../connection/BaseConnectionManager.ts";
import { DeviceEventType } from "../Device.ts";
export declare const ServerMessageTypes: readonly ["isScanningAvailable", "isScanning", "startScan", "stopScan", "discoveredDevice", "discoveredDevices", "expiredDiscoveredDevice", "connectToDevice", "disconnectFromDevice", "connectedDevices", "deviceMessage", "requiredDeviceInformation"];
export type ServerMessageType = (typeof ServerMessageTypes)[number];
export declare const DeviceMessageTypes: readonly ["connectionStatus", "batteryLevel", "deviceInformation", "rx", "smp"];
export type DeviceMessageType = (typeof DeviceMessageTypes)[number];
export type MessageLike = number | number[] | ArrayBufferLike | DataView<ArrayBuffer> | boolean | string | any;
export interface Message<MessageType extends string> {
    type: MessageType;
    data?: MessageLike | MessageLike[];
}
export declare function createMessage<MessageType extends string>(enumeration: readonly MessageType[], ...messages: (Message<MessageType> | MessageType)[]): ArrayBuffer;
export type ServerMessage = Message<ServerMessageType>;
export type ServerMessageOrMessageType = ServerMessage | ServerMessageType;
export declare function createServerMessage(...messages: ServerMessageOrMessageType[]): ArrayBuffer;
export type DeviceMessage = Message<DeviceEventType>;
export type DeviceMessageOrMessageType = DeviceEventType | DeviceMessage;
export declare function createDeviceMessage(...messages: DeviceMessageOrMessageType[]): ArrayBuffer;
export type ClientDeviceMessage = Message<ConnectionMessageType>;
export type ClientDeviceMessageOrMessageType = ConnectionMessageType | ClientDeviceMessage;
export declare function createClientDeviceMessage(...messages: ClientDeviceMessageOrMessageType[]): ArrayBuffer;
export declare const isScanningAvailableRequestMessage: ArrayBuffer;
export declare const isScanningRequestMessage: ArrayBuffer;
export declare const startScanRequestMessage: ArrayBuffer;
export declare const stopScanRequestMessage: ArrayBuffer;
export declare const discoveredDevicesMessage: ArrayBuffer;
