export declare function wait(delay: number): Promise<void>;
export declare class Timer {
    #private;
    get callback(): Function;
    set callback(newCallback: Function);
    get interval(): number;
    set interval(newInterval: number);
    constructor(callback: Function, interval: number);
    get isRunning(): boolean;
    start(immediately?: boolean): void;
    stop(): void;
    restart(startImmediately?: boolean): void;
}
