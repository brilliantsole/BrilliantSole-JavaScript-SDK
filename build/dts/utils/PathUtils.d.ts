import { Vector2 } from "./MathUtils.ts";
import { DisplayBezierCurve } from "../DisplayManager.ts";
export declare function simplifyCurves(curves: DisplayBezierCurve[], epsilon?: number): DisplayBezierCurve[];
export declare function simplifyPoints(points: Vector2[], tolerance?: number): Vector2[];
export declare function simplifyPointsAsCubicCurveControlPoints(points: Vector2[], error?: number): Vector2[];
