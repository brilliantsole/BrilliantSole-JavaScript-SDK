import Device from "../Device";
import { concatenateArrayBuffers } from "../utils/ArrayBufferUtils";
import { createConsole } from "../utils/Console";

const _console = createConsole("ServerUtils", { log: false });

export const pingTimeout = 30_000_000;
export const reconnectTimeout = 3_000;

/**
 * @typedef { "ping"
 * | "pong"
 * | "isScanningAvailable"
 * | "isScanning"
 * | "startScan"
 * | "stopScan"
 * | "discoveredDevice"
 * | "discoveredDevices"
 * | "expiredDiscoveredDevice"
 * | "connectToDevice"
 * | "disconnectFromDevice"
 * | "connectedDevices"
 * | "deviceMessage"
 * } ServerMessageType
 */

/**
 * @typedef ServerMessage
 * @type {Object}
 * @property {ServerMessageType} type
 * @property {MessageLike|MessageLike[]?} data
 */

/** @type {ServerMessageType[]} */
export const ServerMessageTypes = [
    "ping",
    "pong",
    "isScanningAvailable",
    "isScanning",
    "startScan",
    "stopScan",
    "discoveredDevice",
    "discoveredDevices",
    "expiredDiscoveredDevice",
    "connectToDevice",
    "disconnectFromDevice",
    "connectedDevices",
    "deviceMessage",
];

/** @typedef {Number | Number[] | ArrayBufferLike | DataView} MessageLike */

/** @param {...ServerMessage|ServerMessageType} messages */
export function createServerMessage(...messages) {
    _console.log("createServerMessage", ...messages);

    const messageBuffers = messages.map((message) => {
        if (typeof message == "string") {
            message = { type: message };
        }

        if ("data" in message) {
            if (!Array.isArray(message.data)) {
                message.data = [message.data];
            }
        } else {
            message.data = [];
        }

        const messageDataArrayBuffer = concatenateArrayBuffers(...message.data);
        const messageDataArrayBufferByteLength = messageDataArrayBuffer.byteLength;

        _console.assertEnumWithError(message.type, ServerMessageTypes);
        const messageTypeEnum = ServerMessageTypes.indexOf(message.type);

        return concatenateArrayBuffers(messageTypeEnum, messageDataArrayBufferByteLength, messageDataArrayBuffer);
    });
    _console.log("messageBuffers", ...messageBuffers);
    return concatenateArrayBuffers(...messageBuffers);
}

/** @typedef {import("../Device").DeviceEventType} DeviceEventType */

/**
 * @typedef ServerDeviceMessage
 * @type {Object}
 * @property {DeviceEventType} type
 * @property {MessageLike|MessageLike[]?} data
 */

/** @param {...DeviceEventType|ServerDeviceMessage} messages */
export function createServerDeviceMessage(...messages) {
    _console.log("createServerDeviceMessage", ...messages);

    const messageBuffers = messages.map((message) => {
        if (typeof message == "string") {
            message = { type: message };
        }

        if ("data" in message) {
            if (!Array.isArray(message.data)) {
                message.data = [message.data];
            }
        } else {
            message.data = [];
        }

        const messageDataArrayBuffer = concatenateArrayBuffers(...message.data);
        const messageDataArrayBufferByteLength = messageDataArrayBuffer.byteLength;

        _console.assertEnumWithError(message.type, Device.EventTypes);
        const messageTypeEnum = Device.EventTypes.indexOf(message.type);

        _console.log({ messageTypeEnum, messageDataArrayBufferByteLength });

        return concatenateArrayBuffers(messageTypeEnum, messageDataArrayBufferByteLength, messageDataArrayBuffer);
    });
    _console.log("messageBuffers", ...messageBuffers);
    return concatenateArrayBuffers(...messageBuffers);
}

const textDecoder = new TextDecoder();

/**
 * @param {DataView} dataView
 * @param {number} byteOffset
 */
export function parseStringFromDataView(dataView, byteOffset) {
    const stringLength = dataView.getUint8(byteOffset++);
    const string = textDecoder.decode(dataView.buffer.slice(byteOffset, byteOffset + stringLength));
    byteOffset += stringLength;
    return { string, byteOffset };
}

export const pingMessage = createServerMessage("ping");
export const pongMessage = createServerMessage("pong");
export const isScanningAvailableRequestMessage = createServerMessage("isScanningAvailable");
export const isScanningRequestMessage = createServerMessage("isScanning");
export const startScanRequestMessage = createServerMessage("startScan");
export const stopScanRequestMessage = createServerMessage("stopScan");
export const discoveredDevicesMessage = createServerMessage("discoveredDevices");
