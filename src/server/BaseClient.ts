import { createConsole } from "../utils/Console.ts";
import {
  ServerMessageTypes,
  ClientDeviceMessage,
  createClientDeviceMessage,
  ServerMessageType,
  ServerMessageOrMessageType,
} from "./ServerUtils.ts";
import { parseMessage, parseStringFromDataView } from "../utils/ParseUtils.ts";
import EventDispatcher, {
  EventDispatcherTypes,
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
  ScannerEventTypes,
} from "../scanner/BaseScanner.ts";
import ClientConnectionManager from "../connection/ClientConnectionManager.ts";
import DeviceManager from "../DeviceManager.ts";
import {
  ClientConnectionType,
  ConnectionStatus,
  ConnectionTypes,
} from "../connection/BaseConnectionManager.ts";
import { serverMtus, ServerTypes } from "./BaseServer.ts";
import { default as PubSubManager } from "../pubSub/PubSubManager.ts";

const _console = createConsole("BaseClient", { log: false });

export const ClientTypes = ServerTypes;
export type ClientType = (typeof ClientTypes)[number];

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
  ...ScannerEventTypes,
] as const;
export type ClientEventType = (typeof ClientEventTypes)[number];

interface ClientConnectionEventMessages {
  notConnected: any;
  connecting: any;
  connected: any;
  disconnecting: any;
  connectionStatus: { connectionStatus: ClientConnectionStatus };
  isConnected: { isConnected: boolean };
}

export type ClientEventMessages = ClientConnectionEventMessages &
  ScannerEventMessages;

export type ClientEventDispatcherTypes = EventDispatcherTypes<
  BaseClient,
  ClientEventType,
  ClientEventMessages
>;
export type ClientEvent = ClientEventDispatcherTypes["Event"];
export type ClientEventMap = ClientEventDispatcherTypes["EventMap"];
export type ClientEventListenerMap =
  ClientEventDispatcherTypes["EventListenerMap"];
export type ClientEventDispatcher =
  ClientEventDispatcherTypes["EventDispatcher"];
export type BoundClientEventListeners =
  ClientEventDispatcherTypes["BoundEventListeners"];

export type ServerURL = string | URL;

export interface ClientContext {
  responseMessages: ServerMessageOrMessageType[];
}

abstract class BaseClient {
  static type: ClientType;
  abstract readonly type: ClientType;

  protected get baseConstructor() {
    return this.constructor as typeof BaseClient;
  }

  // DISPLAY CANVAS HELPER MANAGER
  private static OnClient: (client: BaseClient) => void;

  constructor() {
    BaseClient.OnClient(this);
  }

  static get clientMtu() {
    return serverMtus[this.type];
  }
  get clientMtu() {
    return this.baseConstructor.clientMtu;
  }

