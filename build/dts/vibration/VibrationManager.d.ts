import { VibrationWaveformEffect } from "./VibrationWaveformEffects.ts";
import Device, { SendMessageCallback } from "../Device.ts";
import EventDispatcher from "../utils/EventDispatcher.ts";
export declare const VibrationLocations: readonly ["front", "rear", "left", "right"];
export type VibrationLocation = (typeof VibrationLocations)[number];
export declare const VibrationTypes: readonly ["waveformEffect", "waveform"];
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
export declare const VibrationMessageTypes: readonly ["getVibrationLocations", "triggerVibration"];
export type VibrationMessageType = (typeof VibrationMessageTypes)[number];
export declare const VibrationEventTypes: readonly ["getVibrationLocations", "triggerVibration"];
export type VibrationEventType = (typeof VibrationEventTypes)[number];
export interface VibrationEventMessages {
    getVibrationLocations: {
        vibrationLocations: VibrationLocation[];
    };
}
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
export type VibrationEventDispatcher = EventDispatcher<Device, VibrationEventType, VibrationEventMessages>;
declare class VibrationManager {
    #private;
    constructor();
    sendMessage: SendVibrationMessageCallback;
    eventDispatcher: VibrationEventDispatcher;
    get waitForEvent(): <T extends "getVibrationLocations" | "triggerVibration">(type: T, options?: {
        immediate?: boolean;
    }) => Promise<import("../utils/EventDispatcher.ts").ListenerEvent<Device, "getVibrationLocations" | "triggerVibration", VibrationEventMessages, T>>;
    triggerVibration(vibrationConfiguration: VibrationConfiguration, sendImmediately?: boolean): Promise<void>;
    triggerVibration(vibrationConfigurations: VibrationConfiguration[], sendImmediately?: boolean): Promise<void>;
    get vibrationLocations(): ("left" | "right" | "front" | "rear")[];
    parseMessage(messageType: VibrationMessageType, dataView: DataView<ArrayBuffer>): void;
}
export default VibrationManager;
