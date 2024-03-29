import { createConsole } from "../../utils/Console.js";
import {
    ServerMessageTypes,
    pingMessage,
    pingTimeout,
    pongMessage,
    reconnectTimeout,
    isScanningAvailableRequestMessage,
    isScanningRequestMessage,
    startScanRequestMessage,
    stopScanRequestMessage,
    discoveredDevicesMessage,
    createServerMessage,
    parseStringFromDataView,
} from "../ServerUtils.js";
import { addEventListeners, removeEventListeners } from "../../utils/EventDispatcher.js";
import Timer from "../../utils/Timer.js";
import EventDispatcher from "../../utils/EventDispatcher.js";
import Device from "../../Device.js";
import WebSocketClientConnectionManager from "../../connection/webSocket/WebSocketClientConnectionManager.js";

const _console = createConsole("WebSocketClient", { log: true });

/** @typedef {import("../../utils/EventDispatcher.js").EventDispatcherListener} EventDispatcherListener */
/** @typedef {import("../../utils/EventDispatcher.js").EventDispatcherOptions} EventDispatcherOptions */

/** @typedef {"not connected" | "connecting" | "connected" | "disconnecting"} ClientConnectionStatus */

/** @typedef {ClientConnectionStatus | "connectionStatus" |  "isConnected" | "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice"} ClientEventType */

/**
 * @typedef ClientEvent
 * @type {Object}
 * @property {WebSocketClient} target
 * @property {ClientEventType} type
 * @property {Object} message
 */

/** @typedef {import("./WebSocketServer.js").DiscoveredDevice} DiscoveredDevice */

class WebSocketClient {
    // EVENT DISPATCHER

