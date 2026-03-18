import { Vector2 } from "./MathUtils.ts";
declare class RangeHelper2 {
    #private;
    reset(): void;
    update(vector2: Vector2): void;
    getNormalization(vector2: Vector2, weightByRange?: boolean, clampValue?: boolean): Vector2;
    updateAndGetNormalization(vector2: Vector2, weightByRange?: boolean): Vector2;
}
export default RangeHelper2;
