import BaseScanner from "./BaseScanner.js";
import { createConsole } from "../utils/Console.js";
import { isInNode } from "../utils/environment.js";
import { addEventListeners, removeEventListeners } from "../utils/EventDispatcher.js";
import { serviceUUIDs } from "../connection/bluetooth/bluetoothUUIDs.js";

const _console = createConsole("NobleScanner");

let isSupported = false;

if (isInNode) {
    var noble = require("@abandonware/noble");
    isSupported = true;
}

/** @typedef {"unknown" | "resetting" | "unsupported" | "unauthorized" | "poweredOff" | "poweredOn"} NobleState */

/** @typedef {import("./BaseScanner.js").DiscoveredPeripheral} DiscoveredPeripheral */

class NobleScanner extends BaseScanner {
    // IS SUPPORTED
    static get isSupported() {
        return isSupported;
    }

    // SCANNING
    #_isScanning = false;
    get #isScanning() {
        return this.#_isScanning;
    }
    set #isScanning(newIsScanning) {
        _console.assertTypeWithError(newIsScanning, "boolean");
        if (this.isScanning == newIsScanning) {
            _console.log("duplicate isScanning assignment");
            return;
        }
        this.#_isScanning = newIsScanning;
        this.dispatchEvent({ type: "isScanning", message: { isScanning: this.isScanning } });
    }
    get isScanning() {
        return this.#isScanning;
    }

    // NOBLE STATE
    /** @type {NobleState} */
    #_nobleState = "unknown";
    get #nobleState() {
        return this.#_nobleState;
    }
    set #nobleState(newNobleState) {
        _console.assertTypeWithError(newNobleState, "string");
        if (this.#nobleState == newNobleState) {
            _console.log("duplicate nobleState assignment");
            return;
        }
        this.#_nobleState = newNobleState;
        this.dispatchEvent({ type: "isAvailable", message: { isAvailable: this.isAvailable } });
    }

    // NOBLE LISTENERS
    #boundNobleListeners = {
        scanStart: this.#onNobleScanStart.bind(this),
        scanStop: this.#onNobleScanStop.bind(this),
        stateChange: this.#onNobleScateChange.bind(this),
        discover: this.#onNobleDiscover.bind(this),
    };
    #onNobleScanStart() {
        _console.log("OnNobleScanStart");
        this.#isScanning = true;
    }
    #onNobleScanStop() {
        _console.log("OnNobleScanStop");
        this.#isScanning = false;
    }
    /** @param {NobleState} state */
    #onNobleScateChange(state) {
        _console.log("OnNobleScateChange", state);
        this.#nobleState = state;
    }
    /** @param {noble.Peripheral} peripheral */
    #onNobleDiscover(peripheral) {
        _console.log("onNobleDiscover", peripheral);
        // FILL
    }

    // CONSTRUCTOR
    constructor() {
        super();
        addEventListeners(noble, this.#boundNobleListeners);
    }

    // AVAILABILITY
    get isAvailable() {
        return this.#nobleState == "poweredOn";
    }

    // SCANNING
    startScan() {
        super.startScan();
        noble.startScanningAsync(serviceUUIDs, false);
    }
    stopScan() {
        super.stopScan();
        noble.stopScanningAsync();
    }

    // MISC
    reset() {
        super.reset();
        noble.reset();
    }
}

export default NobleScanner;
