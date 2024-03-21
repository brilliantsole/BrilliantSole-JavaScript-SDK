import { createConsole } from "../../utils/Console.js";
import { isInNode } from "../../utils/environment.js";
import { addEventListeners, removeEventListeners } from "../../utils/EventDispatcher.js";
import {
    pingTimeout,
    pingMessage,
    ServerMessageTypes,
    pongMessage,
    createServerMessage,
    parseStringFromDataView,
} from "../ServerUtils.js";
import { concatenateArrayBuffers, dataToArrayBuffer } from "../../utils/ArrayBufferUtils.js";
import Timer from "../../utils/Timer.js";
import EventDispatcher from "../../utils/EventDispatcher.js";
import scanner from "../../scanner/Scanner.js";

const _console = createConsole("WebSocketServer", { log: true });

/** @typedef {import("../../utils/EventDispatcher.js").EventDispatcherListener} EventDispatcherListener */
/** @typedef {import("../../utils/EventDispatcher.js").EventDispatcherOptions} EventDispatcherOptions */

/** @typedef {import("../../scanner/BaseScanner.js").ScannerEvent} ScannerEvent */

/** @typedef {"clientConnected" | "clientDisconnected"} ServerEventType */

/**
 * @typedef ServerEvent
 * @type {Object}
 * @property {WebSocketServer} target
 * @property {ServerEventType} type
 * @property {Object} message
 */

/** @typedef {import("../../scanner/BaseScanner.js").DiscoveredPeripheral} DiscoveredPeripheral */

if (isInNode) {
    var ws = require("ws");
}

class WebSocketServer {
    constructor() {
        if (scanner) {
            addEventListeners(scanner, this.#boundScannerListeners);
        }
    }

    // EVENT DISPATCHER

    /** @type {ServerEventType[]} */
    static #EventTypes = ["clientConnected", "clientDisconnected"];
    static get EventTypes() {
        return this.#EventTypes;
    }
    get eventTypes() {
        return WebSocketServer.#EventTypes;
    }
    #eventDispatcher = new EventDispatcher(this, this.eventTypes);

    /**
     * @param {ServerEventType} type
     * @param {EventDispatcherListener} listener
     * @param {EventDispatcherOptions} options
     */
    addEventListener(type, listener, options) {
        this.#eventDispatcher.addEventListener(type, listener, options);
    }

    /**
     * @param {ServerEvent} event
     */
    #dispatchEvent(event) {
        this.#eventDispatcher.dispatchEvent(event);
    }

    /**
     * @param {ServerEventType} type
     * @param {EventDispatcherListener} listener
     */
    removeEventListener(type, listener) {
        return this.#eventDispatcher.removeEventListener(type, listener);
    }

    // SERVER

