import { createConsole } from "../utils/Console";

const _console = createConsole("ServerUtils");

export const pingTimeout = 30_000_000;
export const reconnectTimeout = 3_000;

/** @typedef {"ping" | "pong"} MessageType */

/** @type {MessageType[]} */
export const MessageTypes = ["ping", "pong"];

/** @param {MessageType} messageType */
export function getMessageTypeEnum(messageType) {
    _console.assertTypeWithError(messageType, "string");
    _console.assertWithError(MessageTypes.includes(messageType), `invalid messageType "${messageType}"`);
    return MessageTypes.indexOf(messageType);
}

export const pingMessage = Uint8Array.from([getMessageTypeEnum("ping")]);
export const pongMessage = Uint8Array.from([getMessageTypeEnum("pong")]);
