import { ConnectionStatus } from "./connection/BaseConnectionManager.ts";
import WebBluetoothConnectionManager from "./connection/bluetooth/WebBluetoothConnectionManager.ts";
import { DeviceType } from "./InformationManager.ts";
import { createConsole } from "./utils/Console.ts";
import { isInBluefy, isInBrowser } from "./utils/environment.ts";
import { addEventListeners } from "./utils/EventUtils.ts";

import Device, {
  BoundDeviceEventListeners,
  DeviceEventMap,
  DeviceEventMessages,
  DeviceEventType,
  DeviceEventTypes,
} from "./Device.ts";
import EventDispatcher, {
  BoundEventListeners,
  Event,
  EventListenerMap,
  EventMap,
  WildcardEventType,
  wildcardEventType,
} from "./utils/EventDispatcher.ts";
import { capitalizeFirstCharacter } from "./utils/stringUtils.ts";
import {
  AddPrefixToInterfaceKeys,
  ExtendInterfaceValues,
  IfAny,
  KeyOf,
} from "./utils/TypeScriptUtils.ts";

const _console = createConsole("DeviceManager", { log: false });

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
      deviceType: K;
      device: Device;
    };
}[DeviceEventType];

interface BaseDeviceManagerEventMessages {
  availableDevices: { availableDevices: Device[] };
  connectedDevices: { connectedDevices: Device[] };
  [wildcardDeviceEventType]: WildcardDeviceEventMessage<BaseDeviceManagerDeviceEventMessage>;
}

// const x: WildcardDeviceEventMessage<BaseDeviceManagerDeviceEventMessage>["device"];

export const DeviceManagerEventTypes = [
  ...DeviceManagerDeviceEventTypes,
  ...BaseDeviceManagerEventTypes,
] as const;
export type DeviceManagerEventType = (typeof DeviceManagerEventTypes)[number];

export type DeviceManagerEventMessages = DeviceManagerDeviceEventMessages &
  BaseDeviceManagerEventMessages;

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
    isConnected: this.#onDeviceIsConnected.bind(this),
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
      this.availableDevices.splice(deviceIndex, 1);
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
      _console.error(error);
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
      _console.error(error);
    }

    _console.log({ bluetoothDevices });

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
        this.availableDevices.push(existingConnectedDevice);
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
      this.availableDevices.push(device);
    });
    this.#dispatchAvailableDevices();
    return this.availableDevices;
  }

  // STATIC EVENTLISTENERS

  #EventDispatcher: DeviceManagerEventDispatcher = new EventDispatcher(
    this as DeviceManager,
    DeviceManagerEventTypes,
  );

  get addEventListener() {
    return this.#EventDispatcher.addEventListener;
  }
  get #dispatchEvent() {
    return this.#EventDispatcher.dispatchEvent;
  }
  get removeEventListener() {
    return this.#EventDispatcher.removeEventListener;
  }
  get removeEventListeners() {
    return this.#EventDispatcher.removeEventListeners;
  }
  get removeAllEventListeners() {
    return this.#EventDispatcher.removeAllEventListeners;
  }

  #onDeviceIsConnected(deviceEvent: DeviceEventMap["isConnected"]) {
    const { target: device } = deviceEvent;
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
        this.availableDevices.push(device);
      }
      this.#dispatchAvailableDevices();
    }
    this._checkDeviceAvailability(device);
  }
  #onDeviceEvent(deviceEvent: DeviceEventMap[WildcardEventType]) {
    const { type: deviceType, target: device, message } = deviceEvent;

    this.#dispatchEvent(wildcardDeviceEventType, {
      ...message,
      device,
      deviceType,
    });

    getDeviceManagerDeviceEventTypes(deviceType as DeviceEventType).forEach(
      (_type) => {
        this.#dispatchEvent(_type, {
          ...message,
          device,
        });
      },
    );
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
