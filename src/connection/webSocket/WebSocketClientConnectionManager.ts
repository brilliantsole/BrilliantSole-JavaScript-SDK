import { createConsole } from "../../utils/Console";
import { isInBrowser } from "../../utils/environment";
import BaseConnectionManager, { ConnectionType, ConnectionMessageType } from "../BaseConnectionManager";
import Device from "../../Device";
import { parseMessage } from "../../utils/ParseUtils";
import DeviceInformationManager from "../../DeviceInformationManager";

const _console = createConsole("WebSocketClientConnectionManager", { log: true });

import { DeviceEventType } from "../../Device";
import { WebSocketClient } from "../../server/websocket/WebSocketClient";
import { ClientDeviceMessage } from "../../server/ServerUtils";

export type SendWebSocketMessageCallback = (...messages: (ConnectionMessageType | ClientDeviceMessage)[]) => void;

class WebSocketClientConnectionManager extends BaseConnectionManager {
  static get isSupported() {
    return isInBrowser;
  }
  static get type(): ConnectionType {
    return "webSocketClient";
  }

  #bluetoothId!: string | undefined;
  get bluetoothId() {
    return this.#bluetoothId!;
  }
  set bluetoothId(newBluetoothId) {
    _console.assertTypeWithError(newBluetoothId, "string");
    if (this.#bluetoothId == newBluetoothId) {
      _console.log("redundant bluetoothId assignment");
      return;
    }
    this.#bluetoothId = newBluetoothId;
  }

  #isConnected = false;
  get isConnected() {
    return this.#isConnected;
  }
  set isConnected(newIsConnected) {
    _console.assertTypeWithError(newIsConnected, "boolean");
    if (this.#isConnected == newIsConnected) {
      _console.log("redundant newIsConnected assignment", newIsConnected);
      return;
    }
    this.#isConnected = newIsConnected;

    this.status = this.#isConnected ? "connected" : "not connected";

    if (this.isConnected) {
      this.#requestDeviceInformation();
    }
  }

  async connect() {
    await super.connect();
    this.sendWebSocketConnectMessage();
  }
  async disconnect() {
    await super.disconnect();
    this.sendWebSocketDisconnectMessage();
  }

  /** @type {boolean} */
  get canReconnect() {
    return true;
  }
  async reconnect() {
    await super.reconnect();
    _console.log("attempting to reconnect...");
    this.connect();
  }

  sendWebSocketMessage!: SendWebSocketMessageCallback;
  sendWebSocketConnectMessage!: Function;
  sendWebSocketDisconnectMessage!: Function;

  async sendSmpMessage(data: ArrayBuffer) {
    super.sendSmpMessage(data);
    this.sendWebSocketMessage({ type: "smp", data });
  }

  async sendTxData(data: ArrayBuffer) {
    super.sendTxData(data);
    this.sendWebSocketMessage({ type: "tx", data });
  }

  static #DeviceInformationMessageTypes: ConnectionMessageType[] = [
    ...DeviceInformationManager.MessageTypes,
    "batteryLevel",
  ];
  get #deviceInformationMessageTypes() {
    return WebSocketClientConnectionManager.#DeviceInformationMessageTypes;
  }
  #requestDeviceInformation() {
    this.sendWebSocketMessage(...this.#deviceInformationMessageTypes);
  }

  /** @param {DataView} dataView */
  onWebSocketMessage(dataView: DataView) {
    _console.log({ dataView });
    parseMessage(dataView, Device.EventTypes, this.#onWebSocketMessageCallback.bind(this), null, true);
  }

  /**
   * @param {DeviceEventType} messageType
   * @param {DataView} dataView
   */
  #onWebSocketMessageCallback(messageType: DeviceEventType, dataView: DataView) {
    let byteOffset = 0;

    switch (messageType) {
      case "isConnected":
        const isConnected = Boolean(dataView.getUint8(byteOffset++));
        _console.log({ isConnected });
        this.isConnected = isConnected;
        break;

      case "rx":
        this.parseRxMessage(dataView);
        break;

      default:
        this.onMessageReceived(messageType, dataView);
        break;
    }
  }
}

export default WebSocketClientConnectionManager;