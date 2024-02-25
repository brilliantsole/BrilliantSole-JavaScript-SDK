import { createConsole } from "../utils/Console.js";

/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherListener} EventDispatcherListener */
/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherOptions} EventDispatcherOptions */

/** @typedef {"web bluetooth" | "noble"} BrilliantSoleConnectionType */
/** @typedef {"not connected" | "connecting" | "connected" | "disconnecting"} BrilliantSoleConnectionStatus */
/** @typedef {"manufacturerName" | "modelNumber" | "softwareRevision" | "hardwareRevision" | "firmwareRevision" | "pnpId" | "batteryLevel" | "getName" | "setName" | "getType" | "setType" | "getSensorConfiguration" | "setSensorConfiguration" | "sensorData"} BrilliantSoleConnectionMessageType */

const _console = createConsole("ConnectionManager");

/**
 * @callback BrilliantSoleConnectionStatusCallback
 * @param {BrilliantSoleConnectionStatus} status
 */

/**
 * @callback BrilliantSoleMessageReceivedCallback
 * @param {BrilliantSoleConnectionMessageType} messageType
 * @param {DataView} data
 */

class ConnectionManager {
    /** @type {BrilliantSoleConnectionStatusCallback?} */
    onStatusUpdated;
    /** @type {BrilliantSoleMessageReceivedCallback?} */
    onMessageReceived;

    /** @param {string} name */
    static #staticThrowNotImplementedError(name) {
        throw new Error(`"${name}" is not implemented by "${this.name}" subclass`);
    }
    /** @param {string} name */
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
    #status = "not connected";
    get status() {
        return this.#status;
    }
    /** @protected */
    set status(newConnectionStatus) {
        _console.assertTypeWithError(newConnectionStatus, "string");
        if (this.#status == newConnectionStatus) {
            _console.warn("same connection status");
            return;
        }
        _console.log(`new connection status "${newConnectionStatus}"`);
        this.#status = newConnectionStatus;
        this.onStatusUpdated?.(this.status);
    }

    get isConnected() {
        return this.status == "connected";
    }

    /** @throws {Error} if connected */
    #assertIsNotConnected() {
        _console.assertWithError(!this.isConnected, "device is already connected");
    }
    /** @throws {Error} if connecting */
    #assertIsNotConnecting() {
        _console.assertWithError(this.status != "connecting", "device is already connecting");
    }
    /** @throws {Error} if not connected */
    #assertIsConnected() {
        _console.assertWithError(this.isConnected, "device is not connected");
    }
    /** @throws {Error} if disconnecting */
    #assertIsNotDisconnecting() {
        _console.assertWithError(this.status != "disconnecting", "device is already disconnecting");
    }
    /** @throws {Error} if not connected or is disconnecting */
    #assertIsConnectedAndNotDisconnecting() {
        this.#assertIsConnected();
        this.#assertIsNotDisconnecting();
    }

    async connect() {
        this.#assertIsNotConnected();
        this.#assertIsNotConnecting();
        this.status = "connecting";
    }
    /** @type {boolean} */
    get canReconnect() {
        return false;
    }
    async reconnect() {
        this.#assertIsNotConnected();
        this.#assertIsNotConnecting();
        _console.assert(this.canReconnect, "unable to reconnect");
        this.status = "connecting";
    }
    async disconnect() {
        this.#assertIsConnected();
        this.#assertIsNotDisconnecting();
        this.status = "disconnecting";
    }

    /** @param {any} message */
    async sendMessage(message) {
        this.#assertIsConnectedAndNotDisconnecting();
    }
}

export default ConnectionManager;