  #reset() {
    this.#isScanningAvailable = false;
    this.#isScanning = false;
    for (const id in this.#devices) {
      const device = this.#devices[id];
      const connectionManager =
        device.connectionManager! as ClientConnectionManager;
      connectionManager.isConnected = false;
      // device.removeAllEventListeners();
    }
    for (const bluetoothId in this.#discoveredDevices) {
      this.#onExpiredDiscoveredDevice(bluetoothId);
    }
    this.#receivedMessageTypes.length = 0;
    //this.#devices = {};
  }

  // DEVICES
  #devices: { [deviceId: string]: Device } = {};
  get devices() {
    return this.#devices;
  }

  #eventDispatcher: ClientEventDispatcher = new EventDispatcher(
    this as BaseClient,
    ClientEventTypes,
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

  // CONNECTION
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

  private static _defaultReconnectOnDisconnection = true;
  static get DefaultReconnectOnDisconnection() {
    return this._defaultReconnectOnDisconnection;
  }
  static set DefaultReconnectOnDisconnection(
    newDefaultReconnectOnDisconnection,
  ) {
    _console.assertTypeWithError(newDefaultReconnectOnDisconnection, "boolean");
    this._defaultReconnectOnDisconnection = newDefaultReconnectOnDisconnection;
  }

  #_isWaitingToReattemptConnection = false;
  protected get _isWaitingToReattemptConnection() {
    return this.#_isWaitingToReattemptConnection;
  }
  protected set _isWaitingToReattemptConnection(
    newIsWaitingToReattemptConnection,
  ) {
    _console.assertTypeWithError(newIsWaitingToReattemptConnection, "boolean");
    _console.log({ newIsWaitingToReattemptConnection });
    if (
      this.#_isWaitingToReattemptConnection == newIsWaitingToReattemptConnection
    ) {
      return;
    }
    this.#_isWaitingToReattemptConnection = newIsWaitingToReattemptConnection;
  }
  get isWaitingToReattemptConnection() {
    return this._isWaitingToReattemptConnection;
  }

  protected _reconnectOnDisconnection =
    this.baseConstructor.DefaultReconnectOnDisconnection;
  get reconnectOnDisconnection() {
    return this._reconnectOnDisconnection;
  }
  set reconnectOnDisconnection(newReconnectOnDisconnection) {
    _console.assertTypeWithError(newReconnectOnDisconnection, "boolean");
    this._reconnectOnDisconnection = newReconnectOnDisconnection;
  }

  abstract sendToServer(...messages: ServerMessageOrMessageType[]): void;

  // CONNECTION STATUS
  #hasConnectedOnce = false;
  get hasConnectedOnce() {
    return this.#hasConnectedOnce;
  }
  #_connectionStatus: ClientConnectionStatus = "notConnected";
  protected get _connectionStatus() {
    return this.#_connectionStatus;
  }
  get #latestDispatchedConnectionStatus() {
    return this.#eventDispatcher.latestEvents["connectionStatus"]?.message
      .connectionStatus;
  }
  protected set _connectionStatus(newConnectionStatus) {
    _console.assertTypeWithError(newConnectionStatus, "string");
    _console.log({ newConnectionStatus });

    this.#_connectionStatus = newConnectionStatus;
    if (this.#_connectionStatus == "connected") {
      this.#hasConnectedOnce = true;
    }

    if (this.#latestDispatchedConnectionStatus == this.connectionStatus) {
      _console.log(
        `redundant assignment "${this.#latestDispatchedConnectionStatus}" - skipping dispatch`,
      );
      return;
    }

    this.#dispatchEvent("connectionStatus", {
      connectionStatus: this.connectionStatus,
    });
    this.#dispatchEvent(this.connectionStatus, {});

    switch (newConnectionStatus) {
      case "connected":
      case "notConnected":
        this.#dispatchEvent("isConnected", { isConnected: this.isConnected });
        if (this.isConnected) {
          // this._sendRequiredMessages();
        } else {
          this.#reset();
        }
        break;
    }
  }
  get connectionStatus(): ConnectionStatus {
    if (this.isWaitingToReattemptConnection) {
      return "connecting";
    }
    return this._connectionStatus;
  }

  static RequiredMessageTypes: ServerMessageOrMessageType[] = [
    "isScanningAvailable",
    "discoveredDevices",
    "connectedDevices",
  ];
  get #requiredMessageTypes(): ServerMessageOrMessageType[] {
    return BaseClient.RequiredMessageTypes;
  }
  protected _sendRequiredMessages() {
    _console.log("sending required messages", this.#requiredMessageTypes);
    this.sendToServer(...this.#requiredMessageTypes);
  }

  #receivedMessageTypes: ServerMessageOrMessageType[] = [];
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

  protected parseMessage(dataView: DataView<ArrayBuffer>) {
    _console.log("parseMessage", { dataView });

    const context: ClientContext = {
      responseMessages: [],
    };

    parseMessage(
      dataView,
      ServerMessageTypes,
      this.#parseMessageCallback.bind(this),
      context,
      true,
    );
    this.#checkIfFullyConnected();

    const { responseMessages } = context;
    if (responseMessages.length == 0) {
      _console.log("no responseMessages");
      return;
    }
    this.sendToServer(...responseMessages);
  }

  #parseMessageCallback(
    messageType: ServerMessageType,
    dataView: DataView<ArrayBuffer>,
    context: ClientContext,
  ) {
    let byteOffset = 0;

    _console.log({ messageType }, dataView, context);

    const { responseMessages } = context;

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
            byteOffset,
          );
          _console.log({ discoveredDeviceString });

          const discoveredDevice: DiscoveredDevice = JSON.parse(
            discoveredDeviceString,
          );
          _console.log({ discoveredDevice });

          this.#onDiscoveredDevice(discoveredDevice);
        }
        break;
      case "expiredDiscoveredDevice":
        {
          const { string: bluetoothId } = parseStringFromDataView(
            dataView,
            byteOffset,
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
            connectedBluetoothDeviceIdStrings,
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
          let device = this.#devices[bluetoothId];
          if (!device) {
            device = this.onConnectedBluetoothDeviceIds([bluetoothId])[0];
          }
          _console.assertWithError(
            device,
            `no device found for id ${bluetoothId}`,
          );
          const connectionManager =
            device.connectionManager! as ClientConnectionManager;
          const _dataView = sliceDataView(dataView, byteOffset);
          connectionManager.onClientMessage(_dataView);
        }
        break;
      case "pubSub":
        {
          // @ts-expect-error
          const responseMessage = PubSubManager._parsePeerMessage(
            // @ts-expect-error
            this,
            dataView,
          );
          if (responseMessage) {
            responseMessages.push({ type: "pubSub", data: responseMessage });
          }
        }
        break;
      default:
        _console.error(`uncaught messageType "${messageType}"`);
        break;
    }

    if (this.connectionStatus == "connecting") {
      this.#receivedMessageTypes.push(messageType);
    }
    _console.log("responseMessages", responseMessages);
  }

  // SCANNING
  #_isScanningAvailable = false;
  get #isScanningAvailable() {
    return this.#_isScanningAvailable;
  }
  set #isScanningAvailable(newIsAvailable) {
    _console.assertTypeWithError(newIsAvailable, "boolean");
    this.#_isScanningAvailable = newIsAvailable;
    this.#dispatchEvent("isScanningAvailable", {
      isScanningAvailable: this.isScanningAvailable,
    });
  }
  get isScanningAvailable() {
    return this.#isScanningAvailable;
  }
  #assertIsScanningAvailable() {
    this.assertConnection();
    _console.assertWithError(
      this.isScanningAvailable,
      "scanning is not available",
    );
  }
  protected requestIsScanningAvailable() {
    this.sendToServer("isScanningAvailable");
  }

  #_isScanning = false;
  get #isScanning() {
    return this.#_isScanning;
  }
  set #isScanning(newIsScanning) {
    _console.assertTypeWithError(newIsScanning, "boolean");
    this.#_isScanning = newIsScanning;
    this.#dispatchEvent("isScanning", { isScanning: this.isScanning });
  }
  get isScanning() {
    return this.#isScanning;
  }
  #requestIsScanning() {
    this.sendToServer("isScanning");
  }

  #assertIsScanning() {
    _console.assertWithError(this.isScanning, "is not scanning");
  }
  #assertIsNotScanning() {
    _console.assertWithError(!this.isScanning, "is already scanning");
  }

  startScan() {
    this.#assertIsNotScanning();
    this.sendToServer("startScan");
  }
  stopScan() {
    this.#assertIsScanning();
    this.sendToServer("stopScan");
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

  #onDiscoveredDevice(discoveredDevice: DiscoveredDevice) {
    _console.log({ discoveredDevice });
    const exists = Boolean(
      this.#discoveredDevices[discoveredDevice.bluetoothId],
    );
    if (exists) {
      Object.assign(
        this.#discoveredDevices[discoveredDevice.bluetoothId],
        discoveredDevice,
      );
    } else {
      // @ts-expect-error
      discoveredDevice.scanner = this;

      const onDevice = () => {
        const { device } = discoveredDevice;
        if (!device) {
          return;
        }
        const connectionManager =
          device.connectionManager as ClientConnectionManager;
        connectionManager.discoveredDevice = discoveredDevice;
      };

      discoveredDevice.connect = (connectionType) => {
        _console.log("discoveredDevice.connect", { connectionType });
        const device = this.connectToDevice(
          discoveredDevice.bluetoothId,
          connectionType,
        );
        discoveredDevice.device = device;
        onDevice();
      };
      discoveredDevice.device = this.#devices[discoveredDevice.bluetoothId];
      onDevice();

      this.#discoveredDevices[discoveredDevice.bluetoothId] = discoveredDevice;
    }
    discoveredDevice = this.#discoveredDevices[discoveredDevice.bluetoothId];
    this.#dispatchEvent("discoveredDevice", {
      discoveredDevice,
      firstTime: !exists,
    });
    if (!exists) {
      this.#dispatchEvent("discoveredDevices", {
        discoveredDevices: this.discoveredDevices,
      });
    }
  }
  requestDiscoveredDevices() {
    this.sendToServer({ type: "discoveredDevices" });
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
    this.#dispatchEvent("expiredDiscoveredDevice", { discoveredDevice });
  }

  // DEVICE CONNECTION
  connectToDevice(bluetoothId: string, connectionType?: ClientConnectionType) {
    return this.#requestConnectionToDevice(bluetoothId, connectionType);
  }
  #requestConnectionToDevice(
    bluetoothId: string,
    connectionType?: ClientConnectionType,
  ) {
    this.assertConnection();
    _console.assertTypeWithError(bluetoothId, "string");
    const device = this.#getOrCreateDevice(bluetoothId);
    if (device.connectionStatus == "notConnected") {
      if (connectionType) {
        device.connect({ type: "client", subType: connectionType });
      } else {
        device.connect();
      }
    }
    return device;
  }
  protected sendConnectToDeviceMessage(
    bluetoothId: string,
    connectionType?: ClientConnectionType,
  ) {
    if (connectionType) {
      this.sendToServer({
        type: "connectToDevice",
        data: concatenateArrayBuffers(
          stringToArrayBuffer(bluetoothId),
          ConnectionTypes.indexOf(connectionType),
        ),
      });
    } else {
      this.sendToServer({ type: "connectToDevice", data: bluetoothId });
    }
  }

  // DEVICE CONNECTION
  createDevice(bluetoothId: string) {
    const device = new Device();
    const discoveredDevice = this.#discoveredDevices[bluetoothId];
    const clientConnectionManager = new ClientConnectionManager();
    clientConnectionManager.discoveredDevice = discoveredDevice;
    clientConnectionManager.client = this;
    clientConnectionManager.bluetoothId = bluetoothId;
    clientConnectionManager.sendClientMessage = this.sendDeviceMessage.bind(
      this,
      bluetoothId,
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
    return bluetoothIds.map((bluetoothId) => {
      const device = this.#getOrCreateDevice(bluetoothId);
      const connectionManager =
        device.connectionManager! as ClientConnectionManager;
      connectionManager.isConnected = true;
      // @ts-expect-error
      DeviceManager._checkDeviceAvailability(device);
      return device;
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
    this.sendToServer({ type: "disconnectFromDevice", data: bluetoothId });
  }

  protected sendDeviceMessage(
    bluetoothId: string,
    ...messages: ClientDeviceMessage[]
  ) {
    this.sendToServer({
      type: "deviceMessage",
      data: [bluetoothId, createClientDeviceMessage(...messages)],
    });
  }

  protected sendRequiredDeviceInformationMessage(bluetoothId: string) {
    this.sendToServer({
      type: "requiredDeviceInformation",
      data: [bluetoothId],
    });
  }
}

export default BaseClient;
