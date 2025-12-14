import { createConsole } from "../utils/Console.ts";
import { Timer } from "../utils/Timer.ts";
import { FileTransferMessageTypes } from "../FileTransferManager.ts";
import { TfliteMessageTypes } from "../TfliteManager.ts";
import { concatenateArrayBuffers } from "../utils/ArrayBufferUtils.ts";
import { parseMessage } from "../utils/ParseUtils.ts";
import { DeviceInformationTypes } from "../DeviceInformationManager.ts";
import { InformationMessageTypes } from "../InformationManager.ts";
import { VibrationMessageTypes } from "../vibration/VibrationManager.ts";
import { SensorConfigurationMessageTypes } from "../sensor/SensorConfigurationManager.ts";
import { SensorDataMessageTypes } from "../sensor/SensorDataManager.ts";
import { WifiMessageTypes } from "../WifiManager.ts";
import { CameraMessageTypes } from "../CameraManager.ts";
import { MicrophoneMessageTypes } from "../MicrophoneManager.ts";
import { DisplayMessageTypes } from "../DisplayManager.ts";

const _console = createConsole("BaseConnectionManager", { log: false });

export const ConnectionTypes = [
  "webBluetooth",
  "noble",
  "client",
  "webSocket",
  "udp",
] as const;
export type ConnectionType = (typeof ConnectionTypes)[number];

export const ClientConnectionTypes = ["noble", "webSocket", "udp"] as const;
export type ClientConnectionType = (typeof ClientConnectionTypes)[number];

interface BaseConnectOptions {
  type: "client" | "webBluetooth" | "webSocket" | "udp";
}
export interface WebBluetoothConnectOptions extends BaseConnectOptions {
  type: "webBluetooth";
}
interface BaseWifiConnectOptions extends BaseConnectOptions {
  ipAddress: string;
}
export interface ClientConnectOptions extends BaseConnectOptions {
  type: "client";
  subType?: "noble" | "webSocket" | "udp";
}
export interface WebSocketConnectOptions extends BaseWifiConnectOptions {
  type: "webSocket";
  isWifiSecure?: boolean;
}
export interface UDPConnectOptions extends BaseWifiConnectOptions {
  type: "udp";
  //sendPort: number;
  receivePort?: number;
}
export type ConnectOptions =
  | WebBluetoothConnectOptions
  | WebSocketConnectOptions
  | UDPConnectOptions
  | ClientConnectOptions;

export const ConnectionStatuses = [
  "notConnected",
  "connecting",
  "connected",
  "disconnecting",
] as const;
export type ConnectionStatus = (typeof ConnectionStatuses)[number];

export const ConnectionEventTypes = [
  ...ConnectionStatuses,
  "connectionStatus",
  "isConnected",
] as const;
export type ConnectionEventType = (typeof ConnectionEventTypes)[number];

export interface ConnectionStatusEventMessages {
  notConnected: any;
  connecting: any;
  connected: any;
  disconnecting: any;
  connectionStatus: { connectionStatus: ConnectionStatus };
  isConnected: { isConnected: boolean };
}

export interface TxMessage {
  type: TxRxMessageType;
  data?: ArrayBuffer;
}

export const TxRxMessageTypes = [
  ...InformationMessageTypes,
  ...SensorConfigurationMessageTypes,
  ...SensorDataMessageTypes,
  ...VibrationMessageTypes,
  ...FileTransferMessageTypes,
  ...TfliteMessageTypes,
  ...WifiMessageTypes,
  ...CameraMessageTypes,
  ...MicrophoneMessageTypes,
  ...DisplayMessageTypes,
] as const;
export type TxRxMessageType = (typeof TxRxMessageTypes)[number];

export const SMPMessageTypes = ["smp"] as const;
export type SMPMessageType = (typeof SMPMessageTypes)[number];

export const BatteryLevelMessageTypes = ["batteryLevel"] as const;
export type BatteryLevelMessageType = (typeof BatteryLevelMessageTypes)[number];

export const MetaConnectionMessageTypes = ["rx", "tx"] as const;
export type MetaConnectionMessageType =
  (typeof MetaConnectionMessageTypes)[number];

export const ConnectionMessageTypes = [
  ...BatteryLevelMessageTypes,
  ...DeviceInformationTypes,
  ...MetaConnectionMessageTypes,
  ...TxRxMessageTypes,
  ...SMPMessageTypes,
] as const;
export type ConnectionMessageType = (typeof ConnectionMessageTypes)[number];

