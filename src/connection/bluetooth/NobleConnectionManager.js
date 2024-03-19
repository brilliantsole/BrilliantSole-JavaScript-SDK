import { createConsole } from "../../utils/Console.js";
import { isInNode } from "../../utils/environment.js";
import { addEventListeners, removeEventListeners } from "../../utils/EventDispatcher.js";
import ConnectionManager from "../ConnectionManager.js";
import {
    serviceUUIDs,
    optionalServiceUUIDs,
    getServiceNameFromUUID,
    getCharacteristicNameFromUUID,
} from "./bluetoothUUIDs.js";

const _console = createConsole("NobleConnectionManager", { log: true });

if (isInNode) {
    var noble = require("@abandonware/noble");
}

/** @typedef {import("./bluetoothUUIDs.js").BluetoothCharacteristicName} BluetoothCharacteristicName */
/** @typedef {import("./bluetoothUUIDs.js").BluetoothServiceName} BluetoothServiceName */

/** @typedef {import("../ConnectionManager.js").ConnectionMessageType} ConnectionMessageType */

class NobleConnectionManager extends ConnectionManager {
    static get isSupported() {
        return isInNode;
    }
    /** @type {import("../ConnectionManager.js").ConnectionType} */
    static get type() {
        return "noble";
    }

    get isConnected() {
        // FILL
        return false;
    }

    async connect() {
        await super.connect();
        // FILL
    }
    async disconnect() {
        await super.disconnect();
        _console.log("disconnecting from device...");
        // FILL
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
        // FILL
        return false;
    }
    async reconnect() {
        await super.reconnect();
        _console.log("attempting to reconnect...");
        // FILL
    }

    // NOBLE
    /** @type {noble.Peripheral?} */
    #noblePeripheral;
    get noblePeripheral() {
        return this.#noblePeripheral;
    }
    set noblePeripheral(newNoblePeripheral) {
        _console.assertTypeWithError(newNoblePeripheral, "object");
        if (this.noblePeripheral == newNoblePeripheral) {
            _console.log("attempted to assign duplicate noblePeripheral");
            return;
        }

        _console.log({ newNoblePeripheral });

        if (this.#noblePeripheral) {
            removeEventListeners(this.#noblePeripheral, this.#unboundNoblePeripheralListeners);
            delete this.#noblePeripheral._device;
        }

        if (newNoblePeripheral) {
            newNoblePeripheral._device = this;
            addEventListeners(newNoblePeripheral, this.#unboundNoblePeripheralListeners);
        }

        this.#noblePeripheral = newNoblePeripheral;
    }

    // NOBLE EVENTLISTENERS
    #unboundNoblePeripheralListeners = {
        connect: this.#onNoblePeripheralConnect,
        disconnect: this.#onNoblePeripheralDisconnect,
        rssiUpdate: this.#onNoblePeripheralRssiUpdate,
        servicesDiscover: this.#onNoblePeripheralServicesDiscover,
    };

    #onNoblePeripheralConnect() {
        this._device.onNoblePeripheralConnect(this);
    }
    /** @param {noble.Peripheral} noblePeripheral */
    onNoblePeripheralConnect(noblePeripheral) {
        _console.log("onNoblePeripheralConnect", noblePeripheral);
    }

    #onNoblePeripheralDisconnect() {
        this._device.onNoblePeripheralConnect(this);
    }
    /** @param {noble.Peripheral} noblePeripheral */
    onNoblePeripheralDisconnect(noblePeripheral) {
        _console.log("onNoblePeripheralDisconnect", noblePeripheral);
        // FILL
    }

    /** @param {number} rssi */
    #onNoblePeripheralRssiUpdate(rssi) {
        this._device.onNoblePeripheralRssiUpdate(this, rssi);
        // FILL
    }
    /**
     * @param {noble.Peripheral} noblePeripheral
     * @param {number} rssi
     */
    onNoblePeripheralRssiUpdate(noblePeripheral, rssi) {
        _console.log("onNoblePeripheralRssiUpdate", noblePeripheral, rssi);
        // FILL
    }

    /** @param {noble.Service[]} services */
    #onNoblePeripheralServicesDiscover(services) {
        this._device.onNoblePeripheralServicesDiscover(this, services);
    }
    /**
     *
     * @param {noble.Peripheral} noblePeripheral
     * @param {noble.Service[]} services
     */
    onNoblePeripheralServicesDiscover(noblePeripheral, services) {
        _console.log("onNoblePeripheralServicesDiscover", noblePeripheral, services);
        // FILL
    }
}

export default NobleConnectionManager;
