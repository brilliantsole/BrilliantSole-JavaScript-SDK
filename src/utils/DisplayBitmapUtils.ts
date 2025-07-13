import RGBQuant from "rgbquant";
import { createConsole } from "./Console.ts";
import { hexToRGB, rgbToHex } from "./ColorUtils.ts";
import { DisplayBitmap } from "../DisplayManager.ts";
import { getVector3Length, Vector3 } from "./MathUtils.ts";
import {
  DisplayColorRGB,
  numberOfColorsToPixelDepth,
  pixelDepthToPixelsPerByte,
} from "./DisplayUtils.ts";
import { DisplayContextState } from "./DisplayContextState.ts";

const _console = createConsole("DisplayBitmapUtils", { log: true });

export async function quantizeImage(
  image: HTMLImageElement,
  width: number,
  height: number,
  numberOfColors: number
) {
  _console.assertWithError(
    numberOfColors > 1,
    "numberOfColors must be greater than 1"
  );

  _console.log({ numberOfColors });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  let { naturalWidth: imageWidth, naturalHeight: imageHeight } = image;
  _console.log({ imageWidth, imageHeight });

  canvas.width = width;
  canvas.height = height;

  ctx.imageSmoothingEnabled = false;

  ctx.drawImage(image, 0, 0, width, height);

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // turn any non-opaque pixel to black
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];

    if (alpha < 255) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const quantOptions = {
    method: 0,
    colors: numberOfColors,
    dithKern: null, // Disable dithering
    useCache: false, // Disable color caching to force exact matches
    reIndex: true, // Ensure strict re-indexing to the palette
    orDist: "manhattan",
  };
  _console.log("quantOptions", quantOptions);

  _console.log("quantizeImage options", quantOptions);
  const quantizer = new RGBQuant(quantOptions);
  quantizer.sample(imageData);

  const quantizedPixels = quantizer.reduce(imageData.data);
  const quantizedImageData = new ImageData(
    new Uint8ClampedArray(quantizedPixels.buffer),
    width,
    height
  );
  ctx.putImageData(quantizedImageData, 0, 0);

  const pixels = quantizedImageData.data;

  const quantizedPaletteData: Uint8Array = quantizer.palette();
  const numberOfQuantizedPaletteColors = quantizedPaletteData.byteLength / 4;
  _console.log("quantized palette data", quantizedPaletteData);
  const quantizedPaletteColors: DisplayColorRGB[] = [];
  let closestColorIndexToBlack = 0;
  let closestColorDistanceToBlack = Infinity;
  const vector3: Vector3 = { x: 0, y: 0, z: 0 };
  for (
    let colorIndex = 0;
    colorIndex < numberOfQuantizedPaletteColors;
    colorIndex++
  ) {
    const rgb: DisplayColorRGB = {
      r: quantizedPaletteData[colorIndex * 4],
      g: quantizedPaletteData[colorIndex * 4 + 1],
      b: quantizedPaletteData[colorIndex * 4 + 2],
    };
    quantizedPaletteColors.push(rgb);
    vector3.x = rgb.r;
    vector3.y = rgb.g;
    vector3.z = rgb.b;

    const distanceToBlack = getVector3Length(vector3);
    if (distanceToBlack < closestColorDistanceToBlack) {
      closestColorDistanceToBlack = distanceToBlack;
      closestColorIndexToBlack = colorIndex;
    }
  }
  _console.log({ closestColorIndexToBlack, closestColorDistanceToBlack });
  if (closestColorIndexToBlack != 0) {
    const [currentBlack, newBlack] = [
      quantizedPaletteColors[0],
      quantizedPaletteColors[closestColorIndexToBlack],
    ];
    quantizedPaletteColors[0] = newBlack;
    quantizedPaletteColors[closestColorIndexToBlack] = currentBlack;
  }
  _console.log("quantizedPaletteColors", quantizedPaletteColors);
  const quantizedColors = quantizedPaletteColors.map((rgb, index) => {
    const hex = rgbToHex(rgb);
    return hex;
  });
  _console.log("quantizedColors", quantizedColors);

  const quantizedColorIndices: number[] = [];
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];

    const hex = rgbToHex({ r, g, b });
    quantizedColorIndices.push(quantizedColors.indexOf(hex));
  }
  _console.log("quantizedColorIndices", quantizedColorIndices);

  const promise = new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject();
      }
    }, "image/png");
  });

  const blob = await promise;
  return {
    blob,
    colors: quantizedColors,
    colorIndices: quantizedColorIndices,
  };
}

