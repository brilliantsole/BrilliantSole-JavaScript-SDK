import { DeviceType } from "../InformationManager.ts";
import { createConsole } from "../utils/Console.ts";
import { BoundDeviceEventListeners, default as Device } from "../Device.ts";
import EventDispatcher, {
  EventDispatcherTypes,
} from "../utils/EventDispatcher.ts";
import { ScannerLike } from "./Scanner.ts";
import {
  ConnectionEventTypes,
  ConnectionStatus,
  ConnectionType,
} from "../connection/BaseConnectionManager.ts";
import ClientConnectionManager from "../connection/ClientConnectionManager.ts";
import { addEventListeners } from "../utils/EventUtils.ts";

const _console = createConsole("DiscoveredDevice", { log: false });

export interface DiscoveredDeviceMetadata {
  bluetoothId: string;
  name: string;
  deviceType: DeviceType;
  rssi: number;
  ipAddress?: string;
  isWifiSecure?: boolean;
}
export type DiscoveredDeviceMetadataKeys = (keyof DiscoveredDeviceMetadata)[];

export const DiscoveredDeviceEventTypes = [
  "expired",
  "rssi",
  "name",
  "deviceType",
  "ipAddress",
  "isWifiSecure",
  "update",
  "device",
  ...ConnectionEventTypes,
] as const;
export type DiscoveredDeviceEventType =
  (typeof DiscoveredDeviceEventTypes)[number];

export interface DiscoveredDeviceEventMessages {
  expired: {};
  rssi: { rssi: number };
  name: { name: string };
  deviceType: { deviceType: DeviceType };
  ipAddress: { ipAddress: string };
  isWifiSecure: { isWifiSecure: boolean };
  device: { device: Device };
  update: { keys: DiscoveredDeviceMetadataKeys };
  connectionStatus: { connectionStatus: ConnectionStatus; device: Device };
  connected: { device: Device };
  notConnected: { device: Device };
  connecting: { device: Device };
  disconnecting: { device: Device };
}

export type DiscoveredDeviceEventDispatcherTypes = EventDispatcherTypes<
  DiscoveredDevice,
  DiscoveredDeviceEventType,
  DiscoveredDeviceEventMessages
>;
export type DiscoveredDeviceEvent =
  DiscoveredDeviceEventDispatcherTypes["Event"];
export type DiscoveredDeviceEventMap =
  DiscoveredDeviceEventDispatcherTypes["EventMap"];
export type DiscoveredDeviceEventListenerMap =
  DiscoveredDeviceEventDispatcherTypes["EventListenerMap"];
export type DiscoveredDeviceEventDispatcher =
  DiscoveredDeviceEventDispatcherTypes["EventDispatcher"];
export type BoundDiscoveredDeviceEventListeners =
  DiscoveredDeviceEventDispatcherTypes["BoundEventListeners"];

class DiscoveredDevice {
  scanner: ScannerLike;
  #bluetoothId!: string;
  get bluetoothId() {
    return this.#bluetoothId;
  }

