/**
 * @copyright Zack Qattan 2024
 * @license MIT
 */
'use strict';

var webbluetooth = require('webbluetooth');
var noble = require('@abandonware/noble');
require('ws');

/** @type {"__BRILLIANTSOLE__DEV__" | "__BRILLIANTSOLE__PROD__"} */

const isInProduction = "__BRILLIANTSOLE__PROD__" == "__BRILLIANTSOLE__PROD__";
const isInDev = "__BRILLIANTSOLE__PROD__" == "__BRILLIANTSOLE__DEV__";

// https://github.com/flexdinesh/browser-or-node/blob/master/src/index.ts
const isInBrowser = typeof window !== "undefined" && window?.document !== "undefined";
const isInNode = typeof process !== "undefined" && process?.versions?.node != null;

const userAgent = (isInBrowser && navigator.userAgent) || "";

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
  const log = function (...args) {
    Studio.log(args.map((value) => new String(value)).join(","));
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
  /**
   * @param {boolean} condition
   * @param  {...any} data
   */
  const assert = (condition, ...data) => {
    if (!condition) {
      __console.warn(...data);
    }
  };
  __console.assert = assert;
}

// console.table not supported in WebBLE
if (!__console.table) {
  /** @param  {...any} data */
  const table = (...data) => {
    __console.log(...data);
  };
  __console.table = table;
}

/**
 * @callback LogFunction
 * @param {...any} data
 */

/**
 * @callback AssertLogFunction
 * @param {boolean} condition
 * @param {...any} data
 */

/**
 * @typedef {Object} ConsoleLevelFlags
 * @property {boolean} log
 * @property {boolean} warn
 * @property {boolean} error
 * @property {boolean} assert
 * @property {boolean} table
 */

function emptyFunction() {}

/** @type {LogFunction} */
const log = __console.log.bind(__console);
/** @type {LogFunction} */
const warn = __console.warn.bind(__console);
/** @type {LogFunction} */
const error = __console.error.bind(__console);
/** @type {LogFunction} */
const table = __console.table.bind(__console);
/** @type {AssertLogFunction} */
const assert = __console.assert.bind(__console);

class Console {
  /** @type {Object.<string, Console>} */
  static #consoles = {};

  /**
   * @param {string} type
   */
  constructor(type) {
    if (Console.#consoles[type]) {
      throw new Error(`"${type}" console already exists`);
    }
    Console.#consoles[type] = this;
  }

  /** @type {ConsoleLevelFlags} */
  #levelFlags = {
    log: isInDev,
    warn: isInDev,
    assert: true,
    error: true,
    table: true,
  };

  /**
   * @param {ConsoleLevelFlags} levelFlags
   */
  setLevelFlags(levelFlags) {
    Object.assign(this.#levelFlags, levelFlags);
  }

  /**
   * @param {string} type
   * @param {ConsoleLevelFlags} levelFlags
   * @throws {Error} if no console with type "type" is found
   */
  static setLevelFlagsForType(type, levelFlags) {
    if (!this.#consoles[type]) {
      throw new Error(`no console found with type "${type}"`);
    }
    this.#consoles[type].setLevelFlags(levelFlags);
  }

  /**
   * @param {ConsoleLevelFlags} levelFlags
   */
  static setAllLevelFlags(levelFlags) {
    for (const type in this.#consoles) {
      this.#consoles[type].setLevelFlags(levelFlags);
    }
  }

  /**
   * @param {string} type
   * @param {ConsoleLevelFlags} levelFlags
   * @returns {Console}
   */
  static create(type, levelFlags) {
    const console = this.#consoles[type] || new Console(type);
    return console;
  }

  /** @type {LogFunction} */
  get log() {
    return this.#levelFlags.log ? log : emptyFunction;
  }

  /** @type {LogFunction} */
  get warn() {
    return this.#levelFlags.warn ? warn : emptyFunction;
  }

  /** @type {LogFunction} */
  get error() {
    return this.#levelFlags.error ? error : emptyFunction;
  }

  /** @type {AssertLogFunction} */
  get assert() {
    return this.#levelFlags.assert ? assert : emptyFunction;
  }

  /** @type {LogFunction} */
  get table() {
    return this.#levelFlags.table ? table : emptyFunction;
  }

  /**
   * @param {boolean} condition
   * @param {string} [message]
   * @throws {Error} if condition is not met
   */
  assertWithError(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  /**
   * @param {any} value
   * @param {string} type
   * @throws {Error} if value's type doesn't match
   */
  assertTypeWithError(value, type) {
    this.assertWithError(typeof value == type, `value ${value} of type "${typeof value}" not of type "${type}"`);
  }

  /**
   * @param {string} value
   * @param {string[]} enumeration
   * @throws {Error} if value's type doesn't match
   */
  assertEnumWithError(value, enumeration) {
    this.assertWithError(enumeration.includes(value), `invalid enum "${value}"`);
  }
}

/**
 * @param {string} type
 * @param {ConsoleLevelFlags} [levelFlags]
 * @returns {Console}
 */
function createConsole(type, levelFlags) {
  return Console.create(type, levelFlags);
}

/**
 * @param {string} type
 * @param {ConsoleLevelFlags} levelFlags
 * @throws {Error} if no console with type is found
 */
function setConsoleLevelFlagsForType(type, levelFlags) {
  Console.setLevelFlagsForType(type, levelFlags);
}

/**
 * @param {ConsoleLevelFlags} levelFlags
 */
function setAllConsoleLevelFlags(levelFlags) {
  Console.setAllLevelFlags(levelFlags);
}

/**
 * made with ChatGPT
 * @param {string} string
 */

/** @param {string} string */
function capitalizeFirstCharacter(string) {
    return string[0].toUpperCase() + string.slice(1);
}

const _console$u = createConsole("EventDispatcher", { log: false });

/**
 * @typedef {Object} EventDispatcherEvent
 * @property {any} target
 * @property {string} type
 * @property {object} message
 */

/**
 * @typedef {Object} EventDispatcherOptions
 * @property {boolean} [once]
 */

/** @typedef {(event: EventDispatcherEvent) => void} EventDispatcherListener */

// based on https://github.com/mrdoob/eventdispatcher.js/
class EventDispatcher {
  /**
   * @param {object} target
   * @param {string[]?} eventTypes
   */
  constructor(target, eventTypes) {
    _console$u.assertWithError(target, "target is required");
    this.#target = target;
    _console$u.assertWithError(Array.isArray(eventTypes) || eventTypes == undefined, "eventTypes must be an array");
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
    _console$u.assertWithError(this.#isValidEventType(type), `invalid event type "${type}"`);
  }

  /** @type {Object.<string, [function]?>?} */
  #listeners;

  /**
   * @param {string} type
   * @param {EventDispatcherListener} listener
   * @param {EventDispatcherOptions} [options]
   */
  addEventListener(type, listener, options) {
    _console$u.log(`adding "${type}" eventListener`, listener);
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
    _console$u.log(`has "${type}" eventListener?`, listener);
    this.#assertValidEventType(type);
    return this.#listeners?.[type]?.includes(listener);
  }

  /**
   * @param {string} type
   * @param {EventDispatcherListener} listener
   */
  removeEventListener(type, listener) {
    _console$u.log(`removing "${type}" eventListener`, listener);
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
          _console$u.error(error);
        }
      }
    }
  }

  /** @param {string} type */
  waitForEvent(type) {
    _console$u.log(`waiting for event "${type}"`);
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
 * @param {object} target
 * @param {object.<string, EventListener>} boundEventListeners
 */
function addEventListeners(target, boundEventListeners) {
  let addEventListener = target.addEventListener || target.addListener || target.on || target.AddEventListener;
  _console$u.assertWithError(addEventListener, "no add listener function found for target");
  addEventListener = addEventListener.bind(target);
  Object.entries(boundEventListeners).forEach(([eventType, eventListener]) => {
    addEventListener(eventType, eventListener);
  });
}

/**
 * @param {object} target
 * @param {object.<string, EventListener>} boundEventListeners
 */
function removeEventListeners(target, boundEventListeners) {
  let removeEventListener = target.removeEventListener || target.removeListener || target.RemoveEventListener;
  _console$u.assertWithError(removeEventListener, "no remove listener function found for target");
  removeEventListener = removeEventListener.bind(target);
  Object.entries(boundEventListeners).forEach(([eventType, eventListener]) => {
    removeEventListener(eventType, eventListener);
  });
}

const _console$t = createConsole("Timer", { log: false });

class Timer {
    /** @type {function} */
    #callback;
    get callback() {
        return this.#callback;
    }
    set callback(newCallback) {
        _console$t.assertTypeWithError(newCallback, "function");
        _console$t.log({ newCallback });
        this.#callback = newCallback;
        if (this.isRunning) {
            this.restart();
        }
    }

    /** @type {number} */
    #interval;
    get interval() {
        return this.#interval;
    }
    set interval(newInterval) {
        _console$t.assertTypeWithError(newInterval, "number");
        _console$t.assertWithError(newInterval > 0, "interval must be above 0");
        _console$t.log({ newInterval });
        this.#interval = newInterval;
        if (this.isRunning) {
            this.restart();
        }
    }

    /**
     * @param {function} callback
     * @param {number} interval
     */
    constructor(callback, interval) {
        this.interval = interval;
        this.callback = callback;
    }

    /** @type {number?} */
    #intervalId = null;
    get isRunning() {
        return this.#intervalId != null;
    }

    start() {
        if (this.isRunning) {
            _console$t.log("interval already running");
            return;
        }
        _console$t.log("starting interval");
        this.#intervalId = setInterval(this.#callback, this.#interval);
    }
    stop() {
        if (!this.isRunning) {
            _console$t.log("interval already not running");
            return;
        }
        _console$t.log("stopping interval");
        clearInterval(this.#intervalId);
        this.#intervalId = null;
    }
    restart() {
        this.stop();
        this.start();
    }
}

createConsole("checksum", { log: true });

// https://github.com/googlecreativelab/tiny-motion-trainer/blob/5fceb49f018ae0c403bf9f0ccc437309c2acb507/frontend/src/tf4micro-motion-kit/modules/bleFileTransfer.js#L195

// See http://home.thep.lu.se/~bjorn/crc/ for more information on simple CRC32 calculations.
/** @param {number} r */
function crc32ForByte(r) {
    for (let j = 0; j < 8; ++j) {
        r = (r & 1 ? 0 : 0xedb88320) ^ (r >>> 1);
    }
    return r ^ 0xff000000;
}

const tableSize = 256;
const crc32Table = new Uint32Array(tableSize);
for (let i = 0; i < tableSize; ++i) {
    crc32Table[i] = crc32ForByte(i);
}

/** @param {number[]} dataIterable */
function crc32(dataIterable) {
    let dataBytes = new Uint8Array(dataIterable);
    let crc = 0;
    for (let i = 0; i < dataBytes.byteLength; ++i) {
        const crcLowByte = crc & 0x000000ff;
        const dataByte = dataBytes[i];
        const tableIndex = crcLowByte ^ dataByte;
        // The last >>> is to convert this into an unsigned 32-bit integer.
        crc = (crc32Table[tableIndex] ^ (crc >>> 8)) >>> 0;
    }
    return crc;
}

var _TextEncoder;
if (typeof TextEncoder == "undefined") {
    _TextEncoder = class {
        /** @param {String} string */
        encode(string) {
            const encoding = Array.from(string).map((char) => char.charCodeAt(0));
            return Uint8Array.from(encoding);
        }
    };
} else {
    _TextEncoder = TextEncoder;
}

var _TextDecoder;
if (typeof TextDecoder == "undefined") {
    _TextDecoder = class {
        /** @param {ArrayBuffer} data */
        decode(data) {
            const byteArray = Array.from(new Uint8Array(data));
            return byteArray
                .map((value) => {
                    return String.fromCharCode(value);
                })
                .join("");
        }
    };
} else {
    _TextDecoder = TextDecoder;
}

const textEncoder = new _TextEncoder();
const textDecoder = new _TextDecoder();

const _console$s = createConsole("ArrayBufferUtils", { log: false });

/**
 * @param {...ArrayBuffer} arrayBuffers
 * @returns {ArrayBuffer}
 */
function concatenateArrayBuffers(...arrayBuffers) {
  arrayBuffers = arrayBuffers.filter((arrayBuffer) => arrayBuffer != undefined || arrayBuffer != null);
  arrayBuffers = arrayBuffers.map((arrayBuffer) => {
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
  arrayBuffers = arrayBuffers.filter((arrayBuffer) => arrayBuffer && "byteLength" in arrayBuffer);
  const length = arrayBuffers.reduce((length, arrayBuffer) => length + arrayBuffer.byteLength, 0);
  const uint8Array = new Uint8Array(length);
  let byteOffset = 0;
  arrayBuffers.forEach((arrayBuffer) => {
    uint8Array.set(new Uint8Array(arrayBuffer), byteOffset);
    byteOffset += arrayBuffer.byteLength;
  });
  return uint8Array.buffer;
}

/** @param {Buffer} data */
function dataToArrayBuffer(data) {
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
}

/** @param {String} string */
function stringToArrayBuffer(string) {
  const encoding = textEncoder.encode(string);
  return concatenateArrayBuffers(encoding.byteLength, encoding);
}

/** @param {Object} object */
function objectToArrayBuffer(object) {
  return stringToArrayBuffer(JSON.stringify(object));
}

/**
 * @param {DataView} dataView
 * @param {number} begin
 * @param {number} [length]
 */
function sliceDataView(dataView, begin, length) {
  let end;
  if (length != undefined) {
    end = dataView.byteOffset + begin + length;
  }
  _console$s.log({ dataView, begin, end, length });
  return new DataView(dataView.buffer.slice(dataView.byteOffset + begin, end));
}

/** @typedef {number[] | ArrayBuffer | DataView | URL | string | File} FileLike */

/** @param {FileLike} file */
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
    throw { error: "invalid file type", file };
  }
  return fileBuffer;
}

const _console$r = createConsole("FileTransferManager", { log: true });

/**
 * @typedef { "maxFileLength" |
 * "getFileTransferType" |
 * "setFileTransferType" |
 * "getFileLength" |
 * "setFileLength" |
 * "getFileChecksum" |
 * "setFileChecksum" |
 * "setFileTransferCommand" |
 * "fileTransferStatus" |
 * "getFileTransferBlock" |
 * "setFileTransferBlock"
 * } FileTransferMessageType
 */

/** @typedef {"tflite"} FileType */
/** @typedef {"idle" | "sending" | "receiving"} FileTransferStatus */
/** @typedef {"startReceive" | "startSend" | "cancel"} FileTransferCommand */



/** @typedef {FileTransferMessageType | "fileTransferProgress" | "fileTransferComplete" | "fileReceived"} FileTransferManagerEventType */



/**
 * @typedef {Object} BaseFileTransferMaxLengthEvent
 * @property {"maxFileLength"} type
 * @property {{maxFileLength: number}} message
 */
/** @typedef {BaseDeviceEvent & BaseFileTransferMaxLengthEvent} FileTransferMaxLengthEvent */

/**
 * @typedef {Object} BaseFileTransferTypeEvent
 * @property {"getFileTransferType"} type
 * @property {{fileType: FileType}} message
 */
/** @typedef {BaseDeviceEvent & BaseFileTransferTypeEvent} FileTransferTypeEvent */

/**
 * @typedef {Object} BaseFileTransferLengthEvent
 * @property {"getFileLength"} type
 * @property {{fileLength: number}} message
 */
/** @typedef {BaseDeviceEvent & BaseFileTransferLengthEvent} FileTransferLengthEvent */

/**
 * @typedef {Object} BaseFileChecksumEvent
 * @property {"getFileChecksum"} type
 * @property {{fileChecksum: number}} message
 */
/** @typedef {BaseDeviceEvent & BaseFileChecksumEvent} FileChecksumEvent */

/**
 * @typedef {Object} BaseFileTransferStatusEvent
 * @property {"fileTransferStatus"} type
 * @property {{fileTransferStatus: FileTransferStatus}} message
 */
/** @typedef {BaseDeviceEvent & BaseFileTransferStatusEvent} FileTransferStatusEvent */

/**
 * @typedef {Object} BaseFileTransferBlockEvent
 * @property {"getFileTransferBlock"} type
 * @property {{fileTransferBlock: DataView}} message
 */
/** @typedef {BaseDeviceEvent & BaseFileTransferBlockEvent} FileTransferBlockEvent */

/**
 * @typedef {FileTransferMaxLengthEvent |
 * FileTransferTypeEvent |
 * FileTransferLengthEvent |
 * FileChecksumEvent |
 * FileTransferStatusEvent |
 * FileTransferBlockEvent
 * } FileTransferManagerEvent
 */

/** @typedef {(event: FileTransferManagerEvent) => void} FileTransferManagerEventListener */

class FileTransferManager {
  // MESSAGE TYPES

  /** @type {FileTransferMessageType[]} */
  static #MessageTypes = [
    "maxFileLength",
    "getFileTransferType",
    "setFileTransferType",
    "getFileLength",
    "setFileLength",
    "getFileChecksum",
    "setFileChecksum",
    "setFileTransferCommand",
    "fileTransferStatus",
    "getFileTransferBlock",
    "setFileTransferBlock",
  ];
  static get MessageTypes() {
    return this.#MessageTypes;
  }
  get messageTypes() {
    return FileTransferManager.MessageTypes;
  }

  // EVENT DISPATCHER

  /** @type {FileTransferManagerEventType[]} */
  static #EventTypes = [...this.#MessageTypes, "fileTransferProgress", "fileTransferComplete", "fileReceived"];
  static get EventTypes() {
    return this.#EventTypes;
  }
  get eventTypes() {
    return FileTransferManager.#EventTypes;
  }
  /** @type {EventDispatcher} */
  eventDispatcher;

  /**
   * @param {FileTransferManagerEventType} type
   * @param {FileTransferManagerEventListener} listener
   * @param {EventDispatcherOptions} [options]
   */
  addEventListener(type, listener, options) {
    this.eventDispatcher.addEventListener(type, listener, options);
  }

  /**
   * @param {FileTransferManagerEvent} event
   */
  #dispatchEvent(event) {
    this.eventDispatcher.dispatchEvent(event);
  }

  /**
   * @param {FileTransferManagerEventType} type
   * @param {FileTransferManagerEventListener} listener
   */
  removeEventListener(type, listener) {
    return this.eventDispatcher.removeEventListener(type, listener);
  }

  /** @param {FileTransferManagerEventType} eventType */
  waitForEvent(eventType) {
    return this.eventDispatcher.waitForEvent(eventType);
  }

  // PROPERTIES

  /** @type {FileType[]} */
  static #Types = ["tflite"];
  static get Types() {
    return this.#Types;
  }
  get types() {
    return FileTransferManager.Types;
  }
  /** @param {FileType} type */
  #assertValidType(type) {
    _console$r.assertEnumWithError(type, this.types);
  }
  /** @param {number} typeEnum */
  #assertValidTypeEnum(typeEnum) {
    _console$r.assertWithError(this.types[typeEnum], `invalid typeEnum ${typeEnum}`);
  }

  /** @type {FileTransferStatus[]} */
  static #Statuses = ["idle", "sending", "receiving"];
  static get Statuses() {
    return this.#Statuses;
  }
  get statuses() {
    return FileTransferManager.Statuses;
  }
  /** @param {number} statusEnum */
  #assertValidStatusEnum(statusEnum) {
    _console$r.assertWithError(this.statuses[statusEnum], `invalid statusEnum ${statusEnum}`);
  }

  /** @type {FileTransferCommand[]} */
  static #Commands = ["startSend", "startReceive", "cancel"];
  static get Commands() {
    return this.#Commands;
  }
  get commands() {
    return FileTransferManager.Commands;
  }
  /** @param {FileTransferCommand} command */
  #assertValidCommand(command) {
    _console$r.assertEnumWithError(command, this.commands);
  }

  static #MaxLength = 0; // kB
  static get MaxLength() {
    return this.#MaxLength;
  }
  #maxLength = FileTransferManager.MaxLength;
  /** kB */
  get maxLength() {
    return this.#maxLength;
  }
  /** @param {DataView} dataView */
  #parseMaxLength(dataView) {
    _console$r.log("parseFileMaxLength", dataView);
    const maxLength = dataView.getUint32(0, true);
    _console$r.log(`maxLength: ${maxLength / 1024}kB`);
    this.#updateMaxLength(maxLength);
  }
  /** @param {number} maxLength */
  #updateMaxLength(maxLength) {
    _console$r.log({ maxLength });
    this.#maxLength = maxLength;
    this.#dispatchEvent({ type: "maxFileLength", message: { maxFileLength: maxLength } });
  }
  /** @param {number} length */
  #assertValidLength(length) {
    _console$r.assertWithError(
      length <= this.maxLength,
      `file length ${length}kB too large - must be ${this.maxLength}kB or less`
    );
  }

  /** @type {FileType?} */
  #type;
  get type() {
    return this.#type;
  }
  /** @param {DataView} dataView */
  #parseType(dataView) {
    _console$r.log("parseFileType", dataView);
    const typeEnum = dataView.getUint8(0);
    this.#assertValidTypeEnum(typeEnum);
    const type = this.types[typeEnum];
    this.#updateType(type);
  }
  /** @param {FileType} type */
  #updateType(type) {
    _console$r.log({ fileTransferType: type });
    this.#type = type;
    this.#dispatchEvent({ type: "getFileTransferType", message: { fileType: type } });
  }
  /**
   * @param {FileType} newType
   * @param {boolean} sendImmediately
   */
  async #setType(newType, sendImmediately) {
    this.#assertValidType(newType);
    if (this.type == newType) {
      _console$r.log(`redundant type assignment ${newType}`);
      return;
    }

    const promise = this.waitForEvent("getFileTransferType");

    const typeEnum = this.types.indexOf(newType);
    this.sendMessage([{ type: "setFileTransferType", data: Uint8Array.from([typeEnum]).buffer }], sendImmediately);

    await promise;
  }

  #length = 0;
  get length() {
    return this.#length;
  }
  /** @param {DataView} dataView */
  #parseLength(dataView) {
    _console$r.log("parseFileLength", dataView);
    const length = dataView.getUint32(0, true);

    this.#updateLength(length);
  }
  /** @param {number} length */
  #updateLength(length) {
    _console$r.log(`length: ${length / 1024}kB`);
    this.#length = length;
    this.#dispatchEvent({ type: "getFileLength", message: { fileLength: length } });
  }
  /**
   * @param {number} newLength
   * @param {boolean} sendImmediately
   */
  async #setLength(newLength, sendImmediately) {
    _console$r.assertTypeWithError(newLength, "number");
    this.#assertValidLength(newLength);
    if (this.length == newLength) {
      _console$r.log(`redundant length assignment ${newLength}`);
      return;
    }

    const promise = this.waitForEvent("getFileLength");

    const dataView = new DataView(new ArrayBuffer(4));
    dataView.setUint32(0, newLength, true);
    this.sendMessage([{ type: "setFileLength", data: dataView.buffer }], sendImmediately);

    await promise;
  }

  #checksum = 0;
  get checksum() {
    return this.#checksum;
  }
  /** @param {DataView} dataView */
  #parseChecksum(dataView) {
    _console$r.log("checksum", dataView);
    const checksum = dataView.getUint32(0, true);
    this.#updateChecksum(checksum);
  }
  /** @param {number} checksum */
  #updateChecksum(checksum) {
    _console$r.log({ checksum });
    this.#checksum = checksum;
    this.#dispatchEvent({ type: "getFileChecksum", message: { fileChecksum: checksum } });
  }
  /**
   * @param {number} newChecksum
   * @param {boolean} sendImmediately
   */
  async #setChecksum(newChecksum, sendImmediately) {
    _console$r.assertTypeWithError(newChecksum, "number");
    if (this.checksum == newChecksum) {
      _console$r.log(`redundant checksum assignment ${newChecksum}`);
      return;
    }

    const promise = this.waitForEvent("getFileChecksum");

    const dataView = new DataView(new ArrayBuffer(4));
    dataView.setUint32(0, newChecksum, true);
    this.sendMessage([{ type: "setFileChecksum", data: dataView.buffer }], sendImmediately);

    await promise;
  }

  /**
   * @param {FileTransferCommand} command
   * @param {boolean} sendImmediately
   */
  async #setCommand(command, sendImmediately) {
    this.#assertValidCommand(command);

    const promise = this.waitForEvent("fileTransferStatus");

    const commandEnum = this.commands.indexOf(command);
    this.sendMessage(
      [{ type: "setFileTransferCommand", data: Uint8Array.from([commandEnum]).buffer }],
      sendImmediately
    );

    await promise;
  }

  /** @type {FileTransferStatus} */
  #status = "idle";
  get status() {
    return this.#status;
  }
  /** @param {DataView} dataView */
  #parseStatus(dataView) {
    _console$r.log("parseFileStatus", dataView);
    const statusEnum = dataView.getUint8(0);
    this.#assertValidStatusEnum(statusEnum);
    const status = this.statuses[statusEnum];
    this.#updateStatus(status);
  }
  /** @param {FileTransferStatus} status */
  #updateStatus(status) {
    _console$r.log({ status });
    this.#status = status;
    this.#dispatchEvent({ type: "fileTransferStatus", message: { fileTransferStatus: status } });
    this.#receivedBlocks.length = 0;
  }
  #assertIsIdle() {
    _console$r.assertWithError(this.#status == "idle", "status is not idle");
  }
  #assertIsNotIdle() {
    _console$r.assertWithError(this.#status != "idle", "status is idle");
  }

  // BLOCK

  /** @type {ArrayBuffer[]} */
  #receivedBlocks = [];

  /** @param {DataView} dataView */
  async #parseBlock(dataView) {
    _console$r.log("parseFileBlock", dataView);
    this.#receivedBlocks.push(dataView.buffer);

    const bytesReceived = this.#receivedBlocks.reduce((sum, arrayBuffer) => (sum += arrayBuffer.byteLength), 0);
    const progress = bytesReceived / this.#length;

    _console$r.log(`received ${bytesReceived} of ${this.#length} bytes (${progress * 100}%)`);

    this.#dispatchEvent({ type: "fileTransferProgress", message: { progress } });

    if (bytesReceived != this.#length) {
      return;
    }

    _console$r.log("file transfer complete");

    let fileName = new Date().toLocaleString();
    switch (this.type) {
      case "tflite":
        fileName += ".tflite";
        break;
    }

    /** @type {File|Blob} */
    let file;
    if (typeof File !== "undefined") {
      file = new File(this.#receivedBlocks, fileName);
    } else {
      file = new Blob(this.#receivedBlocks);
    }

    const arrayBuffer = await file.arrayBuffer();
    const checksum = crc32(arrayBuffer);
    _console$r.log({ checksum });

    if (checksum != this.#checksum) {
      _console$r.error(`wrong checksum - expected ${this.#checksum}, got ${checksum}`);
      return;
    }

    _console$r.log("received file", file);

    this.#dispatchEvent({ type: "getFileTransferBlock", message: { fileTransferBlock: dataView } });
    this.#dispatchEvent({ type: "fileTransferComplete", message: { direction: "receiving" } });
    this.#dispatchEvent({ type: "fileReceived", message: { file } });
  }

  // MESSAGE

  /**
   * @param {FileTransferMessageType} messageType
   * @param {DataView} dataView
   */
  parseMessage(messageType, dataView) {
    _console$r.log({ messageType });

    switch (messageType) {
      case "maxFileLength":
        this.#parseMaxLength(dataView);
        break;
      case "getFileTransferType":
      case "setFileTransferType":
        this.#parseType(dataView);
        break;
      case "getFileLength":
      case "setFileLength":
        this.#parseLength(dataView);
        break;
      case "getFileChecksum":
      case "setFileChecksum":
        this.#parseChecksum(dataView);
        break;
      case "fileTransferStatus":
        this.#parseStatus(dataView);
        break;
      case "getFileTransferBlock":
        this.#parseBlock(dataView);
        break;
      default:
        throw Error(`uncaught messageType ${messageType}`);
    }
  }

  // FILE TRANSFER

  /**
   * @param {FileType} type
   * @param {FileLike} file
   */
  async send(type, file) {
    this.#assertIsIdle();

    this.#assertValidType(type);
    const fileBuffer = await getFileBuffer(file);

    /** @type {Promise[]} */
    const promises = [];

    promises.push(this.#setType(type, false));
    const fileLength = fileBuffer.byteLength;
    promises.push(this.#setLength(fileLength, false));
    const checksum = crc32(fileBuffer);
    promises.push(this.#setChecksum(checksum, false));
    promises.push(this.#setCommand("startSend", false));

    this.sendMessage();

    await Promise.all(promises);

    await this.#send(fileBuffer);
  }

  /** @param {ArrayBuffer} buffer */
  async #send(buffer) {
    return this.#sendBlock(buffer);
  }

  /**
   * @param {ArrayBuffer} buffer
   * @param {number} offset
   */
  async #sendBlock(buffer, offset = 0) {
    if (this.status != "sending") {
      return;
    }

    const slicedBuffer = buffer.slice(offset, offset + (this.mtu - 3 - 3));
    _console$r.log("slicedBuffer", slicedBuffer);
    const bytesLeft = buffer.byteLength - offset;
    const progress = 1 - bytesLeft / buffer.byteLength;
    _console$r.log(
      `sending bytes ${offset}-${offset + slicedBuffer.byteLength} of ${buffer.byteLength} bytes (${progress * 100}%)`
    );
    this.#dispatchEvent({ type: "fileTransferProgress", message: { progress } });
    if (slicedBuffer.byteLength == 0) {
      _console$r.log("finished sending buffer");
      this.#dispatchEvent({ type: "fileTransferComplete", message: { direction: "sending" } });
    } else {
      await this.sendMessage([{ type: "setFileTransferBlock", data: slicedBuffer }]);
      return this.#sendBlock(buffer, offset + slicedBuffer.byteLength);
    }
  }

  /** @param {FileType} type */
  async receive(type) {
    this.#assertIsIdle();

    this.#assertValidType(type);

    await this.#setType(type);
    await this.#setCommand("startReceive");
  }

  async cancel() {
    this.#assertIsNotIdle();
    await this.#setCommand("cancel");
  }

  /**
   * @callback SendMessageCallback
   * @param {{type: FileTransferMessageType, data: ArrayBuffer}[]} messages
   * @param {boolean} sendImmediately
   */

  /** @type {SendMessageCallback} */
  sendMessage;

  // MTU

  /** @type {number} */
  mtu;
}

/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @param {number} [range]
 */

const Uint16Max = 2 ** 16;

/** @param {number} number */
function removeLower2Bytes(number) {
  const lower2Bytes = number % Uint16Max;
  return number - lower2Bytes;
}

/**
 * @param {DataView} dataView
 * @param {number} byteOffset
 */
function parseTimestamp(dataView, byteOffset) {
  const now = Date.now();
  const nowWithoutLower2Bytes = removeLower2Bytes(now);
  const lower2Bytes = dataView.getUint16(byteOffset, true);
  const timestamp = nowWithoutLower2Bytes + lower2Bytes;
  return timestamp;
}

/**
 * @typedef {Object} Vector2
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} Range
 * @property {number} min
 * @property {number} max
 * @property {number} range
 */

/** @type {Range} */
const initialRange = { min: Infinity, max: -Infinity, range: 0 };

class RangeHelper {
  /** @type {Range} */
  #range = Object.assign({}, initialRange);

  reset() {
    Object.assign(this.#range, initialRange);
  }

  /** @param {number} value */
  update(value) {
    this.#range.min = Math.min(value, this.#range.min);
    this.#range.max = Math.max(value, this.#range.max);
    this.#range.range = this.#range.max - this.#range.min;
  }

  /** @param {number} value */
  getNormalization(value) {
    return this.#range.range * value || 0;
  }

  /** @param {number} value */
  updateAndGetNormalization(value) {
    this.update(value);
    return this.getNormalization(value);
  }
}

/** @typedef {Vector2} CenterOfPressure */

/**
 * @typedef {Object} CenterOfPressureRange
 * @property {RangeHelper} x
 * @property {RangeHelper} y
 */

class CenterOfPressureHelper {
  /** @type {CenterOfPressureRange} */
  #range = {
    x: new RangeHelper(),
    y: new RangeHelper(),
  };
  reset() {
    this.#range.x.reset();
    this.#range.y.reset();
  }

  /** @param {CenterOfPressure} centerOfPressure  */
  update(centerOfPressure) {
    this.#range.x.update(centerOfPressure.x);
    this.#range.y.update(centerOfPressure.y);
  }
  /**
   * @param {CenterOfPressure} centerOfPressure
   * @returns {CenterOfPressure}
   */
  getNormalization(centerOfPressure) {
    return {
      x: this.#range.x.getNormalization(centerOfPressure.x),
      y: this.#range.y.getNormalization(centerOfPressure.y),
    };
  }

  /** @param {CenterOfPressure} centerOfPressure  */
  updateAndGetNormalization(centerOfPressure) {
    this.update(centerOfPressure);
    return this.getNormalization(centerOfPressure);
  }
}

/**
 * @param {number} arrayLength
 * @param {((index:number) => any) | object} objectOrCallback
 */
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

/** @param {any[]} array */
function arrayWithoutDuplicates(array) {
    return array.filter((value, index) => array.indexOf(value) == index);
}

/** @typedef {"pressure"} PressureSensorType */


/** @typedef {Vector2} PressureSensorPosition */



/**
 * @typedef {Object} PressureSensorValue
 * @property {PressureSensorPosition} position
 * @property {number} rawValue
 * @property {number} scaledValue
 * @property {number} normalizedValue
 * @property {number} weightedValue
 */

/**
 * @typedef {Object} PressureData
 * @property {PressureSensorValue[]} sensors
 *
 * @property {number} scaledSum
 * @property {number} normalizedSum
 *
 * @property {CenterOfPressure} [center]
 * @property {CenterOfPressure} [normalizedCenter]
 */



/**
 * @typedef {Object} BasePressureSensorDataEventMessage
 * @property {PressureData} pressure
 */
/** @typedef {BaseSensorDataEventMessage & BasePressureSensorDataEventMessage} PressureSensorDataEventMessage */

/**
 * @typedef {Object} BasePressureSensorDataEvent
 * @property {"pressure"} type
 * @property {PressureSensorDataEventMessage} message
 */


/** @typedef {BaseDeviceEvent & BasePressureSensorDataEvent} PressureSensorDataEvent */

const _console$q = createConsole("PressureSensorDataManager", { log: true });

class PressureSensorDataManager {
  /** @type {PressureSensorType[]} */
  static #Types = ["pressure"];
  static get Types() {
    return this.#Types;
  }
  static get ContinuousTypes() {
    return this.Types;
  }

  /** @type {PressureSensorPosition[]} */
  #positions = [];
  get positions() {
    return this.#positions;
  }

  get numberOfSensors() {
    return this.positions.length;
  }

  /** @param {DataView} dataView */
  parsePositions(dataView) {
    /** @type {PressureSensorPosition[]} */
    const positions = [];

    for (
      let pressureSensorIndex = 0, byteOffset = 0;
      byteOffset < dataView.byteLength;
      pressureSensorIndex++, byteOffset += 2
    ) {
      positions.push({
        x: dataView.getUint8(byteOffset) / 2 ** 8,
        y: dataView.getUint8(byteOffset + 1) / 2 ** 8,
      });
    }

    _console$q.log({ positions });

    this.#positions = positions;

    this.#sensorRangeHelpers = createArray(this.numberOfSensors, () => new RangeHelper());

    this.resetRange();
  }

  /** @type {RangeHelper[]?} */
  #sensorRangeHelpers;

  #centerOfPressureHelper = new CenterOfPressureHelper();

  resetRange() {
    this.#sensorRangeHelpers.forEach((rangeHelper) => rangeHelper.reset());
    this.#centerOfPressureHelper.reset();
  }

  /**
   * @param {DataView} dataView
   * @param {number} scalar
   */
  parseData(dataView, scalar) {
    /** @type {PressureData} */
    const pressure = { sensors: [], scaledSum: 0, normalizedSum: 0 };
    for (let index = 0, byteOffset = 0; byteOffset < dataView.byteLength; index++, byteOffset += 2) {
      const rawValue = dataView.getUint16(byteOffset, true);
      const scaledValue = rawValue * scalar;
      const rangeHelper = this.#sensorRangeHelpers[index];
      const normalizedValue = rangeHelper.updateAndGetNormalization(scaledValue);
      const position = this.positions[index];
      pressure.sensors[index] = { rawValue, scaledValue, normalizedValue, position, weightedValue: 0 };

      pressure.scaledSum += scaledValue;
      pressure.normalizedSum += normalizedValue / this.numberOfSensors;
    }

    if (pressure.scaledSum > 0) {
      pressure.center = { x: 0, y: 0 };
      pressure.sensors.forEach((sensor) => {
        sensor.weightedValue = sensor.scaledValue / pressure.scaledSum;
        pressure.center.x += sensor.position.x * sensor.weightedValue;
        pressure.center.y += sensor.position.y * sensor.weightedValue;
      });
      pressure.normalizedCenter = this.#centerOfPressureHelper.updateAndGetNormalization(pressure.center);
    }

    _console$q.log({ pressure });
    return pressure;
  }
}

/**
 * @typedef { "acceleration" |
 * "gravity" |
 * "linearAcceleration" |
 * "gyroscope" |
 * "magnetometer" |
 * "gameRotation" |
 * "rotation" |
 * "orientation" |
 * "activity" |
 * "stepCounter" |
 * "stepDetector" |
 * "deviceOrientation"
 * } MotionSensorType
 */

const _console$p = createConsole("MotionSensorDataManager", { log: true });

/**
 * @typedef {Object} Vector3
 * @property {number} x
 * @property {number} y
 * @property {number} z
 */

/**
 * @typedef {Object} Quaternion
 * @property {number} x
 * @property {number} y
 * @property {number} z
 * @property {number} w
 */

/**
 * @typedef {Object} Euler
 * @property {number} heading
 * @property {number} pitch
 * @property {number} roll
 */

/**
 * @typedef {"still" |
 * "walking" |
 * "running" |
 * "bicycle" |
 * "vehicle" |
 * "tilting"
 * } ActivityType
 */

/**
 * @typedef {Object} Activity
 * @property {boolean} still
 * @property {boolean} walking
 * @property {boolean} running
 * @property {boolean} bicycle
 * @property {boolean} vehicle
 * @property {boolean} tilting
 */

/**
 * @typedef {"portraitUpright" |
 * "landscapeLeft" |
 * "portraitUpsideDown" |
 * "landscapeRight" |
 * "unknown"
 * } DeviceOrientation
 */




/**
 * @typedef {Object} BaseAccelerationDataEventMessage
 * @property {Vector3} acceleration
 */
/** @typedef {BaseSensorDataEventMessage & BaseAccelerationDataEventMessage} AccelerationDataEventMessage */
/**
 * @typedef {Object} BaseAccelerationDataEvent
 * @property {"acceleration"} type
 * @property {AccelerationDataEventMessage} message
 */
/** @typedef {BaseDeviceEvent & BaseAccelerationDataEvent} AccelerationDataEvent */

/**
 * @typedef {Object} BaseGravityDataEventMessage
 * @property {Vector3} gravity
 */
/** @typedef {BaseSensorDataEventMessage & BaseGravityDataEventMessage} GravityDataEventMessage */
/**
 * @typedef {Object} BaseGravityDataEvent
 * @property {"gravity"} type
 * @property {GravityDataEventMessage & BaseSensorDataEventMessage} message
 */
/** @typedef {BaseDeviceEvent & BaseGravityDataEvent} GravityDataEvent */

/**
 * @typedef {Object} BaseLinearAccelerationDataEventMessage
 * @property {Vector3} linearAcceleration
 */
/** @typedef {BaseSensorDataEventMessage & BaseLinearAccelerationDataEventMessage} LinearAccelerationDataEventMessage */
/**
 * @typedef {Object} BaseLinearAccelerationDataEvent
 * @property {"linearAcceleration"} type
 * @property {LinearAccelerationDataEventMessage & BaseSensorDataEventMessage} message
 */
/** @typedef {BaseDeviceEvent & BaseLinearAccelerationDataEvent} LinearAccelerationDataEvent */

/**
 * @typedef {Object} BaseGyroscopeDataEventMessage
 * @property {Vector3} gyroscope
 */
/** @typedef {BaseSensorDataEventMessage & BaseGyroscopeDataEventMessage} GyroscopeDataEventMessage */
/**
 * @typedef {Object} BaseGyroscopeDataEvent
 * @property {"gyroscope"} type
 * @property {GyroscopeDataEventMessage & BaseSensorDataEventMessage} message
 */
/** @typedef {BaseDeviceEvent & BaseGyroscopeDataEvent} GyroscopeDataEvent */

/**
 * @typedef {Object} BaseMagnetometerDataEventMessage
 * @property {Vector3} magnetometer
 */
/** @typedef {BaseSensorDataEventMessage & BaseMagnetometerDataEventMessage} MagnetometerDataEventMessage */
/**
 * @typedef {Object} BaseMagnetometerDataEvent
 * @property {"magnetometer"} type
 * @property {MagnetometerDataEventMessage & BaseSensorDataEventMessage} message
 */
/** @typedef {BaseDeviceEvent & BaseMagnetometerDataEvent} MagnetometerDataEvent */

/**
 * @typedef {Object} BaseGameRotationDataEventMessage
 * @property {Quaternion} gameRotation
 */
/** @typedef {BaseSensorDataEventMessage & BaseGameRotationDataEventMessage} GameRotationDataEventMessage */
/**
 * @typedef {Object} BaseGameRotationDataEvent
 * @property {"gameRotation"} type
 * @property {GameRotationDataEventMessage & BaseSensorDataEventMessage} message
 */
/** @typedef {BaseDeviceEvent & BaseGameRotationDataEvent} GameRotationDataEvent */

/**
 * @typedef {Object} BaseRotationDataEventMessage
 * @property {Quaternion} rotation
 */
/** @typedef {BaseSensorDataEventMessage & BaseRotationDataEventMessage} RotationDataEventMessage */
/**
 * @typedef {Object} BaseRotationDataEvent
 * @property {"rotation"} type
 * @property {RotationDataEventMessage & BaseSensorDataEventMessage} message
 */
/** @typedef {BaseDeviceEvent & BaseRotationDataEvent} RotationDataEvent */

/**
 * @typedef {Object} BaseOrientationDataEventMessage
 * @property {Euler} orientation
 */
/** @typedef {BaseSensorDataEventMessage & BaseOrientationDataEventMessage} OrientationDataEventMessage */
/**
 * @typedef {Object} BaseOrientationDataEvent
 * @property {"orientation"} type
 * @property {OrientationDataEventMessage & BaseSensorDataEventMessage} message
 */
/** @typedef {BaseDeviceEvent & BaseOrientationDataEvent} OrientationDataEvent */

/**
 * @typedef {Object} BaseActivityDataEventMessage
 * @property {Activity} activity
 */
/** @typedef {BaseSensorDataEventMessage & BaseActivityDataEventMessage} ActivityDataEventMessage */
/**
 * @typedef {Object} BaseActivityDataEvent
 * @property {"activity"} type
 * @property {ActivityDataEventMessage & BaseSensorDataEventMessage} message
 */
/** @typedef {BaseDeviceEvent & BaseActivityDataEvent} ActivityDataEvent */

/**
 * @typedef {Object} BaseStepDetectorDataEventMessage
 * @property {Object} stepDetector
 */
/** @typedef {BaseSensorDataEventMessage & BaseStepDetectorDataEventMessage} StepDetectorDataEventMessage */
/**
 * @typedef {Object} BaseStepDetectorDataEvent
 * @property {"stepDetector"} type
 * @property {StepDetectorDataEventMessage & BaseSensorDataEventMessage} message
 */
/** @typedef {BaseDeviceEvent & BaseStepDetectorDataEvent} StepDetectorDataEvent */

/**
 * @typedef {Object} BaseStepCounterDataEventMessage
 * @property {number} stepCounter
 */
/** @typedef {BaseSensorDataEventMessage & BaseStepCounterDataEventMessage} StepCounterDataEventMessage */
/**
 * @typedef {Object} BaseStepCounterDataEvent
 * @property {"stepCounter"} type
 * @property {StepCounterDataEventMessage & BaseSensorDataEventMessage} message
 */
/** @typedef {BaseDeviceEvent & BaseStepCounterDataEvent} StepCounterDataEvent */

/**
 * @typedef {Object} BaseDeviceOrientationDataEventMessage
 * @property {DeviceOrientation} deviceOrientation
 */
/** @typedef {BaseSensorDataEventMessage & BaseDeviceOrientationDataEventMessage} DeviceOrientationDataEventMessage */
/**
 * @typedef {Object} BaseDeviceOrientationDataEvent
 * @property {"deviceOrientation"} type
 * @property {DeviceOrientationDataEventMessage & BaseSensorDataEventMessage} message
 */
/** @typedef {BaseDeviceEvent & BaseDeviceOrientationDataEvent} DeviceOrientationDataEvent */

/**
 * @typedef {AccelerationDataEventMessage |
 * GravityDataEventMessage |
 * LinearAccelerationDataEventMessage |
 * GyroscopeDataEventMessage |
 * MagnetometerDataEventMessage |
 * GameRotationDataEventMessage |
 * RotationDataEventMessage |
 * OrientationDataEventMessage |
 * ActivityDataEventMessage |
 * StepDetectorDataEventMessage |
 * StepCounterDataEventMessage |
 * DeviceOrientationDataEventMessage
 * } MotionSensorDataEventMessage
 */
/**
 *
 * @typedef { AccelerationDataEvent |
 * GravityDataEvent |
 * LinearAccelerationDataEvent |
 * GyroscopeDataEvent |
 * MagnetometerDataEvent |
 * GameRotationDataEvent |
 * RotationDataEvent |
 * OrientationDataEvent |
 * ActivityDataEvent |
 * StepDetectorDataEvent |
 * StepCounterDataEvent |
 * DeviceOrientationDataEvent
 * } MotionSensorDataEvent
 */

class MotionSensorDataManager {
  /** @type {MotionSensorType[]} */
  static #Types = [
    "acceleration",
    "gravity",
    "linearAcceleration",
    "gyroscope",
    "magnetometer",
    "gameRotation",
    "rotation",
    "orientation",
    "activity",
    "stepCounter",
    "stepDetector",
    "deviceOrientation",
  ];
  static get Types() {
    return this.#Types;
  }
  static #ContinuousTypes = this.#Types.filter((type) => {
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
  });
  static get ContinuousTypes() {
    return this.#ContinuousTypes;
  }

  static #Vector3Size = 3 * 2;
  static get Vector3Size() {
    return this.#Vector3Size;
  }
  get vector3Size() {
    return MotionSensorDataManager.Vector3Size;
  }

  /**
   * @param {DataView} dataView
   * @param {number} scalar
   * @returns {Vector3}
   */
  parseVector3(dataView, scalar) {
    let [x, y, z] = [dataView.getInt16(0, true), dataView.getInt16(2, true), dataView.getInt16(4, true)].map(
      (value) => value * scalar
    );

    /** @type {Vector3} */
    const vector = { x, y, z };

    _console$p.log({ vector });
    return vector;
  }

  static #QuaternionSize = 4 * 2;
  static get QuaternionSize() {
    return this.#QuaternionSize;
  }
  get quaternionSize() {
    return MotionSensorDataManager.QuaternionSize;
  }

  /**
   * @param {DataView} dataView
   * @param {number} scalar
   * @returns {Quaternion}
   */
  parseQuaternion(dataView, scalar) {
    let [x, y, z, w] = [
      dataView.getInt16(0, true),
      dataView.getInt16(2, true),
      dataView.getInt16(4, true),
      dataView.getInt16(6, true),
    ].map((value) => value * scalar);

    /** @type {Quaternion} */
    const quaternion = { x, y, z, w };

    _console$p.log({ quaternion });
    return quaternion;
  }

  static #EulerSize = 3 * 2;
  static get EulerSize() {
    return this.#EulerSize;
  }
  get eulerSize() {
    return MotionSensorDataManager.EulerSize;
  }

  /**
   * @param {DataView} dataView
   * @param {number} scalar
   * @returns {Euler}
   */
  parseEuler(dataView, scalar) {
    let [heading, pitch, roll] = [
      dataView.getInt16(0, true),
      dataView.getInt16(2, true),
      dataView.getInt16(4, true),
    ].map((value) => value * scalar);

    pitch *= -1;
    heading *= -1;

    /** @type {Euler} */
    const euler = { heading, pitch, roll };

    _console$p.log({ euler });
    return euler;
  }

  /** @param {DataView} dataView */
  parseStepCounter(dataView) {
    _console$p.log("parseStepCounter", dataView);
    const stepCount = dataView.getUint32(0, true);
    _console$p.log({ stepCount });
    return stepCount;
  }

  /** @type {ActivityType[]} */
  static #ActivityTypes = ["still", "walking", "running", "bicycle", "vehicle", "tilting"];
  static get ActivityTypes() {
    return this.#ActivityTypes;
  }
  get #activityTypes() {
    return MotionSensorDataManager.#ActivityTypes;
  }
  /** @param {DataView} dataView */
  parseActivity(dataView) {
    _console$p.log("parseActivity", dataView);
    /** @type {Activity} */
    const activity = {};

    const activityBitfield = dataView.getUint8(0);
    _console$p.log("activityBitfield", activityBitfield.toString(2));
    this.#activityTypes.forEach((activityType, index) => {
      activity[activityType] = Boolean(activityBitfield & (1 << index));
    });

    _console$p.log("activity", activity);

    return activity;
  }

  /** @type {DeviceOrientation[]} */
  static #DeviceOrientations = ["portraitUpright", "landscapeLeft", "portraitUpsideDown", "landscapeRight", "unknown"];
  static get DeviceOrientations() {
    return this.#DeviceOrientations;
  }
  get #deviceOrientations() {
    return MotionSensorDataManager.#DeviceOrientations;
  }
  /** @param {DataView} dataView */
  parseDeviceOrientation(dataView) {
    _console$p.log("parseDeviceOrientation", dataView);
    const index = dataView.getUint8(0);
    const deviceOrientation = this.#deviceOrientations[index];
    _console$p.assertWithError(deviceOrientation, "undefined deviceOrientation");
    _console$p.log({ deviceOrientation });
    return deviceOrientation;
  }
}

