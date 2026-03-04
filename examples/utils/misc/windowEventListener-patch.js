const addEventListener = window.addEventListener.bind(window);
const removeEventListener = window.removeEventListener.bind(window);

const windowEventListeners = window.windowEventListeners ?? [];
// console.log("windowEventListeners", windowEventListeners);

const _windowEventPrefix = "*";
const _updateWindowEventType = (type) => {
  if (type.startsWith(_windowEventPrefix)) {
    type = type.replace(_windowEventPrefix, "");
  } else if (windowEventListeners?.includes(type)) {
    type = [_windowEventPrefix, type].join("");
  }
  return type;
};
window.addEventListener = (type, listener, options) => {
  type = _updateWindowEventType(type);
  //   console.log({ type, listener, options });
  return addEventListener(type, listener, options);
};
window.removeEventListener = (type, listener) => {
  type = _updateWindowEventType(type);
  //   console.log({ type, listener });
  return removeEventListener(type, listener);
};
