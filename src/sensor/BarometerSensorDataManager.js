import { createConsole } from "../utils/Console.js";

/** @typedef {"barometer"} BarometerSensorType */

const _console = createConsole("BarometerSensorDataManager", { log: true });

class BarometerSensorDataManager {
    /** @param {number} pressure */
    #calculcateAltitude(pressure) {
        const P0 = 101325; // Standard atmospheric pressure at sea level in Pascals
        const T0 = 288.15; // Standard temperature at sea level in Kelvin
        const L = 0.0065; // Temperature lapse rate in K/m
        const R = 8.3144598; // Universal gas constant in J/(mol·K)
        const g = 9.80665; // Acceleration due to gravity in m/s²
        const M = 0.0289644; // Molar mass of Earth's air in kg/mol

        const exponent = (R * L) / (g * M);
        const h = (T0 / L) * (1 - Math.pow(pressure / P0, exponent));

        return h;
    }

    /**
     * @param {DataView} dataView
     * @param {number} scalar
     */
    parseData(dataView, scalar) {
        const pressure = dataView.getUint32(0, true) * scalar;
        const altitude = this.#calculcateAltitude(pressure);
        _console.log({ pressure, altitude });
        return { pressure };
    }
}

export default BarometerSensorDataManager;
