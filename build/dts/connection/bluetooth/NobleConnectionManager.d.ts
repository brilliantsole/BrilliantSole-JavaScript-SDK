import BluetoothConnectionManager from "./BluetoothConnectionManager.ts";
/** NODE_START */
import type * as noble from "@abandonware/noble";
/** NODE_END */
import { BluetoothCharacteristicName, BluetoothServiceName } from "./bluetoothUUIDs.ts";
import { ConnectionType } from "../BaseConnectionManager.ts";
import NobleScanner from "../../scanner/NobleScanner.ts";
interface HasConnectionManager {
    connectionManager: NobleConnectionManager | undefined;
}
export interface NoblePeripheral extends noble.Peripheral, HasConnectionManager {
    scanner: NobleScanner;
}
interface NobleService extends noble.Service, HasConnectionManager {
    name: BluetoothServiceName;
}
interface NobleCharacteristic extends noble.Characteristic, HasConnectionManager {
    name: BluetoothCharacteristicName;
}
declare class NobleConnectionManager extends BluetoothConnectionManager {
    #private;
    get bluetoothId(): string;
    static get isSupported(): boolean;
    static get type(): ConnectionType;
    get isConnected(): boolean;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    writeCharacteristic(characteristicName: BluetoothCharacteristicName, data: ArrayBuffer): Promise<void>;
    get canReconnect(): boolean;
    reconnect(): Promise<void>;
    get noblePeripheral(): NoblePeripheral | undefined;
    set noblePeripheral(newNoblePeripheral: NoblePeripheral);
    onNoblePeripheralConnect(noblePeripheral: NoblePeripheral): Promise<void>;
    onNoblePeripheralDisconnect(noblePeripheral: NoblePeripheral): Promise<void>;
    onNoblePeripheralRssiUpdate(noblePeripheral: NoblePeripheral, rssi: number): Promise<void>;
    onNoblePeripheralServicesDiscover(noblePeripheral: NoblePeripheral, services: NobleService[]): Promise<void>;
    onNobleServiceCharacteristicsDiscover(service: NobleService, characteristics: NobleCharacteristic[]): Promise<void>;
    onNobleCharacteristicData(characteristic: NobleCharacteristic, data: Buffer, isNotification: boolean): void;
    onNobleCharacteristicWrite(characteristic: NobleCharacteristic): void;
    onNobleCharacteristicNotify(characteristic: NobleCharacteristic, isSubscribed: boolean): void;
}
export default NobleConnectionManager;
