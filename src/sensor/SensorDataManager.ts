import { createConsole } from "../utils/Console";
import { parseTimestamp } from "../utils/MathUtils";
import PressureSensorDataManager, { PressureDataMessages, PressureDataMessage } from "./PressureSensorDataManager";
import MotionSensorDataManager, { MotionSensorDataMessages, MotionSensorDataMessage } from "./MotionSensorDataManager";
import BarometerSensorDataManager, {
  BarometerSensorDataMessages,
  BarometerSensorDataMessage,
} from "./BarometerSensorDataManager";
import { parseMessage } from "../utils/ParseUtils";
import EventDispatcher from "../utils/EventDispatcher";

const _console = createConsole("SensorDataManager", { log: true });

import { MotionSensorTypes, ContinuousMotionTypes } from "./MotionSensorDataManager";
import { PressureSensorTypes, ContinuousPressureSensorTypes } from "./PressureSensorDataManager";
import { BarometerSensorTypes, ContinuousBarometerSensorTypes } from "./BarometerSensorDataManager";
import Device from "../Device";

export const SensorTypes = [...MotionSensorTypes, ...PressureSensorTypes, ...BarometerSensorTypes] as const;
export type SensorType = (typeof SensorTypes)[number];

export const SensorEventTypes = [...SensorTypes, "sensorData"] as const;
export type SensorEventType = (typeof SensorEventTypes)[number];

export const ContinuousSensorTypes = [
  ...ContinuousMotionTypes,
  ...ContinuousPressureSensorTypes,
  ...ContinuousBarometerSensorTypes,
] as const;
export type ContinuousSensorType = (typeof ContinuousSensorTypes)[number];

export const SensorDataMessageTypes = ["getPressurePositions", "getSensorScalars", "sensorData"] as const;
export type SensorDataMessageType = (typeof SensorDataMessageTypes)[number];

export const SensorDataManagerEventTypes = [...SensorDataMessageTypes, ...SensorTypes] as const;
export type SensorDataManagerEventType = (typeof SensorDataManagerEventTypes)[number];

export interface BaseSensorDataMessage {
  sensorType: SensorType;
  timestamp: number;
}
export type SensorDataMessage = PressureDataMessage | MotionSensorDataMessage | BarometerSensorDataMessage;
interface AnySensorDataMessages {
  sensorData: SensorDataMessage;
}

export type SensorDataMessages = BarometerSensorDataMessages &
  MotionSensorDataMessages &
  PressureDataMessages &
  AnySensorDataMessages;

class SensorDataManager {
  pressureSensorDataManager = new PressureSensorDataManager();
  motionSensorDataManager = new MotionSensorDataManager();
  barometerSensorDataManager = new BarometerSensorDataManager();

  private scalars: Map<SensorType, number> = new Map();

  static AssertValidSensorType(sensorType: SensorType) {
    _console.assertEnumWithError(sensorType, SensorTypes);
  }
  static AssertValidSensorTypeEnum(sensorTypeEnum: number) {
    _console.assertTypeWithError(sensorTypeEnum, "number");
    _console.assertWithError(sensorTypeEnum in SensorTypes, `invalid sensorTypeEnum ${sensorTypeEnum}`);
  }

  eventDispatcher!: EventDispatcher<typeof Device, SensorEventType, SensorDataMessages>;
  get dispatchEvent() {
    return this.eventDispatcher.dispatchEvent;
  }

  parseMessage(messageType: SensorDataMessageType, dataView: DataView) {
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

  parseScalars(dataView: DataView) {
    for (let byteOffset = 0; byteOffset < dataView.byteLength; byteOffset += 5) {
      const sensorTypeIndex = dataView.getUint8(byteOffset);
      const sensorType = SensorTypes[sensorTypeIndex];
      if (!sensorType) {
        _console.warn(`unknown sensorType index ${sensorTypeIndex}`);
        continue;
      }
      const sensorScalar = dataView.getFloat32(byteOffset + 1, true);
      _console.log({ sensorType, sensorScalar });
      this.scalars.set(sensorType, sensorScalar);
    }
  }

  private parseData(dataView: DataView) {
    _console.log("sensorData", Array.from(new Uint8Array(dataView.buffer)));

    let byteOffset = 0;
    const timestamp = parseTimestamp(dataView, byteOffset);
    byteOffset += 2;

    const _dataView = new DataView(dataView.buffer, byteOffset);

    parseMessage<SensorType>(_dataView, SensorTypes, this.parseDataCallback.bind(this), { timestamp });
  }

  private parseDataCallback(sensorType: SensorType, dataView: DataView, { timestamp }: { timestamp: number }) {
    const scalar = this.scalars.get(sensorType) || 1;

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
        sensorData = this.motionSensorDataManager.parseVector3(dataView, scalar);
        break;
      case "gameRotation":
      case "rotation":
        sensorData = this.motionSensorDataManager.parseQuaternion(dataView, scalar);
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
        sensorData = this.motionSensorDataManager.parseDeviceOrientation(dataView);
        break;
      case "barometer":
        sensorData = this.barometerSensorDataManager.parseData(dataView, scalar);
        break;
      default:
        _console.error(`uncaught sensorType "${sensorType}"`);
    }

    _console.assertWithError(sensorData != null, `no sensorData defined for sensorType "${sensorType}"`);

    _console.log({ sensorType, sensorData });
    // @ts-expect-error
    this.dispatchEvent(sensorType, { sensorType, [sensorType]: sensorData, timestamp });
    // @ts-expect-error
    this.dispatchEvent("sensorData", { sensorType, [sensorType]: sensorData, timestamp });
  }
}

export default SensorDataManager;
