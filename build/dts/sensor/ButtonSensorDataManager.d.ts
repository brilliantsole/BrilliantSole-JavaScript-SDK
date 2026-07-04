import Device from "../Device.ts";
import EventDispatcher from "../utils/EventDispatcher.ts";
export declare const ButtonSensorTypes: readonly ["buttons"];
export type ButtonSensorType = (typeof ButtonSensorTypes)[number];
export interface Button {
    index: number;
    value: number;
    isDown: boolean;
}
export interface InternalButton extends Button {
    lastTimeDown?: number;
}
export interface ButtonSensorDataEventMessages {
    buttons: {
        buttons: Button[];
    };
}
export declare const ButtonSensorEventTypes: readonly ["numberOfButtons", "button", "buttonDown", "buttonUp"];
export type ButtonSensorEventType = (typeof ButtonSensorEventTypes)[number];
export interface ButtonSensorEventMessages {
    numberOfButtons: {
        numberOfButtons: number;
    };
    button: {
        button: Button;
    };
    buttonDown: {
        button: Button;
    };
    buttonUp: {
        button: Button;
        duration: number;
    };
}
export type ButtonSensorEventDispatcher = EventDispatcher<Device, ButtonSensorEventType, ButtonSensorEventMessages>;
declare class ButtonSensorDataManager {
    #private;
    constructor();
    get eventDispatcher(): ButtonSensorEventDispatcher;
    set eventDispatcher(eventDispatcher: ButtonSensorEventDispatcher);
    get dispatchEvent(): <T extends "button" | "numberOfButtons" | "buttonDown" | "buttonUp">(type: T, message: ButtonSensorEventMessages[T]) => void;
    parseData(dataView: DataView<ArrayBuffer>): Button[];
    get numberOfButtons(): number;
    set numberOfButtons(newNumberOfButtons: number);
    buttons: InternalButton[];
    clear(): void;
}
export default ButtonSensorDataManager;
