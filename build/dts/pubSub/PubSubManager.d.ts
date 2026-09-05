import { EventDispatcherListenerObject, EventDispatcherOptions, EventDispatcherTypes } from "../utils/EventDispatcher.ts";
import { PubSubMessageOrMessageType } from "./PubSubManagerUtils.ts";
import { ServerClient } from "../server/Server.ts";
import { Client } from "../server/Client.ts";
import { ServerType } from "../server/BaseServer.ts";
import GuardManager from "../utils/GuardManager.ts";
export type PubSubPeer = ServerClient | Client;
export interface PubSubPeerContext {
    peer: PubSubPeer;
    responseMessages: PubSubMessageOrMessageType[];
}
export declare const PubSubManagerEventTypes: readonly ["peerConnected", "peerNotConnected", "subscribed", "unsubscribed", "peerSubscribed", "peerUnsubscribed", "published", "peerPublished"];
export type PubSubManagerEventType = (typeof PubSubManagerEventTypes)[number];
interface PubSubManagerEventMessages {
    peerConnected: {
        peer: PubSubPeer;
    };
    peerNotConnected: {
        peer: PubSubPeer;
    };
    subscribed: {
        peer: PubSubPeer;
        type: string;
    };
    unsubscribed: {
        peer: PubSubPeer;
        type: string;
    };
    peerSubscribed: {
        peer: PubSubPeer;
        type: string;
    };
    peerUnsubscribed: {
        peer: PubSubPeer;
        type: string;
    };
    published: {
        peers: PubSubPeer[];
        type: string;
        data: DataView;
    };
    peerPublished: {
        peer: PubSubPeer;
        type: string;
        data: DataView;
    };
}
export type PubSubManagerEventDispatcherTypes = EventDispatcherTypes<PubSubManager, PubSubManagerEventType, PubSubManagerEventMessages>;
export type PubSubManagerEvent = PubSubManagerEventDispatcherTypes["Event"];
export type PubSubManagerEventMap = PubSubManagerEventDispatcherTypes["EventMap"];
export type PubSubManagerEventListenerMap = PubSubManagerEventDispatcherTypes["EventListenerMap"];
export type PubSubManagerEventDispatcher = PubSubManagerEventDispatcherTypes["EventDispatcher"];
export type BoundPubSubManagerEventListeners = PubSubManagerEventDispatcherTypes["BoundEventListeners"];
export type PubSubEvent = {
    type: string;
    target: PubSubManager;
    message: PubSubEventMessage;
};
export type PubSubEventMessage = {
    peer: PubSubPeer;
    data: DataView;
};
export type PubSubListener = (event: PubSubEvent) => void;
export type PubSubManagerLatestEventMap = Record<string, PubSubEvent>;
export type PubSubPeerOrType = PubSubPeer | ServerType;
export type BasePubSubManagerOptions = {
    peers?: PubSubPeerOrType[];
    ignorePeers?: PubSubPeerOrType[];
};
export declare const DefaultBasePubSubManagerOptions: BasePubSubManagerOptions;
export type PubSubManagerPublishOptions = BasePubSubManagerOptions;
export declare const DefaultPubSubManagerPublishOptions: PubSubManagerPublishOptions;
export type PubSubManagerListenerOptions = BasePubSubManagerOptions & EventDispatcherOptions;
export type PubSubManagerListenerObject = PubSubManagerListenerOptions & EventDispatcherListenerObject;
export declare const DefaultPubSubListenerOptions: PubSubManagerListenerOptions;
export declare function verifyBasePubSubManagerOptions(options: BasePubSubManagerOptions): void;
export declare function verifyPubSubManagerEventTypeLength(type: string): void;
export declare function doesBasePubSubManagerOptionsIncludePeer(options: BasePubSubManagerOptions, peer: PubSubPeer): boolean;
export interface PubSubManagerPeerSubscriptionGuardManagerArg {
    peer: PubSubPeer;
    type: string;
    data: DataView;
    sendingPeer?: PubSubPeer;
}
declare class PubSubManager {
    #private;
    get addEventListener(): <T extends "*" | "peerConnected" | "peerNotConnected" | "subscribed" | "unsubscribed" | "peerSubscribed" | "peerUnsubscribed" | "published" | "peerPublished">(type: T, listener: (event: import("../utils/EventDispatcher.ts").ListenerEvent<PubSubManager, "peerConnected" | "peerNotConnected" | "subscribed" | "unsubscribed" | "peerSubscribed" | "peerUnsubscribed" | "published" | "peerPublished", PubSubManagerEventMessages, T>) => void, options?: EventDispatcherOptions) => void;
    get removeEventListener(): <T extends "*" | "peerConnected" | "peerNotConnected" | "subscribed" | "unsubscribed" | "peerSubscribed" | "peerUnsubscribed" | "published" | "peerPublished">(type: T, listener: (event: import("../utils/EventDispatcher.ts").ListenerEvent<PubSubManager, "peerConnected" | "peerNotConnected" | "subscribed" | "unsubscribed" | "peerSubscribed" | "peerUnsubscribed" | "published" | "peerPublished", PubSubManagerEventMessages, T>) => void) => void;
    get waitForEvent(): <T extends "peerConnected" | "peerNotConnected" | "subscribed" | "unsubscribed" | "peerSubscribed" | "peerUnsubscribed" | "published" | "peerPublished">(type: T, options?: {
        immediate?: boolean;
        signal?: AbortSignal;
    }) => Promise<import("../utils/EventDispatcher.ts").ListenerEvent<PubSubManager, "peerConnected" | "peerNotConnected" | "subscribed" | "unsubscribed" | "peerSubscribed" | "peerUnsubscribed" | "published" | "peerPublished", PubSubManagerEventMessages, T>>;
    get removeEventListeners(): <T extends "*" | "peerConnected" | "peerNotConnected" | "subscribed" | "unsubscribed" | "peerSubscribed" | "peerUnsubscribed" | "published" | "peerPublished">(type: T) => void;
    get removeAllEventListeners(): () => void;
    static readonly shared: PubSubManager;
    protected _init(): void;
    get peers(): PubSubPeer[];
    subscribe(type: string, listener: PubSubListener, options?: PubSubManagerListenerOptions): void;
    unsubscribe(type: string, listener: PubSubListener): void;
    publish(type: string, data: DataView | ArrayBuffer, options?: PubSubManagerPublishOptions): PubSubPeer[];
    private _parsePeerMessage;
    peerSubscriptionGuardManager: GuardManager<[PubSubManagerPeerSubscriptionGuardManagerArg]>;
}
declare const _default: PubSubManager;
export default _default;
