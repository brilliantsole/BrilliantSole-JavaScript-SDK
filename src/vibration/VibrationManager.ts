import { createConsole } from "../utils/Console";
import { VibrationWaveformEffect, VibrationWaveformEffects } from "./VibrationWaveformEffects";
import { concatenateArrayBuffers } from "../utils/ArrayBufferUtils";
import { SendMessageCallback } from "../Device";

const _console = createConsole("VibrationManager");

export const VibrationLocations = ["front", "rear"] as const;
export type VibrationLocation = (typeof VibrationLocations)[number];

export const VibrationTypes = ["waveformEffect", "waveform"] as const;
export type VibrationType = (typeof VibrationTypes)[number];

export interface VibrationWaveformEffectSegment {
  effect?: VibrationWaveformEffect;
  delay?: number;
  loopCount?: number;
}

export interface VibrationWaveformSegment {
  duration: number;
  amplitude: number;
}

export const VibrationMessageTypes = ["triggerVibration"] as const;
export type VibrationMessageType = (typeof VibrationMessageTypes)[number];

export interface VibrationWaveformEffectConfiguration {
  segments: VibrationWaveformEffectSegment[];
  loopCount?: number;
}

export interface VibrationWaveformConfiguration {
  segments: VibrationWaveformSegment[];
}

export interface VibrationConfiguration {
  locations?: VibrationLocation[];
  type: VibrationType;
  waveformEffect?: VibrationWaveformEffectConfiguration;
  waveform?: VibrationWaveformConfiguration;
}

