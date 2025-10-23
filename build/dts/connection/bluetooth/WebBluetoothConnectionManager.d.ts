import BluetoothConnectionManager from "./BluetoothConnectionManager.ts";
import { BluetoothCharacteristicName } from "./bluetoothUUIDs.ts";
import { ConnectionType } from "../BaseConnectionManager.ts";
/** BROWSER_END */
declare class WebBluetoothConnectionManager extends BluetoothConnectionManager {
    #private;
    get bluetoothId(): string;
    get canUpdateFirmware(): boolean;
    static get isSupported(): boolean;
    static get type(): ConnectionType;
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
