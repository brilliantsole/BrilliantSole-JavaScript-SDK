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
  normalizeRadians,
  Vector2,
} from "./utils/MathUtils.ts";
import { rgbToHex, stringToRGB } from "./utils/ColorUtils.ts";
import DisplayContextStateHelper from "./utils/DisplayContextStateHelper.ts";
import {
  assertValidColor,
  assertValidDisplayBrightness,
  assertValidSegmentCap,
  DisplayScaleDirection,
  DisplayBitmapScaleDirectionToCommandType,
  DisplayColorRGB,
  DisplayCropDirection,
  DisplayCropDirections,
  DisplayCropDirectionToCommandType,
  DisplayCropDirectionToStateKey,
  DisplayRotationCropDirectionToCommandType,
  DisplayRotationCropDirectionToStateKey,
  maxDisplayScale,
  roundScale,
  DisplaySpriteScaleDirectionToCommandType,
  minDisplayScale,
} from "./utils/DisplayUtils.ts";
import {
  assertValidBitmapPixels,
  drawBitmapHeaderLength,
  getBitmapNumberOfBytes,
  imageToBitmap,
  quantizeImage,
  resizeAndQuantizeImage,
} from "./utils/DisplayBitmapUtils.ts";
import {
  DisplayContextState,
  DisplayContextStateKey,
  DisplaySegmentCap,
  PartialDisplayContextState,
} from "./utils/DisplayContextState.ts";
import {
  DisplayContextCommand,
  DisplayContextCommandType,
  DisplayContextCommandTypes,
  serializeContextCommand,
} from "./utils/DisplayContextCommand.ts";
import {
  assertAnySelectedSpriteSheet,
  assertLoadedSpriteSheet,
  assertSelectedSpriteSheet,
  assertSprite,
  assertSpritePaletteSwap,
  assertSpriteSheetPalette,
  assertSpriteSheetPaletteSwap,
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
} from "./utils/DisplayManagerInterface.ts";
import { SendFileCallback } from "./FileTransferManager.ts";
import { textDecoder, textEncoder } from "./utils/Text.ts";
import {
  DisplaySprite,
  DisplaySpritePaletteSwap,
  DisplaySpriteSheetPalette,
  DisplaySpriteSheetPaletteSwap,
  fontToSpriteSheet,
  serializeSpriteSheet,
  DisplaySpriteSheet,
} from "./utils/DisplaySpriteSheetUtils.ts";
import { Font } from "opentype.js";

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
  "getSpriteSheetName",
  "setSpriteSheetName",
  "spriteSheetIndex",
] as const;
export type DisplayMessageType = (typeof DisplayMessageTypes)[number];

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

export type DisplayBitmapColorPair = {
  bitmapColorIndex: number;
  colorIndex: number;
};

export type DisplaySpriteColorPair = {
  spriteColorIndex: number;
  colorIndex: number;
};

export const DisplayInformationValues = {
  type: DisplayTypes,
  pixelDepth: DisplayPixelDepths,
};

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
  "displaySpriteSheetUploadStart",
  "displaySpriteSheetUploadProgress",
  "displaySpriteSheetUploadComplete",
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
    colorRGB: DisplayColorRGB;
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
  getSpriteSheetName: {
    spriteSheetName: string;
  };

  displaySpriteSheetUploadStart: {
    spriteSheetName: string;
    spriteSheet: DisplaySpriteSheet;
  };
  displaySpriteSheetUploadProgress: {
    spriteSheetName: string;
    spriteSheet: DisplaySpriteSheet;
    progress: number;
  };
  displaySpriteSheetUploadComplete: {
    spriteSheetName: string;
    spriteSheet: DisplaySpriteSheet;
  };
}

export type DisplayEventDispatcher = EventDispatcher<
  Device,
  DisplayEventType,
  DisplayEventMessages
>;
export type SendDisplayMessageCallback =
  SendMessageCallback<DisplayMessageType>;

export const MinSpriteSheetNameLength = 1;
export const MaxSpriteSheetNameLength = 30;

export type DisplayBitmap = {
  width: number;
  height: number;
  numberOfColors: number;
  pixels: number[];
};

class DisplayManager implements DisplayManagerInterface {
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
  #isAvailable = false;
  get isAvailable() {
    return this.#isAvailable;
  }

  #assertDisplayIsAvailable() {
    _console.assertWithError(this.#isAvailable, "display is not available");
  }

