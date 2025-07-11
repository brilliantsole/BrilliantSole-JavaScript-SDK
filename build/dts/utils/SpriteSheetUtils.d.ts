import { DisplayContextCommandMessage } from "./DisplayContextCommand.ts";
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
    palettes: DisplaySpriteSheetPalette[][];
    sprites: {
        [name: string]: DisplaySprite;
    };
};
