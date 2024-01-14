import EventDispatcher from "../utils/EventDispatcher.js";
import { createConsole } from "../utils/Console.js";

/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherListener} EventDispatcherListener */
/** @typedef {import("./utils/EventDispatcher.js").EventDispatcherOptions} EventDispatcherOptions */

/** @typedef {"sampleEventType"} BrilliantSoleTemplateManagerEventType */

/**
 * @typedef BrilliantSoleTemplateManagerEvent
 * @type {object}
 * @property {BrilliantSoleTemplateManagerEventType} type
 * @property {object} message
 */

const _console = createConsole("TemplateManager");

class TemplateManager {
    /** @type {BrilliantSoleTemplateManagerEventType[]} */
    static #EventTypes = ["sampleEventType"];
    static get EventTypes() {
        return this.#EventTypes;
    }
    get eventTypes() {
        return TemplateManager.#EventTypes;
    }
    #eventDispatcher = new EventDispatcher(this.eventTypes);

    /**
     * @param {BrilliantSoleTemplateManagerEventType} type
     * @param {EventDispatcherListener} listener
     * @param {EventDispatcherOptions?} options
     * @throws {Error}
     */
    addEventListener(type, listener, options) {
        return this.#eventDispatcher.addEventListener(...arguments);
    }

    /**
     * @param {BrilliantSoleTemplateManagerEvent} event
     * @throws {Error} if type is not valid
     */
    #dispatchEvent(event) {
        this.#eventDispatcher.dispatchEvent(event);
    }

    /**
     * @param {BrilliantSoleTemplateManagerEventType} type
     * @param {EventDispatcherListener} listener
     * @returns {boolean}
     * @throws {Error}
     */
    removeEventListener(type, listener) {
        return this.#eventDispatcher.removeEventListener(...arguments);
    }
}

export default TemplateManager;
