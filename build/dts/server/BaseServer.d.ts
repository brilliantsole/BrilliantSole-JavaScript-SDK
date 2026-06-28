import { EventDispatcherTypes } from "../utils/EventDispatcher.ts";
import { DeviceMessage, ServerMessage } from "./ServerUtils.ts";
import Device from "../Device.ts";
import GuardManager from "../utils/GuardManager.ts";
import { SensorType } from "../sensor/SensorDataManager.ts";
import { DisplayContextCommand } from "../utils/DisplayContextCommand.ts";
export declare const ServerTypes: readonly ["window", "webSocket", "udp"];
export type ServerType = (typeof ServerTypes)[number];
export interface BaseServerClient {
    readonly type: ServerType;
}
export declare const ServerEventTypes: readonly ["clientConnected", "clientDisconnected"];
export type ServerEventType = (typeof ServerEventTypes)[number];
export interface ServerEventMessages<ServerClient extends BaseServerClient> {
    clientConnected: {
        client: ServerClient;
    };
    clientDisconnected: {
        client: ServerClient;
    };
}
export type BaseServerEventDispatcherTypes<ServerClient extends BaseServerClient> = EventDispatcherTypes<BaseServer<ServerClient>, ServerEventType, ServerEventMessages<ServerClient>>;
export type BaseServerEvent<ServerClient extends BaseServerClient> = BaseServerEventDispatcherTypes<ServerClient>["Event"];
export type BaseServerEventMap<ServerClient extends BaseServerClient> = BaseServerEventDispatcherTypes<ServerClient>["EventMap"];
export type BaseServerEventListenerMap<ServerClient extends BaseServerClient> = BaseServerEventDispatcherTypes<ServerClient>["EventListenerMap"];
export type BaseServerEventDispatcher<ServerClient extends BaseServerClient> = BaseServerEventDispatcherTypes<ServerClient>["EventDispatcher"];
export type BoundBaseServerEventListeners<ServerClient extends BaseServerClient> = BaseServerEventDispatcherTypes<ServerClient>["BoundEventListeners"];
export interface BaseServerClientContext<ServerClient extends BaseServerClient> {
    client: ServerClient;
    responseMessages: (ArrayBuffer | undefined)[];
}
export interface BaseServerClientDeviceContext<ServerClient extends BaseServerClient> {
    client: ServerClient;
    deviceMessages: DeviceMessage[];
    device: Device;
}
export interface BaseServerClientGuardManagerArg<Server extends BaseServer<ServerClient>, ServerClient extends BaseServerClient> {
    client: ServerClient;
    message?: ServerMessage;
    server: Server;
}
export interface BaseServerClientDeviceGuardManagerArg<Server extends BaseServer<ServerClient>, ServerClient extends BaseServerClient> {
    device: Device;
    client: ServerClient;
    message?: DeviceMessage;
    server: Server;
}
export interface BaseServerClientDeviceSensorDataGuardManagerArg<Server extends BaseServer<ServerClient>, ServerClient extends BaseServerClient> {
    device: Device;
    client: ServerClient;
    sensorType: SensorType;
    sensorData: DataView;
    server: Server;
}
export interface BaseServerClientDeviceSensorConfigurationGuardManagerArg<Server extends BaseServer<ServerClient>, ServerClient extends BaseServerClient> {
    device: Device;
    client: ServerClient;
    sensorType: SensorType;
    sensorRate: number;
    server: Server;
}
export interface BaseServerClientDeviceDisplayContextCommandGuardManagerArg<Server extends BaseServer<ServerClient>, ServerClient extends BaseServerClient> {
    device: Device;
    client: ServerClient;
    displayContextCommand: DisplayContextCommand;
    server: Server;
}
declare abstract class BaseServer<ServerClient extends BaseServerClient> {
    #private;
    static type: ServerType;
    abstract readonly type: ServerType;
    get addEventListener(): <T extends "*" | "clientConnected" | "clientDisconnected">(type: T, listener: (event: import("../utils/EventDispatcher.ts").ListenerEvent<BaseServer<ServerClient>, "clientConnected" | "clientDisconnected", ServerEventMessages<ServerClient>, T>) => void, options?: import("../utils/EventDispatcher.ts").EventDispatcherOptions) => void;
    protected get dispatchEvent(): <T extends "clientConnected" | "clientDisconnected">(type: T, message: ServerEventMessages<ServerClient>[T]) => void;
    get removeEventListener(): <T extends "*" | "clientConnected" | "clientDisconnected">(type: T, listener: (event: import("../utils/EventDispatcher.ts").ListenerEvent<BaseServer<ServerClient>, "clientConnected" | "clientDisconnected", ServerEventMessages<ServerClient>, T>) => void) => void;
    get waitForEvent(): <T extends "clientConnected" | "clientDisconnected">(type: T, options?: {
        immediate?: boolean;
    }) => Promise<import("../utils/EventDispatcher.ts").ListenerEvent<BaseServer<ServerClient>, "clientConnected" | "clientDisconnected", ServerEventMessages<ServerClient>, T>>;
    private static OnServer;
    constructor();
    clients: ServerClient[];
    static get ClearSensorConfigurationsWhenNoClients(): boolean;
    static set ClearSensorConfigurationsWhenNoClients(newValue: boolean);
    get clearSensorConfigurationsWhenNoClients(): boolean;
    set clearSensorConfigurationsWhenNoClients(newValue: boolean);
    protected abstract sendToClient(client: ServerClient, message: ArrayBuffer): void;
    broadcastMessage(message: ArrayBuffer, clients?: ServerClient[]): void;
    clientToServerGuardManager: GuardManager<[BaseServerClientGuardManagerArg<BaseServer<ServerClient>, ServerClient>]>;
    serverToClientGuardManager: GuardManager<[BaseServerClientGuardManagerArg<BaseServer<ServerClient>, ServerClient>]>;
    clientToDeviceGuardManager: GuardManager<[BaseServerClientDeviceGuardManagerArg<BaseServer<ServerClient>, ServerClient>]>;
    deviceToClientGuardManager: GuardManager<[BaseServerClientDeviceGuardManagerArg<BaseServer<ServerClient>, ServerClient>]>;
    deviceSensorDataToClientGuardManager: GuardManager<[BaseServerClientDeviceSensorDataGuardManagerArg<BaseServer<ServerClient>, ServerClient>]>;
    clientSensorConfigurationToDeviceGuardManager: GuardManager<[BaseServerClientDeviceSensorConfigurationGuardManagerArg<BaseServer<ServerClient>, ServerClient>]>;
    clientDisplayContextCommandToDeviceGuardManager: GuardManager<[BaseServerClientDeviceDisplayContextCommandGuardManagerArg<BaseServer<ServerClient>, ServerClient>]>;
    deviceDisplayContextCommandToClientGuardManager: GuardManager<[BaseServerClientDeviceDisplayContextCommandGuardManagerArg<BaseServer<ServerClient>, ServerClient>]>;
    protected parseClientMessage(client: ServerClient, dataView: DataView<ArrayBuffer>): ArrayBuffer | undefined;
    protected parseClientDeviceMessage(client: ServerClient, device: Device, dataView: DataView<ArrayBuffer>): ArrayBuffer | undefined;
}
export default BaseServer;
