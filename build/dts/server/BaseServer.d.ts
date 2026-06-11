import EventDispatcher, { BoundEventListeners, Event, EventMap } from "../utils/EventDispatcher.ts";
import { DeviceMessage, ServerMessage } from "./ServerUtils.ts";
import Device from "../Device.ts";
import GuardManager from "../utils/GuardManager.ts";
import { SensorType } from "../sensor/SensorDataManager.ts";
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
declare abstract class BaseServer<ServerClient extends BaseServerClient> {
    #private;
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
    protected abstract sendToClient(client: ServerClient, message: ArrayBuffer): void;
    broadcastMessage(message: ArrayBuffer, clients?: ServerClient[]): void;
    clientToServerGuardManager: GuardManager<[BaseServerClientGuardManagerArg<BaseServer<ServerClient>, ServerClient>]>;
    serverToClientGuardManager: GuardManager<[BaseServerClientGuardManagerArg<BaseServer<ServerClient>, ServerClient>]>;
    clientToDeviceGuardManager: GuardManager<[BaseServerClientDeviceGuardManagerArg<BaseServer<ServerClient>, ServerClient>]>;
    deviceToClientGuardManager: GuardManager<[BaseServerClientDeviceGuardManagerArg<BaseServer<ServerClient>, ServerClient>]>;
    deviceSensorDataToClientGuardManager: GuardManager<[BaseServerClientDeviceSensorDataGuardManagerArg<BaseServer<ServerClient>, ServerClient>]>;
    clientSensorConfigurationToDeviceGuardManager: GuardManager<[BaseServerClientDeviceSensorConfigurationGuardManagerArg<BaseServer<ServerClient>, ServerClient>]>;
    protected parseClientMessage(client: ServerClient, dataView: DataView<ArrayBuffer>): ArrayBuffer | undefined;
    protected parseClientDeviceMessage(client: ServerClient, device: Device, dataView: DataView<ArrayBuffer>): ArrayBuffer | undefined;
}
export default BaseServer;
