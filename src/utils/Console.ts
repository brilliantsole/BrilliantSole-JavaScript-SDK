import { isInDev, isInLensStudio, isInNode } from "./environment.ts";

declare var Studio: any | undefined;

export type LogFunction = (...data: any[]) => void;
export type AssertLogFunction = (condition: boolean, ...data: any[]) => void;

export interface ConsoleLevelFlags {
  log?: boolean;
  warn?: boolean;
  error?: boolean;
  assert?: boolean;
  table?: boolean;
}

interface ConsoleLike {
  log?: LogFunction;
  warn?: LogFunction;
  error?: LogFunction;
  assert?: AssertLogFunction;
  table?: LogFunction;
}

var __console: ConsoleLike;
if (isInLensStudio) {
  const log = function (...args: any[]) {
    Studio.log(args.map((value) => new String(value)).join(","));
  };
  __console = {};
  __console.log = log;
  __console.warn = log.bind(__console, "WARNING");
  __console.error = log.bind(__console, "ERROR");
} else {
  __console = console;
}

function getCallerFunctionPath(): string {
  const stack = new Error().stack;
  if (!stack) return "";

  const lines = stack.split("\n");
  const callerLine = lines[3] || lines[2];

  const match = callerLine.match(/at (.*?) \(/) || callerLine.match(/at (.*)/);
  if (!match) return "";

  const fullFn = match[1].trim();
  return `[${fullFn}]`;
}

function wrapWithLocation(fn: LogFunction): LogFunction {
  return (...args: any[]) => {
    if (isInNode) {
      const functionPath = getCallerFunctionPath();
      fn(functionPath, ...args);
    } else {
      fn(...args);
    }
  };
}

// console.assert not supported in WebBLE
if (!__console.assert) {
  const assert: AssertLogFunction = (condition, ...data) => {
    if (!condition) {
      __console.warn!(...data);
    }
  };
  __console.assert = assert;
}

// console.table not supported in WebBLE
if (!__console.table) {
  const table: LogFunction = (...data) => {
    __console.log!(...data);
  };
  __console.table = table;
}

function emptyFunction() {}

const log: LogFunction = wrapWithLocation(__console.log!.bind(__console));
const warn: LogFunction = wrapWithLocation(__console.warn!.bind(__console));
const error: LogFunction = wrapWithLocation(__console.error!.bind(__console));
const table: LogFunction = wrapWithLocation(__console.table!.bind(__console));
const assert: AssertLogFunction = __console.assert.bind(__console);

class Console {
  static #consoles: { [type: string]: Console } = {};

  constructor(type: string) {
    if (Console.#consoles[type]) {
      throw new Error(`"${type}" console already exists`);
    }
    Console.#consoles[type] = this;
  }

  #levelFlags: ConsoleLevelFlags = {
    log: isInDev,
    warn: isInDev,
    assert: true,
    error: true,
    table: true,
  };

  setLevelFlags(levelFlags: ConsoleLevelFlags) {
    Object.assign(this.#levelFlags, levelFlags);
  }

  /** @throws {Error} if no console with type "type" is found */
  static setLevelFlagsForType(type: string, levelFlags: ConsoleLevelFlags) {
    if (!this.#consoles[type]) {
      throw new Error(`no console found with type "${type}"`);
    }
    this.#consoles[type].setLevelFlags(levelFlags);
  }

  static setAllLevelFlags(levelFlags: ConsoleLevelFlags) {
    for (const type in this.#consoles) {
      this.#consoles[type].setLevelFlags(levelFlags);
    }
  }

  static create(type: string, levelFlags?: ConsoleLevelFlags): Console {
    const console = this.#consoles[type] || new Console(type);
    if (isInDev && levelFlags) {
      console.setLevelFlags(levelFlags);
    }
    return console;
  }

  get log() {
    return this.#levelFlags.log ? log : emptyFunction;
  }

  get warn() {
    return this.#levelFlags.warn ? warn : emptyFunction;
  }

  get error() {
    return this.#levelFlags.error ? error : emptyFunction;
  }

  get assert() {
    return this.#levelFlags.assert ? assert : emptyFunction;
  }

  get table() {
    return this.#levelFlags.table ? table : emptyFunction;
  }

  /** @throws {Error} if condition is not met */
  assertWithError(condition: any, message: string) {
    if (!Boolean(condition)) {
      throw new Error(message);
    }
  }

  /** @throws {Error} if value's type doesn't match */
  assertTypeWithError(value: any, type: string) {
    this.assertWithError(
      typeof value == type,
      `value ${value} of type "${typeof value}" not of type "${type}"`
    );
  }

  /** @throws {Error} if value's type doesn't match */
  assertEnumWithError(value: string, enumeration: readonly string[]) {
    this.assertWithError(
      enumeration.includes(value),
      `invalid enum "${value}"`
    );
  }

  /** @throws {Error} if value is not within some range */
  assertRangeWithError(name: string, value: number, min: number, max: number) {
    this.assertWithError(
      value >= min && value <= max,
      `${name} ${value} must be within ${min}-${max}`
    );
  }
}

export function createConsole(
  type: string,
  levelFlags?: ConsoleLevelFlags
): Console {
  return Console.create(type, levelFlags);
}

/** @throws {Error} if no console with type is found */
export function setConsoleLevelFlagsForType(
  type: string,
  levelFlags: ConsoleLevelFlags
) {
  Console.setLevelFlagsForType(type, levelFlags);
}

export function setAllConsoleLevelFlags(levelFlags: ConsoleLevelFlags) {
  Console.setAllLevelFlags(levelFlags);
}
