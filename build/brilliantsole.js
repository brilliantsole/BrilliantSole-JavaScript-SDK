/**
 * @copyright Zack Qattan 2024
 * @license MIT
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.BrilliantSole = factory());
})(this, (function () { 'use strict';

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

	    /**
	     * @param {any} value
	     * @param {string} type
	     * @throws {Error} if value's type doesn't match
	     */
	    assertTypeWithError(value, type) {
	        this.assertWithError(typeof value == type, `value of type "${typeof value}" not of type "${type}"`);
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

	const _console$6 = createConsole("EventDispatcher", { log: false });

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

	// based on https://github.com/mrdoob/eventdispatcher.js/
	class EventDispatcher {
	    /**
	     * @param {string[]?} eventTypes
	     */
	    constructor(eventTypes) {
	        _console$6.assertWithError(Array.isArray(eventTypes) || eventTypes == undefined, "eventTypes must be an array");
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
	        _console$6.assertWithError(this.#isValidEventType(type), `invalid event type "${type}"`);
	    }

	    /** @type {Object.<string, [function]?>?} */
	    #listeners;

	    /**
	     * @param {string} type
	     * @param {EventDispatcherListener} listener
	     * @param {EventDispatcherOptions?} options
	     */
	    addEventListener(type, listener, options) {
	        _console$6.log(`adding "${type}" eventListener`, listener);
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
	        _console$6.log(`has "${type}" eventListener?`, listener);
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
	        _console$6.log(`removing "${type}" eventListener`, listener);
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

	/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherListener} EventDispatcherListener */
	/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherOptions} EventDispatcherOptions */

	/** @typedef {"web bluetooth" | "noble"} BrilliantSoleConnectionType */
	/** @typedef {"not connected" | "connecting" | "connected" | "disconnecting"} BrilliantSoleConnectionStatus */
	/** @typedef {"manufacturerName" | "modelNumber" | "softwareRevision" | "hardwareRevision" | "firmwareRevision" | "pnpId" | "batteryLevel" | "getName" | "setName" | "getType" | "setType" | "getSensorConfiguration" | "setSensorConfiguration" | "sensorData"} BrilliantSoleConnectionMessageType */

	const _console$5 = createConsole("ConnectionManager");

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
	        _console$5.assertWithError(this.isSupported, `${this.constructor.name} is not supported`);
	    }

	    /** @throws {Error} if abstract class */
	    #assertIsSubclass() {
	        _console$5.assertWithError(this.constructor != ConnectionManager, `${this.constructor.name} must be subclassed`);
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
	        _console$5.assertTypeWithError(newConnectionStatus, "string");
	        if (this.#status == newConnectionStatus) {
	            _console$5.warn("same connection status");
	            return;
	        }
	        _console$5.log(`new connection status "${newConnectionStatus}"`);
	        this.#status = newConnectionStatus;
	        this.onStatusUpdated?.(this.status);
	    }

	    get isConnected() {
	        return this.status == "connected";
	    }

	    /** @throws {Error} if connected */
	    #assertIsNotConnected() {
	        _console$5.assertWithError(!this.isConnected, "device is already connected");
	    }
	    /** @throws {Error} if connecting */
	    #assertIsNotConnecting() {
	        _console$5.assertWithError(this.status != "connecting", "device is already connecting");
	    }
	    /** @throws {Error} if not connected */
	    #assertIsConnected() {
	        _console$5.assertWithError(this.isConnected, "device is not connected");
	    }
	    /** @throws {Error} if disconnecting */
	    #assertIsNotDisconnecting() {
	        _console$5.assertWithError(this.status != "disconnecting", "device is already disconnecting");
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
	        _console$5.assert(this.canReconnect, "unable to reconnect");
	        this.status = "connecting";
	    }
	    async disconnect() {
	        this.#assertIsConnected();
	        this.#assertIsNotDisconnecting();
	        this.status = "disconnecting";
	    }

	    /**
	     * @param {BrilliantSoleConnectionMessageType} messageType
	     * @param {DataView|ArrayBuffer} data
	     */
	    async sendMessage(messageType, data) {
	        this.#assertIsConnectedAndNotDisconnecting();
	        _console$5.log("sending message", { messageType, data });
	    }
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

	/** @typedef {"deviceInformation" | "battery" | "data" | "unknown"} BrilliantSoleBluetoothServiceName */
	/** @typedef { "manufacturerName" | "modelNumber" | "hardwareRevision" | "firmwareRevision" | "softwareRevision" | "pnpId" | "batteryLevel" | "name" | "type" | "sensorConfiguration" | "sensorData" | "haptics"} BrilliantSoleBluetoothCharacteristicName */

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
	                haptics: { uuid: generateBluetoothUUID(5) },
	            },
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
	const optionalServiceUUIDs = bluetoothUUIDs.optionalServiceUUIDs;

	/** @param {BluetoothServiceUUID} serviceUUID */
	function getServiceNameFromUUID(serviceUUID) {
	    return bluetoothUUIDs.getServiceNameFromUUID(serviceUUID);
	}

	/** @param {BluetoothCharacteristicUUID} characteristicUUID */
	function getCharacteristicNameFromUUID(characteristicUUID) {
	    return bluetoothUUIDs.getCharacteristicNameFromUUID(characteristicUUID);
	}

	const _console$4 = createConsole("WebBluetoothConnectionManager", { log: true });

	/** @typedef {import("./bluetoothUUIDs.js").BrilliantSoleBluetoothCharacteristicName} BrilliantSoleBluetoothCharacteristicName */
	/** @typedef {import("./bluetoothUUIDs.js").BrilliantSoleBluetoothServiceName} BrilliantSoleBluetoothServiceName */

	/** @typedef {import("../ConnectionManager.js").BrilliantSoleConnectionMessageType} BrilliantSoleConnectionMessageType */

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
	            _console$4.warn("tried to assign the same BluetoothDevice");
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
	                filters: [{ services: serviceUUIDs }],
	                optionalServices: optionalServiceUUIDs,
	            });

	            _console$4.log("got BluetoothDevice", device);
	            this.device = device;

	            _console$4.log("connecting to device...");
	            const server = await this.device.gatt.connect();
	            _console$4.log(`connected to device? ${server.connected}`);

	            _console$4.log("getting services...");
	            const services = await server.getPrimaryServices();
	            _console$4.log("got services", services);

	            _console$4.log("getting characteristics...");
	            const servicePromises = services.map(async (service) => {
	                const serviceName = getServiceNameFromUUID(service.uuid);
	                _console$4.assertWithError(serviceName, `no name found for service uuid "${service.uuid}"`);
	                _console$4.log(`got "${serviceName}" service`);
	                service._name = serviceName;
	                this.#services.set(serviceName, service);
	                _console$4.log("getting characteristics for service", service);
	                const characteristics = await service.getCharacteristics();
	                _console$4.log("got characteristics for service", service, characteristics);
	                const characteristicPromises = characteristics.map(async (characteristic) => {
	                    const characteristicName = getCharacteristicNameFromUUID(characteristic.uuid);
	                    _console$4.assertWithError(
	                        characteristicName,
	                        `no name found for characteristic uuid "${characteristic.uuid}" in "${serviceName}" service`
	                    );
	                    _console$4.log(`got "${characteristicName}" characteristic in "${serviceName}" service`);
	                    characteristic._name = characteristicName;
	                    this.#characteristics.set(characteristicName, characteristic);
	                    addEventListeners(characteristic, this.#boundBluetoothCharacteristicEventListeners);
	                    if (characteristic.properties.read) {
	                        await characteristic.readValue();
	                    }
	                    if (characteristic.properties.notify) {
	                        _console$4.log(
	                            `starting notifications for "${characteristicName}" characteristic`,
	                            characteristic
	                        );
	                        await characteristic.startNotifications();
	                    }
	                });
	                await Promise.all(characteristicPromises);
	            });
	            await Promise.all(servicePromises);
	            _console$4.log("fully connected");

	            this.connectionStatus = "connected";
	        } catch (error) {
	            _console$4.error(error);
	            this.connectionStatus = "not connected";
	        }
	    }
	    async disconnect() {
	        await super.disconnect();
	        _console$4.log("disconnecting from device...");
	        this.server.disconnect();
	    }

	    /** @param {Event} event */
	    #onCharacteristicvaluechanged(event) {
	        _console$4.log("oncharacteristicvaluechanged", event);

	        /** @type {BluetoothRemoteGATTCharacteristic} */
	        const characteristic = event.target;
	        /** @type {BrilliantSoleBluetoothCharacteristicName} */
	        const characteristicName = characteristic._name;
	        _console$4.assertWithError(
	            characteristicName,
	            `no name found for characteristic with uuid "${characteristic.uuid}"`
	        );

	        _console$4.log(`oncharacteristicvaluechanged for "${characteristicName}" characteristic`, event);
	        const dataView = characteristic.value;
	        _console$4.assertWithError(dataView, `no data found for "${characteristicName}" characteristic`);
	        _console$4.log(`data for "${characteristicName}" characteristic`, Array.from(new Uint8Array(dataView.buffer)));

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
	        _console$4.log("gattserverdisconnected", event);
	        this.connectionStatus = "not connected";
	    }

	    /**
	     * @param {BrilliantSoleConnectionMessageType} messageType
	     * @param {DataView|ArrayBuffer} data
	     */
	    async sendMessage(messageType, data) {
	        await super.sendCommand(...arguments);
	        switch (messageType) {
	            // FILL
	            default:
	                throw Error(`uncaught messageType "${messageType}"`);
	        }
	    }

	    /** @type {boolean} */
	    get canReconnect() {
	        return Boolean(this.server);
	    }
	    async reconnect() {
	        await super.reconnect();
	        _console$4.log("attempting to reconnect...");
	        await this.server.connect();
	        if (this.isConnected) {
	            _console$4.log("successfully reconnected!");
	            this.connectionStatus = "connected";
	        } else {
	            _console$4.log("unable to reconnect");
	            this.connectionStatus = "not connected";
	        }
	    }
	}

	/** @typedef {"pressure" | "accelerometer" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation" | "barometer"} BrilliantSoleSensorType */
	/** @typedef {"hallux" | "digits" | "metatarsal_inner" | "metatarsal_center" | "metatarsal_outer" | "lateral" | "arch" | "heel"} BrilliantSolePessureType */

	/** @typedef {import("../BrilliantSole.js").BrilliantSoleDeviceType} BrilliantSoleDeviceType */

	const _console$3 = createConsole("SensorDataManager", { log: true });

	/**
	 * @callback BrilliantSoleSensorDataCallback
	 * @param {BrilliantSoleSensorType} sensorType
	 * @param {Object} data
	 * @param {number} data.timestamp
	 */

	class SensorDataManager {
	    /** @type {BrilliantSoleDeviceType} */
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

	        // FILL
	    }

	    /** @type {BrilliantSoleSensorType[]} */
	    static #Types = [
	        "pressure",
	        "accelerometer",
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
	        return SensorDataManager.#Types;
	    }

	    /** @param {string} sensorType */
	    static assertValidSensorType(sensorType) {
	        _console$3.assertTypeWithError(sensorType, "string");
	        _console$3.assertWithError(this.#Types.includes(sensorType), `invalid sensorType "${sensorType}"`);
	    }
	    /** @param {number} sensorTypeEnum */
	    static assertValidSensorTypeEnum(sensorTypeEnum) {
	        _console$3.assertTypeWithError(sensorTypeEnum, "number");
	        _console$3.assertWithError(sensorTypeEnum in this.#Types, `invalid sensorTypeEnum ${sensorTypeEnum}`);
	    }

	    /** @type {BrilliantSoleSensorDataCallback?} */
	    onDataReceived;

	    #timestampOffset = 0;
	    #lastRawTimestamp = 0;

	    static #Uint16Max = 2 ** 16;
	    get Uint16Max() {
	        return SensorDataManager.#Uint16Max;
	    }

	    /** @param {DataView} dataView */
	    #parseTimestamp(dataView, byteOffset) {
	        const rawTimestamp = dataView.getUint16(byteOffset, true);
	        if (rawTimestamp < this.#lastRawTimestamp) {
	            this.#timestampOffset += this.Uint16Max;
	        }
	        this.#lastRawTimestamp = rawTimestamp;
	        const timestamp = rawTimestamp + this.#timestampOffset;
	        return timestamp;
	    }

	    /** @param {DataView} dataView */
	    parse(dataView) {
	        _console$3.log("sensorData", Array.from(new Uint8Array(dataView.buffer)));

	        let byteOffset = 0;
	        const timestamp = this.#parseTimestamp(dataView, byteOffset);
	        byteOffset += 2;

	        while (offset < dataView.byteLength) {
	            const sensorTypeEnum = dataView.getUint8(offset++);
	            SensorDataManager.assertValidSensorTypeEnum(sensorTypeEnum);

	            let value;

	            const sensorType = this.#types[sensorTypeEnum];
	            switch (sensorType) {
	                case "pressure":
	                    value = this.#parsePressure(dataView, byteOffset);
	                    byteOffset += this.numberOfPressureSensors * 2;
	                    break;
	                case "accelerometer":
	                case "gravity":
	                case "linearAcceleration":
	                case "gyroscope":
	                case "magnetometer":
	                    value = this.#parseVector3(dataView, byteOffset, sensorType);
	                    byteOffset += 7;
	                    break;
	                case "gameRotation":
	                case "rotation":
	                    value = this.#parseQuaternion(dataView, byteOffset, sensorType);
	                    byteOffset += 10;
	                    break;
	                case "barometer":
	                    // FILL
	                    break;
	                default:
	                    throw Error(`uncaught sensorType "${sensorType}"`);
	            }

	            _console$3.assertWithError(value, `no value defined for sensorType "${sensorType}"`);
	            this.onDataReceived?.(sensorType, { timestamp, [sensorType]: value });
	        }
	    }

	    static #Scalars = {
	        pressure: 2 ** 16,

	        accelerometer: 2 ** -12,
	        gravity: 2 ** -12,
	        linearAcceleration: 2 ** -12,

	        gyroscope: 2000 * 2 ** -15,

	        magnetometer: 2500 * 2 ** -15,

	        gameRotation: 2 ** -14,
	        rotation: 2 ** -14,

	        barometer: 100 * 2 ** -7,
	    };
	    get #scalars() {
	        return SensorDataManager.#Scalars;
	    }

	    static #numberOfPressureSensors = 8;
	    get numberOfPressureSensors() {
	        return SensorDataManager.#numberOfPressureSensors;
	    }

	    /**
	     * @param {DataView} dataView
	     * @param {number} byteOffset
	     */
	    #parsePressure(dataView, byteOffset) {
	        const pressure = [];
	        for (let index = 0; index < this.numberOfPressureSensors; index++, byteOffset += 2) {
	            pressure[index] = dataView.getUint16(byteOffset, true);
	        }
	        // FILL - center of mass, normalized pressure, etc
	        _console$3.log({ pressure });
	        return pressure;
	    }

	    /**
	     * @param {DataView} dataView
	     * @param {number} byteOffset
	     * @param {BrilliantSoleSensorType} sensorType
	     */
	    #parseVector3(dataView, byteOffset, sensorType) {
	        let [x, y, z] = [
	            dataView.getUint16(byteOffset, true),
	            dataView.getUint16(byteOffset + 2, true),
	            dataView.getUint16(byteOffset + 4, true),
	        ].map((value) => value * this.#scalars[sensorType]);

	        const vector = { x, y, z };

	        _console$3.log({ vector });
	        return vector;
	    }
	    /**
	     * @param {DataView} dataView
	     * @param {number} byteOffset
	     * @param {BrilliantSoleSensorType} sensorType
	     */
	    #parseQuaternion(dataView, byteOffset, sensorType) {
	        let [x, y, z, w] = [
	            dataView.getUint16(byteOffset, true),
	            dataView.getUint16(byteOffset + 2, true),
	            dataView.getUint16(byteOffset + 4, true),
	            dataView.getUint16(byteOffset + 6, true),
	        ].map((value) => value * this.#scalars[sensorType]);

	        const quaternion = { x, y, z, w };

	        _console$3.log({ quaternion });
	        return quaternion;
	    }
	}

	/** @typedef {import("./SensorDataManager.js").BrilliantSoleSensorType} BrilliantSoleSensorType */
	/** @typedef {import("../BrilliantSole.js").BrilliantSoleDeviceType} BrilliantSoleDeviceType */

	const _console$2 = createConsole("SensorConfigurationManager", { log: true });

	/**
	 * @typedef BrilliantSoleSensorConfiguration
	 * @type {object}
	 * @property {number} accelerometer
	 * @property {number} gravity
	 * @property {number} linearAcceleration
	 * @property {number} gyroscope
	 * @property {number} magnetometer
	 * @property {number} gameRotation
	 * @property {number} rotation
	 * @property {number} barometer
	 */

	class SensorConfigurationManager {
	    /** @type {BrilliantSoleDeviceType} */
	    #deviceType;
	    get deviceType() {
	        return this.#deviceType;
	    }
	    set deviceType(newDeviceType) {
	        _console$2.assertTypeWithError(newDeviceType, "string");
	        if (this.#deviceType == newDeviceType) {
	            _console$2.warn(`redundant deviceType assignment "${newDeviceType}"`);
	            return;
	        }
	        _console$2.log({ newDeviceType });
	        this.#deviceType = newDeviceType;
	    }

	    /** @param {DataView} dataView */
	    parse(dataView) {
	        /** @type {BrilliantSoleSensorConfiguration} */
	        const parsedSensorConfiguration = {};
	        for (let byteOffset = 0; byteOffset < dataView.byteLength; byteOffset += 3) {
	            const sensorTypeEnum = dataView.getUint8(byteOffset);
	            SensorDataManager.assertValidSensorTypeEnum(sensorTypeEnum);
	            const sensorType = SensorDataManager.Types[sensorTypeEnum];
	            const sensorDataRate = dataView.getUint16(byteOffset + 1, true);
	            _console$2.log({ sensorTypeEnum, sensorType, sensorDataRate });
	            parsedSensorConfiguration[sensorType] = sensorDataRate;
	        }
	        _console$2.log({ parsedSensorConfiguration });
	        return parsedSensorConfiguration;
	    }

	    /** @param {BrilliantSoleSensorConfiguration} sensorConfiguration */
	    createData(sensorConfiguration) {
	        /** @type {BrilliantSoleSensorType[]} */
	        const sensorTypes = Object.keys(sensorConfiguration);

	        sensorTypes.forEach((sensorType) => {
	            SensorDataManager.assertValidSensorType(sensorType);
	        });

	        const dataView = new DataView(new ArrayBuffer(sensorTypes.length * 3));
	        let byteOffset = 0;
	        sensorTypes.forEach((sensorType) => {
	            const sensorTypeEnum = SensorDataManager.Types.indexOf(sensorType);
	            dataView.setUint8(byteOffset, sensorTypeEnum);
	            dataView.setUint16(byteOffset + 1, sensorTypeEnum, true);
	            byteOffset += 3;
	        });
	        _console$2.log({ sensorConfigurationData: dataView });
	        return dataView;
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
	 * } BrilliantSoleHapticsVibrationWaveformEffect
	 */

	/** @type {BrilliantSoleHapticsVibrationWaveformEffect[]} */
	const HapticsWaveformEffects = [
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
	    arrayBuffers = arrayBuffers.filter((arrayBuffer) => arrayBuffer);
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

	const _console$1 = createConsole("HapticsManager");

	/** @typedef {"front" | "rear"} BrilliantSoleHapticsLocation */
	/** @typedef {"waveformEffect" | "waveform"} BrilliantSoleHapticsVibrationType */

	/** @typedef {import("./HapticsWaveformEffects.js").BrilliantSoleHapticsVibrationWaveformEffect} BrilliantSoleHapticsVibrationWaveformEffect */

	/**
	 * @typedef BrilliantSoleHapticsVibrationWaveformEffectSegment
	 * a waveform effect segment can be either an effect or a delay (ms int ranging [0, 1270])
	 * @type {BrilliantSoleHapticsVibrationWaveformEffect | number}
	 */

	/**
	 * @typedef BrilliantSoleHapticsVibrationWaveformSegment
	 * @type {Object}
	 * @property {number} duration ms int ranging [0, 2550]
	 * @property {number} amplitude float ranging [0, 1]
	 */

	class HapticsManager {
	    /** @type {BrilliantSoleHapticsLocation[]} */
	    static #locations = ["front", "rear"];
	    get locations() {
	        return HapticsManager.#locations;
	    }
	    /** @param {BrilliantSoleHapticsLocation} location */
	    #verifyLocation(location) {
	        _console$1.assertTypeWithError(location, "string");
	        _console$1.assertWithError(this.locations.includes(location), `invalid location "${location}"`);
	    }
	    /** @param {BrilliantSoleHapticsLocation[]} locations */
	    #verifyLocations(locations) {
	        _console$1.assertWithError(Array.isArray(locations), "passed non-array");
	        _console$1.assertWithError(locations.length > 0, `passed empty array`);
	        locations.forEach((location) => {
	            this.#verifyLocation(location);
	        });
	    }
	    /** @param {BrilliantSoleHapticsLocation[]} locations */
	    #createLocationsBitmask(locations) {
	        this.#verifyLocations(locations);

	        let locationsBitmask = 0;
	        locations.forEach((location) => {
	            const locationIndex = this.locations.indexOf(location);
	            locationsBitmask |= 1 << locationIndex;
	        });
	        _console$1.log({ locationsBitmask });
	        _console$1.assertWithError(locationsBitmask > 0, `locationsBitmask must not be zero`);
	        return locationsBitmask;
	    }

	    get waveformEffects() {
	        return HapticsWaveformEffects;
	    }
	    /** @param {BrilliantSoleHapticsVibrationWaveformEffect} waveformEffect */
	    #verifyWaveformEffect(waveformEffect) {
	        _console$1.assertWithError(
	            this.waveformEffects.includes(waveformEffect),
	            `invalid waveformEffect "${waveformEffect}"`
	        );
	    }

	    /** @param {BrilliantSoleHapticsVibrationWaveformEffectSegment} waveformEffectSegment */
	    #verifyWaveformEffectSegment(waveformEffectSegment) {
	        switch (typeof waveformEffectSegment) {
	            case "string":
	                const waveformEffect = waveformEffectSegment;
	                this.#verifyWaveformEffect(waveformEffect);
	                break;
	            case "number":
	                const delay = waveformEffectSegment;
	                _console$1.assertWithError(delay >= 0, `delay must be 0ms or greater (got ${delay})`);
	                _console$1.assertWithError(delay <= 1270, `delay must be 1270ms or less (got ${delay})`);
	                break;
	            default:
	                throw Error(`invalid waveformEffectSegment type "${typeof waveformEffectSegment}"`);
	        }
	    }
	    static #maxNumberOfWaveformEffectSegments = 8;
	    get maxNumberOfWaveformEffectSegments() {
	        return HapticsManager.#maxNumberOfWaveformEffectSegments;
	    }
	    /** @param {BrilliantSoleHapticsVibrationWaveformEffectSegment[]} waveformEffectSegments */
	    #verifyWaveformEffectSegments(waveformEffectSegments) {
	        _console$1.assertWithError(
	            waveformEffectSegments.length <= this.maxNumberOfWaveformEffectSegments,
	            `must have ${this.maxNumberOfWaveformEffectSegments} waveformEffectSegments or fewer (got ${waveformEffectSegments.length})`
	        );
	        waveformEffectSegments.forEach((waveformEffectSegment) => {
	            this.#verifyWaveformEffectSegment(waveformEffectSegment);
	        });
	    }

	    static #maxWaveformEffectSegmentLoopCount = 3;
	    get maxWaveformEffectSegmentLoopCount() {
	        return HapticsManager.#maxWaveformEffectSegmentLoopCount;
	    }
	    /** @param {number} waveformEffectSegmentLoopCount */
	    #verifyWaveformEffectSegmentLoopCount(waveformEffectSegmentLoopCount) {
	        _console$1.assertTypeWithError(waveformEffectSegmentLoopCount, "number");
	        _console$1.assertWithError(
	            waveformEffectSegmentLoopCount >= 0,
	            `waveformEffectSegmentLoopCount must be 0 or greater (got ${waveformEffectSegmentLoopCount})`
	        );
	        _console$1.assertWithError(
	            waveformEffectSegmentLoopCount <= this.maxWaveformEffectSegmentLoopCount,
	            `waveformEffectSegmentLoopCount must be ${this.maxWaveformEffectSegmentLoopCount} or fewer (got ${waveformEffectSegmentLoopCount})`
	        );
	    }
	    /** @param {number[]} waveformEffectSegmentLoopCounts */
	    #verifyWaveformEffectSegmentLoopCounts(waveformEffectSegmentLoopCounts) {
	        _console$1.assertWithError(
	            waveformEffectSegmentLoopCounts.length <= this.maxNumberOfWaveformEffectSegments,
	            `must have ${this.maxNumberOfWaveformEffectSegments} waveformEffectSegmentLoopCounts or fewer (got ${waveformEffectSegmentLoopCounts.length})`
	        );
	        waveformEffectSegmentLoopCounts.forEach((waveformEffectSegmentLoopCount) => {
	            this.#verifyWaveformEffectSegmentLoopCount(waveformEffectSegmentLoopCount);
	        });
	    }

	    static #maxWaveformEffectSequenceLoopCount = 6;
	    get maxWaveformEffectSequenceLoopCount() {
	        return HapticsManager.#maxWaveformEffectSequenceLoopCount;
	    }
	    /** @param {number} waveformEffectSequenceLoopCount */
	    #verifyWaveformEffectSequenceLoopCount(waveformEffectSequenceLoopCount) {
	        _console$1.assertTypeWithError(waveformEffectSequenceLoopCount, "number");
	        _console$1.assertWithError(
	            waveformEffectSequenceLoopCount >= 0,
	            `waveformEffectSequenceLoopCount must be 0 or greater (got ${waveformEffectSequenceLoopCount})`
	        );
	        _console$1.assertWithError(
	            waveformEffectSequenceLoopCount <= this.maxWaveformEffectSequenceLoopCount,
	            `waveformEffectSequenceLoopCount must be ${this.maxWaveformEffectSequenceLoopCount} or fewer (got ${waveformEffectSequenceLoopCount})`
	        );
	    }

	    /** @param {BrilliantSoleHapticsVibrationWaveformSegment} waveformSegment */
	    #verifyWaveformSegment(waveformSegment) {
	        _console$1.assertTypeWithError(waveformSegment.amplitude, "number");
	        _console$1.assertWithError(
	            waveformSegment.amplitude >= 0,
	            `amplitude must be 0 or greater (got ${waveformSegment.amplitude})`
	        );
	        _console$1.assertWithError(
	            waveformSegment.amplitude <= 1,
	            `amplitude must be 1 or less (got ${waveformSegment.amplitude})`
	        );

	        _console$1.assertTypeWithError(waveformSegment.duration, "number");
	        _console$1.assertWithError(
	            waveformSegment.duration > 0,
	            `duration must be greater than 0ms (got ${waveformSegment.duration}ms)`
	        );
	        _console$1.assertWithError(
	            waveformSegment.duration <= 2560,
	            `duration must be 2560ms or less (got ${waveformSegment.duration}ms)`
	        );
	    }
	    static #maxNumberOfWaveformSegments = 20;
	    get maxNumberOfWaveformSegments() {
	        return HapticsManager.#maxNumberOfWaveformSegments;
	    }
	    /** @param {BrilliantSoleHapticsVibrationWaveformSegment[]} waveformSegments */
	    #verifyWaveformSegments(waveformSegments) {
	        _console$1.assertWithError(
	            waveformSegments.length <= this.maxNumberOfWaveformSegments,
	            `must have ${this.maxNumberOfWaveformSegments} waveformSegments or fewer (got ${waveformSegments.length})`
	        );
	        waveformSegments.forEach((waveformSegment) => {
	            this.#verifyWaveformSegment(waveformSegment);
	        });
	    }

	    /**
	     * @param {BrilliantSoleHapticsLocation[]} locations
	     * @param {BrilliantSoleHapticsVibrationWaveformEffectSegment[]} waveformEffectSegments
	     * @param {number[]?} waveformEffectSegmentLoopCounts how many times each segment should loop (int ranging [0, 3])
	     * @param {number?} waveformEffectSequenceLoopCount how many times the entire sequence should loop (int ranging [0, 6])
	     */
	    createWaveformEffectsData(
	        locations,
	        waveformEffectSegments,
	        waveformEffectSegmentLoopCounts = [],
	        waveformEffectSequenceLoopCount = 0
	    ) {
	        this.#verifyWaveformEffectSegments(waveformEffectSegments);
	        this.#verifyWaveformEffectSegmentLoopCounts(waveformEffectSegmentLoopCounts);
	        this.#verifyWaveformEffectSequenceLoopCount(waveformEffectSequenceLoopCount);

	        // FILL
	        this.#createData(locations, "waveformEffect", dataView);
	    }
	    /**
	     * @param {BrilliantSoleHapticsLocation[]} locations
	     * @param {BrilliantSoleHapticsVibrationWaveformSegment[]} waveformSegments
	     */
	    createWaveformData(locations, waveformSegments) {
	        this.#verifyWaveformSegments(waveformSegments);
	        const dataView = new DataView(new ArrayBuffer(waveformSegments.length * 2));
	        waveformSegments.forEach((waveformSegment, index) => {
	            dataView.setUint8(index * 2, waveformSegment.amplitude);
	            dataView.setUint8(index * 2 + 1, Math.floor(waveformSegment.duration / 10));
	        });
	        this.#createData(locations, "waveform", dataView);
	    }

	    /** @type {BrilliantSoleHapticsVibrationType[]} */
	    static #VibrationTypes = ["waveformEffect", "waveform"];
	    get #vibrationTypes() {
	        return HapticsManager.#VibrationTypes;
	    }
	    /** @param {BrilliantSoleHapticsVibrationType} vibrationType */
	    #verifyVibrationType(vibrationType) {
	        _console$1.assertTypeWithError(vibrationType, "string");
	        _console$1.assertWithError(
	            this.#vibrationTypes.includes(vibrationType),
	            `invalid vibrationType "${vibrationType}"`
	        );
	    }

	    /**
	     * @param {BrilliantSoleHapticsLocation[]} locations
	     * @param {BrilliantSoleHapticsVibrationType} vibrationType
	     * @param {DataView} dataView
	     */
	    #createData(locations, vibrationType, dataView) {
	        const locationsBitmask = this.#createLocationsBitmask(locations);
	        this.#verifyVibrationType(vibrationType);
	        const vibrationTypeIndex = this.#vibrationTypes.indexOf(vibrationType);
	        _console$1.log({ locationsBitmask, vibrationTypeIndex, dataView });
	        const data = concatenateArrayBuffers(locationsBitmask, vibrationTypeIndex, dataView.byteLength, dataView);
	        _console$1.log({ data });
	        return data;
	    }
	}

	const _console = createConsole("BrilliantSole", { log: true });

	/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherListener} EventDispatcherListener */
	/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherOptions} EventDispatcherOptions */
	/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherEvent} EventDispatcherEvent */

	/** @typedef {import("./connection/ConnectionManager.js").BrilliantSoleConnectionStatus} BrilliantSoleConnectionStatus */
	/** @typedef {import("./connection/ConnectionManager.js").BrilliantSoleConnectionMessageType} BrilliantSoleConnectionMessageType */

	/** @typedef {import("./sensor/SensorDataManager.js").BrilliantSoleSensorType} BrilliantSoleSensorType */

	/** @typedef {"connectionStatus" | BrilliantSoleConnectionStatus | "isConnected" | BrilliantSoleConnectionMessageType | BrilliantSoleSensorType} BrilliantSoleEventType */
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
	 * @property {PnpId?} pnpId
	 */

	/**
	 * @typedef PnpId
	 * @type {object}
	 * @property {"Bluetooth"|"USB"} source
	 * @property {number} vendorId
	 * @property {number} productId
	 * @property {number} productVersion */

	/** @typedef {"leftInsole" | "rightInsole"} BrilliantSoleDeviceType */

	/** @typedef {import("./sensor/SensorConfigurationManager.js").BrilliantSoleSensorConfiguration} BrilliantSoleSensorConfiguration */

	/** @typedef {import("./haptics/HapticsManager.js").BrilliantSoleHapticsLocation} BrilliantSoleHapticsLocation */
	/** @typedef {import("./haptics/HapticsManager.js").BrilliantSoleHapticsVibrationType} BrilliantSoleHapticsVibrationType */

	class BrilliantSole {
	    constructor() {
	        this.connectionManager = new WebBluetoothConnectionManager();
	        this.#sensorDataManager.onDataReceived = this.#onSensorDataReceived.bind(this);
	    }

	    // EVENT DISPATCHER

	    /** @type {BrilliantSoleEventType[]} */
	    static #EventTypes = [
	        "connectionStatus",
	        "connecting",
	        "connected",
	        "disconnecting",
	        "not connected",
	        "isConnected",

	        "deviceInformation",

	        "batteryLevel",

	        "getName",
	        "getType",

	        "getSensorConfiguration",

	        "pressure",
	        "accelerometer",
	        "gravity",
	        "linearAcceleration",
	        "gyroscope",
	        "magnetometer",
	        "gameRotation",
	        "rotation",
	        "barometer",
	    ];
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

	    // CONNECTION MANAGER

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

	        if (this.connectionManager) {
	            this.connectionManager.onStatusUpdated = null;
	            this.connectionManager.onMessageReceived = null;
	        }
	        if (newConnectionManager) {
	            newConnectionManager.onStatusUpdated = this.#onConnectionStatusUpdated.bind(this);
	            newConnectionManager.onMessageReceived = this.#onConnectionMessageReceived.bind(this);
	        }

	        this.#connectionManager = newConnectionManager;
	        _console.log("assigned new connectionManager", this.#connectionManager);
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

	    get connectionStatus() {
	        return this.#connectionManager?.status;
	    }

	    /** @param {BrilliantSoleConnectionStatus} connectionStatus */
	    #onConnectionStatusUpdated(connectionStatus) {
	        _console.log({ connectionStatus });
	        this.#dispatchEvent({ type: "connectionStatus", message: { connectionStatus } });
	        this.#dispatchEvent({ type: this.connectionStatus });

	        switch (connectionStatus) {
	            case "connected":
	            case "not connected":
	                this.#dispatchEvent({ type: "isConnected", message: { isConnected: this.isConnected } });
	                break;
	        }
	    }

	    /**
	     * @param {BrilliantSoleConnectionMessageType} messageType
	     * @param {DataView} dataView
	     */
	    #onConnectionMessageReceived(messageType, dataView) {
	        _console.log({ messageType, dataView });
	        switch (messageType) {
	            case "manufacturerName":
	                const manufacturerName = this.#textDecoder.decode(dataView);
	                _console.log({ manufacturerName });
	                this.#updateDeviceInformation({ manufacturerName });
	                break;
	            case "modelNumber":
	                const modelNumber = this.#textDecoder.decode(dataView);
	                _console.log({ modelNumber });
	                this.#updateDeviceInformation({ modelNumber });
	                break;
	            case "softwareRevision":
	                const softwareRevision = this.#textDecoder.decode(dataView);
	                _console.log({ softwareRevision });
	                this.#updateDeviceInformation({ softwareRevision });
	                break;
	            case "hardwareRevision":
	                const hardwareRevision = this.#textDecoder.decode(dataView);
	                _console.log({ hardwareRevision });
	                this.#updateDeviceInformation({ hardwareRevision });
	                break;
	            case "firmwareRevision":
	                const firmwareRevision = this.#textDecoder.decode(dataView);
	                _console.log({ firmwareRevision });
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
	                _console.log({ pnpId });
	                this.#updateDeviceInformation({ pnpId });
	                break;

	            case "batteryLevel":
	                const batteryLevel = dataView.getUint8(0);
	                _console.log({ batteryLevel });
	                this.#updateBatteryLevel(batteryLevel);
	                break;

	            case "getName":
	                const name = this.#textDecoder.decode(dataView);
	                _console.log({ name });
	                this.#updateName(name);
	                break;
	            case "getType":
	                const typeEnum = dataView.getUint8(0);
	                const type = this.#types[typeEnum];
	                _console.log({ typeEnum, type });
	                this.#updateType(type);
	                break;

	            case "getSensorConfiguration":
	                const sensorConfiguration = this.#sensorConfigurationManager.parse(dataView);
	                _console.log({ sensorConfiguration });
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
	        return BrilliantSole.#TextEncoder;
	    }
	    /** @type {TextDecoder} */
	    static #TextDecoder = new TextDecoder();
	    get #textDecoder() {
	        return BrilliantSole.#TextDecoder;
	    }

	    // DEVICE INFORMATION

	    /** @type {BrilliantSoleDeviceInformation} */
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

	    /** @param {BrilliantSoleDeviceInformation} partialDeviceInformation */
	    #updateDeviceInformation(partialDeviceInformation) {
	        _console.log({ partialDeviceInformation });
	        Object.assign(this.#deviceInformation, partialDeviceInformation);
	        _console.log({ deviceInformation: this.#deviceInformation });
	        if (this.#isDeviceInformationComplete) {
	            _console.log("completed deviceInformation");
	            this.#dispatchEvent({ type: "deviceInformation", message: { deviceInformation: this.#deviceInformation } });
	        }
	    }

	    // BATTERY LEVEL

	    /** @type {number?} */
	    #batteryLevel = null;
	    get batteryLevel() {
	        return this.#batteryLevel;
	    }
	    /** @param {number} newBatteryLevel */
	    #updateBatteryLevel(newBatteryLevel) {
	        _console.assertTypeWithError(newBatteryLevel, "number");
	        if (this.#batteryLevel == newBatteryLevel) {
	            _console.warn(`duplicate batteryLevel assignment ${newBatteryLevel}`);
	            return;
	        }
	        _console.log({ newBatteryLevel });
	        this.#batteryLevel = newBatteryLevel;
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
	        _console.assertTypeWithError(updatedName, "string");
	        _console.log({ updatedName });
	        this.#name = updatedName;
	        this.#dispatchEvent({ type: "getName", message: { name: this.#name } });
	    }
	    get maxNameLength() {
	        return 32;
	    }
	    /** @param {string} newName */
	    async setName(newName) {
	        this.#assertIsConnected();
	        _console.assertTypeWithError(newName, "string");
	        _console.assertWithError(
	            newName.length < this.maxNameLength,
	            `name must be less than ${this.maxNameLength} characters long ("${newName}" is ${newName.length} characters long)`
	        );
	        const setNameData = this.#textEncoder.encode(newName);
	        _console.log({ setNameData });
	        await this.#connectionManager.sendMessage("setName", setNameData);
	    }

	    // TYPE

	    /** @type {BrilliantSoleDeviceType[]} */
	    static #Types = ["leftInsole", "rightInsole"];
	    static Types() {
	        return this.#Types;
	    }
	    get #types() {
	        return BrilliantSole.#Types;
	    }
	    /** @type {BrilliantSoleDeviceType?} */
	    #type;
	    get type() {
	        return this.#type;
	    }
	    /** @param {BrilliantSoleDeviceType} newType */
	    #assertValidDeviceType(type) {
	        _console.assertTypeWithError(type, "string");
	        _console.assertWithError(this.#types.includes(type), `invalid type "${type}"`);
	    }
	    /** @param {BrilliantSoleDeviceType} updatedType */
	    #updateType(updatedType) {
	        this.#assertValidDeviceType(updatedType);
	        _console.log({ updatedType });
	        if (updatedType == this.type) {
	            _console.warn("redundant type assignment");
	            return;
	        }
	        this.#type = updatedType;
	        this.#sensorDataManager.deviceType = this.#type;
	        this.#sensorConfigurationManager.deviceType = this.#type;
	        this.#dispatchEvent({ type: "getType", message: { type: this.#type } });
	    }
	    /** @param {BrilliantSoleDeviceType} newType */
	    async setType(newType) {
	        this.#assertIsConnected();
	        this.#assertValidDeviceType(newType);
	        const setTypeData = Uint8Array.from([newType]);
	        _console.log({ setTypeData });
	        await this.#connectionManager.sendMessage("setType", setTypeData);
	    }

	    // SENSOR CONFIGURATION
	    #sensorConfigurationManager = new SensorConfigurationManager();
	    /** @type {BrilliantSoleSensorConfiguration?} */
	    #sensorConfiguration;
	    get sensorConfiguration() {
	        return this.#sensorConfiguration;
	    }

	    /** @param {BrilliantSoleSensorConfiguration} sensorConfiguration */
	    #updateSensorConfiguration(sensorConfiguration) {
	        this.#sensorConfiguration = sensorConfiguration;
	        _console.log({ sensorConfiguration: this.sensorConfiguration });
	        this.#dispatchEvent({
	            type: "getSensorConfiguration",
	            message: { sensorConfiguration: this.sensorConfiguration },
	        });
	    }
	    /** @param {BrilliantSoleSensorConfiguration} newSensorConfiguration */
	    async setSensorConfiguration(newSensorConfiguration) {
	        this.#assertIsConnected();
	        const setSensorConfigurationMessage = this.#sensorConfigurationManager.createData(newSensorConfiguration);
	        _console.log({ setSensorConfigurationMessage });
	        await this.#connectionManager.sendMessage("setSensorConfiguration", message);
	    }

	    // SENSOR DATA

	    /** @type {SensorDataManager} */
	    #sensorDataManager = new SensorDataManager();

	    /**
	     * @param {BrilliantSoleSensorType} sensorType
	     * @param {Object} data
	     * @param {number} data.timestamp
	     */
	    #onSensorDataReceived(sensorType, data) {
	        _console.log({ sensorType, data });
	        this.#dispatchEvent({ type: sensorType, message: data });
	    }

	    // HAPTICS
	    #hapticsManager = new HapticsManager();

	    triggerVibrationWaveformEffects() {
	        // FILL
	    }
	    triggerVibrationWaveform() {
	        // FILL
	    }
	}
	BrilliantSole.setConsoleLevelFlagsForType = setConsoleLevelFlagsForType;
	BrilliantSole.setAllConsoleLevelFlags = setAllConsoleLevelFlags;

	return BrilliantSole;

}));
