import { createConsole } from "./Console.ts";
import { DisplayContextCommandMessage } from "./DisplayContextCommand.ts";

const _console = createConsole("DisplaySpriteSheetUtils", { log: true });

export type DisplaySprite = {
  width: number;
  height: number;
  displayCommandMessages: DisplayContextCommandMessage[];
};
export type DisplaySpriteSheetPalette = {
  colors: string[];
  opacities: number[];
  fillColorIndex: string;
  lineColorIndex: string;
  bitmapColorIndices: number[];
};
export type DisplaySpriteSheet = {
  name: string;
  palettes: { [name: string]: DisplaySpriteSheetPalette };
  sprites: { [name: string]: DisplaySprite };
};
