import BaseConnectionManager, { ConnectionType } from "../BaseConnectionManager.ts";
import * as dgram from "dgram";
export declare const UDPSendPort = 3000;
export declare const DefaultUDPReceivePort = 3002;
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
    get receivePort(): number;
    set receivePort(newReceivePort: number);
    get socket(): dgram.Socket | undefined;
    set socket(newSocket: dgram.Socket | undefined);
    sendSmpMessage(data: ArrayBuffer): Promise<void>;
    sendTxData(data: ArrayBuffer): Promise<void>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    get canReconnect(): boolean;
    reconnect(): Promise<void>;
    clear(): void;
    remove(): void;
}
export default UDPConnectionManager;
