import { createConsole } from "../utils/Console.js";
import SensorDataManager from "./SensorDataManager.js";

/** @typedef {import("../Device.js").DeviceType} DeviceType */

/** @typedef {import("./SensorDataManager.js").SensorType} SensorType */
/**
 * @typedef SensorConfiguration
 * @type {Object}
 * @property {number} pressure
 * @property {number} acceleration
 * @property {number} gravity
 * @property {number} linearAcceleration
 * @property {number} gyroscope
 * @property {number} magnetometer
 * @property {number} gameRotation
 * @property {number} rotation
 * @property {number} barometer
 */

const _console = createConsole("SensorConfigurationManager", { log: true });

class SensorConfigurationManager {
    /** @type {DeviceType} */
    #deviceType;
    get deviceType() {
        return this.#deviceType;
    }
    set deviceType(newDeviceType) {
        _console.assertTypeWithError(newDeviceType, "string");
        if (this.#deviceType == newDeviceType) {
            _console.warn(`redundant deviceType assignment "${newDeviceType}"`);
            return;
        }
        _console.log({ newDeviceType });
        this.#deviceType = newDeviceType;

        // can later use for non-insole deviceTypes that ignore sensorTypes like "pressure"
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

    /** @param {DataView} dataView */
    parse(dataView) {
        /** @type {SensorConfiguration} */
        const parsedSensorConfiguration = {};
        for (
            let byteOffset = 0, sensorTypeIndex = 0;
            byteOffset < dataView.byteLength;
            byteOffset += 2, sensorTypeIndex++
        ) {
            const sensorType = SensorDataManager.Types[sensorTypeIndex];
            if (!sensorType) {
                _console.warn(`unknown sensorType index ${sensorTypeIndex}`);
                break;
            }
            const sensorRate = dataView.getUint16(byteOffset, true);
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
    #assertValidSensorRate(sensorRate) {
        _console.assertTypeWithError(sensorRate, "number");
        _console.assertWithError(sensorRate >= 0, `sensorRate must be 0 or greater (got ${sensorRate})`);
        _console.assertWithError(
            sensorRate < this.maxSensorRate,
            `sensorRate must be 0 or greater (got ${sensorRate})`
        );
        _console.assertWithError(
            sensorRate % this.sensorRateStep == 0,
            `sensorRate must be multiple of ${this.sensorRateStep}`
        );
    }

    /** @param {SensorConfiguration} sensorConfiguration */
    createData(sensorConfiguration) {
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

    /** @param {SensorConfiguration} sensorConfiguration */
    hasAtLeastOneNonZeroSensorRate(sensorConfiguration) {
        return Object.values(sensorConfiguration).some((value) => value > 0);
    }
}

export default SensorConfigurationManager;
