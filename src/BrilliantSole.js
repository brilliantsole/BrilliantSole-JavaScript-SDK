import ConnectionManager from "./connection/ConnectionManager.js";
import WebBluetoothConnectionManager from "./connection/bluetooth/WebBluetoothConnectionManager.js";
import EventDispatcher, { bindEventListeners } from "./utils/EventDispatcher.js";
import { createConsole, setAllConsoleLevelFlags, setConsoleLevelFlagsForType } from "./utils/Console.js";

/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherListener} EventDispatcherListener */
/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherOptions} EventDispatcherOptions */
/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherEvent} EventDispatcherEvent */

/** @typedef {import("./connection/ConnectionManager.js").BrilliantSoleConnectionManagerEventType} BrilliantSoleConnectionManagerEventType */
/** @typedef {BrilliantSoleConnectionManagerEventType} BrilliantSoleEventType */

/**
 * @typedef BrilliantSoleEvent
 * @type {object}
 * @property {BrilliantSoleEventType} type
 */

const _console = createConsole("BrilliantSole");

class BrilliantSole {
    constructor() {
        bindEventListeners(ConnectionManager.EventTypes, this.#boundConnectionManagerEventListeners, this);
        this.connectionManager = new WebBluetoothConnectionManager();
    }

    /** @type {BrilliantSoleEventType[]} */
    static #EventTypes = [...ConnectionManager.EventTypes];
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
        _console.assertWithWarning(
            this.connectionManager != newConnectionManager,
            "same connectionManager is already assigned"
        );
        _console.log("assigning new connectionManager...", newConnectionManager);

        this.connectionManager?.eventTypes.forEach((eventType) => {
            connectionManager.removeEventListener(eventType, this.#boundConnectionManagerEventListeners[eventType]);
        });
        newConnectionManager?.eventTypes.forEach((eventType) => {
            newConnectionManager.addEventListener(eventType, this.#boundConnectionManagerEventListeners[eventType]);
        });

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

    /** @private */
    _onConnecting() {
        _console.log(this);
        _console.log("connecting");
        this.#dispatchEvent({ type: "connecting" });
    }
    /** @private */
    _onConnected() {
        _console.log("connected");
        this.#dispatchEvent({ type: "connected" });
    }
    /** @private */
    _onDisconnecting() {
        _console.log("disconnecting");
        this.#dispatchEvent({ type: "disconnecting" });
    }
    /** @private */
    _onDisconnected() {
        _console.log("disconnected");
        this.#dispatchEvent({ type: "disconnected" });
    }
    /** @private */
    _onConnectionChanged() {
        _console.log("connection changed");
        this.#dispatchEvent({ type: "connection changed" });
    }
}

BrilliantSole.setConsoleLevelFlagsForType = setConsoleLevelFlagsForType;
BrilliantSole.setAllConsoleLevelFlags = setAllConsoleLevelFlags;

export default BrilliantSole;
