import { createConsole } from "../utils/Console.ts";

export const ButtonSensorTypes = ["button"] as const;
export type ButtonSensorType = (typeof ButtonSensorTypes)[number];

export interface ButtonSensorDataEventMessages {
  button: {
    index: number;
    isPressed: boolean;
    value: number;
  };
}

const _console = createConsole("ButtonSensorDataManager", { log: true });

class ButtonSensorDataManager {
  parseData(dataView: DataView<ArrayBuffer>) {
    const index = dataView.getUint8(0);
    const value = dataView.getUint8(1);
    const isPressed = value > 0;
    _console.log({ index, isPressed, value });
    return { index, isPressed, value };
  }
}

export default ButtonSensorDataManager;
