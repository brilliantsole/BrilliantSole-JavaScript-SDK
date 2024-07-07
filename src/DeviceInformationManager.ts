import { createConsole } from "./utils/Console";
import EventDispatcher from "./utils/EventDispatcher";
import { textDecoder } from "./utils/Text";

const _console = createConsole("DeviceInformationManager", { log: true });

export interface DeviceInformation {
  manufacturerName: string;
  modelNumber: string;
  softwareRevision: string;
  hardwareRevision: string;
  firmwareRevision: string;
  pnpId: PnpId;
  serialNumber: string;
}

export interface PnpId {
  source: "Bluetooth" | "USB";
  vendorId: number;
  productId: number;
  productVersion: number;
}

export type DeviceInformationMessageType =
  | "manufacturerName"
  | "modelNumber"
  | "softwareRevision"
  | "hardwareRevision"
  | "firmwareRevision"
  | "pnpId"
  | "serialNumber";

export type DeviceInformationManagerEventType = DeviceInformationMessageType | "deviceInformation";

type EventDispatcherOptions = import("./utils/EventDispatcher").EventDispatcherOptions;

type BaseDeviceEvent = import("./Device").BaseDeviceEvent;

export interface BaseDeviceInformationManagerEvent {
  type: DeviceInformationManagerEventType;
  message: { deviceInformation: DeviceInformation };
}
export type DeviceInformationManagerEvent = BaseDeviceEvent & BaseDeviceInformationManagerEvent;

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
  clear() {
    for (const key in this.information) {
      this.information[key] = null;
    }
  }
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
        // will only be used for node
        break;
      default:
        throw Error(`uncaught messageType ${messageType}`);
    }
  }
}

export default DeviceInformationManager;
