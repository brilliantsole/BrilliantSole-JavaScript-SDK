import Device, { SendMessageCallback } from "./Device.ts";
import { createConsole } from "./utils/Console.ts";
import EventDispatcher from "./utils/EventDispatcher.ts";
import { textDecoder, textEncoder } from "./utils/Text.ts";
import autoBind from "auto-bind";

const _console = createConsole("WifiManager", { log: false });

export const MinWifiSSIDLength = 1;
export const MaxWifiSSIDLength = 32;

export const MinWifiPasswordLength = 8;
export const MaxWifiPasswordLength = 64;

export const WifiMessageTypes = [
  "isWifiAvailable",
  "getWifiSSID",
  "setWifiSSID",
  "getWifiPassword",
  "setWifiPassword",
  "getEnableWifiConnection",
  "setEnableWifiConnection",
  "isWifiConnected",
  "ipAddress",
  "isWifiSecure",
] as const;
export type WifiMessageType = (typeof WifiMessageTypes)[number];

export const RequiredWifiMessageTypes: WifiMessageType[] = [
  "getWifiSSID",
  "getWifiPassword",
  "getEnableWifiConnection",
  "isWifiConnected",
  "ipAddress",
  "isWifiSecure",
];

export const WifiEventTypes = WifiMessageTypes;
export type WifiEventType = (typeof WifiEventTypes)[number];

export interface WifiEventMessages {
  isWifiAvailable: { isWifiAvailable: boolean };
  getWifiSSID: { wifiSSID: string };
  getWifiPassword: { wifiPassword: string };
  getEnableWifiConnection: { wifiConnectionEnabled: boolean };
  isWifiConnected: { isWifiConnected: boolean };
  ipAddress: { ipAddress: string };
}

export type WifiEventDispatcher = EventDispatcher<
  Device,
  WifiEventType,
  WifiEventMessages
>;
export type SendWifiMessageCallback = SendMessageCallback<WifiMessageType>;

class WifiManager {
  constructor() {
    autoBind(this);
  }

  sendMessage!: SendWifiMessageCallback;

