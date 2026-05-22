export declare const ButtonSensorTypes: readonly ["button"];
export type ButtonSensorType = (typeof ButtonSensorTypes)[number];
export interface ButtonSensorDataEventMessages {
    button: {
        index: number;
        isPressed: boolean;
        value: number;
    };
}
declare class ButtonSensorDataManager {
    parseData(dataView: DataView<ArrayBuffer>): {
        index: number;
        isPressed: boolean;
        value: number;
    };
}
export default ButtonSensorDataManager;
