import { ConnectionStatus } from "./connection/BaseConnectionManager.ts";
import Device from "./Device.ts";
import { DeviceType } from "./InformationManager.ts";
import EventDispatcher, { BoundEventListeners, Event, EventListenerMap, EventMap } from "./utils/EventDispatcher.ts";
export interface LocalStorageDeviceInformation {
    type: DeviceType;
    bluetoothId: string;
    ipAddress?: string;
    isWifiSecure?: boolean;
}
export interface LocalStorageConfiguration {
    devices: LocalStorageDeviceInformation[];
}
export declare const DeviceManagerEventTypes: readonly ["deviceConnected", "deviceDisconnected", "deviceIsConnected", "availableDevices", "connectedDevices"];
export type DeviceManagerEventType = (typeof DeviceManagerEventTypes)[number];
interface DeviceManagerEventMessage {
    device: Device;
}
export interface DeviceManagerEventMessages {
    deviceConnected: DeviceManagerEventMessage;
    deviceDisconnected: DeviceManagerEventMessage;
    deviceIsConnected: DeviceManagerEventMessage;
    availableDevices: {
        availableDevices: Device[];
    };
    connectedDevices: {
        connectedDevices: Device[];
    };
}
export type DeviceManagerEventDispatcher = EventDispatcher<DeviceManager, DeviceManagerEventType, DeviceManagerEventMessages>;
export type DeviceManagerEventMap = EventMap<typeof Device, DeviceManagerEventType, DeviceManagerEventMessages>;
export type DeviceManagerEventListenerMap = EventListenerMap<typeof Device, DeviceManagerEventType, DeviceManagerEventMessages>;
export type DeviceManagerEvent = Event<typeof Device, DeviceManagerEventType, DeviceManagerEventMessages>;
export type BoundDeviceManagerEventListeners = BoundEventListeners<typeof Device, DeviceManagerEventType, DeviceManagerEventMessages>;
declare class DeviceManager {
    #private;
    static readonly shared: DeviceManager;
    constructor();
    /** @private */
    onDevice(device: Device): void;
    /** @private */
    OnDeviceConnectionStatusUpdated(device: Device, connectionStatus: ConnectionStatus): void;
    get ConnectedDevices(): Device[];
    get UseLocalStorage(): boolean;
    set UseLocalStorage(newUseLocalStorage: boolean);
    get CanUseLocalStorage(): false | Storage;
    get AvailableDevices(): Device[];
    get CanGetDevices(): false | (() => Promise<BluetoothDevice[]>);
    /**
     * retrieves devices already connected via web bluetooth in other tabs/windows
     *
     * _only available on web-bluetooth enabled browsers_
     */
    GetDevices(): Promise<Device[] | undefined>;
    get AddEventListener(): <T extends "deviceConnected" | "deviceIsConnected" | "connectedDevices" | "deviceDisconnected" | "availableDevices">(type: T, listener: (event: {
        type: T;
        target: DeviceManager;
        message: DeviceManagerEventMessages[T];
    }) => void, options?: {
        once?: boolean;
    }) => void;
    get RemoveEventListener(): <T extends "deviceConnected" | "deviceIsConnected" | "connectedDevices" | "deviceDisconnected" | "availableDevices">(type: T, listener: (event: {
        type: T;
        target: DeviceManager;
        message: DeviceManagerEventMessages[T];
    }) => void) => void;
    get RemoveEventListeners(): <T extends "deviceConnected" | "deviceIsConnected" | "connectedDevices" | "deviceDisconnected" | "availableDevices">(type: T) => void;
    get RemoveAllEventListeners(): () => void;
    _CheckDeviceAvailability(device: Device): void;
}
declare const _default: DeviceManager;
export default _default;
