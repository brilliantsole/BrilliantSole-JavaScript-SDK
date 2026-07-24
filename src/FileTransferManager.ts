import { createConsole } from "./utils/Console.ts";
import { crc32 } from "./utils/checksum.ts";
import {
  concatenateArrayBuffers,
  getFileBuffer,
} from "./utils/ArrayBufferUtils.ts";
import { FileLike } from "./utils/ArrayBufferUtils.ts";
import Device, { SendMessageCallback } from "./Device.ts";
import EventDispatcher from "./utils/EventDispatcher.ts";
import autoBind from "auto-bind";
import { ConnectionType } from "./connection/BaseConnectionManager.ts";
import { enumToArrayBuffer } from "./utils/ParseUtils.ts";
import { TfliteFileConfiguration } from "./TfliteManager.ts";
import { DisplaySpriteSheetFileConfiguration } from "./DisplayManager.ts";
import { CameraImageFileConfiguration } from "./CameraManager.ts";

const _console = createConsole("FileTransferManager", { log: true });

const emptyHeaderDataView = new DataView(new ArrayBuffer(2));
emptyHeaderDataView.setUint16(0, 2, true);

export const FileTransferMessageTypes = [
  "getFileTypes",
  "maxFileLength",
  "getFileType",
  "setFileType",
  "getFileLength",
  "setFileLength",
  "getFileChecksum",
  "setFileChecksum",
  "setFileTransferCommand",
  "fileTransferStatus",
  "getFileBlock",
  "setFileBlock",
  "fileBytesTransferred",
] as const;
export type FileTransferMessageType = (typeof FileTransferMessageTypes)[number];

export const FileTypes = [
  "tflite",
  "wifiServerCert",
  "wifiServerKey",
  "spriteSheet",
  "cameraImage",
] as const;
export type FileType = (typeof FileTypes)[number];
export type FileOrBlob = File | Blob;

export const FileTransferStatuses = ["idle", "sending", "receiving"] as const;
export type FileTransferStatus = (typeof FileTransferStatuses)[number];

export const FileTransferCommands = [
  "startSend",
  "startReceive",
  "cancel",
] as const;
export type FileTransferCommand = (typeof FileTransferCommands)[number];

export const FileTransferCommandStatusMap: Record<
  FileTransferCommand,
  FileTransferStatus
> = {
  startSend: "sending",
  startReceive: "receiving",
  cancel: "idle",
};

export const FileTransferDirections = ["sending", "receiving"] as const;
export type FileTransferDirection = (typeof FileTransferDirections)[number];

export const FileTransferEventTypes = [
  ...FileTransferMessageTypes,
  "fileTransferProgress",
  "fileTransferComplete",
  "fileReceived",
  "fileSent",
] as const;
export type FileTransferEventType = (typeof FileTransferEventTypes)[number];

export const RequiredFileTransferMessageTypes: FileTransferMessageType[] = [
  "maxFileLength",
  "getFileLength",
  "getFileChecksum",
  "getFileType",
  "fileTransferStatus",
];

export interface BaseFileConfiguration {
  file: FileLike;
  fileType: FileType;
}

export type FileConfiguration =
  | TfliteFileConfiguration
  | DisplaySpriteSheetFileConfiguration
  | CameraImageFileConfiguration;

export interface ExtendedFileConfiguration extends BaseFileConfiguration {
  checksum: number;
  length: number;
  indirectly?: boolean;
  buffer: ArrayBuffer;
  file: FileOrBlob;
  direction: FileTransferDirection;
}

export interface FileTransferEventMessages {
  getFileTypes: { fileTypes: FileType[] };
  maxFileLength: { maxFileLength: number };
  getFileType: { fileType: FileType };
  getFileLength: { fileLength: number };
  getFileChecksum: { fileChecksum: number };
  fileTransferStatus: {
    fileType: FileType;
    fileTransferStatus: FileTransferStatus;
  };
  getFileBlock: { fileTransferBlock: DataView };
  fileTransferProgress: {
    fileType: FileType;
    progress: number;
    direction: FileTransferDirection;
    bytesTransferred: number;
    file?: FileOrBlob;
    fileConfiguration?: ExtendedFileConfiguration;
    indirectly?: boolean;
    isComplete: boolean;
  };
  fileTransferComplete: {
    fileType: FileType;
    direction: FileTransferDirection;
    file: FileOrBlob;
    indirectly?: boolean;
    fileConfiguration: ExtendedFileConfiguration;
  };
  fileReceived: {
    fileType: FileType;
    file: FileOrBlob;
    indirectly?: boolean;
    fileConfiguration: ExtendedFileConfiguration;
  };
  fileSent: {
    fileType: FileType;
    file: FileOrBlob;
    indirectly?: boolean;
    fileConfiguration: ExtendedFileConfiguration;
  };
  fileBytesTransferred: { bytesTransferred: number };
}