/** @typedef {"barometer"} BarometerSensorType */




/**
 * @typedef {Object} BaseBarometerSensorDataEventMessage
 * @property {number} barometer
 */
/** @typedef {BaseSensorDataEventMessage & BaseBarometerSensorDataEventMessage} BarometerSensorDataEventMessage */
/**
 * @typedef {Object} BaseBarometerSensorDataEvent
 * @property {"barometer"} type
 * @property {BarometerSensorDataEventMessage} message
 */
/** @typedef {BaseDeviceEvent & BaseBarometerSensorDataEvent} BarometerSensorDataEvent */

const _console$o = createConsole("BarometerSensorDataManager", { log: true });

class BarometerSensorDataManager {
  /** @type {BarometerSensorType[]} */
  static #Types = ["barometer"];
  static get Types() {
    return this.#Types;
  }
  static get ContinuousTypes() {
    return this.Types;
  }

  /** @param {number} pressure */
  #calculcateAltitude(pressure) {
    const P0 = 101325; // Standard atmospheric pressure at sea level in Pascals
    const T0 = 288.15; // Standard temperature at sea level in Kelvin
    const L = 0.0065; // Temperature lapse rate in K/m
    const R = 8.3144598; // Universal gas constant in J/(mol·K)
    const g = 9.80665; // Acceleration due to gravity in m/s²
    const M = 0.0289644; // Molar mass of Earth's air in kg/mol

    const exponent = (R * L) / (g * M);
    const h = (T0 / L) * (1 - Math.pow(pressure / P0, exponent));

    return h;
  }

  /**
   * @param {DataView} dataView
   * @param {number} scalar
   */
  parseData(dataView, scalar) {
    const pressure = dataView.getUint32(0, true) * scalar;
    const altitude = this.#calculcateAltitude(pressure);
    _console$o.log({ pressure, altitude });
    return { pressure };
  }
}

const _console$n = createConsole("ParseUtils", { log: true });

/**
 * @param {DataView} dataView
 * @param {number} byteOffset
 */
function parseStringFromDataView(dataView, byteOffset = 0) {
  const stringLength = dataView.getUint8(byteOffset++);
  const string = textDecoder.decode(
    dataView.buffer.slice(dataView.byteOffset + byteOffset, dataView.byteOffset + byteOffset + stringLength)
  );
  byteOffset += stringLength;
  return { string, byteOffset };
}

/**
 * @callback ParseMessageCallback
 * @param {string} messageType
 * @param {DataView} dataView
 */

/**
 * @param {DataView} dataView
 * @param {string[]} enumeration
 * @param {ParseMessageCallback} callback
 * @param {Object} [context]
 * @param {boolean} parseMessageLengthAsUint16
 */
function parseMessage(dataView, enumeration, callback, context, parseMessageLengthAsUint16 = false) {
  let byteOffset = 0;
  while (byteOffset < dataView.byteLength) {
    const messageTypeEnum = dataView.getUint8(byteOffset++);
    const messageType = enumeration[messageTypeEnum];

    /** @type {number} */
    let messageLength;
    if (parseMessageLengthAsUint16) {
      messageLength = dataView.getUint16(byteOffset, true);
      byteOffset += 2;
    } else {
      messageLength = dataView.getUint8(byteOffset++);
    }

    _console$n.log({ messageTypeEnum, messageType, messageLength, dataView, byteOffset });
    _console$n.assertWithError(messageType, `invalid messageTypeEnum ${messageTypeEnum}`);

    const _dataView = sliceDataView(dataView, byteOffset, messageLength);
    _console$n.log({ _dataView });

    callback(messageType, _dataView, context);

    byteOffset += messageLength;
  }
}

const _console$m = createConsole("SensorDataManager", { log: true });





/** @typedef {MotionSensorType | PressureSensorType | BarometerSensorType} SensorType */

/** @typedef {"getPressurePositions" | "getSensorScalars" | "sensorData"} SensorDataMessageType */
/** @typedef {SensorDataMessageType | SensorType} SensorDataManagerEventType */





/**
 * @typedef {Object} BaseSensorDataEventMessage
 * @property {number} timestamp
 */




/** @typedef {PressureSensorDataEventMessage | MotionSensorDataEventMessage | BarometerSensorDataEventMessage} SensorDataEventMessage */

/**
 * @typedef {Object} BaseSensorDataEvent
 * @property {"sensorData"} type
 * @property {{sensorType: SensorType} & SensorDataEventMessage} message
 */
/** @typedef {BaseDeviceEvent & BaseSensorDataEvent} SensorDataEvent */




/** @typedef {SensorDataEvent | PressureSensorDataEvent | MotionSensorDataEvent | BarometerSensorDataEvent} SensorDataManagerEvent */

class SensorDataManager {
  // MESSAGE TYPES

  /** @type {SensorDataMessageType[]} */
  static #MessageTypes = ["getPressurePositions", "getSensorScalars", "sensorData"];
  static get MessageTypes() {
    return this.#MessageTypes;
  }
  get messageTypes() {
    return SensorDataManager.MessageTypes;
  }

  // MANAGERS

  pressureSensorDataManager = new PressureSensorDataManager();
  motionSensorDataManager = new MotionSensorDataManager();
  barometerSensorDataManager = new BarometerSensorDataManager();

  // TYPES

  /** @type {SensorType[]} */
  static #Types = [
    ...PressureSensorDataManager.Types,
    ...MotionSensorDataManager.Types,
    ...BarometerSensorDataManager.Types,
  ];
  static #ContinuousTypes = [
    ...PressureSensorDataManager.ContinuousTypes,
    ...MotionSensorDataManager.ContinuousTypes,
    ...BarometerSensorDataManager.ContinuousTypes,
  ];
  static get Types() {
    return this.#Types;
  }
  static get ContinuousTypes() {
    return this.#ContinuousTypes;
  }
  get types() {
    return SensorDataManager.Types;
  }

  /** @type {Map.<SensorType, number>} */
  #scalars = new Map();

  /** @param {string} sensorType */
  static AssertValidSensorType(sensorType) {
    _console$m.assertTypeWithError(sensorType, "string");
    _console$m.assertWithError(this.#Types.includes(sensorType), `invalid sensorType "${sensorType}"`);
  }
  /** @param {number} sensorTypeEnum */
  static AssertValidSensorTypeEnum(sensorTypeEnum) {
    _console$m.assertTypeWithError(sensorTypeEnum, "number");
    _console$m.assertWithError(sensorTypeEnum in this.#Types, `invalid sensorTypeEnum ${sensorTypeEnum}`);
  }

  // EVENT DISPATCHER

  /** @type {SensorDataManagerEventType[]} */
  static #EventTypes = [...this.#MessageTypes, ...this.#Types];
  static get EventTypes() {
    return this.#EventTypes;
  }
  get eventTypes() {
    return SensorDataManager.#EventTypes;
  }
  /** @type {EventDispatcher} */
  eventDispatcher;

  /** @param {SensorDataManagerEvent} event */
  #dispatchEvent(event) {
    this.eventDispatcher.dispatchEvent(event);
  }

  /** @param {SensorDataManagerEventType} eventType */
  waitForEvent(eventType) {
    return this.eventDispatcher.waitForEvent(eventType);
  }

  // DATA

  /** @param {DataView} dataView */
  #parseData(dataView) {
    _console$m.log("sensorData", Array.from(new Uint8Array(dataView.buffer)));

    let byteOffset = 0;
    const timestamp = parseTimestamp(dataView, byteOffset);
    byteOffset += 2;

    const _dataView = new DataView(dataView.buffer, byteOffset);

    parseMessage(_dataView, SensorDataManager.Types, this.#parseDataCallback.bind(this), { timestamp });
  }

  /**
   * @param {SensorType} sensorType
   * @param {DataView} dataView
   * @param {{timestamp: number}} context
   */
  #parseDataCallback(sensorType, dataView, { timestamp }) {
    const scalar = this.#scalars.get(sensorType);

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
        _console$m.error(`uncaught sensorType "${sensorType}"`);
    }

    _console$m.assertWithError(sensorData != null, `no sensorData defined for sensorType "${sensorType}"`);

    _console$m.log({ sensorType, sensorData, sensorData });
    this.#dispatchEvent({ type: sensorType, message: { [sensorType]: sensorData, timestamp } });
    this.#dispatchEvent({ type: "sensorData", message: { [sensorType]: sensorData, sensorType, timestamp } });
  }

  /** @param {DataView} dataView */
  parseScalars(dataView) {
    for (let byteOffset = 0; byteOffset < dataView.byteLength; byteOffset += 5) {
      const sensorTypeIndex = dataView.getUint8(byteOffset);
      const sensorType = SensorDataManager.Types[sensorTypeIndex];
      if (!sensorType) {
        _console$m.warn(`unknown sensorType index ${sensorTypeIndex}`);
        continue;
      }
      const sensorScalar = dataView.getFloat32(byteOffset + 1, true);
      _console$m.log({ sensorType, sensorScalar });
      this.#scalars.set(sensorType, sensorScalar);
    }
  }

  // MESSAGE

  /**
   * @param {SensorDataMessageType} messageType
   * @param {DataView} dataView
   */
  parseMessage(messageType, dataView) {
    _console$m.log({ messageType });

    switch (messageType) {
      case "getSensorScalars":
        this.parseScalars(dataView);
        break;
      case "getPressurePositions":
        this.pressureSensorDataManager.parsePositions(dataView);
        break;
      case "sensorData":
        this.#parseData(dataView);
        break;
      default:
        throw Error(`uncaught messageType ${messageType}`);
    }
  }

  /**
   * @callback SendMessageCallback
   * @param {{type: SensorDataMessageType, data: ArrayBuffer}[]} messages
   * @param {boolean} sendImmediately
   */

  /** @type {SendMessageCallback} */
  sendMessage;
}

const _console$l = createConsole("SensorConfigurationManager", { log: true });


/**
 * @typedef {Object} SensorConfiguration
 * @property {number} [pressure]
 * @property {number} [acceleration]
 * @property {number} [gravity]
 * @property {number} [linearAcceleration]
 * @property {number} [gyroscope]
 * @property {number} [magnetometer]
 * @property {number} [gameRotation]
 * @property {number} [rotation]
 * @property {number} [orientation]
 * @property {number} [activity]
 * @property {number} [stepDetector]
 * @property {number} [stepCounter]
 * @property {number} [deviceOrientation]
 * @property {number} [barometer]
 */

/** @typedef {"getSensorConfiguration" | "setSensorConfiguration"} SensorConfigurationMessageType */
/** @typedef {SensorConfigurationMessageType} SensorConfigurationManagerEventType */





/**
 * @typedef {Object} SensorConfigurationManagerEvent
 * @property {Device} target
 * @property {SensorConfigurationManagerEventType} type
 * @property {Object} message
 */

class SensorConfigurationManager {
  // MESSAGE TYPES

  /** @type {SensorConfigurationMessageType[]} */
  static #MessageTypes = ["getSensorConfiguration", "setSensorConfiguration"];
  static get MessageTypes() {
    return this.#MessageTypes;
  }
  get messageTypes() {
    return SensorConfigurationManager.MessageTypes;
  }

  // EVENT DISPATCHER

  /** @type {SensorConfigurationManagerEventType[]} */
  static #EventTypes = [...this.#MessageTypes];
  static get EventTypes() {
    return this.#EventTypes;
  }
  get eventTypes() {
    return SensorConfigurationManager.#EventTypes;
  }
  /** @type {EventDispatcher} */
  eventDispatcher;

  /** @param {SensorConfigurationManagerEvent} event */
  #dispatchEvent(event) {
    this.eventDispatcher.dispatchEvent(event);
  }

  /** @param {SensorConfigurationManagerEventType} eventType */
  waitForEvent(eventType) {
    return this.eventDispatcher.waitForEvent(eventType);
  }

  // SENSOR TYPES

  static get #SensorTypes() {
    return SensorDataManager.Types;
  }
  get #sensorTypes() {
    return SensorConfigurationManager.#SensorTypes;
  }

  /** @type {SensorType[]} */
  #availableSensorTypes;
  /** @param {SensorType} sensorType */
  #assertAvailableSensorType(sensorType) {
    _console$l.assertWithError(this.#availableSensorTypes, "must get initial sensorConfiguration");
    const isSensorTypeAvailable = this.#availableSensorTypes?.includes(sensorType);
    _console$l.assert(isSensorTypeAvailable, `unavailable sensor type "${sensorType}"`);
    return isSensorTypeAvailable;
  }

  /** @type {SensorConfiguration} */
  #configuration;
  get configuration() {
    return this.#configuration;
  }

  /** @param {SensorConfiguration} updatedConfiguration */
  #updateConfiguration(updatedConfiguration) {
    this.#configuration = updatedConfiguration;
    _console$l.log({ updatedConfiguration: this.#configuration });
    this.#dispatchEvent({
      type: "getSensorConfiguration",
      message: { sensorConfiguration: this.configuration },
    });
  }

  /** @param {SensorConfiguration} sensorConfiguration */
  #isRedundant(sensorConfiguration) {
    /** @type {SensorType[]} */
    let sensorTypes = Object.keys(sensorConfiguration);
    return sensorTypes.every((sensorType) => {
      return this.configuration[sensorType] == sensorConfiguration[sensorType];
    });
  }

  /**
   * @param {SensorConfiguration} newSensorConfiguration
   * @param {boolean} [clearRest]
   */
  async setConfiguration(newSensorConfiguration, clearRest) {
    if (clearRest) {
      newSensorConfiguration = Object.assign({ ...this.zeroSensorConfiguration }, newSensorConfiguration);
    }
    _console$l.log({ newSensorConfiguration });
    if (this.#isRedundant(newSensorConfiguration)) {
      _console$l.log("redundant sensor configuration");
      return;
    }
    const setSensorConfigurationData = this.#createData(newSensorConfiguration);
    _console$l.log({ setSensorConfigurationData });

    const promise = this.waitForEvent("getSensorConfiguration");
    this.sendMessage([{ type: "setSensorConfiguration", data: setSensorConfigurationData.buffer }]);
    await promise;
  }

  /** @param {DataView} dataView */
  #parse(dataView) {
    /** @type {SensorConfiguration} */
    const parsedSensorConfiguration = {};
    for (let byteOffset = 0; byteOffset < dataView.byteLength; byteOffset += 3) {
      const sensorTypeIndex = dataView.getUint8(byteOffset);
      const sensorType = SensorDataManager.Types[sensorTypeIndex];
      if (!sensorType) {
        _console$l.warn(`unknown sensorType index ${sensorTypeIndex}`);
        continue;
      }
      const sensorRate = dataView.getUint16(byteOffset + 1, true);
      _console$l.log({ sensorType, sensorRate });
      parsedSensorConfiguration[sensorType] = sensorRate;
    }
    _console$l.log({ parsedSensorConfiguration });
    this.#availableSensorTypes = Object.keys(parsedSensorConfiguration);
    return parsedSensorConfiguration;
  }

  static #MaxSensorRate = 2 ** 16 - 1;
  static get MaxSensorRate() {
    return this.#MaxSensorRate;
  }
  get maxSensorRate() {
    return SensorConfigurationManager.MaxSensorRate;
  }
  static #SensorRateStep = 5;
  static get SensorRateStep() {
    return this.#SensorRateStep;
  }
  get sensorRateStep() {
    return SensorConfigurationManager.SensorRateStep;
  }

  /** @param {sensorRate} number */
  static #AssertValidSensorRate(sensorRate) {
    _console$l.assertTypeWithError(sensorRate, "number");
    _console$l.assertWithError(sensorRate >= 0, `sensorRate must be 0 or greater (got ${sensorRate})`);
    _console$l.assertWithError(sensorRate < this.MaxSensorRate, `sensorRate must be 0 or greater (got ${sensorRate})`);
    _console$l.assertWithError(
      sensorRate % this.SensorRateStep == 0,
      `sensorRate must be multiple of ${this.SensorRateStep}`
    );
  }

  /** @param {sensorRate} number */
  #assertValidSensorRate(sensorRate) {
    SensorConfigurationManager.#AssertValidSensorRate(sensorRate);
  }

  /** @param {SensorConfiguration} sensorConfiguration */
  #createData(sensorConfiguration) {
    /** @type {SensorType[]} */
    let sensorTypes = Object.keys(sensorConfiguration);
    sensorTypes = sensorTypes.filter((sensorType) => this.#assertAvailableSensorType(sensorType));

    const dataView = new DataView(new ArrayBuffer(sensorTypes.length * 3));
    sensorTypes.forEach((sensorType, index) => {
      SensorDataManager.AssertValidSensorType(sensorType);
      const sensorTypeEnum = SensorDataManager.Types.indexOf(sensorType);
      dataView.setUint8(index * 3, sensorTypeEnum);

      const sensorRate = sensorConfiguration[sensorType];
      this.#assertValidSensorRate(sensorRate);
      dataView.setUint16(index * 3 + 1, sensorConfiguration[sensorType], true);
    });
    _console$l.log({ sensorConfigurationData: dataView });
    return dataView;
  }

  // ZERO

  /** @type {SensorConfiguration} */
  static #ZeroSensorConfiguration = {};
  static get ZeroSensorConfiguration() {
    return this.#ZeroSensorConfiguration;
  }
  static {
    this.#SensorTypes.forEach((sensorType) => {
      this.#ZeroSensorConfiguration[sensorType] = 0;
    });
  }
  get zeroSensorConfiguration() {
    /** @type {SensorConfiguration} */
    const zeroSensorConfiguration = {};
    this.#sensorTypes.forEach((sensorType) => {
      zeroSensorConfiguration[sensorType] = 0;
    });
    return zeroSensorConfiguration;
  }
  async clearSensorConfiguration() {
    return this.setConfiguration(this.zeroSensorConfiguration);
  }

  // MESSAGE

  /**
   * @param {SensorConfigurationMessageType} messageType
   * @param {DataView} dataView
   */
  parseMessage(messageType, dataView) {
    _console$l.log({ messageType });

    switch (messageType) {
      case "getSensorConfiguration":
      case "setSensorConfiguration":
        const newSensorConfiguration = this.#parse(dataView);
        this.#updateConfiguration(newSensorConfiguration);
        break;
      default:
        throw Error(`uncaught messageType ${messageType}`);
    }
  }

  /**
   * @callback SendMessageCallback
   * @param {{type: SensorConfigurationMessageType, data: ArrayBuffer}[]} messages
   * @param {boolean} sendImmediately
   */

  /** @type {SendMessageCallback} */
  sendMessage;
}

const _console$k = createConsole("TfliteManager", { log: true });