export type ConnectionStatusCallback = (status: ConnectionStatus) => void;
export type MessageReceivedCallback = (
  messageType: ConnectionMessageType,
  dataView: DataView<ArrayBuffer>
) => void;
export type MessagesReceivedCallback = () => void;

abstract class BaseConnectionManager {
  static #AssertValidTxRxMessageType(messageType: TxRxMessageType) {
    _console.assertEnumWithError(messageType, TxRxMessageTypes);
  }

  abstract get bluetoothId(): string;

  // CALLBACKS
  onStatusUpdated?: ConnectionStatusCallback;
  onMessageReceived?: MessageReceivedCallback;
  onMessagesReceived?: MessagesReceivedCallback;

  protected get baseConstructor() {
    return this.constructor as typeof BaseConnectionManager;
  }
  static get isSupported() {
    return false;
  }
  get isSupported() {
    return this.baseConstructor.isSupported;
  }

  get canUpdateFirmware() {
    return false;
  }

  static type: ConnectionType;
  get type(): ConnectionType {
    return this.baseConstructor.type;
  }

  /** @throws {Error} if not supported */
  #assertIsSupported() {
    _console.assertWithError(this.isSupported, `${this.type} is not supported`);
  }

  constructor() {
    this.#assertIsSupported();
  }

  #status: ConnectionStatus = "notConnected";
  get status() {
    return this.#status;
  }
  protected set status(newConnectionStatus) {
    _console.assertEnumWithError(newConnectionStatus, ConnectionStatuses);
    if (this.#status == newConnectionStatus) {
      _console.log(
        `tried to assign same connection status "${newConnectionStatus}"`
      );
      return;
    }
    _console.log(`new connection status "${newConnectionStatus}"`);
    this.#status = newConnectionStatus;
    this.onStatusUpdated!(this.status);

    if (this.isConnected) {
      this.#timer.start();
    } else {
      this.#timer.stop();
    }

    if (this.#status == "notConnected") {
      this.mtu = this.defaultMtu;
    }
  }

  get isConnected() {
    return this.status == "connected";
  }

  get isAvailable() {
    return false;
  }

  /** @throws {Error} if connected */
  protected assertIsNotConnected() {
    _console.assertWithError(!this.isConnected, "device is already connected");
  }
  /** @throws {Error} if connecting */
  #assertIsNotConnecting() {
    _console.assertWithError(
      this.status != "connecting",
      "device is already connecting"
    );
  }
  /** @throws {Error} if not connected */
  protected assertIsConnected() {
    _console.assertWithError(this.isConnected, "device is not connected");
  }
  /** @throws {Error} if disconnecting */
  #assertIsNotDisconnecting() {
    _console.assertWithError(
      this.status != "disconnecting",
      "device is already disconnecting"
    );
  }
  /** @throws {Error} if not connected or is disconnecting */
  assertIsConnectedAndNotDisconnecting() {
    this.assertIsConnected();
    this.#assertIsNotDisconnecting();
  }

  async connect() {
    if (this.isConnected) {
      _console.log("already connected");
      return false;
    }
    if (this.#status == "connecting") {
      _console.log("already connecting");
      return false;
    }
    // this.assertIsNotConnected();
    // this.#assertIsNotConnecting();
    this.status = "connecting";
    return true;
  }
  get canReconnect() {
    return false;
  }
  async reconnect() {
    if (this.isConnected) {
      _console.log("already connected");
      return false;
    }
    if (this.#status == "connecting") {
      _console.log("already connecting");
      return false;
    }
    // this.assertIsNotConnected();
    // this.#assertIsNotConnecting();
    if (!this.canReconnect) {
      _console.warn("unable to reconnect");
      return false;
    }
    // _console.assertWithError(this.canReconnect, "unable to reconnect");
    this.status = "connecting";
    _console.log("attempting to reconnect...");
    return true;
  }
  async disconnect() {
    if (this.#status == "notConnected") {
      _console.log("already not connected");
      return false;
    }
    if (this.#status == "disconnecting") {
      _console.log("already disconnecting");
      return false;
    }
    // this.assertIsConnected();
    // this.#assertIsNotDisconnecting();
    this.status = "disconnecting";
    _console.log("disconnecting from device...");
    return true;
  }

  async sendSmpMessage(data: ArrayBuffer) {
    this.assertIsConnectedAndNotDisconnecting();
    _console.log("sending smp message", data);
  }

  #pendingMessages: TxMessage[] = [];
  #isSendingMessages = false;
  async sendTxMessages(
    messages: TxMessage[] | undefined,
    sendImmediately: boolean = true
  ) {
    this.assertIsConnectedAndNotDisconnecting();

    if (messages) {
      this.#pendingMessages.push(...messages);
      _console.log(`appended ${messages.length} messages`);
    }

    if (!sendImmediately) {
      _console.log("not sending immediately - waiting until later");
      return;
    }

    if (this.#isSendingMessages) {
      _console.log("already sending messages - waiting until later");
      return;
    }
    if (this.#pendingMessages.length == 0) {
      _console.log("no pendingMessages");
      return;
    }
    this.#isSendingMessages = true;

    _console.log("sendTxMessages", this.#pendingMessages.slice());

    const arrayBuffers = this.#pendingMessages.map((message) => {
      BaseConnectionManager.#AssertValidTxRxMessageType(message.type);
      const messageTypeEnum = TxRxMessageTypes.indexOf(message.type);
      const dataLength = new DataView(new ArrayBuffer(2));
      dataLength.setUint16(0, message.data?.byteLength || 0, true);
      return concatenateArrayBuffers(messageTypeEnum, dataLength, message.data);
    });
    this.#pendingMessages.length = 0;

    if (this.mtu) {
      while (arrayBuffers.length > 0) {
        if (
          arrayBuffers.every(
            (arrayBuffer) => arrayBuffer.byteLength > this.mtu! - 3
          )
        ) {
          _console.error("every arrayBuffer is too big to send");
          break;
        }
        _console.log("remaining arrayBuffers.length", arrayBuffers.length);
        let arrayBufferByteLength = 0;
        let arrayBufferCount = 0;
        arrayBuffers.some((arrayBuffer) => {
          if (arrayBufferByteLength + arrayBuffer.byteLength > this.mtu! - 3) {
            _console.log(
              `stopping appending arrayBuffers ( length ${arrayBuffer.byteLength} too much)`
            );
            return true;
          }
          _console.log(
            `allowing arrayBuffer with length ${arrayBuffer.byteLength}`
          );
          arrayBufferCount++;
          arrayBufferByteLength += arrayBuffer.byteLength;
        });
        const arrayBuffersToSend = arrayBuffers.splice(0, arrayBufferCount);
        _console.log({ arrayBufferCount, arrayBuffersToSend });

        const arrayBuffer = concatenateArrayBuffers(...arrayBuffersToSend);
        _console.log("sending arrayBuffer (partitioned)", arrayBuffer);
        await this.sendTxData(arrayBuffer);
      }
    } else {
      const arrayBuffer = concatenateArrayBuffers(...arrayBuffers);
      _console.log("sending arrayBuffer (all)", arrayBuffer);
      await this.sendTxData(arrayBuffer);
    }

    this.#isSendingMessages = false;

    this.sendTxMessages(undefined, true);
  }

  protected defaultMtu = 23;
  //mtu?: number;
  mtu?: number = this.defaultMtu;

  async sendTxData(data: ArrayBuffer) {
    _console.log("sendTxData", data);
  }

  parseRxMessage(dataView: DataView<ArrayBuffer>) {
    parseMessage(
      dataView,
      TxRxMessageTypes,
      this.#onRxMessage.bind(this),
      null,
      true
    );
    this.onMessagesReceived!();
  }

  #onRxMessage(messageType: TxRxMessageType, dataView: DataView<ArrayBuffer>) {
    _console.log({ messageType, dataView });
    this.onMessageReceived!(messageType, dataView);
  }

  #timer = new Timer(this.#checkConnection.bind(this), 5000);
  #checkConnection() {
    //console.log("checking connection...");
    if (!this.isConnected) {
      _console.log("timer detected disconnection");
      this.status = "notConnected";
    }
  }

  clear() {
    this.#isSendingMessages = false;
    this.#pendingMessages.length = 0;
  }

  remove() {
    this.clear();

    this.onStatusUpdated = undefined;
    this.onMessageReceived = undefined;
    this.onMessagesReceived = undefined;
  }
}

export default BaseConnectionManager;
