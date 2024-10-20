declare class RangeHelper {
    #private;
    get min(): number;
    get max(): number;
    set min(newMin: number);
    set max(newMax: number);
    reset(): void;
    update(value: number): void;
    getNormalization(value: number, weightByRange: boolean): number;
    updateAndGetNormalization(value: number, weightByRange: boolean): number;
}
export default RangeHelper;
