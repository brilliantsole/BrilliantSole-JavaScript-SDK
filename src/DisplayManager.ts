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
  minDisplayScale,
  assertValidAlignment,
  DisplayAlignmentDirectionToCommandType,
  DisplayAlignmentDirectionToStateKey,
  assertValidDirection,
  assertValidAlignmentDirection,
  assertValidWireframe,
  trimWireframe,
  assertValidNumberOfControlPoints,
  assertValidPathNumberOfControlPoints,
  assertValidPath,
  isWireframePolygon,
  DisplayColorRGBOrString,
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
  DefaultDisplayContextState,
  DisplayAlignment,
  DisplayAlignmentDirection,
  DisplayContextState,
  DisplayContextStateKey,
  DisplayDirection,
  DisplaySegmentCap,
  isDirectionHorizontal,
  isDirectionPositive,
  PartialDisplayContextState,
} from "./utils/DisplayContextState.ts";
import {
  DisplayContextCommand,
  DisplayContextCommandType,
  DisplayContextCommandTypes,
  parseDisplayContextCommands,
  serializeDisplayContextCommand,
  serializeDisplayContextCommandData,
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
  getSpriteSheetByIndex,
  getSpriteSheetPalette,
  getSpriteSheetPaletteSwap,
  runDisplayContextCommand,
  runDisplayContextCommands,
  selectSpritePaletteSwap,
  selectSpriteSheetPalette,
  selectSpriteSheetPaletteSwap,
  serializeColors,
  serializeOpacities,
} from "./utils/DisplayManagerInterface.ts";
import { SendFileCallback } from "./FileTransferManager.ts";
import { textDecoder, textEncoder } from "./utils/Text.ts";
import {
  DisplaySprite,
  DisplaySpritePaletteSwap,
  DisplaySpriteSheetPalette,
  DisplaySpriteSheetPaletteSwap,
  serializeSpriteSheet,
  DisplaySpriteSheet,
  DisplaySpriteLines,
  stringToSpriteLines,
  stringToSpriteLinesMetrics,
  spriteLinesToSerializedLines,
  getSpriteLinesMetrics,
} from "./utils/DisplaySpriteSheetUtils.ts";
import { wait } from "./utils/Timer.ts";
import { default as DisplayCanvasHelper } from "./utils/DisplayCanvasHelper.ts";

const _console = createConsole("DisplayManager", { log: false });

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

export type DisplayWireframeEdge = {
  startIndex: number;
  endIndex: number;
};
export type DisplaySegment = {
  start: Vector2;
  end: Vector2;
};
export type DisplayWireframe = {
  points: Vector2[];
  edges: DisplayWireframeEdge[];
};

export const DisplayBezierCurveTypes = [
  "segment",
  "quadratic",
  "cubic",
] as const;
export type DisplayBezierCurveType = (typeof DisplayBezierCurveTypes)[number];
export type DisplayBezierCurve = {
  type: DisplayBezierCurveType;
  controlPoints: Vector2[];
};

export const displayCurveTypeBitWidth = 2;
export const displayCurveTypesPerByte = 8 / displayCurveTypeBitWidth;

export const DisplayPointDataTypes = ["int8", "int16", "float"] as const;
export type DisplayPointDataType = (typeof DisplayPointDataTypes)[number];
export const displayPointDataTypeToSize: Record<DisplayPointDataType, number> =
  {
    int8: 1 * 2,
    int16: 2 * 2,
    float: 4 * 2,
  };
export const displayPointDataTypeToRange: Record<
  DisplayPointDataType,
  { min: number; max: number }
> = {
  int8: { min: -(2 ** 7), max: 2 ** 7 - 1 },
  int16: { min: -(2 ** 15), max: 2 ** 15 - 1 },
  float: { min: -Infinity, max: Infinity },
};

export const DisplayInformationValues = {
  type: DisplayTypes,
  pixelDepth: DisplayPixelDepths,
};

