import { FileLike } from "./utils/ArrayBufferUtils";
import Device, { SendMessageCallback } from "./Device";
import EventDispatcher from "./utils/EventDispatcher";
export declare const FileTransferMessageTypes: readonly ["maxFileLength", "getFileType", "setFileType", "getFileLength", "setFileLength", "getFileChecksum", "setFileChecksum", "setFileTransferCommand", "fileTransferStatus", "getFileBlock", "setFileBlock"];
export type FileTransferMessageType = (typeof FileTransferMessageTypes)[number];
export declare const FileTypes: readonly ["tflite"];
export type FileType = (typeof FileTypes)[number];
export declare const FileTransferStatuses: readonly ["idle", "sending", "receiving"];
export type FileTransferStatus = (typeof FileTransferStatuses)[number];
export declare const FileTransferCommands: readonly ["startReceive", "startSend", "cancel"];
export type FileTransferCommand = (typeof FileTransferCommands)[number];
export declare const FileTransferDirections: readonly ["sending", "receiving"];
export type FileTransferDirection = (typeof FileTransferDirections)[number];
export declare const FileTransferEventTypes: readonly ["maxFileLength", "getFileType", "setFileType", "getFileLength", "setFileLength", "getFileChecksum", "setFileChecksum", "setFileTransferCommand", "fileTransferStatus", "getFileBlock", "setFileBlock", "fileTransferProgress", "fileTransferComplete", "fileReceived"];
export type FileTransferEventType = (typeof FileTransferEventTypes)[number];
export interface FileTransferEventMessages {
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
declare class FileTransferManager {
    #private;
    sendMessage: SendFileTransferMessageCallback;
    eventDispatcher: FileTransferEventDispatcher;
    get addEventListener(): <T extends "maxFileLength" | "getFileType" | "setFileType" | "getFileLength" | "setFileLength" | "getFileChecksum" | "setFileChecksum" | "setFileTransferCommand" | "fileTransferStatus" | "getFileBlock" | "setFileBlock" | "fileTransferProgress" | "fileTransferComplete" | "fileReceived">(type: T, listener: (event: {
        type: T;
        target: Device;
        message: FileTransferEventMessages[T];
    }) => void, options?: {
        once: boolean;
    }) => void;
    get removeEventListener(): <T extends "maxFileLength" | "getFileType" | "setFileType" | "getFileLength" | "setFileLength" | "getFileChecksum" | "setFileChecksum" | "setFileTransferCommand" | "fileTransferStatus" | "getFileBlock" | "setFileBlock" | "fileTransferProgress" | "fileTransferComplete" | "fileReceived">(type: T, listener: (event: {
        type: T;
        target: Device;
        message: FileTransferEventMessages[T];
    }) => void) => void;
    get waitForEvent(): <T extends "maxFileLength" | "getFileType" | "setFileType" | "getFileLength" | "setFileLength" | "getFileChecksum" | "setFileChecksum" | "setFileTransferCommand" | "fileTransferStatus" | "getFileBlock" | "setFileBlock" | "fileTransferProgress" | "fileTransferComplete" | "fileReceived">(type: T) => Promise<{
        type: T;
        target: Device;
        message: FileTransferEventMessages[T];
    }>;
    static get MaxLength(): number;
    /** kB */
    get maxLength(): number;
    get type(): "tflite" | undefined;
    get length(): number;
    get checksum(): number;
    get status(): "idle" | "sending" | "receiving";
    parseMessage(messageType: FileTransferMessageType, dataView: DataView): void;
    send(type: FileType, file: FileLike): Promise<void>;
    mtu: number;
    receive(type: FileType): Promise<void>;
    cancel(): Promise<void>;
}
export default FileTransferManager;