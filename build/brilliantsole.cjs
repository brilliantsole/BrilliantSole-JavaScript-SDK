/**
 * @copyright Zack Qattan 2024
 * @license MIT
 */
'use strict';

/** @type {"__BRILLIANTSOLE__DEV__" | "__BRILLIANTSOLE__PROD__"} */
const isInDev = "__BRILLIANTSOLE__PROD__" == "__BRILLIANTSOLE__DEV__";

// https://github.com/flexdinesh/browser-or-node/blob/master/src/index.ts
const isInBrowser = typeof window !== "undefined" && window?.document !== "undefined";
const isInNode = typeof process !== "undefined" && process?.versions?.node != null;

const isInBluefy = isInBrowser && navigator.userAgent.includes("Bluefy");
const isInWebBLE = isInBrowser && navigator.userAgent.includes("WebBLE");

isInBrowser && navigator.userAgent.includes("Android");
isInBrowser && navigator.userAgent.includes("Safari");

// console.assert not supported in WebBLE
if (!console.assert) {
    /**
     * @param {boolean} condition
     * @param  {...any} data
     */
    const assert = (condition, ...data) => {
        if (!condition) {
            console.warn(...data);
        }
    };
    console.assert = assert;
}

// console.table not supported in WebBLE
if (!console.table) {
    /** @param  {...any} data */
    const table = (...data) => {
        console.log(...data);
    };
    console.table = table;
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
 * @typedef ConsoleLevelFlags
 * @type {Object}
 * @property {boolean} log
 * @property {boolean} warn
 * @property {boolean} error
 * @property {boolean} assert
 * @property {boolean} table
 */

function emptyFunction() {}

/** @type {LogFunction} */
const log = console.log.bind(console);
/** @type {LogFunction} */
const warn = console.warn.bind(console);
/** @type {LogFunction} */
const error = console.error.bind(console);
/** @type {LogFunction} */
const table = console.table.bind(console);
/** @type {AssertLogFunction} */
const assert = console.assert.bind(console);

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
     * @param {string?} message
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
 * @param {ConsoleLevelFlags?} levelFlags
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

const _console$v = createConsole("EventDispatcher", { log: false });

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
        _console$v.assertWithError(target, "target is required");
        this.#target = target;
        _console$v.assertWithError(Array.isArray(eventTypes) || eventTypes == undefined, "eventTypes must be an array");
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
        _console$v.assertWithError(this.#isValidEventType(type), `invalid event type "${type}"`);
    }

    /** @type {Object.<string, [function]?>?} */
    #listeners;

    /**
     * @param {string} type
     * @param {EventDispatcherListener} listener
     * @param {EventDispatcherOptions?} options
     */
    addEventListener(type, listener, options) {
        _console$v.log(`adding "${type}" eventListener`, listener);
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
        _console$v.log(`has "${type}" eventListener?`, listener);
        this.#assertValidEventType(type);
        return this.#listeners?.[type]?.includes(listener);
    }

    /**
     * @param {string} type
     * @param {EventDispatcherListener} listener
     */
    removeEventListener(type, listener) {
        _console$v.log(`removing "${type}" eventListener`, listener);
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
                    _console$v.error(error);
                }
            }
        }
    }

    /** @param {string} type */
    waitForEvent(type) {
        _console$v.log(`waiting for event "${type}"`);
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
    _console$v.assertWithError(addEventListener, "no add listener function found for target");
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
    _console$v.assertWithError(removeEventListener, "no remove listener function found for target");
    removeEventListener = removeEventListener.bind(target);
    Object.entries(boundEventListeners).forEach(([eventType, eventListener]) => {
        removeEventListener(eventType, eventListener);
    });
}

const _console$u = createConsole("Timer", { log: false });

class Timer {
    /** @type {function} */
    #callback;
    get callback() {
        return this.#callback;
    }
    set callback(newCallback) {
        _console$u.assertTypeWithError(newCallback, "function");
        _console$u.log({ newCallback });
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
        _console$u.assertTypeWithError(newInterval, "number");
        _console$u.assertWithError(newInterval > 0, "interval must be above 0");
        _console$u.log({ newInterval });
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
            _console$u.log("interval already running");
            return;
        }
        _console$u.log("starting interval");
        this.#intervalId = setInterval(this.#callback, this.#interval);
    }
    stop() {
        if (!this.isRunning) {
            _console$u.log("interval already not running");
            return;
        }
        _console$u.log("stopping interval");
        clearInterval(this.#intervalId);
        this.#intervalId = null;
    }
    restart() {
        this.stop();
        this.start();
    }
}

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

const _console$t = createConsole("ArrayBufferUtils", { log: false });

const textEncoder$1 = new TextEncoder();

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
    const encoding = textEncoder$1.encode(string);
    return concatenateArrayBuffers(encoding.byteLength, encoding);
}

/** @param {Object} object */
function objectToArrayBuffer(object) {
    return stringToArrayBuffer(JSON.stringify(object));
}

/**
 * @param {DataView} dataView
 * @param {number} begin
 * @param {number?} length
 */
function sliceDataView(dataView, begin, length) {
    let end;
    if (length != undefined) {
        end = dataView.byteOffset + begin + length;
    }
    _console$t.log({ dataView, begin, end, length });
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

const _console$s = createConsole("FileTransferManager", { log: true });

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
 * @typedef FileTransferManagerEvent
 * @type {Object}
 * @property {Device} target
 * @property {FileTransferManagerEventType} type
 * @property {Object} message
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
     * @param {EventDispatcherOptions} options
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
        _console$s.assertEnumWithError(type, this.types);
    }
    /** @param {number} typeEnum */
    #assertValidTypeEnum(typeEnum) {
        _console$s.assertWithError(this.types[typeEnum], `invalid typeEnum ${typeEnum}`);
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
        _console$s.assertWithError(this.statuses[statusEnum], `invalid statusEnum ${statusEnum}`);
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
        _console$s.assertEnumWithError(command, this.commands);
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
        _console$s.log("parseFileMaxLength", dataView);
        const maxLength = dataView.getUint32(0, true);
        _console$s.log(`maxLength: ${maxLength / 1024}kB`);
        this.#maxLength = maxLength;
    }
    /** @param {number} length */
    #assertValidLength(length) {
        _console$s.assertWithError(
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
        _console$s.log("parseFileType", dataView);
        const typeEnum = dataView.getUint8(0);
        this.#assertValidTypeEnum(typeEnum);
        const type = this.types[typeEnum];
        this.#updateType(type);
    }
    /** @param {FileType} type */
    #updateType(type) {
        _console$s.log({ fileTransferType: type });
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
            _console$s.log(`redundant type assignment ${newType}`);
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
        _console$s.log("parseFileLength", dataView);
        const length = dataView.getUint32(0, true);

        this.#updateLength(length);
    }
    /** @param {number} length */
    #updateLength(length) {
        _console$s.log(`length: ${length / 1024}kB`);
        this.#length = length;
        this.#dispatchEvent({ type: "getFileLength", message: { fileLength: length } });
    }
    /**
     * @param {number} newLength
     * @param {boolean} sendImmediately
     */
    async #setLength(newLength, sendImmediately) {
        _console$s.assertTypeWithError(newLength, "number");
        this.#assertValidLength(newLength);
        if (this.length == newLength) {
            _console$s.log(`redundant length assignment ${newLength}`);
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
        _console$s.log("checksum", dataView);
        const checksum = dataView.getUint32(0, true);
        this.#updateChecksum(checksum);
    }
    /** @param {number} checksum */
    #updateChecksum(checksum) {
        _console$s.log({ checksum });
        this.#checksum = checksum;
        this.#dispatchEvent({ type: "getFileChecksum", message: { fileChecksum: checksum } });
    }
    /**
     * @param {number} newChecksum
     * @param {boolean} sendImmediately
     */
    async #setChecksum(newChecksum, sendImmediately) {
        _console$s.assertTypeWithError(newChecksum, "number");
        if (this.checksum == newChecksum) {
            _console$s.log(`redundant checksum assignment ${newChecksum}`);
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
        _console$s.log("parseFileStatus", dataView);
        const statusEnum = dataView.getUint8(0);
        this.#assertValidStatusEnum(statusEnum);
        const status = this.statuses[statusEnum];
        this.#updateStatus(status);
    }
    /** @param {FileTransferStatus} status */
    #updateStatus(status) {
        _console$s.log({ status });
        this.#status = status;
        this.#dispatchEvent({ type: "fileTransferStatus", message: { fileTransferStatus: status } });
        this.#receivedBlocks.length = 0;
    }
    #assertIsIdle() {
        _console$s.assertWithError(this.#status == "idle", "status is not idle");
    }
    #assertIsNotIdle() {
        _console$s.assertWithError(this.#status != "idle", "status is idle");
    }

    // BLOCK

    /** @type {ArrayBuffer[]} */
    #receivedBlocks = [];

    /** @param {DataView} dataView */
    async #parseBlock(dataView) {
        _console$s.log("parseFileBlock", dataView);
        this.#receivedBlocks.push(dataView.buffer);

        const bytesReceived = this.#receivedBlocks.reduce((sum, arrayBuffer) => (sum += arrayBuffer.byteLength), 0);
        const progress = bytesReceived / this.#length;

        _console$s.log(`received ${bytesReceived} of ${this.#length} bytes (${progress * 100}%)`);

        this.#dispatchEvent({ type: "fileTransferProgress", message: { progress } });

        if (bytesReceived != this.#length) {
            return;
        }

        _console$s.log("file transfer complete");

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
        _console$s.log({ checksum });

        if (checksum != this.#checksum) {
            _console$s.error(`wrong checksum - expected ${this.#checksum}, got ${checksum}`);
            return;
        }

        console.log("received file", file);

        this.#dispatchEvent({ type: "fileTransferComplete", message: { direction: "receiving" } });
        this.#dispatchEvent({ type: "fileReceived", message: { file } });
    }

    // MESSAGE

    /**
     * @param {FileTransferMessageType} messageType
     * @param {DataView} dataView
     */
    parseMessage(messageType, dataView) {
        _console$s.log({ messageType });

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
        console.log("slicedBuffer", slicedBuffer);
        const bytesLeft = buffer.byteLength - offset;
        const progress = 1 - bytesLeft / buffer.byteLength;
        _console$s.log(
            `sending bytes ${offset}-${offset + slicedBuffer.byteLength} of ${buffer.byteLength} bytes (${
                progress * 100
            }%)`
        );
        this.#dispatchEvent({ type: "fileTransferProgress", message: { progress } });
        if (slicedBuffer.byteLength == 0) {
            _console$s.log("finished sending buffer");
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

const textEncoder = new TextEncoder();
const textDecoder$1 = new TextDecoder();

/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 */
function getInterpolation(value, min, max) {
    return (value - min) / (max - min);
}

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
 * @typedef Range
 * @type {Object}
 * @property {number} min
 * @property {number} max
 */

/** @type {Range} */
const initialRange = { min: Infinity, max: -Infinity };

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
    }

    /** @param {number} value */
    getNormalization(value) {
        return getInterpolation(value, this.#range.min, this.#range.max) || 0;
    }

    /** @param {number} value */
    updateAndGetNormalization(value) {
        this.update(value);
        return this.getNormalization(value);
    }
}

/**
 * @typedef Vector2
 * @type {Object}
 * @property {number} x
 * @property {number} y
 */

/** @typedef {Vector2} CenterOfPressure */

/**
 * @typedef CenterOfPressureRange
 * @type {Object}
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

/**
 * @typedef Vector2
 * @type {Object}
 * @property {number} x
 * @property {number} y
 */

/** @typedef {Vector2} PressureSensorPosition */



/**
 * @typedef PressureSensorValue
 * @type {Object}
 * @property {PressureSensorPosition} position
 * @property {number} rawValue
 * @property {number} normalizedValue
 * @property {number?} weightedValue
 */

/**
 * @typedef PressureData
 * @type {Object}
 * @property {PressureSensorValue[]} sensors
 *
 * @property {number} rawSum
 * @property {number} normalizedSum
 *
 * @property {CenterOfPressure?} center
 * @property {CenterOfPressure?} normalizedCenter
 */

const _console$r = createConsole("PressureSensorDataManager", { log: true });

class PressureSensorDataManager {
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

        _console$r.log({ positions });

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

    /** @param {DataView} dataView */
    parseData(dataView) {
        /** @type {PressureData} */
        const pressure = { sensors: [], rawSum: 0, normalizedSum: 0 };
        for (let index = 0, byteOffset = 0; byteOffset < dataView.byteLength; index++, byteOffset += 2) {
            const rawValue = dataView.getUint16(byteOffset, true);
            const rangeHelper = this.#sensorRangeHelpers[index];
            const normalizedValue = rangeHelper.updateAndGetNormalization(rawValue);
            const position = this.positions[index];
            pressure.sensors[index] = { rawValue, normalizedValue, position };

            pressure.rawSum += rawValue;
            pressure.normalizedSum += normalizedValue / this.numberOfSensors;
        }

        if (pressure.rawSum > 0) {
            pressure.center = { x: 0, y: 0 };
            pressure.sensors.forEach((sensor) => {
                sensor.weightedValue = sensor.rawValue / pressure.rawSum;
                pressure.center.x += sensor.position.x * sensor.weightedValue;
                pressure.center.y += sensor.position.y * sensor.weightedValue;
            });
            pressure.normalizedCenter = this.#centerOfPressureHelper.updateAndGetNormalization(pressure.center);
        }

        _console$r.log({ pressure });
        return pressure;
    }
}

/** @typedef {"acceleration" | "gravity" | "linearAcceleration" | "gyroscope" | "magnetometer" | "gameRotation" | "rotation"} MotionSensorType */

const _console$q = createConsole("MotionSensorDataManager", { log: false });

/**
 * @typedef Vector3
 * @type {Object}
 * @property {number} x
 * @property {number} y
 * @property {number} z
 */

/**
 * @typedef Quaternion
 * @type {Object}
 * @property {number} x
 * @property {number} y
 * @property {number} z
 * @property {number} w
 */

class MotionSensorDataManager {
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

        const vector = { x, y, z };

        _console$q.log({ vector });
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

        const quaternion = { x, y, z, w };

        _console$q.log({ quaternion });
        return quaternion;
    }
}

/** @typedef {"barometer"} BarometerSensorType */

createConsole("BarometerSensorDataManager", { log: true });

