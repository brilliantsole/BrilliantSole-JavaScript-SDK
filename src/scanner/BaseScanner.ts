import EventDispatcher, {
  addEventListeners,
  EventDispatcherListener,
  EventDispatcherOptions,
} from "../utils/EventDispatcher";
import { createConsole } from "../utils/Console";
import Timer from "../utils/Timer";

const _console = createConsole("BaseScanner");

import { DeviceType } from "../Device";

export const ScannerEventTypes = ["isAvailable", "isScanning", "discoveredDevice", "expiredDiscoveredDevice"] as const;
export type ScannerEventType = (typeof ScannerEventTypes)[number];

export interface ScannerEvent {
  target: typeof BaseScanner;
  type: ScannerEventType;
}

export interface DiscoveredDevice {
  bluetoothId: string;
  name: string;
  deviceType: DeviceType;
  rssi: number;
}

abstract class BaseScanner {
  // IS SUPPORTED

  static get isSupported() {
    return false;
  }
  get isSupported() {
    return this.constructor.isSupported;
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

  #boundEventListeners = {
    discoveredDevice: this.#onDiscoveredDevice.bind(this),
    isScanning: this.#onIsScanning.bind(this),
  };

  // EVENT DISPATCHER

  /** @type {ScannerEventType[]} */
  static #EventTypes: ScannerEventType[] = ["isAvailable", "isScanning", "discoveredDevice", "expiredDiscoveredDevice"];
  static get EventTypes() {
    return this.#EventTypes;
  }
  get eventTypes() {
    return BaseScanner.#EventTypes;
  }
  #eventDispatcher = new EventDispatcher(this, this.eventTypes);

  /**
   * @param {ScannerEventType} type
   * @param {EventDispatcherListener} listener
   * @param {EventDispatcherOptions} [options]
   */
  addEventListener(type: ScannerEventType, listener: EventDispatcherListener, options: EventDispatcherOptions) {
    this.#eventDispatcher.addEventListener(type, listener, options);
  }

  protected dispatchEvent(event: ScannerEvent) {
    this.#eventDispatcher.dispatchEvent(event);
  }

  /**
   * @param {ScannerEventType} type
   * @param {EventDispatcherListener} listener
   */
  removeEventListener(type: ScannerEventType, listener: EventDispatcherListener) {
    return this.#eventDispatcher.removeEventListener(type, listener);
  }

  // AVAILABILITY
  get isAvailable() {
    return false;
  }
  #assertIsAvailable() {
    _console.assertWithError(this.isAvailable, "not available");
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
  #onIsScanning() {
    if (this.isScanning) {
      this.#discoveredDevices = {};
      this.#discoveredDeviceTimestamps = {};
    } else {
      this.#checkDiscoveredDevicesExpirationTimer.stop();
    }
  }

  // DISCOVERED DEVICES
  /** @type {Object.<string, DiscoveredDevice>} */
  #discoveredDevices: { [s: string]: DiscoveredDevice } = {};
  get discoveredDevices() {
    return this.#discoveredDevices;
  }
  get discoveredDevicesArray() {
    return Object.values(this.#discoveredDevices).sort((a, b) => {
      return this.#discoveredDeviceTimestamps[a.bluetoothId] - this.#discoveredDeviceTimestamps[b.bluetoothId];
    });
  }
  /** @param {string} discoveredDeviceId */
  #assertValidDiscoveredDeviceId(discoveredDeviceId: string) {
    _console.assertWithError(
      this.#discoveredDevices[discoveredDeviceId],
      `no discovered device with id "${discoveredDeviceId}"`
    );
  }

  /** @param {ScannerEvent} event */
  #onDiscoveredDevice(event: ScannerEvent) {
    /** @type {DiscoveredDevice} */
    const discoveredDevice: DiscoveredDevice = event.message.discoveredDevice;
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
        this.dispatchEvent({ type: "expiredDiscoveredDevice", message: { discoveredDevice } });
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
