import { createConsole } from "./Console.ts";
import { DisplayContextCommandMessage } from "./DisplayContextCommand.ts";

const _console = createConsole("DisplaySpriteSheetUtils", { log: true });

export type DisplaySprite = {
  name: string;
  width: number;
  height: number;
  displayCommandMessages: DisplayContextCommandMessage[];
};
export type DisplaySpriteSheetPalette = {
  name: string;
  numberOfColors: number;
  colors: string[];
  opacities: number[];
  fillColorIndex: number;
  lineColorIndex: number;
  numberOfBitmapColors: number;
  bitmapColorIndices: number[];
};
export type DisplaySpriteSheet = {
  name: string;
  palettes: DisplaySpriteSheetPalette[];
  sprites: DisplaySprite[];
};
