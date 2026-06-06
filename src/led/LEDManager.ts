import { createConsole } from "../utils/Console.ts";
import { concatenateArrayBuffers } from "../utils/ArrayBufferUtils.ts";
import Device, { SendMessageCallback } from "../Device.ts";
import autoBind from "auto-bind";
import EventDispatcher from "../utils/EventDispatcher.ts";
import { DisplayColorRGB } from "../utils/DisplayUtils.ts";
import {
  areColorsEqual,
  blackColor,
  clampColor,
  projectColor,
  roundColor,
  scaleColor,
  stringToRGB,
  whiteColor,
} from "../utils/ColorUtils.ts";
import { clamp } from "../utils/MathUtils.ts";

const _console = createConsole("LedManager", { log: false });

export const LedTypes = [
  "digitalSingle",
  "analogSingle",
  "digitalRGB",
  "analogRGB",
] as const;
export type LedType = (typeof LedTypes)[number];

export const LedValueTypes = ["color", "brightness"] as const;
export type LedValueType = (typeof LedValueTypes)[number];

export type LedValue = DisplayColorRGB | number;

export const LedMessageTypes = [
  "getLedInformation",
  "setLeds",
  "clearLeds",
] as const;
export type LedMessageType = (typeof LedMessageTypes)[number];

export const LedEventTypes = [...LedMessageTypes, "setLed"] as const;
export type LedEventType = (typeof LedEventTypes)[number];

export type Led = {
  index: number;
  type: LedType;
  color: DisplayColorRGB;
  maxColor: DisplayColorRGB;

  isSingle: boolean;
  isRGB: boolean;
  isAnalog: boolean;
  isDigital: boolean;
};

export interface LedEventMessages {
  getLedInformation: { leds: Led[] };
  // setLeds: {};
  // clearLeds: {};
  setLed: {
    ledIndex: number;
    led: Led;
  };
}

export type SendLedMessageCallback = SendMessageCallback<LedMessageType>;

export type LedEventDispatcher = EventDispatcher<
  Device,
  LedEventType,
  LedEventMessages
>;

