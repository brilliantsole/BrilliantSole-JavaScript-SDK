/**
 * @copyright Zack Qattan 2024
 * @license MIT
 */
/** @type {"__BRILLIANTSOLE__DEV__" | "__BRILLIANTSOLE__PROD__"} */
const isInDev = "__BRILLIANTSOLE__PROD__" == "__BRILLIANTSOLE__DEV__";

/**
 * @callback LogFunction
 * @param {...any} data
 */

/**
 * @callback AssertLogFunction
 * @param {boolean} condition
 * @param {...any} data
 */

/**
 * @typedef ConsoleLevelFlags
 * @type {object}
 * @property {boolean} log
 * @property {boolean} warn
 * @property {boolean} error
 * @property {boolean} assert
 * @property {boolean} assertWithWarning
 * @property {boolean} assertWithError
 */

function emptyFunction() {}

const log = console.log.bind(console);
const warn = console.warn.bind(console);
const error = console.error.bind(console);
const assert = console.assert.bind(console);

class Console {
    /** @type {Object.<string, Console>} */
    static #consoles = {};

    /**
     * @param {string} type
     */
    constructor(type) {
        if (Console.#consoles[type]) {
            throw new Error(`"${type}" console already exists`);
        }
        Console.#consoles[type] = this;
    }

    /** @type {ConsoleLevelFlags} */
    #levelFlags = {
        log: isInDev,
        warn: isInDev,
        error: isInDev,
    };

    /**
     * @param {ConsoleLevelFlags} levelFlags
     */
    setLevelFlags(levelFlags) {
        Object.assign(this.#levelFlags, levelFlags);
    }

    /**
     * @param {string} type
     * @param {ConsoleLevelFlags} levelFlags
     * @throws {Error} if no console with type "type" is found
     */
    static setLevelFlagsForType(type, levelFlags) {
        if (!this.#consoles[type]) {
            throw new Error(`no console found with type "${type}"`);
        }
        this.#consoles[type].setLevelFlags(levelFlags);
    }

    /**
     * @param {ConsoleLevelFlags} levelFlags
     */
    static setAllLevelFlags(levelFlags) {
        for (const type in this.#consoles) {
            this.#consoles[type].setLevelFlags(levelFlags);
        }
    }

    /**
     * @param {string} type
     * @param {ConsoleLevelFlags} levelFlags
     * @returns {Console}
     */
    static create(type, levelFlags) {
        const console = this.#consoles[type] || new Console(type);
        console.setLevelFlags(levelFlags);
        return console;
    }

    /** @type {LogFunction} */
    get log() {
        return this.#levelFlags.log ? log : emptyFunction;
    }

    /** @type {LogFunction} */
    get warn() {
        return this.#levelFlags.warn ? warn : emptyFunction;
    }

    /** @type {LogFunction} */
    get error() {
        return this.#levelFlags.error ? error : emptyFunction;
    }

    /** @type {AssertLogFunction} */
    get assert() {
        return this.#levelFlags.assert ? assert : emptyFunction;
    }

    /**
     * @param {boolean} condition
     * @param {string?} message
     * @throws {Error} if condition is not met
     */
    assertWithError(condition, message) {
        if (!condition) {
            throw new Error(message);
        }
    }

    /**
     * @param {boolean} condition
     * @param {...any} data
     */
    assertWithWarning(condition, ...data) {
        if (!condition) {
            this.warn(...data);
            return;
        }
    }
}

/**
 * @param {string} type
 * @param {ConsoleLevelFlags?} levelFlags
 * @returns {Console}
 */
function createConsole(type, levelFlags) {
    return Console.create(type, levelFlags);
}

/**
 * @param {string} type
 * @param {ConsoleLevelFlags} levelFlags
 * @throws {Error} if no console with type is found
 */
function setConsoleLevelFlagsForType(type, levelFlags) {
    Console.setLevelFlagsForType(type, levelFlags);
}

/**
 * @param {ConsoleLevelFlags} levelFlags
 */
function setAllConsoleLevelFlags(levelFlags) {
    Console.setAllLevelFlags(levelFlags);
}

