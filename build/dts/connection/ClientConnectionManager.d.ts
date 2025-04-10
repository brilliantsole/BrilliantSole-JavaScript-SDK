import BaseConnectionManager, { ConnectionType } from "./BaseConnectionManager.ts";
import { ClientDeviceMessage } from "../server/ServerUtils.ts";
import BaseClient from "../server/BaseClient.ts";
export type SendClientMessageCallback = (...messages: ClientDeviceMessage[]) => void;
declare class ClientConnectionManager extends BaseConnectionManager {
    #private;
    static get isSupported(): boolean;
    static get type(): ConnectionType;
    get canUpdateFirmware(): boolean;
    client: BaseClient;
    get bluetoothId(): string;
    set bluetoothId(newBluetoothId: string);
    get isConnected(): boolean;
    set isConnected(newIsConnected: boolean);
    get isAvailable(): boolean;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    get canReconnect(): boolean;
    reconnect(): Promise<void>;
    sendClientMessage: SendClientMessageCallback;
    sendClientConnectMessage: Function;
    sendClientDisconnectMessage: Function;
    sendSmpMessage(data: ArrayBuffer): Promise<void>;
    sendTxData(data: ArrayBuffer): Promise<void>;
    onClientMessage(dataView: DataView): void;
}
export default ClientConnectionManager;
