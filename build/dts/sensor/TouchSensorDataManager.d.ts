import Device from "../Device.ts";
import EventDispatcher from "../utils/EventDispatcher.ts";
export declare const TouchSensorTypes: readonly ["touches"];
export type TouchSensorType = (typeof TouchSensorTypes)[number];
export interface Touch {
    index: number;
    value: number;
    isDown: boolean;
}
export interface InternalTouch extends Touch {
    lastTimeDown?: number;
}
export interface TouchSensorDataEventMessages {
    touches: {
        touches: Touch[];
    };
}
export declare const TouchSensorEventTypes: readonly ["numberOfTouches", "touch", "touchDown", "touchUp"];
export type TouchSensorEventType = (typeof TouchSensorEventTypes)[number];
export interface TouchSensorEventMessages {
    numberOfTouches: {
        numberOfTouches: number;
    };
    touch: {
        touch: Touch;
    };
    touchDown: {
        touch: Touch;
    };
    touchUp: {
        touch: Touch;
        duration: number;
    };
}
export type TouchSensorEventDispatcher = EventDispatcher<Device, TouchSensorEventType, TouchSensorEventMessages>;
declare class TouchSensorDataManager {
    #private;
    constructor();
    get eventDispatcher(): TouchSensorEventDispatcher;
    set eventDispatcher(eventDispatcher: TouchSensorEventDispatcher);
    get dispatchEvent(): <T extends "numberOfTouches" | "touch" | "touchDown" | "touchUp">(type: T, message: TouchSensorEventMessages[T]) => void;
    parseData(dataView: DataView<ArrayBuffer>): Touch[];
    get numberOfTouches(): number;
    set numberOfTouches(newNumberOfTouches: number);
    touches: InternalTouch[];
    clear(): void;
}
export default TouchSensorDataManager;
