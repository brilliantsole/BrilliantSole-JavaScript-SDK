export declare const ConnectionTypes: readonly ["webBluetooth", "noble", "client", "webSocket", "udp"];
export type ConnectionType = (typeof ConnectionTypes)[number];
export declare const ClientConnectionTypes: readonly ["noble", "webSocket", "udp"];
export type ClientConnectionType = (typeof ClientConnectionTypes)[number];
interface BaseConnectOptions {
    type: "client" | "webBluetooth" | "webSocket" | "udp";
}
export interface WebBluetoothConnectOptions extends BaseConnectOptions {
    type: "webBluetooth";
}
interface BaseWifiConnectOptions extends BaseConnectOptions {
    ipAddress: string;
}
export interface ClientConnectOptions extends BaseConnectOptions {
    type: "client";
    subType?: "noble" | "webSocket" | "udp";
}
export interface WebSocketConnectOptions extends BaseWifiConnectOptions {
    type: "webSocket";
    isWifiSecure?: boolean;
}
export interface UDPConnectOptions extends BaseWifiConnectOptions {
    type: "udp";
    receivePort?: number;
}
export type ConnectOptions = WebBluetoothConnectOptions | WebSocketConnectOptions | UDPConnectOptions | ClientConnectOptions;
export declare const ConnectionStatuses: readonly ["notConnected", "connecting", "connected", "disconnecting"];
export type ConnectionStatus = (typeof ConnectionStatuses)[number];
export declare const ConnectionEventTypes: readonly ["notConnected", "connecting", "connected", "disconnecting", "connectionStatus", "isConnected"];
export type ConnectionEventType = (typeof ConnectionEventTypes)[number];
export interface ConnectionStatusEventMessages {
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
export interface TxMessage {
    type: TxRxMessageType;
    data?: ArrayBuffer;
}
export declare const TxRxMessageTypes: readonly ["isCharging", "getBatteryCurrent", "getMtu", "getId", "getName", "setName", "getType", "setType", "getCurrentTime", "setCurrentTime", "getSensorConfiguration", "setSensorConfiguration", "getPressurePositions", "getSensorScalars", "sensorData", "getVibrationLocations", "triggerVibration", "getFileTypes", "maxFileLength", "getFileType", "setFileType", "getFileLength", "setFileLength", "getFileChecksum", "setFileChecksum", "setFileTransferCommand", "fileTransferStatus", "getFileBlock", "setFileBlock", "fileBytesTransferred", "getTfliteName", "setTfliteName", "getTfliteTask", "setTfliteTask", "getTfliteSampleRate", "setTfliteSampleRate", "getTfliteSensorTypes", "setTfliteSensorTypes", "tfliteIsReady", "getTfliteCaptureDelay", "setTfliteCaptureDelay", "getTfliteThreshold", "setTfliteThreshold", "getTfliteInferencingEnabled", "setTfliteInferencingEnabled", "tfliteInference", "isWifiAvailable", "getWifiSSID", "setWifiSSID", "getWifiPassword", "setWifiPassword", "getWifiConnectionEnabled", "setWifiConnectionEnabled", "isWifiConnected", "ipAddress", "isWifiSecure", "cameraStatus", "cameraCommand", "getCameraConfiguration", "setCameraConfiguration", "cameraData"];
export type TxRxMessageType = (typeof TxRxMessageTypes)[number];
export declare const SMPMessageTypes: readonly ["smp"];
export type SMPMessageType = (typeof SMPMessageTypes)[number];
export declare const BatteryLevelMessageTypes: readonly ["batteryLevel"];
export type BatteryLevelMessageType = (typeof BatteryLevelMessageTypes)[number];
export declare const MetaConnectionMessageTypes: readonly ["rx", "tx"];
export type MetaConnectionMessageType = (typeof MetaConnectionMessageTypes)[number];
export declare const ConnectionMessageTypes: readonly ["batteryLevel", "manufacturerName", "modelNumber", "hardwareRevision", "firmwareRevision", "softwareRevision", "pnpId", "serialNumber", "rx", "tx", "isCharging", "getBatteryCurrent", "getMtu", "getId", "getName", "setName", "getType", "setType", "getCurrentTime", "setCurrentTime", "getSensorConfiguration", "setSensorConfiguration", "getPressurePositions", "getSensorScalars", "sensorData", "getVibrationLocations", "triggerVibration", "getFileTypes", "maxFileLength", "getFileType", "setFileType", "getFileLength", "setFileLength", "getFileChecksum", "setFileChecksum", "setFileTransferCommand", "fileTransferStatus", "getFileBlock", "setFileBlock", "fileBytesTransferred", "getTfliteName", "setTfliteName", "getTfliteTask", "setTfliteTask", "getTfliteSampleRate", "setTfliteSampleRate", "getTfliteSensorTypes", "setTfliteSensorTypes", "tfliteIsReady", "getTfliteCaptureDelay", "setTfliteCaptureDelay", "getTfliteThreshold", "setTfliteThreshold", "getTfliteInferencingEnabled", "setTfliteInferencingEnabled", "tfliteInference", "isWifiAvailable", "getWifiSSID", "setWifiSSID", "getWifiPassword", "setWifiPassword", "getWifiConnectionEnabled", "setWifiConnectionEnabled", "isWifiConnected", "ipAddress", "isWifiSecure", "cameraStatus", "cameraCommand", "getCameraConfiguration", "setCameraConfiguration", "cameraData", "smp"];
export type ConnectionMessageType = (typeof ConnectionMessageTypes)[number];
export type ConnectionStatusCallback = (status: ConnectionStatus) => void;
export type MessageReceivedCallback = (messageType: ConnectionMessageType, dataView: DataView) => void;
export type MessagesReceivedCallback = () => void;
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
export default BaseConnectionManager;
