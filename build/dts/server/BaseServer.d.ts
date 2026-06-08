import EventDispatcher, { BoundEventListeners, Event, EventMap } from "../utils/EventDispatcher.ts";
import Device from "../Device.ts";
export interface BaseServerClient {
}
export declare const ServerEventTypes: readonly ["clientConnected", "clientDisconnected"];
export type ServerEventType = (typeof ServerEventTypes)[number];
interface ServerEventMessages<ServerClient extends BaseServerClient> {
    clientConnected: {
        client: ServerClient;
    };
    clientDisconnected: {
        client: ServerClient;
    };
}
export type ServerEventDispatcher<ServerClient extends BaseServerClient> = EventDispatcher<BaseServer<ServerClient>, ServerEventType, ServerEventMessages<ServerClient>>;
export type ServerEvent<ServerClient extends BaseServerClient> = Event<BaseServer<ServerClient>, ServerEventType, ServerEventMessages<ServerClient>>;
export type ServerEventMap<ServerClient extends BaseServerClient> = EventMap<BaseServer<ServerClient>, ServerEventType, ServerEventMessages<ServerClient>>;
export type BoundServerEventListeners<ServerClient extends BaseServerClient> = BoundEventListeners<BaseServer<ServerClient>, ServerEventType, ServerEventMessages<ServerClient>>;
export interface BaseServerClientContext<ServerClient extends BaseServerClient> {
    client: ServerClient;
    responseMessages: (ArrayBuffer | undefined)[];
}
declare abstract class BaseServer<ServerClient extends BaseServerClient> {
    #private;
    protected eventDispatcher: ServerEventDispatcher<ServerClient>;
    get addEventListener(): <T extends "clientConnected" | "clientDisconnected">(type: T, listener: (event: {
        type: T;
        target: BaseServer<ServerClient>;
        message: ServerEventMessages<ServerClient>[T];
    }) => void, options?: {
        once?: boolean;
    }) => void;
    protected get dispatchEvent(): <T extends "clientConnected" | "clientDisconnected">(type: T, message: ServerEventMessages<ServerClient>[T]) => void;
    get removeEventListener(): <T extends "clientConnected" | "clientDisconnected">(type: T, listener: (event: {
        type: T;
        target: BaseServer<ServerClient>;
        message: ServerEventMessages<ServerClient>[T];
    }) => void) => void;
    get waitForEvent(): <T extends "clientConnected" | "clientDisconnected">(type: T) => Promise<{
        type: T;
        target: BaseServer<ServerClient>;
        message: ServerEventMessages<ServerClient>[T];
    }>;
    constructor();
    clients: ServerClient[];
    static get ClearSensorConfigurationsWhenNoClients(): boolean;
    static set ClearSensorConfigurationsWhenNoClients(newValue: boolean);
    get clearSensorConfigurationsWhenNoClients(): boolean;
    set clearSensorConfigurationsWhenNoClients(newValue: boolean);
    broadcastMessage(message: ArrayBuffer): void;
    protected parseClientMessage(client: ServerClient, dataView: DataView<ArrayBuffer>): ArrayBuffer | undefined;
    protected parseClientDeviceMessage(device: Device, dataView: DataView<ArrayBuffer>): ArrayBuffer | undefined;
}
export default BaseServer;
