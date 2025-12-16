import { createConsole } from "../utils/Console.ts";
import { parseTimestamp } from "../utils/MathUtils.ts";
import PressureSensorDataManager, {
  PressureDataEventMessages,
} from "./PressureSensorDataManager.ts";
import MotionSensorDataManager, {
  MotionSensorDataEventMessages,
} from "./MotionSensorDataManager.ts";
import BarometerSensorDataManager, {
  BarometerSensorDataEventMessages,
} from "./BarometerSensorDataManager.ts";
import { parseMessage } from "../utils/ParseUtils.ts";
import EventDispatcher from "../utils/EventDispatcher.ts";
import {
  MotionSensorTypes,
  ContinuousMotionTypes,
} from "./MotionSensorDataManager.ts";
import {
  PressureSensorTypes,
  ContinuousPressureSensorTypes,
} from "./PressureSensorDataManager.ts";
import {
  BarometerSensorTypes,
  ContinuousBarometerSensorTypes,
} from "./BarometerSensorDataManager.ts";
import Device from "../Device.ts";
import {
  AddKeysAsPropertyToInterface,
  ExtendInterfaceValues,
  ValueOf,
} from "../utils/TypeScriptUtils.ts";
import { CameraSensorTypes } from "../CameraManager.ts";
import { MicrophoneSensorTypes } from "../MicrophoneManager.ts";

const _console = createConsole("SensorDataManager", { log: false });

export const SensorTypes = [
  ...PressureSensorTypes,
  ...MotionSensorTypes,
  ...BarometerSensorTypes,
  ...CameraSensorTypes,
  ...MicrophoneSensorTypes,
] as const;
export type SensorType = (typeof SensorTypes)[number];

export const ContinuousSensorTypes = [
  ...ContinuousPressureSensorTypes,
  ...ContinuousMotionTypes,
  ...ContinuousBarometerSensorTypes,
] as const;
export type ContinuousSensorType = (typeof ContinuousSensorTypes)[number];

export const SensorDataMessageTypes = [
  "getPressurePositions",
  "getSensorScalars",
  "sensorData",
] as const;
export type SensorDataMessageType = (typeof SensorDataMessageTypes)[number];

export const RequiredPressureMessageTypes: SensorDataMessageType[] = [
  "getPressurePositions",
] as const;

export const SensorDataEventTypes = [
  ...SensorDataMessageTypes,
  ...SensorTypes,
] as const;
export type SensorDataEventType = (typeof SensorDataEventTypes)[number];

interface BaseSensorDataEventMessage {
  timestamp: number;
  isLast: boolean;
}

type BaseSensorDataEventMessages = BarometerSensorDataEventMessages &
  MotionSensorDataEventMessages &
  PressureDataEventMessages;
type _SensorDataEventMessages = ExtendInterfaceValues<
  AddKeysAsPropertyToInterface<BaseSensorDataEventMessages, "sensorType">,
  BaseSensorDataEventMessage
>;
export type SensorDataEventMessage = ValueOf<_SensorDataEventMessages>;
interface AnySensorDataEventMessages {
  sensorData: SensorDataEventMessage;
  isLast: boolean;
}
export type SensorDataEventMessages = _SensorDataEventMessages &
  AnySensorDataEventMessages;

export type SensorDataEventDispatcher = EventDispatcher<
  Device,
  SensorDataEventType,
  SensorDataEventMessages
>;

class SensorDataManager {
  pressureSensorDataManager = new PressureSensorDataManager();
  motionSensorDataManager = new MotionSensorDataManager();
  barometerSensorDataManager = new BarometerSensorDataManager();

  #scalars: Map<SensorType, number> = new Map();

  static AssertValidSensorType(sensorType: SensorType) {
    _console.assertEnumWithError(sensorType, SensorTypes);
  }
  static AssertValidSensorTypeEnum(sensorTypeEnum: number) {
    _console.assertTypeWithError(sensorTypeEnum, "number");
    _console.assertWithError(
      sensorTypeEnum in SensorTypes,
      `invalid sensorTypeEnum ${sensorTypeEnum}`
    );
  }

