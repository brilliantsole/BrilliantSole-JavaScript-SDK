export declare const BarometerSensorTypes: readonly ["barometer"];
export type BarometerSensorType = (typeof BarometerSensorTypes)[number];
export declare const ContinuousBarometerSensorTypes: readonly ["barometer"];
export type ContinuousBarometerSensorType = (typeof ContinuousBarometerSensorTypes)[number];
export interface BarometerSensorDataEventMessages {
    barometer: {
        barometer: number;
    };
}
declare class BarometerSensorDataManager {
    #private;
    parseData(dataView: DataView, scalar: number): {
        pressure: number;
    };
}
export default BarometerSensorDataManager;
