/**
 * @copyright Zack Qattan 2024
 * @license MIT
 */
'use strict';

/** @type {"__BRILLIANTSOLE__DEV__" | "__BRILLIANTSOLE__PROD__"} */
const isInDev = "__BRILLIANTSOLE__PROD__" == "__BRILLIANTSOLE__DEV__";

// https://github.com/flexdinesh/browser-or-node/blob/master/src/index.ts
const isInBrowser = typeof window !== "undefined" && window?.document !== "undefined";
const isInNode = typeof process !== "undefined" && process?.versions?.node != null;

const isInBluefy = isInBrowser && navigator.userAgent.includes("Bluefy");
const isInWebBLE = isInBrowser && navigator.userAgent.includes("WebBLE");

isInBrowser && navigator.userAgent.includes("Android");

// console.assert not supported in WebBLE
if (!console.assert) {
    /**
     * @param {boolean} condition
     * @param  {...any} data
     */
    const assert = (condition, ...data) => {
        if (!condition) {
            console.warn(...data);
        }
    };
    console.assert = assert;
}

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
 * @type {Object}
 * @property {boolean} log
 * @property {boolean} warn
 * @property {boolean} error
 * @property {boolean} assert
 */

function emptyFunction() {}

/** @type {LogFunction} */
const log = console.log.bind(console);
/** @type {LogFunction} */
const warn = console.warn.bind(console);
/** @type {LogFunction} */
const error = console.error.bind(console);
/** @type {AssertLogFunction} */
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
        assert: true,
        error: true,
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

    /**
     * @param {any} value
     * @param {string} type
     * @throws {Error} if value's type doesn't match
     */
    assertTypeWithError(value, type) {
        this.assertWithError(typeof value == type, `value ${value} of type "${typeof value}" not of type "${type}"`);
    }

    /**
     * @param {any} value
     * @param {string[]} enumeration
     * @throws {Error} if value's type doesn't match
     */
    assertEnumWithError(value, enumeration) {
        this.assertWithError(enumeration.includes(value), `invalid enum "${value}"`);
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

const _console$j = createConsole("EventDispatcher", { log: false });

/**
 * @typedef EventDispatcherEvent
 * @type {Object}
 * @property {any} target
 * @property {string} type
 * @property {object} message
 */

/**
 * @typedef EventDispatcherOptions
 * @type {Object}
 * @property {boolean?} once
 */

/** @typedef {(event: EventDispatcherEvent) => void} EventDispatcherListener */

// based on https://github.com/mrdoob/eventdispatcher.js/
class EventDispatcher {
    /**
     * @param {object} target
     * @param {string[]?} eventTypes
     */
    constructor(target, eventTypes) {
        _console$j.assertWithError(target, "target is required");
        this.#target = target;
        _console$j.assertWithError(Array.isArray(eventTypes) || eventTypes == undefined, "eventTypes must be an array");
        this.#eventTypes = eventTypes;
    }

    /** @type {any} */
    #target;
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
        _console$j.assertWithError(this.#isValidEventType(type), `invalid event type "${type}"`);
    }

    /** @type {Object.<string, [function]?>?} */
    #listeners;

    /**
     * @param {string} type
     * @param {EventDispatcherListener} listener
     * @param {EventDispatcherOptions?} options
     */
    addEventListener(type, listener, options) {
        _console$j.log(`adding "${type}" eventListener`, listener);
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
     */
    hasEventListener(type, listener) {
        _console$j.log(`has "${type}" eventListener?`, listener);
        this.#assertValidEventType(type);
        return this.#listeners?.[type]?.includes(listener);
    }

    /**
     * @param {string} type
     * @param {EventDispatcherListener} listener
     */
    removeEventListener(type, listener) {
        _console$j.log(`removing "${type}" eventListener`, listener);
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
     */
    dispatchEvent(event) {
        this.#assertValidEventType(event.type);
        if (this.#listeners?.[event.type]) {
            event.target = this.#target;

            // Make a copy, in case listeners are removed while iterating.
            const array = this.#listeners[event.type].slice(0);

            for (let i = 0, l = array.length; i < l; i++) {
                array[i].call(this, event);
            }
        }
    }
}

/**
 * @param {object} target
 * @param {object.<string, EventListener>} boundEventListeners
 */
function addEventListeners(target, boundEventListeners) {
    let addEventListener = target.addEventListener || target.addListener || target.on;
    _console$j.assertWithError(addEventListener, "no add listener function found tor target");
    addEventListener = addEventListener.bind(target);
    Object.entries(boundEventListeners).forEach(([eventType, eventListener]) => {
        addEventListener(eventType, eventListener);
    });
}

/**
 * @param {object} target
 * @param {object.<string, EventListener>} boundEventListeners
 */
function removeEventListeners(target, boundEventListeners) {
    let removeEventListener = target.removeEventListener || target.removeListener;
    _console$j.assertWithError(removeEventListener, "no remove listener function found tor target");
    removeEventListener = removeEventListener.bind(target);
    Object.entries(boundEventListeners).forEach(([eventType, eventListener]) => {
        removeEventListener(eventType, eventListener);
    });
}

/** @typedef {"webBluetooth" | "noble" | "webSocketClient"} ConnectionType */
/** @typedef {"not connected" | "connecting" | "connected" | "disconnecting"} ConnectionStatus */
/** @typedef {"manufacturerName" | "modelNumber" | "softwareRevision" | "hardwareRevision" | "firmwareRevision" | "pnpId" | "serialNumber" | "batteryLevel" | "getName" | "setName" | "getType" | "setType" | "getSensorConfiguration" | "setSensorConfiguration" | "sensorData" | "triggerVibration"} ConnectionMessageType */

const _console$i = createConsole("ConnectionManager");

/**
 * @callback ConnectionStatusCallback
 * @param {ConnectionStatus} status
 */

/**
 * @callback MessageReceivedCallback
 * @param {ConnectionMessageType} messageType
 * @param {DataView} data
 */

class ConnectionManager {
    /** @type {ConnectionStatusCallback?} */
    onStatusUpdated;
    /** @type {MessageReceivedCallback?} */
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

    /** @type {ConnectionType} */
    static get type() {
        this.#staticThrowNotImplementedError("type");
    }
    /** @type {ConnectionType} */
    get type() {
        return this.constructor.type;
    }

    /** @throws {Error} if not supported */
    #assertIsSupported() {
        _console$i.assertWithError(this.isSupported, `${this.constructor.name} is not supported`);
    }

    /** @throws {Error} if abstract class */
    #assertIsSubclass() {
        _console$i.assertWithError(this.constructor != ConnectionManager, `${this.constructor.name} must be subclassed`);
    }

    constructor() {
        this.#assertIsSubclass();
        this.#assertIsSupported();
    }

    /** @type {ConnectionStatus} */
    #status = "not connected";
    get status() {
        return this.#status;
    }
    /** @protected */
    set status(newConnectionStatus) {
        _console$i.assertTypeWithError(newConnectionStatus, "string");
        if (this.#status == newConnectionStatus) {
            _console$i.warn("same connection status");
            return;
        }
        _console$i.log(`new connection status "${newConnectionStatus}"`);
        this.#status = newConnectionStatus;
        this.onStatusUpdated?.(this.status);
    }

    get isConnected() {
        return this.status == "connected";
    }

    /** @throws {Error} if connected */
    #assertIsNotConnected() {
        _console$i.assertWithError(!this.isConnected, "device is already connected");
    }
    /** @throws {Error} if connecting */
    #assertIsNotConnecting() {
        _console$i.assertWithError(this.status != "connecting", "device is already connecting");
    }
    /** @throws {Error} if not connected */
    #assertIsConnected() {
        _console$i.assertWithError(this.isConnected, "device is not connected");
    }
    /** @throws {Error} if disconnecting */
    #assertIsNotDisconnecting() {
        _console$i.assertWithError(this.status != "disconnecting", "device is already disconnecting");
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
        _console$i.assert(this.canReconnect, "unable to reconnect");
        this.status = "connecting";
    }
    async disconnect() {
        this.#assertIsConnected();
        this.#assertIsNotDisconnecting();
        this.status = "disconnecting";
    }

    /**
     * @param {ConnectionMessageType} messageType
     * @param {DataView|ArrayBuffer} data
     */
    async sendMessage(messageType, data) {
        this.#assertIsConnectedAndNotDisconnecting();
        _console$i.log("sending message", { messageType, data });
    }
}

if (isInNode) {
    const webbluetooth = require("webbluetooth");
    var BluetoothUUID = webbluetooth.BluetoothUUID;
}
if (isInBrowser) {
    var BluetoothUUID = window.BluetoothUUID;
}

/**
 * @param {number} offset
 * @returns {BluetoothServiceUUID}
 */
function generateBluetoothUUID(offset) {
    return `ea6da725-2000-4f9b-893d-${(0xc3913e33b3e3 + offset).toString("16")}`;
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

/** @typedef {"deviceInformation" | "battery" | "main" | "dfu"} BluetoothServiceName */
/** @typedef { "manufacturerName" | "modelNumber" | "hardwareRevision" | "firmwareRevision" | "softwareRevision" | "pnpId" | "serialNumber" | "batteryLevel" | "name" | "type" | "sensorConfiguration" | "sensorData" | "vibration"} BluetoothCharacteristicName */

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
                pnpId: {
                    uuid: stringToCharacteristicUUID("pnp_id"),
                },
                serialNumber: {
                    uuid: stringToCharacteristicUUID("serial_number_string"),
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
        main: {
            uuid: generateBluetoothUUID(0),
            characteristics: {
                name: { uuid: generateBluetoothUUID(1) },
                type: { uuid: generateBluetoothUUID(2) },
                sensorConfiguration: { uuid: generateBluetoothUUID(3) },
                sensorData: { uuid: generateBluetoothUUID(4) },
                vibration: { uuid: generateBluetoothUUID(5) },
            },
        },
        dfu: {
            uuid: "8d53dc1d-1db7-4cd3-868b-8a527460aa84",
        },
    },

    /** @type {BluetoothServiceUUID[]} */
    get serviceUUIDs() {
        return [this.services.main.uuid];
    },

    /** @type {BluetoothServiceUUID[]} */
    get optionalServiceUUIDs() {
        return [this.services.deviceInformation.uuid, this.services.battery.uuid];
    },

    /**
     * @param {BluetoothServiceUUID} serviceUUID
     * @returns {BluetoothServiceName?}
     */
    getServiceNameFromUUID(serviceUUID) {
        serviceUUID = serviceUUID.toLowerCase();
        return Object.entries(this.services).find(([serviceName, serviceInfo]) => {
            let serviceInfoUUID = serviceInfo.uuid;
            if (serviceUUID.length == 4) {
                serviceInfoUUID = serviceInfoUUID.slice(4, 8);
            }
            return serviceUUID == serviceInfoUUID;
        })?.[0];
    },

    /**
     * @param {BluetoothCharacteristicUUID} characteristicUUID
     * @returns {BluetoothCharacteristicName?}
     */
    getCharacteristicNameFromUUID(characteristicUUID) {
        characteristicUUID = characteristicUUID.toLowerCase();
        var characteristicName;
        Object.values(this.services).some((serviceInfo) => {
            characteristicName = Object.entries(serviceInfo.characteristics).find(
                ([characteristicName, characteristicInfo]) => {
                    let characteristicInfoUUID = characteristicInfo.uuid;
                    if (characteristicUUID.length == 4) {
                        characteristicInfoUUID = characteristicInfoUUID.slice(4, 8);
                    }
                    return characteristicUUID == characteristicInfoUUID;
                }
            )?.[0];
            return characteristicName;
        });
        return characteristicName;
    },
});

const serviceUUIDs = bluetoothUUIDs.serviceUUIDs;
const optionalServiceUUIDs = bluetoothUUIDs.optionalServiceUUIDs;

/** @param {BluetoothServiceUUID} serviceUUID */
function getServiceNameFromUUID(serviceUUID) {
    return bluetoothUUIDs.getServiceNameFromUUID(serviceUUID);
}

/** @param {BluetoothCharacteristicUUID} characteristicUUID */
function getCharacteristicNameFromUUID(characteristicUUID) {
    return bluetoothUUIDs.getCharacteristicNameFromUUID(characteristicUUID);
}

/**
 * @param {BluetoothCharacteristicName} characteristicName
 * @returns {BluetoothCharacteristicProperties}
 */
function getCharacteristicProperties(characteristicName) {
    /** @type {BluetoothCharacteristicProperties} */
    const properties = {
        broadcast: false,
        read: true,
        writeWithoutResponse: false,
        write: false,
        notify: false,
        indicate: false,
        authenticatedSignedWrites: false,
        reliableWrite: false,
        writableAuxiliaries: false,
    };

    // read
    switch (characteristicName) {
        case "vibration":
        case "sensorData":
            properties.read = false;
            break;
    }

    // notify
    switch (characteristicName) {
        case "batteryLevel":
        case "sensorData":
            properties.notify = true;
            break;
    }

    // write
    switch (characteristicName) {
        case "name":
        case "type":
        case "sensorConfiguration":
        case "vibration":
            properties.write = true;
            properties.writeWithoutResponse = true;
            properties.reliableWrite = true;
            break;
    }

    return properties;
}

const _console$h = createConsole("WebBluetoothConnectionManager", { log: false });






if (isInNode) {
    const webbluetooth = require("webbluetooth");
    const { bluetooth } = webbluetooth;
    var navigator$1 = { bluetooth };
}
if (isInBrowser) {
    var navigator$1 = window.navigator;
}

class WebBluetoothConnectionManager extends ConnectionManager {
    /** @type {Object.<string, EventListener} */
    #boundBluetoothCharacteristicEventListeners = {
        characteristicvaluechanged: this.#onCharacteristicvaluechanged.bind(this),
    };
    /** @type {Object.<string, EventListener} */
    #boundBluetoothDeviceEventListeners = {
        gattserverdisconnected: this.#onGattserverdisconnected.bind(this),
    };

    static get isSupported() {
        return "bluetooth" in navigator$1;
    }
    /** @type {import("../ConnectionManager.js").ConnectionType} */
    static get type() {
        return "webBluetooth";
    }

    /** @type {BluetoothDevice?} */
    #device;
    get device() {
        return this.#device;
    }
    set device(newDevice) {
        if (this.#device == newDevice) {
            _console$h.warn("tried to assign the same BluetoothDevice");
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

    /** @type {Map.<BluetoothServiceName, BluetoothRemoteGATTService} */
    #services = new Map();
    /** @type {Map.<BluetoothCharacteristicName, BluetoothRemoteGATTCharacteristic} */
    #characteristics = new Map();

    async connect() {
        await super.connect();

        try {
            const device = await navigator$1.bluetooth.requestDevice({
                filters: [{ services: serviceUUIDs }],
                optionalServices: isInBrowser ? optionalServiceUUIDs : [],
            });

            _console$h.log("got BluetoothDevice");
            this.device = device;

            _console$h.log("connecting to device...");
            const server = await this.device.gatt.connect();
            _console$h.log(`connected to device? ${server.connected}`);

            await this.#getServicesAndCharacteristics();

            _console$h.log("fully connected");

            this.status = "connected";
        } catch (error) {
            _console$h.error(error);
            this.status = "not connected";
            this.server?.disconnect();
            this.#removeEventListeners();
        }
    }
    async #getServicesAndCharacteristics() {
        this.#removeEventListeners();

        _console$h.log("getting services...");
        const services = await this.server.getPrimaryServices();
        _console$h.log("got services", services.length);

        _console$h.log("getting characteristics...");
        for (const serviceIndex in services) {
            const service = services[serviceIndex];
            const serviceName = getServiceNameFromUUID(service.uuid);
            _console$h.assertWithError(serviceName, `no name found for service uuid "${service.uuid}"`);
            _console$h.log(`got "${serviceName}" service`);
            if (serviceName == "dfu") {
                _console$h.log("skipping dfu service");
                continue;
            }
            service._name = serviceName;
            this.#services.set(serviceName, service);
            _console$h.log(`getting characteristics for "${serviceName}" service`);
            const characteristics = await service.getCharacteristics();
            _console$h.log(`got characteristics for "${serviceName}" service`);
            for (const characteristicIndex in characteristics) {
                const characteristic = characteristics[characteristicIndex];
                const characteristicName = getCharacteristicNameFromUUID(characteristic.uuid);
                _console$h.assertWithError(
                    characteristicName,
                    `no name found for characteristic uuid "${characteristic.uuid}" in "${serviceName}" service`
                );
                _console$h.log(`got "${characteristicName}" characteristic in "${serviceName}" service`);
                characteristic._name = characteristicName;
                this.#characteristics.set(characteristicName, characteristic);
                addEventListeners(characteristic, this.#boundBluetoothCharacteristicEventListeners);
                const characteristicProperties =
                    characteristic.properties || getCharacteristicProperties(characteristicName);
                if (characteristicProperties.read) {
                    _console$h.log(`reading "${characteristicName}" characteristic...`);
                    await characteristic.readValue();
                    if (isInBluefy || isInWebBLE) {
                        this.#onCharacteristicValueChanged(characteristic);
                    }
                }
                if (characteristicProperties.notify) {
                    _console$h.log(`starting notifications for "${characteristicName}" characteristic`);
                    await characteristic.startNotifications();
                }
            }
        }
    }
    #removeEventListeners() {
        if (this.device) {
            removeEventListeners(this.device, this.#boundBluetoothDeviceEventListeners);
        }
        this.#characteristics.forEach((characteristic) => {
            removeEventListeners(characteristic, this.#boundBluetoothCharacteristicEventListeners);
        });
    }
    async disconnect() {
        await super.disconnect();
        _console$h.log("disconnecting from device...");
        this.server?.disconnect();
        this.#removeEventListeners();
        this.status = "not connected";
    }

    /** @param {Event} event */
    #onCharacteristicvaluechanged(event) {
        _console$h.log("oncharacteristicvaluechanged");

        /** @type {BluetoothRemoteGATTCharacteristic} */
        const characteristic = event.target;

        this.#onCharacteristicValueChanged(characteristic);
    }

    /** @param {BluetoothRemoteGATTCharacteristic} characteristic */
    #onCharacteristicValueChanged(characteristic) {
        _console$h.log("onCharacteristicValue");

        /** @type {BluetoothCharacteristicName} */
        const characteristicName = characteristic._name;
        _console$h.assertWithError(
            characteristicName,
            `no name found for characteristic with uuid "${characteristic.uuid}"`
        );

        _console$h.log(`oncharacteristicvaluechanged for "${characteristicName}" characteristic`);
        const dataView = characteristic.value;
        _console$h.assertWithError(dataView, `no data found for "${characteristicName}" characteristic`);
        _console$h.log(`data for "${characteristicName}" characteristic`, Array.from(new Uint8Array(dataView.buffer)));

        switch (characteristicName) {
            case "manufacturerName":
                this.onMessageReceived("manufacturerName", dataView);
                break;
            case "modelNumber":
                this.onMessageReceived("modelNumber", dataView);
                break;
            case "softwareRevision":
                this.onMessageReceived("softwareRevision", dataView);
                break;
            case "hardwareRevision":
                this.onMessageReceived("hardwareRevision", dataView);
                break;
            case "firmwareRevision":
                this.onMessageReceived("firmwareRevision", dataView);
                break;
            case "pnpId":
                this.onMessageReceived("pnpId", dataView);
                break;
            case "serialNumber":
                this.onMessageReceived("serialNumber", dataView);
                break;
            case "batteryLevel":
                this.onMessageReceived("batteryLevel", dataView);
                break;
            case "name":
                this.onMessageReceived("getName", dataView);
                break;
            case "type":
                this.onMessageReceived("getType", dataView);
                break;
            case "sensorConfiguration":
                this.onMessageReceived("getSensorConfiguration", dataView);
                break;
            case "sensorData":
                this.onMessageReceived("sensorData", dataView);
                break;
            default:
                throw new Error(`uncaught characteristicName "${characteristicName}"`);
        }
    }

    /** @param {Event} event */
    #onGattserverdisconnected(event) {
        _console$h.log("gattserverdisconnected");
        this.status = "not connected";
    }

    /**
     * @param {ConnectionMessageType} messageType
     * @param {DataView|ArrayBuffer} data
     */
    async sendMessage(messageType, data) {
        await super.sendMessage(...arguments);
        /** @type {BluetoothRemoteGATTCharacteristic} */
        let characteristic;
        /** @type {BluetoothCharacteristicName} */
        let characteristicName;
        switch (messageType) {
            case "setName":
                characteristicName = "name";
                characteristic = this.#characteristics.get(characteristicName);
                break;
            case "setType":
                characteristicName = "type";
                characteristic = this.#characteristics.get(characteristicName);
                break;
            case "setSensorConfiguration":
                characteristicName = "sensorConfiguration";
                characteristic = this.#characteristics.get(characteristicName);
                break;
            case "triggerVibration":
                characteristicName = "vibration";
                characteristic = this.#characteristics.get(characteristicName);
                break;
            default:
                throw Error(`uncaught messageType "${messageType}"`);
        }

        _console$h.assert(characteristic, "no characteristic found");
        await characteristic.writeValueWithResponse(data);
        const characteristicProperties = characteristic.properties || getCharacteristicProperties(characteristicName);
        if (characteristicProperties.read) {
            await characteristic.readValue();
        }
    }

    /** @type {boolean} */
    get canReconnect() {
        return this.server && !this.server.connected;
    }
    async reconnect() {
        await super.reconnect();
        _console$h.log("attempting to reconnect...");
        await this.server.connect();
        if (this.isConnected) {
            _console$h.log("successfully reconnected!");
            await this.#getServicesAndCharacteristics();
            this.status = "connected";
        } else {
            _console$h.log("unable to reconnect");
            this.status = "not connected";
        }
    }
}

