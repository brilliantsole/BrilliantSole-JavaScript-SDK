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
  valueToUInt16DataView,
  valueToUInt32DataView,
} from "../utils/ParseUtils.ts";
import {
  ConnectionMessageType,
  ConnectionMessageTypes,
  ConnectionTypes,
  TxMessage,
  TxRxMessageType,
  TxRxMessageTypes,
} from "../connection/BaseConnectionManager.ts";
import {
  BoundScannerEventListeners,
  DiscoveredDevice,
  ScannerEventMap,
} from "../scanner/BaseScanner.ts";
import {
  concatenateArrayBuffers,
  valueToUInt8DataView,
} from "../utils/ArrayBufferUtils.ts";
import DeviceManager, {
  DeviceManagerEventMap,
  BoundDeviceManagerEventListeners,
} from "../DeviceManager.ts";
import DisplayCanvasHelperManager, {
  BoundDisplayCanvasHelperManagerEventListeners,
  DisplayCanvasHelperManagerEventMap,
} from "../utils/DisplayCanvasHelperManager.ts";
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
  ExtendedFileConfiguration,
  FileTypes,
} from "../FileTransferManager.ts";
import { RequiredTfliteMessageTypes } from "../TfliteManager.ts";
import { RequiredCameraMessageTypes } from "../CameraManager.ts";
import { RequiredMicrophoneMessageTypes } from "../MicrophoneManager.ts";
import {
  DisplaySpriteSheetFileConfiguration,
  RequiredDisplayMessageTypes,
} from "../DisplayManager.ts";
import {
  DisplayContextCommand,
  parseDisplayContextCommands,
  serializeDisplayContextCommands,
  ShowDisplayContextCommandType,
  ShowDisplayContextCommandTypes,
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

export const serverMtus: Record<ServerType, number> = {
  udp: 1024,
  webSocket: 1024,
  window: 1024,
};

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

export interface BaseServerClientMetaData {
  sent?: boolean;
  initiated?: boolean;
  bytesTransferred: number;
}

abstract class BaseServer<ServerClient extends BaseServerClient> {
  static type: ServerType;
  abstract readonly type: ServerType;

  protected get baseConstructor() {
    return this.constructor as typeof BaseServer;
  }
  static get clientMtu() {
    return serverMtus[this.type];
  }
  get clientMtu() {
    return this.baseConstructor.clientMtu;
  }

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
    addEventListeners(
      DisplayCanvasHelperManager,
      this.#boundDisplayCanvasHelperManagerEventListeners,
    );
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

    for (const [device, _client] of [...this.#clientsRequestingSend]) {
      if (_client == client) {
        this.#clientsRequestingSend.delete(device);
        device.cancelFileTransfer();
      }
    }
    for (const [device, _client] of [...this.#clientsSendingToDevice]) {
      if (_client == client) {
        this.#clientsSendingToDevice.delete(device);
        device.cancelFileTransfer();
      }
    }
    for (const [device, clients] of [...this.#clientsWaitingToRequestSend]) {
      if (clients.includes(client)) {
        clients.splice(clients.indexOf(client), 1);
      }
    }
    for (const [device, clientMap] of [
      ...this.#clientsWaitingToRequestSendMetaData,
    ]) {
      if (clientMap.has(client)) {
        clientMap.delete(client);
      }
    }

    for (const [device, _client] of [...this.#clientsSendingToSelf]) {
      if (_client == client) {
        this.#clientsSendingToSelf.delete(device);
        _console.log("cancelling fileTransfer because client is gone");
        device.cancelFileTransfer();
      }
    }

    for (const [device, map] of [...this.#clientSentFileConfigurations]) {
      for (const [fileConfiguration, _map] of [...map]) {
        if (_map.has(client)) {
          _map.delete(client);
        }
      }
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
    displayContextCommands: this.#onDeviceDisplayContextCommands.bind(this),
    fileSent: this.#onDeviceFileSent.bind(this),
  };

  #isClientBusyReceivingFileFromSelf(client: ServerClient, device?: Device) {
    return Boolean(
      this.#getCurrentFileConfigurationSendingToClientDevice(client, device),
    );
  }
  #getCurrentFileConfigurationSendingToClientDevice(
    client: ServerClient,
    device?: Device,
  ) {
    _console.log("#getCurrentFileConfigurationSendingToClientDevice", {
      client,
      device,
    });
    const fileConfigurationMaps = device
      ? [this.#clientSentFileConfigurations.get(device)!]
      : this.#clientSentFileConfigurations.values();

    for (const fileConfigurationMap of fileConfigurationMaps) {
      if (!fileConfigurationMap) {
        continue;
      }

      for (const [fileConfiguration, clientMap] of fileConfigurationMap) {
        const state = clientMap.get(client);
        if (state?.initiated && !state.sent) {
          _console.log(
            "found currentFileConfigurationSendingToClientDevice",
            fileConfiguration,
          );
          return fileConfiguration;
        }
      }
    }
  }

  #isBusyTransferringFile(device?: Device, client?: ServerClient) {
    if (device) {
      // self => device
      if (device._fileTransferManager.pendingBufferWithHeader) {
        return true;
      }
      if (device.fileTransferStatus != "idle") {
        return true;
      }
      if (device.displayManager.displayCanvasHelper?.isSettingDevice) {
        return true;
      }

      // client => self => device (self intercepts)
      if (this.#clientsSendingToDevice.has(device)) {
        return true;
      }
      if (this.#clientsRequestingSend.has(device)) {
        return true;
      }

      // client => self (device already has it)
      if (this.#clientsSendingToSelf.has(device)) {
        return true;
      }
    }

    // client <= self (self already uploaded it)
    if (client) {
      if (this.#isClientBusyReceivingFileFromSelf(client, device)) {
        return true;
      }
    }

    return false;
  }
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
          data:
            dataView ??
            new DataView(
              serializeDisplayContextCommands(device.displayManager, [
                ...device.displayManager.serializeColors(),
                ...device.displayManager.serializeOpacities(),
                ...device.displayManager.serializeContextState(),
              ]),
            ),
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
    if (this.clients.length == 0) {
      return;
    }
    const { target: device, message: deviceConnectionMessage } = deviceEvent;
    _console.log("onDeviceConnectionMessage", deviceConnectionMessage);

    if (!device.isConnected) {
      _console.log("device isn't connected");
      return;
    }

    const { messageType, dataView } = deviceConnectionMessage;

    const deviceMessages: DeviceMessage[] = [];

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
          const clientRequestingSend = this.#clientsRequestingSend.get(device);
          const clientSendingToSelf = this.#clientsSendingToSelf.get(device);
          const clientSendingToDevice =
            this.#clientsSendingToDevice.get(device);

          const fileTransferStatusEnum = dataView.getUint8(0);
          const fileTransferStatus =
            FileTransferStatuses[fileTransferStatusEnum];
          _console.assertEnumWithError(
            FileTransferStatuses,
            fileTransferStatus,
          );

          _console.log({
            fileTransferStatus,
            clientRequestingSend,
            clientSendingToSelf,
            clientSendingToDevice,
          });

          if (clientRequestingSend) {
            this.#clientsRequestingSend.delete(device);
            this.#clientsSendingToDevice.set(device, clientRequestingSend);

            switch (fileTransferStatus) {
              case "sending":
                if (clientSendingToSelf) {
                  _console.log(
                    `already sending "sending" fileTransferStatus to client`,
                  );
                  return;
                } else {
                  _console.log(
                    `sending "sending" fileTransferStatus only to client`,
                  );
                  const deviceMessage = this.#createDeviceMessage(
                    device,
                    messageType,
                    dataView,
                  );
                  this.sendToClient(
                    clientRequestingSend,
                    this.#createDeviceServerMessage(device, deviceMessage),
                  );
                  return;
                }
                break;
              case "idle":
                {
                  this.#clientsSendingToDevice.delete(device);

                  const currentSentFileConfiguration =
                    device._fileTransferManager.getCurrentFileConfiguration();
                  if (currentSentFileConfiguration) {
                    _console.log("already received file - no need to resend");

                    if (clientSendingToSelf) {
                      _console.log(
                        `already sending "idle" fileTransferStatus to client`,
                      );
                      return;
                    }
                  } else {
                    _console.log(
                      "local device doesn't have file - requesting client send to self",
                    );
                    this.#clientsSendingToSelf.set(
                      device,
                      clientRequestingSend,
                    );
                    device._onRemoteConnectionMessageSent(
                      "fileTransferStatus",
                      enumToDataView(FileTransferStatuses, "sending"),
                      false,
                    );

                    const deviceMessages: DeviceMessage[] = [];
                    // _console.log(
                    //   `temporaily increasing mtu to ${this.clientMtu}`,
                    // );
                    const mtuDeviceMessage = this.#createDeviceMessage(
                      device,
                      "getMtu",
                      valueToUInt16DataView(this.clientMtu, true),
                    );
                    deviceMessages.push(mtuDeviceMessage);

                    const fileTransferStatusDeviceMessage =
                      this.#createDeviceMessage(device, messageType, dataView);
                    deviceMessages.push(fileTransferStatusDeviceMessage);

                    fileTransferStatusDeviceMessage.data = enumToDataView(
                      FileTransferStatuses,
                      "sending",
                    );

                    this.sendToClient(
                      clientRequestingSend,
                      this.#createDeviceServerMessage(
                        device,
                        ...deviceMessages,
                      ),
                    );
                    return;
                  }
                }
                break;
              case "receiving":
                break;
            }
          } else if (clientSendingToSelf) {
            _console.log(
              "file is being transferred locally - not relaying fileTransferStatus",
            );
            return;
          } else if (clientSendingToDevice) {
            switch (fileTransferStatus) {
              case "idle":
                {
                  _console.log("client done sending file to device");
                  this.#clientsSendingToDevice.delete(device);
                  // if (false) {
                  //   const _deviceMessages = this.#onDoneTransferringFile(
                  //     device,
                  //     clientSendingToDevice,
                  //   );
                  //   if (_deviceMessages) {
                  //     deviceMessages.push(..._deviceMessages);
                  //   }
                  // }
                }
                break;
              default:
                _console.error(
                  `uncaught fileTransferStatus "${fileTransferStatus}" when sending file between client and device`,
                );
                return;
                break;
            }
          } else {
            _console.log(
              "file is being sent directly to device - not relaying fileTransferStatus",
            );
            return;
          }
        }
        break;
      case "tfliteIsReady":
      case "displaySpriteSheetIndex":
        {
          const fileConfiguration =
            device._fileTransferManager.getCurrentFileConfiguration();
          if (!fileConfiguration) {
            _console.log(
              `delaying messageType "${messageType}" until after receiving file from client`,
            );
            return;
          } else if (!fileConfiguration.indirectly) {
            _console.log(
              `delaying messageType "${messageType}" until after sending file to clients`,
            );
            return;
          }
        }
        break;
      case "setFileChecksum":
      case "setFileLength":
      case "setFileType":
      case "setDisplaySpriteSheetName":
      case "setTfliteSensorTypes":
      case "setTfliteName":
      case "setTfliteSampleRate":
      case "setTfliteTask":
        {
          const clientRequestingSend = this.#clientsRequestingSend.get(device);
          const clientSendingToSelf = this.#clientsSendingToSelf.get(device);
          const clientSendingToDevice =
            this.#clientsSendingToDevice.get(device);

          _console.log({
            clientRequestingSend,
            clientSendingToSelf,
            clientSendingToDevice,
          });

          if (clientRequestingSend) {
            _console.log(
              "sending fileTransfer metadata response to clientRequestingSend",
            );
            const deviceMessage = this.#createDeviceMessage(
              device,
              messageType,
              dataView,
            );
            this.sendToClient(
              clientRequestingSend,
              this.#createDeviceServerMessage(device, deviceMessage),
            );
          } else {
            _console.log(
              `no client to send fileTransfer metadata "${messageType}" response to`,
            );
          }
          return;
        }
        break;
      case "fileBytesTransferred":
        _console.log("skipping fileBytesTransferred");
        return;
        break;
      default:
        break;
    }

    const deviceMessage = this.#createDeviceMessage(
      device,
      messageType,
      dataView,
    );
    deviceMessages.unshift(deviceMessage);

    this.broadcast(
      this.#createDeviceServerMessage(device, ...deviceMessages),
      this.#allowDeviceToClients(device, deviceMessage),
    );
  }
  #onDeviceDisplayContextCommands(
    deviceEvent: DeviceEventMap["displayContextCommands"],
  ) {
    if (this.clients.length == 0) {
      return;
    }

    const { target: device, message } = deviceEvent;
    const { displayContextCommands } = message;
    _console.log("onDeviceDisplayContextCommands", displayContextCommands);
    if (!device.isConnected) {
      _console.warn("device isn't connected");
      return;
    }
    const serializedDisplayContextCommands = serializeDisplayContextCommands(
      device.displayManager,
      displayContextCommands,
    );
    // _console.log(
    //   "serializedDisplayContextCommands",
    //   serializedDisplayContextCommands,
    // );
    const deviceMessage = this.#createDeviceMessage(
      device,
      "displayContextCommands",
      new DataView(serializedDisplayContextCommands),
    );
    // _console.log("deviceMessage", deviceMessage);
    const deviceServerMessage = this.#createDeviceServerMessage(
      device,
      deviceMessage,
    );
    // @ts-expect-error
    ServerManager.broadcast(deviceServerMessage, undefined, undefined, false);
  }
  #onDeviceFileSent(deviceEvent: DeviceEventMap["fileSent"]) {
    if (this.clients.length == 0) {
      return;
    }

    const { target: device, message } = deviceEvent;
    _console.log("#onDeviceFileSent", message);
    if (!device.isConnected) {
      _console.warn("device isn't connected");
      return;
    }

    const { fileConfiguration } = message;

    if (
      !this.#clientSentFileConfigurations.get(device)!.has(fileConfiguration)
    ) {
      this.#clientSentFileConfigurations
        .get(device)!
        .set(fileConfiguration, new Map());
    }

    const fileTransferMetaData: DeviceMessage[] = [];
    switch (fileConfiguration.fileType) {
      case "tflite":
        fileTransferMetaData.push(
          this.#createDeviceMessage(device, "setTfliteTask"),
        );
        fileTransferMetaData.push(
          this.#createDeviceMessage(device, "setTfliteSensorTypes"),
        );
        fileTransferMetaData.push(
          this.#createDeviceMessage(device, "setTfliteName"),
        );
        break;
      case "spriteSheet":
        fileTransferMetaData.push(
          this.#createDeviceMessage(device, "setDisplaySpriteSheetName"),
        );
        break;
    }
    this.#clientFileConfigurationMetaData
      .get(device)!
      .set(fileConfiguration, fileTransferMetaData);

    this.clients.forEach((client) => {
      this.#sendDeviceFileConfigurationToClient(
        device,
        fileConfiguration,
        client,
      );
    });
  }

  // STATIC DISPLAY CANVAS HELPER MANAGER LISTENERS
  #boundDisplayCanvasHelperManagerEventListeners: BoundDisplayCanvasHelperManagerEventListeners =
    {
      displayCanvasHelperDeviceConnected:
        this.#onDisplayCanvasHelperDeviceConnected.bind(this),
    };
  #onDisplayCanvasHelperDeviceConnected(
    staticDisplayCanvasHelperEvent: DisplayCanvasHelperManagerEventMap["displayCanvasHelperDeviceConnected"],
  ) {
    const { device } = staticDisplayCanvasHelperEvent.message;
    console.log(
      "#onDisplayCanvasHelperDeviceConnected",
      staticDisplayCanvasHelperEvent,
    );
    this.#onDoneTransferringFile(device, undefined);
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
    this.#clientsWaitingToRequestSend.set(device, []);
    this.#clientsWaitingToRequestSendMetaData.set(device, new Map());
    this.#clientSentFileConfigurations.set(device, new Map());
    this.#clientFileConfigurationMetaData.set(device, new Map());
  }

  #onDeviceNotConnected(
    staticDeviceEvent: DeviceManagerEventMap["deviceNotConnected"],
  ) {
    const { device } = staticDeviceEvent.message;
    _console.log("onDeviceNotConnected", device.bluetoothId);
    removeEventListeners(device, this.#boundDeviceListeners);
    this.#clientsWaitingToRequestSend.delete(device);
    this.#clientsWaitingToRequestSendMetaData.delete(device);
    this.#clientSentFileConfigurations.delete(device);
    this.#clientFileConfigurationMetaData.delete(device);
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

          for (const [device, map] of [...this.#clientSentFileConfigurations]) {
            for (const [fileConfiguration, _] of [...map]) {
              const _messages = this.#sendDeviceFileConfigurationToClient(
                device,
                fileConfiguration,
                client,
                false,
              );
              if (_messages) {
                messages.push(..._messages);
              }
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

  #clientsSendingToDevice: Map<Device, ServerClient> = new Map();
  #clientsRequestingSend: Map<Device, ServerClient> = new Map();
  #clientsWaitingToRequestSend: Map<Device, ServerClient[]> = new Map();
  #clientsWaitingToRequestSendMetaData: Map<
    Device,
    Map<ServerClient, DeviceMessage[]>
  > = new Map();
  #clientsSendingToSelf: Map<Device, ServerClient> = new Map();
  #appendClientSentFileConfigurations(device: Device, client: ServerClient) {
    _console.log("#appendClientSentFileConfigurations", device, client);
    const currentSentFileConfiguration =
      device._fileTransferManager.getCurrentFileConfiguration()!;
    _console.assertWithError(
      currentSentFileConfiguration,
      "currentSentFileConfiguration not found",
    );
    _console.log(
      "adding currentSentFileConfiguration to clientFileConfigurations",
    );
    if (
      !this.#clientSentFileConfigurations
        .get(device)!
        .has(currentSentFileConfiguration)
    ) {
      this.#clientSentFileConfigurations
        .get(device)!
        .set(currentSentFileConfiguration, new Map());
    }
    this.#clientSentFileConfigurations
      .get(device)!
      .get(currentSentFileConfiguration)!
      .set(client, {
        sent: true,
        initiated: false,
        bytesTransferred: currentSentFileConfiguration.length,
      });
    return currentSentFileConfiguration;
  }
  #onDoneTransferringFile(device: Device, client?: ServerClient) {
    _console.log("#onDoneTransferringFile", device, client);

    if (client) {
      const deviceMessages = this.#sendNextFileToClient(device, client);
      if (deviceMessages) {
        return deviceMessages;
      }
    }

    {
      let deviceMessages: DeviceMessage[] | undefined;
      let _client: ServerClient | undefined;
      this.clients.some((__client) => {
        if (__client == client) {
          return false;
        }
        deviceMessages = this.#sendNextFileToClient(device, __client);
        if (deviceMessages) {
          _client = __client;
        }
        return Boolean(_client);
      });
      if (deviceMessages && _client) {
        if (client == _client) {
          return deviceMessages;
        } else {
          this.sendToClient(
            _client,
            this.#createDeviceServerMessage(device, ...deviceMessages),
          );
        }
      }
    }

    const clientsWaitingToRequestSend =
      this.#clientsWaitingToRequestSend.get(device)!;
    if (clientsWaitingToRequestSend.length > 0) {
      const client = clientsWaitingToRequestSend.shift()!;
      _console.log("clientWaitingToRequestSend", client);
      this.#clientsRequestingSend.set(device, client);

      const messages = this.#clientsWaitingToRequestSendMetaData
        .get(device)!
        .get(client)!;
      this.#clientsWaitingToRequestSendMetaData.get(device)!.delete(client);
      messages.push({
        type: "setFileTransferCommand",
        data: enumToDataView(FileTransferCommands, "startSend"),
      });
      _console.log("fileTransfer metadata", messages);

      const filteredTxMessages: TxMessage[] = [];
      messages.forEach((message) => {
        if (this.#allowClientToDevice(client, device, message)) {
          filteredTxMessages.push(message as TxMessage);
          device._onRemoteConnectionMessageSent(
            message.type as TxRxMessageType,
            message.data,
          );
        }
      });
      _console.log("filtered fileTransfer metadata", filteredTxMessages);
      device.connectionManager!.sendTxMessages(filteredTxMessages, true, true);
    }
  }
  #onDoneReceivingFileFromClient(
    device: Device,
    client: ServerClient,
    deviceMessages: DeviceMessage[],
  ) {
    _console.log("#onDoneReceivingFileFromClient", device);

    this.#appendClientSentFileConfigurations(device, client);

    device._onRemoteConnectionMessageSent(
      "fileTransferStatus",
      enumToDataView(FileTransferStatuses, "idle"),
      false,
    );
    this.#clientsSendingToSelf.delete(device);
    _console.log("restoring device mtu");
    const resetMtuMessage = this.#createDeviceMessage(device, "getMtu");
    deviceMessages.push(resetMtuMessage);

    const fileTransferStatusDeviceMessage = this.#createDeviceMessage(
      device,
      "fileTransferStatus",
    );
    deviceMessages.push(fileTransferStatusDeviceMessage);

    const _deviceMessages = this.#onDoneTransferringFile(device, client);
    if (_deviceMessages) {
      deviceMessages.push(..._deviceMessages);
    }
  }

  #clientSentFileConfigurations: Map<
    Device,
    Map<ExtendedFileConfiguration, Map<ServerClient, BaseServerClientMetaData>>
  > = new Map();
  #clientFileConfigurationMetaData: Map<
    Device,
    Map<ExtendedFileConfiguration, DeviceMessage[]>
  > = new Map();
  #sendFileBlockToClient(
    device: Device,
    client: ServerClient,
    fileConfiguration: ExtendedFileConfiguration,
    metadata: BaseServerClientMetaData,
  ) {
    _console.log(
      "#sendFileBlockToClient",
      device,
      client,
      fileConfiguration,
      metadata,
    );
    const deviceMessages: DeviceMessage[] = [];
    if (!metadata.initiated) {
      metadata.initiated = true;
      metadata.bytesTransferred = 0;
    }
    const maxBlockLength = this.clientMtu - 3;
    const block = fileConfiguration.buffer.slice(
      metadata.bytesTransferred,
      metadata.bytesTransferred + maxBlockLength,
    );
    const blockLength = block.byteLength;
    _console.log(
      `sending ${blockLength} bytes [${metadata.bytesTransferred}-${metadata.bytesTransferred + blockLength}]/${fileConfiguration.buffer.byteLength} (${(100 * (metadata.bytesTransferred + blockLength)) / fileConfiguration.buffer.byteLength}%)`,
      metadata,
    );
    _console.assertWithError(blockLength > 0, "blockLength cannot be 0");
    metadata.bytesTransferred += blockLength;
    metadata.sent =
      metadata.bytesTransferred == fileConfiguration.buffer.byteLength;
    const fileBlockDeviceMessage = this.#createDeviceMessage(
      device,
      "getFileBlock",
      new DataView(block),
    );
    deviceMessages.push(fileBlockDeviceMessage);

    if (metadata.sent) {
      _console.log("finished sending file to client");
      const idleFileTransferStatusMessage = this.#createDeviceMessage(
        device,
        "fileTransferStatus",
        enumToDataView(FileTransferStatuses, "idle"),
      );
      deviceMessages.push(idleFileTransferStatusMessage);

      const _deviceMessages = this.#onDoneSendingFileToClient(
        device,
        client,
        fileConfiguration,
      );
      deviceMessages.push(..._deviceMessages);
    }
    return deviceMessages;
  }
  #sendNextFileToClient(device: Device, client: ServerClient) {
    _console.log("#sendNextFileToClient", device, client);

    let nextFileConfiguration: ExtendedFileConfiguration | undefined;
    _console.log("finding next fileConfiguration to send");
    if (this.#clientSentFileConfigurations.has(device)) {
      for (const [_fileConfiguration, map] of [
        ...this.#clientSentFileConfigurations.get(device)!.entries(),
      ]) {
        if (map.has(client)) {
          const metadata = map.get(client)!;
          const { sent, initiated } = metadata;
          if (!sent && !initiated) {
            _console.log("found nextFileConfiguration", _fileConfiguration);
            nextFileConfiguration = _fileConfiguration;
            break;
          }
        }
      }
    }
    _console.log("nextFileConfiguration", nextFileConfiguration);

    if (nextFileConfiguration) {
      _console.log(
        "sending followup nextFileConfiguration",
        nextFileConfiguration,
      );
      const _deviceMessages = this.#sendDeviceFileConfigurationToClient(
        device,
        nextFileConfiguration,
        client,
        false,
      );
      return _deviceMessages;
    }
  }
  #onDoneSendingFileToClient(
    device: Device,
    client: ServerClient,
    fileConfiguration: ExtendedFileConfiguration,
  ) {
    _console.log(
      "#onDoneSendingFileToClient",
      device,
      client,
      fileConfiguration,
    );

    const deviceMessages: DeviceMessage[] = [];

    switch (fileConfiguration.fileType) {
      case "spriteSheet":
        {
          const spriteSheetFileConfiguration =
            fileConfiguration as DisplaySpriteSheetFileConfiguration;
          const displaySpriteSheetIndexDeviceMessage =
            this.#createDeviceMessage(
              device,
              "displaySpriteSheetIndex",
              valueToUInt8DataView(
                spriteSheetFileConfiguration.spriteSheetIndex!,
              ),
            );
          deviceMessages.push(displaySpriteSheetIndexDeviceMessage);
        }
        break;
      case "tflite":
        {
          const tfliteIsReadyDeviceMessage = this.#createDeviceMessage(
            device,
            "tfliteIsReady",
          );
          deviceMessages.push(tfliteIsReadyDeviceMessage);
        }
        break;
      default:
        _console.log(`uncaught fileType "${fileConfiguration.fileType}"`);
        break;
    }

    const _deviceMessages = this.#onDoneTransferringFile(device, client);
    if (_deviceMessages) {
      deviceMessages.push(..._deviceMessages);
    }

    return deviceMessages;
  }
  #sendDeviceFileConfigurationToClient(
    device: Device,
    fileConfiguration: ExtendedFileConfiguration,
    client: ServerClient,
    sendImmediately = true,
  ) {
    _console.log(
      "#sendDeviceFileConfigurationToClient",
      device,
      fileConfiguration,
      client,
      { sendImmediately },
    );

    switch (fileConfiguration.fileType) {
      case "tflite":
      case "spriteSheet":
        break;
      default:
        _console.log(`not sending fileType "${fileConfiguration.fileType}"`);
        return;
    }

    const map = this.#clientSentFileConfigurations
      .get(device)!
      .get(fileConfiguration)!;
    _console.assertWithError(map, "map not found");

    let metadata = map.get(client);
    if (metadata) {
      const { sent, initiated } = map.get(client)!;
      if (initiated) {
        _console.log("already initiated");
        return;
      }
      if (sent) {
        _console.log("already sent file");
        return;
      }
    } else {
      metadata = {
        bytesTransferred: 0,
      };
      map.set(client, metadata);
    }

    const isBusy = this.#isBusyTransferringFile(device, client);
    _console.log({ isBusy, metadata });

    if (isBusy) {
      _console.log("currently busy - will send later");
    } else {
      _console.log("not busy - sending file to client");
      const fileLengthDeviceMessage = this.#createDeviceMessage(
        device,
        "setFileLength",
        valueToUInt32DataView(fileConfiguration.length, true),
      );
      const fileChecksumDeviceMessage = this.#createDeviceMessage(
        device,
        "setFileChecksum",
        valueToUInt32DataView(fileConfiguration.checksum, true),
      );

      const receivingFileTransferStatusDeviceMessage =
        this.#createDeviceMessage(
          device,
          "fileTransferStatus",
          enumToDataView(FileTransferStatuses, "receiving"),
        );
      const deviceMessages: DeviceMessage[] = [
        fileLengthDeviceMessage,
        fileChecksumDeviceMessage,
        receivingFileTransferStatusDeviceMessage,
      ];

      const fileMetaData = this.#clientFileConfigurationMetaData
        .get(device)!
        .get(fileConfiguration)!;
      deviceMessages.unshift(...fileMetaData);

      const fileTypeDeviceMessage = this.#createDeviceMessage(
        device,
        "setFileType",
        enumToDataView(FileTypes, fileConfiguration.fileType),
      );
      deviceMessages.unshift(fileTypeDeviceMessage);

      const _deviceMessages = this.#sendFileBlockToClient(
        device,
        client,
        fileConfiguration,
        metadata,
      );
      if (_deviceMessages) {
        deviceMessages.push(..._deviceMessages);
      }

      if (sendImmediately) {
        this.sendToClient(
          client,
          this.#createDeviceServerMessage(device, ...deviceMessages),
        );
      }

      return deviceMessages;
    }
  }

  #filterClientToDeviceTxMessage(
    client: ServerClient,
    device: Device,
    dataView: DataView<ArrayBuffer>,
    deviceMessages: DeviceMessage[],
    broadcastDeviceMessages: DeviceMessage[],
  ) {
    const filteredTxMessages: TxMessage[] = [];
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
                if (true) {
                  // responds directly back to the client without a device roundtrip
                  deviceMessages.push(getSensorConfigurationMessage);
                  return;
                } else {
                  // does a roundtrip with the device
                  message = getSensorConfigurationMessage;
                }
              }
            }
            break;
          case "displayContextCommands":
            {
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

              const partitionedFilteredDisplayContextCommands: DisplayContextCommand[][] =
                [];
              let sendRemaining = false;

              if (true) {
                let lastCommandToSendImmediatelyIndex = -1;
                for (
                  let index = filteredDisplayContextCommands.length - 1;
                  index >= 0;
                  index--
                ) {
                  const displayContextCommand =
                    filteredDisplayContextCommands[index];
                  const shouldSendImmediately =
                    ShowDisplayContextCommandTypes.includes(
                      displayContextCommand.type as ShowDisplayContextCommandType,
                    );
                  if (shouldSendImmediately) {
                    lastCommandToSendImmediatelyIndex = index;
                    break;
                  }
                }

                sendRemaining =
                  lastCommandToSendImmediatelyIndex == -1 ||
                  lastCommandToSendImmediatelyIndex ==
                    filteredDisplayContextCommands.length - 1;
                if (sendRemaining) {
                  partitionedFilteredDisplayContextCommands.push(
                    filteredDisplayContextCommands,
                  );
                } else {
                  partitionedFilteredDisplayContextCommands.push(
                    filteredDisplayContextCommands.slice(
                      0,
                      lastCommandToSendImmediatelyIndex + 1,
                    ),
                  );
                  partitionedFilteredDisplayContextCommands.push(
                    filteredDisplayContextCommands.slice(
                      lastCommandToSendImmediatelyIndex + 1,
                    ),
                  );
                }
              } else {
                partitionedFilteredDisplayContextCommands.push([]);
                filteredDisplayContextCommands.forEach(
                  (displayContextCommand, index) => {
                    const shouldSendImmediately =
                      ShowDisplayContextCommandTypes.includes(
                        displayContextCommand.type as ShowDisplayContextCommandType,
                      );
                    const isLast =
                      index == filteredDisplayContextCommands.length - 1;

                    const _filteredDisplayContextCommands =
                      partitionedFilteredDisplayContextCommands.at(-1)!;

                    const endsWithSendImmediately =
                      _filteredDisplayContextCommands.length > 0 &&
                      ShowDisplayContextCommandTypes.includes(
                        _filteredDisplayContextCommands.at(-1)!
                          .type as ShowDisplayContextCommandType,
                      );

                    _console.log({
                      isLast,
                      shouldSendImmediately,
                      endsWithSendImmediately,
                      _filteredDisplayContextCommands,
                    });

                    if (!shouldSendImmediately && endsWithSendImmediately) {
                      partitionedFilteredDisplayContextCommands.push([]);
                    }

                    _filteredDisplayContextCommands.push(displayContextCommand);

                    if (shouldSendImmediately && isLast) {
                      sendRemaining = true;
                    }
                  },
                );
              }
              _console.log(
                "partitionedFilteredDisplayContextCommands",
                partitionedFilteredDisplayContextCommands,
                { sendRemaining },
              );
              partitionedFilteredDisplayContextCommands.forEach(
                (_filteredDisplayContextCommands, index) => {
                  const isLast =
                    index ==
                    partitionedFilteredDisplayContextCommands.length - 1;
                  const sendImmediately = !isLast || sendRemaining;
                  _console.log(
                    "filteredDisplayContextCommands",
                    _filteredDisplayContextCommands,
                    { isLast, sendImmediately },
                  );
                  device.displayManager.runContextCommands(
                    _filteredDisplayContextCommands,
                    sendImmediately,
                  );
                },
              );
              return;
            }
            break;
          case "setFileChecksum":
          case "setFileLength":
          case "setFileType":
          case "setDisplaySpriteSheetName":
          case "setTfliteSensorTypes":
          case "setTfliteName":
          case "setTfliteSampleRate":
          case "setTfliteTask":
            {
              const map =
                this.#clientsWaitingToRequestSendMetaData.get(device)!;
              if (!map.has(client)) {
                map.set(client, []);
              }
              const messages = map.get(client)!;
              _console.log("storing message in fileTransferMetaData", message);
              messages.push(message);
              return;
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

              const isClientSendingToSelf =
                client == this.#clientsSendingToSelf.get(device);
              const isClientSendingToDevice =
                client == this.#clientsSendingToDevice.get(device);
              const isClientReceivingFileFromSelf =
                this.#isClientBusyReceivingFileFromSelf(client, device);
              const isBusy = this.#isBusyTransferringFile(device, client);

              _console.log({
                isBusy,
                fileTransferCommand,
                isClientSendingToSelf,
                isClientSendingToDevice,
                isClientReceivingFileFromSelf,
              });

              if (isBusy) {
                _console.log("busy transferring file");
                switch (fileTransferCommand) {
                  case "startSend":
                    _console.log(
                      "adding client to #clientsWaitingToRequestSend...",
                    );
                    if (
                      !this.#clientsWaitingToRequestSend
                        .get(device)!
                        .includes(client)
                    ) {
                      this.#clientsWaitingToRequestSend
                        .get(device)!
                        .push(client);
                    } else {
                      _console.error(
                        "client already in #clientsWaitingToRequestSend",
                      );
                    }
                    break;
                  case "startReceive":
                    _console.log("adding client to receive queue...");
                    // FILL - add to queue
                    break;
                  case "cancel":
                    if (isClientSendingToSelf) {
                      _console.log("cancelling client sending file to self");
                      this.#onDoneReceivingFileFromClient(
                        device,
                        client,
                        deviceMessages,
                      );
                      return;
                    } else if (isClientReceivingFileFromSelf) {
                      _console.log("cancelling client receiving file to self");
                      // FILL
                      return;
                    } else if (isClientSendingToDevice) {
                      _console.log("cancelling client sending file to device");
                    } else {
                      _console.error(
                        "not allowing client to cancel device file transfer",
                      );
                      return;
                    }
                    break;
                }
                return;
              } else {
                switch (fileTransferCommand) {
                  case "startSend":
                    _console.log("adding client to #clientsRequestingSend");
                    this.#clientsRequestingSend.set(device, client);

                    const fileTransferMetaDataMessages =
                      this.#clientsWaitingToRequestSendMetaData
                        .get(device)!
                        .get(client)!;
                    this.#clientsWaitingToRequestSendMetaData
                      .get(device)!
                      .delete(client);

                    _console.log(
                      "fileTransferMetaDataMessages",
                      fileTransferMetaDataMessages,
                    );

                    fileTransferMetaDataMessages.forEach((message) => {
                      if (this.#allowClientToDevice(client, device, message)) {
                        filteredTxMessages.push(message as TxMessage);
                        device._onRemoteConnectionMessageSent(
                          message.type as TxRxMessageType,
                          message.data,
                        );
                      }
                    });
                    break;
                  case "startReceive":
                    // FILL
                    break;
                  case "cancel":
                    _console.error("device is not busy - no reason to cancel");
                    break;
                }
              }
            }
            break;
          case "fileBytesTransferred":
            if (this.#isClientBusyReceivingFileFromSelf(client, device)) {
              const bytesTransferred = dataView.getUint32(0, true);
              const fileConfiguration =
                this.#getCurrentFileConfigurationSendingToClientDevice(
                  client,
                  device,
                )!;
              const metadata = this.#clientSentFileConfigurations
                .get(device)!
                .get(fileConfiguration)!
                .get(client)!;
              _console.log({ bytesTransferred, fileConfiguration, metadata });

              if (metadata.bytesTransferred != bytesTransferred) {
                _console.log(
                  `invalid bytesTransferred - expected ${metadata.bytesTransferred}, got ${bytesTransferred} - cancelling`,
                );

                metadata.initiated = false;
                metadata.bytesTransferred = 0;

                const idleFileTransferStatusMessage = this.#createDeviceMessage(
                  device,
                  "fileTransferStatus",
                  enumToDataView(FileTransferStatuses, "idle"),
                );
                deviceMessages.push(idleFileTransferStatusMessage);

                const _deviceMessages = this.#sendNextFileToClient(
                  device,
                  client,
                );
                if (_deviceMessages) {
                  deviceMessages.push(..._deviceMessages);
                }
                return;
              }

              const _deviceMessages = this.#sendFileBlockToClient(
                device,
                client,
                fileConfiguration,
                metadata,
              );
              if (_deviceMessages) {
                deviceMessages.push(..._deviceMessages);
              }

              return;
            }
            break;
          case "setFileBlock":
            {
              const isClientSendingToSelf =
                client == this.#clientsSendingToSelf.get(device);
              const isDeviceConnectedDirectly =
                device.connectionType != "client";
              const isClientSendingToDevice =
                client == this.#clientsSendingToDevice.get(device);

              _console.log({
                isClientSendingToSelf,
                isDeviceConnectedDirectly,
                isClientSendingToDevice,
              });

              let sentToDevice = false;

              device.addEventListener(
                "fileTransferProgress",
                async (event) => {
                  const { message } = event;
                  const { isComplete, fileType, fileConfiguration } = message;
                  let { bytesTransferred } = message;

                  _console.log("intercepted fileTransferProgress", message, {
                    sentToDevice,
                  });

                  if (isComplete && !isClientSendingToSelf) {
                    this.#appendClientSentFileConfigurations(device, client);
                  }

                  const deviceMessages: DeviceMessage[] = [];

                  if (isComplete) {
                    switch (fileType) {
                      case "tflite":
                        // TODO
                        break;
                      case "spriteSheet":
                        {
                          const arrayBuffer = fileConfiguration!.buffer;
                          const dataView = new DataView(arrayBuffer);
                          const parsedSpriteSheet =
                            device.parseDisplaySpriteSheet(
                              dataView,
                              device.pendingDisplaySpriteSheetName,
                            );
                          if (!isClientSendingToSelf) {
                            device.displayManager.pendingSpriteSheet =
                              parsedSpriteSheet;
                          }
                          await device.uploadDisplaySpriteSheet(
                            parsedSpriteSheet,
                          );
                        }
                        break;
                    }
                  }

                  if (!sentToDevice) {
                    _console.log(
                      "relaying fileBytesTransferred back to client directly",
                    );
                    const fileBytesTransferredDeviceMessage =
                      this.#createDeviceMessage(
                        device,
                        "fileBytesTransferred",
                        valueToUInt32DataView(bytesTransferred, true),
                      );

                    deviceMessages.push(fileBytesTransferredDeviceMessage);
                  }

                  if (isComplete && isClientSendingToSelf) {
                    _console.log("client done sending file to self");
                    this.#onDoneReceivingFileFromClient(
                      device,
                      client,
                      deviceMessages,
                    );

                    switch (fileType) {
                      case "tflite":
                        {
                          const tfliteIsReadyDeviceMessage =
                            this.#createDeviceMessage(device, "tfliteIsReady");
                          deviceMessages.push(tfliteIsReadyDeviceMessage);
                        }
                        break;
                      case "spriteSheet":
                        {
                          const displaySpriteSheetIndexDeviceMessage =
                            this.#createDeviceMessage(
                              device,
                              "displaySpriteSheetIndex",
                            );
                          deviceMessages.push(
                            displaySpriteSheetIndexDeviceMessage,
                          );
                        }
                        break;
                    }
                  }

                  if (deviceMessages.length > 0) {
                    _console.log(
                      "sending fileTransfer deviceMessages to client",
                      deviceMessages,
                    );
                    this.sendToClient(
                      client,
                      this.#createDeviceServerMessage(
                        device,
                        ...deviceMessages,
                      ),
                    );
                  }
                },
                {
                  once: true,
                },
              );

              if (isClientSendingToSelf) {
                _console.log("parsing file block sent from client");
                device._onRemoteConnectionMessageSent(messageType, dataView);
                return;
              } else {
                if (isDeviceConnectedDirectly) {
                  const { fileBytesTransferred } = device;
                  const fileHeaderLength =
                    device._fileTransferManager.indirectSentBlocks.length == 0
                      ? dataView.getUint16(0, true)
                      : device.fileHeaderLength!;

                  const headerBytesRemaining = Math.max(
                    0,
                    fileHeaderLength - fileBytesTransferred,
                  );
                  const didSendHeader = headerBytesRemaining == 0;
                  _console.log({
                    fileBytesTransferred,
                    fileHeaderLength,
                    headerBytesRemaining,
                    didSendHeader,
                  });

                  const data = message.data as DataView;

                  const nonHeaderData = data.buffer.slice(headerBytesRemaining);
                  _console.log("nonHeaderData", nonHeaderData);

                  if (nonHeaderData.byteLength > 0) {
                    _console.log("relaying nonHeaderData", nonHeaderData);
                    message.data = nonHeaderData;
                    device.addEventListener(
                      "fileBytesTransferred",
                      (event) => {
                        let { bytesTransferred } = event.message;

                        bytesTransferred += device.fileHeaderLength!;
                        _console.log(
                          `relaying bytesTransferred ${bytesTransferred} (+${device.fileHeaderLength!})`,
                        );

                        const fileBytesTransferredDeviceMessage =
                          this.#createDeviceMessage(
                            device,
                            "fileBytesTransferred",
                            valueToUInt32DataView(bytesTransferred, true),
                          );

                        this.sendToClient(
                          client,
                          this.#createDeviceServerMessage(
                            device,
                            fileBytesTransferredDeviceMessage,
                          ),
                        );
                      },
                      { once: true },
                    );
                  } else {
                    _console.log(
                      "nonHeaderData is empty - parsing client file block locally",
                    );
                    device._onRemoteConnectionMessageSent(
                      messageType,
                      dataView,
                    );
                    return;
                  }
                }
              }
              sentToDevice = true;
            }
            break;
        }

        if (this.#allowClientToDevice(client, device, message)) {
          filteredTxMessages.push(message as TxMessage);
          device._onRemoteConnectionMessageSent(messageType, dataView);
        }
      },
      null,
      true,
    );
    return filteredTxMessages;
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
        {
          const filteredTxMessages = this.#filterClientToDeviceTxMessage(
            client,
            device,
            dataView,
            deviceMessages,
            broadcastDeviceMessages,
          );
          _console.log("filteredTxMessages", filteredTxMessages);
          device.connectionManager!.sendTxMessages(
            filteredTxMessages,
            true,
            true,
          );
        }
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
