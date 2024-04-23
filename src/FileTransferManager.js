import { createConsole } from "./utils/Console.js";
import { crc32 } from "./utils/checksum.js";
import EventDispatcher from "./utils/EventDispatcher.js";

const _console = createConsole("FileTransferManager", { log: true });

/**
 * @typedef { "maxFileLength" |
 * "getFileTransferType" |
 * "setFileTransferType" |
 * "getFileLength" |
 * "setFileLength" |
 * "getFileChecksum" |
 * "setFileChecksum" |
 * "setFileTransferCommand" |
 * "fileTransferStatus" |
 * "getFileTransferBlock" |
 * "setFileTransferBlock"
 * } FileTransferMessageType
 */

/** @typedef {"tflite"} FileType */
/** @typedef {"idle" | "sending" | "receiving"} FileTransferStatus */
/** @typedef {"startReceive" | "startSend" | "cancel"} FileTransferCommand */

/** @typedef {number[] | ArrayBuffer | DataView | URL | string | File} FileLike */

/**
 * @callback SendMessageCallback
 * @param {FileTransferMessageType} messageType
 * @param {DataView|ArrayBuffer} data
 */

/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherListener} EventDispatcherListener */
/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherOptions} EventDispatcherOptions */

/** @typedef {FileTransferMessageType | "fileTransferProgress" | "fileTransferComplete" | "fileReceived"} FileTransferManagerEventType */

/**
 * @typedef FileTransferManagerEvent
 * @type {Object}
 * @property {FileTransferManager} target
 * @property {FileTransferManagerEventType} type
 * @property {Object} message
 */

/** @typedef {(event: FileTransferManagerEvent) => void} FileTransferManagerEventListener */

class FileTransferManager {
    // MESSAGE TYPES