  eventDispatcher!: SensorDataEventDispatcher;
  get dispatchEvent() {
    return this.eventDispatcher.dispatchEvent;
  }

  parseMessage(
    messageType: SensorDataMessageType,
    dataView: DataView<ArrayBuffer>
  ) {
    _console.log({ messageType });

    switch (messageType) {
      case "getSensorScalars":
        this.parseScalars(dataView);
        break;
      case "getPressurePositions":
        this.pressureSensorDataManager.parsePositions(dataView);
        break;
      case "sensorData":
        this.parseData(dataView);
        break;
      default:
        throw Error(`uncaught messageType ${messageType}`);
    }
  }

  parseScalars(dataView: DataView<ArrayBuffer>) {
    for (
      let byteOffset = 0;
      byteOffset < dataView.byteLength;
      byteOffset += 5
    ) {
      const sensorTypeIndex = dataView.getUint8(byteOffset);
      const sensorType = SensorTypes[sensorTypeIndex];
      if (!sensorType) {
        _console.warn(`unknown sensorType index ${sensorTypeIndex}`);
        continue;
      }
      const sensorScalar = dataView.getFloat32(byteOffset + 1, true);
      _console.log({ sensorType, sensorScalar });
      this.#scalars.set(sensorType, sensorScalar);
    }
  }

  private parseData(dataView: DataView<ArrayBuffer>) {
    _console.log("sensorData", Array.from(new Uint8Array(dataView.buffer)));

    let byteOffset = 0;
    const timestamp = parseTimestamp(dataView, byteOffset);
    byteOffset += 2;

    const _dataView = new DataView(dataView.buffer, byteOffset);

    parseMessage(_dataView, SensorTypes, this.parseDataCallback.bind(this), {
      timestamp,
    });
  }

  private parseDataCallback(
    sensorType: SensorType,
    dataView: DataView<ArrayBuffer>,
    { timestamp }: { timestamp: number },
    isLast?: boolean
  ) {
    const scalar = this.#scalars.get(sensorType) || 1;

    let sensorData = null;
    switch (sensorType) {
      case "pressure":
        sensorData = this.pressureSensorDataManager.parseData(dataView, scalar);
        break;
      case "acceleration":
      case "gravity":
      case "linearAcceleration":
      case "gyroscope":
      case "magnetometer":
        sensorData = this.motionSensorDataManager.parseVector3(
          dataView,
          scalar
        );
        break;
      case "gameRotation":
      case "rotation":
        sensorData = this.motionSensorDataManager.parseQuaternion(
          dataView,
          scalar
        );
        break;
      case "orientation":
        sensorData = this.motionSensorDataManager.parseEuler(dataView, scalar);
        break;
      case "stepCounter":
        sensorData = this.motionSensorDataManager.parseStepCounter(dataView);
        break;
      case "stepDetector":
        sensorData = {};
        break;
      case "activity":
        sensorData = this.motionSensorDataManager.parseActivity(dataView);
        break;
      case "deviceOrientation":
        sensorData =
          this.motionSensorDataManager.parseDeviceOrientation(dataView);
        break;
      case "tapDetector":
        sensorData = {};
        break;
      case "barometer":
        sensorData = this.barometerSensorDataManager.parseData(
          dataView,
          scalar
        );
        break;
      case "camera":
        // we parse camera data using CameraManager
        return;
      case "microphone":
        // we parse microphone data using MicrophoneManager
        return;
      default:
        _console.error(`uncaught sensorType "${sensorType}"`);
    }

    _console.assertWithError(
      sensorData != null,
      `no sensorData defined for sensorType "${sensorType}"`
    );

    _console.log({ sensorType, sensorData });

    // @ts-expect-error
    this.dispatchEvent(sensorType, {
      sensorType,
      [sensorType]: sensorData,
      timestamp,
      isLast: isLast!,
    });
    // @ts-expect-error
    this.dispatchEvent("sensorData", {
      sensorType,
      [sensorType]: sensorData,
      timestamp,
      isLast: isLast!,
    });
  }
}

export default SensorDataManager;
