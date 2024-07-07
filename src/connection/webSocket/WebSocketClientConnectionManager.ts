import { createConsole } from "../../utils/Console";
import { isInBrowser } from "../../utils/environment";
import BaseConnectionManager from "../BaseConnectionManager";
import Device from "../../Device";
import { parseMessage } from "../../utils/ParseUtils";
import DeviceInformationManager from "../../DeviceInformationManager";

const _console = createConsole("WebSocketClientConnectionManager", { log: true });

/** @typedef {import("../BaseConnectionManager").ConnectionMessageType} ConnectionMessageType */
/** @typedef {import("../BaseConnectionManager").ConnectionType} ConnectionType */

/** @typedef {import("../../server/websocket/WebSocketClient").WebSocketClient} WebSocketClient */
/** @typedef {import("../../Device").DeviceEventType} DeviceEventType */

/** @typedef {import("../../server/ServerUtils").ClientDeviceMessage} ClientDeviceMessage */

class WebSocketClientConnectionManager extends BaseConnectionManager {
  static get isSupported() {
    return isInBrowser;
  }
  /** @type {ConnectionType} */
  static get type() {
    return "webSocketClient";
  }

  /** @type {string?} */
  #bluetoothId;
  get bluetoothId() {
    return this.#bluetoothId;
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

  /**
   * @callback SendWebSocketMessageCallback
   * @param {...(ConnectionMessageType|ClientDeviceMessage)} messages
   */

  /** @type {SendWebSocketMessageCallback?} */
  sendWebSocketMessage;
  /** @type {function?} */
  sendWebSocketConnectMessage;
  /** @type {function?} */
  sendWebSocketDisconnectMessage;

  /** @param {ArrayBuffer} data */
  async sendSmpMessage(data) {
    super.sendSmpMessage(...arguments);
    this.sendWebSocketMessage({ type: "smp", data });
  }

  /** @param {ArrayBuffer} data */
  async sendTxData(data) {
    super.sendTxData(...arguments);
    this.sendWebSocketMessage({ type: "tx", data });
  }

  /** @type {ConnectionMessageType[]} */
  static #DeviceInformationMessageTypes = [...DeviceInformationManager.MessageTypes, "batteryLevel"];
  get #deviceInformationMessageTypes() {
    return WebSocketClientConnectionManager.#DeviceInformationMessageTypes;
  }
  #requestDeviceInformation() {
    this.sendWebSocketMessage(...this.#deviceInformationMessageTypes);
  }

  /** @param {DataView} dataView */
  onWebSocketMessage(dataView) {
    _console.log({ dataView });
    parseMessage(dataView, Device.EventTypes, this.#onWebSocketMessageCallback.bind(this), null, true);
  }

  /**
   * @param {DeviceEventType} messageType
   * @param {DataView} dataView
   */
  #onWebSocketMessageCallback(messageType, dataView) {
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
