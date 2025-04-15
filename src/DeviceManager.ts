import { ConnectionStatus } from "./connection/BaseConnectionManager.ts";
import WebBluetoothConnectionManager from "./connection/bluetooth/WebBluetoothConnectionManager.ts";
import Device, { BoundDeviceEventListeners, DeviceEventMap } from "./Device.ts";
import { DeviceType } from "./InformationManager.ts";
import { createConsole } from "./utils/Console.ts";
import { isInBluefy, isInBrowser } from "./utils/environment.ts";
import EventDispatcher, {
  BoundEventListeners,
  Event,
  EventListenerMap,
  EventMap,
} from "./utils/EventDispatcher.ts";
import { addEventListeners } from "./utils/EventUtils.ts";

const _console = createConsole("DeviceManager", { log: true });

export interface LocalStorageDeviceInformation {
  type: DeviceType;
  bluetoothId: string;
  ipAddress?: string;
  isWifiSecure?: boolean;
}

export interface LocalStorageConfiguration {
  devices: LocalStorageDeviceInformation[];
}

export const DeviceManagerEventTypes = [
  "deviceConnected",
  "deviceDisconnected",
  "deviceIsConnected",
  "availableDevices",
  "connectedDevices",
] as const;
export type DeviceManagerEventType = (typeof DeviceManagerEventTypes)[number];

interface DeviceManagerEventMessage {
  device: Device;
}
export interface DeviceManagerEventMessages {
  deviceConnected: DeviceManagerEventMessage;
  deviceDisconnected: DeviceManagerEventMessage;
  deviceIsConnected: DeviceManagerEventMessage;
  availableDevices: { availableDevices: Device[] };
  connectedDevices: { connectedDevices: Device[] };
}

export type DeviceManagerEventDispatcher = EventDispatcher<
  DeviceManager,
  DeviceManagerEventType,
  DeviceManagerEventMessages
>;
export type DeviceManagerEventMap = EventMap<
  typeof Device,
  DeviceManagerEventType,
  DeviceManagerEventMessages
>;
export type DeviceManagerEventListenerMap = EventListenerMap<
  typeof Device,
  DeviceManagerEventType,
  DeviceManagerEventMessages
>;
export type DeviceManagerEvent = Event<
  typeof Device,
  DeviceManagerEventType,
  DeviceManagerEventMessages
>;
export type BoundDeviceManagerEventListeners = BoundEventListeners<
  typeof Device,
  DeviceManagerEventType,
  DeviceManagerEventMessages
>;

class DeviceManager {
  static readonly shared = new DeviceManager();

  constructor() {
    if (DeviceManager.shared && this != DeviceManager.shared) {
      throw Error("DeviceManager is a singleton - use DeviceManager.shared");
    }

    if (this.CanUseLocalStorage) {
      this.UseLocalStorage = true;
    }
  }

