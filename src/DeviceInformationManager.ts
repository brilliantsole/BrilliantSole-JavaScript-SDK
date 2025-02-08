import Device from "./Device.ts";
import { createConsole } from "./utils/Console.ts";
import EventDispatcher from "./utils/EventDispatcher.ts";
import { textDecoder } from "./utils/Text.ts";

const _console = createConsole("DeviceInformationManager", { log: true });

export interface PnpId {
  source: "Bluetooth" | "USB";
  vendorId: number;
  productId: number;
  productVersion: number;
}

export interface DeviceInformation {
  manufacturerName: string;
  modelNumber: string;
  softwareRevision: string;
  hardwareRevision: string;
  firmwareRevision: string;
  pnpId: PnpId;
  serialNumber: string;
}

export const DeviceInformationMessageTypes = [
  "manufacturerName",
  "modelNumber",
  "softwareRevision",
  "hardwareRevision",
  "firmwareRevision",
  "pnpId",
  "serialNumber",
] as const;
export type DeviceInformationMessageType = (typeof DeviceInformationMessageTypes)[number];

export const DeviceInformationEventTypes = [...DeviceInformationMessageTypes, "deviceInformation"] as const;
export type DeviceInformationEventType = (typeof DeviceInformationEventTypes)[number];

export interface DeviceInformationEventMessages {
  manufacturerName: { manufacturerName: string };
  modelNumber: { modelNumber: string };
  softwareRevision: { softwareRevision: string };
  hardwareRevision: { hardwareRevision: string };
  firmwareRevision: { firmwareRevision: string };
  pnpId: { pnpId: PnpId };
  serialNumber: { serialNumber: string };
  deviceInformation: { deviceInformation: DeviceInformation };
}

export type DeviceInformationEventDispatcher = EventDispatcher<
  Device,
  DeviceInformationEventType,
  DeviceInformationEventMessages
>;

class DeviceInformationManager {
  eventDispatcher!: DeviceInformationEventDispatcher;
  get #dispatchEvent() {
    return this.eventDispatcher.dispatchEvent;
  }

  #information: Partial<DeviceInformation> = {};
  get information() {
    return this.#information as DeviceInformation;
  }
  clear() {
    this.#information = {};
  }
  get #isComplete() {
    return DeviceInformationMessageTypes.filter((key) => key != "serialNumber").every(
      (key) => key in this.#information
    );
  }

  #update(partialDeviceInformation: Partial<DeviceInformation>) {
    _console.log({ partialDeviceInformation });
    const deviceInformationNames = Object.keys(partialDeviceInformation) as (keyof DeviceInformation)[];
    deviceInformationNames.forEach((deviceInformationName) => {
      // @ts-expect-error
      this.#dispatchEvent(deviceInformationName, {
        [deviceInformationName]: partialDeviceInformation[deviceInformationName],
      });
    });

    Object.assign(this.#information, partialDeviceInformation);
    _console.log({ deviceInformation: this.#information });
    if (this.#isComplete) {
      _console.log("completed deviceInformation");
      this.#dispatchEvent("deviceInformation", { deviceInformation: this.information });
    }
  }

  parseMessage(messageType: DeviceInformationMessageType, dataView: DataView) {
    _console.log({ messageType });

    switch (messageType) {
      case "manufacturerName":
        const manufacturerName = textDecoder.decode(dataView.buffer);
        _console.log({ manufacturerName });
        this.#update({ manufacturerName });
        break;
      case "modelNumber":
        const modelNumber = textDecoder.decode(dataView.buffer);
        _console.log({ modelNumber });
        this.#update({ modelNumber });
        break;
      case "softwareRevision":
        const softwareRevision = textDecoder.decode(dataView.buffer);
        _console.log({ softwareRevision });
        this.#update({ softwareRevision });
        break;
      case "hardwareRevision":
        const hardwareRevision = textDecoder.decode(dataView.buffer);
        _console.log({ hardwareRevision });
        this.#update({ hardwareRevision });
        break;
      case "firmwareRevision":
        const firmwareRevision = textDecoder.decode(dataView.buffer);
        _console.log({ firmwareRevision });
        this.#update({ firmwareRevision });
        break;
      case "pnpId":
        const pnpId: PnpId = {
          source: dataView.getUint8(0) === 1 ? "Bluetooth" : "USB",
          productId: dataView.getUint16(3, true),
          productVersion: dataView.getUint16(5, true),
          vendorId: 0,
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
        const serialNumber = textDecoder.decode(dataView.buffer);
        _console.log({ serialNumber });
        // will only be used for node
        break;
      default:
        throw Error(`uncaught messageType ${messageType}`);
    }
  }
}

export default DeviceInformationManager;
