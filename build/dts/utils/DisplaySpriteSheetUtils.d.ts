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
type FontToSpriteSheetOptions = {
    stroke?: boolean;
    strokeWidth?: number;
    unicodeOnly?: boolean;
};
export declare function parseFont(displayManager: DisplayManagerInterface, arrayBuffer: ArrayBuffer): Promise<opentype.Font>;
export declare function fontToSpriteSheet(displayManager: DisplayManagerInterface, font: Font, fontSize: number, spriteSheetName?: string, options?: FontToSpriteSheetOptions): Promise<DisplaySpriteSheet>;
export declare function reduceSpriteSheet(spriteSheet: DisplaySpriteSheet, spriteNames: string | string[]): DisplaySpriteSheet;
export {};
