import BaseConnectionManager from "../BaseConnectionManager";
import { BluetoothCharacteristicName } from "./bluetoothUUIDs";
declare abstract class BluetoothConnectionManager extends BaseConnectionManager {
    isInRange: boolean;
    protected onCharacteristicValueChanged(characteristicName: BluetoothCharacteristicName, dataView: DataView): void;
    protected writeCharacteristic(characteristicName: BluetoothCharacteristicName, data: ArrayBuffer): Promise<void>;
    sendSmpMessage(data: ArrayBuffer): Promise<void>;
    sendTxData(data: ArrayBuffer): Promise<void>;
}
export default BluetoothConnectionManager;