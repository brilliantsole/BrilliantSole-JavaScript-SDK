import { createConsole } from "./Console";

const _console = createConsole("checksum", { log: true });

// https://github.com/googlecreativelab/tiny-motion-trainer/blob/5fceb49f018ae0c403bf9f0ccc437309c2acb507/frontend/src/tf4micro-motion-kit/modules/bleFileTransfer#L195

// See http://home.thep.lu.se/~bjorn/crc/ for more information on simple CRC32 calculations.
export function crc32ForByte(r: number) {
  for (let j = 0; j < 8; ++j) {
    r = (r & 1 ? 0 : 0xedb88320) ^ (r >>> 1);
  }
  return r ^ 0xff000000;
}

const tableSize = 256;
const crc32Table = new Uint32Array(tableSize);
for (let i = 0; i < tableSize; ++i) {
  crc32Table[i] = crc32ForByte(i);
}

export function crc32(dataIterable: number[]) {
  let dataBytes = new Uint8Array(dataIterable);
  let crc = 0;
  for (let i = 0; i < dataBytes.byteLength; ++i) {
    const crcLowByte = crc & 0x000000ff;
    const dataByte = dataBytes[i];
    const tableIndex = crcLowByte ^ dataByte;
    // The last >>> is to convert this into an unsigned 32-bit integer.
    crc = (crc32Table[tableIndex] ^ (crc >>> 8)) >>> 0;
  }
  return crc;
}

// This is a small test function for the CRC32 implementation, not normally called but left in
// for debugging purposes. We know the expected CRC32 of [97, 98, 99, 100, 101] is 2240272485,
// or 0x8587d865, so if anything else is output we know there's an error in the implementation.
export function testCrc32() {
  const testArray = [97, 98, 99, 100, 101];
  const testArrayCrc32 = crc32(testArray);
  _console.log("CRC32 for [97, 98, 99, 100, 101] is 0x" + testArrayCrc32.toString(16) + " (" + testArrayCrc32 + ")");
}
