import { createConsole } from "../utils/Console.ts";
import {
  VibrationWaveformEffect,
  VibrationWaveformEffects,
} from "./VibrationWaveformEffects.ts";
import { concatenateArrayBuffers } from "../utils/ArrayBufferUtils.ts";
import Device, { SendMessagesCallback } from "../Device.ts";
import autoBind from "auto-bind";
import EventDispatcher from "../utils/EventDispatcher.ts";
import { getSetBitIndices } from "../utils/MathUtils.ts";

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

export type SendVibrationMessagesCallback =
  SendMessagesCallback<VibrationMessageType>;

export type VibrationEventDispatcher = EventDispatcher<
  Device,
  VibrationEventType,
  VibrationEventMessages
>;

function assertNonEmptyArray(array: any[]) {
  _console.assertWithError(Array.isArray(array), "passed non-array");
  _console.assertWithError(array.length > 0, "passed empty array");
}

function verifyLocations(locations: VibrationLocation[]) {
  assertNonEmptyArray(locations);
  locations.forEach((location) => {
    _console.assertEnumWithError(VibrationLocations, location);
  });
}

function verifyWaveformEffect(waveformEffect: VibrationWaveformEffect) {
  _console.assertEnumWithError(VibrationWaveformEffects, waveformEffect);
}