class BarometerSensorDataManager {
    static #Scalars = {
        barometer: 100 * 2 ** -7,
    };
    static get Scalars() {
        return this.#Scalars;
    }
    get scalars() {
        return BarometerSensorDataManager.Scalars;
    }
}

const _console$p = createConsole("ParseUtils", { log: true });

const textDecoder = new TextDecoder();

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
 * @param {Object?} context
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

        _console$p.log({ messageTypeEnum, messageType, messageLength, dataView, byteOffset });
        _console$p.assertWithError(messageType, `invalid messageTypeEnum ${messageTypeEnum}`);

        const _dataView = sliceDataView(dataView, byteOffset, messageLength);
        _console$p.log({ _dataView });

        callback(messageType, _dataView, context);

        byteOffset += messageLength;
    }
}

const _console$o = createConsole("SensorDataManager", { log: true });





/** @typedef {MotionSensorType | PressureSensorType | BarometerSensorType} SensorType */

/** @typedef {"pressurePositions" | "sensorScalars" | "sensorData"} SensorDataMessageType */
/** @typedef {SensorDataMessageType | SensorType} SensorDataManagerEventType */





/**
 * @typedef SensorDataManagerEvent
 * @type {Object}
 * @property {Device} target
 * @property {SensorDataManagerEventType} type
 * @property {Object} message
 */

class SensorDataManager {
    // MESSAGE TYPES

    /** @type {SensorDataMessageType[]} */
    static #MessageTypes = ["pressurePositions", "sensorScalars", "sensorData"];
    static get MessageTypes() {
        return this.#MessageTypes;
    }
    get messageTypes() {
        return SensorDataManager.MessageTypes;
    }

    // EVENT DISPATCHER

    /** @type {SensorDataManagerEventType[]} */
    static #EventTypes = [
        ...this.#MessageTypes,

        "pressure",
        "acceleration",
        "gravity",
        "linearAcceleration",
        "gyroscope",
        "magnetometer",
        "gameRotation",
        "rotation",
        "barometer",
    ];
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

    // MANAGERS

    pressureSensorDataManager = new PressureSensorDataManager();
    motionSensorDataManager = new MotionSensorDataManager();
    barometerSensorDataManager = new BarometerSensorDataManager();

    /** @type {SensorType[]} */
    static #Types = [
        "pressure",
        "acceleration",
        "gravity",
        "linearAcceleration",
        "gyroscope",
        "magnetometer",
        "gameRotation",
        "rotation",
        "barometer",
    ];
    static get Types() {
        return this.#Types;
    }
    get types() {
        return SensorDataManager.Types;
    }

    /** @type {Map.<SensorType, number>} */
    #scalars = new Map();

    /** @param {string} sensorType */
    static AssertValidSensorType(sensorType) {
        _console$o.assertTypeWithError(sensorType, "string");
        _console$o.assertWithError(this.#Types.includes(sensorType), `invalid sensorType "${sensorType}"`);
    }
    /** @param {number} sensorTypeEnum */
    static AssertValidSensorTypeEnum(sensorTypeEnum) {
        _console$o.assertTypeWithError(sensorTypeEnum, "number");
        _console$o.assertWithError(sensorTypeEnum in this.#Types, `invalid sensorTypeEnum ${sensorTypeEnum}`);
    }

    /** @param {DataView} dataView */
    #parseData(dataView) {
        _console$o.log("sensorData", Array.from(new Uint8Array(dataView.buffer)));

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

        let sensorData;
        switch (sensorType) {
            case "pressure":
                sensorData = this.pressureSensorDataManager.parseData(dataView);
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
            case "barometer":
                // FILL
                break;
            default:
                _console$o.error(`uncaught sensorType "${sensorType}"`);
        }

        _console$o.assertWithError(sensorData, `no sensorData defined for sensorType "${sensorType}"`);

        _console$o.log({ sensorType, sensorData });
        this.#dispatchEvent({ type: sensorType, message: sensorData });
        this.#dispatchEvent({ type: "sensorData", message: { ...sensorData, sensorType } });
    }

    /** @param {DataView} dataView */
    parseScalars(dataView) {
        for (let byteOffset = 0; byteOffset < dataView.byteLength; byteOffset += 5) {
            const sensorTypeIndex = dataView.getUint8(byteOffset);
            const sensorType = SensorDataManager.Types[sensorTypeIndex];
            if (!sensorType) {
                _console$o.warn(`unknown sensorType index ${sensorTypeIndex}`);
                continue;
            }
            const sensorScalar = dataView.getFloat32(byteOffset + 1, true);
            _console$o.log({ sensorType, sensorScalar });
            this.#scalars.set(sensorType, sensorScalar);
        }
    }

    // MESSAGE

    /**
     * @param {SensorDataMessageType} messageType
     * @param {DataView} dataView
     */
    parseMessage(messageType, dataView) {
        _console$o.log({ messageType });

        switch (messageType) {
            case "sensorScalars":
                this.parseScalars(dataView);
                break;
            case "pressurePositions":
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

const _console$n = createConsole("SensorConfigurationManager", { log: false });


/**
 * @typedef SensorConfiguration
 * @type {Object}
 * @property {number?} pressure
 * @property {number?} acceleration
 * @property {number?} gravity
 * @property {number?} linearAcceleration
 * @property {number?} gyroscope
 * @property {number?} magnetometer
 * @property {number?} gameRotation
 * @property {number?} rotation
 * @property {number?} barometer
 */

/** @typedef {"getSensorConfiguration" | "setSensorConfiguration"} SensorConfigurationMessageType */
/** @typedef {SensorConfigurationMessageType} SensorConfigurationManagerEventType */





/**
 * @typedef SensorConfigurationManagerEvent
 * @type {Object}
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
        _console$n.assertWithError(this.#availableSensorTypes, "must get initial sensorConfiguration");
        const isSensorTypeAvailable = this.#availableSensorTypes?.includes(sensorType);
        _console$n.assert(isSensorTypeAvailable, `unavailable sensor type "${sensorType}"`);
        return isSensorTypeAvailable;
    }

    /** @type {SensorConfiguration?} */
    #configuration;
    get configuration() {
        return this.#configuration;
    }

    /** @param {SensorConfiguration} updatedConfiguration */
    #updateConfiguration(updatedConfiguration) {
        this.#configuration = updatedConfiguration;
        _console$n.log({ updatedConfiguration: this.#configuration });
        this.#dispatchEvent({
            type: "getSensorConfiguration",
            message: { sensorConfiguration: this.configuration },
        });
    }

    /** @param {SensorConfiguration} newSensorConfiguration */
    async setConfiguration(newSensorConfiguration) {
        _console$n.log({ newSensorConfiguration });
        const setSensorConfigurationData = this.#createData(newSensorConfiguration);
        _console$n.log({ setSensorConfigurationData });

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
                _console$n.warn(`unknown sensorType index ${sensorTypeIndex}`);
                continue;
            }
            const sensorRate = dataView.getUint16(byteOffset + 1, true);
            _console$n.log({ sensorType, sensorRate });
            parsedSensorConfiguration[sensorType] = sensorRate;
        }
        _console$n.log({ parsedSensorConfiguration });
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
        _console$n.assertTypeWithError(sensorRate, "number");
        _console$n.assertWithError(sensorRate >= 0, `sensorRate must be 0 or greater (got ${sensorRate})`);
        _console$n.assertWithError(
            sensorRate < this.MaxSensorRate,
            `sensorRate must be 0 or greater (got ${sensorRate})`
        );
        _console$n.assertWithError(
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
        _console$n.log({ sensorConfigurationData: dataView });
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
        _console$n.log({ messageType });

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

const _console$m = createConsole("TfliteManager", { log: true });

/**
 * @typedef { "getTfliteName" |
 * "setTfliteName" |
 * "getTfliteTask" |
 * "setTfliteTask" |
 * "getTfliteSampleRate" |
 * "setTfliteSampleRate" |
 * "getTfliteSensorTypes" |
 * "setTfliteSensorTypes" |
 * "tfliteModelIsReady" |
 * "getTfliteCaptureDelay" |
 * "setTfliteCaptureDelay" |
 * "getTfliteThreshold" |
 * "setTfliteThreshold" |
 * "getTfliteInferencingEnabled" |
 * "setTfliteInferencingEnabled" |
 * "tfliteModelInference"
 * } TfliteMessageType
 */

/** @typedef {"classification" | "regression"} TfliteTask */






/** @typedef {TfliteMessageType} TfliteManagerEventType */



/**
 * @typedef TfliteManagerEvent
 * @type {Object}
 * @property {Device} target
 * @property {TfliteManagerEventType} type
 * @property {Object} message
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
        "tfliteModelIsReady",
        "getTfliteCaptureDelay",
        "setTfliteCaptureDelay",
        "getTfliteThreshold",
        "setTfliteThreshold",
        "getTfliteInferencingEnabled",
        "setTfliteInferencingEnabled",
        "tfliteModelInference",
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
        _console$m.assertEnumWithError(task, this.tasks);
    }
    /** @param {number} taskEnum */
    #assertValidTaskEnum(taskEnum) {
        _console$m.assertWithError(this.tasks[taskEnum], `invalid taskEnum ${taskEnum}`);
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
     * @param {EventDispatcherOptions} options
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
        _console$m.log("parseName", dataView);
        const name = textDecoder$1.decode(dataView);
        this.#updateName(name);
    }
    /** @param {string} name */
    #updateName(name) {
        _console$m.log({ name });
        this.#name = name;
        this.#dispatchEvent({ type: "getTfliteName", message: { tfliteModelName: name } });
    }
    /**
     * @param {string} newName
     * @param {boolean} sendImmediately
     */
    async setName(newName, sendImmediately) {
        _console$m.assertTypeWithError(newName, "string");
        if (this.name == newName) {
            _console$m.log(`redundant name assignment ${newName}`);
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
        _console$m.log("parseTask", dataView);
        const taskEnum = dataView.getUint8(0);
        this.#assertValidTaskEnum(taskEnum);
        const task = this.tasks[taskEnum];
        this.#updateTask(task);
    }
    /** @param {TfliteTask} task */
    #updateTask(task) {
        _console$m.log({ task });
        this.#task = task;
        this.#dispatchEvent({ type: "getTfliteTask", message: { tfliteModelTask: task } });
    }
    /**
     * @param {TfliteTask} newTask
     * @param {boolean} sendImmediately
     */
    async setTask(newTask, sendImmediately) {
        this.#assertValidTask(newTask);
        if (this.task == newTask) {
            _console$m.log(`redundant task assignment ${newTask}`);
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
        _console$m.log("parseSampleRate", dataView);
        const sampleRate = dataView.getUint16(0, true);
        this.#updateSampleRate(sampleRate);
    }
    #updateSampleRate(sampleRate) {
        _console$m.log({ sampleRate });
        this.#sampleRate = sampleRate;
        this.#dispatchEvent({ type: "getTfliteSampleRate", message: { tfliteModelSampleRate: sampleRate } });
    }
    /**
     * @param {number} newSampleRate
     * @param {boolean} sendImmediately
     */
    async setSampleRate(newSampleRate, sendImmediately) {
        _console$m.assertTypeWithError(newSampleRate, "number");
        newSampleRate -= newSampleRate % SensorConfigurationManager.SensorRateStep;
        _console$m.assertWithError(
            newSampleRate >= SensorConfigurationManager.SensorRateStep,
            `sampleRate must be multiple of ${SensorConfigurationManager.SensorRateStep} greater than 0 (got ${newSampleRate})`
        );
        if (this.#sampleRate == newSampleRate) {
            _console$m.log(`redundant sampleRate assignment ${newSampleRate}`);
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
        _console$m.assertWithError(this.#SensorTypes.includes(sensorType), `invalid tflite sensorType "${sensorType}"`);
    }

    /** @type {SensorType[]} */
    #sensorTypes = [];
    get sensorTypes() {
        return this.#sensorTypes.slice();
    }
    /** @param {DataView} dataView */
    #parseSensorTypes(dataView) {
        _console$m.log("parseSensorTypes", dataView);
        /** @type {SensorType[]} */
        const sensorTypes = [];
        for (let index = 0; index < dataView.byteLength; index++) {
            const sensorTypeEnum = dataView.getUint8(index);
            const sensorType = SensorDataManager.Types[sensorTypeEnum];
            if (sensorType) {
                sensorTypes.push(sensorType);
            } else {
                _console$m.error(`invalid sensorTypeEnum ${sensorTypeEnum}`);
            }
        }
        this.#updateSensorTypes(sensorTypes);
    }
    /** @param {SensorType[]} sensorTypes */
    #updateSensorTypes(sensorTypes) {
        _console$m.log({ sensorTypes });
        this.#sensorTypes = sensorTypes;
        this.#dispatchEvent({ type: "getTfliteSensorTypes", message: { tfliteModelSensorTypes: sensorTypes } });
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
        const newSensorTypeEnums = newSensorTypes
            .map((sensorType) => SensorDataManager.Types.indexOf(sensorType))
            .sort();
        _console$m.log(newSensorTypes, newSensorTypeEnums);
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
        _console$m.log("parseIsReady", dataView);
        const isReady = Boolean(dataView.getUint8(0));
        this.#updateIsReady(isReady);
    }
    /** @param {boolean} isReady */
    #updateIsReady(isReady) {
        _console$m.log({ isReady });
        this.#isReady = isReady;
        this.#dispatchEvent({
            type: "tfliteModelIsReady",
            message: { tfliteModelIsReady: isReady },
        });
    }
    #assertIsReady() {
        _console$m.assertWithError(this.isReady, `tflite is not ready`);
    }

    /** @type {number} */
    #captureDelay;
    get captureDelay() {
        return this.#captureDelay;
    }
    /** @param {DataView} dataView */
    #parseCaptureDelay(dataView) {
        _console$m.log("parseCaptureDelay", dataView);
        const captureDelay = dataView.getUint16(0, true);
        this.#updateCaptueDelay(captureDelay);
    }
    /** @param {number} captureDelay */
    #updateCaptueDelay(captureDelay) {
        _console$m.log({ captureDelay });
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
        _console$m.assertTypeWithError(newCaptureDelay, "number");
        if (this.#captureDelay == newCaptureDelay) {
            _console$m.log(`redundant captureDelay assignment ${newCaptureDelay}`);
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
        _console$m.log("parseThreshold", dataView);
        const threshold = dataView.getFloat32(0, true);
        this.#updateThreshold(threshold);
    }
    /** @param {number} threshold */
    #updateThreshold(threshold) {
        _console$m.log({ threshold });
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
        _console$m.assertTypeWithError(newThreshold, "number");
        _console$m.assertWithError(newThreshold >= 0, `threshold must be positive (got ${newThreshold})`);
        if (this.#threshold == newThreshold) {
            _console$m.log(`redundant threshold assignment ${newThreshold}`);
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
        _console$m.log("parseInferencingEnabled", dataView);
        const inferencingEnabled = Boolean(dataView.getUint8(0));
        this.#updateInferencingEnabled(inferencingEnabled);
    }
    #updateInferencingEnabled(inferencingEnabled) {
        _console$m.log({ inferencingEnabled });
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
        _console$m.assertTypeWithError(newInferencingEnabled, "boolean");
        this.#assertIsReady();
        if (this.#inferencingEnabled == newInferencingEnabled) {
            _console$m.log(`redundant inferencingEnabled assignment ${newInferencingEnabled}`);
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
     * @typedef TfliteModelInference
     * @type {object}
     * @property {number} timestamp
     * @property {number[]} values
     */

    /** @param {DataView} dataView */
    #parseInference(dataView) {
        _console$m.log("parseInference", dataView);

        const timestamp = parseTimestamp(dataView, 0);
        _console$m.log({ timestamp });

        /** @type {number[]} */
        const values = [];
        for (let index = 0, byteOffset = 2; byteOffset < dataView.byteLength; index++, byteOffset += 4) {
            const value = dataView.getFloat32(byteOffset, true);
            values.push(value);
        }
        _console$m.log("values", values);

        /** @type {TfliteModelInference} */
        const inference = {
            timestamp,
            values,
        };

        this.#dispatchEvent({ type: "tfliteModelInference", message: { tfliteModelInference: inference } });
    }

    /**
     * @param {TfliteMessageType} messageType
     * @param {DataView} dataView
     */
    parseMessage(messageType, dataView) {
        _console$m.log({ messageType });

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
            case "tfliteModelIsReady":
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
            case "tfliteModelInference":
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

const _console$l = createConsole("DeviceInformationManager", { log: true });

/**
 * @typedef DeviceInformation
 * @type {Object}
 * @property {string?} manufacturerName
 * @property {string?} modelNumber
 * @property {string?} softwareRevision
 * @property {string?} hardwareRevision
 * @property {string?} firmwareRevision
 * @property {PnpId?} pnpId
 * @property {string?} serialNumber
 */

/**
 * @typedef PnpId
 * @type {Object}
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
 * @typedef DeviceInformationManagerEvent
 * @type {Object}
 * @property {Device} target
 * @property {DeviceInformationManagerEventType} type
 * @property {Object} message
 */

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
    get #isComplete() {
        return Object.values(this.information).every((value) => value != null);
    }

    /** @param {DeviceInformation} partialDeviceInformation */
    #update(partialDeviceInformation) {
        _console$l.log({ partialDeviceInformation });
        for (const deviceInformationName in partialDeviceInformation) {
            this.#dispatchEvent({
                type: deviceInformationName,
                message: { [deviceInformationName]: partialDeviceInformation[deviceInformationName] },
            });
        }

        Object.assign(this.information, partialDeviceInformation);
        _console$l.log({ deviceInformation: this.information });
        if (this.#isComplete) {
            _console$l.log("completed deviceInformation");
            this.#dispatchEvent({ type: "deviceInformation", message: { deviceInformation: this.information } });
        }
    }

    // MESSAGE

    /**
     * @param {DeviceInformationMessageType} messageType
     * @param {DataView} dataView
     */
    parseMessage(messageType, dataView) {
        _console$l.log({ messageType });

        switch (messageType) {
            case "manufacturerName":
                const manufacturerName = textDecoder$1.decode(dataView);
                _console$l.log({ manufacturerName });
                this.#update({ manufacturerName });
                break;
            case "modelNumber":
                const modelNumber = textDecoder$1.decode(dataView);
                _console$l.log({ modelNumber });
                this.#update({ modelNumber });
                break;
            case "softwareRevision":
                const softwareRevision = textDecoder$1.decode(dataView);
                _console$l.log({ softwareRevision });
                this.#update({ softwareRevision });
                break;
            case "hardwareRevision":
                const hardwareRevision = textDecoder$1.decode(dataView);
                _console$l.log({ hardwareRevision });
                this.#update({ hardwareRevision });
                break;
            case "firmwareRevision":
                const firmwareRevision = textDecoder$1.decode(dataView);
                _console$l.log({ firmwareRevision });
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
                _console$l.log({ pnpId });
                this.#update({ pnpId });
                break;
            case "serialNumber":
                const serialNumber = textDecoder$1.decode(dataView);
                console.log({ serialNumber });
                // will only be used for node.js
                break;
            default:
                throw Error(`uncaught messageType ${messageType}`);
        }
    }
}