  #parseIsDisplayAvailable(dataView: DataView) {
    const newIsDisplayAvailable = dataView.getUint8(0) == 1;
    this.#isAvailable = newIsDisplayAvailable;
    _console.log({ isDisplayAvailable: this.#isAvailable });
    this.#dispatchEvent("isDisplayAvailable", {
      isDisplayAvailable: this.#isAvailable,
    });
  }

  // DISPLAY CONTEXT STATE
  #contextStateHelper = new DisplayContextStateHelper();
  get contextState() {
    return this.#contextStateHelper.state;
  }
  #onContextStateUpdate(differences: DisplayContextStateKey[]) {
    this.#dispatchEvent("displayContextState", {
      displayContextState: structuredClone(this.contextState),
      differences,
    });
  }
  async setContextState(
    newState: PartialDisplayContextState,
    sendImmediately?: boolean
  ) {
    const differences = this.#contextStateHelper.diff(newState);
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
          this.selectBitmapColors(bitmapColors);
          break;
        case "bitmapScaleX":
          this.setBitmapScaleX(newState.bitmapScaleX!);
          break;
        case "bitmapScaleY":
          this.setBitmapScaleY(newState.bitmapScaleY!);
          break;
        case "spriteColorIndices":
          const spriteColors: DisplaySpriteColorPair[] = [];
          newState.spriteColorIndices!.forEach(
            (colorIndex, spriteColorIndex) => {
              spriteColors.push({ spriteColorIndex, colorIndex });
            }
          );
          this.selectSpriteColors(spriteColors);
          break;
        case "spriteScaleX":
          this.setSpriteScaleX(newState.spriteScaleX!);
          break;
        case "spriteScaleY":
          this.setSpriteScaleY(newState.spriteScaleY!);
          break;
      }
    });
    if (sendImmediately) {
      await this.#sendContextCommands();
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
    return this.#displayInformation!;
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
    this.contextState.bitmapColorIndices = new Array(this.numberOfColors).fill(
      0
    );
    this.contextState.spriteColorIndices = new Array(this.numberOfColors).fill(
      0
    );
    this.#dispatchEvent("displayInformation", {
      displayInformation: this.#displayInformation,
    });
  }

  // DISPLAY BRIGHTNESS
  #brightness!: DisplayBrightness;
  get brightness() {
    return this.#brightness;
  }

  #parseDisplayBrightness(dataView: DataView) {
    const newDisplayBrightnessEnum = dataView.getUint8(0);
    const newDisplayBrightness = DisplayBrightnesses[newDisplayBrightnessEnum];
    assertValidDisplayBrightness(newDisplayBrightness);

    this.#brightness = newDisplayBrightness;
    _console.log({ displayBrightness: this.#brightness });
    this.#dispatchEvent("getDisplayBrightness", {
      displayBrightness: this.#brightness,
    });
  }

  async setBrightness(
    newDisplayBrightness: DisplayBrightness,
    sendImmediately?: boolean
  ) {
    this.#assertDisplayIsAvailable();
    assertValidDisplayBrightness(newDisplayBrightness);
    if (this.brightness == newDisplayBrightness) {
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
    displayContextCommand: DisplayContextCommandType
  ) {
    _console.assertEnumWithError(
      displayContextCommand,
      DisplayContextCommandTypes
    );
  }

  get #maxCommandDataLength() {
    return this.mtu - 7;
  }
  #displayContextCommandBuffers: ArrayBuffer[] = [];
  async #sendDisplayContextCommand(
    displayContextCommand: DisplayContextCommandType,
    arrayBuffer?: ArrayBuffer,
    sendImmediately?: boolean
  ) {
    this.#assertValidDisplayContextCommand(displayContextCommand);
    _console.log(
      "sendDisplayContextCommand",
      { displayContextCommand, sendImmediately },
      arrayBuffer
    );
    const displayContextCommandEnum = DisplayContextCommandTypes.indexOf(
      displayContextCommand
    );
    const _arrayBuffer = concatenateArrayBuffers(
      UInt8ByteBuffer(displayContextCommandEnum),
      arrayBuffer
    );
    const newLength = this.#displayContextCommandBuffers.reduce(
      (sum, buffer) => sum + buffer.byteLength,
      _arrayBuffer.byteLength
    );
    if (newLength > this.#maxCommandDataLength) {
      _console.log("displayContextCommandBuffers too full - sending now");
      await this.#sendContextCommands();
    }
    this.#displayContextCommandBuffers.push(_arrayBuffer);
    if (sendImmediately) {
      await this.#sendContextCommands();
    }
  }
  async #sendContextCommands() {
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
  async flushContextCommands() {
    await this.#sendContextCommands();
  }
  async show(sendImmediately = true) {
    _console.log("showDisplay");
    this.#isReady = false;
    await this.#sendDisplayContextCommand("show", undefined, sendImmediately);
  }
  async clear(sendImmediately = true) {
    _console.log("clearDisplay");
    this.#isReady = false;
    await this.#sendDisplayContextCommand("clear", undefined, sendImmediately);
  }

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
      _console.log(`redundant color #${colorIndex} ${colorHex}`);
      return;
    }

    //_console.log(`setting color #${colorIndex}`, colorRGB);
    this.assertValidColorIndex(colorIndex);
    assertValidColor(colorRGB);
    const dataView = new DataView(new ArrayBuffer(4));
    dataView.setUint8(0, colorIndex);
    dataView.setUint8(1, colorRGB.r);
    dataView.setUint8(2, colorRGB.g);
    dataView.setUint8(3, colorRGB.b);
    await this.#sendDisplayContextCommand(
      "setColor",
      dataView.buffer,
      sendImmediately
    );
    this.colors[colorIndex] = colorHex;
    this.#dispatchEvent("displayColor", {
      colorIndex,
      colorRGB,
      colorHex,
    });
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
    const dataView = serializeContextCommand(this, {
      type: "setColorOpacity",
      colorIndex,
      opacity,
    });
    if (!dataView) {
      return;
    }
    await this.#sendDisplayContextCommand(
      "setColorOpacity",
      dataView.buffer,
      sendImmediately
    );
    this.#opacities[colorIndex] = opacity;
    this.#dispatchEvent("displayColorOpacity", { colorIndex, opacity });
  }
  async setOpacity(opacity: number, sendImmediately?: boolean) {
    const dataView = serializeContextCommand(this, {
      type: "setOpacity",
      opacity,
    });
    if (!dataView) {
      return;
    }
    await this.#sendDisplayContextCommand(
      "setOpacity",
      dataView.buffer,
      sendImmediately
    );
    this.#opacities.fill(opacity);
    this.#dispatchEvent("displayOpacity", { opacity });
  }

  async saveContext(sendImmediately?: boolean) {
    const dataView = serializeContextCommand(this, { type: "saveContext" });
    await this.#sendDisplayContextCommand(
      "saveContext",
      dataView?.buffer,
      sendImmediately
    );
  }
  async restoreContext(sendImmediately?: boolean) {
    const dataView = serializeContextCommand(this, { type: "restoreContext" });
    await this.#sendDisplayContextCommand(
      "restoreContext",
      dataView?.buffer,
      sendImmediately
    );
  }

  async selectFillColor(fillColorIndex: number, sendImmediately?: boolean) {
    this.assertValidColorIndex(fillColorIndex);
    const differences = this.#contextStateHelper.update({
      fillColorIndex,
    });
    if (differences.length == 0) {
      return;
    }
    const dataView = serializeContextCommand(this, {
      type: "selectFillColor",
      fillColorIndex,
    });
    if (!dataView) {
      return;
    }
    await this.#sendDisplayContextCommand(
      "selectFillColor",
      dataView.buffer,
      sendImmediately
    );
    this.#onContextStateUpdate(differences);
  }
  async selectLineColor(lineColorIndex: number, sendImmediately?: boolean) {
    this.assertValidColorIndex(lineColorIndex);
    const differences = this.#contextStateHelper.update({
      lineColorIndex,
    });
    if (differences.length == 0) {
      return;
    }
    const dataView = serializeContextCommand(this, {
      type: "selectLineColor",
      lineColorIndex,
    });
    if (!dataView) {
      return;
    }
    await this.#sendDisplayContextCommand(
      "selectLineColor",
      dataView.buffer,
      sendImmediately
    );
    this.#onContextStateUpdate(differences);
  }
  assertValidLineWidth(lineWidth: number) {
    _console.assertRangeWithError("lineWidth", lineWidth, 0, this.width);
  }
  async setLineWidth(lineWidth: number, sendImmediately?: boolean) {
    this.assertValidLineWidth(lineWidth);
    const differences = this.#contextStateHelper.update({
      lineWidth,
    });
    if (differences.length == 0) {
      return;
    }
    const dataView = serializeContextCommand(this, {
      type: "setLineWidth",
      lineWidth,
    });
    if (!dataView) {
      return;
    }
    await this.#sendDisplayContextCommand(
      "setLineWidth",
      dataView.buffer,
      sendImmediately
    );
    this.#onContextStateUpdate(differences);
  }

  async setRotation(
    rotation: number,
    isRadians?: boolean,
    sendImmediately?: boolean
  ) {
    rotation = isRadians ? rotation : degToRad(rotation);
    rotation = normalizeRadians(rotation);
    isRadians = true;
    const differences = this.#contextStateHelper.update({
      rotation,
    });
    if (differences.length == 0) {
      return;
    }
    const dataView = serializeContextCommand(this, {
      type: "setRotation",
      rotation,
      isRadians,
    });
    if (!dataView) {
      return;
    }
    await this.#sendDisplayContextCommand(
      "setRotation",
      dataView.buffer,
      sendImmediately
    );

    this.#onContextStateUpdate(differences);
  }
  async clearRotation(sendImmediately?: boolean) {
    const differences = this.#contextStateHelper.update({
      rotation: 0,
    });
    if (differences.length == 0) {
      return;
    }
    const dataView = serializeContextCommand(this, { type: "clearRotation" });
    if (!dataView) {
      return;
    }
    await this.#sendDisplayContextCommand(
      "clearRotation",
      dataView.buffer,
      sendImmediately
    );
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
    const dataView = serializeContextCommand(this, {
      type: "setSegmentStartCap",
      segmentStartCap,
    });
    if (!dataView) {
      return;
    }
    await this.#sendDisplayContextCommand(
      "setSegmentStartCap",
      dataView.buffer,
      sendImmediately
    );
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
    const dataView = serializeContextCommand(this, {
      type: "setSegmentEndCap",
      segmentEndCap,
    });
    if (!dataView) {
      return;
    }
    await this.#sendDisplayContextCommand(
      "setSegmentEndCap",
      dataView.buffer,
      sendImmediately
    );
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
    const dataView = serializeContextCommand(this, {
      type: "setSegmentCap",
      segmentCap,
    });
    if (!dataView) {
      return;
    }
    await this.#sendDisplayContextCommand(
      "setSegmentCap",
      dataView.buffer,
      sendImmediately
    );
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
    const dataView = serializeContextCommand(this, {
      type: "setSegmentStartRadius",
      segmentStartRadius,
    });
    if (!dataView) {
      return;
    }
    await this.#sendDisplayContextCommand(
      "setSegmentStartRadius",
      dataView.buffer,
      sendImmediately
    );
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
    const dataView = serializeContextCommand(this, {
      type: "setSegmentEndRadius",
      segmentEndRadius,
    });
    if (!dataView) {
      return;
    }
    await this.#sendDisplayContextCommand(
      "setSegmentEndRadius",
      dataView.buffer,
      sendImmediately
    );
    this.#onContextStateUpdate(differences);
  }
  async setSegmentRadius(segmentRadius: number, sendImmediately?: boolean) {
    const differences = this.#contextStateHelper.update({
      segmentStartRadius: segmentRadius,
      segmentEndRadius: segmentRadius,
    });
    if (differences.length == 0) {
      return;
    }
    const dataView = serializeContextCommand(this, {
      type: "setSegmentRadius",
      segmentRadius,
    });
    if (!dataView) {
      return;
    }
    await this.#sendDisplayContextCommand(
      "setSegmentRadius",
      dataView.buffer,
      sendImmediately
    );
    this.#onContextStateUpdate(differences);
  }

  async setCrop(
    cropDirection: DisplayCropDirection,
    crop: number,
    sendImmediately?: boolean
  ) {
    _console.assertEnumWithError(cropDirection, DisplayCropDirections);
    crop = Math.max(0, crop);
    const cropCommand = DisplayCropDirectionToCommandType[cropDirection];
    const cropKey = DisplayCropDirectionToStateKey[cropDirection];
    const differences = this.#contextStateHelper.update({
      [cropKey]: crop,
    });
    if (differences.length == 0) {
      return;
    }
    // @ts-ignore
    const dataView = serializeContextCommand(this, {
      type: cropCommand,
      [cropKey]: crop,
    });
    if (!dataView) {
      return;
    }
    await this.#sendDisplayContextCommand(
      cropCommand,
      dataView.buffer,
      sendImmediately
    );
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
    const dataView = serializeContextCommand(this, { type: "clearCrop" });
    await this.#sendDisplayContextCommand(
      "clearCrop",
      dataView?.buffer,
      sendImmediately
    );
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
    if (differences.length == 0) {
      return;
    }
    // @ts-ignore
    const dataView = serializeContextCommand(this, {
      type: cropCommand,
      [cropKey]: crop,
    });
    if (!dataView) {
      return;
    }
    await this.#sendDisplayContextCommand(
      cropCommand,
      dataView.buffer,
      sendImmediately
    );
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
    const dataView = serializeContextCommand(this, {
      type: "clearRotationCrop",
    });
    await this.#sendDisplayContextCommand(
      "clearRotationCrop",
      dataView?.buffer,
      sendImmediately
    );
    this.#onContextStateUpdate(differences);
  }

  async selectBitmapColor(
    bitmapColorIndex: number,
    colorIndex: number,
    sendImmediately?: boolean
  ) {
    this.assertValidColorIndex(bitmapColorIndex);
    this.assertValidColorIndex(colorIndex);
    const bitmapColorIndices = this.contextState.bitmapColorIndices.slice();
    bitmapColorIndices[bitmapColorIndex] = colorIndex;
    const differences = this.#contextStateHelper.update({
      bitmapColorIndices,
    });
    if (differences.length == 0) {
      return;
    }
    const dataView = serializeContextCommand(this, {
      type: "selectBitmapColor",
      bitmapColorIndex,
      colorIndex,
    });
    if (!dataView) {
      return;
    }
    await this.#sendDisplayContextCommand(
      "selectBitmapColor",
      dataView.buffer,
      sendImmediately
    );
    this.#onContextStateUpdate(differences);
  }
  get bitmapColorIndices() {
    return this.contextState.bitmapColorIndices;
  }
  get bitmapColors() {
    return this.bitmapColorIndices.map((colorIndex) => this.colors[colorIndex]);
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
    if (differences.length == 0) {
      return;
    }
    const dataView = serializeContextCommand(this, {
      type: "selectBitmapColors",
      bitmapColorPairs,
    });
    if (!dataView) {
      return;
    }
    await this.#sendDisplayContextCommand(
      "selectBitmapColors",
      dataView.buffer,
      sendImmediately
    );
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
    const commandType = DisplayBitmapScaleDirectionToCommandType[direction];
    _console.log({ [commandType]: bitmapScale });
    const newState: PartialDisplayContextState = {};
    let command: DisplayContextCommand;
    switch (direction) {
      case "all":
        newState.bitmapScaleX = bitmapScale;
        newState.bitmapScaleY = bitmapScale;
        command = { type: "setBitmapScale", bitmapScale };
        break;
      case "x":
        newState.bitmapScaleX = bitmapScale;
        command = { type: "setBitmapScaleX", bitmapScaleX: bitmapScale };
        break;
      case "y":
        newState.bitmapScaleY = bitmapScale;
        command = { type: "setBitmapScaleY", bitmapScaleY: bitmapScale };
        break;
    }
    const differences = this.#contextStateHelper.update(newState);
    if (differences.length == 0) {
      return;
    }
    const dataView = serializeContextCommand(this, command);
    if (!dataView) {
      return;
    }
    await this.#sendDisplayContextCommand(
      commandType,
      dataView.buffer,
      sendImmediately
    );

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
    const dataView = serializeContextCommand(this, {
      type: "resetBitmapScale",
    });
    await this.#sendDisplayContextCommand(
      "resetBitmapScale",
      dataView?.buffer,
      sendImmediately
    );
    this.#onContextStateUpdate(differences);
  }

  async selectSpriteColor(
    spriteColorIndex: number,
    colorIndex: number,
    sendImmediately?: boolean
  ) {
    this.assertValidColorIndex(spriteColorIndex);
    this.assertValidColorIndex(colorIndex);
    const spriteColorIndices = this.contextState.spriteColorIndices.slice();
    spriteColorIndices[spriteColorIndex] = colorIndex;
    const differences = this.#contextStateHelper.update({
      spriteColorIndices,
    });
    if (differences.length == 0) {
      return;
    }
    const dataView = serializeContextCommand(this, {
      type: "selectSpriteColor",
      spriteColorIndex,
      colorIndex,
    });
    if (!dataView) {
      return;
    }
    await this.#sendDisplayContextCommand(
      "selectSpriteColor",
      dataView.buffer,
      sendImmediately
    );
    this.#onContextStateUpdate(differences);
  }
  get spriteColorIndices() {
    return this.contextState.spriteColorIndices;
  }
  get spriteColors() {
    return this.spriteColorIndices.map((colorIndex) => this.colors[colorIndex]);
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
    if (differences.length == 0) {
      return;
    }
    const dataView = serializeContextCommand(this, {
      type: "selectSpriteColors",
      spriteColorPairs,
    });
    if (!dataView) {
      return;
    }
    await this.#sendDisplayContextCommand(
      "selectSpriteColors",
      dataView.buffer,
      sendImmediately
    );
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
    if (differences.length == 0) {
      return;
    }
    const dataView = serializeContextCommand(this, {
      type: "resetSpriteColors",
    });
    await this.#sendDisplayContextCommand(
      "resetSpriteColors",
      dataView?.buffer,
      sendImmediately
    );
    this.#onContextStateUpdate(differences);
  }

  async setSpriteScaleDirection(
    direction: DisplayScaleDirection,
    spriteScale: number,
    sendImmediately?: boolean
  ) {
    spriteScale = clamp(spriteScale, minDisplayScale, maxDisplayScale);
    spriteScale = roundScale(spriteScale);
    const commandType = DisplaySpriteScaleDirectionToCommandType[direction];
    _console.log({ [commandType]: spriteScale });
    const newState: PartialDisplayContextState = {};
    let command: DisplayContextCommand;
    switch (direction) {
      case "all":
        newState.spriteScaleX = spriteScale;
        newState.spriteScaleY = spriteScale;
        command = { type: "setSpriteScale", spriteScale };
        break;
      case "x":
        newState.spriteScaleX = spriteScale;
        command = { type: "setSpriteScaleX", spriteScaleX: spriteScale };
        break;
      case "y":
        newState.spriteScaleY = spriteScale;
        command = { type: "setSpriteScaleY", spriteScaleY: spriteScale };
        break;
    }
    const differences = this.#contextStateHelper.update(newState);
    if (differences.length == 0) {
      return;
    }
    const dataView = serializeContextCommand(this, command);
    if (!dataView) {
      return;
    }
    await this.#sendDisplayContextCommand(
      commandType,
      dataView.buffer,
      sendImmediately
    );

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
    if (differences.length == 0) {
      return;
    }
    const dataView = serializeContextCommand(this, {
      type: "resetSpriteScale",
    });
    await this.#sendDisplayContextCommand(
      "resetSpriteScale",
      dataView?.buffer,
      sendImmediately
    );
    this.#onContextStateUpdate(differences);
  }

  async clearRect(
    x: number,
    y: number,
    width: number,
    height: number,
    sendImmediately?: boolean
  ) {
    const dataView = serializeContextCommand(this, {
      type: "clearRect",
      x,
      y,
      width,
      height,
    });
    if (!dataView) {
      return;
    }
    await this.#sendDisplayContextCommand(
      "clearRect",
      dataView.buffer,
      sendImmediately
    );
  }
  async drawRect(
    offsetX: number,
    offsetY: number,
    width: number,
    height: number,
    sendImmediately?: boolean
  ) {
    const dataView = serializeContextCommand(this, {
      type: "drawRect",
      offsetX,
      offsetY,
      width,
      height,
    });
    if (!dataView) {
      return;
    }
    await this.#sendDisplayContextCommand(
      "drawRect",
      dataView.buffer,
      sendImmediately
    );
  }
  async drawRoundRect(
    offsetX: number,
    offsetY: number,
    width: number,
    height: number,
    borderRadius: number,
    sendImmediately?: boolean
  ) {
    const dataView = serializeContextCommand(this, {
      type: "drawRoundRect",
      offsetX,
      offsetY,
      width,
      height,
      borderRadius,
    });
    if (!dataView) {
      return;
    }
    await this.#sendDisplayContextCommand(
      "drawRoundRect",
      dataView.buffer,
      sendImmediately
    );
  }
  async drawCircle(
    offsetX: number,
    offsetY: number,
    radius: number,
    sendImmediately?: boolean
  ) {
    const dataView = serializeContextCommand(this, {
      type: "drawCircle",
      offsetX,
      offsetY,
      radius,
    });
    if (!dataView) {
      return;
    }
    await this.#sendDisplayContextCommand(
      "drawCircle",
      dataView.buffer,
      sendImmediately
    );
  }
  async drawEllipse(
    offsetX: number,
    offsetY: number,
    radiusX: number,
    radiusY: number,
    sendImmediately?: boolean
  ) {
    const dataView = serializeContextCommand(this, {
      type: "drawEllipse",
      offsetX,
      offsetY,
      radiusX,
      radiusY,
    });
    if (!dataView) {
      return;
    }
    await this.#sendDisplayContextCommand(
      "drawEllipse",
      dataView.buffer,
      sendImmediately
    );
  }
  async drawRegularPolygon(
    offsetX: number,
    offsetY: number,
    radius: number,
    numberOfSides: number,
    sendImmediately?: boolean
  ) {
    const dataView = serializeContextCommand(this, {
      type: "drawRegularPolygon",
      offsetX,
      offsetY,
      radius,
      numberOfSides,
    });
    if (!dataView) {
      return;
    }
    await this.#sendDisplayContextCommand(
      "drawRegularPolygon",
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
    const dataView = serializeContextCommand(this, {
      type: "drawSegment",
      startX,
      startY,
      endX,
      endY,
    });
    if (!dataView) {
      return;
    }
    await this.#sendDisplayContextCommand(
      "drawSegment",
      dataView.buffer,
      sendImmediately
    );
  }
  async drawSegments(points: Vector2[], sendImmediately?: boolean) {
    _console.assertRangeWithError("numberOfPoints", points.length, 2, 255);
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
    const dataView = serializeContextCommand(this, {
      type: "drawSegments",
      points,
    });
    if (!dataView) {
      return;
    }
    await this.#sendDisplayContextCommand(
      "drawSegments",
      dataView.buffer,
      sendImmediately
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
    const dataView = serializeContextCommand(this, {
      type: "drawArc",
      offsetX,
      offsetY,
      radius,
      startAngle,
      angleOffset,
      isRadians,
    });
    if (!dataView) {
      return;
    }
    await this.#sendDisplayContextCommand(
      "drawArc",
      dataView.buffer,
      sendImmediately
    );
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
    const dataView = serializeContextCommand(this, {
      type: "drawArcEllipse",
      offsetX,
      offsetY,
      radiusX,
      radiusY,
      startAngle,
      angleOffset,
      isRadians,
    });
    if (!dataView) {
      return;
    }
    await this.#sendDisplayContextCommand(
      "drawArcEllipse",
      dataView.buffer,
      sendImmediately
    );
  }

  assertValidNumberOfColors(numberOfColors: number) {
    _console.assertRangeWithError(
      "numberOfColors",
      numberOfColors,
      2,
      this.numberOfColors
    );
  }

  assertValidBitmap(bitmap: DisplayBitmap, checkSize?: boolean) {
    this.assertValidNumberOfColors(bitmap.numberOfColors);
    assertValidBitmapPixels(bitmap);
    if (checkSize) {
      this.#assertValidBitmapSize(bitmap);
    }
  }
  #assertValidBitmapSize(bitmap: DisplayBitmap) {
    const pixelDataLength = getBitmapNumberOfBytes(bitmap);
    _console.assertRangeWithError(
      "bitmap.pixels.length",
      pixelDataLength,
      1,
      this.#maxCommandDataLength - drawBitmapHeaderLength
    );
  }
  async drawBitmap(
    offsetX: number,
    offsetY: number,
    bitmap: DisplayBitmap,
    sendImmediately?: boolean
  ) {
    this.assertValidBitmap(bitmap, true);

    const dataView = serializeContextCommand(this, {
      type: "drawBitmap",
      offsetX,
      offsetY,
      bitmap,
    });
    if (!dataView) {
      return;
    }
    await this.#sendDisplayContextCommand(
      "drawBitmap",
      dataView.buffer,
      sendImmediately
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
  ): Promise<{ blob: Blob; colorIndices: number[] }> {
    return resizeAndQuantizeImage(image, width, height, numberOfColors, colors);
  }

  // CONTEXT COMMANDS

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

  #isReady = true;
  get isReady() {
    return this.isAvailable && this.#isReady;
  }
  #parseDisplayReady(dataView: DataView) {
    this.#isReady = true;
    this.#dispatchEvent("displayReady", {});
  }

  // SPRITE SHEET
  #spriteSheets: Record<string, DisplaySpriteSheet> = {};
  #spriteSheetIndices: Record<string, number> = {};
  get spriteSheets() {
    return this.#spriteSheets;
  }
  get spriteSheetIndices() {
    return this.#spriteSheetIndices;
  }
  async #setSpriteSheetName(
    spriteSheetName: string,
    sendImmediately?: boolean
  ) {
    _console.assertTypeWithError(spriteSheetName, "string");
    _console.assertRangeWithError(
      "newName",
      spriteSheetName.length,
      MinSpriteSheetNameLength,
      MaxSpriteSheetNameLength
    );
    const setSpriteSheetNameData = textEncoder.encode(spriteSheetName);
    _console.log({ setSpriteSheetNameData });

    const promise = this.waitForEvent("getSpriteSheetName");
    this.sendMessage(
      [{ type: "setSpriteSheetName", data: setSpriteSheetNameData.buffer }],
      sendImmediately
    );
    await promise;
  }
  #pendingSpriteSheet?: DisplaySpriteSheet;
  get pendingSpriteSheet() {
    return this.#pendingSpriteSheet;
  }
  #pendingSpriteSheetName?: string;
  get pendingSpriteSheetName() {
    return this.#pendingSpriteSheetName;
  }
  #updateSpriteSheetName(updatedSpriteSheetName: string) {
    _console.assertTypeWithError(updatedSpriteSheetName, "string");
    this.#pendingSpriteSheetName = updatedSpriteSheetName;
    _console.log({ updatedSpriteSheetName: this.#pendingSpriteSheetName });
    this.#dispatchEvent("getSpriteSheetName", {
      spriteSheetName: this.#pendingSpriteSheetName,
    });
  }
  sendFile!: SendFileCallback;
  serializeSpriteSheet(spriteSheet: DisplaySpriteSheet): ArrayBuffer {
    return serializeSpriteSheet(this, spriteSheet);
  }
  async uploadSpriteSheet(spriteSheet: DisplaySpriteSheet) {
    spriteSheet = structuredClone(spriteSheet);
    this.#pendingSpriteSheet = spriteSheet;
    const buffer = this.serializeSpriteSheet(this.#pendingSpriteSheet);
    await this.#setSpriteSheetName(this.#pendingSpriteSheet.name);
    const promise = this.waitForEvent("displaySpriteSheetUploadComplete");
    this.sendFile("spriteSheet", buffer, true);
    await promise;
  }
  async uploadSpriteSheets(spriteSheets: DisplaySpriteSheet[]) {
    for (const spriteSheet of spriteSheets) {
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
    if (differences.length == 0) {
      return;
    }
    const spriteSheetIndex = this.spriteSheetIndices[spriteSheetName];
    const dataView = serializeContextCommand(this, {
      type: "selectSpriteSheet",
      spriteSheetIndex,
    });
    if (!dataView) {
      return;
    }
    await this.#sendDisplayContextCommand(
      "selectSpriteSheet",
      dataView.buffer,
      sendImmediately
    );
    this.#onContextStateUpdate(differences);
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
    let spriteIndex = this.selectedSpriteSheet!.sprites.findIndex(
      (sprite) => sprite.name == spriteName
    );
    _console.assertWithError(
      spriteIndex != -1,
      `sprite "${spriteName}" not found`
    );
    spriteIndex = spriteIndex!;
    const dataView = serializeContextCommand(this, {
      type: "drawSprite",
      offsetX,
      offsetY,
      spriteIndex,
      use2Bytes: this.selectedSpriteSheet!.sprites.length > 255,
    });
    if (!dataView) {
      return;
    }
    await this.#sendDisplayContextCommand(
      "drawSprite",
      dataView.buffer,
      sendImmediately
    );
  }

  async drawSpriteFromSpriteSheet(
    offsetX: number,
    offsetY: number,
    spriteName: string,
    spriteSheet: DisplaySpriteSheet,
    sendImmediately?: boolean
  ) {
    return drawSpriteFromSpriteSheet(
      this,
      offsetX,
      offsetY,
      spriteName,
      spriteSheet,
      sendImmediately
    );
  }

  #parseSpriteSheetIndex(dataView: DataView) {
    const spriteSheetIndex = dataView.getUint8(0);
    _console.log({
      pendingSpriteSheet: this.#pendingSpriteSheet,
      spriteSheetName: this.#pendingSpriteSheetName,
      spriteSheetIndex,
    });
    if (this.isServerSide) {
      return;
    }
    _console.assertWithError(
      this.#pendingSpriteSheetName,
      "expected spriteSheetName when receiving spriteSheetIndex"
    );
    _console.assertWithError(
      this.#pendingSpriteSheet,
      "expected pendingSpriteSheet when receiving spriteSheetIndex"
    );
    this.#spriteSheets[this.#pendingSpriteSheetName!] =
      this.#pendingSpriteSheet!;
    this.#spriteSheetIndices[this.#pendingSpriteSheetName!] = spriteSheetIndex;
    this.#dispatchEvent("displaySpriteSheetUploadComplete", {
      spriteSheetName: this.#pendingSpriteSheetName!,
      spriteSheet: this.#pendingSpriteSheet!,
    });
    this.#pendingSpriteSheet = undefined;
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
      case "getSpriteSheetName":
      case "setSpriteSheetName":
        const spriteSheetName = textDecoder.decode(dataView.buffer);
        _console.log({ spriteSheetName });
        this.#updateSpriteSheetName(spriteSheetName);
        break;
      case "spriteSheetIndex":
        this.#parseSpriteSheetIndex(dataView);
        break;
      default:
        throw Error(`uncaught messageType ${messageType}`);
    }
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

  reset() {
    _console.log("clearing displayManager");
    // @ts-ignore
    this.#displayStatus = undefined;
    this.#isAvailable = false;
    this.#displayInformation = undefined;
    // @ts-ignore
    this.#brightness = undefined;
    this.#displayContextCommandBuffers = [];
    this.#isAvailable = false;

    this.#contextStateHelper.reset();
    this.#colors.length = 0;
    this.#opacities.length = 0;

    this.#isReady = true;
    this.#pendingSpriteSheet = undefined;
    this.#pendingSpriteSheetName = undefined;

    this.isServerSide = false;

    Object.keys(this.#spriteSheetIndices).forEach(
      (spriteSheetName) => delete this.#spriteSheetIndices[spriteSheetName]
    );
    Object.keys(this.#spriteSheets).forEach(
      (spriteSheetName) => delete this.#spriteSheets[spriteSheetName]
    );
  }

  async fontToSpriteSheet(
    font: Font,
    fontSize: number,
    spriteSheetName?: string
  ) {
    return fontToSpriteSheet(this, font, fontSize, spriteSheetName);
  }

  // MTU
  #mtu!: number;
  get mtu() {
    return this.#mtu;
  }
  set mtu(newMtu: number) {
    this.#mtu = newMtu;
  }

  // SERVER SIDE
  #isServerSide = false;
  get isServerSide() {
    return this.#isServerSide;
  }
  set isServerSide(newIsServerSide) {
    if (this.#isServerSide == newIsServerSide) {
      _console.log("redundant isServerSide assignment");
      return;
    }
    _console.log({ newIsServerSide });
    this.#isServerSide = newIsServerSide;
  }
}

export default DisplayManager;
