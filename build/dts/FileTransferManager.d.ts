import { FileLike } from "./utils/ArrayBufferUtils.ts";
import Device, { SendMessageCallback } from "./Device.ts";
import EventDispatcher from "./utils/EventDispatcher.ts";
import { ConnectionType } from "./connection/BaseConnectionManager.ts";
export declare const FileTransferMessageTypes: readonly ["getFileTypes", "maxFileLength", "getFileType", "setFileType", "getFileLength", "setFileLength", "getFileChecksum", "setFileChecksum", "setFileTransferCommand", "fileTransferStatus", "getFileBlock", "setFileBlock", "fileBytesTransferred"];
export type FileTransferMessageType = (typeof FileTransferMessageTypes)[number];
export declare const FileTypes: readonly ["tflite", "wifiServerCert", "wifiServerKey", "spriteSheet", "cameraImage"];
export type FileType = (typeof FileTypes)[number];
export type FileOrBlob = File | Blob;
export declare const FileTransferStatuses: readonly ["idle", "sending", "receiving"];
export type FileTransferStatus = (typeof FileTransferStatuses)[number];
export declare const FileTransferCommands: readonly ["startSend", "startReceive", "cancel"];
export type FileTransferCommand = (typeof FileTransferCommands)[number];
export declare const FileTransferDirections: readonly ["sending", "receiving"];
export type FileTransferDirection = (typeof FileTransferDirections)[number];
export declare const FileTransferEventTypes: readonly ["getFileTypes", "maxFileLength", "getFileType", "setFileType", "getFileLength", "setFileLength", "getFileChecksum", "setFileChecksum", "setFileTransferCommand", "fileTransferStatus", "getFileBlock", "setFileBlock", "fileBytesTransferred", "fileTransferProgress", "fileTransferComplete", "fileReceived", "fileSent"];
export type FileTransferEventType = (typeof FileTransferEventTypes)[number];
export declare const RequiredFileTransferMessageTypes: FileTransferMessageType[];
export interface FileConfiguration {
    file: FileLike;
    fileType: FileType;
}
export interface SentFileConfiguration extends FileConfiguration {
    checksum: number;
    length: number;
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
        fileType: FileType;
        fileTransferStatus: FileTransferStatus;
    };
    getFileBlock: {
        fileTransferBlock: DataView;
    };
    fileTransferProgress: {
        fileType: FileType;
        progress: number;
        direction: FileTransferDirection;
        bytesTransferred: number;
        file?: FileOrBlob;
        indirectly?: boolean;
        isComplete: boolean;
    };
    fileTransferComplete: {
        fileType: FileType;
        direction: FileTransferDirection;
        file: FileOrBlob;
        indirectly?: boolean;
    };
    fileReceived: {
        fileType: FileType;
        file: FileOrBlob;
        indirectly?: boolean;
    };
    fileSent: {
        fileType: FileType;
        file: FileOrBlob;
        indirectly?: boolean;
    };
    fileBytesTransferred: {
        bytesTransferred: number;
    };
}
export type FileTransferEventDispatcher = EventDispatcher<Device, FileTransferEventType, FileTransferEventMessages>;
export type SendFileTransferMessageCallback = SendMessageCallback<FileTransferMessageType>;
export type SendFileCallback = (fileType: FileType, file: FileLike, includesHeader?: boolean) => Promise<boolean>;
declare class FileTransferManager {
    #private;
    constructor();
    sendMessage: SendFileTransferMessageCallback;
    eventDispatcher: FileTransferEventDispatcher;
    get addEventListener(): <T extends "getFileTypes" | "maxFileLength" | "getFileType" | "getFileLength" | "getFileChecksum" | "fileTransferStatus" | "getFileBlock" | "fileTransferProgress" | "fileTransferComplete" | "fileReceived" | "fileSent" | "fileBytesTransferred" | "*" | "setFileType" | "setFileLength" | "setFileChecksum" | "setFileTransferCommand" | "setFileBlock">(type: T, listener: (event: import("./utils/EventDispatcher.ts").ListenerEvent<Device, "getFileTypes" | "maxFileLength" | "getFileType" | "getFileLength" | "getFileChecksum" | "fileTransferStatus" | "getFileBlock" | "fileTransferProgress" | "fileTransferComplete" | "fileReceived" | "fileSent" | "fileBytesTransferred" | "setFileType" | "setFileLength" | "setFileChecksum" | "setFileTransferCommand" | "setFileBlock", FileTransferEventMessages, T>) => void, options?: import("./utils/EventDispatcher.ts").EventDispatcherOptions) => void;
    get removeEventListener(): <T extends "getFileTypes" | "maxFileLength" | "getFileType" | "getFileLength" | "getFileChecksum" | "fileTransferStatus" | "getFileBlock" | "fileTransferProgress" | "fileTransferComplete" | "fileReceived" | "fileSent" | "fileBytesTransferred" | "*" | "setFileType" | "setFileLength" | "setFileChecksum" | "setFileTransferCommand" | "setFileBlock">(type: T, listener: (event: import("./utils/EventDispatcher.ts").ListenerEvent<Device, "getFileTypes" | "maxFileLength" | "getFileType" | "getFileLength" | "getFileChecksum" | "fileTransferStatus" | "getFileBlock" | "fileTransferProgress" | "fileTransferComplete" | "fileReceived" | "fileSent" | "fileBytesTransferred" | "setFileType" | "setFileLength" | "setFileChecksum" | "setFileTransferCommand" | "setFileBlock", FileTransferEventMessages, T>) => void) => void;
    get waitForEvent(): <T extends "getFileTypes" | "maxFileLength" | "getFileType" | "getFileLength" | "getFileChecksum" | "fileTransferStatus" | "getFileBlock" | "fileTransferProgress" | "fileTransferComplete" | "fileReceived" | "fileSent" | "fileBytesTransferred" | "setFileType" | "setFileLength" | "setFileChecksum" | "setFileTransferCommand" | "setFileBlock">(type: T, options?: {
        immediate?: boolean;
    }) => Promise<import("./utils/EventDispatcher.ts").ListenerEvent<Device, "getFileTypes" | "maxFileLength" | "getFileType" | "getFileLength" | "getFileChecksum" | "fileTransferStatus" | "getFileBlock" | "fileTransferProgress" | "fileTransferComplete" | "fileReceived" | "fileSent" | "fileBytesTransferred" | "setFileType" | "setFileLength" | "setFileChecksum" | "setFileTransferCommand" | "setFileBlock", FileTransferEventMessages, T>>;
    get fileTypes(): ("cameraImage" | "tflite" | "wifiServerCert" | "wifiServerKey" | "spriteSheet")[];
    static get MaxLength(): number;
    /** kB */
    get maxLength(): number;
    get type(): "cameraImage" | "tflite" | "wifiServerCert" | "wifiServerKey" | "spriteSheet" | undefined;
    get length(): number;
    get checksum(): number;
    get status(): "idle" | "sending" | "receiving";
    parseMessage(messageType: FileTransferMessageType, dataView: DataView<ArrayBuffer>, isSending?: boolean): void;
    send(type: FileType, file: FileLike, includesHeader?: boolean): Promise<boolean>;
    get bytesTransferred(): number;
    mtu: number;
    get indirectSentBlocks(): DataView<ArrayBuffer>[];
    sentFileConfigurations: SentFileConfiguration[];
    getCurrentSentFileConfiguration(): SentFileConfiguration | undefined;
    get headerLength(): number | undefined;
    receive(type: FileType): Promise<void>;
    cancel(): Promise<void>;
    requestRequiredInformation(): void;
    clear(): void;
    connectionType?: ConnectionType;
    get isClientConnectionType(): boolean;
}
export default FileTransferManager;
