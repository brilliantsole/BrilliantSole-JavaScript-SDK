import { createConsole } from "../../utils/Console.js";
import {
  ServerMessageTypes,
  pingTimeout,
  reconnectTimeout,
  discoveredDevicesMessage,
  createServerMessage,
  createClientDeviceMessage,
} from "../ServerUtils.js";
import { parseMessage, parseStringFromDataView } from "../../utils/ParseUtils.js";
import { addEventListeners, removeEventListeners } from "../../utils/EventDispatcher.js";
import Timer from "../../utils/Timer.js";
import EventDispatcher from "../../utils/EventDispatcher.js";
import Device from "../../Device.js";
import WebSocketClientConnectionManager from "../../connection/webSocket/WebSocketClientConnectionManager.js";
import { sliceDataView } from "../../utils/ArrayBufferUtils.js";

const _console = createConsole("WebSocketClient", { log: true });

/** @typedef {import("../../utils/EventDispatcher.js").EventDispatcherListener} EventDispatcherListener */
/** @typedef {import("../../utils/EventDispatcher.js").EventDispatcherOptions} EventDispatcherOptions */

/** @typedef {"not connected" | "connecting" | "connected" | "disconnecting"} ClientConnectionStatus */
/** @typedef {ClientConnectionStatus | "connectionStatus" |  "isConnected" | "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice"} ClientEventType */

/**
 * @typedef ClientEvent
 * @type {Object}
 * @property {WebSocketClient} target
 * @property {ClientEventType} type
 * @property {Object} message
 */

/** @typedef {import("./WebSocketServer.js").DiscoveredDevice} DiscoveredDevice */

class WebSocketClient {
  // EVENT DISPATCHER

