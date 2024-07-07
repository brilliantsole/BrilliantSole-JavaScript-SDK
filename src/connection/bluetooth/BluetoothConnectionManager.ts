import { createConsole } from "../../utils/Console";
import BaseConnectionManager from "../BaseConnectionManager";

const _console = createConsole("BluetoothConnectionManager", { log: true });

type BluetoothCharacteristicName = import("./bluetoothUUIDs").BluetoothCharacteristicName;
type BluetoothServiceName = import("./bluetoothUUIDs").BluetoothServiceName;

type ConnectionMessageType = import("../BaseConnectionManager").ConnectionMessageType;
type ConnectionType = import("../BaseConnectionManager").ConnectionType;
type TxRxMessageType = import("../BaseConnectionManager").TxRxMessageType;
type ConnectionStatus = import("../BaseConnectionManager").ConnectionStatus;

class BluetoothConnectionManager extends BaseConnectionManager {
  isInRange = true;

  protected onCharacteristicValueChanged(characteristicName: BluetoothCharacteristicName, dataView: DataView) {
    if (characteristicName == "rx") {
      this.parseRxMessage(dataView);
    } else {
      this.onMessageReceived?.(characteristicName, dataView);
    }
  }

  protected async writeCharacteristic(characteristicName: BluetoothCharacteristicName, data: ArrayBuffer) {
    _console.log("writeCharacteristic", ...arguments);
  }

  async sendSmpMessage(data: ArrayBuffer) {
    super.sendSmpMessage(data);
    await this.writeCharacteristic("smp", data);
  }

  async sendTxData(data: ArrayBuffer) {
    super.sendTxData(data);
    await this.writeCharacteristic("tx", data);
  }
}

export default BluetoothConnectionManager;
