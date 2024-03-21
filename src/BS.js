import { setAllConsoleLevelFlags, setConsoleLevelFlagsForType } from "./utils/Console.js";
import { default as Device } from "./Device.js";
import { default as Scanner } from "./scanner/Scanner.js";
import { default as DevicePair } from "./devicePair/DevicePair.js";
import { default as WebSocketClient } from "./server/websocket/WebSocketClient.js";
import { default as WebSocketServer } from "./server/websocket/WebSocketServer.js";

/** @typedef {Device} Device */
/** @typedef {DevicePair} DevicePair */

export default {
    setAllConsoleLevelFlags,
    setConsoleLevelFlagsForType,
    Device,
    DevicePair,
    WebSocketClient,
    WebSocketServer,
    Scanner,
};
