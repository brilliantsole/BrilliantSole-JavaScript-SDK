import { dataToArrayBuffer } from "../../utils/ArrayBufferUtils";
import { createConsole } from "../../utils/Console";
import { isInNode } from "../../utils/environment";
import { addEventListeners, removeEventListeners } from "../../utils/EventDispatcher";
import {
  allServiceUUIDs,
  serviceUUIDs,
  optionalServiceUUIDs,
  getServiceNameFromUUID,
  getCharacteristicNameFromUUID,
  allCharacteristicUUIDs,
  characteristicUUIDs,
  allCharacteristicNames,
} from "./bluetoothUUIDs";
import BluetoothConnectionManager from "./BluetoothConnectionManager";

const _console = createConsole("NobleConnectionManager", { log: true });

// NODE_START
import noble from "@abandonware/noble";
// NODE_END

/** @typedef {import("./bluetoothUUIDs").BluetoothCharacteristicName} BluetoothCharacteristicName */
/** @typedef {import("./bluetoothUUIDs").BluetoothServiceName} BluetoothServiceName */

/** @typedef {import("../BaseConnectionManager").ConnectionMessageType} ConnectionMessageType */
/** @typedef {import("../BaseConnectionManager").ConnectionMessageType} ConnectionType */

class NobleConnectionManager extends BluetoothConnectionManager {
  get bluetoothId() {
    return this.#noblePeripheral?.id;
  }

  static get isSupported() {
    return isInNode;
  }
  /** @type {ConnectionType} */
  static get type() {
    return "noble";
  }

  get isConnected() {
    return this.#noblePeripheral?.state == "connected";
  }

  async connect() {
    await super.connect();
    await this.#noblePeripheral.connectAsync();
  }
  async disconnect() {
    await super.disconnect();
    await this.#noblePeripheral.disconnectAsync();
  }

  /**
   * @param {ConnectionMessageType} messageType
   * @param {DataView|ArrayBuffer} data
   */
  async sendMessage(messageType, data) {
    await super.sendMessage(...arguments);

    const characteristicName = this.characteristicNameForMessageType(messageType);
    _console.log({ characteristicName });

    const characteristic = this.#characteristics.get(characteristicName);
    _console.assertWithError(characteristic, `no characteristic found with name "${characteristicName}"`);
    if (data instanceof DataView) {
      data = data.buffer;
    }
    const buffer = Buffer.from(data);
    _console.log("writing data", buffer);
    const withoutResponse = true;
    await characteristic.writeAsync(buffer, withoutResponse);
    if (characteristic.properties.includes("read")) {
      await characteristic.readAsync();
    }
  }

  /**
   * @param {BluetoothCharacteristicName} characteristicName
   * @param {ArrayBuffer} data
   */
  async writeCharacteristic(characteristicName, data) {
    const characteristic = this.#characteristics.get(characteristicName);
    _console.assertWithError(characteristic, `no characteristic found with name "${characteristicName}"`);
    // if (data instanceof DataView) {
    //     data = data.buffer;
    // }
    const buffer = Buffer.from(data);
    _console.log("writing data", buffer);
    const withoutResponse = true;
    await characteristic.writeAsync(buffer, withoutResponse);
    if (characteristic.properties.includes("read")) {
      await characteristic.readAsync();
    }
  }

  /** @type {boolean} */
  get canReconnect() {
    return this.#noblePeripheral.connectable;
  }
  async reconnect() {
    await super.reconnect();
    _console.log("attempting to reconnect...");
    this.connect();
  }

