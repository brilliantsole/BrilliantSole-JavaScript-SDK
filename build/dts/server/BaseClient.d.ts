import { ServerMessage, ClientDeviceMessage } from "./ServerUtils.ts";
import EventDispatcher, { BoundEventListeners, Event } from "../utils/EventDispatcher.ts";
import Device from "../Device.ts";
import { DiscoveredDevice, DiscoveredDevicesMap, ScannerEventMessages } from "../scanner/BaseScanner.ts";
import { ClientConnectionType } from "../connection/BaseConnectionManager.ts";
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
export type ClientEventDispatcher = EventDispatcher<BaseClient, ClientEventType, ClientEventMessages>;
export type ClientEvent = Event<BaseClient, ClientEventType, ClientEventMessages>;
export type BoundClientEventListeners = BoundEventListeners<BaseClient, ClientEventType, ClientEventMessages>;
export type ServerURL = string | URL;
type DevicesMap = {
    [deviceId: string]: Device;
};
declare abstract class BaseClient {
    #private;
    protected get baseConstructor(): typeof BaseClient;
    get devices(): Readonly<DevicesMap>;
    get addEventListener(): <T extends "notConnected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isConnected" | "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice">(type: T, listener: (event: {
        type: T;
        target: BaseClient;
        message: ClientEventMessages[T];
    }) => void, options?: {
        once?: boolean;
    }) => void;
    protected get dispatchEvent(): <T extends "notConnected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isConnected" | "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice">(type: T, message: ClientEventMessages[T]) => void;
    get removeEventListener(): <T extends "notConnected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isConnected" | "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice">(type: T, listener: (event: {
        type: T;
        target: BaseClient;
        message: ClientEventMessages[T];
    }) => void) => void;
    get waitForEvent(): <T extends "notConnected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isConnected" | "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice">(type: T) => Promise<{
        type: T;
        target: BaseClient;
        message: ClientEventMessages[T];
    }>;
    abstract isConnected: boolean;
    protected assertConnection(): void;
    abstract isDisconnected: boolean;
    protected assertDisconnection(): void;
    abstract connect(): void;
    abstract disconnect(): void;
    abstract reconnect(): void;
    abstract toggleConnection(url?: ServerURL): void;
    static _reconnectOnDisconnection: boolean;
    static get ReconnectOnDisconnection(): boolean;
    static set ReconnectOnDisconnection(newReconnectOnDisconnection: boolean);
    protected _reconnectOnDisconnection: boolean;
    get reconnectOnDisconnection(): boolean;
    set reconnectOnDisconnection(newReconnectOnDisconnection: boolean);
    abstract sendServerMessage(...messages: ServerMessage[]): void;
    protected get _connectionStatus(): "notConnected" | "connecting" | "connected" | "disconnecting";
    protected set _connectionStatus(newConnectionStatus: "notConnected" | "connecting" | "connected" | "disconnecting");
    get connectionStatus(): "notConnected" | "connecting" | "connected" | "disconnecting";
    protected _sendRequiredMessages(): void;
    protected parseMessage(dataView: DataView): void;
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
    protected onConnectedBluetoothDeviceIds(bluetoothIds: string[]): void;
    disconnectFromDevice(bluetoothId: string): void;
    protected requestDisconnectionFromDevice(bluetoothId: string): Device;
    protected sendDisconnectFromDeviceMessage(bluetoothId: string): void;
    protected sendDeviceMessage(bluetoothId: string, ...messages: ClientDeviceMessage[]): void;
    protected sendRequiredDeviceInformationMessage(bluetoothId: string): void;
}
export default BaseClient;
