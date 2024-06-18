import { createConsole } from "../../utils/Console.js";
import { isInNode, isInBrowser, isInBluefy, isInWebBLE } from "../../utils/environment.js";
import { addEventListeners, removeEventListeners } from "../../utils/EventDispatcher.js";
import {
  serviceUUIDs,
  optionalServiceUUIDs,
  getServiceNameFromUUID,
  getCharacteristicNameFromUUID,
  getCharacteristicProperties,
} from "./bluetoothUUIDs.js";
import BluetoothConnectionManager from "./BluetoothConnectionManager.js";

const _console = createConsole("WebBluetoothConnectionManager", { log: true });

/** @typedef {import("./bluetoothUUIDs.js").BluetoothCharacteristicName} BluetoothCharacteristicName */
/** @typedef {import("./bluetoothUUIDs.js").BluetoothServiceName} BluetoothServiceName */

/** @typedef {import("../BaseConnectionManager.js").ConnectionMessageType} ConnectionMessageType */
/** @typedef {import("../BaseConnectionManager.js").TxRxMessageType} TxRxMessageType */
/** @typedef {import("../BaseConnectionManager.js").ConnectionType} ConnectionType */

// NODE_START
import webbluetooth from "webbluetooth";
const { bluetooth } = webbluetooth;
var navigator = { bluetooth };
// NODE_END

// BROWSER_START
if (isInBrowser) {
  var navigator = window.navigator;
}
// BROWSER_END

class WebBluetoothConnectionManager extends BluetoothConnectionManager {
  get bluetoothId() {
    return this.device?.id;
  }

