import EventDispatcher, {
  EventDispatcherTypes,
} from "../utils/EventDispatcher.ts";
import { createConsole } from "../utils/Console.ts";
import { Timer } from "../utils/Timer.ts";
import { DeviceType } from "../InformationManager.ts";
import {
  ClientConnectionType,
  ConnectionType,
} from "../connection/BaseConnectionManager.ts";
import Device from "../Device.ts";
import { ScannerLike } from "./Scanner.ts";

const _console = createConsole("BaseScanner", { log: false });

export const ScannerEventTypes = [
  "isScanningAvailable",
  "isScanning",
  "discoveredDevice",
  "expiredDiscoveredDevice",
  "discoveredDevices",
  "scanningAvailable",
  "scanningNotAvailable",
  "scanning",
  "notScanning",
] as const;
export type ScannerEventType = (typeof ScannerEventTypes)[number];

export interface DiscoveredDevice {
  scanner: ScannerLike;
  bluetoothId: string;
  name: string;
  deviceType: DeviceType;
  rssi: number;
  ipAddress?: string;
  isWifiSecure?: boolean;
  device?: Device;
  connect(connectionType?: ClientConnectionType): void;
}

export interface ScannerEventMessages {
  discoveredDevice: { discoveredDevice: DiscoveredDevice; firstTime: Boolean };
  expiredDiscoveredDevice: { discoveredDevice: DiscoveredDevice };
  discoveredDevices: { discoveredDevices: DiscoveredDevicesMap };
  isScanningAvailable: { isScanningAvailable: boolean };
  isScanning: { isScanning: boolean };
  scanning: {};
  notScanning: {};
  scanningAvailable: {};
  scanningNotAvailable: {};
}

export type ScannerEventDispatcherTypes = EventDispatcherTypes<
  BaseScanner,
  ScannerEventType,
  ScannerEventMessages
>;
export type ScannerEvent = ScannerEventDispatcherTypes["Event"];
export type ScannerEventMap = ScannerEventDispatcherTypes["EventMap"];
export type ScannerEventListenerMap =
  ScannerEventDispatcherTypes["EventListenerMap"];
export type ScannerEventDispatcher =
  ScannerEventDispatcherTypes["EventDispatcher"];
export type BoundScannerEventListeners =
  ScannerEventDispatcherTypes["BoundEventListeners"];

export type DiscoveredDevicesMap = { [deviceId: string]: DiscoveredDevice };

abstract class BaseScanner {
  // IS SUPPORTED
  protected get baseConstructor() {
    return this.constructor as typeof BaseScanner;
  }
  static get isSupported() {
    return false;
  }
  get isSupported() {
    return this.baseConstructor.isSupported;
  }

