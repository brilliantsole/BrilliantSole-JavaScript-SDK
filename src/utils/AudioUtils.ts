import { createConsole } from "./Console.ts";

const _console = createConsole("AudioUtils", { log: false });

export function float32ArrayToWav(
  audioData: Float32Array,
  sampleRate: number,
  numChannels: number
): Blob {
  const wavBuffer = encodeWAV(audioData, sampleRate, numChannels);
  return new Blob([wavBuffer], { type: "audio/wav" });
}

function encodeWAV(
  interleaved: Float32Array,
  sampleRate: number,
  numChannels: number
): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + interleaved.length * 2); // 44 bytes for WAV header
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, "RIFF");
  // File length minus RIFF identifier length and file description length
  view.setUint32(4, 36 + interleaved.length * 2, true);
  // RIFF type
  writeString(view, 8, "WAVE");
  // Format chunk identifier
  writeString(view, 12, "fmt ");
  // Format chunk length
  view.setUint32(16, 16, true);
  // Sample format (raw)
  view.setUint16(20, 1, true);
  // Channel count
  view.setUint16(22, numChannels, true);
  // Sample rate
  view.setUint32(24, sampleRate, true);
  // Byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * numChannels * 2, true);
  // Block align (channel count * bytes per sample)
  view.setUint16(32, numChannels * 2, true);
  // Bits per sample
  view.setUint16(34, 16, true);
  // Data chunk identifier
  writeString(view, 36, "data");
  // Data chunk length
  view.setUint32(40, interleaved.length * 2, true);

  // Write interleaved audio data
  for (let i = 0; i < interleaved.length; i++) {
    view.setInt16(44 + i * 2, interleaved[i] * 0x7fff, true); // Convert float [-1, 1] to int16
  }

  return buffer;
}

export function writeString(
  view: DataView,
  offset: number,
  string: string
): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
