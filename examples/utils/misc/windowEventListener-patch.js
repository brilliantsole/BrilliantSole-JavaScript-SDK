const _windowEventPrefix = "*";
const _windowEventListenerMap = {};

{
  const addEventListener = window.addEventListener.bind(window);
  const removeEventListener = window.removeEventListener.bind(window);

  const windowEventListeners =
    document.currentScript.dataset.windowEventListeners?.split(",") ?? [];
  // console.log("windowEventListeners", windowEventListeners);
  windowEventListeners.forEach((type) => {
    _windowEventListenerMap[type] = [];
  });

  const _updateWindowEventType = (type) => {
    if (type.startsWith(_windowEventPrefix)) {
      type = type.replace(_windowEventPrefix, "");
    } else if (windowEventListeners?.includes(type)) {
      type = [_windowEventPrefix, type].join("");
    }
    return type;
  };
  window.addEventListener = (type, listener, options) => {
    if (type in _windowEventListenerMap) {
      // console.log({ type }, _windowEventListenerMap);
      _windowEventListenerMap[type].push(listener);
    }

    type = _updateWindowEventType(type);
    //   console.log({ type, listener, options });
    return addEventListener(type, listener, options);
  };
  window.removeEventListener = (type, listener) => {
    if (type in _windowEventListenerMap) {
      if (_windowEventListenerMap[type].includes(listener)) {
        _windowEventListenerMap[type] = _windowEventListenerMap[type].filter(
          (_listener) => _listener != listener
        );
      }
    }

    type = _updateWindowEventType(type);
    //   console.log({ type, listener });
    return removeEventListener(type, listener);
  };
}
