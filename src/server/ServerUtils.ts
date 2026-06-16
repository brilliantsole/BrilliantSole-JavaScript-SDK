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
  "requiredDeviceInformation",
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
  | DataView<ArrayBuffer>
  | boolean
  | string
  | any;

export interface Message<MessageType extends string> {
  type: MessageType;
  data?: MessageLike | MessageLike[];
}

export function createMessage<MessageType extends string>(
  enumeration: readonly MessageType[],
  use2Bytes: boolean,
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

    let messageDataLengthDataView: DataView;
    if (use2Bytes) {
      messageDataLengthDataView = new DataView(new ArrayBuffer(2));
      messageDataLengthDataView.setUint16(
        0,
        messageDataArrayBufferByteLength,
        true,
      );
    } else {
      messageDataLengthDataView = new DataView(new ArrayBuffer(1));
      messageDataLengthDataView.setUint8(0, messageDataArrayBufferByteLength);
    }

    return concatenateArrayBuffers(
      messageTypeEnum,
      messageDataLengthDataView,
      messageDataArrayBuffer,
    );
  });
  _console.log("messageBuffers", ...messageBuffers);
  return concatenateArrayBuffers(...messageBuffers);
}

export type ServerMessage = Message<ServerMessageType>;
export type ServerMessageOrMessageType = ServerMessage | ServerMessageType;
export function createServerMessage(...messages: ServerMessageOrMessageType[]) {
  _console.log("createServerMessage", ...messages);
  return createMessage(ServerMessageTypes, true, ...messages);
}

export type DeviceMessage = Message<DeviceEventType>;
export type DeviceMessageOrMessageType = DeviceEventType | DeviceMessage;
export function createDeviceMessage(...messages: DeviceMessageOrMessageType[]) {
  _console.log("createDeviceMessage", ...messages);
  return createMessage(DeviceEventTypes, true, ...messages);
}

export type ClientDeviceMessage = Message<ConnectionMessageType>;
export type ClientDeviceMessageOrMessageType =
  | ConnectionMessageType
  | ClientDeviceMessage;
export function createClientDeviceMessage(
  ...messages: ClientDeviceMessageOrMessageType[]
) {
  _console.log("createClientDeviceMessage", ...messages);
  return createMessage(ConnectionMessageTypes, true, ...messages);
}

// STATIC MESSAGES
export const isScanningAvailableRequestMessage = createServerMessage(
  "isScanningAvailable",
);
export const isScanningRequestMessage = createServerMessage("isScanning");
export const startScanRequestMessage = createServerMessage("startScan");
export const stopScanRequestMessage = createServerMessage("stopScan");
export const discoveredDevicesMessage =
  createServerMessage("discoveredDevices");
