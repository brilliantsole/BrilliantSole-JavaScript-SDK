import EventDispatcher, {
  EventDispatcherTypes,
  WildcardEventType,
  wildcardEventType,
} from "../utils/EventDispatcher.ts";
import { createConsole } from "../utils/Console.ts";
import { addEventListeners } from "../utils/EventUtils.ts";
import {
  AddPrefixToInterfaceKeys,
  ExtendInterfaceValues,
  IfAny,
  KeyOf,
  Singleton,
} from "../utils/TypeScriptUtils.ts";
import {
  ScannerEventType,
  ScannerEventTypes,
  BoundScannerEventListeners,
  ScannerEventMap,
  ScannerEventMessages,
} from "./BaseScanner.ts";
import {
  default as ClientManager,
  ClientManagerEventMap,
} from "../server/ClientManager.ts";

import { capitalizeFirstCharacter } from "../utils/stringUtils.ts";
import { default as scanner, ScannerLike } from "./Scanner.ts";
import { DiscoveredDevicesMap } from "./DiscoveredDevice.ts";

const _console = createConsole("ScannerManager", { log: false });

interface BaseScannerManagerScannerEventMessage {
  scanner: ScannerLike;
}
type ScannerManagerScannerEventMessages = ExtendInterfaceValues<
  AddPrefixToInterfaceKeys<ScannerEventMessages, "scanner">,
  BaseScannerManagerScannerEventMessage
>;
type ScannerManagerScannerEventType = KeyOf<ScannerManagerScannerEventMessages>;
function getScannerManagerScannerEventTypes(
  scannerEventType: ScannerEventType,
) {
  return ["scanner"].map(
    (prefix) =>
      `${prefix}${capitalizeFirstCharacter(
        scannerEventType,
      )}` as ScannerManagerScannerEventType,
  );
}
const ScannerManagerScannerEventTypes = ScannerEventTypes.flatMap((eventType) =>
  getScannerManagerScannerEventTypes(eventType),
) as ScannerManagerScannerEventType[];

export const wildcardScannerEventType = "scanner*" as const;
export type WildcardScannerEventType = typeof wildcardScannerEventType;

const BaseScannerManagerEventTypes = [
  "scanner",
  "scanners",
  "discoveredDevices",
  wildcardScannerEventType,
] as const;
type BaseScannerManagerEventType =
  (typeof BaseScannerManagerEventTypes)[number];

export type WildcardScannerEventMessage<BaseMessage> = {
  [K in ScannerEventType]: BaseMessage &
    (K extends keyof ScannerEventMessages
      ? IfAny<ScannerEventMessages[K], {}, ScannerEventMessages[K]>
      : {}) & {
      scannerEventType: K;
      scanner: ScannerLike;
    };
}[ScannerEventType];

interface BaseScannerManagerEventMessages {
  scanner: { scanner: ScannerLike };
  scanners: { scanners: ScannerLike[] };
  discoveredDevices: { discoveredDevices: DiscoveredDevicesMap };
  [wildcardScannerEventType]: WildcardScannerEventMessage<BaseScannerManagerScannerEventMessage>;
}

export const ScannerManagerEventTypes = [
  ...ScannerManagerScannerEventTypes,
  ...BaseScannerManagerEventTypes,
] as const;
export type ScannerManagerEventType = (typeof ScannerManagerEventTypes)[number];

export type ScannerManagerEventMessages = ScannerManagerScannerEventMessages &
  BaseScannerManagerEventMessages;

export type ScannerManagerEventDisptcherTypes = EventDispatcherTypes<
  ScannerManager,
  ScannerManagerEventType,
  ScannerManagerEventMessages
>;
export type ScannerManagerEvent = ScannerManagerEventDisptcherTypes["Event"];
export type ScannerManagerEventMap =
  ScannerManagerEventDisptcherTypes["EventMap"];
export type ScannerManagerEventListenerMap =
  ScannerManagerEventDisptcherTypes["EventListenerMap"];
