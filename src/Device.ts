import { createConsole } from "./utils/Console.ts";
import EventDispatcher, {
  BoundEventListeners,
  Event,
  EventListenerMap,
  EventMap,
} from "./utils/EventDispatcher.ts";
import BaseConnectionManager, {
  TxMessage,
  TxRxMessageType,
  ConnectionStatus,
  ConnectionMessageType,
  MetaConnectionMessageTypes,
  BatteryLevelMessageTypes,
  ConnectionEventTypes,
  ConnectionStatusEventMessages,
  ConnectionTypes,
  ConnectionType,
  ConnectOptions,
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
  RequiredPressureMessageTypes,
} from "./sensor/SensorDataManager.ts";
import VibrationManager, {
  SendVibrationMessageCallback,
  VibrationConfiguration,
  VibrationEventDispatcher,
  VibrationEventTypes,
  VibrationMessageType,
  VibrationMessageTypes,
} from "./vibration/VibrationManager.ts";
import FileTransferManager, {
  FileTransferEventTypes,
  FileTransferEventMessages,
  FileTransferEventDispatcher,
  SendFileTransferMessageCallback,
  FileTransferMessageTypes,
  FileTransferMessageType,
  FileType,
  FileTypes,
  RequiredFileTransferMessageTypes,
} from "./FileTransferManager.ts";
import TfliteManager, {
  TfliteEventTypes,
  TfliteEventMessages,
  TfliteEventDispatcher,
  SendTfliteMessageCallback,
  TfliteMessageTypes,
  TfliteMessageType,
  TfliteSensorTypes,
  TfliteFileConfiguration,
  TfliteSensorType,
  RequiredTfliteMessageTypes,
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
  DeviceInformationType,
  DeviceInformationTypes,
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
import CameraManager, {
  CameraEventDispatcher,
  CameraEventMessages,
  CameraEventTypes,
  CameraMessageType,
  CameraMessageTypes,
  RequiredCameraMessageTypes,
  SendCameraMessageCallback,
} from "./CameraManager.ts";
import MicrophoneManager, {
  MicrophoneEventDispatcher,
  MicrophoneEventMessages,
  MicrophoneEventTypes,
  MicrophoneMessageType,
  MicrophoneMessageTypes,
  RequiredMicrophoneMessageTypes,
  SendMicrophoneMessageCallback,
} from "./MicrophoneManager.ts";
import DisplayManager, {
  DisplayEventDispatcher,
  DisplayEventMessages,
  DisplayEventTypes,
  DisplayMessageType,
  DisplayMessageTypes,
  RequiredDisplayMessageTypes,
  SendDisplayMessageCallback,
} from "./DisplayManager.ts";
import WifiManager, {
  RequiredWifiMessageTypes,
  SendWifiMessageCallback,
  WifiEventDispatcher,
  WifiEventMessages,
  WifiEventTypes,
  WifiMessageType,
  WifiMessageTypes,
} from "./WifiManager.ts";
import WebSocketConnectionManager from "./connection/websocket/WebSocketConnectionManager.ts";
import ClientConnectionManager from "./connection/ClientConnectionManager.ts";

/** NODE_START */
import UDPConnectionManager from "./connection/udp/UDPConnectionManager.ts";
/** NODE_END */

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
  ...VibrationEventTypes,
  ...FileTransferEventTypes,
  ...TfliteEventTypes,
  ...WifiEventTypes,
  ...CameraEventTypes,
  ...MicrophoneEventTypes,
  ...DisplayEventTypes,
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
    WifiEventMessages,
    CameraEventMessages,
    MicrophoneEventMessages,
    DisplayEventMessages,
    FirmwareEventMessages {
  batteryLevel: { batteryLevel: number };
  connectionMessage: { messageType: ConnectionMessageType; dataView: DataView };
}

export type SendMessageCallback<MessageType extends string> = (
  messages?: { type: MessageType; data?: ArrayBuffer }[],
  sendImmediately?: boolean
) => Promise<void>;

export type SendSmpMessageCallback = (data: ArrayBuffer) => Promise<void>;

export type DeviceEventDispatcher = EventDispatcher<
  Device,
  DeviceEventType,
  DeviceEventMessages
>;
export type DeviceEvent = Event<Device, DeviceEventType, DeviceEventMessages>;
export type DeviceEventMap = EventMap<
  Device,
  DeviceEventType,
  DeviceEventMessages
>;
export type DeviceEventListenerMap = EventListenerMap<
  Device,
  DeviceEventType,
  DeviceEventMessages
>;
export type BoundDeviceEventListeners = BoundEventListeners<
  Device,
  DeviceEventType,
  DeviceEventMessages
>;

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

  "getVibrationLocations",

  "getFileTypes",

  "isWifiAvailable",
];

