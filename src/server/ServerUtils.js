import { createConsole } from "../utils/Console";

const _console = createConsole("ServerUtils");

export const pingTimeout = 30_000_000;
export const reconnectTimeout = 3_000;

/** @typedef {"ping" | "pong" | "getScan" | "setScan"} ServerMessageType */

/** @type {ServerMessageType[]} */
export const ServerMessageTypes = ["ping", "pong", "getScan", "setScan"];

/** @param {ServerMessageType} serverMessageType */
export function getServerMessageTypeEnum(serverMessageType) {
    _console.assertTypeWithError(serverMessageType, "string");
    _console.assertWithError(
        ServerMessageTypes.includes(serverMessageType),
        `invalid serverMessageType "${serverMessageType}"`
    );
    return ServerMessageTypes.indexOf(serverMessageType);
}

export const pingMessage = Uint8Array.from([getServerMessageTypeEnum("ping")]);
export const pongMessage = Uint8Array.from([getServerMessageTypeEnum("pong")]);
