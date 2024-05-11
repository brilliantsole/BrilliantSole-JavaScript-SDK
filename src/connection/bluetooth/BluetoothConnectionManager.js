import { createConsole } from "../../utils/Console.js";
import BaseConnectionManager from "../BaseConnectionManager.js";

const _console = createConsole("BluetoothConnectionManager", { log: true });

/** @typedef {import("./bluetoothUUIDs.js").BluetoothCharacteristicName} BluetoothCharacteristicName */
/** @typedef {import("./bluetoothUUIDs.js").BluetoothServiceName} BluetoothServiceName */

/** @typedef {import("../BaseConnectionManager.js").ConnectionMessageType} ConnectionMessageType */
/** @typedef {import("../BaseConnectionManager.js").ConnectionType} ConnectionType */
/** @typedef {import("../BaseConnectionManager.js").TxRxMessageType} TxRxMessageType */
/** @typedef {import("../BaseConnectionManager.js").ConnectionStatus} ConnectionStatus */

class BluetoothConnectionManager extends BaseConnectionManager {
    /**
     * @protected
     * @param {BluetoothCharacteristicName} characteristicName
     * @param {DataView} dataView
     */
    onCharacteristicValueChanged(characteristicName, dataView) {
        if (characteristicName == "rx") {
            this.parseRxMessage(dataView);
        } else {
            this.onMessageReceived?.(characteristicName, dataView);
        }
    }

    /**
     * @protected
     * @param {BluetoothCharacteristicName} characteristicName
     * @param {ArrayBuffer} data
     */
    async writeCharacteristic(characteristicName, data) {
        console.log("writeCharacteristic", ...arguments);
    }

    /** @param {ArrayBuffer} data */
    async sendSmpMessage(data) {
        super.sendSmpMessage(...arguments);
        return this.writeCharacteristic("smp", data);
    }

    /** @param {ArrayBuffer} data */
    async sendTxData(data) {
        super.sendTxData(...arguments);
        return this.writeCharacteristic("tx", data);
    }
}

export default BluetoothConnectionManager;
