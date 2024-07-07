import Device from "../Device";
import BaseConnectionManager from "../connection/BaseConnectionManager";
import { concatenateArrayBuffers } from "../utils/ArrayBufferUtils";
import { createConsole } from "../utils/Console";

const _console = createConsole("ServerUtils", { log: false });

export const pingTimeout = 30_000_000;
export const reconnectTimeout = 3_000;

// MESSAGING

/** @typedef {Number | Number[] | ArrayBufferLike | DataView} MessageLike */

/**
 * @typedef {Object} Message
 * @property {string} type
 * @property {MessageLike|MessageLike[]?} data
 */

/**
 * @param {string[]} enumeration
 * @param  {...(Message|string)} messages
 */
function createMessage(enumeration, ...messages) {
  _console.log("createMessage", ...messages);

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

    _console.assertEnumWithError(message.type, enumeration);
    const messageTypeEnum = enumeration.indexOf(message.type);

    return concatenateArrayBuffers(
      messageTypeEnum,
      Uint16Array.from([messageDataArrayBufferByteLength]),
      messageDataArrayBuffer
    );
  });
  _console.log("messageBuffers", ...messageBuffers);
  return concatenateArrayBuffers(...messageBuffers);
}

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
 * @typedef {Object} ServerMessage
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

/** @param {...ServerMessage|ServerMessageType} messages */
export function createServerMessage(...messages) {
  return createMessage(ServerMessageTypes, ...messages);
}

/** @typedef {import("../Device").DeviceEventType} DeviceEventType */

/**
 * @typedef {Object} DeviceMessage
 * @property {DeviceEventType} type
 * @property {MessageLike|MessageLike[]?} data
 */

/** @param {...DeviceEventType|DeviceMessage} messages */
export function createDeviceMessage(...messages) {
  _console.log("createDeviceMessage", ...messages);
  return createMessage(Device.EventTypes, ...messages);
}

/** @typedef {import("../connection/BaseConnectionManager").ConnectionMessageType} ConnectionMessageType */

/**
 * @typedef {Object} ClientDeviceMessage
 * @property {ConnectionMessageType} type
 * @property {MessageLike|MessageLike[]?} data
 */

/** @param {...ConnectionMessageType|ClientDeviceMessage} messages */
export function createClientDeviceMessage(...messages) {
  return createMessage(BaseConnectionManager.MessageTypes, ...messages);
}

// STATIC MESSAGES

export const pingMessage = createServerMessage("ping");
export const pongMessage = createServerMessage("pong");
export const isScanningAvailableRequestMessage = createServerMessage("isScanningAvailable");
export const isScanningRequestMessage = createServerMessage("isScanning");
export const startScanRequestMessage = createServerMessage("startScan");
export const stopScanRequestMessage = createServerMessage("stopScan");
export const discoveredDevicesMessage = createServerMessage("discoveredDevices");
