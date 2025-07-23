import { createConsole } from "./Console.ts";
import { DisplayContextCommand } from "./DisplayContextCommand.ts";

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
  paletteSwaps: DisplaySpritePaletteSwap[];
  commands: DisplayContextCommand[];
};
export type DisplaySpriteSheetPalette = {
  name: string;
  numberOfColors: number;
  colors: string[];
  opacities: number[];
};
export type DisplaySpriteSheet = {
  name: string;
  palettes: DisplaySpriteSheetPalette[];
  sprites: DisplaySprite[];
};

export function serializeSpriteSheet(spriteSheet: DisplaySpriteSheet) {
  // numberOfSprites, ...offsets, ...commands
  const { name, sprites } = spriteSheet;
  _console.log(`serializing ${name} spriteSheet`, spriteSheet);

  const numberOfSprites = sprites.length;
  const numberOfSpritesDataView = new DataView(new ArrayBuffer(2));
  numberOfSpritesDataView.setUint16(0, numberOfSprites, true);

  sprites.forEach((sprite, index) => {
    // FILL
  });
  return new DataView(new ArrayBuffer(1));
}
export function parseSpriteSheet(dataView: DataView) {
  // FILL
}
