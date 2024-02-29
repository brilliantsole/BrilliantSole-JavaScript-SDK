import { createConsole, setAllConsoleLevelFlags, setConsoleLevelFlagsForType } from "./utils/Console.js";
import EventDispatcher from "./utils/EventDispatcher.js";
import ConnectionManager from "./connection/ConnectionManager.js";
import WebBluetoothConnectionManager from "./connection/bluetooth/WebBluetoothConnectionManager.js";
import SensorConfigurationManager from "./sensor/SensorConfigurationManager.js";
import SensorDataManager from "./sensor/SensorDataManager.js";
import VibrationManager from "./vibration/VibrationManager.js";
import { concatenateArrayBuffers } from "./utils/ArrayBufferUtils.js";

/** @typedef {import("./connection/ConnectionManager.js").BrilliantSoleConnectionMessageType} BrilliantSoleConnectionMessageType */
/** @typedef {import("./sensor/SensorDataManager.js").BrilliantSoleSensorType} BrilliantSoleSensorType */
/** @typedef {"connectionStatus" | BrilliantSoleConnectionStatus | "isConnected" | BrilliantSoleConnectionMessageType | "deviceInformation" | BrilliantSoleSensorType} BrilliantSoleEventType */

/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherListener} EventDispatcherListener */
/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherOptions} EventDispatcherOptions */

/**
 * @typedef BrilliantSoleEvent
 * @type {object}
 * @property {BrilliantSoleEventType} type
 * @property {object} message
 */

/** @typedef {import("./connection/ConnectionManager.js").BrilliantSoleConnectionStatus} BrilliantSoleConnectionStatus */

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
 * @property {number} productVersion
 */

/** @typedef {"leftInsole" | "rightInsole"} BrilliantSoleDeviceType */

/** @typedef {import("./sensor/SensorConfigurationManager.js").BrilliantSoleSensorConfiguration} BrilliantSoleSensorConfiguration */

/** @typedef {import("./vibration/VibrationManager.js").BrilliantSoleVibrationLocation} BrilliantSoleVibrationLocation */
/** @typedef {import("./vibration/VibrationManager.js").BrilliantSoleVibrationType} BrilliantSoleVibrationType */

/** @typedef {import("./vibration/VibrationManager.js").BrilliantSoleVibrationWaveformEffectSegment} BrilliantSoleVibrationWaveformEffectSegment */
/**
 * @typedef BrilliantSoleVibrationWaveformEffectConfiguration
 * @type {Object}
 * @property {BrilliantSoleVibrationWaveformEffectSegment[]} segments
 * @property {number?} loopCount how many times the entire sequence should loop (int ranging [0, 6])
 */

/** @typedef {import("./vibration/VibrationManager.js").BrilliantSoleVibrationWaveformSegment} BrilliantSoleVibrationWaveformSegment */
/**
 * @typedef BrilliantSoleVibrationWaveformConfiguration
 * @type {Object}
 * @property {BrilliantSoleVibrationWaveformSegment[]} segments
 */

/**
 * @typedef BrilliantSoleVibrationConfiguration
 * @type {Object}
 * @property {BrilliantSoleVibrationLocation[]} locations
 * @property {BrilliantSoleVibrationType} type
 * @property {BrilliantSoleVibrationWaveformEffectConfiguration?} waveformEffect use if type is "waveformEffect"
 * @property {BrilliantSoleVibrationWaveformConfiguration?} waveform use if type is "waveform"
 */

