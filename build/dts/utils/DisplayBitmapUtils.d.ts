import { DisplayBitmap } from "../DisplayManager.ts";
import { DisplaySprite, DisplaySpriteSheet } from "./DisplaySpriteSheetUtils.ts";
export declare const drawBitmapHeaderLength: number;
export declare function getBitmapData(bitmap: DisplayBitmap): DataView;
export declare function quantizeCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, numberOfColors: number, colors?: string[]): Promise<{
    blob: Blob;
    colors: string[];
    colorIndices: number[];
}>;
export declare function quantizeImage(image: HTMLImageElement, width: number, height: number, numberOfColors: number): Promise<{
    blob: Blob;
    colors: string[];
    colorIndices: number[];
}>;
export declare function resizeAndQuantizeImage(image: HTMLImageElement, width: number, height: number, colors: string[]): Promise<{
    blob: Blob;
    colorIndices: number[];
}>;
export declare function imageToBitmap(image: HTMLImageElement, width: number, height: number, colors: string[], bitmapColorIndices: number[], numberOfColors?: number): Promise<{
    blob: Blob;
    bitmap: DisplayBitmap;
}>;
export declare function getBitmapNumberOfBytes(bitmap: DisplayBitmap): number;
export declare function assertValidBitmapPixels(bitmap: DisplayBitmap): void;
export declare function imageToSprite(image: HTMLImageElement, spriteName: string, width: number, height: number, numberOfColors: number, paletteName: string, overridePalette: boolean, spriteSheet: DisplaySpriteSheet, paletteOffset: number): Promise<{
    sprite: DisplaySprite;
    blob: Blob;
}>;
export declare function imageToSpriteSheet(image: HTMLImageElement, name: string, width: number, height: number, numberOfColors: number, paletteName: string): Promise<DisplaySpriteSheet>;
