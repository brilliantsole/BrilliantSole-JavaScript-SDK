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

export function parseMessage<MessageType extends string>(
  dataView: DataView,
  messageTypes: readonly MessageType[],
  callback: (messageType: MessageType, dataView: DataView, context?: any) => void,
  context?: any,
  parseMessageLengthAsUint16: boolean = false
) {
  let byteOffset = 0;
  while (byteOffset < dataView.byteLength) {
    const messageTypeEnum = dataView.getUint8(byteOffset++);
    _console.assertWithError(messageTypeEnum in messageTypes, `invalid messageTypeEnum ${messageTypeEnum}`);
    const messageType = messageTypes[messageTypeEnum];

    let messageLength: number;
    if (parseMessageLengthAsUint16) {
      messageLength = dataView.getUint16(byteOffset, true);
      byteOffset += 2;
    } else {
      messageLength = dataView.getUint8(byteOffset++);
    }

    _console.log({ messageTypeEnum, messageType, messageLength, dataView, byteOffset });

    const _dataView = sliceDataView(dataView, byteOffset, messageLength);
    _console.log({ _dataView });

    callback(messageType, _dataView, context);

    byteOffset += messageLength;
  }
}
