import EventDispatcher, { BoundEventListeners, Event, SpecificEvent } from "../utils/EventDispatcher.ts";
import { addEventListeners } from "../utils/EventUtils.ts";
import { createConsole } from "../utils/Console.ts";
import Timer from "../utils/Timer.ts";
import { DeviceType } from "../InformationManager.ts";

const _console = createConsole("BaseScanner");

export const ScannerEventTypes = [
  "isScanningAvailable",
  "isScanning",
  "discoveredDevice",
  "expiredDiscoveredDevice",
] as const;
export type ScannerEventType = (typeof ScannerEventTypes)[number];

export interface DiscoveredDevice {
  bluetoothId: string;
  name: string;
  deviceType?: DeviceType;
  rssi: number;
}

interface ScannerDiscoveredDeviceEventMessage {
  discoveredDevice: DiscoveredDevice;
}

export interface ScannerEventMessages {
  discoveredDevice: ScannerDiscoveredDeviceEventMessage;
  expiredDiscoveredDevice: ScannerDiscoveredDeviceEventMessage;
  isScanningAvailable: { isScanningAvailable: boolean };
  isScanning: { isScanning: boolean };
}

export type ScannerEventDispatcher = EventDispatcher<BaseScanner, ScannerEventType, ScannerEventMessages>;
export type SpecificScannerEvent<EventType extends ScannerEventType> = SpecificEvent<
  BaseScanner,
  ScannerEventType,
  ScannerEventMessages,
  EventType
>;
export type ScannerEvent = Event<BaseScanner, ScannerEventType, ScannerEventMessages>;
export type BoundScannerEventListeners = BoundEventListeners<BaseScanner, ScannerEventType, ScannerEventMessages>;

export type DiscoveredDevicesMap = { [deviceId: string]: DiscoveredDevice };

abstract class BaseScanner {
  // IS SUPPORTED
  get #baseConstructor() {
    return this.constructor as typeof BaseScanner;
  }
  static get isSupported() {
    return false;
  }
  get isSupported() {
    return this.#baseConstructor.isSupported;
  }

  #assertIsSupported() {
    _console.assertWithError(this.isSupported, `${this.constructor.name} is not supported`);
  }

  // CONSTRUCTOR
  #assertIsSubclass() {
    _console.assertWithError(this.constructor != BaseScanner, `${this.constructor.name} must be subclassed`);
  }
  constructor() {
    this.#assertIsSubclass();
    this.#assertIsSupported();
    addEventListeners(this, this.#boundEventListeners);
  }

  #boundEventListeners: BoundScannerEventListeners = {
    discoveredDevice: this.#onDiscoveredDevice.bind(this),
    isScanning: this.#onIsScanning.bind(this),
  };

  // EVENT DISPATCHER
  #eventDispatcher: ScannerEventDispatcher = new EventDispatcher(this as BaseScanner, ScannerEventTypes);
  get addEventListener() {
    return this.#eventDispatcher.addEventListener;
  }
  protected get dispatchEvent() {
    return this.#eventDispatcher.dispatchEvent;
  }
  get removeEventListener() {
    return this.#eventDispatcher.removeEventListener;
  }
  get waitForEvent() {
    return this.#eventDispatcher.waitForEvent;
  }

  // AVAILABILITY
  get isScanningAvailable() {
    return false;
  }
  #assertIsAvailable() {
    _console.assertWithError(this.isScanningAvailable, "not available");
  }

  // SCANNING
  get isScanning() {
    return false;
  }
  #assertIsScanning() {
    _console.assertWithError(this.isScanning, "not scanning");
  }
  #assertIsNotScanning() {
    _console.assertWithError(!this.isScanning, "already scanning");
  }

  startScan() {
    this.#assertIsAvailable();
    this.#assertIsNotScanning();
  }
  stopScan() {
    this.#assertIsScanning();
  }
  #onIsScanning(event: SpecificScannerEvent<"isScanning">) {
    if (this.isScanning) {
      this.#discoveredDevices = {};
      this.#discoveredDeviceTimestamps = {};
    } else {
      this.#checkDiscoveredDevicesExpirationTimer.stop();
    }
  }

  // DISCOVERED DEVICES
  #discoveredDevices: DiscoveredDevicesMap = {};
  get discoveredDevices(): Readonly<DiscoveredDevicesMap> {
    return this.#discoveredDevices;
  }
  get discoveredDevicesArray() {
    return Object.values(this.#discoveredDevices).sort((a, b) => {
      return this.#discoveredDeviceTimestamps[a.bluetoothId] - this.#discoveredDeviceTimestamps[b.bluetoothId];
    });
  }
  #assertValidDiscoveredDeviceId(discoveredDeviceId: string) {
    _console.assertWithError(
      this.#discoveredDevices[discoveredDeviceId],
      `no discovered device with id "${discoveredDeviceId}"`
    );
  }

  #onDiscoveredDevice(event: SpecificScannerEvent<"discoveredDevice">) {
    const { discoveredDevice } = event.message;
    this.#discoveredDevices[discoveredDevice.bluetoothId] = discoveredDevice;
    this.#discoveredDeviceTimestamps[discoveredDevice.bluetoothId] = Date.now();
    this.#checkDiscoveredDevicesExpirationTimer.start();
  }

  #discoveredDeviceTimestamps: { [id: string]: number } = {};

  static #DiscoveredDeviceExpirationTimeout = 5000;
  static get DiscoveredDeviceExpirationTimeout() {
    return this.#DiscoveredDeviceExpirationTimeout;
  }
  get #discoveredDeviceExpirationTimeout() {
    return BaseScanner.DiscoveredDeviceExpirationTimeout;
  }
  #checkDiscoveredDevicesExpirationTimer = new Timer(this.#checkDiscoveredDevicesExpiration.bind(this), 1000);
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
        this.dispatchEvent("expiredDiscoveredDevice", { discoveredDevice });
      }
    });
  }

  // DEVICE CONNECTION
  async connectToDevice(deviceId: string) {
    this.#assertIsAvailable();
  }

  // RESET
  get canReset() {
    return false;
  }
  reset() {
    _console.log("resetting...");
  }
}

export default BaseScanner;
