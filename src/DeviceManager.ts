import { ConnectionStatus } from "./connection/BaseConnectionManager.ts";
import WebBluetoothConnectionManager from "./connection/bluetooth/WebBluetoothConnectionManager.ts";
import { DeviceType } from "./InformationManager.ts";
import { createConsole } from "./utils/Console.ts";
import { isInBluefy, isInBrowser } from "./utils/environment.ts";
import { addEventListeners } from "./utils/EventUtils.ts";
import { wait } from "./utils/Timer.ts";

import Device, {
  BoundDeviceEventListeners,
  DeviceEventMap,
  DeviceEventMessages,
  DeviceEventType,
  DeviceEventTypes,
} from "./Device.ts";
import EventDispatcher, {
  EventDispatcherTypes,
  WildcardEventType,
  wildcardEventType,
} from "./utils/EventDispatcher.ts";
import { capitalizeFirstCharacter } from "./utils/stringUtils.ts";
import {
  AddPrefixToInterfaceKeys,
  ExtendInterfaceValues,
  IfAny,
  KeyOf,
  Singleton,
} from "./utils/TypeScriptUtils.ts";
import { serviceUUIDs } from "./connection/bluetooth/bluetoothUUIDs.ts";

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

interface BaseDeviceManagerDeviceEventMessage {
  device: Device;
}
type DeviceManagerDeviceEventMessages = ExtendInterfaceValues<
  AddPrefixToInterfaceKeys<DeviceEventMessages, "device">,
  BaseDeviceManagerDeviceEventMessage
>;
type DeviceManagerDeviceEventType = KeyOf<DeviceManagerDeviceEventMessages>;
function getDeviceManagerDeviceEventTypes(deviceEventType: DeviceEventType) {
  return ["device"].map(
    (prefix) =>
      `${prefix}${capitalizeFirstCharacter(
        deviceEventType,
      )}` as DeviceManagerDeviceEventType,
  );
}
const DeviceManagerDeviceEventTypes = DeviceEventTypes.flatMap((eventType) =>
  getDeviceManagerDeviceEventTypes(eventType),
) as DeviceManagerDeviceEventType[];

export const wildcardDeviceEventType = "device*" as const;
export type WildcardDeviceEventType = typeof wildcardDeviceEventType;

const BaseDeviceManagerEventTypes = [
  "availableDevice",
  "availableDevices",
  "connectedDevices",
  wildcardDeviceEventType,
] as const;
type BaseDeviceManagerEventType = (typeof BaseDeviceManagerEventTypes)[number];

export type WildcardDeviceEventMessage<BaseMessage> = {
  [K in DeviceEventType]: BaseMessage &
    (K extends keyof DeviceEventMessages
      ? IfAny<DeviceEventMessages[K], {}, DeviceEventMessages[K]>
      : {}) & {
      deviceEventType: K;
      device: Device;
    };
}[DeviceEventType];

interface BaseDeviceManagerEventMessages {
  availableDevice: { availableDevice: Device };
  availableDevices: { availableDevices: Device[] };
  connectedDevices: { connectedDevices: Device[] };
  [wildcardDeviceEventType]: WildcardDeviceEventMessage<BaseDeviceManagerDeviceEventMessage>;
}

export const DeviceManagerEventTypes = [
  ...DeviceManagerDeviceEventTypes,
  ...BaseDeviceManagerEventTypes,
] as const;
export type DeviceManagerEventType = (typeof DeviceManagerEventTypes)[number];

export type DeviceManagerEventMessages = DeviceManagerDeviceEventMessages &
  BaseDeviceManagerEventMessages;

export type DeviceManagerEventDisptcherTypes = EventDispatcherTypes<
  DeviceManager,
  DeviceManagerEventType,
  DeviceManagerEventMessages
>;
export type DeviceManagerEvent = DeviceManagerEventDisptcherTypes["Event"];
export type DeviceManagerEventMap =
  DeviceManagerEventDisptcherTypes["EventMap"];
export type DeviceManagerEventListenerMap =
  DeviceManagerEventDisptcherTypes["EventListenerMap"];
export type DeviceManagerEventDispatcher =
  DeviceManagerEventDisptcherTypes["EventDispatcher"];
export type BoundDeviceManagerEventListeners =
  DeviceManagerEventDisptcherTypes["BoundEventListeners"];

