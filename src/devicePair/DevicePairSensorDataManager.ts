import DevicePairPressureSensorDataManager, {
  DevicePairPressureDataEventMessage,
  DevicePairPressureDataEventMessages,
} from "./DevicePairPressureSensorDataManager";
import { createConsole } from "../utils/Console";
import { InsoleSide } from "../InformationManager";
import { SensorType } from "../sensor/SensorDataManager";
import { DeviceEvent } from "../Device";
import EventDispatcher from "../utils/EventDispatcher";
import DevicePair from "./DevicePair";

const _console = createConsole("DevicePairSensorDataManager", { log: true });

export const DevicePairSensorTypes = ["pressure", "sensorData"] as const;
export type DevicePairSensorType = (typeof DevicePairSensorTypes)[number];

export const DevicePairSensorDataEventTypes = DevicePairSensorTypes;
export type DevicePairSensorDataEventType = (typeof DevicePairSensorDataEventTypes)[number];

export type DevicePairSensorDataTimestamps = { [insoleSide in InsoleSide]: number };

export interface BaseDevicePairSensorDataEventMessage {
  sensorType: DevicePairSensorType;
  timestamps: DevicePairSensorDataTimestamps;
}
export type DevicePairSensorDataEventMessage = DevicePairPressureDataEventMessage;
interface AnyDevicePairSensorDataEventMessages {
  sensorData: DevicePairSensorDataEventMessage;
}

export type DevicePairSensorDataEventMessages =
  | DevicePairPressureDataEventMessages
  | AnyDevicePairSensorDataEventMessages;

export type DevicePairSensorDataEventDispatcher = EventDispatcher<
  DevicePair,
  DevicePairSensorDataEventType,
  DevicePairSensorDataEventMessages
>;

class DevicePairSensorDataManager {
  eventDispatcher!: DevicePairSensorDataEventDispatcher;
  get dispatchEvent() {
    return this.eventDispatcher.dispatchEvent;
  }

  #timestamps: { [sensorType in SensorType]?: Partial<DevicePairSensorDataTimestamps> } = {};

  pressureSensorDataManager = new DevicePairPressureSensorDataManager();
  resetPressureRange() {
    this.pressureSensorDataManager.resetPressureRange();
  }

  onDeviceSensorData(event: DeviceEvent<"sensorData">) {
    const { timestamp } = event.message;

    const { sensorType } = event.message;

    _console.log({ sensorType, timestamp, event });

    if (!this.#timestamps[sensorType]) {
      this.#timestamps[sensorType] = {};
    }
    this.#timestamps[sensorType]![event.target.insoleSide] = timestamp;

    let value;
    switch (sensorType) {
      case "pressure":
        value = this.pressureSensorDataManager.onDevicePressureData(event as unknown as DeviceEvent<"pressure">);
        break;
      default:
        _console.log(`uncaught sensorType "${sensorType}"`);
        break;
    }

    if (value) {
      const timestamps = Object.assign({}, this.#timestamps[sensorType]) as DevicePairSensorDataTimestamps;
      this.dispatchEvent(sensorType as DevicePairSensorDataEventType, { timestamps, [sensorType]: value });
    } else {
      _console.log("no value received");
    }
  }
}

export default DevicePairSensorDataManager;
