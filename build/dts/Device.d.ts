import EventDispatcher, { BoundEventListeners, Event, SpecificEvent } from "./utils/EventDispatcher.ts";
import BaseConnectionManager, { ConnectionStatus, ConnectionMessageType } from "./connection/BaseConnectionManager.ts";
import { SensorConfiguration, SensorConfigurationEventMessages } from "./sensor/SensorConfigurationManager.ts";
import { SensorDataEventMessages, SensorType } from "./sensor/SensorDataManager.ts";
import { VibrationConfiguration } from "./vibration/VibrationManager.ts";
import { FileTransferEventMessages, FileType } from "./FileTransferManager.ts";
import { TfliteEventMessages } from "./TfliteManager.ts";
import { FirmwareEventMessages } from "./FirmwareManager.ts";
import { DeviceInformationEventMessages } from "./DeviceInformationManager.ts";
import { DeviceType, InformationEventMessages } from "./InformationManager.ts";
import { FileLike } from "./utils/ArrayBufferUtils.ts";
export declare const ConnectionEventTypes: readonly ["not connected", "connecting", "connected", "disconnecting", "connectionStatus", "isConnected"];
export type ConnectionEventType = (typeof ConnectionEventTypes)[number];
export declare const DeviceEventTypes: readonly ["not connected", "connecting", "connected", "disconnecting", "connectionStatus", "isConnected", "manufacturerName", "modelNumber", "softwareRevision", "hardwareRevision", "firmwareRevision", "pnpId", "serialNumber", "batteryLevel", "smp", "rx", "tx", "isCharging", "getBatteryCurrent", "getMtu", "getId", "getName", "setName", "getType", "setType", "getCurrentTime", "setCurrentTime", "getSensorConfiguration", "setSensorConfiguration", "getPressurePositions", "getSensorScalars", "sensorData", "triggerVibration", "getTfliteName", "setTfliteName", "getTfliteTask", "setTfliteTask", "getTfliteSampleRate", "setTfliteSampleRate", "getTfliteSensorTypes", "setTfliteSensorTypes", "tfliteIsReady", "getTfliteCaptureDelay", "setTfliteCaptureDelay", "getTfliteThreshold", "setTfliteThreshold", "getTfliteInferencingEnabled", "setTfliteInferencingEnabled", "tfliteInference", "maxFileLength", "getFileType", "setFileType", "getFileLength", "setFileLength", "getFileChecksum", "setFileChecksum", "setFileTransferCommand", "fileTransferStatus", "getFileBlock", "setFileBlock", "connectionMessage", "isCharging", "getBatteryCurrent", "getMtu", "getId", "getName", "setName", "getType", "setType", "getCurrentTime", "setCurrentTime", "manufacturerName", "modelNumber", "softwareRevision", "hardwareRevision", "firmwareRevision", "pnpId", "serialNumber", "deviceInformation", "getPressurePositions", "getSensorScalars", "sensorData", "acceleration", "gravity", "linearAcceleration", "gyroscope", "magnetometer", "gameRotation", "rotation", "orientation", "activity", "stepCounter", "stepDetector", "deviceOrientation", "pressure", "barometer", "maxFileLength", "getFileType", "setFileType", "getFileLength", "setFileLength", "getFileChecksum", "setFileChecksum", "setFileTransferCommand", "fileTransferStatus", "getFileBlock", "setFileBlock", "fileTransferProgress", "fileTransferComplete", "fileReceived", "getTfliteName", "setTfliteName", "getTfliteTask", "setTfliteTask", "getTfliteSampleRate", "setTfliteSampleRate", "getTfliteSensorTypes", "setTfliteSensorTypes", "tfliteIsReady", "getTfliteCaptureDelay", "setTfliteCaptureDelay", "getTfliteThreshold", "setTfliteThreshold", "getTfliteInferencingEnabled", "setTfliteInferencingEnabled", "tfliteInference", "smp", "firmwareImages", "firmwareUploadProgress", "firmwareStatus", "firmwareUploadComplete"];
export type DeviceEventType = (typeof DeviceEventTypes)[number];
export interface DeviceEventMessages extends DeviceInformationEventMessages, InformationEventMessages, SensorDataEventMessages, SensorConfigurationEventMessages, TfliteEventMessages, FileTransferEventMessages, FirmwareEventMessages {
    connectionStatus: {
        connectionStatus: ConnectionStatus;
    };
    isConnected: {
        isConnected: boolean;
    };
    batteryLevel: {
        batteryLevel: number;
    };
    connectionMessage: {
        messageType: ConnectionMessageType;
        dataView: DataView;
    };
}
export declare const StaticDeviceEventTypes: readonly ["deviceConnected", "deviceDisconnected", "deviceIsConnected", "availableDevices", "connectedDevices"];
export type StaticDeviceEventType = (typeof StaticDeviceEventTypes)[number];
interface StaticDeviceEventMessage {
    device: Device;
}
export interface StaticDeviceEventMessages {
    deviceConnected: StaticDeviceEventMessage;
    deviceDisconnected: StaticDeviceEventMessage;
    deviceIsConnected: StaticDeviceEventMessage;
    availableDevices: {
        availableDevices: Device[];
    };
    connectedDevices: {
        connectedDevices: Device[];
    };
}
export type SendMessageCallback<MessageType extends string> = (messages?: {
    type: MessageType;
    data?: ArrayBuffer;
}[], sendImmediately?: boolean) => Promise<void>;
export type SendSmpMessageCallback = (data: ArrayBuffer) => Promise<void>;
export interface LocalStorageDeviceInformation {
    type: DeviceType;
    bluetoothId: string;
}
export interface LocalStorageConfiguration {
    devices: LocalStorageDeviceInformation[];
}
export type DeviceEventDispatcher = EventDispatcher<Device, DeviceEventType, DeviceEventMessages>;
export type SpecificDeviceEvent<EventType extends DeviceEventType> = SpecificEvent<Device, DeviceEventType, DeviceEventMessages, EventType>;
export type DeviceEvent = Event<Device, DeviceEventType, DeviceEventMessages>;
export type BoundDeviceEventListeners = BoundEventListeners<Device, DeviceEventType, DeviceEventMessages>;
export type StaticDeviceEventDispatcher = EventDispatcher<typeof Device, StaticDeviceEventType, StaticDeviceEventMessages>;
export type SpecificStaticDeviceEvent<EventType extends StaticDeviceEventType> = SpecificEvent<typeof Device, StaticDeviceEventType, StaticDeviceEventMessages, EventType>;
export type StaticDeviceEvent = Event<typeof Device, StaticDeviceEventType, StaticDeviceEventMessages>;
export type BoundStaticDeviceEventListeners = BoundEventListeners<typeof Device, StaticDeviceEventType, StaticDeviceEventMessages>;
declare class Device {
    #private;
    get bluetoothId(): string | undefined;
    constructor();
    get addEventListener(): <T extends "maxFileLength" | "getFileType" | "setFileType" | "getFileLength" | "setFileLength" | "getFileChecksum" | "setFileChecksum" | "setFileTransferCommand" | "fileTransferStatus" | "getFileBlock" | "setFileBlock" | "fileTransferProgress" | "fileTransferComplete" | "fileReceived" | "pressure" | "acceleration" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation" | "orientation" | "activity" | "stepCounter" | "stepDetector" | "deviceOrientation" | "barometer" | "getPressurePositions" | "getSensorScalars" | "sensorData" | "getSensorConfiguration" | "setSensorConfiguration" | "getTfliteName" | "setTfliteName" | "getTfliteTask" | "setTfliteTask" | "getTfliteSampleRate" | "setTfliteSampleRate" | "getTfliteSensorTypes" | "setTfliteSensorTypes" | "tfliteIsReady" | "getTfliteCaptureDelay" | "setTfliteCaptureDelay" | "getTfliteThreshold" | "setTfliteThreshold" | "getTfliteInferencingEnabled" | "setTfliteInferencingEnabled" | "tfliteInference" | "manufacturerName" | "modelNumber" | "softwareRevision" | "hardwareRevision" | "firmwareRevision" | "pnpId" | "serialNumber" | "deviceInformation" | "isCharging" | "getBatteryCurrent" | "getMtu" | "getId" | "getName" | "setName" | "getType" | "setType" | "getCurrentTime" | "setCurrentTime" | "triggerVibration" | "not connected" | "connecting" | "connected" | "disconnecting" | "batteryLevel" | "smp" | "rx" | "tx" | "firmwareImages" | "firmwareUploadProgress" | "firmwareStatus" | "firmwareUploadComplete" | "connectionStatus" | "isConnected" | "connectionMessage">(type: T, listener: (event: {
        type: T;
        target: Device;
        message: DeviceEventMessages[T];
    }) => void, options?: {
        once?: boolean;
    }) => void;
    get removeEventListener(): <T extends "maxFileLength" | "getFileType" | "setFileType" | "getFileLength" | "setFileLength" | "getFileChecksum" | "setFileChecksum" | "setFileTransferCommand" | "fileTransferStatus" | "getFileBlock" | "setFileBlock" | "fileTransferProgress" | "fileTransferComplete" | "fileReceived" | "pressure" | "acceleration" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation" | "orientation" | "activity" | "stepCounter" | "stepDetector" | "deviceOrientation" | "barometer" | "getPressurePositions" | "getSensorScalars" | "sensorData" | "getSensorConfiguration" | "setSensorConfiguration" | "getTfliteName" | "setTfliteName" | "getTfliteTask" | "setTfliteTask" | "getTfliteSampleRate" | "setTfliteSampleRate" | "getTfliteSensorTypes" | "setTfliteSensorTypes" | "tfliteIsReady" | "getTfliteCaptureDelay" | "setTfliteCaptureDelay" | "getTfliteThreshold" | "setTfliteThreshold" | "getTfliteInferencingEnabled" | "setTfliteInferencingEnabled" | "tfliteInference" | "manufacturerName" | "modelNumber" | "softwareRevision" | "hardwareRevision" | "firmwareRevision" | "pnpId" | "serialNumber" | "deviceInformation" | "isCharging" | "getBatteryCurrent" | "getMtu" | "getId" | "getName" | "setName" | "getType" | "setType" | "getCurrentTime" | "setCurrentTime" | "triggerVibration" | "not connected" | "connecting" | "connected" | "disconnecting" | "batteryLevel" | "smp" | "rx" | "tx" | "firmwareImages" | "firmwareUploadProgress" | "firmwareStatus" | "firmwareUploadComplete" | "connectionStatus" | "isConnected" | "connectionMessage">(type: T, listener: (event: {
        type: T;
        target: Device;
        message: DeviceEventMessages[T];
    }) => void) => void;
    get waitForEvent(): <T extends "maxFileLength" | "getFileType" | "setFileType" | "getFileLength" | "setFileLength" | "getFileChecksum" | "setFileChecksum" | "setFileTransferCommand" | "fileTransferStatus" | "getFileBlock" | "setFileBlock" | "fileTransferProgress" | "fileTransferComplete" | "fileReceived" | "pressure" | "acceleration" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation" | "orientation" | "activity" | "stepCounter" | "stepDetector" | "deviceOrientation" | "barometer" | "getPressurePositions" | "getSensorScalars" | "sensorData" | "getSensorConfiguration" | "setSensorConfiguration" | "getTfliteName" | "setTfliteName" | "getTfliteTask" | "setTfliteTask" | "getTfliteSampleRate" | "setTfliteSampleRate" | "getTfliteSensorTypes" | "setTfliteSensorTypes" | "tfliteIsReady" | "getTfliteCaptureDelay" | "setTfliteCaptureDelay" | "getTfliteThreshold" | "setTfliteThreshold" | "getTfliteInferencingEnabled" | "setTfliteInferencingEnabled" | "tfliteInference" | "manufacturerName" | "modelNumber" | "softwareRevision" | "hardwareRevision" | "firmwareRevision" | "pnpId" | "serialNumber" | "deviceInformation" | "isCharging" | "getBatteryCurrent" | "getMtu" | "getId" | "getName" | "setName" | "getType" | "setType" | "getCurrentTime" | "setCurrentTime" | "triggerVibration" | "not connected" | "connecting" | "connected" | "disconnecting" | "batteryLevel" | "smp" | "rx" | "tx" | "firmwareImages" | "firmwareUploadProgress" | "firmwareStatus" | "firmwareUploadComplete" | "connectionStatus" | "isConnected" | "connectionMessage">(type: T) => Promise<{
        type: T;
        target: Device;
        message: DeviceEventMessages[T];
    }>;
    get connectionManager(): BaseConnectionManager | undefined;
    set connectionManager(newConnectionManager: BaseConnectionManager | undefined);
    private sendTxMessages;
    connect(): Promise<void>;
    get isConnected(): boolean;
    get canReconnect(): boolean | undefined;
    reconnect(): Promise<void | undefined>;
    static get ReconnectOnDisconnection(): boolean;
    static set ReconnectOnDisconnection(newReconnectOnDisconnection: boolean);
    get reconnectOnDisconnection(): boolean;
    set reconnectOnDisconnection(newReconnectOnDisconnection: boolean);
    get connectionType(): "webBluetooth" | "noble" | "webSocketClient" | undefined;
    disconnect(): Promise<void>;
    toggleConnection(): void;
    get connectionStatus(): ConnectionStatus;
    get isConnectionBusy(): boolean;
    latestConnectionMessage: Map<ConnectionMessageType, DataView>;
    get deviceInformation(): import("./DeviceInformationManager.ts").DeviceInformation;
    get batteryLevel(): number;
    get id(): string;
    get isCharging(): boolean;
    get batteryCurrent(): number;
    getBatteryCurrent(): Promise<void>;
    get name(): string;
    get setName(): (newName: string) => Promise<void>;
    get type(): "leftInsole" | "rightInsole";
    get setType(): (newType: DeviceType) => Promise<void>;
    get isInsole(): boolean;
    get insoleSide(): "left" | "right";
    get mtu(): number;
    get sensorTypes(): SensorType[];
    get continuousSensorTypes(): ("pressure" | "acceleration" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation" | "barometer")[];
    get sensorConfiguration(): SensorConfiguration;
    setSensorConfiguration(newSensorConfiguration: SensorConfiguration, clearRest?: boolean): Promise<void>;
    clearSensorConfiguration(): Promise<void>;
    static get ClearSensorConfigurationOnLeave(): boolean;
    static set ClearSensorConfigurationOnLeave(newClearSensorConfigurationOnLeave: boolean);
    get clearSensorConfigurationOnLeave(): boolean;
    set clearSensorConfigurationOnLeave(newClearSensorConfigurationOnLeave: boolean);
    static get DefaultNumberOfPressureSensors(): number;
    get numberOfPressureSensors(): number;
    resetPressureRange(): void;
    triggerVibration(vibrationConfigurations: VibrationConfiguration[], sendImmediately?: boolean): Promise<void>;
    get maxFileLength(): number;
    sendFile(fileType: FileType, file: FileLike): Promise<void>;
    receiveFile(fileType: FileType): Promise<void>;
    get fileTransferStatus(): "idle" | "sending" | "receiving";
    cancelFileTransfer(): void;
    get tfliteName(): string;
    get setTfliteName(): (newName: string, sendImmediately?: boolean) => Promise<void>;
    static get TfliteTasks(): readonly ["classification", "regression"];
    get tfliteTask(): "classification" | "regression";
    get setTfliteTask(): (newTask: import("./TfliteManager.ts").TfliteTask, sendImmediately?: boolean) => Promise<void>;
    get tfliteSampleRate(): number;
    get setTfliteSampleRate(): (newSampleRate: number, sendImmediately?: boolean) => Promise<void>;
    get tfliteSensorTypes(): ("pressure" | "acceleration" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation" | "orientation" | "activity" | "stepCounter" | "stepDetector" | "deviceOrientation" | "barometer")[];
    get allowedTfliteSensorTypes(): ("pressure" | "acceleration" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation" | "orientation" | "activity" | "stepCounter" | "stepDetector" | "deviceOrientation" | "barometer")[];
    get setTfliteSensorTypes(): (newSensorTypes: SensorType[], sendImmediately?: boolean) => Promise<void>;
    get tfliteIsReady(): boolean;
    get tfliteInferencingEnabled(): boolean;
    get setTfliteInferencingEnabled(): (newInferencingEnabled: boolean, sendImmediately?: boolean) => Promise<void>;
    enableTfliteInferencing(): Promise<void>;
    disableTfliteInferencing(): Promise<void>;
    get toggleTfliteInferencing(): () => Promise<void>;
    get tfliteCaptureDelay(): number;
    get setTfliteCaptureDelay(): (newCaptureDelay: number, sendImmediately: boolean) => Promise<void>;
    get tfliteThreshold(): number;
    get setTfliteThreshold(): (newThreshold: number, sendImmediately: boolean) => Promise<void>;
    private sendSmpMessage;
    get uploadFirmware(): (file: FileLike) => Promise<void>;
    reset(): Promise<void>;
    get firmwareStatus(): "idle" | "uploading" | "uploaded" | "pending" | "testing" | "erasing";
    get getFirmwareImages(): () => Promise<void>;
    get firmwareImages(): import("./FirmwareManager.ts").FirmwareImage[];
    get eraseFirmwareImage(): () => Promise<void>;
    get confirmFirmwareImage(): (imageIndex?: number) => Promise<void>;
    get testFirmwareImage(): (imageIndex?: number) => Promise<void>;
    static get ConnectedDevices(): Device[];
    static get UseLocalStorage(): boolean;
    static set UseLocalStorage(newUseLocalStorage: boolean);
    static get CanUseLocalStorage(): false | Storage;
    static get AvailableDevices(): Device[];
    static get CanGetDevices(): boolean;
    /**
     * retrieves devices already connected via web bluetooth in other tabs/windows
     *
     * _only available on web-bluetooth enabled browsers_
     */
    static GetDevices(): Promise<Device[] | undefined>;
    static get AddEventListener(): <T extends "deviceConnected" | "deviceDisconnected" | "deviceIsConnected" | "availableDevices" | "connectedDevices">(type: T, listener: (event: {
        type: T;
        target: typeof Device;
        message: StaticDeviceEventMessages[T];
    }) => void, options?: {
        once?: boolean;
    }) => void;
    static get RemoveEventListener(): <T extends "deviceConnected" | "deviceDisconnected" | "deviceIsConnected" | "availableDevices" | "connectedDevices">(type: T, listener: (event: {
        type: T;
        target: typeof Device;
        message: StaticDeviceEventMessages[T];
    }) => void) => void;
    static Connect(): Promise<Device>;
}
export default Device;
