import { DisplayColorRGB } from "./DisplayUtils.ts";
export declare function hexToRGB(hex: string): DisplayColorRGB;
export declare const blackColor: DisplayColorRGB;
export declare function colorNameToRGB(colorName: string): DisplayColorRGB;
export declare function stringToRGB(string: string): DisplayColorRGB;
export declare function rgbToHex({ r, g, b }: DisplayColorRGB): string;
export declare function colorDistanceSq(a: DisplayColorRGB, b: DisplayColorRGB): number;
export interface KMeansOptions {
    useInputColors?: boolean;
    maxIterations?: number;
}
export declare const defaultKMeansOptions: KMeansOptions;
export interface KMeansResult {
    palette: string[];
    mapping: Record<string, number>;
}
export declare function kMeansColors(colors: string[], k: number, options?: KMeansOptions): KMeansResult;
export declare function mapToClosestPaletteIndex(colors: string[], palette: string[]): Record<string, number>;
