import { EventDispatcherTypes } from "../utils/EventDispatcher.ts";
import { AddPrefixToInterfaceKeys, ExtendInterfaceValues, IfAny } from "../utils/TypeScriptUtils.ts";
import { ClientEventType, ClientEventMessages } from "./BaseClient.ts";
import { Client } from "./Client.ts";
interface BaseClientManagerClientEventMessage {
    client: Client;
}
type ClientManagerClientEventMessages = ExtendInterfaceValues<AddPrefixToInterfaceKeys<ClientEventMessages, "client">, BaseClientManagerClientEventMessage>;
export declare const wildcardClientEventType: "client*";
export type WildcardClientEventType = typeof wildcardClientEventType;
export type WildcardClientEventMessage<BaseMessage> = {
    [K in ClientEventType]: BaseMessage & (K extends keyof ClientEventMessages ? IfAny<ClientEventMessages[K], {}, ClientEventMessages[K]> : {}) & {
        clientEventType: K;
        client: Client;
    };
}[ClientEventType];
interface BaseClientManagerEventMessages {
    client: {
        client: Client;
    };
    clients: {
        clients: Client[];
    };
    [wildcardClientEventType]: WildcardClientEventMessage<BaseClientManagerClientEventMessage>;
}
export declare const ClientManagerEventTypes: readonly [...("clientConnected" | "clientNotConnected" | "clientConnecting" | "clientDisconnecting" | "clientConnectionStatus" | "clientIsConnected" | "clientIsScanningAvailable" | "clientIsScanning" | "clientDiscoveredDevice" | "clientExpiredDiscoveredDevice" | "clientScanningAvailable" | "clientScanningNotAvailable" | "clientScanning" | "clientNotScanning")[], "client", "clients", "client*"];
export type ClientManagerEventType = (typeof ClientManagerEventTypes)[number];
export type ClientManagerEventMessages = ClientManagerClientEventMessages & BaseClientManagerEventMessages;
export type ClientManagerEventDisptcherTypes = EventDispatcherTypes<ClientManager, ClientManagerEventType, ClientManagerEventMessages>;
export type ClientManagerEvent = ClientManagerEventDisptcherTypes["Event"];
export type ClientManagerEventMap = ClientManagerEventDisptcherTypes["EventMap"];
export type ClientManagerEventListenerMap = ClientManagerEventDisptcherTypes["EventListenerMap"];
export type ClientManagerEventDispatcher = ClientManagerEventDisptcherTypes["EventDispatcher"];
export type BoundClientManagerEventListeners = ClientManagerEventDisptcherTypes["BoundEventListeners"];
declare class ClientManager {
    #private;
    static readonly shared: ClientManager;
    constructor();
    get clients(): Client[];
    get addEventListener(): <T extends "*" | "client" | "clientConnected" | "clients" | "client*" | "clientNotConnected" | "clientConnecting" | "clientDisconnecting" | "clientConnectionStatus" | "clientIsConnected" | "clientIsScanningAvailable" | "clientIsScanning" | "clientDiscoveredDevice" | "clientExpiredDiscoveredDevice" | "clientScanningAvailable" | "clientScanningNotAvailable" | "clientScanning" | "clientNotScanning">(type: T, listener: (event: import("../utils/EventDispatcher.ts").ListenerEvent<ClientManager, "client" | "clientConnected" | "clients" | "client*" | "clientNotConnected" | "clientConnecting" | "clientDisconnecting" | "clientConnectionStatus" | "clientIsConnected" | "clientIsScanningAvailable" | "clientIsScanning" | "clientDiscoveredDevice" | "clientExpiredDiscoveredDevice" | "clientScanningAvailable" | "clientScanningNotAvailable" | "clientScanning" | "clientNotScanning", ClientManagerEventMessages, T>) => void, options?: import("../utils/EventDispatcher.ts").EventDispatcherOptions) => void;
    get removeEventListener(): <T extends "*" | "client" | "clientConnected" | "clients" | "client*" | "clientNotConnected" | "clientConnecting" | "clientDisconnecting" | "clientConnectionStatus" | "clientIsConnected" | "clientIsScanningAvailable" | "clientIsScanning" | "clientDiscoveredDevice" | "clientExpiredDiscoveredDevice" | "clientScanningAvailable" | "clientScanningNotAvailable" | "clientScanning" | "clientNotScanning">(type: T, listener: (event: import("../utils/EventDispatcher.ts").ListenerEvent<ClientManager, "client" | "clientConnected" | "clients" | "client*" | "clientNotConnected" | "clientConnecting" | "clientDisconnecting" | "clientConnectionStatus" | "clientIsConnected" | "clientIsScanningAvailable" | "clientIsScanning" | "clientDiscoveredDevice" | "clientExpiredDiscoveredDevice" | "clientScanningAvailable" | "clientScanningNotAvailable" | "clientScanning" | "clientNotScanning", ClientManagerEventMessages, T>) => void) => void;
    get removeEventListeners(): <T extends "*" | "client" | "clientConnected" | "clients" | "client*" | "clientNotConnected" | "clientConnecting" | "clientDisconnecting" | "clientConnectionStatus" | "clientIsConnected" | "clientIsScanningAvailable" | "clientIsScanning" | "clientDiscoveredDevice" | "clientExpiredDiscoveredDevice" | "clientScanningAvailable" | "clientScanningNotAvailable" | "clientScanning" | "clientNotScanning">(type: T) => void;
}
declare const _default: ClientManager;
export default _default;
