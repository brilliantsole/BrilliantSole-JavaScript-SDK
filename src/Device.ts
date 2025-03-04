import { createConsole } from "./utils/Console.ts";
import EventDispatcher, { BoundEventListeners, Event, EventListenerMap, EventMap } from "./utils/EventDispatcher.ts";
import BaseConnectionManager, {
  TxMessage,
  TxRxMessageType,
  ConnectionStatus,
  ConnectionMessageType,
  MetaConnectionMessageTypes,
  BatteryLevelMessageTypes,
  ConnectionEventTypes,
  ConnectionStatusEventMessages,
} from "./connection/BaseConnectionManager.ts";
import { isInBrowser, isInNode } from "./utils/environment.ts";
import WebBluetoothConnectionManager from "./connection/bluetooth/WebBluetoothConnectionManager.ts";
import SensorConfigurationManager, {
  SendSensorConfigurationMessageCallback,
  SensorConfiguration,
  SensorConfigurationEventDispatcher,
  SensorConfigurationEventMessages,
  SensorConfigurationEventTypes,
  SensorConfigurationMessageType,
  SensorConfigurationMessageTypes,
} from "./sensor/SensorConfigurationManager.ts";
import SensorDataManager, {
  SensorDataEventMessages,
  SensorDataEventTypes,
  SensorDataMessageType,
  SensorDataMessageTypes,
  SensorType,
  ContinuousSensorTypes,
  SensorDataEventDispatcher,
} from "./sensor/SensorDataManager.ts";
import VibrationManager, {
  SendVibrationMessageCallback,
  VibrationConfiguration,
} from "./vibration/VibrationManager.ts";
import FileTransferManager, {
  FileTransferEventTypes,
  FileTransferEventMessages,
  FileTransferEventDispatcher,
  SendFileTransferMessageCallback,
  FileTransferMessageTypes,
  FileTransferMessageType,
  FileType,
} from "./FileTransferManager.ts";
import TfliteManager, {
  TfliteEventTypes,
  TfliteEventMessages,
  TfliteEventDispatcher,
  SendTfliteMessageCallback,
  TfliteMessageTypes,
  TfliteMessageType,
  TfliteSensorTypes,
} from "./TfliteManager.ts";
import FirmwareManager, {
  FirmwareEventDispatcher,
  FirmwareEventMessages,
  FirmwareEventTypes,
  FirmwareMessageType,
  FirmwareMessageTypes,
} from "./FirmwareManager.ts";
import DeviceInformationManager, {
  DeviceInformationEventDispatcher,
  DeviceInformationEventTypes,
  DeviceInformationMessageType,
  DeviceInformationMessageTypes,
  DeviceInformationEventMessages,
} from "./DeviceInformationManager.ts";
import InformationManager, {
  DeviceType,
  InformationEventDispatcher,
  InformationEventTypes,
  InformationMessageType,
  InformationMessageTypes,
  InformationEventMessages,
  SendInformationMessageCallback,
} from "./InformationManager.ts";
import { FileLike } from "./utils/ArrayBufferUtils.ts";
import DeviceManager from "./DeviceManager.ts";

const _console = createConsole("Device", { log: false });

export const DeviceEventTypes = [
  "connectionMessage",
  ...ConnectionEventTypes,
  ...MetaConnectionMessageTypes,
  ...BatteryLevelMessageTypes,
  ...InformationEventTypes,
  ...DeviceInformationEventTypes,
  ...SensorConfigurationEventTypes,
  ...SensorDataEventTypes,
  ...FileTransferEventTypes,
  ...TfliteEventTypes,
  ...FirmwareEventTypes,
] as const;
export type DeviceEventType = (typeof DeviceEventTypes)[number];

export interface DeviceEventMessages
  extends ConnectionStatusEventMessages,
    DeviceInformationEventMessages,
    InformationEventMessages,
    SensorDataEventMessages,
    SensorConfigurationEventMessages,
    TfliteEventMessages,
    FileTransferEventMessages,
    FirmwareEventMessages {
  batteryLevel: { batteryLevel: number };
  connectionMessage: { messageType: ConnectionMessageType; dataView: DataView };
}

export type SendMessageCallback<MessageType extends string> = (
  messages?: { type: MessageType; data?: ArrayBuffer }[],
  sendImmediately?: boolean
) => Promise<void>;

export type SendSmpMessageCallback = (data: ArrayBuffer) => Promise<void>;

export type DeviceEventDispatcher = EventDispatcher<Device, DeviceEventType, DeviceEventMessages>;
export type DeviceEvent = Event<Device, DeviceEventType, DeviceEventMessages>;
export type DeviceEventMap = EventMap<Device, DeviceEventType, DeviceEventMessages>;
export type DeviceEventListenerMap = EventListenerMap<Device, DeviceEventType, DeviceEventMessages>;
export type BoundDeviceEventListeners = BoundEventListeners<Device, DeviceEventType, DeviceEventMessages>;