const _console$g = createConsole("NobleConnectionManager", { log: true });

if (isInNode) {
    require("@abandonware/noble");
}






class NobleConnectionManager extends ConnectionManager {
    static get isSupported() {
        return isInNode;
    }
    /** @type {import("../ConnectionManager.js").ConnectionType} */
    static get type() {
        return "noble";
    }

    get isConnected() {
        // FILL
        return false;
    }

    async connect() {
        await super.connect();
        // FILL
    }
    async disconnect() {
        await super.disconnect();
        _console$g.log("disconnecting from device...");
        // FILL
    }

    /**
     * @param {ConnectionMessageType} messageType
     * @param {DataView|ArrayBuffer} data
     */
    async sendMessage(messageType, data) {
        await super.sendMessage(...arguments);
        switch (messageType) {
            case "setName":
                // FILL
                break;
            case "setType":
                // FILL
                break;
            case "setSensorConfiguration":
                // FILL
                break;
            case "triggerVibration":
                // FILL
                break;
            default:
                throw Error(`uncaught messageType "${messageType}"`);
        }
    }

    /** @type {boolean} */
    get canReconnect() {
        // FILL
        return false;
    }
    async reconnect() {
        await super.reconnect();
        _console$g.log("attempting to reconnect...");
        // FILL
    }

    // NOBLE
    /** @type {noble.Peripheral?} */
    #noblePeripheral;
    get noblePeripheral() {
        return this.#noblePeripheral;
    }
    set noblePeripheral(newNoblePeripheral) {
        _console$g.assertTypeWithError(newNoblePeripheral, "object");
        if (this.noblePeripheral == newNoblePeripheral) {
            _console$g.log("attempted to assign duplicate noblePeripheral");
            return;
        }

        _console$g.log({ newNoblePeripheral });

        if (this.#noblePeripheral) {
            removeEventListeners(this.#noblePeripheral, this.#unboundNoblePeripheralListeners);
            delete this.#noblePeripheral._device;
        }

        if (newNoblePeripheral) {
            newNoblePeripheral._device = this;
            addEventListeners(newNoblePeripheral, this.#unboundNoblePeripheralListeners);
        }

        this.#noblePeripheral = newNoblePeripheral;
    }

    // NOBLE EVENTLISTENERS
    #unboundNoblePeripheralListeners = {
        connect: this.#onNoblePeripheralConnect,
        disconnect: this.#onNoblePeripheralDisconnect,
        rssiUpdate: this.#onNoblePeripheralRssiUpdate,
        servicesDiscover: this.#onNoblePeripheralServicesDiscover,
    };

    #onNoblePeripheralConnect() {
        this._device.onNoblePeripheralConnect(this);
    }
    /** @param {noble.Peripheral} noblePeripheral */
    onNoblePeripheralConnect(noblePeripheral) {
        _console$g.log("onNoblePeripheralConnect", noblePeripheral);
    }

    #onNoblePeripheralDisconnect() {
        this._device.onNoblePeripheralConnect(this);
    }
    /** @param {noble.Peripheral} noblePeripheral */
    onNoblePeripheralDisconnect(noblePeripheral) {
        _console$g.log("onNoblePeripheralDisconnect", noblePeripheral);
        // FILL
    }

    /** @param {number} rssi */
    #onNoblePeripheralRssiUpdate(rssi) {
        this._device.onNoblePeripheralRssiUpdate(this, rssi);
        // FILL
    }
    /**
     * @param {noble.Peripheral} noblePeripheral
     * @param {number} rssi
     */
    onNoblePeripheralRssiUpdate(noblePeripheral, rssi) {
        _console$g.log("onNoblePeripheralRssiUpdate", noblePeripheral, rssi);
        // FILL
    }

    /** @param {noble.Service[]} services */
    #onNoblePeripheralServicesDiscover(services) {
        this._device.onNoblePeripheralServicesDiscover(this, services);
    }
    /**
     *
     * @param {noble.Peripheral} noblePeripheral
     * @param {noble.Service[]} services
     */
    onNoblePeripheralServicesDiscover(noblePeripheral, services) {
        _console$g.log("onNoblePeripheralServicesDiscover", noblePeripheral, services);
        // FILL
    }
}

/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 */
function getInterpolation(value, min, max) {
    return (value - min) / (max - min);
}

const Uint16Max = 2 ** 16;

/**
 * @typedef Range
 * @type {Object}
 * @property {number} min
 * @property {number} max
 */

/** @type {Range} */
const initialRange = { min: Infinity, max: -Infinity };

class RangeHelper {
    /** @type {Range} */
    #range = Object.assign({}, initialRange);

    reset() {
        Object.assign(this.#range, initialRange);
    }

    /** @param {number} value */
    update(value) {
        this.#range.min = Math.min(value, this.#range.min);
        this.#range.max = Math.max(value, this.#range.max);
    }

    /** @param {number} value */
    getNormalization(value) {
        return getInterpolation(value, this.#range.min, this.#range.max) || 0;
    }

    /** @param {number} value */
    updateAndGetNormalization(value) {
        this.update(value);
        return this.getNormalization(value);
    }
}

/**
 * @typedef Vector2
 * @type {Object}
 * @property {number} x
 * @property {number} y
 */

/** @typedef {Vector2} CenterOfPressure */

/**
 * @typedef CenterOfPressureRange
 * @type {Object}
 * @property {RangeHelper} x
 * @property {RangeHelper} y
 */

class CenterOfPressureHelper {
    /** @type {CenterOfPressureRange} */
    #range = {
        x: new RangeHelper(),
        y: new RangeHelper(),
    };
    reset() {
        this.#range.x.reset();
        this.#range.y.reset();
    }

    /** @param {CenterOfPressure} centerOfPressure  */
    update(centerOfPressure) {
        this.#range.x.update(centerOfPressure.x);
        this.#range.y.update(centerOfPressure.y);
    }
    /**
     * @param {CenterOfPressure} centerOfPressure
     * @returns {CenterOfPressure}
     */
    getNormalization(centerOfPressure) {
        return {
            x: this.#range.x.getNormalization(centerOfPressure.x),
            y: this.#range.y.getNormalization(centerOfPressure.y),
        };
    }

    /** @param {CenterOfPressure} centerOfPressure  */
    updateAndGetNormalization(centerOfPressure) {
        this.update(centerOfPressure);
        return this.getNormalization(centerOfPressure);
    }
}

/**
 * @param {number} arrayLength
 * @param {((index:number) => any) | object} objectOrCallback
 */
function createArray(arrayLength, objectOrCallback) {
    return new Array(arrayLength).fill(1).map((_, index) => {
        if (typeof objectOrCallback == "function") {
            const callback = objectOrCallback;
            return callback(index);
        } else {
            const object = objectOrCallback;
            return Object.assign({}, object);
        }
    });
}

/** @typedef {"hallux" | "digits" | "innerMetatarsal" | "centerMetatarsal" | "outerMetatarsal" | "arch" | "lateral" | "heel"} PressureSensorName */
/** @typedef {"pressure"} PressureSensorType */

/**
 * @typedef Vector2
 * @type {Object}
 * @property {number} x
 * @property {number} y
 */

/** @typedef {Vector2} PressureSensorPosition */



/**
 * @typedef PressureSensorValue
 * @type {Object}
 * @property {PressureSensorName} name
 * @property {PressureSensorPosition} position
 * @property {number} rawValue
 * @property {number} normalizedValue
 * @property {number?} weightedValue
 */

/**
 * @typedef PressureData
 * @type {Object}
 * @property {PressureSensorValue[]} sensors
 *
 * @property {number} rawSum
 * @property {number} normalizedSum
 *
 * @property {CenterOfPressure?} center
 * @property {CenterOfPressure?} normalizedCenter
 */

const _console$f = createConsole("PressureSensorDataManager", { log: true });

class PressureSensorDataManager {
    /** @type {DeviceType} */
    #deviceType;
    get deviceType() {
        return this.#deviceType;
    }
    set deviceType(newDeviceType) {
        _console$f.assertTypeWithError(newDeviceType, "string");
        if (this.#deviceType == newDeviceType) {
            _console$f.warn(`redundant deviceType assignment "${newDeviceType}"`);
            return;
        }
        _console$f.log({ newDeviceType });
        this.#deviceType = newDeviceType;

        this.#updatePressureSensorPositions();
        this.resetRange();
    }

    /** @type {PressureSensorName[]} */
    static #Names = [
        "hallux",
        "digits",
        "innerMetatarsal",
        "centerMetatarsal",
        "outerMetatarsal",
        "arch",
        "lateral",
        "heel",
    ];
    static get Names() {
        return this.#Names;
    }
    get names() {
        return PressureSensorDataManager.Names;
    }

    static #Scalars = {
        pressure: 2 ** -16,
    };
    static get Scalars() {
        return this.#Scalars;
    }
    get scalars() {
        return PressureSensorDataManager.Scalars;
    }

    static #NumberOfPressureSensors = 8;
    static get NumberOfPressureSensors() {
        return this.#NumberOfPressureSensors;
    }
    get numberOfPressureSensors() {
        return PressureSensorDataManager.NumberOfPressureSensors;
    }

    /**
     * positions the right insole (top to bottom) - mirror horizontally for the left insole.
     *
     * xy positions are the centers of each sensor in the .svg file (y is from the top)
     * @type {PressureSensorPosition[]}
     */
    static #PressureSensorPositions = [
        { x: 110, y: 73 },
        { x: 250, y: 155 },
        { x: 56, y: 236 },
        { x: 185, y: 277 },
        { x: 305, y: 337 },
        { x: 69, y: 584 },
        { x: 285, y: 635 },
        { x: 162, y: 914 },
    ].map(({ x, y }) => ({ x: x / 365, y: 1 - y / 1000 }));
    static get PressureSensorPositions() {
        return this.#PressureSensorPositions;
    }
    /** @type {PressureSensorPosition[]} */
    #pressureSensorPositions;
    get pressureSensorPositions() {
        return this.#pressureSensorPositions;
    }
    #updatePressureSensorPositions() {
        const pressureSensorPositions = PressureSensorDataManager.PressureSensorPositions.map(({ x, y }) => {
            if (this.deviceType == "leftInsole") {
                x = 1 - x;
            }
            return { x, y };
        });
        _console$f.log({ pressureSensorPositions });
        this.#pressureSensorPositions = pressureSensorPositions;
    }

    /** @type {RangeHelper[]} */
    #pressureSensorRangeHelpers = createArray(this.numberOfPressureSensors, () => new RangeHelper());
    // FILL -

    #centerOfPressureHelper = new CenterOfPressureHelper();
    resetRange() {
        this.#pressureSensorRangeHelpers.forEach((rangeHelper) => rangeHelper.reset());
        this.#centerOfPressureHelper.reset();
    }

    /**
     * @param {DataView} dataView
     * @param {number} byteOffset
     */
    parsePressure(dataView, byteOffset) {
        this.scalars.pressure;

        /** @type {PressureData} */
        const pressure = { sensors: [], rawSum: 0, normalizedSum: 0 };
        for (let index = 0; index < this.numberOfPressureSensors; index++, byteOffset += 2) {
            const rawValue = dataView.getUint16(byteOffset, true);
            const rangeHelper = this.#pressureSensorRangeHelpers[index];
            const normalizedValue = rangeHelper.updateAndGetNormalization(rawValue);
            const position = this.pressureSensorPositions[index];
            const name = this.names[index];
            pressure.sensors[index] = { rawValue, normalizedValue, position, name };

            pressure.rawSum += rawValue;
            pressure.normalizedSum = normalizedValue / this.numberOfPressureSensors;
        }

        if (pressure.rawSum > 0) {
            pressure.center = { x: 0, y: 0 };
            pressure.sensors.forEach((sensor) => {
                sensor.weightedValue = sensor.rawValue / pressure.rawSum;
                pressure.center.x += sensor.position.x * sensor.weightedValue;
                pressure.center.y += sensor.position.y * sensor.weightedValue;
            });
            pressure.normalizedCenter = this.#centerOfPressureHelper.updateAndGetNormalization(pressure.center);
        }

        _console$f.log({ pressure });
        return pressure;
    }
}

/** @typedef {"acceleration" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation"} MotionSensorType */

const _console$e = createConsole("MotionSensorDataManager", { log: true });

/**
 * @typedef Vector3
 * @type {Object}
 * @property {number} x
 * @property {number} y
 * @property {number} z
 */

/**
 * @typedef Quaternion
 * @type {Object}
 * @property {number} x
 * @property {number} y
 * @property {number} z
 * @property {number} w
 */

class MotionSensorDataManager {
    /** @type {DeviceType} */
    #deviceType;
    get deviceType() {
        return this.#deviceType;
    }
    set deviceType(newDeviceType) {
        _console$e.assertTypeWithError(newDeviceType, "string");
        if (this.#deviceType == newDeviceType) {
            _console$e.warn(`redundant deviceType assignment "${newDeviceType}"`);
            return;
        }
        _console$e.log({ newDeviceType });
        this.#deviceType = newDeviceType;
    }

    static #Scalars = {
        acceleration: 2 ** -12,
        gravity: 2 ** -12,
        linearAcceleration: 2 ** -12,

        gyroscope: 2000 * 2 ** -15,

        magnetometer: 2500 * 2 ** -15,

        gameRotation: 2 ** -14,
        rotation: 2 ** -14,
    };
    static get Scalars() {
        return this.#Scalars;
    }
    get scalars() {
        return MotionSensorDataManager.Scalars;
    }

    static #Vector3Size = 3 * 2;
    static get Vector3Size() {
        return this.#Vector3Size;
    }
    get vector3Size() {
        return MotionSensorDataManager.Vector3Size;
    }

    /**
     * @param {DataView} dataView
     * @param {number} byteOffset
     * @param {MotionSensorType} sensorType
     * @returns {Vector3}
     */
    parseVector3(dataView, byteOffset, sensorType) {
        let [x, y, z] = [
            dataView.getInt16(byteOffset, true),
            dataView.getInt16(byteOffset + 2, true),
            dataView.getInt16(byteOffset + 4, true),
        ].map((value) => value * this.scalars[sensorType]);

        const vector = { x, y, z };

        _console$e.log({ vector });
        return vector;
    }

    static #QuaternionSize = 4 * 2;
    static get QuaternionSize() {
        return this.#QuaternionSize;
    }
    get quaternionSize() {
        return MotionSensorDataManager.QuaternionSize;
    }

    /**
     * @param {DataView} dataView
     * @param {number} byteOffset
     * @param {MotionSensorType} sensorType
     * @returns {Quaternion}
     */
    parseQuaternion(dataView, byteOffset, sensorType) {
        let [x, y, z, w] = [
            dataView.getInt16(byteOffset, true),
            dataView.getInt16(byteOffset + 2, true),
            dataView.getInt16(byteOffset + 4, true),
            dataView.getInt16(byteOffset + 6, true),
        ].map((value) => value * this.scalars[sensorType]);

        const quaternion = { x, y, z, w };

        _console$e.log({ quaternion });
        return quaternion;
    }
}

/** @typedef {"barometer"} BarometerSensorType */

createConsole("BarometerSensorDataManager", { log: true });

