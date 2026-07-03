import { createConsole } from "../utils/Console.ts";
import EventDispatcher, {
  EventDispatcherTypes,
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
import {
  enumToDataView,
  parseMessage,
  parseStringFromDataView,
} from "../utils/ParseUtils.ts";
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
import {
  FileTransferCommands,
  FileTransferStatuses,
  RequiredFileTransferMessageTypes,
} from "../FileTransferManager.ts";
import { RequiredTfliteMessageTypes } from "../TfliteManager.ts";
import { RequiredCameraMessageTypes } from "../CameraManager.ts";
import { RequiredMicrophoneMessageTypes } from "../MicrophoneManager.ts";
import { RequiredDisplayMessageTypes } from "../DisplayManager.ts";
import {
  DisplayContextCommand,
  parseDisplayContextCommands,
  serializeDisplayContextCommands,
} from "../utils/DisplayContextCommand.ts";

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

const _console = createConsole("BaseServer", { log: true });

export const ServerTypes = ["window", "webSocket", "udp"] as const;
export type ServerType = (typeof ServerTypes)[number];

export interface BaseServerClient {
  readonly type: ServerType;
}

export const ServerEventTypes = [
  "clientConnected",
  "clientDisconnected",
] as const;
export type ServerEventType = (typeof ServerEventTypes)[number];

export interface BaseServerEventMessages<
  ServerClient extends BaseServerClient,
> {
  clientConnected: { client: ServerClient };
  clientDisconnected: { client: ServerClient };
}

export type BaseServerEventDispatcherTypes<
  ServerClient extends BaseServerClient,
> = EventDispatcherTypes<
  BaseServer<ServerClient>,
  ServerEventType,
  BaseServerEventMessages<ServerClient>
>;
export type BaseServerEvent<ServerClient extends BaseServerClient> =
  BaseServerEventDispatcherTypes<ServerClient>["Event"];
export type BaseServerEventMap<ServerClient extends BaseServerClient> =
  BaseServerEventDispatcherTypes<ServerClient>["EventMap"];
export type BaseServerEventListenerMap<ServerClient extends BaseServerClient> =
  BaseServerEventDispatcherTypes<ServerClient>["EventListenerMap"];
export type BaseServerEventDispatcher<ServerClient extends BaseServerClient> =
  BaseServerEventDispatcherTypes<ServerClient>["EventDispatcher"];
export type BoundBaseServerEventListeners<
  ServerClient extends BaseServerClient,
> = BaseServerEventDispatcherTypes<ServerClient>["BoundEventListeners"];

export interface BaseServerClientContext<
  ServerClient extends BaseServerClient,
> {
  client: ServerClient;
  responseMessages: (ArrayBuffer | undefined)[];
  localBroadcastMessages: (ArrayBuffer | undefined)[];
  broadcastMessages: (ArrayBuffer | undefined)[];
}

export interface BaseServerClientDeviceContext<
  ServerClient extends BaseServerClient,
> {
  client: ServerClient;
  deviceMessages: DeviceMessage[];
  broadcastDeviceMessages: DeviceMessage[];
  device: Device;
}

abstract class BaseServer<ServerClient extends BaseServerClient> {
  static type: ServerType;
  abstract readonly type: ServerType;

  // EVENT DISPATCHER
  #eventDispatcher: BaseServerEventDispatcher<ServerClient> =
    new EventDispatcher(this as BaseServer<ServerClient>, ServerEventTypes);
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

  // DISPLAY CANVAS HELPER MANAGER
  private static OnServer: (server: BaseServer<BaseServerClient>) => void;

  constructor() {
    _console.assertWithError(scanner, "no scanner defined");

    addEventListeners(scanner, this.#boundScannerListeners);
    addEventListeners(DeviceManager, this.#boundDeviceManagerListeners);
    addEventListeners(this, this.#boundServerListeners);

    // @ts-expect-error
    BaseServer.OnServer(this);
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
  #boundServerListeners: BoundBaseServerEventListeners<ServerClient> = {
    clientConnected: this.#onClientConnected.bind(this),
    clientDisconnected: this.#onClientDisconnected.bind(this),
  };
  #onClientConnected(
    event: BaseServerEventMap<ServerClient>["clientConnected"],
  ) {
    const client = event.message.client;
    if (!this.clients.includes(client)) {
      this.clients.push(client);
    }
    _console.log("onClientConnected");
    _console.log(`currently have ${this.clients.length} clients`);
  }
  #onClientDisconnected(
    event: BaseServerEventMap<ServerClient>["clientDisconnected"],
  ) {
    const client = event.message.client;
    if (this.clients.includes(client)) {
      this.clients.splice(this.clients.indexOf(client), 1);
    }

    if (client == this.#clientRequestingSend) {
      this.#clientRequestingSend = undefined;
    }
    if (client == this.#clientSending) {
      this.#clientSending = undefined;
    }

    // TODO: - deal with any file transfers

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
  protected sendToClient(
    client: ServerClient,
    arrayBuffer: ArrayBuffer,
    isWrapped?: boolean,
  ) {
    return this.#allowServerToClient(client);
  }

  broadcast(
    arrayBuffer: ArrayBuffer,
    clients: ServerClient[] = this.clients,
    excludeClients?: ServerClient[],
    isWrapped?: boolean,
  ) {
    _console.log("broadcasting", arrayBuffer);
    if (excludeClients) {
      clients = clients.filter((client) => !excludeClients.includes(client));
    }
    clients
      .filter((client) => this.clients.includes(client))
      .forEach((client) => {
        this.sendToClient(client, arrayBuffer, isWrapped);
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
    this.broadcast(
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
    this.broadcast(
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

    this.broadcast(
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
    this.broadcast(
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
    messageType: DeviceEventType,
    dataView?: DataView,
  ): DeviceMessage {
    switch (messageType) {
      case "cameraData":
        return {
          type: "cameraData",
          // @ts-expect-error
          data: dataView ?? device._buildCameraData(),
        };
        break;
      case "displayContextCommands":
        return {
          type: "displayContextCommands",
          data: serializeDisplayContextCommands(device.displayManager, [
            ...device.displayManager.serializeColors(),
            ...device.displayManager.serializeOpacities(),
            ...device.displayManager.serializeContextState(),
          ]),
        };
        break;
      default:
        if (
          ConnectionMessageTypes.includes(messageType as ConnectionMessageType)
        ) {
          const connectionMessageType = messageType as ConnectionMessageType;
          _console.assertWithError(
            dataView ||
              device.latestConnectionMessages.has(connectionMessageType),
            `device doesn't have dataView for messageType "${messageType}"`,
          );
          dataView =
            dataView ??
            device.latestConnectionMessages.get(connectionMessageType);
        }

        return {
          type: messageType as DeviceEventType,
          data: dataView,
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
        if (!ServerManager.deviceSensorDataToClientGuardManager.isEmpty) {
          const clientSensorDataMessageMap: Map<ServerClient, ArrayBuffer[]> =
            new Map();

          const timestampArrayBuffer = dataView.buffer.slice(0, 2);
          const sensorDataContext = parseSensorData(
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

            this.sendToClient(
              client,
              this.#createDeviceServerMessage(device, deviceMessage),
            );
          });
          return;
        }
        break;
      case "fileTransferStatus":
        {
          const fileTransferStatusEnum = dataView.getUint8(0);
          const fileTransferStatus =
            FileTransferStatuses[fileTransferStatusEnum];
          _console.assertEnumWithError(
            FileTransferStatuses,
            fileTransferStatus,
          );
          _console.log({
            fileTransferStatus,
            clientRequestingSend: this.#clientRequestingSend,
            clientSending: this.#clientSending,
          });

          if (this.#clientRequestingSend) {
            switch (fileTransferStatus) {
              case "sending":
                this.#clientRequestingSend = undefined;
                break;
              case "idle":
                {
                  const clientRequestingSend = this.#clientRequestingSend;
                  this.#clientRequestingSend = undefined;
                  if (device.getCurrentSentFileConfiguration()) {
                    _console.log("already receive file - no need to resend");
                  } else {
                    _console.log(
                      "device doesn't have device locally - requesting remote resend",
                    );
                    this.#clientSending = clientRequestingSend;
                    device._onRemoteConnectionMessageSent(
                      "fileTransferStatus",
                      enumToDataView(FileTransferStatuses, "sending"),
                      false,
                    );

                    const deviceMessage = this.#createDeviceMessage(
                      device,
                      messageType,
                      dataView,
                    );

                    // is this necessary?
                    if (false) {
                      this.broadcast(
                        this.#createDeviceServerMessage(device, deviceMessage),
                        this.#allowDeviceToClients(device, deviceMessage),
                        [clientRequestingSend],
                      );
                    }

                    deviceMessage.data = enumToDataView(
                      FileTransferStatuses,
                      "sending",
                    );
                    this.sendToClient(
                      clientRequestingSend,
                      this.#createDeviceServerMessage(device, deviceMessage),
                    );
                    return;
                  }
                }
                break;
              case "receiving":
                this.#clientRequestingSend = undefined;
                break;
            }
          }
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
    this.broadcast(
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
    this.broadcast(
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
  #allowClientToServer(client: ServerClient, message?: ServerMessage) {
    return ServerManager.clientToServerGuardManager.evaluate({
      message,
      // @ts-expect-error
      client,
      // @ts-expect-error
      server: this,
    });
  }
  #allowServerToClient(
    client: ServerClient,
    message?: ServerMessageOrMessageType,
  ) {
    if (typeof message == "string") {
      message = { type: message };
    }
    return ServerManager.serverToClientGuardManager.evaluate({
      // @ts-expect-error
      client,
      message,
      // @ts-expect-error
      server: this,
    });
  }
  #filterServerToClients(
    message: ServerMessageOrMessageType,
    clients: ServerClient[] = this.clients,
    excludeClients?: ServerClient[],
  ) {
    if (excludeClients) {
      clients = clients.filter((client) => !excludeClients.includes(client));
    }
    return clients.filter((client) =>
      this.#allowServerToClient(client, message),
    );
  }
  #allowClientToDevice(
    client: ServerClient,
    device: Device,
    message?: DeviceMessage,
  ) {
    return ServerManager.clientToDeviceGuardManager.evaluate({
      device,
      // @ts-expect-error
      client,
      message,
      // @ts-expect-error
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
    return ServerManager.deviceToClientGuardManager.evaluate({
      device,
      // @ts-expect-error
      client,
      message,
      // @ts-expect-error
      server: this,
    });
  }
  #allowDeviceToClients(
    device: Device,
    message: DeviceMessageOrMessageType,
    clients: ServerClient[] = this.clients,
    excludeClients?: ServerClient[],
  ) {
    if (excludeClients) {
      clients = clients.filter((client) => !excludeClients.includes(client));
    }
    return clients.filter((client) =>
      this.#allowDeviceToClient(device, client, message),
    );
  }
  #allowDeviceSensorDataToClient(
    device: Device,
    client: ServerClient,
    sensorType: SensorType,
    sensorData: DataView,
  ) {
    return ServerManager.deviceSensorDataToClientGuardManager.evaluate({
      device,
      // @ts-expect-error
      client,
      sensorType,
      sensorData,
      // @ts-expect-error
      server: this,
    });
  }
  #allowClientSensorConfigurationToDevice(
    device: Device,
    client: ServerClient,
    sensorType: SensorType,
    sensorRate: number,
  ) {
    return ServerManager.clientSensorConfigurationToDeviceGuardManager.evaluate(
      {
        device,
        // @ts-expect-error
        client,
        sensorType,
        sensorRate,
        // @ts-expect-error
        server: this,
      },
    );
  }
  #allowClientDisplayContextCommandToDevice(
    device: Device,
    client: ServerClient,
    displayContextCommand: DisplayContextCommand,
  ) {
    return ServerManager.clientDisplayContextCommandToDeviceGuardManager.evaluate(
      {
        device,
        // @ts-expect-error
        client,
        displayContextCommand,
        // @ts-expect-error
        server: this,
      },
    );
  }

  protected parseClientMessage(
    client: ServerClient,
    dataView: DataView<ArrayBuffer>,
  ) {
    if (!this.#allowClientToServer(client)) {
      return;
    }

    const clientContext: BaseServerClientContext<BaseServerClient> = {
      responseMessages: [],
      broadcastMessages: [],
      localBroadcastMessages: [],
      client,
    };

    parseMessage(
      dataView,
      ServerMessageTypes,
      this.#onClientMessage.bind(this),
      clientContext,
      true,
    );

    clientContext.responseMessages =
      clientContext.responseMessages.filter(Boolean);
    clientContext.broadcastMessages =
      clientContext.broadcastMessages.filter(Boolean);
    clientContext.localBroadcastMessages =
      clientContext.localBroadcastMessages.filter(Boolean);

    return clientContext;
  }

  #onClientMessage(
    messageType: ServerMessageType,
    dataView: DataView<ArrayBuffer>,
    clientContext: BaseServerClientContext<ServerClient>,
  ) {
    _console.log(
      `onClientMessage "${messageType}" (${dataView.byteLength} bytes)`,
    );

    const {
      client,
      responseMessages,
      localBroadcastMessages,
      broadcastMessages,
    } = clientContext;

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
              this.broadcast(
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
          const clientDeviceContext = this.#parseClientDeviceMessage(
            client,
            device,
            _dataView,
          );
          if (clientDeviceContext) {
            const { deviceMessages, broadcastDeviceMessages } =
              clientDeviceContext;
            if (deviceMessages.length > 0) {
              responseMessages.push(
                this.#createDeviceServerMessage(device, ...deviceMessages),
              );
            }
            if (broadcastDeviceMessages.length > 0) {
              broadcastMessages.push(
                this.#createDeviceServerMessage(
                  device,
                  ...broadcastDeviceMessages,
                ),
              );
            }
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

          if (device.isDisplayAvailable) {
            if (
              this.#allowDeviceToClient(
                device,
                client,
                "displayContextCommands",
              )
            ) {
              messages.push(
                this.#createDeviceMessage(device, "displayContextCommands"),
              );
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

  #parseClientDeviceMessage(
    client: ServerClient,
    device: Device,
    dataView: DataView<ArrayBuffer>,
  ) {
    _console.log("onDeviceMessage", device.bluetoothId, dataView);

    if (!this.#allowClientToDevice(client, device)) {
      return;
    }

    const clientDeviceContext: BaseServerClientDeviceContext<ServerClient> = {
      deviceMessages: [],
      broadcastDeviceMessages: [],
      device,
      client,
    };

    parseMessage(
      dataView,
      ConnectionMessageTypes,
      this.#parseClientDeviceMessageCallback.bind(this),
      clientDeviceContext,
      true,
    );

    clientDeviceContext.deviceMessages =
      clientDeviceContext.deviceMessages.filter(Boolean);
    clientDeviceContext.broadcastDeviceMessages =
      clientDeviceContext.broadcastDeviceMessages.filter(Boolean);

    return clientDeviceContext;
  }

  #clientRequestingSend?: ServerClient;
  #clientSending?: ServerClient;

  #filterClientToDeviceTxMessage(
    client: ServerClient,
    device: Device,
    dataView: DataView<ArrayBuffer>,
    deviceMessages: DeviceMessage[],
    broadcastDeviceMessages: DeviceMessage[],
  ) {
    const filteredTxMessages: ArrayBuffer[] = [];
    parseMessage(
      dataView,
      TxRxMessageTypes,
      (messageType, dataView) => {
        _console.log("filtering txMessage", { messageType, dataView });

        let message: DeviceMessage = { type: messageType, data: dataView };

        switch (message.type) {
          case "setSensorConfiguration":
            if (
              !ServerManager.clientSensorConfigurationToDeviceGuardManager
                .isEmpty
            ) {
              _console.log("trimming sensorConfiguration...");
              const sensorConfiguration = parseSensorConfiguration(
                message.data,
                (sensorType, sensorRate) => {
                  return this.#allowClientSensorConfigurationToDevice(
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
                const getSensorConfigurationMessage = this.#createDeviceMessage(
                  device,
                  "getSensorConfiguration",
                );
                if (!true) {
                  message = getSensorConfigurationMessage;
                } else {
                  deviceMessages.push(getSensorConfigurationMessage);
                  return;
                }
              }
            }
            break;
          case "displayContextCommands":
            if (
              !ServerManager.clientDisplayContextCommandToDeviceGuardManager
                .isEmpty
            ) {
              const displayContextCommands = parseDisplayContextCommands(
                device.displayManager,
                dataView,
              );
              _console.log(
                "trimming displayContextCommands...",
                displayContextCommands,
              );
              const filteredDisplayContextCommands =
                displayContextCommands.filter((displayContextCommand) => {
                  return this.#allowClientDisplayContextCommandToDevice(
                    device,
                    client,
                    displayContextCommand,
                  );
                });
              _console.log(
                "filteredDisplayContextCommands",
                filteredDisplayContextCommands,
              );
              // FILL - if commands that block changing contextState, send back "corrected" commands

              const filteredDisplayContextCommandsData =
                serializeDisplayContextCommands(
                  device.displayManager,
                  filteredDisplayContextCommands,
                );
              if (filteredDisplayContextCommandsData.byteLength == 0) {
                _console.log("no filteredDisplayContextCommandsData");
                return;
              }
              broadcastDeviceMessages.push({
                type: "displayContextCommands",
                data: filteredDisplayContextCommandsData,
              });
              message.data = filteredDisplayContextCommandsData;
            }
            break;
          case "setFileTransferCommand":
            {
              const fileTransferCommandEnum = dataView.getUint8(0);
              const fileTransferCommand =
                FileTransferCommands[fileTransferCommandEnum];
              _console.assertEnumWithError(
                FileTransferCommands,
                fileTransferCommand,
              );
              _console.log({
                fileTransferCommand,
                clientSending: client == this.#clientSending,
              });
              if (client == this.#clientSending) {
                if (fileTransferCommand == "cancel") {
                  this.#clientSending = undefined;
                  device._onRemoteConnectionMessageSent(
                    "fileTransferStatus",
                    enumToDataView(FileTransferStatuses, "idle"),
                    false,
                  );

                  const fileTransferStatusMessage = this.#createDeviceMessage(
                    device,
                    "fileTransferStatus",
                  );
                  deviceMessages.push(fileTransferStatusMessage);
                }
              } else if (fileTransferCommand == "startSend") {
                if (
                  !this.#clientRequestingSend &&
                  device.fileTransferStatus == "idle"
                ) {
                  this.#clientRequestingSend = client;
                  _console.log(
                    "clientRequestingSend",
                    this.#clientRequestingSend,
                  );
                } else {
                  const fileTransferStatusMessage = this.#createDeviceMessage(
                    device,
                    "fileTransferStatus",
                  );
                  deviceMessages.push(fileTransferStatusMessage);
                  return;
                }
              }
            }
            break;
          case "setFileBlock":
            {
              if (client == this.#clientSending) {
                _console.log("parsing client file block locally");
                device.addEventListener(
                  "fileTransferProgress",
                  (event) => {
                    const { bytesTransferred } = event.message;
                    _console.log("still sending local file...", {
                      bytesTransferred,
                    });
                    const dataView = new DataView(new ArrayBuffer(4));
                    dataView.setUint32(0, bytesTransferred, true);
                    const deviceMessage = this.#createDeviceMessage(
                      device,
                      "fileBytesTransferred",
                      dataView,
                    );
                    this.sendToClient(
                      client,
                      this.#createDeviceServerMessage(device, deviceMessage),
                    );

                    if (bytesTransferred == device.fileLength) {
                      this.#clientSending = undefined;
                      device._onRemoteConnectionMessageSent(
                        "fileTransferStatus",
                        enumToDataView(FileTransferStatuses, "idle"),
                        false,
                      );

                      _console.log(
                        "done sending local file - notifying client...",
                      );
                      const deviceMessage = this.#createDeviceMessage(
                        device,
                        "fileTransferStatus",
                      );
                      this.sendToClient(
                        client,
                        this.#createDeviceServerMessage(device, deviceMessage),
                      );
                    }
                  },
                  {
                    once: true,
                  },
                );
                device._onRemoteConnectionMessageSent(
                  messageType,
                  dataView,
                  false,
                );
                return;
              }
            }
            break;
        }

        if (this.#allowClientToDevice(client, device, message)) {
          filteredTxMessages.push(
            createMessage(TxRxMessageTypes, true, message),
          );
          device._onRemoteConnectionMessageSent(messageType, dataView);
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
    clientDeviceContext: BaseServerClientDeviceContext<ServerClient>,
  ) {
    _console.log(
      `clientDeviceMessage ${messageType} (${dataView.byteLength} bytes)`,
    );

    const { client, device, deviceMessages, broadcastDeviceMessages } =
      clientDeviceContext;

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
          deviceMessages,
          broadcastDeviceMessages,
        );
        device.connectionManager!.sendTxData(dataView.buffer);
        break;
      default:
        deviceMessages.push(message);
        break;
    }
  }

  protected sendClientContext(
    clientContext: BaseServerClientContext<ServerClient>,
  ) {
    _console.log("sendClientContext", clientContext);

    clientContext.responseMessages =
      clientContext.responseMessages.filter(Boolean);
    clientContext.broadcastMessages =
      clientContext.broadcastMessages.filter(Boolean);
    clientContext.localBroadcastMessages =
      clientContext.localBroadcastMessages.filter(Boolean);

    const responseMessage = concatenateArrayBuffers(
      clientContext.responseMessages,
    );
    _console.log(`sending ${responseMessage.byteLength} bytes to client...`);
    this.sendToClient(clientContext.client, responseMessage, true);

    const localBroadcastMessage = concatenateArrayBuffers(
      clientContext.localBroadcastMessages,
    );

    _console.log(
      `locally broadcasting ${localBroadcastMessage.byteLength} bytes...`,
    );
    this.broadcast(
      localBroadcastMessage,
      undefined,
      [clientContext.client],
      true,
    );

    const broadcastMessage = concatenateArrayBuffers(
      clientContext.broadcastMessages,
    );
    _console.log(`broadcasting ${broadcastMessage.byteLength} bytes...`);
    // @ts-expect-error
    ServerManager.broadcast(
      broadcastMessage,
      undefined,
      // @ts-expect-error
      [clientContext.client],
      true,
    );
  }
}

export default BaseServer;

import { default as ServerManager } from "./ServerManager.ts";
