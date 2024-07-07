import { createConsole } from "../utils/Console";
import SensorDataManager from "./SensorDataManager";
import EventDispatcher from "../utils/EventDispatcher";

const _console = createConsole("SensorConfigurationManager", { log: true });

/** @typedef {import("./SensorDataManager").SensorType} SensorType */
/**
 * @typedef {Object} SensorConfiguration
 * @property {number} [pressure]
 * @property {number} [acceleration]
 * @property {number} [gravity]
 * @property {number} [linearAcceleration]
 * @property {number} [gyroscope]
 * @property {number} [magnetometer]
 * @property {number} [gameRotation]
 * @property {number} [rotation]
 * @property {number} [orientation]
 * @property {number} [activity]
 * @property {number} [stepDetector]
 * @property {number} [stepCounter]
 * @property {number} [deviceOrientation]
 * @property {number} [barometer]
 */

/** @typedef {"getSensorConfiguration" | "setSensorConfiguration"} SensorConfigurationMessageType */
/** @typedef {SensorConfigurationMessageType} SensorConfigurationManagerEventType */

/** @typedef {import("../utils/EventDispatcher").EventDispatcherListener} EventDispatcherListener */
/** @typedef {import("../utils/EventDispatcher").EventDispatcherOptions} EventDispatcherOptions */

/** @typedef {import("../Device").Device} Device */
/**
 * @typedef {Object} SensorConfigurationManagerEvent
 * @property {Device} target
 * @property {SensorConfigurationManagerEventType} type
 * @property {Object} message
 */

class SensorConfigurationManager {
  // MESSAGE TYPES

  /** @type {SensorConfigurationMessageType[]} */
  static #MessageTypes = ["getSensorConfiguration", "setSensorConfiguration"];
  static get MessageTypes() {
    return this.#MessageTypes;
  }
  get messageTypes() {
    return SensorConfigurationManager.MessageTypes;
  }

  // EVENT DISPATCHER

  /** @type {SensorConfigurationManagerEventType[]} */
  static #EventTypes = [...this.#MessageTypes];
  static get EventTypes() {
    return this.#EventTypes;
  }
  get eventTypes() {
    return SensorConfigurationManager.#EventTypes;
  }
  /** @type {EventDispatcher} */
  eventDispatcher;

