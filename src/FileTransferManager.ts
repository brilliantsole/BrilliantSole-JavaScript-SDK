import { createConsole } from "./utils/Console.ts";
import { crc32 } from "./utils/checksum.ts";
import { getFileBuffer } from "./utils/ArrayBufferUtils.ts";
import { FileLike } from "./utils/ArrayBufferUtils.ts";
import Device, { SendMessageCallback } from "./Device.ts";
import EventDispatcher from "./utils/EventDispatcher.ts";
import autoBind from "auto-bind";

const _console = createConsole("FileTransferManager", { log: false });

export const FileTransferMessageTypes = [
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

export const FileTypes = ["tflite", "wifiServerCert", "wifiServerKey"] as const;
export type FileType = (typeof FileTypes)[number];

export const FileTransferStatuses = ["idle", "sending", "receiving"] as const;
export type FileTransferStatus = (typeof FileTransferStatuses)[number];

export const FileTransferCommands = [
  "startSend",
  "startReceive",
  "cancel",
] as const;
export type FileTransferCommand = (typeof FileTransferCommands)[number];

export const FileTransferDirections = ["sending", "receiving"] as const;
export type FileTransferDirection = (typeof FileTransferDirections)[number];

export const FileTransferEventTypes = [
  ...FileTransferMessageTypes,
  "fileTransferProgress",
  "fileTransferComplete",
  "fileReceived",
] as const;
export type FileTransferEventType = (typeof FileTransferEventTypes)[number];

export interface FileTransferEventMessages {
  maxFileLength: { maxFileLength: number };
  getFileType: { fileType: FileType };
  getFileLength: { fileLength: number };
  getFileChecksum: { fileChecksum: number };
  fileTransferStatus: { fileTransferStatus: FileTransferStatus };
  getFileBlock: { fileTransferBlock: DataView };
  fileTransferProgress: { progress: number };
  fileTransferComplete: { direction: FileTransferDirection };
  fileReceived: { file: File | Blob };
}

export type FileTransferEventDispatcher = EventDispatcher<
  Device,
  FileTransferEventType,
  FileTransferEventMessages
>;
export type SendFileTransferMessageCallback =
  SendMessageCallback<FileTransferMessageType>;

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
    _console.assertEnumWithError(type, FileTypes);
  }
  #assertValidTypeEnum(typeEnum: number) {
    _console.assertWithError(
      typeEnum in FileTypes,
      `invalid typeEnum ${typeEnum}`
    );
  }

  #assertValidStatusEnum(statusEnum: number) {
    _console.assertWithError(
      statusEnum in FileTransferStatuses,
      `invalid statusEnum ${statusEnum}`
    );
  }
  #assertValidCommand(command: FileTransferCommand) {
    _console.assertEnumWithError(command, FileTransferCommands);
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
  #parseMaxLength(dataView: DataView) {
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
      `file length ${length}kB too large - must be ${this.maxLength}kB or less`
    );
  }

  #type: FileType | undefined;
  get type() {
    return this.#type;
  }
  #parseType(dataView: DataView) {
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
    if (this.type == newType) {
      _console.log(`redundant type assignment ${newType}`);
      return;
    }

    const promise = this.waitForEvent("getFileType");

    const typeEnum = FileTypes.indexOf(newType);
    this.sendMessage(
      [{ type: "setFileType", data: Uint8Array.from([typeEnum]).buffer }],
      sendImmediately
    );

    await promise;
  }

  #length = 0;
  get length() {
    return this.#length;
  }
  #parseLength(dataView: DataView) {
    _console.log("parseFileLength", dataView);
    const length = dataView.getUint32(0, true);

    this.#updateLength(length);
  }
  #updateLength(length: number) {
    _console.log(`length: ${length / 1024}kB`);
    this.#length = length;
    this.#dispatchEvent("getFileLength", { fileLength: length });
  }
  async #setLength(newLength: number, sendImmediately: boolean) {
    _console.assertTypeWithError(newLength, "number");
    this.#assertValidLength(newLength);
    if (this.length == newLength) {
      _console.log(`redundant length assignment ${newLength}`);
      return;
    }

    const promise = this.waitForEvent("getFileLength");

    const dataView = new DataView(new ArrayBuffer(4));
    dataView.setUint32(0, newLength, true);
    this.sendMessage(
      [{ type: "setFileLength", data: dataView.buffer }],
      sendImmediately
    );

    await promise;
  }

  #checksum = 0;
  get checksum() {
    return this.#checksum;
  }
  #parseChecksum(dataView: DataView) {
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
    if (this.checksum == newChecksum) {
      _console.log(`redundant checksum assignment ${newChecksum}`);
      return;
    }

    const promise = this.waitForEvent("getFileChecksum");

    const dataView = new DataView(new ArrayBuffer(4));
    dataView.setUint32(0, newChecksum, true);
    this.sendMessage(
      [{ type: "setFileChecksum", data: dataView.buffer }],
      sendImmediately
    );

    await promise;
  }

  async #setCommand(command: FileTransferCommand, sendImmediately?: boolean) {
    this.#assertValidCommand(command);

    const promise = this.waitForEvent("fileTransferStatus");
    _console.log(`setting command ${command}`);
    const commandEnum = FileTransferCommands.indexOf(command);
    this.sendMessage(
      [
        {
          type: "setFileTransferCommand",
          data: Uint8Array.from([commandEnum]).buffer,
        },
      ],
      sendImmediately
    );

    await promise;
  }

  #status: FileTransferStatus = "idle";
  get status() {
    return this.#status;
  }
  #parseStatus(dataView: DataView) {
    _console.log("parseFileStatus", dataView);
    const statusEnum = dataView.getUint8(0);
    this.#assertValidStatusEnum(statusEnum);
    const status = FileTransferStatuses[statusEnum];
    this.#updateStatus(status);
  }
  #updateStatus(status: FileTransferStatus) {
    _console.log({ status });
    this.#status = status;
    this.#dispatchEvent("fileTransferStatus", { fileTransferStatus: status });
    this.#receivedBlocks.length = 0;
    this.#isCancelling = false;
  }
  #assertIsIdle() {
    _console.assertWithError(this.#status == "idle", "status is not idle");
  }
  #assertIsNotIdle() {
    _console.assertWithError(this.#status != "idle", "status is idle");
  }

  // BLOCK

  #receivedBlocks: ArrayBuffer[] = [];

  async #parseBlock(dataView: DataView) {
    _console.log("parseFileBlock", dataView);
    this.#receivedBlocks.push(dataView.buffer);

    const bytesReceived = this.#receivedBlocks.reduce(
      (sum, arrayBuffer) => (sum += arrayBuffer.byteLength),
      0
    );
    const progress = bytesReceived / this.#length;

    _console.log(
      `received ${bytesReceived} of ${this.#length} bytes (${progress * 100}%)`
    );

    this.#dispatchEvent("fileTransferProgress", { progress });

    if (bytesReceived != this.#length) {
      const dataView = new DataView(new ArrayBuffer(4));
      dataView.setUint32(0, bytesReceived, true);

      if (this.isServerSide) {
        return;
      }
      await this.sendMessage([
        { type: "fileBytesTransferred", data: dataView.buffer },
      ]);
      return;
    }

    _console.log("file transfer complete");

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

    let file: File | Blob;
    if (typeof File !== "undefined") {
      file = new File(this.#receivedBlocks, fileName);
    } else {
      file = new Blob(this.#receivedBlocks);
    }

    const arrayBuffer = await file.arrayBuffer();
    const checksum = crc32(arrayBuffer);
    _console.log({ checksum });

    if (checksum != this.#checksum) {
      _console.error(
        `wrong checksum - expected ${this.#checksum}, got ${checksum}`
      );
      return;
    }

    _console.log("received file", file);

    this.#dispatchEvent("getFileBlock", { fileTransferBlock: dataView });
    this.#dispatchEvent("fileTransferComplete", { direction: "receiving" });
    this.#dispatchEvent("fileReceived", { file });
  }

  parseMessage(messageType: FileTransferMessageType, dataView: DataView) {
    _console.log({ messageType });

    switch (messageType) {
      case "maxFileLength":
        this.#parseMaxLength(dataView);
        break;
      case "getFileType":
      case "setFileType":
        this.#parseType(dataView);
        break;
      case "getFileLength":
      case "setFileLength":
        this.#parseLength(dataView);
        break;
      case "getFileChecksum":
      case "setFileChecksum":
        this.#parseChecksum(dataView);
        break;
      case "fileTransferStatus":
        this.#parseStatus(dataView);
        break;
      case "getFileBlock":
        this.#parseBlock(dataView);
        break;
      case "fileBytesTransferred":
        this.#parseBytesTransferred(dataView);
        break;
      default:
        throw Error(`uncaught messageType ${messageType}`);
    }
  }

  async send(type: FileType, file: FileLike) {
    this.#assertIsIdle();

    this.#assertValidType(type);
    const fileBuffer = await getFileBuffer(file);

    const promises: Promise<any>[] = [];

    promises.push(this.#setType(type, false));
    const fileLength = fileBuffer.byteLength;
    promises.push(this.#setLength(fileLength, false));
    const checksum = crc32(fileBuffer);
    promises.push(this.#setChecksum(checksum, false));
    promises.push(this.#setCommand("startSend", false));

    this.sendMessage();

    await Promise.all(promises);

    await this.#send(fileBuffer);
  }

  #buffer?: ArrayBuffer;
  #bytesTransferred = 0;
  async #send(buffer: ArrayBuffer) {
    this.#buffer = buffer;
    this.#bytesTransferred = 0;
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
      if (!this.isServerSide) {
        _console.error("no buffer defined");
      }
      return;
    }

    const buffer = this.#buffer;
    let offset = this.#bytesTransferred;

    const slicedBuffer = buffer.slice(offset, offset + (this.mtu - 3 - 3));
    _console.log("slicedBuffer", slicedBuffer);
    const bytesLeft = buffer.byteLength - offset;

    const progress = 1 - bytesLeft / buffer.byteLength;
    _console.log(
      `sending bytes ${offset}-${offset + slicedBuffer.byteLength} of ${
        buffer.byteLength
      } bytes (${progress * 100}%)`
    );
    this.#dispatchEvent("fileTransferProgress", { progress });
    if (slicedBuffer.byteLength == 0) {
      _console.log("finished sending buffer");
      this.#dispatchEvent("fileTransferComplete", { direction: "sending" });
    } else {
      await this.sendMessage([{ type: "setFileBlock", data: slicedBuffer }]);
      this.#bytesTransferred = offset + slicedBuffer.byteLength;
      //return this.#sendBlock(buffer, offset + slicedBuffer.byteLength);
    }
  }

  async #parseBytesTransferred(dataView: DataView) {
    _console.log("parseBytesTransferred", dataView);
    const bytesTransferred = dataView.getUint32(0, true);
    _console.log({ bytesTransferred });
    if (this.status != "sending") {
      _console.error(`not currently sending file`);
      return;
    }
    if (!this.isServerSide && this.#bytesTransferred != bytesTransferred) {
      _console.error(
        `bytesTransferred are not equal - got ${bytesTransferred}, expected ${
          this.#bytesTransferred
        }`
      );
      this.cancel();
      return;
    }
    this.#sendBlock();
  }

  async receive(type: FileType) {
    this.#assertIsIdle();

    this.#assertValidType(type);

    await this.#setType(type);
    await this.#setCommand("startReceive");
  }

  #isCancelling = false;
  async cancel() {
    this.#assertIsNotIdle();
    _console.log("cancelling file transfer...");
    this.#isCancelling = true;
    await this.#setCommand("cancel");
  }

  // SERVER SIDE
  #isServerSide = false;
  get isServerSide() {
    return this.#isServerSide;
  }
  set isServerSide(newIsServerSide) {
    if (this.#isServerSide == newIsServerSide) {
      _console.log("redundant isServerSide assignment");
      return;
    }
    _console.log({ newIsServerSide });
    this.#isServerSide = newIsServerSide;
  }
}

export default FileTransferManager;
