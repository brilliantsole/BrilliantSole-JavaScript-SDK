import { ConnectionMessageType } from "../connection/BaseConnectionManager";
import { DeviceEventType } from "../Device";
export declare const pingTimeout = 30000000;
export declare const reconnectTimeout = 3000;
export declare const ServerMessageTypes: readonly ["ping", "pong", "isScanningAvailable", "isScanning", "startScan", "stopScan", "discoveredDevice", "discoveredDevices", "expiredDiscoveredDevice", "connectToDevice", "disconnectFromDevice", "connectedDevices", "deviceMessage"];
export type ServerMessageType = (typeof ServerMessageTypes)[number];
export type MessageLike = number | number[] | ArrayBufferLike | DataView | boolean | string | any;
export interface Message<MessageType extends string> {
    type: MessageType;
    data?: MessageLike | MessageLike[];
}
export type ServerMessage = ServerMessageType | Message<ServerMessageType>;
export declare function createServerMessage(...messages: ServerMessage[]): ArrayBuffer;
export type DeviceMessage = DeviceEventType | Message<DeviceEventType>;
export declare function createDeviceMessage(...messages: DeviceMessage[]): ArrayBuffer;
export type ClientDeviceMessage = ConnectionMessageType | Message<ConnectionMessageType>;
export declare function createClientDeviceMessage(...messages: ClientDeviceMessage[]): ArrayBuffer;
export declare const pingMessage: ArrayBuffer;
export declare const pongMessage: ArrayBuffer;
export declare const isScanningAvailableRequestMessage: ArrayBuffer;
export declare const isScanningRequestMessage: ArrayBuffer;
export declare const startScanRequestMessage: ArrayBuffer;
export declare const stopScanRequestMessage: ArrayBuffer;
export declare const discoveredDevicesMessage: ArrayBuffer;