class BarometerSensorDataManager {
    static #Scalars = {
        barometer: 100 * 2 ** -7,
    };
    static get Scalars() {
        return this.#Scalars;
    }
    get scalars() {
        return BarometerSensorDataManager.Scalars;
    }
}

const _console$d = createConsole("SensorDataManager", { log: true });







/** @typedef {MotionSensorType | PressureSensorType | BarometerSensorType} SensorType */

/**
 * @callback SensorDataCallback
 * @param {SensorType} sensorType
 * @param {Object} data
 * @param {number} data.timestamp
 */

class SensorDataManager {
    /** @type {DeviceType} */
    #deviceType;
    get deviceType() {
        return this.#deviceType;
    }
    set deviceType(newDeviceType) {
        _console$d.assertTypeWithError(newDeviceType, "string");
        if (this.#deviceType == newDeviceType) {
            _console$d.warn(`redundant deviceType assignment "${newDeviceType}"`);
            return;
        }
        _console$d.log({ newDeviceType });
        this.#deviceType = newDeviceType;

        this.pressureSensorDataManager.deviceType = newDeviceType;
        this.motionSensorDataManager.deviceType = newDeviceType;
    }

    pressureSensorDataManager = new PressureSensorDataManager();
    motionSensorDataManager = new MotionSensorDataManager();
    barometerSensorDataManager = new BarometerSensorDataManager();

    /** @type {SensorType[]} */
    static #Types = [
        "pressure",
        "acceleration",
        "gravity",
        "linearAcceleration",
        "gyroscope",
        "magnetometer",
        "gameRotation",
        "rotation",
        "barometer",
    ];
    static get Types() {
        return this.#Types;
    }
    get #types() {
        return SensorDataManager.Types;
    }

    /** @param {string} sensorType */
    static AssertValidSensorType(sensorType) {
        _console$d.assertTypeWithError(sensorType, "string");
        _console$d.assertWithError(this.#Types.includes(sensorType), `invalid sensorType "${sensorType}"`);
    }
    /** @param {number} sensorTypeEnum */
    static AssertValidSensorTypeEnum(sensorTypeEnum) {
        _console$d.assertTypeWithError(sensorTypeEnum, "number");
        _console$d.assertWithError(sensorTypeEnum in this.#Types, `invalid sensorTypeEnum ${sensorTypeEnum}`);
    }

    /** @type {SensorDataCallback?} */
    onDataReceived;

    #timestampOffset = 0;
    #lastRawTimestamp = 0;
    clearTimestamp() {
        _console$d.log("clearing sensorDataManager timestamp data");
        this.#timestampOffset = 0;
        this.#lastRawTimestamp = 0;
    }

    /** @param {DataView} dataView */
    #parseTimestamp(dataView, byteOffset) {
        const rawTimestamp = dataView.getUint16(byteOffset, true);
        if (rawTimestamp < this.#lastRawTimestamp) {
            this.#timestampOffset += Uint16Max;
        }
        this.#lastRawTimestamp = rawTimestamp;
        const timestamp = rawTimestamp + this.#timestampOffset;
        return timestamp;
    }

    /** @param {DataView} dataView */
    parse(dataView) {
        _console$d.log("sensorData", Array.from(new Uint8Array(dataView.buffer)));

        let byteOffset = 0;
        const timestamp = this.#parseTimestamp(dataView, byteOffset);
        byteOffset += 2;

        while (byteOffset < dataView.byteLength) {
            const sensorTypeEnum = dataView.getUint8(byteOffset++);
            SensorDataManager.AssertValidSensorTypeEnum(sensorTypeEnum);

            let value;

            const sensorTypeDataSize = dataView.getUint8(byteOffset++);
            const sensorType = this.#types[sensorTypeEnum];

            _console$d.log({ sensorTypeEnum, sensorType, sensorTypeDataSize });
            switch (sensorType) {
                case "pressure":
                    value = this.pressureSensorDataManager.parsePressure(dataView, byteOffset);
                    break;
                case "acceleration":
                case "gravity":
                case "linearAcceleration":
                case "gyroscope":
                case "magnetometer":
                    value = this.motionSensorDataManager.parseVector3(dataView, byteOffset, sensorType);
                    break;
                case "gameRotation":
                case "rotation":
                    value = this.motionSensorDataManager.parseQuaternion(dataView, byteOffset, sensorType);
                    break;
                case "barometer":
                    // FILL
                    break;
                default:
                    _console$d.error(`uncaught sensorType "${sensorType}"`);
            }

            byteOffset += sensorTypeDataSize;

            _console$d.assertWithError(value, `no value defined for sensorType "${sensorType}"`);
            this.onDataReceived?.(sensorType, { timestamp, [sensorType]: value });
        }
    }

    static get NumberOfPressureSensors() {
        return PressureSensorDataManager.NumberOfPressureSensors;
    }
    get numberOfPressureSensors() {
        return SensorDataManager.NumberOfPressureSensors;
    }

    static get PressureSensorNames() {
        return PressureSensorDataManager.Names;
    }
    get pressureSensorNames() {
        return SensorDataManager.PressureSensorNames;
    }
}

/**
 * @typedef SensorConfiguration
 * @type {Object}
 * @property {number} pressure
 * @property {number} acceleration
 * @property {number} gravity
 * @property {number} linearAcceleration
 * @property {number} gyroscope
 * @property {number} magnetometer
 * @property {number} gameRotation
 * @property {number} rotation
 * @property {number} barometer
 */

const _console$c = createConsole("SensorConfigurationManager", { log: true });

class SensorConfigurationManager {
    /** @type {DeviceType} */
    #deviceType;
    get deviceType() {
        return this.#deviceType;
    }
    set deviceType(newDeviceType) {
        _console$c.assertTypeWithError(newDeviceType, "string");
        if (this.#deviceType == newDeviceType) {
            _console$c.warn(`redundant deviceType assignment "${newDeviceType}"`);
            return;
        }
        _console$c.log({ newDeviceType });
        this.#deviceType = newDeviceType;

        // can later use for non-insole deviceTypes that ignore sensorTypes like "pressure"
    }

    /** @type {SensorType[]} */
    #availableSensorTypes;
    /** @param {SensorType} sensorType */
    #assertAvailableSensorType(sensorType) {
        _console$c.assertWithError(this.#availableSensorTypes, "must get initial sensorConfiguration");
        const isSensorTypeAvailable = this.#availableSensorTypes?.includes(sensorType);
        _console$c.assert(isSensorTypeAvailable, `unavailable sensor type "${sensorType}"`);
        return isSensorTypeAvailable;
    }

    /** @param {DataView} dataView */
    parse(dataView) {
        /** @type {SensorConfiguration} */
        const parsedSensorConfiguration = {};
        for (
            let byteOffset = 0, sensorTypeIndex = 0;
            byteOffset < dataView.byteLength;
            byteOffset += 2, sensorTypeIndex++
        ) {
            const sensorType = SensorDataManager.Types[sensorTypeIndex];
            if (!sensorType) {
                _console$c.warn(`unknown sensorType index ${sensorTypeIndex}`);
                break;
            }
            const sensorRate = dataView.getUint16(byteOffset, true);
            _console$c.log({ sensorType, sensorRate });
            parsedSensorConfiguration[sensorType] = sensorRate;
        }
        _console$c.log({ parsedSensorConfiguration });
        this.#availableSensorTypes = Object.keys(parsedSensorConfiguration);
        return parsedSensorConfiguration;
    }

    static #MaxSensorRate = 2 ** 16 - 1;
    static get MaxSensorRate() {
        return this.#MaxSensorRate;
    }
    get maxSensorRate() {
        return SensorConfigurationManager.MaxSensorRate;
    }
    static #SensorRateStep = 5;
    static get SensorRateStep() {
        return this.#SensorRateStep;
    }
    get sensorRateStep() {
        return SensorConfigurationManager.SensorRateStep;
    }

    /** @param {sensorRate} number */
    #assertValidSensorRate(sensorRate) {
        _console$c.assertTypeWithError(sensorRate, "number");
        _console$c.assertWithError(sensorRate >= 0, `sensorRate must be 0 or greater (got ${sensorRate})`);
        _console$c.assertWithError(
            sensorRate < this.maxSensorRate,
            `sensorRate must be 0 or greater (got ${sensorRate})`
        );
        _console$c.assertWithError(
            sensorRate % this.sensorRateStep == 0,
            `sensorRate must be multiple of ${this.sensorRateStep}`
        );
    }

    /** @param {SensorConfiguration} sensorConfiguration */
    createData(sensorConfiguration) {
        /** @type {SensorType[]} */
        let sensorTypes = Object.keys(sensorConfiguration);
        sensorTypes = sensorTypes.filter((sensorType) => this.#assertAvailableSensorType(sensorType));

        const dataView = new DataView(new ArrayBuffer(sensorTypes.length * 3));
        sensorTypes.forEach((sensorType, index) => {
            SensorDataManager.AssertValidSensorType(sensorType);
            const sensorTypeEnum = SensorDataManager.Types.indexOf(sensorType);
            dataView.setUint8(index * 3, sensorTypeEnum);

            const sensorRate = sensorConfiguration[sensorType];
            this.#assertValidSensorRate(sensorRate);
            dataView.setUint16(index * 3 + 1, sensorConfiguration[sensorType], true);
        });
        _console$c.log({ sensorConfigurationData: dataView });
        return dataView;
    }

    /** @param {SensorConfiguration} sensorConfiguration */
    hasAtLeastOneNonZeroSensorRate(sensorConfiguration) {
        return Object.values(sensorConfiguration).some((value) => value > 0);
    }
}

/**
 * @typedef { "none" |
 * "strongClick100" |
 * "strongClick60" |
 * "strongClick30" |
 * "sharpClick100" |
 * "sharpClick60" |
 * "sharpClick30" |
 * "softBump100" |
 * "softBump60" |
 * "softBump30" |
 * "doubleClick100" |
 * "doubleClick60" |
 * "tripleClick100" |
 * "softFuzz60" |
 * "strongBuzz100" |
 * "alert750ms" |
 * "alert1000ms" |
 * "strongClick1_100" |
 * "strongClick2_80" |
 * "strongClick3_60" |
 * "strongClick4_30" |
 * "mediumClick100" |
 * "mediumClick80" |
 * "mediumClick60" |
 * "sharpTick100" |
 * "sharpTick80" |
 * "sharpTick60" |
 * "shortDoubleClickStrong100" |
 * "shortDoubleClickStrong80" |
 * "shortDoubleClickStrong60" |
 * "shortDoubleClickStrong30" |
 * "shortDoubleClickMedium100" |
 * "shortDoubleClickMedium80" |
 * "shortDoubleClickMedium60" |
 * "shortDoubleSharpTick100" |
 * "shortDoubleSharpTick80" |
 * "shortDoubleSharpTick60" |
 * "longDoubleSharpClickStrong100" |
 * "longDoubleSharpClickStrong80" |
 * "longDoubleSharpClickStrong60" |
 * "longDoubleSharpClickStrong30" |
 * "longDoubleSharpClickMedium100" |
 * "longDoubleSharpClickMedium80" |
 * "longDoubleSharpClickMedium60" |
 * "longDoubleSharpTick100" |
 * "longDoubleSharpTick80" |
 * "longDoubleSharpTick60" |
 * "buzz100" |
 * "buzz80" |
 * "buzz60" |
 * "buzz40" |
 * "buzz20" |
 * "pulsingStrong100" |
 * "pulsingStrong60" |
 * "pulsingMedium100" |
 * "pulsingMedium60" |
 * "pulsingSharp100" |
 * "pulsingSharp60" |
 * "transitionClick100" |
 * "transitionClick80" |
 * "transitionClick60" |
 * "transitionClick40" |
 * "transitionClick20" |
 * "transitionClick10" |
 * "transitionHum100" |
 * "transitionHum80" |
 * "transitionHum60" |
 * "transitionHum40" |
 * "transitionHum20" |
 * "transitionHum10" |
 * "transitionRampDownLongSmooth2_100" |
 * "transitionRampDownLongSmooth1_100" |
 * "transitionRampDownMediumSmooth1_100" |
 * "transitionRampDownMediumSmooth2_100" |
 * "transitionRampDownShortSmooth1_100" |
 * "transitionRampDownShortSmooth2_100" |
 * "transitionRampDownLongSharp1_100" |
 * "transitionRampDownLongSharp2_100" |
 * "transitionRampDownMediumSharp1_100" |
 * "transitionRampDownMediumSharp2_100" |
 * "transitionRampDownShortSharp1_100" |
 * "transitionRampDownShortSharp2_100" |
 * "transitionRampUpLongSmooth1_100" |
 * "transitionRampUpLongSmooth2_100" |
 * "transitionRampUpMediumSmooth1_100" |
 * "transitionRampUpMediumSmooth2_100" |
 * "transitionRampUpShortSmooth1_100" |
 * "transitionRampUpShortSmooth2_100" |
 * "transitionRampUpLongSharp1_100" |
 * "transitionRampUpLongSharp2_100" |
 * "transitionRampUpMediumSharp1_100" |
 * "transitionRampUpMediumSharp2_100" |
 * "transitionRampUpShortSharp1_100" |
 * "transitionRampUpShortSharp2_100" |
 * "transitionRampDownLongSmooth1_50" |
 * "transitionRampDownLongSmooth2_50" |
 * "transitionRampDownMediumSmooth1_50" |
 * "transitionRampDownMediumSmooth2_50" |
 * "transitionRampDownShortSmooth1_50" |
 * "transitionRampDownShortSmooth2_50" |
 * "transitionRampDownLongSharp1_50" |
 * "transitionRampDownLongSharp2_50" |
 * "transitionRampDownMediumSharp1_50" |
 * "transitionRampDownMediumSharp2_50" |
 * "transitionRampDownShortSharp1_50" |
 * "transitionRampDownShortSharp2_50" |
 * "transitionRampUpLongSmooth1_50" |
 * "transitionRampUpLongSmooth2_50" |
 * "transitionRampUpMediumSmooth1_50" |
 * "transitionRampUpMediumSmooth2_50" |
 * "transitionRampUpShortSmooth1_50" |
 * "transitionRampUpShortSmooth2_50" |
 * "transitionRampUpLongSharp1_50" |
 * "transitionRampUpLongSharp2_50" |
 * "transitionRampUpMediumSharp1_50" |
 * "transitionRampUpMediumSharp2_50" |
 * "transitionRampUpShortSharp1_50" |
 * "transitionRampUpShortSharp2_50" |
 * "longBuzz100" |
 * "smoothHum50" |
 * "smoothHum40" |
 * "smoothHum30" |
 * "smoothHum20" |
 * "smoothHum10"
 * } VibrationWaveformEffect
 */

/** @type {VibrationWaveformEffect[]} */
const VibrationWaveformEffects = [
    "none",
    "strongClick100",
    "strongClick60",
    "strongClick30",
    "sharpClick100",
    "sharpClick60",
    "sharpClick30",
    "softBump100",
    "softBump60",
    "softBump30",
    "doubleClick100",
    "doubleClick60",
    "tripleClick100",
    "softFuzz60",
    "strongBuzz100",
    "alert750ms",
    "alert1000ms",
    "strongClick1_100",
    "strongClick2_80",
    "strongClick3_60",
    "strongClick4_30",
    "mediumClick100",
    "mediumClick80",
    "mediumClick60",
    "sharpTick100",
    "sharpTick80",
    "sharpTick60",
    "shortDoubleClickStrong100",
    "shortDoubleClickStrong80",
    "shortDoubleClickStrong60",
    "shortDoubleClickStrong30",
    "shortDoubleClickMedium100",
    "shortDoubleClickMedium80",
    "shortDoubleClickMedium60",
    "shortDoubleSharpTick100",
    "shortDoubleSharpTick80",
    "shortDoubleSharpTick60",
    "longDoubleSharpClickStrong100",
    "longDoubleSharpClickStrong80",
    "longDoubleSharpClickStrong60",
    "longDoubleSharpClickStrong30",
    "longDoubleSharpClickMedium100",
    "longDoubleSharpClickMedium80",
    "longDoubleSharpClickMedium60",
    "longDoubleSharpTick100",
    "longDoubleSharpTick80",
    "longDoubleSharpTick60",
    "buzz100",
    "buzz80",
    "buzz60",
    "buzz40",
    "buzz20",
    "pulsingStrong100",
    "pulsingStrong60",
    "pulsingMedium100",
    "pulsingMedium60",
    "pulsingSharp100",
    "pulsingSharp60",
    "transitionClick100",
    "transitionClick80",
    "transitionClick60",
    "transitionClick40",
    "transitionClick20",
    "transitionClick10",
    "transitionHum100",
    "transitionHum80",
    "transitionHum60",
    "transitionHum40",
    "transitionHum20",
    "transitionHum10",
    "transitionRampDownLongSmooth2_100",
    "transitionRampDownLongSmooth1_100",
    "transitionRampDownMediumSmooth1_100",
    "transitionRampDownMediumSmooth2_100",
    "transitionRampDownShortSmooth1_100",
    "transitionRampDownShortSmooth2_100",
    "transitionRampDownLongSharp1_100",
    "transitionRampDownLongSharp2_100",
    "transitionRampDownMediumSharp1_100",
    "transitionRampDownMediumSharp2_100",
    "transitionRampDownShortSharp1_100",
    "transitionRampDownShortSharp2_100",
    "transitionRampUpLongSmooth1_100",
    "transitionRampUpLongSmooth2_100",
    "transitionRampUpMediumSmooth1_100",
    "transitionRampUpMediumSmooth2_100",
    "transitionRampUpShortSmooth1_100",
    "transitionRampUpShortSmooth2_100",
    "transitionRampUpLongSharp1_100",
    "transitionRampUpLongSharp2_100",
    "transitionRampUpMediumSharp1_100",
    "transitionRampUpMediumSharp2_100",
    "transitionRampUpShortSharp1_100",
    "transitionRampUpShortSharp2_100",
    "transitionRampDownLongSmooth1_50",
    "transitionRampDownLongSmooth2_50",
    "transitionRampDownMediumSmooth1_50",
    "transitionRampDownMediumSmooth2_50",
    "transitionRampDownShortSmooth1_50",
    "transitionRampDownShortSmooth2_50",
    "transitionRampDownLongSharp1_50",
    "transitionRampDownLongSharp2_50",
    "transitionRampDownMediumSharp1_50",
    "transitionRampDownMediumSharp2_50",
    "transitionRampDownShortSharp1_50",
    "transitionRampDownShortSharp2_50",
    "transitionRampUpLongSmooth1_50",
    "transitionRampUpLongSmooth2_50",
    "transitionRampUpMediumSmooth1_50",
    "transitionRampUpMediumSmooth2_50",
    "transitionRampUpShortSmooth1_50",
    "transitionRampUpShortSmooth2_50",
    "transitionRampUpLongSharp1_50",
    "transitionRampUpLongSharp2_50",
    "transitionRampUpMediumSharp1_50",
    "transitionRampUpMediumSharp2_50",
    "transitionRampUpShortSharp1_50",
    "transitionRampUpShortSharp2_50",
    "longBuzz100",
    "smoothHum50",
    "smoothHum40",
    "smoothHum30",
    "smoothHum20",
    "smoothHum10",
];

