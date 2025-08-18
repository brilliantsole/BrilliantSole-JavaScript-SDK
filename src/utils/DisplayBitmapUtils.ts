// @ts-expect-error
import RGBQuant from "rgbquant";
import { createConsole } from "./Console.ts";
import { hexToRGB, rgbToHex } from "./ColorUtils.ts";
import { getVector3Length, Vector3 } from "./MathUtils.ts";
import {
  DisplayColorRGB,
  numberOfColorsToPixelDepth,
  pixelDepthToNumberOfColors,
  pixelDepthToPixelBitWidth,
  pixelDepthToPixelsPerByte,
} from "./DisplayUtils.ts";
import { DisplayBitmap, DisplayPixelDepths } from "../DisplayManager.ts";
import {
  calculateSpriteSheetHeaderLength,
  DisplaySprite,
  DisplaySpriteSheet,
} from "./DisplaySpriteSheetUtils.ts";

const _console = createConsole("DisplayBitmapUtils", { log: true });

export const drawBitmapHeaderLength = 2 + 2 + 2 + 4 + 1 + 2; // x, y, width, numberOfPixels, numberOfColors, dataLength

export function getBitmapData(bitmap: DisplayBitmap) {
  const pixelDataLength = getBitmapNumberOfBytes(bitmap);
  const dataView = new DataView(new ArrayBuffer(pixelDataLength));
  const pixelDepth = numberOfColorsToPixelDepth(bitmap.numberOfColors)!;
  const pixelsPerByte = pixelDepthToPixelsPerByte(pixelDepth);
  bitmap.pixels.forEach((bitmapColorIndex, pixelIndex) => {
    const byteIndex = Math.floor(pixelIndex / pixelsPerByte);
    const byteSlot = pixelIndex % pixelsPerByte;
    const pixelBitWidth = pixelDepthToPixelBitWidth(pixelDepth);
    const bitOffset = pixelBitWidth * byteSlot;
    const shift = 8 - pixelBitWidth - bitOffset;
    let value = dataView.getUint8(byteIndex);
    value |= bitmapColorIndex << shift;
    dataView.setUint8(byteIndex, value);
  });
  _console.log("getBitmapData", bitmap, dataView);
  return dataView;
}

export async function quantizeCanvas(
  canvas: HTMLCanvasElement,
  numberOfColors: number,
  colors?: string[]
) {
  _console.assertWithError(
    numberOfColors > 1,
    "numberOfColors must be greater than 1"
  );

  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  removeAlphaFromCanvas(canvas);

  const isSmall = canvas.width * canvas.height < 4;

  const quantOptions = {
    method: isSmall ? 1 : 2,
    colors: numberOfColors,
    dithKern: null, // Disable dithering
    useCache: false, // Disable color caching to force exact matches
    reIndex: true, // Ensure strict re-indexing to the palette
    orDist: "manhattan",
  };

  if (colors) {
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
  }
  //_console.log("quantizeImage options", quantOptions);
  const quantizer = new RGBQuant(quantOptions);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  quantizer.sample(imageData);

  const quantizedPixels = quantizer.reduce(imageData.data);
  const quantizedImageData = new ImageData(
    new Uint8ClampedArray(quantizedPixels.buffer),
    canvas.width,
    canvas.height
  );
  ctx.putImageData(quantizedImageData, 0, 0);

  const pixels = quantizedImageData.data;

  const quantizedPaletteData: Uint8Array = quantizer.palette();
  const numberOfQuantizedPaletteColors = quantizedPaletteData.byteLength / 4;
  //_console.log("quantizedPaletteData", quantizedPaletteData);
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
  //_console.log({ closestColorIndexToBlack, closestColorDistanceToBlack });
  if (closestColorIndexToBlack != 0) {
    const [currentBlack, newBlack] = [
      quantizedPaletteColors[0],
      quantizedPaletteColors[closestColorIndexToBlack],
    ];
    quantizedPaletteColors[0] = newBlack;
    quantizedPaletteColors[closestColorIndexToBlack] = currentBlack;
  }
  //_console.log("quantizedPaletteColors", quantizedPaletteColors);
  const quantizedColors = quantizedPaletteColors.map((rgb, index) => {
    const hex = rgbToHex(rgb);
    return hex;
  });
  //_console.log("quantizedColors", quantizedColors);

  const quantizedColorIndices: number[] = [];
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];

    const hex = rgbToHex({ r, g, b });
    quantizedColorIndices.push(quantizedColors.indexOf(hex));
  }
  //_console.log("quantizedColorIndices", quantizedColorIndices);

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

