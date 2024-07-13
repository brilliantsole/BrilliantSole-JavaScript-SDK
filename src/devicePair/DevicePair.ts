import { createConsole } from "../utils/Console.ts";
import EventDispatcher, { BoundEventListeners, Event, EventMap } from "../utils/EventDispatcher.ts";
import { addEventListeners, removeEventListeners } from "../utils/EventUtils.ts";
import Device, {
  DeviceEvent,
  DeviceEventType,
  DeviceEventMessages,
  DeviceEventTypes,
  BoundDeviceEventListeners,
  DeviceEventMap,
} from "../Device.ts";
import DevicePairSensorDataManager, { DevicePairSensorDataEventDispatcher } from "./DevicePairSensorDataManager.ts";
import { capitalizeFirstCharacter } from "../utils/stringUtils.ts";
import { InsoleSide, InsoleSides } from "../InformationManager.ts";
import { VibrationConfiguration } from "../vibration/VibrationManager.ts";
import { SensorConfiguration } from "../sensor/SensorConfigurationManager.ts";
import { DevicePairSensorDataEventMessages, DevicePairSensorDataEventTypes } from "./DevicePairSensorDataManager.ts";
import { AddPrefixToInterfaceKeys, ExtendInterfaceValues, KeyOf } from "../utils/TypeScriptUtils.ts";

const _console = createConsole("DevicePair", { log: true });

interface BaseDevicePairDeviceEventMessage {
  device: Device;
  side: InsoleSide;
}
type DevicePairDeviceEventMessages = ExtendInterfaceValues<
  AddPrefixToInterfaceKeys<DeviceEventMessages, "device">,
  BaseDevicePairDeviceEventMessage
>;
type DevicePairDeviceEventType = KeyOf<DevicePairDeviceEventMessages>;
function getDevicePairDeviceEventType(deviceEventType: DeviceEventType) {
  return `device${capitalizeFirstCharacter(deviceEventType)}` as DevicePairDeviceEventType;
}
const DevicePairDeviceEventTypes = DeviceEventTypes.map((eventType) =>
  getDevicePairDeviceEventType(eventType)
) as DevicePairDeviceEventType[];

export const DevicePairConnectionEventTypes = ["isConnected"] as const;
export type DevicePairConnectionEventType = (typeof DevicePairConnectionEventTypes)[number];

export interface DevicePairConnectionEventMessages {
  isConnected: { isConnected: boolean };
}

export const DevicePairEventTypes = [
  ...DevicePairConnectionEventTypes,
  ...DevicePairSensorDataEventTypes,
  ...DevicePairDeviceEventTypes,
] as const;
export type DevicePairEventType = (typeof DevicePairEventTypes)[number];

export type DevicePairEventMessages = DevicePairConnectionEventMessages &
  DevicePairSensorDataEventMessages &
  DevicePairDeviceEventMessages;

export type DevicePairEventDispatcher = EventDispatcher<DevicePair, DevicePairEventType, DevicePairEventMessages>;
export type DevicePairEventMap = EventMap<DevicePair, DeviceEventType, DevicePairEventMessages>;
export type DevicePairEvent = Event<DevicePair, DeviceEventType, DevicePairEventMessages>;
export type BoundDevicePairEventListeners = BoundEventListeners<DevicePair, DeviceEventType, DevicePairEventMessages>;

class DevicePair {
  constructor() {
    this.#sensorDataManager.eventDispatcher = this.#eventDispatcher as DevicePairSensorDataEventDispatcher;
  }

  get sides() {
    return InsoleSides;
  }

  #eventDispatcher: DevicePairEventDispatcher = new EventDispatcher(this as DevicePair, DevicePairEventTypes);
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

  // SIDES
  #left?: Device;
  get left() {
    return this.#left;
  }

  #right?: Device;
  get right() {
    return this.#right;
  }