const textEncoder = new TextEncoder();

/**
 * @param {...ArrayBuffer} arrayBuffers
 * @returns {ArrayBuffer}
 */
function concatenateArrayBuffers(...arrayBuffers) {
    arrayBuffers = arrayBuffers.filter((arrayBuffer) => arrayBuffer != undefined || arrayBuffer != null);
    arrayBuffers = arrayBuffers.map((arrayBuffer) => {
        if (typeof arrayBuffer == "number") {
            const number = arrayBuffer;
            return Uint8Array.from([Math.floor(number)]);
        } else if (typeof arrayBuffer == "boolean") {
            const boolean = arrayBuffer;
            return Uint8Array.from([boolean ? 1 : 0]);
        } else if (typeof arrayBuffer == "string") {
            const string = arrayBuffer;
            return stringToArrayBuffer(string);
        } else if (arrayBuffer instanceof Array) {
            const array = arrayBuffer;
            return Uint8Array.from(array).buffer;
        } else if (arrayBuffer instanceof ArrayBuffer) {
            return arrayBuffer;
        } else if ("buffer" in arrayBuffer && arrayBuffer.buffer instanceof ArrayBuffer) {
            const bufferContainer = arrayBuffer;
            return bufferContainer.buffer;
        } else if (arrayBuffer instanceof DataView) {
            const dataView = arrayBuffer;
            return dataView.buffer;
        } else if (typeof arrayBuffer == "object") {
            const object = arrayBuffer;
            return objectToArrayBuffer(object);
        } else {
            return arrayBuffer;
        }
    });
    arrayBuffers = arrayBuffers.filter((arrayBuffer) => arrayBuffer && "byteLength" in arrayBuffer);
    const length = arrayBuffers.reduce((length, arrayBuffer) => length + arrayBuffer.byteLength, 0);
    const uint8Array = new Uint8Array(length);
    let byteOffset = 0;
    arrayBuffers.forEach((arrayBuffer) => {
        uint8Array.set(new Uint8Array(arrayBuffer), byteOffset);
        byteOffset += arrayBuffer.byteLength;
    });
    return uint8Array.buffer;
}

/** @param {Data} data */
function dataToArrayBuffer(data) {
    return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
}

/** @param {String} string */
function stringToArrayBuffer(string) {
    const encoding = textEncoder.encode(string);
    return concatenateArrayBuffers(encoding.byteLength, encoding);
}

/** @param {Object} object */
function objectToArrayBuffer(object) {
    return stringToArrayBuffer(JSON.stringify(object));
}

const _console$b = createConsole("VibrationManager");

/** @typedef {"front" | "rear"} VibrationLocation */
/** @typedef {"waveformEffect" | "waveform"} VibrationType */


/**
 * @typedef VibrationWaveformEffectSegment
 * use either effect or delay but not both (defaults to effect if both are defined)
 * @type {Object}
 * @property {VibrationWaveformEffect?} effect
 * @property {number?} delay (ms int ranging [0, 1270])
 * @property {number?} loopCount how many times each segment should loop (int ranging [0, 3])
 */

/**
 * @typedef VibrationWaveformSegment
 * @type {Object}
 * @property {number} duration ms int ranging [0, 2550]
 * @property {number} amplitude float ranging [0, 1]
 */

class VibrationManager {
    /** @type {VibrationLocation[]} */
    static #Locations = ["front", "rear"];
    static get Locations() {
        return this.#Locations;
    }
    get locations() {
        return VibrationManager.Locations;
    }
    /** @param {VibrationLocation} location */
    #verifyLocation(location) {
        _console$b.assertTypeWithError(location, "string");
        _console$b.assertWithError(this.locations.includes(location), `invalid location "${location}"`);
    }
    /** @param {VibrationLocation[]} locations */
    #verifyLocations(locations) {
        this.#assertNonEmptyArray(locations);
        locations.forEach((location) => {
            this.#verifyLocation(location);
        });
    }
    /** @param {VibrationLocation[]} locations */
    #createLocationsBitmask(locations) {
        this.#verifyLocations(locations);

        let locationsBitmask = 0;
        locations.forEach((location) => {
            const locationIndex = this.locations.indexOf(location);
            locationsBitmask |= 1 << locationIndex;
        });
        _console$b.log({ locationsBitmask });
        _console$b.assertWithError(locationsBitmask > 0, `locationsBitmask must not be zero`);
        return locationsBitmask;
    }

    /** @param {any[]} array */
    #assertNonEmptyArray(array) {
        _console$b.assertWithError(Array.isArray(array), "passed non-array");
        _console$b.assertWithError(array.length > 0, "passed empty array");
    }

    static get WaveformEffects() {
        return VibrationWaveformEffects;
    }
    get waveformEffects() {
        return VibrationManager.WaveformEffects;
    }
    /** @param {VibrationWaveformEffect} waveformEffect */
    #verifyWaveformEffect(waveformEffect) {
        _console$b.assertWithError(
            this.waveformEffects.includes(waveformEffect),
            `invalid waveformEffect "${waveformEffect}"`
        );
    }

    static #MaxWaveformEffectSegmentDelay = 1270;
    static get MaxWaveformEffectSegmentDelay() {
        return this.#MaxWaveformEffectSegmentDelay;
    }
    get maxWaveformEffectSegmentDelay() {
        return VibrationManager.MaxWaveformEffectSegmentDelay;
    }
    /** @param {VibrationWaveformEffectSegment} waveformEffectSegment */
    #verifyWaveformEffectSegment(waveformEffectSegment) {
        if (waveformEffectSegment.effect != undefined) {
            const waveformEffect = waveformEffectSegment.effect;
            this.#verifyWaveformEffect(waveformEffect);
        } else if (waveformEffectSegment.delay != undefined) {
            const { delay } = waveformEffectSegment;
            _console$b.assertWithError(delay >= 0, `delay must be 0ms or greater (got ${delay})`);
            _console$b.assertWithError(
                delay <= this.maxWaveformEffectSegmentDelay,
                `delay must be ${this.maxWaveformEffectSegmentDelay}ms or less (got ${delay})`
            );
        } else {
            throw Error("no effect or delay found in waveformEffectSegment");
        }

        if (waveformEffectSegment.loopCount != undefined) {
            const { loopCount } = waveformEffectSegment;
            this.#verifyWaveformEffectSegmentLoopCount(loopCount);
        }
    }
    static #MaxWaveformEffectSegmentLoopCount = 3;
    static get MaxWaveformEffectSegmentLoopCount() {
        return this.#MaxWaveformEffectSegmentLoopCount;
    }
    get maxWaveformEffectSegmentLoopCount() {
        return VibrationManager.MaxWaveformEffectSegmentLoopCount;
    }
    /** @param {number} waveformEffectSegmentLoopCount */
    #verifyWaveformEffectSegmentLoopCount(waveformEffectSegmentLoopCount) {
        _console$b.assertTypeWithError(waveformEffectSegmentLoopCount, "number");
        _console$b.assertWithError(
            waveformEffectSegmentLoopCount >= 0,
            `waveformEffectSegmentLoopCount must be 0 or greater (got ${waveformEffectSegmentLoopCount})`
        );
        _console$b.assertWithError(
            waveformEffectSegmentLoopCount <= this.maxWaveformEffectSegmentLoopCount,
            `waveformEffectSegmentLoopCount must be ${this.maxWaveformEffectSegmentLoopCount} or fewer (got ${waveformEffectSegmentLoopCount})`
        );
    }

    static #MaxNumberOfWaveformEffectSegments = 8;
    static get MaxNumberOfWaveformEffectSegments() {
        return this.#MaxNumberOfWaveformEffectSegments;
    }
    get maxNumberOfWaveformEffectSegments() {
        return VibrationManager.MaxNumberOfWaveformEffectSegments;
    }
    /** @param {VibrationWaveformEffectSegment[]} waveformEffectSegments */
    #verifyWaveformEffectSegments(waveformEffectSegments) {
        this.#assertNonEmptyArray(waveformEffectSegments);
        _console$b.assertWithError(
            waveformEffectSegments.length <= this.maxNumberOfWaveformEffectSegments,
            `must have ${this.maxNumberOfWaveformEffectSegments} waveformEffectSegments or fewer (got ${waveformEffectSegments.length})`
        );
        waveformEffectSegments.forEach((waveformEffectSegment) => {
            this.#verifyWaveformEffectSegment(waveformEffectSegment);
        });
    }

    static #MaxWaveformEffectSequenceLoopCount = 6;
    static get MaxWaveformEffectSequenceLoopCount() {
        return this.#MaxWaveformEffectSequenceLoopCount;
    }
    get maxWaveformEffectSequenceLoopCount() {
        return VibrationManager.MaxWaveformEffectSequenceLoopCount;
    }
    /** @param {number} waveformEffectSequenceLoopCount */
    #verifyWaveformEffectSequenceLoopCount(waveformEffectSequenceLoopCount) {
        _console$b.assertTypeWithError(waveformEffectSequenceLoopCount, "number");
        _console$b.assertWithError(
            waveformEffectSequenceLoopCount >= 0,
            `waveformEffectSequenceLoopCount must be 0 or greater (got ${waveformEffectSequenceLoopCount})`
        );
        _console$b.assertWithError(
            waveformEffectSequenceLoopCount <= this.maxWaveformEffectSequenceLoopCount,
            `waveformEffectSequenceLoopCount must be ${this.maxWaveformEffectSequenceLoopCount} or fewer (got ${waveformEffectSequenceLoopCount})`
        );
    }

    static #MaxWaveformSegmentDuration = 2550;
    static get MaxWaveformSegmentDuration() {
        return this.#MaxWaveformSegmentDuration;
    }
    get maxWaveformSegmentDuration() {
        return VibrationManager.MaxWaveformSegmentDuration;
    }
    /** @param {VibrationWaveformSegment} waveformSegment */
    #verifyWaveformSegment(waveformSegment) {
        _console$b.assertTypeWithError(waveformSegment.amplitude, "number");
        _console$b.assertWithError(
            waveformSegment.amplitude >= 0,
            `amplitude must be 0 or greater (got ${waveformSegment.amplitude})`
        );
        _console$b.assertWithError(
            waveformSegment.amplitude <= 1,
            `amplitude must be 1 or less (got ${waveformSegment.amplitude})`
        );

        _console$b.assertTypeWithError(waveformSegment.duration, "number");
        _console$b.assertWithError(
            waveformSegment.duration > 0,
            `duration must be greater than 0ms (got ${waveformSegment.duration}ms)`
        );
        _console$b.assertWithError(
            waveformSegment.duration <= this.maxWaveformSegmentDuration,
            `duration must be ${this.maxWaveformSegmentDuration}ms or less (got ${waveformSegment.duration}ms)`
        );
    }
    static #MaxNumberOfWaveformSegments = 20;
    static get MaxNumberOfWaveformSegments() {
        return this.#MaxNumberOfWaveformSegments;
    }
    get maxNumberOfWaveformSegments() {
        return VibrationManager.MaxNumberOfWaveformSegments;
    }
    /** @param {VibrationWaveformSegment[]} waveformSegments */
    #verifyWaveformSegments(waveformSegments) {
        this.#assertNonEmptyArray(waveformSegments);
        _console$b.assertWithError(
            waveformSegments.length <= this.maxNumberOfWaveformSegments,
            `must have ${this.maxNumberOfWaveformSegments} waveformSegments or fewer (got ${waveformSegments.length})`
        );
        waveformSegments.forEach((waveformSegment) => {
            this.#verifyWaveformSegment(waveformSegment);
        });
    }

    /**
     * @param {VibrationLocation[]} locations
     * @param {VibrationWaveformEffectSegment[]} waveformEffectSegments
     * @param {number?} waveformEffectSequenceLoopCount how many times the entire sequence should loop (int ranging [0, 6])
     */
    createWaveformEffectsData(locations, waveformEffectSegments, waveformEffectSequenceLoopCount = 0) {
        this.#verifyWaveformEffectSegments(waveformEffectSegments);
        this.#verifyWaveformEffectSequenceLoopCount(waveformEffectSequenceLoopCount);

        let dataArray = [];
        let byteOffset = 0;

        const hasAtLeast1WaveformEffectWithANonzeroLoopCount = waveformEffectSegments.some((waveformEffectSegment) => {
            const { loopCount } = waveformEffectSegment;
            return loopCount != undefined && loopCount > 0;
        });

        const includeAllWaveformEffectSegments =
            hasAtLeast1WaveformEffectWithANonzeroLoopCount || waveformEffectSequenceLoopCount != 0;

        for (
            let index = 0;
            index < waveformEffectSegments.length ||
            (includeAllWaveformEffectSegments && index < this.maxNumberOfWaveformEffectSegments);
            index++
        ) {
            const waveformEffectSegment = waveformEffectSegments[index] || { effect: "none" };
            if (waveformEffectSegment.effect != undefined) {
                const waveformEffect = waveformEffectSegment.effect;
                dataArray[byteOffset++] = this.waveformEffects.indexOf(waveformEffect);
            } else if (waveformEffectSegment.delay != undefined) {
                const { delay } = waveformEffectSegment;
                dataArray[byteOffset++] = (1 << 7) | Math.floor(delay / 10); // set most significant bit to 1
            } else {
                throw Error("invalid waveformEffectSegment");
            }
        }

        const includeAllWaveformEffectSegmentLoopCounts = waveformEffectSequenceLoopCount != 0;
        for (
            let index = 0;
            index < waveformEffectSegments.length ||
            (includeAllWaveformEffectSegmentLoopCounts && index < this.maxNumberOfWaveformEffectSegments);
            index++
        ) {
            const waveformEffectSegmentLoopCount = waveformEffectSegments[index]?.loopCount || 0;
            if (index == 0 || index == 4) {
                dataArray[byteOffset] = 0;
            }
            const bitOffset = 2 * (index % 4);
            dataArray[byteOffset] |= waveformEffectSegmentLoopCount << bitOffset;
            if (index == 3 || index == 7) {
                byteOffset++;
            }
        }

        if (waveformEffectSequenceLoopCount != 0) {
            dataArray[byteOffset++] = waveformEffectSequenceLoopCount;
        }
        const dataView = new DataView(Uint8Array.from(dataArray).buffer);
        _console$b.log({ dataArray, dataView });
        return this.#createData(locations, "waveformEffect", dataView);
    }
    /**
     * @param {VibrationLocation[]} locations
     * @param {VibrationWaveformSegment[]} waveformSegments
     */
    createWaveformData(locations, waveformSegments) {
        this.#verifyWaveformSegments(waveformSegments);
        const dataView = new DataView(new ArrayBuffer(waveformSegments.length * 2));
        waveformSegments.forEach((waveformSegment, index) => {
            dataView.setUint8(index * 2, Math.floor(waveformSegment.amplitude * 127));
            dataView.setUint8(index * 2 + 1, Math.floor(waveformSegment.duration / 10));
        });
        _console$b.log({ dataView });
        return this.#createData(locations, "waveform", dataView);
    }

    /** @type {VibrationType[]} */
    static #Types = ["waveformEffect", "waveform"];
    static get Types() {
        return this.#Types;
    }
    get #types() {
        return VibrationManager.Types;
    }
    /** @param {VibrationType} vibrationType */
    #verifyVibrationType(vibrationType) {
        _console$b.assertTypeWithError(vibrationType, "string");
        _console$b.assertWithError(this.#types.includes(vibrationType), `invalid vibrationType "${vibrationType}"`);
    }

    /**
     * @param {VibrationLocation[]} locations
     * @param {VibrationType} vibrationType
     * @param {DataView} dataView
     */
    #createData(locations, vibrationType, dataView) {
        _console$b.assertWithError(dataView?.byteLength > 0, "no data received");
        const locationsBitmask = this.#createLocationsBitmask(locations);
        this.#verifyVibrationType(vibrationType);
        const vibrationTypeIndex = this.#types.indexOf(vibrationType);
        _console$b.log({ locationsBitmask, vibrationTypeIndex, dataView });
        const data = concatenateArrayBuffers(locationsBitmask, vibrationTypeIndex, dataView.byteLength, dataView);
        _console$b.log({ data });
        return data;
    }
}

const _console$a = createConsole("Device", { log: false });



/** @typedef {"connectionStatus" | ConnectionStatus | "isConnected" | ConnectionMessageType | "deviceInformation" | SensorType} DeviceEventType */

/** @typedef {"deviceConnected" | "deviceDisconnected"} StaticDeviceEventType */




/**
 * @typedef DeviceEvent
 * @type {Object}
 * @property {Device} target
 * @property {DeviceEventType} type
 * @property {Object} message
 */

/**
 * @typedef StaticDeviceEvent
 * @type {Object}
 * @property {StaticDeviceEventType} type
 * @property {Object} message
 */



/**
 * @typedef DeviceInformation
 * @type {Object}
 * @property {string?} manufacturerName
 * @property {string?} modelNumber
 * @property {string?} softwareRevision
 * @property {string?} hardwareRevision
 * @property {string?} firmwareRevision
 * @property {PnpId?} pnpId
 */

/**
 * @typedef PnpId
 * @type {Object}
 * @property {"Bluetooth"|"USB"} source
 * @property {number} vendorId
 * @property {number} productId
 * @property {number} productVersion
 */

/** @typedef {"leftInsole" | "rightInsole"} DeviceType */
/** @typedef {"left" | "right"} InsoleSide */







/**
 * @typedef VibrationWaveformEffectConfiguration
 * @type {Object}
 * @property {VibrationWaveformEffectSegment[]} segments
 * @property {number?} loopCount how many times the entire sequence should loop (int ranging [0, 6])
 */


/**
 * @typedef VibrationWaveformConfiguration
 * @type {Object}
 * @property {VibrationWaveformSegment[]} segments
 */