class Device {
  get bluetoothId() {
    return this.#connectionManager?.bluetoothId;
  }

  get isAvailable() {
    return this.#connectionManager?.isAvailable;
  }

  constructor() {
    this.#deviceInformationManager.eventDispatcher = this
      .#eventDispatcher as DeviceInformationEventDispatcher;

    this._informationManager.sendMessage = this
      .sendTxMessages as SendInformationMessageCallback;
    this._informationManager.eventDispatcher = this
      .#eventDispatcher as InformationEventDispatcher;

    this.#sensorConfigurationManager.sendMessage = this
      .sendTxMessages as SendSensorConfigurationMessageCallback;
    this.#sensorConfigurationManager.eventDispatcher = this
      .#eventDispatcher as SensorConfigurationEventDispatcher;

    this.#sensorDataManager.eventDispatcher = this
      .#eventDispatcher as SensorDataEventDispatcher;

    this.#vibrationManager.sendMessage = this
      .sendTxMessages as SendVibrationMessageCallback;
    this.#vibrationManager.eventDispatcher = this
      .#eventDispatcher as VibrationEventDispatcher;

    this.#tfliteManager.sendMessage = this
      .sendTxMessages as SendTfliteMessageCallback;
    this.#tfliteManager.eventDispatcher = this
      .#eventDispatcher as TfliteEventDispatcher;

    this.#fileTransferManager.sendMessage = this
      .sendTxMessages as SendFileTransferMessageCallback;
    this.#fileTransferManager.eventDispatcher = this
      .#eventDispatcher as FileTransferEventDispatcher;

    this.#wifiManager.sendMessage = this
      .sendTxMessages as SendWifiMessageCallback;
    this.#wifiManager.eventDispatcher = this
      .#eventDispatcher as WifiEventDispatcher;

    this.#cameraManager.sendMessage = this
      .sendTxMessages as SendCameraMessageCallback;
    this.#cameraManager.eventDispatcher = this
      .#eventDispatcher as CameraEventDispatcher;

    this.#microphoneManager.sendMessage = this
      .sendTxMessages as SendMicrophoneMessageCallback;
    this.#microphoneManager.eventDispatcher = this
      .#eventDispatcher as MicrophoneEventDispatcher;

    this.#displayManager.sendMessage = this
      .sendTxMessages as SendDisplayMessageCallback;
    this.#displayManager.eventDispatcher = this
      .#eventDispatcher as DisplayEventDispatcher;

    this.#firmwareManager.sendMessage = this
      .sendSmpMessage as SendSmpMessageCallback;
    this.#firmwareManager.eventDispatcher = this
      .#eventDispatcher as FirmwareEventDispatcher;

    this.addEventListener("getMtu", () => {
      this.#firmwareManager.mtu = this.mtu;
      this.#fileTransferManager.mtu = this.mtu;
      this.connectionManager!.mtu = this.mtu;
      this.#displayManager.mtu = this.mtu;
    });
    this.addEventListener("getSensorConfiguration", () => {
      if (this.connectionStatus != "connecting") {
        return;
      }
      if (this.sensorTypes.includes("pressure")) {
        _console.log("requesting required pressure information");
        const messages = RequiredPressureMessageTypes.map((messageType) => ({
          type: messageType,
        }));
        this.sendTxMessages(messages, false);
      } else {
        _console.log("don't need to request pressure infomration");
      }

      if (this.sensorTypes.includes("camera")) {
        _console.log("requesting required camera information");
        const messages = RequiredCameraMessageTypes.map((messageType) => ({
          type: messageType,
        }));
        this.sendTxMessages(messages, false);
      } else {
        _console.log("don't need to request camera infomration");
      }

      if (this.sensorTypes.includes("microphone")) {
        _console.log("requesting required microphone information");
        const messages = RequiredMicrophoneMessageTypes.map((messageType) => ({
          type: messageType,
        }));
        this.sendTxMessages(messages, false);
      } else {
        _console.log("don't need to request microphone infomration");
      }
    });
    this.addEventListener("getFileTypes", () => {
      if (this.connectionStatus != "connecting") {
        return;
      }
      if (this.fileTypes.length > 0) {
        this.#fileTransferManager.requestRequiredInformation();
      }
      if (this.fileTypes.includes("tflite")) {
        this.#tfliteManager.requestRequiredInformation();
      }
    });
    this.addEventListener("isWifiAvailable", () => {
      if (this.connectionStatus != "connecting") {
        return;
      }
      if (this.connectionType == "client" && !isInNode) {
        return;
      }
      if (this.isWifiAvailable) {
        if (this.connectionType != "client") {
          this.#wifiManager.requestRequiredInformation();
        }
      }
    });
    this.addEventListener("getType", () => {
      if (this.connectionStatus != "connecting") {
        return;
      }
      if (this.type == "glasses") {
        this.#displayManager.requestRequiredInformation();
      }
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

  #eventDispatcher: DeviceEventDispatcher = new EventDispatcher(
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
      this.connectionManager.remove();
    }
    if (newConnectionManager) {
      newConnectionManager.onStatusUpdated =
        this.#onConnectionStatusUpdated.bind(this);
      newConnectionManager.onMessageReceived =
        this.#onConnectionMessageReceived.bind(this);
      newConnectionManager.onMessagesReceived =
        this.#onConnectionMessagesReceived.bind(this);
    }

    this.#connectionManager = newConnectionManager;
    _console.log("assigned new connectionManager", this.#connectionManager);

    this._informationManager.connectionType = this.connectionType;
  }
  async #sendTxMessages(messages?: TxMessage[], sendImmediately?: boolean) {
    await this.#connectionManager?.sendTxMessages(messages, sendImmediately);
  }
  private sendTxMessages = this.#sendTxMessages.bind(this);

  async connect(options?: ConnectOptions) {
    _console.log("connect options", options);
    if (options) {
      switch (options.type) {
        case "webBluetooth":
          if (this.connectionType != "webBluetooth") {
            this.connectionManager = new WebBluetoothConnectionManager();
          }
          break;
        case "webSocket":
          {
            let createConnectionManager = false;
            if (this.connectionType == "webSocket") {
              const connectionManager = this
                .connectionManager as WebSocketConnectionManager;
              if (
                connectionManager.ipAddress != options.ipAddress ||
                connectionManager.isSecure != options.isWifiSecure
              ) {
                createConnectionManager = true;
              }
            } else {
              createConnectionManager = true;
            }
            if (createConnectionManager) {
              this.connectionManager = new WebSocketConnectionManager(
                options.ipAddress,
                options.isWifiSecure,
                this.bluetoothId
              );
            }
          }

          break;
        case "udp":
          {
            let createConnectionManager = false;
            if (this.connectionType == "udp") {
              const connectionManager = this
                .connectionManager as UDPConnectionManager;
              if (connectionManager.ipAddress != options.ipAddress) {
                createConnectionManager = true;
              }
              this.reconnectOnDisconnection = true;
            } else {
              createConnectionManager = true;
            }
            if (createConnectionManager) {
              this.connectionManager = new UDPConnectionManager(
                options.ipAddress,
                this.bluetoothId
              );
            }
          }
          break;
      }
    }
    if (!this.connectionManager) {
      this.connectionManager = Device.#DefaultConnectionManager();
    }
    this.#clear();

    if (options?.type == "client") {
      _console.assertWithError(
        this.connectionType == "client",
        "expected clientConnectionManager"
      );
      const clientConnectionManager = this
        .connectionManager as ClientConnectionManager;
      clientConnectionManager.subType = options.subType;
      return clientConnectionManager.connect();
    }
    _console.log("connectionManager type", this.connectionManager.type);
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

  #didReceiveMessageTypes(messageTypes: ConnectionMessageType[]) {
    return messageTypes.every((messageType) => {
      const hasConnectionMessage =
        this.latestConnectionMessages.has(messageType);
      if (!hasConnectionMessage) {
        _console.log(`didn't receive "${messageType}" message`);
      }
      return hasConnectionMessage;
    });
  }
  get #hasRequiredInformation() {
    let hasRequiredInformation = this.#didReceiveMessageTypes(
      RequiredInformationConnectionMessages
    );
    if (hasRequiredInformation && this.sensorTypes.includes("pressure")) {
      hasRequiredInformation = this.#didReceiveMessageTypes(
        RequiredPressureMessageTypes
      );
    }
    if (hasRequiredInformation && this.isWifiAvailable) {
      hasRequiredInformation = this.#didReceiveMessageTypes(
        RequiredWifiMessageTypes
      );
    }
    if (hasRequiredInformation && this.fileTypes.length > 0) {
      hasRequiredInformation = this.#didReceiveMessageTypes(
        RequiredFileTransferMessageTypes
      );
    }
    if (hasRequiredInformation && this.fileTypes.includes("tflite")) {
      hasRequiredInformation = this.#didReceiveMessageTypes(
        RequiredTfliteMessageTypes
      );
    }
    if (hasRequiredInformation && this.hasCamera) {
      hasRequiredInformation = this.#didReceiveMessageTypes(
        RequiredCameraMessageTypes
      );
    }
    if (hasRequiredInformation && this.hasMicrophone) {
      hasRequiredInformation = this.#didReceiveMessageTypes(
        RequiredMicrophoneMessageTypes
      );
    }
    if (hasRequiredInformation && this.isDisplayAvailable) {
      hasRequiredInformation = this.#didReceiveMessageTypes(
        RequiredDisplayMessageTypes
      );
    }
    return hasRequiredInformation;
  }
  #requestRequiredInformation() {
    _console.log("requesting required information");
    const messages: TxMessage[] = RequiredInformationConnectionMessages.map(
      (messageType) => ({
        type: messageType,
      })
    );
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
      try {
        this.reconnect();
      } catch (error) {
        _console.error("error trying to reconnect", error);
        this.connect();
      }
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
    return (
      this.connectionStatus == "connecting" ||
      this.connectionStatus == "disconnecting"
    );
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
      if (this.connectionType != "client") {
        this.#requestRequiredInformation();
      }
    }

    DeviceManager.OnDeviceConnectionStatusUpdated(this, connectionStatus);
  }

  #dispatchConnectionEvents(includeIsConnected: boolean = false) {
    this.#dispatchEvent("connectionStatus", {
      connectionStatus: this.connectionStatus,
    });
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
    this.#tfliteManager.clear();
    this.#wifiManager.clear();
    this.#cameraManager.clear();
    this.#microphoneManager.clear();
    this.#displayManager.clear();
  }
  #clearConnection() {
    this.connectionManager?.clear();
    this.latestConnectionMessages.clear();
  }

  #onConnectionMessageReceived(
    messageType: ConnectionMessageType,
    dataView: DataView
  ) {
    _console.log({ messageType, dataView });
    switch (messageType) {
      case "batteryLevel":
        const batteryLevel = dataView.getUint8(0);
        _console.log("received battery level", { batteryLevel });
        this.#updateBatteryLevel(batteryLevel);
        break;

      default:
        if (
          FileTransferMessageTypes.includes(
            messageType as FileTransferMessageType
          )
        ) {
          this.#fileTransferManager.parseMessage(
            messageType as FileTransferMessageType,
            dataView
          );
        } else if (
          TfliteMessageTypes.includes(messageType as TfliteMessageType)
        ) {
          this.#tfliteManager.parseMessage(
            messageType as TfliteMessageType,
            dataView
          );
        } else if (
          SensorDataMessageTypes.includes(messageType as SensorDataMessageType)
        ) {
          this.#sensorDataManager.parseMessage(
            messageType as SensorDataMessageType,
            dataView
          );
        } else if (
          FirmwareMessageTypes.includes(messageType as FirmwareMessageType)
        ) {
          this.#firmwareManager.parseMessage(
            messageType as FirmwareMessageType,
            dataView
          );
        } else if (
          DeviceInformationTypes.includes(messageType as DeviceInformationType)
        ) {
          this.#deviceInformationManager.parseMessage(
            messageType as DeviceInformationType,
            dataView
          );
        } else if (
          InformationMessageTypes.includes(
            messageType as InformationMessageType
          )
        ) {
          this._informationManager.parseMessage(
            messageType as InformationMessageType,
            dataView
          );
        } else if (
          SensorConfigurationMessageTypes.includes(
            messageType as SensorConfigurationMessageType
          )
        ) {
          this.#sensorConfigurationManager.parseMessage(
            messageType as SensorConfigurationMessageType,
            dataView
          );
        } else if (
          VibrationMessageTypes.includes(messageType as VibrationMessageType)
        ) {
          this.#vibrationManager.parseMessage(
            messageType as VibrationMessageType,
            dataView
          );
        } else if (WifiMessageTypes.includes(messageType as WifiMessageType)) {
          this.#wifiManager.parseMessage(
            messageType as WifiMessageType,
            dataView
          );
        } else if (
          CameraMessageTypes.includes(messageType as CameraMessageType)
        ) {
          this.#cameraManager.parseMessage(
            messageType as CameraMessageType,
            dataView
          );
        } else if (
          MicrophoneMessageTypes.includes(messageType as MicrophoneMessageType)
        ) {
          this.#microphoneManager.parseMessage(
            messageType as MicrophoneMessageType,
            dataView
          );
        } else if (
          DisplayMessageTypes.includes(messageType as DisplayMessageType)
        ) {
          this.#displayManager.parseMessage(
            messageType as DisplayMessageType,
            dataView
          );
        } else {
          throw Error(`uncaught messageType ${messageType}`);
        }
    }

    this.latestConnectionMessages.set(messageType, dataView);
    if (messageType.startsWith("set")) {
      this.latestConnectionMessages.set(
        // @ts-expect-error
        messageType.replace("set", "get"),
        dataView
      );
    }
    this.#dispatchEvent("connectionMessage", { messageType, dataView });
  }
  #onConnectionMessagesReceived() {
    if (!this.isConnected && this.#hasRequiredInformation) {
      this.#checkConnection();
    }
    if (
      this.connectionStatus == "notConnected" ||
      this.connectionStatus == "disconnecting"
    ) {
      return;
    }
    this.#sendTxMessages();
  }

  latestConnectionMessages: Map<ConnectionMessageType, DataView> = new Map();

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
  get isGlove() {
    return this._informationManager.isGlove;
  }
  get side() {
    return this._informationManager.side;
  }

  get mtu() {
    return this._informationManager.mtu;
  }

  // SENSOR TYPES
  get sensorTypes() {
    return Object.keys(this.sensorConfiguration) as SensorType[];
  }
  get continuousSensorTypes() {
    return ContinuousSensorTypes.filter((sensorType) =>
      this.sensorTypes.includes(sensorType)
    );
  }

  // SENSOR CONFIGURATION

  #sensorConfigurationManager = new SensorConfigurationManager();

  get sensorConfiguration() {
    return this.#sensorConfigurationManager.configuration;
  }

  get setSensorConfiguration() {
    return this.#sensorConfigurationManager.setConfiguration;
  }

  async clearSensorConfiguration() {
    return this.#sensorConfigurationManager.clearSensorConfiguration();
  }

  static #ClearSensorConfigurationOnLeave = true;
  static get ClearSensorConfigurationOnLeave() {
    return this.#ClearSensorConfigurationOnLeave;
  }
  static set ClearSensorConfigurationOnLeave(
    newClearSensorConfigurationOnLeave
  ) {
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
  get vibrationLocations() {
    return this.#vibrationManager.vibrationLocations;
  }

  #vibrationManager = new VibrationManager();
  async triggerVibration(
    vibrationConfigurations: VibrationConfiguration[],
    sendImmediately?: boolean
  ) {
    this.#vibrationManager.triggerVibration(
      vibrationConfigurations,
      sendImmediately
    );
  }

  // FILE TRANSFER
  #fileTransferManager = new FileTransferManager();

  get fileTypes() {
    return this.#fileTransferManager.fileTypes;
  }
  get maxFileLength() {
    return this.#fileTransferManager.maxLength;
  }
  get validFileTypes() {
    return FileTypes.filter((fileType) => {
      if (fileType.includes("wifi") && !this.isWifiAvailable) {
        return false;
      }
      return true;
    });
  }

  async sendFile(fileType: FileType, file: FileLike) {
    _console.assertWithError(
      this.validFileTypes.includes(fileType),
      `invalid fileType ${fileType}`
    );
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

  async sendTfliteConfiguration(configuration: TfliteFileConfiguration) {
    configuration.type = "tflite";
    this.#tfliteManager.sendConfiguration(configuration, false);
    const didSendFile = await this.#fileTransferManager.send(
      configuration.type,
      configuration.file
    );
    if (!didSendFile) {
      this.#sendTxMessages();
    }
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
    return this.sensorTypes.filter((sensorType) =>
      TfliteSensorTypes.includes(sensorType as TfliteSensorType)
    );
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
  #assertCanUpdateFirmware() {
    _console.assertWithError(this.canUpdateFirmware, "can't update firmware");
  }

  #sendSmpMessage(data: ArrayBuffer) {
    this.#assertCanUpdateFirmware();
    return this.#connectionManager!.sendSmpMessage(data);
  }
  private sendSmpMessage = this.#sendSmpMessage.bind(this);

  get uploadFirmware() {
    this.#assertCanUpdateFirmware();
    return this.#firmwareManager.uploadFirmware;
  }
  get canReset() {
    return this.canUpdateFirmware;
  }
  async reset() {
    _console.assertWithError(
      this.canReset,
      "reset is not enabled for this device"
    );
    await this.#firmwareManager.reset();
    return this.#connectionManager!.disconnect();
  }
  get firmwareStatus() {
    return this.#firmwareManager.status;
  }
  get getFirmwareImages() {
    this.#assertCanUpdateFirmware();
    return this.#firmwareManager.getImages;
  }
  get firmwareImages() {
    return this.#firmwareManager.images;
  }
  get eraseFirmwareImage() {
    this.#assertCanUpdateFirmware();
    return this.#firmwareManager.eraseImage;
  }
  get confirmFirmwareImage() {
    this.#assertCanUpdateFirmware();
    return this.#firmwareManager.confirmImage;
  }
  get testFirmwareImage() {
    this.#assertCanUpdateFirmware();
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

  // UKATON
  get isUkaton() {
    return this.deviceInformation.modelNumber.includes("Ukaton");
  }

  // WIFI MANAGER
  #wifiManager = new WifiManager();
  get isWifiAvailable() {
    return this.#wifiManager.isWifiAvailable;
  }
  get wifiSSID() {
    return this.#wifiManager.wifiSSID;
  }
  async setWifiSSID(newWifiSSID: string) {
    return this.#wifiManager.setWifiSSID(newWifiSSID);
  }
  get wifiPassword() {
    return this.#wifiManager.wifiPassword;
  }
  async setWifiPassword(newWifiPassword: string) {
    return this.#wifiManager.setWifiPassword(newWifiPassword);
  }
  get isWifiConnected() {
    return this.#wifiManager.isWifiConnected;
  }
  get ipAddress() {
    return this.#wifiManager.ipAddress;
  }
  get wifiConnectionEnabled() {
    return this.#wifiManager.wifiConnectionEnabled;
  }
  get enableWifiConnection() {
    return this.#wifiManager.enableWifiConnection;
  }
  get setWifiConnectionEnabled() {
    return this.#wifiManager.setWifiConnectionEnabled;
  }
  get disableWifiConnection() {
    return this.#wifiManager.disableWifiConnection;
  }
  get toggleWifiConnection() {
    return this.#wifiManager.toggleWifiConnection;
  }
  get isWifiSecure() {
    return this.#wifiManager.isWifiSecure;
  }

  async reconnectViaWebSockets() {
    _console.assertWithError(this.isWifiConnected, "wifi is not connected");
    _console.assertWithError(
      this.connectionType != "webSocket",
      "already connected via webSockets"
    );
    _console.assertTypeWithError(this.ipAddress, "string");
    _console.log("reconnecting via websockets...");
    await this.disconnect();
    await this.connect({
      type: "webSocket",
      ipAddress: this.ipAddress!,
      isWifiSecure: this.isWifiSecure,
    });
  }

  async reconnectViaUDP() {
    _console.assertWithError(isInNode, "udp is only available in node");
    _console.assertWithError(this.isWifiConnected, "wifi is not connected");
    _console.assertWithError(
      this.connectionType != "udp",
      "already connected via udp"
    );
    _console.assertTypeWithError(this.ipAddress, "string");
    _console.log("reconnecting via udp...");
    await this.disconnect();
    await this.connect({
      type: "udp",
      ipAddress: this.ipAddress!,
    });
  }

  // CAMERA MANAGER
  #cameraManager = new CameraManager();
  get hasCamera() {
    return this.sensorTypes.includes("camera");
  }
  get cameraStatus() {
    return this.#cameraManager.cameraStatus;
  }
  #assertHasCamera() {
    _console.assertWithError(this.hasCamera, "camera not available");
  }
  async takePicture(sensorRate: number = 10) {
    this.#assertHasCamera();
    if (this.sensorConfiguration.camera == 0) {
      this.setSensorConfiguration({ camera: sensorRate }, false, false);
    }
    await this.#cameraManager.takePicture();
  }
  async focusCamera(sensorRate: number = 10) {
    this.#assertHasCamera();
    if (this.sensorConfiguration.camera == 0) {
      this.setSensorConfiguration({ camera: sensorRate }, false, false);
    }
    await this.#cameraManager.focus();
  }
  async stopCamera() {
    this.#assertHasCamera();
    await this.#cameraManager.stop();
  }
  async wakeCamera() {
    this.#assertHasCamera();
    await this.#cameraManager.wake();
  }
  async sleepCamera() {
    this.#assertHasCamera();
    await this.#cameraManager.sleep();
  }

  get cameraConfiguration() {
    return this.#cameraManager.cameraConfiguration;
  }
  get availableCameraConfigurationTypes() {
    return this.#cameraManager.availableCameraConfigurationTypes;
  }
  get cameraConfigurationRanges() {
    return this.#cameraManager.cameraConfigurationRanges;
  }

  get setCameraConfiguration() {
    return this.#cameraManager.setCameraConfiguration;
  }

  // MICROPHONE
  #microphoneManager = new MicrophoneManager();
  get hasMicrophone() {
    return this.sensorTypes.includes("microphone");
  }
  get microphoneStatus() {
    return this.#microphoneManager.microphoneStatus;
  }
  #assertHasMicrophone() {
    _console.assertWithError(this.hasMicrophone, "microphone not available");
  }

  async startMicrophone() {
    this.#assertHasMicrophone();
    await this.#microphoneManager.start();
  }
  async stopMicrophone() {
    this.#assertHasMicrophone();
    await this.#microphoneManager.stop();
  }
  async enableMicrophoneVad() {
    this.#assertHasMicrophone();
    await this.#microphoneManager.vad();
  }
  async toggleMicrophone() {
    this.#assertHasMicrophone();
    await this.#microphoneManager.toggle();
  }

  get microphoneConfiguration() {
    return this.#microphoneManager.microphoneConfiguration;
  }
  get availableMicrophoneConfigurationTypes() {
    return this.#microphoneManager.availableMicrophoneConfigurationTypes;
  }
  get setMicrophoneConfiguration() {
    return this.#microphoneManager.setMicrophoneConfiguration;
  }

  #assertWebAudioSupport() {
    _console.assertWithError(AudioContext, "WebAudio is not supported");
  }

  get audioContext() {
    this.#assertWebAudioSupport();
    return this.#microphoneManager.audioContext;
  }
  set audioContext(newAudioContext) {
    this.#assertWebAudioSupport();
    this.#microphoneManager.audioContext = newAudioContext;
  }
  get microphoneMediaStreamDestination() {
    this.#assertWebAudioSupport();
    return this.#microphoneManager.mediaStreamDestination;
  }
  get microphoneGainNode() {
    this.#assertWebAudioSupport();
    return this.#microphoneManager.gainNode;
  }

  get isRecordingMicrophone() {
    return this.#microphoneManager.isRecording;
  }
  startRecordingMicrophone() {
    this.#assertWebAudioSupport();
    this.#microphoneManager.startRecording();
  }
  stopRecordingMicrophone() {
    this.#assertWebAudioSupport();
    this.#microphoneManager.stopRecording();
  }
  toggleMicrophoneRecording() {
    this.#assertWebAudioSupport();
    this.#microphoneManager.toggleRecording();
  }

  // DISPLAY
  #displayManager = new DisplayManager();

  get isDisplayAvailable() {
    return this.#displayManager.isDisplayAvailable;
  }
  get isDisplayReady() {
    return this.#displayManager.isDisplayReady;
  }
  get displayContextState() {
    return this.#displayManager.displayContextState;
  }
  get displayColors() {
    return this.#displayManager.colors;
  }
  get displayColorOpacities() {
    return this.#displayManager.opacities;
  }
  #assertDisplayIsAvailable() {
    _console.assertWithError(this.isDisplayAvailable, "display not available");
  }
  get displayStatus() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.displayStatus;
  }
  get displayBrightness() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.displayBrightness;
  }
  get setDisplayBrightness() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.setDisplayBrightness;
  }

  get displayInformation() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.displayInformation;
  }
  get numberOfDisplayColors() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.numberOfColors;
  }

  get wakeDisplay() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.wake;
  }
  get sleepDisplay() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.sleep;
  }
  get toggleDisplay() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.toggle;
  }
  get isDisplayAwake() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.isDisplayAwake;
  }

  get showDisplay() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.showDisplay;
  }
  get clearDisplay() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.clearDisplay;
  }

  get setDisplayColor() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.setColor;
  }
  get setDisplayColorOpacity() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.setColorOpacity;
  }
  get setDisplayOpacity() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.setOpacity;
  }

  get saveDisplayContext() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.saveContext;
  }
  get restoreDisplayContext() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.restoreContext;
  }

  get clearDisplayRect() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.clearRect;
  }

  get selectDisplayFillColor() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.selectFillColor;
  }
  get selectDisplayLineColor() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.selectLineColor;
  }
  get setDisplayLineWidth() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.setLineWidth;
  }
  get setDisplayRotation() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.setRotation;
  }
  get clearDisplayRotation() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.clearRotation;
  }

  get setDisplaySegmentStartCap() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.setSegmentStartCap;
  }
  get setDisplaySegmentEndCap() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.setSegmentEndCap;
  }
  get setDisplaySegmentCap() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.setSegmentCap;
  }

  get setDisplaySegmentStartRadius() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.setSegmentStartRadius;
  }
  get setDisplaySegmentEndRadius() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.setSegmentEndRadius;
  }
  get setDisplaySegmentRadius() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.setSegmentRadius;
  }

  get setDisplayCropTop() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.setCropTop;
  }
  get setDisplayCropRight() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.setCropRight;
  }
  get setDisplayCropBottom() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.setCropBottom;
  }
  get setDisplayCropLeft() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.setCropLeft;
  }
  get setDisplayCrop() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.setCrop;
  }
  get clearDisplayCrop() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.clearCrop;
  }

  get setDisplayRotationCropTop() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.setRotationCropTop;
  }
  get setDisplayRotationCropRight() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.setRotationCropRight;
  }
  get setDisplayRotationCropBottom() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.setRotationCropBottom;
  }
  get setDisplayRotationCropLeft() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.setRotationCropLeft;
  }
  get setDisplayRotationCrop() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.setRotationCrop;
  }
  get clearDisplayRotationCrop() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.clearRotationCrop;
  }
  get flushDisplayContextCommands() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.flushDisplayContextCommands;
  }

  get drawDisplayRect() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.drawRect;
  }
  get drawDisplayCircle() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.drawCircle;
  }
  get drawDisplayEllipse() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.drawEllipse;
  }
  get drawDisplayRoundRect() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.drawRoundRect;
  }
  get drawDisplayPolygon() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.drawPolygon;
  }
  get drawDisplaySegment() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.drawSegment;
  }
  get drawDisplaySegments() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.drawSegments;
  }
  get drawDisplayArc() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.drawArc;
  }
  get drawDisplayArcEllipse() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.drawArcEllipse;
  }
  get drawDisplayBitmap() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.drawBitmap;
  }
  get imageToDisplayBitmap() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.imageToBitmap;
  }

  get setDisplayContextState() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.setContextState;
  }

  get selectDisplayBitmapColorIndex() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.selectBitmapColorIndex;
  }
  get selectDisplayBitmapColorIndices() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.selectBitmapColorIndices;
  }
  get setDisplayBitmapScaleX() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.setBitmapScaleX;
  }
  get setDisplayBitmapScaleY() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.setBitmapScaleY;
  }
  get setDisplayBitmapScale() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.setBitmapScale;
  }
  get resetDisplayBitmapScale() {
    this.#assertDisplayIsAvailable();
    return this.#displayManager.resetBitmapScale;
  }

  // FILL - spritesheet, text, etc
}

export default Device;
