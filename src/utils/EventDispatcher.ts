import { createConsole } from "./Console";
import { spacesToPascalCase } from "./stringUtils";

const _console = createConsole("EventDispatcher", { log: false });

export interface EventDispatcherEvent {
  target: any;
  type: string;
  message: Object;
}

export interface EventDispatcherOptions {
  once?: boolean;
}

type EventDispatcherListener = (event: EventDispatcherEvent) => void;

// based on https://github.com/mrdoob/eventdispatcher/
class EventDispatcher {
  constructor(target: object, eventTypes: string[] | undefined) {
    _console.assertWithError(target, "target is required");
    this.#target = target;
    _console.assertWithError(Array.isArray(eventTypes) || eventTypes == undefined, "eventTypes must be an array");
    this.#eventTypes = eventTypes!;
  }

  #target: any;
  #eventTypes: string[];

  #isValidEventType(type: string): boolean {
    if (!this.#eventTypes) {
      return true;
    }
    return this.#eventTypes.includes(type);
  }

  /**
   * @param {string} type
   * @throws {Error}
   */
  #assertValidEventType(type: string) {
    _console.assertWithError(this.#isValidEventType(type), `invalid event type "${type}"`);
  }

  #listeners: { [type: string]: EventDispatcherListener[] | undefined } = {};

  /**
   * @param {string} type
   * @param {EventDispatcherListener} listener
   * @param {EventDispatcherOptions} [options]
   */
  addEventListener(type: string, listener: EventDispatcherListener, options: EventDispatcherOptions) {
    _console.log(`adding "${type}" eventListener`, listener);
    this.#assertValidEventType(type);

    if (options?.once) {
      const _listener = listener;
      listener = function onceCallback(this: EventDispatcher, event) {
        _listener.call(this, event);
        this.removeEventListener(type, onceCallback);
      };
    }

    const listeners = this.#listeners;

    if (!listeners[type]) {
      listeners[type] = [];
    }

    if (!listeners[type]!.includes(listener)) {
      listeners[type]!.push(listener);
    }
  }

  /**
   *
   * @param {string} type
   * @param {EventDispatcherListener} listener
   */
  hasEventListener(type: string, listener: EventDispatcherListener) {
    _console.log(`has "${type}" eventListener?`, listener);
    this.#assertValidEventType(type);
    return this.#listeners?.[type]?.includes(listener);
  }

  /**
   * @param {string} type
   * @param {EventDispatcherListener} listener
   */
  removeEventListener(type: string, listener: EventDispatcherListener) {
    _console.log(`removing "${type}" eventListener`, listener);
    this.#assertValidEventType(type);
    if (this.hasEventListener(type, listener)) {
      const index = this.#listeners[type]!.indexOf(listener);
      this.#listeners[type]!.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * @param {EventDispatcherEvent} event
   */
  dispatchEvent(event: EventDispatcherEvent) {
    this.#assertValidEventType(event.type);
    if (this.#listeners?.[event.type]) {
      event.target = this.#target;

      // Make a copy, in case listeners are removed while iterating.
      const array = this.#listeners[event.type]!.slice(0);

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
  waitForEvent(type: string) {
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

export type BoundEventListeners = { [eventType: string]: EventListener };
export type BoundGenericEventListeners = { [eventType: string]: Function };

export function bindEventListeners(eventTypes: string[], boundEventListeners: BoundGenericEventListeners, target: any) {
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

export function addEventListeners(target: any, boundEventListeners: BoundGenericEventListeners) {
  let addEventListener = target.addEventListener || target.addListener || target.on || target.AddEventListener;
  _console.assertWithError(addEventListener, "no add listener function found for target");
  addEventListener = addEventListener.bind(target);
  Object.entries(boundEventListeners).forEach(([eventType, eventListener]) => {
    addEventListener(eventType, eventListener);
  });
}

export function removeEventListeners(target: any, boundEventListeners: BoundGenericEventListeners) {
  let removeEventListener = target.removeEventListener || target.removeListener || target.RemoveEventListener;
  _console.assertWithError(removeEventListener, "no remove listener function found for target");
  removeEventListener = removeEventListener.bind(target);
  Object.entries(boundEventListeners).forEach(([eventType, eventListener]) => {
    removeEventListener(eventType, eventListener);
  });
}

export default EventDispatcher;
