import { EventDispatcherTypes } from "../utils/EventDispatcher.ts";
import { AddPrefixToInterfaceKeys, ExtendInterfaceValues, IfAny } from "../utils/TypeScriptUtils.ts";
import { ServerEventType } from "./BaseServer.ts";
import { Server, ServerClient, ServerEventMessages } from "./Server.ts";
import { SensorType } from "../sensor/SensorDataManager.ts";
import GuardManager from "../utils/GuardManager.ts";
import { DeviceMessage, ServerMessage } from "./ServerUtils.ts";
import Device from "../Device.ts";
import { DisplayContextCommand } from "../utils/DisplayContextCommand.ts";
import { VibrationConfiguration } from "../vibration/VibrationManager.ts";
import { ExtendedFileConfiguration } from "../FileTransferManager.ts";
interface BaseServerManagerServerEventMessage {
    server: Server;
}
type ServerManagerServerEventMessages = ExtendInterfaceValues<AddPrefixToInterfaceKeys<ServerEventMessages, "server">, BaseServerManagerServerEventMessage>;
export declare const wildcardServerEventType: "server*";
export type WildcardServerEventType = typeof wildcardServerEventType;
export type WildcardServerEventMessage<BaseMessage> = {
    [K in ServerEventType]: BaseMessage & (K extends keyof ServerEventMessages ? IfAny<ServerEventMessages[K], {}, ServerEventMessages[K]> : {}) & {
        serverEventType: K;
        server: Server;
    };
}[ServerEventType];
interface BaseServerManagerEventMessages {
    server: {
        server: Server;
    };
    servers: {
        servers: Server[];
    };
    [wildcardServerEventType]: WildcardServerEventMessage<BaseServerManagerServerEventMessage>;
}
export declare const ServerManagerEventTypes: readonly [...("serverClientConnected" | "serverClientNotConnected")[], "server", "servers", "server*"];
export type ServerManagerEventType = (typeof ServerManagerEventTypes)[number];
export type ServerManagerEventMessages = ServerManagerServerEventMessages & BaseServerManagerEventMessages;
export type ServerManagerEventDisptcherTypes = EventDispatcherTypes<ServerManager, ServerManagerEventType, ServerManagerEventMessages>;
export type ServerManagerEvent = ServerManagerEventDisptcherTypes["Event"];
export type ServerManagerEventMap = ServerManagerEventDisptcherTypes["EventMap"];
export type ServerManagerEventListenerMap = ServerManagerEventDisptcherTypes["EventListenerMap"];
export type ServerManagerEventDispatcher = ServerManagerEventDisptcherTypes["EventDispatcher"];
export type BoundServerManagerEventListeners = ServerManagerEventDisptcherTypes["BoundEventListeners"];
export interface BaseServerClientGuardManagerArg {
    client: ServerClient;
    message?: ServerMessage;
    server: Server;
}
export interface BaseServerClientDeviceGuardManagerArg {
    device: Device;
    client: ServerClient;
    message?: DeviceMessage;
    server: Server;
}
export interface BaseServerClientDeviceSensorDataGuardManagerArg {
    device: Device;
    client: ServerClient;
    sensorType: SensorType;
    sensorData: DataView;
    server: Server;
}
export interface BaseServerClientDeviceSensorConfigurationGuardManagerArg {
    device: Device;
    client: ServerClient;
    sensorType: SensorType;
    sensorRate: number;
    server: Server;
}
export interface BaseServerClientDeviceDisplayContextCommandGuardManagerArg {
    device: Device;
    client: ServerClient;
    displayContextCommand: DisplayContextCommand;
    server: Server;
}
export interface BaseServerClientDeviceVibrationConfigurationGuardManagerArg {
    device: Device;
    client: ServerClient;
    vibrationConfiguration: VibrationConfiguration;
    server: Server;
}
export interface BaseServerClientDeviceFileGuardManagerArg {
    device: Device;
    client: ServerClient;
    fileConfiguration: ExtendedFileConfiguration;
    server: Server;
}
declare class ServerManager {
    #private;
    static readonly shared: ServerManager;
    constructor();
    get servers(): Server[];
    getServerByClient(client: ServerClient): Server | undefined;
    get addEventListener(): <T extends "*" | "server" | "server*" | "serverClientConnected" | "serverClientNotConnected" | "servers">(type: T, listener: (event: import("../utils/EventDispatcher.ts").ListenerEvent<ServerManager, "server" | "server*" | "serverClientConnected" | "serverClientNotConnected" | "servers", ServerManagerEventMessages, T>) => void, options?: import("../utils/EventDispatcher.ts").EventDispatcherOptions) => void;
    get removeEventListener(): <T extends "*" | "server" | "server*" | "serverClientConnected" | "serverClientNotConnected" | "servers">(type: T, listener: (event: import("../utils/EventDispatcher.ts").ListenerEvent<ServerManager, "server" | "server*" | "serverClientConnected" | "serverClientNotConnected" | "servers", ServerManagerEventMessages, T>) => void) => void;
    get removeEventListeners(): <T extends "*" | "server" | "server*" | "serverClientConnected" | "serverClientNotConnected" | "servers">(type: T) => void;
    private broadcast;
    clientToServerGuardManager: GuardManager<[BaseServerClientGuardManagerArg]>;
    serverToClientGuardManager: GuardManager<[BaseServerClientGuardManagerArg]>;
    clientToDeviceGuardManager: GuardManager<[BaseServerClientDeviceGuardManagerArg]>;
    deviceToClientGuardManager: GuardManager<[BaseServerClientDeviceGuardManagerArg]>;
    deviceSensorDataToClientGuardManager: GuardManager<[BaseServerClientDeviceSensorDataGuardManagerArg]>;
    clientSensorConfigurationToDeviceGuardManager: GuardManager<[BaseServerClientDeviceSensorConfigurationGuardManagerArg]>;
    clientDisplayContextCommandToDeviceGuardManager: GuardManager<[BaseServerClientDeviceDisplayContextCommandGuardManagerArg]>;
    deviceDisplayContextCommandToClientGuardManager: GuardManager<[BaseServerClientDeviceDisplayContextCommandGuardManagerArg]>;
    clientVibrationConfigurationToDeviceGuardManager: GuardManager<[BaseServerClientDeviceVibrationConfigurationGuardManagerArg]>;
    deviceFileToClientGuardManager: GuardManager<[BaseServerClientDeviceFileGuardManagerArg]>;
}
declare const _default: ServerManager;
export default _default;
