import DevicePairPressureSensorDataManager, {
  DevicePairPressureDataEventMessages,
} from "./DevicePairPressureSensorDataManager.ts";
import { createConsole } from "../utils/Console.ts";
import { InsoleSide } from "../InformationManager.ts";
import { SensorType } from "../sensor/SensorDataManager.ts";
import { SpecificDeviceEvent } from "../Device.ts";
import EventDispatcher from "../utils/EventDispatcher.ts";
import DevicePair from "./DevicePair.ts";
import { AddKeysAsPropertyToInterface, ExtendInterfaceValues, ValueOf } from "../utils/TypeScriptUtils.ts";

const _console = createConsole("DevicePairSensorDataManager", { log: true });

export const DevicePairSensorTypes = ["pressure", "sensorData"] as const;
export type DevicePairSensorType = (typeof DevicePairSensorTypes)[number];

export const DevicePairSensorDataEventTypes = DevicePairSensorTypes;
export type DevicePairSensorDataEventType = (typeof DevicePairSensorDataEventTypes)[number];

export type DevicePairSensorDataTimestamps = { [insoleSide in InsoleSide]: number };

interface BaseDevicePairSensorDataEventMessage {
  timestamps: DevicePairSensorDataTimestamps;
}

type BaseDevicePairSensorDataEventMessages = DevicePairPressureDataEventMessages;
type _DevicePairSensorDataEventMessages = ExtendInterfaceValues<
  AddKeysAsPropertyToInterface<BaseDevicePairSensorDataEventMessages, "sensorType">,
  BaseDevicePairSensorDataEventMessage
>;

export type DevicePairSensorDataEventMessage = ValueOf<_DevicePairSensorDataEventMessages>;
interface AnyDevicePairSensorDataEventMessages {
  sensorData: DevicePairSensorDataEventMessage;
}
export type DevicePairSensorDataEventMessages = _DevicePairSensorDataEventMessages &
  AnyDevicePairSensorDataEventMessages;

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

  onDeviceSensorData(event: SpecificDeviceEvent<"sensorData">) {
    const { timestamp, sensorType } = event.message;

    _console.log({ sensorType, timestamp, event });

    if (!this.#timestamps[sensorType]) {
      this.#timestamps[sensorType] = {};
    }
    this.#timestamps[sensorType]![event.target.insoleSide] = timestamp;

    let value;
    switch (sensorType) {
      case "pressure":
        value = this.pressureSensorDataManager.onDevicePressureData(
          event as unknown as SpecificDeviceEvent<"pressure">
        );
        break;
      default:
        _console.log(`uncaught sensorType "${sensorType}"`);
        break;
    }

    if (value) {
      const timestamps = Object.assign({}, this.#timestamps[sensorType]) as DevicePairSensorDataTimestamps;
      // @ts-expect-error
      this.dispatchEvent(sensorType as DevicePairSensorDataEventType, { sensorType, timestamps, [sensorType]: value });
      // @ts-expect-error
      this.dispatchEvent("sensorData", { sensorType, timestamps, [sensorType]: value });
    } else {
      _console.log("no value received");
    }
  }
}

export default DevicePairSensorDataManager;
