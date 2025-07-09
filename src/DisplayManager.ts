import Device, { SendMessageCallback } from "./Device.ts";
import {
  concatenateArrayBuffers,
  UInt8ByteBuffer,
} from "./utils/ArrayBufferUtils.ts";
import { createConsole } from "./utils/Console.ts";
import EventDispatcher from "./utils/EventDispatcher.ts";
import autoBind from "auto-bind";
import {
  clamp,
  degToRad,
  Int16Max,
  Int16Min,
  normalizeRadians,
  twoPi,
  Vector2,
} from "./utils/MathUtils.ts";
import { rgbToHex, stringToRGB } from "./utils/ColorUtils.ts";
import DisplayContextStateHelper from "./utils/DisplayContextStateHelper.ts";
import {
  assertValidColor,
  assertValidDisplayBrightness,
  assertValidOpacity,
  assertValidSegmentCap,
  DisplayBitmapScaleDirection,
  DisplayBitmapScaleDirectionToCommand,
  displayBitmapScaleStep,
  DisplayCropDirection,
  DisplayCropDirections,
  DisplayCropDirectionToCommand,
  DisplayCropDirectionToStateKey,
  DisplayRotationCropDirectionToCommand,
  DisplayRotationCropDirectionToStateKey,
  formatBitmapScale,
  formatRotation,
  maxDisplayBitmapScale,
  numberOfColorsToPixelDepth,
  pixelDepthToPixelBitWidth,
  pixelDepthToPixelsPerByte,
  roundBitmapScale,
} from "./utils/DisplayUtils.ts";

const _console = createConsole("DisplayManager", { log: true });

export const DefaultNumberOfDisplayColors = 16;

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
  "generic",
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
  "displayReady",
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

export type DisplayBitmapColorPair = {
  bitmapColorIndex: number;
  colorIndex: number;
};

export type DisplayBitmap = {
  width: number;
  numberOfColors: number;
  pixels: number[];
};

export type DisplayContextState = {
  fillColorIndex: number;
  lineColorIndex: number;
  lineWidth: number;

  rotation: number;

  segmentStartCap: DisplaySegmentCap;
  segmentEndCap: DisplaySegmentCap;

  segmentStartRadius: number;
  segmentEndRadius: number;

  cropTop: number;
  cropRight: number;
  cropBottom: number;
  cropLeft: number;

  rotationCropTop: number;
  rotationCropRight: number;
  rotationCropBottom: number;
  rotationCropLeft: number;

  bitmapColorIndices: number[];
  bitmapScaleX: number;
  bitmapScaleY: number;

  // FILL - text stuff
};
export type DisplayContextStateKey = keyof DisplayContextState;
export type PartialDisplayContextState = Partial<DisplayContextState>;

