import { createConsole } from "../utils/Console.ts";
import EventDispatcher, {
  BoundEventListeners,
  Event,
  EventListenerMap,
  EventMap,
} from "../utils/EventDispatcher.ts";
import {
  addEventListeners,
  removeEventListeners,
} from "../utils/EventUtils.ts";
import Device, {
  DeviceEvent,
  DeviceEventType,
  DeviceEventMessages,
  DeviceEventTypes,
  BoundDeviceEventListeners,
  DeviceEventMap,
} from "../Device.ts";
import DevicePairSensorDataManager, {
  DevicePairSensorDataEventDispatcher,
} from "./DevicePairSensorDataManager.ts";
import { capitalizeFirstCharacter } from "../utils/stringUtils.ts";
import { Side, Sides } from "../InformationManager.ts";
import { VibrationConfiguration } from "../vibration/VibrationManager.ts";
import { SensorConfiguration } from "../sensor/SensorConfigurationManager.ts";
import {
  DevicePairSensorDataEventMessages,
  DevicePairSensorDataEventTypes,
} from "./DevicePairSensorDataManager.ts";
import {
  AddPrefixToInterfaceKeys,
  ExtendInterfaceValues,
  KeyOf,
} from "../utils/TypeScriptUtils.ts";
import DeviceManager from "../DeviceManager.ts";

const _console = createConsole("DevicePair", { log: false });

interface BaseDevicePairDeviceEventMessage {
  device: Device;
  side: Side;
}
type DevicePairDeviceEventMessages = ExtendInterfaceValues<
  AddPrefixToInterfaceKeys<DeviceEventMessages, "device">,
  BaseDevicePairDeviceEventMessage
>;
type DevicePairDeviceEventType = KeyOf<DevicePairDeviceEventMessages>;
function getDevicePairDeviceEventType(deviceEventType: DeviceEventType) {
  return `device${capitalizeFirstCharacter(
    deviceEventType
  )}` as DevicePairDeviceEventType;
}
const DevicePairDeviceEventTypes = DeviceEventTypes.map((eventType) =>
  getDevicePairDeviceEventType(eventType)
) as DevicePairDeviceEventType[];

export const DevicePairConnectionEventTypes = ["isConnected"] as const;
export type DevicePairConnectionEventType =
  (typeof DevicePairConnectionEventTypes)[number];

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

export type DevicePairEventDispatcher = EventDispatcher<
  DevicePair,
  DevicePairEventType,
  DevicePairEventMessages
>;
export type DevicePairEventMap = EventMap<
  DevicePair,
  DeviceEventType,
  DevicePairEventMessages
>;
export type DevicePairEventListenerMap = EventListenerMap<
  DevicePair,
  DeviceEventType,
  DevicePairEventMessages
>;
export type DevicePairEvent = Event<
  DevicePair,
  DeviceEventType,
  DevicePairEventMessages
>;
export type BoundDevicePairEventListeners = BoundEventListeners<
  DevicePair,
  DeviceEventType,
  DevicePairEventMessages
>;

export const DevicePairTypes = ["insoles", "gloves"] as const;
export type DevicePairType = (typeof DevicePairTypes)[number];

class DevicePair {
  constructor(type: DevicePairType) {
    this.#type = type;
    this.#sensorDataManager.eventDispatcher = this
      .#eventDispatcher as DevicePairSensorDataEventDispatcher;
  }

  get sides() {
    return Sides;
  }

  #type: DevicePairType;
  get type() {
    return this.#type;
  }

