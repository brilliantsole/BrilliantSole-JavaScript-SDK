declare class RangeHelper {
    #private;
    reset(): void;
    update(value: number): void;
    getNormalization(value: number, weightByRange: boolean): number;
    updateAndGetNormalization(value: number, weightByRange: boolean): number;
}
export default RangeHelper;
