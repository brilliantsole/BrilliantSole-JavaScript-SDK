import { DisplayColorRGB } from "../DisplayManager.ts";
import { createConsole } from "./Console.ts";

const _console = createConsole("ColorUtils", { log: true });

export function hexToRGB(hex: string): DisplayColorRGB {
  hex = hex.replace(/^#/, "");

  if (hex.length == 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  _console.assertWithError(
    hex.length == 6,
    `hex length must be 6 (got ${hex.length})`
  );

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return { r, g, b };
}