const _console$k = createConsole("InformationManager", { log: true });

/** @typedef {"leftInsole" | "rightInsole"} DeviceType */
/** @typedef {"left" | "right"} InsoleSide */

/**
 * @typedef { "getMtu" |
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
 * @typedef InformationManagerEvent
 * @type {Object}
 * @property {Device} target
 * @property {InformationManagerEventType} type
 * @property {Object} message
 */

class InformationManager {
    // MESSAGE TYPES

    /** @type {InformationMessageType[]} */
    static #MessageTypes = ["getMtu", "getName", "setName", "getType", "setType", "getCurrentTime", "setCurrentTime"];
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

    /** @type {string?} */
    #name;
    get name() {
        return this.#name;
    }

    /** @param {string} updatedName */
    updateName(updatedName) {
        _console$k.assertTypeWithError(updatedName, "string");
        this.#name = updatedName;
        _console$k.log({ updatedName: this.#name });
        this.#dispatchEvent({ type: "getName", message: { name: this.#name } });
    }
    static get MinNameLength() {
        return 2;
    }
    get minNameLength() {
        return Device.MinNameLength;
    }
    static get MaxNameLength() {
        return 30;
    }
    get maxNameLength() {
        return Device.MaxNameLength;
    }
    /** @param {string} newName */
    async setName(newName) {
        _console$k.assertTypeWithError(newName, "string");
        _console$k.assertWithError(
            newName.length >= this.minNameLength,
            `name must be greater than ${this.minNameLength} characters long ("${newName}" is ${newName.length} characters long)`
        );
        _console$k.assertWithError(
            newName.length < this.maxNameLength,
            `name must be less than ${this.maxNameLength} characters long ("${newName}" is ${newName.length} characters long)`
        );
        const setNameData = textEncoder.encode(newName);
        _console$k.log({ setNameData });

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
    /** @type {DeviceType?} */
    #type;
    get type() {
        return this.#type;
    }
    get typeEnum() {
        return InformationManager.Types.indexOf(this.type);
    }
    /** @param {DeviceType} type */
    #assertValidDeviceType(type) {
        _console$k.assertEnumWithError(type, this.#types);
    }
    /** @param {number} typeEnum */
    #assertValidDeviceTypeEnum(typeEnum) {
        _console$k.assertTypeWithError(typeEnum, "number");
        _console$k.assertWithError(this.#types[typeEnum], `invalid typeEnum ${typeEnum}`);
    }
    /** @param {DeviceType} updatedType */
    updateType(updatedType) {
        this.#assertValidDeviceType(updatedType);
        if (updatedType == this.type) {
            _console$k.log("redundant type assignment");
            return;
        }
        this.#type = updatedType;
        _console$k.log({ updatedType: this.#type });

        this.#dispatchEvent({ type: "getType", message: { type: this.#type } });
    }
    /** @param {number} newTypeEnum */
    async #setTypeEnum(newTypeEnum) {
        this.#assertValidDeviceTypeEnum(newTypeEnum);
        const setTypeData = Uint8Array.from([newTypeEnum]);
        _console$k.log({ setTypeData });
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
        _console$k.assertTypeWithError(newMtu, "number");
        if (this.#mtu == newMtu) {
            _console$k.log("redundant mtu assignment", newMtu);
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
        _console$k.log({ currentTime });
        this.#isCurrentTimeSet = currentTime != 0;
        if (!this.#isCurrentTimeSet) {
            this.#setCurrentTime();
        }
    }
    async #setCurrentTime() {
        _console$k.log("setting current time...");
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
        _console$k.log({ messageType });

        switch (messageType) {
            case "getName":
            case "setName":
                const name = textDecoder$1.decode(dataView);
                _console$k.log({ name });
                this.updateName(name);
                break;
            case "getType":
            case "setType":
                const typeEnum = dataView.getUint8(0);
                const type = this.#types[typeEnum];
                _console$k.log({ typeEnum, type });
                this.updateType(type);
                break;
            case "getMtu":
                const mtu = dataView.getUint16(0, true);
                _console$k.log({ mtu });
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

const _console$j = createConsole("VibrationManager");

/** @typedef {"front" | "rear"} VibrationLocation */
/** @typedef {"waveformEffect" | "waveform"} VibrationType */


/**
 * @typedef VibrationWaveformEffectSegment
 * use either effect or delay but not both (defaults to effect if both are defined)
 * @type {Object}
 * @property {VibrationWaveformEffect?} effect
 * @property {number?} delay (ms int ranging [0, 1270])
 * @property {number?} loopCount how many times each segment should loop (int ranging [0, 3])
 */

/**
 * @typedef VibrationWaveformSegment
 * @type {Object}
 * @property {number} duration ms int ranging [0, 2550]
 * @property {number} amplitude float ranging [0, 1]
 */

/** @typedef { "triggerVibration" } VibrationMessageType */

/**
 * @typedef VibrationWaveformEffectConfiguration
 * @type {Object}
 * @property {VibrationWaveformEffectSegment[]} segments
 * @property {number?} loopCount how many times the entire sequence should loop (int ranging [0, 6])
 */


/**
 * @typedef VibrationWaveformConfiguration
 * @type {Object}
 * @property {VibrationWaveformSegment[]} segments
 */

/**
 * @typedef VibrationConfiguration
 * @type {Object}
 * @property {VibrationLocation[]} locations
 * @property {VibrationType} type
 * @property {VibrationWaveformEffectConfiguration?} waveformEffect use if type is "waveformEffect"
 * @property {VibrationWaveformConfiguration?} waveform use if type is "waveform"
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
        _console$j.assertTypeWithError(location, "string");
        _console$j.assertWithError(this.locations.includes(location), `invalid location "${location}"`);
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
        _console$j.log({ locationsBitmask });
        _console$j.assertWithError(locationsBitmask > 0, `locationsBitmask must not be zero`);
        return locationsBitmask;
    }

    /** @param {any[]} array */
    #assertNonEmptyArray(array) {
        _console$j.assertWithError(Array.isArray(array), "passed non-array");
        _console$j.assertWithError(array.length > 0, "passed empty array");
    }

    static get WaveformEffects() {
        return VibrationWaveformEffects;
    }
    get waveformEffects() {
        return VibrationManager.WaveformEffects;
    }
    /** @param {VibrationWaveformEffect} waveformEffect */
    #verifyWaveformEffect(waveformEffect) {
        _console$j.assertWithError(
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
            _console$j.assertWithError(delay >= 0, `delay must be 0ms or greater (got ${delay})`);
            _console$j.assertWithError(
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
        _console$j.assertTypeWithError(waveformEffectSegmentLoopCount, "number");
        _console$j.assertWithError(
            waveformEffectSegmentLoopCount >= 0,
            `waveformEffectSegmentLoopCount must be 0 or greater (got ${waveformEffectSegmentLoopCount})`
        );
        _console$j.assertWithError(
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
        _console$j.assertWithError(
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
        _console$j.assertTypeWithError(waveformEffectSequenceLoopCount, "number");
        _console$j.assertWithError(
            waveformEffectSequenceLoopCount >= 0,
            `waveformEffectSequenceLoopCount must be 0 or greater (got ${waveformEffectSequenceLoopCount})`
        );
        _console$j.assertWithError(
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
        _console$j.assertTypeWithError(waveformSegment.amplitude, "number");
        _console$j.assertWithError(
            waveformSegment.amplitude >= 0,
            `amplitude must be 0 or greater (got ${waveformSegment.amplitude})`
        );
        _console$j.assertWithError(
            waveformSegment.amplitude <= 1,
            `amplitude must be 1 or less (got ${waveformSegment.amplitude})`
        );

        _console$j.assertTypeWithError(waveformSegment.duration, "number");
        _console$j.assertWithError(
            waveformSegment.duration > 0,
            `duration must be greater than 0ms (got ${waveformSegment.duration}ms)`
        );
        _console$j.assertWithError(
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
        _console$j.assertWithError(
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
     * @param {number?} waveformEffectSequenceLoopCount how many times the entire sequence should loop (int ranging [0, 6])
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
        _console$j.log({ dataArray, dataView });
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
        _console$j.log({ dataView });
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
        _console$j.assertTypeWithError(vibrationType, "string");
        _console$j.assertWithError(this.#types.includes(vibrationType), `invalid vibrationType "${vibrationType}"`);
    }

    /**
     * @param {VibrationLocation[]} locations
     * @param {VibrationType} vibrationType
     * @param {DataView} dataView
     */
    #createData(locations, vibrationType, dataView) {
        _console$j.assertWithError(dataView?.byteLength > 0, "no data received");
        const locationsBitmask = this.#createLocationsBitmask(locations);
        this.#verifyVibrationType(vibrationType);
        const vibrationTypeIndex = this.#types.indexOf(vibrationType);
        _console$j.log({ locationsBitmask, vibrationTypeIndex, dataView });
        const data = concatenateArrayBuffers(locationsBitmask, vibrationTypeIndex, dataView.byteLength, dataView);
        _console$j.log({ data });
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
            _console$j.log({ type, dataView });
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

const _console$i = createConsole("BaseConnectionManager", { log: true });










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
 * @typedef TxMessage
 * @type {Object}
 * @property {TxRxMessageType} type
 * @property {ArrayBuffer?} data
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
        _console$i.assertEnumWithError(messageType, this.#TxRxMessageTypes);
    }

    // ID

    /** @type {string?} */
    get id() {
        this.#throwNotImplementedError("id");
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
        _console$i.assertWithError(this.isSupported, `${this.constructor.name} is not supported`);
    }

    /** @throws {Error} if abstract class */
    #assertIsSubclass() {
        _console$i.assertWithError(
            this.constructor != BaseConnectionManager,
            `${this.constructor.name} must be subclassed`
        );
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
        _console$i.assertEnumWithError(newConnectionStatus, this.#statuses);
        if (this.#status == newConnectionStatus) {
            _console$i.log(`tried to assign same connection status "${newConnectionStatus}"`);
            return;
        }
        _console$i.log(`new connection status "${newConnectionStatus}"`);
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
        _console$i.assertWithError(!this.isConnected, "device is already connected");
    }
    /** @throws {Error} if connecting */
    #assertIsNotConnecting() {
        _console$i.assertWithError(this.status != "connecting", "device is already connecting");
    }
    /** @throws {Error} if not connected */
    #assertIsConnected() {
        _console$i.assertWithError(this.isConnected, "device is not connected");
    }
    /** @throws {Error} if disconnecting */
    #assertIsNotDisconnecting() {
        _console$i.assertWithError(this.status != "disconnecting", "device is already disconnecting");
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
        _console$i.assert(this.canReconnect, "unable to reconnect");
    }
    async disconnect() {
        this.#assertIsConnected();
        this.#assertIsNotDisconnecting();
        this.status = "disconnecting";
        _console$i.log("disconnecting from device...");
    }

    /** @param {ArrayBuffer} data */
    async sendSmpMessage(data) {
        this.#assertIsConnectedAndNotDisconnecting();
        _console$i.log("sending smp message", data);
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

        _console$i.log("sendTxMessages", this.#pendingMessages.slice());

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
                _console$i.log({ arrayBufferCount, arrayBuffersToSend });

                const arrayBuffer = concatenateArrayBuffers(...arrayBuffersToSend);
                _console$i.log("sending arrayBuffer", arrayBuffer);
                await this.sendTxData(arrayBuffer);
            }
        } else {
            const arrayBuffer = concatenateArrayBuffers(...arrayBuffers);
            _console$i.log("sending arrayBuffer", arrayBuffer);
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
        _console$i.log("sendTxData", data);
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
        _console$i.log({ messageType, dataView });
        this.onMessageReceived?.(messageType, dataView);
    }

    #timer = new Timer(this.#checkConnection.bind(this), 5000);
    #checkConnection() {
        //console.log("checking connection...");
        if (!this.isConnected) {
            _console$i.log("timer detected disconnection");
            this.status = "not connected";
        }
    }
}

const _console$h = createConsole("bluetoothUUIDs", { log: false });

if (isInNode) {
    const webbluetooth = require("webbluetooth");
    var BluetoothUUID = webbluetooth.BluetoothUUID;
}
if (isInBrowser) {
    var BluetoothUUID = window.BluetoothUUID;
}

/**
 * @param {string} value
 * @returns {BluetoothServiceUUID}
 */
function generateBluetoothUUID(value) {
    _console$h.assertTypeWithError(value, "string");
    _console$h.assertWithError(value.length == 4, "value must be 4 characters long");
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

const _console$g = createConsole("BluetoothConnectionManager", { log: true });









class BluetoothConnectionManager extends BaseConnectionManager {
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
        _console$g.log("writeCharacteristic", ...arguments);
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

const _console$f = createConsole("WebBluetoothConnectionManager", { log: true });








if (isInNode) {
    const webbluetooth = require("webbluetooth");
    const { bluetooth } = webbluetooth;
    var navigator$1 = { bluetooth };
}
if (isInBrowser) {
    var navigator$1 = window.navigator;
}

class WebBluetoothConnectionManager extends BluetoothConnectionManager {
    get id() {
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
            _console$f.log("tried to assign the same BluetoothDevice");
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

            _console$f.log("got BluetoothDevice");
            this.device = device;

            _console$f.log("connecting to device...");
            const server = await this.device.gatt.connect();
            _console$f.log(`connected to device? ${server.connected}`);

            await this.#getServicesAndCharacteristics();

            _console$f.log("fully connected");

            this.status = "connected";
        } catch (error) {
            _console$f.error(error);
            this.status = "not connected";
            this.server?.disconnect();
            this.#removeEventListeners();
        }
    }
    async #getServicesAndCharacteristics() {
        this.#removeEventListeners();

        _console$f.log("getting services...");
        const services = await this.server.getPrimaryServices();
        _console$f.log("got services", services.length);
        await this.server.getPrimaryService("8d53dc1d-1db7-4cd3-868b-8a527460aa84");

        _console$f.log("getting characteristics...");
        for (const serviceIndex in services) {
            const service = services[serviceIndex];
            _console$f.log({ service });
            const serviceName = getServiceNameFromUUID(service.uuid);
            _console$f.assertWithError(serviceName, `no name found for service uuid "${service.uuid}"`);
            _console$f.log(`got "${serviceName}" service`);
            service._name = serviceName;
            this.#services.set(serviceName, service);
            _console$f.log(`getting characteristics for "${serviceName}" service`);
            const characteristics = await service.getCharacteristics();
            _console$f.log(`got characteristics for "${serviceName}" service`);
            for (const characteristicIndex in characteristics) {
                const characteristic = characteristics[characteristicIndex];
                _console$f.log({ characteristic });
                const characteristicName = getCharacteristicNameFromUUID(characteristic.uuid);
                _console$f.assertWithError(
                    characteristicName,
                    `no name found for characteristic uuid "${characteristic.uuid}" in "${serviceName}" service`
                );
                _console$f.log(`got "${characteristicName}" characteristic in "${serviceName}" service`);
                characteristic._name = characteristicName;
                this.#characteristics.set(characteristicName, characteristic);
                addEventListeners(characteristic, this.#boundBluetoothCharacteristicEventListeners);
                const characteristicProperties =
                    characteristic.properties || getCharacteristicProperties(characteristicName);
                if (characteristicProperties.notify) {
                    _console$f.log(`starting notifications for "${characteristicName}" characteristic`);
                    await characteristic.startNotifications();
                }
                if (characteristicProperties.read) {
                    _console$f.log(`reading "${characteristicName}" characteristic...`);
                    await characteristic.readValue();
                    if (isInBluefy || isInWebBLE) {
                        this.#onCharacteristicValueChanged(characteristic);
                    }
                }
            }
        }
    }
    #removeEventListeners() {
        if (this.device) {
            removeEventListeners(this.device, this.#boundBluetoothDeviceEventListeners);
        }
        this.#characteristics.forEach((characteristic) => {
            removeEventListeners(characteristic, this.#boundBluetoothCharacteristicEventListeners);
        });
    }
    async disconnect() {
        await super.disconnect();
        this.server?.disconnect();
        this.#removeEventListeners();
        this.status = "not connected";
    }

    /** @param {Event} event */
    #onCharacteristicvaluechanged(event) {
        _console$f.log("oncharacteristicvaluechanged");

        /** @type {BluetoothRemoteGATTCharacteristic} */
        const characteristic = event.target;

        this.#onCharacteristicValueChanged(characteristic);
    }

    /** @param {BluetoothRemoteGATTCharacteristic} characteristic */
    #onCharacteristicValueChanged(characteristic) {
        _console$f.log("onCharacteristicValue");

        /** @type {BluetoothCharacteristicName} */
        const characteristicName = characteristic._name;
        _console$f.assertWithError(
            characteristicName,
            `no name found for characteristic with uuid "${characteristic.uuid}"`
        );

        _console$f.log(`oncharacteristicvaluechanged for "${characteristicName}" characteristic`);
        const dataView = characteristic.value;
        _console$f.assertWithError(dataView, `no data found for "${characteristicName}" characteristic`);
        _console$f.log(`data for "${characteristicName}" characteristic`, Array.from(new Uint8Array(dataView.buffer)));

        this.onCharacteristicValueChanged(characteristicName, dataView);
    }

    /**
     * @param {BluetoothCharacteristicName} characteristicName
     * @param {ArrayBuffer} data
     */
    async writeCharacteristic(characteristicName, data) {
        super.writeCharacteristic(...arguments);

        const characteristic = this.#characteristics.get(characteristicName);
        _console$f.assertWithError(characteristic, `${characteristicName} characteristic not found`);
        _console$f.log("writing characteristic", characteristic, data);
        const characteristicProperties = characteristic.properties || getCharacteristicProperties(characteristicName);
        if (characteristicProperties.writeWithoutResponse) {
            _console$f.log("writing without response");
            await characteristic.writeValueWithoutResponse(data);
        } else {
            _console$f.log("writing with response");
            await characteristic.writeValueWithResponse(data);
        }
        _console$f.log("wrote characteristic");

        if (characteristicProperties.read && !characteristicProperties.notify) {
            _console$f.log("reading value after write...");
            await characteristic.readValue();
            if (isInBluefy || isInWebBLE) {
                this.#onCharacteristicValueChanged(characteristic);
            }
        }
    }

    /** @param {Event} event */
    #onGattserverdisconnected(event) {
        _console$f.log("gattserverdisconnected");
        this.status = "not connected";
    }

    /** @type {boolean} */
    get canReconnect() {
        return this.server && !this.server.connected;
    }
    async reconnect() {
        await super.reconnect();
        _console$f.log("attempting to reconnect...");
        this.status = "connecting";
        await this.server.connect();
        if (this.isConnected) {
            _console$f.log("successfully reconnected!");
            await this.#getServicesAndCharacteristics();
            this.status = "connected";
        } else {
            _console$f.log("unable to reconnect");
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


const _console$e = createConsole("mcumgr", { log: true });

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
        _console$e.log("mcumgr - message received");
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

        _console$e.log("mcumgr - Process Message - Group: " + group + ", Id: " + id + ", Off: " + data.off);
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
            _console$e.log("downloaded " + this._downloadFileOffset + " bytes of " + this._downloadFileLength);
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

        _console$e.log("mcumgr - _uploadNext: Message Length: " + packet.length);

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
            _console$e.error("Upload is already in progress.");
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
            _console$e.error("Upload is already in progress.");
            return;
        }
        this._uploadIsInProgress = true;
        this._uploadFileOffset = 0;
        this._uploadFile = filebuf;
        this._uploadFilename = destFilename;

        this._uploadFileNext();
    }

    async _uploadFileNext() {
        _console$e.log("uploadFileNext - offset: " + this._uploadFileOffset + ", length: " + this._uploadFile.byteLength);

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

        _console$e.log("mcumgr - _uploadNext: Message Length: " + packet.length);

        this._fileUploadNextCallback({ packet });
    }

    async cmdDownloadFile(filename, destFilename) {
        if (this._downloadIsInProgress) {
            _console$e.error("Download is already in progress.");
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
        _console$e.log("mcumgr - _downloadNext: Message Length: " + packet.length);
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

const _console$d = createConsole("FirmwareManager", { log: true });

/** @typedef {"smp"} FirmwareMessageType */




/** @typedef {FirmwareMessageType | "firmwareImages" | "firmwareUploadProgress" | "firmwareStatus" | "firmwareUploadComplete"} FirmwareManagerEventType */

/** @typedef {"idle" | "uploading" | "uploaded" | "pending" | "testing" | "erasing"} FirmwareStatus */

/**
 * @typedef FirmwareManagerEvent
 * @type {Object}
 * @property {FirmwareManager} target
 * @property {FirmwareManagerEventType} type
 * @property {Object} message
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
     * @param {EventDispatcherOptions} options
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
        _console$d.log({ messageType });

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
        _console$d.log("uploadFirmware", file);

        const promise = this.waitForEvent("firmwareUploadComplete");

        await this.getImages();

        const arrayBuffer = await getFileBuffer(file);
        const imageInfo = await this.#mcuManager.imageInfo(arrayBuffer);
        console.log({ imageInfo });

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
        _console$d.assertEnumWithError(newStatus, FirmwareManager.Statuses);
        if (this.#status == newStatus) {
            _console$d.log(`redundant firmwareStatus assignment "${newStatus}"`);
            return;
        }

        this.#status = newStatus;
        _console$d.log({ firmwareStatus: this.#status });
        this.#dispatchEvent({ type: "firmwareStatus", message: { firmwareStatus: this.#status } });
    }

    // COMMANDS

    /**
     * @typedef FirmwareImage
     * @type {object}
     * @property {number} slot
     * @property {boolean} active
     * @property {boolean} confirmed
     * @property {boolean} pending
     * @property {boolean} permanent
     * @property {boolean} bootable
     * @property {string} version
     * @property {Uint8Array?} hash
     * @property {boolean?} empty
     */

    /** @type {FirmwareImage[]?} */
    #images;
    get images() {
        return this.#images;
    }
    #assertImages() {
        _console$d.assertWithError(this.#images, "didn't get imageState");
    }
    async getImages() {
        const promise = this.waitForEvent("firmwareImages");

        _console$d.log("getting firmware image state...");
        this.sendMessage(Uint8Array.from(this.#mcuManager.cmdImageState()).buffer);

        await promise;
    }

    async testImage() {
        this.#assertImages();
        if (this.#images.length < 2) {
            _console$d.log("image 1 not found");
            return;
        }
        if (this.#images[1].pending == true) {
            _console$d.log("image 1 is already pending");
            return;
        }
        if (this.#images[1].empty) {
            _console$d.log("image 1 is empty");
            return;
        }

        const promise = this.waitForEvent("smp");

        _console$d.log("testing firmware image...");
        this.sendMessage(Uint8Array.from(this.#mcuManager.cmdImageTest(this.#images[1].hash)).buffer);

        await promise;
    }

    async eraseImage() {
        this.#assertImages();
        const promise = this.waitForEvent("smp");

        _console$d.log("erasing image...");
        this.sendMessage(Uint8Array.from(this.#mcuManager.cmdImageErase()).buffer);

        this.#updateStatus("erasing");

        await promise;
        await this.getImages();
    }

    async confirmImage() {
        this.#assertImages();
        if (this.#images[0].confirmed === true) {
            _console$d.log("image 0 is already confirmed");
            return;
        }

        const promise = this.waitForEvent("smp");

        _console$d.log("confirming image...");
        this.sendMessage(Uint8Array.from(this.#mcuManager.cmdImageConfirm(this.#images[0].hash)).buffer);

        await promise;
    }

    /** @param {string} echo */
    async echo(string) {
        _console$d.assertTypeWithError(string, "string");

        const promise = this.waitForEvent("smp");

        _console$d.log("sending echo...");
        this.sendMessage(Uint8Array.from(this.#mcuManager.smpEcho(string)).buffer);

        await promise;
    }

    async reset() {
        const promise = this.waitForEvent("smp");

        _console$d.log("resetting...");
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
        _console$d.log("onMcuMessage", ...arguments);

        switch (group) {
            case constants.MGMT_GROUP_ID_OS:
                switch (id) {
                    case constants.OS_MGMT_ID_ECHO:
                        _console$d.log(`echo "${data.r}"`);
                        break;
                    case constants.OS_MGMT_ID_TASKSTAT:
                        _console$d.table(data.tasks);
                        break;
                    case constants.OS_MGMT_ID_MPSTAT:
                        _console$d.log(data);
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
        _console$d.log("onMcuFileDownloadNext", ...arguments);
    }
    #onMcuFileDownloadProgress() {
        _console$d.log("onMcuFileDownloadProgress", ...arguments);
    }
    #onMcuFileDownloadFinished() {
        _console$d.log("onMcuFileDownloadFinished", ...arguments);
    }

    #onMcuFileUploadNext() {
        _console$d.log("onMcuFileUploadNext", ...arguments);
    }
    #onMcuFileUploadProgress() {
        _console$d.log("onMcuFileUploadProgress", ...arguments);
    }
    #onMcuFileUploadFinished() {
        _console$d.log("onMcuFileUploadFinished", ...arguments);
    }

    #onMcuImageUploadNext({ packet }) {
        _console$d.log("onMcuImageUploadNext", ...arguments);
        this.sendMessage(Uint8Array.from(packet).buffer);
    }
    #onMcuImageUploadProgress({ percentage }) {
        const progress = percentage / 100;
        _console$d.log("onMcuImageUploadProgress", ...arguments);
        this.#dispatchEvent({ type: "firmwareUploadProgress", message: { firmwareUploadProgress: progress } });
    }
    async #onMcuImageUploadFinished() {
        _console$d.log("onMcuImageUploadFinished", ...arguments);

        await this.getImages();

        this.#dispatchEvent({ type: "firmwareUploadProgress", message: { firmwareUploadProgress: 100 } });
        this.#dispatchEvent({ type: "firmwareUploadComplete" });
    }

    #onMcuImageState(data) {
        if (data.images) {
            this.#images = data.images;
            _console$d.log("images", this.#images);
        } else {
            _console$d.log("no images found");
            return;
        }

        /** @type {FirmwareStatus} */
        let newStatus = "idle";

        if (this.#images.length == 2) {
            if (!this.#images[1].bootable) {
                _console$d.warn(
                    'Slot 1 has a invalid image. Click "Erase Image" to erase it or upload a different image'
                );
            } else if (!this.#images[0].confirmed) {
                _console$d.log(
                    'Slot 0 has a valid image. Click "Confirm Image" to confirm it or wait and the device will swap images back.'
                );
                newStatus = "testing";
            } else {
                if (this.#images[1].pending == false) {
                    _console$d.log("Slot 1 has a valid image. run testImage() to test it or upload a different image.");
                    newStatus = "uploaded";
                } else {
                    _console$d.log("reset to upload to the new firmware image");
                    newStatus = "pending";
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

            _console$d.log("Select a firmware upload image to upload to slot 1.");
        }

        this.#updateStatus(newStatus);
        this.#dispatchEvent({ type: "firmwareImages", message: { firmwareImages: this.#images } });
    }
}

const _console$c = createConsole("Device", { log: true });
















/** @typedef {"connectionStatus" | ConnectionStatus | "isConnected" | ConnectionMessageType | DeviceInformationManagerEventType | SensorType | "connectionMessage" | FileTransferManagerEventType | TfliteManagerEventType | FirmwareManagerEventType} DeviceEventType */




/**
 * @typedef DeviceEvent
 * @type {Object}
 * @property {Device} target
 * @property {DeviceEventType} type
 * @property {Object} message
 */
/** @typedef {(event: DeviceEvent) => void} DeviceEventListener */

/** @typedef {"deviceConnected" | "deviceDisconnected" | "deviceIsConnected" | "availableDevices"} StaticDeviceEventType */
/**
 * @typedef StaticDeviceEvent
 * @type {Object}
 * @property {StaticDeviceEventType} type
 * @property {Object} message
 */
/** @typedef {(event: StaticDeviceEvent) => void} StaticDeviceEventListener */

let Device$1 = class Device {
    get id() {
        return this.#connectionManager?.id;
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
     * @param {EventDispatcherOptions} options
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
            _console$c.log("same connectionManager is already assigned");
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
        _console$c.log("assigned new connectionManager", this.#connectionManager);
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
        _console$c.assertWithError(this.isConnected, "not connected");
    }

    /** @type {TxRxMessageType[]} */
    static #RequiredInformationConnectionMessages = [
        "getMtu",

        "getName",
        "getType",
        "getSensorConfiguration",
        "sensorScalars",
        "pressurePositions",
        "getCurrentTime",

        "maxFileLength",
        "getFileLength",
        "getFileChecksum",
        "getFileTransferType",
        "fileTransferStatus",

        "getTfliteName",
        "getTfliteTask",
        "getTfliteSampleRate",
        "getTfliteSensorTypes",
        "tfliteModelIsReady",
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
        _console$c.assertTypeWithError(newReconnectOnDisconnection, "boolean");
        this.#ReconnectOnDisconnection = newReconnectOnDisconnection;
    }

    #reconnectOnDisconnection = Device.ReconnectOnDisconnection;
    get reconnectOnDisconnection() {
        return this.#reconnectOnDisconnection;
    }
    set reconnectOnDisconnection(newReconnectOnDisconnection) {
        _console$c.assertTypeWithError(newReconnectOnDisconnection, "boolean");
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

    /** @param {ConnectionStatus} connectionStatus */
    #onConnectionStatusUpdated(connectionStatus) {
        _console$c.log({ connectionStatus });

        if (connectionStatus == "not connected") {
            //this.#clear();

            if (this.canReconnect && this.reconnectOnDisconnection) {
                _console$c.log("starting reconnect interval...");
                this.#reconnectIntervalId = setInterval(() => {
                    _console$c.log("attempting reconnect...");
                    this.reconnect();
                }, 1000);
            }
        } else {
            if (this.#reconnectIntervalId != undefined) {
                _console$c.log("clearing reconnect interval");
                clearInterval(this.#reconnectIntervalId);
                this.#reconnectIntervalId = undefined;
            }
        }

        this.#checkConnection();

        if (connectionStatus == "connected" && !this.#isConnected) {
            this.#requestRequiredInformation();
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
            this.connectionManager?.isConnected &&
            this.#hasRequiredInformation &&
            this.#informationManager.isCurrentTimeSet;

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
    }

    /**
     * @param {ConnectionMessageType} messageType
     * @param {DataView} dataView
     */
    #onConnectionMessageReceived(messageType, dataView) {
        _console$c.log({ messageType, dataView });
        switch (messageType) {
            case "batteryLevel":
                const batteryLevel = dataView.getUint8(0);
                _console$c.log("received battery level", { batteryLevel });
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

    /** @type {number?} */
    #batteryLevel = null;
    get batteryLevel() {
        return this.#batteryLevel;
    }
    /** @param {number} updatedBatteryLevel */
    #updateBatteryLevel(updatedBatteryLevel) {
        _console$c.assertTypeWithError(updatedBatteryLevel, "number");
        if (this.#batteryLevel == updatedBatteryLevel) {
            _console$c.log(`duplicate batteryLevel assignment ${updatedBatteryLevel}`);
            return;
        }
        this.#batteryLevel = updatedBatteryLevel;
        _console$c.log({ updatedBatteryLevel: this.#batteryLevel });
        this.#dispatchEvent({ type: "batteryLevel", message: { batteryLevel: this.#batteryLevel } });
    }

    // INFORMATION
    #informationManager = new InformationManager();

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
    /** @type {SensorType[]} */
    get sensorTypes() {
        return Object.keys(this.sensorConfiguration);
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

    /** @param {SensorConfiguration} newSensorConfiguration */
    async setSensorConfiguration(newSensorConfiguration) {
        await this.#sensorConfigurationManager.setConfiguration(newSensorConfiguration);
    }

    async clearSensorConfiguration() {
        return this.#sensorConfigurationManager.clearSensorConfiguration();
    }

    static #ClearSensorConfigurationOnLeave = true;
    static get ClearSensorConfigurationOnLeave() {
        return this.#ClearSensorConfigurationOnLeave;
    }
    static set ClearSensorConfigurationOnLeave(newClearSensorConfigurationOnLeave) {
        _console$c.assertTypeWithError(newClearSensorConfigurationOnLeave, "boolean");
        this.#ClearSensorConfigurationOnLeave = newClearSensorConfigurationOnLeave;
    }

    #clearSensorConfigurationOnLeave = Device.ClearSensorConfigurationOnLeave;
    get clearSensorConfigurationOnLeave() {
        return this.#clearSensorConfigurationOnLeave;
    }
    set clearSensorConfigurationOnLeave(newClearSensorConfigurationOnLeave) {
        _console$c.assertTypeWithError(newClearSensorConfigurationOnLeave, "boolean");
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
     * @param  {boolean} sendImmediately
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
    async confirmFirmwareImage() {
        return this.#firmwareManager.confirmImage();
    }
    async testFirmwareImage() {
        return this.#firmwareManager.testImage();
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
        _console$c.assertTypeWithError(newUseLocalStorage, "boolean");
        this.#UseLocalStorage = newUseLocalStorage;
        if (this.#UseLocalStorage && !this.#LocalStorageConfiguration) {
            this.#LoadFromLocalStorage();
        }
    }

    /**
     * @typedef LocalStorageDeviceInformation
     * @type {Object}
     * @property {string} bluetoothId
     * @property {DeviceType} type
     */

    /**
     * @typedef LocalStorageConfiguration
     * @type {Object}
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
        _console$c.assertWithError(isInBrowser, "localStorage is only available in the browser");
        _console$c.assertWithError(window.localStorage, "localStorage not found");
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
            _console$c.log("no info found in localStorage");
            this.#LocalStorageConfiguration = Object.assign({}, this.#DefaultLocalStorageConfiguration);
            this.#SaveToLocalStorage();
            return;
        }
        try {
            const configuration = JSON.parse(localStorageString);
            _console$c.log({ configuration });
            this.#LocalStorageConfiguration = configuration;
            if (this.CanGetDevices) {
                await this.GetDevices(); // redundant?
            }
        } catch (error) {
            _console$c.error(error);
        }
    }

    /** @param {Device} device */
    static #UpdateLocalStorageConfigurationForDevice(device) {
        if (device.connectionType != "webBluetooth") {
            _console$c.log("localStorage is only for webBluetooth devices");
            return;
        }
        this.#AssertLocalStorage();
        const deviceInformationIndex = this.#LocalStorageConfiguration.devices.findIndex((deviceInformation) => {
            return deviceInformation.bluetoothId == device.id;
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
        return isInBrowser && navigator.bluetooth?.getDevices;
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
            _console$c.warn("GetDevices is only available in the browser");
            return;
        }

        if (!navigator.bluetooth) {
            _console$c.warn("bluetooth is not available in this browser");
            return;
        }

        if (!navigator.bluetooth.getDevices) {
            _console$c.warn("bluetooth.getDevices() is not available in this browser");
            return;
        }

        if (!this.#LocalStorageConfiguration) {
            this.#LoadFromLocalStorage();
        }

        const configuration = this.#LocalStorageConfiguration;
        if (!configuration.devices || configuration.devices.length == 0) {
            _console$c.log("no devices found in configuration");
            return;
        }

        const bluetoothDevices = await navigator.bluetooth.getDevices();

        _console$c.log({ bluetoothDevices });

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
            ).find((device) => device.id == bluetoothDevice.id);

            const existingAvailableDevice = this.AvailableDevices.filter(
                (device) => device.connectionType == "webBluetooth"
            ).find((device) => device.id == bluetoothDevice.id);
            if (existingAvailableDevice) {
                if (
                    existingConnectedDevice?.id == existingAvailableDevice.id &&
                    existingConnectedDevice != existingAvailableDevice
                ) {
                    this.AvailableDevices[this.#AvailableDevices.indexOf(existingAvailableDevice)] =
                        existingConnectedDevice;
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
    static #StaticEventTypes = ["deviceConnected", "deviceDisconnected", "deviceIsConnected", "availableDevices"];
    static get StaticEventTypes() {
        return this.#StaticEventTypes;
    }
    static #EventDispatcher = new EventDispatcher(this, this.#StaticEventTypes);

    /**
     * @param {StaticDeviceEventType} type
     * @param {StaticDeviceEventListener} listener
     * @param {EventDispatcherOptions} options
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
                _console$c.log("adding device", device);
                this.#ConnectedDevices.push(device);
                if (this.UseLocalStorage && device.connectionType == "webBluetooth") {
                    const deviceInformation = {
                        type: device.type,
                        bluetoothId: device.id,
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
            } else {
                _console$c.log("device already included");
            }
        } else {
            if (this.#ConnectedDevices.includes(device)) {
                _console$c.log("removing device", device);
                this.#ConnectedDevices.splice(this.#ConnectedDevices.indexOf(device), 1);
                this.#DispatchEvent({ type: "deviceDisconnected", message: { device } });
                this.#DispatchEvent({ type: "deviceIsConnected", message: { device } });
            } else {
                _console$c.log("device already not included");
            }
        }
        if (this.CanGetDevices) {
            this.GetDevices();
        }
        if (device.isConnected && !this.AvailableDevices.includes(device)) {
            const existingAvailableDevice = this.AvailableDevices.find((_device) => _device.id == device.id);
            _console$c.log({ existingAvailableDevice });
            if (existingAvailableDevice) {
                this.AvailableDevices[this.AvailableDevices.indexOf(existingAvailableDevice)] = device;
            } else {
                this.AvailableDevices.push(device);
            }
            this.#DispatchAvailableDevices();
        }
    }

    static #DispatchAvailableDevices() {
        _console$c.log({ AvailableDevices: this.AvailableDevices });
        this.#DispatchEvent({ type: "availableDevices", message: { devices: this.AvailableDevices } });
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
};

const _console$b = createConsole("BaseScanner");



/** @typedef {"isAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice"} ScannerEventType */




/**
 * @typedef ScannerEvent
 * @type {Object}
 * @property {BaseScanner} target
 * @property {ScannerEventType} type
 * @property {Object} message
 */

/**
 * @typedef DiscoveredDevice
 * @type {Object}
 * @property {string} id
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
        _console$b.assertWithError(this.isSupported, `${this.constructor.name} is not supported`);
    }

    // CONSTRUCTOR

    #assertIsSubclass() {
        _console$b.assertWithError(this.constructor != BaseScanner, `${this.constructor.name} must be subclassed`);
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
     * @param {EventDispatcherOptions} options
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
        _console$b.assertWithError(this.isAvailable, "not available");
    }

    // SCANNING
    get isScanning() {
        return false;
    }
    #assertIsScanning() {
        _console$b.assertWithError(this.isScanning, "not scanning");
    }
    #assertIsNotScanning() {
        _console$b.assertWithError(!this.isScanning, "already scanning");
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
            return this.#discoveredDeviceTimestamps[a.id] - this.#discoveredDeviceTimestamps[b.id];
        });
    }
    /** @param {string} discoveredDeviceId */
    #assertValidDiscoveredDeviceId(discoveredDeviceId) {
        _console$b.assertWithError(
            this.#discoveredDevices[discoveredDeviceId],
            `no discovered device with id "${discoveredDeviceId}"`
        );
    }

    /** @param {ScannerEvent} event */
    #onDiscoveredDevice(event) {
        /** @type {DiscoveredDevice} */
        const discoveredDevice = event.message.discoveredDevice;
        this.#discoveredDevices[discoveredDevice.id] = discoveredDevice;
        this.#discoveredDeviceTimestamps[discoveredDevice.id] = Date.now();
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
                _console$b.log("discovered device timeout");
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
        _console$b.log("resetting...");
    }
}

const _console$a = createConsole("NobleConnectionManager", { log: true });

if (isInNode) {
    require("@abandonware/noble");
}







class NobleConnectionManager extends BluetoothConnectionManager {
    get id() {
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
        _console$a.log({ characteristicName });

        const characteristic = this.#characteristics.get(characteristicName);
        _console$a.assertWithError(characteristic, `no characteristic found with name "${characteristicName}"`);
        if (data instanceof DataView) {
            data = data.buffer;
        }
        const buffer = Buffer.from(data);
        _console$a.log("writing data", buffer);
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
        _console$a.assertWithError(characteristic, `no characteristic found with name "${characteristicName}"`);
        // if (data instanceof DataView) {
        //     data = data.buffer;
        // }
        const buffer = Buffer.from(data);
        _console$a.log("writing data", buffer);
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
        _console$a.log("attempting to reconnect...");
        this.connect();
    }

    // NOBLE
    /** @type {noble.Peripheral?} */
    #noblePeripheral;
    get noblePeripheral() {
        return this.#noblePeripheral;
    }
    set noblePeripheral(newNoblePeripheral) {
        _console$a.assertTypeWithError(newNoblePeripheral, "object");
        if (this.noblePeripheral == newNoblePeripheral) {
            _console$a.log("attempted to assign duplicate noblePeripheral");
            return;
        }

        _console$a.log("newNoblePeripheral", newNoblePeripheral.id);

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
        _console$a.log("onNoblePeripheralConnect", noblePeripheral.id, noblePeripheral.state);
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
        _console$a.log("onNoblePeripheralDisconnect", noblePeripheral.id);
        await this.#onNoblePeripheralState();
    }

    async #onNoblePeripheralState() {
        _console$a.log(`noblePeripheral ${this.id} state ${this.#noblePeripheral.state}`);

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
                _console$a.error("noblePeripheral error");
                break;
            default:
                _console$a.log(`uncaught noblePeripheral state ${this.#noblePeripheral.state}`);
                break;
        }
    }

    #removeEventListeners() {
        _console$a.log("removing noblePeripheral eventListeners");
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
        _console$a.log("onNoblePeripheralRssiUpdate", noblePeripheral.id, rssi);
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
        _console$a.log(
            "onNoblePeripheralServicesDiscover",
            noblePeripheral.id,
            services.map((service) => service.uuid)
        );
        for (const index in services) {
            const service = services[index];
            _console$a.log("service", service.uuid);
            const serviceName = getServiceNameFromUUID(service.uuid);
            _console$a.assertWithError(serviceName, `no name found for service uuid "${service.uuid}"`);
            _console$a.log({ serviceName });
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
        _console$a.log(
            "onNobleServiceCharacteristicsDiscover",
            service.uuid,
            characteristics.map((characteristic) => characteristic.uuid)
        );

        for (const index in characteristics) {
            const characteristic = characteristics[index];
            _console$a.log("characteristic", characteristic.uuid);
            const characteristicName = getCharacteristicNameFromUUID(characteristic.uuid);
            _console$a.assertWithError(
                characteristicName,
                `no name found for characteristic uuid "${characteristic.uuid}"`
            );
            _console$a.log({ characteristicName });
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
        _console$a.log("onNobleCharacteristicData", characteristic.uuid, data, isNotification);
        const dataView = new DataView(dataToArrayBuffer(data));

        /** @type {BluetoothCharacteristicName} */
        const characteristicName = characteristic._name;
        _console$a.assertWithError(
            characteristicName,
            `no name found for characteristic with uuid "${characteristic.uuid}"`
        );

        this.onCharacteristicValueChanged(characteristicName, dataView);
    }

    #onNobleCharacteristicWrite() {
        this._connectionManager.onNobleCharacteristicWrite(this);
    }
    /**
     * @param {noble.Characteristic} characteristic
     */
    onNobleCharacteristicWrite(characteristic) {
        _console$a.log("onNobleCharacteristicWrite", characteristic.uuid);
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
        _console$a.log("onNobleCharacteristicNotify", characteristic.uuid, isSubscribed);
    }
}

const _console$9 = createConsole("NobleScanner", { log: true });

let isSupported = false;

if (isInNode) {
    var noble = require("@abandonware/noble");
    isSupported = true;
}

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
        _console$9.assertTypeWithError(newIsScanning, "boolean");
        if (this.isScanning == newIsScanning) {
            _console$9.log("duplicate isScanning assignment");
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
        _console$9.assertTypeWithError(newNobleState, "string");
        if (this.#nobleState == newNobleState) {
            _console$9.log("duplicate nobleState assignment");
            return;
        }
        this.#_nobleState = newNobleState;
        _console$9.log({ newNobleState });
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
        _console$9.log("OnNobleScanStart");
        this.#isScanning = true;
    }
    #onNobleScanStop() {
        _console$9.log("OnNobleScanStop");
        this.#isScanning = false;
    }
    /** @param {NobleState} state */
    #onNobleStateChange(state) {
        _console$9.log("onNobleStateChange", state);
        this.#nobleState = state;
    }
    /** @param {noble.Peripheral} noblePeripheral */
    #onNobleDiscover(noblePeripheral) {
        _console$9.log("onNobleDiscover", noblePeripheral.id);
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
                deviceType = Device$1.Types[deviceTypeEnum];
            }
        }

        /** @type {DiscoveredDevice} */
        const discoveredDevice = {
            name: noblePeripheral.advertisement.localName,
            id: noblePeripheral.id,
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
        const noblePeripheral = this.#noblePeripherals[discoveredDevice.id];
        if (noblePeripheral) {
            // disconnect?
            delete this.#noblePeripherals[discoveredDevice.id];
        }
    }

    // DISCOVERED DEVICES
    /** @type {Object.<string, noble.Peripheral>} */
    #noblePeripherals = {};
    /** @param {string} noblePeripheralId */
    #assertValidNoblePeripheralId(noblePeripheralId) {
        _console$9.assertTypeWithError(noblePeripheralId, "string");
        _console$9.assertWithError(
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
        _console$9.log("connecting to discoveredDevice...", deviceId);

        let device = Device$1.AvailableDevices.filter((device) => device.connectionType == "noble").find(
            (device) => device.id == deviceId
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
        const device = new Device$1();
        const nobleConnectionManager = new NobleConnectionManager();
        nobleConnectionManager.noblePeripheral = noblePeripheral;
        device.connectionManager = nobleConnectionManager;
        return device;
    }
}

const _console$8 = createConsole("Scanner", { log: false });

/** @type {BaseScanner?} */
let scanner;

if (NobleScanner.isSupported) {
    _console$8.log("using NobleScanner");
    scanner = new NobleScanner();
} else {
    _console$8.log("Scanner not available");
}

var Scanner = scanner;

const _console$7 = createConsole("DevicePairPressureSensorDataManager", { log: true });







/**
 * @typedef DevicePairRawPressureData
 * @type {Object}
 * @property {PressureData} left
 * @property {PressureData} right
 */

/**
 * @typedef DevicePairPressureData
 * @type {Object}
 *
 * @property {number} rawSum
 * @property {number} normalizedSum
 *
 * @property {CenterOfPressure?} center
 * @property {CenterOfPressure?} normalizedCenter
 */



class DevicePairPressureSensorDataManager {
    static get Sides() {
        return Device$1.InsoleSides;
    }
    get sides() {
        return Device$1.InsoleSides;
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
        _console$7.log({ pressure, insoleSide });
        this.#rawPressure[insoleSide] = pressure;
        if (this.#hasAllPressureData) {
            return this.#updatePressureData();
        } else {
            _console$7.log("doesn't have all pressure data yet...");
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

        _console$7.log({ devicePairPressure: pressure });

        return pressure;
    }
}

const _console$6 = createConsole("DevicePairSensorDataManager", { log: true });






class DevicePairSensorDataManager {
    static get Sides() {
        return Device$1.InsoleSides;
    }
    get sides() {
        return Device$1.InsoleSides;
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

        _console$6.log({ sensorType, timestamp, event });

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
                _console$6.log(`uncaught sensorType "${sensorType}"`);
                break;
        }

        if (value) {
            const timestamps = Object.assign({}, this.#timestamps[sensorType]);
            this.onDataReceived?.(sensorType, { timestamps, [sensorType]: value });
        } else {
            _console$6.log("no value received");
        }
    }

    /** @type {SensorDataCallback?} */
    onDataReceived;
}

const _console$5 = createConsole("DevicePair", { log: true });







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
 * "deviceBarometer"
 * } DevicePairDeviceSensorEventType
 */
/** @typedef {"pressure"} DevicePairSensorType */
/** @typedef {"isConnected" | DevicePairDeviceEventType | DevicePairDeviceSensorEventType | DevicePairSensorType | "deviceGetSensorConfiguration"} DevicePairEventType */








/**
 * @typedef DevicePairEvent
 * @type {Object}
 * @property {DevicePair} target
 * @property {DevicePairEventType} type
 * @property {Object} message
 */

class DevicePair {
    constructor() {
        this.#sensorDataManager.onDataReceived = this.#onSensorDataReceived.bind(this);
    }

    // EVENT DISPATCHER

    /** @type {DevicePairEventType[]} */
    static #EventTypes = [
        "isConnected",
        "pressure",
        ...Device$1.EventTypes.map((sensorType) => `device${capitalizeFirstCharacter(sensorType)}`),
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
     * @param {EventDispatcherListener} listener
     * @param {EventDispatcherOptions} options
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
     * @param {EventDispatcherListener} listener
     */
    removeEventListener(type, listener) {
        return this.#eventDispatcher.removeEventListener(type, listener);
    }

    // SIDES

    static get Sides() {
        return Device$1.InsoleSides;
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
        _console$5.assertWithError(this.isConnected, "devicePair must be connected");
    }

    /** @param {Device} device */
    assignInsole(device) {
        if (!device.isInsole) {
            _console$5.warn("device is not an insole");
            return;
        }
        const side = device.insoleSide;

        const currentDevice = this[side];

        if (device == currentDevice) {
            _console$5.log("device already assigned");
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

        _console$5.log(`assigned ${side} insole`, device);

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
        _console$5.log({ sensorType, sensorData });
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
        Device$1.AddEventListener("deviceConnected", (event) => {
            /** @type {Device} */
            const device = event.message.device;
            if (device.isInsole) {
                this.#shared.assignInsole(device);
            }
        });
    }
}

const _console$4 = createConsole("ServerUtils", { log: true });

const pingTimeout = 30_000_000;
const reconnectTimeout = 3_000;

// MESSAGING

/** @typedef {Number | Number[] | ArrayBufferLike | DataView} MessageLike */

/**
 * @typedef Message
 * @type {Object}
 * @property {string} type
 * @property {MessageLike|MessageLike[]?} data
 */

/**
 * @param {string[]} enumeration
 * @param  {...(Message|string)} messages
 */
function createMessage(enumeration, ...messages) {
    _console$4.log("createMessage", ...messages);

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

        _console$4.assertEnumWithError(message.type, enumeration);
        const messageTypeEnum = enumeration.indexOf(message.type);

        return concatenateArrayBuffers(
            messageTypeEnum,
            Uint16Array.from([messageDataArrayBufferByteLength]),
            messageDataArrayBuffer
        );
    });
    _console$4.log("messageBuffers", ...messageBuffers);
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
 * @typedef ServerMessage
 * @type {Object}
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
 * @typedef DeviceMessage
 * @type {Object}
 * @property {DeviceEventType} type
 * @property {MessageLike|MessageLike[]?} data
 */

/** @param {...DeviceEventType|DeviceMessage} messages */
function createDeviceMessage(...messages) {
    _console$4.log("createDeviceMessage", ...messages);
    return createMessage(Device$1.EventTypes, ...messages);
}



/**
 * @typedef ClientDeviceMessage
 * @type {Object}
 * @property {ConnectionMessageType} type
 * @property {MessageLike|MessageLike[]?} data
 */

/** @param {...ConnectionMessageType|ClientDeviceMessage} messages */
function createClientDeviceMessage(...messages) {
    return createMessage(BaseConnectionManager.MessageTypes, ...messages);
}

// STATIC MESSAGES

const pingMessage = createServerMessage("ping");
const pongMessage = createServerMessage("pong");
createServerMessage("isScanningAvailable");
createServerMessage("isScanning");
createServerMessage("startScan");
createServerMessage("stopScan");
const discoveredDevicesMessage = createServerMessage("discoveredDevices");

const _console$3 = createConsole("WebSocketClientConnectionManager", { log: true });









class WebSocketClientConnectionManager extends BaseConnectionManager {
    static get isSupported() {
        return isInBrowser;
    }
    /** @type {ConnectionType} */
    static get type() {
        return "webSocketClient";
    }

    /** @type {string?} */
    #id;
    get id() {
        return this.#id;
    }
    set id(newId) {
        _console$3.assertTypeWithError(newId, "string");
        if (this.#id == newId) {
            _console$3.log("redundant id assignment");
            return;
        }
        this.#id = newId;
    }

    #isConnected = false;
    get isConnected() {
        return this.#isConnected;
    }
    set isConnected(newIsConnected) {
        _console$3.assertTypeWithError(newIsConnected, "boolean");
        if (this.#isConnected == newIsConnected) {
            _console$3.log("redundant newIsConnected assignment", newIsConnected);
            return;
        }
        this.#isConnected = newIsConnected;

        this.status = this.#isConnected ? "connected" : "not connected";

        if (this.isConnected) {
            this.#requestDeviceInformation();
        }
    }

    async connect() {
        await super.connect();
        this.sendWebSocketConnectMessage();
    }
    async disconnect() {
        await super.disconnect();
        this.sendWebSocketDisconnectMessage();
    }

    /** @type {boolean} */
    get canReconnect() {
        return true;
    }
    async reconnect() {
        await super.reconnect();
        _console$3.log("attempting to reconnect...");
        this.connect();
    }

    /**
     * @callback SendWebSocketMessageCallback
     * @param {...(ConnectionMessageType|ClientDeviceMessage)} messages
     */

    /** @type {SendWebSocketMessageCallback?} */
    sendWebSocketMessage;
    /** @type {function?} */
    sendWebSocketConnectMessage;
    /** @type {function?} */
    sendWebSocketDisconnectMessage;

    /** @param {ArrayBuffer} data */
    async sendSmpMessage(data) {
        super.sendSmpMessage(...arguments);
        this.sendWebSocketMessage({ type: "smp", data });
    }

    /** @param {ArrayBuffer} data */
    async sendTxData(data) {
        super.sendTxData(...arguments);
        this.sendWebSocketMessage({ type: "tx", data });
    }

    /** @type {ConnectionMessageType[]} */
    static #DeviceInformationMessageTypes = [...DeviceInformationManager.MessageTypes, "batteryLevel"];
    get #deviceInformationMessageTypes() {
        return WebSocketClientConnectionManager.#DeviceInformationMessageTypes;
    }
    #requestDeviceInformation() {
        this.sendWebSocketMessage(...this.#deviceInformationMessageTypes);
    }

    /** @param {DataView} dataView */
    onWebSocketMessage(dataView) {
        _console$3.log({ dataView });
        parseMessage(dataView, Device$1.EventTypes, this.#onWebSocketMessageCallback.bind(this), null, true);
    }

    /**
     * @param {DeviceEventType} messageType
     * @param {DataView} dataView
     */
    #onWebSocketMessageCallback(messageType, dataView) {
        let byteOffset = 0;

        switch (messageType) {
            case "isConnected":
                const isConnected = Boolean(dataView.getUint8(byteOffset++));
                _console$3.log({ isConnected });
                this.isConnected = isConnected;
                break;

            case "rx":
                this.parseRxMessage(dataView);
                break;

            default:
                this.onMessageReceived(messageType, dataView);
                break;
        }
    }
}

const _console$2 = createConsole("WebSocketClient", { log: true });




/** @typedef {"not connected" | "connecting" | "connected" | "disconnecting"} ClientConnectionStatus */
/** @typedef {ClientConnectionStatus | "connectionStatus" |  "isConnected" | "isScanningAvailable" | "isScanning" | "discoveredDevice" | "expiredDiscoveredDevice"} ClientEventType */

/**
 * @typedef ClientEvent
 * @type {Object}
 * @property {WebSocketClient} target
 * @property {ClientEventType} type
 * @property {Object} message
 */



class WebSocketClient {
    // EVENT DISPATCHER

    /** @type {ClientEventType[]} */
    static #EventTypes = [
        "connectionStatus",
        "connecting",
        "connected",
        "disconnecting",
        "not connected",
        "isConnected",
        "isScanningAvailable",
        "isScanning",
        "discoveredDevice",
        "expiredDiscoveredDevice",
    ];
    static get EventTypes() {
        return this.#EventTypes;
    }
    get eventTypes() {
        return WebSocketClient.#EventTypes;
    }
    #eventDispatcher = new EventDispatcher(this, this.eventTypes);

    /**
     * @param {ClientEventType} type
     * @param {EventDispatcherListener} listener
     * @param {EventDispatcherOptions} options
     */
    addEventListener(type, listener, options) {
        this.#eventDispatcher.addEventListener(type, listener, options);
    }

    /**
     * @param {ClientEvent} event
     */
    #dispatchEvent(event) {
        this.#eventDispatcher.dispatchEvent(event);
    }

    /**
     * @param {ClientEventType} type
     * @param {EventDispatcherListener} listener
     */
    removeEventListener(type, listener) {
        return this.#eventDispatcher.removeEventListener(type, listener);
    }

    // WEBSOCKET

    /** @type {WebSocket?} */
    #webSocket;
    get webSocket() {
        return this.#webSocket;
    }
    set webSocket(newWebSocket) {
        if (this.#webSocket == newWebSocket) {
            _console$2.log("redundant webSocket assignment");
            return;
        }

        _console$2.log("assigning webSocket", newWebSocket);

        if (this.#webSocket) {
            removeEventListeners(this.#webSocket, this.#boundWebSocketEventListeners);
        }

        addEventListeners(newWebSocket, this.#boundWebSocketEventListeners);
        this.#webSocket = newWebSocket;

        _console$2.log("assigned webSocket");
    }

    get isConnected() {
        return this.webSocket?.readyState == WebSocket.OPEN;
    }
    #assertConnection() {
        _console$2.assertWithError(this.isConnected, "not connected");
    }

    get isDisconnected() {
        return this.webSocket?.readyState == WebSocket.CLOSED;
    }
    #assertDisconnection() {
        _console$2.assertWithError(this.isDisconnected, "not disconnected");
    }

    /** @param {(string | URL)?} url */
    connect(url = `wss://${location.host}`) {
        if (this.webSocket) {
            this.#assertDisconnection();
        }
        this.#connectionStatus = "connecting";
        this.webSocket = new WebSocket(url);
    }

    disconnect() {
        this.#assertConnection();
        if (this.reconnectOnDisconnection) {
            this.reconnectOnDisconnection = false;
            this.webSocket.addEventListener(
                "close",
                () => {
                    this.reconnectOnDisconnection = true;
                },
                { once: true }
            );
        }
        this.#connectionStatus = "disconnecting";
        this.webSocket.close();
    }

    reconnect() {
        this.#assertDisconnection();
        this.webSocket = new WebSocket(this.webSocket.url);
    }

    /** @param {(string | URL)?} url */
    toggleConnection(url) {
        if (this.isConnected) {
            this.disconnect();
        } else if (this.webSocket) {
            this.reconnect();
        } else {
            this.connect(url);
        }
    }

    static #ReconnectOnDisconnection = true;
    static get ReconnectOnDisconnection() {
        return this.#ReconnectOnDisconnection;
    }
    static set ReconnectOnDisconnection(newReconnectOnDisconnection) {
        _console$2.assertTypeWithError(newReconnectOnDisconnection, "boolean");
        this.#ReconnectOnDisconnection = newReconnectOnDisconnection;
    }

    #reconnectOnDisconnection = WebSocketClient.#ReconnectOnDisconnection;
    get reconnectOnDisconnection() {
        return this.#reconnectOnDisconnection;
    }
    set reconnectOnDisconnection(newReconnectOnDisconnection) {
        _console$2.assertTypeWithError(newReconnectOnDisconnection, "boolean");
        this.#reconnectOnDisconnection = newReconnectOnDisconnection;
    }

    // WEBSOCKET MESSAGING

    

    /** @param  {MessageLike} message */
    #sendWebSocketMessage(message) {
        this.#assertConnection();
        this.#webSocket.send(message);
    }

    
    

    /** @param {...ServerMessage | ServerMessageType} messages */
    #sendServerMessage(...messages) {
        this.#sendWebSocketMessage(createServerMessage(...messages));
    }

    // WEBSOCKET EVENTS

    #boundWebSocketEventListeners = {
        open: this.#onWebSocketOpen.bind(this),
        message: this.#onWebSocketMessage.bind(this),
        close: this.#onWebSocketClose.bind(this),
        error: this.#onWebSocketError.bind(this),
    };

    /** @param {Event} event */
    #onWebSocketOpen(event) {
        _console$2.log("webSocket.open", event);
        this.#pingTimer.start();
        this.#connectionStatus = "connected";
    }
    /** @param {import("ws").MessageEvent} event */
    async #onWebSocketMessage(event) {
        _console$2.log("webSocket.message", event);
        this.#pingTimer.restart();
        const arrayBuffer = await event.data.arrayBuffer();
        const dataView = new DataView(arrayBuffer);
        this.#parseMessage(dataView);
    }
    /** @param {import("ws").CloseEvent} event  */
    #onWebSocketClose(event) {
        _console$2.log("webSocket.close", event);

        this.#connectionStatus = "not connected";

        Object.entries(this.devices).forEach(([id, device]) => {
            /** @type {WebSocketClientConnectionManager} */
            const connectionManager = device.connectionManager;
            connectionManager.isConnected = false;
        });

        this.#pingTimer.stop();
        if (this.#reconnectOnDisconnection) {
            setTimeout(() => {
                this.reconnect();
            }, reconnectTimeout);
        }
    }
    /** @param {Event} event */
    #onWebSocketError(event) {
        _console$2.log("webSocket.error", event);
    }

