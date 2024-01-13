/**
 * @copyright Zack Qattan 2024
 * @license MIT
 */
(function (global, factory) {
    typeof exports === "object" && typeof module !== "undefined"
        ? (module.exports = factory())
        : typeof define === "function" && define.amd
        ? define(factory)
        : ((global = typeof globalThis !== "undefined" ? globalThis : global || self),
          (global.BrilliantSole = factory()));
})(this, function () {
    "use strict";

    /**
     * @param {boolean} condition
     * @param {string?} message
     * @throws {Error} if condition is not met
     */
    function assertWithError(condition, message) {
        if (!condition) {
            throw new Error(message);
        }
    }

    /**
     * @typedef EventDispatcherEvent
     * @type {object}
     * @property {string} type
     */

    /**
     * @typedef EventDispatcherOptions
     * @type {object}
     * @property {boolean?} once
     */

    /** @typedef {(event: EventDispatcherEvent) => void} EventDispatcherListener */

    // based on https://github.com/mrdoob/eventdispatcher.js/
    class EventDispatcher {
        /**
         * @param {string[]?} eventTypes
         */
        constructor(eventTypes) {
            assertWithError(Array.isArray(eventTypes) || eventTypes == undefined, "eventTypes must be an array");
            this.#eventTypes = eventTypes;
        }

        /** @type {string[]?} */
        #eventTypes;

        /**
         * @param {string} type
         * @returns {boolean}
         */
        #isValidEventType(type) {
            if (!this.#eventTypes) {
                return true;
            }
            return this.#eventTypes.includes(type);
        }

        /**
         * @param {string} type
         * @throws {Error}
         */
        #assertValidEventType(type) {
            assertWithError(this.#isValidEventType(type), `invalid event type "${type}"`);
        }

        /** @type {Object.<string, [function]?>?} */
        #listeners;

        /**
         * @param {string} type
         * @param {EventDispatcherListener} listener
         * @param {EventDispatcherOptions?} options
         */
        addEventListener(type, listener, options) {
            this.#assertValidEventType(type);

            if (!this.#listeners) this.#listeners = {};

            if (options?.once) {
                const _listener = listener;
                listener = function onceCallback(event) {
                    _listener.apply(this, arguments);
                    this.removeEventListener(type, onceCallback);
                };
            }

            const listeners = this.#listeners;

            if (!listeners[type]) {
                listeners[type] = [];
            }

            if (!listeners[type].includes(listener)) {
                listeners[type].push(listener);
            }
        }

        /**
         *
         * @param {string} type
         * @param {EventDispatcherListener} listener
         * @returns {boolean}
         * @throws {Error} if type is not valid
         */
        hasEventListener(type, listener) {
            this.#assertValidEventType(type);
            return this.#listeners?.[type]?.includes(listener);
        }

        /**
         * @param {string} type
         * @param {EventDispatcherListener} listener
         * @returns {boolean} successfully removed listener
         * @throws {Error} if type is not valid
         */
        removeEventListener(type, listener) {
            this.#assertValidEventType(type);
            if (this.hasEventListener(type, listener)) {
                const index = this.#listeners[type].indexOf(listener);
                this.#listeners[type].splice(index, 1);
                return true;
            }
            return false;
        }

        /**
         * @param {EventDispatcherEvent} event
         * @throws {Error} if type is not valid
         */
        dispatchEvent(event) {
            this.#assertValidEventType(event.type);
            if (this.#listeners?.[event.type]) {
                event.target = this;

                // Make a copy, in case listeners are removed while iterating.
                const array = this.#listeners[event.type].slice(0);

                for (let i = 0, l = array.length; i < l; i++) {
                    array[i].call(this, event);
                }
            }
        }
    }

    /** @typedef {import("./utils/EventDispatcher.js").EventDispatcherListener} EventDispatcherListener */
    /** @typedef {import("./utils/EventDispatcher.js").EventDispatcherOptions} EventDispatcherOptions */

    /** @typedef {"web bluetooth" | "noble"} BrilliantSoleConnectionType */
    /** @typedef {"not connected" | "connecting" | "connected" | "disconnected"} BrilliantSoleConnectionManagerEventType */

    /**
     * @typedef BrilliantSoleConnectionManagerEvent
     * @type {object}
     * @property {BrilliantSoleConnectionManagerEventType} type
     */

    class ConnectionManager {
        /** @type {BrilliantSoleConnectionManagerEventType[]} */
        static #EventTypes = ["not connected", "connecting", "connected", "disconnected"];
        static get EventTypes() {
            return this.#EventTypes;
        }
        get #eventTypes() {
            return ConnectionManager.#EventTypes;
        }
        #eventDispatcher = new EventDispatcher(this.#eventTypes);

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
         * @param {BrilliantSoleConnectionManagerEvent} event
         * @throws {Error} if type is not valid
         */
        #dispatchEvent(event) {
            this.#eventDispatcher.dispatchEvent(event);
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
            assertWithError(this.isSupported, `${this.constructor.name} is not supported`);
        }

        /** @throws {Error} if abstract class */
        #assertIsSubclass() {
            assertWithError(this.constructor != ConnectionManager, `${this.constructor.name} must be subclassed`);
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
            assertWithError(this.isConnected, "device is not connected");
        }
        /** @throws {Error} if connected */
        #assertIsNotConnected() {
            assertWithError(!this.isConnected, "device is already connected");
        }

        /** @throws {Error} if already connected */
        async connect() {
            this.#assertIsNotConnected();
        }
        /** @throws {Error} if not connected */
        async disconnect() {
            this.#assertIsConnected();
        }
    }

    /**
     * @param {string|number} value
     * @returns {BluetoothServiceUUID}
     */
    function generateBluetoothUUID(value) {
        return `6e40000${value}-b5a3-f393-e0a9-e50e24dcca9e`;
    }

    const bluetoothUUIDs = Object.freeze({
        deviceInformationService: {
            uuid: "device_information", // 0x180a
            characteristics: {
                manufacturerName: {
                    uuid: "manufacturer_name_string",
                },
                modelNumber: {
                    uuid: "model_number_string",
                },
                hardwareRevision: {
                    uuid: "hardware_revision_string",
                },
                firmwareRevision: {
                    uuid: "firmware_revision_string",
                },
                softwareRevision: {
                    uuid: "software_revision_string",
                },
            },
        },
        batteryService: {
            uuid: "battery_service", // 0x180f
            characteristics: {
                batteryLevel: {
                    uuid: "battery_level", // 0x2a19
                },
            },
        },
        dataService: {
            uuid: generateBluetoothUUID("1"),
            characteristics: {
                write: { uuid: generateBluetoothUUID("2") },
                notify: { uuid: generateBluetoothUUID("3") },
            },
        },
        unknownService: {
            uuid: 0xfe59,
            characteristics: {},
        },

        /** @type {BluetoothServiceUUID[]} */
        get serviceUUIDs() {
            return [
                this.deviceInformationService.uuid,
                this.batteryService.uuid,
                this.dataService.uuid,
                this.unknownService.uuid,
            ];
        },
    });

    class Console {
        /**
         * @callback LogFunction
         * @param {...any} data
         */

        #emptyFunction = function () {};

        /** @param {string?} newPrefix */
        set prefix(newPrefix) {
            const args = [console];
            if (newPrefix) {
                if (Array.isArray(newPrefix)) {
                    args.push(...newPrefix);
                } else {
                    args.push(newPrefix);
                }
            }

            this.#log = console.log.bind(...args);
            this.#warn = console.warn.bind(...args);
            this.#error = console.error.bind(...args);
        }

        /** @type {boolean} */
        isLoggingEnabled = true;
        /** @type {LogFunction} */
        get log() {
            return this.#emptyFunction;
        }
        #log = console.log.bind(console);

        /** @type {boolean} */
        isWarningEnabled = true;
        /** @type {LogFunction} */
        get warn() {
            return this.#emptyFunction;
        }
        /** @type {LogFunction} */
        #warn = console.warn.bind(console);

        /** @type {boolean} */
        isErrorEnabled = true;
        /** @type {LogFunction} */
        get error() {
            return this.#emptyFunction;
        }
        /** @type {LogFunction} */
        #error = console.error.bind(console);

        /** @param {boolean} isEnabled */
        set isEnabled(isEnabled) {
            this.isLoggingEnabled = isEnabled;
            this.isWarningEnabled = isEnabled;
            this.isErrorEnabled = isEnabled;
        }

        /**
         * @param {string?} prefix
         */
        constructor(prefix) {
            if (prefix) {
                this.prefix = prefix;
            }
        }
    }

    const _console = new Console();

    class BluetoothConnectionManager extends ConnectionManager {
        static get isSupported() {
            return "bluetooth" in navigator;
        }
        /** @type {BrilliantSoleConnectionType} */
        static get type() {
            return "web bluetooth";
        }

        /** @type {BluetoothDevice?} */
        #device;
        get device() {
            return this.#device;
        }
        set device(newDevice) {
            if (this.device == newDevice) {
                _console.warn("assigning the same BluetoothDevice");
                return;
            }
            // FILL - remove existing eventListeners
            // FILL - assign new eventListeners
            this.#device = newDevice;
        }

        /** @type {BluetoothRemoteGATTServer?} */
        get server() {
            return this.#device?.gatt;
        }
        get isConnected() {
            return this.server?.connected;
        }

        async connect() {
            super.connect();

            const device = await navigator.bluetooth.requestDevice({
                //filters: [{ services: bluetoothUUIDs.serviceUUIDs }],
                filters: [{ namePrefix: "Brilliant" }],
                optionalServices: bluetoothUUIDs.serviceUUIDs,
            });

            _console.log("got BluetoothDevice", device);
            this.device = device;

            _console.log("connecting to device...");
            await this.device.gatt.connect();
            _console.log(`connected to device? ${this.server.connected}`);

            // FILL - services and stuff
        }
        async disconnect() {
            super.disconnect();
            _console.log("disconnecting from device...");
            this.server.disconnect();
        }
    }

    /** @typedef {import("./utils/EventDispatcher.js").EventDispatcherListener} EventDispatcherListener */
    /** @typedef {import("./utils/EventDispatcher.js").EventDispatcherOptions} EventDispatcherOptions */

    /** @typedef {import("./connection/ConnectionManager.js").BrilliantSoleConnectionManagerEventType} BrilliantSoleConnectionManagerEventType */
    /** @typedef {BrilliantSoleConnectionManagerEventType} BrilliantSoleEventType */

    class BrilliantSole {
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
         * @param {BrilliantSoleEventType} type
         * @param {EventDispatcherListener} listener
         * @returns {boolean}
         * @throws {Error}
         */
        removeEventListener(type, listener) {
            return this.#eventDispatcher.removeEventListener(...arguments);
        }

        /** @type {ConnectionManager?} */
        #connectionManager = new BluetoothConnectionManager();
        get connectionManager() {
            return this.#connectionManager;
        }
        set connectionManager(newConnectionManager) {
            assertWithError(this.connectionManager != newConnectionManager, "cannot assign same connectionManager");
            // FILL - remove existing eventListeners
            // FILL - add new eventListeners
            this.#connectionManager = newConnectionManager;
        }

        async connect() {
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
    }

    return BrilliantSole;
});
