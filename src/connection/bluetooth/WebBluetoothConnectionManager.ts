import { createConsole } from "../../utils/Console.ts";
import {
  isInNode,
  isInBrowser,
  isInBluefy,
  isInWebBLE,
} from "../../utils/environment.ts";
import {
  addEventListeners,
  removeEventListeners,
} from "../../utils/EventUtils.ts";
import {
  serviceUUIDs,
  optionalServiceUUIDs,
  getServiceNameFromUUID,
  getCharacteristicNameFromUUID,
  getCharacteristicProperties,
  BluetoothCharacteristicName,
  BluetoothServiceName,
} from "./bluetoothUUIDs.ts";
import BluetoothConnectionManager from "./BluetoothConnectionManager.ts";

const _console = createConsole("WebBluetoothConnectionManager", { log: false });

type WebBluetoothInterface = webbluetooth.Bluetooth | Bluetooth;
var bluetooth: WebBluetoothInterface | undefined;

/** NODE_START */
import * as webbluetooth from "webbluetooth";
import { ConnectionManagerConnectOptions } from "../BaseConnectionManager.ts";
/** NODE_END */

/** NODE_START */
if (isInNode) {
  bluetooth = webbluetooth.bluetooth;
}
/** NODE_END */

/** BROWSER_START */
if (isInBrowser) {
  bluetooth = window.navigator.bluetooth;
}
/** BROWSER_END */

class weirdRollupFix {}

export interface BluetoothService extends BluetoothRemoteGATTService {
  name?: BluetoothServiceName;
}
export interface BluetoothCharacteristic extends BluetoothRemoteGATTCharacteristic {
  name?: BluetoothCharacteristicName;
}

class WebBluetoothConnectionManager extends BluetoothConnectionManager {
  get bluetoothId() {
    return this.device?.id ?? "";
  }

  get canUpdateFirmware() {
    return this.#characteristics.has("smp");
  }

