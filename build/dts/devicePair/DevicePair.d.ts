import EventDispatcher, { BoundEventListeners, Event, SpecificEvent } from "../utils/EventDispatcher";
import Device, { DeviceEventType, DeviceEventMessages } from "../Device";
import { InsoleSide } from "../InformationManager";
import { VibrationConfiguration } from "../vibration/VibrationManager";
import { SensorConfiguration } from "../sensor/SensorConfigurationManager";
import { DevicePairSensorDataEventMessages } from "./DevicePairSensorDataManager";
import { AddPrefixToInterfaceKeys, ExtendInterfaceValues } from "../utils/TypeScriptUtils";
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
export declare const DevicePairEventTypes: readonly ["isConnected", "pressure", "sensorData", ...("deviceOrientation" | "deviceIsConnected" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "devicePressure" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "deviceBarometer" | "deviceSensorData" | "deviceGetSensorConfiguration" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceManufacturerName" | "deviceModelNumber" | "deviceSoftwareRevision" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceDeviceInformation" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceBatteryLevel" | "deviceSmp" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus" | "deviceConnectionStatus" | "deviceConnectionMessage")[]];
export type DevicePairEventType = (typeof DevicePairEventTypes)[number];
export type DevicePairEventMessages = DevicePairConnectionEventMessages & DevicePairSensorDataEventMessages & DevicePairDeviceEventMessages;
export type DevicePairEventDispatcher = EventDispatcher<DevicePair, DevicePairEventType, DevicePairEventMessages>;
export type SpecificDevicePairEvent<Type extends DevicePairEventType> = SpecificEvent<DevicePair, DevicePairEventType, DevicePairEventMessages, Type>;
export type DevicePairEvent = Event<DevicePair, DeviceEventType, DevicePairEventMessages>;
export type BoundDevicePairEventListeners = BoundEventListeners<DevicePair, DeviceEventType, DevicePairEventMessages>;
declare class DevicePair {
    #private;
    constructor();
    get addEventListener(): <T extends "pressure" | "deviceOrientation" | "sensorData" | "isConnected" | "deviceIsConnected" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "devicePressure" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "deviceBarometer" | "deviceSensorData" | "deviceGetSensorConfiguration" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceManufacturerName" | "deviceModelNumber" | "deviceSoftwareRevision" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceDeviceInformation" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceBatteryLevel" | "deviceSmp" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus" | "deviceConnectionStatus" | "deviceConnectionMessage">(type: T, listener: (event: {
        type: T;
        target: DevicePair;
        message: DevicePairEventMessages[T];
    }) => void, options?: {
        once?: boolean;
    }) => void;
    get removeEventListener(): <T extends "pressure" | "deviceOrientation" | "sensorData" | "isConnected" | "deviceIsConnected" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "devicePressure" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "deviceBarometer" | "deviceSensorData" | "deviceGetSensorConfiguration" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceManufacturerName" | "deviceModelNumber" | "deviceSoftwareRevision" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceDeviceInformation" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceBatteryLevel" | "deviceSmp" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus" | "deviceConnectionStatus" | "deviceConnectionMessage">(type: T, listener: (event: {
        type: T;
        target: DevicePair;
        message: DevicePairEventMessages[T];
    }) => void) => void;
    get waitForEvent(): <T extends "pressure" | "deviceOrientation" | "sensorData" | "isConnected" | "deviceIsConnected" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "devicePressure" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "deviceBarometer" | "deviceSensorData" | "deviceGetSensorConfiguration" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceManufacturerName" | "deviceModelNumber" | "deviceSoftwareRevision" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceDeviceInformation" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceBatteryLevel" | "deviceSmp" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus" | "deviceConnectionStatus" | "deviceConnectionMessage">(type: T) => Promise<{
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
