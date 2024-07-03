import { createConsole } from "../utils/Console.js";
import EventDispatcher, { addEventListeners, removeEventListeners } from "../utils/EventDispatcher.js";
import Device from "../Device.js";
import DevicePairSensorDataManager from "./DevicePairSensorDataManager.js";
import { capitalizeFirstCharacter } from "../utils/stringUtils.js";

const _console = createConsole("DevicePair", { log: true });

/** @typedef {import("../Device.js").InsoleSide} InsoleSide */
/** @typedef {import("../Device.js").DeviceEvent} DeviceEvent */
/** @typedef {import("../Device.js").DeviceEventType} DeviceEventType */

/** @typedef {import("../sensor/SensorDataManager.js").SensorType} SensorType */

/** @typedef {"deviceIsConnected" | "deviceConnectionStatus"} DevicePairDeviceEventType */
/**
 * @typedef { "deviceSensorData" |
 * "devicePressure" |
 * "deviceAcceleration" |
 * "deviceGravity" |
 * "deviceLinearAcceleration" |
 * "deviceGyroscope" |
 * "deviceMagnetometer" |
 * "deviceGameRotation" |
 * "deviceRotation" |
 * "deviceOrientation" |
 * "deviceDeviceOrientation" |
 * "deviceActivity" |
 * "deviceStepCounter" |
 * "deviceStepDetector" |
 * "deviceBarometer"
 * } DevicePairDeviceSensorDataEventType
 */
/** @typedef {"pressure"} DevicePairSensorType */
/** @typedef {"isConnected" | DevicePairDeviceEventType | DevicePairDeviceSensorDataEventType | DevicePairSensorType | "deviceGetSensorConfiguration"} DevicePairEventType */

/** @typedef {import("../utils/EventDispatcher.js").EventDispatcherOptions} EventDispatcherOptions */

/** @typedef {import("../sensor/SensorConfigurationManager.js").SensorConfiguration} SensorConfiguration */

/** @typedef {import("../utils/CenterOfPressureHelper.js").CenterOfPressure} CenterOfPressure */

/**
 * @typedef {Object} BaseDevicePairEvent
 * @property {DevicePair} target
 * @property {DevicePairEventType} type
 */

/**
 * @typedef {Object} BaseDevicePairIsConnectedEvent
 * @property {"isConnected"} type
 * @property {{isConnected: boolean}} message
 */
/** @typedef {BaseDevicePairEvent & BaseDevicePairIsConnectedEvent} DevicePairIsConnectedEvent */

/** @typedef {DevicePairIsConnectedEvent} DevicePairConnectionEvent */

/** @typedef {import("./DevicePairPressureSensorDataManager.js").PressureData} PressureData */
/**
 * @typedef {Object} BaseDevicePairPressureEvent
 * @property {"pressure"} type
 * @property {{pressure: PressureData}} message
 */
/** @typedef {BaseDevicePairEvent & BaseDevicePairPressureEvent} DevicePairPressureEvent */

/** @typedef {DevicePairPressureEvent} DevicePairSensorEvent */

/**
 * @typedef {Object} BaseDevicePairDeviceIsConnectedEvent
 * @property {"deviceIsConnected"} type
 * @property {{device: Device, isConnected: boolean}} message
 */
/** @typedef {BaseDevicePairEvent & BaseDevicePairDeviceIsConnectedEvent} DevicePairDeviceIsConnectedEvent */

/** @typedef {import("../Device.js").ConnectionStatus} ConnectionStatus */
/**
 * @typedef {Object} BaseDevicePairDeviceConnectionStatusEvent
 * @property {"deviceConnectionStatus"} type
 * @property {{device: Device, connectionStatus: ConnectionStatus}} message
 */
/** @typedef {BaseDevicePairEvent & BaseDevicePairDeviceConnectionStatusEvent} DevicePairDeviceConnectionStatusEvent */

/** @typedef {DevicePairDeviceIsConnectedEvent | DevicePairDeviceConnectionStatusEvent} DevicePairDeviceConnectionEvent */

