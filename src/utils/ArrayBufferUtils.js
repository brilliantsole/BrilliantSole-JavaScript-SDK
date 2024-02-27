/**
 * @param {...ArrayBuffer} arrayBuffers
 * @returns {ArrayBuffer}
 */
export function concatenateArrayBuffers(...arrayBuffers) {
    arrayBuffers = arrayBuffers.filter((arrayBuffer) => arrayBuffer);
    arrayBuffers = arrayBuffers.map((arrayBuffer) => {
        if (typeof arrayBuffer == "number") {
            return Uint8Array.from([Math.floor(arrayBuffer)]);
        } else if (arrayBuffer instanceof Array) {
            return Uint8Array.from(arrayBuffer).buffer;
        } else if (arrayBuffer instanceof ArrayBuffer) {
            return arrayBuffer;
        } else if ("buffer" in arrayBuffer && arrayBuffer.buffer instanceof ArrayBuffer) {
            return arrayBuffer.buffer;
        } else if (arrayBuffer instanceof DataView) {
            return arrayBuffer.buffer;
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