  /** @type {ClientEventType[]} */
  static #EventTypes = [
    "connectionStatus",
    "connecting",
    "connected",
    "disconnecting",
    "not connected",
    "isConnected",
    "isScanningAvailable",
    "isScanning",
    "discoveredDevice",
    "expiredDiscoveredDevice",
  ];
  static get EventTypes() {
    return this.#EventTypes;
  }
  get eventTypes() {
    return WebSocketClient.#EventTypes;
  }
  #eventDispatcher = new EventDispatcher(this, this.eventTypes);

  /**
   * @param {ClientEventType} type
   * @param {EventDispatcherListener} listener
   * @param {EventDispatcherOptions} [options]
   */
  addEventListener(type, listener, options) {
    this.#eventDispatcher.addEventListener(type, listener, options);
  }

  /**
   * @param {ClientEvent} event
   */
  #dispatchEvent(event) {
    this.#eventDispatcher.dispatchEvent(event);
  }

  /**
   * @param {ClientEventType} type
   * @param {EventDispatcherListener} listener
   */
  removeEventListener(type, listener) {
    return this.#eventDispatcher.removeEventListener(type, listener);
  }

  // WEBSOCKET

  /** @type {WebSocket?} */
  #webSocket;
  get webSocket() {
    return this.#webSocket;
  }
  set webSocket(newWebSocket) {
    if (this.#webSocket == newWebSocket) {
      _console.log("redundant webSocket assignment");
      return;
    }

    _console.log("assigning webSocket", newWebSocket);

    if (this.#webSocket) {
      removeEventListeners(this.#webSocket, this.#boundWebSocketEventListeners);
    }

    addEventListeners(newWebSocket, this.#boundWebSocketEventListeners);
    this.#webSocket = newWebSocket;

    _console.log("assigned webSocket");
  }

  get isConnected() {
    return this.webSocket?.readyState == WebSocket.OPEN;
  }
  #assertConnection() {
    _console.assertWithError(this.isConnected, "not connected");
  }

  get isDisconnected() {
    return this.webSocket?.readyState == WebSocket.CLOSED;
  }
  #assertDisconnection() {
    _console.assertWithError(this.isDisconnected, "not disconnected");
  }

  /** @param {(string | URL)?} url */
  connect(url = `wss://${location.host}`) {
    if (this.webSocket) {
      this.#assertDisconnection();
    }
    this.#connectionStatus = "connecting";
    this.webSocket = new WebSocket(url);
  }

  disconnect() {
    this.#assertConnection();
    if (this.reconnectOnDisconnection) {
      this.reconnectOnDisconnection = false;
      this.webSocket.addEventListener(
        "close",
        () => {
          this.reconnectOnDisconnection = true;
        },
        { once: true }
      );
    }
    this.#connectionStatus = "disconnecting";
    this.webSocket.close();
  }

  reconnect() {
    this.#assertDisconnection();
    this.webSocket = new WebSocket(this.webSocket.url);
  }

  /** @param {(string | URL)?} url */
  toggleConnection(url) {
    if (this.isConnected) {
      this.disconnect();
    } else if (this.webSocket) {
      this.reconnect();
    } else {
      this.connect(url);
    }
  }

  static #ReconnectOnDisconnection = true;
  static get ReconnectOnDisconnection() {
    return this.#ReconnectOnDisconnection;
  }
  static set ReconnectOnDisconnection(newReconnectOnDisconnection) {
    _console.assertTypeWithError(newReconnectOnDisconnection, "boolean");
    this.#ReconnectOnDisconnection = newReconnectOnDisconnection;
  }

  #reconnectOnDisconnection = WebSocketClient.#ReconnectOnDisconnection;
  get reconnectOnDisconnection() {
    return this.#reconnectOnDisconnection;
  }
  set reconnectOnDisconnection(newReconnectOnDisconnection) {
    _console.assertTypeWithError(newReconnectOnDisconnection, "boolean");
    this.#reconnectOnDisconnection = newReconnectOnDisconnection;
  }

  // WEBSOCKET MESSAGING

  /** @typedef {import("../ServerUtils.js").MessageLike} MessageLike */

  /** @param  {MessageLike} message */
  #sendWebSocketMessage(message) {
    this.#assertConnection();
    this.#webSocket.send(message);
  }

  /** @typedef {import("../ServerUtils.js").ServerMessage} ServerMessage */
  /** @typedef {import("../ServerUtils.js").ServerMessageType} ServerMessageType */

  /** @param {...ServerMessage | ServerMessageType} messages */
  #sendServerMessage(...messages) {
    this.#sendWebSocketMessage(createServerMessage(...messages));
  }

  // WEBSOCKET EVENTS

  #boundWebSocketEventListeners = {
    open: this.#onWebSocketOpen.bind(this),
    message: this.#onWebSocketMessage.bind(this),
    close: this.#onWebSocketClose.bind(this),
    error: this.#onWebSocketError.bind(this),
  };

  /** @param {Event} event */
  #onWebSocketOpen(event) {
    _console.log("webSocket.open", event);
    this.#pingTimer.start();
    this.#connectionStatus = "connected";
  }
  /** @param {import("ws").MessageEvent} event */
  async #onWebSocketMessage(event) {
    _console.log("webSocket.message", event);
    this.#pingTimer.restart();
    const arrayBuffer = await event.data.arrayBuffer();
    const dataView = new DataView(arrayBuffer);
    this.#parseMessage(dataView);
  }
  /** @param {import("ws").CloseEvent} event  */
  #onWebSocketClose(event) {
    _console.log("webSocket.close", event);

    this.#connectionStatus = "not connected";

    Object.entries(this.devices).forEach(([id, device]) => {
      /** @type {WebSocketClientConnectionManager} */
      const connectionManager = device.connectionManager;
      connectionManager.isConnected = false;
    });

    this.#pingTimer.stop();
    if (this.#reconnectOnDisconnection) {
      setTimeout(() => {
        this.reconnect();
      }, reconnectTimeout);
    }
  }
  /** @param {Event} event */
  #onWebSocketError(event) {
    _console.log("webSocket.error", event);
  }

  // CONNECTION STATUS

  /** @type {ClientConnectionStatus} */
  #_connectionStatus = "not connected";
  get #connectionStatus() {
    return this.#_connectionStatus;
  }
  set #connectionStatus(newConnectionStatus) {
    _console.assertTypeWithError(newConnectionStatus, "string");
    _console.log({ newConnectionStatus });
    this.#_connectionStatus = newConnectionStatus;

    this.#dispatchEvent({ type: "connectionStatus", message: { connectionStatus: this.connectionStatus } });
    this.#dispatchEvent({ type: this.connectionStatus });

    switch (newConnectionStatus) {
      case "connected":
      case "not connected":
        this.#dispatchEvent({ type: "isConnected", message: { isConnected: this.isConnected } });
        if (this.isConnected) {
          this.#sendServerMessage("isScanningAvailable", "discoveredDevices", "connectedDevices");
        } else {
          this.#isScanningAvailable = false;
          this.#isScanning = false;
        }
        break;
    }
  }
  get connectionStatus() {
    return this.#connectionStatus;
  }

  /** @param {DataView} dataView */
  #parseMessage(dataView) {
    _console.log("parseMessage", { dataView });
    parseMessage(dataView, ServerMessageTypes, this.#parseMessageCallback.bind(this), null, true);
  }

  /**
   * @param {ServerMessageType} messageType
   * @param {DataView} dataView
   */
  #parseMessageCallback(messageType, dataView) {
    let byteOffset = 0;

    switch (messageType) {
      case "ping":
        this.#pong();
        break;
      case "pong":
        break;
      case "isScanningAvailable":
        {
          const isScanningAvailable = Boolean(dataView.getUint8(byteOffset++));
          _console.log({ isScanningAvailable });
          this.#isScanningAvailable = isScanningAvailable;
        }
        break;
      case "isScanning":
        {
          const isScanning = Boolean(dataView.getUint8(byteOffset++));
          _console.log({ isScanning });
          this.#isScanning = isScanning;
        }
        break;
      case "discoveredDevice":
        {
          const { string: discoveredDeviceString } = parseStringFromDataView(dataView, byteOffset);
          _console.log({ discoveredDeviceString });

          /** @type {DiscoveredDevice} */
          const discoveredDevice = JSON.parse(discoveredDeviceString);
          _console.log({ discoveredDevice });

          this.#onDiscoveredDevice(discoveredDevice);
        }
        break;
      case "expiredDiscoveredDevice":
        {
          const { string: bluetoothId } = parseStringFromDataView(dataView, byteOffset);
          this.#onExpiredDiscoveredDevice(bluetoothId);
        }
        break;
      case "connectedDevices":
        {
          if (dataView.byteLength == 0) {
            break;
          }
          const { string: connectedBluetoothDeviceIdStrings } = parseStringFromDataView(dataView, byteOffset);
          _console.log({ connectedBluetoothDeviceIdStrings });
          const connectedBluetoothDeviceIds = JSON.parse(connectedBluetoothDeviceIdStrings);
          _console.log({ connectedBluetoothDeviceIds });
          this.#onConnectedBluetoothDeviceIds(connectedBluetoothDeviceIds);
        }
        break;
      case "deviceMessage":
        {
          const { string: bluetoothId, byteOffset: _byteOffset } = parseStringFromDataView(dataView, byteOffset);
          byteOffset = _byteOffset;
          const device = this.#devices[bluetoothId];
          _console.assertWithError(device, `no device found for id ${bluetoothId}`);
          /** @type {WebSocketClientConnectionManager} */
          const connectionManager = device.connectionManager;
          const _dataView = sliceDataView(dataView, byteOffset);
          connectionManager.onWebSocketMessage(_dataView);
        }
        break;
      default:
        _console.error(`uncaught messageType "${messageType}"`);
        break;
    }
  }

  // PING
  #pingTimer = new Timer(this.#ping.bind(this), pingTimeout);
  #ping() {
    this.#sendServerMessage("ping");
  }
  #pong() {
    this.#sendServerMessage("pong");
  }

  // SCANNING
  #_isScanningAvailable = false;
  get #isScanningAvailable() {
    return this.#_isScanningAvailable;
  }
  set #isScanningAvailable(newIsAvailable) {
    _console.assertTypeWithError(newIsAvailable, "boolean");
    this.#_isScanningAvailable = newIsAvailable;
    this.#dispatchEvent({
      type: "isScanningAvailable",
      message: { isScanningAvailable: this.isScanningAvailable },
    });
    if (this.isScanningAvailable) {
      this.#requestIsScanning();
    }
  }
  get isScanningAvailable() {
    return this.#isScanningAvailable;
  }
  #assertIsScanningAvailable() {
    this.#assertConnection();
    _console.assertWithError(this.isScanningAvailable, "scanning is not available");
  }
  #requestIsScanningAvailable() {
    this.#sendServerMessage("isScanningAvailable");
  }

  #_isScanning = false;
  get #isScanning() {
    return this.#_isScanning;
  }
  set #isScanning(newIsScanning) {
    _console.assertTypeWithError(newIsScanning, "boolean");
    this.#_isScanning = newIsScanning;
    this.#dispatchEvent({ type: "isScanning", message: { isScanning: this.isScanning } });
  }
  get isScanning() {
    return this.#isScanning;
  }
  #requestIsScanning() {
    this.#sendServerMessage("isScanning");
  }

  #assertIsScanning() {
    _console.assertWithError(this.isScanning, "is not scanning");
  }
  #assertIsNotScanning() {
    _console.assertWithError(!this.isScanning, "is already scanning");
  }

  startScan() {
    this.#assertIsNotScanning();
    this.#sendServerMessage("startScan");
  }
  stopScan() {
    this.#assertIsScanning();
    this.#sendServerMessage("stopScan");
  }
  toggleScan() {
    this.#assertIsScanningAvailable();

    if (this.isScanning) {
      this.stopScan();
    } else {
      this.startScan();
    }
  }

  // PERIPHERALS
  /** @type {Object.<string, DiscoveredDevice>} */
  #discoveredDevices = {};
  get discoveredDevices() {
    return this.#discoveredDevices;
  }

  /** @param {DiscoveredDevice} discoveredDevice */
  #onDiscoveredDevice(discoveredDevice) {
    _console.log({ discoveredDevice });
    this.#discoveredDevices[discoveredDevice.bluetoothId] = discoveredDevice;
    this.#dispatchEvent({ type: "discoveredDevice", message: { discoveredDevice } });
  }
  #requestDiscoveredDevices() {
    this.#sendWebSocketMessage(discoveredDevicesMessage);
  }
  /** @param {string} bluetoothId */
  #onExpiredDiscoveredDevice(bluetoothId) {
    _console.log({ expiredBluetoothDeviceId: bluetoothId });
    const discoveredDevice = this.#discoveredDevices[bluetoothId];
    if (!discoveredDevice) {
      _console.warn(`no discoveredDevice found with id "${bluetoothId}"`);
      return;
    }
    _console.log({ expiredDiscoveredDevice: discoveredDevice });
    delete this.#discoveredDevices[bluetoothId];
    this.#dispatchEvent({ type: "expiredDiscoveredDevice", message: { discoveredDevice } });
  }

  // DEVICE CONNECTION

  /** @param {string} bluetoothId */
  connectToDevice(bluetoothId) {
    return this.#requestConnectionToDevice(bluetoothId);
  }
  /** @param {string} bluetoothId */
  #requestConnectionToDevice(bluetoothId) {
    this.#assertConnection();
    _console.assertTypeWithError(bluetoothId, "string");
    const device = this.#getOrCreateDevice(bluetoothId);
    device.connect();
    return device;
  }
  /** @param {string} bluetoothId */
  #sendConnectToDeviceMessage(bluetoothId) {
    this.#sendWebSocketMessage(this.#createConnectToDeviceMessage(bluetoothId));
  }
  /** @param {string} bluetoothId */
  #createConnectToDeviceMessage(bluetoothId) {
    return createServerMessage({ type: "connectToDevice", data: bluetoothId });
  }

  /** @param {string} bluetoothId */
  #createDevice(bluetoothId) {
    const device = new Device();
    const clientConnectionManager = new WebSocketClientConnectionManager();
    clientConnectionManager.bluetoothId = bluetoothId;
    clientConnectionManager.sendWebSocketMessage = this.#sendDeviceMessage.bind(this, bluetoothId);
    clientConnectionManager.sendWebSocketConnectMessage = this.#sendConnectToDeviceMessage.bind(this, bluetoothId);
    clientConnectionManager.sendWebSocketDisconnectMessage = this.#sendDisconnectFromDeviceMessage.bind(
      this,
      bluetoothId
    );
    device.connectionManager = clientConnectionManager;
    return device;
  }

  /** @param {string} bluetoothId */
  #getOrCreateDevice(bluetoothId) {
    let device = this.#devices[bluetoothId];
    if (!device) {
      device = this.#createDevice(bluetoothId);
      this.#devices[bluetoothId] = device;
    }
    return device;
  }
  /** @param {string[]} bluetoothIds */
  #onConnectedBluetoothDeviceIds(bluetoothIds) {
    _console.log({ bluetoothIds });
    bluetoothIds.forEach((bluetoothId) => {
      const device = this.#getOrCreateDevice(bluetoothId);
      /** @type {WebSocketClientConnectionManager} */
      const connectionManager = device.connectionManager;
      connectionManager.isConnected = true;
    });
  }

  /** @param {string} bluetoothId */
  disconnectFromDevice(bluetoothId) {
    this.#requestDisconnectionFromDevice(bluetoothId);
  }
  /** @param {string} bluetoothId */
  #requestDisconnectionFromDevice(bluetoothId) {
    this.#assertConnection();
    _console.assertTypeWithError(bluetoothId, "string");
    const device = this.devices[bluetoothId];
    _console.assertWithError(device, `no device found with id ${bluetoothId}`);
    device.disconnect();
    return device;
  }
  /** @param {string} bluetoothId */
  #sendDisconnectFromDeviceMessage(bluetoothId) {
    this.#sendWebSocketMessage(this.#createDisconnectFromDeviceMessage(bluetoothId));
  }
  /** @param {string} bluetoothId */
  #createDisconnectFromDeviceMessage(bluetoothId) {
    return createServerMessage({ type: "disconnectFromDevice", data: bluetoothId });
  }

  /** @typedef {import("../../connection/BaseConnectionManager.js").ConnectionMessageType} ConnectionMessageType */
  /** @typedef {import("../ServerUtils.js").ClientDeviceMessage} ClientDeviceMessage */

  /**
   * @param {string} bluetoothId
   * @param {...(ConnectionMessageType|ClientDeviceMessage)} messages
   */
  #sendDeviceMessage(bluetoothId, ...messages) {
    this.#sendWebSocketMessage(this.#createDeviceMessage(bluetoothId, ...messages));
  }

  /**
   * @param {string} bluetoothId
   * @param {...(ConnectionMessageType|ClientDeviceMessage)} messages
   */
  #createDeviceMessage(bluetoothId, ...messages) {
    return createServerMessage({
      type: "deviceMessage",
      data: [bluetoothId, createClientDeviceMessage(...messages)],
    });
  }

  // DEVICES
  /** @type {Object.<string, Device>} */
  #devices = {};
  get devices() {
    return this.#devices;
  }
}

/** @typedef {WebSocketClient} WebSocketClient */

export default WebSocketClient;