/**
 * @typedef { "getTfliteName" |
 * "setTfliteName" |
 * "getTfliteTask" |
 * "setTfliteTask" |
 * "getTfliteSampleRate" |
 * "setTfliteSampleRate" |
 * "getTfliteSensorTypes" |
 * "setTfliteSensorTypes" |
 * "tfliteIsReady" |
 * "getTfliteCaptureDelay" |
 * "setTfliteCaptureDelay" |
 * "getTfliteThreshold" |
 * "setTfliteThreshold" |
 * "getTfliteInferencingEnabled" |
 * "setTfliteInferencingEnabled" |
 * "tfliteInference"
 * } TfliteMessageType
 */

/** @typedef {"classification" | "regression"} TfliteTask */





/** @typedef {TfliteMessageType} TfliteManagerEventType */



/**
 * @typedef {Object} BaseTfliteNameEvent
 * @property {"getTfliteName"} type
 * @property {{tfliteName: string}} message
 */
/** @typedef {BaseDeviceEvent & BaseTfliteNameEvent} TfliteNameEvent */

/**
 * @typedef {Object} BaseTfliteTaskEvent
 * @property {"getTfliteTask"} type
 * @property {{tfliteTask: TfliteTask}} message
 */
/** @typedef {BaseDeviceEvent & BaseTfliteNameEvent} TfliteTaskEvent */

/**
 * @typedef {Object} BaseTfliteSampleRateEvent
 * @property {"getTfliteSampleRate"} type
 * @property {{tfliteSampleRate: number}} message
 */
/** @typedef {BaseDeviceEvent & BaseTfliteSampleRateEvent} TfliteSampleRateEvent */

/**
 * @typedef {Object} BaseTfliteSensorTypesEvent
 * @property {"getTfliteSensorTypes"} type
 * @property {{tfliteSensorTypes: SensorType[]}} message
 */
/** @typedef {BaseDeviceEvent & BaseTfliteSensorTypesEvent} TfliteSensorTypesEvent */

/**
 * @typedef {Object} BaseTfliteIsReadyEvent
 * @property {"tfliteIsReady"} type
 * @property {{tfliteIsReady: boolean}} message
 */
/** @typedef {BaseDeviceEvent & BaseTfliteIsReadyEvent} TfliteIsReadyEvent */

/**
 * @typedef {Object} BaseTfliteCaptureDelayEvent
 * @property {"getTfliteCaptureDelay"} type
 * @property {{tfliteCaptureDelay: number}} message
 */
/** @typedef {BaseDeviceEvent & BaseTfliteCaptureDelayEvent} TfliteCaptureDelayEvent */

/**
 * @typedef {Object} BaseTfliteThresholdEvent
 * @property {"getTfliteThreshold"} type
 * @property {{tfliteThreshold: number}} message
 */
/** @typedef {BaseDeviceEvent & BaseTfliteThresholdEvent} TfliteThresholdEvent */

/**
 * @typedef {Object} BaseTfliteInferencingEnabledEvent
 * @property {"getTfliteInferencingEnabled"} type
 * @property {{tfliteInferencingEnabled: boolean}} message
 */
/** @typedef {BaseDeviceEvent & BaseTfliteInferencingEnabledEvent} TfliteInferencingEnabledEvent */

/**
 * @typedef {Object} BaseTfliteInferenceEvent
 * @property {"tfliteInference"} type
 * @property {{tfliteInference: TfliteInference}} message
 */
/** @typedef {BaseDeviceEvent & BaseTfliteInferenceEvent} TfliteInferenceEvent */

/**
 * @typedef {TfliteNameEvent |
 * TfliteTaskEvent |
 * TfliteSampleRateEvent |
 * TfliteSensorTypesEvent |
 * TfliteIsReadyEvent |
 * TfliteCaptureDelayEvent |
 * TfliteThresholdEvent |
 * TfliteInferencingEnabledEvent |
 * BaseTfliteInferenceEvent
 * } TfliteManagerEvent
 */

/** @typedef {(event: TfliteManagerEvent) => void} TfliteManagerEventListener */

let TfliteManager$1 = class TfliteManager {
  /** @type {TfliteMessageType[]} */
  static #MessageTypes = [
    "getTfliteName",
    "setTfliteName",
    "getTfliteTask",
    "setTfliteTask",
    "getTfliteSampleRate",
    "setTfliteSampleRate",
    "getTfliteSensorTypes",
    "setTfliteSensorTypes",
    "tfliteIsReady",
    "getTfliteCaptureDelay",
    "setTfliteCaptureDelay",
    "getTfliteThreshold",
    "setTfliteThreshold",
    "getTfliteInferencingEnabled",
    "setTfliteInferencingEnabled",
    "tfliteInference",
  ];
  static get MessageTypes() {
    return this.#MessageTypes;
  }
  get messageTypes() {
    return TfliteManager.MessageTypes;
  }

  // TASK

  /** @type {TfliteTask[]} */
  static #Tasks = ["classification", "regression"];
  static get Tasks() {
    return this.#Tasks;
  }
  get tasks() {
    return TfliteManager.Tasks;
  }
  /** @param {TfliteTask} task */
  #assertValidTask(task) {
    _console$k.assertEnumWithError(task, this.tasks);
  }
  /** @param {number} taskEnum */
  #assertValidTaskEnum(taskEnum) {
    _console$k.assertWithError(this.tasks[taskEnum], `invalid taskEnum ${taskEnum}`);
  }

  // EVENT DISPATCHER

  /** @type {TfliteManagerEventType[]} */
  static #EventTypes = [...this.#MessageTypes];
  static get EventTypes() {
    return this.#EventTypes;
  }
  get eventTypes() {
    return TfliteManager.#EventTypes;
  }
  /** @type {EventDispatcher} */
  eventDispatcher;

  /**
   * @param {TfliteManagerEventType} type
   * @param {TfliteManagerEventListener} listener
   * @param {EventDispatcherOptions} [options]
   */
  addEventListener(type, listener, options) {
    this.eventDispatcher.addEventListener(type, listener, options);
  }

  /** @param {TfliteManagerEvent} event */
  #dispatchEvent(event) {
    this.eventDispatcher.dispatchEvent(event);
  }

  /**
   * @param {TfliteManagerEventType} type
   * @param {TfliteManagerEventListener} listener
   */
  removeEventListener(type, listener) {
    return this.eventDispatcher.removeEventListener(type, listener);
  }

  /** @param {TfliteManagerEventType} eventType */
  waitForEvent(eventType) {
    return this.eventDispatcher.waitForEvent(eventType);
  }

  // PROPERTIES

  /** @type {string} */
  #name;
  get name() {
    return this.#name;
  }
  /** @param {DataView} dataView */
  #parseName(dataView) {
    _console$k.log("parseName", dataView);
    const name = textDecoder.decode(dataView);
    this.#updateName(name);
  }
  /** @param {string} name */
  #updateName(name) {
    _console$k.log({ name });
    this.#name = name;
    this.#dispatchEvent({ type: "getTfliteName", message: { tfliteName: name } });
  }
  /**
   * @param {string} newName
   * @param {boolean} sendImmediately
   */
  async setName(newName, sendImmediately) {
    _console$k.assertTypeWithError(newName, "string");
    if (this.name == newName) {
      _console$k.log(`redundant name assignment ${newName}`);
      return;
    }

    const promise = this.waitForEvent("getTfliteName");

    const setNameData = textEncoder.encode(newName);
    this.sendMessage([{ type: "setTfliteName", data: setNameData.buffer }], sendImmediately);

    await promise;
  }

  /** @type {TfliteTask} */
  #task;
  get task() {
    return this.#task;
  }
  /** @param {DataView} dataView */
  #parseTask(dataView) {
    _console$k.log("parseTask", dataView);
    const taskEnum = dataView.getUint8(0);
    this.#assertValidTaskEnum(taskEnum);
    const task = this.tasks[taskEnum];
    this.#updateTask(task);
  }
  /** @param {TfliteTask} task */
  #updateTask(task) {
    _console$k.log({ task });
    this.#task = task;
    this.#dispatchEvent({ type: "getTfliteTask", message: { tfliteTask: task } });
  }
  /**
   * @param {TfliteTask} newTask
   * @param {boolean} sendImmediately
   */
  async setTask(newTask, sendImmediately) {
    this.#assertValidTask(newTask);
    if (this.task == newTask) {
      _console$k.log(`redundant task assignment ${newTask}`);
      return;
    }

    const promise = this.waitForEvent("getTfliteTask");

    const taskEnum = this.tasks.indexOf(newTask);
    this.sendMessage([{ type: "setTfliteTask", data: Uint8Array.from([taskEnum]).buffer }], sendImmediately);

    await promise;
  }

  /** @type {number} */
  #sampleRate;
  get sampleRate() {
    return this.#sampleRate;
  }
  /** @param {DataView} dataView */
  #parseSampleRate(dataView) {
    _console$k.log("parseSampleRate", dataView);
    const sampleRate = dataView.getUint16(0, true);
    this.#updateSampleRate(sampleRate);
  }
  #updateSampleRate(sampleRate) {
    _console$k.log({ sampleRate });
    this.#sampleRate = sampleRate;
    this.#dispatchEvent({ type: "getTfliteSampleRate", message: { tfliteSampleRate: sampleRate } });
  }
  /**
   * @param {number} newSampleRate
   * @param {boolean} sendImmediately
   */
  async setSampleRate(newSampleRate, sendImmediately) {
    _console$k.assertTypeWithError(newSampleRate, "number");
    newSampleRate -= newSampleRate % SensorConfigurationManager.SensorRateStep;
    _console$k.assertWithError(
      newSampleRate >= SensorConfigurationManager.SensorRateStep,
      `sampleRate must be multiple of ${SensorConfigurationManager.SensorRateStep} greater than 0 (got ${newSampleRate})`
    );
    if (this.#sampleRate == newSampleRate) {
      _console$k.log(`redundant sampleRate assignment ${newSampleRate}`);
      return;
    }

    const promise = this.waitForEvent("getTfliteSampleRate");

    const dataView = new DataView(new ArrayBuffer(2));
    dataView.setUint16(0, newSampleRate, true);
    this.sendMessage([{ type: "setTfliteSampleRate", data: dataView.buffer }], sendImmediately);

    await promise;
  }

  /** @type {SensorType[]} */
  static #SensorTypes = ["pressure", "linearAcceleration", "gyroscope", "magnetometer"];
  static get SensorTypes() {
    return this.#SensorTypes;
  }

  static AssertValidSensorType(sensorType) {
    SensorDataManager.AssertValidSensorType(sensorType);
    _console$k.assertWithError(this.#SensorTypes.includes(sensorType), `invalid tflite sensorType "${sensorType}"`);
  }

  /** @type {SensorType[]} */
  #sensorTypes = [];
  get sensorTypes() {
    return this.#sensorTypes.slice();
  }
  /** @param {DataView} dataView */
  #parseSensorTypes(dataView) {
    _console$k.log("parseSensorTypes", dataView);
    /** @type {SensorType[]} */
    const sensorTypes = [];
    for (let index = 0; index < dataView.byteLength; index++) {
      const sensorTypeEnum = dataView.getUint8(index);
      const sensorType = SensorDataManager.Types[sensorTypeEnum];
      if (sensorType) {
        sensorTypes.push(sensorType);
      } else {
        _console$k.error(`invalid sensorTypeEnum ${sensorTypeEnum}`);
      }
    }
    this.#updateSensorTypes(sensorTypes);
  }
  /** @param {SensorType[]} sensorTypes */
  #updateSensorTypes(sensorTypes) {
    _console$k.log({ sensorTypes });
    this.#sensorTypes = sensorTypes;
    this.#dispatchEvent({ type: "getTfliteSensorTypes", message: { tfliteSensorTypes: sensorTypes } });
  }
  /**
   * @param {SensorType[]} newSensorTypes
   * @param {boolean} sendImmediately
   */
  async setSensorTypes(newSensorTypes, sendImmediately) {
    newSensorTypes.forEach((sensorType) => {
      TfliteManager.AssertValidSensorType(sensorType);
    });

    const promise = this.waitForEvent("getTfliteSensorTypes");

    newSensorTypes = arrayWithoutDuplicates(newSensorTypes);
    const newSensorTypeEnums = newSensorTypes.map((sensorType) => SensorDataManager.Types.indexOf(sensorType)).sort();
    _console$k.log(newSensorTypes, newSensorTypeEnums);
    this.sendMessage(
      [{ type: "setTfliteSensorTypes", data: Uint8Array.from(newSensorTypeEnums).buffer }],
      sendImmediately
    );

    await promise;
  }

  /** @type {boolean} */
  #isReady;
  get isReady() {
    return this.#isReady;
  }
  /** @param {DataView} dataView */
  #parseIsReady(dataView) {
    _console$k.log("parseIsReady", dataView);
    const isReady = Boolean(dataView.getUint8(0));
    this.#updateIsReady(isReady);
  }
  /** @param {boolean} isReady */
  #updateIsReady(isReady) {
    _console$k.log({ isReady });
    this.#isReady = isReady;
    this.#dispatchEvent({
      type: "tfliteIsReady",
      message: { tfliteIsReady: isReady },
    });
  }
  #assertIsReady() {
    _console$k.assertWithError(this.isReady, `tflite is not ready`);
  }

  /** @type {number} */
  #captureDelay;
  get captureDelay() {
    return this.#captureDelay;
  }
  /** @param {DataView} dataView */
  #parseCaptureDelay(dataView) {
    _console$k.log("parseCaptureDelay", dataView);
    const captureDelay = dataView.getUint16(0, true);
    this.#updateCaptueDelay(captureDelay);
  }
  /** @param {number} captureDelay */
  #updateCaptueDelay(captureDelay) {
    _console$k.log({ captureDelay });
    this.#captureDelay = captureDelay;
    this.#dispatchEvent({
      type: "getTfliteCaptureDelay",
      message: { tfliteCaptureDelay: captureDelay },
    });
  }
  /**
   * @param {number} newCaptureDelay
   * @param {boolean} sendImmediately
   */
  async setCaptureDelay(newCaptureDelay, sendImmediately) {
    _console$k.assertTypeWithError(newCaptureDelay, "number");
    if (this.#captureDelay == newCaptureDelay) {
      _console$k.log(`redundant captureDelay assignment ${newCaptureDelay}`);
      return;
    }

    const promise = this.waitForEvent("getTfliteCaptureDelay");

    const dataView = new DataView(new ArrayBuffer(2));
    dataView.setUint16(0, newCaptureDelay, true);
    this.sendMessage([{ type: "setTfliteCaptureDelay", data: dataView.buffer }], sendImmediately);

    await promise;
  }

  /** @type {number} */
  #threshold;
  get threshold() {
    return this.#threshold;
  }
  /** @param {DataView} dataView */
  #parseThreshold(dataView) {
    _console$k.log("parseThreshold", dataView);
    const threshold = dataView.getFloat32(0, true);
    this.#updateThreshold(threshold);
  }
  /** @param {number} threshold */
  #updateThreshold(threshold) {
    _console$k.log({ threshold });
    this.#threshold = threshold;
    this.#dispatchEvent({
      type: "getTfliteThreshold",
      message: { tfliteThreshold: threshold },
    });
  }
  /**
   * @param {number} newThreshold
   * @param {boolean} sendImmediately
   */
  async setThreshold(newThreshold, sendImmediately) {
    _console$k.assertTypeWithError(newThreshold, "number");
    _console$k.assertWithError(newThreshold >= 0, `threshold must be positive (got ${newThreshold})`);
    if (this.#threshold == newThreshold) {
      _console$k.log(`redundant threshold assignment ${newThreshold}`);
      return;
    }

    const promise = this.waitForEvent("getTfliteThreshold");

    const dataView = new DataView(new ArrayBuffer(4));
    dataView.setFloat32(0, newThreshold, true);
    this.sendMessage([{ type: "setTfliteThreshold", data: dataView.buffer }], sendImmediately);

    await promise;
  }

  /** @type {boolean} */
  #inferencingEnabled;
  get inferencingEnabled() {
    return this.#inferencingEnabled;
  }
  /** @param {DataView} dataView */
  #parseInferencingEnabled(dataView) {
    _console$k.log("parseInferencingEnabled", dataView);
    const inferencingEnabled = Boolean(dataView.getUint8(0));
    this.#updateInferencingEnabled(inferencingEnabled);
  }
  #updateInferencingEnabled(inferencingEnabled) {
    _console$k.log({ inferencingEnabled });
    this.#inferencingEnabled = inferencingEnabled;
    this.#dispatchEvent({
      type: "getTfliteInferencingEnabled",
      message: { tfliteInferencingEnabled: inferencingEnabled },
    });
  }
  /**
   * @param {boolean} newInferencingEnabled
   * @param {boolean} sendImmediately
   */
  async setInferencingEnabled(newInferencingEnabled, sendImmediately) {
    _console$k.assertTypeWithError(newInferencingEnabled, "boolean");
    if (!newInferencingEnabled && !this.isReady) {
      return;
    }
    this.#assertIsReady();
    if (this.#inferencingEnabled == newInferencingEnabled) {
      _console$k.log(`redundant inferencingEnabled assignment ${newInferencingEnabled}`);
      return;
    }

    const promise = this.waitForEvent("getTfliteInferencingEnabled");

    this.sendMessage(
      [
        {
          type: "setTfliteInferencingEnabled",
          data: Uint8Array.from([newInferencingEnabled]).buffer,
        },
      ],
      sendImmediately
    );

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

  /**
   * @typedef {Object} TfliteInference
   * @property {number} timestamp
   * @property {number[]} values
   */

  /** @param {DataView} dataView */
  #parseInference(dataView) {
    _console$k.log("parseInference", dataView);

    const timestamp = parseTimestamp(dataView, 0);
    _console$k.log({ timestamp });

    /** @type {number[]} */
    const values = [];
    for (let index = 0, byteOffset = 2; byteOffset < dataView.byteLength; index++, byteOffset += 4) {
      const value = dataView.getFloat32(byteOffset, true);
      values.push(value);
    }
    _console$k.log("values", values);

    /** @type {TfliteInference} */
    const inference = {
      timestamp,
      values,
    };

    this.#dispatchEvent({ type: "tfliteInference", message: { tfliteInference: inference } });
  }

  /**
   * @param {TfliteMessageType} messageType
   * @param {DataView} dataView
   */
  parseMessage(messageType, dataView) {
    _console$k.log({ messageType });

    switch (messageType) {
      case "getTfliteName":
      case "setTfliteName":
        this.#parseName(dataView);
        break;
      case "getTfliteTask":
      case "setTfliteTask":
        this.#parseTask(dataView);
        break;
      case "getTfliteSampleRate":
      case "setTfliteSampleRate":
        this.#parseSampleRate(dataView);
        break;
      case "getTfliteSensorTypes":
      case "setTfliteSensorTypes":
        this.#parseSensorTypes(dataView);
        break;
      case "tfliteIsReady":
        this.#parseIsReady(dataView);
        break;
      case "getTfliteCaptureDelay":
      case "setTfliteCaptureDelay":
        this.#parseCaptureDelay(dataView);
        break;
      case "getTfliteThreshold":
      case "setTfliteThreshold":
        this.#parseThreshold(dataView);
        break;
      case "getTfliteInferencingEnabled":
      case "setTfliteInferencingEnabled":
        this.#parseInferencingEnabled(dataView);
        break;
      case "tfliteInference":
        this.#parseInference(dataView);
        break;
      default:
        throw Error(`uncaught messageType ${messageType}`);
    }
  }

  /**
   * @callback SendMessageCallback
   * @param {{type: TfliteMessageType, data: ArrayBuffer}[]} messages
   * @param {boolean} sendImmediately
   */

  /** @type {SendMessageCallback} */
  sendMessage;
};

const _console$j = createConsole("DeviceInformationManager", { log: true });

/**
 * @typedef {Object} DeviceInformation
 * @property {string} manufacturerName
 * @property {string} modelNumber
 * @property {string} softwareRevision
 * @property {string} hardwareRevision
 * @property {string} firmwareRevision
 * @property {PnpId} pnpId
 * @property {string} serialNumber
 */

/**
 * @typedef {Object} PnpId
 * @property {"Bluetooth"|"USB"} source
 * @property {number} vendorId
 * @property {number} productId
 * @property {number} productVersion
 */

/**
 * @typedef { "manufacturerName" |
 * "modelNumber" |
 * "softwareRevision" |
 * "hardwareRevision" |
 * "firmwareRevision" |
 * "pnpId" |
 * "serialNumber"
 * } DeviceInformationMessageType
 */

/** @typedef {DeviceInformationMessageType | "deviceInformation"} DeviceInformationManagerEventType */





/**
 * @typedef {Object} BaseDeviceInformationManagerEvent
 * @property {DeviceInformationManagerEventType} type
 * @property {{deviceInformation: DeviceInformation}} message
 */
/** @typedef {BaseDeviceEvent & BaseDeviceInformationManagerEvent} DeviceInformationManagerEvent */

class DeviceInformationManager {
  // MESSAGE TYPES

  /** @type {DeviceInformationMessageType[]} */
  static #MessageTypes = [
    "manufacturerName",
    "modelNumber",
    "softwareRevision",
    "hardwareRevision",
    "firmwareRevision",
    "pnpId",
    "serialNumber",
  ];
  static get MessageTypes() {
    return this.#MessageTypes;
  }
  get messageTypes() {
    return DeviceInformationManager.MessageTypes;
  }

  // EVENT DISPATCHER

  /** @type {DeviceInformationManagerEventType[]} */
  static #EventTypes = [...this.#MessageTypes, "deviceInformation"];
  static get EventTypes() {
    return this.#EventTypes;
  }
  get eventTypes() {
    return DeviceInformationManager.#EventTypes;
  }
  /** @type {EventDispatcher} */
  eventDispatcher;

  /**
   * @param {DeviceInformationManagerEvent} event
   */
  #dispatchEvent(event) {
    this.eventDispatcher.dispatchEvent(event);
  }

  // PROPERTIES

  /** @type {DeviceInformation} */
  information = {
    manufacturerName: null,
    modelNumber: null,
    softwareRevision: null,
    hardwareRevision: null,
    firmwareRevision: null,
    pnpId: null,
  };
  clear() {
    for (const key in this.information) {
      this.information[key] = null;
    }
  }
  get #isComplete() {
    return Object.values(this.information).every((value) => value != null);
  }

  /** @param {DeviceInformation} partialDeviceInformation */
  #update(partialDeviceInformation) {
    _console$j.log({ partialDeviceInformation });
    for (const deviceInformationName in partialDeviceInformation) {
      this.#dispatchEvent({
        type: deviceInformationName,
        message: { [deviceInformationName]: partialDeviceInformation[deviceInformationName] },
      });
    }

    Object.assign(this.information, partialDeviceInformation);
    _console$j.log({ deviceInformation: this.information });
    if (this.#isComplete) {
      _console$j.log("completed deviceInformation");
      this.#dispatchEvent({ type: "deviceInformation", message: { deviceInformation: this.information } });
    }
  }

  // MESSAGE

  /**
   * @param {DeviceInformationMessageType} messageType
   * @param {DataView} dataView
   */
  parseMessage(messageType, dataView) {
    _console$j.log({ messageType });

    switch (messageType) {
      case "manufacturerName":
        const manufacturerName = textDecoder.decode(dataView);
        _console$j.log({ manufacturerName });
        this.#update({ manufacturerName });
        break;
      case "modelNumber":
        const modelNumber = textDecoder.decode(dataView);
        _console$j.log({ modelNumber });
        this.#update({ modelNumber });
        break;
      case "softwareRevision":
        const softwareRevision = textDecoder.decode(dataView);
        _console$j.log({ softwareRevision });
        this.#update({ softwareRevision });
        break;
      case "hardwareRevision":
        const hardwareRevision = textDecoder.decode(dataView);
        _console$j.log({ hardwareRevision });
        this.#update({ hardwareRevision });
        break;
      case "firmwareRevision":
        const firmwareRevision = textDecoder.decode(dataView);
        _console$j.log({ firmwareRevision });
        this.#update({ firmwareRevision });
        break;
      case "pnpId":
        /** @type {PnpId} */
        const pnpId = {
          source: dataView.getUint8(0) === 1 ? "Bluetooth" : "USB",
          productId: dataView.getUint16(3, true),
          productVersion: dataView.getUint16(5, true),
        };
        if (pnpId.source == "Bluetooth") {
          pnpId.vendorId = dataView.getUint16(1, true);
        }
        _console$j.log({ pnpId });
        this.#update({ pnpId });
        break;
      case "serialNumber":
        const serialNumber = textDecoder.decode(dataView);
        _console$j.log({ serialNumber });
        // will only be used for node.js
        break;
      default:
        throw Error(`uncaught messageType ${messageType}`);
    }
  }
}

const _console$i = createConsole("InformationManager", { log: true });

/** @typedef {"leftInsole" | "rightInsole"} DeviceType */
/** @typedef {"left" | "right"} InsoleSide */

/**
 * @typedef { "isCharging" |
 * "getBatteryCurrent" |
 * "getMtu" |
 * "getId"|
 * "getName"|
 * "setName"|
 * "getType"|
 * "setType"|
 * "getCurrentTime"|
 * "setCurrentTime"
 * } InformationMessageType
 */
/** @typedef {InformationMessageType} InformationManagerEventType */





/**
 * @typedef {Object} BaseBatteryCurrentEvent
 * @property {"getBatteryCurrent"} type
 * @property {{batteryCurrent: number}} message
 */
/** @typedef {BaseDeviceEvent & BaseBatteryCurrentEvent} BatteryCurrentEvent */

/**
 * @typedef {Object} BaseIsChargingEvent
 * @property {"isCharging"} type
 * @property {{isCharging: boolean}} message
 */
/** @typedef {BaseDeviceEvent & BaseIsChargingEvent} IsChargingEvent */

/**
 * @typedef {Object} BaseNameEvent
 * @property {"getName"} type
 * @property {{name: string}} message
 */
/** @typedef {BaseDeviceEvent & BaseNameEvent} NameEvent */

/**
 * @typedef {Object} BaseTypeEvent
 * @property {"getType"} type
 * @property {{type: DeviceType}} message
 */
/** @typedef {BaseDeviceEvent & BaseTypeEvent} TypeEvent */

/**
 * @typedef {Object} BaseIdEvent
 * @property {"getId"} type
 * @property {{id: string}} message
 */
/** @typedef {BaseDeviceEvent & BaseIdEvent} IdEvent */

/**
 * @typedef {Object} BaseMtuEvent
 * @property {"getMtu"} type
 * @property {{mtu: number}} message
 */
/** @typedef {BaseDeviceEvent & BaseMtuEvent} MtuEvent */

/**
 * @typedef {Object} BaseCurrentTimeEvent
 * @property {"getCurrentTime"} type
 * @property {{currentTime: number}} message
 */
/** @typedef {BaseDeviceEvent & BaseCurrentTimeEvent} CurrentTimeEvent */

/** @typedef {IdEvent | CurrentTimeEvent | BatteryCurrentEvent | IsChargingEvent | NameEvent | TypeEvent} InformationManagerEvent */

class InformationManager {
  // MESSAGE TYPES

