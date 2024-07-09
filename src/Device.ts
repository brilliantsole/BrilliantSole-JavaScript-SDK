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
  SensorConfigurationMessageType,
  SensorConfigurationMessageTypes,
} from "./sensor/SensorConfigurationManager";
import SensorDataManager, {
  SensorDataEventMessages,
  SensorDataEventTypes,
  SensorDataMessageType,
  SensorDataMessageTypes,
  SensorType,
  SensorTypes,
  ContinuousSensorTypes,
  ContinuousSensorType,
} from "./sensor/SensorDataManager";
import VibrationManager, {
  SendVibrationMessageCallback,
  VibrationConfiguration,
  VibrationLocations,
  VibrationTypes,
} from "./vibration/VibrationManager";
import FileTransferManager, {
  FileTransferEventTypes,
  FileTransferEventMessages,
  FileTransferEventDispatcher,
  SendFileTransferMessageCallback,
  FileTransferMessageTypes,
  FileTransferMessageType,
  FileTypes,
  FileType,
} from "./FileTransferManager";
import TfliteManager, {
  TfliteEventTypes,
  TfliteEventMessages,
  TfliteEventDispatcher,
  SendTfliteMessageCallback,
  TfliteMessageTypes,
  TfliteMessageType,
  TfliteTasks,
} from "./TfliteManager";
import FirmwareManager, {
  FirmwareEventDispatcher,
  FirmwareEventMessages,
  FirmwareEventTypes,
  FirmwareMessageType,
  FirmwareMessageTypes,
} from "./FirmwareManager";
import DeviceInformationManager, {
  DeviceInformationEventDispatcher,
  DeviceInformationEventTypes,
  DeviceInformationMessageType,
  DeviceInformationMessageTypes,
  DeviceInformationEventMessages,
} from "./DeviceInformationManager";
import InformationManager, {
  DeviceType,
  DeviceTypes,
  InformationEventDispatcher,
  InformationEventTypes,
  InformationMessageType,
  InformationMessageTypes,
  InformationEventMessages,
  InsoleSides,
  SendInformationMessageCallback,
} from "./InformationManager";
import { FileLike } from "./utils/ArrayBufferUtils";
import { VibrationWaveformEffects } from "./vibration/VibrationWaveformEffects";

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
  ...SensorDataEventTypes,
  ...FileTransferEventTypes,
  ...TfliteEventTypes,
  ...FirmwareEventTypes,
] as const;
export type DeviceEventType = (typeof DeviceEventTypes)[number];

interface ConnectionStatusEventMessage {
  connectionStatus: ConnectionStatus;
}
interface IsConnectedEventMessage {
  isConnected: boolean;
}
interface ConnectionEventMessages {
  connectionStatus: ConnectionStatusEventMessage;
  isConnected: IsConnectedEventMessage;
}

interface BatteryLevelEventMessage {
  batteryLevel: number;
}
interface BatteryLevelEventMessages {
  batteryLevel: BatteryLevelEventMessage;
}

export type DeviceEventMessages = ConnectionEventMessages &
  BatteryLevelEventMessages &
  DeviceInformationEventMessages &
  InformationEventMessages &
  SensorDataEventMessages &
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

export interface LocalStorageDeviceInformation {
  type: DeviceType;
  bluetoothId: string;
}

