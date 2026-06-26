import { createConsole } from "../utils/Console.ts";
import { addEventListeners } from "../utils/EventUtils.ts";

import EventDispatcher, {
  EventDispatcherTypes,
  WildcardEventType,
  wildcardEventType,
} from "../utils/EventDispatcher.ts";
import { capitalizeFirstCharacter } from "../utils/stringUtils.ts";
import {
  AddPrefixToInterfaceKeys,
  ExtendInterfaceValues,
  IfAny,
  KeyOf,
} from "../utils/TypeScriptUtils.ts";
import DisplayCanvasHelper, {
  BoundDisplayCanvasHelperEventListeners,
  DisplayCanvasHelperEventMap,
  DisplayCanvasHelperEventMessages,
  DisplayCanvasHelperEventType,
  DisplayCanvasHelperEventTypes,
} from "./DisplayCanvasHelper.ts";
import Device from "../Device.ts";
import DisplayManager from "../DisplayManager.ts";

const _console = createConsole("DisplayCanvasHelperManager", { log: true });

interface BaseDisplayCanvasHelperManagerDisplayCanvasHelperEventMessage {
  displayCanvasHelper: DisplayCanvasHelper;
}
type DisplayCanvasHelperManagerDisplayCanvasHelperEventMessages =
  ExtendInterfaceValues<
    AddPrefixToInterfaceKeys<
      DisplayCanvasHelperEventMessages,
      "displayCanvasHelper"
    >,
    BaseDisplayCanvasHelperManagerDisplayCanvasHelperEventMessage
  >;
type DisplayCanvasHelperManagerDisplayCanvasHelperEventType =
  KeyOf<DisplayCanvasHelperManagerDisplayCanvasHelperEventMessages>;
function getDisplayCanvasHelperManagerDisplayCanvasHelperEventTypes(
  displayCanvasHelperEventType: DisplayCanvasHelperEventType,
) {
  return ["displayCanvasHelper"].map(
    (prefix) =>
      `${prefix}${capitalizeFirstCharacter(
        displayCanvasHelperEventType,
      )}` as DisplayCanvasHelperManagerDisplayCanvasHelperEventType,
  );
}
const DisplayCanvasHelperManagerDisplayCanvasHelperEventTypes =
  DisplayCanvasHelperEventTypes.flatMap((eventType) =>
    getDisplayCanvasHelperManagerDisplayCanvasHelperEventTypes(eventType),
  ) as DisplayCanvasHelperManagerDisplayCanvasHelperEventType[];

export const wildcardDisplayCanvasHelperEventType =
  "displayCanvasHelper*" as const;
export type WildcardDisplayCanvasHelperEventType =
  typeof wildcardDisplayCanvasHelperEventType;

const BaseDisplayCanvasHelperManagerEventTypes = [
  "displayCanvasHelper",
  "displayCanvasHelpers",
  wildcardDisplayCanvasHelperEventType,
] as const;
type BaseDisplayCanvasHelperManagerEventType =
  (typeof BaseDisplayCanvasHelperManagerEventTypes)[number];

export type WildcardDisplayCanvasHelperEventMessage<BaseMessage> = {
  [K in DisplayCanvasHelperEventType]: BaseMessage &
    (K extends keyof DisplayCanvasHelperEventMessages
      ? IfAny<
          DisplayCanvasHelperEventMessages[K],
          {},
          DisplayCanvasHelperEventMessages[K]
        >
      : {}) & {
      displayCanvasHelperType: K;
      displayCanvasHelper: DisplayCanvasHelper;
    };
}[DisplayCanvasHelperEventType];

interface BaseDisplayCanvasHelperManagerEventMessages {
  displayCanvasHelper: { displayCanvasHelper: DisplayCanvasHelper };
  displayCanvasHelpers: { displayCanvasHelpers: DisplayCanvasHelper[] };
  [wildcardDisplayCanvasHelperEventType]: WildcardDisplayCanvasHelperEventMessage<BaseDisplayCanvasHelperManagerDisplayCanvasHelperEventMessage>;
}

export const DisplayCanvasHelperManagerEventTypes = [
  ...DisplayCanvasHelperManagerDisplayCanvasHelperEventTypes,
  ...BaseDisplayCanvasHelperManagerEventTypes,
] as const;
export type DisplayCanvasHelperManagerEventType =
  (typeof DisplayCanvasHelperManagerEventTypes)[number];

export type DisplayCanvasHelperManagerEventMessages =
  DisplayCanvasHelperManagerDisplayCanvasHelperEventMessages &
    BaseDisplayCanvasHelperManagerEventMessages;