  eventDispatcher!: WifiEventDispatcher;
  get #dispatchEvent() {
    return this.eventDispatcher.dispatchEvent;
  }
  get waitForEvent() {
    return this.eventDispatcher.waitForEvent;
  }

  requestRequiredInformation() {
    _console.log("requesting required wifi information");
    const messages = RequiredWifiMessageTypes.map((messageType) => ({
      type: messageType,
    }));
    this.sendMessage(messages, false);
  }

  // PROPERTIES

  #isWifiAvailable = false;
  get isWifiAvailable() {
    return this.#isWifiAvailable;
  }
  #updateIsWifiAvailable(updatedIsWifiAvailable: boolean) {
    _console.assertTypeWithError(updatedIsWifiAvailable, "boolean");
    this.#isWifiAvailable = updatedIsWifiAvailable;
    _console.log({ isWifiAvailable: this.#isWifiAvailable });
    this.#dispatchEvent("isWifiAvailable", {
      isWifiAvailable: this.#isWifiAvailable,
    });
  }

  #assertWifiIsAvailable() {
    _console.assertWithError(this.#isWifiAvailable, "wifi is not available");
  }

  // WIFI SSID
  #wifiSSID = "";
  get wifiSSID() {
    return this.#wifiSSID;
  }

  #updateWifiSSID(updatedWifiSSID: string) {
    _console.assertTypeWithError(updatedWifiSSID, "string");
    this.#wifiSSID = updatedWifiSSID;
    _console.log({ wifiSSID: this.#wifiSSID });
    this.#dispatchEvent("getWifiSSID", { wifiSSID: this.#wifiSSID });
  }
  async setWifiSSID(newWifiSSID: string) {
    this.#assertWifiIsAvailable();
    if (this.#wifiConnectionEnabled) {
      _console.error("cannot change ssid while wifi connection is enabled");
      return;
    }
    _console.assertTypeWithError(newWifiSSID, "string");
    _console.assertRangeWithError(
      "wifiSSID",
      newWifiSSID.length,
      MinWifiSSIDLength,
      MaxWifiSSIDLength
    );

    const setWifiSSIDData = textEncoder.encode(newWifiSSID);
    _console.log({ setWifiSSIDData });

    const promise = this.waitForEvent("getWifiSSID");
    this.sendMessage([{ type: "setWifiSSID", data: setWifiSSIDData.buffer }]);
    await promise;
  }

  // WIFI PASSWORD
  #wifiPassword = "";
  get wifiPassword() {
    return this.#wifiPassword;
  }

  #updateWifiPassword(updatedWifiPassword: string) {
    _console.assertTypeWithError(updatedWifiPassword, "string");
    this.#wifiPassword = updatedWifiPassword;
    _console.log({ wifiPassword: this.#wifiPassword });
    this.#dispatchEvent("getWifiPassword", {
      wifiPassword: this.#wifiPassword,
    });
  }
  async setWifiPassword(newWifiPassword: string) {
    this.#assertWifiIsAvailable();
    if (this.#wifiConnectionEnabled) {
      _console.error("cannot change password while wifi connection is enabled");
      return;
    }
    _console.assertTypeWithError(newWifiPassword, "string");
    if (newWifiPassword.length > 0) {
      _console.assertRangeWithError(
        "wifiPassword",
        newWifiPassword.length,
        MinWifiPasswordLength,
        MaxWifiPasswordLength
      );
    }

    const setWifiPasswordData = textEncoder.encode(newWifiPassword);
    _console.log({ setWifiPasswordData });

    const promise = this.waitForEvent("getWifiPassword");
    this.sendMessage([
      { type: "setWifiPassword", data: setWifiPasswordData.buffer },
    ]);
    await promise;
  }

  // ENABLE WIFI CONNECTION
  #wifiConnectionEnabled!: boolean;
  get wifiConnectionEnabled() {
    return this.#wifiConnectionEnabled;
  }
  #updateWifiConnectionEnabled(wifiConnectionEnabled: boolean) {
    _console.log({ wifiConnectionEnabled });
    this.#wifiConnectionEnabled = wifiConnectionEnabled;
    this.#dispatchEvent("getEnableWifiConnection", {
      wifiConnectionEnabled: wifiConnectionEnabled,
    });
  }
  async setWifiConnectionEnabled(
    newWifiConnectionEnabled: boolean,
    sendImmediately: boolean = true
  ) {
    this.#assertWifiIsAvailable();
    _console.assertTypeWithError(newWifiConnectionEnabled, "boolean");
    if (this.#wifiConnectionEnabled == newWifiConnectionEnabled) {
      _console.log(
        `redundant wifiConnectionEnabled assignment ${newWifiConnectionEnabled}`
      );
      return;
    }

    const promise = this.waitForEvent("getEnableWifiConnection");
    this.sendMessage(
      [
        {
          type: "setEnableWifiConnection",
          data: Uint8Array.from([Number(newWifiConnectionEnabled)]).buffer,
        },
      ],
      sendImmediately
    );
    await promise;
  }
  async toggleWifiConnection() {
    return this.setWifiConnectionEnabled(!this.wifiConnectionEnabled);
  }
  async enableWifiConnection() {
    return this.setWifiConnectionEnabled(true);
  }
  async disableWifiConnection() {
    return this.setWifiConnectionEnabled(false);
  }

  // IS WIFI CONNECTED
  #isWifiConnected = false;
  get isWifiConnected() {
    return this.#isWifiConnected;
  }
  #updateIsWifiConnected(updatedIsWifiConnected: boolean) {
    _console.assertTypeWithError(updatedIsWifiConnected, "boolean");
    this.#isWifiConnected = updatedIsWifiConnected;
    _console.log({ isWifiConnected: this.#isWifiConnected });
    this.#dispatchEvent("isWifiConnected", {
      isWifiConnected: this.#isWifiConnected,
    });
  }

  // IP ADDRESS
  #ipAddress?: string;
  get ipAddress() {
    return this.#ipAddress;
  }

  #updateIpAddress(updatedIpAddress: string) {
    _console.assertTypeWithError(updatedIpAddress, "string");
    this.#ipAddress = updatedIpAddress;
    _console.log({ ipAddress: this.#ipAddress });
    this.#dispatchEvent("ipAddress", {
      ipAddress: this.#ipAddress,
    });
  }

  // IS WIFI SECURE
  #isWifiSecure = false;
  get isWifiSecure() {
    return this.#isWifiSecure;
  }
  #updateIsWifiSecure(updatedIsWifiSecure: boolean) {
    _console.assertTypeWithError(updatedIsWifiSecure, "boolean");
    this.#isWifiSecure = updatedIsWifiSecure;
    _console.log({ isWifiSecure: this.#isWifiSecure });
    this.#dispatchEvent("isWifiSecure", {
      isWifiSecure: this.#isWifiSecure,
    });
  }

  // MESSAGE
  parseMessage(messageType: WifiMessageType, dataView: DataView) {
    _console.log({ messageType });

    switch (messageType) {
      case "isWifiAvailable":
        const isWifiAvailable = Boolean(dataView.getUint8(0));
        _console.log({ isWifiAvailable });
        this.#updateIsWifiAvailable(isWifiAvailable);
        break;
      case "getWifiSSID":
      case "setWifiSSID":
        const ssid = textDecoder.decode(dataView.buffer);
        _console.log({ ssid });
        this.#updateWifiSSID(ssid);
        break;
      case "getWifiPassword":
      case "setWifiPassword":
        const password = textDecoder.decode(dataView.buffer);
        _console.log({ password });
        this.#updateWifiPassword(password);
        break;
      case "getEnableWifiConnection":
      case "setEnableWifiConnection":
        const enableWifiConnection = Boolean(dataView.getUint8(0));
        _console.log({ enableWifiConnection });
        this.#updateWifiConnectionEnabled(enableWifiConnection);
        break;
      case "isWifiConnected":
        const isWifiConnected = Boolean(dataView.getUint8(0));
        _console.log({ isWifiConnected });
        this.#updateIsWifiConnected(isWifiConnected);
        break;
      case "ipAddress":
        const ipAddress = new Uint8Array(dataView.buffer.slice(0, 4)).join(".");
        _console.log({ ipAddress });
        this.#updateIpAddress(ipAddress);
        break;
      case "isWifiSecure":
        const isWifiSecure = Boolean(dataView.getUint8(0));
        _console.log({ isWifiSecure });
        this.#updateIsWifiSecure(isWifiSecure);
        break;
      default:
        throw Error(`uncaught messageType ${messageType}`);
    }
  }

  clear() {
    this.#wifiSSID = "";
    this.#wifiPassword = "";
    this.#ipAddress = "";
    this.#isWifiConnected = false;
    this.#isWifiAvailable = false;
  }
}

export default WifiManager;
