import { createConsole } from "./Console";
import { spacesToPascalCase } from "./stringUtils";

const _console = createConsole("EventUtils", { log: false });

export type BoundEventListeners = { [eventType: string]: EventListener };
export type BoundGenericEventListeners = { [eventType: string]: Function };

export function bindEventListeners(
  eventTypes: readonly string[],
  boundEventListeners: BoundGenericEventListeners,
  target: any
) {
  _console.log("bindEventListeners", { eventTypes, boundEventListeners, target });
  eventTypes.forEach((eventType) => {
    const _eventType = `_on${spacesToPascalCase(eventType)}`;
    _console.assertWithError(target[_eventType], `no event "${_eventType}" found in target`);
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
