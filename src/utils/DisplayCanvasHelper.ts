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
  normalizeRadians,
  radToDeg,
  Uint16Max,
} from "./MathUtils.ts";

const _console = createConsole("DisplayCanvasHelper", { log: true });

export const DisplayCanvasHelperEventTypes = ["displayContextState"] as const;
export type DisplayCanvasHelperEventType =
  (typeof DisplayCanvasHelperEventTypes)[number];

export interface DisplayCanvasHelperEventMessages {
  displayContextState: {
    displayContextState: DisplayContextState;
    differences: DisplayContextStateKey[];
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

    this.#context = this.#canvas?.getContext("2d")!;
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

  #updateCanvas() {
    if (!this.device?.isConnected) {
      return;
    }
    if (!this.canvas) {
      return;
    }

    const { width, height } = this.device.displayInformation!;
    console.log({ width, height });

    this.canvas.width = width;
    this.canvas.height = height;
  }

  // CONTEXT STACK
  #frontDrawStack: Function[] = [];
  #rearDrawStack: Function[] = [];
  #drawFrontDrawStack() {
    this.#context.clearRect(0, 0, this.width, this.height);

    // FILL - draw background
    this.#frontDrawStack.forEach((callback) => callback());
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
    this.#updateDeviceColors();
    this.#updateDeviceOpacity();
    this.#updateDeviceContextState();
    this.#updateDeviceBrightness();
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
      this.device?.setDisplayColor(
        index,
        color,
        sendImmediately && index == this.colors.length - 1
      );
    });
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
  get displayContextState() {
    return this.#displayContextStateHelper.state;
  }
  get contextState() {
    return this.#displayContextStateHelper.state;
  }
  #onDisplayContextStateUpdate(differences: DisplayContextStateKey[]) {
    this.#dispatchEvent("displayContextState", {
      displayContextState: Object.assign({}, this.displayContextState),
      differences,
    });
  }
  #resetContextState() {
    this.#displayContextStateHelper.reset();
  }
  #updateDeviceContextState() {
    if (!this.device?.isConnected) {
      return;
    }
    _console.log("updateDeviceContextState");
    this.device?.setDisplayContextState(this.contextState);
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
    this.#context.clearRect(0, 0, this.width, this.height);
    if (this.device?.isConnected) {
      this.device.clearDisplay(sendImmediately);
    }
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

    // FILL - redraw

    this.colors[colorIndex] = colorHex;
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
  }
  setOpacity(opacity: number, sendImmediately?: boolean) {
    assertValidOpacity(opacity);
    if (this.device?.isConnected) {
      this.device.setDisplayOpacity(opacity, sendImmediately);
    }
    this.#opacities.fill(opacity);
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

  clearRect(
    x: number,
    y: number,
    width: number,
    height: number,
    sendImmediately?: boolean
  ) {
    // FILL
    if (this.device?.isConnected) {
      this.device.clearDisplayRect(x, y, width, height, sendImmediately);
    }
  }
  #getBoundingBox(
    centerX: number,
    centerY: number,
    width: number,
    height: number
  ) {
    return {
      x: centerX - width / 2,
      y: centerY - height / 2,
    };
  }
  #save() {
    const ctx = this.#context;
    ctx.save();
  }
  #restore() {
    const ctx = this.#context;
    ctx.restore();
  }
  #transformContext(centerX: number, centerY: number, rotation: number) {
    const ctx = this.#context;
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
  #getRectBoundingBox(
    centerX: number,
    centerY: number,
    width: number,
    height: number,
    { lineWidth }: DisplayContextState
  ): DisplayBoundingBox {
    const outerPadding = (lineWidth + 1) / 2;
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
    const ctx = this.#context;
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
    const ctx = this.#context;
    ctx.beginPath();
    ctx.rect(
      -width / 2 + rotationCropLeft,
      -height / 2 + rotationCropTop,
      width / 2 - rotationCropRight,
      height / 2 - rotationCropBottom
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
      this.opacities[colorIndex] * this.#brightnessOpacity
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
    const rotatedBox = this.#rotateBoundingBox(box, contextState.rotation);
    this.#applyClip(rotatedBox, contextState);

    this.#transformContext(centerX, centerY, contextState.rotation);

    this.#applyRotationClip(box, contextState);

    const x = -width / 2;
    const y = -height / 2;
    this.context.fillRect(x, y, width, height);
    if (this.contextState.lineWidth > 0) {
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
    this.#rearDrawStack.push(() =>
      this.#drawRectToCanvas(
        centerX,
        centerY,
        width,
        height,
        Object.assign({}, this.contextState)
      )
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
  drawRoundRect(
    x: number,
    y: number,
    width: number,
    height: number,
    borderRadius: number,
    sendImmediately?: boolean
  ) {
    // FILL
    if (this.device?.isConnected) {
      this.device.drawDisplayRoundRect(
        x,
        y,
        width,
        height,
        borderRadius,
        sendImmediately
      );
    }
  }
  drawCircle(x: number, y: number, radius: number, sendImmediately?: boolean) {
    // FILL
    if (this.device?.isConnected) {
      this.device.drawDisplayCircle(x, y, radius, sendImmediately);
    }
  }
  drawEllipse(
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    sendImmediately?: boolean
  ) {
    // FILL
    if (this.device?.isConnected) {
      this.device.drawDisplayEllipse(x, y, radiusX, radiusY, sendImmediately);
    }
  }
  drawPolygon(
    x: number,
    y: number,
    radius: number,
    numberOfSides: number,
    sendImmediately?: boolean
  ) {
    // FILL
    if (this.device?.isConnected) {
      this.device.drawDisplayPolygon(
        x,
        y,
        radius,
        numberOfSides,
        sendImmediately
      );
    }
  }
  drawSegment(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    sendImmediately?: boolean
  ) {
    // FILL
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
    if (this.device?.isConnected) {
      this.device.setDisplayBrightness(newBrightness, sendImmediately);
    }
  }
  #resetBrightness() {
    this.setBrightness("medium");
  }
  #updateDeviceBrightness() {
    if (!this.device?.isConnected) {
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
