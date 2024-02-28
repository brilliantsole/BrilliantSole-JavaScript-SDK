import { createConsole } from "../utils/Console.js";
import SensorDataManager from "./SensorDataManager.js";

/** @typedef {import("../BrilliantSole.js").BrilliantSoleDeviceType} BrilliantSoleDeviceType */

/** @typedef {import("./SensorDataManager.js").BrilliantSoleSensorType} BrilliantSoleSensorType */
/**
 * @typedef BrilliantSoleSensorConfiguration
 * @type {object}
 * @property {number} accelerometer
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
            const sensorDataRate = dataView.getUint16(index * 2, true);
            _console.log({ sensorType, sensorDataRate });
            parsedSensorConfiguration[sensorType] = sensorDataRate;
        });
        _console.log({ parsedSensorConfiguration });
        return parsedSensorConfiguration;
    }

    /** @param {BrilliantSoleSensorConfiguration} sensorConfiguration */
    createData(sensorConfiguration) {
        /** @type {BrilliantSoleSensorType[]} */
        const sensorTypes = Object.keys(sensorConfiguration);

        sensorTypes.forEach((sensorType) => {
            SensorDataManager.assertValidSensorType(sensorType);
        });

        const dataView = new DataView(new ArrayBuffer(sensorTypes.length * 3));
        let byteOffset = 0;
        sensorTypes.forEach((sensorType) => {
            const sensorTypeEnum = SensorDataManager.Types.indexOf(sensorType);
            dataView.setUint8(byteOffset, sensorTypeEnum);
            dataView.setUint16(byteOffset + 1, sensorTypeEnum, true);
            byteOffset += 3;
        });
        _console.log({ sensorConfigurationData: dataView });
        return dataView;
    }
}

export default SensorConfigurationManager;
