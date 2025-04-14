import BaseConnectionManager, { ConnectionType } from "../BaseConnectionManager.ts";
declare class UDPConnectionManager extends BaseConnectionManager {
    get bluetoothId(): string;
    get isAvailable(): boolean;
    static get isSupported(): boolean;
    static get type(): ConnectionType;
    sendSmpMessage(data: ArrayBuffer): Promise<void>;
    sendTxData(data: ArrayBuffer): Promise<void>;
}
export default UDPConnectionManager;
