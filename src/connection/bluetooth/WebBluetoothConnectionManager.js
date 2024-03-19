import { createConsole } from "../../utils/Console.js";
import { isInNode, isInBrowser } from "../../utils/environment.js";
import { addEventListeners, removeEventListeners } from "../../utils/EventDispatcher.js";
import ConnectionManager from "../ConnectionManager.js";
import {
    serviceUUIDs,
    optionalServiceUUIDs,
    getServiceNameFromUUID,
    getCharacteristicNameFromUUID,
} from "./bluetoothUUIDs.js";

const _console = createConsole("WebBluetoothConnectionManager", { log: false });

/** @typedef {import("./bluetoothUUIDs.js").BluetoothCharacteristicName} BluetoothCharacteristicName */
/** @typedef {import("./bluetoothUUIDs.js").BluetoothServiceName} BluetoothServiceName */

/** @typedef {import("../ConnectionManager.js").ConnectionMessageType} ConnectionMessageType */

if (isInNode) {
    const webbluetooth = require("webbluetooth");
    const { bluetooth } = webbluetooth;
    var navigator = { bluetooth };
}
if (isInBrowser) {
    var navigator = window.navigator;
}

class WebBluetoothConnectionManager extends ConnectionManager {
    /** @type {Object.<string, EventListener} */
    #boundBluetoothCharacteristicEventListeners = {
        characteristicvaluechanged: this.#onCharacteristicvaluechanged.bind(this),
    };
    /** @type {Object.<string, EventListener} */
    #boundBluetoothDeviceEventListeners = {
        gattserverdisconnected: this.#onGattserverdisconnected.bind(this),
    };

    static get isSupported() {
        return "bluetooth" in navigator;
    }
    /** @type {import("../ConnectionManager.js").ConnectionType} */
    static get type() {
        return "webBluetooth";
    }

    /** @type {BluetoothDevice?} */
    #device;
    get device() {
        return this.#device;
    }
    set device(newDevice) {
        if (this.#device == newDevice) {
            _console.warn("tried to assign the same BluetoothDevice");
            return;
        }
        if (this.#device) {
            removeEventListeners(this.#device, this.#boundBluetoothDeviceEventListeners);
        }
        if (newDevice) {
            addEventListeners(newDevice, this.#boundBluetoothDeviceEventListeners);
        }
        this.#device = newDevice;
    }

    /** @type {BluetoothRemoteGATTServer?} */
    get server() {
        return this.#device?.gatt;
    }
    get isConnected() {
        return this.server?.connected;
    }

    /** @type {Map.<BluetoothServiceName, BluetoothRemoteGATTService} */
    #services = new Map();
    /** @type {Map.<BluetoothCharacteristicName, BluetoothRemoteGATTCharacteristic} */
    #characteristics = new Map();

    async connect() {
        await super.connect();

        try {
            const device = await navigator.bluetooth.requestDevice({
                filters: [{ services: serviceUUIDs }],
                optionalServices: isInBrowser ? optionalServiceUUIDs : [],
            });

            _console.log("got BluetoothDevice");
            this.device = device;

            _console.log("connecting to device...");
            const server = await this.device.gatt.connect();
            _console.log(`connected to device? ${server.connected}`);

            await this.#getServicesAndCharacteristics();

            _console.log("fully connected");

            this.status = "connected";
        } catch (error) {
            _console.error(error);
            this.status = "not connected";
            this.server?.disconnect();
            this.#removeEventListeners();
        }
    }
    async #getServicesAndCharacteristics() {
        this.#removeEventListeners();

        _console.log("getting services...");
        const services = await this.server.getPrimaryServices();
        _console.log("got services", services.length);

        _console.log("getting characteristics...");
        for (const serviceIndex in services) {
            const service = services[serviceIndex];
            const serviceName = getServiceNameFromUUID(service.uuid);
            _console.assertWithError(serviceName, `no name found for service uuid "${service.uuid}"`);
            _console.log(`got "${serviceName}" service`);
            if (serviceName == "dfu") {
                _console.log("skipping dfu service");
                continue;
            }
            service._name = serviceName;
            this.#services.set(serviceName, service);
            _console.log(`getting characteristics for "${serviceName}" service`);
            const characteristics = await service.getCharacteristics();
            _console.log(`got characteristics for "${serviceName}" service`);
            for (const characteristicIndex in characteristics) {
                const characteristic = characteristics[characteristicIndex];
                const characteristicName = getCharacteristicNameFromUUID(characteristic.uuid);
                _console.assertWithError(
                    characteristicName,
                    `no name found for characteristic uuid "${characteristic.uuid}" in "${serviceName}" service`
                );
                _console.log(`got "${characteristicName}" characteristic in "${serviceName}" service`);
                characteristic._name = characteristicName;
                this.#characteristics.set(characteristicName, characteristic);
                addEventListeners(characteristic, this.#boundBluetoothCharacteristicEventListeners);
                if (characteristic.properties.read) {
                    _console.log(`reading "${characteristicName}" characteristic...`);
                    await characteristic.readValue();
                }
                if (characteristic.properties.notify) {
                    _console.log(`starting notifications for "${characteristicName}" characteristic`);
                    await characteristic.startNotifications();
                }
            }
        }
    }
    #removeEventListeners() {
        if (this.device) {
            removeEventListeners(this.device, this.#boundBluetoothDeviceEventListeners);
        }
        this.#characteristics.forEach((characteristic) => {
            removeEventListeners(characteristic, this.#boundBluetoothCharacteristicEventListeners);
        });
    }
    async disconnect() {
        await super.disconnect();
        _console.log("disconnecting from device...");
        this.server?.disconnect();
        this.#removeEventListeners();
        this.status = "not connected";
    }

    /** @param {Event} event */
    #onCharacteristicvaluechanged(event) {
        _console.log("oncharacteristicvaluechanged");

        /** @type {BluetoothRemoteGATTCharacteristic} */
        const characteristic = event.target;
        /** @type {BluetoothCharacteristicName} */
        const characteristicName = characteristic._name;
        _console.assertWithError(
            characteristicName,
            `no name found for characteristic with uuid "${characteristic.uuid}"`
        );

        _console.log(`oncharacteristicvaluechanged for "${characteristicName}" characteristic`);
        const dataView = characteristic.value;
        _console.assertWithError(dataView, `no data found for "${characteristicName}" characteristic`);
        _console.log(`data for "${characteristicName}" characteristic`, Array.from(new Uint8Array(dataView.buffer)));

        switch (characteristicName) {
            case "manufacturerName":
                this.onMessageReceived("manufacturerName", dataView);
                break;
            case "modelNumber":
                this.onMessageReceived("modelNumber", dataView);
                break;
            case "softwareRevision":
                this.onMessageReceived("softwareRevision", dataView);
                break;
            case "hardwareRevision":
                this.onMessageReceived("hardwareRevision", dataView);
                break;
            case "firmwareRevision":
                this.onMessageReceived("firmwareRevision", dataView);
                break;
            case "pnpId":
                this.onMessageReceived("pnpId", dataView);
                break;
            case "serialNumber":
                this.onMessageReceived("serialNumber", dataView);
                break;
            case "batteryLevel":
                this.onMessageReceived("batteryLevel", dataView);
                break;
            case "name":
                this.onMessageReceived("getName", dataView);
                break;
            case "type":
                this.onMessageReceived("getType", dataView);
                break;
            case "sensorConfiguration":
                this.onMessageReceived("getSensorConfiguration", dataView);
                break;
            case "sensorData":
                this.onMessageReceived("sensorData", dataView);
                break;
            default:
                throw new Error(`uncaught characteristicName "${characteristicName}"`);
        }
    }

    /** @param {Event} event */
    #onGattserverdisconnected(event) {
        _console.log("gattserverdisconnected");
        this.status = "not connected";
    }

    /**
     * @param {ConnectionMessageType} messageType
     * @param {DataView|ArrayBuffer} data
     */
    async sendMessage(messageType, data) {
        await super.sendMessage(...arguments);
        /** @type {BluetoothRemoteGATTCharacteristic} */
        let characteristic;
        switch (messageType) {
            case "setName":
                characteristic = this.#characteristics.get("name");
                break;
            case "setType":
                characteristic = this.#characteristics.get("type");
                break;
            case "setSensorConfiguration":
                characteristic = this.#characteristics.get("sensorConfiguration");
                break;
            case "triggerVibration":
                characteristic = this.#characteristics.get("vibration");
                break;
            default:
                throw Error(`uncaught messageType "${messageType}"`);
        }

        _console.assert(characteristic, "no characteristic found");
        await characteristic.writeValueWithResponse(data);
        if (characteristic.properties.read) {
            await characteristic.readValue();
        }
    }

    /** @type {boolean} */
    get canReconnect() {
        return this.server && !this.server.connected;
    }
    async reconnect() {
        await super.reconnect();
        _console.log("attempting to reconnect...");
        await this.server.connect();
        if (this.isConnected) {
            _console.log("successfully reconnected!");
            await this.#getServicesAndCharacteristics();
            this.status = "connected";
        } else {
            _console.log("unable to reconnect");
            this.status = "not connected";
        }
    }
}

export default WebBluetoothConnectionManager;
