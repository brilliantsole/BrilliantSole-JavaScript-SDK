import { createConsole } from "../utils/Console.ts";
import EventDispatcher, {
  BoundEventListeners,
  Event,
  EventMap,
} from "../utils/EventDispatcher.ts";
import {
  createServerMessage,
  ServerMessageTypes,
  DeviceMessage,
  ServerMessage,
  ServerMessageType,
  createDeviceMessage,
  DeviceMessageType,
} from "./ServerUtils.ts";
import Device, {
  BoundDeviceEventListeners,
  DeviceEventMap,
  DeviceEventType,
  RequiredInformationConnectionMessages,
} from "../Device.ts";
import {
  addEventListeners,
  removeEventListeners,
} from "../utils/EventUtils.ts";
import scanner from "../scanner/Scanner.ts";
import { parseMessage, parseStringFromDataView } from "../utils/ParseUtils.ts";
import {
  ConnectionMessageType,
  ConnectionMessageTypes,
  ConnectionTypes,
} from "../connection/BaseConnectionManager.ts";
import {
  BoundScannerEventListeners,
  DiscoveredDevice,
  ScannerEventMap,
} from "../scanner/BaseScanner.ts";
import { concatenateArrayBuffers } from "../utils/ArrayBufferUtils.ts";
import DeviceManager, {
  DeviceManagerEventMap,
  BoundDeviceManagerEventListeners,
} from "../DeviceManager.ts";
import { RequiredWifiMessageTypes } from "../WifiManager.ts";
import { DeviceInformationTypes } from "../DeviceInformationManager.ts";
import GuardManager from "../utils/GuardManager.ts";

const RequiredDeviceInformationMessageTypes: ConnectionMessageType[] = [
  ...DeviceInformationTypes,
  "batteryLevel",
  ...RequiredInformationConnectionMessages,
];

const _console = createConsole("BaseServer", { log: true });

export interface BaseServerClient {}

export const ServerEventTypes = [
  "clientConnected",
  "clientDisconnected",
] as const;
export type ServerEventType = (typeof ServerEventTypes)[number];

interface ServerEventMessages<ServerClient extends BaseServerClient> {
  clientConnected: { client: ServerClient };
  clientDisconnected: { client: ServerClient };
}

export type ServerEventDispatcher<ServerClient extends BaseServerClient> =
  EventDispatcher<
    BaseServer<ServerClient>,
    ServerEventType,
    ServerEventMessages<ServerClient>
  >;
export type ServerEvent<ServerClient extends BaseServerClient> = Event<
  BaseServer<ServerClient>,
  ServerEventType,
  ServerEventMessages<ServerClient>
>;
export type ServerEventMap<ServerClient extends BaseServerClient> = EventMap<
  BaseServer<ServerClient>,
  ServerEventType,
  ServerEventMessages<ServerClient>
>;
export type BoundServerEventListeners<ServerClient extends BaseServerClient> =
  BoundEventListeners<
    BaseServer<ServerClient>,
    ServerEventType,
    ServerEventMessages<ServerClient>
  >;

export interface BaseServerClientContext<
  ServerClient extends BaseServerClient,
> {
  client: ServerClient;
  responseMessages: (ArrayBuffer | undefined)[];
}

export interface BaseServerClientDeviceContext<
  ServerClient extends BaseServerClient,
> {
  client: ServerClient;
  deviceMessages: DeviceMessage[];
  device: Device;
}

export type BaseServerClientGuardManagerArgs<
  Server extends BaseServer<ServerClient>,
  ServerClient extends BaseServerClient,
> = [{ message?: ServerMessage; client: ServerClient; server: Server }];
export type BaseServerClientDeviceGuardManagerArgs<
  Server extends BaseServer<ServerClient>,
  ServerClient extends BaseServerClient,
> = [
  {
    message?: DeviceMessage;
    device: Device;
    client: ServerClient;
    server: Server;
  },
];

abstract class BaseServer<ServerClient extends BaseServerClient> {
  // EVENT DISPATCHER
  protected eventDispatcher: ServerEventDispatcher<ServerClient> =
    new EventDispatcher(this as BaseServer<ServerClient>, ServerEventTypes);
  get addEventListener() {
    return this.eventDispatcher.addEventListener;
  }
  protected get dispatchEvent() {
    return this.eventDispatcher.dispatchEvent;
  }
  get removeEventListener() {
    return this.eventDispatcher.removeEventListener;
  }
  get waitForEvent() {
    return this.eventDispatcher.waitForEvent;
  }

