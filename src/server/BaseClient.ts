import { createConsole } from "../utils/Console";
import {
  ServerMessageTypes,
  pingTimeout,
  discoveredDevicesMessage,
  createServerMessage,
  ServerMessage,
  MessageLike,
  ClientDeviceMessage,
  createClientDeviceMessage,
  ServerMessageType,
} from "./ServerUtils";
import { parseMessage, parseStringFromDataView } from "../utils/ParseUtils";
import Timer from "../utils/Timer";
import EventDispatcher, { BoundEventListeners, Event, SpecificEvent } from "../utils/EventDispatcher";
import Device from "../Device";
import WebSocketClientConnectionManager from "../connection/webSocket/WebSocketClientConnectionManager";
import { sliceDataView } from "../utils/ArrayBufferUtils";
import { DiscoveredDevice, ScannerEventMessages } from "../scanner/BaseScanner";

const _console = createConsole("WebSocketClient", { log: true });

export const ClientConnectionStatuses = ["not connected", "connecting", "connected", "disconnecting"] as const;
export type ClientConnectionStatus = (typeof ClientConnectionStatuses)[number];

export const ClientEventTypes = [
  ...ClientConnectionStatuses,
  "connectionStatus",
  "isConnected",
  "isScanningAvailable",
  "isScanning",
  "discoveredDevice",
  "expiredDiscoveredDevice",
] as const;
export type ClientEventType = (typeof ClientEventTypes)[number];

interface ClientConnectionEventMessages {
  connectionStatus: { connectionStatus: ClientConnectionStatus };
  isConnected: { isConnected: boolean };
}

export type ClientEventMessages = ClientConnectionEventMessages & ScannerEventMessages;

export type ClientEventDispatcher = EventDispatcher<BaseClient, ClientEventType, ClientEventMessages>;
export type SpecificClientEvent<EventType extends ClientEventType> = SpecificEvent<
  BaseClient,
  ClientEventType,
  ClientEventMessages,
  EventType
>;
export type ClientEvent = Event<BaseClient, ClientEventType, ClientEventMessages>;
export type BoundClientEventListeners = BoundEventListeners<BaseClient, ClientEventType, ClientEventMessages>;

export type ServerURL = string | URL;

type DevicesMap = { [deviceId: string]: Device };
type DiscoveredDevicesMap = { [deviceId: string]: DiscoveredDevice };

