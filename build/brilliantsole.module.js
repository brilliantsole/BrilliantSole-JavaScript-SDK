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

const _console$4 = createConsole("EventDispatcher", { log: false });

// based on https://github.com/mrdoob/eventdispatcher.js/
class EventDispatcher {
    /**
     * @param {string[]?} eventTypes
     */
    constructor(eventTypes) {
        _console$4.assertWithError(Array.isArray(eventTypes) || eventTypes == undefined, "eventTypes must be an array");
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
        _console$4.assertWithError(this.#isValidEventType(type), `invalid event type "${type}"`);
    }

    /** @type {Object.<string, [function]?>?} */
    #listeners;

    /**
     * @param {string} type
     * @param {EventDispatcherListener} listener
     * @param {EventDispatcherOptions?} options
     */
    addEventListener(type, listener, options) {
        _console$4.log(`adding "${type}" eventListener`, listener);
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
        _console$4.log(`has "${type}" eventListener?`, listener);
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
        _console$4.log(`removing "${type}" eventListener`, listener);
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
 * @param {object.<string, EventListener>} boundEventListeners
 * @param {object} target
 */
function bindEventListeners(eventTypes, boundEventListeners, target) {
    _console$4.log("bindEventListeners", { eventTypes, boundEventListeners, target });
    eventTypes.forEach((eventType) => {
        const _eventType = `_on${spacesToPascalCase(eventType)}`;
        _console$4.assertWithError(target[_eventType], `no event "${_eventType}" found in target`, target);
        _console$4.log(`binding eventType "${eventType}" as ${_eventType} from target`, target);
        const boundEvent = target[_eventType].bind(target);
        target[_eventType] = boundEvent;
        boundEventListeners[eventType] = boundEvent;
    });
}

/**
 * @param {object} target
 * @param {object.<string, EventListener>} boundEventListeners
 */
function addEventListeners(target, boundEventListeners) {
    Object.entries(boundEventListeners).forEach(([eventType, eventListener]) => {
        target.addEventListener(eventType, eventListener);
    });
}

/**
 * @param {object} target
 * @param {object.<string, EventListener>} boundEventListeners
 */
function removeEventListeners(target, boundEventListeners) {
    Object.entries(boundEventListeners).forEach(([eventType, eventListener]) => {
        target.removeEventListener(eventType, eventListener);
    });
}

/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherListener} EventDispatcherListener */
/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherOptions} EventDispatcherOptions */

/** @typedef {"web bluetooth" | "noble"} BrilliantSoleConnectionType */
/** @typedef {"not connected" | "connecting" | "connected" | "disconnecting"} BrilliantSoleConnectionStatus */
/** @typedef {"connectionStatus" | "isConnected" | "deviceInformation" | "batteryLevel" | "data"} BrilliantSoleConnectionManagerEventType */

/**
 * @typedef BrilliantSoleConnectionManagerEvent
 * @type {object}
 * @property {BrilliantSoleConnectionManagerEventType} type
 * @property {object} message
 */

const _console$3 = createConsole("ConnectionManager");

class ConnectionManager {
    /** @type {BrilliantSoleConnectionManagerEventType[]} */
    static #EventTypes = ["isConnected", "connectionStatus", "deviceInformation", "batteryLevel", "data"];
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
        _console$3.assertWithError(this.isSupported, `${this.constructor.name} is not supported`);
    }

