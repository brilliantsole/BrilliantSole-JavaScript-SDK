import Device, { SendMessageCallback } from "../Device.ts";
import EventDispatcher from "../utils/EventDispatcher.ts";
import { DisplayColorRGB } from "../BS.ts";
export declare const LEDTypes: readonly ["digitalSingle", "analogSingle", "digitalRGB", "analogRGB"];
export type LEDType = (typeof LEDTypes)[number];
export declare const LEDMessageTypes: readonly ["getLEDInformation", "setLEDs", "clearLEDs"];
export type LedMessageType = (typeof LEDMessageTypes)[number];
export declare const LedEventTypes: readonly ["getLEDInformation", "setLEDs", "clearLEDs"];
export type LedEventType = (typeof LedEventTypes)[number];
export type Led = {
    type: LEDType;
    color: DisplayColorRGB;
    maxColor: DisplayColorRGB;
};
export interface LedEventMessages {
    getLEDInformation: {
        leds: Led[];
    };
    setLEDs: {};
    clearLEDs: {};
}
export type SendLedMessageCallback = SendMessageCallback<LedMessageType>;
export type LedEventDispatcher = EventDispatcher<Device, LedEventType, LedEventMessages>;
declare class LedManager {
    #private;
    constructor();
    sendMessage: SendLedMessageCallback;
    eventDispatcher: LedEventDispatcher;
    get waitForEvent(): <T extends "getLEDInformation" | "setLEDs" | "clearLEDs">(type: T) => Promise<{
        type: T;
        target: Device;
        message: LedEventMessages[T];
    }>;
    get leds(): Led[];
    parseMessage(messageType: LedMessageType, dataView: DataView<ArrayBuffer>): void;
    clear(): void;
}
export default LedManager;
