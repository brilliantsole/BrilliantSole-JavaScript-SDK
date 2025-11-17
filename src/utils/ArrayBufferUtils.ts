import { createConsole } from "./Console.ts";
import { textEncoder } from "./Text.ts";

const _console = createConsole("ArrayBufferUtils", { log: false });

export function concatenateArrayBuffers(...arrayBuffers: any[]): ArrayBuffer {
  arrayBuffers = arrayBuffers.filter(
    (arrayBuffer) => arrayBuffer != undefined || arrayBuffer != null
  );
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
    } else if (
      "buffer" in arrayBuffer &&
      arrayBuffer.buffer instanceof ArrayBuffer
    ) {
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
  arrayBuffers = arrayBuffers.filter(
    (arrayBuffer) => arrayBuffer && "byteLength" in arrayBuffer
  );
  const length = arrayBuffers.reduce(
    (length, arrayBuffer) => length + arrayBuffer.byteLength,
    0
  );
  const uint8Array = new Uint8Array(length);
  let byteOffset = 0;
  arrayBuffers.forEach((arrayBuffer) => {
    uint8Array.set(new Uint8Array(arrayBuffer), byteOffset);
    byteOffset += arrayBuffer.byteLength;
  });
  return uint8Array.buffer;
}

export function dataToArrayBuffer(data: Buffer) {
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
}

export function stringToArrayBuffer(string: string) {
  const encoding = textEncoder.encode(string);
  return concatenateArrayBuffers(encoding.byteLength, encoding);
}

export function objectToArrayBuffer(object: object) {
  return stringToArrayBuffer(JSON.stringify(object));
}

export function sliceDataView(
  dataView: DataView,
  begin: number,
  length?: number
) {
  let end;
  if (length != undefined) {
    end = dataView.byteOffset + begin + length;
  }
  _console.log({ dataView, begin, end, length });
  return new DataView(dataView.buffer.slice(dataView.byteOffset + begin, end));
}

export type FileLike =
  | number[]
  | ArrayBuffer
  | DataView
  | URL
  | string
  | File
  | Buffer;

export async function getFileBuffer(file: FileLike) {
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
  } else if (file.buffer instanceof ArrayBuffer) {
    fileBuffer = file.buffer;
  } else {
    throw { error: "invalid file type", file };
  }
  return fileBuffer;
}

export function UInt8ByteBuffer(value: number) {
  return Uint8Array.from([value]).buffer;
}
