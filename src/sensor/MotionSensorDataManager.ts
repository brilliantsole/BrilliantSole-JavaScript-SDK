import { createConsole } from "../utils/Console.js";

/**
 * @typedef { "acceleration" |
 * "gravity" |
 * "linearAcceleration" |
 * "gyroscope" |
 * "magnetometer" |
 * "gameRotation" |
 * "rotation" |
 * "orientation" |
 * "activity" |
 * "stepCounter" |
 * "stepDetector" |
 * "deviceOrientation"
 * } MotionSensorType
 */

const _console = createConsole("MotionSensorDataManager", { log: true });

/**
 * @typedef {Object} Vector3
 * @property {number} x
 * @property {number} y
 * @property {number} z
 */

/**
 * @typedef {Object} Quaternion
 * @property {number} x
 * @property {number} y
 * @property {number} z
 * @property {number} w
 */

/**
 * @typedef {Object} Euler
 * @property {number} heading
 * @property {number} pitch
 * @property {number} roll
 */

/**
 * @typedef {"still" |
 * "walking" |
 * "running" |
 * "bicycle" |
 * "vehicle" |
 * "tilting"
 * } ActivityType
 */

/**
 * @typedef {Object} Activity
 * @property {boolean} still
 * @property {boolean} walking
 * @property {boolean} running
 * @property {boolean} bicycle
 * @property {boolean} vehicle
 * @property {boolean} tilting
 */

/**
 * @typedef {"portraitUpright" |
 * "landscapeLeft" |
 * "portraitUpsideDown" |
 * "landscapeRight" |
 * "unknown"
 * } DeviceOrientation
 */

/** @typedef {import("./SensorDataManager.js").BaseSensorDataEventMessage} BaseSensorDataEventMessage */
/** @typedef {import("../Device.js").BaseDeviceEvent} BaseDeviceEvent */

/**
 * @typedef {Object} BaseAccelerationDataEventMessage
 * @property {Vector3} acceleration
 */
/** @typedef {BaseSensorDataEventMessage & BaseAccelerationDataEventMessage} AccelerationDataEventMessage */
/**
 * @typedef {Object} BaseAccelerationDataEvent
 * @property {"acceleration"} type
 * @property {AccelerationDataEventMessage} message
 */
/** @typedef {BaseDeviceEvent & BaseAccelerationDataEvent} AccelerationDataEvent */

/**
 * @typedef {Object} BaseGravityDataEventMessage
 * @property {Vector3} gravity
 */
/** @typedef {BaseSensorDataEventMessage & BaseGravityDataEventMessage} GravityDataEventMessage */
/**
 * @typedef {Object} BaseGravityDataEvent
 * @property {"gravity"} type
 * @property {GravityDataEventMessage & BaseSensorDataEventMessage} message
 */
/** @typedef {BaseDeviceEvent & BaseGravityDataEvent} GravityDataEvent */

/**
 * @typedef {Object} BaseLinearAccelerationDataEventMessage
 * @property {Vector3} linearAcceleration
 */
/** @typedef {BaseSensorDataEventMessage & BaseLinearAccelerationDataEventMessage} LinearAccelerationDataEventMessage */
/**
 * @typedef {Object} BaseLinearAccelerationDataEvent
 * @property {"linearAcceleration"} type
 * @property {LinearAccelerationDataEventMessage & BaseSensorDataEventMessage} message
 */
/** @typedef {BaseDeviceEvent & BaseLinearAccelerationDataEvent} LinearAccelerationDataEvent */

/**
 * @typedef {Object} BaseGyroscopeDataEventMessage
 * @property {Vector3} gyroscope
 */
/** @typedef {BaseSensorDataEventMessage & BaseGyroscopeDataEventMessage} GyroscopeDataEventMessage */
/**
 * @typedef {Object} BaseGyroscopeDataEvent
 * @property {"gyroscope"} type
 * @property {GyroscopeDataEventMessage & BaseSensorDataEventMessage} message
 */
/** @typedef {BaseDeviceEvent & BaseGyroscopeDataEvent} GyroscopeDataEvent */

/**
 * @typedef {Object} BaseMagnetometerDataEventMessage
 * @property {Vector3} magnetometer
 */
/** @typedef {BaseSensorDataEventMessage & BaseMagnetometerDataEventMessage} MagnetometerDataEventMessage */
/**
 * @typedef {Object} BaseMagnetometerDataEvent
 * @property {"magnetometer"} type
 * @property {MagnetometerDataEventMessage & BaseSensorDataEventMessage} message
 */
/** @typedef {BaseDeviceEvent & BaseMagnetometerDataEvent} MagnetometerDataEvent */

