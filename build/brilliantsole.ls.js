/**
 * @copyright Zack Qattan 2024
 * @license MIT
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.BS = {}));
})(this, (function (exports) { 'use strict';

  function _assertClassBrand(e, t, n) {
    if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n;
    throw new TypeError("Private element is not present on this object");
  }
  function _checkPrivateRedeclaration(e, t) {
    if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object");
  }
  function _classPrivateFieldGet2(s, a) {
    return s.get(_assertClassBrand(s, a));
  }
  function _classPrivateFieldInitSpec(e, t, a) {
    _checkPrivateRedeclaration(e, t), t.set(e, a);
  }
  function _classPrivateFieldSet2(s, a, r) {
    return s.set(_assertClassBrand(s, a), r), r;
  }
  function _classPrivateGetter(s, r, a) {
    return a(_assertClassBrand(s, r));
  }
  function _classPrivateMethodInitSpec(e, a) {
    _checkPrivateRedeclaration(e, a), a.add(e);
  }
  function _defineProperty(e, r, t) {
    return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
      value: t,
      enumerable: !0,
      configurable: !0,
      writable: !0
    }) : e[r] = t, e;
  }
  function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }

  var _window, _process, _process$versions;
  const isInProduction = "__BRILLIANTSOLE__PROD__" == "__BRILLIANTSOLE__PROD__";
  const isInDev = "__BRILLIANTSOLE__PROD__" == "__BRILLIANTSOLE__DEV__";

  // https://github.com/flexdinesh/browser-or-node/blob/master/src/index.ts
  const isInBrowser = typeof window !== "undefined" && ((_window = window) === null || _window === void 0 ? void 0 : _window.document) !== "undefined";
  const isInNode = typeof process !== "undefined" && ((_process = process) === null || _process === void 0 ? void 0 : (_process$versions = _process.versions) === null || _process$versions === void 0 ? void 0 : _process$versions.node) != null;
  const userAgent = isInBrowser && navigator.userAgent || "";
  let isBluetoothSupported = false;
  if (isInBrowser) {
    isBluetoothSupported = Boolean(navigator.bluetooth);
  } else if (isInNode) {
    isBluetoothSupported = true;
  }
  const isInBluefy = isInBrowser && /Bluefy/i.test(userAgent);
  const isInWebBLE = isInBrowser && /WebBLE/i.test(userAgent);
  const isAndroid = isInBrowser && /Android/i.test(userAgent);
  const isSafari = isInBrowser && /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent);
  const isIOS = isInBrowser && /iPad|iPhone|iPod/i.test(userAgent);
  const isMac = isInBrowser && /Macintosh/i.test(userAgent);
  const isInLensStudio = !isInBrowser && !isInNode && typeof global !== "undefined" && typeof Studio !== "undefined";

  var environment = /*#__PURE__*/Object.freeze({
    __proto__: null,
    isAndroid: isAndroid,
    get isBluetoothSupported () { return isBluetoothSupported; },
    isIOS: isIOS,
    isInBluefy: isInBluefy,
    isInBrowser: isInBrowser,
    isInDev: isInDev,
    isInLensStudio: isInLensStudio,
    isInNode: isInNode,
    isInProduction: isInProduction,
    isInWebBLE: isInWebBLE,
    isMac: isMac,
    isSafari: isSafari
  });

  var __console;
  if (isInLensStudio) {
    const log = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      Studio.log(args.map(value => new String(value)).join(","));
    };
    __console = {};
    __console.log = log;
    __console.warn = log.bind(__console, "WARNING");
    __console.error = log.bind(__console, "ERROR");
  } else {
    __console = console;
  }

  // console.assert not supported in WebBLE
  if (!__console.assert) {
    const assert = function (condition) {
      if (!condition) {
        for (var _len2 = arguments.length, data = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          data[_key2 - 1] = arguments[_key2];
        }
        __console.warn(...data);
      }
    };
    __console.assert = assert;
  }

  // console.table not supported in WebBLE
  if (!__console.table) {
    const table = function () {
      __console.log(...arguments);
    };
    __console.table = table;
  }
  function emptyFunction() {}
  const log = __console.log.bind(__console);
  const warn = __console.warn.bind(__console);
  const error = __console.error.bind(__console);
  const table = __console.table.bind(__console);
  const assert = __console.assert.bind(__console);
  var _levelFlags = /*#__PURE__*/new WeakMap();
  class Console {
    constructor(type) {
      _classPrivateFieldInitSpec(this, _levelFlags, {
        log: isInDev,
        warn: isInDev,
        assert: true,
        error: true,
        table: true
      });
      if (_consoles._[type]) {
        throw new Error(`"${type}" console already exists`);
      }
      _consoles._[type] = this;
    }
    setLevelFlags(levelFlags) {
      Object.assign(_classPrivateFieldGet2(_levelFlags, this), levelFlags);
    }
    static setLevelFlagsForType(type, levelFlags) {
      if (!_assertClassBrand(Console, this, _consoles)._[type]) {
        throw new Error(`no console found with type "${type}"`);
      }
      _assertClassBrand(Console, this, _consoles)._[type].setLevelFlags(levelFlags);
    }
    static setAllLevelFlags(levelFlags) {
      for (const type in _assertClassBrand(Console, this, _consoles)._) {
        _assertClassBrand(Console, this, _consoles)._[type].setLevelFlags(levelFlags);
      }
    }
    static create(type, levelFlags) {
      const console = _assertClassBrand(Console, this, _consoles)._[type] || new Console(type);
      return console;
    }
    get log() {
      return _classPrivateFieldGet2(_levelFlags, this).log ? log : emptyFunction;
    }
    get warn() {
      return _classPrivateFieldGet2(_levelFlags, this).warn ? warn : emptyFunction;
    }
    get error() {
      return _classPrivateFieldGet2(_levelFlags, this).error ? error : emptyFunction;
    }
    get assert() {
      return _classPrivateFieldGet2(_levelFlags, this).assert ? assert : emptyFunction;
    }
    get table() {
      return _classPrivateFieldGet2(_levelFlags, this).table ? table : emptyFunction;
    }
    assertWithError(condition, message) {
      if (!condition) {
        throw new Error(message);
      }
    }
    assertTypeWithError(value, type) {
      this.assertWithError(typeof value == type, `value ${value} of type "${typeof value}" not of type "${type}"`);
    }
    assertEnumWithError(value, enumeration) {
      this.assertWithError(enumeration.includes(value), `invalid enum "${value}"`);
    }
  }
  var _consoles = {
    _: {}
  };
  function createConsole(type, levelFlags) {
    return Console.create(type, levelFlags);
  }
  function setConsoleLevelFlagsForType(type, levelFlags) {
    Console.setLevelFlagsForType(type, levelFlags);
  }
  function setAllConsoleLevelFlags(levelFlags) {
    Console.setAllLevelFlags(levelFlags);
  }

  function capitalizeFirstCharacter(string) {
    return string[0].toUpperCase() + string.slice(1);
  }

  const _console$n = createConsole("EventDispatcher", {
    log: false
  });

  // based on https://github.com/mrdoob/eventdispatcher.js/
  var _target = /*#__PURE__*/new WeakMap();
  var _eventTypes = /*#__PURE__*/new WeakMap();
  var _EventDispatcher_brand = /*#__PURE__*/new WeakSet();
  var _listeners = /*#__PURE__*/new WeakMap();
  class EventDispatcher {
    constructor(target, eventTypes) {
      _classPrivateMethodInitSpec(this, _EventDispatcher_brand);
      _classPrivateFieldInitSpec(this, _target, void 0);
      _classPrivateFieldInitSpec(this, _eventTypes, void 0);
      _classPrivateFieldInitSpec(this, _listeners, void 0);
      _console$n.assertWithError(target, "target is required");
      _classPrivateFieldSet2(_target, this, target);
      _console$n.assertWithError(Array.isArray(eventTypes) || eventTypes == undefined, "eventTypes must be an array");
      _classPrivateFieldSet2(_eventTypes, this, eventTypes);
    }
    addEventListener(type, listener, options) {
      _console$n.log(`adding "${type}" eventListener`, listener);
      _assertClassBrand(_EventDispatcher_brand, this, _assertValidEventType).call(this, type);
      if (!_classPrivateFieldGet2(_listeners, this)) _classPrivateFieldSet2(_listeners, this, {});
      if (options !== null && options !== void 0 && options.once) {
        const _listener = listener;
        listener = function onceCallback(event) {
          _listener.apply(this, arguments);
          this.removeEventListener(type, onceCallback);
        };
      }
      const listeners = _classPrivateFieldGet2(_listeners, this);
      if (!listeners[type]) {
        listeners[type] = [];
      }
      if (!listeners[type].includes(listener)) {
        listeners[type].push(listener);
      }
    }
    hasEventListener(type, listener) {
      var _classPrivateFieldGet2$1, _classPrivateFieldGet3;
      _console$n.log(`has "${type}" eventListener?`, listener);
      _assertClassBrand(_EventDispatcher_brand, this, _assertValidEventType).call(this, type);
      return (_classPrivateFieldGet2$1 = _classPrivateFieldGet2(_listeners, this)) === null || _classPrivateFieldGet2$1 === void 0 ? void 0 : (_classPrivateFieldGet3 = _classPrivateFieldGet2$1[type]) === null || _classPrivateFieldGet3 === void 0 ? void 0 : _classPrivateFieldGet3.includes(listener);
    }
    removeEventListener(type, listener) {
      _console$n.log(`removing "${type}" eventListener`, listener);
      _assertClassBrand(_EventDispatcher_brand, this, _assertValidEventType).call(this, type);
      if (this.hasEventListener(type, listener)) {
        const index = _classPrivateFieldGet2(_listeners, this)[type].indexOf(listener);
        _classPrivateFieldGet2(_listeners, this)[type].splice(index, 1);
        return true;
      }
      return false;
    }
    dispatchEvent(event) {
      var _classPrivateFieldGet4;
      _assertClassBrand(_EventDispatcher_brand, this, _assertValidEventType).call(this, event.type);
      if ((_classPrivateFieldGet4 = _classPrivateFieldGet2(_listeners, this)) !== null && _classPrivateFieldGet4 !== void 0 && _classPrivateFieldGet4[event.type]) {
        event.target = _classPrivateFieldGet2(_target, this);

        // Make a copy, in case listeners are removed while iterating.
        const array = _classPrivateFieldGet2(_listeners, this)[event.type].slice(0);
        for (let i = 0, l = array.length; i < l; i++) {
          try {
            array[i].call(this, event);
          } catch (error) {
            _console$n.error(error);
          }
        }
      }
    }
    waitForEvent(type) {
      _console$n.log(`waiting for event "${type}"`);
      _assertClassBrand(_EventDispatcher_brand, this, _assertValidEventType).call(this, type);
      return new Promise(resolve => {
        this.addEventListener(type, event => {
          resolve(event);
        }, {
          once: true
        });
      });
    }
  }
  function _isValidEventType(type) {
    if (!_classPrivateFieldGet2(_eventTypes, this)) {
      return true;
    }
    return _classPrivateFieldGet2(_eventTypes, this).includes(type);
  }
  function _assertValidEventType(type) {
    _console$n.assertWithError(_assertClassBrand(_EventDispatcher_brand, this, _isValidEventType).call(this, type), `invalid event type "${type}"`);
  }
  function addEventListeners(target, boundEventListeners) {
    let addEventListener = target.addEventListener || target.addListener || target.on || target.AddEventListener;
    _console$n.assertWithError(addEventListener, "no add listener function found for target");
    addEventListener = addEventListener.bind(target);
    Object.entries(boundEventListeners).forEach(_ref => {
      let [eventType, eventListener] = _ref;
      addEventListener(eventType, eventListener);
    });
  }
  function removeEventListeners(target, boundEventListeners) {
    let removeEventListener = target.removeEventListener || target.removeListener || target.RemoveEventListener;
    _console$n.assertWithError(removeEventListener, "no remove listener function found for target");
    removeEventListener = removeEventListener.bind(target);
    Object.entries(boundEventListeners).forEach(_ref2 => {
      let [eventType, eventListener] = _ref2;
      removeEventListener(eventType, eventListener);
    });
  }

  const _console$m = createConsole("Timer", {
    log: false
  });
  var _callback = /*#__PURE__*/new WeakMap();
  var _interval = /*#__PURE__*/new WeakMap();
  var _intervalId = /*#__PURE__*/new WeakMap();
  class Timer {
    get callback() {
      return _classPrivateFieldGet2(_callback, this);
    }
    set callback(newCallback) {
      _console$m.assertTypeWithError(newCallback, "function");
      _console$m.log({
        newCallback
      });
      _classPrivateFieldSet2(_callback, this, newCallback);
      if (this.isRunning) {
        this.restart();
      }
    }
    get interval() {
      return _classPrivateFieldGet2(_interval, this);
    }
    set interval(newInterval) {
      _console$m.assertTypeWithError(newInterval, "number");
      _console$m.assertWithError(newInterval > 0, "interval must be above 0");
      _console$m.log({
        newInterval
      });
      _classPrivateFieldSet2(_interval, this, newInterval);
      if (this.isRunning) {
        this.restart();
      }
    }
    constructor(callback, interval) {
      _classPrivateFieldInitSpec(this, _callback, void 0);
      _classPrivateFieldInitSpec(this, _interval, void 0);
      _classPrivateFieldInitSpec(this, _intervalId, null);
      this.interval = interval;
      this.callback = callback;
    }
    get isRunning() {
      return _classPrivateFieldGet2(_intervalId, this) != null;
    }
    start() {
      if (this.isRunning) {
        _console$m.log("interval already running");
        return;
      }
      _console$m.log("starting interval");
      _classPrivateFieldSet2(_intervalId, this, setInterval(_classPrivateFieldGet2(_callback, this), _classPrivateFieldGet2(_interval, this)));
    }
    stop() {
      if (!this.isRunning) {
        _console$m.log("interval already not running");
        return;
      }
      _console$m.log("stopping interval");
      clearInterval(_classPrivateFieldGet2(_intervalId, this));
      _classPrivateFieldSet2(_intervalId, this, null);
    }
    restart() {
      this.stop();
      this.start();
    }
  }

  createConsole("checksum", {
    log: true
  });

  // https://github.com/googlecreativelab/tiny-motion-trainer/blob/5fceb49f018ae0c403bf9f0ccc437309c2acb507/frontend/src/tf4micro-motion-kit/modules/bleFileTransfer.js#L195

  // See http://home.thep.lu.se/~bjorn/crc/ for more information on simple CRC32 calculations.

  function crc32ForByte(r) {
    for (let j = 0; j < 8; ++j) {
      r = (r & 1 ? 0 : 0xedb88320) ^ r >>> 1;
    }
    return r ^ 0xff000000;
  }
  const tableSize = 256;
  const crc32Table = new Uint32Array(tableSize);
  for (let i = 0; i < tableSize; ++i) {
    crc32Table[i] = crc32ForByte(i);
  }
  function crc32(dataIterable) {
    let dataBytes = new Uint8Array(dataIterable);
    let crc = 0;
    for (let i = 0; i < dataBytes.byteLength; ++i) {
      const crcLowByte = crc & 0x000000ff;
      const dataByte = dataBytes[i];
      const tableIndex = crcLowByte ^ dataByte;
      // The last >>> is to convert this into an unsigned 32-bit integer.
      crc = (crc32Table[tableIndex] ^ crc >>> 8) >>> 0;
    }
    return crc;
  }

  var _TextEncoder;
  if (typeof TextEncoder == "undefined") {
    _TextEncoder = class {
      encode(string) {
        const encoding = Array.from(string).map(char => char.charCodeAt(0));
        return Uint8Array.from(encoding);
      }
    };
  } else {
    _TextEncoder = TextEncoder;
  }
  var _TextDecoder;
  if (typeof TextDecoder == "undefined") {
    _TextDecoder = class {
      decode(data) {
        const byteArray = Array.from(new Uint8Array(data));
        return byteArray.map(value => {
          return String.fromCharCode(value);
        }).join("");
      }
    };
  } else {
    _TextDecoder = TextDecoder;
  }
  const textEncoder = new _TextEncoder();
  const textDecoder = new _TextDecoder();

  const _console$l = createConsole("ArrayBufferUtils", {
    log: false
  });
  function concatenateArrayBuffers() {
    for (var _len = arguments.length, arrayBuffers = new Array(_len), _key = 0; _key < _len; _key++) {
      arrayBuffers[_key] = arguments[_key];
    }
    arrayBuffers = arrayBuffers.filter(arrayBuffer => arrayBuffer != undefined || arrayBuffer != null);
    arrayBuffers = arrayBuffers.map(arrayBuffer => {
      if (typeof arrayBuffer == "number") {
        const number = arrayBuffer;
        return Uint8Array.from([Math.floor(number)]);
      } else if (typeof arrayBuffer == "boolean") {
        const boolean = arrayBuffer;
        return Uint8Array.from([boolean ? 1 : 0]);
      } else if (typeof arrayBuffer == "string") {
        const string = arrayBuffer;
        return stringToArrayBuffer(string);
      } else if (arrayBuffer instanceof Array) {
        const array = arrayBuffer;
        return concatenateArrayBuffers(...array);
      } else if (arrayBuffer instanceof ArrayBuffer) {
        return arrayBuffer;
      } else if ("buffer" in arrayBuffer && arrayBuffer.buffer instanceof ArrayBuffer) {
        const bufferContainer = arrayBuffer;
        return bufferContainer.buffer;
      } else if (arrayBuffer instanceof DataView) {
        const dataView = arrayBuffer;
        return dataView.buffer;
      } else if (typeof arrayBuffer == "object") {
        const object = arrayBuffer;
        return objectToArrayBuffer(object);
      } else {
        return arrayBuffer;
      }
    });
    arrayBuffers = arrayBuffers.filter(arrayBuffer => arrayBuffer && "byteLength" in arrayBuffer);
    const length = arrayBuffers.reduce((length, arrayBuffer) => length + arrayBuffer.byteLength, 0);
    const uint8Array = new Uint8Array(length);
    let byteOffset = 0;
    arrayBuffers.forEach(arrayBuffer => {
      uint8Array.set(new Uint8Array(arrayBuffer), byteOffset);
      byteOffset += arrayBuffer.byteLength;
    });
    return uint8Array.buffer;
  }
  function stringToArrayBuffer(string) {
    const encoding = textEncoder.encode(string);
    return concatenateArrayBuffers(encoding.byteLength, encoding);
  }
  function objectToArrayBuffer(object) {
    return stringToArrayBuffer(JSON.stringify(object));
  }
  function sliceDataView(dataView, begin, length) {
    let end;
    if (length != undefined) {
      end = dataView.byteOffset + begin + length;
    }
    _console$l.log({
      dataView,
      begin,
      end,
      length
    });
    return new DataView(dataView.buffer.slice(dataView.byteOffset + begin, end));
  }
  async function getFileBuffer(file) {
    let fileBuffer;
    if (file instanceof Array) {
      fileBuffer = Uint8Array.from(file);
    } else if (file instanceof DataView) {
      fileBuffer = file.buffer;
    } else if (typeof file == "string" || file instanceof URL) {
      const response = await fetch(file);
      fileBuffer = await response.arrayBuffer();
    } else if (file instanceof File) {
      fileBuffer = await file.arrayBuffer();
    } else if (file instanceof ArrayBuffer) {
      fileBuffer = file;
    } else {
      throw {
        error: "invalid file type",
        file
      };
    }
    return fileBuffer;
  }

  var _FileTransferManager;
  const _console$k = createConsole("FileTransferManager", {
    log: true
  });
  var _FileTransferManager_brand = /*#__PURE__*/new WeakSet();
  var _maxLength = /*#__PURE__*/new WeakMap();
  var _type$1 = /*#__PURE__*/new WeakMap();
  var _length = /*#__PURE__*/new WeakMap();
  var _checksum = /*#__PURE__*/new WeakMap();
  var _status$2 = /*#__PURE__*/new WeakMap();
  var _receivedBlocks = /*#__PURE__*/new WeakMap();
  class FileTransferManager {
    constructor() {
      _classPrivateMethodInitSpec(this, _FileTransferManager_brand);
      _defineProperty(this, "eventDispatcher", void 0);
      _classPrivateFieldInitSpec(this, _maxLength, FileTransferManager.MaxLength);
      _classPrivateFieldInitSpec(this, _type$1, void 0);
      _classPrivateFieldInitSpec(this, _length, 0);
      _classPrivateFieldInitSpec(this, _checksum, 0);
      _classPrivateFieldInitSpec(this, _status$2, "idle");
      // BLOCK

      _classPrivateFieldInitSpec(this, _receivedBlocks, []);
      _defineProperty(this, "sendMessage", void 0);
      // MTU
      _defineProperty(this, "mtu", void 0);
    }
    static get MessageTypes() {
      return _assertClassBrand(FileTransferManager, this, _MessageTypes$8)._;
    }
    get messageTypes() {
      return FileTransferManager.MessageTypes;
    }

    // EVENT DISPATCHER

    static get EventTypes() {
      return _assertClassBrand(FileTransferManager, this, _EventTypes$8)._;
    }
    get eventTypes() {
      return _EventTypes$8._;
    }
    addEventListener(type, listener, options) {
      this.eventDispatcher.addEventListener(type, listener, options);
    }
    removeEventListener(type, listener) {
      return this.eventDispatcher.removeEventListener(type, listener);
    }
    waitForEvent(eventType) {
      return this.eventDispatcher.waitForEvent(eventType);
    }

    // PROPERTIES

    static get Types() {
      return _assertClassBrand(FileTransferManager, this, _Types$6)._;
    }
    get types() {
      return FileTransferManager.Types;
    }
    static get Statuses() {
      return _assertClassBrand(FileTransferManager, this, _Statuses$1)._;
    }
    get statuses() {
      return FileTransferManager.Statuses;
    }
    static get Commands() {
      return _assertClassBrand(FileTransferManager, this, _Commands)._;
    }
    get commands() {
      return FileTransferManager.Commands;
    }
    // kB
    static get MaxLength() {
      return _assertClassBrand(FileTransferManager, this, _MaxLength)._;
    }
    get maxLength() {
      return _classPrivateFieldGet2(_maxLength, this);
    }
    get type() {
      return _classPrivateFieldGet2(_type$1, this);
    }
    get length() {
      return _classPrivateFieldGet2(_length, this);
    }
    get checksum() {
      return _classPrivateFieldGet2(_checksum, this);
    }
    get status() {
      return _classPrivateFieldGet2(_status$2, this);
    }
    // MESSAGE

    parseMessage(messageType, dataView) {
      _console$k.log({
        messageType
      });
      switch (messageType) {
        case "maxFileLength":
          _assertClassBrand(_FileTransferManager_brand, this, _parseMaxLength).call(this, dataView);
          break;
        case "getFileTransferType":
        case "setFileTransferType":
          _assertClassBrand(_FileTransferManager_brand, this, _parseType).call(this, dataView);
          break;
        case "getFileLength":
        case "setFileLength":
          _assertClassBrand(_FileTransferManager_brand, this, _parseLength).call(this, dataView);
          break;
        case "getFileChecksum":
        case "setFileChecksum":
          _assertClassBrand(_FileTransferManager_brand, this, _parseChecksum).call(this, dataView);
          break;
        case "fileTransferStatus":
          _assertClassBrand(_FileTransferManager_brand, this, _parseStatus).call(this, dataView);
          break;
        case "getFileTransferBlock":
          _assertClassBrand(_FileTransferManager_brand, this, _parseBlock).call(this, dataView);
          break;
        default:
          throw Error(`uncaught messageType ${messageType}`);
      }
    }

    // FILE TRANSFER

    async send(type, file) {
      _assertClassBrand(_FileTransferManager_brand, this, _assertIsIdle).call(this);
      _assertClassBrand(_FileTransferManager_brand, this, _assertValidType).call(this, type);
      const fileBuffer = await getFileBuffer(file);
      const promises = [];
      promises.push(_assertClassBrand(_FileTransferManager_brand, this, _setType).call(this, type, false));
      const fileLength = fileBuffer.byteLength;
      promises.push(_assertClassBrand(_FileTransferManager_brand, this, _setLength).call(this, fileLength, false));
      const checksum = crc32(fileBuffer);
      promises.push(_assertClassBrand(_FileTransferManager_brand, this, _setChecksum).call(this, checksum, false));
      promises.push(_assertClassBrand(_FileTransferManager_brand, this, _setCommand).call(this, "startSend", false));
      this.sendMessage();
      await Promise.all(promises);
      await _assertClassBrand(_FileTransferManager_brand, this, _send).call(this, fileBuffer);
    }
    async receive(type) {
      _assertClassBrand(_FileTransferManager_brand, this, _assertIsIdle).call(this);
      _assertClassBrand(_FileTransferManager_brand, this, _assertValidType).call(this, type);
      await _assertClassBrand(_FileTransferManager_brand, this, _setType).call(this, type);
      await _assertClassBrand(_FileTransferManager_brand, this, _setCommand).call(this, "startReceive");
    }
    async cancel() {
      _assertClassBrand(_FileTransferManager_brand, this, _assertIsNotIdle).call(this);
      await _assertClassBrand(_FileTransferManager_brand, this, _setCommand).call(this, "cancel");
    }
  }
  _FileTransferManager = FileTransferManager;
  function _dispatchEvent$8(event) {
    this.eventDispatcher.dispatchEvent(event);
  }
  function _assertValidType(type) {
    _console$k.assertEnumWithError(type, this.types);
  }
  function _assertValidTypeEnum(typeEnum) {
    _console$k.assertWithError(this.types[typeEnum], `invalid typeEnum ${typeEnum}`);
  }
  function _assertValidStatusEnum(statusEnum) {
    _console$k.assertWithError(this.statuses[statusEnum], `invalid statusEnum ${statusEnum}`);
  }
  function _assertValidCommand(command) {
    _console$k.assertEnumWithError(command, this.commands);
  }
  function _parseMaxLength(dataView) {
    _console$k.log("parseFileMaxLength", dataView);
    const maxLength = dataView.getUint32(0, true);
    _console$k.log(`maxLength: ${maxLength / 1024}kB`);
    _classPrivateFieldSet2(_maxLength, this, maxLength);
  }
  function _assertValidLength(length) {
    _console$k.assertWithError(length <= this.maxLength, `file length ${length}kB too large - must be ${this.maxLength}kB or less`);
  }
  function _parseType(dataView) {
    _console$k.log("parseFileType", dataView);
    const typeEnum = dataView.getUint8(0);
    _assertClassBrand(_FileTransferManager_brand, this, _assertValidTypeEnum).call(this, typeEnum);
    const type = this.types[typeEnum];
    _assertClassBrand(_FileTransferManager_brand, this, _updateType).call(this, type);
  }
  function _updateType(type) {
    _console$k.log({
      fileTransferType: type
    });
    _classPrivateFieldSet2(_type$1, this, type);
    _assertClassBrand(_FileTransferManager_brand, this, _dispatchEvent$8).call(this, {
      type: "getFileTransferType",
      message: {
        fileType: type
      }
    });
  }
  async function _setType(newType, sendImmediately) {
    _assertClassBrand(_FileTransferManager_brand, this, _assertValidType).call(this, newType);
    if (this.type == newType) {
      _console$k.log(`redundant type assignment ${newType}`);
      return;
    }
    const promise = this.waitForEvent("getFileTransferType");
    const typeEnum = this.types.indexOf(newType);
    this.sendMessage([{
      type: "setFileTransferType",
      data: Uint8Array.from([typeEnum]).buffer
    }], sendImmediately);
    await promise;
  }
  function _parseLength(dataView) {
    _console$k.log("parseFileLength", dataView);
    const length = dataView.getUint32(0, true);
    _assertClassBrand(_FileTransferManager_brand, this, _updateLength).call(this, length);
  }
  function _updateLength(length) {
    _console$k.log(`length: ${length / 1024}kB`);
    _classPrivateFieldSet2(_length, this, length);
    _assertClassBrand(_FileTransferManager_brand, this, _dispatchEvent$8).call(this, {
      type: "getFileLength",
      message: {
        fileLength: length
      }
    });
  }
  async function _setLength(newLength, sendImmediately) {
    _console$k.assertTypeWithError(newLength, "number");
    _assertClassBrand(_FileTransferManager_brand, this, _assertValidLength).call(this, newLength);
    if (this.length == newLength) {
      _console$k.log(`redundant length assignment ${newLength}`);
      return;
    }
    const promise = this.waitForEvent("getFileLength");
    const dataView = new DataView(new ArrayBuffer(4));
    dataView.setUint32(0, newLength, true);
    this.sendMessage([{
      type: "setFileLength",
      data: dataView.buffer
    }], sendImmediately);
    await promise;
  }
  function _parseChecksum(dataView) {
    _console$k.log("checksum", dataView);
    const checksum = dataView.getUint32(0, true);
    _assertClassBrand(_FileTransferManager_brand, this, _updateChecksum).call(this, checksum);
  }
  function _updateChecksum(checksum) {
    _console$k.log({
      checksum
    });
    _classPrivateFieldSet2(_checksum, this, checksum);
    _assertClassBrand(_FileTransferManager_brand, this, _dispatchEvent$8).call(this, {
      type: "getFileChecksum",
      message: {
        fileChecksum: checksum
      }
    });
  }
  async function _setChecksum(newChecksum, sendImmediately) {
    _console$k.assertTypeWithError(newChecksum, "number");
    if (this.checksum == newChecksum) {
      _console$k.log(`redundant checksum assignment ${newChecksum}`);
      return;
    }
    const promise = this.waitForEvent("getFileChecksum");
    const dataView = new DataView(new ArrayBuffer(4));
    dataView.setUint32(0, newChecksum, true);
    this.sendMessage([{
      type: "setFileChecksum",
      data: dataView.buffer
    }], sendImmediately);
    await promise;
  }
  async function _setCommand(command, sendImmediately) {
    _assertClassBrand(_FileTransferManager_brand, this, _assertValidCommand).call(this, command);
    const promise = this.waitForEvent("fileTransferStatus");
    const commandEnum = this.commands.indexOf(command);
    this.sendMessage([{
      type: "setFileTransferCommand",
      data: Uint8Array.from([commandEnum]).buffer
    }], sendImmediately);
    await promise;
  }
  function _parseStatus(dataView) {
    _console$k.log("parseFileStatus", dataView);
    const statusEnum = dataView.getUint8(0);
    _assertClassBrand(_FileTransferManager_brand, this, _assertValidStatusEnum).call(this, statusEnum);
    const status = this.statuses[statusEnum];
    _assertClassBrand(_FileTransferManager_brand, this, _updateStatus$1).call(this, status);
  }
  function _updateStatus$1(status) {
    _console$k.log({
      status
    });
    _classPrivateFieldSet2(_status$2, this, status);
    _assertClassBrand(_FileTransferManager_brand, this, _dispatchEvent$8).call(this, {
      type: "fileTransferStatus",
      message: {
        fileTransferStatus: status
      }
    });
    _classPrivateFieldGet2(_receivedBlocks, this).length = 0;
  }
  function _assertIsIdle() {
    _console$k.assertWithError(_classPrivateFieldGet2(_status$2, this) == "idle", "status is not idle");
  }
  function _assertIsNotIdle() {
    _console$k.assertWithError(_classPrivateFieldGet2(_status$2, this) != "idle", "status is idle");
  }
  async function _parseBlock(dataView) {
    _console$k.log("parseFileBlock", dataView);
    _classPrivateFieldGet2(_receivedBlocks, this).push(dataView.buffer);
    const bytesReceived = _classPrivateFieldGet2(_receivedBlocks, this).reduce((sum, arrayBuffer) => sum += arrayBuffer.byteLength, 0);
    const progress = bytesReceived / _classPrivateFieldGet2(_length, this);
    _console$k.log(`received ${bytesReceived} of ${_classPrivateFieldGet2(_length, this)} bytes (${progress * 100}%)`);
    _assertClassBrand(_FileTransferManager_brand, this, _dispatchEvent$8).call(this, {
      type: "fileTransferProgress",
      message: {
        progress
      }
    });
    if (bytesReceived != _classPrivateFieldGet2(_length, this)) {
      return;
    }
    _console$k.log("file transfer complete");
    let fileName = new Date().toLocaleString();
    switch (this.type) {
      case "tflite":
        fileName += ".tflite";
        break;
    }
    let file;
    if (typeof File !== "undefined") {
      file = new File(_classPrivateFieldGet2(_receivedBlocks, this), fileName);
    } else {
      file = new Blob(_classPrivateFieldGet2(_receivedBlocks, this));
    }
    const arrayBuffer = await file.arrayBuffer();
    const checksum = crc32(arrayBuffer);
    _console$k.log({
      checksum
    });
    if (checksum != _classPrivateFieldGet2(_checksum, this)) {
      _console$k.error(`wrong checksum - expected ${_classPrivateFieldGet2(_checksum, this)}, got ${checksum}`);
      return;
    }
    _console$k.log("received file", file);
    _assertClassBrand(_FileTransferManager_brand, this, _dispatchEvent$8).call(this, {
      type: "fileTransferComplete",
      message: {
        direction: "receiving"
      }
    });
    _assertClassBrand(_FileTransferManager_brand, this, _dispatchEvent$8).call(this, {
      type: "fileReceived",
      message: {
        file
      }
    });
  }
  async function _send(buffer) {
    return _assertClassBrand(_FileTransferManager_brand, this, _sendBlock).call(this, buffer);
  }
  async function _sendBlock(buffer) {
    let offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    if (this.status != "sending") {
      return;
    }
    const slicedBuffer = buffer.slice(offset, offset + (this.mtu - 3 - 3));
    _console$k.log("slicedBuffer", slicedBuffer);
    const bytesLeft = buffer.byteLength - offset;
    const progress = 1 - bytesLeft / buffer.byteLength;
    _console$k.log(`sending bytes ${offset}-${offset + slicedBuffer.byteLength} of ${buffer.byteLength} bytes (${progress * 100}%)`);
    _assertClassBrand(_FileTransferManager_brand, this, _dispatchEvent$8).call(this, {
      type: "fileTransferProgress",
      message: {
        progress
      }
    });
    if (slicedBuffer.byteLength == 0) {
      _console$k.log("finished sending buffer");
      _assertClassBrand(_FileTransferManager_brand, this, _dispatchEvent$8).call(this, {
        type: "fileTransferComplete",
        message: {
          direction: "sending"
        }
      });
    } else {
      await this.sendMessage([{
        type: "setFileTransferBlock",
        data: slicedBuffer
      }]);
      return _assertClassBrand(_FileTransferManager_brand, this, _sendBlock).call(this, buffer, offset + slicedBuffer.byteLength);
    }
  }
  // MESSAGE TYPES
  var _MessageTypes$8 = {
    _: ["maxFileLength", "getFileTransferType", "setFileTransferType", "getFileLength", "setFileLength", "getFileChecksum", "setFileChecksum", "setFileTransferCommand", "fileTransferStatus", "getFileTransferBlock", "setFileTransferBlock"]
  };
  var _EventTypes$8 = {
    _: [..._assertClassBrand(_FileTransferManager, _FileTransferManager, _MessageTypes$8)._, "fileTransferProgress", "fileTransferComplete", "fileReceived"]
  };
  var _Types$6 = {
    _: ["tflite"]
  };
  var _Statuses$1 = {
    _: ["idle", "sending", "receiving"]
  };
  var _Commands = {
    _: ["startSend", "startReceive", "cancel"]
  };
  var _MaxLength = {
    _: 0
  };

  const Uint16Max = 2 ** 16;
  function removeLower2Bytes(number) {
    const lower2Bytes = number % Uint16Max;
    return number - lower2Bytes;
  }
  function parseTimestamp(dataView, byteOffset) {
    const now = Date.now();
    const nowWithoutLower2Bytes = removeLower2Bytes(now);
    const lower2Bytes = dataView.getUint16(byteOffset, true);
    const timestamp = nowWithoutLower2Bytes + lower2Bytes;
    return timestamp;
  }

  const initialRange = {
    min: Infinity,
    max: -Infinity,
    range: 0
  };
  var _range$1 = /*#__PURE__*/new WeakMap();
  class RangeHelper {
    constructor() {
      _classPrivateFieldInitSpec(this, _range$1, Object.assign({}, initialRange));
    }
    reset() {
      Object.assign(_classPrivateFieldGet2(_range$1, this), initialRange);
    }
    update(value) {
      _classPrivateFieldGet2(_range$1, this).min = Math.min(value, _classPrivateFieldGet2(_range$1, this).min);
      _classPrivateFieldGet2(_range$1, this).max = Math.max(value, _classPrivateFieldGet2(_range$1, this).max);
      _classPrivateFieldGet2(_range$1, this).range = _classPrivateFieldGet2(_range$1, this).max - _classPrivateFieldGet2(_range$1, this).min;
    }
    getNormalization(value) {
      return _classPrivateFieldGet2(_range$1, this).range * value || 0;
    }
    updateAndGetNormalization(value) {
      this.update(value);
      return this.getNormalization(value);
    }
  }

  var _range = /*#__PURE__*/new WeakMap();
  class CenterOfPressureHelper {
    constructor() {
      _classPrivateFieldInitSpec(this, _range, {
        x: new RangeHelper(),
        y: new RangeHelper()
      });
    }
    reset() {
      _classPrivateFieldGet2(_range, this).x.reset();
      _classPrivateFieldGet2(_range, this).y.reset();
    }
    update(centerOfPressure) {
      _classPrivateFieldGet2(_range, this).x.update(centerOfPressure.x);
      _classPrivateFieldGet2(_range, this).y.update(centerOfPressure.y);
    }
    getNormalization(centerOfPressure) {
      return {
        x: _classPrivateFieldGet2(_range, this).x.getNormalization(centerOfPressure.x),
        y: _classPrivateFieldGet2(_range, this).y.getNormalization(centerOfPressure.y)
      };
    }
    updateAndGetNormalization(centerOfPressure) {
      this.update(centerOfPressure);
      return this.getNormalization(centerOfPressure);
    }
  }

  function createArray(arrayLength, objectOrCallback) {
    return new Array(arrayLength).fill(1).map((_, index) => {
      if (typeof objectOrCallback == "function") {
        const callback = objectOrCallback;
        return callback(index);
      } else {
        const object = objectOrCallback;
        return Object.assign({}, object);
      }
    });
  }
  function arrayWithoutDuplicates(array) {
    return array.filter((value, index) => array.indexOf(value) == index);
  }

  const _console$j = createConsole("PressureSensorDataManager", {
    log: true
  });
  var _positions = /*#__PURE__*/new WeakMap();
  var _sensorRangeHelpers = /*#__PURE__*/new WeakMap();
  var _centerOfPressureHelper$1 = /*#__PURE__*/new WeakMap();
  class PressureSensorDataManager {
    constructor() {
      _classPrivateFieldInitSpec(this, _positions, []);
      _classPrivateFieldInitSpec(this, _sensorRangeHelpers, void 0);
      _classPrivateFieldInitSpec(this, _centerOfPressureHelper$1, new CenterOfPressureHelper());
    }
    static get Types() {
      return _assertClassBrand(PressureSensorDataManager, this, _Types$5)._;
    }
    static get ContinuousTypes() {
      return this.Types;
    }
    get positions() {
      return _classPrivateFieldGet2(_positions, this);
    }
    get numberOfSensors() {
      return this.positions.length;
    }
    parsePositions(dataView) {
      const positions = [];
      for (let pressureSensorIndex = 0, byteOffset = 0; byteOffset < dataView.byteLength; pressureSensorIndex++, byteOffset += 2) {
        positions.push({
          x: dataView.getUint8(byteOffset) / 2 ** 8,
          y: dataView.getUint8(byteOffset + 1) / 2 ** 8
        });
      }
      _console$j.log({
        positions
      });
      _classPrivateFieldSet2(_positions, this, positions);
      _classPrivateFieldSet2(_sensorRangeHelpers, this, createArray(this.numberOfSensors, () => new RangeHelper()));
      this.resetRange();
    }
    resetRange() {
      _classPrivateFieldGet2(_sensorRangeHelpers, this).forEach(rangeHelper => rangeHelper.reset());
      _classPrivateFieldGet2(_centerOfPressureHelper$1, this).reset();
    }
    parseData(dataView, scalar) {
      const pressure = {
        sensors: [],
        scaledSum: 0,
        normalizedSum: 0
      };
      for (let index = 0, byteOffset = 0; byteOffset < dataView.byteLength; index++, byteOffset += 2) {
        const rawValue = dataView.getUint16(byteOffset, true);
        const scaledValue = rawValue * scalar;
        const rangeHelper = _classPrivateFieldGet2(_sensorRangeHelpers, this)[index];
        const normalizedValue = rangeHelper.updateAndGetNormalization(scaledValue);
        const position = this.positions[index];
        pressure.sensors[index] = {
          rawValue,
          scaledValue,
          normalizedValue,
          position,
          weightedValue: 0
        };
        pressure.scaledSum += scaledValue;
        pressure.normalizedSum += normalizedValue / this.numberOfSensors;
      }
      if (pressure.scaledSum > 0) {
        pressure.center = {
          x: 0,
          y: 0
        };
        pressure.sensors.forEach(sensor => {
          sensor.weightedValue = sensor.scaledValue / pressure.scaledSum;
          pressure.center.x += sensor.position.x * sensor.weightedValue;
          pressure.center.y += sensor.position.y * sensor.weightedValue;
        });
        pressure.normalizedCenter = _classPrivateFieldGet2(_centerOfPressureHelper$1, this).updateAndGetNormalization(pressure.center);
      }
      _console$j.log({
        pressure
      });
      return pressure;
    }
  }
  var _Types$5 = {
    _: ["pressure"]
  };

  var _MotionSensorDataManager;
  const _console$i = createConsole("MotionSensorDataManager", {
    log: true
  });
  var _MotionSensorDataManager_brand = /*#__PURE__*/new WeakSet();
  class MotionSensorDataManager {
    constructor() {
      _classPrivateMethodInitSpec(this, _MotionSensorDataManager_brand);
    }
    static get Types() {
      return _assertClassBrand(MotionSensorDataManager, this, _Types$4)._;
    }
    static get ContinuousTypes() {
      return _assertClassBrand(MotionSensorDataManager, this, _ContinuousTypes$1)._;
    }
    static get Vector3Size() {
      return _assertClassBrand(MotionSensorDataManager, this, _Vector3Size)._;
    }
    get vector3Size() {
      return MotionSensorDataManager.Vector3Size;
    }
    parseVector3(dataView, scalar) {
      let [x, y, z] = [dataView.getInt16(0, true), dataView.getInt16(2, true), dataView.getInt16(4, true)].map(value => value * scalar);
      const vector = {
        x,
        y,
        z
      };
      _console$i.log({
        vector
      });
      return vector;
    }
    static get QuaternionSize() {
      return _assertClassBrand(MotionSensorDataManager, this, _QuaternionSize)._;
    }
    get quaternionSize() {
      return MotionSensorDataManager.QuaternionSize;
    }
    parseQuaternion(dataView, scalar) {
      let [x, y, z, w] = [dataView.getInt16(0, true), dataView.getInt16(2, true), dataView.getInt16(4, true), dataView.getInt16(6, true)].map(value => value * scalar);
      const quaternion = {
        x,
        y,
        z,
        w
      };
      _console$i.log({
        quaternion
      });
      return quaternion;
    }
    static get EulerSize() {
      return _assertClassBrand(MotionSensorDataManager, this, _EulerSize)._;
    }
    get eulerSize() {
      return MotionSensorDataManager.EulerSize;
    }
    parseEuler(dataView, scalar) {
      let [heading, pitch, roll] = [dataView.getInt16(0, true), dataView.getInt16(2, true), dataView.getInt16(4, true)].map(value => value * scalar);
      pitch *= -1;
      heading *= -1;
      const euler = {
        heading,
        pitch,
        roll
      };
      _console$i.log({
        euler
      });
      return euler;
    }
    parseStepCounter(dataView) {
      _console$i.log("parseStepCounter", dataView);
      const stepCount = dataView.getUint32(0, true);
      _console$i.log({
        stepCount
      });
      return stepCount;
    }
    static get ActivityTypes() {
      return _assertClassBrand(MotionSensorDataManager, this, _ActivityTypes)._;
    }
    parseActivity(dataView) {
      _console$i.log("parseActivity", dataView);
      const activity = {};
      const activityBitfield = dataView.getUint8(0);
      _console$i.log("activityBitfield", activityBitfield.toString(2));
      _classPrivateGetter(_MotionSensorDataManager_brand, this, _get_activityTypes).forEach((activityType, index) => {
        activity[activityType] = Boolean(activityBitfield & 1 << index);
      });
      _console$i.log("activity", activity);
      return activity;
    }
    static get DeviceOrientations() {
      return _assertClassBrand(MotionSensorDataManager, this, _DeviceOrientations)._;
    }
    parseDeviceOrientation(dataView) {
      _console$i.log("parseDeviceOrientation", dataView);
      const index = dataView.getUint8(0);
      const deviceOrientation = _classPrivateGetter(_MotionSensorDataManager_brand, this, _get_deviceOrientations)[index];
      _console$i.assertWithError(deviceOrientation, "undefined deviceOrientation");
      _console$i.log({
        deviceOrientation
      });
      return deviceOrientation;
    }
  }
  _MotionSensorDataManager = MotionSensorDataManager;
  function _get_activityTypes(_this) {
    return _ActivityTypes._;
  }
  function _get_deviceOrientations(_this2) {
    return _DeviceOrientations._;
  }
  var _Types$4 = {
    _: ["acceleration", "gravity", "linearAcceleration", "gyroscope", "magnetometer", "gameRotation", "rotation", "orientation", "activity", "stepCounter", "stepDetector", "deviceOrientation"]
  };
  var _ContinuousTypes$1 = {
    _: _assertClassBrand(_MotionSensorDataManager, _MotionSensorDataManager, _Types$4)._.filter(type => {
      switch (type) {
        case "orientation":
        case "activity":
        case "stepCounter":
        case "stepDetector":
        case "deviceOrientation":
          return false;
        default:
          return true;
      }
    })
  };
  var _Vector3Size = {
    _: 3 * 2
  };
  var _QuaternionSize = {
    _: 4 * 2
  };
  var _EulerSize = {
    _: 3 * 2
  };
  var _ActivityTypes = {
    _: ["still", "walking", "running", "bicycle", "vehicle", "tilting"]
  };
  var _DeviceOrientations = {
    _: ["portraitUpright", "landscapeLeft", "portraitUpsideDown", "landscapeRight", "unknown"]
  };

  const _console$h = createConsole("BarometerSensorDataManager", {
    log: true
  });
  var _BarometerSensorDataManager_brand = /*#__PURE__*/new WeakSet();
  class BarometerSensorDataManager {
    constructor() {
      _classPrivateMethodInitSpec(this, _BarometerSensorDataManager_brand);
    }
    static get Types() {
      return _assertClassBrand(BarometerSensorDataManager, this, _Types$3)._;
    }
    static get ContinuousTypes() {
      return this.Types;
    }
    parseData(dataView, scalar) {
      const pressure = dataView.getUint32(0, true) * scalar;
      const altitude = _assertClassBrand(_BarometerSensorDataManager_brand, this, _calculcateAltitude).call(this, pressure);
      _console$h.log({
        pressure,
        altitude
      });
      return {
        pressure
      };
    }
  }
  function _calculcateAltitude(pressure) {
    const P0 = 101325; // Standard atmospheric pressure at sea level in Pascals
    const T0 = 288.15; // Standard temperature at sea level in Kelvin
    const L = 0.0065; // Temperature lapse rate in K/m
    const R = 8.3144598; // Universal gas constant in J/(mol·K)
    const g = 9.80665; // Acceleration due to gravity in m/s²
    const M = 0.0289644; // Molar mass of Earth's air in kg/mol

    const exponent = R * L / (g * M);
    const h = T0 / L * (1 - Math.pow(pressure / P0, exponent));
    return h;
  }
  var _Types$3 = {
    _: ["barometer"]
  };

  const _console$g = createConsole("ParseUtils", {
    log: true
  });
  function parseMessage(dataView, enumeration, callback, context) {
    let parseMessageLengthAsUint16 = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
    let byteOffset = 0;
    while (byteOffset < dataView.byteLength) {
      const messageTypeEnum = dataView.getUint8(byteOffset++);
      const messageType = enumeration[messageTypeEnum];
      let messageLength;
      if (parseMessageLengthAsUint16) {
        messageLength = dataView.getUint16(byteOffset, true);
        byteOffset += 2;
      } else {
        messageLength = dataView.getUint8(byteOffset++);
      }
      _console$g.log({
        messageTypeEnum,
        messageType,
        messageLength,
        dataView,
        byteOffset
      });
      _console$g.assertWithError(messageType, `invalid messageTypeEnum ${messageTypeEnum}`);
      const _dataView = sliceDataView(dataView, byteOffset, messageLength);
      _console$g.log({
        _dataView
      });
      callback(messageType, _dataView, context);
      byteOffset += messageLength;
    }
  }

  var _SensorDataManager;
  const _console$f = createConsole("SensorDataManager", {
    log: true
  });
  var _scalars = /*#__PURE__*/new WeakMap();
  var _SensorDataManager_brand = /*#__PURE__*/new WeakSet();
  class SensorDataManager {
    constructor() {
      _classPrivateMethodInitSpec(this, _SensorDataManager_brand);
      // MANAGERS
      _defineProperty(this, "pressureSensorDataManager", new PressureSensorDataManager());
      _defineProperty(this, "motionSensorDataManager", new MotionSensorDataManager());
      _defineProperty(this, "barometerSensorDataManager", new BarometerSensorDataManager());
      _classPrivateFieldInitSpec(this, _scalars, new Map());
      _defineProperty(this, "eventDispatcher", void 0);
      _defineProperty(this, "sendMessage", void 0);
    }
    static get MessageTypes() {
      return _assertClassBrand(SensorDataManager, this, _MessageTypes$7)._;
    }
    get messageTypes() {
      return SensorDataManager.MessageTypes;
    }
    static get Types() {
      return _assertClassBrand(SensorDataManager, this, _Types$2)._;
    }
    static get ContinuousTypes() {
      return _assertClassBrand(SensorDataManager, this, _ContinuousTypes)._;
    }
    get types() {
      return SensorDataManager.Types;
    }
    static AssertValidSensorType(sensorType) {
      _console$f.assertTypeWithError(sensorType, "string");
      _console$f.assertWithError(_assertClassBrand(SensorDataManager, this, _Types$2)._.includes(sensorType), `invalid sensorType "${sensorType}"`);
    }
    static AssertValidSensorTypeEnum(sensorTypeEnum) {
      _console$f.assertTypeWithError(sensorTypeEnum, "number");
      _console$f.assertWithError(sensorTypeEnum in _assertClassBrand(SensorDataManager, this, _Types$2)._, `invalid sensorTypeEnum ${sensorTypeEnum}`);
    }

    // EVENT DISPATCHER

    static get EventTypes() {
      return _assertClassBrand(SensorDataManager, this, _EventTypes$7)._;
    }
    get eventTypes() {
      return _EventTypes$7._;
    }
    waitForEvent(eventType) {
      return this.eventDispatcher.waitForEvent(eventType);
    }

    // DATA

    parseScalars(dataView) {
      for (let byteOffset = 0; byteOffset < dataView.byteLength; byteOffset += 5) {
        const sensorTypeIndex = dataView.getUint8(byteOffset);
        const sensorType = SensorDataManager.Types[sensorTypeIndex];
        if (!sensorType) {
          _console$f.warn(`unknown sensorType index ${sensorTypeIndex}`);
          continue;
        }
        const sensorScalar = dataView.getFloat32(byteOffset + 1, true);
        _console$f.log({
          sensorType,
          sensorScalar
        });
        _classPrivateFieldGet2(_scalars, this).set(sensorType, sensorScalar);
      }
    }

    // MESSAGE

    parseMessage(messageType, dataView) {
      _console$f.log({
        messageType
      });
      switch (messageType) {
        case "getSensorScalars":
          this.parseScalars(dataView);
          break;
        case "getPressurePositions":
          this.pressureSensorDataManager.parsePositions(dataView);
          break;
        case "sensorData":
          _assertClassBrand(_SensorDataManager_brand, this, _parseData).call(this, dataView);
          break;
        default:
          throw Error(`uncaught messageType ${messageType}`);
      }
    }
  }
  _SensorDataManager = SensorDataManager;
  function _dispatchEvent$7(event) {
    this.eventDispatcher.dispatchEvent(event);
  }
  function _parseData(dataView) {
    _console$f.log("sensorData", Array.from(new Uint8Array(dataView.buffer)));
    let byteOffset = 0;
    const timestamp = parseTimestamp(dataView, byteOffset);
    byteOffset += 2;
    const _dataView = new DataView(dataView.buffer, byteOffset);
    parseMessage(_dataView, _SensorDataManager.Types, _assertClassBrand(_SensorDataManager_brand, this, _parseDataCallback).bind(this), {
      timestamp
    });
  }
  function _parseDataCallback(sensorType, dataView, _ref) {
    let {
      timestamp
    } = _ref;
    const scalar = _classPrivateFieldGet2(_scalars, this).get(sensorType);
    let sensorData = null;
    switch (sensorType) {
      case "pressure":
        sensorData = this.pressureSensorDataManager.parseData(dataView, scalar);
        break;
      case "acceleration":
      case "gravity":
      case "linearAcceleration":
      case "gyroscope":
      case "magnetometer":
        sensorData = this.motionSensorDataManager.parseVector3(dataView, scalar);
        break;
      case "gameRotation":
      case "rotation":
        sensorData = this.motionSensorDataManager.parseQuaternion(dataView, scalar);
        break;
      case "orientation":
        sensorData = this.motionSensorDataManager.parseEuler(dataView, scalar);
        break;
      case "stepCounter":
        sensorData = this.motionSensorDataManager.parseStepCounter(dataView);
        break;
      case "stepDetector":
        sensorData = {};
        break;
      case "activity":
        sensorData = this.motionSensorDataManager.parseActivity(dataView);
        break;
      case "deviceOrientation":
        sensorData = this.motionSensorDataManager.parseDeviceOrientation(dataView);
        break;
      case "barometer":
        sensorData = this.barometerSensorDataManager.parseData(dataView, scalar);
        break;
      default:
        _console$f.error(`uncaught sensorType "${sensorType}"`);
    }
    _console$f.assertWithError(sensorData != null, `no sensorData defined for sensorType "${sensorType}"`);
    _console$f.log({
      sensorType,
      sensorData,
      sensorData
    });
    _assertClassBrand(_SensorDataManager_brand, this, _dispatchEvent$7).call(this, {
      type: sensorType,
      message: {
        [sensorType]: sensorData,
        timestamp
      }
    });
    _assertClassBrand(_SensorDataManager_brand, this, _dispatchEvent$7).call(this, {
      type: "sensorData",
      message: {
        [sensorType]: sensorData,
        sensorType,
        timestamp
      }
    });
  }
  // MESSAGE TYPES
  var _MessageTypes$7 = {
    _: ["getPressurePositions", "getSensorScalars", "sensorData"]
  };
  // TYPES
  var _Types$2 = {
    _: [...PressureSensorDataManager.Types, ...MotionSensorDataManager.Types, ...BarometerSensorDataManager.Types]
  };
  var _ContinuousTypes = {
    _: [...PressureSensorDataManager.ContinuousTypes, ...MotionSensorDataManager.ContinuousTypes, ...BarometerSensorDataManager.ContinuousTypes]
  };
  var _EventTypes$7 = {
    _: [..._assertClassBrand(_SensorDataManager, _SensorDataManager, _MessageTypes$7)._, ..._assertClassBrand(_SensorDataManager, _SensorDataManager, _Types$2)._]
  };

  var _SensorConfigurationManager;
  const _console$e = createConsole("SensorConfigurationManager", {
    log: true
  });
  var _SensorConfigurationManager_brand = /*#__PURE__*/new WeakSet();
  var _availableSensorTypes = /*#__PURE__*/new WeakMap();
  var _configuration = /*#__PURE__*/new WeakMap();
  class SensorConfigurationManager {
    constructor() {
      _classPrivateMethodInitSpec(this, _SensorConfigurationManager_brand);
      _defineProperty(this, "eventDispatcher", void 0);
      _classPrivateFieldInitSpec(this, _availableSensorTypes, void 0);
      _classPrivateFieldInitSpec(this, _configuration, void 0);
      _defineProperty(this, "sendMessage", void 0);
    }
    static get MessageTypes() {
      return _assertClassBrand(SensorConfigurationManager, this, _MessageTypes$6)._;
    }
    get messageTypes() {
      return SensorConfigurationManager.MessageTypes;
    }

    // EVENT DISPATCHER

    static get EventTypes() {
      return _assertClassBrand(SensorConfigurationManager, this, _EventTypes$6)._;
    }
    get eventTypes() {
      return _EventTypes$6._;
    }
    waitForEvent(eventType) {
      return this.eventDispatcher.waitForEvent(eventType);
    }

    // SENSOR TYPES

    get configuration() {
      return _classPrivateFieldGet2(_configuration, this);
    }
    async setConfiguration(newSensorConfiguration) {
      _console$e.log({
        newSensorConfiguration
      });
      if (_assertClassBrand(_SensorConfigurationManager_brand, this, _isRedundant).call(this, newSensorConfiguration)) {
        _console$e.log("redundant sensor configuration");
        return;
      }
      const setSensorConfigurationData = _assertClassBrand(_SensorConfigurationManager_brand, this, _createData$1).call(this, newSensorConfiguration);
      _console$e.log({
        setSensorConfigurationData
      });
      const promise = this.waitForEvent("getSensorConfiguration");
      this.sendMessage([{
        type: "setSensorConfiguration",
        data: setSensorConfigurationData.buffer
      }]);
      await promise;
    }
    static get MaxSensorRate() {
      return _assertClassBrand(SensorConfigurationManager, this, _MaxSensorRate)._;
    }
    get maxSensorRate() {
      return SensorConfigurationManager.MaxSensorRate;
    }
    static get SensorRateStep() {
      return _assertClassBrand(SensorConfigurationManager, this, _SensorRateStep)._;
    }
    get sensorRateStep() {
      return SensorConfigurationManager.SensorRateStep;
    }
    static get ZeroSensorConfiguration() {
      return _assertClassBrand(SensorConfigurationManager, this, _ZeroSensorConfiguration)._;
    }
    get zeroSensorConfiguration() {
      const zeroSensorConfiguration = {};
      _classPrivateGetter(_SensorConfigurationManager_brand, this, _get_sensorTypes).forEach(sensorType => {
        zeroSensorConfiguration[sensorType] = 0;
      });
      return zeroSensorConfiguration;
    }
    async clearSensorConfiguration() {
      return this.setConfiguration(this.zeroSensorConfiguration);
    }

    // MESSAGE

    parseMessage(messageType, dataView) {
      _console$e.log({
        messageType
      });
      switch (messageType) {
        case "getSensorConfiguration":
        case "setSensorConfiguration":
          const newSensorConfiguration = _assertClassBrand(_SensorConfigurationManager_brand, this, _parse).call(this, dataView);
          _assertClassBrand(_SensorConfigurationManager_brand, this, _updateConfiguration).call(this, newSensorConfiguration);
          break;
        default:
          throw Error(`uncaught messageType ${messageType}`);
      }
    }
  }
  _SensorConfigurationManager = SensorConfigurationManager;
  function _dispatchEvent$6(event) {
    this.eventDispatcher.dispatchEvent(event);
  }
  function _get_SensorTypes(_this) {
    return SensorDataManager.Types;
  }
  function _get_sensorTypes(_this2) {
    return _get_SensorTypes();
  }
  function _assertAvailableSensorType(sensorType) {
    var _classPrivateFieldGet2$1;
    _console$e.assertWithError(_classPrivateFieldGet2(_availableSensorTypes, this), "must get initial sensorConfiguration");
    const isSensorTypeAvailable = (_classPrivateFieldGet2$1 = _classPrivateFieldGet2(_availableSensorTypes, this)) === null || _classPrivateFieldGet2$1 === void 0 ? void 0 : _classPrivateFieldGet2$1.includes(sensorType);
    _console$e.assert(isSensorTypeAvailable, `unavailable sensor type "${sensorType}"`);
    return isSensorTypeAvailable;
  }
  function _updateConfiguration(updatedConfiguration) {
    _classPrivateFieldSet2(_configuration, this, updatedConfiguration);
    _console$e.log({
      updatedConfiguration: _classPrivateFieldGet2(_configuration, this)
    });
    _assertClassBrand(_SensorConfigurationManager_brand, this, _dispatchEvent$6).call(this, {
      type: "getSensorConfiguration",
      message: {
        sensorConfiguration: this.configuration
      }
    });
  }
  function _isRedundant(sensorConfiguration) {
    let sensorTypes = Object.keys(sensorConfiguration);
    return sensorTypes.every(sensorType => {
      return this.configuration[sensorType] == sensorConfiguration[sensorType];
    });
  }
  function _parse(dataView) {
    const parsedSensorConfiguration = {};
    for (let byteOffset = 0; byteOffset < dataView.byteLength; byteOffset += 3) {
      const sensorTypeIndex = dataView.getUint8(byteOffset);
      const sensorType = SensorDataManager.Types[sensorTypeIndex];
      if (!sensorType) {
        _console$e.warn(`unknown sensorType index ${sensorTypeIndex}`);
        continue;
      }
      const sensorRate = dataView.getUint16(byteOffset + 1, true);
      _console$e.log({
        sensorType,
        sensorRate
      });
      parsedSensorConfiguration[sensorType] = sensorRate;
    }
    _console$e.log({
      parsedSensorConfiguration
    });
    _classPrivateFieldSet2(_availableSensorTypes, this, Object.keys(parsedSensorConfiguration));
    return parsedSensorConfiguration;
  }
  function _AssertValidSensorRate(sensorRate) {
    _console$e.assertTypeWithError(sensorRate, "number");
    _console$e.assertWithError(sensorRate >= 0, `sensorRate must be 0 or greater (got ${sensorRate})`);
    _console$e.assertWithError(sensorRate < this.MaxSensorRate, `sensorRate must be 0 or greater (got ${sensorRate})`);
    _console$e.assertWithError(sensorRate % this.SensorRateStep == 0, `sensorRate must be multiple of ${this.SensorRateStep}`);
  }
  function _assertValidSensorRate(sensorRate) {
    _AssertValidSensorRate.call(_SensorConfigurationManager, sensorRate);
  }
  function _createData$1(sensorConfiguration) {
    let sensorTypes = Object.keys(sensorConfiguration);
    sensorTypes = sensorTypes.filter(sensorType => _assertClassBrand(_SensorConfigurationManager_brand, this, _assertAvailableSensorType).call(this, sensorType));
    const dataView = new DataView(new ArrayBuffer(sensorTypes.length * 3));
    sensorTypes.forEach((sensorType, index) => {
      SensorDataManager.AssertValidSensorType(sensorType);
      const sensorTypeEnum = SensorDataManager.Types.indexOf(sensorType);
      dataView.setUint8(index * 3, sensorTypeEnum);
      const sensorRate = sensorConfiguration[sensorType];
      _assertClassBrand(_SensorConfigurationManager_brand, this, _assertValidSensorRate).call(this, sensorRate);
      dataView.setUint16(index * 3 + 1, sensorConfiguration[sensorType], true);
    });
    _console$e.log({
      sensorConfigurationData: dataView
    });
    return dataView;
  }
  // MESSAGE TYPES
  var _MessageTypes$6 = {
    _: ["getSensorConfiguration", "setSensorConfiguration"]
  };
  var _EventTypes$6 = {
    _: [..._assertClassBrand(_SensorConfigurationManager, _SensorConfigurationManager, _MessageTypes$6)._]
  };
  var _MaxSensorRate = {
    _: 2 ** 16 - 1
  };
  var _SensorRateStep = {
    _: 5
  };
  // ZERO
  var _ZeroSensorConfiguration = {
    _: {}
  };
  _classPrivateGetter(_SensorConfigurationManager, _SensorConfigurationManager, _get_SensorTypes).forEach(sensorType => {
    _assertClassBrand(_SensorConfigurationManager, _SensorConfigurationManager, _ZeroSensorConfiguration)._[sensorType] = 0;
  });

  var _TfliteManager;
  const _console$d = createConsole("TfliteManager", {
    log: true
  });
  var _TfliteManager_brand = /*#__PURE__*/new WeakSet();
  var _name$1 = /*#__PURE__*/new WeakMap();
  var _task = /*#__PURE__*/new WeakMap();
  var _sampleRate = /*#__PURE__*/new WeakMap();
  var _sensorTypes = /*#__PURE__*/new WeakMap();
  var _isReady = /*#__PURE__*/new WeakMap();
  var _captureDelay = /*#__PURE__*/new WeakMap();
  var _threshold = /*#__PURE__*/new WeakMap();
  var _inferencingEnabled = /*#__PURE__*/new WeakMap();
  let TfliteManager$1 = class TfliteManager {
    constructor() {
      _classPrivateMethodInitSpec(this, _TfliteManager_brand);
      _defineProperty(this, "eventDispatcher", void 0);
      // PROPERTIES

      _classPrivateFieldInitSpec(this, _name$1, void 0);
      _classPrivateFieldInitSpec(this, _task, void 0);
      _classPrivateFieldInitSpec(this, _sampleRate, void 0);
      _classPrivateFieldInitSpec(this, _sensorTypes, []);
      _classPrivateFieldInitSpec(this, _isReady, void 0);
      _classPrivateFieldInitSpec(this, _captureDelay, void 0);
      _classPrivateFieldInitSpec(this, _threshold, void 0);
      _classPrivateFieldInitSpec(this, _inferencingEnabled, void 0);
      _defineProperty(this, "sendMessage", void 0);
    }
    static get MessageTypes() {
      return _assertClassBrand(TfliteManager, this, _MessageTypes$5)._;
    }
    get messageTypes() {
      return TfliteManager.MessageTypes;
    }

    // TASK

    static get Tasks() {
      return _assertClassBrand(TfliteManager, this, _Tasks)._;
    }
    get tasks() {
      return TfliteManager.Tasks;
    }
    static get EventTypes() {
      return _assertClassBrand(TfliteManager, this, _EventTypes$5)._;
    }
    get eventTypes() {
      return _EventTypes$5._;
    }
    addEventListener(type, listener, options) {
      this.eventDispatcher.addEventListener(type, listener, options);
    }
    removeEventListener(type, listener) {
      return this.eventDispatcher.removeEventListener(type, listener);
    }
    waitForEvent(eventType) {
      return this.eventDispatcher.waitForEvent(eventType);
    }
    get name() {
      return _classPrivateFieldGet2(_name$1, this);
    }
    async setName(newName, sendImmediately) {
      _console$d.assertTypeWithError(newName, "string");
      if (this.name == newName) {
        _console$d.log(`redundant name assignment ${newName}`);
        return;
      }
      const promise = this.waitForEvent("getTfliteName");
      const setNameData = textEncoder.encode(newName);
      this.sendMessage([{
        type: "setTfliteName",
        data: setNameData.buffer
      }], sendImmediately);
      await promise;
    }
    get task() {
      return _classPrivateFieldGet2(_task, this);
    }
    async setTask(newTask, sendImmediately) {
      _assertClassBrand(_TfliteManager_brand, this, _assertValidTask).call(this, newTask);
      if (this.task == newTask) {
        _console$d.log(`redundant task assignment ${newTask}`);
        return;
      }
      const promise = this.waitForEvent("getTfliteTask");
      const taskEnum = this.tasks.indexOf(newTask);
      this.sendMessage([{
        type: "setTfliteTask",
        data: Uint8Array.from([taskEnum]).buffer
      }], sendImmediately);
      await promise;
    }
    get sampleRate() {
      return _classPrivateFieldGet2(_sampleRate, this);
    }
    async setSampleRate(newSampleRate, sendImmediately) {
      _console$d.assertTypeWithError(newSampleRate, "number");
      newSampleRate -= newSampleRate % SensorConfigurationManager.SensorRateStep;
      _console$d.assertWithError(newSampleRate >= SensorConfigurationManager.SensorRateStep, `sampleRate must be multiple of ${SensorConfigurationManager.SensorRateStep} greater than 0 (got ${newSampleRate})`);
      if (_classPrivateFieldGet2(_sampleRate, this) == newSampleRate) {
        _console$d.log(`redundant sampleRate assignment ${newSampleRate}`);
        return;
      }
      const promise = this.waitForEvent("getTfliteSampleRate");
      const dataView = new DataView(new ArrayBuffer(2));
      dataView.setUint16(0, newSampleRate, true);
      this.sendMessage([{
        type: "setTfliteSampleRate",
        data: dataView.buffer
      }], sendImmediately);
      await promise;
    }
    static get SensorTypes() {
      return _assertClassBrand(TfliteManager, this, _SensorTypes)._;
    }
    static AssertValidSensorType(sensorType) {
      SensorDataManager.AssertValidSensorType(sensorType);
      _console$d.assertWithError(_assertClassBrand(TfliteManager, this, _SensorTypes)._.includes(sensorType), `invalid tflite sensorType "${sensorType}"`);
    }
    get sensorTypes() {
      return _classPrivateFieldGet2(_sensorTypes, this).slice();
    }
    async setSensorTypes(newSensorTypes, sendImmediately) {
      newSensorTypes.forEach(sensorType => {
        TfliteManager.AssertValidSensorType(sensorType);
      });
      const promise = this.waitForEvent("getTfliteSensorTypes");
      newSensorTypes = arrayWithoutDuplicates(newSensorTypes);
      const newSensorTypeEnums = newSensorTypes.map(sensorType => SensorDataManager.Types.indexOf(sensorType)).sort();
      _console$d.log(newSensorTypes, newSensorTypeEnums);
      this.sendMessage([{
        type: "setTfliteSensorTypes",
        data: Uint8Array.from(newSensorTypeEnums).buffer
      }], sendImmediately);
      await promise;
    }
    get isReady() {
      return _classPrivateFieldGet2(_isReady, this);
    }
    get captureDelay() {
      return _classPrivateFieldGet2(_captureDelay, this);
    }
    async setCaptureDelay(newCaptureDelay, sendImmediately) {
      _console$d.assertTypeWithError(newCaptureDelay, "number");
      if (_classPrivateFieldGet2(_captureDelay, this) == newCaptureDelay) {
        _console$d.log(`redundant captureDelay assignment ${newCaptureDelay}`);
        return;
      }
      const promise = this.waitForEvent("getTfliteCaptureDelay");
      const dataView = new DataView(new ArrayBuffer(2));
      dataView.setUint16(0, newCaptureDelay, true);
      this.sendMessage([{
        type: "setTfliteCaptureDelay",
        data: dataView.buffer
      }], sendImmediately);
      await promise;
    }
    get threshold() {
      return _classPrivateFieldGet2(_threshold, this);
    }
    async setThreshold(newThreshold, sendImmediately) {
      _console$d.assertTypeWithError(newThreshold, "number");
      _console$d.assertWithError(newThreshold >= 0, `threshold must be positive (got ${newThreshold})`);
      if (_classPrivateFieldGet2(_threshold, this) == newThreshold) {
        _console$d.log(`redundant threshold assignment ${newThreshold}`);
        return;
      }
      const promise = this.waitForEvent("getTfliteThreshold");
      const dataView = new DataView(new ArrayBuffer(4));
      dataView.setFloat32(0, newThreshold, true);
      this.sendMessage([{
        type: "setTfliteThreshold",
        data: dataView.buffer
      }], sendImmediately);
      await promise;
    }
    get inferencingEnabled() {
      return _classPrivateFieldGet2(_inferencingEnabled, this);
    }
    async setInferencingEnabled(newInferencingEnabled, sendImmediately) {
      _console$d.assertTypeWithError(newInferencingEnabled, "boolean");
      if (!newInferencingEnabled && !this.isReady) {
        return;
      }
      _assertClassBrand(_TfliteManager_brand, this, _assertIsReady).call(this);
      if (_classPrivateFieldGet2(_inferencingEnabled, this) == newInferencingEnabled) {
        _console$d.log(`redundant inferencingEnabled assignment ${newInferencingEnabled}`);
        return;
      }
      const promise = this.waitForEvent("getTfliteInferencingEnabled");
      this.sendMessage([{
        type: "setTfliteInferencingEnabled",
        data: Uint8Array.from([newInferencingEnabled]).buffer
      }], sendImmediately);
      await promise;
    }
    async toggleInferencingEnabled() {
      return this.setInferencingEnabled(!this.inferencingEnabled);
    }
    async enableInferencing() {
      if (this.inferencingEnabled) {
        return;
      }
      this.setInferencingEnabled(true);
    }
    async disableInferencing() {
      if (!this.inferencingEnabled) {
        return;
      }
      this.setInferencingEnabled(false);
    }
    parseMessage(messageType, dataView) {
      _console$d.log({
        messageType
      });
      switch (messageType) {
        case "getTfliteName":
        case "setTfliteName":
          _assertClassBrand(_TfliteManager_brand, this, _parseName).call(this, dataView);
          break;
        case "getTfliteTask":
        case "setTfliteTask":
          _assertClassBrand(_TfliteManager_brand, this, _parseTask).call(this, dataView);
          break;
        case "getTfliteSampleRate":
        case "setTfliteSampleRate":
          _assertClassBrand(_TfliteManager_brand, this, _parseSampleRate).call(this, dataView);
          break;
        case "getTfliteSensorTypes":
        case "setTfliteSensorTypes":
          _assertClassBrand(_TfliteManager_brand, this, _parseSensorTypes).call(this, dataView);
          break;
        case "tfliteModelIsReady":
          _assertClassBrand(_TfliteManager_brand, this, _parseIsReady).call(this, dataView);
          break;
        case "getTfliteCaptureDelay":
        case "setTfliteCaptureDelay":
          _assertClassBrand(_TfliteManager_brand, this, _parseCaptureDelay).call(this, dataView);
          break;
        case "getTfliteThreshold":
        case "setTfliteThreshold":
          _assertClassBrand(_TfliteManager_brand, this, _parseThreshold).call(this, dataView);
          break;
        case "getTfliteInferencingEnabled":
        case "setTfliteInferencingEnabled":
          _assertClassBrand(_TfliteManager_brand, this, _parseInferencingEnabled).call(this, dataView);
          break;
        case "tfliteModelInference":
          _assertClassBrand(_TfliteManager_brand, this, _parseInference).call(this, dataView);
          break;
        default:
          throw Error(`uncaught messageType ${messageType}`);
      }
    }
  };
  _TfliteManager = TfliteManager$1;
  function _assertValidTask(task) {
    _console$d.assertEnumWithError(task, this.tasks);
  }
  function _assertValidTaskEnum(taskEnum) {
    _console$d.assertWithError(this.tasks[taskEnum], `invalid taskEnum ${taskEnum}`);
  }
  function _dispatchEvent$5(event) {
    this.eventDispatcher.dispatchEvent(event);
  }
  function _parseName(dataView) {
    _console$d.log("parseName", dataView);
    const name = textDecoder.decode(dataView);
    _assertClassBrand(_TfliteManager_brand, this, _updateName).call(this, name);
  }
  function _updateName(name) {
    _console$d.log({
      name
    });
    _classPrivateFieldSet2(_name$1, this, name);
    _assertClassBrand(_TfliteManager_brand, this, _dispatchEvent$5).call(this, {
      type: "getTfliteName",
      message: {
        tfliteModelName: name
      }
    });
  }
  function _parseTask(dataView) {
    _console$d.log("parseTask", dataView);
    const taskEnum = dataView.getUint8(0);
    _assertClassBrand(_TfliteManager_brand, this, _assertValidTaskEnum).call(this, taskEnum);
    const task = this.tasks[taskEnum];
    _assertClassBrand(_TfliteManager_brand, this, _updateTask).call(this, task);
  }
  function _updateTask(task) {
    _console$d.log({
      task
    });
    _classPrivateFieldSet2(_task, this, task);
    _assertClassBrand(_TfliteManager_brand, this, _dispatchEvent$5).call(this, {
      type: "getTfliteTask",
      message: {
        tfliteModelTask: task
      }
    });
  }
  function _parseSampleRate(dataView) {
    _console$d.log("parseSampleRate", dataView);
    const sampleRate = dataView.getUint16(0, true);
    _assertClassBrand(_TfliteManager_brand, this, _updateSampleRate).call(this, sampleRate);
  }
  function _updateSampleRate(sampleRate) {
    _console$d.log({
      sampleRate
    });
    _classPrivateFieldSet2(_sampleRate, this, sampleRate);
    _assertClassBrand(_TfliteManager_brand, this, _dispatchEvent$5).call(this, {
      type: "getTfliteSampleRate",
      message: {
        tfliteModelSampleRate: sampleRate
      }
    });
  }
  function _parseSensorTypes(dataView) {
    _console$d.log("parseSensorTypes", dataView);
    const sensorTypes = [];
    for (let index = 0; index < dataView.byteLength; index++) {
      const sensorTypeEnum = dataView.getUint8(index);
      const sensorType = SensorDataManager.Types[sensorTypeEnum];
      if (sensorType) {
        sensorTypes.push(sensorType);
      } else {
        _console$d.error(`invalid sensorTypeEnum ${sensorTypeEnum}`);
      }
    }
    _assertClassBrand(_TfliteManager_brand, this, _updateSensorTypes).call(this, sensorTypes);
  }
  function _updateSensorTypes(sensorTypes) {
    _console$d.log({
      sensorTypes
    });
    _classPrivateFieldSet2(_sensorTypes, this, sensorTypes);
    _assertClassBrand(_TfliteManager_brand, this, _dispatchEvent$5).call(this, {
      type: "getTfliteSensorTypes",
      message: {
        tfliteModelSensorTypes: sensorTypes
      }
    });
  }
  function _parseIsReady(dataView) {
    _console$d.log("parseIsReady", dataView);
    const isReady = Boolean(dataView.getUint8(0));
    _assertClassBrand(_TfliteManager_brand, this, _updateIsReady).call(this, isReady);
  }
  function _updateIsReady(isReady) {
    _console$d.log({
      isReady
    });
    _classPrivateFieldSet2(_isReady, this, isReady);
    _assertClassBrand(_TfliteManager_brand, this, _dispatchEvent$5).call(this, {
      type: "tfliteModelIsReady",
      message: {
        tfliteModelIsReady: isReady
      }
    });
  }
  function _assertIsReady() {
    _console$d.assertWithError(this.isReady, `tflite is not ready`);
  }
  function _parseCaptureDelay(dataView) {
    _console$d.log("parseCaptureDelay", dataView);
    const captureDelay = dataView.getUint16(0, true);
    _assertClassBrand(_TfliteManager_brand, this, _updateCaptueDelay).call(this, captureDelay);
  }
  function _updateCaptueDelay(captureDelay) {
    _console$d.log({
      captureDelay
    });
    _classPrivateFieldSet2(_captureDelay, this, captureDelay);
    _assertClassBrand(_TfliteManager_brand, this, _dispatchEvent$5).call(this, {
      type: "getTfliteCaptureDelay",
      message: {
        tfliteCaptureDelay: captureDelay
      }
    });
  }
  function _parseThreshold(dataView) {
    _console$d.log("parseThreshold", dataView);
    const threshold = dataView.getFloat32(0, true);
    _assertClassBrand(_TfliteManager_brand, this, _updateThreshold).call(this, threshold);
  }
  function _updateThreshold(threshold) {
    _console$d.log({
      threshold
    });
    _classPrivateFieldSet2(_threshold, this, threshold);
    _assertClassBrand(_TfliteManager_brand, this, _dispatchEvent$5).call(this, {
      type: "getTfliteThreshold",
      message: {
        tfliteThreshold: threshold
      }
    });
  }
  function _parseInferencingEnabled(dataView) {
    _console$d.log("parseInferencingEnabled", dataView);
    const inferencingEnabled = Boolean(dataView.getUint8(0));
    _assertClassBrand(_TfliteManager_brand, this, _updateInferencingEnabled).call(this, inferencingEnabled);
  }
  function _updateInferencingEnabled(inferencingEnabled) {
    _console$d.log({
      inferencingEnabled
    });
    _classPrivateFieldSet2(_inferencingEnabled, this, inferencingEnabled);
    _assertClassBrand(_TfliteManager_brand, this, _dispatchEvent$5).call(this, {
      type: "getTfliteInferencingEnabled",
      message: {
        tfliteInferencingEnabled: inferencingEnabled
      }
    });
  }
  function _parseInference(dataView) {
    _console$d.log("parseInference", dataView);
    const timestamp = parseTimestamp(dataView, 0);
    _console$d.log({
      timestamp
    });
    const values = [];
    for (let index = 0, byteOffset = 2; byteOffset < dataView.byteLength; index++, byteOffset += 4) {
      const value = dataView.getFloat32(byteOffset, true);
      values.push(value);
    }
    _console$d.log("values", values);
    const inference = {
      timestamp,
      values
    };
    _assertClassBrand(_TfliteManager_brand, this, _dispatchEvent$5).call(this, {
      type: "tfliteModelInference",
      message: {
        tfliteModelInference: inference
      }
    });
  }
  var _MessageTypes$5 = {
    _: ["getTfliteName", "setTfliteName", "getTfliteTask", "setTfliteTask", "getTfliteSampleRate", "setTfliteSampleRate", "getTfliteSensorTypes", "setTfliteSensorTypes", "tfliteModelIsReady", "getTfliteCaptureDelay", "setTfliteCaptureDelay", "getTfliteThreshold", "setTfliteThreshold", "getTfliteInferencingEnabled", "setTfliteInferencingEnabled", "tfliteModelInference"]
  };
  var _Tasks = {
    _: ["classification", "regression"]
  };
  // EVENT DISPATCHER
  var _EventTypes$5 = {
    _: [..._assertClassBrand(_TfliteManager, _TfliteManager, _MessageTypes$5)._]
  };
  var _SensorTypes = {
    _: ["pressure", "linearAcceleration", "gyroscope", "magnetometer"]
  };

  var _DeviceInformationManager;
  const _console$c = createConsole("DeviceInformationManager", {
    log: true
  });
  var _DeviceInformationManager_brand = /*#__PURE__*/new WeakSet();
  class DeviceInformationManager {
    constructor() {
      _classPrivateMethodInitSpec(this, _DeviceInformationManager_brand);
      _defineProperty(this, "eventDispatcher", void 0);
      // PROPERTIES
      _defineProperty(this, "information", {
        manufacturerName: null,
        modelNumber: null,
        softwareRevision: null,
        hardwareRevision: null,
        firmwareRevision: null,
        pnpId: null
      });
    }
    static get MessageTypes() {
      return _assertClassBrand(DeviceInformationManager, this, _MessageTypes$4)._;
    }
    get messageTypes() {
      return DeviceInformationManager.MessageTypes;
    }

    // EVENT DISPATCHER

    static get EventTypes() {
      return _assertClassBrand(DeviceInformationManager, this, _EventTypes$4)._;
    }
    get eventTypes() {
      return _EventTypes$4._;
    }
    clear() {
      for (const key in this.information) {
        this.information[key] = null;
      }
    }
    // MESSAGE

    parseMessage(messageType, dataView) {
      _console$c.log({
        messageType
      });
      switch (messageType) {
        case "manufacturerName":
          const manufacturerName = textDecoder.decode(dataView);
          _console$c.log({
            manufacturerName
          });
          _assertClassBrand(_DeviceInformationManager_brand, this, _update).call(this, {
            manufacturerName
          });
          break;
        case "modelNumber":
          const modelNumber = textDecoder.decode(dataView);
          _console$c.log({
            modelNumber
          });
          _assertClassBrand(_DeviceInformationManager_brand, this, _update).call(this, {
            modelNumber
          });
          break;
        case "softwareRevision":
          const softwareRevision = textDecoder.decode(dataView);
          _console$c.log({
            softwareRevision
          });
          _assertClassBrand(_DeviceInformationManager_brand, this, _update).call(this, {
            softwareRevision
          });
          break;
        case "hardwareRevision":
          const hardwareRevision = textDecoder.decode(dataView);
          _console$c.log({
            hardwareRevision
          });
          _assertClassBrand(_DeviceInformationManager_brand, this, _update).call(this, {
            hardwareRevision
          });
          break;
        case "firmwareRevision":
          const firmwareRevision = textDecoder.decode(dataView);
          _console$c.log({
            firmwareRevision
          });
          _assertClassBrand(_DeviceInformationManager_brand, this, _update).call(this, {
            firmwareRevision
          });
          break;
        case "pnpId":
          const pnpId = {
            source: dataView.getUint8(0) === 1 ? "Bluetooth" : "USB",
            productId: dataView.getUint16(3, true),
            productVersion: dataView.getUint16(5, true)
          };
          if (pnpId.source == "Bluetooth") {
            pnpId.vendorId = dataView.getUint16(1, true);
          }
          _console$c.log({
            pnpId
          });
          _assertClassBrand(_DeviceInformationManager_brand, this, _update).call(this, {
            pnpId
          });
          break;
        case "serialNumber":
          const serialNumber = textDecoder.decode(dataView);
          _console$c.log({
            serialNumber
          });
          // will only be used for node.js
          break;
        default:
          throw Error(`uncaught messageType ${messageType}`);
      }
    }
  }
  _DeviceInformationManager = DeviceInformationManager;
  function _dispatchEvent$4(event) {
    this.eventDispatcher.dispatchEvent(event);
  }
  function _get_isComplete(_this) {
    return Object.values(_this.information).every(value => value != null);
  }
  function _update(partialDeviceInformation) {
    _console$c.log({
      partialDeviceInformation
    });
    for (const deviceInformationName in partialDeviceInformation) {
      _assertClassBrand(_DeviceInformationManager_brand, this, _dispatchEvent$4).call(this, {
        type: deviceInformationName,
        message: {
          [deviceInformationName]: partialDeviceInformation[deviceInformationName]
        }
      });
    }
    Object.assign(this.information, partialDeviceInformation);
    _console$c.log({
      deviceInformation: this.information
    });
    if (_classPrivateGetter(_DeviceInformationManager_brand, this, _get_isComplete)) {
      _console$c.log("completed deviceInformation");
      _assertClassBrand(_DeviceInformationManager_brand, this, _dispatchEvent$4).call(this, {
        type: "deviceInformation",
        message: {
          deviceInformation: this.information
        }
      });
    }
  }
  // MESSAGE TYPES
  var _MessageTypes$4 = {
    _: ["manufacturerName", "modelNumber", "softwareRevision", "hardwareRevision", "firmwareRevision", "pnpId", "serialNumber"]
  };
  var _EventTypes$4 = {
    _: [..._assertClassBrand(_DeviceInformationManager, _DeviceInformationManager, _MessageTypes$4)._, "deviceInformation"]
  };

  var _InformationManager;
  const _console$b = createConsole("InformationManager", {
    log: true
  });
  var _InformationManager_brand = /*#__PURE__*/new WeakSet();
  var _isCharging = /*#__PURE__*/new WeakMap();
  var _batteryCurrent = /*#__PURE__*/new WeakMap();
  var _id = /*#__PURE__*/new WeakMap();
  var _name = /*#__PURE__*/new WeakMap();
  var _type = /*#__PURE__*/new WeakMap();
  var _mtu$2 = /*#__PURE__*/new WeakMap();
  var _isCurrentTimeSet = /*#__PURE__*/new WeakMap();
  class InformationManager {
    constructor() {
      _classPrivateMethodInitSpec(this, _InformationManager_brand);
      _defineProperty(this, "eventDispatcher", void 0);
      // PROPERTIES

      _classPrivateFieldInitSpec(this, _isCharging, false);
      _classPrivateFieldInitSpec(this, _batteryCurrent, void 0);
      _classPrivateFieldInitSpec(this, _id, void 0);
      _classPrivateFieldInitSpec(this, _name, "");
      _classPrivateFieldInitSpec(this, _type, void 0);
      _classPrivateFieldInitSpec(this, _mtu$2, 0);
      _classPrivateFieldInitSpec(this, _isCurrentTimeSet, false);
      _defineProperty(this, "sendMessage", void 0);
    }
    static get MessageTypes() {
      return _assertClassBrand(InformationManager, this, _MessageTypes$3)._;
    }
    get messageTypes() {
      return InformationManager.MessageTypes;
    }

    // EVENT DISPATCHER

    static get EventTypes() {
      return _assertClassBrand(InformationManager, this, _EventTypes$3)._;
    }
    get eventTypes() {
      return _EventTypes$3._;
    }
    waitForEvent(eventType) {
      return this.eventDispatcher.waitForEvent(eventType);
    }
    get isCharging() {
      return _classPrivateFieldGet2(_isCharging, this);
    }
    updateIsCharging(updatedIsCharging) {
      _console$b.assertTypeWithError(updatedIsCharging, "boolean");
      _classPrivateFieldSet2(_isCharging, this, updatedIsCharging);
      _console$b.log({
        isCharging: _classPrivateFieldGet2(_isCharging, this)
      });
      _assertClassBrand(_InformationManager_brand, this, _dispatchEvent$3).call(this, {
        type: "isCharging",
        message: {
          isCharging: _classPrivateFieldGet2(_isCharging, this)
        }
      });
    }
    get batteryCurrent() {
      return _classPrivateFieldGet2(_batteryCurrent, this);
    }
    async getBatteryCurrent() {
      _console$b.log("getting battery current...");
      const promise = this.waitForEvent("getBatteryCurrent");
      this.sendMessage([{
        type: "getBatteryCurrent"
      }]);
      await promise;
    }
    updateBatteryCurrent(updatedBatteryCurrent) {
      _console$b.assertTypeWithError(updatedBatteryCurrent, "number");
      _classPrivateFieldSet2(_batteryCurrent, this, updatedBatteryCurrent);
      _console$b.log({
        batteryCurrent: _classPrivateFieldGet2(_batteryCurrent, this)
      });
      _assertClassBrand(_InformationManager_brand, this, _dispatchEvent$3).call(this, {
        type: "getBatteryCurrent",
        message: {
          batteryCurrent: _classPrivateFieldGet2(_batteryCurrent, this)
        }
      });
    }
    get id() {
      return _classPrivateFieldGet2(_id, this);
    }
    updateId(updatedId) {
      _console$b.assertTypeWithError(updatedId, "string");
      _classPrivateFieldSet2(_id, this, updatedId);
      _console$b.log({
        id: _classPrivateFieldGet2(_id, this)
      });
      _assertClassBrand(_InformationManager_brand, this, _dispatchEvent$3).call(this, {
        type: "getId",
        message: {
          id: _classPrivateFieldGet2(_id, this)
        }
      });
    }
    get name() {
      return _classPrivateFieldGet2(_name, this);
    }
    updateName(updatedName) {
      _console$b.assertTypeWithError(updatedName, "string");
      _classPrivateFieldSet2(_name, this, updatedName);
      _console$b.log({
        updatedName: _classPrivateFieldGet2(_name, this)
      });
      _assertClassBrand(_InformationManager_brand, this, _dispatchEvent$3).call(this, {
        type: "getName",
        message: {
          name: _classPrivateFieldGet2(_name, this)
        }
      });
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
    async setName(newName) {
      _console$b.assertTypeWithError(newName, "string");
      _console$b.assertWithError(newName.length >= this.minNameLength, `name must be greater than ${this.minNameLength} characters long ("${newName}" is ${newName.length} characters long)`);
      _console$b.assertWithError(newName.length < this.maxNameLength, `name must be less than ${this.maxNameLength} characters long ("${newName}" is ${newName.length} characters long)`);
      const setNameData = textEncoder.encode(newName);
      _console$b.log({
        setNameData
      });
      const promise = this.waitForEvent("getName");
      this.sendMessage([{
        type: "setName",
        data: setNameData.buffer
      }]);
      await promise;
    }

    // TYPE

    static get Types() {
      return _assertClassBrand(InformationManager, this, _Types$1)._;
    }
    get type() {
      return _classPrivateFieldGet2(_type, this);
    }
    get typeEnum() {
      return InformationManager.Types.indexOf(this.type);
    }
    updateType(updatedType) {
      _assertClassBrand(_InformationManager_brand, this, _assertValidDeviceType).call(this, updatedType);
      if (updatedType == this.type) {
        _console$b.log("redundant type assignment");
        return;
      }
      _classPrivateFieldSet2(_type, this, updatedType);
      _console$b.log({
        updatedType: _classPrivateFieldGet2(_type, this)
      });
      _assertClassBrand(_InformationManager_brand, this, _dispatchEvent$3).call(this, {
        type: "getType",
        message: {
          type: _classPrivateFieldGet2(_type, this)
        }
      });
    }
    async setType(newType) {
      _assertClassBrand(_InformationManager_brand, this, _assertValidDeviceType).call(this, newType);
      const newTypeEnum = _classPrivateGetter(_InformationManager_brand, this, _get_types$1).indexOf(newType);
      _assertClassBrand(_InformationManager_brand, this, _setTypeEnum).call(this, newTypeEnum);
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
    static get InsoleSides() {
      return _assertClassBrand(InformationManager, this, _InsoleSides)._;
    }
    get insoleSides() {
      return InformationManager.InsoleSides;
    }
    get insoleSide() {
      switch (this.type) {
        case "leftInsole":
          return "left";
        case "rightInsole":
          return "right";
      }
    }
    get mtu() {
      return _classPrivateFieldGet2(_mtu$2, this);
    }
    get isCurrentTimeSet() {
      return _classPrivateFieldGet2(_isCurrentTimeSet, this);
    }
    // MESSAGE

    parseMessage(messageType, dataView) {
      _console$b.log({
        messageType
      });
      switch (messageType) {
        case "isCharging":
          const isCharging = Boolean(dataView.getUint8(0));
          _console$b.log({
            isCharging
          });
          this.updateIsCharging(isCharging);
          break;
        case "getBatteryCurrent":
          const batteryCurrent = dataView.getFloat32(0, true);
          _console$b.log({
            batteryCurrent
          });
          this.updateBatteryCurrent(batteryCurrent);
          break;
        case "getId":
          const id = textDecoder.decode(dataView);
          _console$b.log({
            id
          });
          this.updateId(id);
          break;
        case "getName":
        case "setName":
          const name = textDecoder.decode(dataView);
          _console$b.log({
            name
          });
          this.updateName(name);
          break;
        case "getType":
        case "setType":
          const typeEnum = dataView.getUint8(0);
          const type = _classPrivateGetter(_InformationManager_brand, this, _get_types$1)[typeEnum];
          _console$b.log({
            typeEnum,
            type
          });
          this.updateType(type);
          break;
        case "getMtu":
          const mtu = dataView.getUint16(0, true);
          _console$b.log({
            mtu
          });
          _assertClassBrand(_InformationManager_brand, this, _updateMtu).call(this, mtu);
          break;
        case "getCurrentTime":
        case "setCurrentTime":
          const currentTime = Number(dataView.getBigUint64(0, true));
          _assertClassBrand(_InformationManager_brand, this, _onCurrentTime).call(this, currentTime);
          break;
        default:
          throw Error(`uncaught messageType ${messageType}`);
      }
    }
    clear() {
      _classPrivateFieldSet2(_isCurrentTimeSet, this, false);
    }
  }
  _InformationManager = InformationManager;
  function _dispatchEvent$3(event) {
    this.eventDispatcher.dispatchEvent(event);
  }
  function _get_types$1(_this) {
    return _InformationManager.Types;
  }
  function _assertValidDeviceType(type) {
    _console$b.assertEnumWithError(type, _classPrivateGetter(_InformationManager_brand, this, _get_types$1));
  }
  function _assertValidDeviceTypeEnum(typeEnum) {
    _console$b.assertTypeWithError(typeEnum, "number");
    _console$b.assertWithError(_classPrivateGetter(_InformationManager_brand, this, _get_types$1)[typeEnum], `invalid typeEnum ${typeEnum}`);
  }
  async function _setTypeEnum(newTypeEnum) {
    _assertClassBrand(_InformationManager_brand, this, _assertValidDeviceTypeEnum).call(this, newTypeEnum);
    const setTypeData = Uint8Array.from([newTypeEnum]);
    _console$b.log({
      setTypeData
    });
    const promise = this.waitForEvent("getType");
    this.sendMessage([{
      type: "setType",
      data: setTypeData.buffer
    }]);
    await promise;
  }
  function _updateMtu(newMtu) {
    _console$b.assertTypeWithError(newMtu, "number");
    if (_classPrivateFieldGet2(_mtu$2, this) == newMtu) {
      _console$b.log("redundant mtu assignment", newMtu);
      return;
    }
    _classPrivateFieldSet2(_mtu$2, this, newMtu);
    _assertClassBrand(_InformationManager_brand, this, _dispatchEvent$3).call(this, {
      type: "getMtu",
      message: {
        mtu: _classPrivateFieldGet2(_mtu$2, this)
      }
    });
  }
  function _onCurrentTime(currentTime) {
    _console$b.log({
      currentTime
    });
    _classPrivateFieldSet2(_isCurrentTimeSet, this, currentTime != 0);
    if (!_classPrivateFieldGet2(_isCurrentTimeSet, this)) {
      _assertClassBrand(_InformationManager_brand, this, _setCurrentTime).call(this);
    }
  }
  async function _setCurrentTime() {
    _console$b.log("setting current time...");
    const dataView = new DataView(new ArrayBuffer(8));
    dataView.setBigUint64(0, BigInt(Date.now()), true);
    const promise = this.waitForEvent("getCurrentTime");
    this.sendMessage([{
      type: "setCurrentTime",
      data: dataView.buffer
    }]);
    await promise;
  }
  // MESSAGE TYPES
  var _MessageTypes$3 = {
    _: ["isCharging", "getBatteryCurrent", "getMtu", "getId", "getName", "setName", "getType", "setType", "getCurrentTime", "setCurrentTime"]
  };
  var _EventTypes$3 = {
    _: [..._assertClassBrand(_InformationManager, _InformationManager, _MessageTypes$3)._]
  };
  var _Types$1 = {
    _: ["leftInsole", "rightInsole"]
  };
  var _InsoleSides = {
    _: ["left", "right"]
  };

  const VibrationWaveformEffects = ["none", "strongClick100", "strongClick60", "strongClick30", "sharpClick100", "sharpClick60", "sharpClick30", "softBump100", "softBump60", "softBump30", "doubleClick100", "doubleClick60", "tripleClick100", "softFuzz60", "strongBuzz100", "alert750ms", "alert1000ms", "strongClick1_100", "strongClick2_80", "strongClick3_60", "strongClick4_30", "mediumClick100", "mediumClick80", "mediumClick60", "sharpTick100", "sharpTick80", "sharpTick60", "shortDoubleClickStrong100", "shortDoubleClickStrong80", "shortDoubleClickStrong60", "shortDoubleClickStrong30", "shortDoubleClickMedium100", "shortDoubleClickMedium80", "shortDoubleClickMedium60", "shortDoubleSharpTick100", "shortDoubleSharpTick80", "shortDoubleSharpTick60", "longDoubleSharpClickStrong100", "longDoubleSharpClickStrong80", "longDoubleSharpClickStrong60", "longDoubleSharpClickStrong30", "longDoubleSharpClickMedium100", "longDoubleSharpClickMedium80", "longDoubleSharpClickMedium60", "longDoubleSharpTick100", "longDoubleSharpTick80", "longDoubleSharpTick60", "buzz100", "buzz80", "buzz60", "buzz40", "buzz20", "pulsingStrong100", "pulsingStrong60", "pulsingMedium100", "pulsingMedium60", "pulsingSharp100", "pulsingSharp60", "transitionClick100", "transitionClick80", "transitionClick60", "transitionClick40", "transitionClick20", "transitionClick10", "transitionHum100", "transitionHum80", "transitionHum60", "transitionHum40", "transitionHum20", "transitionHum10", "transitionRampDownLongSmooth2_100", "transitionRampDownLongSmooth1_100", "transitionRampDownMediumSmooth1_100", "transitionRampDownMediumSmooth2_100", "transitionRampDownShortSmooth1_100", "transitionRampDownShortSmooth2_100", "transitionRampDownLongSharp1_100", "transitionRampDownLongSharp2_100", "transitionRampDownMediumSharp1_100", "transitionRampDownMediumSharp2_100", "transitionRampDownShortSharp1_100", "transitionRampDownShortSharp2_100", "transitionRampUpLongSmooth1_100", "transitionRampUpLongSmooth2_100", "transitionRampUpMediumSmooth1_100", "transitionRampUpMediumSmooth2_100", "transitionRampUpShortSmooth1_100", "transitionRampUpShortSmooth2_100", "transitionRampUpLongSharp1_100", "transitionRampUpLongSharp2_100", "transitionRampUpMediumSharp1_100", "transitionRampUpMediumSharp2_100", "transitionRampUpShortSharp1_100", "transitionRampUpShortSharp2_100", "transitionRampDownLongSmooth1_50", "transitionRampDownLongSmooth2_50", "transitionRampDownMediumSmooth1_50", "transitionRampDownMediumSmooth2_50", "transitionRampDownShortSmooth1_50", "transitionRampDownShortSmooth2_50", "transitionRampDownLongSharp1_50", "transitionRampDownLongSharp2_50", "transitionRampDownMediumSharp1_50", "transitionRampDownMediumSharp2_50", "transitionRampDownShortSharp1_50", "transitionRampDownShortSharp2_50", "transitionRampUpLongSmooth1_50", "transitionRampUpLongSmooth2_50", "transitionRampUpMediumSmooth1_50", "transitionRampUpMediumSmooth2_50", "transitionRampUpShortSmooth1_50", "transitionRampUpShortSmooth2_50", "transitionRampUpLongSharp1_50", "transitionRampUpLongSharp2_50", "transitionRampUpMediumSharp1_50", "transitionRampUpMediumSharp2_50", "transitionRampUpShortSharp1_50", "transitionRampUpShortSharp2_50", "longBuzz100", "smoothHum50", "smoothHum40", "smoothHum30", "smoothHum20", "smoothHum10"];

  var _VibrationManager;
  const _console$a = createConsole("VibrationManager");
  var _VibrationManager_brand = /*#__PURE__*/new WeakSet();
  class VibrationManager {
    constructor() {
      _classPrivateMethodInitSpec(this, _VibrationManager_brand);
      _defineProperty(this, "sendMessage", void 0);
    }
    static get MessageTypes() {
      return _assertClassBrand(VibrationManager, this, _MessageTypes$2)._;
    }
    get messageTypes() {
      return TfliteManager.MessageTypes;
    }

    // LOCATIONS

    static get Locations() {
      return _assertClassBrand(VibrationManager, this, _Locations)._;
    }
    get locations() {
      return VibrationManager.Locations;
    }
    static get WaveformEffects() {
      return VibrationWaveformEffects;
    }
    get waveformEffects() {
      return VibrationManager.WaveformEffects;
    }
    static get MaxWaveformEffectSegmentDelay() {
      return _assertClassBrand(VibrationManager, this, _MaxWaveformEffectSegmentDelay)._;
    }
    get maxWaveformEffectSegmentDelay() {
      return VibrationManager.MaxWaveformEffectSegmentDelay;
    }
    static get MaxWaveformEffectSegmentLoopCount() {
      return _assertClassBrand(VibrationManager, this, _MaxWaveformEffectSegmentLoopCount)._;
    }
    get maxWaveformEffectSegmentLoopCount() {
      return VibrationManager.MaxWaveformEffectSegmentLoopCount;
    }
    static get MaxNumberOfWaveformEffectSegments() {
      return _assertClassBrand(VibrationManager, this, _MaxNumberOfWaveformEffectSegments)._;
    }
    get maxNumberOfWaveformEffectSegments() {
      return VibrationManager.MaxNumberOfWaveformEffectSegments;
    }
    static get MaxWaveformEffectSequenceLoopCount() {
      return _assertClassBrand(VibrationManager, this, _MaxWaveformEffectSequenceLoopCount)._;
    }
    get maxWaveformEffectSequenceLoopCount() {
      return VibrationManager.MaxWaveformEffectSequenceLoopCount;
    }
    static get MaxWaveformSegmentDuration() {
      return _assertClassBrand(VibrationManager, this, _MaxWaveformSegmentDuration)._;
    }
    get maxWaveformSegmentDuration() {
      return VibrationManager.MaxWaveformSegmentDuration;
    }
    static get MaxNumberOfWaveformSegments() {
      return _assertClassBrand(VibrationManager, this, _MaxNumberOfWaveformSegments)._;
    }
    get maxNumberOfWaveformSegments() {
      return VibrationManager.MaxNumberOfWaveformSegments;
    }
    static get Types() {
      return _assertClassBrand(VibrationManager, this, _Types)._;
    }
    async triggerVibration(vibrationConfigurations, sendImmediately) {
      let triggerVibrationData;
      vibrationConfigurations.forEach(vibrationConfiguration => {
        const {
          type
        } = vibrationConfiguration;
        let {
          locations
        } = vibrationConfiguration;
        locations = locations || this.locations.slice();
        let dataView;
        switch (type) {
          case "waveformEffect":
            {
              const {
                waveformEffect
              } = vibrationConfiguration;
              if (!waveformEffect) {
                throw Error("waveformEffect not defined in vibrationConfiguration");
              }
              const {
                segments,
                loopCount
              } = waveformEffect;
              dataView = _assertClassBrand(_VibrationManager_brand, this, _createWaveformEffectsData).call(this, locations, segments, loopCount);
            }
            break;
          case "waveform":
            {
              const {
                waveform
              } = vibrationConfiguration;
              if (!waveform) {
                throw Error("waveform not defined in vibrationConfiguration");
              }
              const {
                segments
              } = waveform;
              dataView = _assertClassBrand(_VibrationManager_brand, this, _createWaveformData).call(this, locations, segments);
            }
            break;
          default:
            throw Error(`invalid vibration type "${type}"`);
        }
        _console$a.log({
          type,
          dataView
        });
        triggerVibrationData = concatenateArrayBuffers(triggerVibrationData, dataView);
      });
      await this.sendMessage([{
        type: "triggerVibration",
        data: triggerVibrationData
      }], sendImmediately);
    }
  }
  _VibrationManager = VibrationManager;
  function _verifyLocation(location) {
    _console$a.assertTypeWithError(location, "string");
    _console$a.assertWithError(this.locations.includes(location), `invalid location "${location}"`);
  }
  function _verifyLocations(locations) {
    _assertClassBrand(_VibrationManager_brand, this, _assertNonEmptyArray).call(this, locations);
    locations.forEach(location => {
      _assertClassBrand(_VibrationManager_brand, this, _verifyLocation).call(this, location);
    });
  }
  function _createLocationsBitmask(locations) {
    _assertClassBrand(_VibrationManager_brand, this, _verifyLocations).call(this, locations);
    let locationsBitmask = 0;
    locations.forEach(location => {
      const locationIndex = this.locations.indexOf(location);
      locationsBitmask |= 1 << locationIndex;
    });
    _console$a.log({
      locationsBitmask
    });
    _console$a.assertWithError(locationsBitmask > 0, `locationsBitmask must not be zero`);
    return locationsBitmask;
  }
  function _assertNonEmptyArray(array) {
    _console$a.assertWithError(Array.isArray(array), "passed non-array");
    _console$a.assertWithError(array.length > 0, "passed empty array");
  }
  function _verifyWaveformEffect(waveformEffect) {
    _console$a.assertWithError(this.waveformEffects.includes(waveformEffect), `invalid waveformEffect "${waveformEffect}"`);
  }
  function _verifyWaveformEffectSegment(waveformEffectSegment) {
    if (waveformEffectSegment.effect != undefined) {
      const waveformEffect = waveformEffectSegment.effect;
      _assertClassBrand(_VibrationManager_brand, this, _verifyWaveformEffect).call(this, waveformEffect);
    } else if (waveformEffectSegment.delay != undefined) {
      const {
        delay
      } = waveformEffectSegment;
      _console$a.assertWithError(delay >= 0, `delay must be 0ms or greater (got ${delay})`);
      _console$a.assertWithError(delay <= this.maxWaveformEffectSegmentDelay, `delay must be ${this.maxWaveformEffectSegmentDelay}ms or less (got ${delay})`);
    } else {
      throw Error("no effect or delay found in waveformEffectSegment");
    }
    if (waveformEffectSegment.loopCount != undefined) {
      const {
        loopCount
      } = waveformEffectSegment;
      _assertClassBrand(_VibrationManager_brand, this, _verifyWaveformEffectSegmentLoopCount).call(this, loopCount);
    }
  }
  function _verifyWaveformEffectSegmentLoopCount(waveformEffectSegmentLoopCount) {
    _console$a.assertTypeWithError(waveformEffectSegmentLoopCount, "number");
    _console$a.assertWithError(waveformEffectSegmentLoopCount >= 0, `waveformEffectSegmentLoopCount must be 0 or greater (got ${waveformEffectSegmentLoopCount})`);
    _console$a.assertWithError(waveformEffectSegmentLoopCount <= this.maxWaveformEffectSegmentLoopCount, `waveformEffectSegmentLoopCount must be ${this.maxWaveformEffectSegmentLoopCount} or fewer (got ${waveformEffectSegmentLoopCount})`);
  }
  function _verifyWaveformEffectSegments(waveformEffectSegments) {
    _assertClassBrand(_VibrationManager_brand, this, _assertNonEmptyArray).call(this, waveformEffectSegments);
    _console$a.assertWithError(waveformEffectSegments.length <= this.maxNumberOfWaveformEffectSegments, `must have ${this.maxNumberOfWaveformEffectSegments} waveformEffectSegments or fewer (got ${waveformEffectSegments.length})`);
    waveformEffectSegments.forEach(waveformEffectSegment => {
      _assertClassBrand(_VibrationManager_brand, this, _verifyWaveformEffectSegment).call(this, waveformEffectSegment);
    });
  }
  function _verifyWaveformEffectSequenceLoopCount(waveformEffectSequenceLoopCount) {
    _console$a.assertTypeWithError(waveformEffectSequenceLoopCount, "number");
    _console$a.assertWithError(waveformEffectSequenceLoopCount >= 0, `waveformEffectSequenceLoopCount must be 0 or greater (got ${waveformEffectSequenceLoopCount})`);
    _console$a.assertWithError(waveformEffectSequenceLoopCount <= this.maxWaveformEffectSequenceLoopCount, `waveformEffectSequenceLoopCount must be ${this.maxWaveformEffectSequenceLoopCount} or fewer (got ${waveformEffectSequenceLoopCount})`);
  }
  function _verifyWaveformSegment(waveformSegment) {
    _console$a.assertTypeWithError(waveformSegment.amplitude, "number");
    _console$a.assertWithError(waveformSegment.amplitude >= 0, `amplitude must be 0 or greater (got ${waveformSegment.amplitude})`);
    _console$a.assertWithError(waveformSegment.amplitude <= 1, `amplitude must be 1 or less (got ${waveformSegment.amplitude})`);
    _console$a.assertTypeWithError(waveformSegment.duration, "number");
    _console$a.assertWithError(waveformSegment.duration > 0, `duration must be greater than 0ms (got ${waveformSegment.duration}ms)`);
    _console$a.assertWithError(waveformSegment.duration <= this.maxWaveformSegmentDuration, `duration must be ${this.maxWaveformSegmentDuration}ms or less (got ${waveformSegment.duration}ms)`);
  }
  function _verifyWaveformSegments(waveformSegments) {
    _assertClassBrand(_VibrationManager_brand, this, _assertNonEmptyArray).call(this, waveformSegments);
    _console$a.assertWithError(waveformSegments.length <= this.maxNumberOfWaveformSegments, `must have ${this.maxNumberOfWaveformSegments} waveformSegments or fewer (got ${waveformSegments.length})`);
    waveformSegments.forEach(waveformSegment => {
      _assertClassBrand(_VibrationManager_brand, this, _verifyWaveformSegment).call(this, waveformSegment);
    });
  }
  function _createWaveformEffectsData(locations, waveformEffectSegments) {
    let waveformEffectSequenceLoopCount = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    _assertClassBrand(_VibrationManager_brand, this, _verifyWaveformEffectSegments).call(this, waveformEffectSegments);
    _assertClassBrand(_VibrationManager_brand, this, _verifyWaveformEffectSequenceLoopCount).call(this, waveformEffectSequenceLoopCount);
    let dataArray = [];
    let byteOffset = 0;
    const hasAtLeast1WaveformEffectWithANonzeroLoopCount = waveformEffectSegments.some(waveformEffectSegment => {
      const {
        loopCount
      } = waveformEffectSegment;
      return loopCount != undefined && loopCount > 0;
    });
    const includeAllWaveformEffectSegments = hasAtLeast1WaveformEffectWithANonzeroLoopCount || waveformEffectSequenceLoopCount != 0;
    for (let index = 0; index < waveformEffectSegments.length || includeAllWaveformEffectSegments && index < this.maxNumberOfWaveformEffectSegments; index++) {
      const waveformEffectSegment = waveformEffectSegments[index] || {
        effect: "none"
      };
      if (waveformEffectSegment.effect != undefined) {
        const waveformEffect = waveformEffectSegment.effect;
        dataArray[byteOffset++] = this.waveformEffects.indexOf(waveformEffect);
      } else if (waveformEffectSegment.delay != undefined) {
        const {
          delay
        } = waveformEffectSegment;
        dataArray[byteOffset++] = 1 << 7 | Math.floor(delay / 10); // set most significant bit to 1
      } else {
        throw Error("invalid waveformEffectSegment");
      }
    }
    const includeAllWaveformEffectSegmentLoopCounts = waveformEffectSequenceLoopCount != 0;
    for (let index = 0; index < waveformEffectSegments.length || includeAllWaveformEffectSegmentLoopCounts && index < this.maxNumberOfWaveformEffectSegments; index++) {
      var _waveformEffectSegmen;
      const waveformEffectSegmentLoopCount = ((_waveformEffectSegmen = waveformEffectSegments[index]) === null || _waveformEffectSegmen === void 0 ? void 0 : _waveformEffectSegmen.loopCount) || 0;
      if (index == 0 || index == 4) {
        dataArray[byteOffset] = 0;
      }
      const bitOffset = 2 * (index % 4);
      dataArray[byteOffset] |= waveformEffectSegmentLoopCount << bitOffset;
      if (index == 3 || index == 7) {
        byteOffset++;
      }
    }
    if (waveformEffectSequenceLoopCount != 0) {
      dataArray[byteOffset++] = waveformEffectSequenceLoopCount;
    }
    const dataView = new DataView(Uint8Array.from(dataArray).buffer);
    _console$a.log({
      dataArray,
      dataView
    });
    return _assertClassBrand(_VibrationManager_brand, this, _createData).call(this, locations, "waveformEffect", dataView);
  }
  function _createWaveformData(locations, waveformSegments) {
    _assertClassBrand(_VibrationManager_brand, this, _verifyWaveformSegments).call(this, waveformSegments);
    const dataView = new DataView(new ArrayBuffer(waveformSegments.length * 2));
    waveformSegments.forEach((waveformSegment, index) => {
      dataView.setUint8(index * 2, Math.floor(waveformSegment.amplitude * 127));
      dataView.setUint8(index * 2 + 1, Math.floor(waveformSegment.duration / 10));
    });
    _console$a.log({
      dataView
    });
    return _assertClassBrand(_VibrationManager_brand, this, _createData).call(this, locations, "waveform", dataView);
  }
  function _get_types(_this) {
    return _VibrationManager.Types;
  }
  function _verifyVibrationType(vibrationType) {
    _console$a.assertTypeWithError(vibrationType, "string");
    _console$a.assertWithError(_classPrivateGetter(_VibrationManager_brand, this, _get_types).includes(vibrationType), `invalid vibrationType "${vibrationType}"`);
  }
  function _createData(locations, vibrationType, dataView) {
    _console$a.assertWithError((dataView === null || dataView === void 0 ? void 0 : dataView.byteLength) > 0, "no data received");
    const locationsBitmask = _assertClassBrand(_VibrationManager_brand, this, _createLocationsBitmask).call(this, locations);
    _assertClassBrand(_VibrationManager_brand, this, _verifyVibrationType).call(this, vibrationType);
    const vibrationTypeIndex = _classPrivateGetter(_VibrationManager_brand, this, _get_types).indexOf(vibrationType);
    _console$a.log({
      locationsBitmask,
      vibrationTypeIndex,
      dataView
    });
    const data = concatenateArrayBuffers(locationsBitmask, vibrationTypeIndex, dataView.byteLength, dataView);
    _console$a.log({
      data
    });
    return data;
  }
  var _MessageTypes$2 = {
    _: ["triggerVibration"]
  };
  var _Locations = {
    _: ["front", "rear"]
  };
  var _MaxWaveformEffectSegmentDelay = {
    _: 1270
  };
  var _MaxWaveformEffectSegmentLoopCount = {
    _: 3
  };
  var _MaxNumberOfWaveformEffectSegments = {
    _: 8
  };
  var _MaxWaveformEffectSequenceLoopCount = {
    _: 6
  };
  var _MaxWaveformSegmentDuration = {
    _: 2550
  };
  var _MaxNumberOfWaveformSegments = {
    _: 20
  };
  var _Types = {
    _: ["waveformEffect", "waveform"]
  };

  var _BaseConnectionManager;
  const _console$9 = createConsole("BaseConnectionManager", {
    log: true
  });
  var _BaseConnectionManager_brand = /*#__PURE__*/new WeakSet();
  var _status$1 = /*#__PURE__*/new WeakMap();
  var _pendingMessages = /*#__PURE__*/new WeakMap();
  var _mtu$1 = /*#__PURE__*/new WeakMap();
  var _timer = /*#__PURE__*/new WeakMap();
  class BaseConnectionManager {
    static get TxRxMessageTypes() {
      return _assertClassBrand(BaseConnectionManager, this, _TxRxMessageTypes)._;
    }
    static get MessageTypes() {
      return _assertClassBrand(BaseConnectionManager, this, _MessageTypes$1)._;
    }
    // ID

    get bluetoothId() {
      _assertClassBrand(_BaseConnectionManager_brand, this, _throwNotImplementedError).call(this, "bluetoothId");
    }

    // CALLBACKS

    static get isSupported() {
      return false;
    }
    get isSupported() {
      return this.constructor.isSupported;
    }
    static get type() {
      _assertClassBrand(BaseConnectionManager, this, _staticThrowNotImplementedError).call(this, "type");
    }
    get type() {
      return this.constructor.type;
    }
    constructor() {
      _classPrivateMethodInitSpec(this, _BaseConnectionManager_brand);
      _defineProperty(this, "onStatusUpdated", void 0);
      _defineProperty(this, "onMessageReceived", void 0);
      _classPrivateFieldInitSpec(this, _status$1, "not connected");
      _classPrivateFieldInitSpec(this, _pendingMessages, []);
      _classPrivateFieldInitSpec(this, _mtu$1, void 0);
      _classPrivateFieldInitSpec(this, _timer, new Timer(_assertClassBrand(_BaseConnectionManager_brand, this, _checkConnection$1).bind(this), 5000));
      _assertClassBrand(_BaseConnectionManager_brand, this, _assertIsSubclass).call(this);
      _assertClassBrand(_BaseConnectionManager_brand, this, _assertIsSupported).call(this);
    }
    static get Statuses() {
      return _classPrivateGetter(BaseConnectionManager, this, _get_Statuses);
    }
    get status() {
      return _classPrivateFieldGet2(_status$1, this);
    }
    set status(newConnectionStatus) {
      var _this$onStatusUpdated;
      _console$9.assertEnumWithError(newConnectionStatus, _classPrivateGetter(_BaseConnectionManager_brand, this, _get_statuses));
      if (_classPrivateFieldGet2(_status$1, this) == newConnectionStatus) {
        _console$9.log(`tried to assign same connection status "${newConnectionStatus}"`);
        return;
      }
      _console$9.log(`new connection status "${newConnectionStatus}"`);
      _classPrivateFieldSet2(_status$1, this, newConnectionStatus);
      (_this$onStatusUpdated = this.onStatusUpdated) === null || _this$onStatusUpdated === void 0 ? void 0 : _this$onStatusUpdated.call(this, this.status);
      if (this.isConnected) {
        _classPrivateFieldGet2(_timer, this).start();
      } else {
        _classPrivateFieldGet2(_timer, this).stop();
      }
      if (_classPrivateFieldGet2(_status$1, this) == "not connected") {
        _classPrivateFieldSet2(_mtu$1, this, null);
      }
    }
    get isConnected() {
      return this.status == "connected";
    }
    async connect() {
      _assertClassBrand(_BaseConnectionManager_brand, this, _assertIsNotConnected).call(this);
      _assertClassBrand(_BaseConnectionManager_brand, this, _assertIsNotConnecting).call(this);
      this.status = "connecting";
    }
    get canReconnect() {
      return false;
    }
    async reconnect() {
      _assertClassBrand(_BaseConnectionManager_brand, this, _assertIsNotConnected).call(this);
      _assertClassBrand(_BaseConnectionManager_brand, this, _assertIsNotConnecting).call(this);
      _console$9.assert(this.canReconnect, "unable to reconnect");
    }
    async disconnect() {
      _assertClassBrand(_BaseConnectionManager_brand, this, _assertIsConnected$1).call(this);
      _assertClassBrand(_BaseConnectionManager_brand, this, _assertIsNotDisconnecting).call(this);
      this.status = "disconnecting";
      _console$9.log("disconnecting from device...");
    }
    async sendSmpMessage(data) {
      _assertClassBrand(_BaseConnectionManager_brand, this, _assertIsConnectedAndNotDisconnecting).call(this);
      _console$9.log("sending smp message", data);
    }
    async sendTxMessages(messages) {
      let sendImmediately = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      _assertClassBrand(_BaseConnectionManager_brand, this, _assertIsConnectedAndNotDisconnecting).call(this);
      if (messages) {
        _classPrivateFieldGet2(_pendingMessages, this).push(...messages);
      }
      if (!sendImmediately) {
        return;
      }
      _console$9.log("sendTxMessages", _classPrivateFieldGet2(_pendingMessages, this).slice());
      const arrayBuffers = _classPrivateFieldGet2(_pendingMessages, this).map(message => {
        var _message$data;
        _AssertValidTxRxMessageType.call(BaseConnectionManager, message.type);
        const messageTypeEnum = BaseConnectionManager.TxRxMessageTypes.indexOf(message.type);
        const dataLength = new DataView(new ArrayBuffer(2));
        dataLength.setUint16(0, ((_message$data = message.data) === null || _message$data === void 0 ? void 0 : _message$data.byteLength) || 0, true);
        return concatenateArrayBuffers(messageTypeEnum, dataLength, message.data);
      });
      if (_classPrivateFieldGet2(_mtu$1, this)) {
        while (arrayBuffers.length > 0) {
          let arrayBufferByteLength = 0;
          let arrayBufferCount = 0;
          arrayBuffers.some(arrayBuffer => {
            if (arrayBufferByteLength + arrayBuffer.byteLength > _classPrivateFieldGet2(_mtu$1, this) - 3) {
              return true;
            }
            arrayBufferCount++;
            arrayBufferByteLength += arrayBuffer.byteLength;
          });
          const arrayBuffersToSend = arrayBuffers.splice(0, arrayBufferCount);
          _console$9.log({
            arrayBufferCount,
            arrayBuffersToSend
          });
          const arrayBuffer = concatenateArrayBuffers(...arrayBuffersToSend);
          _console$9.log("sending arrayBuffer", arrayBuffer);
          await this.sendTxData(arrayBuffer);
        }
      } else {
        const arrayBuffer = concatenateArrayBuffers(...arrayBuffers);
        _console$9.log("sending arrayBuffer", arrayBuffer);
        await this.sendTxData(arrayBuffer);
      }
      _classPrivateFieldGet2(_pendingMessages, this).length = 0;
    }
    get mtu() {
      return _classPrivateFieldGet2(_mtu$1, this);
    }
    set mtu(newMtu) {
      _classPrivateFieldSet2(_mtu$1, this, newMtu);
    }
    async sendTxData(data) {
      _console$9.log("sendTxData", data);
    }
    parseRxMessage(dataView) {
      parseMessage(dataView, _TxRxMessageTypes._, _assertClassBrand(_BaseConnectionManager_brand, this, _onRxMessage).bind(this), null, true);
    }
  }
  _BaseConnectionManager = BaseConnectionManager;
  function _AssertValidTxRxMessageType(messageType) {
    _console$9.assertEnumWithError(messageType, _assertClassBrand(_BaseConnectionManager, this, _TxRxMessageTypes)._);
  }
  function _staticThrowNotImplementedError(name) {
    throw new Error(`"${name}" is not implemented by "${this.name}" subclass`);
  }
  function _throwNotImplementedError(name) {
    throw new Error(`"${name}" is not implemented by "${this.constructor.name}" subclass`);
  }
  function _assertIsSupported() {
    _console$9.assertWithError(this.isSupported, `${this.constructor.name} is not supported`);
  }
  function _assertIsSubclass() {
    _console$9.assertWithError(this.constructor != _BaseConnectionManager, `${this.constructor.name} must be subclassed`);
  }
  function _get_Statuses(_this) {
    return ["not connected", "connecting", "connected", "disconnecting"];
  }
  function _get_statuses(_this2) {
    return _get_Statuses();
  }
  function _assertIsNotConnected() {
    _console$9.assertWithError(!this.isConnected, "device is already connected");
  }
  function _assertIsNotConnecting() {
    _console$9.assertWithError(this.status != "connecting", "device is already connecting");
  }
  function _assertIsConnected$1() {
    _console$9.assertWithError(this.isConnected, "device is not connected");
  }
  function _assertIsNotDisconnecting() {
    _console$9.assertWithError(this.status != "disconnecting", "device is already disconnecting");
  }
  function _assertIsConnectedAndNotDisconnecting() {
    _assertClassBrand(_BaseConnectionManager_brand, this, _assertIsConnected$1).call(this);
    _assertClassBrand(_BaseConnectionManager_brand, this, _assertIsNotDisconnecting).call(this);
  }
  function _onRxMessage(messageType, dataView) {
    var _this$onMessageReceiv;
    _console$9.log({
      messageType,
      dataView
    });
    (_this$onMessageReceiv = this.onMessageReceived) === null || _this$onMessageReceiv === void 0 ? void 0 : _this$onMessageReceiv.call(this, messageType, dataView);
  }
  function _checkConnection$1() {
    //console.log("checking connection...");
    if (!this.isConnected) {
      _console$9.log("timer detected disconnection");
      this.status = "not connected";
    }
  }
  // MESSAGES
  var _TxRxMessageTypes = {
    _: [...InformationManager.MessageTypes, ...SensorConfigurationManager.MessageTypes, ...SensorDataManager.MessageTypes, ...VibrationManager.MessageTypes, ...TfliteManager$1.MessageTypes, ...FileTransferManager.MessageTypes]
  };
  var _MessageTypes$1 = {
    _: [...DeviceInformationManager.MessageTypes, "batteryLevel", "smp", "rx", "tx", ..._BaseConnectionManager.TxRxMessageTypes]
  };

  const _console$8 = createConsole("bluetoothUUIDs", {
    log: false
  });

  /*
  import webbluetooth from "webbluetooth";
  var BluetoothUUID = webbluetooth.BluetoothUUID;
  */
  /*
  if (isInBrowser) {
    var BluetoothUUID = window.BluetoothUUID;
  }
  */

  function generateBluetoothUUID(value) {
    _console$8.assertTypeWithError(value, "string");
    _console$8.assertWithError(value.length == 4, "value must be 4 characters long");
    return `ea6da725-${value}-4f9b-893d-c3913e33b39f`;
  }
  function stringToCharacteristicUUID(identifier) {
    var _BluetoothUUID, _BluetoothUUID$getCha;
    return (_BluetoothUUID = BluetoothUUID) === null || _BluetoothUUID === void 0 ? void 0 : (_BluetoothUUID$getCha = _BluetoothUUID.getCharacteristic) === null || _BluetoothUUID$getCha === void 0 ? void 0 : _BluetoothUUID$getCha.call(_BluetoothUUID, identifier);
  }
  function stringToServiceUUID(identifier) {
    var _BluetoothUUID2, _BluetoothUUID2$getSe;
    return (_BluetoothUUID2 = BluetoothUUID) === null || _BluetoothUUID2 === void 0 ? void 0 : (_BluetoothUUID2$getSe = _BluetoothUUID2.getService) === null || _BluetoothUUID2$getSe === void 0 ? void 0 : _BluetoothUUID2$getSe.call(_BluetoothUUID2, identifier);
  }
  const bluetoothUUIDs = Object.freeze({
    services: {
      deviceInformation: {
        uuid: stringToServiceUUID("device_information"),
        characteristics: {
          manufacturerName: {
            uuid: stringToCharacteristicUUID("manufacturer_name_string")
          },
          modelNumber: {
            uuid: stringToCharacteristicUUID("model_number_string")
          },
          hardwareRevision: {
            uuid: stringToCharacteristicUUID("hardware_revision_string")
          },
          firmwareRevision: {
            uuid: stringToCharacteristicUUID("firmware_revision_string")
          },
          softwareRevision: {
            uuid: stringToCharacteristicUUID("software_revision_string")
          },
          pnpId: {
            uuid: stringToCharacteristicUUID("pnp_id")
          },
          serialNumber: {
            uuid: stringToCharacteristicUUID("serial_number_string")
          }
        }
      },
      battery: {
        uuid: stringToServiceUUID("battery_service"),
        characteristics: {
          batteryLevel: {
            uuid: stringToCharacteristicUUID("battery_level")
          }
        }
      },
      main: {
        uuid: generateBluetoothUUID("0000"),
        characteristics: {
          rx: {
            uuid: generateBluetoothUUID("1000")
          },
          tx: {
            uuid: generateBluetoothUUID("1001")
          }
        }
      },
      smp: {
        uuid: "8d53dc1d-1db7-4cd3-868b-8a527460aa84",
        characteristics: {
          smp: {
            uuid: "da2e7828-fbce-4e01-ae9e-261174997c48"
          }
        }
      }
    },
    get serviceUUIDs() {
      return [this.services.main.uuid];
    },
    get optionalServiceUUIDs() {
      return [this.services.deviceInformation.uuid, this.services.battery.uuid, this.services.smp.uuid];
    },
    getServiceNameFromUUID(serviceUUID) {
      var _Object$entries$find;
      serviceUUID = serviceUUID.toLowerCase();
      return (_Object$entries$find = Object.entries(this.services).find(_ref => {
        let [serviceName, serviceInfo] = _ref;
        let serviceInfoUUID = serviceInfo.uuid;
        if (serviceUUID.length == 4) {
          serviceInfoUUID = serviceInfoUUID.slice(4, 8);
        }
        if (!serviceUUID.includes("-")) {
          serviceInfoUUID = serviceInfoUUID.replaceAll("-", "");
        }
        return serviceUUID == serviceInfoUUID;
      })) === null || _Object$entries$find === void 0 ? void 0 : _Object$entries$find[0];
    },
    getCharacteristicNameFromUUID(characteristicUUID) {
      //_console.log({ characteristicUUID });
      characteristicUUID = characteristicUUID.toLowerCase();
      var characteristicName;
      Object.values(this.services).some(serviceInfo => {
        var _Object$entries$find2;
        characteristicName = (_Object$entries$find2 = Object.entries(serviceInfo.characteristics).find(_ref2 => {
          let [characteristicName, characteristicInfo] = _ref2;
          let characteristicInfoUUID = characteristicInfo.uuid;
          if (characteristicUUID.length == 4) {
            characteristicInfoUUID = characteristicInfoUUID.slice(4, 8);
          }
          if (!characteristicUUID.includes("-")) {
            characteristicInfoUUID = characteristicInfoUUID.replaceAll("-", "");
          }
          return characteristicUUID == characteristicInfoUUID;
        })) === null || _Object$entries$find2 === void 0 ? void 0 : _Object$entries$find2[0];
        return characteristicName;
      });
      return characteristicName;
    }
  });
  const serviceUUIDs = bluetoothUUIDs.serviceUUIDs;
  const optionalServiceUUIDs = bluetoothUUIDs.optionalServiceUUIDs;
  [...serviceUUIDs, ...optionalServiceUUIDs];
  function getServiceNameFromUUID(serviceUUID) {
    return bluetoothUUIDs.getServiceNameFromUUID(serviceUUID);
  }
  const characteristicUUIDs = [];
  const allCharacteristicUUIDs = [];
  Object.entries(bluetoothUUIDs.services).forEach(_ref3 => {
    let [serviceName, serviceInfo] = _ref3;
    if (!serviceInfo.characteristics) {
      return;
    }
    Object.entries(serviceInfo.characteristics).forEach(_ref4 => {
      let [characteristicName, characteristicInfo] = _ref4;
      if (serviceUUIDs.includes(serviceInfo.uuid)) {
        characteristicUUIDs.push(characteristicInfo.uuid);
      }
      allCharacteristicUUIDs.push(characteristicInfo.uuid);
    });
  }, []);

  //_console.log({ characteristicUUIDs, allCharacteristicUUIDs });

  function getCharacteristicNameFromUUID(characteristicUUID) {
    return bluetoothUUIDs.getCharacteristicNameFromUUID(characteristicUUID);
  }
  function getCharacteristicProperties(characteristicName) {
    const properties = {
      broadcast: false,
      read: true,
      writeWithoutResponse: false,
      write: false,
      notify: false,
      indicate: false,
      authenticatedSignedWrites: false,
      reliableWrite: false,
      writableAuxiliaries: false
    };

    // read
    switch (characteristicName) {
      case "rx":
      case "tx":
      case "smp":
        properties.read = false;
        break;
    }

    // notify
    switch (characteristicName) {
      case "batteryLevel":
      case "rx":
      case "smp":
        properties.notify = true;
        break;
    }

    // write
    switch (characteristicName) {
      case "tx":
      case "smp":
        properties.writeWithoutResponse = true;
        break;
    }
    return properties;
  }

  const _console$7 = createConsole("BluetoothConnectionManager", {
    log: true
  });
  class BluetoothConnectionManager extends BaseConnectionManager {
    constructor() {
      super(...arguments);
      _defineProperty(this, "isInRange", true);
    }
    onCharacteristicValueChanged(characteristicName, dataView) {
      if (characteristicName == "rx") {
        this.parseRxMessage(dataView);
      } else {
        var _this$onMessageReceiv;
        (_this$onMessageReceiv = this.onMessageReceived) === null || _this$onMessageReceiv === void 0 ? void 0 : _this$onMessageReceiv.call(this, characteristicName, dataView);
      }
    }
    async writeCharacteristic(characteristicName, data) {
      _console$7.log("writeCharacteristic", ...arguments);
    }
    async sendSmpMessage(data) {
      super.sendSmpMessage(...arguments);
      await this.writeCharacteristic("smp", data);
    }
    async sendTxData(data) {
      super.sendTxData(...arguments);
      await this.writeCharacteristic("tx", data);
    }
  }

  const _console$6 = createConsole("WebBluetoothConnectionManager", {
    log: true
  });

  /*
  import webbluetooth from "webbluetooth";
  const { bluetooth } = webbluetooth;
  var navigator = { bluetooth };
  */

  /*
  if (isInBrowser) {
    var navigator = window.navigator;
  }
  */
  var _boundBluetoothCharacteristicEventListeners = /*#__PURE__*/new WeakMap();
  var _boundBluetoothDeviceEventListeners = /*#__PURE__*/new WeakMap();
  var _device = /*#__PURE__*/new WeakMap();
  var _services = /*#__PURE__*/new WeakMap();
  var _characteristics = /*#__PURE__*/new WeakMap();
  var _WebBluetoothConnectionManager_brand = /*#__PURE__*/new WeakSet();
  class WebBluetoothConnectionManager extends BluetoothConnectionManager {
    constructor() {
      super(...arguments);
      _classPrivateMethodInitSpec(this, _WebBluetoothConnectionManager_brand);
      _classPrivateFieldInitSpec(this, _boundBluetoothCharacteristicEventListeners, {
        characteristicvaluechanged: _assertClassBrand(_WebBluetoothConnectionManager_brand, this, _onCharacteristicvaluechanged).bind(this)
      });
      _classPrivateFieldInitSpec(this, _boundBluetoothDeviceEventListeners, {
        gattserverdisconnected: _assertClassBrand(_WebBluetoothConnectionManager_brand, this, _onGattserverdisconnected).bind(this)
      });
      _classPrivateFieldInitSpec(this, _device, void 0);
      _classPrivateFieldInitSpec(this, _services, new Map());
      _classPrivateFieldInitSpec(this, _characteristics, new Map());
    }
    get bluetoothId() {
      var _this$device;
      return (_this$device = this.device) === null || _this$device === void 0 ? void 0 : _this$device.id;
    }
    static get isSupported() {
      return "bluetooth" in navigator;
    }
    static get type() {
      return "webBluetooth";
    }
    get device() {
      return _classPrivateFieldGet2(_device, this);
    }
    set device(newDevice) {
      if (_classPrivateFieldGet2(_device, this) == newDevice) {
        _console$6.log("tried to assign the same BluetoothDevice");
        return;
      }
      if (_classPrivateFieldGet2(_device, this)) {
        removeEventListeners(_classPrivateFieldGet2(_device, this), _classPrivateFieldGet2(_boundBluetoothDeviceEventListeners, this));
      }
      if (newDevice) {
        addEventListeners(newDevice, _classPrivateFieldGet2(_boundBluetoothDeviceEventListeners, this));
      }
      _classPrivateFieldSet2(_device, this, newDevice);
    }
    get server() {
      var _classPrivateFieldGet2$1;
      return (_classPrivateFieldGet2$1 = _classPrivateFieldGet2(_device, this)) === null || _classPrivateFieldGet2$1 === void 0 ? void 0 : _classPrivateFieldGet2$1.gatt;
    }
    get isConnected() {
      var _this$server;
      return (_this$server = this.server) === null || _this$server === void 0 ? void 0 : _this$server.connected;
    }
    async connect() {
      await super.connect();
      try {
        const device = await navigator.bluetooth.requestDevice({
          filters: [{
            services: serviceUUIDs
          }],
          optionalServices: isInBrowser ? optionalServiceUUIDs : []
        });
        _console$6.log("got BluetoothDevice");
        this.device = device;
        _console$6.log("connecting to device...");
        const server = await this.device.gatt.connect();
        _console$6.log(`connected to device? ${server.connected}`);
        await _assertClassBrand(_WebBluetoothConnectionManager_brand, this, _getServicesAndCharacteristics).call(this);
        _console$6.log("fully connected");
        this.status = "connected";
      } catch (error) {
        var _this$server2;
        _console$6.error(error);
        this.status = "not connected";
        (_this$server2 = this.server) === null || _this$server2 === void 0 ? void 0 : _this$server2.disconnect();
        _assertClassBrand(_WebBluetoothConnectionManager_brand, this, _removeEventListeners).call(this);
      }
    }
    async disconnect() {
      var _this$server3;
      await super.disconnect();
      (_this$server3 = this.server) === null || _this$server3 === void 0 ? void 0 : _this$server3.disconnect();
      _assertClassBrand(_WebBluetoothConnectionManager_brand, this, _removeEventListeners).call(this);
      this.status = "not connected";
    }
    async writeCharacteristic(characteristicName, data) {
      super.writeCharacteristic(...arguments);
      const characteristic = _classPrivateFieldGet2(_characteristics, this).get(characteristicName);
      _console$6.assertWithError(characteristic, `${characteristicName} characteristic not found`);
      _console$6.log("writing characteristic", characteristic, data);
      const characteristicProperties = characteristic.properties || getCharacteristicProperties(characteristicName);
      if (characteristicProperties.writeWithoutResponse) {
        _console$6.log("writing without response");
        await characteristic.writeValueWithoutResponse(data);
      } else {
        _console$6.log("writing with response");
        await characteristic.writeValueWithResponse(data);
      }
      _console$6.log("wrote characteristic");
      if (characteristicProperties.read && !characteristicProperties.notify) {
        _console$6.log("reading value after write...");
        await characteristic.readValue();
        if (isInBluefy || isInWebBLE) {
          _assertClassBrand(_WebBluetoothConnectionManager_brand, this, _onCharacteristicValueChanged).call(this, characteristic);
        }
      }
    }
    get canReconnect() {
      return this.server && !this.server.connected && this.isInRange;
    }
    async reconnect() {
      await super.reconnect();
      _console$6.log("attempting to reconnect...");
      this.status = "connecting";
      try {
        await this.server.connect();
      } catch (error) {
        _console$6.error(error);
        this.isInRange = false;
      }
      if (this.isConnected) {
        _console$6.log("successfully reconnected!");
        await _assertClassBrand(_WebBluetoothConnectionManager_brand, this, _getServicesAndCharacteristics).call(this);
        this.status = "connected";
      } else {
        _console$6.log("unable to reconnect");
        this.status = "not connected";
      }
    }
  }
  async function _getServicesAndCharacteristics() {
    _assertClassBrand(_WebBluetoothConnectionManager_brand, this, _removeEventListeners).call(this);
    _console$6.log("getting services...");
    const services = await this.server.getPrimaryServices();
    _console$6.log("got services", services.length);
    await this.server.getPrimaryService("8d53dc1d-1db7-4cd3-868b-8a527460aa84");
    _console$6.log("getting characteristics...");
    for (const serviceIndex in services) {
      const service = services[serviceIndex];
      _console$6.log({
        service
      });
      const serviceName = getServiceNameFromUUID(service.uuid);
      _console$6.assertWithError(serviceName, `no name found for service uuid "${service.uuid}"`);
      _console$6.log(`got "${serviceName}" service`);
      service._name = serviceName;
      _classPrivateFieldGet2(_services, this).set(serviceName, service);
      _console$6.log(`getting characteristics for "${serviceName}" service`);
      const characteristics = await service.getCharacteristics();
      _console$6.log(`got characteristics for "${serviceName}" service`);
      for (const characteristicIndex in characteristics) {
        const characteristic = characteristics[characteristicIndex];
        _console$6.log({
          characteristic
        });
        const characteristicName = getCharacteristicNameFromUUID(characteristic.uuid);
        _console$6.assertWithError(characteristicName, `no name found for characteristic uuid "${characteristic.uuid}" in "${serviceName}" service`);
        _console$6.log(`got "${characteristicName}" characteristic in "${serviceName}" service`);
        characteristic._name = characteristicName;
        _classPrivateFieldGet2(_characteristics, this).set(characteristicName, characteristic);
        addEventListeners(characteristic, _classPrivateFieldGet2(_boundBluetoothCharacteristicEventListeners, this));
        const characteristicProperties = characteristic.properties || getCharacteristicProperties(characteristicName);
        if (characteristicProperties.notify) {
          _console$6.log(`starting notifications for "${characteristicName}" characteristic`);
          await characteristic.startNotifications();
        }
        if (characteristicProperties.read) {
          _console$6.log(`reading "${characteristicName}" characteristic...`);
          await characteristic.readValue();
          if (isInBluefy || isInWebBLE) {
            _assertClassBrand(_WebBluetoothConnectionManager_brand, this, _onCharacteristicValueChanged).call(this, characteristic);
          }
        }
      }
    }
  }
  function _removeEventListeners() {
    if (this.device) {
      removeEventListeners(this.device, _classPrivateFieldGet2(_boundBluetoothDeviceEventListeners, this));
    }
    _classPrivateFieldGet2(_characteristics, this).forEach(characteristic => {
      removeEventListeners(characteristic, _classPrivateFieldGet2(_boundBluetoothCharacteristicEventListeners, this));
    });
  }
  function _onCharacteristicvaluechanged(event) {
    _console$6.log("oncharacteristicvaluechanged");
    const characteristic = event.target;
    _assertClassBrand(_WebBluetoothConnectionManager_brand, this, _onCharacteristicValueChanged).call(this, characteristic);
  }
  function _onCharacteristicValueChanged(characteristic) {
    _console$6.log("onCharacteristicValue");
    const characteristicName = characteristic._name;
    _console$6.assertWithError(characteristicName, `no name found for characteristic with uuid "${characteristic.uuid}"`);
    _console$6.log(`oncharacteristicvaluechanged for "${characteristicName}" characteristic`);
    const dataView = characteristic.value;
    _console$6.assertWithError(dataView, `no data found for "${characteristicName}" characteristic`);
    _console$6.log(`data for "${characteristicName}" characteristic`, Array.from(new Uint8Array(dataView.buffer)));
    try {
      this.onCharacteristicValueChanged(characteristicName, dataView);
    } catch (error) {
      _console$6.error(error);
    }
  }
  function _onGattserverdisconnected(event) {
    _console$6.log("gattserverdisconnected");
    this.status = "not connected";
  }

  /*
   * The MIT License (MIT)
   *
   * Copyright (c) 2014-2016 Patrick Gansterer <paroga@paroga.com>
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in all
   * copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   * SOFTWARE.
   */

  const POW_2_24 = 5.960464477539063e-8;
  const POW_2_32 = 4294967296;
  const POW_2_53 = 9007199254740992;
  function encode(value) {
    let data = new ArrayBuffer(256);
    let dataView = new DataView(data);
    let lastLength;
    let offset = 0;
    function prepareWrite(length) {
      let newByteLength = data.byteLength;
      const requiredLength = offset + length;
      while (newByteLength < requiredLength) {
        newByteLength <<= 1;
      }
      if (newByteLength !== data.byteLength) {
        const oldDataView = dataView;
        data = new ArrayBuffer(newByteLength);
        dataView = new DataView(data);
        const uint32count = offset + 3 >> 2;
        for (let i = 0; i < uint32count; ++i) {
          dataView.setUint32(i << 2, oldDataView.getUint32(i << 2));
        }
      }
      lastLength = length;
      return dataView;
    }
    function commitWrite() {
      offset += lastLength;
    }
    function writeFloat64(value) {
      commitWrite(prepareWrite(8).setFloat64(offset, value));
    }
    function writeUint8(value) {
      commitWrite(prepareWrite(1).setUint8(offset, value));
    }
    function writeUint8Array(value) {
      const dataView = prepareWrite(value.length);
      for (let i = 0; i < value.length; ++i) {
        dataView.setUint8(offset + i, value[i]);
      }
      commitWrite();
    }
    function writeUint16(value) {
      commitWrite(prepareWrite(2).setUint16(offset, value));
    }
    function writeUint32(value) {
      commitWrite(prepareWrite(4).setUint32(offset, value));
    }
    function writeUint64(value) {
      const low = value % POW_2_32;
      const high = (value - low) / POW_2_32;
      const dataView = prepareWrite(8);
      dataView.setUint32(offset, high);
      dataView.setUint32(offset + 4, low);
      commitWrite();
    }
    function writeTypeAndLength(type, length) {
      if (length < 24) {
        writeUint8(type << 5 | length);
      } else if (length < 0x100) {
        writeUint8(type << 5 | 24);
        writeUint8(length);
      } else if (length < 0x10000) {
        writeUint8(type << 5 | 25);
        writeUint16(length);
      } else if (length < 0x100000000) {
        writeUint8(type << 5 | 26);
        writeUint32(length);
      } else {
        writeUint8(type << 5 | 27);
        writeUint64(length);
      }
    }
    function encodeItem(value) {
      let i;
      const utf8data = [];
      let length;
      if (value === false) {
        return writeUint8(0xf4);
      }
      if (value === true) {
        return writeUint8(0xf5);
      }
      if (value === null) {
        return writeUint8(0xf6);
      }
      if (value === undefined) {
        return writeUint8(0xf7);
      }
      switch (typeof value) {
        case "number":
          if (Math.floor(value) === value) {
            if (value >= 0 && value <= POW_2_53) {
              return writeTypeAndLength(0, value);
            }
            if (-POW_2_53 <= value && value < 0) {
              return writeTypeAndLength(1, -(value + 1));
            }
          }
          writeUint8(0xfb);
          return writeFloat64(value);
        case "string":
          for (i = 0; i < value.length; ++i) {
            let charCode = value.charCodeAt(i);
            if (charCode < 0x80) {
              utf8data.push(charCode);
            } else if (charCode < 0x800) {
              utf8data.push(0xc0 | charCode >> 6);
              utf8data.push(0x80 | charCode & 0x3f);
            } else if (charCode < 0xd800) {
              utf8data.push(0xe0 | charCode >> 12);
              utf8data.push(0x80 | charCode >> 6 & 0x3f);
              utf8data.push(0x80 | charCode & 0x3f);
            } else {
              charCode = (charCode & 0x3ff) << 10;
              charCode |= value.charCodeAt(++i) & 0x3ff;
              charCode += 0x10000;
              utf8data.push(0xf0 | charCode >> 18);
              utf8data.push(0x80 | charCode >> 12 & 0x3f);
              utf8data.push(0x80 | charCode >> 6 & 0x3f);
              utf8data.push(0x80 | charCode & 0x3f);
            }
          }
          writeTypeAndLength(3, utf8data.length);
          return writeUint8Array(utf8data);
        default:
          if (Array.isArray(value)) {
            length = value.length;
            writeTypeAndLength(4, length);
            for (i = 0; i < length; ++i) {
              encodeItem(value[i]);
            }
          } else if (value instanceof Uint8Array) {
            writeTypeAndLength(2, value.length);
            writeUint8Array(value);
          } else {
            const keys = Object.keys(value);
            length = keys.length;
            writeTypeAndLength(5, length);
            for (i = 0; i < length; ++i) {
              const key = keys[i];
              encodeItem(key);
              encodeItem(value[key]);
            }
          }
      }
    }
    encodeItem(value);
    if ("slice" in data) {
      return data.slice(0, offset);
    }
    const ret = new ArrayBuffer(offset);
    const retView = new DataView(ret);
    for (let i = 0; i < offset; ++i) {
      retView.setUint8(i, dataView.getUint8(i));
    }
    return ret;
  }
  function decode(data, tagger, simpleValue) {
    const dataView = new DataView(data);
    let offset = 0;
    if (typeof tagger !== "function") {
      tagger = function (value) {
        return value;
      };
    }
    if (typeof simpleValue !== "function") {
      simpleValue = function () {
        return undefined;
      };
    }
    function commitRead(length, value) {
      offset += length;
      return value;
    }
    function readArrayBuffer(length) {
      return commitRead(length, new Uint8Array(data, offset, length));
    }
    function readFloat16() {
      const tempArrayBuffer = new ArrayBuffer(4);
      const tempDataView = new DataView(tempArrayBuffer);
      const value = readUint16();
      const sign = value & 0x8000;
      let exponent = value & 0x7c00;
      const fraction = value & 0x03ff;
      if (exponent === 0x7c00) {
        exponent = 0xff << 10;
      } else if (exponent !== 0) {
        exponent += 127 - 15 << 10;
      } else if (fraction !== 0) {
        return (sign ? -1 : 1) * fraction * POW_2_24;
      }
      tempDataView.setUint32(0, sign << 16 | exponent << 13 | fraction << 13);
      return tempDataView.getFloat32(0);
    }
    function readFloat32() {
      return commitRead(4, dataView.getFloat32(offset));
    }
    function readFloat64() {
      return commitRead(8, dataView.getFloat64(offset));
    }
    function readUint8() {
      return commitRead(1, dataView.getUint8(offset));
    }
    function readUint16() {
      return commitRead(2, dataView.getUint16(offset));
    }
    function readUint32() {
      return commitRead(4, dataView.getUint32(offset));
    }
    function readUint64() {
      return readUint32() * POW_2_32 + readUint32();
    }
    function readBreak() {
      if (dataView.getUint8(offset) !== 0xff) {
        return false;
      }
      offset += 1;
      return true;
    }
    function readLength(additionalInformation) {
      if (additionalInformation < 24) {
        return additionalInformation;
      }
      if (additionalInformation === 24) {
        return readUint8();
      }
      if (additionalInformation === 25) {
        return readUint16();
      }
      if (additionalInformation === 26) {
        return readUint32();
      }
      if (additionalInformation === 27) {
        return readUint64();
      }
      if (additionalInformation === 31) {
        return -1;
      }
      throw new Error("Invalid length encoding");
    }
    function readIndefiniteStringLength(majorType) {
      const initialByte = readUint8();
      if (initialByte === 0xff) {
        return -1;
      }
      const length = readLength(initialByte & 0x1f);
      if (length < 0 || initialByte >> 5 !== majorType) {
        throw new Error("Invalid indefinite length element");
      }
      return length;
    }
    function appendUtf16Data(utf16data, length) {
      for (let i = 0; i < length; ++i) {
        let value = readUint8();
        if (value & 0x80) {
          if (value < 0xe0) {
            value = (value & 0x1f) << 6 | readUint8() & 0x3f;
            length -= 1;
          } else if (value < 0xf0) {
            value = (value & 0x0f) << 12 | (readUint8() & 0x3f) << 6 | readUint8() & 0x3f;
            length -= 2;
          } else {
            value = (value & 0x0f) << 18 | (readUint8() & 0x3f) << 12 | (readUint8() & 0x3f) << 6 | readUint8() & 0x3f;
            length -= 3;
          }
        }
        if (value < 0x10000) {
          utf16data.push(value);
        } else {
          value -= 0x10000;
          utf16data.push(0xd800 | value >> 10);
          utf16data.push(0xdc00 | value & 0x3ff);
        }
      }
    }
    function decodeItem() {
      const initialByte = readUint8();
      const majorType = initialByte >> 5;
      const additionalInformation = initialByte & 0x1f;
      let i;
      let length;
      if (majorType === 7) {
        switch (additionalInformation) {
          case 25:
            return readFloat16();
          case 26:
            return readFloat32();
          case 27:
            return readFloat64();
        }
      }
      length = readLength(additionalInformation);
      if (length < 0 && (majorType < 2 || majorType > 6)) {
        throw new Error("Invalid length");
      }
      const utf16data = [];
      let retArray;
      const retObject = {};
      switch (majorType) {
        case 0:
          return length;
        case 1:
          return -1 - length;
        case 2:
          if (length < 0) {
            const elements = [];
            let fullArrayLength = 0;
            while ((length = readIndefiniteStringLength(majorType)) >= 0) {
              fullArrayLength += length;
              elements.push(readArrayBuffer(length));
            }
            const fullArray = new Uint8Array(fullArrayLength);
            let fullArrayOffset = 0;
            for (i = 0; i < elements.length; ++i) {
              fullArray.set(elements[i], fullArrayOffset);
              fullArrayOffset += elements[i].length;
            }
            return fullArray;
          }
          return readArrayBuffer(length);
        case 3:
          if (length < 0) {
            while ((length = readIndefiniteStringLength(majorType)) >= 0) {
              appendUtf16Data(utf16data, length);
            }
          } else {
            appendUtf16Data(utf16data, length);
          }
          return String.fromCharCode.apply(null, utf16data);
        case 4:
          if (length < 0) {
            retArray = [];
            while (!readBreak()) {
              retArray.push(decodeItem());
            }
          } else {
            retArray = new Array(length);
            for (i = 0; i < length; ++i) {
              retArray[i] = decodeItem();
            }
          }
          return retArray;
        case 5:
          for (i = 0; i < length || length < 0 && !readBreak(); ++i) {
            const key = decodeItem();
            retObject[key] = decodeItem();
          }
          return retObject;
        case 6:
          return tagger(decodeItem(), length);
        case 7:
          switch (length) {
            case 20:
              return false;
            case 21:
              return true;
            case 22:
              return null;
            case 23:
              return undefined;
            default:
              return simpleValue(length);
          }
      }
    }
    const ret = decodeItem();
    if (offset !== data.byteLength) {
      throw new Error("Remaining bytes");
    }
    return ret;
  }
  const CBOR = {
    encode,
    decode
  };

  /*
   * The MIT License (MIT)
   *
   * Copyright (c) 2023 Laird Connectivity
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in all
   * copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   * SOFTWARE.
   */

  const _console$5 = createConsole("mcumgr", {
    log: true
  });
  const constants = {
    // Opcodes
    MGMT_OP_READ: 0,
    MGMT_OP_READ_RSP: 1,
    MGMT_OP_WRITE: 2,
    MGMT_OP_WRITE_RSP: 3,
    // Groups
    MGMT_GROUP_ID_OS: 0,
    MGMT_GROUP_ID_IMAGE: 1,
    MGMT_GROUP_ID_STAT: 2,
    MGMT_GROUP_ID_CONFIG: 3,
    MGMT_GROUP_ID_LOG: 4,
    MGMT_GROUP_ID_CRASH: 5,
    MGMT_GROUP_ID_SPLIT: 6,
    MGMT_GROUP_ID_RUN: 7,
    MGMT_GROUP_ID_FS: 8,
    MGMT_GROUP_ID_SHELL: 9,
    // OS group
    OS_MGMT_ID_ECHO: 0,
    OS_MGMT_ID_CONS_ECHO_CTRL: 1,
    OS_MGMT_ID_TASKSTAT: 2,
    OS_MGMT_ID_MPSTAT: 3,
    OS_MGMT_ID_DATETIME_STR: 4,
    OS_MGMT_ID_RESET: 5,
    // Image group
    IMG_MGMT_ID_STATE: 0,
    IMG_MGMT_ID_UPLOAD: 1,
    IMG_MGMT_ID_FILE: 2,
    IMG_MGMT_ID_CORELIST: 3,
    IMG_MGMT_ID_CORELOAD: 4,
    IMG_MGMT_ID_ERASE: 5,
    // Filesystem group
    FS_MGMT_ID_FILE: 0
  };
  class MCUManager {
    constructor() {
      this._mtu = 256;
      this._messageCallback = null;
      this._imageUploadProgressCallback = null;
      this._imageUploadNextCallback = null;
      this._fileUploadProgressCallback = null;
      this._fileUploadNextCallback = null;
      this._uploadIsInProgress = false;
      this._downloadIsInProgress = false;
      this._buffer = new Uint8Array();
      this._seq = 0;
    }
    onMessage(callback) {
      this._messageCallback = callback;
      return this;
    }
    onImageUploadNext(callback) {
      this._imageUploadNextCallback = callback;
      return this;
    }
    onImageUploadProgress(callback) {
      this._imageUploadProgressCallback = callback;
      return this;
    }
    onImageUploadFinished(callback) {
      this._imageUploadFinishedCallback = callback;
      return this;
    }
    onFileUploadNext(callback) {
      this._fileUploadNextCallback = callback;
      return this;
    }
    onFileUploadProgress(callback) {
      this._fileUploadProgressCallback = callback;
      return this;
    }
    onFileUploadFinished(callback) {
      this._fileUploadFinishedCallback = callback;
      return this;
    }
    onFileDownloadNext(callback) {
      this._fileDownloadNextCallback = callback;
      return this;
    }
    onFileDownloadProgress(callback) {
      this._fileDownloadProgressCallback = callback;
      return this;
    }
    onFileDownloadFinished(callback) {
      this._fileDownloadFinishedCallback = callback;
      return this;
    }
    _getMessage(op, group, id, data) {
      const _flags = 0;
      let encodedData = [];
      if (typeof data !== "undefined") {
        encodedData = [...new Uint8Array(CBOR.encode(data))];
      }
      const lengthLo = encodedData.length & 255;
      const lengthHi = encodedData.length >> 8;
      const groupLo = group & 255;
      const groupHi = group >> 8;
      const message = [op, _flags, lengthHi, lengthLo, groupHi, groupLo, this._seq, id, ...encodedData];
      this._seq = (this._seq + 1) % 256;
      return message;
    }
    _notification(buffer) {
      _console$5.log("mcumgr - message received");
      const message = new Uint8Array(buffer);
      this._buffer = new Uint8Array([...this._buffer, ...message]);
      const messageLength = this._buffer[2] * 256 + this._buffer[3];
      if (this._buffer.length < messageLength + 8) return;
      this._processMessage(this._buffer.slice(0, messageLength + 8));
      this._buffer = this._buffer.slice(messageLength + 8);
    }
    _processMessage(message) {
      const [op,, lengthHi, lengthLo, groupHi, groupLo,, id] = message;
      const data = CBOR.decode(message.slice(8).buffer);
      const length = lengthHi * 256 + lengthLo;
      const group = groupHi * 256 + groupLo;
      _console$5.log("mcumgr - Process Message - Group: " + group + ", Id: " + id + ", Off: " + data.off);
      if (group === constants.MGMT_GROUP_ID_IMAGE && id === constants.IMG_MGMT_ID_UPLOAD && data.off) {
        this._uploadOffset = data.off;
        this._uploadNext();
        return;
      }
      if (op === constants.MGMT_OP_WRITE_RSP && group === constants.MGMT_GROUP_ID_FS && id === constants.FS_MGMT_ID_FILE && data.off) {
        this._uploadFileOffset = data.off;
        this._uploadFileNext();
        return;
      }
      if (op === constants.MGMT_OP_READ_RSP && group === constants.MGMT_GROUP_ID_FS && id === constants.FS_MGMT_ID_FILE) {
        this._downloadFileOffset += data.data.length;
        if (data.len != undefined) {
          this._downloadFileLength = data.len;
        }
        _console$5.log("downloaded " + this._downloadFileOffset + " bytes of " + this._downloadFileLength);
        if (this._downloadFileLength > 0) {
          this._fileDownloadProgressCallback({
            percentage: Math.floor(this._downloadFileOffset / this._downloadFileLength * 100)
          });
        }
        if (this._messageCallback) this._messageCallback({
          op,
          group,
          id,
          data,
          length
        });
        this._downloadFileNext();
        return;
      }
      if (this._messageCallback) this._messageCallback({
        op,
        group,
        id,
        data,
        length
      });
    }
    cmdReset() {
      return this._getMessage(constants.MGMT_OP_WRITE, constants.MGMT_GROUP_ID_OS, constants.OS_MGMT_ID_RESET);
    }
    smpEcho(message) {
      return this._getMessage(constants.MGMT_OP_WRITE, constants.MGMT_GROUP_ID_OS, constants.OS_MGMT_ID_ECHO, {
        d: message
      });
    }
    cmdImageState() {
      return this._getMessage(constants.MGMT_OP_READ, constants.MGMT_GROUP_ID_IMAGE, constants.IMG_MGMT_ID_STATE);
    }
    cmdImageErase() {
      return this._getMessage(constants.MGMT_OP_WRITE, constants.MGMT_GROUP_ID_IMAGE, constants.IMG_MGMT_ID_ERASE, {});
    }
    cmdImageTest(hash) {
      return this._getMessage(constants.MGMT_OP_WRITE, constants.MGMT_GROUP_ID_IMAGE, constants.IMG_MGMT_ID_STATE, {
        hash,
        confirm: false
      });
    }
    cmdImageConfirm(hash) {
      return this._getMessage(constants.MGMT_OP_WRITE, constants.MGMT_GROUP_ID_IMAGE, constants.IMG_MGMT_ID_STATE, {
        hash,
        confirm: true
      });
    }
    _hash(image) {
      return crypto.subtle.digest("SHA-256", image);
    }
    async _uploadNext() {
      if (!this._uploadImage) {
        return;
      }
      if (this._uploadOffset >= this._uploadImage.byteLength) {
        this._uploadIsInProgress = false;
        this._imageUploadFinishedCallback();
        return;
      }
      const nmpOverhead = 8;
      const message = {
        data: new Uint8Array(),
        off: this._uploadOffset
      };
      if (this._uploadOffset === 0) {
        message.len = this._uploadImage.byteLength;
        message.sha = new Uint8Array(await this._hash(this._uploadImage));
      }
      this._imageUploadProgressCallback({
        percentage: Math.floor(this._uploadOffset / this._uploadImage.byteLength * 100)
      });
      const length = this._mtu - CBOR.encode(message).byteLength - nmpOverhead - 3 - 5;
      message.data = new Uint8Array(this._uploadImage.slice(this._uploadOffset, this._uploadOffset + length));
      this._uploadOffset += length;
      const packet = this._getMessage(constants.MGMT_OP_WRITE, constants.MGMT_GROUP_ID_IMAGE, constants.IMG_MGMT_ID_UPLOAD, message);
      _console$5.log("mcumgr - _uploadNext: Message Length: " + packet.length);
      this._imageUploadNextCallback({
        packet
      });
    }
    async reset() {
      this._messageCallback = null;
      this._imageUploadProgressCallback = null;
      this._imageUploadNextCallback = null;
      this._fileUploadProgressCallback = null;
      this._fileUploadNextCallback = null;
      this._uploadIsInProgress = false;
      this._downloadIsInProgress = false;
      this._buffer = new Uint8Array();
      this._seq = 0;
    }
    async cmdUpload(image) {
      let slot = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      if (this._uploadIsInProgress) {
        _console$5.error("Upload is already in progress.");
        return;
      }
      this._uploadIsInProgress = true;
      this._uploadOffset = 0;
      this._uploadImage = image;
      this._uploadSlot = slot;
      this._uploadNext();
    }
    async cmdUploadFile(filebuf, destFilename) {
      if (this._uploadIsInProgress) {
        _console$5.error("Upload is already in progress.");
        return;
      }
      this._uploadIsInProgress = true;
      this._uploadFileOffset = 0;
      this._uploadFile = filebuf;
      this._uploadFilename = destFilename;
      this._uploadFileNext();
    }
    async _uploadFileNext() {
      _console$5.log("uploadFileNext - offset: " + this._uploadFileOffset + ", length: " + this._uploadFile.byteLength);
      if (this._uploadFileOffset >= this._uploadFile.byteLength) {
        this._uploadIsInProgress = false;
        this._fileUploadFinishedCallback();
        return;
      }
      const nmpOverhead = 8;
      const message = {
        data: new Uint8Array(),
        off: this._uploadFileOffset
      };
      if (this._uploadFileOffset === 0) {
        message.len = this._uploadFile.byteLength;
      }
      message.name = this._uploadFilename;
      this._fileUploadProgressCallback({
        percentage: Math.floor(this._uploadFileOffset / this._uploadFile.byteLength * 100)
      });
      const length = this._mtu - CBOR.encode(message).byteLength - nmpOverhead;
      message.data = new Uint8Array(this._uploadFile.slice(this._uploadFileOffset, this._uploadFileOffset + length));
      this._uploadFileOffset += length;
      const packet = this._getMessage(constants.MGMT_OP_WRITE, constants.MGMT_GROUP_ID_FS, constants.FS_MGMT_ID_FILE, message);
      _console$5.log("mcumgr - _uploadNext: Message Length: " + packet.length);
      this._fileUploadNextCallback({
        packet
      });
    }
    async cmdDownloadFile(filename, destFilename) {
      if (this._downloadIsInProgress) {
        _console$5.error("Download is already in progress.");
        return;
      }
      this._downloadIsInProgress = true;
      this._downloadFileOffset = 0;
      this._downloadFileLength = 0;
      this._downloadRemoteFilename = filename;
      this._downloadLocalFilename = destFilename;
      this._downloadFileNext();
    }
    async _downloadFileNext() {
      if (this._downloadFileLength > 0) {
        if (this._downloadFileOffset >= this._downloadFileLength) {
          this._downloadIsInProgress = false;
          this._fileDownloadFinishedCallback();
          return;
        }
      }
      const message = {
        off: this._downloadFileOffset
      };
      if (this._downloadFileOffset === 0) {
        message.name = this._downloadRemoteFilename;
      }
      const packet = this._getMessage(constants.MGMT_OP_READ, constants.MGMT_GROUP_ID_FS, constants.FS_MGMT_ID_FILE, message);
      _console$5.log("mcumgr - _downloadNext: Message Length: " + packet.length);
      this._fileDownloadNextCallback({
        packet
      });
    }
    async imageInfo(image) {
      const info = {};
      const view = new Uint8Array(image);

      // check header length
      if (view.length < 32) {
        throw new Error("Invalid image (too short file)");
      }

      // check MAGIC bytes 0x96f3b83d
      if (view[0] !== 0x3d || view[1] !== 0xb8 || view[2] !== 0xf3 || view[3] !== 0x96) {
        throw new Error("Invalid image (wrong magic bytes)");
      }

      // check load address is 0x00000000
      if (view[4] !== 0x00 || view[5] !== 0x00 || view[6] !== 0x00 || view[7] !== 0x00) {
        throw new Error("Invalid image (wrong load address)");
      }
      const headerSize = view[8] + view[9] * 2 ** 8;

      // check protected TLV area size is 0
      if (view[10] !== 0x00 || view[11] !== 0x00) {
        throw new Error("Invalid image (wrong protected TLV area size)");
      }
      const imageSize = view[12] + view[13] * 2 ** 8 + view[14] * 2 ** 16 + view[15] * 2 ** 24;
      info.imageSize = imageSize;

      // check image size is correct
      if (view.length < imageSize + headerSize) {
        throw new Error("Invalid image (wrong image size)");
      }

      // check flags is 0x00000000
      if (view[16] !== 0x00 || view[17] !== 0x00 || view[18] !== 0x00 || view[19] !== 0x00) {
        throw new Error("Invalid image (wrong flags)");
      }
      const version = `${view[20]}.${view[21]}.${view[22] + view[23] * 2 ** 8}`;
      info.version = version;
      info.hash = [...new Uint8Array(await this._hash(image.slice(0, imageSize + 32)))].map(b => b.toString(16).padStart(2, "0")).join("");
      return info;
    }
  }

  var _FirmwareManager;
  const _console$4 = createConsole("FirmwareManager", {
    log: true
  });
  var _FirmwareManager_brand = /*#__PURE__*/new WeakSet();
  var _status = /*#__PURE__*/new WeakMap();
  var _images = /*#__PURE__*/new WeakMap();
  var _mtu = /*#__PURE__*/new WeakMap();
  var _mcuManager = /*#__PURE__*/new WeakMap();
  class FirmwareManager {
    constructor() {
      _classPrivateMethodInitSpec(this, _FirmwareManager_brand);
      _defineProperty(this, "sendMessage", void 0);
      _defineProperty(this, "eventDispatcher", void 0);
      _classPrivateFieldInitSpec(this, _status, "idle");
      // COMMANDS

      _classPrivateFieldInitSpec(this, _images, void 0);
      // MTU

      _classPrivateFieldInitSpec(this, _mtu, void 0);
      // MCUManager

      _classPrivateFieldInitSpec(this, _mcuManager, new MCUManager());
      _assertClassBrand(_FirmwareManager_brand, this, _assignMcuManagerCallbacks).call(this);
    }
    static get MessageTypes() {
      return _assertClassBrand(FirmwareManager, this, _MessageTypes)._;
    }
    get messageTypes() {
      return FirmwareManager.MessageTypes;
    }

    // EVENT DISPATCHER

    static get EventTypes() {
      return _assertClassBrand(FirmwareManager, this, _EventTypes$2)._;
    }
    get eventTypes() {
      return _EventTypes$2._;
    }
    addEventListener(type, listener, options) {
      this.eventDispatcher.addEventListener(type, listener, options);
    }
    removeEventListener(type, listener) {
      return this.eventDispatcher.removeEventListener(type, listener);
    }
    waitForEvent(eventType) {
      return this.eventDispatcher.waitForEvent(eventType);
    }
    parseMessage(messageType, dataView) {
      _console$4.log({
        messageType
      });
      switch (messageType) {
        case "smp":
          _classPrivateFieldGet2(_mcuManager, this)._notification(Array.from(new Uint8Array(dataView.buffer)));
          _assertClassBrand(_FirmwareManager_brand, this, _dispatchEvent$2).call(this, {
            type: "smp"
          });
          break;
        default:
          throw Error(`uncaught messageType ${messageType}`);
      }
    }
    async uploadFirmware(file) {
      _console$4.log("uploadFirmware", file);
      const promise = this.waitForEvent("firmwareUploadComplete");
      await this.getImages();
      const arrayBuffer = await getFileBuffer(file);
      const imageInfo = await _classPrivateFieldGet2(_mcuManager, this).imageInfo(arrayBuffer);
      _console$4.log({
        imageInfo
      });
      _classPrivateFieldGet2(_mcuManager, this).cmdUpload(arrayBuffer, 1);
      _assertClassBrand(_FirmwareManager_brand, this, _updateStatus).call(this, "uploading");
      await promise;
    }
    static get Statuses() {
      return _assertClassBrand(FirmwareManager, this, _Statuses)._;
    }
    get status() {
      return _classPrivateFieldGet2(_status, this);
    }
    get images() {
      return _classPrivateFieldGet2(_images, this);
    }
    async getImages() {
      const promise = this.waitForEvent("firmwareImages");
      _console$4.log("getting firmware image state...");
      this.sendMessage(Uint8Array.from(_classPrivateFieldGet2(_mcuManager, this).cmdImageState()).buffer);
      await promise;
    }
    async testImage() {
      let imageIndex = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      _assertClassBrand(_FirmwareManager_brand, this, _assertValidImageIndex).call(this, imageIndex);
      _assertClassBrand(_FirmwareManager_brand, this, _assertImages).call(this);
      if (!_classPrivateFieldGet2(_images, this)[imageIndex]) {
        _console$4.log(`image ${imageIndex} not found`);
        return;
      }
      if (_classPrivateFieldGet2(_images, this)[imageIndex].pending == true) {
        _console$4.log(`image ${imageIndex} is already pending`);
        return;
      }
      if (_classPrivateFieldGet2(_images, this)[imageIndex].empty) {
        _console$4.log(`image ${imageIndex} is empty`);
        return;
      }
      const promise = this.waitForEvent("smp");
      _console$4.log("testing firmware image...");
      this.sendMessage(Uint8Array.from(_classPrivateFieldGet2(_mcuManager, this).cmdImageTest(_classPrivateFieldGet2(_images, this)[imageIndex].hash)).buffer);
      await promise;
    }
    async eraseImage() {
      _assertClassBrand(_FirmwareManager_brand, this, _assertImages).call(this);
      const promise = this.waitForEvent("smp");
      _console$4.log("erasing image...");
      this.sendMessage(Uint8Array.from(_classPrivateFieldGet2(_mcuManager, this).cmdImageErase()).buffer);
      _assertClassBrand(_FirmwareManager_brand, this, _updateStatus).call(this, "erasing");
      await promise;
      await this.getImages();
    }
    async confirmImage() {
      let imageIndex = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      _assertClassBrand(_FirmwareManager_brand, this, _assertValidImageIndex).call(this, imageIndex);
      _assertClassBrand(_FirmwareManager_brand, this, _assertImages).call(this);
      if (_classPrivateFieldGet2(_images, this)[imageIndex].confirmed === true) {
        _console$4.log(`image ${imageIndex} is already confirmed`);
        return;
      }
      const promise = this.waitForEvent("smp");
      _console$4.log("confirming image...");
      this.sendMessage(Uint8Array.from(_classPrivateFieldGet2(_mcuManager, this).cmdImageConfirm(_classPrivateFieldGet2(_images, this)[imageIndex].hash)).buffer);
      await promise;
    }
    async echo(string) {
      _console$4.assertTypeWithError(string, "string");
      const promise = this.waitForEvent("smp");
      _console$4.log("sending echo...");
      this.sendMessage(Uint8Array.from(_classPrivateFieldGet2(_mcuManager, this).smpEcho(string)).buffer);
      await promise;
    }
    async reset() {
      const promise = this.waitForEvent("smp");
      _console$4.log("resetting...");
      this.sendMessage(Uint8Array.from(_classPrivateFieldGet2(_mcuManager, this).cmdReset()).buffer);
      await promise;
    }
    get mtu() {
      return _classPrivateFieldGet2(_mtu, this);
    }
    set mtu(newMtu) {
      _classPrivateFieldSet2(_mtu, this, newMtu);
      _classPrivateFieldGet2(_mcuManager, this)._mtu = _classPrivateFieldGet2(_mtu, this);
    }
  }
  _FirmwareManager = FirmwareManager;
  function _dispatchEvent$2(event) {
    this.eventDispatcher.dispatchEvent(event);
  }
  function _updateStatus(newStatus) {
    _console$4.assertEnumWithError(newStatus, _FirmwareManager.Statuses);
    if (_classPrivateFieldGet2(_status, this) == newStatus) {
      _console$4.log(`redundant firmwareStatus assignment "${newStatus}"`);
      return;
    }
    _classPrivateFieldSet2(_status, this, newStatus);
    _console$4.log({
      firmwareStatus: _classPrivateFieldGet2(_status, this)
    });
    _assertClassBrand(_FirmwareManager_brand, this, _dispatchEvent$2).call(this, {
      type: "firmwareStatus",
      message: {
        firmwareStatus: _classPrivateFieldGet2(_status, this)
      }
    });
  }
  function _assertImages() {
    _console$4.assertWithError(_classPrivateFieldGet2(_images, this), "didn't get imageState");
  }
  function _assertValidImageIndex(imageIndex) {
    _console$4.assertTypeWithError(imageIndex, "number");
    _console$4.assertWithError(imageIndex == 0 || imageIndex == 1, "imageIndex must be 0 or 1");
  }
  function _assignMcuManagerCallbacks() {
    _classPrivateFieldGet2(_mcuManager, this).onMessage(_assertClassBrand(_FirmwareManager_brand, this, _onMcuMessage).bind(this));
    _classPrivateFieldGet2(_mcuManager, this).onFileDownloadNext(_assertClassBrand(_FirmwareManager_brand, this, _onMcuFileDownloadNext));
    _classPrivateFieldGet2(_mcuManager, this).onFileDownloadProgress(_assertClassBrand(_FirmwareManager_brand, this, _onMcuFileDownloadProgress).bind(this));
    _classPrivateFieldGet2(_mcuManager, this).onFileDownloadFinished(_assertClassBrand(_FirmwareManager_brand, this, _onMcuFileDownloadFinished).bind(this));
    _classPrivateFieldGet2(_mcuManager, this).onFileUploadNext(_assertClassBrand(_FirmwareManager_brand, this, _onMcuFileUploadNext).bind(this));
    _classPrivateFieldGet2(_mcuManager, this).onFileUploadProgress(_assertClassBrand(_FirmwareManager_brand, this, _onMcuFileUploadProgress).bind(this));
    _classPrivateFieldGet2(_mcuManager, this).onFileUploadFinished(_assertClassBrand(_FirmwareManager_brand, this, _onMcuFileUploadFinished).bind(this));
    _classPrivateFieldGet2(_mcuManager, this).onImageUploadNext(_assertClassBrand(_FirmwareManager_brand, this, _onMcuImageUploadNext).bind(this));
    _classPrivateFieldGet2(_mcuManager, this).onImageUploadProgress(_assertClassBrand(_FirmwareManager_brand, this, _onMcuImageUploadProgress).bind(this));
    _classPrivateFieldGet2(_mcuManager, this).onImageUploadFinished(_assertClassBrand(_FirmwareManager_brand, this, _onMcuImageUploadFinished).bind(this));
  }
  function _onMcuMessage(_ref) {
    let {
      op,
      group,
      id,
      data,
      length
    } = _ref;
    _console$4.log("onMcuMessage", ...arguments);
    switch (group) {
      case constants.MGMT_GROUP_ID_OS:
        switch (id) {
          case constants.OS_MGMT_ID_ECHO:
            _console$4.log(`echo "${data.r}"`);
            break;
          case constants.OS_MGMT_ID_TASKSTAT:
            _console$4.table(data.tasks);
            break;
          case constants.OS_MGMT_ID_MPSTAT:
            _console$4.log(data);
            break;
        }
        break;
      case constants.MGMT_GROUP_ID_IMAGE:
        switch (id) {
          case constants.IMG_MGMT_ID_STATE:
            _assertClassBrand(_FirmwareManager_brand, this, _onMcuImageState).call(this, data);
        }
        break;
      default:
        throw Error(`uncaught mcuMessage group ${group}`);
    }
  }
  function _onMcuFileDownloadNext() {
    _console$4.log("onMcuFileDownloadNext", ...arguments);
  }
  function _onMcuFileDownloadProgress() {
    _console$4.log("onMcuFileDownloadProgress", ...arguments);
  }
  function _onMcuFileDownloadFinished() {
    _console$4.log("onMcuFileDownloadFinished", ...arguments);
  }
  function _onMcuFileUploadNext() {
    _console$4.log("onMcuFileUploadNext", ...arguments);
  }
  function _onMcuFileUploadProgress() {
    _console$4.log("onMcuFileUploadProgress", ...arguments);
  }
  function _onMcuFileUploadFinished() {
    _console$4.log("onMcuFileUploadFinished", ...arguments);
  }
  function _onMcuImageUploadNext(_ref2) {
    let {
      packet
    } = _ref2;
    _console$4.log("onMcuImageUploadNext", ...arguments);
    this.sendMessage(Uint8Array.from(packet).buffer);
  }
  function _onMcuImageUploadProgress(_ref3) {
    let {
      percentage
    } = _ref3;
    const progress = percentage / 100;
    _console$4.log("onMcuImageUploadProgress", ...arguments);
    _assertClassBrand(_FirmwareManager_brand, this, _dispatchEvent$2).call(this, {
      type: "firmwareUploadProgress",
      message: {
        firmwareUploadProgress: progress
      }
    });
  }
  async function _onMcuImageUploadFinished() {
    _console$4.log("onMcuImageUploadFinished", ...arguments);
    await this.getImages();
    _assertClassBrand(_FirmwareManager_brand, this, _dispatchEvent$2).call(this, {
      type: "firmwareUploadProgress",
      message: {
        firmwareUploadProgress: 100
      }
    });
    _assertClassBrand(_FirmwareManager_brand, this, _dispatchEvent$2).call(this, {
      type: "firmwareUploadComplete"
    });
  }
  function _onMcuImageState(data) {
    if (data.images) {
      _classPrivateFieldSet2(_images, this, data.images);
      _console$4.log("images", _classPrivateFieldGet2(_images, this));
    } else {
      _console$4.log("no images found");
      return;
    }
    let newStatus = "idle";
    if (_classPrivateFieldGet2(_images, this).length == 2) {
      if (!_classPrivateFieldGet2(_images, this)[1].bootable) {
        _console$4.warn('Slot 1 has a invalid image. Click "Erase Image" to erase it or upload a different image');
      } else if (!_classPrivateFieldGet2(_images, this)[0].confirmed) {
        _console$4.log('Slot 0 has a valid image. Click "Confirm Image" to confirm it or wait and the device will swap images back.');
        newStatus = "testing";
      } else {
        if (_classPrivateFieldGet2(_images, this)[1].pending) {
          _console$4.log("reset to upload to the new firmware image");
          newStatus = "pending";
        } else {
          _console$4.log("Slot 1 has a valid image. run testImage() to test it or upload a different image.");
          newStatus = "uploaded";
        }
      }
    }
    if (_classPrivateFieldGet2(_images, this).length == 1) {
      _classPrivateFieldGet2(_images, this).push({
        slot: 1,
        empty: true,
        version: "Empty",
        pending: false,
        confirmed: false,
        bootable: false
      });
      _console$4.log("Select a firmware upload image to upload to slot 1.");
    }
    _assertClassBrand(_FirmwareManager_brand, this, _updateStatus).call(this, newStatus);
    _assertClassBrand(_FirmwareManager_brand, this, _dispatchEvent$2).call(this, {
      type: "firmwareImages",
      message: {
        firmwareImages: _classPrivateFieldGet2(_images, this)
      }
    });
  }
  var _MessageTypes = {
    _: ["smp"]
  };
  var _EventTypes$2 = {
    _: [..._assertClassBrand(_FirmwareManager, _FirmwareManager, _MessageTypes)._, "firmwareImages", "firmwareUploadProgress", "firmwareUploadComplete", "firmwareStatus"]
  };
  var _Statuses = {
    _: ["idle", "uploading", "uploaded", "pending", "testing", "erasing"]
  };

  var _Device;
  const _console$3 = createConsole("Device", {
    log: true
  });
  var _eventDispatcher$1 = /*#__PURE__*/new WeakMap();
  var _Device_brand = /*#__PURE__*/new WeakSet();
  var _connectionManager = /*#__PURE__*/new WeakMap();
  var _isConnected = /*#__PURE__*/new WeakMap();
  var _reconnectOnDisconnection = /*#__PURE__*/new WeakMap();
  var _reconnectIntervalId = /*#__PURE__*/new WeakMap();
  var _deviceInformationManager = /*#__PURE__*/new WeakMap();
  var _batteryLevel = /*#__PURE__*/new WeakMap();
  var _informationManager = /*#__PURE__*/new WeakMap();
  var _sensorConfigurationManager = /*#__PURE__*/new WeakMap();
  var _clearSensorConfigurationOnLeave = /*#__PURE__*/new WeakMap();
  var _sensorDataManager$1 = /*#__PURE__*/new WeakMap();
  var _vibrationManager = /*#__PURE__*/new WeakMap();
  var _fileTransferManager = /*#__PURE__*/new WeakMap();
  var _tfliteManager = /*#__PURE__*/new WeakMap();
  var _firmwareManager = /*#__PURE__*/new WeakMap();
  class Device {
    get bluetoothId() {
      var _classPrivateFieldGet2$1;
      return (_classPrivateFieldGet2$1 = _classPrivateFieldGet2(_connectionManager, this)) === null || _classPrivateFieldGet2$1 === void 0 ? void 0 : _classPrivateFieldGet2$1.bluetoothId;
    }
    constructor() {
      _classPrivateMethodInitSpec(this, _Device_brand);
      _classPrivateFieldInitSpec(this, _eventDispatcher$1, new EventDispatcher(this, this.eventTypes));
      // CONNECTION MANAGER

      _classPrivateFieldInitSpec(this, _connectionManager, void 0);
      _classPrivateFieldInitSpec(this, _isConnected, false);
      _classPrivateFieldInitSpec(this, _reconnectOnDisconnection, Device.ReconnectOnDisconnection);
      _classPrivateFieldInitSpec(this, _reconnectIntervalId, void 0);
      _defineProperty(this, "latestConnectionMessage", new Map());
      // DEVICE INFORMATION

      _classPrivateFieldInitSpec(this, _deviceInformationManager, new DeviceInformationManager());
      // BATTERY LEVEL

      _classPrivateFieldInitSpec(this, _batteryLevel, 0);
      // INFORMATION
      _classPrivateFieldInitSpec(this, _informationManager, new InformationManager());
      // SENSOR CONFIGURATION

      _classPrivateFieldInitSpec(this, _sensorConfigurationManager, new SensorConfigurationManager());
      _classPrivateFieldInitSpec(this, _clearSensorConfigurationOnLeave, Device.ClearSensorConfigurationOnLeave);
      // SENSOR DATA

      _classPrivateFieldInitSpec(this, _sensorDataManager$1, new SensorDataManager());
      // VIBRATION

      _classPrivateFieldInitSpec(this, _vibrationManager, new VibrationManager());
      // FILE TRANSFER

      _classPrivateFieldInitSpec(this, _fileTransferManager, new FileTransferManager());
      _classPrivateFieldInitSpec(this, _tfliteManager, new TfliteManager$1());
      // FIRMWARE MANAGER

      _classPrivateFieldInitSpec(this, _firmwareManager, new FirmwareManager());
      _classPrivateFieldGet2(_deviceInformationManager, this).eventDispatcher = _classPrivateFieldGet2(_eventDispatcher$1, this);
      _classPrivateFieldGet2(_informationManager, this).sendMessage = _assertClassBrand(_Device_brand, this, _sendTxMessages).bind(this);
      _classPrivateFieldGet2(_informationManager, this).eventDispatcher = _classPrivateFieldGet2(_eventDispatcher$1, this);
      _classPrivateFieldGet2(_sensorConfigurationManager, this).sendMessage = _assertClassBrand(_Device_brand, this, _sendTxMessages).bind(this);
      _classPrivateFieldGet2(_sensorConfigurationManager, this).eventDispatcher = _classPrivateFieldGet2(_eventDispatcher$1, this);
      _classPrivateFieldGet2(_sensorDataManager$1, this).sendMessage = _assertClassBrand(_Device_brand, this, _sendTxMessages).bind(this);
      _classPrivateFieldGet2(_sensorDataManager$1, this).eventDispatcher = _classPrivateFieldGet2(_eventDispatcher$1, this);
      _classPrivateFieldGet2(_vibrationManager, this).sendMessage = _assertClassBrand(_Device_brand, this, _sendTxMessages).bind(this);
      _classPrivateFieldGet2(_tfliteManager, this).sendMessage = _assertClassBrand(_Device_brand, this, _sendTxMessages).bind(this);
      _classPrivateFieldGet2(_tfliteManager, this).eventDispatcher = _classPrivateFieldGet2(_eventDispatcher$1, this);
      _classPrivateFieldGet2(_fileTransferManager, this).sendMessage = _assertClassBrand(_Device_brand, this, _sendTxMessages).bind(this);
      _classPrivateFieldGet2(_fileTransferManager, this).eventDispatcher = _classPrivateFieldGet2(_eventDispatcher$1, this);
      _classPrivateFieldGet2(_firmwareManager, this).sendMessage = _assertClassBrand(_Device_brand, this, _sendSmpMessage).bind(this);
      _classPrivateFieldGet2(_firmwareManager, this).eventDispatcher = _classPrivateFieldGet2(_eventDispatcher$1, this);
      this.addEventListener("getMtu", () => {
        _classPrivateFieldGet2(_firmwareManager, this).mtu = this.mtu;
        _classPrivateFieldGet2(_fileTransferManager, this).mtu = this.mtu;
        this.connectionManager.mtu = this.mtu;
      });
      this.addEventListener("getType", () => {
        if (_UseLocalStorage._) {
          _UpdateLocalStorageConfigurationForDevice.call(Device, this);
        }
      });
      if (isInBrowser) {
        window.addEventListener("beforeunload", () => {
          if (this.isConnected && this.clearSensorConfigurationOnLeave) {
            this.clearSensorConfiguration();
          }
        });
      }
      if (isInNode) {
        process.on("exit", () => {
          if (this.isConnected && this.clearSensorConfigurationOnLeave) {
            this.clearSensorConfiguration();
          }
        });
      }
      this.addEventListener("isConnected", () => {
        _OnDeviceIsConnected.call(Device, this);
      });
    }
    static get EventTypes() {
      return _assertClassBrand(Device, this, _EventTypes$1)._;
    }
    get eventTypes() {
      return _EventTypes$1._;
    }
    addEventListener(type, listener, options) {
      _classPrivateFieldGet2(_eventDispatcher$1, this).addEventListener(type, listener, options);
    }
    removeEventListener(type, listener) {
      return _classPrivateFieldGet2(_eventDispatcher$1, this).removeEventListener(type, listener);
    }
    waitForEvent(type) {
      return _classPrivateFieldGet2(_eventDispatcher$1, this).waitForEvent(type);
    }
    get connectionManager() {
      return _classPrivateFieldGet2(_connectionManager, this);
    }
    set connectionManager(newConnectionManager) {
      if (this.connectionManager == newConnectionManager) {
        _console$3.log("same connectionManager is already assigned");
        return;
      }
      if (this.connectionManager) {
        this.connectionManager.onStatusUpdated = null;
        this.connectionManager.onMessageReceived = null;
      }
      if (newConnectionManager) {
        newConnectionManager.onStatusUpdated = _assertClassBrand(_Device_brand, this, _onConnectionStatusUpdated).bind(this);
        newConnectionManager.onMessageReceived = _assertClassBrand(_Device_brand, this, _onConnectionMessageReceived).bind(this);
      }
      _classPrivateFieldSet2(_connectionManager, this, newConnectionManager);
      _console$3.log("assigned new connectionManager", _classPrivateFieldGet2(_connectionManager, this));
    }
    async connect() {
      if (!this.connectionManager) {
        this.connectionManager = new (_get_DefaultConnectionManager())();
      }
      _assertClassBrand(_Device_brand, this, _clear).call(this);
      return this.connectionManager.connect();
    }
    get isConnected() {
      return _classPrivateFieldGet2(_isConnected, this);
    }
    get canReconnect() {
      var _this$connectionManag;
      return (_this$connectionManag = this.connectionManager) === null || _this$connectionManag === void 0 ? void 0 : _this$connectionManag.canReconnect;
    }
    async reconnect() {
      var _this$connectionManag2;
      _assertClassBrand(_Device_brand, this, _clear).call(this);
      return (_this$connectionManag2 = this.connectionManager) === null || _this$connectionManag2 === void 0 ? void 0 : _this$connectionManag2.reconnect();
    }
    static get ReconnectOnDisconnection() {
      return _assertClassBrand(Device, this, _ReconnectOnDisconnection)._;
    }
    static set ReconnectOnDisconnection(newReconnectOnDisconnection) {
      _console$3.assertTypeWithError(newReconnectOnDisconnection, "boolean");
      _ReconnectOnDisconnection._ = _assertClassBrand(Device, this, newReconnectOnDisconnection);
    }
    get reconnectOnDisconnection() {
      return _classPrivateFieldGet2(_reconnectOnDisconnection, this);
    }
    set reconnectOnDisconnection(newReconnectOnDisconnection) {
      _console$3.assertTypeWithError(newReconnectOnDisconnection, "boolean");
      _classPrivateFieldSet2(_reconnectOnDisconnection, this, newReconnectOnDisconnection);
    }
    get connectionType() {
      var _this$connectionManag3;
      return (_this$connectionManag3 = this.connectionManager) === null || _this$connectionManag3 === void 0 ? void 0 : _this$connectionManag3.type;
    }
    async disconnect() {
      _assertClassBrand(_Device_brand, this, _assertIsConnected).call(this);
      if (this.reconnectOnDisconnection) {
        this.reconnectOnDisconnection = false;
        this.addEventListener("isConnected", () => {
          this.reconnectOnDisconnection = true;
        }, {
          once: true
        });
      }
      return this.connectionManager.disconnect();
    }
    toggleConnection() {
      if (this.isConnected) {
        this.disconnect();
      } else if (this.canReconnect) {
        this.reconnect();
      } else {
        this.connect();
      }
    }
    get connectionStatus() {
      var _classPrivateFieldGet3;
      switch ((_classPrivateFieldGet3 = _classPrivateFieldGet2(_connectionManager, this)) === null || _classPrivateFieldGet3 === void 0 ? void 0 : _classPrivateFieldGet3.status) {
        case "connected":
          return this.isConnected ? "connected" : "connecting";
        case "not connected":
        case "connecting":
        case "disconnecting":
          return _classPrivateFieldGet2(_connectionManager, this).status;
        default:
          return "not connected";
      }
    }
    get isConnectionBusy() {
      return this.connectionStatus == "connecting" || this.connectionStatus == "disconnecting";
    }
    get deviceInformation() {
      return _classPrivateFieldGet2(_deviceInformationManager, this).information;
    }
    get batteryLevel() {
      return _classPrivateFieldGet2(_batteryLevel, this);
    }
    get id() {
      return _classPrivateFieldGet2(_informationManager, this).id;
    }
    get isCharging() {
      return _classPrivateFieldGet2(_informationManager, this).isCharging;
    }
    get batteryCurrent() {
      return _classPrivateFieldGet2(_informationManager, this).batteryCurrent;
    }
    async getBatteryCurrent() {
      await _classPrivateFieldGet2(_informationManager, this).getBatteryCurrent();
    }
    static get MinNameLength() {
      return InformationManager.MinNameLength;
    }
    static get MaxNameLength() {
      return InformationManager.MaxNameLength;
    }
    get name() {
      return _classPrivateFieldGet2(_informationManager, this).name;
    }
    async setName(newName) {
      await _classPrivateFieldGet2(_informationManager, this).setName(newName);
    }
    static get Types() {
      return InformationManager.Types;
    }
    get type() {
      return _classPrivateFieldGet2(_informationManager, this).type;
    }
    async setType(newType) {
      await _classPrivateFieldGet2(_informationManager, this).setType(newType);
    }
    static get InsoleSides() {
      return InformationManager.InsoleSides;
    }
    get isInsole() {
      return _classPrivateFieldGet2(_informationManager, this).isInsole;
    }
    get insoleSide() {
      return _classPrivateFieldGet2(_informationManager, this).insoleSide;
    }
    get mtu() {
      return _classPrivateFieldGet2(_informationManager, this).mtu;
    }

    // SENSOR TYPES
    static get SensorTypes() {
      return SensorDataManager.Types;
    }
    static get ContinuousSensorTypes() {
      return SensorDataManager.ContinuousTypes;
    }
    get sensorTypes() {
      return Object.keys(this.sensorConfiguration);
    }
    get continuousSensorTypes() {
      return this.sensorTypes.filter(sensorType => Device.ContinuousSensorTypes.includes(sensorType));
    }
    get sensorConfiguration() {
      return _classPrivateFieldGet2(_sensorConfigurationManager, this).configuration;
    }
    static get MaxSensorRate() {
      return SensorConfigurationManager.MaxSensorRate;
    }
    static get SensorRateStep() {
      return SensorConfigurationManager.SensorRateStep;
    }
    async setSensorConfiguration(newSensorConfiguration) {
      await _classPrivateFieldGet2(_sensorConfigurationManager, this).setConfiguration(newSensorConfiguration);
    }
    async clearSensorConfiguration() {
      return _classPrivateFieldGet2(_sensorConfigurationManager, this).clearSensorConfiguration();
    }
    static get ClearSensorConfigurationOnLeave() {
      return _assertClassBrand(Device, this, _ClearSensorConfigurationOnLeave)._;
    }
    static set ClearSensorConfigurationOnLeave(newClearSensorConfigurationOnLeave) {
      _console$3.assertTypeWithError(newClearSensorConfigurationOnLeave, "boolean");
      _ClearSensorConfigurationOnLeave._ = _assertClassBrand(Device, this, newClearSensorConfigurationOnLeave);
    }
    get clearSensorConfigurationOnLeave() {
      return _classPrivateFieldGet2(_clearSensorConfigurationOnLeave, this);
    }
    set clearSensorConfigurationOnLeave(newClearSensorConfigurationOnLeave) {
      _console$3.assertTypeWithError(newClearSensorConfigurationOnLeave, "boolean");
      _classPrivateFieldSet2(_clearSensorConfigurationOnLeave, this, newClearSensorConfigurationOnLeave);
    }

    // PRESSURE

    static get DefaultNumberOfPressureSensors() {
      return _assertClassBrand(Device, this, _DefaultNumberOfPressureSensors)._;
    }
    get numberOfPressureSensors() {
      return _classPrivateFieldGet2(_sensorDataManager$1, this).pressureSensorDataManager.numberOfSensors;
    }
    resetPressureRange() {
      _classPrivateFieldGet2(_sensorDataManager$1, this).pressureSensorDataManager.resetRange();
    }
    static get VibrationLocations() {
      return VibrationManager.Locations;
    }
    static get VibrationTypes() {
      return VibrationManager.Types;
    }
    static get VibrationWaveformEffects() {
      return VibrationManager.WaveformEffects;
    }
    static get MaxVibrationWaveformEffectSegmentDelay() {
      return VibrationManager.MaxWaveformEffectSegmentDelay;
    }
    static get MaxNumberOfVibrationWaveformEffectSegments() {
      return VibrationManager.MaxNumberOfWaveformEffectSegments;
    }
    static get MaxVibrationWaveformEffectSegmentLoopCount() {
      return VibrationManager.MaxWaveformEffectSegmentLoopCount;
    }
    static get MaxVibrationWaveformEffectSequenceLoopCount() {
      return VibrationManager.MaxWaveformEffectSequenceLoopCount;
    }
    static get MaxVibrationWaveformSegmentDuration() {
      return VibrationManager.MaxWaveformSegmentDuration;
    }
    static get MaxNumberOfVibrationWaveformSegments() {
      return VibrationManager.MaxNumberOfWaveformSegments;
    }
    async triggerVibration(vibrationConfigurations, sendImmediately) {
      _classPrivateFieldGet2(_vibrationManager, this).triggerVibration(vibrationConfigurations, sendImmediately);
    }
    static get FileTypes() {
      return FileTransferManager.Types;
    }
    get maxFileLength() {
      return _classPrivateFieldGet2(_fileTransferManager, this).maxLength;
    }
    async sendFile(fileType, file) {
      const promise = this.waitForEvent("fileTransferComplete");
      _classPrivateFieldGet2(_fileTransferManager, this).send(fileType, file);
      await promise;
    }
    async receiveFile(fileType) {
      const promise = this.waitForEvent("fileTransferComplete");
      _classPrivateFieldGet2(_fileTransferManager, this).receive(fileType);
      await promise;
    }
    get fileTransferStatus() {
      return _classPrivateFieldGet2(_fileTransferManager, this).status;
    }
    cancelFileTransfer() {
      _classPrivateFieldGet2(_fileTransferManager, this).cancel();
    }

    // TFLITE

    static get TfliteSensorTypes() {
      return TfliteManager$1.SensorTypes;
    }
    get tfliteName() {
      return _classPrivateFieldGet2(_tfliteManager, this).name;
    }
    setTfliteName(newName) {
      return _classPrivateFieldGet2(_tfliteManager, this).setName(newName);
    }

    // TFLITE MODEL CONFIG

    static get TfliteTasks() {
      return TfliteManager$1.Tasks;
    }
    get tfliteTask() {
      return _classPrivateFieldGet2(_tfliteManager, this).task;
    }
    setTfliteTask(newTask) {
      return _classPrivateFieldGet2(_tfliteManager, this).setTask(newTask);
    }
    get tfliteSampleRate() {
      return _classPrivateFieldGet2(_tfliteManager, this).sampleRate;
    }
    setTfliteSampleRate(newSampleRate) {
      return _classPrivateFieldGet2(_tfliteManager, this).setSampleRate(newSampleRate);
    }
    get tfliteSensorTypes() {
      return _classPrivateFieldGet2(_tfliteManager, this).sensorTypes;
    }
    get allowedTfliteSensorTypes() {
      return this.sensorTypes.filter(sensorType => TfliteManager$1.SensorTypes.includes(sensorType));
    }
    setTfliteSensorTypes(newSensorTypes) {
      return _classPrivateFieldGet2(_tfliteManager, this).setSensorTypes(newSensorTypes);
    }
    get tfliteIsReady() {
      return _classPrivateFieldGet2(_tfliteManager, this).isReady;
    }

    // TFLITE INFERENCING

    get tfliteInferencingEnabled() {
      return _classPrivateFieldGet2(_tfliteManager, this).inferencingEnabled;
    }
    async setTfliteInferencingEnabled(inferencingEnabled) {
      return _classPrivateFieldGet2(_tfliteManager, this).setInferencingEnabled(inferencingEnabled);
    }
    async enableTfliteInferencing() {
      return this.setTfliteInferencingEnabled(true);
    }
    async disableTfliteInferencing() {
      return this.setTfliteInferencingEnabled(false);
    }
    async toggleTfliteInferencing() {
      return _classPrivateFieldGet2(_tfliteManager, this).toggleInferencingEnabled();
    }

    // TFLITE INFERENCE CONFIG

    get tfliteCaptureDelay() {
      return _classPrivateFieldGet2(_tfliteManager, this).captureDelay;
    }
    async setTfliteCaptureDelay(newCaptureDelay) {
      return _classPrivateFieldGet2(_tfliteManager, this).setCaptureDelay(newCaptureDelay);
    }
    get tfliteThreshold() {
      return _classPrivateFieldGet2(_tfliteManager, this).threshold;
    }
    async setTfliteThreshold(newThreshold) {
      return _classPrivateFieldGet2(_tfliteManager, this).setThreshold(newThreshold);
    }
    async uploadFirmware(file) {
      return _classPrivateFieldGet2(_firmwareManager, this).uploadFirmware(file);
    }
    async reset() {
      await _classPrivateFieldGet2(_firmwareManager, this).reset();
      return _classPrivateFieldGet2(_connectionManager, this).disconnect();
    }
    get firmwareStatus() {
      return _classPrivateFieldGet2(_firmwareManager, this).status;
    }
    async getFirmwareImages() {
      return _classPrivateFieldGet2(_firmwareManager, this).getImages();
    }
    get firmwareImages() {
      return _classPrivateFieldGet2(_firmwareManager, this).images;
    }
    async eraseFirmwareImage() {
      return _classPrivateFieldGet2(_firmwareManager, this).eraseImage();
    }
    async confirmFirmwareImage(imageIndex) {
      return _classPrivateFieldGet2(_firmwareManager, this).confirmImage(imageIndex);
    }
    async testFirmwareImage(imageIndex) {
      return _classPrivateFieldGet2(_firmwareManager, this).testImage(imageIndex);
    }

    // CONNECTED DEVICES

    static get ConnectedDevices() {
      return _assertClassBrand(Device, this, _ConnectedDevices)._;
    }
    static get UseLocalStorage() {
      return _assertClassBrand(Device, this, _UseLocalStorage)._;
    }
    static set UseLocalStorage(newUseLocalStorage) {
      _assertClassBrand(Device, this, _AssertLocalStorage).call(this);
      _console$3.assertTypeWithError(newUseLocalStorage, "boolean");
      _UseLocalStorage._ = _assertClassBrand(Device, this, newUseLocalStorage);
      if (_assertClassBrand(Device, this, _UseLocalStorage)._ && !_assertClassBrand(Device, this, _LocalStorageConfiguration)._) {
        _assertClassBrand(Device, this, _LoadFromLocalStorage).call(this);
      }
    }
    static get CanUseLocalStorage() {
      return isInBrowser && window.localStorage;
    }
    static get AvailableDevices() {
      return _assertClassBrand(Device, this, _AvailableDevices)._;
    }
    static get CanGetDevices() {
      var _navigator$bluetooth;
      return isInBrowser && ((_navigator$bluetooth = navigator.bluetooth) === null || _navigator$bluetooth === void 0 ? void 0 : _navigator$bluetooth.getDevices) && !isInBluefy;
    }
    static async GetDevices() {
      if (!isInBrowser) {
        _console$3.warn("GetDevices is only available in the browser");
        return;
      }
      if (!navigator.bluetooth) {
        _console$3.warn("bluetooth is not available in this browser");
        return;
      }
      if (isInBluefy) {
        _console$3.warn("bluefy lists too many devices...");
        return;
      }
      if (!navigator.bluetooth.getDevices) {
        _console$3.warn("bluetooth.getDevices() is not available in this browser");
        return;
      }
      if (!_assertClassBrand(Device, this, _LocalStorageConfiguration)._) {
        _assertClassBrand(Device, this, _LoadFromLocalStorage).call(this);
      }
      const configuration = _assertClassBrand(Device, this, _LocalStorageConfiguration)._;
      if (!configuration.devices || configuration.devices.length == 0) {
        _console$3.log("no devices found in configuration");
        return;
      }
      const bluetoothDevices = await navigator.bluetooth.getDevices();
      _console$3.log({
        bluetoothDevices
      });
      bluetoothDevices.forEach(bluetoothDevice => {
        if (!bluetoothDevice.gatt) {
          return;
        }
        let deviceInformation = configuration.devices.find(deviceInformation => bluetoothDevice.id == deviceInformation.bluetoothId);
        if (!deviceInformation) {
          return;
        }
        let existingConnectedDevice = this.ConnectedDevices.filter(device => device.connectionType == "webBluetooth").find(device => device.bluetoothId == bluetoothDevice.id);
        const existingAvailableDevice = this.AvailableDevices.filter(device => device.connectionType == "webBluetooth").find(device => device.bluetoothId == bluetoothDevice.id);
        if (existingAvailableDevice) {
          if ((existingConnectedDevice === null || existingConnectedDevice === void 0 ? void 0 : existingConnectedDevice.bluetoothId) == existingAvailableDevice.bluetoothId && existingConnectedDevice != existingAvailableDevice) {
            this.AvailableDevices[_assertClassBrand(Device, this, _AvailableDevices)._.indexOf(existingAvailableDevice)] = existingConnectedDevice;
          }
          return;
        }
        if (existingConnectedDevice) {
          this.AvailableDevices.push(existingConnectedDevice);
          return;
        }
        const device = new Device();
        const connectionManager = new WebBluetoothConnectionManager();
        connectionManager.device = bluetoothDevice;
        if (bluetoothDevice.name) {
          _classPrivateFieldGet2(_informationManager, device).updateName(bluetoothDevice.name);
        }
        _classPrivateFieldGet2(_informationManager, device).updateType(deviceInformation.type);
        device.connectionManager = connectionManager;
        this.AvailableDevices.push(device);
      });
      _assertClassBrand(Device, this, _DispatchAvailableDevices).call(this);
      return this.AvailableDevices;
    }

    // STATIC EVENTLISTENERS

    static get StaticEventTypes() {
      return _assertClassBrand(Device, this, _StaticEventTypes)._;
    }
    static AddEventListener(type, listener, options) {
      _assertClassBrand(Device, this, _EventDispatcher)._.addEventListener(type, listener, options);
    }
    static RemoveEventListener(type, listener) {
      return _assertClassBrand(Device, this, _EventDispatcher)._.removeEventListener(type, listener);
    }
    static async Connect() {
      const device = new Device();
      await device.connect();
      return device;
    }
  }
  _Device = Device;
  function _get_DefaultConnectionManager(_this) {
    return WebBluetoothConnectionManager;
  }
  function _dispatchEvent$1(event) {
    _classPrivateFieldGet2(_eventDispatcher$1, this).dispatchEvent(event);
  }
  async function _sendTxMessages(messages, sendImmediately) {
    var _classPrivateFieldGet4;
    await ((_classPrivateFieldGet4 = _classPrivateFieldGet2(_connectionManager, this)) === null || _classPrivateFieldGet4 === void 0 ? void 0 : _classPrivateFieldGet4.sendTxMessages(...arguments));
  }
  function _assertIsConnected() {
    _console$3.assertWithError(this.isConnected, "not connected");
  }
  function _get_requiredInformationConnectionMessages(_this2) {
    return _RequiredInformationConnectionMessages._;
  }
  function _get_hasRequiredInformation(_this3) {
    return _classPrivateGetter(_Device_brand, _this3, _get_requiredInformationConnectionMessages).every(messageType => {
      return _this3.latestConnectionMessage.has(messageType);
    });
  }
  function _requestRequiredInformation() {
    const messages = _classPrivateGetter(_Device_brand, this, _get_requiredInformationConnectionMessages).map(messageType => ({
      type: messageType
    }));
    _assertClassBrand(_Device_brand, this, _sendTxMessages).call(this, messages);
  }
  function _onConnectionStatusUpdated(connectionStatus) {
    _console$3.log({
      connectionStatus
    });
    if (connectionStatus == "not connected") {
      //this.#clear();

      if (this.canReconnect && this.reconnectOnDisconnection) {
        _console$3.log("starting reconnect interval...");
        _classPrivateFieldSet2(_reconnectIntervalId, this, setInterval(() => {
          _console$3.log("attempting reconnect...");
          this.reconnect();
        }, 1000));
      }
    } else {
      if (_classPrivateFieldGet2(_reconnectIntervalId, this) != undefined) {
        _console$3.log("clearing reconnect interval");
        clearInterval(_classPrivateFieldGet2(_reconnectIntervalId, this));
        _classPrivateFieldSet2(_reconnectIntervalId, this, undefined);
      }
    }
    _assertClassBrand(_Device_brand, this, _checkConnection).call(this);
    if (connectionStatus == "connected" && !_classPrivateFieldGet2(_isConnected, this)) {
      _assertClassBrand(_Device_brand, this, _requestRequiredInformation).call(this);
    }
    if (connectionStatus == "not connected" && !this.canReconnect && _AvailableDevices._.includes(this)) {
      const deviceIndex = _AvailableDevices._.indexOf(this);
      _Device.AvailableDevices.splice(deviceIndex, 1);
      _DispatchAvailableDevices.call(_Device);
    }
  }
  function _dispatchConnectionEvents() {
    let includeIsConnected = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    _assertClassBrand(_Device_brand, this, _dispatchEvent$1).call(this, {
      type: "connectionStatus",
      message: {
        connectionStatus: this.connectionStatus
      }
    });
    _assertClassBrand(_Device_brand, this, _dispatchEvent$1).call(this, {
      type: this.connectionStatus
    });
    if (includeIsConnected) {
      _assertClassBrand(_Device_brand, this, _dispatchEvent$1).call(this, {
        type: "isConnected",
        message: {
          isConnected: this.isConnected
        }
      });
    }
  }
  function _checkConnection() {
    var _this$connectionManag4;
    _classPrivateFieldSet2(_isConnected, this, ((_this$connectionManag4 = this.connectionManager) === null || _this$connectionManag4 === void 0 ? void 0 : _this$connectionManag4.isConnected) && _classPrivateGetter(_Device_brand, this, _get_hasRequiredInformation) && _classPrivateFieldGet2(_informationManager, this).isCurrentTimeSet);
    switch (this.connectionStatus) {
      case "connected":
        if (_classPrivateFieldGet2(_isConnected, this)) {
          _assertClassBrand(_Device_brand, this, _dispatchConnectionEvents).call(this, true);
        }
        break;
      case "not connected":
        _assertClassBrand(_Device_brand, this, _dispatchConnectionEvents).call(this, true);
        break;
      default:
        _assertClassBrand(_Device_brand, this, _dispatchConnectionEvents).call(this, false);
        break;
    }
  }
  function _clear() {
    this.latestConnectionMessage.clear();
    _classPrivateFieldGet2(_informationManager, this).clear();
    _classPrivateFieldGet2(_deviceInformationManager, this).clear();
  }
  function _onConnectionMessageReceived(messageType, dataView) {
    _console$3.log({
      messageType,
      dataView
    });
    switch (messageType) {
      case "batteryLevel":
        const batteryLevel = dataView.getUint8(0);
        _console$3.log("received battery level", {
          batteryLevel
        });
        _assertClassBrand(_Device_brand, this, _updateBatteryLevel).call(this, batteryLevel);
        break;
      default:
        if (_classPrivateFieldGet2(_fileTransferManager, this).messageTypes.includes(messageType)) {
          _classPrivateFieldGet2(_fileTransferManager, this).parseMessage(messageType, dataView);
        } else if (_classPrivateFieldGet2(_tfliteManager, this).messageTypes.includes(messageType)) {
          _classPrivateFieldGet2(_tfliteManager, this).parseMessage(messageType, dataView);
        } else if (_classPrivateFieldGet2(_sensorDataManager$1, this).messageTypes.includes(messageType)) {
          _classPrivateFieldGet2(_sensorDataManager$1, this).parseMessage(messageType, dataView);
        } else if (_classPrivateFieldGet2(_firmwareManager, this).messageTypes.includes(messageType)) {
          _classPrivateFieldGet2(_firmwareManager, this).parseMessage(messageType, dataView);
        } else if (_classPrivateFieldGet2(_deviceInformationManager, this).messageTypes.includes(messageType)) {
          _classPrivateFieldGet2(_deviceInformationManager, this).parseMessage(messageType, dataView);
        } else if (_classPrivateFieldGet2(_informationManager, this).messageTypes.includes(messageType)) {
          _classPrivateFieldGet2(_informationManager, this).parseMessage(messageType, dataView);
        } else if (_classPrivateFieldGet2(_sensorConfigurationManager, this).messageTypes.includes(messageType)) {
          _classPrivateFieldGet2(_sensorConfigurationManager, this).parseMessage(messageType, dataView);
        } else {
          throw Error(`uncaught messageType ${messageType}`);
        }
    }
    this.latestConnectionMessage.set(messageType, dataView);
    _assertClassBrand(_Device_brand, this, _dispatchEvent$1).call(this, {
      type: "connectionMessage",
      message: {
        messageType,
        dataView
      }
    });
    if (!this.isConnected && _classPrivateGetter(_Device_brand, this, _get_hasRequiredInformation)) {
      _assertClassBrand(_Device_brand, this, _checkConnection).call(this);
    }
  }
  function _updateBatteryLevel(updatedBatteryLevel) {
    _console$3.assertTypeWithError(updatedBatteryLevel, "number");
    if (_classPrivateFieldGet2(_batteryLevel, this) == updatedBatteryLevel) {
      _console$3.log(`duplicate batteryLevel assignment ${updatedBatteryLevel}`);
      return;
    }
    _classPrivateFieldSet2(_batteryLevel, this, updatedBatteryLevel);
    _console$3.log({
      updatedBatteryLevel: _classPrivateFieldGet2(_batteryLevel, this)
    });
    _assertClassBrand(_Device_brand, this, _dispatchEvent$1).call(this, {
      type: "batteryLevel",
      message: {
        batteryLevel: _classPrivateFieldGet2(_batteryLevel, this)
      }
    });
  }
  function _sendSmpMessage(data) {
    _classPrivateFieldGet2(_connectionManager, this).sendSmpMessage(data);
  }
  function _AssertLocalStorage() {
    _console$3.assertWithError(isInBrowser, "localStorage is only available in the browser");
    _console$3.assertWithError(window.localStorage, "localStorage not found");
  }
  function _SaveToLocalStorage() {
    _assertClassBrand(_Device, this, _AssertLocalStorage).call(this);
    localStorage.setItem(_assertClassBrand(_Device, this, _LocalStorageKey)._, JSON.stringify(_assertClassBrand(_Device, this, _LocalStorageConfiguration)._));
  }
  async function _LoadFromLocalStorage() {
    _assertClassBrand(_Device, this, _AssertLocalStorage).call(this);
    let localStorageString = localStorage.getItem(_assertClassBrand(_Device, this, _LocalStorageKey)._);
    if (typeof localStorageString != "string") {
      _console$3.log("no info found in localStorage");
      _LocalStorageConfiguration._ = _assertClassBrand(_Device, this, Object.assign({}, _assertClassBrand(_Device, this, _DefaultLocalStorageConfiguration)._));
      _assertClassBrand(_Device, this, _SaveToLocalStorage).call(this);
      return;
    }
    try {
      const configuration = JSON.parse(localStorageString);
      _console$3.log({
        configuration
      });
      _LocalStorageConfiguration._ = _assertClassBrand(_Device, this, configuration);
      if (this.CanGetDevices) {
        await this.GetDevices(); // redundant?
      }
    } catch (error) {
      _console$3.error(error);
    }
  }
  function _UpdateLocalStorageConfigurationForDevice(device) {
    if (device.connectionType != "webBluetooth") {
      _console$3.log("localStorage is only for webBluetooth devices");
      return;
    }
    _assertClassBrand(_Device, this, _AssertLocalStorage).call(this);
    const deviceInformationIndex = _assertClassBrand(_Device, this, _LocalStorageConfiguration)._.devices.findIndex(deviceInformation => {
      return deviceInformation.bluetoothId == device.bluetoothId;
    });
    if (deviceInformationIndex == -1) {
      return;
    }
    _assertClassBrand(_Device, this, _LocalStorageConfiguration)._.devices[deviceInformationIndex].type = device.type;
    _assertClassBrand(_Device, this, _SaveToLocalStorage).call(this);
  }
  function _DispatchEvent(event) {
    _assertClassBrand(_Device, this, _EventDispatcher)._.dispatchEvent(event);
  }
  function _OnDeviceIsConnected(device) {
    if (device.isConnected) {
      if (!_assertClassBrand(_Device, this, _ConnectedDevices)._.includes(device)) {
        _console$3.log("adding device", device);
        _assertClassBrand(_Device, this, _ConnectedDevices)._.push(device);
        if (this.UseLocalStorage && device.connectionType == "webBluetooth") {
          const deviceInformation = {
            type: device.type,
            bluetoothId: device.bluetoothId
          };
          const deviceInformationIndex = _assertClassBrand(_Device, this, _LocalStorageConfiguration)._.devices.findIndex(_deviceInformation => _deviceInformation.bluetoothId == deviceInformation.bluetoothId);
          if (deviceInformationIndex == -1) {
            _assertClassBrand(_Device, this, _LocalStorageConfiguration)._.devices.push(deviceInformation);
          } else {
            _assertClassBrand(_Device, this, _LocalStorageConfiguration)._.devices[deviceInformationIndex] = deviceInformation;
          }
          _assertClassBrand(_Device, this, _SaveToLocalStorage).call(this);
        }
        _assertClassBrand(_Device, this, _DispatchEvent).call(this, {
          type: "deviceConnected",
          message: {
            device
          }
        });
        _assertClassBrand(_Device, this, _DispatchEvent).call(this, {
          type: "deviceIsConnected",
          message: {
            device
          }
        });
        _assertClassBrand(_Device, this, _DispatchConnectedDevices).call(this);
      } else {
        _console$3.log("device already included");
      }
    } else {
      if (_assertClassBrand(_Device, this, _ConnectedDevices)._.includes(device)) {
        _console$3.log("removing device", device);
        _assertClassBrand(_Device, this, _ConnectedDevices)._.splice(_assertClassBrand(_Device, this, _ConnectedDevices)._.indexOf(device), 1);
        _assertClassBrand(_Device, this, _DispatchEvent).call(this, {
          type: "deviceDisconnected",
          message: {
            device
          }
        });
        _assertClassBrand(_Device, this, _DispatchEvent).call(this, {
          type: "deviceIsConnected",
          message: {
            device
          }
        });
        _assertClassBrand(_Device, this, _DispatchConnectedDevices).call(this);
      } else {
        _console$3.log("device already not included");
      }
    }
    if (this.CanGetDevices) {
      this.GetDevices();
    }
    if (device.isConnected && !this.AvailableDevices.includes(device)) {
      const existingAvailableDevice = this.AvailableDevices.find(_device => _device.bluetoothId == device.bluetoothId);
      _console$3.log({
        existingAvailableDevice
      });
      if (existingAvailableDevice) {
        this.AvailableDevices[this.AvailableDevices.indexOf(existingAvailableDevice)] = device;
      } else {
        this.AvailableDevices.push(device);
      }
      _assertClassBrand(_Device, this, _DispatchAvailableDevices).call(this);
    }
  }
  function _DispatchAvailableDevices() {
    _console$3.log({
      AvailableDevices: this.AvailableDevices
    });
    _assertClassBrand(_Device, this, _DispatchEvent).call(this, {
      type: "availableDevices",
      message: {
        devices: this.AvailableDevices
      }
    });
  }
  function _DispatchConnectedDevices() {
    _console$3.log({
      ConnectedDevices: this.ConnectedDevices
    });
    _assertClassBrand(_Device, this, _DispatchEvent).call(this, {
      type: "connectedDevices",
      message: {
        devices: this.ConnectedDevices
      }
    });
  }
  // EVENT DISPATCHER
  var _EventTypes$1 = {
    _: ["batteryLevel", "connectionStatus", ...BaseConnectionManager.Statuses, "isConnected", "connectionMessage", ...DeviceInformationManager.EventTypes, ...InformationManager.EventTypes, ...SensorConfigurationManager.EventTypes, ...SensorDataManager.EventTypes, ...FileTransferManager.EventTypes, ...TfliteManager$1.EventTypes, ...FirmwareManager.EventTypes]
  };
  var _RequiredInformationConnectionMessages = {
    _: ["isCharging", "getBatteryCurrent", "getId", "getMtu", "getName", "getType", "getCurrentTime", "getSensorConfiguration", "getSensorScalars", "getPressurePositions", "maxFileLength", "getFileLength", "getFileChecksum", "getFileTransferType", "fileTransferStatus", "getTfliteName", "getTfliteTask", "getTfliteSampleRate", "getTfliteSensorTypes", "tfliteModelIsReady", "getTfliteCaptureDelay", "getTfliteThreshold", "getTfliteInferencingEnabled"]
  };
  var _ReconnectOnDisconnection = {
    _: false
  };
  var _ClearSensorConfigurationOnLeave = {
    _: true
  };
  var _DefaultNumberOfPressureSensors = {
    _: 8
  };
  var _ConnectedDevices = {
    _: []
  };
  var _UseLocalStorage = {
    _: false
  };
  var _DefaultLocalStorageConfiguration = {
    _: {
      devices: []
    }
  };
  var _LocalStorageConfiguration = {
    _: void 0
  };
  var _LocalStorageKey = {
    _: "BS.Device"
  };
  // AVAILABLE DEVICES
  var _AvailableDevices = {
    _: []
  };
  var _StaticEventTypes = {
    _: ["deviceConnected", "deviceDisconnected", "deviceIsConnected", "availableDevices", "connectedDevices"]
  };
  var _EventDispatcher = {
    _: new EventDispatcher(_Device, _assertClassBrand(_Device, _Device, _StaticEventTypes)._)
  };
  (() => {
    if (_Device.CanUseLocalStorage) {
      _Device.UseLocalStorage = true;
    }
  })();

  const _console$2 = createConsole("DevicePairPressureSensorDataManager", {
    log: true
  });
  var _rawPressure = /*#__PURE__*/new WeakMap();
  var _centerOfPressureHelper = /*#__PURE__*/new WeakMap();
  var _DevicePairPressureSensorDataManager_brand = /*#__PURE__*/new WeakSet();
  class DevicePairPressureSensorDataManager {
    constructor() {
      _classPrivateMethodInitSpec(this, _DevicePairPressureSensorDataManager_brand);
      // PRESSURE DATA

      _classPrivateFieldInitSpec(this, _rawPressure, {});
      _classPrivateFieldInitSpec(this, _centerOfPressureHelper, new CenterOfPressureHelper());
    }
    static get Sides() {
      return Device.InsoleSides;
    }
    get sides() {
      return Device.InsoleSides;
    }
    resetPressureRange() {
      _classPrivateFieldGet2(_centerOfPressureHelper, this).reset();
    }
    onDevicePressureData(event) {
      const {
        pressure
      } = event.message;
      const insoleSide = event.target.insoleSide;
      _console$2.log({
        pressure,
        insoleSide
      });
      _classPrivateFieldGet2(_rawPressure, this)[insoleSide] = pressure;
      if (_classPrivateGetter(_DevicePairPressureSensorDataManager_brand, this, _get_hasAllPressureData)) {
        return _assertClassBrand(_DevicePairPressureSensorDataManager_brand, this, _updatePressureData).call(this);
      } else {
        _console$2.log("doesn't have all pressure data yet...");
      }
    }
  }
  function _get_hasAllPressureData(_this) {
    return _this.sides.every(side => side in _classPrivateFieldGet2(_rawPressure, _this));
  }
  function _updatePressureData() {
    const pressure = {
      rawSum: 0,
      normalizedSum: 0
    };
    this.sides.forEach(side => {
      pressure.rawSum += _classPrivateFieldGet2(_rawPressure, this)[side].rawSum;
      pressure.normalizedSum += _classPrivateFieldGet2(_rawPressure, this)[side].normalizedSum;
    });
    if (pressure.normalizedSum > 0) {
      pressure.center = {
        x: 0,
        y: 0
      };
      this.sides.forEach(side => {
        const sidePressure = _classPrivateFieldGet2(_rawPressure, this)[side];
        const normalizedPressureSumWeight = sidePressure.normalizedSum / pressure.normalizedSum;
        if (normalizedPressureSumWeight > 0) {
          pressure.center.y += sidePressure.normalizedCenter.y * normalizedPressureSumWeight;
          if (side == "right") {
            pressure.center.x = normalizedPressureSumWeight;
          }
        }
      });
      pressure.normalizedCenter = _classPrivateFieldGet2(_centerOfPressureHelper, this).updateAndGetNormalization(pressure.center);
    }
    _console$2.log({
      devicePairPressure: pressure
    });
    return pressure;
  }

  const _console$1 = createConsole("DevicePairSensorDataManager", {
    log: true
  });
  var _timestamps = /*#__PURE__*/new WeakMap();
  class DevicePairSensorDataManager {
    constructor() {
      _classPrivateFieldInitSpec(this, _timestamps, {});
      _defineProperty(this, "pressureSensorDataManager", new DevicePairPressureSensorDataManager());
      _defineProperty(this, "onDataReceived", void 0);
    }
    static get Sides() {
      return Device.InsoleSides;
    }
    get sides() {
      return Device.InsoleSides;
    }
    resetPressureRange() {
      this.sides.forEach(side => {
        var _this$side;
        (_this$side = this[side]) === null || _this$side === void 0 ? void 0 : _this$side.resetPressureRange();
      });
      this.pressureSensorDataManager.resetPressureRange();
    }
    onDeviceSensorData(event) {
      const {
        timestamp
      } = event.message;
      const sensorType = event.message.sensorType;
      _console$1.log({
        sensorType,
        timestamp,
        event
      });
      if (!_classPrivateFieldGet2(_timestamps, this)[sensorType]) {
        _classPrivateFieldGet2(_timestamps, this)[sensorType] = {};
      }
      _classPrivateFieldGet2(_timestamps, this)[sensorType][event.target.insoleSide] = timestamp;
      let value;
      switch (sensorType) {
        case "pressure":
          value = this.pressureSensorDataManager.onDevicePressureData(event);
          break;
        default:
          _console$1.log(`uncaught sensorType "${sensorType}"`);
          break;
      }
      if (value) {
        var _this$onDataReceived;
        const timestamps = Object.assign({}, _classPrivateFieldGet2(_timestamps, this)[sensorType]);
        (_this$onDataReceived = this.onDataReceived) === null || _this$onDataReceived === void 0 ? void 0 : _this$onDataReceived.call(this, sensorType, {
          timestamps,
          [sensorType]: value
        });
      } else {
        _console$1.log("no value received");
      }
    }
  }

  var _DevicePair;
  const _console = createConsole("DevicePair", {
    log: true
  });
  var _eventDispatcher = /*#__PURE__*/new WeakMap();
  var _DevicePair_brand = /*#__PURE__*/new WeakSet();
  var _left = /*#__PURE__*/new WeakMap();
  var _right = /*#__PURE__*/new WeakMap();
  var _boundDeviceEventListeners = /*#__PURE__*/new WeakMap();
  var _sensorDataManager = /*#__PURE__*/new WeakMap();
  class DevicePair {
    constructor() {
      _classPrivateMethodInitSpec(this, _DevicePair_brand);
      _classPrivateFieldInitSpec(this, _eventDispatcher, new EventDispatcher(this, this.eventTypes));
      _classPrivateFieldInitSpec(this, _left, void 0);
      _classPrivateFieldInitSpec(this, _right, void 0);
      _classPrivateFieldInitSpec(this, _boundDeviceEventListeners, {
        connectionStatus: _assertClassBrand(_DevicePair_brand, this, _redispatchDeviceEvent).bind(this),
        isConnected: _assertClassBrand(_DevicePair_brand, this, _onDeviceIsConnected).bind(this),
        sensorData: _assertClassBrand(_DevicePair_brand, this, _onDeviceSensorData).bind(this),
        getSensorConfiguration: _assertClassBrand(_DevicePair_brand, this, _redispatchDeviceEvent).bind(this)
      });
      // SENSOR DATA

      _classPrivateFieldInitSpec(this, _sensorDataManager, new DevicePairSensorDataManager());
      _classPrivateFieldGet2(_sensorDataManager, this).onDataReceived = _assertClassBrand(_DevicePair_brand, this, _onSensorDataReceived).bind(this);
    }

    // EVENT DISPATCHER

    static get EventTypes() {
      return _assertClassBrand(DevicePair, this, _EventTypes)._;
    }
    get eventTypes() {
      return _EventTypes._;
    }
    addEventListener(type, listener, options) {
      _classPrivateFieldGet2(_eventDispatcher, this).addEventListener(type, listener, options);
    }
    removeEventListener(type, listener) {
      return _classPrivateFieldGet2(_eventDispatcher, this).removeEventListener(type, listener);
    }

    // SIDES

    static get Sides() {
      return Device.InsoleSides;
    }
    get sides() {
      return DevicePair.Sides;
    }
    get left() {
      return _classPrivateFieldGet2(_left, this);
    }
    get right() {
      return _classPrivateFieldGet2(_right, this);
    }
    get isConnected() {
      return this.sides.every(side => {
        var _this$side;
        return (_this$side = this[side]) === null || _this$side === void 0 ? void 0 : _this$side.isConnected;
      });
    }
    get isPartiallyConnected() {
      return this.sides.some(side => {
        var _this$side2;
        return (_this$side2 = this[side]) === null || _this$side2 === void 0 ? void 0 : _this$side2.isConnected;
      });
    }
    get isHalfConnected() {
      return this.isPartiallyConnected && !this.isConnected;
    }
    assignInsole(device) {
      if (!device.isInsole) {
        _console.warn("device is not an insole");
        return;
      }
      const side = device.insoleSide;
      const currentDevice = this[side];
      if (device == currentDevice) {
        _console.log("device already assigned");
        return;
      }
      if (currentDevice) {
        removeEventListeners(currentDevice, _classPrivateFieldGet2(_boundDeviceEventListeners, this));
      }
      addEventListeners(device, _classPrivateFieldGet2(_boundDeviceEventListeners, this));
      switch (side) {
        case "left":
          _classPrivateFieldSet2(_left, this, device);
          break;
        case "right":
          _classPrivateFieldSet2(_right, this, device);
          break;
      }
      _console.log(`assigned ${side} insole`, device);
      this.resetPressureRange();
      _assertClassBrand(_DevicePair_brand, this, _dispatchEvent).call(this, {
        type: "isConnected",
        message: {
          isConnected: this.isConnected
        }
      });
      _assertClassBrand(_DevicePair_brand, this, _dispatchEvent).call(this, {
        type: "deviceIsConnected",
        message: {
          device,
          isConnected: device.isConnected
        }
      });
      return currentDevice;
    }
    // SENSOR CONFIGURATION

    setSensorConfiguration(sensorConfiguration) {
      this.sides.forEach(side => {
        var _this$side3;
        (_this$side3 = this[side]) === null || _this$side3 === void 0 ? void 0 : _this$side3.setSensorConfiguration(sensorConfiguration);
      });
    }
    resetPressureRange() {
      _classPrivateFieldGet2(_sensorDataManager, this).resetPressureRange();
    }

    // VIBRATION

    async triggerVibration(vibrationConfigurations, sendImmediately) {
      const promises = this.sides.map(side => {
        var _this$side4;
        return (_this$side4 = this[side]) === null || _this$side4 === void 0 ? void 0 : _this$side4.triggerVibration(vibrationConfigurations, sendImmediately);
      }).filter(Boolean);
      return Promise.allSettled(promises);
    }

    // SHARED INSTANCE

    static get shared() {
      return _assertClassBrand(DevicePair, this, _shared)._;
    }
  }
  _DevicePair = DevicePair;
  function _dispatchEvent(event) {
    _classPrivateFieldGet2(_eventDispatcher, this).dispatchEvent(event);
  }
  function _redispatchDeviceEvent(deviceEvent) {
    _assertClassBrand(_DevicePair_brand, this, _dispatchEvent).call(this, {
      type: `device${capitalizeFirstCharacter(deviceEvent.type)}`,
      message: {
        ...deviceEvent.message,
        device: deviceEvent.target
      }
    });
  }
  function _onDeviceIsConnected(deviceEvent) {
    _assertClassBrand(_DevicePair_brand, this, _redispatchDeviceEvent).call(this, deviceEvent);
    _assertClassBrand(_DevicePair_brand, this, _dispatchEvent).call(this, {
      type: "isConnected",
      message: {
        isConnected: this.isConnected
      }
    });
  }
  function _onDeviceSensorData(deviceEvent) {
    _assertClassBrand(_DevicePair_brand, this, _redispatchDeviceEvent).call(this, deviceEvent);
    _assertClassBrand(_DevicePair_brand, this, _dispatchEvent).call(this, {
      type: `device${capitalizeFirstCharacter(deviceEvent.message.sensorType)}`,
      message: {
        ...deviceEvent.message,
        device: deviceEvent.target
      }
    });
    if (this.isConnected) {
      _classPrivateFieldGet2(_sensorDataManager, this).onDeviceSensorData(deviceEvent);
    }
  }
  function _onSensorDataReceived(sensorType, sensorData) {
    _console.log({
      sensorType,
      sensorData
    });
    _assertClassBrand(_DevicePair_brand, this, _dispatchEvent).call(this, {
      type: sensorType,
      message: sensorData
    });
  }
  var _EventTypes = {
    _: ["isConnected", "pressure", ...Device.EventTypes.map(sensorType => `device${capitalizeFirstCharacter(sensorType)}`)]
  };
  var _shared = {
    _: new _DevicePair()
  };
  Device.AddEventListener("deviceConnected", event => {
    const device = event.message.device;
    if (device.isInsole) {
      _assertClassBrand(_DevicePair, _DevicePair, _shared)._.assignInsole(device);
    }
  });

  exports.Device = Device;
  exports.DevicePair = DevicePair;
  exports.Environment = environment;
  exports.setAllConsoleLevelFlags = setAllConsoleLevelFlags;
  exports.setConsoleLevelFlagsForType = setConsoleLevelFlagsForType;

}));