  /** @type {InformationMessageType[]} */
  static #MessageTypes = [
    "isCharging",
    "getBatteryCurrent",
    "getMtu",
    "getId",
    "getName",
    "setName",
    "getType",
    "setType",
    "getCurrentTime",
    "setCurrentTime",
  ];
  static get MessageTypes() {
    return this.#MessageTypes;
  }
  get messageTypes() {
    return InformationManager.MessageTypes;
  }

  // EVENT DISPATCHER

  /** @type {InformationManagerEventType[]} */
  static #EventTypes = [...this.#MessageTypes];
  static get EventTypes() {
    return this.#EventTypes;
  }
  get eventTypes() {
    return InformationManager.#EventTypes;
  }
  /** @type {EventDispatcher} */
  eventDispatcher;

  /** @param {InformationManagerEvent} event */
  #dispatchEvent(event) {
    this.eventDispatcher.dispatchEvent(event);
  }

  /** @param {InformationManagerEventType} eventType */
  waitForEvent(eventType) {
    return this.eventDispatcher.waitForEvent(eventType);
  }

  // PROPERTIES

  #isCharging = false;
  get isCharging() {
    return this.#isCharging;
  }
  /** @param {string} updatedIsCharging */
  updateIsCharging(updatedIsCharging) {
    _console$i.assertTypeWithError(updatedIsCharging, "boolean");
    this.#isCharging = updatedIsCharging;
    _console$i.log({ isCharging: this.#isCharging });
    this.#dispatchEvent({ type: "isCharging", message: { isCharging: this.#isCharging } });
  }

  /** @type {number?} */
  #batteryCurrent;
  get batteryCurrent() {
    return this.#batteryCurrent;
  }
  async getBatteryCurrent() {
    _console$i.log("getting battery current...");
    const promise = this.waitForEvent("getBatteryCurrent");
    this.sendMessage([{ type: "getBatteryCurrent" }]);
    await promise;
  }
  /** @param {string} updatedBatteryCurrent */
  updateBatteryCurrent(updatedBatteryCurrent) {
    _console$i.assertTypeWithError(updatedBatteryCurrent, "number");
    this.#batteryCurrent = updatedBatteryCurrent;
    _console$i.log({ batteryCurrent: this.#batteryCurrent });
    this.#dispatchEvent({ type: "getBatteryCurrent", message: { batteryCurrent: this.#batteryCurrent } });
  }

  /** @type {string} */
  #id;
  get id() {
    return this.#id;
  }
  /** @param {string} updatedId */
  updateId(updatedId) {
    _console$i.assertTypeWithError(updatedId, "string");
    this.#id = updatedId;
    _console$i.log({ id: this.#id });
    this.#dispatchEvent({ type: "getId", message: { id: this.#id } });
  }

  #name = "";
  get name() {
    return this.#name;
  }

  /** @param {string} updatedName */
  updateName(updatedName) {
    _console$i.assertTypeWithError(updatedName, "string");
    this.#name = updatedName;
    _console$i.log({ updatedName: this.#name });
    this.#dispatchEvent({ type: "getName", message: { name: this.#name } });
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
  /** @param {string} newName */
  async setName(newName) {
    _console$i.assertTypeWithError(newName, "string");
    _console$i.assertWithError(
      newName.length >= this.minNameLength,
      `name must be greater than ${this.minNameLength} characters long ("${newName}" is ${newName.length} characters long)`
    );
    _console$i.assertWithError(
      newName.length < this.maxNameLength,
      `name must be less than ${this.maxNameLength} characters long ("${newName}" is ${newName.length} characters long)`
    );
    const setNameData = textEncoder.encode(newName);
    _console$i.log({ setNameData });

    const promise = this.waitForEvent("getName");
    this.sendMessage([{ type: "setName", data: setNameData.buffer }]);
    await promise;
  }

  // TYPE
  /** @type {DeviceType[]} */
  static #Types = ["leftInsole", "rightInsole"];
  static get Types() {
    return this.#Types;
  }
  get #types() {
    return InformationManager.Types;
  }
  /** @type {DeviceType} */
  #type;
  get type() {
    return this.#type;
  }
  get typeEnum() {
    return InformationManager.Types.indexOf(this.type);
  }
  /** @param {DeviceType} type */
  #assertValidDeviceType(type) {
    _console$i.assertEnumWithError(type, this.#types);
  }
  /** @param {number} typeEnum */
  #assertValidDeviceTypeEnum(typeEnum) {
    _console$i.assertTypeWithError(typeEnum, "number");
    _console$i.assertWithError(this.#types[typeEnum], `invalid typeEnum ${typeEnum}`);
  }
  /** @param {DeviceType} updatedType */
  updateType(updatedType) {
    this.#assertValidDeviceType(updatedType);
    if (updatedType == this.type) {
      _console$i.log("redundant type assignment");
      return;
    }
    this.#type = updatedType;
    _console$i.log({ updatedType: this.#type });

    this.#dispatchEvent({ type: "getType", message: { type: this.#type } });
  }
  /** @param {number} newTypeEnum */
  async #setTypeEnum(newTypeEnum) {
    this.#assertValidDeviceTypeEnum(newTypeEnum);
    const setTypeData = Uint8Array.from([newTypeEnum]);
    _console$i.log({ setTypeData });
    const promise = this.waitForEvent("getType");
    this.sendMessage([{ type: "setType", data: setTypeData.buffer }]);
    await promise;
  }
  /** @param {DeviceType} newType */
  async setType(newType) {
    this.#assertValidDeviceType(newType);
    const newTypeEnum = this.#types.indexOf(newType);
    this.#setTypeEnum(newTypeEnum);
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
  /** @type {InsoleSide[]} */
  static #InsoleSides = ["left", "right"];
  static get InsoleSides() {
    return this.#InsoleSides;
  }
  get insoleSides() {
    return InformationManager.InsoleSides;
  }
  /** @type {InsoleSide} */
  get insoleSide() {
    switch (this.type) {
      case "leftInsole":
        return "left";
      case "rightInsole":
        return "right";
    }
  }

  #mtu = 0;
  get mtu() {
    return this.#mtu;
  }
  /** @param {number} newMtu */
  #updateMtu(newMtu) {
    _console$i.assertTypeWithError(newMtu, "number");
    if (this.#mtu == newMtu) {
      _console$i.log("redundant mtu assignment", newMtu);
      return;
    }
    this.#mtu = newMtu;

    this.#dispatchEvent({ type: "getMtu", message: { mtu: this.#mtu } });
  }

  #isCurrentTimeSet = false;
  get isCurrentTimeSet() {
    return this.#isCurrentTimeSet;
  }

  /** @param {number} currentTime */
  #onCurrentTime(currentTime) {
    _console$i.log({ currentTime });
    this.#isCurrentTimeSet = currentTime != 0;
    if (!this.#isCurrentTimeSet) {
      this.#setCurrentTime();
    }
  }
  async #setCurrentTime() {
    _console$i.log("setting current time...");
    const dataView = new DataView(new ArrayBuffer(8));
    dataView.setBigUint64(0, BigInt(Date.now()), true);
    const promise = this.waitForEvent("getCurrentTime");
    this.sendMessage([{ type: "setCurrentTime", data: dataView.buffer }]);
    await promise;
  }

  // MESSAGE

  /**
   * @param {InformationMessageType} messageType
   * @param {DataView} dataView
   */
  parseMessage(messageType, dataView) {
    _console$i.log({ messageType });

    switch (messageType) {
      case "isCharging":
        const isCharging = Boolean(dataView.getUint8(0));
        _console$i.log({ isCharging });
        this.updateIsCharging(isCharging);
        break;
      case "getBatteryCurrent":
        const batteryCurrent = dataView.getFloat32(0, true);
        _console$i.log({ batteryCurrent });
        this.updateBatteryCurrent(batteryCurrent);
        break;
      case "getId":
        const id = textDecoder.decode(dataView);
        _console$i.log({ id });
        this.updateId(id);
        break;
      case "getName":
      case "setName":
        const name = textDecoder.decode(dataView);
        _console$i.log({ name });
        this.updateName(name);
        break;
      case "getType":
      case "setType":
        const typeEnum = dataView.getUint8(0);
        const type = this.#types[typeEnum];
        _console$i.log({ typeEnum, type });
        this.updateType(type);
        break;
      case "getMtu":
        const mtu = dataView.getUint16(0, true);
        _console$i.log({ mtu });
        this.#updateMtu(mtu);
        break;
      case "getCurrentTime":
      case "setCurrentTime":
        const currentTime = Number(dataView.getBigUint64(0, true));
        this.#onCurrentTime(currentTime);
        break;
      default:
        throw Error(`uncaught messageType ${messageType}`);
    }
  }

  /**
   * @callback SendMessageCallback
   * @param {{type: InformationMessageType, data: ArrayBuffer}[]} messages
   * @param {boolean} sendImmediately
   */

  /** @type {SendMessageCallback} */
  sendMessage;

  clear() {
    this.#isCurrentTimeSet = false;
  }
}

/**
 * @typedef { "none" |
 * "strongClick100" |
 * "strongClick60" |
 * "strongClick30" |
 * "sharpClick100" |
 * "sharpClick60" |
 * "sharpClick30" |
 * "softBump100" |
 * "softBump60" |
 * "softBump30" |
 * "doubleClick100" |
 * "doubleClick60" |
 * "tripleClick100" |
 * "softFuzz60" |
 * "strongBuzz100" |
 * "alert750ms" |
 * "alert1000ms" |
 * "strongClick1_100" |
 * "strongClick2_80" |
 * "strongClick3_60" |
 * "strongClick4_30" |
 * "mediumClick100" |
 * "mediumClick80" |
 * "mediumClick60" |
 * "sharpTick100" |
 * "sharpTick80" |
 * "sharpTick60" |
 * "shortDoubleClickStrong100" |
 * "shortDoubleClickStrong80" |
 * "shortDoubleClickStrong60" |
 * "shortDoubleClickStrong30" |
 * "shortDoubleClickMedium100" |
 * "shortDoubleClickMedium80" |
 * "shortDoubleClickMedium60" |
 * "shortDoubleSharpTick100" |
 * "shortDoubleSharpTick80" |
 * "shortDoubleSharpTick60" |
 * "longDoubleSharpClickStrong100" |
 * "longDoubleSharpClickStrong80" |
 * "longDoubleSharpClickStrong60" |
 * "longDoubleSharpClickStrong30" |
 * "longDoubleSharpClickMedium100" |
 * "longDoubleSharpClickMedium80" |
 * "longDoubleSharpClickMedium60" |
 * "longDoubleSharpTick100" |
 * "longDoubleSharpTick80" |
 * "longDoubleSharpTick60" |
 * "buzz100" |
 * "buzz80" |
 * "buzz60" |
 * "buzz40" |
 * "buzz20" |
 * "pulsingStrong100" |
 * "pulsingStrong60" |
 * "pulsingMedium100" |
 * "pulsingMedium60" |
 * "pulsingSharp100" |
 * "pulsingSharp60" |
 * "transitionClick100" |
 * "transitionClick80" |
 * "transitionClick60" |
 * "transitionClick40" |
 * "transitionClick20" |
 * "transitionClick10" |
 * "transitionHum100" |
 * "transitionHum80" |
 * "transitionHum60" |
 * "transitionHum40" |
 * "transitionHum20" |
 * "transitionHum10" |
 * "transitionRampDownLongSmooth2_100" |
 * "transitionRampDownLongSmooth1_100" |
 * "transitionRampDownMediumSmooth1_100" |
 * "transitionRampDownMediumSmooth2_100" |
 * "transitionRampDownShortSmooth1_100" |
 * "transitionRampDownShortSmooth2_100" |
 * "transitionRampDownLongSharp1_100" |
 * "transitionRampDownLongSharp2_100" |
 * "transitionRampDownMediumSharp1_100" |
 * "transitionRampDownMediumSharp2_100" |
 * "transitionRampDownShortSharp1_100" |
 * "transitionRampDownShortSharp2_100" |
 * "transitionRampUpLongSmooth1_100" |
 * "transitionRampUpLongSmooth2_100" |
 * "transitionRampUpMediumSmooth1_100" |
 * "transitionRampUpMediumSmooth2_100" |
 * "transitionRampUpShortSmooth1_100" |
 * "transitionRampUpShortSmooth2_100" |
 * "transitionRampUpLongSharp1_100" |
 * "transitionRampUpLongSharp2_100" |
 * "transitionRampUpMediumSharp1_100" |
 * "transitionRampUpMediumSharp2_100" |
 * "transitionRampUpShortSharp1_100" |
 * "transitionRampUpShortSharp2_100" |
 * "transitionRampDownLongSmooth1_50" |
 * "transitionRampDownLongSmooth2_50" |
 * "transitionRampDownMediumSmooth1_50" |
 * "transitionRampDownMediumSmooth2_50" |
 * "transitionRampDownShortSmooth1_50" |
 * "transitionRampDownShortSmooth2_50" |
 * "transitionRampDownLongSharp1_50" |
 * "transitionRampDownLongSharp2_50" |
 * "transitionRampDownMediumSharp1_50" |
 * "transitionRampDownMediumSharp2_50" |
 * "transitionRampDownShortSharp1_50" |
 * "transitionRampDownShortSharp2_50" |
 * "transitionRampUpLongSmooth1_50" |
 * "transitionRampUpLongSmooth2_50" |
 * "transitionRampUpMediumSmooth1_50" |
 * "transitionRampUpMediumSmooth2_50" |
 * "transitionRampUpShortSmooth1_50" |
 * "transitionRampUpShortSmooth2_50" |
 * "transitionRampUpLongSharp1_50" |
 * "transitionRampUpLongSharp2_50" |
 * "transitionRampUpMediumSharp1_50" |
 * "transitionRampUpMediumSharp2_50" |
 * "transitionRampUpShortSharp1_50" |
 * "transitionRampUpShortSharp2_50" |
 * "longBuzz100" |
 * "smoothHum50" |
 * "smoothHum40" |
 * "smoothHum30" |
 * "smoothHum20" |
 * "smoothHum10"
 * } VibrationWaveformEffect
 */

/** @type {VibrationWaveformEffect[]} */
const VibrationWaveformEffects = [
    "none",
    "strongClick100",
    "strongClick60",
    "strongClick30",
    "sharpClick100",
    "sharpClick60",
    "sharpClick30",
    "softBump100",
    "softBump60",
    "softBump30",
    "doubleClick100",
    "doubleClick60",
    "tripleClick100",
    "softFuzz60",
    "strongBuzz100",
    "alert750ms",
    "alert1000ms",
    "strongClick1_100",
    "strongClick2_80",
    "strongClick3_60",
    "strongClick4_30",
    "mediumClick100",
    "mediumClick80",
    "mediumClick60",
    "sharpTick100",
    "sharpTick80",
    "sharpTick60",
    "shortDoubleClickStrong100",
    "shortDoubleClickStrong80",
    "shortDoubleClickStrong60",
    "shortDoubleClickStrong30",
    "shortDoubleClickMedium100",
    "shortDoubleClickMedium80",
    "shortDoubleClickMedium60",
    "shortDoubleSharpTick100",
    "shortDoubleSharpTick80",
    "shortDoubleSharpTick60",
    "longDoubleSharpClickStrong100",
    "longDoubleSharpClickStrong80",
    "longDoubleSharpClickStrong60",
    "longDoubleSharpClickStrong30",
    "longDoubleSharpClickMedium100",
    "longDoubleSharpClickMedium80",
    "longDoubleSharpClickMedium60",
    "longDoubleSharpTick100",
    "longDoubleSharpTick80",
    "longDoubleSharpTick60",
    "buzz100",
    "buzz80",
    "buzz60",
    "buzz40",
    "buzz20",
    "pulsingStrong100",
    "pulsingStrong60",
    "pulsingMedium100",
    "pulsingMedium60",
    "pulsingSharp100",
    "pulsingSharp60",
    "transitionClick100",
    "transitionClick80",
    "transitionClick60",
    "transitionClick40",
    "transitionClick20",
    "transitionClick10",
    "transitionHum100",
    "transitionHum80",
    "transitionHum60",
    "transitionHum40",
    "transitionHum20",
    "transitionHum10",
    "transitionRampDownLongSmooth2_100",
    "transitionRampDownLongSmooth1_100",
    "transitionRampDownMediumSmooth1_100",
    "transitionRampDownMediumSmooth2_100",
    "transitionRampDownShortSmooth1_100",
    "transitionRampDownShortSmooth2_100",
    "transitionRampDownLongSharp1_100",
    "transitionRampDownLongSharp2_100",
    "transitionRampDownMediumSharp1_100",
    "transitionRampDownMediumSharp2_100",
    "transitionRampDownShortSharp1_100",
    "transitionRampDownShortSharp2_100",
    "transitionRampUpLongSmooth1_100",
    "transitionRampUpLongSmooth2_100",
    "transitionRampUpMediumSmooth1_100",
    "transitionRampUpMediumSmooth2_100",
    "transitionRampUpShortSmooth1_100",
    "transitionRampUpShortSmooth2_100",
    "transitionRampUpLongSharp1_100",
    "transitionRampUpLongSharp2_100",
    "transitionRampUpMediumSharp1_100",
    "transitionRampUpMediumSharp2_100",
    "transitionRampUpShortSharp1_100",
    "transitionRampUpShortSharp2_100",
    "transitionRampDownLongSmooth1_50",
    "transitionRampDownLongSmooth2_50",
    "transitionRampDownMediumSmooth1_50",
    "transitionRampDownMediumSmooth2_50",
    "transitionRampDownShortSmooth1_50",
    "transitionRampDownShortSmooth2_50",
    "transitionRampDownLongSharp1_50",
    "transitionRampDownLongSharp2_50",
    "transitionRampDownMediumSharp1_50",
    "transitionRampDownMediumSharp2_50",
    "transitionRampDownShortSharp1_50",
    "transitionRampDownShortSharp2_50",
    "transitionRampUpLongSmooth1_50",
    "transitionRampUpLongSmooth2_50",
    "transitionRampUpMediumSmooth1_50",
    "transitionRampUpMediumSmooth2_50",
    "transitionRampUpShortSmooth1_50",
    "transitionRampUpShortSmooth2_50",
    "transitionRampUpLongSharp1_50",
    "transitionRampUpLongSharp2_50",
    "transitionRampUpMediumSharp1_50",
    "transitionRampUpMediumSharp2_50",
    "transitionRampUpShortSharp1_50",
    "transitionRampUpShortSharp2_50",
    "longBuzz100",
    "smoothHum50",
    "smoothHum40",
    "smoothHum30",
    "smoothHum20",
    "smoothHum10",
];

const _console$h = createConsole("VibrationManager");

/** @typedef {"front" | "rear"} VibrationLocation */
/** @typedef {"waveformEffect" | "waveform"} VibrationType */


/**
 * @typedef {Object} VibrationWaveformEffectSegment
 * use either effect or delay but not both (defaults to effect if both are defined)
 * @property {VibrationWaveformEffect} [effect]
 * @property {number} [delay] (ms int ranging [0, 1270])
 * @property {number} [loopCount] how many times each segment should loop (int ranging [0, 3])
 */

/**
 * @typedef {Object} VibrationWaveformSegment
 * @property {number} duration ms int ranging [0, 2550]
 * @property {number} amplitude float ranging [0, 1]
 */

/** @typedef { "triggerVibration" } VibrationMessageType */

/**
 * @typedef {Object} VibrationWaveformEffectConfiguration
 * @property {VibrationWaveformEffectSegment[]} segments
 * @property {number} [loopCount] how many times the entire sequence should loop (int ranging [0, 6])
 */


/**
 * @typedef {Object} VibrationWaveformConfiguration
 * @property {VibrationWaveformSegment[]} segments
 */

/**
 * @typedef {Object} VibrationConfiguration
 * @property {VibrationLocation[]} [locations]
 * @property {VibrationType} type
 * @property {VibrationWaveformEffectConfiguration} [waveformEffect] use if type is "waveformEffect"
 * @property {VibrationWaveformConfiguration} [waveform] use if type is "waveform"
 */

class VibrationManager {
  /** @type {VibrationMessageType[]} */
  static #MessageTypes = ["triggerVibration"];
  static get MessageTypes() {
    return this.#MessageTypes;
  }
  get messageTypes() {
    return TfliteManager.MessageTypes;
  }

  // LOCATIONS

  /** @type {VibrationLocation[]} */
  static #Locations = ["front", "rear"];
  static get Locations() {
    return this.#Locations;
  }
  get locations() {
    return VibrationManager.Locations;
  }
  /** @param {VibrationLocation} location */
  #verifyLocation(location) {
    _console$h.assertTypeWithError(location, "string");
    _console$h.assertWithError(this.locations.includes(location), `invalid location "${location}"`);
  }
  /** @param {VibrationLocation[]} locations */
  #verifyLocations(locations) {
    this.#assertNonEmptyArray(locations);
    locations.forEach((location) => {
      this.#verifyLocation(location);
    });
  }
  /** @param {VibrationLocation[]} locations */
  #createLocationsBitmask(locations) {
    this.#verifyLocations(locations);

    let locationsBitmask = 0;
    locations.forEach((location) => {
      const locationIndex = this.locations.indexOf(location);
      locationsBitmask |= 1 << locationIndex;
    });
    _console$h.log({ locationsBitmask });
    _console$h.assertWithError(locationsBitmask > 0, `locationsBitmask must not be zero`);
    return locationsBitmask;
  }

  /** @param {any[]} array */
  #assertNonEmptyArray(array) {
    _console$h.assertWithError(Array.isArray(array), "passed non-array");
    _console$h.assertWithError(array.length > 0, "passed empty array");
  }

  static get WaveformEffects() {
    return VibrationWaveformEffects;
  }
  get waveformEffects() {
    return VibrationManager.WaveformEffects;
  }
  /** @param {VibrationWaveformEffect} waveformEffect */
  #verifyWaveformEffect(waveformEffect) {
    _console$h.assertWithError(
      this.waveformEffects.includes(waveformEffect),
      `invalid waveformEffect "${waveformEffect}"`
    );
  }

  static #MaxWaveformEffectSegmentDelay = 1270;
  static get MaxWaveformEffectSegmentDelay() {
    return this.#MaxWaveformEffectSegmentDelay;
  }
  get maxWaveformEffectSegmentDelay() {
    return VibrationManager.MaxWaveformEffectSegmentDelay;
  }
  /** @param {VibrationWaveformEffectSegment} waveformEffectSegment */
  #verifyWaveformEffectSegment(waveformEffectSegment) {
    if (waveformEffectSegment.effect != undefined) {
      const waveformEffect = waveformEffectSegment.effect;
      this.#verifyWaveformEffect(waveformEffect);
    } else if (waveformEffectSegment.delay != undefined) {
      const { delay } = waveformEffectSegment;
      _console$h.assertWithError(delay >= 0, `delay must be 0ms or greater (got ${delay})`);
      _console$h.assertWithError(
        delay <= this.maxWaveformEffectSegmentDelay,
        `delay must be ${this.maxWaveformEffectSegmentDelay}ms or less (got ${delay})`
      );
    } else {
      throw Error("no effect or delay found in waveformEffectSegment");
    }

    if (waveformEffectSegment.loopCount != undefined) {
      const { loopCount } = waveformEffectSegment;
      this.#verifyWaveformEffectSegmentLoopCount(loopCount);
    }
  }
  static #MaxWaveformEffectSegmentLoopCount = 3;
  static get MaxWaveformEffectSegmentLoopCount() {
    return this.#MaxWaveformEffectSegmentLoopCount;
  }
  get maxWaveformEffectSegmentLoopCount() {
    return VibrationManager.MaxWaveformEffectSegmentLoopCount;
  }
  /** @param {number} waveformEffectSegmentLoopCount */
  #verifyWaveformEffectSegmentLoopCount(waveformEffectSegmentLoopCount) {
    _console$h.assertTypeWithError(waveformEffectSegmentLoopCount, "number");
    _console$h.assertWithError(
      waveformEffectSegmentLoopCount >= 0,
      `waveformEffectSegmentLoopCount must be 0 or greater (got ${waveformEffectSegmentLoopCount})`
    );
    _console$h.assertWithError(
      waveformEffectSegmentLoopCount <= this.maxWaveformEffectSegmentLoopCount,
      `waveformEffectSegmentLoopCount must be ${this.maxWaveformEffectSegmentLoopCount} or fewer (got ${waveformEffectSegmentLoopCount})`
    );
  }

  static #MaxNumberOfWaveformEffectSegments = 8;
  static get MaxNumberOfWaveformEffectSegments() {
    return this.#MaxNumberOfWaveformEffectSegments;
  }
  get maxNumberOfWaveformEffectSegments() {
    return VibrationManager.MaxNumberOfWaveformEffectSegments;
  }
  /** @param {VibrationWaveformEffectSegment[]} waveformEffectSegments */
  #verifyWaveformEffectSegments(waveformEffectSegments) {
    this.#assertNonEmptyArray(waveformEffectSegments);
    _console$h.assertWithError(
      waveformEffectSegments.length <= this.maxNumberOfWaveformEffectSegments,
      `must have ${this.maxNumberOfWaveformEffectSegments} waveformEffectSegments or fewer (got ${waveformEffectSegments.length})`
    );
    waveformEffectSegments.forEach((waveformEffectSegment) => {
      this.#verifyWaveformEffectSegment(waveformEffectSegment);
    });
  }

  static #MaxWaveformEffectSequenceLoopCount = 6;
  static get MaxWaveformEffectSequenceLoopCount() {
    return this.#MaxWaveformEffectSequenceLoopCount;
  }
  get maxWaveformEffectSequenceLoopCount() {
    return VibrationManager.MaxWaveformEffectSequenceLoopCount;
  }
  /** @param {number} waveformEffectSequenceLoopCount */
  #verifyWaveformEffectSequenceLoopCount(waveformEffectSequenceLoopCount) {
    _console$h.assertTypeWithError(waveformEffectSequenceLoopCount, "number");
    _console$h.assertWithError(
      waveformEffectSequenceLoopCount >= 0,
      `waveformEffectSequenceLoopCount must be 0 or greater (got ${waveformEffectSequenceLoopCount})`
    );
    _console$h.assertWithError(
      waveformEffectSequenceLoopCount <= this.maxWaveformEffectSequenceLoopCount,
      `waveformEffectSequenceLoopCount must be ${this.maxWaveformEffectSequenceLoopCount} or fewer (got ${waveformEffectSequenceLoopCount})`
    );
  }

  static #MaxWaveformSegmentDuration = 2550;
  static get MaxWaveformSegmentDuration() {
    return this.#MaxWaveformSegmentDuration;
  }
  get maxWaveformSegmentDuration() {
    return VibrationManager.MaxWaveformSegmentDuration;
  }
  /** @param {VibrationWaveformSegment} waveformSegment */
  #verifyWaveformSegment(waveformSegment) {
    _console$h.assertTypeWithError(waveformSegment.amplitude, "number");
    _console$h.assertWithError(
      waveformSegment.amplitude >= 0,
      `amplitude must be 0 or greater (got ${waveformSegment.amplitude})`
    );
    _console$h.assertWithError(
      waveformSegment.amplitude <= 1,
      `amplitude must be 1 or less (got ${waveformSegment.amplitude})`
    );

    _console$h.assertTypeWithError(waveformSegment.duration, "number");
    _console$h.assertWithError(
      waveformSegment.duration > 0,
      `duration must be greater than 0ms (got ${waveformSegment.duration}ms)`
    );
    _console$h.assertWithError(
      waveformSegment.duration <= this.maxWaveformSegmentDuration,
      `duration must be ${this.maxWaveformSegmentDuration}ms or less (got ${waveformSegment.duration}ms)`
    );
  }
  static #MaxNumberOfWaveformSegments = 20;
  static get MaxNumberOfWaveformSegments() {
    return this.#MaxNumberOfWaveformSegments;
  }
  get maxNumberOfWaveformSegments() {
    return VibrationManager.MaxNumberOfWaveformSegments;
  }
  /** @param {VibrationWaveformSegment[]} waveformSegments */
  #verifyWaveformSegments(waveformSegments) {
    this.#assertNonEmptyArray(waveformSegments);
    _console$h.assertWithError(
      waveformSegments.length <= this.maxNumberOfWaveformSegments,
      `must have ${this.maxNumberOfWaveformSegments} waveformSegments or fewer (got ${waveformSegments.length})`
    );
    waveformSegments.forEach((waveformSegment) => {
      this.#verifyWaveformSegment(waveformSegment);
    });
  }

  /**
   * @param {VibrationLocation[]} locations
   * @param {VibrationWaveformEffectSegment[]} waveformEffectSegments
   * @param {number} [waveformEffectSequenceLoopCount] how many times the entire sequence should loop (int ranging [0, 6])
   */
  #createWaveformEffectsData(locations, waveformEffectSegments, waveformEffectSequenceLoopCount = 0) {
    this.#verifyWaveformEffectSegments(waveformEffectSegments);
    this.#verifyWaveformEffectSequenceLoopCount(waveformEffectSequenceLoopCount);

    let dataArray = [];
    let byteOffset = 0;

    const hasAtLeast1WaveformEffectWithANonzeroLoopCount = waveformEffectSegments.some((waveformEffectSegment) => {
      const { loopCount } = waveformEffectSegment;
      return loopCount != undefined && loopCount > 0;
    });

    const includeAllWaveformEffectSegments =
      hasAtLeast1WaveformEffectWithANonzeroLoopCount || waveformEffectSequenceLoopCount != 0;

    for (
      let index = 0;
      index < waveformEffectSegments.length ||
      (includeAllWaveformEffectSegments && index < this.maxNumberOfWaveformEffectSegments);
      index++
    ) {
      const waveformEffectSegment = waveformEffectSegments[index] || { effect: "none" };
      if (waveformEffectSegment.effect != undefined) {
        const waveformEffect = waveformEffectSegment.effect;
        dataArray[byteOffset++] = this.waveformEffects.indexOf(waveformEffect);
      } else if (waveformEffectSegment.delay != undefined) {
        const { delay } = waveformEffectSegment;
        dataArray[byteOffset++] = (1 << 7) | Math.floor(delay / 10); // set most significant bit to 1
      } else {
        throw Error("invalid waveformEffectSegment");
      }
    }

    const includeAllWaveformEffectSegmentLoopCounts = waveformEffectSequenceLoopCount != 0;
    for (
      let index = 0;
      index < waveformEffectSegments.length ||
      (includeAllWaveformEffectSegmentLoopCounts && index < this.maxNumberOfWaveformEffectSegments);
      index++
    ) {
      const waveformEffectSegmentLoopCount = waveformEffectSegments[index]?.loopCount || 0;
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
    _console$h.log({ dataArray, dataView });
    return this.#createData(locations, "waveformEffect", dataView);
  }
  /**
   * @param {VibrationLocation[]} locations
   * @param {VibrationWaveformSegment[]} waveformSegments
   */
  #createWaveformData(locations, waveformSegments) {
    this.#verifyWaveformSegments(waveformSegments);
    const dataView = new DataView(new ArrayBuffer(waveformSegments.length * 2));
    waveformSegments.forEach((waveformSegment, index) => {
      dataView.setUint8(index * 2, Math.floor(waveformSegment.amplitude * 127));
      dataView.setUint8(index * 2 + 1, Math.floor(waveformSegment.duration / 10));
    });
    _console$h.log({ dataView });
    return this.#createData(locations, "waveform", dataView);
  }

  /** @type {VibrationType[]} */
  static #Types = ["waveformEffect", "waveform"];
  static get Types() {
    return this.#Types;
  }
  get #types() {
    return VibrationManager.Types;
  }
  /** @param {VibrationType} vibrationType */
  #verifyVibrationType(vibrationType) {
    _console$h.assertTypeWithError(vibrationType, "string");
    _console$h.assertWithError(this.#types.includes(vibrationType), `invalid vibrationType "${vibrationType}"`);
  }

  /**
   * @param {VibrationLocation[]} locations
   * @param {VibrationType} vibrationType
   * @param {DataView} dataView
   */
  #createData(locations, vibrationType, dataView) {
    _console$h.assertWithError(dataView?.byteLength > 0, "no data received");
    const locationsBitmask = this.#createLocationsBitmask(locations);
    this.#verifyVibrationType(vibrationType);
    const vibrationTypeIndex = this.#types.indexOf(vibrationType);
    _console$h.log({ locationsBitmask, vibrationTypeIndex, dataView });
    const data = concatenateArrayBuffers(locationsBitmask, vibrationTypeIndex, dataView.byteLength, dataView);
    _console$h.log({ data });
    return data;
  }

  /**
   * @param  {VibrationConfiguration[]} vibrationConfigurations
   * @param  {boolean} sendImmediately
   */
  async triggerVibration(vibrationConfigurations, sendImmediately) {
    /** @type {ArrayBuffer} */
    let triggerVibrationData;
    vibrationConfigurations.forEach((vibrationConfiguration) => {
      const { type } = vibrationConfiguration;

      let { locations } = vibrationConfiguration;
      locations = locations || this.locations.slice();

      /** @type {DataView} */
      let dataView;

      switch (type) {
        case "waveformEffect":
          {
            const { waveformEffect } = vibrationConfiguration;
            if (!waveformEffect) {
              throw Error("waveformEffect not defined in vibrationConfiguration");
            }
            const { segments, loopCount } = waveformEffect;
            dataView = this.#createWaveformEffectsData(locations, segments, loopCount);
          }
          break;
        case "waveform":
          {
            const { waveform } = vibrationConfiguration;
            if (!waveform) {
              throw Error("waveform not defined in vibrationConfiguration");
            }
            const { segments } = waveform;
            dataView = this.#createWaveformData(locations, segments);
          }
          break;
        default:
          throw Error(`invalid vibration type "${type}"`);
      }
      _console$h.log({ type, dataView });
      triggerVibrationData = concatenateArrayBuffers(triggerVibrationData, dataView);
    });
    await this.sendMessage([{ type: "triggerVibration", data: triggerVibrationData }], sendImmediately);
  }

  /**
   * @callback SendMessageCallback
   * @param {{type: VibrationMessageType, data: ArrayBuffer}[]} messages
   * @param {boolean} sendImmediately
   */

  /** @type {SendMessageCallback} */
  sendMessage;
}

const _console$g = createConsole("BaseConnectionManager", { log: true });










/** @typedef {"webBluetooth" | "noble" | "webSocketClient"} ConnectionType */
/** @typedef {"not connected" | "connecting" | "connected" | "disconnecting"} ConnectionStatus */

/**
 * @typedef { InformationMessageType |
 * SensorConfigurationMessageType |
 * SensorDataMessageType |
 * VibrationMessageType |
 * FileTransferMessageType |
 * TfliteMessageType |
 * FirmwareMessageType
 * } TxRxMessageType
 */

/**
 * @typedef {Object} TxMessage
 * @property {TxRxMessageType} type
 * @property {ArrayBuffer} [data]
 */

/**
 * @typedef { DeviceInformationMessageType |
 * "batteryLevel" |
 * "rx" |
 * "tx" |
 * "smp" |
 * TxRxMessageType
 * } ConnectionMessageType
 */

/**
 * @callback ConnectionStatusCallback
 * @param {ConnectionStatus} status
 */

/**
 * @callback MessageReceivedCallback
 * @param {ConnectionMessageType} messageType
 * @param {DataView} dataView
 */

class BaseConnectionManager {
  // MESSAGES

  /** @type {TxRxMessageType[]} */
  static #TxRxMessageTypes = [
    ...InformationManager.MessageTypes,
    ...SensorConfigurationManager.MessageTypes,
    ...SensorDataManager.MessageTypes,
    ...VibrationManager.MessageTypes,
    ...TfliteManager$1.MessageTypes,
    ...FileTransferManager.MessageTypes,
  ];
  static get TxRxMessageTypes() {
    return this.#TxRxMessageTypes;
  }
  /** @type {ConnectionMessageType[]} */
  static #MessageTypes = [
    ...DeviceInformationManager.MessageTypes,
    "batteryLevel",
    "smp",
    "rx",
    "tx",
    ...this.TxRxMessageTypes,
  ];
  static get MessageTypes() {
    return this.#MessageTypes;
  }
  /** @param {ConnectionMessageType} messageType */
  static #AssertValidTxRxMessageType(messageType) {
    _console$g.assertEnumWithError(messageType, this.#TxRxMessageTypes);
  }

  // ID

  /** @type {string?} */
  get bluetoothId() {
    this.#throwNotImplementedError("bluetoothId");
  }

  // CALLBACKS
  /** @type {ConnectionStatusCallback?} */
  onStatusUpdated;
  /** @type {MessageReceivedCallback?} */
  onMessageReceived;

  /** @param {string} name */
  static #staticThrowNotImplementedError(name) {
    throw new Error(`"${name}" is not implemented by "${this.name}" subclass`);
  }
  /** @param {string} name */
  #throwNotImplementedError(name) {
    throw new Error(`"${name}" is not implemented by "${this.constructor.name}" subclass`);
  }

  static get isSupported() {
    return false;
  }
  /** @type {boolean} */
  get isSupported() {
    return this.constructor.isSupported;
  }

  /** @type {ConnectionType} */
  static get type() {
    this.#staticThrowNotImplementedError("type");
  }
  /** @type {ConnectionType} */
  get type() {
    return this.constructor.type;
  }

  /** @throws {Error} if not supported */
  #assertIsSupported() {
    _console$g.assertWithError(this.isSupported, `${this.constructor.name} is not supported`);
  }

  /** @throws {Error} if abstract class */
  #assertIsSubclass() {
    _console$g.assertWithError(this.constructor != BaseConnectionManager, `${this.constructor.name} must be subclassed`);
  }

  constructor() {
    this.#assertIsSubclass();
    this.#assertIsSupported();
  }

  /** @type {ConnectionStatus[]} */
  static get #Statuses() {
    return ["not connected", "connecting", "connected", "disconnecting"];
  }
  static get Statuses() {
    return this.#Statuses;
  }
  get #statuses() {
    return BaseConnectionManager.#Statuses;
  }

  /** @type {ConnectionStatus} */
  #status = "not connected";
  get status() {
    return this.#status;
  }
  /** @protected */
  set status(newConnectionStatus) {
    _console$g.assertEnumWithError(newConnectionStatus, this.#statuses);
    if (this.#status == newConnectionStatus) {
      _console$g.log(`tried to assign same connection status "${newConnectionStatus}"`);
      return;
    }
    _console$g.log(`new connection status "${newConnectionStatus}"`);
    this.#status = newConnectionStatus;
    this.onStatusUpdated?.(this.status);

    if (this.isConnected) {
      this.#timer.start();
    } else {
      this.#timer.stop();
    }

    if (this.#status == "not connected") {
      this.#mtu = null;
    }
  }

  get isConnected() {
    return this.status == "connected";
  }

  /** @throws {Error} if connected */
  #assertIsNotConnected() {
    _console$g.assertWithError(!this.isConnected, "device is already connected");
  }
  /** @throws {Error} if connecting */
  #assertIsNotConnecting() {
    _console$g.assertWithError(this.status != "connecting", "device is already connecting");
  }
  /** @throws {Error} if not connected */
  #assertIsConnected() {
    _console$g.assertWithError(this.isConnected, "device is not connected");
  }
  /** @throws {Error} if disconnecting */
  #assertIsNotDisconnecting() {
    _console$g.assertWithError(this.status != "disconnecting", "device is already disconnecting");
  }
  /** @throws {Error} if not connected or is disconnecting */
  #assertIsConnectedAndNotDisconnecting() {
    this.#assertIsConnected();
    this.#assertIsNotDisconnecting();
  }

  async connect() {
    this.#assertIsNotConnected();
    this.#assertIsNotConnecting();
    this.status = "connecting";
  }
  /** @type {boolean} */
  get canReconnect() {
    return false;
  }
  async reconnect() {
    this.#assertIsNotConnected();
    this.#assertIsNotConnecting();
    _console$g.assert(this.canReconnect, "unable to reconnect");
  }
  async disconnect() {
    this.#assertIsConnected();
    this.#assertIsNotDisconnecting();
    this.status = "disconnecting";
    _console$g.log("disconnecting from device...");
  }

  /** @param {ArrayBuffer} data */
  async sendSmpMessage(data) {
    this.#assertIsConnectedAndNotDisconnecting();
    _console$g.log("sending smp message", data);
  }

  /** @type {TxMessage[]} */
  #pendingMessages = [];

  /**
   * @param {TxMessage[]?} messages
   * @param {boolean} sendImmediately
   */
  async sendTxMessages(messages, sendImmediately = true) {
    this.#assertIsConnectedAndNotDisconnecting();

    if (messages) {
      this.#pendingMessages.push(...messages);
    }

    if (!sendImmediately) {
      return;
    }

    _console$g.log("sendTxMessages", this.#pendingMessages.slice());

    const arrayBuffers = this.#pendingMessages.map((message) => {
      BaseConnectionManager.#AssertValidTxRxMessageType(message.type);
      const messageTypeEnum = BaseConnectionManager.TxRxMessageTypes.indexOf(message.type);
      const dataLength = new DataView(new ArrayBuffer(2));
      dataLength.setUint16(0, message.data?.byteLength || 0, true);
      return concatenateArrayBuffers(messageTypeEnum, dataLength, message.data);
    });

    if (this.#mtu) {
      while (arrayBuffers.length > 0) {
        let arrayBufferByteLength = 0;
        let arrayBufferCount = 0;
        arrayBuffers.some((arrayBuffer) => {
          if (arrayBufferByteLength + arrayBuffer.byteLength > this.#mtu - 3) {
            return true;
          }
          arrayBufferCount++;
          arrayBufferByteLength += arrayBuffer.byteLength;
        });
        const arrayBuffersToSend = arrayBuffers.splice(0, arrayBufferCount);
        _console$g.log({ arrayBufferCount, arrayBuffersToSend });

        const arrayBuffer = concatenateArrayBuffers(...arrayBuffersToSend);
        _console$g.log("sending arrayBuffer", arrayBuffer);
        await this.sendTxData(arrayBuffer);
      }
    } else {
      const arrayBuffer = concatenateArrayBuffers(...arrayBuffers);
      _console$g.log("sending arrayBuffer", arrayBuffer);
      await this.sendTxData(arrayBuffer);
    }

    this.#pendingMessages.length = 0;
  }

  /** @param {number?} */
  #mtu;
  get mtu() {
    return this.#mtu;
  }
  set mtu(newMtu) {
    this.#mtu = newMtu;
  }

  /** @param {ArrayBuffer} data */
  async sendTxData(data) {
    _console$g.log("sendTxData", data);
  }

  /** @param {DataView} dataView */
  parseRxMessage(dataView) {
    parseMessage(dataView, BaseConnectionManager.#TxRxMessageTypes, this.#onRxMessage.bind(this), null, true);
  }

  /**
   * @param {TxRxMessageType} messageType
   * @param {DataView} dataView
   */
  #onRxMessage(messageType, dataView) {
    _console$g.log({ messageType, dataView });
    this.onMessageReceived?.(messageType, dataView);
  }

  #timer = new Timer(this.#checkConnection.bind(this), 5000);
  #checkConnection() {
    //console.log("checking connection...");
    if (!this.isConnected) {
      _console$g.log("timer detected disconnection");
      this.status = "not connected";
    }
  }
}