export type ScannerManagerEventDispatcher =
  ScannerManagerEventDisptcherTypes["EventDispatcher"];
export type BoundScannerManagerEventListeners =
  ScannerManagerEventDisptcherTypes["BoundEventListeners"];

@Singleton
class ScannerManager {
  static readonly shared: ScannerManager;

  constructor() {
    this.#onScanner(scanner);
    addEventListeners(ClientManager, this.#boundClientManagerListeners);
  }

  #scanners: ScannerLike[] = [];
  get scanners() {
    return this.#scanners;
  }

  #discoveredDevices: DiscoveredDevicesMap = {};
  get discoveredDevices() {
    return this.#discoveredDevices;
  }

  #boundScannerEventListeners: BoundScannerEventListeners = {
    [wildcardEventType]: this.#onScannerEvent.bind(this),
    discoveredDevice: this.#onDiscoveredDevice.bind(this),
    expiredDiscoveredDevice: this.#onExpiredDiscoveredDevice.bind(this),
  };
  #onScanner(scanner: ScannerLike) {
    _console.log("onScanner", scanner);
    addEventListeners(scanner, this.#boundScannerEventListeners);
    if (!this.#scanners.includes(scanner)) {
      _console.log("adding scanner", scanner);
      this.#scanners.push(scanner);
      this.#dispatchEvent("scanner", { scanner });
      this.#dispatchEvent("scanners", {
        scanners: this.scanners,
      });
    }
  }
  #onDiscoveredDevice(scannerEvent: ScannerEventMap["discoveredDevice"]) {
    const { type: scannerEventType, target: scanner, message } = scannerEvent;
    const { discoveredDevice } = message;
    _console.log("#onDiscoveredDevice", discoveredDevice);
    this.#discoveredDevices[discoveredDevice.bluetoothId] = discoveredDevice;
    if (message.firstTime) {
      this.#dispatchEvent("discoveredDevices", {
        discoveredDevices: this.#discoveredDevices,
      });
    }
  }
  #onExpiredDiscoveredDevice(
    scannerEvent: ScannerEventMap["expiredDiscoveredDevice"],
  ) {
    const { type: scannerEventType, target: scanner, message } = scannerEvent;
    const { discoveredDevice } = message;
    _console.log("#onExpiredDiscoveredDevice", discoveredDevice);
    delete this.#discoveredDevices[discoveredDevice.bluetoothId];
    this.#dispatchEvent("discoveredDevices", {
      discoveredDevices: this.#discoveredDevices,
    });
  }
  #onScannerEvent(scannerEvent: ScannerEventMap[WildcardEventType]) {
    const { type: scannerEventType, target: scanner, message } = scannerEvent;

    if (!ScannerEventTypes.includes(scannerEventType)) {
      return;
    }

    _console.log("#onScannerEvent", scannerEvent);

    // @ts-expect-error
    this.#dispatchEvent(wildcardScannerEventType, {
      ...message,
      scanner: scanner as ScannerLike,
      scannerEventType,
    });

    getScannerManagerScannerEventTypes(
      scannerEventType as ScannerEventType,
    ).forEach((eventType) => {
      this.#dispatchEvent(eventType, {
        ...message,
        scanner: scanner as ScannerLike,
      });
    });
  }

  // CLIENT MANAGER LISTENERS
  #boundClientManagerListeners: {
    [K in keyof ClientManagerEventMap]?: (
      event: ClientManagerEventMap[K],
    ) => void;
  } = {
    client: this.#onClient.bind(this),
  };
  #onClient(event: ClientManagerEventMap["client"]) {
    const { message } = event;
    _console.log("#onClient", message);

    this.#onScanner(message.client);
  }

  // STATIC EVENTLISTENERS
  #eventDispatcher: ScannerManagerEventDispatcher = new EventDispatcher(
    this as ScannerManager,
    ScannerManagerEventTypes,
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
}

export default ScannerManager.shared;
