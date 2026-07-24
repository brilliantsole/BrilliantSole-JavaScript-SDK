import { EventDispatcherTypes } from "../utils/EventDispatcher.ts";
import { DeviceMessage } from "./ServerUtils.ts";
import Device from "../Device.ts";
export declare const ServerTypes: readonly ["window", "webSocket", "udp"];
export type ServerType = (typeof ServerTypes)[number];
export declare const serverMtus: Record<ServerType, number>;
export interface BaseServerClient {
    readonly type: ServerType;
}
export declare const ServerEventTypes: readonly ["clientConnected", "clientDisconnected"];
export type ServerEventType = (typeof ServerEventTypes)[number];
export interface BaseServerEventMessages<ServerClient extends BaseServerClient> {
    clientConnected: {
        client: ServerClient;
    };
    clientDisconnected: {
        client: ServerClient;
    };
}
export type BaseServerEventDispatcherTypes<ServerClient extends BaseServerClient> = EventDispatcherTypes<BaseServer<ServerClient>, ServerEventType, BaseServerEventMessages<ServerClient>>;
export type BaseServerEvent<ServerClient extends BaseServerClient> = BaseServerEventDispatcherTypes<ServerClient>["Event"];
export type BaseServerEventMap<ServerClient extends BaseServerClient> = BaseServerEventDispatcherTypes<ServerClient>["EventMap"];
export type BaseServerEventListenerMap<ServerClient extends BaseServerClient> = BaseServerEventDispatcherTypes<ServerClient>["EventListenerMap"];
export type BaseServerEventDispatcher<ServerClient extends BaseServerClient> = BaseServerEventDispatcherTypes<ServerClient>["EventDispatcher"];
export type BoundBaseServerEventListeners<ServerClient extends BaseServerClient> = BaseServerEventDispatcherTypes<ServerClient>["BoundEventListeners"];
export interface BaseServerClientContext<ServerClient extends BaseServerClient> {
    client: ServerClient;
    responseMessages: (ArrayBuffer | undefined)[];
    localBroadcastMessages: (ArrayBuffer | undefined)[];
    broadcastMessages: (ArrayBuffer | undefined)[];
}
export interface BaseServerClientDeviceContext<ServerClient extends BaseServerClient> {
    client: ServerClient;
    deviceMessages: DeviceMessage[];
    broadcastDeviceMessages: DeviceMessage[];
    device: Device;
}
export interface BaseServerClientMetaData {
    sent?: boolean;
    initiated?: boolean;
    bytesTransferred: number;
}
declare abstract class BaseServer<ServerClient extends BaseServerClient> {
    #private;
    static type: ServerType;
    abstract readonly type: ServerType;
    protected get baseConstructor(): typeof BaseServer;
    static get clientMtu(): number;
    get clientMtu(): number;
    get addEventListener(): <T extends "clientConnected" | "clientDisconnected" | "*">(type: T, listener: (event: import("../utils/EventDispatcher.ts").ListenerEvent<BaseServer<ServerClient>, "clientConnected" | "clientDisconnected", BaseServerEventMessages<ServerClient>, T>) => void, options?: import("../utils/EventDispatcher.ts").EventDispatcherOptions) => void;
    protected get dispatchEvent(): <T extends "clientConnected" | "clientDisconnected">(type: T, message: BaseServerEventMessages<ServerClient>[T]) => void;
    get removeEventListener(): <T extends "clientConnected" | "clientDisconnected" | "*">(type: T, listener: (event: import("../utils/EventDispatcher.ts").ListenerEvent<BaseServer<ServerClient>, "clientConnected" | "clientDisconnected", BaseServerEventMessages<ServerClient>, T>) => void) => void;
    get waitForEvent(): <T extends "clientConnected" | "clientDisconnected">(type: T, options?: {
        immediate?: boolean;
    }) => Promise<import("../utils/EventDispatcher.ts").ListenerEvent<BaseServer<ServerClient>, "clientConnected" | "clientDisconnected", BaseServerEventMessages<ServerClient>, T>>;
    private static OnServer;
    constructor();
    clients: ServerClient[];
    static get ClearSensorConfigurationsWhenNoClients(): boolean;
    static set ClearSensorConfigurationsWhenNoClients(newValue: boolean);
    get clearSensorConfigurationsWhenNoClients(): boolean;
    set clearSensorConfigurationsWhenNoClients(newValue: boolean);
    protected sendToClient(client: ServerClient, arrayBuffer: ArrayBuffer, isWrapped?: boolean): boolean;
    broadcast(arrayBuffer: ArrayBuffer, clients?: ServerClient[], excludeClients?: ServerClient[], isWrapped?: boolean): void;
    protected parseClientMessage(client: ServerClient, dataView: DataView<ArrayBuffer>): BaseServerClientContext<BaseServerClient> | undefined;
    protected sendClientContext(clientContext: BaseServerClientContext<ServerClient>): void;
}
export default BaseServer;
