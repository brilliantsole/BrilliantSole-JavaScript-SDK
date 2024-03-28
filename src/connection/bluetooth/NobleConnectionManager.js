import { dataToArrayBuffer } from "../../utils/ArrayBufferUtils.js";
import { createConsole } from "../../utils/Console.js";
import { isInNode } from "../../utils/environment.js";
import { addEventListeners, removeEventListeners } from "../../utils/EventDispatcher.js";
import ConnectionManager from "../ConnectionManager.js";
import {
    allServiceUUIDs,
    serviceUUIDs,
    optionalServiceUUIDs,
    getServiceNameFromUUID,
    getCharacteristicNameFromUUID,
    allCharacteristicUUIDs,
    characteristicUUIDs,
    allCharacteristicNames,
} from "./bluetoothUUIDs.js";

const _console = createConsole("NobleConnectionManager", { log: true });

if (isInNode) {
    var noble = require("@abandonware/noble");
}

/** @typedef {import("./bluetoothUUIDs.js").BluetoothCharacteristicName} BluetoothCharacteristicName */
/** @typedef {import("./bluetoothUUIDs.js").BluetoothServiceName} BluetoothServiceName */

/** @typedef {import("../ConnectionManager.js").ConnectionMessageType} ConnectionMessageType */

class NobleConnectionManager extends ConnectionManager {
    get id() {
        return this.#nobleDevice?.id;
    }

    static get isSupported() {
        return isInNode;
    }
    /** @type {import("../ConnectionManager.js").ConnectionType} */
    static get type() {
        return "noble";
    }

    get isConnected() {
        return this.#nobleDevice?._isConnected;
    }

    async connect() {
        await super.connect();
        await this.#nobleDevice.connectAsync();
    }
    async disconnect() {
        await super.disconnect();
        _console.log("disconnecting from device...");
        await this.#nobleDevice.disconnectAsync();
    }

    /**
     * @param {ConnectionMessageType} messageType
     * @param {DataView|ArrayBuffer} data
     */
    async sendMessage(messageType, data) {
        await super.sendMessage(...arguments);
        switch (messageType) {
            case "setName":
                // FILL
                break;
            case "setType":
                // FILL
                break;
            case "setSensorConfiguration":
                // FILL
                break;
            case "triggerVibration":
                // FILL
                break;
            default:
                throw Error(`uncaught messageType "${messageType}"`);
        }
    }

    /** @type {boolean} */
    get canReconnect() {
        return this.#nobleDevice.connectable;
    }
    async reconnect() {
        await super.reconnect();
        _console.log("attempting to reconnect...");
        this.connect();
    }

    // NOBLE
    /** @type {noble.Device?} */
    #nobleDevice;
    get nobleDevice() {
        return this.#nobleDevice;
    }
    set nobleDevice(newNobleDevice) {
        _console.assertTypeWithError(newNobleDevice, "object");
        if (this.nobleDevice == newNobleDevice) {
            _console.log("attempted to assign duplicate nobleDevice");
            return;
        }

        _console.log({ newNobleDevice });

        if (this.#nobleDevice) {
            removeEventListeners(this.#nobleDevice, this.#unboundNobleDeviceListeners);
            delete this.#nobleDevice._connectionManager;
        }

        if (newNobleDevice) {
            newNobleDevice._connectionManager = this;
            addEventListeners(newNobleDevice, this.#unboundNobleDeviceListeners);
        }

        this.#nobleDevice = newNobleDevice;
    }

    // NOBLE EVENTLISTENERS
    #unboundNobleDeviceListeners = {
        connect: this.#onNobleDeviceConnect,
        disconnect: this.#onNobleDeviceDisconnect,
        rssiUpdate: this.#onNobleDeviceRssiUpdate,
        servicesDiscover: this.#onNobleDeviceServicesDiscover,
    };

    async #onNobleDeviceConnect() {
        await this._connectionManager.onNobleDeviceConnect(this);
    }
    /** @param {noble.Device} nobleDevice */
    async onNobleDeviceConnect(nobleDevice) {
        _console.log("onNobleDeviceConnect", nobleDevice.id);
        nobleDevice._isConnected = true;
        await this.#nobleDevice.discoverServicesAsync(allServiceUUIDs);
    }

