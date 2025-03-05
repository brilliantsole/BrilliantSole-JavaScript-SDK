export declare const PressureSensorTypes: readonly ["pressure"];
export type PressureSensorType = (typeof PressureSensorTypes)[number];
export declare const ContinuousPressureSensorTypes: readonly ["pressure"];
export type ContinuousPressureSensorType = (typeof ContinuousPressureSensorTypes)[number];
import { Vector2 } from "../utils/MathUtils.ts";
export type PressureSensorPosition = Vector2;
import { CenterOfPressure } from "../utils/CenterOfPressureHelper.ts";
export interface PressureSensorValue {
    position: PressureSensorPosition;
    rawValue: number;
    scaledValue: number;
    normalizedValue: number;
    weightedValue: number;
}
export interface PressureData {
    sensors: PressureSensorValue[];
    scaledSum: number;
    normalizedSum: number;
    center?: CenterOfPressure;
    normalizedCenter?: CenterOfPressure;
}
export interface PressureDataEventMessages {
    pressure: {
        pressure: PressureData;
    };
}
export declare const DefaultNumberOfPressureSensors = 8;
declare class PressureSensorDataManager {
    #private;
    get positions(): Vector2[];
    get numberOfSensors(): number;
    parsePositions(dataView: DataView): void;
    resetRange(): void;
    parseData(dataView: DataView, scalar: number): PressureData;
}
export default PressureSensorDataManager;
