import * as ws from 'ws';

interface ConsoleLevelFlags {
    log?: boolean;
    warn?: boolean;
    error?: boolean;
    assert?: boolean;
    table?: boolean;
}
/** @throws {Error} if no console with type is found */
declare function setConsoleLevelFlagsForType(type: string, levelFlags: ConsoleLevelFlags): void;
declare function setAllConsoleLevelFlags(levelFlags: ConsoleLevelFlags): void;

declare class EventDispatcher<Target extends any, EventType extends string, EventMessages extends Partial<Record<EventType, any>>> {
    private target;
    private validEventTypes;
    private listeners;
    constructor(target: Target, validEventTypes: readonly EventType[]);
    private isValidEventType;
    addEventListener<T extends EventType>(type: T, listener: (event: {
        type: T;
        target: Target;
        message: EventMessages[T];
    }) => void, options?: {
        once: boolean;
    }): void;
    removeEventListener<T extends EventType>(type: T, listener: (event: {
        type: T;
        target: Target;
        message: EventMessages[T];
    }) => void): void;
    dispatchEvent<T extends EventType>(type: T, message: EventMessages[T]): void;
    waitForEvent<T extends EventType>(type: T): Promise<{
        type: T;
        target: Target;
        message: EventMessages[T];
    }>;
}

type FileLike = number[] | ArrayBuffer | DataView | URL | string | File;

declare const FirmwareStatuses: readonly ["idle", "uploading", "uploaded", "pending", "testing", "erasing"];
type FirmwareStatus = (typeof FirmwareStatuses)[number];
interface FirmwareImage {
    slot: number;
    active: boolean;
    confirmed: boolean;
    pending: boolean;
    permanent: boolean;
    bootable: boolean;
    version: string;
    hash?: Uint8Array;
    empty?: boolean;
}
interface FirmwareEventMessages {
    smp: {
        dataView: DataView;
    };
    firmwareImages: {
        firmwareImages: FirmwareImage[];
    };
    firmwareUploadProgress: {
        progress: number;
    };
    firmwareStatus: {
        firmwareStatus: FirmwareStatus;
    };
}

interface Vector2 {
    x: number;
    y: number;
}
interface Vector3 extends Vector2 {
    z: number;
}
interface Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;
}
interface Euler {
    heading: number;
    pitch: number;
    roll: number;
}

type CenterOfPressure = Vector2;

type PressureSensorPosition = Vector2;

interface PressureSensorValue {
    position: PressureSensorPosition;
    rawValue: number;
    scaledValue: number;
    normalizedValue: number;
    weightedValue: number;
}
interface PressureData {
    sensors: PressureSensorValue[];
    scaledSum: number;
    normalizedSum: number;
    center?: CenterOfPressure;
    normalizedCenter?: CenterOfPressure;
}
interface PressureDataEventMessages {
    pressure: {
        pressure: PressureData;
    };
}

type ValueOf<T> = T[keyof T];
type AddProperty<T, Key extends string, Value> = T & {
    [K in Key]: Value;
};
type AddKeysAsPropertyToInterface<Interface, Key extends string> = {
    [Value in keyof Interface]: AddProperty<Interface[Value], Key, Value>;
};
type ExtendInterfaceValues<Interface, T> = {
    [Key in keyof Interface]: Interface[Key] & T;
};
type CapitalizeFirstLetter<S extends string> = S extends `${infer First}${infer Rest}` ? `${Uppercase<First>}${Rest}` : S;
type AddPrefix<P extends string, S extends string> = `${P}${CapitalizeFirstLetter<S>}`;
type AddPrefixToInterfaceKeys<Interface, P extends string> = {
    [Key in keyof Interface as `${AddPrefix<P, Key & string>}`]: Interface[Key];
};