/** @typedef {import("../sensor/SensorDataManager.js").SensorDataEventMessage} SensorDataEventMessage */
/**
 * @typedef {Object} BaseDevicePairDeviceSensorDataEvent
 * @property {DevicePairDeviceSensorDataEventType} type
 * @property {{device: Device} & SensorDataEventMessage} message
 */
/** @typedef {BaseDevicePairEvent & BaseDevicePairDeviceSensorDataEvent} DevicePairDeviceSensorDataEvent */

/**
 * @typedef {Object} BaseDevicePairDeviceAccelerationSensorDataEvent
 * @property {"deviceAcceleration"} type
 * @property {{device: Device} & import("../sensor/MotionSensorDataManager.js").AccelerationDataEventMessage} message
 */
/** @typedef {BaseDevicePairEvent & BaseDevicePairDeviceAccelerationSensorDataEvent} DevicePairDeviceAccelerationSensorDataEvent */

/**
 * @typedef {Object} BaseDevicePairDeviceGravitySensorDataEvent
 * @property {"deviceGravity"} type
 * @property {{device: Device} & import("../sensor/MotionSensorDataManager.js").GravityDataEventMessage} message
 */
/** @typedef {BaseDevicePairEvent & BaseDevicePairDeviceGravitySensorDataEvent} DevicePairDeviceGravitySensorDataEvent */

/**
 * @typedef {Object} BaseDevicePairDeviceLinearAccelerationSensorDataEvent
 * @property {"deviceLinearAcceleration"} type
 * @property {{device: Device} & import("../sensor/MotionSensorDataManager.js").LinearAccelerationDataEventMessage} message
 */
/** @typedef {BaseDevicePairEvent & BaseDevicePairDeviceLinearAccelerationSensorDataEvent} DevicePairDeviceLinearAccelerationSensorDataEvent */

/**
 * @typedef {Object} BaseDevicePairDeviceGyroscopeSensorDataEvent
 * @property {"deviceGyroscope"} type
 * @property {{device: Device} & import("../sensor/MotionSensorDataManager.js").GyroscopeDataEventMessage} message
 */
/** @typedef {BaseDevicePairEvent & BaseDevicePairDeviceGyroscopeSensorDataEvent} DevicePairDeviceGyroscopeSensorDataEvent */

/**
 * @typedef {Object} BaseDevicePairDeviceMagnetometerSensorDataEvent
 * @property {"deviceMagnetometer"} type
 * @property {{device: Device} & import("../sensor/MotionSensorDataManager.js").MagnetometerDataEventMessage} message
 */
/** @typedef {BaseDevicePairEvent & BaseDevicePairDeviceMagnetometerSensorDataEvent} DevicePairDeviceMagnetometerSensorDataEvent */

/**
 * @typedef {Object} BaseDevicePairDeviceRotationSensorDataEvent
 * @property {"deviceRotation"} type
 * @property {{device: Device} & import("../sensor/MotionSensorDataManager.js").RotationDataEventMessage} message
 */
/** @typedef {BaseDevicePairEvent & BaseDevicePairDeviceRotationSensorDataEvent} DevicePairDeviceRotationSensorDataEvent */

/**
 * @typedef {Object} BaseDevicePairDeviceGameRotationSensorDataEvent
 * @property {"deviceGameRotation"} type
 * @property {{device: Device} & import("../sensor/MotionSensorDataManager.js").GameRotationDataEventMessage} message
 */
/** @typedef {BaseDevicePairEvent & BaseDevicePairDeviceGameRotationSensorDataEvent} DevicePairDeviceGameRotationSensorDataEvent */

/**
 * @typedef {Object} BaseDevicePairDeviceDeviceOrientationSensorDataEvent
 * @property {"deviceDeviceOrientation"} type
 * @property {{device: Device} & import("../sensor/MotionSensorDataManager.js").DeviceOrientationDataEventMessage} message
 */
/** @typedef {BaseDevicePairEvent & BaseDevicePairDeviceDeviceOrientationSensorDataEvent} DevicePairDeviceDeviceOrientationSensorDataEvent */

/**
 * @typedef {Object} BaseDevicePairDeviceActivitySensorDataEvent
 * @property {"deviceActivity"} type
 * @property {{device: Device} & import("../sensor/MotionSensorDataManager.js").ActivityDataEventMessage} message
 */
