import EventDispatcher from "./utils/EventDispatcher.ts";
import { SensorType } from "./sensor/SensorDataManager.ts";
import Device, { SendMessagesCallback } from "./Device.ts";
import { BaseExtendedFileConfiguration, BaseFileConfiguration, OnParseFileCallback, SendFileCallback } from "./FileTransferManager.ts";
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
export type SendTfliteMessagesCallback = SendMessagesCallback<TfliteMessageType>;
export declare const TfliteSensorTypes: readonly ["pressure", "linearAcceleration", "gyroscope", "magnetometer", "microphone", "camera"];
export type TfliteSensorType = (typeof TfliteSensorTypes)[number];
export interface BaseTfliteFileConfiguration {
    fileType: "tflite";
    name: string;
    sensorTypes: TfliteSensorType[];
    task: TfliteTask;
    sampleRate: number;
    captureDelay?: number;
    threshold?: number;
    classes?: string[];
}
export type TfliteFileConfiguration = BaseFileConfiguration & BaseTfliteFileConfiguration;
export type ExtendedTfliteFileConfiguration = BaseExtendedFileConfiguration & BaseTfliteFileConfiguration;
export declare function serializeTfliteFileHeader(fileConfiguration: TfliteFileConfiguration): DataView<ArrayBuffer> | undefined;
export declare function parseTfliteFileHeader(fileConfiguration: ExtendedTfliteFileConfiguration): void;
declare class TfliteManager {
    #private;
    constructor();
    sendMessages: SendTfliteMessagesCallback;
    sendFile: SendFileCallback;
    onParseFile: OnParseFileCallback;
    eventDispatcher: TfliteEventDispatcher;
    get addEventListenter(): <T extends "getTfliteName" | "setTfliteName" | "getTfliteTask" | "setTfliteTask" | "getTfliteSampleRate" | "setTfliteSampleRate" | "getTfliteSensorTypes" | "setTfliteSensorTypes" | "tfliteIsReady" | "getTfliteCaptureDelay" | "setTfliteCaptureDelay" | "getTfliteThreshold" | "setTfliteThreshold" | "getTfliteInferencingEnabled" | "setTfliteInferencingEnabled" | "tfliteInference" | "*">(type: T, listener: (event: import("./utils/EventDispatcher.ts").ListenerEvent<Device, "getTfliteName" | "setTfliteName" | "getTfliteTask" | "setTfliteTask" | "getTfliteSampleRate" | "setTfliteSampleRate" | "getTfliteSensorTypes" | "setTfliteSensorTypes" | "tfliteIsReady" | "getTfliteCaptureDelay" | "setTfliteCaptureDelay" | "getTfliteThreshold" | "setTfliteThreshold" | "getTfliteInferencingEnabled" | "setTfliteInferencingEnabled" | "tfliteInference", TfliteEventMessages, T>) => void, options?: import("./utils/EventDispatcher.ts").EventDispatcherOptions) => void;
    get removeEventListener(): <T extends "getTfliteName" | "setTfliteName" | "getTfliteTask" | "setTfliteTask" | "getTfliteSampleRate" | "setTfliteSampleRate" | "getTfliteSensorTypes" | "setTfliteSensorTypes" | "tfliteIsReady" | "getTfliteCaptureDelay" | "setTfliteCaptureDelay" | "getTfliteThreshold" | "setTfliteThreshold" | "getTfliteInferencingEnabled" | "setTfliteInferencingEnabled" | "tfliteInference" | "*">(type: T, listener: (event: import("./utils/EventDispatcher.ts").ListenerEvent<Device, "getTfliteName" | "setTfliteName" | "getTfliteTask" | "setTfliteTask" | "getTfliteSampleRate" | "setTfliteSampleRate" | "getTfliteSensorTypes" | "setTfliteSensorTypes" | "tfliteIsReady" | "getTfliteCaptureDelay" | "setTfliteCaptureDelay" | "getTfliteThreshold" | "setTfliteThreshold" | "getTfliteInferencingEnabled" | "setTfliteInferencingEnabled" | "tfliteInference", TfliteEventMessages, T>) => void) => void;
    get waitForEvent(): <T extends "getTfliteName" | "setTfliteName" | "getTfliteTask" | "setTfliteTask" | "getTfliteSampleRate" | "setTfliteSampleRate" | "getTfliteSensorTypes" | "setTfliteSensorTypes" | "tfliteIsReady" | "getTfliteCaptureDelay" | "setTfliteCaptureDelay" | "getTfliteThreshold" | "setTfliteThreshold" | "getTfliteInferencingEnabled" | "setTfliteInferencingEnabled" | "tfliteInference">(type: T, options?: {
        immediate?: boolean;
        signal?: AbortSignal;
    }) => Promise<import("./utils/EventDispatcher.ts").ListenerEvent<Device, "getTfliteName" | "setTfliteName" | "getTfliteTask" | "setTfliteTask" | "getTfliteSampleRate" | "setTfliteSampleRate" | "getTfliteSensorTypes" | "setTfliteSensorTypes" | "tfliteIsReady" | "getTfliteCaptureDelay" | "setTfliteCaptureDelay" | "getTfliteThreshold" | "setTfliteThreshold" | "getTfliteInferencingEnabled" | "setTfliteInferencingEnabled" | "tfliteInference", TfliteEventMessages, T>>;
    get classes(): string[] | undefined;
    setClasses(newClasses?: string[]): void;
    get name(): string;
    setName(newName: string, sendImmediately?: boolean): Promise<void>;
    get task(): "classification" | "regression";
    setTask(newTask: TfliteTask, sendImmediately?: boolean): Promise<void>;
    get sampleRate(): number;
    setSampleRate(newSampleRate: number, sendImmediately?: boolean): Promise<void>;
    static AssertValidSensorType(sensorType: SensorType): void;
    get sensorTypes(): ("pressure" | "linearAcceleration" | "gyroscope" | "magnetometer" | "camera" | "microphone")[];
    setSensorTypes(newSensorTypes: SensorType[], sendImmediately?: boolean): Promise<void>;
    get isReady(): boolean;
    onFileConfiguration(fileConfiguration: ExtendedTfliteFileConfiguration): void;
    onIsReady(): void;
    get captureDelay(): number;
    setCaptureDelay(newCaptureDelay: number, sendImmediately: boolean): Promise<void>;
    get threshold(): number;
    setThreshold(newThreshold: number, sendImmediately: boolean): Promise<void>;
    get inferencingEnabled(): boolean;
    setInferencingEnabled(newInferencingEnabled: boolean, sendImmediately?: boolean): Promise<void>;
    toggleInferencingEnabled(): Promise<void>;
    enableInferencing(): Promise<void>;
    disableInferencing(): Promise<void>;
    parseMessage(messageType: TfliteMessageType, dataView: DataView<ArrayBuffer>, isSending?: boolean): void;
    get configuration(): TfliteFileConfiguration | undefined;
    clear(): void;
    requestRequiredInformation(): void;
    uploadModel(configuration: TfliteFileConfiguration): Promise<void>;
}
export default TfliteManager;