/**
 * @typedef VibrationConfiguration
 * @type {Object}
 * @property {VibrationLocation[]} locations
 * @property {VibrationType} type
 * @property {VibrationWaveformEffectConfiguration?} waveformEffect use if type is "waveformEffect"
 * @property {VibrationWaveformConfiguration?} waveform use if type is "waveform"
 */

class Device {
    constructor() {
        //this.connectionManager = new Device.#DefaultConnectionManager();
        this.#sensorDataManager.onDataReceived = this.#onSensorDataReceived.bind(this);

        if (isInBrowser) {
            window.addEventListener("beforeunload", () => {
                if (this.isConnected && this.clearSensorConfigurationOnLeave) {
                    this.clearSensorConfiguration();
                }
            });
        }
        if (isInNode) {
            /** can add more node.js leave handlers https://gist.github.com/hyrious/30a878f6e6a057f09db87638567cb11a */
            process.on("exit", () => {
                if (this.isConnected && this.clearSensorConfigurationOnLeave) {
                    this.clearSensorConfiguration();
                }
            });
        }

        this.addEventListener("isConnected", () => {
            Device.#OnDeviceIsConnected(this);
        });
    }

    /** @returns {ConnectionManager} */
    static get #DefaultConnectionManager() {
        return WebBluetoothConnectionManager;
    }

    // EVENT DISPATCHER

    /** @type {DeviceEventType[]} */
    static #EventTypes = [
        "connectionStatus",
        "connecting",
        "connected",
        "disconnecting",
        "not connected",
        "isConnected",

        "manufacturerName",
        "modelNumber",
        "softwareRevision",
        "hardwareRevision",
        "firmwareRevision",
        "pnpId",
        "deviceInformation",

        "batteryLevel",

        "getName",
        "getType",

        "getSensorConfiguration",

        "sensorData",
        "pressure",
        "acceleration",
        "gravity",
        "linearAcceleration",
        "gyroscope",
        "magnetometer",
        "gameRotation",
        "rotation",
        "barometer",
    ];
    static get EventTypes() {
        return this.#EventTypes;
    }
    get eventTypes() {
        return Device.#EventTypes;
    }
    #eventDispatcher = new EventDispatcher(this, this.eventTypes);

    /**
     * @param {DeviceEventType} type
     * @param {EventDispatcherListener} listener
     * @param {EventDispatcherOptions} options
     */
    addEventListener(type, listener, options) {
        this.#eventDispatcher.addEventListener(type, listener, options);
    }

    /**
     * @param {DeviceEvent} event
     */
    #dispatchEvent(event) {
        this.#eventDispatcher.dispatchEvent(event);
    }

    /**
     * @param {DeviceEventType} type
     * @param {EventDispatcherListener} listener
     */
    removeEventListener(type, listener) {
        return this.#eventDispatcher.removeEventListener(type, listener);
    }

    // CONNECTION MANAGER

    /** @type {ConnectionManager?} */
    #connectionManager;
    get connectionManager() {
        return this.#connectionManager;
    }
    set connectionManager(newConnectionManager) {
        if (this.connectionManager == newConnectionManager) {
            _console$a.warn("same connectionManager is already assigned");
            return;
        }

        if (this.connectionManager) {
            this.connectionManager.onStatusUpdated = null;
            this.connectionManager.onMessageReceived = null;
        }
        if (newConnectionManager) {
            newConnectionManager.onStatusUpdated = this.#onConnectionStatusUpdated.bind(this);
            newConnectionManager.onMessageReceived = this.#onConnectionMessageReceived.bind(this);
        }

        this.#connectionManager = newConnectionManager;
        _console$a.log("assigned new connectionManager", this.#connectionManager);
    }

    async connect() {
        if (!this.connectionManager) {
            this.connectionManager = new Device.#DefaultConnectionManager();
        }
        return this.connectionManager.connect();
    }
    get isConnected() {
        return this.connectionManager?.isConnected;
    }
    /** @throws {Error} if not connected */
    #assertIsConnected() {
        _console$a.assertWithError(this.isConnected, "not connected");
    }

    get canReconnect() {
        return this.connectionManager?.canReconnect;
    }
    async reconnect() {
        return this.connectionManager?.reconnect();
    }

    static #ReconnectOnDisconnection = false;
    static get ReconnectOnDisconnection() {
        return this.#ReconnectOnDisconnection;
    }
    static set ReconnectOnDisconnection(newReconnectOnDisconnection) {
        _console$a.assertTypeWithError(newReconnectOnDisconnection, "boolean");
        this.#ReconnectOnDisconnection = newReconnectOnDisconnection;
    }

    #reconnectOnDisconnection = Device.ReconnectOnDisconnection;
    get reconnectOnDisconnection() {
        return this.#reconnectOnDisconnection;
    }
    set reconnectOnDisconnection(newReconnectOnDisconnection) {
        _console$a.assertTypeWithError(newReconnectOnDisconnection, "boolean");
        this.#reconnectOnDisconnection = newReconnectOnDisconnection;
    }
    /** @type {number?} */
    #reconnectIntervalId;

    get connectionType() {
        return this.connectionManager?.type;
    }
    async disconnect() {
        this.#assertIsConnected();
        if (this.reconnectOnDisconnection) {
            this.reconnectOnDisconnection = false;
            this.addEventListener(
                "isConnected",
                () => {
                    this.reconnectOnDisconnection = true;
                },
                { once: true }
            );
        }

        return this.connectionManager.disconnect();
    }

    toggleConnection() {
        if (this.isConnected) {
            this.disconnect();
        } else if (this.canReconnect) {
            this.reconnect();
        } else {
            this.connect();
        }
    }

    get connectionStatus() {
        return this.#connectionManager?.status || "not connected";
    }

    /** @param {ConnectionStatus} connectionStatus */
    #onConnectionStatusUpdated(connectionStatus) {
        _console$a.log({ connectionStatus });

        if (connectionStatus == "not connected") {
            //this.#clear();

            if (this.canReconnect && this.reconnectOnDisconnection) {
                _console$a.log("starting reconnect interval...");
                this.#reconnectIntervalId = setInterval(() => {
                    _console$a.log("attempting reconnect...");
                    this.reconnect();
                }, 1000);
            }
        } else {
            if (this.#reconnectIntervalId != undefined) {
                _console$a.log("clearing reconnect interval");
                clearInterval(this.#reconnectIntervalId);
                this.#reconnectIntervalId = undefined;
            }
        }

        this.#dispatchEvent({ type: "connectionStatus", message: { connectionStatus } });
        this.#dispatchEvent({ type: this.connectionStatus });

        switch (connectionStatus) {
            case "connected":
            case "not connected":
                this.#dispatchEvent({ type: "isConnected", message: { isConnected: this.isConnected } });
                break;
        }
    }

    #clear() {
        this.#name = null;
        this.#type = null;
        this.#batteryLevel = null;
        for (const key in this.#deviceInformation) {
            this.#deviceInformation[key] = null;
        }
    }

    /**
     * @param {ConnectionMessageType} messageType
     * @param {DataView} dataView
     */
    #onConnectionMessageReceived(messageType, dataView) {
        _console$a.log({ messageType, dataView });
        switch (messageType) {
            case "manufacturerName":
                const manufacturerName = this.#textDecoder.decode(dataView);
                _console$a.log({ manufacturerName });
                this.#updateDeviceInformation({ manufacturerName });
                break;
            case "modelNumber":
                const modelNumber = this.#textDecoder.decode(dataView);
                _console$a.log({ modelNumber });
                this.#updateDeviceInformation({ modelNumber });
                break;
            case "softwareRevision":
                const softwareRevision = this.#textDecoder.decode(dataView);
                _console$a.log({ softwareRevision });
                this.#updateDeviceInformation({ softwareRevision });
                break;
            case "hardwareRevision":
                const hardwareRevision = this.#textDecoder.decode(dataView);
                _console$a.log({ hardwareRevision });
                this.#updateDeviceInformation({ hardwareRevision });
                break;
            case "firmwareRevision":
                const firmwareRevision = this.#textDecoder.decode(dataView);
                _console$a.log({ firmwareRevision });
                this.#updateDeviceInformation({ firmwareRevision });
                break;
            case "pnpId":
                /** @type {PnpId} */
                const pnpId = {
                    source: dataView.getUint8(0) === 1 ? "Bluetooth" : "USB",
                    productId: dataView.getUint8(3) | (dataView.getUint8(4) << 8),
                    productVersion: dataView.getUint8(5) | (dataView.getUint8(6) << 8),
                };
                if (pnpId.source == "Bluetooth") {
                    pnpId.vendorId = dataView.getUint8(1) | (dataView.getUint8(2) << 8);
                }
                _console$a.log({ pnpId });
                this.#updateDeviceInformation({ pnpId });
                break;
            case "serialNumber":
                const serialNumber = this.#textDecoder.decode(dataView);
                _console$a.log({ serialNumber });
                // will only be used for node.js
                break;

            case "batteryLevel":
                const batteryLevel = dataView.getUint8(0);
                _console$a.log("received battery level", { batteryLevel });
                this.#updateBatteryLevel(batteryLevel);
                break;

            case "getName":
                const name = this.#textDecoder.decode(dataView);
                _console$a.log({ name });
                this.#updateName(name);
                break;
            case "getType":
                const typeEnum = dataView.getUint8(0);
                const type = this.#types[typeEnum];
                _console$a.log({ typeEnum, type });
                this.#updateType(type);
                break;

            case "getSensorConfiguration":
                const sensorConfiguration = this.#sensorConfigurationManager.parse(dataView);
                _console$a.log({ sensorConfiguration });
                this.#updateSensorConfiguration(sensorConfiguration);
                break;

            case "sensorData":
                this.#sensorDataManager.parse(dataView);
                break;

            default:
                throw Error(`uncaught messageType ${messageType}`);
        }
    }

    // TEXT ENCODER/DECODER

    /** @type {TextEncoder} */
    static #TextEncoder = new TextEncoder();
    get #textEncoder() {
        return Device.#TextEncoder;
    }
    /** @type {TextDecoder} */
    static #TextDecoder = new TextDecoder();
    get #textDecoder() {
        return Device.#TextDecoder;
    }

    // DEVICE INFORMATION

    /** @type {DeviceInformation} */
    #deviceInformation = {
        manufacturerName: null,
        modelNumber: null,
        softwareRevision: null,
        hardwareRevision: null,
        firmwareRevision: null,
        pnpId: null,
    };
    get deviceInformation() {
        return this.#deviceInformation;
    }
    get #isDeviceInformationComplete() {
        return Object.values(this.#deviceInformation).every((value) => value != null);
    }

    /** @param {DeviceInformation} partialDeviceInformation */
    #updateDeviceInformation(partialDeviceInformation) {
        _console$a.log({ partialDeviceInformation });
        for (const deviceInformationName in partialDeviceInformation) {
            this.#dispatchEvent({
                type: deviceInformationName,
                message: { [deviceInformationName]: partialDeviceInformation[deviceInformationName] },
            });
        }

        Object.assign(this.#deviceInformation, partialDeviceInformation);
        _console$a.log({ deviceInformation: this.#deviceInformation });
        if (this.#isDeviceInformationComplete) {
            _console$a.log("completed deviceInformation");
            this.#dispatchEvent({ type: "deviceInformation", message: { deviceInformation: this.#deviceInformation } });
        }
    }

    // BATTERY LEVEL

    /** @type {number?} */
    #batteryLevel = null;
    get batteryLevel() {
        return this.#batteryLevel;
    }
    /** @param {number} updatedBatteryLevel */
    #updateBatteryLevel(updatedBatteryLevel) {
        _console$a.assertTypeWithError(updatedBatteryLevel, "number");
        if (this.#batteryLevel == updatedBatteryLevel) {
            _console$a.warn(`duplicate batteryLevel assignment ${updatedBatteryLevel}`);
            return;
        }
        this.#batteryLevel = updatedBatteryLevel;
        _console$a.log({ updatedBatteryLevel: this.#batteryLevel });
        this.#dispatchEvent({ type: "batteryLevel", message: { batteryLevel: this.#batteryLevel } });
    }

    // NAME
    /** @type {string?} */
    #name;
    get name() {
        return this.#name;
    }

    /** @param {string} updatedName */
    #updateName(updatedName) {
        _console$a.assertTypeWithError(updatedName, "string");
        this.#name = updatedName;
        _console$a.log({ updatedName: this.#name });
        this.#dispatchEvent({ type: "getName", message: { name: this.#name } });
    }
    static get MinNameLength() {
        return 2;
    }
    get minNameLength() {
        return Device.MinNameLength;
    }
    static get MaxNameLength() {
        return 65;
    }
    get maxNameLength() {
        return Device.MaxNameLength;
    }
    /** @param {string} newName */
    async setName(newName) {
        this.#assertIsConnected();
        _console$a.assertTypeWithError(newName, "string");
        _console$a.assertWithError(
            newName.length >= this.minNameLength,
            `name must be greater than ${this.minNameLength} characters long ("${newName}" is ${newName.length} characters long)`
        );
        _console$a.assertWithError(
            newName.length < this.maxNameLength,
            `name must be less than ${this.maxNameLength} characters long ("${newName}" is ${newName.length} characters long)`
        );
        const setNameData = this.#textEncoder.encode(newName);
        _console$a.log({ setNameData });
        await this.#connectionManager.sendMessage("setName", setNameData);
    }

    // TYPE
    /** @type {DeviceType[]} */
    static #Types = ["leftInsole", "rightInsole"];
    static get Types() {
        return this.#Types;
    }
    get #types() {
        return Device.Types;
    }
    /** @type {DeviceType?} */
    #type;
    get type() {
        return this.#type;
    }
    /** @param {DeviceType} newType */
    #assertValidDeviceType(type) {
        _console$a.assertTypeWithError(type, "string");
        _console$a.assertWithError(this.#types.includes(type), `invalid type "${type}"`);
    }
    /** @param {DeviceType} updatedType */
    #updateType(updatedType) {
        this.#assertValidDeviceType(updatedType);
        if (updatedType == this.type) {
            _console$a.warn("redundant type assignment");
            return;
        }
        this.#type = updatedType;
        _console$a.log({ updatedType: this.#type });

        this.#sensorDataManager.deviceType = this.#type;
        this.#sensorConfigurationManager.deviceType = this.#type;

        this.#dispatchEvent({ type: "getType", message: { type: this.#type } });
    }
    /** @param {DeviceType} newType */
    async setType(newType) {
        this.#assertIsConnected();
        this.#assertValidDeviceType(newType);
        const newTypeEnum = this.#types.indexOf(newType);
        const setTypeData = Uint8Array.from([newTypeEnum]);
        _console$a.log({ setTypeData });
        await this.#connectionManager.sendMessage("setType", setTypeData);
    }

    get isInsole() {
        switch (this.type) {
            case "leftInsole":
            case "rightInsole":
                return true;
            default:
                // for future non-insole  device types
                return false;
        }
    }
    /** @type {InsoleSide[]} */
    static #InsoleSides = ["left", "right"];
    static get InsoleSides() {
        return this.#InsoleSides;
    }
    get insoleSides() {
        return Device.InsoleSides;
    }
    /** @type {InsoleSide} */
    get insoleSide() {
        switch (this.type) {
            case "leftInsole":
                return "left";
            case "rightInsole":
                return "right";
        }
    }

    // SENSOR TYPES
    static get SensorTypes() {
        return SensorDataManager.Types;
    }
    get sensorTypes() {
        return Device.SensorTypes;
    }

    static get PressureSensorNames() {
        return SensorDataManager.PressureSensorNames;
    }
    get pressureSensorNames() {
        return Device.PressureSensorNames;
    }

    static get NumberOfPressureSensors() {
        return SensorDataManager.NumberOfPressureSensors;
    }
    get numberOfPressureSensors() {
        return Device.NumberOfPressureSensors;
    }

    // SENSOR CONFIGURATION
    #sensorConfigurationManager = new SensorConfigurationManager();
    /** @type {SensorConfiguration?} */
    #sensorConfiguration;
    get sensorConfiguration() {
        return this.#sensorConfiguration;
    }

    static get MaxSensorRate() {
        return SensorConfigurationManager.MaxSensorRate;
    }
    static get SensorRateStep() {
        return SensorConfigurationManager.SensorRateStep;
    }

    /** @param {SensorConfiguration} updatedSensorConfiguration */
    #updateSensorConfiguration(updatedSensorConfiguration) {
        this.#sensorConfiguration = updatedSensorConfiguration;
        _console$a.log({ updatedSensorConfiguration: this.#sensorConfiguration });
        if (!this.#sensorConfigurationManager.hasAtLeastOneNonZeroSensorRate(this.sensorConfiguration)) {
            _console$a.log("clearing sensorDataManager timestamp...");
            this.#sensorDataManager.clearTimestamp();
        }
        this.#dispatchEvent({
            type: "getSensorConfiguration",
            message: { sensorConfiguration: this.sensorConfiguration },
        });
    }
    /** @param {SensorConfiguration} newSensorConfiguration */
    async setSensorConfiguration(newSensorConfiguration) {
        this.#assertIsConnected();
        _console$a.log({ newSensorConfiguration });
        const setSensorConfigurationData = this.#sensorConfigurationManager.createData(newSensorConfiguration);
        _console$a.log({ setSensorConfigurationData });
        await this.#connectionManager.sendMessage("setSensorConfiguration", setSensorConfigurationData);
    }

    static #ClearSensorConfigurationOnLeave = true;
    static get ClearSensorConfigurationOnLeave() {
        return this.#ClearSensorConfigurationOnLeave;
    }
    static set ClearSensorConfigurationOnLeave(newclearSensorConfigurationOnLeave) {
        _console$a.assertTypeWithError(newclearSensorConfigurationOnLeave, "boolean");
        this.#ClearSensorConfigurationOnLeave = newclearSensorConfigurationOnLeave;
    }

    #clearSensorConfigurationOnLeave = Device.ClearSensorConfigurationOnLeave;
    get clearSensorConfigurationOnLeave() {
        return this.#clearSensorConfigurationOnLeave;
    }
    set clearSensorConfigurationOnLeave(newclearSensorConfigurationOnLeave) {
        _console$a.assertTypeWithError(newclearSensorConfigurationOnLeave, "boolean");
        this.#clearSensorConfigurationOnLeave = newclearSensorConfigurationOnLeave;
    }

    /** @type {SensorConfiguration} */
    static #ZeroSensorConfiguration = {};
    static get ZeroSensorConfiguration() {
        return this.#ZeroSensorConfiguration;
    }
    static {
        this.SensorTypes.forEach((sensorType) => {
            this.#ZeroSensorConfiguration[sensorType] = 0;
        });
    }
    get zeroSensorConfiguration() {
        return Device.ZeroSensorConfiguration;
    }
    async clearSensorConfiguration() {
        return this.setSensorConfiguration(this.zeroSensorConfiguration);
    }

    // SENSOR DATA

    /** @type {SensorDataManager} */
    #sensorDataManager = new SensorDataManager();

    /**
     * @param {SensorType} sensorType
     * @param {Object} sensorData
     * @param {number} sensorData.timestamp
     */
    #onSensorDataReceived(sensorType, sensorData) {
        _console$a.log({ sensorType, sensorData });
        this.#dispatchEvent({ type: sensorType, message: sensorData });
        this.#dispatchEvent({ type: "sensorData", message: sensorData });
    }

    resetPressureRange() {
        this.#sensorDataManager.pressureSensorDataManager.resetRange();
    }

    // VIBRATION
    #vibrationManager = new VibrationManager();
    static get VibrationLocations() {
        return VibrationManager.Locations;
    }
    static get VibrationTypes() {
        return VibrationManager.Types;
    }

    static get VibrationWaveformEffects() {
        return VibrationManager.WaveformEffects;
    }
    static get MaxVibrationWaveformEffectSegmentDelay() {
        return VibrationManager.MaxWaveformEffectSegmentDelay;
    }
    static get MaxNumberOfVibrationWaveformEffectSegments() {
        return VibrationManager.MaxNumberOfWaveformEffectSegments;
    }
    static get MaxVibrationWaveformEffectSegmentLoopCount() {
        return VibrationManager.MaxWaveformEffectSegmentLoopCount;
    }
    static get MaxVibrationWaveformEffectSequenceLoopCount() {
        return VibrationManager.MaxWaveformEffectSequenceLoopCount;
    }

    static get MaxVibrationWaveformSegmentDuration() {
        return VibrationManager.MaxWaveformSegmentDuration;
    }
    static get MaxNumberOfVibrationWaveformSegments() {
        return VibrationManager.MaxNumberOfWaveformSegments;
    }

    /** @param  {...VibrationConfiguration} vibrationConfigurations */
    async triggerVibration(...vibrationConfigurations) {
        /** @type {ArrayBuffer} */
        let triggerVibrationData;
        vibrationConfigurations.forEach((vibrationConfiguration) => {
            const { locations, type } = vibrationConfiguration;

            /** @type {DataView} */
            let dataView;

            switch (type) {
                case "waveformEffect":
                    {
                        const { waveformEffect } = vibrationConfiguration;
                        if (!waveformEffect) {
                            throw Error("waveformEffect not defined in vibrationConfiguration");
                        }
                        const { segments, loopCount } = waveformEffect;
                        dataView = this.#vibrationManager.createWaveformEffectsData(locations, segments, loopCount);
                    }
                    break;
                case "waveform":
                    {
                        const { waveform } = vibrationConfiguration;
                        if (!waveform) {
                            throw Error("waveform not defined in vibrationConfiguration");
                        }
                        const { segments } = waveform;
                        dataView = this.#vibrationManager.createWaveformData(locations, segments);
                    }
                    break;
                default:
                    throw Error(`invalid vibration type "${type}"`);
            }
            _console$a.log({ type, dataView });
            triggerVibrationData = concatenateArrayBuffers(triggerVibrationData, dataView);
        });
        await this.#connectionManager.sendMessage("triggerVibration", triggerVibrationData);
    }

    // CONNECTED DEVICES

    /** @type {Device[]} */
    static #ConnectedDevices = [];
    static get ConnectedDevices() {
        return this.#ConnectedDevices;
    }

    static #UseLocalStorage = false;
    static get UseLocalStorage() {
        return this.#UseLocalStorage;
    }
    static set UseLocalStorage(newUseLocalStorage) {
        this.#AssertLocalStorage();
        _console$a.assertTypeWithError(newUseLocalStorage, "boolean");
        this.#UseLocalStorage = newUseLocalStorage;
        if (this.#UseLocalStorage && !this.#LocalStorageConfiguration) {
            this.#LoadFromLocalStorage();
        }
    }

    /**
     * @typedef LocalStorageConfiguration
     * @type {Object}
     * @property {string[]?} bluetoothDeviceIds
     */

    /** @type {LocalStorageConfiguration} */
    static #DefaultLocalStorageConfiguration = {};
    /** @type {LocalStorageConfiguration?} */
    static #LocalStorageConfiguration;

    static #AssertLocalStorage() {
        _console$a.assertWithError(isInBrowser, "localStorage is only available in the browser");
    }
    static #LocalStorageKey = "BS.Device";
    static #SaveToLocalStorage() {
        this.#AssertLocalStorage();
        localStorage.setItem(this.#LocalStorageKey, JSON.stringify(this.#LocalStorageConfiguration));
    }
    static #LoadFromLocalStorage() {
        this.#AssertLocalStorage();
        let localStorageString = localStorage.getItem(this.#LocalStorageKey);
        if (typeof localStorageString != "string") {
            _console$a.warn("no info found in localStorage");
            this.#LocalStorageConfiguration = Object.assign({}, this.#DefaultLocalStorageConfiguration);
            this.#SaveToLocalStorage();
            return;
        }
        try {
            const configuration = JSON.parse(localStorageString);
            _console$a.log({ configuration });
            return configuration;
        } catch (error) {
            _console$a.error(error);
        }
    }

    /**
     * retrieves devices already connected via web bluetooth in other tabs/windows
     *
     * _only available on web-bluetooth enabled browsers_
     */
    static async GetDevices() {
        if (!isInBrowser) {
            _console$a.warn("GetDevices is only available in the browser");
            return;
        }

        if (!navigator.bluetooth) {
            _console$a.warn("bluetooth is not available in this browser");
            return;
        }

        if (!this.#LocalStorageConfiguration) {
            _console$a.warn("localStorageConfiguration not found");
            return;
        }

        const configuration = this.#LocalStorageConfiguration;
        if (!configuration.bluetoothDeviceIds || configuration.bluetoothDeviceIds.length == 0) {
            _console$a.log("no bluetoothDeviceIds found in configuration");
            return;
        }

        const bluetoothDevices = await navigator.bluetooth.getDevices();

        _console$a.log({ bluetoothDevices });

        const devices = bluetoothDevices
            .map((bluetoothDevice) => {
                if (bluetoothDevice.gatt && configuration.bluetoothDeviceIds.includes(bluetoothDevice.id)) {
                    const device = new Device();
                    device.connectionManager = new WebBluetoothConnectionManager();
                    /** @type {WebBluetoothConnectionManager} */
                    const connectionManager = device.connectionManager;
                    connectionManager.device = bluetoothDevice;
                    return device;
                }
            })
            .filter(Boolean);
        return devices;
    }

    // STATIC EVENTLISTENERS

    /** @type {StaticDeviceEventType[]} */
    static #StaticEventTypes = ["deviceConnected", "deviceDisconnected"];
    static get StaticEventTypes() {
        return this.#StaticEventTypes;
    }
    static #EventDispatcher = new EventDispatcher(this, this.#StaticEventTypes);

    /**
     * @param {StaticDeviceEventType} type
     * @param {EventDispatcherListener} listener
     * @param {EventDispatcherOptions} options
     * @throws {Error}
     */
    static AddEventListener(type, listener, options) {
        this.#EventDispatcher.addEventListener(type, listener, options);
    }

    /**
     * @param {StaticDeviceEvent} event
     */
    static #DispatchEvent(event) {
        this.#EventDispatcher.dispatchEvent(event);
    }

    /**
     * @param {StaticDeviceEventType} type
     * @param {EventDispatcherListener} listener
     */
    static RemoveEventListener(type, listener) {
        return this.#EventDispatcher.removeEventListener(type, listener);
    }

    /** @param {Device} device */
    static #OnDeviceIsConnected(device) {
        if (device.isConnected) {
            if (!this.#ConnectedDevices.includes(device)) {
                _console$a.log("adding device", device);
                this.#ConnectedDevices.push(device);
                if (this.UseLocalStorage && device.connectionType == "webBluetooth") {
                    /** @type {WebBluetoothConnectionManager} */
                    const connectionManager = device.connectionManager;
                    this.#LocalStorageConfiguration.bluetoothDeviceIds.push(connectionManager.device.id);
                    this.#SaveToLocalStorage();
                }
                this.#DispatchEvent({ type: "deviceConnected", message: { device } });
            } else {
                _console$a.warn("device already included");
            }
        } else {
            if (this.#ConnectedDevices.includes(device)) {
                _console$a.log("removing device", device);
                this.#ConnectedDevices.splice(this.#ConnectedDevices.indexOf(device), 1);
                this.#DispatchEvent({ type: "deviceDisconnected", message: { device } });
            } else {
                _console$a.log("device already not included");
            }
        }
    }
}

