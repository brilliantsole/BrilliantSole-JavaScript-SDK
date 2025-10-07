import { DisplayContextCommand } from "./DisplayContextCommand.ts";
import { Vector2 } from "./MathUtils.ts";
import { DisplaySprite, DisplaySpriteSheet } from "./DisplaySpriteSheetUtils.ts";
type FillRule = "nonzero" | "evenodd";
export type ParseSvgOptions = {
    fit?: boolean;
    width?: number;
    height?: number;
    aspectRatio?: number;
    offsetX?: number;
    offsetY?: number;
    centered?: boolean;
};
export declare function classifySubpath(subpath: Vector2[], previous: {
    path: Vector2[];
    isHole: boolean;
}[], fillRule: FillRule): boolean;
export declare function svgToDisplayContextCommands(svgString: string, numberOfColors: number, paletteOffset: number, colors?: string[], options?: ParseSvgOptions): {
    commands: DisplayContextCommand[];
    colors: string[];
    width: number;
    height: number;
};
export declare function svgToSprite(svgString: string, spriteName: string, numberOfColors: number, paletteName: string, overridePalette: boolean, spriteSheet: DisplaySpriteSheet, paletteOffset?: number, options?: ParseSvgOptions): DisplaySprite;
export declare function svgToSpriteSheet(svgString: string, spriteSheetName: string, numberOfColors: number, paletteName: string, options?: ParseSvgOptions): DisplaySpriteSheet;
export declare function getSvgStringFromDataUrl(string: string): string;
export declare function isValidSVG(svgString: string): boolean;
export {};
