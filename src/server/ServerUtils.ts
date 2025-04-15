import { DeviceEventTypes } from "../Device.ts";
import {
  ConnectionMessageType,
  ConnectionMessageTypes,
} from "../connection/BaseConnectionManager.ts";
import { concatenateArrayBuffers } from "../utils/ArrayBufferUtils.ts";
import { createConsole } from "../utils/Console.ts";
import { DeviceEventType } from "../Device.ts";

const _console = createConsole("ServerUtils", { log: false });

export const ServerMessageTypes = [
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

export const DeviceMessageTypes = [
  "connectionStatus",
  "batteryLevel",
  "deviceInformation",
  "rx",
  "smp",
] as const;
export type DeviceMessageType = (typeof DeviceMessageTypes)[number];

// MESSAGING

export type MessageLike =
  | number
  | number[]
  | ArrayBufferLike
  | DataView
  | boolean
  | string
  | any;

export interface Message<MessageType extends string> {
  type: MessageType;
  data?: MessageLike | MessageLike[];
}

export function createMessage<MessageType extends string>(
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

    const messageDataLengthDataView = new DataView(new ArrayBuffer(2));
    messageDataLengthDataView.setUint16(
      0,
      messageDataArrayBufferByteLength,
      true
    );

    return concatenateArrayBuffers(
      messageTypeEnum,
      messageDataLengthDataView,
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

export type ClientDeviceMessage =
  | ConnectionMessageType
  | Message<ConnectionMessageType>;
export function createClientDeviceMessage(...messages: ClientDeviceMessage[]) {
  _console.log("createClientDeviceMessage", ...messages);
  return createMessage(ConnectionMessageTypes, ...messages);
}

// STATIC MESSAGES
export const isScanningAvailableRequestMessage = createServerMessage(
  "isScanningAvailable"
);
export const isScanningRequestMessage = createServerMessage("isScanning");
export const startScanRequestMessage = createServerMessage("startScan");
export const stopScanRequestMessage = createServerMessage("stopScan");
export const discoveredDevicesMessage =
  createServerMessage("discoveredDevices");