const _console$9 = createConsole("Timer", { log: false });

class Timer {
    /** @type {function} */
    #callback;
    get callback() {
        return this.#callback;
    }
    set callback(newCallback) {
        _console$9.assertTypeWithError(newCallback, "function");
        _console$9.log({ newCallback });
        this.#callback = newCallback;
        if (this.isRunning) {
            this.restart();
        }
    }

    /** @type {number} */
    #interval;
    get interval() {
        return this.#interval;
    }
    set interval(newInterval) {
        _console$9.assertTypeWithError(newInterval, "number");
        _console$9.assertWithError(newInterval > 0, "interval must be above 0");
        _console$9.log({ newInterval });
        this.#interval = newInterval;
        if (this.isRunning) {
            this.restart();
        }
    }

    /**
     * @param {function} callback
     * @param {number} interval
     */
    constructor(callback, interval) {
        this.interval = interval;
        this.callback = callback;
    }

    /** @type {number?} */
    #intervalId = null;
    get isRunning() {
        return this.#intervalId != null;
    }

    start() {
        if (this.isRunning) {
            _console$9.log("interval already running");
            return;
        }
        _console$9.log("starting interval");
        this.#intervalId = setInterval(this.#callback, this.#interval);
    }
    stop() {
        if (!this.isRunning) {
            _console$9.log("interval already not running");
            return;
        }
        _console$9.log("stopping interval");
        clearInterval(this.#intervalId);
        this.#intervalId = null;
    }
    restart() {
        this.stop();
        this.start();
    }
}

const _console$8 = createConsole("BaseScanner");



/** @typedef {"isAvailable" | "isScanning" | "discoveredPeripheral" | "expiredDiscoveredPeripheral"} ScannerEventType */




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
        _console$8.assertWithError(this.isSupported, `${this.constructor.name} is not supported`);
    }

    // CONSTRUCTOR

    #assertIsSubclass() {
        _console$8.assertWithError(this.constructor != BaseScanner, `${this.constructor.name} must be subclassed`);
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
        _console$8.assertWithError(this.isAvailable, "not available");
    }

    // SCANNING
    get isScanning() {
        return false;
    }
    #assertIsScanning() {
        _console$8.assertWithError(this.isScanning, "not scanning");
    }
    #assertIsNotScanning() {
        _console$8.assertWithError(!this.isScanning, "already scanning");
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
        _console$8.assertWithError(
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
                _console$8.log("discovered peripheral timeout");
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
        _console$8.log("resetting...");
    }
}

const _console$7 = createConsole("NobleScanner", { log: true });

let isSupported = false;

if (isInNode) {
    var noble = require("@abandonware/noble");
    isSupported = true;
}

/** @typedef {"unknown" | "resetting" | "unsupported" | "unauthorized" | "poweredOff" | "poweredOn"} NobleState */




class NobleScanner extends BaseScanner {
    // IS SUPPORTED
    static get isSupported() {
        return isSupported;
    }

    // SCANNING
    #_isScanning = false;
    get #isScanning() {
        return this.#_isScanning;
    }
    set #isScanning(newIsScanning) {
        _console$7.assertTypeWithError(newIsScanning, "boolean");
        if (this.isScanning == newIsScanning) {
            _console$7.log("duplicate isScanning assignment");
            return;
        }
        this.#_isScanning = newIsScanning;
        this.dispatchEvent({ type: "isScanning", message: { isScanning: this.isScanning } });
    }
    get isScanning() {
        return this.#isScanning;
    }

    // NOBLE STATE
    /** @type {NobleState} */
    #_nobleState = "unknown";
    get #nobleState() {
        return this.#_nobleState;
    }
    set #nobleState(newNobleState) {
        _console$7.assertTypeWithError(newNobleState, "string");
        if (this.#nobleState == newNobleState) {
            _console$7.log("duplicate nobleState assignment");
            return;
        }
        this.#_nobleState = newNobleState;
        _console$7.log({ newNobleState });
        this.dispatchEvent({ type: "isAvailable", message: { isAvailable: this.isAvailable } });
    }

    // NOBLE LISTENERS
    #boundNobleListeners = {
        scanStart: this.#onNobleScanStart.bind(this),
        scanStop: this.#onNobleScanStop.bind(this),
        stateChange: this.#onNobleStateChange.bind(this),
        discover: this.#onNobleDiscover.bind(this),
    };
    #onNobleScanStart() {
        _console$7.log("OnNobleScanStart");
        this.#isScanning = true;
    }
    #onNobleScanStop() {
        _console$7.log("OnNobleScanStop");
        this.#isScanning = false;
    }
    /** @param {NobleState} state */
    #onNobleStateChange(state) {
        _console$7.log("onNobleStateChange", state);
        this.#nobleState = state;
    }
    /** @param {noble.Peripheral} noblePeripheral */
    #onNobleDiscover(noblePeripheral) {
        _console$7.log("onNobleDiscover", noblePeripheral);
        if (!this.#noblePeripherals[noblePeripheral.id]) {
            noblePeripheral._scanner = this;
            this.#noblePeripherals[noblePeripheral.id] = noblePeripheral;
            addEventListeners(noblePeripheral, this.#unboundNoblePeripheralListeners);
        }

        /** @type {DiscoveredPeripheral} */
        const discoveredPeripheral = {
            name: noblePeripheral.advertisement.localName,
            id: noblePeripheral.id,
            //deviceType: Device.Types[noblePeripheral.advertisement.serviceData[serviceUUIDs[0]]],
            rssi: noblePeripheral.rssi,
        };
        this.dispatchEvent({ type: "discoveredPeripheral", message: { discoveredPeripheral } });
    }

    // CONSTRUCTOR
    constructor() {
        super();
        addEventListeners(noble, this.#boundNobleListeners);
        addEventListeners(this, this.#boundBaseScannerListeners);
    }

    // AVAILABILITY
    get isAvailable() {
        return this.#nobleState == "poweredOn";
    }

    // SCANNING
    startScan() {
        super.startScan();
        // REMOVE WHEN TESTING
        //noble.startScanningAsync(serviceUUIDs, true);
        noble.startScanningAsync([], true);
    }
    stopScan() {
        super.stopScan();
        noble.stopScanningAsync();
    }

    // MISC
    reset() {
        super.reset();
        noble.reset();
    }

    // BASESCANNER LISTENERS
    #boundBaseScannerListeners = {
        expiredDiscoveredPeripheral: this.#onExpiredDiscoveredPeripheral.bind(this),
    };

    /** @param {ScannerEvent} event */
    #onExpiredDiscoveredPeripheral(event) {
        /** @type {DiscoveredPeripheral} */
        const discoveredPeripheral = event.message.discoveredPeripheral;
        const noblePeripheral = this.#noblePeripherals[discoveredPeripheral.id];
        if (noblePeripheral) {
            // disconnect?
            delete this.#noblePeripherals[discoveredPeripheral.id];
            removeEventListeners(noblePeripheral, this.#unboundNoblePeripheralListeners);
        }
    }

    // DISCOVERED PERIPHERALS
    /** @type {Object.<string, noble.Peripheral>} */
    #noblePeripherals = {};
    /** @param {string} noblePeripheralId */
    #assertValidNoblePeripheralId(noblePeripheralId) {
        _console$7.assertTypeWithError(noblePeripheralId, "string");
        _console$7.assertWithError(
            this.#noblePeripherals[noblePeripheralId],
            `no noblePeripheral found with id "${noblePeripheralId}"`
        );
    }

    // NOBLE PERIPHERAL LISTENERS
    #unboundNoblePeripheralListeners = {
        connect: this.#onNoblePeripheralConnect,
        disconnect: this.#onNoblePeripheralDisconnect,
        rssiUpdate: this.#onNoblePeripheralRssiUpdate,
        servicesDiscover: this.#onNoblePeripheralServicesDiscover,
    };

    #onNoblePeripheralConnect() {
        this._scanner.onNoblePeripheralConnect(this);
    }
    /** @param {noble.Peripheral} noblePeripheral */
    onNoblePeripheralConnect(noblePeripheral) {
        _console$7.log("onNoblePeripheralConnect", noblePeripheral);
    }

    #onNoblePeripheralDisconnect() {
        this._scanner.onNoblePeripheralConnect(this);
    }
    /** @param {noble.Peripheral} noblePeripheral */
    onNoblePeripheralDisconnect(noblePeripheral) {
        _console$7.log("onNoblePeripheralDisconnect", noblePeripheral);
        // FILL
    }

    /** @param {number} rssi */
    #onNoblePeripheralRssiUpdate(rssi) {
        this._scanner.onNoblePeripheralRssiUpdate(this, rssi);
        // FILL
    }
    /**
     * @param {noble.Peripheral} noblePeripheral
     * @param {number} rssi
     */
    onNoblePeripheralRssiUpdate(noblePeripheral, rssi) {
        _console$7.log("onNoblePeripheralRssiUpdate", noblePeripheral, rssi);
        // FILL
    }

    /** @param {noble.Service[]} services */
    #onNoblePeripheralServicesDiscover(services) {
        this._scanner.onNoblePeripheralServicesDiscover(this, services);
    }
    /**
     *
     * @param {noble.Peripheral} noblePeripheral
     * @param {noble.Service[]} services
     */
    onNoblePeripheralServicesDiscover(noblePeripheral, services) {
        _console$7.log("onNoblePeripheralServicesDiscover", noblePeripheral, services);
        // FILL
    }

    // PERIPHERALS
    /** @param {string} peripheralId */
    connectToPeripheral(peripheralId) {
        super.connectToPeripheral(peripheralId);
        this.#assertValidNoblePeripheralId(peripheralId);
        const noblePeripheral = this.#noblePeripherals[peripheralId];
        _console$7.log("connecting to discoveredPeripheral...", peripheralId);

        const device = new Device();
        const nobleConnectionManager = new NobleConnectionManager();
        device.noblePeripheral = noblePeripheral;
        device.connectionManager = nobleConnectionManager;
        device.connect();
    }
    /** @param {string} peripheralId */
    disconnectFromPeripheral(peripheralId) {
        super.disconnectFromPeripheral(peripheralId);
        this.#assertValidNoblePeripheralId(peripheralId);
        this.#noblePeripherals[peripheralId];
        _console$7.log("disconnecting from discoveredPeripheral...", peripheralId);

        // FILL - retrieve device
        // FILL - device.disconnect()
    }
}

