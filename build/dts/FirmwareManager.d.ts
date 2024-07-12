import Device, { SendSmpMessageCallback } from "./Device";
import EventDispatcher from "./utils/EventDispatcher";
import { FileLike } from "./utils/ArrayBufferUtils";
export declare const FirmwareMessageTypes: readonly ["smp"];
export type FirmwareMessageType = (typeof FirmwareMessageTypes)[number];
export declare const FirmwareEventTypes: readonly ["smp", "firmwareImages", "firmwareUploadProgress", "firmwareStatus", "firmwareUploadComplete"];
export type FirmwareEventType = (typeof FirmwareEventTypes)[number];
export declare const FirmwareStatuses: readonly ["idle", "uploading", "uploaded", "pending", "testing", "erasing"];
export type FirmwareStatus = (typeof FirmwareStatuses)[number];
export interface FirmwareImage {
    slot: number;
    active: boolean;
    confirmed: boolean;
    pending: boolean;
    permanent: boolean;
    bootable: boolean;
    version: string;
    hash?: Uint8Array;
    empty?: boolean;
}
export interface FirmwareEventMessages {
    smp: {
        dataView: DataView;
    };
    firmwareImages: {
        firmwareImages: FirmwareImage[];
    };
    firmwareUploadProgress: {
        progress: number;
    };
    firmwareStatus: {
        firmwareStatus: FirmwareStatus;
    };
}
export type FirmwareEventDispatcher = EventDispatcher<Device, FirmwareEventType, FirmwareEventMessages>;
declare class FirmwareManager {
    #private;
    sendMessage: SendSmpMessageCallback;
    constructor();
    eventDispatcher: FirmwareEventDispatcher;
    get addEventListenter(): <T extends "smp" | "firmwareImages" | "firmwareUploadProgress" | "firmwareStatus" | "firmwareUploadComplete">(type: T, listener: (event: {
        type: T;
        target: Device;
        message: FirmwareEventMessages[T];
    }) => void, options?: {
        once: boolean;
    }) => void;
    get removeEventListener(): <T extends "smp" | "firmwareImages" | "firmwareUploadProgress" | "firmwareStatus" | "firmwareUploadComplete">(type: T, listener: (event: {
        type: T;
        target: Device;
        message: FirmwareEventMessages[T];
    }) => void) => void;
    get waitForEvent(): <T extends "smp" | "firmwareImages" | "firmwareUploadProgress" | "firmwareStatus" | "firmwareUploadComplete">(type: T) => Promise<{
        type: T;
        target: Device;
        message: FirmwareEventMessages[T];
    }>;
    parseMessage(messageType: FirmwareMessageType, dataView: DataView): void;
    uploadFirmware(file: FileLike): Promise<void>;
    get status(): "idle" | "uploading" | "uploaded" | "pending" | "testing" | "erasing";
    get images(): FirmwareImage[];
    getImages(): Promise<void>;
    testImage(imageIndex?: number): Promise<void>;
    eraseImage(): Promise<void>;
    confirmImage(imageIndex?: number): Promise<void>;
    echo(string: string): Promise<void>;
    reset(): Promise<void>;
    get mtu(): number;
    set mtu(newMtu: number);
}
export default FirmwareManager;