    // CONNECTION STATUS

    /** @type {ClientConnectionStatus} */
    #_connectionStatus = "not connected";
    get #connectionStatus() {
        return this.#_connectionStatus;
    }
    set #connectionStatus(newConnectionStatus) {
        _console$2.assertTypeWithError(newConnectionStatus, "string");
        _console$2.log({ newConnectionStatus });
        this.#_connectionStatus = newConnectionStatus;

        this.#dispatchEvent({ type: "connectionStatus", message: { connectionStatus: this.connectionStatus } });
        this.#dispatchEvent({ type: this.connectionStatus });

        switch (newConnectionStatus) {
            case "connected":
            case "not connected":
                this.#dispatchEvent({ type: "isConnected", message: { isConnected: this.isConnected } });
                if (this.isConnected) {
                    this.#sendServerMessage("isScanningAvailable", "discoveredDevices", "connectedDevices");
                } else {
                    this.#isScanningAvailable = false;
                    this.#isScanning = false;
                }
                break;
        }
    }
    get connectionStatus() {
        return this.#connectionStatus;
    }

    /** @param {DataView} dataView */
    #parseMessage(dataView) {
        _console$2.log("parseMessage", { dataView });
        parseMessage(dataView, ServerMessageTypes, this.#parseMessageCallback.bind(this), null, true);
    }

    /**
     * @param {ServerMessageType} messageType
     * @param {DataView} dataView
     */
    #parseMessageCallback(messageType, dataView) {
        let byteOffset = 0;

        switch (messageType) {
            case "ping":
                this.#pong();
                break;
            case "pong":
                break;
            case "isScanningAvailable":
                {
                    const isScanningAvailable = Boolean(dataView.getUint8(byteOffset++));
                    _console$2.log({ isScanningAvailable });
                    this.#isScanningAvailable = isScanningAvailable;
                }
                break;
            case "isScanning":
                {
                    const isScanning = Boolean(dataView.getUint8(byteOffset++));
                    _console$2.log({ isScanning });
                    this.#isScanning = isScanning;
                }
                break;
            case "discoveredDevice":
                {
                    const { string: discoveredDeviceString } = parseStringFromDataView(dataView, byteOffset);
                    _console$2.log({ discoveredDeviceString });

                    /** @type {DiscoveredDevice} */
                    const discoveredDevice = JSON.parse(discoveredDeviceString);
                    _console$2.log({ discoveredDevice });

                    this.#onDiscoveredDevice(discoveredDevice);
                }
                break;
            case "expiredDiscoveredDevice":
                {
                    const { string: deviceId } = parseStringFromDataView(dataView, byteOffset);
                    this.#onExpiredDiscoveredDevice(deviceId);
                }
                break;
            case "connectedDevices":
                {
                    if (dataView.byteLength == 0) {
                        break;
                    }
                    const { string: connectedDeviceIdStrings } = parseStringFromDataView(dataView, byteOffset);
                    _console$2.log({ connectedDeviceIdStrings });
                    const connectedDeviceIds = JSON.parse(connectedDeviceIdStrings);
                    _console$2.log({ connectedDeviceIds });
                    this.#onConnectedDeviceIds(connectedDeviceIds);
                }
                break;
            case "deviceMessage":
                {
                    const { string: deviceId, byteOffset: _byteOffset } = parseStringFromDataView(dataView, byteOffset);
                    byteOffset = _byteOffset;
                    const device = this.#devices[deviceId];
                    _console$2.assertWithError(device, `no device found for id ${deviceId}`);
                    /** @type {WebSocketClientConnectionManager} */
                    const connectionManager = device.connectionManager;
                    const _dataView = sliceDataView(dataView, byteOffset);
                    connectionManager.onWebSocketMessage(_dataView);
                }
                break;
            default:
                _console$2.error(`uncaught messageType "${messageType}"`);
                break;
        }
    }

    // PING
    #pingTimer = new Timer(this.#ping.bind(this), pingTimeout);
    #ping() {
        this.#sendServerMessage("ping");
    }
    #pong() {
        this.#sendServerMessage("pong");
    }

    // SCANNING
    #_isScanningAvailable = false;
    get #isScanningAvailable() {
        return this.#_isScanningAvailable;
    }
    set #isScanningAvailable(newIsAvailable) {
        _console$2.assertTypeWithError(newIsAvailable, "boolean");
        this.#_isScanningAvailable = newIsAvailable;
        this.#dispatchEvent({
            type: "isScanningAvailable",
            message: { isScanningAvailable: this.isScanningAvailable },
        });
        if (this.isScanningAvailable) {
            this.#requestIsScanning();
        }
    }
    get isScanningAvailable() {
        return this.#isScanningAvailable;
    }
    #assertIsScanningAvailable() {
        this.#assertConnection();
        _console$2.assertWithError(this.isScanningAvailable, "scanning is not available");
    }
    #requestIsScanningAvailable() {
        this.#sendServerMessage("isScanningAvailable");
    }

    #_isScanning = false;
    get #isScanning() {
        return this.#_isScanning;
    }
    set #isScanning(newIsScanning) {
        _console$2.assertTypeWithError(newIsScanning, "boolean");
        this.#_isScanning = newIsScanning;
        this.#dispatchEvent({ type: "isScanning", message: { isScanning: this.isScanning } });
    }
    get isScanning() {
        return this.#isScanning;
    }
    #requestIsScanning() {
        this.#sendServerMessage("isScanning");
    }

    #assertIsScanning() {
        _console$2.assertWithError(this.isScanning, "is not scanning");
    }
    #assertIsNotScanning() {
        _console$2.assertWithError(!this.isScanning, "is already scanning");
    }

    startScan() {
        this.#assertIsNotScanning();
        this.#sendServerMessage("startScan");
    }
    stopScan() {
        this.#assertIsScanning();
        this.#sendServerMessage("stopScan");
    }
    toggleScan() {
        this.#assertIsScanningAvailable();

        if (this.isScanning) {
            this.stopScan();
        } else {
            this.startScan();
        }
    }

    // PERIPHERALS
    /** @type {Object.<string, DiscoveredDevice>} */
    #discoveredDevices = {};
    get discoveredDevices() {
        return this.#discoveredDevices;
    }

    /** @param {DiscoveredDevice} discoveredDevice */
    #onDiscoveredDevice(discoveredDevice) {
        _console$2.log({ discoveredDevice });
        this.#discoveredDevices[discoveredDevice.id] = discoveredDevice;
        this.#dispatchEvent({ type: "discoveredDevice", message: { discoveredDevice } });
    }
    #requestDiscoveredDevices() {
        this.#sendWebSocketMessage(discoveredDevicesMessage);
    }
    /** @param {string} deviceId */
    #onExpiredDiscoveredDevice(deviceId) {
        _console$2.log({ expiredDeviceId: deviceId });
        const discoveredDevice = this.#discoveredDevices[deviceId];
        if (!discoveredDevice) {
            _console$2.warn(`no discoveredDevice found with id "${deviceId}"`);
            return;
        }
        _console$2.log({ expiredDiscoveredDevice: discoveredDevice });
        delete this.#discoveredDevices[deviceId];
        this.#dispatchEvent({ type: "expiredDiscoveredDevice", message: { discoveredDevice } });
    }

    // DEVICE CONNECTION

    /** @param {string} deviceId */
    connectToDevice(deviceId) {
        return this.#requestConnectionToDevice(deviceId);
    }
    /** @param {string} deviceId */
    #requestConnectionToDevice(deviceId) {
        this.#assertConnection();
        _console$2.assertTypeWithError(deviceId, "string");
        const device = this.#getOrCreateDevice(deviceId);
        device.connect();
        return device;
    }
    /** @param {string} deviceId */
    #sendConnectToDeviceMessage(deviceId) {
        this.#sendWebSocketMessage(this.#createConnectToDeviceMessage(deviceId));
    }
    /** @param {string} deviceId */
    #createConnectToDeviceMessage(deviceId) {
        return createServerMessage({ type: "connectToDevice", data: deviceId });
    }

    /** @param {string} deviceId */
    #createDevice(deviceId) {
        const device = new Device$1();
        const clientConnectionManager = new WebSocketClientConnectionManager();
        clientConnectionManager.id = deviceId;
        clientConnectionManager.sendWebSocketMessage = this.#sendDeviceMessage.bind(this, deviceId);
        clientConnectionManager.sendWebSocketConnectMessage = this.#sendConnectToDeviceMessage.bind(this, deviceId);
        clientConnectionManager.sendWebSocketDisconnectMessage = this.#sendDisconnectFromDeviceMessage.bind(
            this,
            deviceId
        );
        device.connectionManager = clientConnectionManager;
        return device;
    }

    /** @param {string} deviceId */
    #getOrCreateDevice(deviceId) {
        let device = this.#devices[deviceId];
        if (!device) {
            device = this.#createDevice(deviceId);
            this.#devices[deviceId] = device;
        }
        return device;
    }
    /** @param {string[]} deviceIds */
    #onConnectedDeviceIds(deviceIds) {
        _console$2.log({ deviceIds });
        deviceIds.forEach((deviceId) => {
            const device = this.#getOrCreateDevice(deviceId);
            /** @type {WebSocketClientConnectionManager} */
            const connectionManager = device.connectionManager;
            connectionManager.isConnected = true;
        });
    }

    /** @param {string} deviceId */
    disconnectFromDevice(deviceId) {
        this.#requestDisconnectionFromDevice(deviceId);
    }
    /** @param {string} deviceId */
    #requestDisconnectionFromDevice(deviceId) {
        this.#assertConnection();
        _console$2.assertTypeWithError(deviceId, "string");
        const device = this.devices[deviceId];
        _console$2.assertWithError(device, `no device found with id ${deviceId}`);
        device.disconnect();
        return device;
    }
    /** @param {string} deviceId */
    #sendDisconnectFromDeviceMessage(deviceId) {
        this.#sendWebSocketMessage(this.#createDisconnectFromDeviceMessage(deviceId));
    }
    /** @param {string} deviceId */
    #createDisconnectFromDeviceMessage(deviceId) {
        return createServerMessage({ type: "disconnectFromDevice", data: deviceId });
    }

    
    

    /**
     * @param {string} deviceId
     * @param {...(ConnectionMessageType|ClientDeviceMessage)} messages
     */
    #sendDeviceMessage(deviceId, ...messages) {
        this.#sendWebSocketMessage(this.#createDeviceMessage(deviceId, ...messages));
    }

    /**
     * @param {string} deviceId
     * @param {...(ConnectionMessageType|ClientDeviceMessage)} messages
     */
    #createDeviceMessage(deviceId, ...messages) {
        return createServerMessage({
            type: "deviceMessage",
            data: [deviceId, createClientDeviceMessage(...messages)],
        });
    }

    // DEVICES
    /** @type {Object.<string, Device>} */
    #devices = {};
    get devices() {
        return this.#devices;
    }
}

