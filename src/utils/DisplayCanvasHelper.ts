import Device, {
  BoundDeviceEventListeners,
  DeviceEventMap,
} from "../Device.ts";
import {
  DisplayBitmapColorPair,
  DisplayBrightness,
  DisplaySpriteColorPair,
  DisplayBitmap,
} from "../DisplayManager.ts";
import {
  assertValidBitmapPixels,
  imageToBitmap,
  quantizeImage,
  resizeAndQuantizeImage,
} from "./DisplayBitmapUtils.ts";
import { hexToRGB, rgbToHex, stringToRGB } from "./ColorUtils.ts";
import { createConsole } from "./Console.ts";
import {
  DefaultDisplayContextState,
  DisplayAlignment,
  DisplayAlignmentDirection,
  DisplayAlignmentDirections,
  DisplayContextState,
  DisplayContextStateKey,
  DisplayDirection,
  DisplaySegmentCap,
  isDirectionHorizontal,
  isDirectionPositive,
  PartialDisplayContextState,
} from "./DisplayContextState.ts";
import DisplayContextStateHelper from "./DisplayContextStateHelper.ts";
import {
  assertAnySelectedSpriteSheet,
  assertLoadedSpriteSheet,
  assertSelectedSpriteSheet,
  assertSprite,
  assertSpritePaletteSwap,
  assertSpriteSheetPalette,
  assertSpriteSheetPaletteSwap,
  DisplaySpriteLines,
  DisplayManagerInterface,
  drawSpriteFromSpriteSheet,
  getSprite,
  getSpritePaletteSwap,
  getSpriteSheetPalette,
  getSpriteSheetPaletteSwap,
  runDisplayContextCommand,
  runDisplayContextCommands,
  selectSpritePaletteSwap,
  selectSpriteSheetPalette,
  selectSpriteSheetPaletteSwap,
  stringToSpriteLines,
} from "./DisplayManagerInterface.ts";
import {
  assertValidColor,
  assertValidOpacity,
  assertValidSegmentCap,
  DisplayScaleDirection,
  DisplayColorRGB,
  DisplayCropDirection,
  DisplayCropDirections,
  DisplayCropDirectionToCommandType,
  DisplayCropDirectionToStateKey,
  DisplayRotationCropDirectionToCommandType,
  DisplayRotationCropDirectionToStateKey,
  maxDisplayScale,
  roundScale,
  minDisplayScale,
  DisplayAlignmentDirectionToCommandType,
  DisplayAlignmentDirectionToStateKey,
  assertValidAlignment,
  assertValidDirection,
} from "./DisplayUtils.ts";
import EventDispatcher, {
  BoundEventListeners,
  Event,
  EventListenerMap,
  EventMap,
} from "./EventDispatcher.ts";
import { addEventListeners, removeEventListeners } from "./EventUtils.ts";
import { clamp, degToRad, normalizeRadians, Vector2 } from "./MathUtils.ts";
import { wait } from "./Timer.ts";
import {
  DisplayContextCommand,
  DisplayContextCommandType,
} from "./DisplayContextCommand.ts";
import {
  DisplaySprite,
  DisplaySpritePaletteSwap,
  DisplaySpriteSheet,
  DisplaySpriteSheetPalette,
  DisplaySpriteSheetPaletteSwap,
  fontToSpriteSheet,
  serializeSpriteSheet,
} from "./DisplaySpriteSheetUtils.ts";
import { Font } from "opentype.js";

const _console = createConsole("DisplayCanvasHelper", { log: true });

export const DisplayCanvasHelperEventTypes = [
  "contextState",
  "numberOfColors",
  "brightness",
  "color",
  "colorOpacity",
  "opacity",
  "resize",
  "update",
  "ready",
  "device",
  "deviceIsConnected",
  "deviceConnected",
  "deviceNotConnected",
  "deviceSpriteSheetUploadStart",
  "deviceSpriteSheetUploadProgress",
  "deviceSpriteSheetUploadComplete",
] as const;
export type DisplayCanvasHelperEventType =
  (typeof DisplayCanvasHelperEventTypes)[number];

export interface DisplayCanvasHelperEventMessages {
  contextState: {
    contextState: DisplayContextState;
    differences: DisplayContextStateKey[];
  };
  numberOfColors: {
    numberOfColors: number;
  };
  brightness: {
    brightness: DisplayBrightness;
  };
  color: {
    colorIndex: number;
    colorRGB: DisplayColorRGB;
    colorHex: string;
  };
  colorOpacity: {
    opacity: number;
    colorIndex: number;
  };
  opacity: {
    opacity: number;
  };
  resize: {
    width: number;
    height: number;
  };
  update: {};
  ready: {};

  device: {
    device?: Device;
  };
  deviceIsConnected: {
    device: Device;
    isConnected: boolean;
  };
  deviceConnected: {
    device: Device;
  };
  deviceNotConnected: {
    device: Device;
  };

  deviceSpriteSheetUploadStart: {
    device: Device;
    spriteSheet: DisplaySpriteSheet;
    spriteSheetName: string;
  };
  deviceSpriteSheetUploadProgress: {
    device: Device;
    spriteSheet: DisplaySpriteSheet;
    spriteSheetName: string;
    progress: number;
  };
  deviceSpriteSheetUploadComplete: {
    device: Device;
    spriteSheet: DisplaySpriteSheet;
    spriteSheetName: string;
  };
}

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

export type DisplayBoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

class DisplayCanvasHelper implements DisplayManagerInterface {
  constructor() {
    this.numberOfColors = 16;
    this.#bitmapContext = this.#bitmapCanvas.getContext("2d")!;
    this.#bitmapContext.imageSmoothingEnabled = false;
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
      // _console.log("redundant canvas assignment", newCanvas);
      return;
    }
    this.#canvas = newCanvas;
    // _console.log("assigned canvas", this.canvas);