  // DEVICE LISTENERS
  #boundDeviceEventListeners: BoundDeviceEventListeners = {
    getType: this.#onDeviceType.bind(this),
    isConnected: this.#OnDeviceIsConnected.bind(this),
  };
  /** @private */
  onDevice(device: Device) {
    addEventListeners(device, this.#boundDeviceEventListeners);
  }

  #onDeviceType(event: DeviceEventMap["getType"]) {
    if (this.#UseLocalStorage) {
      this.#UpdateLocalStorageConfigurationForDevice(event.target);
    }
  }

  // CONNECTION STATUS
  /** @private */
  OnDeviceConnectionStatusUpdated(
    device: Device,
    connectionStatus: ConnectionStatus
  ) {
    if (
      connectionStatus == "notConnected" &&
      !device.canReconnect &&
      this.#AvailableDevices.includes(device)
    ) {
      const deviceIndex = this.#AvailableDevices.indexOf(device);
      this.AvailableDevices.splice(deviceIndex, 1);
      this.#DispatchAvailableDevices();
    }
  }

  // CONNECTED DEVICES

  #ConnectedDevices: Device[] = [];
  get ConnectedDevices() {
    return this.#ConnectedDevices;
  }

  #UseLocalStorage = false;
  get UseLocalStorage() {
    return this.#UseLocalStorage;
  }
  set UseLocalStorage(newUseLocalStorage) {
    this.#AssertLocalStorage();
    _console.assertTypeWithError(newUseLocalStorage, "boolean");
    this.#UseLocalStorage = newUseLocalStorage;
    if (this.#UseLocalStorage && !this.#LocalStorageConfiguration) {
      this.#LoadFromLocalStorage();
    }
  }

  #DefaultLocalStorageConfiguration: LocalStorageConfiguration = {
    devices: [],
  };
  #LocalStorageConfiguration?: LocalStorageConfiguration;

  get CanUseLocalStorage() {
    return isInBrowser && window.localStorage;
  }

  #AssertLocalStorage() {
    _console.assertWithError(
      isInBrowser,
      "localStorage is only available in the browser"
    );
    _console.assertWithError(window.localStorage, "localStorage not found");
  }
  #LocalStorageKey = "BS.Device";
  #SaveToLocalStorage() {
    this.#AssertLocalStorage();
    localStorage.setItem(
      this.#LocalStorageKey,
      JSON.stringify(this.#LocalStorageConfiguration)
    );
  }
  async #LoadFromLocalStorage() {
    this.#AssertLocalStorage();
    let localStorageString = localStorage.getItem(this.#LocalStorageKey);
    if (typeof localStorageString != "string") {
      _console.log("no info found in localStorage");
      this.#LocalStorageConfiguration = Object.assign(
        {},
        this.#DefaultLocalStorageConfiguration
      );
      this.#SaveToLocalStorage();
      return;
    }
    try {
      const configuration = JSON.parse(localStorageString);
      _console.log({ configuration });
      this.#LocalStorageConfiguration = configuration;
      if (this.CanGetDevices) {
        await this.GetDevices(); // redundant?
      }
    } catch (error) {
      _console.error(error);
    }
  }

  #UpdateLocalStorageConfigurationForDevice(device: Device) {
    if (device.connectionType != "webBluetooth") {
      _console.log("localStorage is only for webBluetooth devices");
      return;
    }
    this.#AssertLocalStorage();
    const deviceInformationIndex =
      this.#LocalStorageConfiguration!.devices.findIndex(
        (deviceInformation) => {
          return deviceInformation.bluetoothId == device.bluetoothId;
        }
      );
    if (deviceInformationIndex == -1) {
      return;
    }
    this.#LocalStorageConfiguration!.devices[deviceInformationIndex].type =
      device.type;
    this.#SaveToLocalStorage();
  }

  // AVAILABLE DEVICES
  #AvailableDevices: Device[] = [];
  get AvailableDevices() {
    return this.#AvailableDevices;
  }

  get CanGetDevices() {
    return isInBrowser && navigator.bluetooth?.getDevices;
  }
  /**
   * retrieves devices already connected via web bluetooth in other tabs/windows
   *
   * _only available on web-bluetooth enabled browsers_
   */
  async GetDevices(): Promise<Device[] | undefined> {
    if (!isInBrowser) {
      _console.warn("GetDevices is only available in the browser");
      return;
    }

    if (!navigator.bluetooth) {
      _console.warn("bluetooth is not available in this browser");
      return;
    }

    if (isInBluefy) {
      _console.warn("bluefy lists too many devices...");
      return;
    }

    if (!navigator.bluetooth.getDevices) {
      _console.warn("bluetooth.getDevices() is not available in this browser");
      return;
    }

    if (!this.CanGetDevices) {
      _console.log("CanGetDevices is false");
      return;
    }

    if (!this.#LocalStorageConfiguration) {
      this.#LoadFromLocalStorage();
    }

    const configuration = this.#LocalStorageConfiguration!;
    if (!configuration.devices || configuration.devices.length == 0) {
      _console.log("no devices found in configuration");
      return;
    }

    const bluetoothDevices = await navigator.bluetooth.getDevices();

    _console.log({ bluetoothDevices });

    bluetoothDevices.forEach((bluetoothDevice) => {
      if (!bluetoothDevice.gatt) {
        return;
      }
      let deviceInformation = configuration.devices.find(
        (deviceInformation) =>
          bluetoothDevice.id == deviceInformation.bluetoothId
      );
      if (!deviceInformation) {
        return;
      }

      let existingConnectedDevice = this.ConnectedDevices.filter(
        (device) => device.connectionType == "webBluetooth"
      ).find((device) => device.bluetoothId == bluetoothDevice.id);

      const existingAvailableDevice = this.AvailableDevices.filter(
        (device) => device.connectionType == "webBluetooth"
      ).find((device) => device.bluetoothId == bluetoothDevice.id);
      if (existingAvailableDevice) {
        if (
          existingConnectedDevice &&
          existingConnectedDevice?.bluetoothId ==
            existingAvailableDevice.bluetoothId &&
          existingConnectedDevice != existingAvailableDevice
        ) {
          this.AvailableDevices[
            this.#AvailableDevices.indexOf(existingAvailableDevice)
          ] = existingConnectedDevice;
        }
        return;
      }

      if (existingConnectedDevice) {
        this.AvailableDevices.push(existingConnectedDevice);
        return;
      }

      const device = new Device();
      const connectionManager = new WebBluetoothConnectionManager();
      connectionManager.device = bluetoothDevice;
      if (bluetoothDevice.name) {
        device._informationManager.updateName(bluetoothDevice.name);
      }
      device._informationManager.updateType(deviceInformation.type);
      device.connectionManager = connectionManager;
      this.AvailableDevices.push(device);
    });
    this.#DispatchAvailableDevices();
    return this.AvailableDevices;
  }

  // STATIC EVENTLISTENERS

  #EventDispatcher: DeviceManagerEventDispatcher = new EventDispatcher(
    this as DeviceManager,
    DeviceManagerEventTypes
  );

  get AddEventListener() {
    return this.#EventDispatcher.addEventListener;
  }
  get #DispatchEvent() {
    return this.#EventDispatcher.dispatchEvent;
  }
  get RemoveEventListener() {
    return this.#EventDispatcher.removeEventListener;
  }
  get RemoveEventListeners() {
    return this.#EventDispatcher.removeEventListeners;
  }
  get RemoveAllEventListeners() {
    return this.#EventDispatcher.removeAllEventListeners;
  }

  #OnDeviceIsConnected(event: DeviceEventMap["isConnected"]) {
    const { target: device } = event;
    if (device.isConnected) {
      if (!this.#ConnectedDevices.includes(device)) {
        _console.log("adding device", device);
        this.#ConnectedDevices.push(device);
        if (this.UseLocalStorage && device.connectionType == "webBluetooth") {
          const deviceInformation: LocalStorageDeviceInformation = {
            type: device.type,
            bluetoothId: device.bluetoothId!,
            ipAddress: device.ipAddress,
            isWifiSecure: device.isWifiSecure,
          };
          const deviceInformationIndex =
            this.#LocalStorageConfiguration!.devices.findIndex(
              (_deviceInformation) =>
                _deviceInformation.bluetoothId == deviceInformation.bluetoothId
            );
          if (deviceInformationIndex == -1) {
            this.#LocalStorageConfiguration!.devices.push(deviceInformation);
          } else {
            this.#LocalStorageConfiguration!.devices[deviceInformationIndex] =
              deviceInformation;
          }
          this.#SaveToLocalStorage();
        }
        this.#DispatchEvent("deviceConnected", { device });
        this.#DispatchEvent("deviceIsConnected", { device });
        this.#DispatchConnectedDevices();
      } else {
        _console.log("device already included");
      }
    } else {
      if (this.#ConnectedDevices.includes(device)) {
        _console.log("removing device", device);
        this.#ConnectedDevices.splice(
          this.#ConnectedDevices.indexOf(device),
          1
        );
        this.#DispatchEvent("deviceDisconnected", { device });
        this.#DispatchEvent("deviceIsConnected", { device });
        this.#DispatchConnectedDevices();
      } else {
        _console.log("device already not included");
      }
    }
    if (this.CanGetDevices) {
      this.GetDevices();
    }
    if (device.isConnected && !this.AvailableDevices.includes(device)) {
      const existingAvailableDevice = this.AvailableDevices.find(
        (_device) => _device.bluetoothId == device.bluetoothId
      );
      _console.log({ existingAvailableDevice });
      if (existingAvailableDevice) {
        this.AvailableDevices[
          this.AvailableDevices.indexOf(existingAvailableDevice)
        ] = device;
      } else {
        this.AvailableDevices.push(device);
      }
      this.#DispatchAvailableDevices();
    }
    this._CheckDeviceAvailability(device);
  }

  _CheckDeviceAvailability(device: Device) {
    if (
      !device.isConnected &&
      !device.isAvailable &&
      this.#AvailableDevices.includes(device)
    ) {
      _console.log("removing device from availableDevices...");
      this.#AvailableDevices.splice(this.#AvailableDevices.indexOf(device), 1);
      this.#DispatchAvailableDevices();
    }
  }

  #DispatchAvailableDevices() {
    _console.log({ AvailableDevices: this.AvailableDevices });
    this.#DispatchEvent("availableDevices", {
      availableDevices: this.AvailableDevices,
    });
  }
  #DispatchConnectedDevices() {
    _console.log({ ConnectedDevices: this.ConnectedDevices });
    this.#DispatchEvent("connectedDevices", {
      connectedDevices: this.ConnectedDevices,
    });
  }
}

export default DeviceManager.shared;