export const RequiredDisplayMessageTypes: DisplayMessageType[] = [
  // "displayReady",
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
  displayContextCommands: {
    displayContextCommands: DisplayContextCommand[];
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

function ForwardToHelper(
  originalMethod: Function,
  context: ClassMethodDecoratorContext,
) {
  return function (this: any, ...args: any[]) {
    const helper = this.displayCanvasHelper;

    if (helper && helper !== args[args.length - 1]) {
      return helper[context.name as string](...args);
    }

    return originalMethod.apply(this, args);
  };
}

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

  #parseIsDisplayAvailable(dataView: DataView<ArrayBuffer>) {
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
  #resetContextState(
    keepColorIndices?: boolean,
    keepSpriteColorIndices?: boolean,
  ) {
    _console.log("resetContextState", {
      keepColorIndices,
      keepSpriteColorIndices,
    });
    this.#contextStateHelper.reset(
      this.numberOfColors,
      keepColorIndices,
      keepSpriteColorIndices,
    );
  }
  #onContextStateUpdate(differences: DisplayContextStateKey[]) {
    this.#dispatchEvent("displayContextState", {
      displayContextState: structuredClone(this.contextState),
      differences,
    });
  }
  serializeContextState() {
    return this.#contextStateHelper.serialize(this.numberOfColors);
  }
  @ForwardToHelper
  async setContextState(
    newState: PartialDisplayContextState,
    sendImmediately?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    const contextCommands = this.#contextStateHelper.serialize(
      this.numberOfColors,
      newState,
    );
    if (contextCommands.length == 0) {
      return;
    }
    await this.runContextCommands(contextCommands, sendImmediately);
  }

  // DISPLAY STATUS
  #displayStatus!: DisplayStatus;
  get displayStatus() {
    return this.#displayStatus;
  }
  get isDisplayAwake() {
    return this.#displayStatus == "awake";
  }
  #parseDisplayStatus(dataView: DataView<ArrayBuffer>) {
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
    sendImmediately?: boolean,
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
      sendImmediately,
    );

    await promise;
  }
  #assertIsAwake() {
    _console.assertWithError(
      this.#displayStatus == "awake",
      `display is not awake - currently ${this.#displayStatus}`,
    );
  }
  #assertIsNotAwake() {
    _console.assertWithError(
      this.#displayStatus != "awake",
      `display is awake`,
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
    return 2 ** Number(this.pixelDepth ?? 0);
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

  #parseDisplayInformation(dataView: DataView<ArrayBuffer>) {
    // @ts-expect-error
    const parsedDisplayInformation: DisplayInformation = {};

    let byteOffset = 0;
    while (byteOffset < dataView.byteLength) {
      const displayInformationTypeIndex = dataView.getUint8(byteOffset++);
      const displayInformationType =
        DisplayInformationTypes[displayInformationTypeIndex];
      _console.assertWithError(
        displayInformationType,
        `invalid displayInformationTypeIndex ${displayInformationType}`,
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
      (type) => !(type in parsedDisplayInformation),
    );
    _console.assertWithError(
      !missingDisplayInformationType,
      `missingDisplayInformationType ${missingDisplayInformationType}`,
    );
    this.#displayInformation = parsedDisplayInformation;
    this.#colors = new Array(this.numberOfColors).fill("#000000");
    this.#opacities = new Array(this.numberOfColors).fill(1);
    this.contextState.bitmapColorIndices = new Array(this.numberOfColors).fill(
      0,
    );
    this.contextState.spriteColorIndices = new Array(this.numberOfColors).fill(
      0,
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

  #parseDisplayBrightness(dataView: DataView<ArrayBuffer>) {
    const newDisplayBrightnessEnum = dataView.getUint8(0);
    const newDisplayBrightness = DisplayBrightnesses[newDisplayBrightnessEnum];
    assertValidDisplayBrightness(newDisplayBrightness);

    this.#brightness = newDisplayBrightness;
    _console.log({ displayBrightness: this.#brightness });
    this.#dispatchEvent("getDisplayBrightness", {
      displayBrightness: this.#brightness,
    });
  }
  @ForwardToHelper
  async setBrightness(
    newDisplayBrightness: DisplayBrightness,
    sendImmediately?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
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
      sendImmediately,
    );
    await promise;
  }

  // DISPLAY CONTEXT
  get #maxCommandDataLength() {
    return this.mtu - 7;
  }
  #contextCommandBuffers: ArrayBuffer[] = [];
  #contextCommands: DisplayContextCommand[] = [];
  async #sendContextCommand(
    contextCommand: DisplayContextCommand,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    _console.log("sendContextCommand", contextCommand, {
      sendImmediately,
      isSending,
    });

    if (!isSending) {
      const serializedContextCommand = serializeDisplayContextCommand(
        this,
        contextCommand,
      );
      if (!serializedContextCommand) {
        return;
      }

      if (serializedContextCommand.byteLength > this.#maxCommandDataLength) {
        _console.error(
          `serializedContextCommand ${serializedContextCommand.byteLength} too large (max ${
            this.#maxCommandDataLength
          })`,
        );
        return;
      }

      const newLength = this.#contextCommandBuffers.reduce(
        (sum, buffer) => sum + buffer.byteLength,
        serializedContextCommand.byteLength,
      );
      if (newLength > this.#maxCommandDataLength) {
        _console.log("displayContextCommandBuffers too full - sending now");
        await this.#sendContextCommands();
      }
      this.#contextCommandBuffers.push(serializedContextCommand);
    }
    this.#contextCommands.push(contextCommand);

    if (sendImmediately) {
      await this.#sendContextCommands();
    }
  }
  async #sendContextCommands() {
    const displayContextCommands = this.#contextCommands.slice();
    _console.log("sendContextCommands", { displayContextCommands });
    if (displayContextCommands.length == 0) {
      return;
    }
    this.#contextCommands.length = 0;
    if (this.#contextCommandBuffers.length > 0) {
      const data = concatenateArrayBuffers(this.#contextCommandBuffers);
      _console.log(
        `sending displayContextCommands`,
        this.#contextCommandBuffers.slice(),
        data,
      );
      this.#contextCommandBuffers.length = 0;

      await this.sendMessage([{ type: "displayContextCommands", data }], true);
    }
    this.#dispatchEvent("displayContextCommands", {
      displayContextCommands,
    });
  }
  async flushContextCommands() {
    await this.#sendContextCommands();
  }
  @ForwardToHelper
  async show(
    sendImmediately = true,
    waitUntilReady = false,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    _console.log("showDisplay", { sendImmediately, waitUntilReady, isSending });

    let promise: Promise<DisplayEventMessages["displayReady"]> | undefined;
    if (waitUntilReady) {
      promise = this.waitForEvent("displayReady");
    }

    this.#isReady = false;
    this.#lastShowRequestTime = Date.now();
    await this.#sendContextCommand(
      { type: "show" },
      sendImmediately,
      isSending,
    );

    if (isSending) {
      // await this.#onDisplayReady();
      this.#isReady = true;
    } else if (waitUntilReady) {
      await promise;
    }
  }
  @ForwardToHelper
  async clear(
    sendImmediately = true,
    waitUntilReady = false,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    _console.log("clearDisplay", {
      sendImmediately,
      waitUntilReady,
      isSending,
    });

    let promise: Promise<DisplayEventMessages["displayReady"]> | undefined;
    if (waitUntilReady) {
      promise = this.waitForEvent("displayReady");
    }

    this.#isReady = false;
    this.#lastShowRequestTime = Date.now();
    await this.#sendContextCommand(
      { type: "clear" },
      sendImmediately,
      isSending,
    );

    if (isSending) {
      // await this.#onDisplayReady();
      this.#isReady = true;
    } else if (waitUntilReady) {
      await promise;
    }
  }

  assertValidColorIndex(colorIndex: number) {
    _console.assertRangeWithError(
      "colorIndex",
      colorIndex,
      0,
      this.numberOfColors,
    );
  }
  #colors: string[] = [];
  get colors() {
    return this.#colors;
  }
  @ForwardToHelper
  async setColor(
    colorIndex: number,
    color: DisplayColorRGBOrString,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    if (typeof color == "string") {
      color = stringToRGB(color);
    } else {
      color = color;
    }

    const colorHex = rgbToHex(color);
    if (this.colors[colorIndex] == colorHex) {
      // _console.log(`redundant color #${colorIndex} ${colorHex}`);
      return;
    }

    await this.#sendContextCommand(
      { type: "setColor", color, colorIndex },
      sendImmediately,
      isSending,
    );

    this.colors[colorIndex] = colorHex;
    this.#dispatchEvent("displayColor", {
      colorIndex,
      color,
      colorHex,
    });
  }
  serializeColors(): DisplayContextCommand[] {
    return serializeColors(this);
  }
  #opacities: number[] = [];
  get opacities() {
    return this.#opacities;
  }
  serializeOpacities(): DisplayContextCommand[] {
    return serializeOpacities(this);
  }
  @ForwardToHelper
  async setColorOpacity(
    colorIndex: number,
    opacity: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    if (
      Math.floor(255 * this.#opacities[colorIndex]) == Math.floor(255 * opacity)
    ) {
      // _console.log(`redundant opacity #${colorIndex} ${opacity}`);
      return;
    }

    await this.#sendContextCommand(
      { type: "setColorOpacity", colorIndex, opacity },
      sendImmediately,
      isSending,
    );
    this.#opacities[colorIndex] = opacity;
    this.#dispatchEvent("displayColorOpacity", { colorIndex, opacity });
  }
  @ForwardToHelper
  async setOpacity(
    opacity: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    if (this.opacities.every((_opacity) => opacity == _opacity)) {
      // _console.log(`redundant opacity ${opacity}`);
      return;
    }
    await this.#sendContextCommand(
      { type: "setOpacity", opacity },
      sendImmediately,
      isSending,
    );
    this.#opacities.fill(opacity);
    this.#dispatchEvent("displayOpacity", { opacity });
  }

  #contextStack: DisplayContextState[] = [];
  async #saveContext(sendImmediately?: boolean) {
    this.#contextStack.push(structuredClone(this.contextState));
  }
  @ForwardToHelper
  async saveContext(
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    if (true) {
      await this.#saveContext(sendImmediately);
    } else {
      await this.#sendContextCommand(
        { type: "saveContext" },
        sendImmediately,
        isSending,
      );
    }
  }
  async #restoreContext(sendImmediately?: boolean) {
    const contextState = this.#contextStack.pop();
    if (!contextState) {
      _console.warn("#contextStack empty");
      return;
    }
    await this.setContextState(contextState, sendImmediately);
  }
  @ForwardToHelper
  async restoreContext(
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    if (false) {
      await this.#restoreContext(sendImmediately);
    } else {
      await this.#sendContextCommand(
        { type: "restoreContext" },
        sendImmediately,
        isSending,
      );
    }
  }
  async #clearContext(sendImmediately?: boolean) {
    const contextState = this.#contextStack.pop();
    if (!contextState) {
      _console.warn("#contextStack empty");
      return;
    }
    // FILL
    await this.setContextState(contextState, sendImmediately);
  }
  @ForwardToHelper
  async clearContext(
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    await this.#clearContext(sendImmediately);
    await this.#sendContextCommand(
      { type: "clearContext" },
      sendImmediately,
      isSending,
    );
  }

  @ForwardToHelper
  async selectFillColor(
    fillColorIndex: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    this.assertValidColorIndex(fillColorIndex);
    const differences = this.#contextStateHelper.update({
      fillColorIndex,
    });
    if (differences.length == 0) {
      return;
    }
    await this.#sendContextCommand(
      { type: "selectFillColor", fillColorIndex },
      sendImmediately,
      isSending,
    );
    this.#onContextStateUpdate(differences);
  }
  @ForwardToHelper
  async selectBackgroundColor(
    backgroundColorIndex: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    this.assertValidColorIndex(backgroundColorIndex);
    const differences = this.#contextStateHelper.update({
      backgroundColorIndex,
    });
    if (differences.length == 0) {
      return;
    }
    await this.#sendContextCommand(
      { type: "selectBackgroundColor", backgroundColorIndex },
      sendImmediately,
      isSending,
    );
    this.#onContextStateUpdate(differences);
  }
  @ForwardToHelper
  async selectLineColor(
    lineColorIndex: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    this.assertValidColorIndex(lineColorIndex);
    const differences = this.#contextStateHelper.update({
      lineColorIndex,
    });
    if (differences.length == 0) {
      return;
    }
    await this.#sendContextCommand(
      { type: "selectLineColor", lineColorIndex },
      sendImmediately,
      isSending,
    );
    this.#onContextStateUpdate(differences);
  }
  @ForwardToHelper
  async setIgnoreFill(
    ignoreFill: boolean,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    const differences = this.#contextStateHelper.update({
      ignoreFill,
    });
    if (differences.length == 0) {
      return;
    }
    await this.#sendContextCommand(
      { type: "setIgnoreFill", ignoreFill },
      sendImmediately,
      isSending,
    );
    this.#onContextStateUpdate(differences);
  }
  @ForwardToHelper
  async setIgnoreLine(
    ignoreLine: boolean,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    const differences = this.#contextStateHelper.update({
      ignoreLine,
    });
    if (differences.length == 0) {
      return;
    }
    await this.#sendContextCommand(
      { type: "setIgnoreLine", ignoreLine },
      sendImmediately,
      isSending,
    );
    this.#onContextStateUpdate(differences);
  }
  @ForwardToHelper
  async setFillBackground(
    fillBackground: boolean,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    const differences = this.#contextStateHelper.update({
      fillBackground,
    });
    if (differences.length == 0) {
      return;
    }
    await this.#sendContextCommand(
      { type: "setFillBackground", fillBackground },
      sendImmediately,
      isSending,
    );
    this.#onContextStateUpdate(differences);
  }
  assertValidLineWidth(lineWidth: number) {
    _console.assertRangeWithError(
      "lineWidth",
      lineWidth,
      0,
      Math.max(this.width, this.height),
    );
  }
  @ForwardToHelper
  async setLineWidth(
    lineWidth: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    this.assertValidLineWidth(lineWidth);
    const differences = this.#contextStateHelper.update({
      lineWidth,
    });
    if (differences.length == 0) {
      return;
    }
    await this.#sendContextCommand(
      { type: "setLineWidth", lineWidth },
      sendImmediately,
      isSending,
    );
    this.#onContextStateUpdate(differences);
  }

  @ForwardToHelper
  async setAlignment(
    alignmentDirection: DisplayAlignmentDirection,
    alignment: DisplayAlignment,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    assertValidAlignmentDirection(alignmentDirection);
    const alignmentCommand =
      DisplayAlignmentDirectionToCommandType[alignmentDirection];
    const alignmentKey =
      DisplayAlignmentDirectionToStateKey[alignmentDirection];
    const differences = this.#contextStateHelper.update({
      [alignmentKey]: alignment,
    });
    _console.log({ alignmentKey, alignment, differences });
    if (differences.length == 0) {
      return;
    }
    await this.#sendContextCommand(
      // @ts-expect-error
      { type: alignmentCommand, [alignmentKey]: alignment },
      sendImmediately,
      isSending,
    );
    this.#onContextStateUpdate(differences);
  }
  @ForwardToHelper
  async setHorizontalAlignment(
    horizontalAlignment: DisplayAlignment,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    await this.setAlignment(
      "horizontal",
      horizontalAlignment,
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async setVerticalAlignment(
    verticalAlignment: DisplayAlignment,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    await this.setAlignment(
      "vertical",
      verticalAlignment,
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async resetAlignment(
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    const differences = this.#contextStateHelper.update({
      verticalAlignment: DefaultDisplayContextState.verticalAlignment,
      horizontalAlignment: DefaultDisplayContextState.horizontalAlignment,
    });
    if (differences.length == 0) {
      return;
    }
    await this.#sendContextCommand(
      { type: "resetAlignment" },
      sendImmediately,
      isSending,
    );
    this.#onContextStateUpdate(differences);
  }

  @ForwardToHelper
  async setRotation(
    rotation: number,
    isRadians?: boolean,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
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
    await this.#sendContextCommand(
      { type: "setRotation", rotation, isRadians },
      sendImmediately,
      isSending,
    );

    this.#onContextStateUpdate(differences);
  }
  @ForwardToHelper
  async clearRotation(
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    const differences = this.#contextStateHelper.update({
      rotation: 0,
    });
    if (differences.length == 0) {
      return;
    }
    await this.#sendContextCommand(
      { type: "clearRotation" },
      sendImmediately,
      isSending,
    );
    this.#onContextStateUpdate(differences);
  }
  @ForwardToHelper
  async setSegmentStartCap(
    segmentStartCap: DisplaySegmentCap,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    assertValidSegmentCap(segmentStartCap);
    const differences = this.#contextStateHelper.update({
      segmentStartCap,
    });
    if (differences.length == 0) {
      return;
    }
    await this.#sendContextCommand(
      { type: "setSegmentStartCap", segmentStartCap },
      sendImmediately,
      isSending,
    );
    this.#onContextStateUpdate(differences);
  }
  @ForwardToHelper
  async setSegmentEndCap(
    segmentEndCap: DisplaySegmentCap,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    assertValidSegmentCap(segmentEndCap);
    const differences = this.#contextStateHelper.update({
      segmentEndCap,
    });
    if (differences.length == 0) {
      return;
    }
    await this.#sendContextCommand(
      { type: "setSegmentEndCap", segmentEndCap },
      sendImmediately,
      isSending,
    );
    this.#onContextStateUpdate(differences);
  }
  @ForwardToHelper
  async setSegmentCap(
    segmentCap: DisplaySegmentCap,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    assertValidSegmentCap(segmentCap);
    const differences = this.#contextStateHelper.update({
      segmentStartCap: segmentCap,
      segmentEndCap: segmentCap,
    });
    if (differences.length == 0) {
      return;
    }
    await this.#sendContextCommand(
      { type: "setSegmentCap", segmentCap },
      sendImmediately,
      isSending,
    );
    this.#onContextStateUpdate(differences);
  }
  @ForwardToHelper
  async setSegmentStartRadius(
    segmentStartRadius: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    const differences = this.#contextStateHelper.update({
      segmentStartRadius,
    });
    if (differences.length == 0) {
      return;
    }
    await this.#sendContextCommand(
      { type: "setSegmentStartRadius", segmentStartRadius },
      sendImmediately,
      isSending,
    );
    this.#onContextStateUpdate(differences);
  }
  @ForwardToHelper
  async setSegmentEndRadius(
    segmentEndRadius: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    const differences = this.#contextStateHelper.update({
      segmentEndRadius,
    });
    if (differences.length == 0) {
      return;
    }
    await this.#sendContextCommand(
      { type: "setSegmentEndRadius", segmentEndRadius },
      sendImmediately,
      isSending,
    );
    this.#onContextStateUpdate(differences);
  }
  @ForwardToHelper
  async setSegmentRadius(
    segmentRadius: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    const differences = this.#contextStateHelper.update({
      segmentStartRadius: segmentRadius,
      segmentEndRadius: segmentRadius,
    });
    if (differences.length == 0) {
      return;
    }
    await this.#sendContextCommand(
      { type: "setSegmentRadius", segmentRadius },
      sendImmediately,
      isSending,
    );
    this.#onContextStateUpdate(differences);
  }
  @ForwardToHelper
  async setCrop(
    cropDirection: DisplayCropDirection,
    crop: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
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
    await this.#sendContextCommand(
      // @ts-expect-error
      { type: cropCommand, [cropKey]: crop },
      sendImmediately,
      isSending,
    );
    this.#onContextStateUpdate(differences);
  }
  @ForwardToHelper
  async setCropTop(
    cropTop: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    await this.setCrop("top", cropTop, sendImmediately, isSending);
  }
  @ForwardToHelper
  async setCropRight(
    cropRight: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    await this.setCrop("right", cropRight, sendImmediately, isSending);
  }
  @ForwardToHelper
  async setCropBottom(
    cropBottom: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    await this.setCrop("bottom", cropBottom, sendImmediately, isSending);
  }
  @ForwardToHelper
  async setCropLeft(
    cropLeft: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    await this.setCrop("left", cropLeft, sendImmediately, isSending);
  }
  @ForwardToHelper
  async clearCrop(
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    const differences = this.#contextStateHelper.update({
      cropTop: 0,
      cropRight: 0,
      cropBottom: 0,
      cropLeft: 0,
    });
    if (differences.length == 0) {
      return;
    }
    await this.#sendContextCommand(
      { type: "clearCrop" },
      sendImmediately,
      isSending,
    );
    this.#onContextStateUpdate(differences);
  }
  @ForwardToHelper
  async setRotationCrop(
    cropDirection: DisplayCropDirection,
    crop: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
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
    await this.#sendContextCommand(
      // @ts-expect-error
      { type: cropCommand, [cropKey]: crop },
      sendImmediately,
      isSending,
    );
    this.#onContextStateUpdate(differences);
  }
  @ForwardToHelper
  async setRotationCropTop(
    rotationCropTop: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    await this.setRotationCrop(
      "top",
      rotationCropTop,
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async setRotationCropRight(
    rotationCropRight: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    await this.setRotationCrop(
      "right",
      rotationCropRight,
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async setRotationCropBottom(
    rotationCropBottom: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    await this.setRotationCrop(
      "bottom",
      rotationCropBottom,
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async setRotationCropLeft(
    rotationCropLeft: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    await this.setRotationCrop(
      "left",
      rotationCropLeft,
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async clearRotationCrop(
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    const differences = this.#contextStateHelper.update({
      rotationCropTop: 0,
      rotationCropRight: 0,
      rotationCropBottom: 0,
      rotationCropLeft: 0,
    });
    if (differences.length == 0) {
      return;
    }
    await this.#sendContextCommand(
      { type: "clearRotationCrop" },
      sendImmediately,
      isSending,
    );
    this.#onContextStateUpdate(differences);
  }

  @ForwardToHelper
  async selectBitmapColor(
    bitmapColorIndex: number,
    colorIndex: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
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
    await this.#sendContextCommand(
      { type: "selectBitmapColor", bitmapColorIndex, colorIndex },
      sendImmediately,
      isSending,
    );
    this.#onContextStateUpdate(differences);
  }
  get bitmapColorIndices() {
    return this.contextState.bitmapColorIndices;
  }
  get bitmapColors() {
    return this.bitmapColorIndices.map((colorIndex) => this.colors[colorIndex]);
  }
  @ForwardToHelper
  async selectBitmapColors(
    bitmapColorPairs: DisplayBitmapColorPair[],
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    _console.assertRangeWithError(
      "bitmapColors",
      bitmapColorPairs.length,
      1,
      this.numberOfColors,
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
    await this.#sendContextCommand(
      { type: "selectBitmapColors", bitmapColorPairs },
      sendImmediately,
      isSending,
    );
    this.#onContextStateUpdate(differences);
  }
  @ForwardToHelper
  async setBitmapColor(
    bitmapColorIndex: number,
    color: DisplayColorRGBOrString,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    return this.setColor(
      this.bitmapColorIndices[bitmapColorIndex],
      color,
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async setBitmapColorOpacity(
    bitmapColorIndex: number,
    opacity: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    return this.setColorOpacity(
      this.bitmapColorIndices[bitmapColorIndex],
      opacity,
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async setBitmapScaleDirection(
    direction: DisplayScaleDirection,
    bitmapScale: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
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
    const dataView = serializeDisplayContextCommandData(this, command);
    if (!dataView) {
      return;
    }
    await this.#sendContextCommand(command, sendImmediately, isSending);

    this.#onContextStateUpdate(differences);
  }
  @ForwardToHelper
  async setBitmapScaleX(
    bitmapScaleX: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    return this.setBitmapScaleDirection(
      "x",
      bitmapScaleX,
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async setBitmapScaleY(
    bitmapScaleY: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    return this.setBitmapScaleDirection(
      "y",
      bitmapScaleY,
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async setBitmapScale(
    bitmapScale: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    return this.setBitmapScaleDirection(
      "all",
      bitmapScale,
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async resetBitmapScale(
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    //return this.setBitmapScaleDirection("all", 1, sendImmediately);

    const differences = this.#contextStateHelper.update({
      bitmapScaleX: 1,
      bitmapScaleY: 1,
    });
    if (differences.length == 0) {
      return;
    }
    await this.#sendContextCommand(
      { type: "resetBitmapScale" },
      sendImmediately,
      isSending,
    );
    this.#onContextStateUpdate(differences);
  }
  @ForwardToHelper
  async selectSpriteColor(
    spriteColorIndex: number,
    colorIndex: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
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
    await this.#sendContextCommand(
      { type: "selectSpriteColor", spriteColorIndex, colorIndex },
      sendImmediately,
      isSending,
    );
    this.#onContextStateUpdate(differences);
  }
  get spriteColorIndices() {
    return this.contextState.spriteColorIndices;
  }
  get spriteColors() {
    return this.spriteColorIndices.map((colorIndex) => this.colors[colorIndex]);
  }
  @ForwardToHelper
  async selectSpriteColors(
    spriteColorPairs: DisplaySpriteColorPair[],
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    _console.assertRangeWithError(
      "spriteColors",
      spriteColorPairs.length,
      1,
      this.numberOfColors,
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
    await this.#sendContextCommand(
      { type: "selectSpriteColors", spriteColorPairs },
      sendImmediately,
      isSending,
    );
    this.#onContextStateUpdate(differences);
  }
  @ForwardToHelper
  async setSpriteColor(
    spriteColorIndex: number,
    color: DisplayColorRGBOrString,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    return this.setColor(
      this.spriteColorIndices[spriteColorIndex],
      color,
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async setSpriteColorOpacity(
    spriteColorIndex: number,
    opacity: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    return this.setColorOpacity(
      this.spriteColorIndices[spriteColorIndex],
      opacity,
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async resetSpriteColors(
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    const spriteColorIndices = new Array(this.numberOfColors).fill(0);
    const differences = this.#contextStateHelper.update({
      spriteColorIndices,
    });
    if (differences.length == 0) {
      return;
    }
    await this.#sendContextCommand(
      { type: "resetSpriteColors" },
      sendImmediately,
      isSending,
    );
    this.#onContextStateUpdate(differences);
  }
  @ForwardToHelper
  async setSpriteScaleDirection(
    direction: DisplayScaleDirection,
    spriteScale: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    spriteScale = clamp(spriteScale, minDisplayScale, maxDisplayScale);
    spriteScale = roundScale(spriteScale);
    _console.log({ direction, spriteScale });
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
    const dataView = serializeDisplayContextCommandData(this, command);
    if (!dataView) {
      return;
    }
    await this.#sendContextCommand(command, sendImmediately, isSending);

    this.#onContextStateUpdate(differences);
  }
  @ForwardToHelper
  async setSpriteScaleX(
    spriteScaleX: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    return this.setSpriteScaleDirection(
      "x",
      spriteScaleX,
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async setSpriteScaleY(
    spriteScaleY: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    return this.setSpriteScaleDirection(
      "y",
      spriteScaleY,
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async setSpriteScale(
    spriteScale: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    return this.setSpriteScaleDirection(
      "all",
      spriteScale,
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async resetSpriteScale(
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    //return this.setSpriteScaleDirection("all", 1, sendImmediately);

    const differences = this.#contextStateHelper.update({
      spriteScaleX: 1,
      spriteScaleY: 1,
    });
    if (differences.length == 0) {
      return;
    }
    await this.#sendContextCommand(
      { type: "resetSpriteScale" },
      sendImmediately,
      isSending,
    );
    this.#onContextStateUpdate(differences);
  }
  @ForwardToHelper
  async setSpritesLineHeight(
    spritesLineHeight: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    spritesLineHeight = Math.round(spritesLineHeight);
    this.assertValidLineWidth(spritesLineHeight);
    const differences = this.#contextStateHelper.update({
      spritesLineHeight,
    });
    if (differences.length == 0) {
      return;
    }
    await this.#sendContextCommand(
      { type: "setSpritesLineHeight", spritesLineHeight },
      sendImmediately,
      isSending,
    );
    this.#onContextStateUpdate(differences);
  }
  @ForwardToHelper
  async setSpritesDirectionGeneric(
    direction: DisplayDirection,
    isOrthogonal: boolean,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    assertValidDirection(direction);
    const stateKey: DisplayContextStateKey = isOrthogonal
      ? "spritesLineDirection"
      : "spritesDirection";
    const commandType: DisplayContextCommandType = isOrthogonal
      ? "setSpritesLineDirection"
      : "setSpritesDirection";

    const differences = this.#contextStateHelper.update({
      [stateKey]: direction,
    });
    if (differences.length == 0) {
      return;
    }
    await this.#sendContextCommand(
      //@ts-expect-error
      { type: commandType, [stateKey]: direction },
      sendImmediately,
      isSending,
    );
    this.#onContextStateUpdate(differences);
  }
  @ForwardToHelper
  async setSpritesDirection(
    spritesDirection: DisplayDirection,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    await this.setSpritesDirectionGeneric(
      spritesDirection,
      false,
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async setSpritesLineDirection(
    spritesLineDirection: DisplayDirection,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    await this.setSpritesDirectionGeneric(
      spritesLineDirection,
      true,
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async setSpritesSpacingGeneric(
    spacing: number,
    isOrthogonal: boolean,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    const stateKey: DisplayContextStateKey = isOrthogonal
      ? "spritesLineSpacing"
      : "spritesSpacing";
    const commandType: DisplayContextCommandType = isOrthogonal
      ? "setSpritesLineSpacing"
      : "setSpritesSpacing";

    const differences = this.#contextStateHelper.update({
      [stateKey]: spacing,
    });
    if (differences.length == 0) {
      return;
    }
    await this.#sendContextCommand(
      //@ts-expect-error
      { type: commandType, [stateKey]: spacing },
      sendImmediately,
      isSending,
    );
    this.#onContextStateUpdate(differences);
  }
  @ForwardToHelper
  async setSpritesSpacing(
    spritesSpacing: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    await this.setSpritesSpacingGeneric(
      spritesSpacing,
      false,
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async setSpritesLineSpacing(
    spritesSpacing: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    await this.setSpritesSpacingGeneric(
      spritesSpacing,
      true,
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async setSpritesAlignmentGeneric(
    alignment: DisplayAlignment,
    isOrthogonal: boolean,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    assertValidAlignment(alignment);
    const stateKey: DisplayContextStateKey = isOrthogonal
      ? "spritesLineAlignment"
      : "spritesAlignment";
    const commandType: DisplayContextCommandType = isOrthogonal
      ? "setSpritesLineAlignment"
      : "setSpritesAlignment";
    const differences = this.#contextStateHelper.update({
      [stateKey]: alignment,
    });
    if (differences.length == 0) {
      return;
    }
    await this.#sendContextCommand(
      //@ts-expect-error
      {
        type: commandType,
        [stateKey]: alignment,
      },
      sendImmediately,
      isSending,
    );
    this.#onContextStateUpdate(differences);
  }
  @ForwardToHelper
  async setSpritesAlignment(
    spritesAlignment: DisplayAlignment,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    await this.setSpritesAlignmentGeneric(
      spritesAlignment,
      false,
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async setSpritesLineAlignment(
    spritesLineAlignment: DisplayAlignment,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    await this.setSpritesAlignmentGeneric(
      spritesLineAlignment,
      true,
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async clearRect(
    x: number,
    y: number,
    width: number,
    height: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    await this.#sendContextCommand(
      {
        type: "clearRect",
        x,
        y,
        width,
        height,
      },
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async drawRect(
    offsetX: number,
    offsetY: number,
    width: number,
    height: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    await this.#sendContextCommand(
      {
        type: "drawRect",
        offsetX,
        offsetY,
        width,
        height,
      },
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async drawRoundRect(
    offsetX: number,
    offsetY: number,
    width: number,
    height: number,
    borderRadius: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    await this.#sendContextCommand(
      {
        type: "drawRoundRect",
        offsetX,
        offsetY,
        width,
        height,
        borderRadius,
      },
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async drawCircle(
    offsetX: number,
    offsetY: number,
    radius: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    await this.#sendContextCommand(
      {
        type: "drawCircle",
        offsetX,
        offsetY,
        radius,
      },
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async drawEllipse(
    offsetX: number,
    offsetY: number,
    radiusX: number,
    radiusY: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    await this.#sendContextCommand(
      {
        type: "drawEllipse",
        offsetX,
        offsetY,
        radiusX,
        radiusY,
      },
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async drawRegularPolygon(
    offsetX: number,
    offsetY: number,
    radius: number,
    numberOfSides: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    await this.#sendContextCommand(
      {
        type: "drawRegularPolygon",
        offsetX,
        offsetY,
        radius,
        numberOfSides,
      },
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async drawPolygon(
    points: Vector2[],
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    _console.assertRangeWithError("numberOfPoints", points.length, 2, 255);
    await this.#sendContextCommand(
      { type: "drawPolygon", points },
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async drawWireframe(
    wireframe: DisplayWireframe,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    wireframe = trimWireframe(wireframe);
    if (wireframe.points.length == 0) {
      return;
    }
    assertValidWireframe(wireframe);
    if (this.#contextStateHelper.isSegmentUniform) {
      const polygon = isWireframePolygon(wireframe);
      if (polygon) {
        return this.drawSegments(polygon, sendImmediately);
      }
    }
    const commandType: DisplayContextCommandType = "drawWireframe";
    const dataView = serializeDisplayContextCommandData(this, {
      type: commandType,
      wireframe,
    });
    if (!dataView) {
      return;
    }
    // TODO: - split into sub-wireframes
    if (dataView.byteLength > this.#maxCommandDataLength) {
      _console.error(
        `wireframe data ${dataView.byteLength} too large (max ${
          this.#maxCommandDataLength
        })`,
      );
      return;
    }
    await this.#sendContextCommand(
      {
        type: "drawWireframe",
        wireframe,
      },
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async drawCurve(
    curveType: DisplayBezierCurveType,
    controlPoints: Vector2[],
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    assertValidNumberOfControlPoints(curveType, controlPoints);
    const commandType: DisplayContextCommandType =
      curveType == "cubic"
        ? "drawCubicBezierCurve"
        : "drawQuadraticBezierCurve";
    await this.#sendContextCommand(
      {
        type: commandType,
        controlPoints,
      },
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async drawCurves(
    curveType: DisplayBezierCurveType,
    controlPoints: Vector2[],
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    assertValidPathNumberOfControlPoints(curveType, controlPoints);
    const commandType: DisplayContextCommandType =
      curveType == "cubic"
        ? "drawCubicBezierCurves"
        : "drawQuadraticBezierCurves";
    const dataView = serializeDisplayContextCommandData(this, {
      type: commandType,
      controlPoints,
    });
    if (!dataView) {
      return;
    }
    // TODO: - split into sub-curves
    if (dataView.byteLength > this.#maxCommandDataLength) {
      _console.error(
        `curve data ${dataView.byteLength} too large (max ${
          this.#maxCommandDataLength
        })`,
      );
      return;
    }
    await this.#sendContextCommand(
      {
        type: commandType,
        controlPoints,
      },
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async drawQuadraticBezierCurve(
    controlPoints: Vector2[],
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    await this.drawCurve(
      "quadratic",
      controlPoints,
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async drawQuadraticBezierCurves(
    controlPoints: Vector2[],
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    await this.drawCurves(
      "quadratic",
      controlPoints,
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async drawCubicBezierCurve(
    controlPoints: Vector2[],
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    await this.drawCurve("cubic", controlPoints, sendImmediately, isSending);
  }
  @ForwardToHelper
  async drawCubicBezierCurves(
    controlPoints: Vector2[],
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    await this.drawCurves("cubic", controlPoints, sendImmediately, isSending);
  }

  @ForwardToHelper
  async _drawPath(
    isClosed: boolean,
    curves: DisplayBezierCurve[],
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    assertValidPath(curves);

    const commandType: DisplayContextCommandType = isClosed
      ? "drawClosedPath"
      : "drawPath";
    const dataView = serializeDisplayContextCommandData(this, {
      type: commandType,
      curves,
    });
    if (!dataView) {
      return;
    }
    // TODO: - split into sub-curves if not closed
    if (dataView.byteLength > this.#maxCommandDataLength) {
      _console.error(
        `path data ${dataView.byteLength} too large (max ${
          this.#maxCommandDataLength
        })`,
      );
      return;
    }
    await this.#sendContextCommand(
      {
        type: commandType,
        curves,
      },
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async drawPath(
    curves: DisplayBezierCurve[],
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    await this._drawPath(false, curves, sendImmediately, isSending);
  }
  @ForwardToHelper
  async drawClosedPath(
    curves: DisplayBezierCurve[],
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    await this._drawPath(true, curves, sendImmediately, isSending);
  }
  @ForwardToHelper
  async drawSegment(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    await this.#sendContextCommand(
      {
        type: "drawSegment",
        startX,
        startY,
        endX,
        endY,
      },
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async drawSegments(
    points: Vector2[],
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    _console.assertRangeWithError("numberOfPoints", points.length, 2, 255);
    const commandType: DisplayContextCommandType = "drawSegments";
    const dataView = serializeDisplayContextCommandData(this, {
      type: commandType,
      points,
    });
    if (!dataView) {
      return;
    }
    if (dataView.byteLength > this.#maxCommandDataLength) {
      const mid = Math.floor(points.length / 2);
      const firstHalf = points.slice(0, mid + 1);
      const secondHalf = points.slice(mid);
      _console.log({ firstHalf, secondHalf });
      _console.log("sending first half", firstHalf);
      await this.drawSegments(firstHalf, false);
      _console.log("sending second half", secondHalf);
      await this.drawSegments(secondHalf, sendImmediately);
    } else {
      await this.#sendContextCommand(
        {
          type: "drawSegments",
          points,
        },
        sendImmediately,
        isSending,
      );
    }
  }
  @ForwardToHelper
  async drawArc(
    offsetX: number,
    offsetY: number,
    radius: number,
    startAngle: number,
    angleOffset: number,
    isRadians?: boolean,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    await this.#sendContextCommand(
      {
        type: "drawArc",
        offsetX,
        offsetY,
        radius,
        startAngle,
        angleOffset,
        isRadians,
      },
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async drawArcEllipse(
    offsetX: number,
    offsetY: number,
    radiusX: number,
    radiusY: number,
    startAngle: number,
    angleOffset: number,
    isRadians?: boolean,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    await this.#sendContextCommand(
      {
        type: "drawArcEllipse",
        offsetX,
        offsetY,
        radiusX,
        radiusY,
        startAngle,
        angleOffset,
        isRadians,
      },
      sendImmediately,
      isSending,
    );
  }

  assertValidNumberOfColors(numberOfColors: number) {
    _console.assertRangeWithError(
      "numberOfColors",
      numberOfColors,
      2,
      this.numberOfColors,
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
      this.#maxCommandDataLength - drawBitmapHeaderLength,
    );
  }
  @ForwardToHelper
  async drawBitmap(
    offsetX: number,
    offsetY: number,
    bitmap: DisplayBitmap,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    this.assertValidBitmap(bitmap, true);
    await this.#sendContextCommand(
      { type: "drawBitmap", offsetX, offsetY, bitmap },
      sendImmediately,
      isSending,
    );
  }

  async imageToBitmap(
    image: HTMLImageElement,
    width: number,
    height: number,
    numberOfColors?: number,
  ) {
    return imageToBitmap(
      image,
      width,
      height,
      this.colors,
      this.bitmapColorIndices,
      numberOfColors,
    );
  }
  async quantizeImage(
    image: HTMLImageElement,
    width: number,
    height: number,
    numberOfColors: number,
  ) {
    return quantizeImage(image, width, height, numberOfColors);
  }
  async resizeAndQuantizeImage(
    image: HTMLImageElement,
    width: number,
    height: number,
    numberOfColors: number,
    colors?: string[],
  ) {
    return resizeAndQuantizeImage(image, width, height, numberOfColors, colors);
  }

  // CONTEXT COMMANDS

  async runContextCommand(
    command: DisplayContextCommand,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    _console.log("runContextCommand", command, {
      sendImmediately,
      isSending,
    });

    if (this.displayCanvasHelper) {
      await this.displayCanvasHelper.runContextCommand(
        command,
        sendImmediately,
        isSending,
      );
    } else {
      await runDisplayContextCommand(this, command, sendImmediately, isSending);
    }
  }
  async runContextCommands(
    commands: DisplayContextCommand[],
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    _console.log("runContextCommands", commands, {
      sendImmediately,
      isSending,
    });

    if (this.displayCanvasHelper) {
      await this.displayCanvasHelper.runContextCommands(
        commands,
        sendImmediately,
        isSending,
      );
    } else {
      await runDisplayContextCommands(
        this,
        commands,
        sendImmediately,
        isSending,
      );
    }
  }
  async parseContextCommands(
    dataView: DataView,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    _console.log("parseContextCommands", dataView, {
      sendImmediately,
      isSending,
    });

    if (this.displayCanvasHelper) {
      await this.displayCanvasHelper.parseContextCommands(
        dataView,
        sendImmediately,
        isSending,
      );
    } else {
      const contextCommands = parseDisplayContextCommands(this, dataView);
      await this.runContextCommands(
        contextCommands,
        sendImmediately,
        isSending,
      );
    }
  }

  #isReady = true;
  get isReady() {
    return this.isAvailable && this.#isReady;
  }
  #lastReadyTime = 0;
  #lastShowRequestTime = 0;
  #minReadyInterval = 60; // Forced delay due to Frame's fpga timing...
  #waitBeforeReady = true;
  async #onDisplayReady() {
    _console.log("onDisplayReady");
    const now = Date.now();
    const timeSinceLastDraw = now - this.#lastShowRequestTime;
    const timeSinceLastReady = now - this.#lastReadyTime;
    //_console.log(`${timeSinceLastReady}ms since last render`);
    _console.log(`${timeSinceLastDraw}ms draw time`);
    if (this.#waitBeforeReady && timeSinceLastReady < this.#minReadyInterval) {
      const timeToWait = this.#minReadyInterval - timeSinceLastReady;
      _console.log(`waiting ${timeToWait}ms`);
      await wait(timeToWait);
    }
    this.#isReady = true;
    this.#lastReadyTime = Date.now();
    this.#dispatchEvent("displayReady", {});
  }
  async #parseDisplayReady(dataView: DataView<ArrayBuffer>) {
    return this.#onDisplayReady();
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
  getSpriteSheetByIndex(index: number) {
    return getSpriteSheetByIndex(this, index);
  }
  async #setSpriteSheetName(
    spriteSheetName: string,
    sendImmediately?: boolean,
  ) {
    _console.log("setSpriteSheetName", { spriteSheetName, sendImmediately });
    if (typeof spriteSheetName == "number") {
      // @ts-expect-error
      spriteSheetName = spriteSheetName.toString();
    }
    _console.assertTypeWithError(spriteSheetName, "string");
    _console.assertRangeWithError(
      "newName",
      spriteSheetName.length,
      MinSpriteSheetNameLength,
      MaxSpriteSheetNameLength,
    );
    const setSpriteSheetNameData = textEncoder.encode(spriteSheetName);
    _console.log({ setSpriteSheetNameData });

    const promise = this.waitForEvent("getSpriteSheetName");
    this.sendMessage(
      [{ type: "setSpriteSheetName", data: setSpriteSheetNameData.buffer }],
      sendImmediately,
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
  @ForwardToHelper
  async uploadSpriteSheet(
    spriteSheet: DisplaySpriteSheet,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    if (spriteSheet.sprites.length == 0) {
      _console.log("no sprites in spriteSheet");
      return;
    }
    _console.log("uploadSpriteSheet", spriteSheet);
    if (this.#pendingSpriteSheet) {
      await this.waitForEvent("displaySpriteSheetUploadComplete");
      await this.uploadSpriteSheet(spriteSheet);
      return;
    }
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
    paletteName: string,
  ): DisplaySpriteSheetPalette | undefined {
    return getSpriteSheetPalette(this, paletteName);
  }
  getSpriteSheetPaletteSwap(
    paletteSwapName: string,
  ): DisplaySpriteSheetPaletteSwap | undefined {
    return getSpriteSheetPaletteSwap(this, paletteSwapName);
  }
  getSpritePaletteSwap(
    spriteName: string,
    paletteSwapName: string,
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
  @ForwardToHelper
  async selectSpriteSheet(
    spriteSheetName: string,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    this.assertLoadedSpriteSheet(spriteSheetName);
    const differences = this.#contextStateHelper.update({
      spriteSheetName,
    });
    if (differences.length == 0) {
      return;
    }
    const spriteSheetIndex = this.spriteSheetIndices[spriteSheetName];
    //_console.log("selecting", { spriteSheetIndex, spriteSheetName });
    await this.#sendContextCommand(
      { type: "selectSpriteSheet", spriteSheetIndex },
      sendImmediately,
      isSending,
    );
    this.#onContextStateUpdate(differences);
  }
  @ForwardToHelper
  async drawSprite(
    offsetX: number,
    offsetY: number,
    spriteName: string,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    _console.assertWithError(
      this.selectedSpriteSheet,
      "no spriteSheet selected",
    );
    _console.log(
      `drawing sprite "${spriteName}" in selectedSpriteSheet`,
      this.selectedSpriteSheet,
    );
    let spriteIndex = this.selectedSpriteSheet!.sprites.findIndex(
      (sprite) => sprite.name == spriteName,
    );
    _console.assertWithError(
      spriteIndex != -1,
      `sprite "${spriteName}" not found in spriteSheet`,
    );

    await this.#sendContextCommand(
      {
        type: "drawSprite",
        offsetX,
        offsetY,
        spriteIndex,
        use2Bytes: this.selectedSpriteSheet!.sprites.length > 255,
      },
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async drawSprites(
    offsetX: number,
    offsetY: number,
    spriteLines: DisplaySpriteLines,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    _console.assertWithError(
      this.contextState.spritesLineHeight > 0,
      `spritesLineHeight must be >0`,
    );
    const spriteSerializedLines = spriteLinesToSerializedLines(
      this,
      spriteLines,
    );
    _console.log("spriteSerializedLines", spriteSerializedLines);
    const commandType: DisplayContextCommandType = "drawSprites";
    const dataView = serializeDisplayContextCommandData(this, {
      type: commandType,
      offsetX,
      offsetY,
      spriteSerializedLines: spriteSerializedLines,
    });
    if (!dataView) {
      return;
    }
    if (dataView.byteLength > this.#maxCommandDataLength) {
      _console.log("breaking up sprites...");
      const mid = Math.floor(spriteLines.length / 2);
      const firstHalf = spriteLines.slice(0, mid);
      const secondHalf = spriteLines.slice(mid);
      // _console.log({ firstHalf, secondHalf });

      let firstHalfOffsetX = offsetX;
      let firstHalfOffsetY = offsetY;
      let secondHalfOffsetX = offsetX;
      let secondHalfOffsetY = offsetY;

      let didStartSprite = false;
      if (!this.#isDrawingBlankSprite) {
        didStartSprite = true;

        const { localSize } = getSpriteLinesMetrics(
          spriteLines,
          this.spriteSheets,
          this.contextState,
        );

        const {
          spritesLineHeight,
          spritesDirection,
          spritesLineDirection,
          spritesAlignment,
          spritesLineAlignment,
          spritesLineSpacing,
          spritesSpacing,
          horizontalAlignment,
          verticalAlignment,
        } = this.contextState;
        _console.log("starting sprites sprite...");
        await this.startSprite(
          offsetX,
          offsetY,
          localSize.width,
          localSize.height,
          false,
        );
        await this.setSpritesLineHeight(spritesLineHeight, false);
        await this.setSpritesDirection(spritesDirection, false);
        await this.setSpritesLineDirection(spritesLineDirection, false);
        await this.setSpritesAlignment(spritesAlignment, false);
        await this.setSpritesLineAlignment(spritesLineAlignment, false);
        await this.setSpritesSpacing(spritesSpacing, false);
        await this.setSpritesLineSpacing(spritesLineSpacing, false);
        await this.setHorizontalAlignment(horizontalAlignment, false);
        await this.setVerticalAlignment(verticalAlignment, false);

        switch (horizontalAlignment) {
          case "start":
            firstHalfOffsetX = -localSize.width / 2;
            break;
          case "center":
            firstHalfOffsetX = -localSize.width / 4;
            break;
          case "end":
            firstHalfOffsetX = 0;
            break;
        }

        switch (verticalAlignment) {
          case "start":
            firstHalfOffsetY = -localSize.height / 2;
            break;
          case "center":
            firstHalfOffsetY = -localSize.height / 4;
            break;
          case "end":
            firstHalfOffsetY = 0;
            break;
        }

        secondHalfOffsetX = firstHalfOffsetX;
        secondHalfOffsetY = firstHalfOffsetY;
      }

      _console.log("sending first half sprites", firstHalf);
      await this.drawSprites(
        firstHalfOffsetX,
        firstHalfOffsetY,
        firstHalf,
        false,
      );

      const { localSize: firstHalfSize } = getSpriteLinesMetrics(
        firstHalf,
        this.#spriteSheets,
        this.contextState,
      );

      const isSpritesLineDirectionPositive = isDirectionPositive(
        this.contextState.spritesLineDirection,
      );

      const isSpritesLineDirectionHorizontal = isDirectionHorizontal(
        this.contextState.spritesLineDirection,
      );

      const sign = isSpritesLineDirectionPositive ? 1 : -1;
      if (isSpritesLineDirectionHorizontal) {
        secondHalfOffsetX += firstHalfSize.width * sign;
      } else {
        secondHalfOffsetY += firstHalfSize.height * sign;
      }

      _console.log("sending second half sprites", secondHalf);
      await this.drawSprites(
        secondHalfOffsetX,
        secondHalfOffsetY,
        secondHalf,
        false,
      );
      if (didStartSprite) {
        _console.log("ending sprites sprite...");
        await this.endSprite(sendImmediately);
      }
    } else {
      await this.#sendContextCommand(
        { type: "drawSprites", spriteSerializedLines, offsetX, offsetY },
        sendImmediately,
        isSending,
      );
    }
  }

  @ForwardToHelper
  async drawSpritesString(
    offsetX: number,
    offsetY: number,
    string: string,
    requireAll?: boolean,
    maxLineBreadth?: number,
    separators?: string[],
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    const spriteLines = this.stringToSpriteLines(
      string,
      requireAll,
      maxLineBreadth,
      separators,
    );
    await this.drawSprites(
      offsetX,
      offsetY,
      spriteLines,
      sendImmediately,
      isSending,
    );
  }
  stringToSpriteLines(
    string: string,
    requireAll?: boolean,
    maxLineBreadth?: number,
    separators?: string[],
  ): DisplaySpriteLines {
    return stringToSpriteLines(
      string,
      this.spriteSheets,
      this.contextState,
      requireAll,
      maxLineBreadth,
      separators,
    );
  }
  stringToSpriteLinesMetrics(
    string: string,
    requireAll?: boolean,
    maxLineBreadth?: number,
    separators?: string[],
  ) {
    return stringToSpriteLinesMetrics(
      string,
      this.spriteSheets,
      this.contextState,
      requireAll,
      maxLineBreadth,
      separators,
    );
  }
  @ForwardToHelper
  async drawSpriteFromSpriteSheet(
    offsetX: number,
    offsetY: number,
    spriteName: string,
    spriteSheet: DisplaySpriteSheet,
    paletteName?: string,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    return drawSpriteFromSpriteSheet(
      this,
      offsetX,
      offsetY,
      spriteName,
      spriteSheet,
      paletteName,
      sendImmediately,
      isSending,
    );
  }

  #parseSpriteSheetIndex(dataView: DataView<ArrayBuffer>) {
    const spriteSheetIndex = dataView.getUint8(0);
    _console.log({
      pendingSpriteSheet: this.#pendingSpriteSheet,
      spriteSheetName: this.#pendingSpriteSheetName,
      spriteSheetIndex,
    });
    if (this.#pendingSpriteSheetName == undefined) {
      _console.log("pendingSpriteSheetName is undefined - skipping");
      return;
    }
    if (this.#pendingSpriteSheetName == undefined) {
      _console.log(
        "expected spriteSheetName when receiving spriteSheetIndex - skipping",
      );
      return;
    }
    if (this.#pendingSpriteSheet == undefined) {
      _console.log(
        "expected pendingSpriteSheet when receiving spriteSheetIndex - skipping",
      );
      return;
    }

    this.#spriteSheets[this.#pendingSpriteSheetName!] =
      this.#pendingSpriteSheet!;
    this.#spriteSheetIndices[this.#pendingSpriteSheetName!] = spriteSheetIndex;
    _console.log(
      `finished uploading "${this.#pendingSpriteSheetName!}" spriteSheet`,
    );
    this.#dispatchEvent("displaySpriteSheetUploadComplete", {
      spriteSheetName: this.#pendingSpriteSheetName!,
      spriteSheet: this.#pendingSpriteSheet!,
    });
    this.#pendingSpriteSheet = undefined;
  }

  // MESSAGE
  parseMessage(
    messageType: DisplayMessageType,
    dataView: DataView<ArrayBuffer>,
    isSending?: boolean,
  ) {
    _console.log({ messageType, isSending }, dataView);

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
        const spriteSheetName = textDecoder.decode(
          dataView.buffer as ArrayBuffer,
        );
        _console.log({ spriteSheetName });
        this.#updateSpriteSheetName(spriteSheetName);
        break;
      case "spriteSheetIndex":
        this.#parseSpriteSheetIndex(dataView);
        break;
      case "displayCommand":
        break;
      case "displayContextCommands":
        this.parseContextCommands(dataView, true, true);
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
  @ForwardToHelper
  async selectSpriteSheetPalette(
    paletteName: string,
    offset?: number,
    indicesOnly?: boolean,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    await selectSpriteSheetPalette(
      this,
      paletteName,
      offset,
      indicesOnly,
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async selectSpriteSheetPaletteSwap(
    paletteSwapName: string,
    offset?: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    await selectSpriteSheetPaletteSwap(
      this,
      paletteSwapName,
      offset,
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async selectSpritePaletteSwap(
    spriteName: string,
    paletteSwapName: string,
    offset?: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    await selectSpritePaletteSwap(
      this,
      spriteName,
      paletteSwapName,
      offset,
      sendImmediately,
      isSending,
    );
  }

  #isDrawingBlankSprite = false;
  @ForwardToHelper
  async startSprite(
    offsetX: number,
    offsetY: number,
    width: number,
    height: number,
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    _console.assertWithError(
      !this.#isDrawingBlankSprite,
      `already drawing blank sprite`,
    );
    this.#isDrawingBlankSprite = true;
    this.#saveContext(sendImmediately);
    this.#resetContextState();

    await this.#sendContextCommand(
      { type: "startSprite", offsetX, offsetY, width, height },
      sendImmediately,
      isSending,
    );
  }
  @ForwardToHelper
  async endSprite(
    sendImmediately?: boolean,
    isSending?: boolean,
    displayCanvasHelper?: DisplayCanvasHelper,
  ) {
    this.#restoreContext(sendImmediately);

    _console.assertWithError(
      this.#isDrawingBlankSprite,
      `not drawing blank sprite`,
    );
    this.#isDrawingBlankSprite = false;

    // _console.log("endSprite");
    await this.#sendContextCommand(
      { type: "endSprite" },
      sendImmediately,
      isSending,
    );
  }

  #displayCanvasHelper?: DisplayCanvasHelper;
  get displayCanvasHelper(): DisplayCanvasHelper | undefined {
    return this.#displayCanvasHelper;
  }
  set displayCanvasHelper(
    displayCanvasHelper: DisplayCanvasHelper | undefined,
  ) {
    this.#displayCanvasHelper = displayCanvasHelper;
  }

  reset() {
    _console.log("clearing displayManager");
    // @ts-ignore
    this.#displayStatus = undefined;
    this.#isAvailable = false;
    this.#displayInformation = undefined;
    // @ts-ignore
    this.#brightness = undefined;
    this.#contextCommandBuffers = [];

    this.#resetContextState();
    this.#colors.length = 0;
    this.#opacities.length = 0;

    this.#isReady = true;
    this.#pendingSpriteSheet = undefined;
    this.#pendingSpriteSheetName = undefined;

    this.#isDrawingBlankSprite = false;

    Object.keys(this.#spriteSheetIndices).forEach(
      (spriteSheetName) => delete this.#spriteSheetIndices[spriteSheetName],
    );
    Object.keys(this.#spriteSheets).forEach(
      (spriteSheetName) => delete this.#spriteSheets[spriteSheetName],
    );
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
