import { createConsole } from "./Console";

const _console = createConsole("ArrayBufferUtils", { log: false });

const textEncoder = new TextEncoder();

/**
 * @param {...ArrayBuffer} arrayBuffers
 * @returns {ArrayBuffer}
 */
export function concatenateArrayBuffers(...arrayBuffers) {
    arrayBuffers = arrayBuffers.filter((arrayBuffer) => arrayBuffer != undefined || arrayBuffer != null);
    arrayBuffers = arrayBuffers.map((arrayBuffer) => {
        if (typeof arrayBuffer == "number") {
            const number = arrayBuffer;
            return Uint8Array.from([Math.floor(number)]);
        } else if (typeof arrayBuffer == "boolean") {
            const boolean = arrayBuffer;
            return Uint8Array.from([boolean ? 1 : 0]);
        } else if (typeof arrayBuffer == "string") {
            const string = arrayBuffer;
            return stringToArrayBuffer(string);
        } else if (arrayBuffer instanceof Array) {
            const array = arrayBuffer;
            return concatenateArrayBuffers(...array);
        } else if (arrayBuffer instanceof ArrayBuffer) {
            return arrayBuffer;
        } else if ("buffer" in arrayBuffer && arrayBuffer.buffer instanceof ArrayBuffer) {
            const bufferContainer = arrayBuffer;
            return bufferContainer.buffer;
        } else if (arrayBuffer instanceof DataView) {
            const dataView = arrayBuffer;
            return dataView.buffer;
        } else if (typeof arrayBuffer == "object") {
            const object = arrayBuffer;
            return objectToArrayBuffer(object);
        } else {
            return arrayBuffer;
        }
    });
    arrayBuffers = arrayBuffers.filter((arrayBuffer) => arrayBuffer && "byteLength" in arrayBuffer);
    const length = arrayBuffers.reduce((length, arrayBuffer) => length + arrayBuffer.byteLength, 0);
    const uint8Array = new Uint8Array(length);
    let byteOffset = 0;
    arrayBuffers.forEach((arrayBuffer) => {
        uint8Array.set(new Uint8Array(arrayBuffer), byteOffset);
        byteOffset += arrayBuffer.byteLength;
    });
    return uint8Array.buffer;
}

/** @param {Buffer} data */
export function dataToArrayBuffer(data) {
    return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
}

/** @param {String} string */
export function stringToArrayBuffer(string) {
    const encoding = textEncoder.encode(string);
    return concatenateArrayBuffers(encoding.byteLength, encoding);
}

/** @param {Object} object */
export function objectToArrayBuffer(object) {
    return stringToArrayBuffer(JSON.stringify(object));
}

/**
 * @param {DataView} dataView
 * @param {number} begin
 * @param {number?} length
 */
export function sliceDataView(dataView, begin, length) {
    let end;
    if (length) {
        end = dataView.byteOffset + begin + length;
    }
    _console.log({ dataView, begin, end, length });
    return new DataView(dataView.buffer.slice(dataView.byteOffset + begin, end));
}
