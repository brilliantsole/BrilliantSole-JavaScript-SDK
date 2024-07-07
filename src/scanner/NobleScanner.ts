import BaseScanner from "./BaseScanner.js";
import { createConsole } from "../utils/Console.js";
import { isInNode } from "../utils/environment.js";
import { addEventListeners, removeEventListeners } from "../utils/EventDispatcher.js";
import { serviceDataUUID, serviceUUIDs } from "../connection/bluetooth/bluetoothUUIDs.js";
import Device from "../Device.js";
import NobleConnectionManager from "../connection/bluetooth/NobleConnectionManager.js";

const _console = createConsole("NobleScanner", { log: true });

let isSupported = false;

// NODE_START
import noble from "@abandonware/noble";
isSupported = true;
// NODE_END

/** @typedef {"unknown" | "resetting" | "unsupported" | "unauthorized" | "poweredOff" | "poweredOn"} NobleState */

/** @typedef {import("./BaseScanner.js").DiscoveredDevice} DiscoveredDevice */
/** @typedef {import("./BaseScanner.js").ScannerEvent} ScannerEvent */

class NobleScanner extends BaseScanner {
  // IS SUPPORTED
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
    this.dispatchEvent({ type: "isScanning", message: { isScanning: this.isScanning } });
  }
  get isScanning() {
    return this.#isScanning;
  }

  // NOBLE STATE
  /** @type {NobleState} */
  #_nobleState = "unknown";
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
    this.dispatchEvent({ type: "isAvailable", message: { isAvailable: this.isAvailable } });
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
  /** @param {NobleState} state */
  #onNobleStateChange(state) {
    _console.log("onNobleStateChange", state);
    this.#nobleState = state;
  }
  /** @param {noble.Peripheral} noblePeripheral */
  #onNobleDiscover(noblePeripheral) {
    _console.log("onNobleDiscover", noblePeripheral.id);
    if (!this.#noblePeripherals[noblePeripheral.id]) {
      noblePeripheral._scanner = this;
      this.#noblePeripherals[noblePeripheral.id] = noblePeripheral;
    }

    let deviceType;
    const serviceData = noblePeripheral.advertisement.serviceData;
    if (serviceData) {
      //_console.log("serviceData", serviceData);
      const deviceTypeServiceData = serviceData.find((serviceDatum) => {
        return serviceDatum.uuid == serviceDataUUID;
      });
      //_console.log("deviceTypeServiceData", deviceTypeServiceData);
      if (deviceTypeServiceData) {
        const deviceTypeEnum = deviceTypeServiceData.data.readUint8(0);
        deviceType = Device.Types[deviceTypeEnum];
      }
    }

    /** @type {DiscoveredDevice} */
    const discoveredDevice = {
      name: noblePeripheral.advertisement.localName,
      bluetoothId: noblePeripheral.id,
      deviceType,
      rssi: noblePeripheral.rssi,
    };
    this.dispatchEvent({ type: "discoveredDevice", message: { discoveredDevice } });
  }

  // CONSTRUCTOR
  constructor() {
    super();
    addEventListeners(noble, this.#boundNobleListeners);
    addEventListeners(this, this.#boundBaseScannerListeners);
  }

  // AVAILABILITY
  get isAvailable() {
    return this.#nobleState == "poweredOn";
  }

  // SCANNING
  startScan() {
    super.startScan();
    noble.startScanningAsync(serviceUUIDs, true);
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

  /** @param {ScannerEvent} event */
  #onExpiredDiscoveredDevice(event) {
    /** @type {DiscoveredDevice} */
    const discoveredDevice = event.message.discoveredDevice;
    const noblePeripheral = this.#noblePeripherals[discoveredDevice.bluetoothId];
    if (noblePeripheral) {
      // disconnect?
      delete this.#noblePeripherals[discoveredDevice.bluetoothId];
    }
  }

  // DISCOVERED DEVICES
  /** @type {Object.<string, noble.Peripheral>} */
  #noblePeripherals = {};
  /** @param {string} noblePeripheralId */
  #assertValidNoblePeripheralId(noblePeripheralId) {
    _console.assertTypeWithError(noblePeripheralId, "string");
    _console.assertWithError(
      this.#noblePeripherals[noblePeripheralId],
      `no noblePeripheral found with id "${noblePeripheralId}"`
    );
  }

  // DEVICES
  /** @param {string} deviceId */
  async connectToDevice(deviceId) {
    super.connectToDevice(deviceId);
    this.#assertValidNoblePeripheralId(deviceId);
    const noblePeripheral = this.#noblePeripherals[deviceId];
    _console.log("connecting to discoveredDevice...", deviceId);

    let device = Device.AvailableDevices.filter((device) => device.connectionType == "noble").find(
      (device) => device.bluetoothId == deviceId
    );
    if (!device) {
      device = this.#createDevice(noblePeripheral);
      await device.connect();
    } else {
      await device.reconnect();
    }
  }

  /** @param {noble.Peripheral} noblePeripheral */
  #createDevice(noblePeripheral) {
    const device = new Device();
    const nobleConnectionManager = new NobleConnectionManager();
    nobleConnectionManager.noblePeripheral = noblePeripheral;
    device.connectionManager = nobleConnectionManager;
    return device;
  }
}

export default NobleScanner;