const _console$6 = createConsole("Scanner", { log: false });

/** @type {BaseScanner?} */
let scanner;

if (NobleScanner.isSupported) {
    _console$6.log("using NobleScanner");
    scanner = new NobleScanner();
} else {
    _console$6.log("Scanner not available");
}

var Scanner = scanner;

const _console$5 = createConsole("DevicePairPressureSensorDataManager", { log: true });







/**
 * @typedef DevicePairRawPressureData
 * @type {Object}
 * @property {PressureData} left
 * @property {PressureData} right
 */

/**
 * @typedef DevicePairPressureData
 * @type {Object}
 *
 * @property {number} rawSum
 * @property {number} normalizedSum
 *
 * @property {CenterOfPressure?} center
 * @property {CenterOfPressure?} normalizedCenter
 */



class DevicePairPressureSensorDataManager {
    static get Sides() {
        return Device.InsoleSides;
    }
    get sides() {
        return Device.InsoleSides;
    }

    // PRESSURE DATA

    /** @type {DevicePairRawPressureData} */
    #rawPressure = {};

    #centerOfPressureHelper = new CenterOfPressureHelper();

    resetPressureRange() {
        this.#centerOfPressureHelper.reset();
    }

    /** @param {DeviceEvent} event  */
    onDevicePressureData(event) {
        const { pressure } = event.message;
        const insoleSide = event.target.insoleSide;
        _console$5.log({ pressure, insoleSide });
        this.#rawPressure[insoleSide] = pressure;
        if (this.#hasAllPressureData) {
            return this.#updatePressureData();
        } else {
            _console$5.log("doesn't have all pressure data yet...");
        }
    }

    get #hasAllPressureData() {
        return this.sides.every((side) => side in this.#rawPressure);
    }

    static #Scalars = {
        pressure: PressureSensorDataManager.Scalars.pressure / this.Sides.length,
    };
    static get Scalars() {
        return this.#Scalars;
    }
    get scalars() {
        return DevicePairPressureSensorDataManager.Scalars;
    }

    #updatePressureData() {
        this.scalars.pressure;

        // FIX

        /** @type {DevicePairPressureData} */
        const pressure = { rawSum: 0, normalizedSum: 0 };

        this.sides.forEach((side) => {
            pressure.rawSum += this.#rawPressure[side].rawSum;
            pressure.normalizedSum += this.#rawPressure[side].normalizedSum;
        });

        if (pressure.normalizedSum > 0) {
            pressure.center = { x: 0, y: 0 };
            this.sides.forEach((side) => {
                const sidePressure = this.#rawPressure[side];
                const normalizedPressureSumWeight = sidePressure.normalizedSum / pressure.normalizedSum;
                if (normalizedPressureSumWeight > 0) {
                    pressure.center.y += sidePressure.normalizedCenter.y * normalizedPressureSumWeight;
                    if (side == "right") {
                        pressure.center.x = normalizedPressureSumWeight;
                    }
                }
            });

            pressure.normalizedCenter = this.#centerOfPressureHelper.updateAndGetNormalization(pressure.center);
        }

        _console$5.log({ devicePairPressure: pressure });

        return pressure;
    }
}

const _console$4 = createConsole("DevicePairSensorDataManager", { log: true });






class DevicePairSensorDataManager {
    static get Sides() {
        return Device.InsoleSides;
    }
    get sides() {
        return Device.InsoleSides;
    }

    /** @type {Object.<SensorType, Object.<InsoleSide, number>>} */
    #timestamps = {};

    pressureSensorDataManager = new DevicePairPressureSensorDataManager();
    resetPressureRange() {
        this.sides.forEach((side) => {
            this[side]?.resetPressureRange();
        });
        this.pressureSensorDataManager.resetPressureRange();
    }

    /** @param {DeviceEvent} event  */
    onDeviceSensorData(event) {
        const { type } = event;
        const { timestamp } = event.message;

        _console$4.log({ type, timestamp, event });

        /** @type {SensorType} */
        const sensorType = type;

        if (!this.#timestamps[sensorType]) {
            this.#timestamps[sensorType] = {};
        }
        this.#timestamps[sensorType][event.target.insoleSide] = timestamp;

        let value;
        switch (sensorType) {
            case "pressure":
                value = this.pressureSensorDataManager.onDevicePressureData(event);
                break;
            default:
                _console$4.warn(`uncaught sensorType "${sensorType}"`);
                break;
        }

        if (value) {
            const timestamps = Object.assign({}, this.#timestamps[sensorType]);
            this.onDataReceived?.(sensorType, { timestamps, [sensorType]: value });
        } else {
            _console$4.log("no value received");
        }
    }

    /** @type {SensorDataCallback?} */
    onDataReceived;
}

const _console$3 = createConsole("DevicePair", { log: true });




/** @typedef {"pressure" | "isConnected"} DevicePairEventType */








/**
 * @typedef DevicePairEvent
 * @type {Object}
 * @property {DevicePair} target
 * @property {DevicePairEventType} type
 * @property {Object} message
 */

class DevicePair {
    constructor() {
        this.#sensorDataManager.onDataReceived = this.#onSensorDataReceived.bind(this);
    }

    // EVENT DISPATCHER

    /** @type {DevicePairEventType[]} */
    static #EventTypes = ["pressure", "isConnected"];
    static get EventTypes() {
        return this.#EventTypes;
    }
    get eventTypes() {
        return DevicePair.#EventTypes;
    }
    #eventDispatcher = new EventDispatcher(this, this.eventTypes);

    /**
     * @param {DevicePairEventType} type
     * @param {EventDispatcherListener} listener
     * @param {EventDispatcherOptions} options
     */
    addEventListener(type, listener, options) {
        this.#eventDispatcher.addEventListener(type, listener, options);
    }

    /**
     * @param {DevicePairEvent} event
     */
    #dispatchEvent(event) {
        this.#eventDispatcher.dispatchEvent(event);
    }

    /**
     * @param {DevicePairEventType} type
     * @param {EventDispatcherListener} listener
     */
    removeEventListener(type, listener) {
        return this.#eventDispatcher.removeEventListener(type, listener);
    }

    // SIDES

    static get Sides() {
        return Device.InsoleSides;
    }
    get sides() {
        return DevicePair.Sides;
    }

    /** @type {Device?} */
    #left;
    get left() {
        return this.#left;
    }

    /** @type {Device?} */
    #right;
    get right() {
        return this.#right;
    }

    get isConnected() {
        return this.sides.every((side) => this[side]?.isConnected);
    }
    #assertIsConnected() {
        _console$3.assertWithError(this.isConnected, "devicePair must be connected");
    }

    /** @param {Device} device */
    assignInsole(device) {
        if (!device.isInsole) {
            _console$3.warn("device is not an insole");
            return;
        }
        const side = device.insoleSide;

        const currentDevice = this[side];

        if (device == currentDevice) {
            _console$3.warn("device already assigned");
            return;
        }

        if (currentDevice) {
            removeEventListeners(currentDevice, this.#boundDeviceEventListeners);
        }
        addEventListeners(device, this.#boundDeviceEventListeners);

        switch (side) {
            case "left":
                this.#left = device;
                break;
            case "right":
                this.#right = device;
                break;
        }

        _console$3.log(`assigned ${side} insole`, device);

        this.resetPressureRange();

        this.#dispatchEvent({ type: "isConnected", message: { isConnected: this.isConnected } });

        return currentDevice;
    }

    /** @type {Object.<string, EventListener} */
    #boundDeviceEventListeners = {
        //sensorData: this.#onDeviceSensorData.bind(this),
        pressure: this.#onDeviceSensorData.bind(this),
        isConnected: this.#onIsDeviceConnected.bind(this),
    };

    /** @param {DeviceEvent} event  */
    #onIsDeviceConnected(event) {
        this.#dispatchEvent({ type: "isConnected", message: { isConnected: this.isConnected } });
    }

    // SENSOR CONFIGURATION

    /** @param {SensorConfiguration} sensorConfiguration */
    setSensorConfiguration(sensorConfiguration) {
        if (this.isConnected) {
            this.sides.forEach((side) => {
                this[side].setSensorConfiguration(sensorConfiguration);
            });
        }
    }

    // SENSOR DATA
    #sensorDataManager = new DevicePairSensorDataManager();
    /** @param {DeviceEvent} event */
    #onDeviceSensorData(event) {
        if (this.isConnected) {
            this.#sensorDataManager.onDeviceSensorData(event);
        }
    }
    /**
     * @param {SensorType} sensorType
     * @param {Object} sensorData
     * @param {number} sensorData.timestamp
     */
    #onSensorDataReceived(sensorType, sensorData) {
        _console$3.log({ sensorType, sensorData });
        this.#dispatchEvent({ type: sensorType, message: sensorData });
    }

    resetPressureRange() {
        this.#sensorDataManager.resetPressureRange();
    }

    // SHARED INSTANCE

    static #shared = new DevicePair();
    static get shared() {
        return this.#shared;
    }
    static {
        Device.AddEventListener("deviceConnected", (event) => {
            /** @type {Device} */
            const device = event.message.device;
            if (device.isInsole) {
                this.#shared.assignInsole(device);
            }
        });
    }
}

const _console$2 = createConsole("ServerUtils", { log: false });

const pingTimeout = 30_000_000;
const reconnectTimeout = 3_000;

/**
 * @typedef { "ping"
 * | "pong"
 * | "isScanningAvailable"
 * | "isScanning"
 * | "startScan"
 * | "stopScan"
 * | "discoveredPeripheral"
 * | "expiredDiscoveredPeripheral"
 * | "discoveredPeripherals"
 * | "connectToPeripheral"
 * | "disconnectFromPeripheral"
 * | "disconnectFromAllPeripherals"
 * | "peripheralConnectionState"
 * | "connectedPeripherals"
 * | "disconnectedPeripherals"
 * | "peripheralRSSI"
 * | "getPeripheralRSSI"
 * } ServerMessageType
 */

/**
 * @typedef ServerMessage
 * @type {Object}
 * @property {ServerMessageType} type
 * @property {MessageLike|MessageLike[]?} data
 */

/** @type {ServerMessageType[]} */
const ServerMessageTypes = [
    "ping",
    "pong",
    "isScanningAvailable",
    "isScanning",
    "startScan",
    "stopScan",
    "discoveredPeripheral",
    "discoveredPeripherals",
    "expiredDiscoveredPeripheral",
    "peripheralRSSI",
    "connectToPeripheral",
    "disconnectFromPeripheral",
];

/** @param {ServerMessageType} serverMessageType */
function getServerMessageTypeEnum(serverMessageType) {
    _console$2.assertTypeWithError(serverMessageType, "string");
    _console$2.assertWithError(
        ServerMessageTypes.includes(serverMessageType),
        `invalid serverMessageType "${serverMessageType}"`
    );
    return ServerMessageTypes.indexOf(serverMessageType);
}

/** @typedef {Number | Number[] | ArrayBufferLike | DataView} MessageLike */

/** @param {...ServerMessage|ServerMessageType} messages */
function createServerMessage(...messages) {
    _console$2.log("createServerMessage", ...messages);

    const messageBuffers = messages.map((message) => {
        if (typeof message == "string") {
            message = { type: message };
        }

        if ("data" in message) {
            if (!Array.isArray(message.data)) {
                message.data = [message.data];
            }
        } else {
            message.data = [];
        }

        const messageDataArrayBuffer = concatenateArrayBuffers(...message.data);
        const messageDataArrayBufferByteLength = messageDataArrayBuffer.byteLength;

        return concatenateArrayBuffers(
            getServerMessageTypeEnum(message.type),
            messageDataArrayBufferByteLength,
            messageDataArrayBuffer
        );
    });
    _console$2.log("messageBuffers", ...messageBuffers);
    return concatenateArrayBuffers(...messageBuffers);
}

const textDecoder = new TextDecoder();

/**
 * @param {DataView} dataView
 * @param {number} byteOffset
 */
function parseStringFromDataView(dataView, byteOffset) {
    const stringLength = dataView.getUint8(byteOffset++);
    const string = textDecoder.decode(dataView.buffer.slice(byteOffset, byteOffset + stringLength));
    byteOffset += stringLength;
    return string;
}

const pingMessage = createServerMessage("ping");
const pongMessage = createServerMessage("pong");
const isScanningAvailableRequestMessage = createServerMessage("isScanningAvailable");
const isScanningRequestMessage = createServerMessage("isScanning");
const startScanRequestMessage = createServerMessage("startScan");
const stopScanRequestMessage = createServerMessage("stopScan");
const discoveredPeripheralsMessage = createServerMessage("discoveredPeripherals");

const _console$1 = createConsole("WebSocketClient", { log: true });




/** @typedef {"not connected" | "connecting" | "connected" | "disconnecting"} ClientConnectionStatus */

/** @typedef {ClientConnectionStatus | "connectionStatus" |  "isConnected" | "isScanningAvailable" | "isScanning" | "discoveredPeripheral" | "expiredDiscoveredPeripheral"} ClientEventType */

/**
 * @typedef ClientEvent
 * @type {Object}
 * @property {WebSocketClient} target
 * @property {ClientEventType} type
 * @property {Object} message
 */



class WebSocketClient {
    // EVENT DISPATCHER

