import EventDispatcher, { BoundEventListeners, Event, EventMap } from "../utils/EventDispatcher.ts";
import { DeviceMessage } from "./ServerUtils.ts";
import Device from "../Device.ts";
import GuardManager from "../utils/GuardManager.ts";
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
    protected abstract sendToClient(client: ServerClient, message: ArrayBuffer): void;
    broadcastMessage(message: ArrayBuffer): void;
    clientToServerGuardManager: GuardManager<[client: ServerClient, messageType?: "isScanningAvailable" | "isScanning" | "startScan" | "stopScan" | "discoveredDevice" | "discoveredDevices" | "expiredDiscoveredDevice" | "connectToDevice" | "disconnectFromDevice" | "connectedDevices" | "deviceMessage" | "requiredDeviceInformation" | undefined, dataView?: DataView<ArrayBufferLike> | undefined]>;
    serverToClientGuardManager: GuardManager<[client: ServerClient, messageType?: "isScanningAvailable" | "isScanning" | "startScan" | "stopScan" | "discoveredDevice" | "discoveredDevices" | "expiredDiscoveredDevice" | "connectToDevice" | "disconnectFromDevice" | "connectedDevices" | "deviceMessage" | "requiredDeviceInformation" | undefined, dataView?: DataView<ArrayBufferLike> | undefined]>;
    clientToDeviceGuardManager: GuardManager<[client: ServerClient, device: Device, messageType?: "sensorData" | "batteryLevel" | "manufacturerName" | "modelNumber" | "softwareRevision" | "hardwareRevision" | "firmwareRevision" | "pnpId" | "serialNumber" | "isCharging" | "getBatteryCurrent" | "getMtu" | "getId" | "getName" | "getType" | "getCurrentTime" | "getSensorConfiguration" | "getTfliteName" | "getTfliteTask" | "getTfliteSampleRate" | "getTfliteSensorTypes" | "tfliteIsReady" | "getTfliteCaptureDelay" | "getTfliteThreshold" | "getTfliteInferencingEnabled" | "tfliteInference" | "getFileTypes" | "maxFileLength" | "getFileType" | "getFileLength" | "getFileChecksum" | "fileTransferStatus" | "getFileBlock" | "isWifiAvailable" | "getWifiSSID" | "getWifiPassword" | "isWifiConnected" | "ipAddress" | "cameraStatus" | "getCameraConfiguration" | "microphoneStatus" | "getMicrophoneConfiguration" | "microphoneData" | "isDisplayAvailable" | "displayStatus" | "displayInformation" | "getDisplayBrightness" | "displayReady" | "getSpriteSheetName" | "displayContextCommands" | "getLedInformation" | "smp" | "rx" | "tx" | "setName" | "setType" | "setCurrentTime" | "setSensorConfiguration" | "getPressurePositions" | "getSensorScalars" | "getVibrationLocations" | "triggerVibration" | "setFileType" | "setFileLength" | "setFileChecksum" | "setFileTransferCommand" | "setFileBlock" | "fileBytesTransferred" | "setTfliteName" | "setTfliteTask" | "setTfliteSampleRate" | "setTfliteSensorTypes" | "setTfliteCaptureDelay" | "setTfliteThreshold" | "setTfliteInferencingEnabled" | "setWifiSSID" | "setWifiPassword" | "getWifiConnectionEnabled" | "setWifiConnectionEnabled" | "isWifiSecure" | "cameraCommand" | "setCameraConfiguration" | "cameraData" | "microphoneCommand" | "setMicrophoneConfiguration" | "displayCommand" | "setDisplayBrightness" | "setSpriteSheetName" | "spriteSheetIndex" | "getSensorCounts" | "setLeds" | "clearLeds" | undefined, dataView?: DataView<ArrayBufferLike> | undefined]>;
    deviceToClientGuardManager: GuardManager<[client: ServerClient, device: Device, messageType?: "sensorData" | "batteryLevel" | "manufacturerName" | "modelNumber" | "softwareRevision" | "hardwareRevision" | "firmwareRevision" | "pnpId" | "serialNumber" | "isCharging" | "getBatteryCurrent" | "getMtu" | "getId" | "getName" | "getType" | "getCurrentTime" | "getSensorConfiguration" | "getTfliteName" | "getTfliteTask" | "getTfliteSampleRate" | "getTfliteSensorTypes" | "tfliteIsReady" | "getTfliteCaptureDelay" | "getTfliteThreshold" | "getTfliteInferencingEnabled" | "tfliteInference" | "getFileTypes" | "maxFileLength" | "getFileType" | "getFileLength" | "getFileChecksum" | "fileTransferStatus" | "getFileBlock" | "isWifiAvailable" | "getWifiSSID" | "getWifiPassword" | "isWifiConnected" | "ipAddress" | "cameraStatus" | "getCameraConfiguration" | "microphoneStatus" | "getMicrophoneConfiguration" | "microphoneData" | "isDisplayAvailable" | "displayStatus" | "displayInformation" | "getDisplayBrightness" | "displayReady" | "getSpriteSheetName" | "displayContextCommands" | "getLedInformation" | "smp" | "rx" | "tx" | "setName" | "setType" | "setCurrentTime" | "setSensorConfiguration" | "getPressurePositions" | "getSensorScalars" | "getVibrationLocations" | "triggerVibration" | "setFileType" | "setFileLength" | "setFileChecksum" | "setFileTransferCommand" | "setFileBlock" | "fileBytesTransferred" | "setTfliteName" | "setTfliteTask" | "setTfliteSampleRate" | "setTfliteSensorTypes" | "setTfliteCaptureDelay" | "setTfliteThreshold" | "setTfliteInferencingEnabled" | "setWifiSSID" | "setWifiPassword" | "getWifiConnectionEnabled" | "setWifiConnectionEnabled" | "isWifiSecure" | "cameraCommand" | "setCameraConfiguration" | "cameraData" | "microphoneCommand" | "setMicrophoneConfiguration" | "displayCommand" | "setDisplayBrightness" | "setSpriteSheetName" | "spriteSheetIndex" | "getSensorCounts" | "setLeds" | "clearLeds" | undefined, dataView?: DataView<ArrayBufferLike> | undefined]>;
    protected parseClientMessage(client: ServerClient, dataView: DataView<ArrayBuffer>): ArrayBuffer | undefined;
    protected parseClientDeviceMessage(client: ServerClient, device: Device, dataView: DataView<ArrayBuffer>): ArrayBuffer | undefined;
}
export default BaseServer;