export const RequiredInformationConnectionMessages: TxRxMessageType[] = [
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

class Device {
  get bluetoothId() {
    return this.#connectionManager?.bluetoothId;
  }

  get isAvailable() {
    return this.#connectionManager?.isAvailable;
  }

  constructor() {
    this.#deviceInformationManager.eventDispatcher = this.#eventDispatcher as DeviceInformationEventDispatcher;

    this._informationManager.sendMessage = this.sendTxMessages as SendInformationMessageCallback;
    this._informationManager.eventDispatcher = this.#eventDispatcher as InformationEventDispatcher;

    this.#sensorConfigurationManager.sendMessage = this.sendTxMessages as SendSensorConfigurationMessageCallback;
    this.#sensorConfigurationManager.eventDispatcher = this.#eventDispatcher as SensorConfigurationEventDispatcher;

    this.#sensorDataManager.eventDispatcher = this.#eventDispatcher as SensorDataEventDispatcher;

    this.#vibrationManager.sendMessage = this.sendTxMessages as SendVibrationMessageCallback;

    this.#tfliteManager.sendMessage = this.sendTxMessages as SendTfliteMessageCallback;
    this.#tfliteManager.eventDispatcher = this.#eventDispatcher as TfliteEventDispatcher;

    this.#fileTransferManager.sendMessage = this.sendTxMessages as SendFileTransferMessageCallback;
    this.#fileTransferManager.eventDispatcher = this.#eventDispatcher as FileTransferEventDispatcher;

    this.#firmwareManager.sendMessage = this.sendSmpMessage as SendSmpMessageCallback;
    this.#firmwareManager.eventDispatcher = this.#eventDispatcher as FirmwareEventDispatcher;

    this.addEventListener("getMtu", () => {
      this.#firmwareManager.mtu = this.mtu;
      this.#fileTransferManager.mtu = this.mtu;
      this.connectionManager!.mtu = this.mtu;
    });
    DeviceManager.onDevice(this);
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
  }

  static #DefaultConnectionManager(): BaseConnectionManager {
    return new WebBluetoothConnectionManager();
  }

  #eventDispatcher: DeviceEventDispatcher = new EventDispatcher(this as Device, DeviceEventTypes);
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
  get removeEventListeners() {
    return this.#eventDispatcher.removeEventListeners;
  }
  get removeAllEventListeners() {
    return this.#eventDispatcher.removeAllEventListeners;
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
      this.connectionManager.onMessagesReceived = undefined;
    }
    if (newConnectionManager) {
      newConnectionManager.onStatusUpdated = this.#onConnectionStatusUpdated.bind(this);
      newConnectionManager.onMessageReceived = this.#onConnectionMessageReceived.bind(this);
      newConnectionManager.onMessagesReceived = this.#onConnectionMessagesReceived.bind(this);
    }

    this.#connectionManager = newConnectionManager;
    _console.log("assigned new connectionManager", this.#connectionManager);
  }
  async #sendTxMessages(messages?: TxMessage[], sendImmediately?: boolean) {
    await this.#connectionManager?.sendTxMessages(messages, sendImmediately);
  }
  private sendTxMessages = this.#sendTxMessages.bind(this);

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
    _console.assertWithError(this.isConnected, "notConnected");
  }

  get #hasRequiredInformation() {
    return RequiredInformationConnectionMessages.every((messageType) => {
      return this.latestConnectionMessage.has(messageType);
    });
  }
  #requestRequiredInformation() {
    const messages: TxMessage[] = RequiredInformationConnectionMessages.map((messageType) => ({
      type: messageType,
    }));
    this.#sendTxMessages(messages);
  }

  get canReconnect() {
    return this.connectionManager?.canReconnect;
  }
  #assertCanReconnect() {
    _console.assertWithError(this.canReconnect, "cannot reconnect to device");
  }
  async reconnect() {
    this.#assertCanReconnect();
    this.#clear();
    return this.connectionManager?.reconnect();
  }

  static async Connect() {
    const device = new Device();
    await device.connect();
    return device;
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
      case "notConnected":
      case "connecting":
      case "disconnecting":
        return this.#connectionManager.status;
      default:
        return "notConnected";
    }
  }
  get isConnectionBusy() {
    return this.connectionStatus == "connecting" || this.connectionStatus == "disconnecting";
  }

  #onConnectionStatusUpdated(connectionStatus: ConnectionStatus) {
    _console.log({ connectionStatus });

    if (connectionStatus == "notConnected") {
      this.#clearConnection();

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

    DeviceManager.OnDeviceConnectionStatusUpdated(this, connectionStatus);
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
      this._informationManager.isCurrentTimeSet;

    switch (this.connectionStatus) {
      case "connected":
        if (this.#isConnected) {
          this.#dispatchConnectionEvents(true);
        }
        break;
      case "notConnected":
        this.#dispatchConnectionEvents(true);
        break;
      default:
        this.#dispatchConnectionEvents(false);
        break;
    }
  }

  #clear() {
    this.#clearConnection();
    this._informationManager.clear();
    this.#deviceInformationManager.clear();
  }
  #clearConnection() {
    this.connectionManager?.clear();
    this.latestConnectionMessage.clear();
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
          this._informationManager.parseMessage(messageType as InformationMessageType, dataView);
        } else if (SensorConfigurationMessageTypes.includes(messageType as SensorConfigurationMessageType)) {
          this.#sensorConfigurationManager.parseMessage(messageType as SensorConfigurationMessageType, dataView);
        } else {
          throw Error(`uncaught messageType ${messageType}`);
        }
    }

    this.latestConnectionMessage.set(messageType, dataView);
    this.#dispatchEvent("connectionMessage", { messageType, dataView });
  }
  #onConnectionMessagesReceived() {
    if (!this.isConnected && this.#hasRequiredInformation) {
      this.#checkConnection();
    }
    if (this.connectionStatus == "notConnected") {
      return;
    }
    this.#sendTxMessages();
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
  /** @private */
  _informationManager = new InformationManager();

  get id() {
    return this._informationManager.id;
  }

  get isCharging() {
    return this._informationManager.isCharging;
  }
  get batteryCurrent() {
    return this._informationManager.batteryCurrent;
  }
  get getBatteryCurrent() {
    return this._informationManager.getBatteryCurrent;
  }

  get name() {
    return this._informationManager.name;
  }
  get setName() {
    return this._informationManager.setName;
  }

  get type() {
    return this._informationManager.type;
  }
  get setType() {
    return this._informationManager.setType;
  }

  get isInsole() {
    return this._informationManager.isInsole;
  }
  get insoleSide() {
    return this._informationManager.insoleSide;
  }

  get mtu() {
    return this._informationManager.mtu;
  }

  // SENSOR TYPES
  get sensorTypes() {
    return Object.keys(this.sensorConfiguration) as SensorType[];
  }
  get continuousSensorTypes() {
    return ContinuousSensorTypes.filter((sensorType) => this.sensorTypes.includes(sensorType));
  }

  // SENSOR CONFIGURATION

  #sensorConfigurationManager = new SensorConfigurationManager();

  get sensorConfiguration() {
    return this.#sensorConfigurationManager.configuration;
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
  get numberOfPressureSensors() {
    return this.#sensorDataManager.pressureSensorDataManager.numberOfSensors;
  }

  // SENSOR DATA
  #sensorDataManager = new SensorDataManager();
  resetPressureRange() {
    this.#sensorDataManager.pressureSensorDataManager.resetRange();
  }

  // VIBRATION
  #vibrationManager = new VibrationManager();
  async triggerVibration(vibrationConfigurations: VibrationConfiguration[], sendImmediately?: boolean) {
    this.#vibrationManager.triggerVibration(vibrationConfigurations, sendImmediately);
  }

  // FILE TRANSFER
  #fileTransferManager = new FileTransferManager();

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
  #tfliteManager = new TfliteManager();

  get tfliteName() {
    return this.#tfliteManager.name;
  }
  get setTfliteName() {
    return this.#tfliteManager.setName;
  }

  // TFLITE MODEL CONFIG
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
    return this.sensorTypes.filter((sensorType) => TfliteSensorTypes.includes(sensorType));
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

  get canUpdateFirmware() {
    return this.#connectionManager?.canUpdateFirmware;
  }

  #sendSmpMessage(data: ArrayBuffer) {
    return this.#connectionManager!.sendSmpMessage(data);
  }
  private sendSmpMessage = this.#sendSmpMessage.bind(this);

  get uploadFirmware() {
    return this.#firmwareManager.uploadFirmware;
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

  // SERVER SIDE
  #isServerSide = false;
  get isServerSide() {
    return this.#isServerSide;
  }
  set isServerSide(newIsServerSide) {
    if (this.#isServerSide == newIsServerSide) {
      _console.log("redundant isServerSide assignment");
      return;
    }
    _console.log({ newIsServerSide });
    this.#isServerSide = newIsServerSide;

    this.#fileTransferManager.isServerSide = this.isServerSide;
  }
}

export default Device;
