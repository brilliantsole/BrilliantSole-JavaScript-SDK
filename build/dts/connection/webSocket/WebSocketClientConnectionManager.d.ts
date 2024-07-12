import BaseConnectionManager, { ConnectionType } from "../BaseConnectionManager";
import { ClientDeviceMessage } from "../../server/ServerUtils";
export type SendWebSocketMessageCallback = (...messages: ClientDeviceMessage[]) => void;
declare class WebSocketClientConnectionManager extends BaseConnectionManager {
    #private;
    static get isSupported(): boolean;
    static get type(): ConnectionType;
    get bluetoothId(): string;
    set bluetoothId(newBluetoothId: string);
    get isConnected(): boolean;
    set isConnected(newIsConnected: boolean);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    get canReconnect(): boolean;
    reconnect(): Promise<void>;
    sendWebSocketMessage: SendWebSocketMessageCallback;
    sendWebSocketConnectMessage: Function;
    sendWebSocketDisconnectMessage: Function;
    sendSmpMessage(data: ArrayBuffer): Promise<void>;
    sendTxData(data: ArrayBuffer): Promise<void>;
    onWebSocketMessage(dataView: DataView): void;
}
export default WebSocketClientConnectionManager;
