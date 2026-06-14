import BaseConnectionManager, { ConnectionType } from "../BaseConnectionManager.ts";
import * as dgram from "dgram";
export declare const UDPSendPort = 3000;
export declare const UDPPingInterval = 2000;
declare class UDPConnectionManager extends BaseConnectionManager {
    #private;
    get bluetoothId(): string;
    defaultMtu: number;
    constructor(ipAddress: string, bluetoothId?: string, receivePort?: number);
    get isAvailable(): boolean;
    static get isSupported(): boolean;
    static get type(): ConnectionType;
    get ipAddress(): string;
    set ipAddress(newIpAddress: string);
    get receivePort(): number | undefined;
    set receivePort(newReceivePort: number | undefined);
    get socket(): dgram.Socket | undefined;
    set socket(newSocket: dgram.Socket | undefined);
    sendSmpMessage(data: ArrayBuffer): Promise<void>;
    sendTxData(data: ArrayBuffer): Promise<void>;
    connect(): Promise<boolean>;
    disconnect(): Promise<boolean>;
    get canReconnect(): boolean;
    reconnect(): Promise<boolean>;
    clear(): void;
    remove(): void;
}
export default UDPConnectionManager;