/** @typedef {BaseDevicePairEvent & BaseDevicePairDeviceActivitySensorDataEvent} DevicePairDeviceActivitySensorDataEvent */

/**
 * @typedef {Object} BaseDevicePairDeviceStepDetectorSensorDataEvent
 * @property {"deviceStepDetector"} type
 * @property {{device: Device} & import("../sensor/MotionSensorDataManager.js").StepDetectorDataEventMessage} message
 */
/** @typedef {BaseDevicePairEvent & BaseDevicePairDeviceStepDetectorSensorDataEvent} DevicePairDeviceStepDetectorSensorDataEvent */

/**
 * @typedef {Object} BaseDevicePairDeviceStepCounterSensorDataEvent
 * @property {"deviceStepCounter"} type
 * @property {{device: Device} & import("../sensor/MotionSensorDataManager.js").StepCounterDataEventMessage} message
 */
/** @typedef {BaseDevicePairEvent & BaseDevicePairDeviceStepCounterSensorDataEvent} DevicePairDeviceStepCounterSensorDataEvent */

/**
 * @typedef {Object} BaseDevicePairDeviceBarometerSensorDataEvent
 * @property {"deviceBarometer"} type
 * @property {{device: Device} & import("../sensor/MotionSensorDataManager.js").BarometerDataEventMessage} message
 */
/** @typedef {BaseDevicePairEvent & BaseDevicePairDeviceBarometerSensorDataEvent} DevicePairDeviceBarometerSensorDataEvent */

/**
 * @typedef {DevicePairDeviceSensorDataEvent |
 * DevicePairDeviceAccelerationSensorDataEvent |
 * DevicePairDeviceGravitySensorDataEvent |
 * DevicePairDeviceLinearAccelerationSensorDataEvent |
 * DevicePairDeviceGyroscopeSensorDataEvent |
 * DevicePairDeviceMagnetometerSensorDataEvent |
 * DevicePairDeviceRotationSensorDataEvent |
 * DevicePairDeviceGameRotationSensorDataEvent |
 * DevicePairDeviceDeviceOrientationSensorDataEvent |
 * DevicePairDeviceActivitySensorDataEvent |
 * DevicePairDeviceStepDetectorSensorDataEvent |
 * DevicePairDeviceStepCounterSensorDataEvent |
 * DevicePairDeviceBarometerSensorDataEvent
 * } DevicePairDeviceSensorEvent
 */

/**
 * @typedef {DevicePairDeviceConnectionEvent |
 * DevicePairConnectionEvent |
 * DevicePairDeviceSensorEvent |
 * DevicePairSensorEvent
 * } DevicePairEvent
 */
/** @typedef {(event: DevicePairEvent) => void} DevicePairEventListener */

class DevicePair {
  constructor() {
    this.#sensorDataManager.onDataReceived = this.#onSensorDataReceived.bind(this);
  }

  // EVENT DISPATCHER

