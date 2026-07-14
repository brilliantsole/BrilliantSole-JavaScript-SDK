import { BluetoothCharacteristicName, BluetoothServiceName } from "./bluetoothUUIDs.ts";
import BluetoothConnectionManager from "./BluetoothConnectionManager.ts";
export interface BluetoothService extends BluetoothRemoteGATTService {
    name?: BluetoothServiceName;
}
export interface BluetoothCharacteristic extends BluetoothRemoteGATTCharacteristic {
    name?: BluetoothCharacteristicName;
}
declare class WebBluetoothConnectionManager extends BluetoothConnectionManager {
    #private;
    get bluetoothId(): string;
    get canUpdateFirmware(): boolean;
    static get isSupported(): boolean;
    static type: "webBluetooth";
    readonly type: "webBluetooth";
    get device(): BluetoothDevice | undefined;
    set device(newDevice: BluetoothDevice | undefined);
    get server(): BluetoothRemoteGATTServer | undefined;
    get isConnected(): boolean;
    connect(): Promise<boolean>;
    disconnect(): Promise<boolean>;
    writeCharacteristic(characteristicName: BluetoothCharacteristicName, data: ArrayBuffer): Promise<void>;
    get canReconnect(): boolean;
    reconnect(): Promise<boolean>;
    remove(): void;
}
export default WebBluetoothConnectionManager;
