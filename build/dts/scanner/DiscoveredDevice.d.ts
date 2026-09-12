import { DeviceType } from "../InformationManager.ts";
import { default as Device } from "../Device.ts";
import { EventDispatcherTypes } from "../utils/EventDispatcher.ts";
import { ScannerLike } from "./Scanner.ts";
import { ConnectionStatus, ConnectionType } from "../connection/BaseConnectionManager.ts";
export declare const DiscoveredDeviceEventTypes: readonly ["expired", "rssi", "name", "deviceType", "ipAddress", "isWifiSecure", "update", "device", "notConnected", "connecting", "connected", "disconnecting", "connectionStatus", "isConnected"];
export type DiscoveredDeviceEventType = (typeof DiscoveredDeviceEventTypes)[number];
export interface DiscoveredDeviceEventMessages {
    expired: {};
    rssi: {
        rssi: number;
    };
    name: {
        name: string;
    };
    deviceType: {
        deviceType: DeviceType;
    };
    ipAddress: {
        ipAddress: string;
    };
    isWifiSecure: {
        isWifiSecure: boolean;
    };
    device: {
        device: Device;
    };
    update: {
        keys: (keyof DiscoveredDeviceMetadata)[];
    };
    connectionStatus: {
        connectionStatus: ConnectionStatus;
        device: Device;
    };
    connected: {
        device: Device;
    };
    notConnected: {
        device: Device;
    };
    connecting: {
        device: Device;
    };
    disconnecting: {
        device: Device;
    };
}
export type DiscoveredDeviceEventDispatcherTypes = EventDispatcherTypes<DiscoveredDevice, DiscoveredDeviceEventType, DiscoveredDeviceEventMessages>;
export type DiscoveredDeviceEvent = DiscoveredDeviceEventDispatcherTypes["Event"];
export type DiscoveredDeviceEventMap = DiscoveredDeviceEventDispatcherTypes["EventMap"];
export type DiscoveredDeviceEventListenerMap = DiscoveredDeviceEventDispatcherTypes["EventListenerMap"];
export type DiscoveredDeviceEventDispatcher = DiscoveredDeviceEventDispatcherTypes["EventDispatcher"];
export type BoundDiscoveredDeviceEventListeners = DiscoveredDeviceEventDispatcherTypes["BoundEventListeners"];
export interface DiscoveredDeviceMetadata {
    bluetoothId: string;
    name: string;
    deviceType: DeviceType;
    rssi: number;
    ipAddress?: string;
    isWifiSecure?: boolean;
}
declare class DiscoveredDevice {
    #private;
    scanner: ScannerLike;
    get bluetoothId(): string;
    get name(): string | undefined;
    get deviceType(): "leftInsole" | "rightInsole" | "leftGlove" | "rightGlove" | "glasses" | "generic" | undefined;
    get rssi(): number | undefined;
    get ipAddress(): string | undefined;
    get isWifiSecure(): boolean | undefined;
    get device(): Device | undefined;
    private set _device(value);
    get expired(): boolean;
    constructor(scanner: ScannerLike, metadata: DiscoveredDeviceMetadata, device?: Device);
    connect(connectionType?: ConnectionType): Promise<void>;
    _expire(): void;
    update(metadata: DiscoveredDeviceMetadata): void;
    get addEventListener(): <T extends "expired" | "rssi" | "name" | "deviceType" | "ipAddress" | "isWifiSecure" | "update" | "device" | "notConnected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isConnected" | "*">(type: T, listener: (event: import("../utils/EventDispatcher.ts").ListenerEvent<DiscoveredDevice, "expired" | "rssi" | "name" | "deviceType" | "ipAddress" | "isWifiSecure" | "update" | "device" | "notConnected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isConnected", DiscoveredDeviceEventMessages, T>) => void, options?: import("../utils/EventDispatcher.ts").EventDispatcherOptions) => void;
    get removeEventListener(): <T extends "expired" | "rssi" | "name" | "deviceType" | "ipAddress" | "isWifiSecure" | "update" | "device" | "notConnected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isConnected" | "*">(type: T, listener: (event: import("../utils/EventDispatcher.ts").ListenerEvent<DiscoveredDevice, "expired" | "rssi" | "name" | "deviceType" | "ipAddress" | "isWifiSecure" | "update" | "device" | "notConnected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isConnected", DiscoveredDeviceEventMessages, T>) => void) => void;
    get waitForEvent(): <T extends "expired" | "rssi" | "name" | "deviceType" | "ipAddress" | "isWifiSecure" | "update" | "device" | "notConnected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isConnected">(type: T, options?: {
        immediate?: boolean;
        signal?: AbortSignal;
    }) => Promise<import("../utils/EventDispatcher.ts").ListenerEvent<DiscoveredDevice, "expired" | "rssi" | "name" | "deviceType" | "ipAddress" | "isWifiSecure" | "update" | "device" | "notConnected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isConnected", DiscoveredDeviceEventMessages, T>>;
    toJSON(): {
        bluetoothId: string;
        name: string | undefined;
        deviceType: "leftInsole" | "rightInsole" | "leftGlove" | "rightGlove" | "glasses" | "generic" | undefined;
        rssi: number | undefined;
        ipAddress: string | undefined;
        isWifiSecure: boolean | undefined;
    };
}
export type DiscoveredDevicesMap = {
    [bluetoothId: string]: DiscoveredDevice;
};
export default DiscoveredDevice;
