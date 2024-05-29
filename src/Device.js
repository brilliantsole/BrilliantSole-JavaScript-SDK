import { createConsole } from "./utils/Console.js";
import EventDispatcher, { addEventListeners } from "./utils/EventDispatcher.js";
import BaseConnectionManager from "./connection/BaseConnectionManager.js";
import { isInBrowser, isInNode } from "./utils/environment.js";
import WebBluetoothConnectionManager from "./connection/bluetooth/WebBluetoothConnectionManager.js";
import SensorConfigurationManager from "./sensor/SensorConfigurationManager.js";
import SensorDataManager from "./sensor/SensorDataManager.js";
import VibrationManager from "./vibration/VibrationManager.js";
import FileTransferManager from "./FileTransferManager.js";
import TfliteManager from "./TfliteManager.js";
import FirmwareManager from "./FirmwareManager.js";
import DeviceInformationManager from "./DeviceInformationManager.js";
import InformationManager from "./InformationManager.js";

const _console = createConsole("Device", { log: true });

/** @typedef {import("./connection/BaseConnectionManager.js").ConnectionMessageType} ConnectionMessageType */
/** @typedef {import("./sensor/SensorDataManager.js").SensorType} SensorType */

/** @typedef {import("./connection/BaseConnectionManager.js").TxMessage} TxMessage */
/** @typedef {import("./connection/BaseConnectionManager.js").TxRxMessageType} TxRxMessageType */

/** @typedef {import("./FileTransferManager.js").FileTransferManagerEventType} FileTransferManagerEventType */
/** @typedef {import("./TfliteManager.js").TfliteManagerEventType} TfliteManagerEventType */
/** @typedef {import("./FirmwareManager.js").FirmwareManagerEventType} FirmwareManagerEventType */
/** @typedef {import("./DeviceInformationManager.js").DeviceInformationManagerEventType} DeviceInformationManagerEventType */

/** @typedef {import("./connection/BaseConnectionManager.js").ConnectionStatus} ConnectionStatus */

/** @typedef {import("./sensor/SensorConfigurationManager.js").SensorConfiguration} SensorConfiguration */

/** @typedef {"connectionStatus" | ConnectionStatus | "isConnected" | ConnectionMessageType | DeviceInformationManagerEventType | SensorType | "connectionMessage" | FileTransferManagerEventType | TfliteManagerEventType | FirmwareManagerEventType} DeviceEventType */

/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherListener} EventDispatcherListener */
/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherOptions} EventDispatcherOptions */

/**
 * @typedef DeviceEvent
 * @type {Object}
 * @property {Device} target
 * @property {DeviceEventType} type
 * @property {Object} message
 */
/** @typedef {(event: DeviceEvent) => void} DeviceEventListener */

/** @typedef {"deviceConnected" | "deviceDisconnected" | "deviceIsConnected" | "availableDevices"} StaticDeviceEventType */
/**
 * @typedef StaticDeviceEvent
 * @type {Object}
 * @property {StaticDeviceEventType} type
 * @property {Object} message
 */
/** @typedef {(event: StaticDeviceEvent) => void} StaticDeviceEventListener */

class Device {
    get id() {
        return this.#connectionManager?.id;
    }

