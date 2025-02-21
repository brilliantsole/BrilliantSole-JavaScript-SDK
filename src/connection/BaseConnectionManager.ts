import { createConsole } from "../utils/Console.ts";
import Timer from "../utils/Timer.ts";

import { FileTransferMessageTypes } from "../FileTransferManager.ts";
import { TfliteMessageTypes } from "../TfliteManager.ts";
import { concatenateArrayBuffers } from "../utils/ArrayBufferUtils.ts";
import { parseMessage } from "../utils/ParseUtils.ts";
import { DeviceInformationMessageTypes } from "../DeviceInformationManager.ts";
import { InformationMessageTypes } from "../InformationManager.ts";
import { VibrationMessageTypes } from "../vibration/VibrationManager.ts";
import { SensorConfigurationMessageTypes } from "../sensor/SensorConfigurationManager.ts";
import { SensorDataMessageTypes } from "../sensor/SensorDataManager.ts";

const _console = createConsole("BaseConnectionManager", { log: true });

export const ConnectionTypes = ["webBluetooth", "noble", "client"] as const;
export type ConnectionType = (typeof ConnectionTypes)[number];

export const ConnectionStatuses = ["notConnected", "connecting", "connected", "disconnecting"] as const;
export type ConnectionStatus = (typeof ConnectionStatuses)[number];

export const ConnectionEventTypes = [...ConnectionStatuses, "connectionStatus", "isConnected"] as const;
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
  ...TfliteMessageTypes,
  ...FileTransferMessageTypes,
] as const;
export type TxRxMessageType = (typeof TxRxMessageTypes)[number];

export const SMPMessageTypes = ["smp"] as const;
export type SMPMessageType = (typeof SMPMessageTypes)[number];

export const BatteryLevelMessageTypes = ["batteryLevel"] as const;
export type BatteryLevelMessageType = (typeof BatteryLevelMessageTypes)[number];

export const MetaConnectionMessageTypes = ["rx", "tx"] as const;
export type MetaConnectionMessageType = (typeof MetaConnectionMessageTypes)[number];

export const ConnectionMessageTypes = [
  ...BatteryLevelMessageTypes,
  ...DeviceInformationMessageTypes,
  ...MetaConnectionMessageTypes,
  ...TxRxMessageTypes,
  ...SMPMessageTypes,
] as const;
export type ConnectionMessageType = (typeof ConnectionMessageTypes)[number];

export type ConnectionStatusCallback = (status: ConnectionStatus) => void;
export type MessageReceivedCallback = (messageType: ConnectionMessageType, dataView: DataView) => void;
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
    _console.assertWithError(this.isSupported, `${this.constructor.name} is not supported`);
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
      _console.log(`tried to assign same connection status "${newConnectionStatus}"`);
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
      this.mtu = undefined;
    }
  }

  get isConnected() {
    return this.status == "connected";
  }

  get isAvailable() {
    return false;
  }

  /** @throws {Error} if connected */
  #assertIsNotConnected() {
    _console.assertWithError(!this.isConnected, "device is already connected");
  }
  /** @throws {Error} if connecting */
  #assertIsNotConnecting() {
    _console.assertWithError(this.status != "connecting", "device is already connecting");
  }
  /** @throws {Error} if not connected */
  #assertIsConnected() {
    _console.assertWithError(this.isConnected, "device is not connected");
  }
  /** @throws {Error} if disconnecting */
  #assertIsNotDisconnecting() {
    _console.assertWithError(this.status != "disconnecting", "device is already disconnecting");
  }
  /** @throws {Error} if not connected or is disconnecting */
  #assertIsConnectedAndNotDisconnecting() {
    this.#assertIsConnected();
    this.#assertIsNotDisconnecting();
  }

  async connect() {
    this.#assertIsNotConnected();
    this.#assertIsNotConnecting();
    this.status = "connecting";
  }
  get canReconnect() {
    return false;
  }
  async reconnect() {
    this.#assertIsNotConnected();
    this.#assertIsNotConnecting();
    _console.assert(this.canReconnect, "unable to reconnect");
  }
  async disconnect() {
    this.#assertIsConnected();
    this.#assertIsNotDisconnecting();
    this.status = "disconnecting";
    _console.log("disconnecting from device...");
  }

  async sendSmpMessage(data: ArrayBuffer) {
    this.#assertIsConnectedAndNotDisconnecting();
    _console.log("sending smp message", data);
  }

  #pendingMessages: TxMessage[] = [];
  #isSendingMessages = false;
  async sendTxMessages(messages: TxMessage[] | undefined, sendImmediately: boolean = true) {
    this.#assertIsConnectedAndNotDisconnecting();

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
        let arrayBufferByteLength = 0;
        let arrayBufferCount = 0;
        arrayBuffers.some((arrayBuffer) => {
          if (arrayBufferByteLength + arrayBuffer.byteLength > this.mtu! - 3) {
            return true;
          }
          arrayBufferCount++;
          arrayBufferByteLength += arrayBuffer.byteLength;
        });
        const arrayBuffersToSend = arrayBuffers.splice(0, arrayBufferCount);
        _console.log({ arrayBufferCount, arrayBuffersToSend });

        const arrayBuffer = concatenateArrayBuffers(...arrayBuffersToSend);
        _console.log("sending arrayBuffer", arrayBuffer);
        await this.sendTxData(arrayBuffer);
      }
    } else {
      const arrayBuffer = concatenateArrayBuffers(...arrayBuffers);
      _console.log("sending arrayBuffer", arrayBuffer);
      await this.sendTxData(arrayBuffer);
    }

    this.#isSendingMessages = false;
  }

  //mtu?: number;
  mtu?: number = 23;

  async sendTxData(data: ArrayBuffer) {
    _console.log("sendTxData", data);
  }

  parseRxMessage(dataView: DataView) {
    parseMessage(dataView, TxRxMessageTypes, this.#onRxMessage.bind(this), null, true);
    this.onMessagesReceived!();
  }

  #onRxMessage(messageType: TxRxMessageType, dataView: DataView) {
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
}

export default BaseConnectionManager;
