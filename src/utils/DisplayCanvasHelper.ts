import Device, {
  BoundDeviceEventListeners,
  DeviceEventMap,
} from "../Device.ts";
import {
  DefaultDisplayContextState,
  DisplayBrightness,
  DisplayColorRGB,
  DisplayContextState,
} from "../DisplayManager.ts";
import { hexToRGB, rgbToHex } from "./ColorUtils.ts";
import { createConsole } from "./Console.ts";
import DisplayContextStateHelper from "./DisplayContextStateHelper.ts";
import EventDispatcher, {
  BoundEventListeners,
  Event,
  EventListenerMap,
  EventMap,
} from "./EventDispatcher.ts";
import { addEventListeners, removeEventListeners } from "./EventUtils.ts";

const _console = createConsole("DisplayCanvasHelper", { log: true });

export const DisplayCanvasHelperEventTypes = [] as const;
export type DisplayCanvasHelperEventType =
  (typeof DisplayCanvasHelperEventTypes)[number];

export interface DisplayCanvasHelperEventMessages {}

export type DisplayCanvasHelperEventDispatcher = EventDispatcher<
  DisplayCanvasHelper,
  DisplayCanvasHelperEventType,
  DisplayCanvasHelperEventMessages
>;
export type DisplayCanvasHelperEvent = Event<
  DisplayCanvasHelper,
  DisplayCanvasHelperEventType,
  DisplayCanvasHelperEventMessages
>;
export type DisplayCanvasHelperEventMap = EventMap<
  DisplayCanvasHelper,
  DisplayCanvasHelperEventType,
  DisplayCanvasHelperEventMessages
>;
export type DisplayCanvasHelperEventListenerMap = EventListenerMap<
  DisplayCanvasHelper,
  DisplayCanvasHelperEventType,
  DisplayCanvasHelperEventMessages
>;
export type BoundDisplayCanvasHelperEventListeners = BoundEventListeners<
  DisplayCanvasHelper,
  DisplayCanvasHelperEventType,
  DisplayCanvasHelperEventMessages
>;

class DisplayCanvasHelper {
  constructor() {
    this.numberOfColors = 16;
  }