const _console = createConsole("BrilliantSole", { log: true });

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
            //this.#clear();
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
                _console.log("received battery level", { batteryLevel });
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
        for (const deviceInformationName in partialDeviceInformation) {
            this.#dispatchEvent({
                type: deviceInformationName,
                message: { [deviceInformationName]: partialDeviceInformation[deviceInformationName] },
            });
        }

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
    /** @param {number} updatedBatteryLevel */
    #updateBatteryLevel(updatedBatteryLevel) {
        _console.assertTypeWithError(updatedBatteryLevel, "number");
        if (this.#batteryLevel == updatedBatteryLevel) {
            _console.warn(`duplicate batteryLevel assignment ${updatedBatteryLevel}`);
            return;
        }
        this.#batteryLevel = updatedBatteryLevel;
        _console.log({ updatedBatteryLevel: this.#batteryLevel });
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
        this.#name = updatedName;
        _console.log({ updatedName: this.#name });
        this.#dispatchEvent({ type: "getName", message: { name: this.#name } });
    }
    static get MinNameLength() {
        return 2;
    }
    get #minNameLength() {
        return BrilliantSole.MinNameLength;
    }
    static get MaxNameLength() {
        return 65;
    }
    get #maxNameLength() {
        return BrilliantSole.MaxNameLength;
    }
    /** @param {string} newName */
    async setName(newName) {
        this.#assertIsConnected();
        _console.assertTypeWithError(newName, "string");
        _console.assertWithError(
            newName.length >= this.#minNameLength,
            `name must be greater than ${this.#minNameLength} characters long ("${newName}" is ${
                newName.length
            } characters long)`
        );
        _console.assertWithError(
            newName.length < this.#maxNameLength,
            `name must be less than ${this.#maxNameLength} characters long ("${newName}" is ${
                newName.length
            } characters long)`
        );
        const setNameData = this.#textEncoder.encode(newName);
        _console.log({ setNameData });
        await this.#connectionManager.sendMessage("setName", setNameData);
    }

    // TYPE
    /** @type {BrilliantSoleDeviceType[]} */
    static #Types = ["leftInsole", "rightInsole"];
    static get Types() {
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
        if (updatedType == this.type) {
            _console.warn("redundant type assignment");
            return;
        }
        this.#type = updatedType;
        _console.log({ updatedType: this.#type });

        this.#sensorDataManager.deviceType = this.#type;
        this.#sensorConfigurationManager.deviceType = this.#type;

        this.#dispatchEvent({ type: "getType", message: { type: this.#type } });
    }
    /** @param {BrilliantSoleDeviceType} newType */
    async setType(newType) {
        this.#assertIsConnected();
        this.#assertValidDeviceType(newType);
        const newTypeEnum = this.#types.indexOf(newType);
        const setTypeData = Uint8Array.from([newTypeEnum]);
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

    static get MaxSensorRate() {
        return SensorConfigurationManager.MaxSensorRate;
    }
    static get SensorRateStep() {
        return SensorConfigurationManager.SensorRateStep;
    }

    /** @param {BrilliantSoleSensorConfiguration} updatedSensorConfiguration */
    #updateSensorConfiguration(updatedSensorConfiguration) {
        this.#sensorConfiguration = updatedSensorConfiguration;
        _console.log({ updatedSensorConfiguration: this.#sensorConfiguration });
        this.#dispatchEvent({
            type: "getSensorConfiguration",
            message: { sensorConfiguration: this.sensorConfiguration },
        });
    }
    /** @param {BrilliantSoleSensorConfiguration} newSensorConfiguration */
    async setSensorConfiguration(newSensorConfiguration) {
        this.#assertIsConnected();
        _console.log({ newSensorConfiguration });
        const setSensorConfigurationData = this.#sensorConfigurationManager.createData(newSensorConfiguration);
        _console.log({ setSensorConfigurationData });
        await this.#connectionManager.sendMessage("setSensorConfiguration", setSensorConfigurationData);
    }

    // SENSOR DATA

    static #SensorTypes = SensorDataManager.Types;
    static get SensorTypes() {
        return this.#SensorTypes;
    }

    /** @type {SensorDataManager} */
    #sensorDataManager = new SensorDataManager();

    /**
     * @param {BrilliantSoleSensorType} sensorType
     * @param {Object} sensorData
     * @param {number} sensorData.timestamp
     */
    #onSensorDataReceived(sensorType, sensorData) {
        _console.log({ sensorType, sensorData });
        this.#dispatchEvent({ type: sensorType, message: sensorData });
        this.#dispatchEvent({ type: "sensorData", message: sensorData });
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

    /** @param  {...BrilliantSoleVibrationConfiguration} vibrationConfigurations */
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
                        this.#vibrationManager.createWaveformEffectsData(locations, segments, loopCount);
                    }
                    break;
                case "waveform":
                    {
                        const { waveform } = vibrationConfiguration;
                        if (!waveform) {
                            throw Error("waveform not defined in vibrationConfiguration");
                        }
                        const { segments } = waveform;
                        this.#vibrationManager.createWaveformData(locations, segments);
                    }
                    break;
                default:
                    throw Error(`invalid vibration type "${type}"`);
            }

            triggerVibrationData = concatenateArrayBuffers(triggerVibrationData, dataView);
        });
        await this.#connectionManager.sendMessage("triggerVibration", triggerVibrationData);
    }
}
BrilliantSole.setConsoleLevelFlagsForType = setConsoleLevelFlagsForType;
BrilliantSole.setAllConsoleLevelFlags = setAllConsoleLevelFlags;

export default BrilliantSole;
