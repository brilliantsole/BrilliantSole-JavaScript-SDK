export declare function getInterpolation(value: number, min: number, max: number, range: number): number;
export declare const Uint16Max: number;
export declare function parseTimestamp(dataView: DataView, byteOffset: number): number;
export interface Vector2 {
    x: number;
    y: number;
}
export interface Vector3 extends Vector2 {
    z: number;
}
export interface Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;
}
export interface Euler {
    heading: number;
    pitch: number;
    roll: number;
}