  // NOBLE
  /** @type {noble.Peripheral?} */
  #noblePeripheral;
  get noblePeripheral() {
    return this.#noblePeripheral;
  }
  set noblePeripheral(newNoblePeripheral) {
    _console.assertTypeWithError(newNoblePeripheral, "object");
    if (this.noblePeripheral == newNoblePeripheral) {
      _console.log("attempted to assign duplicate noblePeripheral");
      return;
    }

    _console.log("newNoblePeripheral", newNoblePeripheral.id);

    if (this.#noblePeripheral) {
      removeEventListeners(this.#noblePeripheral, this.#unboundNoblePeripheralListeners);
      delete this.#noblePeripheral._connectionManager;
    }

    if (newNoblePeripheral) {
      newNoblePeripheral._connectionManager = this;
      addEventListeners(newNoblePeripheral, this.#unboundNoblePeripheralListeners);
    }

    this.#noblePeripheral = newNoblePeripheral;
  }

  // NOBLE EVENTLISTENERS
  #unboundNoblePeripheralListeners = {
    connect: this.#onNoblePeripheralConnect,
    disconnect: this.#onNoblePeripheralDisconnect,
    rssiUpdate: this.#onNoblePeripheralRssiUpdate,
    servicesDiscover: this.#onNoblePeripheralServicesDiscover,
  };

  async #onNoblePeripheralConnect() {
    await this._connectionManager.onNoblePeripheralConnect(this);
  }
  /** @param {noble.Peripheral} noblePeripheral */
  async onNoblePeripheralConnect(noblePeripheral) {
    _console.log("onNoblePeripheralConnect", noblePeripheral.id, noblePeripheral.state);
    if (noblePeripheral.state == "connected") {
      await this.#noblePeripheral.discoverServicesAsync(allServiceUUIDs);
    }
    // this gets called when it connects and disconnects, so we use the noblePeripheral's "state" property instead
    await this.#onNoblePeripheralState();
  }

