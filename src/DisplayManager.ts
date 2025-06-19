import Device, { SendMessageCallback } from "./Device.ts";
import {
  concatenateArrayBuffers,
  UInt8ByteBuffer,
} from "./utils/ArrayBufferUtils.ts";
import { createConsole } from "./utils/Console.ts";
import EventDispatcher from "./utils/EventDispatcher.ts";
import autoBind from "auto-bind";
import { clamp, Uint16Max } from "./utils/MathUtils.ts";
import { hexToRGB } from "./utils/ColorUtils.ts";

const _console = createConsole("DisplayManager", { log: true });

export const DisplayCommands = ["sleep", "wake"] as const;
export type DisplayCommand = (typeof DisplayCommands)[number];

export const DisplayStatuses = ["awake", "asleep"] as const;
export type DisplayStatus = (typeof DisplayStatuses)[number];

export const DisplayInformationTypes = [
  "type",
  "width",
  "height",
  "pixelDepth",
] as const;
export type DisplayInformationType = (typeof DisplayInformationTypes)[number];

export const DisplayTypes = [
  "none",
  "monocularLeft",
  "monocularRight",
  "binocular",
] as const;
export type DisplayType = (typeof DisplayTypes)[number];

export const DisplayPixelDepths = ["1", "2", "4"] as const;
export type DisplayPixelDepth = (typeof DisplayPixelDepths)[number];

export const DisplayBrightnesses = [
  "veryLow",
  "low",
  "medium",
  "high",
  "veryHigh",
] as const;
export type DisplayBrightness = (typeof DisplayBrightnesses)[number];

export const DisplayMessageTypes = [
  "isDisplayAvailable",
  "displayStatus",
  "displayInformation",
  "displayCommand",
  "getDisplayBrightness",
  "setDisplayBrightness",
  "displayContextCommands",
] as const;
export type DisplayMessageType = (typeof DisplayMessageTypes)[number];

export const DisplaySegmentCaps = ["flat", "round"] as const;
export type DisplaySegmentCap = (typeof DisplaySegmentCaps)[number];

export type DisplaySize = {
  width: number;
  height: number;
};
export type DisplayInformation = {
  type: DisplayType;
  width: number;
  height: number;
  pixelDepth: DisplayPixelDepth;
};

export type DisplayColorRGB = {
  r: number;
  g: number;
  b: number;
};
export type DisplayColorYCbCr = {
  y: number;
  cb: number;
  cr: number;
};

export const DisplayInformationValues = {
  type: DisplayTypes,
  pixelDepth: DisplayPixelDepths,
};

export const DisplayContextCommands = [
  "show",
  "clear",

  "setColor",
  "setColorOpacity",
  "setOpacity",

  "saveContext",
  "restoreContext",

  "selectFillColor",
  "selectLineColor",
  "setLineWidth",
  "setRotation",

  "setSegmentStartCap",
  "setSegmentEndCap",
  "setSegmentCap",

  "setSegmentStartRadius",
  "setSegmentEndRadius",
  "setSegmentRadius",

  "setCropTop",
  "setCropRight",
  "setCropBottom",
  "setCropLeft",

  "setRotationCropTop",
  "setRotationCropRight",
  "setRotationCropBottom",
  "setRotationCropLeft",

  "clearRect",

  "drawRect",
  "drawRoundRect",
  "drawCircle",
  "drawEllipse",
  "drawPolygon",
  "drawSegment",

  "selectSpriteSheet",
  "sprite",

  "selectFont",
  "drawText",
] as const;
export type DisplayContextCommand = (typeof DisplayContextCommands)[number];

export const RequiredDisplayMessageTypes: DisplayMessageType[] = [
  "isDisplayAvailable",
  "displayInformation",
  "displayStatus",
  "getDisplayBrightness",
] as const;

export const DisplayEventTypes = [...DisplayMessageTypes] as const;
export type DisplayEventType = (typeof DisplayEventTypes)[number];

export interface DisplayEventMessages {
  isDisplayAvailable: { isDisplayAvailable: boolean };
  displayStatus: {
    displayStatus: DisplayStatus;
    previousDisplayStatus: DisplayStatus;
  };
  displayInformation: {
    displayInformation: DisplayInformation;
  };
  getDisplayBrightness: {
    displayBrightness: DisplayBrightness;
  };
}

