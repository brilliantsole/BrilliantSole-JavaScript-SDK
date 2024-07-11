import { createConsole } from "../utils/Console";
import EventDispatcher, { BoundEventListeners, Event, SpecificEvent } from "../utils/EventDispatcher";
import {
  createServerMessage,
  createDeviceMessage,
  ServerMessageTypes,
  pongMessage,
  ServerMessageType,
  DeviceMessage,
  ServerMessage,
} from "./ServerUtils";
import Device, {
  BoundDeviceEventListeners,
  BoundStaticDeviceEventListeners,
  SpecificDeviceEvent,
  SpecificStaticDeviceEvent,
} from "../Device";
import { addEventListeners, removeEventListeners } from "../utils/EventUtils";
import scanner from "../scanner/Scanner";
import { parseMessage, parseStringFromDataView } from "../utils/ParseUtils";
import { ConnectionMessageType, ConnectionMessageTypes } from "../connection/BaseConnectionManager";
import { concatenateArrayBuffers } from "../utils/ArrayBufferUtils";
import { BoundScannerEventListeners, DiscoveredDevice, SpecificScannerEvent } from "../scanner/BaseScanner";

const _console = createConsole("BaseServer", { log: true });

export const ServerEventTypes = ["clientConnected", "clientDisconnected"] as const;
export type ServerEventType = (typeof ServerEventTypes)[number];

interface ServerEventMessages {
  clientConnected: { client: any };
  clientDisconnected: { client: any };
}

export type ServerEventDispatcher = EventDispatcher<BaseServer, ServerEventType, ServerEventMessages>;
export type SpecificServerEvent<EventType extends ServerEventType> = SpecificEvent<
  BaseServer,
  ServerEventType,
  ServerEventMessages,
  EventType
>;
export type ServerEvent = Event<BaseServer, ServerEventType, ServerEventMessages>;
export type BoundServerEventListeners = BoundEventListeners<BaseServer, ServerEventType, ServerEventMessages>;

