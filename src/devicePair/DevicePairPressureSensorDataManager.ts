import { createConsole } from "../utils/Console.ts";
import CenterOfPressureHelper from "../utils/CenterOfPressureHelper.ts";
import { PressureData, PressureSensorPosition, PressureSensorValue } from "../sensor/PressureSensorDataManager.ts";
import { CenterOfPressure } from "../utils/CenterOfPressureHelper.ts";
import { InsoleSide, InsoleSides } from "../InformationManager.ts";
import { DeviceEventMap } from "../Device.ts";
import { RangeHelper } from "../BS.ts";

const _console = createConsole("DevicePairPressureSensorDataManager", { log: true });

export type DevicePairRawPressureData = { [insoleSide in InsoleSide]: PressureData };

export interface DevicePairPressureData {
  sensors: { [key in InsoleSide]: PressureSensorValue[] };
  scaledSum: number;
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

  #normalizedSumRangeHelper = new RangeHelper();

  constructor() {
    this.resetPressureRange();
  }

  resetPressureRange() {
    this.#centerOfPressureHelper.reset();
    this.#normalizedSumRangeHelper.reset();
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
    const pressure: DevicePairPressureData = { scaledSum: 0, normalizedSum: 0, sensors: { left: [], right: [] } };

    InsoleSides.forEach((side) => {
      const sidePressure = this.#rawPressure[side]!;
      pressure.scaledSum += sidePressure.scaledSum;
      //pressure.normalizedSum += this.#rawPressure[side]!.normalizedSum;
    });
    pressure.normalizedSum += this.#normalizedSumRangeHelper.updateAndGetNormalization(pressure.scaledSum, false);

    if (pressure.scaledSum > 0) {
      pressure.center = { x: 0, y: 0 };
      InsoleSides.forEach((side) => {
        const sidePressure = this.#rawPressure[side]!;

        if (false) {
          const sidePressureWeight = sidePressure.scaledSum / pressure.scaledSum;
          if (sidePressureWeight > 0) {
            if (sidePressure.normalizedCenter?.y != undefined) {
              pressure.center!.y += sidePressure.normalizedCenter.y * sidePressureWeight;
            }
            if (side == "right") {
              pressure.center!.x = sidePressureWeight;
            }
          }
        } else {
          sidePressure.sensors.forEach((sensor, index) => {
            const _sensor: PressureSensorValue = { ...sensor };
            _sensor.weightedValue = sensor.scaledValue / pressure.scaledSum;
            let { x, y } = sensor.position;
            x /= 2;
            if (side == "right") {
              x += 0.5;
            }
            _sensor.position = { x, y };
            pressure.center!.x += _sensor.position.x * _sensor.weightedValue;
            pressure.center!.y += _sensor.position.y * _sensor.weightedValue;
            pressure.sensors[side].push(_sensor);
          });
        }
      });

      pressure.normalizedCenter = this.#centerOfPressureHelper.updateAndGetNormalization(pressure.center, false);
    }

    _console.log({ devicePairPressure: pressure });

    return pressure;
  }
}

export default DevicePairPressureSensorDataManager;
