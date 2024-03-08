import { createConsole } from "./Console.js";
import { spacesToPascalCase } from "./stringUtils.js";

const _console = createConsole("EventDispatcher", { log: false });

/**
 * @typedef EventDispatcherEvent
 * @type {Object}
 * @property {any} target
 * @property {string} type
 * @property {object} message
 */

/**
 * @typedef EventDispatcherOptions
 * @type {Object}
 * @property {boolean?} once
 */

/** @typedef {(event: EventDispatcherEvent) => void} EventDispatcherListener */

// based on https://github.com/mrdoob/eventdispatcher.js/
class EventDispatcher {
    /**
     * @param {string[]?} eventTypes
     */
    constructor(eventTypes) {
        _console.assertWithError(Array.isArray(eventTypes) || eventTypes == undefined, "eventTypes must be an array");
        this.#eventTypes = eventTypes;
    }

    /** @type {string[]?} */
    #eventTypes;

    /**
     * @param {string} type
     * @returns {boolean}
     */
    #isValidEventType(type) {
        if (!this.#eventTypes) {
            return true;
        }
        return this.#eventTypes.includes(type);
    }

    /**
     * @param {string} type
     * @throws {Error}
     */
    #assertValidEventType(type) {
        _console.assertWithError(this.#isValidEventType(type), `invalid event type "${type}"`);
    }

    /** @type {Object.<string, [function]?>?} */
    #listeners;

    /**
     * @param {string} type
     * @param {EventDispatcherListener} listener
     * @param {EventDispatcherOptions?} options
     */
    addEventListener(type, listener, options) {
        _console.log(`adding "${type}" eventListener`, listener);
        this.#assertValidEventType(type);

        if (!this.#listeners) this.#listeners = {};

        if (options?.once) {
            const _listener = listener;
            listener = function onceCallback(event) {
                _listener.apply(this, arguments);
                this.removeEventListener(type, onceCallback);
            };
        }

        const listeners = this.#listeners;

        if (!listeners[type]) {
            listeners[type] = [];
        }

        if (!listeners[type].includes(listener)) {
            listeners[type].push(listener);
        }
    }

    /**
     *
     * @param {string} type
     * @param {EventDispatcherListener} listener
     * @returns {boolean}
     * @throws {Error} if type is not valid
     */
    hasEventListener(type, listener) {
        _console.log(`has "${type}" eventListener?`, listener);
        this.#assertValidEventType(type);
        return this.#listeners?.[type]?.includes(listener);
    }

    /**
     * @param {string} type
     * @param {EventDispatcherListener} listener
     * @returns {boolean} successfully removed listener
     * @throws {Error} if type is not valid
     */
    removeEventListener(type, listener) {
        _console.log(`removing "${type}" eventListener`, listener);
        this.#assertValidEventType(type);
        if (this.hasEventListener(type, listener)) {
            const index = this.#listeners[type].indexOf(listener);
            this.#listeners[type].splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * @param {EventDispatcherEvent} event
     * @throws {Error} if type is not valid
     */
    dispatchEvent(event) {
        this.#assertValidEventType(event.type);
        if (this.#listeners?.[event.type]) {
            event.target = this;

            // Make a copy, in case listeners are removed while iterating.
            const array = this.#listeners[event.type].slice(0);

            for (let i = 0, l = array.length; i < l; i++) {
                array[i].call(this, event);
            }
        }
    }
}

/**
 * @param {string[]} eventTypes
 * @param {object.<string, EventListener>} boundEventListeners
 * @param {object} target
 */
export function bindEventListeners(eventTypes, boundEventListeners, target) {
    _console.log("bindEventListeners", { eventTypes, boundEventListeners, target });
    eventTypes.forEach((eventType) => {
        const _eventType = `_on${spacesToPascalCase(eventType)}`;
        _console.assertWithError(target[_eventType], `no event "${_eventType}" found in target`, target);
        _console.log(`binding eventType "${eventType}" as ${_eventType} from target`, target);
        const boundEvent = target[_eventType].bind(target);
        target[_eventType] = boundEvent;
        boundEventListeners[eventType] = boundEvent;
    });
}

/**
 * @param {object} target
 * @param {object.<string, EventListener>} boundEventListeners
 */
export function addEventListeners(target, boundEventListeners) {
    Object.entries(boundEventListeners).forEach(([eventType, eventListener]) => {
        target.addEventListener(eventType, eventListener);
    });
}

/**
 * @param {object} target
 * @param {object.<string, EventListener>} boundEventListeners
 */
export function removeEventListeners(target, boundEventListeners) {
    Object.entries(boundEventListeners).forEach(([eventType, eventListener]) => {
        target.removeEventListener(eventType, eventListener);
    });
}

export default EventDispatcher;
