import Device, { SendMessageCallback } from "./Device.ts";
import { createConsole } from "./utils/Console.ts";
import EventDispatcher from "./utils/EventDispatcher.ts";
import { Uint16Max } from "./utils/MathUtils.ts";
import { textDecoder, textEncoder } from "./utils/Text.ts";
import autoBind from "auto-bind";

const _console = createConsole("InformationManager", { log: false });

export const DeviceTypes = ["leftInsole", "rightInsole", "leftGlove", "rightGlove", "glasses", "generic"] as const;
export type DeviceType = (typeof DeviceTypes)[number];

export const Sides = ["left", "right"] as const;
export type Side = (typeof Sides)[number];

export const MinNameLength = 2;
export const MaxNameLength = 30;

export const InformationMessageTypes = [
  "isCharging",
  "getBatteryCurrent",
  "getMtu",
  "getId",
  "getName",
  "setName",
  "getType",
  "setType",
  "getCurrentTime",
  "setCurrentTime",
] as const;
export type InformationMessageType = (typeof InformationMessageTypes)[number];

export const InformationEventTypes = InformationMessageTypes;
export type InformationEventType = (typeof InformationEventTypes)[number];

export interface InformationEventMessages {
  isCharging: { isCharging: boolean };
  getBatteryCurrent: { batteryCurrent: number };
  getMtu: { mtu: number };
  getId: { id: string };
  getName: { name: string };
  getType: { type: DeviceType };
  getCurrentTime: { currentTime: number };
}

export type InformationEventDispatcher = EventDispatcher<Device, InformationEventType, InformationEventMessages>;
export type SendInformationMessageCallback = SendMessageCallback<InformationMessageType>;

class InformationManager {
  constructor() {
    autoBind(this);
  }

  sendMessage!: SendInformationMessageCallback;