export const DefaultDisplayContextState: DisplayContextState = {
  fillColorIndex: 1,

  lineColorIndex: 1,
  lineWidth: 0,

  rotation: 0,

  segmentStartCap: "flat",
  segmentEndCap: "flat",

  segmentStartRadius: 1,
  segmentEndRadius: 1,

  cropTop: 0,
  cropRight: 0,
  cropBottom: 0,
  cropLeft: 0,

  rotationCropTop: 0,
  rotationCropRight: 0,
  rotationCropBottom: 0,
  rotationCropLeft: 0,

  bitmapColorIndices: new Array(0).fill(0),
  bitmapScaleX: 1,
  bitmapScaleY: 1,
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
  "clearRotation",

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
  "clearCrop",

  "setRotationCropTop",
  "setRotationCropRight",
  "setRotationCropBottom",
  "setRotationCropLeft",
  "clearRotationCrop",

  "selectBitmapColor",
  "selectBitmapColors",
  "setBitmapScaleX",
  "setBitmapScaleY",
  "setBitmapScale",
  "resetBitmapScale",

  "clearRect",

  "drawRect",
  "drawRoundRect",
  "drawCircle",
  "drawEllipse",
  "drawPolygon",
  "drawSegment",
  "drawSegments",

  "drawArc",
  "drawArcEllipse",
  "drawBitmap",

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

export const DisplayEventTypes = [
  ...DisplayMessageTypes,
  "displayContextState",
  "displayColor",
  "displayColorOpacity",
  "displayOpacity",
] as const;
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
  displayContextState: {
    displayContextState: DisplayContextState;
    differences: DisplayContextStateKey[];
  };
  displayColor: {
    colorIndex: number;
    color: DisplayColorRGB;
    colorHex: string;
  };
  displayColorOpacity: {
    opacity: number;
    colorIndex: number;
  };
  displayOpacity: {
    opacity: number;
  };
  displayReady: {};
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

  // DISPLAY CONTEXT STATE
  #displayContextStateHelper = new DisplayContextStateHelper();
  get displayContextState() {
    return this.#displayContextStateHelper.state;
  }
  #onDisplayContextStateUpdate(differences: DisplayContextStateKey[]) {
    this.#dispatchEvent("displayContextState", {
      displayContextState: structuredClone(this.displayContextState),
      differences,
    });
  }
  async setContextState(
    newState: PartialDisplayContextState,
    sendImmediately?: boolean
  ) {
    const differences = this.#displayContextStateHelper.diff(newState);
    if (differences.length == 0) {
      return;
    }
    differences.forEach((difference) => {
      switch (difference) {
        case "fillColorIndex":
          this.selectFillColor(newState.fillColorIndex!);
          break;
        case "lineColorIndex":
          this.selectLineColor(newState.lineColorIndex!);
          break;
        case "lineWidth":
          this.setLineWidth(newState.lineWidth!);
          break;
        case "rotation":
          this.setRotation(newState.rotation!, true);
          break;
        case "segmentStartCap":
          this.setSegmentStartCap(newState.segmentStartCap!);
          break;
        case "segmentEndCap":
          this.setSegmentEndCap(newState.segmentEndCap!);
          break;
        case "segmentStartRadius":
          this.setSegmentStartRadius(newState.segmentStartRadius!);
          break;
        case "segmentEndRadius":
          this.setSegmentEndRadius(newState.segmentEndRadius!);
          break;
        case "cropTop":
          this.setCropTop(newState.cropTop!);
          break;
        case "cropRight":
          this.setCropRight(newState.cropRight!);
          break;
        case "cropBottom":
          this.setCropBottom(newState.cropBottom!);
          break;
        case "cropLeft":
          this.setCropLeft(newState.cropLeft!);
          break;
        case "rotationCropTop":
          this.setRotationCropTop(newState.rotationCropTop!);
          break;
        case "rotationCropRight":
          this.setRotationCropRight(newState.rotationCropRight!);
          break;
        case "rotationCropBottom":
          this.setRotationCropBottom(newState.rotationCropBottom!);
          break;
        case "rotationCropLeft":
          this.setRotationCropLeft(newState.rotationCropLeft!);
          break;
        case "bitmapColorIndices":
          const bitmapColors: DisplayBitmapColorPair[] = [];
          newState.bitmapColorIndices!.forEach(
            (colorIndex, bitmapColorIndex) => {
              bitmapColors.push({ bitmapColorIndex, colorIndex });
            }
          );
          this.selectBitmapColorIndices(bitmapColors);
          break;
        case "bitmapScaleX":
          this.setBitmapScaleX(newState.bitmapScaleX!);
          break;
        case "bitmapScaleY":
          this.setBitmapScaleY(newState.bitmapScaleY!);
          break;
      }
    });
    if (sendImmediately) {
      await this.#sendDisplayContextCommands();
    }
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
    this.#colors = new Array(this.numberOfColors).fill("#000000");
    this.#opacities = new Array(this.numberOfColors).fill(1);
    this.displayContextState.bitmapColorIndices = new Array(
      this.numberOfColors
    ).fill(0);
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
    assertValidDisplayBrightness(newDisplayBrightness);

    this.#displayBrightness = newDisplayBrightness;
    _console.log({ displayBrightness: this.#displayBrightness });
    this.#dispatchEvent("getDisplayBrightness", {
      displayBrightness: this.#displayBrightness,
    });
  }

  async setDisplayBrightness(
    newDisplayBrightness: DisplayBrightness,
    sendImmediately?: boolean
  ) {
    this.#assertDisplayIsAvailable();
    assertValidDisplayBrightness(newDisplayBrightness);
    if (this.displayBrightness == newDisplayBrightness) {
      _console.log(`redundant displayBrightness ${newDisplayBrightness}`);
      return;
    }
    const newDisplayBrightnessEnum =
      DisplayBrightnesses.indexOf(newDisplayBrightness);
    const newDisplayBrightnessData = UInt8ByteBuffer(newDisplayBrightnessEnum);

    const promise = this.waitForEvent("getDisplayBrightness");
    this.sendMessage(
      [{ type: "setDisplayBrightness", data: newDisplayBrightnessData }],
      sendImmediately
    );
    await promise;
  }

  // DISPLAY CONTEXT
  #assertValidDisplayContextCommand(
    displayContextCommand: DisplayContextCommand
  ) {
    _console.assertEnumWithError(displayContextCommand, DisplayContextCommands);
  }

  get #maxCommandDataLength() {
    return this.mtu - 7;
  }
  #displayContextCommandBuffers: ArrayBuffer[] = [];
  async #sendDisplayContextCommand(
    displayContextCommand: DisplayContextCommand,
    arrayBuffer?: ArrayBuffer,
    sendImmediately?: boolean
  ) {
    this.#assertValidDisplayContextCommand(displayContextCommand);
    _console.log(
      "sendDisplayContextCommand",
      { displayContextCommand, sendImmediately },
      arrayBuffer
    );
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
    if (newLength > this.#maxCommandDataLength) {
      _console.log("displayContextCommandBuffers too full - sending now");
      await this.#sendDisplayContextCommands();
    }
    this.#displayContextCommandBuffers.push(_arrayBuffer);
    if (sendImmediately) {
      await this.#sendDisplayContextCommands();
    }
  }
  async #sendDisplayContextCommands() {
    if (this.#displayContextCommandBuffers.length == 0) {
      return;
    }
    const data = concatenateArrayBuffers(this.#displayContextCommandBuffers);
    _console.log(
      `sending displayContextCommands`,
      this.#displayContextCommandBuffers.slice(),
      data
    );
    this.#displayContextCommandBuffers.length = 0;
    await this.sendMessage([{ type: "displayContextCommands", data }], true);
  }
  async flushDisplayContextCommands() {
    await this.#sendDisplayContextCommands();
  }
  async showDisplay(sendImmediately = true) {
    _console.log("showDisplay");
    this.#isDisplayReady = false;
    await this.#sendDisplayContextCommand("show", undefined, sendImmediately);
  }
  async clearDisplay(sendImmediately = true) {
    _console.log("clearDisplay");
    this.#isDisplayReady = false;
    await this.#sendDisplayContextCommand("clear", undefined, sendImmediately);
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
  async setColor(
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
    const dataView = new DataView(new ArrayBuffer(4));
    dataView.setUint8(0, colorIndex);
    dataView.setUint8(1, color.r);
    dataView.setUint8(2, color.g);
    dataView.setUint8(3, color.b);
    await this.#sendDisplayContextCommand(
      "setColor",
      dataView.buffer,
      sendImmediately
    );
    this.colors[colorIndex] = colorHex;
    this.#dispatchEvent("displayColor", { colorIndex, color, colorHex });
  }
  #opacities: number[] = [];
  get opacities() {
    return this.#opacities;
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
      _console.log(`redundant opacity #${colorIndex} ${opacity}`);
      return;
    }
    const dataView = new DataView(new ArrayBuffer(2));
    dataView.setUint8(0, colorIndex);
    dataView.setUint8(1, opacity * 255);
    await this.#sendDisplayContextCommand(
      "setColorOpacity",
      dataView.buffer,
      sendImmediately
    );
    this.#opacities[colorIndex] = opacity;
    this.#dispatchEvent("displayColorOpacity", { colorIndex, opacity });
  }
  async setOpacity(opacity: number, sendImmediately?: boolean) {
    assertValidOpacity(opacity);
    await this.#sendDisplayContextCommand(
      "setOpacity",
      UInt8ByteBuffer(Math.round(opacity * 255)),
      sendImmediately
    );
    this.#opacities.fill(opacity);
    this.#dispatchEvent("displayOpacity", { opacity });
  }

  async saveContext(sendImmediately?: boolean) {
    await this.#sendDisplayContextCommand(
      "saveContext",
      undefined,
      sendImmediately
    );
  }
  async restoreContext(sendImmediately?: boolean) {
    await this.#sendDisplayContextCommand(
      "restoreContext",
      undefined,
      sendImmediately
    );
  }

  async selectFillColor(fillColorIndex: number, sendImmediately?: boolean) {
    this.#assertValidColorIndex(fillColorIndex);
    const differences = this.#displayContextStateHelper.update({
      fillColorIndex,
    });
    if (differences.length == 0) {
      return;
    }
    await this.#sendDisplayContextCommand(
      "selectFillColor",
      UInt8ByteBuffer(fillColorIndex),
      sendImmediately
    );
    this.#onDisplayContextStateUpdate(differences);
  }
  async selectLineColor(lineColorIndex: number, sendImmediately?: boolean) {
    this.#assertValidColorIndex(lineColorIndex);
    const differences = this.#displayContextStateHelper.update({
      lineColorIndex,
    });
    if (differences.length == 0) {
      return;
    }
    await this.#sendDisplayContextCommand(
      "selectLineColor",
      UInt8ByteBuffer(lineColorIndex),
      sendImmediately
    );
    this.#onDisplayContextStateUpdate(differences);
  }
  #assertValidLineWidth(lineWidth: number) {
    _console.assertRangeWithError("lineWidth", lineWidth, 0, this.width);
  }
  async setLineWidth(lineWidth: number, sendImmediately?: boolean) {
    this.#assertValidLineWidth(lineWidth);
    const differences = this.#displayContextStateHelper.update({
      lineWidth,
    });
    if (differences.length == 0) {
      return;
    }
    const dataView = new DataView(new ArrayBuffer(2));
    dataView.setUint16(0, lineWidth, true);
    await this.#sendDisplayContextCommand(
      "setLineWidth",
      dataView.buffer,
      sendImmediately
    );
    this.#onDisplayContextStateUpdate(differences);
  }

  async setRotation(
    rotation: number,
    isRadians?: boolean,
    sendImmediately?: boolean
  ) {
    rotation = isRadians ? rotation : degToRad(rotation);
    rotation = normalizeRadians(rotation);
    _console.log({ rotation });

    const differences = this.#displayContextStateHelper.update({
      rotation,
    });
    if (differences.length == 0) {
      return;
    }
    const dataView = new DataView(new ArrayBuffer(2));
    dataView.setUint16(0, formatRotation(rotation, true), true);
    await this.#sendDisplayContextCommand(
      "setRotation",
      dataView.buffer,
      sendImmediately
    );

    this.#onDisplayContextStateUpdate(differences);
  }
  async clearRotation(sendImmediately?: boolean) {
    const differences = this.#displayContextStateHelper.update({
      rotation: 0,
    });
    if (differences.length == 0) {
      return;
    }
    await this.#sendDisplayContextCommand(
      "clearRotation",
      undefined,
      sendImmediately
    );
    this.#onDisplayContextStateUpdate(differences);
  }

  async setSegmentStartCap(
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
    const dataView = new DataView(new ArrayBuffer(1));
    const segmentCapEnum = DisplaySegmentCaps.indexOf(segmentStartCap);
    dataView.setUint8(0, segmentCapEnum);
    await this.#sendDisplayContextCommand(
      "setSegmentStartCap",
      dataView.buffer,
      sendImmediately
    );
    this.#onDisplayContextStateUpdate(differences);
  }
  async setSegmentEndCap(
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
    const dataView = new DataView(new ArrayBuffer(1));
    const segmentCapEnum = DisplaySegmentCaps.indexOf(segmentEndCap);
    dataView.setUint8(0, segmentCapEnum);
    await this.#sendDisplayContextCommand(
      "setSegmentEndCap",
      dataView.buffer,
      sendImmediately
    );
    this.#onDisplayContextStateUpdate(differences);
  }
  async setSegmentCap(
    segmentCap: DisplaySegmentCap,
    sendImmediately?: boolean
  ) {
    assertValidSegmentCap(segmentCap);
    const differences = this.#displayContextStateHelper.update({
      segmentStartCap: segmentCap,
      segmentEndCap: segmentCap,
    });
    if (differences.length == 0) {
      return;
    }
    _console.log({ segmentCap });
    const dataView = new DataView(new ArrayBuffer(1));
    const segmentCapEnum = DisplaySegmentCaps.indexOf(segmentCap);
    dataView.setUint8(0, segmentCapEnum);
    await this.#sendDisplayContextCommand(
      "setSegmentCap",
      dataView.buffer,
      sendImmediately
    );
    this.#onDisplayContextStateUpdate(differences);
  }

  async setSegmentStartRadius(
    segmentStartRadius: number,
    sendImmediately?: boolean
  ) {
    const differences = this.#displayContextStateHelper.update({
      segmentStartRadius,
    });
    if (differences.length == 0) {
      return;
    }
    _console.log({ segmentStartRadius });
    const dataView = new DataView(new ArrayBuffer(2));
    dataView.setUint16(0, segmentStartRadius, true);
    await this.#sendDisplayContextCommand(
      "setSegmentStartRadius",
      dataView.buffer,
      sendImmediately
    );
    this.#onDisplayContextStateUpdate(differences);
  }
  async setSegmentEndRadius(
    segmentEndRadius: number,
    sendImmediately?: boolean
  ) {
    const differences = this.#displayContextStateHelper.update({
      segmentEndRadius,
    });
    if (differences.length == 0) {
      return;
    }
    _console.log({ segmentEndRadius });
    const dataView = new DataView(new ArrayBuffer(2));
    dataView.setUint16(0, segmentEndRadius, true);
    await this.#sendDisplayContextCommand(
      "setSegmentEndRadius",
      dataView.buffer,
      sendImmediately
    );
    this.#onDisplayContextStateUpdate(differences);
  }
  async setSegmentRadius(segmentRadius: number, sendImmediately?: boolean) {
    const differences = this.#displayContextStateHelper.update({
      segmentStartRadius: segmentRadius,
      segmentEndRadius: segmentRadius,
    });
    if (differences.length == 0) {
      return;
    }
    _console.log({ segmentRadius });
    const dataView = new DataView(new ArrayBuffer(2));
    dataView.setUint16(0, segmentRadius, true);
    await this.#sendDisplayContextCommand(
      "setSegmentRadius",
      dataView.buffer,
      sendImmediately
    );
    this.#onDisplayContextStateUpdate(differences);
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
    const differences = this.#displayContextStateHelper.update({
      [cropKey]: crop,
    });
    if (differences.length == 0) {
      return;
    }
    _console.log({ [cropCommand]: crop });
    const dataView = new DataView(new ArrayBuffer(2));
    dataView.setUint16(0, crop, true);
    await this.#sendDisplayContextCommand(
      cropCommand,
      dataView.buffer,
      sendImmediately
    );
    this.#onDisplayContextStateUpdate(differences);
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
    const differences = this.#displayContextStateHelper.update({
      cropTop: 0,
      cropRight: 0,
      cropBottom: 0,
      cropLeft: 0,
    });
    if (differences.length == 0) {
      return;
    }
    await this.#sendDisplayContextCommand(
      "clearCrop",
      undefined,
      sendImmediately
    );
    this.#onDisplayContextStateUpdate(differences);
  }

  async setRotationCrop(
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
    const dataView = new DataView(new ArrayBuffer(2));
    dataView.setUint16(0, crop, true);
    await this.#sendDisplayContextCommand(
      cropCommand,
      dataView.buffer,
      sendImmediately
    );
    this.#onDisplayContextStateUpdate(differences);
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
    const differences = this.#displayContextStateHelper.update({
      rotationCropTop: 0,
      rotationCropRight: 0,
      rotationCropBottom: 0,
      rotationCropLeft: 0,
    });
    if (differences.length == 0) {
      return;
    }
    await this.#sendDisplayContextCommand(
      "clearRotationCrop",
      undefined,
      sendImmediately
    );
    this.#onDisplayContextStateUpdate(differences);
  }

  async selectBitmapColorIndex(
    bitmapColorIndex: number,
    colorIndex: number,
    sendImmediately?: boolean
  ) {
    this.#assertValidColorIndex(bitmapColorIndex);
    this.#assertValidColorIndex(colorIndex);
    const bitmapColorIndices =
      this.displayContextState.bitmapColorIndices.slice();
    bitmapColorIndices[bitmapColorIndex] = colorIndex;
    const differences = this.#displayContextStateHelper.update({
      bitmapColorIndices,
    });
    if (differences.length == 0) {
      return;
    }
    const dataView = new DataView(new ArrayBuffer(2));
    dataView.setUint8(0, bitmapColorIndex);
    dataView.setUint8(1, colorIndex);
    await this.#sendDisplayContextCommand(
      "selectBitmapColor",
      dataView.buffer,
      sendImmediately
    );
    this.#onDisplayContextStateUpdate(differences);
  }
  async selectBitmapColorIndices(
    bitmapColors: DisplayBitmapColorPair[],
    sendImmediately?: boolean
  ) {
    _console.assertRangeWithError(
      "bitmapColors",
      bitmapColors.length,
      1,
      this.numberOfColors
    );
    const bitmapColorIndices =
      this.displayContextState.bitmapColorIndices.slice();
    bitmapColors.forEach(({ bitmapColorIndex, colorIndex }) => {
      this.#assertValidColorIndex(bitmapColorIndex);
      this.#assertValidColorIndex(colorIndex);
      bitmapColorIndices[bitmapColorIndex] = colorIndex;
    });

    const differences = this.#displayContextStateHelper.update({
      bitmapColorIndices,
    });
    if (differences.length == 0) {
      return;
    }
    const dataView = new DataView(new ArrayBuffer(bitmapColors.length * 2 + 1));
    let offset = 0;
    dataView.setUint8(offset++, bitmapColors.length);
    bitmapColors.forEach(({ bitmapColorIndex, colorIndex }, index) => {
      dataView.setUint8(offset, bitmapColorIndex);
      dataView.setUint8(offset + 1, colorIndex);
      offset += 2;
    });
    await this.#sendDisplayContextCommand(
      "selectBitmapColors",
      dataView.buffer,
      sendImmediately
    );
    this.#onDisplayContextStateUpdate(differences);
  }
  async #setBitmapScale(
    direction: DisplayBitmapScaleDirection,
    bitmapScale: number,
    sendImmediately?: boolean
  ) {
    bitmapScale = clamp(
      bitmapScale,
      displayBitmapScaleStep,
      maxDisplayBitmapScale
    );
    bitmapScale = roundBitmapScale(bitmapScale);
    const command = DisplayBitmapScaleDirectionToCommand[direction];
    _console.log({ command: bitmapScale });
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
    const differences = this.#displayContextStateHelper.update(newState);
    if (differences.length == 0) {
      return;
    }
    const dataView = new DataView(new ArrayBuffer(2));
    dataView.setUint16(0, formatBitmapScale(bitmapScale), true);
    await this.#sendDisplayContextCommand(
      command,
      dataView.buffer,
      sendImmediately
    );

    this.#onDisplayContextStateUpdate(differences);
  }
  async setBitmapScaleX(bitmapScaleX: number, sendImmediately?: boolean) {
    return this.#setBitmapScale("x", bitmapScaleX, sendImmediately);
  }
  async setBitmapScaleY(bitmapScaleY: number, sendImmediately?: boolean) {
    return this.#setBitmapScale("y", bitmapScaleY, sendImmediately);
  }
  async setBitmapScale(bitmapScale: number, sendImmediately?: boolean) {
    return this.#setBitmapScale("all", bitmapScale, sendImmediately);
  }
  async resetBitmapScale(sendImmediately?: boolean) {
    const differences = this.#displayContextStateHelper.update({
      bitmapScaleX: 1,
      bitmapScaleY: 1,
    });
    if (differences.length == 0) {
      return;
    }
    await this.#sendDisplayContextCommand(
      "resetBitmapScale",
      undefined,
      sendImmediately
    );
    this.#onDisplayContextStateUpdate(differences);
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
  async clearRect(
    x: number,
    y: number,
    width: number,
    height: number,
    sendImmediately?: boolean
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
    await this.#sendDisplayContextCommand(
      "clearRect",
      dataView.buffer,
      sendImmediately
    );
  }
  async drawRect(
    centerX: number,
    centerY: number,
    width: number,
    height: number,
    sendImmediately?: boolean
  ) {
    const dataView = new DataView(new ArrayBuffer(2 * 4));
    dataView.setInt16(0, centerX, true);
    dataView.setInt16(2, centerY, true);
    dataView.setUint16(4, width, true);
    dataView.setUint16(6, height, true);
    _console.log("drawRect data", dataView);
    await this.#sendDisplayContextCommand(
      "drawRect",
      dataView.buffer,
      sendImmediately
    );
  }
  async drawRoundRect(
    centerX: number,
    centerY: number,
    width: number,
    height: number,
    borderRadius: number,
    sendImmediately?: boolean
  ) {
    const dataView = new DataView(new ArrayBuffer(2 * 4 + 1));
    dataView.setInt16(0, centerX, true);
    dataView.setInt16(2, centerY, true);
    dataView.setUint16(4, width, true);
    dataView.setUint16(6, height, true);
    dataView.setUint8(8, borderRadius);
    _console.log("drawRoundRect data", dataView);
    await this.#sendDisplayContextCommand(
      "drawRoundRect",
      dataView.buffer,
      sendImmediately
    );
  }
  async drawCircle(
    centerX: number,
    centerY: number,
    radius: number,
    sendImmediately?: boolean
  ) {
    const dataView = new DataView(new ArrayBuffer(2 * 3));
    dataView.setInt16(0, centerX, true);
    dataView.setInt16(2, centerY, true);
    dataView.setUint16(4, radius, true);
    _console.log("drawCircle data", dataView);
    await this.#sendDisplayContextCommand(
      "drawCircle",
      dataView.buffer,
      sendImmediately
    );
  }
  async drawEllipse(
    centerX: number,
    centerY: number,
    radiusX: number,
    radiusY: number,
    sendImmediately?: boolean
  ) {
    const dataView = new DataView(new ArrayBuffer(2 * 4));
    dataView.setInt16(0, centerX, true);
    dataView.setInt16(2, centerY, true);
    dataView.setUint16(4, radiusX, true);
    dataView.setUint16(6, radiusY, true);
    _console.log("drawEllipse data", dataView);
    await this.#sendDisplayContextCommand(
      "drawEllipse",
      dataView.buffer,
      sendImmediately
    );
  }
  async drawPolygon(
    centerX: number,
    centerY: number,
    radius: number,
    numberOfSides: number,
    sendImmediately?: boolean
  ) {
    const dataView = new DataView(new ArrayBuffer(2 * 3 + 1));
    dataView.setInt16(0, centerX, true);
    dataView.setInt16(2, centerY, true);
    dataView.setUint16(4, radius, true);
    dataView.setUint8(6, numberOfSides);
    _console.log("drawPolygon data", dataView);
    await this.#sendDisplayContextCommand(
      "drawPolygon",
      dataView.buffer,
      sendImmediately
    );
  }

  async drawSegment(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    sendImmediately?: boolean
  ) {
    const dataView = new DataView(new ArrayBuffer(2 * 4));
    _console.log({ startX, startY, endX, endY });
    dataView.setInt16(0, startX, true);
    dataView.setInt16(2, startY, true);
    dataView.setInt16(4, endX, true);
    dataView.setInt16(6, endY, true);
    _console.log("drawSegment data", dataView);
    await this.#sendDisplayContextCommand(
      "drawSegment",
      dataView.buffer,
      sendImmediately
    );
  }
  async drawSegments(points: Vector2[], sendImmediately?: boolean) {
    _console.assertRangeWithError("numberOfPoints", points.length, 2, 255);
    _console.log({ points });
    const dataViewLength = 1 + points.length * 4;
    if (dataViewLength > this.#maxCommandDataLength) {
      const mid = Math.floor(points.length / 2);
      const firstHalf = points.slice(0, mid + 1);
      const secondHalf = points.slice(mid);
      _console.log({ firstHalf, secondHalf });
      _console.log("sending first half", firstHalf);
      await this.drawSegments(firstHalf, false);
      _console.log("sending second half", secondHalf);
      await this.drawSegments(secondHalf, sendImmediately);
      return;
    }
    const dataView = new DataView(new ArrayBuffer(dataViewLength));
    let offset = 0;
    dataView.setUint8(offset++, points.length);
    points.forEach((segment) => {
      dataView.setInt16(offset, segment.x, true);
      offset += 2;
      dataView.setInt16(offset, segment.y, true);
      offset += 2;
    });
    _console.log("drawSegments data", dataView);
    await this.#sendDisplayContextCommand(
      "drawSegments",
      dataView.buffer,
      sendImmediately
    );
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
    startAngle = normalizeRadians(startAngle);

    angleOffset = isRadians ? angleOffset : degToRad(angleOffset);
    angleOffset = clamp(angleOffset, -twoPi, twoPi);
    _console.log({ startAngle, angleOffset });

    angleOffset /= twoPi;
    angleOffset *= (angleOffset > 0 ? Int16Max - 1 : -Int16Min) - 1;

    console.log({ angleOffset });

    const dataView = new DataView(new ArrayBuffer(2 * 5));
    dataView.setInt16(0, centerX, true);
    dataView.setInt16(2, centerY, true);
    dataView.setUint16(4, radius, true);
    dataView.setUint16(6, formatRotation(startAngle, true), true);
    dataView.setInt16(8, angleOffset, true);
    _console.log("drawArc data", dataView);
    await this.#sendDisplayContextCommand(
      "drawArc",
      dataView.buffer,
      sendImmediately
    );
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
    startAngle = normalizeRadians(startAngle);

    angleOffset = isRadians ? angleOffset : degToRad(angleOffset);
    angleOffset = clamp(angleOffset, -twoPi, twoPi);
    _console.log({ startAngle, angleOffset });

    angleOffset /= twoPi;
    angleOffset *= (angleOffset > 0 ? Int16Max : -Int16Min) - 1;

    const dataView = new DataView(new ArrayBuffer(2 * 6));
    dataView.setInt16(0, centerX, true);
    dataView.setInt16(2, centerY, true);
    dataView.setUint16(4, radiusX, true);
    dataView.setUint16(6, radiusY, true);
    dataView.setUint16(8, formatRotation(startAngle, true), true);
    dataView.setUint16(10, angleOffset, true);
    _console.log("drawArcEllipse data", dataView);
    await this.#sendDisplayContextCommand(
      "drawArcEllipse",
      dataView.buffer,
      sendImmediately
    );
  }

  #assertValidNumberOfColors(numberOfColors: number) {
    _console.assertRangeWithError(
      "numberOfColors",
      numberOfColors,
      2,
      this.numberOfColors
    );
  }
  #getBitmapNumberOfBytes(bitmap: DisplayBitmap) {
    const pixelDepth = numberOfColorsToPixelDepth(bitmap.numberOfColors)!;
    const pixelsPerByte = pixelDepthToPixelsPerByte(pixelDepth);
    const numberOfPixels = bitmap.pixels.length;
    const pixelDataLength = Math.ceil(numberOfPixels / pixelsPerByte);
    _console.log({
      pixelDepth,
      pixelsPerByte,
      numberOfPixels,
      pixelDataLength,
    });
    return pixelDataLength;
  }
  #assertValidBitmapPixels(bitmap: DisplayBitmap) {
    bitmap.pixels.forEach((pixel, index) => {
      _console.assertRangeWithError(
        `bitmap.pixels[${index}]`,
        pixel,
        0,
        bitmap.numberOfColors - 1
      );
    });
  }
  #assertValidBitmap(bitmap: DisplayBitmap, limitToMtu?: boolean) {
    this.#assertValidNumberOfColors(bitmap.numberOfColors);
    this.#assertValidBitmapPixels(bitmap);
    const pixelDataLength = this.#getBitmapNumberOfBytes(bitmap);
    if (limitToMtu) {
      _console.assertRangeWithError(
        "bitmap.pixels.length",
        pixelDataLength,
        1,
        this.#maxCommandDataLength - this.#drawBitmapHeaderLength
      );
    }
  }
  #getBitmapData(bitmap: DisplayBitmap) {
    const pixelDataLength = this.#getBitmapNumberOfBytes(bitmap);
    const dataView = new DataView(new ArrayBuffer(pixelDataLength));
    const pixelDepth = numberOfColorsToPixelDepth(bitmap.numberOfColors)!;
    const pixelsPerByte = pixelDepthToPixelsPerByte(pixelDepth);
    bitmap.pixels.forEach((bitmapColorIndex, pixelIndex) => {
      const byteIndex = Math.floor(pixelIndex / pixelsPerByte);
      const byteSlot = pixelIndex % pixelsPerByte;
      const pixelBitWidth = pixelDepthToPixelBitWidth(pixelDepth);
      const bitOffset = pixelBitWidth * byteSlot;
      const shift = 8 - pixelBitWidth - bitOffset;
      let value = dataView.getUint8(byteIndex);
      value |= bitmapColorIndex << shift;
      dataView.setUint8(byteIndex, value);
    });
    _console.log("getBitmapData", bitmap, dataView);
    return dataView;
  }

  get #drawBitmapHeaderLength() {
    return 2 + 2 + 2 + 2 + 1 + 2; // x, y, width, numberOfPixels, numberOfColors, dataLength
  }
  async drawBitmap(
    centerX: number,
    centerY: number,
    bitmap: DisplayBitmap,
    sendImmediately?: boolean
  ) {
    this.#assertValidBitmap(bitmap, true);
    _console.log("drawBitmap", bitmap);
    const dataView = new DataView(
      new ArrayBuffer(this.#drawBitmapHeaderLength)
    );
    dataView.setInt16(0, centerX, true);
    dataView.setInt16(2, centerY, true);
    dataView.setUint16(4, bitmap.width, true);
    dataView.setUint16(6, bitmap.pixels.length, true);
    dataView.setUint8(8, bitmap.numberOfColors);

    const bitmapData = this.#getBitmapData(bitmap);
    dataView.setUint16(9, bitmapData.byteLength, true);

    const buffer = concatenateArrayBuffers(dataView, bitmapData);
    _console.log("drawBitmap data", buffer);
    await this.#sendDisplayContextCommand(
      "drawBitmap",
      buffer,
      sendImmediately
    );
  }

  // SPRITE SHEET
  selectSpriteSheet(index: number, sendImmediately?: boolean) {
    // FILL
  }
  drawSprite(index: number, x: number, y: number, sendImmediately?: boolean) {
    // FILL
  }

  #isDisplayReady = true;
  get isDisplayReady() {
    return this.isDisplayAvailable && this.#isDisplayReady;
  }
  #parseDisplayReady(dataView: DataView) {
    this.#isDisplayReady = true;
    this.#dispatchEvent("displayReady", {});
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
      case "displayReady":
        this.#parseDisplayReady(dataView);
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

    this.#displayContextStateHelper.reset();
    this.#colors.length = 0;
    this.#opacities.length = 0;

    this.#isDisplayReady = true;
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