  async #onNoblePeripheralDisconnect() {
    await this._connectionManager.onNoblePeripheralConnect(this);
  }
  /** @param {noble.Peripheral} noblePeripheral */
  async onNoblePeripheralDisconnect(noblePeripheral) {
    _console.log("onNoblePeripheralDisconnect", noblePeripheral.id);
    await this.#onNoblePeripheralState();
  }

  async #onNoblePeripheralState() {
    _console.log(`noblePeripheral ${this.bluetoothId} state ${this.#noblePeripheral.state}`);

    switch (this.#noblePeripheral.state) {
      case "connected":
        //this.status = "connected";
        break;
      case "connecting":
        //this.status = "connecting";
        break;
      case "disconnected":
        this.#removeEventListeners();
        this.status = "not connected";
        break;
      case "disconnecting":
        this.status = "disconnecting";
        break;
      case "error":
        _console.error("noblePeripheral error");
        break;
      default:
        _console.log(`uncaught noblePeripheral state ${this.#noblePeripheral.state}`);
        break;
    }
  }

  #removeEventListeners() {
    _console.log("removing noblePeripheral eventListeners");
    this.#services.forEach((service) => {
      removeEventListeners(service, this.#unboundNobleServiceListeners);
    });
    this.#services.clear();

    this.#characteristics.forEach((characteristic) => {
      removeEventListeners(characteristic, this.#unboundNobleCharacteristicListeners);
    });
    this.#characteristics.clear();
  }

  /** @param {number} rssi */
  async #onNoblePeripheralRssiUpdate(rssi) {
    await this._connectionManager.onNoblePeripheralRssiUpdate(this, rssi);
  }
  /**
   * @param {noble.Peripheral} noblePeripheral
   * @param {number} rssi
   */
  async onNoblePeripheralRssiUpdate(noblePeripheral, rssi) {
    _console.log("onNoblePeripheralRssiUpdate", noblePeripheral.id, rssi);
    // FILL
  }

  /** @param {noble.Service[]} services */
  async #onNoblePeripheralServicesDiscover(services) {
    await this._connectionManager.onNoblePeripheralServicesDiscover(this, services);
  }
  /**
   * @param {noble.Peripheral} noblePeripheral
   * @param {noble.Service[]} services
   */
  async onNoblePeripheralServicesDiscover(noblePeripheral, services) {
    _console.log(
      "onNoblePeripheralServicesDiscover",
      noblePeripheral.id,
      services.map((service) => service.uuid)
    );
    for (const index in services) {
      const service = services[index];
      _console.log("service", service.uuid);
      const serviceName = getServiceNameFromUUID(service.uuid);
      _console.assertWithError(serviceName, `no name found for service uuid "${service.uuid}"`);
      _console.log({ serviceName });
      this.#services.set(serviceName, service);
      service._name = serviceName;
      service._connectionManager = this;
      addEventListeners(service, this.#unboundNobleServiceListeners);
      await service.discoverCharacteristicsAsync();
    }
  }

  // NOBLE SERVICE
  /** @type {Map.<BluetoothServiceName, BluetoothRemoteGATTService} */
  #services = new Map();

  #unboundNobleServiceListeners = {
    characteristicsDiscover: this.#onNobleServiceCharacteristicsDiscover,
  };

  /** @param {noble.Characteristic[]} characteristics */
  async #onNobleServiceCharacteristicsDiscover(characteristics) {
    await this._connectionManager.onNobleServiceCharacteristicsDiscover(this, characteristics);
  }
  /**
   * @param {noble.Service} service
   * @param {noble.Characteristic[]} characteristics
   */
  async onNobleServiceCharacteristicsDiscover(service, characteristics) {
    _console.log(
      "onNobleServiceCharacteristicsDiscover",
      service.uuid,
      characteristics.map((characteristic) => characteristic.uuid)
    );

    for (const index in characteristics) {
      const characteristic = characteristics[index];
      _console.log("characteristic", characteristic.uuid);
      const characteristicName = getCharacteristicNameFromUUID(characteristic.uuid);
      _console.assertWithError(characteristicName, `no name found for characteristic uuid "${characteristic.uuid}"`);
      _console.log({ characteristicName });
      this.#characteristics.set(characteristicName, characteristic);
      characteristic._name = characteristicName;
      characteristic._connectionManager = this;
      addEventListeners(characteristic, this.#unboundNobleCharacteristicListeners);
      if (characteristic.properties.includes("read")) {
        await characteristic.readAsync();
      }
      if (characteristic.properties.includes("notify")) {
        await characteristic.subscribeAsync();
      }
    }

    if (this.#hasAllCharacteristics) {
      this.status = "connected";
    }
  }

  // NOBLE CHARACTERISRTIC
  #unboundNobleCharacteristicListeners = {
    data: this.#onNobleCharacteristicData,
    write: this.#onNobleCharacteristicWrite,
    notify: this.#onNobleCharacteristicNotify,
  };

  /** @type {Map.<BluetoothCharacteristicName, noble.Characteristic} */
  #characteristics = new Map();

  get #hasAllCharacteristics() {
    return allCharacteristicNames.every((characteristicName) => {
      return this.#characteristics.has(characteristicName);
    });
  }

  /**
   * @param {Buffer} data
   * @param {boolean} isNotification
   */
  #onNobleCharacteristicData(data, isNotification) {
    this._connectionManager.onNobleCharacteristicData(this, data, isNotification);
  }
  /**
   * @param {noble.Characteristic} characteristic
   * @param {Buffer} data
   * @param {boolean} isNotification
   */
  onNobleCharacteristicData(characteristic, data, isNotification) {
    _console.log("onNobleCharacteristicData", characteristic.uuid, data, isNotification);
    const dataView = new DataView(dataToArrayBuffer(data));

    /** @type {BluetoothCharacteristicName} */
    const characteristicName = characteristic._name;
    _console.assertWithError(characteristicName, `no name found for characteristic with uuid "${characteristic.uuid}"`);

    this.onCharacteristicValueChanged(characteristicName, dataView);
  }

  #onNobleCharacteristicWrite() {
    this._connectionManager.onNobleCharacteristicWrite(this);
  }
  /**
   * @param {noble.Characteristic} characteristic
   */
  onNobleCharacteristicWrite(characteristic) {
    _console.log("onNobleCharacteristicWrite", characteristic.uuid);
    // FILL
  }

  /** @param {boolean} isSubscribed */
  #onNobleCharacteristicNotify(isSubscribed) {
    this._connectionManager.onNobleCharacteristicNotify(this, isSubscribed);
  }
  /**
   * @param {noble.Characteristic} characteristic
   * @param {boolean} isSubscribed
   */
  onNobleCharacteristicNotify(characteristic, isSubscribed) {
    _console.log("onNobleCharacteristicNotify", characteristic.uuid, isSubscribed);
  }
}

export default NobleConnectionManager;