const _console$f = createConsole("bluetoothUUIDs", { log: false });
var BluetoothUUID = webbluetooth.BluetoothUUID;

/*
if (isInBrowser) {
  var BluetoothUUID = window.BluetoothUUID;
}
*/

/**
 * @param {string} value
 * @returns {BluetoothServiceUUID}
 */
function generateBluetoothUUID(value) {
  _console$f.assertTypeWithError(value, "string");
  _console$f.assertWithError(value.length == 4, "value must be 4 characters long");
  return `ea6da725-${value}-4f9b-893d-c3913e33b39f`;
}

/** @param {string} identifier */
function stringToCharacteristicUUID(identifier) {
  return BluetoothUUID?.getCharacteristic?.(identifier);
}

/** @param {string} identifier */
function stringToServiceUUID(identifier) {
  return BluetoothUUID?.getService?.(identifier);
}

/** @typedef {"deviceInformation" | "battery" | "main" | "smp"} BluetoothServiceName */

/**
 * @typedef { DeviceInformationMessageType |
 * "batteryLevel" |
 * "rx" |
 * "tx" |
 * "smp"
 * } BluetoothCharacteristicName
 */

const bluetoothUUIDs = Object.freeze({
  services: {
    deviceInformation: {
      uuid: stringToServiceUUID("device_information"),
      characteristics: {
        manufacturerName: {
          uuid: stringToCharacteristicUUID("manufacturer_name_string"),
        },
        modelNumber: {
          uuid: stringToCharacteristicUUID("model_number_string"),
        },
        hardwareRevision: {
          uuid: stringToCharacteristicUUID("hardware_revision_string"),
        },
        firmwareRevision: {
          uuid: stringToCharacteristicUUID("firmware_revision_string"),
        },
        softwareRevision: {
          uuid: stringToCharacteristicUUID("software_revision_string"),
        },
        pnpId: {
          uuid: stringToCharacteristicUUID("pnp_id"),
        },
        serialNumber: {
          uuid: stringToCharacteristicUUID("serial_number_string"),
        },
      },
    },
    battery: {
      uuid: stringToServiceUUID("battery_service"),
      characteristics: {
        batteryLevel: {
          uuid: stringToCharacteristicUUID("battery_level"),
        },
      },
    },
    main: {
      uuid: generateBluetoothUUID("0000"),
      characteristics: {
        rx: { uuid: generateBluetoothUUID("1000") },
        tx: { uuid: generateBluetoothUUID("1001") },
      },
    },
    smp: {
      uuid: "8d53dc1d-1db7-4cd3-868b-8a527460aa84",
      characteristics: {
        smp: { uuid: "da2e7828-fbce-4e01-ae9e-261174997c48" },
      },
    },
  },

  /** @type {BluetoothServiceUUID[]} */
  get serviceUUIDs() {
    return [this.services.main.uuid];
  },

  /** @type {BluetoothServiceUUID[]} */
  get optionalServiceUUIDs() {
    return [this.services.deviceInformation.uuid, this.services.battery.uuid, this.services.smp.uuid];
  },

  /**
   * @param {BluetoothServiceUUID} serviceUUID
   * @returns {BluetoothServiceName?}
   */
  getServiceNameFromUUID(serviceUUID) {
    serviceUUID = serviceUUID.toLowerCase();
    return Object.entries(this.services).find(([serviceName, serviceInfo]) => {
      let serviceInfoUUID = serviceInfo.uuid;
      if (serviceUUID.length == 4) {
        serviceInfoUUID = serviceInfoUUID.slice(4, 8);
      }
      if (!serviceUUID.includes("-")) {
        serviceInfoUUID = serviceInfoUUID.replaceAll("-", "");
      }
      return serviceUUID == serviceInfoUUID;
    })?.[0];
  },

  /**
   * @param {BluetoothCharacteristicUUID} characteristicUUID
   * @returns {BluetoothCharacteristicName?}
   */
  getCharacteristicNameFromUUID(characteristicUUID) {
    //_console.log({ characteristicUUID });
    characteristicUUID = characteristicUUID.toLowerCase();
    var characteristicName;
    Object.values(this.services).some((serviceInfo) => {
      characteristicName = Object.entries(serviceInfo.characteristics).find(
        ([characteristicName, characteristicInfo]) => {
          let characteristicInfoUUID = characteristicInfo.uuid;
          if (characteristicUUID.length == 4) {
            characteristicInfoUUID = characteristicInfoUUID.slice(4, 8);
          }
          if (!characteristicUUID.includes("-")) {
            characteristicInfoUUID = characteristicInfoUUID.replaceAll("-", "");
          }
          return characteristicUUID == characteristicInfoUUID;
        }
      )?.[0];
      return characteristicName;
    });
    return characteristicName;
  },
});

const serviceUUIDs = bluetoothUUIDs.serviceUUIDs;
const optionalServiceUUIDs = bluetoothUUIDs.optionalServiceUUIDs;
const allServiceUUIDs = [...serviceUUIDs, ...optionalServiceUUIDs];

/** @param {BluetoothServiceUUID} serviceUUID */
function getServiceNameFromUUID(serviceUUID) {
  return bluetoothUUIDs.getServiceNameFromUUID(serviceUUID);
}

/** @type {BluetoothCharacteristicUUID[]} */
const characteristicUUIDs = [];
/** @type {BluetoothCharacteristicUUID[]} */
const allCharacteristicUUIDs = [];
/** @type {BluetoothCharacteristicName[]} */
const allCharacteristicNames = [];

Object.entries(bluetoothUUIDs.services).forEach(([serviceName, serviceInfo]) => {
  if (!serviceInfo.characteristics) {
    return;
  }
  Object.entries(serviceInfo.characteristics).forEach(([characteristicName, characteristicInfo]) => {
    if (serviceUUIDs.includes(serviceInfo.uuid)) {
      characteristicUUIDs.push(characteristicInfo.uuid);
    }
    allCharacteristicUUIDs.push(characteristicInfo.uuid);
    allCharacteristicNames.push(characteristicName);
  });
}, []);

//_console.log({ characteristicUUIDs, allCharacteristicUUIDs });

/** @param {BluetoothCharacteristicUUID} characteristicUUID */
function getCharacteristicNameFromUUID(characteristicUUID) {
  return bluetoothUUIDs.getCharacteristicNameFromUUID(characteristicUUID);
}

/**
 * @param {BluetoothCharacteristicName} characteristicName
 * @returns {BluetoothCharacteristicProperties}
 */
