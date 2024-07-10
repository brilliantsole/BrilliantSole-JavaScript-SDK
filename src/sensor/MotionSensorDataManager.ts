import { createConsole } from "../utils/Console";

const _console = createConsole("MotionSensorDataManager", { log: true });

export const MotionSensorTypes = [
  "acceleration",
  "gravity",
  "linearAcceleration",
  "gyroscope",
  "magnetometer",
  "gameRotation",
  "rotation",
  "orientation",
  "activity",
  "stepCounter",
  "stepDetector",
  "deviceOrientation",
] as const;
export type MotionSensorType = (typeof MotionSensorTypes)[number];

export const ContinuousMotionTypes = [
  "acceleration",
  "gravity",
  "linearAcceleration",
  "gyroscope",
  "magnetometer",
  "gameRotation",
  "rotation",
] as const;
export type ContinuousMotionType = (typeof ContinuousMotionTypes)[number];

import { Vector3, Quaternion, Euler } from "../utils/MathUtils";
import { ValueOf } from "../utils/TypeScriptUtils";

export const Vector2Size = 2 * 2;
export const Vector3Size = 3 * 2;
export const QuaternionSize = 4 * 2;

export const ActivityTypes = ["still", "walking", "running", "bicycle", "vehicle", "tilting"] as const;
export type ActivityType = (typeof ActivityTypes)[number];

export interface Activity {
  still: boolean;
  walking: boolean;
  running: boolean;
  bicycle: boolean;
  vehicle: boolean;
  tilting: boolean;
}

export const DeviceOrientations = [
  "portraitUpright",
  "landscapeLeft",
  "portraitUpsideDown",
  "landscapeRight",
  "unknown",
] as const;
export type DeviceOrientation = (typeof DeviceOrientations)[number];

interface AccelerationDataEventMessage {
  acceleration: Vector3;
}
interface GravityDataEventMessage {
  gravity: Vector3;
}
interface LinearAccelerationDataEventMessage {
  linearAcceleration: Vector3;
}
interface GyroscopeDataEventMessage {
  gyroscope: Vector3;
}
interface MagnetometerDataEventMessage {
  magnetomter: Vector3;
}
interface GameRotationDataEventMessage {
  gameRotation: Quaternion;
}
interface RotationDataEventMessage {
  rotation: Quaternion;
}
interface OrientationDataEventMessage {
  orientation: Euler;
}
interface ActivityDataEventMessage {
  activity: Activity;
}
interface StepDetectorDataEventMessage {
  stepDetector: Object;
}
interface StepCounterDataEventMessage {
  stepCounter: number;
}
interface DeviceOrientationDataEventMessage {
  deviceOrientation: DeviceOrientation;
}

export interface MotionSensorDataEventMessages {
  acceleration: AccelerationDataEventMessage;
  gravity: GravityDataEventMessage;
  linearAcceleration: LinearAccelerationDataEventMessage;
  gyroscope: GyroscopeDataEventMessage;
  magnetometer: MagnetometerDataEventMessage;
  gameRotation: GameRotationDataEventMessage;
  rotation: RotationDataEventMessage;
  orientation: OrientationDataEventMessage;
  stepDetector: StepDetectorDataEventMessage;
  stepCounter: StepCounterDataEventMessage;
  activity: ActivityDataEventMessage;
  deviceOrientation: DeviceOrientationDataEventMessage;
}

export type MotionSensorDataEventMessage = ValueOf<MotionSensorDataEventMessages>;

class MotionSensorDataManager {
  parseVector3(dataView: DataView, scalar: number): Vector3 {
    let [x, y, z] = [dataView.getInt16(0, true), dataView.getInt16(2, true), dataView.getInt16(4, true)].map(
      (value) => value * scalar
    );

    const vector: Vector3 = { x, y, z };

    _console.log({ vector });
    return vector;
  }

  parseQuaternion(dataView: DataView, scalar: number): Quaternion {
    let [x, y, z, w] = [
      dataView.getInt16(0, true),
      dataView.getInt16(2, true),
      dataView.getInt16(4, true),
      dataView.getInt16(6, true),
    ].map((value) => value * scalar);

    const quaternion: Quaternion = { x, y, z, w };

    _console.log({ quaternion });
    return quaternion;
  }

  parseEuler(dataView: DataView, scalar: number): Euler {
    let [heading, pitch, roll] = [
      dataView.getInt16(0, true),
      dataView.getInt16(2, true),
      dataView.getInt16(4, true),
    ].map((value) => value * scalar);

    pitch *= -1;
    heading *= -1;

    const euler: Euler = { heading, pitch, roll };

    _console.log({ euler });
    return euler;
  }

  parseStepCounter(dataView: DataView) {
    _console.log("parseStepCounter", dataView);
    const stepCount = dataView.getUint32(0, true);
    _console.log({ stepCount });
    return stepCount;
  }

  parseActivity(dataView: DataView) {
    _console.log("parseActivity", dataView);
    const activity: Partial<Activity> = {};

    const activityBitfield = dataView.getUint8(0);
    _console.log("activityBitfield", activityBitfield.toString(2));
    ActivityTypes.forEach((activityType, index) => {
      activity[activityType] = Boolean(activityBitfield & (1 << index));
    });

    _console.log("activity", activity);

    return activity as Activity;
  }

  parseDeviceOrientation(dataView: DataView) {
    _console.log("parseDeviceOrientation", dataView);
    const index = dataView.getUint8(0);
    const deviceOrientation = DeviceOrientations[index];
    _console.assertWithError(deviceOrientation, "undefined deviceOrientation");
    _console.log({ deviceOrientation });
    return deviceOrientation;
  }
}

export default MotionSensorDataManager;
