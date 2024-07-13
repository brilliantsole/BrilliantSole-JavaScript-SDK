import EventDispatcher, { BoundEventListeners, Event, EventMap } from "../utils/EventDispatcher.ts";
import Device, { DeviceEventType, DeviceEventMessages } from "../Device.ts";
import { InsoleSide } from "../InformationManager.ts";
import { VibrationConfiguration } from "../vibration/VibrationManager.ts";
import { SensorConfiguration } from "../sensor/SensorConfigurationManager.ts";
import { DevicePairSensorDataEventMessages } from "./DevicePairSensorDataManager.ts";
import { AddPrefixToInterfaceKeys, ExtendInterfaceValues } from "../utils/TypeScriptUtils.ts";
interface BaseDevicePairDeviceEventMessage {
    device: Device;
    side: InsoleSide;
}
type DevicePairDeviceEventMessages = ExtendInterfaceValues<AddPrefixToInterfaceKeys<DeviceEventMessages, "device">, BaseDevicePairDeviceEventMessage>;
export declare const DevicePairConnectionEventTypes: readonly ["isConnected"];
export type DevicePairConnectionEventType = (typeof DevicePairConnectionEventTypes)[number];
export interface DevicePairConnectionEventMessages {
    isConnected: {
        isConnected: boolean;
    };
}
export declare const DevicePairEventTypes: readonly ["isConnected", "pressure", "sensorData", ...("deviceOrientation" | "deviceIsConnected" | "deviceGetSensorConfiguration" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "devicePressure" | "deviceBarometer" | "deviceConnectionStatus" | "deviceManufacturerName" | "deviceModelNumber" | "deviceSoftwareRevision" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceBatteryLevel" | "deviceSmp" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceSensorData" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceConnectionMessage" | "deviceDeviceInformation" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus")[]];
export type DevicePairEventType = (typeof DevicePairEventTypes)[number];
export type DevicePairEventMessages = DevicePairConnectionEventMessages & DevicePairSensorDataEventMessages & DevicePairDeviceEventMessages;
export type DevicePairEventDispatcher = EventDispatcher<DevicePair, DevicePairEventType, DevicePairEventMessages>;
export type DevicePairEventMap = EventMap<DevicePair, DeviceEventType, DevicePairEventMessages>;
export type DevicePairEvent = Event<DevicePair, DeviceEventType, DevicePairEventMessages>;
export type BoundDevicePairEventListeners = BoundEventListeners<DevicePair, DeviceEventType, DevicePairEventMessages>;
declare class DevicePair {
    #private;
    constructor();
    get addEventListener(): <T extends "deviceOrientation" | "pressure" | "isConnected" | "sensorData" | "deviceIsConnected" | "deviceGetSensorConfiguration" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "devicePressure" | "deviceBarometer" | "deviceConnectionStatus" | "deviceManufacturerName" | "deviceModelNumber" | "deviceSoftwareRevision" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceBatteryLevel" | "deviceSmp" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceSensorData" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceConnectionMessage" | "deviceDeviceInformation" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus">(type: T, listener: (event: {
        type: T;
        target: DevicePair;
        message: DevicePairEventMessages[T];
    }) => void, options?: {
        once?: boolean;
    }) => void;
    get removeEventListener(): <T extends "deviceOrientation" | "pressure" | "isConnected" | "sensorData" | "deviceIsConnected" | "deviceGetSensorConfiguration" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "devicePressure" | "deviceBarometer" | "deviceConnectionStatus" | "deviceManufacturerName" | "deviceModelNumber" | "deviceSoftwareRevision" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceBatteryLevel" | "deviceSmp" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceSensorData" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceConnectionMessage" | "deviceDeviceInformation" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus">(type: T, listener: (event: {
        type: T;
        target: DevicePair;
        message: DevicePairEventMessages[T];
    }) => void) => void;
    get waitForEvent(): <T extends "deviceOrientation" | "pressure" | "isConnected" | "sensorData" | "deviceIsConnected" | "deviceGetSensorConfiguration" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "devicePressure" | "deviceBarometer" | "deviceConnectionStatus" | "deviceManufacturerName" | "deviceModelNumber" | "deviceSoftwareRevision" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceBatteryLevel" | "deviceSmp" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceSensorData" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceConnectionMessage" | "deviceDeviceInformation" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus">(type: T) => Promise<{
        type: T;
        target: DevicePair;
        message: DevicePairEventMessages[T];
    }>;
    get left(): Device | undefined;
    get right(): Device | undefined;
    get isConnected(): boolean;
    get isPartiallyConnected(): boolean;
    get isHalfConnected(): boolean;
    assignInsole(device: Device): Device | undefined;
    setSensorConfiguration(sensorConfiguration: SensorConfiguration): void;
    resetPressureRange(): void;
    triggerVibration(vibrationConfigurations: VibrationConfiguration[], sendImmediately?: boolean): Promise<PromiseSettledResult<void | undefined>[]>;
    static get shared(): DevicePair;
}
export default DevicePair;