const _console$1 = createConsole("BaseServer", { log: true });











/** @typedef {"clientConnected" | "clientDisconnected"} ServerEventType */
/**
 * @typedef ServerEvent
 * @type {Object}
 * @property {BaseServer} target
 * @property {ServerEventType} type
 * @property {Object} message
 */

class BaseServer {
    /** @throws {Error} if abstract class */
    #assertIsSubclass() {
        _console$1.assertWithError(this.constructor != BaseServer, `${this.constructor.name} must be subclassed`);
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
     * @param {EventDispatcherListener} listener
     * @param {EventDispatcherOptions} options
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
     * @param {EventDispatcherListener} listener
     */
    removeEventListener(type, listener) {
        return this.#eventDispatcher.removeEventListener(type, listener);
    }

    // CONSTRUCTOR

    constructor() {
        this.#assertIsSubclass();

        _console$1.assertWithError(Scanner, "no scanner defined");

        addEventListeners(Scanner, this.#boundScannerListeners);
        addEventListeners(Device$1, this.#boundDeviceClassListeners);
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
        _console$1.assertTypeWithError(newValue, "boolean");
        this.#ClearSensorConfigurationsWhenNoClients = newValue;
    }

    #clearSensorConfigurationsWhenNoClients = BaseServer.#ClearSensorConfigurationsWhenNoClients;
    get clearSensorConfigurationsWhenNoClients() {
        return this.#clearSensorConfigurationsWhenNoClients;
    }
    set clearSensorConfigurationsWhenNoClients(newValue) {
        _console$1.assertTypeWithError(newValue, "boolean");
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
        _console$1.log("onClientConnected");
    }
    /** @param {ServerEvent} event */
    #onClientDisconnected(event) {
        event.message.client;
        _console$1.log("onClientDisconnected");
        if (this.numberOfClients == 0 && this.clearSensorConfigurationsWhenNoClients) {
            Device$1.ConnectedDevices.forEach((device) => {
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
        _console$1.log("broadcasting", message);
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
        return createServerMessage({ type: "isScanningAvailable", data: Scanner.isAvailable });
    }

    /** @param {ScannerEvent} event */
    #onScannerIsScanning(event) {
        this.broadcastMessage(this.#isScanningMessage);
    }
    get #isScanningMessage() {
        return createServerMessage({ type: "isScanning", data: Scanner.isScanning });
    }

    /** @param {ScannerEvent} event */
    #onScannerDiscoveredDevice(event) {
        /** @type {DiscoveredDevice} */
        const discoveredDevice = event.message.discoveredDevice;
        console.log(discoveredDevice);

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
        console.log("expired", discoveredDevice);
        this.broadcastMessage(this.#createExpiredDiscoveredDeviceMessage(discoveredDevice));
    }
    /** @param {DiscoveredDevice} discoveredDevice */
    #createExpiredDiscoveredDeviceMessage(discoveredDevice) {
        return createServerMessage({ type: "expiredDiscoveredDevice", data: discoveredDevice.id });
    }

    get #discoveredDevicesMessage() {
        return createServerMessage(
            ...Scanner.discoveredDevicesArray.map((discoveredDevice) => {
                return { type: "discoveredDevice", data: discoveredDevice };
            })
        );
    }

    get #connectedDevicesMessage() {
        return createServerMessage({
            type: "connectedDevices",
            data: JSON.stringify(Device$1.ConnectedDevices.map((device) => device.id)),
        });
    }

