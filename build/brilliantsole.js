/**
 * @copyright Zack Qattan 2024
 * @license MIT
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.BS = factory());
})(this, (function () { 'use strict';

	/** @type {"__BRILLIANTSOLE__DEV__" | "__BRILLIANTSOLE__PROD__"} */
	const isInDev = "__BRILLIANTSOLE__PROD__" == "__BRILLIANTSOLE__DEV__";

	// https://github.com/flexdinesh/browser-or-node/blob/master/src/index.ts
	const isInBrowser = typeof window !== "undefined" && window?.document !== "undefined";
	const isInNode = typeof process !== "undefined" && process?.versions?.node != null;

	isInBrowser && navigator.userAgent.includes("Android");

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

	const _console$9 = createConsole("EventDispatcher", { log: false });

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
	     * @param {string[]?} eventTypes
	     */
	    constructor(eventTypes) {
	        _console$9.assertWithError(Array.isArray(eventTypes) || eventTypes == undefined, "eventTypes must be an array");
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
	        _console$9.assertWithError(this.#isValidEventType(type), `invalid event type "${type}"`);
	    }

	    /** @type {Object.<string, [function]?>?} */
	    #listeners;

	    /**
	     * @param {string} type
	     * @param {EventDispatcherListener} listener
	     * @param {EventDispatcherOptions?} options
	     */
	    addEventListener(type, listener, options) {
	        _console$9.log(`adding "${type}" eventListener`, listener);
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
	        _console$9.log(`has "${type}" eventListener?`, listener);
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
	        _console$9.log(`removing "${type}" eventListener`, listener);
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

	/** @typedef {"web bluetooth" | "noble"} ConnectionType */
	/** @typedef {"not connected" | "connecting" | "connected" | "disconnecting"} ConnectionStatus */
	/** @typedef {"manufacturerName" | "modelNumber" | "softwareRevision" | "hardwareRevision" | "firmwareRevision" | "pnpId" | "serialNumber" | "batteryLevel" | "getName" | "setName" | "getType" | "setType" | "getSensorConfiguration" | "setSensorConfiguration" | "sensorData" | "triggerVibration"} ConnectionMessageType */

	const _console$8 = createConsole("ConnectionManager");

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
	        _console$8.assertWithError(this.isSupported, `${this.constructor.name} is not supported`);
	    }

	    /** @throws {Error} if abstract class */
	    #assertIsSubclass() {
	        _console$8.assertWithError(this.constructor != ConnectionManager, `${this.constructor.name} must be subclassed`);
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
	        _console$8.assertTypeWithError(newConnectionStatus, "string");
	        if (this.#status == newConnectionStatus) {
	            _console$8.warn("same connection status");
	            return;
	        }
	        _console$8.log(`new connection status "${newConnectionStatus}"`);
	        this.#status = newConnectionStatus;
	        this.onStatusUpdated?.(this.status);
	    }

	    get isConnected() {
	        return this.status == "connected";
	    }

	    /** @throws {Error} if connected */
	    #assertIsNotConnected() {
	        _console$8.assertWithError(!this.isConnected, "device is already connected");
	    }
	    /** @throws {Error} if connecting */
	    #assertIsNotConnecting() {
	        _console$8.assertWithError(this.status != "connecting", "device is already connecting");
	    }
	    /** @throws {Error} if not connected */
	    #assertIsConnected() {
	        _console$8.assertWithError(this.isConnected, "device is not connected");
	    }
	    /** @throws {Error} if disconnecting */
	    #assertIsNotDisconnecting() {
	        _console$8.assertWithError(this.status != "disconnecting", "device is already disconnecting");
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
	        _console$8.assert(this.canReconnect, "unable to reconnect");
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
	        _console$8.log("sending message", { messageType, data });
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
	        return Object.entries(this.services).find(([serviceName, serviceInfo]) => {
	            return serviceUUID == serviceInfo.uuid;
	        })?.[0];
	    },

	    /**
	     * @param {BluetoothCharacteristicUUID} characteristicUUID
	     * @returns {BluetoothCharacteristicName?}
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
	const optionalServiceUUIDs = bluetoothUUIDs.optionalServiceUUIDs;

	/** @param {BluetoothServiceUUID} serviceUUID */
	function getServiceNameFromUUID(serviceUUID) {
	    return bluetoothUUIDs.getServiceNameFromUUID(serviceUUID);
	}

	/** @param {BluetoothCharacteristicUUID} characteristicUUID */
	function getCharacteristicNameFromUUID(characteristicUUID) {
	    return bluetoothUUIDs.getCharacteristicNameFromUUID(characteristicUUID);
	}

	const _console$7 = createConsole("WebBluetoothConnectionManager", { log: true });






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
	        return "web bluetooth";
	    }

	    /** @type {BluetoothDevice?} */
	    #device;
	    get device() {
	        return this.#device;
	    }
	    set device(newDevice) {
	        if (this.#device == newDevice) {
	            _console$7.warn("tried to assign the same BluetoothDevice");
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

	            _console$7.log("got BluetoothDevice");
	            this.device = device;

	            _console$7.log("connecting to device...");
	            const server = await this.device.gatt.connect();
	            _console$7.log(`connected to device? ${server.connected}`);

	            await this.#getServicesAndCharacteristics();

	            _console$7.log("fully connected");

	            this.status = "connected";
	        } catch (error) {
	            _console$7.error(error);
	            this.status = "not connected";
	            this.server?.disconnect();
	            this.#removeEventListeners();
	        }
	    }
	    async #getServicesAndCharacteristics() {
	        this.#removeEventListeners();

	        _console$7.log("getting services...");
	        const services = await this.server.getPrimaryServices();
	        _console$7.log("got services", services.length);

	        _console$7.log("getting characteristics...");
	        for (const serviceIndex in services) {
	            const service = services[serviceIndex];
	            const serviceName = getServiceNameFromUUID(service.uuid);
	            _console$7.assertWithError(serviceName, `no name found for service uuid "${service.uuid}"`);
	            _console$7.log(`got "${serviceName}" service`);
	            if (serviceName == "dfu") {
	                _console$7.log("skipping dfu service");
	                continue;
	            }
	            service._name = serviceName;
	            this.#services.set(serviceName, service);
	            _console$7.log(`getting characteristics for "${serviceName}" service`);
	            const characteristics = await service.getCharacteristics();
	            _console$7.log(`got characteristics for "${serviceName}" service`);
	            for (const characteristicIndex in characteristics) {
	                const characteristic = characteristics[characteristicIndex];
	                const characteristicName = getCharacteristicNameFromUUID(characteristic.uuid);
	                _console$7.assertWithError(
	                    characteristicName,
	                    `no name found for characteristic uuid "${characteristic.uuid}" in "${serviceName}" service`
	                );
	                _console$7.log(`got "${characteristicName}" characteristic in "${serviceName}" service`);
	                characteristic._name = characteristicName;
	                this.#characteristics.set(characteristicName, characteristic);
	                addEventListeners(characteristic, this.#boundBluetoothCharacteristicEventListeners);
	                if (characteristic.properties.read) {
	                    _console$7.log(`reading "${characteristicName}" characteristic...`);
	                    await characteristic.readValue();
	                }
	                if (characteristic.properties.notify) {
	                    _console$7.log(`starting notifications for "${characteristicName}" characteristic`);
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
	        _console$7.log("disconnecting from device...");
	        this.server?.disconnect();
	        this.#removeEventListeners();
	    }

	    /** @param {Event} event */
	    #onCharacteristicvaluechanged(event) {
	        _console$7.log("oncharacteristicvaluechanged");

	        /** @type {BluetoothRemoteGATTCharacteristic} */
	        const characteristic = event.target;
	        /** @type {BluetoothCharacteristicName} */
	        const characteristicName = characteristic._name;
	        _console$7.assertWithError(
	            characteristicName,
	            `no name found for characteristic with uuid "${characteristic.uuid}"`
	        );

	        _console$7.log(`oncharacteristicvaluechanged for "${characteristicName}" characteristic`);
	        const dataView = characteristic.value;
	        _console$7.assertWithError(dataView, `no data found for "${characteristicName}" characteristic`);
	        _console$7.log(`data for "${characteristicName}" characteristic`, Array.from(new Uint8Array(dataView.buffer)));

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
	        _console$7.log("gattserverdisconnected");
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
	        switch (messageType) {
	            case "setName":
	                characteristic = this.#characteristics.get("name");
	                break;
	            case "setType":
	                characteristic = this.#characteristics.get("type");
	                break;
	            case "setSensorConfiguration":
	                characteristic = this.#characteristics.get("sensorConfiguration");
	                break;
	            case "triggerVibration":
	                characteristic = this.#characteristics.get("vibration");
	                break;
	            default:
	                throw Error(`uncaught messageType "${messageType}"`);
	        }

	        _console$7.assert(characteristic, "no characteristic found");
	        await characteristic.writeValueWithResponse(data);
	        if (characteristic.properties.read) {
	            await characteristic.readValue();
	        }
	    }

	    /** @type {boolean} */
	    get canReconnect() {
	        return this.server && !this.server.connected;
	    }
	    async reconnect() {
	        await super.reconnect();
	        _console$7.log("attempting to reconnect...");
	        await this.server.connect();
	        if (this.isConnected) {
	            _console$7.log("successfully reconnected!");
	            await this.#getServicesAndCharacteristics();
	            this.status = "connected";
	        } else {
	            _console$7.log("unable to reconnect");
	            this.status = "not connected";
	        }
	    }
	}

	createConsole("NobleConnectionManager", { log: true });

	if (isInNode) {
	    require("@abandonware/noble");
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
	 * @typedef Vector2
	 * @type {Object}
	 * @property {number} x
	 * @property {number} y
	 */

	/** @typedef {Vector2} CenterOfPressure */
	/**
	 * @typedef CenterOfPressureRange
	 * @type {Object}
	 * @property {Vector2} min
	 * @property {Vector2} max
	 */

	class CenterOfPressureHelper {
	    /** @type {CenterOfPressure} */
	    #centerOfPressureRange;
	    resetRange() {
	        this.#centerOfPressureRange = {
	            min: { x: Infinity, y: Infinity },
	            max: { x: -Infinity, y: -Infinity },
	        };
	    }

	    constructor() {
	        this.resetRange();
	    }

	    /** @param {CenterOfPressure} centerOfPressure  */
	    updateCenterOfPressureRange(centerOfPressure) {
	        this.#centerOfPressureRange.min.x = Math.min(centerOfPressure.x, this.#centerOfPressureRange.min.x);
	        this.#centerOfPressureRange.min.y = Math.min(centerOfPressure.y, this.#centerOfPressureRange.min.y);

	        this.#centerOfPressureRange.max.x = Math.max(centerOfPressure.x, this.#centerOfPressureRange.max.x);
	        this.#centerOfPressureRange.max.y = Math.max(centerOfPressure.y, this.#centerOfPressureRange.max.y);
	    }
	    /** @param {CenterOfPressure} centerOfPressure  */
	    getCalibratedCenterOfPressure(centerOfPressure) {
	        /** @type {CenterOfPressure} */
	        const calibratedCenterOfPressure = {
	            x: getInterpolation(
	                centerOfPressure.x,
	                this.#centerOfPressureRange.min.x,
	                this.#centerOfPressureRange.max.x
	            ),
	            y: getInterpolation(
	                centerOfPressure.y,
	                this.#centerOfPressureRange.min.y,
	                this.#centerOfPressureRange.max.y
	            ),
	        };
	        return calibratedCenterOfPressure;
	    }
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
	 * @property {CenterOfPressure?} calibratedCenter
	 */

	const _console$6 = createConsole("PressureSensorDataManager", { log: true });

	class PressureSensorDataManager {
	    /** @type {DeviceType} */
	    #deviceType;
	    get deviceType() {
	        return this.#deviceType;
	    }
	    set deviceType(newDeviceType) {
	        _console$6.assertTypeWithError(newDeviceType, "string");
	        if (this.#deviceType == newDeviceType) {
	            _console$6.warn(`redundant deviceType assignment "${newDeviceType}"`);
	            return;
	        }
	        _console$6.log({ newDeviceType });
	        this.#deviceType = newDeviceType;

	        this.#updatePressureSensorPositions();
	        this.resetPressureRange();
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
	        _console$6.log({ pressureSensorPositions });
	        this.#pressureSensorPositions = pressureSensorPositions;
	    }

	    #centerOfPressureHelper = new CenterOfPressureHelper();
	    resetRange() {
	        this.#centerOfPressureHelper.resetRange();
	    }

	    /**
	     * @param {DataView} dataView
	     * @param {number} byteOffset
	     */
	    parsePressure(dataView, byteOffset) {
	        const scalar = this.scalars.pressure;

	        /** @type {PressureData} */
	        const pressure = { sensors: [], rawSum: 0, normalizedSum: 0 };
	        for (let index = 0; index < this.numberOfPressureSensors; index++, byteOffset += 2) {
	            const rawValue = dataView.getUint16(byteOffset, true);
	            const normalizedValue = rawValue * scalar;
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
	            this.#centerOfPressureHelper.updateCenterOfPressureRange(pressure.center);
	            pressure.calibratedCenter = this.#centerOfPressureHelper.getCalibratedCenterOfPressure(pressure.center);
	        }

	        _console$6.log({ pressure });
	        return pressure;
	    }
	}

	/** @typedef {"acceleration" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation"} MotionSensorType */

	const _console$5 = createConsole("MotionSensorDataManager", { log: true });

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
	        _console$5.assertTypeWithError(newDeviceType, "string");
	        if (this.#deviceType == newDeviceType) {
	            _console$5.warn(`redundant deviceType assignment "${newDeviceType}"`);
	            return;
	        }
	        _console$5.log({ newDeviceType });
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

	        _console$5.log({ vector });
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

	        _console$5.log({ quaternion });
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

	/** @typedef {MotionSensorType | PressureSensorType | BarometerSensorType} SensorType */

	const _console$4 = createConsole("SensorDataManager", { log: true });

	class SensorDataManager {
	    /** @type {DeviceType} */
	    #deviceType;
	    get deviceType() {
	        return this.#deviceType;
	    }
	    set deviceType(newDeviceType) {
	        _console$4.assertTypeWithError(newDeviceType, "string");
	        if (this.#deviceType == newDeviceType) {
	            _console$4.warn(`redundant deviceType assignment "${newDeviceType}"`);
	            return;
	        }
	        _console$4.log({ newDeviceType });
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
	        _console$4.assertTypeWithError(sensorType, "string");
	        _console$4.assertWithError(this.#Types.includes(sensorType), `invalid sensorType "${sensorType}"`);
	    }
	    /** @param {number} sensorTypeEnum */
	    static AssertValidSensorTypeEnum(sensorTypeEnum) {
	        _console$4.assertTypeWithError(sensorTypeEnum, "number");
	        _console$4.assertWithError(sensorTypeEnum in this.#Types, `invalid sensorTypeEnum ${sensorTypeEnum}`);
	    }

	    /**
	     * @callback SensorDataCallback
	     * @param {SensorType} sensorType
	     * @param {Object} data
	     * @param {number} data.timestamp
	     */

	    /** @type {SensorDataCallback?} */
	    onDataReceived;

	    #timestampOffset = 0;
	    #lastRawTimestamp = 0;
	    clearTimestamp() {
	        _console$4.log("clearing sensorDataManager timestamp data");
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
	        _console$4.log("sensorData", Array.from(new Uint8Array(dataView.buffer)));

	        let byteOffset = 0;
	        const timestamp = this.#parseTimestamp(dataView, byteOffset);
	        byteOffset += 2;

	        while (byteOffset < dataView.byteLength) {
	            const sensorTypeEnum = dataView.getUint8(byteOffset++);
	            SensorDataManager.AssertValidSensorTypeEnum(sensorTypeEnum);

	            let value;

	            const sensorTypeDataSize = dataView.getUint8(byteOffset++);
	            const sensorType = this.#types[sensorTypeEnum];

	            _console$4.log({ sensorTypeEnum, sensorType, sensorTypeDataSize });
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
	                    _console$4.error(`uncaught sensorType "${sensorType}"`);
	            }

	            byteOffset += sensorTypeDataSize;

	            _console$4.assertWithError(value, `no value defined for sensorType "${sensorType}"`);
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

	const _console$3 = createConsole("SensorConfigurationManager", { log: true });

	class SensorConfigurationManager {
	    /** @type {DeviceType} */
	    #deviceType;
	    get deviceType() {
	        return this.#deviceType;
	    }
	    set deviceType(newDeviceType) {
	        _console$3.assertTypeWithError(newDeviceType, "string");
	        if (this.#deviceType == newDeviceType) {
	            _console$3.warn(`redundant deviceType assignment "${newDeviceType}"`);
	            return;
	        }
	        _console$3.log({ newDeviceType });
	        this.#deviceType = newDeviceType;
	    }

	    /** @param {DataView} dataView */
	    parse(dataView) {
	        /** @type {SensorConfiguration} */
	        const parsedSensorConfiguration = {};
	        SensorDataManager.Types.forEach((sensorType, index) => {
	            const sensorRate = dataView.getUint16(index * 2, true);
	            _console$3.log({ sensorType, sensorRate });
	            parsedSensorConfiguration[sensorType] = sensorRate;
	        });
	        _console$3.log({ parsedSensorConfiguration });
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
	        _console$3.assertTypeWithError(sensorRate, "number");
	        _console$3.assertWithError(sensorRate >= 0, `sensorRate must be 0 or greater (got ${sensorRate})`);
	        _console$3.assertWithError(
	            sensorRate < this.maxSensorRate,
	            `sensorRate must be 0 or greater (got ${sensorRate})`
	        );
	        _console$3.assertWithError(
	            sensorRate % this.sensorRateStep == 0,
	            `sensorRate must be multiple of ${this.sensorRateStep}`
	        );
	    }

	    /** @param {SensorConfiguration} sensorConfiguration */
	    createData(sensorConfiguration) {
	        /** @type {SensorType[]} */
	        const sensorTypes = Object.keys(sensorConfiguration);

	        const dataView = new DataView(new ArrayBuffer(sensorTypes.length * 3));
	        sensorTypes.forEach((sensorType, index) => {
	            SensorDataManager.AssertValidSensorType(sensorType);
	            const sensorTypeEnum = SensorDataManager.Types.indexOf(sensorType);
	            dataView.setUint8(index * 3, sensorTypeEnum);

	            const sensorRate = sensorConfiguration[sensorType];
	            this.#assertValidSensorRate(sensorRate);
	            dataView.setUint16(index * 3 + 1, sensorConfiguration[sensorType], true);
	        });
	        _console$3.log({ sensorConfigurationData: dataView });
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

	/**
	 * @param {...ArrayBuffer} arrayBuffers
	 * @returns {ArrayBuffer}
	 */
	function concatenateArrayBuffers(...arrayBuffers) {
	    arrayBuffers = arrayBuffers.filter((arrayBuffer) => arrayBuffer != undefined || arrayBuffer != null);
	    arrayBuffers = arrayBuffers.map((arrayBuffer) => {
	        if (typeof arrayBuffer == "number") {
	            return Uint8Array.from([Math.floor(arrayBuffer)]);
	        } else if (arrayBuffer instanceof Array) {
	            return Uint8Array.from(arrayBuffer).buffer;
	        } else if (arrayBuffer instanceof ArrayBuffer) {
	            return arrayBuffer;
	        } else if ("buffer" in arrayBuffer && arrayBuffer.buffer instanceof ArrayBuffer) {
	            return arrayBuffer.buffer;
	        } else if (arrayBuffer instanceof DataView) {
	            return arrayBuffer.buffer;
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

	const _console$2 = createConsole("VibrationManager");

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
	        _console$2.assertTypeWithError(location, "string");
	        _console$2.assertWithError(this.locations.includes(location), `invalid location "${location}"`);
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
	        _console$2.log({ locationsBitmask });
	        _console$2.assertWithError(locationsBitmask > 0, `locationsBitmask must not be zero`);
	        return locationsBitmask;
	    }

	    /** @param {any[]} array */
	    #assertNonEmptyArray(array) {
	        _console$2.assertWithError(Array.isArray(array), "passed non-array");
	        _console$2.assertWithError(array.length > 0, "passed empty array");
	    }

	    static get WaveformEffects() {
	        return VibrationWaveformEffects;
	    }
	    get waveformEffects() {
	        return VibrationManager.WaveformEffects;
	    }
	    /** @param {VibrationWaveformEffect} waveformEffect */
	    #verifyWaveformEffect(waveformEffect) {
	        _console$2.assertWithError(
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
	            _console$2.assertWithError(delay >= 0, `delay must be 0ms or greater (got ${delay})`);
	            _console$2.assertWithError(
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
	        _console$2.assertTypeWithError(waveformEffectSegmentLoopCount, "number");
	        _console$2.assertWithError(
	            waveformEffectSegmentLoopCount >= 0,
	            `waveformEffectSegmentLoopCount must be 0 or greater (got ${waveformEffectSegmentLoopCount})`
	        );
	        _console$2.assertWithError(
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
	        _console$2.assertWithError(
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
	        _console$2.assertTypeWithError(waveformEffectSequenceLoopCount, "number");
	        _console$2.assertWithError(
	            waveformEffectSequenceLoopCount >= 0,
	            `waveformEffectSequenceLoopCount must be 0 or greater (got ${waveformEffectSequenceLoopCount})`
	        );
	        _console$2.assertWithError(
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
	        _console$2.assertTypeWithError(waveformSegment.amplitude, "number");
	        _console$2.assertWithError(
	            waveformSegment.amplitude >= 0,
	            `amplitude must be 0 or greater (got ${waveformSegment.amplitude})`
	        );
	        _console$2.assertWithError(
	            waveformSegment.amplitude <= 1,
	            `amplitude must be 1 or less (got ${waveformSegment.amplitude})`
	        );

	        _console$2.assertTypeWithError(waveformSegment.duration, "number");
	        _console$2.assertWithError(
	            waveformSegment.duration > 0,
	            `duration must be greater than 0ms (got ${waveformSegment.duration}ms)`
	        );
	        _console$2.assertWithError(
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
	        _console$2.assertWithError(
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
	        _console$2.log({ dataArray, dataView });
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
	        _console$2.log({ dataView });
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
	        _console$2.assertTypeWithError(vibrationType, "string");
	        _console$2.assertWithError(this.#types.includes(vibrationType), `invalid vibrationType "${vibrationType}"`);
	    }

	    /**
	     * @param {VibrationLocation[]} locations
	     * @param {VibrationType} vibrationType
	     * @param {DataView} dataView
	     */
	    #createData(locations, vibrationType, dataView) {
	        _console$2.assertWithError(dataView?.byteLength > 0, "no data received");
	        const locationsBitmask = this.#createLocationsBitmask(locations);
	        this.#verifyVibrationType(vibrationType);
	        const vibrationTypeIndex = this.#types.indexOf(vibrationType);
	        _console$2.log({ locationsBitmask, vibrationTypeIndex, dataView });
	        const data = concatenateArrayBuffers(locationsBitmask, vibrationTypeIndex, dataView.byteLength, dataView);
	        _console$2.log({ data });
	        return data;
	    }
	}

	const _console$1 = createConsole("Device", { log: false });



	/** @typedef {"connectionStatus" | ConnectionStatus | "isConnected" | ConnectionMessageType | "deviceInformation" | SensorType} DeviceEventType */




	/**
	 * @typedef DeviceEvent
	 * @type {Object}
	 * @property {Device} target
	 * @property {DeviceEventType} type
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
	        this.connectionManager = new Device.#DefaultConnectionManager();
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
	    }

	    /** @returns {ConnectionManager} */
	    static get #DefaultConnectionManager() {
	        if (isInBrowser) {
	            return WebBluetoothConnectionManager;
	        }
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
	    get #eventTypes() {
	        return Device.#EventTypes;
	    }
	    #eventDispatcher = new EventDispatcher(this.#eventTypes);

	    /**
	     * @param {DeviceEventType} type
	     * @param {EventDispatcherListener} listener
	     * @param {EventDispatcherOptions} options
	     * @throws {Error}
	     */
	    addEventListener(type, listener, options) {
	        this.#eventDispatcher.addEventListener(type, listener, options);
	    }

	    /**
	     * @param {DeviceEvent} event
	     * @throws {Error} if type is not valid
	     */
	    #dispatchEvent(event) {
	        this.#eventDispatcher.dispatchEvent(event);
	    }

	    /**
	     * @param {DeviceEventType} type
	     * @param {EventDispatcherListener} listener
	     * @returns {boolean}
	     * @throws {Error}
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
	            _console$1.warn("same connectionManager is already assigned");
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
	        _console$1.log("assigned new connectionManager", this.#connectionManager);
	    }

	    async connect() {
	        // TODO - set connection type?
	        return this.connectionManager?.connect();
	    }
	    get isConnected() {
	        return this.connectionManager?.isConnected;
	    }
	    /** @throws {Error} if not connected */
	    #assertIsConnected() {
	        _console$1.assertWithError(this.isConnected, "not connected");
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
	        _console$1.assertTypeWithError(newReconnectOnDisconnection, "boolean");
	        this.#ReconnectOnDisconnection = newReconnectOnDisconnection;
	    }

	    #reconnectOnDisconnection = Device.ReconnectOnDisconnection;
	    get reconnectOnDisconnection() {
	        return this.#reconnectOnDisconnection;
	    }
	    set reconnectOnDisconnection(newReconnectOnDisconnection) {
	        _console$1.assertTypeWithError(newReconnectOnDisconnection, "boolean");
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

	    get connectionStatus() {
	        return this.#connectionManager?.status;
	    }

	    /** @param {ConnectionStatus} connectionStatus */
	    #onConnectionStatusUpdated(connectionStatus) {
	        _console$1.log({ connectionStatus });

	        if (connectionStatus == "not connected") {
	            //this.#clear();

	            if (this.canReconnect && this.reconnectOnDisconnection) {
	                _console$1.log("starting reconnect interval...");
	                this.#reconnectIntervalId = setInterval(() => {
	                    _console$1.log("attempting reconnect...");
	                    this.reconnect();
	                }, 1000);
	            }
	        } else {
	            if (this.#reconnectIntervalId != undefined) {
	                _console$1.log("clearing reconnect interval");
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
	        _console$1.log({ messageType, dataView });
	        switch (messageType) {
	            case "manufacturerName":
	                const manufacturerName = this.#textDecoder.decode(dataView);
	                _console$1.log({ manufacturerName });
	                this.#updateDeviceInformation({ manufacturerName });
	                break;
	            case "modelNumber":
	                const modelNumber = this.#textDecoder.decode(dataView);
	                _console$1.log({ modelNumber });
	                this.#updateDeviceInformation({ modelNumber });
	                break;
	            case "softwareRevision":
	                const softwareRevision = this.#textDecoder.decode(dataView);
	                _console$1.log({ softwareRevision });
	                this.#updateDeviceInformation({ softwareRevision });
	                break;
	            case "hardwareRevision":
	                const hardwareRevision = this.#textDecoder.decode(dataView);
	                _console$1.log({ hardwareRevision });
	                this.#updateDeviceInformation({ hardwareRevision });
	                break;
	            case "firmwareRevision":
	                const firmwareRevision = this.#textDecoder.decode(dataView);
	                _console$1.log({ firmwareRevision });
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
	                _console$1.log({ pnpId });
	                this.#updateDeviceInformation({ pnpId });
	                break;
	            case "serialNumber":
	                const serialNumber = this.#textDecoder.decode(dataView);
	                _console$1.log({ serialNumber });
	                // will only be used for node.js
	                break;

	            case "batteryLevel":
	                const batteryLevel = dataView.getUint8(0);
	                _console$1.log("received battery level", { batteryLevel });
	                this.#updateBatteryLevel(batteryLevel);
	                break;

	            case "getName":
	                const name = this.#textDecoder.decode(dataView);
	                _console$1.log({ name });
	                this.#updateName(name);
	                break;
	            case "getType":
	                const typeEnum = dataView.getUint8(0);
	                const type = this.#types[typeEnum];
	                _console$1.log({ typeEnum, type });
	                this.#updateType(type);
	                break;

	            case "getSensorConfiguration":
	                const sensorConfiguration = this.#sensorConfigurationManager.parse(dataView);
	                _console$1.log({ sensorConfiguration });
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
	        _console$1.log({ partialDeviceInformation });
	        for (const deviceInformationName in partialDeviceInformation) {
	            this.#dispatchEvent({
	                type: deviceInformationName,
	                message: { [deviceInformationName]: partialDeviceInformation[deviceInformationName] },
	            });
	        }

	        Object.assign(this.#deviceInformation, partialDeviceInformation);
	        _console$1.log({ deviceInformation: this.#deviceInformation });
	        if (this.#isDeviceInformationComplete) {
	            _console$1.log("completed deviceInformation");
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
	        _console$1.assertTypeWithError(updatedBatteryLevel, "number");
	        if (this.#batteryLevel == updatedBatteryLevel) {
	            _console$1.warn(`duplicate batteryLevel assignment ${updatedBatteryLevel}`);
	            return;
	        }
	        this.#batteryLevel = updatedBatteryLevel;
	        _console$1.log({ updatedBatteryLevel: this.#batteryLevel });
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
	        _console$1.assertTypeWithError(updatedName, "string");
	        this.#name = updatedName;
	        _console$1.log({ updatedName: this.#name });
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
	        _console$1.assertTypeWithError(newName, "string");
	        _console$1.assertWithError(
	            newName.length >= this.minNameLength,
	            `name must be greater than ${this.minNameLength} characters long ("${newName}" is ${newName.length} characters long)`
	        );
	        _console$1.assertWithError(
	            newName.length < this.maxNameLength,
	            `name must be less than ${this.maxNameLength} characters long ("${newName}" is ${newName.length} characters long)`
	        );
	        const setNameData = this.#textEncoder.encode(newName);
	        _console$1.log({ setNameData });
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
	        _console$1.assertTypeWithError(type, "string");
	        _console$1.assertWithError(this.#types.includes(type), `invalid type "${type}"`);
	    }
	    /** @param {DeviceType} updatedType */
	    #updateType(updatedType) {
	        this.#assertValidDeviceType(updatedType);
	        if (updatedType == this.type) {
	            _console$1.warn("redundant type assignment");
	            return;
	        }
	        this.#type = updatedType;
	        _console$1.log({ updatedType: this.#type });

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
	        _console$1.log({ setTypeData });
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
	        _console$1.log({ updatedSensorConfiguration: this.#sensorConfiguration });
	        if (!this.#sensorConfigurationManager.hasAtLeastOneNonZeroSensorRate(this.sensorConfiguration)) {
	            _console$1.log("clearing sensorDataManager timestamp...");
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
	        _console$1.log({ newSensorConfiguration });
	        const setSensorConfigurationData = this.#sensorConfigurationManager.createData(newSensorConfiguration);
	        _console$1.log({ setSensorConfigurationData });
	        await this.#connectionManager.sendMessage("setSensorConfiguration", setSensorConfigurationData);
	    }

	    static #ClearSensorConfigurationOnLeave = true;
	    static get ClearSensorConfigurationOnLeave() {
	        return this.#ClearSensorConfigurationOnLeave;
	    }
	    static set ClearSensorConfigurationOnLeave(newclearSensorConfigurationOnLeave) {
	        _console$1.assertTypeWithError(newclearSensorConfigurationOnLeave, "boolean");
	        this.#ClearSensorConfigurationOnLeave = newclearSensorConfigurationOnLeave;
	    }

	    #clearSensorConfigurationOnLeave = Device.ClearSensorConfigurationOnLeave;
	    get clearSensorConfigurationOnLeave() {
	        return this.#clearSensorConfigurationOnLeave;
	    }
	    set clearSensorConfigurationOnLeave(newclearSensorConfigurationOnLeave) {
	        _console$1.assertTypeWithError(newclearSensorConfigurationOnLeave, "boolean");
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
	        _console$1.log({ sensorType, sensorData });
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
	            _console$1.log({ type, dataView });
	            triggerVibrationData = concatenateArrayBuffers(triggerVibrationData, dataView);
	        });
	        await this.#connectionManager.sendMessage("triggerVibration", triggerVibrationData);
	    }
	}

	/** @typedef {"pressure" | "isConnected"} DevicePairEventType */








	/**
	 * @typedef DevicePairEvent
	 * @type {Object}
	 * @property {DevicePair} target
	 * @property {DevicePairEventType} type
	 * @property {Object} message
	 */



	/**
	 * @typedef TimestampedPressureData
	 * @type {Object}
	 * @property {PressureData} data
	 * @property {number} timestamp
	 */

	/**
	 * @typedef DevicePairRawPressureData
	 * @type {Object}
	 * @property {TimestampedPressureData} left
	 * @property {TimestampedPressureData} right
	 */

	/**
	 * @typedef DevicePairPressureData
	 * @type {Object}
	 *
	 * @property {number} rawSum
	 * @property {number} normalizedSum
	 *
	 * @property {CenterOfPressure?} center
	 * @property {CenterOfPressure?} calibratedCenter
	 */

	const _console = createConsole("DevicePair", { log: true });

	class DevicePair {
	    // EVENT DISPATCHER

	    /** @type {DevicePairEventType[]} */
	    static #EventTypes = ["pressure", "isConnected"];
	    get #eventTypes() {
	        return DevicePair.#EventTypes;
	    }
	    #eventDispatcher = new EventDispatcher(this.#eventTypes);

	    /**
	     * @param {DevicePairEventType} type
	     * @param {EventDispatcherListener} listener
	     * @param {EventDispatcherOptions} options
	     * @throws {Error}
	     */
	    addEventListener(type, listener, options) {
	        this.#eventDispatcher.addEventListener(type, listener, options);
	    }

	    /**
	     * @param {DevicePairEvent} event
	     * @throws {Error} if type is not valid
	     */
	    #dispatchEvent(event) {
	        this.#eventDispatcher.dispatchEvent(event);
	    }

	    /**
	     * @param {DevicePairEventType} type
	     * @param {EventDispatcherListener} listener
	     * @returns {boolean}
	     * @throws {Error}
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

	    /** @param {Device} device */
	    assignInsole(device) {
	        _console.assertWithError(device.isInsole, "device must be an insole");
	        const side = device.insoleSide;

	        const currentDevice = this[side];

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

	        _console.log(`assigned ${side} insole`, device);

	        this.resetPressureRange();

	        this.#dispatchEvent({ type: "isConnected", message: { isConnected: this.isConnected } });

	        return currentDevice;
	    }

	    /** @type {Object.<string, EventListener} */
	    #boundDeviceEventListeners = {
	        pressure: this.#onDevicePressure.bind(this),
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

	    // PRESSURE DATA

	    /** @type {DevicePairRawPressureData} */
	    #rawPressureData = {};
	    /** @type {Object<InsoleSide, number>} */
	    get #rawPressureDataTimestamps() {
	        const timestamps = {};
	        this.sides.forEach((side) => {
	            timestamps[side] = this.#rawPressureData[side].timestamp;
	        });
	        return timestamps;
	    }

	    #centerOfPressureHelper = new CenterOfPressureHelper();

	    resetPressureRange() {
	        this.sides.forEach((side) => {
	            this[side].resetPressureRange();
	        });
	        this.#centerOfPressureHelper.resetRange();
	    }

	    /** @param {DeviceEvent} event  */
	    #onDevicePressure(event) {
	        const { timestamp, pressure } = event.message;
	        this.#rawPressureData[event.target.insoleSide] = {
	            timestamp,
	            pressure,
	        };
	        if (this.isConnected && this.#hasAllPressureData) {
	            this.#updatePressureData();
	        }
	    }

	    get #hasAllPressureData() {
	        this.sides.every((side) => side in this.#rawPressureData);
	    }

	    static #Scalars = {
	        pressure: PressureSensorDataManager.Scalars.pressure / this.Sides.length,
	    };
	    static get Scalars() {
	        return this.#Scalars;
	    }
	    get scalars() {
	        return DevicePair.Scalars;
	    }

	    #updatePressureData() {
	        const scalar = this.scalars.pressure;

	        /** @type {DevicePairPressureData} */
	        const pressure = { rawSum: 0, normalizedSum: 0 };

	        this.#rawPressureData.left.data.rawSum;
	        this.sides.forEach((side) => {
	            pressure.rawSum += this.#rawPressureData[side].data.rawSum;
	        });

	        if (pressure.rawSum > 0) {
	            pressure.normalizedSum = pressure.rawSum * scalar;

	            pressure.center = { x: 0, y: 0 };
	            this.sides.forEach((side) => {
	                const sidePressureData = this.#rawPressureData[side].data;
	                const rawPressureSumWeight = sidePressureData.rawSum / rawPressureSum;
	                pressure.center.y += sidePressureData.center.y * rawPressureSumWeight;
	                if (side == "right") {
	                    pressure.center.x = rawPressureSumWeight;
	                }
	            });

	            this.#centerOfPressureHelper.updateCenterOfPressureRange(pressure.center);
	            pressure.calibratedCenter = this.#centerOfPressureHelper.getCalibratedCenterOfPressure(pressure.center);
	        }

	        _console.log({ pressure });
	        this.#dispatchEvent({ type: "pressure", message: { pressure, timestamps: this.#rawPressureDataTimestamps() } });
	    }
	}

	var BS = {
	    setAllConsoleLevelFlags,
	    setConsoleLevelFlagsForType,
	    Device,
	    DevicePair,
	};

	return BS;

}));