  eventDispatcher!: InformationEventDispatcher;
  get #dispatchEvent() {
    return this.eventDispatcher.dispatchEvent;
  }
  get waitForEvent() {
    return this.eventDispatcher.waitForEvent;
  }

  // PROPERTIES

  #isCharging = false;
  get isCharging() {
    return this.#isCharging;
  }
  #updateIsCharging(updatedIsCharging: boolean) {
    _console.assertTypeWithError(updatedIsCharging, "boolean");
    this.#isCharging = updatedIsCharging;
    _console.log({ isCharging: this.#isCharging });
    this.#dispatchEvent("isCharging", { isCharging: this.#isCharging });
  }

  #batteryCurrent!: number;
  get batteryCurrent() {
    return this.#batteryCurrent;
  }
  async getBatteryCurrent() {
    _console.log("getting battery current...");
    const promise = this.waitForEvent("getBatteryCurrent");
    this.sendMessage([{ type: "getBatteryCurrent" }]);
    await promise;
  }
  #updateBatteryCurrent(updatedBatteryCurrent: number) {
    _console.assertTypeWithError(updatedBatteryCurrent, "number");
    this.#batteryCurrent = updatedBatteryCurrent;
    _console.log({ batteryCurrent: this.#batteryCurrent });
    this.#dispatchEvent("getBatteryCurrent", { batteryCurrent: this.#batteryCurrent });
  }

  #id!: string;
  get id() {
    return this.#id;
  }
  #updateId(updatedId: string) {
    _console.assertTypeWithError(updatedId, "string");
    this.#id = updatedId;
    _console.log({ id: this.#id });
    this.#dispatchEvent("getId", { id: this.#id });
  }

  #name = "";
  get name() {
    return this.#name;
  }

  updateName(updatedName: string) {
    _console.assertTypeWithError(updatedName, "string");
    this.#name = updatedName;
    _console.log({ updatedName: this.#name });
    this.#dispatchEvent("getName", { name: this.#name });
  }
  async setName(newName: string) {
    _console.assertTypeWithError(newName, "string");
    _console.assertWithError(
      newName.length >= MinNameLength,
      `name must be greater than ${MinNameLength} characters long ("${newName}" is ${newName.length} characters long)`
    );
    _console.assertWithError(
      newName.length < MaxNameLength,
      `name must be less than ${MaxNameLength} characters long ("${newName}" is ${newName.length} characters long)`
    );
    const setNameData = textEncoder.encode(newName);
    _console.log({ setNameData });

    const promise = this.waitForEvent("getName");
    this.sendMessage([{ type: "setName", data: setNameData.buffer }]);
    await promise;
  }

  // TYPE
  #type!: DeviceType;
  get type() {
    return this.#type;
  }
  get typeEnum() {
    return DeviceTypes.indexOf(this.type);
  }
  #assertValidDeviceType(type: DeviceType) {
    _console.assertEnumWithError(type, DeviceTypes);
  }
  #assertValidDeviceTypeEnum(typeEnum: number) {
    _console.assertTypeWithError(typeEnum, "number");
    _console.assertWithError(typeEnum in DeviceTypes, `invalid typeEnum ${typeEnum}`);
  }
  updateType(updatedType: DeviceType) {
    this.#assertValidDeviceType(updatedType);
    if (updatedType == this.type) {
      _console.log("redundant type assignment");
      return;
    }
    this.#type = updatedType;
    _console.log({ updatedType: this.#type });

    this.#dispatchEvent("getType", { type: this.#type });
  }
  async #setTypeEnum(newTypeEnum: number) {
    this.#assertValidDeviceTypeEnum(newTypeEnum);
    const setTypeData = Uint8Array.from([newTypeEnum]);
    _console.log({ setTypeData });
    const promise = this.waitForEvent("getType");
    this.sendMessage([{ type: "setType", data: setTypeData.buffer }]);
    await promise;
  }
  async setType(newType: DeviceType) {
    this.#assertValidDeviceType(newType);
    const newTypeEnum = DeviceTypes.indexOf(newType);
    this.#setTypeEnum(newTypeEnum);
  }

  get isInsole() {
    switch (this.type) {
      case "leftInsole":
      case "rightInsole":
        return true;
      default:
        return false;
    }
  }

  get isGlove() {
    switch (this.type) {
      case "leftGlove":
      case "rightGlove":
        return true;
      default:
        return false;
    }
  }

  get side(): Side {
    switch (this.type) {
      case "leftInsole":
      case "leftGlove":
        return "left";
      case "rightInsole":
      case "rightGlove":
        return "right";
      default:
        return "left";
    }
  }

  #mtu = 0;
  get mtu() {
    return this.#mtu;
  }
  #updateMtu(newMtu: number) {
    _console.assertTypeWithError(newMtu, "number");
    if (this.#mtu == newMtu) {
      _console.log("redundant mtu assignment", newMtu);
      return;
    }
    this.#mtu = newMtu;

    this.#dispatchEvent("getMtu", { mtu: this.#mtu });
  }

  #isCurrentTimeSet = false;
  get isCurrentTimeSet() {
    return this.#isCurrentTimeSet;
  }

  #onCurrentTime(currentTime: number) {
    _console.log({ currentTime });
    this.#isCurrentTimeSet = currentTime != 0 || Math.abs(Date.now() - currentTime) < Uint16Max;
    if (!this.#isCurrentTimeSet) {
      this.#setCurrentTime(false);
    }
  }
  async #setCurrentTime(sendImmediately?: boolean) {
    _console.log("setting current time...");
    const dataView = new DataView(new ArrayBuffer(8));
    dataView.setBigUint64(0, BigInt(Date.now()), true);
    const promise = this.waitForEvent("getCurrentTime");
    this.sendMessage([{ type: "setCurrentTime", data: dataView.buffer }], sendImmediately);
    await promise;
  }

  // MESSAGE
  parseMessage(messageType: InformationMessageType, dataView: DataView) {
    _console.log({ messageType });

    switch (messageType) {
      case "isCharging":
        const isCharging = Boolean(dataView.getUint8(0));
        _console.log({ isCharging });
        this.#updateIsCharging(isCharging);
        break;
      case "getBatteryCurrent":
        const batteryCurrent = dataView.getFloat32(0, true);
        _console.log({ batteryCurrent });
        this.#updateBatteryCurrent(batteryCurrent);
        break;
      case "getId":
        const id = textDecoder.decode(dataView.buffer);
        _console.log({ id });
        this.#updateId(id);
        break;
      case "getName":
      case "setName":
        const name = textDecoder.decode(dataView.buffer);
        _console.log({ name });
        this.updateName(name);
        break;
      case "getType":
      case "setType":
        const typeEnum = dataView.getUint8(0);
        const type = DeviceTypes[typeEnum];
        _console.log({ typeEnum, type });
        this.updateType(type);
        break;
      case "getMtu":
        const mtu = dataView.getUint16(0, true);
        _console.log({ mtu });
        this.#updateMtu(mtu);
        break;
      case "getCurrentTime":
      case "setCurrentTime":
        const currentTime = Number(dataView.getBigUint64(0, true));
        this.#onCurrentTime(currentTime);
        break;
      default:
        throw Error(`uncaught messageType ${messageType}`);
    }
  }

  clear() {
    this.#isCurrentTimeSet = false;
  }
}

export default InformationManager;
