import ConnectionManager from "./connection/ConnectionManager.js";
import WebBluetoothConnectionManager from "./connection/bluetooth/WebBluetoothConnectionManager.js";
import EventDispatcher, {
    bindEventListeners,
    addEventListeners,
    removeEventListeners,
} from "./utils/EventDispatcher.js";
import { createConsole, setAllConsoleLevelFlags, setConsoleLevelFlagsForType } from "./utils/Console.js";

/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherListener} EventDispatcherListener */
/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherOptions} EventDispatcherOptions */
/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherEvent} EventDispatcherEvent */

/** @typedef {import("./connection/ConnectionManager.js").BrilliantSoleConnectionManagerEventType} BrilliantSoleConnectionManagerEventType */
/** @typedef {import("./connection/ConnectionManager.js").BrilliantSoleConnectionStatus} BrilliantSoleConnectionStatus */

/** @typedef {BrilliantSoleConnectionStatus|BrilliantSoleConnectionManagerEventType} BrilliantSoleEventType */

/**
 * @typedef BrilliantSoleEvent
 * @type {object}
 * @property {BrilliantSoleEventType} type
 * @property {object} message
 */

/**
 * @typedef BrilliantSoleDeviceInformation
 * @type {object}
 * @property {string?} manufacturerName
 * @property {string?} modelNumber
 * @property {string?} softwareRevision
 * @property {string?} hardwareRevision
 * @property {string?} firmwareRevision
 */

const _console = createConsole("BrilliantSole");

class BrilliantSole {
    constructor() {
        bindEventListeners(ConnectionManager.EventTypes, this.#boundConnectionManagerEventListeners, this);
        this.connectionManager = new WebBluetoothConnectionManager();
    }

    /** @type {BrilliantSoleEventType[]} */
    static #EventTypes = [...ConnectionManager.EventTypes, "connecting", "connected", "disconnecting", "not connected"];
    get #eventTypes() {
        return BrilliantSole.#EventTypes;
    }
    #eventDispatcher = new EventDispatcher(this.#eventTypes);

    /**
     * @param {BrilliantSoleEventType} type
     * @param {EventDispatcherListener} listener
     * @param {EventDispatcherOptions} options
     * @throws {Error}
     */
    addEventListener(type, listener, options) {
        this.#eventDispatcher.addEventListener(...arguments);
    }

    /**
     * @param {BrilliantSoleEvent} event
     * @throws {Error} if type is not valid
     */
    #dispatchEvent(event) {
        this.#eventDispatcher.dispatchEvent(event);
    }

    /**
     * @param {BrilliantSoleEventType} type
     * @param {EventDispatcherListener} listener
     * @returns {boolean}
     * @throws {Error}
     */
    removeEventListener(type, listener) {
        return this.#eventDispatcher.removeEventListener(...arguments);
    }

    /** @type {ConnectionManager?} */
    #connectionManager;
    get connectionManager() {
        return this.#connectionManager;
    }
    set connectionManager(newConnectionManager) {
        if (this.connectionManager == newConnectionManager) {
            _console.warn("same connectionManager is already assigned");
            return;
        }
        _console.log("assigning new connectionManager...", newConnectionManager);

        if (this.connectionManager) {
            removeEventListeners(this.connectionManager, this.#boundConnectionManagerEventListeners);
        }
        if (newConnectionManager) {
            addEventListeners(newConnectionManager, this.#boundConnectionManagerEventListeners);
        }

        this.#connectionManager = newConnectionManager;
    }
    /** @type {Object.<string, EventDispatcherListener} */
    #boundConnectionManagerEventListeners = {};

    async connect() {
        // TODO - set connection type?
        return this.connectionManager.connect();
    }
    get isConnected() {
        return this.connectionManager.isConnected;
    }
    get connectionType() {
        return this.connectionManager?.type;
    }
    async disconnect() {
        return this.connectionManager.disconnect();
    }

    /**
     * @private
     * @param {BrilliantSoleEvent} event
     */
    _onIsConnected(event) {
        /** @type {Boolean} */
        const isConnected = event.message.isConnected;
        if (isConnected) {
            this.#dispatchEvent({ type: "connected" });
        } else {
            this.#dispatchEvent({ type: "not connected" });
        }
        this.#dispatchEvent(event);
    }

    get connectionStatus() {
        return this.#connectionManager?.connectionStatus;
    }
    /**
     * @private
     * @param {BrilliantSoleEvent} event
     */
    _onConnectionStatus(event) {
        _console.log(`connectionStatus: "${this.connectionStatus}"`);
        this.#dispatchEvent(event);
        this.#dispatchEvent({ type: this.connectionStatus });
    }

    /** @type {BrilliantSoleDeviceInformation} */
    #deviceInformation = {};
    get deviceInformation() {
        return this.#deviceInformation;
    }

    /**
     * @private
     * @param {BrilliantSoleEvent} event
     */
    _onDeviceInformation(event) {
        /** @type {BrilliantSoleDeviceInformation} */
        const deviceInformation = event.message;
        _console.log("partial deviceInformation", deviceInformation);
        Object.assign(this.#deviceInformation, deviceInformation);
        _console.log("deviceInformation", this.#deviceInformation);
        this.#dispatchEvent({ type: "deviceInformation", message: { deviceInformation: this.deviceInformation } });
    }

    /** @type {number?} */
    #batteryLevel;
    get batteryLevel() {
        return this.#batteryLevel;
    }
    /**
     * @private
     * @param {BrilliantSoleEvent} event
     */
    _onBatteryLevel(event) {
        const { batteryLevel } = event.message;
        _console.log(`batteryLevel: ${batteryLevel}%`);
        this.#batteryLevel = batteryLevel;
        this.#dispatchEvent(event);
    }
}

BrilliantSole.setConsoleLevelFlagsForType = setConsoleLevelFlagsForType;
BrilliantSole.setAllConsoleLevelFlags = setAllConsoleLevelFlags;

export default BrilliantSole;
