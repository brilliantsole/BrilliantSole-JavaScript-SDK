import BaseScanner from "./BaseScanner.ts";
import { ClientConnectionType } from "../connection/BaseConnectionManager.ts";
/** NODE_END */
export declare const NobleStates: readonly ["unknown", "resetting", "unsupported", "unauthorized", "poweredOff", "poweredOn"];
export type NobleState = (typeof NobleStates)[number];
declare class NobleScanner extends BaseScanner {
    #private;
    static get isSupported(): boolean;
    get isScanning(): boolean;
    constructor();
    get isScanningAvailable(): boolean;
    startScan(): boolean;
    stopScan(): boolean;
    get canReset(): boolean;
    reset(): void;
    connectToDevice(deviceId: string, connectionType?: ClientConnectionType): Promise<void>;
}
export default NobleScanner;
