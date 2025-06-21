import { DisplayColorRGB } from "../DisplayManager.ts";
export declare function hexToRGB(hex: string): DisplayColorRGB;
export declare function colorNameToRGBObject(colorName: string): {
    r: number;
    g: number;
    b: number;
} | undefined;
export declare function rgbToHex({ r, g, b }: DisplayColorRGB): string;
