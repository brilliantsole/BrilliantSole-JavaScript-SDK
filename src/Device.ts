import { createConsole } from "./utils/Console";
import EventDispatcher from "./utils/EventDispatcher";
import BaseConnectionManager, {
  TxMessage,
  TxRxMessageType,
  ConnectionStatuses,
  ConnectionStatus,
  ConnectionMessageTypes,
  ConnectionMessageType,
} from "./connection/BaseConnectionManager";
import { isInBluefy, isInBrowser, isInNode } from "./utils/environment";
import WebBluetoothConnectionManager from "./connection/bluetooth/WebBluetoothConnectionManager";
import SensorConfigurationManager, {
  SendSensorConfigurationMessageCallback,
  SensorConfiguration,
  SensorConfigurationEventDispatcher,
} from "./sensor/SensorConfigurationManager";
import SensorDataManager, { SensorEventTypes, SensorType } from "./sensor/SensorDataManager";
import VibrationManager, { SendVibrationMessageCallback, VibrationConfiguration } from "./vibration/VibrationManager";
import FileTransferManager, {
  FileTransferEventType,
  FileTransferEventTypes,
  FileTransferEventMessages,
  FileTransferEventDispatcher,
  SendFileTransferMessageCallback,
} from "./FileTransferManager";
import TfliteManager, {
  TfliteEventType,
  TfliteEventTypes,
  TfliteEventMessages,
  TfliteEventDispatcher,
  SendTfliteMessageCallback,
} from "./TfliteManager";
import FirmwareManager, {
  FirmwareEventDispatcher,
  FirmwareEventMessages,
  FirmwareEventType,
  FirmwareEventTypes,
} from "./FirmwareManager";
import DeviceInformationManager, {
  DeviceInformationEventDispatcher,
  DeviceInformationEventType,
  DeviceInformationEventTypes,
  DeviceInformationMessages,
} from "./DeviceInformationManager";
import InformationManager, {
  InformationEventDispatcher,
  InformationEventType,
  InformationEventTypes,
  InformationMessages,
  SendInformationMessageCallback,
} from "./InformationManager";
import { FileLike } from "./utils/ArrayBufferUtils";

const _console = createConsole("Device", { log: true });

export const ConnectionEventTypes = [...ConnectionStatuses, "connectionStatus", "isConnected"] as const;
export type ConnectionEventType = (typeof ConnectionEventTypes)[number];

// TODO - redundant (Message and EventType)
export const DeviceEventTypes = [
  ...ConnectionEventTypes,
  ...ConnectionMessageTypes,
  "connectionMessage",
  ...InformationEventTypes,
  ...DeviceInformationEventTypes,
  ...SensorEventTypes,
  ...FileTransferEventTypes,
  ...TfliteEventTypes,
  ...FirmwareEventTypes,
] as const;
export type DeviceEventType = (typeof DeviceEventTypes)[number];

interface BatteryLevelMessage {
  batteryLevel: number;
}

interface ConnectionStatusMessage {
  connectionStatus: ConnectionStatus;
}
interface IsConnectedMessage {
  isConnected: boolean;
}
interface ConnectionMessages {
  connectionStatus: ConnectionStatusMessage;
  isConnected: IsConnectedMessage;
}

export type DeviceEventMessages = ConnectionMessages &
  BatteryLevelMessage &
  DeviceInformationMessages &
  InformationMessages &
  TfliteEventMessages &
  FileTransferEventMessages &
  FirmwareEventMessages;

export const StaticDeviceEventTypes = [
  "deviceConnected",
  "deviceDisconnected",
  "deviceIsConnected",
  "availableDevices",
  "connectedDevices",
] as const;
export type StaticDeviceEventType = (typeof StaticDeviceEventTypes)[number];

