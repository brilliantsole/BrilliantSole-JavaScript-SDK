import BluetoothConnectionManager from "./BluetoothConnectionManager";
import { BluetoothCharacteristicName } from "./bluetoothUUIDs";
import { ConnectionType } from "../BaseConnectionManager";
declare class WebBluetoothConnectionManager extends BluetoothConnectionManager {
    #private;
    get bluetoothId(): string;
    static get isSupported(): boolean;
    static get type(): ConnectionType;
    get device(): BluetoothDevice | undefined;
    set device(newDevice: BluetoothDevice | undefined);
    get server(): BluetoothRemoteGATTServer | undefined;
    get isConnected(): boolean;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    writeCharacteristic(characteristicName: BluetoothCharacteristicName, data: ArrayBuffer): Promise<void>;
    get canReconnect(): boolean;
    reconnect(): Promise<void>;
}
export default WebBluetoothConnectionManager;
