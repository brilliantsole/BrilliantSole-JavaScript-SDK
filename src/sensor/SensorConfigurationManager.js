import { createConsole } from "../utils/Console.js";
import SensorDataManager from "./SensorDataManager.js";

/** @typedef {import("../Device.js").BrilliantSoleDeviceType} BrilliantSoleDeviceType */

/** @typedef {import("./SensorDataManager.js").BrilliantSoleSensorType} BrilliantSoleSensorType */
/**
 * @typedef BrilliantSoleSensorConfiguration
 * @type {object}
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
    /** @type {BrilliantSoleDeviceType} */
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
    }

    /** @param {DataView} dataView */
    parse(dataView) {
        /** @type {BrilliantSoleSensorConfiguration} */
        const parsedSensorConfiguration = {};
        SensorDataManager.Types.forEach((sensorType, index) => {
            const sensorRate = dataView.getUint16(index * 2, true);
            _console.log({ sensorType, sensorRate });
            parsedSensorConfiguration[sensorType] = sensorRate;
        });
        _console.log({ parsedSensorConfiguration });
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

    /** @param {BrilliantSoleSensorConfiguration} sensorConfiguration */
    createData(sensorConfiguration) {
        /** @type {BrilliantSoleSensorType[]} */
        const sensorTypes = Object.keys(sensorConfiguration);

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

    /** @param {BrilliantSoleSensorConfiguration} sensorConfiguration */
    hasAtLeastOneNonZeroSensorRate(sensorConfiguration) {
        return Object.values(sensorConfiguration).some((value) => value > 0);
    }
}

export default SensorConfigurationManager;
