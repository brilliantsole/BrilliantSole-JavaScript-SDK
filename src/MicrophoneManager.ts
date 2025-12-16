import Device, { SendMessageCallback } from "./Device.ts";
import { createConsole } from "./utils/Console.ts";
import EventDispatcher from "./utils/EventDispatcher.ts";
import autoBind from "auto-bind";
import {
  concatenateArrayBuffers,
  UInt8ByteBuffer,
} from "./utils/ArrayBufferUtils.ts";
import { float32ArrayToWav } from "./utils/AudioUtils.ts";

import * as _alawmulaw from "alawmulaw";
const alawmulaw = (_alawmulaw as any).default ?? _alawmulaw;
const { mulaw } = alawmulaw;

const _console = createConsole("MicrophoneManager", { log: false });

export const MicrophoneSensorTypes = ["microphone"] as const;
export type MicrophoneSensorType = (typeof MicrophoneSensorTypes)[number];

export const MicrophoneCommands = ["start", "stop", "vad"] as const;
export type MicrophoneCommand = (typeof MicrophoneCommands)[number];

export const MicrophoneStatuses = ["idle", "streaming", "vad"] as const;
export type MicrophoneStatus = (typeof MicrophoneStatuses)[number];

export const MicrophoneConfigurationTypes = ["sampleRate", "bitDepth"] as const;
export type MicrophoneConfigurationType =
  (typeof MicrophoneConfigurationTypes)[number];

export const MicrophoneSampleRates = ["8000", "16000"] as const;
export type MicrophoneSampleRate = (typeof MicrophoneSampleRates)[number];

export const MicrophoneBitDepths = ["8", "16"] as const;
export type MicrophoneBitDepth = (typeof MicrophoneBitDepths)[number];

export const MicrophoneMessageTypes = [
  "microphoneStatus",
  "microphoneCommand",
  "getMicrophoneConfiguration",
  "setMicrophoneConfiguration",
  "microphoneData",
] as const;
export type MicrophoneMessageType = (typeof MicrophoneMessageTypes)[number];

export type MicrophoneConfiguration = {
  sampleRate?: MicrophoneSampleRate;
  bitDepth?: MicrophoneBitDepth;
};

export const MicrophoneConfigurationValues = {
  sampleRate: MicrophoneSampleRates,
  bitDepth: MicrophoneBitDepths,
};

export const RequiredMicrophoneMessageTypes: MicrophoneMessageType[] = [
  "getMicrophoneConfiguration",
  "microphoneStatus",
] as const;

export const MicrophoneEventTypes = [
  ...MicrophoneMessageTypes,
  "isRecordingMicrophone",
  "microphoneRecording",
] as const;
export type MicrophoneEventType = (typeof MicrophoneEventTypes)[number];

export interface MicrophoneEventMessages {
  microphoneStatus: {
    microphoneStatus: MicrophoneStatus;
    previousMicrophoneStatus: MicrophoneStatus;
  };
  getMicrophoneConfiguration: {
    microphoneConfiguration: MicrophoneConfiguration;
  };
  microphoneData: {
    samples: Float32Array;
    sampleRate: MicrophoneSampleRate;
    bitDepth: MicrophoneBitDepth;
  };
  isRecordingMicrophone: {
    isRecordingMicrophone: boolean;
  };
  microphoneRecording: {
    samples: Float32Array;
    sampleRate: MicrophoneSampleRate;
    bitDepth: MicrophoneBitDepth;
    blob: Blob;
    url: string;
  };
}

export type MicrophoneEventDispatcher = EventDispatcher<
  Device,
  MicrophoneEventType,
  MicrophoneEventMessages
>;
export type SendMicrophoneMessageCallback =
  SendMessageCallback<MicrophoneMessageType>;

class MicrophoneManager {
  constructor() {
    autoBind(this);
  }

  sendMessage!: SendMicrophoneMessageCallback;

