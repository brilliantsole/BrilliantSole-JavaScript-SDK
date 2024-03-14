import { createConsole } from "./Console";

const _console = createConsole("ListenerUtils", { log: false });

/**
 * @param {string[]} events
 * @param {object.<string, ()=>{}>} boundListeners
 * @param {object} target
 */
export function bindListeners(events, boundListeners, target) {
    _console.log("bindListeners", { events, boundListeners, target });
    events.forEach((event) => {
        const _event = `_on${spacesToPascalCase(event)}`;
        _console.assertWithError(target[_event], `no event "${_event}" found in target`, target);
        _console.log(`binding event "${event}" as ${_event} from target`, target);
        const boundEvent = target[_event].bind(target);
        target[_event] = boundEvent;
        boundListeners[event] = boundEvent;
    });
}

/**
 * @param {object} target
 * @param {object.<string, EventListener>} boundListeners
 */
export function addListeners(target, boundListeners) {
    Object.entries(boundListeners).forEach(([event, listener]) => {
        target.addListener(event, listener);
    });
}

/**
 * @param {object} target
 * @param {object.<string, EventListener>} boundListeners
 */
export function removeListeners(target, boundListeners) {
    Object.entries(boundListeners).forEach(([event, listener]) => {
        target.removeListener(event, listener);
    });
}