function getCharacteristicProperties(characteristicName) {
  /** @type {BluetoothCharacteristicProperties} */
  const properties = {
    broadcast: false,
    read: true,
    writeWithoutResponse: false,
    write: false,
    notify: false,
    indicate: false,
    authenticatedSignedWrites: false,
    reliableWrite: false,
    writableAuxiliaries: false,
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

const serviceDataUUID = "0000";

const _console$e = createConsole("BluetoothConnectionManager", { log: true });









class BluetoothConnectionManager extends BaseConnectionManager {
  isInRange = true;

  /**
   * @protected
   * @param {BluetoothCharacteristicName} characteristicName
   * @param {DataView} dataView
   */
  onCharacteristicValueChanged(characteristicName, dataView) {
    if (characteristicName == "rx") {
      this.parseRxMessage(dataView);
    } else {
      this.onMessageReceived?.(characteristicName, dataView);
    }
  }

  /**
   * @protected
   * @param {BluetoothCharacteristicName} characteristicName
   * @param {ArrayBuffer} data
   */
  async writeCharacteristic(characteristicName, data) {
    _console$e.log("writeCharacteristic", ...arguments);
  }

  /** @param {ArrayBuffer} data */
  async sendSmpMessage(data) {
    super.sendSmpMessage(...arguments);
    await this.writeCharacteristic("smp", data);
  }

  /** @param {ArrayBuffer} data */
  async sendTxData(data) {
    super.sendTxData(...arguments);
    await this.writeCharacteristic("tx", data);
  }
}

const _console$d = createConsole("WebBluetoothConnectionManager", { log: true });
const { bluetooth } = webbluetooth;
var navigator$1 = { bluetooth };


/*
if (isInBrowser) {
  var navigator = window.navigator;
}
*/

class WebBluetoothConnectionManager extends BluetoothConnectionManager {
  get bluetoothId() {
    return this.device?.id;
  }

  /** @type {Object.<string, EventListener} */
  #boundBluetoothCharacteristicEventListeners = {
    characteristicvaluechanged: this.#onCharacteristicvaluechanged.bind(this),
  };
  /** @type {Object.<string, EventListener} */
  #boundBluetoothDeviceEventListeners = {
    gattserverdisconnected: this.#onGattserverdisconnected.bind(this),
  };

  static get isSupported() {
    return "bluetooth" in navigator$1;
  }
  /** @type {ConnectionType} */
  static get type() {
    return "webBluetooth";
  }

  /** @type {BluetoothDevice?} */
  #device;
  get device() {
    return this.#device;
  }
  set device(newDevice) {
    if (this.#device == newDevice) {
      _console$d.log("tried to assign the same BluetoothDevice");
      return;
    }
    if (this.#device) {
      removeEventListeners(this.#device, this.#boundBluetoothDeviceEventListeners);
    }
    if (newDevice) {
      addEventListeners(newDevice, this.#boundBluetoothDeviceEventListeners);
    }
    this.#device = newDevice;
  }

  /** @type {BluetoothRemoteGATTServer?} */
  get server() {
    return this.#device?.gatt;
  }
  get isConnected() {
    return this.server?.connected;
  }

  /** @type {Map.<BluetoothServiceName, BluetoothRemoteGATTService} */
  #services = new Map();
  /** @type {Map.<BluetoothCharacteristicName, BluetoothRemoteGATTCharacteristic} */
  #characteristics = new Map();

  async connect() {
    await super.connect();

    try {
      const device = await navigator$1.bluetooth.requestDevice({
        filters: [{ services: serviceUUIDs }],
        optionalServices: isInBrowser ? optionalServiceUUIDs : [],
      });

      _console$d.log("got BluetoothDevice");
      this.device = device;

      _console$d.log("connecting to device...");
      const server = await this.device.gatt.connect();
      _console$d.log(`connected to device? ${server.connected}`);

      await this.#getServicesAndCharacteristics();

      _console$d.log("fully connected");

      this.status = "connected";
    } catch (error) {
      _console$d.error(error);
      this.status = "not connected";
      this.server?.disconnect();
      this.#removeEventListeners();
    }
  }
  async #getServicesAndCharacteristics() {
    this.#removeEventListeners();

    _console$d.log("getting services...");
    const services = await this.server.getPrimaryServices();
    _console$d.log("got services", services.length);
    await this.server.getPrimaryService("8d53dc1d-1db7-4cd3-868b-8a527460aa84");

    _console$d.log("getting characteristics...");
    for (const serviceIndex in services) {
      const service = services[serviceIndex];
      _console$d.log({ service });
      const serviceName = getServiceNameFromUUID(service.uuid);
      _console$d.assertWithError(serviceName, `no name found for service uuid "${service.uuid}"`);
      _console$d.log(`got "${serviceName}" service`);
      service._name = serviceName;
      this.#services.set(serviceName, service);
      _console$d.log(`getting characteristics for "${serviceName}" service`);
      const characteristics = await service.getCharacteristics();
      _console$d.log(`got characteristics for "${serviceName}" service`);
      for (const characteristicIndex in characteristics) {
        const characteristic = characteristics[characteristicIndex];
        _console$d.log({ characteristic });
        const characteristicName = getCharacteristicNameFromUUID(characteristic.uuid);
        _console$d.assertWithError(
          characteristicName,
          `no name found for characteristic uuid "${characteristic.uuid}" in "${serviceName}" service`
        );
        _console$d.log(`got "${characteristicName}" characteristic in "${serviceName}" service`);
        characteristic._name = characteristicName;
        this.#characteristics.set(characteristicName, characteristic);
        addEventListeners(characteristic, this.#boundBluetoothCharacteristicEventListeners);
        const characteristicProperties = characteristic.properties || getCharacteristicProperties(characteristicName);
        if (characteristicProperties.notify) {
          _console$d.log(`starting notifications for "${characteristicName}" characteristic`);
          await characteristic.startNotifications();
        }
        if (characteristicProperties.read) {
          _console$d.log(`reading "${characteristicName}" characteristic...`);
          await characteristic.readValue();
          if (isInBluefy || isInWebBLE) {
            this.#onCharacteristicValueChanged(characteristic);
          }
        }
      }
    }
  }
  async #removeEventListeners() {
    if (this.device) {
      removeEventListeners(this.device, this.#boundBluetoothDeviceEventListeners);
    }

    const promises = Array.from(this.#characteristics.keys()).map((characteristicName) => {
      const characteristic = this.#characteristics.get(characteristicName);
      removeEventListeners(characteristic, this.#boundBluetoothCharacteristicEventListeners);
      const characteristicProperties = characteristic.properties || getCharacteristicProperties(characteristicName);
      if (characteristicProperties.notify) {
        _console$d.log(`stopping notifications for "${characteristicName}" characteristic`);
        return characteristic.stopNotifications();
      }
    });

    return Promise.allSettled(promises);
  }
  async disconnect() {
    await this.#removeEventListeners();
    await super.disconnect();
    this.server?.disconnect();
    this.status = "not connected";
  }

  /** @param {Event} event */
  #onCharacteristicvaluechanged(event) {
    _console$d.log("oncharacteristicvaluechanged");

    /** @type {BluetoothRemoteGATTCharacteristic} */
    const characteristic = event.target;

    this.#onCharacteristicValueChanged(characteristic);
  }

  /** @param {BluetoothRemoteGATTCharacteristic} characteristic */
  #onCharacteristicValueChanged(characteristic) {
    _console$d.log("onCharacteristicValue");

    /** @type {BluetoothCharacteristicName} */
    const characteristicName = characteristic._name;
    _console$d.assertWithError(characteristicName, `no name found for characteristic with uuid "${characteristic.uuid}"`);

    _console$d.log(`oncharacteristicvaluechanged for "${characteristicName}" characteristic`);
    const dataView = characteristic.value;
    _console$d.assertWithError(dataView, `no data found for "${characteristicName}" characteristic`);
    _console$d.log(`data for "${characteristicName}" characteristic`, Array.from(new Uint8Array(dataView.buffer)));

    try {
      this.onCharacteristicValueChanged(characteristicName, dataView);
    } catch (error) {
      _console$d.error(error);
    }
  }

  /**
   * @param {BluetoothCharacteristicName} characteristicName
   * @param {ArrayBuffer} data
   */
  async writeCharacteristic(characteristicName, data) {
    super.writeCharacteristic(...arguments);

    const characteristic = this.#characteristics.get(characteristicName);
    _console$d.assertWithError(characteristic, `${characteristicName} characteristic not found`);
    _console$d.log("writing characteristic", characteristic, data);
    const characteristicProperties = characteristic.properties || getCharacteristicProperties(characteristicName);
    if (characteristicProperties.writeWithoutResponse) {
      _console$d.log("writing without response");
      await characteristic.writeValueWithoutResponse(data);
    } else {
      _console$d.log("writing with response");
      await characteristic.writeValueWithResponse(data);
    }
    _console$d.log("wrote characteristic");

    if (characteristicProperties.read && !characteristicProperties.notify) {
      _console$d.log("reading value after write...");
      await characteristic.readValue();
      if (isInBluefy || isInWebBLE) {
        this.#onCharacteristicValueChanged(characteristic);
      }
    }
  }

  /** @param {Event} event */
  #onGattserverdisconnected(event) {
    _console$d.log("gattserverdisconnected");
    this.status = "not connected";
  }

  /** @type {boolean} */
  get canReconnect() {
    return this.server && !this.server.connected && this.isInRange;
  }
  async reconnect() {
    await super.reconnect();
    _console$d.log("attempting to reconnect...");
    this.status = "connecting";
    try {
      await this.server.connect();
    } catch (error) {
      _console$d.error(error);
      this.isInRange = false;
    }

    if (this.isConnected) {
      _console$d.log("successfully reconnected!");
      await this.#getServicesAndCharacteristics();
      this.status = "connected";
    } else {
      _console$d.log("unable to reconnect");
      this.status = "not connected";
    }
  }
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
            const uint32count = (offset + 3) >> 2;
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
            writeUint8((type << 5) | length);
        } else if (length < 0x100) {
            writeUint8((type << 5) | 24);
            writeUint8(length);
        } else if (length < 0x10000) {
            writeUint8((type << 5) | 25);
            writeUint16(length);
        } else if (length < 0x100000000) {
            writeUint8((type << 5) | 26);
            writeUint32(length);
        } else {
            writeUint8((type << 5) | 27);
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
                        utf8data.push(0xc0 | (charCode >> 6));
                        utf8data.push(0x80 | (charCode & 0x3f));
                    } else if (charCode < 0xd800) {
                        utf8data.push(0xe0 | (charCode >> 12));
                        utf8data.push(0x80 | ((charCode >> 6) & 0x3f));
                        utf8data.push(0x80 | (charCode & 0x3f));
                    } else {
                        charCode = (charCode & 0x3ff) << 10;
                        charCode |= value.charCodeAt(++i) & 0x3ff;
                        charCode += 0x10000;

                        utf8data.push(0xf0 | (charCode >> 18));
                        utf8data.push(0x80 | ((charCode >> 12) & 0x3f));
                        utf8data.push(0x80 | ((charCode >> 6) & 0x3f));
                        utf8data.push(0x80 | (charCode & 0x3f));
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
            exponent += (127 - 15) << 10;
        } else if (fraction !== 0) {
            return (sign ? -1 : 1) * fraction * POW_2_24;
        }

        tempDataView.setUint32(0, (sign << 16) | (exponent << 13) | (fraction << 13));
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
                    value = ((value & 0x1f) << 6) | (readUint8() & 0x3f);
                    length -= 1;
                } else if (value < 0xf0) {
                    value = ((value & 0x0f) << 12) | ((readUint8() & 0x3f) << 6) | (readUint8() & 0x3f);
                    length -= 2;
                } else {
                    value =
                        ((value & 0x0f) << 18) |
                        ((readUint8() & 0x3f) << 12) |
                        ((readUint8() & 0x3f) << 6) |
                        (readUint8() & 0x3f);
                    length -= 3;
                }
            }

            if (value < 0x10000) {
                utf16data.push(value);
            } else {
                value -= 0x10000;
                utf16data.push(0xd800 | (value >> 10));
                utf16data.push(0xdc00 | (value & 0x3ff));
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
                for (i = 0; i < length || (length < 0 && !readBreak()); ++i) {
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
    decode,
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


const _console$c = createConsole("mcumgr", { log: true });

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
    FS_MGMT_ID_FILE: 0,
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
        _console$c.log("mcumgr - message received");
        const message = new Uint8Array(buffer);
        this._buffer = new Uint8Array([...this._buffer, ...message]);
        const messageLength = this._buffer[2] * 256 + this._buffer[3];
        if (this._buffer.length < messageLength + 8) return;
        this._processMessage(this._buffer.slice(0, messageLength + 8));
        this._buffer = this._buffer.slice(messageLength + 8);
    }

    _processMessage(message) {
        const [op, , lengthHi, lengthLo, groupHi, groupLo, , id] = message;
        const data = CBOR.decode(message.slice(8).buffer);
        const length = lengthHi * 256 + lengthLo;
        const group = groupHi * 256 + groupLo;

        _console$c.log("mcumgr - Process Message - Group: " + group + ", Id: " + id + ", Off: " + data.off);
        if (group === constants.MGMT_GROUP_ID_IMAGE && id === constants.IMG_MGMT_ID_UPLOAD && data.off) {
            this._uploadOffset = data.off;
            this._uploadNext();
            return;
        }
        if (
            op === constants.MGMT_OP_WRITE_RSP &&
            group === constants.MGMT_GROUP_ID_FS &&
            id === constants.FS_MGMT_ID_FILE &&
            data.off
        ) {
            this._uploadFileOffset = data.off;
            this._uploadFileNext();
            return;
        }
        if (
            op === constants.MGMT_OP_READ_RSP &&
            group === constants.MGMT_GROUP_ID_FS &&
            id === constants.FS_MGMT_ID_FILE
        ) {
            this._downloadFileOffset += data.data.length;
            if (data.len != undefined) {
                this._downloadFileLength = data.len;
            }
            _console$c.log("downloaded " + this._downloadFileOffset + " bytes of " + this._downloadFileLength);
            if (this._downloadFileLength > 0) {
                this._fileDownloadProgressCallback({
                    percentage: Math.floor((this._downloadFileOffset / this._downloadFileLength) * 100),
                });
            }
            if (this._messageCallback) this._messageCallback({ op, group, id, data, length });
            this._downloadFileNext();
            return;
        }

        if (this._messageCallback) this._messageCallback({ op, group, id, data, length });
    }

    cmdReset() {
        return this._getMessage(constants.MGMT_OP_WRITE, constants.MGMT_GROUP_ID_OS, constants.OS_MGMT_ID_RESET);
    }

    smpEcho(message) {
        return this._getMessage(constants.MGMT_OP_WRITE, constants.MGMT_GROUP_ID_OS, constants.OS_MGMT_ID_ECHO, {
            d: message,
        });
    }

    cmdImageState() {
        return this._getMessage(constants.MGMT_OP_READ, constants.MGMT_GROUP_ID_IMAGE, constants.IMG_MGMT_ID_STATE);
    }

    cmdImageErase() {
        return this._getMessage(
            constants.MGMT_OP_WRITE,
            constants.MGMT_GROUP_ID_IMAGE,
            constants.IMG_MGMT_ID_ERASE,
            {}
        );
    }

    cmdImageTest(hash) {
        return this._getMessage(constants.MGMT_OP_WRITE, constants.MGMT_GROUP_ID_IMAGE, constants.IMG_MGMT_ID_STATE, {
            hash,
            confirm: false,
        });
    }

    cmdImageConfirm(hash) {
        return this._getMessage(constants.MGMT_OP_WRITE, constants.MGMT_GROUP_ID_IMAGE, constants.IMG_MGMT_ID_STATE, {
            hash,
            confirm: true,
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
        const message = { data: new Uint8Array(), off: this._uploadOffset };
        if (this._uploadOffset === 0) {
            message.len = this._uploadImage.byteLength;
            message.sha = new Uint8Array(await this._hash(this._uploadImage));
        }
        this._imageUploadProgressCallback({
            percentage: Math.floor((this._uploadOffset / this._uploadImage.byteLength) * 100),
        });

        const length = this._mtu - CBOR.encode(message).byteLength - nmpOverhead - 3 - 5;

        message.data = new Uint8Array(this._uploadImage.slice(this._uploadOffset, this._uploadOffset + length));

        this._uploadOffset += length;

        const packet = this._getMessage(
            constants.MGMT_OP_WRITE,
            constants.MGMT_GROUP_ID_IMAGE,
            constants.IMG_MGMT_ID_UPLOAD,
            message
        );

        _console$c.log("mcumgr - _uploadNext: Message Length: " + packet.length);

        this._imageUploadNextCallback({ packet });
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

    async cmdUpload(image, slot = 0) {
        if (this._uploadIsInProgress) {
            _console$c.error("Upload is already in progress.");
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
            _console$c.error("Upload is already in progress.");
            return;
        }
        this._uploadIsInProgress = true;
        this._uploadFileOffset = 0;
        this._uploadFile = filebuf;
        this._uploadFilename = destFilename;

        this._uploadFileNext();
    }

    async _uploadFileNext() {
        _console$c.log("uploadFileNext - offset: " + this._uploadFileOffset + ", length: " + this._uploadFile.byteLength);

        if (this._uploadFileOffset >= this._uploadFile.byteLength) {
            this._uploadIsInProgress = false;
            this._fileUploadFinishedCallback();
            return;
        }

        const nmpOverhead = 8;
        const message = { data: new Uint8Array(), off: this._uploadFileOffset };
        if (this._uploadFileOffset === 0) {
            message.len = this._uploadFile.byteLength;
        }
        message.name = this._uploadFilename;
        this._fileUploadProgressCallback({
            percentage: Math.floor((this._uploadFileOffset / this._uploadFile.byteLength) * 100),
        });

        const length = this._mtu - CBOR.encode(message).byteLength - nmpOverhead;

        message.data = new Uint8Array(this._uploadFile.slice(this._uploadFileOffset, this._uploadFileOffset + length));

        this._uploadFileOffset += length;

        const packet = this._getMessage(
            constants.MGMT_OP_WRITE,
            constants.MGMT_GROUP_ID_FS,
            constants.FS_MGMT_ID_FILE,
            message
        );

        _console$c.log("mcumgr - _uploadNext: Message Length: " + packet.length);

        this._fileUploadNextCallback({ packet });
    }

    async cmdDownloadFile(filename, destFilename) {
        if (this._downloadIsInProgress) {
            _console$c.error("Download is already in progress.");
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

        const message = { off: this._downloadFileOffset };
        if (this._downloadFileOffset === 0) {
            message.name = this._downloadRemoteFilename;
        }

        const packet = this._getMessage(
            constants.MGMT_OP_READ,
            constants.MGMT_GROUP_ID_FS,
            constants.FS_MGMT_ID_FILE,
            message
        );
        _console$c.log("mcumgr - _downloadNext: Message Length: " + packet.length);
        this._fileDownloadNextCallback({ packet });
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

        info.hash = [...new Uint8Array(await this._hash(image.slice(0, imageSize + 32)))]
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");

        return info;
    }
}

const _console$b = createConsole("FirmwareManager", { log: true });

/** @typedef {"smp"} FirmwareMessageType */



/** @typedef {FirmwareMessageType | "firmwareImages" | "firmwareUploadProgress" | "firmwareStatus" | "firmwareUploadComplete"} FirmwareManagerEventType */

/** @typedef {"idle" | "uploading" | "uploaded" | "pending" | "testing" | "erasing"} FirmwareStatus */



/**
 * @typedef {Object} BaseSmpEvent
 * @property {"smp"} type
 */
/** @typedef {BaseDeviceEvent & BaseSmpEvent} SmpEvent */

/**
 * @typedef {Object} BaseFirmwareImagesEvent
 * @property {"firmwareImages"} type
 * @property {{firmwareImages: FirmwareImage[]}} message
 */
/** @typedef {BaseDeviceEvent & BaseFirmwareImagesEvent} FirmwareImagesEvent */

/**
 * @typedef {Object} BaseFirmwareUploadProgressEvent
 * @property {"firmwareUploadProgress"} type
 * @property {{firmwareUploadProgress: number}} message
 */
/** @typedef {BaseDeviceEvent & BaseFirmwareUploadProgressEvent} FirmwareUploadProgressEvent */

/**
 * @typedef {Object} BaseFirmwareUploadCompleteEvent
 * @property {"firmwareUploadComplete"} type
 */
/** @typedef {BaseDeviceEvent & BaseFirmwareUploadCompleteEvent} FirmwareUploadCompleteEvent */

/**
 * @typedef {Object} BaseFirmwareStatusEvent
 * @property {"firmwareStatus"} type
 * @property {{firmwareStatus: FirmwareStatus}} message
 */
/** @typedef {BaseDeviceEvent & BaseFirmwareStatusEvent} FirmwareStatusEvent */

/**
 * @typedef {SmpEvent |
 * FirmwareImagesEvent |
 * FirmwareUploadProgressEvent |
 * FirmwareUploadCompleteEvent |
 * FirmwareStatusEvent
 * } FirmwareManagerEvent
 */
/** @typedef {(event: FirmwareManagerEvent) => void} FirmwareManagerEventListener */

class FirmwareManager {
  /**
   * @callback SendMessageCallback
   * @param {ArrayBuffer} data
   */

  /** @type {SendMessageCallback} */
  sendMessage;

  constructor() {
    this.#assignMcuManagerCallbacks();
  }

  /** @type {FirmwareMessageType[]} */
  static #MessageTypes = ["smp"];
  static get MessageTypes() {
    return this.#MessageTypes;
  }
  get messageTypes() {
    return FirmwareManager.MessageTypes;
  }

  // EVENT DISPATCHER

  /** @type {FirmwareManagerEventType[]} */
  static #EventTypes = [
    ...this.#MessageTypes,
    "firmwareImages",
    "firmwareUploadProgress",
    "firmwareUploadComplete",
    "firmwareStatus",
  ];
  static get EventTypes() {
    return this.#EventTypes;
  }
  get eventTypes() {
    return FirmwareManager.#EventTypes;
  }
  /** @type {EventDispatcher} */
  eventDispatcher;

  /**
   * @param {FirmwareManagerEventType} type
   * @param {FirmwareManagerEventListener} listener
   * @param {EventDispatcherOptions} [options]
   */
  addEventListener(type, listener, options) {
    this.eventDispatcher.addEventListener(type, listener, options);
  }

  /** @param {FirmwareManagerEvent} event */
  #dispatchEvent(event) {
    this.eventDispatcher.dispatchEvent(event);
  }

  /**
   * @param {FirmwareManagerEventType} type
   * @param {FirmwareManagerEventListener} listener
   */
  removeEventListener(type, listener) {
    return this.eventDispatcher.removeEventListener(type, listener);
  }

  /** @param {FirmwareManagerEventType} eventType */
  waitForEvent(eventType) {
    return this.eventDispatcher.waitForEvent(eventType);
  }

  /**
   * @param {FirmwareMessageType} messageType
   * @param {DataView} dataView
   */
  parseMessage(messageType, dataView) {
    _console$b.log({ messageType });

    switch (messageType) {
      case "smp":
        this.#mcuManager._notification(Array.from(new Uint8Array(dataView.buffer)));
        this.#dispatchEvent({ type: "smp" });
        break;
      default:
        throw Error(`uncaught messageType ${messageType}`);
    }
  }

  

  /** @param {FileLike} file */
  async uploadFirmware(file) {
    _console$b.log("uploadFirmware", file);

    const promise = this.waitForEvent("firmwareUploadComplete");

    await this.getImages();

    const arrayBuffer = await getFileBuffer(file);
    const imageInfo = await this.#mcuManager.imageInfo(arrayBuffer);
    _console$b.log({ imageInfo });

    this.#mcuManager.cmdUpload(arrayBuffer, 1);

    this.#updateStatus("uploading");

    await promise;
  }

  /** @type {FirmwareStatus[]} */
  static #Statuses = ["idle", "uploading", "uploaded", "pending", "testing", "erasing"];
  static get Statuses() {
    return this.#Statuses;
  }

  /** @type {FirmwareStatus} */
  #status = "idle";
  get status() {
    return this.#status;
  }
  /** @param {FirmwareStatus} newStatus */
  #updateStatus(newStatus) {
    _console$b.assertEnumWithError(newStatus, FirmwareManager.Statuses);
    if (this.#status == newStatus) {
      _console$b.log(`redundant firmwareStatus assignment "${newStatus}"`);
      return;
    }

    this.#status = newStatus;
    _console$b.log({ firmwareStatus: this.#status });
    this.#dispatchEvent({ type: "firmwareStatus", message: { firmwareStatus: this.#status } });
  }

  // COMMANDS

  /**
   * @typedef {Object} FirmwareImage
   * @property {number} slot
   * @property {boolean} active
   * @property {boolean} confirmed
   * @property {boolean} pending
   * @property {boolean} permanent
   * @property {boolean} bootable
   * @property {string} version
   * @property {Uint8Array} [hash]
   * @property {boolean} [empty]
   */

  /** @type {FirmwareImage[]} */
  #images;
  get images() {
    return this.#images;
  }
  #assertImages() {
    _console$b.assertWithError(this.#images, "didn't get imageState");
  }
  #assertValidImageIndex(imageIndex) {
    _console$b.assertTypeWithError(imageIndex, "number");
    _console$b.assertWithError(imageIndex == 0 || imageIndex == 1, "imageIndex must be 0 or 1");
  }
  async getImages() {
    const promise = this.waitForEvent("firmwareImages");

    _console$b.log("getting firmware image state...");
    this.sendMessage(Uint8Array.from(this.#mcuManager.cmdImageState()).buffer);

    await promise;
  }

  /** @param {number} imageIndex */
  async testImage(imageIndex = 1) {
    this.#assertValidImageIndex(imageIndex);
    this.#assertImages();
    if (!this.#images[imageIndex]) {
      _console$b.log(`image ${imageIndex} not found`);
      return;
    }
    if (this.#images[imageIndex].pending == true) {
      _console$b.log(`image ${imageIndex} is already pending`);
      return;
    }
    if (this.#images[imageIndex].empty) {
      _console$b.log(`image ${imageIndex} is empty`);
      return;
    }

    const promise = this.waitForEvent("smp");

    _console$b.log("testing firmware image...");
    this.sendMessage(Uint8Array.from(this.#mcuManager.cmdImageTest(this.#images[imageIndex].hash)).buffer);

    await promise;
  }

  async eraseImage() {
    this.#assertImages();
    const promise = this.waitForEvent("smp");

    _console$b.log("erasing image...");
    this.sendMessage(Uint8Array.from(this.#mcuManager.cmdImageErase()).buffer);

    this.#updateStatus("erasing");

    await promise;
    await this.getImages();
  }

  /** @param {number} imageIndex */
  async confirmImage(imageIndex = 0) {
    this.#assertValidImageIndex(imageIndex);
    this.#assertImages();
    if (this.#images[imageIndex].confirmed === true) {
      _console$b.log(`image ${imageIndex} is already confirmed`);
      return;
    }

    const promise = this.waitForEvent("smp");

    _console$b.log("confirming image...");
    this.sendMessage(Uint8Array.from(this.#mcuManager.cmdImageConfirm(this.#images[imageIndex].hash)).buffer);

    await promise;
  }

  /** @param {string} echo */
  async echo(string) {
    _console$b.assertTypeWithError(string, "string");

    const promise = this.waitForEvent("smp");

    _console$b.log("sending echo...");
    this.sendMessage(Uint8Array.from(this.#mcuManager.smpEcho(string)).buffer);

    await promise;
  }

  async reset() {
    const promise = this.waitForEvent("smp");

    _console$b.log("resetting...");
    this.sendMessage(Uint8Array.from(this.#mcuManager.cmdReset()).buffer);

    await promise;
  }

  // MTU

  #mtu;
  get mtu() {
    return this.#mtu;
  }
  set mtu(newMtu) {
    this.#mtu = newMtu;
    this.#mcuManager._mtu = this.#mtu;
  }

  // MCUManager

  #mcuManager = new MCUManager();

  #assignMcuManagerCallbacks() {
    this.#mcuManager.onMessage(this.#onMcuMessage.bind(this));

    this.#mcuManager.onFileDownloadNext(this.#onMcuFileDownloadNext);
    this.#mcuManager.onFileDownloadProgress(this.#onMcuFileDownloadProgress.bind(this));
    this.#mcuManager.onFileDownloadFinished(this.#onMcuFileDownloadFinished.bind(this));

    this.#mcuManager.onFileUploadNext(this.#onMcuFileUploadNext.bind(this));
    this.#mcuManager.onFileUploadProgress(this.#onMcuFileUploadProgress.bind(this));
    this.#mcuManager.onFileUploadFinished(this.#onMcuFileUploadFinished.bind(this));

    this.#mcuManager.onImageUploadNext(this.#onMcuImageUploadNext.bind(this));
    this.#mcuManager.onImageUploadProgress(this.#onMcuImageUploadProgress.bind(this));
    this.#mcuManager.onImageUploadFinished(this.#onMcuImageUploadFinished.bind(this));
  }

  #onMcuMessage({ op, group, id, data, length }) {
    _console$b.log("onMcuMessage", ...arguments);

    switch (group) {
      case constants.MGMT_GROUP_ID_OS:
        switch (id) {
          case constants.OS_MGMT_ID_ECHO:
            _console$b.log(`echo "${data.r}"`);
            break;
          case constants.OS_MGMT_ID_TASKSTAT:
            _console$b.table(data.tasks);
            break;
          case constants.OS_MGMT_ID_MPSTAT:
            _console$b.log(data);
            break;
        }
        break;
      case constants.MGMT_GROUP_ID_IMAGE:
        switch (id) {
          case constants.IMG_MGMT_ID_STATE:
            this.#onMcuImageState(data);
        }
        break;
      default:
        throw Error(`uncaught mcuMessage group ${group}`);
    }
  }

  #onMcuFileDownloadNext() {
    _console$b.log("onMcuFileDownloadNext", ...arguments);
  }
  #onMcuFileDownloadProgress() {
    _console$b.log("onMcuFileDownloadProgress", ...arguments);
  }
  #onMcuFileDownloadFinished() {
    _console$b.log("onMcuFileDownloadFinished", ...arguments);
  }

  #onMcuFileUploadNext() {
    _console$b.log("onMcuFileUploadNext", ...arguments);
  }
  #onMcuFileUploadProgress() {
    _console$b.log("onMcuFileUploadProgress", ...arguments);
  }
  #onMcuFileUploadFinished() {
    _console$b.log("onMcuFileUploadFinished", ...arguments);
  }

  #onMcuImageUploadNext({ packet }) {
    _console$b.log("onMcuImageUploadNext", ...arguments);
    this.sendMessage(Uint8Array.from(packet).buffer);
  }
  #onMcuImageUploadProgress({ percentage }) {
    const progress = percentage / 100;
    _console$b.log("onMcuImageUploadProgress", ...arguments);
    this.#dispatchEvent({ type: "firmwareUploadProgress", message: { firmwareUploadProgress: progress } });
  }
  async #onMcuImageUploadFinished() {
    _console$b.log("onMcuImageUploadFinished", ...arguments);

    await this.getImages();

    this.#dispatchEvent({ type: "firmwareUploadProgress", message: { firmwareUploadProgress: 100 } });
    this.#dispatchEvent({ type: "firmwareUploadComplete" });
  }

  #onMcuImageState(data) {
    if (data.images) {
      this.#images = data.images;
      _console$b.log("images", this.#images);
    } else {
      _console$b.log("no images found");
      return;
    }

    /** @type {FirmwareStatus} */
    let newStatus = "idle";

    if (this.#images.length == 2) {
      if (!this.#images[1].bootable) {
        _console$b.warn('Slot 1 has a invalid image. Click "Erase Image" to erase it or upload a different image');
      } else if (!this.#images[0].confirmed) {
        _console$b.log(
          'Slot 0 has a valid image. Click "Confirm Image" to confirm it or wait and the device will swap images back.'
        );
        newStatus = "testing";
      } else {
        if (this.#images[1].pending) {
          _console$b.log("reset to upload to the new firmware image");
          newStatus = "pending";
        } else {
          _console$b.log("Slot 1 has a valid image. run testImage() to test it or upload a different image.");
          newStatus = "uploaded";
        }
      }
    }

    if (this.#images.length == 1) {
      this.#images.push({
        slot: 1,
        empty: true,
        version: "Empty",
        pending: false,
        confirmed: false,
        bootable: false,
      });

      _console$b.log("Select a firmware upload image to upload to slot 1.");
    }

    this.#updateStatus(newStatus);
    this.#dispatchEvent({ type: "firmwareImages", message: { firmwareImages: this.#images } });
  }
}

const _console$a = createConsole("Device", { log: true });
















/** @typedef {"connectionStatus" | ConnectionStatus | "isConnected" | ConnectionMessageType | DeviceInformationManagerEventType | SensorType | "connectionMessage" | FileTransferManagerEventType | TfliteManagerEventType | FirmwareManagerEventType} DeviceEventType */



/**
 * @typedef {Object} BaseDeviceEvent
 * @property {Device} target
 * @property {DeviceEventType} type
 */

/**
 * @typedef {Object} BaseBatteryLevelEvent
 * @property {"batteryLevel"} type
 * @property {{batteryLevel: number}} message
 */
/** @typedef {BaseDeviceEvent & BaseBatteryLevelEvent} BatteryLevelEvent */



/**
 * @typedef {Object} BaseIsConnectedEvent
 * @property {"isConnected"} type
 * @property {{isConnected: boolean}} message
 */
/** @typedef {BaseDeviceEvent & BaseIsConnectedEvent} IsConnectedEvent */

/**
 * @typedef {Object} BaseConnectionStatusEvent
 * @property {"connectionStatus"} type
 * @property {{connectionStatus: ConnectionStatus}} message
 */
/** @typedef {BaseDeviceEvent & BaseConnectionStatusEvent} ConnectionStatusEvent */

/** @typedef {BaseIsConnectedEvent | ConnectionStatusEvent} ConnectionEvents */







/**
 * @typedef {DeviceInformationManagerEvent |
 * BatteryLevelEvent |
 * ConnectionEvents |
 * InformationManagerEvent |
 * TfliteManagerEvent |
 * FirmwareManagerEvent |
 * FileTransferManagerEvent |
 * SensorDataManagerEvent
 * } DeviceEvent
 */
/** @typedef {(event: DeviceEvent) => void} DeviceEventListener */

/** @typedef {"deviceConnected" | "deviceDisconnected" | "deviceIsConnected" | "availableDevices" | "connectedDevices"} StaticDeviceEventType */
/**
 * @typedef {Object} BaseStaticDeviceEvent
 * @property {StaticDeviceEventType} type
 */

/**
 * @typedef {Object} BaseStaticDeviceConnectedEvent
 * @property {"deviceConnected"} type
 * @property {{device: Device}} message
 */
/** @typedef {BaseStaticDeviceEvent & BaseStaticDeviceConnectedEvent} StaticDeviceConnectedEvent */

/**
 * @typedef {Object} BaseStaticDeviceDisconnectedEvent
 * @property {"deviceDisconnected"} type
 * @property {{device: Device}} message
 */
/** @typedef {BaseStaticDeviceEvent & BaseStaticDeviceDisconnectedEvent} StaticDeviceDisconnectedEvent */

/**
 * @typedef {Object} BaseStaticDeviceIsConnectedEvent
 * @property {"deviceIsConnected"} type
 * @property {{device: Device}} message
 */
/** @typedef {BaseStaticDeviceEvent & BaseStaticDeviceIsConnectedEvent} StaticDeviceIsConnectedEvent */

/**
 * @typedef {Object} BaseStaticAvailableDevicesEvent
 * @property {"availableDevices"} type
 * @property {{availableDevices: Device[]}} message
 */
/** @typedef {BaseStaticDeviceEvent & BaseStaticAvailableDevicesEvent} StaticAvailableDevicesEvent */

/**
 * @typedef {Object} BaseStaticConnectedDevicesEvent
 * @property {"connectedDevices"} type
 * @property {{connectedDevices: Device[]}} message
 */
/** @typedef {BaseStaticDeviceEvent & BaseStaticConnectedDevicesEvent} StaticConnectedDevicesEvent */

/**
 * @typedef {StaticDeviceConnectedEvent |
 * StaticDeviceDisconnectedEvent |
 * StaticDeviceIsConnectedEvent |
 * StaticAvailableDevicesEvent |
 * StaticConnectedDevicesEvent
 * } StaticDeviceEvent
 */
/** @typedef {(event: StaticDeviceEvent) => void} StaticDeviceEventListener */

class Device {
  get bluetoothId() {
    return this.#connectionManager?.bluetoothId;
  }

  constructor() {
    this.#deviceInformationManager.eventDispatcher = this.#eventDispatcher;

    this.#informationManager.sendMessage = this.#sendTxMessages.bind(this);
    this.#informationManager.eventDispatcher = this.#eventDispatcher;

    this.#sensorConfigurationManager.sendMessage = this.#sendTxMessages.bind(this);
    this.#sensorConfigurationManager.eventDispatcher = this.#eventDispatcher;

    this.#sensorDataManager.sendMessage = this.#sendTxMessages.bind(this);
    this.#sensorDataManager.eventDispatcher = this.#eventDispatcher;

    this.#vibrationManager.sendMessage = this.#sendTxMessages.bind(this);

    this.#tfliteManager.sendMessage = this.#sendTxMessages.bind(this);
    this.#tfliteManager.eventDispatcher = this.#eventDispatcher;

    this.#fileTransferManager.sendMessage = this.#sendTxMessages.bind(this);
    this.#fileTransferManager.eventDispatcher = this.#eventDispatcher;

    this.#firmwareManager.sendMessage = this.#sendSmpMessage.bind(this);
    this.#firmwareManager.eventDispatcher = this.#eventDispatcher;

    this.addEventListener("getMtu", () => {
      this.#firmwareManager.mtu = this.mtu;
      this.#fileTransferManager.mtu = this.mtu;
      this.connectionManager.mtu = this.mtu;
    });
    this.addEventListener("getType", () => {
      if (Device.#UseLocalStorage) {
        Device.#UpdateLocalStorageConfigurationForDevice(this);
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
      /** can add more node.js leave handlers https://gist.github.com/hyrious/30a878f6e6a057f09db87638567cb11a */
      process.on("exit", () => {
        if (this.isConnected && this.clearSensorConfigurationOnLeave) {
          this.clearSensorConfiguration();
        }
      });
    }

    this.addEventListener("isConnected", () => {
      Device.#OnDeviceIsConnected(this);
    });
  }

  /** @returns {BaseConnectionManager} */
  static get #DefaultConnectionManager() {
    return WebBluetoothConnectionManager;
  }

  // EVENT DISPATCHER

  /** @type {DeviceEventType[]} */
  static #EventTypes = [
    "batteryLevel",

    "connectionStatus",
    ...BaseConnectionManager.Statuses,
    "isConnected",

    "connectionMessage",

    ...DeviceInformationManager.EventTypes,
    ...InformationManager.EventTypes,
    ...SensorConfigurationManager.EventTypes,
    ...SensorDataManager.EventTypes,
    ...FileTransferManager.EventTypes,
    ...TfliteManager$1.EventTypes,
    ...FirmwareManager.EventTypes,
  ];
  static get EventTypes() {
    return this.#EventTypes;
  }
  get eventTypes() {
    return Device.#EventTypes;
  }
  #eventDispatcher = new EventDispatcher(this, this.eventTypes);

  /**
   * @param {DeviceEventType} type
   * @param {DeviceEventListener} listener
   * @param {EventDispatcherOptions} [options]
   */
  addEventListener(type, listener, options) {
    this.#eventDispatcher.addEventListener(type, listener, options);
  }

  /**
   * @param {DeviceEvent} event
   */
  #dispatchEvent(event) {
    this.#eventDispatcher.dispatchEvent(event);
  }

  /**
   * @param {DeviceEventType} type
   * @param {DeviceEventListener} listener
   */
  removeEventListener(type, listener) {
    return this.#eventDispatcher.removeEventListener(type, listener);
  }

  /** @param {DeviceEventType} type */
  waitForEvent(type) {
    return this.#eventDispatcher.waitForEvent(type);
  }

  // CONNECTION MANAGER

  /** @type {BaseConnectionManager?} */
  #connectionManager;
  get connectionManager() {
    return this.#connectionManager;
  }
  set connectionManager(newConnectionManager) {
    if (this.connectionManager == newConnectionManager) {
      _console$a.log("same connectionManager is already assigned");
      return;
    }

    if (this.connectionManager) {
      this.connectionManager.onStatusUpdated = null;
      this.connectionManager.onMessageReceived = null;
    }
    if (newConnectionManager) {
      newConnectionManager.onStatusUpdated = this.#onConnectionStatusUpdated.bind(this);
      newConnectionManager.onMessageReceived = this.#onConnectionMessageReceived.bind(this);
    }

    this.#connectionManager = newConnectionManager;
    _console$a.log("assigned new connectionManager", this.#connectionManager);
  }
  /**
   * @param {TxMessage[]} messages
   * @param {boolean} sendImmediately
   */
  async #sendTxMessages(messages, sendImmediately) {
    await this.#connectionManager?.sendTxMessages(...arguments);
  }

  async connect() {
    if (!this.connectionManager) {
      this.connectionManager = new Device.#DefaultConnectionManager();
    }
    this.#clear();
    return this.connectionManager.connect();
  }
  #isConnected = false;
  get isConnected() {
    return this.#isConnected;
  }
  /** @throws {Error} if not connected */
  #assertIsConnected() {
    _console$a.assertWithError(this.isConnected, "not connected");
  }

  /** @type {TxRxMessageType[]} */
  static #RequiredInformationConnectionMessages = [
    "isCharging",
    "getBatteryCurrent",
    "getId",
    "getMtu",

    "getName",
    "getType",
    "getCurrentTime",
    "getSensorConfiguration",
    "getSensorScalars",
    "getPressurePositions",

    "maxFileLength",
    "getFileLength",
    "getFileChecksum",
    "getFileTransferType",
    "fileTransferStatus",

    "getTfliteName",
    "getTfliteTask",
    "getTfliteSampleRate",
    "getTfliteSensorTypes",
    "tfliteIsReady",
    "getTfliteCaptureDelay",
    "getTfliteThreshold",
    "getTfliteInferencingEnabled",
  ];
  get #requiredInformationConnectionMessages() {
    return Device.#RequiredInformationConnectionMessages;
  }
  get #hasRequiredInformation() {
    return this.#requiredInformationConnectionMessages.every((messageType) => {
      return this.latestConnectionMessage.has(messageType);
    });
  }
  #requestRequiredInformation() {
    /** @type {TxMessage[]} */
    const messages = this.#requiredInformationConnectionMessages.map((messageType) => ({
      type: messageType,
    }));
    this.#sendTxMessages(messages);
  }

  get canReconnect() {
    return this.connectionManager?.canReconnect;
  }
  async reconnect() {
    this.#clear();
    return this.connectionManager?.reconnect();
  }

  static #ReconnectOnDisconnection = false;
  static get ReconnectOnDisconnection() {
    return this.#ReconnectOnDisconnection;
  }
  static set ReconnectOnDisconnection(newReconnectOnDisconnection) {
    _console$a.assertTypeWithError(newReconnectOnDisconnection, "boolean");
    this.#ReconnectOnDisconnection = newReconnectOnDisconnection;
  }

  #reconnectOnDisconnection = Device.ReconnectOnDisconnection;
  get reconnectOnDisconnection() {
    return this.#reconnectOnDisconnection;
  }
  set reconnectOnDisconnection(newReconnectOnDisconnection) {
    _console$a.assertTypeWithError(newReconnectOnDisconnection, "boolean");
    this.#reconnectOnDisconnection = newReconnectOnDisconnection;
  }
  /** @type {number?} */
  #reconnectIntervalId;

  get connectionType() {
    return this.connectionManager?.type;
  }
  async disconnect() {
    this.#assertIsConnected();
    if (this.reconnectOnDisconnection) {
      this.reconnectOnDisconnection = false;
      this.addEventListener(
        "isConnected",
        () => {
          this.reconnectOnDisconnection = true;
        },
        { once: true }
      );
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

  /** @returns {ConnectionStatus} */
  get connectionStatus() {
    switch (this.#connectionManager?.status) {
      case "connected":
        return this.isConnected ? "connected" : "connecting";
      case "not connected":
      case "connecting":
      case "disconnecting":
        return this.#connectionManager.status;
      default:
        return "not connected";
    }
  }
  get isConnectionBusy() {
    return this.connectionStatus == "connecting" || this.connectionStatus == "disconnecting";
  }

  /** @param {ConnectionStatus} connectionStatus */
  #onConnectionStatusUpdated(connectionStatus) {
    _console$a.log({ connectionStatus });

    if (connectionStatus == "not connected") {
      //this.#clear();

      if (this.canReconnect && this.reconnectOnDisconnection) {
        _console$a.log("starting reconnect interval...");
        this.#reconnectIntervalId = setInterval(() => {
          _console$a.log("attempting reconnect...");
          this.reconnect();
        }, 1000);
      }
    } else {
      if (this.#reconnectIntervalId != undefined) {
        _console$a.log("clearing reconnect interval");
        clearInterval(this.#reconnectIntervalId);
        this.#reconnectIntervalId = undefined;
      }
    }

    this.#checkConnection();

    if (connectionStatus == "connected" && !this.#isConnected) {
      this.#requestRequiredInformation();
    }

    if (connectionStatus == "not connected" && !this.canReconnect && Device.#AvailableDevices.includes(this)) {
      const deviceIndex = Device.#AvailableDevices.indexOf(this);
      Device.AvailableDevices.splice(deviceIndex, 1);
      Device.#DispatchAvailableDevices();
    }
  }

  /** @param {boolean} includeIsConnected */
  #dispatchConnectionEvents(includeIsConnected = false) {
    this.#dispatchEvent({ type: "connectionStatus", message: { connectionStatus: this.connectionStatus } });
    this.#dispatchEvent({ type: this.connectionStatus });
    if (includeIsConnected) {
      this.#dispatchEvent({ type: "isConnected", message: { isConnected: this.isConnected } });
    }
  }
  #checkConnection() {
    this.#isConnected =
      this.connectionManager?.isConnected && this.#hasRequiredInformation && this.#informationManager.isCurrentTimeSet;

    switch (this.connectionStatus) {
      case "connected":
        if (this.#isConnected) {
          this.#dispatchConnectionEvents(true);
        }
        break;
      case "not connected":
        this.#dispatchConnectionEvents(true);
        break;
      default:
        this.#dispatchConnectionEvents(false);
        break;
    }
  }

  #clear() {
    this.latestConnectionMessage.clear();
    this.#informationManager.clear();
    this.#deviceInformationManager.clear();
  }

  /**
   * @param {ConnectionMessageType} messageType
   * @param {DataView} dataView
   */
  #onConnectionMessageReceived(messageType, dataView) {
    _console$a.log({ messageType, dataView });
    switch (messageType) {
      case "batteryLevel":
        const batteryLevel = dataView.getUint8(0);
        _console$a.log("received battery level", { batteryLevel });
        this.#updateBatteryLevel(batteryLevel);
        break;

      default:
        if (this.#fileTransferManager.messageTypes.includes(messageType)) {
          this.#fileTransferManager.parseMessage(messageType, dataView);
        } else if (this.#tfliteManager.messageTypes.includes(messageType)) {
          this.#tfliteManager.parseMessage(messageType, dataView);
        } else if (this.#sensorDataManager.messageTypes.includes(messageType)) {
          this.#sensorDataManager.parseMessage(messageType, dataView);
        } else if (this.#firmwareManager.messageTypes.includes(messageType)) {
          this.#firmwareManager.parseMessage(messageType, dataView);
        } else if (this.#deviceInformationManager.messageTypes.includes(messageType)) {
          this.#deviceInformationManager.parseMessage(messageType, dataView);
        } else if (this.#informationManager.messageTypes.includes(messageType)) {
          this.#informationManager.parseMessage(messageType, dataView);
        } else if (this.#sensorConfigurationManager.messageTypes.includes(messageType)) {
          this.#sensorConfigurationManager.parseMessage(messageType, dataView);
        } else {
          throw Error(`uncaught messageType ${messageType}`);
        }
    }

    this.latestConnectionMessage.set(messageType, dataView);
    this.#dispatchEvent({ type: "connectionMessage", message: { messageType, dataView } });

    if (!this.isConnected && this.#hasRequiredInformation) {
      this.#checkConnection();
    }
  }

  /** @type {Map.<ConnectionMessageType, DataView>} */
  latestConnectionMessage = new Map();

  // DEVICE INFORMATION

  #deviceInformationManager = new DeviceInformationManager();

  get deviceInformation() {
    return this.#deviceInformationManager.information;
  }

  // BATTERY LEVEL

  #batteryLevel = 0;
  get batteryLevel() {
    return this.#batteryLevel;
  }
  /** @param {number} updatedBatteryLevel */
  #updateBatteryLevel(updatedBatteryLevel) {
    _console$a.assertTypeWithError(updatedBatteryLevel, "number");
    if (this.#batteryLevel == updatedBatteryLevel) {
      _console$a.log(`duplicate batteryLevel assignment ${updatedBatteryLevel}`);
      return;
    }
    this.#batteryLevel = updatedBatteryLevel;
    _console$a.log({ updatedBatteryLevel: this.#batteryLevel });
    this.#dispatchEvent({ type: "batteryLevel", message: { batteryLevel: this.#batteryLevel } });
  }

  // INFORMATION
  #informationManager = new InformationManager();

  get id() {
    return this.#informationManager.id;
  }

  get isCharging() {
    return this.#informationManager.isCharging;
  }
  get batteryCurrent() {
    return this.#informationManager.batteryCurrent;
  }
  async getBatteryCurrent() {
    await this.#informationManager.getBatteryCurrent();
  }

  static get MinNameLength() {
    return InformationManager.MinNameLength;
  }
  static get MaxNameLength() {
    return InformationManager.MaxNameLength;
  }
  get name() {
    return this.#informationManager.name;
  }
  /** @param {string} newName */
  async setName(newName) {
    await this.#informationManager.setName(newName);
  }

  static get Types() {
    return InformationManager.Types;
  }
  get type() {
    return this.#informationManager.type;
  }
  /** @param {DeviceType} newType */
  async setType(newType) {
    await this.#informationManager.setType(newType);
  }

  static get InsoleSides() {
    return InformationManager.InsoleSides;
  }
  get isInsole() {
    return this.#informationManager.isInsole;
  }
  get insoleSide() {
    return this.#informationManager.insoleSide;
  }

  get mtu() {
    return this.#informationManager.mtu;
  }

  // SENSOR TYPES
  static get SensorTypes() {
    return SensorDataManager.Types;
  }
  static get ContinuousSensorTypes() {
    return SensorDataManager.ContinuousTypes;
  }
  /** @type {SensorType[]} */
  get sensorTypes() {
    return Object.keys(this.sensorConfiguration);
  }
  get continuousSensorTypes() {
    return this.sensorTypes.filter((sensorType) => Device.ContinuousSensorTypes.includes(sensorType));
  }

  // SENSOR CONFIGURATION

  #sensorConfigurationManager = new SensorConfigurationManager();

  get sensorConfiguration() {
    return this.#sensorConfigurationManager.configuration;
  }

  static get MaxSensorRate() {
    return SensorConfigurationManager.MaxSensorRate;
  }
  static get SensorRateStep() {
    return SensorConfigurationManager.SensorRateStep;
  }

  /**
   * @param {SensorConfiguration} newSensorConfiguration
   * @param {boolean} [clearRest]
   */
  async setSensorConfiguration(newSensorConfiguration, clearRest) {
    await this.#sensorConfigurationManager.setConfiguration(newSensorConfiguration, clearRest);
  }

  async clearSensorConfiguration() {
    return this.#sensorConfigurationManager.clearSensorConfiguration();
  }

  static #ClearSensorConfigurationOnLeave = true;
  static get ClearSensorConfigurationOnLeave() {
    return this.#ClearSensorConfigurationOnLeave;
  }
  static set ClearSensorConfigurationOnLeave(newClearSensorConfigurationOnLeave) {
    _console$a.assertTypeWithError(newClearSensorConfigurationOnLeave, "boolean");
    this.#ClearSensorConfigurationOnLeave = newClearSensorConfigurationOnLeave;
  }

  #clearSensorConfigurationOnLeave = Device.ClearSensorConfigurationOnLeave;
  get clearSensorConfigurationOnLeave() {
    return this.#clearSensorConfigurationOnLeave;
  }
  set clearSensorConfigurationOnLeave(newClearSensorConfigurationOnLeave) {
    _console$a.assertTypeWithError(newClearSensorConfigurationOnLeave, "boolean");
    this.#clearSensorConfigurationOnLeave = newClearSensorConfigurationOnLeave;
  }

  // PRESSURE

  static #DefaultNumberOfPressureSensors = 8;
  static get DefaultNumberOfPressureSensors() {
    return this.#DefaultNumberOfPressureSensors;
  }
  get numberOfPressureSensors() {
    return this.#sensorDataManager.pressureSensorDataManager.numberOfSensors;
  }

  // SENSOR DATA

  /** @type {SensorDataManager} */
  #sensorDataManager = new SensorDataManager();

  resetPressureRange() {
    this.#sensorDataManager.pressureSensorDataManager.resetRange();
  }

  // VIBRATION

  #vibrationManager = new VibrationManager();
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

  
  /**
   * @param  {VibrationConfiguration[]} vibrationConfigurations
   * @param  {boolean} [sendImmediately]
   */
  async triggerVibration(vibrationConfigurations, sendImmediately) {
    this.#vibrationManager.triggerVibration(vibrationConfigurations, sendImmediately);
  }

  // FILE TRANSFER

  #fileTransferManager = new FileTransferManager();
  static get FileTypes() {
    return FileTransferManager.Types;
  }

  get maxFileLength() {
    return this.#fileTransferManager.maxLength;
  }

  

  /**
   * @param {FileType} fileType
   * @param {FileLike} file
   */
  async sendFile(fileType, file) {
    const promise = this.waitForEvent("fileTransferComplete");
    this.#fileTransferManager.send(fileType, file);
    await promise;
  }

  /** @param {FileType} fileType */
  async receiveFile(fileType) {
    const promise = this.waitForEvent("fileTransferComplete");
    this.#fileTransferManager.receive(fileType);
    await promise;
  }

  get fileTransferStatus() {
    return this.#fileTransferManager.status;
  }

  cancelFileTransfer() {
    this.#fileTransferManager.cancel();
  }

  // TFLITE

  static get TfliteSensorTypes() {
    return TfliteManager$1.SensorTypes;
  }

  #tfliteManager = new TfliteManager$1();

  get tfliteName() {
    return this.#tfliteManager.name;
  }
  /** @param {string} newName */
  setTfliteName(newName) {
    return this.#tfliteManager.setName(newName);
  }

  // TFLITE MODEL CONFIG

  static get TfliteTasks() {
    return TfliteManager$1.Tasks;
  }

  get tfliteTask() {
    return this.#tfliteManager.task;
  }
  /** @param {import("./TfliteManager.js").TfliteTask} newTask */
  setTfliteTask(newTask) {
    return this.#tfliteManager.setTask(newTask);
  }

  get tfliteSampleRate() {
    return this.#tfliteManager.sampleRate;
  }
  /** @param {number} newSampleRate */
  setTfliteSampleRate(newSampleRate) {
    return this.#tfliteManager.setSampleRate(newSampleRate);
  }

  get tfliteSensorTypes() {
    return this.#tfliteManager.sensorTypes;
  }
  get allowedTfliteSensorTypes() {
    return this.sensorTypes.filter((sensorType) => TfliteManager$1.SensorTypes.includes(sensorType));
  }
  /** @param {SensorType[]} newSensorTypes */
  setTfliteSensorTypes(newSensorTypes) {
    return this.#tfliteManager.setSensorTypes(newSensorTypes);
  }

  get tfliteIsReady() {
    return this.#tfliteManager.isReady;
  }

  // TFLITE INFERENCING

  get tfliteInferencingEnabled() {
    return this.#tfliteManager.inferencingEnabled;
  }
  /** @param {boolean} inferencingEnabled */
  async setTfliteInferencingEnabled(inferencingEnabled) {
    return this.#tfliteManager.setInferencingEnabled(inferencingEnabled);
  }
  async enableTfliteInferencing() {
    return this.setTfliteInferencingEnabled(true);
  }
  async disableTfliteInferencing() {
    return this.setTfliteInferencingEnabled(false);
  }
  async toggleTfliteInferencing() {
    return this.#tfliteManager.toggleInferencingEnabled();
  }

  // TFLITE INFERENCE CONFIG

  get tfliteCaptureDelay() {
    return this.#tfliteManager.captureDelay;
  }
  /** @param {number} newCaptureDelay */
  async setTfliteCaptureDelay(newCaptureDelay) {
    return this.#tfliteManager.setCaptureDelay(newCaptureDelay);
  }
  get tfliteThreshold() {
    return this.#tfliteManager.threshold;
  }
  /** @param {number} newThreshold */
  async setTfliteThreshold(newThreshold) {
    return this.#tfliteManager.setThreshold(newThreshold);
  }

  // FIRMWARE MANAGER

  #firmwareManager = new FirmwareManager();

  /** @param {ArrayBuffer} data */
  #sendSmpMessage(data) {
    this.#connectionManager.sendSmpMessage(data);
  }

  /** @param {FileLike} file */
  async uploadFirmware(file) {
    return this.#firmwareManager.uploadFirmware(file);
  }

  async reset() {
    await this.#firmwareManager.reset();
    return this.#connectionManager.disconnect();
  }

  get firmwareStatus() {
    return this.#firmwareManager.status;
  }

  async getFirmwareImages() {
    return this.#firmwareManager.getImages();
  }
  get firmwareImages() {
    return this.#firmwareManager.images;
  }

  async eraseFirmwareImage() {
    return this.#firmwareManager.eraseImage();
  }
  /** @param {number} imageIndex */
  async confirmFirmwareImage(imageIndex) {
    return this.#firmwareManager.confirmImage(imageIndex);
  }
  /** @param {number} imageIndex */
  async testFirmwareImage(imageIndex) {
    return this.#firmwareManager.testImage(imageIndex);
  }

  // CONNECTED DEVICES

  /** @type {Device[]} */
  static #ConnectedDevices = [];
  static get ConnectedDevices() {
    return this.#ConnectedDevices;
  }

  static #UseLocalStorage = false;
  static get UseLocalStorage() {
    return this.#UseLocalStorage;
  }
  static set UseLocalStorage(newUseLocalStorage) {
    this.#AssertLocalStorage();
    _console$a.assertTypeWithError(newUseLocalStorage, "boolean");
    this.#UseLocalStorage = newUseLocalStorage;
    if (this.#UseLocalStorage && !this.#LocalStorageConfiguration) {
      this.#LoadFromLocalStorage();
    }
  }

  /**
   * @typedef {Object} LocalStorageDeviceInformation
   * @property {string} bluetoothId
   * @property {DeviceType} type
   */

  /**
   * @typedef {Object} LocalStorageConfiguration
   * @property {LocalStorageDeviceInformation[]} devices
   */

  /** @type {LocalStorageConfiguration} */
  static #DefaultLocalStorageConfiguration = {
    devices: [],
  };
  /** @type {LocalStorageConfiguration?} */
  static #LocalStorageConfiguration;

  static get CanUseLocalStorage() {
    return isInBrowser && window.localStorage;
  }

  static #AssertLocalStorage() {
    _console$a.assertWithError(isInBrowser, "localStorage is only available in the browser");
    _console$a.assertWithError(window.localStorage, "localStorage not found");
  }
  static #LocalStorageKey = "BS.Device";
  static #SaveToLocalStorage() {
    this.#AssertLocalStorage();
    localStorage.setItem(this.#LocalStorageKey, JSON.stringify(this.#LocalStorageConfiguration));
  }
  static async #LoadFromLocalStorage() {
    this.#AssertLocalStorage();
    let localStorageString = localStorage.getItem(this.#LocalStorageKey);
    if (typeof localStorageString != "string") {
      _console$a.log("no info found in localStorage");
      this.#LocalStorageConfiguration = Object.assign({}, this.#DefaultLocalStorageConfiguration);
      this.#SaveToLocalStorage();
      return;
    }
    try {
      const configuration = JSON.parse(localStorageString);
      _console$a.log({ configuration });
      this.#LocalStorageConfiguration = configuration;
      if (this.CanGetDevices) {
        await this.GetDevices(); // redundant?
      }
    } catch (error) {
      _console$a.error(error);
    }
  }

  /** @param {Device} device */
  static #UpdateLocalStorageConfigurationForDevice(device) {
    if (device.connectionType != "webBluetooth") {
      _console$a.log("localStorage is only for webBluetooth devices");
      return;
    }
    this.#AssertLocalStorage();
    const deviceInformationIndex = this.#LocalStorageConfiguration.devices.findIndex((deviceInformation) => {
      return deviceInformation.bluetoothId == device.bluetoothId;
    });
    if (deviceInformationIndex == -1) {
      return;
    }
    this.#LocalStorageConfiguration.devices[deviceInformationIndex].type = device.type;
    this.#SaveToLocalStorage();
  }

  // AVAILABLE DEVICES
  /** @type {Device[]} */
  static #AvailableDevices = [];
  static get AvailableDevices() {
    return this.#AvailableDevices;
  }

  static get CanGetDevices() {
    return isInBrowser && navigator.bluetooth?.getDevices && !isInBluefy;
  }
  /**
   * retrieves devices already connected via web bluetooth in other tabs/windows
   *
   * _only available on web-bluetooth enabled browsers_
   *
   * @returns {Promise<Device[]?>}
   */
  static async GetDevices() {
    if (!isInBrowser) {
      _console$a.warn("GetDevices is only available in the browser");
      return;
    }

    if (!navigator.bluetooth) {
      _console$a.warn("bluetooth is not available in this browser");
      return;
    }

    if (isInBluefy) {
      _console$a.warn("bluefy lists too many devices...");
      return;
    }

    if (!navigator.bluetooth.getDevices) {
      _console$a.warn("bluetooth.getDevices() is not available in this browser");
      return;
    }

    if (!this.#LocalStorageConfiguration) {
      this.#LoadFromLocalStorage();
    }

    const configuration = this.#LocalStorageConfiguration;
    if (!configuration.devices || configuration.devices.length == 0) {
      _console$a.log("no devices found in configuration");
      return;
    }

    const bluetoothDevices = await navigator.bluetooth.getDevices();

    _console$a.log({ bluetoothDevices });

    bluetoothDevices.forEach((bluetoothDevice) => {
      if (!bluetoothDevice.gatt) {
        return;
      }
      let deviceInformation = configuration.devices.find(
        (deviceInformation) => bluetoothDevice.id == deviceInformation.bluetoothId
      );
      if (!deviceInformation) {
        return;
      }

      let existingConnectedDevice = this.ConnectedDevices.filter(
        (device) => device.connectionType == "webBluetooth"
      ).find((device) => device.bluetoothId == bluetoothDevice.id);

      const existingAvailableDevice = this.AvailableDevices.filter(
        (device) => device.connectionType == "webBluetooth"
      ).find((device) => device.bluetoothId == bluetoothDevice.id);
      if (existingAvailableDevice) {
        if (
          existingConnectedDevice?.bluetoothId == existingAvailableDevice.bluetoothId &&
          existingConnectedDevice != existingAvailableDevice
        ) {
          this.AvailableDevices[this.#AvailableDevices.indexOf(existingAvailableDevice)] = existingConnectedDevice;
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
        device.#informationManager.updateName(bluetoothDevice.name);
      }
      device.#informationManager.updateType(deviceInformation.type);
      device.connectionManager = connectionManager;
      this.AvailableDevices.push(device);
    });
    this.#DispatchAvailableDevices();
    return this.AvailableDevices;
  }

  // STATIC EVENTLISTENERS

  /** @type {StaticDeviceEventType[]} */
  static #StaticEventTypes = [
    "deviceConnected",
    "deviceDisconnected",
    "deviceIsConnected",
    "availableDevices",
    "connectedDevices",
  ];
  static get StaticEventTypes() {
    return this.#StaticEventTypes;
  }
  static #EventDispatcher = new EventDispatcher(this, this.#StaticEventTypes);

  /**
   * @param {StaticDeviceEventType} type
   * @param {StaticDeviceEventListener} listener
   * @param {EventDispatcherOptions} [options]
   * @throws {Error}
   */
  static AddEventListener(type, listener, options) {
    this.#EventDispatcher.addEventListener(type, listener, options);
  }

  /**
   * @param {StaticDeviceEvent} event
   */
  static #DispatchEvent(event) {
    this.#EventDispatcher.dispatchEvent(event);
  }

  /**
   * @param {StaticDeviceEventType} type
   * @param {StaticDeviceEventListener} listener
   */
  static RemoveEventListener(type, listener) {
    return this.#EventDispatcher.removeEventListener(type, listener);
  }

  /** @param {Device} device */
  static #OnDeviceIsConnected(device) {
    if (device.isConnected) {
      if (!this.#ConnectedDevices.includes(device)) {
        _console$a.log("adding device", device);
        this.#ConnectedDevices.push(device);
        if (this.UseLocalStorage && device.connectionType == "webBluetooth") {
          const deviceInformation = {
            type: device.type,
            bluetoothId: device.bluetoothId,
          };
          const deviceInformationIndex = this.#LocalStorageConfiguration.devices.findIndex(
            (_deviceInformation) => _deviceInformation.bluetoothId == deviceInformation.bluetoothId
          );
          if (deviceInformationIndex == -1) {
            this.#LocalStorageConfiguration.devices.push(deviceInformation);
          } else {
            this.#LocalStorageConfiguration.devices[deviceInformationIndex] = deviceInformation;
          }
          this.#SaveToLocalStorage();
        }
        this.#DispatchEvent({ type: "deviceConnected", message: { device } });
        this.#DispatchEvent({ type: "deviceIsConnected", message: { device } });
        this.#DispatchConnectedDevices();
      } else {
        _console$a.log("device already included");
      }
    } else {
      if (this.#ConnectedDevices.includes(device)) {
        _console$a.log("removing device", device);
        this.#ConnectedDevices.splice(this.#ConnectedDevices.indexOf(device), 1);
        this.#DispatchEvent({ type: "deviceDisconnected", message: { device } });
        this.#DispatchEvent({ type: "deviceIsConnected", message: { device } });
        this.#DispatchConnectedDevices();
      } else {
        _console$a.log("device already not included");
      }
    }
    if (this.CanGetDevices) {
      this.GetDevices();
    }
    if (device.isConnected && !this.AvailableDevices.includes(device)) {
      const existingAvailableDevice = this.AvailableDevices.find(
        (_device) => _device.bluetoothId == device.bluetoothId
      );
      _console$a.log({ existingAvailableDevice });
      if (existingAvailableDevice) {
        this.AvailableDevices[this.AvailableDevices.indexOf(existingAvailableDevice)] = device;
      } else {
        this.AvailableDevices.push(device);
      }
      this.#DispatchAvailableDevices();
    }
  }

  static #DispatchAvailableDevices() {
    _console$a.log({ AvailableDevices: this.AvailableDevices });
    this.#DispatchEvent({ type: "availableDevices", message: { availableDevices: this.AvailableDevices } });
  }
  static #DispatchConnectedDevices() {
    _console$a.log({ ConnectedDevices: this.ConnectedDevices });
    this.#DispatchEvent({ type: "connectedDevices", message: { connectedDevices: this.ConnectedDevices } });
  }

  static async Connect() {
    const device = new Device();
    await device.connect();
    return device;
  }

  static {
    if (this.CanUseLocalStorage) {
      this.UseLocalStorage = true;
    }
  }
}

