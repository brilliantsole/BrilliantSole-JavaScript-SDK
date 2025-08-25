import { DisplayBitmap } from "../DisplayManager.ts";
import { concatenateArrayBuffers } from "./ArrayBufferUtils.ts";
import { createConsole } from "./Console.ts";
import { quantizeCanvas } from "./DisplayBitmapUtils.ts";
import {
  DisplayContextCommand,
  serializeContextCommands,
} from "./DisplayContextCommand.ts";
import { DisplayManagerInterface } from "./DisplayManagerInterface.ts";
import opentype, { Glyph, Font } from "opentype.js";
import { decompress } from "woff2-encoder";
import RangeHelper from "./RangeHelper.ts";

const _console = createConsole("DisplaySpriteSheetUtils", { log: false });

export type DisplaySpritePaletteSwap = {
  name: string;
  numberOfColors: number;
  spriteColorIndices: number[];
};
export type DisplaySprite = {
  name: string;
  width: number;
  height: number;
  paletteSwaps?: DisplaySpritePaletteSwap[];
  commands: DisplayContextCommand[];
};
export type DisplaySpriteSheetPaletteSwap = {
  name: string;
  numberOfColors: number;
  spriteColorIndices: number[];
};
export type DisplaySpriteSheetPalette = {
  name: string;
  numberOfColors: number;
  colors: string[];
  opacities?: number[];
};
export type DisplaySpriteSheet = {
  name: string;
  palettes?: DisplaySpriteSheetPalette[];
  paletteSwaps?: DisplaySpriteSheetPaletteSwap[];
  sprites: DisplaySprite[];
};

export const spriteHeaderLength = 3 * 2; // width, height, commandsLength
export function calculateSpriteSheetHeaderLength(numberOfSprites: number) {
  // numberOfSprites, spriteOffsets, spriteHeader
  return 2 + numberOfSprites * 2 + numberOfSprites * spriteHeaderLength;
}
export function serializeSpriteSheet(
  displayManager: DisplayManagerInterface,
  spriteSheet: DisplaySpriteSheet
) {
  const { name, sprites } = spriteSheet;
  _console.log(`serializing ${name} spriteSheet`, spriteSheet);

  const numberOfSprites = sprites.length;
  const numberOfSpritesDataView = new DataView(new ArrayBuffer(2));
  numberOfSpritesDataView.setUint16(0, numberOfSprites, true);

  const spritePayloads = sprites.map((sprite, index) => {
    const commandsData = serializeContextCommands(
      displayManager,
      sprite.commands
    );
    const dataView = new DataView(new ArrayBuffer(spriteHeaderLength));
    dataView.setUint16(0, sprite.width, true);
    dataView.setUint16(2, sprite.height, true);
    dataView.setUint16(4, commandsData.byteLength, true);
    const serializedSprite = concatenateArrayBuffers(dataView, commandsData);
    _console.log("serializedSprite", sprite, serializedSprite);
    return serializedSprite;
  });
  const spriteOffsetsDataView = new DataView(
    new ArrayBuffer(sprites.length * 2)
  );
  let offset =
    numberOfSpritesDataView.byteLength + spriteOffsetsDataView.byteLength;
  spritePayloads.forEach((spritePayload, index) => {
    //_console.log("spritePayloads", index, offset, spritePayload);
    spriteOffsetsDataView.setUint16(index * 2, offset, true);
    offset += spritePayload.byteLength;
  });

  // [numberOfSprites, ...spriteOffsets, ...[width, height, commands]]
  const serializedSpriteSheet = concatenateArrayBuffers(
    numberOfSpritesDataView,
    spriteOffsetsDataView,
    spritePayloads
  );
  _console.log("serializedSpriteSheet", serializedSpriteSheet);

  return serializedSpriteSheet;
}

export function parseSpriteSheet(dataView: DataView) {
  // FILL
}

type FontToSpriteSheetOptions = {
  stroke?: boolean;
  strokeWidth?: number;
  unicodeOnly?: boolean;
  englishOnly?: boolean;
};
const defaultFontToSpriteSheetOptions: FontToSpriteSheetOptions = {
  stroke: false,
  strokeWidth: 1,
  unicodeOnly: true,
  englishOnly: true,
};

function isWoff2(arrayBuffer: ArrayBuffer) {
  if (arrayBuffer.byteLength < 4) return false;

  const header = new Uint8Array(arrayBuffer, 0, 4);
  return (
    header[0] === 0x77 && // 'w'
    header[1] === 0x4f && // 'O'
    header[2] === 0x46 && // 'F'
    header[3] === 0x32 // '2'
  );
}
export async function parseFont(arrayBuffer: ArrayBuffer) {
  if (isWoff2(arrayBuffer)) {
    const result = await decompress(arrayBuffer);
    arrayBuffer = result.buffer;
  }
  const font = opentype.parse(arrayBuffer);
  //_console.log("font", font);
  return font;
}

export function getFontUnicodeRange(font: Font) {
  const rangeHelper = new RangeHelper();

  for (let i = 0; i < font.glyphs.length; i++) {
    const glyph = font.glyphs.get(i);
    if (!glyph.unicodes || glyph.unicodes.length === 0) continue;

    glyph.unicodes
      .filter((unicode) => {
        const char = String.fromCodePoint(unicode);
        // Keep only letters (any language)
        return /\p{Letter}/u.test(char);
      })
      .forEach((unicode) => rangeHelper.update(unicode));
  }

  //_console.log("range", rangeHelper.range);
  return rangeHelper.span > 0 ? rangeHelper.range : undefined;
}

