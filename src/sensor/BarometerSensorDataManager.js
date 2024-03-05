import { createConsole } from "../utils/Console.js";

/** @typedef {"barometer"} BrilliantSoleBarometerSensorType */

const _console = createConsole("BarometerSensorDataManager", { log: true });

class BarometerSensorDataManager {
    static #Scalars = {
        barometer: 100 * 2 ** -7,
    };
    static get Scalars() {
        return this.#Scalars;
    }
    get scalars() {
        return BarometerSensorDataManager.#Scalars;
    }
}

export default BarometerSensorDataManager;