class VibrationManager {
  #verifyLocation(location: VibrationLocation) {
    _console.assertTypeWithError(location, "string");
    _console.assertWithError(VibrationLocations.includes(location), `invalid location "${location}"`);
  }
  #verifyLocations(locations: VibrationLocation[]) {
    this.#assertNonEmptyArray(locations);
    locations.forEach((location) => {
      this.#verifyLocation(location);
    });
  }
  #createLocationsBitmask(locations: VibrationLocation[]) {
    this.#verifyLocations(locations);

    let locationsBitmask = 0;
    locations.forEach((location) => {
      const locationIndex = VibrationLocations.indexOf(location);
      locationsBitmask |= 1 << locationIndex;
    });
    _console.log({ locationsBitmask });
    _console.assertWithError(locationsBitmask > 0, `locationsBitmask must not be zero`);
    return locationsBitmask;
  }

  #assertNonEmptyArray(array: any[]) {
    _console.assertWithError(Array.isArray(array), "passed non-array");
    _console.assertWithError(array.length > 0, "passed empty array");
  }

  #verifyWaveformEffect(waveformEffect: VibrationWaveformEffect) {
    _console.assertWithError(
      VibrationWaveformEffects.includes(waveformEffect),
      `invalid waveformEffect "${waveformEffect}"`
    );
  }

  static #MaxWaveformEffectSegmentDelay = 1270;
  static get MaxWaveformEffectSegmentDelay() {
    return this.#MaxWaveformEffectSegmentDelay;
  }
  get maxWaveformEffectSegmentDelay() {
    return VibrationManager.MaxWaveformEffectSegmentDelay;
  }
  #verifyWaveformEffectSegment(waveformEffectSegment: VibrationWaveformEffectSegment) {
    if (waveformEffectSegment.effect != undefined) {
      const waveformEffect = waveformEffectSegment.effect;
      this.#verifyWaveformEffect(waveformEffect);
    } else if (waveformEffectSegment.delay != undefined) {
      const { delay } = waveformEffectSegment;
      _console.assertWithError(delay >= 0, `delay must be 0ms or greater (got ${delay})`);
      _console.assertWithError(
        delay <= this.maxWaveformEffectSegmentDelay,
        `delay must be ${this.maxWaveformEffectSegmentDelay}ms or less (got ${delay})`
      );
    } else {
      throw Error("no effect or delay found in waveformEffectSegment");
    }

    if (waveformEffectSegment.loopCount != undefined) {
      const { loopCount } = waveformEffectSegment;
      this.#verifyWaveformEffectSegmentLoopCount(loopCount);
    }
  }
  static #MaxWaveformEffectSegmentLoopCount = 3;
  static get MaxWaveformEffectSegmentLoopCount() {
    return this.#MaxWaveformEffectSegmentLoopCount;
  }
  get maxWaveformEffectSegmentLoopCount() {
    return VibrationManager.MaxWaveformEffectSegmentLoopCount;
  }
  #verifyWaveformEffectSegmentLoopCount(waveformEffectSegmentLoopCount: number) {
    _console.assertTypeWithError(waveformEffectSegmentLoopCount, "number");
    _console.assertWithError(
      waveformEffectSegmentLoopCount >= 0,
      `waveformEffectSegmentLoopCount must be 0 or greater (got ${waveformEffectSegmentLoopCount})`
    );
    _console.assertWithError(
      waveformEffectSegmentLoopCount <= this.maxWaveformEffectSegmentLoopCount,
      `waveformEffectSegmentLoopCount must be ${this.maxWaveformEffectSegmentLoopCount} or fewer (got ${waveformEffectSegmentLoopCount})`
    );
  }

  static #MaxNumberOfWaveformEffectSegments = 8;
  static get MaxNumberOfWaveformEffectSegments() {
    return this.#MaxNumberOfWaveformEffectSegments;
  }
  get maxNumberOfWaveformEffectSegments() {
    return VibrationManager.MaxNumberOfWaveformEffectSegments;
  }
  #verifyWaveformEffectSegments(waveformEffectSegments: VibrationWaveformEffectSegment[]) {
    this.#assertNonEmptyArray(waveformEffectSegments);
    _console.assertWithError(
      waveformEffectSegments.length <= this.maxNumberOfWaveformEffectSegments,
      `must have ${this.maxNumberOfWaveformEffectSegments} waveformEffectSegments or fewer (got ${waveformEffectSegments.length})`
    );
    waveformEffectSegments.forEach((waveformEffectSegment) => {
      this.#verifyWaveformEffectSegment(waveformEffectSegment);
    });
  }

  static #MaxWaveformEffectSequenceLoopCount = 6;
  static get MaxWaveformEffectSequenceLoopCount() {
    return this.#MaxWaveformEffectSequenceLoopCount;
  }
  get maxWaveformEffectSequenceLoopCount() {
    return VibrationManager.MaxWaveformEffectSequenceLoopCount;
  }
  #verifyWaveformEffectSequenceLoopCount(waveformEffectSequenceLoopCount: number) {
    _console.assertTypeWithError(waveformEffectSequenceLoopCount, "number");
    _console.assertWithError(
      waveformEffectSequenceLoopCount >= 0,
      `waveformEffectSequenceLoopCount must be 0 or greater (got ${waveformEffectSequenceLoopCount})`
    );
    _console.assertWithError(
      waveformEffectSequenceLoopCount <= this.maxWaveformEffectSequenceLoopCount,
      `waveformEffectSequenceLoopCount must be ${this.maxWaveformEffectSequenceLoopCount} or fewer (got ${waveformEffectSequenceLoopCount})`
    );
  }

  static #MaxWaveformSegmentDuration = 2550;
  static get MaxWaveformSegmentDuration() {
    return this.#MaxWaveformSegmentDuration;
  }
  get maxWaveformSegmentDuration() {
    return VibrationManager.MaxWaveformSegmentDuration;
  }
  #verifyWaveformSegment(waveformSegment: VibrationWaveformSegment) {
    _console.assertTypeWithError(waveformSegment.amplitude, "number");
    _console.assertWithError(
      waveformSegment.amplitude >= 0,
      `amplitude must be 0 or greater (got ${waveformSegment.amplitude})`
    );
    _console.assertWithError(
      waveformSegment.amplitude <= 1,
      `amplitude must be 1 or less (got ${waveformSegment.amplitude})`
    );

    _console.assertTypeWithError(waveformSegment.duration, "number");
    _console.assertWithError(
      waveformSegment.duration > 0,
      `duration must be greater than 0ms (got ${waveformSegment.duration}ms)`
    );
    _console.assertWithError(
      waveformSegment.duration <= this.maxWaveformSegmentDuration,
      `duration must be ${this.maxWaveformSegmentDuration}ms or less (got ${waveformSegment.duration}ms)`
    );
  }
  static #MaxNumberOfWaveformSegments = 20;
  static get MaxNumberOfWaveformSegments() {
    return this.#MaxNumberOfWaveformSegments;
  }
  get maxNumberOfWaveformSegments() {
    return VibrationManager.MaxNumberOfWaveformSegments;
  }
  #verifyWaveformSegments(waveformSegments: VibrationWaveformSegment[]) {
    this.#assertNonEmptyArray(waveformSegments);
    _console.assertWithError(
      waveformSegments.length <= this.maxNumberOfWaveformSegments,
      `must have ${this.maxNumberOfWaveformSegments} waveformSegments or fewer (got ${waveformSegments.length})`
    );
    waveformSegments.forEach((waveformSegment) => {
      this.#verifyWaveformSegment(waveformSegment);
    });
  }

  #createWaveformEffectsData(
    locations: VibrationLocation[],
    waveformEffectSegments: VibrationWaveformEffectSegment[],
    waveformEffectSequenceLoopCount: number = 0
  ) {
    this.#verifyWaveformEffectSegments(waveformEffectSegments);
    this.#verifyWaveformEffectSequenceLoopCount(waveformEffectSequenceLoopCount);

    let dataArray = [];
    let byteOffset = 0;

    const hasAtLeast1WaveformEffectWithANonzeroLoopCount = waveformEffectSegments.some((waveformEffectSegment) => {
      const { loopCount } = waveformEffectSegment;
      return loopCount != undefined && loopCount > 0;
    });

    const includeAllWaveformEffectSegments =
      hasAtLeast1WaveformEffectWithANonzeroLoopCount || waveformEffectSequenceLoopCount != 0;

    for (
      let index = 0;
      index < waveformEffectSegments.length ||
      (includeAllWaveformEffectSegments && index < this.maxNumberOfWaveformEffectSegments);
      index++
    ) {
      const waveformEffectSegment = waveformEffectSegments[index] || { effect: "none" };
      if (waveformEffectSegment.effect != undefined) {
        const waveformEffect = waveformEffectSegment.effect;
        dataArray[byteOffset++] = VibrationWaveformEffects.indexOf(waveformEffect);
      } else if (waveformEffectSegment.delay != undefined) {
        const { delay } = waveformEffectSegment;
        dataArray[byteOffset++] = (1 << 7) | Math.floor(delay / 10); // set most significant bit to 1
      } else {
        throw Error("invalid waveformEffectSegment");
      }
    }

    const includeAllWaveformEffectSegmentLoopCounts = waveformEffectSequenceLoopCount != 0;
    for (
      let index = 0;
      index < waveformEffectSegments.length ||
      (includeAllWaveformEffectSegmentLoopCounts && index < this.maxNumberOfWaveformEffectSegments);
      index++
    ) {
      const waveformEffectSegmentLoopCount = waveformEffectSegments[index]?.loopCount || 0;
      if (index == 0 || index == 4) {
        dataArray[byteOffset] = 0;
      }
      const bitOffset = 2 * (index % 4);
      dataArray[byteOffset] |= waveformEffectSegmentLoopCount << bitOffset;
      if (index == 3 || index == 7) {
        byteOffset++;
      }
    }

    if (waveformEffectSequenceLoopCount != 0) {
      dataArray[byteOffset++] = waveformEffectSequenceLoopCount;
    }
    const dataView = new DataView(Uint8Array.from(dataArray).buffer);
    _console.log({ dataArray, dataView });
    return this.#createData(locations, "waveformEffect", dataView);
  }
  #createWaveformData(locations: VibrationLocation[], waveformSegments: VibrationWaveformSegment[]) {
    this.#verifyWaveformSegments(waveformSegments);
    const dataView = new DataView(new ArrayBuffer(waveformSegments.length * 2));
    waveformSegments.forEach((waveformSegment, index) => {
      dataView.setUint8(index * 2, Math.floor(waveformSegment.amplitude * 127));
      dataView.setUint8(index * 2 + 1, Math.floor(waveformSegment.duration / 10));
    });
    _console.log({ dataView });
    return this.#createData(locations, "waveform", dataView);
  }

  #verifyVibrationType(vibrationType: VibrationType) {
    _console.assertTypeWithError(vibrationType, "string");
    _console.assertWithError(VibrationTypes.includes(vibrationType), `invalid vibrationType "${vibrationType}"`);
  }

  #createData(locations: VibrationLocation[], vibrationType: VibrationType, dataView: DataView) {
    _console.assertWithError(dataView?.byteLength > 0, "no data received");
    const locationsBitmask = this.#createLocationsBitmask(locations);
    this.#verifyVibrationType(vibrationType);
    const vibrationTypeIndex = VibrationTypes.indexOf(vibrationType);
    _console.log({ locationsBitmask, vibrationTypeIndex, dataView });
    const data = concatenateArrayBuffers(locationsBitmask, vibrationTypeIndex, dataView.byteLength, dataView);
    _console.log({ data });
    return data;
  }

  async triggerVibration(vibrationConfigurations: VibrationConfiguration[], sendImmediately: boolean = true) {
    let triggerVibrationData!: ArrayBuffer;
    vibrationConfigurations.forEach((vibrationConfiguration) => {
      const { type } = vibrationConfiguration;

      let { locations } = vibrationConfiguration;
      locations = locations || VibrationLocations.slice();

      let arrayBuffer: ArrayBuffer;

      switch (type) {
        case "waveformEffect":
          {
            const { waveformEffect } = vibrationConfiguration;
            if (!waveformEffect) {
              throw Error("waveformEffect not defined in vibrationConfiguration");
            }
            const { segments, loopCount } = waveformEffect;
            arrayBuffer = this.#createWaveformEffectsData(locations, segments, loopCount);
          }
          break;
        case "waveform":
          {
            const { waveform } = vibrationConfiguration;
            if (!waveform) {
              throw Error("waveform not defined in vibrationConfiguration");
            }
            const { segments } = waveform;
            arrayBuffer = this.#createWaveformData(locations, segments);
          }
          break;
        default:
          throw Error(`invalid vibration type "${type}"`);
      }
      _console.log({ type, arrayBuffer });
      triggerVibrationData = concatenateArrayBuffers(triggerVibrationData, arrayBuffer);
    });
    this.sendMessage([{ type: "triggerVibration", data: triggerVibrationData }], sendImmediately);
  }

  sendMessage!: SendMessageCallback<VibrationMessageType>;
}

export default VibrationManager;