/**
 * made with ChatGPT
 * @param {string} string
 * @returns {string}
 */
function spacesToPascalCase(string) {
    return string
        .replace(/(?:^\w|\b\w)/g, function (match) {
            return match.toUpperCase();
        })
        .replace(/\s+/g, "");
}

/**
 * @typedef EventDispatcherEvent
 * @type {object}
 * @property {string} type
 * @property {object} message
 */

/**
 * @typedef EventDispatcherOptions
 * @type {object}
 * @property {boolean?} once
 */

/** @typedef {(event: EventDispatcherEvent) => void} EventDispatcherListener */

const _console$3 = createConsole("EventDispatcher", { log: false });

// based on https://github.com/mrdoob/eventdispatcher.js/
class EventDispatcher {
    /**
     * @param {string[]?} eventTypes
     */
    constructor(eventTypes) {
        _console$3.assertWithError(Array.isArray(eventTypes) || eventTypes == undefined, "eventTypes must be an array");
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
        _console$3.assertWithError(this.#isValidEventType(type), `invalid event type "${type}"`);
    }

    /** @type {Object.<string, [function]?>?} */
    #listeners;

    /**
     * @param {string} type
     * @param {EventDispatcherListener} listener
     * @param {EventDispatcherOptions?} options
     */
    addEventListener(type, listener, options) {
        _console$3.log(`adding "${type}" eventListener`, listener);
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
        _console$3.log(`has "${type}" eventListener?`, listener);
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
        _console$3.log(`removing "${type}" eventListener`, listener);
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

/**
 * @param {string[]} eventTypes
 * @param {object} object
 * @param {object} target
 */
function bindEventListeners(eventTypes, object, target) {
    eventTypes.forEach((eventType) => {
        const _eventType = `_on${spacesToPascalCase(eventType)}`;
        const boundEvent = target[_eventType].bind(target);
        target[_eventType] = boundEvent;
        object[eventType] = boundEvent;
    });
}

/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherListener} EventDispatcherListener */
/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherOptions} EventDispatcherOptions */

/** @typedef {"web bluetooth" | "noble"} BrilliantSoleConnectionType */
/** @typedef {"connecting" | "connected" | "disconnecting" | "disconnected" | "connection changed"} BrilliantSoleConnectionManagerEventType */

/**
 * @typedef BrilliantSoleConnectionManagerEvent
 * @type {object}
 * @property {BrilliantSoleConnectionManagerEventType} type
 */

const _console$2 = createConsole("ConnectionManager");

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
        _console$2.assertWithError(this.isSupported, `${this.constructor.name} is not supported`);
    }

    /** @throws {Error} if abstract class */
    #assertIsSubclass() {
        _console$2.assertWithError(this.constructor != ConnectionManager, `${this.constructor.name} must be subclassed`);
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
        _console$2.assertWithError(this.isConnected, "device is not connected");
    }
    /** @throws {Error} if connected */
    #assertIsNotConnected() {
        _console$2.assertWithError(!this.isConnected, "device is already connected");
    }

    /** @throws {Error} if already connected */
    async connect() {
        this.#assertIsNotConnected();
        this.#dispatchEvent({ type: "connecting" });
    }
    /** @throws {Error} if not connected */
    async disconnect() {
        this.#assertIsConnected();
        this.#dispatchEvent({ type: "disconnected" });
    }
}

/**
 * @param {string|number} value
 * @returns {BluetoothServiceUUID}
 */
function generateBluetoothUUID(value) {
    return `6e40000${value}-b5a3-f393-e0a9-e50e24dcca9e`;
}

/**
 * @param {string} identifier
 */
function stringToCharacteristicUUID(identifier) {
    return BluetoothUUID.getCharacteristic(identifier);
}

/**
 * @param {string} identifier
 */
function stringToServiceUUID(identifier) {
    return BluetoothUUID.getService(identifier);
}

/** @typedef {"deviceInformation" | "battery" | "data" | "unknown"} BrilliantSoleBluetoothServiceName */
/** @typedef { "manufacturerName" | "modelNumber" | "hardwareRevision" | "firmwareRevision" | "softwareRevision" | "batteryLevel" | "dataWrite" | "dataNotify" | "unknown1"} BrilliantSoleBluetoothCharacteristicName */

