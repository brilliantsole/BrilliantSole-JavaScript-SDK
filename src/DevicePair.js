import { createConsole } from "./utils/Console.js";
import EventDispatcher, { addEventListeners, removeEventListeners } from "./utils/EventDispatcher.js";
import Device from "./Device.js";

/** @typedef {import("./Device.js").InsoleSide} InsoleSide */
/** @typedef {import("./Device.js").DeviceEvent} DeviceEvent */

/** @typedef {"pressure"} DevicePairEventType */

/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherListener} EventDispatcherListener */
/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherOptions} EventDispatcherOptions */

/** @typedef {import("./sensor/PressureSensorDataManager.js").CenterOfPressure} CenterOfPressure */
/** @typedef {import("./sensor/PressureSensorDataManager.js").CenterOfPressureRange} CenterOfPressureRange */

/**
 * @typedef DevicePairEvent
 * @type {Object}
 * @property {DevicePair} target
 * @property {DevicePairEventType} type
 * @property {Object} message
 */

const _console = createConsole("DevicePair", { log: true });

class DevicePair {
    // EVENT DISPATCHER

    /** @type {DevicePairEventType[]} */
    static #EventTypes = ["pressure"];
    get #eventTypes() {
        return DevicePair.#EventTypes;
    }
    #eventDispatcher = new EventDispatcher(this.#eventTypes);

    /**
     * @param {DevicePairEventType} type
     * @param {EventDispatcherListener} listener
     * @param {EventDispatcherOptions} options
     * @throws {Error}
     */
    addEventListener(type, listener, options) {
        this.#eventDispatcher.addEventListener(type, listener, options);
    }

    /**
     * @param {DevicePairEvent} event
     * @throws {Error} if type is not valid
     */
    #dispatchEvent(event) {
        this.#eventDispatcher.dispatchEvent(event);
    }

    /**
     * @param {DevicePairEventType} type
     * @param {EventDispatcherListener} listener
     * @returns {boolean}
     * @throws {Error}
     */
    removeEventListener(type, listener) {
        return this.#eventDispatcher.removeEventListener(type, listener);
    }

    // SIDES

    static get Sides() {
        return Device.InsoleSides;
    }
    static get sides() {
        return DevicePair.Sides;
    }

    /** @type {Device?} */
    #left;
    get left() {
        return this.#left;
    }
    set left(newDevice) {
        this.#assignInsole(newDevice, "left");
    }

    /** @type {Device?} */
    #right;
    get right() {
        return this.#right;
    }
    set right(newDevice) {
        this.#assignInsole(newDevice, "right");
    }

    /**
     * @param {Device} device
     * @param {InsoleSide} side
     */
    #assignInsole(device, side) {
        _console.assertWithError(device.isInsole, "device must be an insole");
        _console.assertWithError(
            device.insoleSide == side,
            `attempted to assign ${device.insoleSide} insole to ${side} side`
        );
        if (device == this[side]) {
            _console.warn("attempted to assign the same insole");
            return;
        }

        if (this[side]) {
            removeEventListeners(this[side], this.#boundDeviceEventListeners);
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
    }

    /** @type {Object.<string, EventListener} */
    #boundDeviceEventListeners = {
        pressure: this.#onDevicePressure.bind(this),
    };

    /** @param {DeviceEvent} event  */
    #onDevicePressure() {
        if (this.isConnected) {
            this.#updatePressureData();
        }
    }

    get isConnected() {
        return this.left?.isConnected && this.right?.isConnected;
    }

    #updatePressureData() {
        // FILL - caculate centerOdMaa
    }
}

export default DevicePair;
