import { sliceDataView } from "./ArrayBufferUtils";
import { createConsole } from "./Console";
import { textDecoder } from "./Text";

const _console = createConsole("ParseUtils", { log: true });

/**
 * @param {DataView} dataView
 * @param {number} byteOffset
 */
export function parseStringFromDataView(dataView, byteOffset = 0) {
    const stringLength = dataView.getUint8(byteOffset++);
    const string = textDecoder.decode(
        dataView.buffer.slice(dataView.byteOffset + byteOffset, dataView.byteOffset + byteOffset + stringLength)
    );
    byteOffset += stringLength;
    return { string, byteOffset };
}

/**
 * @callback ParseMessageCallback
 * @param {string} messageType
 * @param {DataView} dataView
 */

/**
 * @param {DataView} dataView
 * @param {string[]} enumeration
 * @param {ParseMessageCallback} callback
 * @param {Object?} context
 * @param {boolean} parseMessageLengthAsUint16
 */
export function parseMessage(dataView, enumeration, callback, context, parseMessageLengthAsUint16 = false) {
    let byteOffset = 0;
    while (byteOffset < dataView.byteLength) {
        const messageTypeEnum = dataView.getUint8(byteOffset++);
        const messageType = enumeration[messageTypeEnum];

        /** @type {number} */
        let messageLength;
        if (parseMessageLengthAsUint16) {
            messageLength = dataView.getUint16(byteOffset, true);
            byteOffset += 2;
        } else {
            messageLength = dataView.getUint8(byteOffset++);
        }

        _console.log({ messageTypeEnum, messageType, messageLength, dataView, byteOffset });
        _console.assertWithError(messageType, `invalid messageTypeEnum ${messageTypeEnum}`);

        const _dataView = sliceDataView(dataView, byteOffset, messageLength);
        _console.log({ _dataView });

        callback(messageType, _dataView, context);

        byteOffset += messageLength;
    }
}