const bluetoothUUIDs = Object.freeze({
    services: {
        deviceInformation: {
            uuid: stringToServiceUUID("device_information"),
            characteristics: {
                manufacturerName: {
                    uuid: stringToCharacteristicUUID("manufacturer_name_string"),
                },
                modelNumber: {
                    uuid: stringToCharacteristicUUID("model_number_string"),
                },
                hardwareRevision: {
                    uuid: stringToCharacteristicUUID("hardware_revision_string"),
                },
                firmwareRevision: {
                    uuid: stringToCharacteristicUUID("firmware_revision_string"),
                },
                softwareRevision: {
                    uuid: stringToCharacteristicUUID("software_revision_string"),
                },
            },
        },
        battery: {
            uuid: stringToServiceUUID("battery_service"),
            characteristics: {
                batteryLevel: {
                    uuid: stringToCharacteristicUUID("battery_level"),
                },
            },
        },
        data: {
            uuid: generateBluetoothUUID("1"),
            characteristics: {
                dataWrite: { uuid: generateBluetoothUUID("2") },
                dataNotify: { uuid: generateBluetoothUUID("3") },
            },
        },
        unknown: {
            uuid: stringToCharacteristicUUID(0xfe59),
            characteristics: {
                unknown1: { uuid: "8ec90003-f315-4f60-9fb8-838830daea50" },
            },
        },
    },

    /** @type {BluetoothServiceUUID[]} */
    get serviceUUIDs() {
        return [
            this.services.deviceInformation.uuid,
            this.services.battery.uuid,
            this.services.data.uuid,
            this.services.unknown.uuid,
        ];
    },

    /**
     * @param {BluetoothServiceUUID} serviceUUID
     * @returns {BrilliantSoleBluetoothServiceName?}
     */
    getServiceNameFromUUID(serviceUUID) {
        return Object.entries(this.services).find(([serviceName, serviceInfo]) => {
            return serviceUUID == serviceInfo.uuid;
        })?.[0];
    },

    /**
     * @param {BluetoothCharacteristicUUID} characteristicUUID
     * @returns {BrilliantSoleBluetoothCharacteristicName?}
     */
    getCharacteristicNameFromUUID(characteristicUUID) {
        var characteristicName;
        Object.values(this.services).some((serviceInfo) => {
            characteristicName = Object.entries(serviceInfo.characteristics).find(
                ([characteristicName, characteristicInfo]) => {
                    return characteristicUUID == characteristicInfo.uuid;
                }
            )?.[0];
            return characteristicName;
        });
        return characteristicName;
    },
});

const serviceUUIDs = bluetoothUUIDs.serviceUUIDs;

/** @param {BluetoothServiceUUID} serviceUUID */
function getServiceNameFromUUID(serviceUUID) {
    return bluetoothUUIDs.getServiceNameFromUUID(serviceUUID);
}

/** @param {BluetoothCharacteristicUUID} characteristicUUID */
function getCharacteristicNameFromUUID(characteristicUUID) {
    return bluetoothUUIDs.getCharacteristicNameFromUUID(characteristicUUID);
}

const _console$1 = createConsole("WebBluetoothConnectionManager");

/** @typedef {import("./bluetoothUUIDs.js").BrilliantSoleBluetoothCharacteristicName} BrilliantSoleBluetoothCharacteristicName */
/** @typedef {import("./bluetoothUUIDs.js").BrilliantSoleBluetoothServiceName} BrilliantSoleBluetoothServiceName */

