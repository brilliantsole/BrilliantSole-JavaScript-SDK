import { waitForGlobals } from "../../utils/cross-origin-storage-utils.js";

const { BW } = await waitForGlobals();

import { Capacitor } from "@capacitor/core";
const isWeb = Capacitor.getPlatform() == "web";
document.documentElement.toggleAttribute("data-web", isWeb);

import { BluetoothLowEnergyScanner } from "./BluetoothLowEnergyScanner.js";
import { BleClientScanner } from "./BleClientScanner.js";

let scanner;
if (false) {
  scanner = new BluetoothLowEnergyScanner();
} else {
  scanner = new BleClientScanner();
}
console.log("scanner", scanner);

// BW.setConsoleLevelFlagsForType("Device", { log: true });
