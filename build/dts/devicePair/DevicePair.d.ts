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
export declare const DevicePairEventTypes: readonly ["isConnected", "pressure", "sensorData", ...("deviceOrientation" | "deviceConnected" | "deviceIsConnected" | "devicePressure" | "deviceGetFileTypes" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "deviceTapDetector" | "deviceBarometer" | "deviceCameraStatus" | "deviceGetCameraConfiguration" | "deviceCameraImageProgress" | "deviceCameraImage" | "deviceSensorData" | "deviceGetSensorConfiguration" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceManufacturerName" | "deviceModelNumber" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "deviceSoftwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceDeviceInformation" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceIsWifiAvailable" | "deviceGetWifiSSID" | "deviceGetWifiPassword" | "deviceIsWifiConnected" | "deviceIpAddress" | "deviceNotConnected" | "deviceConnecting" | "deviceDisconnecting" | "deviceConnectionStatus" | "deviceSmp" | "deviceBatteryLevel" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus" | "deviceConnectionMessage" | "deviceGetEnableWifiConnection")[]];
export type DevicePairEventType = (typeof DevicePairEventTypes)[number];
export type DevicePairEventMessages = DevicePairConnectionEventMessages & DevicePairSensorDataEventMessages & DevicePairDeviceEventMessages;
export type DevicePairEventDispatcher = EventDispatcher<DevicePair, DevicePairEventType, DevicePairEventMessages>;
export type DevicePairEventMap = EventMap<DevicePair, DeviceEventType, DevicePairEventMessages>;
export type DevicePairEventListenerMap = EventListenerMap<DevicePair, DeviceEventType, DevicePairEventMessages>;
export type DevicePairEvent = Event<DevicePair, DeviceEventType, DevicePairEventMessages>;
export type BoundDevicePairEventListeners = BoundEventListeners<DevicePair, DeviceEventType, DevicePairEventMessages>;
export declare const DevicePairTypes: readonly ["insoles", "gloves"];
export type DevicePairType = (typeof DevicePairTypes)[number];
declare class DevicePair {
    #private;
    constructor(type: DevicePairType);
    get sides(): readonly ["left", "right"];
    get type(): "insoles" | "gloves";
    get addEventListener(): <T extends "pressure" | "deviceOrientation" | "sensorData" | "isConnected" | "deviceConnected" | "deviceIsConnected" | "devicePressure" | "deviceGetFileTypes" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "deviceTapDetector" | "deviceBarometer" | "deviceCameraStatus" | "deviceGetCameraConfiguration" | "deviceCameraImageProgress" | "deviceCameraImage" | "deviceSensorData" | "deviceGetSensorConfiguration" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceManufacturerName" | "deviceModelNumber" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "deviceSoftwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceDeviceInformation" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceIsWifiAvailable" | "deviceGetWifiSSID" | "deviceGetWifiPassword" | "deviceIsWifiConnected" | "deviceIpAddress" | "deviceNotConnected" | "deviceConnecting" | "deviceDisconnecting" | "deviceConnectionStatus" | "deviceSmp" | "deviceBatteryLevel" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus" | "deviceConnectionMessage" | "deviceGetEnableWifiConnection">(type: T, listener: (event: {
        type: T;
        target: DevicePair;
        message: DevicePairEventMessages[T];
    }) => void, options?: {
        once?: boolean;
    }) => void;
    get removeEventListener(): <T extends "pressure" | "deviceOrientation" | "sensorData" | "isConnected" | "deviceConnected" | "deviceIsConnected" | "devicePressure" | "deviceGetFileTypes" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "deviceTapDetector" | "deviceBarometer" | "deviceCameraStatus" | "deviceGetCameraConfiguration" | "deviceCameraImageProgress" | "deviceCameraImage" | "deviceSensorData" | "deviceGetSensorConfiguration" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceManufacturerName" | "deviceModelNumber" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "deviceSoftwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceDeviceInformation" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceIsWifiAvailable" | "deviceGetWifiSSID" | "deviceGetWifiPassword" | "deviceIsWifiConnected" | "deviceIpAddress" | "deviceNotConnected" | "deviceConnecting" | "deviceDisconnecting" | "deviceConnectionStatus" | "deviceSmp" | "deviceBatteryLevel" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus" | "deviceConnectionMessage" | "deviceGetEnableWifiConnection">(type: T, listener: (event: {
        type: T;
        target: DevicePair;
        message: DevicePairEventMessages[T];
    }) => void) => void;
    get waitForEvent(): <T extends "pressure" | "deviceOrientation" | "sensorData" | "isConnected" | "deviceConnected" | "deviceIsConnected" | "devicePressure" | "deviceGetFileTypes" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "deviceTapDetector" | "deviceBarometer" | "deviceCameraStatus" | "deviceGetCameraConfiguration" | "deviceCameraImageProgress" | "deviceCameraImage" | "deviceSensorData" | "deviceGetSensorConfiguration" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceManufacturerName" | "deviceModelNumber" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "deviceSoftwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceDeviceInformation" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceIsWifiAvailable" | "deviceGetWifiSSID" | "deviceGetWifiPassword" | "deviceIsWifiConnected" | "deviceIpAddress" | "deviceNotConnected" | "deviceConnecting" | "deviceDisconnecting" | "deviceConnectionStatus" | "deviceSmp" | "deviceBatteryLevel" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus" | "deviceConnectionMessage" | "deviceGetEnableWifiConnection">(type: T) => Promise<{
        type: T;
        target: DevicePair;
        message: DevicePairEventMessages[T];
    }>;
    get removeEventListeners(): <T extends "pressure" | "deviceOrientation" | "sensorData" | "isConnected" | "deviceConnected" | "deviceIsConnected" | "devicePressure" | "deviceGetFileTypes" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "deviceTapDetector" | "deviceBarometer" | "deviceCameraStatus" | "deviceGetCameraConfiguration" | "deviceCameraImageProgress" | "deviceCameraImage" | "deviceSensorData" | "deviceGetSensorConfiguration" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceManufacturerName" | "deviceModelNumber" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "deviceSoftwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceDeviceInformation" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceIsWifiAvailable" | "deviceGetWifiSSID" | "deviceGetWifiPassword" | "deviceIsWifiConnected" | "deviceIpAddress" | "deviceNotConnected" | "deviceConnecting" | "deviceDisconnecting" | "deviceConnectionStatus" | "deviceSmp" | "deviceBatteryLevel" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus" | "deviceConnectionMessage" | "deviceGetEnableWifiConnection">(type: T) => void;
    get removeAllEventListeners(): () => void;
    get left(): Device | undefined;
    get right(): Device | undefined;
    get isConnected(): boolean;
    get isPartiallyConnected(): boolean;
    get isHalfConnected(): boolean;
    assignDevice(device: Device): Device | undefined;
    setSensorConfiguration(sensorConfiguration: SensorConfiguration): Promise<void>;
    resetPressureRange(): void;
    triggerVibration(vibrationConfigurations: VibrationConfiguration[], sendImmediately?: boolean): Promise<PromiseSettledResult<void | undefined>[]>;
    static get insoles(): DevicePair;
    static get gloves(): DevicePair;
}
export default DevicePair;
