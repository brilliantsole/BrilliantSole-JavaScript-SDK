export declare function wait(delay: number): Promise<unknown>;
declare class Timer {
    #private;
    get callback(): Function;
    set callback(newCallback: Function);
    get interval(): number;
    set interval(newInterval: number);
    constructor(callback: Function, interval: number);
    get isRunning(): boolean;
    start(): void;
    stop(): void;
    restart(): void;
}
export default Timer;
