import { DisplayContextCommand } from "./DisplayContextCommand.ts";
export type ParseSvgOptions = {
    fit?: boolean;
    width?: number;
    height?: number;
    aspectRatio?: number;
    offsetX?: number;
    offsetY?: number;
    numberOfColors?: number;
    colors?: string[];
};
export declare function svgToDisplayContextCommands(svgString: string, options?: ParseSvgOptions): {
    commands: DisplayContextCommand[];
    colors: string[];
};