  #eventDispatcher: DevicePairEventDispatcher = new EventDispatcher(
    this as DevicePair,
    DevicePairEventTypes
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
  get removeEventListeners() {
    return this.#eventDispatcher.removeEventListeners;
  }
  get removeAllEventListeners() {
    return this.#eventDispatcher.removeAllEventListeners;
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
    return Sides.every((side) => this[side]?.isConnected);
  }
  get isPartiallyConnected() {
    return Sides.some((side) => this[side]?.isConnected);
  }
  get isHalfConnected() {
    return this.isPartiallyConnected && !this.isConnected;
  }
  #assertIsConnected() {
    _console.assertWithError(this.isConnected, "devicePair must be connected");
  }

  #isDeviceCorrectType(device: Device) {
    switch (this.type) {
      case "insoles":
        return device.isInsole;
      case "gloves":
        return device.isGlove;
    }
  }

  assignDevice(device: Device) {
    if (!this.#isDeviceCorrectType(device)) {
      _console.log(
        `device is incorrect type ${device.type} for ${this.type} devicePair`
      );
      return;
    }
    const side = device.side;

    const currentDevice = this[side];

    if (device == currentDevice) {
      _console.log("device already assigned");
      return;
    }

    if (currentDevice) {
      this.#removeDeviceEventListeners(currentDevice);
    }
    this.#addDeviceEventListeners(device);

    switch (side) {
      case "left":
        this.#left = device;
        break;
      case "right":
        this.#right = device;
        break;
    }

    _console.log(`assigned ${side} ${this.type} device`, device);

    this.resetPressureRange();

    this.#dispatchEvent("isConnected", { isConnected: this.isConnected });
    this.#dispatchEvent("deviceIsConnected", {
      device,
      isConnected: device.isConnected,
      side,
    });

    return currentDevice;
  }

  #addDeviceEventListeners(device: Device) {
    addEventListeners(device, this.#boundDeviceEventListeners);
    DeviceEventTypes.forEach((deviceEventType) => {
      device.addEventListener(
        // @ts-expect-error
        deviceEventType,
        this.#redispatchDeviceEvent.bind(this)
      );
    });
  }
  #removeDeviceEventListeners(device: Device) {
    removeEventListeners(device, this.#boundDeviceEventListeners);
    DeviceEventTypes.forEach((deviceEventType) => {
      device.removeEventListener(
        // @ts-expect-error
        deviceEventType,
        this.#redispatchDeviceEvent.bind(this)
      );
    });
  }

  #removeDevice(device: Device) {
    const foundDevice = Sides.some((side) => {
      if (this[side] != device) {
        return false;
      }

      _console.log(`removing ${side} ${this.type} device`, device);
      removeEventListeners(device, this.#boundDeviceEventListeners);

      switch (side) {
        case "left":
          this.#left = undefined;
          break;
        case "right":
          this.#right = undefined;
          break;
      }

      return true;
    });
    if (foundDevice) {
      this.#dispatchEvent("isConnected", { isConnected: this.isConnected });
    }
    return foundDevice;
  }

  #boundDeviceEventListeners: BoundDeviceEventListeners = {
    isConnected: this.#onDeviceIsConnected.bind(this),
    sensorData: this.#onDeviceSensorData.bind(this),
    getType: this.#onDeviceType.bind(this),
  };

  #redispatchDeviceEvent(deviceEvent: DeviceEvent) {
    const { type, target: device, message } = deviceEvent;
    this.#dispatchEvent(getDevicePairDeviceEventType(type), {
      ...message,
      device,
      side: device.side,
    });
  }

  #onDeviceIsConnected(deviceEvent: DeviceEventMap["isConnected"]) {
    this.#dispatchEvent("isConnected", { isConnected: this.isConnected });
  }

  #onDeviceType(deviceEvent: DeviceEventMap["getType"]) {
    const { target: device } = deviceEvent;
    if (this[device.side] == device) {
      return;
    }
    const foundDevice = this.#removeDevice(device);
    if (!foundDevice) {
      return;
    }
    this.assignDevice(device);
  }

  // SENSOR CONFIGURATION
  async setSensorConfiguration(sensorConfiguration: SensorConfiguration) {
    for (let i = 0; i < Sides.length; i++) {
      const side = Sides[i];
      if (this[side]?.isConnected) {
        await this[side].setSensorConfiguration(sensorConfiguration);
      }
    }
  }

  // SENSOR DATA
  #sensorDataManager = new DevicePairSensorDataManager();
  #onDeviceSensorData(deviceEvent: DeviceEventMap["sensorData"]) {
    if (this.isConnected) {
      this.#sensorDataManager.onDeviceSensorData(deviceEvent);
    }
  }
  resetPressureRange() {
    Sides.forEach((side) => this[side]?.resetPressureRange());
    this.#sensorDataManager.resetPressureRange();
  }

  // VIBRATION
  async triggerVibration(
    vibrationConfigurations: VibrationConfiguration[],
    sendImmediately?: boolean
  ) {
    const promises = Sides.map((side) => {
      return this[side]?.triggerVibration(
        vibrationConfigurations,
        sendImmediately
      );
    }).filter(Boolean);
    return Promise.allSettled(promises);
  }

  // SHARED INSTANCES
  static #insoles = new DevicePair("insoles");
  static get insoles() {
    return this.#insoles;
  }
  static #gloves = new DevicePair("gloves");
  static get gloves() {
    return this.#gloves;
  }
  static {
    DeviceManager.AddEventListener("deviceConnected", (event) => {
      const { device } = event.message;
      if (device.isInsole) {
        this.#insoles.assignDevice(device);
      }
      if (device.isGlove) {
        this.#gloves.assignDevice(device);
      }
    });
  }
}

export default DevicePair;