export type DisplayCanvasHelperManagerEventDisptcherTypes =
  EventDispatcherTypes<
    DisplayCanvasHelperManager,
    DisplayCanvasHelperManagerEventType,
    DisplayCanvasHelperManagerEventMessages
  >;
export type DisplayCanvasHelperManagerEvent =
  DisplayCanvasHelperManagerEventDisptcherTypes["Event"];
export type DisplayCanvasHelperManagerEventMap =
  DisplayCanvasHelperManagerEventDisptcherTypes["EventMap"];
export type DisplayCanvasHelperManagerEventListenerMap =
  DisplayCanvasHelperManagerEventDisptcherTypes["EventListenerMap"];
export type DisplayCanvasHelperManagerEventDispatcher =
  DisplayCanvasHelperManagerEventDisptcherTypes["EventDispatcher"];
export type BoundDisplayCanvasHelperManagerEventListeners =
  DisplayCanvasHelperManagerEventDisptcherTypes["BoundEventListeners"];

class DisplayCanvasHelperManager {
  static readonly shared = new DisplayCanvasHelperManager();

  constructor() {
    if (
      DisplayCanvasHelperManager.shared &&
      this != DisplayCanvasHelperManager.shared
    ) {
      throw Error(
        "DisplayCanvasHelperManager is a singleton - use DisplayCanvasHelperManager.shared",
      );
    }

    // @ts-expect-error
    DisplayCanvasHelper.OnDisplayCanvasHelper =
      this.onDisplayCanvasHelper.bind(this);
  }

  #displayCanvasHelpers: DisplayCanvasHelper[] = [];
  get displayCanvasHelpers() {
    return this.#displayCanvasHelpers;
  }
  findDisplayCanvasHelpersByDevice(device: Device) {
    return this.displayCanvasHelpers.find(
      (displayCanvasHelper) => displayCanvasHelper.device == device,
    );
  }
  findDisplayCanvasHelpersByDisplayManager(displayManager: DisplayManager) {
    return this.displayCanvasHelpers.find(
      (displayCanvasHelper) =>
        displayCanvasHelper.device?.displayManager == displayManager,
    );
  }

  // DISPLAY CANVAS HELPER LISTENERS
  #boundDisplayCanvasHelperEventListeners: BoundDisplayCanvasHelperEventListeners =
    {
      [wildcardEventType]: this.#onDisplayCanvasHelperEvent.bind(this),
    };
  private onDisplayCanvasHelper(displayCanvasHelper: DisplayCanvasHelper) {
    _console.log("onDisplayCanvasHelper", displayCanvasHelper);
    addEventListeners(
      displayCanvasHelper,
      this.#boundDisplayCanvasHelperEventListeners,
    );
    if (!this.#displayCanvasHelpers.includes(displayCanvasHelper)) {
      _console.log("displayCanvasHelper", displayCanvasHelper);
      this.#displayCanvasHelpers.push(displayCanvasHelper);
      this.#dispatchEvent("displayCanvasHelper", { displayCanvasHelper });
      this.#dispatchEvent("displayCanvasHelpers", {
        displayCanvasHelpers: this.displayCanvasHelpers,
      });
    }
  }

  // STATIC EVENTLISTENERS

  #eventDispatcher: DisplayCanvasHelperManagerEventDispatcher =
    new EventDispatcher(
      this as DisplayCanvasHelperManager,
      DisplayCanvasHelperManagerEventTypes,
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
  get removeEventListeners() {
    return this.#eventDispatcher.removeEventListeners;
  }
  // removeAllEventListeners() {
  //   this.#eventDispatcher.removeAllEventListeners();
  // }

  #onDisplayCanvasHelperEvent(
    displayCanvasHelperEvent: DisplayCanvasHelperEventMap[WildcardEventType],
  ) {
    const {
      type: displayCanvasHelperType,
      target: displayCanvasHelper,
      message,
    } = displayCanvasHelperEvent;

    // @ts-expect-error
    this.#dispatchEvent(wildcardDisplayCanvasHelperEventType, {
      ...message,
      displayCanvasHelper,
      displayCanvasHelperType,
    });

    getDisplayCanvasHelperManagerDisplayCanvasHelperEventTypes(
      displayCanvasHelperType as DisplayCanvasHelperEventType,
    ).forEach((_type) => {
      this.#dispatchEvent(_type, {
        ...message,
        displayCanvasHelper,
      });
    });
  }
}

export default DisplayCanvasHelperManager.shared;
