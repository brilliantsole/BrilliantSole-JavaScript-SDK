import ConnectionManager from "../ConnectionManager.js";
import { serviceUUIDs, getServiceNameFromUUID, getCharacteristicNameFromUUID } from "./bluetoothUUIDs.js";
import { createConsole } from "../../utils/Console.js";
import { bindEventListeners } from "../../utils/EventDispatcher.js";

const _console = createConsole("WebBluetoothConnectionManager", { log: false });

/** @typedef {import("./bluetoothUUIDs.js").BrilliantSoleBluetoothCharacteristicName} BrilliantSoleBluetoothCharacteristicName */
/** @typedef {import("./bluetoothUUIDs.js").BrilliantSoleBluetoothServiceName} BrilliantSoleBluetoothServiceName */

class WebBluetoothConnectionManager extends ConnectionManager {
    constructor() {
        super();
        bindEventListeners(["characteristicvaluechanged"], this.#boundBluetoothCharacteristicEventListeners, this);
    }
    /** @type {Object.<string, EventDispatcherListener} */
    #boundBluetoothCharacteristicEventListeners = {};

    static get isSupported() {
        return "bluetooth" in navigator;
    }
    /** @type {import("../ConnectionManager.js").BrilliantSoleConnectionType} */
    static get type() {
        return "web bluetooth";
    }

    /** @type {TextDecoder} */
    #textDecoder = new TextDecoder();

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

    /** @type {Map.<BrilliantSoleBluetoothServiceName, BluetoothRemoteGATTService} */
    #services = new Map();
    /** @type {Map.<BrilliantSoleBluetoothCharacteristicName, BluetoothRemoteGATTCharacteristic} */
    #characteristics = new Map();

    async connect() {
        super.connect();

        try {
            const device = await navigator.bluetooth.requestDevice({
                //filters: [{ services: serviceUUIDs }],
                filters: [{ namePrefix: "Brilliant" }],
                optionalServices: serviceUUIDs,
            });

            _console.log("got BluetoothDevice", device);
            this.device = device;

            _console.log("connecting to device...");
            const server = await this.device.gatt.connect();
            _console.log(`connected to device? ${server.connected}`);

            _console.log("getting services...");
            const services = await server.getPrimaryServices();
            _console.log("got services", services);

            _console.log("getting characteristics...");
            const servicePromises = services.map(async (service) => {
                const serviceName = getServiceNameFromUUID(service.uuid);
                _console.assertWithError(serviceName, `no name found for service uuid "${service.uuid}"`);
                _console.log(`got "${serviceName}" service`);
                service._name = serviceName;
                this.#services.set(serviceName, service);
                _console.log("getting characteristics for service", service);
                const characteristics = await service.getCharacteristics();
                _console.log("got characteristics for service", service, characteristics);
                const characteristicPromises = characteristics.map(async (characteristic) => {
                    const characteristicName = getCharacteristicNameFromUUID(characteristic.uuid);
                    _console.assertWithError(
                        characteristicName,
                        `no name found for characteristic uuid "${characteristic.uuid}" in "${serviceName}" service`
                    );
                    _console.log(`got "${characteristicName}" characteristic in "${serviceName}" service`);
                    characteristic._name = characteristicName;
                    this.#characteristics.set(characteristicName, characteristic);
                    characteristic.addEventListener(
                        "characteristicvaluechanged",
                        this.#boundBluetoothCharacteristicEventListeners["characteristicvaluechanged"]
                    );
                    if (characteristic.properties.read) {
                        await characteristic.readValue();
                    }
                    if (characteristic.properties.notify) {
                        _console.log(
                            `starting notifications for "${characteristicName}" characteristic`,
                            characteristic
                        );
                        await characteristic.startNotifications();
                    }
                });
                await Promise.all(characteristicPromises);
            });
            await Promise.all(servicePromises);
            _console.log("got all characteristics");

            this.connectionStatus = "connected";
        } catch (error) {
            _console.error(error);
            this.connectionStatus = "not connected";
        }
    }
    async disconnect() {
        super.disconnect();
        _console.log("disconnecting from device...");
        this.server.disconnect();
        this.connectionStatus = "not connected";
    }

    /**
     * @private
     * @param {Event} event
     */
    _onCharacteristicvaluechanged(event) {
        _console.log("oncharacteristicvaluechanged", event);

        /** @type {BluetoothRemoteGATTCharacteristic} */
        const characteristic = event.target;
        /** @type {BrilliantSoleBluetoothCharacteristicName} */
        const characteristicName = characteristic._name;
        _console.assertWithError(
            characteristicName,
            `no name found for characteristic with uuid "${characteristic.uuid}"`
        );

        _console.log(`oncharacteristicvaluechanged for "${characteristicName}" characteristic`, event);
        const dataView = characteristic.value;
        _console.assertWithError(dataView, `no data found for "${characteristicName}" characteristic`);
        _console.log(`data for "${characteristicName}" characteristic`, Array.from(new Uint8Array(dataView.buffer)));

        switch (characteristicName) {
            case "manufacturerName":
                const manufacturerName = this.#textDecoder.decode(dataView);
                _console.log(`manufacturerName: "${manufacturerName}"`);
                this._dispatchEvent({ type: "deviceInformation", message: { manufacturerName } });
                break;
            case "modelNumber":
                const modelNumber = this.#textDecoder.decode(dataView);
                _console.log(`modelNumber: "${modelNumber}"`);
                this._dispatchEvent({ type: "deviceInformation", message: { modelNumber } });
                break;
            case "softwareRevision":
                const softwareRevision = this.#textDecoder.decode(dataView);
                _console.log(`softwareRevision: "${softwareRevision}"`);
                this._dispatchEvent({ type: "deviceInformation", message: { softwareRevision } });
                break;
            case "hardwareRevision":
                const hardwareRevision = this.#textDecoder.decode(dataView);
                _console.log(`hardwareRevision: "${hardwareRevision}"`);
                this._dispatchEvent({ type: "deviceInformation", message: { hardwareRevision } });
                break;
            case "firmwareRevision":
                const firmwareRevision = this.#textDecoder.decode(dataView);
                _console.log(`firmwareRevision: "${firmwareRevision}"`);
                this._dispatchEvent({ type: "deviceInformation", message: { firmwareRevision } });
                break;
            case "batteryLevel":
                const batteryLevel = dataView.getUint8(0);
                _console.log(`batteryLevel: ${batteryLevel}`);
                this._dispatchEvent({ type: "batteryLevel", message: { batteryLevel } });
                break;
            case "dataNotify":
                // FILL
                break;
            default:
                throw new Error(`uncaught characteristicName "${characteristicName}"`);
        }
    }
}

export default WebBluetoothConnectionManager;
