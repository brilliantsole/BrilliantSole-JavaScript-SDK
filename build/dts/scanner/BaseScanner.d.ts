import EventDispatcher, { BoundEventListeners, Event, EventMap } from "../utils/EventDispatcher.ts";
import { DeviceType } from "../InformationManager.ts";
export declare const ScannerEventTypes: readonly ["isScanningAvailable", "isScanning", "discoveredDevice", "expiredDiscoveredDevice"];
export type ScannerEventType = (typeof ScannerEventTypes)[number];
export interface DiscoveredDevice {
    bluetoothId: string;
    name: string;
    deviceType?: DeviceType;
    rssi: number;
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
}
export type ScannerEventDispatcher = EventDispatcher<BaseScanner, ScannerEventType, ScannerEventMessages>;
export type ScannerEventMap = EventMap<BaseScanner, ScannerEventType, ScannerEventMessages>;
export type ScannerEvent = Event<BaseScanner, ScannerEventType, ScannerEventMessages>;
export type BoundScannerEventListeners = BoundEventListeners<BaseScanner, ScannerEventType, ScannerEventMessages>;
export type DiscoveredDevicesMap = {
    [deviceId: string]: DiscoveredDevice;
};
declare abstract class BaseScanner {
    #private;
    static get isSupported(): boolean;
    get isSupported(): boolean;
    constructor();
    get addEventListener(): <T extends "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice">(type: T, listener: (event: {
        type: T;
        target: BaseScanner;
        message: ScannerEventMessages[T];
    }) => void, options?: {
        once?: boolean;
    }) => void;
    protected get dispatchEvent(): <T extends "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice">(type: T, message: ScannerEventMessages[T]) => void;
    get removeEventListener(): <T extends "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice">(type: T, listener: (event: {
        type: T;
        target: BaseScanner;
        message: ScannerEventMessages[T];
    }) => void) => void;
    get waitForEvent(): <T extends "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice">(type: T) => Promise<{
        type: T;
        target: BaseScanner;
        message: ScannerEventMessages[T];
    }>;
    get isScanningAvailable(): boolean;
    get isScanning(): boolean;
    startScan(): void;
    stopScan(): void;
    get discoveredDevices(): Readonly<DiscoveredDevicesMap>;
    get discoveredDevicesArray(): DiscoveredDevice[];
    static get DiscoveredDeviceExpirationTimeout(): number;
    connectToDevice(deviceId: string): Promise<void>;
    get canReset(): boolean;
    reset(): void;
}
export default BaseScanner;
