import { createConsole } from "../utils/Console.ts";
import {
  ServerMessageTypes,
  discoveredDevicesMessage,
  ServerMessage,
  MessageLike,
  ClientDeviceMessage,
  createClientDeviceMessage,
  ServerMessageType,
} from "./ServerUtils.ts";
import { parseMessage, parseStringFromDataView } from "../utils/ParseUtils.ts";
import EventDispatcher, {
  BoundEventListeners,
  Event,
} from "../utils/EventDispatcher.ts";
import Device from "../Device.ts";
import {
  concatenateArrayBuffers,
  sliceDataView,
  stringToArrayBuffer,
} from "../utils/ArrayBufferUtils.ts";
import {
  DiscoveredDevice,
  DiscoveredDevicesMap,
  ScannerEventMessages,
} from "../scanner/BaseScanner.ts";
import ClientConnectionManager from "../connection/ClientConnectionManager.ts";
import { DeviceManager } from "../BS.ts";
import {
  ClientConnectionType,
  ConnectionTypes,
} from "../connection/BaseConnectionManager.ts";

const _console = createConsole("BaseClient", { log: false });

export const ClientConnectionStatuses = [
  "notConnected",
  "connecting",
  "connected",
  "disconnecting",
] as const;
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

export type ClientEventMessages = ClientConnectionEventMessages &
  ScannerEventMessages;

export type ClientEventDispatcher = EventDispatcher<
  BaseClient,
  ClientEventType,
  ClientEventMessages
>;
export type ClientEvent = Event<
  BaseClient,
  ClientEventType,
  ClientEventMessages
>;
export type BoundClientEventListeners = BoundEventListeners<
  BaseClient,
  ClientEventType,
  ClientEventMessages
>;

export type ServerURL = string | URL;

type DevicesMap = { [deviceId: string]: Device };

abstract class BaseClient {
  protected get baseConstructor() {
    return this.constructor as typeof BaseClient;
  }

