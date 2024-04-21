import { createConsole } from "./utils/Console";

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

class FileTransferManager {
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

    /** @type {FileType[]} */
    static #Types = ["tflite"];
    static get Types() {
        return this.#Types;
    }
    get types() {
        return FileTransferManager.Types;
    }
    /** @param {FileType} type */
    assertValidType(type) {
        _console.assertEnumWithError(type, this.types);
    }
    /** @param {number} typeEnum */
    assertValidTypeEnum(typeEnum) {
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
    assertValidStatusEnum(statusEnum) {
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
    assertValidCommand(command) {
        _console.assertEnumWithError(command, this.commands);
    }

    /** @param {FileLike} file */
    static async GetFileBuffer(file) {
        let fileBuffer;
        if (file instanceof Array) {
            fileBuffer = file;
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

    #maxLength = 0;
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
    assertValidLength(length) {
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
        this.assertValidTypeEnum(typeEnum);
        const type = this.types[typeEnum];
        _console.log({ type });
        this.#type = type;
    }
    /** @param {FileType} newType */
    async #setType(newType) {
        this.assertValidType(newType);
        if (this.type == newType) {
            _console.log(`redundant type assignment ${newType}`);
            return;
        }

        // FILL
    }

    #length = 0;
    get length() {
        return this.#length;
    }
    /** @param {DataView} dataView */
    #parseLength(dataView) {
        _console.log("parseFileLength", dataView);
        const length = dataView.getUint32(0, true);
        _console.log(`length: ${length}kB`);
        this.#length = length;
    }
    /** @param {number} newLength */
    async #setLength(newLength) {
        _console.assertTypeWithError(newLength, "number");
        this.assertValidLength(newLength);
        if (this.length == newLength) {
            _console.log(`redundant length assignment ${newLength}`);
            return;
        }

        // FILL
    }

    #checksum = 0;
    get checksum() {
        return this.#checksum;
    }
    /** @param {DataView} dataView */
    #parseChecksum(dataView) {
        _console.log("checksum", dataView);
        const checksum = dataView.getUint32(0, true);
        _console.log({ checksum });
        this.#checksum = checksum;
    }
    /** @param {number} newChecksum */
    async #setChecksum(newChecksum) {
        _console.assertTypeWithError(newLength, "number");
        if (this.checksum == newChecksum) {
            _console.log(`redundant checksum assignment ${newChecksum}`);
            return;
        }

        // FILL
    }

    /** @param {FileTransferCommand} command */
    sendCommand(command) {
        this.assertValidCommand(command);

        // FILL
    }

    /** @type {FileTransferStatus} */
    #status;
    get status() {
        return this.#status;
    }
    /** @param {DataView} dataView */
    #parseStatus(dataView) {
        _console.log("parseFileStatus", dataView);
        const statusEnum = dataView.getUint8(0);
        this.assertValidStatusEnum(statusEnum);
        const status = this.statuses[statusEnum];
        _console.log({ status });
        this.#status = status;
    }

    /** @param {DataView} dataView */
    #parseBlock(dataView) {
        _console.log("parseFileBlock", dataView);
        // FILL
    }

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

    /**
     * @param {FileType} type
     * @param {FileLike} file
     */
    sendFile(type, file) {
        this.assertValidType(type);
        // FILL
    }

    /** @param {FileType} type */
    receiveFile(type) {
        this.assertValidType(type);
        // FILL
    }

    /** @type {SendMessageCallback} */
    sendMessage;
}

export default FileTransferManager;