interface LedColorConfiguration {
  index: number;
  color: DisplayColorRGB | string;
}
interface LedBrightnessConfiguration {
  index: number;
  brightness: number;
}
export type LedConfiguration =
  | LedColorConfiguration
  | LedBrightnessConfiguration;

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

  // Led
  #leds: Led[] = [];
  #pendingColors: DisplayColorRGB[] = [];
  get leds() {
    return this.#leds;
  }
  #updateLeds(newLeds: Led[]) {
    _console.log("updateLeds", newLeds);
    this.#leds = newLeds;
    this.#pendingColors.length = 0;
    _console.log("leds", this.leds);
    this.#dispatchEvent("getLedInformation", { leds: this.leds });
  }

  #isLedTypeAnalog(ledType: LedType) {
    return ledType.startsWith("analog");
  }
  #isLedTypeDigital(ledType: LedType) {
    return ledType.startsWith("digital");
  }
  #isLedTypeSingle(ledType: LedType) {
    return ledType.endsWith("Single");
  }
  #isLedTypeRGB(ledType: LedType) {
    return ledType.endsWith("RGB");
  }
  #parseLedInformation(dataView: DataView<ArrayBuffer>) {
    _console.log("parseLedInformation", dataView);

    const newLeds: Led[] = [];

    let offset = 0;
    while (offset < dataView.byteLength) {
      const ledTypeIndex = dataView.getUint8(offset++);
      const ledType: LedType = LedTypes[ledTypeIndex];
      _console.log({ ledTypeIndex, ledType });
      _console.assertEnumWithError(ledType, LedTypes);

      const maxColor: DisplayColorRGB = structuredClone(whiteColor);
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

      const led: Led = {
        index: newLeds.length,
        type: ledType,
        color: structuredClone(blackColor),
        maxColor,
        isAnalog: this.#isLedTypeAnalog(ledType),
        isDigital: this.#isLedTypeDigital(ledType),
        isSingle: this.#isLedTypeSingle(ledType),
        isRGB: this.#isLedTypeRGB(ledType),
      };
      _console.log("led", led);
      newLeds.push(led);
    }

    this.#updateLeds(newLeds);
  }

  #clampColor(color: DisplayColorRGB, led: Led): LedValue {
    const { type, maxColor, index } = led;
    switch (type) {
      case "digitalSingle":
        {
          const value = Math.floor(projectColor(color, maxColor));
          if (true) {
            return value;
          } else {
            return value == 0 ? blackColor : maxColor;
          }
        }
        break;
      case "analogSingle":
        {
          const value = projectColor(color, maxColor);
          if (true) {
            return value;
          } else {
            return scaleColor(color, value / 255);
          }
        }
        break;
      case "digitalRGB":
        return roundColor(clampColor(color, maxColor));
        break;
      case "analogRGB":
        return clampColor(color, maxColor);
        break;
      default:
        _console.error(`uncaught led #${index} type "${type}"`);
        return blackColor;
        break;
    }
  }
  #verifyLedIndex(ledIndex: number) {
    _console.assertRangeWithError(
      "ledConfiguration.index",
      ledIndex,
      0,
      this.leds.length - 1,
    );
  }

  async setLeds(
    ledConfigurations: LedConfiguration[],
    sendImmediately?: boolean,
  ) {
    if (ledConfigurations.length == 0) {
      _console.log("empty ledConfigurations");
      return;
    }
    _console.log("setLeds", ledConfigurations, { sendImmediately });
    let setLedsData!: ArrayBuffer;
    ledConfigurations.forEach((ledConfiguration) => {
      const { index } = ledConfiguration;
      this.#verifyLedIndex(index);
      const led = this.#leds[index];

      let arrayBuffer: ArrayBuffer;

      let value: LedValue;

      if ("color" in ledConfiguration) {
        let { color } = ledConfiguration;
        if (typeof color == "string") {
          color = stringToRGB(color);
        }
        value = this.#clampColor(color, led);
      } else if ("brightness" in ledConfiguration) {
        let { brightness } = ledConfiguration;
        value = clamp(brightness, 0, 255);
      } else {
        _console.error(
          `ledConfiguration contains neither a "color" nor "brightness"`,
          ledConfiguration,
        );
        return;
      }

      if (typeof value == "number") {
        arrayBuffer = concatenateArrayBuffers(
          led.index,
          LedValueTypes.indexOf("brightness"),
          value,
        );
      } else {
        arrayBuffer = concatenateArrayBuffers(
          led.index,
          LedValueTypes.indexOf("color"),
          value.r,
          value.g,
          value.b,
        );
      }

      let newColor = value;
      if (typeof newColor == "number") {
        newColor = scaleColor(led.maxColor, newColor / 255);
      }

      _console.log(`led.index ${led.index} newColor:`, newColor);
      const isColorRedundant = areColorsEqual(led.color, newColor);
      if (!isColorRedundant) {
        this.#pendingColors[led.index] = newColor;
        setLedsData = concatenateArrayBuffers(setLedsData, arrayBuffer);
      } else {
        _console.log("redundant color - skipping");
      }
    });

    await this.sendMessage(
      [{ type: "setLeds", data: setLedsData }],
      sendImmediately,
    );
  }
  async setLed(ledConfiguration: LedConfiguration, sendImmediately?: boolean) {
    _console.log("setLed", ledConfiguration, { sendImmediately });
    return this.setLeds([ledConfiguration], sendImmediately);
  }
  async clearLeds(sendImmediately?: boolean) {
    _console.log("clearLeds");
    this.#pendingColors = this.#leds.map(() => blackColor);
    await this.sendMessage([{ type: "clearLeds" }], sendImmediately);
  }

  // MESSAGE
  parseMessage(messageType: LedMessageType, dataView: DataView<ArrayBuffer>) {
    _console.log({ messageType }, dataView);

    switch (messageType) {
      case "getLedInformation":
        this.#parseLedInformation(dataView);
        break;
      case "setLeds":
        break;
      case "clearLeds":
        break;
      default:
        throw Error(`uncaught messageType ${messageType}`);
    }
  }

  onSendTxMessages() {
    _console.log("onSendTxMessages");
    this.#flushPendingColors();
  }
  #flushPendingColors() {
    _console.log("flushPendingColors");
    this.#pendingColors.forEach((color, ledIndex) => {
      this.#verifyLedIndex(ledIndex);
      const led = this.#leds[ledIndex];
      led.color = color;
      this.#dispatchEvent("setLed", {
        ledIndex,
        led,
      });
    });
    this.#pendingColors.length = 0;
  }

  clear() {
    // _console.log("clear");
    this.#leds.length = 0;
    this.#pendingColors.length = 0;
  }
}

export default LedManager;
