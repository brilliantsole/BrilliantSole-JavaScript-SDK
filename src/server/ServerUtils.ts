import Device from "../Device";
import BaseConnectionManager from "../connection/BaseConnectionManager";
import { concatenateArrayBuffers } from "../utils/ArrayBufferUtils";
import { createConsole } from "../utils/Console";

const _console = createConsole("ServerUtils", { log: false });

export const pingTimeout = 30_000_000;
export const reconnectTimeout = 3_000;

// MESSAGING

export type MessageLike = Number | Number[] | ArrayBufferLike | DataView;

export interface Message {
  type: string;
  data?: MessageLike | MessageLike[];
}

function createMessage(enumeration: readonly string[], ...messages: (Message | string)[]) {
  _console.log("createMessage", ...messages);

  const messageBuffers = messages.map((message) => {
    if (typeof message == "string") {
      message = { type: message };
    }

    if ("data" in message) {
      if (!Array.isArray(message.data)) {
        message.data = [message.data!];
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
] as const;
export type ServerMessageType = (typeof ServerMessageTypes)[number];

export interface ServerMessage extends Message {
  type: ServerMessageType;
}

export function createServerMessage(...messages: (ServerMessage | ServerMessageType)[]) {
  return createMessage(ServerMessageTypes, ...messages);
}

import { DeviceEventType } from "../Device";

export interface DeviceMessage extends Message {
  type: DeviceEventType;
}

export function createDeviceMessage(...messages: (DeviceEventType | DeviceMessage)[]) {
  _console.log("createDeviceMessage", ...messages);
  return createMessage(Device.EventTypes, ...messages);
}

type ConnectionMessageType = import("../connection/BaseConnectionManager").ConnectionMessageType;

interface ClientDeviceMessage extends Message {
  type: ConnectionMessageType;
}

export function createClientDeviceMessage(...messages: (ConnectionMessageType | ClientDeviceMessage)[]) {
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
