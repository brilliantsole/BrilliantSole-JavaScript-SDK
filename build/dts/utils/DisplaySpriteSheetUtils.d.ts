import { DisplayContextCommandMessage } from "./DisplayContextCommand.ts";
export type DisplaySprite = {
    name: string;
    width: number;
    height: number;
    displayCommandMessages: DisplayContextCommandMessage[];
};
export type DisplaySpriteSheetPalette = {
    name: string;
    numberOfColdsors: number;
    colors: string[];
    opacities: number[];
    fillColorIndex: number;
    lineColorIndex: number;
    bitmapColorIndices: number[];
};
export type DisplaySpriteSheet = {
    name: string;
    palettes: DisplaySpriteSheetPalette[];
    sprites: DisplaySprite[];
};