interface StaticDeviceConnectedEventMessage {
  device: Device;
}
interface StaticDeviceDisconnectedEventMessage {
  device: Device;
}
interface StaticDeviceIsConnectedEventMessage {
  device: Device;
}
interface StaticAvailableDevicesEventMessage {
  availableDevices: Device[];
}
interface StaticConnectedDevicesEventMessage {
  connectedDevices: Device[];
}

export interface StaticDeviceEventMessages {
  deviceConnected: StaticDeviceConnectedEventMessage;
  deviceDisconnected: StaticDeviceDisconnectedEventMessage;
  deviceIsConnected: StaticDeviceIsConnectedEventMessage;
  availableDevices: StaticAvailableDevicesEventMessage;
  connectedDevices: StaticConnectedDevicesEventMessage;
}

export type SendMessageCallback<MessageType extends string> = (
  messages?: { type: MessageType; data?: ArrayBuffer }[],
  sendImmediately?: boolean
) => Promise<void>;

export type SendSmpMessageCallback = (data: ArrayBuffer) => Promise<void>;

class Device {
  get bluetoothId() {
    return this.#connectionManager?.bluetoothId;
  }

  constructor() {
    this.#deviceInformationManager.eventDispatcher = this.#eventDispatcher as DeviceInformationEventDispatcher;

    this.#informationManager.sendMessage = this.#sendTxMessages.bind(this) as SendInformationMessageCallback;
    this.#informationManager.eventDispatcher = this.#eventDispatcher as InformationEventDispatcher;

    this.#sensorConfigurationManager.sendMessage = this.#sendTxMessages.bind(
      this
    ) as SendSensorConfigurationMessageCallback;
    this.#sensorConfigurationManager.eventDispatcher = this.#eventDispatcher as SensorConfigurationEventDispatcher;

    this.#vibrationManager.sendMessage = this.#sendTxMessages.bind(this) as SendVibrationMessageCallback;

    this.#tfliteManager.sendMessage = this.#sendTxMessages.bind(this) as SendTfliteMessageCallback;
    this.#tfliteManager.eventDispatcher = this.#eventDispatcher as TfliteEventDispatcher;

    this.#fileTransferManager.sendMessage = this.#sendTxMessages.bind(this) as SendFileTransferMessageCallback;
    this.#fileTransferManager.eventDispatcher = this.#eventDispatcher as FileTransferEventDispatcher;

    this.#firmwareManager.sendMessage = this.#sendSmpMessage.bind(this) as SendSmpMessageCallback;
    this.#firmwareManager.eventDispatcher = this.#eventDispatcher as FirmwareEventDispatcher;

