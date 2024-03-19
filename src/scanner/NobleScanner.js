import BaseScanner from "./BaseScanner.js";
import { createConsole } from "../utils/Console.js";
import { isInNode } from "../utils/environment.js";
import { addEventListeners, removeEventListeners } from "../utils/EventDispatcher.js";
import { serviceUUIDs } from "../connection/bluetooth/bluetoothUUIDs.js";
import Device from "../Device.js";
import NobleConnectionManager from "../connection/bluetooth/NobleConnectionManager.js";

const _console = createConsole("NobleScanner", { log: true });

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
            noblePeripheral._scanner = this;
            this.#noblePeripherals[noblePeripheral.id] = noblePeripheral;
            addEventListeners(noblePeripheral, this.#unboundNoblePeripheralListeners);
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
            removeEventListeners(noblePeripheral, this.#unboundNoblePeripheralListeners);
        }
    }

    // DISCOVERED PERIPHERALS
    /** @type {Object.<string, noble.Peripheral>} */
    #noblePeripherals = {};
    /** @param {string} noblePeripheralId */
    #assertValidNoblePeripheralId(noblePeripheralId) {
        _console.assertTypeWithError(noblePeripheralId, "string");
        _console.assertWithError(
            this.#noblePeripherals[noblePeripheralId],
            `no noblePeripheral found with id "${noblePeripheralId}"`
        );
    }

    // NOBLE PERIPHERAL LISTENERS
    #unboundNoblePeripheralListeners = {
        connect: this.#onNoblePeripheralConnect,
        disconnect: this.#onNoblePeripheralDisconnect,
        rssiUpdate: this.#onNoblePeripheralRssiUpdate,
        servicesDiscover: this.#onNoblePeripheralServicesDiscover,
    };

    #onNoblePeripheralConnect() {
        this._scanner.onNoblePeripheralConnect(this);
    }
    /** @param {noble.Peripheral} noblePeripheral */
    onNoblePeripheralConnect(noblePeripheral) {
        _console.log("onNoblePeripheralConnect", noblePeripheral);
    }

    #onNoblePeripheralDisconnect() {
        this._scanner.onNoblePeripheralConnect(this);
    }
    /** @param {noble.Peripheral} noblePeripheral */
    onNoblePeripheralDisconnect(noblePeripheral) {
        _console.log("onNoblePeripheralDisconnect", noblePeripheral);
        // FILL
    }

    /** @param {number} rssi */
    #onNoblePeripheralRssiUpdate(rssi) {
        this._scanner.onNoblePeripheralRssiUpdate(this, rssi);
        // FILL
    }
    /**
     * @param {noble.Peripheral} noblePeripheral
     * @param {number} rssi
     */
    onNoblePeripheralRssiUpdate(noblePeripheral, rssi) {
        _console.log("onNoblePeripheralRssiUpdate", noblePeripheral, rssi);
        // FILL
    }

    /** @param {noble.Service[]} services */
    #onNoblePeripheralServicesDiscover(services) {
        this._scanner.onNoblePeripheralServicesDiscover(this, services);
    }
    /**
     *
     * @param {noble.Peripheral} noblePeripheral
     * @param {noble.Service[]} services
     */
    onNoblePeripheralServicesDiscover(noblePeripheral, services) {
        _console.log("onNoblePeripheralServicesDiscover", noblePeripheral, services);
        // FILL
    }

    // PERIPHERALS
    /** @param {string} peripheralId */
    connectToPeripheral(peripheralId) {
        super.connectToPeripheral(peripheralId);
        this.#assertValidNoblePeripheralId(peripheralId);
        const noblePeripheral = this.#noblePeripherals[peripheralId];
        _console.log("connecting to discoveredPeripheral...", peripheralId);

        const device = new Device();
        const nobleConnectionManager = new NobleConnectionManager();
        device.noblePeripheral = noblePeripheral;
        device.connectionManager = nobleConnectionManager;
        device.connect();
    }
    /** @param {string} peripheralId */
    disconnectFromPeripheral(peripheralId) {
        super.disconnectFromPeripheral(peripheralId);
        this.#assertValidNoblePeripheralId(peripheralId);
        const noblePeripheral = this.#noblePeripherals[peripheralId];
        _console.log("disconnecting from discoveredPeripheral...", peripheralId);

        // FILL - retrieve device
        // FILL - device.disconnect()
    }
}

export default NobleScanner;
