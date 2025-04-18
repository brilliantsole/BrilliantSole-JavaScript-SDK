import BaseScanner, {
  DiscoveredDevice,
  ScannerEventMap,
} from "./BaseScanner.ts";
import { createConsole } from "../utils/Console.ts";
import { addEventListeners } from "../utils/EventUtils.ts";
import {
  serviceDataUUID,
  serviceUUIDs,
} from "../connection/bluetooth/bluetoothUUIDs.ts";
import Device from "../Device.ts";
import NobleConnectionManager, {
  NoblePeripheral,
} from "../connection/bluetooth/NobleConnectionManager.ts";

const _console = createConsole("NobleScanner", { log: false });

let isSupported = false;

/** NODE_START */
import noble from "@abandonware/noble";
import { DeviceTypes } from "../InformationManager.ts";
import DeviceManager from "../DeviceManager.ts";
import {
  ClientConnectionType,
  ConnectionType,
} from "../connection/BaseConnectionManager.ts";
isSupported = true;
/** NODE_END */

export const NobleStates = [
  "unknown",
  "resetting",
  "unsupported",
  "unauthorized",
  "poweredOff",
  "poweredOn",
] as const;
export type NobleState = (typeof NobleStates)[number];

class NobleScanner extends BaseScanner {
  static get isSupported() {
    return isSupported;
  }

