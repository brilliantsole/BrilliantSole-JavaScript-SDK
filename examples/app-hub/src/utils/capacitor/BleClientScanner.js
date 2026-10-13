import { waitForGlobals } from "../cross-origin-storage-utils.js";

const { BW } = await waitForGlobals();

import { Capacitor } from "@capacitor/core";
const isWeb = Capacitor.getPlatform() == "web";

/** @typedef {import("../../../../../build/brilliantwear.module.js").ConnectionType} ConnectionType */
/** @typedef {import("../../../../../build/brilliantwear.module.js").BluetoothUUIDs.BluetoothServiceName} BluetoothServiceName */
/** @typedef {import("../../../../../build/brilliantwear.module.js").BluetoothUUIDs.BluetoothCharacteristicName} BluetoothCharacteristicName */
/** @typedef {import("../../../../../build/brilliantwear.module.js").ConnectionManagerConnectOptions} ConnectionManagerConnectOptions */

/** @typedef {import("@capacitor-community/bluetooth-le").BleService} BleService */
/** @typedef {import("@capacitor-community/bluetooth-le").BleCharacteristic} BleCharacteristic */

import { BleClient } from "@capacitor-community/bluetooth-le";
console.log("BleClient", BleClient);

class BleClientConnectionManager extends BW.BluetoothConnectionManager {
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
    await BleClient.connect(
      deviceId,
      (deviceId) => {
        // console.log("disconnected", { deviceId });
        this._isConnected = false;
      },
      { skipDescriptorDiscovery: true },
    );
    this._isConnected = true;
    if (this._checkSignalIfAborted()) {
      return false;
    }
    // console.log("connected", { deviceId });
    await BleClient.discoverServices(deviceId);
    if (this._checkSignalIfAborted()) {
      return false;
    }
    // console.log("discovered services", { deviceId });
    const services = await BleClient.getServices(deviceId);
    // console.log("services", { deviceId }, services);

    for (const service of services) {
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
              await BleClient.startNotifications(
                deviceId,
                service.uuid,
                characteristic.uuid,
                (dataView) => {
                  // console.log("notification", {
                  //   serviceName,
                  //   characteristicName,
                  // });
                  this.onCharacteristicValueChanged(
                    characteristicName,
                    dataView,
                  );
                },
              );
              if (this._checkSignalIfAborted()) {
                return false;
              }
            }
            if (characteristic.properties.read) {
              const readDataView = await BleClient.read(
                deviceId,
                service.uuid,
                characteristic.uuid,
                {
                  // timeout: 5000,
                },
              );
              if (this._checkSignalIfAborted()) {
                return false;
              }
              // console.log("readDataView", readDataView, {
              //   serviceName,
              //   characteristicName,
              // });
              this.onCharacteristicValueChanged(
                characteristicName,
                readDataView,
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
    await BleClient.disconnect(deviceId);
    return true;
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

    // console.log(
    //   "writeCharacteristic",
    //   {
    //     deviceId,
    //     service,
    //     characteristic,
    //   },
    //   data,
    // );

    data = new DataView(data);

    if (characteristicInfo.characteristic.properties.writeWithoutResponse) {
      BleClient.writeWithoutResponse(deviceId, service, characteristic, data, {
        // timeout: 5000,
      });
    } else {
      BleClient.write(deviceId, service, characteristic, data, {
        // timeout: 5000,
      });
    }
  }
}

class BleClientScanner extends BW.BaseScanner {
  constructor() {
    super();

    if (isWeb) {
      return;
    }

    this.#initialize();
  }

  async #initialize() {
    await BleClient.initialize();
    await BleClient.startEnabledNotifications((enabled) => {
      this.#onIsEnabled(enabled);
    });
    const enabled = await BleClient.isEnabled();
    this.#onIsEnabled(enabled);

    if (this.isScanningAvailable) {
      await this.stopScan();
    }
  }

  /** @param {Boolean} enabled */
  #onIsEnabled(enabled) {
    // console.log({ enabled });
    this._isScanning = this.isScanning && enabled;
    this._isScanningAvailable = enabled;
  }

  async startScan() {
    if (!super.startScan()) {
      return false;
    }
    await BleClient.requestLEScan(
      {
        services: BW.BluetoothUUIDs.serviceUUIDs,
        allowDuplicates: true,
      },
      (result) => {
        // console.log("scan result", result);
        const {
          device,
          localName: name,
          rssi,
          manufacturerData: manufacturerDataMap,
          uuids,
        } = result;
        const manufacturerDataEntry = Object.entries(manufacturerDataMap)[0];
        if (!manufacturerDataEntry) {
          return;
        }
        const [manufacturerDataId, _manufacturerData] = manufacturerDataEntry;
        // console.log({
        //   manufacturerDataId: `0x${Number(manufacturerDataId).toString(16)}`,
        //   _manufacturerData,
        // });

        const manufacturerData = new DataView(
          new ArrayBuffer(_manufacturerData.byteLength + 2),
        );
        let offset = 0;
        manufacturerData.setUint16(offset, Number(manufacturerDataId), true);
        offset += 2;
        for (let i = 0; i < _manufacturerData.byteLength; i++) {
          manufacturerData.setUint8(offset++, _manufacturerData.getUint8(i));
        }
        const discoveredDeviceMetadata =
          this._parseManufacturerData(manufacturerData);
        // console.log("discoveredDeviceMetadata", discoveredDeviceMetadata, {
        //   manufacturerData,
        // });
        this._onDiscoveredDevice({
          bluetoothId: device.deviceId,
          name,
          rssi,
          ...discoveredDeviceMetadata,
        });
      },
    );
    this._isScanning = true;
    return true;
  }
  async stopScan() {
    if (!super.stopScan()) {
      return;
    }
    await BleClient.stopLEScan();
    this._isScanning = false;
    return true;
  }

  /** @param { string } bluetoothId */
  _createConnectionManager(bluetoothId) {
    const connectionManager = new BleClientConnectionManager(bluetoothId);
    return connectionManager;
  }
}

export { BleClientScanner };