  #_name?: string;
  get name() {
    return this.#_name;
  }
  set #name(newName: string) {
    if (this.name == newName) {
      return;
    }
    if (newName) {
      this.#_name = newName;
      this.#dispatchEvent("name", { name: this.#_name });
    }
  }

  #_deviceType?: DeviceType;
  get deviceType() {
    return this.#_deviceType;
  }
  set #deviceType(newDeviceType: DeviceType) {
    if (this.deviceType == newDeviceType) {
      return;
    }
    if (newDeviceType) {
      this.#_deviceType = newDeviceType;
      this.#dispatchEvent("deviceType", { deviceType: this.#_deviceType });
    }
  }

  #_rssi?: number;
  get rssi() {
    return this.#_rssi;
  }
  set #rssi(newRssi: number) {
    // if (this.rssi == newRssi) {
    //   return;
    // }
    this.#_rssi = newRssi;
    if (this.rssi != undefined) {
      this.#dispatchEvent("rssi", { rssi: this.rssi });
    }
  }

  #_ipAddress?: string;
  get ipAddress() {
    return this.#_ipAddress;
  }
  set #ipAddress(newIpAddress: string | undefined) {
    if (this.ipAddress == newIpAddress) {
      return;
    }
    this.#_ipAddress = newIpAddress;
    if (this.ipAddress) {
      this.#dispatchEvent("ipAddress", { ipAddress: this.ipAddress });
    }
  }

  #_isWifiSecure?: boolean;
  get isWifiSecure() {
    return this.#_isWifiSecure;
  }
  set #isWifiSecure(newIsWifiSecure: boolean | undefined) {
    if (this.isWifiSecure == newIsWifiSecure) {
      return;
    }
    this.#_isWifiSecure = newIsWifiSecure;
    // @ts-ignore
    this.#dispatchEvent("isWifiSecure", { isWifiSecure: this.isWifiSecure });
  }

  #deviceAbortController?: AbortController;
  #device?: Device;
  get device() {
    return this.#device;
  }
  private set _device(newDevice: Device | undefined) {
    this.#device = newDevice;
    if (this.device) {
      if (this.device.connectionManager?.type == "client") {
        const connectionManager = this.device
          .connectionManager as ClientConnectionManager;
        connectionManager.discoveredDevice = this;
      }
      if (this.#deviceAbortController) {
        this.#deviceAbortController.abort();
      }
      this.#deviceAbortController = new AbortController();
      addEventListeners(this.#device, this.#boundDeviceEventListeners, {
        signal: this.#deviceAbortController.signal,
      });
      this.#dispatchEvent("device", { device: this.device });
      this.#onDeviceConnectionStatus();
    }
  }
  #boundDeviceEventListeners: BoundDeviceEventListeners = {
    connectionStatus: this.#onDeviceConnectionStatus.bind(this),
  };
  #onDeviceConnectionStatus() {
    const { device } = this;
    if (!device) {
      return;
    }
    const { connectionStatus } = device;

    this.#dispatchEvent("connectionStatus", {
      device,
      connectionStatus,
    });
    this.#dispatchEvent(connectionStatus, { device });
  }

  #expired = false;
  get expired() {
    return this.#expired;
  }

  constructor(
    scanner: ScannerLike,
    metadata: DiscoveredDeviceMetadata,
    device?: Device,
  ) {
    this.scanner = scanner;
    this.#device = device;
    this.update(metadata);
  }

  get isConnected() {
    return this.device?.isConnected ?? false;
  }
  get connectionStatus() {
    return this.device?.connectionStatus ?? "notConnected";
  }

  async connect(connectionType?: ConnectionType) {
    if (this.connectionStatus != "notConnected") {
      return;
    }

    const device = await this.scanner.connectToDevice(
      this.bluetoothId,
      // @ts-expect-error
      connectionType,
    );
    if (device) {
      this._device = device;
    }
  }

  _expire() {
    _console.assertWithError(!this.#expired, "already expired");
    _console.log("discoveredDevice expired", this);
    this.#expired = true;
    this.#dispatchEvent("expired", {});
    if (this.#deviceAbortController) {
      this.#deviceAbortController.abort();
    }
  }

  update(metadata: DiscoveredDeviceMetadata) {
    _console.log("update discoveredDevice", metadata);

    const keys: DiscoveredDeviceMetadataKeys = [];
    const _keys = Object.keys(metadata) as DiscoveredDeviceMetadataKeys;
    _keys.forEach((key) => {
      const value = metadata[key];
      if (this[key] != value || key == "rssi") {
        keys.push(key);
      }
    });

    this.#bluetoothId = metadata.bluetoothId;
    this.#deviceType = metadata.deviceType;
    this.#ipAddress = metadata.ipAddress;
    this.#isWifiSecure = metadata.isWifiSecure;
    this.#name = metadata.name;
    this.#rssi = metadata.rssi;

    _console.log("keys", keys);
    this.#dispatchEvent("update", { keys });

    return keys;
  }

  // EVENT DISPATCHER
  #eventDispatcher: DiscoveredDeviceEventDispatcher = new EventDispatcher(
    this as DiscoveredDevice,
    DiscoveredDeviceEventTypes,
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

  toJSON() {
    const { bluetoothId, name, deviceType, rssi, ipAddress, isWifiSecure } =
      this;
    return {
      bluetoothId,
      name,
      deviceType,
      rssi,
      ipAddress,
      isWifiSecure,
    };
  }
}

export type DiscoveredDevicesMap = { [bluetoothId: string]: DiscoveredDevice };

export default DiscoveredDevice;
