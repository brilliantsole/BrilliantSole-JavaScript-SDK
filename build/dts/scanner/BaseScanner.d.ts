import { EventDispatcherTypes } from "../utils/EventDispatcher.ts";
import { ConnectionType } from "../connection/BaseConnectionManager.ts";
import DiscoveredDevice, { DiscoveredDeviceMetadata, DiscoveredDeviceMetadataKeys, DiscoveredDevicesMap } from "./DiscoveredDevice.ts";
import { ConnectionManager } from "../connection/ConnectionManager.ts";
export declare const ScannerEventTypes: readonly ["isScanningAvailable", "isScanning", "discoveredDevice", "discoveredDeviceUpdate", "expiredDiscoveredDevice", "discoveredDevices", "scanningAvailable", "scanningNotAvailable", "scanning", "notScanning"];
export type ScannerEventType = (typeof ScannerEventTypes)[number];
export interface ScannerEventMessages {
    discoveredDevice: {
        discoveredDevice: DiscoveredDevice;
    };
    discoveredDeviceUpdate: {
        discoveredDevice: DiscoveredDevice;
        keys: DiscoveredDeviceMetadataKeys;
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
declare abstract class BaseScanner {
    #private;
    private static OnScanner;
    protected get baseConstructor(): typeof BaseScanner;
    readonly connectionType: ConnectionType;
    readonly isClient = false;
    constructor();
    get addEventListener(): <T extends "*" | "isScanningAvailable" | "isScanning" | "discoveredDevice" | "discoveredDeviceUpdate" | "expiredDiscoveredDevice" | "discoveredDevices" | "scanningAvailable" | "scanningNotAvailable" | "scanning" | "notScanning">(type: T, listener: (event: import("../utils/EventDispatcher.ts").ListenerEvent<BaseScanner, "isScanningAvailable" | "isScanning" | "discoveredDevice" | "discoveredDeviceUpdate" | "expiredDiscoveredDevice" | "discoveredDevices" | "scanningAvailable" | "scanningNotAvailable" | "scanning" | "notScanning", ScannerEventMessages, T>) => void, options?: import("../utils/EventDispatcher.ts").EventDispatcherOptions) => void;
    get removeEventListener(): <T extends "*" | "isScanningAvailable" | "isScanning" | "discoveredDevice" | "discoveredDeviceUpdate" | "expiredDiscoveredDevice" | "discoveredDevices" | "scanningAvailable" | "scanningNotAvailable" | "scanning" | "notScanning">(type: T, listener: (event: import("../utils/EventDispatcher.ts").ListenerEvent<BaseScanner, "isScanningAvailable" | "isScanning" | "discoveredDevice" | "discoveredDeviceUpdate" | "expiredDiscoveredDevice" | "discoveredDevices" | "scanningAvailable" | "scanningNotAvailable" | "scanning" | "notScanning", ScannerEventMessages, T>) => void) => void;
    get waitForEvent(): <T extends "isScanningAvailable" | "isScanning" | "discoveredDevice" | "discoveredDeviceUpdate" | "expiredDiscoveredDevice" | "discoveredDevices" | "scanningAvailable" | "scanningNotAvailable" | "scanning" | "notScanning">(type: T, options?: {
        immediate?: boolean;
        signal?: AbortSignal;
    }) => Promise<import("../utils/EventDispatcher.ts").ListenerEvent<BaseScanner, "isScanningAvailable" | "isScanning" | "discoveredDevice" | "discoveredDeviceUpdate" | "expiredDiscoveredDevice" | "discoveredDevices" | "scanningAvailable" | "scanningNotAvailable" | "scanning" | "notScanning", ScannerEventMessages, T>>;
    get isScanningAvailable(): boolean;
    protected set _isScanningAvailable(newIsScanningAvailable: boolean);
    get isScanning(): boolean;
    protected set _isScanning(newIsScanning: boolean);
    startScan(): boolean;
    stopScan(): boolean;
    toggleScan(): boolean;
    get discoveredDevices(): Readonly<DiscoveredDevicesMap>;
    get discoveredDevicesArray(): DiscoveredDevice[];
    protected _parseManufacturerData(dataView: DataView | string): {
        deviceType: "leftInsole" | "rightInsole" | "leftGlove" | "rightGlove" | "glasses" | "generic" | undefined;
        ipAddress: string | undefined;
        isWifiSecure: boolean | undefined;
    };
    protected _onDiscoveredDevice(discoveredDeviceMetadata: DiscoveredDeviceMetadata): void;
    static get DiscoveredDeviceExpirationTimeout(): number;
    connectToDevice(bluetoothId: string, connectionType?: ConnectionType): Promise<void>;
    disconnectFromDevice(bluetoothId: string): Promise<void>;
    abstract _createConnectionManager(bluetoothId: string): ConnectionManager;
    get canReset(): boolean;
    reset(): void;
}
export default BaseScanner;