    /** @type {ClientEventType[]} */
    static #EventTypes = [
        "connectionStatus",
        "connecting",
        "connected",
        "disconnecting",
        "not connected",
        "isConnected",
        "isScanningAvailable",
        "isScanning",
        "discoveredDevice",
        "expiredDiscoveredDevice",
    ];
    static get EventTypes() {
        return this.#EventTypes;
    }
    get eventTypes() {
        return WebSocketClient.#EventTypes;
    }
    #eventDispatcher = new EventDispatcher(this, this.eventTypes);

    /**
     * @param {ClientEventType} type
     * @param {EventDispatcherListener} listener
     * @param {EventDispatcherOptions} options
     */
    addEventListener(type, listener, options) {
        this.#eventDispatcher.addEventListener(type, listener, options);
    }

    /**
     * @param {ClientEvent} event
     */
    #dispatchEvent(event) {
        this.#eventDispatcher.dispatchEvent(event);
    }

    /**
     * @param {ClientEventType} type
     * @param {EventDispatcherListener} listener
     */
    removeEventListener(type, listener) {
        return this.#eventDispatcher.removeEventListener(type, listener);
    }

    // WEBSOCKET

    /** @type {WebSocket?} */
    #webSocket;
    get webSocket() {
        return this.#webSocket;
    }
    set webSocket(newWebSocket) {
        if (this.#webSocket == newWebSocket) {
            _console.log("redundant webSocket assignment");
            return;
        }

        _console.log("assigning webSocket", newWebSocket);

        if (this.#webSocket) {
            removeEventListeners(this.#webSocket, this.#boundWebSocketEventListeners);
        }

        addEventListeners(newWebSocket, this.#boundWebSocketEventListeners);
        this.#webSocket = newWebSocket;

        _console.log("assigned webSocket");
    }

    get isConnected() {
        return this.webSocket?.readyState == WebSocket.OPEN;
    }
    #assertConnection() {
        _console.assertWithError(this.isConnected, "not connected");
    }

    get isDisconnected() {
        return this.webSocket?.readyState == WebSocket.CLOSED;
    }
    #assertDisconnection() {
        _console.assertWithError(this.isDisconnected, "not disconnected");
    }

    /** @param {string | URL} url */
    connect(url = `wss://${location.host}`) {
        if (this.webSocket) {
            this.#assertDisconnection();
        }
        this.#connectionStatus = "connecting";
        this.webSocket = new WebSocket(url);
    }

    disconnect() {
        this.#assertConnection();
        if (this.reconnectOnDisconnection) {
            this.reconnectOnDisconnection = false;
            this.webSocket.addEventListener(
                "close",
                () => {
                    this.reconnectOnDisconnection = true;
                },
                { once: true }
            );
        }
        this.#connectionStatus = "disconnecting";
        this.webSocket.close();
    }

    reconnect() {
        this.#assertDisconnection();
        this.webSocket = new WebSocket(this.webSocket.url);
    }

    static #ReconnectOnDisconnection = true;
    static get ReconnectOnDisconnection() {
        return this.#ReconnectOnDisconnection;
    }
    static set ReconnectOnDisconnection(newReconnectOnDisconnection) {
        _console.assertTypeWithError(newReconnectOnDisconnection, "boolean");
        this.#ReconnectOnDisconnection = newReconnectOnDisconnection;
    }

    #reconnectOnDisconnection = WebSocketClient.#ReconnectOnDisconnection;
    get reconnectOnDisconnection() {
        return this.#reconnectOnDisconnection;
    }
    set reconnectOnDisconnection(newReconnectOnDisconnection) {
        _console.assertTypeWithError(newReconnectOnDisconnection, "boolean");
        this.#reconnectOnDisconnection = newReconnectOnDisconnection;
    }

    // WEBSOCKET EVENTS

    #boundWebSocketEventListeners = {
        open: this.#onWebSocketOpen.bind(this),
        message: this.#onWebSocketMessage.bind(this),
        close: this.#onWebSocketClose.bind(this),
        error: this.#onWebSocketError.bind(this),
    };

    /** @param {Event} event */
    #onWebSocketOpen(event) {
        _console.log("webSocket.open", event);
        this.#pingTimer.start();
        this.#connectionStatus = "connected";
    }
    /** @param {import("ws").MessageEvent} event */
    async #onWebSocketMessage(event) {
        _console.log("webSocket.message", event);
        this.#pingTimer.restart();
        const arrayBuffer = await event.data.arrayBuffer();
        const dataView = new DataView(arrayBuffer);
        this.#parseMessage(dataView);
    }
    /** @param {import("ws").CloseEvent} event  */
    #onWebSocketClose(event) {
        _console.log("webSocket.close", event);

        this.#connectionStatus = "not connected";

        this.#pingTimer.stop();
        if (this.#reconnectOnDisconnection) {
            setTimeout(() => {
                this.reconnect();
            }, reconnectTimeout);
        }
    }
    /** @param {Event} event */
    #onWebSocketError(event) {
        _console.log("webSocket.error", event);
    }

    // CONNECTION STATUS

    /** @type {ClientConnectionStatus} */
    #_connectionStatus = "not connected";
    get #connectionStatus() {
        return this.#_connectionStatus;
    }
    set #connectionStatus(newConnectionStatus) {
        _console.assertTypeWithError(newConnectionStatus, "string");
        _console.log({ newConnectionStatus });
        this.#_connectionStatus = newConnectionStatus;

        this.#dispatchEvent({ type: "connectionStatus", message: { connectionStatus: this.connectionStatus } });
        this.#dispatchEvent({ type: this.connectionStatus });

        switch (newConnectionStatus) {
            case "connected":
            case "not connected":
                this.#dispatchEvent({ type: "isConnected", message: { isConnected: this.isConnected } });
                if (this.isConnected) {
                    this.#requestIsScanningAvailable();
                    this.#requestDiscoveredDevices();
                } else {
                    this.#isScanningAvailable = false;
                    this.#isScanning = false;
                }
                break;
        }
    }
    get connectionStatus() {
        return this.#connectionStatus;
    }

    /** @param {DataView} dataView */
    #parseMessage(dataView) {
        _console.log("parseMessage", { dataView });
        let byteOffset = 0;
        while (byteOffset < dataView.byteLength) {
            const messageTypeEnum = dataView.getUint8(byteOffset++);
            const messageType = ServerMessageTypes[messageTypeEnum];
            const messageByteLength = dataView.getUint8(byteOffset++);

            _console.log({ messageTypeEnum, messageType, messageByteLength });
            _console.assertEnumWithError(messageType, ServerMessageTypes);

            let _byteOffset = byteOffset;

            switch (messageType) {
                case "ping":
                    this.#pong();
                    break;
                case "pong":
                    break;
                case "isScanningAvailable":
                    {
                        const isScanningAvailable = Boolean(dataView.getUint8(_byteOffset++));
                        _console.log({ isScanningAvailable });
                        this.#isScanningAvailable = isScanningAvailable;
                    }
                    break;
                case "isScanning":
                    {
                        const isScanning = Boolean(dataView.getUint8(_byteOffset++));
                        _console.log({ isScanning });
                        this.#isScanning = isScanning;
                    }
                    break;
                case "discoveredDevice":
                    {
                        const { string: discoveredDeviceString } = parseStringFromDataView(dataView, _byteOffset);
                        _console.log({ discoveredDeviceString });

                        /** @type {DiscoveredDevice} */
                        const discoveredDevice = JSON.parse(discoveredDeviceString);
                        _console.log({ discoveredDevice });

                        this.#onDiscoveredDevice(discoveredDevice);
                    }
                    break;
                case "expiredDiscoveredDevice":
                    {
                        const { string: deviceId } = parseStringFromDataView(dataView, _byteOffset);
                        this.#onExpiredDiscoveredDevice(deviceId);
                    }
                    break;
                case "deviceMessage":
                    {
                        const { string: deviceId, byteOffset: _newByteOffset } = parseStringFromDataView(
                            dataView,
                            _byteOffset
                        );
                        _byteOffset = _newByteOffset;
                        const device = this.#devices[deviceId];
                        _console.assertWithError(device, `no device found for id ${deviceId}`);
                        /** @type {WebSocketClientConnectionManager} */
                        const connectionManager = device.connectionManager;
                        const _dataView = new DataView(
                            dataView.buffer,
                            _byteOffset,
                            messageByteLength - (_byteOffset - byteOffset)
                        );
                        connectionManager.onWebSocketMessage(_dataView);
                    }
                    break;
                default:
                    _console.error(`uncaught messageType "${messageType}"`);
                    break;
            }
            byteOffset += messageByteLength;
        }
    }

    // PING
    #pingTimer = new Timer(this.#ping.bind(this), pingTimeout);
    #ping() {
        this.#assertConnection();
        this.webSocket.send(pingMessage);
    }
    #pong() {
        this.#assertConnection();
        this.webSocket.send(pongMessage);
    }

    // SCANNING
    #_isScanningAvailable = false;
    get #isScanningAvailable() {
        return this.#_isScanningAvailable;
    }
    set #isScanningAvailable(newIsAvailable) {
        _console.assertTypeWithError(newIsAvailable, "boolean");
        this.#_isScanningAvailable = newIsAvailable;
        this.#dispatchEvent({
            type: "isScanningAvailable",
            message: { isScanningAvailable: this.isScanningAvailable },
        });
        if (this.isScanningAvailable) {
            this.#requestIsScanning();
        }
    }
    get isScanningAvailable() {
        return this.#isScanningAvailable;
    }
    #assertIsScanningAvailable() {
        this.#assertConnection();
        _console.assertWithError(this.isScanningAvailable, "scanning is not available");
    }
    #requestIsScanningAvailable() {
        this.#assertConnection();
        this.webSocket.send(isScanningAvailableRequestMessage);
    }

    #_isScanning = false;
    get #isScanning() {
        return this.#_isScanning;
    }
    set #isScanning(newIsScanning) {
        _console.assertTypeWithError(newIsScanning, "boolean");
        this.#_isScanning = newIsScanning;
        this.#dispatchEvent({ type: "isScanning", message: { isScanning: this.isScanning } });
    }
    get isScanning() {
        return this.#isScanning;
    }
    #requestIsScanning() {
        this.#assertConnection();
        this.webSocket.send(isScanningRequestMessage);
    }

    #assertIsScanning() {
        _console.assertWithError(this.isScanning, "is not scanning");
    }
    #assertIsNotScanning() {
        _console.assertWithError(!this.isScanning, "is already scanning");
    }

    startScan() {
        this.#assertIsNotScanning();
        this.webSocket.send(startScanRequestMessage);
    }
    stopScan() {
        this.#assertIsScanning();
        this.webSocket.send(stopScanRequestMessage);
    }
    toggleScan() {
        this.#assertIsScanningAvailable();

        if (this.isScanning) {
            this.stopScan();
        } else {
            this.startScan();
        }
    }

    // PERIPHERALS
    /** @type {Object.<string, DiscoveredDevice>} */
    #discoveredDevices = {};
    get discoveredDevices() {
        return this.#discoveredDevices;
    }
    /** @param {string} discoveredDeviceId */
    #assertValidDiscoveredDeviceId(discoveredDeviceId) {
        _console.assertTypeWithError(discoveredDeviceId, "string");
        _console.assertWithError(
            this.#discoveredDevices[discoveredDeviceId],
            `no discoveredDevice found with id "${discoveredDeviceId}"`
        );
    }

    /** @param {DiscoveredDevice} discoveredDevice */
    #onDiscoveredDevice(discoveredDevice) {
        _console.log({ discoveredDevice });
        this.#discoveredDevices[discoveredDevice.id] = discoveredDevice;
        this.#dispatchEvent({ type: "discoveredDevice", message: { discoveredDevice } });
    }
    #requestDiscoveredDevices() {
        this.#assertConnection();
        this.webSocket.send(discoveredDevicesMessage);
    }
    /** @param {string} discoveredDeviceId */
    #onExpiredDiscoveredDevice(discoveredDeviceId) {
        _console.log({ discoveredDeviceId });
        let discoveredDevice = this.#discoveredDevices[discoveredDeviceId];
        if (discoveredDevice) {
            _console.log({ expiredDiscoveredDevice: discoveredDevice });
            delete this.#discoveredDevices[discoveredDeviceId];
            this.#dispatchEvent({ type: "expiredDiscoveredDevice", message: { discoveredDevice } });
        } else {
            _console.warn(`no discoveredDevice found with id "${discoveredDeviceId}"`);
        }
    }

    // DEVICE CONNECTION

    /** @param {string} deviceId */
    connectToDevice(deviceId) {
        this.#requestConnectionToDevice(deviceId);
    }
    /** @param {string} deviceId */
    #requestConnectionToDevice(deviceId) {
        this.#assertConnection();
        _console.assertTypeWithError(deviceId, "string");
        let device = this.devices[deviceId];
        if (!device) {
            device = this.#createDevice(deviceId);
            this.devices[deviceId] = device;
        }
        this.webSocket.send(this.#createConnectionToDeviceMessage(deviceId));
    }
    /** @param {string} deviceId */
    #createConnectionToDeviceMessage(deviceId) {
        return createServerMessage({ type: "connectToDevice", data: deviceId });
    }

    /** @param {string} deviceId */
    #createDevice(deviceId) {
        const device = new Device();
        const clientConnectionManager = new WebSocketClientConnectionManager();
        clientConnectionManager.id = deviceId;
        clientConnectionManager.sendWebSocketMessage = this.#sendDeviceMessage.bind(this, deviceId);
        clientConnectionManager.webSocketClient = this;
        device.connectionManager = clientConnectionManager;
        return device;
    }

    /** @param {string} deviceId */
    disconnectFromDevice(deviceId) {
        this.#requestDisconnectionFromDevice(deviceId);
    }
    /** @param {string} deviceId */
    #requestDisconnectionFromDevice(deviceId) {
        this.#assertConnection();
        _console.assertTypeWithError(deviceId, "string");
        const device = this.devices[deviceId];
        _console.assertWithError(device, `no device found with id ${deviceId}`);
        this.webSocket.send(this.#createDisconnectFromDeviceMessage(deviceId));
    }
    /** @param {string} deviceId */
    #createDisconnectFromDeviceMessage(deviceId) {
        return createServerMessage({ type: "disconnectFromDevice", data: deviceId });
    }

    /** @typedef {import("../../connection/ConnectionManager.js").ConnectionMessageType} ConnectionMessageType */

    /**
     * @param {string} deviceId
     * @param {ConnectionMessageType} messageType
     * @param {DataView|ArrayBuffer} data
     */
    #sendDeviceMessage(deviceId, messageType, data) {
        this.#assertConnection();
        this.webSocket.send(this.#createDeviceMessage(deviceId, messageType, data));
    }

    /**
     * @param {string} deviceId
     * @param {ConnectionMessageType} messageType
     * @param {DataView|ArrayBuffer} data
     */
    #createDeviceMessage(deviceId, messageType, data) {
        _console.assertTypeWithError(deviceId, "string");
        _console.assertEnumWithError(messageType, WebSocketClientConnectionManager.MessageTypes);
        const messageTypeEnum = WebSocketClientConnectionManager.MessageTypes.indexOf(messageType);
        return createServerMessage({ type: "deviceMessage", data: [deviceId, messageTypeEnum, data] });
    }

    // DEVICES
    /** @type {Object.<string, Device>} */
    #devices = {};
    get devices() {
        return this.#devices;
    }
}

/** @typedef {WebSocketClient} WebSocketClient */

export default WebSocketClient;
