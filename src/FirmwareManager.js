import { getFileBuffer } from "./utils/ArrayBufferUtils.js";
import { createConsole } from "./utils/Console.js";
import EventDispatcher from "./utils/EventDispatcher.js";
import { MCUManager, constants } from "./utils/mcumgr.js";

const _console = createConsole("FirmwareManager", { log: true });

/** @typedef {"smp"} FirmwareMessageType */

/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherOptions} EventDispatcherOptions */

/** @typedef {FirmwareMessageType | "firmwareImages" | "firmwareUploadProgress" | "firmwareStatus" | "firmwareUploadComplete"} FirmwareManagerEventType */

/** @typedef {"idle" | "uploading" | "uploaded" | "pending" | "testing" | "erasing"} FirmwareStatus */

/** @typedef {import("./Device.js").BaseDeviceEvent} BaseDeviceEvent */

/**
 * @typedef {Object} BaseSmpEvent
 * @property {"smp"} type
 */
/** @typedef {BaseDeviceEvent & BaseSmpEvent} SmpEvent */

/**
 * @typedef {Object} BaseFirmwareImagesEvent
 * @property {"firmwareImages"} type
 * @property {{firmwareImages: FirmwareImage[]}} message
 */
/** @typedef {BaseDeviceEvent & BaseFirmwareImagesEvent} FirmwareImagesEvent */

/**
 * @typedef {Object} BaseFirmwareUploadProgressEvent
 * @property {"firmwareUploadProgress"} type
 * @property {{firmwareUploadProgress: number}} message
 */
/** @typedef {BaseDeviceEvent & BaseFirmwareUploadProgressEvent} FirmwareUploadProgressEvent */

/**
 * @typedef {Object} BaseFirmwareUploadCompleteEvent
 * @property {"firmwareUploadComplete"} type
 */
/** @typedef {BaseDeviceEvent & BaseFirmwareUploadCompleteEvent} FirmwareUploadCompleteEvent */

/**
 * @typedef {Object} BaseFirmwareStatusEvent
 * @property {"firmwareStatus"} type
 * @property {{firmwareStatus: FirmwareStatus}} message
 */
/** @typedef {BaseDeviceEvent & BaseFirmwareStatusEvent} FirmwareStatusEvent */

/**
 * @typedef {SmpEvent |
 * FirmwareImagesEvent |
 * FirmwareUploadProgressEvent |
 * FirmwareUploadCompleteEvent |
 * FirmwareStatusEvent
 * } FirmwareManagerEvent
 */
/** @typedef {(event: FirmwareManagerEvent) => void} FirmwareManagerEventListener */

class FirmwareManager {
  /**
   * @callback SendMessageCallback
   * @param {ArrayBuffer} data
   */

  /** @type {SendMessageCallback} */
  sendMessage;

  constructor() {
    this.#assignMcuManagerCallbacks();
  }

  /** @type {FirmwareMessageType[]} */
  static #MessageTypes = ["smp"];
  static get MessageTypes() {
    return this.#MessageTypes;
  }
  get messageTypes() {
    return FirmwareManager.MessageTypes;
  }

  // EVENT DISPATCHER

