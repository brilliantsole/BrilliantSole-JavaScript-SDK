import { createConsole } from "../utils/Console";
import CenterOfPressureHelper from "../utils/CenterOfPressureHelper";
import { PressureData } from "../sensor/PressureSensorDataManager";
import { CenterOfPressure } from "../utils/CenterOfPressureHelper";
import { InsoleSide, InsoleSides } from "../InformationManager";
import { DeviceEvent } from "../Device";
import { BaseDevicePairSensorDataEventMessage } from "./DevicePairSensorDataManager";

const _console = createConsole("DevicePairPressureSensorDataManager", { log: true });

export type DevicePairRawPressureData = { [insoleSide in InsoleSide]: PressureData };

export interface DevicePairPressureData {
  rawSum: number;
  normalizedSum: number;
  center?: CenterOfPressure;
  normalizedCenter?: CenterOfPressure;
}

export interface DevicePairPressureDataEventMessage extends BaseDevicePairSensorDataEventMessage {
  sensorType: "pressure";
  pressure: DevicePairPressureData;
}

export interface DevicePairPressureDataEventMessages {
  pressure: DevicePairPressureDataEventMessage;
}

class DevicePairPressureSensorDataManager {
  #rawPressure: Partial<DevicePairRawPressureData> = {};

  #centerOfPressureHelper = new CenterOfPressureHelper();

  resetPressureRange() {
    this.#centerOfPressureHelper.reset();
  }

  onDevicePressureData(event: DeviceEvent<"pressure">) {
    const { pressure } = event.message;
    const insoleSide = event.target.insoleSide;
    _console.log({ pressure, insoleSide });
    this.#rawPressure[insoleSide] = pressure;
    if (this.#hasAllPressureData) {
      return this.#updatePressureData();
    } else {
      _console.log("doesn't have all pressure data yet...");
    }
  }

  get #hasAllPressureData() {
    return InsoleSides.every((side) => side in this.#rawPressure);
  }

  #updatePressureData() {
    const pressure: DevicePairPressureData = { rawSum: 0, normalizedSum: 0 };

    InsoleSides.forEach((side) => {
      pressure.rawSum += this.#rawPressure[side]!.scaledSum;
      pressure.normalizedSum += this.#rawPressure[side]!.normalizedSum;
    });

    if (pressure.normalizedSum > 0) {
      pressure.center = { x: 0, y: 0 };
      InsoleSides.forEach((side) => {
        const sidePressure = this.#rawPressure[side]!;
        const normalizedPressureSumWeight = sidePressure.normalizedSum / pressure.normalizedSum;
        if (normalizedPressureSumWeight > 0) {
          pressure.center!.y += sidePressure.normalizedCenter!.y * normalizedPressureSumWeight;
          if (side == "right") {
            pressure.center!.x = normalizedPressureSumWeight;
          }
        }
      });

      pressure.normalizedCenter = this.#centerOfPressureHelper.updateAndGetNormalization(pressure.center);
    }

    _console.log({ devicePairPressure: pressure });

    return pressure;
  }
}

export default DevicePairPressureSensorDataManager;