@Singleton
class DeviceManager {
  static readonly shared: DeviceManager;

  constructor() {
    // @ts-expect-error
    Device.OnDevice = this.onDevice.bind(this);
    // @ts-expect-error
    Device.OnDeviceConnectionStatusUpdated =
      this.onDeviceConnectionStatusUpdated.bind(this);

    if (this.canUseLocalStorage) {
      this.useLocalStorage = true;
    }
  }

  // DEVICE LISTENERS
  #boundDeviceEventListeners: BoundDeviceEventListeners = {
    getType: this.#onDeviceType.bind(this),
    notConnected: this.#onDeviceNotConnected.bind(this),
    connected: this.#onDeviceConnected.bind(this),
    [wildcardEventType]: this.#onDeviceEvent.bind(this),
  };
  /** @private */
  onDevice(device: Device) {
    addEventListeners(device, this.#boundDeviceEventListeners);
  }

  #onDeviceType(deviceEvent: DeviceEventMap["getType"]) {
    if (this.#useLocalStorage) {
      this.#updateLocalStorageConfigurationForDevice(deviceEvent.target);
    }
  }

  // CONNECTION STATUS
  /** @private */
  onDeviceConnectionStatusUpdated(
    device: Device,
    connectionStatus: ConnectionStatus,
  ) {
    if (
      connectionStatus == "notConnected" &&
      !device.canReconnect &&
      this.#availableDevices.includes(device)
    ) {
      const deviceIndex = this.#availableDevices.indexOf(device);
      this.#availableDevices.splice(deviceIndex, 1);
      this.#dispatchAvailableDevices();
    }
  }

  // CONNECTED DEVICES

  #connectedDevices: Device[] = [];
  get connectedDevices() {
    return this.#connectedDevices;
  }

  #useLocalStorage = false;
  get useLocalStorage() {
    return this.#useLocalStorage;
  }
  set useLocalStorage(newUseLocalStorage) {
    this.#assertLocalStorage();
    _console.assertTypeWithError(newUseLocalStorage, "boolean");
    this.#useLocalStorage = newUseLocalStorage;
    if (this.#useLocalStorage && !this.#localStorageConfiguration) {
      this.#loadFromLocalStorage();
    }
  }

  #defaultLocalStorageConfiguration: LocalStorageConfiguration = {
    devices: [],
  };
  #localStorageConfiguration?: LocalStorageConfiguration;

  get canUseLocalStorage() {
    return isInBrowser && window.localStorage;
  }

  #assertLocalStorage() {
    _console.assertWithError(
      isInBrowser,
      "localStorage is only available in the browser",
    );
    _console.assertWithError(window.localStorage, "localStorage not found");
  }
  #localStorageKey = "BS.Device";
  #SaveToLocalStorage() {
    this.#assertLocalStorage();
    localStorage.setItem(
      this.#localStorageKey,
      JSON.stringify(this.#localStorageConfiguration),
    );
  }
  async #loadFromLocalStorage() {
    this.#assertLocalStorage();
    let localStorageString = localStorage.getItem(this.#localStorageKey);
    if (typeof localStorageString != "string") {
      _console.log("no info found in localStorage");
      this.#localStorageConfiguration = Object.assign(
        {},
        this.#defaultLocalStorageConfiguration,
      );
      this.#SaveToLocalStorage();
      return;
    }
    try {
      const configuration = JSON.parse(localStorageString);
      _console.log({ configuration });
      this.#localStorageConfiguration = configuration;
      if (this.canGetDevices) {
        await this.getDevices(); // redundant?
      }
    } catch (error) {
      _console.warn(error);
    }
  }

  #updateLocalStorageConfigurationForDevice(device: Device) {
    if (device.connectionType != "webBluetooth") {
      _console.log("localStorage is only for webBluetooth devices");
      return;
    }
    this.#assertLocalStorage();
    const deviceInformationIndex =
      this.#localStorageConfiguration!.devices.findIndex(
        (deviceInformation) => {
          return deviceInformation.bluetoothId == device.bluetoothId;
        },
      );
    if (deviceInformationIndex == -1) {
      return;
    }
    this.#localStorageConfiguration!.devices[deviceInformationIndex].type =
      device.type;
    this.#SaveToLocalStorage();
  }

  // AVAILABLE DEVICES
  #availableDevices: Device[] = [];
  get availableDevices() {
    return this.#availableDevices;
  }

  get canGetDevices() {
    return isInBrowser && navigator.bluetooth?.getDevices;
  }
  #getDevicesTimeout = 1500;
  /**
   * retrieves devices already connected via web bluetooth in other tabs/windows
   *
   * _only available on web-bluetooth enabled browsers_
   */
  async getDevices(): Promise<Device[] | undefined> {
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

    if (!this.canGetDevices) {
      _console.log("CanGetDevices is false");
      return;
    }

    if (!this.#localStorageConfiguration) {
      this.#loadFromLocalStorage();
    }

    const configuration = this.#localStorageConfiguration!;
    if (!configuration.devices || configuration.devices.length == 0) {
      _console.log("no devices found in configuration");
      return;
    }

    let bluetoothDevices: BluetoothDevice[] = [];
    try {
      bluetoothDevices = await navigator.bluetooth.getDevices();
    } catch (error) {
      _console.warn(error);
    }

    _console.log({ bluetoothDevices });

    if (
      bluetoothDevices[0] &&
      typeof bluetoothDevices[0].watchAdvertisements == "function"
    ) {
      const waitAbortController = new AbortController();
      const bluetoothDeviceAdvertisementEvents: Map<
        BluetoothDevice,
        BluetoothAdvertisingEvent
      > = new Map();
      const bluetoothDeviceAdvertisementAbortController = new AbortController();
      bluetoothDevices.forEach(async (bluetoothDevice) => {
        bluetoothDevice.addEventListener(
          "advertisementreceived",
          (event) => {
            const isDevice = event.uuids.includes(serviceUUIDs[0]);
            _console.log("advertisement received", bluetoothDevice, event, {
              isDevice,
            });

            bluetoothDeviceAdvertisementEvents.set(bluetoothDevice, event);
            if (
              bluetoothDeviceAdvertisementEvents.size == bluetoothDevices.length
            ) {
              _console.log("all devices found - aborting early");
              waitAbortController.abort();
            }
          },
          {
            once: true,
            signal: bluetoothDeviceAdvertisementAbortController.signal,
          },
        );
        await bluetoothDevice.watchAdvertisements({
          signal: bluetoothDeviceAdvertisementAbortController.signal,
        });
      });

      _console.log(
        `waiting for advertisements for ${this.#getDevicesTimeout}ms`,
      );
      await wait(this.#getDevicesTimeout, waitAbortController.signal);
      _console.log(`done waiting for advertisements`);
      bluetoothDeviceAdvertisementAbortController.abort();

      bluetoothDevices = bluetoothDevices.filter((bluetoothDevice) => {
        return bluetoothDeviceAdvertisementEvents.has(bluetoothDevice);
      });
    }

    bluetoothDevices.forEach((bluetoothDevice) => {
      if (!bluetoothDevice.gatt) {
        return;
      }

      let deviceInformation = configuration.devices.find(
        (deviceInformation) =>
          bluetoothDevice.id == deviceInformation.bluetoothId,
      );
      if (!deviceInformation) {
        return;
      }

      let existingConnectedDevice = this.connectedDevices
        .filter((device) => device.connectionType == "webBluetooth")
        .find((device) => device.bluetoothId == bluetoothDevice.id);

      const existingAvailableDevice = this.availableDevices
        .filter((device) => device.connectionType == "webBluetooth")
        .find((device) => device.bluetoothId == bluetoothDevice.id);
      if (existingAvailableDevice) {
        if (
          existingConnectedDevice &&
          existingConnectedDevice?.bluetoothId ==
            existingAvailableDevice.bluetoothId &&
          existingConnectedDevice != existingAvailableDevice
        ) {
          this.availableDevices[
            this.#availableDevices.indexOf(existingAvailableDevice)
          ] = existingConnectedDevice;
        }
        return;
      }

      if (existingConnectedDevice) {
        this.#pushAvailableDevice(existingConnectedDevice);
        return;
      }

      const device = new Device();
      const connectionManager = new WebBluetoothConnectionManager();
      connectionManager.device = bluetoothDevice;
      if (bluetoothDevice.name) {
        // @ts-expect-error
        device._informationManager.updateName(bluetoothDevice.name);
      }
      // @ts-expect-error
      device._informationManager.updateType(deviceInformation.type);
      device.connectionManager = connectionManager;
      this.#pushAvailableDevice(device);
    });
    this.#dispatchAvailableDevices();
    return this.availableDevices;
  }

  // STATIC EVENTLISTENERS

  #eventDispatcher: DeviceManagerEventDispatcher = new EventDispatcher(
    this as DeviceManager,
    DeviceManagerEventTypes,
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
  get removeEventListeners() {
    return this.#eventDispatcher.removeEventListeners;
  }
  // removeAllEventListeners() {
  //   this.#eventDispatcher.removeAllEventListeners();
  // }

  #onDeviceConnected(deviceEvent: DeviceEventMap["connected"]) {
    const { target: device } = deviceEvent;
    this.#onDeviceIsConnected(device);
  }
  #onDeviceNotConnected(deviceEvent: DeviceEventMap["notConnected"]) {
    const { target: device } = deviceEvent;
    this.#onDeviceIsConnected(device);
  }
  #onDeviceIsConnected(device: Device) {
    if (device.isConnected) {
      if (!this.#connectedDevices.includes(device)) {
        _console.log("adding device", device);
        this.#connectedDevices.push(device);
        if (this.useLocalStorage && device.connectionType == "webBluetooth") {
          const deviceInformation: LocalStorageDeviceInformation = {
            type: device.type,
            bluetoothId: device.bluetoothId!,
            ipAddress: device.ipAddress,
            isWifiSecure: device.isWifiSecure,
          };
          const deviceInformationIndex =
            this.#localStorageConfiguration!.devices.findIndex(
              (_deviceInformation) =>
                _deviceInformation.bluetoothId == deviceInformation.bluetoothId,
            );
          if (deviceInformationIndex == -1) {
            this.#localStorageConfiguration!.devices.push(deviceInformation);
          } else {
            this.#localStorageConfiguration!.devices[deviceInformationIndex] =
              deviceInformation;
          }
          this.#SaveToLocalStorage();
        }
        this.#dispatchConnectedDevices();
      } else {
        _console.log("device already included");
      }
    } else {
      if (this.#connectedDevices.includes(device)) {
        _console.log("removing device", device);
        this.#connectedDevices.splice(
          this.#connectedDevices.indexOf(device),
          1,
        );
        this.#dispatchConnectedDevices();
      } else {
        _console.log("device already not included");
      }
    }
    if (this.canGetDevices) {
      this.getDevices();
    }
    if (device.isConnected && !this.availableDevices.includes(device)) {
      const existingAvailableDevice = this.availableDevices.find(
        (_device) => _device.bluetoothId == device.bluetoothId,
      );
      _console.log({ existingAvailableDevice });
      if (existingAvailableDevice) {
        this.availableDevices[
          this.availableDevices.indexOf(existingAvailableDevice)
        ] = device;
      } else {
        this.#pushAvailableDevice(device);
      }
      this.#dispatchAvailableDevices();
    }
    this._checkDeviceAvailability(device);
  }
  #onDeviceEvent(deviceEvent: DeviceEventMap[WildcardEventType]) {
    const { type: deviceEventType, target: device, message } = deviceEvent;

    this.#dispatchEvent(wildcardDeviceEventType, {
      ...message,
      device,
      deviceEventType,
    });

    getDeviceManagerDeviceEventTypes(
      deviceEventType as DeviceEventType,
    ).forEach((eventType) => {
      this.#dispatchEvent(eventType, {
        ...message,
        device,
      });
    });
  }

  private _checkDeviceAvailability(device: Device) {
    if (
      !device.isConnected &&
      !device.isAvailable &&
      this.#availableDevices.includes(device)
    ) {
      _console.log("removing device from availableDevices...");
      this.#availableDevices.splice(this.#availableDevices.indexOf(device), 1);
      this.#dispatchAvailableDevices();
    }
  }

  #pushAvailableDevice(availableDevice: Device) {
    _console.log({ availableDevice });
    this.availableDevices.push(availableDevice);
    this.#dispatchEvent("availableDevice", { availableDevice });
  }
  #dispatchAvailableDevices() {
    _console.log({ availableDevices: this.availableDevices });
    this.#dispatchEvent("availableDevices", {
      availableDevices: this.availableDevices,
    });
  }
  #dispatchConnectedDevices() {
    _console.log({ connectedDevices: this.connectedDevices });
    this.#dispatchEvent("connectedDevices", {
      connectedDevices: this.connectedDevices,
    });
  }
}

export default DeviceManager.shared;
