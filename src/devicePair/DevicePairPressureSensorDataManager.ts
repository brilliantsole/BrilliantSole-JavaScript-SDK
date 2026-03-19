import { createConsole } from "../utils/Console.ts";
import CenterOfPressureHelper from "../utils/CenterOfPressureHelper.ts";
import {
  PressureData,
  PressureSensorValue,
} from "../sensor/PressureSensorDataManager.ts";
import { CenterOfPressure } from "../utils/CenterOfPressureHelper.ts";
import { Side, Sides } from "../InformationManager.ts";
import { DeviceEventMap } from "../Device.ts";
import { RangeHelper } from "../BS.ts";

const _console = createConsole("DevicePairPressureSensorDataManager", {
  log: false,
});

export type DevicePairRawPressureData = { [side in Side]: PressureData };
export type DevicePairPressureTimestamps = { [side in Side]: number };

export interface DevicePairPressureData {
  sensors: { [key in Side]: PressureSensorValue[] };
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
  #pressureTimestamps: Partial<DevicePairPressureTimestamps> = {};
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
    const { pressure, timestamp } = event.message;
    const { side } = event.target;
    _console.log({ pressure, side });
    this.#rawPressure[side] = pressure;
    this.#pressureTimestamps[side] = timestamp;
    if (this.#hasAllPressureData) {
      return this.#updatePressureData();
    } else {
      _console.log("doesn't have all pressure data yet...");
    }
  }

  get #hasAllPressureData() {
    const now = Date.now();
    const hasBothSides = Sides.every((side) => side in this.#rawPressure);
    const bothSidesAreRecent = Sides.every(
      (side) => now - this.#pressureTimestamps[side]! < 500
    );
    return hasBothSides && bothSidesAreRecent;
  }

  #updatePressureData() {
    const pressureData: DevicePairPressureData = {
      scaledSum: 0,
      normalizedSum: 0,
      sensors: { left: [], right: [] },
    };

    Sides.forEach((side) => {
      const sidePressure = this.#rawPressure[side]!;
      pressureData.sensors[side].push(...sidePressure.sensors);
    });

    let numberOfSidesWithCenter = 0;
    Sides.forEach((side) => {
      const sidePressureData = this.#rawPressure[side]!;
      if (sidePressureData.center) {
        numberOfSidesWithCenter++;
      }
    });

    Sides.forEach((side) => {
      const sidePressure = this.#rawPressure[side]!;
      pressureData.scaledSum += sidePressure.scaledSum;
    });
    pressureData.normalizedSum +=
      this.#normalizedSumRangeHelper.updateAndGetNormalization(
        pressureData.scaledSum
      );

    if (numberOfSidesWithCenter > 0) {
      pressureData.center = { x: 0, y: 0 };
      Sides.forEach((side) => {
        const sidePressureData = this.#rawPressure[side]!;
        let centerOfPressure: CenterOfPressure | undefined;
        if (sidePressureData.calibratedCenter) {
          centerOfPressure = sidePressureData.calibratedCenter;
        } else if (sidePressureData.motionCenter) {
          centerOfPressure = sidePressureData.motionCenter;
        }

        const sidePressureWeight =
          sidePressureData.scaledSum / pressureData.scaledSum;

        if (sidePressureWeight > 0) {
          if (centerOfPressure) {
            // simple average
            pressureData.center!.x += centerOfPressure.x * (1 / 2);
            pressureData.center!.y += centerOfPressure.y * (1 / 2);
          } else if (true) {
            // average across pressureData
            if (sidePressureData.normalizedCenter?.y != undefined) {
              pressureData.center!.y +=
                sidePressureData.normalizedCenter!.y * sidePressureWeight;
            }
            if (side == "right") {
              pressureData.center!.x = sidePressureWeight;
            }
          } else {
            // average across sensors
            pressureData.sensors[side].length = 0;
            sidePressureData.sensors.forEach((sensor) => {
              const _sensor: PressureSensorValue = structuredClone(sensor);
              _sensor.weightedValue =
                sensor.scaledValue / pressureData.scaledSum;
              let { x, y } = sensor.position;
              x /= 2;
              if (side == "right") {
                x += 0.5;
              }
              _sensor.position = { x, y };
              pressureData.center!.x +=
                _sensor.position.x * _sensor.weightedValue;
              pressureData.center!.y +=
                _sensor.position.y * _sensor.weightedValue;
              pressureData.sensors[side].push(_sensor);
            });
          }
        }
      });

      pressureData.normalizedCenter =
        this.#centerOfPressureHelper.updateAndGetNormalization(
          pressureData.center
        );
    }

    _console.log({ devicePairPressureData: pressureData });

    return pressureData;
  }
}

export default DevicePairPressureSensorDataManager;
