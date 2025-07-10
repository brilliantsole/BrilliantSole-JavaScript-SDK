import { createConsole } from "./Console.ts";
import { DisplayColorRGB } from "./DisplayUtils.ts";

const _console = createConsole("ColorUtils", { log: false });

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

const blackColor: DisplayColorRGB = { r: 0, g: 0, b: 0 };
export function colorNameToRGB(colorName: string): DisplayColorRGB {
  const temp = document.createElement("div");
  temp.style.color = colorName;
  document.body.appendChild(temp);

  const computedColor = getComputedStyle(temp).color;
  document.body.removeChild(temp);

  // Match "rgb(r, g, b)" or "rgba(r, g, b, a)"
  const match = computedColor.match(/^rgba?\((\d+), (\d+), (\d+)/);
  if (!match) return blackColor;

  return {
    r: parseInt(match[1], 10),
    g: parseInt(match[2], 10),
    b: parseInt(match[3], 10),
  };
}

export function stringToRGB(string: string): DisplayColorRGB {
  if (string.startsWith("#")) {
    return hexToRGB(string);
  } else {
    return colorNameToRGB(string);
  }
}

export function rgbToHex({ r, g, b }: DisplayColorRGB): string {
  const toHex = (value: number) =>
    value.toString(16).padStart(2, "0").toLowerCase();

  _console.assertWithError(
    [r, g, b].every((v) => v >= 0 && v <= 255),
    `RGB values must be between 0 and 255 (got r=${r}, g=${g}, b=${b})`
  );

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
