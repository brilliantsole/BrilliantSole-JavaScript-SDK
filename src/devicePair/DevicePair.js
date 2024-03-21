import { createConsole } from "../utils/Console.js";
import EventDispatcher, { addEventListeners, removeEventListeners } from "../utils/EventDispatcher.js";
import Device from "../Device.js";
import DevicePairSensorDataManager from "./DevicePairSensorDataManager.js";

const _console = createConsole("DevicePair", { log: true });

/** @typedef {import("../Device.js").InsoleSide} InsoleSide */
/** @typedef {import("../Device.js").DeviceEvent} DeviceEvent */

/** @typedef {"pressure" | "isConnected"} DevicePairEventType */

/** @typedef {import("../utils/EventDispatcher.js").EventDispatcherListener} EventDispatcherListener */
/** @typedef {import("../utils/EventDispatcher.js").EventDispatcherOptions} EventDispatcherOptions */

/** @typedef {import("../sensor/SensorConfigurationManager.js").SensorConfiguration} SensorConfiguration */

/** @typedef {import("../utils/CenterOfPressureHelper.js").CenterOfPressure} CenterOfPressure */

/**
 * @typedef DevicePairEvent
 * @type {Object}
 * @property {DevicePair} target
 * @property {DevicePairEventType} type
 * @property {Object} message
 */

class DevicePair {
    constructor() {
        this.#sensorDataManager.onDataReceived = this.#onSensorDataReceived.bind(this);
    }

    // EVENT DISPATCHER

    /** @type {DevicePairEventType[]} */
    static #EventTypes = ["pressure", "isConnected"];
    static get EventTypes() {
        return this.#EventTypes;
    }
    get eventTypes() {
        return DevicePair.#EventTypes;
    }
    #eventDispatcher = new EventDispatcher(this, this.eventTypes);

    /**
     * @param {DevicePairEventType} type
     * @param {EventDispatcherListener} listener
     * @param {EventDispatcherOptions} options
     */
    addEventListener(type, listener, options) {
        this.#eventDispatcher.addEventListener(type, listener, options);
    }

    /**
     * @param {DevicePairEvent} event
     */
    #dispatchEvent(event) {
        this.#eventDispatcher.dispatchEvent(event);
    }

    /**
     * @param {DevicePairEventType} type
     * @param {EventDispatcherListener} listener
     */
    removeEventListener(type, listener) {
        return this.#eventDispatcher.removeEventListener(type, listener);
    }

    // SIDES

    static get Sides() {
        return Device.InsoleSides;
    }
    get sides() {
        return DevicePair.Sides;
    }

    /** @type {Device?} */
    #left;
    get left() {
        return this.#left;
    }

    /** @type {Device?} */
    #right;
    get right() {
        return this.#right;
    }

    get isConnected() {
        return this.sides.every((side) => this[side]?.isConnected);
    }
    #assertIsConnected() {
        _console.assertWithError(this.isConnected, "devicePair must be connected");
    }

    /** @param {Device} device */
    assignInsole(device) {
        if (!device.isInsole) {
            _console.warn("device is not an insole");
            return;
        }
        const side = device.insoleSide;

        const currentDevice = this[side];

        if (device == currentDevice) {
            _console.log("device already assigned");
            return;
        }

        if (currentDevice) {
            removeEventListeners(currentDevice, this.#boundDeviceEventListeners);
        }
        addEventListeners(device, this.#boundDeviceEventListeners);

        switch (side) {
            case "left":
                this.#left = device;
                break;
            case "right":
                this.#right = device;
                break;
        }

        _console.log(`assigned ${side} insole`, device);

        this.resetPressureRange();

        this.#dispatchEvent({ type: "isConnected", message: { isConnected: this.isConnected } });

        return currentDevice;
    }

    /** @type {Object.<string, EventListener} */
    #boundDeviceEventListeners = {
        //sensorData: this.#onDeviceSensorData.bind(this),
        pressure: this.#onDeviceSensorData.bind(this),
        isConnected: this.#onIsDeviceConnected.bind(this),
    };

    /** @param {DeviceEvent} event  */
    #onIsDeviceConnected(event) {
        this.#dispatchEvent({ type: "isConnected", message: { isConnected: this.isConnected } });
    }

    // SENSOR CONFIGURATION

    /** @param {SensorConfiguration} sensorConfiguration */
    setSensorConfiguration(sensorConfiguration) {
        if (this.isConnected) {
            this.sides.forEach((side) => {
                this[side].setSensorConfiguration(sensorConfiguration);
            });
        }
    }

    // SENSOR DATA
    #sensorDataManager = new DevicePairSensorDataManager();
    /** @param {DeviceEvent} event */
    #onDeviceSensorData(event) {
        if (this.isConnected) {
            this.#sensorDataManager.onDeviceSensorData(event);
        }
    }
    /**
     * @param {SensorType} sensorType
     * @param {Object} sensorData
     * @param {number} sensorData.timestamp
     */
    #onSensorDataReceived(sensorType, sensorData) {
        _console.log({ sensorType, sensorData });
        this.#dispatchEvent({ type: sensorType, message: sensorData });
    }

    resetPressureRange() {
        this.#sensorDataManager.resetPressureRange();
    }

    // SHARED INSTANCE

    static #shared = new DevicePair();
    static get shared() {
        return this.#shared;
    }
    static {
        Device.AddEventListener("deviceConnected", (event) => {
            /** @type {Device} */
            const device = event.message.device;
            if (device.isInsole) {
                this.#shared.assignInsole(device);
            }
        });
    }
}

export default DevicePair;
