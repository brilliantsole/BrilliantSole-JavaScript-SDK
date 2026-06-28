import { ClientDeviceMessage, ServerMessageOrMessageType } from "./ServerUtils.ts";
import { EventDispatcherTypes } from "../utils/EventDispatcher.ts";
import Device from "../Device.ts";
import { DiscoveredDevice, DiscoveredDevicesMap, ScannerEventMessages } from "../scanner/BaseScanner.ts";
import { ClientConnectionType } from "../connection/BaseConnectionManager.ts";
export declare const ClientTypes: readonly ["window", "webSocket", "udp"];
export type ClientType = (typeof ClientTypes)[number];
export declare const ClientConnectionStatuses: readonly ["notConnected", "connecting", "connected", "disconnecting"];
export type ClientConnectionStatus = (typeof ClientConnectionStatuses)[number];
export declare const ClientEventTypes: readonly ["notConnected", "connecting", "connected", "disconnecting", "connectionStatus", "isConnected", "isScanningAvailable", "isScanning", "discoveredDevice", "expiredDiscoveredDevice"];
export type ClientEventType = (typeof ClientEventTypes)[number];
interface ClientConnectionEventMessages {
    connectionStatus: {
        connectionStatus: ClientConnectionStatus;
    };
    isConnected: {
        isConnected: boolean;
    };
}
export type ClientEventMessages = ClientConnectionEventMessages & ScannerEventMessages;
export type ClientEventDispatcherTypes = EventDispatcherTypes<BaseClient, ClientEventType, ClientEventMessages>;
export type ClientEvent = ClientEventDispatcherTypes["Event"];
export type ClientEventMap = ClientEventDispatcherTypes["EventMap"];
export type ClientEventListenerMap = ClientEventDispatcherTypes["EventListenerMap"];
export type ClientEventDispatcher = ClientEventDispatcherTypes["EventDispatcher"];
export type BoundClientEventListeners = ClientEventDispatcherTypes["BoundEventListeners"];
export type ServerURL = string | URL;
declare abstract class BaseClient {
    #private;
    static type: ClientType;
    abstract readonly type: ClientType;
    protected get baseConstructor(): typeof BaseClient;
    get devices(): {
        [deviceId: string]: Device;
    };
    get addEventListener(): <T extends "*" | "isConnected" | "notConnected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice">(type: T, listener: (event: import("../utils/EventDispatcher.ts").ListenerEvent<BaseClient, "isConnected" | "notConnected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice", ClientEventMessages, T>) => void, options?: import("../utils/EventDispatcher.ts").EventDispatcherOptions) => void;
    get removeEventListener(): <T extends "*" | "isConnected" | "notConnected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice">(type: T, listener: (event: import("../utils/EventDispatcher.ts").ListenerEvent<BaseClient, "isConnected" | "notConnected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice", ClientEventMessages, T>) => void) => void;
    get waitForEvent(): <T extends "isConnected" | "notConnected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice">(type: T, options?: {
        immediate?: boolean;
    }) => Promise<import("../utils/EventDispatcher.ts").ListenerEvent<BaseClient, "isConnected" | "notConnected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice", ClientEventMessages, T>>;
    abstract isConnected: boolean;
    protected assertConnection(): void;
    abstract isDisconnected: boolean;
    protected assertDisconnection(): void;
    abstract connect(): void;
    abstract disconnect(): void;
    abstract reconnect(): void;
    abstract toggleConnection(url?: ServerURL): void;
    private static _reconnectOnDisconnection;
    static get ReconnectOnDisconnection(): boolean;
    static set ReconnectOnDisconnection(newReconnectOnDisconnection: boolean);
    protected _reconnectOnDisconnection: boolean;
    get reconnectOnDisconnection(): boolean;
    set reconnectOnDisconnection(newReconnectOnDisconnection: boolean);
    abstract sendServerMessage(...messages: ServerMessageOrMessageType[]): void;
    protected get _connectionStatus(): "notConnected" | "connecting" | "connected" | "disconnecting";
    protected set _connectionStatus(newConnectionStatus: "notConnected" | "connecting" | "connected" | "disconnecting");
    get connectionStatus(): "notConnected" | "connecting" | "connected" | "disconnecting";
    protected _sendRequiredMessages(): void;
    protected parseMessage(dataView: DataView<ArrayBuffer>): void;
    get isScanningAvailable(): boolean;
    protected requestIsScanningAvailable(): void;
    get isScanning(): boolean;
    startScan(): void;
    stopScan(): void;
    toggleScan(): void;
    get discoveredDevices(): Readonly<DiscoveredDevicesMap>;
    protected onDiscoveredDevice(discoveredDevice: DiscoveredDevice): void;
    requestDiscoveredDevices(): void;
    connectToDevice(bluetoothId: string, connectionType?: ClientConnectionType): Device;
    protected requestConnectionToDevice(bluetoothId: string, connectionType?: ClientConnectionType): Device;
    protected sendConnectToDeviceMessage(bluetoothId: string, connectionType?: ClientConnectionType): void;
    createDevice(bluetoothId: string): Device;
    protected onConnectedBluetoothDeviceIds(bluetoothIds: string[]): Device[];
    disconnectFromDevice(bluetoothId: string): void;
    protected requestDisconnectionFromDevice(bluetoothId: string): Device;
    protected sendDisconnectFromDeviceMessage(bluetoothId: string): void;
    protected sendDeviceMessage(bluetoothId: string, ...messages: ClientDeviceMessage[]): void;
    protected sendRequiredDeviceInformationMessage(bluetoothId: string): void;
}
export default BaseClient;
