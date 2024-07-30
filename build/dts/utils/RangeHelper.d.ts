declare class RangeHelper {
    #private;
    reset(): void;
    update(value: number): void;
    getNormalization(value: number, useInterpolation?: boolean): number;
    updateAndGetNormalization(value: number): number;
}
export default RangeHelper;
