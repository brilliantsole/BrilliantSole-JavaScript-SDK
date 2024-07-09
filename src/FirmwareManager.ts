import Device, { SendSmpMessageCallback } from "./Device";
import { getFileBuffer } from "./utils/ArrayBufferUtils";
import { createConsole } from "./utils/Console";
import EventDispatcher from "./utils/EventDispatcher";
import { MCUManager, constants } from "./utils/mcumgr";
import { FileLike } from "./utils/ArrayBufferUtils";

const _console = createConsole("FirmwareManager", { log: true });

export const FirmwareMessageTypes = ["smp"] as const;
export type FirmwareMessageType = (typeof FirmwareMessageTypes)[number];

export const FirmwareEventTypes = [
  ...FirmwareMessageTypes,
  "firmwareImages",
  "firmwareUploadProgress",
  "firmwareStatus",
  "firmwareUploadComplete",
] as const;
export type FirmwareEventType = (typeof FirmwareEventTypes)[number];

export const FirmwareStatuses = ["idle", "uploading", "uploaded", "pending", "testing", "erasing"] as const;
export type FirmwareStatus = (typeof FirmwareStatuses)[number];

interface SmpEventMessage {
  dataView: DataView;
}
interface FirmwareImagesEventMessage {
  firmwareImages: FirmwareImage[];
}
interface FirmwareUploadProgressEventMessage {
  progress: number;
}
interface FirmwareStatusEventMessage {
  firmwareStatus: FirmwareStatus;
}
interface FirmwareUploadCompleteEventMessage {}

export interface FirmwareEventMessages {
  smp: SmpEventMessage;
  firmwareImages: FirmwareImagesEventMessage;
  firmwareUploadProgress: FirmwareUploadProgressEventMessage;
  firmwareStatus: FirmwareStatusEventMessage;
  firmwareUploadComplete: FirmwareUploadCompleteEventMessage;
}

export interface FirmwareImage {
  slot: number;
  active: boolean;
  confirmed: boolean;
  pending: boolean;
  permanent: boolean;
  bootable: boolean;
  version: string;
  hash?: Uint8Array;
  empty?: boolean;
}

class FirmwareManager {
  sendMessage!: SendSmpMessageCallback;

  constructor() {
    this.#assignMcuManagerCallbacks();
  }