  // CONSTRUCTOR

  constructor() {
    _console.assertWithError(scanner, "no scanner defined");

    addEventListeners(scanner, this.#boundScannerListeners);
    addEventListeners(DeviceManager, this.#boundDeviceManagerListeners);
    addEventListeners(this, this.#boundServerListeners);
  }

  clients: ServerClient[] = [];

  static #ClearSensorConfigurationsWhenNoClients = true;
  static get ClearSensorConfigurationsWhenNoClients() {
    return this.#ClearSensorConfigurationsWhenNoClients;
  }
  static set ClearSensorConfigurationsWhenNoClients(newValue) {
    _console.assertTypeWithError(newValue, "boolean");
    this.#ClearSensorConfigurationsWhenNoClients = newValue;
  }

  #clearSensorConfigurationsWhenNoClients =
    BaseServer.#ClearSensorConfigurationsWhenNoClients;
  get clearSensorConfigurationsWhenNoClients() {
    return this.#clearSensorConfigurationsWhenNoClients;
  }
  set clearSensorConfigurationsWhenNoClients(newValue) {
    _console.assertTypeWithError(newValue, "boolean");
    this.#clearSensorConfigurationsWhenNoClients = newValue;
  }

  // SERVER LISTENERS
  #boundServerListeners: BoundServerEventListeners<ServerClient> = {
    clientConnected: this.#onClientConnected.bind(this),
    clientDisconnected: this.#onClientDisconnected.bind(this),
  };
  #onClientConnected(event: ServerEventMap<ServerClient>["clientConnected"]) {
    const client = event.message.client;
    if (!this.clients.includes(client)) {
      this.clients.push(client);
    }
    _console.log("onClientConnected");
    _console.log(`currently have ${this.clients.length} clients`);
  }
  #onClientDisconnected(
    event: ServerEventMap<ServerClient>["clientDisconnected"],
  ) {
    const client = event.message.client;
    if (this.clients.includes(client)) {
      this.clients.splice(this.clients.indexOf(client), 1);
    }

    _console.log("onClientDisconnected");
    _console.log(`currently have ${this.clients.length} clients`);
    if (
      this.clients.length == 0 &&
      this.clearSensorConfigurationsWhenNoClients
    ) {
      DeviceManager.ConnectedDevices.forEach((device) => {
        device.clearSensorConfiguration();
        device.setTfliteInferencingEnabled(false);
      });
    }
  }

  // CLIENT MESSAGING
  protected abstract sendToClient(
    client: ServerClient,
    message: ArrayBuffer,
  ): void;

