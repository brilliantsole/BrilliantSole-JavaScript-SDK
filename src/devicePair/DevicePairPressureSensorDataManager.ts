import { createConsole } from "../utils/Console.ts";
import CenterOfPressureHelper from "../utils/CenterOfPressureHelper.ts";
import { PressureData } from "../sensor/PressureSensorDataManager.ts";
import { CenterOfPressure } from "../utils/CenterOfPressureHelper.ts";
import { InsoleSide, InsoleSides } from "../InformationManager.ts";
import { DeviceEventMap } from "../Device.ts";

const _console = createConsole("DevicePairPressureSensorDataManager", { log: true });

export type DevicePairRawPressureData = { [insoleSide in InsoleSide]: PressureData };

export interface DevicePairPressureData {
  rawSum: number;
  normalizedSum: number;
  center?: CenterOfPressure;
  normalizedCenter?: CenterOfPressure;
}

export interface DevicePairPressureDataEventMessage {
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

  onDevicePressureData(event: DeviceEventMap["pressure"]) {
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

    if (pressure.normalizedSum > 0.001) {
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
