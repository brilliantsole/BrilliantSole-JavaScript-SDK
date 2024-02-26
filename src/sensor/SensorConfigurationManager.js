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
    /** @param {DataView} sensorConfigurationData */
    parse(sensorConfigurationData) {
        /** @type {BrilliantSoleSensorConfiguration} */
        const parsedSensorConfiguration = {};
        for (var offset = 0; offset < sensorConfigurationData.byteLength; offset += 3) {
            const sensorTypeEnum = sensorConfigurationData.getUint8(offset);
            SensorDataManager.assertValidSensorTypeEnum(sensorTypeEnum);
            const sensorType = SensorDataManager.Types[sensorTypeEnum];
            const sensorDataRate = sensorConfigurationData.getUint16(offset + 1, true);
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

        const sensorConfigurationData = new DataView(new ArrayBuffer(sensorTypes.length * 3));
        var offset = 0;
        sensorTypes.forEach((sensorType) => {
            const sensorTypeEnum = SensorDataManager.Types.indexOf(sensorType);
            sensorConfigurationData.setUint8(offset, sensorTypeEnum);
            sensorConfigurationData.setUint16(offset + 1, sensorTypeEnum, true);
            offset += 3;
        });
        _console.log({ sensorConfigurationData });
        return sensorConfigurationData;
    }
}

export default SensorConfigurationManager;
