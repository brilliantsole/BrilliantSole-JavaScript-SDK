declare class RangeHelper {
    #private;
    reset(): void;
    update(value: number): void;
    getNormalization(value: number): number;
    updateAndGetNormalization(value: any): number;
}
export default RangeHelper;
