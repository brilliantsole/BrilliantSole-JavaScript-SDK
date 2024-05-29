import { createConsole } from "./utils/Console.js";
import EventDispatcher from "./utils/EventDispatcher.js";
import { textDecoder, textEncoder } from "./utils/Text.js";

const _console = createConsole("InformationManager", { log: true });

/** @typedef {"leftInsole" | "rightInsole"} DeviceType */
/** @typedef {"left" | "right"} InsoleSide */

/**
 * @typedef { "getMtu" |
 * "getId"|
 * "getName"|
 * "setName"|
 * "getType"|
 * "setType"|
 * "getCurrentTime"|
 * "setCurrentTime"
 * } InformationMessageType
 */
/** @typedef {InformationMessageType} InformationManagerEventType */

/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherListener} EventDispatcherListener */
/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherOptions} EventDispatcherOptions */

/** @typedef {import("./Device.js").Device} Device */
/**
 * @typedef InformationManagerEvent
 * @type {Object}
 * @property {Device} target
 * @property {InformationManagerEventType} type
 * @property {Object} message
 */

class InformationManager {
    // MESSAGE TYPES

    /** @type {InformationMessageType[]} */
    static #MessageTypes = [
        "getMtu",
        "getId",
        "getName",
        "setName",
        "getType",
        "setType",
        "getCurrentTime",
        "setCurrentTime",
    ];
    static get MessageTypes() {
        return this.#MessageTypes;
    }
    get messageTypes() {
        return InformationManager.MessageTypes;
    }

    // EVENT DISPATCHER

    /** @type {InformationManagerEventType[]} */
    static #EventTypes = [...this.#MessageTypes];
    static get EventTypes() {
        return this.#EventTypes;
    }
    get eventTypes() {
        return InformationManager.#EventTypes;
    }
    /** @type {EventDispatcher} */
    eventDispatcher;

    /** @param {InformationManagerEvent} event */
    #dispatchEvent(event) {
        this.eventDispatcher.dispatchEvent(event);
    }

    /** @param {InformationManagerEventType} eventType */
    waitForEvent(eventType) {
        return this.eventDispatcher.waitForEvent(eventType);
    }

    // PROPERTIES

    /** @type {string?} */
    #id;
    get id() {
        return this.#id;
    }
    /** @param {string} updatedId */
    updateId(updatedId) {
        _console.assertTypeWithError(updatedId, "string");
        this.#id = updatedId;
        _console.log({ id: this.#id });
        this.#dispatchEvent({ type: "getId", message: { id: this.#id } });
    }

    /** @type {string?} */
    #name;
    get name() {
        return this.#name;
    }

    /** @param {string} updatedName */
    updateName(updatedName) {
        _console.assertTypeWithError(updatedName, "string");
        this.#name = updatedName;
        _console.log({ updatedName: this.#name });
        this.#dispatchEvent({ type: "getName", message: { name: this.#name } });
    }
    static get MinNameLength() {
        return 2;
    }
    get minNameLength() {
        return InformationManager.MinNameLength;
    }
    static get MaxNameLength() {
        return 30;
    }
    get maxNameLength() {
        return InformationManager.MaxNameLength;
    }
    /** @param {string} newName */
    async setName(newName) {
        _console.assertTypeWithError(newName, "string");
        _console.assertWithError(
            newName.length >= this.minNameLength,
            `name must be greater than ${this.minNameLength} characters long ("${newName}" is ${newName.length} characters long)`
        );
        _console.assertWithError(
            newName.length < this.maxNameLength,
            `name must be less than ${this.maxNameLength} characters long ("${newName}" is ${newName.length} characters long)`
        );
        const setNameData = textEncoder.encode(newName);
        _console.log({ setNameData });

        const promise = this.waitForEvent("getName");
        this.sendMessage([{ type: "setName", data: setNameData.buffer }]);
        await promise;
    }

    // TYPE
    /** @type {DeviceType[]} */
    static #Types = ["leftInsole", "rightInsole"];
    static get Types() {
        return this.#Types;
    }
    get #types() {
        return InformationManager.Types;
    }
    /** @type {DeviceType?} */
    #type;
    get type() {
        return this.#type;
    }
    get typeEnum() {
        return InformationManager.Types.indexOf(this.type);
    }
    /** @param {DeviceType} type */
    #assertValidDeviceType(type) {
        _console.assertEnumWithError(type, this.#types);
    }
    /** @param {number} typeEnum */
    #assertValidDeviceTypeEnum(typeEnum) {
        _console.assertTypeWithError(typeEnum, "number");
        _console.assertWithError(this.#types[typeEnum], `invalid typeEnum ${typeEnum}`);
    }
    /** @param {DeviceType} updatedType */
    updateType(updatedType) {
        this.#assertValidDeviceType(updatedType);
        if (updatedType == this.type) {
            _console.log("redundant type assignment");
            return;
        }
        this.#type = updatedType;
        _console.log({ updatedType: this.#type });

        this.#dispatchEvent({ type: "getType", message: { type: this.#type } });
    }
    /** @param {number} newTypeEnum */
    async #setTypeEnum(newTypeEnum) {
        this.#assertValidDeviceTypeEnum(newTypeEnum);
        const setTypeData = Uint8Array.from([newTypeEnum]);
        _console.log({ setTypeData });
        const promise = this.waitForEvent("getType");
        this.sendMessage([{ type: "setType", data: setTypeData.buffer }]);
        await promise;
    }
    /** @param {DeviceType} newType */
    async setType(newType) {
        this.#assertValidDeviceType(newType);
        const newTypeEnum = this.#types.indexOf(newType);
        this.#setTypeEnum(newTypeEnum);
    }

    get isInsole() {
        switch (this.type) {
            case "leftInsole":
            case "rightInsole":
                return true;
            default:
                // for future non-insole device types
                return false;
        }
    }
    /** @type {InsoleSide[]} */
    static #InsoleSides = ["left", "right"];
    static get InsoleSides() {
        return this.#InsoleSides;
    }
    get insoleSides() {
        return InformationManager.InsoleSides;
    }
    /** @type {InsoleSide} */
    get insoleSide() {
        switch (this.type) {
            case "leftInsole":
                return "left";
            case "rightInsole":
                return "right";
        }
    }

    #mtu = 0;
    get mtu() {
        return this.#mtu;
    }
    /** @param {number} newMtu */
    #updateMtu(newMtu) {
        _console.assertTypeWithError(newMtu, "number");
        if (this.#mtu == newMtu) {
            _console.log("redundant mtu assignment", newMtu);
            return;
        }
        this.#mtu = newMtu;

        this.#dispatchEvent({ type: "getMtu", message: { mtu: this.#mtu } });
    }

    #isCurrentTimeSet = false;
    get isCurrentTimeSet() {
        return this.#isCurrentTimeSet;
    }

    /** @param {number} currentTime */
    #onCurrentTime(currentTime) {
        _console.log({ currentTime });
        this.#isCurrentTimeSet = currentTime != 0;
        if (!this.#isCurrentTimeSet) {
            this.#setCurrentTime();
        }
    }
    async #setCurrentTime() {
        _console.log("setting current time...");
        const dataView = new DataView(new ArrayBuffer(8));
        dataView.setBigUint64(0, BigInt(Date.now()), true);
        const promise = this.waitForEvent("getCurrentTime");
        this.sendMessage([{ type: "setCurrentTime", data: dataView.buffer }]);
        await promise;
    }

    // MESSAGE

    /**
     * @param {InformationMessageType} messageType
     * @param {DataView} dataView
     */
    parseMessage(messageType, dataView) {
        _console.log({ messageType });

        switch (messageType) {
            case "getId":
                const id = textDecoder.decode(dataView);
                _console.log({ id });
                this.updateId(id);
                break;
            case "getName":
            case "setName":
                const name = textDecoder.decode(dataView);
                _console.log({ name });
                this.updateName(name);
                break;
            case "getType":
            case "setType":
                const typeEnum = dataView.getUint8(0);
                const type = this.#types[typeEnum];
                _console.log({ typeEnum, type });
                this.updateType(type);
                break;
            case "getMtu":
                const mtu = dataView.getUint16(0, true);
                _console.log({ mtu });
                this.#updateMtu(mtu);
                break;
            case "getCurrentTime":
            case "setCurrentTime":
                const currentTime = Number(dataView.getBigUint64(0, true));
                this.#onCurrentTime(currentTime);
                break;
            default:
                throw Error(`uncaught messageType ${messageType}`);
        }
    }

    /**
     * @callback SendMessageCallback
     * @param {{type: InformationMessageType, data: ArrayBuffer}[]} messages
     * @param {boolean} sendImmediately
     */

    /** @type {SendMessageCallback} */
    sendMessage;

    clear() {
        this.#isCurrentTimeSet = false;
    }
}

export default InformationManager;
