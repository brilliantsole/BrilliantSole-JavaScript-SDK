import Device, {
  BoundDeviceEventListeners,
  DeviceEventMap,
} from "../Device.ts";
import {
  DefaultDisplayContextState,
  DisplayBrightness,
  DisplayColorRGB,
  DisplayContextState,
  DisplayContextStateKey,
  DisplaySegmentCap,
  DisplaySize,
} from "../DisplayManager.ts";
import { hexToRGB, rgbToHex, stringToRGB } from "./ColorUtils.ts";
import { createConsole } from "./Console.ts";
import DisplayContextStateHelper from "./DisplayContextStateHelper.ts";
import {
  assertValidColor,
  assertValidOpacity,
  assertValidSegmentCap,
  DisplayCropDirection,
  DisplayCropDirections,
  DisplayCropDirectionToCommand,
  DisplayCropDirectionToStateKey,
  DisplayRotationCropDirectionToCommand,
  DisplayRotationCropDirectionToStateKey,
  formatRotation,
} from "./DisplayUtils.ts";
import EventDispatcher, {
  BoundEventListeners,
  Event,
  EventListenerMap,
  EventMap,
} from "./EventDispatcher.ts";
import { addEventListeners, removeEventListeners } from "./EventUtils.ts";
import {
  degToRad,
  getVector2Angle,
  getVector2Length,
  multiplyVector2ByScalar,
  normalizedVector2,
  normalizeRadians,
  radToDeg,
  Uint16Max,
  Vector2,
} from "./MathUtils.ts";

const _console = createConsole("DisplayCanvasHelper", { log: false });