  // EVENT DISPATCHER
  #eventDispatcher: DisplayCanvasHelperEventDispatcher = new EventDispatcher(
    this as DisplayCanvasHelper,
    DisplayCanvasHelperEventTypes
  );
  get addEventListener() {
    return this.#eventDispatcher.addEventListener;
  }
  get #dispatchEvent() {
    return this.#eventDispatcher.dispatchEvent;
  }
  get removeEventListener() {
    return this.#eventDispatcher.removeEventListener;
  }
  get waitForEvent() {
    return this.#eventDispatcher.waitForEvent;
  }
  get removeEventListeners() {
    return this.#eventDispatcher.removeEventListeners;
  }
  get removeAllEventListeners() {
    return this.#eventDispatcher.removeAllEventListeners;
  }

  // CANVAS
  #canvas?: HTMLCanvasElement;
  get canvas() {
    return this.#canvas;
  }
  set canvas(newCanvas) {
    _console.assertWithError(
      newCanvas?.nodeName == "CANVAS",
      `assigned non-canvas type ${newCanvas?.nodeName}`
    );
    if (this.#canvas == newCanvas) {
      _console.log("redundant canvas assignment", newCanvas);
      return;
    }
    this.#canvas = newCanvas;
    _console.log("assigned canvas", this.canvas);

    this.#context = this.#canvas?.getContext("2d")!;

    this.#updateCanvas();
  }
  #context!: CanvasRenderingContext2D;
  get context() {
    return this.#context;
  }

  #updateCanvas() {
    if (!this.device?.isConnected) {
      return;
    }
    if (!this.canvas) {
      return;
    }

    const { width, height } = this.device.displayInformation!;
    this.canvas.width = width;
    this.canvas.height = height;
  }

  // DEVICE
  #device?: Device;
  get device() {
    return this.#device;
  }
  set device(newDevice) {
    if (this.#device == newDevice) {
      _console.log("redundant device assignment", newDevice);
      return;
    }
    if (newDevice) {
      _console.assertWithError(
        newDevice.isConnected,
        "device must be connected"
      );
      _console.assertWithError(
        newDevice.isDisplayAvailable,
        "display must have a display"
      );
    }
    if (this.#device) {
      removeEventListeners(this.device, this.#boundDeviceEventListeners);
    }
    this.#device = newDevice;
    addEventListeners(this.#device, this.#boundDeviceEventListeners);
    _console.log("assigned device", this.device);

    this.#updateCanvas();
    if (this.device) {
      this.numberOfColors = this.device.numberOfDisplayColors!;
    }
    this.#updateDeviceContextState();
  }

  // DEVICE EVENTLISTENERS
  #boundDeviceEventListeners: BoundDeviceEventListeners = {
    connected: this.#onDeviceConnected.bind(this),
    notConnected: this.#onDeviceNotConnected.bind(this),
  };
  #onDeviceConnected(event: DeviceEventMap["connected"]) {
    _console.log("device connected");
    this.#updateCanvas();
    this.#updateDeviceColors();
    this.#updateDeviceOpacity();
    this.#updateDeviceContextState();
    this.#updateDeviceBrightness();
    // FIX - messages flushed properly?
  }
  #onDeviceNotConnected(event: DeviceEventMap["notConnected"]) {
    _console.log("device not connected");
  }

  // NUMBER OF COLORS
  #numberOfColors: number = 0;
  get numberOfColors() {
    return this.#numberOfColors;
  }
  set numberOfColors(newNumberOfColors) {
    this.#numberOfColors = newNumberOfColors;
    _console.log({ numberOfColors: this.numberOfColors });

    this.#colors = new Array(this.numberOfColors).fill("#000000");
    this.#opacities = new Array(this.numberOfColors).fill(1);
  }

  // COLORS
  #assertValidColor(color: DisplayColorRGB) {
    this.#assertValidColorValue("red", color.r);
    this.#assertValidColorValue("green", color.g);
    this.#assertValidColorValue("blue", color.b);
  }
  #assertValidColorValue(name: string, value: number) {
    _console.assertRangeWithError(name, value, 0, 255);
  }
  #assertValidColorIndex(colorIndex: number) {
    _console.assertRangeWithError(
      "colorIndex",
      colorIndex,
      0,
      this.numberOfColors
    );
  }
  #colors: string[] = [];
  get colors() {
    return this.#colors;
  }
  #resetColors() {
    this.#colors.length = 0;
  }
  #updateDeviceColors(sendImmediately?: boolean) {
    if (this.device?.isConnected) {
      return;
    }
    this.colors.forEach((color, index) => {
      this.device?.setDisplayColor(
        index,
        color,
        sendImmediately && index == this.colors.length - 1
      );
    });
  }

  // OPACITIES
  #assertValidOpacity(value: number) {
    _console.assertRangeWithError("opacity", value, 0, 1);
  }
  #opacities: number[] = [];
  get opacities() {
    return this.#opacities;
  }
  #resetOpacities() {
    this.#opacities.length = 0;
  }

  #updateDeviceOpacity(sendImmediately?: boolean) {
    if (this.device?.isConnected) {
      return;
    }
    this.#opacities.forEach((opacity, index) => {
      this.device?.setDisplayColorOpacity(
        index,
        opacity,
        sendImmediately && index == this.colors.length - 1
      );
    });
  }

  // CONEXT STATE
  #contextStateHelper = new DisplayContextStateHelper();
  get contextState() {
    return this.#contextStateHelper.state;
  }
  #resetContextState() {
    this.#contextStateHelper.reset();
  }
  #updateDeviceContextState() {
    if (this.device?.isConnected) {
      return;
    }
    _console.log("updateDeviceContextState");
    this.device?.setDisplayContextState(this.contextState);
  }

  setColor(
    colorIndex: number,
    color: DisplayColorRGB | string,
    sendImmediately?: boolean
  ) {
    if (typeof color == "string") {
      color = hexToRGB(color);
    }
    const colorHex = rgbToHex(color);
    if (this.colors[colorIndex] == colorHex) {
      _console.log(`redundant color #${colorIndex} ${colorHex}`);
      return;
    }

    _console.log(`setting color #${colorIndex}`, color);
    this.#assertValidColorIndex(colorIndex);
    this.#assertValidColor(color);

    if (this.device?.isConnected) {
      this.device.setDisplayColor(colorIndex, color, sendImmediately);
    }

    this.colors[colorIndex] = colorHex;
  }
  setColorOpacity(
    colorIndex: number,
    opacity: number,
    sendImmediately?: boolean
  ) {
    this.#assertValidColorIndex(colorIndex);
    this.#assertValidOpacity(opacity);
    if (
      Math.floor(255 * this.#opacities[colorIndex]) == Math.floor(255 * opacity)
    ) {
      _console.log(`redundant opacity #${colorIndex} ${opacity}`);
      return;
    }
    if (this.device?.isConnected) {
      this.device.setDisplayColorOpacity(colorIndex, opacity, sendImmediately);
    }

    this.#opacities[colorIndex] = opacity;
  }
  setOpacity(opacity: number, sendImmediately?: boolean) {
    this.#assertValidOpacity(opacity);
    if (this.device?.isConnected) {
      this.device.setDisplayOpacity(opacity, sendImmediately);
    }
    this.#opacities.fill(opacity);
  }

  // CONTEXT COMMANDS
  // FILL - context state commands
  // FILL - draw commands

  #brightness: DisplayBrightness = "medium";
  get brightness() {
    return this.#brightness;
  }
  #applyBrightnessToGlobalAlpha = true;
  get applyBrightnessToGlobalAlpha() {
    return this.#applyBrightnessToGlobalAlpha;
  }
  set applyBrightnessToGlobalAlpha(newValue) {
    this.#applyBrightnessToGlobalAlpha = newValue;
    this.#updateGlobalAlpha();
  }
  #brightnessAlphaMap: Record<DisplayBrightness, number> = {
    veryLow: 0.3,
    low: 0.5,
    medium: 0.8,
    high: 0.9,
    veryHigh: 1,
  };
  get #brightnessAlpha() {
    if (this.#applyBrightnessToGlobalAlpha) {
      return this.#brightnessAlphaMap[this.brightness];
    } else {
      return 1;
    }
  }
  setBrightness(newBrightness: DisplayBrightness, sendImmediately?: boolean) {
    if (this.#brightness == newBrightness) {
      _console.log(`redundant brightness ${newBrightness}`);
      return;
    }
    this.#brightness = newBrightness;
    if (this.device?.isConnected) {
      this.device.setDisplayBrightness(newBrightness, sendImmediately);
    }
    this.#updateGlobalAlpha();
  }
  #updateGlobalAlpha() {
    this.context.globalAlpha = this.#brightnessAlpha;
  }
  #resetBrightness() {
    this.setBrightness("medium");
  }
  #updateDeviceBrightness() {
    if (this.device?.isConnected) {
      return;
    }
    _console.log("updateDeviceBrightness");
    this.device?.setDisplayBrightness(this.brightness);
  }

  #reset() {
    this.#resetColors();
    this.#resetOpacities();
    this.#resetContextState();
    this.#resetBrightness();
  }
}
export default DisplayCanvasHelper;