    constructor() {
        this.#deviceInformationManager.eventDispatcher = this.#eventDispatcher;

        this.#informationManager.sendMessage = this.#sendTxMessages.bind(this);
        this.#informationManager.eventDispatcher = this.#eventDispatcher;

        this.#sensorConfigurationManager.sendMessage = this.#sendTxMessages.bind(this);
        this.#sensorConfigurationManager.eventDispatcher = this.#eventDispatcher;

        this.#sensorDataManager.sendMessage = this.#sendTxMessages.bind(this);
        this.#sensorDataManager.eventDispatcher = this.#eventDispatcher;

        this.#vibrationManager.sendMessage = this.#sendTxMessages.bind(this);

        this.#tfliteManager.sendMessage = this.#sendTxMessages.bind(this);
        this.#tfliteManager.eventDispatcher = this.#eventDispatcher;

        this.#fileTransferManager.sendMessage = this.#sendTxMessages.bind(this);
        this.#fileTransferManager.eventDispatcher = this.#eventDispatcher;

        this.#firmwareManager.sendMessage = this.#sendSmpMessage.bind(this);
        this.#firmwareManager.eventDispatcher = this.#eventDispatcher;

        this.addEventListener("getMtu", () => {
            this.#firmwareManager.mtu = this.mtu;
            this.#fileTransferManager.mtu = this.mtu;
            this.connectionManager.mtu = this.mtu;
        });
        this.addEventListener("getType", () => {
            if (Device.#UseLocalStorage) {
                Device.#UpdateLocalStorageConfigurationForDevice(this);
            }
        });

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
        "batteryLevel",

        "connectionStatus",
        ...BaseConnectionManager.Statuses,
        "isConnected",

        "connectionMessage",

        ...DeviceInformationManager.EventTypes,
        ...InformationManager.EventTypes,
        ...SensorConfigurationManager.EventTypes,
        ...SensorDataManager.EventTypes,
        ...FileTransferManager.EventTypes,
        ...TfliteManager.EventTypes,
        ...FirmwareManager.EventTypes,
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
     * @param {DeviceEventListener} listener
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
     * @param {DeviceEventListener} listener
     */
    removeEventListener(type, listener) {
        return this.#eventDispatcher.removeEventListener(type, listener);
    }

    /** @param {DeviceEventType} type */
    waitForEvent(type) {
        return this.#eventDispatcher.waitForEvent(type);
    }

    // CONNECTION MANAGER

    /** @type {BaseConnectionManager?} */
    #connectionManager;
    get connectionManager() {
        return this.#connectionManager;
    }
    set connectionManager(newConnectionManager) {
        if (this.connectionManager == newConnectionManager) {
            _console.log("same connectionManager is already assigned");
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
    /**
     * @param {TxMessage[]} messages
     * @param {boolean} sendImmediately
     */
    async #sendTxMessages(messages, sendImmediately) {
        await this.#connectionManager?.sendTxMessages(...arguments);
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
    }
    /** @throws {Error} if not connected */
    #assertIsConnected() {
        _console.assertWithError(this.isConnected, "not connected");
    }

    /** @type {TxRxMessageType[]} */
    static #RequiredInformationConnectionMessages = [
        "getId",
        "getMtu",

        "getName",
        "getType",
        "getCurrentTime",
        "getSensorConfiguration",
        "getSensorScalars",
        "getPressurePositions",

        "maxFileLength",
        "getFileLength",
        "getFileChecksum",
        "getFileTransferType",
        "fileTransferStatus",

        "getTfliteName",
        "getTfliteTask",
        "getTfliteSampleRate",
        "getTfliteSensorTypes",
        "tfliteModelIsReady",
        "getTfliteCaptureDelay",
        "getTfliteThreshold",
        "getTfliteInferencingEnabled",
    ];
    get #requiredInformationConnectionMessages() {
        return Device.#RequiredInformationConnectionMessages;
    }
    get #hasRequiredInformation() {
        return this.#requiredInformationConnectionMessages.every((messageType) => {
            return this.latestConnectionMessage.has(messageType);
        });
    }
    #requestRequiredInformation() {
        /** @type {TxMessage[]} */
        const messages = this.#requiredInformationConnectionMessages.map((messageType) => ({
            type: messageType,
        }));
        this.#sendTxMessages(messages);
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
        _console.assertTypeWithError(newReconnectOnDisconnection, "boolean");
        this.#ReconnectOnDisconnection = newReconnectOnDisconnection;
    }

    #reconnectOnDisconnection = Device.ReconnectOnDisconnection;
    get reconnectOnDisconnection() {
        return this.#reconnectOnDisconnection;
    }
    set reconnectOnDisconnection(newReconnectOnDisconnection) {
        _console.assertTypeWithError(newReconnectOnDisconnection, "boolean");
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
        _console.log({ connectionStatus });

        if (connectionStatus == "not connected") {
            //this.#clear();

            if (this.canReconnect && this.reconnectOnDisconnection) {
                _console.log("starting reconnect interval...");
                this.#reconnectIntervalId = setInterval(() => {
                    _console.log("attempting reconnect...");
                    this.reconnect();
                }, 1000);
            }
        } else {
            if (this.#reconnectIntervalId != undefined) {
                _console.log("clearing reconnect interval");
                clearInterval(this.#reconnectIntervalId);
                this.#reconnectIntervalId = undefined;
            }
        }

        this.#checkConnection();

        if (connectionStatus == "connected" && !this.#isConnected) {
            this.#requestRequiredInformation();
        }
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
        this.#isConnected =
            this.connectionManager?.isConnected &&
            this.#hasRequiredInformation &&
            this.#informationManager.isCurrentTimeSet;

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
        this.#informationManager.clear();
    }

    /**
     * @param {ConnectionMessageType} messageType
     * @param {DataView} dataView
     */
    #onConnectionMessageReceived(messageType, dataView) {
        _console.log({ messageType, dataView });
        switch (messageType) {
            case "batteryLevel":
                const batteryLevel = dataView.getUint8(0);
                _console.log("received battery level", { batteryLevel });
                this.#updateBatteryLevel(batteryLevel);
                break;

            default:
                if (this.#fileTransferManager.messageTypes.includes(messageType)) {
                    this.#fileTransferManager.parseMessage(messageType, dataView);
                } else if (this.#tfliteManager.messageTypes.includes(messageType)) {
                    this.#tfliteManager.parseMessage(messageType, dataView);
                } else if (this.#sensorDataManager.messageTypes.includes(messageType)) {
                    this.#sensorDataManager.parseMessage(messageType, dataView);
                } else if (this.#firmwareManager.messageTypes.includes(messageType)) {
                    this.#firmwareManager.parseMessage(messageType, dataView);
                } else if (this.#deviceInformationManager.messageTypes.includes(messageType)) {
                    this.#deviceInformationManager.parseMessage(messageType, dataView);
                } else if (this.#informationManager.messageTypes.includes(messageType)) {
                    this.#informationManager.parseMessage(messageType, dataView);
                } else if (this.#sensorConfigurationManager.messageTypes.includes(messageType)) {
                    this.#sensorConfigurationManager.parseMessage(messageType, dataView);
                } else {
                    throw Error(`uncaught messageType ${messageType}`);
                }
        }

        this.latestConnectionMessage.set(messageType, dataView);
        this.#dispatchEvent({ type: "connectionMessage", message: { messageType, dataView } });

        if (!this.isConnected && this.#hasRequiredInformation) {
            this.#checkConnection();
        }
    }

    /** @type {Map.<ConnectionMessageType, DataView>} */
    latestConnectionMessage = new Map();

    // DEVICE INFORMATION

    #deviceInformationManager = new DeviceInformationManager();

    get deviceInformation() {
        return this.#deviceInformationManager.information;
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
            _console.log(`duplicate batteryLevel assignment ${updatedBatteryLevel}`);
            return;
        }
        this.#batteryLevel = updatedBatteryLevel;
        _console.log({ updatedBatteryLevel: this.#batteryLevel });
        this.#dispatchEvent({ type: "batteryLevel", message: { batteryLevel: this.#batteryLevel } });
    }

    // INFORMATION
    #informationManager = new InformationManager();

    get hardwareId() {
        return this.#informationManager.id;
    }

    static get MinNameLength() {
        return InformationManager.MinNameLength;
    }
    static get MaxNameLength() {
        return InformationManager.MaxNameLength;
    }
    get name() {
        return this.#informationManager.name;
    }
    /** @param {string} newName */
    async setName(newName) {
        await this.#informationManager.setName(newName);
    }

    static get Types() {
        return InformationManager.Types;
    }
    get type() {
        return this.#informationManager.type;
    }
    /** @param {DeviceType} newType */
    async setType(newType) {
        await this.#informationManager.setType(newType);
    }

    static get InsoleSides() {
        return InformationManager.InsoleSides;
    }
    get isInsole() {
        return this.#informationManager.isInsole;
    }
    get insoleSide() {
        return this.#informationManager.insoleSide;
    }

    get mtu() {
        return this.#informationManager.mtu;
    }

    // SENSOR TYPES
    static get SensorTypes() {
        return SensorDataManager.Types;
    }
    /** @type {SensorType[]} */
    get sensorTypes() {
        return Object.keys(this.sensorConfiguration);
    }

    // SENSOR CONFIGURATION

    #sensorConfigurationManager = new SensorConfigurationManager();

    get sensorConfiguration() {
        return this.#sensorConfigurationManager.configuration;
    }

    static get MaxSensorRate() {
        return SensorConfigurationManager.MaxSensorRate;
    }
    static get SensorRateStep() {
        return SensorConfigurationManager.SensorRateStep;
    }

    /** @param {SensorConfiguration} newSensorConfiguration */
    async setSensorConfiguration(newSensorConfiguration) {
        await this.#sensorConfigurationManager.setConfiguration(newSensorConfiguration);
    }

    async clearSensorConfiguration() {
        return this.#sensorConfigurationManager.clearSensorConfiguration();
    }

    static #ClearSensorConfigurationOnLeave = true;
    static get ClearSensorConfigurationOnLeave() {
        return this.#ClearSensorConfigurationOnLeave;
    }
    static set ClearSensorConfigurationOnLeave(newClearSensorConfigurationOnLeave) {
        _console.assertTypeWithError(newClearSensorConfigurationOnLeave, "boolean");
        this.#ClearSensorConfigurationOnLeave = newClearSensorConfigurationOnLeave;
    }

    #clearSensorConfigurationOnLeave = Device.ClearSensorConfigurationOnLeave;
    get clearSensorConfigurationOnLeave() {
        return this.#clearSensorConfigurationOnLeave;
    }
    set clearSensorConfigurationOnLeave(newClearSensorConfigurationOnLeave) {
        _console.assertTypeWithError(newClearSensorConfigurationOnLeave, "boolean");
        this.#clearSensorConfigurationOnLeave = newClearSensorConfigurationOnLeave;
    }

    // PRESSURE

    static #DefaultNumberOfPressureSensors = 8;
    static get DefaultNumberOfPressureSensors() {
        return this.#DefaultNumberOfPressureSensors;
    }
    get numberOfPressureSensors() {
        return this.#sensorDataManager.pressureSensorDataManager.numberOfSensors;
    }

    // SENSOR DATA

    /** @type {SensorDataManager} */
    #sensorDataManager = new SensorDataManager();

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

    /** @typedef {import("./vibration/VibrationManager.js").VibrationConfiguration} VibrationConfiguration */
    /**
     * @param  {VibrationConfiguration[]} vibrationConfigurations
     * @param  {boolean} sendImmediately
     */
    async triggerVibration(vibrationConfigurations, sendImmediately) {
        this.#vibrationManager.triggerVibration(vibrationConfigurations, sendImmediately);
    }

    // FILE TRANSFER

    #fileTransferManager = new FileTransferManager();
    static get FileTypes() {
        return FileTransferManager.Types;
    }

    get maxFileLength() {
        return this.#fileTransferManager.maxLength;
    }

    /** @typedef {import("./utils/ArrayBufferUtils.js").FileLike} FileLike */

    /**
     * @param {FileType} fileType
     * @param {FileLike} file
     */
    async sendFile(fileType, file) {
        const promise = this.waitForEvent("fileTransferComplete");
        this.#fileTransferManager.send(fileType, file);
        await promise;
    }

    /** @param {FileType} fileType */
    async receiveFile(fileType) {
        const promise = this.waitForEvent("fileTransferComplete");
        this.#fileTransferManager.receive(fileType);
        await promise;
    }

    get fileTransferStatus() {
        return this.#fileTransferManager.status;
    }

    cancelFileTransfer() {
        this.#fileTransferManager.cancel();
    }

    // TFLITE

    static get TfliteSensorTypes() {
        return TfliteManager.SensorTypes;
    }

    #tfliteManager = new TfliteManager();

    get tfliteName() {
        return this.#tfliteManager.name;
    }
    /** @param {string} newName */
    setTfliteName(newName) {
        return this.#tfliteManager.setName(newName);
    }

    // TFLITE MODEL CONFIG

    static get TfliteTasks() {
        return TfliteManager.Tasks;
    }

    get tfliteTask() {
        return this.#tfliteManager.task;
    }
    /** @param {import("./TfliteManager.js").TfliteTask} newTask */
    setTfliteTask(newTask) {
        return this.#tfliteManager.setTask(newTask);
    }

    get tfliteSampleRate() {
        return this.#tfliteManager.sampleRate;
    }
    /** @param {number} newSampleRate */
    setTfliteSampleRate(newSampleRate) {
        return this.#tfliteManager.setSampleRate(newSampleRate);
    }

    get tfliteSensorTypes() {
        return this.#tfliteManager.sensorTypes;
    }
    get allowedTfliteSensorTypes() {
        return this.sensorTypes.filter((sensorType) => TfliteManager.SensorTypes.includes(sensorType));
    }
    /** @param {SensorType[]} newSensorTypes */
    setTfliteSensorTypes(newSensorTypes) {
        return this.#tfliteManager.setSensorTypes(newSensorTypes);
    }

    get tfliteIsReady() {
        return this.#tfliteManager.isReady;
    }

    // TFLITE INFERENCING

    get tfliteInferencingEnabled() {
        return this.#tfliteManager.inferencingEnabled;
    }
    /** @param {boolean} inferencingEnabled */
    async setTfliteInferencingEnabled(inferencingEnabled) {
        return this.#tfliteManager.setInferencingEnabled(inferencingEnabled);
    }
    async enableTfliteInferencing() {
        return this.setTfliteInferencingEnabled(true);
    }
    async disableTfliteInferencing() {
        return this.setTfliteInferencingEnabled(false);
    }
    async toggleTfliteInferencing() {
        return this.#tfliteManager.toggleInferencingEnabled();
    }

    // TFLITE INFERENCE CONFIG

    get tfliteCaptureDelay() {
        return this.#tfliteManager.captureDelay;
    }
    /** @param {number} newCaptureDelay */
    async setTfliteCaptureDelay(newCaptureDelay) {
        return this.#tfliteManager.setCaptureDelay(newCaptureDelay);
    }
    get tfliteThreshold() {
        return this.#tfliteManager.threshold;
    }
    /** @param {number} newThreshold */
    async setTfliteThreshold(newThreshold) {
        return this.#tfliteManager.setThreshold(newThreshold);
    }

    // FIRMWARE MANAGER

    #firmwareManager = new FirmwareManager();

    /** @param {ArrayBuffer} data */
    #sendSmpMessage(data) {
        this.#connectionManager.sendSmpMessage(data);
    }

    /** @param {FileLike} file */
    async uploadFirmware(file) {
        return this.#firmwareManager.uploadFirmware(file);
    }

    async reset() {
        await this.#firmwareManager.reset();
        return this.#connectionManager.disconnect();
    }

    get firmwareStatus() {
        return this.#firmwareManager.status;
    }

    async getFirmwareImages() {
        return this.#firmwareManager.getImages();
    }
    get firmwareImages() {
        return this.#firmwareManager.images;
    }

    async eraseFirmwareImage() {
        return this.#firmwareManager.eraseImage();
    }
    /** @param {number} imageIndex */
    async confirmFirmwareImage(imageIndex) {
        return this.#firmwareManager.confirmImage(imageIndex);
    }
    /** @param {number} imageIndex */
    async testFirmwareImage(imageIndex) {
        return this.#firmwareManager.testImage(imageIndex);
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
        _console.assertTypeWithError(newUseLocalStorage, "boolean");
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
        _console.assertWithError(isInBrowser, "localStorage is only available in the browser");
        _console.assertWithError(window.localStorage, "localStorage not found");
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
            _console.log("no info found in localStorage");
            this.#LocalStorageConfiguration = Object.assign({}, this.#DefaultLocalStorageConfiguration);
            this.#SaveToLocalStorage();
            return;
        }
        try {
            const configuration = JSON.parse(localStorageString);
            _console.log({ configuration });
            this.#LocalStorageConfiguration = configuration;
            if (this.CanGetDevices) {
                await this.GetDevices(); // redundant?
            }
        } catch (error) {
            _console.error(error);
        }
    }

    /** @param {Device} device */
    static #UpdateLocalStorageConfigurationForDevice(device) {
        if (device.connectionType != "webBluetooth") {
            _console.log("localStorage is only for webBluetooth devices");
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
            _console.warn("GetDevices is only available in the browser");
            return;
        }

        if (!navigator.bluetooth) {
            _console.warn("bluetooth is not available in this browser");
            return;
        }

        if (!navigator.bluetooth.getDevices) {
            _console.warn("bluetooth.getDevices() is not available in this browser");
            return;
        }

        if (!this.#LocalStorageConfiguration) {
            this.#LoadFromLocalStorage();
        }

        const configuration = this.#LocalStorageConfiguration;
        if (!configuration.devices || configuration.devices.length == 0) {
            _console.log("no devices found in configuration");
            return;
        }

        const bluetoothDevices = await navigator.bluetooth.getDevices();

        _console.log({ bluetoothDevices });

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
                device.#informationManager.updateName(bluetoothDevice.name);
            }
            device.#informationManager.updateType(deviceInformation.type);
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
     * @param {StaticDeviceEventListener} listener
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
     * @param {StaticDeviceEventListener} listener
     */
    static RemoveEventListener(type, listener) {
        return this.#EventDispatcher.removeEventListener(type, listener);
    }

    /** @param {Device} device */
    static #OnDeviceIsConnected(device) {
        if (device.isConnected) {
            if (!this.#ConnectedDevices.includes(device)) {
                _console.log("adding device", device);
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
                _console.log("device already included");
            }
        } else {
            if (this.#ConnectedDevices.includes(device)) {
                _console.log("removing device", device);
                this.#ConnectedDevices.splice(this.#ConnectedDevices.indexOf(device), 1);
                this.#DispatchEvent({ type: "deviceDisconnected", message: { device } });
                this.#DispatchEvent({ type: "deviceIsConnected", message: { device } });
            } else {
                _console.log("device already not included");
            }
        }
        if (this.CanGetDevices) {
            this.GetDevices();
        }
        if (device.isConnected && !this.AvailableDevices.includes(device)) {
            const existingAvailableDevice = this.AvailableDevices.find((_device) => _device.id == device.id);
            _console.log({ existingAvailableDevice });
            if (existingAvailableDevice) {
                this.AvailableDevices[this.AvailableDevices.indexOf(existingAvailableDevice)] = device;
            } else {
                this.AvailableDevices.push(device);
            }
            this.#DispatchAvailableDevices();
        }
    }

    static #DispatchAvailableDevices() {
        _console.log({ AvailableDevices: this.AvailableDevices });
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

/** @typedef {Device} Device */

export default Device;
