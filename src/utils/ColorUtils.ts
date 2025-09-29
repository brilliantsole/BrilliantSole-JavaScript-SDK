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

export const blackColor: DisplayColorRGB = { r: 0, g: 0, b: 0 };
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

export function colorDistanceSq(
  a: DisplayColorRGB,
  b: DisplayColorRGB
): number {
  return (a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2;
}

export interface KMeansOptions {
  useInputColors?: boolean; // pick nearest input or average
  maxIterations?: number;
}
export const defaultKMeansOptions: KMeansOptions = {
  useInputColors: true,
  maxIterations: 20,
};

export interface KMeansResult {
  palette: string[]; // reduced colors
  mapping: Record<string, number>; // original -> palette index
}

export function kMeansColors(
  colors: string[],
  k: number,
  options?: KMeansOptions
): KMeansResult {
  _console.assertTypeWithError(k, "number");
  _console.assertWithError(k > 0, `invalid k ${k}`);
  options = { ...defaultKMeansOptions, ...options };
  const maxIter = options.maxIterations!;
  const useInputColors = options.useInputColors!;

  // cache parsed colors
  const colorMap = new Map<string, DisplayColorRGB>();
  for (const c of colors) {
    if (!colorMap.has(c)) {
      colorMap.set(c, stringToRGB(c));
    }
  }

  const uniqueColors = Array.from(colorMap.values());
  const uniqueKeys = Array.from(colorMap.keys());

  //_console.log({ uniqueColors, uniqueKeys });

  if (uniqueColors.length <= k) {
    const mapping: Record<string, number> = {};
    uniqueKeys.forEach((key, idx) => (mapping[key] = idx));
    return { palette: uniqueKeys, mapping };
  }

  // Initialize centroids
  let centroids: DisplayColorRGB[] = uniqueColors.slice(0, k);

  for (let iter = 0; iter < maxIter; iter++) {
    const clusters: number[][] = Array.from({ length: k }, () => []);
    //_console.log({ clusters, k });
    uniqueColors.forEach((p, idx) => {
      let best = 0;
      let bestDist = Infinity;
      centroids.forEach((c, ci) => {
        const d = colorDistanceSq(p, c);
        if (d < bestDist) {
          bestDist = d;
          best = ci;
        }
      });
      clusters[best].push(idx);
    });

    centroids = clusters.map((cluster) => {
      if (cluster.length === 0) return { ...blackColor };
      if (useInputColors) {
        let bestIdx = cluster[0];
        let bestDist = Infinity;
        cluster.forEach((idx) => {
          const d = colorDistanceSq(uniqueColors[idx], centroids[0]);
          if (d < bestDist) {
            bestDist = d;
            bestIdx = idx;
          }
        });
        return uniqueColors[bestIdx];
      } else {
        const sum = cluster.reduce(
          (acc, idx) => {
            const p = uniqueColors[idx];
            return {
              r: acc.r + p.r,
              g: acc.g + p.g,
              b: acc.b + p.b,
            } as DisplayColorRGB;
          },
          { ...blackColor }
        );
        return {
          r: sum.r / cluster.length,
          g: sum.g / cluster.length,
          b: sum.b / cluster.length,
        };
      }
    });
  }

  const palette = centroids.map((c) => rgbToHex(c));

  // Build mapping: original color -> palette index
  const mapping: Record<string, number> = {};
  for (const [orig, DisplayColorRGB] of colorMap.entries()) {
    let bestIdx = 0;
    let bestDist = Infinity;
    centroids.forEach((c, ci) => {
      const d = colorDistanceSq(c, DisplayColorRGB);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = ci;
      }
    });
    mapping[orig] = bestIdx;
  }

  return { palette, mapping };
}

export function mapToClosestPaletteIndex(
  colors: string[],
  palette: string[]
): Record<string, number> {
  const paletteRGB: DisplayColorRGB[] = palette.map(stringToRGB);
  const mapping: Record<string, number> = {};

  for (const color of colors) {
    const rgb = stringToRGB(color);
    let bestIdx = 0;
    let bestDist = Infinity;

    paletteRGB.forEach((p, idx) => {
      const d = colorDistanceSq(rgb, p);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = idx;
      }
    });

    mapping[color] = bestIdx;
  }

  return mapping;
}
