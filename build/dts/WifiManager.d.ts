import Device, { SendMessageCallback } from "./Device.ts";
import EventDispatcher from "./utils/EventDispatcher.ts";
export declare const MinWifiSSIDLength = 1;
export declare const MaxWifiSSIDLength = 32;
export declare const MinWifiPasswordLength = 8;
export declare const MaxWifiPasswordLength = 64;
export declare const WifiMessageTypes: readonly ["isWifiAvailable", "getWifiSSID", "setWifiSSID", "getWifiPassword", "setWifiPassword", "getEnableWifiConnection", "setEnableWifiConnection", "isWifiConnected", "ipAddress", "isWifiSecure"];
export type WifiMessageType = (typeof WifiMessageTypes)[number];
export declare const RequiredWifiMessageTypes: WifiMessageType[];
export declare const WifiEventTypes: readonly ["isWifiAvailable", "getWifiSSID", "setWifiSSID", "getWifiPassword", "setWifiPassword", "getEnableWifiConnection", "setEnableWifiConnection", "isWifiConnected", "ipAddress", "isWifiSecure"];
export type WifiEventType = (typeof WifiEventTypes)[number];
export interface WifiEventMessages {
    isWifiAvailable: {
        isWifiAvailable: boolean;
    };
    getWifiSSID: {
        wifiSSID: string;
    };
    getWifiPassword: {
        wifiPassword: string;
    };
    getEnableWifiConnection: {
        wifiConnectionEnabled: boolean;
    };
    isWifiConnected: {
        isWifiConnected: boolean;
    };
    ipAddress: {
        ipAddress: string;
    };
}
export type WifiEventDispatcher = EventDispatcher<Device, WifiEventType, WifiEventMessages>;
export type SendWifiMessageCallback = SendMessageCallback<WifiMessageType>;
declare class WifiManager {
    #private;
    constructor();
    sendMessage: SendWifiMessageCallback;
    eventDispatcher: WifiEventDispatcher;
    get waitForEvent(): <T extends "isWifiAvailable" | "getWifiSSID" | "setWifiSSID" | "getWifiPassword" | "setWifiPassword" | "getEnableWifiConnection" | "setEnableWifiConnection" | "isWifiConnected" | "ipAddress" | "isWifiSecure">(type: T) => Promise<{
        type: T;
        target: Device;
        message: WifiEventMessages[T];
    }>;
    requestRequiredInformation(): void;
    get isWifiAvailable(): boolean;
    get wifiSSID(): string;
    setWifiSSID(newWifiSSID: string): Promise<void>;
    get wifiPassword(): string;
    setWifiPassword(newWifiPassword: string): Promise<void>;
    get wifiConnectionEnabled(): boolean;
    setWifiConnectionEnabled(newWifiConnectionEnabled: boolean, sendImmediately?: boolean): Promise<void>;
    toggleWifiConnection(): Promise<void>;
    enableWifiConnection(): Promise<void>;
    disableWifiConnection(): Promise<void>;
    get isWifiConnected(): boolean;
    get ipAddress(): string | undefined;
    get isWifiSecure(): boolean;
    parseMessage(messageType: WifiMessageType, dataView: DataView): void;
    clear(): void;
}
export default WifiManager;
