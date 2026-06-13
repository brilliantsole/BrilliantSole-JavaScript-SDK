import { createConsole } from "./Console.ts";

const _console = createConsole("EventUtils", { log: false });

export type BoundGenericEventListeners = {
  [eventType: string]: Function | Function[];
};

export function addEventListeners(
  target: any,
  boundEventListeners: BoundGenericEventListeners,
) {
  let addEventListener =
    target.addEventListener ||
    target.addListener ||
    target.on ||
    target.addEventListener;
  _console.assertWithError(
    addEventListener,
    "no add listener function found for target",
  );
  addEventListener = addEventListener.bind(target);
  Object.entries(boundEventListeners).forEach(([eventType, eventListeners]) => {
    eventListeners = Array.isArray(eventListeners)
      ? eventListeners
      : [eventListeners];
    eventListeners.forEach((eventListener) => {
      addEventListener(eventType, eventListener);
    });
  });
}

export function removeEventListeners(
  target: any,
  boundEventListeners: BoundGenericEventListeners,
) {
  let removeEventListener =
    target.removeEventListener ||
    target.removeListener ||
    target.removeEventListener;
  _console.assertWithError(
    removeEventListener,
    "no remove listener function found for target",
  );
  removeEventListener = removeEventListener.bind(target);
  Object.entries(boundEventListeners).forEach(([eventType, eventListeners]) => {
    eventListeners = Array.isArray(eventListeners)
      ? eventListeners
      : [eventListeners];
    eventListeners.forEach((eventListener) => {
      removeEventListener(eventType, eventListener);
    });
  });
}