  eventDispatcher!: EventDispatcher<Device, FirmwareEventType, FirmwareEventMessages>;
  get addEventListenter() {
    return this.eventDispatcher.addEventListener;
  }
  get #dispatchEvent() {
    return this.eventDispatcher.dispatchEvent;
  }
  get removeEventListener() {
    return this.eventDispatcher.removeEventListener;
  }
  get waitForEvent() {
    return this.eventDispatcher.waitForEvent;
  }

  parseMessage(messageType: FirmwareMessageType, dataView: DataView) {
    _console.log({ messageType });

    switch (messageType) {
      case "smp":
        this.#mcuManager._notification(Array.from(new Uint8Array(dataView.buffer)));
        this.#dispatchEvent("smp", { dataView });
        break;
      default:
        throw Error(`uncaught messageType ${messageType}`);
    }
  }

  async uploadFirmware(file: FileLike) {
    _console.log("uploadFirmware", file);

    const promise = this.waitForEvent("firmwareUploadComplete");

    await this.getImages();

    const arrayBuffer = await getFileBuffer(file);
    const imageInfo = await this.#mcuManager.imageInfo(arrayBuffer);
    _console.log({ imageInfo });

    this.#mcuManager.cmdUpload(arrayBuffer, 1);

    this.#updateStatus("uploading");

    await promise;
  }

  #status: FirmwareStatus = "idle";
  get status() {
    return this.#status;
  }
  #updateStatus(newStatus: FirmwareStatus) {
    _console.assertEnumWithError(newStatus, FirmwareStatuses);
    if (this.#status == newStatus) {
      _console.log(`redundant firmwareStatus assignment "${newStatus}"`);
      return;
    }

    this.#status = newStatus;
    _console.log({ firmwareStatus: this.#status });
    this.#dispatchEvent("firmwareStatus", { firmwareStatus: this.#status });
  }

  // COMMANDS

  #images!: FirmwareImage[];
  get images() {
    return this.#images;
  }
  #assertImages() {
    _console.assertWithError(this.#images, "didn't get imageState");
  }
  #assertValidImageIndex(imageIndex: number) {
    _console.assertTypeWithError(imageIndex, "number");
    _console.assertWithError(imageIndex == 0 || imageIndex == 1, "imageIndex must be 0 or 1");
  }
  async getImages() {
    const promise = this.waitForEvent("firmwareImages");

    _console.log("getting firmware image state...");
    this.sendMessage(Uint8Array.from(this.#mcuManager.cmdImageState()).buffer);

    await promise;
  }

  async testImage(imageIndex: number = 1) {
    this.#assertValidImageIndex(imageIndex);
    this.#assertImages();
    if (!this.#images[imageIndex]) {
      _console.log(`image ${imageIndex} not found`);
      return;
    }
    if (this.#images[imageIndex].pending == true) {
      _console.log(`image ${imageIndex} is already pending`);
      return;
    }
    if (this.#images[imageIndex].empty) {
      _console.log(`image ${imageIndex} is empty`);
      return;
    }

    const promise = this.waitForEvent("smp");

    _console.log("testing firmware image...");
    this.sendMessage(Uint8Array.from(this.#mcuManager.cmdImageTest(this.#images[imageIndex].hash)).buffer);

    await promise;
  }

  async eraseImage() {
    this.#assertImages();
    const promise = this.waitForEvent("smp");

    _console.log("erasing image...");
    this.sendMessage(Uint8Array.from(this.#mcuManager.cmdImageErase()).buffer);

    this.#updateStatus("erasing");

    await promise;
    await this.getImages();
  }

  async confirmImage(imageIndex: number = 0) {
    this.#assertValidImageIndex(imageIndex);
    this.#assertImages();
    if (this.#images[imageIndex].confirmed === true) {
      _console.log(`image ${imageIndex} is already confirmed`);
      return;
    }

    const promise = this.waitForEvent("smp");

    _console.log("confirming image...");
    this.sendMessage(Uint8Array.from(this.#mcuManager.cmdImageConfirm(this.#images[imageIndex].hash)).buffer);

    await promise;
  }

  async echo(string: string) {
    _console.assertTypeWithError(string, "string");

    const promise = this.waitForEvent("smp");

    _console.log("sending echo...");
    this.sendMessage(Uint8Array.from(this.#mcuManager.smpEcho(string)).buffer);

    await promise;
  }

  async reset() {
    const promise = this.waitForEvent("smp");

    _console.log("resetting...");
    this.sendMessage(Uint8Array.from(this.#mcuManager.cmdReset()).buffer);

    await promise;
  }

  // MTU
  #mtu!: number;
  get mtu() {
    return this.#mtu;
  }
  set mtu(newMtu: number) {
    this.#mtu = newMtu;
    this.#mcuManager._mtu = newMtu;
  }

  // MCUManager
  #mcuManager = new MCUManager();

  #assignMcuManagerCallbacks() {
    this.#mcuManager.onMessage(this.#onMcuMessage.bind(this));

    this.#mcuManager.onFileDownloadNext(this.#onMcuFileDownloadNext);
    this.#mcuManager.onFileDownloadProgress(this.#onMcuFileDownloadProgress.bind(this));
    this.#mcuManager.onFileDownloadFinished(this.#onMcuFileDownloadFinished.bind(this));

    this.#mcuManager.onFileUploadNext(this.#onMcuFileUploadNext.bind(this));
    this.#mcuManager.onFileUploadProgress(this.#onMcuFileUploadProgress.bind(this));
    this.#mcuManager.onFileUploadFinished(this.#onMcuFileUploadFinished.bind(this));

    this.#mcuManager.onImageUploadNext(this.#onMcuImageUploadNext.bind(this));
    this.#mcuManager.onImageUploadProgress(this.#onMcuImageUploadProgress.bind(this));
    this.#mcuManager.onImageUploadFinished(this.#onMcuImageUploadFinished.bind(this));
  }

  #onMcuMessage({ op, group, id, data, length }: { op: number; group: number; id: number; data: any; length: number }) {
    _console.log("onMcuMessage", ...arguments);

    switch (group) {
      case constants.MGMT_GROUP_ID_OS:
        switch (id) {
          case constants.OS_MGMT_ID_ECHO:
            _console.log(`echo "${data.r}"`);
            break;
          case constants.OS_MGMT_ID_TASKSTAT:
            _console.table(data.tasks);
            break;
          case constants.OS_MGMT_ID_MPSTAT:
            _console.log(data);
            break;
        }
        break;
      case constants.MGMT_GROUP_ID_IMAGE:
        switch (id) {
          case constants.IMG_MGMT_ID_STATE:
            this.#onMcuImageState(data);
        }
        break;
      default:
        throw Error(`uncaught mcuMessage group ${group}`);
    }
  }

  #onMcuFileDownloadNext() {
    _console.log("onMcuFileDownloadNext", ...arguments);
  }
  #onMcuFileDownloadProgress() {
    _console.log("onMcuFileDownloadProgress", ...arguments);
  }
  #onMcuFileDownloadFinished() {
    _console.log("onMcuFileDownloadFinished", ...arguments);
  }

  #onMcuFileUploadNext() {
    _console.log("onMcuFileUploadNext");
  }
  #onMcuFileUploadProgress() {
    _console.log("onMcuFileUploadProgress");
  }
  #onMcuFileUploadFinished() {
    _console.log("onMcuFileUploadFinished");
  }

  #onMcuImageUploadNext({ packet }: { packet: number[] }) {
    _console.log("onMcuImageUploadNext");
    this.sendMessage(Uint8Array.from(packet).buffer);
  }
  #onMcuImageUploadProgress({ percentage }: { percentage: number }) {
    const progress = percentage / 100;
    _console.log("onMcuImageUploadProgress", ...arguments);
    this.#dispatchEvent("firmwareUploadProgress", { progress });
  }
  async #onMcuImageUploadFinished() {
    _console.log("onMcuImageUploadFinished", ...arguments);

    await this.getImages();

    this.#dispatchEvent("firmwareUploadProgress", { progress: 100 });
    this.#dispatchEvent("firmwareUploadComplete", {});
  }

  #onMcuImageState({ images }: { images?: FirmwareImage[] }) {
    if (images) {
      this.#images = images;
      _console.log("images", this.#images);
    } else {
      _console.log("no images found");
      return;
    }

    let newStatus: FirmwareStatus = "idle";

    if (this.#images.length == 2) {
      if (!this.#images[1].bootable) {
        _console.warn('Slot 1 has a invalid image. Click "Erase Image" to erase it or upload a different image');
      } else if (!this.#images[0].confirmed) {
        _console.log(
          'Slot 0 has a valid image. Click "Confirm Image" to confirm it or wait and the device will swap images back.'
        );
        newStatus = "testing";
      } else {
        if (this.#images[1].pending) {
          _console.log("reset to upload to the new firmware image");
          newStatus = "pending";
        } else {
          _console.log("Slot 1 has a valid image. run testImage() to test it or upload a different image.");
          newStatus = "uploaded";
        }
      }
    }

    if (this.#images.length == 1) {
      this.#images.push({
        slot: 1,
        empty: true,
        version: "Empty",
        pending: false,
        confirmed: false,
        bootable: false,
        active: false,
        permanent: false,
      });

      _console.log("Select a firmware upload image to upload to slot 1.");
    }

    this.#updateStatus(newStatus);
    this.#dispatchEvent("firmwareImages", { firmwareImages: this.#images });
  }
}

export default FirmwareManager;