export interface LocalStorageConfiguration {
  devices: LocalStorageDeviceInformation[];
}

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

  static #DefaultConnectionManager(): BaseConnectionManager {
    return new WebBluetoothConnectionManager();
  }

  #eventDispatcher: EventDispatcher<Device, DeviceEventType, DeviceEventMessages> = new EventDispatcher(
    this as Device,
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
      this.connectionManager.onStatusUpdated = undefined;
      this.connectionManager.onMessageReceived = undefined;
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
      this.connectionManager = Device.#DefaultConnectionManager();
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
    "getFileType",
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
  #reconnectIntervalId?: NodeJS.Timeout | number;

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

    return this.connectionManager!.disconnect();
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
      Boolean(this.connectionManager?.isConnected) &&
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
        if (FileTransferMessageTypes.includes(messageType as FileTransferMessageType)) {
          this.#fileTransferManager.parseMessage(messageType as FileTransferMessageType, dataView);
        } else if (TfliteMessageTypes.includes(messageType as TfliteMessageType)) {
          this.#tfliteManager.parseMessage(messageType as TfliteMessageType, dataView);
        } else if (SensorDataMessageTypes.includes(messageType as SensorDataMessageType)) {
          this.#sensorDataManager.parseMessage(messageType as SensorDataMessageType, dataView);
        } else if (FirmwareMessageTypes.includes(messageType as FirmwareMessageType)) {
          this.#firmwareManager.parseMessage(messageType as FirmwareMessageType, dataView);
        } else if (DeviceInformationMessageTypes.includes(messageType as DeviceInformationMessageType)) {
          this.#deviceInformationManager.parseMessage(messageType as DeviceInformationMessageType, dataView);
        } else if (InformationMessageTypes.includes(messageType as InformationMessageType)) {
          this.#informationManager.parseMessage(messageType as InformationMessageType, dataView);
        } else if (SensorConfigurationMessageTypes.includes(messageType as SensorConfigurationMessageType)) {
          this.#sensorConfigurationManager.parseMessage(messageType as SensorConfigurationMessageType, dataView);
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
  get setName() {
    return this.#informationManager.setName;
  }

  static get Types() {
    return DeviceTypes;
  }
  get type() {
    return this.#informationManager.type;
  }
  get setType() {
    return this.#informationManager.setType;
  }

  static get InsoleSides() {
    return InsoleSides;
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
    return SensorTypes;
  }
  static get ContinuousSensorTypes() {
    return ContinuousSensorTypes;
  }
  get sensorTypes() {
    return Object.keys(this.sensorConfiguration) as SensorType[];
  }
  get continuousSensorTypes() {
    return this.sensorTypes.filter((sensorType) => ContinuousSensorTypes.includes(sensorType as ContinuousSensorType));
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

  async setSensorConfiguration(newSensorConfiguration: SensorConfiguration, clearRest?: boolean) {
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
    return VibrationLocations;
  }
  static get VibrationTypes() {
    return VibrationTypes;
  }

  static get VibrationWaveformEffects() {
    return VibrationWaveformEffects;
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

  async triggerVibration(vibrationConfigurations: VibrationConfiguration[], sendImmediately?: boolean) {
    this.#vibrationManager.triggerVibration(vibrationConfigurations, sendImmediately);
  }

  // FILE TRANSFER
  #fileTransferManager = new FileTransferManager();
  static get FileTypes() {
    return FileTypes;
  }

  get maxFileLength() {
    return this.#fileTransferManager.maxLength;
  }

  async sendFile(fileType: FileType, file: FileLike) {
    const promise = this.waitForEvent("fileTransferComplete");
    this.#fileTransferManager.send(fileType, file);
    await promise;
  }

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
  get setTfliteName() {
    return this.#tfliteManager.setName;
  }

  // TFLITE MODEL CONFIG

  static get TfliteTasks() {
    return TfliteTasks;
  }

  get tfliteTask() {
    return this.#tfliteManager.task;
  }
  get setTfliteTask() {
    return this.#tfliteManager.setTask;
  }

  get tfliteSampleRate() {
    return this.#tfliteManager.sampleRate;
  }
  get setTfliteSampleRate() {
    return this.#tfliteManager.setSampleRate;
  }

  get tfliteSensorTypes() {
    return this.#tfliteManager.sensorTypes;
  }
  get allowedTfliteSensorTypes() {
    return this.sensorTypes.filter((sensorType) => TfliteManager.SensorTypes.includes(sensorType));
  }
  get setTfliteSensorTypes() {
    return this.#tfliteManager.setSensorTypes;
  }

  get tfliteIsReady() {
    return this.#tfliteManager.isReady;
  }

  // TFLITE INFERENCING

  get tfliteInferencingEnabled() {
    return this.#tfliteManager.inferencingEnabled;
  }
  get setTfliteInferencingEnabled() {
    return this.#tfliteManager.setInferencingEnabled;
  }
  async enableTfliteInferencing() {
    return this.setTfliteInferencingEnabled(true);
  }
  async disableTfliteInferencing() {
    return this.setTfliteInferencingEnabled(false);
  }
  get toggleTfliteInferencing() {
    return this.#tfliteManager.toggleInferencingEnabled;
  }

  // TFLITE INFERENCE CONFIG

  get tfliteCaptureDelay() {
    return this.#tfliteManager.captureDelay;
  }
  get setTfliteCaptureDelay() {
    return this.#tfliteManager.setCaptureDelay;
  }
  get tfliteThreshold() {
    return this.#tfliteManager.threshold;
  }
  get setTfliteThreshold() {
    return this.#tfliteManager.setThreshold;
  }

  // FIRMWARE MANAGER

  #firmwareManager = new FirmwareManager();

  get #sendSmpMessage() {
    return this.#connectionManager!.sendSmpMessage;
  }

  async uploadFirmware(file: FileLike) {
    return this.#firmwareManager.uploadFirmware(file);
  }

  async reset() {
    await this.#firmwareManager.reset();
    return this.#connectionManager!.disconnect();
  }

  get firmwareStatus() {
    return this.#firmwareManager.status;
  }

  get getFirmwareImages() {
    return this.#firmwareManager.getImages;
  }
  get firmwareImages() {
    return this.#firmwareManager.images;
  }

  get eraseFirmwareImage() {
    return this.#firmwareManager.eraseImage;
  }
  get confirmFirmwareImage() {
    return this.#firmwareManager.confirmImage;
  }
  get testFirmwareImage() {
    return this.#firmwareManager.testImage;
  }

  // CONNECTED DEVICES

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

  static #DefaultLocalStorageConfiguration: LocalStorageConfiguration = {
    devices: [],
  };
  static #LocalStorageConfiguration?: LocalStorageConfiguration;

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

  static #UpdateLocalStorageConfigurationForDevice(device: Device) {
    if (device.connectionType != "webBluetooth") {
      _console.log("localStorage is only for webBluetooth devices");
      return;
    }
    this.#AssertLocalStorage();
    const deviceInformationIndex = this.#LocalStorageConfiguration!.devices.findIndex((deviceInformation) => {
      return deviceInformation.bluetoothId == device.bluetoothId;
    });
    if (deviceInformationIndex == -1) {
      return;
    }
    this.#LocalStorageConfiguration!.devices[deviceInformationIndex].type = device.type;
    this.#SaveToLocalStorage();
  }

  // AVAILABLE DEVICES
  static #AvailableDevices: Device[] = [];
  static get AvailableDevices() {
    return this.#AvailableDevices;
  }

  static get CanGetDevices() {
    // @ts-expect-error
    return isInBrowser && navigator.bluetooth?.getDevices && !isInBluefy;
  }
  /**
   * retrieves devices already connected via web bluetooth in other tabs/windows
   *
   * _only available on web-bluetooth enabled browsers_
   */
  static async GetDevices(): Promise<Device[] | undefined> {
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

    const configuration = this.#LocalStorageConfiguration!;
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
          existingConnectedDevice &&
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
          const deviceInformation: LocalStorageDeviceInformation = {
            type: device.type,
            bluetoothId: device.bluetoothId!,
          };
          const deviceInformationIndex = this.#LocalStorageConfiguration!.devices.findIndex(
            (_deviceInformation) => _deviceInformation.bluetoothId == deviceInformation.bluetoothId
          );
          if (deviceInformationIndex == -1) {
            this.#LocalStorageConfiguration!.devices.push(deviceInformation);
          } else {
            this.#LocalStorageConfiguration!.devices[deviceInformationIndex] = deviceInformation;
          }
          this.#SaveToLocalStorage();
        }
        this.#DispatchEvent("deviceConnected", { device });
        this.#DispatchEvent("deviceIsConnected", { device });
        this.#DispatchConnectedDevices();
      } else {
        _console.log("device already included");
      }
    } else {
      if (this.#ConnectedDevices.includes(device)) {
        _console.log("removing device", device);
        this.#ConnectedDevices.splice(this.#ConnectedDevices.indexOf(device), 1);
        this.#DispatchEvent("deviceDisconnected", { device });
        this.#DispatchEvent("deviceIsConnected", { device });
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
    this.#DispatchEvent("availableDevices", { availableDevices: this.AvailableDevices });
  }
  static #DispatchConnectedDevices() {
    _console.log({ ConnectedDevices: this.ConnectedDevices });
    this.#DispatchEvent("connectedDevices", { connectedDevices: this.ConnectedDevices });
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
