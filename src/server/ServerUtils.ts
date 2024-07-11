import { DeviceEventTypes } from "../Device";
import { ConnectionMessageType, ConnectionMessageTypes } from "../connection/BaseConnectionManager";
import { concatenateArrayBuffers } from "../utils/ArrayBufferUtils";
import { createConsole } from "../utils/Console";
import { DeviceEventType } from "../Device";

const _console = createConsole("ServerUtils", { log: false });

export const pingTimeout = 30_000_000;
export const reconnectTimeout = 3_000;

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

// MESSAGING

export type MessageLike = number | number[] | ArrayBufferLike | DataView | boolean | string | any;

export interface Message<MessageType extends string> {
  type: MessageType;
  data?: MessageLike | MessageLike[];
}

function createMessage<MessageType extends string>(
  enumeration: readonly MessageType[],
  ...messages: (Message<MessageType> | MessageType)[]
) {
  _console.log("createMessage", ...messages);

  const messageBuffers = messages.map((message) => {
    if (typeof message == "string") {
      message = { type: message };
    }

    if (message.data != undefined) {
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

export type ServerMessage = ServerMessageType | Message<ServerMessageType>;
export function createServerMessage(...messages: ServerMessage[]) {
  _console.log("createServerMessage", ...messages);
  return createMessage(ServerMessageTypes, ...messages);
}

export type DeviceMessage = DeviceEventType | Message<DeviceEventType>;
export function createDeviceMessage(...messages: DeviceMessage[]) {
  _console.log("createDeviceMessage", ...messages);
  return createMessage(DeviceEventTypes, ...messages);
}

export type ClientDeviceMessage = ConnectionMessageType | Message<ConnectionMessageType>;
export function createClientDeviceMessage(...messages: ClientDeviceMessage[]) {
  _console.log("createClientDeviceMessage", ...messages);
  return createMessage(ConnectionMessageTypes, ...messages);
}

// STATIC MESSAGES
export const pingMessage = createServerMessage("ping");
export const pongMessage = createServerMessage("pong");
export const isScanningAvailableRequestMessage = createServerMessage("isScanningAvailable");
export const isScanningRequestMessage = createServerMessage("isScanning");
export const startScanRequestMessage = createServerMessage("startScan");
export const stopScanRequestMessage = createServerMessage("stopScan");
export const discoveredDevicesMessage = createServerMessage("discoveredDevices");
