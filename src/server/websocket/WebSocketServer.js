import { createConsole } from "../../utils/Console.js";
import { isInNode } from "../../utils/environment.js";
import { addEventListeners, removeEventListeners } from "../../utils/EventDispatcher.js";
import {
    pingTimeout,
    pingMessage,
    ServerMessageTypes,
    createServerMessage,
    parseStringFromDataView,
    createServerDeviceMessage,
} from "../ServerUtils.js";
import { dataToArrayBuffer } from "../../utils/ArrayBufferUtils.js";
import Timer from "../../utils/Timer.js";
import EventDispatcher from "../../utils/EventDispatcher.js";
import scanner from "../../scanner/Scanner.js";
import Device from "../../Device.js";

const _console = createConsole("WebSocketServer", { log: true });

/** @typedef {import("../../utils/EventDispatcher.js").EventDispatcherListener} EventDispatcherListener */
/** @typedef {import("../../utils/EventDispatcher.js").EventDispatcherOptions} EventDispatcherOptions */

/** @typedef {import("../../scanner/BaseScanner.js").ScannerEvent} ScannerEvent */

/** @typedef {"clientConnected" | "clientDisconnected"} ServerEventType */

/** @typedef {import("../../Device.js").DeviceEventType} DeviceEventType */

/**
 * @typedef ServerEvent
 * @type {Object}
 * @property {WebSocketServer} target
 * @property {ServerEventType} type
 * @property {Object} message
 */

/** @typedef {import("../../scanner/BaseScanner.js").DiscoveredDevice} DiscoveredDevice */

if (isInNode) {
    var ws = require("ws");
}

class WebSocketServer {
    constructor() {
        _console.assertWithError(scanner, "no scanner defined");
        addEventListeners(scanner, this.#boundScannerListeners);
        addEventListeners(Device, this.#boundDeviceClassListeners);
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
                case "discoveredDevices":
                    client.send(this.#discoveredDevicesMessage);
                    break;
                case "connectToDevice":
                    {
                        const { string: deviceId } = parseStringFromDataView(dataView, _byteOffset);
                        scanner.connectToDevice(deviceId);
                    }
                    break;
                case "disconnectFromDevice":
                    {
                        const { string: deviceId } = parseStringFromDataView(dataView, _byteOffset);
                        const device = Device.ConnectedDevices.find((device) => device.id == deviceId);
                        if (device) {
                            device.disconnect();
                        } else {
                            _console.error(`no device found with id ${deviceId}`);
                        }
                    }
                    break;
                case "connectedDevices":
                    // FILL - include deviceType, deviceInformation, batteryLevel...
                    break;
                case "deviceMessage":
                    {
                        const { string: deviceId } = parseStringFromDataView(dataView, _byteOffset);
                        const device = Device.ConnectedDevices.find((device) => device.id == deviceId);
                        if (device) {
                            // FILL
                        } else {
                            _console.error(`no device found with id ${deviceId}`);
                        }
                    }
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
        _console.log("broadcasting", message);
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
        discoveredDevice: this.#onScannerDiscoveredDevice.bind(this),
        expiredDiscoveredDevice: this.#onExpiredDiscoveredDevice.bind(this),
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
    #onScannerDiscoveredDevice(event) {
        /** @type {DiscoveredDevice} */
        const discoveredDevice = event.message.discoveredDevice;
        console.log(discoveredDevice);

        this.#broadcastMessage(this.#createDiscoveredDeviceMessage(discoveredDevice));
    }
    /** @param {ScannerEvent} event */
    #onExpiredDiscoveredDevice(event) {
        /** @type {DiscoveredDevice} */
        const discoveredDevice = event.message.discoveredDevice;
        console.log("expired", discoveredDevice);

        this.#broadcastMessage(this.#createExpiredDiscoveredDeviceMessage(discoveredDevice));
    }

    /** @param {DiscoveredDevice} discoveredDevice */
    #createDiscoveredDeviceMessage(discoveredDevice) {
        return createServerMessage({ type: "discoveredDevice", data: discoveredDevice });
    }
    get #discoveredDevicesMessage() {
        return createServerMessage(
            ...scanner.discoveredDevicesArray.map((discoveredDevice) => {
                return { type: "discoveredDevice", data: discoveredDevice };
            })
        );
    }

    /** @param {DiscoveredDevice} discoveredDevice */
    #createExpiredDiscoveredDeviceMessage(discoveredDevice) {
        return createServerMessage({ type: "expiredDiscoveredDevice", data: discoveredDevice.id });
    }

    // DEVICE CLASS LISTENERS
    #boundDeviceClassListeners = {
        deviceConnected: this.#onDeviceConnected.bind(this),
        deviceDisconnected: this.#onDeviceDisconnected.bind(this),
        deviceIsConnected: this.#onDeviceIsConnected.bind(this),
    };

    /** @typedef {import("../../Device.js").StaticDeviceEvent} StaticDeviceEvent */

    /** @param {StaticDeviceEvent} staticDeviceEvent */
    #onDeviceConnected(staticDeviceEvent) {
        /** @type {Device} */
        const device = staticDeviceEvent.message.device;
        _console.log("onDeviceConnected", device.id);
        addEventListeners(device, this.#boundDeviceListeners);
    }

    /** @param {StaticDeviceEvent} staticDeviceEvent */
    #onDeviceDisconnected(staticDeviceEvent) {
        /** @type {Device} */
        const device = staticDeviceEvent.message.device;
        _console.log("onDeviceDisconnected", device.id);
        removeEventListeners(device, this.#boundDeviceListeners);
    }

    /** @param {StaticDeviceEvent} staticDeviceEvent */
    #onDeviceIsConnected(staticDeviceEvent) {
        /** @type {Device} */
        const device = staticDeviceEvent.message.device;
        _console.log("onDeviceIsConnected", device.id);
        this.#broadcastMessage(this.#createDeviceIsConnectedMessage(device));
    }

    /** @param {Device} device */
    #createDeviceIsConnectedMessage(device) {
        return this.#createDeviceMessage(device, { type: "isConnected", data: device.isConnected });
    }

    /** @typedef {import("../ServerUtils.js").ServerDeviceMessage} ServerDeviceMessage */

    /**
     * @param {Device} device
     * @param {...ServerDeviceMessage} messages
     */
    #createDeviceMessage(device, ...messages) {
        return createServerMessage({
            type: "deviceMessage",
            data: [device.id, createServerDeviceMessage(...messages)],
        });
    }

    // DEVICE LISTENERS
    #boundDeviceListeners = {
        sensorData: this.#onDeviceSensorData.bind(this),
    };

    /** @typedef {import("../../Device.js").DeviceEvent} DeviceEvent */

    /** @param {DeviceEvent} deviceEvent */
    #onDeviceSensorData(deviceEvent) {
        /** @type {Device} */
        const device = deviceEvent.target;
        _console.log("onDeviceSensorData", deviceEvent.message);
        // FILL
    }

    /** @param {Device} device */
    #createDeviceInformationMessage(device) {
        return this.#createDeviceMessage(device, { type: "deviceInformation", data: device.deviceInformation });
    }
}

export default WebSocketServer;