interface Activity {
    still: boolean;
    walking: boolean;
    running: boolean;
    bicycle: boolean;
    vehicle: boolean;
    tilting: boolean;
}
declare const DeviceOrientations: readonly ["portraitUpright", "landscapeLeft", "portraitUpsideDown", "landscapeRight", "unknown"];
type DeviceOrientation = (typeof DeviceOrientations)[number];
interface MotionSensorDataEventMessages {
    acceleration: {
        acceleration: Vector3;
    };
    gravity: {
        gravity: Vector3;
    };
    linearAcceleration: {
        linearAcceleration: Vector3;
    };
    gyroscope: {
        gyroscope: Vector3;
    };
    magnetometer: {
        magnetomter: Vector3;
    };
    gameRotation: {
        gameRotation: Quaternion;
    };
    rotation: {
        rotation: Quaternion;
    };
    orientation: {
        orientation: Euler;
    };
    stepDetector: {
        stepDetector: Object;
    };
    stepCounter: {
        stepCounter: number;
    };
    activity: {
        activity: Activity;
    };
    deviceOrientation: {
        deviceOrientation: DeviceOrientation;
    };
}

interface BarometerSensorDataEventMessages {
    barometer: {
        barometer: number;
    };
}

declare const SensorTypes: readonly ["acceleration", "gravity", "linearAcceleration", "gyroscope", "magnetometer", "gameRotation", "rotation", "orientation", "activity", "stepCounter", "stepDetector", "deviceOrientation", "pressure", "barometer"];
type SensorType = (typeof SensorTypes)[number];
declare const ContinuousSensorTypes: readonly ["acceleration", "gravity", "linearAcceleration", "gyroscope", "magnetometer", "gameRotation", "rotation", "pressure", "barometer"];
type ContinuousSensorType = (typeof ContinuousSensorTypes)[number];
interface BaseSensorDataEventMessage {
    timestamp: number;
}
type BaseSensorDataEventMessages = BarometerSensorDataEventMessages & MotionSensorDataEventMessages & PressureDataEventMessages;
type _SensorDataEventMessages = ExtendInterfaceValues<AddKeysAsPropertyToInterface<BaseSensorDataEventMessages, "sensorType">, BaseSensorDataEventMessage>;
type SensorDataEventMessage = ValueOf<_SensorDataEventMessages>;
interface AnySensorDataEventMessages {
    sensorData: SensorDataEventMessage;
}
type SensorDataEventMessages = _SensorDataEventMessages & AnySensorDataEventMessages;

