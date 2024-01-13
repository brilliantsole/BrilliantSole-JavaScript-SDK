import EventDispatcher from "../utils/EventDispatcher.js";
import { createConsole } from "../utils/Console.js";

/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherListener} EventDispatcherListener */
/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherOptions} EventDispatcherOptions */

/** @typedef {"web bluetooth" | "noble"} BrilliantSoleConnectionType */
/** @typedef {"connecting" | "connected" | "disconnecting" | "disconnected" | "connection changed"} BrilliantSoleConnectionManagerEventType */

/**
 * @typedef BrilliantSoleConnectionManagerEvent
 * @type {object}
 * @property {BrilliantSoleConnectionManagerEventType} type
 */

const _console = createConsole("ConnectionManager");

class ConnectionManager {
    /** @type {BrilliantSoleConnectionManagerEventType[]} */
    static #EventTypes = ["connecting", "connected", "disconnecting", "disconnected", "connection changed"];
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
     * @throws {Error} if type is not valid
     */
    _dispatchEvent(event) {
        this.#eventDispatcher.dispatchEvent(event);
        this.#eventDispatcher.dispatchEvent({ type: "connection changed" });
    }

    /**
     * @param {BrilliantSoleConnectionManagerEventType} type
     * @param {EventDispatcherListener} listener
     * @returns {boolean}
     * @throws {Error}
     */
    removeEventListener(type, listener) {
        return this.#eventDispatcher.removeEventListener(...arguments);
    }

    /**
     * @param {string} name
     * @throws {Error}
     */
    static #staticThrowNotImplementedError(name) {
        throw new Error(`"${name}" is not implemented by "${this.name}" subclass`);
    }
    /**
     * @param {string} name
     * @throws {Error}
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

    get isConnected() {
        return false;
    }
    /** @throws {Error} if not connected */
    #assertIsConnected() {
        _console.assertWithError(this.isConnected, "device is not connected");
    }
    /** @throws {Error} if connected */
    #assertIsNotConnected() {
        _console.assertWithError(!this.isConnected, "device is already connected");
    }

    /** @throws {Error} if already connected */
    async connect() {
        this.#assertIsNotConnected();
        this._dispatchEvent({ type: "connecting" });
    }
    /** @throws {Error} if not connected */
    async disconnect() {
        this.#assertIsConnected();
        this._dispatchEvent({ type: "disconnected" });
    }
}

export default ConnectionManager;
