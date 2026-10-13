import EventDispatcher, {
  EventDispatcherTypes,
} from "../utils/EventDispatcher.ts";
import { createConsole } from "../utils/Console.ts";
import { Timer } from "../utils/Timer.ts";
import { ConnectionType } from "../connection/BaseConnectionManager.ts";
import DiscoveredDevice, {
  DiscoveredDeviceMetadata,
  DiscoveredDeviceMetadataKeys,
  DiscoveredDevicesMap,
} from "./DiscoveredDevice.ts";
import { default as DeviceManager } from "../DeviceManager.ts";
import { DeviceType, DeviceTypes } from "../InformationManager.ts";
import { default as Device } from "../Device.ts";
import { ConnectionManager } from "../connection/ConnectionManager.ts";

const _console = createConsole("BaseScanner", { log: false });

export const ScannerEventTypes = [
  "isScanningAvailable",
  "isScanning",
  "discoveredDevice",
  "discoveredDeviceUpdate",
  "expiredDiscoveredDevice",
  "discoveredDevices",
  "scanningAvailable",
  "scanningNotAvailable",
  "scanning",
  "notScanning",
] as const;
export type ScannerEventType = (typeof ScannerEventTypes)[number];

export interface ScannerEventMessages {
  discoveredDevice: { discoveredDevice: DiscoveredDevice };
  discoveredDeviceUpdate: {
    discoveredDevice: DiscoveredDevice;
    keys: DiscoveredDeviceMetadataKeys;
  };
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

abstract class BaseScanner {
  // SCANNER MANAGER
  private static OnScanner: (scanner: BaseScanner) => void;

  // IS SUPPORTED
  protected get baseConstructor() {
    return this.constructor as typeof BaseScanner;
  }

  readonly connectionType: ConnectionType = "bluetooth";

  readonly isClient = false;

  // CONSTRUCTOR
  #assertIsSubclass() {
    _console.assertWithError(
      this.constructor != BaseScanner,
      `${this.constructor.name} must be subclassed`,
    );
  }
  constructor() {
    this.#assertIsSubclass();

    _console.log("BaseScanner", this);

    BaseScanner.OnScanner?.(this);
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
  #onExpiredDiscoveredDevice(bluetoothId: string) {
    _console.log({ expiredBluetoothDeviceId: bluetoothId });
    const discoveredDevice = this.#discoveredDevices[bluetoothId];
    if (!discoveredDevice) {
      _console.warn(`no discoveredDevice found with id "${bluetoothId}"`);
      return;
    }
    if (discoveredDevice.isConnected) {
      return;
    }
    _console.log({ expiredDiscoveredDevice: discoveredDevice });
    delete this.#discoveredDevices[bluetoothId];
    delete this.#discoveredDeviceTimestamps[bluetoothId];
    discoveredDevice._expire();
    this.#dispatchEvent("expiredDiscoveredDevice", { discoveredDevice });
  }

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
      for (const bluetoothId in this.#discoveredDevices) {
        this.#onExpiredDiscoveredDevice(bluetoothId);
      }
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