export type DisplayEventDispatcher = EventDispatcher<
  Device,
  DisplayEventType,
  DisplayEventMessages
>;
export type SendDisplayMessageCallback =
  SendMessageCallback<DisplayMessageType>;

class DisplayManager {
  constructor() {
    autoBind(this);
  }

  sendMessage!: SendDisplayMessageCallback;

  eventDispatcher!: DisplayEventDispatcher;
  get #dispatchEvent() {
    return this.eventDispatcher.dispatchEvent;
  }
  get waitForEvent() {
    return this.eventDispatcher.waitForEvent;
  }

  requestRequiredInformation() {
    _console.log("requesting required display information");
    const messages = RequiredDisplayMessageTypes.map((messageType) => ({
      type: messageType,
    }));
    this.sendMessage(messages, false);
  }

  // IS DISPLAY AVAILABLE
  #isDisplayAvailable = false;
  get isDisplayAvailable() {
    return this.#isDisplayAvailable;
  }

  #assertDisplayIsAvailable() {
    _console.assertWithError(
      this.#isDisplayAvailable,
      "display is not available"
    );
  }

  #parseIsDisplayAvailable(dataView: DataView) {
    const newIsDisplayAvailable = dataView.getUint8(0) == 1;
    this.#isDisplayAvailable = newIsDisplayAvailable;
    _console.log({ isDisplayAvailable: this.#isDisplayAvailable });
    this.#dispatchEvent("isDisplayAvailable", {
      isDisplayAvailable: this.#isDisplayAvailable,
    });
  }

  // DISPLAY STATUS
  #displayStatus!: DisplayStatus;
  get displayStatus() {
    return this.#displayStatus;
  }
  get isDisplayAwake() {
    return this.#displayStatus == "awake";
  }
  #parseDisplayStatus(dataView: DataView) {
    const displayStatusIndex = dataView.getUint8(0);
    const newDisplayStatus = DisplayStatuses[displayStatusIndex];
    this.#updateDisplayStatus(newDisplayStatus);
  }
  #updateDisplayStatus(newDisplayStatus: DisplayStatus) {
    _console.assertEnumWithError(newDisplayStatus, DisplayStatuses);
    if (newDisplayStatus == this.#displayStatus) {
      _console.log(`redundant displayStatus ${newDisplayStatus}`);
      return;
    }
    const previousDisplayStatus = this.#displayStatus;
    this.#displayStatus = newDisplayStatus;
    _console.log(`updated displayStatus to "${this.displayStatus}"`);
    this.#dispatchEvent("displayStatus", {
      displayStatus: this.displayStatus,
      previousDisplayStatus,
    });
  }

  // DISPLAY COMMAND
  async #sendDisplayCommand(
    command: DisplayCommand,
    sendImmediately?: boolean
  ) {
    _console.assertEnumWithError(command, DisplayCommands);
    _console.log(`sending display command "${command}"`);

    const promise = this.waitForEvent("displayStatus");
    _console.log(`setting command "${command}"`);
    const commandEnum = DisplayCommands.indexOf(command);

    this.sendMessage(
      [
        {
          type: "displayCommand",
          data: UInt8ByteBuffer(commandEnum),
        },
      ],
      sendImmediately
    );

    await promise;
  }
  #assertIsAwake() {
    _console.assertWithError(
      this.#displayStatus == "awake",
      `display is not awake - currently ${this.#displayStatus}`
    );
  }
  #assertIsNotAwake() {
    _console.assertWithError(
      this.#displayStatus != "awake",
      `display is awake`
    );
  }

  async wake() {
    this.#assertIsNotAwake();
    await this.#sendDisplayCommand("wake");
  }
  async sleep() {
    this.#assertIsAwake();
    await this.#sendDisplayCommand("sleep");
  }
  async toggle() {
    switch (this.displayStatus) {
      case "asleep":
        this.wake();
        break;
      case "awake":
        this.sleep();
        break;
    }
  }

  get numberOfColors() {
    return 2 ** Number(this.pixelDepth!);
  }

  // INFORMATION
  #displayInformation?: DisplayInformation;
  get displayInformation() {
    return this.#displayInformation;
  }

  get pixelDepth() {
    return this.#displayInformation?.pixelDepth!;
  }
  get width() {
    return this.#displayInformation?.width!;
  }
  get height() {
    return this.#displayInformation?.width!;
  }
  get size() {
    return {
      width: this.width!,
      height: this.height!,
    };
  }
  get type() {
    return this.#displayInformation?.type!;
  }

  #parseDisplayInformation(dataView: DataView) {
    // @ts-expect-error
    const parsedDisplayInformation: DisplayInformation = {};

    let byteOffset = 0;
    while (byteOffset < dataView.byteLength) {
      const displayInformationTypeIndex = dataView.getUint8(byteOffset++);
      const displayInformationType =
        DisplayInformationTypes[displayInformationTypeIndex];
      _console.assertWithError(
        displayInformationType,
        `invalid displayInformationTypeIndex ${displayInformationType}`
      );
      _console.log({ displayInformationType });

      switch (displayInformationType) {
        case "width":
        case "height":
          {
            const value = dataView.getUint16(byteOffset, true);
            parsedDisplayInformation[displayInformationType] = value;
            byteOffset += 2;
          }
          break;
        case "pixelDepth":
        case "type":
          {
            const values = DisplayInformationValues[displayInformationType];
            let rawValue = dataView.getUint8(byteOffset++);
            const value = values[rawValue];
            _console.assertEnumWithError(value, values);
            // @ts-expect-error
            parsedDisplayInformation[displayInformationType] = value;
          }
          break;
      }
    }

    _console.log({ parsedDisplayInformation });
    const missingDisplayInformationType = DisplayInformationTypes.find(
      (type) => !(type in parsedDisplayInformation)
    );
    _console.assertWithError(
      !missingDisplayInformationType,
      `missingDisplayInformationType ${missingDisplayInformationType}`
    );
    this.#displayInformation = parsedDisplayInformation;
    this.#dispatchEvent("displayInformation", {
      displayInformation: this.#displayInformation,
    });
  }

  // DISPLAY BRIGHTNESS
  #displayBrightness!: DisplayBrightness;
  get displayBrightness() {
    return this.#displayBrightness;
  }

  #parseDisplayBrightness(dataView: DataView) {
    const newDisplayBrightnessEnum = dataView.getUint8(0);
    const newDisplayBrightness = DisplayBrightnesses[newDisplayBrightnessEnum];
    this.#assertValidDisplayBrightness(newDisplayBrightness);

    this.#displayBrightness = newDisplayBrightness;
    _console.log({ displayBrightness: this.#displayBrightness });
    this.#dispatchEvent("getDisplayBrightness", {
      displayBrightness: this.#displayBrightness,
    });
  }

  #assertValidDisplayBrightness(displayBrightness: DisplayBrightness) {
    _console.assertEnumWithError(displayBrightness, DisplayBrightnesses);
  }

  async setDisplayBrightness(newDisplayBrightness: DisplayBrightness) {
    this.#assertDisplayIsAvailable();
    this.#assertValidDisplayBrightness(newDisplayBrightness);
    const newDisplayBrightnessEnum =
      DisplayBrightnesses.indexOf(newDisplayBrightness);
    const newDisplayBrightnessData = UInt8ByteBuffer(newDisplayBrightnessEnum);

    const promise = this.waitForEvent("getDisplayBrightness");
    this.sendMessage([
      { type: "setDisplayBrightness", data: newDisplayBrightnessData },
    ]);
    await promise;
  }

  // DISPLAY CONTEXT
  #assertValidDisplayContextCommand(
    displayContextCommand: DisplayContextCommand
  ) {
    _console.assertEnumWithError(displayContextCommand, DisplayContextCommands);
  }

  #displayContextCommandBuffers: ArrayBuffer[] = [];
  async #sendDisplayContextCommand(
    displayContextCommand: DisplayContextCommand,
    arrayBuffer?: ArrayBuffer,
    sendImmediately: boolean = false
  ) {
    this.#assertValidDisplayContextCommand(displayContextCommand);
    const displayContextCommandEnum = DisplayContextCommands.indexOf(
      displayContextCommand
    );
    const _arrayBuffer = concatenateArrayBuffers(
      displayContextCommandEnum,
      arrayBuffer
    );
    const newLength = this.#displayContextCommandBuffers.reduce(
      (sum, buffer) => sum + buffer.byteLength,
      _arrayBuffer.byteLength
    );
    if (newLength > this.mtu - 6) {
      _console.log("displayContextCommandBuffers too full - sending now");
      await this.#sendDisplayContextCommands();
    }
    this.#displayContextCommandBuffers.push(_arrayBuffer);
    if (sendImmediately) {
      await this.#sendDisplayContextCommands();
    }
  }
  async #sendDisplayContextCommands() {
    _console.log(
      `sending displayContextCommands`,
      this.#displayContextCommandBuffers
    );
    const data = concatenateArrayBuffers(this.#displayContextCommandBuffers);
    await this.sendMessage([{ type: "displayContextCommands", data }], true);
    this.#displayContextCommandBuffers.length = 0;
  }
  showDisplay(sendImmediately = true) {
    this.#sendDisplayContextCommand("show", undefined, sendImmediately);
  }
  clearDisplay(sendImmediately = true) {
    this.#sendDisplayContextCommand("clear", undefined, sendImmediately);
  }

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
  setColor(
    colorIndex: number,
    color: DisplayColorRGB | string,
    sendImmediately: boolean
  ) {
    if (typeof color == "string") {
      color = hexToRGB(color);
    }
    _console.log(`setting color #${colorIndex}`, color);
    this.#assertValidColorIndex(colorIndex);
    this.#assertValidColor(color);
    const dataView = new DataView(new ArrayBuffer(4));
    dataView.setUint8(0, colorIndex);
    dataView.setUint8(1, color.r);
    dataView.setUint8(2, color.g);
    dataView.setUint8(3, color.b);
    this.#sendDisplayContextCommand(
      "setColor",
      dataView.buffer,
      sendImmediately
    );
  }
  #assertValidOpacity(value: number) {
    _console.assertRangeWithError("opacity", value, 0, 1);
  }
  setColorOpacity(index: number, opacity: number, sendImmediately: boolean) {
    this.#assertValidColorIndex(index);
    this.#assertValidOpacity(opacity);
    const dataView = new DataView(new ArrayBuffer(2));
    dataView.setUint8(0, index);
    dataView.setUint8(1, opacity * 255);
    this.#sendDisplayContextCommand(
      "setColorOpacity",
      dataView.buffer,
      sendImmediately
    );
  }
  setOpacity(opacity: number, sendImmediately: boolean) {
    this.#assertValidOpacity(opacity);
    this.#sendDisplayContextCommand(
      "setOpacity",
      UInt8ByteBuffer(Math.round(opacity * 255)),
      sendImmediately
    );
  }

  saveContext(sendImmediately: boolean) {
    this.#sendDisplayContextCommand("saveContext", undefined, sendImmediately);
  }
  restoreContext(sendImmediately: boolean) {
    this.#sendDisplayContextCommand(
      "restoreContext",
      undefined,
      sendImmediately
    );
  }

  selectFillColor(colorIndex: number, sendImmediately: boolean) {
    this.#assertValidColorIndex(colorIndex);
    this.#sendDisplayContextCommand(
      "selectFillColor",
      UInt8ByteBuffer(colorIndex),
      sendImmediately
    );
  }
  selectLineColor(colorIndex: number, sendImmediately: boolean) {
    this.#assertValidColorIndex(colorIndex);
    this.#sendDisplayContextCommand(
      "selectLineColor",
      UInt8ByteBuffer(colorIndex),
      sendImmediately
    );
  }
  #assertValidLineWidth(lineWidth: number) {
    _console.assertRangeWithError("lineWidth", lineWidth, 0, this.width);
  }
  setLineWidth(lineWidth: number, sendImmediately: boolean) {
    this.#assertValidLineWidth(lineWidth);
    const dataView = new DataView(new ArrayBuffer(2));
    dataView.setUint16(0, lineWidth, true);
    this.#sendDisplayContextCommand(
      "setLineWidth",
      dataView.buffer,
      sendImmediately
    );
  }
  setRotation(rotation: number, isRadians: boolean, sendImmediately: boolean) {
    const dataView = new DataView(new ArrayBuffer(2));
    if (isRadians) {
      const rotationRad = rotation;
      _console.log({ rotationRad });
      rotation %= 2 * Math.PI;
      rotation /= 2 * Math.PI;
    } else {
      const rotationDeg = rotation;
      _console.log({ rotationDeg });
      rotation %= 360;
      rotation /= 360;
    }
    rotation *= Uint16Max;
    _console.log({ rotation });
    dataView.setUint16(0, rotation, true);
    this.#sendDisplayContextCommand(
      "setRotation",
      dataView.buffer,
      sendImmediately
    );
  }

  #assertValidSegmentCap(segmentCap: DisplaySegmentCap) {
    _console.assertEnumWithError(segmentCap, DisplaySegmentCaps);
  }
  setSegmentStartCap(
    segmentStartCap: DisplaySegmentCap,
    sendImmediately: boolean
  ) {
    this.#assertValidSegmentCap(segmentStartCap);
    const dataView = new DataView(new ArrayBuffer(1));
    _console.log({ segmentStartCap });
    const segmentCapEnum = DisplaySegmentCaps.indexOf(segmentStartCap);
    dataView.setUint8(0, segmentCapEnum);
    this.#sendDisplayContextCommand(
      "setSegmentStartCap",
      dataView.buffer,
      sendImmediately
    );
  }
  setSegmentEndCap(segmentEndCap: DisplaySegmentCap, sendImmediately: boolean) {
    this.#assertValidSegmentCap(segmentEndCap);
    const dataView = new DataView(new ArrayBuffer(1));
    _console.log({ segmentEndCap });
    const segmentCapEnum = DisplaySegmentCaps.indexOf(segmentEndCap);
    dataView.setUint8(0, segmentCapEnum);
    this.#sendDisplayContextCommand(
      "setSegmentEndCap",
      dataView.buffer,
      sendImmediately
    );
  }
  setSegmentCap(segmentCap: DisplaySegmentCap, sendImmediately: boolean) {
    this.#assertValidSegmentCap(segmentCap);
    const dataView = new DataView(new ArrayBuffer(1));
    _console.log({ segmentCap });
    const segmentCapEnum = DisplaySegmentCaps.indexOf(segmentCap);
    dataView.setUint8(0, segmentCapEnum);
    this.#sendDisplayContextCommand(
      "setSegmentCap",
      dataView.buffer,
      sendImmediately
    );
  }

  setSegmentStartRadius(segmentStartRadius: number, sendImmediately: boolean) {
    const dataView = new DataView(new ArrayBuffer(2));
    _console.log({ segmentStartRadius });
    dataView.setUint16(0, segmentStartRadius, true);
    this.#sendDisplayContextCommand(
      "setSegmentStartRadius",
      dataView.buffer,
      sendImmediately
    );
  }
  setSegmentEndRadius(segmentEndRadius: number, sendImmediately: boolean) {
    const dataView = new DataView(new ArrayBuffer(2));
    _console.log({ segmentEndRadius });
    dataView.setUint16(0, segmentEndRadius, true);
    this.#sendDisplayContextCommand(
      "setSegmentEndRadius",
      dataView.buffer,
      sendImmediately
    );
  }
  setSegmentRadius(segmentRadius: number, sendImmediately: boolean) {
    const dataView = new DataView(new ArrayBuffer(2));
    _console.log({ segmentRadius });
    dataView.setUint16(0, segmentRadius, true);
    this.#sendDisplayContextCommand(
      "setSegmentRadius",
      dataView.buffer,
      sendImmediately
    );
  }

  setCropTop(cropTop: number, sendImmediately: boolean) {
    const dataView = new DataView(new ArrayBuffer(2));
    _console.log({ cropTop });
    dataView.setUint16(0, cropTop, true);
    this.#sendDisplayContextCommand(
      "setCropTop",
      dataView.buffer,
      sendImmediately
    );
  }
  setCropRight(cropRight: number, sendImmediately: boolean) {
    const dataView = new DataView(new ArrayBuffer(2));
    _console.log({ cropRight });
    dataView.setUint16(0, cropRight, true);
    this.#sendDisplayContextCommand(
      "setCropRight",
      dataView.buffer,
      sendImmediately
    );
  }
  setCropBottom(cropBottom: number, sendImmediately: boolean) {
    const dataView = new DataView(new ArrayBuffer(2));
    _console.log({ cropBottom });
    dataView.setUint16(0, cropBottom, true);
    this.#sendDisplayContextCommand(
      "setCropBottom",
      dataView.buffer,
      sendImmediately
    );
  }
  setCropLeft(cropLeft: number, sendImmediately: boolean) {
    const dataView = new DataView(new ArrayBuffer(2));
    _console.log({ cropLeft });
    dataView.setUint16(0, cropLeft, true);
    this.#sendDisplayContextCommand(
      "setCropLeft",
      dataView.buffer,
      sendImmediately
    );
  }

  setRotationCropTop(cropTop: number, sendImmediately: boolean) {
    const dataView = new DataView(new ArrayBuffer(2));
    _console.log({ cropTop });
    dataView.setUint16(0, cropTop, true);
    this.#sendDisplayContextCommand(
      "setRotationCropTop",
      dataView.buffer,
      sendImmediately
    );
  }
  setRotationCropRight(cropRight: number, sendImmediately: boolean) {
    const dataView = new DataView(new ArrayBuffer(2));
    _console.log({ cropRight });
    dataView.setUint16(0, cropRight, true);
    this.#sendDisplayContextCommand(
      "setRotationCropRight",
      dataView.buffer,
      sendImmediately
    );
  }
  setRotationCropBottom(cropBottom: number, sendImmediately: boolean) {
    const dataView = new DataView(new ArrayBuffer(2));
    _console.log({ cropBottom });
    dataView.setUint16(0, cropBottom, true);
    this.#sendDisplayContextCommand(
      "setRotationCropBottom",
      dataView.buffer,
      sendImmediately
    );
  }
  setRotationCropLeft(cropLeft: number, sendImmediately: boolean) {
    const dataView = new DataView(new ArrayBuffer(2));
    _console.log({ cropLeft });
    dataView.setUint16(0, cropLeft, true);
    this.#sendDisplayContextCommand(
      "setRotationCropLeft",
      dataView.buffer,
      sendImmediately
    );
  }

  #clampX(x: number) {
    return clamp(x, 0, this.width - 1);
  }
  #clampWidth(x: number, width: number) {
    return clamp(width, 1, this.width - x);
  }
  #clampY(y: number) {
    return clamp(y, 0, this.height - 1);
  }
  #clampHeight(y: number, height: number) {
    return clamp(height, 1, this.height - y);
  }
  #clampBox(x: number, y: number, width: number, height: number) {
    //x = this.#clampX(x);
    //width = this.#clampWidth(x, width);
    //y = this.#clampY(y);
    //height = this.#clampHeight(y, height);

    _console.log("clampBox", { x, y, width, height });

    return { x, y, width, height };
  }
  clearRect(
    x: number,
    y: number,
    width: number,
    height: number,
    sendImmediately: boolean
  ) {
    const {
      x: _x,
      y: _y,
      width: _width,
      height: _height,
    } = this.#clampBox(x, y, width, height);
    const dataView = new DataView(new ArrayBuffer(2 * 4));
    dataView.setUint16(0, _x, true);
    dataView.setUint16(2, _y, true);
    dataView.setUint16(4, _width, true);
    dataView.setUint16(6, _height, true);
    this.#sendDisplayContextCommand(
      "clearRect",
      dataView.buffer,
      sendImmediately
    );
  }
  drawRect(
    x: number,
    y: number,
    width: number,
    height: number,
    sendImmediately: boolean
  ) {
    const {
      x: _x,
      y: _y,
      width: _width,
      height: _height,
    } = this.#clampBox(x, y, width, height);
    const dataView = new DataView(new ArrayBuffer(2 * 4));
    dataView.setInt16(0, _x, true);
    dataView.setInt16(2, _y, true);
    dataView.setUint16(4, _width, true);
    dataView.setUint16(6, _height, true);
    _console.log("drawRect data", dataView);
    this.#sendDisplayContextCommand(
      "drawRect",
      dataView.buffer,
      sendImmediately
    );
  }
  drawRoundRect(
    x: number,
    y: number,
    width: number,
    height: number,
    borderRadius: number,
    sendImmediately: boolean
  ) {
    const {
      x: _x,
      y: _y,
      width: _width,
      height: _height,
    } = this.#clampBox(x, y, width, height);
    const dataView = new DataView(new ArrayBuffer(2 * 4 + 1));
    dataView.setInt16(0, _x, true);
    dataView.setInt16(2, _y, true);
    dataView.setUint16(4, _width, true);
    dataView.setUint16(6, _height, true);
    dataView.setUint8(8, borderRadius);
    _console.log("drawRoundRect data", dataView);
    this.#sendDisplayContextCommand(
      "drawRoundRect",
      dataView.buffer,
      sendImmediately
    );
  }
  drawCircle(x: number, y: number, radius: number, sendImmediately: boolean) {
    //x = this.#clampX(x);
    //y = this.#clampY(y);
    const dataView = new DataView(new ArrayBuffer(2 * 3));
    dataView.setInt16(0, x, true);
    dataView.setInt16(2, y, true);
    dataView.setUint16(4, radius, true);
    _console.log("drawCircle data", dataView);
    this.#sendDisplayContextCommand(
      "drawCircle",
      dataView.buffer,
      sendImmediately
    );
  }
  drawEllipse(
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    sendImmediately: boolean
  ) {
    const dataView = new DataView(new ArrayBuffer(2 * 4));
    dataView.setInt16(0, x, true);
    dataView.setInt16(2, y, true);
    dataView.setUint16(4, radiusX, true);
    dataView.setUint16(6, radiusY, true);
    _console.log("drawEllipse data", dataView);
    this.#sendDisplayContextCommand(
      "drawEllipse",
      dataView.buffer,
      sendImmediately
    );
  }
  drawPolygon(
    x: number,
    y: number,
    radius: number,
    numberOfSides: number,
    sendImmediately: boolean
  ) {
    const dataView = new DataView(new ArrayBuffer(2 * 3 + 1));
    dataView.setInt16(0, x, true);
    dataView.setInt16(2, y, true);
    dataView.setUint16(4, radius, true);
    dataView.setUint8(6, numberOfSides);
    _console.log("drawPolygon data", dataView);
    this.#sendDisplayContextCommand(
      "drawPolygon",
      dataView.buffer,
      sendImmediately
    );
  }

  drawSegment(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    sendImmediately: boolean
  ) {
    const dataView = new DataView(new ArrayBuffer(2 * 4));
    _console.log({ startX, startY, endX, endY });
    dataView.setInt16(0, startX, true);
    dataView.setInt16(2, startY, true);
    dataView.setInt16(4, endX, true);
    dataView.setInt16(6, endY, true);
    _console.log("drawSegment data", dataView);
    this.#sendDisplayContextCommand(
      "drawSegment",
      dataView.buffer,
      sendImmediately
    );
  }

  // SPRITE SHEET
  selectSpriteSheet(index: number, sendImmediately: boolean) {
    // FILL
  }
  drawSprite(index: number, x: number, y: number, sendImmediately: boolean) {
    // FILL
  }

  // MESSAGE
  parseMessage(messageType: DisplayMessageType, dataView: DataView) {
    _console.log({ messageType, dataView });

    switch (messageType) {
      case "isDisplayAvailable":
        this.#parseIsDisplayAvailable(dataView);
        break;
      case "displayStatus":
        this.#parseDisplayStatus(dataView);
        break;
      case "displayInformation":
        this.#parseDisplayInformation(dataView);
        break;
      case "getDisplayBrightness":
      case "setDisplayBrightness":
        this.#parseDisplayBrightness(dataView);
        break;
      default:
        throw Error(`uncaught messageType ${messageType}`);
    }
  }

  clear() {
    _console.log("clearing displayManager");
    // @ts-ignore
    this.#displayStatus = undefined;
    this.#isDisplayAvailable = false;
    this.#displayInformation = undefined;
    // @ts-ignore
    this.#displayBrightness = undefined;
    this.#displayContextCommandBuffers = [];
    this.#isDisplayAvailable = false;
  }

  // MTU
  #mtu!: number;
  get mtu() {
    return this.#mtu;
  }
  set mtu(newMtu: number) {
    this.#mtu = newMtu;
  }
}

export default DisplayManager;
