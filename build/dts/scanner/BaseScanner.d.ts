import { EventDispatcherTypes } from "../utils/EventDispatcher.ts";
import { DeviceType } from "../InformationManager.ts";
import { ClientConnectionType, ConnectionType } from "../connection/BaseConnectionManager.ts";
import Device from "../Device.ts";
export declare const ScannerEventTypes: readonly ["isScanningAvailable", "isScanning", "discoveredDevice", "expiredDiscoveredDevice", "scanningAvailable", "scanningNotAvailable", "scanning", "notScanning"];
export type ScannerEventType = (typeof ScannerEventTypes)[number];
export interface DiscoveredDevice {
    bluetoothId: string;
    name: string;
    deviceType: DeviceType;
    rssi: number;
    ipAddress?: string;
    isWifiSecure?: boolean;
    device?: Device;
    connect(connectionType?: ClientConnectionType): void;
}
interface ScannerDiscoveredDeviceEventMessage {
    discoveredDevice: DiscoveredDevice;
}
export interface ScannerEventMessages {
    discoveredDevice: ScannerDiscoveredDeviceEventMessage;
    expiredDiscoveredDevice: ScannerDiscoveredDeviceEventMessage;
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
    get addEventListener(): <T extends "discoveredDevice" | "expiredDiscoveredDevice" | "isScanningAvailable" | "isScanning" | "scanning" | "notScanning" | "scanningAvailable" | "scanningNotAvailable" | "*">(type: T, listener: (event: import("../utils/EventDispatcher.ts").ListenerEvent<BaseScanner, "discoveredDevice" | "expiredDiscoveredDevice" | "isScanningAvailable" | "isScanning" | "scanning" | "notScanning" | "scanningAvailable" | "scanningNotAvailable", ScannerEventMessages, T>) => void, options?: import("../utils/EventDispatcher.ts").EventDispatcherOptions) => void;
    get removeEventListener(): <T extends "discoveredDevice" | "expiredDiscoveredDevice" | "isScanningAvailable" | "isScanning" | "scanning" | "notScanning" | "scanningAvailable" | "scanningNotAvailable" | "*">(type: T, listener: (event: import("../utils/EventDispatcher.ts").ListenerEvent<BaseScanner, "discoveredDevice" | "expiredDiscoveredDevice" | "isScanningAvailable" | "isScanning" | "scanning" | "notScanning" | "scanningAvailable" | "scanningNotAvailable", ScannerEventMessages, T>) => void) => void;
    get waitForEvent(): <T extends "discoveredDevice" | "expiredDiscoveredDevice" | "isScanningAvailable" | "isScanning" | "scanning" | "notScanning" | "scanningAvailable" | "scanningNotAvailable">(type: T, options?: {
        immediate?: boolean;
        signal?: AbortSignal;
    }) => Promise<import("../utils/EventDispatcher.ts").ListenerEvent<BaseScanner, "discoveredDevice" | "expiredDiscoveredDevice" | "isScanningAvailable" | "isScanning" | "scanning" | "notScanning" | "scanningAvailable" | "scanningNotAvailable", ScannerEventMessages, T>>;
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
