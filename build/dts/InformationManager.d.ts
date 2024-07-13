import Device, { SendMessageCallback } from "./Device.ts";
import EventDispatcher from "./utils/EventDispatcher.ts";
export declare const DeviceTypes: readonly ["leftInsole", "rightInsole"];
export type DeviceType = (typeof DeviceTypes)[number];
export declare const InsoleSides: readonly ["left", "right"];
export type InsoleSide = (typeof InsoleSides)[number];
export declare const MinNameLength = 2;
export declare const MaxNameLength = 30;
export declare const InformationMessageTypes: readonly ["isCharging", "getBatteryCurrent", "getMtu", "getId", "getName", "setName", "getType", "setType", "getCurrentTime", "setCurrentTime"];
export type InformationMessageType = (typeof InformationMessageTypes)[number];
export declare const InformationEventTypes: readonly ["isCharging", "getBatteryCurrent", "getMtu", "getId", "getName", "setName", "getType", "setType", "getCurrentTime", "setCurrentTime"];
export type InformationEventType = (typeof InformationEventTypes)[number];
export interface InformationEventMessages {
    isCharging: {
        isCharging: boolean;
    };
    getBatteryCurrent: {
        batteryCurrent: number;
    };
    getMtu: {
        mtu: number;
    };
    getId: {
        id: string;
    };
    getName: {
        name: string;
    };
    getType: {
        type: DeviceType;
    };
    getCurrentTime: {
        currentTime: number;
    };
}
export type InformationEventDispatcher = EventDispatcher<Device, InformationEventType, InformationEventMessages>;
export type SendInformationMessageCallback = SendMessageCallback<InformationMessageType>;
declare class InformationManager {
    #private;
    constructor();
    sendMessage: SendInformationMessageCallback;
    eventDispatcher: InformationEventDispatcher;
    get waitForEvent(): <T extends "isCharging" | "getBatteryCurrent" | "getMtu" | "getId" | "getName" | "getType" | "getCurrentTime" | "setName" | "setType" | "setCurrentTime">(type: T) => Promise<{
        type: T;
        target: Device;
        message: InformationEventMessages[T];
    }>;
    get isCharging(): boolean;
    get batteryCurrent(): number;
    getBatteryCurrent(): Promise<void>;
    get id(): string;
    get name(): string;
    updateName(updatedName: string): void;
    setName(newName: string): Promise<void>;
    get type(): "leftInsole" | "rightInsole";
    get typeEnum(): number;
    updateType(updatedType: DeviceType): void;
    setType(newType: DeviceType): Promise<void>;
    get isInsole(): boolean;
    get insoleSide(): InsoleSide;
    get mtu(): number;
    get isCurrentTimeSet(): boolean;
    parseMessage(messageType: InformationMessageType, dataView: DataView): void;
    clear(): void;
}
export default InformationManager;
