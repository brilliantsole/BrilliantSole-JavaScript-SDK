import { createConsole } from "./utils/Console.js";
import EventDispatcher from "./utils/EventDispatcher.js";
import { textDecoder } from "./utils/Text.js";

const _console = createConsole("DeviceInformationManager", { log: true });

/**
 * @typedef DeviceInformation
 * @type {Object}
 * @property {string} [manufacturerName]
 * @property {string} [modelNumber]
 * @property {string} [softwareRevision]
 * @property {string} [hardwareRevision]
 * @property {string} [firmwareRevision]
 * @property {PnpId} [pnpId]
 * @property {string} [serialNumber]
 */

/**
 * @typedef PnpId
 * @type {Object}
 * @property {"Bluetooth"|"USB"} source
 * @property {number} vendorId
 * @property {number} productId
 * @property {number} productVersion
 */

/**
 * @typedef { "manufacturerName" |
 * "modelNumber" |
 * "softwareRevision" |
 * "hardwareRevision" |
 * "firmwareRevision" |
 * "pnpId" |
 * "serialNumber"
 * } DeviceInformationMessageType
 */

/** @typedef {DeviceInformationMessageType | "deviceInformation"} DeviceInformationManagerEventType */

/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherListener} EventDispatcherListener */
/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherOptions} EventDispatcherOptions */

/** @typedef {import("./Device.js").Device} Device */
/**
 * @typedef DeviceInformationManagerEvent
 * @type {Object}
 * @property {Device} target
 * @property {DeviceInformationManagerEventType} type
 * @property {Object} message
 */

class DeviceInformationManager {
  // MESSAGE TYPES

  /** @type {DeviceInformationMessageType[]} */
  static #MessageTypes = [
    "manufacturerName",
    "modelNumber",
    "softwareRevision",
    "hardwareRevision",
    "firmwareRevision",
    "pnpId",
    "serialNumber",
  ];
  static get MessageTypes() {
    return this.#MessageTypes;
  }
  get messageTypes() {
    return DeviceInformationManager.MessageTypes;
  }

  // EVENT DISPATCHER

  /** @type {DeviceInformationManagerEventType[]} */
  static #EventTypes = [...this.#MessageTypes, "deviceInformation"];
  static get EventTypes() {
    return this.#EventTypes;
  }
  get eventTypes() {
    return DeviceInformationManager.#EventTypes;
  }
  /** @type {EventDispatcher} */
  eventDispatcher;

  /**
   * @param {DeviceInformationManagerEvent} event
   */
  #dispatchEvent(event) {
    this.eventDispatcher.dispatchEvent(event);
  }

  // PROPERTIES

  /** @type {DeviceInformation} */
  information = {
    manufacturerName: null,
    modelNumber: null,
    softwareRevision: null,
    hardwareRevision: null,
    firmwareRevision: null,
    pnpId: null,
  };
  get #isComplete() {
    return Object.values(this.information).every((value) => value != null);
  }

  /** @param {DeviceInformation} partialDeviceInformation */
  #update(partialDeviceInformation) {
    _console.log({ partialDeviceInformation });
    for (const deviceInformationName in partialDeviceInformation) {
      this.#dispatchEvent({
        type: deviceInformationName,
        message: { [deviceInformationName]: partialDeviceInformation[deviceInformationName] },
      });
    }

    Object.assign(this.information, partialDeviceInformation);
    _console.log({ deviceInformation: this.information });
    if (this.#isComplete) {
      _console.log("completed deviceInformation");
      this.#dispatchEvent({ type: "deviceInformation", message: { deviceInformation: this.information } });
    }
  }

  // MESSAGE

  /**
   * @param {DeviceInformationMessageType} messageType
   * @param {DataView} dataView
   */
  parseMessage(messageType, dataView) {
    _console.log({ messageType });

    switch (messageType) {
      case "manufacturerName":
        const manufacturerName = textDecoder.decode(dataView);
        _console.log({ manufacturerName });
        this.#update({ manufacturerName });
        break;
      case "modelNumber":
        const modelNumber = textDecoder.decode(dataView);
        _console.log({ modelNumber });
        this.#update({ modelNumber });
        break;
      case "softwareRevision":
        const softwareRevision = textDecoder.decode(dataView);
        _console.log({ softwareRevision });
        this.#update({ softwareRevision });
        break;
      case "hardwareRevision":
        const hardwareRevision = textDecoder.decode(dataView);
        _console.log({ hardwareRevision });
        this.#update({ hardwareRevision });
        break;
      case "firmwareRevision":
        const firmwareRevision = textDecoder.decode(dataView);
        _console.log({ firmwareRevision });
        this.#update({ firmwareRevision });
        break;
      case "pnpId":
        /** @type {PnpId} */
        const pnpId = {
          source: dataView.getUint8(0) === 1 ? "Bluetooth" : "USB",
          productId: dataView.getUint16(3, true),
          productVersion: dataView.getUint16(5, true),
        };
        if (pnpId.source == "Bluetooth") {
          pnpId.vendorId = dataView.getUint16(1, true);
        } else {
          // no need to implement
        }
        _console.log({ pnpId });
        this.#update({ pnpId });
        break;
      case "serialNumber":
        const serialNumber = textDecoder.decode(dataView);
        _console.log({ serialNumber });
        // will only be used for node.js
        break;
      default:
        throw Error(`uncaught messageType ${messageType}`);
    }
  }
}

export default DeviceInformationManager;