  /** @type {DevicePairEventType[]} */
  static #EventTypes = [
    "isConnected",
    "pressure",
    ...Device.EventTypes.map((sensorType) => `device${capitalizeFirstCharacter(sensorType)}`),
  ];
  static get EventTypes() {
    return this.#EventTypes;
  }
  get eventTypes() {
    return DevicePair.#EventTypes;
  }
  #eventDispatcher = new EventDispatcher(this, this.eventTypes);

  /**
   * @param {DevicePairEventType} type
   * @param {DevicePairEventListener} listener
   * @param {EventDispatcherOptions} [options]
   */
  addEventListener(type, listener, options) {
    this.#eventDispatcher.addEventListener(type, listener, options);
  }

  /**
   * @param {DevicePairEvent} event
   */
  #dispatchEvent(event) {
    this.#eventDispatcher.dispatchEvent(event);
  }

  /**
   * @param {DevicePairEventType} type
   * @param {DevicePairEventListener} listener
   */
  removeEventListener(type, listener) {
    return this.#eventDispatcher.removeEventListener(type, listener);
  }

  // SIDES

  static get Sides() {
    return Device.InsoleSides;
  }
  get sides() {
    return DevicePair.Sides;
  }

  /** @type {Device?} */
  #left;
  get left() {
    return this.#left;
  }

  /** @type {Device?} */
  #right;
  get right() {
    return this.#right;
  }

  get isConnected() {
    return this.sides.every((side) => this[side]?.isConnected);
  }
  get isPartiallyConnected() {
    return this.sides.some((side) => this[side]?.isConnected);
  }
  get isHalfConnected() {
    return this.isPartiallyConnected && !this.isConnected;
  }
  #assertIsConnected() {
    _console.assertWithError(this.isConnected, "devicePair must be connected");
  }

  /** @param {Device} device */
  assignInsole(device) {
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

    this.#dispatchEvent({ type: "isConnected", message: { isConnected: this.isConnected } });
    this.#dispatchEvent({ type: "deviceIsConnected", message: { device, isConnected: device.isConnected } });

    return currentDevice;
  }

  /** @type {Object.<string, EventListener} */
  #boundDeviceEventListeners = {
    connectionStatus: this.#redispatchDeviceEvent.bind(this),
    isConnected: this.#onDeviceIsConnected.bind(this),
    sensorData: this.#onDeviceSensorData.bind(this),
    getSensorConfiguration: this.#redispatchDeviceEvent.bind(this),
  };

  /** @param {DeviceEvent} deviceEvent */
  #redispatchDeviceEvent(deviceEvent) {
    this.#dispatchEvent({
      type: `device${capitalizeFirstCharacter(deviceEvent.type)}`,
      message: { ...deviceEvent.message, device: deviceEvent.target },
    });
  }

  /** @param {DeviceEvent} deviceEvent */
  #onDeviceIsConnected(deviceEvent) {
    this.#redispatchDeviceEvent(deviceEvent);
    this.#dispatchEvent({ type: "isConnected", message: { isConnected: this.isConnected } });
  }

  // SENSOR CONFIGURATION

  /** @param {SensorConfiguration} sensorConfiguration */
  setSensorConfiguration(sensorConfiguration) {
    this.sides.forEach((side) => {
      this[side]?.setSensorConfiguration(sensorConfiguration);
    });
  }

  // SENSOR DATA

  #sensorDataManager = new DevicePairSensorDataManager();
  /** @param {DeviceEvent} deviceEvent */
  #onDeviceSensorData(deviceEvent) {
    this.#redispatchDeviceEvent(deviceEvent);
    this.#dispatchEvent({
      type: `device${capitalizeFirstCharacter(deviceEvent.message.sensorType)}`,
      message: { ...deviceEvent.message, device: deviceEvent.target },
    });

    if (this.isConnected) {
      this.#sensorDataManager.onDeviceSensorData(deviceEvent);
    }
  }
  /**
   * @param {SensorType} sensorType
   * @param {Object} sensorData
   * @param {number} sensorData.timestamp
   */
  #onSensorDataReceived(sensorType, sensorData) {
    _console.log({ sensorType, sensorData });
    this.#dispatchEvent({ type: sensorType, message: sensorData });
  }

  resetPressureRange() {
    this.#sensorDataManager.resetPressureRange();
  }

  // VIBRATION

  /** @typedef {import("../vibration/VibrationManager.js").VibrationConfiguration} VibrationConfiguration */
  /**
   * @param {VibrationConfiguration[]} vibrationConfigurations
   * @param {boolean} sendImmediately
   */
  async triggerVibration(vibrationConfigurations, sendImmediately) {
    const promises = this.sides
      .map((side) => {
        return this[side]?.triggerVibration(vibrationConfigurations, sendImmediately);
      })
      .filter(Boolean);
    return Promise.allSettled(promises);
  }

  // SHARED INSTANCE

  static #shared = new DevicePair();
  static get shared() {
    return this.#shared;
  }
  static {
    Device.AddEventListener("deviceConnected", (event) => {
      /** @type {Device} */
      const device = event.message.device;
      if (device.isInsole) {
        this.#shared.assignInsole(device);
      }
    });
  }
}

export default DevicePair;
