import { createConsole } from "../../utils/Console.ts";
import BaseConnectionManager from "../BaseConnectionManager.ts";

const _console = createConsole("BluetoothConnectionManager", { log: false });

import { BluetoothCharacteristicName } from "./bluetoothUUIDs.ts";

abstract class BluetoothConnectionManager extends BaseConnectionManager {
  get isAvailable() {
    // no way to tell if the user has turned bluetooth on or off
    return true;
  }

  isInRange = true;

  protected onCharacteristicValueChanged(
    characteristicName: BluetoothCharacteristicName,
    dataView: DataView
  ) {
    if (characteristicName == "rx") {
      this.parseRxMessage(dataView);
    } else {
      this.onMessageReceived?.(characteristicName, dataView);
    }
  }

  protected async writeCharacteristic(
    characteristicName: BluetoothCharacteristicName,
    data: ArrayBuffer
  ) {
    _console.log("writeCharacteristic", ...arguments);
  }

  async sendSmpMessage(data: ArrayBuffer) {
    super.sendSmpMessage(data);
    await this.writeCharacteristic("smp", data);
  }

  async sendTxData(data: ArrayBuffer) {
    super.sendTxData(data);
    if (data.byteLength == 0) {
      return;
    }
    await this.writeCharacteristic("tx", data);
  }
}

export default BluetoothConnectionManager;
