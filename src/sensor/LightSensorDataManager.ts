import { createConsole } from "../utils/Console.ts";

export const LightSensorTypes = ["light"] as const;
export type LightSensorType = (typeof LightSensorTypes)[number];

export const ContinuousLightSensorTypes = LightSensorTypes;
export type ContinuousLightSensorType =
  (typeof ContinuousLightSensorTypes)[number];

export interface LightSensorDataEventMessages {
  light: {
    light: number;
  };
}

const _console = createConsole("LightSensorDataManager", { log: false });

class LightSensorDataManager {
  parseData(dataView: DataView<ArrayBuffer>, scalar: number) {
    const light = dataView.getFloat32(0, true) * scalar;
    _console.log({ light });
    return { light };
  }
}

export default LightSensorDataManager;
