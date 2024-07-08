import { sliceDataView } from "./ArrayBufferUtils";
import { createConsole } from "./Console";
import { textDecoder } from "./Text";

const _console = createConsole("ParseUtils", { log: true });

export function parseStringFromDataView(dataView: DataView, byteOffset: number = 0) {
  const stringLength = dataView.getUint8(byteOffset++);
  const string = textDecoder.decode(
    dataView.buffer.slice(dataView.byteOffset + byteOffset, dataView.byteOffset + byteOffset + stringLength)
  );
  byteOffset += stringLength;
  return { string, byteOffset };
}

export type ParseMessageCallback = (messageType: string, dataView: DataView, context?: any) => void;

export function parseMessage(
  dataView: DataView,
  enumeration: string[],
  callback: ParseMessageCallback,
  context?: any,
  parseMessageLengthAsUint16: boolean = false
) {
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