// Basic English letters A-Z and a-z
function isEnglishLetter(unicode: number) {
  return (
    (unicode >= 0x41 && unicode <= 0x5a) || (unicode >= 0x61 && unicode <= 0x7a)
  );
}

const englishRegex = /^[A-Za-z0-9 !"#$%&'()*+,\-./:;?@[\]^_`{|}~\\]+$/;

export async function fontToSpriteSheet(
  displayManager: DisplayManagerInterface,
  font: Font,
  fontSize: number,
  spriteSheetName?: string,
  options: FontToSpriteSheetOptions = defaultFontToSpriteSheetOptions
) {
  _console.assertTypeWithError(fontSize, "number");

  const fontScale = (1 / font.unitsPerEm) * fontSize;

  spriteSheetName = spriteSheetName || font.getEnglishName("fullName");
  const spriteSheet: DisplaySpriteSheet = {
    name: spriteSheetName,
    sprites: [],
  };
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  let minSpriteY = Infinity;
  let maxSpriteY = -Infinity;

  const glyphs: Glyph[] = [];
  for (let index = 0; index < font.glyphs.length; index++) {
    const glyph = font.glyphs.get(index);
    if (options.unicodeOnly || options.englishOnly) {
      if (glyph.unicode == undefined) {
        continue;
      }
    }
    if (options.englishOnly) {
      if (!englishRegex.test(String.fromCharCode(glyph.unicode!))) {
        continue;
      }
    }

    const bbox = glyph.getBoundingBox();
    minSpriteY = Math.min(minSpriteY, bbox.y1 * fontScale);
    maxSpriteY = Math.max(maxSpriteY, bbox.y2 * fontScale);

    glyphs.push(glyph);
  }

  const maxSpriteHeight = maxSpriteY - minSpriteY;

  //_console.log({ minSpriteY, maxSpriteY, maxSpriteHeight });

  for (let i = 0; i < glyphs.length; i++) {
    const glyph = glyphs[i];

    let name = glyph.name;
    if (options.unicodeOnly) {
      name = String.fromCharCode(glyph.unicode!);
    }
    if (typeof name != "string") {
      continue;
    }

    const bbox = glyph.getBoundingBox();
    const bitmapWidth = Math.round((bbox.x2 - bbox.x1) * fontScale);
    const bitmapHeight = Math.round((bbox.y2 - bbox.y1) * fontScale);

    const spriteWidth = Math.round(
      Math.max(Math.max(bbox.x2, bbox.x2 - bbox.x1), glyph.advanceWidth || 0) *
        fontScale
    );
    const spriteHeight = maxSpriteHeight;

    const commands: DisplayContextCommand[] = [];
    if (bitmapWidth > 0 && bitmapHeight > 0) {
      canvas.width = bitmapWidth;
      canvas.height = bitmapHeight;
      ctx.imageSmoothingEnabled = false;

      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const path = glyph.getPath(
        -bbox.x1 * fontScale,
        bbox.y2 * fontScale,
        fontSize
      );
      if (options.stroke) {
        path.stroke = "white";
        path.strokeWidth = options.strokeWidth || 1;
      } else {
        path.fill = "white";
      }
      path.draw(ctx);
      const { colorIndices } = await quantizeCanvas(canvas, 2, [
        "#000000",
        "#ffffff",
      ]);
      const bitmap: DisplayBitmap = {
        width: bitmapWidth,
        height: bitmapHeight,
        numberOfColors: 2,
        pixels: colorIndices,
      };

      commands.push({
        type: "selectBitmapColor",
        bitmapColorIndex: 1,
        colorIndex: 1,
      });
      if (false) {
        // debugging
        commands.push({
          type: "selectFillColor",
          fillColorIndex: 2,
        });
        commands.push({
          type: "drawRect",
          offsetX: 0,
          offsetY: 0,
          width: spriteWidth,
          height: spriteHeight,
        });
      }

      let bitmapX = bbox.x1 * fontScale;
      let bitmapY =
        (spriteHeight - bitmapHeight) / 2 - (bbox.y1 * fontScale - minSpriteY);
      commands.push({
        type: "drawBitmap",
        offsetX: bitmapX,
        offsetY: bitmapY,
        bitmap,
      });
    }

    const sprite: DisplaySprite = {
      name,
      commands,
      width: spriteWidth,
      height: spriteHeight,
    };

    spriteSheet.sprites.push(sprite);
  }

  return spriteSheet;
}

export function reduceSpriteSheet(
  spriteSheet: DisplaySpriteSheet,
  spriteNames: string | string[]
) {
  const reducedSpriteName = Object.assign({}, spriteSheet);
  if (!(spriteNames instanceof Array)) {
    // TODO - parseSpriteNames via prefixes (use for drawSprites)
    spriteNames = [spriteNames];
  }
  //_console.log("reduceSpriteSheet", spriteSheet, spriteNames);
  reducedSpriteName.sprites = reducedSpriteName.sprites.filter((sprite) => {
    // TODO - recursively iterate sprites' commands to see which sprites reference what
    return spriteNames.includes(sprite.name);
  });
  _console.log("reducedSpriteName", reducedSpriteName);
  return reducedSpriteName;
}
