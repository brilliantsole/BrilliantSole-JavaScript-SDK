import * as ws from 'ws';
import * as dgram from 'dgram';

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

declare class RangeHelper {
    #private;
    get min(): number;
    get max(): number;
    set min(newMin: number);
    set max(newMax: number);
    reset(): void;
    update(value: number): void;
    getNormalization(value: number, weightByRange: boolean): number;
    updateAndGetNormalization(value: number, weightByRange: boolean): number;
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
declare const DefaultNumberOfPressureSensors = 8;

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

type EventMap<Target extends any, EventType extends string, EventMessages extends Partial<Record<EventType, any>>> = {
    [T in keyof EventMessages]: {
        type: T;
        target: Target;
        message: EventMessages[T];
    };
};
type EventListenerMap<Target extends any, EventType extends string, EventMessages extends Partial<Record<EventType, any>>> = {
    [T in keyof EventMessages]: (event: {
        type: T;
        target: Target;
        message: EventMessages[T];
    }) => void;
};
type Event<Target extends any, EventType extends string, EventMessages extends Partial<Record<EventType, any>>> = EventMap<Target, EventType, EventMessages>[keyof EventMessages];
type SpecificEvent<Target extends any, EventType extends string, EventMessages extends Partial<Record<EventType, any>>, SpecificEventType extends EventType> = {
    type: SpecificEventType;
    target: Target;
    message: EventMessages[SpecificEventType];
};
type BoundEventListeners<Target extends any, EventType extends string, EventMessages extends Partial<Record<EventType, any>>> = {
    [SpecificEventType in keyof EventMessages]?: (event: SpecificEvent<Target, EventType, EventMessages, SpecificEventType>) => void;
};
declare class EventDispatcher<Target extends any, EventType extends string, EventMessages extends Partial<Record<EventType, any>>> {
    private target;
    private validEventTypes;
    private listeners;
    constructor(target: Target, validEventTypes: readonly EventType[]);
    private isValidEventType;
    private updateEventListeners;
    addEventListener<T extends EventType>(type: T, listener: (event: {
        type: T;
        target: Target;
        message: EventMessages[T];
    }) => void, options?: {
        once?: boolean;
    }): void;
    removeEventListener<T extends EventType>(type: T, listener: (event: {
        type: T;
        target: Target;
        message: EventMessages[T];
    }) => void): void;
    removeEventListeners<T extends EventType>(type: T): void;
    removeAllEventListeners(): void;
    dispatchEvent<T extends EventType>(type: T, message: EventMessages[T]): void;
    waitForEvent<T extends EventType>(type: T): Promise<{
        type: T;
        target: Target;
        message: EventMessages[T];
    }>;
}

declare const DisplayTypes: readonly ["none", "generic", "monocularLeft", "monocularRight", "binocular"];
type DisplayType = (typeof DisplayTypes)[number];
declare const DisplayPixelDepths: readonly ["1", "2", "4"];
type DisplayPixelDepth = (typeof DisplayPixelDepths)[number];
declare const DisplayBrightnesses: readonly ["veryLow", "low", "medium", "high", "veryHigh"];
type DisplayBrightness = (typeof DisplayBrightnesses)[number];
declare const DisplaySegmentCaps: readonly ["flat", "round"];
type DisplaySegmentCap = (typeof DisplaySegmentCaps)[number];
type DisplaySize = {
    width: number;
    height: number;
};
type DisplayInformation = {
    type: DisplayType;
    width: number;
    height: number;
    pixelDepth: DisplayPixelDepth;
};
type DisplayColorRGB = {
    r: number;
    g: number;
    b: number;
};
type DisplayContextState = {
    fillColorIndex: number;
    lineColorIndex: number;
    lineWidth: number;
    rotation: number;
    segmentStartCap: DisplaySegmentCap;
    segmentEndCap: DisplaySegmentCap;
    segmentStartRadius: number;
    segmentEndRadius: number;
    cropTop: number;
    cropRight: number;
    cropBottom: number;
    cropLeft: number;
    rotationCropTop: number;
    rotationCropRight: number;
    rotationCropBottom: number;
    rotationCropLeft: number;
};
type PartialDisplayContextState = Partial<DisplayContextState>;

declare const DisplayCropDirections: readonly ["top", "right", "bottom", "left"];
type DisplayCropDirection = (typeof DisplayCropDirections)[number];

declare const MicrophoneCommands: readonly ["start", "stop", "vad"];
type MicrophoneCommand = (typeof MicrophoneCommands)[number];
declare const MicrophoneStatuses: readonly ["idle", "streaming", "vad"];
type MicrophoneStatus = (typeof MicrophoneStatuses)[number];
declare const MicrophoneConfigurationTypes: readonly ["sampleRate", "bitDepth"];
type MicrophoneConfigurationType = (typeof MicrophoneConfigurationTypes)[number];
declare const MicrophoneSampleRates: readonly ["8000", "16000"];
type MicrophoneSampleRate = (typeof MicrophoneSampleRates)[number];
declare const MicrophoneBitDepths: readonly ["8", "16"];
type MicrophoneBitDepth = (typeof MicrophoneBitDepths)[number];
type MicrophoneConfiguration = {
    sampleRate?: MicrophoneSampleRate;
    bitDepth?: MicrophoneBitDepth;
};
declare const MicrophoneConfigurationValues: {
    sampleRate: readonly ["8000", "16000"];
    bitDepth: readonly ["8", "16"];
};
interface MicrophoneEventMessages {
    microphoneStatus: {
        microphoneStatus: MicrophoneStatus;
        previousMicrophoneStatus: MicrophoneStatus;
    };
    getMicrophoneConfiguration: {
        microphoneConfiguration: MicrophoneConfiguration;
    };
    microphoneData: {
        samples: Float32Array;
        sampleRate: MicrophoneSampleRate;
        bitDepth: MicrophoneBitDepth;
    };
    isRecordingMicrophone: {
        isRecordingMicrophone: boolean;
    };
    microphoneRecording: {
        samples: Float32Array;
        sampleRate: MicrophoneSampleRate;
        bitDepth: MicrophoneBitDepth;
        blob: Blob;
        url: string;
    };
}

declare const CameraCommands: readonly ["focus", "takePicture", "stop", "sleep", "wake"];
type CameraCommand = (typeof CameraCommands)[number];
declare const CameraStatuses: readonly ["idle", "focusing", "takingPicture", "asleep"];
type CameraStatus = (typeof CameraStatuses)[number];
declare const CameraDataTypes: readonly ["headerSize", "header", "imageSize", "image", "footerSize", "footer"];
type CameraDataType = (typeof CameraDataTypes)[number];
declare const CameraConfigurationTypes: readonly ["resolution", "qualityFactor", "shutter", "gain", "redGain", "greenGain", "blueGain"];
type CameraConfigurationType = (typeof CameraConfigurationTypes)[number];
type CameraConfiguration = {
    [cameraConfigurationType in CameraConfigurationType]?: number;
};
type CameraConfigurationRanges = {
    [cameraConfigurationType in CameraConfigurationType]: {
        min: number;
        max: number;
    };
};
interface CameraEventMessages {
    cameraStatus: {
        cameraStatus: CameraStatus;
        previousCameraStatus: CameraStatus;
    };
    getCameraConfiguration: {
        cameraConfiguration: CameraConfiguration;
    };
    cameraImageProgress: {
        progress: number;
        type: CameraDataType;
    };
    cameraImage: {
        blob: Blob;
        url: string;
    };
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
        magnetometer: Vector3;
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
    tapDetector: {
        tapDetector: Object;
    };
}

interface BarometerSensorDataEventMessages {
    barometer: {
        barometer: number;
    };
}

declare const SensorTypes: readonly ["pressure", "acceleration", "gravity", "linearAcceleration", "gyroscope", "magnetometer", "gameRotation", "rotation", "orientation", "activity", "stepCounter", "stepDetector", "deviceOrientation", "tapDetector", "barometer", "camera", "microphone"];
type SensorType = (typeof SensorTypes)[number];
declare const ContinuousSensorTypes: readonly ["pressure", "acceleration", "gravity", "linearAcceleration", "gyroscope", "magnetometer", "gameRotation", "rotation", "orientation", "barometer"];
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

declare const FileTypes: readonly ["tflite", "wifiServerCert", "wifiServerKey"];
type FileType = (typeof FileTypes)[number];
declare const FileTransferStatuses: readonly ["idle", "sending", "receiving"];
type FileTransferStatus = (typeof FileTransferStatuses)[number];
declare const FileTransferDirections: readonly ["sending", "receiving"];
type FileTransferDirection = (typeof FileTransferDirections)[number];
interface FileConfiguration {
    file: FileLike;
    type: FileType;
}
interface FileTransferEventMessages {
    getFileTypes: {
        fileTypes: FileType[];
    };
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
    maxValue?: number;
    maxIndex?: number;
    maxClass?: string;
    classValues?: {
        [key: string]: number;
    };
}
declare const TfliteSensorTypes: readonly ["pressure", "linearAcceleration", "gyroscope", "magnetometer"];
type TfliteSensorType = (typeof TfliteSensorTypes)[number];
interface TfliteFileConfiguration extends FileConfiguration {
    type: "tflite";
    name: string;
    sensorTypes: TfliteSensorType[];
    task: TfliteTask;
    sampleRate: number;
    captureDelay?: number;
    threshold?: number;
    classes?: string[];
}

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

declare const ConnectionTypes: readonly ["webBluetooth", "noble", "client", "webSocket", "udp"];
type ConnectionType = (typeof ConnectionTypes)[number];
interface BaseConnectOptions {
    type: "client" | "webBluetooth" | "webSocket" | "udp";
}
interface WebBluetoothConnectOptions extends BaseConnectOptions {
    type: "webBluetooth";
}
interface BaseWifiConnectOptions extends BaseConnectOptions {
    ipAddress: string;
}
interface ClientConnectOptions extends BaseConnectOptions {
    type: "client";
    subType?: "noble" | "webSocket" | "udp";
}
interface WebSocketConnectOptions extends BaseWifiConnectOptions {
    type: "webSocket";
    isWifiSecure?: boolean;
}
interface UDPConnectOptions extends BaseWifiConnectOptions {
    type: "udp";
    receivePort?: number;
}
type ConnectOptions = WebBluetoothConnectOptions | WebSocketConnectOptions | UDPConnectOptions | ClientConnectOptions;
declare const ConnectionStatuses: readonly ["notConnected", "connecting", "connected", "disconnecting"];
type ConnectionStatus = (typeof ConnectionStatuses)[number];
interface ConnectionStatusEventMessages {
    notConnected: any;
    connecting: any;
    connected: any;
    disconnecting: any;
    connectionStatus: {
        connectionStatus: ConnectionStatus;
    };
    isConnected: {
        isConnected: boolean;
    };
}
interface TxMessage {
    type: TxRxMessageType;
    data?: ArrayBuffer;
}
declare const TxRxMessageTypes: readonly ["isCharging", "getBatteryCurrent", "getMtu", "getId", "getName", "setName", "getType", "setType", "getCurrentTime", "setCurrentTime", "getSensorConfiguration", "setSensorConfiguration", "getPressurePositions", "getSensorScalars", "sensorData", "getVibrationLocations", "triggerVibration", "getFileTypes", "maxFileLength", "getFileType", "setFileType", "getFileLength", "setFileLength", "getFileChecksum", "setFileChecksum", "setFileTransferCommand", "fileTransferStatus", "getFileBlock", "setFileBlock", "fileBytesTransferred", "getTfliteName", "setTfliteName", "getTfliteTask", "setTfliteTask", "getTfliteSampleRate", "setTfliteSampleRate", "getTfliteSensorTypes", "setTfliteSensorTypes", "tfliteIsReady", "getTfliteCaptureDelay", "setTfliteCaptureDelay", "getTfliteThreshold", "setTfliteThreshold", "getTfliteInferencingEnabled", "setTfliteInferencingEnabled", "tfliteInference", "isWifiAvailable", "getWifiSSID", "setWifiSSID", "getWifiPassword", "setWifiPassword", "getWifiConnectionEnabled", "setWifiConnectionEnabled", "isWifiConnected", "ipAddress", "isWifiSecure", "cameraStatus", "cameraCommand", "getCameraConfiguration", "setCameraConfiguration", "cameraData", "microphoneStatus", "microphoneCommand", "getMicrophoneConfiguration", "setMicrophoneConfiguration", "microphoneData", "isDisplayAvailable", "displayStatus", "displayInformation", "displayCommand", "getDisplayBrightness", "setDisplayBrightness", "displayContextCommands"];
type TxRxMessageType = (typeof TxRxMessageTypes)[number];
declare const ConnectionMessageTypes: readonly ["batteryLevel", "manufacturerName", "modelNumber", "hardwareRevision", "firmwareRevision", "softwareRevision", "pnpId", "serialNumber", "rx", "tx", "isCharging", "getBatteryCurrent", "getMtu", "getId", "getName", "setName", "getType", "setType", "getCurrentTime", "setCurrentTime", "getSensorConfiguration", "setSensorConfiguration", "getPressurePositions", "getSensorScalars", "sensorData", "getVibrationLocations", "triggerVibration", "getFileTypes", "maxFileLength", "getFileType", "setFileType", "getFileLength", "setFileLength", "getFileChecksum", "setFileChecksum", "setFileTransferCommand", "fileTransferStatus", "getFileBlock", "setFileBlock", "fileBytesTransferred", "getTfliteName", "setTfliteName", "getTfliteTask", "setTfliteTask", "getTfliteSampleRate", "setTfliteSampleRate", "getTfliteSensorTypes", "setTfliteSensorTypes", "tfliteIsReady", "getTfliteCaptureDelay", "setTfliteCaptureDelay", "getTfliteThreshold", "setTfliteThreshold", "getTfliteInferencingEnabled", "setTfliteInferencingEnabled", "tfliteInference", "isWifiAvailable", "getWifiSSID", "setWifiSSID", "getWifiPassword", "setWifiPassword", "getWifiConnectionEnabled", "setWifiConnectionEnabled", "isWifiConnected", "ipAddress", "isWifiSecure", "cameraStatus", "cameraCommand", "getCameraConfiguration", "setCameraConfiguration", "cameraData", "microphoneStatus", "microphoneCommand", "getMicrophoneConfiguration", "setMicrophoneConfiguration", "microphoneData", "isDisplayAvailable", "displayStatus", "displayInformation", "displayCommand", "getDisplayBrightness", "setDisplayBrightness", "displayContextCommands", "smp"];
type ConnectionMessageType = (typeof ConnectionMessageTypes)[number];
type ConnectionStatusCallback = (status: ConnectionStatus) => void;
type MessageReceivedCallback = (messageType: ConnectionMessageType, dataView: DataView) => void;
type MessagesReceivedCallback = () => void;
declare abstract class BaseConnectionManager {
    #private;
    abstract get bluetoothId(): string;
    onStatusUpdated?: ConnectionStatusCallback;
    onMessageReceived?: MessageReceivedCallback;
    onMessagesReceived?: MessagesReceivedCallback;
    protected get baseConstructor(): typeof BaseConnectionManager;
    static get isSupported(): boolean;
    get isSupported(): boolean;
    get canUpdateFirmware(): boolean;
    static type: ConnectionType;
    get type(): ConnectionType;
    constructor();
    get status(): "notConnected" | "connecting" | "connected" | "disconnecting";
    protected set status(newConnectionStatus: "notConnected" | "connecting" | "connected" | "disconnecting");
    get isConnected(): boolean;
    get isAvailable(): boolean;
    /** @throws {Error} if connected */
    protected assertIsNotConnected(): void;
    /** @throws {Error} if not connected */
    protected assertIsConnected(): void;
    /** @throws {Error} if not connected or is disconnecting */
    assertIsConnectedAndNotDisconnecting(): void;
    connect(): Promise<void>;
    get canReconnect(): boolean;
    reconnect(): Promise<void>;
    disconnect(): Promise<void>;
    sendSmpMessage(data: ArrayBuffer): Promise<void>;
    sendTxMessages(messages: TxMessage[] | undefined, sendImmediately?: boolean): Promise<void>;
    protected defaultMtu: number;
    mtu?: number;
    sendTxData(data: ArrayBuffer): Promise<void>;
    parseRxMessage(dataView: DataView): void;
    clear(): void;
    remove(): void;
}

type SensorConfiguration = {
    [sensorType in SensorType]?: number;
};
declare const MaxSensorRate: number;
declare const SensorRateStep = 5;
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
declare const MaxNumberOfVibrationWaveformEffectSegments = 8;
declare const MaxVibrationWaveformSegmentDuration = 2550;
declare const MaxVibrationWaveformEffectSegmentDelay = 1270;
declare const MaxVibrationWaveformEffectSegmentLoopCount = 3;
declare const MaxNumberOfVibrationWaveformSegments = 20;
declare const MaxVibrationWaveformEffectSequenceLoopCount = 6;
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

declare const DeviceTypes: readonly ["leftInsole", "rightInsole", "leftGlove", "rightGlove", "glasses", "generic"];
type DeviceType = (typeof DeviceTypes)[number];
declare const Sides: readonly ["left", "right"];
type Side = (typeof Sides)[number];
declare const MinNameLength = 2;
declare const MaxNameLength = 30;
declare const InformationMessageTypes: readonly ["isCharging", "getBatteryCurrent", "getMtu", "getId", "getName", "setName", "getType", "setType", "getCurrentTime", "setCurrentTime"];
type InformationMessageType = (typeof InformationMessageTypes)[number];
declare const InformationEventTypes: readonly ["isCharging", "getBatteryCurrent", "getMtu", "getId", "getName", "setName", "getType", "setType", "getCurrentTime", "setCurrentTime"];
type InformationEventType = (typeof InformationEventTypes)[number];
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
type InformationEventDispatcher = EventDispatcher<Device, InformationEventType, InformationEventMessages>;
type SendInformationMessageCallback = SendMessageCallback<InformationMessageType>;
declare class InformationManager {
    #private;
    constructor();
    sendMessage: SendInformationMessageCallback;
    eventDispatcher: InformationEventDispatcher;
    get waitForEvent(): <T extends "isCharging" | "getBatteryCurrent" | "getMtu" | "getId" | "getName" | "setName" | "getType" | "setType" | "getCurrentTime" | "setCurrentTime">(type: T) => Promise<{
        type: T;
        target: Device;
        message: InformationEventMessages[T];
    }>;
    get isCharging(): boolean;
    get batteryCurrent(): number;
    getBatteryCurrent(): Promise<void>;
    get id(): string;
    get name(): string;
    updateName(updatedName: string): void;
    setName(newName: string): Promise<void>;
    get type(): "generic" | "leftInsole" | "rightInsole" | "leftGlove" | "rightGlove" | "glasses";
    get typeEnum(): number;
    updateType(updatedType: DeviceType): void;
    setType(newType: DeviceType): Promise<void>;
    get isInsole(): boolean;
    get isGlove(): boolean;
    get side(): Side;
    get mtu(): number;
    get isCurrentTimeSet(): boolean;
    parseMessage(messageType: InformationMessageType, dataView: DataView): void;
    clear(): void;
    connectionType?: ConnectionType;
}

declare const MinWifiSSIDLength = 1;
declare const MaxWifiSSIDLength = 32;
declare const MinWifiPasswordLength = 8;
declare const MaxWifiPasswordLength = 64;
interface WifiEventMessages {
    isWifiAvailable: {
        isWifiAvailable: boolean;
    };
    getWifiSSID: {
        wifiSSID: string;
    };
    getWifiPassword: {
        wifiPassword: string;
    };
    getEnableWifiConnection: {
        wifiConnectionEnabled: boolean;
    };
    isWifiConnected: {
        isWifiConnected: boolean;
    };
    ipAddress: {
        ipAddress?: string;
    };
}

declare const DeviceEventTypes: readonly ["connectionMessage", "notConnected", "connecting", "connected", "disconnecting", "connectionStatus", "isConnected", "rx", "tx", "batteryLevel", "isCharging", "getBatteryCurrent", "getMtu", "getId", "getName", "setName", "getType", "setType", "getCurrentTime", "setCurrentTime", "manufacturerName", "modelNumber", "hardwareRevision", "firmwareRevision", "softwareRevision", "pnpId", "serialNumber", "deviceInformation", "getSensorConfiguration", "setSensorConfiguration", "getPressurePositions", "getSensorScalars", "sensorData", "pressure", "acceleration", "gravity", "linearAcceleration", "gyroscope", "magnetometer", "gameRotation", "rotation", "orientation", "activity", "stepCounter", "stepDetector", "deviceOrientation", "tapDetector", "barometer", "camera", "microphone", "getVibrationLocations", "triggerVibration", "getFileTypes", "maxFileLength", "getFileType", "setFileType", "getFileLength", "setFileLength", "getFileChecksum", "setFileChecksum", "setFileTransferCommand", "fileTransferStatus", "getFileBlock", "setFileBlock", "fileBytesTransferred", "fileTransferProgress", "fileTransferComplete", "fileReceived", "getTfliteName", "setTfliteName", "getTfliteTask", "setTfliteTask", "getTfliteSampleRate", "setTfliteSampleRate", "getTfliteSensorTypes", "setTfliteSensorTypes", "tfliteIsReady", "getTfliteCaptureDelay", "setTfliteCaptureDelay", "getTfliteThreshold", "setTfliteThreshold", "getTfliteInferencingEnabled", "setTfliteInferencingEnabled", "tfliteInference", "isWifiAvailable", "getWifiSSID", "setWifiSSID", "getWifiPassword", "setWifiPassword", "getWifiConnectionEnabled", "setWifiConnectionEnabled", "isWifiConnected", "ipAddress", "isWifiSecure", "cameraStatus", "cameraCommand", "getCameraConfiguration", "setCameraConfiguration", "cameraData", "cameraImageProgress", "cameraImage", "microphoneStatus", "microphoneCommand", "getMicrophoneConfiguration", "setMicrophoneConfiguration", "microphoneData", "isRecordingMicrophone", "microphoneRecording", "isDisplayAvailable", "displayStatus", "displayInformation", "displayCommand", "getDisplayBrightness", "setDisplayBrightness", "displayContextCommands", "displayContextState", "displayColor", "displayColorOpacity", "displayOpacity", "smp", "firmwareImages", "firmwareUploadProgress", "firmwareStatus", "firmwareUploadComplete"];
type DeviceEventType = (typeof DeviceEventTypes)[number];
interface DeviceEventMessages extends ConnectionStatusEventMessages, DeviceInformationEventMessages, InformationEventMessages, SensorDataEventMessages, SensorConfigurationEventMessages, TfliteEventMessages, FileTransferEventMessages, WifiEventMessages, CameraEventMessages, MicrophoneEventMessages, FirmwareEventMessages {
    batteryLevel: {
        batteryLevel: number;
    };
    connectionMessage: {
        messageType: ConnectionMessageType;
        dataView: DataView;
    };
}
type SendMessageCallback<MessageType extends string> = (messages?: {
    type: MessageType;
    data?: ArrayBuffer;
}[], sendImmediately?: boolean) => Promise<void>;
type DeviceEvent = Event<Device, DeviceEventType, DeviceEventMessages>;
type DeviceEventMap = EventMap<Device, DeviceEventType, DeviceEventMessages>;
type DeviceEventListenerMap = EventListenerMap<Device, DeviceEventType, DeviceEventMessages>;
type BoundDeviceEventListeners = BoundEventListeners<Device, DeviceEventType, DeviceEventMessages>;
declare class Device {
    #private;
    get bluetoothId(): string | undefined;
    get isAvailable(): boolean | undefined;
    constructor();
    get addEventListener(): <T extends "isDisplayAvailable" | "displayStatus" | "displayInformation" | "displayCommand" | "getDisplayBrightness" | "setDisplayBrightness" | "displayContextCommands" | "displayContextState" | "displayColor" | "displayColorOpacity" | "displayOpacity" | "connectionMessage" | "notConnected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isConnected" | "rx" | "tx" | "batteryLevel" | "isCharging" | "getBatteryCurrent" | "getMtu" | "getId" | "getName" | "setName" | "getType" | "setType" | "getCurrentTime" | "setCurrentTime" | "manufacturerName" | "modelNumber" | "hardwareRevision" | "firmwareRevision" | "softwareRevision" | "pnpId" | "serialNumber" | "deviceInformation" | "getSensorConfiguration" | "setSensorConfiguration" | "getPressurePositions" | "getSensorScalars" | "sensorData" | "pressure" | "acceleration" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation" | "orientation" | "activity" | "stepCounter" | "stepDetector" | "deviceOrientation" | "tapDetector" | "barometer" | "camera" | "microphone" | "getVibrationLocations" | "triggerVibration" | "getFileTypes" | "maxFileLength" | "getFileType" | "setFileType" | "getFileLength" | "setFileLength" | "getFileChecksum" | "setFileChecksum" | "setFileTransferCommand" | "fileTransferStatus" | "getFileBlock" | "setFileBlock" | "fileBytesTransferred" | "fileTransferProgress" | "fileTransferComplete" | "fileReceived" | "getTfliteName" | "setTfliteName" | "getTfliteTask" | "setTfliteTask" | "getTfliteSampleRate" | "setTfliteSampleRate" | "getTfliteSensorTypes" | "setTfliteSensorTypes" | "tfliteIsReady" | "getTfliteCaptureDelay" | "setTfliteCaptureDelay" | "getTfliteThreshold" | "setTfliteThreshold" | "getTfliteInferencingEnabled" | "setTfliteInferencingEnabled" | "tfliteInference" | "isWifiAvailable" | "getWifiSSID" | "setWifiSSID" | "getWifiPassword" | "setWifiPassword" | "getWifiConnectionEnabled" | "setWifiConnectionEnabled" | "isWifiConnected" | "ipAddress" | "isWifiSecure" | "cameraStatus" | "cameraCommand" | "getCameraConfiguration" | "setCameraConfiguration" | "cameraData" | "cameraImageProgress" | "cameraImage" | "microphoneStatus" | "microphoneCommand" | "getMicrophoneConfiguration" | "setMicrophoneConfiguration" | "microphoneData" | "isRecordingMicrophone" | "microphoneRecording" | "smp" | "firmwareImages" | "firmwareUploadProgress" | "firmwareStatus" | "firmwareUploadComplete">(type: T, listener: (event: {
        type: T;
        target: Device;
        message: DeviceEventMessages[T];
    }) => void, options?: {
        once?: boolean;
    }) => void;
    get removeEventListener(): <T extends "isDisplayAvailable" | "displayStatus" | "displayInformation" | "displayCommand" | "getDisplayBrightness" | "setDisplayBrightness" | "displayContextCommands" | "displayContextState" | "displayColor" | "displayColorOpacity" | "displayOpacity" | "connectionMessage" | "notConnected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isConnected" | "rx" | "tx" | "batteryLevel" | "isCharging" | "getBatteryCurrent" | "getMtu" | "getId" | "getName" | "setName" | "getType" | "setType" | "getCurrentTime" | "setCurrentTime" | "manufacturerName" | "modelNumber" | "hardwareRevision" | "firmwareRevision" | "softwareRevision" | "pnpId" | "serialNumber" | "deviceInformation" | "getSensorConfiguration" | "setSensorConfiguration" | "getPressurePositions" | "getSensorScalars" | "sensorData" | "pressure" | "acceleration" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation" | "orientation" | "activity" | "stepCounter" | "stepDetector" | "deviceOrientation" | "tapDetector" | "barometer" | "camera" | "microphone" | "getVibrationLocations" | "triggerVibration" | "getFileTypes" | "maxFileLength" | "getFileType" | "setFileType" | "getFileLength" | "setFileLength" | "getFileChecksum" | "setFileChecksum" | "setFileTransferCommand" | "fileTransferStatus" | "getFileBlock" | "setFileBlock" | "fileBytesTransferred" | "fileTransferProgress" | "fileTransferComplete" | "fileReceived" | "getTfliteName" | "setTfliteName" | "getTfliteTask" | "setTfliteTask" | "getTfliteSampleRate" | "setTfliteSampleRate" | "getTfliteSensorTypes" | "setTfliteSensorTypes" | "tfliteIsReady" | "getTfliteCaptureDelay" | "setTfliteCaptureDelay" | "getTfliteThreshold" | "setTfliteThreshold" | "getTfliteInferencingEnabled" | "setTfliteInferencingEnabled" | "tfliteInference" | "isWifiAvailable" | "getWifiSSID" | "setWifiSSID" | "getWifiPassword" | "setWifiPassword" | "getWifiConnectionEnabled" | "setWifiConnectionEnabled" | "isWifiConnected" | "ipAddress" | "isWifiSecure" | "cameraStatus" | "cameraCommand" | "getCameraConfiguration" | "setCameraConfiguration" | "cameraData" | "cameraImageProgress" | "cameraImage" | "microphoneStatus" | "microphoneCommand" | "getMicrophoneConfiguration" | "setMicrophoneConfiguration" | "microphoneData" | "isRecordingMicrophone" | "microphoneRecording" | "smp" | "firmwareImages" | "firmwareUploadProgress" | "firmwareStatus" | "firmwareUploadComplete">(type: T, listener: (event: {
        type: T;
        target: Device;
        message: DeviceEventMessages[T];
    }) => void) => void;
    get waitForEvent(): <T extends "isDisplayAvailable" | "displayStatus" | "displayInformation" | "displayCommand" | "getDisplayBrightness" | "setDisplayBrightness" | "displayContextCommands" | "displayContextState" | "displayColor" | "displayColorOpacity" | "displayOpacity" | "connectionMessage" | "notConnected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isConnected" | "rx" | "tx" | "batteryLevel" | "isCharging" | "getBatteryCurrent" | "getMtu" | "getId" | "getName" | "setName" | "getType" | "setType" | "getCurrentTime" | "setCurrentTime" | "manufacturerName" | "modelNumber" | "hardwareRevision" | "firmwareRevision" | "softwareRevision" | "pnpId" | "serialNumber" | "deviceInformation" | "getSensorConfiguration" | "setSensorConfiguration" | "getPressurePositions" | "getSensorScalars" | "sensorData" | "pressure" | "acceleration" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation" | "orientation" | "activity" | "stepCounter" | "stepDetector" | "deviceOrientation" | "tapDetector" | "barometer" | "camera" | "microphone" | "getVibrationLocations" | "triggerVibration" | "getFileTypes" | "maxFileLength" | "getFileType" | "setFileType" | "getFileLength" | "setFileLength" | "getFileChecksum" | "setFileChecksum" | "setFileTransferCommand" | "fileTransferStatus" | "getFileBlock" | "setFileBlock" | "fileBytesTransferred" | "fileTransferProgress" | "fileTransferComplete" | "fileReceived" | "getTfliteName" | "setTfliteName" | "getTfliteTask" | "setTfliteTask" | "getTfliteSampleRate" | "setTfliteSampleRate" | "getTfliteSensorTypes" | "setTfliteSensorTypes" | "tfliteIsReady" | "getTfliteCaptureDelay" | "setTfliteCaptureDelay" | "getTfliteThreshold" | "setTfliteThreshold" | "getTfliteInferencingEnabled" | "setTfliteInferencingEnabled" | "tfliteInference" | "isWifiAvailable" | "getWifiSSID" | "setWifiSSID" | "getWifiPassword" | "setWifiPassword" | "getWifiConnectionEnabled" | "setWifiConnectionEnabled" | "isWifiConnected" | "ipAddress" | "isWifiSecure" | "cameraStatus" | "cameraCommand" | "getCameraConfiguration" | "setCameraConfiguration" | "cameraData" | "cameraImageProgress" | "cameraImage" | "microphoneStatus" | "microphoneCommand" | "getMicrophoneConfiguration" | "setMicrophoneConfiguration" | "microphoneData" | "isRecordingMicrophone" | "microphoneRecording" | "smp" | "firmwareImages" | "firmwareUploadProgress" | "firmwareStatus" | "firmwareUploadComplete">(type: T) => Promise<{
        type: T;
        target: Device;
        message: DeviceEventMessages[T];
    }>;
    get removeEventListeners(): <T extends "isDisplayAvailable" | "displayStatus" | "displayInformation" | "displayCommand" | "getDisplayBrightness" | "setDisplayBrightness" | "displayContextCommands" | "displayContextState" | "displayColor" | "displayColorOpacity" | "displayOpacity" | "connectionMessage" | "notConnected" | "connecting" | "connected" | "disconnecting" | "connectionStatus" | "isConnected" | "rx" | "tx" | "batteryLevel" | "isCharging" | "getBatteryCurrent" | "getMtu" | "getId" | "getName" | "setName" | "getType" | "setType" | "getCurrentTime" | "setCurrentTime" | "manufacturerName" | "modelNumber" | "hardwareRevision" | "firmwareRevision" | "softwareRevision" | "pnpId" | "serialNumber" | "deviceInformation" | "getSensorConfiguration" | "setSensorConfiguration" | "getPressurePositions" | "getSensorScalars" | "sensorData" | "pressure" | "acceleration" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation" | "orientation" | "activity" | "stepCounter" | "stepDetector" | "deviceOrientation" | "tapDetector" | "barometer" | "camera" | "microphone" | "getVibrationLocations" | "triggerVibration" | "getFileTypes" | "maxFileLength" | "getFileType" | "setFileType" | "getFileLength" | "setFileLength" | "getFileChecksum" | "setFileChecksum" | "setFileTransferCommand" | "fileTransferStatus" | "getFileBlock" | "setFileBlock" | "fileBytesTransferred" | "fileTransferProgress" | "fileTransferComplete" | "fileReceived" | "getTfliteName" | "setTfliteName" | "getTfliteTask" | "setTfliteTask" | "getTfliteSampleRate" | "setTfliteSampleRate" | "getTfliteSensorTypes" | "setTfliteSensorTypes" | "tfliteIsReady" | "getTfliteCaptureDelay" | "setTfliteCaptureDelay" | "getTfliteThreshold" | "setTfliteThreshold" | "getTfliteInferencingEnabled" | "setTfliteInferencingEnabled" | "tfliteInference" | "isWifiAvailable" | "getWifiSSID" | "setWifiSSID" | "getWifiPassword" | "setWifiPassword" | "getWifiConnectionEnabled" | "setWifiConnectionEnabled" | "isWifiConnected" | "ipAddress" | "isWifiSecure" | "cameraStatus" | "cameraCommand" | "getCameraConfiguration" | "setCameraConfiguration" | "cameraData" | "cameraImageProgress" | "cameraImage" | "microphoneStatus" | "microphoneCommand" | "getMicrophoneConfiguration" | "setMicrophoneConfiguration" | "microphoneData" | "isRecordingMicrophone" | "microphoneRecording" | "smp" | "firmwareImages" | "firmwareUploadProgress" | "firmwareStatus" | "firmwareUploadComplete">(type: T) => void;
    get removeAllEventListeners(): () => void;
    get connectionManager(): BaseConnectionManager | undefined;
    set connectionManager(newConnectionManager: BaseConnectionManager | undefined);
    private sendTxMessages;
    connect(options?: ConnectOptions): Promise<void>;
    get isConnected(): boolean;
    get canReconnect(): boolean | undefined;
    reconnect(): Promise<void | undefined>;
    static Connect(): Promise<Device>;
    static get ReconnectOnDisconnection(): boolean;
    static set ReconnectOnDisconnection(newReconnectOnDisconnection: boolean);
    get reconnectOnDisconnection(): boolean;
    set reconnectOnDisconnection(newReconnectOnDisconnection: boolean);
    get connectionType(): "webBluetooth" | "noble" | "client" | "webSocket" | "udp" | undefined;
    disconnect(): Promise<void>;
    toggleConnection(): void;
    get connectionStatus(): ConnectionStatus;
    get isConnectionBusy(): boolean;
    latestConnectionMessages: Map<ConnectionMessageType, DataView>;
    get deviceInformation(): DeviceInformation;
    get batteryLevel(): number;
    /** @private */
    _informationManager: InformationManager;
    get id(): string;
    get isCharging(): boolean;
    get batteryCurrent(): number;
    get getBatteryCurrent(): () => Promise<void>;
    get name(): string;
    get setName(): (newName: string) => Promise<void>;
    get type(): "generic" | "leftInsole" | "rightInsole" | "leftGlove" | "rightGlove" | "glasses";
    get setType(): (newType: DeviceType) => Promise<void>;
    get isInsole(): boolean;
    get isGlove(): boolean;
    get side(): "left" | "right";
    get mtu(): number;
    get sensorTypes(): SensorType[];
    get continuousSensorTypes(): ("pressure" | "acceleration" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation" | "orientation" | "barometer")[];
    get sensorConfiguration(): SensorConfiguration;
    get setSensorConfiguration(): (newSensorConfiguration: SensorConfiguration, clearRest?: boolean, sendImmediately?: boolean) => Promise<void>;
    clearSensorConfiguration(): Promise<void>;
    static get ClearSensorConfigurationOnLeave(): boolean;
    static set ClearSensorConfigurationOnLeave(newClearSensorConfigurationOnLeave: boolean);
    get clearSensorConfigurationOnLeave(): boolean;
    set clearSensorConfigurationOnLeave(newClearSensorConfigurationOnLeave: boolean);
    get numberOfPressureSensors(): number;
    resetPressureRange(): void;
    get vibrationLocations(): ("front" | "rear")[];
    triggerVibration(vibrationConfigurations: VibrationConfiguration[], sendImmediately?: boolean): Promise<void>;
    get fileTypes(): ("tflite" | "wifiServerCert" | "wifiServerKey")[];
    get maxFileLength(): number;
    get validFileTypes(): ("tflite" | "wifiServerCert" | "wifiServerKey")[];
    sendFile(fileType: FileType, file: FileLike): Promise<void>;
    receiveFile(fileType: FileType): Promise<void>;
    get fileTransferStatus(): "idle" | "sending" | "receiving";
    cancelFileTransfer(): void;
    get tfliteName(): string;
    get setTfliteName(): (newName: string, sendImmediately?: boolean) => Promise<void>;
    sendTfliteConfiguration(configuration: TfliteFileConfiguration): Promise<void>;
    get tfliteTask(): "classification" | "regression";
    get setTfliteTask(): (newTask: TfliteTask, sendImmediately?: boolean) => Promise<void>;
    get tfliteSampleRate(): number;
    get setTfliteSampleRate(): (newSampleRate: number, sendImmediately?: boolean) => Promise<void>;
    get tfliteSensorTypes(): ("pressure" | "linearAcceleration" | "gyroscope" | "magnetometer")[];
    get allowedTfliteSensorTypes(): ("pressure" | "acceleration" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation" | "orientation" | "activity" | "stepCounter" | "stepDetector" | "deviceOrientation" | "tapDetector" | "barometer" | "camera" | "microphone")[];
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
    get canUpdateFirmware(): boolean | undefined;
    private sendSmpMessage;
    get uploadFirmware(): (file: FileLike) => Promise<void>;
    get canReset(): boolean | undefined;
    reset(): Promise<void>;
    get firmwareStatus(): "idle" | "uploading" | "uploaded" | "pending" | "testing" | "erasing";
    get getFirmwareImages(): () => Promise<void>;
    get firmwareImages(): FirmwareImage[];
    get eraseFirmwareImage(): () => Promise<void>;
    get confirmFirmwareImage(): (imageIndex?: number) => Promise<void>;
    get testFirmwareImage(): (imageIndex?: number) => Promise<void>;
    get isServerSide(): boolean;
    set isServerSide(newIsServerSide: boolean);
    get isUkaton(): boolean;
    get isWifiAvailable(): boolean;
    get wifiSSID(): string;
    setWifiSSID(newWifiSSID: string): Promise<void>;
    get wifiPassword(): string;
    setWifiPassword(newWifiPassword: string): Promise<void>;
    get isWifiConnected(): boolean;
    get ipAddress(): string | undefined;
    get wifiConnectionEnabled(): boolean;
    get enableWifiConnection(): () => Promise<void>;
    get setWifiConnectionEnabled(): (newWifiConnectionEnabled: boolean, sendImmediately?: boolean) => Promise<void>;
    get disableWifiConnection(): () => Promise<void>;
    get toggleWifiConnection(): () => Promise<void>;
    get isWifiSecure(): boolean;
    reconnectViaWebSockets(): Promise<void>;
    reconnectViaUDP(): Promise<void>;
    get hasCamera(): boolean;
    get cameraStatus(): "asleep" | "idle" | "focusing" | "takingPicture";
    takePicture(sensorRate?: number): Promise<void>;
    focusCamera(sensorRate?: number): Promise<void>;
    stopCamera(): Promise<void>;
    wakeCamera(): Promise<void>;
    sleepCamera(): Promise<void>;
    get cameraConfiguration(): CameraConfiguration;
    get availableCameraConfigurationTypes(): ("resolution" | "qualityFactor" | "shutter" | "gain" | "redGain" | "greenGain" | "blueGain")[];
    get cameraConfigurationRanges(): CameraConfigurationRanges;
    get setCameraConfiguration(): (newCameraConfiguration: CameraConfiguration) => Promise<void>;
    get hasMicrophone(): boolean;
    get microphoneStatus(): "idle" | "streaming" | "vad";
    startMicrophone(): Promise<void>;
    stopMicrophone(): Promise<void>;
    enableMicrophoneVad(): Promise<void>;
    toggleMicrophone(): Promise<void>;
    get microphoneConfiguration(): MicrophoneConfiguration;
    get availableMicrophoneConfigurationTypes(): ("sampleRate" | "bitDepth")[];
    get setMicrophoneConfiguration(): (newMicrophoneConfiguration: MicrophoneConfiguration) => Promise<void>;
    get audioContext(): AudioContext | undefined;
    set audioContext(newAudioContext: AudioContext | undefined);
    get microphoneMediaStreamDestination(): MediaStreamAudioDestinationNode;
    get microphoneGainNode(): GainNode;
    get isRecordingMicrophone(): boolean;
    startRecordingMicrophone(): void;
    stopRecordingMicrophone(): void;
    toggleMicrophoneRecording(): void;
    get isDisplayAvailable(): boolean;
    get displayContextState(): DisplayContextState;
    get displayColors(): string[];
    get displayColorOpacities(): number[];
    get displayStatus(): "awake" | "asleep";
    get displayBrightness(): "veryLow" | "low" | "medium" | "high" | "veryHigh";
    get setDisplayBrightness(): (newDisplayBrightness: DisplayBrightness, sendImmediately?: boolean) => Promise<void>;
    get displayInformation(): DisplayInformation | undefined;
    get numberOfDisplayColors(): number;
    get wakeDisplay(): () => Promise<void>;
    get sleepDisplay(): () => Promise<void>;
    get toggleDisplay(): () => Promise<void>;
    get isDisplayAwake(): boolean;
    get showDisplay(): (sendImmediately?: boolean) => Promise<void>;
    get clearDisplay(): (sendImmediately?: boolean) => Promise<void>;
    get setDisplayColor(): (colorIndex: number, color: DisplayColorRGB | string, sendImmediately?: boolean) => Promise<void>;
    get setDisplayColorOpacity(): (colorIndex: number, opacity: number, sendImmediately?: boolean) => Promise<void>;
    get setDisplayOpacity(): (opacity: number, sendImmediately?: boolean) => Promise<void>;
    get saveDisplayContext(): (sendImmediately?: boolean) => Promise<void>;
    get restoreDisplayContext(): (sendImmediately?: boolean) => Promise<void>;
    get clearDisplayRect(): (x: number, y: number, width: number, height: number, sendImmediately?: boolean) => Promise<void>;
    get selectDisplayFillColor(): (fillColorIndex: number, sendImmediately?: boolean) => Promise<void>;
    get selectDisplayLineColor(): (lineColorIndex: number, sendImmediately?: boolean) => Promise<void>;
    get setDisplayLineWidth(): (lineWidth: number, sendImmediately?: boolean) => Promise<void>;
    get setDisplayRotation(): (rotation: number, isRadians?: boolean, sendImmediately?: boolean) => Promise<void>;
    get clearDisplayRotation(): (sendImmediately?: boolean) => Promise<void>;
    get setDisplaySegmentStartCap(): (segmentStartCap: DisplaySegmentCap, sendImmediately?: boolean) => Promise<void>;
    get setDisplaySegmentEndCap(): (segmentEndCap: DisplaySegmentCap, sendImmediately?: boolean) => Promise<void>;
    get setDisplaySegmentCap(): (segmentCap: DisplaySegmentCap, sendImmediately?: boolean) => Promise<void>;
    get setDisplaySegmentStartRadius(): (segmentStartRadius: number, sendImmediately?: boolean) => Promise<void>;
    get setDisplaySegmentEndRadius(): (segmentEndRadius: number, sendImmediately?: boolean) => Promise<void>;
    get setDisplaySegmentRadius(): (segmentRadius: number, sendImmediately?: boolean) => Promise<void>;
    get setDisplayCropTop(): (cropTop: number, sendImmediately?: boolean) => Promise<void>;
    get setDisplayCropRight(): (cropRight: number, sendImmediately?: boolean) => Promise<void>;
    get setDisplayCropBottom(): (cropBottom: number, sendImmediately?: boolean) => Promise<void>;
    get setDisplayCropLeft(): (cropLeft: number, sendImmediately?: boolean) => Promise<void>;
    get setDisplayCrop(): (cropDirection: DisplayCropDirection, crop: number, sendImmediately?: boolean) => Promise<void>;
    get clearDisplayCrop(): (sendImmediately?: boolean) => Promise<void>;
    get setDisplayRotationCropTop(): (rotationCropTop: number, sendImmediately?: boolean) => Promise<void>;
    get setDisplayRotationCropRight(): (rotationCropRight: number, sendImmediately?: boolean) => Promise<void>;
    get setDisplayRotationCropBottom(): (rotationCropBottom: number, sendImmediately?: boolean) => Promise<void>;
    get setDisplayRotationCropLeft(): (rotationCropLeft: number, sendImmediately?: boolean) => Promise<void>;
    get setDisplayRotationCrop(): (cropDirection: DisplayCropDirection, crop: number, sendImmediately?: boolean) => Promise<void>;
    get clearDisplayRotationCrop(): (sendImmediately?: boolean) => Promise<void>;
    get flushDisplayContextCommands(): () => Promise<void>;
    get drawDisplayRect(): (centerX: number, centerY: number, width: number, height: number, sendImmediately?: boolean) => Promise<void>;
    get drawDisplayCircle(): (centerX: number, centerY: number, radius: number, sendImmediately?: boolean) => Promise<void>;
    get drawDisplayEllipse(): (centerX: number, centerY: number, radiusX: number, radiusY: number, sendImmediately?: boolean) => Promise<void>;
    get drawDisplayRoundRect(): (centerX: number, centerY: number, width: number, height: number, borderRadius: number, sendImmediately?: boolean) => Promise<void>;
    get drawDisplayPolygon(): (centerX: number, centerY: number, radius: number, numberOfSides: number, sendImmediately?: boolean) => Promise<void>;
    get drawDisplaySegment(): (startX: number, startY: number, endX: number, endY: number, sendImmediately?: boolean) => Promise<void>;
    get drawDisplaySegments(): (points: Vector2[], sendImmediately?: boolean) => Promise<void>;
    get drawDisplayArc(): (centerX: number, centerY: number, radius: number, startAngle: number, angleOffset: number, isRadians?: boolean, sendImmediately?: boolean) => Promise<void>;
    get drawDisplayArcEllipse(): (centerX: number, centerY: number, radiusX: number, radiusY: number, startAngle: number, angleOffset: number, isRadians?: boolean, sendImmediately?: boolean) => Promise<void>;
    get setDisplayContextState(): (newState: PartialDisplayContextState, sendImmediately?: boolean) => Promise<void>;
}

declare const DeviceManagerEventTypes: readonly ["deviceConnected", "deviceDisconnected", "deviceIsConnected", "availableDevices", "connectedDevices"];
type DeviceManagerEventType = (typeof DeviceManagerEventTypes)[number];
interface DeviceManagerEventMessage {
    device: Device;
}
interface DeviceManagerEventMessages {
    deviceConnected: DeviceManagerEventMessage;
    deviceDisconnected: DeviceManagerEventMessage;
    deviceIsConnected: DeviceManagerEventMessage;
    availableDevices: {
        availableDevices: Device[];
    };
    connectedDevices: {
        connectedDevices: Device[];
    };
}
type DeviceManagerEventMap = EventMap<typeof Device, DeviceManagerEventType, DeviceManagerEventMessages>;
type DeviceManagerEventListenerMap = EventListenerMap<typeof Device, DeviceManagerEventType, DeviceManagerEventMessages>;
type DeviceManagerEvent = Event<typeof Device, DeviceManagerEventType, DeviceManagerEventMessages>;
type BoundDeviceManagerEventListeners = BoundEventListeners<typeof Device, DeviceManagerEventType, DeviceManagerEventMessages>;
declare class DeviceManager {
    #private;
    static readonly shared: DeviceManager;
    constructor();
    /** @private */
    onDevice(device: Device): void;
    /** @private */
    OnDeviceConnectionStatusUpdated(device: Device, connectionStatus: ConnectionStatus): void;
    get ConnectedDevices(): Device[];
    get UseLocalStorage(): boolean;
    set UseLocalStorage(newUseLocalStorage: boolean);
    get CanUseLocalStorage(): false | Storage;
    get AvailableDevices(): Device[];
    get CanGetDevices(): false | (() => Promise<BluetoothDevice[]>);
    /**
     * retrieves devices already connected via web bluetooth in other tabs/windows
     *
     * _only available on web-bluetooth enabled browsers_
     */
    GetDevices(): Promise<Device[] | undefined>;
    get AddEventListener(): <T extends "connectedDevices" | "deviceConnected" | "deviceIsConnected" | "deviceDisconnected" | "availableDevices">(type: T, listener: (event: {
        type: T;
        target: DeviceManager;
        message: DeviceManagerEventMessages[T];
    }) => void, options?: {
        once?: boolean;
    }) => void;
    get RemoveEventListener(): <T extends "connectedDevices" | "deviceConnected" | "deviceIsConnected" | "deviceDisconnected" | "availableDevices">(type: T, listener: (event: {
        type: T;
        target: DeviceManager;
        message: DeviceManagerEventMessages[T];
    }) => void) => void;
    get RemoveEventListeners(): <T extends "connectedDevices" | "deviceConnected" | "deviceIsConnected" | "deviceDisconnected" | "availableDevices">(type: T) => void;
    get RemoveAllEventListeners(): () => void;
    _CheckDeviceAvailability(device: Device): void;
}
declare const _default: DeviceManager;

declare function hexToRGB(hex: string): DisplayColorRGB;
declare function rgbToHex({ r, g, b }: DisplayColorRGB): string;

interface DevicePairPressureData {
    sensors: {
        [key in Side]: PressureSensorValue[];
    };
    scaledSum: number;
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
    [side in Side]: number;
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
    side: Side;
}
type DevicePairDeviceEventMessages = ExtendInterfaceValues<AddPrefixToInterfaceKeys<DeviceEventMessages, "device">, BaseDevicePairDeviceEventMessage>;
interface DevicePairConnectionEventMessages {
    isConnected: {
        isConnected: boolean;
    };
}
type DevicePairEventMessages = DevicePairConnectionEventMessages & DevicePairSensorDataEventMessages & DevicePairDeviceEventMessages;
type DevicePairEventMap = EventMap<DevicePair, DeviceEventType, DevicePairEventMessages>;
type DevicePairEventListenerMap = EventListenerMap<DevicePair, DeviceEventType, DevicePairEventMessages>;
type DevicePairEvent = Event<DevicePair, DeviceEventType, DevicePairEventMessages>;
type BoundDevicePairEventListeners = BoundEventListeners<DevicePair, DeviceEventType, DevicePairEventMessages>;
declare const DevicePairTypes: readonly ["insoles", "gloves"];
type DevicePairType = (typeof DevicePairTypes)[number];
declare class DevicePair {
    #private;
    constructor(type: DevicePairType);
    get sides(): readonly ["left", "right"];
    get type(): "insoles" | "gloves";
    get addEventListener(): <T extends "isConnected" | "sensorData" | "pressure" | "deviceOrientation" | "deviceConnectionMessage" | "deviceNotConnected" | "deviceConnecting" | "deviceConnected" | "deviceDisconnecting" | "deviceConnectionStatus" | "deviceIsConnected" | "deviceBatteryLevel" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceManufacturerName" | "deviceModelNumber" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "deviceSoftwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceDeviceInformation" | "deviceGetSensorConfiguration" | "deviceSensorData" | "devicePressure" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "deviceTapDetector" | "deviceBarometer" | "deviceGetFileTypes" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceIsWifiAvailable" | "deviceGetWifiSSID" | "deviceGetWifiPassword" | "deviceIsWifiConnected" | "deviceIpAddress" | "deviceCameraStatus" | "deviceGetCameraConfiguration" | "deviceCameraImageProgress" | "deviceCameraImage" | "deviceMicrophoneStatus" | "deviceGetMicrophoneConfiguration" | "deviceMicrophoneData" | "deviceIsRecordingMicrophone" | "deviceMicrophoneRecording" | "deviceSmp" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus" | "deviceGetEnableWifiConnection">(type: T, listener: (event: {
        type: T;
        target: DevicePair;
        message: DevicePairEventMessages[T];
    }) => void, options?: {
        once?: boolean;
    }) => void;
    get removeEventListener(): <T extends "isConnected" | "sensorData" | "pressure" | "deviceOrientation" | "deviceConnectionMessage" | "deviceNotConnected" | "deviceConnecting" | "deviceConnected" | "deviceDisconnecting" | "deviceConnectionStatus" | "deviceIsConnected" | "deviceBatteryLevel" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceManufacturerName" | "deviceModelNumber" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "deviceSoftwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceDeviceInformation" | "deviceGetSensorConfiguration" | "deviceSensorData" | "devicePressure" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "deviceTapDetector" | "deviceBarometer" | "deviceGetFileTypes" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceIsWifiAvailable" | "deviceGetWifiSSID" | "deviceGetWifiPassword" | "deviceIsWifiConnected" | "deviceIpAddress" | "deviceCameraStatus" | "deviceGetCameraConfiguration" | "deviceCameraImageProgress" | "deviceCameraImage" | "deviceMicrophoneStatus" | "deviceGetMicrophoneConfiguration" | "deviceMicrophoneData" | "deviceIsRecordingMicrophone" | "deviceMicrophoneRecording" | "deviceSmp" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus" | "deviceGetEnableWifiConnection">(type: T, listener: (event: {
        type: T;
        target: DevicePair;
        message: DevicePairEventMessages[T];
    }) => void) => void;
    get waitForEvent(): <T extends "isConnected" | "sensorData" | "pressure" | "deviceOrientation" | "deviceConnectionMessage" | "deviceNotConnected" | "deviceConnecting" | "deviceConnected" | "deviceDisconnecting" | "deviceConnectionStatus" | "deviceIsConnected" | "deviceBatteryLevel" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceManufacturerName" | "deviceModelNumber" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "deviceSoftwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceDeviceInformation" | "deviceGetSensorConfiguration" | "deviceSensorData" | "devicePressure" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "deviceTapDetector" | "deviceBarometer" | "deviceGetFileTypes" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceIsWifiAvailable" | "deviceGetWifiSSID" | "deviceGetWifiPassword" | "deviceIsWifiConnected" | "deviceIpAddress" | "deviceCameraStatus" | "deviceGetCameraConfiguration" | "deviceCameraImageProgress" | "deviceCameraImage" | "deviceMicrophoneStatus" | "deviceGetMicrophoneConfiguration" | "deviceMicrophoneData" | "deviceIsRecordingMicrophone" | "deviceMicrophoneRecording" | "deviceSmp" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus" | "deviceGetEnableWifiConnection">(type: T) => Promise<{
        type: T;
        target: DevicePair;
        message: DevicePairEventMessages[T];
    }>;
    get removeEventListeners(): <T extends "isConnected" | "sensorData" | "pressure" | "deviceOrientation" | "deviceConnectionMessage" | "deviceNotConnected" | "deviceConnecting" | "deviceConnected" | "deviceDisconnecting" | "deviceConnectionStatus" | "deviceIsConnected" | "deviceBatteryLevel" | "deviceIsCharging" | "deviceGetBatteryCurrent" | "deviceGetMtu" | "deviceGetId" | "deviceGetName" | "deviceGetType" | "deviceGetCurrentTime" | "deviceManufacturerName" | "deviceModelNumber" | "deviceHardwareRevision" | "deviceFirmwareRevision" | "deviceSoftwareRevision" | "devicePnpId" | "deviceSerialNumber" | "deviceDeviceInformation" | "deviceGetSensorConfiguration" | "deviceSensorData" | "devicePressure" | "deviceAcceleration" | "deviceGravity" | "deviceLinearAcceleration" | "deviceGyroscope" | "deviceMagnetometer" | "deviceGameRotation" | "deviceRotation" | "deviceActivity" | "deviceStepCounter" | "deviceStepDetector" | "deviceDeviceOrientation" | "deviceTapDetector" | "deviceBarometer" | "deviceGetFileTypes" | "deviceMaxFileLength" | "deviceGetFileType" | "deviceGetFileLength" | "deviceGetFileChecksum" | "deviceFileTransferStatus" | "deviceGetFileBlock" | "deviceFileTransferProgress" | "deviceFileTransferComplete" | "deviceFileReceived" | "deviceGetTfliteName" | "deviceGetTfliteTask" | "deviceGetTfliteSampleRate" | "deviceGetTfliteSensorTypes" | "deviceTfliteIsReady" | "deviceGetTfliteCaptureDelay" | "deviceGetTfliteThreshold" | "deviceGetTfliteInferencingEnabled" | "deviceTfliteInference" | "deviceIsWifiAvailable" | "deviceGetWifiSSID" | "deviceGetWifiPassword" | "deviceIsWifiConnected" | "deviceIpAddress" | "deviceCameraStatus" | "deviceGetCameraConfiguration" | "deviceCameraImageProgress" | "deviceCameraImage" | "deviceMicrophoneStatus" | "deviceGetMicrophoneConfiguration" | "deviceMicrophoneData" | "deviceIsRecordingMicrophone" | "deviceMicrophoneRecording" | "deviceSmp" | "deviceFirmwareImages" | "deviceFirmwareUploadProgress" | "deviceFirmwareStatus" | "deviceGetEnableWifiConnection">(type: T) => void;
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

