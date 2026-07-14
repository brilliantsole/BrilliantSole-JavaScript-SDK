export declare function throttle<T extends (...args: any[]) => void>(fn: T, interval: number, trailing?: boolean): (...args: Parameters<T>) => void;
export declare function debounce<T extends (...args: any[]) => void>(fn: T, interval: number, callImmediately?: boolean): (...args: Parameters<T>) => void;
