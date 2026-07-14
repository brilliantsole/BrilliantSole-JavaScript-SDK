import Device, {
  BoundDeviceEventListeners,
  DeviceEventMap,
} from "../Device.ts";
import {
  DisplayBitmapColorPair,
  DisplayBrightness,
  DisplaySpriteColorPair,
  DisplayBitmap,
  DisplaySegment,
  DisplayBezierCurve,
  DisplayBezierCurveType,
  DisplayWireframe,
  DisplaySize,
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
} from "./DisplayManagerInterface.ts";
import {
  assertValidColor,
  assertValidOpacity,
  assertValidSegmentCap,
  DisplayScaleDirection,
  DisplayColorRGB,
  DisplayCropDirection,
  DisplayCropDirections,
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
  trimWireframe,
  assertValidNumberOfControlPoints,
  assertValidPathNumberOfControlPoints,
  assertValidPath,
  displayCurveTypeToNumberOfControlPoints,
  maxNumberOfDisplayCurvePoints,
  displayCurveToleranceSquared,
  assertValidWireframe,
  isWireframePolygon,
  DisplayColorRGBOrString,
} from "./DisplayUtils.ts";
import EventDispatcher, { EventDispatcherTypes } from "./EventDispatcher.ts";
import { addEventListeners, removeEventListeners } from "./EventUtils.ts";
import {
  clamp,
  degToRad,
  getVector2DistanceSquared,
  getVector2Midpoint,
  normalizeRadians,
  Vector2,
} from "./MathUtils.ts";
import { wait } from "./Timer.ts";
import {
  DisplayContextCommand,
  parseDisplayContextCommands,
  serializeContextState,
} from "./DisplayContextCommand.ts";
import {
  assertValidSpriteLines,
  DisplaySprite,
  DisplaySpriteLines,
  DisplaySpritePaletteSwap,
  DisplaySpriteSheet,
  DisplaySpriteSheetPalette,
  DisplaySpriteSheetPaletteSwap,
  getSpriteLinesMetrics,
  parseSpriteSheet,
  serializeSpriteSheet,
  stringToSpriteLines,
  stringToSpriteLinesMetrics,
  verifySpriteSheet,
} from "./DisplaySpriteSheetUtils.ts";
import autoBind from "auto-bind";

const _console = createConsole("DisplayCanvasHelper", { log: true });

export const DisplayCanvasHelperEventTypes = [
  "contextState",
  "numberOfColors",
  "brightness",
  "color",
  "colorOpacity",
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
  "deviceUpdated",
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
  // opacity: {
  //   opacity: number;
  // };
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

  deviceUpdated: {
    device: Device;
  };
}

export type DisplayCanvasHelperEventDispatcherTypes = EventDispatcherTypes<
  DisplayCanvasHelper,
  DisplayCanvasHelperEventType,
  DisplayCanvasHelperEventMessages
>;
export type DisplayCanvasHelperEvent =
  DisplayCanvasHelperEventDispatcherTypes["Event"];
export type DisplayCanvasHelperEventMap =
  DisplayCanvasHelperEventDispatcherTypes["EventMap"];
export type DisplayCanvasHelperEventListenerMap =
  DisplayCanvasHelperEventDispatcherTypes["EventListenerMap"];
export type DisplayCanvasHelperEventDispatcher =
  DisplayCanvasHelperEventDispatcherTypes["EventDispatcher"];
export type BoundDisplayCanvasHelperEventListeners =
  DisplayCanvasHelperEventDispatcherTypes["BoundEventListeners"];

export type DisplayBoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function ForwardToDeviceIfClient(lastIndex: number) {
  return function (
    originalMethod: Function,
    context: ClassMethodDecoratorContext,
  ) {
    return function (this: any, ...args: any[]) {
      const device: Device | undefined = this.device;

      if (
        this.isDeviceClientConnectionType &&
        this.device?.isConnected &&
        !this.ignoreDevice &&
        !this.isSettingDevice
      ) {
        const isSending = args[lastIndex] as boolean;
        // _console.log("ForwardToDeviceIfClient", context, args, {
        //   isSendingArgsIndex: lastIndex,
        //   isSending,
        // });

        if (!isSending) {
          // _console.log(
          //   `forwarding "${context.name as string}" to device.displayManager`,
          //   context,
          // );

          while (args.length <= lastIndex) {
            args.push(undefined);
          }

          // @ts-expect-error
          return device.displayManager[context.name as string](...args, this);
        }
      }

      return originalMethod.apply(this, args);
    };
  };
}

class DisplayCanvasHelper implements DisplayManagerInterface {
  // DISPLAY CANVAS HELPER MANAGER
  private static OnDisplayCanvasHelper: (
    displayCanvasHelper: DisplayCanvasHelper,
  ) => void;