export const DisplayCanvasHelperEventTypes = [
  "contextState",
  "numberOfColors",
  "brightness",
  "color",
  "colorOpacity",
  "opacity",
  "resize",
  "update",
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
    color: DisplayColorRGB;
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

    this.#context = this.#canvas?.getContext("2d", {
      willReadFrequently: true,
    })!;
    this.#context.imageSmoothingEnabled = false;
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

    const { width, height } = this.device.displayInformation!;
    _console.log({ width, height });

    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.aspectRatio = `${width / height}`;

    this.#dispatchEvent("resize", { width: this.width, height: this.height });

    this.clearDisplay();
  }

  // CONTEXT STACK
  #frontDrawStack: Function[] = [];
  #rearDrawStack: Function[] = [];
  #drawFrontDrawStack() {
    if (!this.context) {
      return;
    }
    this.#context.clearRect(0, 0, this.width, this.height);

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

    const alphaBoost = 1.5; // >1 = more opaque, try 1.1–1.5 for subtlety

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
    this.#save();
    this.context.fillStyle = this.#colorIndexToRgba(0);
    this.context.fillRect(0, 0, this.width, this.height);
    this.#restore();
  }
  #applyTransparency = false;
  get applyTransparency() {
    return this.#applyTransparency;
  }
  set applyTransparency(newValue) {
    this.#applyTransparency = newValue;
    _console.log({ applyTransparency: this.applyTransparency });
    this.#drawFrontDrawStack();
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
    if (this.device) {
      this.numberOfColors = this.device.numberOfDisplayColors!;
      this.#updateCanvas();
      this.#updateDevice();
    }
  }

  // DEVICE EVENTLISTENERS
  #boundDeviceEventListeners: BoundDeviceEventListeners = {
    connected: this.#onDeviceConnected.bind(this),
    notConnected: this.#onDeviceNotConnected.bind(this),
  };
  #onDeviceConnected(event: DeviceEventMap["connected"]) {
    _console.log("device connected");
    this.#updateCanvas();
    this.#updateDevice();
    // FIX - messages flushed properly?
  }
  #onDeviceNotConnected(event: DeviceEventMap["notConnected"]) {
    _console.log("device not connected");
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
    _console.log({ numberOfColors: this.numberOfColors });

    this.#colors = new Array(this.numberOfColors).fill("#000000");
    this.#opacities = new Array(this.numberOfColors).fill(1);

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
  #updateDeviceColors(sendImmediately?: boolean) {
    if (!this.device?.isConnected) {
      return;
    }
    this.colors.forEach((color, index) => {
      this.device?.setDisplayColor(index, color, sendImmediately);
    });
    if (sendImmediately) {
      this.#device?.flushDisplayContextCommands();
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

  #updateDeviceOpacity(sendImmediately?: boolean) {
    if (!this.device?.isConnected) {
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
  #displayContextStateHelper = new DisplayContextStateHelper();
  get contextState() {
    return this.#displayContextStateHelper.state;
  }
  #onDisplayContextStateUpdate(differences: DisplayContextStateKey[]) {
    this.#dispatchEvent("contextState", {
      contextState: { ...this.contextState },
      differences,
    });
  }
  #resetContextState() {
    this.#displayContextStateHelper.reset();
  }
  #updateDeviceContextState(sendImmediately?: boolean) {
    if (!this.device?.isConnected) {
      return;
    }
    _console.log("updateDeviceContextState");
    this.device?.setDisplayContextState(this.contextState, sendImmediately);
  }

  showDisplay(sendImmediately = true) {
    _console.log("showDisplay");

    this.#frontDrawStack = this.#rearDrawStack.slice();
    this.#rearDrawStack.length = 0;

    this.#drawFrontDrawStack();

    if (this.device?.isConnected) {
      this.device.showDisplay(sendImmediately);
    }
  }
  clearDisplay(sendImmediately = true) {
    _console.log("clearDisplay");
    this.showDisplay();
    this.#context.clearRect(0, 0, this.width, this.height);
    if (this.device?.isConnected) {
      this.device.clearDisplay(sendImmediately);
    }
    this.#drawBackground();
  }

  setColor(
    colorIndex: number,
    color: DisplayColorRGB | string,
    sendImmediately?: boolean
  ) {
    if (typeof color == "string") {
      color = stringToRGB(color);
    }
    const colorHex = rgbToHex(color);
    if (this.colors[colorIndex] == colorHex) {
      _console.log(`redundant color #${colorIndex} ${colorHex}`);
      return;
    }

    _console.log(`setting color #${colorIndex}`, color);
    this.#assertValidColorIndex(colorIndex);
    assertValidColor(color);

    if (this.device?.isConnected) {
      this.device.setDisplayColor(colorIndex, color, sendImmediately);
    }

    this.colors[colorIndex] = colorHex;
    this.#drawFrontDrawStack();
    this.#dispatchEvent("color", { colorIndex, colorHex, color });
  }

  setColorOpacity(
    colorIndex: number,
    opacity: number,
    sendImmediately?: boolean
  ) {
    this.#assertValidColorIndex(colorIndex);
    assertValidOpacity(opacity);
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
    this.#drawFrontDrawStack();
    this.#dispatchEvent("colorOpacity", { colorIndex, opacity });
  }
  setOpacity(opacity: number, sendImmediately?: boolean) {
    assertValidOpacity(opacity);
    if (this.device?.isConnected) {
      this.device.setDisplayOpacity(opacity, sendImmediately);
    }
    this.#opacities.fill(opacity);
    this.#drawFrontDrawStack();
    this.#dispatchEvent("opacity", { opacity });
  }

  // CONTEXT COMMANDS
  selectFillColor(fillColorIndex: number, sendImmediately?: boolean) {
    this.#assertValidColorIndex(fillColorIndex);
    const differences = this.#displayContextStateHelper.update({
      fillColorIndex,
    });
    if (differences.length == 0) {
      return;
    }
    if (this.device?.isConnected) {
      this.device.selectDisplayFillColor(fillColorIndex, sendImmediately);
    }
    this.#onDisplayContextStateUpdate(differences);
  }
  selectLineColor(lineColorIndex: number, sendImmediately?: boolean) {
    this.#assertValidColorIndex(lineColorIndex);
    const differences = this.#displayContextStateHelper.update({
      lineColorIndex,
    });
    if (differences.length == 0) {
      return;
    }
    if (this.device?.isConnected) {
      this.device.selectDisplayLineColor(lineColorIndex, sendImmediately);
    }
    this.#onDisplayContextStateUpdate(differences);
  }
  #assertValidLineWidth(lineWidth: number) {
    _console.assertRangeWithError("lineWidth", lineWidth, 0, this.width);
  }
  setLineWidth(lineWidth: number, sendImmediately?: boolean) {
    this.#assertValidLineWidth(lineWidth);
    const differences = this.#displayContextStateHelper.update({
      lineWidth,
    });
    if (differences.length == 0) {
      return;
    }
    if (this.device?.isConnected) {
      this.device.setDisplayLineWidth(lineWidth, sendImmediately);
    }
    this.#onDisplayContextStateUpdate(differences);
  }
  setRotation(rotation: number, isRadians: boolean, sendImmediately?: boolean) {
    rotation = isRadians ? rotation : degToRad(rotation);
    rotation = normalizeRadians(rotation);
    _console.log({ rotation });

    const differences = this.#displayContextStateHelper.update({
      rotation,
    });
    if (differences.length == 0) {
      return;
    }

    if (this.device?.isConnected) {
      this.device.setDisplayRotation(rotation, true, sendImmediately);
    }

    this.#onDisplayContextStateUpdate(differences);
  }
  clearRotation(sendImmediately?: boolean) {
    const differences = this.#displayContextStateHelper.update({
      rotation: 0,
    });
    if (differences.length == 0) {
      return;
    }
    if (this.device?.isConnected) {
      this.device.clearDisplayRotation(sendImmediately);
    }
    this.#onDisplayContextStateUpdate(differences);
  }
  setSegmentStartCap(
    segmentStartCap: DisplaySegmentCap,
    sendImmediately?: boolean
  ) {
    assertValidSegmentCap(segmentStartCap);
    const differences = this.#displayContextStateHelper.update({
      segmentStartCap,
    });
    if (differences.length == 0) {
      return;
    }
    _console.log({ segmentStartCap });
    if (this.device?.isConnected) {
      this.device.setDisplaySegmentStartCap(segmentStartCap, sendImmediately);
    }
    this.#onDisplayContextStateUpdate(differences);
  }
  setSegmentEndCap(
    segmentEndCap: DisplaySegmentCap,
    sendImmediately?: boolean
  ) {
    assertValidSegmentCap(segmentEndCap);
    const differences = this.#displayContextStateHelper.update({
      segmentEndCap,
    });
    if (differences.length == 0) {
      return;
    }
    _console.log({ segmentEndCap });
    if (this.device?.isConnected) {
      this.device.setDisplaySegmentEndCap(segmentEndCap, sendImmediately);
    }
    this.#onDisplayContextStateUpdate(differences);
  }
  setSegmentCap(segmentCap: DisplaySegmentCap, sendImmediately?: boolean) {
    assertValidSegmentCap(segmentCap);
    const differences = this.#displayContextStateHelper.update({
      segmentStartCap: segmentCap,
      segmentEndCap: segmentCap,
    });
    if (differences.length == 0) {
      return;
    }
    _console.log({ segmentCap });
    if (this.device?.isConnected) {
      this.device.setDisplaySegmentCap(segmentCap, sendImmediately);
    }
    this.#onDisplayContextStateUpdate(differences);
  }
  setSegmentStartRadius(segmentStartRadius: number, sendImmediately?: boolean) {
    const differences = this.#displayContextStateHelper.update({
      segmentStartRadius,
    });
    if (differences.length == 0) {
      return;
    }
    _console.log({ segmentStartRadius });
    if (this.device?.isConnected) {
      this.device.setDisplaySegmentStartRadius(
        segmentStartRadius,
        sendImmediately
      );
    }
    this.#onDisplayContextStateUpdate(differences);
  }
  setSegmentEndRadius(segmentEndRadius: number, sendImmediately?: boolean) {
    const differences = this.#displayContextStateHelper.update({
      segmentEndRadius,
    });
    if (differences.length == 0) {
      return;
    }
    _console.log({ segmentEndRadius });
    if (this.device?.isConnected) {
      this.device.setDisplaySegmentEndRadius(segmentEndRadius, sendImmediately);
    }
    this.#onDisplayContextStateUpdate(differences);
  }
  setSegmentRadius(segmentRadius: number, sendImmediately?: boolean) {
    const differences = this.#displayContextStateHelper.update({
      segmentStartRadius: segmentRadius,
      segmentEndRadius: segmentRadius,
    });
    if (differences.length == 0) {
      return;
    }
    _console.log({ segmentRadius });
    if (this.device?.isConnected) {
      this.device.setDisplaySegmentRadius(segmentRadius, sendImmediately);
    }
    this.#onDisplayContextStateUpdate(differences);
  }
  setCrop(
    cropDirection: DisplayCropDirection,
    crop: number,
    sendImmediately?: boolean
  ) {
    _console.assertEnumWithError(cropDirection, DisplayCropDirections);
    crop = Math.max(0, crop);
    const cropCommand = DisplayCropDirectionToCommand[cropDirection];
    const cropKey = DisplayCropDirectionToStateKey[cropDirection];
    const differences = this.#displayContextStateHelper.update({
      [cropKey]: crop,
    });
    if (differences.length == 0) {
      return;
    }
    _console.log({ [cropCommand]: crop });
    if (this.device?.isConnected) {
      this.device.setDisplayCrop(cropDirection, crop, sendImmediately);
    }
    this.#onDisplayContextStateUpdate(differences);
  }
  setCropTop(cropTop: number, sendImmediately?: boolean) {
    this.setCrop("top", cropTop, sendImmediately);
  }
  setCropRight(cropRight: number, sendImmediately?: boolean) {
    this.setCrop("right", cropRight, sendImmediately);
  }
  setCropBottom(cropBottom: number, sendImmediately?: boolean) {
    this.setCrop("bottom", cropBottom, sendImmediately);
  }
  setCropLeft(cropLeft: number, sendImmediately?: boolean) {
    this.setCrop("left", cropLeft, sendImmediately);
  }
  clearCrop(sendImmediately?: boolean) {
    const differences = this.#displayContextStateHelper.update({
      cropTop: 0,
      cropRight: 0,
      cropBottom: 0,
      cropLeft: 0,
    });
    if (differences.length == 0) {
      return;
    }
    if (this.device?.isConnected) {
      this.device.clearDisplayCrop(sendImmediately);
    }
    this.#onDisplayContextStateUpdate(differences);
  }

  setRotationCrop(
    cropDirection: DisplayCropDirection,
    crop: number,
    sendImmediately?: boolean
  ) {
    _console.assertEnumWithError(cropDirection, DisplayCropDirections);
    const cropCommand = DisplayRotationCropDirectionToCommand[cropDirection];
    const cropKey = DisplayRotationCropDirectionToStateKey[cropDirection];
    const differences = this.#displayContextStateHelper.update({
      [cropKey]: crop,
    });
    if (differences.length == 0) {
      return;
    }
    _console.log({ [cropCommand]: crop });
    if (this.device?.isConnected) {
      this.device.setDisplayRotationCrop(cropDirection, crop, sendImmediately);
    }
    this.#onDisplayContextStateUpdate(differences);
  }
  setRotationCropTop(rotationCropTop: number, sendImmediately?: boolean) {
    this.setRotationCrop("top", rotationCropTop, sendImmediately);
  }
  setRotationCropRight(rotationCropRight: number, sendImmediately?: boolean) {
    this.setRotationCrop("right", rotationCropRight, sendImmediately);
  }
  setRotationCropBottom(rotationCropBottom: number, sendImmediately?: boolean) {
    this.setRotationCrop("bottom", rotationCropBottom, sendImmediately);
  }
  setRotationCropLeft(rotationCropLeft: number, sendImmediately?: boolean) {
    this.setRotationCrop("left", rotationCropLeft, sendImmediately);
  }
  clearRotationCrop(sendImmediately?: boolean) {
    const differences = this.#displayContextStateHelper.update({
      rotationCropTop: 0,
      rotationCropRight: 0,
      rotationCropBottom: 0,
      rotationCropLeft: 0,
    });
    if (differences.length == 0) {
      return;
    }
    if (this.device?.isConnected) {
      this.device.clearDisplayRotationCrop(sendImmediately);
    }
    this.#onDisplayContextStateUpdate(differences);
  }

  #clearRectToCanvas(x: number, y: number, width: number, height: number) {
    this.#save();
    this.context.resetTransform();
    this.context.fillStyle = this.#colorIndexToRgba(0);
    this.context.fillRect(x, y, width, height);
    this.#restore();
  }
  clearRect(
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
      this.device.clearDisplayRect(x, y, width, height, sendImmediately);
    }
  }
  #save() {
    const ctx = this.context;
    ctx.save();
  }
  #restore() {
    const ctx = this.context;
    ctx.restore();
  }
  #transformContext(centerX: number, centerY: number, rotation: number) {
    const ctx = this.context;
    ctx.translate(centerX, centerY);
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
  #clearBoundingBox({ x, y, width, height }: DisplayBoundingBox) {
    this.#clearRectToCanvas(x, y, width, height);
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
  #hexToRgba(hex: string, opacity: number) {
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

    return `rgb(${dr}, ${dg}, ${db})`;
  }
  #colorIndexToRgba(colorIndex: number) {
    return this.#hexToRgba(
      this.colors[colorIndex],
      1 || this.opacities[colorIndex] * this.#brightnessOpacity
    );
  }
  #updateContext({
    lineWidth,
    fillColorIndex,
    lineColorIndex,
  }: DisplayContextState) {
    this.context.fillStyle = this.#colorIndexToRgba(fillColorIndex);
    this.context.strokeStyle = this.#colorIndexToRgba(lineColorIndex);
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
    if (this.#clearBoundingBoxOnDraw) {
      this.#clearBoundingBox(box);
    }
    const rotatedBox = this.#rotateBoundingBox(box, contextState.rotation);
    this.#applyClip(rotatedBox, contextState);

    this.#transformContext(centerX, centerY, contextState.rotation);

    this.#applyRotationClip(box, contextState);

    const x = -width / 2;
    const y = -height / 2;
    this.context.fillRect(x, y, width, height);
    if (contextState.lineWidth > 0) {
      this.context.strokeRect(x, y, width, height);
    }
    this.#restore();
  }
  drawRect(
    centerX: number,
    centerY: number,
    width: number,
    height: number,
    sendImmediately?: boolean
  ) {
    const contextState = { ...this.contextState };
    this.#rearDrawStack.push(() =>
      this.#drawRectToCanvas(centerX, centerY, width, height, contextState)
    );

    if (this.device?.isConnected) {
      this.device.drawDisplayRect(
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
    if (this.#clearBoundingBoxOnDraw) {
      this.#clearBoundingBox(box);
    }
    const rotatedBox = this.#rotateBoundingBox(box, contextState.rotation);
    this.#applyClip(rotatedBox, contextState);

    this.#transformContext(centerX, centerY, contextState.rotation);

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
  drawRoundRect(
    centerX: number,
    centerY: number,
    width: number,
    height: number,
    borderRadius: number,
    sendImmediately?: boolean
  ) {
    const contextState = { ...this.contextState };
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
      this.device.drawDisplayRoundRect(
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
    if (this.#clearBoundingBoxOnDraw) {
      this.#clearBoundingBox(box);
    }
    this.#applyClip(box, contextState);

    this.#transformContext(centerX, centerY, contextState.rotation);

    this.#applyRotationClip(box, contextState);

    this.context.beginPath();
    this.context.arc(0, 0, radius, 0, 2 * Math.PI);
    this.context.fill();
    if (contextState.lineWidth) {
      this.context.stroke();
    }
    this.#restore();
  }
  drawCircle(
    centerX: number,
    centerY: number,
    radius: number,
    sendImmediately?: boolean
  ) {
    const contextState = { ...this.contextState };
    this.#rearDrawStack.push(() =>
      this.#drawCircleToCanvas(centerX, centerY, radius, contextState)
    );
    if (this.device?.isConnected) {
      this.device.drawDisplayCircle(centerX, centerY, radius, sendImmediately);
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
    if (this.#clearBoundingBoxOnDraw) {
      this.#clearBoundingBox(box);
    }

    const rotatedBox = this.#rotateBoundingBox(box, contextState.rotation);
    this.#applyClip(rotatedBox, contextState);

    this.#transformContext(centerX, centerY, contextState.rotation);

    this.#applyRotationClip(box, contextState);

    this.context.beginPath();
    this.context.ellipse(0, 0, radiusX, radiusY, 0, 0, 2 * Math.PI);
    this.context.fill();
    if (contextState.lineWidth > 0) {
      this.context.stroke();
    }
    this.#restore();
  }
  drawEllipse(
    centerX: number,
    centerY: number,
    radiusX: number,
    radiusY: number,
    sendImmediately?: boolean
  ) {
    const contextState = { ...this.contextState };
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
      this.device.drawDisplayEllipse(
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
    if (this.#clearBoundingBoxOnDraw) {
      this.#clearBoundingBox(box);
    }

    this.#applyClip(box, contextState);

    this.#transformContext(centerX, centerY, contextState.rotation);

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
  drawPolygon(
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
    const contextState = { ...this.contextState };
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
      this.device.drawDisplayPolygon(
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
    _console.log({ segmentStartFullRadius, segmentEndFullRadius });

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

    _console.log("segmentBounds", { minX, minY, maxX, maxY });

    const boundingBox = {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
    _console.log("getSegmentBoundingBox", boundingBox);
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
    const vector: Vector2 = {
      x: endX - startX,
      y: endY - startY,
    };
    let rotation = getVector2Angle(vector);
    rotation -= Math.PI / 2;
    _console.log({ segmentRotation: rotation });
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
    this.context.resetTransform();
  }
  #drawSegmentToCanvas(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    contextState: DisplayContextState
  ) {
    this.#updateContext(contextState);

    _console.log("drawSegmentToCanvas", { startX, startY, endX, endY });

    this.#save();
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
    if (len === 0) return;

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

    // Fill the full trapezoid
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
  drawSegment(
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
    const contextState = { ...this.contextState };
    this.#rearDrawStack.push(() =>
      this.#drawSegmentToCanvas(startX, startY, endX, endY, contextState)
    );
    if (this.device?.isConnected) {
      this.device.drawDisplaySegment(
        startX,
        startY,
        endX,
        endY,
        sendImmediately
      );
    }
  }
  #drawSegmentsToCanvas(
    segments: Vector2[],
    contextState: DisplayContextState
  ) {
    this.#updateContext(contextState);

    _console.log("drawSegmentsToCanvas", { segments });

    segments.forEach((segment, index) => {
      if (index > 0) {
        const previousSegment = segments[index - 1];
        this.#drawSegmentToCanvas(
          previousSegment.x,
          previousSegment.y,
          segment.x,
          segment.y,
          contextState
        );
      }
    });
  }
  drawSegments(segments: Vector2[], sendImmediately?: boolean) {
    _console.assertRangeWithError("segmentsLength", segments.length, 2, 255);
    _console.log({ segments });
    const contextState = { ...this.contextState };
    this.#rearDrawStack.push(() =>
      this.#drawSegmentsToCanvas(segments, contextState)
    );
    if (this.device?.isConnected) {
      this.device.drawDisplaySegments(segments, sendImmediately);
    }
  }

  // FILL - sprites

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
  setBrightness(newBrightness: DisplayBrightness, sendImmediately?: boolean) {
    if (this.#brightness == newBrightness) {
      _console.log(`redundant brightness ${newBrightness}`);
      return;
    }
    this.#brightness = newBrightness;
    _console.log({ brightness: this.brightness });
    if (this.device?.isConnected) {
      this.device.setDisplayBrightness(newBrightness, sendImmediately);
    }
    this.#drawFrontDrawStack();
    this.#dispatchEvent("brightness", { brightness: this.brightness });
  }
  #resetBrightness() {
    this.setBrightness("medium");
  }
  #updateDeviceBrightness(sendImmediately?: boolean) {
    if (!this.device?.isConnected) {
      return;
    }
    _console.log("updateDeviceBrightness");
    this.device?.setDisplayBrightness(this.brightness, sendImmediately);
  }

  #reset() {
    this.#resetColors();
    this.#resetOpacities();
    this.#resetContextState();
    this.#resetBrightness();
  }
}
export default DisplayCanvasHelper;
