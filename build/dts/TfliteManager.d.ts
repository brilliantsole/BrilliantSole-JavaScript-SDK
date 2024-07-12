import EventDispatcher from "./utils/EventDispatcher.ts";
import { SensorType } from "./sensor/SensorDataManager.ts";
import Device, { SendMessageCallback } from "./Device.ts";
export declare const TfliteMessageTypes: readonly ["getTfliteName", "setTfliteName", "getTfliteTask", "setTfliteTask", "getTfliteSampleRate", "setTfliteSampleRate", "getTfliteSensorTypes", "setTfliteSensorTypes", "tfliteIsReady", "getTfliteCaptureDelay", "setTfliteCaptureDelay", "getTfliteThreshold", "setTfliteThreshold", "getTfliteInferencingEnabled", "setTfliteInferencingEnabled", "tfliteInference"];
export type TfliteMessageType = (typeof TfliteMessageTypes)[number];
export declare const TfliteEventTypes: readonly ["getTfliteName", "setTfliteName", "getTfliteTask", "setTfliteTask", "getTfliteSampleRate", "setTfliteSampleRate", "getTfliteSensorTypes", "setTfliteSensorTypes", "tfliteIsReady", "getTfliteCaptureDelay", "setTfliteCaptureDelay", "getTfliteThreshold", "setTfliteThreshold", "getTfliteInferencingEnabled", "setTfliteInferencingEnabled", "tfliteInference"];
export type TfliteEventType = (typeof TfliteEventTypes)[number];
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
}
export type TfliteEventDispatcher = EventDispatcher<Device, TfliteEventType, TfliteEventMessages>;
export type SendTfliteMessageCallback = SendMessageCallback<TfliteMessageType>;
export declare const TfliteSensorTypes: SensorType[];
export type TfliteSensorType = (typeof TfliteSensorTypes)[number];
declare class TfliteManager {
    #private;
    sendMessage: SendTfliteMessageCallback;
    eventDispatcher: TfliteEventDispatcher;
    get addEventListenter(): <T extends "getTfliteName" | "setTfliteName" | "getTfliteTask" | "setTfliteTask" | "getTfliteSampleRate" | "setTfliteSampleRate" | "getTfliteSensorTypes" | "setTfliteSensorTypes" | "tfliteIsReady" | "getTfliteCaptureDelay" | "setTfliteCaptureDelay" | "getTfliteThreshold" | "setTfliteThreshold" | "getTfliteInferencingEnabled" | "setTfliteInferencingEnabled" | "tfliteInference">(type: T, listener: (event: {
        type: T;
        target: Device;
        message: TfliteEventMessages[T];
    }) => void, options?: {
        once?: boolean;
    }) => void;
    get removeEventListener(): <T extends "getTfliteName" | "setTfliteName" | "getTfliteTask" | "setTfliteTask" | "getTfliteSampleRate" | "setTfliteSampleRate" | "getTfliteSensorTypes" | "setTfliteSensorTypes" | "tfliteIsReady" | "getTfliteCaptureDelay" | "setTfliteCaptureDelay" | "getTfliteThreshold" | "setTfliteThreshold" | "getTfliteInferencingEnabled" | "setTfliteInferencingEnabled" | "tfliteInference">(type: T, listener: (event: {
        type: T;
        target: Device;
        message: TfliteEventMessages[T];
    }) => void) => void;
    get waitForEvent(): <T extends "getTfliteName" | "setTfliteName" | "getTfliteTask" | "setTfliteTask" | "getTfliteSampleRate" | "setTfliteSampleRate" | "getTfliteSensorTypes" | "setTfliteSensorTypes" | "tfliteIsReady" | "getTfliteCaptureDelay" | "setTfliteCaptureDelay" | "getTfliteThreshold" | "setTfliteThreshold" | "getTfliteInferencingEnabled" | "setTfliteInferencingEnabled" | "tfliteInference">(type: T) => Promise<{
        type: T;
        target: Device;
        message: TfliteEventMessages[T];
    }>;
    get name(): string;
    setName(newName: string, sendImmediately?: boolean): Promise<void>;
    get task(): "classification" | "regression";
    setTask(newTask: TfliteTask, sendImmediately?: boolean): Promise<void>;
    get sampleRate(): number;
    setSampleRate(newSampleRate: number, sendImmediately?: boolean): Promise<void>;
    static AssertValidSensorType(sensorType: SensorType): void;
    get sensorTypes(): ("pressure" | "acceleration" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation" | "orientation" | "activity" | "stepCounter" | "stepDetector" | "deviceOrientation" | "barometer")[];
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
}
export default TfliteManager;
