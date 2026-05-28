import { createConsole } from "../utils/Console.ts";
import { concatenateArrayBuffers } from "../utils/ArrayBufferUtils.ts";
import Device, { SendMessageCallback } from "../Device.ts";
import autoBind from "auto-bind";
import EventDispatcher from "../utils/EventDispatcher.ts";
import { DisplayColorRGB } from "../BS.ts";

const _console = createConsole("LedManager", { log: true });

export const LEDTypes = [
  "digitalSingle",
  "analogSingle",
  "digitalRGB",
  "analogRGB",
] as const;
export type LEDType = (typeof LEDTypes)[number];

export const LEDMessageTypes = [
  "getLEDInformation",
  "setLEDs",
  "clearLEDs",
] as const;
export type LedMessageType = (typeof LEDMessageTypes)[number];

export const LedEventTypes = LEDMessageTypes;
export type LedEventType = (typeof LedEventTypes)[number];

export type Led = {
  type: LEDType;
  color: DisplayColorRGB;
  maxColor: DisplayColorRGB;
};

export interface LedEventMessages {
  getLEDInformation: { leds: Led[] };
  setLEDs: {};
  clearLEDs: {};
}

export type SendLedMessageCallback = SendMessageCallback<LedMessageType>;

export type LedEventDispatcher = EventDispatcher<
  Device,
  LedEventType,
  LedEventMessages
>;

class LedManager {
  constructor() {
    autoBind(this);
  }
  sendMessage!: SendLedMessageCallback;

  eventDispatcher!: LedEventDispatcher;
  get #dispatchEvent() {
    return this.eventDispatcher.dispatchEvent;
  }
  get waitForEvent() {
    return this.eventDispatcher.waitForEvent;
  }

  // LED
  #leds: Led[] = [];
  get leds() {
    return this.#leds;
  }
  #setLEDs(newLeds: Led[]) {
    this.#leds = newLeds;
    _console.log("leds", this.leds);
    this.#dispatchEvent("getLEDInformation", { leds: this.leds });
  }

  #parseLedInformation(dataView: DataView<ArrayBuffer>) {
    _console.log("parseLedInformation", dataView);

    const newLeds: Led[] = [];

    let offset = 0;
    while (offset < dataView.byteLength) {
      const ledTypeIndex = dataView.getUint8(offset++);
      const ledType: LEDType = LEDTypes[ledTypeIndex];
      console.log({ ledTypeIndex, ledType });
      _console.assertEnumWithError(ledType, LEDTypes);

      const maxColor: DisplayColorRGB = { r: 255, g: 255, b: 255 };

      switch (ledType) {
        case "digitalSingle":
        case "analogSingle":
          maxColor.r = dataView.getUint8(offset++);
          maxColor.g = dataView.getUint8(offset++);
          maxColor.b = dataView.getUint8(offset++);
          break;
        case "digitalRGB":
        case "analogRGB":
          break;
        default:
          _console.error(`uncaught ledType "${ledType}"`);
          break;
      }

      _console.log("maxColor", maxColor);
    }

    this.#setLEDs(newLeds);
  }
  // FILL

  // MESSAGE
  parseMessage(messageType: LedMessageType, dataView: DataView<ArrayBuffer>) {
    _console.log({ messageType }, dataView);

    switch (messageType) {
      case "getLEDInformation":
        this.#parseLedInformation(dataView);
        break;
      case "setLEDs":
        break;
      case "clearLEDs":
        break;
      default:
        throw Error(`uncaught messageType ${messageType}`);
    }
  }

  clear() {
    _console.log("clear");
    this.#leds.length = 0;
  }
}

export default LedManager;
