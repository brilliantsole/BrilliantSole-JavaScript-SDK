import Device, { SendMessageCallback } from "./Device.ts";
import { createConsole } from "./utils/Console.ts";
import { isInNode } from "./utils/environment.ts";
import EventDispatcher from "./utils/EventDispatcher.ts";
import autoBind from "auto-bind";
import { parseMessage } from "./utils/ParseUtils.ts";
import { concatenateArrayBuffers } from "./utils/ArrayBufferUtils.ts";

const _console = createConsole("CameraManager", { log: true });

export const CameraSensorTypes = ["camera"] as const;
export type CameraSensorType = (typeof CameraSensorTypes)[number];

export const CameraCommands = [
  "takePicture",
  "takePictures",
  "stop",
  "sleep",
  "wake",
] as const;
export type CameraCommand = (typeof CameraCommands)[number];

export const CameraStatuses = [
  "idle",
  "takingPicture",
  "takingPictures",
  "asleep",
] as const;
export type CameraStatus = (typeof CameraStatuses)[number];

export const CameraDataTypes = [
  "headerSize",
  "header",
  "imageSize",
  "image",
  "footerSize",
  "footer",
] as const;
export type CameraDataType = (typeof CameraDataTypes)[number];

export const CameraMessageTypes = [
  "cameraCommand",
  "cameraStatus",
  "cameraData",
] as const;
export type CameraMessageType = (typeof CameraMessageTypes)[number];

export const RequiredCameraMessageTypes: CameraMessageType[] = [
  "cameraStatus",
] as const;

export const CameraEventTypes = [
  ...CameraMessageTypes,
  "cameraImageProgress",
  "cameraImage",
] as const;
export type CameraEventType = (typeof CameraEventTypes)[number];

console.log(CameraEventTypes);

export interface CameraEventMessages {
  cameraStatus: { cameraStatus: CameraStatus };
  cameraImageProgress: { progress: number };
  cameraImage: { blob: Blob; url: string }; //  FIX
}

export type CameraEventDispatcher = EventDispatcher<
  Device,
  CameraEventType,
  CameraEventMessages
>;
export type SendCameraMessageCallback = SendMessageCallback<CameraMessageType>;

class CameraManager {
  constructor() {
    autoBind(this);
  }

  sendMessage!: SendCameraMessageCallback;

