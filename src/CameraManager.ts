import Device, { SendMessageCallback } from "./Device.ts";
import { createConsole } from "./utils/Console.ts";
import { isInNode } from "./utils/environment.ts";
import EventDispatcher from "./utils/EventDispatcher.ts";
import autoBind from "auto-bind";
import { parseMessage } from "./utils/ParseUtils.ts";
import {
  concatenateArrayBuffers,
  UInt8ByteBuffer,
} from "./utils/ArrayBufferUtils.ts";

const _console = createConsole("CameraManager", { log: false });

export const CameraSensorTypes = ["camera"] as const;
export type CameraSensorType = (typeof CameraSensorTypes)[number];

export const CameraCommands = [
  "focus",
  "takePicture",
  "stop",
  "sleep",
  "wake",
] as const;
export type CameraCommand = (typeof CameraCommands)[number];

export const CameraStatuses = [
  "idle",
  "focusing",
  "takingPicture",
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

export const CameraConfigurationTypes = [
  "resolution",
  "qualityFactor",
  "shutter",
  "gain",
  "redGain",
  "greenGain",
  "blueGain",
] as const;
export type CameraConfigurationType = (typeof CameraConfigurationTypes)[number];

export const CameraMessageTypes = [
  "cameraStatus",
  "cameraCommand",
  "getCameraConfiguration",
  "setCameraConfiguration",
  "cameraData",
] as const;
export type CameraMessageType = (typeof CameraMessageTypes)[number];

export type CameraConfiguration = {
  [cameraConfigurationType in CameraConfigurationType]?: number;
};
export type CameraConfigurationRanges = {
  [cameraConfigurationType in CameraConfigurationType]: {
    min: number;
    max: number;
  };
};

export const RequiredCameraMessageTypes: CameraMessageType[] = [
  "getCameraConfiguration",
  "cameraStatus",
] as const;

export const CameraEventTypes = [
  ...CameraMessageTypes,
  "cameraImageProgress",
  "cameraImage",
] as const;
export type CameraEventType = (typeof CameraEventTypes)[number];

export interface CameraEventMessages {
  cameraStatus: {
    cameraStatus: CameraStatus;
    previousCameraStatus: CameraStatus;
  };
  getCameraConfiguration: { cameraConfiguration: CameraConfiguration };
  cameraImageProgress: { progress: number; type: CameraDataType };
  cameraImage: { blob: Blob; url: string };
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
  #cameraStatus!: CameraStatus;
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
    if (newCameraStatus == this.#cameraStatus) {
      _console.log(`redundant cameraStatus ${newCameraStatus}`);
      return;
    }
    const previousCameraStatus = this.#cameraStatus;
    this.#cameraStatus = newCameraStatus;
    _console.log(`updated cameraStatus to "${this.cameraStatus}"`);
    this.#dispatchEvent("cameraStatus", {
      cameraStatus: this.cameraStatus,
      previousCameraStatus,
    });

    if (
      this.#cameraStatus != "takingPicture" &&
      this.#imageProgress > 0 &&
      !this.#didBuildImage
    ) {
      this.#buildImage();
    }
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
          data: UInt8ByteBuffer(commandEnum),
        },
      ],
      sendImmediately
    );

    await promise;
  }
  #assertIsAsleep() {
    _console.assertWithError(
      this.#cameraStatus == "asleep",
      `camera is not asleep - currently ${this.#cameraStatus}`
    );
  }
  #assertIsAwake() {
    _console.assertWithError(
      this.#cameraStatus != "asleep",
      `camera is not awake - currently ${this.#cameraStatus}`
    );
  }
  async focus() {
    this.#assertIsAwake();
    await this.#sendCameraCommand("focus");
  }
  async takePicture() {
    this.#assertIsAwake();
    await this.#sendCameraCommand("takePicture");
  }
  async stop() {
    this.#assertIsAwake();
    await this.#sendCameraCommand("stop");
  }
  async sleep() {
    this.#assertIsAwake();
    await this.#sendCameraCommand("sleep");
  }
  async wake() {
    this.#assertIsAsleep();
    await this.#sendCameraCommand("wake");
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
        this.#dispatchEvent("cameraImageProgress", {
          progress: this.#headerProgress,
          type: "header",
        });
        if (this.#headerProgress == 1) {
          _console.log("finished getting header data");
        }
        break;
      case "imageSize":
        this.#imageSize = dataView.getUint16(0, true);
        _console.log({ imageSize: this.#imageSize });
        this.#imageData = undefined;
        this.#imageProgress == 0;
        this.#didBuildImage = false;
        break;
      case "image":
        this.#imageData = concatenateArrayBuffers(this.#imageData, dataView);
        _console.log({ imageData: this.#imageData });
        this.#imageProgress = this.#imageData?.byteLength / this.#imageSize;
        _console.log({ imageProgress: this.#imageProgress });
        this.#dispatchEvent("cameraImageProgress", {
          progress: this.#imageProgress,
          type: "image",
        });
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
        this.#dispatchEvent("cameraImageProgress", {
          progress: this.#footerProgress,
          type: "footer",
        });
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

  #didBuildImage: boolean = false;
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

    this.#dispatchEvent("cameraImage", { url, blob });

    this.#didBuildImage = true;
  }

  // CONFIG
  #cameraConfiguration: CameraConfiguration = {};
  get cameraConfiguration() {
    return this.#cameraConfiguration;
  }
  #availableCameraConfigurationTypes!: CameraConfigurationType[];
  get availableCameraConfigurationTypes() {
    return this.#availableCameraConfigurationTypes;
  }

  #cameraConfigurationRanges: CameraConfigurationRanges = {
    resolution: { min: 100, max: 720 },
    qualityFactor: { min: 15, max: 60 },
    shutter: { min: 4, max: 16383 },
    gain: { min: 1, max: 248 },
    redGain: { min: 0, max: 1023 },
    greenGain: { min: 0, max: 1023 },
    blueGain: { min: 0, max: 1023 },
  };
  get cameraConfigurationRanges() {
    return this.#cameraConfigurationRanges;
  }

  #parseCameraConfiguration(dataView: DataView) {
    const parsedCameraConfiguration: CameraConfiguration = {};

    let byteOffset = 0;
    while (byteOffset < dataView.byteLength) {
      const cameraConfigurationTypeIndex = dataView.getUint8(byteOffset++);
      const cameraConfigurationType =
        CameraConfigurationTypes[cameraConfigurationTypeIndex];
      _console.assertWithError(
        cameraConfigurationType,
        `invalid cameraConfigurationTypeIndex ${cameraConfigurationTypeIndex}`
      );
      parsedCameraConfiguration[cameraConfigurationType] = dataView.getUint16(
        byteOffset,
        true
      );
      byteOffset += 2;
    }

    _console.log({ parsedCameraConfiguration });
    this.#availableCameraConfigurationTypes = Object.keys(
      parsedCameraConfiguration
    ) as CameraConfigurationType[];
    this.#cameraConfiguration = parsedCameraConfiguration;
    this.#dispatchEvent("getCameraConfiguration", {
      cameraConfiguration: this.#cameraConfiguration,
    });
  }

  #isCameraConfigurationRedundant(cameraConfiguration: CameraConfiguration) {
    let cameraConfigurationTypes = Object.keys(
      cameraConfiguration
    ) as CameraConfigurationType[];
    return cameraConfigurationTypes.every((cameraConfigurationType) => {
      return (
        this.cameraConfiguration[cameraConfigurationType] ==
        cameraConfiguration[cameraConfigurationType]
      );
    });
  }
  async setCameraConfiguration(newCameraConfiguration: CameraConfiguration) {
    _console.log({ newCameraConfiguration });
    if (this.#isCameraConfigurationRedundant(newCameraConfiguration)) {
      _console.log("redundant camera configuration");
      return;
    }
    const setCameraConfigurationData = this.#createData(newCameraConfiguration);
    _console.log({ setCameraConfigurationData });

    const promise = this.waitForEvent("getCameraConfiguration");
    this.sendMessage([
      {
        type: "setCameraConfiguration",
        data: setCameraConfigurationData.buffer,
      },
    ]);
    await promise;
  }

  #assertAvailableCameraConfigurationType(
    cameraConfigurationType: CameraConfigurationType
  ) {
    _console.assertWithError(
      this.#availableCameraConfigurationTypes,
      "must get initial cameraConfiguration"
    );
    const isCameraConfigurationTypeAvailable =
      this.#availableCameraConfigurationTypes?.includes(
        cameraConfigurationType
      );
    _console.assertWithError(
      isCameraConfigurationTypeAvailable,
      `unavailable camera configuration type "${cameraConfigurationType}"`
    );
    return isCameraConfigurationTypeAvailable;
  }

  static AssertValidCameraConfigurationType(
    cameraConfigurationType: CameraConfigurationType
  ) {
    _console.assertEnumWithError(
      cameraConfigurationType,
      CameraConfigurationTypes
    );
  }
  static AssertValidCameraConfigurationTypeEnum(
    cameraConfigurationTypeEnum: number
  ) {
    _console.assertTypeWithError(cameraConfigurationTypeEnum, "number");
    _console.assertWithError(
      cameraConfigurationTypeEnum in CameraConfigurationTypes,
      `invalid cameraConfigurationTypeEnum ${cameraConfigurationTypeEnum}`
    );
  }

  #createData(cameraConfiguration: CameraConfiguration) {
    let cameraConfigurationTypes = Object.keys(
      cameraConfiguration
    ) as CameraConfigurationType[];
    cameraConfigurationTypes = cameraConfigurationTypes.filter(
      (cameraConfigurationType) =>
        this.#assertAvailableCameraConfigurationType(cameraConfigurationType)
    );

    const dataView = new DataView(
      new ArrayBuffer(cameraConfigurationTypes.length * 3)
    );
    cameraConfigurationTypes.forEach((cameraConfigurationType, index) => {
      CameraManager.AssertValidCameraConfigurationType(cameraConfigurationType);
      const cameraConfigurationTypeEnum = CameraConfigurationTypes.indexOf(
        cameraConfigurationType
      );
      dataView.setUint8(index * 3, cameraConfigurationTypeEnum);

      const value = cameraConfiguration[cameraConfigurationType]!;
      //this.#assertValidCameraConfigurationValue(cameraConfigurationType, value);
      dataView.setUint16(index * 3 + 1, value, true);
    });
    _console.log({ sensorConfigurationData: dataView });
    return dataView;
  }

  // MESSAGE
  parseMessage(messageType: CameraMessageType, dataView: DataView) {
    _console.log({ messageType, dataView });

    switch (messageType) {
      case "cameraStatus":
        this.#parseCameraStatus(dataView);
        break;
      case "getCameraConfiguration":
      case "setCameraConfiguration":
        this.#parseCameraConfiguration(dataView);
        break;
      case "cameraData":
        this.#parseCameraData(dataView);
        break;
      default:
        throw Error(`uncaught messageType ${messageType}`);
    }
  }

  clear() {
    // @ts-ignore
    this.#cameraStatus = undefined;
    this.#headerProgress = 0;
    this.#imageProgress = 0;
    this.#footerProgress = 0;
  }
}

export default CameraManager;