  /** @param {SensorConfigurationManagerEvent} event */
  #dispatchEvent(event) {
    this.eventDispatcher.dispatchEvent(event);
  }

  /** @param {SensorConfigurationManagerEventType} eventType */
  waitForEvent(eventType) {
    return this.eventDispatcher.waitForEvent(eventType);
  }

  // SENSOR TYPES

  static get #SensorTypes() {
    return SensorDataManager.Types;
  }
  get #sensorTypes() {
    return SensorConfigurationManager.#SensorTypes;
  }

  /** @type {SensorType[]} */
  #availableSensorTypes;
  /** @param {SensorType} sensorType */
  #assertAvailableSensorType(sensorType) {
    _console.assertWithError(this.#availableSensorTypes, "must get initial sensorConfiguration");
    const isSensorTypeAvailable = this.#availableSensorTypes?.includes(sensorType);
    _console.assert(isSensorTypeAvailable, `unavailable sensor type "${sensorType}"`);
    return isSensorTypeAvailable;
  }

  /** @type {SensorConfiguration} */
  #configuration;
  get configuration() {
    return this.#configuration;
  }

  /** @param {SensorConfiguration} updatedConfiguration */
  #updateConfiguration(updatedConfiguration) {
    this.#configuration = updatedConfiguration;
    _console.log({ updatedConfiguration: this.#configuration });
    this.#dispatchEvent({
      type: "getSensorConfiguration",
      message: { sensorConfiguration: this.configuration },
    });
  }

  /** @param {SensorConfiguration} sensorConfiguration */
  #isRedundant(sensorConfiguration) {
    /** @type {SensorType[]} */
    let sensorTypes = Object.keys(sensorConfiguration);
    return sensorTypes.every((sensorType) => {
      return this.configuration[sensorType] == sensorConfiguration[sensorType];
    });
  }

  /**
   * @param {SensorConfiguration} newSensorConfiguration
   * @param {boolean} [clearRest]
   */
  async setConfiguration(newSensorConfiguration, clearRest) {
    if (clearRest) {
      newSensorConfiguration = Object.assign({ ...this.zeroSensorConfiguration }, newSensorConfiguration);
    }
    _console.log({ newSensorConfiguration });
    if (this.#isRedundant(newSensorConfiguration)) {
      _console.log("redundant sensor configuration");
      return;
    }
    const setSensorConfigurationData = this.#createData(newSensorConfiguration);
    _console.log({ setSensorConfigurationData });

    const promise = this.waitForEvent("getSensorConfiguration");
    this.sendMessage([{ type: "setSensorConfiguration", data: setSensorConfigurationData.buffer }]);
    await promise;
  }

  /** @param {DataView} dataView */
  #parse(dataView) {
    /** @type {SensorConfiguration} */
    const parsedSensorConfiguration = {};
    for (let byteOffset = 0; byteOffset < dataView.byteLength; byteOffset += 3) {
      const sensorTypeIndex = dataView.getUint8(byteOffset);
      const sensorType = SensorDataManager.Types[sensorTypeIndex];
      if (!sensorType) {
        _console.warn(`unknown sensorType index ${sensorTypeIndex}`);
        continue;
      }
      const sensorRate = dataView.getUint16(byteOffset + 1, true);
      _console.log({ sensorType, sensorRate });
      parsedSensorConfiguration[sensorType] = sensorRate;
    }
    _console.log({ parsedSensorConfiguration });
    this.#availableSensorTypes = Object.keys(parsedSensorConfiguration);
    return parsedSensorConfiguration;
  }

  static #MaxSensorRate = 2 ** 16 - 1;
  static get MaxSensorRate() {
    return this.#MaxSensorRate;
  }
  get maxSensorRate() {
    return SensorConfigurationManager.MaxSensorRate;
  }
  static #SensorRateStep = 5;
  static get SensorRateStep() {
    return this.#SensorRateStep;
  }
  get sensorRateStep() {
    return SensorConfigurationManager.SensorRateStep;
  }

  /** @param {sensorRate} number */
  static #AssertValidSensorRate(sensorRate) {
    _console.assertTypeWithError(sensorRate, "number");
    _console.assertWithError(sensorRate >= 0, `sensorRate must be 0 or greater (got ${sensorRate})`);
    _console.assertWithError(sensorRate < this.MaxSensorRate, `sensorRate must be 0 or greater (got ${sensorRate})`);
    _console.assertWithError(
      sensorRate % this.SensorRateStep == 0,
      `sensorRate must be multiple of ${this.SensorRateStep}`
    );
  }

  /** @param {sensorRate} number */
  #assertValidSensorRate(sensorRate) {
    SensorConfigurationManager.#AssertValidSensorRate(sensorRate);
  }

  /** @param {SensorConfiguration} sensorConfiguration */
  #createData(sensorConfiguration) {
    /** @type {SensorType[]} */
    let sensorTypes = Object.keys(sensorConfiguration);
    sensorTypes = sensorTypes.filter((sensorType) => this.#assertAvailableSensorType(sensorType));

    const dataView = new DataView(new ArrayBuffer(sensorTypes.length * 3));
    sensorTypes.forEach((sensorType, index) => {
      SensorDataManager.AssertValidSensorType(sensorType);
      const sensorTypeEnum = SensorDataManager.Types.indexOf(sensorType);
      dataView.setUint8(index * 3, sensorTypeEnum);

      const sensorRate = sensorConfiguration[sensorType];
      this.#assertValidSensorRate(sensorRate);
      dataView.setUint16(index * 3 + 1, sensorConfiguration[sensorType], true);
    });
    _console.log({ sensorConfigurationData: dataView });
    return dataView;
  }

  // ZERO

  /** @type {SensorConfiguration} */
  static #ZeroSensorConfiguration = {};
  static get ZeroSensorConfiguration() {
    return this.#ZeroSensorConfiguration;
  }
  static {
    this.#SensorTypes.forEach((sensorType) => {
      this.#ZeroSensorConfiguration[sensorType] = 0;
    });
  }
  get zeroSensorConfiguration() {
    /** @type {SensorConfiguration} */
    const zeroSensorConfiguration = {};
    this.#sensorTypes.forEach((sensorType) => {
      zeroSensorConfiguration[sensorType] = 0;
    });
    return zeroSensorConfiguration;
  }
  async clearSensorConfiguration() {
    return this.setConfiguration(this.zeroSensorConfiguration);
  }

  // MESSAGE

  /**
   * @param {SensorConfigurationMessageType} messageType
   * @param {DataView} dataView
   */
  parseMessage(messageType, dataView) {
    _console.log({ messageType });

    switch (messageType) {
      case "getSensorConfiguration":
      case "setSensorConfiguration":
        const newSensorConfiguration = this.#parse(dataView);
        this.#updateConfiguration(newSensorConfiguration);
        break;
      default:
        throw Error(`uncaught messageType ${messageType}`);
    }
  }

  /**
   * @callback SendMessageCallback
   * @param {{type: SensorConfigurationMessageType, data: ArrayBuffer}[]} messages
   * @param {boolean} sendImmediately
   */

  /** @type {SendMessageCallback} */
  sendMessage;
}

export default SensorConfigurationManager;
