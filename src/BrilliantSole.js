import { createConsole, setAllConsoleLevelFlags, setConsoleLevelFlagsForType } from "./utils/Console.js";
import ConnectionManager from "./connection/ConnectionManager.js";
import WebBluetoothConnectionManager from "./connection/bluetooth/WebBluetoothConnectionManager.js";
import EventDispatcher, {
    bindEventListeners,
    addEventListeners,
    removeEventListeners,
} from "./utils/EventDispatcher.js";
import SensorDataManager from "./sensorData/SensorDataManager.js";

const _console = createConsole("BrilliantSole", { log: false });

/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherListener} EventDispatcherListener */
/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherOptions} EventDispatcherOptions */
/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherEvent} EventDispatcherEvent */

/** @typedef {import("./connection/ConnectionManager.js").BrilliantSoleConnectionStatus} BrilliantSoleConnectionStatus */
/** @typedef {import("./connection/ConnectionManager.js").BrilliantSoleConnectionMessageType} BrilliantSoleConnectionMessageType */

/** @typedef {BrilliantSoleConnectionStatus|BrilliantSoleConnectionMessageType|BrilliantSoleSensorDataManagerEventType} BrilliantSoleEventType */
/** @typedef {import("./sensorData/SensorDataManager.js").BrilliantSoleSensorType} BrilliantSoleSensorType */
/** @typedef {import("./sensorData/SensorDataManager.js").BrilliantSoleVibrationMotor} BrilliantSoleVibrationMotor */
/** @typedef {import("./sensorData/SensorDataManager.js").BrilliantSoleSensorDataManagerEventType} BrilliantSoleSensorDataManagerEventType */

/**
 * @typedef BrilliantSoleEvent
 * @type {object}
 * @property {BrilliantSoleEventType} type
 * @property {object} message
 */

/**
 * @typedef PnpId
 * @type {object}
 * @property {"Bluetooth"|"USB"} source
 * @property {number} vendorId
 * @property {number} productId
 * @property {number} productVersion */

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

class BrilliantSole {
    constructor() {
        this.connectionManager = new WebBluetoothConnectionManager();
    }

    // EVENT DISPATCHER

    /** @type {BrilliantSoleEventType[]} */
    static #EventTypes = [
        "connecting",
        "connected",
        "disconnecting",
        "not connected",

        "deviceInformation",

        "batteryLevel",
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
        return this.#connectionManager?.connectionStatus;
    }

    /** @param {BrilliantSoleConnectionStatus} connectionStatus */
    #onConnectionStatusUpdated(connectionStatus) {
        _console.log({ connectionStatus });
        this.#dispatchEvent({ type: "connectionStatus", message: { connectionStatus } });
        this.#dispatchEvent({ type: this.connectionStatus });
    }

    /**
     * @param {BrilliantSoleConnectionMessageType} messageType
     * @param {DataView} data
     */
    #onConnectionMessageReceived(messageType, data) {
        _console.log({ messageType, data });
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
                    source: value.getUint8(0) === 1 ? "Bluetooth" : "USB",
                    productId: value.getUint8(3) | (value.getUint8(4) << 8),
                    productVersion: value.getUint8(5) | (value.getUint8(6) << 8),
                };
                if (pnpId.source == "Bluetooth") {
                    pnpId.vendorId = value.getUint8(1) | (value.getUint8(2) << 8);
                } else {
                    // no need to implement
                }
                _console.log({ pnpId });
                this.#updateDeviceInformation({ pnpId });
                break;

            case "batteryLevel":
                const batteryLevel = data.getUint8(0);
                _console.log({ batteryLevel });
                this.#setBatteryLevel(batteryLevel);
                break;

            default:
                _console.error(`uncaught messageType ${messageType}`);
                break;
        }
    }

    // DEVICE INFORMATION

    /** @type {TextDecoder} */
    static #TextDecoder = new TextDecoder();
    get #textDecoder() {
        return BrilliantSole.#TextDecoder;
    }

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
            this.#dispatchEvent({ type: "deviceInformation", message: { deviceInformation: this.#deviceInformation } });
        }
    }

    // BATTERY LEVEL

    /** @type {number?} */
    #batteryLevel = null;
    get batteryLevel() {
        return this.#batteryLevel;
    }
    /** @param {number} batteryLevel */
    #setBatteryLevel(batteryLevel) {
        _console.assertTypeWithError(batteryLevel, "number");
        if (this.#batteryLevel == batteryLevel) {
            _console.warn(`duplicate batteryLevel assignment ${batteryLevel}`);
            return;
        }
        _console.log({ batteryLevel });
        this.#batteryLevel = batteryLevel;
        this.#dispatchEvent({ type: "batteryLevel", message: { batteryLevel } });
    }

    // SENSOR CONFIGURATION
    /**
     * @param {BrilliantSoleSensorType} sensorType
     * @param {number} sensorDataRate (ms, must be a multiple of 5)
     */
    async setSensorDataRate(sensorType, sensorDataRate) {
        this.#assertIsConnected();
        _console.log(`setting ${sensorType} sensorDataRate to ${sensorDataRate}...`);
        const message = this.#sensorDataManager.createSetSensorDataRateMessage(sensorType, sensorDataRate);
        await this.connectionManager?.sendCommand(message);
        _console.log("set sensorDataRate");
    }

    // SENSOR DATA
    /** @type {SensorDataManager?} */
    #sensorDataManager;
    get sensorDataManager() {
        return this.#sensorDataManager;
    }
    set sensorDataManager(newSensorDataManager) {
        if (this.sensorDataManager == newSensorDataManager) {
            _console.warn("same sensorDataManager is already assigned");
            return;
        }

        if (this.sensorDataManager) {
            this.sensorDataManager.onDataReceived = null;
        }
        if (newSensorDataManager) {
            newSensorDataManager.onDataReceived = this.#onSensorDataReceived.bind(this);
        }

        this.#sensorDataManager = newSensorDataManager;
        _console.log("assigned new sensorDataManager", this.#sensorDataManager);
    }

    #onSensorDataReceived() {
        // FILL
    }

    // HAPTICS

    /**
     *
     * @param {BrilliantSoleVibrationMotor} vibrationMotor
     * @param {number} vibrationStrength
     */
    async setVibrationStrength(vibrationMotor, vibrationStrength) {
        this.#assertIsConnected();
        const message = this.#sensorDataManager.createSetVibrationStrengthMessage(...arguments);
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
        const message = this.#sensorDataManager.createTriggerVibrationMessage(vibrationMotor, duration);
        _console.log(`triggering "${vibrationMotor}" vibration for ${duration}ms...`, message);
        await this.connectionManager?.sendCommand(message);
        _console.log("triggered vibration");
    }
    /** @param {BrilliantSoleVibrationMotor} vibrationMotor */
    async stopVibration(vibrationMotor) {
        this.#assertIsConnected();
        const message = this.#sensorDataManager.createStopVibrationMessage(vibrationMotor);
        _console.log(`stopping "${vibrationMotor}" vibration...`, message);
        await this.connectionManager?.sendCommand(message);
        _console.log("stopped vibration");
    }
}

BrilliantSole.setConsoleLevelFlagsForType = setConsoleLevelFlagsForType;
BrilliantSole.setAllConsoleLevelFlags = setAllConsoleLevelFlags;

export default BrilliantSole;
