import Device, { SendMessageCallback } from "./Device.ts";
import EventDispatcher from "./utils/EventDispatcher.ts";
export declare const MicrophoneSensorTypes: readonly ["microphone"];
export type MicrophoneSensorType = (typeof MicrophoneSensorTypes)[number];
export declare const MicrophoneCommands: readonly ["start", "stop", "vad"];
export type MicrophoneCommand = (typeof MicrophoneCommands)[number];
export declare const MicrophoneStatuses: readonly ["idle", "streaming", "vad"];
export type MicrophoneStatus = (typeof MicrophoneStatuses)[number];
export declare const MicrophoneConfigurationTypes: readonly ["sampleRate", "bitDepth"];
export type MicrophoneConfigurationType = (typeof MicrophoneConfigurationTypes)[number];
export declare const MicrophoneSampleRates: readonly ["8000", "16000"];
export type MicrophoneSampleRate = (typeof MicrophoneSampleRates)[number];
export declare const MicrophoneBitDepths: readonly ["8", "16"];
export type MicrophoneBitDepth = (typeof MicrophoneBitDepths)[number];
export declare const MicrophoneMessageTypes: readonly ["microphoneStatus", "microphoneCommand", "getMicrophoneConfiguration", "setMicrophoneConfiguration", "microphoneData"];
export type MicrophoneMessageType = (typeof MicrophoneMessageTypes)[number];
export type MicrophoneConfiguration = {
    sampleRate?: MicrophoneSampleRate;
    bitDepth?: MicrophoneBitDepth;
};
export declare const MicrophoneConfigurationValues: {
    sampleRate: readonly ["8000", "16000"];
    bitDepth: readonly ["8", "16"];
};
export declare const RequiredMicrophoneMessageTypes: MicrophoneMessageType[];
export declare const MicrophoneEventTypes: readonly ["microphoneStatus", "microphoneCommand", "getMicrophoneConfiguration", "setMicrophoneConfiguration", "microphoneData", "isRecordingMicrophone", "microphoneRecording"];
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
export type MicrophoneEventDispatcher = EventDispatcher<Device, MicrophoneEventType, MicrophoneEventMessages>;
export type SendMicrophoneMessageCallback = SendMessageCallback<MicrophoneMessageType>;
declare class MicrophoneManager {
    #private;
    constructor();
    sendMessage: SendMicrophoneMessageCallback;
    eventDispatcher: MicrophoneEventDispatcher;
    get waitForEvent(): <T extends "microphoneStatus" | "microphoneCommand" | "getMicrophoneConfiguration" | "setMicrophoneConfiguration" | "microphoneData" | "isRecordingMicrophone" | "microphoneRecording">(type: T) => Promise<{
        type: T;
        target: Device;
        message: MicrophoneEventMessages[T];
    }>;
    requestRequiredInformation(): void;
    get microphoneStatus(): "idle" | "streaming" | "vad";
    start(): Promise<void>;
    stop(): Promise<void>;
    vad(): Promise<void>;
    toggle(): Promise<void>;
    get microphoneConfiguration(): MicrophoneConfiguration;
    get availableMicrophoneConfigurationTypes(): ("sampleRate" | "bitDepth")[];
    get bitDepth(): "8" | "16" | undefined;
    get sampleRate(): "8000" | "16000" | undefined;
    setMicrophoneConfiguration(newMicrophoneConfiguration: MicrophoneConfiguration): Promise<void>;
    static AssertValidMicrophoneConfigurationType(microphoneConfigurationType: MicrophoneConfigurationType): void;
    static AssertValidMicrophoneConfigurationTypeEnum(microphoneConfigurationTypeEnum: number): void;
    parseMessage(messageType: MicrophoneMessageType, dataView: DataView<ArrayBuffer>): void;
    get audioContext(): AudioContext | undefined;
    set audioContext(newAudioContext: AudioContext | undefined);
    get gainNode(): GainNode;
    get mediaStreamDestination(): MediaStreamAudioDestinationNode;
    get isRecording(): boolean;
    startRecording(): void;
    stopRecording(): void;
    toggleRecording(): void;
    clear(): void;
}
export default MicrophoneManager;