    /** @type {ClientEventType[]} */
    static #EventTypes = [
        "connectionStatus",
        "connecting",
        "connected",
        "disconnecting",
        "not connected",
        "isConnected",
        "isScanningAvailable",
        "isScanning",
        "discoveredPeripheral",
        "expiredDiscoveredPeripheral",
    ];
    static get EventTypes() {
        return this.#EventTypes;
    }
    get eventTypes() {
        return WebSocketClient.#EventTypes;
    }
    #eventDispatcher = new EventDispatcher(this, this.eventTypes);

    /**
     * @param {ClientEventType} type
     * @param {EventDispatcherListener} listener
     * @param {EventDispatcherOptions} options
     */
    addEventListener(type, listener, options) {
        this.#eventDispatcher.addEventListener(type, listener, options);
    }

    /**
     * @param {ClientEvent} event
     */
    #dispatchEvent(event) {
        this.#eventDispatcher.dispatchEvent(event);
    }

    /**
     * @param {ClientEventType} type
     * @param {EventDispatcherListener} listener
     */
    removeEventListener(type, listener) {
        return this.#eventDispatcher.removeEventListener(type, listener);
    }

    // WEBSOCKET

    /** @type {WebSocket?} */
    #webSocket;
    get webSocket() {
        return this.#webSocket;
    }
    set webSocket(newWebSocket) {
        if (this.#webSocket == newWebSocket) {
            _console$1.warn("redundant webSocket assignment");
            return;
        }

        _console$1.log("assigning webSocket", newWebSocket);

        if (this.#webSocket) {
            removeEventListeners(this.#webSocket, this.#boundWebSocketEventListeners);
        }

        addEventListeners(newWebSocket, this.#boundWebSocketEventListeners);
        this.#webSocket = newWebSocket;

        _console$1.log("assigned webSocket");
    }

    get isConnected() {
        return this.webSocket?.readyState == WebSocket.OPEN;
    }
    #assertConnection() {
        _console$1.assertWithError(this.isConnected, "not connected");
    }

    get isDisconnected() {
        return this.webSocket?.readyState == WebSocket.CLOSED;
    }
    #assertDisconnection() {
        _console$1.assertWithError(this.isDisconnected, "not disconnected");
    }

    /** @param {string | URL} url */
    connect(url = `wss://${location.host}`) {
        if (this.webSocket) {
            this.#assertDisconnection();
        }
        this.#connectionStatus = "connecting";
        this.webSocket = new WebSocket(url);
    }

    disconnect() {
        this.#assertConnection();
        if (this.reconnectOnDisconnection) {
            this.reconnectOnDisconnection = false;
            this.webSocket.addEventListener(
                "close",
                () => {
                    this.reconnectOnDisconnection = true;
                },
                { once: true }
            );
        }
        this.#connectionStatus = "disconnecting";
        this.webSocket.close();
    }

    reconnect() {
        this.#assertDisconnection();
        this.webSocket = new WebSocket(this.webSocket.url);
    }

    static #ReconnectOnDisconnection = true;
    static get ReconnectOnDisconnection() {
        return this.#ReconnectOnDisconnection;
    }
    static set ReconnectOnDisconnection(newReconnectOnDisconnection) {
        _console$1.assertTypeWithError(newReconnectOnDisconnection, "boolean");
        this.#ReconnectOnDisconnection = newReconnectOnDisconnection;
    }

    #reconnectOnDisconnection = WebSocketClient.#ReconnectOnDisconnection;
    get reconnectOnDisconnection() {
        return this.#reconnectOnDisconnection;
    }
    set reconnectOnDisconnection(newReconnectOnDisconnection) {
        _console$1.assertTypeWithError(newReconnectOnDisconnection, "boolean");
        this.#reconnectOnDisconnection = newReconnectOnDisconnection;
    }

    // WEBSOCKET EVENTS

    #boundWebSocketEventListeners = {
        open: this.#onWebSocketOpen.bind(this),
        message: this.#onWebSocketMessage.bind(this),
        close: this.#onWebSocketClose.bind(this),
        error: this.#onWebSocketError.bind(this),
    };

    /** @param {Event} event */
    #onWebSocketOpen(event) {
        _console$1.log("webSocket.open", event);
        this.#pingTimer.start();
        this.#connectionStatus = "connected";
    }
    /** @param {import("ws").MessageEvent} event */
    async #onWebSocketMessage(event) {
        _console$1.log("webSocket.message", event);
        this.#pingTimer.restart();
        const arrayBuffer = await event.data.arrayBuffer();
        const dataView = new DataView(arrayBuffer);
        this.#parseMessage(dataView);
    }
    /** @param {import("ws").CloseEvent} event  */
    #onWebSocketClose(event) {
        _console$1.log("webSocket.close", event);

        this.#connectionStatus = "not connected";

        this.#pingTimer.stop();
        if (this.#reconnectOnDisconnection) {
            setTimeout(() => {
                this.reconnect();
            }, reconnectTimeout);
        }
    }
    /** @param {Event} event */
    #onWebSocketError(event) {
        _console$1.log("webSocket.error", event);
    }

    // CONNECTION STATUS

    /** @type {ClientConnectionStatus} */
    #_connectionStatus = "not connected";
    get #connectionStatus() {
        return this.#_connectionStatus;
    }
    set #connectionStatus(newConnectionStatus) {
        _console$1.assertTypeWithError(newConnectionStatus, "string");
        _console$1.log({ newConnectionStatus });
        this.#_connectionStatus = newConnectionStatus;

        this.#dispatchEvent({ type: "connectionStatus", message: { connectionStatus: this.connectionStatus } });
        this.#dispatchEvent({ type: this.connectionStatus });

        switch (newConnectionStatus) {
            case "connected":
            case "not connected":
                this.#dispatchEvent({ type: "isConnected", message: { isConnected: this.isConnected } });
                if (this.isConnected) {
                    this.#requestIsScanningAvailable();
                    this.#requestDiscoveredPeripherals();
                } else {
                    this.#isScanningAvailable = false;
                    this.#isScanning = false;
                }
                break;
        }
    }
    get connectionStatus() {
        return this.#connectionStatus;
    }

    // PARSING
    static #TextDecoder = new TextDecoder();
    get #textDecoder() {
        return WebSocketClient.#TextDecoder;
    }
    /** @param {DataView} dataView */
    #parseMessage(dataView) {
        _console$1.log("parseMessage", { dataView });
        let byteOffset = 0;
        while (byteOffset < dataView.byteLength) {
            const messageTypeEnum = dataView.getUint8(byteOffset++);
            const messageType = ServerMessageTypes[messageTypeEnum];
            const messageByteLength = dataView.getUint8(byteOffset++);

            _console$1.log({ messageTypeEnum, messageType, messageByteLength });
            _console$1.assertWithError(messageType, `invalid messageTypeEnum ${messageTypeEnum}`);

            let _byteOffset = byteOffset;

            switch (messageType) {
                case "ping":
                    this.#pong();
                    break;
                case "pong":
                    break;
                case "isScanningAvailable":
                    {
                        const isScanningAvailable = Boolean(dataView.getUint8(_byteOffset++));
                        _console$1.log({ isScanningAvailable });
                        this.#isScanningAvailable = isScanningAvailable;
                    }
                    break;
                case "isScanning":
                    {
                        const isScanning = Boolean(dataView.getUint8(_byteOffset++));
                        _console$1.log({ isScanning });
                        this.#isScanning = isScanning;
                    }
                    break;
                case "discoveredPeripheral":
                    {
                        const discoveredPeripheralString = parseStringFromDataView(dataView, _byteOffset);
                        _console$1.log({ discoveredPeripheralString });
                        _byteOffset += discoveredPeripheralString.length;

                        /** @type {DiscoveredPeripheral} */
                        const discoveredPeripheral = JSON.parse(discoveredPeripheralString);
                        _console$1.log({ discoveredPeripheral });

                        this.#onDiscoveredPeripheral(discoveredPeripheral);
                    }
                    break;
                case "expiredDiscoveredPeripheral":
                    {
                        const discoveredPeripheralId = parseStringFromDataView(dataView, _byteOffset);
                        _byteOffset += discoveredPeripheralId.length;
                        this.#onExpiredDiscoveredPeripheral(discoveredPeripheralId);
                    }
                    break;
                default:
                    _console$1.error(`uncaught messageType "${messageType}"`);
                    break;
            }
            byteOffset += messageByteLength;
        }
    }

    // PING
    #pingTimer = new Timer(this.#ping.bind(this), pingTimeout);
    #ping() {
        this.#assertConnection();
        this.webSocket.send(pingMessage);
    }
    #pong() {
        this.#assertConnection();
        this.webSocket.send(pongMessage);
    }

    // SCANNING
    #_isScanningAvailable = false;
    get #isScanningAvailable() {
        return this.#_isScanningAvailable;
    }
    set #isScanningAvailable(newIsAvailable) {
        _console$1.assertTypeWithError(newIsAvailable, "boolean");
        this.#_isScanningAvailable = newIsAvailable;
        this.#dispatchEvent({
            type: "isScanningAvailable",
            message: { isScanningAvailable: this.isScanningAvailable },
        });
        if (this.isScanningAvailable) {
            this.#requestIsScanning();
        }
    }
    get isScanningAvailable() {
        return this.#isScanningAvailable;
    }
    #assertIsScanningAvailable() {
        this.#assertConnection();
        _console$1.assertWithError(this.isScanningAvailable, "scanning is not available");
    }
    #requestIsScanningAvailable() {
        this.#assertConnection();
        this.webSocket.send(isScanningAvailableRequestMessage);
    }

    #_isScanning = false;
    get #isScanning() {
        return this.#_isScanning;
    }
    set #isScanning(newIsScanning) {
        _console$1.assertTypeWithError(newIsScanning, "boolean");
        this.#_isScanning = newIsScanning;
        this.#dispatchEvent({ type: "isScanning", message: { isScanning: this.isScanning } });
    }
    get isScanning() {
        return this.#isScanning;
    }
    #requestIsScanning() {
        this.#assertConnection();
        this.webSocket.send(isScanningRequestMessage);
    }

    #assertIsScanning() {
        _console$1.assertWithError(this.isScanning, "is not scanning");
    }
    #assertIsNotScanning() {
        _console$1.assertWithError(!this.isScanning, "is already scanning");
    }

    startScan() {
        this.#assertIsNotScanning();
        this.webSocket.send(startScanRequestMessage);
    }
    stopScan() {
        this.#assertIsScanning();
        this.webSocket.send(stopScanRequestMessage);
    }
    toggleScan() {
        this.#assertIsScanningAvailable();

        if (this.isScanning) {
            this.stopScan();
        } else {
            this.startScan();
        }
    }

    // PERIPHERALS
    /** @type {Object.<string, DiscoveredPeripheral>} */
    #discoveredPeripherals = {};
    get discoveredPeripherals() {
        return this.#discoveredPeripherals;
    }
    /** @param {string} discoveredPeripheralId */
    #assertValidDiscoveredPeripheralId(discoveredPeripheralId) {
        _console$1.assertTypeWithError(discoveredPeripheralId, "string");
        _console$1.assertWithError(
            this.#discoveredPeripherals[discoveredPeripheralId],
            `no discoveredPeripheral found with id "${discoveredPeripheralId}"`
        );
    }

    /** @param {DiscoveredPeripheral} discoveredPeripheral */
    #onDiscoveredPeripheral(discoveredPeripheral) {
        _console$1.log({ discoveredPeripheral });
        this.#discoveredPeripherals[discoveredPeripheral.id] = discoveredPeripheral;
        this.#dispatchEvent({ type: "discoveredPeripheral", message: { discoveredPeripheral } });
    }
    #requestDiscoveredPeripherals() {
        this.#assertConnection();
        this.webSocket.send(discoveredPeripheralsMessage);
    }
    /** @param {string} discoveredPeripheralId */
    #onExpiredDiscoveredPeripheral(discoveredPeripheralId) {
        _console$1.log({ discoveredPeripheralId });
        let discoveredPeripheral = this.#discoveredPeripherals[discoveredPeripheralId];
        if (discoveredPeripheral) {
            _console$1.log({ expiredDiscoveredPeripheral: discoveredPeripheral });
            delete this.#discoveredPeripherals[discoveredPeripheralId];
            this.#dispatchEvent({ type: "expiredDiscoveredPeripheral", message: { discoveredPeripheral } });
        } else {
            _console$1.warn(`no discoveredPeripheral found with id "${discoveredPeripheralId}"`);
        }
    }

    // PERIPHERAL CONNECTION

    /** @param {string} peripheralId */
    connectToPeripheral(peripheralId) {
        this.#requestConnectionToPeripheral(peripheralId);
    }
    /** @param {string} peripheralId */
    disconnectFromPeripheral(peripheralId) {
        this.#requestDisconnectionFromPeripheral(peripheralId);
    }

    /** @param {string} peripheralId */
    #requestConnectionToPeripheral(peripheralId) {
        this.#assertConnection();
        _console$1.assertTypeWithError(peripheralId, "string");
        this.webSocket.send(this.#createConnectionToPeripheralMessage(peripheralId));
    }
    /** @param {string} peripheralId */
    #requestDisconnectionFromPeripheral(peripheralId) {
        this.#assertConnection();
        _console$1.assertTypeWithError(peripheralId, "string");
        this.webSocket.send(this.#createDisconnectFromPeripheralMessage(peripheralId));
    }

    /** @param {string} peripheralId */
    #createConnectionToPeripheralMessage(peripheralId) {
        return createServerMessage({ type: "connectToPeripheral", data: peripheralId });
    }
    /** @param {string} peripheralId */
    #createDisconnectFromPeripheralMessage(peripheralId) {
        return createServerMessage({ type: "disconnectFromPeripheral", data: peripheralId });
    }

    // DEVICES
    /** @type {Object.<string, Device>} */
    #devices = {};
    get devices() {
        return this.#devices;
    }
}

const _console = createConsole("WebSocketServer", { log: true });






/** @typedef {"clientConnected" | "clientDisconnected"} ServerEventType */

/**
 * @typedef ServerEvent
 * @type {Object}
 * @property {WebSocketServer} target
 * @property {ServerEventType} type
 * @property {Object} message
 */



if (isInNode) {
    require("ws");
}

class WebSocketServer {
    constructor() {
        if (Scanner) {
            addEventListeners(Scanner, this.#boundScannerListeners);
        }
    }

    // EVENT DISPATCHER

    /** @type {ServerEventType[]} */
    static #EventTypes = ["clientConnected", "clientDisconnected"];
    static get EventTypes() {
        return this.#EventTypes;
    }
    get eventTypes() {
        return WebSocketServer.#EventTypes;
    }
    #eventDispatcher = new EventDispatcher(this, this.eventTypes);

    /**
     * @param {ServerEventType} type
     * @param {EventDispatcherListener} listener
     * @param {EventDispatcherOptions} options
     */
    addEventListener(type, listener, options) {
        this.#eventDispatcher.addEventListener(type, listener, options);
    }

    /**
     * @param {ServerEvent} event
     */
    #dispatchEvent(event) {
        this.#eventDispatcher.dispatchEvent(event);
    }

    /**
     * @param {ServerEventType} type
     * @param {EventDispatcherListener} listener
     */
    removeEventListener(type, listener) {
        return this.#eventDispatcher.removeEventListener(type, listener);
    }

    // SERVER

    /** @type {ws.WebSocketServer?} */
    #server;
    get server() {
        return this.#server;
    }
    set server(newServer) {
        if (this.#server == newServer) {
            _console.warn("redundant WebSocket assignment");
            return;
        }
        _console.log("assigning server...");

        if (this.#server) {
            _console.log("clearing existing server...");
            removeEventListeners(this.#server, this.#boundServerListeners);
        }

        addEventListeners(newServer, this.#boundServerListeners);
        this.#server = newServer;

        _console.log("assigned server");
    }

    /** @param {DataView} data */
    broadcast(data) {
        this.server.clients.forEach((client) => {
            client.send(data);
        });
    }

    // SERVER LISTENERS
    #boundServerListeners = {
        close: this.#onServerClose.bind(this),
        connection: this.#onServerConnection.bind(this),
        error: this.#onServerError.bind(this),
        headers: this.#onServerHeaders.bind(this),
        listening: this.#onServerListening.bind(this),
    };

    #onServerClose() {
        _console.log("server.close");
    }
    /** @param {ws.WebSocket} client */
    #onServerConnection(client) {
        _console.log("server.connection");
        client.isAlive = true;
        client.pingClientTimer = new Timer(() => this.#pingClient(client), pingTimeout);
        client.pingClientTimer.start();
        addEventListeners(client, this.#boundClientListeners);
        this.#dispatchEvent({ type: "clientConnected", message: { client } });
    }
    /** @param {Error} error */
    #onServerError(error) {
        _console.error(error);
    }
    #onServerHeaders() {
        //_console.log("server.headers");
    }
    #onServerListening() {
        _console.log("server.listening");
    }

    // CLIENT LISTENERS
    #boundClientListeners = {
        open: this.#onClientOpen.bind(this),
        message: this.#onClientMessage.bind(this),
        close: this.#onClientClose.bind(this),
        error: this.#onClientError.bind(this),
    };
    /** @param {ws.Event} event */
    #onClientOpen(event) {
        _console.log("client.open");
    }
    /** @param {ws.MessageEvent} event */
    #onClientMessage(event) {
        _console.log("client.message");
        const client = event.target;
        client.isAlive = true;
        client.pingClientTimer.restart();
        const dataView = new DataView(dataToArrayBuffer(event.data));
        this.#parseClientMessage(client, dataView);
    }
    /** @param {ws.CloseEvent} event */
    #onClientClose(event) {
        _console.log("client.close");
        const client = event.target;
        client.pingClientTimer.stop();
        removeEventListeners(client, this.#boundClientListeners);
        this.#dispatchEvent({ type: "clientDisconnected", message: { client } });
    }
    /** @param {ws.ErrorEvent} event */
    #onClientError(event) {
        _console.log("client.error");
    }

    // PARSING

    static #TextDecoder = new TextDecoder();
    get #textDecoder() {
        return WebSocketServer.#TextDecoder;
    }

    /**
     * @param {ws.WebSocket} client
     * @param {DataView} dataView
     */
    #parseClientMessage(client, dataView) {
        let byteOffset = 0;
        while (byteOffset < dataView.byteLength) {
            const messageTypeEnum = dataView.getUint8(byteOffset++);
            const messageType = ServerMessageTypes[messageTypeEnum];
            const messageByteLength = dataView.getUint8(byteOffset++);

            _console.log({ messageTypeEnum, messageType, messageByteLength });
            _console.assertWithError(messageType, `invalid messageTypeEnum ${messageTypeEnum}`);

            let _byteOffset = byteOffset;

            switch (messageType) {
                case "ping":
                    client.send(pongMessageBuffer);
                    break;
                case "pong":
                    break;
                case "isScanningAvailable":
                    client.send(this.#isScanningAvailableMessage);
                    break;
                case "isScanning":
                    client.send(this.#isScanningMessage);
                    break;
                case "startScan":
                    Scanner.startScan();
                    break;
                case "stopScan":
                    Scanner.stopScan();
                    break;
                case "discoveredPeripherals":
                    client.send(this.#discoveredPeripheralsMessage);
                    break;
                case "connectToPeripheral":
                    {
                        const peripheralId = parseStringFromDataView(dataView, _byteOffset);
                        _byteOffset += peripheralId.length;
                        Scanner.connectToPeripheral(peripheralId);
                    }
                    break;
                case "disconnectFromPeripheral":
                    {
                        const peripheralId = parseStringFromDataView(dataView, _byteOffset);
                        _byteOffset += peripheralId.length;
                        Scanner.disconnectFromPeripheral(peripheralId);
                    }
                    break;
                case "disconnectFromAllPeripherals":
                    // FILL
                    break;
                default:
                    _console.error(`uncaught messageType "${messageType}"`);
                    break;
            }

            byteOffset += messageByteLength;
        }
    }

    // CLIENT MESSAGING
    get #isScanningAvailableMessage() {
        return createServerMessage({ type: "isScanningAvailable", data: Scanner.isAvailable });
    }
    get #isScanningMessage() {
        return createServerMessage({ type: "isScanning", data: Scanner.isScanning });
    }

    /** @param {ws.BufferLike} message */
    #broadcastMessage(message) {
        this.server.clients.forEach((client) => {
            client.send(message);
        });
    }

    // PING
    /** @param {ws.WebSocket} client */
    #pingClient(client) {
        if (!client.isAlive) {
            client.terminate();
            return;
        }
        client.isAlive = false;
        client.send(pingMessage);
    }

    // SCANNER
    #boundScannerListeners = {
        isAvailable: this.#onScannerIsAvailable.bind(this),
        isScanning: this.#onScannerIsScanning.bind(this),
        discoveredPeripheral: this.#onScannerDiscoveredPeripheral.bind(this),
        expiredDiscoveredPeripheral: this.#onExpiredDiscoveredPeripheral.bind(this),
    };

    /** @param {ScannerEvent} event */
    #onScannerIsAvailable(event) {
        this.#broadcastMessage(this.#isScanningAvailableMessage);
    }
    /** @param {ScannerEvent} event */
    #onScannerIsScanning(event) {
        this.#broadcastMessage(this.#isScanningMessage);
    }
    /** @param {ScannerEvent} event */
    #onScannerDiscoveredPeripheral(event) {
        /** @type {DiscoveredPeripheral} */
        const discoveredPeripheral = event.message.discoveredPeripheral;
        console.log(discoveredPeripheral);

        this.#broadcastMessage(this.#createDiscoveredPeripheralMessage(discoveredPeripheral));
    }
    /** @param {ScannerEvent} event */
    #onExpiredDiscoveredPeripheral(event) {
        /** @type {DiscoveredPeripheral} */
        const discoveredPeripheral = event.message.discoveredPeripheral;
        console.log("expired", discoveredPeripheral);

        this.#broadcastMessage(this.#createExpiredDiscoveredPeripheralMessage(discoveredPeripheral));
    }

    /** @param {DiscoveredPeripheral} discoveredPeripheral */
    #createDiscoveredPeripheralMessage(discoveredPeripheral) {
        return createServerMessage({ type: "discoveredPeripheral", data: discoveredPeripheral });
    }
    get #discoveredPeripheralsMessage() {
        return createServerMessage(
            ...Scanner.discoveredPeripheralsArray.map((discoveredPeripheral) => {
                return { type: "discoveredPeripheral", data: discoveredPeripheral };
            })
        );
    }

    /** @param {DiscoveredPeripheral} discoveredPeripheral */
    #createExpiredDiscoveredPeripheralMessage(discoveredPeripheral) {
        return createServerMessage({ type: "expiredDiscoveredPeripheral", data: discoveredPeripheral.id });
    }
}

var BS = {
    setAllConsoleLevelFlags,
    setConsoleLevelFlagsForType,
    Device,
    DevicePair,
    WebSocketClient,
    WebSocketServer,
    Scanner,
};

module.exports = BS;
