import BaseScanner from "./BaseScanner.ts";
import Device from "../Device.ts";
declare class NullScanner extends BaseScanner {
    #private;
    static get isSupported(): boolean;
    get isScanning(): boolean;
    get isScanningAvailable(): boolean;
    get canReset(): boolean;
    get devices(): {
        [bluetoothId: string]: Device;
    };
}
export default NullScanner;
