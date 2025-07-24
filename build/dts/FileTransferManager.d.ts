import { FileLike } from "./utils/ArrayBufferUtils.ts";
import Device, { SendMessageCallback } from "./Device.ts";
import EventDispatcher from "./utils/EventDispatcher.ts";
export declare const FileTransferMessageTypes: readonly ["getFileTypes", "maxFileLength", "getFileType", "setFileType", "getFileLength", "setFileLength", "getFileChecksum", "setFileChecksum", "setFileTransferCommand", "fileTransferStatus", "getFileBlock", "setFileBlock", "fileBytesTransferred"];
export type FileTransferMessageType = (typeof FileTransferMessageTypes)[number];
export declare const FileTypes: readonly ["tflite", "wifiServerCert", "wifiServerKey", "spriteSheet"];
export type FileType = (typeof FileTypes)[number];
export declare const FileTransferStatuses: readonly ["idle", "sending", "receiving"];
export type FileTransferStatus = (typeof FileTransferStatuses)[number];
export declare const FileTransferCommands: readonly ["startSend", "startReceive", "cancel"];
export type FileTransferCommand = (typeof FileTransferCommands)[number];
export declare const FileTransferDirections: readonly ["sending", "receiving"];
export type FileTransferDirection = (typeof FileTransferDirections)[number];
export declare const FileTransferEventTypes: readonly ["getFileTypes", "maxFileLength", "getFileType", "setFileType", "getFileLength", "setFileLength", "getFileChecksum", "setFileChecksum", "setFileTransferCommand", "fileTransferStatus", "getFileBlock", "setFileBlock", "fileBytesTransferred", "fileTransferProgress", "fileTransferComplete", "fileReceived"];
export type FileTransferEventType = (typeof FileTransferEventTypes)[number];
export declare const RequiredFileTransferMessageTypes: FileTransferMessageType[];
export interface FileConfiguration {
    file: FileLike;
    type: FileType;
}
export interface FileTransferEventMessages {
    getFileTypes: {
        fileTypes: FileType[];
    };
    maxFileLength: {
        maxFileLength: number;
    };
    getFileType: {
        fileType: FileType;
    };
    getFileLength: {
        fileLength: number;
    };
    getFileChecksum: {
        fileChecksum: number;
    };
    fileTransferStatus: {
        fileTransferStatus: FileTransferStatus;
    };
    getFileBlock: {
        fileTransferBlock: DataView;
    };
    fileTransferProgress: {
        progress: number;
    };
    fileTransferComplete: {
        direction: FileTransferDirection;
    };
    fileReceived: {
        file: File | Blob;
    };
}
export type FileTransferEventDispatcher = EventDispatcher<Device, FileTransferEventType, FileTransferEventMessages>;
export type SendFileTransferMessageCallback = SendMessageCallback<FileTransferMessageType>;
export type SendFileCallback = (type: FileType, file: FileLike, override?: boolean) => Promise<boolean>;
declare class FileTransferManager {
    #private;
    constructor();
    sendMessage: SendFileTransferMessageCallback;
    eventDispatcher: FileTransferEventDispatcher;
    get addEventListener(): <T extends "getFileTypes" | "maxFileLength" | "getFileType" | "setFileType" | "getFileLength" | "setFileLength" | "getFileChecksum" | "setFileChecksum" | "setFileTransferCommand" | "fileTransferStatus" | "getFileBlock" | "setFileBlock" | "fileBytesTransferred" | "fileTransferProgress" | "fileTransferComplete" | "fileReceived">(type: T, listener: (event: {
        type: T;
        target: Device;
        message: FileTransferEventMessages[T];
    }) => void, options?: {
        once?: boolean;
    }) => void;
    get removeEventListener(): <T extends "getFileTypes" | "maxFileLength" | "getFileType" | "setFileType" | "getFileLength" | "setFileLength" | "getFileChecksum" | "setFileChecksum" | "setFileTransferCommand" | "fileTransferStatus" | "getFileBlock" | "setFileBlock" | "fileBytesTransferred" | "fileTransferProgress" | "fileTransferComplete" | "fileReceived">(type: T, listener: (event: {
        type: T;
        target: Device;
        message: FileTransferEventMessages[T];
    }) => void) => void;
    get waitForEvent(): <T extends "getFileTypes" | "maxFileLength" | "getFileType" | "setFileType" | "getFileLength" | "setFileLength" | "getFileChecksum" | "setFileChecksum" | "setFileTransferCommand" | "fileTransferStatus" | "getFileBlock" | "setFileBlock" | "fileBytesTransferred" | "fileTransferProgress" | "fileTransferComplete" | "fileReceived">(type: T) => Promise<{
        type: T;
        target: Device;
        message: FileTransferEventMessages[T];
    }>;
    get fileTypes(): ("tflite" | "wifiServerCert" | "wifiServerKey" | "spriteSheet")[];
    static get MaxLength(): number;
    /** kB */
    get maxLength(): number;
    get type(): "tflite" | "wifiServerCert" | "wifiServerKey" | "spriteSheet" | undefined;
    get length(): number;
    get checksum(): number;
    get status(): "idle" | "sending" | "receiving";
    parseMessage(messageType: FileTransferMessageType, dataView: DataView): void;
    send(type: FileType, file: FileLike, override?: boolean): Promise<boolean>;
    mtu: number;
    receive(type: FileType): Promise<void>;
    cancel(): Promise<void>;
    get isServerSide(): boolean;
    set isServerSide(newIsServerSide: boolean);
    requestRequiredInformation(): void;
}
export default FileTransferManager;
