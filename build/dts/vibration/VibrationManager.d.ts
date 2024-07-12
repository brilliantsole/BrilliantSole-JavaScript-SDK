import { VibrationWaveformEffect } from "./VibrationWaveformEffects";
import { SendMessageCallback } from "../Device";
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
export declare const VibrationMessageTypes: readonly ["triggerVibration"];
export type VibrationMessageType = (typeof VibrationMessageTypes)[number];
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
    sendMessage: SendVibrationMessageCallback;
    static get MaxWaveformEffectSegmentDelay(): number;
    get maxWaveformEffectSegmentDelay(): number;
    static get MaxWaveformEffectSegmentLoopCount(): number;
    get maxWaveformEffectSegmentLoopCount(): number;
    static get MaxNumberOfWaveformEffectSegments(): number;
    get maxNumberOfWaveformEffectSegments(): number;
    static get MaxWaveformEffectSequenceLoopCount(): number;
    get maxWaveformEffectSequenceLoopCount(): number;
    static get MaxWaveformSegmentDuration(): number;
    get maxWaveformSegmentDuration(): number;
    static get MaxNumberOfWaveformSegments(): number;
    get maxNumberOfWaveformSegments(): number;
    triggerVibration(vibrationConfigurations: VibrationConfiguration[], sendImmediately?: boolean): Promise<void>;
}
export default VibrationManager;
