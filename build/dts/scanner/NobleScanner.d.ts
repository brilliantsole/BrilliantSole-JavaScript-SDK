import BaseScanner from "./BaseScanner";
export declare const NobleStates: readonly ["unknown", "resetting", "unsupported", "unauthorized", "poweredOff", "poweredOn"];
export type NobleState = (typeof NobleStates)[number];
declare class NobleScanner extends BaseScanner {
    #private;
    static get isSupported(): boolean;
    get isScanning(): boolean;
    constructor();
    get isScanningAvailable(): boolean;
    startScan(): void;
    stopScan(): void;
    get canReset(): boolean;
    reset(): void;
    connectToDevice(deviceId: string): Promise<void>;
}
export default NobleScanner;
