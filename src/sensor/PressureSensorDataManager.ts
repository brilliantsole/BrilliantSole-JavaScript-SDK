import { createConsole } from "../utils/Console";
import CenterOfPressureHelper from "../utils/CenterOfPressureHelper";
import RangeHelper from "../utils/RangeHelper";
import { createArray } from "../utils/ArrayUtils";

const _console = createConsole("PressureDataManager", { log: true });

export const PressureSensorTypes = ["pressure"] as const;
export type PressureSensorType = (typeof PressureSensorTypes)[number];

export const ContinuousPressureSensorTypes = PressureSensorTypes;
export type ContinuousPressureSensorType = (typeof ContinuousPressureSensorTypes)[number];

import { Vector2 } from "../utils/MathUtils";
export type PressureSensorPosition = Vector2;

import { CenterOfPressure } from "../utils/CenterOfPressureHelper";

export interface PressureSensorValue {
  position: PressureSensorPosition;
  rawValue: number;
  scaledValue: number;
  normalizedValue: number;
  weightedValue: number;
}

export interface PressureData {
  sensors: PressureSensorValue[];
  scaledSum: number;
  normalizedSum: number;
  center?: CenterOfPressure;
  normalizedCenter?: CenterOfPressure;
}

import { BaseSensorDataEventMessage } from "./SensorDataManager";

export interface PressureDataEventMessage extends BaseSensorDataEventMessage {
  sensorType: "pressure";
  pressure: PressureData;
}

export interface PressureDataEventMessages {
  pressure: PressureDataEventMessage;
}

class PressureSensorDataManager {
  #positions: PressureSensorPosition[] = [];
  get positions() {
    return this.#positions;
  }

  get numberOfSensors() {
    return this.positions.length;
  }

  parsePositions(dataView: DataView) {
    const positions: PressureSensorPosition[] = [];

    for (
      let pressureSensorIndex = 0, byteOffset = 0;
      byteOffset < dataView.byteLength;
      pressureSensorIndex++, byteOffset += 2
    ) {
      positions.push({
        x: dataView.getUint8(byteOffset) / 2 ** 8,
        y: dataView.getUint8(byteOffset + 1) / 2 ** 8,
      });
    }

    _console.log({ positions });

    this.#positions = positions;

    this.#sensorRangeHelpers = createArray(this.numberOfSensors, () => new RangeHelper());

    this.resetRange();
  }

  #sensorRangeHelpers!: RangeHelper[];

  #centerOfPressureHelper = new CenterOfPressureHelper();

  resetRange() {
    this.#sensorRangeHelpers.forEach((rangeHelper) => rangeHelper.reset());
    this.#centerOfPressureHelper.reset();
  }

  parseData(dataView: DataView, scalar: number) {
    const pressure: PressureData = { sensors: [], scaledSum: 0, normalizedSum: 0 };
    for (let index = 0, byteOffset = 0; byteOffset < dataView.byteLength; index++, byteOffset += 2) {
      const rawValue = dataView.getUint16(byteOffset, true);
      const scaledValue = rawValue * scalar;
      const rangeHelper = this.#sensorRangeHelpers[index];
      const normalizedValue = rangeHelper.updateAndGetNormalization(scaledValue);
      const position = this.positions[index];
      pressure.sensors[index] = { rawValue, scaledValue, normalizedValue, position, weightedValue: 0 };

      pressure.scaledSum += scaledValue;
      pressure.normalizedSum += normalizedValue / this.numberOfSensors;
    }

    if (pressure.scaledSum > 0) {
      pressure.center = { x: 0, y: 0 };
      pressure.sensors.forEach((sensor) => {
        sensor.weightedValue = sensor.scaledValue / pressure.scaledSum;
        pressure.center!.x += sensor.position.x * sensor.weightedValue;
        pressure.center!.y += sensor.position.y * sensor.weightedValue;
      });
      pressure.normalizedCenter = this.#centerOfPressureHelper.updateAndGetNormalization(pressure.center);
    }

    _console.log({ pressure });
    return pressure;
  }
}

export default PressureSensorDataManager;
