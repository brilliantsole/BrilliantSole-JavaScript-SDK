import { DisplayContextCommand } from "./DisplayContextCommand.ts";
import { DisplayManagerInterface } from "./DisplayManagerInterface.ts";
import opentype, { Font } from "opentype.js";
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
export declare const spriteHeaderLength: number;
export declare function calculateSpriteSheetHeaderLength(numberOfSprites: number): number;
export declare function serializeSpriteSheet(displayManager: DisplayManagerInterface, spriteSheet: DisplaySpriteSheet): ArrayBuffer;
export declare function parseSpriteSheet(dataView: DataView): void;
export type FontToSpriteSheetOptions = {
    stroke?: boolean;
    strokeWidth?: number;
    unicodeOnly?: boolean;
    englishOnly?: boolean;
    usePath?: boolean;
    strings?: string[];
};
export declare const defaultFontToSpriteSheetOptions: FontToSpriteSheetOptions;
export declare function parseFont(arrayBuffer: ArrayBuffer): Promise<opentype.Font>;
export declare function getFontUnicodeRange(font: Font): import("./RangeHelper.ts").Range | undefined;
export declare function fontToSpriteSheet(displayManager: DisplayManagerInterface, font: Font, fontSize: number, spriteSheetName?: string, options?: FontToSpriteSheetOptions): Promise<DisplaySpriteSheet>;
export declare function stringToSprites(string: string, spriteSheet: DisplaySpriteSheet, requireAll?: boolean): DisplaySprite[];
export declare function getReferencedSprites(sprite: DisplaySprite, spriteSheet: DisplaySpriteSheet): DisplaySprite[];
export declare function reduceSpriteSheet(spriteSheet: DisplaySpriteSheet, spriteNames: string | string[], requireAll?: boolean): DisplaySpriteSheet;
