import Device, {
  BoundDeviceEventListeners,
  DeviceEventMap,
} from "../Device.ts";
import {
  DisplayBitmap,
  DisplayBitmapColorPair,
  DisplayBrightness,
  DisplaySpriteColorPair,
} from "../DisplayManager.ts";
import { assertValidBitmapPixels } from "./DisplayBitmapUtils.ts";
import { hexToRGB, rgbToHex, stringToRGB } from "./ColorUtils.ts";
import { createConsole } from "./Console.ts";
import {
  DisplayContextState,
  DisplayContextStateKey,
  DisplaySegmentCap,
  PartialDisplayContextState,
} from "./DisplayContextState.ts";
import DisplayContextStateHelper from "./DisplayContextStateHelper.ts";
import {
  DisplayManagerInterface,
  DisplayTransform,
  runDisplayContextCommand,
  runDisplayContextCommands,
} from "./DisplayManagerInterface.ts";
import {
  assertValidColor,
  assertValidOpacity,
  assertValidSegmentCap,
  DisplayScaleDirection,
  displayScaleStep,
  DisplayColorRGB,
  DisplayCropDirection,
  DisplayCropDirections,
  DisplayCropDirectionToCommand,
  DisplayCropDirectionToStateKey,
  DisplayRotationCropDirectionToCommand,
  DisplayRotationCropDirectionToStateKey,
  maxDisplayScale,
  roundScale,
} from "./DisplayUtils.ts";
import EventDispatcher, {
  BoundEventListeners,
  Event,
  EventListenerMap,
  EventMap,
} from "./EventDispatcher.ts";
import { addEventListeners, removeEventListeners } from "./EventUtils.ts";
import {
  clamp,
  degToRad,
  getVector2Angle,
  getVector2Length,
  normalizedVector2,
  normalizeRadians,
  Vector2,
} from "./MathUtils.ts";
import { wait } from "./Timer.ts";
import { DisplayContextCommand } from "./DisplayContextCommand.ts";
import {
  DisplaySprite,
  DisplaySpriteSheet,
} from "./DisplaySpriteSheetUtils.ts";

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
    // _console.log("assigned device", this.device);
    if (this.device) {
      this.numberOfColors = this.device.numberOfDisplayColors!;
      this.#updateCanvas();
      this.#updateDevice();
      this.#isReady = this.device.isDisplayReady;
    }
  }

  async flushContextCommands() {
    if (this.#device?.isConnected) {
      await this.#device.flushDisplayContextCommands();
    }
  }

  // DEVICE EVENTLISTENERS
  #boundDeviceEventListeners: BoundDeviceEventListeners = {
    connected: this.#onDeviceConnected.bind(this),
    notConnected: this.#onDeviceNotConnected.bind(this),
    displayReady: this.#onDeviceDisplayReady.bind(this),
  };
  #onDeviceConnected(event: DeviceEventMap["connected"]) {
    // _console.log("device connected");
    this.#updateCanvas();
    this.#updateDevice();
    // FIX - messages flushed properly?
  }
  #onDeviceNotConnected(event: DeviceEventMap["notConnected"]) {
    // _console.log("device not connected");
  }
  async #onDeviceDisplayReady(event: DeviceEventMap["displayReady"]) {
    // _console.log("device display ready");
    this.#isReady = true;
    // await wait(5); // we need to wait for some reason
    this.#dispatchEvent("ready", {});
  }

  #updateDevice() {
    this.#updateDeviceColors(true);
    this.#updateDeviceOpacity(true);
    this.#updateDeviceContextState(true);
    this.#updateDeviceBrightness(true);
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
    this.contextState.spriteColorIndices = new Array(this.numberOfColors)
      .fill(0)
      .map((_, index) => index);

    this.#dispatchEvent("numberOfColors", {
      numberOfColors: this.numberOfColors,
    });
  }

  // COLORS
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
    this.contextState.spriteColorIndices = new Array(this.numberOfColors)
      .fill(0)
      .map((_, index) => index);
  }
  #updateDeviceContextState(sendImmediately?: boolean) {
    if (!this.device?.isConnected) {
      return;
    }
    // _console.log("updateDeviceContextState");
    this.device?.setDisplayContextState(this.contextState, sendImmediately);
  }

  async show(sendImmediately = true) {
    // _console.log("showDisplay");

    this.#frontDrawStack = this.#rearDrawStack.slice();
    this.#rearDrawStack.length = 0;

    this.#drawFrontDrawStack();

    this.#isReady = false;

    if (this.device?.isConnected) {
      await this.device.showDisplay(sendImmediately);
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

    if (this.device?.isConnected) {
      await this.device.clearDisplay(sendImmediately);
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
    this.#assertValidColorIndex(colorIndex);
    assertValidColor(colorRGB);

    if (this.device?.isConnected) {
      await this.device.setDisplayColor(colorIndex, color, sendImmediately);
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
    this.#assertValidColorIndex(colorIndex);
    assertValidOpacity(opacity);
    if (
      Math.floor(255 * this.#opacities[colorIndex]) == Math.floor(255 * opacity)
    ) {
      // _console.log(`redundant opacity #${colorIndex} ${opacity}`);
      return;
    }
    if (this.device?.isConnected) {
      await this.device.setDisplayColorOpacity(
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
    if (this.device?.isConnected) {
      await this.device.setDisplayOpacity(opacity, sendImmediately);
    }
    this.#opacities.fill(opacity);
    this.#drawFrontDrawStack();
    this.#dispatchEvent("opacity", { opacity });
  }

  // CONTEXT COMMANDS
  async saveContext(sendImmediately?: boolean) {
    // FILL
    if (this.device?.isConnected) {
      await this.device.saveDisplayContext(sendImmediately);
    }
    //this.#onDisplayContextStateUpdate(differences);
  }
  async restoreContext(sendImmediately?: boolean) {
    // FILL
    if (this.device?.isConnected) {
      await this.device.restoreDisplayContext(sendImmediately);
    }
    //this.#onDisplayContextStateUpdate(differences);
  }
  async selectFillColor(fillColorIndex: number, sendImmediately?: boolean) {
    this.#assertValidColorIndex(fillColorIndex);
    const differences = this.#contextStateHelper.update({
      fillColorIndex,
    });
    if (differences.length == 0) {
      return;
    }
    if (this.device?.isConnected) {
      await this.device.selectDisplayFillColor(fillColorIndex, sendImmediately);
    }
    this.#onContextStateUpdate(differences);
  }
  async selectLineColor(lineColorIndex: number, sendImmediately?: boolean) {
    this.#assertValidColorIndex(lineColorIndex);
    const differences = this.#contextStateHelper.update({
      lineColorIndex,
    });
    if (differences.length == 0) {
      return;
    }
    if (this.device?.isConnected) {
      await this.device.selectDisplayLineColor(lineColorIndex, sendImmediately);
    }
    this.#onContextStateUpdate(differences);
  }
  #assertValidLineWidth(lineWidth: number) {
    _console.assertRangeWithError("lineWidth", lineWidth, 0, this.width);
  }
  async setLineWidth(lineWidth: number, sendImmediately?: boolean) {
    this.#assertValidLineWidth(lineWidth);
    const differences = this.#contextStateHelper.update({
      lineWidth,
    });
    if (differences.length == 0) {
      return;
    }
    if (this.device?.isConnected) {
      await this.device.setDisplayLineWidth(lineWidth, sendImmediately);
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
    if (differences.length == 0) {
      return;
    }

    if (this.device?.isConnected) {
      await this.device.setDisplayRotation(rotation, true, sendImmediately);
    }

    this.#onContextStateUpdate(differences);
  }
  async clearRotation(sendImmediately?: boolean) {
    const differences = this.#contextStateHelper.update({
      rotation: 0,
    });
    if (differences.length == 0) {
      return;
    }
    if (this.device?.isConnected) {
      await this.device.clearDisplayRotation(sendImmediately);
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
    if (differences.length == 0) {
      return;
    }
    // _console.log({ segmentStartCap });
    if (this.device?.isConnected) {
      await this.device.setDisplaySegmentStartCap(
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
    if (differences.length == 0) {
      return;
    }
    // _console.log({ segmentEndCap });
    if (this.device?.isConnected) {
      await this.device.setDisplaySegmentEndCap(segmentEndCap, sendImmediately);
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
    if (differences.length == 0) {
      return;
    }
    // _console.log({ segmentCap });
    if (this.device?.isConnected) {
      await this.device.setDisplaySegmentCap(segmentCap, sendImmediately);
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
    if (differences.length == 0) {
      return;
    }
    // _console.log({ segmentStartRadius });
    if (this.device?.isConnected) {
      await this.device.setDisplaySegmentStartRadius(
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
    if (differences.length == 0) {
      return;
    }
    // _console.log({ segmentEndRadius });
    if (this.device?.isConnected) {
      await this.device.setDisplaySegmentEndRadius(
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
    if (differences.length == 0) {
      return;
    }
    // _console.log({ segmentRadius });
    if (this.device?.isConnected) {
      await this.device.setDisplaySegmentRadius(segmentRadius, sendImmediately);
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
    const cropCommand = DisplayCropDirectionToCommand[cropDirection];
    const cropKey = DisplayCropDirectionToStateKey[cropDirection];
    const differences = this.#contextStateHelper.update({
      [cropKey]: crop,
    });
    if (differences.length == 0) {
      return;
    }
    // _console.log({ [cropCommand]: crop });
    if (this.device?.isConnected) {
      await this.device.setDisplayCrop(cropDirection, crop, sendImmediately);
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
    if (differences.length == 0) {
      return;
    }
    if (this.device?.isConnected) {
      await this.device.clearDisplayCrop(sendImmediately);
    }
    this.#onContextStateUpdate(differences);
  }

  async setRotationCrop(
    cropDirection: DisplayCropDirection,
    crop: number,
    sendImmediately?: boolean
  ) {
    _console.assertEnumWithError(cropDirection, DisplayCropDirections);
    const cropCommand = DisplayRotationCropDirectionToCommand[cropDirection];
    const cropKey = DisplayRotationCropDirectionToStateKey[cropDirection];
    const differences = this.#contextStateHelper.update({
      [cropKey]: crop,
    });
    if (differences.length == 0) {
      return;
    }
    // _console.log({ [cropCommand]: crop });
    if (this.device?.isConnected) {
      await this.device.setDisplayRotationCrop(
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
    if (differences.length == 0) {
      return;
    }
    if (this.device?.isConnected) {
      await this.device.clearDisplayRotationCrop(sendImmediately);
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
    this.#assertValidColorIndex(bitmapColorIndex);
    const bitmapColorIndices = this.contextState.bitmapColorIndices.slice();
    bitmapColorIndices[bitmapColorIndex] = colorIndex;
    const differences = this.#contextStateHelper.update({
      bitmapColorIndices,
    });
    if (differences.length == 0) {
      return;
    }
    // _console.log({ bitmapColorIndex, colorIndex });

    if (this.device?.isConnected) {
      await this.device.selectDisplayBitmapColor(
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
      this.#assertValidColorIndex(bitmapColorIndex);
      this.#assertValidColorIndex(colorIndex);
      bitmapColorIndices[bitmapColorIndex] = colorIndex;
    });

    const differences = this.#contextStateHelper.update({
      bitmapColorIndices,
    });
    if (differences.length == 0) {
      return;
    }

    if (this.device?.isConnected) {
      await this.device.selectDisplayBitmapColors(
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
    bitmapScale = clamp(bitmapScale, displayScaleStep, maxDisplayScale);
    bitmapScale = roundScale(bitmapScale);
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
    if (differences.length == 0) {
      return;
    }

    if (this.device?.isConnected) {
      await this.device.setDisplayBitmapScaleDirection(
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
    if (differences.length == 0) {
      return;
    }

    if (this.device?.isConnected) {
      await this.device.resetDisplayBitmapScale(sendImmediately);
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
    this.#assertValidColorIndex(spriteColorIndex);
    const spriteColorIndices = this.contextState.spriteColorIndices.slice();
    spriteColorIndices[spriteColorIndex] = colorIndex;
    const differences = this.#contextStateHelper.update({
      spriteColorIndices,
    });
    if (differences.length == 0) {
      return;
    }
    // _console.log({ spriteColorIndex, colorIndex });

    if (this.device?.isConnected) {
      await this.device.selectDisplaySpriteColor(
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
      this.#assertValidColorIndex(spriteColorIndex);
      this.#assertValidColorIndex(colorIndex);
      spriteColorIndices[spriteColorIndex] = colorIndex;
    });

    const differences = this.#contextStateHelper.update({
      spriteColorIndices,
    });
    if (differences.length == 0) {
      return;
    }

    if (this.device?.isConnected) {
      await this.device.selectDisplaySpriteColors(
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
    const spriteColorIndices = new Array(this.numberOfColors)
      .fill(0)
      .map((_, index) => index);
    const differences = this.#contextStateHelper.update({
      spriteColorIndices,
    });
    if (differences.length == 0) {
      return;
    }

    if (this.device?.isConnected) {
      await this.device.resetDisplaySpriteColors(sendImmediately);
    }
    this.#onContextStateUpdate(differences);
  }

  async setSpriteScale(spriteScale: number, sendImmediately?: boolean) {
    spriteScale = clamp(spriteScale, displayScaleStep, maxDisplayScale);
    spriteScale = roundScale(spriteScale);
    const differences = this.#contextStateHelper.update({ spriteScale });
    if (differences.length == 0) {
      return;
    }

    if (this.device?.isConnected) {
      await this.device.setDisplaySpriteScale(spriteScale, sendImmediately);
    }

    this.#onContextStateUpdate(differences);
  }

  async resetSpriteScale(sendImmediately?: boolean) {
    const differences = this.#contextStateHelper.update({
      spriteScale: 1,
    });
    if (differences.length == 0) {
      return;
    }

    if (this.device?.isConnected) {
      await this.device.resetDisplaySpriteScale(sendImmediately);
    }

    this.#onContextStateUpdate(differences);
  }

  #clearRectToCanvas(x: number, y: number, width: number, height: number) {
    this.#save();
    //this.context.resetTransform();
    this.context.fillStyle = this.#colorIndexToRgbString(0);
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
    if (this.device?.isConnected) {
      await this.device.clearDisplayRect(x, y, width, height, sendImmediately);
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
  #transformContext(centerX: number, centerY: number, rotation: number) {
    this.#translateContext(centerX, centerY);
    this.#rotateContext(rotation);
  }
  #translateContext(centerX: number, centerY: number) {
    const ctx = this.context;
    ctx.translate(centerX, centerY);
  }
  #rotateContext(rotation: number) {
    const ctx = this.context;
    ctx.rotate(rotation);
  }
  #rotateBoundingBox(
    box: DisplayBoundingBox,
    rotation: number
  ): DisplayBoundingBox {
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    const hw = box.width / 2;
    const hh = box.height / 2;

    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    const corners = [
      { x: -hw, y: -hh },
      { x: hw, y: -hh },
      { x: hw, y: hh },
      { x: -hw, y: hh },
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
      x: centerX + minX,
      y: centerY + minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }
  #clearBoundingBoxOnDraw = true;
  #clearBoundingBox(
    { x, y, width, height }: DisplayBoundingBox,
    isCentered = true
  ) {
    this.#clearRectToCanvas(
      isCentered ? -width / 2 : x,
      isCentered ? -height / 2 : y,
      width,
      height
    );
  }
  #getBoundingBox(
    centerX: number,
    centerY: number,
    width: number,
    height: number
  ): DisplayBoundingBox {
    const boundingBox = {
      x: centerX - width / 2,
      y: centerY - height / 2,
      width: width,
      height: height,
    };
    return boundingBox;
  }
  #getRectBoundingBox(
    centerX: number,
    centerY: number,
    width: number,
    height: number,
    { lineWidth }: DisplayContextState
  ): DisplayBoundingBox {
    const outerPadding = Math.ceil(lineWidth / 2);
    const boundingBox = {
      x: centerX - width / 2 - outerPadding,
      y: centerY - height / 2 - outerPadding,
      width: width + outerPadding * 2,
      height: height + outerPadding * 2,
    };
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
      -width / 2 + rotationCropLeft,
      -height / 2 + rotationCropTop,
      width - rotationCropLeft - rotationCropRight,
      height - rotationCropTop - rotationCropBottom
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
  #getColorOpacity(colorIndex: number, includeBrightness = true) {
    return this.opacities[colorIndex] * this.#brightnessOpacity;
  }
  #colorIndexToRgbString(colorIndex: number) {
    return this.#hexToRgbStringWithOpacity(
      this.colors[colorIndex],
      this.#getColorOpacity(colorIndex, true)
    );
  }
  #colorIndexToRgb(colorIndex: number) {
    return this.#hexToRgbWithOpacity(
      this.colors[colorIndex],
      this.#getColorOpacity(colorIndex, true)
    );
  }
  #updateContext({
    lineWidth,
    fillColorIndex,
    lineColorIndex,
  }: DisplayContextState) {
    if (this.#useSpriteColorIndices) {
      fillColorIndex = this.spriteColorIndices[fillColorIndex];
      lineColorIndex = this.spriteColorIndices[lineColorIndex];
    }
    this.context.fillStyle = this.#colorIndexToRgbString(fillColorIndex);
    this.context.strokeStyle = this.#colorIndexToRgbString(lineColorIndex);
    this.context.lineWidth = lineWidth;
  }
  #drawRectToCanvas(
    centerX: number,
    centerY: number,
    width: number,
    height: number,
    contextState: DisplayContextState
  ) {
    this.#updateContext(contextState);

    this.#save();
    const box = this.#getRectBoundingBox(
      centerX,
      centerY,
      width,
      height,
      contextState
    );
    const rotatedBox = this.#rotateBoundingBox(box, contextState.rotation);
    this.#applyClip(rotatedBox, contextState);

    this.#transformContext(centerX, centerY, contextState.rotation);
    if (this.#clearBoundingBoxOnDraw) {
      this.#clearBoundingBox(box);
    }

    this.#applyRotationClip(box, contextState);

    const x = -width / 2;
    const y = -height / 2;
    this.context.fillRect(x, y, width, height);
    if (contextState.lineWidth > 0) {
      this.context.strokeRect(x, y, width, height);
    }
    this.#restore();
  }
  async drawRect(
    centerX: number,
    centerY: number,
    width: number,
    height: number,
    sendImmediately?: boolean
  ) {
    const contextState = structuredClone(this.contextState);
    //console.log("drawRect contextState", contextState);
    this.#rearDrawStack.push(() =>
      this.#drawRectToCanvas(centerX, centerY, width, height, contextState)
    );

    if (this.device?.isConnected) {
      await this.device.drawDisplayRect(
        centerX,
        centerY,
        width,
        height,
        sendImmediately
      );
    }
  }
  #drawRoundRectToCanvas(
    centerX: number,
    centerY: number,
    width: number,
    height: number,
    borderRadius: number,
    contextState: DisplayContextState
  ) {
    this.#updateContext(contextState);

    this.#save();
    const box = this.#getRectBoundingBox(
      centerX,
      centerY,
      width,
      height,
      contextState
    );

    const rotatedBox = this.#rotateBoundingBox(box, contextState.rotation);
    this.#applyClip(rotatedBox, contextState);

    this.#transformContext(centerX, centerY, contextState.rotation);
    if (this.#clearBoundingBoxOnDraw) {
      this.#clearBoundingBox(box);
    }

    this.#applyRotationClip(box, contextState);

    const x = -width / 2;
    const y = -height / 2;

    this.context.beginPath();
    this.context.roundRect(x, y, width, height, borderRadius);
    this.context.fill();
    if (contextState.lineWidth > 0) {
      this.context.stroke();
    }
    this.#restore();
  }
  async drawRoundRect(
    centerX: number,
    centerY: number,
    width: number,
    height: number,
    borderRadius: number,
    sendImmediately?: boolean
  ) {
    const contextState = structuredClone(this.contextState);
    this.#rearDrawStack.push(() =>
      this.#drawRoundRectToCanvas(
        centerX,
        centerY,
        width,
        height,
        borderRadius,
        contextState
      )
    );
    if (this.device?.isConnected) {
      await this.device.drawDisplayRoundRect(
        centerX,
        centerY,
        width,
        height,
        borderRadius,
        sendImmediately
      );
    }
  }
  #getCircleBoundingBox(
    centerX: number,
    centerY: number,
    radius: number,
    contextState: DisplayContextState
  ): DisplayBoundingBox {
    const diameter = radius * 2;
    return this.#getRectBoundingBox(
      centerX,
      centerY,
      diameter,
      diameter,
      contextState
    );
  }
  #drawCircleToCanvas(
    centerX: number,
    centerY: number,
    radius: number,
    contextState: DisplayContextState
  ) {
    this.#updateContext(contextState);

    this.#save();
    const box = this.#getCircleBoundingBox(
      centerX,
      centerY,
      radius,
      contextState
    );
    this.#applyClip(box, contextState);

    this.#transformContext(centerX, centerY, contextState.rotation);
    if (this.#clearBoundingBoxOnDraw) {
      this.#clearBoundingBox(box);
    }

    this.#applyRotationClip(box, contextState);

    this.context.beginPath();
    this.context.arc(0, 0, radius, 0, 2 * Math.PI);
    this.context.fill();
    if (contextState.lineWidth) {
      this.context.stroke();
    }
    this.#restore();
  }
  async drawCircle(
    centerX: number,
    centerY: number,
    radius: number,
    sendImmediately?: boolean
  ) {
    const contextState = structuredClone(this.contextState);
    this.#rearDrawStack.push(() =>
      this.#drawCircleToCanvas(centerX, centerY, radius, contextState)
    );
    if (this.device?.isConnected) {
      await this.device.drawDisplayCircle(
        centerX,
        centerY,
        radius,
        sendImmediately
      );
    }
  }
  #getEllipseBoundingBox(
    centerX: number,
    centerY: number,
    radiusX: number,
    radiusY: number,
    contextState: DisplayContextState
  ): DisplayBoundingBox {
    const diameterX = radiusX * 2;
    const diameterY = radiusY * 2;
    return this.#getRectBoundingBox(
      centerX,
      centerY,
      diameterX,
      diameterY,
      contextState
    );
  }
  #drawEllipseToCanvas(
    centerX: number,
    centerY: number,
    radiusX: number,
    radiusY: number,
    contextState: DisplayContextState
  ) {
    this.#updateContext(contextState);

    this.#save();
    const box = this.#getEllipseBoundingBox(
      centerX,
      centerY,
      radiusX,
      radiusY,
      contextState
    );

    const rotatedBox = this.#rotateBoundingBox(box, contextState.rotation);
    this.#applyClip(rotatedBox, contextState);

    this.#transformContext(centerX, centerY, contextState.rotation);
    if (this.#clearBoundingBoxOnDraw) {
      this.#clearBoundingBox(box);
    }

    this.#applyRotationClip(box, contextState);

    this.context.beginPath();
    this.context.ellipse(0, 0, radiusX, radiusY, 0, 0, 2 * Math.PI);
    this.context.fill();
    if (contextState.lineWidth > 0) {
      this.context.stroke();
    }
    this.#restore();
  }
  async drawEllipse(
    centerX: number,
    centerY: number,
    radiusX: number,
    radiusY: number,
    sendImmediately?: boolean
  ) {
    const contextState = structuredClone(this.contextState);
    this.#rearDrawStack.push(() =>
      this.#drawEllipseToCanvas(
        centerX,
        centerY,
        radiusX,
        radiusY,
        contextState
      )
    );
    if (this.device?.isConnected) {
      await this.device.drawDisplayEllipse(
        centerX,
        centerY,
        radiusX,
        radiusY,
        sendImmediately
      );
    }
  }
  #getPolygonBoundingBox(
    centerX: number,
    centerY: number,
    radius: number,
    numberOfSides: number,
    { lineWidth }: DisplayContextState
  ): DisplayBoundingBox {
    let outerPadding = Math.ceil(lineWidth / 2);
    const shapeFactor = 1 / Math.cos(Math.PI / numberOfSides);
    outerPadding = Math.ceil(outerPadding * shapeFactor);

    const diameter = radius * 2;
    const boundingBox = {
      x: centerX - radius - outerPadding,
      y: centerY - radius - outerPadding,
      width: diameter + outerPadding * 2,
      height: diameter + outerPadding * 2,
    };
    return boundingBox;
  }
  #drawPolygonToCanvas(
    centerX: number,
    centerY: number,
    radius: number,
    numberOfSides: number,
    contextState: DisplayContextState
  ) {
    this.#updateContext(contextState);

    this.#save();
    const box = this.#getPolygonBoundingBox(
      centerX,
      centerY,
      radius,
      numberOfSides,
      contextState
    );
    this.#applyClip(box, contextState);

    this.#transformContext(centerX, centerY, contextState.rotation);
    if (this.#clearBoundingBoxOnDraw) {
      this.#clearBoundingBox(box);
    }

    this.#applyRotationClip(box, contextState);

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
  async drawPolygon(
    centerX: number,
    centerY: number,
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
      this.#drawPolygonToCanvas(
        centerX,
        centerY,
        radius,
        numberOfSides,
        contextState
      )
    );
    if (this.device?.isConnected) {
      await this.device.drawDisplayPolygon(
        centerX,
        centerY,
        radius,
        numberOfSides,
        sendImmediately
      );
    }
  }
  #getSegmentBoundingBox(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    { lineWidth, segmentStartRadius, segmentEndRadius }: DisplayContextState
  ): DisplayBoundingBox {
    const outerPadding = Math.ceil(lineWidth / 2);
    const segmentStartFullRadius = segmentStartRadius + outerPadding;
    const segmentEndFullRadius = segmentEndRadius + outerPadding;
    // _console.log({ segmentStartFullRadius, segmentEndFullRadius });

    const minX = Math.min(
      startX - segmentStartFullRadius,
      endX - segmentEndFullRadius
    );
    const maxX = Math.max(
      startX + segmentStartFullRadius,
      endX + segmentEndFullRadius
    );
    const minY = Math.min(
      startY - segmentStartFullRadius,
      endY - segmentEndFullRadius
    );
    const maxY = Math.max(
      startY + segmentStartFullRadius,
      endY + segmentEndFullRadius
    );

    // _console.log("segmentBounds", { minX, minY, maxX, maxY });

    const boundingBox = {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
    // _console.log("getSegmentBoundingBox", boundingBox);
    return boundingBox;
  }
  #getSegmentMidpoint(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    {
      lineWidth,
      segmentStartRadius,
      segmentEndRadius,
      segmentEndCap,
      segmentStartCap,
    }: DisplayContextState
  ): Vector2 {
    const outerPadding = Math.ceil(lineWidth / 2);
    const vector: Vector2 = {
      x: endX - startX,
      y: endY - startY,
    };
    const segmentStartLength =
      segmentStartCap == "round"
        ? segmentStartRadius + outerPadding
        : outerPadding;
    const segmentEndLength =
      segmentEndCap == "round" ? segmentEndRadius + outerPadding : outerPadding;
    const unitVector = normalizedVector2(vector);

    const innerStartX = startX - unitVector.x * segmentStartLength;
    const innerStartY = startY - unitVector.y * segmentStartLength;
    const innerEndX = endX + unitVector.x * segmentEndLength;
    const innerEndY = endY + unitVector.y * segmentEndLength;

    const midpoint: Vector2 = {
      x: (innerStartX + innerEndX) / 2,
      y: (innerStartY + innerEndY) / 2,
    };
    //_console.log("midpoint", midpoint);
    return midpoint;
  }
  #getOrientedSegmentBoundingBox(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    {
      lineWidth,
      segmentStartRadius,
      segmentEndRadius,
      segmentEndCap,
      segmentStartCap,
    }: DisplayContextState
  ): DisplayBoundingBox {
    const outerPadding = Math.ceil(lineWidth / 2);
    const vector: Vector2 = {
      x: endX - startX,
      y: endY - startY,
    };
    const segmentStartLength =
      segmentStartCap == "round"
        ? segmentStartRadius + outerPadding
        : outerPadding;
    const segmentEndLength =
      segmentEndCap == "round" ? segmentEndRadius + outerPadding : outerPadding;
    const length =
      getVector2Length(vector) + segmentStartLength + segmentEndLength;
    const width =
      (Math.max(segmentStartRadius, segmentEndRadius) + outerPadding) * 2;

    const boundingBox = {
      x: -width / 2,
      y: -length / 2,
      width: width,
      height: length,
    };
    return boundingBox;
  }
  #applySegmentRotationClip(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    contextState: DisplayContextState
  ) {
    this.#save();

    const vector: Vector2 = {
      x: endX - startX,
      y: endY - startY,
    };
    let rotation = getVector2Angle(vector);
    rotation -= Math.PI / 2;
    // _console.log({ segmentRotation: rotation });
    const midpoint: Vector2 = this.#getSegmentMidpoint(
      startX,
      startY,
      endX,
      endY,
      contextState
    );
    this.context.translate(midpoint.x, midpoint.y);
    this.context.rotate(rotation);
    const box = this.#getOrientedSegmentBoundingBox(
      startX,
      startY,
      endX,
      endY,
      contextState
    );
    this.#applyRotationClip(box, contextState);
    this.#restore();
  }
  #drawSegmentToCanvas(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    contextState: DisplayContextState,
    clearBoundingBox = true
  ) {
    this.#updateContext(contextState);

    // _console.log("drawSegmentToCanvas", { startX, startY, endX, endY });

    this.#save();
    const box = this.#getSegmentBoundingBox(
      startX,
      startY,
      endX,
      endY,
      contextState
    );
    if (this.#clearBoundingBoxOnDraw && clearBoundingBox) {
      this.#clearBoundingBox(box, false);
    }

    this.#applyClip(box, contextState);

    this.#applySegmentRotationClip(startX, startY, endX, endY, contextState);

    const x0 = startX;
    const x1 = endX;
    const y0 = startY;
    const y1 = endY;

    const r0 = contextState.segmentStartRadius;
    const r1 = contextState.segmentEndRadius;

    const dx = x1 - x0;
    const dy = y1 - y0;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) {
      this.#restore();
      return;
    }

    const ux = dx / len;
    const uy = dy / len;

    // Perpendicular vector
    const px = -uy;
    const py = ux;

    // Start circle edge points
    const sx1 = x0 + px * r0;
    const sy1 = y0 + py * r0;
    const sx2 = x0 - px * r0;
    const sy2 = y0 - py * r0;

    // End circle edge points
    const ex1 = x1 + px * r1;
    const ey1 = y1 + py * r1;
    const ex2 = x1 - px * r1;
    const ey2 = y1 - py * r1;

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

    // full trapezoid
    this.context.beginPath();
    this.context.moveTo(sx1, sy1);
    this.context.lineTo(ex1, ey1);
    this.context.lineTo(ex2, ey2);
    this.context.lineTo(sx2, sy2);
    this.context.closePath();
    this.context.fill();

    // Stroke only the side edges
    if (contextState.lineWidth > 0) {
      this.context.beginPath();

      // Start edge → end edge
      this.context.moveTo(sx1, sy1);
      this.context.lineTo(ex1, ey1);

      // End cap (flat or not)
      if (contextState.segmentEndCap === "flat") {
        this.context.lineTo(ex2, ey2);
      } else {
        this.context.moveTo(ex2, ey2);
      }

      // Back to start side
      this.context.lineTo(sx2, sy2);

      // If both ends are flat, close the loop
      if (
        contextState.segmentStartCap === "flat" &&
        contextState.segmentEndCap === "flat"
      ) {
        this.context.closePath();
      }
      // If only the start is flat, manually return to start to avoid gaps
      else if (contextState.segmentStartCap === "flat") {
        this.context.lineTo(sx1, sy1);
        this.context.lineTo(ex1, ey1);
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
    if (this.device?.isConnected) {
      await this.device.drawDisplaySegment(
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

    // _console.log("drawSegmentsToCanvas", { segments: points });

    points.forEach((segment, index) => {
      if (index > 0) {
        const previousPoint = points[index - 1];

        const startX = previousPoint.x;
        const startY = previousPoint.y;
        const endX = segment.x;
        const endY = segment.y;

        const box = this.#getSegmentBoundingBox(
          startX,
          startY,
          endX,
          endY,
          contextState
        );
        if (this.#clearBoundingBoxOnDraw) {
          this.#clearBoundingBox(box);
        }
      }
    });

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
  }
  async drawSegments(points: Vector2[], sendImmediately?: boolean) {
    _console.assertRangeWithError("numberOfPoints", points.length, 2, 255);
    // _console.log({ points });
    const contextState = structuredClone(this.contextState);
    this.#rearDrawStack.push(() =>
      this.#drawSegmentsToCanvas(points, contextState)
    );
    if (this.device?.isConnected) {
      await this.device.drawDisplaySegments(points, sendImmediately);
    }
  }
  #drawArcToCanvas(
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    angleOffset: number,
    isRadians: boolean,
    contextState: DisplayContextState
  ) {
    this.#updateContext(contextState);

    this.#save();
    const box = this.#getCircleBoundingBox(
      centerX,
      centerY,
      radius,
      contextState
    );
    this.#applyClip(box, contextState);

    this.#transformContext(centerX, centerY, contextState.rotation);
    if (this.#clearBoundingBoxOnDraw) {
      this.#clearBoundingBox(box);
    }

    this.#applyRotationClip(box, contextState);

    // Draw the filled pie slice (includes radial lines)
    this.context.beginPath();
    this.context.moveTo(0, 0);
    const clockwise = angleOffset > 0;
    const endAngle = startAngle + angleOffset;

    this.context.arc(0, 0, radius, startAngle, endAngle, !clockwise);
    this.context.closePath();
    this.context.fill();

    // Stroke only the arc part
    if (contextState.lineWidth) {
      this.context.beginPath();
      this.context.arc(0, 0, radius, startAngle, endAngle, !clockwise);
      this.context.stroke();
    }

    this.#restore();
  }
  async drawArc(
    centerX: number,
    centerY: number,
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
        centerX,
        centerY,
        radius,
        startAngle,
        angleOffset,
        true,
        contextState
      )
    );
    if (this.device?.isConnected) {
      await this.device.drawDisplayArc(
        centerX,
        centerY,
        radius,
        startAngle,
        angleOffset,
        true,
        sendImmediately
      );
    }
  }
  #drawArcEllipseToCanvas(
    centerX: number,
    centerY: number,
    radiusX: number,
    radiusY: number,
    startAngle: number,
    angleOffset: number,
    isRadians: boolean,
    contextState: DisplayContextState
  ) {
    this.#updateContext(contextState);

    this.#save();
    const box = this.#getEllipseBoundingBox(
      centerX,
      centerY,
      radiusX,
      radiusY,
      contextState
    );

    const rotatedBox = this.#rotateBoundingBox(box, contextState.rotation);
    this.#applyClip(rotatedBox, contextState);

    this.#transformContext(centerX, centerY, contextState.rotation);
    if (this.#clearBoundingBoxOnDraw) {
      this.#clearBoundingBox(box);
    }

    this.#applyRotationClip(box, contextState);

    // draw elliptical pie slice (includes radial lines)
    this.context.beginPath();
    this.context.moveTo(0, 0);
    const clockwise = angleOffset > 0;
    const endAngle = startAngle + angleOffset;

    this.context.ellipse(
      0,
      0,
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
        0,
        0,
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
    centerX: number,
    centerY: number,
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
        centerX,
        centerY,
        radiusX,
        radiusY,
        startAngle,
        angleOffset,
        true,
        contextState
      )
    );
    if (this.device?.isConnected) {
      await this.device.drawDisplayArcEllipse(
        centerX,
        centerY,
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
    centerX: number,
    centerY: number,
    bitmap: DisplayBitmap,
    contextState: DisplayContextState
  ) {
    this.#updateContext(contextState);

    //_console.log("drawBitmapToCanvas", { centerX, centerY, bitmap }, this.#useSpriteColorIndices);
    //_console.log("drawBitmapToCanvas", this.bitmapColorIndices);

    const { bitmapScaleX, bitmapScaleY } = contextState;
    const width = bitmap.width * bitmapScaleX;
    const height = bitmap.height * bitmapScaleY;

    // _console.log({ width, height });

    this.#save();
    const box = this.#getRectBoundingBox(
      centerX,
      centerY,
      width,
      height,
      contextState
    );
    const rotatedBox = this.#rotateBoundingBox(box, contextState.rotation);
    this.#applyClip(rotatedBox, contextState);

    this.#transformContext(centerX, centerY, contextState.rotation);
    if (this.#clearBoundingBoxOnDraw) {
      this.#clearBoundingBox(box);
    }

    this.#applyRotationClip(box, contextState);

    this.#bitmapCanvas.width = bitmap.width;
    this.#bitmapCanvas.height = bitmap.height;

    const bitmapImageData = this.#bitmapContext.createImageData(
      bitmap.width,
      bitmap.height
    );
    const rawBitmapImageData = bitmapImageData.data;

    const x = -width / 2;
    const y = -height / 2;
    bitmap.pixels.forEach((pixel, pixelIndex) => {
      let colorIndex = contextState.bitmapColorIndices[pixel];
      if (this.#useSpriteColorIndices) {
        colorIndex = contextState.spriteColorIndices[colorIndex];
      }
      const color = hexToRGB(this.colors[colorIndex]);
      const opacity = this.#getColorOpacity(colorIndex, true);

      const imageDataOffset = pixelIndex * 4;

      rawBitmapImageData[imageDataOffset + 0] = color.r;
      rawBitmapImageData[imageDataOffset + 1] = color.g;
      rawBitmapImageData[imageDataOffset + 2] = color.b;
      rawBitmapImageData[imageDataOffset + 3] = Math.floor(opacity * 255);
    });

    // _console.log("rawBitmapImageData", rawBitmapImageData);

    this.#bitmapContext.putImageData(bitmapImageData, 0, 0);
    this.#context.drawImage(this.#bitmapCanvas, x, y, width, height);

    this.#restore();
  }

  #assertValidNumberOfColors(numberOfColors: number) {
    _console.assertRangeWithError(
      "numberOfColors",
      numberOfColors,
      2,
      this.numberOfColors
    );
  }
  #assertValidBitmap(bitmap: DisplayBitmap) {
    this.#assertValidNumberOfColors(bitmap.numberOfColors);
    assertValidBitmapPixels(bitmap);
  }
  async drawBitmap(
    centerX: number,
    centerY: number,
    bitmap: DisplayBitmap,
    sendImmediately?: boolean
  ) {
    this.#assertValidBitmap(bitmap);
    // _console.log("drawBitmap", { centerX, centerY, bitmap, sendImmediately });
    const contextState = structuredClone(this.contextState);
    this.#rearDrawStack.push(() =>
      this.#drawBitmapToCanvas(centerX, centerY, bitmap, contextState)
    );
    if (this.device?.isConnected) {
      await this.device.drawDisplayBitmap(
        centerX,
        centerY,
        bitmap,
        sendImmediately
      );
    }
  }

  async drawSprite(
    centerX: number,
    centerY: number,
    spriteSheetName: string,
    spriteName: string,
    sendImmediately?: boolean
  ) {
    // FILL - check if spritesheet is loaded, then send command
  }

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
    if (this.device?.isConnected) {
      await this.device.setDisplayBrightness(newBrightness, sendImmediately);
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
    centerX: number,
    centerY: number,
    width: number,
    height: number,
    contextState: DisplayContextState
  ) {
    this.#rearDrawStack.push(() => {
      _console.log("setContextTransform", {
        centerX,
        centerY,
        width,
        height,
        contextState,
      });

      this.#save();
      this.#context.translate(centerX, centerY);
      const box = this.#getBoundingBox(
        0,
        0,
        width * contextState.spriteScale,
        height * contextState.spriteScale
      );
      const rotatedBox = this.#rotateBoundingBox(box, contextState.rotation);
      //_console.log("rotatedBox", rotatedBox);
      this.#applyClip(rotatedBox, contextState);
      this.#context.scale(contextState.spriteScale, contextState.spriteScale);
      this.#context.rotate(contextState.rotation);
      // this.#context.beginPath();
      // this.#context.rect(
      //   -width / 2 + crop.left,
      //   -height / 2 + crop.top,
      //   width - crop.left - crop.right,
      //   height - crop.top - crop.bottom
      // );
      // this.#context.clip();

      // Now define the clip in transformed space
      this.#context.beginPath();
      this.#context.rect(
        -width / 2 + contextState.rotationCropLeft / contextState.spriteScale,
        -height / 2 + contextState.rotationCropTop / contextState.spriteScale,
        width -
          contextState.rotationCropLeft / contextState.spriteScale -
          contextState.rotationCropRight / contextState.spriteScale,
        height -
          contextState.rotationCropTop / contextState.spriteScale -
          contextState.rotationCropBottom / contextState.spriteScale
      );
      this.#context.clip();
    });
  }
  #resetCanvasContextTransform() {
    this.#rearDrawStack.push(() => {
      _console.log("reset transform");
      this.#restore();
    });
  }

  _setClearCanvasBoundingBoxOnDraw(clearBoundingBoxOnDraw: boolean) {
    this.#rearDrawStack.push(() => {
      _console.log({ clearBoundingBoxOnDraw });
      this.#clearBoundingBoxOnDraw = clearBoundingBoxOnDraw;
    });
  }

  #useSpriteColorIndices = false;
  _setUseSpriteColorIndices(useSpriteColorIndices: boolean) {
    this.#rearDrawStack.push(() => {
      _console.log({ useSpriteColorIndices });
      this.#useSpriteColorIndices = useSpriteColorIndices;
    });
  }
  #spriteContextStack: DisplayContextState[] = [];
  _saveContextForSprite(
    centerX: number,
    centerY: number,
    sprite: DisplaySprite
  ) {
    const contextState = structuredClone(this.contextState);
    this.#setCanvasContextTransform(
      centerX,
      centerY,
      sprite.width,
      sprite.height,
      contextState
    );

    const spriteColorIndices = contextState.spriteColorIndices.slice();
    this.#spriteContextStack.push(contextState);
    this.#resetContextState();
    this.contextState.spriteColorIndices = spriteColorIndices;
    _console.log("_saveContextForSprite", this.contextState);
  }
  _restoreContextForSprite() {
    this.#resetCanvasContextTransform();

    const contextState = this.#spriteContextStack.pop();
    if (!contextState) {
      _console.warn("#spriteContextStack empty");
      return;
    }
    _console.log("_restoreContextForSprite", contextState);
    this.#contextStateHelper.update(contextState);
  }

  #reset() {
    this.#useSpriteColorIndices = false;
    this.#clearBoundingBoxOnDraw = true;
    this.#resetColors();
    this.#resetOpacities();
    this.#resetContextState();
    this.#resetBrightness();
  }
}
export default DisplayCanvasHelper;
