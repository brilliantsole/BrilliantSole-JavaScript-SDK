import EventDispatcher, { BoundEventListeners, Event, EventMap } from "../utils/EventDispatcher.ts";
import Device from "../Device.ts";
export declare const ServerEventTypes: readonly ["clientConnected", "clientDisconnected"];
export type ServerEventType = (typeof ServerEventTypes)[number];
interface ServerEventMessages {
    clientConnected: {
        client: any;
    };
    clientDisconnected: {
        client: any;
    };
}
export type ServerEventDispatcher = EventDispatcher<BaseServer, ServerEventType, ServerEventMessages>;
export type ServerEvent = Event<BaseServer, ServerEventType, ServerEventMessages>;
export type ServerEventMap = EventMap<BaseServer, ServerEventType, ServerEventMessages>;
export type BoundServerEventListeners = BoundEventListeners<BaseServer, ServerEventType, ServerEventMessages>;
declare abstract class BaseServer {
    #private;
    protected eventDispatcher: ServerEventDispatcher;
    get addEventListener(): <T extends "clientConnected" | "clientDisconnected">(type: T, listener: (event: {
        type: T;
        target: BaseServer;
        message: ServerEventMessages[T];
    }) => void, options?: {
        once?: boolean;
    }) => void;
    protected get dispatchEvent(): <T extends "clientConnected" | "clientDisconnected">(type: T, message: ServerEventMessages[T]) => void;
    get removeEventListener(): <T extends "clientConnected" | "clientDisconnected">(type: T, listener: (event: {
        type: T;
        target: BaseServer;
        message: ServerEventMessages[T];
    }) => void) => void;
    get waitForEvent(): <T extends "clientConnected" | "clientDisconnected">(type: T) => Promise<{
        type: T;
        target: BaseServer;
        message: ServerEventMessages[T];
    }>;
    constructor();
    get numberOfClients(): number;
    static get ClearSensorConfigurationsWhenNoClients(): boolean;
    static set ClearSensorConfigurationsWhenNoClients(newValue: boolean);
    get clearSensorConfigurationsWhenNoClients(): boolean;
    set clearSensorConfigurationsWhenNoClients(newValue: boolean);
    broadcastMessage(message: ArrayBuffer): void;
    protected parseClientMessage(dataView: DataView): ArrayBuffer | undefined;
    protected parseClientDeviceMessage(device: Device, dataView: DataView): ArrayBuffer | undefined;
}
export default BaseServer;
