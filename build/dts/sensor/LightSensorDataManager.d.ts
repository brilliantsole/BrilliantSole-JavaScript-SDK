export declare const LightSensorTypes: readonly ["light"];
export type LightSensorType = (typeof LightSensorTypes)[number];
export declare const ContinuousLightSensorTypes: readonly ["light"];
export type ContinuousLightSensorType = (typeof ContinuousLightSensorTypes)[number];
export interface LightSensorDataEventMessages {
    light: {
        light: number;
    };
}
declare class LightSensorDataManager {
    parseData(dataView: DataView<ArrayBuffer>, scalar: number): {
        light: number;
    };
}
export default LightSensorDataManager;