function serializeVibrationLocations(locations: VibrationLocation[]) {
  verifyLocations(locations);

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

function verifyWaveformEffectSegmentLoopCount(
  waveformEffectSegmentLoopCount: number,
) {
  _console.assertRangeWithError(
    "waveformEffectSegmentLoopCount",
    waveformEffectSegmentLoopCount,
    0,
    MaxVibrationWaveformEffectSegmentLoopCount,
  );
}

function verifyWaveformEffectSegment(
  waveformEffectSegment: VibrationWaveformEffectSegment,
) {
  if (waveformEffectSegment.effect != undefined) {
    const waveformEffect = waveformEffectSegment.effect;
    verifyWaveformEffect(waveformEffect);
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
    verifyWaveformEffectSegmentLoopCount(loopCount);
  }
}

function verifyWaveformEffectSegments(
  waveformEffectSegments: VibrationWaveformEffectSegment[],
) {
  _console.assertRangeWithError(
    "waveformEffectSegments.length",
    waveformEffectSegments.length,
    0,
    MaxNumberOfVibrationWaveformEffectSegments,
  );

  waveformEffectSegments.forEach((waveformEffectSegment) => {
    verifyWaveformEffectSegment(waveformEffectSegment);
  });
}

function verifyWaveformEffectSequenceLoopCount(
  waveformEffectSequenceLoopCount: number,
) {
  _console.assertRangeWithError(
    "waveformEffectSequenceLoopCount",
    waveformEffectSequenceLoopCount,
    0,
    MaxVibrationWaveformEffectSequenceLoopCount,
  );
}

function verifyWaveformSegments(waveformSegments: VibrationWaveformSegment[]) {
  _console.assertRangeWithError(
    "waveformSegments.length",
    waveformSegments.length,
    0,
    MaxNumberOfVibrationWaveformSegments,
  );
  waveformSegments.forEach((waveformSegment) => {
    verifyWaveformSegment(waveformSegment);
  });
}

function verifyWaveformSegment(waveformSegment: VibrationWaveformSegment) {
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

function serializeVibration(
  locations: VibrationLocation[],
  vibrationType: VibrationType,
  dataView: DataView,
) {
  _console.assertWithError(dataView?.byteLength > 0, "no data received");
  const locationsBitmask = serializeVibrationLocations(locations);
  _console.assertEnumWithError(VibrationTypes, vibrationType);
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

function serializeVibrationWaveformSegments(
  locations: VibrationLocation[],
  waveformSegments: VibrationWaveformSegment[],
) {
  verifyWaveformSegments(waveformSegments);
  const dataView = new DataView(new ArrayBuffer(waveformSegments.length * 2));
  waveformSegments.forEach((waveformSegment, index) => {
    dataView.setUint8(index * 2, Math.floor(waveformSegment.amplitude * 127));
    dataView.setUint8(index * 2 + 1, Math.floor(waveformSegment.duration / 10));
  });
  _console.log({ dataView });
  return serializeVibration(locations, "waveform", dataView);
}

function serializeVibrationWaveformEffectSegments(
  locations: VibrationLocation[],
  waveformEffectSegments: VibrationWaveformEffectSegment[],
  waveformEffectSequenceLoopCount: number = 0,
) {
  verifyWaveformEffectSegments(waveformEffectSegments);
  verifyWaveformEffectSequenceLoopCount(waveformEffectSequenceLoopCount);

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
    // _console.log({ bitOffset, index, waveformEffectSegmentLoopCount });
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
  return serializeVibration(locations, "waveformEffect", dataView);
}

export function serializeVibrationConfigurations(
  vibrationConfigurations: VibrationConfiguration[],
  allLocations: readonly VibrationLocation[] = VibrationLocations,
) {
  let triggerVibrationData!: ArrayBuffer;
  vibrationConfigurations.forEach((vibrationConfiguration) => {
    const { type } = vibrationConfiguration;

    let { locations } = vibrationConfiguration;
    locations = locations || allLocations.slice();
    locations = locations.filter((location) => allLocations.includes(location));

    let arrayBuffer: ArrayBuffer;

    switch (type) {
      case "waveformEffect":
        {
          const { segments, loopCount } = vibrationConfiguration;
          if (segments.length == 0) {
            _console.log("no segments");
            return;
          }
          arrayBuffer = serializeVibrationWaveformEffectSegments(
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
          arrayBuffer = serializeVibrationWaveformSegments(locations, segments);
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
  return triggerVibrationData ?? new ArrayBuffer(0);
}

function parseVibrationWaveformSegments(dataView: DataView<ArrayBuffer>) {
  _console.log("parseVibrationWaveformSegments", dataView);
  const parsedVibrationWaveformSegments: VibrationWaveformSegment[] = [];

  let offset = 0;
  while (offset < dataView.byteLength) {
    const amplitude = dataView.getUint8(offset) / 127;
    const duration = dataView.getUint8(offset + 1) * 10;
    const parsedVibrationWaveformSegment: VibrationWaveformSegment = {
      amplitude,
      duration,
    };
    _console.log(
      "parsedVibrationWaveformSegment",
      parsedVibrationWaveformSegment,
    );
    parsedVibrationWaveformSegments.push(parsedVibrationWaveformSegment);
    offset += 2;
  }

  _console.log(
    "parsedVibrationWaveformSegments",
    parsedVibrationWaveformSegments,
  );
  return parsedVibrationWaveformSegments;
}
function parseVibrationWaveformEffectSegments(dataView: DataView<ArrayBuffer>) {
  _console.log("parseVibrationWaveformSegments", dataView);
  const parsedVibrationWaveformEffectSegments: VibrationWaveformEffectSegment[] =
    [];

  let offset = 0;
  for (
    let index = 0;
    index < MaxNumberOfVibrationWaveformEffectSegments;
    index++
  ) {
    if (offset < dataView.byteLength) {
      const rawValue = dataView.getUint8(offset++);
      const isDelay = rawValue & (1 << 7);
      let effect: VibrationWaveformEffect | undefined;
      let delay: number | undefined;
      if (isDelay) {
        delay = rawValue * 10;
      } else {
        effect = VibrationWaveformEffects[rawValue];
        _console.assertEnumWithError(VibrationWaveformEffects, effect);
      }
      _console.log({ rawValue, isDelay, effect, delay });

      const parsedVibrationWaveformEffectSegment: VibrationWaveformEffectSegment =
        {
          effect,
          delay,
        };
      _console.log(
        "parsedVibrationWaveformEffectSegments",
        parsedVibrationWaveformEffectSegments,
      );
      parsedVibrationWaveformEffectSegments.push(
        parsedVibrationWaveformEffectSegment,
      );
    }
  }

  for (let index = 0; index < 2; index++) {
    if (offset < dataView.byteLength) {
      const rawValue = dataView.getUint8(offset++);
      const segmentIndexOffset = index == 0 ? 0 : 4;

      for (let baseSegmentIndex = 0; baseSegmentIndex < 4; baseSegmentIndex++) {
        const segmentIndex = segmentIndexOffset + baseSegmentIndex;
        const loopCount = (rawValue >> (baseSegmentIndex * 2)) & 0b11;
        parsedVibrationWaveformEffectSegments[segmentIndex].loopCount =
          loopCount;
      }
    }
  }

  _console.log(
    "parsedVibrationWaveformEffectSegments",
    parsedVibrationWaveformEffectSegments,
  );
  return parsedVibrationWaveformEffectSegments;
}
function parseVibrationConfiguration(
  dataView: DataView<ArrayBuffer>,
  vibrationType: VibrationType,
) {
  _console.log("parseVibrationConfiguration", dataView, { vibrationType });
  let parsedVibrationConfiguration: VibrationConfiguration;

  switch (vibrationType) {
    case "waveformEffect":
      parsedVibrationConfiguration = {
        type: "waveformEffect",
        segments: parseVibrationWaveformEffectSegments(dataView),
      };
      if (
        dataView.byteLength ==
        MaxNumberOfVibrationWaveformEffectSegments + 3
      ) {
        parsedVibrationConfiguration.loopCount = dataView.getUint8(
          dataView.byteLength - 1,
        );
      }
      break;
    case "waveform":
      parsedVibrationConfiguration = {
        type: "waveform",
        segments: parseVibrationWaveformSegments(dataView),
      };
      break;
  }

  _console.log("parsedVibrationConfiguration", parsedVibrationConfiguration);
  return parsedVibrationConfiguration;
}
export function parseVibrationConfigurations(dataView: DataView<ArrayBuffer>) {
  _console.log("parseVibrationConfigurations", dataView);

  const parsedVibrationConfigurations: VibrationConfiguration[] = [];

  // ...[locationBitmask, vibrationType, payload, [payload]]

  let offset = 0;
  while (offset < dataView.byteLength) {
    const locationBitmask = dataView.getUint8(offset++);
    const locations = parseVibrationLocationBitmask(locationBitmask);

    const vibrationTypeEnum = dataView.getUint8(offset++);
    const vibrationType = VibrationTypes[vibrationTypeEnum];

    const payload = dataView.getUint8(offset++);
    const finalOffset = offset + payload;

    _console.log({
      locationBitmask,
      locations,
      vibrationTypeEnum,
      vibrationType,
      payload,
      finalOffset,
    });
    _console.assertEnumWithError(VibrationTypes, vibrationType);
    _console.assertWithError(
      finalOffset <= dataView.byteLength,
      `finalOffset ${finalOffset} too large (max ${dataView.byteLength})`,
    );

    const parsedVibrationConfiguration = parseVibrationConfiguration(
      new DataView(dataView.buffer.slice(offset, offset + payload)),
      vibrationType,
    );
    parsedVibrationConfiguration.locations = locations;
    parsedVibrationConfigurations.push(parsedVibrationConfiguration);

    offset += payload;
  }
  _console.log("parsedVibrationConfigurations", parsedVibrationConfigurations);
  return parsedVibrationConfigurations;
}

function parseVibrationLocations(dataView: DataView<ArrayBuffer>) {
  _console.log("parseVibrationLocations", dataView);
  const vibrationLocations = Array.from(new Uint8Array(dataView.buffer))
    .map((index) => VibrationLocations[index])
    .filter(Boolean);
  return vibrationLocations;
}
function parseVibrationLocationBitmask(bitmask: number) {
  _console.log("parseVibrationLocationBitmask", { bitmask });
  const bitIndices = getSetBitIndices(bitmask);
  const parsedVibrationLocations = bitIndices.map(
    (bitIndex) => VibrationLocations[bitIndex],
  );
  parsedVibrationLocations.forEach((location) =>
    _console.assertEnumWithError(VibrationLocations, location),
  );
  _console.log({ bitIndices, parsedVibrationLocations });
  return parsedVibrationLocations;
}

class VibrationManager {
  constructor() {
    autoBind(this);
  }
  sendMessages!: SendVibrationMessagesCallback;

  eventDispatcher!: VibrationEventDispatcher;
  get #dispatchEvent() {
    return this.eventDispatcher.dispatchEvent;
  }
  get waitForEvent() {
    return this.eventDispatcher.waitForEvent;
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
    if (this.vibrationLocations.length == 0) {
      _console.log("device doesn't have any vibrationLocations");
      return;
    }
    if (vibrationConfigurations.length == 0) {
      _console.log("empty vibrationConfigurations");
      return;
    }
    const triggerVibrationData = serializeVibrationConfigurations(
      vibrationConfigurations,
      this.vibrationLocations,
    );
    if (!triggerVibrationData) {
      _console.log("no triggerVibrationData");
      return;
    }
    if (triggerVibrationData.byteLength == 0) {
      _console.log("empty triggerVibrationData");
      return;
    }
    await this.sendMessages(
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
    const vibrationLocations = parseVibrationLocations(dataView);
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
      case "triggerVibration":
        break;
      default:
        throw Error(`uncaught messageType ${messageType}`);
    }
  }
}

export default VibrationManager;