/**
 * @typedef {Object} BaseGameRotationDataEventMessage
 * @property {Quaternion} gameRotation
 */
/** @typedef {BaseSensorDataEventMessage & BaseGameRotationDataEventMessage} GameRotationDataEventMessage */
/**
 * @typedef {Object} BaseGameRotationDataEvent
 * @property {"gameRotation"} type
 * @property {GameRotationDataEventMessage & BaseSensorDataEventMessage} message
 */
/** @typedef {BaseDeviceEvent & BaseGameRotationDataEvent} GameRotationDataEvent */

/**
 * @typedef {Object} BaseRotationDataEventMessage
 * @property {Quaternion} rotation
 */
/** @typedef {BaseSensorDataEventMessage & BaseRotationDataEventMessage} RotationDataEventMessage */
/**
 * @typedef {Object} BaseRotationDataEvent
 * @property {"rotation"} type
 * @property {RotationDataEventMessage & BaseSensorDataEventMessage} message
 */
/** @typedef {BaseDeviceEvent & BaseRotationDataEvent} RotationDataEvent */

/**
 * @typedef {Object} BaseOrientationDataEventMessage
 * @property {Euler} orientation
 */
/** @typedef {BaseSensorDataEventMessage & BaseOrientationDataEventMessage} OrientationDataEventMessage */
/**
 * @typedef {Object} BaseOrientationDataEvent
 * @property {"orientation"} type
 * @property {OrientationDataEventMessage & BaseSensorDataEventMessage} message
 */
/** @typedef {BaseDeviceEvent & BaseOrientationDataEvent} OrientationDataEvent */

/**
 * @typedef {Object} BaseActivityDataEventMessage
 * @property {Activity} activity
 */
/** @typedef {BaseSensorDataEventMessage & BaseActivityDataEventMessage} ActivityDataEventMessage */
/**
 * @typedef {Object} BaseActivityDataEvent
 * @property {"activity"} type
 * @property {ActivityDataEventMessage & BaseSensorDataEventMessage} message
 */
/** @typedef {BaseDeviceEvent & BaseActivityDataEvent} ActivityDataEvent */

/**
 * @typedef {Object} BaseStepDetectorDataEventMessage
 * @property {Object} stepDetector
 */
/** @typedef {BaseSensorDataEventMessage & BaseStepDetectorDataEventMessage} StepDetectorDataEventMessage */
/**
 * @typedef {Object} BaseStepDetectorDataEvent
 * @property {"stepDetector"} type
 * @property {StepDetectorDataEventMessage & BaseSensorDataEventMessage} message
 */
/** @typedef {BaseDeviceEvent & BaseStepDetectorDataEvent} StepDetectorDataEvent */

/**
 * @typedef {Object} BaseStepCounterDataEventMessage
 * @property {number} stepCounter
 */
/** @typedef {BaseSensorDataEventMessage & BaseStepCounterDataEventMessage} StepCounterDataEventMessage */
/**
 * @typedef {Object} BaseStepCounterDataEvent
 * @property {"stepCounter"} type
 * @property {StepCounterDataEventMessage & BaseSensorDataEventMessage} message
 */
/** @typedef {BaseDeviceEvent & BaseStepCounterDataEvent} StepCounterDataEvent */

/**
 * @typedef {Object} BaseDeviceOrientationDataEventMessage
 * @property {DeviceOrientation} deviceOrientation
 */
/** @typedef {BaseSensorDataEventMessage & BaseDeviceOrientationDataEventMessage} DeviceOrientationDataEventMessage */
/**
 * @typedef {Object} BaseDeviceOrientationDataEvent
 * @property {"deviceOrientation"} type
 * @property {DeviceOrientationDataEventMessage & BaseSensorDataEventMessage} message
 */
/** @typedef {BaseDeviceEvent & BaseDeviceOrientationDataEvent} DeviceOrientationDataEvent */

/**
 * @typedef {AccelerationDataEventMessage |
 * GravityDataEventMessage |
 * LinearAccelerationDataEventMessage |
 * GyroscopeDataEventMessage |
 * MagnetometerDataEventMessage |
 * GameRotationDataEventMessage |
 * RotationDataEventMessage |
 * OrientationDataEventMessage |
 * ActivityDataEventMessage |
 * StepDetectorDataEventMessage |
 * StepCounterDataEventMessage |
 * DeviceOrientationDataEventMessage
 * } MotionSensorDataEventMessage
 */
