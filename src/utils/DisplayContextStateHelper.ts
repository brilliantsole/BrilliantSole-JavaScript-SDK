import { createConsole } from "./Console.ts";
import { serializeContextState } from "./DisplayContextCommand.ts";
import {
  DefaultDisplayContextState,
  diffContextState,
  DisplayContextState,
  PartialDisplayContextState,
  resetContextState,
  updateContextState,
} from "./DisplayContextState.ts";
import { DisplayManagerInterface } from "./DisplayManagerInterface.ts";

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

  diff(other: PartialDisplayContextState = DefaultDisplayContextState) {
    return diffContextState(this.#state, other);
  }
  update(newState: PartialDisplayContextState) {
    return updateContextState(this.#state, newState);
  }
  reset(
    numberOfColors: number,
    keepColorIndices?: boolean,
    keepSpriteColorIndices?: boolean,
  ) {
    return resetContextState(
      this.#state,
      numberOfColors,
      keepColorIndices,
      keepSpriteColorIndices,
    );
  }

  serialize(
    displayManager: DisplayManagerInterface,
    numberOfColors: number,
    other?: PartialDisplayContextState,
  ) {
    return serializeContextState(
      displayManager,
      this.#state,
      numberOfColors,
      other,
    );
  }
}

export default DisplayContextStateHelper;
