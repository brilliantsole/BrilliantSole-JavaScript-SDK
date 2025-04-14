import { dataToArrayBuffer } from "../../utils/ArrayBufferUtils.ts";
import { createConsole } from "../../utils/Console.ts";
import { isInNode } from "../../utils/environment.ts";
import {
  addEventListeners,
  removeEventListeners,
  BoundGenericEventListeners,
} from "../../utils/EventUtils.ts";
import {
  allServiceUUIDs,
  getServiceNameFromUUID,
  getCharacteristicNameFromUUID,
  allCharacteristicNames,
  getCharacteristicProperties,
} from "./bluetoothUUIDs.ts";
import BluetoothConnectionManager from "./BluetoothConnectionManager.ts";

const _console = createConsole("NobleConnectionManager", { log: false });

/** NODE_START */
import type * as noble from "@abandonware/noble";
/** NODE_END */

import {
  BluetoothCharacteristicName,
  BluetoothServiceName,
} from "./bluetoothUUIDs.ts";
import { ConnectionType } from "../BaseConnectionManager.ts";
import NobleScanner from "../../scanner/NobleScanner.ts";

interface HasConnectionManager {
  connectionManager: NobleConnectionManager | undefined;
}
export interface NoblePeripheral
  extends noble.Peripheral,
    HasConnectionManager {
  scanner: NobleScanner;
}
interface NobleService extends noble.Service, HasConnectionManager {
  name: BluetoothServiceName;
}
interface NobleCharacteristic
  extends noble.Characteristic,
    HasConnectionManager {
  name: BluetoothCharacteristicName;
}

class NobleConnectionManager extends BluetoothConnectionManager {
  get bluetoothId() {
    return this.#noblePeripheral!.id;
  }

  get canUpdateFirmware() {
    return this.#characteristics.has("smp");
  }

  static get isSupported() {
    return isInNode;
  }
  static get type(): ConnectionType {
    return "noble";
  }

  get isConnected() {
    return this.#noblePeripheral?.state == "connected";
  }

  async connect() {
    await super.connect();
    await this.#noblePeripheral!.connectAsync();
  }
  async disconnect() {
    await super.disconnect();
    await this.#noblePeripheral!.disconnectAsync();
  }

  async writeCharacteristic(
    characteristicName: BluetoothCharacteristicName,
    data: ArrayBuffer
  ) {
    const characteristic = this.#characteristics.get(characteristicName)!;
    _console.assertWithError(
      characteristic,
      `no characteristic found with name "${characteristicName}"`
    );
    // if (data instanceof DataView) {
    //     data = data.buffer;
    // }
    const properties = getCharacteristicProperties(characteristicName);
    const buffer = Buffer.from(data);
    const writeWithoutResponse = properties.writeWithoutResponse;
    _console.log(
      `writing to ${characteristicName} ${
        writeWithoutResponse ? "without" : "with"
      } response`,
      buffer
    );
    await characteristic.writeAsync(buffer, writeWithoutResponse);
    if (characteristic.properties.includes("read")) {
      await characteristic.readAsync();
    }
  }

  get canReconnect() {
    return this.#noblePeripheral!.connectable;
  }
  async reconnect() {
    await super.reconnect();
    this.connect();
  }

  // NOBLE
  #noblePeripheral!: NoblePeripheral | undefined;
  get noblePeripheral(): NoblePeripheral | undefined {
    return this.#noblePeripheral;
  }
  set noblePeripheral(newNoblePeripheral: NoblePeripheral) {
    _console.assertTypeWithError(newNoblePeripheral, "object");
    if (this.noblePeripheral == newNoblePeripheral) {
      _console.log("attempted to assign duplicate noblePeripheral");
      return;
    }

    _console.log("newNoblePeripheral", newNoblePeripheral.id);

    if (this.#noblePeripheral) {
      removeEventListeners(
        this.#noblePeripheral,
        this.#unboundNoblePeripheralListeners
      );
      delete this.#noblePeripheral!.connectionManager;
    }

    if (newNoblePeripheral) {
      newNoblePeripheral.connectionManager = this;
      addEventListeners(
        newNoblePeripheral,
        this.#unboundNoblePeripheralListeners
      );
    }

    this.#noblePeripheral = newNoblePeripheral;
  }

