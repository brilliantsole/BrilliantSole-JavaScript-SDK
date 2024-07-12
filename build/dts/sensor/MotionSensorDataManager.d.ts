export declare const MotionSensorTypes: readonly ["acceleration", "gravity", "linearAcceleration", "gyroscope", "magnetometer", "gameRotation", "rotation", "orientation", "activity", "stepCounter", "stepDetector", "deviceOrientation"];
export type MotionSensorType = (typeof MotionSensorTypes)[number];
export declare const ContinuousMotionTypes: readonly ["acceleration", "gravity", "linearAcceleration", "gyroscope", "magnetometer", "gameRotation", "rotation"];
export type ContinuousMotionType = (typeof ContinuousMotionTypes)[number];
import { Vector3, Quaternion, Euler } from "../utils/MathUtils";
import { ValueOf } from "../utils/TypeScriptUtils";
export declare const Vector2Size: number;
export declare const Vector3Size: number;
export declare const QuaternionSize: number;
export declare const ActivityTypes: readonly ["still", "walking", "running", "bicycle", "vehicle", "tilting"];
export type ActivityType = (typeof ActivityTypes)[number];
export interface Activity {
    still: boolean;
    walking: boolean;
    running: boolean;
    bicycle: boolean;
    vehicle: boolean;
    tilting: boolean;
}
export declare const DeviceOrientations: readonly ["portraitUpright", "landscapeLeft", "portraitUpsideDown", "landscapeRight", "unknown"];
export type DeviceOrientation = (typeof DeviceOrientations)[number];
export interface MotionSensorDataEventMessages {
    acceleration: {
        acceleration: Vector3;
    };
    gravity: {
        gravity: Vector3;
    };
    linearAcceleration: {
        linearAcceleration: Vector3;
    };
    gyroscope: {
        gyroscope: Vector3;
    };
    magnetometer: {
        magnetomter: Vector3;
    };
    gameRotation: {
        gameRotation: Quaternion;
    };
    rotation: {
        rotation: Quaternion;
    };
    orientation: {
        orientation: Euler;
    };
    stepDetector: {
        stepDetector: Object;
    };
    stepCounter: {
        stepCounter: number;
    };
    activity: {
        activity: Activity;
    };
    deviceOrientation: {
        deviceOrientation: DeviceOrientation;
    };
}
export type MotionSensorDataEventMessage = ValueOf<MotionSensorDataEventMessages>;
declare class MotionSensorDataManager {
    parseVector3(dataView: DataView, scalar: number): Vector3;
    parseQuaternion(dataView: DataView, scalar: number): Quaternion;
    parseEuler(dataView: DataView, scalar: number): Euler;
    parseStepCounter(dataView: DataView): number;
    parseActivity(dataView: DataView): Activity;
    parseDeviceOrientation(dataView: DataView): "portraitUpright" | "landscapeLeft" | "portraitUpsideDown" | "landscapeRight" | "unknown";
}
export default MotionSensorDataManager;
