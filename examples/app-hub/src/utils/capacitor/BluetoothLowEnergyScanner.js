import { waitForGlobals } from "../cross-origin-storage-utils.js";

const { BW } = await waitForGlobals();

import { Capacitor } from "@capacitor/core";
const isWeb = Capacitor.getPlatform() == "web";

/** @typedef {import("../../../../../build/brilliantwear.module.js").ConnectionType} ConnectionType */
/** @typedef {import("../../../../../build/brilliantwear.module.js").BluetoothUUIDs.BluetoothServiceName} BluetoothServiceName */
/** @typedef {import("../../../../../build/brilliantwear.module.js").BluetoothUUIDs.BluetoothCharacteristicName} BluetoothCharacteristicName */
/** @typedef {import("../../../../../build/brilliantwear.module.js").ConnectionManagerConnectOptions} ConnectionManagerConnectOptions */

/** @typedef {import("@capgo/capacitor-bluetooth-low-energy").BleService} BleService */
/** @typedef {import("@capgo/capacitor-bluetooth-low-energy").BleCharacteristic} BleCharacteristic */

import { BluetoothLowEnergy } from "@capgo/capacitor-bluetooth-low-energy";
console.log("BluetoothLowEnergy", BluetoothLowEnergy);

class BluetoothLowEnergyConnectionManager
  extends BW.BluetoothConnectionManager
{
  #bluetoothId;
  get bluetoothId() {
    return this.#bluetoothId;
  }

  /** @param {string} bluetoothId */
  constructor(bluetoothId) {
    super();
    this.#bluetoothId = bluetoothId;
  }

  #isConnected = false;
  set _isConnected(newIsConnected) {
    if (this.#isConnected == newIsConnected) {
      return;
    }
    this.#isConnected = newIsConnected;
    if (!this.#isConnected) {
      this.status = "notConnected";
    }
  }
  get isConnected() {
    return this.#isConnected;
  }

  /** @type {Map<BluetoothServiceName, BleService>} */
  #services = new Map();
  /** @type {Map<BluetoothCharacteristicName, {service: BleService, characteristic: BleCharacteristic}>} */
  #characteristics = new Map();

  get #hasAllCharacteristics() {
    return BW.BluetoothUUIDs.allCharacteristicNames.every(
      (characteristicName) => {
        if (characteristicName == "smp") {
          return true;
        }
        return this.#characteristics.has(characteristicName);
      },
    );
  }

  get canUpdateFirmware() {
    return this.#characteristics.has("smp");
  }

  /** @param {ConnectionManagerConnectOptions?} options */
  async connect(options) {
    // this.#canReconnect = false;

    // console.log("connect", { options });
    const canConnect = await super.connect(options);
    if (!canConnect) {
      // console.log("can't connect");
      return false;
    }
    const deviceId = this.bluetoothId;
    // console.log("connecting", { deviceId });
    await BluetoothLowEnergy.connect({ deviceId });
    if (this._checkSignalIfAborted()) {
      return false;
    }
    // console.log("connected", { deviceId });
    await BluetoothLowEnergy.discoverServices({ deviceId });
    if (this._checkSignalIfAborted()) {
      return false;
    }
    // console.log("discovered services", { deviceId });
    const getServicesResult = await BluetoothLowEnergy.getServices({
      deviceId,
    });
    // console.log("getServicesResult", { deviceId }, getServicesResult);
    for (const service of getServicesResult.services) {
      const serviceName = BW.BluetoothUUIDs.getServiceNameFromUUID(
        service.uuid,
      );
      if (serviceName) {
        this.#services.set(serviceName, service);
        for (const characteristic of service.characteristics) {
          const characteristicName =
            BW.BluetoothUUIDs.getCharacteristicNameFromUUID(
              characteristic.uuid,
            );
          if (characteristicName) {
            // console.log("got characteristic", {
            //   characteristicName,
            //   serviceName,
            // });

            this.#characteristics.set(characteristicName, {
              service,
              characteristic,
            });

            if (characteristic.properties.notify) {
              // console.log("starting notifications", characteristic);
              await BluetoothLowEnergy.startCharacteristicNotifications({
                deviceId,
                service: service.uuid,
                characteristic: characteristic.uuid,
              });
              if (this._checkSignalIfAborted()) {
                return false;
              }
            }
            if (characteristic.properties.read) {
              const readResult = await BluetoothLowEnergy.readCharacteristic({
                deviceId,
                service: service.uuid,
                characteristic: characteristic.uuid,
              });
              if (this._checkSignalIfAborted()) {
                return false;
              }
              // console.log("readResult", readResult, {
              //   serviceName,
              //   characteristicName,
              // });
              this.onCharacteristicValueChanged(
                characteristicName,
                new DataView(Uint8Array.from(readResult.value).buffer),
              );
            }
          } else {
            console.error(
              `no characteristicName found for ${characteristic.uuid}`,
              characteristic,
            );
          }
        }
      } else {
        console.error(`no serviceName found for ${service.uuid}`, service);
      }
    }
    if (!this.#hasAllCharacteristics) {
      console.error("didn't get all characteristics");
      this.status = "notConnected";
      return false;
    }
    // console.log("got all characteristics");
    this.status = "connected";
    this.#canReconnect = true;
    return true;
  }
  async disconnect() {
    const canContinue = await super.disconnect();
    if (!canContinue) {
      return false;
    }
    const deviceId = this.bluetoothId;
    await BluetoothLowEnergy.disconnect({ deviceId });
    return true;
  }

  /**
   * @param {string} service
   * @param {string} characteristic
   * @param {number[]} value
   */
  _onCharacteristicValueChanged(service, characteristic, value) {
    // console.log(
    //   "_onCharacteristicValueChanged",
    //   { service, characteristic },
    //   value,
    // );
    const serviceName = BW.BluetoothUUIDs.getServiceNameFromUUID(service);
    if (!serviceName) {
      console.error(`invalid service "${service}"`);
      return;
    }
    const characteristicName =
      BW.BluetoothUUIDs.getCharacteristicNameFromUUID(characteristic);
    if (!characteristicName) {
      console.error(`invalid characteristic "${characteristic}"`);
      return;
    }
    // console.log({ serviceName, characteristicName });
    this.onCharacteristicValueChanged(
      characteristicName,
      new DataView(Uint8Array.from(value).buffer),
    );
  }

  #canReconnect = false;
  get canReconnect() {
    return this.#canReconnect;
  }
  async reconnect() {
    if (!this.canReconnect) {
      return false;
    }
    // console.log("reconnecting");
    return this.connect();
  }

  /**
   * @param {BluetoothCharacteristicName} characteristicName
   * @param {ArrayBuffer} data
   */
  async writeCharacteristic(characteristicName, data) {
    super.writeCharacteristic(characteristicName, data);

    // console.log("writeCharacteristic", { characteristicName }, data);

    const { bluetoothId: deviceId } = this;
    const characteristicInfo = this.#characteristics.get(characteristicName);
    if (!characteristicInfo) {
      console.error(`no characteristic found for "${characteristicName}"`);
      return;
    }
    const { uuid: service } = characteristicInfo.service;
    const { uuid: characteristic } = characteristicInfo.characteristic;

    const value = Array.from(new Uint8Array(data));

    // console.log(
    //   "writeCharacteristic",
    //   {
    //     deviceId,
    //     service,
    //     characteristic,
    //   },
    //   value,
    // );

    BluetoothLowEnergy.writeCharacteristic({
      deviceId,
      service,
      characteristic,
      value,
      type: characteristicInfo.characteristic.properties.writeWithoutResponse
        ? "withoutResponse"
        : "withResponse",
    });
  }
}