  // NOBLE EVENTLISTENERS
  #unboundNoblePeripheralListeners: BoundGenericEventListeners = {
    connect: this.#onNoblePeripheralConnect,
    disconnect: this.#onNoblePeripheralDisconnect,
    rssiUpdate: this.#onNoblePeripheralRssiUpdate,
    servicesDiscover: this.#onNoblePeripheralServicesDiscover,
  };

  async #onNoblePeripheralConnect(this: NoblePeripheral) {
    await this.connectionManager!.onNoblePeripheralConnect(this);
  }
  async onNoblePeripheralConnect(noblePeripheral: NoblePeripheral) {
    _console.log(
      "onNoblePeripheralConnect",
      noblePeripheral.id,
      noblePeripheral.state
    );
    if (noblePeripheral.state == "connected") {
      await this.#noblePeripheral!.discoverServicesAsync(
        allServiceUUIDs as string[]
      );
    }
    // this gets called when it connects and disconnects, so we use the noblePeripheral's "state" property instead
    await this.#onNoblePeripheralState();
  }

  async #onNoblePeripheralDisconnect(this: NoblePeripheral) {
    await this.connectionManager!.onNoblePeripheralConnect(this);
  }
  async onNoblePeripheralDisconnect(noblePeripheral: NoblePeripheral) {
    _console.log("onNoblePeripheralDisconnect", noblePeripheral.id);
    await this.#onNoblePeripheralState();
  }

  async #onNoblePeripheralState() {
    _console.log(
      `noblePeripheral ${this.bluetoothId} state ${
        this.#noblePeripheral!.state
      }`
    );

    switch (this.#noblePeripheral!.state) {
      case "connected":
        //this.status = "connected";
        break;
      case "connecting":
        //this.status = "connecting";
        break;
      case "disconnected":
        this.#removeEventListeners();
        this.status = "notConnected";
        break;
      case "disconnecting":
        this.status = "disconnecting";
        break;
      case "error":
        _console.error("noblePeripheral error");
        break;
      default:
        _console.log(
          `uncaught noblePeripheral state ${this.#noblePeripheral!.state}`
        );
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
      _console.log(
        `removing listeners from characteristic "${characteristic.name}" has ${characteristic.listeners.length} listeners`
      );
      removeEventListeners(
        characteristic,
        this.#unboundNobleCharacteristicListeners
      );
    });
    this.#characteristics.clear();
  }

  async #onNoblePeripheralRssiUpdate(this: NoblePeripheral, rssi: number) {
    await this.connectionManager!.onNoblePeripheralRssiUpdate(this, rssi);
  }
  async onNoblePeripheralRssiUpdate(
    noblePeripheral: NoblePeripheral,
    rssi: number
  ) {
    _console.log("onNoblePeripheralRssiUpdate", noblePeripheral.id, rssi);
    // FILL
  }

  async #onNoblePeripheralServicesDiscover(
    this: NoblePeripheral,
    services: NobleService[]
  ) {
    await this.connectionManager!.onNoblePeripheralServicesDiscover(
      this,
      services
    );
  }
  async onNoblePeripheralServicesDiscover(
    noblePeripheral: NoblePeripheral,
    services: NobleService[]
  ) {
    _console.log(
      "onNoblePeripheralServicesDiscover",
      noblePeripheral.id,
      services.map((service) => service.uuid)
    );
    for (const index in services) {
      const service = services[index];
      _console.log("service", service.uuid);
      const serviceName = getServiceNameFromUUID(service.uuid)!;
      _console.assertWithError(
        serviceName,
        `no name found for service uuid "${service.uuid}"`
      );
      _console.log({ serviceName });
      this.#services.set(serviceName, service);
      service.name = serviceName;
      service.connectionManager = this;
      addEventListeners(service, this.#unboundNobleServiceListeners);
      await service.discoverCharacteristicsAsync();
    }
  }

  // NOBLE SERVICE
  #services: Map<BluetoothServiceName, NobleService> = new Map();

  #unboundNobleServiceListeners = {
    characteristicsDiscover: this.#onNobleServiceCharacteristicsDiscover,
  };

  async #onNobleServiceCharacteristicsDiscover(
    this: NobleService,
    characteristics: NobleCharacteristic[]
  ) {
    await this.connectionManager!.onNobleServiceCharacteristicsDiscover(
      this,
      characteristics
    );
  }
  async onNobleServiceCharacteristicsDiscover(
    service: NobleService,
    characteristics: NobleCharacteristic[]
  ) {
    _console.log(
      "onNobleServiceCharacteristicsDiscover",
      service.uuid,
      characteristics.map((characteristic) => characteristic.uuid)
    );

    for (const index in characteristics) {
      const characteristic = characteristics[index];
      _console.log("characteristic", characteristic.uuid);
      const characteristicName = getCharacteristicNameFromUUID(
        characteristic.uuid
      )!;
      _console.assertWithError(
        Boolean(characteristicName),
        `no name found for characteristic uuid "${characteristic.uuid}"`
      );
      _console.log({ characteristicName });
      this.#characteristics.set(characteristicName, characteristic);
      characteristic.name = characteristicName;
      characteristic.connectionManager = this;
      _console.log(
        `adding listeners to characteristic "${characteristic.name}" (currently has ${characteristic.listeners.length} listeners)`
      );
      addEventListeners(
        characteristic,
        this.#unboundNobleCharacteristicListeners
      );
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

  #characteristics: Map<BluetoothCharacteristicName, NobleCharacteristic> =
    new Map();

  get #hasAllCharacteristics() {
    return allCharacteristicNames.every((characteristicName) => {
      if (characteristicName == "smp") {
        return true;
      }
      return this.#characteristics.has(characteristicName);
    });
  }

  #onNobleCharacteristicData(
    this: NobleCharacteristic,
    data: Buffer,
    isNotification: boolean
  ) {
    this.connectionManager!.onNobleCharacteristicData(
      this,
      data,
      isNotification
    );
  }
  onNobleCharacteristicData(
    characteristic: NobleCharacteristic,
    data: Buffer,
    isNotification: boolean
  ) {
    _console.log(
      "onNobleCharacteristicData",
      characteristic.uuid,
      data,
      isNotification
    );
    const dataView = new DataView(dataToArrayBuffer(data));

    const characteristicName: BluetoothCharacteristicName = characteristic.name;
    _console.assertWithError(
      Boolean(characteristicName),
      `no name found for characteristic with uuid "${characteristic.uuid}"`
    );

    this.onCharacteristicValueChanged(characteristicName, dataView);
  }

  #onNobleCharacteristicWrite(this: NobleCharacteristic) {
    this.connectionManager!.onNobleCharacteristicWrite(this);
  }
  onNobleCharacteristicWrite(characteristic: NobleCharacteristic) {
    _console.log("onNobleCharacteristicWrite", characteristic.uuid);
    // FILL
  }

  #onNobleCharacteristicNotify(
    this: NobleCharacteristic,
    isSubscribed: boolean
  ) {
    this.connectionManager!.onNobleCharacteristicNotify(this, isSubscribed);
  }
  onNobleCharacteristicNotify(
    characteristic: NobleCharacteristic,
    isSubscribed: boolean
  ) {
    _console.log(
      "onNobleCharacteristicNotify",
      characteristic.uuid,
      isSubscribed
    );
  }
}

export default NobleConnectionManager;
