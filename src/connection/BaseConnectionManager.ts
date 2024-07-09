import { createConsole } from "../utils/Console";
import Timer from "../utils/Timer";

import { FileTransferMessageTypes } from "../FileTransferManager";
import { TfliteMessageTypes } from "../TfliteManager";
import { concatenateArrayBuffers } from "../utils/ArrayBufferUtils";
import { parseMessage } from "../utils/ParseUtils";
import { DeviceInformationMessageTypes } from "../DeviceInformationManager";
import { InformationMessageTypes } from "../InformationManager";
import { VibrationMessageTypes } from "../vibration/VibrationManager";
import { SensorConfigurationMessageTypes } from "../sensor/SensorConfigurationManager";
import { SensorDataEventTypes } from "../sensor/SensorDataManager";

const _console = createConsole("BaseConnectionManager", { log: true });

export const ConnectionTypes = ["webBluetooth", "noble", "webSocketClient"] as const;
export type ConnectionType = (typeof ConnectionTypes)[number];

export const ConnectionStatuses = ["not connected", "connecting", "connected", "disconnecting"] as const;
export type ConnectionStatus = (typeof ConnectionStatuses)[number];

export interface TxMessage {
  type: TxRxMessageType;
  data?: ArrayBuffer;
}

export const TxRxMessageTypes = [
  ...InformationMessageTypes,
  ...SensorConfigurationMessageTypes,
  ...SensorDataEventTypes,
  ...VibrationMessageTypes,
  ...TfliteMessageTypes,
  ...FileTransferMessageTypes,
] as const;
export type TxRxMessageType = (typeof TxRxMessageTypes)[number];

export const ConnectionMessageTypes = [
  ...DeviceInformationMessageTypes,
  "batteryLevel",
  "smp",
  "rx",
  "tx",
  ...TxRxMessageTypes,
] as const;
export type ConnectionMessageType = (typeof ConnectionMessageTypes)[number];

export type ConnectionStatusCallback = (status: ConnectionStatus) => void;
export type MessageReceivedCallback = (messageType: ConnectionMessageType, dataView: DataView) => void;

abstract class BaseConnectionManager {
  static #AssertValidTxRxMessageType(messageType: TxRxMessageType) {
    _console.assertEnumWithError(messageType, TxRxMessageTypes);
  }

  abstract get bluetoothId(): string;

  // CALLBACKS
  onStatusUpdated!: ConnectionStatusCallback;
  onMessageReceived!: MessageReceivedCallback;

  static #staticThrowNotImplementedError(name: string) {
    throw new Error(`"${name}" is not implemented by "${this.name}" subclass`);
  }
  #throwNotImplementedError(name: string) {
    throw new Error(`"${name}" is not implemented by "${this.constructor.name}" subclass`);
  }

  get #baseConstructor() {
    return this.constructor as typeof BaseConnectionManager;
  }

  static get isSupported() {
    return false;
  }
  get isSupported() {
    return this.#baseConstructor.isSupported;
  }

  static type: ConnectionType;
  get type(): ConnectionType {
    return this.#baseConstructor.type;
  }

  /** @throws {Error} if not supported */
  #assertIsSupported() {
    _console.assertWithError(this.isSupported, `${this.constructor.name} is not supported`);
  }

  /** @throws {Error} if abstract class */
  #assertIsSubclass() {
    _console.assertWithError(this.constructor != BaseConnectionManager, `${this.constructor.name} must be subclassed`);
  }

  constructor() {
    this.#assertIsSubclass();
    this.#assertIsSupported();
  }

  /** @type {ConnectionStatus[]} */
  static get #Statuses() {
    return ["not connected", "connecting", "connected", "disconnecting"];
  }
  static get Statuses() {
    return this.#Statuses;
  }
  get #statuses() {
    return BaseConnectionManager.#Statuses;
  }

  #status: ConnectionStatus = "not connected";
  get status() {
    return this.#status;
  }
  /** @protected */
  set status(newConnectionStatus) {
    _console.assertEnumWithError(newConnectionStatus, this.#statuses);
    if (this.#status == newConnectionStatus) {
      _console.log(`tried to assign same connection status "${newConnectionStatus}"`);
      return;
    }
    _console.log(`new connection status "${newConnectionStatus}"`);
    this.#status = newConnectionStatus;
    this.onStatusUpdated?.(this.status);

    if (this.isConnected) {
      this.#timer.start();
    } else {
      this.#timer.stop();
    }

    if (this.#status == "not connected") {
      this.mtu = undefined;
    }
  }

  get isConnected() {
    return this.status == "connected";
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

  async sendTxMessages(messages: TxMessage[] | undefined, sendImmediately: boolean = true) {
    this.#assertIsConnectedAndNotDisconnecting();

    if (messages) {
      this.#pendingMessages.push(...messages);
    }

    if (!sendImmediately) {
      return;
    }

    _console.log("sendTxMessages", this.#pendingMessages.slice());

    const arrayBuffers = this.#pendingMessages.map((message) => {
      BaseConnectionManager.#AssertValidTxRxMessageType(message.type);
      const messageTypeEnum = TxRxMessageTypes.indexOf(message.type);
      const dataLength = new DataView(new ArrayBuffer(2));
      dataLength.setUint16(0, message.data?.byteLength || 0, true);
      return concatenateArrayBuffers(messageTypeEnum, dataLength, message.data);
    });

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

    this.#pendingMessages.length = 0;
  }

  mtu?: number;

  async sendTxData(data: ArrayBuffer) {
    _console.log("sendTxData", data);
  }

  parseRxMessage(dataView: DataView) {
    parseMessage(dataView, TxRxMessageTypes, this.#onRxMessage.bind(this), null, true);
  }

  #onRxMessage(messageType: TxRxMessageType, dataView: DataView) {
    _console.log({ messageType, dataView });
    this.onMessageReceived?.(messageType, dataView);
  }

  #timer = new Timer(this.#checkConnection.bind(this), 5000);
  #checkConnection() {
    //console.log("checking connection...");
    if (!this.isConnected) {
      _console.log("timer detected disconnection");
      this.status = "not connected";
    }
  }
}

export default BaseConnectionManager;
