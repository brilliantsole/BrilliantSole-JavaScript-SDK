import EventDispatcher, { addEventListeners } from "../utils/EventDispatcher.js";
import { createConsole } from "../utils/Console.js";
import Timer from "../utils/Timer.js";

const _console = createConsole("BaseScanner");

/** @typedef {import("../Device.js").DeviceType} DeviceType */

/** @typedef {"isAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice"} ScannerEventType */

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
 * @typedef DiscoveredDevice
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
        discoveredDevice: this.#onDiscoveredDevice.bind(this),
        isScanning: this.#onIsScanning.bind(this),
    };

    // EVENT DISPATCHER

    /** @type {ScannerEventType[]} */
    static #EventTypes = ["isAvailable", "isScanning", "discoveredDevice", "expiredDiscoveredDevice"];
    static get EventTypes() {
        return this.#EventTypes;
    }
    get eventTypes() {
        return BaseScanner.#EventTypes;
    }
    #eventDispatcher = new EventDispatcher(this, this.eventTypes);

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
            this.#discoveredDevices = {};
            this.#discoveredDeviceTimestamps = {};
        } else {
            this.#checkDiscoveredDevicesExpirationTimer.stop();
        }
    }

    // DISCOVERED DEVICES
    /** @type {Object.<string, DiscoveredDevice>} */
    #discoveredDevices = {};
    get discoveredDevices() {
        return this.#discoveredDevices;
    }
    get discoveredDevicesArray() {
        return Object.values(this.#discoveredDevices).sort((a, b) => {
            return this.#discoveredDeviceTimestamps[a.id] - this.#discoveredDeviceTimestamps[b.id];
        });
    }
    /** @param {string} discoveredDeviceId */
    #assertValidDiscoveredDeviceId(discoveredDeviceId) {
        _console.assertWithError(
            this.#discoveredDevices[discoveredDeviceId],
            `no discovered device with id "${discoveredDeviceId}"`
        );
    }

    /** @param {ScannerEvent} event */
    #onDiscoveredDevice(event) {
        /** @type {DiscoveredDevice} */
        const discoveredDevice = event.message.discoveredDevice;
        this.#discoveredDevices[discoveredDevice.id] = discoveredDevice;
        this.#discoveredDeviceTimestamps[discoveredDevice.id] = Date.now();
        this.#checkDiscoveredDevicesExpirationTimer.start();
    }

    /** @type {Object.<string, number>} */
    #discoveredDeviceTimestamps = {};

    static #DiscoveredDeviceExpirationTimeout = 5000;
    static get DiscoveredDeviceExpirationTimeout() {
        return this.#DiscoveredDeviceExpirationTimeout;
    }
    get #discoveredDeviceExpirationTimeout() {
        return BaseScanner.DiscoveredDeviceExpirationTimeout;
    }
    #checkDiscoveredDevicesExpirationTimer = new Timer(this.#checkDiscoveredDevicesExpiration.bind(this), 1000);
    #checkDiscoveredDevicesExpiration() {
        const entries = Object.entries(this.#discoveredDevices);
        if (entries.length == 0) {
            this.#checkDiscoveredDevicesExpirationTimer.stop();
            return;
        }
        const now = Date.now();
        entries.forEach(([id, discoveredDevice]) => {
            const timestamp = this.#discoveredDeviceTimestamps[id];
            if (now - timestamp > this.#discoveredDeviceExpirationTimeout) {
                _console.log("discovered device timeout");
                delete this.#discoveredDevices[id];
                delete this.#discoveredDeviceTimestamps[id];
                this.dispatchEvent({ type: "expiredDiscoveredDevice", message: { discoveredDevice } });
            }
        });
    }

    // DEVICE CONNECTION
    /** @param {string} deviceId */
    async connectToDevice(deviceId) {
        this.#assertIsAvailable();
    }

    // RESET

    get canReset() {
        return false;
    }
    reset() {
        _console.log("resetting...");
    }
}

export default BaseScanner;
