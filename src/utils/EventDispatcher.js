import { createConsole } from "./Console.js";
import { spacesToPascalCase } from "./StringUtils.js";

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
     * @param {object} target
     * @param {string[]?} eventTypes
     */
    constructor(target, eventTypes) {
        _console.assertWithError(target, "target is required");
        this.#target = target;
        _console.assertWithError(Array.isArray(eventTypes) || eventTypes == undefined, "eventTypes must be an array");
        this.#eventTypes = eventTypes;
    }

    /** @type {any} */
    #target;
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
     */
    hasEventListener(type, listener) {
        _console.log(`has "${type}" eventListener?`, listener);
        this.#assertValidEventType(type);
        return this.#listeners?.[type]?.includes(listener);
    }

    /**
     * @param {string} type
     * @param {EventDispatcherListener} listener
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
     */
    dispatchEvent(event) {
        this.#assertValidEventType(event.type);
        if (this.#listeners?.[event.type]) {
            event.target = this.#target;

            // Make a copy, in case listeners are removed while iterating.
            const array = this.#listeners[event.type].slice(0);

            for (let i = 0, l = array.length; i < l; i++) {
                try {
                    array[i].call(this, event);
                } catch (error) {
                    _console.error(error);
                }
            }
        }
    }

    /** @param {string} type */
    waitForEvent(type) {
        _console.log(`waiting for event "${type}"`);
        this.#assertValidEventType(type);
        return new Promise((resolve) => {
            this.addEventListener(
                type,
                (event) => {
                    resolve(event);
                },
                { once: true }
            );
        });
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
    let addEventListener = target.addEventListener || target.addListener || target.on || target.AddEventListener;
    _console.assertWithError(addEventListener, "no add listener function found for target");
    addEventListener = addEventListener.bind(target);
    Object.entries(boundEventListeners).forEach(([eventType, eventListener]) => {
        addEventListener(eventType, eventListener);
    });
}

/**
 * @param {object} target
 * @param {object.<string, EventListener>} boundEventListeners
 */
export function removeEventListeners(target, boundEventListeners) {
    let removeEventListener = target.removeEventListener || target.removeListener || target.RemoveEventListener;
    _console.assertWithError(removeEventListener, "no remove listener function found for target");
    removeEventListener = removeEventListener.bind(target);
    Object.entries(boundEventListeners).forEach(([eventType, eventListener]) => {
        removeEventListener(eventType, eventListener);
    });
}

export default EventDispatcher;
