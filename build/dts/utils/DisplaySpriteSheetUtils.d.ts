import { DisplayContextCommand } from "./DisplayContextCommand.ts";
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
