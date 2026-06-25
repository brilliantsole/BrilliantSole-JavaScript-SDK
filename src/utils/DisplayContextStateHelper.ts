import {
  DisplayBitmapColorPair,
  DisplaySpriteColorPair,
} from "../DisplayManager.ts";
import { createConsole } from "./Console.ts";
import { DisplayContextCommand } from "./DisplayContextCommand.ts";
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

  diff(other: PartialDisplayContextState = DefaultDisplayContextState) {
    let differences: DisplayContextStateKey[] = [];
    const keys = Object.keys(other) as DisplayContextStateKey[];
    keys.forEach((key) => {
      const value = other[key]!;

      // if (Array.isArray(value) && value.length == 0) {
      //   return;
      // }

      if (!deepEqual(this.#state[key], value)) {
        differences.push(key);
      }
    });
    _console.log("diff displayContextState", other, differences);
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
    keepSpriteColorIndices?: boolean,
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

  serialize(numberOfColors: number, other?: PartialDisplayContextState) {
    if (!other) {
      other = structuredClone(DefaultDisplayContextState);
      other.spriteColorIndices = new Array(numberOfColors).fill(0);
      other.bitmapColorIndices = new Array(numberOfColors).fill(0);
    }
    const contextCommands: DisplayContextCommand[] = [];
    const differences = this.diff(other);
    const state = other;
    _console.log("serialize displayContextState", other, differences);
    differences.forEach((difference) => {
      if (state[difference] == undefined) {
        return;
      }
      switch (difference) {
        case "backgroundColorIndex":
          contextCommands.push({
            type: "selectBackgroundColor",
            backgroundColorIndex: state[difference],
          });
          break;
        case "fillBackground":
          contextCommands.push({
            type: "setFillBackground",
            fillBackground: state[difference],
          });
          break;
        case "ignoreFill":
          contextCommands.push({
            type: "setIgnoreFill",
            ignoreFill: state[difference],
          });
          break;
        case "ignoreLine":
          contextCommands.push({
            type: "setIgnoreLine",
            ignoreLine: state[difference],
          });
          break;
        case "fillColorIndex":
          contextCommands.push({
            type: "selectFillColor",
            fillColorIndex: state[difference],
          });
          break;
        case "lineColorIndex":
          contextCommands.push({
            type: "selectLineColor",
            lineColorIndex: state[difference],
          });
          break;
        case "lineWidth":
          contextCommands.push({
            type: "setLineWidth",
            lineWidth: state[difference],
          });
          break;
        case "horizontalAlignment":
          contextCommands.push({
            type: "setHorizontalAlignment",
            horizontalAlignment: state[difference],
          });
          break;
        case "verticalAlignment":
          contextCommands.push({
            type: "setVerticalAlignment",
            verticalAlignment: state[difference],
          });
          break;
        case "rotation":
          contextCommands.push({
            type: "setRotation",
            rotation: state[difference],
          });
          break;
        case "segmentStartCap":
          if (
            differences.includes("segmentEndCap") &&
            state.segmentStartCap == state.segmentEndCap
          ) {
            contextCommands.push({
              type: "setSegmentCap",
              segmentCap: state[difference],
            });
          } else {
            contextCommands.push({
              type: "setSegmentStartCap",
              segmentStartCap: state[difference],
            });
          }
          break;
        case "segmentEndCap":
          if (
            !differences.includes("segmentStartCap") ||
            state.segmentStartCap != state.segmentEndCap
          ) {
            contextCommands.push({
              type: "setSegmentEndCap",
              segmentEndCap: state[difference],
            });
          }
          break;
        case "segmentStartRadius":
          if (
            differences.includes("segmentEndRadius") &&
            state.segmentStartRadius == state.segmentEndRadius
          ) {
            contextCommands.push({
              type: "setSegmentRadius",
              segmentRadius: state[difference],
            });
          } else {
            contextCommands.push({
              type: "setSegmentStartRadius",
              segmentStartRadius: state[difference],
            });
          }
          break;
        case "segmentEndRadius":
          if (
            !differences.includes("segmentStartRadius") ||
            state.segmentStartRadius != state.segmentEndRadius
          ) {
            contextCommands.push({
              type: "setSegmentEndRadius",
              segmentEndRadius: state[difference],
            });
          }
          break;
        case "cropTop":
          contextCommands.push({
            type: "setCropTop",
            cropTop: state[difference],
          });
          break;
        case "cropRight":
          contextCommands.push({
            type: "setCropRight",
            cropRight: state[difference],
          });
          break;
        case "cropBottom":
          contextCommands.push({
            type: "setCropBottom",
            cropBottom: state[difference],
          });
          break;
        case "cropLeft":
          contextCommands.push({
            type: "setCropLeft",
            cropLeft: state[difference],
          });
          break;
        case "rotationCropTop":
          contextCommands.push({
            type: "setRotationCropTop",
            rotationCropTop: state[difference],
          });
          break;
        case "rotationCropRight":
          contextCommands.push({
            type: "setRotationCropRight",
            rotationCropRight: state[difference],
          });
          break;
        case "rotationCropBottom":
          contextCommands.push({
            type: "setRotationCropBottom",
            rotationCropBottom: state[difference],
          });
          break;
        case "rotationCropLeft":
          contextCommands.push({
            type: "setRotationCropLeft",
            rotationCropLeft: state[difference],
          });
          break;
        case "bitmapColorIndices":
          const bitmapColorPairs: DisplayBitmapColorPair[] = [];
          state.bitmapColorIndices!.forEach((colorIndex, bitmapColorIndex) => {
            bitmapColorPairs.push({ bitmapColorIndex, colorIndex });
          });
          contextCommands.push({
            type: "selectBitmapColors",
            bitmapColorPairs,
          });
          break;
        case "bitmapScaleX":
          if (
            differences.includes("bitmapScaleY") &&
            state.bitmapScaleX == state.bitmapScaleY
          ) {
            contextCommands.push({
              type: "setBitmapScale",
              bitmapScale: state[difference],
            });
          } else {
            contextCommands.push({
              type: "setBitmapScaleX",
              bitmapScaleX: state[difference],
            });
          }
          break;
        case "bitmapScaleY":
          if (
            !differences.includes("bitmapScaleX") ||
            state.bitmapScaleX != state.bitmapScaleY
          ) {
            contextCommands.push({
              type: "setBitmapScaleY",
              bitmapScaleY: state[difference],
            });
          }
          break;
        case "spriteColorIndices":
          const spriteColorPairs: DisplaySpriteColorPair[] = [];
          state.spriteColorIndices!.forEach((colorIndex, spriteColorIndex) => {
            spriteColorPairs.push({ spriteColorIndex, colorIndex });
          });
          contextCommands.push({
            type: "selectSpriteColors",
            spriteColorPairs,
          });
          break;
        case "spriteScaleX":
          if (
            differences.includes("spriteScaleY") &&
            state.spriteScaleX == state.spriteScaleY
          ) {
            contextCommands.push({
              type: "setSpriteScale",
              spriteScale: state[difference],
            });
          } else {
            contextCommands.push({
              type: "setSpriteScaleX",
              spriteScaleX: state[difference],
            });
          }
          break;
        case "spriteScaleY":
          if (
            !differences.includes("spriteScaleX") ||
            state.spriteScaleX != state.spriteScaleY
          ) {
            contextCommands.push({
              type: "setSpriteScaleY",
              spriteScaleY: state[difference],
            });
          }
          break;
        case "spritesLineHeight":
          contextCommands.push({
            type: "setSpritesLineHeight",
            spritesLineHeight: state[difference],
          });
          break;
        case "spritesDirection":
          contextCommands.push({
            type: "setSpritesDirection",
            spritesDirection: state[difference],
          });
          break;
        case "spritesLineDirection":
          contextCommands.push({
            type: "setSpritesLineDirection",
            spritesLineDirection: state[difference],
          });
          break;
        case "spritesSpacing":
          contextCommands.push({
            type: "setSpritesSpacing",
            spritesSpacing: state[difference],
          });
          break;
        case "spritesLineSpacing":
          contextCommands.push({
            type: "setSpritesLineSpacing",
            spritesLineSpacing: state[difference],
          });
          break;
        case "spritesAlignment":
          contextCommands.push({
            type: "setSpritesAlignment",
            spritesAlignment: state[difference],
          });
          break;
        case "spritesLineAlignment":
          contextCommands.push({
            type: "setSpritesLineAlignment",
            spritesLineAlignment: state[difference],
          });
          break;
      }
    });
    _console.log("serialized displayContextState", contextCommands);
    return contextCommands;
  }
}

export default DisplayContextStateHelper;
