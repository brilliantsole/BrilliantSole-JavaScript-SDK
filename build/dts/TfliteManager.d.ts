import EventDispatcher from "./utils/EventDispatcher.ts";
import { SensorType } from "./sensor/SensorDataManager.ts";
import Device, { SendMessageCallback } from "./Device.ts";
import { FileConfiguration as BaseFileConfiguration } from "./FileTransferManager.ts";
export declare const TfliteMessageTypes: readonly ["getTfliteName", "setTfliteName", "getTfliteTask", "setTfliteTask", "getTfliteSampleRate", "setTfliteSampleRate", "getTfliteSensorTypes", "setTfliteSensorTypes", "tfliteIsReady", "getTfliteCaptureDelay", "setTfliteCaptureDelay", "getTfliteThreshold", "setTfliteThreshold", "getTfliteInferencingEnabled", "setTfliteInferencingEnabled", "tfliteInference"];
export type TfliteMessageType = (typeof TfliteMessageTypes)[number];
export declare const TfliteEventTypes: readonly ["getTfliteName", "setTfliteName", "getTfliteTask", "setTfliteTask", "getTfliteSampleRate", "setTfliteSampleRate", "getTfliteSensorTypes", "setTfliteSensorTypes", "tfliteIsReady", "getTfliteCaptureDelay", "setTfliteCaptureDelay", "getTfliteThreshold", "setTfliteThreshold", "getTfliteInferencingEnabled", "setTfliteInferencingEnabled", "tfliteInference"];
export type TfliteEventType = (typeof TfliteEventTypes)[number];
export declare const RequiredTfliteMessageTypes: TfliteMessageType[];
export declare const TfliteTasks: readonly ["classification", "regression"];
export type TfliteTask = (typeof TfliteTasks)[number];
export interface TfliteEventMessages {
    getTfliteName: {
        tfliteName: string;
    };
    getTfliteTask: {
        tfliteTask: TfliteTask;
    };
    getTfliteSampleRate: {
        tfliteSampleRate: number;
    };
    getTfliteSensorTypes: {
        tfliteSensorTypes: SensorType[];
    };
    tfliteIsReady: {
        tfliteIsReady: boolean;
    };
    getTfliteCaptureDelay: {
        tfliteCaptureDelay: number;
    };
    getTfliteThreshold: {
        tfliteThreshold: number;
    };
    getTfliteInferencingEnabled: {
        tfliteInferencingEnabled: boolean;
    };
    tfliteInference: {
        tfliteInference: TfliteInference;
    };
}
export interface TfliteInference {
    timestamp: number;
    values: number[];
    maxValue?: number;
    maxIndex?: number;
    maxClass?: string;
    classValues?: {
        [key: string]: number;
    };
}
export type TfliteEventDispatcher = EventDispatcher<Device, TfliteEventType, TfliteEventMessages>;
export type SendTfliteMessageCallback = SendMessageCallback<TfliteMessageType>;
export declare const TfliteSensorTypes: readonly ["pressure", "linearAcceleration", "gyroscope", "magnetometer"];
export type TfliteSensorType = (typeof TfliteSensorTypes)[number];
export interface TfliteFileConfiguration extends BaseFileConfiguration {
    type: "tflite";
    name: string;
    sensorTypes: TfliteSensorType[];
    task: TfliteTask;
    sampleRate: number;
    captureDelay?: number;
    threshold?: number;
    classes?: string[];
}
declare class TfliteManager {
    #private;
    constructor();
    sendMessage: SendTfliteMessageCallback;
    eventDispatcher: TfliteEventDispatcher;
    get addEventListenter(): <T extends "getTfliteName" | "getTfliteTask" | "getTfliteSampleRate" | "getTfliteSensorTypes" | "tfliteIsReady" | "getTfliteCaptureDelay" | "getTfliteThreshold" | "getTfliteInferencingEnabled" | "tfliteInference" | "setTfliteName" | "setTfliteTask" | "setTfliteSampleRate" | "setTfliteSensorTypes" | "setTfliteCaptureDelay" | "setTfliteThreshold" | "setTfliteInferencingEnabled">(type: T, listener: (event: {
        type: T;
        target: Device;
        message: TfliteEventMessages[T];
    }) => void, options?: {
        once?: boolean;
    }) => void;
    get removeEventListener(): <T extends "getTfliteName" | "getTfliteTask" | "getTfliteSampleRate" | "getTfliteSensorTypes" | "tfliteIsReady" | "getTfliteCaptureDelay" | "getTfliteThreshold" | "getTfliteInferencingEnabled" | "tfliteInference" | "setTfliteName" | "setTfliteTask" | "setTfliteSampleRate" | "setTfliteSensorTypes" | "setTfliteCaptureDelay" | "setTfliteThreshold" | "setTfliteInferencingEnabled">(type: T, listener: (event: {
        type: T;
        target: Device;
        message: TfliteEventMessages[T];
    }) => void) => void;
    get waitForEvent(): <T extends "getTfliteName" | "getTfliteTask" | "getTfliteSampleRate" | "getTfliteSensorTypes" | "tfliteIsReady" | "getTfliteCaptureDelay" | "getTfliteThreshold" | "getTfliteInferencingEnabled" | "tfliteInference" | "setTfliteName" | "setTfliteTask" | "setTfliteSampleRate" | "setTfliteSensorTypes" | "setTfliteCaptureDelay" | "setTfliteThreshold" | "setTfliteInferencingEnabled">(type: T) => Promise<{
        type: T;
        target: Device;
        message: TfliteEventMessages[T];
    }>;
    get classes(): string[] | undefined;
    setClasses(newClasses?: string[]): void;
    get name(): string;
    setName(newName: string, sendImmediately?: boolean): Promise<void>;
    get task(): "classification" | "regression";
    setTask(newTask: TfliteTask, sendImmediately?: boolean): Promise<void>;
    get sampleRate(): number;
    setSampleRate(newSampleRate: number, sendImmediately?: boolean): Promise<void>;
    static AssertValidSensorType(sensorType: SensorType): void;
    get sensorTypes(): ("pressure" | "linearAcceleration" | "gyroscope" | "magnetometer")[];
    setSensorTypes(newSensorTypes: SensorType[], sendImmediately?: boolean): Promise<void>;
    get isReady(): boolean;
    get captureDelay(): number;
    setCaptureDelay(newCaptureDelay: number, sendImmediately: boolean): Promise<void>;
    get threshold(): number;
    setThreshold(newThreshold: number, sendImmediately: boolean): Promise<void>;
    get inferencingEnabled(): boolean;
    setInferencingEnabled(newInferencingEnabled: boolean, sendImmediately?: boolean): Promise<void>;
    toggleInferencingEnabled(): Promise<void>;
    enableInferencing(): Promise<void>;
    disableInferencing(): Promise<void>;
    parseMessage(messageType: TfliteMessageType, dataView: DataView): void;
    get configuration(): TfliteFileConfiguration | undefined;
    sendConfiguration(configuration: TfliteFileConfiguration, sendImmediately?: boolean): void;
    clear(): void;
    requestRequiredInformation(): void;
}
export default TfliteManager;
