import { EventDispatcherTypes } from "../utils/EventDispatcher.ts";
import { AddPrefixToInterfaceKeys, ExtendInterfaceValues, IfAny } from "../utils/TypeScriptUtils.ts";
import { ScannerEventType, ScannerEventMessages } from "./BaseScanner.ts";
import { ScannerLike } from "./Scanner.ts";
import { DiscoveredDevicesMap } from "./DiscoveredDevice.ts";
interface BaseScannerManagerScannerEventMessage {
    scanner: ScannerLike;
}
type ScannerManagerScannerEventMessages = ExtendInterfaceValues<AddPrefixToInterfaceKeys<ScannerEventMessages, "scanner">, BaseScannerManagerScannerEventMessage>;
export declare const wildcardScannerEventType: "scanner*";
export type WildcardScannerEventType = typeof wildcardScannerEventType;
export type WildcardScannerEventMessage<BaseMessage> = {
    [K in ScannerEventType]: BaseMessage & (K extends keyof ScannerEventMessages ? IfAny<ScannerEventMessages[K], {}, ScannerEventMessages[K]> : {}) & {
        scannerEventType: K;
        scanner: ScannerLike;
    };
}[ScannerEventType];
interface BaseScannerManagerEventMessages {
    scanner: {
        scanner: ScannerLike;
    };
    scanners: {
        scanners: ScannerLike[];
    };
    discoveredDevices: {
        discoveredDevices: DiscoveredDevicesMap;
    };
    [wildcardScannerEventType]: WildcardScannerEventMessage<BaseScannerManagerScannerEventMessage>;
}
export declare const ScannerManagerEventTypes: readonly [...("scannerDiscoveredDevice" | "scannerExpiredDiscoveredDevice" | "scannerDiscoveredDevices" | "scannerIsScanningAvailable" | "scannerIsScanning" | "scannerScanning" | "scannerNotScanning" | "scannerScanningAvailable" | "scannerScanningNotAvailable")[], "scanner", "scanners", "discoveredDevices", "scanner*"];
export type ScannerManagerEventType = (typeof ScannerManagerEventTypes)[number];
export type ScannerManagerEventMessages = ScannerManagerScannerEventMessages & BaseScannerManagerEventMessages;
export type ScannerManagerEventDisptcherTypes = EventDispatcherTypes<DiscoveredDeviceManager, ScannerManagerEventType, ScannerManagerEventMessages>;
export type ScannerManagerEvent = ScannerManagerEventDisptcherTypes["Event"];
export type ScannerManagerEventMap = ScannerManagerEventDisptcherTypes["EventMap"];
export type ScannerManagerEventListenerMap = ScannerManagerEventDisptcherTypes["EventListenerMap"];
export type ScannerManagerEventDispatcher = ScannerManagerEventDisptcherTypes["EventDispatcher"];
export type BoundScannerManagerEventListeners = ScannerManagerEventDisptcherTypes["BoundEventListeners"];
declare class DiscoveredDeviceManager {
    #private;
    static readonly shared: DiscoveredDeviceManager;
    constructor();
    get scanners(): ScannerLike[];
    get discoveredDevices(): DiscoveredDevicesMap;
    get addEventListener(): <T extends "scanner*" | "scanner" | "discoveredDevices" | "scannerDiscoveredDevice" | "scannerExpiredDiscoveredDevice" | "scannerDiscoveredDevices" | "scannerIsScanningAvailable" | "scannerIsScanning" | "scannerScanning" | "scannerNotScanning" | "scannerScanningAvailable" | "scannerScanningNotAvailable" | "scanners" | "*">(type: T, listener: (event: import("../utils/EventDispatcher.ts").ListenerEvent<DiscoveredDeviceManager, "scanner*" | "scanner" | "discoveredDevices" | "scannerDiscoveredDevice" | "scannerExpiredDiscoveredDevice" | "scannerDiscoveredDevices" | "scannerIsScanningAvailable" | "scannerIsScanning" | "scannerScanning" | "scannerNotScanning" | "scannerScanningAvailable" | "scannerScanningNotAvailable" | "scanners", ScannerManagerEventMessages, T>) => void, options?: import("../utils/EventDispatcher.ts").EventDispatcherOptions) => void;
    get removeEventListener(): <T extends "scanner*" | "scanner" | "discoveredDevices" | "scannerDiscoveredDevice" | "scannerExpiredDiscoveredDevice" | "scannerDiscoveredDevices" | "scannerIsScanningAvailable" | "scannerIsScanning" | "scannerScanning" | "scannerNotScanning" | "scannerScanningAvailable" | "scannerScanningNotAvailable" | "scanners" | "*">(type: T, listener: (event: import("../utils/EventDispatcher.ts").ListenerEvent<DiscoveredDeviceManager, "scanner*" | "scanner" | "discoveredDevices" | "scannerDiscoveredDevice" | "scannerExpiredDiscoveredDevice" | "scannerDiscoveredDevices" | "scannerIsScanningAvailable" | "scannerIsScanning" | "scannerScanning" | "scannerNotScanning" | "scannerScanningAvailable" | "scannerScanningNotAvailable" | "scanners", ScannerManagerEventMessages, T>) => void) => void;
    get removeEventListeners(): <T extends "scanner*" | "scanner" | "discoveredDevices" | "scannerDiscoveredDevice" | "scannerExpiredDiscoveredDevice" | "scannerDiscoveredDevices" | "scannerIsScanningAvailable" | "scannerIsScanning" | "scannerScanning" | "scannerNotScanning" | "scannerScanningAvailable" | "scannerScanningNotAvailable" | "scanners" | "*">(type: T) => void;
}
declare const _default: DiscoveredDeviceManager;
export default _default;
