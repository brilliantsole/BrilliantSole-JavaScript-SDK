import { DisplayColorRGB } from "../DisplayManager.ts";
export declare function hexToRGB(hex: string): DisplayColorRGB;
export declare function colorNameToRGB(colorName: string): DisplayColorRGB;
export declare function stringToRGB(string: string): DisplayColorRGB;
export declare function rgbToHex({ r, g, b }: DisplayColorRGB): string;
