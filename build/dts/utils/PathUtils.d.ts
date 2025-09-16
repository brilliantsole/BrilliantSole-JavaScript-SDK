import opentype from "opentype.js";
type PathCommand = opentype.PathCommand;
export declare function simplifyPath(commands: PathCommand[], epsilon?: number): PathCommand[];
export {};