declare const TfliteTasks: readonly ["classification", "regression"];
type TfliteTask = (typeof TfliteTasks)[number];
interface TfliteEventMessages {
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
interface TfliteInference {
    timestamp: number;
    values: number[];
}
declare const TfliteSensorTypes: SensorType[];
type TfliteSensorType = (typeof TfliteSensorTypes)[number];

interface PnpId {
    source: "Bluetooth" | "USB";
    vendorId: number;
    productId: number;
    productVersion: number;
}
interface DeviceInformation {
    manufacturerName: string;
    modelNumber: string;
    softwareRevision: string;
    hardwareRevision: string;
    firmwareRevision: string;
    pnpId: PnpId;
    serialNumber: string;
}
interface DeviceInformationEventMessages {
    manufacturerName: {
        manufacturerName: string;
    };
    modelNumber: {
        modelNumber: string;
    };
    softwareRevision: {
        softwareRevision: string;
    };
    hardwareRevision: {
        hardwareRevision: string;
    };
    firmwareRevision: {
        firmwareRevision: string;
    };
    pnpId: {
        pnpId: PnpId;
    };
    serialNumber: {
        serialNumber: string;
    };
    deviceInformation: {
        deviceInformation: DeviceInformation;
    };
}

declare const ConnectionTypes: readonly ["webBluetooth", "noble", "webSocketClient"];
type ConnectionType = (typeof ConnectionTypes)[number];
declare const ConnectionStatuses: readonly ["not connected", "connecting", "connected", "disconnecting"];
type ConnectionStatus = (typeof ConnectionStatuses)[number];
interface TxMessage {
    type: TxRxMessageType;
    data?: ArrayBuffer;
}
declare const TxRxMessageTypes: readonly ["isCharging", "getBatteryCurrent", "getMtu", "getId", "getName", "setName", "getType", "setType", "getCurrentTime", "setCurrentTime", "getSensorConfiguration", "setSensorConfiguration", "getPressurePositions", "getSensorScalars", "sensorData", "triggerVibration", "getTfliteName", "setTfliteName", "getTfliteTask", "setTfliteTask", "getTfliteSampleRate", "setTfliteSampleRate", "getTfliteSensorTypes", "setTfliteSensorTypes", "tfliteIsReady", "getTfliteCaptureDelay", "setTfliteCaptureDelay", "getTfliteThreshold", "setTfliteThreshold", "getTfliteInferencingEnabled", "setTfliteInferencingEnabled", "tfliteInference", "maxFileLength", "getFileType", "setFileType", "getFileLength", "setFileLength", "getFileChecksum", "setFileChecksum", "setFileTransferCommand", "fileTransferStatus", "getFileBlock", "setFileBlock"];
type TxRxMessageType = (typeof TxRxMessageTypes)[number];
declare const ConnectionMessageTypes: readonly ["manufacturerName", "modelNumber", "softwareRevision", "hardwareRevision", "firmwareRevision", "pnpId", "serialNumber", "batteryLevel", "smp", "rx", "tx", "isCharging", "getBatteryCurrent", "getMtu", "getId", "getName", "setName", "getType", "setType", "getCurrentTime", "setCurrentTime", "getSensorConfiguration", "setSensorConfiguration", "getPressurePositions", "getSensorScalars", "sensorData", "triggerVibration", "getTfliteName", "setTfliteName", "getTfliteTask", "setTfliteTask", "getTfliteSampleRate", "setTfliteSampleRate", "getTfliteSensorTypes", "setTfliteSensorTypes", "tfliteIsReady", "getTfliteCaptureDelay", "setTfliteCaptureDelay", "getTfliteThreshold", "setTfliteThreshold", "getTfliteInferencingEnabled", "setTfliteInferencingEnabled", "tfliteInference", "maxFileLength", "getFileType", "setFileType", "getFileLength", "setFileLength", "getFileChecksum", "setFileChecksum", "setFileTransferCommand", "fileTransferStatus", "getFileBlock", "setFileBlock"];
type ConnectionMessageType = (typeof ConnectionMessageTypes)[number];
type ConnectionStatusCallback = (status: ConnectionStatus) => void;
type MessageReceivedCallback = (messageType: ConnectionMessageType, dataView: DataView) => void;
declare abstract class BaseConnectionManager {
    #private;
    abstract get bluetoothId(): string;
    onStatusUpdated?: ConnectionStatusCallback;
    onMessageReceived?: MessageReceivedCallback;
    static get isSupported(): boolean;
    get isSupported(): boolean;
    static type: ConnectionType;
    get type(): ConnectionType;
    constructor();
    get status(): "not connected" | "connecting" | "connected" | "disconnecting";
    protected set status(newConnectionStatus: "not connected" | "connecting" | "connected" | "disconnecting");
    get isConnected(): boolean;
    connect(): Promise<void>;
    get canReconnect(): boolean;
    reconnect(): Promise<void>;
    disconnect(): Promise<void>;
    sendSmpMessage(data: ArrayBuffer): Promise<void>;
    sendTxMessages(messages: TxMessage[] | undefined, sendImmediately?: boolean): Promise<void>;
    mtu?: number;
    sendTxData(data: ArrayBuffer): Promise<void>;
    parseRxMessage(dataView: DataView): void;
}

type SensorConfiguration = {
    [sensorType in SensorType]?: number;
};
interface SensorConfigurationEventMessages {
    getSensorConfiguration: {
        sensorConfiguration: SensorConfiguration;
    };
}

declare const VibrationWaveformEffects: readonly ["none", "strongClick100", "strongClick60", "strongClick30", "sharpClick100", "sharpClick60", "sharpClick30", "softBump100", "softBump60", "softBump30", "doubleClick100", "doubleClick60", "tripleClick100", "softFuzz60", "strongBuzz100", "alert750ms", "alert1000ms", "strongClick1_100", "strongClick2_80", "strongClick3_60", "strongClick4_30", "mediumClick100", "mediumClick80", "mediumClick60", "sharpTick100", "sharpTick80", "sharpTick60", "shortDoubleClickStrong100", "shortDoubleClickStrong80", "shortDoubleClickStrong60", "shortDoubleClickStrong30", "shortDoubleClickMedium100", "shortDoubleClickMedium80", "shortDoubleClickMedium60", "shortDoubleSharpTick100", "shortDoubleSharpTick80", "shortDoubleSharpTick60", "longDoubleSharpClickStrong100", "longDoubleSharpClickStrong80", "longDoubleSharpClickStrong60", "longDoubleSharpClickStrong30", "longDoubleSharpClickMedium100", "longDoubleSharpClickMedium80", "longDoubleSharpClickMedium60", "longDoubleSharpTick100", "longDoubleSharpTick80", "longDoubleSharpTick60", "buzz100", "buzz80", "buzz60", "buzz40", "buzz20", "pulsingStrong100", "pulsingStrong60", "pulsingMedium100", "pulsingMedium60", "pulsingSharp100", "pulsingSharp60", "transitionClick100", "transitionClick80", "transitionClick60", "transitionClick40", "transitionClick20", "transitionClick10", "transitionHum100", "transitionHum80", "transitionHum60", "transitionHum40", "transitionHum20", "transitionHum10", "transitionRampDownLongSmooth2_100", "transitionRampDownLongSmooth1_100", "transitionRampDownMediumSmooth1_100", "transitionRampDownMediumSmooth2_100", "transitionRampDownShortSmooth1_100", "transitionRampDownShortSmooth2_100", "transitionRampDownLongSharp1_100", "transitionRampDownLongSharp2_100", "transitionRampDownMediumSharp1_100", "transitionRampDownMediumSharp2_100", "transitionRampDownShortSharp1_100", "transitionRampDownShortSharp2_100", "transitionRampUpLongSmooth1_100", "transitionRampUpLongSmooth2_100", "transitionRampUpMediumSmooth1_100", "transitionRampUpMediumSmooth2_100", "transitionRampUpShortSmooth1_100", "transitionRampUpShortSmooth2_100", "transitionRampUpLongSharp1_100", "transitionRampUpLongSharp2_100", "transitionRampUpMediumSharp1_100", "transitionRampUpMediumSharp2_100", "transitionRampUpShortSharp1_100", "transitionRampUpShortSharp2_100", "transitionRampDownLongSmooth1_50", "transitionRampDownLongSmooth2_50", "transitionRampDownMediumSmooth1_50", "transitionRampDownMediumSmooth2_50", "transitionRampDownShortSmooth1_50", "transitionRampDownShortSmooth2_50", "transitionRampDownLongSharp1_50", "transitionRampDownLongSharp2_50", "transitionRampDownMediumSharp1_50", "transitionRampDownMediumSharp2_50", "transitionRampDownShortSharp1_50", "transitionRampDownShortSharp2_50", "transitionRampUpLongSmooth1_50", "transitionRampUpLongSmooth2_50", "transitionRampUpMediumSmooth1_50", "transitionRampUpMediumSmooth2_50", "transitionRampUpShortSmooth1_50", "transitionRampUpShortSmooth2_50", "transitionRampUpLongSharp1_50", "transitionRampUpLongSharp2_50", "transitionRampUpMediumSharp1_50", "transitionRampUpMediumSharp2_50", "transitionRampUpShortSharp1_50", "transitionRampUpShortSharp2_50", "longBuzz100", "smoothHum50", "smoothHum40", "smoothHum30", "smoothHum20", "smoothHum10"];
type VibrationWaveformEffect = (typeof VibrationWaveformEffects)[number];

declare const VibrationLocations: readonly ["front", "rear"];
type VibrationLocation = (typeof VibrationLocations)[number];
declare const VibrationTypes: readonly ["waveformEffect", "waveform"];
type VibrationType = (typeof VibrationTypes)[number];
interface VibrationWaveformEffectSegment {
    effect?: VibrationWaveformEffect;
    delay?: number;
    loopCount?: number;
}
interface VibrationWaveformSegment {
    duration: number;
    amplitude: number;
}
interface BaseVibrationConfiguration {
    type: VibrationType;
    locations?: VibrationLocation[];
}
interface VibrationWaveformEffectConfiguration extends BaseVibrationConfiguration {
    type: "waveformEffect";
    segments: VibrationWaveformEffectSegment[];
    loopCount?: number;
}
interface VibrationWaveformConfiguration extends BaseVibrationConfiguration {
    type: "waveform";
    segments: VibrationWaveformSegment[];
}
type VibrationConfiguration = VibrationWaveformEffectConfiguration | VibrationWaveformConfiguration;

declare const FileTypes: readonly ["tflite"];
type FileType = (typeof FileTypes)[number];
declare const FileTransferStatuses: readonly ["idle", "sending", "receiving"];
type FileTransferStatus = (typeof FileTransferStatuses)[number];
declare const FileTransferDirections: readonly ["sending", "receiving"];
type FileTransferDirection = (typeof FileTransferDirections)[number];
interface FileTransferEventMessages {
    maxFileLength: {
        maxFileLength: number;
    };
    getFileType: {
        fileType: FileType;
    };
    getFileLength: {
        fileLength: number;
    };
    getFileChecksum: {
        fileChecksum: number;
    };
    fileTransferStatus: {
        fileTransferStatus: FileTransferStatus;
    };
    getFileBlock: {
        fileTransferBlock: DataView;
    };
    fileTransferProgress: {
        progress: number;
    };
    fileTransferComplete: {
        direction: FileTransferDirection;
    };
    fileReceived: {
        file: File | Blob;
    };
}

declare const DeviceTypes: readonly ["leftInsole", "rightInsole"];
type DeviceType = (typeof DeviceTypes)[number];
declare const InsoleSides: readonly ["left", "right"];
type InsoleSide = (typeof InsoleSides)[number];
interface InformationEventMessages {
    isCharging: {
        isCharging: boolean;
    };
    getBatteryCurrent: {
        batteryCurrent: number;
    };
    getMtu: {
        mtu: number;
    };
    getId: {
        id: string;
    };
    getName: {
        name: string;
    };
    getType: {
        type: DeviceType;
    };
    getCurrentTime: {
        currentTime: number;
    };
}

interface DeviceEventMessages extends DeviceInformationEventMessages, InformationEventMessages, SensorDataEventMessages, SensorConfigurationEventMessages, TfliteEventMessages, FileTransferEventMessages, FirmwareEventMessages {
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
interface StaticDeviceEventMessage {
    device: Device;
}
interface StaticDeviceEventMessages {
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
declare class Device {
    #private;
    get bluetoothId(): string | undefined;
    constructor();
    get addEventListener(): <T extends "maxFileLength" | "getFileType" | "setFileType" | "getFileLength" | "setFileLength" | "getFileChecksum" | "setFileChecksum" | "setFileTransferCommand" | "fileTransferStatus" | "getFileBlock" | "setFileBlock" | "fileTransferProgress" | "fileTransferComplete" | "fileReceived" | "pressure" | "acceleration" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation" | "orientation" | "activity" | "stepCounter" | "stepDetector" | "deviceOrientation" | "barometer" | "getPressurePositions" | "getSensorScalars" | "sensorData" | "getSensorConfiguration" | "setSensorConfiguration" | "getTfliteName" | "setTfliteName" | "getTfliteTask" | "setTfliteTask" | "getTfliteSampleRate" | "setTfliteSampleRate" | "getTfliteSensorTypes" | "setTfliteSensorTypes" | "tfliteIsReady" | "getTfliteCaptureDelay" | "setTfliteCaptureDelay" | "getTfliteThreshold" | "setTfliteThreshold" | "getTfliteInferencingEnabled" | "setTfliteInferencingEnabled" | "tfliteInference" | "manufacturerName" | "modelNumber" | "softwareRevision" | "hardwareRevision" | "firmwareRevision" | "pnpId" | "serialNumber" | "deviceInformation" | "isCharging" | "getBatteryCurrent" | "getMtu" | "getId" | "getName" | "setName" | "getType" | "setType" | "getCurrentTime" | "setCurrentTime" | "triggerVibration" | "not connected" | "connecting" | "connected" | "disconnecting" | "batteryLevel" | "smp" | "rx" | "tx" | "firmwareImages" | "firmwareUploadProgress" | "firmwareStatus" | "firmwareUploadComplete" | "connectionStatus" | "isConnected" | "connectionMessage">(type: T, listener: (event: {
        type: T;
        target: Device;
        message: DeviceEventMessages[T];
    }) => void, options?: {
        once: boolean;
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
    get deviceInformation(): DeviceInformation;
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
    get continuousSensorTypes(): ("pressure" | "acceleration" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation" | "orientation" | "activity" | "stepCounter" | "stepDetector" | "deviceOrientation" | "barometer")[];
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
    get setTfliteTask(): (newTask: TfliteTask, sendImmediately?: boolean) => Promise<void>;
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
    get firmwareImages(): FirmwareImage[];
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
        once: boolean;
    }) => void;
    static get RemoveEventListener(): <T extends "deviceConnected" | "deviceDisconnected" | "deviceIsConnected" | "availableDevices" | "connectedDevices">(type: T, listener: (event: {
        type: T;
        target: typeof Device;
        message: StaticDeviceEventMessages[T];
    }) => void) => void;
    static Connect(): Promise<Device>;
}

declare const isInProduction: boolean;
declare const isInDev: boolean;
declare const isInBrowser: boolean;
declare const isInNode: boolean;
declare let isBluetoothSupported: boolean;
declare const isInBluefy: boolean;
declare const isInWebBLE: boolean;
declare const isAndroid: boolean;
declare const isSafari: boolean;
declare const isIOS: boolean;
declare const isMac: boolean;
declare const isInLensStudio: boolean;

declare const environment_d_isAndroid: typeof isAndroid;
declare const environment_d_isBluetoothSupported: typeof isBluetoothSupported;
declare const environment_d_isIOS: typeof isIOS;
declare const environment_d_isInBluefy: typeof isInBluefy;
declare const environment_d_isInBrowser: typeof isInBrowser;
declare const environment_d_isInDev: typeof isInDev;
declare const environment_d_isInLensStudio: typeof isInLensStudio;
declare const environment_d_isInNode: typeof isInNode;
declare const environment_d_isInProduction: typeof isInProduction;
declare const environment_d_isInWebBLE: typeof isInWebBLE;
declare const environment_d_isMac: typeof isMac;
declare const environment_d_isSafari: typeof isSafari;
declare namespace environment_d {
  export { environment_d_isAndroid as isAndroid, environment_d_isBluetoothSupported as isBluetoothSupported, environment_d_isIOS as isIOS, environment_d_isInBluefy as isInBluefy, environment_d_isInBrowser as isInBrowser, environment_d_isInDev as isInDev, environment_d_isInLensStudio as isInLensStudio, environment_d_isInNode as isInNode, environment_d_isInProduction as isInProduction, environment_d_isInWebBLE as isInWebBLE, environment_d_isMac as isMac, environment_d_isSafari as isSafari };
}

interface DiscoveredDevice {
    bluetoothId: string;
    name: string;
    deviceType?: DeviceType;
    rssi: number;
}
interface ScannerDiscoveredDeviceEventMessage {
    discoveredDevice: DiscoveredDevice;
}
interface ScannerEventMessages {
    discoveredDevice: ScannerDiscoveredDeviceEventMessage;
    expiredDiscoveredDevice: ScannerDiscoveredDeviceEventMessage;
    isScanningAvailable: {
        isScanningAvailable: boolean;
    };
    isScanning: {
        isScanning: boolean;
    };
}
declare abstract class BaseScanner {
    #private;
    static get isSupported(): boolean;
    get isSupported(): boolean;
    constructor();
    get addEventListener(): <T extends "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice">(type: T, listener: (event: {
        type: T;
        target: BaseScanner;
        message: ScannerEventMessages[T];
    }) => void, options?: {
        once: boolean;
    }) => void;
    protected get dispatchEvent(): <T extends "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice">(type: T, message: ScannerEventMessages[T]) => void;
    get removeEventListener(): <T extends "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice">(type: T, listener: (event: {
        type: T;
        target: BaseScanner;
        message: ScannerEventMessages[T];
    }) => void) => void;
    get waitForEvent(): <T extends "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice">(type: T) => Promise<{
        type: T;
        target: BaseScanner;
        message: ScannerEventMessages[T];
    }>;
    get isScanningAvailable(): boolean;
    get isScanning(): boolean;
    startScan(): void;
    stopScan(): void;
    get discoveredDevices(): {
        [deviceId: string]: DiscoveredDevice;
    };
    get discoveredDevicesArray(): DiscoveredDevice[];
    static get DiscoveredDeviceExpirationTimeout(): number;
    connectToDevice(deviceId: string): Promise<void>;
    get canReset(): boolean;
    reset(): void;
}

declare let scanner: BaseScanner | undefined;

declare const ServerEventTypes: readonly ["clientConnected", "clientDisconnected"];
type ServerEventType = (typeof ServerEventTypes)[number];
interface ServerEventMessages {
    clientConnected: {
        client: any;
    };
    clientDisconnected: {
        client: any;
    };
}
type ServerEventDispatcher = EventDispatcher<BaseServer, ServerEventType, ServerEventMessages>;
declare abstract class BaseServer {
    #private;
    protected eventDispatcher: ServerEventDispatcher;
    get addEventListener(): <T extends "clientConnected" | "clientDisconnected">(type: T, listener: (event: {
        type: T;
        target: BaseServer;
        message: ServerEventMessages[T];
    }) => void, options?: {
        once: boolean;
    }) => void;
    protected get dispatchEvent(): <T extends "clientConnected" | "clientDisconnected">(type: T, message: ServerEventMessages[T]) => void;
    get removeEventListener(): <T extends "clientConnected" | "clientDisconnected">(type: T, listener: (event: {
        type: T;
        target: BaseServer;
        message: ServerEventMessages[T];
    }) => void) => void;
    get waitForEvent(): <T extends "clientConnected" | "clientDisconnected">(type: T) => Promise<{
        type: T;
        target: BaseServer;
        message: ServerEventMessages[T];
    }>;
    constructor();
    get numberOfClients(): number;
    static get ClearSensorConfigurationsWhenNoClients(): boolean;
    static set ClearSensorConfigurationsWhenNoClients(newValue: boolean);
    get clearSensorConfigurationsWhenNoClients(): boolean;
    set clearSensorConfigurationsWhenNoClients(newValue: boolean);
    broadcastMessage(message: ArrayBuffer): void;
    parseClientMessage(dataView: DataView): ArrayBuffer | undefined;
    protected parseClientDeviceMessage(device: Device, dataView: DataView): ArrayBuffer | undefined;
}

interface WebSocketServer extends ws.WebSocketServer {
}
declare class WebSocketServer extends BaseServer {
    #private;
    get numberOfClients(): number;
    get server(): WebSocketServer | undefined;
    set server(newServer: WebSocketServer | undefined);
    broadcastMessage(message: ArrayBuffer): void;
}

interface DevicePairPressureData {
    rawSum: number;
    normalizedSum: number;
    center?: CenterOfPressure;
    normalizedCenter?: CenterOfPressure;
}
interface DevicePairPressureDataEventMessage {
    pressure: DevicePairPressureData;
}
interface DevicePairPressureDataEventMessages {
    pressure: DevicePairPressureDataEventMessage;
}

type DevicePairSensorDataTimestamps = {
    [insoleSide in InsoleSide]: number;
};
interface BaseDevicePairSensorDataEventMessage {
    timestamps: DevicePairSensorDataTimestamps;
}
type BaseDevicePairSensorDataEventMessages = DevicePairPressureDataEventMessages;
type _DevicePairSensorDataEventMessages = ExtendInterfaceValues<AddKeysAsPropertyToInterface<BaseDevicePairSensorDataEventMessages, "sensorType">, BaseDevicePairSensorDataEventMessage>;
type DevicePairSensorDataEventMessage = ValueOf<_DevicePairSensorDataEventMessages>;
interface AnyDevicePairSensorDataEventMessages {
    sensorData: DevicePairSensorDataEventMessage;
}
type DevicePairSensorDataEventMessages = _DevicePairSensorDataEventMessages & AnyDevicePairSensorDataEventMessages;

interface BaseDevicePairDeviceEventMessage {
    device: Device;
    side: InsoleSide;
}
type DevicePairDeviceEventMessages = ExtendInterfaceValues<AddPrefixToInterfaceKeys<DeviceEventMessages, "device">, BaseDevicePairDeviceEventMessage>;
interface DevicePairConnectionEventMessages {
    isConnected: {
        isConnected: boolean;
    };
}
type DevicePairEventMessages = DevicePairConnectionEventMessages & DevicePairSensorDataEventMessages & DevicePairDeviceEventMessages;
declare class DevicePair {
    #private;
    constructor();
    get addEventListener(): <T extends "pressure" | "deviceOrientation" | "sensorData" | "isConnected" | "deviceIsConnected" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "devicePressure" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "deviceBarometer" | "deviceSensorData" | "deviceGetSensorConfiguration" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceManufacturerName" | "deviceModelNumber" | "deviceSoftwareRevision" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceDeviceInformation" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceBatteryLevel" | "deviceSmp" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus" | "deviceConnectionStatus" | "deviceConnectionMessage">(type: T, listener: (event: {
        type: T;
        target: DevicePair;
        message: DevicePairEventMessages[T];
    }) => void, options?: {
        once: boolean;
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

declare const ServerMessageTypes: readonly ["ping", "pong", "isScanningAvailable", "isScanning", "startScan", "stopScan", "discoveredDevice", "discoveredDevices", "expiredDiscoveredDevice", "connectToDevice", "disconnectFromDevice", "connectedDevices", "deviceMessage"];
type ServerMessageType = (typeof ServerMessageTypes)[number];
type MessageLike = number | number[] | ArrayBufferLike | DataView | boolean | string | any;
interface Message<MessageType extends string> {
    type: MessageType;
    data?: MessageLike | MessageLike[];
}
type ServerMessage = ServerMessageType | Message<ServerMessageType>;
type ClientDeviceMessage = ConnectionMessageType | Message<ConnectionMessageType>;

declare class Timer {
    #private;
    get callback(): Function;
    set callback(newCallback: Function);
    get interval(): number;
    set interval(newInterval: number);
    constructor(callback: Function, interval: number);
    get isRunning(): boolean;
    start(): void;
    stop(): void;
    restart(): void;
}

declare const ClientConnectionStatuses: readonly ["not connected", "connecting", "connected", "disconnecting"];
type ClientConnectionStatus = (typeof ClientConnectionStatuses)[number];
interface ClientConnectionEventMessages {
    connectionStatus: {
        connectionStatus: ClientConnectionStatus;
    };
    isConnected: {
        isConnected: boolean;
    };
}
type ClientEventMessages = ClientConnectionEventMessages & ScannerEventMessages;
type ServerURL = string | URL;
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

declare class WebSocketClient extends BaseClient {
    #private;
    get webSocket(): WebSocket | undefined;
    set webSocket(newWebSocket: WebSocket | undefined);
    get readyState(): number | undefined;
    get isConnected(): boolean;
    get isDisconnected(): boolean;
    connect(url?: string | URL): void;
    disconnect(): void;
    reconnect(): void;
    toggleConnection(url?: ServerURL): void;
    sendMessage(message: MessageLike): void;
    createDevice(bluetoothId: string): Device;
}

export { type ContinuousSensorType, ContinuousSensorTypes, Device, type DeviceInformation, DevicePair, type DeviceType, DeviceTypes, environment_d as Environment, type FileType, FileTypes, scanner as Scanner, type SensorType, SensorTypes, type TfliteSensorType, TfliteSensorTypes, type VibrationConfiguration, type VibrationLocation, VibrationLocations, type VibrationType, VibrationTypes, type VibrationWaveformEffect, VibrationWaveformEffects, WebSocketClient, WebSocketServer, setAllConsoleLevelFlags, setConsoleLevelFlagsForType };