  /** @type {FirmwareManagerEventType[]} */
  static #EventTypes = [
    ...this.#MessageTypes,
    "firmwareImages",
    "firmwareUploadProgress",
    "firmwareUploadComplete",
    "firmwareStatus",
  ];
  static get EventTypes() {
    return this.#EventTypes;
  }
  get eventTypes() {
    return FirmwareManager.#EventTypes;
  }
  /** @type {EventDispatcher} */
  eventDispatcher;

  /**
   * @param {FirmwareManagerEventType} type
   * @param {FirmwareManagerEventListener} listener
   * @param {EventDispatcherOptions} [options]
   */
  addEventListener(type, listener, options) {
    this.eventDispatcher.addEventListener(type, listener, options);
  }

  /** @param {FirmwareManagerEvent} event */
  #dispatchEvent(event) {
    this.eventDispatcher.dispatchEvent(event);
  }

  /**
   * @param {FirmwareManagerEventType} type
   * @param {FirmwareManagerEventListener} listener
   */
  removeEventListener(type, listener) {
    return this.eventDispatcher.removeEventListener(type, listener);
  }

  /** @param {FirmwareManagerEventType} eventType */
  waitForEvent(eventType) {
    return this.eventDispatcher.waitForEvent(eventType);
  }

  /**
   * @param {FirmwareMessageType} messageType
   * @param {DataView} dataView
   */
  parseMessage(messageType, dataView) {
    _console.log({ messageType });

    switch (messageType) {
      case "smp":
        this.#mcuManager._notification(Array.from(new Uint8Array(dataView.buffer)));
        this.#dispatchEvent({ type: "smp" });
        break;
      default:
        throw Error(`uncaught messageType ${messageType}`);
    }
  }

  /** @typedef {import("./utils/ArrayBufferUtils.js").FileLike} FileLike */

  /** @param {FileLike} file */
  async uploadFirmware(file) {
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

  /** @type {FirmwareStatus[]} */
  static #Statuses = ["idle", "uploading", "uploaded", "pending", "testing", "erasing"];
  static get Statuses() {
    return this.#Statuses;
  }

  /** @type {FirmwareStatus} */
  #status = "idle";
  get status() {
    return this.#status;
  }
  /** @param {FirmwareStatus} newStatus */
  #updateStatus(newStatus) {
    _console.assertEnumWithError(newStatus, FirmwareManager.Statuses);
    if (this.#status == newStatus) {
      _console.log(`redundant firmwareStatus assignment "${newStatus}"`);
      return;
    }

    this.#status = newStatus;
    _console.log({ firmwareStatus: this.#status });
    this.#dispatchEvent({ type: "firmwareStatus", message: { firmwareStatus: this.#status } });
  }

  // COMMANDS

  /**
   * @typedef FirmwareImage
   * @type {object}
   * @property {number} slot
   * @property {boolean} active
   * @property {boolean} confirmed
   * @property {boolean} pending
   * @property {boolean} permanent
   * @property {boolean} bootable
   * @property {string} version
   * @property {Uint8Array} [hash]
   * @property {boolean} [empty]
   */

  /** @type {FirmwareImage[]} */
  #images;
  get images() {
    return this.#images;
  }
  #assertImages() {
    _console.assertWithError(this.#images, "didn't get imageState");
  }
  #assertValidImageIndex(imageIndex) {
    _console.assertTypeWithError(imageIndex, "number");
    _console.assertWithError(imageIndex == 0 || imageIndex == 1, "imageIndex must be 0 or 1");
  }
  async getImages() {
    const promise = this.waitForEvent("firmwareImages");

    _console.log("getting firmware image state...");
    this.sendMessage(Uint8Array.from(this.#mcuManager.cmdImageState()).buffer);

    await promise;
  }

  /** @param {number} imageIndex */
  async testImage(imageIndex = 1) {
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

  /** @param {number} imageIndex */
  async confirmImage(imageIndex = 0) {
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

  /** @param {string} echo */
  async echo(string) {
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

  #mtu;
  get mtu() {
    return this.#mtu;
  }
  set mtu(newMtu) {
    this.#mtu = newMtu;
    this.#mcuManager._mtu = this.#mtu;
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

  #onMcuMessage({ op, group, id, data, length }) {
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
    _console.log("onMcuFileUploadNext", ...arguments);
  }
  #onMcuFileUploadProgress() {
    _console.log("onMcuFileUploadProgress", ...arguments);
  }
  #onMcuFileUploadFinished() {
    _console.log("onMcuFileUploadFinished", ...arguments);
  }

  #onMcuImageUploadNext({ packet }) {
    _console.log("onMcuImageUploadNext", ...arguments);
    this.sendMessage(Uint8Array.from(packet).buffer);
  }
  #onMcuImageUploadProgress({ percentage }) {
    const progress = percentage / 100;
    _console.log("onMcuImageUploadProgress", ...arguments);
    this.#dispatchEvent({ type: "firmwareUploadProgress", message: { firmwareUploadProgress: progress } });
  }
  async #onMcuImageUploadFinished() {
    _console.log("onMcuImageUploadFinished", ...arguments);

    await this.getImages();

    this.#dispatchEvent({ type: "firmwareUploadProgress", message: { firmwareUploadProgress: 100 } });
    this.#dispatchEvent({ type: "firmwareUploadComplete" });
  }

  #onMcuImageState(data) {
    if (data.images) {
      this.#images = data.images;
      _console.log("images", this.#images);
    } else {
      _console.log("no images found");
      return;
    }

    /** @type {FirmwareStatus} */
    let newStatus = "idle";

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
      });

      _console.log("Select a firmware upload image to upload to slot 1.");
    }

    this.#updateStatus(newStatus);
    this.#dispatchEvent({ type: "firmwareImages", message: { firmwareImages: this.#images } });
  }
}

export default FirmwareManager;
