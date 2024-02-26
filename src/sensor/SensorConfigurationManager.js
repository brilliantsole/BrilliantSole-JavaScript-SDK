import { createConsole } from "../utils/Console.js";
import SensorDataManager from "./SensorDataManager.js";

/** @typedef {import("./SensorDataManager.js").BrilliantSoleSensorType} BrilliantSoleSensorType */

const _console = createConsole("SensorConfigurationManager", { log: true });

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

class SensorConfigurationManager {
    /** @param {DataView} dataView */
    parse(dataView) {
        /** @type {BrilliantSoleSensorConfiguration} */
        const parsedSensorConfiguration = {};
        for (let byteOffset = 0; byteOffset < dataView.byteLength; byteOffset += 3) {
            const sensorTypeEnum = dataView.getUint8(byteOffset);
            SensorDataManager.assertValidSensorTypeEnum(sensorTypeEnum);
            const sensorType = SensorDataManager.Types[sensorTypeEnum];
            const sensorDataRate = dataView.getUint16(byteOffset + 1, true);
            _console.log({ sensorTypeEnum, sensorType, sensorDataRate });
            parsedSensorConfiguration[sensorType] = sensorDataRate;
        }
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
