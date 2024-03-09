import { createConsole } from "../utils/Console.js";
import EventDispatcher, { addEventListeners, removeEventListeners } from "../utils/EventDispatcher.js";
import Device from "../Device.js";
import CenterOfPressureHelper from "../utils/CenterOfPressureHelper.js";
import PressureSensorDataManager from "../sensor/PressureSensorDataManager.js";

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

/** @typedef {import("../sensor/PressureSensorDataManager.js").PressureData} PressureData */

/**
 * @typedef TimestampedPressureData
 * @type {Object}
 * @property {PressureData} data
 * @property {number} timestamp
 */

/**
 * @typedef DevicePairRawPressureData
 * @type {Object}
 * @property {TimestampedPressureData} left
 * @property {TimestampedPressureData} right
 */

/**
 * @typedef DevicePairPressureData
 * @type {Object}
 *
 * @property {number} rawSum
 * @property {number} normalizedSum
 *
 * @property {CenterOfPressure?} center
 * @property {CenterOfPressure?} calibratedCenter
 */

const _console = createConsole("DevicePair", { log: true });

class DevicePair {
    // EVENT DISPATCHER

    /** @type {DevicePairEventType[]} */
    static #EventTypes = ["pressure", "isConnected"];
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

    /** @param {Device} device */
    assignInsole(device) {
        _console.assertWithError(device.isInsole, "device must be an insole");
        const side = device.insoleSide;

        const currentDevice = this[side];

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
        pressure: this.#onDevicePressure.bind(this),
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

    // PRESSURE DATA

    /** @type {DevicePairRawPressureData} */
    #rawPressureData = {};
    /** @type {Object<InsoleSide, number>} */
    get #rawPressureDataTimestamps() {
        const timestamps = {};
        this.sides.forEach((side) => {
            timestamps[side] = this.#rawPressureData[side].timestamp;
        });
        return timestamps;
    }

    #centerOfPressureHelper = new CenterOfPressureHelper();

    resetPressureRange() {
        this.sides.forEach((side) => {
            this[side].resetPressureRange();
        });
        this.#centerOfPressureHelper.resetRange();
    }

    /** @param {DeviceEvent} event  */
    #onDevicePressure(event) {
        const { timestamp, pressure } = event.message;
        this.#rawPressureData[event.target.insoleSide] = {
            timestamp,
            pressure,
        };
        if (this.isConnected && this.#hasAllPressureData) {
            this.#updatePressureData();
        }
    }

    get #hasAllPressureData() {
        this.sides.every((side) => side in this.#rawPressureData);
    }

    static #Scalars = {
        pressure: PressureSensorDataManager.Scalars.pressure / this.Sides.length,
    };
    static get Scalars() {
        return this.#Scalars;
    }
    get scalars() {
        return DevicePair.Scalars;
    }

    #updatePressureData() {
        const scalar = this.scalars.pressure;

        /** @type {DevicePairPressureData} */
        const pressure = { rawSum: 0, normalizedSum: 0 };

        this.#rawPressureData.left.data.rawSum;
        this.sides.forEach((side) => {
            pressure.rawSum += this.#rawPressureData[side].data.rawSum;
        });

        if (pressure.rawSum > 0) {
            pressure.normalizedSum = pressure.rawSum * scalar;

            pressure.center = { x: 0, y: 0 };
            this.sides.forEach((side) => {
                const sidePressureData = this.#rawPressureData[side].data;
                const rawPressureSumWeight = sidePressureData.rawSum / rawPressureSum;
                pressure.center.y += sidePressureData.center.y * rawPressureSumWeight;
                if (side == "right") {
                    pressure.center.x = rawPressureSumWeight;
                }
            });

            this.#centerOfPressureHelper.updateCenterOfPressureRange(pressure.center);
            pressure.calibratedCenter = this.#centerOfPressureHelper.getCalibratedCenterOfPressure(pressure.center);
        }

        _console.log({ pressure });
        this.#dispatchEvent({ type: "pressure", message: { pressure, timestamps: this.#rawPressureDataTimestamps() } });
    }
}

export default DevicePair;
