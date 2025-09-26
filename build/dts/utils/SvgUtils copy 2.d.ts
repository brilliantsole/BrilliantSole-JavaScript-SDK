import { DisplayContextCommand } from "./DisplayContextCommand.ts";
export type ParseSvgOptions = {
    crop?: boolean;
    width?: number;
    height?: number;
    aspectRatio?: number;
};
export declare function svgToDisplayContextCommands(svgString: string, options?: ParseSvgOptions): DisplayContextCommand[];
