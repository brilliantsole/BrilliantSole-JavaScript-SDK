import ConnectionManager from "./connection/ConnectionManager.js";
import WebBluetoothConnectionManager from "./connection/bluetooth/WebBluetoothConnectionManager.js";
import EventDispatcher, {
    bindEventListeners,
    addEventListeners,
    removeEventListeners,
} from "./utils/EventDispatcher.js";
import { createConsole, setAllConsoleLevelFlags, setConsoleLevelFlagsForType } from "./utils/Console.js";
import DataManager from "./data/DataManager.js";

const _console = createConsole("BrilliantSole", { log: false });

/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherListener} EventDispatcherListener */
/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherOptions} EventDispatcherOptions */
/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherEvent} EventDispatcherEvent */

/** @typedef {import("./connection/ConnectionManager.js").BrilliantSoleConnectionManagerEventType} BrilliantSoleConnectionManagerEventType */
/** @typedef {import("./connection/ConnectionManager.js").BrilliantSoleConnectionStatus} BrilliantSoleConnectionStatus */

/** @typedef {BrilliantSoleConnectionStatus|BrilliantSoleConnectionManagerEventType|BrilliantSoleDataManagerEventType} BrilliantSoleEventType */
/** @typedef {import("./data/DataManager.js").BrilliantSoleSensorType} BrilliantSoleSensorType */
/** @typedef {import("./data/DataManager.js").BrilliantSoleVibrationMotor} BrilliantSoleVibrationMotor */
/** @typedef {import("./data/DataManager.js").BrilliantSoleDataManagerEventType} BrilliantSoleDataManagerEventType */

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
        this.connectionManager = new WebBluetoothConnectionManager();

        bindEventListeners(DataManager.EventTypes, this.#boundDataManagerEventListeners, this);
        addEventListeners(this.#dataManager, this.#boundDataManagerEventListeners);
    }

    /** @type {BrilliantSoleEventType[]} */
    static #EventTypes = [
        ...ConnectionManager.EventTypes,
        ...DataManager.EventTypes,
        "connecting",
        "connected",
        "disconnecting",
        "not connected",
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
        if (true || ![171, 48, 32, 0].includes(array[0])) {
            //_console.log("data", Array.from(new Uint8Array(dataView.buffer)));
            _console.log(
                Array.from(new Uint8Array(dataView.buffer))
                    .map((value) => value.toString().padStart(3, "0"))
                    .join(",")
            );
            _console.log(array.map(String.fromCharCode).join(""));
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
        this.#dispatchEvent(event);
    }
    /**
     * @private
     * @param {BrilliantSoleEvent} event
     */
    _onAcceleration(event) {
        const acceleration = event.message.acceleration;
        _console.log("acceleration", acceleration);
        this.#dispatchEvent(event);
    }
    /**
     * @private
     * @param {BrilliantSoleEvent} event
     */
    _onLinearAcceleration(event) {
        const linearAcceleration = event.message.linearAcceleration;
        _console.log("linearAcceleration", linearAcceleration);
        this.#dispatchEvent(event);
    }
    /**
     * @private
     * @param {BrilliantSoleEvent} event
     */
    _onMagneticRotation(event) {
        const magneticRotation = event.message.magneticRotation;
        _console.log("magneticRotation", magneticRotation);
        this.#dispatchEvent(event);
    }
    /**
     * @private
     * @param {BrilliantSoleEvent} event
     */
    _onQuaternion(event) {
        const quaternion = event.message.quaternion;
        _console.log("quaternion", quaternion);
        this.#dispatchEvent(event);
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

export default BrilliantSole;
