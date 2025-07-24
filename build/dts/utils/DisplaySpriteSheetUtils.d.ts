import { DisplayContextCommand } from "./DisplayContextCommand.ts";
import { DisplayManagerInterface } from "./DisplayManagerInterface.ts";
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
export declare function serializeSpriteSheet(displayManager: DisplayManagerInterface, spriteSheet: DisplaySpriteSheet): ArrayBuffer;
export declare function parseSpriteSheet(dataView: DataView): void;
