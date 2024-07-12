export declare const ConnectionTypes: readonly ["webBluetooth", "noble", "webSocketClient"];
export type ConnectionType = (typeof ConnectionTypes)[number];
export declare const ConnectionStatuses: readonly ["not connected", "connecting", "connected", "disconnecting"];
export type ConnectionStatus = (typeof ConnectionStatuses)[number];
export interface TxMessage {
    type: TxRxMessageType;
    data?: ArrayBuffer;
}
export declare const TxRxMessageTypes: readonly ["isCharging", "getBatteryCurrent", "getMtu", "getId", "getName", "setName", "getType", "setType", "getCurrentTime", "setCurrentTime", "getSensorConfiguration", "setSensorConfiguration", "getPressurePositions", "getSensorScalars", "sensorData", "triggerVibration", "getTfliteName", "setTfliteName", "getTfliteTask", "setTfliteTask", "getTfliteSampleRate", "setTfliteSampleRate", "getTfliteSensorTypes", "setTfliteSensorTypes", "tfliteIsReady", "getTfliteCaptureDelay", "setTfliteCaptureDelay", "getTfliteThreshold", "setTfliteThreshold", "getTfliteInferencingEnabled", "setTfliteInferencingEnabled", "tfliteInference", "maxFileLength", "getFileType", "setFileType", "getFileLength", "setFileLength", "getFileChecksum", "setFileChecksum", "setFileTransferCommand", "fileTransferStatus", "getFileBlock", "setFileBlock"];
export type TxRxMessageType = (typeof TxRxMessageTypes)[number];
export declare const ConnectionMessageTypes: readonly ["manufacturerName", "modelNumber", "softwareRevision", "hardwareRevision", "firmwareRevision", "pnpId", "serialNumber", "batteryLevel", "smp", "rx", "tx", "isCharging", "getBatteryCurrent", "getMtu", "getId", "getName", "setName", "getType", "setType", "getCurrentTime", "setCurrentTime", "getSensorConfiguration", "setSensorConfiguration", "getPressurePositions", "getSensorScalars", "sensorData", "triggerVibration", "getTfliteName", "setTfliteName", "getTfliteTask", "setTfliteTask", "getTfliteSampleRate", "setTfliteSampleRate", "getTfliteSensorTypes", "setTfliteSensorTypes", "tfliteIsReady", "getTfliteCaptureDelay", "setTfliteCaptureDelay", "getTfliteThreshold", "setTfliteThreshold", "getTfliteInferencingEnabled", "setTfliteInferencingEnabled", "tfliteInference", "maxFileLength", "getFileType", "setFileType", "getFileLength", "setFileLength", "getFileChecksum", "setFileChecksum", "setFileTransferCommand", "fileTransferStatus", "getFileBlock", "setFileBlock"];
export type ConnectionMessageType = (typeof ConnectionMessageTypes)[number];
export type ConnectionStatusCallback = (status: ConnectionStatus) => void;
export type MessageReceivedCallback = (messageType: ConnectionMessageType, dataView: DataView) => void;
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
export default BaseConnectionManager;
