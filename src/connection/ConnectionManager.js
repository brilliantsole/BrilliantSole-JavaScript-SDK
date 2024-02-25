import EventDispatcher from "../utils/EventDispatcher.js";
import { createConsole } from "../utils/Console.js";

/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherListener} EventDispatcherListener */
/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherOptions} EventDispatcherOptions */

/** @typedef {"web bluetooth" | "noble"} BrilliantSoleConnectionType */
/** @typedef {"not connected" | "connecting" | "connected" | "disconnecting"} BrilliantSoleConnectionStatus */
/** @typedef {"connectionStatus" | "isConnected" | "deviceInformation" | "batteryLevel" | "name" | "type" | "sensorConfiguration" | "sensorData"} BrilliantSoleConnectionManagerEventType */

/**
 * @typedef BrilliantSoleConnectionManagerEvent
 * @type {object}
 * @property {BrilliantSoleConnectionManagerEventType} type
 * @property {object} message
 */

const _console = createConsole("ConnectionManager");

class ConnectionManager {
    /** @type {BrilliantSoleConnectionManagerEventType[]} */
    static #EventTypes = [
        "isConnected",
        "connectionStatus",
        "deviceInformation",
        "batteryLevel",
        "name",
        "type",
        "sensorConfiguration",
        "sensorData",
    ];
    static get EventTypes() {
        return this.#EventTypes;
    }
    get eventTypes() {
        return ConnectionManager.#EventTypes;
    }
    #eventDispatcher = new EventDispatcher(this.eventTypes);

    /**
     * @param {BrilliantSoleConnectionManagerEventType} type
     * @param {EventDispatcherListener} listener
     * @param {EventDispatcherOptions?} options
     * @throws {Error}
     */
    addEventListener(type, listener, options) {
        return this.#eventDispatcher.addEventListener(...arguments);
    }

    /**
     * @protected
     * @param {BrilliantSoleConnectionManagerEvent} event
     */
    _dispatchEvent(event) {
        this.#eventDispatcher.dispatchEvent(event);
    }

    /**
     * @param {BrilliantSoleConnectionManagerEventType} type
     * @param {EventDispatcherListener} listener
     * @returns {boolean}
     */
    removeEventListener(type, listener) {
        return this.#eventDispatcher.removeEventListener(...arguments);
    }

    /**
     * @param {string} name
     */
    static #staticThrowNotImplementedError(name) {
        throw new Error(`"${name}" is not implemented by "${this.name}" subclass`);
    }
    /**
     * @param {string} name
     */
    #throwNotImplementedError(name) {
        throw new Error(`"${name}" is not implemented by "${this.constructor.name}" subclass`);
    }

    static get isSupported() {
        return false;
    }
    /** @type {boolean} */
    get isSupported() {
        return this.constructor.isSupported;
    }

    /** @type {BrilliantSoleConnectionType} */
    static get type() {
        this.#staticThrowNotImplementedError("type");
    }
    /** @type {BrilliantSoleConnectionType} */
    get type() {
        return this.constructor.type;
    }

    /** @throws {Error} if not supported */
    #assertIsSupported() {
        _console.assertWithError(this.isSupported, `${this.constructor.name} is not supported`);
    }

    /** @throws {Error} if abstract class */
    #assertIsSubclass() {
        _console.assertWithError(this.constructor != ConnectionManager, `${this.constructor.name} must be subclassed`);
    }

    constructor() {
        this.#assertIsSubclass();
        this.#assertIsSupported();
    }

    /** @type {BrilliantSoleConnectionStatus} */
    #connectionStatus = "not connected";
    get connectionStatus() {
        return this.#connectionStatus;
    }
    /** @protected */
    set connectionStatus(newConnectionStatus) {
        if (this.#connectionStatus == newConnectionStatus) {
            _console.warn("same connection status");
            return;
        }
        _console.log(`new connection status "${newConnectionStatus}"`);
        this.#connectionStatus = newConnectionStatus;
        this._dispatchEvent({ type: "connectionStatus", message: { connectionStatus: this.connectionStatus } });
        if (this.#connectionStatus == "connected" || this.#connectionStatus == "not connected") {
            this._dispatchEvent({ type: "isConnected", message: { isConnected: this.isConnected } });
        }
    }

    get isConnected() {
        return this.connectionStatus == "connected";
    }

    /** @throws {Error} if connected */
    #assertIsNotConnected() {
        _console.assertWithError(!this.isConnected, "device is already connected");
    }
    /** @throws {Error} if connecting */
    #assertIsNotConnecting() {
        _console.assertWithError(this.connectionStatus != "connecting", "device is already connecting");
    }
    /** @throws {Error} if not connected */
    #assertIsConnected() {
        _console.assertWithError(this.isConnected, "device is not connected");
    }
    /** @throws {Error} if disconnecting */
    #assertIsNotDisconnecting() {
        _console.assertWithError(this.connectionStatus != "disconnecting", "device is already disconnecting");
    }
    /** @throws {Error} if not connected or is disconnecting */
    #assertIsConnectedAndNotDisconnecting() {
        this.#assertIsConnected();
        this.#assertIsNotDisconnecting();
    }

    async connect() {
        this.#assertIsNotConnected();
        this.#assertIsNotConnecting();
        this.connectionStatus = "connecting";
    }
    /** @type {boolean} */
    get canReconnect() {
        return false;
    }
    async reconnect() {
        this.#assertIsNotConnected();
        this.#assertIsNotConnecting();
        _console.assert(this.canReconnect, "unable to reconnect");
        this.connectionStatus = "connecting";
    }
    async disconnect() {
        this.#assertIsConnected();
        this.#assertIsNotDisconnecting();
        this.connectionStatus = "disconnecting";
    }

    /** @param {any} message */
    async sendMessage(message) {
        this.#assertIsConnectedAndNotDisconnecting();
    }
}

export default ConnectionManager;
