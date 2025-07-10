import { DisplayBitmap } from "../DisplayManager.ts";
import { createConsole } from "./Console.ts";

const _console = createConsole("SpriteSheetUtils", { log: true });

export type DisplaySprite = {
  name: string;
  displayCommands: any[];
};
export type DisplaySpriteSheetPalette = {
  displayColors: string[];
  fillColorIndex: string;
  lineColorIndex: string;
  bitmapColorIndices: number[];
};
export type DisplaySpriteSheet = {
  name: string;
  palettes: DisplaySpriteSheetPalette[][];
  sprites: DisplaySprite[];
};