  #assertIsSupported() {
    _console.assertWithError(
      this.isSupported,
      `${this.constructor.name} is not supported`,
    );
  }

  // CONSTRUCTOR
  #assertIsSubclass() {
    _console.assertWithError(
      this.constructor != BaseScanner,
      `${this.constructor.name} must be subclassed`,
    );
  }
  constructor() {
    this.#assertIsSubclass();
    this.#assertIsSupported();
  }

  // EVENT DISPATCHER
  #eventDispatcher: ScannerEventDispatcher = new EventDispatcher(
    this as BaseScanner,
    ScannerEventTypes,
  );
  get addEventListener() {
    return this.#eventDispatcher.addEventListener;
  }
  get #dispatchEvent() {
    return this.#eventDispatcher.dispatchEvent;
  }
  get removeEventListener() {
    return this.#eventDispatcher.removeEventListener;
  }
  get waitForEvent() {
    return this.#eventDispatcher.waitForEvent;
  }

  // AVAILABILITY
  #isScanningAvailable = false;
  get isScanningAvailable() {
    return this.#isScanningAvailable;
  }
  protected set _isScanningAvailable(newIsScanningAvailable: boolean) {
    _console.assertTypeWithError(newIsScanningAvailable, "boolean");
    if (this.#isScanningAvailable == newIsScanningAvailable) {
      return;
    }

    this.#isScanningAvailable = newIsScanningAvailable;
    _console.log("isScanningAvailable", this.isScanningAvailable);

    this.#dispatchEvent("isScanningAvailable", {
      isScanningAvailable: this.isScanningAvailable,
    });
    if (this.isScanningAvailable) {
      this.#eventDispatcher.dispatchEvent("scanningAvailable", {});
    } else {
      this.#eventDispatcher.dispatchEvent("scanningNotAvailable", {});
    }
  }
  #assertIsAvailable() {
    _console.assertWithError(this.isScanningAvailable, "scanner not available");
  }

  // SCANNING
  #isScanning = false;
  get isScanning() {
    return this.#isScanning;
  }
  protected set _isScanning(newIsScanning: boolean) {
    _console.assertTypeWithError(newIsScanning, "boolean");
    if (this.#isScanning == newIsScanning) {
      return;
    }

    this.#isScanning = newIsScanning;
    _console.log("isScanning", this.isScanning);

    if (this.isScanning) {
      this.#discoveredDevices = {};
      this.#discoveredDeviceTimestamps = {};
    } else {
      this.#checkDiscoveredDevicesExpirationTimer.stop();
    }

    if (this.isScanning) {
      this.#eventDispatcher.dispatchEvent("scanning", {});
    } else {
      this.#eventDispatcher.dispatchEvent("notScanning", {});
    }
    this.#dispatchEvent("isScanning", { isScanning: this.isScanning });
  }
  #assertIsScanning() {
    _console.assertWithError(this.isScanning, "not scanning");
  }
  #assertIsNotScanning() {
    _console.assertWithError(!this.isScanning, "already scanning");
  }

  startScan() {
    if (!this.isScanningAvailable) {
      _console.warn("scanning is not available");
      return false;
    }
    if (this.isScanning) {
      _console.log("already scanning");
      return false;
    }
    _console.log("startScan");
    return true;
    // this.#assertIsAvailable();
    // this.#assertIsNotScanning();
  }
  stopScan() {
    if (!this.isScanning) {
      _console.log("already not scanning");
      return false;
    }
    _console.log("stopScan");
    return true;
    //this.#assertIsScanning();
  }

  // DISCOVERED DEVICES
  #discoveredDevices: DiscoveredDevicesMap = {};
  get discoveredDevices(): Readonly<DiscoveredDevicesMap> {
    return this.#discoveredDevices;
  }
  get discoveredDevicesArray() {
    return Object.values(this.#discoveredDevices).sort((a, b) => {
      return (
        this.#discoveredDeviceTimestamps[a.bluetoothId] -
        this.#discoveredDeviceTimestamps[b.bluetoothId]
      );
    });
  }
  #assertValidDiscoveredDeviceId(discoveredDeviceId: string) {
    _console.assertWithError(
      this.#discoveredDevices[discoveredDeviceId],
      `no discovered device with id "${discoveredDeviceId}"`,
    );
  }

  protected _onDiscoveredDevice(discoveredDevice: DiscoveredDevice) {
    const exists = Boolean(
      this.#discoveredDevices[discoveredDevice.bluetoothId],
    );
    if (exists) {
      Object.assign(
        this.#discoveredDevices[discoveredDevice.bluetoothId],
        discoveredDevice,
      );
    } else {
      this.#discoveredDevices[discoveredDevice.bluetoothId] = discoveredDevice;
      discoveredDevice.connect = (connectionType?: ClientConnectionType) => {
        this.connectToDevice(discoveredDevice.bluetoothId, connectionType);
      };
      // @ts-expect-error
      discoveredDevice.scanner = this;
    }
    discoveredDevice = this.#discoveredDevices[discoveredDevice.bluetoothId];

    this.#discoveredDeviceTimestamps[discoveredDevice.bluetoothId] = Date.now();
    this.#checkDiscoveredDevicesExpirationTimer.start();
    this.#dispatchEvent("discoveredDevice", {
      discoveredDevice,
      firstTime: !exists,
    });
    if (!exists) {
      this.#dispatchEvent("discoveredDevices", {
        discoveredDevices: this.#discoveredDevices,
      });
    }
  }

  #discoveredDeviceTimestamps: { [id: string]: number } = {};

  static #DiscoveredDeviceExpirationTimeout = 5000;
  static get DiscoveredDeviceExpirationTimeout() {
    return this.#DiscoveredDeviceExpirationTimeout;
  }
  get #discoveredDeviceExpirationTimeout() {
    return BaseScanner.DiscoveredDeviceExpirationTimeout;
  }
  #checkDiscoveredDevicesExpirationTimer = new Timer(
    this.#checkDiscoveredDevicesExpiration.bind(this),
    1000,
  );
  #checkDiscoveredDevicesExpiration() {
    const entries = Object.entries(this.#discoveredDevices);
    if (entries.length == 0) {
      this.#checkDiscoveredDevicesExpirationTimer.stop();
      return;
    }
    const now = Date.now();
    entries.forEach(([id, discoveredDevice]) => {
      const timestamp = this.#discoveredDeviceTimestamps[id];
      if (now - timestamp > this.#discoveredDeviceExpirationTimeout) {
        _console.log("discovered device timeout");
        delete this.#discoveredDevices[id];
        delete this.#discoveredDeviceTimestamps[id];
        this.#dispatchEvent("expiredDiscoveredDevice", { discoveredDevice });
      }
    });
  }

  // DEVICE CONNECTION
  async connectToDevice(deviceId: string, connectionType?: ConnectionType) {
    this.#assertIsAvailable();
  }
  async disconnectFromDevice(deviceId: string) {
    this.#assertIsAvailable();
  }

  // DEVICES
  abstract devices: { [bluetoothId: string]: Device };

  // RESET
  get canReset() {
    return false;
  }
  reset() {
    _console.assertWithError(
      this.canReset,
      `${this.constructor.name} does not support reset`,
    );
    _console.log("resetting...");
  }
}

export default BaseScanner;