  eventDispatcher!: MicrophoneEventDispatcher;
  get #dispatchEvent() {
    return this.eventDispatcher.dispatchEvent;
  }
  get waitForEvent() {
    return this.eventDispatcher.waitForEvent;
  }

  requestRequiredInformation() {
    _console.log("requesting required microphone information");
    const messages = RequiredMicrophoneMessageTypes.map((messageType) => ({
      type: messageType,
    }));
    this.sendMessage(messages, false);
  }

  // MICROPHONE STATUS
  #microphoneStatus!: MicrophoneStatus;
  get microphoneStatus() {
    return this.#microphoneStatus;
  }
  #parseMicrophoneStatus(dataView: DataView<ArrayBuffer>) {
    const microphoneStatusIndex = dataView.getUint8(0);
    const newMicrophoneStatus = MicrophoneStatuses[microphoneStatusIndex];
    this.#updateMicrophoneStatus(newMicrophoneStatus);
  }
  #updateMicrophoneStatus(newMicrophoneStatus: MicrophoneStatus) {
    _console.assertEnumWithError(newMicrophoneStatus, MicrophoneStatuses);
    if (newMicrophoneStatus == this.#microphoneStatus) {
      _console.log(`redundant microphoneStatus ${newMicrophoneStatus}`);
      return;
    }
    const previousMicrophoneStatus = this.#microphoneStatus;
    this.#microphoneStatus = newMicrophoneStatus;
    _console.log(`updated microphoneStatus to "${this.microphoneStatus}"`);
    this.#dispatchEvent("microphoneStatus", {
      microphoneStatus: this.microphoneStatus,
      previousMicrophoneStatus,
    });
  }

  // MICROPHONE COMMAND
  async #sendMicrophoneCommand(
    command: MicrophoneCommand,
    sendImmediately?: boolean
  ) {
    _console.assertEnumWithError(command, MicrophoneCommands);
    _console.log(`sending microphone command "${command}"`);

    const promise = this.waitForEvent("microphoneStatus");
    _console.log(`setting command "${command}"`);
    const commandEnum = MicrophoneCommands.indexOf(command);

    this.sendMessage(
      [
        {
          type: "microphoneCommand",
          data: UInt8ByteBuffer(commandEnum),
        },
      ],
      sendImmediately
    );

    await promise;
  }
  #assertIsIdle() {
    _console.assertWithError(
      this.#microphoneStatus == "idle",
      `microphone is not idle - currently ${this.#microphoneStatus}`
    );
  }
  #assertIsNotIdle() {
    _console.assertWithError(
      this.#microphoneStatus != "idle",
      `microphone is idle`
    );
  }
  #assertIsStreaming() {
    _console.assertWithError(
      this.#microphoneStatus == "streaming",
      `microphone is not recording - currently ${this.#microphoneStatus}`
    );
  }

  async start() {
    await this.#sendMicrophoneCommand("start");
  }
  async stop() {
    if (this.microphoneStatus == "idle") {
      _console.log("microphone is already idle");
      return;
    }
    await this.#sendMicrophoneCommand("stop");
  }
  async vad() {
    await this.#sendMicrophoneCommand("vad");
  }
  async toggle() {
    switch (this.microphoneStatus) {
      case "idle":
        this.start();
        break;
      case "streaming":
        this.stop();
        break;
    }
  }

  // MICROPHONE DATA
  #assertValidBitDepth() {
    _console.assertEnumWithError(this.bitDepth!, MicrophoneBitDepths);
  }
  #fadeDuration = 0.01;
  #playbackTime = 0;
  #parseMicrophoneData(dataView: DataView<ArrayBuffer>) {
    this.#assertValidBitDepth();

    _console.log("parsing microphone data", dataView);

    const numberOfSamples = dataView.byteLength / this.#bytesPerSample!;
    const samples = new Float32Array(numberOfSamples);

    for (let i = 0; i < numberOfSamples; i++) {
      let sample;
      switch (this.bitDepth) {
        case "16":
          sample = dataView.getInt16(i * 2, true);
          samples[i] = sample / 2 ** 15; // Normalize to [-1, 1]
          break;
        case "8":
          if (true) {
            // mu-law compression
            sample = dataView.getUint8(i);
            sample = mulaw.decodeSample(sample);
            sample = sample / 2 ** 15; // Normalize to [-1, 1]
          } else {
            sample = dataView.getInt8(i);
            sample = sample / 2 ** 7; // Normalize to [-1, 1]
          }
          samples[i] = sample;
          break;
      }
    }

    _console.log("samples", samples);

    if (this.#isRecording && this.#microphoneRecordingData) {
      this.#microphoneRecordingData!.push(samples);
    }

    if (this.#audioContext) {
      if (this.#gainNode) {
        const audioBuffer = this.#audioContext.createBuffer(
          1,
          samples.length,
          Number(this.sampleRate!)
        );
        audioBuffer.getChannelData(0).set(samples);

        const bufferSource = this.#audioContext.createBufferSource();
        bufferSource.buffer = audioBuffer;

        const channelData = audioBuffer.getChannelData(0);
        const sampleRate = Number(this.sampleRate!);

        for (let i = 0; i < this.#fadeDuration * sampleRate; i++) {
          channelData[i] *= i / (this.#fadeDuration * sampleRate);
        }

        for (
          let i = channelData.length - 1;
          i >= channelData.length - this.#fadeDuration * sampleRate;
          i--
        ) {
          channelData[i] *=
            (channelData.length - i) / (this.#fadeDuration * sampleRate);
        }

        bufferSource.connect(this.#gainNode!);

        if (this.#playbackTime < this.#audioContext.currentTime) {
          this.#playbackTime = this.#audioContext.currentTime;
        }
        bufferSource.start(this.#playbackTime);
        this.#playbackTime += audioBuffer.duration;
      }
    }

    this.#dispatchEvent("microphoneData", {
      samples,
      sampleRate: this.sampleRate!,
      bitDepth: this.bitDepth!,
    });
  }
  get #bytesPerSample() {
    switch (this.bitDepth) {
      case "8":
        return 1;
      case "16":
        return 2;
    }
  }

  // CONFIG
  #microphoneConfiguration: MicrophoneConfiguration = {};
  get microphoneConfiguration() {
    return this.#microphoneConfiguration;
  }
  #availableMicrophoneConfigurationTypes!: MicrophoneConfigurationType[];
  get availableMicrophoneConfigurationTypes() {
    return this.#availableMicrophoneConfigurationTypes;
  }

  get bitDepth() {
    return this.#microphoneConfiguration.bitDepth;
  }
  get sampleRate() {
    return this.#microphoneConfiguration.sampleRate;
  }

  #parseMicrophoneConfiguration(dataView: DataView<ArrayBuffer>) {
    const parsedMicrophoneConfiguration: MicrophoneConfiguration = {};

    let byteOffset = 0;
    while (byteOffset < dataView.byteLength) {
      const microphoneConfigurationTypeIndex = dataView.getUint8(byteOffset++);
      const microphoneConfigurationType =
        MicrophoneConfigurationTypes[microphoneConfigurationTypeIndex];
      _console.assertWithError(
        microphoneConfigurationType,
        `invalid microphoneConfigurationTypeIndex ${microphoneConfigurationTypeIndex}`
      );
      let rawValue = dataView.getUint8(byteOffset++);
      const values = MicrophoneConfigurationValues[microphoneConfigurationType];
      const value = values[rawValue];
      _console.assertEnumWithError(value, values);
      _console.log({ microphoneConfigurationType, value });
      // @ts-expect-error
      parsedMicrophoneConfiguration[microphoneConfigurationType] = value;
    }

    _console.log({ parsedMicrophoneConfiguration });
    this.#availableMicrophoneConfigurationTypes = Object.keys(
      parsedMicrophoneConfiguration
    ) as MicrophoneConfigurationType[];
    this.#microphoneConfiguration = parsedMicrophoneConfiguration;
    this.#dispatchEvent("getMicrophoneConfiguration", {
      microphoneConfiguration: this.#microphoneConfiguration,
    });
  }

  #isMicrophoneConfigurationRedundant(
    microphoneConfiguration: MicrophoneConfiguration
  ) {
    let microphoneConfigurationTypes = Object.keys(
      microphoneConfiguration
    ) as MicrophoneConfigurationType[];
    return microphoneConfigurationTypes.every((microphoneConfigurationType) => {
      return (
        this.microphoneConfiguration[microphoneConfigurationType] ==
        microphoneConfiguration[microphoneConfigurationType]
      );
    });
  }
  async setMicrophoneConfiguration(
    newMicrophoneConfiguration: MicrophoneConfiguration
  ) {
    _console.log({ newMicrophoneConfiguration });
    if (this.#isMicrophoneConfigurationRedundant(newMicrophoneConfiguration)) {
      _console.log("redundant microphone configuration");
      return;
    }
    const setMicrophoneConfigurationData = this.#createData(
      newMicrophoneConfiguration
    );
    _console.log({ setMicrophoneConfigurationData });

    const promise = this.waitForEvent("getMicrophoneConfiguration");
    this.sendMessage([
      {
        type: "setMicrophoneConfiguration",
        data: setMicrophoneConfigurationData.buffer,
      },
    ]);
    await promise;
  }

  #assertAvailableMicrophoneConfigurationType(
    microphoneConfigurationType: MicrophoneConfigurationType
  ) {
    _console.assertWithError(
      this.#availableMicrophoneConfigurationTypes,
      "must get initial microphoneConfiguration"
    );
    const isMicrophoneConfigurationTypeAvailable =
      this.#availableMicrophoneConfigurationTypes?.includes(
        microphoneConfigurationType
      );
    _console.assertWithError(
      isMicrophoneConfigurationTypeAvailable,
      `unavailable microphone configuration type "${microphoneConfigurationType}"`
    );
    return isMicrophoneConfigurationTypeAvailable;
  }

  static AssertValidMicrophoneConfigurationType(
    microphoneConfigurationType: MicrophoneConfigurationType
  ) {
    _console.assertEnumWithError(
      microphoneConfigurationType,
      MicrophoneConfigurationTypes
    );
  }
  static AssertValidMicrophoneConfigurationTypeEnum(
    microphoneConfigurationTypeEnum: number
  ) {
    _console.assertTypeWithError(microphoneConfigurationTypeEnum, "number");
    _console.assertWithError(
      microphoneConfigurationTypeEnum in MicrophoneConfigurationTypes,
      `invalid microphoneConfigurationTypeEnum ${microphoneConfigurationTypeEnum}`
    );
  }

  #createData(microphoneConfiguration: MicrophoneConfiguration) {
    let microphoneConfigurationTypes = Object.keys(
      microphoneConfiguration
    ) as MicrophoneConfigurationType[];
    microphoneConfigurationTypes = microphoneConfigurationTypes.filter(
      (microphoneConfigurationType) =>
        this.#assertAvailableMicrophoneConfigurationType(
          microphoneConfigurationType
        )
    );

    const dataView = new DataView(
      new ArrayBuffer(microphoneConfigurationTypes.length * 2)
    );
    microphoneConfigurationTypes.forEach(
      (microphoneConfigurationType, index) => {
        MicrophoneManager.AssertValidMicrophoneConfigurationType(
          microphoneConfigurationType
        );
        const microphoneConfigurationTypeEnum =
          MicrophoneConfigurationTypes.indexOf(microphoneConfigurationType);
        dataView.setUint8(index * 2, microphoneConfigurationTypeEnum);

        let value = microphoneConfiguration[microphoneConfigurationType]!;
        if (typeof value == "number") {
          // @ts-ignore
          value = value.toString();
        }
        const values =
          MicrophoneConfigurationValues[microphoneConfigurationType];
        _console.assertEnumWithError(value, values);
        // @ts-expect-error
        const rawValue = values.indexOf(value);
        dataView.setUint8(index * 2 + 1, rawValue);
      }
    );
    _console.log({ sensorConfigurationData: dataView });
    return dataView;
  }

  // MESSAGE
  parseMessage(
    messageType: MicrophoneMessageType,
    dataView: DataView<ArrayBuffer>
  ) {
    _console.log({ messageType, dataView });

    switch (messageType) {
      case "microphoneStatus":
        this.#parseMicrophoneStatus(dataView);
        break;
      case "getMicrophoneConfiguration":
      case "setMicrophoneConfiguration":
        this.#parseMicrophoneConfiguration(dataView);
        break;
      case "microphoneData":
        this.#parseMicrophoneData(dataView);
        break;
      default:
        throw Error(`uncaught messageType ${messageType}`);
    }
  }

  #audioContext?: AudioContext;
  get audioContext() {
    return this.#audioContext;
  }
  set audioContext(newAudioContext) {
    if (this.#audioContext == newAudioContext) {
      _console.log("redundant audioContext assignment", this.#audioContext);
      return;
    }

    this.#audioContext = newAudioContext;

    _console.log("assigned new audioContext", this.#audioContext);
    if (this.#audioContext) {
      this.#playbackTime = this.#audioContext.currentTime;
    } else {
      if (this.#mediaStreamDestination) {
        this.#mediaStreamDestination.disconnect();
        this.#mediaStreamDestination = undefined;
      }
      if (this.#gainNode) {
        this.#gainNode.disconnect();
        this.#gainNode = undefined;
      }
    }
  }

  #gainNode?: GainNode;
  get gainNode() {
    _console.assertWithError(
      this.#audioContext,
      "audioContext assignment required for gainNode"
    );
    if (!this.#gainNode) {
      _console.log("creating gainNode...");
      this.#gainNode = this.#audioContext!.createGain();
      _console.log("created gainNode", this.#gainNode);
    }
    return this.#gainNode;
  }

  #mediaStreamDestination?: MediaStreamAudioDestinationNode;
  get mediaStreamDestination() {
    _console.assertWithError(
      this.#audioContext,
      "audioContext assignment required for mediaStreamDestination"
    );
    if (!this.#mediaStreamDestination) {
      _console.log("creating mediaStreamDestination...");
      this.#mediaStreamDestination =
        this.#audioContext!.createMediaStreamDestination();
      this.gainNode?.connect(this.#mediaStreamDestination);
      _console.log(
        "created mediaStreamDestination",
        this.#mediaStreamDestination
      );
    }
    return this.#mediaStreamDestination;
  }

  #isRecording = false;
  get isRecording() {
    return this.#isRecording;
  }
  #microphoneRecordingData?: Float32Array[];
  startRecording() {
    if (this.isRecording) {
      _console.log("already recording");
      return;
    }
    this.#microphoneRecordingData = [];
    this.#isRecording = true;
    this.#dispatchEvent("isRecordingMicrophone", {
      isRecordingMicrophone: this.isRecording,
    });
  }
  stopRecording() {
    if (!this.isRecording) {
      _console.log("already not recording");
      return;
    }
    this.#isRecording = false;
    if (
      this.#microphoneRecordingData &&
      this.#microphoneRecordingData.length > 0
    ) {
      _console.log(
        "parsing microphone data...",
        this.#microphoneRecordingData.length
      );
      const arrayBuffer = concatenateArrayBuffers(
        ...this.#microphoneRecordingData
      );
      const samples = new Float32Array(arrayBuffer);

      const blob = float32ArrayToWav(samples, Number(this.sampleRate)!, 1);
      const url = URL.createObjectURL(blob);
      this.#dispatchEvent("microphoneRecording", {
        samples,
        sampleRate: this.sampleRate!,
        bitDepth: this.bitDepth!,
        blob,
        url,
      });
    }
    this.#microphoneRecordingData = undefined;
    this.#dispatchEvent("isRecordingMicrophone", {
      isRecordingMicrophone: this.isRecording,
    });
  }
  toggleRecording() {
    if (this.#isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  clear() {
    // @ts-ignore
    this.#microphoneStatus = undefined;
    this.#microphoneConfiguration = {};
    if (this.isRecording) {
      this.stopRecording();
    }
  }
}

export default MicrophoneManager;