type BoundGenericEventListeners = {
    [eventType: string]: Function;
};
declare function addEventListeners(target: any, boundEventListeners: BoundGenericEventListeners): void;
declare function removeEventListeners(target: any, boundEventListeners: BoundGenericEventListeners): void;

declare function throttle<T extends (...args: any[]) => void>(fn: T, interval: number, trailing?: boolean): (...args: Parameters<T>) => void;
declare function debounce<T extends (...args: any[]) => void>(fn: T, interval: number, callImmediately?: boolean): (...args: Parameters<T>) => void;

interface DiscoveredDevice {
    bluetoothId: string;
    name: string;
    deviceType: DeviceType;
    rssi: number;
    ipAddress?: string;
    isWifiSecure?: boolean;
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
type DiscoveredDevicesMap = {
    [deviceId: string]: DiscoveredDevice;
};
declare abstract class BaseScanner {
    #private;
    protected get baseConstructor(): typeof BaseScanner;
    static get isSupported(): boolean;
    get isSupported(): boolean;
    constructor();
    get addEventListener(): <T extends "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice">(type: T, listener: (event: {
        type: T;
        target: BaseScanner;
        message: ScannerEventMessages[T];
    }) => void, options?: {
        once?: boolean;
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
    get discoveredDevices(): Readonly<DiscoveredDevicesMap>;
    get discoveredDevicesArray(): DiscoveredDevice[];
    static get DiscoveredDeviceExpirationTimeout(): number;
    connectToDevice(deviceId: string, connectionType?: ConnectionType): Promise<void>;
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
        once?: boolean;
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
    protected parseClientMessage(dataView: DataView): ArrayBuffer | undefined;
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

declare class UDPServer extends BaseServer {
    #private;
    get numberOfClients(): number;
    get socket(): dgram.Socket | undefined;
    set socket(newSocket: dgram.Socket | undefined);
    broadcastMessage(message: ArrayBuffer): void;
}

declare const EventUtils: {
    addEventListeners: typeof addEventListeners;
    removeEventListeners: typeof removeEventListeners;
};

declare const ThrottleUtils: {
    throttle: typeof throttle;
    debounce: typeof debounce;
};

export { type BoundDeviceEventListeners, type BoundDeviceManagerEventListeners, type BoundDevicePairEventListeners, type CameraCommand, CameraCommands, type CameraConfiguration, type CameraConfigurationType, CameraConfigurationTypes, type CenterOfPressure, type ContinuousSensorType, ContinuousSensorTypes, DefaultNumberOfPressureSensors, Device, type DeviceEvent, type DeviceEventListenerMap, type DeviceEventMap, type DeviceInformation, _default as DeviceManager, type DeviceManagerEvent, type DeviceManagerEventListenerMap, type DeviceManagerEventMap, DevicePair, type DevicePairEvent, type DevicePairEventListenerMap, type DevicePairEventMap, type DevicePairType, DevicePairTypes, type DeviceType, DeviceTypes, type DiscoveredDevice, type DisplayBrightness, DisplayBrightnesses, type DisplayColorRGB, type DisplaySegmentCap, DisplaySegmentCaps, type DisplaySize, environment_d as Environment, type Euler, EventUtils, type FileTransferDirection, FileTransferDirections, type FileType, FileTypes, MaxNameLength, MaxNumberOfVibrationWaveformEffectSegments, MaxNumberOfVibrationWaveformSegments, MaxSensorRate, MaxVibrationWaveformEffectSegmentDelay, MaxVibrationWaveformEffectSegmentLoopCount, MaxVibrationWaveformEffectSequenceLoopCount, MaxVibrationWaveformSegmentDuration, MaxWifiPasswordLength, MaxWifiSSIDLength, type MicrophoneCommand, MicrophoneCommands, type MicrophoneConfiguration, type MicrophoneConfigurationType, MicrophoneConfigurationTypes, MicrophoneConfigurationValues, MinNameLength, MinWifiPasswordLength, MinWifiSSIDLength, type PressureData, type Quaternion, RangeHelper, scanner as Scanner, type SensorConfiguration, SensorRateStep, type SensorType, SensorTypes, type Side, Sides, type TfliteFileConfiguration, type TfliteSensorType, TfliteSensorTypes, type TfliteTask, TfliteTasks, ThrottleUtils, UDPServer, type Vector2, type Vector3, type VibrationConfiguration, type VibrationLocation, VibrationLocations, type VibrationType, VibrationTypes, type VibrationWaveformEffect, VibrationWaveformEffects, WebSocketServer, hexToRGB, rgbToHex, setAllConsoleLevelFlags, setConsoleLevelFlagsForType };