  #sendToClient(client: ServerClient, message: ArrayBuffer) {
    if (this.#guardServerToClient(client)) {
      this.sendToClient(client, message);
    }
  }

  broadcastMessage(
    message: ArrayBuffer,
    clients: ServerClient[] = this.clients,
  ) {
    _console.log("broadcasting", message);
    clients.forEach((client) => {
      this.#sendToClient(client, message);
    });
  }

  // SCANNER
  #boundScannerListeners: BoundScannerEventListeners = {
    isScanningAvailable: this.#onScannerIsAvailable.bind(this),
    isScanning: this.#onScannerIsScanning.bind(this),
    discoveredDevice: this.#onScannerDiscoveredDevice.bind(this),
    expiredDiscoveredDevice: this.#onExpiredDiscoveredDevice.bind(this),
  };

  #onScannerIsAvailable(event: ScannerEventMap["isScanningAvailable"]) {
    this.broadcastMessage(
      this.#isScanningAvailableMessage,
      this.#filterServerToClients("isScanningAvailable"),
    );
  }
  get #isScanningAvailableMessage() {
    return createServerMessage({
      type: "isScanningAvailable",
      data: scanner.isScanningAvailable,
    });
  }

  #onScannerIsScanning(event: ScannerEventMap["isScanning"]) {
    this.broadcastMessage(
      this.#isScanningMessage,
      this.#filterServerToClients("isScanning"),
    );
  }
  get #isScanningMessage() {
    return createServerMessage({
      type: "isScanning",
      data: scanner.isScanning,
    });
  }

  #onScannerDiscoveredDevice(event: ScannerEventMap["discoveredDevice"]) {
    const { discoveredDevice } = event.message;
    _console.log(discoveredDevice);

    this.broadcastMessage(
      this.#createDiscoveredDeviceMessage(discoveredDevice),
      this.#filterServerToClients("discoveredDevice"),
    );
  }

  #createDiscoveredDeviceMessage(discoveredDevice: DiscoveredDevice) {
    return createServerMessage({
      type: "discoveredDevice",
      data: discoveredDevice,
    });
  }

  #onExpiredDiscoveredDevice(
    event: ScannerEventMap["expiredDiscoveredDevice"],
  ) {
    const { discoveredDevice } = event.message;
    _console.log("expired", discoveredDevice);
    this.broadcastMessage(
      this.#createExpiredDiscoveredDeviceMessage(discoveredDevice),
      this.#filterServerToClients("discoveredDevice"),
    );
  }
  #createExpiredDiscoveredDeviceMessage(discoveredDevice: DiscoveredDevice) {
    return createServerMessage({
      type: "expiredDiscoveredDevice",
      data: discoveredDevice.bluetoothId,
    });
  }

  get #discoveredDevicesMessage() {
    const serverMessages: ServerMessage[] = scanner.discoveredDevicesArray
      .filter((discoveredDevice) => {
        const existingConnectedDevice = DeviceManager.ConnectedDevices.find(
          (device) => device.bluetoothId == discoveredDevice.bluetoothId,
        );
        return !existingConnectedDevice;
      })
      .map((discoveredDevice) => {
        return { type: "discoveredDevice", data: discoveredDevice };
      });
    return createServerMessage(...serverMessages);
  }

  get #connectedDevicesMessage() {
    return createServerMessage({
      type: "connectedDevices",
      data: JSON.stringify({
        connectedDevices: DeviceManager.ConnectedDevices.map(
          (device) => device.bluetoothId,
        ),
      }),
    });
  }

  // DEVICE LISTENERS
  #boundDeviceListeners: BoundDeviceEventListeners = {
    connectionMessage: this.#onDeviceConnectionMessage.bind(this),
  };

  #createDeviceMessage(
    device: Device,
    messageType: ConnectionMessageType,
    dataView?: DataView,
  ): DeviceMessage {
    switch (messageType) {
      case "cameraData":
        return {
          type: "cameraData",
          // @ts-expect-error
          data: dataView || device._buildCameraData(),
        };
      default:
        return {
          type: messageType as DeviceEventType,
          data: dataView || device.latestConnectionMessages.get(messageType),
        };
    }
  }

  #onDeviceConnectionMessage(deviceEvent: DeviceEventMap["connectionMessage"]) {
    const { target: device, message: deviceConnectionMessage } = deviceEvent;
    _console.log("onDeviceConnectionMessage", deviceConnectionMessage);

    if (!device.isConnected) {
      return;
    }

    const { messageType, dataView } = deviceConnectionMessage;
    const deviceMessage = this.#createDeviceMessage(
      device,
      messageType,
      dataView,
    );

    // TODO: - parse stuff like "sensorData", "sensorConfiguration", etc

    this.broadcastMessage(
      this.#createDeviceServerMessage(device, deviceMessage),
      this.#filterDeviceToClients(device, deviceMessage),
    );
  }

  // STATIC DEVICE LISTENERS
  #boundDeviceManagerListeners: BoundDeviceManagerEventListeners = {
    deviceConnected: this.#onDeviceConnected.bind(this),
    deviceDisconnected: this.#onDeviceDisconnected.bind(this),
    deviceIsConnected: this.#onDeviceIsConnected.bind(this),
  };

  #onDeviceConnected(
    staticDeviceEvent: DeviceManagerEventMap["deviceConnected"],
  ) {
    const { device } = staticDeviceEvent.message;
    _console.log("onDeviceConnected", device.bluetoothId);
    addEventListeners(device, this.#boundDeviceListeners);
  }

  #onDeviceDisconnected(
    staticDeviceEvent: DeviceManagerEventMap["deviceDisconnected"],
  ) {
    const { device } = staticDeviceEvent.message;
    _console.log("onDeviceDisconnected", device.bluetoothId);
    removeEventListeners(device, this.#boundDeviceListeners);
  }

  #onDeviceIsConnected(
    staticDeviceEvent: DeviceManagerEventMap["deviceIsConnected"],
  ) {
    const { device } = staticDeviceEvent.message;
    _console.log("onDeviceIsConnected", device.bluetoothId);
    this.broadcastMessage(
      this.#createDeviceIsConnectedMessage(device),
      this.#filterDeviceToClients(device, "isConnected"),
    );
  }
  #createDeviceIsConnectedMessage(device: Device) {
    return this.#createDeviceServerMessage(device, {
      type: "isConnected",
      data: device.isConnected,
    });
  }

  #createDeviceServerMessage(device: Device, ...messages: DeviceMessage[]) {
    _console.log("#createDeviceServerMessage", ...messages);
    return createServerMessage({
      type: "deviceMessage",
      data: [device.bluetoothId!, createDeviceMessage(...messages)],
    });
  }

  // PARSING
  clientToServerGuardManager = new GuardManager<
    BaseServerClientGuardManagerArgs<BaseServer<ServerClient>, ServerClient>
  >();
  serverToClientGuardManager = new GuardManager<
    BaseServerClientGuardManagerArgs<BaseServer<ServerClient>, ServerClient>
  >();

  #guardServerToClient(client: ServerClient, message?: ServerMessage) {
    return this.serverToClientGuardManager.evaluate({
      client,
      message,
      server: this,
    });
  }
  #filterServerToClients(message: ServerMessage) {
    return this.clients.filter((client) =>
      this.#guardServerToClient(client, message),
    );
  }

  #guardClientToServer(client: ServerClient, message?: ServerMessage) {
    return this.clientToServerGuardManager.evaluate({
      message,
      client,
      server: this,
    });
  }

  clientToDeviceGuardManager = new GuardManager<
    BaseServerClientDeviceGuardManagerArgs<
      BaseServer<ServerClient>,
      ServerClient
    >
  >();
  deviceToClientGuardManager = new GuardManager<
    BaseServerClientDeviceGuardManagerArgs<
      BaseServer<ServerClient>,
      ServerClient
    >
  >();

  #guardClientToDevice(
    client: ServerClient,
    device: Device,
    message?: DeviceMessage,
  ) {
    return this.clientToDeviceGuardManager.evaluate({
      device,
      client,
      message,
      server: this,
    });
  }
  #guardDeviceToClient(
    device: Device,
    client: ServerClient,
    message?: DeviceMessage,
  ) {
    return this.deviceToClientGuardManager.evaluate({
      device,
      client,
      message,
      server: this,
    });
  }

  #filterDeviceToClients(
    device: Device,
    message: DeviceMessage,
    clients = this.clients,
  ) {
    return clients.filter((client) =>
      this.#guardDeviceToClient(device, client, message),
    );
  }

  protected parseClientMessage(
    client: ServerClient,
    dataView: DataView<ArrayBuffer>,
  ) {
    let responseMessages: ArrayBuffer[] = [];

    const context: BaseServerClientContext<BaseServerClient> = {
      responseMessages,
      client,
    };

    if (!this.#guardClientToServer(client)) {
      return;
    }

    parseMessage(
      dataView,
      ServerMessageTypes,
      this.#onClientMessage.bind(this),
      context,
      true,
    );

    responseMessages = responseMessages.filter(Boolean);

    if (responseMessages.length > 0) {
      return concatenateArrayBuffers(responseMessages);
    }
  }

  #onClientMessage(
    messageType: ServerMessageType,
    dataView: DataView<ArrayBuffer>,
    context: BaseServerClientContext<ServerClient>,
  ) {
    _console.log(
      `onClientMessage "${messageType}" (${dataView.byteLength} bytes)`,
    );

    const { client, responseMessages } = context;

    const message: ServerMessage = dataView
      ? { type: messageType, data: dataView }
      : messageType;

    if (!this.#guardClientToServer(client, message)) {
      return;
    }

    switch (messageType) {
      case "isScanningAvailable":
        if (this.#guardServerToClient(client, "isScanningAvailable")) {
          responseMessages.push(this.#isScanningAvailableMessage);
        }
        break;
      case "isScanning":
        if (this.#guardServerToClient(client, "isScanning")) {
          responseMessages.push(this.#isScanningMessage);
        }
        break;
      case "startScan":
        scanner.startScan();
        break;
      case "stopScan":
        scanner.stopScan();
        break;
      case "discoveredDevices":
        if (this.#guardServerToClient(client, "discoveredDevices")) {
          responseMessages.push(this.#discoveredDevicesMessage);
        }
        break;
      case "connectToDevice":
        {
          const { string: deviceId, byteOffset } =
            parseStringFromDataView(dataView);
          let connectionType = undefined;
          if (byteOffset < dataView.byteLength) {
            connectionType = ConnectionTypes[dataView.getUint8(byteOffset)];
            _console.log(`connectToDevice ${deviceId} via ${connectionType}`);
          } else {
            _console.log(`connecting to device with id ${deviceId}...`);
          }
          scanner.connectToDevice(deviceId, connectionType);
        }
        break;
      case "disconnectFromDevice":
        {
          const { string: deviceId } = parseStringFromDataView(dataView);
          let device = DeviceManager.AvailableDevices.find(
            (device) => device.bluetoothId == deviceId,
          );
          device = device ?? scanner.devices[deviceId];
          if (!device) {
            _console.error(`no device found with id ${deviceId}`);
            break;
          }
          _console.log(`disconnecting from device with id ${deviceId}...`);
          device.addEventListener(
            "notConnected",
            () => {
              this.broadcastMessage(
                this.#createDeviceIsConnectedMessage(device),
                this.#filterDeviceToClients(device, "isConnected"),
              );
            },
            { once: true },
          );
          device.disconnect();
        }
        break;
      case "connectedDevices":
        if (this.#guardServerToClient(client, "connectedDevices")) {
          responseMessages.push(this.#connectedDevicesMessage);
        }
        break;
      case "deviceMessage":
        {
          const { string: deviceId, byteOffset } =
            parseStringFromDataView(dataView);
          const device = DeviceManager.ConnectedDevices.find(
            (device) => device.bluetoothId == deviceId,
          );
          if (!device) {
            _console.error(`no device found with id ${deviceId}`);
            break;
          }
          const _dataView = new DataView(
            dataView.buffer,
            dataView.byteOffset + byteOffset,
          );
          const responseMessage = this.parseClientDeviceMessage(
            client,
            device,
            _dataView,
          );
          if (responseMessage) {
            responseMessages.push(responseMessage);
          }
        }
        break;
      case "requiredDeviceInformation":
        {
          const { string: deviceId } = parseStringFromDataView(dataView);
          const device = DeviceManager.ConnectedDevices.find(
            (device) => device.bluetoothId == deviceId,
          );
          if (!device) {
            _console.error(`no device found with id ${deviceId}`);
            break;
          }

          const messages: DeviceMessage[] = [];
          RequiredDeviceInformationMessageTypes.forEach((messageType) => {
            if (this.#guardDeviceToClient(device, client, messageType)) {
              messages.push(this.#createDeviceMessage(device, messageType));
            }
          });

          if (device.isWifiAvailable) {
            RequiredWifiMessageTypes.forEach((messageType) => {
              if (this.#guardDeviceToClient(device, client, messageType)) {
                messages.push(this.#createDeviceMessage(device, messageType));
              }
            });
          }
          if (device.hasCamera) {
            if (this.#guardDeviceToClient(device, client, "cameraData")) {
              messages.push(this.#createDeviceMessage(device, "cameraData"));
            }
          }
          const responseMessage = this.#createDeviceServerMessage(
            device,
            ...messages,
          );
          if (responseMessage) {
            responseMessages.push(responseMessage);
          }
        }
        break;
      default:
        _console.error(`uncaught messageType "${messageType}"`);
        break;
    }
    _console.log(responseMessages);
  }

  protected parseClientDeviceMessage(
    client: ServerClient,
    device: Device,
    dataView: DataView<ArrayBuffer>,
  ) {
    _console.log("onDeviceMessage", device.bluetoothId, dataView);

    let deviceMessages: DeviceMessage[] = [];

    if (!this.#guardClientToDevice(client, device)) {
      return;
    }

    const context: BaseServerClientDeviceContext<ServerClient> = {
      deviceMessages,
      device,
      client,
    };

    parseMessage(
      dataView,
      ConnectionMessageTypes,
      this.#parseClientDeviceMessageCallback.bind(this),
      context,
      true,
    );

    if (deviceMessages.length > 0) {
      return this.#createDeviceServerMessage(device, ...deviceMessages);
    }
  }

  #parseClientDeviceMessageCallback(
    messageType: ConnectionMessageType,
    dataView: DataView<ArrayBuffer>,
    context: BaseServerClientDeviceContext<ServerClient>,
  ) {
    _console.log(
      `clientDeviceMessage ${messageType} (${dataView.byteLength} bytes)`,
    );

    const { client, device, deviceMessages } = context;

    const message: DeviceMessage = { type: messageType, data: dataView };
    if (!this.#guardClientToDevice(client, device, message)) {
      return;
    }

    switch (messageType) {
      case "smp":
        device.connectionManager!.sendSmpMessage(dataView.buffer);
        break;
      case "tx":
        // TODO: - parse to intercept events like "setSensorConfiguration", "takePicture", etc
        device.connectionManager!.sendTxData(dataView.buffer);
        break;
      default:
        deviceMessages.push(message);
        break;
    }
  }
}

export default BaseServer;