/**
 *
 * @typedef { AccelerationDataEvent |
 * GravityDataEvent |
 * LinearAccelerationDataEvent |
 * GyroscopeDataEvent |
 * MagnetometerDataEvent |
 * GameRotationDataEvent |
 * RotationDataEvent |
 * OrientationDataEvent |
 * ActivityDataEvent |
 * StepDetectorDataEvent |
 * StepCounterDataEvent |
 * DeviceOrientationDataEvent
 * } MotionSensorDataEvent
 */

class MotionSensorDataManager {
  /** @type {MotionSensorType[]} */
  static #Types = [
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
  ];
  static get Types() {
    return this.#Types;
  }
  static #ContinuousTypes = this.#Types.filter((type) => {
    switch (type) {
      case "orientation":
      case "activity":
      case "stepCounter":
      case "stepDetector":
      case "deviceOrientation":
        return false;
      default:
        return true;
    }
  });
  static get ContinuousTypes() {
    return this.#ContinuousTypes;
  }

  static #Vector3Size = 3 * 2;
  static get Vector3Size() {
    return this.#Vector3Size;
  }
  get vector3Size() {
    return MotionSensorDataManager.Vector3Size;
  }

  /**
   * @param {DataView} dataView
   * @param {number} scalar
   * @returns {Vector3}
   */
  parseVector3(dataView, scalar) {
    let [x, y, z] = [dataView.getInt16(0, true), dataView.getInt16(2, true), dataView.getInt16(4, true)].map(
      (value) => value * scalar
    );

    /** @type {Vector3} */
    const vector = { x, y, z };

    _console.log({ vector });
    return vector;
  }

  static #QuaternionSize = 4 * 2;
  static get QuaternionSize() {
    return this.#QuaternionSize;
  }
  get quaternionSize() {
    return MotionSensorDataManager.QuaternionSize;
  }

  /**
   * @param {DataView} dataView
   * @param {number} scalar
   * @returns {Quaternion}
   */
  parseQuaternion(dataView, scalar) {
    let [x, y, z, w] = [
      dataView.getInt16(0, true),
      dataView.getInt16(2, true),
      dataView.getInt16(4, true),
      dataView.getInt16(6, true),
    ].map((value) => value * scalar);

    /** @type {Quaternion} */
    const quaternion = { x, y, z, w };

    _console.log({ quaternion });
    return quaternion;
  }

  static #EulerSize = 3 * 2;
  static get EulerSize() {
    return this.#EulerSize;
  }
  get eulerSize() {
    return MotionSensorDataManager.EulerSize;
  }

  /**
   * @param {DataView} dataView
   * @param {number} scalar
   * @returns {Euler}
   */
  parseEuler(dataView, scalar) {
    let [heading, pitch, roll] = [
      dataView.getInt16(0, true),
      dataView.getInt16(2, true),
      dataView.getInt16(4, true),
    ].map((value) => value * scalar);

    pitch *= -1;
    heading *= -1;

    /** @type {Euler} */
    const euler = { heading, pitch, roll };

    _console.log({ euler });
    return euler;
  }

  /** @param {DataView} dataView */
  parseStepCounter(dataView) {
    _console.log("parseStepCounter", dataView);
    const stepCount = dataView.getUint32(0, true);
    _console.log({ stepCount });
    return stepCount;
  }

  /** @type {ActivityType[]} */
  static #ActivityTypes = ["still", "walking", "running", "bicycle", "vehicle", "tilting"];
  static get ActivityTypes() {
    return this.#ActivityTypes;
  }
  get #activityTypes() {
    return MotionSensorDataManager.#ActivityTypes;
  }
  /** @param {DataView} dataView */
  parseActivity(dataView) {
    _console.log("parseActivity", dataView);
    /** @type {Activity} */
    const activity = {};

    const activityBitfield = dataView.getUint8(0);
    _console.log("activityBitfield", activityBitfield.toString(2));
    this.#activityTypes.forEach((activityType, index) => {
      activity[activityType] = Boolean(activityBitfield & (1 << index));
    });

    _console.log("activity", activity);

    return activity;
  }

  /** @type {DeviceOrientation[]} */
  static #DeviceOrientations = ["portraitUpright", "landscapeLeft", "portraitUpsideDown", "landscapeRight", "unknown"];
  static get DeviceOrientations() {
    return this.#DeviceOrientations;
  }
  get #deviceOrientations() {
    return MotionSensorDataManager.#DeviceOrientations;
  }
  /** @param {DataView} dataView */
  parseDeviceOrientation(dataView) {
    _console.log("parseDeviceOrientation", dataView);
    const index = dataView.getUint8(0);
    const deviceOrientation = this.#deviceOrientations[index];
    _console.assertWithError(deviceOrientation, "undefined deviceOrientation");
    _console.log({ deviceOrientation });
    return deviceOrientation;
  }
}

export default MotionSensorDataManager;
