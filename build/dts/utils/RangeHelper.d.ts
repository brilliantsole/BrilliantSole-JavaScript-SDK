export interface Range {
    min: number;
    max: number;
    span: number;
}
declare class RangeHelper {
    #private;
    get min(): number;
    get max(): number;
    get span(): number;
    get range(): Range;
    set min(newMin: number);
    set max(newMax: number);
    reset(): void;
    update(value: number): void;
    getNormalization(value: number, weightByRange: boolean): number;
    updateAndGetNormalization(value: number, weightByRange: boolean): number;
}
export default RangeHelper;