  #reset() {
    this.#isScanningAvailable = false;
    this.#isScanning = false;
    for (const id in this.#devices) {
      const device = this.#devices[id];
      const connectionManager =
        device.connectionManager! as ClientConnectionManager;
      connectionManager.isConnected = false;
      //device.removeAllEventListeners();
    }
    this.#receivedMessageTypes.length = 0;
    //this.#devices = {};
  }

  // DEVICES
  #devices: DevicesMap = {};
  get devices(): Readonly<DevicesMap> {
    return this.#devices;
  }

  #eventDispatcher: ClientEventDispatcher = new EventDispatcher(
    this as BaseClient,
    ClientEventTypes
  );
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
    _console.assertWithError(this.isConnected, "notConnected");
  }

  abstract isDisconnected: boolean;
  protected assertDisconnection() {
    _console.assertWithError(this.isDisconnected, "not disconnected");
  }

  abstract connect(): void;
  abstract disconnect(): void;
  abstract reconnect(): void;
  abstract toggleConnection(url?: ServerURL): void;

  static _reconnectOnDisconnection = true;
  static get ReconnectOnDisconnection() {
    return this._reconnectOnDisconnection;
  }
  static set ReconnectOnDisconnection(newReconnectOnDisconnection) {
    _console.assertTypeWithError(newReconnectOnDisconnection, "boolean");
    this._reconnectOnDisconnection = newReconnectOnDisconnection;
  }

  protected _reconnectOnDisconnection =
    this.baseConstructor.ReconnectOnDisconnection;
  get reconnectOnDisconnection() {
    return this._reconnectOnDisconnection;
  }
  set reconnectOnDisconnection(newReconnectOnDisconnection) {
    _console.assertTypeWithError(newReconnectOnDisconnection, "boolean");
    this._reconnectOnDisconnection = newReconnectOnDisconnection;
  }

  abstract sendServerMessage(...messages: ServerMessage[]): void;

  // CONNECTION STATUS
  #_connectionStatus: ClientConnectionStatus = "notConnected";
  protected get _connectionStatus() {
    return this.#_connectionStatus;
  }
  protected set _connectionStatus(newConnectionStatus) {
    _console.assertTypeWithError(newConnectionStatus, "string");
    _console.log({ newConnectionStatus });
    this.#_connectionStatus = newConnectionStatus;

    this.dispatchEvent("connectionStatus", {
      connectionStatus: this.connectionStatus,
    });
    this.dispatchEvent(this.connectionStatus, {});

    switch (newConnectionStatus) {
      case "connected":
      case "notConnected":
        this.dispatchEvent("isConnected", { isConnected: this.isConnected });
        if (this.isConnected) {
          // this._sendRequiredMessages();
        } else {
          this.#reset();
        }
        break;
    }
  }
  get connectionStatus() {
    return this._connectionStatus;
  }

  static #RequiredMessageTypes: ServerMessage[] = [
    "isScanningAvailable",
    "discoveredDevices",
    "connectedDevices",
  ];
  get #requiredMessageTypes(): ServerMessage[] {
    return BaseClient.#RequiredMessageTypes;
  }
  protected _sendRequiredMessages() {
    _console.log("sending required messages", this.#receivedMessageTypes);
    this.sendServerMessage(...this.#requiredMessageTypes);
  }

  #receivedMessageTypes: ServerMessage[] = [];
  #checkIfFullyConnected() {
    if (this.connectionStatus != "connecting") {
      return;
    }
    _console.log("checking if fully connected...");

    if (!this.#receivedMessageTypes.includes("isScanningAvailable")) {
      _console.log("not fully connected - didn't receive isScanningAvailable");
      return;
    }

    if (this.isScanningAvailable) {
      if (!this.#receivedMessageTypes.includes("isScanning")) {
        _console.log("not fully connected - didn't receive isScanning");
        return;
      }
    }

    _console.log("fully connected");
    this._connectionStatus = "connected";
  }

  protected parseMessage(dataView: DataView) {
    _console.log("parseMessage", { dataView });
    parseMessage(
      dataView,
      ServerMessageTypes,
      this.#parseMessageCallback.bind(this),
      null,
      true
    );
    this.#checkIfFullyConnected();
  }

  #parseMessageCallback(messageType: ServerMessageType, dataView: DataView) {
    let byteOffset = 0;

    _console.log({ messageType }, dataView);

    switch (messageType) {
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
          const { string: discoveredDeviceString } = parseStringFromDataView(
            dataView,
            byteOffset
          );
          _console.log({ discoveredDeviceString });

          const discoveredDevice: DiscoveredDevice = JSON.parse(
            discoveredDeviceString
          );
          _console.log({ discoveredDevice });

          this.onDiscoveredDevice(discoveredDevice);
        }
        break;
      case "expiredDiscoveredDevice":
        {
          const { string: bluetoothId } = parseStringFromDataView(
            dataView,
            byteOffset
          );
          this.#onExpiredDiscoveredDevice(bluetoothId);
        }
        break;
      case "connectedDevices":
        {
          if (dataView.byteLength == 0) {
            break;
          }
          const { string: connectedBluetoothDeviceIdStrings } =
            parseStringFromDataView(dataView, byteOffset);
          _console.log({ connectedBluetoothDeviceIdStrings });
          const connectedBluetoothDeviceIds = JSON.parse(
            connectedBluetoothDeviceIdStrings
          ).connectedDevices;
          _console.log({ connectedBluetoothDeviceIds });
          this.onConnectedBluetoothDeviceIds(connectedBluetoothDeviceIds);
        }
        break;
      case "deviceMessage":
        {
          const { string: bluetoothId, byteOffset: _byteOffset } =
            parseStringFromDataView(dataView, byteOffset);
          byteOffset = _byteOffset;
          const device = this.#devices[bluetoothId];
          _console.assertWithError(
            device,
            `no device found for id ${bluetoothId}`
          );
          const connectionManager =
            device.connectionManager! as ClientConnectionManager;
          const _dataView = sliceDataView(dataView, byteOffset);
          connectionManager.onClientMessage(_dataView);
        }
        break;
      default:
        _console.error(`uncaught messageType "${messageType}"`);
        break;
    }

    if (this.connectionStatus == "connecting") {
      this.#receivedMessageTypes.push(messageType);
    }
  }

  // SCANNING
  #_isScanningAvailable = false;
  get #isScanningAvailable() {
    return this.#_isScanningAvailable;
  }
  set #isScanningAvailable(newIsAvailable) {
    _console.assertTypeWithError(newIsAvailable, "boolean");
    this.#_isScanningAvailable = newIsAvailable;
    this.dispatchEvent("isScanningAvailable", {
      isScanningAvailable: this.isScanningAvailable,
    });
    if (this.isScanningAvailable) {
      this.#requestIsScanning();
    }
  }
  get isScanningAvailable() {
    return this.#isScanningAvailable;
  }
  #assertIsScanningAvailable() {
    this.assertConnection();
    _console.assertWithError(
      this.isScanningAvailable,
      "scanning is not available"
    );
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
    this.sendServerMessage({ type: "discoveredDevices" });
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
  connectToDevice(bluetoothId: string, connectionType?: ClientConnectionType) {
    return this.requestConnectionToDevice(bluetoothId, connectionType);
  }
  protected requestConnectionToDevice(
    bluetoothId: string,
    connectionType?: ClientConnectionType
  ) {
    this.assertConnection();
    _console.assertTypeWithError(bluetoothId, "string");
    const device = this.#getOrCreateDevice(bluetoothId);
    if (connectionType) {
      device.connect({ type: "client", subType: connectionType });
    } else {
      device.connect();
    }
    return device;
  }
  protected sendConnectToDeviceMessage(
    bluetoothId: string,
    connectionType?: ClientConnectionType
  ) {
    if (connectionType) {
      this.sendServerMessage({
        type: "connectToDevice",
        data: concatenateArrayBuffers(
          stringToArrayBuffer(bluetoothId),
          ConnectionTypes.indexOf(connectionType)
        ),
      });
    } else {
      this.sendServerMessage({ type: "connectToDevice", data: bluetoothId });
    }
  }

  // DEVICE CONNECTION
  createDevice(bluetoothId: string) {
    const device = new Device();
    const discoveredDevice = this.#discoveredDevices[bluetoothId];
    const clientConnectionManager = new ClientConnectionManager();
    clientConnectionManager.discoveredDevice = Object.assign(
      {},
      discoveredDevice
    );
    clientConnectionManager.client = this;
    clientConnectionManager.bluetoothId = bluetoothId;
    clientConnectionManager.sendClientMessage = this.sendDeviceMessage.bind(
      this,
      bluetoothId
    );
    clientConnectionManager.sendRequiredDeviceInformationMessage =
      this.sendRequiredDeviceInformationMessage.bind(this, bluetoothId);
    clientConnectionManager.sendClientConnectMessage =
      this.sendConnectToDeviceMessage.bind(this, bluetoothId);
    clientConnectionManager.sendClientDisconnectMessage =
      this.sendDisconnectFromDeviceMessage.bind(this, bluetoothId);
    device.connectionManager = clientConnectionManager;
    return device;
  }

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
      const connectionManager =
        device.connectionManager! as ClientConnectionManager;
      connectionManager.isConnected = true;
      DeviceManager._CheckDeviceAvailability(device);
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
    this.sendServerMessage({ type: "disconnectFromDevice", data: bluetoothId });
  }

  protected sendDeviceMessage(
    bluetoothId: string,
    ...messages: ClientDeviceMessage[]
  ) {
    this.sendServerMessage({
      type: "deviceMessage",
      data: [bluetoothId, createClientDeviceMessage(...messages)],
    });
  }

  protected sendRequiredDeviceInformationMessage(bluetoothId: string) {
    this.sendServerMessage({
      type: "requiredDeviceInformation",
      data: [bluetoothId],
    });
  }
}

export default BaseClient;