  eventDispatcher!: CameraEventDispatcher;
  get #dispatchEvent() {
    return this.eventDispatcher.dispatchEvent;
  }
  get waitForEvent() {
    return this.eventDispatcher.waitForEvent;
  }

  requestRequiredInformation() {
    _console.log("requesting required camera information");
    const messages = RequiredCameraMessageTypes.map((messageType) => ({
      type: messageType,
    }));
    this.sendMessage(messages, false);
  }

  // CAMERA STATUS
  #cameraStatus: CameraStatus = "idle";
  get cameraStatus() {
    return this.#cameraStatus;
  }
  #parseCameraStatus(dataView: DataView) {
    const cameraStatusIndex = dataView.getUint8(0);
    const newCameraStatus = CameraStatuses[cameraStatusIndex];
    this.#updateCameraStatus(newCameraStatus);
  }
  #updateCameraStatus(newCameraStatus: CameraStatus) {
    _console.assertEnumWithError(newCameraStatus, CameraStatuses);
    if (false && newCameraStatus == this.#cameraStatus) {
      _console.log(`redundant cameraStatus ${newCameraStatus}`);
      return;
    }
    this.#cameraStatus = newCameraStatus;
    _console.log(`updated cameraStatus to "${this.cameraStatus}"`);
    this.#dispatchEvent("cameraStatus", { cameraStatus: this.cameraStatus });
  }

  // CAMERA COMMAND
  async #sendCameraCommand(command: CameraCommand, sendImmediately?: boolean) {
    _console.assertEnumWithError(command, CameraCommands);
    _console.log(`sending camera command "${command}"`);

    const promise = this.waitForEvent("cameraStatus");
    _console.log(`setting command "${command}"`);
    const commandEnum = CameraCommands.indexOf(command);
    this.sendMessage(
      [
        {
          type: "cameraCommand",
          data: Uint8Array.from([commandEnum]).buffer,
        },
      ],
      sendImmediately
    );

    await promise;
  }
  async takePicture() {
    await this.#sendCameraCommand("takePicture");
  }

  // CAMERA DATA
  #parseCameraData(dataView: DataView) {
    _console.log("parsing camera data", dataView);
    parseMessage(
      dataView,
      CameraDataTypes,
      this.#onCameraData.bind(this),
      null,
      true
    );
  }
  #onCameraData(cameraDataType: CameraDataType, dataView: DataView) {
    _console.log({ cameraDataType, dataView });
    switch (cameraDataType) {
      case "headerSize":
        this.#headerSize = dataView.getUint16(0, true);
        _console.log({ headerSize: this.#headerSize });
        this.#headerData = undefined;
        this.#headerProgress == 0;
        break;
      case "header":
        this.#headerData = concatenateArrayBuffers(this.#headerData, dataView);
        _console.log({ headerData: this.#headerData });
        this.#headerProgress = this.#headerData?.byteLength / this.#headerSize;
        _console.log({ headerProgress: this.#headerProgress });
        if (this.#headerProgress == 1) {
          _console.log("finished getting header data");
        }
        break;
      case "imageSize":
        this.#imageSize = dataView.getUint16(0, true);
        _console.log({ imageSize: this.#imageSize });
        this.#imageData = undefined;
        this.#imageProgress == 0;
        break;
      case "image":
        this.#imageData = concatenateArrayBuffers(this.#imageData, dataView);
        _console.log({ imageData: this.#imageData });
        this.#imageProgress = this.#imageData?.byteLength / this.#imageSize;
        _console.log({ imageProgress: this.#imageProgress });
        if (this.#imageProgress == 1) {
          _console.log("finished getting image data");
          if (this.#headerProgress == 1) {
            this.#buildImage();
          }
        }
        break;
      case "footerSize":
        this.#footerSize = dataView.getUint16(0, true);
        _console.log({ footerSize: this.#footerSize });
        this.#footerData = undefined;
        this.#footerProgress == 0;
        break;
      case "footer":
        this.#footerData = concatenateArrayBuffers(this.#footerData, dataView);
        _console.log({ footerData: this.#footerData });
        this.#footerProgress = this.#footerData?.byteLength / this.#footerSize;
        _console.log({ footerProgress: this.#footerProgress });
        if (this.#footerProgress == 1) {
          _console.log("finished getting footer data");
          if (this.#imageProgress == 1) {
            this.#buildImage();
          }
        }
        break;
    }
  }

  #headerSize: number = 0;
  #headerData?: ArrayBuffer;
  #headerProgress: number = 0;

  #imageSize: number = 0;
  #imageData?: ArrayBuffer;
  #imageProgress: number = 0;

  #footerSize: number = 0;
  #footerData?: ArrayBuffer;
  #footerProgress: number = 0;

  #buildImage() {
    _console.log("building image...");
    const imageData = concatenateArrayBuffers(
      this.#headerData,
      this.#imageData,
      this.#footerData
    );
    _console.log({ imageData });

    let blob = new Blob([imageData], { type: "image/jpeg" });
    _console.log("created blob", blob);

    const url = URL.createObjectURL(blob);
    _console.log("created url", url);

    // FILL - header stuff

    this.#dispatchEvent("cameraImage", { url, blob });
  }

  // MESSAGE
  parseMessage(messageType: CameraMessageType, dataView: DataView) {
    _console.log({ messageType, dataView });

    switch (messageType) {
      case "cameraStatus":
        this.#parseCameraStatus(dataView);
        break;
      case "cameraData":
        this.#parseCameraData(dataView);
        break;
      default:
        throw Error(`uncaught messageType ${messageType}`);
    }
  }

  clear() {
    this.#headerProgress = 0;
    this.#imageProgress = 0;
    this.#footerProgress = 0;
  }
}

export default CameraManager;
