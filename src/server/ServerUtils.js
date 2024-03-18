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
 * | "discoveredPeripheral"
 * | "expiredDiscoveredPeripheral"
 * | "discoveredPeripherals"
 * | "connectToPeripheral"
 * | "disconnectFromPeripheral"
 * | "disconnectFromAllPeripherals"
 * | "peripheralConnectionState"
 * | "connectedPeripherals"
 * | "disconnectedPeripherals"
 * | "peripheralRSSI"
 * | "getPeripheralRSSI"
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
    "discoveredPeripheral",
    "discoveredPeripherals",
    "expiredDiscoveredPeripheral",
    "peripheralRSSI",
    "connectToPeripheral",
    "disconnectFromPeripheral",
];

/** @param {ServerMessageType} serverMessageType */
export function getServerMessageTypeEnum(serverMessageType) {
    _console.assertTypeWithError(serverMessageType, "string");
    _console.assertWithError(
        ServerMessageTypes.includes(serverMessageType),
        `invalid serverMessageType "${serverMessageType}"`
    );
    return ServerMessageTypes.indexOf(serverMessageType);
}

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

        return concatenateArrayBuffers(
            getServerMessageTypeEnum(message.type),
            messageDataArrayBufferByteLength,
            messageDataArrayBuffer
        );
    });
    _console.log("messageBuffers", ...messageBuffers);
    return concatenateArrayBuffers(...messageBuffers);
}

export const pingMessage = createServerMessage("ping");
export const pongMessage = createServerMessage("pong");
export const isScanningAvailableRequestMessage = createServerMessage("isScanningAvailable");
export const isScanningRequestMessage = createServerMessage("isScanning");
export const startScanRequestMessage = createServerMessage("startScan");
export const stopScanRequestMessage = createServerMessage("stopScan");
export const discoveredPeripheralsMessage = createServerMessage("discoveredPeripherals");