export async function quantizeImage(
  image: HTMLImageElement,
  width: number,
  height: number,
  numberOfColors: number,
  colors?: string[],
  canvas?: HTMLCanvasElement
) {
  canvas = canvas || document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

  let { naturalWidth: imageWidth, naturalHeight: imageHeight } = image;
  _console.log({ imageWidth, imageHeight });

  canvas.width = width;
  canvas.height = height;

  ctx.imageSmoothingEnabled = false;

  ctx.drawImage(image, 0, 0, width, height);

  return quantizeCanvas(canvas, numberOfColors, colors);
}

export function resizeImage(
  image: HTMLImageElement,
  width: number,
  height: number,
  canvas?: HTMLCanvasElement
) {
  canvas = canvas || document.createElement("canvas");

  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

  let { naturalWidth: imageWidth, naturalHeight: imageHeight } = image;
  _console.log({ imageWidth, imageHeight });

  canvas.width = width;
  canvas.height = height;

  ctx.imageSmoothingEnabled = false;

  ctx.drawImage(image, 0, 0, width, height);

  return canvas;
}
export function cropCanvas(
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  width: number,
  height: number,
  targetCanvas?: HTMLCanvasElement
) {
  targetCanvas = targetCanvas || document.createElement("canvas");
  const ctx = targetCanvas.getContext("2d", { willReadFrequently: true })!;

  targetCanvas.width = width;
  targetCanvas.height = height;

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(canvas, x, y, width, height, 0, 0, width, height);

  return targetCanvas;
}
export function removeAlphaFromCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
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

  return canvas;
}

export async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: "image/png" | "image/jpeg" = "image/jpeg",
  quality: number = 1
) {
  const promise = new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject();
        }
      },
      type,
      quality
    );
  });
  const blob = await promise;
  return blob;
}

export async function resizeAndQuantizeImage(
  image: HTMLImageElement,
  width: number,
  height: number,
  numberOfColors: number,
  colors?: string[],
  canvas?: HTMLCanvasElement
) {
  canvas = canvas || document.createElement("canvas");
  resizeImage(image, width, height, canvas);
  removeAlphaFromCanvas(canvas);
  return quantizeCanvas(canvas, numberOfColors, colors);
}

