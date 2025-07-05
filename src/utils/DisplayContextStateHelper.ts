import {
  DefaultDisplayContextState,
  DisplayContextState,
  DisplayContextStateKey,
  PartialDisplayContextState,
} from "../DisplayManager.ts";
import { createConsole } from "./Console.ts";
import { deepEqual } from "./ObjectUtils.ts";

const _console = createConsole("DisplayContextStateHelper", { log: false });

class DisplayContextStateHelper {
  #state: DisplayContextState = Object.assign({}, DefaultDisplayContextState);
  get state() {
    return this.#state;
  }

  diff(other: PartialDisplayContextState) {
    let differences: DisplayContextStateKey[] = [];
    const keys = Object.keys(other) as DisplayContextStateKey[];
    keys.forEach((key) => {
      const value = other[key]!;

      if (!deepEqual(this.#state[key], value)) {
        differences.push(key);
      }
    });
    _console.log("diff", other, differences);
    return differences;
  }
  update(newState: PartialDisplayContextState) {
    let differences = this.diff(newState);
    if (differences.length == 0) {
      _console.log("redundant contextState", newState);
    }
    differences.forEach((key) => {
      const value = newState[key]!;
      // @ts-expect-error
      this.#state[key] = value;
    });
    return differences;
  }
  reset() {
    Object.assign(this.#state, DefaultDisplayContextState);
  }
}

export default DisplayContextStateHelper;
