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
    discoveredPeripheralsMessage,
} from "../ServerUtils.js";
import { addEventListeners, removeEventListeners } from "../../utils/EventDispatcher.js";
import Timer from "../../utils/Timer.js";
import EventDispatcher from "../../utils/EventDispatcher.js";

const _console = createConsole("WebSocketClient", { log: true });

/** @typedef {import("../../utils/EventDispatcher.js").EventDispatcherListener} EventDispatcherListener */
/** @typedef {import("../../utils/EventDispatcher.js").EventDispatcherOptions} EventDispatcherOptions */

/** @typedef {"not connected" | "connecting" | "connected" | "disconnecting"} ClientConnectionStatus */

/** @typedef {ClientConnectionStatus | "connectionStatus" |  "isConnected" | "isScanningAvailable" | "isScanning"} ClientEventType */

/**
 * @typedef ClientEvent
 * @type {Object}
 * @property {WebSocketClient} target
 * @property {ClientEventType} type
 * @property {Object} message
 */

/** @typedef {import("./WebSocketServer.js").DiscoveredPeripheral} DiscoveredPeripheral */

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
    ];
    static get EventTypes() {
        return this.#EventTypes;
    }
    get eventTypes() {
        return WebSocketClient.#EventTypes;
    }
    #eventDispatcher = new EventDispatcher(this.eventTypes);

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
            _console.warn("redundant webSocket assignment");
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
                    this.#requestDiscoveredPeripherals();
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

    // PARSING
    static #TextDecoder = new TextDecoder();
    get #textDecoder() {
        return WebSocketClient.#TextDecoder;
    }
    /** @param {DataView} dataView */
    #parseMessage(dataView) {
        _console.log("parseMessage", { dataView });
        let byteOffset = 0;
        while (byteOffset < dataView.byteLength) {
            const messageTypeEnum = dataView.getUint8(byteOffset++);
            const messageType = ServerMessageTypes[messageTypeEnum];

            _console.log({ messageTypeEnum, messageType });
            _console.assertWithError(messageType, `invalid messageTypeEnum ${messageTypeEnum}`);

            switch (messageType) {
                case "ping":
                    this.#pong();
                    break;
                case "pong":
                    break;
                case "isScanningAvailable":
                    {
                        const isScanningAvailable = Boolean(dataView.getUint8(byteOffset++));
                        _console.log({ isScanningAvailable });
                        this.#isScanningAvailable = isScanningAvailable;
                    }
                    break;
                case "isScanning":
                    {
                        const isScanning = Boolean(dataView.getUint8(byteOffset++));
                        _console.log({ isScanning });
                        this.#isScanning = isScanning;
                    }
                    break;
                case "discoveredPeripheral":
                    {
                        const discoveredPeripheralStringLength = dataView.getUint8(byteOffset++);
                        console.log({ discoveredPeripheralStringLength });
                        const discoveredPeripheralString = this.#textDecoder.decode(
                            dataView.buffer.slice(byteOffset, byteOffset + discoveredPeripheralStringLength)
                        );
                        console.log({ discoveredPeripheralString });
                        byteOffset += discoveredPeripheralStringLength;

                        /** @type {DiscoveredPeripheral} */
                        const discoveredPeripheral = JSON.parse(discoveredPeripheralString);
                        console.log({ discoveredPeripheral });

                        this.#onDiscoveredPeripheral(discoveredPeripheral);
                    }
                    break;
                default:
                    _console.error(`uncaught messageType "${messageType}"`);
                    break;
            }
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
    /** @param {DiscoveredPeripheral} discoveredPeripheral */
    #onDiscoveredPeripheral(discoveredPeripheral) {
        console.log({ discoveredPeripheral });
    }
    #requestDiscoveredPeripherals() {
        this.#assertConnection();
        this.webSocket.send(discoveredPeripheralsMessage);
    }
}

export default WebSocketClient;