  constructor() {
    autoBind(this);

    this.numberOfColors = 16;
    this.#bitmapContext = this.#bitmapCanvas.getContext("2d")!;
    this.#bitmapContext.imageSmoothingEnabled = false;

    this.#initThisEventListeners();
  }
  #initThisEventListeners() {
    DisplayCanvasHelper.OnDisplayCanvasHelper(this);
  }

  // EVENT DISPATCHER
  #eventDispatcher: DisplayCanvasHelperEventDispatcher = new EventDispatcher(
    this as DisplayCanvasHelper,
    DisplayCanvasHelperEventTypes,
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
  removeAllEventListeners() {
    this.#eventDispatcher.removeAllEventListeners();
    this.#initThisEventListeners();
  }

  // CANVAS
  #canvas?: HTMLCanvasElement;
  get canvas() {
    return this.#canvas;
  }
  set canvas(newCanvas) {
    this.#setCanvas(newCanvas);
  }
  async #setCanvas(newCanvas?: HTMLCanvasElement) {
    _console.assertWithError(
      newCanvas?.nodeName == "CANVAS",
      `assigned non-canvas type ${newCanvas?.nodeName}`,
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
    await this.#updateCanvas(false);
  }
  #context!: CanvasRenderingContext2D;
  get context() {
    return this.#context;
  }
  async setContextState(
    newState: PartialDisplayContextState,
    sendImmediately?: boolean,
  ) {
    const contextCommands = serializeContextState(
      this,
      newState,
      this.numberOfColors,
      this.contextState,
    );
    _console.log("setContextState", newState, contextCommands);
    await this.runContextCommands(contextCommands, sendImmediately);
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

  async #updateCanvas(sendImmediately?: boolean, waitUntilReady?: boolean) {
    if (!this.canvas) {
      return;
    }
    this.canvas!.style.aspectRatio = `${this.aspectRatio}`;
    if (!this.device?.isConnected) {
      return;
    }

    _console.log("updateCanvas");

    const { width, height } = this.device.displayInformation!;
    // _console.log({ width, height });

    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.aspectRatio = `${width / height}`;

    this.#dispatchEvent("resize", { width: this.width, height: this.height });

    await this.clear(sendImmediately, waitUntilReady, this.#isSettingDevice);
  }

  // CONTEXT STACK
  #frontDrawStack: Function[] = [];
  #rearDrawStack: Function[] = [];
  #drawFrontDrawStack() {
    if (!this.context) {
      return;
    }
    _console.log("drawFrontDrawStack", this.#frontDrawStack);
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
      this.canvas!.height,
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
  get isDeviceClientConnectionType() {
    return this.deviceDisplayManager?.isClientConnectionType;
  }
  #isSettingDevice = false;
  get isSettingDevice() {
    return this.#isSettingDevice;
  }
  set device(newDevice) {
    if (this.#isSettingDevice) {
      _console.error("already setting device");
      return;
    }
    this.#setDevice(newDevice);
  }
  async #setDevice(newDevice?: Device) {
    if (this.#device == newDevice) {
      _console.log("redundant device assignment", newDevice);
      return;
    }

    if (newDevice) {
      _console.assertWithError(
        newDevice.isConnected,
        "device must be connected",
      );
      _console.assertWithError(
        newDevice.isDisplayAvailable,
        "display must have a display",
      );
    }

    _console.log("setDevice", newDevice);

    this.#setIsReady(false);
    if (this.#device) {
      this.#device.displayManager.displayCanvasHelper = undefined;
      removeEventListeners(this.device, this.#boundDeviceEventListeners);
    }
    this.#device = newDevice;
    this.#device!.displayManager.displayCanvasHelper = this;
    addEventListeners(this.#device, this.#boundDeviceEventListeners);
    _console.log("assigned device", this.device);
    if (this.device) {
      this.#isSettingDevice = true;
      this.numberOfColors = this.device.numberOfDisplayColors!;
      await this.#updateCanvas(true, false);
      await this.#updateDevice(true, true);
    }
    _console.log("finished setting device", newDevice);
    this.#isSettingDevice = false;

    this.#setIsReady(this.device?.isDisplayReady ?? true);
    await this.waitUntilReady();

    if (this.device) {
      this.#dispatchEvent("deviceIsConnected", {
        device: this.device,
        isConnected: this.device!.isConnected,
      });
      this.#dispatchEvent(
        this.device.isConnected ? "deviceConnected" : "deviceNotConnected",
        {
          device: this.device,
        },
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
    this.#onSentContextCommands();
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
    displayContextCommands: this.#onDeviceDisplayContextCommands.bind(this),
  };
  #onDeviceIsConnected(event: DeviceEventMap["isConnected"]) {
    const { isConnected } = event.message;
    this.#dispatchEvent("deviceIsConnected", {
      device: this.device!,
      isConnected,
    });
  }
  async #onDeviceConnected(event: DeviceEventMap["connected"]) {
    _console.log("device connected");
    await this.#updateCanvas(false);
    await this.#updateDevice(false);
    await this.flushContextCommands();
    this.#dispatchEvent("deviceConnected", { device: this.device! });
    // FIX - messages flushed properly?
  }
  #onDeviceNotConnected(event: DeviceEventMap["notConnected"]) {
    _console.log("device not connected");
    this.#dispatchEvent("deviceNotConnected", { device: this.device! });
    this.#setIsReady(true);
  }
  async #onDeviceDisplayReady(event: DeviceEventMap["displayReady"]) {
    _console.log("device display ready");
    // this.#setIsReady(true)
    // await wait(5); // we need to wait for some reason
    if (!this.#isSettingDevice) {
      this.#setIsReady(true);
    }
  }

  #onDeviceDisplaySpriteSheetUploadStart(
    event: DeviceEventMap["displaySpriteSheetUploadStart"],
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
    event: DeviceEventMap["displaySpriteSheetUploadProgress"],
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
    event: DeviceEventMap["displaySpriteSheetUploadComplete"],
  ) {
    const device = event.target;
    const { spriteSheet, spriteSheetName } = event.message;
    _console.log(
      "displaySpriteSheetUploadComplete",
      spriteSheet,
      spriteSheetName,
    );
    this.#dispatchEvent("deviceSpriteSheetUploadComplete", {
      device,
      spriteSheet,
      spriteSheetName,
    });
  }
  async #onDeviceDisplayContextCommands(
    event: DeviceEventMap["displayContextCommands"],
  ) {
    const { displayContextCommands } = event.message;
    _console.log("onDeviceDisplayContextCommands", displayContextCommands);
    this.#onSentContextCommands();
  }

  #onSentContextCommands() {
    let redraw = false;
    redraw ||= this.#flushColors();
    redraw ||= this.#flushOpacities();
    redraw ||= this.#flushBrightness();
    _console.log("onSentContextCommands", { redraw });
    if (redraw) {
      this.#drawFrontDrawStack();
    }
  }

  async #updateDevice(sendImmediately?: boolean, updateSelf?: boolean) {
    await this.#updateDeviceColors(false, updateSelf);
    await this.#updateDeviceOpacity(false, updateSelf);
    await this.#updateDeviceContextState(false, updateSelf);
    await this.#updateDeviceBrightness(false, updateSelf);
    await this.#updateDeviceSpriteSheets(updateSelf);
    await this.#updateDeviceSelectedSpriteSheet(false, false, updateSelf);
    _console.log("deviceUpdated");
    if (sendImmediately) {
      await this.flushContextCommands();
    }
    this.#dispatchEvent("deviceUpdated", { device: this.device! });
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
      0,
    );
    this.contextState.spriteColorIndices = new Array(this.numberOfColors).fill(
      0,
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
      this.numberOfColors,
    );
  }
  #pendingColors: string[] = [];
  #setColor(colorIndex: number, colorHex: string) {
    this.#pendingColors[colorIndex] = colorHex;
  }
  #colors: string[] = [];
  get colors() {
    return this.#colors;
  }
  #flushColors() {
    if (this.#pendingColors.length == 0) {
      return false;
    }
    this.#pendingColors.forEach((colorHex, colorIndex) => {
      this.#colors[colorIndex] = colorHex;
      const color = hexToRGB(colorHex);
      this.#dispatchEvent("color", { colorIndex, colorHex, color });
    });
    this.#pendingColors.length = 0;
    _console.log("flushColors");
    return true;
  }
  #resetColors() {
    this.#colors.length = 0;
    this.#pendingColors.length = 0;
  }
  async #updateDeviceColors(sendImmediately?: boolean, updateSelf?: boolean) {
    if (!this.device?.isConnected) {
      return;
    }
    for (const [colorIndex, color] of this.colors.entries()) {
      _console.log("updating color", {
        colorIndex,
        color,
        sendImmediately,
        updateSelf,
      });

      if (updateSelf) {
        await this.setColor(
          colorIndex,
          this.deviceDisplayManager!.colors[colorIndex],
          false,
          false,
        );
      } else {
        await this.deviceDisplayManager!.setColor(
          colorIndex,
          color,
          false,
          false,
          this,
        );
      }
    }
    if (sendImmediately) {
      await this.flushContextCommands();
    }
  }

  // OPACITIES
  #opacities: number[] = [];
  get opacities() {
    return this.#opacities;
  }
  #pendingOpacities: number[] = [];
  #setColorOpacity(colorIndex: number, opacity: number) {
    this.#pendingOpacities[colorIndex] = opacity;
  }
  #flushOpacities() {
    if (this.#pendingOpacities.length == 0) {
      return false;
    }
    this.#pendingOpacities.forEach((opacity, colorIndex) => {
      this.#opacities[colorIndex] = opacity;
      this.#dispatchEvent("colorOpacity", { colorIndex, opacity });
    });
    this.#pendingOpacities.length = 0;
    _console.log("flushOpacities");
    return true;
  }
  #resetOpacities() {
    this.#opacities.length = 0;
    this.#pendingOpacities.length = 0;
  }

  async #updateDeviceOpacity(sendImmediately?: boolean, updateSelf?: boolean) {
    if (!this.device?.isConnected) {
      return;
    }
    for (const [colorIndex, opacity] of this.#opacities.entries()) {
      if (updateSelf) {
        await this.setColorOpacity(
          colorIndex,
          this.deviceDisplayManager!.opacities[colorIndex],
          false,
          false,
        );
      } else {
        await this.deviceDisplayManager!.setColorOpacity(
          colorIndex,
          opacity,
          false,
          false,
          this,
        );
      }
    }
    if (sendImmediately) {
      await this.flushContextCommands();
    }
  }

  // CONEXT STATE
  #contextStateHelper = new DisplayContextStateHelper();
  get contextState() {
    return this.#contextStateHelper.state;
  }
  serializeContextState(other?: PartialDisplayContextState) {
    return this.#contextStateHelper.serialize(this, this.numberOfColors, other);
  }
  #onContextStateUpdate(differences: DisplayContextStateKey[]) {
    if (differences.length == 0) {
      return;
    }
    this.#dispatchEvent("contextState", {
      contextState: this.contextState,
      differences,
    });
  }
  #resetContextState(
    keepColorIndices?: boolean,
    keepSpriteColorIndices?: boolean,
  ) {
    _console.log("resetContextState", {
      keepColorIndices,
      keepSpriteColorIndices,
    });
    const differences = this.#contextStateHelper.reset(
      this.numberOfColors,
      keepColorIndices,
      keepSpriteColorIndices,
    );
    _console.log("resetContextState differences", differences);
    return differences;
  }
  async #updateDeviceContextState(
    sendImmediately?: boolean,
    updateSelf?: boolean,
  ) {
    if (!this.device?.isConnected) {
      return;
    }
    _console.log("updateDeviceContextState", { sendImmediately, updateSelf });

    if (updateSelf) {
      await this.setContextState(
        this.deviceDisplayManager!.contextState,
        sendImmediately,
      );
    } else {
      await this.deviceDisplayManager?.setContextState(
        this.contextState,
        sendImmediately,
        this,
      );
    }
  }

  @ForwardToDeviceIfClient(2)
  async show(
    sendImmediately = true,
    waitUntilReady?: boolean,
    isSending?: boolean,
  ) {
    _console.log("showDisplay", { sendImmediately, waitUntilReady });

    this.#frontDrawStack = this.#rearDrawStack.slice();
    this.#rearDrawStack.length = 0;

    this.#setIsReady(false);

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.show(
        sendImmediately,
        waitUntilReady,
        isSending,
        this,
      );
    } else {
      await wait(this.#interval);
      if (this.device) {
        return;
      }
      this.#setIsReady(true);
    }
  }
  #interval = 50; // can remove when working with better smart
  get interval() {
    return this.#interval;
  }
  set interval(newInterval) {
    this.#interval = newInterval;
    // _console.log({ interval: this.#interval });
  }

  #isReady = true;
  get isReady() {
    return this.#isReady && !this.#isSettingDevice;
  }
  #setIsReady(isReady: boolean) {
    if (this.#isSettingDevice) {
      return;
    }
    this.#isReady = isReady;
    _console.log({ isReady: this.#isReady });
    if (this.#isReady) {
      this.#onSentContextCommands();
      this.#drawFrontDrawStack();
      this.#dispatchEvent("ready", {});
    }
  }
  async waitUntilReady() {
    if (this.isReady) {
      return;
    }
    await this.waitForEvent("ready");
  }

  @ForwardToDeviceIfClient(2)
  async clear(
    sendImmediately = true,
    waitUntilReady?: boolean,
    isSending?: boolean,
  ) {
    _console.log("clearDisplay", {
      sendImmediately,
      waitUntilReady,
      isSending,
    });

    this.#frontDrawStack.length = 0;
    this.#rearDrawStack.length = 0;

    this.#setIsReady(false);
    this.#save();
    this.#context.resetTransform();
    this.#context.clearRect(0, 0, this.width, this.height);
    this.#restore();
    this.#drawBackground();

    this.#isDrawingBlankSprite = false;

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.clear(
        sendImmediately,
        waitUntilReady,
        isSending,
        this,
      );
    } else {
      await wait(this.#interval);
      if (this.device) {
        return;
      }
      this.#setIsReady(true);
    }
  }

  @ForwardToDeviceIfClient(3)
  async setColor(
    colorIndex: number,
    color: DisplayColorRGBOrString,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    this.assertValidColorIndex(colorIndex);

    if (typeof color == "string") {
      color = stringToRGB(color);
    } else {
      color = color;
    }
    assertValidColor(color);

    const colorHex = rgbToHex(color);
    if (this.colors[colorIndex] == colorHex) {
      _console.log(`redundant color #${colorIndex} ${colorHex}`);
      return;
    }

    _console.log(`setting color #${colorIndex}`, color);
    this.#setColor(colorIndex, colorHex);

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.setColor(
        colorIndex,
        color,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
  }
  serializeColors(other?: string[]): DisplayContextCommand[] {
    return serializeColors(this, other);
  }

  @ForwardToDeviceIfClient(3)
  async setColorOpacity(
    colorIndex: number,
    opacity: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    this.assertValidColorIndex(colorIndex);
    assertValidOpacity(opacity);
    if (
      Math.floor(255 * this.#opacities[colorIndex]) == Math.floor(255 * opacity)
    ) {
      // _console.log(`redundant opacity #${colorIndex} ${opacity}`);
      return;
    }
    this.#setColorOpacity(colorIndex, opacity);
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.setColorOpacity(
        colorIndex,
        opacity,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
  }
  @ForwardToDeviceIfClient(2)
  async setOpacity(
    opacity: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    assertValidOpacity(opacity);
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.setOpacity(
        opacity,
        sendImmediately,
        isSending,
        this,
      );
    }
    this.#opacities.forEach((_, colorIndex) => {
      this.#setColorOpacity(colorIndex, opacity);
    });
  }
  serializeOpacities(other?: number[]): DisplayContextCommand[] {
    return serializeOpacities(this, other);
  }

  // CONTEXT COMMANDS
  #contextStack: DisplayContextState[] = [];
  #saveContext(sendImmediately?: boolean, isSending?: boolean) {
    _console.log("#saveContext", { sendImmediately, isSending });
    const savedContext = structuredClone(this.contextState);
    this.#contextStack.push(savedContext);
    _console.log("#savedContext", savedContext, {
      "#contextStack.length": this.#contextStack.length,
    });
  }
  @ForwardToDeviceIfClient(1)
  async saveContext(sendImmediately?: boolean, isSending?: boolean) {
    _console.log("saveContext");
    this.#saveContext(sendImmediately, isSending);

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.saveContext(
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
  }
  #restoreContext(sendImmediately?: boolean, isSending?: boolean) {
    _console.log("#restoreContext", { sendImmediately, isSending });

    const restoredContext = this.#contextStack.pop();
    if (!restoredContext) {
      _console.warn("#contextStack empty");
      return [];
    }
    _console.log("#restoredContext", restoredContext, {
      "#contextStack.length": this.#contextStack.length,
    });
    const differences = this.#contextStateHelper.update(restoredContext);
    _console.log("restoreContext differences", differences);
    return differences;
  }
  @ForwardToDeviceIfClient(1)
  async restoreContext(sendImmediately?: boolean, isSending?: boolean) {
    _console.log("restoreContext", { sendImmediately, isSending });
    const differences = this.#restoreContext(sendImmediately);

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.restoreContext(
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }

    this.#onContextStateUpdate(differences);
  }
  #clearContext(isSending?: boolean) {
    _console.log("#clearContext", { isSending });
    const differences = this.#resetContextState(
      true,
      !this.#isDrawingSprite && !this.#isDrawingBlankSprite, // FIX?
    );
    return differences;
  }
  @ForwardToDeviceIfClient(1)
  async clearContext(sendImmediately?: boolean, isSending?: boolean) {
    _console.log("clearContext", { sendImmediately, isSending });
    const differences = this.#clearContext(isSending);
    if (differences.length == 0) {
      _console.log("no need to clear context - skipping");
      return;
    }

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.clearContext(
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }

    this.#onContextStateUpdate(differences);
  }

  @ForwardToDeviceIfClient(2)
  async selectBackgroundColor(
    backgroundColorIndex: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    this.assertValidColorIndex(backgroundColorIndex);
    const differences = this.#contextStateHelper.update({
      backgroundColorIndex,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.selectBackgroundColor(
        backgroundColorIndex,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
    this.#onContextStateUpdate(differences);
  }
  @ForwardToDeviceIfClient(2)
  async selectFillColor(
    fillColorIndex: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    _console.log("selectFillColor", {
      fillColorIndex,
      sendImmediately,
      isSending,
    });
    this.assertValidColorIndex(fillColorIndex);
    const differences = this.#contextStateHelper.update({
      fillColorIndex,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.selectFillColor(
        fillColorIndex,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
    this.#onContextStateUpdate(differences);
  }
  @ForwardToDeviceIfClient(2)
  async selectLineColor(
    lineColorIndex: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    this.assertValidColorIndex(lineColorIndex);
    const differences = this.#contextStateHelper.update({
      lineColorIndex,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.selectLineColor(
        lineColorIndex,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
    this.#onContextStateUpdate(differences);
  }
  @ForwardToDeviceIfClient(2)
  async setIgnoreFill(
    ignoreFill: boolean,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    _console.log("setIgnoreFill", { ignoreFill, sendImmediately, isSending });
    const differences = this.#contextStateHelper.update({
      ignoreFill,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.setIgnoreFill(
        ignoreFill,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
    this.#onContextStateUpdate(differences);
  }
  @ForwardToDeviceIfClient(2)
  async setIgnoreLine(
    ignoreLine: boolean,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    const differences = this.#contextStateHelper.update({
      ignoreLine,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.setIgnoreLine(
        ignoreLine,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
    this.#onContextStateUpdate(differences);
  }
  @ForwardToDeviceIfClient(2)
  async setFillBackground(
    fillBackground: boolean,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    const differences = this.#contextStateHelper.update({
      fillBackground,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.setFillBackground(
        fillBackground,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
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
  @ForwardToDeviceIfClient(2)
  async setLineWidth(
    lineWidth: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    this.assertValidLineWidth(lineWidth);
    const differences = this.#contextStateHelper.update({
      lineWidth,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.setLineWidth(
        lineWidth,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
    this.#onContextStateUpdate(differences);
  }
  @ForwardToDeviceIfClient(3)
  async setAlignment(
    alignmentDirection: DisplayAlignmentDirection,
    alignment: DisplayAlignment,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    _console.assertEnumWithError(
      DisplayAlignmentDirections,
      alignmentDirection,
    );
    const alignmentCommand =
      DisplayAlignmentDirectionToCommandType[alignmentDirection];
    const alignmentKey =
      DisplayAlignmentDirectionToStateKey[alignmentDirection];
    const differences = this.#contextStateHelper.update({
      [alignmentKey]: alignment,
    });

    // _console.log({
    //   alignmentKey,
    //   alignment,
    //   differences,
    // });

    // _console.log({ [cropCommand]: crop });
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.setAlignment(
        alignmentDirection,
        alignment,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
    this.#onContextStateUpdate(differences);
  }
  async setHorizontalAlignment(
    horizontalAlignment: DisplayAlignment,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    await this.setAlignment(
      "horizontal",
      horizontalAlignment,
      sendImmediately,
      isSending,
    );
  }
  async setVerticalAlignment(
    verticalAlignment: DisplayAlignment,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    await this.setAlignment(
      "vertical",
      verticalAlignment,
      sendImmediately,
      isSending,
    );
  }
  @ForwardToDeviceIfClient(1)
  async resetAlignment(sendImmediately?: boolean, isSending?: boolean) {
    const differences = this.#contextStateHelper.update({
      verticalAlignment: DefaultDisplayContextState.verticalAlignment,
      horizontalAlignment: DefaultDisplayContextState.horizontalAlignment,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.resetAlignment(
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
    this.#onContextStateUpdate(differences);
  }

  @ForwardToDeviceIfClient(3)
  async setRotation(
    rotation: number,
    isRadians: boolean,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    rotation = isRadians ? rotation : degToRad(rotation);
    rotation = normalizeRadians(rotation);
    // _console.log({ rotation });
    isRadians = true;

    const differences = this.#contextStateHelper.update({
      rotation,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.setRotation(
        rotation,
        isRadians,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
    this.#onContextStateUpdate(differences);
  }
  @ForwardToDeviceIfClient(1)
  async clearRotation(sendImmediately?: boolean, isSending?: boolean) {
    const differences = this.#contextStateHelper.update({
      rotation: 0,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.clearRotation(
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
    this.#onContextStateUpdate(differences);
  }
  @ForwardToDeviceIfClient(2)
  async setSegmentStartCap(
    segmentStartCap: DisplaySegmentCap,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    assertValidSegmentCap(segmentStartCap);
    const differences = this.#contextStateHelper.update({
      segmentStartCap,
    });

    // _console.log({ segmentStartCap });
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.setSegmentStartCap(
        segmentStartCap,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
    this.#onContextStateUpdate(differences);
  }
  @ForwardToDeviceIfClient(2)
  async setSegmentEndCap(
    segmentEndCap: DisplaySegmentCap,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    assertValidSegmentCap(segmentEndCap);
    const differences = this.#contextStateHelper.update({
      segmentEndCap,
    });

    // _console.log({ segmentEndCap });
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.setSegmentEndCap(
        segmentEndCap,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
    this.#onContextStateUpdate(differences);
  }
  @ForwardToDeviceIfClient(2)
  async setSegmentCap(
    segmentCap: DisplaySegmentCap,
    sendImmediately?: boolean,
    isSending?: boolean,
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
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
    this.#onContextStateUpdate(differences);
  }
  @ForwardToDeviceIfClient(2)
  async setSegmentStartRadius(
    segmentStartRadius: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    const differences = this.#contextStateHelper.update({
      segmentStartRadius,
    });

    // _console.log({ segmentStartRadius });
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.setSegmentStartRadius(
        segmentStartRadius,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
    this.#onContextStateUpdate(differences);
  }
  @ForwardToDeviceIfClient(2)
  async setSegmentEndRadius(
    segmentEndRadius: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    const differences = this.#contextStateHelper.update({
      segmentEndRadius,
    });

    // _console.log({ segmentEndRadius });
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.setSegmentEndRadius(
        segmentEndRadius,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
    this.#onContextStateUpdate(differences);
  }
  // START
  @ForwardToDeviceIfClient(2)
  async setSegmentRadius(
    segmentRadius: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    const differences = this.#contextStateHelper.update({
      segmentStartRadius: segmentRadius,
      segmentEndRadius: segmentRadius,
    });

    // _console.log({ segmentRadius });
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.setSegmentRadius(
        segmentRadius,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
    this.#onContextStateUpdate(differences);
  }
  @ForwardToDeviceIfClient(3)
  async setCrop(
    cropDirection: DisplayCropDirection,
    crop: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    _console.assertEnumWithError(DisplayCropDirections, cropDirection);
    crop = Math.max(0, crop);
    const cropKey = DisplayCropDirectionToStateKey[cropDirection];
    const differences = this.#contextStateHelper.update({
      [cropKey]: crop,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.setCrop(
        cropDirection,
        crop,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
    this.#onContextStateUpdate(differences);
  }
  async setCropTop(
    cropTop: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    await this.setCrop("top", cropTop, sendImmediately, isSending);
  }
  async setCropRight(
    cropRight: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    await this.setCrop("right", cropRight, sendImmediately, isSending);
  }
  async setCropBottom(
    cropBottom: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    await this.setCrop("bottom", cropBottom, sendImmediately, isSending);
  }
  async setCropLeft(
    cropLeft: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    await this.setCrop("left", cropLeft, sendImmediately, isSending);
  }
  @ForwardToDeviceIfClient(1)
  async clearCrop(sendImmediately?: boolean, isSending?: boolean) {
    const differences = this.#contextStateHelper.update({
      cropTop: 0,
      cropRight: 0,
      cropBottom: 0,
      cropLeft: 0,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.clearCrop(
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
    this.#onContextStateUpdate(differences);
  }

  @ForwardToDeviceIfClient(3)
  async setRotationCrop(
    cropDirection: DisplayCropDirection,
    crop: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    _console.assertEnumWithError(DisplayCropDirections, cropDirection);
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
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
    this.#onContextStateUpdate(differences);
  }
  async setRotationCropTop(
    rotationCropTop: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    await this.setRotationCrop(
      "top",
      rotationCropTop,
      sendImmediately,
      isSending,
    );
  }
  async setRotationCropRight(
    rotationCropRight: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    await this.setRotationCrop(
      "right",
      rotationCropRight,
      sendImmediately,
      isSending,
    );
  }
  async setRotationCropBottom(
    rotationCropBottom: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    await this.setRotationCrop(
      "bottom",
      rotationCropBottom,
      sendImmediately,
      isSending,
    );
  }
  async setRotationCropLeft(
    rotationCropLeft: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    await this.setRotationCrop(
      "left",
      rotationCropLeft,
      sendImmediately,
      isSending,
    );
  }
  @ForwardToDeviceIfClient(1)
  async clearRotationCrop(sendImmediately?: boolean, isSending?: boolean) {
    const differences = this.#contextStateHelper.update({
      rotationCropTop: 0,
      rotationCropRight: 0,
      rotationCropBottom: 0,
      rotationCropLeft: 0,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.clearRotationCrop(
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
    this.#onContextStateUpdate(differences);
  }

  get bitmapColorIndices() {
    return this.contextState.bitmapColorIndices;
  }
  get bitmapColors() {
    return this.bitmapColorIndices.map((colorIndex) => this.colors[colorIndex]);
  }
  @ForwardToDeviceIfClient(3)
  async selectBitmapColor(
    bitmapColorIndex: number,
    colorIndex: number,
    sendImmediately?: boolean,
    isSending?: boolean,
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
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
    this.#onContextStateUpdate(differences);
  }

  @ForwardToDeviceIfClient(2)
  async selectBitmapColors(
    bitmapColorPairs: DisplayBitmapColorPair[],
    sendImmediately?: boolean,
    isSending?: boolean,
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

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.selectBitmapColors(
        bitmapColorPairs,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
    this.#onContextStateUpdate(differences);
  }

  async setBitmapColor(
    bitmapColorIndex: number,
    color: DisplayColorRGBOrString,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    return this.setColor(
      this.bitmapColorIndices[bitmapColorIndex],
      color,
      sendImmediately,
      isSending,
    );
  }
  async setBitmapColorOpacity(
    bitmapColorIndex: number,
    opacity: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    return this.setColorOpacity(
      this.bitmapColorIndices[bitmapColorIndex],
      opacity,
      sendImmediately,
      isSending,
    );
  }

  @ForwardToDeviceIfClient(3)
  async setBitmapScaleDirection(
    direction: DisplayScaleDirection,
    bitmapScale: number,
    sendImmediately?: boolean,
    isSending?: boolean,
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
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
    this.#onContextStateUpdate(differences);
  }
  async setBitmapScaleX(
    bitmapScaleX: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    return this.setBitmapScaleDirection(
      "x",
      bitmapScaleX,
      sendImmediately,
      isSending,
    );
  }
  async setBitmapScaleY(
    bitmapScaleY: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    return this.setBitmapScaleDirection(
      "y",
      bitmapScaleY,
      sendImmediately,
      isSending,
    );
  }
  @ForwardToDeviceIfClient(2)
  async setBitmapScale(
    bitmapScale: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    return this.setBitmapScaleDirection(
      "all",
      bitmapScale,
      sendImmediately,
      isSending,
    );
  }
  @ForwardToDeviceIfClient(1)
  async resetBitmapScale(sendImmediately?: boolean, isSending?: boolean) {
    const differences = this.#contextStateHelper.update({
      bitmapScaleX: 1,
      bitmapScaleY: 1,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.resetBitmapScale(
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
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
      (colorIndex) => this.spriteColorIndices[colorIndex],
    );
  }
  get spriteBitmapColors() {
    return this.spriteBitmapColorIndices.map(
      (colorIndex) => this.colors[colorIndex],
    );
  }
  @ForwardToDeviceIfClient(3)
  async selectSpriteColor(
    spriteColorIndex: number,
    colorIndex: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    this.assertValidColorIndex(spriteColorIndex);
    const spriteColorIndices = this.contextState.spriteColorIndices.slice();
    if (this.#isDrawingBlankSprite) {
      spriteColorIndices[spriteColorIndex] =
        this.#blankSpriteColorIndices![colorIndex];
    } else {
      spriteColorIndices[spriteColorIndex] = colorIndex;
    }
    const differences = this.#contextStateHelper.update({
      spriteColorIndices,
    });

    _console.log({ spriteColorIndex, colorIndex });
    _console.log("spriteColorIndices", spriteColorIndices);

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.selectSpriteColor(
        spriteColorIndex,
        colorIndex,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
    this.#onContextStateUpdate(differences);
  }

  @ForwardToDeviceIfClient(2)
  async selectSpriteColors(
    spriteColorPairs: DisplaySpriteColorPair[],
    sendImmediately?: boolean,
    isSending?: boolean,
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
      // FIX
      if (this.#isDrawingBlankSprite) {
        spriteColorIndices[spriteColorIndex] =
          this.#blankSpriteColorIndices![colorIndex];
      } else {
        spriteColorIndices[spriteColorIndex] = colorIndex;
      }
    });

    const differences = this.#contextStateHelper.update({
      spriteColorIndices,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.selectSpriteColors(
        spriteColorPairs,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
    this.#onContextStateUpdate(differences);
  }

  async setSpriteColor(
    spriteColorIndex: number,
    color: DisplayColorRGBOrString,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    return this.setColor(
      this.spriteColorIndices[spriteColorIndex],
      color,
      sendImmediately,
      isSending,
    );
  }
  async setSpriteColorOpacity(
    spriteColorIndex: number,
    opacity: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    return this.setColorOpacity(
      this.spriteColorIndices[spriteColorIndex],
      opacity,
      sendImmediately,
      isSending,
    );
  }

  @ForwardToDeviceIfClient(1)
  async resetSpriteColors(sendImmediately?: boolean, isSending?: boolean) {
    const spriteColorIndices = new Array(this.numberOfColors).fill(0);
    const differences = this.#contextStateHelper.update({
      spriteColorIndices,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.resetSpriteColors(
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
    this.#onContextStateUpdate(differences);
  }

  @ForwardToDeviceIfClient(3)
  async setSpriteScaleDirection(
    direction: DisplayScaleDirection,
    spriteScale: number,
    sendImmediately?: boolean,
    isSending?: boolean,
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
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
    this.#onContextStateUpdate(differences);
  }

  async setSpriteScaleX(
    spriteScaleX: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    return this.setSpriteScaleDirection(
      "x",
      spriteScaleX,
      sendImmediately,
      isSending,
    );
  }
  async setSpriteScaleY(
    spriteScaleY: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    return this.setSpriteScaleDirection(
      "y",
      spriteScaleY,
      sendImmediately,
      isSending,
    );
  }
  async setSpriteScale(
    spriteScale: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    return this.setSpriteScaleDirection(
      "all",
      spriteScale,
      sendImmediately,
      isSending,
    );
  }
  @ForwardToDeviceIfClient(1)
  async resetSpriteScale(sendImmediately?: boolean, isSending?: boolean) {
    const differences = this.#contextStateHelper.update({
      spriteScaleX: 1,
      spriteScaleY: 1,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.resetSpriteScale(
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
    this.#onContextStateUpdate(differences);
  }

  @ForwardToDeviceIfClient(2)
  async setSpritesLineHeight(
    spritesLineHeight: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    spritesLineHeight = Math.round(spritesLineHeight);
    this.assertValidLineWidth(spritesLineHeight);
    const differences = this.#contextStateHelper.update({
      spritesLineHeight,
    });

    _console.log("setSpritesLineHeight", {
      spritesLineHeight,
      sendImmediately,
      isSending,
      differences,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.setSpritesLineHeight(
        spritesLineHeight,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
    this.#onContextStateUpdate(differences);
  }

  @ForwardToDeviceIfClient(3)
  async setSpritesDirectionGeneric(
    direction: DisplayDirection,
    isOrthogonal: boolean,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    assertValidDirection(direction);
    const stateKey: DisplayContextStateKey = isOrthogonal
      ? "spritesLineDirection"
      : "spritesDirection";
    const differences = this.#contextStateHelper.update({
      [stateKey]: direction,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.setSpritesDirectionGeneric(
        direction,
        isOrthogonal,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
    this.#onContextStateUpdate(differences);
  }
  async setSpritesDirection(
    spritesDirection: DisplayDirection,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    await this.setSpritesDirectionGeneric(
      spritesDirection,
      false,
      sendImmediately,
      isSending,
    );
  }
  async setSpritesLineDirection(
    spritesLineDirection: DisplayDirection,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    await this.setSpritesDirectionGeneric(
      spritesLineDirection,
      true,
      sendImmediately,
      isSending,
    );
  }

  @ForwardToDeviceIfClient(3)
  async setSpritesSpacingGeneric(
    spacing: number,
    isOrthogonal: boolean,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    const stateKey: DisplayContextStateKey = isOrthogonal
      ? "spritesLineSpacing"
      : "spritesSpacing";
    const differences = this.#contextStateHelper.update({
      [stateKey]: spacing,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.setSpritesSpacingGeneric(
        spacing,
        isOrthogonal,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
    this.#onContextStateUpdate(differences);
  }
  async setSpritesSpacing(
    spritesSpacing: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    await this.setSpritesSpacingGeneric(
      spritesSpacing,
      false,
      sendImmediately,
      isSending,
    );
  }
  async setSpritesLineSpacing(
    spritesSpacing: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    await this.setSpritesSpacingGeneric(
      spritesSpacing,
      true,
      sendImmediately,
      isSending,
    );
  }

  @ForwardToDeviceIfClient(3)
  async setSpritesAlignmentGeneric(
    alignment: DisplayAlignment,
    isOrthogonal: boolean,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    assertValidAlignment(alignment);
    const stateKey: DisplayContextStateKey = isOrthogonal
      ? "spritesLineAlignment"
      : "spritesAlignment";
    const differences = this.#contextStateHelper.update({
      [stateKey]: alignment,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.setSpritesAlignmentGeneric(
        alignment,
        isOrthogonal,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
    this.#onContextStateUpdate(differences);
  }
  async setSpritesAlignment(
    spritesAlignment: DisplayAlignment,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    await this.setSpritesAlignmentGeneric(
      spritesAlignment,
      false,
      sendImmediately,
      isSending,
    );
  }
  async setSpritesLineAlignment(
    spritesLineAlignment: DisplayAlignment,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    await this.setSpritesAlignmentGeneric(
      spritesLineAlignment,
      true,
      sendImmediately,
      isSending,
    );
  }

  #clearRectToCanvas(
    x: number,
    y: number,
    width: number,
    height: number,
    {
      backgroundColorIndex,
      spriteColorIndices,
      fillBackground,
    }: DisplayContextState,
  ) {
    this.#save();
    if (this.#useSpriteColorIndices) {
      backgroundColorIndex = spriteColorIndices[backgroundColorIndex];
    }
    //this.context.resetTransform();
    this.context.fillStyle = this.#colorIndexToRgbString(
      fillBackground ? backgroundColorIndex : 0,
    );
    // _console.log({
    //   useSpriteColorIndices: this.#useSpriteColorIndices,
    //   backgroundColorIndex,
    //   fillBackground,
    //   fillStyle: this.context.fillStyle,
    // });
    //this.context.fillStyle = "red"; // remove when done debugigng
    this.context.lineWidth = 0;
    this.context.fillRect(x, y, width, height);
    this.#restore();
  }
  @ForwardToDeviceIfClient(5)
  async clearRect(
    x: number,
    y: number,
    width: number,
    height: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    const contextState = structuredClone(this.contextState);
    this.#rearDrawStack.push(() =>
      this.#clearRectToCanvas(x, y, width, height, contextState),
    );
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.clearRect(
        x,
        y,
        width,
        height,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
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
    { verticalAlignment, horizontalAlignment }: DisplayContextState,
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
    rotation: number,
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
    offsetY: number,
  ): DisplayBoundingBox {
    const offsetBoundingBox = structuredClone(box);
    offsetBoundingBox.x += offsetX;
    offsetBoundingBox.y += offsetY;
    return offsetBoundingBox;
  }
  #_clearBoundingBoxOnDraw = true;
  get #clearBoundingBoxOnDraw() {
    return this.#_clearBoundingBoxOnDraw && !this.#isDrawingSprite;
  }
  #clearBoundingBox(
    { x, y, width, height }: DisplayBoundingBox,
    contextState: DisplayContextState,
  ) {
    this.#clearRectToCanvas(x, y, width, height, contextState);
  }
  #getOuterPadding(lineWidth: number) {
    return Math.ceil(lineWidth / 2);
  }
  #getRectBoundingBox(
    width: number,
    height: number,
    { lineWidth, verticalAlignment, horizontalAlignment }: DisplayContextState,
    applyLineWidth = true,
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
    { cropTop, cropRight, cropBottom, cropLeft }: DisplayContextState,
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
    }: DisplayContextState,
  ) {
    const ctx = this.context;
    ctx.beginPath();
    ctx.rect(
      x + rotationCropLeft,
      y + rotationCropTop,
      width - rotationCropRight,
      height - rotationCropBottom,
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
      this.#getColorOpacity(colorIndex),
    );
  }
  #colorIndexToRgb(colorIndex: number) {
    return this.#hexToRgbWithOpacity(
      this.colors[colorIndex],
      this.#getColorOpacity(colorIndex),
    );
  }
  #ignoreCanvasContextStyle = "rgba(0,0,0,0)";
  #updateContext({
    lineWidth,
    fillColorIndex,
    lineColorIndex,
    spriteColorIndices,
    ignoreFill,
    ignoreLine,
  }: DisplayContextState) {
    if (this.#useSpriteColorIndices) {
      //_console.log("spriteColorIndices", spriteColorIndices);
      fillColorIndex = spriteColorIndices[fillColorIndex];
      lineColorIndex = spriteColorIndices[lineColorIndex];
    }
    this.context.fillStyle = ignoreFill
      ? this.#ignoreCanvasContextStyle
      : this.#colorIndexToRgbString(fillColorIndex);
    this.context.strokeStyle = ignoreLine
      ? this.#ignoreCanvasContextStyle
      : this.#colorIndexToRgbString(lineColorIndex);
    this.context.lineWidth = lineWidth;
    // _console.log({ fillColorIndex, lineColorIndex, lineWidth });
    // _console.log({fillStyle: this.context.fillStyle, strokeStyle: this.context.strokeStyle})
  }
  #drawRectToCanvas(
    offsetX: number,
    offsetY: number,
    width: number,
    height: number,
    contextState: DisplayContextState,
  ) {
    this.#updateContext(contextState);

    this.#save();
    const localBox = this.#getRectBoundingBox(width, height, contextState);
    const rotatedLocalBox = this.#rotateBoundingBox(
      localBox,
      contextState.rotation,
    );
    const rotatedBox = this.#offsetBoundingBox(
      rotatedLocalBox,
      offsetX,
      offsetY,
    );
    this.#applyClip(rotatedBox, contextState);
    if (this.#clearBoundingBoxOnDraw) {
      this.#clearBoundingBox(rotatedBox, contextState);
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
  @ForwardToDeviceIfClient(5)
  async drawRect(
    offsetX: number,
    offsetY: number,
    width: number,
    height: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    const contextState = structuredClone(this.contextState);
    //console.log("drawRect contextState", contextState);
    this.#rearDrawStack.push(() =>
      this.#drawRectToCanvas(offsetX, offsetY, width, height, contextState),
    );
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.drawRect(
        offsetX,
        offsetY,
        width,
        height,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
  }
  #drawRoundRectToCanvas(
    offsetX: number,
    offsetY: number,
    width: number,
    height: number,
    borderRadius: number,
    contextState: DisplayContextState,
  ) {
    this.#updateContext(contextState);

    const maxBorderRadius = Math.min(width, height) / 2;
    borderRadius = Math.min(borderRadius, maxBorderRadius);

    this.#save();
    const localBox = this.#getRectBoundingBox(width, height, contextState);
    const rotatedLocalBox = this.#rotateBoundingBox(
      localBox,
      contextState.rotation,
    );
    const rotatedBox = this.#offsetBoundingBox(
      rotatedLocalBox,
      offsetX,
      offsetY,
    );
    this.#applyClip(rotatedBox, contextState);
    if (this.#clearBoundingBoxOnDraw) {
      this.#clearBoundingBox(rotatedBox, contextState);
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
  @ForwardToDeviceIfClient(6)
  async drawRoundRect(
    offsetX: number,
    offsetY: number,
    width: number,
    height: number,
    borderRadius: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    const contextState = structuredClone(this.contextState);
    this.#rearDrawStack.push(() =>
      this.#drawRoundRectToCanvas(
        offsetX,
        offsetY,
        width,
        height,
        borderRadius,
        contextState,
      ),
    );
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.drawRoundRect(
        offsetX,
        offsetY,
        width,
        height,
        borderRadius,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
  }
  #getCircleBoundingBox(
    radius: number,
    contextState: DisplayContextState,
  ): DisplayBoundingBox {
    const diameter = radius * 2;
    return this.#getRectBoundingBox(diameter, diameter, contextState);
  }
  #drawCircleToCanvas(
    offsetX: number,
    offsetY: number,
    radius: number,
    contextState: DisplayContextState,
  ) {
    this.#drawArcEllipseToCanvas(
      offsetX,
      offsetY,
      radius,
      radius,
      0,
      360,
      false,
      contextState,
    );
  }
  @ForwardToDeviceIfClient(4)
  async drawCircle(
    offsetX: number,
    offsetY: number,
    radius: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    const contextState = structuredClone(this.contextState);
    this.#rearDrawStack.push(() =>
      this.#drawCircleToCanvas(offsetX, offsetY, radius, contextState),
    );
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.drawCircle(
        offsetX,
        offsetY,
        radius,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
  }
  #drawEllipseToCanvas(
    offsetX: number,
    offsetY: number,
    radiusX: number,
    radiusY: number,
    contextState: DisplayContextState,
  ) {
    this.#drawArcEllipseToCanvas(
      offsetX,
      offsetY,
      radiusX,
      radiusY,
      0,
      360,
      false,
      contextState,
    );
  }
  @ForwardToDeviceIfClient(5)
  async drawEllipse(
    offsetX: number,
    offsetY: number,
    radiusX: number,
    radiusY: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    const contextState = structuredClone(this.contextState);
    this.#rearDrawStack.push(() =>
      this.#drawEllipseToCanvas(
        offsetX,
        offsetY,
        radiusX,
        radiusY,
        contextState,
      ),
    );
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.drawEllipse(
        offsetX,
        offsetY,
        radiusX,
        radiusY,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
  }
  #getRegularPolygonBoundingBox(
    radius: number,
    numberOfSides: number,
    { lineWidth }: DisplayContextState,
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
    contextState: DisplayContextState,
  ) {
    this.#updateContext(contextState);

    this.#save();
    const localBox = this.#getRegularPolygonBoundingBox(
      radius,
      numberOfSides,
      contextState,
    );
    const rotatedLocalBox = this.#rotateBoundingBox(
      localBox,
      contextState.rotation,
    );
    const rotatedBox = this.#offsetBoundingBox(
      rotatedLocalBox,
      offsetX,
      offsetY,
    );
    this.#applyClip(rotatedBox, contextState);
    if (this.#clearBoundingBoxOnDraw) {
      this.#clearBoundingBox(rotatedBox, contextState);
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
  @ForwardToDeviceIfClient(5)
  async drawRegularPolygon(
    offsetX: number,
    offsetY: number,
    radius: number,
    numberOfSides: number,
    sendImmediately?: boolean,
    isSending?: boolean,
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
        contextState,
      ),
    );
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.drawRegularPolygon(
        offsetX,
        offsetY,
        radius,
        numberOfSides,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
  }
  #getPointsBoundingBox(
    points: Vector2[],
    { lineWidth, verticalAlignment, horizontalAlignment }: DisplayContextState,
    applyLineWidth = true,
    applyAlignment = false,
  ): DisplayBoundingBox {
    const outerPadding = applyLineWidth ? this.#getOuterPadding(lineWidth) : 0;

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
    if (applyAlignment) {
      assertValidAlignment(horizontalAlignment);
      assertValidAlignment(verticalAlignment);
      switch (horizontalAlignment) {
        case "start":
          pointsBoundingBox.x = 0;
          break;
        case "center":
          break;
        case "end":
          pointsBoundingBox.x = -pointsBoundingBox.width;
          break;
      }
      switch (verticalAlignment) {
        case "start":
          pointsBoundingBox.y = 0;
          break;
        case "center":
          break;
        case "end":
          pointsBoundingBox.y = -pointsBoundingBox.height;
          break;
      }
    }
    //_console.log("pointsBoundingBox", pointsBoundingBox);
    return pointsBoundingBox;
  }
  #alignBoundingBox(
    boundingBox: DisplayBoundingBox,
    { verticalAlignment, horizontalAlignment }: DisplayContextState,
  ): DisplayBoundingBox {
    const alignedBoundingBox = structuredClone(boundingBox);
    assertValidAlignment(horizontalAlignment);
    assertValidAlignment(verticalAlignment);
    switch (horizontalAlignment) {
      case "start":
        alignedBoundingBox.x = 0;
        break;
      case "center":
        break;
      case "end":
        alignedBoundingBox.x = -alignedBoundingBox.width;
        break;
    }
    switch (verticalAlignment) {
      case "start":
        alignedBoundingBox.y = 0;
        break;
      case "center":
        break;
      case "end":
        alignedBoundingBox.y = -alignedBoundingBox.height;
        break;
    }
    //_console.log("alignedBoundingBox", alignedBoundingBox);
    return alignedBoundingBox;
  }
  #drawPolygonToCanvas(
    offsetX: number,
    offsetY: number,
    points: Vector2[],
    contextState: DisplayContextState,
  ) {
    //_console.log("drawPolygonToCanvas", { offsetX, offsetY, points });
    this.#updateContext(contextState);

    this.#save();
    const centeredLocalBox = this.#getPointsBoundingBox(
      points,
      contextState,
      true,
      false,
    );
    const localBox = this.#alignBoundingBox(centeredLocalBox, contextState);
    const rotatedLocalBox = this.#rotateBoundingBox(
      localBox,
      contextState.rotation,
    );
    const rotatedBox = this.#offsetBoundingBox(
      rotatedLocalBox,
      offsetX,
      offsetY,
    );
    this.#applyClip(rotatedBox, contextState);
    if (this.#clearBoundingBoxOnDraw) {
      this.#clearBoundingBox(rotatedBox, contextState);
    }
    this.#transformContext(offsetX, offsetY, contextState.rotation);
    this.#applyRotationClip(localBox, contextState);
    this.context.translate(
      localBox.x - centeredLocalBox.x,
      localBox.y - centeredLocalBox.y,
    );

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
  @ForwardToDeviceIfClient(2)
  async drawPolygon(
    points: Vector2[],
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    const contextState = structuredClone(this.contextState);
    this.#rearDrawStack.push(() =>
      this.#drawPolygonToCanvas(0, 0, points, contextState),
    );
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.drawPolygon(
        points,
        sendImmediately,
        isSending,
        this,
      );
    }
  }
  #getWireframeBoundingBox(
    { edges, points }: DisplayWireframe,
    contextState: DisplayContextState,
  ): DisplayBoundingBox {
    const segments: DisplaySegment[] = [];
    edges.forEach((edge) => {
      const { startIndex, endIndex } = edge;
      const point = points[startIndex];
      const nextPoint = points[endIndex];
      segments.push({ start: point, end: nextPoint });
    });
    return this.#_getSegmentsBoundingBox(segments, contextState);
  }
  #drawWireframeToCanvas(
    wireframe: DisplayWireframe,
    contextState: DisplayContextState,
  ) {
    _console.log("drawWireframeToCanvas", wireframe);
    this.#updateContext(contextState);

    this.#save();
    const box = this.#getWireframeBoundingBox(wireframe, contextState);
    if (this.#clearBoundingBoxOnDraw) {
      this.#clearBoundingBox(box, contextState);
    }

    const { points, edges } = wireframe;
    const _clearBoundingBoxOnDraw = this.#_clearBoundingBoxOnDraw;
    this.#_clearBoundingBoxOnDraw = false;
    edges.forEach((edge) => {
      const { startIndex, endIndex } = edge;
      const startPoint = points[startIndex];
      const endPoint = points[endIndex];

      this.#drawSegmentToCanvas(
        startPoint.x,
        startPoint.y,
        endPoint.x,
        endPoint.y,
        contextState,
        false,
      );
    });
    this.#_clearBoundingBoxOnDraw = _clearBoundingBoxOnDraw;

    this.#restore();
  }
  @ForwardToDeviceIfClient(2)
  async drawWireframe(
    wireframe: DisplayWireframe,
    sendImmediately?: boolean,
    isSending?: boolean,
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
    const contextState = structuredClone(this.contextState);
    this.#rearDrawStack.push(() =>
      this.#drawWireframeToCanvas(wireframe, contextState),
    );
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.drawWireframe(
        wireframe,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
  }

  #appendCurvePoint(curvePoints: Vector2[], curvePoint: Vector2) {
    if (curvePoints.length >= maxNumberOfDisplayCurvePoints) {
      _console.warn(
        `numberOfDisplayCurvePoints ${curvePoints.length} exceeded (max ${maxNumberOfDisplayCurvePoints})`,
      );
    } else {
      curvePoints.push(curvePoint);
      //_console.log(`appendCurvePoint curvePoints.length ${curvePoints.length}`);
    }
  }
  #appendCurvePoints(curvePoints: Vector2[], _curvePoints: Vector2[]) {
    _curvePoints.forEach((curvePoint) => {
      this.#appendCurvePoint(curvePoints, curvePoint);
    });
  }

  #generateQuadraticCurvePoints(controlPoints: Vector2[]) {
    assertValidNumberOfControlPoints("quadratic", controlPoints);
    // _console.log("generateQuadraticCurvePoints", controlPoints, { depth });
    const [p0, p1, p2] = controlPoints;
    if (false) {
      const c1: Vector2 = {
        x: p0.x + (2 / 3) * (p1.x - p0.x),
        y: p0.y + (2 / 3) * (p1.y - p0.y),
      };
      const c2: Vector2 = {
        x: p2.x + (2 / 3) * (p1.x - p2.x),
        y: p2.y + (2 / 3) * (p1.y - p2.y),
      };
      return this.#generateCubicCurvePoints([p0, c1, c2, p2]);
    } else {
      const curvePoints: Vector2[] = [];

      const p01 = getVector2Midpoint(p0, p1);
      const p12 = getVector2Midpoint(p1, p2);
      const mid = getVector2Midpoint(p01, p12);

      const d2 = getVector2DistanceSquared(p1, mid);

      if (d2 <= displayCurveToleranceSquared) {
        curvePoints.push(p2);
      } else {
        curvePoints.push(...this.#generateQuadraticCurvePoints([p0, p01, mid]));
        curvePoints.push(...this.#generateQuadraticCurvePoints([mid, p12, p2]));
      }

      return curvePoints;
    }
  }
  #appendQuadraticCurvePoints(
    curvePoints: Vector2[],
    controlPoints: Vector2[],
  ) {
    this.#appendCurvePoints(
      curvePoints,
      this.#generateQuadraticCurvePoints(controlPoints),
    );
  }

  #generateCubicCurvePoints(controlPoints: Vector2[]): Vector2[] {
    assertValidNumberOfControlPoints("cubic", controlPoints);
    const [p0, p1, p2, p3] = controlPoints;
    const curvePoints: Vector2[] = [];

    const p01 = getVector2Midpoint(p0, p1);
    const p12 = getVector2Midpoint(p1, p2);
    const p23 = getVector2Midpoint(p2, p3);
    const p012 = getVector2Midpoint(p01, p12);
    const p123 = getVector2Midpoint(p12, p23);
    const mid = getVector2Midpoint(p012, p123);

    const d2a = getVector2DistanceSquared(p1, mid);
    const d2b = getVector2DistanceSquared(p2, mid);

    if (
      d2a <= displayCurveToleranceSquared &&
      d2b <= displayCurveToleranceSquared
    ) {
      curvePoints.push(p3);
    } else {
      curvePoints.push(...this.#generateCubicCurvePoints([p0, p01, p012, mid]));
      curvePoints.push(...this.#generateCubicCurvePoints([mid, p123, p23, p3]));
    }

    return curvePoints;
  }
  #appendCubicCurvePoints(curvePoints: Vector2[], controlPoints: Vector2[]) {
    this.#appendCurvePoints(
      curvePoints,
      this.#generateCubicCurvePoints(controlPoints),
    );
  }

  #generateGenericCurvePoints(
    curveType: DisplayBezierCurveType,
    controlPoints: Vector2[],
    isStart: boolean,
  ) {
    assertValidNumberOfControlPoints(curveType, controlPoints);
    let curvePoints: Vector2[] = [];
    if (isStart) {
      this.#appendCurvePoint(curvePoints, controlPoints[0]);
    }
    switch (curveType) {
      case "segment":
        this.#appendCurvePoint(curvePoints, controlPoints[1]);
        break;
      case "quadratic":
        this.#appendQuadraticCurvePoints(curvePoints, controlPoints);
        break;
      case "cubic":
        this.#appendCubicCurvePoints(curvePoints, controlPoints);
        break;
    }
    return curvePoints;
  }
  #appendGenericCurvePoints(
    curvePoints: Vector2[],
    curveType: DisplayBezierCurveType,
    controlPoints: Vector2[],
    isStart: boolean,
  ) {
    const _curvePoints = this.#generateGenericCurvePoints(
      curveType,
      controlPoints,
      isStart,
    );
    this.#appendCurvePoints(curvePoints, _curvePoints);
  }
  #drawCurveToCanvas(
    curveType: DisplayBezierCurveType,
    controlPoints: Vector2[],
    contextState: DisplayContextState,
  ) {
    const curvePoints = this.#generateGenericCurvePoints(
      curveType,
      controlPoints,
      true,
    );
    this.#drawSegmentsToCanvas(curvePoints, contextState);
  }
  @ForwardToDeviceIfClient(3)
  async drawCurve(
    curveType: DisplayBezierCurveType,
    controlPoints: Vector2[],
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    assertValidNumberOfControlPoints(curveType, controlPoints);
    const contextState = structuredClone(this.contextState);
    this.#rearDrawStack.push(() =>
      this.#drawCurveToCanvas(curveType, controlPoints, contextState),
    );
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.drawCurve(
        curveType,
        controlPoints,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
  }
  #drawCurvesToCanvas(
    curveType: DisplayBezierCurveType,
    controlPoints: Vector2[],
    contextState: DisplayContextState,
  ) {
    assertValidPathNumberOfControlPoints(curveType, controlPoints);
    const numberOfControlPoints =
      displayCurveTypeToNumberOfControlPoints[curveType];
    const curvePointsJump = numberOfControlPoints - 1;
    const numberOfCurves =
      (controlPoints.length - 1) / (numberOfControlPoints - 1);
    //_console.log({ numberOfControlPoints, curvePointsJump, numberOfCurves });

    const curvePoints: Vector2[] = [];
    let curvePointOffset = 0;
    for (let i = 0; i < numberOfCurves; i++) {
      const isStart = i == 0;
      this.#appendGenericCurvePoints(
        curvePoints,
        curveType,
        controlPoints.slice(
          curvePointOffset,
          curvePointOffset + numberOfControlPoints,
        ),
        isStart,
      );
      curvePointOffset += curvePointsJump;
    }
    // _console.log({ curveType, controlPoints, curvePoints });
    this.#drawSegmentsToCanvas(curvePoints, contextState);
  }
  @ForwardToDeviceIfClient(3)
  async drawCurves(
    curveType: DisplayBezierCurveType,
    controlPoints: Vector2[],
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    assertValidPathNumberOfControlPoints(curveType, controlPoints);
    const contextState = structuredClone(this.contextState);
    this.#rearDrawStack.push(() =>
      this.#drawCurvesToCanvas(curveType, controlPoints, contextState),
    );
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.drawCurves(
        curveType,
        controlPoints,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
  }

  async drawQuadraticBezierCurve(
    controlPoints: Vector2[],
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    await this.drawCurve(
      "quadratic",
      controlPoints,
      sendImmediately,
      isSending,
    );
  }
  async drawQuadraticBezierCurves(
    controlPoints: Vector2[],
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    await this.drawCurves(
      "quadratic",
      controlPoints,
      sendImmediately,
      isSending,
    );
  }

  async drawCubicBezierCurve(
    controlPoints: Vector2[],
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    await this.drawCurve("cubic", controlPoints, sendImmediately, isSending);
  }
  async drawCubicBezierCurves(
    controlPoints: Vector2[],
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    await this.drawCurves("cubic", controlPoints, sendImmediately, isSending);
  }

  #drawPathToCanvas(
    isClosed: boolean,
    curves: DisplayBezierCurve[],
    contextState: DisplayContextState,
  ) {
    const curvePoints: Vector2[] = [];
    let _controlPoints: Vector2[];
    curves.forEach((curve, index) => {
      const isStart = index == 0;
      const { type, controlPoints } = curve;
      //_console.log({ type, controlPoints });
      if (isStart) {
        _controlPoints = controlPoints;
      } else {
        _controlPoints = [_controlPoints.at(-1)!, ...controlPoints];
      }
      this.#appendGenericCurvePoints(
        curvePoints,
        type,
        _controlPoints,
        isStart,
      );
    });

    contextState.verticalAlignment = "center";
    contextState.horizontalAlignment = "center";
    if (isClosed) {
      this.#drawPolygonToCanvas(0, 0, curvePoints, contextState);
    } else {
      this.#drawSegmentsToCanvas(curvePoints, contextState);
    }
  }
  @ForwardToDeviceIfClient(3)
  async _drawPath(
    isClosed: boolean,
    curves: DisplayBezierCurve[],
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    assertValidPath(curves);
    const contextState = structuredClone(this.contextState);
    this.#rearDrawStack.push(() =>
      this.#drawPathToCanvas(isClosed, curves, contextState),
    );
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!._drawPath(
        isClosed,
        curves,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
  }
  async drawPath(
    curves: DisplayBezierCurve[],
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    await this._drawPath(false, curves, sendImmediately, isSending);
  }
  async drawClosedPath(
    curves: DisplayBezierCurve[],
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    await this._drawPath(true, curves, sendImmediately, isSending);
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
    }: DisplayContextState,
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
    contextState: DisplayContextState,
  ): DisplayBoundingBox {
    const localBox = this.#getLocalSegmentBoundingBox(
      startX,
      startY,
      endX,
      endY,
      contextState,
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
    clearBoundingBox = true,
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
      contextState,
    );
    const rotatedLocalBox = this.#rotateBoundingBox(localBox, rotation);
    const rotatedBox = this.#offsetBoundingBox(rotatedLocalBox, startX, startY);
    this.#applyClip(rotatedBox, contextState);
    if (this.#clearBoundingBoxOnDraw && clearBoundingBox) {
      this.#clearBoundingBox(rotatedBox, contextState);
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
  @ForwardToDeviceIfClient(5)
  async drawSegment(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    if (startX == endX && startY == endY) {
      _console.error(`cannot draw segment of length 0`);
      return;
    }
    const contextState = structuredClone(this.contextState);
    this.#rearDrawStack.push(() =>
      this.#drawSegmentToCanvas(startX, startY, endX, endY, contextState),
    );
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.drawSegment(
        startX,
        startY,
        endX,
        endY,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
  }
  #getSegmentsBoundingBox(
    points: Vector2[],
    contextState: DisplayContextState,
  ): DisplayBoundingBox {
    const segments: DisplaySegment[] = [];
    points.forEach((point, index) => {
      if (index == points.length - 1) {
        return;
      }
      const nextPoint = points[index + 1];
      segments.push({ start: point, end: nextPoint });
    });
    return this.#_getSegmentsBoundingBox(segments, contextState);
  }
  #_getSegmentsBoundingBox(
    segments: DisplaySegment[],
    { lineWidth, segmentStartRadius, segmentEndRadius }: DisplayContextState,
  ): DisplayBoundingBox {
    const outerPadding = Math.ceil(lineWidth / 2);

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    segments.forEach((segment, index) => {
      const startX = segment.start.x;
      const startY = segment.start.y;
      const endX = segment.end.x;
      const endY = segment.end.y;

      if (index == 0) {
        minX = Math.min(startX - segmentStartRadius, endX - segmentEndRadius);
        maxX = Math.max(startX + segmentStartRadius, endX + segmentEndRadius);
        minY = Math.min(startY - segmentStartRadius, endY - segmentEndRadius);
        maxY = Math.max(endY + segmentStartRadius, endY + segmentEndRadius);
      } else {
        minX = Math.min(
          minX,
          Math.min(startX - segmentStartRadius, endX - segmentEndRadius),
        );
        maxX = Math.max(
          maxX,
          Math.max(startX + segmentStartRadius, endX + segmentEndRadius),
        );
        minY = Math.min(
          minY,
          Math.min(startY - segmentStartRadius, endY - segmentEndRadius),
        );
        maxY = Math.max(
          maxY,
          Math.max(endY + segmentStartRadius, endY + segmentEndRadius),
        );
      }
    });

    const segmentsBoundingBox = {
      x: minX - outerPadding,
      y: minY - outerPadding,
      width: maxX - minX + outerPadding * 2,
      height: maxY - minY + outerPadding * 2,
    };
    //_console.log("segmentsBoundingBox", segmentsBoundingBox);
    return segmentsBoundingBox;
  }
  #drawSegmentsToCanvas(points: Vector2[], contextState: DisplayContextState) {
    this.#updateContext(contextState);

    this.#save();
    const box = this.#getSegmentsBoundingBox(points, contextState);
    if (this.#clearBoundingBoxOnDraw) {
      this.#clearBoundingBox(box, contextState);
    }

    const _clearBoundingBoxOnDraw = this.#_clearBoundingBoxOnDraw;
    this.#_clearBoundingBoxOnDraw = false;
    points.forEach((point, index) => {
      if (index > 0) {
        const previousPoint = points[index - 1];

        const startX = previousPoint.x;
        const startY = previousPoint.y;
        const endX = point.x;
        const endY = point.y;

        this.#drawSegmentToCanvas(
          startX,
          startY,
          endX,
          endY,
          contextState,
          false,
        );
      }
    });
    this.#_clearBoundingBoxOnDraw = _clearBoundingBoxOnDraw;

    this.#restore();
  }
  @ForwardToDeviceIfClient(2)
  async drawSegments(
    points: Vector2[],
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    _console.assertRangeWithError("numberOfPoints", points.length, 2, 255);
    // _console.log({ points });
    const contextState = structuredClone(this.contextState);
    this.#rearDrawStack.push(() =>
      this.#drawSegmentsToCanvas(points, contextState),
    );
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.drawSegments(
        points,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
  }
  #drawArcToCanvas(
    offsetX: number,
    offsetY: number,
    radius: number,
    startAngle: number,
    angleOffset: number,
    isRadians: boolean,
    contextState: DisplayContextState,
  ) {
    this.#drawArcEllipseToCanvas(
      offsetX,
      offsetY,
      radius,
      radius,
      startAngle,
      angleOffset,
      isRadians,
      contextState,
    );
  }

  @ForwardToDeviceIfClient(7)
  async drawArc(
    offsetX: number,
    offsetY: number,
    radius: number,
    startAngle: number,
    angleOffset: number,
    isRadians?: boolean,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    startAngle = isRadians ? startAngle : degToRad(startAngle);
    angleOffset = isRadians ? angleOffset : degToRad(angleOffset);
    isRadians = true;

    const contextState = structuredClone(this.contextState);
    this.#rearDrawStack.push(() =>
      this.#drawArcToCanvas(
        offsetX,
        offsetY,
        radius,
        startAngle,
        angleOffset,
        isRadians,
        contextState,
      ),
    );
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.drawArc(
        offsetX,
        offsetY,
        radius,
        startAngle,
        angleOffset,
        isRadians,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
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
    contextState: DisplayContextState,
  ) {
    _console.log("drawArcEllipseToCanvas");

    startAngle = isRadians ? startAngle : degToRad(startAngle);
    angleOffset = isRadians ? angleOffset : degToRad(angleOffset);
    isRadians = true;

    this.#updateContext(contextState);

    this.#save();
    const localBox = this.#getRectBoundingBox(
      radiusX * 2,
      radiusY * 2,
      contextState,
    );
    const rotatedLocalBox = this.#rotateBoundingBox(
      localBox,
      contextState.rotation,
    );
    const rotatedBox = this.#offsetBoundingBox(
      rotatedLocalBox,
      offsetX,
      offsetY,
    );
    this.#applyClip(rotatedBox, contextState);
    if (this.#clearBoundingBoxOnDraw) {
      this.#clearBoundingBox(rotatedBox, contextState);
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
      !clockwise,
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
        !clockwise,
      );
      this.context.stroke();
    }

    this.#restore();
  }
  @ForwardToDeviceIfClient(8)
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
  ) {
    startAngle = isRadians ? startAngle : degToRad(startAngle);
    angleOffset = isRadians ? angleOffset : degToRad(angleOffset);
    isRadians = true;

    const contextState = structuredClone(this.contextState);
    this.#rearDrawStack.push(() =>
      this.#drawArcEllipseToCanvas(
        offsetX,
        offsetY,
        radiusX,
        radiusY,
        startAngle,
        angleOffset,
        isRadians,
        contextState,
      ),
    );
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.drawArcEllipse(
        offsetX,
        offsetY,
        radiusX,
        radiusY,
        startAngle,
        angleOffset,
        isRadians,
        sendImmediately,
        isSending,
        this,
      );
    }
  }

  #bitmapCanvas = document.createElement("canvas");
  #bitmapContext!: CanvasRenderingContext2D;
  async #drawBitmapToCanvas(
    offsetX: number,
    offsetY: number,
    bitmap: DisplayBitmap,
    contextState: DisplayContextState,
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
      false,
    );
    const rotatedLocalBox = this.#rotateBoundingBox(
      localBox,
      contextState.rotation,
    );
    const rotatedBox = this.#offsetBoundingBox(
      rotatedLocalBox,
      offsetX,
      offsetY,
    );
    this.#applyClip(rotatedBox, contextState);
    if (this.#clearBoundingBoxOnDraw) {
      this.#clearBoundingBox(rotatedBox, contextState);
    }
    this.#transformContext(offsetX, offsetY, contextState.rotation);
    this.#applyRotationClip(localBox, contextState);

    this.#bitmapCanvas.width = bitmap.width;
    this.#bitmapCanvas.height = bitmap.height;

    const bitmapImageData = this.#bitmapContext.createImageData(
      bitmap.width,
      bitmap.height,
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
      this.numberOfColors,
    );
  }
  assertValidBitmap(bitmap: DisplayBitmap) {
    this.assertValidNumberOfColors(bitmap.numberOfColors);
    assertValidBitmapPixels(bitmap);
  }
  @ForwardToDeviceIfClient(4)
  async drawBitmap(
    offsetX: number,
    offsetY: number,
    bitmap: DisplayBitmap,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    _console.log("drawBitmap", {
      offsetX,
      offsetY,
      bitmap,
      sendImmediately,
      isSending,
    });
    this.assertValidBitmap(bitmap);
    const contextState = structuredClone(this.contextState);
    this.#rearDrawStack.push(() =>
      this.#drawBitmapToCanvas(offsetX, offsetY, bitmap, contextState),
    );
    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.drawBitmap(
        offsetX,
        offsetY,
        bitmap,
        sendImmediately,
        isSending,
        this,
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
  getSpriteSheetByIndex(index: number) {
    return getSpriteSheetByIndex(this, index);
  }

  async uploadSpriteSheet(spriteSheet: DisplaySpriteSheet) {
    _console.log("uploadSpriteSheet", spriteSheet);
    verifySpriteSheet(spriteSheet);
    const isPending =
      this.deviceDisplayManager?.pendingSpriteSheet == spriteSheet;
    spriteSheet = structuredClone(spriteSheet);
    if (isPending) {
      _console.log("spriteSheet is already pending under device - won't copy");
      this.deviceDisplayManager!.pendingSpriteSheet = spriteSheet;
    }

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.uploadSpriteSheet(spriteSheet, this);
      const spriteSheetIndex =
        this.deviceDisplayManager!.spriteSheetIndices[spriteSheet.name];
      _console.assertWithError(
        spriteSheetIndex != undefined,
        `no spriteSheetIndex found for spriteSheetName ${spriteSheet.name}`,
      );
      this.#spriteSheets[spriteSheet.name] = spriteSheet;
      this.#spriteSheetIndices[spriteSheet.name] = spriteSheetIndex;
      _console.log(
        `updated spriteSheetIndex #${this.#spriteSheetIndices[spriteSheet.name]} for spriteSheet "${spriteSheet.name}" after uploading to device`,
      );

      if (
        spriteSheetIndex ==
        // @ts-expect-error
        this.deviceDisplayManager!._pendingSelectedSpriteSheetIndex
      ) {
        // @ts-expect-error
        this.deviceDisplayManager!._pendingSelectedSpriteSheetIndex = undefined;
        await this.selectSpriteSheet(spriteSheet.name, true, true);
      }
    } else {
      this.#spriteSheets[spriteSheet.name] = spriteSheet;
      _console.log(`added spriteSheet "${spriteSheet.name} (no index)"`);
    }
  }
  async uploadSpriteSheets(spriteSheets: DisplaySpriteSheet[]) {
    _console.log("uploadSpriteSheets", spriteSheets);
    for (const spriteSheet of spriteSheets) {
      _console.log(`uploading spriteSheet "${spriteSheet.name}"...`);
      await this.uploadSpriteSheet(spriteSheet);
    }
    _console.log("finished uploadSpriteSheets", spriteSheets);
  }
  assertLoadedSpriteSheet(spriteSheetName: string) {
    assertLoadedSpriteSheet(this, spriteSheetName);
  }
  @ForwardToDeviceIfClient(1)
  assertSelectedSpriteSheet(spriteSheetName: string, isSending?: boolean) {
    assertSelectedSpriteSheet(this, spriteSheetName, isSending);
  }
  @ForwardToDeviceIfClient(0)
  assertAnySelectedSpriteSheet(isSending?: boolean) {
    assertAnySelectedSpriteSheet(this, isSending);
  }
  @ForwardToDeviceIfClient(1)
  assertSprite(spriteName: string, isSending?: boolean) {
    return assertSprite(this, spriteName, isSending);
  }
  @ForwardToDeviceIfClient(1)
  getSprite(
    spriteName: string,
    isSending?: boolean,
  ): DisplaySprite | undefined {
    return getSprite(this, spriteName, isSending);
  }
  @ForwardToDeviceIfClient(1)
  getSpriteSheetPalette(
    paletteName: string,
    isSending?: boolean,
  ): DisplaySpriteSheetPalette | undefined {
    return getSpriteSheetPalette(this, paletteName, isSending);
  }
  @ForwardToDeviceIfClient(1)
  getSpriteSheetPaletteSwap(
    paletteSwapName: string,
    isSending?: boolean,
  ): DisplaySpriteSheetPaletteSwap | undefined {
    return getSpriteSheetPaletteSwap(this, paletteSwapName, isSending);
  }
  @ForwardToDeviceIfClient(2)
  getSpritePaletteSwap(
    spriteName: string,
    paletteSwapName: string,
    isSending?: boolean,
  ): DisplaySpritePaletteSwap | undefined {
    return getSpritePaletteSwap(this, spriteName, paletteSwapName, isSending);
  }
  @ForwardToDeviceIfClient(0)
  getSelectedSpriteSheet(isSending?: boolean) {
    if (this.contextState.spriteSheetName) {
      return this.#spriteSheets[this.contextState.spriteSheetName];
    }
  }
  @ForwardToDeviceIfClient(0)
  getSelectedSpriteSheetIndex(isSending?: boolean) {
    return this.#spriteSheetIndices[
      this.getSelectedSpriteSheetName(isSending)!
    ];
  }
  @ForwardToDeviceIfClient(0)
  getSelectedSpriteSheetName(isSending?: boolean) {
    return this.getSelectedSpriteSheet(isSending)?.name;
  }
  @ForwardToDeviceIfClient(2)
  async selectSpriteSheet(
    spriteSheetName: string,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    this.assertLoadedSpriteSheet(spriteSheetName);
    const differences = this.#contextStateHelper.update({
      spriteSheetName,
    });

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.selectSpriteSheet(
        spriteSheetName,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
    this.#onContextStateUpdate(differences);
  }
  #runSpriteCommand(
    command: DisplayContextCommand,
    contextState: DisplayContextState,
  ) {
    // _console.log("runSpriteCommand", command);
    if (command.type == "drawSprite") {
      const spriteSheet = this.spriteSheets[contextState.spriteSheetName!];
      const sprite = spriteSheet.sprites[command.spriteIndex];
      if (sprite) {
        _console.log("drawing sub sprite", sprite);
        const _contextState = structuredClone(this.contextState);
        this.#saveContextForSprite(
          command.offsetX,
          command.offsetY,
          sprite,
          _contextState,
        );
        sprite.commands.forEach((command) => {
          this.#runSpriteCommand(command, _contextState);
        });
        this.#restoreContextForSprite();
      } else {
        _console.error(
          `sprite index ${command.spriteIndex} not found in spriteSheet`,
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
    contextState: DisplayContextState,
  ) {
    _console.log("drawSprite");
    //this.#setIgnoreDevice(true);
    this.#saveContextForSprite(offsetX, offsetY, sprite, contextState);
    this.#setIsDrawingSprite(true);

    sprite.commands.forEach((command) => {
      this.#runSpriteCommand(command, contextState);
    });

    this.#restoreContextForSprite();
    this.#setIsDrawingSprite(false);
    //this.#setIgnoreDevice(false);
    _console.log("finished drawSprite");
  }
  @ForwardToDeviceIfClient(4)
  async drawSprite(
    offsetX: number,
    offsetY: number,
    spriteName: string,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    _console.log("drawSprite", { offsetX, offsetY, spriteName });
    _console.assertWithError(
      this.getSelectedSpriteSheet(isSending),
      "no spriteSheet selected",
    );
    const sprite = this.getSelectedSpriteSheet(isSending)?.sprites.find(
      (sprite) => sprite.name == spriteName,
    );
    _console.assertWithError(sprite, `sprite "${spriteName}" not found`);
    _console.assertWithError("width" in sprite!, "sprite has no width");
    _console.assertWithError("height" in sprite!, "sprite has no height");

    const contextState = structuredClone(this.contextState);
    this.#drawSpriteToCanvas(offsetX, offsetY, sprite!, contextState);

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.drawSprite(
        offsetX,
        offsetY,
        spriteName,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
  }
  #drawSpritesToCanvas(
    offsetX: number,
    offsetY: number,
    spriteLines: DisplaySpriteLines,
    contextState: DisplayContextState,
  ) {
    _console.log("#drawSpritesToCanvas", spriteLines);

    const { expandedSpritesLines, lineBreadths, localSize, size } =
      getSpriteLinesMetrics(spriteLines, this.#spriteSheets, contextState);

    const isSpritesDirectionPositive = isDirectionPositive(
      contextState.spritesDirection,
    );
    const isSpritesLineDirectionPositive = isDirectionPositive(
      contextState.spritesLineDirection,
    );

    const isSpritesDirectionHorizontal = isDirectionHorizontal(
      contextState.spritesDirection,
    );
    const isSpritesLineDirectionHorizontal = isDirectionHorizontal(
      contextState.spritesLineDirection,
    );

    const areSpritesDirectionsOrthogonal =
      isSpritesDirectionHorizontal != isSpritesLineDirectionHorizontal;

    const breadthSizeKey = isSpritesDirectionHorizontal ? "width" : "height";

    const spritesBreadthSign = isSpritesDirectionPositive ? 1 : -1;
    const spritesDepthSign = isSpritesLineDirectionPositive ? 1 : -1;

    //this.#setIgnoreDevice(true);
    this.#setCanvasContextTransform(
      offsetX,
      offsetY,
      localSize.width,
      localSize.height,
      contextState,
    );
    this.#setIsDrawingSprite(true);

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
        spritesBreadthStart = -localSize.width / 2;
        break;
      case "left":
        spritesBreadthStart = localSize.width / 2;
        break;
      case "up":
        spritesBreadthStart = localSize.height / 2;
        break;
      case "down":
        spritesBreadthStart = -localSize.height / 2;
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
          spriteOffset[depthOffsetKey] = -localSize.width / 2;
          break;
        case "left":
          spriteOffset[depthOffsetKey] = localSize.width / 2;
          break;
        case "up":
          spriteOffset[depthOffsetKey] = localSize.height / 2;
          break;
        case "down":
          spriteOffset[depthOffsetKey] = -localSize.height / 2;
          break;
      }
    } else {
      switch (contextState.spritesDirection) {
        case "right":
        case "left":
          spriteOffset.y = -localSize.height / 2;
          break;
        case "up":
        case "down":
          spriteOffset.x = -localSize.width / 2;
          break;
      }
    }

    expandedSpritesLines.forEach((_spritesLine, lineIndex) => {
      const spritesLineBreadth = lineBreadths[lineIndex];
      if (areSpritesDirectionsOrthogonal) {
        switch (contextState.spritesLineAlignment) {
          case "start":
            spriteOffset[breadthOffsetKey] = spritesBreadthStart;
            break;
          case "center":
            spriteOffset[breadthOffsetKey] =
              spritesBreadthStart +
              spritesBreadthSign *
                ((localSize[breadthSizeKey] - spritesLineBreadth) / 2);
            break;
          case "end":
            spriteOffset[breadthOffsetKey] =
              spritesBreadthStart +
              spritesBreadthSign *
                (localSize[breadthSizeKey] - spritesLineBreadth);
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
          spriteContextState,
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

    this.#setIsDrawingSprite(false);
    //this.#setIgnoreDevice(false);

    _console.log("finished #drawSpritesToCanvas");
  }
  @ForwardToDeviceIfClient(4)
  async drawSprites(
    offsetX: number,
    offsetY: number,
    spriteLines: DisplaySpriteLines,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    _console.assertWithError(
      this.contextState.spritesLineHeight > 0,
      `spritesLineHeight must be >0`,
    );
    assertValidSpriteLines(this, spriteLines);

    const contextState = structuredClone(this.contextState);
    this.#drawSpritesToCanvas(offsetX, offsetY, spriteLines, contextState);

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.drawSprites(
        offsetX,
        offsetY,
        spriteLines,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
  }
  async drawSpriteFromSpriteSheet(
    offsetX: number,
    offsetY: number,
    spriteName: string,
    spriteSheet: DisplaySpriteSheet,
    paletteName?: string,
    sendImmediately?: boolean,
    isSending?: boolean,
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
  @ForwardToDeviceIfClient(7)
  async drawSpritesString(
    offsetX: number,
    offsetY: number,
    string: string,
    requireAll?: boolean,
    maxLineBreadth?: number,
    separators?: string[],
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    _console.log("drawSpritesString", { offsetX, offsetY, string, isSending });
    const spriteLines = this.stringToSpriteLines(
      string,
      requireAll,
      maxLineBreadth,
      separators,
      isSending,
    );
    await this.drawSprites(
      offsetX,
      offsetY,
      spriteLines,
      sendImmediately,
      isSending,
    );
  }
  @ForwardToDeviceIfClient(4)
  stringToSpriteLines(
    string: string,
    requireAll?: boolean,
    maxLineBreadth?: number,
    separators?: string[],
    isSending?: boolean,
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
  @ForwardToDeviceIfClient(4)
  stringToSpriteLinesMetrics(
    string: string,
    requireAll?: boolean,
    maxLineBreadth?: number,
    separators?: string[],
    isSending?: boolean,
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
  #didSetBrightness = false;
  #flushBrightness() {
    if (!this.#didSetBrightness) {
      return false;
    }
    _console.log("flushBrightness");
    this.#didSetBrightness = false;
    return true;
  }
  async setBrightness(
    newBrightness: DisplayBrightness,
    sendImmediately?: boolean,
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
        sendImmediately,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
    this.#didSetBrightness = true;
    this.#dispatchEvent("brightness", { brightness: this.brightness });
  }
  async #resetBrightness() {
    await this.setBrightness("medium");
  }
  async #updateDeviceBrightness(
    sendImmediately?: boolean,
    updateSelf?: boolean,
  ) {
    if (!this.device?.isConnected) {
      return;
    }
    // _console.log("updateDeviceBrightness");
    if (updateSelf) {
      await this.setBrightness(
        this.deviceDisplayManager!.brightness,
        sendImmediately,
      );
    } else {
      await this.deviceDisplayManager!.setBrightness(
        this.brightness,
        sendImmediately,
        this,
      );
    }
  }
  async #updateDeviceSpriteSheets(updateSelf?: boolean) {
    if (!this.device?.isConnected) {
      return;
    }
    _console.log("updateDeviceSpriteSheets", { updateSelf });
    // TODO: - is updateSelf needed?
    const sortedSpriteSheets = Object.values(this.spriteSheets).sort(
      (a, b) =>
        this.spriteSheetIndices[a.name] - this.spriteSheetIndices[b.name],
    );
    _console.log("sortedSpriteSheets", sortedSpriteSheets);
    await this.uploadSpriteSheets(sortedSpriteSheets);
  }
  async #updateDeviceSelectedSpriteSheet(
    sendImmediately?: boolean,
    isSending?: boolean,
    updateSelf?: boolean,
  ) {
    if (!this.device?.isConnected) {
      return;
    }
    if (!this.getSelectedSpriteSheetName(isSending)) {
      return;
    }
    _console.log("updateDeviceSelectedSpriteSheet", {
      sendImmediately,
      isSending,
      updateSelf,
    });

    await this.deviceDisplayManager?.selectSpriteSheet(
      this.getSelectedSpriteSheetName(isSending)!,
      sendImmediately,
      isSending,
      this,
    );
  }

  // CONTEXT COMMANDS
  async runContextCommand(
    command: DisplayContextCommand,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    return runDisplayContextCommand(this, command, sendImmediately, isSending);
  }
  async runContextCommands(
    commands: DisplayContextCommand[],
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    return runDisplayContextCommands(
      this,
      commands,
      sendImmediately,
      isSending,
    );
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

    const parsedContextCommands = parseDisplayContextCommands(this, dataView);
    _console.log("parsedContextCommands", parsedContextCommands);
    await this.runContextCommands(
      parsedContextCommands,
      sendImmediately,
      isSending,
    );
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
    contextState: DisplayContextState,
  ) {
    this.#rearDrawStack.push(() => {
      const scaledWidth = width * Math.abs(contextState.spriteScaleX);
      const scaledHeight = height * Math.abs(contextState.spriteScaleY);

      this.#save();
      const localBox = this.#getRectBoundingBox(
        scaledWidth,
        scaledHeight,
        contextState,
        false,
      );
      const rotatedLocalBox = this.#rotateBoundingBox(
        localBox,
        contextState.rotation,
      );
      const rotatedBox = this.#offsetBoundingBox(
        rotatedLocalBox,
        offsetX,
        offsetY,
      );
      this.#applyClip(rotatedBox, contextState);
      if (this.#clearBoundingBoxOnDraw) {
        this.#clearBoundingBox(rotatedBox, contextState);
      }
      this.#transformContext(offsetX, offsetY, contextState.rotation);
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

  #_ignoreDevice = false;
  #_ignoreDeviceCounter = 0;
  #setIgnoreDevice(newIgnoreDevice: boolean, override = false) {
    if (override) {
      this.#_ignoreDeviceCounter = newIgnoreDevice ? 1 : 0;
    } else {
      this.#_ignoreDeviceCounter += newIgnoreDevice ? 1 : -1;
      this.#_ignoreDeviceCounter = Math.max(0, this.#_ignoreDeviceCounter);
      _console.log({
        ignoreDeviceCounter: this.#_ignoreDeviceCounter,
      });
    }
    const ignoreDevice = this.#_ignoreDeviceCounter > 0;
    this.#_ignoreDevice = ignoreDevice;
    _console.log({
      ignoreDevice,
    });
    this.#rearDrawStack.push(() => {
      //_console.log({ ignoreDevice });
      this.#_ignoreDevice = ignoreDevice;
    });
  }
  get ignoreDevice() {
    return this.#ignoreDevice;
  }
  get #ignoreDevice() {
    if (this.#_ignoreDevice) {
      return true;
    }
    if (this.#isDrawingBlankSprite) {
      return this.#isDrawingSpriteCounter > 1;
    }
    return this.#isDrawingSprite;
  }
  get #useSpriteColorIndices() {
    return this.#isDrawingSprite;
  }
  #spriteContextStack: DisplayContextState[] = [];
  #spriteStack: DisplaySprite[] = [];
  #saveContextForSprite(
    offsetX: number,
    offsetY: number,
    sprite: DisplaySprite | DisplaySize,
    contextState: DisplayContextState,
  ) {
    this.#setCanvasContextTransform(
      offsetX,
      offsetY,
      sprite.width,
      sprite.height,
      contextState,
    );

    if ("name" in sprite) {
      _console.assertWithError(
        !this.#spriteStack.includes(sprite),
        `cyclical sprite ${sprite.name} found in stack`,
      );
    }

    _console.log("#saveContextForSprite", contextState);
    this.#spriteContextStack.push(contextState);
    this.#resetContextState(true, true);
  }
  #restoreContextForSprite() {
    this.#resetCanvasContextTransform();

    const contextState = this.#spriteContextStack.pop();
    if (!contextState) {
      _console.warn("#spriteContextStack empty");
      return;
    }
    _console.log("#restoreContextForSprite", contextState);
    this.#contextStateHelper.update(contextState);
  }

  #runPreviewSpriteCommand(
    command: DisplayContextCommand,
    spriteSheet: DisplaySpriteSheet,
  ) {
    //_console.log("runPreviewSpriteCommand", command);
    if (command.type == "drawSprite") {
      const sprite = spriteSheet.sprites[command.spriteIndex];
      if (sprite) {
        _console.log("drawing sub sprite", sprite);
        const contextState = structuredClone(this.contextState);
        this.#saveContextForSprite(
          command.offsetX,
          command.offsetY,
          sprite,
          contextState,
        );
        sprite.commands.forEach((command) => {
          this.#runPreviewSpriteCommand(command, spriteSheet);
        });
        this.#restoreContextForSprite();
      } else {
        _console.error(
          `spriteIndex ${command.spriteIndex} not found in spriteSheet`,
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
    spriteSheet: DisplaySpriteSheet,
  ) {
    //this.#setIgnoreDevice(true);
    const contextState = structuredClone(this.contextState);
    this.#saveContextForSprite(offsetX, offsetY, sprite, contextState);
    this.#setIsDrawingSprite(true);

    sprite.commands.forEach((command) => {
      this.#runPreviewSpriteCommand(command, spriteSheet);
    });

    this.#restoreContextForSprite();
    this.#setIsDrawingSprite(false);
    //this.#setIgnoreDevice(false);
  }
  previewSpriteCommands(commands: DisplayContextCommand[]) {
    this.#setIsDrawingSprite(true);

    commands.forEach((command) => {
      this.runContextCommand(command);
    });

    this.#setIsDrawingSprite(false);
  }

  // SPRITE SHEET PALETTES

  assertSpriteSheetPalette(paletteName: string, isSending?: boolean) {
    assertSpriteSheetPalette(this, paletteName, isSending);
  }
  assertSpriteSheetPaletteSwap(paletteSwapName: string, isSending?: boolean) {
    assertSpriteSheetPaletteSwap(this, paletteSwapName, isSending);
  }
  assertSpritePaletteSwap(
    spriteName: string,
    paletteSwapName: string,
    isSending?: boolean,
  ) {
    assertSpritePaletteSwap(this, spriteName, paletteSwapName, isSending);
  }
  @ForwardToDeviceIfClient(4)
  async selectSpriteSheetPalette(
    paletteName: string,
    offset?: number,
    indicesOnly?: boolean,
    sendImmediately?: boolean,
    isSending?: boolean,
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
  @ForwardToDeviceIfClient(3)
  async selectSpriteSheetPaletteSwap(
    paletteSwapName: string,
    offset?: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    await selectSpriteSheetPaletteSwap(
      this,
      paletteSwapName,
      offset,
      sendImmediately,
      isSending,
    );
  }
  @ForwardToDeviceIfClient(4)
  async selectSpritePaletteSwap(
    spriteName: string,
    paletteSwapName: string,
    offset?: number,
    sendImmediately?: boolean,
    isSending?: boolean,
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

  #reset() {
    this.#setIsDrawingSprite(false, true);
    this.#setIgnoreDevice(false, true);
    this.#resetColors();
    this.#resetOpacities();
    this.#resetContextState();
    this.#resetBrightness();
    Object.keys(this.#spriteSheets).forEach(
      (spriteSheetName) => delete this.#spriteSheets[spriteSheetName],
    );
    Object.keys(this.#spriteSheetIndices).forEach(
      (spriteSheetName) => delete this.#spriteSheetIndices[spriteSheetName],
    );
    this.#isDrawingBlankSprite = false;
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

  serializeSpriteSheet(
    spriteSheet: DisplaySpriteSheet,
    includeHeader?: boolean,
  ): ArrayBuffer {
    return serializeSpriteSheet(this, spriteSheet, includeHeader);
  }
  parseSpriteSheet(
    dataView: DataView<ArrayBuffer>,
    name?: string,
    includesHeader?: boolean,
  ) {
    return parseSpriteSheet(this, dataView, name, includesHeader);
  }

  #startSprite(
    offsetX: number,
    offsetY: number,
    width: number,
    height: number,
    contextState: DisplayContextState,
  ) {
    //this.#setIgnoreDevice(true);
    this.#saveContextForSprite(
      offsetX,
      offsetY,
      { width, height },
      contextState,
    );
    this.#setIsDrawingSprite(true);

    this.#blankSpriteColorIndices =
      this.contextState.spriteColorIndices.slice();
    _console.log("#blankSpriteColorIndices", this.#blankSpriteColorIndices);
  }
  #isDrawingSprite = false;
  #isDrawingSpriteCounter = 0;
  #setIsDrawingSprite(newIsDrawingSprite: boolean, override = false) {
    if (override) {
      this.#isDrawingSpriteCounter = newIsDrawingSprite ? 1 : 0;
    } else {
      this.#isDrawingSpriteCounter += newIsDrawingSprite ? 1 : -1;
      this.#isDrawingSpriteCounter = Math.max(0, this.#isDrawingSpriteCounter);
      _console.log({
        isDrawingSpriteCounter: this.#isDrawingSpriteCounter,
      });
    }
    const isDrawingSprite = this.#isDrawingSpriteCounter > 0;
    this.#isDrawingSprite = isDrawingSprite;
    _console.log({
      isDrawingSprite,
    });
    this.#rearDrawStack.push(() => {
      //_console.log({ isDrawingSprite });
      this.#isDrawingSprite = isDrawingSprite;
    });
  }
  #isDrawingBlankSprite = false;
  #blankSpriteColorIndices?: number[];
  @ForwardToDeviceIfClient(5)
  async startSprite(
    offsetX: number,
    offsetY: number,
    width: number,
    height: number,
    sendImmediately?: boolean,
    isSending?: boolean,
  ) {
    _console.assertWithError(
      !this.#isDrawingBlankSprite,
      `already drawing blank sprite`,
    );
    this.#isDrawingBlankSprite = true;

    const contextState = structuredClone(this.contextState);
    this.#startSprite(offsetX, offsetY, width, height, contextState);

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.startSprite(
        offsetX,
        offsetY,
        width,
        height,
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
  }
  #endSprite() {
    this.#restoreContextForSprite();
    this.#blankSpriteColorIndices = undefined;
    this.#setIsDrawingSprite(false);
    this.#setIgnoreDevice(false);
  }
  @ForwardToDeviceIfClient(1)
  async endSprite(sendImmediately?: boolean, isSending?: boolean) {
    _console.assertWithError(
      this.#isDrawingBlankSprite,
      `not drawing blank sprite`,
    );
    this.#isDrawingBlankSprite = false;

    this.#endSprite();

    if (this.device?.isConnected && !this.#ignoreDevice) {
      await this.deviceDisplayManager!.endSprite(
        sendImmediately,
        isSending,
        this,
      );
    } else {
      if (sendImmediately) {
        this.#onSentContextCommands();
      }
    }
  }
}
export default DisplayCanvasHelper;