    /** @type {ws.WebSocketServer?} */
    #server;
    get server() {
        return this.#server;
    }
    set server(newServer) {
        if (this.#server == newServer) {
            _console.log("redundant WebSocket assignment");
            return;
        }
        _console.log("assigning server...");

        if (this.#server) {
            _console.log("clearing existing server...");
            removeEventListeners(this.#server, this.#boundServerListeners);
        }

        addEventListeners(newServer, this.#boundServerListeners);
        this.#server = newServer;

        _console.log("assigned server");
    }

    /** @param {DataView} data */
    broadcast(data) {
        this.server.clients.forEach((client) => {
            client.send(data);
        });
    }

    // SERVER LISTENERS
    #boundServerListeners = {
        close: this.#onServerClose.bind(this),
        connection: this.#onServerConnection.bind(this),
        error: this.#onServerError.bind(this),
        headers: this.#onServerHeaders.bind(this),
        listening: this.#onServerListening.bind(this),
    };

    #onServerClose() {
        _console.log("server.close");
    }
    /** @param {ws.WebSocket} client */
    #onServerConnection(client) {
        _console.log("server.connection");
        client.isAlive = true;
        client.pingClientTimer = new Timer(() => this.#pingClient(client), pingTimeout);
        client.pingClientTimer.start();
        addEventListeners(client, this.#boundClientListeners);
        this.#dispatchEvent({ type: "clientConnected", message: { client } });
    }
    /** @param {Error} error */
    #onServerError(error) {
        _console.error(error);
    }
    #onServerHeaders() {
        //_console.log("server.headers");
    }
    #onServerListening() {
        _console.log("server.listening");
    }

    // CLIENT LISTENERS
    #boundClientListeners = {
        open: this.#onClientOpen.bind(this),
        message: this.#onClientMessage.bind(this),
        close: this.#onClientClose.bind(this),
        error: this.#onClientError.bind(this),
    };
    /** @param {ws.Event} event */
    #onClientOpen(event) {
        _console.log("client.open");
    }
    /** @param {ws.MessageEvent} event */
    #onClientMessage(event) {
        _console.log("client.message");
        const client = event.target;
        client.isAlive = true;
        client.pingClientTimer.restart();
        const dataView = new DataView(dataToArrayBuffer(event.data));
        this.#parseClientMessage(client, dataView);
    }
    /** @param {ws.CloseEvent} event */
    #onClientClose(event) {
        _console.log("client.close");
        const client = event.target;
        client.pingClientTimer.stop();
        removeEventListeners(client, this.#boundClientListeners);
        this.#dispatchEvent({ type: "clientDisconnected", message: { client } });
    }
    /** @param {ws.ErrorEvent} event */
    #onClientError(event) {
        _console.log("client.error");
    }

    // PARSING

    static #TextDecoder = new TextDecoder();
    get #textDecoder() {
        return WebSocketServer.#TextDecoder;
    }

    /**
     * @param {ws.WebSocket} client
     * @param {DataView} dataView
     */
    #parseClientMessage(client, dataView) {
        let byteOffset = 0;
        while (byteOffset < dataView.byteLength) {
            const messageTypeEnum = dataView.getUint8(byteOffset++);
            const messageType = ServerMessageTypes[messageTypeEnum];
            const messageByteLength = dataView.getUint8(byteOffset++);

            _console.log({ messageTypeEnum, messageType, messageByteLength });
            _console.assertWithError(messageType, `invalid messageTypeEnum ${messageTypeEnum}`);

            let _byteOffset = byteOffset;

            switch (messageType) {
                case "ping":
                    client.send(pongMessageBuffer);
                    break;
                case "pong":
                    break;
                case "isScanningAvailable":
                    client.send(this.#isScanningAvailableMessage);
                    break;
                case "isScanning":
                    client.send(this.#isScanningMessage);
                    break;
                case "startScan":
                    scanner.startScan();
                    break;
                case "stopScan":
                    scanner.stopScan();
                    break;
                case "discoveredPeripherals":
                    client.send(this.#discoveredPeripheralsMessage);
                    break;
                case "connectToPeripheral":
                    {
                        const peripheralId = parseStringFromDataView(dataView, _byteOffset);
                        _byteOffset += peripheralId.length;
                        scanner.connectToPeripheral(peripheralId);
                    }
                    break;
                case "disconnectFromPeripheral":
                    {
                        const peripheralId = parseStringFromDataView(dataView, _byteOffset);
                        _byteOffset += peripheralId.length;
                        scanner.disconnectFromPeripheral(peripheralId);
                    }
                    break;
                case "disconnectFromAllPeripherals":
                    // FILL
                    break;
                default:
                    _console.error(`uncaught messageType "${messageType}"`);
                    break;
            }

            byteOffset += messageByteLength;
        }
    }

    // CLIENT MESSAGING
    get #isScanningAvailableMessage() {
        return createServerMessage({ type: "isScanningAvailable", data: scanner.isAvailable });
    }
    get #isScanningMessage() {
        return createServerMessage({ type: "isScanning", data: scanner.isScanning });
    }

    /** @param {ws.BufferLike} message */
    #broadcastMessage(message) {
        this.server.clients.forEach((client) => {
            client.send(message);
        });
    }

    // PING
    /** @param {ws.WebSocket} client */
    #pingClient(client) {
        if (!client.isAlive) {
            client.terminate();
            return;
        }
        client.isAlive = false;
        client.send(pingMessage);
    }

    // SCANNER
    #boundScannerListeners = {
        isAvailable: this.#onScannerIsAvailable.bind(this),
        isScanning: this.#onScannerIsScanning.bind(this),
        discoveredPeripheral: this.#onScannerDiscoveredPeripheral.bind(this),
        expiredDiscoveredPeripheral: this.#onExpiredDiscoveredPeripheral.bind(this),
    };

    /** @param {ScannerEvent} event */
    #onScannerIsAvailable(event) {
        this.#broadcastMessage(this.#isScanningAvailableMessage);
    }
    /** @param {ScannerEvent} event */
    #onScannerIsScanning(event) {
        this.#broadcastMessage(this.#isScanningMessage);
    }
    /** @param {ScannerEvent} event */
    #onScannerDiscoveredPeripheral(event) {
        /** @type {DiscoveredPeripheral} */
        const discoveredPeripheral = event.message.discoveredPeripheral;
        console.log(discoveredPeripheral);

        this.#broadcastMessage(this.#createDiscoveredPeripheralMessage(discoveredPeripheral));
    }
    /** @param {ScannerEvent} event */
    #onExpiredDiscoveredPeripheral(event) {
        /** @type {DiscoveredPeripheral} */
        const discoveredPeripheral = event.message.discoveredPeripheral;
        console.log("expired", discoveredPeripheral);

        this.#broadcastMessage(this.#createExpiredDiscoveredPeripheralMessage(discoveredPeripheral));
    }

    /** @param {DiscoveredPeripheral} discoveredPeripheral */
    #createDiscoveredPeripheralMessage(discoveredPeripheral) {
        return createServerMessage({ type: "discoveredPeripheral", data: discoveredPeripheral });
    }
    get #discoveredPeripheralsMessage() {
        return createServerMessage(
            ...scanner.discoveredPeripheralsArray.map((discoveredPeripheral) => {
                return { type: "discoveredPeripheral", data: discoveredPeripheral };
            })
        );
    }

    /** @param {DiscoveredPeripheral} discoveredPeripheral */
    #createExpiredDiscoveredPeripheralMessage(discoveredPeripheral) {
        return createServerMessage({ type: "expiredDiscoveredPeripheral", data: discoveredPeripheral.id });
    }
}

export default WebSocketServer;