const _console$9 = createConsole("BaseScanner");



/** @typedef {"isAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice"} ScannerEventType */




/**
 * @typedef {Object} ScannerEvent
 * @property {BaseScanner} target
 * @property {ScannerEventType} type
 * @property {Object} message
 */

/**
 * @typedef {Object} DiscoveredDevice
 * @property {string} bluetoothId
 * @property {string} name
 * @property {DeviceType} deviceType
 * @property {number} rssi
 */

class BaseScanner {
  // IS SUPPORTED

  static get isSupported() {
    return false;
  }
  /** @type {boolean} */
  get isSupported() {
    return this.constructor.isSupported;
  }

  #assertIsSupported() {
    _console$9.assertWithError(this.isSupported, `${this.constructor.name} is not supported`);
  }

  // CONSTRUCTOR

  #assertIsSubclass() {
    _console$9.assertWithError(this.constructor != BaseScanner, `${this.constructor.name} must be subclassed`);
  }

  constructor() {
    this.#assertIsSubclass();
    this.#assertIsSupported();
    addEventListeners(this, this.#boundEventListeners);
  }

  #boundEventListeners = {
    discoveredDevice: this.#onDiscoveredDevice.bind(this),
    isScanning: this.#onIsScanning.bind(this),
  };

  // EVENT DISPATCHER

  /** @type {ScannerEventType[]} */
  static #EventTypes = ["isAvailable", "isScanning", "discoveredDevice", "expiredDiscoveredDevice"];
  static get EventTypes() {
    return this.#EventTypes;
  }
  get eventTypes() {
    return BaseScanner.#EventTypes;
  }
  #eventDispatcher = new EventDispatcher(this, this.eventTypes);

  /**
   * @param {ScannerEventType} type
   * @param {EventDispatcherListener} listener
   * @param {EventDispatcherOptions} [options]
   */
  addEventListener(type, listener, options) {
    this.#eventDispatcher.addEventListener(type, listener, options);
  }

  /**
   * @protected
   * @param {ScannerEvent} event
   */
  dispatchEvent(event) {
    this.#eventDispatcher.dispatchEvent(event);
  }

  /**
   * @param {ScannerEventType} type
   * @param {EventDispatcherListener} listener
   */
  removeEventListener(type, listener) {
    return this.#eventDispatcher.removeEventListener(type, listener);
  }

  // AVAILABILITY
  get isAvailable() {
    return false;
  }
  #assertIsAvailable() {
    _console$9.assertWithError(this.isAvailable, "not available");
  }

  // SCANNING
  get isScanning() {
    return false;
  }
  #assertIsScanning() {
    _console$9.assertWithError(this.isScanning, "not scanning");
  }
  #assertIsNotScanning() {
    _console$9.assertWithError(!this.isScanning, "already scanning");
  }

  startScan() {
    this.#assertIsAvailable();
    this.#assertIsNotScanning();
  }
  stopScan() {
    this.#assertIsScanning();
  }
  #onIsScanning() {
    if (this.isScanning) {
      this.#discoveredDevices = {};
      this.#discoveredDeviceTimestamps = {};
    } else {
      this.#checkDiscoveredDevicesExpirationTimer.stop();
    }
  }

  // DISCOVERED DEVICES
  /** @type {Object.<string, DiscoveredDevice>} */
  #discoveredDevices = {};
  get discoveredDevices() {
    return this.#discoveredDevices;
  }
  get discoveredDevicesArray() {
    return Object.values(this.#discoveredDevices).sort((a, b) => {
      return this.#discoveredDeviceTimestamps[a.bluetoothId] - this.#discoveredDeviceTimestamps[b.bluetoothId];
    });
  }
  /** @param {string} discoveredDeviceId */
  #assertValidDiscoveredDeviceId(discoveredDeviceId) {
    _console$9.assertWithError(
      this.#discoveredDevices[discoveredDeviceId],
      `no discovered device with id "${discoveredDeviceId}"`
    );
  }

  /** @param {ScannerEvent} event */
  #onDiscoveredDevice(event) {
    /** @type {DiscoveredDevice} */
    const discoveredDevice = event.message.discoveredDevice;
    this.#discoveredDevices[discoveredDevice.bluetoothId] = discoveredDevice;
    this.#discoveredDeviceTimestamps[discoveredDevice.bluetoothId] = Date.now();
    this.#checkDiscoveredDevicesExpirationTimer.start();
  }

  /** @type {Object.<string, number>} */
  #discoveredDeviceTimestamps = {};

  static #DiscoveredDeviceExpirationTimeout = 5000;
  static get DiscoveredDeviceExpirationTimeout() {
    return this.#DiscoveredDeviceExpirationTimeout;
  }
  get #discoveredDeviceExpirationTimeout() {
    return BaseScanner.DiscoveredDeviceExpirationTimeout;
  }
  #checkDiscoveredDevicesExpirationTimer = new Timer(this.#checkDiscoveredDevicesExpiration.bind(this), 1000);
  #checkDiscoveredDevicesExpiration() {
    const entries = Object.entries(this.#discoveredDevices);
    if (entries.length == 0) {
      this.#checkDiscoveredDevicesExpirationTimer.stop();
      return;
    }
    const now = Date.now();
    entries.forEach(([id, discoveredDevice]) => {
      const timestamp = this.#discoveredDeviceTimestamps[id];
      if (now - timestamp > this.#discoveredDeviceExpirationTimeout) {
        _console$9.log("discovered device timeout");
        delete this.#discoveredDevices[id];
        delete this.#discoveredDeviceTimestamps[id];
        this.dispatchEvent({ type: "expiredDiscoveredDevice", message: { discoveredDevice } });
      }
    });
  }

  // DEVICE CONNECTION
  /** @param {string} deviceId */
  async connectToDevice(deviceId) {
    this.#assertIsAvailable();
  }

  // RESET

  get canReset() {
    return false;
  }
  reset() {
    _console$9.log("resetting...");
  }
}

const _console$8 = createConsole("NobleConnectionManager", { log: true });








class NobleConnectionManager extends BluetoothConnectionManager {
  get bluetoothId() {
    return this.#noblePeripheral?.id;
  }

  static get isSupported() {
    return isInNode;
  }
  /** @type {ConnectionType} */
  static get type() {
    return "noble";
  }

  get isConnected() {
    return this.#noblePeripheral?.state == "connected";
  }

  async connect() {
    await super.connect();
    await this.#noblePeripheral.connectAsync();
  }
  async disconnect() {
    await super.disconnect();
    await this.#noblePeripheral.disconnectAsync();
  }

  /**
   * @param {ConnectionMessageType} messageType
   * @param {DataView|ArrayBuffer} data
   */
  async sendMessage(messageType, data) {
    await super.sendMessage(...arguments);

    const characteristicName = this.characteristicNameForMessageType(messageType);
    _console$8.log({ characteristicName });

    const characteristic = this.#characteristics.get(characteristicName);
    _console$8.assertWithError(characteristic, `no characteristic found with name "${characteristicName}"`);
    if (data instanceof DataView) {
      data = data.buffer;
    }
    const buffer = Buffer.from(data);
    _console$8.log("writing data", buffer);
    const withoutResponse = true;
    await characteristic.writeAsync(buffer, withoutResponse);
    if (characteristic.properties.includes("read")) {
      await characteristic.readAsync();
    }
  }

  /**
   * @param {BluetoothCharacteristicName} characteristicName
   * @param {ArrayBuffer} data
   */
  async writeCharacteristic(characteristicName, data) {
    const characteristic = this.#characteristics.get(characteristicName);
    _console$8.assertWithError(characteristic, `no characteristic found with name "${characteristicName}"`);
    // if (data instanceof DataView) {
    //     data = data.buffer;
    // }
    const buffer = Buffer.from(data);
    _console$8.log("writing data", buffer);
    const withoutResponse = true;
    await characteristic.writeAsync(buffer, withoutResponse);
    if (characteristic.properties.includes("read")) {
      await characteristic.readAsync();
    }
  }

  /** @type {boolean} */
  get canReconnect() {
    return this.#noblePeripheral.connectable;
  }
  async reconnect() {
    await super.reconnect();
    _console$8.log("attempting to reconnect...");
    this.connect();
  }

  // NOBLE
  /** @type {noble.Peripheral?} */
  #noblePeripheral;
  get noblePeripheral() {
    return this.#noblePeripheral;
  }
  set noblePeripheral(newNoblePeripheral) {
    _console$8.assertTypeWithError(newNoblePeripheral, "object");
    if (this.noblePeripheral == newNoblePeripheral) {
      _console$8.log("attempted to assign duplicate noblePeripheral");
      return;
    }

    _console$8.log("newNoblePeripheral", newNoblePeripheral.id);

    if (this.#noblePeripheral) {
      removeEventListeners(this.#noblePeripheral, this.#unboundNoblePeripheralListeners);
      delete this.#noblePeripheral._connectionManager;
    }

    if (newNoblePeripheral) {
      newNoblePeripheral._connectionManager = this;
      addEventListeners(newNoblePeripheral, this.#unboundNoblePeripheralListeners);
    }

    this.#noblePeripheral = newNoblePeripheral;
  }

  // NOBLE EVENTLISTENERS
  #unboundNoblePeripheralListeners = {
    connect: this.#onNoblePeripheralConnect,
    disconnect: this.#onNoblePeripheralDisconnect,
    rssiUpdate: this.#onNoblePeripheralRssiUpdate,
    servicesDiscover: this.#onNoblePeripheralServicesDiscover,
  };

  async #onNoblePeripheralConnect() {
    await this._connectionManager.onNoblePeripheralConnect(this);
  }
  /** @param {noble.Peripheral} noblePeripheral */
  async onNoblePeripheralConnect(noblePeripheral) {
    _console$8.log("onNoblePeripheralConnect", noblePeripheral.id, noblePeripheral.state);
    if (noblePeripheral.state == "connected") {
      await this.#noblePeripheral.discoverServicesAsync(allServiceUUIDs);
    }
    // this gets called when it connects and disconnects, so we use the noblePeripheral's "state" property instead
    await this.#onNoblePeripheralState();
  }

  async #onNoblePeripheralDisconnect() {
    await this._connectionManager.onNoblePeripheralConnect(this);
  }
  /** @param {noble.Peripheral} noblePeripheral */
  async onNoblePeripheralDisconnect(noblePeripheral) {
    _console$8.log("onNoblePeripheralDisconnect", noblePeripheral.id);
    await this.#onNoblePeripheralState();
  }

  async #onNoblePeripheralState() {
    _console$8.log(`noblePeripheral ${this.bluetoothId} state ${this.#noblePeripheral.state}`);

    switch (this.#noblePeripheral.state) {
      case "connected":
        //this.status = "connected";
        break;
      case "connecting":
        //this.status = "connecting";
        break;
      case "disconnected":
        this.#removeEventListeners();
        this.status = "not connected";
        break;
      case "disconnecting":
        this.status = "disconnecting";
        break;
      case "error":
        _console$8.error("noblePeripheral error");
        break;
      default:
        _console$8.log(`uncaught noblePeripheral state ${this.#noblePeripheral.state}`);
        break;
    }
  }

  #removeEventListeners() {
    _console$8.log("removing noblePeripheral eventListeners");
    this.#services.forEach((service) => {
      removeEventListeners(service, this.#unboundNobleServiceListeners);
    });
    this.#services.clear();

    this.#characteristics.forEach((characteristic) => {
      removeEventListeners(characteristic, this.#unboundNobleCharacteristicListeners);
    });
    this.#characteristics.clear();
  }

  /** @param {number} rssi */
  async #onNoblePeripheralRssiUpdate(rssi) {
    await this._connectionManager.onNoblePeripheralRssiUpdate(this, rssi);
  }
  /**
   * @param {noble.Peripheral} noblePeripheral
   * @param {number} rssi
   */
  async onNoblePeripheralRssiUpdate(noblePeripheral, rssi) {
    _console$8.log("onNoblePeripheralRssiUpdate", noblePeripheral.id, rssi);
    // FILL
  }

  /** @param {noble.Service[]} services */
  async #onNoblePeripheralServicesDiscover(services) {
    await this._connectionManager.onNoblePeripheralServicesDiscover(this, services);
  }
  /**
   * @param {noble.Peripheral} noblePeripheral
   * @param {noble.Service[]} services
   */
  async onNoblePeripheralServicesDiscover(noblePeripheral, services) {
    _console$8.log(
      "onNoblePeripheralServicesDiscover",
      noblePeripheral.id,
      services.map((service) => service.uuid)
    );
    for (const index in services) {
      const service = services[index];
      _console$8.log("service", service.uuid);
      const serviceName = getServiceNameFromUUID(service.uuid);
      _console$8.assertWithError(serviceName, `no name found for service uuid "${service.uuid}"`);
      _console$8.log({ serviceName });
      this.#services.set(serviceName, service);
      service._name = serviceName;
      service._connectionManager = this;
      addEventListeners(service, this.#unboundNobleServiceListeners);
      await service.discoverCharacteristicsAsync();
    }
  }

  // NOBLE SERVICE
  /** @type {Map.<BluetoothServiceName, BluetoothRemoteGATTService} */
  #services = new Map();

  #unboundNobleServiceListeners = {
    characteristicsDiscover: this.#onNobleServiceCharacteristicsDiscover,
  };

  /** @param {noble.Characteristic[]} characteristics */
  async #onNobleServiceCharacteristicsDiscover(characteristics) {
    await this._connectionManager.onNobleServiceCharacteristicsDiscover(this, characteristics);
  }
  /**
   * @param {noble.Service} service
   * @param {noble.Characteristic[]} characteristics
   */
  async onNobleServiceCharacteristicsDiscover(service, characteristics) {
    _console$8.log(
      "onNobleServiceCharacteristicsDiscover",
      service.uuid,
      characteristics.map((characteristic) => characteristic.uuid)
    );

    for (const index in characteristics) {
      const characteristic = characteristics[index];
      _console$8.log("characteristic", characteristic.uuid);
      const characteristicName = getCharacteristicNameFromUUID(characteristic.uuid);
      _console$8.assertWithError(characteristicName, `no name found for characteristic uuid "${characteristic.uuid}"`);
      _console$8.log({ characteristicName });
      this.#characteristics.set(characteristicName, characteristic);
      characteristic._name = characteristicName;
      characteristic._connectionManager = this;
      addEventListeners(characteristic, this.#unboundNobleCharacteristicListeners);
      if (characteristic.properties.includes("read")) {
        await characteristic.readAsync();
      }
      if (characteristic.properties.includes("notify")) {
        await characteristic.subscribeAsync();
      }
    }

    if (this.#hasAllCharacteristics) {
      this.status = "connected";
    }
  }

  // NOBLE CHARACTERISRTIC
  #unboundNobleCharacteristicListeners = {
    data: this.#onNobleCharacteristicData,
    write: this.#onNobleCharacteristicWrite,
    notify: this.#onNobleCharacteristicNotify,
  };

  /** @type {Map.<BluetoothCharacteristicName, noble.Characteristic} */
  #characteristics = new Map();

  get #hasAllCharacteristics() {
    return allCharacteristicNames.every((characteristicName) => {
      return this.#characteristics.has(characteristicName);
    });
  }

  /**
   * @param {Buffer} data
   * @param {boolean} isNotification
   */
  #onNobleCharacteristicData(data, isNotification) {
    this._connectionManager.onNobleCharacteristicData(this, data, isNotification);
  }
  /**
   * @param {noble.Characteristic} characteristic
   * @param {Buffer} data
   * @param {boolean} isNotification
   */
  onNobleCharacteristicData(characteristic, data, isNotification) {
    _console$8.log("onNobleCharacteristicData", characteristic.uuid, data, isNotification);
    const dataView = new DataView(dataToArrayBuffer(data));

    /** @type {BluetoothCharacteristicName} */
    const characteristicName = characteristic._name;
    _console$8.assertWithError(characteristicName, `no name found for characteristic with uuid "${characteristic.uuid}"`);

    this.onCharacteristicValueChanged(characteristicName, dataView);
  }

  #onNobleCharacteristicWrite() {
    this._connectionManager.onNobleCharacteristicWrite(this);
  }
  /**
   * @param {noble.Characteristic} characteristic
   */
  onNobleCharacteristicWrite(characteristic) {
    _console$8.log("onNobleCharacteristicWrite", characteristic.uuid);
    // FILL
  }

  /** @param {boolean} isSubscribed */
  #onNobleCharacteristicNotify(isSubscribed) {
    this._connectionManager.onNobleCharacteristicNotify(this, isSubscribed);
  }
  /**
   * @param {noble.Characteristic} characteristic
   * @param {boolean} isSubscribed
   */
  onNobleCharacteristicNotify(characteristic, isSubscribed) {
    _console$8.log("onNobleCharacteristicNotify", characteristic.uuid, isSubscribed);
  }
}

const _console$7 = createConsole("NobleScanner", { log: true });

let isSupported = false;
isSupported = true;


/** @typedef {"unknown" | "resetting" | "unsupported" | "unauthorized" | "poweredOff" | "poweredOn"} NobleState */




class NobleScanner extends BaseScanner {
  // IS SUPPORTED
  static get isSupported() {
    return isSupported;
  }

  // SCANNING
  #_isScanning = false;
  get #isScanning() {
    return this.#_isScanning;
  }
  set #isScanning(newIsScanning) {
    _console$7.assertTypeWithError(newIsScanning, "boolean");
    if (this.isScanning == newIsScanning) {
      _console$7.log("duplicate isScanning assignment");
      return;
    }
    this.#_isScanning = newIsScanning;
    this.dispatchEvent({ type: "isScanning", message: { isScanning: this.isScanning } });
  }
  get isScanning() {
    return this.#isScanning;
  }

  // NOBLE STATE
  /** @type {NobleState} */
  #_nobleState = "unknown";
  get #nobleState() {
    return this.#_nobleState;
  }
  set #nobleState(newNobleState) {
    _console$7.assertTypeWithError(newNobleState, "string");
    if (this.#nobleState == newNobleState) {
      _console$7.log("duplicate nobleState assignment");
      return;
    }
    this.#_nobleState = newNobleState;
    _console$7.log({ newNobleState });
    this.dispatchEvent({ type: "isAvailable", message: { isAvailable: this.isAvailable } });
  }

  // NOBLE LISTENERS
  #boundNobleListeners = {
    scanStart: this.#onNobleScanStart.bind(this),
    scanStop: this.#onNobleScanStop.bind(this),
    stateChange: this.#onNobleStateChange.bind(this),
    discover: this.#onNobleDiscover.bind(this),
  };
  #onNobleScanStart() {
    _console$7.log("OnNobleScanStart");
    this.#isScanning = true;
  }
  #onNobleScanStop() {
    _console$7.log("OnNobleScanStop");
    this.#isScanning = false;
  }
  /** @param {NobleState} state */
  #onNobleStateChange(state) {
    _console$7.log("onNobleStateChange", state);
    this.#nobleState = state;
  }
  /** @param {noble.Peripheral} noblePeripheral */
  #onNobleDiscover(noblePeripheral) {
    _console$7.log("onNobleDiscover", noblePeripheral.id);
    if (!this.#noblePeripherals[noblePeripheral.id]) {
      noblePeripheral._scanner = this;
      this.#noblePeripherals[noblePeripheral.id] = noblePeripheral;
    }

    let deviceType;
    const serviceData = noblePeripheral.advertisement.serviceData;
    if (serviceData) {
      //_console.log("serviceData", serviceData);
      const deviceTypeServiceData = serviceData.find((serviceDatum) => {
        return serviceDatum.uuid == serviceDataUUID;
      });
      //_console.log("deviceTypeServiceData", deviceTypeServiceData);
      if (deviceTypeServiceData) {
        const deviceTypeEnum = deviceTypeServiceData.data.readUint8(0);
        deviceType = Device.Types[deviceTypeEnum];
      }
    }

    /** @type {DiscoveredDevice} */
    const discoveredDevice = {
      name: noblePeripheral.advertisement.localName,
      bluetoothId: noblePeripheral.id,
      deviceType,
      rssi: noblePeripheral.rssi,
    };
    this.dispatchEvent({ type: "discoveredDevice", message: { discoveredDevice } });
  }

  // CONSTRUCTOR
  constructor() {
    super();
    addEventListeners(noble, this.#boundNobleListeners);
    addEventListeners(this, this.#boundBaseScannerListeners);
  }

  // AVAILABILITY
  get isAvailable() {
    return this.#nobleState == "poweredOn";
  }

  // SCANNING
  startScan() {
    super.startScan();
    noble.startScanningAsync(serviceUUIDs, true);
  }
  stopScan() {
    super.stopScan();
    noble.stopScanningAsync();
  }

  // RESET
  get canReset() {
    return true;
  }
  reset() {
    super.reset();
    noble.reset();
  }

  // BASESCANNER LISTENERS
  #boundBaseScannerListeners = {
    expiredDiscoveredDevice: this.#onExpiredDiscoveredDevice.bind(this),
  };

  /** @param {ScannerEvent} event */
  #onExpiredDiscoveredDevice(event) {
    /** @type {DiscoveredDevice} */
    const discoveredDevice = event.message.discoveredDevice;
    const noblePeripheral = this.#noblePeripherals[discoveredDevice.bluetoothId];
    if (noblePeripheral) {
      // disconnect?
      delete this.#noblePeripherals[discoveredDevice.bluetoothId];
    }
  }

  // DISCOVERED DEVICES
  /** @type {Object.<string, noble.Peripheral>} */
  #noblePeripherals = {};
  /** @param {string} noblePeripheralId */
  #assertValidNoblePeripheralId(noblePeripheralId) {
    _console$7.assertTypeWithError(noblePeripheralId, "string");
    _console$7.assertWithError(
      this.#noblePeripherals[noblePeripheralId],
      `no noblePeripheral found with id "${noblePeripheralId}"`
    );
  }

  // DEVICES
  /** @param {string} deviceId */
  async connectToDevice(deviceId) {
    super.connectToDevice(deviceId);
    this.#assertValidNoblePeripheralId(deviceId);
    const noblePeripheral = this.#noblePeripherals[deviceId];
    _console$7.log("connecting to discoveredDevice...", deviceId);

    let device = Device.AvailableDevices.filter((device) => device.connectionType == "noble").find(
      (device) => device.bluetoothId == deviceId
    );
    if (!device) {
      device = this.#createDevice(noblePeripheral);
      await device.connect();
    } else {
      await device.reconnect();
    }
  }

  /** @param {noble.Peripheral} noblePeripheral */
  #createDevice(noblePeripheral) {
    const device = new Device();
    const nobleConnectionManager = new NobleConnectionManager();
    nobleConnectionManager.noblePeripheral = noblePeripheral;
    device.connectionManager = nobleConnectionManager;
    return device;
  }
}

const _console$6 = createConsole("Scanner", { log: false });

/** @type {BaseScanner?} */
let scanner;

if (NobleScanner.isSupported) {
    _console$6.log("using NobleScanner");
    scanner = new NobleScanner();
} else {
    _console$6.log("Scanner not available");
}

var scanner$1 = scanner;

const _console$5 = createConsole("ServerUtils", { log: false });

const pingTimeout = 30_000_000;

// MESSAGING

/** @typedef {Number | Number[] | ArrayBufferLike | DataView} MessageLike */

/**
 * @typedef {Object} Message
 * @property {string} type
 * @property {MessageLike|MessageLike[]?} data
 */

/**
 * @param {string[]} enumeration
 * @param  {...(Message|string)} messages
 */
function createMessage(enumeration, ...messages) {
  _console$5.log("createMessage", ...messages);

  const messageBuffers = messages.map((message) => {
    if (typeof message == "string") {
      message = { type: message };
    }

    if ("data" in message) {
      if (!Array.isArray(message.data)) {
        message.data = [message.data];
      }
    } else {
      message.data = [];
    }

    const messageDataArrayBuffer = concatenateArrayBuffers(...message.data);
    const messageDataArrayBufferByteLength = messageDataArrayBuffer.byteLength;

    _console$5.assertEnumWithError(message.type, enumeration);
    const messageTypeEnum = enumeration.indexOf(message.type);

    return concatenateArrayBuffers(
      messageTypeEnum,
      Uint16Array.from([messageDataArrayBufferByteLength]),
      messageDataArrayBuffer
    );
  });
  _console$5.log("messageBuffers", ...messageBuffers);
  return concatenateArrayBuffers(...messageBuffers);
}

/**
 * @typedef { "ping"
 * | "pong"
 * | "isScanningAvailable"
 * | "isScanning"
 * | "startScan"
 * | "stopScan"
 * | "discoveredDevice"
 * | "discoveredDevices"
 * | "expiredDiscoveredDevice"
 * | "connectToDevice"
 * | "disconnectFromDevice"
 * | "connectedDevices"
 * | "deviceMessage"
 * } ServerMessageType
 */

/**
 * @typedef {Object} ServerMessage
 * @property {ServerMessageType} type
 * @property {MessageLike|MessageLike[]?} data
 */

/** @type {ServerMessageType[]} */
const ServerMessageTypes = [
  "ping",
  "pong",
  "isScanningAvailable",
  "isScanning",
  "startScan",
  "stopScan",
  "discoveredDevice",
  "discoveredDevices",
  "expiredDiscoveredDevice",
  "connectToDevice",
  "disconnectFromDevice",
  "connectedDevices",
  "deviceMessage",
];

/** @param {...ServerMessage|ServerMessageType} messages */
function createServerMessage(...messages) {
  return createMessage(ServerMessageTypes, ...messages);
}



/**
 * @typedef {Object} DeviceMessage
 * @property {DeviceEventType} type
 * @property {MessageLike|MessageLike[]?} data
 */

/** @param {...DeviceEventType|DeviceMessage} messages */
function createDeviceMessage(...messages) {
  _console$5.log("createDeviceMessage", ...messages);
  return createMessage(Device.EventTypes, ...messages);
}

// STATIC MESSAGES

const pingMessage = createServerMessage("ping");
const pongMessage = createServerMessage("pong");
createServerMessage("isScanningAvailable");
createServerMessage("isScanning");
createServerMessage("startScan");
createServerMessage("stopScan");
createServerMessage("discoveredDevices");

const _console$4 = createConsole("BaseServer", { log: true });










/** @typedef {"clientConnected" | "clientDisconnected"} ServerEventType */
/**
 * @typedef {Object} BaseServerEvent
 * @property {BaseServer} target
 * @property {ServerEventType} type
 */

/**
 * @typedef {Object} BaseClientConnectedEvent
 * @property {"clientConnected"} type
 */
/** @typedef {BaseServerEvent & BaseClientConnectedEvent} ClientConnectedEvent */

/**
 * @typedef {Object} BaseClientDisconnectedEvent
 * @property {"clientDisconnected"} type
 */
/** @typedef {BaseServerEvent & BaseClientDisconnectedEvent} ClientDisconnectedEvent */

/** @typedef {ClientConnectedEvent | ClientDisconnectedEvent} ServerEvent */
/** @typedef {(event: ServerEvent) => void} ServerEventListener */

