import { createConsole } from "../utils/Console.ts";
import {
  VibrationWaveformEffect,
  VibrationWaveformEffects,
} from "./VibrationWaveformEffects.ts";
import { concatenateArrayBuffers } from "../utils/ArrayBufferUtils.ts";
import Device, { SendMessageCallback } from "../Device.ts";
import autoBind from "auto-bind";
import EventDispatcher from "../utils/EventDispatcher.ts";

const _console = createConsole("VibrationManager", { log: false });

export const VibrationLocations = ["front", "rear", "left", "right"] as const;
export type VibrationLocation = (typeof VibrationLocations)[number];

export const VibrationTypes = ["waveformEffect", "waveform"] as const;
export type VibrationType = (typeof VibrationTypes)[number];

export interface VibrationWaveformEffectSegment {
  effect?: VibrationWaveformEffect;
  delay?: number;
  loopCount?: number;
}

export interface VibrationWaveformSegment {
  /** in ms */
  duration: number;
  /** [0, 1] */
  amplitude: number;
}

export const VibrationMessageTypes = [
  "getVibrationLocations",
  "triggerVibration",
] as const;
export type VibrationMessageType = (typeof VibrationMessageTypes)[number];

export const VibrationEventTypes = VibrationMessageTypes;
export type VibrationEventType = (typeof VibrationEventTypes)[number];

export interface VibrationEventMessages {
  getVibrationLocations: { vibrationLocations: VibrationLocation[] };
}

export const MaxNumberOfVibrationWaveformEffectSegments = 8;
export const MaxVibrationWaveformSegmentDuration = 2550;
export const MaxVibrationWaveformEffectSegmentDelay = 1270;
export const MaxVibrationWaveformEffectSegmentLoopCount = 3;
export const MaxNumberOfVibrationWaveformSegments = 20;
export const MaxVibrationWaveformEffectSequenceLoopCount = 6;

interface BaseVibrationConfiguration {
  type: VibrationType;
  locations?: VibrationLocation[];
}

export interface VibrationWaveformEffectConfiguration extends BaseVibrationConfiguration {
  type: "waveformEffect";
  segments: VibrationWaveformEffectSegment[];
  loopCount?: number;
}

export interface VibrationWaveformConfiguration extends BaseVibrationConfiguration {
  type: "waveform";
  segments: VibrationWaveformSegment[];
}

export type VibrationConfiguration =
  | VibrationWaveformEffectConfiguration
  | VibrationWaveformConfiguration;

export type SendVibrationMessageCallback =
  SendMessageCallback<VibrationMessageType>;

export type VibrationEventDispatcher = EventDispatcher<
  Device,
  VibrationEventType,
  VibrationEventMessages
>;

class VibrationManager {
  constructor() {
    autoBind(this);
  }
  sendMessage!: SendVibrationMessageCallback;

