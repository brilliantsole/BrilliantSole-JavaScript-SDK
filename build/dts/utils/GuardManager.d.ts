type Guard<TArgs extends unknown[]> = (...args: TArgs) => boolean;
declare class GuardManager<TArgs extends unknown[]> {
    #private;
    add(guard: Guard<TArgs>): void;
    remove(guard: Guard<TArgs>): void;
    evaluate(...args: TArgs): boolean;
    clear(): void;
}
export default GuardManager;
