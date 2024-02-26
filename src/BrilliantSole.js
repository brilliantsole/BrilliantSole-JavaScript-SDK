import { createConsole, setAllConsoleLevelFlags, setConsoleLevelFlagsForType } from "./utils/Console.js";
import EventDispatcher, {
    bindEventListeners,
    addEventListeners,
    removeEventListeners,
} from "./utils/EventDispatcher.js";
import ConnectionManager from "./connection/ConnectionManager.js";
import WebBluetoothConnectionManager from "./connection/bluetooth/WebBluetoothConnectionManager.js";
import SensorConfigurationManager from "./sensor/SensorConfigurationManager.js";
import SensorDataManager from "./sensor/SensorDataManager.js";

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

        if (connectionStatus == "not connected") {
            // clear name/type/config?
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
                } else {
                    // no need to implement
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
                // FILL
                break;

            default:
                _console.error(`uncaught messageType ${messageType}`);
                break;
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

    #onSensorDataReceived() {
        // FILL
    }

    // HAPTICS (FILL)
}
BrilliantSole.setConsoleLevelFlagsForType = setConsoleLevelFlagsForType;
BrilliantSole.setAllConsoleLevelFlags = setAllConsoleLevelFlags;

export default BrilliantSole;
