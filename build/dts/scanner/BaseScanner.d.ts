import { EventDispatcherTypes } from "../utils/EventDispatcher.ts";
import { DeviceType } from "../InformationManager.ts";
import { ClientConnectionType, ConnectionType } from "../connection/BaseConnectionManager.ts";
import Device from "../Device.ts";
import { ScannerLike } from "./Scanner.ts";
export declare const ScannerEventTypes: readonly ["isScanningAvailable", "isScanning", "discoveredDevice", "expiredDiscoveredDevice", "discoveredDevices", "scanningAvailable", "scanningNotAvailable", "scanning", "notScanning"];
export type ScannerEventType = (typeof ScannerEventTypes)[number];
export interface DiscoveredDevice {
    scanner: ScannerLike;
    bluetoothId: string;
    name: string;
    deviceType: DeviceType;
    rssi: number;
    ipAddress?: string;
    isWifiSecure?: boolean;
    device?: Device;
    connect(connectionType?: ClientConnectionType): void;
}
export interface ScannerEventMessages {
    discoveredDevice: {
        discoveredDevice: DiscoveredDevice;
        firstTime: Boolean;
    };
    expiredDiscoveredDevice: {
        discoveredDevice: DiscoveredDevice;
    };
    discoveredDevices: {
        discoveredDevices: DiscoveredDevicesMap;
    };
    isScanningAvailable: {
        isScanningAvailable: boolean;
    };
    isScanning: {
        isScanning: boolean;
    };
    scanning: {};
    notScanning: {};
    scanningAvailable: {};
    scanningNotAvailable: {};
}
export type ScannerEventDispatcherTypes = EventDispatcherTypes<BaseScanner, ScannerEventType, ScannerEventMessages>;
export type ScannerEvent = ScannerEventDispatcherTypes["Event"];
export type ScannerEventMap = ScannerEventDispatcherTypes["EventMap"];
export type ScannerEventListenerMap = ScannerEventDispatcherTypes["EventListenerMap"];
export type ScannerEventDispatcher = ScannerEventDispatcherTypes["EventDispatcher"];
export type BoundScannerEventListeners = ScannerEventDispatcherTypes["BoundEventListeners"];
export type DiscoveredDevicesMap = {
    [deviceId: string]: DiscoveredDevice;
};
declare abstract class BaseScanner {
    #private;
    protected get baseConstructor(): typeof BaseScanner;
    static get isSupported(): boolean;
    get isSupported(): boolean;
    constructor();
    get addEventListener(): <T extends "*" | "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice" | "discoveredDevices" | "scanningAvailable" | "scanningNotAvailable" | "scanning" | "notScanning">(type: T, listener: (event: import("../utils/EventDispatcher.ts").ListenerEvent<BaseScanner, "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice" | "discoveredDevices" | "scanningAvailable" | "scanningNotAvailable" | "scanning" | "notScanning", ScannerEventMessages, T>) => void, options?: import("../utils/EventDispatcher.ts").EventDispatcherOptions) => void;
    get removeEventListener(): <T extends "*" | "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice" | "discoveredDevices" | "scanningAvailable" | "scanningNotAvailable" | "scanning" | "notScanning">(type: T, listener: (event: import("../utils/EventDispatcher.ts").ListenerEvent<BaseScanner, "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice" | "discoveredDevices" | "scanningAvailable" | "scanningNotAvailable" | "scanning" | "notScanning", ScannerEventMessages, T>) => void) => void;
    get waitForEvent(): <T extends "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice" | "discoveredDevices" | "scanningAvailable" | "scanningNotAvailable" | "scanning" | "notScanning">(type: T, options?: {
        immediate?: boolean;
        signal?: AbortSignal;
    }) => Promise<import("../utils/EventDispatcher.ts").ListenerEvent<BaseScanner, "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice" | "discoveredDevices" | "scanningAvailable" | "scanningNotAvailable" | "scanning" | "notScanning", ScannerEventMessages, T>>;
    get isScanningAvailable(): boolean;
    protected set _isScanningAvailable(newIsScanningAvailable: boolean);
    get isScanning(): boolean;
    protected set _isScanning(newIsScanning: boolean);
    startScan(): boolean;
    stopScan(): boolean;
    get discoveredDevices(): Readonly<DiscoveredDevicesMap>;
    get discoveredDevicesArray(): DiscoveredDevice[];
    protected _onDiscoveredDevice(discoveredDevice: DiscoveredDevice): void;
    static get DiscoveredDeviceExpirationTimeout(): number;
    connectToDevice(deviceId: string, connectionType?: ConnectionType): Promise<void>;
    disconnectFromDevice(deviceId: string): Promise<void>;
    abstract devices: {
        [bluetoothId: string]: Device;
    };
    get canReset(): boolean;
    reset(): void;
}
export default BaseScanner;
