import { createConsole } from "../utils/Console.ts";
import SensorDataManager, { SensorTypes, SensorType } from "./SensorDataManager.ts";
import EventDispatcher from "../utils/EventDispatcher.ts";
import Device, { SendMessageCallback } from "../Device.ts";
import autoBind from "../../node_modules/auto-bind/index.js";
const _console = createConsole("SensorConfigurationManager", { log: true });

export type SensorConfiguration = { [sensorType in SensorType]?: number };

export const MaxSensorRate = 2 ** 16 - 1;
export const SensorRateStep = 5;

export const SensorConfigurationMessageTypes = ["getSensorConfiguration", "setSensorConfiguration"] as const;
export type SensorConfigurationMessageType = (typeof SensorConfigurationMessageTypes)[number];

export const SensorConfigurationEventTypes = SensorConfigurationMessageTypes;
export type SensorConfigurationEventType = (typeof SensorConfigurationEventTypes)[number];

export interface SensorConfigurationEventMessages {
  getSensorConfiguration: { sensorConfiguration: SensorConfiguration };
}

export type SensorConfigurationEventDispatcher = EventDispatcher<
  Device,
  SensorConfigurationEventType,
  SensorConfigurationEventMessages
>;

export type SendSensorConfigurationMessageCallback = SendMessageCallback<SensorConfigurationMessageType>;

class SensorConfigurationManager {
  constructor() {
    autoBind(this);
  }

  sendMessage!: SendSensorConfigurationMessageCallback;

  eventDispatcher!: SensorConfigurationEventDispatcher;
  get addEventListener() {
    return this.eventDispatcher.addEventListener;
  }
  get #dispatchEvent() {
    return this.eventDispatcher.dispatchEvent;
  }
  get waitForEvent() {
    return this.eventDispatcher.waitForEvent;
  }

  #availableSensorTypes!: SensorType[];
  #assertAvailableSensorType(sensorType: SensorType) {
    _console.assertWithError(this.#availableSensorTypes, "must get initial sensorConfiguration");
    const isSensorTypeAvailable = this.#availableSensorTypes?.includes(sensorType);
    _console.assert(isSensorTypeAvailable, `unavailable sensor type "${sensorType}"`);
    return isSensorTypeAvailable;
  }

  #configuration!: SensorConfiguration;
  get configuration() {
    return this.#configuration;
  }

  #updateConfiguration(updatedConfiguration: SensorConfiguration) {
    this.#configuration = updatedConfiguration;
    _console.log({ updatedConfiguration: this.#configuration });
    this.#dispatchEvent("getSensorConfiguration", { sensorConfiguration: this.configuration });
  }

  #isRedundant(sensorConfiguration: SensorConfiguration) {
    let sensorTypes = Object.keys(sensorConfiguration) as SensorType[];
    return sensorTypes.every((sensorType) => {
      return this.configuration[sensorType] == sensorConfiguration[sensorType];
    });
  }

  async setConfiguration(newSensorConfiguration: SensorConfiguration, clearRest?: boolean) {
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

  #parse(dataView: DataView) {
    const parsedSensorConfiguration: SensorConfiguration = {};
    for (let byteOffset = 0; byteOffset < dataView.byteLength; byteOffset += 3) {
      const sensorTypeIndex = dataView.getUint8(byteOffset);
      const sensorType = SensorTypes[sensorTypeIndex];
      if (!sensorType) {
        _console.warn(`unknown sensorType index ${sensorTypeIndex}`);
        continue;
      }
      const sensorRate = dataView.getUint16(byteOffset + 1, true);
      _console.log({ sensorType, sensorRate });
      parsedSensorConfiguration[sensorType] = sensorRate;
    }
    _console.log({ parsedSensorConfiguration });
    this.#availableSensorTypes = Object.keys(parsedSensorConfiguration) as SensorType[];
    return parsedSensorConfiguration;
  }

  static #AssertValidSensorRate(sensorRate: number) {
    _console.assertTypeWithError(sensorRate, "number");
    _console.assertWithError(sensorRate >= 0, `sensorRate must be 0 or greater (got ${sensorRate})`);
    _console.assertWithError(sensorRate < MaxSensorRate, `sensorRate must be 0 or greater (got ${sensorRate})`);
    _console.assertWithError(sensorRate % SensorRateStep == 0, `sensorRate must be multiple of ${SensorRateStep}`);
  }

  #assertValidSensorRate(sensorRate: number) {
    SensorConfigurationManager.#AssertValidSensorRate(sensorRate);
  }

  #createData(sensorConfiguration: SensorConfiguration) {
    let sensorTypes = Object.keys(sensorConfiguration) as SensorType[];
    sensorTypes = sensorTypes.filter((sensorType) => this.#assertAvailableSensorType(sensorType));

    const dataView = new DataView(new ArrayBuffer(sensorTypes.length * 3));
    sensorTypes.forEach((sensorType, index) => {
      SensorDataManager.AssertValidSensorType(sensorType);
      const sensorTypeEnum = SensorTypes.indexOf(sensorType);
      dataView.setUint8(index * 3, sensorTypeEnum);

      const sensorRate = sensorConfiguration[sensorType]!;
      this.#assertValidSensorRate(sensorRate);
      dataView.setUint16(index * 3 + 1, sensorRate, true);
    });
    _console.log({ sensorConfigurationData: dataView });
    return dataView;
  }

  // ZERO
  static #ZeroSensorConfiguration: SensorConfiguration = {};
  static get ZeroSensorConfiguration() {
    return this.#ZeroSensorConfiguration;
  }
  static {
    SensorTypes.forEach((sensorType) => {
      this.#ZeroSensorConfiguration[sensorType] = 0;
    });
  }
  get zeroSensorConfiguration() {
    const zeroSensorConfiguration: SensorConfiguration = {};
    SensorTypes.forEach((sensorType) => {
      zeroSensorConfiguration[sensorType] = 0;
    });
    return zeroSensorConfiguration;
  }
  async clearSensorConfiguration() {
    return this.setConfiguration(this.zeroSensorConfiguration);
  }

  // MESSAGE
  parseMessage(messageType: SensorConfigurationMessageType, dataView: DataView) {
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
}

export default SensorConfigurationManager;
