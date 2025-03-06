import EventDispatcher, { BoundEventListeners, Event, EventListenerMap, EventMap } from "../utils/EventDispatcher.ts";
import Device, { DeviceEventType, DeviceEventMessages } from "../Device.ts";
import { Side } from "../InformationManager.ts";
import { VibrationConfiguration } from "../vibration/VibrationManager.ts";
import { SensorConfiguration } from "../sensor/SensorConfigurationManager.ts";
import { DevicePairSensorDataEventMessages } from "./DevicePairSensorDataManager.ts";
import { AddPrefixToInterfaceKeys, ExtendInterfaceValues } from "../utils/TypeScriptUtils.ts";
interface BaseDevicePairDeviceEventMessage {
    device: Device;
    side: Side;
}
type DevicePairDeviceEventMessages = ExtendInterfaceValues<AddPrefixToInterfaceKeys<DeviceEventMessages, "device">, BaseDevicePairDeviceEventMessage>;
export declare const DevicePairConnectionEventTypes: readonly ["isConnected"];
export type DevicePairConnectionEventType = (typeof DevicePairConnectionEventTypes)[number];
export interface DevicePairConnectionEventMessages {
    isConnected: {
        isConnected: boolean;
    };
}
export declare const DevicePairEventTypes: readonly ["isConnected", "pressure", "sensorData", ...("deviceOrientation" | "deviceConnected" | "deviceIsConnected" | "devicePressure" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "deviceBarometer" | "deviceSensorData" | "deviceGetSensorConfiguration" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceManufacturerName" | "deviceModelNumber" | "deviceSoftwareRevision" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceDeviceInformation" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceNotConnected" | "deviceConnecting" | "deviceDisconnecting" | "deviceConnectionStatus" | "deviceSmp" | "deviceBatteryLevel" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus" | "deviceConnectionMessage")[]];
export type DevicePairEventType = (typeof DevicePairEventTypes)[number];
export type DevicePairEventMessages = DevicePairConnectionEventMessages & DevicePairSensorDataEventMessages & DevicePairDeviceEventMessages;
export type DevicePairEventDispatcher = EventDispatcher<DevicePair, DevicePairEventType, DevicePairEventMessages>;
export type DevicePairEventMap = EventMap<DevicePair, DeviceEventType, DevicePairEventMessages>;
export type DevicePairEventListenerMap = EventListenerMap<DevicePair, DeviceEventType, DevicePairEventMessages>;
export type DevicePairEvent = Event<DevicePair, DeviceEventType, DevicePairEventMessages>;
export type BoundDevicePairEventListeners = BoundEventListeners<DevicePair, DeviceEventType, DevicePairEventMessages>;
declare class DevicePair {
    #private;
    constructor();
    get sides(): readonly ["left", "right"];
    get addEventListener(): <T extends "pressure" | "deviceOrientation" | "sensorData" | "isConnected" | "deviceConnected" | "deviceIsConnected" | "devicePressure" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "deviceBarometer" | "deviceSensorData" | "deviceGetSensorConfiguration" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceManufacturerName" | "deviceModelNumber" | "deviceSoftwareRevision" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceDeviceInformation" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceNotConnected" | "deviceConnecting" | "deviceDisconnecting" | "deviceConnectionStatus" | "deviceSmp" | "deviceBatteryLevel" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus" | "deviceConnectionMessage">(type: T, listener: (event: {
        type: T;
        target: DevicePair;
        message: DevicePairEventMessages[T];
    }) => void, options?: {
        once?: boolean;
    }) => void;
    get removeEventListener(): <T extends "pressure" | "deviceOrientation" | "sensorData" | "isConnected" | "deviceConnected" | "deviceIsConnected" | "devicePressure" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "deviceBarometer" | "deviceSensorData" | "deviceGetSensorConfiguration" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceManufacturerName" | "deviceModelNumber" | "deviceSoftwareRevision" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceDeviceInformation" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceNotConnected" | "deviceConnecting" | "deviceDisconnecting" | "deviceConnectionStatus" | "deviceSmp" | "deviceBatteryLevel" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus" | "deviceConnectionMessage">(type: T, listener: (event: {
        type: T;
        target: DevicePair;
        message: DevicePairEventMessages[T];
    }) => void) => void;
    get waitForEvent(): <T extends "pressure" | "deviceOrientation" | "sensorData" | "isConnected" | "deviceConnected" | "deviceIsConnected" | "devicePressure" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "deviceBarometer" | "deviceSensorData" | "deviceGetSensorConfiguration" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceManufacturerName" | "deviceModelNumber" | "deviceSoftwareRevision" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceDeviceInformation" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceNotConnected" | "deviceConnecting" | "deviceDisconnecting" | "deviceConnectionStatus" | "deviceSmp" | "deviceBatteryLevel" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus" | "deviceConnectionMessage">(type: T) => Promise<{
        type: T;
        target: DevicePair;
        message: DevicePairEventMessages[T];
    }>;
    get removeEventListeners(): <T extends "pressure" | "deviceOrientation" | "sensorData" | "isConnected" | "deviceConnected" | "deviceIsConnected" | "devicePressure" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "deviceBarometer" | "deviceSensorData" | "deviceGetSensorConfiguration" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceManufacturerName" | "deviceModelNumber" | "deviceSoftwareRevision" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceDeviceInformation" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceNotConnected" | "deviceConnecting" | "deviceDisconnecting" | "deviceConnectionStatus" | "deviceSmp" | "deviceBatteryLevel" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus" | "deviceConnectionMessage">(type: T) => void;
    get removeAllEventListeners(): () => void;
    get left(): Device | undefined;
    get right(): Device | undefined;
    get isConnected(): boolean;
    get isPartiallyConnected(): boolean;
    get isHalfConnected(): boolean;
    assignInsole(device: Device): Device | undefined;
    setSensorConfiguration(sensorConfiguration: SensorConfiguration): Promise<void>;
    resetPressureRange(): void;
    triggerVibration(vibrationConfigurations: VibrationConfiguration[], sendImmediately?: boolean): Promise<PromiseSettledResult<void | undefined>[]>;
    static get shared(): DevicePair;
}
export default DevicePair;
