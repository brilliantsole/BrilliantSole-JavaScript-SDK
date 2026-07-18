import { EventDispatcherTypes } from "../utils/EventDispatcher.ts";
import { AddPrefixToInterfaceKeys, ExtendInterfaceValues, IfAny } from "../utils/TypeScriptUtils.ts";
import DisplayCanvasHelper, { DisplayCanvasHelperEventMessages, DisplayCanvasHelperEventType } from "./DisplayCanvasHelper.ts";
import Device from "../Device.ts";
import DisplayManager from "../DisplayManager.ts";
interface BaseDisplayCanvasHelperManagerDisplayCanvasHelperEventMessage {
    displayCanvasHelper: DisplayCanvasHelper;
}
type DisplayCanvasHelperManagerDisplayCanvasHelperEventMessages = ExtendInterfaceValues<AddPrefixToInterfaceKeys<DisplayCanvasHelperEventMessages, "displayCanvasHelper">, BaseDisplayCanvasHelperManagerDisplayCanvasHelperEventMessage>;
export declare const wildcardDisplayCanvasHelperEventType: "displayCanvasHelper*";
export type WildcardDisplayCanvasHelperEventType = typeof wildcardDisplayCanvasHelperEventType;
export type WildcardDisplayCanvasHelperEventMessage<BaseMessage> = {
    [K in DisplayCanvasHelperEventType]: BaseMessage & (K extends keyof DisplayCanvasHelperEventMessages ? IfAny<DisplayCanvasHelperEventMessages[K], {}, DisplayCanvasHelperEventMessages[K]> : {}) & {
        displayCanvasHelperEventType: K;
        displayCanvasHelper: DisplayCanvasHelper;
    };
}[DisplayCanvasHelperEventType];
interface BaseDisplayCanvasHelperManagerEventMessages {
    displayCanvasHelper: {
        displayCanvasHelper: DisplayCanvasHelper;
    };
    displayCanvasHelpers: {
        displayCanvasHelpers: DisplayCanvasHelper[];
    };
    [wildcardDisplayCanvasHelperEventType]: WildcardDisplayCanvasHelperEventMessage<BaseDisplayCanvasHelperManagerDisplayCanvasHelperEventMessage>;
}
export declare const DisplayCanvasHelperManagerEventTypes: readonly [...("displayCanvasHelperDevice" | "displayCanvasHelperDeviceNotConnected" | "displayCanvasHelperDeviceConnected" | "displayCanvasHelperDeviceIsConnected" | "displayCanvasHelperResize" | "displayCanvasHelperNumberOfColors" | "displayCanvasHelperContextState" | "displayCanvasHelperBrightness" | "displayCanvasHelperColor" | "displayCanvasHelperColorOpacity" | "displayCanvasHelperUpdate" | "displayCanvasHelperReady" | "displayCanvasHelperDeviceSpriteSheetUploadStart" | "displayCanvasHelperDeviceSpriteSheetUploadProgress" | "displayCanvasHelperDeviceSpriteSheetUploadComplete" | "displayCanvasHelperDeviceUpdated")[], "displayCanvasHelper", "displayCanvasHelpers", "displayCanvasHelper*"];
export type DisplayCanvasHelperManagerEventType = (typeof DisplayCanvasHelperManagerEventTypes)[number];
export type DisplayCanvasHelperManagerEventMessages = DisplayCanvasHelperManagerDisplayCanvasHelperEventMessages & BaseDisplayCanvasHelperManagerEventMessages;
export type DisplayCanvasHelperManagerEventDisptcherTypes = EventDispatcherTypes<DisplayCanvasHelperManager, DisplayCanvasHelperManagerEventType, DisplayCanvasHelperManagerEventMessages>;
export type DisplayCanvasHelperManagerEvent = DisplayCanvasHelperManagerEventDisptcherTypes["Event"];
export type DisplayCanvasHelperManagerEventMap = DisplayCanvasHelperManagerEventDisptcherTypes["EventMap"];
export type DisplayCanvasHelperManagerEventListenerMap = DisplayCanvasHelperManagerEventDisptcherTypes["EventListenerMap"];
export type DisplayCanvasHelperManagerEventDispatcher = DisplayCanvasHelperManagerEventDisptcherTypes["EventDispatcher"];
export type BoundDisplayCanvasHelperManagerEventListeners = DisplayCanvasHelperManagerEventDisptcherTypes["BoundEventListeners"];
declare class DisplayCanvasHelperManager {
    #private;
    static readonly shared: DisplayCanvasHelperManager;
    constructor();
    get displayCanvasHelpers(): DisplayCanvasHelper[];
    findDisplayCanvasHelpersByDevice(device: Device): DisplayCanvasHelper | undefined;
    findDisplayCanvasHelpersByDisplayManager(displayManager: DisplayManager): DisplayCanvasHelper | undefined;
    get addEventListener(): <T extends "*" | "displayCanvasHelper" | "displayCanvasHelperDevice" | "displayCanvasHelperDeviceNotConnected" | "displayCanvasHelperDeviceConnected" | "displayCanvasHelperDeviceIsConnected" | "displayCanvasHelperResize" | "displayCanvasHelperNumberOfColors" | "displayCanvasHelperContextState" | "displayCanvasHelperBrightness" | "displayCanvasHelperColor" | "displayCanvasHelperColorOpacity" | "displayCanvasHelperUpdate" | "displayCanvasHelperReady" | "displayCanvasHelperDeviceSpriteSheetUploadStart" | "displayCanvasHelperDeviceSpriteSheetUploadProgress" | "displayCanvasHelperDeviceSpriteSheetUploadComplete" | "displayCanvasHelperDeviceUpdated" | "displayCanvasHelper*" | "displayCanvasHelpers">(type: T, listener: (event: import("../utils/EventDispatcher.ts").ListenerEvent<DisplayCanvasHelperManager, "displayCanvasHelper" | "displayCanvasHelperDevice" | "displayCanvasHelperDeviceNotConnected" | "displayCanvasHelperDeviceConnected" | "displayCanvasHelperDeviceIsConnected" | "displayCanvasHelperResize" | "displayCanvasHelperNumberOfColors" | "displayCanvasHelperContextState" | "displayCanvasHelperBrightness" | "displayCanvasHelperColor" | "displayCanvasHelperColorOpacity" | "displayCanvasHelperUpdate" | "displayCanvasHelperReady" | "displayCanvasHelperDeviceSpriteSheetUploadStart" | "displayCanvasHelperDeviceSpriteSheetUploadProgress" | "displayCanvasHelperDeviceSpriteSheetUploadComplete" | "displayCanvasHelperDeviceUpdated" | "displayCanvasHelper*" | "displayCanvasHelpers", DisplayCanvasHelperManagerEventMessages, T>) => void, options?: import("../utils/EventDispatcher.ts").EventDispatcherOptions) => void;
    get removeEventListener(): <T extends "*" | "displayCanvasHelper" | "displayCanvasHelperDevice" | "displayCanvasHelperDeviceNotConnected" | "displayCanvasHelperDeviceConnected" | "displayCanvasHelperDeviceIsConnected" | "displayCanvasHelperResize" | "displayCanvasHelperNumberOfColors" | "displayCanvasHelperContextState" | "displayCanvasHelperBrightness" | "displayCanvasHelperColor" | "displayCanvasHelperColorOpacity" | "displayCanvasHelperUpdate" | "displayCanvasHelperReady" | "displayCanvasHelperDeviceSpriteSheetUploadStart" | "displayCanvasHelperDeviceSpriteSheetUploadProgress" | "displayCanvasHelperDeviceSpriteSheetUploadComplete" | "displayCanvasHelperDeviceUpdated" | "displayCanvasHelper*" | "displayCanvasHelpers">(type: T, listener: (event: import("../utils/EventDispatcher.ts").ListenerEvent<DisplayCanvasHelperManager, "displayCanvasHelper" | "displayCanvasHelperDevice" | "displayCanvasHelperDeviceNotConnected" | "displayCanvasHelperDeviceConnected" | "displayCanvasHelperDeviceIsConnected" | "displayCanvasHelperResize" | "displayCanvasHelperNumberOfColors" | "displayCanvasHelperContextState" | "displayCanvasHelperBrightness" | "displayCanvasHelperColor" | "displayCanvasHelperColorOpacity" | "displayCanvasHelperUpdate" | "displayCanvasHelperReady" | "displayCanvasHelperDeviceSpriteSheetUploadStart" | "displayCanvasHelperDeviceSpriteSheetUploadProgress" | "displayCanvasHelperDeviceSpriteSheetUploadComplete" | "displayCanvasHelperDeviceUpdated" | "displayCanvasHelper*" | "displayCanvasHelpers", DisplayCanvasHelperManagerEventMessages, T>) => void) => void;
    get removeEventListeners(): <T extends "*" | "displayCanvasHelper" | "displayCanvasHelperDevice" | "displayCanvasHelperDeviceNotConnected" | "displayCanvasHelperDeviceConnected" | "displayCanvasHelperDeviceIsConnected" | "displayCanvasHelperResize" | "displayCanvasHelperNumberOfColors" | "displayCanvasHelperContextState" | "displayCanvasHelperBrightness" | "displayCanvasHelperColor" | "displayCanvasHelperColorOpacity" | "displayCanvasHelperUpdate" | "displayCanvasHelperReady" | "displayCanvasHelperDeviceSpriteSheetUploadStart" | "displayCanvasHelperDeviceSpriteSheetUploadProgress" | "displayCanvasHelperDeviceSpriteSheetUploadComplete" | "displayCanvasHelperDeviceUpdated" | "displayCanvasHelper*" | "displayCanvasHelpers">(type: T) => void;
}
declare const _default: DisplayCanvasHelperManager;
export default _default;