  // SCANNING
  #_isScanning = false;
  get #isScanning() {
    return this.#_isScanning;
  }
  set #isScanning(newIsScanning) {
    _console.assertTypeWithError(newIsScanning, "boolean");
    if (this.isScanning == newIsScanning) {
      _console.log("duplicate isScanning assignment");
      return;
    }
    this.#_isScanning = newIsScanning;
    this.dispatchEvent("isScanning", { isScanning: this.isScanning });
  }
  get isScanning() {
    return this.#isScanning;
  }

  // NOBLE STATE
  #_nobleState: NobleState = "unknown";
  get #nobleState() {
    return this.#_nobleState;
  }
  set #nobleState(newNobleState) {
    _console.assertTypeWithError(newNobleState, "string");
    if (this.#nobleState == newNobleState) {
      _console.log("duplicate nobleState assignment");
      return;
    }
    this.#_nobleState = newNobleState;
    _console.log({ newNobleState });
    this.dispatchEvent("isScanningAvailable", {
      isScanningAvailable: this.isScanningAvailable,
    });
  }

  // NOBLE LISTENERS
  #boundNobleListeners = {
    scanStart: this.#onNobleScanStart.bind(this),
    scanStop: this.#onNobleScanStop.bind(this),
    stateChange: this.#onNobleStateChange.bind(this),
    discover: this.#onNobleDiscover.bind(this),
  };
  #onNobleScanStart() {
    _console.log("OnNobleScanStart");
    this.#isScanning = true;
  }
  #onNobleScanStop() {
    _console.log("OnNobleScanStop");
    this.#isScanning = false;
  }
  #onNobleStateChange(state: NobleState) {
    _console.log("onNobleStateChange", state);
    this.#nobleState = state;
  }
  #onNobleDiscover(noblePeripheral: NoblePeripheral) {
    _console.log("onNobleDiscover", noblePeripheral.id);
    if (!this.#noblePeripherals[noblePeripheral.id]) {
      noblePeripheral.scanner = this;
      this.#noblePeripherals[noblePeripheral.id] = noblePeripheral;
    }

    _console.log("advertisement", noblePeripheral.advertisement);

    let deviceType;
    let ipAddress;
    let isWifiSecure;
    const { manufacturerData, serviceData } = noblePeripheral.advertisement;
    if (manufacturerData) {
      _console.log("manufacturerData", manufacturerData);
      if (manufacturerData.byteLength >= 3) {
        const deviceTypeEnum = manufacturerData.readUint8(2);
        deviceType = DeviceTypes[deviceTypeEnum];
        _console;
      }
      if (manufacturerData.byteLength >= 3 + 4) {
        ipAddress = new Uint8Array(
          manufacturerData.buffer.slice(3, 3 + 4)
        ).join(".");
        //_console.log({ ipAddress });
      }
      if (manufacturerData.byteLength >= 3 + 4 + 1) {
        isWifiSecure = manufacturerData.readUint8(3 + 4) != 0;
        _console.log({ isWifiSecure });
      }
    }
    if (serviceData) {
      _console.log("serviceData", serviceData);
      const deviceTypeServiceData = serviceData.find((serviceDatum) => {
        return serviceDatum.uuid == serviceDataUUID;
      });
      _console.log("deviceTypeServiceData", deviceTypeServiceData);
      if (deviceTypeServiceData) {
        const deviceTypeEnum = deviceTypeServiceData.data.readUint8(0);
        deviceType = DeviceTypes[deviceTypeEnum];
      }
    }
    if (deviceType == undefined) {
      _console.log("skipping device - no deviceType");
      return;
    }

    const discoveredDevice: DiscoveredDevice = {
      name: noblePeripheral.advertisement.localName,
      bluetoothId: noblePeripheral.id,
      deviceType,
      rssi: noblePeripheral.rssi,
      ipAddress,
      isWifiSecure,
    };
    this.dispatchEvent("discoveredDevice", { discoveredDevice });
  }

  // CONSTRUCTOR
  constructor() {
    super();
    addEventListeners(noble, this.#boundNobleListeners);
    addEventListeners(this, this.#boundBaseScannerListeners);
  }

  // AVAILABILITY
  get isScanningAvailable() {
    return this.#nobleState == "poweredOn";
  }

  // SCANNING
  startScan() {
    super.startScan();
    noble.startScanningAsync(serviceUUIDs as string[], true);
  }
  stopScan() {
    super.stopScan();
    noble.stopScanningAsync();
  }

  // RESET
  get canReset() {
    return true;
  }
  reset() {
    super.reset();
    noble.reset();
  }

  // BASESCANNER LISTENERS
  #boundBaseScannerListeners = {
    expiredDiscoveredDevice: this.#onExpiredDiscoveredDevice.bind(this),
  };

  #onExpiredDiscoveredDevice(
    event: ScannerEventMap["expiredDiscoveredDevice"]
  ) {
    const { discoveredDevice } = event.message;
    const noblePeripheral =
      this.#noblePeripherals[discoveredDevice.bluetoothId];
    if (noblePeripheral) {
      // disconnect?
      delete this.#noblePeripherals[discoveredDevice.bluetoothId];
    }
  }

  // DISCOVERED DEVICES
  #noblePeripherals: { [bluetoothId: string]: NoblePeripheral } = {};
  #assertValidNoblePeripheralId(noblePeripheralId: string) {
    _console.assertTypeWithError(noblePeripheralId, "string");
    _console.assertWithError(
      this.#noblePeripherals[noblePeripheralId],
      `no noblePeripheral found with id "${noblePeripheralId}"`
    );
  }

  // DEVICES
  async connectToDevice(
    deviceId: string,
    connectionType?: ClientConnectionType
  ) {
    super.connectToDevice(deviceId, connectionType);
    this.#assertValidNoblePeripheralId(deviceId);
    const noblePeripheral = this.#noblePeripherals[deviceId];
    _console.log("connecting to discoveredDevice...", deviceId);

    let device = DeviceManager.AvailableDevices.filter(
      (device) => device.connectionType == "noble"
    ).find((device) => device.bluetoothId == deviceId);
    if (!device) {
      device = this.#createDevice(noblePeripheral);
      const { ipAddress, isWifiSecure } =
        this.discoveredDevices[device.bluetoothId!];
      if (connectionType && connectionType != "noble" && ipAddress) {
        await device.connect({ type: connectionType, ipAddress, isWifiSecure });
      } else {
        await device.connect();
      }
    } else {
      const { ipAddress, isWifiSecure } =
        this.discoveredDevices[device.bluetoothId!];
      if (
        connectionType &&
        connectionType != "noble" &&
        connectionType != device.connectionType &&
        ipAddress
      ) {
        await device.connect({ type: connectionType, ipAddress, isWifiSecure });
      } else {
        await device.reconnect();
      }
    }
  }

  #createDevice(noblePeripheral: NoblePeripheral) {
    const device = new Device();
    const nobleConnectionManager = new NobleConnectionManager();
    nobleConnectionManager.noblePeripheral = noblePeripheral;
    device.connectionManager = nobleConnectionManager;
    return device;
  }
}

export default NobleScanner;
