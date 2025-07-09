import { DisplayBitmap, DisplayContextState } from "../DisplayManager.ts";
export declare function resizeAndQuantizeImage(image: HTMLImageElement, width: number, height: number, colors: string[]): Promise<{
    blob: Blob;
    colorIndices: number[];
}>;
export declare function imageToBitmap(image: HTMLImageElement, width: number, height: number, colors: string[], contextState: DisplayContextState, numberOfColors?: number): Promise<{
    blob: Blob;
    bitmap: DisplayBitmap;
}>;
