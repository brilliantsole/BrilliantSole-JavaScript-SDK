import { sliceDataView, valueToUInt8ArrayBuffer } from "./ArrayBufferUtils.ts";
import { createConsole } from "./Console.ts";
import { textDecoder } from "./Text.ts";

const _console = createConsole("ParseUtils", { log: false });

export function parseStringFromDataView(
  dataView: DataView<ArrayBuffer>,
  byteOffset: number = 0,
) {
  const stringLength = dataView.getUint8(byteOffset++);
  const string = textDecoder.decode(
    dataView.buffer.slice(
      dataView.byteOffset + byteOffset,
      dataView.byteOffset + byteOffset + stringLength,
    ),
  );
  byteOffset += stringLength;
  return { string, byteOffset };
}

export function parseMessage<MessageType extends string>(
  dataView: DataView<ArrayBuffer>,
  messageTypes: readonly MessageType[],
  callback: (
    messageType: MessageType,
    dataView: DataView<ArrayBuffer>,
    context?: any,
    isLast?: boolean,
  ) => void,
  context?: any,
  parseMessageLengthAsUint16: boolean = false,
) {
  let byteOffset = 0;
  while (byteOffset < dataView.byteLength) {
    const messageTypeEnum = dataView.getUint8(byteOffset++);
    _console.assertWithError(
      messageTypeEnum in messageTypes,
      `invalid messageTypeEnum ${messageTypeEnum}`,
    );
    const messageType = messageTypes[messageTypeEnum];

    let messageLength: number;
    if (parseMessageLengthAsUint16) {
      messageLength = dataView.getUint16(byteOffset, true);
      byteOffset += 2;
    } else {
      messageLength = dataView.getUint8(byteOffset++);
    }

    _console.log({
      messageTypeEnum,
      messageType,
      messageLength,
      dataView,
      byteOffset,
    });

    const _dataView = sliceDataView(dataView, byteOffset, messageLength);
    _console.log({ _dataView });

    byteOffset += messageLength;
    const isLast = byteOffset >= dataView.byteLength;
    callback(messageType, _dataView, context, isLast);
  }
}

export function enumToArrayBuffer<T extends string | number>(
  enumeration: readonly T[],
  value: T,
) {
  _console.assertEnumWithError(enumeration, value);
  const valueEnum = enumeration.indexOf(value);
  return valueToUInt8ArrayBuffer(valueEnum);
}
export function enumToDataView<T extends string | number>(
  enumeration: readonly T[],
  value: T,
) {
  return new DataView(enumToArrayBuffer(enumeration, value));
}

export function valueToUInt16DataView(value: number, littleEndian?: boolean) {
  const dataView = new DataView(new ArrayBuffer(2));
  dataView.setUint16(0, value, littleEndian);
  return dataView;
}

export function valueToUInt16ArrayBuffer(
  value: number,
  littleEndian?: boolean,
) {
  return valueToUInt16DataView(value, littleEndian).buffer;
}

export function valueToInt16DataView(value: number, littleEndian?: boolean) {
  const dataView = new DataView(new ArrayBuffer(2));
  dataView.setInt16(0, value, littleEndian);
  return dataView;
}

export function valueToInt16ArrayBuffer(value: number, littleEndian?: boolean) {
  return valueToInt16DataView(value, littleEndian).buffer;
}

export function valueToUInt32DataView(value: number, littleEndian?: boolean) {
  const dataView = new DataView(new ArrayBuffer(4));
  dataView.setUint32(0, value, littleEndian);
  return dataView;
}

export function valueToUInt32ArrayBuffer(
  value: number,
  littleEndian?: boolean,
) {
  return valueToUInt32DataView(value, littleEndian).buffer;
}