  toggleScan() {
    if (this.isScanning) {
      return this.stopScan();
    } else {
      return this.startScan();
    }
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

  protected _parseManufacturerData(dataView: DataView | string) {
    if (typeof dataView == "string") {
      const array = dataView
        .match(/.{1,2}/g)!
        .map((byte) => parseInt(byte, 16));
      dataView = new DataView(Uint8Array.from(array).buffer);
    }

    let deviceType: DeviceType | undefined;
    let ipAddress: string | undefined;
    let isWifiSecure: boolean | undefined;

    _console.log("_parseAdvertisement", dataView);
    if (dataView.byteLength >= 3) {
      const deviceTypeEnum = dataView.getUint8(2);
      deviceType = DeviceTypes[deviceTypeEnum];
      _console.log({ deviceType });
    }
    if (dataView.byteLength >= 3 + 4) {
      ipAddress = new Uint8Array(dataView.buffer.slice(3, 3 + 4)).join(".");
      _console.log({ ipAddress });
    }
    if (dataView.byteLength >= 3 + 4 + 1) {
      isWifiSecure = dataView.getUint8(3 + 4) != 0;
      _console.log({ isWifiSecure });
    }

    return { deviceType, ipAddress, isWifiSecure };
  }
  protected _onDiscoveredDevice(
    discoveredDeviceMetadata: DiscoveredDeviceMetadata,
  ) {
    _console.log("_onDiscoveredDevice", discoveredDeviceMetadata);

    if (discoveredDeviceMetadata.deviceType == undefined) {
      _console.log("skipping device - no deviceType");
      return;
    }

    let discoveredDevice =
      this.#discoveredDevices[discoveredDeviceMetadata.bluetoothId];
    let exists = Boolean(discoveredDevice);
    if (discoveredDevice) {
      const keys = discoveredDevice.update(discoveredDeviceMetadata);
      if (keys.length > 0) {
        this.#dispatchEvent("discoveredDeviceUpdate", {
          discoveredDevice,
          keys,
        });
      }
    } else {
      discoveredDevice = new DiscoveredDevice(
        this,
        discoveredDeviceMetadata,
        DeviceManager.availableDevices.find(
          (device) =>
            device.bluetoothId == discoveredDeviceMetadata.bluetoothId,
        ),
      );
      this.#discoveredDevices[discoveredDevice.bluetoothId] = discoveredDevice;
    }

    this.#discoveredDeviceTimestamps[discoveredDevice.bluetoothId] = Date.now();
    if (this.isScanning) {
      this.#checkDiscoveredDevicesExpirationTimer.start();
    }

    if (!exists) {
      this.#dispatchEvent("discoveredDevice", {
        discoveredDevice,
      });
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

    entries.forEach(([bluetoothId, discoveredDevice]) => {
      const timestamp = this.#discoveredDeviceTimestamps[bluetoothId];
      if (
        now - timestamp > this.#discoveredDeviceExpirationTimeout &&
        !discoveredDevice.isConnected
      ) {
        _console.log("discovered device timeout");
        this.#onExpiredDiscoveredDevice(bluetoothId);
      }
    });
  }

  // DEVICE CONNECTION
  async connectToDevice(bluetoothId: string, connectionType?: ConnectionType) {
    this.#assertIsAvailable();

    if (connectionType == "none") {
      return;
    }

    _console.log("connecting to discoveredDevice...", bluetoothId);
    let device = DeviceManager.getAvailableDeviceByBluetoothId(
      bluetoothId,
      this.connectionType,
    );
    if (!device) {
      _console.log("creating device for discoveredDevice...", bluetoothId);
      device = new Device();

      const discoveredDevice = this.discoveredDevices[bluetoothId];
      // @ts-expect-error
      discoveredDevice._device = device;
    }

    if (
      !device.connectionManager ||
      (connectionType == this.connectionType &&
        device.connectionManager?.type != this.connectionType)
    ) {
      _console.log("creating connectionManager for device...", bluetoothId);
      device.connectionManager = this._createConnectionManager(bluetoothId);
    }

    const { ipAddress, isWifiSecure } = this.discoveredDevices[bluetoothId];
    if (connectionType && connectionType != this.connectionType && ipAddress) {
      await device.connect({
        type: connectionType,
        ipAddress,
        isWifiSecure,
        reconnect: true,
      });
    } else {
      // @ts-ignore
      await device.connect({ type: this.connectionType, reconnect: true });
    }
  }
  async disconnectFromDevice(bluetoothId: string) {
    this.#assertIsAvailable();

    const device = DeviceManager.getAvailableDeviceByBluetoothId(
      bluetoothId,
      this.connectionType,
    );

    if (device) {
      await device.disconnect();
    }
  }

  abstract _createConnectionManager(bluetoothId: string): ConnectionManager;

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