class BaseServer {
  /**
   * @abstract
   * @throws {Error} if abstract class
   */
  #assertIsSubclass() {
    _console$4.assertWithError(this.constructor != BaseServer, `${this.constructor.name} must be subclassed`);
  }

  // EVENT DISPATCHER

  /** @type {ServerEventType[]} */
  static #EventTypes = ["clientConnected", "clientDisconnected"];
  static get EventTypes() {
    return this.#EventTypes;
  }
  get eventTypes() {
    return BaseServer.#EventTypes;
  }
  #eventDispatcher = new EventDispatcher(this, this.eventTypes);

  /**
   * @param {ServerEventType} type
   * @param {ServerEventListener} listener
   * @param {EventDispatcherOptions} [options]
   */
  addEventListener(type, listener, options) {
    this.#eventDispatcher.addEventListener(type, listener, options);
  }

  /**
   * @protected
   * @param {ServerEvent} event
   */
  dispatchEvent(event) {
    this.#eventDispatcher.dispatchEvent(event);
  }

  /**
   * @param {ServerEventType} type
   * @param {ServerEventListener} listener
   */
  removeEventListener(type, listener) {
    return this.#eventDispatcher.removeEventListener(type, listener);
  }

  // CONSTRUCTOR

  constructor() {
    this.#assertIsSubclass();

    _console$4.assertWithError(scanner$1, "no scanner defined");

    addEventListeners(scanner$1, this.#boundScannerListeners);
    addEventListeners(Device, this.#boundDeviceClassListeners);
    addEventListeners(this, this.#boundServerListeners);
  }

  get numberOfClients() {
    return 0;
  }

  static #ClearSensorConfigurationsWhenNoClients = true;
  static get ClearSensorConfigurationsWhenNoClients() {
    return this.#ClearSensorConfigurationsWhenNoClients;
  }
  static set ClearSensorConfigurationsWhenNoClients(newValue) {
    _console$4.assertTypeWithError(newValue, "boolean");
    this.#ClearSensorConfigurationsWhenNoClients = newValue;
  }

  #clearSensorConfigurationsWhenNoClients = BaseServer.#ClearSensorConfigurationsWhenNoClients;
  get clearSensorConfigurationsWhenNoClients() {
    return this.#clearSensorConfigurationsWhenNoClients;
  }
  set clearSensorConfigurationsWhenNoClients(newValue) {
    _console$4.assertTypeWithError(newValue, "boolean");
    this.#clearSensorConfigurationsWhenNoClients = newValue;
  }

  // SERVER LISTENERS
  #boundServerListeners = {
    clientConnected: this.#onClientConnected.bind(this),
    clientDisconnected: this.#onClientDisconnected.bind(this),
  };

  /** @param {ServerEvent} event */
  #onClientConnected(event) {
    event.message.client;
    _console$4.log("onClientConnected");
  }
  /** @param {ServerEvent} event */
  #onClientDisconnected(event) {
    event.message.client;
    _console$4.log("onClientDisconnected");
    if (this.numberOfClients == 0 && this.clearSensorConfigurationsWhenNoClients) {
      Device.ConnectedDevices.forEach((device) => {
        device.clearSensorConfiguration();
        device.setTfliteInferencingEnabled(false);
      });
    }
  }

  // CLIENT MESSAGING

  /**
   * @protected
   * @param {ArrayBuffer} message
   */
  broadcastMessage(message) {
    _console$4.log("broadcasting", message);
  }

  // SCANNER

  #boundScannerListeners = {
    isAvailable: this.#onScannerIsAvailable.bind(this),
    isScanning: this.#onScannerIsScanning.bind(this),
    discoveredDevice: this.#onScannerDiscoveredDevice.bind(this),
    expiredDiscoveredDevice: this.#onExpiredDiscoveredDevice.bind(this),
  };

  /** @param {ScannerEvent} event */
  #onScannerIsAvailable(event) {
    this.broadcastMessage(this.#isScanningAvailableMessage);
  }
  get #isScanningAvailableMessage() {
    return createServerMessage({ type: "isScanningAvailable", data: scanner$1.isAvailable });
  }

  /** @param {ScannerEvent} event */
  #onScannerIsScanning(event) {
    this.broadcastMessage(this.#isScanningMessage);
  }
  get #isScanningMessage() {
    return createServerMessage({ type: "isScanning", data: scanner$1.isScanning });
  }

  /** @param {ScannerEvent} event */
  #onScannerDiscoveredDevice(event) {
    /** @type {DiscoveredDevice} */
    const discoveredDevice = event.message.discoveredDevice;
    _console$4.log(discoveredDevice);

    this.broadcastMessage(this.#createDiscoveredDeviceMessage(discoveredDevice));
  }
  /** @param {DiscoveredDevice} discoveredDevice */
  #createDiscoveredDeviceMessage(discoveredDevice) {
    return createServerMessage({ type: "discoveredDevice", data: discoveredDevice });
  }

  /** @param {ScannerEvent} event */
  #onExpiredDiscoveredDevice(event) {
    /** @type {DiscoveredDevice} */
    const discoveredDevice = event.message.discoveredDevice;
    _console$4.log("expired", discoveredDevice);
    this.broadcastMessage(this.#createExpiredDiscoveredDeviceMessage(discoveredDevice));
  }
  /** @param {DiscoveredDevice} discoveredDevice */
  #createExpiredDiscoveredDeviceMessage(discoveredDevice) {
    return createServerMessage({ type: "expiredDiscoveredDevice", data: discoveredDevice.bluetoothId });
  }

  get #discoveredDevicesMessage() {
    return createServerMessage(
      ...scanner$1.discoveredDevicesArray.map((discoveredDevice) => {
        return { type: "discoveredDevice", data: discoveredDevice };
      })
    );
  }

  get #connectedDevicesMessage() {
    return createServerMessage({
      type: "connectedDevices",
      data: JSON.stringify(Device.ConnectedDevices.map((device) => device.bluetoothId)),
    });
  }

  // DEVICE LISTENERS

  #boundDeviceListeners = {
    connectionMessage: this.#onDeviceConnectionMessage.bind(this),
  };

  /**
   * @param {Device} device
   * @param {DeviceEventType} messageType
   * @param {DataView} [dataView]
   * @returns {DeviceMessage}
   */
  #createDeviceMessage(device, messageType, dataView) {
    return { type: messageType, data: dataView || device.latestConnectionMessage.get(messageType) };
  }

  
  

  /** @param {DeviceEvent} deviceEvent */
  #onDeviceConnectionMessage(deviceEvent) {
    const device = deviceEvent.target;
    _console$4.log("onDeviceConnectionMessage", deviceEvent.message);

    if (!device.isConnected) {
      return;
    }

    /** @type {ConnectionMessageType} */
    const messageType = deviceEvent.message.messageType;
    /** @type {DataView} */
    const dataView = deviceEvent.message.dataView;

    this.broadcastMessage(
      this.#createDeviceServerMessage(device, this.#createDeviceMessage(device, messageType, dataView))
    );
  }

  // DEVICE CLASS LISTENERS

  #boundDeviceClassListeners = {
    deviceConnected: this.#onDeviceConnected.bind(this),
    deviceDisconnected: this.#onDeviceDisconnected.bind(this),
    deviceIsConnected: this.#onDeviceIsConnected.bind(this),
  };

  

  /** @param {StaticDeviceEvent} staticDeviceEvent */
  #onDeviceConnected(staticDeviceEvent) {
    /** @type {Device} */
    const device = staticDeviceEvent.message.device;
    _console$4.log("onDeviceConnected", device.bluetoothId);
    addEventListeners(device, this.#boundDeviceListeners);
  }

  /** @param {StaticDeviceEvent} staticDeviceEvent */
  #onDeviceDisconnected(staticDeviceEvent) {
    /** @type {Device} */
    const device = staticDeviceEvent.message.device;
    _console$4.log("onDeviceDisconnected", device.bluetoothId);
    removeEventListeners(device, this.#boundDeviceListeners);
  }

  /** @param {StaticDeviceEvent} staticDeviceEvent */
  #onDeviceIsConnected(staticDeviceEvent) {
    /** @type {Device} */
    const device = staticDeviceEvent.message.device;
    _console$4.log("onDeviceIsConnected", device.bluetoothId);
    this.broadcastMessage(this.#createDeviceIsConnectedMessage(device));
  }
  /** @param {Device} device */
  #createDeviceIsConnectedMessage(device) {
    return this.#createDeviceServerMessage(device, { type: "isConnected", data: device.isConnected });
  }

  /**
   * @param {Device} device
   * @param {...DeviceEventType|DeviceMessage} messages
   */
  #createDeviceServerMessage(device, ...messages) {
    return createServerMessage({
      type: "deviceMessage",
      data: [device.bluetoothId, createDeviceMessage(...messages)],
    });
  }

  // PARSING

  

  /**
   * @protected
   * @param {DataView} dataView
   */
  parseClientMessage(dataView) {
    /** @type {ArrayBuffer[]} */
    let responseMessages = [];

    parseMessage(dataView, ServerMessageTypes, this.#onClientMessage.bind(this), { responseMessages }, true);

    responseMessages = responseMessages.filter(Boolean);

    if (responseMessages.length > 0) {
      return concatenateArrayBuffers(responseMessages);
    }
  }

  /**
   * @param {ServerMessageType} messageType
   * @param {DataView} dataView
   * @param {{responseMessages: ArrayBuffer[]}} context
   */
  #onClientMessage(messageType, dataView, context) {
    switch (messageType) {
      case "ping":
        responseMessages.push(pongMessage);
        break;
      case "pong":
        break;
      case "isScanningAvailable":
        context.responseMessages.push(this.#isScanningAvailableMessage);
        break;
      case "isScanning":
        context.responseMessages.push(this.#isScanningMessage);
        break;
      case "startScan":
        scanner$1.startScan();
        break;
      case "stopScan":
        scanner$1.stopScan();
        break;
      case "discoveredDevices":
        context.responseMessages.push(this.#discoveredDevicesMessage);
        break;
      case "connectToDevice":
        {
          const { string: deviceId } = parseStringFromDataView(dataView);
          scanner$1.connectToDevice(deviceId);
        }
        break;
      case "disconnectFromDevice":
        {
          const { string: deviceId } = parseStringFromDataView(dataView);
          const device = Device.ConnectedDevices.find((device) => device.bluetoothId == deviceId);
          if (!device) {
            _console$4.error(`no device found with id ${deviceId}`);
            break;
          }
          device.disconnect();
        }
        break;
      case "connectedDevices":
        context.responseMessages.push(this.#connectedDevicesMessage);
        break;
      case "deviceMessage":
        {
          const { string: deviceId, byteOffset } = parseStringFromDataView(dataView);
          const device = Device.ConnectedDevices.find((device) => device.bluetoothId == deviceId);
          if (!device) {
            _console$4.error(`no device found with id ${deviceId}`);
            break;
          }
          const _dataView = new DataView(dataView.buffer, dataView.byteOffset + byteOffset);
          context.responseMessages.push(this.parseClientDeviceMessage(device, _dataView));
        }
        break;
      default:
        _console$4.error(`uncaught messageType "${messageType}"`);
        break;
    }
  }

  /**
   * @protected
   * @param {Device} device
   * @param {DataView} dataView
   */
  parseClientDeviceMessage(device, dataView) {
    _console$4.log("onDeviceMessage", device.bluetoothId, dataView);

    /** @type {(DeviceEventType | DeviceMessage)[]} */
    let responseMessages = [];

    parseMessage(
      dataView,
      BaseConnectionManager.MessageTypes,
      this.#parseClientDeviceMessageCallback.bind(this),
      { responseMessages, device },
      true
    );

    if (responseMessages.length > 0) {
      return this.#createDeviceServerMessage(device, ...responseMessages);
    }
  }

  /**
   * @param {ConnectionMessageType} messageType
   * @param {DataView} dataView
   * @param {{responseMessages: (DeviceEventType | DeviceMessage)[], device: Device}} context
   */
  #parseClientDeviceMessageCallback(messageType, dataView, context) {
    switch (messageType) {
      case "smp":
        context.device.connectionManager.sendSmpMessage(dataView.buffer);
        break;
      case "tx":
        context.device.connectionManager.sendTxData(dataView.buffer);
        break;
      default:
        context.responseMessages.push(this.#createDeviceMessage(context.device, messageType));
        break;
    }
  }
}

const _console$3 = createConsole("WebSocketServer", { log: true });





/**
 * @typedef {Object} BaseWebSocketClientConnectedEvent
 * @property {{client: ws.WebSocket}} message
 */
/** @typedef {ClientConnectedEvent & BaseWebSocketClientConnectedEvent} WebSocketClientConnectedEvent */


/**
 * @typedef {Object} BaseWebSocketClientDisconnectedEvent
 * @property {{client: ws.WebSocket}} message
 */
/** @typedef {ClientDisconnectedEvent & BaseWebSocketClientDisconnectedEvent} WebSocketClientDisconnectedEvent */

/** @typedef {WebSocketClientConnectedEvent | WebSocketClientDisconnectedEvent} WebSocketServerEvent */
/** @typedef {(event: WebSocketServerEvent) => void} WebSocketServerEventListener */

class WebSocketServer extends BaseServer {
  /**
   * @param {ServerEventType} type
   * @param {WebSocketServerEventListener} listener
   * @param {EventDispatcherOptions} [options]
   */
  addEventListener(type, listener, options) {
    super.addEventListener(type, listener, options);
  }

  /**
   * @protected
   * @param {WebSocketServerEvent} event
   */
  dispatchEvent(event) {
    super.dispatchEvent(event);
  }

  get numberOfClients() {
    return this.#server?.clients.size || 0;
  }

  // WEBSOCKET SERVER

  /** @type {ws.WebSocketServer?} */
  #server;
  get server() {
    return this.#server;
  }
  set server(newServer) {
    if (this.#server == newServer) {
      _console$3.log("redundant WebSocket assignment");
      return;
    }
    _console$3.log("assigning server...");

    if (this.#server) {
      _console$3.log("clearing existing server...");
      removeEventListeners(this.#server, this.#boundServerListeners);
    }

    addEventListeners(newServer, this.#boundServerListeners);
    this.#server = newServer;

    _console$3.log("assigned server");
  }

  // WEBSOCKET SERVER LISTENERS

  #boundServerListeners = {
    close: this.#onServerClose.bind(this),
    connection: this.#onServerConnection.bind(this),
    error: this.#onServerError.bind(this),
    headers: this.#onServerHeaders.bind(this),
    listening: this.#onServerListening.bind(this),
  };

  #onServerClose() {
    _console$3.log("server.close");
  }
  /** @param {ws.WebSocket} client */
  #onServerConnection(client) {
    _console$3.log("server.connection");
    client.isAlive = true;
    client.pingClientTimer = new Timer(() => this.#pingClient(client), pingTimeout);
    client.pingClientTimer.start();
    addEventListeners(client, this.#boundClientListeners);
    this.dispatchEvent({ type: "clientConnected", message: { client } });
  }
  /** @param {Error} error */
  #onServerError(error) {
    _console$3.error(error);
  }
  #onServerHeaders() {
    //_console.log("server.headers");
  }
  #onServerListening() {
    _console$3.log("server.listening");
  }

  // WEBSOCKET CLIENT LISTENERS

  #boundClientListeners = {
    open: this.#onClientOpen.bind(this),
    message: this.#onClientMessage.bind(this),
    close: this.#onClientClose.bind(this),
    error: this.#onClientError.bind(this),
  };
  /** @param {ws.Event} event */
  #onClientOpen(event) {
    _console$3.log("client.open");
  }
  /** @param {ws.MessageEvent} event */
  #onClientMessage(event) {
    _console$3.log("client.message");
    const client = event.target;
    client.isAlive = true;
    client.pingClientTimer.restart();
    const dataView = new DataView(dataToArrayBuffer(event.data));
    this.#parseClientMessage(client, dataView);
  }
  /** @param {ws.CloseEvent} event */
  #onClientClose(event) {
    _console$3.log("client.close");
    const client = event.target;
    client.pingClientTimer.stop();
    removeEventListeners(client, this.#boundClientListeners);
    this.dispatchEvent({ type: "clientDisconnected", message: { client } });
  }
  /** @param {ws.ErrorEvent} event */
  #onClientError(event) {
    _console$3.log("client.error");
  }

  // PARSING

  /**
   * @param {ws.WebSocket} client
   * @param {DataView} dataView
   */
  #parseClientMessage(client, dataView) {
    const responseMessage = this.parseClientMessage(dataView);
    if (responseMessage) {
      client.send(responseMessage);
    }
  }

  // CLIENT MESSAGING

  /** @param {ArrayBuffer} message */
  broadcastMessage(message) {
    super.broadcastMessage(message);
    this.server.clients.forEach((client) => {
      client.send(message);
    });
  }

  // PING

  /** @param {ws.WebSocket} client */
  #pingClient(client) {
    if (!client.isAlive) {
      client.terminate();
      return;
    }
    client.isAlive = false;
    client.send(pingMessage);
  }
}

const _console$2 = createConsole("DevicePairPressureSensorDataManager", { log: true });







/**
 * @typedef {Object} DevicePairRawPressureData
 * @property {PressureData} left
 * @property {PressureData} right
 */

/**
 * @typedef {Object} DevicePairPressureData
 *
 * @property {number} rawSum
 * @property {number} normalizedSum
 *
 * @property {CenterOfPressure} [center]
 * @property {CenterOfPressure} [normalizedCenter]
 */



class DevicePairPressureSensorDataManager {
  static get Sides() {
    return Device.InsoleSides;
  }
  get sides() {
    return Device.InsoleSides;
  }

  // PRESSURE DATA

  /** @type {DevicePairRawPressureData} */
  #rawPressure = {};

  #centerOfPressureHelper = new CenterOfPressureHelper();

  resetPressureRange() {
    this.#centerOfPressureHelper.reset();
  }

  /** @param {DeviceEvent} event  */
  onDevicePressureData(event) {
    const { pressure } = event.message;
    const insoleSide = event.target.insoleSide;
    _console$2.log({ pressure, insoleSide });
    this.#rawPressure[insoleSide] = pressure;
    if (this.#hasAllPressureData) {
      return this.#updatePressureData();
    } else {
      _console$2.log("doesn't have all pressure data yet...");
    }
  }

  get #hasAllPressureData() {
    return this.sides.every((side) => side in this.#rawPressure);
  }

  #updatePressureData() {
    /** @type {DevicePairPressureData} */
    const pressure = { rawSum: 0, normalizedSum: 0 };

    this.sides.forEach((side) => {
      pressure.rawSum += this.#rawPressure[side].rawSum;
      pressure.normalizedSum += this.#rawPressure[side].normalizedSum;
    });

    if (pressure.normalizedSum > 0) {
      pressure.center = { x: 0, y: 0 };
      this.sides.forEach((side) => {
        const sidePressure = this.#rawPressure[side];
        const normalizedPressureSumWeight = sidePressure.normalizedSum / pressure.normalizedSum;
        if (normalizedPressureSumWeight > 0) {
          pressure.center.y += sidePressure.normalizedCenter.y * normalizedPressureSumWeight;
          if (side == "right") {
            pressure.center.x = normalizedPressureSumWeight;
          }
        }
      });

      pressure.normalizedCenter = this.#centerOfPressureHelper.updateAndGetNormalization(pressure.center);
    }

    _console$2.log({ devicePairPressure: pressure });

    return pressure;
  }
}

const _console$1 = createConsole("DevicePairSensorDataManager", { log: true });






class DevicePairSensorDataManager {
    static get Sides() {
        return Device.InsoleSides;
    }
    get sides() {
        return Device.InsoleSides;
    }

    /** @type {Object.<SensorType, Object.<InsoleSide, number>>} */
    #timestamps = {};

    pressureSensorDataManager = new DevicePairPressureSensorDataManager();
    resetPressureRange() {
        this.sides.forEach((side) => {
            this[side]?.resetPressureRange();
        });
        this.pressureSensorDataManager.resetPressureRange();
    }

    

    /** @param {DeviceEvent} event */
    onDeviceSensorData(event) {
        const { timestamp } = event.message;

        /** @type {SensorType} */
        const sensorType = event.message.sensorType;

        _console$1.log({ sensorType, timestamp, event });

        if (!this.#timestamps[sensorType]) {
            this.#timestamps[sensorType] = {};
        }
        this.#timestamps[sensorType][event.target.insoleSide] = timestamp;

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
            const timestamps = Object.assign({}, this.#timestamps[sensorType]);
            this.onDataReceived?.(sensorType, { timestamps, [sensorType]: value });
        } else {
            _console$1.log("no value received");
        }
    }

    /** @type {SensorDataCallback?} */
    onDataReceived;
}

const _console = createConsole("DevicePair", { log: true });







/** @typedef {"deviceIsConnected" | "deviceConnectionStatus"} DevicePairDeviceEventType */
/**
 * @typedef { "deviceSensorData" |
 * "devicePressure" |
 * "deviceAcceleration" |
 * "deviceGravity" |
 * "deviceLinearAcceleration" |
 * "deviceGyroscope" |
 * "deviceMagnetometer" |
 * "deviceGameRotation" |
 * "deviceRotation" |
 * "deviceOrientation" |
 * "deviceDeviceOrientation" |
 * "deviceActivity" |
 * "deviceStepCounter" |
 * "deviceStepDetector" |
 * "deviceBarometer"
 * } DevicePairDeviceSensorDataEventType
 */
/** @typedef {"pressure"} DevicePairSensorType */
/** @typedef {"isConnected" | DevicePairDeviceEventType | DevicePairDeviceSensorDataEventType | DevicePairSensorType | "deviceGetSensorConfiguration"} DevicePairEventType */







/**
 * @typedef {Object} BaseDevicePairEvent
 * @property {DevicePair} target
 * @property {DevicePairEventType} type
 */

/**
 * @typedef {Object} BaseDevicePairIsConnectedEvent
 * @property {"isConnected"} type
 * @property {{isConnected: boolean}} message
 */
/** @typedef {BaseDevicePairEvent & BaseDevicePairIsConnectedEvent} DevicePairIsConnectedEvent */

/** @typedef {DevicePairIsConnectedEvent} DevicePairConnectionEvent */


/**
 * @typedef {Object} BaseDevicePairPressureEvent
 * @property {"pressure"} type
 * @property {{pressure: PressureData}} message
 */
/** @typedef {BaseDevicePairEvent & BaseDevicePairPressureEvent} DevicePairPressureEvent */

/** @typedef {DevicePairPressureEvent} DevicePairSensorEvent */

/**
 * @typedef {Object} BaseDevicePairDeviceIsConnectedEvent
 * @property {"deviceIsConnected"} type
 * @property {{device: Device, isConnected: boolean}} message
 */
/** @typedef {BaseDevicePairEvent & BaseDevicePairDeviceIsConnectedEvent} DevicePairDeviceIsConnectedEvent */


/**
 * @typedef {Object} BaseDevicePairDeviceConnectionStatusEvent
 * @property {"deviceConnectionStatus"} type
 * @property {{device: Device, connectionStatus: ConnectionStatus}} message
 */
/** @typedef {BaseDevicePairEvent & BaseDevicePairDeviceConnectionStatusEvent} DevicePairDeviceConnectionStatusEvent */

/** @typedef {DevicePairDeviceIsConnectedEvent | DevicePairDeviceConnectionStatusEvent} DevicePairDeviceConnectionEvent */


/**
 * @typedef {Object} BaseDevicePairDeviceSensorDataEvent
 * @property {DevicePairDeviceSensorDataEventType} type
 * @property {{device: Device} & SensorDataEventMessage} message
 */
/** @typedef {BaseDevicePairEvent & BaseDevicePairDeviceSensorDataEvent} DevicePairDeviceSensorDataEvent */

/**
 * @typedef {Object} BaseDevicePairDeviceAccelerationSensorDataEvent
 * @property {"deviceAcceleration"} type
 * @property {{device: Device} & import("../sensor/MotionSensorDataManager.js").AccelerationDataEventMessage} message
 */
/** @typedef {BaseDevicePairEvent & BaseDevicePairDeviceAccelerationSensorDataEvent} DevicePairDeviceAccelerationSensorDataEvent */

/**
 * @typedef {Object} BaseDevicePairDeviceGravitySensorDataEvent
 * @property {"deviceGravity"} type
 * @property {{device: Device} & import("../sensor/MotionSensorDataManager.js").GravityDataEventMessage} message
 */
/** @typedef {BaseDevicePairEvent & BaseDevicePairDeviceGravitySensorDataEvent} DevicePairDeviceGravitySensorDataEvent */

/**
 * @typedef {Object} BaseDevicePairDeviceLinearAccelerationSensorDataEvent
 * @property {"deviceLinearAcceleration"} type
 * @property {{device: Device} & import("../sensor/MotionSensorDataManager.js").LinearAccelerationDataEventMessage} message
 */
/** @typedef {BaseDevicePairEvent & BaseDevicePairDeviceLinearAccelerationSensorDataEvent} DevicePairDeviceLinearAccelerationSensorDataEvent */

/**
 * @typedef {Object} BaseDevicePairDeviceGyroscopeSensorDataEvent
 * @property {"deviceGyroscope"} type
 * @property {{device: Device} & import("../sensor/MotionSensorDataManager.js").GyroscopeDataEventMessage} message
 */
/** @typedef {BaseDevicePairEvent & BaseDevicePairDeviceGyroscopeSensorDataEvent} DevicePairDeviceGyroscopeSensorDataEvent */

/**
 * @typedef {Object} BaseDevicePairDeviceMagnetometerSensorDataEvent
 * @property {"deviceMagnetometer"} type
 * @property {{device: Device} & import("../sensor/MotionSensorDataManager.js").MagnetometerDataEventMessage} message
 */
/** @typedef {BaseDevicePairEvent & BaseDevicePairDeviceMagnetometerSensorDataEvent} DevicePairDeviceMagnetometerSensorDataEvent */

/**
 * @typedef {Object} BaseDevicePairDeviceRotationSensorDataEvent
 * @property {"deviceRotation"} type
 * @property {{device: Device} & import("../sensor/MotionSensorDataManager.js").RotationDataEventMessage} message
 */
/** @typedef {BaseDevicePairEvent & BaseDevicePairDeviceRotationSensorDataEvent} DevicePairDeviceRotationSensorDataEvent */

/**
 * @typedef {Object} BaseDevicePairDeviceGameRotationSensorDataEvent
 * @property {"deviceGameRotation"} type
 * @property {{device: Device} & import("../sensor/MotionSensorDataManager.js").GameRotationDataEventMessage} message
 */
/** @typedef {BaseDevicePairEvent & BaseDevicePairDeviceGameRotationSensorDataEvent} DevicePairDeviceGameRotationSensorDataEvent */

/**
 * @typedef {Object} BaseDevicePairDeviceDeviceOrientationSensorDataEvent
 * @property {"deviceDeviceOrientation"} type
 * @property {{device: Device} & import("../sensor/MotionSensorDataManager.js").DeviceOrientationDataEventMessage} message
 */
/** @typedef {BaseDevicePairEvent & BaseDevicePairDeviceDeviceOrientationSensorDataEvent} DevicePairDeviceDeviceOrientationSensorDataEvent */

/**
 * @typedef {Object} BaseDevicePairDeviceActivitySensorDataEvent
 * @property {"deviceActivity"} type
 * @property {{device: Device} & import("../sensor/MotionSensorDataManager.js").ActivityDataEventMessage} message
 */
/** @typedef {BaseDevicePairEvent & BaseDevicePairDeviceActivitySensorDataEvent} DevicePairDeviceActivitySensorDataEvent */

/**
 * @typedef {Object} BaseDevicePairDeviceStepDetectorSensorDataEvent
 * @property {"deviceStepDetector"} type
 * @property {{device: Device} & import("../sensor/MotionSensorDataManager.js").StepDetectorDataEventMessage} message
 */
/** @typedef {BaseDevicePairEvent & BaseDevicePairDeviceStepDetectorSensorDataEvent} DevicePairDeviceStepDetectorSensorDataEvent */

/**
 * @typedef {Object} BaseDevicePairDeviceStepCounterSensorDataEvent
 * @property {"deviceStepCounter"} type
 * @property {{device: Device} & import("../sensor/MotionSensorDataManager.js").StepCounterDataEventMessage} message
 */
/** @typedef {BaseDevicePairEvent & BaseDevicePairDeviceStepCounterSensorDataEvent} DevicePairDeviceStepCounterSensorDataEvent */

/**
 * @typedef {Object} BaseDevicePairDeviceBarometerSensorDataEvent
 * @property {"deviceBarometer"} type
 * @property {{device: Device} & import("../sensor/MotionSensorDataManager.js").BarometerDataEventMessage} message
 */
/** @typedef {BaseDevicePairEvent & BaseDevicePairDeviceBarometerSensorDataEvent} DevicePairDeviceBarometerSensorDataEvent */

/**
 * @typedef {DevicePairDeviceSensorDataEvent |
 * DevicePairDeviceAccelerationSensorDataEvent |
 * DevicePairDeviceGravitySensorDataEvent |
 * DevicePairDeviceLinearAccelerationSensorDataEvent |
 * DevicePairDeviceGyroscopeSensorDataEvent |
 * DevicePairDeviceMagnetometerSensorDataEvent |
 * DevicePairDeviceRotationSensorDataEvent |
 * DevicePairDeviceGameRotationSensorDataEvent |
 * DevicePairDeviceDeviceOrientationSensorDataEvent |
 * DevicePairDeviceActivitySensorDataEvent |
 * DevicePairDeviceStepDetectorSensorDataEvent |
 * DevicePairDeviceStepCounterSensorDataEvent |
 * DevicePairDeviceBarometerSensorDataEvent
 * } DevicePairDeviceSensorEvent
 */

/**
 * @typedef {DevicePairDeviceConnectionEvent |
 * DevicePairConnectionEvent |
 * DevicePairDeviceSensorEvent |
 * DevicePairSensorEvent
 * } DevicePairEvent
 */
/** @typedef {(event: DevicePairEvent) => void} DevicePairEventListener */

class DevicePair {
  constructor() {
    this.#sensorDataManager.onDataReceived = this.#onSensorDataReceived.bind(this);
  }

  // EVENT DISPATCHER

  /** @type {DevicePairEventType[]} */
  static #EventTypes = [
    "isConnected",
    "pressure",
    ...Device.EventTypes.map((sensorType) => `device${capitalizeFirstCharacter(sensorType)}`),
  ];
  static get EventTypes() {
    return this.#EventTypes;
  }
  get eventTypes() {
    return DevicePair.#EventTypes;
  }
  #eventDispatcher = new EventDispatcher(this, this.eventTypes);

  /**
   * @param {DevicePairEventType} type
   * @param {DevicePairEventListener} listener
   * @param {EventDispatcherOptions} [options]
   */
  addEventListener(type, listener, options) {
    this.#eventDispatcher.addEventListener(type, listener, options);
  }

  /**
   * @param {DevicePairEvent} event
   */
  #dispatchEvent(event) {
    this.#eventDispatcher.dispatchEvent(event);
  }

  /**
   * @param {DevicePairEventType} type
   * @param {DevicePairEventListener} listener
   */
  removeEventListener(type, listener) {
    return this.#eventDispatcher.removeEventListener(type, listener);
  }

  // SIDES

  static get Sides() {
    return Device.InsoleSides;
  }
  get sides() {
    return DevicePair.Sides;
  }

  /** @type {Device?} */
  #left;
  get left() {
    return this.#left;
  }

  /** @type {Device?} */
  #right;
  get right() {
    return this.#right;
  }

  get isConnected() {
    return this.sides.every((side) => this[side]?.isConnected);
  }
  get isPartiallyConnected() {
    return this.sides.some((side) => this[side]?.isConnected);
  }
  get isHalfConnected() {
    return this.isPartiallyConnected && !this.isConnected;
  }
  #assertIsConnected() {
    _console.assertWithError(this.isConnected, "devicePair must be connected");
  }

  /** @param {Device} device */
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
      removeEventListeners(currentDevice, this.#boundDeviceEventListeners);
    }
    addEventListeners(device, this.#boundDeviceEventListeners);

    switch (side) {
      case "left":
        this.#left = device;
        break;
      case "right":
        this.#right = device;
        break;
    }

    _console.log(`assigned ${side} insole`, device);

    this.resetPressureRange();

    this.#dispatchEvent({ type: "isConnected", message: { isConnected: this.isConnected } });
    this.#dispatchEvent({ type: "deviceIsConnected", message: { device, isConnected: device.isConnected } });

    return currentDevice;
  }

  /** @type {Object.<string, EventListener} */
  #boundDeviceEventListeners = {
    connectionStatus: this.#redispatchDeviceEvent.bind(this),
    isConnected: this.#onDeviceIsConnected.bind(this),
    sensorData: this.#onDeviceSensorData.bind(this),
    getSensorConfiguration: this.#redispatchDeviceEvent.bind(this),
  };

  /** @param {DeviceEvent} deviceEvent */
  #redispatchDeviceEvent(deviceEvent) {
    this.#dispatchEvent({
      type: `device${capitalizeFirstCharacter(deviceEvent.type)}`,
      message: { ...deviceEvent.message, device: deviceEvent.target },
    });
  }

  /** @param {DeviceEvent} deviceEvent */
  #onDeviceIsConnected(deviceEvent) {
    this.#redispatchDeviceEvent(deviceEvent);
    this.#dispatchEvent({ type: "isConnected", message: { isConnected: this.isConnected } });
  }

  // SENSOR CONFIGURATION

  /** @param {SensorConfiguration} sensorConfiguration */
  setSensorConfiguration(sensorConfiguration) {
    this.sides.forEach((side) => {
      this[side]?.setSensorConfiguration(sensorConfiguration);
    });
  }

  // SENSOR DATA

  #sensorDataManager = new DevicePairSensorDataManager();
  /** @param {DeviceEvent} deviceEvent */
  #onDeviceSensorData(deviceEvent) {
    this.#redispatchDeviceEvent(deviceEvent);
    this.#dispatchEvent({
      type: `device${capitalizeFirstCharacter(deviceEvent.message.sensorType)}`,
      message: { ...deviceEvent.message, device: deviceEvent.target },
    });

    if (this.isConnected) {
      this.#sensorDataManager.onDeviceSensorData(deviceEvent);
    }
  }
  /**
   * @param {SensorType} sensorType
   * @param {Object} sensorData
   * @param {number} sensorData.timestamp
   */
  #onSensorDataReceived(sensorType, sensorData) {
    _console.log({ sensorType, sensorData });
    this.#dispatchEvent({ type: sensorType, message: sensorData });
  }

  resetPressureRange() {
    this.#sensorDataManager.resetPressureRange();
  }

  // VIBRATION

  
  /**
   * @param {VibrationConfiguration[]} vibrationConfigurations
   * @param {boolean} sendImmediately
   */
  async triggerVibration(vibrationConfigurations, sendImmediately) {
    const promises = this.sides
      .map((side) => {
        return this[side]?.triggerVibration(vibrationConfigurations, sendImmediately);
      })
      .filter(Boolean);
    return Promise.allSettled(promises);
  }

  // SHARED INSTANCE

  static #shared = new DevicePair();
  static get shared() {
    return this.#shared;
  }
  static {
    Device.AddEventListener("deviceConnected", (event) => {
      /** @type {Device} */
      const device = event.message.device;
      if (device.isInsole) {
        this.#shared.assignInsole(device);
      }
    });
  }
}

exports.Device = Device;
exports.DevicePair = DevicePair;
exports.Environment = environment;
exports.Scanner = scanner$1;
exports.WebSocketServer = WebSocketServer;
exports.setAllConsoleLevelFlags = setAllConsoleLevelFlags;
exports.setConsoleLevelFlagsForType = setConsoleLevelFlagsForType;
