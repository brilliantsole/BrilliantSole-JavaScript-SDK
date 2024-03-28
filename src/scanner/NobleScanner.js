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

/** @typedef {import("./BaseScanner.js").DiscoveredDevice} DiscoveredDevice */
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
    /** @param {noble.Device} nobleDevice */
    #onNobleDiscover(nobleDevice) {
        _console.log("onNobleDiscover", nobleDevice);
        if (!this.#nobleDevices[nobleDevice.id]) {
            nobleDevice._scanner = this;
            this.#nobleDevices[nobleDevice.id] = nobleDevice;
            addEventListeners(nobleDevice, this.#unboundNobleDeviceListeners);
        }

        let deviceType;
        const serviceData = nobleDevice.advertisement.serviceData;
        if (serviceData) {
            //_console.log("serviceData", serviceData);
            const deviceTypeServiceUUID = serviceUUIDs[0].replaceAll("-", "");
            //_console.log("deviceTypeServiceUUID", deviceTypeServiceUUID);
            const deviceTypeServiceData = serviceData.find((serviceDatum) => {
                return serviceDatum.uuid == deviceTypeServiceUUID;
            });
            //_console.log("deviceTypeServiceData", deviceTypeServiceData);
            if (deviceTypeServiceData) {
                const deviceTypeEnum = deviceTypeServiceData.data.readUint8(0);
                deviceType = Device.Types[deviceTypeEnum];
            }
        }

        /** @type {DiscoveredDevice} */
        const discoveredDevice = {
            name: nobleDevice.advertisement.localName,
            id: nobleDevice.id,
            deviceType,
            rssi: nobleDevice.rssi,
        };
        this.dispatchEvent({ type: "discoveredDevice", message: { discoveredDevice } });
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
        noble.startScanningAsync(serviceUUIDs, true);
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
        expiredDiscoveredDevice: this.#onExpiredDiscoveredDevice.bind(this),
    };

    /** @param {ScannerEvent} event */
    #onExpiredDiscoveredDevice(event) {
        /** @type {DiscoveredDevice} */
        const discoveredDevice = event.message.discoveredDevice;
        const nobleDevice = this.#nobleDevices[discoveredDevice.id];
        if (nobleDevice) {
            // disconnect?
            delete this.#nobleDevices[discoveredDevice.id];
            removeEventListeners(nobleDevice, this.#unboundNobleDeviceListeners);
        }
    }

    // DISCOVERED PERIPHERALS
    /** @type {Object.<string, noble.Device>} */
    #nobleDevices = {};
    /** @param {string} nobleDeviceId */
    #assertValidNobleDeviceId(nobleDeviceId) {
        _console.assertTypeWithError(nobleDeviceId, "string");
        _console.assertWithError(this.#nobleDevices[nobleDeviceId], `no nobleDevice found with id "${nobleDeviceId}"`);
    }

    // DELETE?
    // NOBLE PERIPHERAL LISTENERS
    #unboundNobleDeviceListeners = {
        //connect: this.#onNobleDeviceConnect,
        //disconnect: this.#onNobleDeviceDisconnect,
        //rssiUpdate: this.#onNobleDeviceRssiUpdate,
        //servicesDiscover: this.#onNobleDeviceServicesDiscover,
    };

    #onNobleDeviceConnect() {
        this._scanner.onNobleDeviceConnect(this);
    }
    /** @param {noble.Device} nobleDevice */
    onNobleDeviceConnect(nobleDevice) {
        _console.log("onNobleDeviceConnect", nobleDevice.id);
    }

    #onNobleDeviceDisconnect() {
        this._scanner.onNobleDeviceConnect(this);
    }
    /** @param {noble.Device} nobleDevice */
    onNobleDeviceDisconnect(nobleDevice) {
        _console.log("onNobleDeviceDisconnect", nobleDevice.id);
        // FILL
    }

    /** @param {number} rssi */
    #onNobleDeviceRssiUpdate(rssi) {
        this._scanner.onNobleDeviceRssiUpdate(this, rssi);
        // FILL
    }
    /**
     * @param {noble.Device} nobleDevice
     * @param {number} rssi
     */
    onNobleDeviceRssiUpdate(nobleDevice, rssi) {
        _console.log("onNobleDeviceRssiUpdate", nobleDevice, rssi);
        // FILL
    }

    /** @param {noble.Service[]} services */
    #onNobleDeviceServicesDiscover(services) {
        this._scanner.onNobleDeviceServicesDiscover(this, services);
    }
    /**
     *
     * @param {noble.Device} nobleDevice
     * @param {noble.Service[]} services
     */
    onNobleDeviceServicesDiscover(nobleDevice, services) {
        _console.log("onNobleDeviceServicesDiscover", nobleDevice, services);
        // FILL
    }

    // PERIPHERALS
    /** @param {string} deviceId */
    connectToDevice(deviceId) {
        super.connectToDevice(deviceId);
        this.#assertValidNobleDeviceId(deviceId);
        const nobleDevice = this.#nobleDevices[deviceId];
        _console.log("connecting to discoveredDevice...", deviceId);

        const device = new Device();
        const nobleConnectionManager = new NobleConnectionManager();
        nobleConnectionManager.nobleDevice = nobleDevice;
        device.connectionManager = nobleConnectionManager;
        device.connect();
    }
    /** @param {string} deviceId */
    disconnectFromDevice(deviceId) {
        super.disconnectFromDevice(deviceId);
        this.#assertValidNobleDeviceId(deviceId);
        const nobleDevice = this.#nobleDevices[deviceId];
        _console.log("disconnecting from discoveredDevice...", deviceId);

        // FILL - retrieve device
        // FILL - device.disconnect()
    }
}

export default NobleScanner;
