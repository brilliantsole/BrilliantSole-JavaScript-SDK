import Device, { SendMessageCallback } from "./Device.ts";
import { createConsole } from "./utils/Console.ts";
import { isInBrowser, isInNode } from "./utils/environment.ts";
import EventDispatcher from "./utils/EventDispatcher.ts";
import autoBind from "auto-bind";
import { parseMessage } from "./utils/ParseUtils.ts";
import {
  concatenateArrayBuffers,
  UInt8ByteBuffer,
} from "./utils/ArrayBufferUtils.ts";

/** NODE_START */
import sharp from "sharp";
import { spawn } from "child_process";
import fs from "fs/promises";
/** NODE_END */

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
  "autoWhiteBalanceEnabled",
  "autoGainEnabled",
  "exposure",
  "autoExposureEnabled",
  "autoExposureLevel",
  "brightness",
  "saturation",
  "contrast",
  "sharpness",
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
  "isRecordingCamera",
  "startRecordingCamera",
  "stopRecordingCamera",
  "cameraRecording",
  "autoPicture",
] as const;
export type CameraEventType = (typeof CameraEventTypes)[number];

export interface CameraImage {
  blob: Blob;
  url: string;
  arrayBuffer: ArrayBuffer;
  timestamp: number;
  latency: number;
}
export interface CameraEventMessages {
  cameraStatus: {
    cameraStatus: CameraStatus;
    previousCameraStatus: CameraStatus;
  };
  getCameraConfiguration: { cameraConfiguration: CameraConfiguration };
  cameraImageProgress: { progress: number; type: CameraDataType };
  cameraImage: CameraImage;
  isRecordingCamera: {
    isRecordingCamera: boolean;
  };
  cameraRecording: {
    images: CameraImage[];
    configuration: CameraConfiguration;
    blob: Blob;
    url: string;
  };
  autoPicture: {
    autoPicture: boolean;
  };
  startRecordingCamera: {};
  stopRecordingCamera: {};
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
  #parseCameraStatus(dataView: DataView<ArrayBuffer>) {
    const cameraStatusIndex = dataView.getUint8(0);
    const newCameraStatus = CameraStatuses[cameraStatusIndex];
    this.#updateCameraStatus(newCameraStatus);
  }
  #latestTakingPictureTimestamp = 0;
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

    if (this.cameraStatus == "takingPicture") {
      this.#latestTakingPictureTimestamp = Date.now();
    }

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
  #parseCameraData(dataView: DataView<ArrayBuffer>) {
    _console.log("parsing camera data", dataView);
    parseMessage(
      dataView,
      CameraDataTypes,
      this.#onCameraData.bind(this),
      null,
      true
    );
  }
  #onCameraData(
    cameraDataType: CameraDataType,
    dataView: DataView<ArrayBuffer>
  ) {
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
        this.#imageSize = dataView.getUint32(0, true);
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
          if (this.#headerProgress == 1 && this.#footerProgress == 1) {
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
  async #buildImage() {
    _console.log("building image...");
    const now = Date.now();
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

    const cameraImage: CameraImage = {
      url,
      blob,
      timestamp: this.#latestTakingPictureTimestamp,
      latency: now - this.#latestTakingPictureTimestamp,
      arrayBuffer: imageData,
    };

    this.#dispatchEvent("cameraImage", cameraImage);

    if (this.isRecording) {
      this.#cameraRecordingData!.push(cameraImage);
      if (isInBrowser) {
        if (
          this.#recordingImage &&
          this.#recordingCanvasContext &&
          this.#recordingCanvas
        ) {
          const promise = new Promise<void>((resolve) => {
            this.#recordingImage!.onload = () => resolve();
          });
          this.#recordingImage.src = cameraImage.url;
          await promise;
          const { width, height } = this.#recordingImage;
          if (this.#recordingCanvas.width != width) {
            this.#recordingCanvas.width = width;
          }
          if (this.#recordingCanvas.height != height) {
            this.#recordingCanvas.height = height;
          }
          this.#recordingCanvasContext!.drawImage(
            this.#recordingImage!,
            0,
            0,
            width,
            height
          );
        } else {
          _console.error(
            "camera recording failed - recording image/canvas/context not found"
          );
          this.stopRecording();
        }
      }
    }

    this.#didBuildImage = true;

    if (this.autoPicture) {
      this.takePicture();
    }
  }

  #buildHeaderCameraData() {
    if (this.#headerSize && this.#headerProgress == 1 && this.#headerData) {
      const headerDataView = new DataView(new ArrayBuffer(8));
      headerDataView.setUint8(0, CameraDataTypes.indexOf("headerSize"));
      headerDataView.setUint16(1, 2, true);
      headerDataView.setUint16(3, this.#headerSize, true);
      headerDataView.setUint8(5, CameraDataTypes.indexOf("header"));
      headerDataView.setUint16(6, this.#headerSize, true);
      return concatenateArrayBuffers(headerDataView, this.#headerData);
    }
  }
  #buildFooterCameraData() {
    if (this.#footerSize && this.#footerProgress == 1 && this.#footerData) {
      const footerDataView = new DataView(new ArrayBuffer(8));
      footerDataView.setUint8(0, CameraDataTypes.indexOf("footerSize"));
      footerDataView.setUint16(1, 2, true);
      footerDataView.setUint16(3, this.#footerSize, true);
      footerDataView.setUint8(5, CameraDataTypes.indexOf("footer"));
      footerDataView.setUint16(6, this.#footerSize, true);
      return concatenateArrayBuffers(footerDataView, this.#footerData);
    }
  }
  buildCameraData() {
    const cameraData = [
      this.#buildHeaderCameraData(),
      this.#buildFooterCameraData(),
    ];
    return concatenateArrayBuffers(cameraData);
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
    resolution: { min: 96, max: 2560 },
    qualityFactor: { min: 0, max: 100 },

    shutter: { min: 4, max: 16383 },
    gain: { min: 0, max: 248 },
    redGain: { min: 0, max: 2047 },
    greenGain: { min: 0, max: 2047 },
    blueGain: { min: 0, max: 2047 },

    autoWhiteBalanceEnabled: { min: 0, max: 1 },
    autoGainEnabled: { min: 0, max: 1 },

    exposure: { min: 0, max: 1200 },
    autoExposureEnabled: { min: 0, max: 1 },
    autoExposureLevel: { min: -4, max: 4 },

    brightness: { min: -3, max: 3 },
    saturation: { min: -4, max: 4 },
    contrast: { min: -3, max: 3 },
    sharpness: { min: -3, max: 3 },
  };
  get cameraConfigurationRanges() {
    return this.#cameraConfigurationRanges;
  }

  #parseCameraConfiguration(dataView: DataView<ArrayBuffer>) {
    const parsedCameraConfiguration: CameraConfiguration = {};

    let byteOffset = 0;
    const size = 2;
    while (byteOffset < dataView.byteLength) {
      const cameraConfigurationTypeIndex = dataView.getUint8(byteOffset++);
      const cameraConfigurationType =
        CameraConfigurationTypes[cameraConfigurationTypeIndex];
      _console.assertWithError(
        cameraConfigurationType,
        `invalid cameraConfigurationTypeIndex ${cameraConfigurationTypeIndex}`
      );

      _console.log({ cameraConfigurationType });

      let value: number | undefined;
      switch (cameraConfigurationType) {
        // FILL
        case "autoExposureLevel":
        case "brightness":
        case "saturation":
        case "contrast":
        case "sharpness":
          value = dataView.getInt16(byteOffset, true);
          break;
        default:
          value = dataView.getUint16(byteOffset, true);
          break;
      }

      _console.log({ [cameraConfigurationType]: value });
      _console.assertTypeWithError(value, "number");
      parsedCameraConfiguration[cameraConfigurationType] = value;
      byteOffset += size;
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
      const offset = index * 3 + 1;
      switch (cameraConfigurationType) {
        // FILL
        case "autoExposureLevel":
          dataView.setInt16(offset, value, true);
          break;
        default:
          dataView.setUint16(offset, value, true);
          break;
      }
    });
    _console.log({ sensorConfigurationData: dataView });
    return dataView;
  }

  // RECORDING
  #isRecording = false;
  get isRecording() {
    return this.#isRecording;
  }
  #cameraRecordingData?: CameraImage[];
  get isRecordingAvailable() {
    return Boolean((isInBrowser && window.MediaRecorder) || isInNode);
  }
  #recordingCanvas?: HTMLCanvasElement;
  #recordingImage?: HTMLImageElement;
  #recordingCanvasContext?: CanvasRenderingContext2D;
  #recordingCanvasStream?: MediaStream;
  #recordingMediaRecorder?: MediaRecorder;
  #recordingChunks?: Blob[];
  startRecording(audioStream?: MediaStream) {
    if (!this.isRecordingAvailable) {
      _console.error("camera recording is not available");
      return;
    }
    if (this.isRecording) {
      _console.log("already recording camera");
      return;
    }
    this.#cameraRecordingData = [];
    if (isInBrowser) {
      this.#recordingCanvas = document.createElement("canvas");
      this.#recordingCanvasContext = this.#recordingCanvas.getContext("2d")!;
      this.#recordingImage = document.createElement("img");
      this.#recordingCanvasStream = this.#recordingCanvas.captureStream(30);
      console.log("audioStream", audioStream);
      const mediaStream = audioStream
        ? new MediaStream([
            ...this.#recordingCanvasStream.getVideoTracks(),
            ...audioStream.getAudioTracks(),
          ])
        : this.#recordingCanvasStream;
      this.#recordingMediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: "video/webm; codecs=vp9,opus",
      });
      this.#recordingChunks = [];
      this.#recordingMediaRecorder.ondataavailable = (e) => {
        _console.log("adding chunk", e.data);
        this.#recordingChunks!.push(e.data);
      };
      this.#recordingMediaRecorder.start();
    }
    this.#isRecording = true;
    this.#dispatchEvent("isRecordingCamera", {
      isRecordingCamera: this.isRecording,
    });
    this.#dispatchEvent("startRecordingCamera", {});
  }
  async stopRecording() {
    if (!this.isRecording) {
      _console.log("already not recording");
      return;
    }
    if (this.#cameraRecordingData && this.#cameraRecordingData.length > 0) {
      const images = this.#cameraRecordingData;
      if (images?.length > 0) {
        if (isInBrowser) {
          this.#recordingMediaRecorder!.onstop = () => {
            _console.log("recordingMediaRecorder onstop");
            const blob = new Blob(this.#recordingChunks, {
              type: this.#recordingMediaRecorder?.mimeType,
            });
            const url = URL.createObjectURL(blob);
            this.#dispatchEvent("cameraRecording", {
              images,
              configuration: structuredClone(this.cameraConfiguration),
              blob,
              url,
            });
          };
          this.#recordingMediaRecorder?.stop();
        } else if (isInNode) {
          const metadata = await sharp(images[0].arrayBuffer).metadata();
          const { width, height } = metadata;
          const fps = 30;
          const filename = `${new Date()
            .toLocaleString()
            .replaceAll("/", "-")}.mp4`;
          const ffmpeg = spawn("ffmpeg", [
            "-f",
            "rawvideo",
            "-pix_fmt",
            "rgba",
            "-s",
            `${width}x${height}`,
            "-r",
            `${fps}`,
            "-i",
            "-",
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-movflags",
            "+faststart",
            filename,
          ]);

          const timestamps = images.map(
            (image) => image.timestamp - images[0].timestamp
          );
          for (let i = 0; i < images.length; i++) {
            const image = images[i];
            const rawRGBA = await sharp(image.arrayBuffer, { failOn: "none" })
              .resize(width, height)
              .ensureAlpha()
              .raw()
              .toBuffer();

            const isLast = i == images.length - 1;
            const duration = isLast ? 0 : timestamps[i + 1] - timestamps[i];
            const frames = Math.max(
              1,
              Math.round(Math.max(0, duration) / (1000 / fps))
            );
            for (let j = 0; j < frames; j++) {
              ffmpeg.stdin.write(rawRGBA);
            }
          }
          const promise = new Promise<void>((resolve, reject) => {
            ffmpeg.on("close", (code) => {
              if (code === 0) resolve();
              else reject(new Error(`ffmpeg exited with ${code}`));
            });
            ffmpeg.on("error", reject);
          });
          ffmpeg.stdin.end();
          await promise;

          const videoData = await fs.readFile(filename);

          const blob = new Blob([videoData], { type: "video/mp4" });
          const url = URL.createObjectURL(blob);

          this.#dispatchEvent("cameraRecording", {
            images,
            configuration: structuredClone(this.cameraConfiguration),
            blob,
            url,
          });
          await fs.unlink(filename);
        }
      }
    }
    this.#isRecording = false;
    this.#cameraRecordingData = undefined;
    this.#dispatchEvent("isRecordingCamera", {
      isRecordingCamera: this.isRecording,
    });
    this.#dispatchEvent("stopRecordingCamera", {});
  }
  toggleRecording(audioStream?: MediaStream) {
    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording(audioStream);
    }
  }

  // AUTO
  #autoPicture = false;
  get autoPicture() {
    return this.#autoPicture;
  }
  set autoPicture(newAutoPicture) {
    if (this.#autoPicture == newAutoPicture) {
      return;
    }
    this.#autoPicture = newAutoPicture;
    _console.log({ autoPicture: this.#autoPicture });
    this.#dispatchEvent("autoPicture", { autoPicture: this.autoPicture });
  }

  // MESSAGE
  parseMessage(
    messageType: CameraMessageType,
    dataView: DataView<ArrayBuffer>
  ) {
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
    this.#cameraConfiguration = {};
    this.#headerProgress = 0;
    this.#imageProgress = 0;
    this.#footerProgress = 0;
    this.autoPicture = false;
    if (this.isRecording) {
      this.stopRecording();
    }
  }
}

export default CameraManager;
