import { ServerMessage, MessageLike, ClientDeviceMessage } from "./ServerUtils";
import Timer from "../utils/Timer";
import EventDispatcher, { BoundEventListeners, Event, SpecificEvent } from "../utils/EventDispatcher";
import Device from "../Device";
import { DiscoveredDevice, ScannerEventMessages } from "../scanner/BaseScanner";
export declare const ClientConnectionStatuses: readonly ["not connected", "connecting", "connected", "disconnecting"];
export type ClientConnectionStatus = (typeof ClientConnectionStatuses)[number];
export declare const ClientEventTypes: readonly ["not connected", "connecting", "connected", "disconnecting", "connectionStatus", "isConnected", "isScanningAvailable", "isScanning", "discoveredDevice", "expiredDiscoveredDevice"];
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
export type SpecificClientEvent<EventType extends ClientEventType> = SpecificEvent<BaseClient, ClientEventType, ClientEventMessages, EventType>;
export type ClientEvent = Event<BaseClient, ClientEventType, ClientEventMessages>;
export type BoundClientEventListeners = BoundEventListeners<BaseClient, ClientEventType, ClientEventMessages>;
export type ServerURL = string | URL;
type DevicesMap = {
    [deviceId: string]: Device;
};
type DiscoveredDevicesMap = {
    [deviceId: string]: DiscoveredDevice;
};
declare abstract class BaseClient {
    #private;
    get devices(): Readonly<DevicesMap>;
    get addEventListener(): <T extends "not connected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isConnected" | "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice">(type: T, listener: (event: {
        type: T;
        target: BaseClient;
        message: ClientEventMessages[T];
    }) => void, options?: {
        once: boolean;
    }) => void;
    protected get dispatchEvent(): <T extends "not connected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isConnected" | "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice">(type: T, message: ClientEventMessages[T]) => void;
    get removeEventListener(): <T extends "not connected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isConnected" | "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice">(type: T, listener: (event: {
        type: T;
        target: BaseClient;
        message: ClientEventMessages[T];
    }) => void) => void;
    get waitForEvent(): <T extends "not connected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isConnected" | "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice">(type: T) => Promise<{
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
    static get ReconnectOnDisconnection(): boolean;
    static set ReconnectOnDisconnection(newReconnectOnDisconnection: boolean);
    get reconnectOnDisconnection(): boolean;
    set reconnectOnDisconnection(newReconnectOnDisconnection: boolean);
    protected sendServerMessage(...messages: ServerMessage[]): void;
    abstract sendMessage(message: MessageLike): void;
    protected get _connectionStatus(): "not connected" | "connecting" | "connected" | "disconnecting";
    protected set _connectionStatus(newConnectionStatus: "not connected" | "connecting" | "connected" | "disconnecting");
    get connectionStatus(): "not connected" | "connecting" | "connected" | "disconnecting";
    protected parseMessage(dataView: DataView): void;
    protected pingTimer: Timer;
    get isScanningAvailable(): boolean;
    protected requestIsScanningAvailable(): void;
    get isScanning(): boolean;
    startScan(): void;
    stopScan(): void;
    toggleScan(): void;
    get discoveredDevices(): Readonly<DiscoveredDevicesMap>;
    protected onDiscoveredDevice(discoveredDevice: DiscoveredDevice): void;
    requestDiscoveredDevices(): void;
    connectToDevice(bluetoothId: string): Device;
    protected requestConnectionToDevice(bluetoothId: string): Device;
    protected sendConnectToDeviceMessage(bluetoothId: string): void;
    protected createConnectToDeviceMessage(bluetoothId: string): ArrayBuffer;
    abstract createDevice(bluetoothId: string): Device;
    protected onConnectedBluetoothDeviceIds(bluetoothIds: string[]): void;
    disconnectFromDevice(bluetoothId: string): void;
    protected requestDisconnectionFromDevice(bluetoothId: string): Device;
    protected sendDisconnectFromDeviceMessage(bluetoothId: string): void;
    protected sendDeviceMessage(bluetoothId: string, ...messages: ClientDeviceMessage[]): void;
    createDeviceMessage(bluetoothId: string, ...messages: ClientDeviceMessage[]): ArrayBuffer;
}
export default BaseClient;