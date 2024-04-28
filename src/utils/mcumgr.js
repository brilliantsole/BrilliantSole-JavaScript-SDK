/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2023 Laird Connectivity
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * @file mcumgr.js
 * @brief Provides MCU manager operation functions for the Xbit USB Shell.
 * This file is inspired by the MIT licensed mcumgr.js file originally
 * authored by Andras Barthazi (https://github.com/boogie/mcumgr-web),
 * updated to also support file upload/download over SMP.
 */

import { CBOR } from "./cbor.js";
import { createConsole } from "./Console.js";

const _console = createConsole("mcumgr", { log: true });

export const constants = {
    // Opcodes
    MGMT_OP_READ: 0,
    MGMT_OP_READ_RSP: 1,
    MGMT_OP_WRITE: 2,
    MGMT_OP_WRITE_RSP: 3,

    // Groups
    MGMT_GROUP_ID_OS: 0,
    MGMT_GROUP_ID_IMAGE: 1,
    MGMT_GROUP_ID_STAT: 2,
    MGMT_GROUP_ID_CONFIG: 3,
    MGMT_GROUP_ID_LOG: 4,
    MGMT_GROUP_ID_CRASH: 5,
    MGMT_GROUP_ID_SPLIT: 6,
    MGMT_GROUP_ID_RUN: 7,
    MGMT_GROUP_ID_FS: 8,
    MGMT_GROUP_ID_SHELL: 9,

    // OS group
    OS_MGMT_ID_ECHO: 0,
    OS_MGMT_ID_CONS_ECHO_CTRL: 1,
    OS_MGMT_ID_TASKSTAT: 2,
    OS_MGMT_ID_MPSTAT: 3,
    OS_MGMT_ID_DATETIME_STR: 4,
    OS_MGMT_ID_RESET: 5,

    // Image group
    IMG_MGMT_ID_STATE: 0,
    IMG_MGMT_ID_UPLOAD: 1,
    IMG_MGMT_ID_FILE: 2,
    IMG_MGMT_ID_CORELIST: 3,
    IMG_MGMT_ID_CORELOAD: 4,
    IMG_MGMT_ID_ERASE: 5,

    // Filesystem group
    FS_MGMT_ID_FILE: 0,
};

export class MCUManager {
    constructor() {
        this._mtu = 256;
        this._messageCallback = null;
        this._imageUploadProgressCallback = null;
        this._imageUploadNextCallback = null;
        this._fileUploadProgressCallback = null;
        this._fileUploadNextCallback = null;
        this._uploadIsInProgress = false;
        this._downloadIsInProgress = false;
        this._buffer = new Uint8Array();
        this._seq = 0;
    }

    onMessage(callback) {
        this._messageCallback = callback;
        return this;
    }

    onImageUploadNext(callback) {
        this._imageUploadNextCallback = callback;
        return this;
    }

    onImageUploadProgress(callback) {
        this._imageUploadProgressCallback = callback;
        return this;
    }

    onImageUploadFinished(callback) {
        this._imageUploadFinishedCallback = callback;
        return this;
    }

    onFileUploadNext(callback) {
        this._fileUploadNextCallback = callback;
        return this;
    }

    onFileUploadProgress(callback) {
        this._fileUploadProgressCallback = callback;
        return this;
    }

    onFileUploadFinished(callback) {
        this._fileUploadFinishedCallback = callback;
        return this;
    }

    onFileDownloadNext(callback) {
        this._fileDownloadNextCallback = callback;
        return this;
    }

    onFileDownloadProgress(callback) {
        this._fileDownloadProgressCallback = callback;
        return this;
    }

    onFileDownloadFinished(callback) {
        this._fileDownloadFinishedCallback = callback;
        return this;
    }

    _getMessage(op, group, id, data) {
        const _flags = 0;
        let encodedData = [];
        if (typeof data !== "undefined") {
            encodedData = [...new Uint8Array(CBOR.encode(data))];
        }
        const lengthLo = encodedData.length & 255;
        const lengthHi = encodedData.length >> 8;
        const groupLo = group & 255;
        const groupHi = group >> 8;
        const message = [op, _flags, lengthHi, lengthLo, groupHi, groupLo, this._seq, id, ...encodedData];
        this._seq = (this._seq + 1) % 256;

        return message;
    }

    _notification(buffer) {
        _console.log("mcumgr - message received");
        const message = new Uint8Array(buffer);
        this._buffer = new Uint8Array([...this._buffer, ...message]);
        const messageLength = this._buffer[2] * 256 + this._buffer[3];
        if (this._buffer.length < messageLength + 8) return;
        this._processMessage(this._buffer.slice(0, messageLength + 8));
        this._buffer = this._buffer.slice(messageLength + 8);
    }

    _processMessage(message) {
        const [op, , lengthHi, lengthLo, groupHi, groupLo, , id] = message;
        const data = CBOR.decode(message.slice(8).buffer);
        const length = lengthHi * 256 + lengthLo;
        const group = groupHi * 256 + groupLo;

        _console.log("mcumgr - Process Message - Group: " + group + ", Id: " + id + ", Off: " + data.off);
        if (group === constants.MGMT_GROUP_ID_IMAGE && id === constants.IMG_MGMT_ID_UPLOAD && data.off) {
            this._uploadOffset = data.off;
            this._uploadNext();
            return;
        }
        if (
            op === constants.MGMT_OP_WRITE_RSP &&
            group === constants.MGMT_GROUP_ID_FS &&
            id === constants.FS_MGMT_ID_FILE &&
            data.off
        ) {
            this._uploadFileOffset = data.off;
            this._uploadFileNext();
            return;
        }
        if (
            op === constants.MGMT_OP_READ_RSP &&
            group === constants.MGMT_GROUP_ID_FS &&
            id === constants.FS_MGMT_ID_FILE
        ) {
            this._downloadFileOffset += data.data.length;
            if (data.len != undefined) {
                this._downloadFileLength = data.len;
            }
            _console.log("downloaded " + this._downloadFileOffset + " bytes of " + this._downloadFileLength);
            if (this._downloadFileLength > 0) {
                this._fileDownloadProgressCallback({
                    percentage: Math.floor((this._downloadFileOffset / this._downloadFileLength) * 100),
                });
            }
            if (this._messageCallback) this._messageCallback({ op, group, id, data, length });
            this._downloadFileNext();
            return;
        }

        if (this._messageCallback) this._messageCallback({ op, group, id, data, length });
    }

    cmdReset() {
        return this._getMessage(constants.MGMT_OP_WRITE, constants.MGMT_GROUP_ID_OS, constants.OS_MGMT_ID_RESET);
    }

    smpEcho(message) {
        return this._getMessage(constants.MGMT_OP_WRITE, constants.MGMT_GROUP_ID_OS, constants.OS_MGMT_ID_ECHO, {
            d: message,
        });
    }

    cmdImageState() {
        return this._getMessage(constants.MGMT_OP_READ, constants.MGMT_GROUP_ID_IMAGE, constants.IMG_MGMT_ID_STATE);
    }

    cmdImageErase() {
        return this._getMessage(
            constants.MGMT_OP_WRITE,
            constants.MGMT_GROUP_ID_IMAGE,
            constants.IMG_MGMT_ID_ERASE,
            {}
        );
    }

    cmdImageTest(hash) {
        return this._getMessage(constants.MGMT_OP_WRITE, constants.MGMT_GROUP_ID_IMAGE, constants.IMG_MGMT_ID_STATE, {
            hash,
            confirm: false,
        });
    }

    cmdImageConfirm(hash) {
        return this._getMessage(constants.MGMT_OP_WRITE, constants.MGMT_GROUP_ID_IMAGE, constants.IMG_MGMT_ID_STATE, {
            hash,
            confirm: true,
        });
    }

    _hash(image) {
        return crypto.subtle.digest("SHA-256", image);
    }

    async _uploadNext() {
        if (this._uploadOffset >= this._uploadImage.byteLength) {
            this._uploadIsInProgress = false;
            this._imageUploadFinishedCallback();
            return;
        }

        const nmpOverhead = 8;
        const message = { data: new Uint8Array(), off: this._uploadOffset };
        if (this._uploadOffset === 0) {
            message.len = this._uploadImage.byteLength;
            message.sha = new Uint8Array(await this._hash(this._uploadImage));
        }
        this._imageUploadProgressCallback({
            percentage: Math.floor((this._uploadOffset / this._uploadImage.byteLength) * 100),
        });

        const length = this._mtu - CBOR.encode(message).byteLength - nmpOverhead;

        message.data = new Uint8Array(this._uploadImage.slice(this._uploadOffset, this._uploadOffset + length));

        this._uploadOffset += length;

        const packet = this._getMessage(
            constants.MGMT_OP_WRITE,
            constants.MGMT_GROUP_ID_IMAGE,
            constants.IMG_MGMT_ID_UPLOAD,
            message
        );

        _console.log("mcumgr - _uploadNext: Message Length: " + packet.length);

        this._imageUploadNextCallback({ packet });
    }
    async reset() {
        this._mtu = 256;
        this._messageCallback = null;
        this._imageUploadProgressCallback = null;
        this._imageUploadNextCallback = null;
        this._fileUploadProgressCallback = null;
        this._fileUploadNextCallback = null;
        this._uploadIsInProgress = false;
        this._downloadIsInProgress = false;
        this._buffer = new Uint8Array();
        this._seq = 0;
    }

    async cmdUpload(image, slot = 0) {
        if (this._uploadIsInProgress) {
            _console.error("Upload is already in progress.");
            return;
        }
        this._uploadIsInProgress = true;

        this._uploadOffset = 0;
        this._uploadImage = image;
        this._uploadSlot = slot;

        this._uploadNext();
    }

    async cmdUploadFile(filebuf, destFilename) {
        if (this._uploadIsInProgress) {
            _console.error("Upload is already in progress.");
            return;
        }
        this._uploadIsInProgress = true;
        this._uploadFileOffset = 0;
        this._uploadFile = filebuf;
        this._uploadFilename = destFilename;

        this._uploadFileNext();
    }

    async _uploadFileNext() {
        _console.log("uploadFileNext - offset: " + this._uploadFileOffset + ", length: " + this._uploadFile.byteLength);

        if (this._uploadFileOffset >= this._uploadFile.byteLength) {
            this._uploadIsInProgress = false;
            this._fileUploadFinishedCallback();
            return;
        }

        const nmpOverhead = 8;
        const message = { data: new Uint8Array(), off: this._uploadFileOffset };
        if (this._uploadFileOffset === 0) {
            message.len = this._uploadFile.byteLength;
        }
        message.name = this._uploadFilename;
        this._fileUploadProgressCallback({
            percentage: Math.floor((this._uploadFileOffset / this._uploadFile.byteLength) * 100),
        });

        const length = this._mtu - CBOR.encode(message).byteLength - nmpOverhead;

        message.data = new Uint8Array(this._uploadFile.slice(this._uploadFileOffset, this._uploadFileOffset + length));

        this._uploadFileOffset += length;

        const packet = this._getMessage(
            constants.MGMT_OP_WRITE,
            constants.MGMT_GROUP_ID_FS,
            constants.FS_MGMT_ID_FILE,
            message
        );

        _console.log("mcumgr - _uploadNext: Message Length: " + packet.length);

        this._fileUploadNextCallback({ packet });
    }

    async cmdDownloadFile(filename, destFilename) {
        if (this._downloadIsInProgress) {
            _console.error("Download is already in progress.");
            return;
        }
        this._downloadIsInProgress = true;
        this._downloadFileOffset = 0;
        this._downloadFileLength = 0;
        this._downloadRemoteFilename = filename;
        this._downloadLocalFilename = destFilename;

        this._downloadFileNext();
    }

    async _downloadFileNext() {
        if (this._downloadFileLength > 0) {
            if (this._downloadFileOffset >= this._downloadFileLength) {
                this._downloadIsInProgress = false;
                this._fileDownloadFinishedCallback();
                return;
            }
        }

        const message = { off: this._downloadFileOffset };
        if (this._downloadFileOffset === 0) {
            message.name = this._downloadRemoteFilename;
        }

        const packet = this._getMessage(
            constants.MGMT_OP_READ,
            constants.MGMT_GROUP_ID_FS,
            constants.FS_MGMT_ID_FILE,
            message
        );
        _console.log("mcumgr - _downloadNext: Message Length: " + packet.length);
        this._fileDownloadNextCallback({ packet });
    }

    async imageInfo(image) {
        const info = {};
        const view = new Uint8Array(image);

        // check header length
        if (view.length < 32) {
            throw new Error("Invalid image (too short file)");
        }

        // check MAGIC bytes 0x96f3b83d
        if (view[0] !== 0x3d || view[1] !== 0xb8 || view[2] !== 0xf3 || view[3] !== 0x96) {
            throw new Error("Invalid image (wrong magic bytes)");
        }

        // check load address is 0x00000000
        if (view[4] !== 0x00 || view[5] !== 0x00 || view[6] !== 0x00 || view[7] !== 0x00) {
            throw new Error("Invalid image (wrong load address)");
        }

        const headerSize = view[8] + view[9] * 2 ** 8;

        // check protected TLV area size is 0
        if (view[10] !== 0x00 || view[11] !== 0x00) {
            throw new Error("Invalid image (wrong protected TLV area size)");
        }

        const imageSize = view[12] + view[13] * 2 ** 8 + view[14] * 2 ** 16 + view[15] * 2 ** 24;
        info.imageSize = imageSize;

        // check image size is correct
        if (view.length < imageSize + headerSize) {
            throw new Error("Invalid image (wrong image size)");
        }

        // check flags is 0x00000000
        if (view[16] !== 0x00 || view[17] !== 0x00 || view[18] !== 0x00 || view[19] !== 0x00) {
            throw new Error("Invalid image (wrong flags)");
        }

        const version = `${view[20]}.${view[21]}.${view[22] + view[23] * 2 ** 8}`;
        info.version = version;

        info.hash = [...new Uint8Array(await this._hash(image.slice(0, imageSize + 32)))]
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");

        return info;
    }
}
