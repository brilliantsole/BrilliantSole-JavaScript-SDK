import Device, { SendMessageCallback } from "../Device.ts";
import EventDispatcher from "../utils/EventDispatcher.ts";
import { DisplayColorRGB, DisplayColorRGBOrString } from "../utils/DisplayUtils.ts";
export declare const LedTypes: readonly ["digitalSingle", "analogSingle", "digitalRGB", "analogRGB"];
export type LedType = (typeof LedTypes)[number];
export declare const LedValueTypes: readonly ["color", "brightness"];
export type LedValueType = (typeof LedValueTypes)[number];
export type LedValue = DisplayColorRGB | number;
export declare const LedMessageTypes: readonly ["getLedInformation", "setLeds", "clearLeds"];
export type LedMessageType = (typeof LedMessageTypes)[number];
export declare const LedEventTypes: readonly ["getLedInformation", "setLeds", "clearLeds", "setLed"];
export type LedEventType = (typeof LedEventTypes)[number];
export type Led = {
    index: number;
    type: LedType;
    color: DisplayColorRGB;
    maxColor: DisplayColorRGB;
    isSingle: boolean;
    isRGB: boolean;
    isAnalog: boolean;
    isDigital: boolean;
};
export interface LedEventMessages {
    getLedInformation: {
        leds: Led[];
    };
    setLed: {
        ledIndex: number;
        led: Led;
    };
}
export type SendLedMessageCallback = SendMessageCallback<LedMessageType>;
export type LedEventDispatcher = EventDispatcher<Device, LedEventType, LedEventMessages>;
interface LedColorConfiguration {
    index: number;
    color: DisplayColorRGBOrString;
}
interface LedBrightnessConfiguration {
    index: number;
    brightness: number;
}
export type LedConfiguration = LedColorConfiguration | LedBrightnessConfiguration;
declare class LedManager {
    #private;
    constructor();
    sendMessage: SendLedMessageCallback;
    eventDispatcher: LedEventDispatcher;
    get waitForEvent(): <T extends "getLedInformation" | "setLed" | "setLeds" | "clearLeds">(type: T) => Promise<{
        type: T;
        target: Device;
        message: LedEventMessages[T];
    }>;
    get leds(): Led[];
    setLeds(ledConfigurations: LedConfiguration[], sendImmediately?: boolean): Promise<void>;
    setLed(ledConfiguration: LedConfiguration, sendImmediately?: boolean): Promise<void>;
    clearLeds(sendImmediately?: boolean): Promise<void>;
    parseMessage(messageType: LedMessageType, dataView: DataView<ArrayBuffer>): void;
    onSendTxMessages(): void;
    clear(): void;
}
export default LedManager;