    /** @throws {Error} if abstract class */
    #assertIsSubclass() {
        _console$3.assertWithError(this.constructor != ConnectionManager, `${this.constructor.name} must be subclassed`);
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
            _console$3.warn("same connection status");
            return;
        }
        _console$3.log(`new connection status "${newConnectionStatus}"`);
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
        _console$3.assertWithError(!this.isConnected, "device is already connected");
    }
    /** @throws {Error} if connecting */
    #assertIsNotConnecting() {
        _console$3.assertWithError(this.connectionStatus != "connecting", "device is already connecting");
    }
    /** @throws {Error} if not connected */
    #assertIsConnected() {
        _console$3.assertWithError(this.isConnected, "device is not connected");
    }
    /** @throws {Error} if disconnecting */
    #assertIsNotDisconnecting() {
        _console$3.assertWithError(this.connectionStatus != "disconnecting", "device is already disconnecting");
    }

    /** @throws {Error} if already connected */
    async connect() {
        this.#assertIsNotConnected();
        this.#assertIsNotConnecting();
        this.connectionStatus = "connecting";
    }
    /** @type {boolean} */
    get canReconnect() {
        return false;
    }
    /** @throws {Error} if already connected */
    async reconnect() {
        this.#assertIsNotConnected();
        this.#assertIsNotConnecting();
        _console$3.assert(this.canReconnect, "unable to reconnect");
        this.connectionStatus = "connecting";
    }
    /** @throws {Error} if not connected */
    async disconnect() {
        this.#assertIsConnected();
        this.#assertIsNotDisconnecting();
        this.connectionStatus = "disconnecting";
    }

    /**
     * @throws {Error} if not connected
     * @param {DataView|ArrayBuffer} message
     */
    async sendCommand(message) {
        this.#assertIsConnected();
        this.#assertIsNotDisconnecting();
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
/** @typedef { "manufacturerName" | "modelNumber" | "hardwareRevision" | "firmwareRevision" | "softwareRevision" | "batteryLevel" | "command" | "data" | "firmware"} BrilliantSoleBluetoothCharacteristicName */

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
                command: { uuid: generateBluetoothUUID("2") },
                data: { uuid: generateBluetoothUUID("3") },
            },
        },
        firmware: {
            uuid: stringToCharacteristicUUID(0xfe59),
            characteristics: {
                firmware: { uuid: "8ec90003-f315-4f60-9fb8-838830daea50" },
            },
        },
    },

    /** @type {BluetoothServiceUUID[]} */
    get serviceUUIDs() {
        return [
            this.services.deviceInformation.uuid,
            this.services.battery.uuid,
            this.services.data.uuid,
            this.services.firmware.uuid,
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

const _console$2 = createConsole("WebBluetoothConnectionManager", { log: false });

/** @typedef {import("./bluetoothUUIDs.js").BrilliantSoleBluetoothCharacteristicName} BrilliantSoleBluetoothCharacteristicName */
/** @typedef {import("./bluetoothUUIDs.js").BrilliantSoleBluetoothServiceName} BrilliantSoleBluetoothServiceName */

class WebBluetoothConnectionManager extends ConnectionManager {
    constructor() {
        super();
        bindEventListeners(["characteristicvaluechanged"], this.#boundBluetoothCharacteristicEventListeners, this);
        bindEventListeners(["gattserverdisconnected"], this.#boundBluetoothDeviceEventListeners, this);
    }
    /** @type {Object.<string, EventListener} */
    #boundBluetoothCharacteristicEventListeners = {};
    /** @type {Object.<string, EventListener} */
    #boundBluetoothDeviceEventListeners = {};

    static get isSupported() {
        return "bluetooth" in navigator;
    }
    /** @type {import("../ConnectionManager.js").BrilliantSoleConnectionType} */
    static get type() {
        return "web bluetooth";
    }

    /** @type {TextDecoder} */
    static #TextDecoder = new TextDecoder();
    get #textDecoder() {
        return WebBluetoothConnectionManager.#TextDecoder;
    }

    /** @type {BluetoothDevice?} */
    #device;
    get device() {
        return this.#device;
    }
    set device(newDevice) {
        if (this.#device == newDevice) {
            _console$2.warn("assigning the same BluetoothDevice");
            return;
        }
        if (this.#device) {
            removeEventListeners(this.#device, this.#boundBluetoothDeviceEventListeners);
        }
        if (newDevice) {
            addEventListeners(newDevice, this.#boundBluetoothDeviceEventListeners);
        }
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
        await super.connect();

        try {
            const device = await navigator.bluetooth.requestDevice({
                //filters: [{ services: serviceUUIDs }],
                filters: [{ namePrefix: "Brilliant" }],
                optionalServices: serviceUUIDs,
            });

            _console$2.log("got BluetoothDevice", device);
            this.device = device;

            _console$2.log("connecting to device...");
            const server = await this.device.gatt.connect();
            _console$2.log(`connected to device? ${server.connected}`);

            _console$2.log("getting services...");
            const services = await server.getPrimaryServices();
            _console$2.log("got services", services);

            _console$2.log("getting characteristics...");
            const servicePromises = services.map(async (service) => {
                const serviceName = getServiceNameFromUUID(service.uuid);
                _console$2.assertWithError(serviceName, `no name found for service uuid "${service.uuid}"`);
                _console$2.log(`got "${serviceName}" service`);
                service._name = serviceName;
                this.#services.set(serviceName, service);
                _console$2.log("getting characteristics for service", service);
                const characteristics = await service.getCharacteristics();
                _console$2.log("got characteristics for service", service, characteristics);
                const characteristicPromises = characteristics.map(async (characteristic) => {
                    const characteristicName = getCharacteristicNameFromUUID(characteristic.uuid);
                    _console$2.assertWithError(
                        characteristicName,
                        `no name found for characteristic uuid "${characteristic.uuid}" in "${serviceName}" service`
                    );
                    _console$2.log(`got "${characteristicName}" characteristic in "${serviceName}" service`);
                    characteristic._name = characteristicName;
                    this.#characteristics.set(characteristicName, characteristic);
                    addEventListeners(characteristic, this.#boundBluetoothCharacteristicEventListeners);
                    if (characteristic.properties.read) {
                        await characteristic.readValue();
                    }
                    if (characteristic.properties.notify) {
                        _console$2.log(
                            `starting notifications for "${characteristicName}" characteristic`,
                            characteristic
                        );
                        await characteristic.startNotifications();
                    }
                });
                await Promise.all(characteristicPromises);
            });
            await Promise.all(servicePromises);
            _console$2.log("fully connected");

            this.connectionStatus = "connected";
        } catch (error) {
            _console$2.error(error);
            this.connectionStatus = "not connected";
        }
    }
    async disconnect() {
        await super.disconnect();
        _console$2.log("disconnecting from device...");
        this.server.disconnect();
    }

    /**
     * @private
     * @param {Event} event
     */
    _onCharacteristicvaluechanged(event) {
        _console$2.log("oncharacteristicvaluechanged", event);

        /** @type {BluetoothRemoteGATTCharacteristic} */
        const characteristic = event.target;
        /** @type {BrilliantSoleBluetoothCharacteristicName} */
        const characteristicName = characteristic._name;
        _console$2.assertWithError(
            characteristicName,
            `no name found for characteristic with uuid "${characteristic.uuid}"`
        );

        _console$2.log(`oncharacteristicvaluechanged for "${characteristicName}" characteristic`, event);
        const dataView = characteristic.value;
        _console$2.assertWithError(dataView, `no data found for "${characteristicName}" characteristic`);
        _console$2.log(`data for "${characteristicName}" characteristic`, Array.from(new Uint8Array(dataView.buffer)));

        switch (characteristicName) {
            case "manufacturerName":
                const manufacturerName = this.#textDecoder.decode(dataView);
                _console$2.log(`manufacturerName: "${manufacturerName}"`);
                this._dispatchEvent({ type: "deviceInformation", message: { manufacturerName } });
                break;
            case "modelNumber":
                const modelNumber = this.#textDecoder.decode(dataView);
                _console$2.log(`modelNumber: "${modelNumber}"`);
                this._dispatchEvent({ type: "deviceInformation", message: { modelNumber } });
                break;
            case "softwareRevision":
                const softwareRevision = this.#textDecoder.decode(dataView);
                _console$2.log(`softwareRevision: "${softwareRevision}"`);
                this._dispatchEvent({ type: "deviceInformation", message: { softwareRevision } });
                break;
            case "hardwareRevision":
                const hardwareRevision = this.#textDecoder.decode(dataView);
                _console$2.log(`hardwareRevision: "${hardwareRevision}"`);
                this._dispatchEvent({ type: "deviceInformation", message: { hardwareRevision } });
                break;
            case "firmwareRevision":
                const firmwareRevision = this.#textDecoder.decode(dataView);
                _console$2.log(`firmwareRevision: "${firmwareRevision}"`);
                this._dispatchEvent({ type: "deviceInformation", message: { firmwareRevision } });
                break;
            case "batteryLevel":
                const batteryLevel = dataView.getUint8(0);
                _console$2.log(`batteryLevel: ${batteryLevel}`);
                this._dispatchEvent({ type: "batteryLevel", message: { batteryLevel } });
                break;
            case "data":
                const data = dataView;
                _console$2.log("data", data);
                this._dispatchEvent({ type: "data", message: { data } });
                break;
            default:
                throw new Error(`uncaught characteristicName "${characteristicName}"`);
        }
    }

    /**
     * @private
     * @param {Event} event
     */
    _onGattserverdisconnected(event) {
        _console$2.log("gattserverdisconnected", event);
        this.connectionStatus = "not connected";
    }

    /**
     * @throws {Error} if not connected
     * @param {DataView|ArrayBuffer} message
     */
    async sendCommand(message) {
        await super.sendCommand(...arguments);
        const commandCharacteristic = this.#characteristics.get("command");
        _console$2.assertWithError(commandCharacteristic, "command characteristic not found");
        _console$2.log("sending data to command characteristic...", message, commandCharacteristic);
        await commandCharacteristic.writeValueWithResponse(message);
        _console$2.log("successfully sent command");
    }

    /** @type {boolean} */
    get canReconnect() {
        return Boolean(this.server);
    }
    async reconnect() {
        await super.reconnect();
        _console$2.log("attempting to reconnect...");
        await this.server.connect();
        if (this.isConnected) {
            _console$2.log("successfully reconnected!");
            this.connectionStatus = "connected";
        } else {
            _console$2.log("unable to reconnect");
            this.connectionStatus = "not connected";
        }
    }
}

/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherListener} EventDispatcherListener */
/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherOptions} EventDispatcherOptions */

/** @typedef {"start" | "sync" | "logging" | "sensor"} BrilliantSoleDataManagerState */
/** @typedef {"padding" | "sync" | "log" | "sensor"} BrilliantSoleDataManagerMessageType */
/** @typedef {"pressure" | "acceleration" | "linearAcceleration" | "quaternion" | "magneticRotation"} BrilliantSoleSensorType */
/** @typedef {"log" | BrilliantSoleSensorType} BrilliantSoleDataManagerEventType */
/** @typedef {"setSensorDataRate" | "setVibrationStrength" | "triggerVibration" | "stopVibration"} BrilliantSoleCommandType */
/** @typedef {"front" | "back" | "both"} BrilliantSoleVibrationMotor */
/** @typedef {"hallux" | "digits" | "metatarsal_inner" | "metatarsal_center" | "metatarsal_outer" | "lateral" | "arch" | "heel"} BrilliantSolePessureType */

/**
 * @typedef BrilliantSoleDataManagerEvent
 * @type {object}
 * @property {BrilliantSoleDataManagerEventType} type
 * @property {object} message
 */

const _console$1 = createConsole("DataManager", { log: false });

class DataManager {
    /** @type {BrilliantSoleDataManagerEventType[]} */
    static #EventTypes = ["log", "pressure", "acceleration", "linearAcceleration", "quaternion", "magneticRotation"];
    static get EventTypes() {
        return this.#EventTypes;
    }
    get eventTypes() {
        return DataManager.#EventTypes;
    }
    #eventDispatcher = new EventDispatcher(this.eventTypes);

    /**
     * @param {BrilliantSoleDataManagerEventType} type
     * @param {EventDispatcherListener} listener
     * @param {EventDispatcherOptions?} options
     * @throws {Error}
     */
    addEventListener(type, listener, options) {
        return this.#eventDispatcher.addEventListener(...arguments);
    }

    /**
     * @param {BrilliantSoleDataManagerEvent} event
     * @throws {Error} if type is not valid
     */
    #dispatchEvent(event) {
        this.#eventDispatcher.dispatchEvent(event);
    }

    /**
     * @param {BrilliantSoleDataManagerEventType} type
     * @param {EventDispatcherListener} listener
     * @returns {boolean}
     * @throws {Error}
     */
    removeEventListener(type, listener) {
        return this.#eventDispatcher.removeEventListener(...arguments);
    }

    /** @type {BrilliantSoleDataManagerState} */
    #state = "start";
    /** @private */
    get state() {
        return this.#state;
    }
    /** @private */
    set state(newState) {
        if (this.#state == newState) {
            _console$1.warn(`attempted to assign same state "${newState}"`);
            return;
        }
        this.#state = newState;
        _console$1.log(`newState "${this.state}"`);
    }

    /** @type {Object.<number, BrilliantSoleDataManagerMessageType?>} */
    static #_MessageType = {
        0: "padding",
        1: "sync",
        2: "log",
        3: "sensor",
    };
    get #MessageType() {
        return DataManager.#_MessageType;
    }

    /** @type {Object.<number, BrilliantSoleSensorType>} */
    static #_SensorType = {
        2: "pressure",
        6: "acceleration",
        32: "linearAcceleration",
        38: "quaternion",
        41: "magneticRotation",
    };
    get #SensorType() {
        return DataManager.#_SensorType;
    }
    /** @type {BrilliantSoleSensorType} */
    #sensorType;

    /* @type {Object.<BrilliantSoleSensorType, number>} */
    static #_SensorId = {
        pressure: 2,
        acceleration: 6,
        linearAcceleration: 32,
        quaternion: 38,
        magneticRotation: 41,
    };
    get #SensorId() {
        return DataManager.#_SensorId;
    }

    /* @type {Object.<BrilliantSoleSensorType, number>} */
    static #_SensorDataLength = {
        pressure: 16,
        acceleration: 6,
        linearAcceleration: 6,
        quaternion: 8,
    };
    get #SensorDataLength() {
        return DataManager.#_SensorDataLength;
    }
    /* @type {Object.<BrilliantSoleSensorType, number>} */
    static #_SensorDataScalar = {
        pressure: 1,
        acceleration: 2 ** -12,
        linearAcceleration: 2 ** -12,
        quaternion: 2 ** -14,
    };
    get #SensorDataScalar() {
        return DataManager.#_SensorDataScalar;
    }

    /* @type {Object.<BrilliantSoleCommandType, number>} */
    static #_CommandType = {
        setSensorDataRate: 1,
        setVibrationStrength: 2,
        triggerVibration: 3,
        stopVibration: 4,
    };
    get #CommandType() {
        return DataManager.#_CommandType;
    }

    /* @type {Object.<number, number>} */
    static #_SensorDataRate = {
        0: 0,
        1: 1.5625,
        2: 3.125,
        3: 6.25,
        4: 12.5,
        5: 25.0,
        6: 50.0,
    };
    get #SensorDataRate() {
        return DataManager.#_SensorDataRate;
    }

    /* @type {Object.<BrilliantSoleVibrationMotor, number>} */
    static #_VibrationMotor = {
        front: 1 << 0,
        back: 1 << 1,
        get both() {
            return this.front | this.back;
        },
    };
    get #VibrationMotor() {
        return DataManager.#_VibrationMotor;
    }

    /** @type {number[]} */
    #sensorDataBuffer = [];
    /** @type {number} */
    #sensorDataBufferFinalLength = 0;

    /** @type {number[]} */
    #logBuffer = [];
    /** @type {number} */
    #logBufferFinalLength = 0;

    /** @param {DataView} dataView */
    parseData(dataView) {
        _console$1.log(`parsing ${dataView.byteLength} bytes`, dataView);
        var byteOffset = 0;

        while (byteOffset < dataView.byteLength) {
            const byte = dataView.getUint8(byteOffset++);
            _console$1.log(`byte at offset #${byteOffset - 1}: ${byte}`);
            const messageType = this.#MessageType[byte];
            _console$1.log("messageType?", messageType);
            switch (this.#state) {
                case "start":
                    if (messageType == "startSync") {
                        this.state = "sync";
                    }
                    break;
                case "sync":
                    switch (messageType) {
                        case "continueSync":
                            break;
                        case "logHeader":
                            this.#logBufferFinalLength = dataView.getUint16(byteOffset);
                            this.#logBuffer.length = 0;
                            byteOffset += 2;
                            _console$1.log(`logBufferFinalLength: ${this.#logBufferFinalLength} bytes`);
                            this.state = "logging";
                            break;
                        case "sensorHeader":
                            const sensorType = this.#SensorType[byte];
                            _console$1.assertWithError(sensorType, `invalid sensorId ${byte}`);
                            _console$1.log(`sensor type: "${sensorType}"`);
                            this.#sensorType = sensorType;
                            this.#sensorDataBuffer.length = 0;
                            this.#sensorDataBufferFinalLength = this.#SensorDataLength[this.#sensorType];
                            this.state = "sensor";
                            break;
                        default:
                            //_console.error(`uncaught message in "${this.state}" state`, messageType);
                            this.state = "start";
                            break;
                    }
                    break;
                case "logging":
                    this.#logBuffer.push(byte);
                    _console$1.log(`log buffer length: ${this.#logBuffer.length}/${this.#logBufferFinalLength} bytes`);
                    if (this.#logBuffer.length == this.#logBufferFinalLength) {
                        const log = this.#logBuffer.slice();
                        _console$1.log("log completed", log);
                        this.#dispatchEvent({ type: "log", message: { log } });
                        this.state = "start";
                    }
                    break;
                case "sensor":
                    this.#sensorDataBuffer.push(byte);
                    _console$1.log(
                        `sensor buffer length: ${this.#sensorDataBuffer.length}/${
                            this.#sensorDataBufferFinalLength
                        } bytes`
                    );
                    if (this.#sensorDataBuffer.length == this.#sensorDataBufferFinalLength) {
                        const sensorDataBuffer = this.#sensorDataBuffer.slice();
                        _console$1.log("sensorDataBuffer completed", sensorDataBuffer);
                        const sensorData = new DataView(Uint8Array.from(sensorDataBuffer).buffer);
                        _console$1.log("sensorData", sensorData);
                        this.#parseSensorData(this.#sensorType, sensorDataBuffer);
                    }
                    break;
                default:
                    throw `uncaught state "${this.#state}"`;
            }
        }
    }

    /**
     * @param {BrilliantSoleSensorType} sensorType
     * @throws {Error} if invalid sensorType
     */
    #assertValidSensorType(sensorType) {
        _console$1.assert(sensorType in this.#SensorId, `invalid sensorType "${sensorType}"`);
    }

    /**
     * @param {number} sensorDataRate
     * @throws {Error} if invalid dataRate
     */
    #assertValidSensorDataRate(sensorDataRate) {
        _console$1.assert(sensorDataRate in this.#SensorDataRate, `invalid sensorDataRate "${sensorDataRate}"`);
    }

    /**
     * @param {BrilliantSoleVibrationMotor} vibrationMotor
     * @throws {Error} if invalid dataRate
     */
    #assertValidVibrationMotor(vibrationMotor) {
        _console$1.assert(vibrationMotor in this.#VibrationMotor, `invalid vibrationMotor "${vibrationMotor}"`);
    }

    /**
     *
     * @param {BrilliantSoleSensorType} sensorType
     * @param {number} dataRate
     * @returns {ArrayBuffer} message
     */
    createSetSensorDataRateMessage(sensorType, sensorDataRate) {
        this.#assertValidSensorType(sensorType);
        this.#assertValidSensorDataRate(sensorDataRate);
        const sensorId = this.#SensorId[sensorType];
        const message = Uint8Array.from([this.#CommandType.setSensorDataRate, sensorId, sensorDataRate]);
        return message;
    }

    /**
     * @param {BrilliantSoleVibrationMotor} vibrationMotor
     * @param {number} vibrationStrength
     * @returns {Uint8Array} message
     */
    createSetVibrationStrengthMessage(vibrationMotor, vibrationStrength) {
        this.#assertValidVibrationMotor(vibrationMotor);
        const vibrationMotorBitmask = this.#VibrationMotor[vibrationMotor];
        const message = Uint8Array.from([
            this.#CommandType.setVibrationStrength,
            vibrationMotorBitmask,
            vibrationStrength,
        ]);
        return message;
    }

    /**
     * @param {BrilliantSoleVibrationMotor} vibrationMotor
     * @param {number} duration (ms)
     * @returns {DataView} message
     */
    createTriggerVibrationMessage(vibrationMotor, duration) {
        this.#assertValidVibrationMotor(vibrationMotor);
        const vibrationMotorBitmask = this.#VibrationMotor[vibrationMotor];

        const message = new DataView(new ArrayBuffer(4));
        message.setUint8(0, this.#CommandType.triggerVibration);
        message.setUint8(1, vibrationMotorBitmask);
        message.setUint16(2, duration, true);
        return message;
    }

    /**
     * @param {BrilliantSoleVibrationMotor} vibrationMotor
     * @returns {Uint8Array} message
     */
    createStopVibrationMessage(vibrationMotor) {
        this.#assertValidVibrationMotor(vibrationMotor);
        const vibrationMotorBitmask = this.#VibrationMotor[vibrationMotor];
        const message = Uint8Array.from([this.#CommandType.stopVibration, vibrationMotorBitmask]);
        return message;
    }

    #stopVibrationMessage = Uint8Array.from([this.#CommandType.stopVibration]);
    get stopVibrationMessage() {
        return this.#stopVibrationMessage;
    }

    /**
     *
     * @param {BrilliantSoleSensorType} sensorType
     * @param {DataView} sensorData
     */
    #parseSensorData(sensorType, sensorData) {
        _console$1.assertWithError(sensorType in this.#SensorDataScalar, `no scalar found for sensorType ${sensorType}`);
        this.#SensorDataScalar[sensorType];

        switch (sensorType) {
            case "pressure":
                const rawPressureValues = new Uint16Array(sensorData.buffer);
                _console$1.log("rawPressureValues", rawPressureValues);
                // FILL
                break;
            case "acceleration":
            case "linearAcceleration":
                const rawVectorValues = new Int16Array(sensorData.buffer);
                _console$1.log("rawVectorValues", rawVectorValues);
                // FILL
                break;
            case "quaternion":
                const rawQuaternionValues = new Int16Array(sensorData.buffer);
                _console$1.log("rawQuaternionValues", rawQuaternionValues);
                // FILL
                break;
            default:
                throw new Error(`uncaught sensorType "${sensorType}"`);
        }
    }
}

const _console = createConsole("BrilliantSole", { log: true });

/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherListener} EventDispatcherListener */
/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherOptions} EventDispatcherOptions */
/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherEvent} EventDispatcherEvent */

/** @typedef {import("./connection/ConnectionManager.js").BrilliantSoleConnectionManagerEventType} BrilliantSoleConnectionManagerEventType */
/** @typedef {import("./connection/ConnectionManager.js").BrilliantSoleConnectionStatus} BrilliantSoleConnectionStatus */

/** @typedef {BrilliantSoleConnectionStatus|BrilliantSoleConnectionManagerEventType} BrilliantSoleEventType */
/** @typedef {import("./data/DataManager.js").BrilliantSoleSensorType} BrilliantSoleSensorType */
/** @typedef {import("./data/DataManager.js").BrilliantSoleVibrationMotor} BrilliantSoleVibrationMotor */

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

class BrilliantSole {
    constructor() {
        bindEventListeners(ConnectionManager.EventTypes, this.#boundConnectionManagerEventListeners, this);
        bindEventListeners(DataManager.EventTypes, this.#boundDataManagerEventListeners, this);
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
        return this.connectionManager?.connect();
    }
    get isConnected() {
        return this.connectionManager?.isConnected;
    }
    /** @throws {Error} if not connected */
    #assertIsConnected() {
        _console.assertWithError(this.isConnected, "not connected");
    }

    get canReconnect() {
        return this.connectionManager?.canReconnect;
    }
    async reconnect() {
        return this.connectionManager?.reconnect();
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
        _console.log("isConnected", isConnected);
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

    /**
     * @param {BrilliantSoleSensorType} sensorType
     * @param {number} sensorDataRate an integer between 0 and 6
     */
    async setSensorDataRate(sensorType, sensorDataRate) {
        this.#assertIsConnected();
        _console.log(`setting ${sensorType} sensorDataRate to ${sensorDataRate}...`);
        const message = this.#dataManager.createSetSensorDataRateMessage(sensorType, sensorDataRate);
        await this.connectionManager?.sendCommand(message);
        _console.log("set sensorDataRate");
    }

    /** @type {DataManager} */
    #dataManager = new DataManager();
    /** @type {Object.<string, EventDispatcherListener} */
    #boundDataManagerEventListeners = {};

    /**
     * @private
     * @param {BrilliantSoleEvent} event
     */
    _onData(event) {
        /** @type {DataView} */
        const dataView = event.message.data;

        const array = Array.from(new Uint8Array(dataView.buffer));
        if (![171, 48, 32, 0].includes(array[0])) {
            //_console.log(array[0], array.map(String.fromCharCode).join(""));
            _console.log("data", Array.from(new Uint8Array(dataView.buffer)));
        }
        this.#dataManager.parseData(dataView);
    }

    /**
     * @private
     * @param {BrilliantSoleEvent} event
     */
    _onLog(event) {
        /** @type {number[]} */
        const log = event.message.log;
        _console.log("log", log);
    }

    /**
     * @private
     * @param {BrilliantSoleEvent} event
     */
    _onPressure(event) {
        const pressure = event.message.pressure;
        _console.log("pressure", pressure);
    }
    /**
     * @private
     * @param {BrilliantSoleEvent} event
     */
    _onAcceleration(event) {
        const acceleration = event.message.acceleration;
        _console.log("acceleration", acceleration);
    }
    /**
     * @private
     * @param {BrilliantSoleEvent} event
     */
    _onLinearAcceleration(event) {
        const linearAcceleration = event.message.linearAcceleration;
        _console.log("linearAcceleration", linearAcceleration);
    }
    /**
     * @private
     * @param {BrilliantSoleEvent} event
     */
    _onMagneticRotation(event) {
        const magneticRotation = event.message.magneticRotation;
        _console.log("magneticRotation", magneticRotation);
    }
    /**
     * @private
     * @param {BrilliantSoleEvent} event
     */
    _onQuaternion(event) {
        const quaternion = event.message.quaternion;
        _console.log("quaternion", quaternion);
    }

    /**
     *
     * @param {BrilliantSoleVibrationMotor} vibrationMotor
     * @param {number} vibrationStrength
     */
    async setVibrationStrength(vibrationMotor, vibrationStrength) {
        this.#assertIsConnected();
        const message = this.#dataManager.createSetVibrationStrengthMessage(...arguments);
        _console.log(`setting "${vibrationMotor}" vibration strength to ${vibrationStrength}...`, message);
        await this.connectionManager?.sendCommand(message);
        _console.log("set vibration strength");
    }
    /**
     * @param {BrilliantSoleVibrationMotor} vibrationMotor
     * @param {number} duration (ms)
     */
    async triggerVibration(vibrationMotor, duration) {
        this.#assertIsConnected();
        const message = this.#dataManager.createTriggerVibrationMessage(vibrationMotor, duration);
        _console.log(`triggering "${vibrationMotor}" vibration for ${duration}ms...`, message);
        await this.connectionManager?.sendCommand(message);
        _console.log("triggered vibration");
    }
    /** @param {BrilliantSoleVibrationMotor} vibrationMotor */
    async stopVibration(vibrationMotor) {
        this.#assertIsConnected();
        const message = this.#dataManager.createStopVibrationMessage(vibrationMotor);
        _console.log(`stopping "${vibrationMotor}" vibration...`, message);
        await this.connectionManager?.sendCommand(message);
        _console.log("stopped vibration");
    }
}

BrilliantSole.setConsoleLevelFlagsForType = setConsoleLevelFlagsForType;
BrilliantSole.setAllConsoleLevelFlags = setAllConsoleLevelFlags;

export { BrilliantSole as default };
