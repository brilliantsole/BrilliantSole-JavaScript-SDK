import EventDispatcher, { addEventListeners } from "../utils/EventDispatcher.js";
import { createConsole } from "../utils/Console.js";
import Timer from "../utils/Timer.js";

const _console = createConsole("BaseScanner");

/** @typedef {import("../Device.js").DeviceType} DeviceType */

/** @typedef {"isAvailable" | "isScanning" | "discoveredPeripheral" | "expiredDiscoveredPeripheral"} ScannerEventType */

/** @typedef {import("../utils/EventDispatcher.js").EventDispatcherListener} EventDispatcherListener */
/** @typedef {import("../utils/EventDispatcher.js").EventDispatcherOptions} EventDispatcherOptions */

/**
 * @typedef ScannerEvent
 * @type {Object}
 * @property {BaseScanner} target
 * @property {ScannerEventType} type
 * @property {Object} message
 */

/**
 * @typedef DiscoveredPeripheral
 * @type {Object}
 * @property {string} id
 * @property {string} name
 * @property {DeviceType} deviceType
 * @property {number} rssi
 */

class BaseScanner {
    // IS SUPPORTED

    static get isSupported() {
        return false;
    }
    /** @type {boolean} */
    get isSupported() {
        return this.constructor.isSupported;
    }

    #assertIsSupported() {
        _console.assertWithError(this.isSupported, `${this.constructor.name} is not supported`);
    }

    // CONSTRUCTOR

    #assertIsSubclass() {
        _console.assertWithError(this.constructor != BaseScanner, `${this.constructor.name} must be subclassed`);
    }

    constructor() {
        this.#assertIsSubclass();
        this.#assertIsSupported();
        addEventListeners(this, this.#boundEventListeners);
    }

    #boundEventListeners = {
        discoveredPeripheral: this.#onDiscoveredPeripheral.bind(this),
        isScanning: this.#onIsScanning.bind(this),
    };

    // EVENT DISPATCHER

    /** @type {ScannerEventType[]} */
    static #EventTypes = ["isAvailable", "isScanning", "discoveredPeripheral", "expiredDiscoveredPeripheral"];
    static get EventTypes() {
        return this.#EventTypes;
    }
    get eventTypes() {
        return BaseScanner.#EventTypes;
    }
    #eventDispatcher = new EventDispatcher(this.eventTypes);

    /**
     * @param {ScannerEventType} type
     * @param {EventDispatcherListener} listener
     * @param {EventDispatcherOptions} options
     */
    addEventListener(type, listener, options) {
        this.#eventDispatcher.addEventListener(type, listener, options);
    }

    /**
     * @protected
     * @param {ScannerEvent} event
     */
    dispatchEvent(event) {
        this.#eventDispatcher.dispatchEvent(event);
    }

    /**
     * @param {ScannerEventType} type
     * @param {EventDispatcherListener} listener
     */
    removeEventListener(type, listener) {
        return this.#eventDispatcher.removeEventListener(type, listener);
    }

    // AVAILABILITY
    get isAvailable() {
        return false;
    }
    #assertIsAvailable() {
        _console.assertWithError(this.isAvailable, "not available");
    }

    // SCANNING
    get isScanning() {
        return false;
    }
    #assertIsScanning() {
        _console.assertWithError(this.isScanning, "not scanning");
    }
    #assertIsNotScanning() {
        _console.assertWithError(!this.isScanning, "already scanning");
    }

    startScan() {
        this.#assertIsAvailable();
        this.#assertIsNotScanning();
    }
    stopScan() {
        this.#assertIsScanning();
    }
    #onIsScanning() {
        if (this.isScanning) {
            this.#discoveredPeripherals = {};
            this.#discoveredPeripheralTimestamps = {};
        } else {
            this.#checkDiscoveredPeripheralsExpirationTimer.stop();
        }
    }

    // DISCOVERED PERIPHERALS
    /** @type {Object.<string, DiscoveredPeripheral>} */
    #discoveredPeripherals = {};
    get discoveredPeripherals() {
        return this.#discoveredPeripherals;
    }
    get discoveredPeripheralsArray() {
        return Object.values(this.#discoveredPeripherals).sort((a, b) => {
            return this.#discoveredPeripheralTimestamps[a.id] - this.#discoveredPeripheralTimestamps[b.id];
        });
    }
    /** @param {string} discoveredPeripheralId */
    #assertValidDiscoveredPeripheralId(discoveredPeripheralId) {
        _console.assertWithError(
            this.#discoveredPeripherals[discoveredPeripheralId],
            `no discovered peripheral with id "${discoveredPeripheralId}"`
        );
    }

    /** @param {ScannerEvent} event */
    #onDiscoveredPeripheral(event) {
        /** @type {DiscoveredPeripheral} */
        const discoveredPeripheral = event.message.discoveredPeripheral;
        this.#discoveredPeripherals[discoveredPeripheral.id] = discoveredPeripheral;
        this.#discoveredPeripheralTimestamps[discoveredPeripheral.id] = Date.now();
        this.#checkDiscoveredPeripheralsExpirationTimer.start();
    }

    /** @type {Object.<string, number>} */
    #discoveredPeripheralTimestamps = {};

    static #DiscoveredPeripheralExpirationTimeout = 5000;
    static get DiscoveredPeripheralExpirationTimeout() {
        return this.#DiscoveredPeripheralExpirationTimeout;
    }
    get #discoveredPeripheralExpirationTimeout() {
        return BaseScanner.DiscoveredPeripheralExpirationTimeout;
    }
    #checkDiscoveredPeripheralsExpirationTimer = new Timer(this.#checkDiscoveredPeripheralsExpiration.bind(this), 1000);
    #checkDiscoveredPeripheralsExpiration() {
        const entries = Object.entries(this.#discoveredPeripherals);
        if (entries.length == 0) {
            this.#checkDiscoveredPeripheralsExpirationTimer.stop();
            return;
        }
        const now = Date.now();
        entries.forEach(([id, discoveredPeripheral]) => {
            const timestamp = this.#discoveredPeripheralTimestamps[id];
            console.log(now - timestamp);
            if (now - timestamp > this.#discoveredPeripheralExpirationTimeout) {
                _console.log("discovered peripheral timeout");
                delete this.#discoveredPeripherals[id];
                delete this.#discoveredPeripheralTimestamps[id];
                this.dispatchEvent({ type: "expiredDiscoveredPeripheral", message: { discoveredPeripheral } });
            }
        });
    }

    // PERIPHERAL CONNECTION
    /** @param {string} peripheralId */
    connectToPeripheral(peripheralId) {
        this.#assertIsAvailable();
    }
    /** @param {string} peripheralId */
    disconnectFromPeripheral(peripheralId) {
        this.#assertIsAvailable();
    }

    // MISC

    reset() {
        _console.log("resetting...");
    }
}

export default BaseScanner;