class BluetoothLowEnergyScanner extends BW.BaseScanner {
  constructor() {
    super();

    if (isWeb) {
      return;
    }

    BluetoothLowEnergy.addListener("deviceScanned", (event) => {
      const { device } = event;
      // console.log("deviceScanned", device);
      const {
        deviceId: bluetoothId,
        name,
        manufacturerData,
        serviceUuids,
        rssi,
      } = device;
      const discoveredDeviceMetadata =
        this._parseManufacturerData(manufacturerData);
      // console.log("discoveredDeviceMetadata", discoveredDeviceMetadata);
      this._onDiscoveredDevice({
        bluetoothId,
        name,
        rssi,
        ...discoveredDeviceMetadata,
      });
    });

    BluetoothLowEnergy.addListener("deviceConnected", (event) => {
      // console.log("deviceConnected", event);
      const { deviceId: bluetoothId } = event;
      const connectionManager = this.#getConnectionManager(bluetoothId);
      if (connectionManager) {
        connectionManager._isConnected = true;
      }
    });
    BluetoothLowEnergy.addListener("deviceDisconnected", (event) => {
      // console.log("deviceDisconnected", event);
      const { deviceId: bluetoothId } = event;
      const connectionManager = this.#getConnectionManager(bluetoothId);
      if (connectionManager) {
        connectionManager._isConnected = false;
      }
    });
    BluetoothLowEnergy.addListener("characteristicChanged", (event) => {
      // console.log("characteristicChanged", event);
      const { deviceId: bluetoothId, service, characteristic, value } = event;
      const connectionManager = this.#getConnectionManager(bluetoothId);
      if (connectionManager) {
        connectionManager._onCharacteristicValueChanged(
          service,
          characteristic,
          value,
        );
      }
    });

    this.#initialize();
  }

  #getConnectionManager(bluetoothId) {
    /** @type {BluetoothLowEnergyConnectionManager | undefined} */
    const connectionManager =
      this.discoveredDevices[bluetoothId]?.device?.connectionManager;
    if (!connectionManager) {
      // TODO: - create device instead?
      console.error(
        `no connectionManager found with bluetoothId ${bluetoothId}`,
      );
      return;
    }
    return connectionManager;
  }

  async #initialize() {
    await BluetoothLowEnergy.initialize({ mode: "central" });
    const { available } = await BluetoothLowEnergy.isAvailable();
    // console.log({ available });
    if (available) {
      await this.#checkEnabledTimer.start(true);
      if (this.isScanningAvailable) {
        await this.stopScan();
      }
    }
  }

  async #checkEnabled() {
    // console.log("#checkEnabled");
    const { enabled } = await BluetoothLowEnergy.isEnabled();
    // console.log({ enabled });
    this._isScanning = this.isScanning && enabled;
    this._isScanningAvailable = enabled;
  }
  #checkEnabledTimer = new BW.Timer(this.#checkEnabled.bind(this), 5000);

  async startScan() {
    if (!super.startScan()) {
      return false;
    }
    await BluetoothLowEnergy.startScan({
      services: BW.BluetoothUUIDs.serviceUUIDs,
      timeout: 0,
      allowDuplicates: true,
    });
    this._isScanning = true;
    return true;
  }
  async stopScan() {
    if (!super.stopScan()) {
      return;
    }
    await BluetoothLowEnergy.stopScan();
    this._isScanning = false;
    return true;
  }

  /** @param { string } bluetoothId */
  _createConnectionManager(bluetoothId) {
    const connectionManager = new BluetoothLowEnergyConnectionManager(
      bluetoothId,
    );
    return connectionManager;
  }
}

export { BluetoothLowEnergyScanner };
