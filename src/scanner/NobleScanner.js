import BaseScanner from "./BaseScanner.js";
import { createConsole } from "../utils/Console.js";
import { isInNode } from "../utils/environment.js";
import { addEventListeners, removeEventListeners } from "../utils/EventDispatcher.js";
import { serviceUUIDs } from "../connection/bluetooth/bluetoothUUIDs.js";
import Device from "../Device.js";

const _console = createConsole("NobleScanner", { log: false });

let isSupported = false;

if (isInNode) {
    var noble = require("@abandonware/noble");
    isSupported = true;
}

/** @typedef {"unknown" | "resetting" | "unsupported" | "unauthorized" | "poweredOff" | "poweredOn"} NobleState */

/** @typedef {import("./BaseScanner.js").DiscoveredPeripheral} DiscoveredPeripheral */
/** @typedef {import("./BaseScanner.js").ScannerEvent} ScannerEvent */

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
        _console.log({ newNobleState });
        this.dispatchEvent({ type: "isAvailable", message: { isAvailable: this.isAvailable } });
    }

    // NOBLE LISTENERS
    #boundNobleListeners = {
        scanStart: this.#onNobleScanStart.bind(this),
        scanStop: this.#onNobleScanStop.bind(this),
        stateChange: this.#onNobleStateChange.bind(this),
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
    #onNobleStateChange(state) {
        _console.log("onNobleStateChange", state);
        this.#nobleState = state;
    }
    /** @param {noble.Peripheral} noblePeripheral */
    #onNobleDiscover(noblePeripheral) {
        _console.log("onNobleDiscover", noblePeripheral);
        if (!this.#noblePeripherals[noblePeripheral.id]) {
            this.#noblePeripherals[noblePeripheral.id] = noblePeripheral;
            addEventListeners(noblePeripheral, this.#boundNoblePeripheralListeners);
        }

        /** @type {DiscoveredPeripheral} */
        const discoveredPeripheral = {
            name: noblePeripheral.advertisement.localName,
            id: noblePeripheral.id,
            //deviceType: Device.Types[noblePeripheral.advertisement.serviceData[serviceUUIDs[0]]],
            rssi: noblePeripheral.rssi,
        };
        this.dispatchEvent({ type: "discoveredPeripheral", message: { discoveredPeripheral } });
    }

    // CONSTRUCTOR
    constructor() {
        super();
        addEventListeners(noble, this.#boundNobleListeners);
        addEventListeners(this, this.#boundBaseScannerListeners);
    }

    // AVAILABILITY
    get isAvailable() {
        return this.#nobleState == "poweredOn";
    }

    // SCANNING
    startScan() {
        super.startScan();
        // REMOVE WHEN TESTING
        //noble.startScanningAsync(serviceUUIDs, true);
        noble.startScanningAsync([], true);
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

    // BASESCANNER LISTENERS
    #boundBaseScannerListeners = {
        expiredDiscoveredPeripheral: this.#onExpiredDiscoveredPeripheral.bind(this),
    };

    /** @param {ScannerEvent} event */
    #onExpiredDiscoveredPeripheral(event) {
        /** @type {DiscoveredPeripheral} */
        const discoveredPeripheral = event.message.discoveredPeripheral;
        const noblePeripheral = this.#noblePeripherals[discoveredPeripheral.id];
        if (noblePeripheral) {
            // disconnect?
            delete this.#noblePeripherals[discoveredPeripheral.id];
            removeEventListeners(noblePeripheral, this.#boundNoblePeripheralListeners);
        }
    }

    // DISCOVERED PERIPHERALS
    /** @type {Object.<string, noble.Peripheral>} */
    #noblePeripherals = {};

    // NOBLE PERIPHERAL LISTENERS
    #boundNoblePeripheralListeners = {
        connect: this.#onNoblePeripheralConnect.bind(this),
        disconnect: this.#onNoblePeripheralDisconnect.bind(this),
        rssiUpdate: this.#onNoblePeripheralRssiUpdate.bind(this),
        servicesDiscover: this.#onNoblePeripheralServicesDiscover.bind(this),
    };

    #onNoblePeripheralConnect() {
        // FILL
        console.log(...arguments);
    }
    #onNoblePeripheralDisconnect() {
        // FILL
        console.log(...arguments);
    }
    #onNoblePeripheralRssiUpdate() {
        // FILL
        console.log(...arguments);
    }
    #onNoblePeripheralServicesDiscover() {
        // FILL
        console.log(...arguments);
    }
}

export default NobleScanner;
