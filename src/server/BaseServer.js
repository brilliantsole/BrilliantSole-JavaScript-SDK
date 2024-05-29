import { createConsole } from "../utils/Console";
import EventDispatcher from "../utils/EventDispatcher";
import { createServerMessage, createDeviceMessage, ServerMessageTypes, pongMessage } from "./ServerUtils.js";
import Device from "../Device.js";
import { addEventListeners, removeEventListeners } from "../utils/EventDispatcher";
import scanner from "../scanner/Scanner.js";
import { parseMessage, parseStringFromDataView } from "../utils/ParseUtils.js";
import { concatenateArrayBuffers } from "../utils/ArrayBufferUtils.js";
import BaseConnectionManager from "../connection/BaseConnectionManager.js";

const _console = createConsole("BaseServer", { log: true });

/** @typedef {import("../utils/EventDispatcher.js").EventDispatcherListener} EventDispatcherListener */
/** @typedef {import("../utils/EventDispatcher.js").EventDispatcherOptions} EventDispatcherOptions */

/** @typedef {import("../scanner/BaseScanner.js").ScannerEvent} ScannerEvent */
/** @typedef {import("../scanner/BaseScanner.js").DiscoveredDevice} DiscoveredDevice */

/** @typedef {import("../Device.js").DeviceEventType} DeviceEventType */

/** @typedef {import("./ServerUtils.js").DeviceMessage} DeviceMessage */

/** @typedef {"clientConnected" | "clientDisconnected"} ServerEventType */
/**
 * @typedef ServerEvent
 * @type {Object}
 * @property {BaseServer} target
 * @property {ServerEventType} type
 * @property {Object} message
 */

