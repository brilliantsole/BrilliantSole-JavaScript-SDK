import EventDispatcher, { BoundEventListeners, Event, SpecificEvent } from "../utils/EventDispatcher";
import { DeviceType } from "../InformationManager";
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
export type SpecificScannerEvent<EventType extends ScannerEventType> = SpecificEvent<BaseScanner, ScannerEventType, ScannerEventMessages, EventType>;
export type ScannerEvent = Event<BaseScanner, ScannerEventType, ScannerEventMessages>;
export type BoundScannerEventListeners = BoundEventListeners<BaseScanner, ScannerEventType, ScannerEventMessages>;
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
        once: boolean;
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
    get discoveredDevices(): {
        [deviceId: string]: DiscoveredDevice;
    };
    get discoveredDevicesArray(): DiscoveredDevice[];
    static get DiscoveredDeviceExpirationTimeout(): number;
    connectToDevice(deviceId: string): Promise<void>;
    get canReset(): boolean;
    reset(): void;
}
export default BaseScanner;