class WebBluetoothConnectionManager extends ConnectionManager {
    constructor() {
        super();
        bindEventListeners(["characteristicvaluechanged"], this.#boundBluetoothCharacteristicEventListeners, this);
    }
    /** @type {Object.<string, EventDispatcherListener} */
    #boundBluetoothCharacteristicEventListeners = {};

    static get isSupported() {
        return "bluetooth" in navigator;
    }
    /** @type {import("../ConnectionManager.js").BrilliantSoleConnectionType} */
    static get type() {
        return "web bluetooth";
    }

    /** @type {BluetoothDevice?} */
    #device;
    get device() {
        return this.#device;
    }
    set device(newDevice) {
        if (this.#device == newDevice) {
            _console$1.warn("assigning the same BluetoothDevice");
            return;
        }
        this.#device?.addEventListener("");
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

    /** @type {Map.<BrilliantSoleBluetoothServiceName, BluetoothRemoteGATTService} */
    #services = new Map();
    /** @type {Map.<BrilliantSoleBluetoothCharacteristicName, BluetoothRemoteGATTCharacteristic} */
    #characteristics = new Map();

    async connect() {
        super.connect();

        const device = await navigator.bluetooth.requestDevice({
            //filters: [{ services: serviceUUIDs }],
            filters: [{ namePrefix: "Brilliant" }],
            optionalServices: serviceUUIDs,
        });

        _console$1.log("got BluetoothDevice", device);
        this.device = device;

        _console$1.log("connecting to device...");
        const server = await this.device.gatt.connect();
        _console$1.log(`connected to device? ${server.connected}`);

        _console$1.log("getting services...");
        const services = await server.getPrimaryServices();
        _console$1.log("got services", services);

        _console$1.log("getting characteristics...");
        const servicePromises = services.map(async (service) => {
            const serviceName = getServiceNameFromUUID(service.uuid);
            _console$1.assertWithError(serviceName, `no name found for service uuid "${service.uuid}"`);
            _console$1.log(`got "${serviceName}" service`);
            service._name = serviceName;
            this.#services.set(serviceName, service);
            _console$1.log("getting characteristics for service", service);
            const characteristics = await service.getCharacteristics();
            _console$1.log("got characteristics for service", service, characteristics);
            const characteristicPromises = characteristics.map(async (characteristic) => {
                const characteristicName = getCharacteristicNameFromUUID(characteristic.uuid);
                _console$1.assertWithError(
                    characteristicName,
                    `no name found for characteristic uuid "${characteristic.uuid}" in "${serviceName}" service`
                );
                _console$1.log(`got "${characteristicName}" characteristic in "${serviceName}" service`);
                characteristic._name = characteristicName;
                this.#characteristics.set(characteristicName, characteristic);
                characteristic.addEventListener(
                    "characteristicvaluechanged",
                    this.#boundBluetoothCharacteristicEventListeners["characteristicvaluechanged"]
                );
                if (characteristic.properties.read) {
                    await characteristic.readValue();
                }
                if (characteristic.properties.notify) {
                    _console$1.log(`starting notifications for "${characteristicName}" characteristic`, characteristic);
                    await characteristic.startNotifications();
                }
            });
            await Promise.all(characteristicPromises);
        });
        await Promise.all(servicePromises);
        _console$1.log("got all characteristics");
    }
    async disconnect() {
        super.disconnect();
        _console$1.log("disconnecting from device...");
        this.server.disconnect();
    }

    /**
     * @private
     * @param {Event} event
     */
    _onCharacteristicvaluechanged(event) {
        _console$1.log("oncharacteristicvaluechanged", event);

        /** @type {BluetoothRemoteGATTCharacteristic} */
        const characteristic = event.target;
        /** @type {BrilliantSoleBluetoothCharacteristicName} */
        const characteristicName = characteristic._name;
        _console$1.assertWithError(
            characteristicName,
            `no name found for characteristic with uuid "${characteristic.uuid}"`
        );

        _console$1.log(`oncharacteristicvaluechanged for "${characteristicName}" characteristic`, event);
        const dataView = characteristic.value;
        _console$1.assertWithError(dataView, `no data found for "${characteristicName}" characteristic`);
        _console$1.log(`data for "${characteristicName}" characteristic`, Array.from(new Uint8Array(dataView.buffer)));

        switch (characteristicName) {
            case "dataNotify":
                break;
            default:
                throw new Error(`uncaught characteristicName "${characteristicName}"`);
        }
    }
}

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

export { BrilliantSole as default };