  eventDispatcher!: VibrationEventDispatcher;
  get #dispatchEvent() {
    return this.eventDispatcher.dispatchEvent;
  }
  get waitForEvent() {
    return this.eventDispatcher.waitForEvent;
  }

  #verifyLocations(locations: VibrationLocation[]) {
    this.#assertNonEmptyArray(locations);
    locations.forEach((location) => {
      _console.assertEnumWithError(location, VibrationLocations);
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
    _console.assertWithError(
      locationsBitmask > 0,
      `locationsBitmask must not be zero`,
    );
    return locationsBitmask;
  }

  #assertNonEmptyArray(array: any[]) {
    _console.assertWithError(Array.isArray(array), "passed non-array");
    _console.assertWithError(array.length > 0, "passed empty array");
  }

  #verifyWaveformEffect(waveformEffect: VibrationWaveformEffect) {
    _console.assertEnumWithError(waveformEffect, VibrationWaveformEffects);
  }

  #verifyWaveformEffectSegment(
    waveformEffectSegment: VibrationWaveformEffectSegment,
  ) {
    if (waveformEffectSegment.effect != undefined) {
      const waveformEffect = waveformEffectSegment.effect;
      this.#verifyWaveformEffect(waveformEffect);
    } else if (waveformEffectSegment.delay != undefined) {
      const { delay } = waveformEffectSegment;
      _console.assertWithError(
        delay >= 0,
        `delay must be 0ms or greater (got ${delay})`,
      );
      _console.assertWithError(
        delay <= MaxVibrationWaveformEffectSegmentDelay,
        `delay must be ${MaxVibrationWaveformEffectSegmentDelay}ms or less (got ${delay})`,
      );
    } else {
      throw Error("no effect or delay found in waveformEffectSegment");
    }

    if (waveformEffectSegment.loopCount != undefined) {
      const { loopCount } = waveformEffectSegment;
      this.#verifyWaveformEffectSegmentLoopCount(loopCount);
    }
  }

  #verifyWaveformEffectSegmentLoopCount(
    waveformEffectSegmentLoopCount: number,
  ) {
    _console.assertRangeWithError(
      "waveformEffectSegmentLoopCount",
      waveformEffectSegmentLoopCount,
      0,
      MaxVibrationWaveformEffectSegmentLoopCount,
    );
  }

  #verifyWaveformEffectSegments(
    waveformEffectSegments: VibrationWaveformEffectSegment[],
  ) {
    _console.assertRangeWithError(
      "waveformEffectSegments.length",
      waveformEffectSegments.length,
      0,
      MaxNumberOfVibrationWaveformEffectSegments,
    );

    waveformEffectSegments.forEach((waveformEffectSegment) => {
      this.#verifyWaveformEffectSegment(waveformEffectSegment);
    });
  }

  #verifyWaveformEffectSequenceLoopCount(
    waveformEffectSequenceLoopCount: number,
  ) {
    _console.assertRangeWithError(
      "waveformEffectSequenceLoopCount",
      waveformEffectSequenceLoopCount,
      0,
      MaxVibrationWaveformEffectSequenceLoopCount,
    );
  }

  #verifyWaveformSegment(waveformSegment: VibrationWaveformSegment) {
    _console.assertRangeWithError(
      "waveformSegment.amplitude",
      waveformSegment.amplitude,
      0,
      1,
    );
    _console.assertRangeWithError(
      "waveformSegment.duration",
      waveformSegment.duration,
      0,
      MaxVibrationWaveformSegmentDuration,
    );
  }

  #verifyWaveformSegments(waveformSegments: VibrationWaveformSegment[]) {
    _console.assertRangeWithError(
      "waveformSegments.length",
      waveformSegments.length,
      0,
      MaxNumberOfVibrationWaveformSegments,
    );
    waveformSegments.forEach((waveformSegment) => {
      this.#verifyWaveformSegment(waveformSegment);
    });
  }

  #createWaveformEffectsData(
    locations: VibrationLocation[],
    waveformEffectSegments: VibrationWaveformEffectSegment[],
    waveformEffectSequenceLoopCount: number = 0,
  ) {
    this.#verifyWaveformEffectSegments(waveformEffectSegments);
    this.#verifyWaveformEffectSequenceLoopCount(
      waveformEffectSequenceLoopCount,
    );

    let dataArray = [];
    let byteOffset = 0;

    const hasAtLeast1WaveformEffectWithANonzeroLoopCount =
      waveformEffectSegments.some((waveformEffectSegment) => {
        const { loopCount } = waveformEffectSegment;
        return loopCount != undefined && loopCount > 0;
      });

    const includeAllWaveformEffectSegments =
      hasAtLeast1WaveformEffectWithANonzeroLoopCount ||
      waveformEffectSequenceLoopCount != 0;

    for (
      let index = 0;
      index < waveformEffectSegments.length ||
      (includeAllWaveformEffectSegments &&
        index < MaxNumberOfVibrationWaveformEffectSegments);
      index++
    ) {
      const waveformEffectSegment = waveformEffectSegments[index] || {
        effect: "none",
      };
      if (waveformEffectSegment.effect != undefined) {
        const waveformEffect = waveformEffectSegment.effect;
        dataArray[byteOffset++] =
          VibrationWaveformEffects.indexOf(waveformEffect);
      } else if (waveformEffectSegment.delay != undefined) {
        const { delay } = waveformEffectSegment;
        dataArray[byteOffset++] = (1 << 7) | Math.floor(delay / 10); // set most significant bit to 1
      } else {
        throw Error("invalid waveformEffectSegment");
      }
    }

    const includeAllWaveformEffectSegmentLoopCounts =
      waveformEffectSequenceLoopCount != 0;
    for (
      let index = 0;
      index < waveformEffectSegments.length ||
      (includeAllWaveformEffectSegmentLoopCounts &&
        index < MaxNumberOfVibrationWaveformEffectSegments);
      index++
    ) {
      const waveformEffectSegmentLoopCount =
        waveformEffectSegments[index]?.loopCount || 0;
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
  #createWaveformData(
    locations: VibrationLocation[],
    waveformSegments: VibrationWaveformSegment[],
  ) {
    this.#verifyWaveformSegments(waveformSegments);
    const dataView = new DataView(new ArrayBuffer(waveformSegments.length * 2));
    waveformSegments.forEach((waveformSegment, index) => {
      dataView.setUint8(index * 2, Math.floor(waveformSegment.amplitude * 127));
      dataView.setUint8(
        index * 2 + 1,
        Math.floor(waveformSegment.duration / 10),
      );
    });
    _console.log({ dataView });
    return this.#createData(locations, "waveform", dataView);
  }

  #createData(
    locations: VibrationLocation[],
    vibrationType: VibrationType,
    dataView: DataView,
  ) {
    _console.assertWithError(dataView?.byteLength > 0, "no data received");
    const locationsBitmask = this.#createLocationsBitmask(locations);
    _console.assertEnumWithError(vibrationType, VibrationTypes);
    const vibrationTypeIndex = VibrationTypes.indexOf(vibrationType);
    _console.log({ locationsBitmask, vibrationTypeIndex, dataView });
    const data = concatenateArrayBuffers(
      locationsBitmask,
      vibrationTypeIndex,
      dataView.byteLength,
      dataView,
    );
    _console.log({ data });
    return data;
  }

  async triggerVibration(
    vibrationConfiguration: VibrationConfiguration,
    sendImmediately?: boolean,
  ): Promise<void>;
  async triggerVibration(
    vibrationConfigurations: VibrationConfiguration[],
    sendImmediately?: boolean,
  ): Promise<void>;
  async triggerVibration(
    vibrationConfigurations: VibrationConfiguration[] | VibrationConfiguration,
    sendImmediately: boolean = true,
  ) {
    if (!Array.isArray(vibrationConfigurations)) {
      vibrationConfigurations = [vibrationConfigurations];
    }
    if (vibrationConfigurations.length == 0) {
      _console.log("empty vibrationConfigurations");
      return;
    }
    let triggerVibrationData!: ArrayBuffer;
    vibrationConfigurations.forEach((vibrationConfiguration) => {
      const { type } = vibrationConfiguration;

      let { locations } = vibrationConfiguration;
      locations = locations || this.vibrationLocations.slice();
      locations = locations.filter((location) =>
        this.vibrationLocations.includes(location),
      );

      let arrayBuffer: ArrayBuffer;

      switch (type) {
        case "waveformEffect":
          {
            const { segments, loopCount } = vibrationConfiguration;
            if (segments.length == 0) {
              _console.log("no segments");
              return;
            }
            arrayBuffer = this.#createWaveformEffectsData(
              locations,
              segments,
              loopCount,
            );
          }
          break;
        case "waveform":
          {
            const { segments } = vibrationConfiguration;
            if (segments.length == 0) {
              _console.log("no segments");
              return;
            }
            arrayBuffer = this.#createWaveformData(locations, segments);
          }
          break;
        default:
          throw Error(`invalid vibration type "${type}"`);
      }
      _console.log({ type, arrayBuffer });
      if (arrayBuffer.byteLength == 0) {
        _console.log("empty arrayBuffer");
        return;
      }
      triggerVibrationData = concatenateArrayBuffers(
        triggerVibrationData,
        arrayBuffer,
      );
    });
    if (!triggerVibrationData) {
      _console.log("no triggerVibrationData");
      return;
    }
    if (triggerVibrationData.byteLength == 0) {
      _console.log("empty triggerVibrationData");
      return;
    }
    await this.sendMessage(
      [{ type: "triggerVibration", data: triggerVibrationData }],
      sendImmediately,
    );
  }

  #vibrationLocations: VibrationLocation[] = [];
  get vibrationLocations() {
    return this.#vibrationLocations;
  }
  #onVibrationLocations(vibrationLocations: VibrationLocation[]) {
    this.#vibrationLocations = vibrationLocations;
    _console.log("vibrationLocations", vibrationLocations);
    this.#dispatchEvent("getVibrationLocations", {
      vibrationLocations: this.#vibrationLocations,
    });
  }
  #parseVibrationLocations(dataView: DataView<ArrayBuffer>) {
    _console.log("parseVibrationLocations", dataView);
    const vibrationLocations = Array.from(new Uint8Array(dataView.buffer))
      .map((index) => VibrationLocations[index])
      .filter(Boolean);
    this.#onVibrationLocations(vibrationLocations);
  }

  // MESSAGE
  parseMessage(
    messageType: VibrationMessageType,
    dataView: DataView<ArrayBuffer>,
    isSending?: boolean,
  ) {
    _console.log({ messageType, isSending }, dataView);

    switch (messageType) {
      case "getVibrationLocations":
        this.#parseVibrationLocations(dataView);
        break;
      default:
        throw Error(`uncaught messageType ${messageType}`);
    }
  }
}

export default VibrationManager;
