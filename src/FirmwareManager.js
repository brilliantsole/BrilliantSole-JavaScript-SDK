import { getFileBuffer } from "./utils/ArrayBufferUtils.js";
import { createConsole } from "./utils/Console.js";
import EventDispatcher from "./utils/EventDispatcher.js";
import { MCUManager, constants } from "./utils/mcumgr.js";

const _console = createConsole("FirmwareManager", { log: true });

/** @typedef {"smp"} FirmwareMessageType */

/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherListener} EventDispatcherListener */
/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherOptions} EventDispatcherOptions */

/** @typedef {FirmwareMessageType | "firmwareImageState" | "firmwareUpdateProgress" | "firmwareUploadComplete"} FirmwareManagerEventType */

/**
 * @typedef FirmwareManagerEvent
 * @type {Object}
 * @property {FirmwareManager} target
 * @property {FirmwareManagerEventType} type
 * @property {Object} message
 */

/** @typedef {(event: FirmwareManagerEvent) => void} FirmwareManagerEventListener */

class FirmwareManager {
    /**
     * @callback SendMessageCallback
     * @param {FirmwareMessageType} messageType
     * @param {DataView|ArrayBuffer} data
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
        "firmwareImageState",
        "firmwareUpdateProgress",
        "firmwareUploadComplete",
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
     * @param {EventDispatcherOptions} options
     */
    addEventListener(type, listener, options) {
        this.eventDispatcher.addEventListener(type, listener, options);
    }

    /**
     * @param {FirmwareManagerEvent} event
     */
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

    /** @typedef {import("./utils/ArrayBufferUtils.js").FileLike} */

    /** @param {FileLike} file */
    async updateFirmware(file) {
        _console.log("updateFirmware", file);

        const promise = this.waitForEvent("firmwareUploadComplete");

        await this.#getImageState();

        const arrayBuffer = await getFileBuffer(file);
        const imageInfo = await this.#mcuManager.imageInfo(arrayBuffer);
        console.log({ imageInfo });

        this.#mcuManager.cmdUpload(arrayBuffer, 1);

        await promise;
    }

    // COMMANDS

    /** @type {any[]?} */
    #images;
    async #getImageState() {
        const promise = this.waitForEvent("firmwareImageState");

        _console.log("getting firmware image state...");
        this.sendMessage("smp", Uint8Array.from(this.#mcuManager.cmdImageState()));

        await promise;
    }

    async #getImageTest() {
        if (!this.#images?.[0]) {
            _console.log("no images found yet...");
            return;
        }

        const promise = this.waitForEvent("smp");

        _console.log("getting firmware image test...");
        this.sendMessage("smp", Uint8Array.from(this.#mcuManager.cmdImageTest(this.#images[1].hash)));

        await promise;

        await this.#getImageState();
    }

    async #eraseImage() {
        const promise = this.waitForEvent("smp");

        _console.log("erasing image...");
        this.sendMessage("smp", Uint8Array.from(this.#mcuManager.cmdImageErase()));

        await promise;
        await this.#getImageState();
    }

    async #confirmImage() {
        if (this.#images?.[1].confirmed === true) {
            _console.log("image 1 is already confirmed");
            return;
        }

        const promise = this.waitForEvent("smp");

        _console.log("confirming image...");
        this.sendMessage("smp", Uint8Array.from(this.#mcuManager.cmdImageConfirm(this.#images[1].hash)));

        await promise;
    }

    /** @param {string} echo */
    async #echo(string) {
        _console.assertTypeWithError(string, "string");

        const promise = this.waitForEvent("smp");

        _console.log("sending echo...");
        this.sendMessage("smp", Uint8Array.from(this.#mcuManager.smpEcho(string)));

        await promise;
    }

    async #reset() {
        const promise = this.waitForEvent("smp");

        _console.log("resetting...");
        this.sendMessage("smp", Uint8Array.from(this.#mcuManager.cmdReset()));

        await promise;
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
        this.sendMessage("smp", Uint8Array.from(packet));
    }
    #onMcuImageUploadProgress({ percentage }) {
        const progress = percentage / 100;
        _console.log("onMcuImageUploadProgress", ...arguments);
        this.#dispatchEvent({ type: "firmwareUpdateProgress", message: { firmwareUpdateProgress: progress } });
    }
    async #onMcuImageUploadFinished() {
        _console.log("onMcuImageUploadFinished", ...arguments);

        await this.#getImageTest();

        this.#dispatchEvent({ type: "firmwareUpdateProgress", message: { firmwareUpdateProgress: 100 } });
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

        if (this.#images.length == 2) {
            if (!this.#images[1].bootable) {
                _console.warn(
                    'Slot 2 has a invalid image. Click "Erase Image" to erase it or upload a different image'
                );
                // return this.setState(5)
            } else if (this.#images[0].version == this.pendingVersion || !this.#images[0].confirmed) {
                if (this.#images[0].confirmed) {
                    _console.log('Firmware has been updated. Click "Disconnect" to disconnect from the device.');
                    // return this.setState(7)
                } else {
                    _console.log(
                        'Slot 1 has a valid image. Click "Confirm Image" to confirm it or wait and the device will swap images back.'
                    );
                    //this.states[6].ready = true;
                    // return this.setState(6);
                }
            }
            if (this.#images[1].pending == false) {
                // switch to test state to mark as pending
                // this.states[3].ready = true;
                // return this.setState(3);
                _console.log('Slot 2 has a valid image. Click "Test Image" to test it or upload a different image.');
            } else {
                // switch to reset state and indicate ready
                this.pendingVersion = this.#images[1].version;
                //this.states[4].ready = true;
                //return this.setState(4);
                _console.log("Press the Reset Device button to update to the new firmware image");
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

            _console.log("Select a firmware update image to upload to slot 2.");
            // this.setState(2)
        }

        this.#dispatchEvent({ type: "firmwareImageState", message: { firmwareImages: this.#images } });
    }
}

export default FirmwareManager;
