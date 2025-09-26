import { DisplayContextCommand } from "./DisplayContextCommand.ts";
export type ParseSvgOptions = {
    fit?: boolean;
    width?: number;
    height?: number;
    aspectRatio?: number;
    offsetX?: number;
    offsetY?: number;
};
export declare function svgToDisplayContextCommands(svgString: string, options?: ParseSvgOptions): DisplayContextCommand[];
