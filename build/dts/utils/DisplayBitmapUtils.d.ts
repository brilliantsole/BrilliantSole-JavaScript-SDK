import { DisplayContextState } from "./DisplayContextState.ts";
import { DisplayBitmap } from "../DisplayManager.ts";
export declare const drawBitmapHeaderLength: number;
export declare function getBitmapData(bitmap: DisplayBitmap): DataView;
export declare function quantizeImage(image: HTMLImageElement, width: number, height: number, numberOfColors: number): Promise<{
    blob: Blob;
    colors: string[];
    colorIndices: number[];
}>;
export declare function resizeAndQuantizeImage(image: HTMLImageElement, width: number, height: number, colors: string[]): Promise<{
    blob: Blob;
    colorIndices: number[];
}>;
export declare function imageToBitmap(image: HTMLImageElement, width: number, height: number, colors: string[], contextState: DisplayContextState, numberOfColors?: number): Promise<{
    blob: Blob;
    bitmap: DisplayBitmap;
}>;
export declare function getBitmapNumberOfBytes(bitmap: DisplayBitmap): number;
export declare function assertValidBitmapPixels(bitmap: DisplayBitmap): void;
