export type LogFunction = (...data: any[]) => void;
export type AssertLogFunction = (condition: boolean, ...data: any[]) => void;
export interface ConsoleLevelFlags {
    log?: boolean;
    warn?: boolean;
    error?: boolean;
    assert?: boolean;
    table?: boolean;
}
declare class Console {
    #private;
    constructor(type: string);
    setLevelFlags(levelFlags: ConsoleLevelFlags): void;
    /** @throws {Error} if no console with type "type" is found */
    static setLevelFlagsForType(type: string, levelFlags: ConsoleLevelFlags): void;
    static setAllLevelFlags(levelFlags: ConsoleLevelFlags): void;
    static create(type: string, levelFlags?: ConsoleLevelFlags): Console;
    get log(): LogFunction;
    get warn(): LogFunction;
    get error(): LogFunction;
    get assert(): AssertLogFunction;
    get table(): LogFunction;
    /** @throws {Error} if condition is not met */
    assertWithError(condition: any, message: string): void;
    /** @throws {Error} if value's type doesn't match */
    assertTypeWithError(value: any, type: string): void;
    /** @throws {Error} if value's type doesn't match */
    assertEnumWithError(value: string, enumeration: readonly string[]): void;
}
export declare function createConsole(type: string, levelFlags?: ConsoleLevelFlags): Console;
/** @throws {Error} if no console with type is found */
export declare function setConsoleLevelFlagsForType(type: string, levelFlags: ConsoleLevelFlags): void;
export declare function setAllConsoleLevelFlags(levelFlags: ConsoleLevelFlags): void;
export {};
