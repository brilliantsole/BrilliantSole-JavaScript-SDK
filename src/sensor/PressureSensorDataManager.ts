import { createConsole } from "../utils/Console.ts";
import CenterOfPressureHelper from "../utils/CenterOfPressureHelper.ts";
import RangeHelper from "../utils/RangeHelper.ts";
import { createArray } from "../utils/ArrayUtils.ts";

const _console = createConsole("PressureDataManager", { log: true });

export const PressureSensorTypes = ["pressure"] as const;
export type PressureSensorType = (typeof PressureSensorTypes)[number];

export const ContinuousPressureSensorTypes = PressureSensorTypes;
export type ContinuousPressureSensorType = (typeof ContinuousPressureSensorTypes)[number];

import { computeVoronoiWeights, Vector2 } from "../utils/MathUtils.ts";
export type PressureSensorPosition = Vector2;

import { CenterOfPressure } from "../utils/CenterOfPressureHelper.ts";

export interface PressureSensorValue {
  position: PressureSensorPosition;
  rawValue: number;
  scaledValue: number;
  normalizedValue: number;
  weightedValue: number;
  weight: number;
}

export interface PressureData {
  sensors: PressureSensorValue[];
  scaledSum: number;
  normalizedSum: number;
  center?: CenterOfPressure;
  normalizedCenter?: CenterOfPressure;
}

export interface PressureDataEventMessages {
  pressure: { pressure: PressureData };
}

export const DefaultNumberOfPressureSensors = 8;

class PressureSensorDataManager {
  #positions: PressureSensorPosition[] = [];
  get positions() {
    return this.#positions;
  }

  get numberOfSensors() {
    return this.positions.length;
  }

  #sensorWeights: number[] = [];
  #generateSensorWeights() {
    this.#sensorWeights = this.#positions.map((_) => 1);
    //this.#sensorWeights = computeVoronoiWeights(this.#positions);
    _console.log("sensorWeights", this.#sensorWeights);
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

    this.#generateSensorWeights();

    this.resetRange();
  }

  #sensorRangeHelpers!: RangeHelper[];
  #normalizedSumRangeHelper = new RangeHelper();

  #centerOfPressureHelper = new CenterOfPressureHelper();

  resetRange() {
    this.#sensorRangeHelpers?.forEach((rangeHelper) => rangeHelper.reset());
    this.#centerOfPressureHelper.reset();
    this.#normalizedSumRangeHelper.reset();
  }

  parseData(dataView: DataView, scalar: number) {
    const pressure: PressureData = { sensors: [], scaledSum: 0, normalizedSum: 0 };
    for (let index = 0, byteOffset = 0; byteOffset < dataView.byteLength; index++, byteOffset += 2) {
      const rawValue = dataView.getUint16(byteOffset, true);
      let scaledValue = (rawValue * scalar) / this.numberOfSensors;
      const rangeHelper = this.#sensorRangeHelpers[index];
      const normalizedValue = rangeHelper.updateAndGetNormalization(scaledValue, false);

      const weight = this.#sensorWeights[index];
      //scaledValue -= rangeHelper.min;
      scaledValue *= weight;

      const position = this.positions[index];
      pressure.sensors[index] = { rawValue, scaledValue, normalizedValue, position, weightedValue: 0, weight };

      pressure.scaledSum += scaledValue;
      //pressure.normalizedSum += normalizedValue;
    }
    pressure.normalizedSum = this.#normalizedSumRangeHelper.updateAndGetNormalization(pressure.scaledSum, false);

    if (pressure.scaledSum > 0) {
      pressure.center = { x: 0, y: 0 };
      pressure.sensors.forEach((sensor) => {
        sensor.weightedValue = sensor.scaledValue / pressure.scaledSum;
        pressure.center!.x += sensor.position.x * sensor.weightedValue;
        pressure.center!.y += sensor.position.y * sensor.weightedValue;
      });
      pressure.normalizedCenter = this.#centerOfPressureHelper.updateAndGetNormalization(pressure.center, false);
    }

    _console.log({ pressure });
    return pressure;
  }
}

export default PressureSensorDataManager;