  /** @type {Object.<string, EventListener} */
  #boundBluetoothCharacteristicEventListeners = {
    characteristicvaluechanged: this.#onCharacteristicvaluechanged.bind(this),
  };
  /** @type {Object.<string, EventListener} */
  #boundBluetoothDeviceEventListeners = {
    gattserverdisconnected: this.#onGattserverdisconnected.bind(this),
  };

  static get isSupported() {
    return "bluetooth" in navigator;
  }
  /** @type {ConnectionType} */
  static get type() {
    return "webBluetooth";
  }

  /** @type {BluetoothDevice?} */
  #device;
  get device() {
    return this.#device;
  }
  set device(newDevice) {
    if (this.#device == newDevice) {
      _console.log("tried to assign the same BluetoothDevice");
      return;
    }
    if (this.#device) {
      removeEventListeners(this.#device, this.#boundBluetoothDeviceEventListeners);
    }
    if (newDevice) {
      addEventListeners(newDevice, this.#boundBluetoothDeviceEventListeners);
    }
    this.#device = newDevice;
  }

  /** @type {BluetoothRemoteGATTServer?} */
  get server() {
    return this.#device?.gatt;
  }
  get isConnected() {
    return this.server?.connected;
  }

  /** @type {Map.<BluetoothServiceName, BluetoothRemoteGATTService} */
  #services = new Map();
  /** @type {Map.<BluetoothCharacteristicName, BluetoothRemoteGATTCharacteristic} */
  #characteristics = new Map();

  async connect() {
    await super.connect();

    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: serviceUUIDs }],
        optionalServices: isInBrowser ? optionalServiceUUIDs : [],
      });

      _console.log("got BluetoothDevice");
      this.device = device;

      _console.log("connecting to device...");
      const server = await this.device.gatt.connect();
      _console.log(`connected to device? ${server.connected}`);

      await this.#getServicesAndCharacteristics();

      _console.log("fully connected");

      this.status = "connected";
    } catch (error) {
      _console.error(error);
      this.status = "not connected";
      this.server?.disconnect();
      this.#removeEventListeners();
    }
  }
  async #getServicesAndCharacteristics() {
    this.#removeEventListeners();

    _console.log("getting services...");
    const services = await this.server.getPrimaryServices();
    _console.log("got services", services.length);
    const service = await this.server.getPrimaryService("8d53dc1d-1db7-4cd3-868b-8a527460aa84");

    _console.log("getting characteristics...");
    for (const serviceIndex in services) {
      const service = services[serviceIndex];
      _console.log({ service });
      const serviceName = getServiceNameFromUUID(service.uuid);
      _console.assertWithError(serviceName, `no name found for service uuid "${service.uuid}"`);
      _console.log(`got "${serviceName}" service`);
      service._name = serviceName;
      this.#services.set(serviceName, service);
      _console.log(`getting characteristics for "${serviceName}" service`);
      const characteristics = await service.getCharacteristics();
      _console.log(`got characteristics for "${serviceName}" service`);
      for (const characteristicIndex in characteristics) {
        const characteristic = characteristics[characteristicIndex];
        _console.log({ characteristic });
        const characteristicName = getCharacteristicNameFromUUID(characteristic.uuid);
        _console.assertWithError(
          characteristicName,
          `no name found for characteristic uuid "${characteristic.uuid}" in "${serviceName}" service`
        );
        _console.log(`got "${characteristicName}" characteristic in "${serviceName}" service`);
        characteristic._name = characteristicName;
        this.#characteristics.set(characteristicName, characteristic);
        addEventListeners(characteristic, this.#boundBluetoothCharacteristicEventListeners);
        const characteristicProperties = characteristic.properties || getCharacteristicProperties(characteristicName);
        if (characteristicProperties.notify) {
          _console.log(`starting notifications for "${characteristicName}" characteristic`);
          await characteristic.startNotifications();
        }
        if (characteristicProperties.read) {
          _console.log(`reading "${characteristicName}" characteristic...`);
          await characteristic.readValue();
          if (isInBluefy || isInWebBLE) {
            this.#onCharacteristicValueChanged(characteristic);
          }
        }
      }
    }
  }
  #removeEventListeners() {
    if (this.device) {
      removeEventListeners(this.device, this.#boundBluetoothDeviceEventListeners);
    }
    this.#characteristics.forEach((characteristic) => {
      removeEventListeners(characteristic, this.#boundBluetoothCharacteristicEventListeners);
    });
  }
  async disconnect() {
    await super.disconnect();
    this.server?.disconnect();
    this.#removeEventListeners();
    this.status = "not connected";
  }

  /** @param {Event} event */
  #onCharacteristicvaluechanged(event) {
    _console.log("oncharacteristicvaluechanged");

    /** @type {BluetoothRemoteGATTCharacteristic} */
    const characteristic = event.target;

    this.#onCharacteristicValueChanged(characteristic);
  }

  /** @param {BluetoothRemoteGATTCharacteristic} characteristic */
  #onCharacteristicValueChanged(characteristic) {
    _console.log("onCharacteristicValue");

    /** @type {BluetoothCharacteristicName} */
    const characteristicName = characteristic._name;
    _console.assertWithError(characteristicName, `no name found for characteristic with uuid "${characteristic.uuid}"`);

    _console.log(`oncharacteristicvaluechanged for "${characteristicName}" characteristic`);
    const dataView = characteristic.value;
    _console.assertWithError(dataView, `no data found for "${characteristicName}" characteristic`);
    _console.log(`data for "${characteristicName}" characteristic`, Array.from(new Uint8Array(dataView.buffer)));

    try {
      this.onCharacteristicValueChanged(characteristicName, dataView);
    } catch (error) {
      _console.error(error);
    }
  }

  /**
   * @param {BluetoothCharacteristicName} characteristicName
   * @param {ArrayBuffer} data
   */
  async writeCharacteristic(characteristicName, data) {
    super.writeCharacteristic(...arguments);

    const characteristic = this.#characteristics.get(characteristicName);
    _console.assertWithError(characteristic, `${characteristicName} characteristic not found`);
    _console.log("writing characteristic", characteristic, data);
    const characteristicProperties = characteristic.properties || getCharacteristicProperties(characteristicName);
    if (characteristicProperties.writeWithoutResponse) {
      _console.log("writing without response");
      await characteristic.writeValueWithoutResponse(data);
    } else {
      _console.log("writing with response");
      await characteristic.writeValueWithResponse(data);
    }
    _console.log("wrote characteristic");

    if (characteristicProperties.read && !characteristicProperties.notify) {
      _console.log("reading value after write...");
      await characteristic.readValue();
      if (isInBluefy || isInWebBLE) {
        this.#onCharacteristicValueChanged(characteristic);
      }
    }
  }

  /** @param {Event} event */
  #onGattserverdisconnected(event) {
    _console.log("gattserverdisconnected");
    this.status = "not connected";
  }

  /** @type {boolean} */
  get canReconnect() {
    return this.server && !this.server.connected;
  }
  async reconnect() {
    await super.reconnect();
    _console.log("attempting to reconnect...");
    this.status = "connecting";
    await this.server.connect();
    if (this.isConnected) {
      _console.log("successfully reconnected!");
      await this.#getServicesAndCharacteristics();
      this.status = "connected";
    } else {
      _console.log("unable to reconnect");
      this.status = "not connected";
    }
  }
}

export default WebBluetoothConnectionManager;
