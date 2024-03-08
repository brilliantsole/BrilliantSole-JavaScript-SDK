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
}

export default NobleConnectionManager;