  #boundBluetoothCharacteristicEventListeners: {
    [eventType: string]: EventListener;
  } = {
    characteristicvaluechanged: this.#onCharacteristicvaluechanged.bind(this),
  };
  #boundBluetoothDeviceEventListeners: { [eventType: string]: EventListener } =
    {
      gattserverdisconnected: this.#onGattserverdisconnected.bind(this),
    };

  static get isSupported() {
    return Boolean(bluetooth);
  }

  static type = "webBluetooth" as const;
  readonly type = WebBluetoothConnectionManager.type;

  #device?: BluetoothDevice;
  get device() {
    return this.#device;
  }
  set device(newDevice) {
    if (this.#device == newDevice) {
      if (this.#device) {
        _console.log("tried to assign the same BluetoothDevice");
      }
      return;
    }
    if (this.#device) {
      removeEventListeners(
        this.#device,
        this.#boundBluetoothDeviceEventListeners,
      );
    }
    if (newDevice) {
      addEventListeners(newDevice, this.#boundBluetoothDeviceEventListeners);
    }

    _console.log("set device", newDevice);

    // if (this.#device && !newDevice) {
    //   this.deviceMap.delete(this.#device);
    // }
    this.#device = newDevice;
  }

  get server(): BluetoothRemoteGATTServer | undefined {
    return this.#device?.gatt;
  }
  get isConnected() {
    return this.server?.connected || false;
  }

  #services: Map<BluetoothServiceName, BluetoothService> = new Map();
  #characteristics: Map<BluetoothCharacteristicName, BluetoothCharacteristic> =
    new Map();

  static #DeviceMap: Map<BluetoothDevice, WebBluetoothConnectionManager> =
    new Map();
  get deviceMap() {
    return WebBluetoothConnectionManager.#DeviceMap;
  }

  async connect(options?: ConnectionManagerConnectOptions) {
    const canContinue = super.connect(options);
    if (!canContinue) {
      return false;
    }

    try {
      let device = this.device;
      if (!device) {
        device = await bluetooth!.requestDevice({
          filters: [{ services: serviceUUIDs }],
          optionalServices: isInBrowser ? optionalServiceUUIDs : [],
        });
        _console.log("got BluetoothDevice", device);

        const existingConnectionManager = this.deviceMap.get(device);
        if (existingConnectionManager) {
          _console.warn(
            "device is already connected",
            existingConnectionManager,
          );
          if (
            !existingConnectionManager.isConnected &&
            existingConnectionManager.canReconnect
          ) {
            existingConnectionManager.reconnect();
          }
          return false;
        }
        this.device = device;
      }
      if (this._checkSignalIfAborted()) {
        return false;
      }

      _console.log("connecting to device...");
      const server = await this.server!.connect();
      _console.log(`connected to device? ${server.connected}`);

      if (this._checkSignalIfAborted()) {
        return false;
      }

      await this.#getServicesAndCharacteristics();
      if (this._checkSignalIfAborted()) {
        return false;
      }

      _console.log("fully connected");

      this.deviceMap.set(this.#device!, this);

      this.status = "connected";

      return true;
    } catch (error) {
      _console.error(error);
      this.status = "notConnected";
      this.server?.disconnect();
      this.device = undefined;
      return false;
    }
  }
  async #getServicesAndCharacteristics() {
    this.#removeEventListeners();

    _console.log("getting services...");
    const services = await this.server!.getPrimaryServices();
    _console.log("got services", services.length);
    //const service = await this.server!.getPrimaryService("8d53dc1d-1db7-4cd3-868b-8a527460aa84");

    if (this._checkSignalIfAborted()) {
      return;
    }

    _console.log("getting characteristics...");
    for (const serviceIndex in services) {
      const service = services[serviceIndex] as BluetoothService;
      _console.log({ service });
      const serviceName = getServiceNameFromUUID(service.uuid)!;
      _console.assertWithError(
        serviceName,
        `no name found for service uuid "${service.uuid}"`,
      );
      _console.log(`got "${serviceName}" service`);
      service.name = serviceName;
      this.#services.set(serviceName, service);
      _console.log(`getting characteristics for "${serviceName}" service`);
      const characteristics = await service.getCharacteristics();
      if (this._checkSignalIfAborted()) {
        return;
      }
      _console.log(`got characteristics for "${serviceName}" service`);
      for (const characteristicIndex in characteristics) {
        const characteristic = characteristics[
          characteristicIndex
        ] as BluetoothCharacteristic;
        _console.log({ characteristic });
        const characteristicName = getCharacteristicNameFromUUID(
          characteristic.uuid,
        )!;
        _console.assertWithError(
          Boolean(characteristicName),
          `no name found for characteristic uuid "${characteristic.uuid}" in "${serviceName}" service`,
        );
        _console.log(
          `got "${characteristicName}" characteristic in "${serviceName}" service`,
        );
        characteristic.name = characteristicName;
        this.#characteristics.set(characteristicName, characteristic);
        addEventListeners(
          characteristic,
          this.#boundBluetoothCharacteristicEventListeners,
        );
        const characteristicProperties =
          characteristic.properties ||
          getCharacteristicProperties(characteristicName);
        if (characteristicProperties.notify) {
          _console.log(
            `starting notifications for "${characteristicName}" characteristic`,
          );
          await characteristic.startNotifications();
          if (this._checkSignalIfAborted()) {
            return;
          }
        }
        if (characteristicProperties.read) {
          _console.log(`reading "${characteristicName}" characteristic...`);
          await characteristic.readValue();
          if (this._checkSignalIfAborted()) {
            return;
          }
          if (isInBluefy || isInWebBLE) {
            this.#onCharacteristicValueChanged(characteristic);
          }
        }
      }
    }
  }
  async #removeEventListeners() {
    if (this.device) {
      removeEventListeners(
        this.device,
        this.#boundBluetoothDeviceEventListeners,
      );
    }

    const promises = Array.from(this.#characteristics.keys()).map(
      (characteristicName) => {
        const characteristic = this.#characteristics.get(characteristicName)!;
        removeEventListeners(
          characteristic,
          this.#boundBluetoothCharacteristicEventListeners,
        );
        const characteristicProperties =
          characteristic.properties ||
          getCharacteristicProperties(characteristicName);
        if (characteristicProperties.notify) {
          _console.log(
            `stopping notifications for "${characteristicName}" characteristic`,
          );
          return characteristic.stopNotifications();
        }
      },
    );

    return Promise.allSettled(promises);
  }
  async disconnect() {
    const canContinue = await super.disconnect();
    if (!canContinue) {
      return false;
    }
    await this.#removeEventListeners();
    this.server?.disconnect();
    this.status = "notConnected";
    return true;
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
      `no name found for characteristic with uuid "${characteristic.uuid}"`,
    );

    _console.log(
      `oncharacteristicvaluechanged for "${characteristicName}" characteristic`,
    );
    const dataView = characteristic.value! as DataView<ArrayBuffer>;
    _console.assertWithError(
      dataView,
      `no data found for "${characteristicName}" characteristic`,
    );
    _console.log(
      `data for "${characteristicName}" characteristic`,
      Array.from(new Uint8Array(dataView.buffer)),
    );

    try {
      this.onCharacteristicValueChanged(characteristicName, dataView);
    } catch (error) {
      _console.error(error);
    }
  }

  async writeCharacteristic(
    characteristicName: BluetoothCharacteristicName,
    data: ArrayBuffer,
  ) {
    super.writeCharacteristic(characteristicName, data);

    const characteristic = this.#characteristics.get(characteristicName)!;
    _console.assertWithError(
      characteristic,
      `${characteristicName} characteristic not found`,
    );
    _console.log("writing characteristic", characteristic, data);
    const characteristicProperties =
      characteristic.properties ||
      getCharacteristicProperties(characteristicName);
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
    const canContinue = await super.reconnect();
    if (!canContinue) {
      return false;
    }
    try {
      await this.server!.connect();
    } catch (error) {
      _console.error(error);
      this.isInRange = false;
      return false;
    }

    if (this.isConnected) {
      _console.log("successfully reconnected!");
      await this.#getServicesAndCharacteristics();
      this.status = "connected";
      return true;
    } else {
      _console.log("unable to reconnect");
      this.status = "notConnected";
      return false;
    }
  }

  remove() {
    super.remove();
    this.device = undefined;
  }
}

export default WebBluetoothConnectionManager;
