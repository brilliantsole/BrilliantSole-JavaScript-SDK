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
export declare const CameraConfigurationTypes: readonly ["resolution", "qualityFactor", "shutter", "gain", "redGain", "greenGain", "blueGain"];
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
export declare const CameraEventTypes: readonly ["cameraStatus", "cameraCommand", "getCameraConfiguration", "setCameraConfiguration", "cameraData", "cameraImageProgress", "cameraImage"];
export type CameraEventType = (typeof CameraEventTypes)[number];
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
    cameraImage: {
        blob: Blob;
        url: string;
    };
}
export type CameraEventDispatcher = EventDispatcher<Device, CameraEventType, CameraEventMessages>;
export type SendCameraMessageCallback = SendMessageCallback<CameraMessageType>;
declare class CameraManager {
    #private;
    constructor();
    sendMessage: SendCameraMessageCallback;
    eventDispatcher: CameraEventDispatcher;
    get waitForEvent(): <T extends "cameraStatus" | "cameraCommand" | "getCameraConfiguration" | "setCameraConfiguration" | "cameraData" | "cameraImageProgress" | "cameraImage">(type: T) => Promise<{
        type: T;
        target: Device;
        message: CameraEventMessages[T];
    }>;
    requestRequiredInformation(): void;
    get cameraStatus(): "asleep" | "idle" | "focusing" | "takingPicture";
    focus(): Promise<void>;
    takePicture(): Promise<void>;
    stop(): Promise<void>;
    sleep(): Promise<void>;
    wake(): Promise<void>;
    get cameraConfiguration(): CameraConfiguration;
    get availableCameraConfigurationTypes(): ("resolution" | "qualityFactor" | "shutter" | "gain" | "redGain" | "greenGain" | "blueGain")[];
    get cameraConfigurationRanges(): CameraConfigurationRanges;
    setCameraConfiguration(newCameraConfiguration: CameraConfiguration): Promise<void>;
    static AssertValidCameraConfigurationType(cameraConfigurationType: CameraConfigurationType): void;
    static AssertValidCameraConfigurationTypeEnum(cameraConfigurationTypeEnum: number): void;
    parseMessage(messageType: CameraMessageType, dataView: DataView): void;
    clear(): void;
}
export default CameraManager;
