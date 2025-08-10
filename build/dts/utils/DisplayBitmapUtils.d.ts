import { DisplayBitmap } from "../DisplayManager.ts";
import { DisplaySprite, DisplaySpriteSheet } from "./DisplaySpriteSheetUtils.ts";
export declare const drawBitmapHeaderLength: number;
export declare function getBitmapData(bitmap: DisplayBitmap): DataView;
export declare function quantizeCanvas(canvas: HTMLCanvasElement, numberOfColors: number, colors?: string[]): Promise<{
    blob: Blob;
    colors: string[];
    colorIndices: number[];
}>;
export declare function quantizeImage(image: HTMLImageElement, width: number, height: number, numberOfColors: number, colors?: string[], canvas?: HTMLCanvasElement): Promise<{
    blob: Blob;
    colors: string[];
    colorIndices: number[];
}>;
export declare function resizeImage(image: HTMLImageElement, width: number, height: number, canvas?: HTMLCanvasElement): HTMLCanvasElement;
export declare function cropCanvas(canvas: HTMLCanvasElement, x: number, y: number, width: number, height: number, targetCanvas?: HTMLCanvasElement): HTMLCanvasElement;
export declare function removeAlphaFromCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement;
export declare function canvasToBlob(canvas: HTMLCanvasElement, type?: "image/png" | "image/jpeg", quality?: number): Promise<Blob>;
export declare function resizeAndQuantizeImage(image: HTMLImageElement, width: number, height: number, numberOfColors: number, colors?: string[], canvas?: HTMLCanvasElement): Promise<{
    blob: Blob;
    colors: string[];
    colorIndices: number[];
}>;
export declare function imageToBitmap(image: HTMLImageElement, width: number, height: number, colors: string[], bitmapColorIndices: number[], numberOfColors?: number): Promise<{
    blob: Blob;
    bitmap: DisplayBitmap;
}>;
export declare function getBitmapNumberOfBytes(bitmap: DisplayBitmap): number;
export declare function assertValidBitmapPixels(bitmap: DisplayBitmap): void;
export declare function canvasToSprite(canvas: HTMLCanvasElement, spriteName: string, numberOfColors: number, paletteName: string, overridePalette: boolean, spriteSheet: DisplaySpriteSheet, paletteOffset: number): Promise<{
    sprite: DisplaySprite;
    blob: Blob;
}>;
export declare function imageToSprite(image: HTMLImageElement, spriteName: string, width: number, height: number, numberOfColors: number, paletteName: string, overridePalette: boolean, spriteSheet: DisplaySpriteSheet, paletteOffset: number): Promise<{
    sprite: DisplaySprite;
    blob: Blob;
}>;
export declare function canvasToSpriteSheet(canvas: HTMLCanvasElement, spriteSheetName: string, numberOfColors: number, paletteName: string, maxFileLength?: number): Promise<DisplaySpriteSheet>;
export declare function imageToSpriteSheet(image: HTMLImageElement, spriteSheetName: string, width: number, height: number, numberOfColors: number, paletteName: string, maxFileLength?: number): Promise<DisplaySpriteSheet>;