abstract class BaseClient {
  get #baseConstructor() {
    return this.constructor as typeof BaseClient;
  }

  // DEVICES
  #devices: DevicesMap = {};
  get devices(): Readonly<DevicesMap> {
    return this.#devices;
  }

  #eventDispatcher: ClientEventDispatcher = new EventDispatcher(this as BaseClient, ClientEventTypes);
  get addEventListener() {
    return this.#eventDispatcher.addEventListener;
  }
  protected get dispatchEvent() {
    return this.#eventDispatcher.dispatchEvent;
  }
  get removeEventListener() {
    return this.#eventDispatcher.removeEventListener;
  }
  get waitForEvent() {
    return this.#eventDispatcher.waitForEvent;
  }

  abstract isConnected: boolean;
  protected assertConnection() {
    _console.assertWithError(this.isConnected, "not connected");
  }

  abstract isDisconnected: boolean;
  protected assertDisconnection() {
    _console.assertWithError(this.isDisconnected, "not disconnected");
  }

  abstract connect(): void;
  abstract disconnect(): void;
  abstract reconnect(): void;
  abstract toggleConnection(url?: ServerURL): void;

  static #ReconnectOnDisconnection = true;
  static get ReconnectOnDisconnection() {
    return this.#ReconnectOnDisconnection;
  }
  static set ReconnectOnDisconnection(newReconnectOnDisconnection) {
    _console.assertTypeWithError(newReconnectOnDisconnection, "boolean");
    this.#ReconnectOnDisconnection = newReconnectOnDisconnection;
  }

  #reconnectOnDisconnection = this.#baseConstructor.#ReconnectOnDisconnection;
  get reconnectOnDisconnection() {
    return this.#reconnectOnDisconnection;
  }
  set reconnectOnDisconnection(newReconnectOnDisconnection) {
    _console.assertTypeWithError(newReconnectOnDisconnection, "boolean");
    this.#reconnectOnDisconnection = newReconnectOnDisconnection;
  }

  protected sendServerMessage(...messages: ServerMessage[]) {
    this.sendMessage(createServerMessage(...messages));
  }
  abstract sendMessage(message: MessageLike): void;

  // CONNECTION STATUS
  #_connectionStatus: ClientConnectionStatus = "not connected";
  protected get _connectionStatus() {
    return this.#_connectionStatus;
  }
  protected set _connectionStatus(newConnectionStatus) {
    _console.assertTypeWithError(newConnectionStatus, "string");
    _console.log({ newConnectionStatus });
    this.#_connectionStatus = newConnectionStatus;

    this.dispatchEvent("connectionStatus", { connectionStatus: this.connectionStatus });
    this.dispatchEvent(this.connectionStatus, {});

    switch (newConnectionStatus) {
      case "connected":
      case "not connected":
        this.dispatchEvent("isConnected", { isConnected: this.isConnected });
        if (this.isConnected) {
          this.sendServerMessage("isScanningAvailable", "discoveredDevices", "connectedDevices");
        } else {
          this.#isScanningAvailable = false;
          this.#isScanning = false;
        }
        break;
    }
  }
  get connectionStatus() {
    return this._connectionStatus;
  }

  protected parseMessage(dataView: DataView) {
    _console.log("parseMessage", { dataView });
    parseMessage(dataView, ServerMessageTypes, this.#parseMessageCallback.bind(this), null, true);
  }

  #parseMessageCallback(messageType: ServerMessageType, dataView: DataView) {
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

          const discoveredDevice: DiscoveredDevice = JSON.parse(discoveredDeviceString);
          _console.log({ discoveredDevice });

          this.onDiscoveredDevice(discoveredDevice);
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
          this.onConnectedBluetoothDeviceIds(connectedBluetoothDeviceIds);
        }
        break;
      case "deviceMessage":
        {
          const { string: bluetoothId, byteOffset: _byteOffset } = parseStringFromDataView(dataView, byteOffset);
          byteOffset = _byteOffset;
          const device = this.#devices[bluetoothId];
          _console.assertWithError(device, `no device found for id ${bluetoothId}`);
          const connectionManager = device.connectionManager! as WebSocketClientConnectionManager;
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
  protected pingTimer = new Timer(this.#ping.bind(this), pingTimeout);
  #ping() {
    this.sendServerMessage("ping");
  }
  #pong() {
    this.sendServerMessage("pong");
  }

  // SCANNING
  #_isScanningAvailable = false;
  get #isScanningAvailable() {
    return this.#_isScanningAvailable;
  }
  set #isScanningAvailable(newIsAvailable) {
    _console.assertTypeWithError(newIsAvailable, "boolean");
    this.#_isScanningAvailable = newIsAvailable;
    this.dispatchEvent("isScanningAvailable", { isScanningAvailable: this.isScanningAvailable });
    if (this.isScanningAvailable) {
      this.#requestIsScanning();
    }
  }
  get isScanningAvailable() {
    return this.#isScanningAvailable;
  }
  #assertIsScanningAvailable() {
    this.assertConnection();
    _console.assertWithError(this.isScanningAvailable, "scanning is not available");
  }
  protected requestIsScanningAvailable() {
    this.sendServerMessage("isScanningAvailable");
  }

  #_isScanning = false;
  get #isScanning() {
    return this.#_isScanning;
  }
  set #isScanning(newIsScanning) {
    _console.assertTypeWithError(newIsScanning, "boolean");
    this.#_isScanning = newIsScanning;
    this.dispatchEvent("isScanning", { isScanning: this.isScanning });
  }
  get isScanning() {
    return this.#isScanning;
  }
  #requestIsScanning() {
    this.sendServerMessage("isScanning");
  }

  #assertIsScanning() {
    _console.assertWithError(this.isScanning, "is not scanning");
  }
  #assertIsNotScanning() {
    _console.assertWithError(!this.isScanning, "is already scanning");
  }

  startScan() {
    this.#assertIsNotScanning();
    this.sendServerMessage("startScan");
  }
  stopScan() {
    this.#assertIsScanning();
    this.sendServerMessage("stopScan");
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
  #discoveredDevices: DiscoveredDevicesMap = {};
  get discoveredDevices(): Readonly<DiscoveredDevicesMap> {
    return this.#discoveredDevices;
  }

  protected onDiscoveredDevice(discoveredDevice: DiscoveredDevice) {
    _console.log({ discoveredDevice });
    this.#discoveredDevices[discoveredDevice.bluetoothId] = discoveredDevice;
    this.dispatchEvent("discoveredDevice", { discoveredDevice });
  }
  requestDiscoveredDevices() {
    this.sendMessage(discoveredDevicesMessage);
  }
  #onExpiredDiscoveredDevice(bluetoothId: string) {
    _console.log({ expiredBluetoothDeviceId: bluetoothId });
    const discoveredDevice = this.#discoveredDevices[bluetoothId];
    if (!discoveredDevice) {
      _console.warn(`no discoveredDevice found with id "${bluetoothId}"`);
      return;
    }
    _console.log({ expiredDiscoveredDevice: discoveredDevice });
    delete this.#discoveredDevices[bluetoothId];
    this.dispatchEvent("expiredDiscoveredDevice", { discoveredDevice });
  }

  // DEVICE CONNECTION
  connectToDevice(bluetoothId: string) {
    return this.requestConnectionToDevice(bluetoothId);
  }
  protected requestConnectionToDevice(bluetoothId: string) {
    this.assertConnection();
    _console.assertTypeWithError(bluetoothId, "string");
    const device = this.#getOrCreateDevice(bluetoothId);
    device.connect();
    return device;
  }
  protected sendConnectToDeviceMessage(bluetoothId: string) {
    this.sendMessage(this.createConnectToDeviceMessage(bluetoothId));
  }
  protected createConnectToDeviceMessage(bluetoothId: string) {
    return createServerMessage({ type: "connectToDevice", data: bluetoothId });
  }

  abstract createDevice(bluetoothId: string): Device;

  #getOrCreateDevice(bluetoothId: string) {
    let device = this.#devices[bluetoothId];
    if (!device) {
      device = this.createDevice(bluetoothId);
      this.#devices[bluetoothId] = device;
    }
    return device;
  }
  protected onConnectedBluetoothDeviceIds(bluetoothIds: string[]) {
    _console.log({ bluetoothIds });
    bluetoothIds.forEach((bluetoothId) => {
      const device = this.#getOrCreateDevice(bluetoothId);
      const connectionManager = device.connectionManager! as WebSocketClientConnectionManager;
      connectionManager.isConnected = true;
    });
  }

  disconnectFromDevice(bluetoothId: string) {
    this.requestDisconnectionFromDevice(bluetoothId);
  }
  protected requestDisconnectionFromDevice(bluetoothId: string) {
    this.assertConnection();
    _console.assertTypeWithError(bluetoothId, "string");
    const device = this.devices[bluetoothId];
    _console.assertWithError(device, `no device found with id ${bluetoothId}`);
    device.disconnect();
    return device;
  }
  protected sendDisconnectFromDeviceMessage(bluetoothId: string) {
    this.sendMessage(this.#createDisconnectFromDeviceMessage(bluetoothId));
  }
  #createDisconnectFromDeviceMessage(bluetoothId: string) {
    return createServerMessage({ type: "disconnectFromDevice", data: bluetoothId });
  }

  protected sendDeviceMessage(bluetoothId: string, ...messages: ClientDeviceMessage[]) {
    this.sendMessage(this.createDeviceMessage(bluetoothId, ...messages));
  }

  createDeviceMessage(bluetoothId: string, ...messages: ClientDeviceMessage[]) {
    return createServerMessage({
      type: "deviceMessage",
      data: [bluetoothId, createClientDeviceMessage(...messages)],
    });
  }
}

export default BaseClient;