import { DisplaySize } from "../DisplayManager.ts";
import { DisplayContextCommand } from "./DisplayContextCommand.ts";
import { DisplayManagerInterface } from "./DisplayManagerInterface.ts";
import opentype, { Font } from "opentype.js";
import { Vector2 } from "./MathUtils.ts";
import { DisplayBoundingBox } from "./DisplayCanvasHelper.ts";
import { DisplayContextState } from "./DisplayContextState.ts";
export type DisplaySpriteSubLine = {
    spriteSheetName: string;
    spriteNames: string[];
};
export type DisplaySpriteLine = DisplaySpriteSubLine[];
export type DisplaySpriteLines = DisplaySpriteLine[];
export type DisplaySpriteSerializedSubLine = {
    spriteSheetIndex: number;
    spriteIndices: number[];
    use2Bytes: boolean;
};
export type DisplaySpriteSerializedLine = DisplaySpriteSerializedSubLine[];
export type DisplaySpriteSerializedLines = DisplaySpriteSerializedLine[];
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
    script?: string;
    string?: string;
};
export declare const defaultFontToSpriteSheetOptions: FontToSpriteSheetOptions;
export declare function parseFont(arrayBuffer: ArrayBuffer): Promise<opentype.Font>;
export declare function getFontUnicodeRange(font: Font): import("./RangeHelper.ts").Range | undefined;
export declare function contourArea(points: Vector2[]): number;
export declare function fontToSpriteSheet(font: Font | Font[], fontSize: number, spriteSheetName?: string, options?: FontToSpriteSheetOptions): Promise<DisplaySpriteSheet>;
export declare function stringToSprites(string: string, spriteSheet: DisplaySpriteSheet, requireAll?: boolean): DisplaySprite[];
export declare function getReferencedSprites(sprite: DisplaySprite, spriteSheet: DisplaySpriteSheet): DisplaySprite[];
export declare function reduceSpriteSheet(spriteSheet: DisplaySpriteSheet, spriteNames: string | string[], requireAll?: boolean): DisplaySpriteSheet;
export declare function stringToSpriteLines(string: string, spriteSheets: Record<string, DisplaySpriteSheet>, contextState: DisplayContextState, requireAll?: boolean, maxLineBreadth?: number, separators?: string[]): DisplaySpriteLines;
export declare function getSpriteLinesBoundingBox(spriteLines: DisplaySpriteLines, spriteSheets: Record<string, DisplaySpriteSheet>, contextState: DisplayContextState): DisplayBoundingBox;
export declare function getSpriteLinesOffset(spriteLines: DisplaySpriteLines, lineIndex: number, subLineIndex: number, contextState: DisplayContextState): Vector2;
export declare function splitStringInto(string: string, spriteSheets: Record<string, DisplaySpriteSheet>, separators?: string[], requireAll?: boolean): void;
export declare function getFontMaxHeight(font: Font, fontSize: number): number;
export declare function getMaxSpriteSheetSize(spriteSheet: DisplaySpriteSheet): DisplaySize;
