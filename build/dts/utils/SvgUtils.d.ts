import { DisplayContextCommand } from "./DisplayContextCommand.ts";
import { DisplaySprite, DisplaySpriteSheet } from "./DisplaySpriteSheetUtils.ts";
export type ParseSvgOptions = {
    fit?: boolean;
    width?: number;
    height?: number;
    aspectRatio?: number;
    offsetX?: number;
    offsetY?: number;
    numberOfColors?: number;
    colors?: string[];
    paletteOffset?: number;
    centered?: boolean;
};
export declare function svgToDisplayContextCommands(svgString: string, options?: ParseSvgOptions): {
    commands: DisplayContextCommand[];
    colors: string[];
    width: number;
    height: number;
};
export declare function svgToSprite(svgString: string, spriteName: string, paletteName: string, overridePalette: boolean, spriteSheet: DisplaySpriteSheet, options?: ParseSvgOptions): DisplaySprite;
export declare function svgToSpriteSheet(svgString: string, spriteSheetName: string, paletteName: string, overridePalette: boolean, options?: ParseSvgOptions): DisplaySpriteSheet;