export async function resizeAndQuantizeImage(
  image: HTMLImageElement,
  width: number,
  height: number,
  colors: string[]
) {
  _console.assertWithError(
    colors.length > 1,
    "colors.length must be greater than 1"
  );

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  let { naturalWidth: imageWidth, naturalHeight: imageHeight } = image;
  _console.log({ imageWidth, imageHeight });

  canvas.width = width;
  canvas.height = height;

  ctx.imageSmoothingEnabled = false;

  ctx.drawImage(image, 0, 0, width, height);

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // turn any non-opaque pixel to black
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];

    if (alpha < 255) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const quantOptions = {
    method: 0,
    colors: colors.length,
    dithKern: null, // Disable dithering
    useCache: false, // Disable color caching to force exact matches
    reIndex: true, // Ensure strict re-indexing to the palette
    orDist: "manhattan",
  };
  _console.log("quantOptions", quantOptions);

  // @ts-ignore
  quantOptions.palette = colors.map((color) => {
    const rgb = hexToRGB(color);
    if (rgb) {
      const { r, g, b } = rgb;
      return [r, g, b];
    } else {
      _console.error(`invalid rgb hex "${color}"`);
    }
  });
  _console.log("quantizeImage options", quantOptions);
  const quantizer = new RGBQuant(quantOptions);
  quantizer.sample(imageData);

  const quantizedPixels = quantizer.reduce(imageData.data);
  const quantizedImageData = new ImageData(
    new Uint8ClampedArray(quantizedPixels.buffer),
    width,
    height
  );
  ctx.putImageData(quantizedImageData, 0, 0);

  const pixels = quantizedImageData.data;

  const quantizedColorIndices: number[] = [];
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];

    const hex = rgbToHex({ r, g, b });

    const colorIndex = colors.findIndex((color) => color == hex);
    if (colorIndex == -1) {
      _console.error(`no color found for ${hex}`);
      quantizedColorIndices.push(0);
      continue;
    }
    quantizedColorIndices.push(colorIndex);
  }
  _console.log("quantizedColorIndices", quantizedColorIndices);

  const promise = new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject();
      }
    }, "image/png");
  });
  const blob = await promise;
  return {
    blob,
    colorIndices: quantizedColorIndices,
  };
}

export async function imageToBitmap(
  image: HTMLImageElement,
  width: number,
  height: number,
  colors: string[],
  contextState: DisplayContextState,
  numberOfColors?: number
) {
  if (numberOfColors == undefined) {
    numberOfColors = colors.length;
  }
  const bitmapColors = contextState.bitmapColorIndices
    .map((bitmapColorIndex) => colors[bitmapColorIndex])
    .slice(0, numberOfColors);
  const { blob, colorIndices: bitmapColorIndices } =
    await resizeAndQuantizeImage(image, width, height, bitmapColors);
  const bitmap: DisplayBitmap = {
    numberOfColors,
    pixels: bitmapColorIndices,
    width,
    height,
  };
  return { blob, bitmap };
}

export function getBitmapNumberOfBytes(bitmap: DisplayBitmap) {
  const pixelDepth = numberOfColorsToPixelDepth(bitmap.numberOfColors)!;
  const pixelsPerByte = pixelDepthToPixelsPerByte(pixelDepth);
  const numberOfPixels = bitmap.pixels.length;
  const pixelDataLength = Math.ceil(numberOfPixels / pixelsPerByte);
  _console.log({
    pixelDepth,
    pixelsPerByte,
    numberOfPixels,
    pixelDataLength,
  });
  return pixelDataLength;
}
export function assertValidBitmapPixels(bitmap: DisplayBitmap) {
  _console.assertRangeWithError(
    "bitmap.pixels.length",
    bitmap.pixels.length,
    bitmap.width * (bitmap.height - 1) + 1,
    bitmap.width * bitmap.height
  );
  bitmap.pixels.forEach((pixel, index) => {
    _console.assertRangeWithError(
      `bitmap.pixels[${index}]`,
      pixel,
      0,
      bitmap.numberOfColors - 1
    );
  });
}