export async function imageToBitmap(
  image: HTMLImageElement,
  width: number,
  height: number,
  colors: string[],
  bitmapColorIndices: number[],
  numberOfColors?: number
) {
  if (numberOfColors == undefined) {
    numberOfColors = colors.length;
  }
  const bitmapColors = bitmapColorIndices
    .map((bitmapColorIndex) => colors[bitmapColorIndex])
    .slice(0, numberOfColors);
  const { blob, colorIndices } = await resizeAndQuantizeImage(
    image,
    width,
    height,
    numberOfColors,
    bitmapColors
  );
  const bitmap: DisplayBitmap = {
    numberOfColors,
    pixels: colorIndices,
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

export async function canvasToSprite(
  canvas: HTMLCanvasElement,
  spriteName: string,
  numberOfColors: number,
  paletteName: string,
  overridePalette: boolean,
  spriteSheet: DisplaySpriteSheet,
  paletteOffset: number
) {
  const { width, height } = canvas;

  let palette = spriteSheet.palettes?.find(
    (palette) => palette.name == paletteName
  );
  if (!palette) {
    palette = {
      name: paletteName,
      numberOfColors,
      colors: new Array(numberOfColors).fill("#000000"),
    };
    spriteSheet.palettes?.push(palette);
  }
  console.log("pallete", palette);

  _console.assertWithError(
    numberOfColors + paletteOffset <= palette.numberOfColors,
    `invalid numberOfColors ${numberOfColors} + offset ${paletteOffset} (max ${palette.numberOfColors})`
  );

  const sprite: DisplaySprite = {
    name: spriteName,
    width,
    height,
    paletteSwaps: [],
    commands: [],
  };

  const results = await quantizeCanvas(
    canvas,
    numberOfColors,
    !overridePalette ? palette.colors : undefined
  );
  const blob = results.blob;
  const colorIndices = results.colorIndices;
  if (overridePalette) {
    results.colors.forEach((color, index) => {
      palette.colors[index + paletteOffset] = color;
    });
  }

  sprite.commands.push({
    type: "selectBitmapColors",
    bitmapColorPairs: new Array(numberOfColors).fill(0).map((_, index) => ({
      bitmapColorIndex: index,
      colorIndex: index + paletteOffset,
    })),
  });
  const bitmap: DisplayBitmap = {
    numberOfColors,
    pixels: colorIndices,
    width,
    height,
  };
  sprite.commands.push({ type: "drawBitmap", offsetX: 0, offsetY: 0, bitmap });

  const spriteIndex = spriteSheet.sprites.findIndex(
    (sprite) => sprite.name == spriteName
  );
  if (spriteIndex == -1) {
    spriteSheet.sprites.push(sprite);
  } else {
    _console.log(`overwriting spriteInde ${spriteIndex}`);
    spriteSheet.sprites[spriteIndex] = sprite;
  }

  return { sprite, blob };
}
export async function imageToSprite(
  image: HTMLImageElement,
  spriteName: string,
  width: number,
  height: number,
  numberOfColors: number,
  paletteName: string,
  overridePalette: boolean,
  spriteSheet: DisplaySpriteSheet,
  paletteOffset: number
) {
  const canvas = resizeImage(image, width, height);
  return canvasToSprite(
    canvas,
    spriteName,
    numberOfColors,
    paletteName,
    overridePalette,
    spriteSheet,
    paletteOffset
  );
}

const drawSpriteBitmapCommandHeaderLength = 1 + 2 + 2 + 2 + 2 + 1 + 2; // command, offetXY, width, numberOfPixels, numberOfColors, pixelDataLength
const spriteSheetWithSingleBitmapCommandLength =
  calculateSpriteSheetHeaderLength(1) + drawSpriteBitmapCommandHeaderLength;
function spriteSheetWithBitmapCommandAndSelectBitmapColorsLength(
  numberOfColors: number
) {
  return (
    spriteSheetWithSingleBitmapCommandLength + (1 + 1 + numberOfColors * 2)
  ); // command, numberOfPairs, ...pairs
}

export async function canvasToSpriteSheet(
  canvas: HTMLCanvasElement,
  spriteSheetName: string,
  numberOfColors: number,
  paletteName: string,
  maxFileLength?: number
) {
  const spriteSheet: DisplaySpriteSheet = {
    name: spriteSheetName,
    palettes: [],
    paletteSwaps: [],
    sprites: [],
  };

  if (maxFileLength == undefined) {
    await canvasToSprite(
      canvas,
      "image",
      numberOfColors,
      paletteName,
      true,
      spriteSheet,
      0
    );
  } else {
    const { width, height } = canvas;
    const numberOfPixels = width * height;
    const pixelDepth = DisplayPixelDepths.find(
      (pixelDepth) => pixelDepthToNumberOfColors(pixelDepth) >= numberOfColors
    )!;
    _console.assertWithError(
      pixelDepth,
      `no pixelDepth found that covers ${numberOfColors} colors`
    );
    const pixelsPerByte = pixelDepthToPixelsPerByte(pixelDepth);
    const numberOfBytes = Math.ceil(numberOfPixels / pixelsPerByte);
    _console.log({
      width,
      height,
      numberOfPixels,
      pixelDepth,
      pixelsPerByte,
      numberOfBytes,
      maxFileLength,
    });

    const maxPixelDataLength =
      maxFileLength -
      (spriteSheetWithBitmapCommandAndSelectBitmapColorsLength(numberOfColors) +
        5);
    const imageRowPixelDataLength = Math.ceil(width / pixelsPerByte);
    const maxSpriteHeight = Math.floor(
      maxPixelDataLength / imageRowPixelDataLength
    );
    _console.log({
      maxPixelDataLength,
      imageRowPixelDataLength,
      maxSpriteHeight,
    });

    if (maxSpriteHeight >= height) {
      _console.log("image is small enough for a single sprite");
      await canvasToSprite(
        canvas,
        "image",
        numberOfColors,
        paletteName,
        true,
        spriteSheet,
        0
      );
    } else {
      const { colors } = await quantizeCanvas(canvas, numberOfColors);
      spriteSheet.palettes?.push({ name: paletteName, numberOfColors, colors });

      let yOffset = 0;
      let imageIndex = 0;
      const spriteCanvas: HTMLCanvasElement = document.createElement("canvas");

      while (yOffset < height) {
        let spriteHeight = Math.min(maxSpriteHeight, height - yOffset);
        cropCanvas(canvas, 0, yOffset, width, spriteHeight, spriteCanvas);
        yOffset += spriteHeight;
        _console.log(`cropping sprite ${imageIndex}`, {
          yOffset,
          width,
          spriteHeight,
        });
        await canvasToSprite(
          spriteCanvas,
          `image${imageIndex}`,
          numberOfColors,
          paletteName,
          false,
          spriteSheet,
          0
        );
        imageIndex++;
      }
    }
  }

  return spriteSheet;
}

export async function imageToSpriteSheet(
  image: HTMLImageElement,
  spriteSheetName: string,
  width: number,
  height: number,
  numberOfColors: number,
  paletteName: string,
  maxFileLength?: number
) {
  const canvas = resizeImage(image, width, height);
  return canvasToSpriteSheet(
    canvas,
    spriteSheetName,
    numberOfColors,
    paletteName,
    maxFileLength
  );
}
