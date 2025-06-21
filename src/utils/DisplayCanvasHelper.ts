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
import { hexToRGB, rgbToHex } from "./ColorUtils.ts";
import { createConsole } from "./Console.ts";
import DisplayContextStateHelper from "./DisplayContextStateHelper.ts";
import {
  assertValidColor,
  assertValidOpacity,
  assertValidSegmentCap,
  DisplayCropDirection,
  DisplayCropDirections,
  DisplayCropDirectionToCommand,
  DisplayRotationCropDirectionToCommand,
  normalizeRotation,
} from "./DisplayUtils.ts";
import EventDispatcher, {
  BoundEventListeners,
  Event,
  EventListenerMap,
  EventMap,
} from "./EventDispatcher.ts";
import { addEventListeners, removeEventListeners } from "./EventUtils.ts";

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
    assertValidColor(color);

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
    this.context.fillStyle = this.colors[fillColorIndex];
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
    this.context.strokeStyle = this.colors[lineColorIndex];
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
    this.context.lineWidth = lineWidth;
    if (this.device?.isConnected) {
      this.device.setDisplayLineWidth(lineWidth, sendImmediately);
    }
    this.#onDisplayContextStateUpdate(differences);
  }
  setRotation(
    rotation: number,
    isRadians?: boolean,
    sendImmediately?: boolean
  ) {
    rotation = normalizeRotation(rotation, isRadians);
    _console.log({ rotation });

    const differences = this.#displayContextStateHelper.update({
      rotation,
    });
    if (differences.length == 0) {
      return;
    }

    if (this.device?.isConnected) {
      this.device.setDisplayNormalizedRotation(rotation, sendImmediately);
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
    const differences = this.#displayContextStateHelper.update({
      [cropCommand]: crop,
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
    const differences = this.#displayContextStateHelper.update({
      [cropCommand]: crop,
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
  drawRect(
    x: number,
    y: number,
    width: number,
    height: number,
    sendImmediately?: boolean
  ) {
    // FILL
    if (this.device?.isConnected) {
      this.device.drawDisplayRect(x, y, width, height, sendImmediately);
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
