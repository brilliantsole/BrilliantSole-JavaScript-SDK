import BaseConnectionManager, { ConnectionType } from "../BaseConnectionManager.ts";
declare class WebSocketConnectionManager extends BaseConnectionManager {
    #private;
    get bluetoothId(): string;
    defaultMtu: number;
    constructor(ipAddress: string, isSecure?: boolean, bluetoothId?: string);
    get isAvailable(): boolean;
    static get isSupported(): boolean;
    static get type(): ConnectionType;
    get webSocket(): WebSocket | undefined;
    set webSocket(newWebSocket: WebSocket | undefined);
    get ipAddress(): string;
    set ipAddress(newIpAddress: string);
    get isSecure(): boolean;
    set isSecure(newIsSecure: boolean);
    get url(): string;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    get canReconnect(): boolean;
    reconnect(): Promise<void>;
    sendSmpMessage(data: ArrayBuffer): Promise<void>;
    sendTxData(data: ArrayBuffer): Promise<void>;
    remove(): void;
}
export default WebSocketConnectionManager;
