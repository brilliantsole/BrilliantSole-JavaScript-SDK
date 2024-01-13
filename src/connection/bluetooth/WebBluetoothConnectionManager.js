import ConnectionManager from "../ConnectionManager.js";
import bluetoothUUIDs from "./bluetoothUUIDs.js";
import { createConsole } from "../../utils/Console.js";

const _console = createConsole("WebBluetoothConnectionManager");

class WebBluetoothConnectionManager extends ConnectionManager {
    static get isSupported() {
        return "bluetooth" in navigator;
    }
    /** @type {import("../ConnectionManager.js").BrilliantSoleConnectionType} */
    static get type() {
        return "web bluetooth";
    }

    /** @type {BluetoothDevice?} */
    #device;
    get device() {
        return this.#device;
    }
    set device(newDevice) {
        if (this.#device == newDevice) {
            _console.warn("assigning the same BluetoothDevice");
            return;
        }
        this.#device?.addEventListener("");
        // FILL - remove existing eventListeners
        // FILL - assign new eventListeners
        this.#device = newDevice;
    }

    /** @type {BluetoothRemoteGATTServer?} */
    get server() {
        return this.#device?.gatt;
    }
    get isConnected() {
        return this.server?.connected;
    }

    async connect() {
        super.connect();

        const device = await navigator.bluetooth.requestDevice({
            //filters: [{ services: bluetoothUUIDs.serviceUUIDs }],
            filters: [{ namePrefix: "Brilliant" }],
            optionalServices: bluetoothUUIDs.serviceUUIDs,
        });

        _console.log("got BluetoothDevice", device);
        this.device = device;

        _console.log("connecting to device...");
        await this.device.gatt.connect();
        _console.log(`connected to device? ${this.server.connected}`);

        // FILL - services and stuff
    }
    async disconnect() {
        super.disconnect();
        _console.log("disconnecting from device...");
        this.server.disconnect();
    }
}

export default WebBluetoothConnectionManager;
