import { createConsole } from "./Console.ts";
import {
  DefaultDisplayContextState,
  DisplayContextState,
  DisplayContextStateKey,
  PartialDisplayContextState,
} from "./DisplayContextState.ts";
import { deepEqual } from "./ObjectUtils.ts";

const _console = createConsole("DisplayContextStateHelper", { log: false });

class DisplayContextStateHelper {
  #state: DisplayContextState = Object.assign({}, DefaultDisplayContextState);
  get state() {
    return this.#state;
  }

  get isSegmentUniform() {
    return (
      this.state.segmentStartRadius == this.state.segmentEndRadius &&
      this.state.segmentStartCap == this.state.segmentEndCap
    );
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
    } else {
      _console.log("found contextState differences", newState);
    }
    differences.forEach((key) => {
      const value = newState[key]!;
      // @ts-expect-error
      this.#state[key] = value;
    });
    return differences;
  }
  reset(
    numberOfColors: number,
    keepColorIndices?: boolean,
    keepSpriteColorIndices?: boolean
  ) {
    // _console.log("reset", {
    //   numberOfColors,
    //   keepColorIndices,
    //   keepSpriteColorIndices,
    // });

    const spriteColorIndices = this.#state.spriteColorIndices.slice();
    const { fillColorIndex, lineColorIndex, backgroundColorIndex } =
      this.#state;

    Object.assign(this.#state, DefaultDisplayContextState);

    if (keepColorIndices) {
      this.#state.fillColorIndex = fillColorIndex;
      this.#state.lineColorIndex = lineColorIndex;
      this.#state.backgroundColorIndex = backgroundColorIndex;
    }

    if (keepSpriteColorIndices) {
      this.#state.spriteColorIndices = spriteColorIndices;
    } else {
      this.#state.spriteColorIndices = new Array(numberOfColors).fill(0);
    }

    this.#state.bitmapColorIndices = new Array(numberOfColors).fill(0);
  }
}

export default DisplayContextStateHelper;