    /** @type {FileTransferMessageType[]} */
    static #MessageTypes = [
        "maxFileLength",
        "getFileTransferType",
        "setFileTransferType",
        "getFileLength",
        "setFileLength",
        "getFileChecksum",
        "setFileChecksum",
        "setFileTransferCommand",
        "fileTransferStatus",
        "getFileTransferBlock",
        "setFileTransferBlock",
    ];
    static get MessageTypes() {
        return this.#MessageTypes;
    }
    get messageTypes() {
        return FileTransferManager.MessageTypes;
    }

    // EVENT DISPATCHER

    /** @type {FileTransferManagerEventType[]} */
    static #EventTypes = [...this.#MessageTypes, "fileTransferProgress", "fileTransferComplete", "fileReceived"];
    static get EventTypes() {
        return this.#EventTypes;
    }
    get eventTypes() {
        return FileTransferManager.#EventTypes;
    }
    /** @type {EventDispatcher} */
    eventDispatcher;

    /**
     * @param {FileTransferManagerEventType} type
     * @param {FileTransferManagerEventListener} listener
     * @param {EventDispatcherOptions} options
     */
    addEventListener(type, listener, options) {
        this.eventDispatcher.addEventListener(type, listener, options);
    }

    /**
     * @param {FileTransferManagerEvent} event
     */
    #dispatchEvent(event) {
        this.eventDispatcher.dispatchEvent(event);
    }

    /**
     * @param {FileTransferManagerEventType} type
     * @param {FileTransferManagerEventListener} listener
     */
    removeEventListener(type, listener) {
        return this.eventDispatcher.removeEventListener(type, listener);
    }

    /** @param {FileTransferManagerEventType} eventType */
    #waitForEvent(eventType) {
        return new Promise((resolve) => {
            this.addEventListener(
                eventType,
                () => {
                    resolve();
                },
                { once: true }
            );
        });
    }

    // PROPERTIES

    /** @type {FileType[]} */
    static #Types = ["tflite"];
    static get Types() {
        return this.#Types;
    }
    get types() {
        return FileTransferManager.Types;
    }
    /** @param {FileType} type */
    #assertValidType(type) {
        _console.assertEnumWithError(type, this.types);
    }
    /** @param {number} typeEnum */
    #assertValidTypeEnum(typeEnum) {
        _console.assertWithError(this.types[typeEnum], `invalid typeEnum ${typeEnum}`);
    }

    /** @type {FileTransferStatus[]} */
    static #Statuses = ["idle", "sending", "receiving"];
    static get Statuses() {
        return this.#Statuses;
    }
    get statuses() {
        return FileTransferManager.Statuses;
    }
    /** @param {number} statusEnum */
    #assertValidStatusEnum(statusEnum) {
        _console.assertWithError(this.statuses[statusEnum], `invalid statusEnum ${statusEnum}`);
    }

    /** @type {FileTransferCommand[]} */
    static #Commands = ["startSend", "startReceive", "cancel"];
    static get Commands() {
        return this.#Commands;
    }
    get commands() {
        return FileTransferManager.Commands;
    }
    /** @param {FileTransferCommand} command */
    #assertValidCommand(command) {
        _console.assertEnumWithError(command, this.commands);
    }

    /** @param {FileLike} file */
    static async GetFileBuffer(file) {
        let fileBuffer;
        if (file instanceof Array) {
            fileBuffer = Uint8Array.from(file);
        } else if (file instanceof DataView) {
            fileBuffer = file.buffer;
        } else if (typeof file == "string" || file instanceof URL) {
            const response = await fetch(file);
            fileBuffer = await response.arrayBuffer();
        } else if (file instanceof File) {
            fileBuffer = await file.arrayBuffer();
        } else if (file instanceof ArrayBuffer) {
            fileBuffer = file;
        } else {
            throw { error: "invalid file type", file };
        }
        return fileBuffer;
    }
    async getFileBuffer(file) {
        return FileTransferManager.GetFileBuffer(file);
    }

    static #MaxLength = 50 * 1024; // 50kB
    static get MaxLength() {
        return this.#MaxLength;
    }
    #maxLength = FileTransferManager.MaxLength;
    /** kB */
    get maxLength() {
        return this.#maxLength;
    }
    /** @param {DataView} dataView */
    #parseMaxLength(dataView) {
        _console.log("parseFileMaxLength", dataView);
        const maxLength = dataView.getUint32(0, true);
        _console.log(`maxLength: ${maxLength}kB`);
        this.#maxLength = maxLength;
    }
    /** @param {number} length */
    #assertValidLength(length) {
        _console.assertWithError(
            length <= this.maxLength,
            `file length ${length}kB too large - must be ${this.maxLength}kB or less`
        );
    }

    /** @type {FileType?} */
    #type;
    get type() {
        return this.#type;
    }
    /** @param {DataView} dataView */
    #parseType(dataView) {
        _console.log("parseFileType", dataView);
        const typeEnum = dataView.getUint8(0);
        this.#assertValidTypeEnum(typeEnum);
        const type = this.types[typeEnum];
        this.#updateType(type);
    }
    /** @param {FileType} type */
    #updateType(type) {
        _console.log({ type });
        this.#type = type;
        this.#dispatchEvent({ type: "getFileTransferType", message: { fileType: type } });
    }
    /** @param {FileType} newType */
    async #setType(newType) {
        this.#assertValidType(newType);
        if (this.type == newType) {
            _console.log(`redundant type assignment ${newType}`);
            return;
        }

        const promise = this.#waitForEvent("getFileTransferType");

        const typeEnum = this.types.indexOf(newType);
        this.sendMessage("setFileTransferType", Uint8Array.from([typeEnum]));

        await promise;
    }

    #length = 0;
    get length() {
        return this.#length;
    }
    /** @param {DataView} dataView */
    #parseLength(dataView) {
        _console.log("parseFileLength", dataView);
        const length = dataView.getUint32(0, true);

        this.#updateLength(length);
    }
    /** @param {number} length */
    #updateLength(length) {
        _console.log(`length: ${length}kB`);
        this.#length = length;
        this.#dispatchEvent({ type: "getFileLength", message: { fileLength: length } });
    }
    /** @param {number} newLength */
    async #setLength(newLength) {
        _console.assertTypeWithError(newLength, "number");
        this.#assertValidLength(newLength);
        if (this.length == newLength) {
            _console.log(`redundant length assignment ${newLength}`);
            return;
        }

        const promise = this.#waitForEvent("getFileLength");

        const dataView = new DataView(new ArrayBuffer(4));
        dataView.setUint32(0, newLength, true);
        this.sendMessage("setFileLength", dataView);

        await promise;
    }

    #checksum = 0;
    get checksum() {
        return this.#checksum;
    }
    /** @param {DataView} dataView */
    #parseChecksum(dataView) {
        _console.log("checksum", dataView);
        const checksum = dataView.getUint32(0, true);
        this.#updateChecksum(checksum);
    }
    /** @param {number} checksum */
    #updateChecksum(checksum) {
        _console.log({ checksum });
        this.#checksum = checksum;
        this.#dispatchEvent({ type: "getFileChecksum", message: { fileChecksum: checksum } });
    }
    /** @param {number} newChecksum */
    async #setChecksum(newChecksum) {
        _console.assertTypeWithError(newChecksum, "number");
        if (this.checksum == newChecksum) {
            _console.log(`redundant checksum assignment ${newChecksum}`);
            return;
        }

        const promise = this.#waitForEvent("getFileChecksum");

        const dataView = new DataView(new ArrayBuffer(4));
        dataView.setUint32(0, newChecksum, true);
        this.sendMessage("setFileChecksum", dataView);

        await promise;
    }

    /** @param {FileTransferCommand} command */
    async #setCommand(command) {
        this.#assertValidCommand(command);

        const promise = this.#waitForEvent("fileTransferStatus");

        const commandEnum = this.commands.indexOf(command);
        this.sendMessage("setFileTransferCommand", Uint8Array.from([commandEnum]));

        await promise;
    }

    /** @type {FileTransferStatus} */
    #status = "idle";
    get status() {
        return this.#status;
    }
    /** @param {DataView} dataView */
    #parseStatus(dataView) {
        _console.log("parseFileStatus", dataView);
        const statusEnum = dataView.getUint8(0);
        this.#assertValidStatusEnum(statusEnum);
        const status = this.statuses[statusEnum];
        this.#updateStatus(status);
    }
    /** @param {FileTransferStatus} status */
    #updateStatus(status) {
        _console.log({ status });
        this.#status = status;
        this.#dispatchEvent({ type: "fileTransferStatus", message: { fileTransferStatus: status } });
    }
    #assertIsIdle() {
        _console.assertWithError(this.#status == "idle", "status is not idle");
    }
    #assertIsNotIdle() {
        _console.assertWithError(this.#status != "idle", "status is idle");
    }

    // BLOCK

    /** @type {ArrayBuffer[]?} */
    #receivedBlocks;

    /** @param {DataView} dataView */
    async #parseBlock(dataView) {
        _console.log("parseFileBlock", dataView);
        this.#receivedBlocks.push(dataView.buffer);

        const bytesReceived = this.#receivedBlocks.reduce((sum, arrayBuffer) => (sum += arrayBuffer.byteLength), 0);
        const progress = bytesReceived / this.#length;

        _console.log(`received ${bytesReceived} of ${this.#length} bytes (${progress * 100}%)`);

        this.#dispatchEvent({ type: "fileTransferProgress", message: { progress } });

        if (bytesReceived != this.#length) {
            return;
        }

        _console.log("file transfer complete");

        let fileName = new Date().toLocaleString();
        switch (this.type) {
            case "tflite":
                fileName += ".tflite";
                break;
        }
        const file = new File(this.#receivedBlocks, fileName);

        const arrayBuffer = await file.arrayBuffer();
        const checksum = crc32(arrayBuffer);
        _console.log({ checksum });

        if (checksum != this.#checksum) {
            _console.error(`wrong checksum - expected ${this.#checksum}, got ${checksum}`);
            return;
        }

        console.log("received file", file);

        this.#dispatchEvent({ type: "fileTransferComplete", message: { direction: "receiving" } });
        this.#dispatchEvent({ type: "fileReceived", message: { file } });
    }

    // MESSAGE

    /**
     * @param {FileTransferMessageType} messageType
     * @param {DataView} dataView
     */
    parseMessage(messageType, dataView) {
        _console.log({ messageType });

        switch (messageType) {
            case "maxFileLength":
                this.#parseMaxLength(dataView);
                break;
            case "getFileTransferType":
                this.#parseType(dataView);
                break;
            case "getFileLength":
                this.#parseLength(dataView);
                break;
            case "getFileChecksum":
                this.#parseChecksum(dataView);
                break;
            case "fileTransferStatus":
                this.#parseStatus(dataView);
                break;
            case "getFileTransferBlock":
                this.#parseBlock(dataView);
                break;
            default:
                throw Error(`uncaught messageType ${messageType}`);
        }
    }

    // FILE TRANSFER

    /**
     * @param {FileType} type
     * @param {FileLike} file
     */
    async send(type, file) {
        this.#assertIsIdle();

        this.#assertValidType(type);
        const fileBuffer = await this.getFileBuffer(file);

        await this.#setType(type);
        const fileLength = fileBuffer.byteLength;
        await this.#setLength(fileLength);
        const checksum = crc32(fileBuffer);
        await this.#setChecksum(checksum);
        await this.#setCommand("startSend");

        await this.#send(fileBuffer);
    }

    /** @param {ArrayBuffer} buffer */
    async #send(buffer) {
        return this.#sendBlock(buffer);
    }

    #blockSize = 256;
    /**
     * @param {ArrayBuffer} buffer
     * @param {number} offset
     */
    async #sendBlock(buffer, offset = 0) {
        if (this.status != "sending") {
            return;
        }

        const slicedBuffer = buffer.slice(offset, offset + this.#blockSize);
        const bytesLeft = buffer.byteLength - offset;
        const progress = 1 - bytesLeft / buffer.byteLength;
        _console.log(
            `sending bytes ${offset}-${offset + slicedBuffer.byteLength} of ${buffer.byteLength} bytes (${
                progress * 100
            }%)`
        );
        this.#dispatchEvent({ type: "fileTransferProgress", message: { progress } });
        if (slicedBuffer.byteLength == 0) {
            _console.log("finished sending buffer");
            this.#dispatchEvent({ type: "fileTransferComplete", message: { direction: "sending" } });
        } else {
            await this.sendMessage("setFileTransferBlock", slicedBuffer);
            return this.#sendBlock(buffer, offset + slicedBuffer.byteLength);
        }
    }

    /** @param {FileType} type */
    async receive(type) {
        this.#assertIsIdle();

        this.#assertValidType(type);

        this.#receivedBlocks = [];

        await this.#setType(type);
        await this.#setCommand("startReceive");
    }

    async cancel() {
        this.#assertIsNotIdle();
        await this.#setCommand("cancel");
    }

    /** @type {SendMessageCallback} */
    sendMessage;
}

export default FileTransferManager;
