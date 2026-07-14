import BaseScanner from "./BaseScanner.ts";
import Device from "../Device.ts";
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
    get devices(): {
        [bluetoothId: string]: Device;
    };
    connectToDevice(deviceId: string, connectionType?: ClientConnectionType): Promise<void>;
    disconnectFromDevice(deviceId: string): Promise<void>;
}
export default NobleScanner;