abstract class BaseServer {
  /** @throws {Error} if abstract class */
  #assertIsSubclass() {
    _console.assertWithError(this.constructor != BaseServer, `${this.constructor.name} must be subclassed`);
  }

  // EVENT DISPATCHER
  protected eventDispatcher = new EventDispatcher(this, ServerEventTypes);
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
    this.#assertIsSubclass();

    _console.assertWithError(scanner, "no scanner defined");

    addEventListeners(scanner, this.#boundScannerListeners);
    addEventListeners(Device, this.#boundStaticDeviceListeners);
    addEventListeners(this, this.#boundServerListeners);
  }

  get numberOfClients() {
    return 0;
  }

  static #ClearSensorConfigurationsWhenNoClients = true;
  static get ClearSensorConfigurationsWhenNoClients() {
    return this.#ClearSensorConfigurationsWhenNoClients;
  }
  static set ClearSensorConfigurationsWhenNoClients(newValue) {
    _console.assertTypeWithError(newValue, "boolean");
    this.#ClearSensorConfigurationsWhenNoClients = newValue;
  }

  #clearSensorConfigurationsWhenNoClients = BaseServer.#ClearSensorConfigurationsWhenNoClients;
  get clearSensorConfigurationsWhenNoClients() {
    return this.#clearSensorConfigurationsWhenNoClients;
  }
  set clearSensorConfigurationsWhenNoClients(newValue) {
    _console.assertTypeWithError(newValue, "boolean");
    this.#clearSensorConfigurationsWhenNoClients = newValue;
  }

  // SERVER LISTENERS
  #boundServerListeners: BoundServerEventListeners = {
    clientConnected: this.#onClientConnected.bind(this),
    clientDisconnected: this.#onClientDisconnected.bind(this),
  };
  #onClientConnected(event: SpecificServerEvent<"clientConnected">) {
    const client = event.message.client;
    _console.log("onClientConnected");
  }
  #onClientDisconnected(event: SpecificServerEvent<"clientDisconnected">) {
    const client = event.message.client;
    _console.log("onClientDisconnected");
    if (this.numberOfClients == 0 && this.clearSensorConfigurationsWhenNoClients) {
      Device.ConnectedDevices.forEach((device) => {
        device.clearSensorConfiguration();
        device.setTfliteInferencingEnabled(false);
      });
    }
  }

  // CLIENT MESSAGING
  broadcastMessage(message: ArrayBuffer) {
    _console.log("broadcasting", message);
  }

  // SCANNER
  #boundScannerListeners: BoundScannerEventListeners = {
    isScanningAvailable: this.#onScannerIsAvailable.bind(this),
    isScanning: this.#onScannerIsScanning.bind(this),
    discoveredDevice: this.#onScannerDiscoveredDevice.bind(this),
    expiredDiscoveredDevice: this.#onExpiredDiscoveredDevice.bind(this),
  };

  #onScannerIsAvailable(event: SpecificScannerEvent<"isScanningAvailable">) {
    this.broadcastMessage(this.#isScanningAvailableMessage);
  }
  get #isScanningAvailableMessage() {
    return createServerMessage({ type: "isScanningAvailable", data: scanner!.isScanningAvailable });
  }

  #onScannerIsScanning(event: SpecificScannerEvent<"isScanning">) {
    this.broadcastMessage(this.#isScanningMessage);
  }
  get #isScanningMessage() {
    return createServerMessage({ type: "isScanning", data: scanner!.isScanning });
  }

  #onScannerDiscoveredDevice(event: SpecificScannerEvent<"discoveredDevice">) {
    const { discoveredDevice } = event.message;
    _console.log(discoveredDevice);

    this.broadcastMessage(this.#createDiscoveredDeviceMessage(discoveredDevice));
  }
  #createDiscoveredDeviceMessage(discoveredDevice: DiscoveredDevice) {
    return createServerMessage({ type: "discoveredDevice", data: discoveredDevice });
  }

  #onExpiredDiscoveredDevice(event: SpecificScannerEvent<"expiredDiscoveredDevice">) {
    const { discoveredDevice } = event.message;
    _console.log("expired", discoveredDevice);
    this.broadcastMessage(this.#createExpiredDiscoveredDeviceMessage(discoveredDevice));
  }
  #createExpiredDiscoveredDeviceMessage(discoveredDevice: DiscoveredDevice) {
    return createServerMessage({ type: "expiredDiscoveredDevice", data: discoveredDevice.bluetoothId });
  }

  get #discoveredDevicesMessage() {
    const serverMessages: ServerMessage[] = scanner!.discoveredDevicesArray.map((discoveredDevice) => {
      return { type: "discoveredDevice", data: discoveredDevice };
    });
    return createServerMessage(...serverMessages);
  }

  get #connectedDevicesMessage() {
    return createServerMessage({
      type: "connectedDevices",
      data: JSON.stringify(Device.ConnectedDevices.map((device) => device.bluetoothId)),
    });
  }

  // DEVICE LISTENERS

  #boundDeviceListeners: BoundDeviceEventListeners = {
    connectionMessage: this.#onDeviceConnectionMessage.bind(this),
  };

  #createDeviceMessage(device: Device, messageType: ConnectionMessageType, dataView?: DataView): DeviceMessage {
    return { type: messageType, data: dataView || device.latestConnectionMessage.get(messageType) };
  }

  #onDeviceConnectionMessage(deviceEvent: SpecificDeviceEvent<"connectionMessage">) {
    const { target: device, message } = deviceEvent;
    _console.log("onDeviceConnectionMessage", deviceEvent.message);

    if (!device.isConnected) {
      return;
    }

    const { messageType, dataView } = message;

    this.broadcastMessage(
      this.#createDeviceServerMessage(device, this.#createDeviceMessage(device, messageType, dataView))
    );
  }

  // STATIC DEVICE LISTENERS
  #boundStaticDeviceListeners: BoundStaticDeviceEventListeners = {
    deviceConnected: this.#onDeviceConnected.bind(this),
    deviceDisconnected: this.#onDeviceDisconnected.bind(this),
    deviceIsConnected: this.#onDeviceIsConnected.bind(this),
  };

  #onDeviceConnected(staticDeviceEvent: SpecificStaticDeviceEvent<"deviceConnected">) {
    const { device } = staticDeviceEvent.message;
    _console.log("onDeviceConnected", device.bluetoothId);
    addEventListeners(device, this.#boundDeviceListeners);
  }

  #onDeviceDisconnected(staticDeviceEvent: SpecificStaticDeviceEvent<"deviceDisconnected">) {
    const { device } = staticDeviceEvent.message;
    _console.log("onDeviceDisconnected", device.bluetoothId);
    removeEventListeners(device, this.#boundDeviceListeners);
  }

  #onDeviceIsConnected(staticDeviceEvent: SpecificStaticDeviceEvent<"deviceIsConnected">) {
    const { device } = staticDeviceEvent.message;
    _console.log("onDeviceIsConnected", device.bluetoothId);
    this.broadcastMessage(this.#createDeviceIsConnectedMessage(device));
  }
  #createDeviceIsConnectedMessage(device: Device) {
    return this.#createDeviceServerMessage(device, { type: "isConnected", data: device.isConnected });
  }

  #createDeviceServerMessage(device: Device, ...messages: DeviceMessage[]) {
    return createServerMessage({
      type: "deviceMessage",
      data: [device.bluetoothId!, createDeviceMessage(...messages)],
    });
  }

  // PARSING
  parseClientMessage(dataView: DataView) {
    let responseMessages: ArrayBuffer[] = [];

    parseMessage(dataView, ServerMessageTypes, this.#onClientMessage.bind(this), { responseMessages }, true);

    responseMessages = responseMessages.filter(Boolean);

    if (responseMessages.length > 0) {
      return concatenateArrayBuffers(responseMessages);
    }
  }

  #onClientMessage(messageType: ServerMessageType, dataView: DataView, context: { responseMessages: ArrayBuffer[] }) {
    const { responseMessages } = context;
    switch (messageType) {
      case "ping":
        responseMessages.push(pongMessage);
        break;
      case "pong":
        break;
      case "isScanningAvailable":
        responseMessages.push(this.#isScanningAvailableMessage);
        break;
      case "isScanning":
        responseMessages.push(this.#isScanningMessage);
        break;
      case "startScan":
        scanner!.startScan();
        break;
      case "stopScan":
        scanner!.stopScan();
        break;
      case "discoveredDevices":
        responseMessages.push(this.#discoveredDevicesMessage);
        break;
      case "connectToDevice":
        {
          const { string: deviceId } = parseStringFromDataView(dataView);
          scanner!.connectToDevice(deviceId);
        }
        break;
      case "disconnectFromDevice":
        {
          const { string: deviceId } = parseStringFromDataView(dataView);
          const device = Device.ConnectedDevices.find((device) => device.bluetoothId == deviceId);
          if (!device) {
            _console.error(`no device found with id ${deviceId}`);
            break;
          }
          device.disconnect();
        }
        break;
      case "connectedDevices":
        responseMessages.push(this.#connectedDevicesMessage);
        break;
      case "deviceMessage":
        {
          const { string: deviceId, byteOffset } = parseStringFromDataView(dataView);
          const device = Device.ConnectedDevices.find((device) => device.bluetoothId == deviceId);
          if (!device) {
            _console.error(`no device found with id ${deviceId}`);
            break;
          }
          const _dataView = new DataView(dataView.buffer, dataView.byteOffset + byteOffset);
          const responseMessage = this.parseClientDeviceMessage(device, _dataView);
          if (responseMessage) {
            responseMessages.push();
          }
        }
        break;
      default:
        _console.error(`uncaught messageType "${messageType}"`);
        break;
    }
  }

  protected parseClientDeviceMessage(device: Device, dataView: DataView) {
    _console.log("onDeviceMessage", device.bluetoothId, dataView);

    let responseMessages: DeviceMessage[] = [];

    parseMessage(
      dataView,
      ConnectionMessageTypes,
      this.#parseClientDeviceMessageCallback.bind(this),
      { responseMessages, device },
      true
    );

    if (responseMessages.length > 0) {
      return this.#createDeviceServerMessage(device, ...responseMessages);
    }
  }

  #parseClientDeviceMessageCallback(
    messageType: ConnectionMessageType,
    dataView: DataView,
    context: { responseMessages: DeviceMessage[]; device: Device }
  ) {
    switch (messageType) {
      case "smp":
        context.device.connectionManager!.sendSmpMessage(dataView.buffer);
        break;
      case "tx":
        context.device.connectionManager!.sendTxData(dataView.buffer);
        break;
      default:
        context.responseMessages.push(this.#createDeviceMessage(context.device, messageType));
        break;
    }
  }
}

export default BaseServer;
