import { isInDev } from "./environment.js";

/**
 * @callback LogFunction
 * @param {...any} data
 */

/**
 * @callback AssertLogFunction
 * @param {boolean} condition
 * @param {...any} data
 */

/**
 * @typedef ConsoleLevelFlags
 * @type {object}
 * @property {boolean} log
 * @property {boolean} warn
 * @property {boolean} error
 * @property {boolean} assert
 */

function emptyFunction() {}

const log = console.log.bind(console);
const warn = console.warn.bind(console);
const error = console.error.bind(console);
const assert = console.assert.bind(console);

class Console {
    /** @type {Object.<string, Console>} */
    static #consoles = {};

    /**
     * @param {string} type
     */
    constructor(type) {
        if (Console.#consoles[type]) {
            throw new Error(`"${type}" console already exists`);
        }
        Console.#consoles[type] = this;
    }

    /** @type {ConsoleLevelFlags} */
    #levelFlags = {
        log: isInDev,
        warn: isInDev,
        error: isInDev,
    };

    /**
     * @param {ConsoleLevelFlags} levelFlags
     */
    setLevelFlags(levelFlags) {
        Object.assign(this.#levelFlags, levelFlags);
    }

    /**
     * @param {string} type
     * @param {ConsoleLevelFlags} levelFlags
     * @throws {Error} if no console with type "type" is found
     */
    static setLevelFlagsForType(type, levelFlags) {
        if (!this.#consoles[type]) {
            throw new Error(`no console found with type "${type}"`);
        }
        this.#consoles[type].setLevelFlags(levelFlags);
    }

    /**
     * @param {ConsoleLevelFlags} levelFlags
     */
    static setAllLevelFlags(levelFlags) {
        for (const type in this.#consoles) {
            this.#consoles[type].setLevelFlags(levelFlags);
        }
    }

    /**
     * @param {string} type
     * @param {ConsoleLevelFlags} levelFlags
     * @returns {Console}
     */
    static create(type, levelFlags) {
        const console = this.#consoles[type] || new Console(type);
        if (isInDev) {
            console.setLevelFlags(levelFlags);
        }
        return console;
    }

    /** @type {LogFunction} */
    get log() {
        return this.#levelFlags.log ? log : emptyFunction;
    }

    /** @type {LogFunction} */
    get warn() {
        return this.#levelFlags.warn ? warn : emptyFunction;
    }

    /** @type {LogFunction} */
    get error() {
        return this.#levelFlags.error ? error : emptyFunction;
    }

    /** @type {AssertLogFunction} */
    get assert() {
        return this.#levelFlags.assert ? assert : emptyFunction;
    }

    /**
     * @param {boolean} condition
     * @param {string?} message
     * @throws {Error} if condition is not met
     */
    assertWithError(condition, message) {
        if (!condition) {
            throw new Error(message);
        }
    }

    /**
     * @param {any} value
     * @param {string} type
     * @throws {Error} if value's type doesn't match
     */
    assertTypeWithError(value, type) {
        this.assertWithError(typeof value == type, `value of type "${typeof value}" not of type "${type}"`);
    }
}

/**
 * @param {string} type
 * @param {ConsoleLevelFlags?} levelFlags
 * @returns {Console}
 */
export function createConsole(type, levelFlags) {
    return Console.create(type, levelFlags);
}

/**
 * @param {string} type
 * @param {ConsoleLevelFlags} levelFlags
 * @throws {Error} if no console with type is found
 */
export function setConsoleLevelFlagsForType(type, levelFlags) {
    Console.setLevelFlagsForType(type, levelFlags);
}

/**
 * @param {ConsoleLevelFlags} levelFlags
 */
export function setAllConsoleLevelFlags(levelFlags) {
    Console.setAllLevelFlags(levelFlags);
}
