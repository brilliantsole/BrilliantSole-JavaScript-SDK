import { VibrationWaveformEffect } from "./VibrationWaveformEffects.ts";
import { SendMessageCallback } from "../Device.ts";
export declare const VibrationLocations: readonly ["front", "rear"];
export type VibrationLocation = (typeof VibrationLocations)[number];
export declare const VibrationTypes: readonly ["waveformEffect", "waveform"];
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
export declare const VibrationMessageTypes: readonly ["getVibrationLocations", "triggerVibration"];
export type VibrationMessageType = (typeof VibrationMessageTypes)[number];
export declare const MaxNumberOfVibrationWaveformEffectSegments = 8;
export declare const MaxVibrationWaveformSegmentDuration = 2550;
export declare const MaxVibrationWaveformEffectSegmentDelay = 1270;
export declare const MaxVibrationWaveformEffectSegmentLoopCount = 3;
export declare const MaxNumberOfVibrationWaveformSegments = 20;
export declare const MaxVibrationWaveformEffectSequenceLoopCount = 6;
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
export type VibrationConfiguration = VibrationWaveformEffectConfiguration | VibrationWaveformConfiguration;
export type SendVibrationMessageCallback = SendMessageCallback<VibrationMessageType>;
declare class VibrationManager {
    #private;
    constructor();
    sendMessage: SendVibrationMessageCallback;
    triggerVibration(vibrationConfigurations: VibrationConfiguration[], sendImmediately?: boolean): Promise<void>;
}
export default VibrationManager;
