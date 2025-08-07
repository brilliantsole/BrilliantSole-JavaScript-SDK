import { DisplayBitmap } from "../DisplayManager.ts";
import { concatenateArrayBuffers } from "./ArrayBufferUtils.ts";
import { createConsole } from "./Console.ts";
import { imageToBitmap, quantizeCanvas } from "./DisplayBitmapUtils.ts";
import {
  DisplayContextCommand,
  serializeContextCommands,
} from "./DisplayContextCommand.ts";
import { DisplayManagerInterface } from "./DisplayManagerInterface.ts";
import opentype from "opentype.js";

const _console = createConsole("DisplaySpriteSheetUtils", { log: true });

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
    const dataView = new DataView(new ArrayBuffer(3 * 2));
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

export async function fontToSpriteSheet(
  displayManager: DisplayManagerInterface,
  arrayBuffer: ArrayBuffer,
  fontSize: number,
  spriteSheetName?: string
) {
  _console.assertTypeWithError(fontSize, "number");

  const font = opentype.parse(arrayBuffer);
  const fontScale = (1 / font.unitsPerEm) * fontSize;

  _console.log("font", font);

  spriteSheetName = spriteSheetName || font.getEnglishName("fullName");
  const spriteSheet: DisplaySpriteSheet = {
    name: spriteSheetName,
    sprites: [],
  };
  for (let index = 0; index < font.glyphs.length; index++) {
    const glyph = font.glyphs.get(index);
    if (glyph.unicode == undefined) {
      continue;
    }
    const name = String.fromCharCode(glyph.unicode);

    const bbox = glyph.getBoundingBox();
    const width = Math.round((bbox.x2 - bbox.x1) * fontScale);
    const height = Math.round((bbox.y2 - bbox.y1) * fontScale);

    const commands: DisplayContextCommand[] = [];
    if (width > 0 && height > 0) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      canvas.width = width;
      canvas.height = height;
      ctx.imageSmoothingEnabled = false;

      const path = glyph.getPath(
        -bbox.x1 * fontScale,
        bbox.y2 * fontScale,
        fontSize
      );
      path.fill = "white";
      path.stroke = "white";
      path.draw(ctx);

      const { colorIndices, blob } = await quantizeCanvas(canvas, ctx, 2);
      const bitmap: DisplayBitmap = {
        width,
        height,
        numberOfColors: 2,
        pixels: colorIndices,
      };

      commands.push({
        type: "selectBitmapColor",
        bitmapColorIndex: 1,
        colorIndex: 1,
      });
      commands.push({ type: "drawBitmap", centerX: 0, centerY: 0, bitmap });
    }

    const sprite: DisplaySprite = {
      name,
      commands,
      width,
      height,
    };

    spriteSheet.sprites.push(sprite);
  }
  return spriteSheet;
}

export function reduceSpriteSheet(
  spriteSheet: DisplaySpriteSheet,
  newSpriteSheetName: string
) {
  // FILL - reduce sprites to just those included in spriteNames or spriteStrings (multiple names)
}
