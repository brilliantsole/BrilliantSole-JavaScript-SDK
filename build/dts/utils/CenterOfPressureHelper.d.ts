import RangeHelper from "./RangeHelper.ts";
import { Vector2 } from "./MathUtils.ts";
export type CenterOfPressure = Vector2;
export interface CenterOfPressureRange {
    x: RangeHelper;
    y: RangeHelper;
}
declare class CenterOfPressureHelper {
    #private;
    reset(): void;
    update(centerOfPressure: CenterOfPressure): void;
    getNormalization(centerOfPressure: CenterOfPressure, weightByRange: boolean): CenterOfPressure;
    updateAndGetNormalization(centerOfPressure: CenterOfPressure, weightByRange: boolean): Vector2;
}
export default CenterOfPressureHelper;