    // DEVICE LISTENERS

    #boundDeviceListeners = {
        connectionMessage: this.#onDeviceConnectionMessage.bind(this),
    };

    /**
     * @param {Device} device
     * @param {DeviceEventType} messageType
     * @param {DataView?} dataView
     * @returns {DeviceMessage}
     */
    #createDeviceMessage(device, messageType, dataView) {
        return { type: messageType, data: dataView || device.latestConnectionMessage.get(messageType) };
    }

    
    

    /** @param {DeviceEvent} deviceEvent */
    #onDeviceConnectionMessage(deviceEvent) {
        const device = deviceEvent.target;
        _console$1.log("onDeviceConnectionMessage", deviceEvent.message);

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
        _console$1.log("onDeviceConnected", device.id);
        addEventListeners(device, this.#boundDeviceListeners);
    }

    /** @param {StaticDeviceEvent} staticDeviceEvent */
    #onDeviceDisconnected(staticDeviceEvent) {
        /** @type {Device} */
        const device = staticDeviceEvent.message.device;
        _console$1.log("onDeviceDisconnected", device.id);
        removeEventListeners(device, this.#boundDeviceListeners);
    }

    /** @param {StaticDeviceEvent} staticDeviceEvent */
    #onDeviceIsConnected(staticDeviceEvent) {
        /** @type {Device} */
        const device = staticDeviceEvent.message.device;
        _console$1.log("onDeviceIsConnected", device.id);
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
            data: [device.id, createDeviceMessage(...messages)],
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
                Scanner.startScan();
                break;
            case "stopScan":
                Scanner.stopScan();
                break;
            case "discoveredDevices":
                context.responseMessages.push(this.#discoveredDevicesMessage);
                break;
            case "connectToDevice":
                {
                    const { string: deviceId } = parseStringFromDataView(dataView);
                    Scanner.connectToDevice(deviceId);
                }
                break;
            case "disconnectFromDevice":
                {
                    const { string: deviceId } = parseStringFromDataView(dataView);
                    const device = Device$1.ConnectedDevices.find((device) => device.id == deviceId);
                    if (!device) {
                        _console$1.error(`no device found with id ${deviceId}`);
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
                    const device = Device$1.ConnectedDevices.find((device) => device.id == deviceId);
                    if (!device) {
                        _console$1.error(`no device found with id ${deviceId}`);
                        break;
                    }
                    const _dataView = new DataView(dataView.buffer, dataView.byteOffset + byteOffset);
                    context.responseMessages.push(this.parseClientDeviceMessage(device, _dataView));
                }
                break;
            default:
                _console$1.error(`uncaught messageType "${messageType}"`);
                break;
        }
    }

    /**
     * @protected
     * @param {Device} device
     * @param {DataView} dataView
     */
    parseClientDeviceMessage(device, dataView) {
        _console$1.log("onDeviceMessage", device.id, dataView);

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

const _console = createConsole("WebSocketServer", { log: true });

if (isInNode) {
    require("ws");
}

class WebSocketServer extends BaseServer {
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
            _console.log("redundant WebSocket assignment");
            return;
        }
        _console.log("assigning server...");

        if (this.#server) {
            _console.log("clearing existing server...");
            removeEventListeners(this.#server, this.#boundServerListeners);
        }

        addEventListeners(newServer, this.#boundServerListeners);
        this.#server = newServer;

        _console.log("assigned server");
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
        _console.log("server.close");
    }
    /** @param {ws.WebSocket} client */
    #onServerConnection(client) {
        _console.log("server.connection");
        client.isAlive = true;
        client.pingClientTimer = new Timer(() => this.#pingClient(client), pingTimeout);
        client.pingClientTimer.start();
        addEventListeners(client, this.#boundClientListeners);
        this.dispatchEvent({ type: "clientConnected", message: { client } });
    }
    /** @param {Error} error */
    #onServerError(error) {
        _console.error(error);
    }
    #onServerHeaders() {
        //_console.log("server.headers");
    }
    #onServerListening() {
        _console.log("server.listening");
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
        _console.log("client.open");
    }
    /** @param {ws.MessageEvent} event */
    #onClientMessage(event) {
        _console.log("client.message");
        const client = event.target;
        client.isAlive = true;
        client.pingClientTimer.restart();
        const dataView = new DataView(dataToArrayBuffer(event.data));
        this.#parseClientMessage(client, dataView);
    }
    /** @param {ws.CloseEvent} event */
    #onClientClose(event) {
        _console.log("client.close");
        const client = event.target;
        client.pingClientTimer.stop();
        removeEventListeners(client, this.#boundClientListeners);
        this.dispatchEvent({ type: "clientDisconnected", message: { client } });
    }
    /** @param {ws.ErrorEvent} event */
    #onClientError(event) {
        _console.log("client.error");
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

/** @typedef {Device} Device */
/** @typedef {DevicePair} DevicePair */

var BS = {
    setAllConsoleLevelFlags,
    setConsoleLevelFlagsForType,
    Device: Device$1,
    DevicePair,
    WebSocketClient,
    WebSocketServer,
    Scanner,
};

module.exports = BS;
