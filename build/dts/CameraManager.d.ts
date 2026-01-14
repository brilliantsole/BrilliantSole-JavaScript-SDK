import Device, { SendMessageCallback } from "./Device.ts";
import EventDispatcher from "./utils/EventDispatcher.ts";
export declare const CameraSensorTypes: readonly ["camera"];
export type CameraSensorType = (typeof CameraSensorTypes)[number];
export declare const CameraCommands: readonly ["focus", "takePicture", "stop", "sleep", "wake"];
export type CameraCommand = (typeof CameraCommands)[number];
export declare const CameraStatuses: readonly ["idle", "focusing", "takingPicture", "asleep"];
export type CameraStatus = (typeof CameraStatuses)[number];
export declare const CameraDataTypes: readonly ["headerSize", "header", "imageSize", "image", "footerSize", "footer"];
export type CameraDataType = (typeof CameraDataTypes)[number];
export declare const CameraConfigurationTypes: readonly ["resolution", "qualityFactor", "shutter", "gain", "redGain", "greenGain", "blueGain", "autoWhiteBalanceEnabled", "autoGainEnabled", "exposure", "autoExposureEnabled", "autoExposureLevel", "brightness", "saturation", "contrast", "sharpness"];
export type CameraConfigurationType = (typeof CameraConfigurationTypes)[number];
export declare const CameraMessageTypes: readonly ["cameraStatus", "cameraCommand", "getCameraConfiguration", "setCameraConfiguration", "cameraData"];
export type CameraMessageType = (typeof CameraMessageTypes)[number];
export type CameraConfiguration = {
    [cameraConfigurationType in CameraConfigurationType]?: number;
};
export type CameraConfigurationRanges = {
    [cameraConfigurationType in CameraConfigurationType]: {
        min: number;
        max: number;
    };
};
export declare const RequiredCameraMessageTypes: CameraMessageType[];
export declare const CameraEventTypes: readonly ["cameraStatus", "cameraCommand", "getCameraConfiguration", "setCameraConfiguration", "cameraData", "cameraImageProgress", "cameraImage", "isRecordingCamera", "cameraRecording", "autoPicture"];
export type CameraEventType = (typeof CameraEventTypes)[number];
export interface CameraImage {
    blob: Blob;
    url: string;
    arrayBuffer: ArrayBuffer;
    timestamp: number;
    latency: number;
}
export interface CameraEventMessages {
    cameraStatus: {
        cameraStatus: CameraStatus;
        previousCameraStatus: CameraStatus;
    };
    getCameraConfiguration: {
        cameraConfiguration: CameraConfiguration;
    };
    cameraImageProgress: {
        progress: number;
        type: CameraDataType;
    };
    cameraImage: CameraImage;
    isRecordingCamera: {
        isRecordingCamera: boolean;
    };
    cameraRecording: {
        images: CameraImage[];
        configuration: CameraConfiguration;
        blob: Blob;
        url: string;
    };
    autoPicture: {
        autoPicture: boolean;
    };
}
export type CameraEventDispatcher = EventDispatcher<Device, CameraEventType, CameraEventMessages>;
export type SendCameraMessageCallback = SendMessageCallback<CameraMessageType>;
declare class CameraManager {
    #private;
    constructor();
    sendMessage: SendCameraMessageCallback;
    eventDispatcher: CameraEventDispatcher;
    get waitForEvent(): <T extends "cameraImage" | "cameraStatus" | "cameraCommand" | "getCameraConfiguration" | "setCameraConfiguration" | "cameraData" | "cameraImageProgress" | "isRecordingCamera" | "cameraRecording" | "autoPicture">(type: T) => Promise<{
        type: T;
        target: Device;
        message: CameraEventMessages[T];
    }>;
    requestRequiredInformation(): void;
    get cameraStatus(): "idle" | "focusing" | "takingPicture" | "asleep";
    focus(): Promise<void>;
    takePicture(): Promise<void>;
    stop(): Promise<void>;
    sleep(): Promise<void>;
    wake(): Promise<void>;
    buildCameraData(): ArrayBuffer;
    get cameraConfiguration(): CameraConfiguration;
    get availableCameraConfigurationTypes(): ("resolution" | "qualityFactor" | "shutter" | "gain" | "redGain" | "greenGain" | "blueGain" | "autoWhiteBalanceEnabled" | "autoGainEnabled" | "exposure" | "autoExposureEnabled" | "autoExposureLevel" | "brightness" | "saturation" | "contrast" | "sharpness")[];
    get cameraConfigurationRanges(): CameraConfigurationRanges;
    setCameraConfiguration(newCameraConfiguration: CameraConfiguration): Promise<void>;
    static AssertValidCameraConfigurationType(cameraConfigurationType: CameraConfigurationType): void;
    static AssertValidCameraConfigurationTypeEnum(cameraConfigurationTypeEnum: number): void;
    get isRecording(): boolean;
    get isRecordingAvailable(): boolean;
    startRecording(): void;
    stopRecording(): Promise<void>;
    toggleRecording(): void;
    get autoPicture(): boolean;
    set autoPicture(newAutoPicture: boolean);
    parseMessage(messageType: CameraMessageType, dataView: DataView<ArrayBuffer>): void;
    clear(): void;
}
export default CameraManager;