  get isConnected() {
    return InsoleSides.every((side) => this[side]?.isConnected);
  }
  get isPartiallyConnected() {
    return InsoleSides.some((side) => this[side]?.isConnected);
  }
  get isHalfConnected() {
    return this.isPartiallyConnected && !this.isConnected;
  }
  #assertIsConnected() {
    _console.assertWithError(this.isConnected, "devicePair must be connected");
  }

  assignInsole(device: Device) {
    if (!device.isInsole) {
      _console.warn("device is not an insole");
      return;
    }
    const side = device.insoleSide;

    const currentDevice = this[side];

    if (device == currentDevice) {
      _console.log("device already assigned");
      return;
    }

    if (currentDevice) {
      removeEventListeners(currentDevice, this.#boundDeviceEventListeners);
    }
    addEventListeners(device, this.#boundDeviceEventListeners);

    switch (side) {
      case "left":
        this.#left = device;
        break;
      case "right":
        this.#right = device;
        break;
    }

    _console.log(`assigned ${side} insole`, device);

    this.resetPressureRange();

    this.#dispatchEvent("isConnected", { isConnected: this.isConnected });
    this.#dispatchEvent("deviceIsConnected", { device, isConnected: device.isConnected, side });

    return currentDevice;
  }

  #removeInsole(device: Device) {
    const foundDevice = InsoleSides.some((side) => {
      if (this[side] != device) {
        return false;
      }

      _console.log(`removing ${side} insole`, device);
      removeEventListeners(device, this.#boundDeviceEventListeners);
      delete this[side];

      return true;
    });
    if (foundDevice) {
      this.#dispatchEvent("isConnected", { isConnected: this.isConnected });
    }
    return foundDevice;
  }

  #boundDeviceEventListeners: BoundDeviceEventListeners = {
    connectionStatus: this.#redispatchDeviceEvent.bind(this),
    isConnected: this.#onDeviceIsConnected.bind(this),
    sensorData: this.#onDeviceSensorData.bind(this),
    getSensorConfiguration: this.#redispatchDeviceEvent.bind(this),
    getType: this.#onDeviceType.bind(this),
  };

  #redispatchDeviceEvent(deviceEvent: DeviceEvent) {
    const { type, target: device, message } = deviceEvent;
    this.#dispatchEvent(getDevicePairDeviceEventType(type), {
      ...message,
      device,
      side: device.insoleSide,
    });
  }

  #onDeviceIsConnected(deviceEvent: DeviceEventMap["isConnected"]) {
    this.#redispatchDeviceEvent(deviceEvent);
    this.#dispatchEvent("isConnected", { isConnected: this.isConnected });
  }

  #onDeviceType(deviceEvent: DeviceEventMap["getType"]) {
    const { target: device } = deviceEvent;
    if (this[device.insoleSide] == device) {
      return;
    }
    const foundDevice = this.#removeInsole(device);
    if (!foundDevice) {
      return;
    }
    this.assignInsole(device);
  }

  // SENSOR CONFIGURATION
  setSensorConfiguration(sensorConfiguration: SensorConfiguration) {
    InsoleSides.forEach((side) => {
      this[side]?.setSensorConfiguration(sensorConfiguration);
    });
  }

  // SENSOR DATA
  #sensorDataManager = new DevicePairSensorDataManager();
  #onDeviceSensorData(deviceEvent: DeviceEventMap["sensorData"]) {
    this.#redispatchDeviceEvent(deviceEvent);

    if (this.isConnected) {
      this.#sensorDataManager.onDeviceSensorData(deviceEvent);
    }
  }
  resetPressureRange() {
    this.#sensorDataManager.resetPressureRange();
  }

  // VIBRATION
  async triggerVibration(vibrationConfigurations: VibrationConfiguration[], sendImmediately?: boolean) {
    const promises = InsoleSides.map((side) => {
      return this[side]?.triggerVibration(vibrationConfigurations, sendImmediately);
    }).filter(Boolean);
    return Promise.allSettled(promises);
  }

  // SHARED INSTANCE
  static #shared = new DevicePair();
  static get shared() {
    return this.#shared;
  }
  static {
    Device.AddEventListener("deviceConnected", (event) => {
      const device: Device = event.message.device;
      if (device.isInsole) {
        this.#shared.assignInsole(device);
      }
    });
  }
}

export default DevicePair;
