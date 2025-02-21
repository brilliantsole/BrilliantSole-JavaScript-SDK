import { createConsole } from "../../utils/Console.ts";
import { isInNode, isInBrowser, isInBluefy, isInWebBLE } from "../../utils/environment.ts";
import { addEventListeners, removeEventListeners } from "../../utils/EventUtils.ts";
import {
  serviceUUIDs,
  optionalServiceUUIDs,
  getServiceNameFromUUID,
  getCharacteristicNameFromUUID,
  getCharacteristicProperties,
} from "./bluetoothUUIDs.ts";
import BluetoothConnectionManager from "./BluetoothConnectionManager.ts";
import { BluetoothCharacteristicName, BluetoothServiceName } from "./bluetoothUUIDs.ts";
import { ConnectionType } from "../BaseConnectionManager.ts";

const _console = createConsole("WebBluetoothConnectionManager", { log: true });

type WebBluetoothInterface = webbluetooth.Bluetooth | Bluetooth;

interface BluetoothService extends BluetoothRemoteGATTService {
  name?: BluetoothServiceName;
}
interface BluetoothCharacteristic extends BluetoothRemoteGATTCharacteristic {
  name?: BluetoothCharacteristicName;
}

var bluetooth: WebBluetoothInterface | undefined;
/** NODE_START */
import * as webbluetooth from "webbluetooth";
if (isInNode) {
  bluetooth = webbluetooth.bluetooth;
}
/** NODE_END */

/** BROWSER_START */
if (isInBrowser) {
  bluetooth = window.navigator.bluetooth;
}
/** BROWSER_END */

class WebBluetoothConnectionManager extends BluetoothConnectionManager {
  get bluetoothId() {
    return this.device!.id;
  }

  get canUpdateFirmware() {
    return this.#characteristics.has("smp");
  }

  #boundBluetoothCharacteristicEventListeners: { [eventType: string]: EventListener } = {
    characteristicvaluechanged: this.#onCharacteristicvaluechanged.bind(this),
  };
  #boundBluetoothDeviceEventListeners: { [eventType: string]: EventListener } = {
    gattserverdisconnected: this.#onGattserverdisconnected.bind(this),
  };

  static get isSupported() {
    return Boolean(bluetooth);
  }
  static get type(): ConnectionType {
    return "webBluetooth";
  }

  #device!: BluetoothDevice | undefined;
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

  get server(): BluetoothRemoteGATTServer | undefined {
    return this.#device?.gatt;
  }
  get isConnected() {
    return this.server?.connected || false;
  }

  #services: Map<BluetoothServiceName, BluetoothService> = new Map();
  #characteristics: Map<BluetoothCharacteristicName, BluetoothCharacteristic> = new Map();

  async connect() {
    await super.connect();

    try {
      const device = await bluetooth!.requestDevice({
        filters: [{ services: serviceUUIDs }],
        optionalServices: isInBrowser ? optionalServiceUUIDs : [],
      });

      _console.log("got BluetoothDevice");
      this.device = device;

      _console.log("connecting to device...");
      const server = await this.server!.connect();
      _console.log(`connected to device? ${server.connected}`);

      await this.#getServicesAndCharacteristics();

      _console.log("fully connected");

      this.status = "connected";
    } catch (error) {
      _console.error(error);
      this.status = "notConnected";
      this.server?.disconnect();
      this.#removeEventListeners();
    }
  }
  async #getServicesAndCharacteristics() {
    this.#removeEventListeners();

    _console.log("getting services...");
    const services = await this.server!.getPrimaryServices();
    _console.log("got services", services.length);
    //const service = await this.server!.getPrimaryService("8d53dc1d-1db7-4cd3-868b-8a527460aa84");

    _console.log("getting characteristics...");
    for (const serviceIndex in services) {
      const service = services[serviceIndex] as BluetoothService;
      _console.log({ service });
      const serviceName = getServiceNameFromUUID(service.uuid)!;
      _console.assertWithError(serviceName, `no name found for service uuid "${service.uuid}"`);
      _console.log(`got "${serviceName}" service`);
      service.name = serviceName;
      this.#services.set(serviceName, service);
      _console.log(`getting characteristics for "${serviceName}" service`);
      const characteristics = await service.getCharacteristics();
      _console.log(`got characteristics for "${serviceName}" service`);
      for (const characteristicIndex in characteristics) {
        const characteristic = characteristics[characteristicIndex] as BluetoothCharacteristic;
        _console.log({ characteristic });
        const characteristicName = getCharacteristicNameFromUUID(characteristic.uuid)!;
        _console.assertWithError(
          Boolean(characteristicName),
          `no name found for characteristic uuid "${characteristic.uuid}" in "${serviceName}" service`
        );
        _console.log(`got "${characteristicName}" characteristic in "${serviceName}" service`);
        characteristic.name = characteristicName;
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
  async #removeEventListeners() {
    if (this.device) {
      removeEventListeners(this.device, this.#boundBluetoothDeviceEventListeners);
    }

    const promises = Array.from(this.#characteristics.keys()).map((characteristicName) => {
      const characteristic = this.#characteristics.get(characteristicName)!;
      removeEventListeners(characteristic, this.#boundBluetoothCharacteristicEventListeners);
      const characteristicProperties = characteristic.properties || getCharacteristicProperties(characteristicName);
      if (characteristicProperties.notify) {
        _console.log(`stopping notifications for "${characteristicName}" characteristic`);
        return characteristic.stopNotifications();
      }
    });

    return Promise.allSettled(promises);
  }
  async disconnect() {
    await this.#removeEventListeners();
    await super.disconnect();
    this.server?.disconnect();
    this.status = "notConnected";
  }

  #onCharacteristicvaluechanged(event: Event) {
    _console.log("oncharacteristicvaluechanged");

    const characteristic = event.target as BluetoothCharacteristic;
    this.#onCharacteristicValueChanged(characteristic);
  }

  #onCharacteristicValueChanged(characteristic: BluetoothCharacteristic) {
    _console.log("onCharacteristicValue");

    const characteristicName = characteristic.name!;
    _console.assertWithError(
      Boolean(characteristicName),
      `no name found for characteristic with uuid "${characteristic.uuid}"`
    );

    _console.log(`oncharacteristicvaluechanged for "${characteristicName}" characteristic`);
    const dataView = characteristic.value!;
    _console.assertWithError(dataView, `no data found for "${characteristicName}" characteristic`);
    _console.log(`data for "${characteristicName}" characteristic`, Array.from(new Uint8Array(dataView.buffer)));

    try {
      this.onCharacteristicValueChanged(characteristicName, dataView);
    } catch (error) {
      _console.error(error);
    }
  }

  async writeCharacteristic(characteristicName: BluetoothCharacteristicName, data: ArrayBuffer) {
    super.writeCharacteristic(characteristicName, data);

    const characteristic = this.#characteristics.get(characteristicName)!;
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

  #onGattserverdisconnected() {
    _console.log("gattserverdisconnected");
    this.status = "notConnected";
  }

  get canReconnect() {
    return Boolean(this.server && !this.server.connected && this.isInRange);
  }
  async reconnect() {
    await super.reconnect();
    _console.log("attempting to reconnect...");
    this.status = "connecting";
    try {
      await this.server!.connect();
    } catch (error) {
      _console.error(error);
      this.isInRange = false;
    }

    if (this.isConnected) {
      _console.log("successfully reconnected!");
      await this.#getServicesAndCharacteristics();
      this.status = "connected";
    } else {
      _console.log("unable to reconnect");
      this.status = "notConnected";
    }
  }
}

export default WebBluetoothConnectionManager;
