import { createConsole } from "../utils/Console.ts";
import { Euler, parseTimestamp } from "../utils/MathUtils.ts";
import PressureSensorDataManager, {
  PressureDataEventMessages,
  PressureSensorEventDispatcher,
  PressureSensorEventMessages,
  PressureSensorEventTypes,
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
import ButtonSensorDataManager, {
  ButtonSensorDataEventMessages,
  ButtonSensorEventDispatcher,
  ButtonSensorEventMessages,
  ButtonSensorEventTypes,
  ButtonSensorTypes,
} from "./ButtonSensorDataManager.ts";
import TouchSensorDataManager, {
  TouchSensorDataEventMessages,
  TouchSensorEventDispatcher,
  TouchSensorEventMessages,
  TouchSensorEventTypes,
  TouchSensorTypes,
} from "./TouchSensorDataManager.ts";
import Device from "../Device.ts";
import {
  AddKeysAsPropertyToInterface,
  ExtendInterfaceValues,
  ValueOf,
} from "../utils/TypeScriptUtils.ts";
import { CameraSensorTypes } from "../CameraManager.ts";
import { MicrophoneSensorTypes } from "../MicrophoneManager.ts";
import autoBind from "auto-bind";
import LightSensorDataManager, {
  ContinuousLightSensorTypes,
  LightSensorDataEventMessages,
  LightSensorTypes,
} from "./LightSensorDataManager.ts";

const _console = createConsole("SensorDataManager", { log: false });

export const SensorTypes = [
  ...PressureSensorTypes,
  ...MotionSensorTypes,
  ...BarometerSensorTypes,
  ...CameraSensorTypes,
  ...MicrophoneSensorTypes,
  ...ButtonSensorTypes,
  ...TouchSensorTypes,
  ...LightSensorTypes,
] as const;
export type SensorType = (typeof SensorTypes)[number];

export const ContinuousSensorTypes = [
  ...ContinuousPressureSensorTypes,
  ...ContinuousMotionTypes,
  ...ContinuousBarometerSensorTypes,
  ...ContinuousLightSensorTypes,
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
  ...PressureSensorEventTypes,
  ...ButtonSensorEventTypes,
  ...TouchSensorEventTypes,
] as const;
export type SensorDataEventType = (typeof SensorDataEventTypes)[number];

interface BaseSensorDataEventMessage {
  timestamp: number;
  isLast: boolean;
}

type BaseSensorDataEventMessages = BarometerSensorDataEventMessages &
  MotionSensorDataEventMessages &
  PressureDataEventMessages &
  ButtonSensorDataEventMessages &
  TouchSensorDataEventMessages &
  LightSensorDataEventMessages;
type _SensorDataEventMessages = ExtendInterfaceValues<
  AddKeysAsPropertyToInterface<BaseSensorDataEventMessages, "sensorType">,
  BaseSensorDataEventMessage
>;
export type SensorDataEventMessage = ValueOf<_SensorDataEventMessages>;
interface AnySensorDataEventMessages {
  sensorData: SensorDataEventMessage;
  isLast: boolean;
}
export type SensorDataEventMessages = (_SensorDataEventMessages &
  AnySensorDataEventMessages) &
  PressureSensorEventMessages &
  ButtonSensorEventMessages &
  TouchSensorEventMessages;

export type SensorDataEventDispatcher = EventDispatcher<
  Device,
  SensorDataEventType,
  SensorDataEventMessages
>;

export type SensorDataParseContext = {
  timestamp: number;
  euler?: Euler;
  messages: {
    [T in keyof _SensorDataEventMessages]: {
      sensorType: T;
      message: _SensorDataEventMessages[T];
      dataView?: DataView<ArrayBuffer>;
    };
  }[keyof _SensorDataEventMessages][];
};

export const SensorMetaDataMessageTypes = ["getSensorCounts"] as const;
export type SensorMetaDataMessageType =
  (typeof SensorMetaDataMessageTypes)[number];

export const RequiredSensorMetaDataMessageTypes: SensorMetaDataMessageType[] = [
  "getSensorCounts",
] as const;

export const SensorMetaDataEventTypes = [
  ...SensorMetaDataMessageTypes,
] as const;
export type SensorMetaDataEventType = (typeof SensorMetaDataEventTypes)[number];

export interface SensorMetaDataEventMessages {
  // getSensorCounts: { sensorCounts: Partial<Record<SensorType, number>> };
}

export type SensorMetaDataEventDispatcher = EventDispatcher<
  Device,
  SensorMetaDataEventType,
  SensorMetaDataEventMessages
>;

export function parseSensorData(
  dataView: DataView<ArrayBuffer>,
  callback: (
    sensorType: SensorType,
    dataView: DataView<ArrayBuffer>,
    context: SensorDataParseContext,
    isLast?: boolean,
  ) => void,
) {
  _console.log("sensorData", Array.from(new Uint8Array(dataView.buffer)));

  let byteOffset = 0;
  const timestamp = parseTimestamp(dataView, byteOffset);
  byteOffset += 2;

  const _dataView = new DataView(dataView.buffer, byteOffset);

  const context: SensorDataParseContext = {
    timestamp,
    messages: [],
  };
  parseMessage(_dataView, SensorTypes, callback, context);
  return context;
}

class SensorDataManager {
  constructor() {
    autoBind(this);
  }

  pressureSensorDataManager = new PressureSensorDataManager();
  motionSensorDataManager = new MotionSensorDataManager();
  barometerSensorDataManager = new BarometerSensorDataManager();
  buttonSensorDataManager = new ButtonSensorDataManager();
  touchSensorDataManager = new TouchSensorDataManager();
  lightSensorDataManager = new LightSensorDataManager();

  #scalars: Map<SensorType, number> = new Map();
  #counts: Map<SensorType, number> = new Map();

  static AssertValidSensorType(sensorType: SensorType) {
    _console.assertEnumWithError(SensorTypes, sensorType);
  }
  static AssertValidSensorTypeEnum(sensorTypeEnum: number) {
    _console.assertTypeWithError(sensorTypeEnum, "number");
    _console.assertWithError(
      sensorTypeEnum in SensorTypes,
      `invalid sensorTypeEnum ${sensorTypeEnum}`,
    );
  }

  #eventDispatcher!: SensorDataEventDispatcher & SensorMetaDataEventDispatcher;
  get eventDispatcher() {
    return this.#eventDispatcher;
  }
  set eventDispatcher(eventDispatcher) {
    if (this.#eventDispatcher == eventDispatcher) {
      return;
    }
    _console.assertWithError(
      !this.#eventDispatcher,
      "eventDispatcher already defined",
    );
    this.#eventDispatcher = eventDispatcher;
    this.pressureSensorDataManager.eventDispatcher =
      eventDispatcher as PressureSensorEventDispatcher;
    this.buttonSensorDataManager.eventDispatcher =
      eventDispatcher as ButtonSensorEventDispatcher;
    this.touchSensorDataManager.eventDispatcher =
      eventDispatcher as TouchSensorEventDispatcher;
  }

  get dispatchEvent() {
    return this.eventDispatcher.dispatchEvent;
  }

  parseMessage(
    messageType: SensorDataMessageType | SensorMetaDataMessageType,
    dataView: DataView<ArrayBuffer>,
    isSending?: boolean,
  ) {
    _console.log({ messageType, isSending }, dataView);

    switch (messageType) {
      case "getSensorScalars":
        this.#parseScalars(dataView);
        break;
      case "getPressurePositions":
        this.pressureSensorDataManager.parsePositions(dataView);
        break;
      case "sensorData":
        this.#parseData(dataView);
        break;
      case "getSensorCounts":
        this.#parseCounts(dataView);
        break;
      default:
        throw Error(`uncaught messageType ${messageType}`);
    }
  }

  #parseScalars(dataView: DataView<ArrayBuffer>) {
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

  #parseCounts(dataView: DataView<ArrayBuffer>) {
    for (
      let byteOffset = 0;
      byteOffset < dataView.byteLength;
      byteOffset += 2
    ) {
      const sensorTypeIndex = dataView.getUint8(byteOffset);
      const sensorType = SensorTypes[sensorTypeIndex];
      if (!sensorType) {
        _console.warn(`unknown sensorType index ${sensorTypeIndex}`);
        continue;
      }
      const sensorCount = dataView.getUint8(byteOffset + 1);
      _console.log({ sensorType, sensorCount });
      this.#counts.set(sensorType, sensorCount);

      switch (sensorType) {
        case "buttons":
          this.buttonSensorDataManager.numberOfButtons = sensorCount;
          break;
        case "touches":
          this.touchSensorDataManager.numberOfTouches = sensorCount;
          break;
        default:
          _console.warn(`uncaught count for sensorType "${sensorType}"`);
          break;
      }
    }
  }

  #parseData(dataView: DataView<ArrayBuffer>) {
    const context = parseSensorData(
      dataView,
      this.#parseDataCallback.bind(this),
    );
    const { messages, timestamp, euler } = context;

    messages.forEach(({ sensorType, message, dataView }) => {
      if (sensorType == "pressure") {
        if (euler) {
          this.pressureSensorDataManager.onEuler(euler, timestamp);
        }
        const scalar = this.#scalars.get("pressure") || 1;
        message.pressure = this.pressureSensorDataManager.parseData(
          dataView!,
          scalar,
          timestamp,
        );
      }

      this.dispatchEvent(sensorType, message);
      this.dispatchEvent("sensorData", message);
    });
  }

  #parseDataCallback(
    sensorType: SensorType,
    dataView: DataView<ArrayBuffer>,
    context: SensorDataParseContext,
    isLast?: boolean,
  ) {
    const { timestamp, messages } = context;

    const scalar = this.#scalars.get(sensorType) || 1;

    let sensorData = null;
    let sensorDataEuler = null;
    switch (sensorType) {
      case "pressure":
        // parse afterward in case euler is parsed
        break;
      case "acceleration":
      case "gravity":
      case "linearAcceleration":
      case "gyroscope":
      case "magnetometer":
        sensorData = this.motionSensorDataManager.parseVector3(
          dataView,
          scalar,
        );
        break;
      case "gameRotation":
      case "rotation":
        sensorData = this.motionSensorDataManager.parseQuaternion(
          dataView,
          scalar,
        );
        sensorDataEuler = this.motionSensorDataManager.quaternionToEuler(
          sensorData,
          sensorType == "rotation",
        );
        break;
      case "orientation":
        sensorData = this.motionSensorDataManager.parseEuler(
          dataView,
          scalar,
          true,
        );
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
          scalar,
        );
        break;
      case "buttons":
        sensorData = this.buttonSensorDataManager.parseData(dataView);
        break;
      case "touches":
        sensorData = this.touchSensorDataManager.parseData(dataView);
        break;
      case "camera":
        // we parse camera data using CameraManager
        return;
      case "microphone":
        // we parse microphone data using MicrophoneManager
        return;
      case "light":
        sensorData = this.lightSensorDataManager.parseData(dataView, scalar);
        break;
      default:
        _console.error(`uncaught sensorType "${sensorType}"`);
    }

    _console.assertWithError(
      sensorData != null || sensorType == "pressure",
      `no sensorData defined for sensorType "${sensorType}"`,
    );

    _console.log({ sensorType, sensorData });

    const message = {
      sensorType,
      [sensorType]: sensorData,
      timestamp,
      isLast: isLast!,
    };
    if (sensorType == "pressure") {
      message.dataView = dataView;
    }
    if (sensorDataEuler) {
      message[`${sensorType}Euler`] = sensorDataEuler;
      context.euler = sensorDataEuler;
    }

    messages.push({
      sensorType,
      // @ts-expect-error
      message,
      dataView: sensorType == "pressure" ? dataView : undefined,
    });
  }

  clear() {
    _console.log("clear");
    // this.pressureSensorDataManager.resetRange();
    this.buttonSensorDataManager.clear();
    this.touchSensorDataManager.clear();
  }
}

export default SensorDataManager;
