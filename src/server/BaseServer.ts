import { createConsole } from "../utils/Console.ts";
import EventDispatcher, { BoundEventListeners, Event, EventMap } from "../utils/EventDispatcher.ts";
import {
  createServerMessage,
  ServerMessageTypes,
  DeviceMessage,
  ServerMessage,
  ServerMessageType,
  createDeviceMessage,
} from "./ServerUtils.ts";
import Device, { BoundDeviceEventListeners, DeviceEventMap, DeviceEventType } from "../Device.ts";
import { addEventListeners, removeEventListeners } from "../utils/EventUtils.ts";
import scanner from "../scanner/Scanner.ts";
import { parseMessage, parseStringFromDataView } from "../utils/ParseUtils.ts";
import { ConnectionMessageType, ConnectionMessageTypes } from "../connection/BaseConnectionManager.ts";
import { BoundScannerEventListeners, DiscoveredDevice, ScannerEventMap } from "../scanner/BaseScanner.ts";
import { concatenateArrayBuffers } from "../utils/ArrayBufferUtils.ts";
import DeviceManager, { DeviceManagerEventMap, BoundDeviceManagerEventListeners } from "../DeviceManager.ts";

const _console = createConsole("BaseServer", { log: true });

export const ServerEventTypes = ["clientConnected", "clientDisconnected"] as const;
export type ServerEventType = (typeof ServerEventTypes)[number];

interface ServerEventMessages {
  clientConnected: { client: any };
  clientDisconnected: { client: any };
}

export type ServerEventDispatcher = EventDispatcher<BaseServer, ServerEventType, ServerEventMessages>;
export type ServerEvent = Event<BaseServer, ServerEventType, ServerEventMessages>;
export type ServerEventMap = EventMap<BaseServer, ServerEventType, ServerEventMessages>;
export type BoundServerEventListeners = BoundEventListeners<BaseServer, ServerEventType, ServerEventMessages>;

abstract class BaseServer {
  // EVENT DISPATCHER
  protected eventDispatcher: ServerEventDispatcher = new EventDispatcher(this as BaseServer, ServerEventTypes);
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
  #onClientConnected(event: ServerEventMap["clientConnected"]) {
    const client = event.message.client;
    _console.log("onClientConnected");
  }
  #onClientDisconnected(event: ServerEventMap["clientDisconnected"]) {
    const client = event.message.client;
    _console.log("onClientDisconnected");
    if (this.numberOfClients == 0 && this.clearSensorConfigurationsWhenNoClients) {
      DeviceManager.ConnectedDevices.forEach((device) => {
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

  #onScannerIsAvailable(event: ScannerEventMap["isScanningAvailable"]) {
    this.broadcastMessage(this.#isScanningAvailableMessage);
  }
  get #isScanningAvailableMessage() {
    return createServerMessage({ type: "isScanningAvailable", data: scanner!.isScanningAvailable });
  }

  #onScannerIsScanning(event: ScannerEventMap["isScanning"]) {
    this.broadcastMessage(this.#isScanningMessage);
  }
  get #isScanningMessage() {
    return createServerMessage({ type: "isScanning", data: scanner!.isScanning });
  }

  #onScannerDiscoveredDevice(event: ScannerEventMap["discoveredDevice"]) {
    const { discoveredDevice } = event.message;
    _console.log(discoveredDevice);

    this.broadcastMessage(this.#createDiscoveredDeviceMessage(discoveredDevice));
  }
  #createDiscoveredDeviceMessage(discoveredDevice: DiscoveredDevice) {
    return createServerMessage({ type: "discoveredDevice", data: discoveredDevice });
  }

  #onExpiredDiscoveredDevice(event: ScannerEventMap["expiredDiscoveredDevice"]) {
    const { discoveredDevice } = event.message;
    _console.log("expired", discoveredDevice);
    this.broadcastMessage(this.#createExpiredDiscoveredDeviceMessage(discoveredDevice));
  }
  #createExpiredDiscoveredDeviceMessage(discoveredDevice: DiscoveredDevice) {
    return createServerMessage({ type: "expiredDiscoveredDevice", data: discoveredDevice.bluetoothId });
  }

  get #discoveredDevicesMessage() {
    const serverMessages: ServerMessage[] = scanner!.discoveredDevicesArray
      .filter((discoveredDevice) => {
        const existingConnectedDevice = DeviceManager.ConnectedDevices.find(
          (device) => device.bluetoothId == discoveredDevice.bluetoothId
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
      data: JSON.stringify(DeviceManager.ConnectedDevices.map((device) => device.bluetoothId)),
    });
  }

  // DEVICE LISTENERS

  #boundDeviceListeners: BoundDeviceEventListeners = {
    connectionMessage: this.#onDeviceConnectionMessage.bind(this),
  };

  #createDeviceMessage(device: Device, messageType: ConnectionMessageType, dataView?: DataView): DeviceMessage {
    return {
      type: messageType as DeviceEventType,
      data: dataView || device.latestConnectionMessage.get(messageType),
    };
  }

  #onDeviceConnectionMessage(deviceEvent: DeviceEventMap["connectionMessage"]) {
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
  #boundDeviceManagerListeners: BoundDeviceManagerEventListeners = {
    deviceConnected: this.#onDeviceConnected.bind(this),
    deviceDisconnected: this.#onDeviceDisconnected.bind(this),
    deviceIsConnected: this.#onDeviceIsConnected.bind(this),
  };

  #onDeviceConnected(staticDeviceEvent: DeviceManagerEventMap["deviceConnected"]) {
    const { device } = staticDeviceEvent.message;
    _console.log("onDeviceConnected", device.bluetoothId);
    addEventListeners(device, this.#boundDeviceListeners);
  }

  #onDeviceDisconnected(staticDeviceEvent: DeviceManagerEventMap["deviceDisconnected"]) {
    const { device } = staticDeviceEvent.message;
    _console.log("onDeviceDisconnected", device.bluetoothId);
    removeEventListeners(device, this.#boundDeviceListeners);
  }

  #onDeviceIsConnected(staticDeviceEvent: DeviceManagerEventMap["deviceIsConnected"]) {
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
  protected parseClientMessage(dataView: DataView) {
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
          const device = DeviceManager.ConnectedDevices.find((device) => device.bluetoothId == deviceId);
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
          const device = DeviceManager.ConnectedDevices.find((device) => device.bluetoothId == deviceId);
          if (!device) {
            _console.error(`no device found with id ${deviceId}`);
            break;
          }
          const _dataView = new DataView(dataView.buffer, dataView.byteOffset + byteOffset);
          const responseMessage = this.parseClientDeviceMessage(device, _dataView);
          if (responseMessage) {
            responseMessages.push(responseMessage);
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
    _console.log(`clientDeviceMessage ${messageType} (${dataView.byteLength} bytes)`);
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