export type FileTransferEventDispatcher = EventDispatcher<
  Device,
  FileTransferEventType,
  FileTransferEventMessages
>;
export type SendFileTransferMessageCallback =
  SendMessageCallback<FileTransferMessageType>;

export type SendFileCallback = (
  fileType: FileType,
  file: FileLike,
  includesHeader?: boolean,
) => Promise<boolean>;

export type OnParseFileCallback = (
  fileConfiguration: Partial<FileConfiguration>,
) => Promise<void>;

export type OnFileConfigurationCallback = (
  fileConfiguration: ExtendedFileConfiguration,
) => Promise<void>;

class FileTransferManager {
  constructor() {
    autoBind(this);
  }
  sendMessage!: SendFileTransferMessageCallback;

  eventDispatcher!: FileTransferEventDispatcher;
  get addEventListener() {
    return this.eventDispatcher.addEventListener;
  }
  get #dispatchEvent() {
    return this.eventDispatcher.dispatchEvent;
  }
  get removeEventListener() {
    return this.eventDispatcher.removeEventListener;
  }
  get waitForEvent() {
    return this.eventDispatcher.waitForEvent;
  }

  #assertValidType(type: FileType) {
    _console.assertEnumWithError(FileTypes, type);
  }
  #isValidType(type: FileType) {
    return FileTypes.includes(type);
  }
  #assertValidTypeEnum(typeEnum: number) {
    _console.assertWithError(
      typeEnum in FileTypes,
      `invalid typeEnum ${typeEnum}`,
    );
  }

  #assertValidStatusEnum(statusEnum: number) {
    _console.assertWithError(
      statusEnum in FileTransferStatuses,
      `invalid statusEnum ${statusEnum}`,
    );
  }
  #assertValidCommand(command: FileTransferCommand) {
    _console.assertEnumWithError(FileTransferCommands, command);
  }

  #fileTypes: FileType[] = [];
  get fileTypes() {
    return this.#fileTypes;
  }
  #parseFileTypes(dataView: DataView<ArrayBuffer>, isSending?: boolean) {
    if (isSending) {
      return;
    }
    const fileTypes = Array.from(new Uint8Array(dataView.buffer))
      .map((index) => FileTypes[index])
      .filter(Boolean);
    this.#fileTypes = fileTypes;
    _console.log("fileTypes", fileTypes);
    this.#dispatchEvent("getFileTypes", {
      fileTypes: this.#fileTypes,
    });
  }

  static #MaxLength = 0; // kB
  static get MaxLength() {
    return this.#MaxLength;
  }
  #maxLength = FileTransferManager.MaxLength;
  /** kB */
  get maxLength() {
    return this.#maxLength;
  }
  #parseMaxLength(dataView: DataView<ArrayBuffer>, isSending?: boolean) {
    if (isSending) {
      return;
    }
    _console.log("parseFileMaxLength", dataView);
    const maxLength = dataView.getUint32(0, true);
    _console.log(`maxLength: ${maxLength / 1024}kB`);
    this.#updateMaxLength(maxLength);
  }
  #updateMaxLength(maxLength: number) {
    _console.log({ maxLength });
    this.#maxLength = maxLength;
    this.#dispatchEvent("maxFileLength", { maxFileLength: maxLength });
  }
  #assertValidLength(length: number) {
    _console.assertWithError(
      length <= this.maxLength,
      `file length ${length}kB too large - must be ${this.maxLength}kB or less`,
    );
  }

  #type: FileType | undefined;
  get type() {
    return this.#type;
  }
  #parseType(dataView: DataView<ArrayBuffer>, isSending?: boolean) {
    if (isSending) {
      return;
    }
    _console.log("parseFileType", dataView);
    const typeEnum = dataView.getUint8(0);
    this.#assertValidTypeEnum(typeEnum);
    const type = FileTypes[typeEnum];
    this.#updateType(type);
  }
  #updateType(type: FileType) {
    _console.log({ fileTransferType: type });
    this.#type = type;
    this.#dispatchEvent("getFileType", { fileType: type });
  }
  async #setType(newType: FileType, sendImmediately?: boolean) {
    this.#assertValidType(newType);
    if (this.type == newType && !this.isClientConnectionType) {
      _console.log(`redundant type assignment ${newType}`);
      return;
    }

    let promise: Promise<any>;
    if (false) {
      promise = this.waitForEvent("getFileType");
    } else {
      const abortController = new AbortController();
      promise = new Promise<void>((resolve) => {
        this.addEventListener(
          "getFileType",
          (event) => {
            const { fileType } = event.message;
            if (fileType == newType) {
              abortController.abort();
              resolve();
            } else {
              _console.log(
                `different fileType "${fileType}" - waiting for "${newType}"`,
              );
            }
          },
          { signal: abortController.signal },
        );
      });
    }

    this.sendMessage(
      [{ type: "setFileType", data: enumToArrayBuffer(FileTypes, newType) }],
      sendImmediately,
    );

    await promise;
  }

  #length = 0;
  get length() {
    return this.#length;
  }
  #parseLength(dataView: DataView<ArrayBuffer>, isSending?: boolean) {
    if (isSending) {
      return;
    }
    _console.log("parseFileLength", dataView, { isSending });
    const length = dataView.getUint32(0, true);

    this.#updateLength(length);
  }
  #updateLength(length: number) {
    _console.log(`length: ${length / 1024}kB (${length} bytes)`);
    this.#length = length;
    this.#dispatchEvent("getFileLength", { fileLength: length });
  }
  async #setLength(newLength: number, sendImmediately: boolean) {
    _console.assertTypeWithError(newLength, "number");
    this.#assertValidLength(newLength);
    _console.log("#setLength", { newLength, sendImmediately });
    if (this.length == newLength && !this.isClientConnectionType) {
      _console.log(`redundant length assignment ${newLength}`);
      return;
    }

    let promise: Promise<any>;
    if (false) {
      promise = this.waitForEvent("getFileLength");
    } else {
      const abortController = new AbortController();
      promise = new Promise<void>((resolve) => {
        this.addEventListener(
          "getFileLength",
          (event) => {
            const { fileLength } = event.message;
            if (fileLength == newLength) {
              abortController.abort();
              resolve();
            } else {
              _console.log(
                `different fileLength "${fileLength}" - waiting for "${newLength}"`,
              );
            }
          },
          { signal: abortController.signal },
        );
      });
    }

    const dataView = new DataView(new ArrayBuffer(4));
    dataView.setUint32(0, newLength, true);
    this.sendMessage(
      [{ type: "setFileLength", data: dataView.buffer }],
      sendImmediately,
    );

    await promise;
  }

  #checksum = 0;
  get checksum() {
    return this.#checksum;
  }
  #parseChecksum(dataView: DataView<ArrayBuffer>, isSending?: boolean) {
    if (isSending) {
      return;
    }
    _console.log("checksum", dataView);
    const checksum = dataView.getUint32(0, true);
    this.#updateChecksum(checksum);
  }
  #updateChecksum(checksum: number) {
    _console.log({ checksum });
    this.#checksum = checksum;
    this.#dispatchEvent("getFileChecksum", { fileChecksum: checksum });
  }
  async #setChecksum(newChecksum: number, sendImmediately: boolean) {
    _console.assertTypeWithError(newChecksum, "number");
    _console.log("#setChecksum", { newChecksum, sendImmediately });
    if (this.checksum == newChecksum && !this.isClientConnectionType) {
      _console.log(`redundant checksum assignment ${newChecksum}`);
      return;
    }

    let promise: Promise<any>;
    if (false) {
      promise = this.waitForEvent("getFileChecksum");
    } else {
      const abortController = new AbortController();
      promise = new Promise<void>((resolve) => {
        this.addEventListener(
          "getFileChecksum",
          (event) => {
            const { fileChecksum } = event.message;
            if (fileChecksum == newChecksum) {
              abortController.abort();
              resolve();
            } else {
              _console.log(
                `different fileChecksum "${fileChecksum}" - waiting for "${newChecksum}"`,
              );
            }
          },
          { signal: abortController.signal },
        );
      });
    }

    const dataView = new DataView(new ArrayBuffer(4));
    dataView.setUint32(0, newChecksum, true);
    this.sendMessage(
      [{ type: "setFileChecksum", data: dataView.buffer }],
      sendImmediately,
    );

    await promise;
  }

  async #setCommand(command: FileTransferCommand, sendImmediately?: boolean) {
    this.#assertValidCommand(command);

    let promise: Promise<any>;
    if (false) {
      promise = this.waitForEvent("fileTransferStatus");
    } else {
      const abortController = new AbortController();
      promise = new Promise<void>((resolve) => {
        this.addEventListener(
          "fileTransferStatus",
          (event) => {
            const { fileTransferStatus } = event.message;
            const expectedStatus = FileTransferCommandStatusMap[command];

            if (fileTransferStatus == expectedStatus) {
              abortController.abort();
              resolve();
            } else {
              _console.log(
                `different fileTransferStatus "${fileTransferStatus}" - waiting for "${expectedStatus}"`,
              );
            }
          },
          { signal: abortController.signal },
        );
      });
    }

    _console.log(`setting command ${command}`);
    this.sendMessage(
      [
        {
          type: "setFileTransferCommand",
          data: enumToArrayBuffer(FileTransferCommands, command),
        },
      ],
      sendImmediately,
    );

    await promise;
  }
  #parseFileTransferCommand(dataView: DataView<ArrayBuffer>) {
    _console.log("parseFileTransferCommand", dataView);
    const commandEnum = dataView.getUint8(0);
    const command = FileTransferCommands[commandEnum];
    _console.assertEnumWithError(FileTransferCommands, command);
    _console.log({ command });
  }

  #status: FileTransferStatus = "idle";
  get status() {
    return this.#status;
  }
  #parseStatus(dataView: DataView<ArrayBuffer>, isSending?: boolean) {
    if (isSending) {
      return;
    }
    _console.log("parseFileTransferStatus", dataView);
    const statusEnum = dataView.getUint8(0);
    this.#assertValidStatusEnum(statusEnum);
    const status = FileTransferStatuses[statusEnum];
    this.#updateStatus(status);
  }
  #updateStatus(status: FileTransferStatus) {
    _console.log({ status });
    this.#status = status;
    this.#receivedBlocks.length = 0;
    this.#isCancelling = false;
    this.#buffer = undefined;
    this.#bytesTransferred = 0;
    this.#dispatchEvent("fileTransferStatus", {
      fileTransferStatus: status,
      fileType: this.type!,
    });
    if (this.#isRequestingReceive && this.status != "receiving") {
      this.#isRequestingReceive = false;
    }
  }
  #assertIsIdle() {
    _console.assertWithError(this.#status == "idle", "status is not idle");
  }
  #assertIsNotIdle() {
    _console.assertWithError(this.#status != "idle", "status is idle");
  }

  // BLOCK

  #receivedBlocks: ArrayBuffer[] = [];
  async #parseFileBlock(dataView: DataView<ArrayBuffer>, isSending?: boolean) {
    _console.log("parseFileBlock", dataView, { isSending });

    if (this.isClientConnectionType && this.#receivedBlocks.length == 0) {
      const headerLength = dataView.getUint16(0, true);
      _console.log({ headerLength });
      this.#headerLength = headerLength;
    }

    this.#receivedBlocks.push(dataView.buffer);

    const bytesReceived = this.#receivedBlocks.reduce(
      (sum, arrayBuffer) => (sum += arrayBuffer.byteLength),
      0,
    );
    this.#bytesTransferred = bytesReceived;

    const length = this.isClientConnectionType
      ? this.#length + this.#headerLength!
      : this.#length;
    const progress = bytesReceived / length;

    _console.log(
      `received ${bytesReceived}/${length}} bytes (${progress * 100}%) - ${
        length - bytesReceived
      } bytes remaining`,
    );

    const direction: FileTransferDirection = "receiving";
    const indirectly = !this.#isRequestingReceive;
    const fileType = this.type!;
    let file: FileOrBlob | undefined;
    const isComplete = progress == 1;
    _console.log({ isComplete });

    let buffer: ArrayBuffer | undefined;
    let fileConfiguration: ExtendedFileConfiguration | undefined;
    if (isComplete) {
      buffer = concatenateArrayBuffers(this.#receivedBlocks);
      file = this.#createFile(buffer);
      _console.assertWithError(file, "file not created");
      _console.log("received file", file);

      file = file!;
      buffer = buffer!;
      const checksum = this.#checksum;
      fileConfiguration = {
        fileType,
        file,
        buffer,
        indirectly,
        checksum,
        length: this.#length,
        direction,
      };
      this.fileConfigurations.push(fileConfiguration);
    }

    this.#dispatchEvent("fileTransferProgress", {
      progress,
      fileType,
      direction,
      bytesTransferred: this.#bytesTransferred,
      isComplete,
      file,
      fileConfiguration,
      indirectly,
    });
    this.#dispatchEvent("getFileBlock", { fileTransferBlock: dataView });

    if (isComplete) {
      this.onFileConfiguration(fileConfiguration!);
    } else {
      if (
        this.#isRequestingReceive ||
        (this.isClientConnectionType && !isSending)
      ) {
        const dataView = new DataView(new ArrayBuffer(4));
        dataView.setUint32(0, bytesReceived, true);
        _console.log("sending fileBytesTransferred", { bytesReceived });
        await this.sendMessage([
          { type: "fileBytesTransferred", data: dataView.buffer },
        ]);
      } else {
        _console.log("not sending fileBytesTransferred (not requesting)");
      }
    }
  }

  parseMessage(
    messageType: FileTransferMessageType,
    dataView: DataView<ArrayBuffer>,
    isSending?: boolean,
  ) {
    _console.log({ messageType, isSending }, dataView);

    switch (messageType) {
      case "getFileTypes":
        this.#parseFileTypes(dataView, isSending);
        break;
      case "maxFileLength":
        this.#parseMaxLength(dataView, isSending);
        break;
      case "getFileType":
      case "setFileType":
        this.#parseType(dataView, isSending);
        break;
      case "getFileLength":
      case "setFileLength":
        this.#parseLength(dataView, isSending);
        break;
      case "getFileChecksum":
      case "setFileChecksum":
        this.#parseChecksum(dataView, isSending);
        break;
      case "fileTransferStatus":
        this.#parseStatus(dataView, isSending);
        break;
      case "getFileBlock":
        this.#parseFileBlock(dataView, isSending);
        break;
      case "fileBytesTransferred":
        this.#parseBytesTransferred(dataView, isSending);
        break;
      case "setFileBlock":
        this.#parseSentFileBlock(dataView, isSending);
        break;
      case "setFileTransferCommand":
        this.#parseFileTransferCommand(dataView);
        break;
      default:
        throw Error(`uncaught messageType ${messageType}`);
    }
  }

  #file: FileOrBlob | undefined;
  async send(type: FileType, file: FileLike, includesHeader?: boolean) {
    _console.log("send", { type, includesHeader }, file);
    if (true) {
      this.#assertIsIdle();
      this.#assertValidType(type);
    } else {
      if (this.status != "idle") {
        _console.warn(`cannot send file - status is ${this.status}`);
        return false;
      }
      if (!this.#isValidType(type)) {
        _console.warn(`invalid fileType ${type}`);
        return false;
      }
    }

    let fileBufferWithHeader = await getFileBuffer(file);
    let fileBuffer: ArrayBuffer;
    let headerLength: number;
    if (includesHeader) {
      const fileDataView = new DataView(fileBufferWithHeader);

      let offset = 0;
      headerLength = fileDataView.getUint16(offset, true);
      _console.log({ headerLength });
      // offset += 2; // headerLength includes "headerLength" itself

      offset += headerLength;
      fileBuffer = fileBufferWithHeader.slice(offset);
    } else {
      headerLength = 2;
      fileBuffer = fileBufferWithHeader;
      fileBufferWithHeader = concatenateArrayBuffers(
        emptyHeaderDataView.buffer,
        fileBuffer,
      );
    }
    this.#headerLength = headerLength;

    _console.log({
      fileBufferWithHeader,
      fileBuffer,
    });

    const fileLength = fileBuffer.byteLength;
    const checksum = crc32(fileBuffer);
    _console.log({ checksum, fileLength });
    this.#assertValidLength(fileLength);

    if (type != this.type) {
      _console.log("different fileTypes - sending");
    } else if (fileLength != this.length) {
      _console.log("different fileLengths - sending");
    } else if (checksum != this.checksum) {
      _console.log("different fileChecksums - sending");
    } else {
      _console.log("attempted sending similar file");
      // return false;
    }

    const promises: Promise<any>[] = [];

    this.#pendingBufferWithHeader = fileBufferWithHeader;

    promises.push(this.#setType(type, false));
    promises.push(this.#setLength(fileLength, false));
    promises.push(this.#setChecksum(checksum, false));
    promises.push(this.#setCommand("startSend", false));
    promises.push(this.waitForEvent("fileTransferStatus"));

    this.sendMessage();

    await Promise.all(promises);

    if (this.#pendingBufferWithHeader != fileBufferWithHeader) {
      _console.log("file uploaded early - exiting");
      return;
    }

    this.#pendingBufferWithHeader = undefined;

    if (this.#status != "sending") {
      _console.log(`status is not "sending" - not gonna send file`);
      return false;
    }

    if (this.#buffer) {
      _console.log("existing buffer");
      await this.cancel();
      return false;
    }
    if (this.#length != fileLength) {
      _console.log(
        `wrong fileLength - expected ${fileLength}, got ${this.#length}`,
      );
      await this.cancel();
      return false;
    }
    if (this.#checksum != checksum) {
      _console.log(
        `wrong checksum - expected ${checksum}, got ${this.#checksum}`,
      );
      await this.cancel();
      return false;
    }

    this.#file = this.#createFile(fileBufferWithHeader);

    await this.#send(
      this.isClientConnectionType ? fileBufferWithHeader : fileBuffer,
      fileBufferWithHeader,
    );

    return true;
  }

  #pendingBufferWithHeader?: ArrayBuffer;
  get pendingBufferWithHeader() {
    return this.#pendingBufferWithHeader;
  }
  onFileConfiguration!: OnFileConfigurationCallback;
  async onParseFile<T extends BaseFileConfiguration>(
    partialFileConfiguration: Partial<T>,
  ) {
    _console.log("onParseFile", partialFileConfiguration);
    _console.assertWithError(
      this.#type == partialFileConfiguration.fileType,
      `wrong fileType - expected "${this.#type}", received "${partialFileConfiguration.fileType}"`,
    );

    // TODO: - replace files (e.g. 2 spriteSheets with the same name or spriteSheetIndex)

    let fileConfiguration = this.getCurrentFileConfiguration();

    if (fileConfiguration) {
      _console.log("fileConfiguration - assigning", partialFileConfiguration);
      Object.assign(fileConfiguration, partialFileConfiguration);
    } else {
      _console.log("no fileConfiguration - checking #pendingBufferWithHeader");
      if (!this.#pendingBufferWithHeader) {
        _console.log("no pendingBuffer - skipping");
        return;
      }

      const file = this.#createFile(this.#pendingBufferWithHeader);
      const buffer = this.#pendingBufferWithHeader;
      this.#pendingBufferWithHeader = undefined;
      if (!file) {
        _console.error("no file defined");
        return;
      }

      const fileType = partialFileConfiguration.fileType!;
      const indirectly = false;

      fileConfiguration = {
        ...partialFileConfiguration,
        fileType,
        file,
        length: this.#length,
        checksum: this.#checksum,
        indirectly,
        buffer,
        direction: "sending",
      };
      this.fileConfigurations.push(fileConfiguration!);
    }
    fileConfiguration = fileConfiguration!;

    const { indirectly, fileType, file } = fileConfiguration!;
    _console.log("onParseFile", {
      fileConfiguration,
      indirectly,
    });
    const { direction } = fileConfiguration;
    this.#dispatchEvent("fileTransferComplete", {
      direction,
      fileType,
      file,
      indirectly,
      fileConfiguration,
    });
    if (direction == "receiving") {
      this.#dispatchEvent("fileReceived", {
        fileType,
        file,
        indirectly,
        fileConfiguration,
      });
    } else {
      this.#dispatchEvent("fileSent", {
        fileType,
        file,
        indirectly,
        fileConfiguration,
      });
    }
  }

  #buffer?: ArrayBuffer;
  #bufferWithHeader?: ArrayBuffer;
  #bytesTransferred = 0;
  get bytesTransferred() {
    return this.#bytesTransferred;
  }
  async #send(buffer: ArrayBuffer, bufferWithHeader: ArrayBuffer) {
    this.#buffer = buffer;
    this.#bufferWithHeader = bufferWithHeader;
    _console.log("#buffer", this.#buffer);
    return this.#sendBlock();
  }

  mtu!: number;
  async #sendBlock(): Promise<void> {
    if (this.status != "sending") {
      return;
    }
    if (this.#isCancelling) {
      _console.error("not sending block - busy cancelling");
      return;
    }
    if (!this.#buffer) {
      _console.log("can't send block - no buffer defined");
      return;
    }

    const buffer = this.#buffer;
    let offset = this.#bytesTransferred;

    _console.log("sending block", { buffer, offset, mtu: this.mtu });

    const slicedBuffer = buffer.slice(offset, offset + (this.mtu - 3 - 3));
    _console.log("slicedBuffer", slicedBuffer);
    const bytesLeft = buffer.byteLength - offset;

    const progress = 1 - bytesLeft / buffer.byteLength;
    _console.log(
      `sending bytes ${offset}-${offset + slicedBuffer.byteLength} of ${
        buffer.byteLength
      } bytes (currently ${progress * 100}%)`,
    );
    const isComplete = progress == 1;
    const fileType = this.type!;

    const file = this.#file!;
    const direction: FileTransferDirection = "sending";
    let fileConfiguration: ExtendedFileConfiguration | undefined;
    if (isComplete) {
      _console.log("finished sending buffer");

      fileConfiguration = {
        file,
        fileType,
        length: this.#length,
        checksum: this.#checksum,
        buffer: this.#bufferWithHeader!,
        direction,
      };
      _console.log("sent file directly", fileConfiguration);
      this.fileConfigurations.push(fileConfiguration);
    }

    this.#dispatchEvent("fileTransferProgress", {
      progress,
      fileType,
      direction,
      bytesTransferred: this.#bytesTransferred,
      isComplete,
      fileConfiguration,
      file: isComplete ? file : undefined,
    });

    if (!isComplete) {
      this.#bytesTransferred = offset + slicedBuffer.byteLength;
      await this.sendMessage([{ type: "setFileBlock", data: slicedBuffer }]);
    }
  }

  #createFile(buffer: ArrayBuffer) {
    let fileName = new Date().toLocaleString();
    switch (this.type) {
      case "tflite":
        fileName += ".tflite";
        break;
      case "wifiServerCert":
        fileName += "_server.crt";
        break;
      case "wifiServerKey":
        fileName += "_server.key";
        break;
    }

    let file: FileOrBlob;
    if (typeof File !== "undefined") {
      file = new File([buffer], fileName);
    } else {
      file = new Blob([buffer]);
    }

    const headerLength = new DataView(buffer).getUint16(0, true);
    const arrayBufferWithHeader = buffer;
    const arrayBuffer = arrayBufferWithHeader.slice(headerLength);
    const checksum = crc32(arrayBuffer);
    _console.log({
      arrayBufferWithHeader,
      arrayBuffer,
      checksum,
      headerLength,
    });

    if (checksum != this.#checksum) {
      _console.error(
        `wrong checksum - expected ${this.#checksum}, got ${checksum}`,
      );
      return;
    }
    _console.log("created file", file);
    return file;
  }

  #indirectSentBlocks: DataView<ArrayBuffer>[] = [];
  get indirectSentBlocks() {
    return this.#indirectSentBlocks;
  }
  fileConfigurations: ExtendedFileConfiguration[] = [];
  getCurrentFileConfiguration() {
    const currentFileConfiguration = this.fileConfigurations.find(
      ({ fileType, checksum, length }) => {
        return (
          fileType == this.type &&
          checksum == this.checksum &&
          length == this.length
        );
      },
    );
    _console.log(
      "currentFileConfiguration",
      currentFileConfiguration,
      this.fileConfigurations,
    );
    return currentFileConfiguration;
  }
  #headerLength?: number;
  get headerLength() {
    return this.#headerLength;
  }
  async #parseSentFileBlock(
    dataView: DataView<ArrayBuffer>,
    isSending?: boolean,
  ) {
    _console.log("parseFileBlock", dataView, { isSending });
    if (!isSending) {
      return;
    }

    if (this.#indirectSentBlocks.length == 0) {
      const headerLength = dataView.getUint16(0, true);
      _console.log({ headerLength });
      this.#headerLength = headerLength;
    }

    this.#indirectSentBlocks.push(dataView);

    const bytesReceived = this.#indirectSentBlocks.reduce(
      (sum, dataView) => (sum += dataView.byteLength),
      0,
    );
    this.#bytesTransferred = bytesReceived;
    const lengthPlusHeader = this.#length + (this.headerLength ?? 0);
    const progress = bytesReceived / lengthPlusHeader;
    const isComplete = progress == 1;

    _console.log(
      `sent ${bytesReceived}/${lengthPlusHeader} bytes indirectly (${progress * 100}%) - ${
        lengthPlusHeader - bytesReceived
      } bytes remaining`,
    );

    let file: FileOrBlob | undefined;
    const fileType = this.type!;
    const indirectly = true;

    const bufferWithHeader = concatenateArrayBuffers(
      this.#indirectSentBlocks.map((dataView) => dataView.buffer),
    );

    if (isComplete) {
      file = this.#createFile(bufferWithHeader);
      _console.assertWithError(file, "file not created");
      _console.log("file transfer complete", file);
    }

    const direction: FileTransferDirection = "sending";

    let fileConfiguration: ExtendedFileConfiguration | undefined;
    if (isComplete) {
      this.#indirectSentBlocks.length = 0;
      file = file!;

      fileConfiguration = {
        file,
        fileType,
        length: this.#length,
        checksum: this.#checksum,
        indirectly,
        buffer: bufferWithHeader,
        direction,
      };
      const currentSentFileConfiguration = this.getCurrentFileConfiguration();
      if (currentSentFileConfiguration) {
        _console.log(
          "replacing currentSentFileConfiguration...",
          currentSentFileConfiguration,
        );
        this.fileConfigurations.splice(
          this.fileConfigurations.indexOf(currentSentFileConfiguration),
          1,
        );
      }
      this.fileConfigurations.push(fileConfiguration);
      _console.log("sent file indirectly", fileConfiguration);
    }

    this.#dispatchEvent("fileTransferProgress", {
      isComplete,
      progress,
      fileType,
      direction,
      bytesTransferred: this.#bytesTransferred,
      indirectly,
      file,
      fileConfiguration,
    });
    this.#dispatchEvent("setFileBlock", { fileTransferBlock: dataView });
  }

  async #parseBytesTransferred(
    dataView: DataView<ArrayBuffer>,
    isSending?: boolean,
  ) {
    _console.log("parseBytesTransferred", dataView);
    const bytesTransferred = dataView.getUint32(0, true);
    _console.log({ bytesTransferred });
    this.#dispatchEvent("fileBytesTransferred", { bytesTransferred });
    if (isSending) {
      _console.log("skipping parseBytesTransferred (isSending)");
      return;
    }
    // if (bytesTransferred == this.#bytesTransferred) {
    //   _console.log("finished");
    //   this.#sendBlock();
    //   return;
    // }
    if (this.status != "sending") {
      _console.log(
        "skipping parseBytesTransferred (not currently sending file)",
      );
      return;
    }
    if (!this.#buffer) {
      _console.log("skipping parseBytesTransferred (no buffer defined)");
      return;
    }
    if (this.#bytesTransferred != bytesTransferred) {
      _console.error(
        `bytesTransferred are not equal - got ${bytesTransferred}, expected ${
          this.#bytesTransferred
        }`,
      );
      this.cancel();
      return;
    }
    this.#sendBlock();
  }

  #isRequestingReceive = false;
  async receive(type: FileType) {
    this.#assertIsIdle();

    this.#assertValidType(type);

    // TODO: - return false if failed

    this.#isRequestingReceive = true;
    await this.#setType(type);
    await this.#setCommand("startReceive");
    return true;
  }

  #isCancelling = false;
  async cancel() {
    this.#assertIsNotIdle();
    _console.log("cancelling file transfer...");
    this.#isCancelling = true;
    await this.#setCommand("cancel");
  }

  requestRequiredInformation() {
    _console.log("requesting required fileTransfer information");
    const messages = RequiredFileTransferMessageTypes.map((messageType) => ({
      type: messageType,
    }));
    this.sendMessage(messages, false);
  }

  clear() {
    this.#receivedBlocks.length = 0;
    this.#indirectSentBlocks.length = 0;
    this.fileConfigurations.length = 0;
    this.#isCancelling = false;
    this.#buffer = undefined;
    this.#bufferWithHeader = undefined;
    this.#bytesTransferred = 0;
    this.#checksum = 0;
    this.#fileTypes.length = 0;
    this.#type = undefined;
    this.#length = 0;
    this.#checksum = 0;
    this.#status = "idle";
    // @ts-expect-error
    this.mtu = undefined;
    this.#file = undefined;
    this.#isRequestingReceive = false;
    this.#headerLength = undefined;
    this.#pendingBufferWithHeader = undefined;
  }

  connectionType?: ConnectionType;
  get isClientConnectionType() {
    return this.connectionType == "client";
  }
}

export default FileTransferManager;