    async #onNobleDeviceDisconnect() {
        await this._connectionManager.onNobleDeviceConnect(this);
    }
    /** @param {noble.Device} nobleDevice */
    async onNobleDeviceDisconnect(nobleDevice) {
        _console.log("onNobleDeviceDisconnect", nobleDevice.id);

        this.#services.forEach((service) => {
            removeEventListeners(service, this.#unboundNobleServiceListeners);
        });
        this.#services.clear();

        this.#characteristics.forEach((characteristic) => {
            removeEventListeners(characteristic, this.#unboundNobleCharacteristicListeners);
        });
        this.#characteristics.clear();

        nobleDevice._isConnected = false;
        this.status = "not connected";
    }

    /** @param {number} rssi */
    async #onNobleDeviceRssiUpdate(rssi) {
        await this._connectionManager.onNobleDeviceRssiUpdate(this, rssi);
    }
    /**
     * @param {noble.Device} nobleDevice
     * @param {number} rssi
     */
    async onNobleDeviceRssiUpdate(nobleDevice, rssi) {
        _console.log("onNobleDeviceRssiUpdate", nobleDevice.id, rssi);
        // FILL
    }

    /** @param {noble.Service[]} services */
    async #onNobleDeviceServicesDiscover(services) {
        await this._connectionManager.onNobleDeviceServicesDiscover(this, services);
    }
    /**
     * @param {noble.Device} nobleDevice
     * @param {noble.Service[]} services
     */
    async onNobleDeviceServicesDiscover(nobleDevice, services) {
        _console.log("onNobleDeviceServicesDiscover", nobleDevice.id, services);
        for (const index in services) {
            const service = services[index];
            _console.log("service", service);
            const serviceName = getServiceNameFromUUID(service.uuid);
            _console.assertWithError(serviceName, `no name found for service uuid "${service.uuid}"`);
            _console.log({ serviceName });
            this.#services.set(serviceName, service);
            service._name = serviceName;
            service._connectionManager = this;
            addEventListeners(service, this.#unboundNobleServiceListeners);
            await service.discoverCharacteristicsAsync();
        }
    }

    // NOBLE SERVICE
    /** @type {Map.<BluetoothServiceName, BluetoothRemoteGATTService} */
    #services = new Map();

    #unboundNobleServiceListeners = {
        characteristicsDiscover: this.#onNobleServiceCharacteristicsDiscover,
    };

    /** @param {noble.Characteristic[]} characteristics */
    async #onNobleServiceCharacteristicsDiscover(characteristics) {
        await this._connectionManager.onNobleServiceCharacteristicsDiscover(this, characteristics);
    }
    /**
     * @param {noble.Service} service
     * @param {noble.Characteristic[]} characteristics
     */
    async onNobleServiceCharacteristicsDiscover(service, characteristics) {
        _console.log(
            "onNobleServiceCharacteristicsDiscover",
            service.uuid,
            characteristics.map((characteristic) => characteristic.uuid)
        );

        for (const index in characteristics) {
            const characteristic = characteristics[index];
            _console.log("characteristic", characteristic);
            const characteristicName = getCharacteristicNameFromUUID(characteristic.uuid);
            _console.assertWithError(
                characteristicName,
                `no name found for characteristic uuid "${characteristic.uuid}"`
            );
            _console.log({ characteristicName });
            this.#characteristics.set(characteristicName, characteristic);
            characteristic._name = characteristicName;
            characteristic._connectionManager = this;
            addEventListeners(characteristic, this.#unboundNobleCharacteristicListeners);
            if (characteristic.properties.includes("read")) {
                await characteristic.readAsync();
            }
            if (characteristic.properties.includes("notify")) {
                await characteristic.subscribeAsync();
            }
        }

        if (this.#hasAllCharacteristics) {
            this.status = "connected";
        }
    }

    // NOBLE CHARACTERISRTIC
    #unboundNobleCharacteristicListeners = {
        data: this.#onNobleCharacteristicData,
        write: this.#onNobleCharacteristicWrite,
        notify: this.#onNobleCharacteristicNotify,
    };

    /** @type {Map.<BluetoothCharacteristicName, BluetoothRemoteGATTCharacteristic} */
    #characteristics = new Map();

    get #hasAllCharacteristics() {
        return allCharacteristicNames.every((characteristicName) => {
            return this.#characteristics.has(characteristicName);
        });
    }

    /**
     * @param {Buffer} data
     * @param {boolean} isNotification
     */
    #onNobleCharacteristicData(data, isNotification) {
        this._connectionManager.onNobleCharacteristicData(this, data, isNotification);
    }
    /**
     *
     * @param {noble.Characteristic} characteristic
     * @param {Buffer} data
     * @param {boolean} isNotification
     */
    onNobleCharacteristicData(characteristic, data, isNotification) {
        _console.log("onNobleCharacteristicData", characteristic.uuid, data, isNotification);
        const dataView = new DataView(dataToArrayBuffer(data));

        /** @type {BluetoothCharacteristicName} */
        const characteristicName = characteristic._name;
        _console.assertWithError(
            characteristicName,
            `no name found for characteristic with uuid "${characteristic.uuid}"`
        );

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

    #onNobleCharacteristicWrite() {
        _console.log("onNobleCharacteristicWrite", ...arguments);
        //this._connectionManager.onNobleCharacteristicWrite();
    }
    onNobleCharacteristicWrite() {
        //_console.log("onNobleCharacteristicWrite");
    }

    /** @param {boolean} isSubscribed */
    #onNobleCharacteristicNotify(isSubscribed) {
        this._connectionManager.onNobleCharacteristicNotify(this, isSubscribed);
    }
    /**
     * @param {noble.Characteristic} characteristic
     * @param {boolean} isSubscribed
     */
    onNobleCharacteristicNotify(characteristic, isSubscribed) {
        _console.log("onNobleCharacteristicNotify", characteristic.uuid, isSubscribed);
    }
}

export default NobleConnectionManager;
