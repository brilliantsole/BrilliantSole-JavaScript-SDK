import { DisplayContextCommand } from "./DisplayContextCommand.ts";
export type DisplaySprite = {
    name: string;
    width: number;
    height: number;
    commands: DisplayContextCommand[];
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
