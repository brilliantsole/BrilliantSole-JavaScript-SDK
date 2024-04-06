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
	     * @param {string} value
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

	/**
	 * made with ChatGPT
	 * @param {string} string
	 */

	/** @param {string} string */
	function capitalizeFirstCharacter(string) {
	    return string[0].toUpperCase() + string.slice(1);
	}

	const _console$n = createConsole("EventDispatcher", { log: false });

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
	        _console$n.assertWithError(target, "target is required");
	        this.#target = target;
	        _console$n.assertWithError(Array.isArray(eventTypes) || eventTypes == undefined, "eventTypes must be an array");
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
	        _console$n.assertWithError(this.#isValidEventType(type), `invalid event type "${type}"`);
	    }

	    /** @type {Object.<string, [function]?>?} */
	    #listeners;

	    /**
	     * @param {string} type
	     * @param {EventDispatcherListener} listener
	     * @param {EventDispatcherOptions?} options
	     */
	    addEventListener(type, listener, options) {
	        _console$n.log(`adding "${type}" eventListener`, listener);
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
	        _console$n.log(`has "${type}" eventListener?`, listener);
	        this.#assertValidEventType(type);
	        return this.#listeners?.[type]?.includes(listener);
	    }

	    /**
	     * @param {string} type
	     * @param {EventDispatcherListener} listener
	     */
	    removeEventListener(type, listener) {
	        _console$n.log(`removing "${type}" eventListener`, listener);
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
	    let addEventListener = target.addEventListener || target.addListener || target.on || target.AddEventListener;
	    _console$n.assertWithError(addEventListener, "no add listener function found for target");
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
	    let removeEventListener = target.removeEventListener || target.removeListener || target.RemoveEventListener;
	    _console$n.assertWithError(removeEventListener, "no remove listener function found for target");
	    removeEventListener = removeEventListener.bind(target);
	    Object.entries(boundEventListeners).forEach(([eventType, eventListener]) => {
	        removeEventListener(eventType, eventListener);
	    });
	}

	/** @typedef {"webBluetooth" | "noble" | "webSocketClient"} ConnectionType */
	/** @typedef {"not connected" | "connecting" | "connected" | "disconnecting"} ConnectionStatus */
	/** @typedef {"manufacturerName" | "modelNumber" | "softwareRevision" | "hardwareRevision" | "firmwareRevision" | "pnpId" | "serialNumber" | "batteryLevel" | "getName" | "setName" | "getType" | "setType" | "getSensorConfiguration" | "setSensorConfiguration" | "sensorData" | "triggerVibration"} ConnectionMessageType */

	const _console$m = createConsole("ConnectionManager");

	/**
	 * @callback ConnectionStatusCallback
	 * @param {ConnectionStatus} status
	 */

	/**
	 * @callback MessageReceivedCallback
	 * @param {ConnectionMessageType} messageType
	 * @param {DataView} data
	 */

	class BaseConnectionManager {
	    /** @type {ConnectionMessageType[]} */
	    static #MessageTypes = [
	        "manufacturerName",
	        "modelNumber",
	        "softwareRevision",
	        "hardwareRevision",
	        "firmwareRevision",
	        "pnpId",
	        "serialNumber",
	        "batteryLevel",
	        "getName",
	        "setName",
	        "getType",
	        "setType",
	        "getSensorConfiguration",
	        "setSensorConfiguration",
	        "sensorData",
	        "triggerVibration",
	    ];
	    static get MessageTypes() {
	        return this.#MessageTypes;
	    }

	    /** @type {string?} */
	    get id() {
	        this.#throwNotImplementedError("id");
	    }

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
	        _console$m.assertWithError(this.isSupported, `${this.constructor.name} is not supported`);
	    }

	    /** @throws {Error} if abstract class */
	    #assertIsSubclass() {
	        _console$m.assertWithError(
	            this.constructor != BaseConnectionManager,
	            `${this.constructor.name} must be subclassed`
	        );
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
	        _console$m.assertTypeWithError(newConnectionStatus, "string");
	        if (this.#status == newConnectionStatus) {
	            _console$m.log(`tried to assign same connection status "${newConnectionStatus}"`);
	            return;
	        }
	        _console$m.log(`new connection status "${newConnectionStatus}"`);
	        this.#status = newConnectionStatus;
	        this.onStatusUpdated?.(this.status);
	    }

	    get isConnected() {
	        return this.status == "connected";
	    }

	    /** @throws {Error} if connected */
	    #assertIsNotConnected() {
	        _console$m.assertWithError(!this.isConnected, "device is already connected");
	    }
	    /** @throws {Error} if connecting */
	    #assertIsNotConnecting() {
	        _console$m.assertWithError(this.status != "connecting", "device is already connecting");
	    }
	    /** @throws {Error} if not connected */
	    #assertIsConnected() {
	        _console$m.assertWithError(this.isConnected, "device is not connected");
	    }
	    /** @throws {Error} if disconnecting */
	    #assertIsNotDisconnecting() {
	        _console$m.assertWithError(this.status != "disconnecting", "device is already disconnecting");
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
	        _console$m.assert(this.canReconnect, "unable to reconnect");
	    }
	    async disconnect() {
	        this.#assertIsConnected();
	        this.#assertIsNotDisconnecting();
	        this.status = "disconnecting";
	        _console$m.log("disconnecting from device...");
	    }

	    /**
	     * @param {ConnectionMessageType} messageType
	     * @param {DataView|ArrayBuffer} data
	     */
	    async sendMessage(messageType, data) {
	        this.#assertIsConnectedAndNotDisconnecting();
	        _console$m.log("sending message", { messageType, data });
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
	    return `ea6da725-2000-4f9b-893d-c3913e33b3e${offset}`;
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
	            if (!serviceUUID.includes("-")) {
	                serviceInfoUUID = serviceInfoUUID.replaceAll("-", "");
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
	                    if (!characteristicUUID.includes("-")) {
	                        characteristicInfoUUID = characteristicInfoUUID.replaceAll("-", "");
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
	const allServiceUUIDs = [...serviceUUIDs, ...optionalServiceUUIDs];

	/** @param {BluetoothServiceUUID} serviceUUID */
	function getServiceNameFromUUID(serviceUUID) {
	    return bluetoothUUIDs.getServiceNameFromUUID(serviceUUID);
	}

	/** @type {BluetoothCharacteristicUUID[]} */
	const characteristicUUIDs = [];
	/** @type {BluetoothCharacteristicUUID[]} */
	const allCharacteristicUUIDs = [];
	/** @type {BluetoothCharacteristicName[]} */
	const allCharacteristicNames = [];

	Object.entries(bluetoothUUIDs.services).forEach(([serviceName, serviceInfo]) => {
	    if (!serviceInfo.characteristics) {
	        return;
	    }
	    Object.entries(serviceInfo.characteristics).forEach(([characteristicName, characteristicInfo]) => {
	        if (serviceUUIDs.includes(serviceInfo.uuid)) {
	            characteristicUUIDs.push(characteristicInfo.uuid);
	        }
	        allCharacteristicUUIDs.push(characteristicInfo.uuid);
	        allCharacteristicNames.push(characteristicName);
	    });
	}, []);

	//_console.log({ characteristicUUIDs, allCharacteristicUUIDs });

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

	const _console$l = createConsole("WebBluetoothConnectionManager", { log: true });







	if (isInNode) {
	    const webbluetooth = require("webbluetooth");
	    const { bluetooth } = webbluetooth;
	    var navigator$1 = { bluetooth };
	}
	if (isInBrowser) {
	    var navigator$1 = window.navigator;
	}

	class WebBluetoothConnectionManager extends BaseConnectionManager {
	    get id() {
	        return this.device?.id;
	    }

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
	    /** @type {ConnectionType} */
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
	            _console$l.log("tried to assign the same BluetoothDevice");
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

	            _console$l.log("got BluetoothDevice");
	            this.device = device;

	            _console$l.log("connecting to device...");
	            const server = await this.device.gatt.connect();
	            _console$l.log(`connected to device? ${server.connected}`);

	            await this.#getServicesAndCharacteristics();

	            _console$l.log("fully connected");

	            this.status = "connected";
	        } catch (error) {
	            _console$l.error(error);
	            this.status = "not connected";
	            this.server?.disconnect();
	            this.#removeEventListeners();
	        }
	    }
	    async #getServicesAndCharacteristics() {
	        this.#removeEventListeners();

	        _console$l.log("getting services...");
	        const services = await this.server.getPrimaryServices();
	        _console$l.log("got services", services.length);

	        _console$l.log("getting characteristics...");
	        for (const serviceIndex in services) {
	            const service = services[serviceIndex];
	            _console$l.log({ service });
	            const serviceName = getServiceNameFromUUID(service.uuid);
	            _console$l.assertWithError(serviceName, `no name found for service uuid "${service.uuid}"`);
	            _console$l.log(`got "${serviceName}" service`);
	            if (serviceName == "dfu") {
	                _console$l.log("skipping dfu service");
	                continue;
	            }
	            service._name = serviceName;
	            this.#services.set(serviceName, service);
	            _console$l.log(`getting characteristics for "${serviceName}" service`);
	            const characteristics = await service.getCharacteristics();
	            _console$l.log(`got characteristics for "${serviceName}" service`);
	            for (const characteristicIndex in characteristics) {
	                const characteristic = characteristics[characteristicIndex];
	                _console$l.log({ characteristic });
	                const characteristicName = getCharacteristicNameFromUUID(characteristic.uuid);
	                _console$l.assertWithError(
	                    characteristicName,
	                    `no name found for characteristic uuid "${characteristic.uuid}" in "${serviceName}" service`
	                );
	                _console$l.log(`got "${characteristicName}" characteristic in "${serviceName}" service`);
	                characteristic._name = characteristicName;
	                this.#characteristics.set(characteristicName, characteristic);
	                addEventListeners(characteristic, this.#boundBluetoothCharacteristicEventListeners);
	                const characteristicProperties =
	                    characteristic.properties || getCharacteristicProperties(characteristicName);
	                if (characteristicProperties.read) {
	                    _console$l.log(`reading "${characteristicName}" characteristic...`);
	                    await characteristic.readValue();
	                    if (isInBluefy || isInWebBLE) {
	                        this.#onCharacteristicValueChanged(characteristic);
	                    }
	                }
	                if (characteristicProperties.notify) {
	                    _console$l.log(`starting notifications for "${characteristicName}" characteristic`);
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
	        this.server?.disconnect();
	        this.#removeEventListeners();
	        this.status = "not connected";
	    }

	    /** @param {Event} event */
	    #onCharacteristicvaluechanged(event) {
	        _console$l.log("oncharacteristicvaluechanged");

	        /** @type {BluetoothRemoteGATTCharacteristic} */
	        const characteristic = event.target;

	        this.#onCharacteristicValueChanged(characteristic);
	    }

	    /** @param {BluetoothRemoteGATTCharacteristic} characteristic */
	    #onCharacteristicValueChanged(characteristic) {
	        _console$l.log("onCharacteristicValue");

	        /** @type {BluetoothCharacteristicName} */
	        const characteristicName = characteristic._name;
	        _console$l.assertWithError(
	            characteristicName,
	            `no name found for characteristic with uuid "${characteristic.uuid}"`
	        );

	        _console$l.log(`oncharacteristicvaluechanged for "${characteristicName}" characteristic`);
	        const dataView = characteristic.value;
	        _console$l.assertWithError(dataView, `no data found for "${characteristicName}" characteristic`);
	        _console$l.log(`data for "${characteristicName}" characteristic`, Array.from(new Uint8Array(dataView.buffer)));

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
	        _console$l.log("gattserverdisconnected");
	        this.status = "not connected";
	    }

	    /**
	     * @param {ConnectionMessageType} messageType
	     * @param {DataView|ArrayBuffer} data
	     */
	    async sendMessage(messageType, data) {
	        await super.sendMessage(...arguments);

	        /** @type {BluetoothCharacteristicName} */
	        let characteristicName;
	        /** @type {BluetoothRemoteGATTCharacteristic} */
	        let characteristic;

	        switch (messageType) {
	            case "setName":
	                characteristicName = "name";
	                break;
	            case "setType":
	                characteristicName = "type";
	                break;
	            case "setSensorConfiguration":
	                characteristicName = "sensorConfiguration";
	                break;
	            case "triggerVibration":
	                characteristicName = "vibration";
	                break;
	            default:
	                throw Error(`uncaught messageType "${messageType}"`);
	        }

	        if (!characteristicName) {
	            _console$l.log("no characteristicName found");
	            return;
	        }

	        characteristic = this.#characteristics.get(characteristicName);
	        _console$l.assertWithError(characteristic, `no characteristic found with name "${characteristicName}"`);
	        if (data instanceof DataView) {
	            data = data.buffer;
	        }
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
	        _console$l.log("attempting to reconnect...");
	        this.status = "connecting";
	        await this.server.connect();
	        if (this.isConnected) {
	            _console$l.log("successfully reconnected!");
	            await this.#getServicesAndCharacteristics();
	            this.status = "connected";
	        } else {
	            _console$l.log("unable to reconnect");
	            this.status = "not connected";
	        }
	    }
	}

	const _console$k = createConsole("ArrayBufferUtils", { log: false });

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
	            return concatenateArrayBuffers(...array);
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

	/** @param {Buffer} data */
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

	/**
	 * @param {DataView} dataView
	 * @param {number} begin
	 * @param {number?} length
	 */
	function sliceDataView(dataView, begin, length) {
	    let end;
	    if (length) {
	        end = dataView.byteOffset + begin + length;
	    }
	    _console$k.log({ dataView, begin, end, length });
	    return new DataView(dataView.buffer.slice(dataView.byteOffset + begin, end));
	}

	const _console$j = createConsole("NobleConnectionManager", { log: true });

	if (isInNode) {
	    require("@abandonware/noble");
	}







	class NobleConnectionManager extends BaseConnectionManager {
	    get id() {
	        return this.#noblePeripheral?.id;
	    }

	    static get isSupported() {
	        return isInNode;
	    }
	    /** @type {ConnectionType} */
	    static get type() {
	        return "noble";
	    }

	    get isConnected() {
	        return this.#noblePeripheral?.state == "connected";
	    }

	    async connect() {
	        await super.connect();
	        await this.#noblePeripheral.connectAsync();
	    }
	    async disconnect() {
	        await super.disconnect();
	        await this.#noblePeripheral.disconnectAsync();
	    }

	    /**
	     * @param {ConnectionMessageType} messageType
	     * @param {DataView|ArrayBuffer} data
	     */
	    async sendMessage(messageType, data) {
	        await super.sendMessage(...arguments);

	        /** @type {BluetoothCharacteristicName} */
	        let characteristicName;
	        /** @type {noble.Characteristic} */
	        let characteristic;

	        switch (messageType) {
	            case "setName":
	                characteristicName = "name";
	                break;
	            case "setType":
	                characteristicName = "type";
	                break;
	            case "setSensorConfiguration":
	                characteristicName = "sensorConfiguration";
	                break;
	            case "triggerVibration":
	                characteristicName = "vibration";
	                break;
	            default:
	                throw Error(`uncaught messageType "${messageType}"`);
	        }

	        _console$j.log("characteristicName", characteristicName);

	        if (!characteristicName) {
	            _console$j.log("no characteristicName found");
	            return;
	        }

	        characteristic = this.#characteristics.get(characteristicName);
	        _console$j.assertWithError(characteristic, `no characteristic found with name "${characteristicName}"`);
	        if (data instanceof DataView) {
	            data = data.buffer;
	        }
	        const buffer = Buffer.from(data);
	        _console$j.log("writing data", buffer);
	        await characteristic.writeAsync(buffer, false);
	        if (characteristic.properties.includes("read")) {
	            await characteristic.readAsync();
	        }
	    }

	    /** @type {boolean} */
	    get canReconnect() {
	        return this.#noblePeripheral.connectable;
	    }
	    async reconnect() {
	        await super.reconnect();
	        _console$j.log("attempting to reconnect...");
	        this.connect();
	    }

	    // NOBLE
	    /** @type {noble.Peripheral?} */
	    #noblePeripheral;
	    get noblePeripheral() {
	        return this.#noblePeripheral;
	    }
	    set noblePeripheral(newNoblePeripheral) {
	        _console$j.assertTypeWithError(newNoblePeripheral, "object");
	        if (this.noblePeripheral == newNoblePeripheral) {
	            _console$j.log("attempted to assign duplicate noblePeripheral");
	            return;
	        }

	        _console$j.log("newNoblePeripheral", newNoblePeripheral.id);

	        if (this.#noblePeripheral) {
	            removeEventListeners(this.#noblePeripheral, this.#unboundNoblePeripheralListeners);
	            delete this.#noblePeripheral._connectionManager;
	        }

	        if (newNoblePeripheral) {
	            newNoblePeripheral._connectionManager = this;
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

	    async #onNoblePeripheralConnect() {
	        await this._connectionManager.onNoblePeripheralConnect(this);
	    }
	    /** @param {noble.Peripheral} noblePeripheral */
	    async onNoblePeripheralConnect(noblePeripheral) {
	        _console$j.log("onNoblePeripheralConnect", noblePeripheral.id, noblePeripheral.state);
	        if (noblePeripheral.state == "connected") {
	            await this.#noblePeripheral.discoverServicesAsync(allServiceUUIDs);
	        }
	        // this gets called when it connects and disconnects, so we use the noblePeripheral's "state" property instead
	        await this.#onNoblePeripheralState();
	    }

	    async #onNoblePeripheralDisconnect() {
	        await this._connectionManager.onNoblePeripheralConnect(this);
	    }
	    /** @param {noble.Peripheral} noblePeripheral */
	    async onNoblePeripheralDisconnect(noblePeripheral) {
	        _console$j.log("onNoblePeripheralDisconnect", noblePeripheral.id);
	        await this.#onNoblePeripheralState();
	    }

	    async #onNoblePeripheralState() {
	        _console$j.log(`noblePeripheral ${this.id} state ${this.#noblePeripheral.state}`);

	        switch (this.#noblePeripheral.state) {
	            case "connected":
	                //this.status = "connected";
	                break;
	            case "connecting":
	                //this.status = "connecting";
	                break;
	            case "disconnected":
	                this.#removeEventListeners();
	                this.status = "not connected";
	                break;
	            case "disconnecting":
	                this.status = "disconnecting";
	                break;
	            case "error":
	                _console$j.error("noblePeripheral error");
	                break;
	            default:
	                _console$j.log(`uncaught noblePeripheral state ${this.#noblePeripheral.state}`);
	                break;
	        }
	    }

	    #removeEventListeners() {
	        _console$j.log("removing noblePeripheral eventListeners");
	        this.#services.forEach((service) => {
	            removeEventListeners(service, this.#unboundNobleServiceListeners);
	        });
	        this.#services.clear();

	        this.#characteristics.forEach((characteristic) => {
	            removeEventListeners(characteristic, this.#unboundNobleCharacteristicListeners);
	        });
	        this.#characteristics.clear();
	    }

	    /** @param {number} rssi */
	    async #onNoblePeripheralRssiUpdate(rssi) {
	        await this._connectionManager.onNoblePeripheralRssiUpdate(this, rssi);
	    }
	    /**
	     * @param {noble.Peripheral} noblePeripheral
	     * @param {number} rssi
	     */
	    async onNoblePeripheralRssiUpdate(noblePeripheral, rssi) {
	        _console$j.log("onNoblePeripheralRssiUpdate", noblePeripheral.id, rssi);
	        // FILL
	    }

	    /** @param {noble.Service[]} services */
	    async #onNoblePeripheralServicesDiscover(services) {
	        await this._connectionManager.onNoblePeripheralServicesDiscover(this, services);
	    }
	    /**
	     * @param {noble.Peripheral} noblePeripheral
	     * @param {noble.Service[]} services
	     */
	    async onNoblePeripheralServicesDiscover(noblePeripheral, services) {
	        _console$j.log(
	            "onNoblePeripheralServicesDiscover",
	            noblePeripheral.id,
	            services.map((service) => service.uuid)
	        );
	        for (const index in services) {
	            const service = services[index];
	            _console$j.log("service", service.uuid);
	            const serviceName = getServiceNameFromUUID(service.uuid);
	            _console$j.assertWithError(serviceName, `no name found for service uuid "${service.uuid}"`);
	            _console$j.log({ serviceName });
	            this.#services.set(serviceName, service);
	            service._name = serviceName;
	            service._connectionManager = this;
	            addEventListeners(service, this.#unboundNobleServiceListeners);
	            await service.discoverCharacteristicsAsync();
	        }
	    }

	    // NOBLE SERVICE
	    /** @type {Map.<BluetoothServiceName, BluetoothRemoteGATTService} */
	    #services = new Map();

	    #unboundNobleServiceListeners = {
	        characteristicsDiscover: this.#onNobleServiceCharacteristicsDiscover,
	    };

	    /** @param {noble.Characteristic[]} characteristics */
	    async #onNobleServiceCharacteristicsDiscover(characteristics) {
	        await this._connectionManager.onNobleServiceCharacteristicsDiscover(this, characteristics);
	    }
	    /**
	     * @param {noble.Service} service
	     * @param {noble.Characteristic[]} characteristics
	     */
	    async onNobleServiceCharacteristicsDiscover(service, characteristics) {
	        _console$j.log(
	            "onNobleServiceCharacteristicsDiscover",
	            service.uuid,
	            characteristics.map((characteristic) => characteristic.uuid)
	        );

	        for (const index in characteristics) {
	            const characteristic = characteristics[index];
	            _console$j.log("characteristic", characteristic.uuid);
	            const characteristicName = getCharacteristicNameFromUUID(characteristic.uuid);
	            _console$j.assertWithError(
	                characteristicName,
	                `no name found for characteristic uuid "${characteristic.uuid}"`
	            );
	            _console$j.log({ characteristicName });
	            this.#characteristics.set(characteristicName, characteristic);
	            characteristic._name = characteristicName;
	            characteristic._connectionManager = this;
	            addEventListeners(characteristic, this.#unboundNobleCharacteristicListeners);
	            if (characteristic.properties.includes("read")) {
	                await characteristic.readAsync();
	            }
	            if (characteristic.properties.includes("notify")) {
	                await characteristic.subscribeAsync();
	            }
	        }

	        if (this.#hasAllCharacteristics) {
	            this.status = "connected";
	        }
	    }

	    // NOBLE CHARACTERISRTIC
	    #unboundNobleCharacteristicListeners = {
	        data: this.#onNobleCharacteristicData,
	        write: this.#onNobleCharacteristicWrite,
	        notify: this.#onNobleCharacteristicNotify,
	    };

	    /** @type {Map.<BluetoothCharacteristicName, noble.Characteristic} */
	    #characteristics = new Map();

	    get #hasAllCharacteristics() {
	        return allCharacteristicNames.every((characteristicName) => {
	            return this.#characteristics.has(characteristicName);
	        });
	    }

	    /**
	     * @param {Buffer} data
	     * @param {boolean} isNotification
	     */
	    #onNobleCharacteristicData(data, isNotification) {
	        this._connectionManager.onNobleCharacteristicData(this, data, isNotification);
	    }
	    /**
	     *
	     * @param {noble.Characteristic} characteristic
	     * @param {Buffer} data
	     * @param {boolean} isNotification
	     */
	    onNobleCharacteristicData(characteristic, data, isNotification) {
	        _console$j.log("onNobleCharacteristicData", characteristic.uuid, data, isNotification);
	        const dataView = new DataView(dataToArrayBuffer(data));

	        /** @type {BluetoothCharacteristicName} */
	        const characteristicName = characteristic._name;
	        _console$j.assertWithError(
	            characteristicName,
	            `no name found for characteristic with uuid "${characteristic.uuid}"`
	        );

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

	    #onNobleCharacteristicWrite() {
	        this._connectionManager.onNobleCharacteristicWrite(this);
	    }
	    /**
	     * @param {noble.Characteristic} characteristic
	     */
	    onNobleCharacteristicWrite(characteristic) {
	        _console$j.log("onNobleCharacteristicWrite", characteristic.uuid);
	        // FILL
	    }

	    /** @param {boolean} isSubscribed */
	    #onNobleCharacteristicNotify(isSubscribed) {
	        this._connectionManager.onNobleCharacteristicNotify(this, isSubscribed);
	    }
	    /**
	     * @param {noble.Characteristic} characteristic
	     * @param {boolean} isSubscribed
	     */
	    onNobleCharacteristicNotify(characteristic, isSubscribed) {
	        _console$j.log("onNobleCharacteristicNotify", characteristic.uuid, isSubscribed);
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

	const _console$i = createConsole("PressureSensorDataManager", { log: true });

	class PressureSensorDataManager {
	    /** @type {DeviceType} */
	    #deviceType;
	    get deviceType() {
	        return this.#deviceType;
	    }
	    set deviceType(newDeviceType) {
	        _console$i.assertTypeWithError(newDeviceType, "string");
	        if (this.#deviceType == newDeviceType) {
	            _console$i.log(`redundant deviceType assignment "${newDeviceType}"`);
	            return;
	        }
	        _console$i.log({ newDeviceType });
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
	        _console$i.log({ pressureSensorPositions });
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
	            pressure.normalizedSum += normalizedValue / this.numberOfPressureSensors;
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

	        _console$i.log({ pressure });
	        return pressure;
	    }
	}

	/** @typedef {"acceleration" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation"} MotionSensorType */

	const _console$h = createConsole("MotionSensorDataManager", { log: false });

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
	        _console$h.assertTypeWithError(newDeviceType, "string");
	        if (this.#deviceType == newDeviceType) {
	            _console$h.log(`redundant deviceType assignment "${newDeviceType}"`);
	            return;
	        }
	        _console$h.log({ newDeviceType });
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

	        _console$h.log({ vector });
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

	        _console$h.log({ quaternion });
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

	const _console$g = createConsole("ParseUtils", { log: true });

	const textDecoder = new TextDecoder();

	/**
	 * @param {DataView} dataView
	 * @param {number} byteOffset
	 */
	function parseStringFromDataView(dataView, byteOffset = 0) {
	    const stringLength = dataView.getUint8(byteOffset++);
	    const string = textDecoder.decode(
	        dataView.buffer.slice(dataView.byteOffset + byteOffset, dataView.byteOffset + byteOffset + stringLength)
	    );
	    byteOffset += stringLength;
	    return { string, byteOffset };
	}

	/**
	 * @callback ParseMessageCallback
	 * @param {string} messageType
	 * @param {DataView} dataView
	 */

	/**
	 * @param {DataView} dataView
	 * @param {string[]} enumeration
	 * @param {ParseMessageCallback} callback
	 * @param {boolean} parseMessageLengthAsUint16
	 */
	function parseMessage(dataView, enumeration, callback, parseMessageLengthAsUint16 = false) {
	    let byteOffset = 0;
	    while (byteOffset < dataView.byteLength) {
	        const messageTypeEnum = dataView.getUint8(byteOffset++);
	        const messageType = enumeration[messageTypeEnum];

	        /** @type {number} */
	        let messageLength;
	        if (parseMessageLengthAsUint16) {
	            messageLength = dataView.getUint16(byteOffset, true);
	            byteOffset += 2;
	        } else {
	            messageLength = dataView.getUint8(byteOffset++);
	        }

	        _console$g.log({ messageTypeEnum, messageType, messageLength, dataView });
	        _console$g.assertWithError(messageType, `invalid messageTypeEnum ${messageTypeEnum}`);

	        const _dataView = sliceDataView(dataView, byteOffset, messageLength);
	        _console$g.log({ _dataView });

	        callback(messageType, _dataView);

	        byteOffset += messageLength;
	    }
	}

	const _console$f = createConsole("SensorDataManager", { log: false });







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
	        _console$f.assertTypeWithError(newDeviceType, "string");
	        if (this.#deviceType == newDeviceType) {
	            _console$f.log(`redundant deviceType assignment "${newDeviceType}"`);
	            return;
	        }
	        _console$f.log({ newDeviceType });
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
	        _console$f.assertTypeWithError(sensorType, "string");
	        _console$f.assertWithError(this.#Types.includes(sensorType), `invalid sensorType "${sensorType}"`);
	    }
	    /** @param {number} sensorTypeEnum */
	    static AssertValidSensorTypeEnum(sensorTypeEnum) {
	        _console$f.assertTypeWithError(sensorTypeEnum, "number");
	        _console$f.assertWithError(sensorTypeEnum in this.#Types, `invalid sensorTypeEnum ${sensorTypeEnum}`);
	    }

	    /** @type {SensorDataCallback?} */
	    onDataReceived;

	    #timestampOffset = 0;
	    #lastRawTimestamp = 0;
	    clearTimestamp() {
	        _console$f.log("clearing sensorDataManager timestamp data");
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
	        _console$f.log("sensorData", Array.from(new Uint8Array(dataView.buffer)));

	        let byteOffset = 0;
	        const timestamp = this.#parseTimestamp(dataView, byteOffset);
	        byteOffset += 2;

	        const _dataView = new DataView(dataView.buffer, byteOffset);

	        parseMessage(_dataView, SensorDataManager.Types, (messageType, dataView) => {
	            /** @type {SensorType} */
	            const sensorType = messageType;

	            let byteOffset = 0;

	            let value;
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
	                    _console$f.error(`uncaught sensorType "${sensorType}"`);
	            }

	            _console$f.assertWithError(value, `no value defined for sensorType "${sensorType}"`);
	            this.onDataReceived?.(sensorType, { timestamp, [sensorType]: value });
	        });
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
	 * @property {number?} pressure
	 * @property {number?} acceleration
	 * @property {number?} gravity
	 * @property {number?} linearAcceleration
	 * @property {number?} gyroscope
	 * @property {number?} magnetometer
	 * @property {number?} gameRotation
	 * @property {number?} rotation
	 * @property {number?} barometer
	 */

	const _console$e = createConsole("SensorConfigurationManager", { log: false });

	class SensorConfigurationManager {
	    /** @type {DeviceType} */
	    #deviceType;
	    get deviceType() {
	        return this.#deviceType;
	    }
	    set deviceType(newDeviceType) {
	        _console$e.assertTypeWithError(newDeviceType, "string");
	        if (this.#deviceType == newDeviceType) {
	            _console$e.log(`redundant deviceType assignment "${newDeviceType}"`);
	            return;
	        }
	        _console$e.log({ newDeviceType });
	        this.#deviceType = newDeviceType;

	        // can later use for non-insole deviceTypes that ignore sensorTypes like "pressure"
	    }

	    /** @type {SensorType[]} */
	    #availableSensorTypes;
	    /** @param {SensorType} sensorType */
	    #assertAvailableSensorType(sensorType) {
	        _console$e.assertWithError(this.#availableSensorTypes, "must get initial sensorConfiguration");
	        const isSensorTypeAvailable = this.#availableSensorTypes?.includes(sensorType);
	        _console$e.assert(isSensorTypeAvailable, `unavailable sensor type "${sensorType}"`);
	        return isSensorTypeAvailable;
	    }

	    /** @param {DataView} dataView */
	    parse(dataView) {
	        /** @type {SensorConfiguration} */
	        const parsedSensorConfiguration = {};
	        for (let byteOffset = 0; byteOffset < dataView.byteLength; byteOffset += 3) {
	            const sensorTypeIndex = dataView.getUint8(byteOffset);
	            const sensorType = SensorDataManager.Types[sensorTypeIndex];
	            if (!sensorType) {
	                _console$e.warn(`unknown sensorType index ${sensorTypeIndex}`);
	                continue;
	            }
	            const sensorRate = dataView.getUint16(byteOffset + 1, true);
	            _console$e.log({ sensorType, sensorRate });
	            parsedSensorConfiguration[sensorType] = sensorRate;
	        }
	        _console$e.log({ parsedSensorConfiguration });
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
	    static #AssertValidSensorRate(sensorRate) {
	        _console$e.assertTypeWithError(sensorRate, "number");
	        _console$e.assertWithError(sensorRate >= 0, `sensorRate must be 0 or greater (got ${sensorRate})`);
	        _console$e.assertWithError(
	            sensorRate < this.MaxSensorRate,
	            `sensorRate must be 0 or greater (got ${sensorRate})`
	        );
	        _console$e.assertWithError(
	            sensorRate % this.SensorRateStep == 0,
	            `sensorRate must be multiple of ${this.SensorRateStep}`
	        );
	    }

	    /** @param {sensorRate} number */
	    #assertValidSensorRate(sensorRate) {
	        SensorConfigurationManager.#AssertValidSensorRate(sensorRate);
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
	        _console$e.log({ sensorConfigurationData: dataView });
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

	const _console$d = createConsole("VibrationManager");

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
	        _console$d.assertTypeWithError(location, "string");
	        _console$d.assertWithError(this.locations.includes(location), `invalid location "${location}"`);
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
	        _console$d.log({ locationsBitmask });
	        _console$d.assertWithError(locationsBitmask > 0, `locationsBitmask must not be zero`);
	        return locationsBitmask;
	    }

	    /** @param {any[]} array */
	    #assertNonEmptyArray(array) {
	        _console$d.assertWithError(Array.isArray(array), "passed non-array");
	        _console$d.assertWithError(array.length > 0, "passed empty array");
	    }

	    static get WaveformEffects() {
	        return VibrationWaveformEffects;
	    }
	    get waveformEffects() {
	        return VibrationManager.WaveformEffects;
	    }
	    /** @param {VibrationWaveformEffect} waveformEffect */
	    #verifyWaveformEffect(waveformEffect) {
	        _console$d.assertWithError(
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
	            _console$d.assertWithError(delay >= 0, `delay must be 0ms or greater (got ${delay})`);
	            _console$d.assertWithError(
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
	        _console$d.assertTypeWithError(waveformEffectSegmentLoopCount, "number");
	        _console$d.assertWithError(
	            waveformEffectSegmentLoopCount >= 0,
	            `waveformEffectSegmentLoopCount must be 0 or greater (got ${waveformEffectSegmentLoopCount})`
	        );
	        _console$d.assertWithError(
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
	        _console$d.assertWithError(
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
	        _console$d.assertTypeWithError(waveformEffectSequenceLoopCount, "number");
	        _console$d.assertWithError(
	            waveformEffectSequenceLoopCount >= 0,
	            `waveformEffectSequenceLoopCount must be 0 or greater (got ${waveformEffectSequenceLoopCount})`
	        );
	        _console$d.assertWithError(
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
	        _console$d.assertTypeWithError(waveformSegment.amplitude, "number");
	        _console$d.assertWithError(
	            waveformSegment.amplitude >= 0,
	            `amplitude must be 0 or greater (got ${waveformSegment.amplitude})`
	        );
	        _console$d.assertWithError(
	            waveformSegment.amplitude <= 1,
	            `amplitude must be 1 or less (got ${waveformSegment.amplitude})`
	        );

	        _console$d.assertTypeWithError(waveformSegment.duration, "number");
	        _console$d.assertWithError(
	            waveformSegment.duration > 0,
	            `duration must be greater than 0ms (got ${waveformSegment.duration}ms)`
	        );
	        _console$d.assertWithError(
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
	        _console$d.assertWithError(
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
	        _console$d.log({ dataArray, dataView });
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
	        _console$d.log({ dataView });
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
	        _console$d.assertTypeWithError(vibrationType, "string");
	        _console$d.assertWithError(this.#types.includes(vibrationType), `invalid vibrationType "${vibrationType}"`);
	    }

	    /**
	     * @param {VibrationLocation[]} locations
	     * @param {VibrationType} vibrationType
	     * @param {DataView} dataView
	     */
	    #createData(locations, vibrationType, dataView) {
	        _console$d.assertWithError(dataView?.byteLength > 0, "no data received");
	        const locationsBitmask = this.#createLocationsBitmask(locations);
	        this.#verifyVibrationType(vibrationType);
	        const vibrationTypeIndex = this.#types.indexOf(vibrationType);
	        _console$d.log({ locationsBitmask, vibrationTypeIndex, dataView });
	        const data = concatenateArrayBuffers(locationsBitmask, vibrationTypeIndex, dataView.byteLength, dataView);
	        _console$d.log({ data });
	        return data;
	    }
	}

	const _console$c = createConsole("Device", { log: true });



	/** @typedef {"connectionStatus" | ConnectionStatus | "isConnected" | ConnectionMessageType | "deviceInformation" | SensorType | "connectionMessage"} DeviceEventType */

	/** @typedef {"deviceConnected" | "deviceDisconnected" | "deviceIsConnected" | "availableDevices"} StaticDeviceEventType */




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
	    get id() {
	        return this.#connectionManager?.id;
	    }

	    constructor() {
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

	    /** @returns {BaseConnectionManager} */
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

	        "connectionMessage",
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

	    /** @type {BaseConnectionManager?} */
	    #connectionManager;
	    get connectionManager() {
	        return this.#connectionManager;
	    }
	    set connectionManager(newConnectionManager) {
	        if (this.connectionManager == newConnectionManager) {
	            _console$c.log("same connectionManager is already assigned");
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
	        _console$c.log("assigned new connectionManager", this.#connectionManager);
	    }

	    async connect() {
	        if (!this.connectionManager) {
	            this.connectionManager = new Device.#DefaultConnectionManager();
	        }
	        this.#clear();
	        return this.connectionManager.connect();
	    }
	    #isConnected = false;
	    get isConnected() {
	        return this.#isConnected;
	        //return this.connectionManager?.isConnected && this.#hasAllInformation;
	    }
	    /** @throws {Error} if not connected */
	    #assertIsConnected() {
	        _console$c.assertWithError(this.isConnected, "not connected");
	    }

	    /** @type {ConnectionMessageType[]} */
	    static #AllInformationConnectionMessages = [
	        "manufacturerName",
	        "modelNumber",
	        "softwareRevision",
	        "hardwareRevision",
	        "firmwareRevision",
	        "pnpId",
	        "batteryLevel",
	        "getName",
	        "getType",
	        "getSensorConfiguration",
	    ];
	    static get AllInformationConnectionMessages() {
	        return this.#AllInformationConnectionMessages;
	    }
	    get #allInformationConnectionMessages() {
	        return Device.#AllInformationConnectionMessages;
	    }
	    get #hasAllInformation() {
	        console.log("check");
	        return this.#allInformationConnectionMessages.every((messageType) => {
	            return this.latestConnectionMessage.has(messageType);
	        });
	    }

	    get canReconnect() {
	        return this.connectionManager?.canReconnect;
	    }
	    async reconnect() {
	        this.#clear();
	        return this.connectionManager?.reconnect();
	    }

	    static #ReconnectOnDisconnection = false;
	    static get ReconnectOnDisconnection() {
	        return this.#ReconnectOnDisconnection;
	    }
	    static set ReconnectOnDisconnection(newReconnectOnDisconnection) {
	        _console$c.assertTypeWithError(newReconnectOnDisconnection, "boolean");
	        this.#ReconnectOnDisconnection = newReconnectOnDisconnection;
	    }

	    #reconnectOnDisconnection = Device.ReconnectOnDisconnection;
	    get reconnectOnDisconnection() {
	        return this.#reconnectOnDisconnection;
	    }
	    set reconnectOnDisconnection(newReconnectOnDisconnection) {
	        _console$c.assertTypeWithError(newReconnectOnDisconnection, "boolean");
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

	    /** @returns {ConnectionStatus} */
	    get connectionStatus() {
	        switch (this.#connectionManager?.status) {
	            case "connected":
	                return this.isConnected ? "connected" : "connecting";
	            case "not connected":
	            case "connecting":
	            case "disconnecting":
	                return this.#connectionManager.status;
	            default:
	                return "not connected";
	        }
	    }

	    /** @param {ConnectionStatus} connectionStatus */
	    #onConnectionStatusUpdated(connectionStatus) {
	        _console$c.log({ connectionStatus });

	        if (connectionStatus == "not connected") {
	            //this.#clear();

	            if (this.canReconnect && this.reconnectOnDisconnection) {
	                _console$c.log("starting reconnect interval...");
	                this.#reconnectIntervalId = setInterval(() => {
	                    _console$c.log("attempting reconnect...");
	                    this.reconnect();
	                }, 1000);
	            }
	        } else {
	            if (this.#reconnectIntervalId != undefined) {
	                _console$c.log("clearing reconnect interval");
	                clearInterval(this.#reconnectIntervalId);
	                this.#reconnectIntervalId = undefined;
	            }
	        }

	        this.#checkConnection();
	    }

	    /** @param {boolean} includeIsConnected */
	    #dispatchConnectionEvents(includeIsConnected = false) {
	        this.#dispatchEvent({ type: "connectionStatus", message: { connectionStatus: this.connectionStatus } });
	        this.#dispatchEvent({ type: this.connectionStatus });
	        if (includeIsConnected) {
	            this.#dispatchEvent({ type: "isConnected", message: { isConnected: this.isConnected } });
	        }
	    }
	    #checkConnection() {
	        this.#isConnected = this.connectionManager?.isConnected && this.#hasAllInformation;

	        switch (this.connectionStatus) {
	            case "connected":
	                if (this.#isConnected) {
	                    this.#dispatchConnectionEvents(true);
	                }
	                break;
	            case "not connected":
	                this.#dispatchConnectionEvents(true);
	                break;
	            default:
	                this.#dispatchConnectionEvents(false);
	                break;
	        }
	    }

	    #clear() {
	        this.latestConnectionMessage.clear();
	    }

	    /**
	     * @param {ConnectionMessageType} messageType
	     * @param {DataView} dataView
	     */
	    #onConnectionMessageReceived(messageType, dataView) {
	        _console$c.log({ messageType, dataView });
	        switch (messageType) {
	            case "manufacturerName":
	                const manufacturerName = this.#textDecoder.decode(dataView);
	                _console$c.log({ manufacturerName });
	                this.#updateDeviceInformation({ manufacturerName });
	                break;
	            case "modelNumber":
	                const modelNumber = this.#textDecoder.decode(dataView);
	                _console$c.log({ modelNumber });
	                this.#updateDeviceInformation({ modelNumber });
	                break;
	            case "softwareRevision":
	                const softwareRevision = this.#textDecoder.decode(dataView);
	                _console$c.log({ softwareRevision });
	                this.#updateDeviceInformation({ softwareRevision });
	                break;
	            case "hardwareRevision":
	                const hardwareRevision = this.#textDecoder.decode(dataView);
	                _console$c.log({ hardwareRevision });
	                this.#updateDeviceInformation({ hardwareRevision });
	                break;
	            case "firmwareRevision":
	                const firmwareRevision = this.#textDecoder.decode(dataView);
	                _console$c.log({ firmwareRevision });
	                this.#updateDeviceInformation({ firmwareRevision });
	                break;
	            case "pnpId":
	                /** @type {PnpId} */
	                const pnpId = {
	                    source: dataView.getUint8(0) === 1 ? "Bluetooth" : "USB",
	                    productId: dataView.getUint16(3, true),
	                    productVersion: dataView.getUint16(5, true),
	                };
	                if (pnpId.source == "Bluetooth") {
	                    pnpId.vendorId = dataView.getUint16(1, true);
	                }
	                _console$c.log({ pnpId });
	                this.#updateDeviceInformation({ pnpId });
	                break;
	            case "serialNumber":
	                const serialNumber = this.#textDecoder.decode(dataView);
	                _console$c.log({ serialNumber });
	                // will only be used for node.js
	                break;

	            case "batteryLevel":
	                const batteryLevel = dataView.getUint8(0);
	                _console$c.log("received battery level", { batteryLevel });
	                this.#updateBatteryLevel(batteryLevel);
	                break;

	            case "getName":
	                const name = this.#textDecoder.decode(dataView);
	                _console$c.log({ name });
	                this.#updateName(name);
	                break;
	            case "getType":
	                const typeEnum = dataView.getUint8(0);
	                const type = this.#types[typeEnum];
	                _console$c.log({ typeEnum, type });
	                this.#updateType(type);
	                break;

	            case "getSensorConfiguration":
	                const sensorConfiguration = this.#sensorConfigurationManager.parse(dataView);
	                _console$c.log({ sensorConfiguration });
	                this.#updateSensorConfiguration(sensorConfiguration);
	                break;

	            case "sensorData":
	                this.#sensorDataManager.parse(dataView);
	                break;

	            default:
	                throw Error(`uncaught messageType ${messageType}`);
	        }

	        this.latestConnectionMessage.set(messageType, dataView);
	        this.#dispatchEvent({ type: "connectionMessage", message: { messageType, dataView } });

	        if (!this.isConnected && this.#hasAllInformation) {
	            this.#checkConnection();
	        }
	    }

	    /** @type {Map.<ConnectionMessageType, DataView>} */
	    latestConnectionMessage = new Map();

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
	        _console$c.log({ partialDeviceInformation });
	        for (const deviceInformationName in partialDeviceInformation) {
	            this.#dispatchEvent({
	                type: deviceInformationName,
	                message: { [deviceInformationName]: partialDeviceInformation[deviceInformationName] },
	            });
	        }

	        Object.assign(this.#deviceInformation, partialDeviceInformation);
	        _console$c.log({ deviceInformation: this.#deviceInformation });
	        if (this.#isDeviceInformationComplete) {
	            _console$c.log("completed deviceInformation");
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
	        _console$c.assertTypeWithError(updatedBatteryLevel, "number");
	        if (this.#batteryLevel == updatedBatteryLevel) {
	            _console$c.log(`duplicate batteryLevel assignment ${updatedBatteryLevel}`);
	            return;
	        }
	        this.#batteryLevel = updatedBatteryLevel;
	        _console$c.log({ updatedBatteryLevel: this.#batteryLevel });
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
	        _console$c.assertTypeWithError(updatedName, "string");
	        this.#name = updatedName;
	        _console$c.log({ updatedName: this.#name });
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
	        _console$c.assertTypeWithError(newName, "string");
	        _console$c.assertWithError(
	            newName.length >= this.minNameLength,
	            `name must be greater than ${this.minNameLength} characters long ("${newName}" is ${newName.length} characters long)`
	        );
	        _console$c.assertWithError(
	            newName.length < this.maxNameLength,
	            `name must be less than ${this.maxNameLength} characters long ("${newName}" is ${newName.length} characters long)`
	        );
	        const setNameData = this.#textEncoder.encode(newName);
	        _console$c.log({ setNameData });
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
	    get typeEnum() {
	        return Device.Types.indexOf(this.type);
	    }
	    /** @param {DeviceType} type */
	    #assertValidDeviceType(type) {
	        _console$c.assertEnumWithError(type, this.#types);
	    }
	    /** @param {number} typeEnum */
	    #assertValidDeviceTypeEnum(typeEnum) {
	        _console$c.assertTypeWithError(typeEnum, "number");
	        _console$c.assertWithError(this.#types[typeEnum], `invalid typeEnum ${typeEnum}`);
	    }
	    /** @param {DeviceType} updatedType */
	    #updateType(updatedType) {
	        this.#assertValidDeviceType(updatedType);
	        if (updatedType == this.type) {
	            _console$c.log("redundant type assignment");
	            return;
	        }
	        this.#type = updatedType;
	        _console$c.log({ updatedType: this.#type });

	        this.#sensorDataManager.deviceType = this.#type;
	        this.#sensorConfigurationManager.deviceType = this.#type;

	        this.#dispatchEvent({ type: "getType", message: { type: this.#type } });

	        if (Device.#UseLocalStorage) {
	            Device.#UpdateLocalStorageConfigurationForDevice(this);
	        }
	    }
	    /** @param {number} newTypeEnum */
	    async #setTypeEnum(newTypeEnum) {
	        this.#assertValidDeviceTypeEnum(newTypeEnum);
	        const setTypeData = Uint8Array.from([newTypeEnum]);
	        _console$c.log({ setTypeData });
	        await this.#connectionManager.sendMessage("setType", setTypeData);
	    }
	    /** @param {DeviceType} newType */
	    async setType(newType) {
	        this.#assertIsConnected();
	        this.#assertValidDeviceType(newType);
	        const newTypeEnum = this.#types.indexOf(newType);
	        this.#setTypeEnum(newTypeEnum);
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
	    /** @type {SensorType[]} */
	    get sensorTypes() {
	        return Object.keys(this.sensorConfiguration);
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
	    get sensorConfigurationData() {
	        return this.#sensorConfigurationManager.createData(this.sensorConfiguration);
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
	        _console$c.log({ updatedSensorConfiguration: this.#sensorConfiguration });
	        if (!this.#sensorConfigurationManager.hasAtLeastOneNonZeroSensorRate(this.sensorConfiguration)) {
	            _console$c.log("clearing sensorDataManager timestamp...");
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
	        _console$c.log({ newSensorConfiguration });
	        const setSensorConfigurationData = this.#sensorConfigurationManager.createData(newSensorConfiguration);
	        _console$c.log({ setSensorConfigurationData });
	        await this.#connectionManager.sendMessage("setSensorConfiguration", setSensorConfigurationData);
	    }

	    static #ClearSensorConfigurationOnLeave = true;
	    static get ClearSensorConfigurationOnLeave() {
	        return this.#ClearSensorConfigurationOnLeave;
	    }
	    static set ClearSensorConfigurationOnLeave(newClearSensorConfigurationOnLeave) {
	        _console$c.assertTypeWithError(newClearSensorConfigurationOnLeave, "boolean");
	        this.#ClearSensorConfigurationOnLeave = newClearSensorConfigurationOnLeave;
	    }

	    #clearSensorConfigurationOnLeave = Device.ClearSensorConfigurationOnLeave;
	    get clearSensorConfigurationOnLeave() {
	        return this.#clearSensorConfigurationOnLeave;
	    }
	    set clearSensorConfigurationOnLeave(newClearSensorConfigurationOnLeave) {
	        _console$c.assertTypeWithError(newClearSensorConfigurationOnLeave, "boolean");
	        this.#clearSensorConfigurationOnLeave = newClearSensorConfigurationOnLeave;
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
	        /** @type {SensorConfiguration} */
	        const zeroSensorConfiguration = {};
	        this.sensorTypes.forEach((sensorType) => {
	            zeroSensorConfiguration[sensorType] = 0;
	        });
	        return zeroSensorConfiguration;
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
	        _console$c.log({ sensorType, sensorData });
	        this.#dispatchEvent({ type: sensorType, message: sensorData });
	        this.#dispatchEvent({ type: "sensorData", message: { ...sensorData, sensorType } });
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
	            _console$c.log({ type, dataView });
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
	        _console$c.assertTypeWithError(newUseLocalStorage, "boolean");
	        this.#UseLocalStorage = newUseLocalStorage;
	        if (this.#UseLocalStorage && !this.#LocalStorageConfiguration) {
	            this.#LoadFromLocalStorage();
	        }
	    }

	    /**
	     * @typedef LocalStorageDeviceInformation
	     * @type {Object}
	     * @property {string} bluetoothId
	     * @property {DeviceType} type
	     */

	    /**
	     * @typedef LocalStorageConfiguration
	     * @type {Object}
	     * @property {LocalStorageDeviceInformation[]} devices
	     */

	    /** @type {LocalStorageConfiguration} */
	    static #DefaultLocalStorageConfiguration = {
	        devices: [],
	    };
	    /** @type {LocalStorageConfiguration?} */
	    static #LocalStorageConfiguration;

	    static get CanUseLocalStorage() {
	        return isInBrowser && window.localStorage;
	    }

	    static #AssertLocalStorage() {
	        _console$c.assertWithError(isInBrowser, "localStorage is only available in the browser");
	        _console$c.assertWithError(window.localStorage, "localStorage not found");
	    }
	    static #LocalStorageKey = "BS.Device";
	    static #SaveToLocalStorage() {
	        this.#AssertLocalStorage();
	        localStorage.setItem(this.#LocalStorageKey, JSON.stringify(this.#LocalStorageConfiguration));
	    }
	    static async #LoadFromLocalStorage() {
	        this.#AssertLocalStorage();
	        let localStorageString = localStorage.getItem(this.#LocalStorageKey);
	        if (typeof localStorageString != "string") {
	            _console$c.log("no info found in localStorage");
	            this.#LocalStorageConfiguration = Object.assign({}, this.#DefaultLocalStorageConfiguration);
	            this.#SaveToLocalStorage();
	            return;
	        }
	        try {
	            const configuration = JSON.parse(localStorageString);
	            _console$c.log({ configuration });
	            this.#LocalStorageConfiguration = configuration;
	            if (this.CanGetDevices) {
	                await this.GetDevices();
	            }
	        } catch (error) {
	            _console$c.error(error);
	        }
	    }

	    /** @param {Device} device */
	    static #UpdateLocalStorageConfigurationForDevice(device) {
	        if (device.connectionType != "webBluetooth") {
	            _console$c.log("localStorage is only for webBluetooth devices");
	            return;
	        }
	        this.#AssertLocalStorage();
	        const deviceInformationIndex = this.#LocalStorageConfiguration.devices.findIndex((deviceInformation) => {
	            return deviceInformation.bluetoothId == device.id;
	        });
	        if (deviceInformationIndex == -1) {
	            return;
	        }
	        this.#LocalStorageConfiguration.devices[deviceInformationIndex].type = device.type;
	        this.#SaveToLocalStorage();
	    }

	    // AVAILABLE DEVICES
	    /** @type {Device[]} */
	    static #AvailableDevices = [];
	    static get AvailableDevices() {
	        return this.#AvailableDevices;
	    }

	    static get CanGetDevices() {
	        return isInBrowser && navigator.bluetooth?.getDevices;
	    }
	    /**
	     * retrieves devices already connected via web bluetooth in other tabs/windows
	     *
	     * _only available on web-bluetooth enabled browsers_
	     *
	     * @returns {Promise<Device[]?>}
	     */
	    static async GetDevices() {
	        if (!isInBrowser) {
	            _console$c.warn("GetDevices is only available in the browser");
	            return;
	        }

	        if (!navigator.bluetooth) {
	            _console$c.warn("bluetooth is not available in this browser");
	            return;
	        }

	        if (!navigator.bluetooth.getDevices) {
	            _console$c.warn("bluetooth.getDevices() is not available in this browser");
	            return;
	        }

	        if (!this.#LocalStorageConfiguration) {
	            this.#LoadFromLocalStorage();
	        }

	        const configuration = this.#LocalStorageConfiguration;
	        if (!configuration.devices || configuration.devices.length == 0) {
	            _console$c.log("no devices found in configuration");
	            return;
	        }

	        const bluetoothDevices = await navigator.bluetooth.getDevices();

	        _console$c.log({ bluetoothDevices });

	        bluetoothDevices.forEach((bluetoothDevice) => {
	            if (!bluetoothDevice.gatt) {
	                return;
	            }
	            let deviceInformation = configuration.devices.find(
	                (deviceInformation) => bluetoothDevice.id == deviceInformation.bluetoothId
	            );
	            if (!deviceInformation) {
	                return;
	            }

	            let existingConnectedDevice = this.ConnectedDevices.filter(
	                (device) => device.connectionType == "webBluetooth"
	            ).find((device) => device.id == bluetoothDevice.id);

	            const existingAvailableDevice = this.AvailableDevices.filter(
	                (device) => device.connectionType == "webBluetooth"
	            ).find((device) => device.id == bluetoothDevice.id);
	            if (existingAvailableDevice) {
	                if (
	                    existingConnectedDevice?.id == existingAvailableDevice.id &&
	                    existingConnectedDevice != existingAvailableDevice
	                ) {
	                    this.AvailableDevices[this.#AvailableDevices.indexOf(existingAvailableDevice)] =
	                        existingConnectedDevice;
	                }
	                return;
	            }

	            if (existingConnectedDevice) {
	                this.AvailableDevices.push(existingConnectedDevice);
	                return;
	            }

	            const device = new Device();
	            const connectionManager = new WebBluetoothConnectionManager();
	            connectionManager.device = bluetoothDevice;
	            if (bluetoothDevice.name) {
	                device.#updateName(bluetoothDevice.name);
	            }
	            device.#updateType(deviceInformation.type);
	            device.connectionManager = connectionManager;

	            this.AvailableDevices.push(device);
	        });
	        this.#DispatchAvailableDevices();
	        return this.AvailableDevices;
	    }

	    // STATIC EVENTLISTENERS

	    /** @type {StaticDeviceEventType[]} */
	    static #StaticEventTypes = ["deviceConnected", "deviceDisconnected", "deviceIsConnected", "availableDevices"];
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
	                _console$c.log("adding device", device);
	                this.#ConnectedDevices.push(device);
	                if (this.UseLocalStorage && device.connectionType == "webBluetooth") {
	                    const deviceInformation = {
	                        type: device.type,
	                        bluetoothId: device.id,
	                    };
	                    const deviceInformationIndex = this.#LocalStorageConfiguration.devices.findIndex(
	                        (_deviceInformation) => _deviceInformation.bluetoothId == deviceInformation.bluetoothId
	                    );
	                    if (deviceInformationIndex == -1) {
	                        this.#LocalStorageConfiguration.devices.push(deviceInformation);
	                    } else {
	                        this.#LocalStorageConfiguration.devices[deviceInformationIndex] = deviceInformation;
	                    }
	                    this.#SaveToLocalStorage();
	                }
	                this.#DispatchEvent({ type: "deviceConnected", message: { device } });
	                this.#DispatchEvent({ type: "deviceIsConnected", message: { device } });
	            } else {
	                _console$c.log("device already included");
	            }
	        } else {
	            if (this.#ConnectedDevices.includes(device)) {
	                _console$c.log("removing device", device);
	                this.#ConnectedDevices.splice(this.#ConnectedDevices.indexOf(device), 1);
	                this.#DispatchEvent({ type: "deviceDisconnected", message: { device } });
	                this.#DispatchEvent({ type: "deviceIsConnected", message: { device } });
	            } else {
	                _console$c.log("device already not included");
	            }
	        }
	        if (this.CanGetDevices) {
	            this.GetDevices();
	        }
	        if (device.isConnected && !this.AvailableDevices.includes(device)) {
	            this.AvailableDevices.push(device);
	            this.#DispatchAvailableDevices();
	        }
	    }

	    static #DispatchAvailableDevices() {
	        _console$c.log({ AvailableDevices: this.AvailableDevices });
	        this.#DispatchEvent({ type: "availableDevices", message: { devices: this.AvailableDevices } });
	    }

	    static async Connect() {
	        const device = new Device();
	        await device.connect();
	        return device;
	    }

	    static {
	        if (this.CanUseLocalStorage) {
	            this.UseLocalStorage = true;
	        }
	    }
	}

	const _console$b = createConsole("Timer", { log: false });

	class Timer {
	    /** @type {function} */
	    #callback;
	    get callback() {
	        return this.#callback;
	    }
	    set callback(newCallback) {
	        _console$b.assertTypeWithError(newCallback, "function");
	        _console$b.log({ newCallback });
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
	        _console$b.assertTypeWithError(newInterval, "number");
	        _console$b.assertWithError(newInterval > 0, "interval must be above 0");
	        _console$b.log({ newInterval });
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
	            _console$b.log("interval already running");
	            return;
	        }
	        _console$b.log("starting interval");
	        this.#intervalId = setInterval(this.#callback, this.#interval);
	    }
	    stop() {
	        if (!this.isRunning) {
	            _console$b.log("interval already not running");
	            return;
	        }
	        _console$b.log("stopping interval");
	        clearInterval(this.#intervalId);
	        this.#intervalId = null;
	    }
	    restart() {
	        this.stop();
	        this.start();
	    }
	}

	const _console$a = createConsole("BaseScanner");



	/** @typedef {"isAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice"} ScannerEventType */




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
	        _console$a.assertWithError(this.isSupported, `${this.constructor.name} is not supported`);
	    }

	    // CONSTRUCTOR

	    #assertIsSubclass() {
	        _console$a.assertWithError(this.constructor != BaseScanner, `${this.constructor.name} must be subclassed`);
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
	        _console$a.assertWithError(this.isAvailable, "not available");
	    }

	    // SCANNING
	    get isScanning() {
	        return false;
	    }
	    #assertIsScanning() {
	        _console$a.assertWithError(this.isScanning, "not scanning");
	    }
	    #assertIsNotScanning() {
	        _console$a.assertWithError(!this.isScanning, "already scanning");
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
	        _console$a.assertWithError(
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
	            console.log(now - timestamp);
	            if (now - timestamp > this.#discoveredDeviceExpirationTimeout) {
	                _console$a.log("discovered device timeout");
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
	        _console$a.log("resetting...");
	    }
	}

	const _console$9 = createConsole("NobleScanner", { log: true });

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
	        _console$9.assertTypeWithError(newIsScanning, "boolean");
	        if (this.isScanning == newIsScanning) {
	            _console$9.log("duplicate isScanning assignment");
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
	        _console$9.assertTypeWithError(newNobleState, "string");
	        if (this.#nobleState == newNobleState) {
	            _console$9.log("duplicate nobleState assignment");
	            return;
	        }
	        this.#_nobleState = newNobleState;
	        _console$9.log({ newNobleState });
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
	        _console$9.log("OnNobleScanStart");
	        this.#isScanning = true;
	    }
	    #onNobleScanStop() {
	        _console$9.log("OnNobleScanStop");
	        this.#isScanning = false;
	    }
	    /** @param {NobleState} state */
	    #onNobleStateChange(state) {
	        _console$9.log("onNobleStateChange", state);
	        this.#nobleState = state;
	    }
	    /** @param {noble.Peripheral} noblePeripheral */
	    #onNobleDiscover(noblePeripheral) {
	        _console$9.log("onNobleDiscover", noblePeripheral.id);
	        if (!this.#noblePeripherals[noblePeripheral.id]) {
	            noblePeripheral._scanner = this;
	            this.#noblePeripherals[noblePeripheral.id] = noblePeripheral;
	        }

	        let deviceType;
	        const serviceData = noblePeripheral.advertisement.serviceData;
	        if (serviceData) {
	            //_console.log("serviceData", serviceData);
	            const deviceTypeServiceUUID = serviceUUIDs[0].replaceAll("-", "");
	            //_console.log("deviceTypeServiceUUID", deviceTypeServiceUUID);
	            const deviceTypeServiceData = serviceData.find((serviceDatum) => {
	                return serviceDatum.uuid == deviceTypeServiceUUID;
	            });
	            //_console.log("deviceTypeServiceData", deviceTypeServiceData);
	            if (deviceTypeServiceData) {
	                const deviceTypeEnum = deviceTypeServiceData.data.readUint8(0);
	                deviceType = Device.Types[deviceTypeEnum];
	            }
	        }

	        /** @type {DiscoveredDevice} */
	        const discoveredDevice = {
	            name: noblePeripheral.advertisement.localName,
	            id: noblePeripheral.id,
	            deviceType,
	            rssi: noblePeripheral.rssi,
	        };
	        this.dispatchEvent({ type: "discoveredDevice", message: { discoveredDevice } });
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
	        noble.startScanningAsync(serviceUUIDs, true);
	    }
	    stopScan() {
	        super.stopScan();
	        noble.stopScanningAsync();
	    }

	    // RESET
	    get canReset() {
	        return true;
	    }
	    reset() {
	        super.reset();
	        noble.reset();
	    }

	    // BASESCANNER LISTENERS
	    #boundBaseScannerListeners = {
	        expiredDiscoveredDevice: this.#onExpiredDiscoveredDevice.bind(this),
	    };

	    /** @param {ScannerEvent} event */
	    #onExpiredDiscoveredDevice(event) {
	        /** @type {DiscoveredDevice} */
	        const discoveredDevice = event.message.discoveredDevice;
	        const noblePeripheral = this.#noblePeripherals[discoveredDevice.id];
	        if (noblePeripheral) {
	            // disconnect?
	            delete this.#noblePeripherals[discoveredDevice.id];
	        }
	    }

	    // DISCOVERED DEVICES
	    /** @type {Object.<string, noble.Peripheral>} */
	    #noblePeripherals = {};
	    /** @param {string} noblePeripheralId */
	    #assertValidNoblePeripheralId(noblePeripheralId) {
	        _console$9.assertTypeWithError(noblePeripheralId, "string");
	        _console$9.assertWithError(
	            this.#noblePeripherals[noblePeripheralId],
	            `no noblePeripheral found with id "${noblePeripheralId}"`
	        );
	    }

	    // DEVICES
	    /** @param {string} deviceId */
	    async connectToDevice(deviceId) {
	        super.connectToDevice(deviceId);
	        this.#assertValidNoblePeripheralId(deviceId);
	        const noblePeripheral = this.#noblePeripherals[deviceId];
	        _console$9.log("connecting to discoveredDevice...", deviceId);

	        let device = Device.AvailableDevices.filter((device) => device.connectionType == "noble").find(
	            (device) => device.id == deviceId
	        );
	        if (!device) {
	            device = this.#createDevice(noblePeripheral);
	            await device.connect();
	        } else {
	            await device.reconnect();
	        }
	    }

	    /** @param {noble.Peripheral} noblePeripheral */
	    #createDevice(noblePeripheral) {
	        const device = new Device();
	        const nobleConnectionManager = new NobleConnectionManager();
	        nobleConnectionManager.noblePeripheral = noblePeripheral;
	        device.connectionManager = nobleConnectionManager;
	        return device;
	    }
	}

	const _console$8 = createConsole("Scanner", { log: false });

	/** @type {BaseScanner?} */
	let scanner;

	if (NobleScanner.isSupported) {
	    _console$8.log("using NobleScanner");
	    scanner = new NobleScanner();
	} else {
	    _console$8.log("Scanner not available");
	}

	var Scanner = scanner;

	const _console$7 = createConsole("DevicePairPressureSensorDataManager", { log: true });







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
	        _console$7.log({ pressure, insoleSide });
	        this.#rawPressure[insoleSide] = pressure;
	        if (this.#hasAllPressureData) {
	            return this.#updatePressureData();
	        } else {
	            _console$7.log("doesn't have all pressure data yet...");
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

	        _console$7.log({ devicePairPressure: pressure });

	        return pressure;
	    }
	}

	const _console$6 = createConsole("DevicePairSensorDataManager", { log: true });






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

	    

	    /** @param {DeviceEvent} event */
	    onDeviceSensorData(event) {
	        const { timestamp } = event.message;

	        /** @type {SensorType} */
	        const sensorType = event.message.sensorType;

	        _console$6.log({ sensorType, timestamp, event });

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
	                _console$6.log(`uncaught sensorType "${sensorType}"`);
	                break;
	        }

	        if (value) {
	            const timestamps = Object.assign({}, this.#timestamps[sensorType]);
	            this.onDataReceived?.(sensorType, { timestamps, [sensorType]: value });
	        } else {
	            _console$6.log("no value received");
	        }
	    }

	    /** @type {SensorDataCallback?} */
	    onDataReceived;
	}

	const _console$5 = createConsole("DevicePair", { log: true });







	/** @typedef {"deviceIsConnected" | "deviceConnectionStatus"} DevicePairDeviceEventType */
	/**
	 * @typedef { "deviceSensorData" |
	 * "devicePressure" |
	 * "deviceAcceleration" |
	 * "deviceGravity" |
	 * "deviceLinearAcceleration" |
	 * "deviceGyroscope" |
	 * "deviceMagnetometer" |
	 * "deviceGameRotation" |
	 * "deviceRotation" |
	 * "deviceBarometer"
	 * } DevicePairDeviceSensorEventType
	 */
	/** @typedef {"pressure"} DevicePairSensorType */
	/** @typedef {"isConnected" | DevicePairDeviceEventType | DevicePairDeviceSensorEventType | DevicePairSensorType | "deviceGetSensorConfiguration"} DevicePairEventType */








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
	    static #EventTypes = [
	        "isConnected",
	        "pressure",
	        ...Device.EventTypes.map((sensorType) => `device${capitalizeFirstCharacter(sensorType)}`),
	    ];
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
	        _console$5.assertWithError(this.isConnected, "devicePair must be connected");
	    }

	    /** @param {Device} device */
	    assignInsole(device) {
	        if (!device.isInsole) {
	            _console$5.warn("device is not an insole");
	            return;
	        }
	        const side = device.insoleSide;

	        const currentDevice = this[side];

	        if (device == currentDevice) {
	            _console$5.log("device already assigned");
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

	        _console$5.log(`assigned ${side} insole`, device);

	        this.resetPressureRange();

	        this.#dispatchEvent({ type: "isConnected", message: { isConnected: this.isConnected } });
	        this.#dispatchEvent({ type: "deviceIsConnected", message: { device, isConnected: device.isConnected } });

	        return currentDevice;
	    }

	    /** @type {Object.<string, EventListener} */
	    #boundDeviceEventListeners = {
	        connectionStatus: this.#redispatchDeviceEvent.bind(this),
	        isConnected: this.#onDeviceIsConnected.bind(this),
	        sensorData: this.#onDeviceSensorData.bind(this),
	        getSensorConfiguration: this.#redispatchDeviceEvent.bind(this),
	    };

	    /** @param {DeviceEvent} deviceEvent */
	    #redispatchDeviceEvent(deviceEvent) {
	        this.#dispatchEvent({
	            type: `device${capitalizeFirstCharacter(deviceEvent.type)}`,
	            message: { ...deviceEvent.message, device: deviceEvent.target },
	        });
	    }

	    /** @param {DeviceEvent} deviceEvent */
	    #onDeviceIsConnected(deviceEvent) {
	        this.#redispatchDeviceEvent(deviceEvent);
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
	    /** @param {DeviceEvent} deviceEvent */
	    #onDeviceSensorData(deviceEvent) {
	        this.#redispatchDeviceEvent(deviceEvent);
	        this.#dispatchEvent({
	            type: `device${capitalizeFirstCharacter(deviceEvent.message.sensorType)}`,
	            message: { ...deviceEvent.message, device: deviceEvent.target },
	        });

	        if (this.isConnected) {
	            this.#sensorDataManager.onDeviceSensorData(deviceEvent);
	        }
	    }
	    /**
	     * @param {SensorType} sensorType
	     * @param {Object} sensorData
	     * @param {number} sensorData.timestamp
	     */
	    #onSensorDataReceived(sensorType, sensorData) {
	        _console$5.log({ sensorType, sensorData });
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

	const _console$4 = createConsole("ServerUtils", { log: false });

	const pingTimeout = 30_000_000;
	const reconnectTimeout = 3_000;

	// MESSAGING

	/** @typedef {Number | Number[] | ArrayBufferLike | DataView} MessageLike */

	/**
	 * @typedef Message
	 * @type {Object}
	 * @property {string} type
	 * @property {MessageLike|MessageLike[]?} data
	 */

	/**
	 * @param {string[]} enumeration
	 * @param  {...(Message|string)} messages
	 */
	function createMessage(enumeration, ...messages) {
	    _console$4.log("createMessage", ...messages);

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

	        _console$4.assertEnumWithError(message.type, enumeration);
	        const messageTypeEnum = enumeration.indexOf(message.type);

	        return concatenateArrayBuffers(
	            messageTypeEnum,
	            Uint16Array.from([messageDataArrayBufferByteLength]),
	            messageDataArrayBuffer
	        );
	    });
	    _console$4.log("messageBuffers", ...messageBuffers);
	    return concatenateArrayBuffers(...messageBuffers);
	}

	/**
	 * @typedef { "ping"
	 * | "pong"
	 * | "isScanningAvailable"
	 * | "isScanning"
	 * | "startScan"
	 * | "stopScan"
	 * | "discoveredDevice"
	 * | "discoveredDevices"
	 * | "expiredDiscoveredDevice"
	 * | "connectToDevice"
	 * | "disconnectFromDevice"
	 * | "connectedDevices"
	 * | "deviceMessage"
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
	    "discoveredDevice",
	    "discoveredDevices",
	    "expiredDiscoveredDevice",
	    "connectToDevice",
	    "disconnectFromDevice",
	    "connectedDevices",
	    "deviceMessage",
	];

	/** @param {...ServerMessage|ServerMessageType} messages */
	function createServerMessage(...messages) {
	    return createMessage(ServerMessageTypes, ...messages);
	}



	/**
	 * @typedef DeviceMessage
	 * @type {Object}
	 * @property {DeviceEventType} type
	 * @property {MessageLike|MessageLike[]?} data
	 */

	/** @param {...DeviceEventType|DeviceMessage} messages */
	function createDeviceMessage(...messages) {
	    _console$4.log("createDeviceMessage", ...messages);
	    return createMessage(Device.EventTypes, ...messages);
	}



	/**
	 * @typedef ClientDeviceMessage
	 * @type {Object}
	 * @property {ConnectionMessageType} type
	 * @property {MessageLike|MessageLike[]?} data
	 */

	/** @param {...ConnectionMessageType|ClientDeviceMessage} messages */
	function createClientDeviceMessage(...messages) {
	    return createMessage(BaseConnectionManager.MessageTypes, ...messages);
	}

	// STATIC MESSAGES

	const pingMessage = createServerMessage("ping");
	const pongMessage = createServerMessage("pong");
	createServerMessage("isScanningAvailable");
	createServerMessage("isScanning");
	createServerMessage("startScan");
	createServerMessage("stopScan");
	const discoveredDevicesMessage = createServerMessage("discoveredDevices");

	const _console$3 = createConsole("WebSocketClientConnectionManager", { log: true });









	class WebSocketClientConnectionManager extends BaseConnectionManager {
	    static get isSupported() {
	        return isInBrowser;
	    }
	    /** @type {ConnectionType} */
	    static get type() {
	        return "webSocketClient";
	    }

	    /** @type {string?} */
	    #id;
	    get id() {
	        return this.#id;
	    }
	    set id(newId) {
	        _console$3.assertTypeWithError(newId, "string");
	        if (this.#id == newId) {
	            _console$3.log("redundant id assignment");
	            return;
	        }
	        this.#id = newId;
	    }

	    #isConnected = false;
	    get isConnected() {
	        return this.#isConnected;
	    }
	    set isConnected(newIsConnected) {
	        _console$3.assertTypeWithError(newIsConnected, "boolean");
	        if (this.#isConnected == newIsConnected) {
	            _console$3.log("redundant newIsConnected assignment", newIsConnected);
	            return;
	        }
	        this.#isConnected = newIsConnected;

	        this.status = this.#isConnected ? "connected" : "not connected";

	        if (this.#isConnected) {
	            this.#requestAllDeviceInformation();
	        }
	    }

	    async connect() {
	        await super.connect();
	        this.sendWebSocketConnectMessage();
	    }
	    async disconnect() {
	        await super.disconnect();
	        this.sendWebSocketDisconnectMessage();
	    }

	    /**
	     * @param {ConnectionMessageType} messageType
	     * @param {DataView|ArrayBuffer} data
	     */
	    async sendMessage(messageType, data) {
	        await super.sendMessage(...arguments);
	        switch (messageType) {
	            case "setName":
	            case "setType":
	            case "setSensorConfiguration":
	            case "triggerVibration":
	                this.sendWebSocketMessage({ type: messageType, data });
	                break;
	            default:
	                throw Error(`uncaught messageType "${messageType}"`);
	        }
	    }

	    /** @type {boolean} */
	    get canReconnect() {
	        return true;
	    }
	    async reconnect() {
	        await super.reconnect();
	        _console$3.log("attempting to reconnect...");
	        this.connect();
	    }

	    /**
	     * @callback SendWebSocketMessageCallback
	     * @param {...(ConnectionMessageType|ClientDeviceMessage)} messages
	     */

	    /** @type {SendWebSocketMessageCallback?} */
	    sendWebSocketMessage;
	    /** @type {function?} */
	    sendWebSocketConnectMessage;
	    /** @type {function?} */
	    sendWebSocketDisconnectMessage;
	    /** @param {DataView} dataView */
	    onWebSocketMessage(dataView) {
	        _console$3.log({ dataView });

	        parseMessage(
	            dataView,
	            Device.EventTypes,
	            (_messageType, dataView) => {
	                /** @type {DeviceEventType} */
	                const messageType = _messageType;

	                let byteOffset = 0;

	                switch (messageType) {
	                    case "isConnected":
	                        const isConnected = Boolean(dataView.getUint8(byteOffset++));
	                        _console$3.log({ isConnected });
	                        this.isConnected = isConnected;
	                        break;
	                    case "manufacturerName":
	                    case "modelNumber":
	                    case "softwareRevision":
	                    case "hardwareRevision":
	                    case "firmwareRevision":
	                    case "pnpId":
	                    case "batteryLevel":
	                    case "getName":
	                    case "getType":
	                    case "getSensorConfiguration":
	                    case "sensorData":
	                        this.onMessageReceived(messageType, dataView);
	                        break;
	                    default:
	                        _console$3.error(`uncaught messageType "${messageType}"`);
	                        break;
	                }
	            },
	            true
	        );
	    }

	    #requestAllDeviceInformation() {
	        this.sendWebSocketMessage(...Device.AllInformationConnectionMessages);
	    }
	}

	const _console$2 = createConsole("WebSocketClient", { log: true });




	/** @typedef {"not connected" | "connecting" | "connected" | "disconnecting"} ClientConnectionStatus */

	/** @typedef {ClientConnectionStatus | "connectionStatus" |  "isConnected" | "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice"} ClientEventType */

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
	        "discoveredDevice",
	        "expiredDiscoveredDevice",
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
	            _console$2.log("redundant webSocket assignment");
	            return;
	        }

	        _console$2.log("assigning webSocket", newWebSocket);

	        if (this.#webSocket) {
	            removeEventListeners(this.#webSocket, this.#boundWebSocketEventListeners);
	        }

	        addEventListeners(newWebSocket, this.#boundWebSocketEventListeners);
	        this.#webSocket = newWebSocket;

	        _console$2.log("assigned webSocket");
	    }

	    get isConnected() {
	        return this.webSocket?.readyState == WebSocket.OPEN;
	    }
	    #assertConnection() {
	        _console$2.assertWithError(this.isConnected, "not connected");
	    }

	    get isDisconnected() {
	        return this.webSocket?.readyState == WebSocket.CLOSED;
	    }
	    #assertDisconnection() {
	        _console$2.assertWithError(this.isDisconnected, "not disconnected");
	    }

	    /** @param {(string | URL)?} url */
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

	    /** @param {(string | URL)?} url */
	    toggleConnection(url) {
	        if (this.isConnected) {
	            this.disconnect();
	        } else if (this.webSocket) {
	            this.reconnect();
	        } else {
	            this.connect(url);
	        }
	    }

	    static #ReconnectOnDisconnection = true;
	    static get ReconnectOnDisconnection() {
	        return this.#ReconnectOnDisconnection;
	    }
	    static set ReconnectOnDisconnection(newReconnectOnDisconnection) {
	        _console$2.assertTypeWithError(newReconnectOnDisconnection, "boolean");
	        this.#ReconnectOnDisconnection = newReconnectOnDisconnection;
	    }

	    #reconnectOnDisconnection = WebSocketClient.#ReconnectOnDisconnection;
	    get reconnectOnDisconnection() {
	        return this.#reconnectOnDisconnection;
	    }
	    set reconnectOnDisconnection(newReconnectOnDisconnection) {
	        _console$2.assertTypeWithError(newReconnectOnDisconnection, "boolean");
	        this.#reconnectOnDisconnection = newReconnectOnDisconnection;
	    }

	    // WEBSOCKET MESSAGING

	    

	    /** @param  {MessageLike} message */
	    #sendWebSocketMessage(message) {
	        this.#assertConnection();
	        this.#webSocket.send(message);
	    }

	    
	    

	    /** @param {...ServerMessage | ServerMessageType} messages */
	    #sendServerMessage(...messages) {
	        this.#sendWebSocketMessage(createServerMessage(...messages));
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
	        _console$2.log("webSocket.open", event);
	        this.#pingTimer.start();
	        this.#connectionStatus = "connected";
	    }
	    /** @param {import("ws").MessageEvent} event */
	    async #onWebSocketMessage(event) {
	        _console$2.log("webSocket.message", event);
	        this.#pingTimer.restart();
	        const arrayBuffer = await event.data.arrayBuffer();
	        const dataView = new DataView(arrayBuffer);
	        this.#parseMessage(dataView);
	    }
	    /** @param {import("ws").CloseEvent} event  */
	    #onWebSocketClose(event) {
	        _console$2.log("webSocket.close", event);

	        this.#connectionStatus = "not connected";

	        Object.entries(this.devices).forEach(([id, device]) => {
	            /** @type {WebSocketClientConnectionManager} */
	            const connectionManager = device.connectionManager;
	            connectionManager.isConnected = false;
	        });

	        this.#pingTimer.stop();
	        if (this.#reconnectOnDisconnection) {
	            setTimeout(() => {
	                this.reconnect();
	            }, reconnectTimeout);
	        }
	    }
	    /** @param {Event} event */
	    #onWebSocketError(event) {
	        _console$2.log("webSocket.error", event);
	    }

	    // CONNECTION STATUS

	    /** @type {ClientConnectionStatus} */
	    #_connectionStatus = "not connected";
	    get #connectionStatus() {
	        return this.#_connectionStatus;
	    }
	    set #connectionStatus(newConnectionStatus) {
	        _console$2.assertTypeWithError(newConnectionStatus, "string");
	        _console$2.log({ newConnectionStatus });
	        this.#_connectionStatus = newConnectionStatus;

	        this.#dispatchEvent({ type: "connectionStatus", message: { connectionStatus: this.connectionStatus } });
	        this.#dispatchEvent({ type: this.connectionStatus });

	        switch (newConnectionStatus) {
	            case "connected":
	            case "not connected":
	                this.#dispatchEvent({ type: "isConnected", message: { isConnected: this.isConnected } });
	                if (this.isConnected) {
	                    //this.#requestIsScanningAvailable();
	                    //this.#requestDiscoveredDevices();
	                    this.#sendServerMessage("isScanningAvailable", "discoveredDevices", "connectedDevices");
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

	    /** @param {DataView} dataView */
	    #parseMessage(dataView) {
	        _console$2.log("parseMessage", { dataView });
	        parseMessage(
	            dataView,
	            ServerMessageTypes,
	            (_messageType, dataView) => {
	                /** @type {ServerMessageType} */
	                const messageType = _messageType;

	                let byteOffset = 0;

	                switch (messageType) {
	                    case "ping":
	                        this.#pong();
	                        break;
	                    case "pong":
	                        break;
	                    case "isScanningAvailable":
	                        {
	                            const isScanningAvailable = Boolean(dataView.getUint8(byteOffset++));
	                            _console$2.log({ isScanningAvailable });
	                            this.#isScanningAvailable = isScanningAvailable;
	                        }
	                        break;
	                    case "isScanning":
	                        {
	                            const isScanning = Boolean(dataView.getUint8(byteOffset++));
	                            _console$2.log({ isScanning });
	                            this.#isScanning = isScanning;
	                        }
	                        break;
	                    case "discoveredDevice":
	                        {
	                            const { string: discoveredDeviceString } = parseStringFromDataView(dataView, byteOffset);
	                            _console$2.log({ discoveredDeviceString });

	                            /** @type {DiscoveredDevice} */
	                            const discoveredDevice = JSON.parse(discoveredDeviceString);
	                            _console$2.log({ discoveredDevice });

	                            this.#onDiscoveredDevice(discoveredDevice);
	                        }
	                        break;
	                    case "expiredDiscoveredDevice":
	                        {
	                            const { string: deviceId } = parseStringFromDataView(dataView, byteOffset);
	                            this.#onExpiredDiscoveredDevice(deviceId);
	                        }
	                        break;
	                    case "connectedDevices":
	                        {
	                            if (dataView.byteLength == 0) {
	                                break;
	                            }
	                            const { string: connectedDeviceIdStrings } = parseStringFromDataView(dataView, byteOffset);
	                            _console$2.log({ connectedDeviceIdStrings });
	                            const connectedDeviceIds = JSON.parse(connectedDeviceIdStrings);
	                            _console$2.log({ connectedDeviceIds });
	                            this.#onConnectedDeviceIds(connectedDeviceIds);
	                        }
	                        break;
	                    case "deviceMessage":
	                        {
	                            const { string: deviceId, byteOffset: _byteOffset } = parseStringFromDataView(
	                                dataView,
	                                byteOffset
	                            );
	                            byteOffset = _byteOffset;
	                            const device = this.#devices[deviceId];
	                            _console$2.assertWithError(device, `no device found for id ${deviceId}`);
	                            /** @type {WebSocketClientConnectionManager} */
	                            const connectionManager = device.connectionManager;
	                            const _dataView = sliceDataView(dataView, byteOffset);
	                            connectionManager.onWebSocketMessage(_dataView);
	                        }
	                        break;
	                    default:
	                        _console$2.error(`uncaught messageType "${messageType}"`);
	                        break;
	                }
	            },
	            true
	        );
	    }

	    // PING
	    #pingTimer = new Timer(this.#ping.bind(this), pingTimeout);
	    #ping() {
	        this.#sendServerMessage("ping");
	    }
	    #pong() {
	        this.#sendServerMessage("pong");
	    }

	    // SCANNING
	    #_isScanningAvailable = false;
	    get #isScanningAvailable() {
	        return this.#_isScanningAvailable;
	    }
	    set #isScanningAvailable(newIsAvailable) {
	        _console$2.assertTypeWithError(newIsAvailable, "boolean");
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
	        _console$2.assertWithError(this.isScanningAvailable, "scanning is not available");
	    }
	    #requestIsScanningAvailable() {
	        this.#sendServerMessage("isScanningAvailable");
	    }

	    #_isScanning = false;
	    get #isScanning() {
	        return this.#_isScanning;
	    }
	    set #isScanning(newIsScanning) {
	        _console$2.assertTypeWithError(newIsScanning, "boolean");
	        this.#_isScanning = newIsScanning;
	        this.#dispatchEvent({ type: "isScanning", message: { isScanning: this.isScanning } });
	    }
	    get isScanning() {
	        return this.#isScanning;
	    }
	    #requestIsScanning() {
	        this.#sendServerMessage("isScanning");
	    }

	    #assertIsScanning() {
	        _console$2.assertWithError(this.isScanning, "is not scanning");
	    }
	    #assertIsNotScanning() {
	        _console$2.assertWithError(!this.isScanning, "is already scanning");
	    }

	    startScan() {
	        this.#assertIsNotScanning();
	        this.#sendServerMessage("startScan");
	    }
	    stopScan() {
	        this.#assertIsScanning();
	        this.#sendServerMessage("stopScan");
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
	    /** @type {Object.<string, DiscoveredDevice>} */
	    #discoveredDevices = {};
	    get discoveredDevices() {
	        return this.#discoveredDevices;
	    }

	    /** @param {DiscoveredDevice} discoveredDevice */
	    #onDiscoveredDevice(discoveredDevice) {
	        _console$2.log({ discoveredDevice });
	        this.#discoveredDevices[discoveredDevice.id] = discoveredDevice;
	        this.#dispatchEvent({ type: "discoveredDevice", message: { discoveredDevice } });
	    }
	    #requestDiscoveredDevices() {
	        this.#sendWebSocketMessage(discoveredDevicesMessage);
	    }
	    /** @param {string} deviceId */
	    #onExpiredDiscoveredDevice(deviceId) {
	        _console$2.log({ expiredDeviceId: deviceId });
	        const discoveredDevice = this.#discoveredDevices[deviceId];
	        if (!discoveredDevice) {
	            _console$2.warn(`no discoveredDevice found with id "${deviceId}"`);
	            return;
	        }
	        _console$2.log({ expiredDiscoveredDevice: discoveredDevice });
	        delete this.#discoveredDevices[deviceId];
	        this.#dispatchEvent({ type: "expiredDiscoveredDevice", message: { discoveredDevice } });
	    }

	    // DEVICE CONNECTION

	    /** @param {string} deviceId */
	    connectToDevice(deviceId) {
	        return this.#requestConnectionToDevice(deviceId);
	    }
	    /** @param {string} deviceId */
	    #requestConnectionToDevice(deviceId) {
	        this.#assertConnection();
	        _console$2.assertTypeWithError(deviceId, "string");
	        const device = this.#getOrCreateDevice(deviceId);
	        device.connect();
	        return device;
	    }
	    /** @param {string} deviceId */
	    #sendConnectToDeviceMessage(deviceId) {
	        this.#sendWebSocketMessage(this.#createConnectToDeviceMessage(deviceId));
	    }
	    /** @param {string} deviceId */
	    #createConnectToDeviceMessage(deviceId) {
	        return createServerMessage({ type: "connectToDevice", data: deviceId });
	    }

	    /** @param {string} deviceId */
	    #createDevice(deviceId) {
	        const device = new Device();
	        const clientConnectionManager = new WebSocketClientConnectionManager();
	        clientConnectionManager.id = deviceId;
	        clientConnectionManager.sendWebSocketMessage = this.#sendDeviceMessage.bind(this, deviceId);
	        clientConnectionManager.sendWebSocketConnectMessage = this.#sendConnectToDeviceMessage.bind(this, deviceId);
	        clientConnectionManager.sendWebSocketDisconnectMessage = this.#sendDisconnectFromDeviceMessage.bind(
	            this,
	            deviceId
	        );
	        device.connectionManager = clientConnectionManager;
	        return device;
	    }

	    /** @param {string} deviceId */
	    #getOrCreateDevice(deviceId) {
	        let device = this.#devices[deviceId];
	        if (!device) {
	            device = this.#createDevice(deviceId);
	            this.#devices[deviceId] = device;
	        }
	        return device;
	    }
	    /** @param {string[]} deviceIds */
	    #onConnectedDeviceIds(deviceIds) {
	        _console$2.log({ deviceIds });
	        deviceIds.forEach((deviceId) => {
	            const device = this.#getOrCreateDevice(deviceId);
	            /** @type {WebSocketClientConnectionManager} */
	            const connectionManager = device.connectionManager;
	            connectionManager.isConnected = true;
	        });
	    }

	    /** @param {string} deviceId */
	    disconnectFromDevice(deviceId) {
	        this.#requestDisconnectionFromDevice(deviceId);
	    }
	    /** @param {string} deviceId */
	    #requestDisconnectionFromDevice(deviceId) {
	        this.#assertConnection();
	        _console$2.assertTypeWithError(deviceId, "string");
	        const device = this.devices[deviceId];
	        _console$2.assertWithError(device, `no device found with id ${deviceId}`);
	        device.disconnect();
	        return device;
	    }
	    /** @param {string} deviceId */
	    #sendDisconnectFromDeviceMessage(deviceId) {
	        this.#sendWebSocketMessage(this.#createDisconnectFromDeviceMessage(deviceId));
	    }
	    /** @param {string} deviceId */
	    #createDisconnectFromDeviceMessage(deviceId) {
	        return createServerMessage({ type: "disconnectFromDevice", data: deviceId });
	    }

	    
	    

	    /**
	     * @param {string} deviceId
	     * @param {...(ConnectionMessageType|ClientDeviceMessage)} messages
	     */
	    #sendDeviceMessage(deviceId, ...messages) {
	        this.#sendWebSocketMessage(this.#createDeviceMessage(deviceId, ...messages));
	    }

	    /**
	     * @param {string} deviceId
	     * @param {...(ConnectionMessageType|ClientDeviceMessage)} messages
	     */
	    #createDeviceMessage(deviceId, ...messages) {
	        return createServerMessage({
	            type: "deviceMessage",
	            data: [deviceId, createClientDeviceMessage(...messages)],
	        });
	    }

	    // DEVICES
	    /** @type {Object.<string, Device>} */
	    #devices = {};
	    get devices() {
	        return this.#devices;
	    }
	}

	const _console$1 = createConsole("BaseServer", { log: true });











	/** @typedef {"clientConnected" | "clientDisconnected"} ServerEventType */
	/**
	 * @typedef ServerEvent
	 * @type {Object}
	 * @property {BaseServer} target
	 * @property {ServerEventType} type
	 * @property {Object} message
	 */

	class BaseServer {
	    /** @throws {Error} if abstract class */
	    #assertIsSubclass() {
	        _console$1.assertWithError(this.constructor != BaseServer, `${this.constructor.name} must be subclassed`);
	    }

	    // EVENT DISPATCHER

	    /** @type {ServerEventType[]} */
	    static #EventTypes = ["clientConnected", "clientDisconnected"];
	    static get EventTypes() {
	        return this.#EventTypes;
	    }
	    get eventTypes() {
	        return BaseServer.#EventTypes;
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
	     * @protected
	     * @param {ServerEvent} event
	     */
	    dispatchEvent(event) {
	        this.#eventDispatcher.dispatchEvent(event);
	    }

	    /**
	     * @param {ServerEventType} type
	     * @param {EventDispatcherListener} listener
	     */
	    removeEventListener(type, listener) {
	        return this.#eventDispatcher.removeEventListener(type, listener);
	    }

	    // CONSTRUCTOR

	    constructor() {
	        this.#assertIsSubclass();

	        _console$1.assertWithError(Scanner, "no scanner defined");

	        addEventListeners(Scanner, this.#boundScannerListeners);
	        addEventListeners(Device, this.#boundDeviceClassListeners);
	        addEventListeners(this, this.#boundServerListeners);
	    }

	    get numberOfClients() {
	        return 0;
	    }

	    static #ClearSensorConfigurationsWhenNoClients = true;
	    static get ClearSensorConfigurationsWhenNoClients() {
	        return this.#ClearSensorConfigurationsWhenNoClients;
	    }
	    static set ClearSensorConfigurationsWhenNoClients(newValue) {
	        _console$1.assertTypeWithError(newValue, "boolean");
	        this.#ClearSensorConfigurationsWhenNoClients = newValue;
	    }

	    #clearSensorConfigurationsWhenNoClients = BaseServer.#ClearSensorConfigurationsWhenNoClients;
	    get clearSensorConfigurationsWhenNoClients() {
	        return this.#clearSensorConfigurationsWhenNoClients;
	    }
	    set clearSensorConfigurationsWhenNoClients(newValue) {
	        _console$1.assertTypeWithError(newValue, "boolean");
	        this.#clearSensorConfigurationsWhenNoClients = newValue;
	    }

	    // SERVER LISTENERS
	    #boundServerListeners = {
	        clientConnected: this.#onClientConnected.bind(this),
	        clientDisconnected: this.#onClientDisconnected.bind(this),
	    };

	    /** @param {ServerEvent} event */
	    #onClientConnected(event) {
	        event.message.client;
	        _console$1.log("onClientConnected");
	    }
	    /** @param {ServerEvent} event */
	    #onClientDisconnected(event) {
	        event.message.client;
	        _console$1.log("onClientDisconnected");
	        if (this.numberOfClients == 0 && this.clearSensorConfigurationsWhenNoClients) {
	            Device.ConnectedDevices.forEach((device) => device.clearSensorConfiguration());
	        }
	    }

	    // CLIENT MESSAGING

	    /**
	     * @protected
	     * @param {ArrayBuffer} message
	     */
	    broadcastMessage(message) {
	        _console$1.log("broadcasting", message);
	    }

	    // SCANNER

	    #boundScannerListeners = {
	        isAvailable: this.#onScannerIsAvailable.bind(this),
	        isScanning: this.#onScannerIsScanning.bind(this),
	        discoveredDevice: this.#onScannerDiscoveredDevice.bind(this),
	        expiredDiscoveredDevice: this.#onExpiredDiscoveredDevice.bind(this),
	    };

	    /** @param {ScannerEvent} event */
	    #onScannerIsAvailable(event) {
	        this.broadcastMessage(this.#isScanningAvailableMessage);
	    }
	    get #isScanningAvailableMessage() {
	        return createServerMessage({ type: "isScanningAvailable", data: Scanner.isAvailable });
	    }

	    /** @param {ScannerEvent} event */
	    #onScannerIsScanning(event) {
	        this.broadcastMessage(this.#isScanningMessage);
	    }
	    get #isScanningMessage() {
	        return createServerMessage({ type: "isScanning", data: Scanner.isScanning });
	    }

	    /** @param {ScannerEvent} event */
	    #onScannerDiscoveredDevice(event) {
	        /** @type {DiscoveredDevice} */
	        const discoveredDevice = event.message.discoveredDevice;
	        console.log(discoveredDevice);

	        this.broadcastMessage(this.#createDiscoveredDeviceMessage(discoveredDevice));
	    }
	    /** @param {DiscoveredDevice} discoveredDevice */
	    #createDiscoveredDeviceMessage(discoveredDevice) {
	        return createServerMessage({ type: "discoveredDevice", data: discoveredDevice });
	    }

	    /** @param {ScannerEvent} event */
	    #onExpiredDiscoveredDevice(event) {
	        /** @type {DiscoveredDevice} */
	        const discoveredDevice = event.message.discoveredDevice;
	        console.log("expired", discoveredDevice);
	        this.broadcastMessage(this.#createExpiredDiscoveredDeviceMessage(discoveredDevice));
	    }
	    /** @param {DiscoveredDevice} discoveredDevice */
	    #createExpiredDiscoveredDeviceMessage(discoveredDevice) {
	        return createServerMessage({ type: "expiredDiscoveredDevice", data: discoveredDevice.id });
	    }

	    get #discoveredDevicesMessage() {
	        return createServerMessage(
	            ...Scanner.discoveredDevicesArray.map((discoveredDevice) => {
	                return { type: "discoveredDevice", data: discoveredDevice };
	            })
	        );
	    }

	    get #connectedDevicesMessage() {
	        return createServerMessage({
	            type: "connectedDevices",
	            data: JSON.stringify(Device.ConnectedDevices.map((device) => device.id)),
	        });
	    }

	    // DEVICE LISTENERS

	    #boundDeviceListeners = {
	        connectionMessage: this.#onDeviceConnectionMessage.bind(this),
	    };

	    /**
	     * @param {Device} device
	     * @param {DeviceEventType} messageType
	     * @param {DataView?} dataView
	     * @returns {DeviceMessage}
	     */
	    #createDeviceMessage(device, messageType, dataView) {
	        return { type: messageType, data: dataView || device.latestConnectionMessage.get(messageType) };
	    }

	    
	    

	    /** @param {DeviceEvent} deviceEvent */
	    #onDeviceConnectionMessage(deviceEvent) {
	        const device = deviceEvent.target;
	        _console$1.log("onDeviceConnectionMessage", deviceEvent.message);

	        if (!device.isConnected) {
	            return;
	        }

	        /** @type {ConnectionMessageType} */
	        const messageType = deviceEvent.message.messageType;
	        /** @type {DataView} */
	        const dataView = deviceEvent.message.dataView;

	        this.broadcastMessage(
	            this.#createDeviceServerMessage(device, this.#createDeviceMessage(device, messageType, dataView))
	        );
	    }

	    // DEVICE CLASS LISTENERS

	    #boundDeviceClassListeners = {
	        deviceConnected: this.#onDeviceConnected.bind(this),
	        deviceDisconnected: this.#onDeviceDisconnected.bind(this),
	        deviceIsConnected: this.#onDeviceIsConnected.bind(this),
	    };

	    

	    /** @param {StaticDeviceEvent} staticDeviceEvent */
	    #onDeviceConnected(staticDeviceEvent) {
	        /** @type {Device} */
	        const device = staticDeviceEvent.message.device;
	        _console$1.log("onDeviceConnected", device.id);
	        addEventListeners(device, this.#boundDeviceListeners);
	    }

	    /** @param {StaticDeviceEvent} staticDeviceEvent */
	    #onDeviceDisconnected(staticDeviceEvent) {
	        /** @type {Device} */
	        const device = staticDeviceEvent.message.device;
	        _console$1.log("onDeviceDisconnected", device.id);
	        removeEventListeners(device, this.#boundDeviceListeners);
	    }

	    /** @param {StaticDeviceEvent} staticDeviceEvent */
	    #onDeviceIsConnected(staticDeviceEvent) {
	        /** @type {Device} */
	        const device = staticDeviceEvent.message.device;
	        _console$1.log("onDeviceIsConnected", device.id);
	        this.broadcastMessage(this.#createDeviceIsConnectedMessage(device));
	    }
	    /** @param {Device} device */
	    #createDeviceIsConnectedMessage(device) {
	        return this.#createDeviceServerMessage(device, { type: "isConnected", data: device.isConnected });
	    }

	    /**
	     * @param {Device} device
	     * @param {...DeviceEventType|DeviceMessage} messages
	     */
	    #createDeviceServerMessage(device, ...messages) {
	        return createServerMessage({
	            type: "deviceMessage",
	            data: [device.id, createDeviceMessage(...messages)],
	        });
	    }

	    // PARSING

	    

	    /**
	     * @protected
	     * @param {DataView} dataView
	     */
	    parseClientMessage(dataView) {
	        /** @type {ArrayBuffer[]} */
	        let responseMessages = [];

	        parseMessage(
	            dataView,
	            ServerMessageTypes,
	            (_messageType, dataView) => {
	                /** @type {ServerMessageType} */
	                const messageType = _messageType;
	                switch (messageType) {
	                    case "ping":
	                        responseMessages.push(pongMessage);
	                        break;
	                    case "pong":
	                        break;
	                    case "isScanningAvailable":
	                        responseMessages.push(this.#isScanningAvailableMessage);
	                        break;
	                    case "isScanning":
	                        responseMessages.push(this.#isScanningMessage);
	                        break;
	                    case "startScan":
	                        Scanner.startScan();
	                        break;
	                    case "stopScan":
	                        Scanner.stopScan();
	                        break;
	                    case "discoveredDevices":
	                        responseMessages.push(this.#discoveredDevicesMessage);
	                        break;
	                    case "connectToDevice":
	                        {
	                            const { string: deviceId } = parseStringFromDataView(dataView);
	                            Scanner.connectToDevice(deviceId);
	                        }
	                        break;
	                    case "disconnectFromDevice":
	                        {
	                            const { string: deviceId } = parseStringFromDataView(dataView);
	                            const device = Device.ConnectedDevices.find((device) => device.id == deviceId);
	                            if (!device) {
	                                _console$1.error(`no device found with id ${deviceId}`);
	                                break;
	                            }
	                            device.disconnect();
	                        }
	                        break;
	                    case "connectedDevices":
	                        responseMessages.push(this.#connectedDevicesMessage);
	                        break;
	                    case "deviceMessage":
	                        {
	                            const { string: deviceId, byteOffset } = parseStringFromDataView(dataView);
	                            const device = Device.ConnectedDevices.find((device) => device.id == deviceId);
	                            if (!device) {
	                                _console$1.error(`no device found with id ${deviceId}`);
	                                break;
	                            }
	                            const _dataView = new DataView(dataView.buffer, dataView.byteOffset + byteOffset);
	                            responseMessages.push(this.parseClientDeviceMessage(device, _dataView));
	                        }
	                        break;
	                    default:
	                        _console$1.error(`uncaught messageType "${messageType}"`);
	                        break;
	                }
	            },
	            true
	        );

	        responseMessages = responseMessages.filter(Boolean);

	        if (responseMessages.length > 0) {
	            return concatenateArrayBuffers(responseMessages);
	        }
	    }

	    /**
	     * @protected
	     * @param {Device} device
	     * @param {DataView} dataView
	     */
	    parseClientDeviceMessage(device, dataView) {
	        _console$1.log("onDeviceMessage", device.id, dataView);

	        /** @type {(DeviceEventType | DeviceMessage)[]} */
	        let responseMessages = [];

	        parseMessage(
	            dataView,
	            BaseConnectionManager.MessageTypes,
	            (_messageType, dataView) => {
	                /** @type {ConnectionMessageType} */
	                const messageType = _messageType;
	                switch (messageType) {
	                    case "manufacturerName":
	                    case "modelNumber":
	                    case "softwareRevision":
	                    case "hardwareRevision":
	                    case "firmwareRevision":
	                    case "pnpId":
	                    case "batteryLevel":
	                    case "getName":
	                    case "getType":
	                    case "getSensorConfiguration":
	                        responseMessages.push(this.#createDeviceMessage(device, messageType));
	                        break;
	                    case "setName":
	                    case "setType":
	                    case "setSensorConfiguration":
	                    case "triggerVibration":
	                        device.connectionManager.sendMessage(messageType, dataView);
	                        break;
	                    default:
	                        _console$1.error(`uncaught messageType "${messageType}"`);
	                        break;
	                }
	            },
	            true
	        );

	        if (responseMessages.length > 0) {
	            return this.#createDeviceServerMessage(device, ...responseMessages);
	        }
	    }
	}

	const _console = createConsole("WebSocketServer", { log: true });

	if (isInNode) {
	    require("ws");
	}

	class WebSocketServer extends BaseServer {
	    get numberOfClients() {
	        return this.#server?.clients.size || 0;
	    }

	    // WEBSOCKET SERVER

	    /** @type {ws.WebSocketServer?} */
	    #server;
	    get server() {
	        return this.#server;
	    }
	    set server(newServer) {
	        if (this.#server == newServer) {
	            _console.log("redundant WebSocket assignment");
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

	    // WEBSOCKET SERVER LISTENERS

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
	        this.dispatchEvent({ type: "clientConnected", message: { client } });
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

	    // WEBSOCKET CLIENT LISTENERS

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
	        this.dispatchEvent({ type: "clientDisconnected", message: { client } });
	    }
	    /** @param {ws.ErrorEvent} event */
	    #onClientError(event) {
	        _console.log("client.error");
	    }

	    // PARSING

	    /**
	     * @param {ws.WebSocket} client
	     * @param {DataView} dataView
	     */
	    #parseClientMessage(client, dataView) {
	        const responseMessage = this.parseClientMessage(dataView);
	        if (responseMessage) {
	            client.send(responseMessage);
	        }
	    }

	    // CLIENT MESSAGING

	    /** @param {ArrayBuffer} message */
	    broadcastMessage(message) {
	        super.broadcastMessage(message);
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
	}

	/** @typedef {Device} Device */
	/** @typedef {DevicePair} DevicePair */

	var BS = {
	    setAllConsoleLevelFlags,
	    setConsoleLevelFlagsForType,
	    Device,
	    DevicePair,
	    WebSocketClient,
	    WebSocketServer,
	    Scanner,
	};

	return BS;

}));
