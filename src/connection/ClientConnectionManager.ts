import { createConsole } from "../utils/Console.ts";
import { isInBrowser } from "../utils/environment.ts";
import BaseConnectionManager, { ConnectionType, ConnectionMessageType } from "./BaseConnectionManager.ts";
import { DeviceEventTypes } from "../Device.ts";
import { parseMessage } from "../utils/ParseUtils.ts";
import { DeviceInformationMessageTypes } from "../DeviceInformationManager.ts";
import { DeviceEventType } from "../Device.ts";
import { ClientDeviceMessage } from "../server/ServerUtils.ts";
import BaseClient from "../server/BaseClient.ts";

const _console = createConsole("ClientConnectionManager", { log: false });

export type SendClientMessageCallback = (...messages: ClientDeviceMessage[]) => void;

const ClientDeviceInformationMessageTypes: ConnectionMessageType[] = [...DeviceInformationMessageTypes, "batteryLevel"];

class ClientConnectionManager extends BaseConnectionManager {
  static get isSupported() {
    return isInBrowser;
  }
  static get type(): ConnectionType {
    return "client";
  }

  get canUpdateFirmware() {
    // FIX - how to know if it has an smp characteristic?
    return true;
  }

  client!: BaseClient;

  #bluetoothId!: string;
  get bluetoothId() {
    return this.#bluetoothId!;
  }
  set bluetoothId(newBluetoothId) {
    _console.assertTypeWithError(newBluetoothId, "string");
    if (this.#bluetoothId == newBluetoothId) {
      _console.log("redundant bluetoothId assignment");
      return;
    }
    this.#bluetoothId = newBluetoothId;
  }

  #isConnected = false;
  get isConnected() {
    return this.#isConnected;
  }
  set isConnected(newIsConnected) {
    _console.assertTypeWithError(newIsConnected, "boolean");
    if (this.#isConnected == newIsConnected) {
      _console.log("redundant newIsConnected assignment", newIsConnected);
      return;
    }
    this.#isConnected = newIsConnected;

    this.status = this.#isConnected ? "connected" : "notConnected";

    if (this.isConnected) {
      this.#requestDeviceInformation();
    }
  }

  get isAvailable() {
    return this.client.isConnected;
  }

  async connect() {
    await super.connect();
    this.sendClientConnectMessage();
  }
  async disconnect() {
    await super.disconnect();
    this.sendClientDisconnectMessage();
  }

  get canReconnect() {
    return true;
  }
  async reconnect() {
    await super.reconnect();
    _console.log("attempting to reconnect...");
    this.connect();
  }

  sendClientMessage!: SendClientMessageCallback;
  sendClientConnectMessage!: Function;
  sendClientDisconnectMessage!: Function;

  async sendSmpMessage(data: ArrayBuffer) {
    super.sendSmpMessage(data);
    this.sendClientMessage({ type: "smp", data });
  }

  async sendTxData(data: ArrayBuffer) {
    super.sendTxData(data);
    if (data.byteLength == 0) {
      return;
    }
    this.sendClientMessage({ type: "tx", data });
  }

  #requestDeviceInformation() {
    this.sendClientMessage(...ClientDeviceInformationMessageTypes);
  }

  onClientMessage(dataView: DataView) {
    _console.log({ dataView });
    parseMessage(dataView, DeviceEventTypes, this.#onClientMessageCallback.bind(this), null, true);
    this.onMessagesReceived!();
  }

  #onClientMessageCallback(messageType: DeviceEventType, dataView: DataView) {
    let byteOffset = 0;

    _console.log({ messageType }, dataView);

    switch (messageType) {
      case "isConnected":
        const isConnected = Boolean(dataView.getUint8(byteOffset++));
        _console.log({ isConnected });
        this.isConnected = isConnected;
        break;

      case "rx":
        this.parseRxMessage(dataView);
        break;

      default:
        this.onMessageReceived!(messageType as ConnectionMessageType, dataView);
        break;
    }
  }
}

export default ClientConnectionManager;
