import { concatenateArrayBuffers } from "../utils/ArrayBufferUtils";
import { createConsole } from "../utils/Console";

const _console = createConsole("ServerUtils", { log: true });

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
 * | "discoveredPeripherals"
 * | "connect"
 * | "disconnect"
 * | "disconnectAll"
 * | "peripheralConnectionState"
 * | "connectedPeripherals"
 * | "disconnectedPeripherals"
 * | "getRSSI"
 * | "readRSSI"
 * } ServerMessageType
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

/**
 * @param {ServerMessageType} messageType
 * @param {...MessageLike} data
 */
export function createServerMessage(messageType, ...data) {
    return concatenateArrayBuffers(getServerMessageTypeEnum(messageType), ...data);
}

export const pingMessage = createServerMessage("ping");
export const pongMessage = createServerMessage("pong");
export const isScanningAvailableRequestMessage = createServerMessage("isScanningAvailable");
export const isScanningRequestMessage = createServerMessage("isScanning");
export const startScanRequestMessage = createServerMessage("startScan");
export const stopScanRequestMessage = createServerMessage("stopScan");
