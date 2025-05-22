import Device, { SendMessageCallback } from "./Device.ts";
import EventDispatcher from "./utils/EventDispatcher.ts";
export declare const CameraSensorTypes: readonly ["camera"];
export type CameraSensorType = (typeof CameraSensorTypes)[number];
export declare const CameraCommands: readonly ["takePicture", "stop", "sleep", "wake"];
export type CameraCommand = (typeof CameraCommands)[number];
export declare const CameraStatuses: readonly ["idle", "takingPicture", "asleep"];
export type CameraStatus = (typeof CameraStatuses)[number];
export declare const CameraDataTypes: readonly ["headerSize", "header", "imageSize", "image", "footerSize", "footer"];
export type CameraDataType = (typeof CameraDataTypes)[number];
export declare const CameraMessageTypes: readonly ["cameraCommand", "cameraStatus", "cameraData"];
export type CameraMessageType = (typeof CameraMessageTypes)[number];
export declare const RequiredCameraMessageTypes: CameraMessageType[];
export declare const CameraEventTypes: readonly ["cameraCommand", "cameraStatus", "cameraData", "cameraImageProgress", "cameraImage"];
export type CameraEventType = (typeof CameraEventTypes)[number];
export interface CameraEventMessages {
    cameraStatus: {
        cameraStatus: CameraStatus;
    };
    cameraImageProgress: {
        progress: number;
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
    get waitForEvent(): <T extends "cameraCommand" | "cameraStatus" | "cameraData" | "cameraImageProgress" | "cameraImage">(type: T) => Promise<{
        type: T;
        target: Device;
        message: CameraEventMessages[T];
    }>;
    requestRequiredInformation(): void;
    get cameraStatus(): "idle" | "takingPicture" | "asleep";
    takePicture(): Promise<void>;
    parseMessage(messageType: CameraMessageType, dataView: DataView): void;
    clear(): void;
}
export default CameraManager;