class BaseServer {
    /** @throws {Error} if abstract class */
    #assertIsSubclass() {
        _console.assertWithError(this.constructor != BaseServer, `${this.constructor.name} must be subclassed`);
    }

    // EVENT DISPATCHER

    /** @type {ServerEventType[]} */
    static #EventTypes = ["clientConnected", "clientDisconnected"];
    static get EventTypes() {
        return this.#EventTypes;
    }
    get eventTypes() {
        return BaseServer.#EventTypes;
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
     * @protected
     * @param {ServerEvent} event
     */
    dispatchEvent(event) {
        this.#eventDispatcher.dispatchEvent(event);
    }

    /**
     * @param {ServerEventType} type
     * @param {EventDispatcherListener} listener
     */
    removeEventListener(type, listener) {
        return this.#eventDispatcher.removeEventListener(type, listener);
    }

    // CONSTRUCTOR

    constructor() {
        this.#assertIsSubclass();

        _console.assertWithError(scanner, "no scanner defined");

        addEventListeners(scanner, this.#boundScannerListeners);
        addEventListeners(Device, this.#boundDeviceClassListeners);
        addEventListeners(this, this.#boundServerListeners);
    }

    get numberOfClients() {
        return 0;
    }

    static #ClearSensorConfigurationsWhenNoClients = true;
    static get ClearSensorConfigurationsWhenNoClients() {
        return this.#ClearSensorConfigurationsWhenNoClients;
    }
    static set ClearSensorConfigurationsWhenNoClients(newValue) {
        _console.assertTypeWithError(newValue, "boolean");
        this.#ClearSensorConfigurationsWhenNoClients = newValue;
    }

    #clearSensorConfigurationsWhenNoClients = BaseServer.#ClearSensorConfigurationsWhenNoClients;
    get clearSensorConfigurationsWhenNoClients() {
        return this.#clearSensorConfigurationsWhenNoClients;
    }
    set clearSensorConfigurationsWhenNoClients(newValue) {
        _console.assertTypeWithError(newValue, "boolean");
        this.#clearSensorConfigurationsWhenNoClients = newValue;
    }

    // SERVER LISTENERS
    #boundServerListeners = {
        clientConnected: this.#onClientConnected.bind(this),
        clientDisconnected: this.#onClientDisconnected.bind(this),
    };

    /** @param {ServerEvent} event */
    #onClientConnected(event) {
        const client = event.message.client;
        _console.log("onClientConnected");
    }
    /** @param {ServerEvent} event */
    #onClientDisconnected(event) {
        const client = event.message.client;
        _console.log("onClientDisconnected");
        if (this.numberOfClients == 0 && this.clearSensorConfigurationsWhenNoClients) {
            Device.ConnectedDevices.forEach((device) => {
                device.clearSensorConfiguration();
                device.setTfliteInferencingEnabled(false);
            });
        }
    }

    // CLIENT MESSAGING

    /**
     * @protected
     * @param {ArrayBuffer} message
     */
    broadcastMessage(message) {
        _console.log("broadcasting", message);
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
        this.broadcastMessage(this.#isScanningAvailableMessage);
    }
    get #isScanningAvailableMessage() {
        return createServerMessage({ type: "isScanningAvailable", data: scanner.isAvailable });
    }

    /** @param {ScannerEvent} event */
    #onScannerIsScanning(event) {
        this.broadcastMessage(this.#isScanningMessage);
    }
    get #isScanningMessage() {
        return createServerMessage({ type: "isScanning", data: scanner.isScanning });
    }

    /** @param {ScannerEvent} event */
    #onScannerDiscoveredDevice(event) {
        /** @type {DiscoveredDevice} */
        const discoveredDevice = event.message.discoveredDevice;
        _console.log(discoveredDevice);

        this.broadcastMessage(this.#createDiscoveredDeviceMessage(discoveredDevice));
    }
    /** @param {DiscoveredDevice} discoveredDevice */
    #createDiscoveredDeviceMessage(discoveredDevice) {
        return createServerMessage({ type: "discoveredDevice", data: discoveredDevice });
    }

    /** @param {ScannerEvent} event */
    #onExpiredDiscoveredDevice(event) {
        /** @type {DiscoveredDevice} */
        const discoveredDevice = event.message.discoveredDevice;
        _console.log("expired", discoveredDevice);
        this.broadcastMessage(this.#createExpiredDiscoveredDeviceMessage(discoveredDevice));
    }
    /** @param {DiscoveredDevice} discoveredDevice */
    #createExpiredDiscoveredDeviceMessage(discoveredDevice) {
        return createServerMessage({ type: "expiredDiscoveredDevice", data: discoveredDevice.bluetoothId });
    }

    get #discoveredDevicesMessage() {
        return createServerMessage(
            ...scanner.discoveredDevicesArray.map((discoveredDevice) => {
                return { type: "discoveredDevice", data: discoveredDevice };
            })
        );
    }

    get #connectedDevicesMessage() {
        return createServerMessage({
            type: "connectedDevices",
            data: JSON.stringify(Device.ConnectedDevices.map((device) => device.bluetoothId)),
        });
    }

    // DEVICE LISTENERS

    #boundDeviceListeners = {
        connectionMessage: this.#onDeviceConnectionMessage.bind(this),
    };

    /**
     * @param {Device} device
     * @param {DeviceEventType} messageType
     * @param {DataView?} dataView
     * @returns {DeviceMessage}
     */
    #createDeviceMessage(device, messageType, dataView) {
        return { type: messageType, data: dataView || device.latestConnectionMessage.get(messageType) };
    }

    /** @typedef {import("../Device.js").DeviceEvent} DeviceEvent */
    /** @typedef {import("../connection/BaseConnectionManager.js").ConnectionMessageType} ConnectionMessageType */

    /** @param {DeviceEvent} deviceEvent */
    #onDeviceConnectionMessage(deviceEvent) {
        const device = deviceEvent.target;
        _console.log("onDeviceConnectionMessage", deviceEvent.message);

        if (!device.isConnected) {
            return;
        }

        /** @type {ConnectionMessageType} */
        const messageType = deviceEvent.message.messageType;
        /** @type {DataView} */
        const dataView = deviceEvent.message.dataView;

        this.broadcastMessage(
            this.#createDeviceServerMessage(device, this.#createDeviceMessage(device, messageType, dataView))
        );
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
        _console.log("onDeviceConnected", device.bluetoothId);
        addEventListeners(device, this.#boundDeviceListeners);
    }

    /** @param {StaticDeviceEvent} staticDeviceEvent */
    #onDeviceDisconnected(staticDeviceEvent) {
        /** @type {Device} */
        const device = staticDeviceEvent.message.device;
        _console.log("onDeviceDisconnected", device.bluetoothId);
        removeEventListeners(device, this.#boundDeviceListeners);
    }

    /** @param {StaticDeviceEvent} staticDeviceEvent */
    #onDeviceIsConnected(staticDeviceEvent) {
        /** @type {Device} */
        const device = staticDeviceEvent.message.device;
        _console.log("onDeviceIsConnected", device.bluetoothId);
        this.broadcastMessage(this.#createDeviceIsConnectedMessage(device));
    }
    /** @param {Device} device */
    #createDeviceIsConnectedMessage(device) {
        return this.#createDeviceServerMessage(device, { type: "isConnected", data: device.isConnected });
    }

    /**
     * @param {Device} device
     * @param {...DeviceEventType|DeviceMessage} messages
     */
    #createDeviceServerMessage(device, ...messages) {
        return createServerMessage({
            type: "deviceMessage",
            data: [device.bluetoothId, createDeviceMessage(...messages)],
        });
    }

    // PARSING

    /** @typedef {import("./ServerUtils.js").ServerMessageType} ServerMessageType */

    /**
     * @protected
     * @param {DataView} dataView
     */
    parseClientMessage(dataView) {
        /** @type {ArrayBuffer[]} */
        let responseMessages = [];

        parseMessage(dataView, ServerMessageTypes, this.#onClientMessage.bind(this), { responseMessages }, true);

        responseMessages = responseMessages.filter(Boolean);

        if (responseMessages.length > 0) {
            return concatenateArrayBuffers(responseMessages);
        }
    }

    /**
     * @param {ServerMessageType} messageType
     * @param {DataView} dataView
     * @param {{responseMessages: ArrayBuffer[]}} context
     */
    #onClientMessage(messageType, dataView, context) {
        switch (messageType) {
            case "ping":
                responseMessages.push(pongMessage);
                break;
            case "pong":
                break;
            case "isScanningAvailable":
                context.responseMessages.push(this.#isScanningAvailableMessage);
                break;
            case "isScanning":
                context.responseMessages.push(this.#isScanningMessage);
                break;
            case "startScan":
                scanner.startScan();
                break;
            case "stopScan":
                scanner.stopScan();
                break;
            case "discoveredDevices":
                context.responseMessages.push(this.#discoveredDevicesMessage);
                break;
            case "connectToDevice":
                {
                    const { string: deviceId } = parseStringFromDataView(dataView);
                    scanner.connectToDevice(deviceId);
                }
                break;
            case "disconnectFromDevice":
                {
                    const { string: deviceId } = parseStringFromDataView(dataView);
                    const device = Device.ConnectedDevices.find((device) => device.bluetoothId == deviceId);
                    if (!device) {
                        _console.error(`no device found with id ${deviceId}`);
                        break;
                    }
                    device.disconnect();
                }
                break;
            case "connectedDevices":
                context.responseMessages.push(this.#connectedDevicesMessage);
                break;
            case "deviceMessage":
                {
                    const { string: deviceId, byteOffset } = parseStringFromDataView(dataView);
                    const device = Device.ConnectedDevices.find((device) => device.bluetoothId == deviceId);
                    if (!device) {
                        _console.error(`no device found with id ${deviceId}`);
                        break;
                    }
                    const _dataView = new DataView(dataView.buffer, dataView.byteOffset + byteOffset);
                    context.responseMessages.push(this.parseClientDeviceMessage(device, _dataView));
                }
                break;
            default:
                _console.error(`uncaught messageType "${messageType}"`);
                break;
        }
    }

    /**
     * @protected
     * @param {Device} device
     * @param {DataView} dataView
     */
    parseClientDeviceMessage(device, dataView) {
        _console.log("onDeviceMessage", device.bluetoothId, dataView);

        /** @type {(DeviceEventType | DeviceMessage)[]} */
        let responseMessages = [];

        parseMessage(
            dataView,
            BaseConnectionManager.MessageTypes,
            this.#parseClientDeviceMessageCallback.bind(this),
            { responseMessages, device },
            true
        );

        if (responseMessages.length > 0) {
            return this.#createDeviceServerMessage(device, ...responseMessages);
        }
    }

    /**
     * @param {ConnectionMessageType} messageType
     * @param {DataView} dataView
     * @param {{responseMessages: (DeviceEventType | DeviceMessage)[], device: Device}} context
     */
    #parseClientDeviceMessageCallback(messageType, dataView, context) {
        switch (messageType) {
            case "smp":
                context.device.connectionManager.sendSmpMessage(dataView.buffer);
                break;
            case "tx":
                context.device.connectionManager.sendTxData(dataView.buffer);
                break;
            default:
                context.responseMessages.push(this.#createDeviceMessage(context.device, messageType));
                break;
        }
    }
}

export default BaseServer;