    this.addEventListener("getMtu", () => {
      this.#firmwareManager.mtu = this.mtu;
      this.#fileTransferManager.mtu = this.mtu;
      this.connectionManager!.mtu = this.mtu;
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
      /** can add more node leave handlers https://gist.github.com/hyrious/30a878f6e6a057f09db87638567cb11a */
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

  static get #DefaultConnectionManager(): typeof BaseConnectionManager {
    return WebBluetoothConnectionManager;
  }

  #eventDispatcher: EventDispatcher<Device, DeviceEventType, DeviceEventMessages> = new EventDispatcher(
    this,
    DeviceEventTypes
  );
  get addEventListener() {
    return this.#eventDispatcher.addEventListener;
  }
  get #dispatchEvent() {
    return this.#eventDispatcher.dispatchEvent;
  }
  get removeEventListener() {
    return this.#eventDispatcher.removeEventListener;
  }
  get waitForEvent() {
    return this.#eventDispatcher.waitForEvent;
  }

  // CONNECTION MANAGER

  #connectionManager?: BaseConnectionManager;
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
  async #sendTxMessages(messages: TxMessage[], sendImmediately?: boolean) {
    await this.#connectionManager?.sendTxMessages(messages, sendImmediately);
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

  static #RequiredInformationConnectionMessages: TxRxMessageType[] = [
    "isCharging",
    "getBatteryCurrent",
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
    "tfliteIsReady",
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
    const messages: TxMessage[] = this.#requiredInformationConnectionMessages.map((messageType) => ({
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
  #reconnectIntervalId: number | null;

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

  get connectionStatus(): ConnectionStatus {
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
  get isConnectionBusy() {
    return this.connectionStatus == "connecting" || this.connectionStatus == "disconnecting";
  }

  #onConnectionStatusUpdated(connectionStatus: ConnectionStatus) {
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

    if (connectionStatus == "not connected" && !this.canReconnect && Device.#AvailableDevices.includes(this)) {
      const deviceIndex = Device.#AvailableDevices.indexOf(this);
      Device.AvailableDevices.splice(deviceIndex, 1);
      Device.#DispatchAvailableDevices();
    }
  }

  #dispatchConnectionEvents(includeIsConnected: boolean = false) {
    this.#dispatchEvent("connectionStatus", { connectionStatus: this.connectionStatus });
    this.#dispatchEvent(this.connectionStatus, {});
    if (includeIsConnected) {
      this.#dispatchEvent("isConnected", { isConnected: this.isConnected });
    }
  }
  #checkConnection() {
    this.#isConnected =
      this.connectionManager?.isConnected && this.#hasRequiredInformation && this.#informationManager.isCurrentTimeSet;

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
    this.#deviceInformationManager.clear();
  }

  #onConnectionMessageReceived(messageType: ConnectionMessageType, dataView: DataView) {
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
    this.#dispatchEvent("connectionMessage", { messageType, dataView });

    if (!this.isConnected && this.#hasRequiredInformation) {
      this.#checkConnection();
    }
  }

  latestConnectionMessage: Map<ConnectionMessageType, DataView> = new Map();

  // DEVICE INFORMATION
  #deviceInformationManager = new DeviceInformationManager();
  get deviceInformation() {
    return this.#deviceInformationManager.information;
  }

  // BATTERY LEVEL
  #batteryLevel = 0;
  get batteryLevel() {
    return this.#batteryLevel;
  }
  #updateBatteryLevel(updatedBatteryLevel: number) {
    _console.assertTypeWithError(updatedBatteryLevel, "number");
    if (this.#batteryLevel == updatedBatteryLevel) {
      _console.log(`duplicate batteryLevel assignment ${updatedBatteryLevel}`);
      return;
    }
    this.#batteryLevel = updatedBatteryLevel;
    _console.log({ updatedBatteryLevel: this.#batteryLevel });
    this.#dispatchEvent("batteryLevel", { batteryLevel: this.#batteryLevel });
  }

  // INFORMATION
  #informationManager = new InformationManager();

  get id() {
    return this.#informationManager.id;
  }

  get isCharging() {
    return this.#informationManager.isCharging;
  }
  get batteryCurrent() {
    return this.#informationManager.batteryCurrent;
  }
  async getBatteryCurrent() {
    await this.#informationManager.getBatteryCurrent();
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
  async setName(newName: string) {
    await this.#informationManager.setName(newName);
  }

  static get Types() {
    return InformationManager.Types;
  }
  get type() {
    return this.#informationManager.type;
  }
  /** @param {DeviceType} newType */
  async setType(newType: DeviceType) {
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
  static get ContinuousSensorTypes() {
    return SensorDataManager.ContinuousTypes;
  }
  /** @type {SensorType[]} */
  get sensorTypes() {
    return Object.keys(this.sensorConfiguration);
  }
  get continuousSensorTypes() {
    return this.sensorTypes.filter((sensorType) => Device.ContinuousSensorTypes.includes(sensorType));
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

  /**
   * @param {SensorConfiguration} newSensorConfiguration
   * @param {boolean} [clearRest]
   */
  async setSensorConfiguration(newSensorConfiguration: SensorConfiguration, clearRest: boolean) {
    await this.#sensorConfigurationManager.setConfiguration(newSensorConfiguration, clearRest);
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

  #sensorDataManager: SensorDataManager = new SensorDataManager();

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

  /**
   * @param  {VibrationConfiguration[]} vibrationConfigurations
   * @param  {boolean} [sendImmediately]
   */
  async triggerVibration(vibrationConfigurations: VibrationConfiguration[], sendImmediately: boolean) {
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

  /**
   * @param {FileType} fileType
   * @param {FileLike} file
   */
  async sendFile(fileType: FileType, file: FileLike) {
    const promise = this.waitForEvent("fileTransferComplete");
    this.#fileTransferManager.send(fileType, file);
    await promise;
  }

  /** @param {FileType} fileType */
  async receiveFile(fileType: FileType) {
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
  setTfliteName(newName: string) {
    return this.#tfliteManager.setName(newName);
  }

  // TFLITE MODEL CONFIG

  static get TfliteTasks() {
    return TfliteManager.Tasks;
  }

  get tfliteTask() {
    return this.#tfliteManager.task;
  }
  /** @param {import("./TfliteManager").TfliteTask} newTask */
  setTfliteTask(newTask: import("./TfliteManager").TfliteTask) {
    return this.#tfliteManager.setTask(newTask);
  }

  get tfliteSampleRate() {
    return this.#tfliteManager.sampleRate;
  }
  /** @param {number} newSampleRate */
  setTfliteSampleRate(newSampleRate: number) {
    return this.#tfliteManager.setSampleRate(newSampleRate);
  }

  get tfliteSensorTypes() {
    return this.#tfliteManager.sensorTypes;
  }
  get allowedTfliteSensorTypes() {
    return this.sensorTypes.filter((sensorType) => TfliteManager.SensorTypes.includes(sensorType));
  }
  /** @param {SensorType[]} newSensorTypes */
  setTfliteSensorTypes(newSensorTypes: SensorType[]) {
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
  async setTfliteInferencingEnabled(inferencingEnabled: boolean) {
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
  async setTfliteCaptureDelay(newCaptureDelay: number) {
    return this.#tfliteManager.setCaptureDelay(newCaptureDelay);
  }
  get tfliteThreshold() {
    return this.#tfliteManager.threshold;
  }
  /** @param {number} newThreshold */
  async setTfliteThreshold(newThreshold: number) {
    return this.#tfliteManager.setThreshold(newThreshold);
  }

  // FIRMWARE MANAGER

  #firmwareManager = new FirmwareManager();

  /** @param {ArrayBuffer} data */
  #sendSmpMessage(data: ArrayBuffer) {
    this.#connectionManager.sendSmpMessage(data);
  }

  /** @param {FileLike} file */
  async uploadFirmware(file: FileLike) {
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
  async confirmFirmwareImage(imageIndex: number) {
    return this.#firmwareManager.confirmImage(imageIndex);
  }
  /** @param {number} imageIndex */
  async testFirmwareImage(imageIndex: number) {
    return this.#firmwareManager.testImage(imageIndex);
  }

  // CONNECTED DEVICES

  /** @type {Device[]} */
  static #ConnectedDevices: Device[] = [];
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
   * @typedef {Object} LocalStorageDeviceInformation
   * @property {string} bluetoothId
   * @property {DeviceType} type
   */

  /**
   * @typedef {Object} LocalStorageConfiguration
   * @property {LocalStorageDeviceInformation[]} devices
   */

  /** @type {LocalStorageConfiguration} */
  static #DefaultLocalStorageConfiguration: LocalStorageConfiguration = {
    devices: [],
  };
  /** @type {LocalStorageConfiguration?} */
  static #LocalStorageConfiguration: LocalStorageConfiguration | null;

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
  static #UpdateLocalStorageConfigurationForDevice(device: Device) {
    if (device.connectionType != "webBluetooth") {
      _console.log("localStorage is only for webBluetooth devices");
      return;
    }
    this.#AssertLocalStorage();
    const deviceInformationIndex = this.#LocalStorageConfiguration.devices.findIndex((deviceInformation) => {
      return deviceInformation.bluetoothId == device.bluetoothId;
    });
    if (deviceInformationIndex == -1) {
      return;
    }
    this.#LocalStorageConfiguration.devices[deviceInformationIndex].type = device.type;
    this.#SaveToLocalStorage();
  }

  // AVAILABLE DEVICES
  /** @type {Device[]} */
  static #AvailableDevices: Device[] = [];
  static get AvailableDevices() {
    return this.#AvailableDevices;
  }

  static get CanGetDevices() {
    return isInBrowser && navigator.bluetooth?.getDevices && !isInBluefy;
  }
  /**
   * retrieves devices already connected via web bluetooth in other tabs/windows
   *
   * _only available on web-bluetooth enabled browsers_
   *
   * @returns {Promise<Device[]?>}
   */
  static async GetDevices(): Promise<Device[] | null> {
    if (!isInBrowser) {
      _console.warn("GetDevices is only available in the browser");
      return;
    }

    if (!navigator.bluetooth) {
      _console.warn("bluetooth is not available in this browser");
      return;
    }

    if (isInBluefy) {
      _console.warn("bluefy lists too many devices...");
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
      ).find((device) => device.bluetoothId == bluetoothDevice.id);

      const existingAvailableDevice = this.AvailableDevices.filter(
        (device) => device.connectionType == "webBluetooth"
      ).find((device) => device.bluetoothId == bluetoothDevice.id);
      if (existingAvailableDevice) {
        if (
          existingConnectedDevice?.bluetoothId == existingAvailableDevice.bluetoothId &&
          existingConnectedDevice != existingAvailableDevice
        ) {
          this.AvailableDevices[this.#AvailableDevices.indexOf(existingAvailableDevice)] = existingConnectedDevice;
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

  static #EventDispatcher: EventDispatcher<typeof Device, StaticDeviceEventType, StaticDeviceEventMessages> =
    new EventDispatcher(this, StaticDeviceEventTypes);

  static get AddEventListener() {
    return this.#EventDispatcher.addEventListener;
  }
  static get #DispatchEvent() {
    return this.#EventDispatcher.dispatchEvent;
  }
  static get RemoveEventListener() {
    return this.#EventDispatcher.removeEventListener;
  }

  static #OnDeviceIsConnected(device: Device) {
    if (device.isConnected) {
      if (!this.#ConnectedDevices.includes(device)) {
        _console.log("adding device", device);
        this.#ConnectedDevices.push(device);
        if (this.UseLocalStorage && device.connectionType == "webBluetooth") {
          const deviceInformation = {
            type: device.type,
            bluetoothId: device.bluetoothId,
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
        this.#dispatchEvent("deviceConnected", { device });
        this.#dispatchEvent("deviceIsConnected", { device });
        this.#DispatchConnectedDevices();
      } else {
        _console.log("device already included");
      }
    } else {
      if (this.#ConnectedDevices.includes(device)) {
        _console.log("removing device", device);
        this.#ConnectedDevices.splice(this.#ConnectedDevices.indexOf(device), 1);
        this.#dispatchEvent("deviceDisconnected", { device });
        this.#dispatchEvent("deviceIsConnected", { device });
        this.#DispatchConnectedDevices();
      } else {
        _console.log("device already not included");
      }
    }
    if (this.CanGetDevices) {
      this.GetDevices();
    }
    if (device.isConnected && !this.AvailableDevices.includes(device)) {
      const existingAvailableDevice = this.AvailableDevices.find(
        (_device) => _device.bluetoothId == device.bluetoothId
      );
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
    this.#dispatchEvent("availableDevices", { availableDevices: this.AvailableDevices });
  }
  static #DispatchConnectedDevices() {
    _console.log({ ConnectedDevices: this.ConnectedDevices });
    this.#dispatchEvent("connectedDevices", { connectedDevices: this.ConnectedDevices });
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

export default Device;
