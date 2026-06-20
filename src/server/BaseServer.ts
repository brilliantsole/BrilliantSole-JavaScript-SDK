import { createConsole } from "../utils/Console.ts";
import EventDispatcher, {
  BoundEventListeners,
  Event,
  EventDispatcherTypes,
  EventMap,
} from "../utils/EventDispatcher.ts";
import {
  createServerMessage,
  ServerMessageTypes,
  DeviceMessage,
  ServerMessage,
  ServerMessageType,
  createDeviceMessage,
  ServerMessageOrMessageType,
  DeviceMessageOrMessageType,
  createMessage,
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
  TxRxMessageTypes,
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
import {
  parseSensorConfiguration,
  serializeSensorConfiguration,
} from "../sensor/SensorConfigurationManager.ts";
import {
  parseSensorData,
  RequiredPressureMessageTypes,
  SensorType,
  SensorTypes,
} from "../sensor/SensorDataManager.ts";
import { RequiredFileTransferMessageTypes } from "../FileTransferManager.ts";
import { RequiredTfliteMessageTypes } from "../TfliteManager.ts";
import { RequiredCameraMessageTypes } from "../CameraManager.ts";
import { RequiredMicrophoneMessageTypes } from "../MicrophoneManager.ts";
import { RequiredDisplayMessageTypes } from "../DisplayManager.ts";

const RequiredDeviceInformationMessageTypes: ConnectionMessageType[] = [
  ...DeviceInformationTypes,
  "batteryLevel",
  ...RequiredInformationConnectionMessages,
  ...RequiredPressureMessageTypes,
  ...RequiredWifiMessageTypes,
  ...RequiredFileTransferMessageTypes,
  ...RequiredTfliteMessageTypes,
  ...RequiredCameraMessageTypes,
  ...RequiredMicrophoneMessageTypes,
  ...RequiredDisplayMessageTypes,
];

const _console = createConsole("BaseServer", { log: false });

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

export type ServerEventDispatcherTypes<ServerClient extends BaseServerClient> =
  EventDispatcherTypes<
    BaseServer<ServerClient>,
    ServerEventType,
    ServerEventMessages<ServerClient>
  >;
export type ServerEvent<ServerClient extends BaseServerClient> =
  ServerEventDispatcherTypes<ServerClient>["Event"];
export type ServerEventMap<ServerClient extends BaseServerClient> =
  ServerEventDispatcherTypes<ServerClient>["EventMap"];
export type ServerEventListenerMap<ServerClient extends BaseServerClient> =
  ServerEventDispatcherTypes<ServerClient>["EventListenerMap"];
export type ServerEventDispatcher<ServerClient extends BaseServerClient> =
  ServerEventDispatcherTypes<ServerClient>["EventDispatcher"];
export type BoundServerEventListeners<ServerClient extends BaseServerClient> =
  ServerEventDispatcherTypes<ServerClient>["BoundEventListeners"];

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

export interface BaseServerClientGuardManagerArg<
  Server extends BaseServer<ServerClient>,
  ServerClient extends BaseServerClient,
> {
  client: ServerClient;
  message?: ServerMessage;
  server: Server;
}

export interface BaseServerClientDeviceGuardManagerArg<
  Server extends BaseServer<ServerClient>,
  ServerClient extends BaseServerClient,
> {
  device: Device;
  client: ServerClient;
  message?: DeviceMessage;
  server: Server;
}

export interface BaseServerClientDeviceSensorDataGuardManagerArg<
  Server extends BaseServer<ServerClient>,
  ServerClient extends BaseServerClient,
> {
  device: Device;
  client: ServerClient;
  sensorType: SensorType;
  sensorData: DataView;
  server: Server;
}
export interface BaseServerClientDeviceSensorConfigurationGuardManagerArg<
  Server extends BaseServer<ServerClient>,
  ServerClient extends BaseServerClient,
> {
  device: Device;
  client: ServerClient;
  sensorType: SensorType;
  sensorRate: number;
  server: Server;
}

abstract class BaseServer<ServerClient extends BaseServerClient> {
  // EVENT DISPATCHER
  #eventDispatcher: ServerEventDispatcher<ServerClient> = new EventDispatcher(
    this as BaseServer<ServerClient>,
    ServerEventTypes,
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
      DeviceManager.connectedDevices.forEach((device) => {
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
    if (this.#allowServerToClient(client)) {
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
        const existingConnectedDevice = DeviceManager.connectedDevices.find(
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
        connectedDevices: DeviceManager.connectedDevices.map(
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
        _console.assertWithError(
          device.latestConnectionMessages.has(messageType),
          `device doesn't have messageType "${messageType}"`,
        );
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

    switch (messageType) {
      case "sensorData":
        if (!this.deviceSensorDataToClientGuardManager.isEmpty) {
          const clientSensorDataMessageMap: Map<ServerClient, ArrayBuffer[]> =
            new Map();

          const timestampArrayBuffer = dataView.buffer.slice(0, 2);
          const context = parseSensorData(
            dataView,
            (sensorType, sensorDataView, context, isLast) => {
              this.clients.forEach((client) => {
                if (
                  this.#allowDeviceSensorDataToClient(
                    device,
                    client,
                    sensorType,
                    sensorDataView,
                  )
                ) {
                  if (!clientSensorDataMessageMap.has(client)) {
                    clientSensorDataMessageMap.set(client, []);
                  }
                  clientSensorDataMessageMap.get(client)!.push(
                    createMessage(SensorTypes, false, {
                      type: sensorType,
                      data: sensorDataView,
                    }),
                  );
                }
              });
            },
          );

          clientSensorDataMessageMap.forEach((data, client) => {
            const dataView = new DataView(
              concatenateArrayBuffers(timestampArrayBuffer, ...data),
            );
            const deviceMessage = this.#createDeviceMessage(
              device,
              "sensorData",
              dataView,
            );

            this.#sendToClient(
              client,
              this.#createDeviceServerMessage(device, deviceMessage),
            );
          });
          return;
        }
        break;
      default:
        break;
    }

    const deviceMessage = this.#createDeviceMessage(
      device,
      messageType,
      dataView,
    );
    this.broadcastMessage(
      this.#createDeviceServerMessage(device, deviceMessage),
      this.#allowDeviceToClients(device, deviceMessage),
    );
  }

  // STATIC DEVICE LISTENERS
  #boundDeviceManagerListeners: BoundDeviceManagerEventListeners = {
    deviceConnected: this.#onDeviceConnected.bind(this),
    deviceNotConnected: this.#onDeviceNotConnected.bind(this),
    deviceIsConnected: this.#onDeviceIsConnected.bind(this),
  };

  #onDeviceConnected(
    staticDeviceEvent: DeviceManagerEventMap["deviceConnected"],
  ) {
    const { device } = staticDeviceEvent.message;
    _console.log("onDeviceConnected", device.bluetoothId);
    addEventListeners(device, this.#boundDeviceListeners);
  }

  #onDeviceNotConnected(
    staticDeviceEvent: DeviceManagerEventMap["deviceNotConnected"],
  ) {
    const { device } = staticDeviceEvent.message;
    _console.log("onDeviceNotConnected", device.bluetoothId);
    removeEventListeners(device, this.#boundDeviceListeners);
  }

  #onDeviceIsConnected(
    staticDeviceEvent: DeviceManagerEventMap["deviceIsConnected"],
  ) {
    const { device } = staticDeviceEvent.message;
    _console.log("onDeviceIsConnected", device.bluetoothId);
    this.broadcastMessage(
      this.#createDeviceIsConnectedMessage(device),
      this.#allowDeviceToClients(device, "isConnected"),
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
    [BaseServerClientGuardManagerArg<BaseServer<ServerClient>, ServerClient>]
  >();
  serverToClientGuardManager = new GuardManager<
    [BaseServerClientGuardManagerArg<BaseServer<ServerClient>, ServerClient>]
  >();

  #allowServerToClient(
    client: ServerClient,
    message?: ServerMessageOrMessageType,
  ) {
    if (typeof message == "string") {
      message = { type: message };
    }
    return this.serverToClientGuardManager.evaluate({
      client,
      message,
      server: this,
    });
  }
  #filterServerToClients(message: ServerMessageOrMessageType) {
    return this.clients.filter((client) =>
      this.#allowServerToClient(client, message),
    );
  }

  #allowClientToServer(client: ServerClient, message?: ServerMessage) {
    return this.clientToServerGuardManager.evaluate({
      message,
      client,
      server: this,
    });
  }

  clientToDeviceGuardManager = new GuardManager<
    [
      BaseServerClientDeviceGuardManagerArg<
        BaseServer<ServerClient>,
        ServerClient
      >,
    ]
  >();
  deviceToClientGuardManager = new GuardManager<
    [
      BaseServerClientDeviceGuardManagerArg<
        BaseServer<ServerClient>,
        ServerClient
      >,
    ]
  >();

  #allowClientToDevice(
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
  #allowDeviceToClient(
    device: Device,
    client: ServerClient,
    message?: DeviceMessageOrMessageType,
  ) {
    if (typeof message == "string") {
      message = { type: message };
    }
    return this.deviceToClientGuardManager.evaluate({
      device,
      client,
      message,
      server: this,
    });
  }
  #allowDeviceToClients(device: Device, message: DeviceMessageOrMessageType) {
    return this.clients.filter((client) =>
      this.#allowDeviceToClient(device, client, message),
    );
  }

  deviceSensorDataToClientGuardManager = new GuardManager<
    [
      BaseServerClientDeviceSensorDataGuardManagerArg<
        BaseServer<ServerClient>,
        ServerClient
      >,
    ]
  >();
  #allowDeviceSensorDataToClient(
    device: Device,
    client: ServerClient,
    sensorType: SensorType,
    sensorData: DataView,
  ) {
    return this.deviceSensorDataToClientGuardManager.evaluate({
      device,
      client,
      sensorType,
      sensorData,
      server: this,
    });
  }

  clientSensorConfigurationToDeviceGuardManager = new GuardManager<
    [
      BaseServerClientDeviceSensorConfigurationGuardManagerArg<
        BaseServer<ServerClient>,
        ServerClient
      >,
    ]
  >();
  #allowDeviceSensorConfigurationToClient(
    device: Device,
    client: ServerClient,
    sensorType: SensorType,
    sensorRate: number,
  ) {
    return this.clientSensorConfigurationToDeviceGuardManager.evaluate({
      device,
      client,
      sensorType,
      sensorRate,
      server: this,
    });
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

    if (!this.#allowClientToServer(client)) {
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

    const message: ServerMessage = { type: messageType, data: dataView };

    if (!this.#allowClientToServer(client, message)) {
      return;
    }

    switch (messageType) {
      case "isScanningAvailable":
        if (this.#allowServerToClient(client, "isScanningAvailable")) {
          responseMessages.push(this.#isScanningAvailableMessage);
        }
        break;
      case "isScanning":
        if (this.#allowServerToClient(client, "isScanning")) {
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
        if (this.#allowServerToClient(client, "discoveredDevices")) {
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
          const device = DeviceManager.availableDevices.find(
            (device) => device.bluetoothId == deviceId,
          );
          if (device) {
            // @ts-expect-error
            device.connect({ type: connectionType, reconnect: true });
          } else {
            scanner.connectToDevice(deviceId, connectionType);
          }
        }
        break;
      case "disconnectFromDevice":
        {
          const { string: deviceId } = parseStringFromDataView(dataView);
          if (!deviceId) {
            break;
          }
          let device = DeviceManager.availableDevices.find(
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
                this.#allowDeviceToClients(device, "isConnected"),
              );
            },
            { once: true },
          );
          device.disconnect();
        }
        break;
      case "connectedDevices":
        if (this.#allowServerToClient(client, "connectedDevices")) {
          responseMessages.push(this.#connectedDevicesMessage);
        }
        break;
      case "deviceMessage":
        {
          const { string: deviceId, byteOffset } =
            parseStringFromDataView(dataView);
          if (!deviceId) {
            break;
          }
          const device = DeviceManager.connectedDevices.find(
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
          if (!deviceId) {
            break;
          }
          const device = DeviceManager.connectedDevices.find(
            (device) => device.bluetoothId == deviceId,
          );
          if (!device) {
            _console.error(`no device found with id ${deviceId}`);
            break;
          }

          const messages: DeviceMessage[] = [];

          RequiredDeviceInformationMessageTypes.forEach((messageType) => {
            if (
              device.latestConnectionMessages.has(messageType) &&
              this.#allowDeviceToClient(device, client, messageType)
            ) {
              messages.push(this.#createDeviceMessage(device, messageType));
            }
          });

          if (device.hasCamera) {
            if (this.#allowDeviceToClient(device, client, "cameraData")) {
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
    _console.log("responseMessages", responseMessages);
  }

  protected parseClientDeviceMessage(
    client: ServerClient,
    device: Device,
    dataView: DataView<ArrayBuffer>,
  ) {
    _console.log("onDeviceMessage", device.bluetoothId, dataView);

    let deviceMessages: DeviceMessage[] = [];

    if (!this.#allowClientToDevice(client, device)) {
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

  #filterClientToDeviceTxMessage(
    client: ServerClient,
    device: Device,
    dataView: DataView<ArrayBuffer>,
  ) {
    if (
      this.clientToDeviceGuardManager.isEmpty &&
      this.clientSensorConfigurationToDeviceGuardManager.isEmpty
    ) {
      return dataView;
    }
    const filteredTxMessages: ArrayBuffer[] = [];
    parseMessage(
      dataView,
      TxRxMessageTypes,
      (messageType, dataView) => {
        _console.log("filtering txMessage", { messageType, dataView });
        let message: DeviceMessage = { type: messageType, data: dataView };
        switch (message.type) {
          case "setSensorConfiguration":
            if (!this.clientSensorConfigurationToDeviceGuardManager.isEmpty) {
              _console.log("trimming sensorConfiguration...");
              const sensorConfiguration = parseSensorConfiguration(
                message.data,
                (sensorType, sensorRate) => {
                  return this.#allowDeviceSensorConfigurationToClient(
                    device,
                    client,
                    sensorType,
                    sensorRate,
                  );
                },
              );
              _console.log("trimmed sensorConfiguration", sensorConfiguration);
              const sensorConfigurationData =
                serializeSensorConfiguration(sensorConfiguration);
              if (sensorConfigurationData.byteLength > 0) {
                message.data = sensorConfigurationData;
              } else {
                _console.log(
                  "no sensorConfigurationData - sending existing sensorConfiguration",
                );
                message = this.#createDeviceMessage(
                  device,
                  "getSensorConfiguration",
                );
              }
            }
            break;
        }
        if (this.#allowClientToDevice(client, device, message)) {
          filteredTxMessages.push(
            createMessage(TxRxMessageTypes, true, message),
          );
        }
      },
      null,
      true,
    );
    return new DataView(concatenateArrayBuffers(...filteredTxMessages));
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
    if (!this.#allowClientToDevice(client, device, message)) {
      return;
    }

    switch (messageType) {
      case "smp":
        device.connectionManager!.sendSmpMessage(dataView.buffer);
        break;
      case "tx":
        dataView = this.#filterClientToDeviceTxMessage(
          client,
          device,
          dataView,
        );
        device.connectionManager!.sendTxData(dataView.buffer);
        break;
      default:
        deviceMessages.push(message);
        break;
    }
  }
}

export default BaseServer;
