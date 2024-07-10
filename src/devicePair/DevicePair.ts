import { createConsole } from "../utils/Console";
import EventDispatcher, { Event, GenericEvent } from "../utils/EventDispatcher";
import { addEventListeners, removeEventListeners } from "../utils/EventUtils";
import Device, { DeviceEvent, DeviceEventType, GenericDeviceEvent } from "../Device";
import DevicePairSensorDataManager, { DevicePairSensorDataEventDispatcher } from "./DevicePairSensorDataManager";
import { capitalizeFirstCharacter } from "../utils/stringUtils";
import { InsoleSides } from "../InformationManager";
import { VibrationConfiguration } from "../vibration/VibrationManager";
import { SensorConfiguration } from "../sensor/SensorConfigurationManager";

const _console = createConsole("DevicePair", { log: true });

export const DevicePairDeviceEventTypes = ["deviceIsConnected", "deviceConnectionStatus"] as const;
export type DevicePairDeviceEventType = (typeof DevicePairDeviceEventTypes)[number];

// FILL - define device type...

export const DevicePairDeviceSensorDataEventTypes = [
  "deviceSensorData",
  "devicePressure",
  "deviceAcceleration",
  "deviceGravity",
  "deviceLinearAcceleration",
  "deviceGyroscope",
  "deviceMagnetometer",
  "deviceGameRotation",
  "deviceRotation",
  "deviceOrientation",
  "deviceDeviceOrientation",
  "deviceActivity",
  "deviceStepCounter",
  "deviceStepDetector",
  "deviceBarometer",
] as const;
type DevicePairDeviceSensorDataEventType = (typeof DevicePairDeviceSensorDataEventTypes)[number];

type DevicePairSensorType = "pressure";
type DevicePairEventType =
  | "isConnected"
  | DevicePairDeviceEventType
  | DevicePairDeviceSensorDataEventType
  | DevicePairSensorType
  | "deviceGetSensorConfiguration";

export interface DevicePairEventMessages {
  // FILL
}

export type DevicePairEventDispatcher = EventDispatcher<DevicePair, DevicePairEventType, DevicePairEventMessages>;
export type DevicePairEvent<Type extends DevicePairEventType> = Event<
  DevicePair,
  DevicePairEventType,
  DevicePairEventMessages,
  Type
>;
export type GenericDevicePairEvent = GenericEvent<DevicePair, DeviceEventType>;

class DevicePair {
  constructor() {
    this.#sensorDataManager.eventDispatcher = this.#eventDispatcher as DevicePairSensorDataEventDispatcher;
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
    this.#dispatchEvent("deviceIsConnected", { device, isConnected: device.isConnected });

    return currentDevice;
  }

  #boundDeviceEventListeners: { [eventType in DeviceEventType]?: Function } = {
    connectionStatus: this.#redispatchDeviceEvent.bind(this),
    isConnected: this.#onDeviceIsConnected.bind(this),
    sensorData: this.#onDeviceSensorData.bind(this),
    getSensorConfiguration: this.#redispatchDeviceEvent.bind(this),
  };

  #redispatchDeviceEvent(deviceEvent: GenericDeviceEvent) {
    this.#dispatchEvent(`device${capitalizeFirstCharacter(deviceEvent.type)}`, {
      ...deviceEvent.message,
      device: deviceEvent.target,
    });
  }

  #onDeviceIsConnected(deviceEvent: GenericDeviceEvent) {
    this.#redispatchDeviceEvent(deviceEvent);
    this.#dispatchEvent("isConnected", { isConnected: this.isConnected });
  }

  // SENSOR CONFIGURATION
  setSensorConfiguration(sensorConfiguration: SensorConfiguration) {
    InsoleSides.forEach((side) => {
      this[side]?.setSensorConfiguration(sensorConfiguration);
    });
  }

  // SENSOR DATA
  #sensorDataManager = new DevicePairSensorDataManager();
  #onDeviceSensorData(deviceEvent: DeviceEvent<"sensorData">) {
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