    this.#context = this.#canvas?.getContext("2d", {
      willReadFrequently: true,
    })!;
    this.#updateCanvas();
  }
  #context!: CanvasRenderingContext2D;
  get context() {
    return this.#context;
  }

  get width() {
    return this.canvas?.width || 0;
  }
  get height() {
    return this.canvas?.height || 0;
  }
  get aspectRatio() {
    return this.width / this.height;
  }

  #updateCanvas() {
    if (!this.canvas) {
      return;
    }
    this.canvas!.style.aspectRatio = `${this.aspectRatio}`;
    if (!this.device?.isConnected) {
      return;
    }

    // _console.log("updateCanvas");

    const { width, height } = this.device.displayInformation!;
    // _console.log({ width, height });

    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.aspectRatio = `${width / height}`;

    this.#dispatchEvent("resize", { width: this.width, height: this.height });

    this.clear();
  }

  // CONTEXT STACK
  #frontDrawStack: Function[] = [];
  #rearDrawStack: Function[] = [];
  #drawFrontDrawStack() {
    if (!this.context) {
      return;
    }
    this.#context.imageSmoothingEnabled = false;

    this.#save();
    this.#context.resetTransform();
    this.#context.clearRect(0, 0, this.width, this.height);
    this.#restore();

    this.#drawBackground();

    this.#frontDrawStack.forEach((callback) => callback());
    if (this.#applyTransparency) {
      this.#applyTransparencyToCanvas();
    }
    this.#dispatchEvent("update", {});
  }
  #applyTransparencyToCanvas() {
    const ctx = this.context;
    const imageData = ctx.getImageData(
      0,
      0,
      this.canvas!.width,
      this.canvas!.height
    );
    const data = imageData.data;

    const alphaBoost = 1.0; // >1 = more opaque, try 1.1–1.5 for subtlety

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Perceived brightness
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      const alpha = Math.min(255, brightness * alphaBoost);

      // Unpremultiply for clarity
      const scale = alpha > 0 ? 255 / alpha : 0;
      data[i] = Math.min(255, r * scale);
      data[i + 1] = Math.min(255, g * scale);
      data[i + 2] = Math.min(255, b * scale);
      data[i + 3] = alpha;
    }

    ctx.putImageData(imageData, 0, 0);
  }

  #drawBackground() {
    // _console.log("drawBackground");
    this.#save();
    this.#context.resetTransform();
    this.#context.fillStyle = this.#colorIndexToRgbString(0);
    this.#context.fillRect(0, 0, this.width, this.height);
    this.#restore();
  }
  #applyTransparency = false;
  get applyTransparency() {
    return this.#applyTransparency;
  }
  set applyTransparency(newValue) {
    this.#applyTransparency = newValue;
    // _console.log({ applyTransparency: this.applyTransparency });
    this.#drawFrontDrawStack();
  }

  // DEVICE
  #device?: Device;
  get device() {
    return this.#device;
  }
  get deviceDisplayManager() {
    return this.#device?.displayManager;
  }
  set device(newDevice) {
    if (this.#device == newDevice) {
      // _console.log("redundant device assignment", newDevice);
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
      this.#isReady = true;
    }
    this.#device = newDevice;
    addEventListeners(this.#device, this.#boundDeviceEventListeners);
    _console.log("assigned device", this.device);
    if (this.device) {
      this.numberOfColors = this.device.numberOfDisplayColors!;
      this.#updateCanvas();
      this.#updateDevice();
      this.#isReady = this.device.isDisplayReady;

      this.#dispatchEvent("deviceIsConnected", {
        device: this.device,
        isConnected: this.device!.isConnected,
      });
      this.#dispatchEvent(
        this.device.isConnected ? "deviceConnected" : "deviceNotConnected",
        {
          device: this.device,
        }
      );
    }
    this.#dispatchEvent("device", {
      device: this.device,
    });
  }

  async flushContextCommands() {
    if (this.#device?.isConnected) {
      await this.#device.flushDisplayContextCommands();
    }
  }

  // DEVICE EVENTLISTENERS
  #boundDeviceEventListeners: BoundDeviceEventListeners = {
    isConnected: this.#onDeviceIsConnected.bind(this),
    connected: this.#onDeviceConnected.bind(this),
    notConnected: this.#onDeviceNotConnected.bind(this),
    displayReady: this.#onDeviceDisplayReady.bind(this),
    displaySpriteSheetUploadStart:
      this.#onDeviceDisplaySpriteSheetUploadStart.bind(this),
    displaySpriteSheetUploadProgress:
      this.#onDeviceDisplaySpriteSheetUploadProgress.bind(this),
    displaySpriteSheetUploadComplete:
      this.#onDeviceDisplaySpriteSheetUploadComplete.bind(this),
  };
  #onDeviceIsConnected(event: DeviceEventMap["isConnected"]) {
    const { isConnected } = event.message;
    this.#dispatchEvent("deviceIsConnected", {
      device: this.device!,
      isConnected,
    });
  }
  #onDeviceConnected(event: DeviceEventMap["connected"]) {
    // _console.log("device connected");
    this.#updateCanvas();
    this.#updateDevice();
    this.#dispatchEvent("deviceConnected", { device: this.device! });
    // FIX - messages flushed properly?
  }
  #onDeviceNotConnected(event: DeviceEventMap["notConnected"]) {
    // _console.log("device not connected");
    this.#dispatchEvent("deviceNotConnected", { device: this.device! });
  }
  async #onDeviceDisplayReady(event: DeviceEventMap["displayReady"]) {
    // _console.log("device display ready");
    this.#isReady = true;
    // await wait(5); // we need to wait for some reason
    this.#dispatchEvent("ready", {});
  }

  #onDeviceDisplaySpriteSheetUploadStart(
    event: DeviceEventMap["displaySpriteSheetUploadStart"]
  ) {
    const device = event.target;
    const { spriteSheet, spriteSheetName } = event.message;
    this.#dispatchEvent("deviceSpriteSheetUploadStart", {
      device,
      spriteSheet,
      spriteSheetName,
    });
  }
  #onDeviceDisplaySpriteSheetUploadProgress(
    event: DeviceEventMap["displaySpriteSheetUploadProgress"]
  ) {
    const device = event.target;
    const { spriteSheet, spriteSheetName, progress } = event.message;
    this.#dispatchEvent("deviceSpriteSheetUploadProgress", {
      device,
      spriteSheet,
      spriteSheetName,
      progress,
    });
  }
  #onDeviceDisplaySpriteSheetUploadComplete(
    event: DeviceEventMap["displaySpriteSheetUploadComplete"]
  ) {
    const device = event.target;
    const { spriteSheet, spriteSheetName } = event.message;
    this.#dispatchEvent("deviceSpriteSheetUploadComplete", {
      device,
      spriteSheet,
      spriteSheetName,
    });
  }

  async #updateDevice() {
    await this.#updateDeviceColors(true);
    await this.#updateDeviceOpacity(true);
    await this.#updateDeviceContextState(true);
    await this.#updateDeviceBrightness(true);
    await this.#updateDeviceSpriteSheets();
    await this.#updateDeviceSelectedSpriteSheet(true);
  }

  // NUMBER OF COLORS
  #numberOfColors: number = 0;
  get numberOfColors() {
    return this.#numberOfColors;
  }
  set numberOfColors(newNumberOfColors) {
    if (this.#numberOfColors == newNumberOfColors) {
      return;
    }

    this.#numberOfColors = newNumberOfColors;
    // _console.log({ numberOfColors: this.numberOfColors });

    this.#colors = new Array(this.numberOfColors).fill("#000000");
    this.#opacities = new Array(this.numberOfColors).fill(1);
    this.contextState.bitmapColorIndices = new Array(this.numberOfColors).fill(
      0
    );
    this.contextState.spriteColorIndices = new Array(this.numberOfColors).fill(
      0
    );

    this.#dispatchEvent("numberOfColors", {
      numberOfColors: this.numberOfColors,
    });
  }

  // COLORS
  assertValidColorIndex(colorIndex: number) {
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
  async #updateDeviceColors(sendImmediately?: boolean) {
    if (!this.device?.isConnected) {
      return;
    }
    for (const [index, color] of this.colors.entries()) {
      await this.device?.setDisplayColor(index, color, false);
    }
    if (sendImmediately) {
      await this.#device?.flushDisplayContextCommands();
    }
  }

  // OPACITIES
  #opacities: number[] = [];
  get opacities() {
    return this.#opacities;
  }
  #resetOpacities() {
    this.#opacities.length = 0;
  }

  async #updateDeviceOpacity(sendImmediately?: boolean) {
    if (!this.device?.isConnected) {
      return;
    }
    for (const [index, opacity] of this.#opacities.entries()) {
      await this.device?.setDisplayColorOpacity(index, opacity, false);
    }
    if (sendImmediately) {
      await this.#device?.flushDisplayContextCommands();
    }
  }

  // CONEXT STATE
  #contextStateHelper = new DisplayContextStateHelper();
  get contextState() {
    return this.#contextStateHelper.state;
  }
  #onContextStateUpdate(differences: DisplayContextStateKey[]) {
    this.#dispatchEvent("contextState", {
      contextState: structuredClone(this.contextState),
      differences,
    });
  }
  #resetContextState() {
    this.#contextStateHelper.reset();
    this.contextState.bitmapColorIndices = new Array(this.numberOfColors).fill(
      0
    );
    this.contextState.spriteColorIndices = new Array(this.numberOfColors).fill(
      0
    );
  }
  async #updateDeviceContextState(sendImmediately?: boolean) {
    if (!this.device?.isConnected) {
      return;
    }
    // _console.log("updateDeviceContextState");
    await this.device?.setDisplayContextState(
      this.contextState,
      sendImmediately
    );
  }

  async show(sendImmediately = true) {
    // _console.log("showDisplay");

    this.#frontDrawStack = this.#rearDrawStack.slice();
    this.#rearDrawStack.length = 0;

    this.#drawFrontDrawStack();

    this.#isReady = false;

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.show(sendImmediately);
    } else {
      await wait(this.#interval);
      this.#isReady = true;
      this.#dispatchEvent("ready", {});
    }
  }
  #interval = 50;
  get interval() {
    return this.#interval;
  }
  set interval(newInterval) {
    this.#interval = newInterval;
    // _console.log({ interval: this.#interval });
  }

  #isReady = true;
  get isReady() {
    return this.#isReady;
  }

  async clear(sendImmediately = true) {
    // _console.log("clearDisplay");

    this.#frontDrawStack.length = 0;
    this.#rearDrawStack.length = 0;

    this.#isReady = false;
    this.#save();
    this.#context.resetTransform();
    this.#context.clearRect(0, 0, this.width, this.height);
    this.#restore();
    this.#drawBackground();

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.clear(sendImmediately);
    } else {
      await wait(this.#interval);
      this.#isReady = true;
      this.#dispatchEvent("ready", {});
    }
  }

  async setColor(
    colorIndex: number,
    color: DisplayColorRGB | string,
    sendImmediately?: boolean
  ) {
    let colorRGB: DisplayColorRGB;
    if (typeof color == "string") {
      colorRGB = stringToRGB(color);
    } else {
      colorRGB = color;
    }
    const colorHex = rgbToHex(colorRGB);
    if (this.colors[colorIndex] == colorHex) {
      // _console.log(`redundant color #${colorIndex} ${colorHex}`);
      return;
    }

    // _console.log(`setting color #${colorIndex}`, color);
    this.assertValidColorIndex(colorIndex);
    assertValidColor(colorRGB);

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.setColor(
        colorIndex,
        color,
        sendImmediately
      );
    }

    this.colors[colorIndex] = colorHex;
    this.#drawFrontDrawStack();
    this.#dispatchEvent("color", { colorIndex, colorHex, colorRGB });
  }

  async setColorOpacity(
    colorIndex: number,
    opacity: number,
    sendImmediately?: boolean
  ) {
    this.assertValidColorIndex(colorIndex);
    assertValidOpacity(opacity);
    if (
      Math.floor(255 * this.#opacities[colorIndex]) == Math.floor(255 * opacity)
    ) {
      // _console.log(`redundant opacity #${colorIndex} ${opacity}`);
      return;
    }
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.setColorOpacity(
        colorIndex,
        opacity,
        sendImmediately
      );
    }

    this.#opacities[colorIndex] = opacity;
    this.#drawFrontDrawStack();
    this.#dispatchEvent("colorOpacity", { colorIndex, opacity });
  }
  async setOpacity(opacity: number, sendImmediately?: boolean) {
    assertValidOpacity(opacity);
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.setOpacity(opacity, sendImmediately);
    }
    this.#opacities.fill(opacity);
    this.#drawFrontDrawStack();
    this.#dispatchEvent("opacity", { opacity });
  }

  // CONTEXT COMMANDS
  #contextStack: DisplayContextState[] = [];
  #saveContext() {
    this.#contextStack.push(this.contextState);
  }
  #restoreContext() {
    const contextState = this.#contextStack.pop();
    if (!contextState) {
      _console.warn("#contextStack empty");
      return;
    }
    this.#contextStateHelper.update(contextState);
  }
  async saveContext(sendImmediately?: boolean) {
    this.#saveContext();
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.saveContext(sendImmediately);
    }
  }
  async restoreContext(sendImmediately?: boolean) {
    this.#restoreContext();
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.restoreContext(sendImmediately);
    }
  }
  async selectFillColor(fillColorIndex: number, sendImmediately?: boolean) {
    this.assertValidColorIndex(fillColorIndex);
    const differences = this.#contextStateHelper.update({
      fillColorIndex,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.selectFillColor(
        fillColorIndex,
        sendImmediately
      );
    }
    this.#onContextStateUpdate(differences);
  }
  async selectLineColor(lineColorIndex: number, sendImmediately?: boolean) {
    this.assertValidColorIndex(lineColorIndex);
    const differences = this.#contextStateHelper.update({
      lineColorIndex,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.selectLineColor(
        lineColorIndex,
        sendImmediately
      );
    }
    this.#onContextStateUpdate(differences);
  }
  assertValidLineWidth(lineWidth: number) {
    _console.assertRangeWithError(
      "lineWidth",
      lineWidth,
      0,
      Math.max(this.width, this.height)
    );
  }
  async setLineWidth(lineWidth: number, sendImmediately?: boolean) {
    this.assertValidLineWidth(lineWidth);
    const differences = this.#contextStateHelper.update({
      lineWidth,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.setLineWidth(lineWidth, sendImmediately);
    }
    this.#onContextStateUpdate(differences);
  }

  async setAlignment(
    alignmentDirection: DisplayAlignmentDirection,
    alignment: DisplayAlignment,
    sendImmediately?: boolean
  ) {
    _console.assertEnumWithError(
      alignmentDirection,
      DisplayAlignmentDirections
    );
    const alignmentCommand =
      DisplayAlignmentDirectionToCommandType[alignmentDirection];
    const alignmentKey =
      DisplayAlignmentDirectionToStateKey[alignmentDirection];
    const differences = this.#contextStateHelper.update({
      [alignmentKey]: alignment,
    });
    _console.log({
      alignmentKey,
      alignment,
      differences,
    });

    // _console.log({ [cropCommand]: crop });
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.setAlignment(
        alignmentDirection,
        alignment,
        sendImmediately
      );
    }
    this.#onContextStateUpdate(differences);
  }
  async setHorizontalAlignment(
    horizontalAlignment: DisplayAlignment,
    sendImmediately?: boolean
  ) {
    await this.setAlignment("horizontal", horizontalAlignment, sendImmediately);
  }
  async setVerticalAlignment(
    verticalAlignment: DisplayAlignment,
    sendImmediately?: boolean
  ) {
    await this.setAlignment("vertical", verticalAlignment, sendImmediately);
  }
  async resetAlignment(sendImmediately?: boolean) {
    const differences = this.#contextStateHelper.update({
      verticalAlignment: DefaultDisplayContextState.verticalAlignment,
      horizontalAlignment: DefaultDisplayContextState.horizontalAlignment,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.resetAlignment(sendImmediately);
    }
    this.#onContextStateUpdate(differences);
  }

  async setRotation(
    rotation: number,
    isRadians: boolean,
    sendImmediately?: boolean
  ) {
    rotation = isRadians ? rotation : degToRad(rotation);
    rotation = normalizeRadians(rotation);
    // _console.log({ rotation });

    const differences = this.#contextStateHelper.update({
      rotation,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.setRotation(
        rotation,
        true,
        sendImmediately
      );
    }

    this.#onContextStateUpdate(differences);
  }
  async clearRotation(sendImmediately?: boolean) {
    const differences = this.#contextStateHelper.update({
      rotation: 0,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.clearRotation(sendImmediately);
    }
    this.#onContextStateUpdate(differences);
  }
  async setSegmentStartCap(
    segmentStartCap: DisplaySegmentCap,
    sendImmediately?: boolean
  ) {
    assertValidSegmentCap(segmentStartCap);
    const differences = this.#contextStateHelper.update({
      segmentStartCap,
    });

    // _console.log({ segmentStartCap });
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.setSegmentStartCap(
        segmentStartCap,
        sendImmediately
      );
    }
    this.#onContextStateUpdate(differences);
  }
  async setSegmentEndCap(
    segmentEndCap: DisplaySegmentCap,
    sendImmediately?: boolean
  ) {
    assertValidSegmentCap(segmentEndCap);
    const differences = this.#contextStateHelper.update({
      segmentEndCap,
    });

    // _console.log({ segmentEndCap });
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.setSegmentEndCap(
        segmentEndCap,
        sendImmediately
      );
    }
    this.#onContextStateUpdate(differences);
  }
  async setSegmentCap(
    segmentCap: DisplaySegmentCap,
    sendImmediately?: boolean
  ) {
    assertValidSegmentCap(segmentCap);
    const differences = this.#contextStateHelper.update({
      segmentStartCap: segmentCap,
      segmentEndCap: segmentCap,
    });

    // _console.log({ segmentCap });
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.setSegmentCap(
        segmentCap,
        sendImmediately
      );
    }
    this.#onContextStateUpdate(differences);
  }
  async setSegmentStartRadius(
    segmentStartRadius: number,
    sendImmediately?: boolean
  ) {
    const differences = this.#contextStateHelper.update({
      segmentStartRadius,
    });

    // _console.log({ segmentStartRadius });
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.setSegmentStartRadius(
        segmentStartRadius,
        sendImmediately
      );
    }
    this.#onContextStateUpdate(differences);
  }
  async setSegmentEndRadius(
    segmentEndRadius: number,
    sendImmediately?: boolean
  ) {
    const differences = this.#contextStateHelper.update({
      segmentEndRadius,
    });

    // _console.log({ segmentEndRadius });
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.setSegmentEndRadius(
        segmentEndRadius,
        sendImmediately
      );
    }
    this.#onContextStateUpdate(differences);
  }
  // START
  async setSegmentRadius(segmentRadius: number, sendImmediately?: boolean) {
    const differences = this.#contextStateHelper.update({
      segmentStartRadius: segmentRadius,
      segmentEndRadius: segmentRadius,
    });

    // _console.log({ segmentRadius });
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.setSegmentRadius(
        segmentRadius,
        sendImmediately
      );
    }
    this.#onContextStateUpdate(differences);
  }
  async setCrop(
    cropDirection: DisplayCropDirection,
    crop: number,
    sendImmediately?: boolean
  ) {
    _console.assertEnumWithError(cropDirection, DisplayCropDirections);
    crop = Math.max(0, crop);
    const cropKey = DisplayCropDirectionToStateKey[cropDirection];
    const differences = this.#contextStateHelper.update({
      [cropKey]: crop,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.setCrop(
        cropDirection,
        crop,
        sendImmediately
      );
    }
    this.#onContextStateUpdate(differences);
  }
  async setCropTop(cropTop: number, sendImmediately?: boolean) {
    await this.setCrop("top", cropTop, sendImmediately);
  }
  async setCropRight(cropRight: number, sendImmediately?: boolean) {
    await this.setCrop("right", cropRight, sendImmediately);
  }
  async setCropBottom(cropBottom: number, sendImmediately?: boolean) {
    await this.setCrop("bottom", cropBottom, sendImmediately);
  }
  async setCropLeft(cropLeft: number, sendImmediately?: boolean) {
    await this.setCrop("left", cropLeft, sendImmediately);
  }
  async clearCrop(sendImmediately?: boolean) {
    const differences = this.#contextStateHelper.update({
      cropTop: 0,
      cropRight: 0,
      cropBottom: 0,
      cropLeft: 0,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.clearCrop(sendImmediately);
    }
    this.#onContextStateUpdate(differences);
  }

  async setRotationCrop(
    cropDirection: DisplayCropDirection,
    crop: number,
    sendImmediately?: boolean
  ) {
    _console.assertEnumWithError(cropDirection, DisplayCropDirections);
    const cropCommand =
      DisplayRotationCropDirectionToCommandType[cropDirection];
    const cropKey = DisplayRotationCropDirectionToStateKey[cropDirection];
    const differences = this.#contextStateHelper.update({
      [cropKey]: crop,
    });

    // _console.log({ [cropCommand]: crop });
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.setRotationCrop(
        cropDirection,
        crop,
        sendImmediately
      );
    }
    this.#onContextStateUpdate(differences);
  }
  async setRotationCropTop(rotationCropTop: number, sendImmediately?: boolean) {
    await this.setRotationCrop("top", rotationCropTop, sendImmediately);
  }
  async setRotationCropRight(
    rotationCropRight: number,
    sendImmediately?: boolean
  ) {
    await this.setRotationCrop("right", rotationCropRight, sendImmediately);
  }
  async setRotationCropBottom(
    rotationCropBottom: number,
    sendImmediately?: boolean
  ) {
    await this.setRotationCrop("bottom", rotationCropBottom, sendImmediately);
  }
  async setRotationCropLeft(
    rotationCropLeft: number,
    sendImmediately?: boolean
  ) {
    await this.setRotationCrop("left", rotationCropLeft, sendImmediately);
  }
  async clearRotationCrop(sendImmediately?: boolean) {
    const differences = this.#contextStateHelper.update({
      rotationCropTop: 0,
      rotationCropRight: 0,
      rotationCropBottom: 0,
      rotationCropLeft: 0,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.clearRotationCrop(sendImmediately);
    }
    this.#onContextStateUpdate(differences);
  }

  get bitmapColorIndices() {
    return this.contextState.bitmapColorIndices;
  }
  get bitmapColors() {
    return this.bitmapColorIndices.map((colorIndex) => this.colors[colorIndex]);
  }
  async selectBitmapColor(
    bitmapColorIndex: number,
    colorIndex: number,
    sendImmediately?: boolean
  ) {
    this.assertValidColorIndex(bitmapColorIndex);
    const bitmapColorIndices = this.contextState.bitmapColorIndices.slice();
    bitmapColorIndices[bitmapColorIndex] = colorIndex;
    const differences = this.#contextStateHelper.update({
      bitmapColorIndices,
    });

    // _console.log({ bitmapColorIndex, colorIndex });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.selectBitmapColor(
        bitmapColorIndex,
        colorIndex,
        sendImmediately
      );
    }
    this.#onContextStateUpdate(differences);
  }

  async selectBitmapColors(
    bitmapColorPairs: DisplayBitmapColorPair[],
    sendImmediately?: boolean
  ) {
    _console.assertRangeWithError(
      "bitmapColors",
      bitmapColorPairs.length,
      1,
      this.numberOfColors
    );
    const bitmapColorIndices = this.contextState.bitmapColorIndices.slice();
    bitmapColorPairs.forEach(({ bitmapColorIndex, colorIndex }) => {
      this.assertValidColorIndex(bitmapColorIndex);
      this.assertValidColorIndex(colorIndex);
      bitmapColorIndices[bitmapColorIndex] = colorIndex;
    });

    const differences = this.#contextStateHelper.update({
      bitmapColorIndices,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.selectBitmapColors(
        bitmapColorPairs,
        sendImmediately
      );
    }
    this.#onContextStateUpdate(differences);
  }

  async setBitmapColor(
    bitmapColorIndex: number,
    color: DisplayColorRGB | string,
    sendImmediately?: boolean
  ) {
    return this.setColor(
      this.bitmapColorIndices[bitmapColorIndex],
      color,
      sendImmediately
    );
  }
  async setBitmapColorOpacity(
    bitmapColorIndex: number,
    opacity: number,
    sendImmediately?: boolean
  ) {
    return this.setColorOpacity(
      this.bitmapColorIndices[bitmapColorIndex],
      opacity,
      sendImmediately
    );
  }

  async setBitmapScaleDirection(
    direction: DisplayScaleDirection,
    bitmapScale: number,
    sendImmediately?: boolean
  ) {
    bitmapScale = clamp(bitmapScale, minDisplayScale, maxDisplayScale);
    bitmapScale = roundScale(bitmapScale);
    //_console.log({ bitmapScale });
    const newState: PartialDisplayContextState = {};
    switch (direction) {
      case "all":
        newState.bitmapScaleX = bitmapScale;
        newState.bitmapScaleY = bitmapScale;
        break;
      case "x":
        newState.bitmapScaleX = bitmapScale;
        break;
      case "y":
        newState.bitmapScaleY = bitmapScale;
        break;
    }
    const differences = this.#contextStateHelper.update(newState);

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.setBitmapScaleDirection(
        direction,
        bitmapScale,
        sendImmediately
      );
    }

    this.#onContextStateUpdate(differences);
  }

  async setBitmapScaleX(bitmapScaleX: number, sendImmediately?: boolean) {
    return this.setBitmapScaleDirection("x", bitmapScaleX, sendImmediately);
  }
  async setBitmapScaleY(bitmapScaleY: number, sendImmediately?: boolean) {
    return this.setBitmapScaleDirection("y", bitmapScaleY, sendImmediately);
  }
  async setBitmapScale(bitmapScale: number, sendImmediately?: boolean) {
    return this.setBitmapScaleDirection("all", bitmapScale, sendImmediately);
  }
  async resetBitmapScale(sendImmediately?: boolean) {
    //return this.setBitmapScaleDirection("all", 1, sendImmediately);

    const differences = this.#contextStateHelper.update({
      bitmapScaleX: 1,
      bitmapScaleY: 1,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.resetBitmapScale(sendImmediately);
    }

    this.#onContextStateUpdate(differences);
  }

  get spriteColorIndices() {
    return this.contextState.spriteColorIndices;
  }
  get spriteColors() {
    return this.spriteColorIndices.map((colorIndex) => this.colors[colorIndex]);
  }
  get spriteBitmapColorIndices() {
    return this.bitmapColorIndices.map(
      (colorIndex) => this.spriteColorIndices[colorIndex]
    );
  }
  get spriteBitmapColors() {
    return this.spriteBitmapColorIndices.map(
      (colorIndex) => this.colors[colorIndex]
    );
  }
  async selectSpriteColor(
    spriteColorIndex: number,
    colorIndex: number,
    sendImmediately?: boolean
  ) {
    this.assertValidColorIndex(spriteColorIndex);
    const spriteColorIndices = this.contextState.spriteColorIndices.slice();
    spriteColorIndices[spriteColorIndex] = colorIndex;
    const differences = this.#contextStateHelper.update({
      spriteColorIndices,
    });

    // _console.log({ spriteColorIndex, colorIndex });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.selectSpriteColor(
        spriteColorIndex,
        colorIndex,
        sendImmediately
      );
    }
    this.#onContextStateUpdate(differences);
  }

  async selectSpriteColors(
    spriteColorPairs: DisplaySpriteColorPair[],
    sendImmediately?: boolean
  ) {
    _console.assertRangeWithError(
      "spriteColors",
      spriteColorPairs.length,
      1,
      this.numberOfColors
    );
    const spriteColorIndices = this.contextState.spriteColorIndices.slice();
    spriteColorPairs.forEach(({ spriteColorIndex, colorIndex }) => {
      this.assertValidColorIndex(spriteColorIndex);
      this.assertValidColorIndex(colorIndex);
      spriteColorIndices[spriteColorIndex] = colorIndex;
    });

    const differences = this.#contextStateHelper.update({
      spriteColorIndices,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.selectSpriteColors(
        spriteColorPairs,
        sendImmediately
      );
    }
    this.#onContextStateUpdate(differences);
  }

  async setSpriteColor(
    spriteColorIndex: number,
    color: DisplayColorRGB | string,
    sendImmediately?: boolean
  ) {
    return this.setColor(
      this.spriteColorIndices[spriteColorIndex],
      color,
      sendImmediately
    );
  }
  async setSpriteColorOpacity(
    spriteColorIndex: number,
    opacity: number,
    sendImmediately?: boolean
  ) {
    return this.setColorOpacity(
      this.spriteColorIndices[spriteColorIndex],
      opacity,
      sendImmediately
    );
  }

  async resetSpriteColors(sendImmediately?: boolean) {
    const spriteColorIndices = new Array(this.numberOfColors).fill(0);
    const differences = this.#contextStateHelper.update({
      spriteColorIndices,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.resetSpriteColors(sendImmediately);
    }
    this.#onContextStateUpdate(differences);
  }

  async setSpriteScaleDirection(
    direction: DisplayScaleDirection,
    spriteScale: number,
    sendImmediately?: boolean
  ) {
    spriteScale = clamp(spriteScale, minDisplayScale, maxDisplayScale);
    spriteScale = roundScale(spriteScale);
    const newState: PartialDisplayContextState = {};
    switch (direction) {
      case "all":
        newState.spriteScaleX = spriteScale;
        newState.spriteScaleY = spriteScale;
        break;
      case "x":
        newState.spriteScaleX = spriteScale;
        break;
      case "y":
        newState.spriteScaleY = spriteScale;
        break;
    }
    const differences = this.#contextStateHelper.update(newState);

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.setSpriteScaleDirection(
        direction,
        spriteScale,
        sendImmediately
      );
    }

    this.#onContextStateUpdate(differences);
  }

  async setSpriteScaleX(spriteScaleX: number, sendImmediately?: boolean) {
    return this.setSpriteScaleDirection("x", spriteScaleX, sendImmediately);
  }
  async setSpriteScaleY(spriteScaleY: number, sendImmediately?: boolean) {
    return this.setSpriteScaleDirection("y", spriteScaleY, sendImmediately);
  }
  async setSpriteScale(spriteScale: number, sendImmediately?: boolean) {
    return this.setSpriteScaleDirection("all", spriteScale, sendImmediately);
  }
  async resetSpriteScale(sendImmediately?: boolean) {
    //return this.setSpriteScaleDirection("all", 1, sendImmediately);

    const differences = this.#contextStateHelper.update({
      spriteScaleX: 1,
      spriteScaleY: 1,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.resetSpriteScale(sendImmediately);
    }

    this.#onContextStateUpdate(differences);
  }

  async setSpritesLineHeight(
    spritesLineHeight: number,
    sendImmediately?: boolean
  ) {
    this.assertValidLineWidth(spritesLineHeight);
    const differences = this.#contextStateHelper.update({
      spritesLineHeight,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.setSpritesLineHeight(
        spritesLineHeight,
        sendImmediately
      );
    }
    this.#onContextStateUpdate(differences);
  }

  async setSpritesDirectionGeneric(
    direction: DisplayDirection,
    isOrthogonal: boolean,
    sendImmediately?: boolean
  ) {
    assertValidDirection(direction);
    const stateKey: DisplayContextStateKey = isOrthogonal
      ? "spritesLineDirection"
      : "spritesDirection";
    const differences = this.#contextStateHelper.update({
      [stateKey]: direction,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      this.deviceDisplayManager!.setSpritesDirectionGeneric(
        direction,
        isOrthogonal,
        sendImmediately
      );
    }

    this.#onContextStateUpdate(differences);
  }
  async setSpritesDirection(
    spritesDirection: DisplayDirection,
    sendImmediately?: boolean
  ) {
    await this.setSpritesDirectionGeneric(
      spritesDirection,
      false,
      sendImmediately
    );
  }
  async setSpritesLineDirection(
    spritesLineDirection: DisplayDirection,
    sendImmediately?: boolean
  ) {
    await this.setSpritesDirectionGeneric(
      spritesLineDirection,
      true,
      sendImmediately
    );
  }

  async setSpritesSpacingGeneric(
    spacing: number,
    isOrthogonal: boolean,
    sendImmediately?: boolean
  ) {
    this.assertValidLineWidth(spacing);
    const stateKey: DisplayContextStateKey = isOrthogonal
      ? "spritesLineSpacing"
      : "spritesSpacing";
    const differences = this.#contextStateHelper.update({
      [stateKey]: spacing,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      this.deviceDisplayManager!.setSpritesSpacingGeneric(
        spacing,
        isOrthogonal,
        sendImmediately
      );
    }

    this.#onContextStateUpdate(differences);
  }
  async setSpritesSpacing(spritesSpacing: number, sendImmediately?: boolean) {
    await this.setSpritesSpacingGeneric(spritesSpacing, false, sendImmediately);
  }
  async setSpritesLineSpacing(
    spritesSpacing: number,
    sendImmediately?: boolean
  ) {
    await this.setSpritesSpacingGeneric(spritesSpacing, true, sendImmediately);
  }

  async setSpritesAlignmentGeneric(
    alignment: DisplayAlignment,
    isOrthogonal: boolean,
    sendImmediately?: boolean
  ) {
    assertValidAlignment(alignment);
    const stateKey: DisplayContextStateKey = isOrthogonal
      ? "spritesLineAlignment"
      : "spritesAlignment";
    const differences = this.#contextStateHelper.update({
      [stateKey]: alignment,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      this.deviceDisplayManager!.setSpritesAlignmentGeneric(
        alignment,
        isOrthogonal,
        sendImmediately
      );
    }
    this.#onContextStateUpdate(differences);
  }
  async setSpritesAlignment(
    spritesAlignment: DisplayAlignment,
    sendImmediately?: boolean
  ) {
    await this.setSpritesAlignmentGeneric(
      spritesAlignment,
      false,
      sendImmediately
    );
  }
  async setSpritesLineAlignment(
    spritesLineAlignment: DisplayAlignment,
    sendImmediately?: boolean
  ) {
    await this.setSpritesAlignmentGeneric(
      spritesLineAlignment,
      true,
      sendImmediately
    );
  }

  #clearRectToCanvas(x: number, y: number, width: number, height: number) {
    this.#save();
    //this.context.resetTransform();
    this.context.fillStyle = this.#colorIndexToRgbString(0);
    //this.context.fillStyle = "red"; // remove when done debugigng
    this.context.fillRect(x, y, width, height);
    this.#restore();
  }
  async clearRect(
    x: number,
    y: number,
    width: number,
    height: number,
    sendImmediately?: boolean
  ) {
    this.#rearDrawStack.push(() =>
      this.#clearRectToCanvas(x, y, width, height)
    );
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.clearRect(
        x,
        y,
        width,
        height,
        sendImmediately
      );
    }
  }
  #save() {
    //console.trace("save", window.s);
    const ctx = this.#context;
    ctx.save();
  }
  #restore() {
    //console.trace("restore");
    const ctx = this.#context;
    ctx.restore();
  }
  #transformContext(offsetX: number, offsetY: number, rotation: number) {
    this.#translateContext(offsetX, offsetY);
    this.#rotateContext(rotation);
  }
  #translateContext(offsetX: number, offsetY: number) {
    const ctx = this.context;
    ctx.translate(offsetX, offsetY);
  }
  #rotateContext(rotation: number) {
    const ctx = this.context;
    ctx.rotate(rotation);
  }
  #scaleContext(scaleX: number, scaleY: number) {
    const ctx = this.context;
    ctx.scale(scaleX, scaleY);
  }
  #correctAlignmentTranslation(
    { width, height }: DisplayBoundingBox,
    { verticalAlignment, horizontalAlignment }: DisplayContextState
  ) {
    switch (horizontalAlignment) {
      case "start":
        this.#translateContext(width / 2, 0);
        break;
      case "center":
        break;
      case "end":
        this.#translateContext(-width / 2, 0);
        break;
    }
    switch (verticalAlignment) {
      case "start":
        this.#translateContext(0, height / 2);
        break;
      case "center":
        break;
      case "end":
        this.#translateContext(0, -height / 2);
        break;
    }
  }
  #rotateBoundingBox(
    box: DisplayBoundingBox,
    rotation: number
  ): DisplayBoundingBox {
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    const corners = [
      { x: box.x, y: box.y },
      { x: box.x, y: box.height + box.y },
      { x: box.x + box.width, y: box.y },
      { x: box.x + box.width, y: box.height + box.y },
    ];

    const rotated = corners.map(({ x, y }) => ({
      x: x * cos - y * sin,
      y: x * sin + y * cos,
    }));

    const xs = rotated.map((p) => p.x);
    const ys = rotated.map((p) => p.y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }
  #offsetBoundingBox(
    box: DisplayBoundingBox,
    offsetX: number,
    offsetY: number
  ): DisplayBoundingBox {
    const offsetBoundingBox = structuredClone(box);
    offsetBoundingBox.x += offsetX;
    offsetBoundingBox.y += offsetY;
    return offsetBoundingBox;
  }
  #clearBoundingBoxOnDraw = true;
  #clearBoundingBox({ x, y, width, height }: DisplayBoundingBox) {
    this.#clearRectToCanvas(x, y, width, height);
  }
  #getOuterPadding(lineWidth: number) {
    return Math.ceil(lineWidth / 2);
  }
  #getRectBoundingBox(
    width: number,
    height: number,
    { lineWidth, verticalAlignment, horizontalAlignment }: DisplayContextState,
    applyLineWidth = true
  ): DisplayBoundingBox {
    const outerPadding = applyLineWidth ? this.#getOuterPadding(lineWidth) : 0;
    const boundingBox = {
      x: 0,
      y: 0,
      width: width + outerPadding * 2,
      height: height + outerPadding * 2,
    };
    assertValidAlignment(horizontalAlignment);
    assertValidAlignment(verticalAlignment);
    switch (horizontalAlignment) {
      case "start":
        break;
      case "center":
        boundingBox.x -= boundingBox.width / 2;
        break;
      case "end":
        boundingBox.x -= boundingBox.width;
        break;
    }
    switch (verticalAlignment) {
      case "start":
        break;
      case "center":
        boundingBox.y -= boundingBox.height / 2;
        break;
      case "end":
        boundingBox.y -= boundingBox.height;
        break;
    }
    return boundingBox;
  }
  #applyClip(
    { x, y, height, width }: DisplayBoundingBox,
    { cropTop, cropRight, cropBottom, cropLeft }: DisplayContextState
  ) {
    const ctx = this.context;
    ctx.beginPath();
    ctx.rect(x + cropLeft, y + cropTop, width - cropRight, height - cropBottom);
    ctx.clip();
  }
  #applyRotationClip(
    { x, y, height, width }: DisplayBoundingBox,
    {
      rotationCropTop,
      rotationCropRight,
      rotationCropBottom,
      rotationCropLeft,
    }: DisplayContextState
  ) {
    const ctx = this.context;
    ctx.beginPath();
    ctx.rect(
      x + rotationCropLeft,
      y + rotationCropTop,
      width - rotationCropRight,
      height - rotationCropBottom
    );

    ctx.clip();
  }

  #hexToRgbWithOpacity(hex: string, opacity: number): DisplayColorRGB {
    // Expand shorthand hex (#f00 → #ff0000)
    if (hex.length === 4) {
      hex = "#" + [...hex.slice(1)].map((c) => c + c).join("");
    }

    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // Darken color by blending toward black
    const darken = (c: number) => Math.round(c * opacity);

    const dr = darken(r);
    const dg = darken(g);
    const db = darken(b);

    return { r: dr, g: dg, b: db };
  }
  #hexToRgbStringWithOpacity(hex: string, opacity: number) {
    const { r, g, b } = this.#hexToRgbWithOpacity(hex, opacity);
    return `rgb(${r}, ${g}, ${b})`;
  }
  #getColorOpacity(colorIndex: number, includeBrightness = false) {
    return (
      this.opacities[colorIndex] *
      (includeBrightness ? this.#brightnessOpacity : 1)
    );
  }
  #colorIndexToRgbString(colorIndex: number) {
    return this.#hexToRgbStringWithOpacity(
      this.colors[colorIndex],
      this.#getColorOpacity(colorIndex)
    );
  }
  #colorIndexToRgb(colorIndex: number) {
    return this.#hexToRgbWithOpacity(
      this.colors[colorIndex],
      this.#getColorOpacity(colorIndex)
    );
  }
  #updateContext({
    lineWidth,
    fillColorIndex,
    lineColorIndex,
    spriteColorIndices,
  }: DisplayContextState) {
    if (this.#useSpriteColorIndices) {
      fillColorIndex = spriteColorIndices[fillColorIndex];
      lineColorIndex = spriteColorIndices[lineColorIndex];
    }
    this.context.fillStyle = this.#colorIndexToRgbString(fillColorIndex);
    this.context.strokeStyle = this.#colorIndexToRgbString(lineColorIndex);
    this.context.lineWidth = lineWidth;
  }
  #drawRectToCanvas(
    offsetX: number,
    offsetY: number,
    width: number,
    height: number,
    contextState: DisplayContextState
  ) {
    this.#updateContext(contextState);

    this.#save();
    const localBox = this.#getRectBoundingBox(width, height, contextState);
    const rotatedLocalBox = this.#rotateBoundingBox(
      localBox,
      contextState.rotation
    );
    const rotatedBox = this.#offsetBoundingBox(
      rotatedLocalBox,
      offsetX,
      offsetY
    );
    this.#applyClip(rotatedBox, contextState);
    if (this.#clearBoundingBoxOnDraw) {
      this.#clearBoundingBox(rotatedBox);
    }
    this.#transformContext(offsetX, offsetY, contextState.rotation);
    this.#applyRotationClip(localBox, contextState);

    const outerPadding = this.#getOuterPadding(contextState.lineWidth);
    const startX = localBox.x + outerPadding;
    const startY = localBox.y + outerPadding;
    this.context.fillRect(startX, startY, width, height);
    if (contextState.lineWidth > 0) {
      this.context.strokeRect(startX, startY, width, height);
    }
    this.#restore();
  }
  async drawRect(
    offsetX: number,
    offsetY: number,
    width: number,
    height: number,
    sendImmediately?: boolean
  ) {
    const contextState = structuredClone(this.contextState);
    //console.log("drawRect contextState", contextState);
    this.#rearDrawStack.push(() =>
      this.#drawRectToCanvas(offsetX, offsetY, width, height, contextState)
    );
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.drawRect(
        offsetX,
        offsetY,
        width,
        height,
        sendImmediately
      );
    }
  }
  #drawRoundRectToCanvas(
    offsetX: number,
    offsetY: number,
    width: number,
    height: number,
    borderRadius: number,
    contextState: DisplayContextState
  ) {
    this.#updateContext(contextState);

    const maxBorderRadius = Math.min(width, height) / 2;
    borderRadius = Math.min(borderRadius, maxBorderRadius);

    this.#save();
    const localBox = this.#getRectBoundingBox(width, height, contextState);
    const rotatedLocalBox = this.#rotateBoundingBox(
      localBox,
      contextState.rotation
    );
    const rotatedBox = this.#offsetBoundingBox(
      rotatedLocalBox,
      offsetX,
      offsetY
    );
    this.#applyClip(rotatedBox, contextState);
    if (this.#clearBoundingBoxOnDraw) {
      this.#clearBoundingBox(rotatedBox);
    }
    this.#transformContext(offsetX, offsetY, contextState.rotation);
    this.#applyRotationClip(localBox, contextState);

    const outerPadding = this.#getOuterPadding(contextState.lineWidth);
    const startX = localBox.x + outerPadding;
    const startY = localBox.y + outerPadding;

    this.context.beginPath();
    this.context.roundRect(startX, startY, width, height, borderRadius);
    this.context.fill();
    if (contextState.lineWidth > 0) {
      this.context.stroke();
    }
    this.#restore();
  }
  async drawRoundRect(
    offsetX: number,
    offsetY: number,
    width: number,
    height: number,
    borderRadius: number,
    sendImmediately?: boolean
  ) {
    const contextState = structuredClone(this.contextState);
    this.#rearDrawStack.push(() =>
      this.#drawRoundRectToCanvas(
        offsetX,
        offsetY,
        width,
        height,
        borderRadius,
        contextState
      )
    );
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.drawRoundRect(
        offsetX,
        offsetY,
        width,
        height,
        borderRadius,
        sendImmediately
      );
    }
  }
  #getCircleBoundingBox(
    radius: number,
    contextState: DisplayContextState
  ): DisplayBoundingBox {
    const diameter = radius * 2;
    return this.#getRectBoundingBox(diameter, diameter, contextState);
  }
  #drawCircleToCanvas(
    offsetX: number,
    offsetY: number,
    radius: number,
    contextState: DisplayContextState
  ) {
    this.#drawArcEllipseToCanvas(
      offsetX,
      offsetY,
      radius,
      radius,
      0,
      360,
      false,
      contextState
    );
  }
  async drawCircle(
    offsetX: number,
    offsetY: number,
    radius: number,
    sendImmediately?: boolean
  ) {
    const contextState = structuredClone(this.contextState);
    this.#rearDrawStack.push(() =>
      this.#drawCircleToCanvas(offsetX, offsetY, radius, contextState)
    );
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.drawCircle(
        offsetX,
        offsetY,
        radius,
        sendImmediately
      );
    }
  }
  #getEllipseBoundingBox(
    radiusX: number,
    radiusY: number,
    contextState: DisplayContextState
  ): DisplayBoundingBox {
    const diameterX = radiusX * 2;
    const diameterY = radiusY * 2;
    return this.#getRectBoundingBox(diameterX, diameterY, contextState);
  }
  #drawEllipseToCanvas(
    offsetX: number,
    offsetY: number,
    radiusX: number,
    radiusY: number,
    contextState: DisplayContextState
  ) {
    this.#drawArcEllipseToCanvas(
      offsetX,
      offsetY,
      radiusX,
      radiusY,
      0,
      360,
      false,
      contextState
    );
  }
  async drawEllipse(
    offsetX: number,
    offsetY: number,
    radiusX: number,
    radiusY: number,
    sendImmediately?: boolean
  ) {
    const contextState = structuredClone(this.contextState);
    this.#rearDrawStack.push(() =>
      this.#drawEllipseToCanvas(
        offsetX,
        offsetY,
        radiusX,
        radiusY,
        contextState
      )
    );
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.drawEllipse(
        offsetX,
        offsetY,
        radiusX,
        radiusY,
        sendImmediately
      );
    }
  }
  #getRegularPolygonBoundingBox(
    radius: number,
    numberOfSides: number,
    { lineWidth }: DisplayContextState
  ): DisplayBoundingBox {
    let outerPadding = Math.ceil(lineWidth / 2);
    const shapeFactor = 1 / Math.cos(Math.PI / numberOfSides);
    outerPadding = Math.ceil(outerPadding * shapeFactor);

    const diameter = radius * 2;
    const regularPolygonBoundingBox = {
      x: -radius - outerPadding,
      y: -radius - outerPadding,
      width: diameter + outerPadding * 2,
      height: diameter + outerPadding * 2,
    };
    //_console.log("regularPolygonBoundingBox", regularPolygonBoundingBox);
    return regularPolygonBoundingBox;
  }
  #drawRegularPolygonToCanvas(
    offsetX: number,
    offsetY: number,
    radius: number,
    numberOfSides: number,
    contextState: DisplayContextState
  ) {
    this.#updateContext(contextState);

    this.#save();
    const localBox = this.#getRegularPolygonBoundingBox(
      radius,
      numberOfSides,
      contextState
    );
    const rotatedLocalBox = this.#rotateBoundingBox(
      localBox,
      contextState.rotation
    );
    const rotatedBox = this.#offsetBoundingBox(
      rotatedLocalBox,
      offsetX,
      offsetY
    );
    this.#applyClip(rotatedBox, contextState);
    if (this.#clearBoundingBoxOnDraw) {
      this.#clearBoundingBox(rotatedBox);
    }
    this.#transformContext(offsetX, offsetY, contextState.rotation);
    this.#applyRotationClip(localBox, contextState);

    this.context.beginPath();
    const angleStep = (Math.PI * 2) / numberOfSides;
    for (let i = 0; i < numberOfSides; i++) {
      const angle = i * angleStep;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      if (i === 0) {
        this.context.moveTo(x, y);
      } else {
        this.context.lineTo(x, y);
      }
    }
    this.context.closePath();

    this.context.fill();
    if (contextState.lineWidth > 0) {
      this.context.stroke();
    }
    this.#restore();
  }
  async drawRegularPolygon(
    offsetX: number,
    offsetY: number,
    radius: number,
    numberOfSides: number,
    sendImmediately?: boolean
  ) {
    if (numberOfSides < 3) {
      _console.error(`invalid numberOfSides ${numberOfSides}`);
      return;
    }
    const contextState = structuredClone(this.contextState);
    this.#rearDrawStack.push(() =>
      this.#drawRegularPolygonToCanvas(
        offsetX,
        offsetY,
        radius,
        numberOfSides,
        contextState
      )
    );
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.drawRegularPolygon(
        offsetX,
        offsetY,
        radius,
        numberOfSides,
        sendImmediately
      );
    }
  }
  #getPointsBoundingBox(
    points: Vector2[],
    { lineWidth }: DisplayContextState
  ): DisplayBoundingBox {
    const outerPadding = Math.ceil(lineWidth / 2);

    let minX = 0;
    let maxX = 0;
    let minY = 0;
    let maxY = 0;
    points.forEach((point, index) => {
      if (index == 0) {
        minX = maxX = point.x;
        minY = maxY = point.y;
      } else {
        minX = Math.min(minX, point.x);
        maxX = Math.max(maxX, point.x);

        minY = Math.min(minY, point.y);
        maxY = Math.max(maxY, point.y);
      }
    });

    const pointsBoundingBox = {
      x: minX - outerPadding,
      y: minY - outerPadding,
      width: maxX - minX + outerPadding * 2,
      height: maxY - minY + outerPadding * 2,
    };
    _console.log("pointsBoundingBox", pointsBoundingBox);
    return pointsBoundingBox;
  }
  #drawPolygonToCanvas(
    offsetX: number,
    offsetY: number,
    points: Vector2[],
    contextState: DisplayContextState
  ) {
    _console.log("drawPolygonToCanvas", { offsetX, offsetY, points });
    this.#updateContext(contextState);

    this.#save();
    const localBox = this.#getPointsBoundingBox(points, contextState);
    const rotatedLocalBox = this.#rotateBoundingBox(
      localBox,
      contextState.rotation
    );
    const rotatedBox = this.#offsetBoundingBox(
      rotatedLocalBox,
      offsetX,
      offsetY
    );
    this.#applyClip(rotatedBox, contextState);
    if (this.#clearBoundingBoxOnDraw) {
      this.#clearBoundingBox(rotatedBox);
    }
    this.#transformContext(offsetX, offsetY, contextState.rotation);
    this.#applyRotationClip(localBox, contextState);

    this.context.beginPath();
    points.forEach((point, index) => {
      //_console.log(index, point);
      if (index == 0) {
        this.context.moveTo(point.x, point.y);
      } else {
        this.context.lineTo(point.x, point.y);
      }
    });
    this.context.closePath();

    this.context.fill();
    if (contextState.lineWidth > 0) {
      this.context.stroke();
    }
    this.#restore();
  }
  async drawPolygon(
    offsetX: number,
    offsetY: number,
    points: Vector2[],
    sendImmediately?: boolean
  ) {
    const contextState = structuredClone(this.contextState);
    this.#rearDrawStack.push(() =>
      this.#drawPolygonToCanvas(offsetX, offsetY, points, contextState)
    );
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.drawPolygon(
        offsetX,
        offsetY,
        points,
        sendImmediately
      );
    }
  }
  #getLocalSegmentBoundingBox(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    {
      lineWidth,
      segmentStartRadius,
      segmentEndRadius,
      segmentStartCap,
      segmentEndCap,
    }: DisplayContextState
  ): DisplayBoundingBox {
    const outerPadding = this.#getOuterPadding(lineWidth);
    const dx = endX - startX;
    const dy = endY - startY;
    const length = Math.sqrt(dx * dx + dy * dy);
    const maxRadius =
      Math.max(segmentStartRadius, segmentEndRadius) + outerPadding;
    const width = maxRadius * 2;
    let height = length;
    height += outerPadding * 2;
    if (segmentStartCap == "round") {
      height += segmentStartRadius;
    }
    if (segmentEndCap == "round") {
      height += segmentEndRadius;
    }

    let y = -outerPadding;
    if (segmentStartCap == "round") {
      y -= segmentStartRadius;
    }

    const box: DisplayBoundingBox = {
      x: -maxRadius,
      y,
      height,
      width,
    };
    return box;
  }
  #getSegmentBoundingBox(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    contextState: DisplayContextState
  ): DisplayBoundingBox {
    const localBox = this.#getLocalSegmentBoundingBox(
      startX,
      startY,
      endX,
      endY,
      contextState
    );
    const dx = endX - startX;
    const dy = endY - startY;
    const angle = Math.atan2(dy, dx) - Math.PI / 2;
    const rotatedBox = this.#rotateBoundingBox(localBox, angle);
    const offsetBox = this.#offsetBoundingBox(rotatedBox, startX, startY);
    return offsetBox;
  }
  #drawSegmentToCanvas(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    contextState: DisplayContextState,
    clearBoundingBox = true
  ) {
    // _console.log("drawSegmentToCanvas", { startX, startY, endX, endY });

    this.#updateContext(contextState);

    const dx = endX - startX;
    const dy = endY - startY;
    const length = Math.sqrt(dx * dx + dy * dy);
    const rotation = Math.atan2(dy, dx) - Math.PI / 2;

    if (length == 0) {
      return;
    }

    this.#save();
    const localBox = this.#getLocalSegmentBoundingBox(
      startX,
      startY,
      endX,
      endY,
      contextState
    );
    const rotatedLocalBox = this.#rotateBoundingBox(localBox, rotation);
    const rotatedBox = this.#offsetBoundingBox(rotatedLocalBox, startX, startY);
    this.#applyClip(rotatedBox, contextState);
    if (this.#clearBoundingBoxOnDraw && clearBoundingBox) {
      this.#clearBoundingBox(rotatedBox);
    }
    this.#translateContext(startX, startY);
    this.#rotateContext(rotation);
    this.#applyRotationClip(localBox, contextState);

    const x0 = 0;
    const x1 = 0;
    const y0 = 0;
    const y1 = length;

    const r0 = contextState.segmentStartRadius;
    const r1 = contextState.segmentEndRadius;

    if (contextState.segmentStartCap == "round") {
      this.context.beginPath();
      this.context.arc(x0, y0, r0, 0, Math.PI * 2);
      this.context.closePath();
      this.context.fill();
      if (contextState.lineWidth > 0) {
        this.context.stroke();
      }
    }
    if (contextState.segmentEndCap == "round") {
      this.context.beginPath();
      this.context.arc(x1, y1, r1, 0, Math.PI * 2);
      this.context.closePath();
      this.context.fill();
      if (contextState.lineWidth > 0) {
        this.context.stroke();
      }
    }

    // full trapezoid (top right, clockwise)
    this.context.beginPath();
    this.context.moveTo(r0, 0);
    this.context.lineTo(-r0, 0);
    this.context.lineTo(-r1, length);
    this.context.lineTo(r1, length);
    this.context.closePath();
    this.context.fill();

    // Stroke only the side edges (top right, clockwise)
    if (contextState.lineWidth > 0) {
      this.context.beginPath();

      this.context.moveTo(r0, 0);
      if (contextState.segmentStartCap === "flat") {
        this.context.lineTo(-r0, 0);
      } else {
        this.context.moveTo(-r0, 0);
      }

      this.context.lineTo(-r1, length);

      if (contextState.segmentEndCap === "flat") {
        this.context.lineTo(r1, length);
      } else {
        this.context.moveTo(r1, length);
      }

      this.context.lineTo(r0, 0);
      if (contextState.segmentStartCap === "flat") {
        this.context.closePath();
      }
      this.context.stroke();
    }

    this.#restore();
  }
  async drawSegment(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    sendImmediately?: boolean
  ) {
    if (startX == endX && startY == endY) {
      _console.error(`cannot draw segment of length 0`);
      return;
    }
    const contextState = structuredClone(this.contextState);
    this.#rearDrawStack.push(() =>
      this.#drawSegmentToCanvas(startX, startY, endX, endY, contextState)
    );
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.drawSegment(
        startX,
        startY,
        endX,
        endY,
        sendImmediately
      );
    }
  }
  #drawSegmentsToCanvas(points: Vector2[], contextState: DisplayContextState) {
    this.#updateContext(contextState);

    this.#save();
    const box = this.#getPointsBoundingBox(points, contextState);
    if (this.#clearBoundingBoxOnDraw) {
      this.#clearBoundingBox(box);
    }

    this.#clearBoundingBoxOnDraw = false;
    points.forEach((segment, index) => {
      if (index > 0) {
        const previousPoint = points[index - 1];

        const startX = previousPoint.x;
        const startY = previousPoint.y;
        const endX = segment.x;
        const endY = segment.y;

        this.#drawSegmentToCanvas(
          startX,
          startY,
          endX,
          endY,
          contextState,
          false
        );
      }
    });
    this.#clearBoundingBoxOnDraw = true;

    this.#restore();
  }
  async drawSegments(points: Vector2[], sendImmediately?: boolean) {
    _console.assertRangeWithError("numberOfPoints", points.length, 2, 255);
    // _console.log({ points });
    const contextState = structuredClone(this.contextState);
    this.#rearDrawStack.push(() =>
      this.#drawSegmentsToCanvas(points, contextState)
    );
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.drawSegments(points, sendImmediately);
    }
  }
  #drawArcToCanvas(
    offsetX: number,
    offsetY: number,
    radius: number,
    startAngle: number,
    angleOffset: number,
    isRadians: boolean,
    contextState: DisplayContextState
  ) {
    this.#drawArcEllipseToCanvas(
      offsetX,
      offsetY,
      radius,
      radius,
      startAngle,
      angleOffset,
      isRadians,
      contextState
    );
  }

  async drawArc(
    offsetX: number,
    offsetY: number,
    radius: number,
    startAngle: number,
    angleOffset: number,
    isRadians?: boolean,
    sendImmediately?: boolean
  ) {
    startAngle = isRadians ? startAngle : degToRad(startAngle);
    angleOffset = isRadians ? angleOffset : degToRad(angleOffset);

    const contextState = structuredClone(this.contextState);
    this.#rearDrawStack.push(() =>
      this.#drawArcToCanvas(
        offsetX,
        offsetY,
        radius,
        startAngle,
        angleOffset,
        true,
        contextState
      )
    );
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.drawArc(
        offsetX,
        offsetY,
        radius,
        startAngle,
        angleOffset,
        true,
        sendImmediately
      );
    }
  }
  #drawArcEllipseToCanvas(
    offsetX: number,
    offsetY: number,
    radiusX: number,
    radiusY: number,
    startAngle: number,
    angleOffset: number,
    isRadians: boolean,
    contextState: DisplayContextState
  ) {
    this.#updateContext(contextState);

    this.#save();
    const localBox = this.#getEllipseBoundingBox(
      radiusX,
      radiusY,
      contextState
    );
    const rotatedLocalBox = this.#rotateBoundingBox(
      localBox,
      contextState.rotation
    );
    const rotatedBox = this.#offsetBoundingBox(
      rotatedLocalBox,
      offsetX,
      offsetY
    );
    this.#applyClip(rotatedBox, contextState);
    if (this.#clearBoundingBoxOnDraw) {
      this.#clearBoundingBox(rotatedBox);
    }
    this.#transformContext(offsetX, offsetY, contextState.rotation);
    this.#applyRotationClip(localBox, contextState);

    const outerPadding = this.#getOuterPadding(contextState.lineWidth);
    const startX = localBox.x + outerPadding;
    const startY = localBox.y + outerPadding;
    const centerX = startX + radiusX;
    const centerY = startY + radiusY;

    // draw elliptical pie slice (includes radial lines)
    this.context.beginPath();
    this.context.moveTo(centerX, centerY);
    const clockwise = angleOffset > 0;
    const endAngle = startAngle + angleOffset;

    this.context.ellipse(
      centerX,
      centerY,
      radiusX,
      radiusY,
      0,
      startAngle,
      endAngle,
      !clockwise
    );
    this.context.closePath();
    this.context.fill();

    // Stroke only the elliptical arc
    if (contextState.lineWidth > 0) {
      this.context.beginPath();
      this.context.ellipse(
        centerX,
        centerY,
        radiusX,
        radiusY,
        0,
        startAngle,
        endAngle,
        !clockwise
      );
      this.context.stroke();
    }

    this.#restore();
  }
  async drawArcEllipse(
    offsetX: number,
    offsetY: number,
    radiusX: number,
    radiusY: number,
    startAngle: number,
    angleOffset: number,
    isRadians?: boolean,
    sendImmediately?: boolean
  ) {
    startAngle = isRadians ? startAngle : degToRad(startAngle);
    angleOffset = isRadians ? angleOffset : degToRad(angleOffset);

    const contextState = structuredClone(this.contextState);
    this.#rearDrawStack.push(() =>
      this.#drawArcEllipseToCanvas(
        offsetX,
        offsetY,
        radiusX,
        radiusY,
        startAngle,
        angleOffset,
        true,
        contextState
      )
    );
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.drawArcEllipse(
        offsetX,
        offsetY,
        radiusX,
        radiusY,
        startAngle,
        angleOffset,
        true,
        sendImmediately
      );
    }
  }

  #bitmapCanvas = document.createElement("canvas");
  #bitmapContext!: CanvasRenderingContext2D;
  async #drawBitmapToCanvas(
    offsetX: number,
    offsetY: number,
    bitmap: DisplayBitmap,
    contextState: DisplayContextState
  ) {
    this.#updateContext(contextState);

    const { bitmapScaleX, bitmapScaleY } = contextState;
    const width = bitmap.width * Math.abs(bitmapScaleX);
    const height = bitmap.height * Math.abs(bitmapScaleY);

    this.#save();
    const localBox = this.#getRectBoundingBox(
      width,
      height,
      contextState,
      false
    );
    const rotatedLocalBox = this.#rotateBoundingBox(
      localBox,
      contextState.rotation
    );
    const rotatedBox = this.#offsetBoundingBox(
      rotatedLocalBox,
      offsetX,
      offsetY
    );
    this.#applyClip(rotatedBox, contextState);
    if (this.#clearBoundingBoxOnDraw) {
      this.#clearBoundingBox(rotatedBox);
    }
    this.#transformContext(offsetX, offsetY, contextState.rotation);
    this.#applyRotationClip(localBox, contextState);

    this.#bitmapCanvas.width = bitmap.width;
    this.#bitmapCanvas.height = bitmap.height;

    const bitmapImageData = this.#bitmapContext.createImageData(
      bitmap.width,
      bitmap.height
    );
    const rawBitmapImageData = bitmapImageData.data;

    const startX = localBox.x;
    const startY = localBox.y;
    bitmap.pixels.forEach((pixel, pixelIndex) => {
      let colorIndex = contextState.bitmapColorIndices[pixel];
      if (this.#useSpriteColorIndices) {
        colorIndex = contextState.spriteColorIndices[colorIndex];
      }
      const color = hexToRGB(this.colors[colorIndex]);
      const opacity = this.#getColorOpacity(colorIndex);

      const imageDataOffset = pixelIndex * 4;

      rawBitmapImageData[imageDataOffset + 0] = color.r;
      rawBitmapImageData[imageDataOffset + 1] = color.g;
      rawBitmapImageData[imageDataOffset + 2] = color.b;
      rawBitmapImageData[imageDataOffset + 3] = Math.floor(opacity * 255);
    });

    // _console.log("rawBitmapImageData", rawBitmapImageData);

    this.#bitmapContext.putImageData(bitmapImageData, 0, 0);
    this.#context.scale(Math.sign(bitmapScaleX), Math.sign(bitmapScaleY));
    this.#context.drawImage(this.#bitmapCanvas, startX, startY, width, height);

    this.#restore();
  }

  assertValidNumberOfColors(numberOfColors: number) {
    _console.assertRangeWithError(
      "numberOfColors",
      numberOfColors,
      2,
      this.numberOfColors
    );
  }
  assertValidBitmap(bitmap: DisplayBitmap) {
    this.assertValidNumberOfColors(bitmap.numberOfColors);
    assertValidBitmapPixels(bitmap);
  }
  async drawBitmap(
    offsetX: number,
    offsetY: number,
    bitmap: DisplayBitmap,
    sendImmediately?: boolean
  ) {
    this.assertValidBitmap(bitmap);
    // _console.log("drawBitmap", { offsetX, offsetY, bitmap, sendImmediately });
    const contextState = structuredClone(this.contextState);
    this.#rearDrawStack.push(() =>
      this.#drawBitmapToCanvas(offsetX, offsetY, bitmap, contextState)
    );
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.drawBitmap(
        offsetX,
        offsetY,
        bitmap,
        sendImmediately
      );
    }
  }

  // SPRITES
  #spriteSheets: Record<string, DisplaySpriteSheet> = {};
  #spriteSheetIndices: Record<string, number> = {};
  get spriteSheets() {
    return this.#spriteSheets;
  }
  get spriteSheetIndices() {
    return this.#spriteSheetIndices;
  }
  async uploadSpriteSheet(spriteSheet: DisplaySpriteSheet) {
    spriteSheet = structuredClone(spriteSheet);
    if (!this.#spriteSheets[spriteSheet.name]) {
      this.#spriteSheetIndices[spriteSheet.name] = Object.keys(
        this.#spriteSheets
      ).length;
    }
    this.#spriteSheets[spriteSheet.name] = spriteSheet;
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.uploadSpriteSheet(spriteSheet);
    }
  }
  async uploadSpriteSheets(spriteSheets: DisplaySpriteSheet[]) {
    for (const spriteSheet of spriteSheets) {
      _console.log(`uploading spriteSheet "${spriteSheet.name}"...`);
      await this.uploadSpriteSheet(spriteSheet);
    }
  }
  assertLoadedSpriteSheet(spriteSheetName: string) {
    assertLoadedSpriteSheet(this, spriteSheetName);
  }
  assertSelectedSpriteSheet(spriteSheetName: string) {
    assertSelectedSpriteSheet(this, spriteSheetName);
  }
  assertAnySelectedSpriteSheet() {
    assertAnySelectedSpriteSheet(this);
  }
  assertSprite(spriteName: string) {
    return assertSprite(this, spriteName);
  }
  getSprite(spriteName: string): DisplaySprite | undefined {
    return getSprite(this, spriteName);
  }
  getSpriteSheetPalette(
    paletteName: string
  ): DisplaySpriteSheetPalette | undefined {
    return getSpriteSheetPalette(this, paletteName);
  }
  getSpriteSheetPaletteSwap(
    paletteSwapName: string
  ): DisplaySpriteSheetPaletteSwap | undefined {
    return getSpriteSheetPaletteSwap(this, paletteSwapName);
  }
  getSpritePaletteSwap(
    spriteName: string,
    paletteSwapName: string
  ): DisplaySpritePaletteSwap | undefined {
    return getSpritePaletteSwap(this, spriteName, paletteSwapName);
  }
  get selectedSpriteSheet() {
    if (this.contextState.spriteSheetName) {
      return this.#spriteSheets[this.contextState.spriteSheetName];
    }
  }
  get selectedSpriteSheetName() {
    return this.selectedSpriteSheet?.name;
  }
  async selectSpriteSheet(spriteSheetName: string, sendImmediately?: boolean) {
    this.assertLoadedSpriteSheet(spriteSheetName);
    const differences = this.#contextStateHelper.update({
      spriteSheetName,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      this.deviceDisplayManager!.selectSpriteSheet(
        spriteSheetName,
        sendImmediately
      );
    }
    this.#onContextStateUpdate(differences);
  }
  #runSpriteCommand(
    command: DisplayContextCommand,
    contextState: DisplayContextState
  ) {
    //_console.log("runSpriteCommand", command);
    if (command.type == "drawSprite") {
      const spriteSheet = this.spriteSheets[contextState.spriteSheetName!];
      const sprite = spriteSheet.sprites[command.spriteIndex];
      if (sprite) {
        _console.log("drawing sub sprite", sprite);
        this.#saveContextForSprite(
          command.offsetX,
          command.offsetY,
          sprite,
          contextState
        );
        sprite.commands.forEach((command) => {
          this.#runSpriteCommand(command, contextState);
        });
        this.#restoreContextForSprite();
      } else {
        _console.error(
          `sprite index ${command.spriteIndex} not found in spriteSheet`
        );
      }
    } else {
      this.runContextCommand(command);
    }
  }
  #drawSpriteToCanvas(
    offsetX: number,
    offsetY: number,
    sprite: DisplaySprite,
    contextState: DisplayContextState
  ) {
    this.#setIgnoreDevice(true);
    this.#setClearCanvasBoundingBoxOnDraw(false);
    this.#setUseSpriteColorIndices(true);
    this.#saveContextForSprite(offsetX, offsetY, sprite, contextState);

    sprite.commands.forEach((command) => {
      this.#runSpriteCommand(command, contextState);
    });

    this.#setIgnoreDevice(false);
    this.#restoreContextForSprite();
    this.#setUseSpriteColorIndices(false);
    this.#setClearCanvasBoundingBoxOnDraw(true);
  }
  async drawSprite(
    offsetX: number,
    offsetY: number,
    spriteName: string,
    sendImmediately?: boolean
  ) {
    _console.assertWithError(
      this.selectedSpriteSheet,
      "no spriteSheet selected"
    );
    let sprite = this.selectedSpriteSheet?.sprites.find(
      (sprite) => sprite.name == spriteName
    );
    _console.assertWithError(sprite, `sprite "${spriteName}" not found`);

    const contextState = structuredClone(this.contextState);
    this.#drawSpriteToCanvas(offsetX, offsetY, sprite!, contextState);

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.drawSprite(
        offsetX,
        offsetY,
        spriteName,
        sendImmediately
      );
    }
  }
  #drawSpritesToCanvas(
    offsetX: number,
    offsetY: number,
    spritesLines: DisplaySpriteLines,
    contextState: DisplayContextState
  ) {
    this.#setIgnoreDevice(true);
    this.#setUseSpriteColorIndices(true);

    const spritesSize = { width: 0, height: 0 };

    const isSpritesDirectionPositive = isDirectionPositive(
      contextState.spritesDirection
    );
    const isSpritesLineDirectionPositive = isDirectionPositive(
      contextState.spritesLineDirection
    );

    const isSpritesDirectionHorizontal = isDirectionHorizontal(
      contextState.spritesDirection
    );
    const isSpritesLineDirectionHorizontal = isDirectionHorizontal(
      contextState.spritesLineDirection
    );

    const areSpritesDirectionsOrthogonal =
      isSpritesDirectionHorizontal != isSpritesLineDirectionHorizontal;

    const breadthSizeKey = isSpritesDirectionHorizontal ? "width" : "height";
    const depthSizeKey = isSpritesLineDirectionHorizontal ? "width" : "height";

    if (!areSpritesDirectionsOrthogonal) {
      if (isSpritesDirectionHorizontal) {
        spritesSize.height += contextState.spritesLineHeight;
      } else {
        spritesSize.width += contextState.spritesLineHeight;
      }
    }

    const spritesBreadthSign = isSpritesDirectionPositive ? 1 : -1;
    const spritesDepthSign = isSpritesLineDirectionPositive ? 1 : -1;

    const spritesLineBreadths: number[] = [];

    const _spritesLines: DisplaySprite[][] = [];

    spritesLines.forEach((spriteLine, lineIndex) => {
      const _spriteLine: DisplaySprite[] = [];

      let spritesLineBreadth = 0;

      spriteLine.forEach(({ spriteSheetName, spriteNames }) => {
        const spriteSheet = this.spriteSheets[spriteSheetName];
        _console.assertWithError(
          spriteSheet,
          `no spriteSheet found with name "${spriteSheetName}"`
        );
        spriteNames.forEach((spriteName) => {
          const sprite = spriteSheet.sprites.find(
            (sprite) => sprite.name == spriteName
          )!;
          _console.assertWithError(
            sprite,
            `no sprite found with name "${spriteName} in "${spriteSheetName}" spriteSheet`
          );
          const spriteIndex = _spriteLine.length;
          _spriteLine.push(sprite);
          spritesLineBreadth += isSpritesDirectionHorizontal
            ? sprite.width
            : sprite.height;
          spritesLineBreadth += contextState.spritesSpacing;
          //_console.log({ spriteIndex, spritesLineBreadth });
        });
      });
      spritesLineBreadth -= contextState.spritesSpacing;

      if (areSpritesDirectionsOrthogonal) {
        spritesSize[breadthSizeKey] = Math.max(
          spritesSize[breadthSizeKey],
          spritesLineBreadth
        );

        spritesSize[depthSizeKey] += contextState.spritesLineHeight;
      } else {
        spritesSize[breadthSizeKey] += spritesLineBreadth;
      }

      spritesSize[depthSizeKey] += contextState.spritesLineSpacing;

      _console.log({
        lineIndex,
        spritesBreadth: spritesSize[breadthSizeKey],
        spritesDepth: spritesSize[depthSizeKey],
      });

      spritesLineBreadths.push(spritesLineBreadth);
      _spritesLines.push(_spriteLine);
    });
    spritesSize[depthSizeKey] -= contextState.spritesLineSpacing;
    const numberOfLines = _spritesLines.length;

    _console.log({
      numberOfLines,
      spritesWidth: spritesSize.width,
      spritesHeight: spritesSize.height,
    });

    const spritesScaledWidth =
      spritesSize.width * Math.abs(contextState.spriteScaleX);
    const spritesScaledHeight =
      spritesSize.height * Math.abs(contextState.spriteScaleY);

    _console.log({ spritesScaledWidth, spritesScaledHeight });

    this.#setCanvasContextTransform(
      offsetX,
      offsetY,
      spritesSize.width,
      spritesSize.height,
      contextState
    );
    this.#setClearCanvasBoundingBoxOnDraw(false);

    this.#saveContext();
    this.clearCrop();
    this.clearRotation();
    this.clearRotationCrop();
    this.resetSpriteScale();

    if (isSpritesDirectionHorizontal) {
      if (isSpritesDirectionPositive) {
        this.setHorizontalAlignment("start");
      } else {
        this.setHorizontalAlignment("end");
      }
    } else {
      if (isSpritesDirectionPositive) {
        this.setVerticalAlignment("start");
      } else {
        this.setVerticalAlignment("end");
      }
    }

    if (areSpritesDirectionsOrthogonal) {
      if (isSpritesLineDirectionHorizontal) {
        if (isSpritesLineDirectionPositive) {
          this.setHorizontalAlignment("start");
        } else {
          this.setHorizontalAlignment("end");
        }
      } else {
        if (isSpritesLineDirectionPositive) {
          this.setVerticalAlignment("start");
        } else {
          this.setVerticalAlignment("end");
        }
      }
    } else {
      if (isSpritesDirectionHorizontal) {
        this.setVerticalAlignment("start");
      } else {
        this.setHorizontalAlignment("start");
      }
    }

    let spritesBreadthStart = 0;
    switch (contextState.spritesDirection) {
      case "right":
        spritesBreadthStart = -spritesSize.width / 2;
        break;
      case "left":
        spritesBreadthStart = spritesSize.width / 2;
        break;
      case "up":
        spritesBreadthStart = spritesSize.height / 2;
        break;
      case "down":
        spritesBreadthStart = -spritesSize.height / 2;
        break;
    }

    const spriteOffset = {
      x: 0,
      y: 0,
    };

    const breadthOffsetKey = isSpritesDirectionHorizontal ? "x" : "y";
    const depthOffsetKey = isSpritesLineDirectionHorizontal ? "x" : "y";

    const signedSpritesSpacing =
      spritesBreadthSign * contextState.spritesSpacing;
    const signedSpriteLineSpacing =
      spritesDepthSign * contextState.spritesLineSpacing;
    const signedSpriteLineHeight =
      spritesDepthSign * contextState.spritesLineHeight;

    if (!areSpritesDirectionsOrthogonal) {
      spriteOffset[breadthOffsetKey] = spritesBreadthStart;
    }

    if (areSpritesDirectionsOrthogonal) {
      switch (contextState.spritesLineDirection) {
        case "right":
          spriteOffset[depthOffsetKey] = -spritesSize.width / 2;
          break;
        case "left":
          spriteOffset[depthOffsetKey] = spritesSize.width / 2;
          break;
        case "up":
          spriteOffset[depthOffsetKey] = spritesSize.height / 2;
          break;
        case "down":
          spriteOffset[depthOffsetKey] = -spritesSize.height / 2;
          break;
      }
    } else {
      switch (contextState.spritesDirection) {
        case "right":
        case "left":
          spriteOffset.y = -spritesSize.height / 2;
          break;
        case "up":
        case "down":
          spriteOffset.x = -spritesSize.width / 2;
          break;
      }
    }

    _spritesLines.forEach((_spritesLine, lineIndex) => {
      const spritesLineBreadth = spritesLineBreadths[lineIndex];
      if (areSpritesDirectionsOrthogonal) {
        switch (contextState.spritesLineAlignment) {
          case "start":
            spriteOffset[breadthOffsetKey] = spritesBreadthStart;
            break;
          case "center":
            spriteOffset[breadthOffsetKey] =
              spritesBreadthStart +
              spritesBreadthSign *
                ((spritesSize[breadthSizeKey] - spritesLineBreadth) / 2);
            break;
          case "end":
            spriteOffset[breadthOffsetKey] =
              spritesBreadthStart +
              spritesBreadthSign *
                (spritesSize[breadthSizeKey] - spritesLineBreadth);
            break;
        }
      }
      _spritesLine.forEach((sprite) => {
        const _spriteOffset = {
          x: spriteOffset.x,
          y: spriteOffset.y,
        };

        const spriteAlignmentOffsetKey = isSpritesDirectionHorizontal
          ? "y"
          : "x";
        const spriteDepth = isSpritesDirectionHorizontal
          ? sprite.height
          : sprite.width;

        switch (contextState.spritesAlignment) {
          case "start":
            break;
          case "center":
            _spriteOffset[spriteAlignmentOffsetKey] +=
              spritesDepthSign *
              ((contextState.spritesLineHeight - spriteDepth) / 2);
            break;
          case "end":
            _spriteOffset[spriteAlignmentOffsetKey] +=
              spritesDepthSign * (contextState.spritesLineHeight - spriteDepth);
            break;
        }

        const spriteContextState = structuredClone(this.contextState);
        this.#saveContextForSprite(
          _spriteOffset.x,
          _spriteOffset.y,
          sprite,
          spriteContextState
        );
        sprite.commands.forEach((command) => {
          this.#runSpriteCommand(command, spriteContextState);
        });
        this.#restoreContextForSprite();

        spriteOffset[breadthOffsetKey] +=
          spritesBreadthSign *
          (isSpritesDirectionHorizontal ? sprite.width : sprite.height);
        spriteOffset[breadthOffsetKey] += signedSpritesSpacing;
      });

      spriteOffset[breadthOffsetKey] -= signedSpritesSpacing;
      if (areSpritesDirectionsOrthogonal) {
        spriteOffset[depthOffsetKey] += signedSpriteLineHeight;
      }
      spriteOffset[depthOffsetKey] += signedSpriteLineSpacing;
    });

    this.#resetCanvasContextTransform();
    this.#restoreContext();

    this.#setIgnoreDevice(false);
    this.#setUseSpriteColorIndices(false);
    this.#setClearCanvasBoundingBoxOnDraw(true);
  }
  async drawSprites(
    offsetX: number,
    offsetY: number,
    spriteLines: DisplaySpriteLines,
    sendImmediately?: boolean
  ) {
    spriteLines.forEach((spriteLine) => {
      spriteLine.forEach((spriteSubLine) => {
        const { spriteSheetName, spriteNames } = spriteSubLine;
        this.assertLoadedSpriteSheet(spriteSheetName);
        const spriteSheet = this.spriteSheets[spriteSheetName];
        spriteNames.forEach((spriteName) => {
          const sprite = spriteSheet.sprites.find(
            (sprite) => sprite.name == spriteName
          );
          _console.assertWithError(
            sprite,
            `no sprite with name "${spriteName}" found in spriteSheet "${spriteSheetName}"`
          );
        });
      });
    });

    const contextState = structuredClone(this.contextState);
    this.#drawSpritesToCanvas(offsetX, offsetY, spriteLines, contextState);

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.drawSprites(
        offsetX,
        offsetY,
        spriteLines,
        sendImmediately
      );
    }
  }
  async drawSpriteFromSpriteSheet(
    offsetX: number,
    offsetY: number,
    spriteName: string,
    spriteSheet: DisplaySpriteSheet,
    paletteName?: string,
    sendImmediately?: boolean
  ) {
    return drawSpriteFromSpriteSheet(
      this,
      offsetX,
      offsetY,
      spriteName,
      spriteSheet,
      paletteName,
      sendImmediately
    );
  }
  async drawSpritesString(
    offsetX: number,
    offsetY: number,
    string: string,
    requireAll?: boolean,
    sendImmediately?: boolean
  ) {
    const spriteLines = this.stringToSpriteLines(string, requireAll);
    await this.drawSprites(offsetX, offsetY, spriteLines, sendImmediately);
  }
  stringToSpriteLines(
    string: string,
    requireAll?: boolean
  ): DisplaySpriteLines {
    return stringToSpriteLines(string, this.spriteSheets, requireAll);
  }

  // BRIGHTNESS
  #brightness: DisplayBrightness = "medium";
  get brightness() {
    return this.#brightness;
  }
  #brightnessOpacities: Record<DisplayBrightness, number> = {
    veryLow: 0.5,
    low: 0.7,
    medium: 0.9,
    high: 0.95,
    veryHigh: 1,
  };
  get #brightnessOpacity() {
    return this.#brightnessOpacities[this.brightness];
  }
  async setBrightness(
    newBrightness: DisplayBrightness,
    sendImmediately?: boolean
  ) {
    if (this.#brightness == newBrightness) {
      // _console.log(`redundant brightness ${newBrightness}`);
      return;
    }
    this.#brightness = newBrightness;
    // _console.log({ brightness: this.brightness });
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.setBrightness(
        newBrightness,
        sendImmediately
      );
    }
    this.#drawFrontDrawStack();
    this.#dispatchEvent("brightness", { brightness: this.brightness });
  }
  async #resetBrightness() {
    await this.setBrightness("medium");
  }
  async #updateDeviceBrightness(sendImmediately?: boolean) {
    if (!this.device?.isConnected) {
      return;
    }
    // _console.log("updateDeviceBrightness");
    await this.device?.setDisplayBrightness(this.brightness, sendImmediately);
  }
  async #updateDeviceSpriteSheets() {
    if (!this.device?.isConnected) {
      return;
    }
    await this.uploadSpriteSheets(Object.values(this.spriteSheets));
  }
  async #updateDeviceSelectedSpriteSheet(sendImmediately?: boolean) {
    if (!this.device?.isConnected) {
      return;
    }
    if (!this.selectedSpriteSheetName) {
      return;
    }
    _console.log("updateDeviceSelectedSpriteSheet");
    await this.device?.selectDisplaySpriteSheet(
      this.selectedSpriteSheetName,
      sendImmediately
    );
  }

  async runContextCommand(
    command: DisplayContextCommand,
    sendImmediately?: boolean
  ) {
    return runDisplayContextCommand(this, command, sendImmediately);
  }
  async runContextCommands(
    commands: DisplayContextCommand[],
    sendImmediately?: boolean
  ) {
    return runDisplayContextCommands(this, commands, sendImmediately);
  }

  get #contextScale() {
    const transform = this.#context.getTransform();
    const scaleX = transform.a;
    const scaleY = transform.d;
    return { x: scaleX, y: scaleY };
  }
  #setCanvasContextTransform(
    offsetX: number,
    offsetY: number,
    width: number,
    height: number,
    contextState: DisplayContextState
  ) {
    this.#rearDrawStack.push(() => {
      const scaledWidth = width * Math.abs(contextState.spriteScaleX);
      const scaledHeight = height * Math.abs(contextState.spriteScaleY);

      this.#save();
      const localBox = this.#getRectBoundingBox(
        scaledWidth,
        scaledHeight,
        contextState
      );
      const rotatedLocalBox = this.#rotateBoundingBox(
        localBox,
        contextState.rotation
      );
      const rotatedBox = this.#offsetBoundingBox(
        rotatedLocalBox,
        offsetX,
        offsetY
      );
      this.#applyClip(rotatedBox, contextState);
      if (this.#clearBoundingBoxOnDraw) {
        this.#clearBoundingBox(rotatedBox);
      }
      this.#translateContext(offsetX, offsetY);
      this.#rotateContext(contextState.rotation);
      this.#applyRotationClip(localBox, contextState);
      this.#correctAlignmentTranslation(localBox, contextState);
      this.#scaleContext(contextState.spriteScaleX, contextState.spriteScaleY);
    });
  }
  #resetCanvasContextTransform() {
    this.#rearDrawStack.push(() => {
      //_console.log("reset transform");
      this.#restore();
    });
  }

  #setClearCanvasBoundingBoxOnDraw(clearBoundingBoxOnDraw: boolean) {
    this.#rearDrawStack.push(() => {
      //_console.log({ clearBoundingBoxOnDraw });
      this.#clearBoundingBoxOnDraw = clearBoundingBoxOnDraw;
    });
  }
  #ignoreDevice = false;
  #setIgnoreDevice(ignoreDevice: boolean) {
    this.#ignoreDevice = ignoreDevice;
    this.#rearDrawStack.push(() => {
      //_console.log({ ignoreDevice });
      this.#ignoreDevice = ignoreDevice;
    });
  }

  #useSpriteColorIndices = false;
  #setUseSpriteColorIndices(useSpriteColorIndices: boolean) {
    this.#rearDrawStack.push(() => {
      //_console.log({ useSpriteColorIndices });
      this.#useSpriteColorIndices = useSpriteColorIndices;
    });
  }
  #spriteContextStack: DisplayContextState[] = [];
  #spriteStack: DisplaySprite[] = [];
  #saveContextForSprite(
    offsetX: number,
    offsetY: number,
    sprite: DisplaySprite,
    contextState: DisplayContextState
  ) {
    this.#setCanvasContextTransform(
      offsetX,
      offsetY,
      sprite.width,
      sprite.height,
      contextState
    );

    _console.assertWithError(
      !this.#spriteStack.includes(sprite),
      `cyclical sprite ${sprite.name} found in stack`
    );

    const spriteColorIndices = contextState.spriteColorIndices.slice();
    this.#spriteContextStack.push(contextState);
    this.#resetContextState();
    this.contextState.spriteColorIndices = spriteColorIndices;
    //_console.log("_saveContextForSprite", this.contextState);
  }
  #restoreContextForSprite() {
    this.#resetCanvasContextTransform();

    const contextState = this.#spriteContextStack.pop();
    if (!contextState) {
      _console.warn("#spriteContextStack empty");
      return;
    }
    //_console.log("_restoreContextForSprite", contextState);
    this.#contextStateHelper.update(contextState);
  }

  #runPreviewSpriteCommand(
    command: DisplayContextCommand,
    spriteSheet: DisplaySpriteSheet
  ) {
    _console.log("runPreviewSpriteCommand", command);
    if (command.type == "drawSprite") {
      const sprite = spriteSheet.sprites[command.spriteIndex];
      if (sprite) {
        _console.log("drawing sub sprite", sprite);
        const contextState = structuredClone(this.contextState);
        this.#saveContextForSprite(
          command.offsetX,
          command.offsetY,
          sprite,
          contextState
        );
        sprite.commands.forEach((command) => {
          this.#runPreviewSpriteCommand(command, spriteSheet);
        });
        this.#restoreContextForSprite();
      } else {
        _console.error(
          `spriteIndex ${command.spriteIndex} not found in spriteSheet`
        );
      }
    } else {
      this.runContextCommand(command);
    }
  }
  previewSprite(
    offsetX: number,
    offsetY: number,
    sprite: DisplaySprite,
    spriteSheet: DisplaySpriteSheet
  ) {
    this.#setIgnoreDevice(true);
    this.#setUseSpriteColorIndices(true);
    const contextState = structuredClone(this.contextState);
    this.#saveContextForSprite(offsetX, offsetY, sprite, contextState);
    this.#setClearCanvasBoundingBoxOnDraw(false);

    sprite.commands.forEach((command) => {
      this.#runPreviewSpriteCommand(command, spriteSheet);
    });

    this.#setIgnoreDevice(false);
    this.#restoreContextForSprite();
    this.#setUseSpriteColorIndices(false);
    this.#setClearCanvasBoundingBoxOnDraw(true);
  }

  // SPRITE SHEET PALETTES

  assertSpriteSheetPalette(paletteName: string) {
    assertSpriteSheetPalette(this, paletteName);
  }
  assertSpriteSheetPaletteSwap(paletteSwapName: string) {
    assertSpriteSheetPaletteSwap(this, paletteSwapName);
  }
  assertSpritePaletteSwap(spriteName: string, paletteSwapName: string) {
    assertSpritePaletteSwap(this, spriteName, paletteSwapName);
  }
  async selectSpriteSheetPalette(
    paletteName: string,
    offset?: number,
    sendImmediately?: boolean
  ) {
    await selectSpriteSheetPalette(this, paletteName, offset, sendImmediately);
  }
  async selectSpriteSheetPaletteSwap(
    paletteSwapName: string,
    offset?: number,
    sendImmediately?: boolean
  ) {
    await selectSpriteSheetPaletteSwap(
      this,
      paletteSwapName,
      offset,
      sendImmediately
    );
  }
  async selectSpritePaletteSwap(
    spriteName: string,
    paletteSwapName: string,
    offset?: number,
    sendImmediately?: boolean
  ) {
    await selectSpritePaletteSwap(
      this,
      spriteName,
      paletteSwapName,
      offset,
      sendImmediately
    );
  }

  #reset() {
    this.#useSpriteColorIndices = false;
    this.#clearBoundingBoxOnDraw = true;
    this.#ignoreDevice = false;
    this.#resetColors();
    this.#resetOpacities();
    this.#resetContextState();
    this.#resetBrightness();
    Object.keys(this.#spriteSheets).forEach(
      (spriteSheetName) => delete this.#spriteSheets[spriteSheetName]
    );
    Object.keys(this.#spriteSheetIndices).forEach(
      (spriteSheetName) => delete this.#spriteSheetIndices[spriteSheetName]
    );
  }

  async imageToBitmap(
    image: HTMLImageElement,
    width: number,
    height: number,
    numberOfColors?: number
  ) {
    return imageToBitmap(
      image,
      width,
      height,
      this.colors,
      this.bitmapColorIndices,
      numberOfColors
    );
  }
  async quantizeImage(
    image: HTMLImageElement,
    width: number,
    height: number,
    numberOfColors: number
  ) {
    return quantizeImage(image, width, height, numberOfColors);
  }

  async resizeAndQuantizeImage(
    image: HTMLImageElement,
    width: number,
    height: number,
    numberOfColors: number,
    colors?: string[]
  ) {
    return resizeAndQuantizeImage(image, width, height, numberOfColors, colors);
  }

  serializeSpriteSheet(spriteSheet: DisplaySpriteSheet): ArrayBuffer {
    return serializeSpriteSheet(this, spriteSheet);
  }

  async fontToSpriteSheet(
    font: Font,
    fontSize: number,
    spriteSheetName?: string
  ) {
    return fontToSpriteSheet(this, font, fontSize, spriteSheetName);
  }
}
export default DisplayCanvasHelper;
