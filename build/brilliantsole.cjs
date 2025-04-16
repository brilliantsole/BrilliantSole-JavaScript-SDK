/**
 * @copyright Zack Qattan 2024
 * @license MIT
 */
'use strict';

var autoBind$1 = require('auto-bind');
var webbluetooth = require('webbluetooth');
var noble = require('@abandonware/noble');

function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n.default = e;
    return Object.freeze(n);
}

var webbluetooth__namespace = /*#__PURE__*/_interopNamespaceDefault(webbluetooth);

function __classPrivateFieldGet(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}
function __classPrivateFieldSet(receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
}
typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

const isInProduction = "__BRILLIANTSOLE__PROD__" == "__BRILLIANTSOLE__PROD__";
const isInDev = "__BRILLIANTSOLE__PROD__" == "__BRILLIANTSOLE__DEV__";
const isInBrowser = typeof window !== "undefined" && typeof window?.document !== "undefined";
const isInNode = typeof process !== "undefined" && process?.versions?.node != null;
const userAgent = (isInBrowser && navigator.userAgent) || "";
let isBluetoothSupported = false;
if (isInBrowser) {
    isBluetoothSupported = Boolean(navigator.bluetooth);
}
else if (isInNode) {
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

var _a$7, _Console_consoles, _Console_levelFlags;
var __console;
if (isInLensStudio) {
    const log = function (...args) {
        Studio.log(args.map((value) => new String(value)).join(","));
    };
    __console = {};
    __console.log = log;
    __console.warn = log.bind(__console, "WARNING");
    __console.error = log.bind(__console, "ERROR");
}
else {
    __console = console;
}
function getCallerFunctionPath() {
    const stack = new Error().stack;
    if (!stack)
        return "";
    const lines = stack.split("\n");
    const callerLine = lines[3] || lines[2];
    const match = callerLine.match(/at (.*?) \(/) || callerLine.match(/at (.*)/);
    if (!match)
        return "";
    const fullFn = match[1].trim();
    return `[${fullFn}]`;
}
function wrapWithLocation(fn) {
    return (...args) => {
        if (isInNode) {
            const functionPath = getCallerFunctionPath();
            fn(functionPath, ...args);
        }
        else {
            fn(...args);
        }
    };
}
if (!__console.assert) {
    const assert = (condition, ...data) => {
        if (!condition) {
            __console.warn(...data);
        }
    };
    __console.assert = assert;
}
if (!__console.table) {
    const table = (...data) => {
        __console.log(...data);
    };
    __console.table = table;
}
function emptyFunction() { }
const log = isInNode
    ? wrapWithLocation(__console.log.bind(__console))
    : __console.log.bind(__console);
const warn = isInNode
    ? wrapWithLocation(__console.warn.bind(__console))
    : __console.warn.bind(__console);
const error = isInNode
    ? wrapWithLocation(__console.error.bind(__console))
    : __console.error.bind(__console);
const table = isInNode
    ? wrapWithLocation(__console.table.bind(__console))
    : __console.table.bind(__console);
const assert = __console.assert.bind(__console);
class Console {
    constructor(type) {
        _Console_levelFlags.set(this, {
            log: isInDev,
            warn: isInDev,
            assert: true,
            error: true,
            table: true,
        });
        if (__classPrivateFieldGet(_a$7, _a$7, "f", _Console_consoles)[type]) {
            throw new Error(`"${type}" console already exists`);
        }
        __classPrivateFieldGet(_a$7, _a$7, "f", _Console_consoles)[type] = this;
    }
    setLevelFlags(levelFlags) {
        Object.assign(__classPrivateFieldGet(this, _Console_levelFlags, "f"), levelFlags);
    }
    static setLevelFlagsForType(type, levelFlags) {
        if (!__classPrivateFieldGet(this, _a$7, "f", _Console_consoles)[type]) {
            throw new Error(`no console found with type "${type}"`);
        }
        __classPrivateFieldGet(this, _a$7, "f", _Console_consoles)[type].setLevelFlags(levelFlags);
    }
    static setAllLevelFlags(levelFlags) {
        for (const type in __classPrivateFieldGet(this, _a$7, "f", _Console_consoles)) {
            __classPrivateFieldGet(this, _a$7, "f", _Console_consoles)[type].setLevelFlags(levelFlags);
        }
    }
    static create(type, levelFlags) {
        const console = __classPrivateFieldGet(this, _a$7, "f", _Console_consoles)[type] || new _a$7(type);
        return console;
    }
    get log() {
        return __classPrivateFieldGet(this, _Console_levelFlags, "f").log ? log : emptyFunction;
    }
    get warn() {
        return __classPrivateFieldGet(this, _Console_levelFlags, "f").warn ? warn : emptyFunction;
    }
    get error() {
        return __classPrivateFieldGet(this, _Console_levelFlags, "f").error ? error : emptyFunction;
    }
    get assert() {
        return __classPrivateFieldGet(this, _Console_levelFlags, "f").assert ? assert : emptyFunction;
    }
    get table() {
        return __classPrivateFieldGet(this, _Console_levelFlags, "f").table ? table : emptyFunction;
    }
    assertWithError(condition, message) {
        if (!Boolean(condition)) {
            throw new Error(message);
        }
    }
    assertTypeWithError(value, type) {
        this.assertWithError(typeof value == type, `value ${value} of type "${typeof value}" not of type "${type}"`);
    }
    assertEnumWithError(value, enumeration) {
        this.assertWithError(enumeration.includes(value), `invalid enum "${value}"`);
    }
    assertRangeWithError(name, value, min, max) {
        this.assertWithError(value >= min && value <= max, `${name} ${value} must be within ${min}-${max}`);
    }
}
_a$7 = Console, _Console_levelFlags = new WeakMap();
_Console_consoles = { value: {} };
function createConsole(type, levelFlags) {
    return Console.create(type, levelFlags);
}
function setConsoleLevelFlagsForType(type, levelFlags) {
    Console.setLevelFlagsForType(type, levelFlags);
}
function setAllConsoleLevelFlags(levelFlags) {
    Console.setAllLevelFlags(levelFlags);
}

const _console$C = createConsole("EventDispatcher", { log: false });
class EventDispatcher {
    constructor(target, validEventTypes) {
        this.target = target;
        this.validEventTypes = validEventTypes;
        this.listeners = {};
        this.addEventListener = this.addEventListener.bind(this);
        this.removeEventListener = this.removeEventListener.bind(this);
        this.removeEventListeners = this.removeEventListeners.bind(this);
        this.removeAllEventListeners = this.removeAllEventListeners.bind(this);
        this.dispatchEvent = this.dispatchEvent.bind(this);
        this.waitForEvent = this.waitForEvent.bind(this);
    }
    isValidEventType(type) {
        return this.validEventTypes.includes(type);
    }
    updateEventListeners(type) {
        if (!this.listeners[type])
            return;
        this.listeners[type] = this.listeners[type].filter((listenerObj) => {
            if (listenerObj.shouldRemove) {
                _console$C.log(`removing "${type}" eventListener`, listenerObj);
            }
            return !listenerObj.shouldRemove;
        });
    }
    addEventListener(type, listener, options = { once: false }) {
        if (!this.isValidEventType(type)) {
            throw new Error(`Invalid event type: ${type}`);
        }
        if (!this.listeners[type]) {
            this.listeners[type] = [];
            _console$C.log(`creating "${type}" listeners array`, this.listeners[type]);
        }
        const alreadyAdded = this.listeners[type].find((listenerObject) => {
            return listenerObject.listener == listener && listenerObject.once == options.once;
        });
        if (alreadyAdded) {
            _console$C.log("already added listener");
            return;
        }
        _console$C.log(`adding "${type}" listener`, listener, options);
        this.listeners[type].push({ listener, once: options.once });
        _console$C.log(`currently have ${this.listeners[type].length} "${type}" listeners`);
    }
    removeEventListener(type, listener) {
        if (!this.isValidEventType(type)) {
            throw new Error(`Invalid event type: ${type}`);
        }
        if (!this.listeners[type])
            return;
        _console$C.log(`removing "${type}" listener...`, listener);
        this.listeners[type].forEach((listenerObj) => {
            const isListenerToRemove = listenerObj.listener === listener;
            if (isListenerToRemove) {
                _console$C.log(`flagging "${type}" listener`, listener);
                listenerObj.shouldRemove = true;
            }
        });
        this.updateEventListeners(type);
    }
    removeEventListeners(type) {
        if (!this.isValidEventType(type)) {
            throw new Error(`Invalid event type: ${type}`);
        }
        if (!this.listeners[type])
            return;
        _console$C.log(`removing "${type}" listeners...`);
        this.listeners[type] = [];
    }
    removeAllEventListeners() {
        _console$C.log(`removing listeners...`);
        this.listeners = {};
    }
    dispatchEvent(type, message) {
        if (!this.isValidEventType(type)) {
            throw new Error(`Invalid event type: ${type}`);
        }
        if (!this.listeners[type])
            return;
        this.listeners[type].forEach((listenerObj) => {
            if (listenerObj.shouldRemove) {
                return;
            }
            _console$C.log(`dispatching "${type}" listener`, listenerObj);
            listenerObj.listener({ type, target: this.target, message });
            if (listenerObj.once) {
                _console$C.log(`flagging "${type}" listener`, listenerObj);
                listenerObj.shouldRemove = true;
            }
        });
        this.updateEventListeners(type);
    }
    waitForEvent(type) {
        return new Promise((resolve) => {
            const onceListener = (event) => {
                resolve(event);
            };
            this.addEventListener(type, onceListener, { once: true });
        });
    }
}

var _Timer_callback, _Timer_interval, _Timer_intervalId;
const _console$B = createConsole("Timer", { log: false });
class Timer {
    get callback() {
        return __classPrivateFieldGet(this, _Timer_callback, "f");
    }
    set callback(newCallback) {
        _console$B.assertTypeWithError(newCallback, "function");
        _console$B.log({ newCallback });
        __classPrivateFieldSet(this, _Timer_callback, newCallback, "f");
        if (this.isRunning) {
            this.restart();
        }
    }
    get interval() {
        return __classPrivateFieldGet(this, _Timer_interval, "f");
    }
    set interval(newInterval) {
        _console$B.assertTypeWithError(newInterval, "number");
        _console$B.assertWithError(newInterval > 0, "interval must be above 0");
        _console$B.log({ newInterval });
        __classPrivateFieldSet(this, _Timer_interval, newInterval, "f");
        if (this.isRunning) {
            this.restart();
        }
    }
    constructor(callback, interval) {
        _Timer_callback.set(this, void 0);
        _Timer_interval.set(this, void 0);
        _Timer_intervalId.set(this, void 0);
        this.interval = interval;
        this.callback = callback;
    }
    get isRunning() {
        return __classPrivateFieldGet(this, _Timer_intervalId, "f") != undefined;
    }
    start(immediately = false) {
        if (this.isRunning) {
            _console$B.log("interval already running");
            return;
        }
        _console$B.log(`starting interval every ${__classPrivateFieldGet(this, _Timer_interval, "f")}ms`);
        __classPrivateFieldSet(this, _Timer_intervalId, setInterval(__classPrivateFieldGet(this, _Timer_callback, "f"), __classPrivateFieldGet(this, _Timer_interval, "f")), "f");
        if (immediately) {
            __classPrivateFieldGet(this, _Timer_callback, "f").call(this);
        }
    }
    stop() {
        if (!this.isRunning) {
            _console$B.log("interval already not running");
            return;
        }
        _console$B.log("stopping interval");
        clearInterval(__classPrivateFieldGet(this, _Timer_intervalId, "f"));
        __classPrivateFieldSet(this, _Timer_intervalId, undefined, "f");
    }
    restart(startImmediately = false) {
        this.stop();
        this.start(startImmediately);
    }
}
_Timer_callback = new WeakMap(), _Timer_interval = new WeakMap(), _Timer_intervalId = new WeakMap();

createConsole("checksum", { log: false });
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
function crc32(dataIterable) {
    let dataBytes = new Uint8Array(dataIterable);
    let crc = 0;
    for (let i = 0; i < dataBytes.byteLength; ++i) {
        const crcLowByte = crc & 0x000000ff;
        const dataByte = dataBytes[i];
        const tableIndex = crcLowByte ^ dataByte;
        crc = (crc32Table[tableIndex] ^ (crc >>> 8)) >>> 0;
    }
    return crc;
}

var _TextEncoder;
if (typeof TextEncoder == "undefined") {
    _TextEncoder = class {
        encode(string) {
            const encoding = Array.from(string).map((char) => char.charCodeAt(0));
            return Uint8Array.from(encoding);
        }
    };
}
else {
    _TextEncoder = TextEncoder;
}
var _TextDecoder;
if (typeof TextDecoder == "undefined") {
    _TextDecoder = class {
        decode(data) {
            const byteArray = Array.from(new Uint8Array(data));
            return byteArray
                .map((value) => {
                return String.fromCharCode(value);
            })
                .join("");
        }
    };
}
else {
    _TextDecoder = TextDecoder;
}
const textEncoder = new _TextEncoder();
const textDecoder = new _TextDecoder();

const _console$A = createConsole("ArrayBufferUtils", { log: false });
function concatenateArrayBuffers(...arrayBuffers) {
    arrayBuffers = arrayBuffers.filter((arrayBuffer) => arrayBuffer != undefined || arrayBuffer != null);
    arrayBuffers = arrayBuffers.map((arrayBuffer) => {
        if (typeof arrayBuffer == "number") {
            const number = arrayBuffer;
            return Uint8Array.from([Math.floor(number)]);
        }
        else if (typeof arrayBuffer == "boolean") {
            const boolean = arrayBuffer;
            return Uint8Array.from([boolean ? 1 : 0]);
        }
        else if (typeof arrayBuffer == "string") {
            const string = arrayBuffer;
            return stringToArrayBuffer(string);
        }
        else if (arrayBuffer instanceof Array) {
            const array = arrayBuffer;
            return concatenateArrayBuffers(...array);
        }
        else if (arrayBuffer instanceof ArrayBuffer) {
            return arrayBuffer;
        }
        else if ("buffer" in arrayBuffer && arrayBuffer.buffer instanceof ArrayBuffer) {
            const bufferContainer = arrayBuffer;
            return bufferContainer.buffer;
        }
        else if (arrayBuffer instanceof DataView) {
            const dataView = arrayBuffer;
            return dataView.buffer;
        }
        else if (typeof arrayBuffer == "object") {
            const object = arrayBuffer;
            return objectToArrayBuffer(object);
        }
        else {
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
function dataToArrayBuffer(data) {
    return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
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
    _console$A.log({ dataView, begin, end, length });
    return new DataView(dataView.buffer.slice(dataView.byteOffset + begin, end));
}
async function getFileBuffer(file) {
    let fileBuffer;
    if (file instanceof Array) {
        fileBuffer = Uint8Array.from(file);
    }
    else if (file instanceof DataView) {
        fileBuffer = file.buffer;
    }
    else if (typeof file == "string" || file instanceof URL) {
        const response = await fetch(file);
        fileBuffer = await response.arrayBuffer();
    }
    else if (file instanceof File) {
        fileBuffer = await file.arrayBuffer();
    }
    else if (file instanceof ArrayBuffer) {
        fileBuffer = file;
    }
    else {
        throw { error: "invalid file type", file };
    }
    return fileBuffer;
}

var _FileTransferManager_instances, _a$6, _FileTransferManager_dispatchEvent_get, _FileTransferManager_assertValidType, _FileTransferManager_assertValidTypeEnum, _FileTransferManager_assertValidStatusEnum, _FileTransferManager_assertValidCommand, _FileTransferManager_MaxLength, _FileTransferManager_maxLength, _FileTransferManager_parseMaxLength, _FileTransferManager_updateMaxLength, _FileTransferManager_assertValidLength, _FileTransferManager_type, _FileTransferManager_parseType, _FileTransferManager_updateType, _FileTransferManager_setType, _FileTransferManager_length, _FileTransferManager_parseLength, _FileTransferManager_updateLength, _FileTransferManager_setLength, _FileTransferManager_checksum, _FileTransferManager_parseChecksum, _FileTransferManager_updateChecksum, _FileTransferManager_setChecksum, _FileTransferManager_setCommand, _FileTransferManager_status, _FileTransferManager_parseStatus, _FileTransferManager_updateStatus, _FileTransferManager_assertIsIdle, _FileTransferManager_assertIsNotIdle, _FileTransferManager_receivedBlocks, _FileTransferManager_parseBlock, _FileTransferManager_buffer, _FileTransferManager_bytesTransferred, _FileTransferManager_send, _FileTransferManager_sendBlock, _FileTransferManager_parseBytesTransferred, _FileTransferManager_isCancelling, _FileTransferManager_isServerSide;
const _console$z = createConsole("FileTransferManager", { log: false });
const FileTransferMessageTypes = [
    "maxFileLength",
    "getFileType",
    "setFileType",
    "getFileLength",
    "setFileLength",
    "getFileChecksum",
    "setFileChecksum",
    "setFileTransferCommand",
    "fileTransferStatus",
    "getFileBlock",
    "setFileBlock",
    "fileBytesTransferred",
];
const FileTypes = ["tflite", "wifiServerCert", "wifiServerKey"];
const FileTransferStatuses = ["idle", "sending", "receiving"];
const FileTransferCommands = [
    "startSend",
    "startReceive",
    "cancel",
];
const FileTransferDirections = ["sending", "receiving"];
const FileTransferEventTypes = [
    ...FileTransferMessageTypes,
    "fileTransferProgress",
    "fileTransferComplete",
    "fileReceived",
];
class FileTransferManager {
    constructor() {
        _FileTransferManager_instances.add(this);
        _FileTransferManager_maxLength.set(this, _a$6.MaxLength);
        _FileTransferManager_type.set(this, void 0);
        _FileTransferManager_length.set(this, 0);
        _FileTransferManager_checksum.set(this, 0);
        _FileTransferManager_status.set(this, "idle");
        _FileTransferManager_receivedBlocks.set(this, []);
        _FileTransferManager_buffer.set(this, void 0);
        _FileTransferManager_bytesTransferred.set(this, 0);
        _FileTransferManager_isCancelling.set(this, false);
        _FileTransferManager_isServerSide.set(this, false);
        autoBind$1(this);
    }
    get addEventListener() {
        return this.eventDispatcher.addEventListener;
    }
    get removeEventListener() {
        return this.eventDispatcher.removeEventListener;
    }
    get waitForEvent() {
        return this.eventDispatcher.waitForEvent;
    }
    static get MaxLength() {
        return __classPrivateFieldGet(this, _a$6, "f", _FileTransferManager_MaxLength);
    }
    get maxLength() {
        return __classPrivateFieldGet(this, _FileTransferManager_maxLength, "f");
    }
    get type() {
        return __classPrivateFieldGet(this, _FileTransferManager_type, "f");
    }
    get length() {
        return __classPrivateFieldGet(this, _FileTransferManager_length, "f");
    }
    get checksum() {
        return __classPrivateFieldGet(this, _FileTransferManager_checksum, "f");
    }
    get status() {
        return __classPrivateFieldGet(this, _FileTransferManager_status, "f");
    }
    parseMessage(messageType, dataView) {
        _console$z.log({ messageType });
        switch (messageType) {
            case "maxFileLength":
                __classPrivateFieldGet(this, _FileTransferManager_instances, "m", _FileTransferManager_parseMaxLength).call(this, dataView);
                break;
            case "getFileType":
            case "setFileType":
                __classPrivateFieldGet(this, _FileTransferManager_instances, "m", _FileTransferManager_parseType).call(this, dataView);
                break;
            case "getFileLength":
            case "setFileLength":
                __classPrivateFieldGet(this, _FileTransferManager_instances, "m", _FileTransferManager_parseLength).call(this, dataView);
                break;
            case "getFileChecksum":
            case "setFileChecksum":
                __classPrivateFieldGet(this, _FileTransferManager_instances, "m", _FileTransferManager_parseChecksum).call(this, dataView);
                break;
            case "fileTransferStatus":
                __classPrivateFieldGet(this, _FileTransferManager_instances, "m", _FileTransferManager_parseStatus).call(this, dataView);
                break;
            case "getFileBlock":
                __classPrivateFieldGet(this, _FileTransferManager_instances, "m", _FileTransferManager_parseBlock).call(this, dataView);
                break;
            case "fileBytesTransferred":
                __classPrivateFieldGet(this, _FileTransferManager_instances, "m", _FileTransferManager_parseBytesTransferred).call(this, dataView);
                break;
            default:
                throw Error(`uncaught messageType ${messageType}`);
        }
    }
    async send(type, file) {
        __classPrivateFieldGet(this, _FileTransferManager_instances, "m", _FileTransferManager_assertIsIdle).call(this);
        __classPrivateFieldGet(this, _FileTransferManager_instances, "m", _FileTransferManager_assertValidType).call(this, type);
        const fileBuffer = await getFileBuffer(file);
        const promises = [];
        promises.push(__classPrivateFieldGet(this, _FileTransferManager_instances, "m", _FileTransferManager_setType).call(this, type, false));
        const fileLength = fileBuffer.byteLength;
        promises.push(__classPrivateFieldGet(this, _FileTransferManager_instances, "m", _FileTransferManager_setLength).call(this, fileLength, false));
        const checksum = crc32(fileBuffer);
        promises.push(__classPrivateFieldGet(this, _FileTransferManager_instances, "m", _FileTransferManager_setChecksum).call(this, checksum, false));
        promises.push(__classPrivateFieldGet(this, _FileTransferManager_instances, "m", _FileTransferManager_setCommand).call(this, "startSend", false));
        this.sendMessage();
        await Promise.all(promises);
        await __classPrivateFieldGet(this, _FileTransferManager_instances, "m", _FileTransferManager_send).call(this, fileBuffer);
    }
    async receive(type) {
        __classPrivateFieldGet(this, _FileTransferManager_instances, "m", _FileTransferManager_assertIsIdle).call(this);
        __classPrivateFieldGet(this, _FileTransferManager_instances, "m", _FileTransferManager_assertValidType).call(this, type);
        await __classPrivateFieldGet(this, _FileTransferManager_instances, "m", _FileTransferManager_setType).call(this, type);
        await __classPrivateFieldGet(this, _FileTransferManager_instances, "m", _FileTransferManager_setCommand).call(this, "startReceive");
    }
    async cancel() {
        __classPrivateFieldGet(this, _FileTransferManager_instances, "m", _FileTransferManager_assertIsNotIdle).call(this);
        _console$z.log("cancelling file transfer...");
        __classPrivateFieldSet(this, _FileTransferManager_isCancelling, true, "f");
        await __classPrivateFieldGet(this, _FileTransferManager_instances, "m", _FileTransferManager_setCommand).call(this, "cancel");
    }
    get isServerSide() {
        return __classPrivateFieldGet(this, _FileTransferManager_isServerSide, "f");
    }
    set isServerSide(newIsServerSide) {
        if (__classPrivateFieldGet(this, _FileTransferManager_isServerSide, "f") == newIsServerSide) {
            _console$z.log("redundant isServerSide assignment");
            return;
        }
        _console$z.log({ newIsServerSide });
        __classPrivateFieldSet(this, _FileTransferManager_isServerSide, newIsServerSide, "f");
    }
}
_a$6 = FileTransferManager, _FileTransferManager_maxLength = new WeakMap(), _FileTransferManager_type = new WeakMap(), _FileTransferManager_length = new WeakMap(), _FileTransferManager_checksum = new WeakMap(), _FileTransferManager_status = new WeakMap(), _FileTransferManager_receivedBlocks = new WeakMap(), _FileTransferManager_buffer = new WeakMap(), _FileTransferManager_bytesTransferred = new WeakMap(), _FileTransferManager_isCancelling = new WeakMap(), _FileTransferManager_isServerSide = new WeakMap(), _FileTransferManager_instances = new WeakSet(), _FileTransferManager_dispatchEvent_get = function _FileTransferManager_dispatchEvent_get() {
    return this.eventDispatcher.dispatchEvent;
}, _FileTransferManager_assertValidType = function _FileTransferManager_assertValidType(type) {
    _console$z.assertEnumWithError(type, FileTypes);
}, _FileTransferManager_assertValidTypeEnum = function _FileTransferManager_assertValidTypeEnum(typeEnum) {
    _console$z.assertWithError(typeEnum in FileTypes, `invalid typeEnum ${typeEnum}`);
}, _FileTransferManager_assertValidStatusEnum = function _FileTransferManager_assertValidStatusEnum(statusEnum) {
    _console$z.assertWithError(statusEnum in FileTransferStatuses, `invalid statusEnum ${statusEnum}`);
}, _FileTransferManager_assertValidCommand = function _FileTransferManager_assertValidCommand(command) {
    _console$z.assertEnumWithError(command, FileTransferCommands);
}, _FileTransferManager_parseMaxLength = function _FileTransferManager_parseMaxLength(dataView) {
    _console$z.log("parseFileMaxLength", dataView);
    const maxLength = dataView.getUint32(0, true);
    _console$z.log(`maxLength: ${maxLength / 1024}kB`);
    __classPrivateFieldGet(this, _FileTransferManager_instances, "m", _FileTransferManager_updateMaxLength).call(this, maxLength);
}, _FileTransferManager_updateMaxLength = function _FileTransferManager_updateMaxLength(maxLength) {
    _console$z.log({ maxLength });
    __classPrivateFieldSet(this, _FileTransferManager_maxLength, maxLength, "f");
    __classPrivateFieldGet(this, _FileTransferManager_instances, "a", _FileTransferManager_dispatchEvent_get).call(this, "maxFileLength", { maxFileLength: maxLength });
}, _FileTransferManager_assertValidLength = function _FileTransferManager_assertValidLength(length) {
    _console$z.assertWithError(length <= this.maxLength, `file length ${length}kB too large - must be ${this.maxLength}kB or less`);
}, _FileTransferManager_parseType = function _FileTransferManager_parseType(dataView) {
    _console$z.log("parseFileType", dataView);
    const typeEnum = dataView.getUint8(0);
    __classPrivateFieldGet(this, _FileTransferManager_instances, "m", _FileTransferManager_assertValidTypeEnum).call(this, typeEnum);
    const type = FileTypes[typeEnum];
    __classPrivateFieldGet(this, _FileTransferManager_instances, "m", _FileTransferManager_updateType).call(this, type);
}, _FileTransferManager_updateType = function _FileTransferManager_updateType(type) {
    _console$z.log({ fileTransferType: type });
    __classPrivateFieldSet(this, _FileTransferManager_type, type, "f");
    __classPrivateFieldGet(this, _FileTransferManager_instances, "a", _FileTransferManager_dispatchEvent_get).call(this, "getFileType", { fileType: type });
}, _FileTransferManager_setType = async function _FileTransferManager_setType(newType, sendImmediately) {
    __classPrivateFieldGet(this, _FileTransferManager_instances, "m", _FileTransferManager_assertValidType).call(this, newType);
    if (this.type == newType) {
        _console$z.log(`redundant type assignment ${newType}`);
        return;
    }
    const promise = this.waitForEvent("getFileType");
    const typeEnum = FileTypes.indexOf(newType);
    this.sendMessage([{ type: "setFileType", data: Uint8Array.from([typeEnum]).buffer }], sendImmediately);
    await promise;
}, _FileTransferManager_parseLength = function _FileTransferManager_parseLength(dataView) {
    _console$z.log("parseFileLength", dataView);
    const length = dataView.getUint32(0, true);
    __classPrivateFieldGet(this, _FileTransferManager_instances, "m", _FileTransferManager_updateLength).call(this, length);
}, _FileTransferManager_updateLength = function _FileTransferManager_updateLength(length) {
    _console$z.log(`length: ${length / 1024}kB`);
    __classPrivateFieldSet(this, _FileTransferManager_length, length, "f");
    __classPrivateFieldGet(this, _FileTransferManager_instances, "a", _FileTransferManager_dispatchEvent_get).call(this, "getFileLength", { fileLength: length });
}, _FileTransferManager_setLength = async function _FileTransferManager_setLength(newLength, sendImmediately) {
    _console$z.assertTypeWithError(newLength, "number");
    __classPrivateFieldGet(this, _FileTransferManager_instances, "m", _FileTransferManager_assertValidLength).call(this, newLength);
    if (this.length == newLength) {
        _console$z.log(`redundant length assignment ${newLength}`);
        return;
    }
    const promise = this.waitForEvent("getFileLength");
    const dataView = new DataView(new ArrayBuffer(4));
    dataView.setUint32(0, newLength, true);
    this.sendMessage([{ type: "setFileLength", data: dataView.buffer }], sendImmediately);
    await promise;
}, _FileTransferManager_parseChecksum = function _FileTransferManager_parseChecksum(dataView) {
    _console$z.log("checksum", dataView);
    const checksum = dataView.getUint32(0, true);
    __classPrivateFieldGet(this, _FileTransferManager_instances, "m", _FileTransferManager_updateChecksum).call(this, checksum);
}, _FileTransferManager_updateChecksum = function _FileTransferManager_updateChecksum(checksum) {
    _console$z.log({ checksum });
    __classPrivateFieldSet(this, _FileTransferManager_checksum, checksum, "f");
    __classPrivateFieldGet(this, _FileTransferManager_instances, "a", _FileTransferManager_dispatchEvent_get).call(this, "getFileChecksum", { fileChecksum: checksum });
}, _FileTransferManager_setChecksum = async function _FileTransferManager_setChecksum(newChecksum, sendImmediately) {
    _console$z.assertTypeWithError(newChecksum, "number");
    if (this.checksum == newChecksum) {
        _console$z.log(`redundant checksum assignment ${newChecksum}`);
        return;
    }
    const promise = this.waitForEvent("getFileChecksum");
    const dataView = new DataView(new ArrayBuffer(4));
    dataView.setUint32(0, newChecksum, true);
    this.sendMessage([{ type: "setFileChecksum", data: dataView.buffer }], sendImmediately);
    await promise;
}, _FileTransferManager_setCommand = async function _FileTransferManager_setCommand(command, sendImmediately) {
    __classPrivateFieldGet(this, _FileTransferManager_instances, "m", _FileTransferManager_assertValidCommand).call(this, command);
    const promise = this.waitForEvent("fileTransferStatus");
    _console$z.log(`setting command ${command}`);
    const commandEnum = FileTransferCommands.indexOf(command);
    this.sendMessage([
        {
            type: "setFileTransferCommand",
            data: Uint8Array.from([commandEnum]).buffer,
        },
    ], sendImmediately);
    await promise;
}, _FileTransferManager_parseStatus = function _FileTransferManager_parseStatus(dataView) {
    _console$z.log("parseFileStatus", dataView);
    const statusEnum = dataView.getUint8(0);
    __classPrivateFieldGet(this, _FileTransferManager_instances, "m", _FileTransferManager_assertValidStatusEnum).call(this, statusEnum);
    const status = FileTransferStatuses[statusEnum];
    __classPrivateFieldGet(this, _FileTransferManager_instances, "m", _FileTransferManager_updateStatus).call(this, status);
}, _FileTransferManager_updateStatus = function _FileTransferManager_updateStatus(status) {
    _console$z.log({ status });
    __classPrivateFieldSet(this, _FileTransferManager_status, status, "f");
    __classPrivateFieldGet(this, _FileTransferManager_instances, "a", _FileTransferManager_dispatchEvent_get).call(this, "fileTransferStatus", { fileTransferStatus: status });
    __classPrivateFieldGet(this, _FileTransferManager_receivedBlocks, "f").length = 0;
    __classPrivateFieldSet(this, _FileTransferManager_isCancelling, false, "f");
}, _FileTransferManager_assertIsIdle = function _FileTransferManager_assertIsIdle() {
    _console$z.assertWithError(__classPrivateFieldGet(this, _FileTransferManager_status, "f") == "idle", "status is not idle");
}, _FileTransferManager_assertIsNotIdle = function _FileTransferManager_assertIsNotIdle() {
    _console$z.assertWithError(__classPrivateFieldGet(this, _FileTransferManager_status, "f") != "idle", "status is idle");
}, _FileTransferManager_parseBlock = async function _FileTransferManager_parseBlock(dataView) {
    _console$z.log("parseFileBlock", dataView);
    __classPrivateFieldGet(this, _FileTransferManager_receivedBlocks, "f").push(dataView.buffer);
    const bytesReceived = __classPrivateFieldGet(this, _FileTransferManager_receivedBlocks, "f").reduce((sum, arrayBuffer) => (sum += arrayBuffer.byteLength), 0);
    const progress = bytesReceived / __classPrivateFieldGet(this, _FileTransferManager_length, "f");
    _console$z.log(`received ${bytesReceived} of ${__classPrivateFieldGet(this, _FileTransferManager_length, "f")} bytes (${progress * 100}%)`);
    __classPrivateFieldGet(this, _FileTransferManager_instances, "a", _FileTransferManager_dispatchEvent_get).call(this, "fileTransferProgress", { progress });
    if (bytesReceived != __classPrivateFieldGet(this, _FileTransferManager_length, "f")) {
        const dataView = new DataView(new ArrayBuffer(4));
        dataView.setUint32(0, bytesReceived, true);
        if (this.isServerSide) {
            return;
        }
        await this.sendMessage([
            { type: "fileBytesTransferred", data: dataView.buffer },
        ]);
        return;
    }
    _console$z.log("file transfer complete");
    let fileName = new Date().toLocaleString();
    switch (this.type) {
        case "tflite":
            fileName += ".tflite";
            break;
        case "wifiServerCert":
            fileName += "_server.crt";
            break;
        case "wifiServerKey":
            fileName += "_server.key";
            break;
    }
    let file;
    if (typeof File !== "undefined") {
        file = new File(__classPrivateFieldGet(this, _FileTransferManager_receivedBlocks, "f"), fileName);
    }
    else {
        file = new Blob(__classPrivateFieldGet(this, _FileTransferManager_receivedBlocks, "f"));
    }
    const arrayBuffer = await file.arrayBuffer();
    const checksum = crc32(arrayBuffer);
    _console$z.log({ checksum });
    if (checksum != __classPrivateFieldGet(this, _FileTransferManager_checksum, "f")) {
        _console$z.error(`wrong checksum - expected ${__classPrivateFieldGet(this, _FileTransferManager_checksum, "f")}, got ${checksum}`);
        return;
    }
    _console$z.log("received file", file);
    __classPrivateFieldGet(this, _FileTransferManager_instances, "a", _FileTransferManager_dispatchEvent_get).call(this, "getFileBlock", { fileTransferBlock: dataView });
    __classPrivateFieldGet(this, _FileTransferManager_instances, "a", _FileTransferManager_dispatchEvent_get).call(this, "fileTransferComplete", { direction: "receiving" });
    __classPrivateFieldGet(this, _FileTransferManager_instances, "a", _FileTransferManager_dispatchEvent_get).call(this, "fileReceived", { file });
}, _FileTransferManager_send = async function _FileTransferManager_send(buffer) {
    __classPrivateFieldSet(this, _FileTransferManager_buffer, buffer, "f");
    __classPrivateFieldSet(this, _FileTransferManager_bytesTransferred, 0, "f");
    return __classPrivateFieldGet(this, _FileTransferManager_instances, "m", _FileTransferManager_sendBlock).call(this);
}, _FileTransferManager_sendBlock = async function _FileTransferManager_sendBlock() {
    if (this.status != "sending") {
        return;
    }
    if (__classPrivateFieldGet(this, _FileTransferManager_isCancelling, "f")) {
        _console$z.error("not sending block - busy cancelling");
        return;
    }
    if (!__classPrivateFieldGet(this, _FileTransferManager_buffer, "f")) {
        if (!this.isServerSide) {
            _console$z.error("no buffer defined");
        }
        return;
    }
    const buffer = __classPrivateFieldGet(this, _FileTransferManager_buffer, "f");
    let offset = __classPrivateFieldGet(this, _FileTransferManager_bytesTransferred, "f");
    const slicedBuffer = buffer.slice(offset, offset + (this.mtu - 3 - 3));
    _console$z.log("slicedBuffer", slicedBuffer);
    const bytesLeft = buffer.byteLength - offset;
    const progress = 1 - bytesLeft / buffer.byteLength;
    _console$z.log(`sending bytes ${offset}-${offset + slicedBuffer.byteLength} of ${buffer.byteLength} bytes (${progress * 100}%)`);
    __classPrivateFieldGet(this, _FileTransferManager_instances, "a", _FileTransferManager_dispatchEvent_get).call(this, "fileTransferProgress", { progress });
    if (slicedBuffer.byteLength == 0) {
        _console$z.log("finished sending buffer");
        __classPrivateFieldGet(this, _FileTransferManager_instances, "a", _FileTransferManager_dispatchEvent_get).call(this, "fileTransferComplete", { direction: "sending" });
    }
    else {
        await this.sendMessage([{ type: "setFileBlock", data: slicedBuffer }]);
        __classPrivateFieldSet(this, _FileTransferManager_bytesTransferred, offset + slicedBuffer.byteLength, "f");
    }
}, _FileTransferManager_parseBytesTransferred = async function _FileTransferManager_parseBytesTransferred(dataView) {
    _console$z.log("parseBytesTransferred", dataView);
    const bytesTransferred = dataView.getUint32(0, true);
    _console$z.log({ bytesTransferred });
    if (this.status != "sending") {
        _console$z.error(`not currently sending file`);
        return;
    }
    if (!this.isServerSide && __classPrivateFieldGet(this, _FileTransferManager_bytesTransferred, "f") != bytesTransferred) {
        _console$z.error(`bytesTransferred are not equal - got ${bytesTransferred}, expected ${__classPrivateFieldGet(this, _FileTransferManager_bytesTransferred, "f")}`);
        this.cancel();
        return;
    }
    __classPrivateFieldGet(this, _FileTransferManager_instances, "m", _FileTransferManager_sendBlock).call(this);
};
_FileTransferManager_MaxLength = { value: 0 };

const _console$y = createConsole("MathUtils", { log: false });
function getInterpolation(value, min, max, span) {
    if (span == undefined) {
        span = max - min;
    }
    return (value - min) / span;
}
const Uint16Max = 2 ** 16;
function removeLower2Bytes(number) {
    const lower2Bytes = number % Uint16Max;
    return number - lower2Bytes;
}
const timestampThreshold = 60_000;
function parseTimestamp(dataView, byteOffset) {
    const now = Date.now();
    const nowWithoutLower2Bytes = removeLower2Bytes(now);
    const lower2Bytes = dataView.getUint16(byteOffset, true);
    let timestamp = nowWithoutLower2Bytes + lower2Bytes;
    if (Math.abs(now - timestamp) > timestampThreshold) {
        _console$y.log("correcting timestamp delta");
        timestamp += Uint16Max * Math.sign(now - timestamp);
    }
    return timestamp;
}

var _RangeHelper_instances, _RangeHelper_range, _RangeHelper_updateSpan;
const initialRange = { min: Infinity, max: -Infinity, span: 0 };
class RangeHelper {
    constructor() {
        _RangeHelper_instances.add(this);
        _RangeHelper_range.set(this, Object.assign({}, initialRange));
    }
    get min() {
        return __classPrivateFieldGet(this, _RangeHelper_range, "f").min;
    }
    get max() {
        return __classPrivateFieldGet(this, _RangeHelper_range, "f").max;
    }
    set min(newMin) {
        __classPrivateFieldGet(this, _RangeHelper_range, "f").min = newMin;
        __classPrivateFieldGet(this, _RangeHelper_range, "f").max = Math.max(newMin, __classPrivateFieldGet(this, _RangeHelper_range, "f").max);
        __classPrivateFieldGet(this, _RangeHelper_instances, "m", _RangeHelper_updateSpan).call(this);
    }
    set max(newMax) {
        __classPrivateFieldGet(this, _RangeHelper_range, "f").max = newMax;
        __classPrivateFieldGet(this, _RangeHelper_range, "f").min = Math.min(newMax, __classPrivateFieldGet(this, _RangeHelper_range, "f").min);
        __classPrivateFieldGet(this, _RangeHelper_instances, "m", _RangeHelper_updateSpan).call(this);
    }
    reset() {
        Object.assign(__classPrivateFieldGet(this, _RangeHelper_range, "f"), initialRange);
    }
    update(value) {
        __classPrivateFieldGet(this, _RangeHelper_range, "f").min = Math.min(value, __classPrivateFieldGet(this, _RangeHelper_range, "f").min);
        __classPrivateFieldGet(this, _RangeHelper_range, "f").max = Math.max(value, __classPrivateFieldGet(this, _RangeHelper_range, "f").max);
        __classPrivateFieldGet(this, _RangeHelper_instances, "m", _RangeHelper_updateSpan).call(this);
    }
    getNormalization(value, weightByRange) {
        let normalization = getInterpolation(value, __classPrivateFieldGet(this, _RangeHelper_range, "f").min, __classPrivateFieldGet(this, _RangeHelper_range, "f").max, __classPrivateFieldGet(this, _RangeHelper_range, "f").span);
        if (weightByRange) {
            normalization *= __classPrivateFieldGet(this, _RangeHelper_range, "f").span;
        }
        return normalization || 0;
    }
    updateAndGetNormalization(value, weightByRange) {
        this.update(value);
        return this.getNormalization(value, weightByRange);
    }
}
_RangeHelper_range = new WeakMap(), _RangeHelper_instances = new WeakSet(), _RangeHelper_updateSpan = function _RangeHelper_updateSpan() {
    __classPrivateFieldGet(this, _RangeHelper_range, "f").span = __classPrivateFieldGet(this, _RangeHelper_range, "f").max - __classPrivateFieldGet(this, _RangeHelper_range, "f").min;
};

var _CenterOfPressureHelper_range;
class CenterOfPressureHelper {
    constructor() {
        _CenterOfPressureHelper_range.set(this, {
            x: new RangeHelper(),
            y: new RangeHelper(),
        });
    }
    reset() {
        __classPrivateFieldGet(this, _CenterOfPressureHelper_range, "f").x.reset();
        __classPrivateFieldGet(this, _CenterOfPressureHelper_range, "f").y.reset();
    }
    update(centerOfPressure) {
        __classPrivateFieldGet(this, _CenterOfPressureHelper_range, "f").x.update(centerOfPressure.x);
        __classPrivateFieldGet(this, _CenterOfPressureHelper_range, "f").y.update(centerOfPressure.y);
    }
    getNormalization(centerOfPressure, weightByRange) {
        return {
            x: __classPrivateFieldGet(this, _CenterOfPressureHelper_range, "f").x.getNormalization(centerOfPressure.x, weightByRange),
            y: __classPrivateFieldGet(this, _CenterOfPressureHelper_range, "f").y.getNormalization(centerOfPressure.y, weightByRange),
        };
    }
    updateAndGetNormalization(centerOfPressure, weightByRange) {
        this.update(centerOfPressure);
        return this.getNormalization(centerOfPressure, weightByRange);
    }
}
_CenterOfPressureHelper_range = new WeakMap();

function createArray(arrayLength, objectOrCallback) {
    return new Array(arrayLength).fill(1).map((_, index) => {
        if (typeof objectOrCallback == "function") {
            const callback = objectOrCallback;
            return callback(index);
        }
        else {
            const object = objectOrCallback;
            return Object.assign({}, object);
        }
    });
}
function arrayWithoutDuplicates(array) {
    return array.filter((value, index) => array.indexOf(value) == index);
}

var _PressureSensorDataManager_positions, _PressureSensorDataManager_sensorRangeHelpers, _PressureSensorDataManager_normalizedSumRangeHelper, _PressureSensorDataManager_centerOfPressureHelper;
const _console$x = createConsole("PressureDataManager", { log: false });
const PressureSensorTypes = ["pressure"];
const ContinuousPressureSensorTypes = PressureSensorTypes;
const DefaultNumberOfPressureSensors = 8;
class PressureSensorDataManager {
    constructor() {
        _PressureSensorDataManager_positions.set(this, []);
        _PressureSensorDataManager_sensorRangeHelpers.set(this, void 0);
        _PressureSensorDataManager_normalizedSumRangeHelper.set(this, new RangeHelper());
        _PressureSensorDataManager_centerOfPressureHelper.set(this, new CenterOfPressureHelper());
    }
    get positions() {
        return __classPrivateFieldGet(this, _PressureSensorDataManager_positions, "f");
    }
    get numberOfSensors() {
        return this.positions.length;
    }
    parsePositions(dataView) {
        const positions = [];
        for (let pressureSensorIndex = 0, byteOffset = 0; byteOffset < dataView.byteLength; pressureSensorIndex++, byteOffset += 2) {
            positions.push({
                x: dataView.getUint8(byteOffset) / 2 ** 8,
                y: dataView.getUint8(byteOffset + 1) / 2 ** 8,
            });
        }
        _console$x.log({ positions });
        __classPrivateFieldSet(this, _PressureSensorDataManager_positions, positions, "f");
        __classPrivateFieldSet(this, _PressureSensorDataManager_sensorRangeHelpers, createArray(this.numberOfSensors, () => new RangeHelper()), "f");
        this.resetRange();
    }
    resetRange() {
        __classPrivateFieldGet(this, _PressureSensorDataManager_sensorRangeHelpers, "f")?.forEach((rangeHelper) => rangeHelper.reset());
        __classPrivateFieldGet(this, _PressureSensorDataManager_centerOfPressureHelper, "f").reset();
        __classPrivateFieldGet(this, _PressureSensorDataManager_normalizedSumRangeHelper, "f").reset();
    }
    parseData(dataView, scalar) {
        const pressure = { sensors: [], scaledSum: 0, normalizedSum: 0 };
        for (let index = 0, byteOffset = 0; byteOffset < dataView.byteLength; index++, byteOffset += 2) {
            const rawValue = dataView.getUint16(byteOffset, true);
            let scaledValue = (rawValue * scalar) / this.numberOfSensors;
            const rangeHelper = __classPrivateFieldGet(this, _PressureSensorDataManager_sensorRangeHelpers, "f")[index];
            const normalizedValue = rangeHelper.updateAndGetNormalization(scaledValue, false);
            const position = this.positions[index];
            pressure.sensors[index] = { rawValue, scaledValue, normalizedValue, position, weightedValue: 0 };
            pressure.scaledSum += scaledValue;
        }
        pressure.normalizedSum = __classPrivateFieldGet(this, _PressureSensorDataManager_normalizedSumRangeHelper, "f").updateAndGetNormalization(pressure.scaledSum, false);
        if (pressure.scaledSum > 0) {
            pressure.center = { x: 0, y: 0 };
            pressure.sensors.forEach((sensor) => {
                sensor.weightedValue = sensor.scaledValue / pressure.scaledSum;
                pressure.center.x += sensor.position.x * sensor.weightedValue;
                pressure.center.y += sensor.position.y * sensor.weightedValue;
            });
            pressure.normalizedCenter = __classPrivateFieldGet(this, _PressureSensorDataManager_centerOfPressureHelper, "f").updateAndGetNormalization(pressure.center, false);
        }
        _console$x.log({ pressure });
        return pressure;
    }
}
_PressureSensorDataManager_positions = new WeakMap(), _PressureSensorDataManager_sensorRangeHelpers = new WeakMap(), _PressureSensorDataManager_normalizedSumRangeHelper = new WeakMap(), _PressureSensorDataManager_centerOfPressureHelper = new WeakMap();

const _console$w = createConsole("MotionSensorDataManager", { log: false });
const MotionSensorTypes = [
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
const ContinuousMotionTypes = [
    "acceleration",
    "gravity",
    "linearAcceleration",
    "gyroscope",
    "magnetometer",
    "gameRotation",
    "rotation",
];
const ActivityTypes = ["still", "walking", "running", "bicycle", "vehicle", "tilting"];
const DeviceOrientations = [
    "portraitUpright",
    "landscapeLeft",
    "portraitUpsideDown",
    "landscapeRight",
    "unknown",
];
class MotionSensorDataManager {
    parseVector3(dataView, scalar) {
        let [x, y, z] = [dataView.getInt16(0, true), dataView.getInt16(2, true), dataView.getInt16(4, true)].map((value) => value * scalar);
        const vector = { x, y, z };
        _console$w.log({ vector });
        return vector;
    }
    parseQuaternion(dataView, scalar) {
        let [x, y, z, w] = [
            dataView.getInt16(0, true),
            dataView.getInt16(2, true),
            dataView.getInt16(4, true),
            dataView.getInt16(6, true),
        ].map((value) => value * scalar);
        const quaternion = { x, y, z, w };
        _console$w.log({ quaternion });
        return quaternion;
    }
    parseEuler(dataView, scalar) {
        let [heading, pitch, roll] = [
            dataView.getInt16(0, true),
            dataView.getInt16(2, true),
            dataView.getInt16(4, true),
        ].map((value) => value * scalar);
        pitch *= -1;
        heading *= -1;
        heading += 360;
        const euler = { heading, pitch, roll };
        _console$w.log({ euler });
        return euler;
    }
    parseStepCounter(dataView) {
        _console$w.log("parseStepCounter", dataView);
        const stepCount = dataView.getUint32(0, true);
        _console$w.log({ stepCount });
        return stepCount;
    }
    parseActivity(dataView) {
        _console$w.log("parseActivity", dataView);
        const activity = {};
        const activityBitfield = dataView.getUint8(0);
        _console$w.log("activityBitfield", activityBitfield.toString(2));
        ActivityTypes.forEach((activityType, index) => {
            activity[activityType] = Boolean(activityBitfield & (1 << index));
        });
        _console$w.log("activity", activity);
        return activity;
    }
    parseDeviceOrientation(dataView) {
        _console$w.log("parseDeviceOrientation", dataView);
        const index = dataView.getUint8(0);
        const deviceOrientation = DeviceOrientations[index];
        _console$w.assertWithError(deviceOrientation, "undefined deviceOrientation");
        _console$w.log({ deviceOrientation });
        return deviceOrientation;
    }
}

var _BarometerSensorDataManager_instances, _BarometerSensorDataManager_calculcateAltitude;
const BarometerSensorTypes = ["barometer"];
const ContinuousBarometerSensorTypes = BarometerSensorTypes;
const _console$v = createConsole("BarometerSensorDataManager", { log: false });
class BarometerSensorDataManager {
    constructor() {
        _BarometerSensorDataManager_instances.add(this);
    }
    parseData(dataView, scalar) {
        const pressure = dataView.getUint32(0, true) * scalar;
        const altitude = __classPrivateFieldGet(this, _BarometerSensorDataManager_instances, "m", _BarometerSensorDataManager_calculcateAltitude).call(this, pressure);
        _console$v.log({ pressure, altitude });
        return { pressure };
    }
}
_BarometerSensorDataManager_instances = new WeakSet(), _BarometerSensorDataManager_calculcateAltitude = function _BarometerSensorDataManager_calculcateAltitude(pressure) {
    const P0 = 101325;
    const T0 = 288.15;
    const L = 0.0065;
    const R = 8.3144598;
    const g = 9.80665;
    const M = 0.0289644;
    const exponent = (R * L) / (g * M);
    const h = (T0 / L) * (1 - Math.pow(pressure / P0, exponent));
    return h;
};

const _console$u = createConsole("ParseUtils", { log: false });
function parseStringFromDataView(dataView, byteOffset = 0) {
    const stringLength = dataView.getUint8(byteOffset++);
    const string = textDecoder.decode(dataView.buffer.slice(dataView.byteOffset + byteOffset, dataView.byteOffset + byteOffset + stringLength));
    byteOffset += stringLength;
    return { string, byteOffset };
}
function parseMessage(dataView, messageTypes, callback, context, parseMessageLengthAsUint16 = false) {
    let byteOffset = 0;
    while (byteOffset < dataView.byteLength) {
        const messageTypeEnum = dataView.getUint8(byteOffset++);
        _console$u.assertWithError(messageTypeEnum in messageTypes, `invalid messageTypeEnum ${messageTypeEnum}`);
        const messageType = messageTypes[messageTypeEnum];
        let messageLength;
        if (parseMessageLengthAsUint16) {
            messageLength = dataView.getUint16(byteOffset, true);
            byteOffset += 2;
        }
        else {
            messageLength = dataView.getUint8(byteOffset++);
        }
        _console$u.log({
            messageTypeEnum,
            messageType,
            messageLength,
            dataView,
            byteOffset,
        });
        const _dataView = sliceDataView(dataView, byteOffset, messageLength);
        _console$u.log({ _dataView });
        callback(messageType, _dataView, context);
        byteOffset += messageLength;
    }
}

var _SensorDataManager_scalars;
const _console$t = createConsole("SensorDataManager", { log: false });
const SensorTypes = [...PressureSensorTypes, ...MotionSensorTypes, ...BarometerSensorTypes];
const ContinuousSensorTypes = [
    ...ContinuousPressureSensorTypes,
    ...ContinuousMotionTypes,
    ...ContinuousBarometerSensorTypes,
];
const SensorDataMessageTypes = ["getPressurePositions", "getSensorScalars", "sensorData"];
const SensorDataEventTypes = [...SensorDataMessageTypes, ...SensorTypes];
class SensorDataManager {
    constructor() {
        this.pressureSensorDataManager = new PressureSensorDataManager();
        this.motionSensorDataManager = new MotionSensorDataManager();
        this.barometerSensorDataManager = new BarometerSensorDataManager();
        _SensorDataManager_scalars.set(this, new Map());
    }
    static AssertValidSensorType(sensorType) {
        _console$t.assertEnumWithError(sensorType, SensorTypes);
    }
    static AssertValidSensorTypeEnum(sensorTypeEnum) {
        _console$t.assertTypeWithError(sensorTypeEnum, "number");
        _console$t.assertWithError(sensorTypeEnum in SensorTypes, `invalid sensorTypeEnum ${sensorTypeEnum}`);
    }
    get dispatchEvent() {
        return this.eventDispatcher.dispatchEvent;
    }
    parseMessage(messageType, dataView) {
        _console$t.log({ messageType });
        switch (messageType) {
            case "getSensorScalars":
                this.parseScalars(dataView);
                break;
            case "getPressurePositions":
                this.pressureSensorDataManager.parsePositions(dataView);
                break;
            case "sensorData":
                this.parseData(dataView);
                break;
            default:
                throw Error(`uncaught messageType ${messageType}`);
        }
    }
    parseScalars(dataView) {
        for (let byteOffset = 0; byteOffset < dataView.byteLength; byteOffset += 5) {
            const sensorTypeIndex = dataView.getUint8(byteOffset);
            const sensorType = SensorTypes[sensorTypeIndex];
            if (!sensorType) {
                _console$t.warn(`unknown sensorType index ${sensorTypeIndex}`);
                continue;
            }
            const sensorScalar = dataView.getFloat32(byteOffset + 1, true);
            _console$t.log({ sensorType, sensorScalar });
            __classPrivateFieldGet(this, _SensorDataManager_scalars, "f").set(sensorType, sensorScalar);
        }
    }
    parseData(dataView) {
        _console$t.log("sensorData", Array.from(new Uint8Array(dataView.buffer)));
        let byteOffset = 0;
        const timestamp = parseTimestamp(dataView, byteOffset);
        byteOffset += 2;
        const _dataView = new DataView(dataView.buffer, byteOffset);
        parseMessage(_dataView, SensorTypes, this.parseDataCallback.bind(this), { timestamp });
    }
    parseDataCallback(sensorType, dataView, { timestamp }) {
        const scalar = __classPrivateFieldGet(this, _SensorDataManager_scalars, "f").get(sensorType) || 1;
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
                _console$t.error(`uncaught sensorType "${sensorType}"`);
        }
        _console$t.assertWithError(sensorData != null, `no sensorData defined for sensorType "${sensorType}"`);
        _console$t.log({ sensorType, sensorData });
        this.dispatchEvent(sensorType, { sensorType, [sensorType]: sensorData, timestamp });
        this.dispatchEvent("sensorData", { sensorType, [sensorType]: sensorData, timestamp });
    }
}
_SensorDataManager_scalars = new WeakMap();

const getAllProperties = object => {
	const properties = new Set();
	do {
		for (const key of Reflect.ownKeys(object)) {
			properties.add([object, key]);
		}
	} while ((object = Reflect.getPrototypeOf(object)) && object !== Object.prototype);
	return properties;
};
function autoBind(self, {include, exclude} = {}) {
	const filter = key => {
		const match = pattern => typeof pattern === 'string' ? key === pattern : pattern.test(key);
		if (include) {
			return include.some(match);
		}
		if (exclude) {
			return !exclude.some(match);
		}
		return true;
	};
	for (const [object, key] of getAllProperties(self.constructor.prototype)) {
		if (key === 'constructor' || !filter(key)) {
			continue;
		}
		const descriptor = Reflect.getOwnPropertyDescriptor(object, key);
		if (descriptor && typeof descriptor.value === 'function') {
			self[key] = self[key].bind(self);
		}
	}
	return self;
}

var _SensorConfigurationManager_instances, _a$5, _SensorConfigurationManager_dispatchEvent_get, _SensorConfigurationManager_availableSensorTypes, _SensorConfigurationManager_assertAvailableSensorType, _SensorConfigurationManager_configuration, _SensorConfigurationManager_updateConfiguration, _SensorConfigurationManager_isRedundant, _SensorConfigurationManager_parse, _SensorConfigurationManager_AssertValidSensorRate, _SensorConfigurationManager_assertValidSensorRate, _SensorConfigurationManager_createData, _SensorConfigurationManager_ZeroSensorConfiguration;
const _console$s = createConsole("SensorConfigurationManager", { log: false });
const MaxSensorRate = 2 ** 16 - 1;
const SensorRateStep = 5;
const SensorConfigurationMessageTypes = ["getSensorConfiguration", "setSensorConfiguration"];
const SensorConfigurationEventTypes = SensorConfigurationMessageTypes;
class SensorConfigurationManager {
    constructor() {
        _SensorConfigurationManager_instances.add(this);
        _SensorConfigurationManager_availableSensorTypes.set(this, void 0);
        _SensorConfigurationManager_configuration.set(this, void 0);
        autoBind(this);
    }
    get addEventListener() {
        return this.eventDispatcher.addEventListener;
    }
    get waitForEvent() {
        return this.eventDispatcher.waitForEvent;
    }
    get configuration() {
        return __classPrivateFieldGet(this, _SensorConfigurationManager_configuration, "f");
    }
    async setConfiguration(newSensorConfiguration, clearRest) {
        if (clearRest) {
            newSensorConfiguration = Object.assign({ ...this.zeroSensorConfiguration }, newSensorConfiguration);
        }
        _console$s.log({ newSensorConfiguration });
        if (__classPrivateFieldGet(this, _SensorConfigurationManager_instances, "m", _SensorConfigurationManager_isRedundant).call(this, newSensorConfiguration)) {
            _console$s.log("redundant sensor configuration");
            return;
        }
        const setSensorConfigurationData = __classPrivateFieldGet(this, _SensorConfigurationManager_instances, "m", _SensorConfigurationManager_createData).call(this, newSensorConfiguration);
        _console$s.log({ setSensorConfigurationData });
        const promise = this.waitForEvent("getSensorConfiguration");
        this.sendMessage([{ type: "setSensorConfiguration", data: setSensorConfigurationData.buffer }]);
        await promise;
    }
    static get ZeroSensorConfiguration() {
        return __classPrivateFieldGet(this, _a$5, "f", _SensorConfigurationManager_ZeroSensorConfiguration);
    }
    get zeroSensorConfiguration() {
        const zeroSensorConfiguration = {};
        __classPrivateFieldGet(this, _SensorConfigurationManager_availableSensorTypes, "f").forEach((sensorType) => {
            zeroSensorConfiguration[sensorType] = 0;
        });
        return zeroSensorConfiguration;
    }
    async clearSensorConfiguration() {
        return this.setConfiguration(this.zeroSensorConfiguration);
    }
    parseMessage(messageType, dataView) {
        _console$s.log({ messageType });
        switch (messageType) {
            case "getSensorConfiguration":
            case "setSensorConfiguration":
                const newSensorConfiguration = __classPrivateFieldGet(this, _SensorConfigurationManager_instances, "m", _SensorConfigurationManager_parse).call(this, dataView);
                __classPrivateFieldGet(this, _SensorConfigurationManager_instances, "m", _SensorConfigurationManager_updateConfiguration).call(this, newSensorConfiguration);
                break;
            default:
                throw Error(`uncaught messageType ${messageType}`);
        }
    }
}
_a$5 = SensorConfigurationManager, _SensorConfigurationManager_availableSensorTypes = new WeakMap(), _SensorConfigurationManager_configuration = new WeakMap(), _SensorConfigurationManager_instances = new WeakSet(), _SensorConfigurationManager_dispatchEvent_get = function _SensorConfigurationManager_dispatchEvent_get() {
    return this.eventDispatcher.dispatchEvent;
}, _SensorConfigurationManager_assertAvailableSensorType = function _SensorConfigurationManager_assertAvailableSensorType(sensorType) {
    _console$s.assertWithError(__classPrivateFieldGet(this, _SensorConfigurationManager_availableSensorTypes, "f"), "must get initial sensorConfiguration");
    const isSensorTypeAvailable = __classPrivateFieldGet(this, _SensorConfigurationManager_availableSensorTypes, "f")?.includes(sensorType);
    _console$s.log(isSensorTypeAvailable, `unavailable sensor type "${sensorType}"`);
    return isSensorTypeAvailable;
}, _SensorConfigurationManager_updateConfiguration = function _SensorConfigurationManager_updateConfiguration(updatedConfiguration) {
    __classPrivateFieldSet(this, _SensorConfigurationManager_configuration, updatedConfiguration, "f");
    _console$s.log({ updatedConfiguration: __classPrivateFieldGet(this, _SensorConfigurationManager_configuration, "f") });
    __classPrivateFieldGet(this, _SensorConfigurationManager_instances, "a", _SensorConfigurationManager_dispatchEvent_get).call(this, "getSensorConfiguration", { sensorConfiguration: this.configuration });
}, _SensorConfigurationManager_isRedundant = function _SensorConfigurationManager_isRedundant(sensorConfiguration) {
    let sensorTypes = Object.keys(sensorConfiguration);
    return sensorTypes.every((sensorType) => {
        return this.configuration[sensorType] == sensorConfiguration[sensorType];
    });
}, _SensorConfigurationManager_parse = function _SensorConfigurationManager_parse(dataView) {
    const parsedSensorConfiguration = {};
    for (let byteOffset = 0; byteOffset < dataView.byteLength; byteOffset += 3) {
        const sensorTypeIndex = dataView.getUint8(byteOffset);
        const sensorType = SensorTypes[sensorTypeIndex];
        if (!sensorType) {
            _console$s.warn(`unknown sensorType index ${sensorTypeIndex}`);
            continue;
        }
        const sensorRate = dataView.getUint16(byteOffset + 1, true);
        _console$s.log({ sensorType, sensorRate });
        parsedSensorConfiguration[sensorType] = sensorRate;
    }
    _console$s.log({ parsedSensorConfiguration });
    __classPrivateFieldSet(this, _SensorConfigurationManager_availableSensorTypes, Object.keys(parsedSensorConfiguration), "f");
    return parsedSensorConfiguration;
}, _SensorConfigurationManager_AssertValidSensorRate = function _SensorConfigurationManager_AssertValidSensorRate(sensorRate) {
    _console$s.assertTypeWithError(sensorRate, "number");
    _console$s.assertWithError(sensorRate >= 0, `sensorRate must be 0 or greater (got ${sensorRate})`);
    _console$s.assertWithError(sensorRate < MaxSensorRate, `sensorRate must be 0 or greater (got ${sensorRate})`);
    _console$s.assertWithError(sensorRate % SensorRateStep == 0, `sensorRate must be multiple of ${SensorRateStep}`);
}, _SensorConfigurationManager_assertValidSensorRate = function _SensorConfigurationManager_assertValidSensorRate(sensorRate) {
    __classPrivateFieldGet(_a$5, _a$5, "m", _SensorConfigurationManager_AssertValidSensorRate).call(_a$5, sensorRate);
}, _SensorConfigurationManager_createData = function _SensorConfigurationManager_createData(sensorConfiguration) {
    let sensorTypes = Object.keys(sensorConfiguration);
    sensorTypes = sensorTypes.filter((sensorType) => __classPrivateFieldGet(this, _SensorConfigurationManager_instances, "m", _SensorConfigurationManager_assertAvailableSensorType).call(this, sensorType));
    const dataView = new DataView(new ArrayBuffer(sensorTypes.length * 3));
    sensorTypes.forEach((sensorType, index) => {
        SensorDataManager.AssertValidSensorType(sensorType);
        const sensorTypeEnum = SensorTypes.indexOf(sensorType);
        dataView.setUint8(index * 3, sensorTypeEnum);
        const sensorRate = sensorConfiguration[sensorType];
        __classPrivateFieldGet(this, _SensorConfigurationManager_instances, "m", _SensorConfigurationManager_assertValidSensorRate).call(this, sensorRate);
        dataView.setUint16(index * 3 + 1, sensorRate, true);
    });
    _console$s.log({ sensorConfigurationData: dataView });
    return dataView;
};
_SensorConfigurationManager_ZeroSensorConfiguration = { value: {} };
(() => {
    SensorTypes.forEach((sensorType) => {
        __classPrivateFieldGet(_a$5, _a$5, "f", _SensorConfigurationManager_ZeroSensorConfiguration)[sensorType] = 0;
    });
})();

var _TfliteManager_instances, _TfliteManager_assertValidTask, _TfliteManager_assertValidTaskEnum, _TfliteManager_dispatchEvent_get, _TfliteManager_name, _TfliteManager_parseName, _TfliteManager_updateName, _TfliteManager_task, _TfliteManager_parseTask, _TfliteManager_updateTask, _TfliteManager_sampleRate, _TfliteManager_parseSampleRate, _TfliteManager_updateSampleRate, _TfliteManager_sensorTypes, _TfliteManager_parseSensorTypes, _TfliteManager_updateSensorTypes, _TfliteManager_isReady, _TfliteManager_parseIsReady, _TfliteManager_updateIsReady, _TfliteManager_assertIsReady, _TfliteManager_captureDelay, _TfliteManager_parseCaptureDelay, _TfliteManager_updateCaptueDelay, _TfliteManager_threshold, _TfliteManager_parseThreshold, _TfliteManager_updateThreshold, _TfliteManager_inferencingEnabled, _TfliteManager_parseInferencingEnabled, _TfliteManager_updateInferencingEnabled, _TfliteManager_parseInference;
const _console$r = createConsole("TfliteManager", { log: false });
const TfliteMessageTypes = [
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
const TfliteEventTypes = TfliteMessageTypes;
const TfliteTasks = ["classification", "regression"];
const TfliteSensorTypes = [
    "pressure",
    "linearAcceleration",
    "gyroscope",
    "magnetometer",
];
class TfliteManager {
    constructor() {
        _TfliteManager_instances.add(this);
        _TfliteManager_name.set(this, void 0);
        _TfliteManager_task.set(this, void 0);
        _TfliteManager_sampleRate.set(this, void 0);
        _TfliteManager_sensorTypes.set(this, []);
        _TfliteManager_isReady.set(this, void 0);
        _TfliteManager_captureDelay.set(this, void 0);
        _TfliteManager_threshold.set(this, void 0);
        _TfliteManager_inferencingEnabled.set(this, void 0);
        autoBind$1(this);
    }
    get addEventListenter() {
        return this.eventDispatcher.addEventListener;
    }
    get removeEventListener() {
        return this.eventDispatcher.removeEventListener;
    }
    get waitForEvent() {
        return this.eventDispatcher.waitForEvent;
    }
    get name() {
        return __classPrivateFieldGet(this, _TfliteManager_name, "f");
    }
    async setName(newName, sendImmediately) {
        _console$r.assertTypeWithError(newName, "string");
        if (this.name == newName) {
            _console$r.log(`redundant name assignment ${newName}`);
            return;
        }
        const promise = this.waitForEvent("getTfliteName");
        const setNameData = textEncoder.encode(newName);
        this.sendMessage([{ type: "setTfliteName", data: setNameData.buffer }], sendImmediately);
        await promise;
    }
    get task() {
        return __classPrivateFieldGet(this, _TfliteManager_task, "f");
    }
    async setTask(newTask, sendImmediately) {
        __classPrivateFieldGet(this, _TfliteManager_instances, "m", _TfliteManager_assertValidTask).call(this, newTask);
        if (this.task == newTask) {
            _console$r.log(`redundant task assignment ${newTask}`);
            return;
        }
        const promise = this.waitForEvent("getTfliteTask");
        const taskEnum = TfliteTasks.indexOf(newTask);
        this.sendMessage([{ type: "setTfliteTask", data: Uint8Array.from([taskEnum]).buffer }], sendImmediately);
        await promise;
    }
    get sampleRate() {
        return __classPrivateFieldGet(this, _TfliteManager_sampleRate, "f");
    }
    async setSampleRate(newSampleRate, sendImmediately) {
        _console$r.assertTypeWithError(newSampleRate, "number");
        newSampleRate -= newSampleRate % SensorRateStep;
        _console$r.assertWithError(newSampleRate >= SensorRateStep, `sampleRate must be multiple of ${SensorRateStep} greater than 0 (got ${newSampleRate})`);
        if (__classPrivateFieldGet(this, _TfliteManager_sampleRate, "f") == newSampleRate) {
            _console$r.log(`redundant sampleRate assignment ${newSampleRate}`);
            return;
        }
        const promise = this.waitForEvent("getTfliteSampleRate");
        const dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint16(0, newSampleRate, true);
        this.sendMessage([{ type: "setTfliteSampleRate", data: dataView.buffer }], sendImmediately);
        await promise;
    }
    static AssertValidSensorType(sensorType) {
        SensorDataManager.AssertValidSensorType(sensorType);
        _console$r.assertWithError(TfliteSensorTypes.includes(sensorType), `invalid tflite sensorType "${sensorType}"`);
    }
    get sensorTypes() {
        return __classPrivateFieldGet(this, _TfliteManager_sensorTypes, "f").slice();
    }
    async setSensorTypes(newSensorTypes, sendImmediately) {
        newSensorTypes.forEach((sensorType) => {
            TfliteManager.AssertValidSensorType(sensorType);
        });
        const promise = this.waitForEvent("getTfliteSensorTypes");
        newSensorTypes = arrayWithoutDuplicates(newSensorTypes);
        const newSensorTypeEnums = newSensorTypes
            .map((sensorType) => SensorTypes.indexOf(sensorType))
            .sort();
        _console$r.log(newSensorTypes, newSensorTypeEnums);
        this.sendMessage([
            {
                type: "setTfliteSensorTypes",
                data: Uint8Array.from(newSensorTypeEnums).buffer,
            },
        ], sendImmediately);
        await promise;
    }
    get isReady() {
        return __classPrivateFieldGet(this, _TfliteManager_isReady, "f");
    }
    get captureDelay() {
        return __classPrivateFieldGet(this, _TfliteManager_captureDelay, "f");
    }
    async setCaptureDelay(newCaptureDelay, sendImmediately) {
        _console$r.assertTypeWithError(newCaptureDelay, "number");
        if (__classPrivateFieldGet(this, _TfliteManager_captureDelay, "f") == newCaptureDelay) {
            _console$r.log(`redundant captureDelay assignment ${newCaptureDelay}`);
            return;
        }
        const promise = this.waitForEvent("getTfliteCaptureDelay");
        const dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint16(0, newCaptureDelay, true);
        this.sendMessage([{ type: "setTfliteCaptureDelay", data: dataView.buffer }], sendImmediately);
        await promise;
    }
    get threshold() {
        return __classPrivateFieldGet(this, _TfliteManager_threshold, "f");
    }
    async setThreshold(newThreshold, sendImmediately) {
        _console$r.assertTypeWithError(newThreshold, "number");
        _console$r.assertWithError(newThreshold >= 0, `threshold must be positive (got ${newThreshold})`);
        if (__classPrivateFieldGet(this, _TfliteManager_threshold, "f") == newThreshold) {
            _console$r.log(`redundant threshold assignment ${newThreshold}`);
            return;
        }
        const promise = this.waitForEvent("getTfliteThreshold");
        const dataView = new DataView(new ArrayBuffer(4));
        dataView.setFloat32(0, newThreshold, true);
        this.sendMessage([{ type: "setTfliteThreshold", data: dataView.buffer }], sendImmediately);
        await promise;
    }
    get inferencingEnabled() {
        return __classPrivateFieldGet(this, _TfliteManager_inferencingEnabled, "f");
    }
    async setInferencingEnabled(newInferencingEnabled, sendImmediately = true) {
        _console$r.assertTypeWithError(newInferencingEnabled, "boolean");
        if (!newInferencingEnabled && !this.isReady) {
            return;
        }
        __classPrivateFieldGet(this, _TfliteManager_instances, "m", _TfliteManager_assertIsReady).call(this);
        if (__classPrivateFieldGet(this, _TfliteManager_inferencingEnabled, "f") == newInferencingEnabled) {
            _console$r.log(`redundant inferencingEnabled assignment ${newInferencingEnabled}`);
            return;
        }
        const promise = this.waitForEvent("getTfliteInferencingEnabled");
        this.sendMessage([
            {
                type: "setTfliteInferencingEnabled",
                data: Uint8Array.from([Number(newInferencingEnabled)]).buffer,
            },
        ], sendImmediately);
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
        _console$r.log({ messageType });
        switch (messageType) {
            case "getTfliteName":
            case "setTfliteName":
                __classPrivateFieldGet(this, _TfliteManager_instances, "m", _TfliteManager_parseName).call(this, dataView);
                break;
            case "getTfliteTask":
            case "setTfliteTask":
                __classPrivateFieldGet(this, _TfliteManager_instances, "m", _TfliteManager_parseTask).call(this, dataView);
                break;
            case "getTfliteSampleRate":
            case "setTfliteSampleRate":
                __classPrivateFieldGet(this, _TfliteManager_instances, "m", _TfliteManager_parseSampleRate).call(this, dataView);
                break;
            case "getTfliteSensorTypes":
            case "setTfliteSensorTypes":
                __classPrivateFieldGet(this, _TfliteManager_instances, "m", _TfliteManager_parseSensorTypes).call(this, dataView);
                break;
            case "tfliteIsReady":
                __classPrivateFieldGet(this, _TfliteManager_instances, "m", _TfliteManager_parseIsReady).call(this, dataView);
                break;
            case "getTfliteCaptureDelay":
            case "setTfliteCaptureDelay":
                __classPrivateFieldGet(this, _TfliteManager_instances, "m", _TfliteManager_parseCaptureDelay).call(this, dataView);
                break;
            case "getTfliteThreshold":
            case "setTfliteThreshold":
                __classPrivateFieldGet(this, _TfliteManager_instances, "m", _TfliteManager_parseThreshold).call(this, dataView);
                break;
            case "getTfliteInferencingEnabled":
            case "setTfliteInferencingEnabled":
                __classPrivateFieldGet(this, _TfliteManager_instances, "m", _TfliteManager_parseInferencingEnabled).call(this, dataView);
                break;
            case "tfliteInference":
                __classPrivateFieldGet(this, _TfliteManager_instances, "m", _TfliteManager_parseInference).call(this, dataView);
                break;
            default:
                throw Error(`uncaught messageType ${messageType}`);
        }
    }
}
_TfliteManager_name = new WeakMap(), _TfliteManager_task = new WeakMap(), _TfliteManager_sampleRate = new WeakMap(), _TfliteManager_sensorTypes = new WeakMap(), _TfliteManager_isReady = new WeakMap(), _TfliteManager_captureDelay = new WeakMap(), _TfliteManager_threshold = new WeakMap(), _TfliteManager_inferencingEnabled = new WeakMap(), _TfliteManager_instances = new WeakSet(), _TfliteManager_assertValidTask = function _TfliteManager_assertValidTask(task) {
    _console$r.assertEnumWithError(task, TfliteTasks);
}, _TfliteManager_assertValidTaskEnum = function _TfliteManager_assertValidTaskEnum(taskEnum) {
    _console$r.assertWithError(taskEnum in TfliteTasks, `invalid taskEnum ${taskEnum}`);
}, _TfliteManager_dispatchEvent_get = function _TfliteManager_dispatchEvent_get() {
    return this.eventDispatcher.dispatchEvent;
}, _TfliteManager_parseName = function _TfliteManager_parseName(dataView) {
    _console$r.log("parseName", dataView);
    const name = textDecoder.decode(dataView.buffer);
    __classPrivateFieldGet(this, _TfliteManager_instances, "m", _TfliteManager_updateName).call(this, name);
}, _TfliteManager_updateName = function _TfliteManager_updateName(name) {
    _console$r.log({ name });
    __classPrivateFieldSet(this, _TfliteManager_name, name, "f");
    __classPrivateFieldGet(this, _TfliteManager_instances, "a", _TfliteManager_dispatchEvent_get).call(this, "getTfliteName", { tfliteName: name });
}, _TfliteManager_parseTask = function _TfliteManager_parseTask(dataView) {
    _console$r.log("parseTask", dataView);
    const taskEnum = dataView.getUint8(0);
    __classPrivateFieldGet(this, _TfliteManager_instances, "m", _TfliteManager_assertValidTaskEnum).call(this, taskEnum);
    const task = TfliteTasks[taskEnum];
    __classPrivateFieldGet(this, _TfliteManager_instances, "m", _TfliteManager_updateTask).call(this, task);
}, _TfliteManager_updateTask = function _TfliteManager_updateTask(task) {
    _console$r.log({ task });
    __classPrivateFieldSet(this, _TfliteManager_task, task, "f");
    __classPrivateFieldGet(this, _TfliteManager_instances, "a", _TfliteManager_dispatchEvent_get).call(this, "getTfliteTask", { tfliteTask: task });
}, _TfliteManager_parseSampleRate = function _TfliteManager_parseSampleRate(dataView) {
    _console$r.log("parseSampleRate", dataView);
    const sampleRate = dataView.getUint16(0, true);
    __classPrivateFieldGet(this, _TfliteManager_instances, "m", _TfliteManager_updateSampleRate).call(this, sampleRate);
}, _TfliteManager_updateSampleRate = function _TfliteManager_updateSampleRate(sampleRate) {
    _console$r.log({ sampleRate });
    __classPrivateFieldSet(this, _TfliteManager_sampleRate, sampleRate, "f");
    __classPrivateFieldGet(this, _TfliteManager_instances, "a", _TfliteManager_dispatchEvent_get).call(this, "getTfliteSampleRate", {
        tfliteSampleRate: sampleRate,
    });
}, _TfliteManager_parseSensorTypes = function _TfliteManager_parseSensorTypes(dataView) {
    _console$r.log("parseSensorTypes", dataView);
    const sensorTypes = [];
    for (let index = 0; index < dataView.byteLength; index++) {
        const sensorTypeEnum = dataView.getUint8(index);
        const sensorType = SensorTypes[sensorTypeEnum];
        if (sensorType) {
            sensorTypes.push(sensorType);
        }
        else {
            _console$r.error(`invalid sensorTypeEnum ${sensorTypeEnum}`);
        }
    }
    __classPrivateFieldGet(this, _TfliteManager_instances, "m", _TfliteManager_updateSensorTypes).call(this, sensorTypes);
}, _TfliteManager_updateSensorTypes = function _TfliteManager_updateSensorTypes(sensorTypes) {
    _console$r.log({ sensorTypes });
    __classPrivateFieldSet(this, _TfliteManager_sensorTypes, sensorTypes, "f");
    __classPrivateFieldGet(this, _TfliteManager_instances, "a", _TfliteManager_dispatchEvent_get).call(this, "getTfliteSensorTypes", {
        tfliteSensorTypes: sensorTypes,
    });
}, _TfliteManager_parseIsReady = function _TfliteManager_parseIsReady(dataView) {
    _console$r.log("parseIsReady", dataView);
    const isReady = Boolean(dataView.getUint8(0));
    __classPrivateFieldGet(this, _TfliteManager_instances, "m", _TfliteManager_updateIsReady).call(this, isReady);
}, _TfliteManager_updateIsReady = function _TfliteManager_updateIsReady(isReady) {
    _console$r.log({ isReady });
    __classPrivateFieldSet(this, _TfliteManager_isReady, isReady, "f");
    __classPrivateFieldGet(this, _TfliteManager_instances, "a", _TfliteManager_dispatchEvent_get).call(this, "tfliteIsReady", { tfliteIsReady: isReady });
}, _TfliteManager_assertIsReady = function _TfliteManager_assertIsReady() {
    _console$r.assertWithError(this.isReady, `tflite is not ready`);
}, _TfliteManager_parseCaptureDelay = function _TfliteManager_parseCaptureDelay(dataView) {
    _console$r.log("parseCaptureDelay", dataView);
    const captureDelay = dataView.getUint16(0, true);
    __classPrivateFieldGet(this, _TfliteManager_instances, "m", _TfliteManager_updateCaptueDelay).call(this, captureDelay);
}, _TfliteManager_updateCaptueDelay = function _TfliteManager_updateCaptueDelay(captureDelay) {
    _console$r.log({ captureDelay });
    __classPrivateFieldSet(this, _TfliteManager_captureDelay, captureDelay, "f");
    __classPrivateFieldGet(this, _TfliteManager_instances, "a", _TfliteManager_dispatchEvent_get).call(this, "getTfliteCaptureDelay", {
        tfliteCaptureDelay: captureDelay,
    });
}, _TfliteManager_parseThreshold = function _TfliteManager_parseThreshold(dataView) {
    _console$r.log("parseThreshold", dataView);
    const threshold = dataView.getFloat32(0, true);
    __classPrivateFieldGet(this, _TfliteManager_instances, "m", _TfliteManager_updateThreshold).call(this, threshold);
}, _TfliteManager_updateThreshold = function _TfliteManager_updateThreshold(threshold) {
    _console$r.log({ threshold });
    __classPrivateFieldSet(this, _TfliteManager_threshold, threshold, "f");
    __classPrivateFieldGet(this, _TfliteManager_instances, "a", _TfliteManager_dispatchEvent_get).call(this, "getTfliteThreshold", { tfliteThreshold: threshold });
}, _TfliteManager_parseInferencingEnabled = function _TfliteManager_parseInferencingEnabled(dataView) {
    _console$r.log("parseInferencingEnabled", dataView);
    const inferencingEnabled = Boolean(dataView.getUint8(0));
    __classPrivateFieldGet(this, _TfliteManager_instances, "m", _TfliteManager_updateInferencingEnabled).call(this, inferencingEnabled);
}, _TfliteManager_updateInferencingEnabled = function _TfliteManager_updateInferencingEnabled(inferencingEnabled) {
    _console$r.log({ inferencingEnabled });
    __classPrivateFieldSet(this, _TfliteManager_inferencingEnabled, inferencingEnabled, "f");
    __classPrivateFieldGet(this, _TfliteManager_instances, "a", _TfliteManager_dispatchEvent_get).call(this, "getTfliteInferencingEnabled", {
        tfliteInferencingEnabled: inferencingEnabled,
    });
}, _TfliteManager_parseInference = function _TfliteManager_parseInference(dataView) {
    _console$r.log("parseInference", dataView);
    const timestamp = parseTimestamp(dataView, 0);
    _console$r.log({ timestamp });
    const values = [];
    for (let index = 0, byteOffset = 2; byteOffset < dataView.byteLength; index++, byteOffset += 4) {
        const value = dataView.getFloat32(byteOffset, true);
        values.push(value);
    }
    _console$r.log("values", values);
    const inference = {
        timestamp,
        values,
    };
    if (this.task == "classification") {
        let maxValue = 0;
        let maxIndex = 0;
        values.forEach((value, index) => {
            if (value > maxValue) {
                maxValue = value;
                maxIndex = index;
            }
        });
        _console$r.log({ maxIndex, maxValue });
        inference.maxIndex = maxIndex;
        inference.maxValue = maxValue;
    }
    __classPrivateFieldGet(this, _TfliteManager_instances, "a", _TfliteManager_dispatchEvent_get).call(this, "tfliteInference", { tfliteInference: inference });
};

var _DeviceInformationManager_instances, _DeviceInformationManager_dispatchEvent_get, _DeviceInformationManager_information, _DeviceInformationManager_isComplete_get, _DeviceInformationManager_update;
const _console$q = createConsole("DeviceInformationManager", { log: false });
const DeviceInformationTypes = [
    "manufacturerName",
    "modelNumber",
    "hardwareRevision",
    "firmwareRevision",
    "softwareRevision",
    "pnpId",
    "serialNumber",
];
const DeviceInformationEventTypes = [
    ...DeviceInformationTypes,
    "deviceInformation",
];
class DeviceInformationManager {
    constructor() {
        _DeviceInformationManager_instances.add(this);
        _DeviceInformationManager_information.set(this, {});
    }
    get information() {
        return __classPrivateFieldGet(this, _DeviceInformationManager_information, "f");
    }
    clear() {
        __classPrivateFieldSet(this, _DeviceInformationManager_information, {}, "f");
    }
    parseMessage(messageType, dataView) {
        _console$q.log({ messageType });
        switch (messageType) {
            case "manufacturerName":
                const manufacturerName = textDecoder.decode(dataView.buffer);
                _console$q.log({ manufacturerName });
                __classPrivateFieldGet(this, _DeviceInformationManager_instances, "m", _DeviceInformationManager_update).call(this, { manufacturerName });
                break;
            case "modelNumber":
                const modelNumber = textDecoder.decode(dataView.buffer);
                _console$q.log({ modelNumber });
                __classPrivateFieldGet(this, _DeviceInformationManager_instances, "m", _DeviceInformationManager_update).call(this, { modelNumber });
                break;
            case "softwareRevision":
                const softwareRevision = textDecoder.decode(dataView.buffer);
                _console$q.log({ softwareRevision });
                __classPrivateFieldGet(this, _DeviceInformationManager_instances, "m", _DeviceInformationManager_update).call(this, { softwareRevision });
                break;
            case "hardwareRevision":
                const hardwareRevision = textDecoder.decode(dataView.buffer);
                _console$q.log({ hardwareRevision });
                __classPrivateFieldGet(this, _DeviceInformationManager_instances, "m", _DeviceInformationManager_update).call(this, { hardwareRevision });
                break;
            case "firmwareRevision":
                const firmwareRevision = textDecoder.decode(dataView.buffer);
                _console$q.log({ firmwareRevision });
                __classPrivateFieldGet(this, _DeviceInformationManager_instances, "m", _DeviceInformationManager_update).call(this, { firmwareRevision });
                break;
            case "pnpId":
                const pnpId = {
                    source: dataView.getUint8(0) === 1 ? "Bluetooth" : "USB",
                    productId: dataView.getUint16(3, true),
                    productVersion: dataView.getUint16(5, true),
                    vendorId: 0,
                };
                if (pnpId.source == "Bluetooth") {
                    pnpId.vendorId = dataView.getUint16(1, true);
                }
                _console$q.log({ pnpId });
                __classPrivateFieldGet(this, _DeviceInformationManager_instances, "m", _DeviceInformationManager_update).call(this, { pnpId });
                break;
            case "serialNumber":
                const serialNumber = textDecoder.decode(dataView.buffer);
                _console$q.log({ serialNumber });
                break;
            default:
                throw Error(`uncaught messageType ${messageType}`);
        }
    }
}
_DeviceInformationManager_information = new WeakMap(), _DeviceInformationManager_instances = new WeakSet(), _DeviceInformationManager_dispatchEvent_get = function _DeviceInformationManager_dispatchEvent_get() {
    return this.eventDispatcher.dispatchEvent;
}, _DeviceInformationManager_isComplete_get = function _DeviceInformationManager_isComplete_get() {
    return DeviceInformationTypes.filter((key) => key != "serialNumber").every((key) => key in __classPrivateFieldGet(this, _DeviceInformationManager_information, "f"));
}, _DeviceInformationManager_update = function _DeviceInformationManager_update(partialDeviceInformation) {
    _console$q.log({ partialDeviceInformation });
    const deviceInformationNames = Object.keys(partialDeviceInformation);
    deviceInformationNames.forEach((deviceInformationName) => {
        __classPrivateFieldGet(this, _DeviceInformationManager_instances, "a", _DeviceInformationManager_dispatchEvent_get).call(this, deviceInformationName, {
            [deviceInformationName]: partialDeviceInformation[deviceInformationName],
        });
    });
    Object.assign(__classPrivateFieldGet(this, _DeviceInformationManager_information, "f"), partialDeviceInformation);
    _console$q.log({ deviceInformation: __classPrivateFieldGet(this, _DeviceInformationManager_information, "f") });
    if (__classPrivateFieldGet(this, _DeviceInformationManager_instances, "a", _DeviceInformationManager_isComplete_get)) {
        _console$q.log("completed deviceInformation");
        __classPrivateFieldGet(this, _DeviceInformationManager_instances, "a", _DeviceInformationManager_dispatchEvent_get).call(this, "deviceInformation", {
            deviceInformation: this.information,
        });
    }
};

var _InformationManager_instances, _InformationManager_dispatchEvent_get, _InformationManager_isCharging, _InformationManager_updateIsCharging, _InformationManager_batteryCurrent, _InformationManager_updateBatteryCurrent, _InformationManager_id, _InformationManager_updateId, _InformationManager_name, _InformationManager_type, _InformationManager_assertValidDeviceType, _InformationManager_assertValidDeviceTypeEnum, _InformationManager_setTypeEnum, _InformationManager_mtu, _InformationManager_updateMtu, _InformationManager_isCurrentTimeSet, _InformationManager_onCurrentTime, _InformationManager_setCurrentTime;
const _console$p = createConsole("InformationManager", { log: false });
const DeviceTypes = [
    "leftInsole",
    "rightInsole",
    "leftGlove",
    "rightGlove",
    "glasses",
    "generic",
];
const Sides = ["left", "right"];
const MinNameLength = 2;
const MaxNameLength = 30;
const InformationMessageTypes = [
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
const InformationEventTypes = InformationMessageTypes;
class InformationManager {
    constructor() {
        _InformationManager_instances.add(this);
        _InformationManager_isCharging.set(this, false);
        _InformationManager_batteryCurrent.set(this, void 0);
        _InformationManager_id.set(this, void 0);
        _InformationManager_name.set(this, "");
        _InformationManager_type.set(this, void 0);
        _InformationManager_mtu.set(this, 0);
        _InformationManager_isCurrentTimeSet.set(this, false);
        autoBind$1(this);
    }
    get waitForEvent() {
        return this.eventDispatcher.waitForEvent;
    }
    get isCharging() {
        return __classPrivateFieldGet(this, _InformationManager_isCharging, "f");
    }
    get batteryCurrent() {
        return __classPrivateFieldGet(this, _InformationManager_batteryCurrent, "f");
    }
    async getBatteryCurrent() {
        _console$p.log("getting battery current...");
        const promise = this.waitForEvent("getBatteryCurrent");
        this.sendMessage([{ type: "getBatteryCurrent" }]);
        await promise;
    }
    get id() {
        return __classPrivateFieldGet(this, _InformationManager_id, "f");
    }
    get name() {
        return __classPrivateFieldGet(this, _InformationManager_name, "f");
    }
    updateName(updatedName) {
        _console$p.assertTypeWithError(updatedName, "string");
        __classPrivateFieldSet(this, _InformationManager_name, updatedName, "f");
        _console$p.log({ updatedName: __classPrivateFieldGet(this, _InformationManager_name, "f") });
        __classPrivateFieldGet(this, _InformationManager_instances, "a", _InformationManager_dispatchEvent_get).call(this, "getName", { name: __classPrivateFieldGet(this, _InformationManager_name, "f") });
    }
    async setName(newName) {
        _console$p.assertTypeWithError(newName, "string");
        _console$p.assertRangeWithError("newName", newName.length, MinNameLength, MaxNameLength);
        const setNameData = textEncoder.encode(newName);
        _console$p.log({ setNameData });
        const promise = this.waitForEvent("getName");
        this.sendMessage([{ type: "setName", data: setNameData.buffer }]);
        await promise;
    }
    get type() {
        return __classPrivateFieldGet(this, _InformationManager_type, "f");
    }
    get typeEnum() {
        return DeviceTypes.indexOf(this.type);
    }
    updateType(updatedType) {
        __classPrivateFieldGet(this, _InformationManager_instances, "m", _InformationManager_assertValidDeviceType).call(this, updatedType);
        if (updatedType == this.type) {
            _console$p.log("redundant type assignment");
            return;
        }
        __classPrivateFieldSet(this, _InformationManager_type, updatedType, "f");
        _console$p.log({ updatedType: __classPrivateFieldGet(this, _InformationManager_type, "f") });
        __classPrivateFieldGet(this, _InformationManager_instances, "a", _InformationManager_dispatchEvent_get).call(this, "getType", { type: __classPrivateFieldGet(this, _InformationManager_type, "f") });
    }
    async setType(newType) {
        __classPrivateFieldGet(this, _InformationManager_instances, "m", _InformationManager_assertValidDeviceType).call(this, newType);
        const newTypeEnum = DeviceTypes.indexOf(newType);
        __classPrivateFieldGet(this, _InformationManager_instances, "m", _InformationManager_setTypeEnum).call(this, newTypeEnum);
    }
    get isInsole() {
        switch (this.type) {
            case "leftInsole":
            case "rightInsole":
                return true;
            default:
                return false;
        }
    }
    get isGlove() {
        switch (this.type) {
            case "leftGlove":
            case "rightGlove":
                return true;
            default:
                return false;
        }
    }
    get side() {
        switch (this.type) {
            case "leftInsole":
            case "leftGlove":
                return "left";
            case "rightInsole":
            case "rightGlove":
                return "right";
            default:
                return "left";
        }
    }
    get mtu() {
        return __classPrivateFieldGet(this, _InformationManager_mtu, "f");
    }
    get isCurrentTimeSet() {
        return __classPrivateFieldGet(this, _InformationManager_isCurrentTimeSet, "f");
    }
    parseMessage(messageType, dataView) {
        _console$p.log({ messageType });
        switch (messageType) {
            case "isCharging":
                const isCharging = Boolean(dataView.getUint8(0));
                _console$p.log({ isCharging });
                __classPrivateFieldGet(this, _InformationManager_instances, "m", _InformationManager_updateIsCharging).call(this, isCharging);
                break;
            case "getBatteryCurrent":
                const batteryCurrent = dataView.getFloat32(0, true);
                _console$p.log({ batteryCurrent });
                __classPrivateFieldGet(this, _InformationManager_instances, "m", _InformationManager_updateBatteryCurrent).call(this, batteryCurrent);
                break;
            case "getId":
                const id = textDecoder.decode(dataView.buffer);
                _console$p.log({ id });
                __classPrivateFieldGet(this, _InformationManager_instances, "m", _InformationManager_updateId).call(this, id);
                break;
            case "getName":
            case "setName":
                const name = textDecoder.decode(dataView.buffer);
                _console$p.log({ name });
                this.updateName(name);
                break;
            case "getType":
            case "setType":
                const typeEnum = dataView.getUint8(0);
                const type = DeviceTypes[typeEnum];
                _console$p.log({ typeEnum, type });
                this.updateType(type);
                break;
            case "getMtu":
                let mtu = dataView.getUint16(0, true);
                if (this.connectionType != "webSocket" &&
                    this.connectionType != "udp") {
                    mtu = Math.min(mtu, 512);
                }
                _console$p.log({ mtu });
                __classPrivateFieldGet(this, _InformationManager_instances, "m", _InformationManager_updateMtu).call(this, mtu);
                break;
            case "getCurrentTime":
            case "setCurrentTime":
                const currentTime = Number(dataView.getBigUint64(0, true));
                __classPrivateFieldGet(this, _InformationManager_instances, "m", _InformationManager_onCurrentTime).call(this, currentTime);
                break;
            default:
                throw Error(`uncaught messageType ${messageType}`);
        }
    }
    clear() {
        __classPrivateFieldSet(this, _InformationManager_isCurrentTimeSet, false, "f");
    }
}
_InformationManager_isCharging = new WeakMap(), _InformationManager_batteryCurrent = new WeakMap(), _InformationManager_id = new WeakMap(), _InformationManager_name = new WeakMap(), _InformationManager_type = new WeakMap(), _InformationManager_mtu = new WeakMap(), _InformationManager_isCurrentTimeSet = new WeakMap(), _InformationManager_instances = new WeakSet(), _InformationManager_dispatchEvent_get = function _InformationManager_dispatchEvent_get() {
    return this.eventDispatcher.dispatchEvent;
}, _InformationManager_updateIsCharging = function _InformationManager_updateIsCharging(updatedIsCharging) {
    _console$p.assertTypeWithError(updatedIsCharging, "boolean");
    __classPrivateFieldSet(this, _InformationManager_isCharging, updatedIsCharging, "f");
    _console$p.log({ isCharging: __classPrivateFieldGet(this, _InformationManager_isCharging, "f") });
    __classPrivateFieldGet(this, _InformationManager_instances, "a", _InformationManager_dispatchEvent_get).call(this, "isCharging", { isCharging: __classPrivateFieldGet(this, _InformationManager_isCharging, "f") });
}, _InformationManager_updateBatteryCurrent = function _InformationManager_updateBatteryCurrent(updatedBatteryCurrent) {
    _console$p.assertTypeWithError(updatedBatteryCurrent, "number");
    __classPrivateFieldSet(this, _InformationManager_batteryCurrent, updatedBatteryCurrent, "f");
    _console$p.log({ batteryCurrent: __classPrivateFieldGet(this, _InformationManager_batteryCurrent, "f") });
    __classPrivateFieldGet(this, _InformationManager_instances, "a", _InformationManager_dispatchEvent_get).call(this, "getBatteryCurrent", {
        batteryCurrent: __classPrivateFieldGet(this, _InformationManager_batteryCurrent, "f"),
    });
}, _InformationManager_updateId = function _InformationManager_updateId(updatedId) {
    _console$p.assertTypeWithError(updatedId, "string");
    __classPrivateFieldSet(this, _InformationManager_id, updatedId, "f");
    _console$p.log({ id: __classPrivateFieldGet(this, _InformationManager_id, "f") });
    __classPrivateFieldGet(this, _InformationManager_instances, "a", _InformationManager_dispatchEvent_get).call(this, "getId", { id: __classPrivateFieldGet(this, _InformationManager_id, "f") });
}, _InformationManager_assertValidDeviceType = function _InformationManager_assertValidDeviceType(type) {
    _console$p.assertEnumWithError(type, DeviceTypes);
}, _InformationManager_assertValidDeviceTypeEnum = function _InformationManager_assertValidDeviceTypeEnum(typeEnum) {
    _console$p.assertTypeWithError(typeEnum, "number");
    _console$p.assertWithError(typeEnum in DeviceTypes, `invalid typeEnum ${typeEnum}`);
}, _InformationManager_setTypeEnum = async function _InformationManager_setTypeEnum(newTypeEnum) {
    __classPrivateFieldGet(this, _InformationManager_instances, "m", _InformationManager_assertValidDeviceTypeEnum).call(this, newTypeEnum);
    const setTypeData = Uint8Array.from([newTypeEnum]);
    _console$p.log({ setTypeData });
    const promise = this.waitForEvent("getType");
    this.sendMessage([{ type: "setType", data: setTypeData.buffer }]);
    await promise;
}, _InformationManager_updateMtu = function _InformationManager_updateMtu(newMtu) {
    _console$p.assertTypeWithError(newMtu, "number");
    if (__classPrivateFieldGet(this, _InformationManager_mtu, "f") == newMtu) {
        _console$p.log("redundant mtu assignment", newMtu);
        return;
    }
    __classPrivateFieldSet(this, _InformationManager_mtu, newMtu, "f");
    __classPrivateFieldGet(this, _InformationManager_instances, "a", _InformationManager_dispatchEvent_get).call(this, "getMtu", { mtu: __classPrivateFieldGet(this, _InformationManager_mtu, "f") });
}, _InformationManager_onCurrentTime = function _InformationManager_onCurrentTime(currentTime) {
    _console$p.log({ currentTime });
    __classPrivateFieldSet(this, _InformationManager_isCurrentTimeSet, currentTime != 0 || Math.abs(Date.now() - currentTime) < Uint16Max, "f");
    if (!__classPrivateFieldGet(this, _InformationManager_isCurrentTimeSet, "f")) {
        __classPrivateFieldGet(this, _InformationManager_instances, "m", _InformationManager_setCurrentTime).call(this, false);
    }
}, _InformationManager_setCurrentTime = async function _InformationManager_setCurrentTime(sendImmediately) {
    _console$p.log("setting current time...");
    const dataView = new DataView(new ArrayBuffer(8));
    dataView.setBigUint64(0, BigInt(Date.now()), true);
    const promise = this.waitForEvent("getCurrentTime");
    this.sendMessage([{ type: "setCurrentTime", data: dataView.buffer }], sendImmediately);
    await promise;
};

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

var _VibrationManager_instances, _VibrationManager_verifyLocation, _VibrationManager_verifyLocations, _VibrationManager_createLocationsBitmask, _VibrationManager_assertNonEmptyArray, _VibrationManager_verifyWaveformEffect, _VibrationManager_verifyWaveformEffectSegment, _VibrationManager_verifyWaveformEffectSegmentLoopCount, _VibrationManager_verifyWaveformEffectSegments, _VibrationManager_verifyWaveformEffectSequenceLoopCount, _VibrationManager_verifyWaveformSegment, _VibrationManager_verifyWaveformSegments, _VibrationManager_createWaveformEffectsData, _VibrationManager_createWaveformData, _VibrationManager_verifyVibrationType, _VibrationManager_createData;
const _console$o = createConsole("VibrationManager");
const VibrationLocations = ["front", "rear"];
const VibrationTypes = ["waveformEffect", "waveform"];
const VibrationMessageTypes = ["triggerVibration"];
const MaxNumberOfVibrationWaveformEffectSegments = 8;
const MaxVibrationWaveformSegmentDuration = 2550;
const MaxVibrationWaveformEffectSegmentDelay = 1270;
const MaxVibrationWaveformEffectSegmentLoopCount = 3;
const MaxNumberOfVibrationWaveformSegments = 20;
const MaxVibrationWaveformEffectSequenceLoopCount = 6;
class VibrationManager {
    constructor() {
        _VibrationManager_instances.add(this);
        autoBind$1(this);
    }
    async triggerVibration(vibrationConfigurations, sendImmediately = true) {
        let triggerVibrationData;
        vibrationConfigurations.forEach((vibrationConfiguration) => {
            const { type } = vibrationConfiguration;
            let { locations } = vibrationConfiguration;
            locations = locations || VibrationLocations.slice();
            let arrayBuffer;
            switch (type) {
                case "waveformEffect":
                    {
                        const { segments, loopCount } = vibrationConfiguration;
                        arrayBuffer = __classPrivateFieldGet(this, _VibrationManager_instances, "m", _VibrationManager_createWaveformEffectsData).call(this, locations, segments, loopCount);
                    }
                    break;
                case "waveform":
                    {
                        const { segments } = vibrationConfiguration;
                        arrayBuffer = __classPrivateFieldGet(this, _VibrationManager_instances, "m", _VibrationManager_createWaveformData).call(this, locations, segments);
                    }
                    break;
                default:
                    throw Error(`invalid vibration type "${type}"`);
            }
            _console$o.log({ type, arrayBuffer });
            triggerVibrationData = concatenateArrayBuffers(triggerVibrationData, arrayBuffer);
        });
        await this.sendMessage([{ type: "triggerVibration", data: triggerVibrationData }], sendImmediately);
    }
}
_VibrationManager_instances = new WeakSet(), _VibrationManager_verifyLocation = function _VibrationManager_verifyLocation(location) {
    _console$o.assertTypeWithError(location, "string");
    _console$o.assertWithError(VibrationLocations.includes(location), `invalid location "${location}"`);
}, _VibrationManager_verifyLocations = function _VibrationManager_verifyLocations(locations) {
    __classPrivateFieldGet(this, _VibrationManager_instances, "m", _VibrationManager_assertNonEmptyArray).call(this, locations);
    locations.forEach((location) => {
        __classPrivateFieldGet(this, _VibrationManager_instances, "m", _VibrationManager_verifyLocation).call(this, location);
    });
}, _VibrationManager_createLocationsBitmask = function _VibrationManager_createLocationsBitmask(locations) {
    __classPrivateFieldGet(this, _VibrationManager_instances, "m", _VibrationManager_verifyLocations).call(this, locations);
    let locationsBitmask = 0;
    locations.forEach((location) => {
        const locationIndex = VibrationLocations.indexOf(location);
        locationsBitmask |= 1 << locationIndex;
    });
    _console$o.log({ locationsBitmask });
    _console$o.assertWithError(locationsBitmask > 0, `locationsBitmask must not be zero`);
    return locationsBitmask;
}, _VibrationManager_assertNonEmptyArray = function _VibrationManager_assertNonEmptyArray(array) {
    _console$o.assertWithError(Array.isArray(array), "passed non-array");
    _console$o.assertWithError(array.length > 0, "passed empty array");
}, _VibrationManager_verifyWaveformEffect = function _VibrationManager_verifyWaveformEffect(waveformEffect) {
    _console$o.assertWithError(VibrationWaveformEffects.includes(waveformEffect), `invalid waveformEffect "${waveformEffect}"`);
}, _VibrationManager_verifyWaveformEffectSegment = function _VibrationManager_verifyWaveformEffectSegment(waveformEffectSegment) {
    if (waveformEffectSegment.effect != undefined) {
        const waveformEffect = waveformEffectSegment.effect;
        __classPrivateFieldGet(this, _VibrationManager_instances, "m", _VibrationManager_verifyWaveformEffect).call(this, waveformEffect);
    }
    else if (waveformEffectSegment.delay != undefined) {
        const { delay } = waveformEffectSegment;
        _console$o.assertWithError(delay >= 0, `delay must be 0ms or greater (got ${delay})`);
        _console$o.assertWithError(delay <= MaxVibrationWaveformEffectSegmentDelay, `delay must be ${MaxVibrationWaveformEffectSegmentDelay}ms or less (got ${delay})`);
    }
    else {
        throw Error("no effect or delay found in waveformEffectSegment");
    }
    if (waveformEffectSegment.loopCount != undefined) {
        const { loopCount } = waveformEffectSegment;
        __classPrivateFieldGet(this, _VibrationManager_instances, "m", _VibrationManager_verifyWaveformEffectSegmentLoopCount).call(this, loopCount);
    }
}, _VibrationManager_verifyWaveformEffectSegmentLoopCount = function _VibrationManager_verifyWaveformEffectSegmentLoopCount(waveformEffectSegmentLoopCount) {
    _console$o.assertTypeWithError(waveformEffectSegmentLoopCount, "number");
    _console$o.assertWithError(waveformEffectSegmentLoopCount >= 0, `waveformEffectSegmentLoopCount must be 0 or greater (got ${waveformEffectSegmentLoopCount})`);
    _console$o.assertWithError(waveformEffectSegmentLoopCount <= MaxVibrationWaveformEffectSegmentLoopCount, `waveformEffectSegmentLoopCount must be ${MaxVibrationWaveformEffectSegmentLoopCount} or fewer (got ${waveformEffectSegmentLoopCount})`);
}, _VibrationManager_verifyWaveformEffectSegments = function _VibrationManager_verifyWaveformEffectSegments(waveformEffectSegments) {
    __classPrivateFieldGet(this, _VibrationManager_instances, "m", _VibrationManager_assertNonEmptyArray).call(this, waveformEffectSegments);
    _console$o.assertWithError(waveformEffectSegments.length <= MaxNumberOfVibrationWaveformEffectSegments, `must have ${MaxNumberOfVibrationWaveformEffectSegments} waveformEffectSegments or fewer (got ${waveformEffectSegments.length})`);
    waveformEffectSegments.forEach((waveformEffectSegment) => {
        __classPrivateFieldGet(this, _VibrationManager_instances, "m", _VibrationManager_verifyWaveformEffectSegment).call(this, waveformEffectSegment);
    });
}, _VibrationManager_verifyWaveformEffectSequenceLoopCount = function _VibrationManager_verifyWaveformEffectSequenceLoopCount(waveformEffectSequenceLoopCount) {
    _console$o.assertTypeWithError(waveformEffectSequenceLoopCount, "number");
    _console$o.assertWithError(waveformEffectSequenceLoopCount >= 0, `waveformEffectSequenceLoopCount must be 0 or greater (got ${waveformEffectSequenceLoopCount})`);
    _console$o.assertWithError(waveformEffectSequenceLoopCount <= MaxVibrationWaveformEffectSequenceLoopCount, `waveformEffectSequenceLoopCount must be ${MaxVibrationWaveformEffectSequenceLoopCount} or fewer (got ${waveformEffectSequenceLoopCount})`);
}, _VibrationManager_verifyWaveformSegment = function _VibrationManager_verifyWaveformSegment(waveformSegment) {
    _console$o.assertTypeWithError(waveformSegment.amplitude, "number");
    _console$o.assertWithError(waveformSegment.amplitude >= 0, `amplitude must be 0 or greater (got ${waveformSegment.amplitude})`);
    _console$o.assertWithError(waveformSegment.amplitude <= 1, `amplitude must be 1 or less (got ${waveformSegment.amplitude})`);
    _console$o.assertTypeWithError(waveformSegment.duration, "number");
    _console$o.assertWithError(waveformSegment.duration > 0, `duration must be greater than 0ms (got ${waveformSegment.duration}ms)`);
    _console$o.assertWithError(waveformSegment.duration <= MaxVibrationWaveformSegmentDuration, `duration must be ${MaxVibrationWaveformSegmentDuration}ms or less (got ${waveformSegment.duration}ms)`);
}, _VibrationManager_verifyWaveformSegments = function _VibrationManager_verifyWaveformSegments(waveformSegments) {
    __classPrivateFieldGet(this, _VibrationManager_instances, "m", _VibrationManager_assertNonEmptyArray).call(this, waveformSegments);
    _console$o.assertWithError(waveformSegments.length <= MaxNumberOfVibrationWaveformSegments, `must have ${MaxNumberOfVibrationWaveformSegments} waveformSegments or fewer (got ${waveformSegments.length})`);
    waveformSegments.forEach((waveformSegment) => {
        __classPrivateFieldGet(this, _VibrationManager_instances, "m", _VibrationManager_verifyWaveformSegment).call(this, waveformSegment);
    });
}, _VibrationManager_createWaveformEffectsData = function _VibrationManager_createWaveformEffectsData(locations, waveformEffectSegments, waveformEffectSequenceLoopCount = 0) {
    __classPrivateFieldGet(this, _VibrationManager_instances, "m", _VibrationManager_verifyWaveformEffectSegments).call(this, waveformEffectSegments);
    __classPrivateFieldGet(this, _VibrationManager_instances, "m", _VibrationManager_verifyWaveformEffectSequenceLoopCount).call(this, waveformEffectSequenceLoopCount);
    let dataArray = [];
    let byteOffset = 0;
    const hasAtLeast1WaveformEffectWithANonzeroLoopCount = waveformEffectSegments.some((waveformEffectSegment) => {
        const { loopCount } = waveformEffectSegment;
        return loopCount != undefined && loopCount > 0;
    });
    const includeAllWaveformEffectSegments = hasAtLeast1WaveformEffectWithANonzeroLoopCount || waveformEffectSequenceLoopCount != 0;
    for (let index = 0; index < waveformEffectSegments.length ||
        (includeAllWaveformEffectSegments && index < MaxNumberOfVibrationWaveformEffectSegments); index++) {
        const waveformEffectSegment = waveformEffectSegments[index] || { effect: "none" };
        if (waveformEffectSegment.effect != undefined) {
            const waveformEffect = waveformEffectSegment.effect;
            dataArray[byteOffset++] = VibrationWaveformEffects.indexOf(waveformEffect);
        }
        else if (waveformEffectSegment.delay != undefined) {
            const { delay } = waveformEffectSegment;
            dataArray[byteOffset++] = (1 << 7) | Math.floor(delay / 10);
        }
        else {
            throw Error("invalid waveformEffectSegment");
        }
    }
    const includeAllWaveformEffectSegmentLoopCounts = waveformEffectSequenceLoopCount != 0;
    for (let index = 0; index < waveformEffectSegments.length ||
        (includeAllWaveformEffectSegmentLoopCounts && index < MaxNumberOfVibrationWaveformEffectSegments); index++) {
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
    _console$o.log({ dataArray, dataView });
    return __classPrivateFieldGet(this, _VibrationManager_instances, "m", _VibrationManager_createData).call(this, locations, "waveformEffect", dataView);
}, _VibrationManager_createWaveformData = function _VibrationManager_createWaveformData(locations, waveformSegments) {
    __classPrivateFieldGet(this, _VibrationManager_instances, "m", _VibrationManager_verifyWaveformSegments).call(this, waveformSegments);
    const dataView = new DataView(new ArrayBuffer(waveformSegments.length * 2));
    waveformSegments.forEach((waveformSegment, index) => {
        dataView.setUint8(index * 2, Math.floor(waveformSegment.amplitude * 127));
        dataView.setUint8(index * 2 + 1, Math.floor(waveformSegment.duration / 10));
    });
    _console$o.log({ dataView });
    return __classPrivateFieldGet(this, _VibrationManager_instances, "m", _VibrationManager_createData).call(this, locations, "waveform", dataView);
}, _VibrationManager_verifyVibrationType = function _VibrationManager_verifyVibrationType(vibrationType) {
    _console$o.assertTypeWithError(vibrationType, "string");
    _console$o.assertWithError(VibrationTypes.includes(vibrationType), `invalid vibrationType "${vibrationType}"`);
}, _VibrationManager_createData = function _VibrationManager_createData(locations, vibrationType, dataView) {
    _console$o.assertWithError(dataView?.byteLength > 0, "no data received");
    const locationsBitmask = __classPrivateFieldGet(this, _VibrationManager_instances, "m", _VibrationManager_createLocationsBitmask).call(this, locations);
    __classPrivateFieldGet(this, _VibrationManager_instances, "m", _VibrationManager_verifyVibrationType).call(this, vibrationType);
    const vibrationTypeIndex = VibrationTypes.indexOf(vibrationType);
    _console$o.log({ locationsBitmask, vibrationTypeIndex, dataView });
    const data = concatenateArrayBuffers(locationsBitmask, vibrationTypeIndex, dataView.byteLength, dataView);
    _console$o.log({ data });
    return data;
};

var _WifiManager_instances, _WifiManager_dispatchEvent_get, _WifiManager_isWifiAvailable, _WifiManager_updateIsWifiAvailable, _WifiManager_assertWifiIsAvailable, _WifiManager_wifiSSID, _WifiManager_updateWifiSSID, _WifiManager_wifiPassword, _WifiManager_updateWifiPassword, _WifiManager_wifiConnectionEnabled, _WifiManager_updateWifiConnectionEnabled, _WifiManager_isWifiConnected, _WifiManager_updateIsWifiConnected, _WifiManager_ipAddress, _WifiManager_updateIpAddress, _WifiManager_isWifiSecure, _WifiManager_updateIsWifiSecure;
const _console$n = createConsole("WifiManager", { log: false });
const MinWifiSSIDLength = 1;
const MaxWifiSSIDLength = 32;
const MinWifiPasswordLength = 8;
const MaxWifiPasswordLength = 64;
const WifiMessageTypes = [
    "isWifiAvailable",
    "getWifiSSID",
    "setWifiSSID",
    "getWifiPassword",
    "setWifiPassword",
    "getEnableWifiConnection",
    "setEnableWifiConnection",
    "isWifiConnected",
    "ipAddress",
    "isWifiSecure",
];
const RequiredWifiMessageTypes = [
    "getWifiSSID",
    "getWifiPassword",
    "getEnableWifiConnection",
    "isWifiConnected",
    "ipAddress",
    "isWifiSecure",
];
const WifiEventTypes = WifiMessageTypes;
class WifiManager {
    constructor() {
        _WifiManager_instances.add(this);
        _WifiManager_isWifiAvailable.set(this, false);
        _WifiManager_wifiSSID.set(this, "");
        _WifiManager_wifiPassword.set(this, "");
        _WifiManager_wifiConnectionEnabled.set(this, void 0);
        _WifiManager_isWifiConnected.set(this, false);
        _WifiManager_ipAddress.set(this, void 0);
        _WifiManager_isWifiSecure.set(this, false);
        autoBind$1(this);
    }
    get waitForEvent() {
        return this.eventDispatcher.waitForEvent;
    }
    requestRequiredInformation() {
        _console$n.log("requesting required wifi information");
        const messages = RequiredWifiMessageTypes.map((messageType) => ({
            type: messageType,
        }));
        this.sendMessage(messages, false);
    }
    get isWifiAvailable() {
        return __classPrivateFieldGet(this, _WifiManager_isWifiAvailable, "f");
    }
    get wifiSSID() {
        return __classPrivateFieldGet(this, _WifiManager_wifiSSID, "f");
    }
    async setWifiSSID(newWifiSSID) {
        __classPrivateFieldGet(this, _WifiManager_instances, "m", _WifiManager_assertWifiIsAvailable).call(this);
        if (__classPrivateFieldGet(this, _WifiManager_wifiConnectionEnabled, "f")) {
            _console$n.error("cannot change ssid while wifi connection is enabled");
            return;
        }
        _console$n.assertTypeWithError(newWifiSSID, "string");
        _console$n.assertRangeWithError("wifiSSID", newWifiSSID.length, MinWifiSSIDLength, MaxWifiSSIDLength);
        const setWifiSSIDData = textEncoder.encode(newWifiSSID);
        _console$n.log({ setWifiSSIDData });
        const promise = this.waitForEvent("getWifiSSID");
        this.sendMessage([{ type: "setWifiSSID", data: setWifiSSIDData.buffer }]);
        await promise;
    }
    get wifiPassword() {
        return __classPrivateFieldGet(this, _WifiManager_wifiPassword, "f");
    }
    async setWifiPassword(newWifiPassword) {
        __classPrivateFieldGet(this, _WifiManager_instances, "m", _WifiManager_assertWifiIsAvailable).call(this);
        if (__classPrivateFieldGet(this, _WifiManager_wifiConnectionEnabled, "f")) {
            _console$n.error("cannot change password while wifi connection is enabled");
            return;
        }
        _console$n.assertTypeWithError(newWifiPassword, "string");
        if (newWifiPassword.length > 0) {
            _console$n.assertRangeWithError("wifiPassword", newWifiPassword.length, MinWifiPasswordLength, MaxWifiPasswordLength);
        }
        const setWifiPasswordData = textEncoder.encode(newWifiPassword);
        _console$n.log({ setWifiPasswordData });
        const promise = this.waitForEvent("getWifiPassword");
        this.sendMessage([
            { type: "setWifiPassword", data: setWifiPasswordData.buffer },
        ]);
        await promise;
    }
    get wifiConnectionEnabled() {
        return __classPrivateFieldGet(this, _WifiManager_wifiConnectionEnabled, "f");
    }
    async setWifiConnectionEnabled(newWifiConnectionEnabled, sendImmediately = true) {
        __classPrivateFieldGet(this, _WifiManager_instances, "m", _WifiManager_assertWifiIsAvailable).call(this);
        _console$n.assertTypeWithError(newWifiConnectionEnabled, "boolean");
        if (__classPrivateFieldGet(this, _WifiManager_wifiConnectionEnabled, "f") == newWifiConnectionEnabled) {
            _console$n.log(`redundant wifiConnectionEnabled assignment ${newWifiConnectionEnabled}`);
            return;
        }
        const promise = this.waitForEvent("getEnableWifiConnection");
        this.sendMessage([
            {
                type: "setEnableWifiConnection",
                data: Uint8Array.from([Number(newWifiConnectionEnabled)]).buffer,
            },
        ], sendImmediately);
        await promise;
    }
    async toggleWifiConnection() {
        return this.setWifiConnectionEnabled(!this.wifiConnectionEnabled);
    }
    async enableWifiConnection() {
        return this.setWifiConnectionEnabled(true);
    }
    async disableWifiConnection() {
        return this.setWifiConnectionEnabled(false);
    }
    get isWifiConnected() {
        return __classPrivateFieldGet(this, _WifiManager_isWifiConnected, "f");
    }
    get ipAddress() {
        return __classPrivateFieldGet(this, _WifiManager_ipAddress, "f");
    }
    get isWifiSecure() {
        return __classPrivateFieldGet(this, _WifiManager_isWifiSecure, "f");
    }
    parseMessage(messageType, dataView) {
        _console$n.log({ messageType });
        switch (messageType) {
            case "isWifiAvailable":
                const isWifiAvailable = Boolean(dataView.getUint8(0));
                _console$n.log({ isWifiAvailable });
                __classPrivateFieldGet(this, _WifiManager_instances, "m", _WifiManager_updateIsWifiAvailable).call(this, isWifiAvailable);
                break;
            case "getWifiSSID":
            case "setWifiSSID":
                const ssid = textDecoder.decode(dataView.buffer);
                _console$n.log({ ssid });
                __classPrivateFieldGet(this, _WifiManager_instances, "m", _WifiManager_updateWifiSSID).call(this, ssid);
                break;
            case "getWifiPassword":
            case "setWifiPassword":
                const password = textDecoder.decode(dataView.buffer);
                _console$n.log({ password });
                __classPrivateFieldGet(this, _WifiManager_instances, "m", _WifiManager_updateWifiPassword).call(this, password);
                break;
            case "getEnableWifiConnection":
            case "setEnableWifiConnection":
                const enableWifiConnection = Boolean(dataView.getUint8(0));
                _console$n.log({ enableWifiConnection });
                __classPrivateFieldGet(this, _WifiManager_instances, "m", _WifiManager_updateWifiConnectionEnabled).call(this, enableWifiConnection);
                break;
            case "isWifiConnected":
                const isWifiConnected = Boolean(dataView.getUint8(0));
                _console$n.log({ isWifiConnected });
                __classPrivateFieldGet(this, _WifiManager_instances, "m", _WifiManager_updateIsWifiConnected).call(this, isWifiConnected);
                break;
            case "ipAddress":
                const ipAddress = new Uint8Array(dataView.buffer.slice(0, 4)).join(".");
                _console$n.log({ ipAddress });
                __classPrivateFieldGet(this, _WifiManager_instances, "m", _WifiManager_updateIpAddress).call(this, ipAddress);
                break;
            case "isWifiSecure":
                const isWifiSecure = Boolean(dataView.getUint8(0));
                _console$n.log({ isWifiSecure });
                __classPrivateFieldGet(this, _WifiManager_instances, "m", _WifiManager_updateIsWifiSecure).call(this, isWifiSecure);
                break;
            default:
                throw Error(`uncaught messageType ${messageType}`);
        }
    }
    clear() {
        __classPrivateFieldSet(this, _WifiManager_wifiSSID, "", "f");
        __classPrivateFieldSet(this, _WifiManager_wifiPassword, "", "f");
        __classPrivateFieldSet(this, _WifiManager_ipAddress, "", "f");
        __classPrivateFieldSet(this, _WifiManager_isWifiConnected, false, "f");
        __classPrivateFieldSet(this, _WifiManager_isWifiAvailable, false, "f");
    }
}
_WifiManager_isWifiAvailable = new WeakMap(), _WifiManager_wifiSSID = new WeakMap(), _WifiManager_wifiPassword = new WeakMap(), _WifiManager_wifiConnectionEnabled = new WeakMap(), _WifiManager_isWifiConnected = new WeakMap(), _WifiManager_ipAddress = new WeakMap(), _WifiManager_isWifiSecure = new WeakMap(), _WifiManager_instances = new WeakSet(), _WifiManager_dispatchEvent_get = function _WifiManager_dispatchEvent_get() {
    return this.eventDispatcher.dispatchEvent;
}, _WifiManager_updateIsWifiAvailable = function _WifiManager_updateIsWifiAvailable(updatedIsWifiAvailable) {
    _console$n.assertTypeWithError(updatedIsWifiAvailable, "boolean");
    __classPrivateFieldSet(this, _WifiManager_isWifiAvailable, updatedIsWifiAvailable, "f");
    _console$n.log({ isWifiAvailable: __classPrivateFieldGet(this, _WifiManager_isWifiAvailable, "f") });
    __classPrivateFieldGet(this, _WifiManager_instances, "a", _WifiManager_dispatchEvent_get).call(this, "isWifiAvailable", {
        isWifiAvailable: __classPrivateFieldGet(this, _WifiManager_isWifiAvailable, "f"),
    });
}, _WifiManager_assertWifiIsAvailable = function _WifiManager_assertWifiIsAvailable() {
    _console$n.assertWithError(__classPrivateFieldGet(this, _WifiManager_isWifiAvailable, "f"), "wifi is not available");
}, _WifiManager_updateWifiSSID = function _WifiManager_updateWifiSSID(updatedWifiSSID) {
    _console$n.assertTypeWithError(updatedWifiSSID, "string");
    __classPrivateFieldSet(this, _WifiManager_wifiSSID, updatedWifiSSID, "f");
    _console$n.log({ wifiSSID: __classPrivateFieldGet(this, _WifiManager_wifiSSID, "f") });
    __classPrivateFieldGet(this, _WifiManager_instances, "a", _WifiManager_dispatchEvent_get).call(this, "getWifiSSID", { wifiSSID: __classPrivateFieldGet(this, _WifiManager_wifiSSID, "f") });
}, _WifiManager_updateWifiPassword = function _WifiManager_updateWifiPassword(updatedWifiPassword) {
    _console$n.assertTypeWithError(updatedWifiPassword, "string");
    __classPrivateFieldSet(this, _WifiManager_wifiPassword, updatedWifiPassword, "f");
    _console$n.log({ wifiPassword: __classPrivateFieldGet(this, _WifiManager_wifiPassword, "f") });
    __classPrivateFieldGet(this, _WifiManager_instances, "a", _WifiManager_dispatchEvent_get).call(this, "getWifiPassword", {
        wifiPassword: __classPrivateFieldGet(this, _WifiManager_wifiPassword, "f"),
    });
}, _WifiManager_updateWifiConnectionEnabled = function _WifiManager_updateWifiConnectionEnabled(wifiConnectionEnabled) {
    _console$n.log({ wifiConnectionEnabled });
    __classPrivateFieldSet(this, _WifiManager_wifiConnectionEnabled, wifiConnectionEnabled, "f");
    __classPrivateFieldGet(this, _WifiManager_instances, "a", _WifiManager_dispatchEvent_get).call(this, "getEnableWifiConnection", {
        wifiConnectionEnabled: wifiConnectionEnabled,
    });
}, _WifiManager_updateIsWifiConnected = function _WifiManager_updateIsWifiConnected(updatedIsWifiConnected) {
    _console$n.assertTypeWithError(updatedIsWifiConnected, "boolean");
    __classPrivateFieldSet(this, _WifiManager_isWifiConnected, updatedIsWifiConnected, "f");
    _console$n.log({ isWifiConnected: __classPrivateFieldGet(this, _WifiManager_isWifiConnected, "f") });
    __classPrivateFieldGet(this, _WifiManager_instances, "a", _WifiManager_dispatchEvent_get).call(this, "isWifiConnected", {
        isWifiConnected: __classPrivateFieldGet(this, _WifiManager_isWifiConnected, "f"),
    });
}, _WifiManager_updateIpAddress = function _WifiManager_updateIpAddress(updatedIpAddress) {
    _console$n.assertTypeWithError(updatedIpAddress, "string");
    __classPrivateFieldSet(this, _WifiManager_ipAddress, updatedIpAddress, "f");
    _console$n.log({ ipAddress: __classPrivateFieldGet(this, _WifiManager_ipAddress, "f") });
    __classPrivateFieldGet(this, _WifiManager_instances, "a", _WifiManager_dispatchEvent_get).call(this, "ipAddress", {
        ipAddress: __classPrivateFieldGet(this, _WifiManager_ipAddress, "f"),
    });
}, _WifiManager_updateIsWifiSecure = function _WifiManager_updateIsWifiSecure(updatedIsWifiSecure) {
    _console$n.assertTypeWithError(updatedIsWifiSecure, "boolean");
    __classPrivateFieldSet(this, _WifiManager_isWifiSecure, updatedIsWifiSecure, "f");
    _console$n.log({ isWifiSecure: __classPrivateFieldGet(this, _WifiManager_isWifiSecure, "f") });
    __classPrivateFieldGet(this, _WifiManager_instances, "a", _WifiManager_dispatchEvent_get).call(this, "isWifiSecure", {
        isWifiSecure: __classPrivateFieldGet(this, _WifiManager_isWifiSecure, "f"),
    });
};

var _BaseConnectionManager_instances, _a$4, _BaseConnectionManager_AssertValidTxRxMessageType, _BaseConnectionManager_assertIsSupported, _BaseConnectionManager_status, _BaseConnectionManager_assertIsNotConnecting, _BaseConnectionManager_assertIsNotDisconnecting, _BaseConnectionManager_pendingMessages, _BaseConnectionManager_isSendingMessages, _BaseConnectionManager_onRxMessage, _BaseConnectionManager_timer, _BaseConnectionManager_checkConnection;
const _console$m = createConsole("BaseConnectionManager", { log: false });
const ConnectionTypes = [
    "webBluetooth",
    "noble",
    "client",
    "webSocket",
    "udp",
];
const ConnectionStatuses = [
    "notConnected",
    "connecting",
    "connected",
    "disconnecting",
];
const ConnectionEventTypes = [
    ...ConnectionStatuses,
    "connectionStatus",
    "isConnected",
];
const TxRxMessageTypes = [
    ...InformationMessageTypes,
    ...SensorConfigurationMessageTypes,
    ...SensorDataMessageTypes,
    ...VibrationMessageTypes,
    ...TfliteMessageTypes,
    ...FileTransferMessageTypes,
    ...WifiMessageTypes,
];
const SMPMessageTypes = ["smp"];
const BatteryLevelMessageTypes = ["batteryLevel"];
const MetaConnectionMessageTypes = ["rx", "tx"];
const ConnectionMessageTypes = [
    ...BatteryLevelMessageTypes,
    ...DeviceInformationTypes,
    ...MetaConnectionMessageTypes,
    ...TxRxMessageTypes,
    ...SMPMessageTypes,
];
class BaseConnectionManager {
    get baseConstructor() {
        return this.constructor;
    }
    static get isSupported() {
        return false;
    }
    get isSupported() {
        return this.baseConstructor.isSupported;
    }
    get canUpdateFirmware() {
        return false;
    }
    get type() {
        return this.baseConstructor.type;
    }
    constructor() {
        _BaseConnectionManager_instances.add(this);
        _BaseConnectionManager_status.set(this, "notConnected");
        _BaseConnectionManager_pendingMessages.set(this, []);
        _BaseConnectionManager_isSendingMessages.set(this, false);
        this.defaultMtu = 23;
        this.mtu = this.defaultMtu;
        _BaseConnectionManager_timer.set(this, new Timer(__classPrivateFieldGet(this, _BaseConnectionManager_instances, "m", _BaseConnectionManager_checkConnection).bind(this), 5000));
        __classPrivateFieldGet(this, _BaseConnectionManager_instances, "m", _BaseConnectionManager_assertIsSupported).call(this);
    }
    get status() {
        return __classPrivateFieldGet(this, _BaseConnectionManager_status, "f");
    }
    set status(newConnectionStatus) {
        _console$m.assertEnumWithError(newConnectionStatus, ConnectionStatuses);
        if (__classPrivateFieldGet(this, _BaseConnectionManager_status, "f") == newConnectionStatus) {
            _console$m.log(`tried to assign same connection status "${newConnectionStatus}"`);
            return;
        }
        _console$m.log(`new connection status "${newConnectionStatus}"`);
        __classPrivateFieldSet(this, _BaseConnectionManager_status, newConnectionStatus, "f");
        this.onStatusUpdated(this.status);
        if (this.isConnected) {
            __classPrivateFieldGet(this, _BaseConnectionManager_timer, "f").start();
        }
        else {
            __classPrivateFieldGet(this, _BaseConnectionManager_timer, "f").stop();
        }
        if (__classPrivateFieldGet(this, _BaseConnectionManager_status, "f") == "notConnected") {
            this.mtu = this.defaultMtu;
        }
    }
    get isConnected() {
        return this.status == "connected";
    }
    get isAvailable() {
        return false;
    }
    assertIsNotConnected() {
        _console$m.assertWithError(!this.isConnected, "device is already connected");
    }
    assertIsConnected() {
        _console$m.assertWithError(this.isConnected, "device is not connected");
    }
    assertIsConnectedAndNotDisconnecting() {
        this.assertIsConnected();
        __classPrivateFieldGet(this, _BaseConnectionManager_instances, "m", _BaseConnectionManager_assertIsNotDisconnecting).call(this);
    }
    async connect() {
        this.assertIsNotConnected();
        __classPrivateFieldGet(this, _BaseConnectionManager_instances, "m", _BaseConnectionManager_assertIsNotConnecting).call(this);
        this.status = "connecting";
    }
    get canReconnect() {
        return false;
    }
    async reconnect() {
        this.assertIsNotConnected();
        __classPrivateFieldGet(this, _BaseConnectionManager_instances, "m", _BaseConnectionManager_assertIsNotConnecting).call(this);
        _console$m.assertWithError(this.canReconnect, "unable to reconnect");
        this.status = "connecting";
        _console$m.log("attempting to reconnect...");
    }
    async disconnect() {
        this.assertIsConnected();
        __classPrivateFieldGet(this, _BaseConnectionManager_instances, "m", _BaseConnectionManager_assertIsNotDisconnecting).call(this);
        this.status = "disconnecting";
        _console$m.log("disconnecting from device...");
    }
    async sendSmpMessage(data) {
        this.assertIsConnectedAndNotDisconnecting();
        _console$m.log("sending smp message", data);
    }
    async sendTxMessages(messages, sendImmediately = true) {
        this.assertIsConnectedAndNotDisconnecting();
        if (messages) {
            __classPrivateFieldGet(this, _BaseConnectionManager_pendingMessages, "f").push(...messages);
            _console$m.log(`appended ${messages.length} messages`);
        }
        if (!sendImmediately) {
            _console$m.log("not sending immediately - waiting until later");
            return;
        }
        if (__classPrivateFieldGet(this, _BaseConnectionManager_isSendingMessages, "f")) {
            _console$m.log("already sending messages - waiting until later");
            return;
        }
        __classPrivateFieldSet(this, _BaseConnectionManager_isSendingMessages, true, "f");
        _console$m.log("sendTxMessages", __classPrivateFieldGet(this, _BaseConnectionManager_pendingMessages, "f").slice());
        const arrayBuffers = __classPrivateFieldGet(this, _BaseConnectionManager_pendingMessages, "f").map((message) => {
            __classPrivateFieldGet(_a$4, _a$4, "m", _BaseConnectionManager_AssertValidTxRxMessageType).call(_a$4, message.type);
            const messageTypeEnum = TxRxMessageTypes.indexOf(message.type);
            const dataLength = new DataView(new ArrayBuffer(2));
            dataLength.setUint16(0, message.data?.byteLength || 0, true);
            return concatenateArrayBuffers(messageTypeEnum, dataLength, message.data);
        });
        __classPrivateFieldGet(this, _BaseConnectionManager_pendingMessages, "f").length = 0;
        if (this.mtu) {
            while (arrayBuffers.length > 0) {
                if (arrayBuffers.every((arrayBuffer) => arrayBuffer.byteLength > this.mtu - 3)) {
                    _console$m.log("every arrayBuffer is too big to send");
                    break;
                }
                _console$m.log("remaining arrayBuffers.length", arrayBuffers.length);
                let arrayBufferByteLength = 0;
                let arrayBufferCount = 0;
                arrayBuffers.some((arrayBuffer) => {
                    if (arrayBufferByteLength + arrayBuffer.byteLength > this.mtu - 3) {
                        _console$m.log(`stopping appending arrayBuffers ( length ${arrayBuffer.byteLength} too much)`);
                        return true;
                    }
                    _console$m.log(`allowing arrayBuffer with length ${arrayBuffer.byteLength}`);
                    arrayBufferCount++;
                    arrayBufferByteLength += arrayBuffer.byteLength;
                });
                const arrayBuffersToSend = arrayBuffers.splice(0, arrayBufferCount);
                _console$m.log({ arrayBufferCount, arrayBuffersToSend });
                const arrayBuffer = concatenateArrayBuffers(...arrayBuffersToSend);
                _console$m.log("sending arrayBuffer (partitioned)", arrayBuffer);
                await this.sendTxData(arrayBuffer);
            }
        }
        else {
            const arrayBuffer = concatenateArrayBuffers(...arrayBuffers);
            _console$m.log("sending arrayBuffer (all)", arrayBuffer);
            await this.sendTxData(arrayBuffer);
        }
        __classPrivateFieldSet(this, _BaseConnectionManager_isSendingMessages, false, "f");
    }
    async sendTxData(data) {
        _console$m.log("sendTxData", data);
    }
    parseRxMessage(dataView) {
        parseMessage(dataView, TxRxMessageTypes, __classPrivateFieldGet(this, _BaseConnectionManager_instances, "m", _BaseConnectionManager_onRxMessage).bind(this), null, true);
        this.onMessagesReceived();
    }
    clear() {
        __classPrivateFieldSet(this, _BaseConnectionManager_isSendingMessages, false, "f");
        __classPrivateFieldGet(this, _BaseConnectionManager_pendingMessages, "f").length = 0;
    }
}
_a$4 = BaseConnectionManager, _BaseConnectionManager_status = new WeakMap(), _BaseConnectionManager_pendingMessages = new WeakMap(), _BaseConnectionManager_isSendingMessages = new WeakMap(), _BaseConnectionManager_timer = new WeakMap(), _BaseConnectionManager_instances = new WeakSet(), _BaseConnectionManager_AssertValidTxRxMessageType = function _BaseConnectionManager_AssertValidTxRxMessageType(messageType) {
    _console$m.assertEnumWithError(messageType, TxRxMessageTypes);
}, _BaseConnectionManager_assertIsSupported = function _BaseConnectionManager_assertIsSupported() {
    _console$m.assertWithError(this.isSupported, `${this.constructor.name} is not supported`);
}, _BaseConnectionManager_assertIsNotConnecting = function _BaseConnectionManager_assertIsNotConnecting() {
    _console$m.assertWithError(this.status != "connecting", "device is already connecting");
}, _BaseConnectionManager_assertIsNotDisconnecting = function _BaseConnectionManager_assertIsNotDisconnecting() {
    _console$m.assertWithError(this.status != "disconnecting", "device is already disconnecting");
}, _BaseConnectionManager_onRxMessage = function _BaseConnectionManager_onRxMessage(messageType, dataView) {
    _console$m.log({ messageType, dataView });
    this.onMessageReceived(messageType, dataView);
}, _BaseConnectionManager_checkConnection = function _BaseConnectionManager_checkConnection() {
    if (!this.isConnected) {
        _console$m.log("timer detected disconnection");
        this.status = "notConnected";
    }
};

function capitalizeFirstCharacter(string) {
    return string[0].toUpperCase() + string.slice(1);
}

const _console$l = createConsole("EventUtils", { log: false });
function addEventListeners(target, boundEventListeners) {
    let addEventListener = target.addEventListener || target.addListener || target.on || target.AddEventListener;
    _console$l.assertWithError(addEventListener, "no add listener function found for target");
    addEventListener = addEventListener.bind(target);
    Object.entries(boundEventListeners).forEach(([eventType, eventListener]) => {
        addEventListener(eventType, eventListener);
    });
}
function removeEventListeners(target, boundEventListeners) {
    let removeEventListener = target.removeEventListener || target.removeListener || target.RemoveEventListener;
    _console$l.assertWithError(removeEventListener, "no remove listener function found for target");
    removeEventListener = removeEventListener.bind(target);
    Object.entries(boundEventListeners).forEach(([eventType, eventListener]) => {
        removeEventListener(eventType, eventListener);
    });
}

const _console$k = createConsole("bluetoothUUIDs", { log: false });
var BluetoothUUID = webbluetooth__namespace.BluetoothUUID;
function generateBluetoothUUID(value) {
    _console$k.assertTypeWithError(value, "string");
    _console$k.assertWithError(value.length == 4, "value must be 4 characters long");
    return `ea6da725-${value}-4f9b-893d-c3913e33b39f`;
}
function stringToCharacteristicUUID(identifier) {
    return BluetoothUUID?.getCharacteristic?.(identifier);
}
function stringToServiceUUID(identifier) {
    return BluetoothUUID?.getService?.(identifier);
}
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
});
const serviceUUIDs = [bluetoothUUIDs.services.main.uuid];
const optionalServiceUUIDs = [
    bluetoothUUIDs.services.deviceInformation.uuid,
    bluetoothUUIDs.services.battery.uuid,
    bluetoothUUIDs.services.smp.uuid,
];
const allServiceUUIDs = [...serviceUUIDs, ...optionalServiceUUIDs];
function getServiceNameFromUUID(serviceUUID) {
    serviceUUID = serviceUUID.toString().toLowerCase();
    const serviceNames = Object.keys(bluetoothUUIDs.services);
    return serviceNames.find((serviceName) => {
        const serviceInfo = bluetoothUUIDs.services[serviceName];
        let serviceInfoUUID = serviceInfo.uuid.toString();
        if (serviceUUID.length == 4) {
            serviceInfoUUID = serviceInfoUUID.slice(4, 8);
        }
        if (!serviceUUID.includes("-")) {
            serviceInfoUUID = serviceInfoUUID.replaceAll("-", "");
        }
        return serviceUUID == serviceInfoUUID;
    });
}
const characteristicUUIDs = [];
const allCharacteristicUUIDs = [];
const allCharacteristicNames = [];
Object.values(bluetoothUUIDs.services).forEach((serviceInfo) => {
    if (!serviceInfo.characteristics) {
        return;
    }
    const characteristicNames = Object.keys(serviceInfo.characteristics);
    characteristicNames.forEach((characteristicName) => {
        const characteristicInfo = serviceInfo.characteristics[characteristicName];
        if (serviceUUIDs.includes(serviceInfo.uuid)) {
            characteristicUUIDs.push(characteristicInfo.uuid);
            characteristicNames.push(characteristicName);
        }
        allCharacteristicUUIDs.push(characteristicInfo.uuid);
        allCharacteristicNames.push(characteristicName);
    });
}, []);
function getCharacteristicNameFromUUID(characteristicUUID) {
    characteristicUUID = characteristicUUID.toString().toLowerCase();
    var characteristicName;
    Object.values(bluetoothUUIDs.services).some((serviceInfo) => {
        const characteristicNames = Object.keys(serviceInfo.characteristics);
        characteristicName = characteristicNames.find((_characteristicName) => {
            const characteristicInfo = serviceInfo.characteristics[_characteristicName];
            let characteristicInfoUUID = characteristicInfo.uuid.toString();
            if (characteristicUUID.length == 4) {
                characteristicInfoUUID = characteristicInfoUUID.slice(4, 8);
            }
            if (!characteristicUUID.includes("-")) {
                characteristicInfoUUID = characteristicInfoUUID.replaceAll("-", "");
            }
            return characteristicUUID == characteristicInfoUUID;
        });
        return characteristicName;
    });
    return characteristicName;
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
        writableAuxiliaries: false,
    };
    switch (characteristicName) {
        case "rx":
        case "tx":
        case "smp":
            properties.read = false;
            break;
    }
    switch (characteristicName) {
        case "batteryLevel":
        case "rx":
        case "smp":
            properties.notify = true;
            break;
    }
    switch (characteristicName) {
        case "smp":
            properties.writeWithoutResponse = true;
            break;
    }
    switch (characteristicName) {
        case "tx":
            properties.write = true;
            break;
    }
    return properties;
}
const serviceDataUUID = "0000";

const _console$j = createConsole("BluetoothConnectionManager", { log: false });
class BluetoothConnectionManager extends BaseConnectionManager {
    constructor() {
        super(...arguments);
        this.isInRange = true;
    }
    get isAvailable() {
        return true;
    }
    onCharacteristicValueChanged(characteristicName, dataView) {
        if (characteristicName == "rx") {
            this.parseRxMessage(dataView);
        }
        else {
            this.onMessageReceived?.(characteristicName, dataView);
        }
    }
    async writeCharacteristic(characteristicName, data) {
        _console$j.log("writeCharacteristic", ...arguments);
    }
    async sendSmpMessage(data) {
        super.sendSmpMessage(data);
        await this.writeCharacteristic("smp", data);
    }
    async sendTxData(data) {
        super.sendTxData(data);
        if (data.byteLength == 0) {
            return;
        }
        await this.writeCharacteristic("tx", data);
    }
}

var _WebBluetoothConnectionManager_instances, _WebBluetoothConnectionManager_boundBluetoothCharacteristicEventListeners, _WebBluetoothConnectionManager_boundBluetoothDeviceEventListeners, _WebBluetoothConnectionManager_device, _WebBluetoothConnectionManager_services, _WebBluetoothConnectionManager_characteristics, _WebBluetoothConnectionManager_getServicesAndCharacteristics, _WebBluetoothConnectionManager_removeEventListeners, _WebBluetoothConnectionManager_onCharacteristicvaluechanged, _WebBluetoothConnectionManager_onCharacteristicValueChanged, _WebBluetoothConnectionManager_onGattserverdisconnected;
const _console$i = createConsole("WebBluetoothConnectionManager", { log: false });
var bluetooth;
if (isInNode) {
    bluetooth = webbluetooth__namespace.bluetooth;
}
class WebBluetoothConnectionManager extends BluetoothConnectionManager {
    constructor() {
        super(...arguments);
        _WebBluetoothConnectionManager_instances.add(this);
        _WebBluetoothConnectionManager_boundBluetoothCharacteristicEventListeners.set(this, {
            characteristicvaluechanged: __classPrivateFieldGet(this, _WebBluetoothConnectionManager_instances, "m", _WebBluetoothConnectionManager_onCharacteristicvaluechanged).bind(this),
        });
        _WebBluetoothConnectionManager_boundBluetoothDeviceEventListeners.set(this, {
            gattserverdisconnected: __classPrivateFieldGet(this, _WebBluetoothConnectionManager_instances, "m", _WebBluetoothConnectionManager_onGattserverdisconnected).bind(this),
        });
        _WebBluetoothConnectionManager_device.set(this, void 0);
        _WebBluetoothConnectionManager_services.set(this, new Map());
        _WebBluetoothConnectionManager_characteristics.set(this, new Map());
    }
    get bluetoothId() {
        return this.device.id;
    }
    get canUpdateFirmware() {
        return __classPrivateFieldGet(this, _WebBluetoothConnectionManager_characteristics, "f").has("smp");
    }
    static get isSupported() {
        return Boolean(bluetooth);
    }
    static get type() {
        return "webBluetooth";
    }
    get device() {
        return __classPrivateFieldGet(this, _WebBluetoothConnectionManager_device, "f");
    }
    set device(newDevice) {
        if (__classPrivateFieldGet(this, _WebBluetoothConnectionManager_device, "f") == newDevice) {
            _console$i.log("tried to assign the same BluetoothDevice");
            return;
        }
        if (__classPrivateFieldGet(this, _WebBluetoothConnectionManager_device, "f")) {
            removeEventListeners(__classPrivateFieldGet(this, _WebBluetoothConnectionManager_device, "f"), __classPrivateFieldGet(this, _WebBluetoothConnectionManager_boundBluetoothDeviceEventListeners, "f"));
        }
        if (newDevice) {
            addEventListeners(newDevice, __classPrivateFieldGet(this, _WebBluetoothConnectionManager_boundBluetoothDeviceEventListeners, "f"));
        }
        __classPrivateFieldSet(this, _WebBluetoothConnectionManager_device, newDevice, "f");
    }
    get server() {
        return __classPrivateFieldGet(this, _WebBluetoothConnectionManager_device, "f")?.gatt;
    }
    get isConnected() {
        return this.server?.connected || false;
    }
    async connect() {
        await super.connect();
        try {
            const device = await bluetooth.requestDevice({
                filters: [{ services: serviceUUIDs }],
                optionalServices: isInBrowser ? optionalServiceUUIDs : [],
            });
            _console$i.log("got BluetoothDevice");
            this.device = device;
            _console$i.log("connecting to device...");
            const server = await this.server.connect();
            _console$i.log(`connected to device? ${server.connected}`);
            await __classPrivateFieldGet(this, _WebBluetoothConnectionManager_instances, "m", _WebBluetoothConnectionManager_getServicesAndCharacteristics).call(this);
            _console$i.log("fully connected");
            this.status = "connected";
        }
        catch (error) {
            _console$i.error(error);
            this.status = "notConnected";
            this.server?.disconnect();
            __classPrivateFieldGet(this, _WebBluetoothConnectionManager_instances, "m", _WebBluetoothConnectionManager_removeEventListeners).call(this);
        }
    }
    async disconnect() {
        await __classPrivateFieldGet(this, _WebBluetoothConnectionManager_instances, "m", _WebBluetoothConnectionManager_removeEventListeners).call(this);
        await super.disconnect();
        this.server?.disconnect();
        this.status = "notConnected";
    }
    async writeCharacteristic(characteristicName, data) {
        super.writeCharacteristic(characteristicName, data);
        const characteristic = __classPrivateFieldGet(this, _WebBluetoothConnectionManager_characteristics, "f").get(characteristicName);
        _console$i.assertWithError(characteristic, `${characteristicName} characteristic not found`);
        _console$i.log("writing characteristic", characteristic, data);
        const characteristicProperties = characteristic.properties ||
            getCharacteristicProperties(characteristicName);
        if (characteristicProperties.writeWithoutResponse) {
            _console$i.log("writing without response");
            await characteristic.writeValueWithoutResponse(data);
        }
        else {
            _console$i.log("writing with response");
            await characteristic.writeValueWithResponse(data);
        }
        _console$i.log("wrote characteristic");
        if (characteristicProperties.read && !characteristicProperties.notify) {
            _console$i.log("reading value after write...");
            await characteristic.readValue();
            if (isInBluefy || isInWebBLE) {
                __classPrivateFieldGet(this, _WebBluetoothConnectionManager_instances, "m", _WebBluetoothConnectionManager_onCharacteristicValueChanged).call(this, characteristic);
            }
        }
    }
    get canReconnect() {
        return Boolean(this.server && !this.server.connected && this.isInRange);
    }
    async reconnect() {
        await super.reconnect();
        try {
            await this.server.connect();
        }
        catch (error) {
            _console$i.error(error);
            this.isInRange = false;
        }
        if (this.isConnected) {
            _console$i.log("successfully reconnected!");
            await __classPrivateFieldGet(this, _WebBluetoothConnectionManager_instances, "m", _WebBluetoothConnectionManager_getServicesAndCharacteristics).call(this);
            this.status = "connected";
        }
        else {
            _console$i.log("unable to reconnect");
            this.status = "notConnected";
        }
    }
}
_WebBluetoothConnectionManager_boundBluetoothCharacteristicEventListeners = new WeakMap(), _WebBluetoothConnectionManager_boundBluetoothDeviceEventListeners = new WeakMap(), _WebBluetoothConnectionManager_device = new WeakMap(), _WebBluetoothConnectionManager_services = new WeakMap(), _WebBluetoothConnectionManager_characteristics = new WeakMap(), _WebBluetoothConnectionManager_instances = new WeakSet(), _WebBluetoothConnectionManager_getServicesAndCharacteristics = async function _WebBluetoothConnectionManager_getServicesAndCharacteristics() {
    __classPrivateFieldGet(this, _WebBluetoothConnectionManager_instances, "m", _WebBluetoothConnectionManager_removeEventListeners).call(this);
    _console$i.log("getting services...");
    const services = await this.server.getPrimaryServices();
    _console$i.log("got services", services.length);
    _console$i.log("getting characteristics...");
    for (const serviceIndex in services) {
        const service = services[serviceIndex];
        _console$i.log({ service });
        const serviceName = getServiceNameFromUUID(service.uuid);
        _console$i.assertWithError(serviceName, `no name found for service uuid "${service.uuid}"`);
        _console$i.log(`got "${serviceName}" service`);
        service.name = serviceName;
        __classPrivateFieldGet(this, _WebBluetoothConnectionManager_services, "f").set(serviceName, service);
        _console$i.log(`getting characteristics for "${serviceName}" service`);
        const characteristics = await service.getCharacteristics();
        _console$i.log(`got characteristics for "${serviceName}" service`);
        for (const characteristicIndex in characteristics) {
            const characteristic = characteristics[characteristicIndex];
            _console$i.log({ characteristic });
            const characteristicName = getCharacteristicNameFromUUID(characteristic.uuid);
            _console$i.assertWithError(Boolean(characteristicName), `no name found for characteristic uuid "${characteristic.uuid}" in "${serviceName}" service`);
            _console$i.log(`got "${characteristicName}" characteristic in "${serviceName}" service`);
            characteristic.name = characteristicName;
            __classPrivateFieldGet(this, _WebBluetoothConnectionManager_characteristics, "f").set(characteristicName, characteristic);
            addEventListeners(characteristic, __classPrivateFieldGet(this, _WebBluetoothConnectionManager_boundBluetoothCharacteristicEventListeners, "f"));
            const characteristicProperties = characteristic.properties ||
                getCharacteristicProperties(characteristicName);
            if (characteristicProperties.notify) {
                _console$i.log(`starting notifications for "${characteristicName}" characteristic`);
                await characteristic.startNotifications();
            }
            if (characteristicProperties.read) {
                _console$i.log(`reading "${characteristicName}" characteristic...`);
                await characteristic.readValue();
                if (isInBluefy || isInWebBLE) {
                    __classPrivateFieldGet(this, _WebBluetoothConnectionManager_instances, "m", _WebBluetoothConnectionManager_onCharacteristicValueChanged).call(this, characteristic);
                }
            }
        }
    }
}, _WebBluetoothConnectionManager_removeEventListeners = async function _WebBluetoothConnectionManager_removeEventListeners() {
    if (this.device) {
        removeEventListeners(this.device, __classPrivateFieldGet(this, _WebBluetoothConnectionManager_boundBluetoothDeviceEventListeners, "f"));
    }
    const promises = Array.from(__classPrivateFieldGet(this, _WebBluetoothConnectionManager_characteristics, "f").keys()).map((characteristicName) => {
        const characteristic = __classPrivateFieldGet(this, _WebBluetoothConnectionManager_characteristics, "f").get(characteristicName);
        removeEventListeners(characteristic, __classPrivateFieldGet(this, _WebBluetoothConnectionManager_boundBluetoothCharacteristicEventListeners, "f"));
        const characteristicProperties = characteristic.properties ||
            getCharacteristicProperties(characteristicName);
        if (characteristicProperties.notify) {
            _console$i.log(`stopping notifications for "${characteristicName}" characteristic`);
            return characteristic.stopNotifications();
        }
    });
    return Promise.allSettled(promises);
}, _WebBluetoothConnectionManager_onCharacteristicvaluechanged = function _WebBluetoothConnectionManager_onCharacteristicvaluechanged(event) {
    _console$i.log("oncharacteristicvaluechanged");
    const characteristic = event.target;
    __classPrivateFieldGet(this, _WebBluetoothConnectionManager_instances, "m", _WebBluetoothConnectionManager_onCharacteristicValueChanged).call(this, characteristic);
}, _WebBluetoothConnectionManager_onCharacteristicValueChanged = function _WebBluetoothConnectionManager_onCharacteristicValueChanged(characteristic) {
    _console$i.log("onCharacteristicValue");
    const characteristicName = characteristic.name;
    _console$i.assertWithError(Boolean(characteristicName), `no name found for characteristic with uuid "${characteristic.uuid}"`);
    _console$i.log(`oncharacteristicvaluechanged for "${characteristicName}" characteristic`);
    const dataView = characteristic.value;
    _console$i.assertWithError(dataView, `no data found for "${characteristicName}" characteristic`);
    _console$i.log(`data for "${characteristicName}" characteristic`, Array.from(new Uint8Array(dataView.buffer)));
    try {
        this.onCharacteristicValueChanged(characteristicName, dataView);
    }
    catch (error) {
        _console$i.error(error);
    }
}, _WebBluetoothConnectionManager_onGattserverdisconnected = function _WebBluetoothConnectionManager_onGattserverdisconnected() {
    _console$i.log("gattserverdisconnected");
    this.status = "notConnected";
};

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
            ((value & 0x0f) << 18) | ((readUint8() & 0x3f) << 12) | ((readUint8() & 0x3f) << 6) | (readUint8() & 0x3f);
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

const _console$h = createConsole("mcumgr", { log: false });
const constants = {
  MGMT_OP_READ: 0,
  MGMT_OP_READ_RSP: 1,
  MGMT_OP_WRITE: 2,
  MGMT_OP_WRITE_RSP: 3,
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
  OS_MGMT_ID_ECHO: 0,
  OS_MGMT_ID_CONS_ECHO_CTRL: 1,
  OS_MGMT_ID_TASKSTAT: 2,
  OS_MGMT_ID_MPSTAT: 3,
  OS_MGMT_ID_DATETIME_STR: 4,
  OS_MGMT_ID_RESET: 5,
  IMG_MGMT_ID_STATE: 0,
  IMG_MGMT_ID_UPLOAD: 1,
  IMG_MGMT_ID_FILE: 2,
  IMG_MGMT_ID_CORELIST: 3,
  IMG_MGMT_ID_CORELOAD: 4,
  IMG_MGMT_ID_ERASE: 5,
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
    _console$h.log("mcumgr - message received");
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
    _console$h.log("mcumgr - Process Message - Group: " + group + ", Id: " + id + ", Off: " + data.off);
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
    if (op === constants.MGMT_OP_READ_RSP && group === constants.MGMT_GROUP_ID_FS && id === constants.FS_MGMT_ID_FILE) {
      this._downloadFileOffset += data.data.length;
      if (data.len != undefined) {
        this._downloadFileLength = data.len;
      }
      _console$h.log("downloaded " + this._downloadFileOffset + " bytes of " + this._downloadFileLength);
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
    return this._getMessage(constants.MGMT_OP_WRITE, constants.MGMT_GROUP_ID_IMAGE, constants.IMG_MGMT_ID_ERASE, {});
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
    _console$h.log("mcumgr - _uploadNext: Message Length: " + packet.length);
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
      _console$h.error("Upload is already in progress.");
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
      _console$h.error("Upload is already in progress.");
      return;
    }
    this._uploadIsInProgress = true;
    this._uploadFileOffset = 0;
    this._uploadFile = filebuf;
    this._uploadFilename = destFilename;
    this._uploadFileNext();
  }
  async _uploadFileNext() {
    _console$h.log("uploadFileNext - offset: " + this._uploadFileOffset + ", length: " + this._uploadFile.byteLength);
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
    _console$h.log("mcumgr - _uploadNext: Message Length: " + packet.length);
    this._fileUploadNextCallback({ packet });
  }
  async cmdDownloadFile(filename, destFilename) {
    if (this._downloadIsInProgress) {
      _console$h.error("Download is already in progress.");
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
    _console$h.log("mcumgr - _downloadNext: Message Length: " + packet.length);
    this._fileDownloadNextCallback({ packet });
  }
  async imageInfo(image) {
    const info = {};
    const view = new Uint8Array(image);
    if (view.length < 32) {
      throw new Error("Invalid image (too short file)");
    }
    if (view[0] !== 0x3d || view[1] !== 0xb8 || view[2] !== 0xf3 || view[3] !== 0x96) {
      throw new Error("Invalid image (wrong magic bytes)");
    }
    if (view[4] !== 0x00 || view[5] !== 0x00 || view[6] !== 0x00 || view[7] !== 0x00) {
      throw new Error("Invalid image (wrong load address)");
    }
    const headerSize = view[8] + view[9] * 2 ** 8;
    if (view[10] !== 0x00 || view[11] !== 0x00) {
      throw new Error("Invalid image (wrong protected TLV area size)");
    }
    const imageSize = view[12] + view[13] * 2 ** 8 + view[14] * 2 ** 16 + view[15] * 2 ** 24;
    info.imageSize = imageSize;
    if (view.length < imageSize + headerSize) {
      throw new Error("Invalid image (wrong image size)");
    }
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

var _FirmwareManager_instances, _FirmwareManager_dispatchEvent_get, _FirmwareManager_status, _FirmwareManager_updateStatus, _FirmwareManager_images, _FirmwareManager_assertImages, _FirmwareManager_assertValidImageIndex, _FirmwareManager_mtu, _FirmwareManager_mcuManager, _FirmwareManager_assignMcuManagerCallbacks, _FirmwareManager_onMcuMessage, _FirmwareManager_onMcuFileDownloadNext, _FirmwareManager_onMcuFileDownloadProgress, _FirmwareManager_onMcuFileDownloadFinished, _FirmwareManager_onMcuFileUploadNext, _FirmwareManager_onMcuFileUploadProgress, _FirmwareManager_onMcuFileUploadFinished, _FirmwareManager_onMcuImageUploadNext, _FirmwareManager_onMcuImageUploadProgress, _FirmwareManager_onMcuImageUploadFinished, _FirmwareManager_onMcuImageState;
const _console$g = createConsole("FirmwareManager", { log: false });
const FirmwareMessageTypes = ["smp"];
const FirmwareEventTypes = [
    ...FirmwareMessageTypes,
    "firmwareImages",
    "firmwareUploadProgress",
    "firmwareStatus",
    "firmwareUploadComplete",
];
const FirmwareStatuses = ["idle", "uploading", "uploaded", "pending", "testing", "erasing"];
class FirmwareManager {
    constructor() {
        _FirmwareManager_instances.add(this);
        _FirmwareManager_status.set(this, "idle");
        _FirmwareManager_images.set(this, void 0);
        _FirmwareManager_mtu.set(this, void 0);
        _FirmwareManager_mcuManager.set(this, new MCUManager());
        __classPrivateFieldGet(this, _FirmwareManager_instances, "m", _FirmwareManager_assignMcuManagerCallbacks).call(this);
        autoBind$1(this);
    }
    get addEventListenter() {
        return this.eventDispatcher.addEventListener;
    }
    get removeEventListener() {
        return this.eventDispatcher.removeEventListener;
    }
    get waitForEvent() {
        return this.eventDispatcher.waitForEvent;
    }
    parseMessage(messageType, dataView) {
        _console$g.log({ messageType });
        switch (messageType) {
            case "smp":
                __classPrivateFieldGet(this, _FirmwareManager_mcuManager, "f")._notification(Array.from(new Uint8Array(dataView.buffer)));
                __classPrivateFieldGet(this, _FirmwareManager_instances, "a", _FirmwareManager_dispatchEvent_get).call(this, "smp", { dataView });
                break;
            default:
                throw Error(`uncaught messageType ${messageType}`);
        }
    }
    async uploadFirmware(file) {
        _console$g.log("uploadFirmware", file);
        const promise = this.waitForEvent("firmwareUploadComplete");
        await this.getImages();
        const arrayBuffer = await getFileBuffer(file);
        const imageInfo = await __classPrivateFieldGet(this, _FirmwareManager_mcuManager, "f").imageInfo(arrayBuffer);
        _console$g.log({ imageInfo });
        __classPrivateFieldGet(this, _FirmwareManager_mcuManager, "f").cmdUpload(arrayBuffer, 1);
        __classPrivateFieldGet(this, _FirmwareManager_instances, "m", _FirmwareManager_updateStatus).call(this, "uploading");
        await promise;
    }
    get status() {
        return __classPrivateFieldGet(this, _FirmwareManager_status, "f");
    }
    get images() {
        return __classPrivateFieldGet(this, _FirmwareManager_images, "f");
    }
    async getImages() {
        const promise = this.waitForEvent("firmwareImages");
        _console$g.log("getting firmware image state...");
        this.sendMessage(Uint8Array.from(__classPrivateFieldGet(this, _FirmwareManager_mcuManager, "f").cmdImageState()).buffer);
        await promise;
    }
    async testImage(imageIndex = 1) {
        __classPrivateFieldGet(this, _FirmwareManager_instances, "m", _FirmwareManager_assertValidImageIndex).call(this, imageIndex);
        __classPrivateFieldGet(this, _FirmwareManager_instances, "m", _FirmwareManager_assertImages).call(this);
        if (!__classPrivateFieldGet(this, _FirmwareManager_images, "f")[imageIndex]) {
            _console$g.log(`image ${imageIndex} not found`);
            return;
        }
        if (__classPrivateFieldGet(this, _FirmwareManager_images, "f")[imageIndex].pending == true) {
            _console$g.log(`image ${imageIndex} is already pending`);
            return;
        }
        if (__classPrivateFieldGet(this, _FirmwareManager_images, "f")[imageIndex].empty) {
            _console$g.log(`image ${imageIndex} is empty`);
            return;
        }
        const promise = this.waitForEvent("smp");
        _console$g.log("testing firmware image...");
        this.sendMessage(Uint8Array.from(__classPrivateFieldGet(this, _FirmwareManager_mcuManager, "f").cmdImageTest(__classPrivateFieldGet(this, _FirmwareManager_images, "f")[imageIndex].hash)).buffer);
        await promise;
    }
    async eraseImage() {
        __classPrivateFieldGet(this, _FirmwareManager_instances, "m", _FirmwareManager_assertImages).call(this);
        const promise = this.waitForEvent("smp");
        _console$g.log("erasing image...");
        this.sendMessage(Uint8Array.from(__classPrivateFieldGet(this, _FirmwareManager_mcuManager, "f").cmdImageErase()).buffer);
        __classPrivateFieldGet(this, _FirmwareManager_instances, "m", _FirmwareManager_updateStatus).call(this, "erasing");
        await promise;
        await this.getImages();
    }
    async confirmImage(imageIndex = 0) {
        __classPrivateFieldGet(this, _FirmwareManager_instances, "m", _FirmwareManager_assertValidImageIndex).call(this, imageIndex);
        __classPrivateFieldGet(this, _FirmwareManager_instances, "m", _FirmwareManager_assertImages).call(this);
        if (__classPrivateFieldGet(this, _FirmwareManager_images, "f")[imageIndex].confirmed === true) {
            _console$g.log(`image ${imageIndex} is already confirmed`);
            return;
        }
        const promise = this.waitForEvent("smp");
        _console$g.log("confirming image...");
        this.sendMessage(Uint8Array.from(__classPrivateFieldGet(this, _FirmwareManager_mcuManager, "f").cmdImageConfirm(__classPrivateFieldGet(this, _FirmwareManager_images, "f")[imageIndex].hash)).buffer);
        await promise;
    }
    async echo(string) {
        _console$g.assertTypeWithError(string, "string");
        const promise = this.waitForEvent("smp");
        _console$g.log("sending echo...");
        this.sendMessage(Uint8Array.from(__classPrivateFieldGet(this, _FirmwareManager_mcuManager, "f").smpEcho(string)).buffer);
        await promise;
    }
    async reset() {
        const promise = this.waitForEvent("smp");
        _console$g.log("resetting...");
        this.sendMessage(Uint8Array.from(__classPrivateFieldGet(this, _FirmwareManager_mcuManager, "f").cmdReset()).buffer);
        await promise;
    }
    get mtu() {
        return __classPrivateFieldGet(this, _FirmwareManager_mtu, "f");
    }
    set mtu(newMtu) {
        __classPrivateFieldSet(this, _FirmwareManager_mtu, newMtu, "f");
        __classPrivateFieldGet(this, _FirmwareManager_mcuManager, "f")._mtu = newMtu;
    }
}
_FirmwareManager_status = new WeakMap(), _FirmwareManager_images = new WeakMap(), _FirmwareManager_mtu = new WeakMap(), _FirmwareManager_mcuManager = new WeakMap(), _FirmwareManager_instances = new WeakSet(), _FirmwareManager_dispatchEvent_get = function _FirmwareManager_dispatchEvent_get() {
    return this.eventDispatcher.dispatchEvent;
}, _FirmwareManager_updateStatus = function _FirmwareManager_updateStatus(newStatus) {
    _console$g.assertEnumWithError(newStatus, FirmwareStatuses);
    if (__classPrivateFieldGet(this, _FirmwareManager_status, "f") == newStatus) {
        _console$g.log(`redundant firmwareStatus assignment "${newStatus}"`);
        return;
    }
    __classPrivateFieldSet(this, _FirmwareManager_status, newStatus, "f");
    _console$g.log({ firmwareStatus: __classPrivateFieldGet(this, _FirmwareManager_status, "f") });
    __classPrivateFieldGet(this, _FirmwareManager_instances, "a", _FirmwareManager_dispatchEvent_get).call(this, "firmwareStatus", { firmwareStatus: __classPrivateFieldGet(this, _FirmwareManager_status, "f") });
}, _FirmwareManager_assertImages = function _FirmwareManager_assertImages() {
    _console$g.assertWithError(__classPrivateFieldGet(this, _FirmwareManager_images, "f"), "didn't get imageState");
}, _FirmwareManager_assertValidImageIndex = function _FirmwareManager_assertValidImageIndex(imageIndex) {
    _console$g.assertTypeWithError(imageIndex, "number");
    _console$g.assertWithError(imageIndex == 0 || imageIndex == 1, "imageIndex must be 0 or 1");
}, _FirmwareManager_assignMcuManagerCallbacks = function _FirmwareManager_assignMcuManagerCallbacks() {
    __classPrivateFieldGet(this, _FirmwareManager_mcuManager, "f").onMessage(__classPrivateFieldGet(this, _FirmwareManager_instances, "m", _FirmwareManager_onMcuMessage).bind(this));
    __classPrivateFieldGet(this, _FirmwareManager_mcuManager, "f").onFileDownloadNext(__classPrivateFieldGet(this, _FirmwareManager_instances, "m", _FirmwareManager_onMcuFileDownloadNext));
    __classPrivateFieldGet(this, _FirmwareManager_mcuManager, "f").onFileDownloadProgress(__classPrivateFieldGet(this, _FirmwareManager_instances, "m", _FirmwareManager_onMcuFileDownloadProgress).bind(this));
    __classPrivateFieldGet(this, _FirmwareManager_mcuManager, "f").onFileDownloadFinished(__classPrivateFieldGet(this, _FirmwareManager_instances, "m", _FirmwareManager_onMcuFileDownloadFinished).bind(this));
    __classPrivateFieldGet(this, _FirmwareManager_mcuManager, "f").onFileUploadNext(__classPrivateFieldGet(this, _FirmwareManager_instances, "m", _FirmwareManager_onMcuFileUploadNext).bind(this));
    __classPrivateFieldGet(this, _FirmwareManager_mcuManager, "f").onFileUploadProgress(__classPrivateFieldGet(this, _FirmwareManager_instances, "m", _FirmwareManager_onMcuFileUploadProgress).bind(this));
    __classPrivateFieldGet(this, _FirmwareManager_mcuManager, "f").onFileUploadFinished(__classPrivateFieldGet(this, _FirmwareManager_instances, "m", _FirmwareManager_onMcuFileUploadFinished).bind(this));
    __classPrivateFieldGet(this, _FirmwareManager_mcuManager, "f").onImageUploadNext(__classPrivateFieldGet(this, _FirmwareManager_instances, "m", _FirmwareManager_onMcuImageUploadNext).bind(this));
    __classPrivateFieldGet(this, _FirmwareManager_mcuManager, "f").onImageUploadProgress(__classPrivateFieldGet(this, _FirmwareManager_instances, "m", _FirmwareManager_onMcuImageUploadProgress).bind(this));
    __classPrivateFieldGet(this, _FirmwareManager_mcuManager, "f").onImageUploadFinished(__classPrivateFieldGet(this, _FirmwareManager_instances, "m", _FirmwareManager_onMcuImageUploadFinished).bind(this));
}, _FirmwareManager_onMcuMessage = function _FirmwareManager_onMcuMessage({ op, group, id, data, length }) {
    _console$g.log("onMcuMessage", ...arguments);
    switch (group) {
        case constants.MGMT_GROUP_ID_OS:
            switch (id) {
                case constants.OS_MGMT_ID_ECHO:
                    _console$g.log(`echo "${data.r}"`);
                    break;
                case constants.OS_MGMT_ID_TASKSTAT:
                    _console$g.table(data.tasks);
                    break;
                case constants.OS_MGMT_ID_MPSTAT:
                    _console$g.log(data);
                    break;
            }
            break;
        case constants.MGMT_GROUP_ID_IMAGE:
            switch (id) {
                case constants.IMG_MGMT_ID_STATE:
                    __classPrivateFieldGet(this, _FirmwareManager_instances, "m", _FirmwareManager_onMcuImageState).call(this, data);
            }
            break;
        default:
            throw Error(`uncaught mcuMessage group ${group}`);
    }
}, _FirmwareManager_onMcuFileDownloadNext = function _FirmwareManager_onMcuFileDownloadNext() {
    _console$g.log("onMcuFileDownloadNext", ...arguments);
}, _FirmwareManager_onMcuFileDownloadProgress = function _FirmwareManager_onMcuFileDownloadProgress() {
    _console$g.log("onMcuFileDownloadProgress", ...arguments);
}, _FirmwareManager_onMcuFileDownloadFinished = function _FirmwareManager_onMcuFileDownloadFinished() {
    _console$g.log("onMcuFileDownloadFinished", ...arguments);
}, _FirmwareManager_onMcuFileUploadNext = function _FirmwareManager_onMcuFileUploadNext() {
    _console$g.log("onMcuFileUploadNext");
}, _FirmwareManager_onMcuFileUploadProgress = function _FirmwareManager_onMcuFileUploadProgress() {
    _console$g.log("onMcuFileUploadProgress");
}, _FirmwareManager_onMcuFileUploadFinished = function _FirmwareManager_onMcuFileUploadFinished() {
    _console$g.log("onMcuFileUploadFinished");
}, _FirmwareManager_onMcuImageUploadNext = function _FirmwareManager_onMcuImageUploadNext({ packet }) {
    _console$g.log("onMcuImageUploadNext");
    this.sendMessage(Uint8Array.from(packet).buffer);
}, _FirmwareManager_onMcuImageUploadProgress = function _FirmwareManager_onMcuImageUploadProgress({ percentage }) {
    const progress = percentage / 100;
    _console$g.log("onMcuImageUploadProgress", ...arguments);
    __classPrivateFieldGet(this, _FirmwareManager_instances, "a", _FirmwareManager_dispatchEvent_get).call(this, "firmwareUploadProgress", { progress });
}, _FirmwareManager_onMcuImageUploadFinished = async function _FirmwareManager_onMcuImageUploadFinished() {
    _console$g.log("onMcuImageUploadFinished", ...arguments);
    await this.getImages();
    __classPrivateFieldGet(this, _FirmwareManager_instances, "a", _FirmwareManager_dispatchEvent_get).call(this, "firmwareUploadProgress", { progress: 100 });
    __classPrivateFieldGet(this, _FirmwareManager_instances, "a", _FirmwareManager_dispatchEvent_get).call(this, "firmwareUploadComplete", {});
}, _FirmwareManager_onMcuImageState = function _FirmwareManager_onMcuImageState({ images }) {
    if (images) {
        __classPrivateFieldSet(this, _FirmwareManager_images, images, "f");
        _console$g.log("images", __classPrivateFieldGet(this, _FirmwareManager_images, "f"));
    }
    else {
        _console$g.log("no images found");
        return;
    }
    let newStatus = "idle";
    if (__classPrivateFieldGet(this, _FirmwareManager_images, "f").length == 2) {
        if (!__classPrivateFieldGet(this, _FirmwareManager_images, "f")[1].bootable) {
            _console$g.warn('Slot 1 has a invalid image. Click "Erase Image" to erase it or upload a different image');
        }
        else if (!__classPrivateFieldGet(this, _FirmwareManager_images, "f")[0].confirmed) {
            _console$g.log('Slot 0 has a valid image. Click "Confirm Image" to confirm it or wait and the device will swap images back.');
            newStatus = "testing";
        }
        else {
            if (__classPrivateFieldGet(this, _FirmwareManager_images, "f")[1].pending) {
                _console$g.log("reset to upload to the new firmware image");
                newStatus = "pending";
            }
            else {
                _console$g.log("Slot 1 has a valid image. run testImage() to test it or upload a different image.");
                newStatus = "uploaded";
            }
        }
    }
    if (__classPrivateFieldGet(this, _FirmwareManager_images, "f").length == 1) {
        __classPrivateFieldGet(this, _FirmwareManager_images, "f").push({
            slot: 1,
            empty: true,
            version: "Empty",
            pending: false,
            confirmed: false,
            bootable: false,
            active: false,
            permanent: false,
        });
        _console$g.log("Select a firmware upload image to upload to slot 1.");
    }
    __classPrivateFieldGet(this, _FirmwareManager_instances, "m", _FirmwareManager_updateStatus).call(this, newStatus);
    __classPrivateFieldGet(this, _FirmwareManager_instances, "a", _FirmwareManager_dispatchEvent_get).call(this, "firmwareImages", { firmwareImages: __classPrivateFieldGet(this, _FirmwareManager_images, "f") });
};

var _DeviceManager_instances, _DeviceManager_boundDeviceEventListeners, _DeviceManager_onDeviceType, _DeviceManager_ConnectedDevices, _DeviceManager_UseLocalStorage, _DeviceManager_DefaultLocalStorageConfiguration, _DeviceManager_LocalStorageConfiguration, _DeviceManager_AssertLocalStorage, _DeviceManager_LocalStorageKey, _DeviceManager_SaveToLocalStorage, _DeviceManager_LoadFromLocalStorage, _DeviceManager_UpdateLocalStorageConfigurationForDevice, _DeviceManager_AvailableDevices, _DeviceManager_EventDispatcher, _DeviceManager_DispatchEvent_get, _DeviceManager_OnDeviceIsConnected, _DeviceManager_DispatchAvailableDevices, _DeviceManager_DispatchConnectedDevices;
const _console$f = createConsole("DeviceManager", { log: false });
const DeviceManagerEventTypes = [
    "deviceConnected",
    "deviceDisconnected",
    "deviceIsConnected",
    "availableDevices",
    "connectedDevices",
];
class DeviceManager {
    constructor() {
        _DeviceManager_instances.add(this);
        _DeviceManager_boundDeviceEventListeners.set(this, {
            getType: __classPrivateFieldGet(this, _DeviceManager_instances, "m", _DeviceManager_onDeviceType).bind(this),
            isConnected: __classPrivateFieldGet(this, _DeviceManager_instances, "m", _DeviceManager_OnDeviceIsConnected).bind(this),
        });
        _DeviceManager_ConnectedDevices.set(this, []);
        _DeviceManager_UseLocalStorage.set(this, false);
        _DeviceManager_DefaultLocalStorageConfiguration.set(this, {
            devices: [],
        });
        _DeviceManager_LocalStorageConfiguration.set(this, void 0);
        _DeviceManager_LocalStorageKey.set(this, "BS.Device");
        _DeviceManager_AvailableDevices.set(this, []);
        _DeviceManager_EventDispatcher.set(this, new EventDispatcher(this, DeviceManagerEventTypes));
        if (DeviceManager.shared && this != DeviceManager.shared) {
            throw Error("DeviceManager is a singleton - use DeviceManager.shared");
        }
        if (this.CanUseLocalStorage) {
            this.UseLocalStorage = true;
        }
    }
    onDevice(device) {
        addEventListeners(device, __classPrivateFieldGet(this, _DeviceManager_boundDeviceEventListeners, "f"));
    }
    OnDeviceConnectionStatusUpdated(device, connectionStatus) {
        if (connectionStatus == "notConnected" &&
            !device.canReconnect &&
            __classPrivateFieldGet(this, _DeviceManager_AvailableDevices, "f").includes(device)) {
            const deviceIndex = __classPrivateFieldGet(this, _DeviceManager_AvailableDevices, "f").indexOf(device);
            this.AvailableDevices.splice(deviceIndex, 1);
            __classPrivateFieldGet(this, _DeviceManager_instances, "m", _DeviceManager_DispatchAvailableDevices).call(this);
        }
    }
    get ConnectedDevices() {
        return __classPrivateFieldGet(this, _DeviceManager_ConnectedDevices, "f");
    }
    get UseLocalStorage() {
        return __classPrivateFieldGet(this, _DeviceManager_UseLocalStorage, "f");
    }
    set UseLocalStorage(newUseLocalStorage) {
        __classPrivateFieldGet(this, _DeviceManager_instances, "m", _DeviceManager_AssertLocalStorage).call(this);
        _console$f.assertTypeWithError(newUseLocalStorage, "boolean");
        __classPrivateFieldSet(this, _DeviceManager_UseLocalStorage, newUseLocalStorage, "f");
        if (__classPrivateFieldGet(this, _DeviceManager_UseLocalStorage, "f") && !__classPrivateFieldGet(this, _DeviceManager_LocalStorageConfiguration, "f")) {
            __classPrivateFieldGet(this, _DeviceManager_instances, "m", _DeviceManager_LoadFromLocalStorage).call(this);
        }
    }
    get CanUseLocalStorage() {
        return isInBrowser && window.localStorage;
    }
    get AvailableDevices() {
        return __classPrivateFieldGet(this, _DeviceManager_AvailableDevices, "f");
    }
    get CanGetDevices() {
        return isInBrowser && navigator.bluetooth?.getDevices;
    }
    async GetDevices() {
        if (!isInBrowser) {
            _console$f.warn("GetDevices is only available in the browser");
            return;
        }
        if (!navigator.bluetooth) {
            _console$f.warn("bluetooth is not available in this browser");
            return;
        }
        if (isInBluefy) {
            _console$f.warn("bluefy lists too many devices...");
            return;
        }
        if (!navigator.bluetooth.getDevices) {
            _console$f.warn("bluetooth.getDevices() is not available in this browser");
            return;
        }
        if (!this.CanGetDevices) {
            _console$f.log("CanGetDevices is false");
            return;
        }
        if (!__classPrivateFieldGet(this, _DeviceManager_LocalStorageConfiguration, "f")) {
            __classPrivateFieldGet(this, _DeviceManager_instances, "m", _DeviceManager_LoadFromLocalStorage).call(this);
        }
        const configuration = __classPrivateFieldGet(this, _DeviceManager_LocalStorageConfiguration, "f");
        if (!configuration.devices || configuration.devices.length == 0) {
            _console$f.log("no devices found in configuration");
            return;
        }
        const bluetoothDevices = await navigator.bluetooth.getDevices();
        _console$f.log({ bluetoothDevices });
        bluetoothDevices.forEach((bluetoothDevice) => {
            if (!bluetoothDevice.gatt) {
                return;
            }
            let deviceInformation = configuration.devices.find((deviceInformation) => bluetoothDevice.id == deviceInformation.bluetoothId);
            if (!deviceInformation) {
                return;
            }
            let existingConnectedDevice = this.ConnectedDevices.filter((device) => device.connectionType == "webBluetooth").find((device) => device.bluetoothId == bluetoothDevice.id);
            const existingAvailableDevice = this.AvailableDevices.filter((device) => device.connectionType == "webBluetooth").find((device) => device.bluetoothId == bluetoothDevice.id);
            if (existingAvailableDevice) {
                if (existingConnectedDevice &&
                    existingConnectedDevice?.bluetoothId ==
                        existingAvailableDevice.bluetoothId &&
                    existingConnectedDevice != existingAvailableDevice) {
                    this.AvailableDevices[__classPrivateFieldGet(this, _DeviceManager_AvailableDevices, "f").indexOf(existingAvailableDevice)] = existingConnectedDevice;
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
                device._informationManager.updateName(bluetoothDevice.name);
            }
            device._informationManager.updateType(deviceInformation.type);
            device.connectionManager = connectionManager;
            this.AvailableDevices.push(device);
        });
        __classPrivateFieldGet(this, _DeviceManager_instances, "m", _DeviceManager_DispatchAvailableDevices).call(this);
        return this.AvailableDevices;
    }
    get AddEventListener() {
        return __classPrivateFieldGet(this, _DeviceManager_EventDispatcher, "f").addEventListener;
    }
    get RemoveEventListener() {
        return __classPrivateFieldGet(this, _DeviceManager_EventDispatcher, "f").removeEventListener;
    }
    get RemoveEventListeners() {
        return __classPrivateFieldGet(this, _DeviceManager_EventDispatcher, "f").removeEventListeners;
    }
    get RemoveAllEventListeners() {
        return __classPrivateFieldGet(this, _DeviceManager_EventDispatcher, "f").removeAllEventListeners;
    }
    _CheckDeviceAvailability(device) {
        if (!device.isConnected &&
            !device.isAvailable &&
            __classPrivateFieldGet(this, _DeviceManager_AvailableDevices, "f").includes(device)) {
            _console$f.log("removing device from availableDevices...");
            __classPrivateFieldGet(this, _DeviceManager_AvailableDevices, "f").splice(__classPrivateFieldGet(this, _DeviceManager_AvailableDevices, "f").indexOf(device), 1);
            __classPrivateFieldGet(this, _DeviceManager_instances, "m", _DeviceManager_DispatchAvailableDevices).call(this);
        }
    }
}
_DeviceManager_boundDeviceEventListeners = new WeakMap(), _DeviceManager_ConnectedDevices = new WeakMap(), _DeviceManager_UseLocalStorage = new WeakMap(), _DeviceManager_DefaultLocalStorageConfiguration = new WeakMap(), _DeviceManager_LocalStorageConfiguration = new WeakMap(), _DeviceManager_LocalStorageKey = new WeakMap(), _DeviceManager_AvailableDevices = new WeakMap(), _DeviceManager_EventDispatcher = new WeakMap(), _DeviceManager_instances = new WeakSet(), _DeviceManager_onDeviceType = function _DeviceManager_onDeviceType(event) {
    if (__classPrivateFieldGet(this, _DeviceManager_UseLocalStorage, "f")) {
        __classPrivateFieldGet(this, _DeviceManager_instances, "m", _DeviceManager_UpdateLocalStorageConfigurationForDevice).call(this, event.target);
    }
}, _DeviceManager_AssertLocalStorage = function _DeviceManager_AssertLocalStorage() {
    _console$f.assertWithError(isInBrowser, "localStorage is only available in the browser");
    _console$f.assertWithError(window.localStorage, "localStorage not found");
}, _DeviceManager_SaveToLocalStorage = function _DeviceManager_SaveToLocalStorage() {
    __classPrivateFieldGet(this, _DeviceManager_instances, "m", _DeviceManager_AssertLocalStorage).call(this);
    localStorage.setItem(__classPrivateFieldGet(this, _DeviceManager_LocalStorageKey, "f"), JSON.stringify(__classPrivateFieldGet(this, _DeviceManager_LocalStorageConfiguration, "f")));
}, _DeviceManager_LoadFromLocalStorage = async function _DeviceManager_LoadFromLocalStorage() {
    __classPrivateFieldGet(this, _DeviceManager_instances, "m", _DeviceManager_AssertLocalStorage).call(this);
    let localStorageString = localStorage.getItem(__classPrivateFieldGet(this, _DeviceManager_LocalStorageKey, "f"));
    if (typeof localStorageString != "string") {
        _console$f.log("no info found in localStorage");
        __classPrivateFieldSet(this, _DeviceManager_LocalStorageConfiguration, Object.assign({}, __classPrivateFieldGet(this, _DeviceManager_DefaultLocalStorageConfiguration, "f")), "f");
        __classPrivateFieldGet(this, _DeviceManager_instances, "m", _DeviceManager_SaveToLocalStorage).call(this);
        return;
    }
    try {
        const configuration = JSON.parse(localStorageString);
        _console$f.log({ configuration });
        __classPrivateFieldSet(this, _DeviceManager_LocalStorageConfiguration, configuration, "f");
        if (this.CanGetDevices) {
            await this.GetDevices();
        }
    }
    catch (error) {
        _console$f.error(error);
    }
}, _DeviceManager_UpdateLocalStorageConfigurationForDevice = function _DeviceManager_UpdateLocalStorageConfigurationForDevice(device) {
    if (device.connectionType != "webBluetooth") {
        _console$f.log("localStorage is only for webBluetooth devices");
        return;
    }
    __classPrivateFieldGet(this, _DeviceManager_instances, "m", _DeviceManager_AssertLocalStorage).call(this);
    const deviceInformationIndex = __classPrivateFieldGet(this, _DeviceManager_LocalStorageConfiguration, "f").devices.findIndex((deviceInformation) => {
        return deviceInformation.bluetoothId == device.bluetoothId;
    });
    if (deviceInformationIndex == -1) {
        return;
    }
    __classPrivateFieldGet(this, _DeviceManager_LocalStorageConfiguration, "f").devices[deviceInformationIndex].type =
        device.type;
    __classPrivateFieldGet(this, _DeviceManager_instances, "m", _DeviceManager_SaveToLocalStorage).call(this);
}, _DeviceManager_DispatchEvent_get = function _DeviceManager_DispatchEvent_get() {
    return __classPrivateFieldGet(this, _DeviceManager_EventDispatcher, "f").dispatchEvent;
}, _DeviceManager_OnDeviceIsConnected = function _DeviceManager_OnDeviceIsConnected(event) {
    const { target: device } = event;
    if (device.isConnected) {
        if (!__classPrivateFieldGet(this, _DeviceManager_ConnectedDevices, "f").includes(device)) {
            _console$f.log("adding device", device);
            __classPrivateFieldGet(this, _DeviceManager_ConnectedDevices, "f").push(device);
            if (this.UseLocalStorage && device.connectionType == "webBluetooth") {
                const deviceInformation = {
                    type: device.type,
                    bluetoothId: device.bluetoothId,
                    ipAddress: device.ipAddress,
                    isWifiSecure: device.isWifiSecure,
                };
                const deviceInformationIndex = __classPrivateFieldGet(this, _DeviceManager_LocalStorageConfiguration, "f").devices.findIndex((_deviceInformation) => _deviceInformation.bluetoothId == deviceInformation.bluetoothId);
                if (deviceInformationIndex == -1) {
                    __classPrivateFieldGet(this, _DeviceManager_LocalStorageConfiguration, "f").devices.push(deviceInformation);
                }
                else {
                    __classPrivateFieldGet(this, _DeviceManager_LocalStorageConfiguration, "f").devices[deviceInformationIndex] =
                        deviceInformation;
                }
                __classPrivateFieldGet(this, _DeviceManager_instances, "m", _DeviceManager_SaveToLocalStorage).call(this);
            }
            __classPrivateFieldGet(this, _DeviceManager_instances, "a", _DeviceManager_DispatchEvent_get).call(this, "deviceConnected", { device });
            __classPrivateFieldGet(this, _DeviceManager_instances, "a", _DeviceManager_DispatchEvent_get).call(this, "deviceIsConnected", { device });
            __classPrivateFieldGet(this, _DeviceManager_instances, "m", _DeviceManager_DispatchConnectedDevices).call(this);
        }
        else {
            _console$f.log("device already included");
        }
    }
    else {
        if (__classPrivateFieldGet(this, _DeviceManager_ConnectedDevices, "f").includes(device)) {
            _console$f.log("removing device", device);
            __classPrivateFieldGet(this, _DeviceManager_ConnectedDevices, "f").splice(__classPrivateFieldGet(this, _DeviceManager_ConnectedDevices, "f").indexOf(device), 1);
            __classPrivateFieldGet(this, _DeviceManager_instances, "a", _DeviceManager_DispatchEvent_get).call(this, "deviceDisconnected", { device });
            __classPrivateFieldGet(this, _DeviceManager_instances, "a", _DeviceManager_DispatchEvent_get).call(this, "deviceIsConnected", { device });
            __classPrivateFieldGet(this, _DeviceManager_instances, "m", _DeviceManager_DispatchConnectedDevices).call(this);
        }
        else {
            _console$f.log("device already not included");
        }
    }
    if (this.CanGetDevices) {
        this.GetDevices();
    }
    if (device.isConnected && !this.AvailableDevices.includes(device)) {
        const existingAvailableDevice = this.AvailableDevices.find((_device) => _device.bluetoothId == device.bluetoothId);
        _console$f.log({ existingAvailableDevice });
        if (existingAvailableDevice) {
            this.AvailableDevices[this.AvailableDevices.indexOf(existingAvailableDevice)] = device;
        }
        else {
            this.AvailableDevices.push(device);
        }
        __classPrivateFieldGet(this, _DeviceManager_instances, "m", _DeviceManager_DispatchAvailableDevices).call(this);
    }
    this._CheckDeviceAvailability(device);
}, _DeviceManager_DispatchAvailableDevices = function _DeviceManager_DispatchAvailableDevices() {
    _console$f.log({ AvailableDevices: this.AvailableDevices });
    __classPrivateFieldGet(this, _DeviceManager_instances, "a", _DeviceManager_DispatchEvent_get).call(this, "availableDevices", {
        availableDevices: this.AvailableDevices,
    });
}, _DeviceManager_DispatchConnectedDevices = function _DeviceManager_DispatchConnectedDevices() {
    _console$f.log({ ConnectedDevices: this.ConnectedDevices });
    __classPrivateFieldGet(this, _DeviceManager_instances, "a", _DeviceManager_DispatchEvent_get).call(this, "connectedDevices", {
        connectedDevices: this.ConnectedDevices,
    });
};
DeviceManager.shared = new DeviceManager();
var DeviceManager$1 = DeviceManager.shared;

const _console$e = createConsole("ServerUtils", { log: false });
const ServerMessageTypes = [
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
function createMessage(enumeration, ...messages) {
    _console$e.log("createMessage", ...messages);
    const messageBuffers = messages.map((message) => {
        if (typeof message == "string") {
            message = { type: message };
        }
        if (message.data != undefined) {
            if (!Array.isArray(message.data)) {
                message.data = [message.data];
            }
        }
        else {
            message.data = [];
        }
        const messageDataArrayBuffer = concatenateArrayBuffers(...message.data);
        const messageDataArrayBufferByteLength = messageDataArrayBuffer.byteLength;
        _console$e.assertEnumWithError(message.type, enumeration);
        const messageTypeEnum = enumeration.indexOf(message.type);
        const messageDataLengthDataView = new DataView(new ArrayBuffer(2));
        messageDataLengthDataView.setUint16(0, messageDataArrayBufferByteLength, true);
        return concatenateArrayBuffers(messageTypeEnum, messageDataLengthDataView, messageDataArrayBuffer);
    });
    _console$e.log("messageBuffers", ...messageBuffers);
    return concatenateArrayBuffers(...messageBuffers);
}
function createServerMessage(...messages) {
    _console$e.log("createServerMessage", ...messages);
    return createMessage(ServerMessageTypes, ...messages);
}
function createDeviceMessage(...messages) {
    _console$e.log("createDeviceMessage", ...messages);
    return createMessage(DeviceEventTypes, ...messages);
}
createServerMessage("isScanningAvailable");
createServerMessage("isScanning");
createServerMessage("startScan");
createServerMessage("stopScan");
createServerMessage("discoveredDevices");

const _console$d = createConsole("WebSocketUtils", { log: false });
const webSocketPingTimeout = 30_000;
const WebSocketMessageTypes$1 = ["ping", "pong", "serverMessage"];
function createWebSocketMessage$1(...messages) {
    _console$d.log("createWebSocketMessage", ...messages);
    return createMessage(WebSocketMessageTypes$1, ...messages);
}
const webSocketPingMessage = createWebSocketMessage$1("ping");
const webSocketPongMessage = createWebSocketMessage$1("pong");

var _WebSocketConnectionManager_instances, _WebSocketConnectionManager_bluetoothId, _WebSocketConnectionManager_webSocket, _WebSocketConnectionManager_ipAddress, _WebSocketConnectionManager_isSecure, _WebSocketConnectionManager_sendMessage, _WebSocketConnectionManager_sendWebSocketMessage, _WebSocketConnectionManager_boundWebSocketEventListeners, _WebSocketConnectionManager_onWebSocketOpen, _WebSocketConnectionManager_onWebSocketMessage, _WebSocketConnectionManager_onWebSocketClose, _WebSocketConnectionManager_onWebSocketError, _WebSocketConnectionManager_parseWebSocketMessage, _WebSocketConnectionManager_onMessage, _WebSocketConnectionManager_pingTimer, _WebSocketConnectionManager_ping, _WebSocketConnectionManager_pong, _WebSocketConnectionManager_requestDeviceInformation;
const _console$c = createConsole("WebSocketConnectionManager", { log: false });
const WebSocketMessageTypes = [
    "ping",
    "pong",
    "batteryLevel",
    "deviceInformation",
    "message",
];
function createWebSocketMessage(...messages) {
    _console$c.log("createWebSocketMessage", ...messages);
    return createMessage(WebSocketMessageTypes, ...messages);
}
const WebSocketDeviceInformationMessageTypes = [
    "deviceInformation",
    "batteryLevel",
];
class WebSocketConnectionManager extends BaseConnectionManager {
    get bluetoothId() {
        return __classPrivateFieldGet(this, _WebSocketConnectionManager_bluetoothId, "f") ?? "";
    }
    constructor(ipAddress, isSecure = false, bluetoothId) {
        super();
        _WebSocketConnectionManager_instances.add(this);
        _WebSocketConnectionManager_bluetoothId.set(this, void 0);
        this.defaultMtu = 2 ** 10;
        _WebSocketConnectionManager_webSocket.set(this, void 0);
        _WebSocketConnectionManager_ipAddress.set(this, void 0);
        _WebSocketConnectionManager_isSecure.set(this, false);
        _WebSocketConnectionManager_boundWebSocketEventListeners.set(this, {
            open: __classPrivateFieldGet(this, _WebSocketConnectionManager_instances, "m", _WebSocketConnectionManager_onWebSocketOpen).bind(this),
            message: __classPrivateFieldGet(this, _WebSocketConnectionManager_instances, "m", _WebSocketConnectionManager_onWebSocketMessage).bind(this),
            close: __classPrivateFieldGet(this, _WebSocketConnectionManager_instances, "m", _WebSocketConnectionManager_onWebSocketClose).bind(this),
            error: __classPrivateFieldGet(this, _WebSocketConnectionManager_instances, "m", _WebSocketConnectionManager_onWebSocketError).bind(this),
        });
        _WebSocketConnectionManager_pingTimer.set(this, new Timer(__classPrivateFieldGet(this, _WebSocketConnectionManager_instances, "m", _WebSocketConnectionManager_ping).bind(this), webSocketPingTimeout - 1_000));
        this.ipAddress = ipAddress;
        this.isSecure = isSecure;
        this.mtu = this.defaultMtu;
        __classPrivateFieldSet(this, _WebSocketConnectionManager_bluetoothId, bluetoothId, "f");
    }
    get isAvailable() {
        return true;
    }
    static get isSupported() {
        return true;
    }
    static get type() {
        return "webSocket";
    }
    get webSocket() {
        return __classPrivateFieldGet(this, _WebSocketConnectionManager_webSocket, "f");
    }
    set webSocket(newWebSocket) {
        if (__classPrivateFieldGet(this, _WebSocketConnectionManager_webSocket, "f") == newWebSocket) {
            _console$c.log("redundant webSocket assignment");
            return;
        }
        _console$c.log("assigning webSocket", newWebSocket);
        if (__classPrivateFieldGet(this, _WebSocketConnectionManager_webSocket, "f")) {
            removeEventListeners(__classPrivateFieldGet(this, _WebSocketConnectionManager_webSocket, "f"), __classPrivateFieldGet(this, _WebSocketConnectionManager_boundWebSocketEventListeners, "f"));
            if (__classPrivateFieldGet(this, _WebSocketConnectionManager_webSocket, "f").readyState == __classPrivateFieldGet(this, _WebSocketConnectionManager_webSocket, "f").OPEN) {
                __classPrivateFieldGet(this, _WebSocketConnectionManager_webSocket, "f").close();
            }
        }
        addEventListeners(newWebSocket, __classPrivateFieldGet(this, _WebSocketConnectionManager_boundWebSocketEventListeners, "f"));
        __classPrivateFieldSet(this, _WebSocketConnectionManager_webSocket, newWebSocket, "f");
        _console$c.log("assigned webSocket");
    }
    get ipAddress() {
        return __classPrivateFieldGet(this, _WebSocketConnectionManager_ipAddress, "f");
    }
    set ipAddress(newIpAddress) {
        this.assertIsNotConnected();
        if (__classPrivateFieldGet(this, _WebSocketConnectionManager_ipAddress, "f") == newIpAddress) {
            _console$c.log(`redundnant ipAddress assignment "${newIpAddress}"`);
            return;
        }
        __classPrivateFieldSet(this, _WebSocketConnectionManager_ipAddress, newIpAddress, "f");
        _console$c.log(`updated ipAddress to "${this.ipAddress}"`);
    }
    get isSecure() {
        return __classPrivateFieldGet(this, _WebSocketConnectionManager_isSecure, "f");
    }
    set isSecure(newIsSecure) {
        this.assertIsNotConnected();
        if (__classPrivateFieldGet(this, _WebSocketConnectionManager_isSecure, "f") == newIsSecure) {
            _console$c.log(`redundant isSecure assignment ${newIsSecure}`);
            return;
        }
        __classPrivateFieldSet(this, _WebSocketConnectionManager_isSecure, newIsSecure, "f");
        _console$c.log(`updated isSecure to "${this.isSecure}"`);
    }
    get url() {
        return `${this.isSecure ? "wss" : "ws"}://${this.ipAddress}/ws`;
    }
    async connect() {
        await super.connect();
        this.webSocket = new WebSocket(this.url);
    }
    async disconnect() {
        await super.disconnect();
        _console$c.log("closing websocket");
        __classPrivateFieldGet(this, _WebSocketConnectionManager_pingTimer, "f").stop();
        __classPrivateFieldGet(this, _WebSocketConnectionManager_webSocket, "f")?.close();
    }
    get canReconnect() {
        return true;
    }
    async reconnect() {
        await super.reconnect();
        this.webSocket = new WebSocket(this.url);
    }
    async sendSmpMessage(data) {
        super.sendSmpMessage(data);
        _console$c.error("smp not supported on webSockets");
    }
    async sendTxData(data) {
        await super.sendTxData(data);
        if (data.byteLength == 0) {
            return;
        }
        __classPrivateFieldGet(this, _WebSocketConnectionManager_instances, "m", _WebSocketConnectionManager_sendWebSocketMessage).call(this, { type: "message", data });
    }
}
_WebSocketConnectionManager_bluetoothId = new WeakMap(), _WebSocketConnectionManager_webSocket = new WeakMap(), _WebSocketConnectionManager_ipAddress = new WeakMap(), _WebSocketConnectionManager_isSecure = new WeakMap(), _WebSocketConnectionManager_boundWebSocketEventListeners = new WeakMap(), _WebSocketConnectionManager_pingTimer = new WeakMap(), _WebSocketConnectionManager_instances = new WeakSet(), _WebSocketConnectionManager_sendMessage = function _WebSocketConnectionManager_sendMessage(message) {
    this.assertIsConnected();
    _console$c.log("sending webSocket message", message);
    __classPrivateFieldGet(this, _WebSocketConnectionManager_webSocket, "f").send(message);
    __classPrivateFieldGet(this, _WebSocketConnectionManager_pingTimer, "f").restart();
}, _WebSocketConnectionManager_sendWebSocketMessage = function _WebSocketConnectionManager_sendWebSocketMessage(...messages) {
    __classPrivateFieldGet(this, _WebSocketConnectionManager_instances, "m", _WebSocketConnectionManager_sendMessage).call(this, createWebSocketMessage(...messages));
}, _WebSocketConnectionManager_onWebSocketOpen = function _WebSocketConnectionManager_onWebSocketOpen(event) {
    _console$c.log("webSocket.open", event);
    __classPrivateFieldGet(this, _WebSocketConnectionManager_pingTimer, "f").start();
    this.status = "connected";
    __classPrivateFieldGet(this, _WebSocketConnectionManager_instances, "m", _WebSocketConnectionManager_requestDeviceInformation).call(this);
}, _WebSocketConnectionManager_onWebSocketMessage = async function _WebSocketConnectionManager_onWebSocketMessage(event) {
    const arrayBuffer = await event.data.arrayBuffer();
    const dataView = new DataView(arrayBuffer);
    _console$c.log(`webSocket.message (${dataView.byteLength} bytes)`);
    __classPrivateFieldGet(this, _WebSocketConnectionManager_instances, "m", _WebSocketConnectionManager_parseWebSocketMessage).call(this, dataView);
}, _WebSocketConnectionManager_onWebSocketClose = function _WebSocketConnectionManager_onWebSocketClose(event) {
    _console$c.log("webSocket.close", event);
    this.status = "notConnected";
    __classPrivateFieldGet(this, _WebSocketConnectionManager_pingTimer, "f").stop();
}, _WebSocketConnectionManager_onWebSocketError = function _WebSocketConnectionManager_onWebSocketError(event) {
    _console$c.error("webSocket.error", event);
}, _WebSocketConnectionManager_parseWebSocketMessage = function _WebSocketConnectionManager_parseWebSocketMessage(dataView) {
    parseMessage(dataView, WebSocketMessageTypes, __classPrivateFieldGet(this, _WebSocketConnectionManager_instances, "m", _WebSocketConnectionManager_onMessage).bind(this), null, true);
}, _WebSocketConnectionManager_onMessage = function _WebSocketConnectionManager_onMessage(messageType, dataView) {
    _console$c.log(`received "${messageType}" message (${dataView.byteLength} bytes)`);
    switch (messageType) {
        case "ping":
            __classPrivateFieldGet(this, _WebSocketConnectionManager_instances, "m", _WebSocketConnectionManager_pong).call(this);
            break;
        case "pong":
            break;
        case "batteryLevel":
            this.onMessageReceived?.("batteryLevel", dataView);
            break;
        case "deviceInformation":
            parseMessage(dataView, DeviceInformationTypes, (deviceInformationType, dataView) => {
                this.onMessageReceived(deviceInformationType, dataView);
            });
            break;
        case "message":
            this.parseRxMessage(dataView);
            break;
        default:
            _console$c.error(`uncaught messageType "${messageType}"`);
            break;
    }
}, _WebSocketConnectionManager_ping = function _WebSocketConnectionManager_ping() {
    _console$c.log("pinging");
    __classPrivateFieldGet(this, _WebSocketConnectionManager_instances, "m", _WebSocketConnectionManager_sendWebSocketMessage).call(this, "ping");
}, _WebSocketConnectionManager_pong = function _WebSocketConnectionManager_pong() {
    _console$c.log("ponging");
    __classPrivateFieldGet(this, _WebSocketConnectionManager_instances, "m", _WebSocketConnectionManager_sendWebSocketMessage).call(this, "pong");
}, _WebSocketConnectionManager_requestDeviceInformation = function _WebSocketConnectionManager_requestDeviceInformation() {
    __classPrivateFieldGet(this, _WebSocketConnectionManager_instances, "m", _WebSocketConnectionManager_sendWebSocketMessage).call(this, ...WebSocketDeviceInformationMessageTypes);
};

var _Device_instances, _a$3, _Device_DefaultConnectionManager, _Device_eventDispatcher, _Device_dispatchEvent_get, _Device_connectionManager, _Device_sendTxMessages, _Device_isConnected, _Device_assertIsConnected, _Device_didReceiveMessageTypes, _Device_hasRequiredInformation_get, _Device_requestRequiredInformation, _Device_assertCanReconnect, _Device_ReconnectOnDisconnection, _Device_reconnectOnDisconnection, _Device_reconnectIntervalId, _Device_onConnectionStatusUpdated, _Device_dispatchConnectionEvents, _Device_checkConnection, _Device_clear, _Device_clearConnection, _Device_onConnectionMessageReceived, _Device_onConnectionMessagesReceived, _Device_deviceInformationManager, _Device_batteryLevel, _Device_updateBatteryLevel, _Device_sensorConfigurationManager, _Device_ClearSensorConfigurationOnLeave, _Device_clearSensorConfigurationOnLeave, _Device_sensorDataManager, _Device_vibrationManager, _Device_fileTransferManager, _Device_tfliteManager, _Device_firmwareManager, _Device_assertCanUpdateFirmware, _Device_sendSmpMessage, _Device_isServerSide, _Device_wifiManager;
const _console$b = createConsole("Device", { log: true });
const DeviceEventTypes = [
    "connectionMessage",
    ...ConnectionEventTypes,
    ...MetaConnectionMessageTypes,
    ...BatteryLevelMessageTypes,
    ...InformationEventTypes,
    ...DeviceInformationEventTypes,
    ...SensorConfigurationEventTypes,
    ...SensorDataEventTypes,
    ...FileTransferEventTypes,
    ...TfliteEventTypes,
    ...WifiEventTypes,
    ...FirmwareEventTypes,
];
const RequiredInformationConnectionMessages = [
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
    "getFileType",
    "fileTransferStatus",
    "getTfliteName",
    "getTfliteTask",
    "getTfliteSampleRate",
    "getTfliteSensorTypes",
    "tfliteIsReady",
    "getTfliteCaptureDelay",
    "getTfliteThreshold",
    "getTfliteInferencingEnabled",
    "isWifiAvailable",
];
class Device {
    get bluetoothId() {
        return __classPrivateFieldGet(this, _Device_connectionManager, "f")?.bluetoothId;
    }
    get isAvailable() {
        return __classPrivateFieldGet(this, _Device_connectionManager, "f")?.isAvailable;
    }
    constructor() {
        _Device_instances.add(this);
        _Device_eventDispatcher.set(this, new EventDispatcher(this, DeviceEventTypes));
        _Device_connectionManager.set(this, void 0);
        this.sendTxMessages = __classPrivateFieldGet(this, _Device_instances, "m", _Device_sendTxMessages).bind(this);
        _Device_isConnected.set(this, false);
        _Device_reconnectOnDisconnection.set(this, _a$3.ReconnectOnDisconnection);
        _Device_reconnectIntervalId.set(this, void 0);
        this.latestConnectionMessages = new Map();
        _Device_deviceInformationManager.set(this, new DeviceInformationManager());
        _Device_batteryLevel.set(this, 0);
        this._informationManager = new InformationManager();
        _Device_sensorConfigurationManager.set(this, new SensorConfigurationManager());
        _Device_clearSensorConfigurationOnLeave.set(this, _a$3.ClearSensorConfigurationOnLeave);
        _Device_sensorDataManager.set(this, new SensorDataManager());
        _Device_vibrationManager.set(this, new VibrationManager());
        _Device_fileTransferManager.set(this, new FileTransferManager());
        _Device_tfliteManager.set(this, new TfliteManager());
        _Device_firmwareManager.set(this, new FirmwareManager());
        this.sendSmpMessage = __classPrivateFieldGet(this, _Device_instances, "m", _Device_sendSmpMessage).bind(this);
        _Device_isServerSide.set(this, false);
        _Device_wifiManager.set(this, new WifiManager());
        __classPrivateFieldGet(this, _Device_deviceInformationManager, "f").eventDispatcher = __classPrivateFieldGet(this, _Device_eventDispatcher, "f");
        this._informationManager.sendMessage = this
            .sendTxMessages;
        this._informationManager.eventDispatcher = __classPrivateFieldGet(this, _Device_eventDispatcher, "f");
        __classPrivateFieldGet(this, _Device_sensorConfigurationManager, "f").sendMessage = this
            .sendTxMessages;
        __classPrivateFieldGet(this, _Device_sensorConfigurationManager, "f").eventDispatcher = __classPrivateFieldGet(this, _Device_eventDispatcher, "f");
        __classPrivateFieldGet(this, _Device_sensorDataManager, "f").eventDispatcher = __classPrivateFieldGet(this, _Device_eventDispatcher, "f");
        __classPrivateFieldGet(this, _Device_vibrationManager, "f").sendMessage = this
            .sendTxMessages;
        __classPrivateFieldGet(this, _Device_tfliteManager, "f").sendMessage = this
            .sendTxMessages;
        __classPrivateFieldGet(this, _Device_tfliteManager, "f").eventDispatcher = __classPrivateFieldGet(this, _Device_eventDispatcher, "f");
        __classPrivateFieldGet(this, _Device_fileTransferManager, "f").sendMessage = this
            .sendTxMessages;
        __classPrivateFieldGet(this, _Device_fileTransferManager, "f").eventDispatcher = __classPrivateFieldGet(this, _Device_eventDispatcher, "f");
        __classPrivateFieldGet(this, _Device_wifiManager, "f").sendMessage = this
            .sendTxMessages;
        __classPrivateFieldGet(this, _Device_wifiManager, "f").eventDispatcher = __classPrivateFieldGet(this, _Device_eventDispatcher, "f");
        __classPrivateFieldGet(this, _Device_firmwareManager, "f").sendMessage = this
            .sendSmpMessage;
        __classPrivateFieldGet(this, _Device_firmwareManager, "f").eventDispatcher = __classPrivateFieldGet(this, _Device_eventDispatcher, "f");
        this.addEventListener("getMtu", () => {
            __classPrivateFieldGet(this, _Device_firmwareManager, "f").mtu = this.mtu;
            __classPrivateFieldGet(this, _Device_fileTransferManager, "f").mtu = this.mtu;
            this.connectionManager.mtu = this.mtu;
        });
        this.addEventListener("isWifiAvailable", () => {
            if (this.connectionType == "client" && !isInNode) {
                return;
            }
            if (this.isWifiAvailable) {
                __classPrivateFieldGet(this, _Device_wifiManager, "f").requestRequiredInformation();
            }
        });
        DeviceManager$1.onDevice(this);
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
    }
    get addEventListener() {
        return __classPrivateFieldGet(this, _Device_eventDispatcher, "f").addEventListener;
    }
    get removeEventListener() {
        return __classPrivateFieldGet(this, _Device_eventDispatcher, "f").removeEventListener;
    }
    get waitForEvent() {
        return __classPrivateFieldGet(this, _Device_eventDispatcher, "f").waitForEvent;
    }
    get removeEventListeners() {
        return __classPrivateFieldGet(this, _Device_eventDispatcher, "f").removeEventListeners;
    }
    get removeAllEventListeners() {
        return __classPrivateFieldGet(this, _Device_eventDispatcher, "f").removeAllEventListeners;
    }
    get connectionManager() {
        return __classPrivateFieldGet(this, _Device_connectionManager, "f");
    }
    set connectionManager(newConnectionManager) {
        if (this.connectionManager == newConnectionManager) {
            _console$b.log("same connectionManager is already assigned");
            return;
        }
        if (this.connectionManager) {
            this.connectionManager.onStatusUpdated = undefined;
            this.connectionManager.onMessageReceived = undefined;
            this.connectionManager.onMessagesReceived = undefined;
        }
        if (newConnectionManager) {
            newConnectionManager.onStatusUpdated =
                __classPrivateFieldGet(this, _Device_instances, "m", _Device_onConnectionStatusUpdated).bind(this);
            newConnectionManager.onMessageReceived =
                __classPrivateFieldGet(this, _Device_instances, "m", _Device_onConnectionMessageReceived).bind(this);
            newConnectionManager.onMessagesReceived =
                __classPrivateFieldGet(this, _Device_instances, "m", _Device_onConnectionMessagesReceived).bind(this);
        }
        __classPrivateFieldSet(this, _Device_connectionManager, newConnectionManager, "f");
        _console$b.log("assigned new connectionManager", __classPrivateFieldGet(this, _Device_connectionManager, "f"));
        this._informationManager.connectionType = this.connectionType;
    }
    async connect(options) {
        if (options) {
            _console$b.log("connect options", options);
            switch (options.type) {
                case "webBluetooth":
                    this.connectionManager = new WebBluetoothConnectionManager();
                    break;
                case "webSocket":
                    this.connectionManager = new WebSocketConnectionManager(options.ipAddress, options.isWifiSecure, this.bluetoothId);
                    break;
            }
        }
        if (!this.connectionManager) {
            this.connectionManager = __classPrivateFieldGet(_a$3, _a$3, "m", _Device_DefaultConnectionManager).call(_a$3);
        }
        __classPrivateFieldGet(this, _Device_instances, "m", _Device_clear).call(this);
        if (options?.type == "client") {
            _console$b.assertWithError(this.connectionType == "client", "expected clientConnectionManager");
            const clientConnectionManager = this
                .connectionManager;
            clientConnectionManager.subType = options.subType;
            return clientConnectionManager.connect();
        }
        return this.connectionManager.connect();
    }
    get isConnected() {
        return __classPrivateFieldGet(this, _Device_isConnected, "f");
    }
    get canReconnect() {
        return this.connectionManager?.canReconnect;
    }
    async reconnect() {
        __classPrivateFieldGet(this, _Device_instances, "m", _Device_assertCanReconnect).call(this);
        __classPrivateFieldGet(this, _Device_instances, "m", _Device_clear).call(this);
        return this.connectionManager?.reconnect();
    }
    static async Connect() {
        const device = new _a$3();
        await device.connect();
        return device;
    }
    static get ReconnectOnDisconnection() {
        return __classPrivateFieldGet(this, _a$3, "f", _Device_ReconnectOnDisconnection);
    }
    static set ReconnectOnDisconnection(newReconnectOnDisconnection) {
        _console$b.assertTypeWithError(newReconnectOnDisconnection, "boolean");
        __classPrivateFieldSet(this, _a$3, newReconnectOnDisconnection, "f", _Device_ReconnectOnDisconnection);
    }
    get reconnectOnDisconnection() {
        return __classPrivateFieldGet(this, _Device_reconnectOnDisconnection, "f");
    }
    set reconnectOnDisconnection(newReconnectOnDisconnection) {
        _console$b.assertTypeWithError(newReconnectOnDisconnection, "boolean");
        __classPrivateFieldSet(this, _Device_reconnectOnDisconnection, newReconnectOnDisconnection, "f");
    }
    get connectionType() {
        return this.connectionManager?.type;
    }
    async disconnect() {
        __classPrivateFieldGet(this, _Device_instances, "m", _Device_assertIsConnected).call(this);
        if (this.reconnectOnDisconnection) {
            this.reconnectOnDisconnection = false;
            this.addEventListener("isConnected", () => {
                this.reconnectOnDisconnection = true;
            }, { once: true });
        }
        return this.connectionManager.disconnect();
    }
    toggleConnection() {
        if (this.isConnected) {
            this.disconnect();
        }
        else if (this.canReconnect) {
            this.reconnect();
        }
        else {
            this.connect();
        }
    }
    get connectionStatus() {
        switch (__classPrivateFieldGet(this, _Device_connectionManager, "f")?.status) {
            case "connected":
                return this.isConnected ? "connected" : "connecting";
            case "notConnected":
            case "connecting":
            case "disconnecting":
                return __classPrivateFieldGet(this, _Device_connectionManager, "f").status;
            default:
                return "notConnected";
        }
    }
    get isConnectionBusy() {
        return (this.connectionStatus == "connecting" ||
            this.connectionStatus == "disconnecting");
    }
    get deviceInformation() {
        return __classPrivateFieldGet(this, _Device_deviceInformationManager, "f").information;
    }
    get batteryLevel() {
        return __classPrivateFieldGet(this, _Device_batteryLevel, "f");
    }
    get id() {
        return this._informationManager.id;
    }
    get isCharging() {
        return this._informationManager.isCharging;
    }
    get batteryCurrent() {
        return this._informationManager.batteryCurrent;
    }
    get getBatteryCurrent() {
        return this._informationManager.getBatteryCurrent;
    }
    get name() {
        return this._informationManager.name;
    }
    get setName() {
        return this._informationManager.setName;
    }
    get type() {
        return this._informationManager.type;
    }
    get setType() {
        return this._informationManager.setType;
    }
    get isInsole() {
        return this._informationManager.isInsole;
    }
    get isGlove() {
        return this._informationManager.isGlove;
    }
    get side() {
        return this._informationManager.side;
    }
    get mtu() {
        return this._informationManager.mtu;
    }
    get sensorTypes() {
        return Object.keys(this.sensorConfiguration);
    }
    get continuousSensorTypes() {
        return ContinuousSensorTypes.filter((sensorType) => this.sensorTypes.includes(sensorType));
    }
    get sensorConfiguration() {
        return __classPrivateFieldGet(this, _Device_sensorConfigurationManager, "f").configuration;
    }
    async setSensorConfiguration(newSensorConfiguration, clearRest) {
        await __classPrivateFieldGet(this, _Device_sensorConfigurationManager, "f").setConfiguration(newSensorConfiguration, clearRest);
    }
    async clearSensorConfiguration() {
        return __classPrivateFieldGet(this, _Device_sensorConfigurationManager, "f").clearSensorConfiguration();
    }
    static get ClearSensorConfigurationOnLeave() {
        return __classPrivateFieldGet(this, _a$3, "f", _Device_ClearSensorConfigurationOnLeave);
    }
    static set ClearSensorConfigurationOnLeave(newClearSensorConfigurationOnLeave) {
        _console$b.assertTypeWithError(newClearSensorConfigurationOnLeave, "boolean");
        __classPrivateFieldSet(this, _a$3, newClearSensorConfigurationOnLeave, "f", _Device_ClearSensorConfigurationOnLeave);
    }
    get clearSensorConfigurationOnLeave() {
        return __classPrivateFieldGet(this, _Device_clearSensorConfigurationOnLeave, "f");
    }
    set clearSensorConfigurationOnLeave(newClearSensorConfigurationOnLeave) {
        _console$b.assertTypeWithError(newClearSensorConfigurationOnLeave, "boolean");
        __classPrivateFieldSet(this, _Device_clearSensorConfigurationOnLeave, newClearSensorConfigurationOnLeave, "f");
    }
    get numberOfPressureSensors() {
        return __classPrivateFieldGet(this, _Device_sensorDataManager, "f").pressureSensorDataManager.numberOfSensors;
    }
    resetPressureRange() {
        __classPrivateFieldGet(this, _Device_sensorDataManager, "f").pressureSensorDataManager.resetRange();
    }
    async triggerVibration(vibrationConfigurations, sendImmediately) {
        __classPrivateFieldGet(this, _Device_vibrationManager, "f").triggerVibration(vibrationConfigurations, sendImmediately);
    }
    get maxFileLength() {
        return __classPrivateFieldGet(this, _Device_fileTransferManager, "f").maxLength;
    }
    get validFileTypes() {
        return FileTypes.filter((fileType) => {
            if (fileType.includes("wifi") && !this.isWifiAvailable) {
                return false;
            }
            return true;
        });
    }
    async sendFile(fileType, file) {
        _console$b.assertWithError(this.validFileTypes.includes(fileType), `invalid fileType ${fileType}`);
        const promise = this.waitForEvent("fileTransferComplete");
        __classPrivateFieldGet(this, _Device_fileTransferManager, "f").send(fileType, file);
        await promise;
    }
    async receiveFile(fileType) {
        const promise = this.waitForEvent("fileTransferComplete");
        __classPrivateFieldGet(this, _Device_fileTransferManager, "f").receive(fileType);
        await promise;
    }
    get fileTransferStatus() {
        return __classPrivateFieldGet(this, _Device_fileTransferManager, "f").status;
    }
    cancelFileTransfer() {
        __classPrivateFieldGet(this, _Device_fileTransferManager, "f").cancel();
    }
    get tfliteName() {
        return __classPrivateFieldGet(this, _Device_tfliteManager, "f").name;
    }
    get setTfliteName() {
        return __classPrivateFieldGet(this, _Device_tfliteManager, "f").setName;
    }
    get tfliteTask() {
        return __classPrivateFieldGet(this, _Device_tfliteManager, "f").task;
    }
    get setTfliteTask() {
        return __classPrivateFieldGet(this, _Device_tfliteManager, "f").setTask;
    }
    get tfliteSampleRate() {
        return __classPrivateFieldGet(this, _Device_tfliteManager, "f").sampleRate;
    }
    get setTfliteSampleRate() {
        return __classPrivateFieldGet(this, _Device_tfliteManager, "f").setSampleRate;
    }
    get tfliteSensorTypes() {
        return __classPrivateFieldGet(this, _Device_tfliteManager, "f").sensorTypes;
    }
    get allowedTfliteSensorTypes() {
        return this.sensorTypes.filter((sensorType) => TfliteSensorTypes.includes(sensorType));
    }
    get setTfliteSensorTypes() {
        return __classPrivateFieldGet(this, _Device_tfliteManager, "f").setSensorTypes;
    }
    get tfliteIsReady() {
        return __classPrivateFieldGet(this, _Device_tfliteManager, "f").isReady;
    }
    get tfliteInferencingEnabled() {
        return __classPrivateFieldGet(this, _Device_tfliteManager, "f").inferencingEnabled;
    }
    get setTfliteInferencingEnabled() {
        return __classPrivateFieldGet(this, _Device_tfliteManager, "f").setInferencingEnabled;
    }
    async enableTfliteInferencing() {
        return this.setTfliteInferencingEnabled(true);
    }
    async disableTfliteInferencing() {
        return this.setTfliteInferencingEnabled(false);
    }
    get toggleTfliteInferencing() {
        return __classPrivateFieldGet(this, _Device_tfliteManager, "f").toggleInferencingEnabled;
    }
    get tfliteCaptureDelay() {
        return __classPrivateFieldGet(this, _Device_tfliteManager, "f").captureDelay;
    }
    get setTfliteCaptureDelay() {
        return __classPrivateFieldGet(this, _Device_tfliteManager, "f").setCaptureDelay;
    }
    get tfliteThreshold() {
        return __classPrivateFieldGet(this, _Device_tfliteManager, "f").threshold;
    }
    get setTfliteThreshold() {
        return __classPrivateFieldGet(this, _Device_tfliteManager, "f").setThreshold;
    }
    get canUpdateFirmware() {
        return __classPrivateFieldGet(this, _Device_connectionManager, "f")?.canUpdateFirmware;
    }
    get uploadFirmware() {
        __classPrivateFieldGet(this, _Device_instances, "m", _Device_assertCanUpdateFirmware).call(this);
        return __classPrivateFieldGet(this, _Device_firmwareManager, "f").uploadFirmware;
    }
    get canReset() {
        return this.canUpdateFirmware;
    }
    async reset() {
        _console$b.assertWithError(this.canReset, "reset is not enabled for this device");
        await __classPrivateFieldGet(this, _Device_firmwareManager, "f").reset();
        return __classPrivateFieldGet(this, _Device_connectionManager, "f").disconnect();
    }
    get firmwareStatus() {
        return __classPrivateFieldGet(this, _Device_firmwareManager, "f").status;
    }
    get getFirmwareImages() {
        __classPrivateFieldGet(this, _Device_instances, "m", _Device_assertCanUpdateFirmware).call(this);
        return __classPrivateFieldGet(this, _Device_firmwareManager, "f").getImages;
    }
    get firmwareImages() {
        return __classPrivateFieldGet(this, _Device_firmwareManager, "f").images;
    }
    get eraseFirmwareImage() {
        __classPrivateFieldGet(this, _Device_instances, "m", _Device_assertCanUpdateFirmware).call(this);
        return __classPrivateFieldGet(this, _Device_firmwareManager, "f").eraseImage;
    }
    get confirmFirmwareImage() {
        __classPrivateFieldGet(this, _Device_instances, "m", _Device_assertCanUpdateFirmware).call(this);
        return __classPrivateFieldGet(this, _Device_firmwareManager, "f").confirmImage;
    }
    get testFirmwareImage() {
        __classPrivateFieldGet(this, _Device_instances, "m", _Device_assertCanUpdateFirmware).call(this);
        return __classPrivateFieldGet(this, _Device_firmwareManager, "f").testImage;
    }
    get isServerSide() {
        return __classPrivateFieldGet(this, _Device_isServerSide, "f");
    }
    set isServerSide(newIsServerSide) {
        if (__classPrivateFieldGet(this, _Device_isServerSide, "f") == newIsServerSide) {
            _console$b.log("redundant isServerSide assignment");
            return;
        }
        _console$b.log({ newIsServerSide });
        __classPrivateFieldSet(this, _Device_isServerSide, newIsServerSide, "f");
        __classPrivateFieldGet(this, _Device_fileTransferManager, "f").isServerSide = this.isServerSide;
    }
    get isUkaton() {
        return this.deviceInformation.modelNumber.includes("Ukaton");
    }
    get isWifiAvailable() {
        return __classPrivateFieldGet(this, _Device_wifiManager, "f").isWifiAvailable;
    }
    get wifiSSID() {
        return __classPrivateFieldGet(this, _Device_wifiManager, "f").wifiSSID;
    }
    async setWifiSSID(newWifiSSID) {
        return __classPrivateFieldGet(this, _Device_wifiManager, "f").setWifiSSID(newWifiSSID);
    }
    get wifiPassword() {
        return __classPrivateFieldGet(this, _Device_wifiManager, "f").wifiPassword;
    }
    async setWifiPassword(newWifiPassword) {
        return __classPrivateFieldGet(this, _Device_wifiManager, "f").setWifiPassword(newWifiPassword);
    }
    get isWifiConnected() {
        return __classPrivateFieldGet(this, _Device_wifiManager, "f").isWifiConnected;
    }
    get ipAddress() {
        return __classPrivateFieldGet(this, _Device_wifiManager, "f").ipAddress;
    }
    get wifiConnectionEnabled() {
        return __classPrivateFieldGet(this, _Device_wifiManager, "f").wifiConnectionEnabled;
    }
    get enableWifiConnection() {
        return __classPrivateFieldGet(this, _Device_wifiManager, "f").enableWifiConnection;
    }
    get setWifiConnectionEnabled() {
        return __classPrivateFieldGet(this, _Device_wifiManager, "f").setWifiConnectionEnabled;
    }
    get disableWifiConnection() {
        return __classPrivateFieldGet(this, _Device_wifiManager, "f").disableWifiConnection;
    }
    get toggleWifiConnection() {
        return __classPrivateFieldGet(this, _Device_wifiManager, "f").toggleWifiConnection;
    }
    get isWifiSecure() {
        return __classPrivateFieldGet(this, _Device_wifiManager, "f").isWifiSecure;
    }
    async reconnectViaWebSockets() {
        _console$b.assertWithError(this.isWifiConnected, "wifi is not connected");
        _console$b.assertWithError(this.connectionType != "webSocket", "already connected via webSockets");
        _console$b.assertTypeWithError(this.ipAddress, "string");
        _console$b.log("reconnecting via websockets...");
        await this.disconnect();
        await this.connect({
            type: "webSocket",
            ipAddress: this.ipAddress,
            isWifiSecure: this.isWifiSecure,
        });
    }
}
_a$3 = Device, _Device_eventDispatcher = new WeakMap(), _Device_connectionManager = new WeakMap(), _Device_isConnected = new WeakMap(), _Device_reconnectOnDisconnection = new WeakMap(), _Device_reconnectIntervalId = new WeakMap(), _Device_deviceInformationManager = new WeakMap(), _Device_batteryLevel = new WeakMap(), _Device_sensorConfigurationManager = new WeakMap(), _Device_clearSensorConfigurationOnLeave = new WeakMap(), _Device_sensorDataManager = new WeakMap(), _Device_vibrationManager = new WeakMap(), _Device_fileTransferManager = new WeakMap(), _Device_tfliteManager = new WeakMap(), _Device_firmwareManager = new WeakMap(), _Device_isServerSide = new WeakMap(), _Device_wifiManager = new WeakMap(), _Device_instances = new WeakSet(), _Device_DefaultConnectionManager = function _Device_DefaultConnectionManager() {
    return new WebBluetoothConnectionManager();
}, _Device_dispatchEvent_get = function _Device_dispatchEvent_get() {
    return __classPrivateFieldGet(this, _Device_eventDispatcher, "f").dispatchEvent;
}, _Device_sendTxMessages = async function _Device_sendTxMessages(messages, sendImmediately) {
    await __classPrivateFieldGet(this, _Device_connectionManager, "f")?.sendTxMessages(messages, sendImmediately);
}, _Device_assertIsConnected = function _Device_assertIsConnected() {
    _console$b.assertWithError(this.isConnected, "notConnected");
}, _Device_didReceiveMessageTypes = function _Device_didReceiveMessageTypes(messageTypes) {
    return messageTypes.every((messageType) => {
        const hasConnectionMessage = this.latestConnectionMessages.has(messageType);
        if (!hasConnectionMessage) {
            _console$b.log(`didn't receive "${messageType}" message`);
        }
        return hasConnectionMessage;
    });
}, _Device_hasRequiredInformation_get = function _Device_hasRequiredInformation_get() {
    let hasRequiredInformation = __classPrivateFieldGet(this, _Device_instances, "m", _Device_didReceiveMessageTypes).call(this, RequiredInformationConnectionMessages);
    if (hasRequiredInformation && this.isWifiAvailable) {
        hasRequiredInformation = __classPrivateFieldGet(this, _Device_instances, "m", _Device_didReceiveMessageTypes).call(this, RequiredWifiMessageTypes);
    }
    return hasRequiredInformation;
}, _Device_requestRequiredInformation = function _Device_requestRequiredInformation() {
    _console$b.log("requesting required information");
    const messages = RequiredInformationConnectionMessages.map((messageType) => ({
        type: messageType,
    }));
    __classPrivateFieldGet(this, _Device_instances, "m", _Device_sendTxMessages).call(this, messages);
}, _Device_assertCanReconnect = function _Device_assertCanReconnect() {
    _console$b.assertWithError(this.canReconnect, "cannot reconnect to device");
}, _Device_onConnectionStatusUpdated = function _Device_onConnectionStatusUpdated(connectionStatus) {
    _console$b.log({ connectionStatus });
    if (connectionStatus == "notConnected") {
        __classPrivateFieldGet(this, _Device_instances, "m", _Device_clearConnection).call(this);
        if (this.canReconnect && this.reconnectOnDisconnection) {
            _console$b.log("starting reconnect interval...");
            __classPrivateFieldSet(this, _Device_reconnectIntervalId, setInterval(() => {
                _console$b.log("attempting reconnect...");
                this.reconnect();
            }, 1000), "f");
        }
    }
    else {
        if (__classPrivateFieldGet(this, _Device_reconnectIntervalId, "f") != undefined) {
            _console$b.log("clearing reconnect interval");
            clearInterval(__classPrivateFieldGet(this, _Device_reconnectIntervalId, "f"));
            __classPrivateFieldSet(this, _Device_reconnectIntervalId, undefined, "f");
        }
    }
    __classPrivateFieldGet(this, _Device_instances, "m", _Device_checkConnection).call(this);
    if (connectionStatus == "connected" && !__classPrivateFieldGet(this, _Device_isConnected, "f")) {
        __classPrivateFieldGet(this, _Device_instances, "m", _Device_requestRequiredInformation).call(this);
    }
    DeviceManager$1.OnDeviceConnectionStatusUpdated(this, connectionStatus);
}, _Device_dispatchConnectionEvents = function _Device_dispatchConnectionEvents(includeIsConnected = false) {
    __classPrivateFieldGet(this, _Device_instances, "a", _Device_dispatchEvent_get).call(this, "connectionStatus", {
        connectionStatus: this.connectionStatus,
    });
    __classPrivateFieldGet(this, _Device_instances, "a", _Device_dispatchEvent_get).call(this, this.connectionStatus, {});
    if (includeIsConnected) {
        __classPrivateFieldGet(this, _Device_instances, "a", _Device_dispatchEvent_get).call(this, "isConnected", { isConnected: this.isConnected });
    }
}, _Device_checkConnection = function _Device_checkConnection() {
    __classPrivateFieldSet(this, _Device_isConnected, Boolean(this.connectionManager?.isConnected) &&
        __classPrivateFieldGet(this, _Device_instances, "a", _Device_hasRequiredInformation_get) &&
        this._informationManager.isCurrentTimeSet, "f");
    switch (this.connectionStatus) {
        case "connected":
            if (__classPrivateFieldGet(this, _Device_isConnected, "f")) {
                __classPrivateFieldGet(this, _Device_instances, "m", _Device_dispatchConnectionEvents).call(this, true);
            }
            break;
        case "notConnected":
            __classPrivateFieldGet(this, _Device_instances, "m", _Device_dispatchConnectionEvents).call(this, true);
            break;
        default:
            __classPrivateFieldGet(this, _Device_instances, "m", _Device_dispatchConnectionEvents).call(this, false);
            break;
    }
}, _Device_clear = function _Device_clear() {
    __classPrivateFieldGet(this, _Device_instances, "m", _Device_clearConnection).call(this);
    this._informationManager.clear();
    __classPrivateFieldGet(this, _Device_deviceInformationManager, "f").clear();
    __classPrivateFieldGet(this, _Device_wifiManager, "f").clear();
}, _Device_clearConnection = function _Device_clearConnection() {
    this.connectionManager?.clear();
    this.latestConnectionMessages.clear();
}, _Device_onConnectionMessageReceived = function _Device_onConnectionMessageReceived(messageType, dataView) {
    _console$b.log({ messageType, dataView });
    switch (messageType) {
        case "batteryLevel":
            const batteryLevel = dataView.getUint8(0);
            _console$b.log("received battery level", { batteryLevel });
            __classPrivateFieldGet(this, _Device_instances, "m", _Device_updateBatteryLevel).call(this, batteryLevel);
            break;
        default:
            if (FileTransferMessageTypes.includes(messageType)) {
                __classPrivateFieldGet(this, _Device_fileTransferManager, "f").parseMessage(messageType, dataView);
            }
            else if (TfliteMessageTypes.includes(messageType)) {
                __classPrivateFieldGet(this, _Device_tfliteManager, "f").parseMessage(messageType, dataView);
            }
            else if (SensorDataMessageTypes.includes(messageType)) {
                __classPrivateFieldGet(this, _Device_sensorDataManager, "f").parseMessage(messageType, dataView);
            }
            else if (FirmwareMessageTypes.includes(messageType)) {
                __classPrivateFieldGet(this, _Device_firmwareManager, "f").parseMessage(messageType, dataView);
            }
            else if (DeviceInformationTypes.includes(messageType)) {
                __classPrivateFieldGet(this, _Device_deviceInformationManager, "f").parseMessage(messageType, dataView);
            }
            else if (InformationMessageTypes.includes(messageType)) {
                this._informationManager.parseMessage(messageType, dataView);
            }
            else if (SensorConfigurationMessageTypes.includes(messageType)) {
                __classPrivateFieldGet(this, _Device_sensorConfigurationManager, "f").parseMessage(messageType, dataView);
            }
            else if (WifiMessageTypes.includes(messageType)) {
                __classPrivateFieldGet(this, _Device_wifiManager, "f").parseMessage(messageType, dataView);
            }
            else {
                throw Error(`uncaught messageType ${messageType}`);
            }
    }
    this.latestConnectionMessages.set(messageType, dataView);
    __classPrivateFieldGet(this, _Device_instances, "a", _Device_dispatchEvent_get).call(this, "connectionMessage", { messageType, dataView });
}, _Device_onConnectionMessagesReceived = function _Device_onConnectionMessagesReceived() {
    if (!this.isConnected && __classPrivateFieldGet(this, _Device_instances, "a", _Device_hasRequiredInformation_get)) {
        __classPrivateFieldGet(this, _Device_instances, "m", _Device_checkConnection).call(this);
    }
    if (this.connectionStatus == "notConnected") {
        return;
    }
    __classPrivateFieldGet(this, _Device_instances, "m", _Device_sendTxMessages).call(this);
}, _Device_updateBatteryLevel = function _Device_updateBatteryLevel(updatedBatteryLevel) {
    _console$b.assertTypeWithError(updatedBatteryLevel, "number");
    if (__classPrivateFieldGet(this, _Device_batteryLevel, "f") == updatedBatteryLevel) {
        _console$b.log(`duplicate batteryLevel assignment ${updatedBatteryLevel}`);
        return;
    }
    __classPrivateFieldSet(this, _Device_batteryLevel, updatedBatteryLevel, "f");
    _console$b.log({ updatedBatteryLevel: __classPrivateFieldGet(this, _Device_batteryLevel, "f") });
    __classPrivateFieldGet(this, _Device_instances, "a", _Device_dispatchEvent_get).call(this, "batteryLevel", { batteryLevel: __classPrivateFieldGet(this, _Device_batteryLevel, "f") });
}, _Device_assertCanUpdateFirmware = function _Device_assertCanUpdateFirmware() {
    _console$b.assertWithError(this.canUpdateFirmware, "can't update firmware");
}, _Device_sendSmpMessage = function _Device_sendSmpMessage(data) {
    __classPrivateFieldGet(this, _Device_instances, "m", _Device_assertCanUpdateFirmware).call(this);
    return __classPrivateFieldGet(this, _Device_connectionManager, "f").sendSmpMessage(data);
};
_Device_ReconnectOnDisconnection = { value: false };
_Device_ClearSensorConfigurationOnLeave = { value: true };

var _DevicePairPressureSensorDataManager_instances, _DevicePairPressureSensorDataManager_rawPressure, _DevicePairPressureSensorDataManager_centerOfPressureHelper, _DevicePairPressureSensorDataManager_normalizedSumRangeHelper, _DevicePairPressureSensorDataManager_hasAllPressureData_get, _DevicePairPressureSensorDataManager_updatePressureData;
const _console$a = createConsole("DevicePairPressureSensorDataManager", { log: false });
class DevicePairPressureSensorDataManager {
    constructor() {
        _DevicePairPressureSensorDataManager_instances.add(this);
        _DevicePairPressureSensorDataManager_rawPressure.set(this, {});
        _DevicePairPressureSensorDataManager_centerOfPressureHelper.set(this, new CenterOfPressureHelper());
        _DevicePairPressureSensorDataManager_normalizedSumRangeHelper.set(this, new RangeHelper());
        this.resetPressureRange();
    }
    resetPressureRange() {
        __classPrivateFieldGet(this, _DevicePairPressureSensorDataManager_centerOfPressureHelper, "f").reset();
        __classPrivateFieldGet(this, _DevicePairPressureSensorDataManager_normalizedSumRangeHelper, "f").reset();
    }
    onDevicePressureData(event) {
        const { pressure } = event.message;
        const { side } = event.target;
        _console$a.log({ pressure, side });
        __classPrivateFieldGet(this, _DevicePairPressureSensorDataManager_rawPressure, "f")[side] = pressure;
        if (__classPrivateFieldGet(this, _DevicePairPressureSensorDataManager_instances, "a", _DevicePairPressureSensorDataManager_hasAllPressureData_get)) {
            return __classPrivateFieldGet(this, _DevicePairPressureSensorDataManager_instances, "m", _DevicePairPressureSensorDataManager_updatePressureData).call(this);
        }
        else {
            _console$a.log("doesn't have all pressure data yet...");
        }
    }
}
_DevicePairPressureSensorDataManager_rawPressure = new WeakMap(), _DevicePairPressureSensorDataManager_centerOfPressureHelper = new WeakMap(), _DevicePairPressureSensorDataManager_normalizedSumRangeHelper = new WeakMap(), _DevicePairPressureSensorDataManager_instances = new WeakSet(), _DevicePairPressureSensorDataManager_hasAllPressureData_get = function _DevicePairPressureSensorDataManager_hasAllPressureData_get() {
    return Sides.every((side) => side in __classPrivateFieldGet(this, _DevicePairPressureSensorDataManager_rawPressure, "f"));
}, _DevicePairPressureSensorDataManager_updatePressureData = function _DevicePairPressureSensorDataManager_updatePressureData() {
    const pressure = { scaledSum: 0, normalizedSum: 0, sensors: { left: [], right: [] } };
    Sides.forEach((side) => {
        const sidePressure = __classPrivateFieldGet(this, _DevicePairPressureSensorDataManager_rawPressure, "f")[side];
        pressure.scaledSum += sidePressure.scaledSum;
    });
    pressure.normalizedSum += __classPrivateFieldGet(this, _DevicePairPressureSensorDataManager_normalizedSumRangeHelper, "f").updateAndGetNormalization(pressure.scaledSum, false);
    if (pressure.scaledSum > 0) {
        pressure.center = { x: 0, y: 0 };
        Sides.forEach((side) => {
            const sidePressure = __classPrivateFieldGet(this, _DevicePairPressureSensorDataManager_rawPressure, "f")[side];
            {
                sidePressure.sensors.forEach((sensor) => {
                    const _sensor = { ...sensor };
                    _sensor.weightedValue = sensor.scaledValue / pressure.scaledSum;
                    let { x, y } = sensor.position;
                    x /= 2;
                    if (side == "right") {
                        x += 0.5;
                    }
                    _sensor.position = { x, y };
                    pressure.center.x += _sensor.position.x * _sensor.weightedValue;
                    pressure.center.y += _sensor.position.y * _sensor.weightedValue;
                    pressure.sensors[side].push(_sensor);
                });
            }
        });
        pressure.normalizedCenter = __classPrivateFieldGet(this, _DevicePairPressureSensorDataManager_centerOfPressureHelper, "f").updateAndGetNormalization(pressure.center, false);
    }
    _console$a.log({ devicePairPressure: pressure });
    return pressure;
};

var _DevicePairSensorDataManager_timestamps;
const _console$9 = createConsole("DevicePairSensorDataManager", { log: false });
const DevicePairSensorTypes = ["pressure", "sensorData"];
const DevicePairSensorDataEventTypes = DevicePairSensorTypes;
class DevicePairSensorDataManager {
    constructor() {
        _DevicePairSensorDataManager_timestamps.set(this, {});
        this.pressureSensorDataManager = new DevicePairPressureSensorDataManager();
    }
    get dispatchEvent() {
        return this.eventDispatcher.dispatchEvent;
    }
    resetPressureRange() {
        this.pressureSensorDataManager.resetPressureRange();
    }
    onDeviceSensorData(event) {
        const { timestamp, sensorType } = event.message;
        _console$9.log({ sensorType, timestamp, event });
        if (!__classPrivateFieldGet(this, _DevicePairSensorDataManager_timestamps, "f")[sensorType]) {
            __classPrivateFieldGet(this, _DevicePairSensorDataManager_timestamps, "f")[sensorType] = {};
        }
        __classPrivateFieldGet(this, _DevicePairSensorDataManager_timestamps, "f")[sensorType][event.target.side] = timestamp;
        let value;
        switch (sensorType) {
            case "pressure":
                value = this.pressureSensorDataManager.onDevicePressureData(event);
                break;
            default:
                _console$9.log(`uncaught sensorType "${sensorType}"`);
                break;
        }
        if (value) {
            const timestamps = Object.assign({}, __classPrivateFieldGet(this, _DevicePairSensorDataManager_timestamps, "f")[sensorType]);
            this.dispatchEvent(sensorType, { sensorType, timestamps, [sensorType]: value });
            this.dispatchEvent("sensorData", { sensorType, timestamps, [sensorType]: value });
        }
        else {
            _console$9.log("no value received");
        }
    }
}
_DevicePairSensorDataManager_timestamps = new WeakMap();

var _DevicePair_instances, _a$2, _DevicePair_type, _DevicePair_eventDispatcher, _DevicePair_dispatchEvent_get, _DevicePair_left, _DevicePair_right, _DevicePair_isDeviceCorrectType, _DevicePair_addDeviceEventListeners, _DevicePair_removeDeviceEventListeners, _DevicePair_removeDevice, _DevicePair_boundDeviceEventListeners, _DevicePair_redispatchDeviceEvent, _DevicePair_onDeviceIsConnected, _DevicePair_onDeviceType, _DevicePair_sensorDataManager, _DevicePair_onDeviceSensorData, _DevicePair_insoles, _DevicePair_gloves;
const _console$8 = createConsole("DevicePair", { log: false });
function getDevicePairDeviceEventType(deviceEventType) {
    return `device${capitalizeFirstCharacter(deviceEventType)}`;
}
const DevicePairDeviceEventTypes = DeviceEventTypes.map((eventType) => getDevicePairDeviceEventType(eventType));
const DevicePairConnectionEventTypes = ["isConnected"];
const DevicePairEventTypes = [
    ...DevicePairConnectionEventTypes,
    ...DevicePairSensorDataEventTypes,
    ...DevicePairDeviceEventTypes,
];
const DevicePairTypes = ["insoles", "gloves"];
class DevicePair {
    constructor(type) {
        _DevicePair_instances.add(this);
        _DevicePair_type.set(this, void 0);
        _DevicePair_eventDispatcher.set(this, new EventDispatcher(this, DevicePairEventTypes));
        _DevicePair_left.set(this, void 0);
        _DevicePair_right.set(this, void 0);
        _DevicePair_boundDeviceEventListeners.set(this, {
            isConnected: __classPrivateFieldGet(this, _DevicePair_instances, "m", _DevicePair_onDeviceIsConnected).bind(this),
            sensorData: __classPrivateFieldGet(this, _DevicePair_instances, "m", _DevicePair_onDeviceSensorData).bind(this),
            getType: __classPrivateFieldGet(this, _DevicePair_instances, "m", _DevicePair_onDeviceType).bind(this),
        });
        _DevicePair_sensorDataManager.set(this, new DevicePairSensorDataManager());
        __classPrivateFieldSet(this, _DevicePair_type, type, "f");
        __classPrivateFieldGet(this, _DevicePair_sensorDataManager, "f").eventDispatcher = __classPrivateFieldGet(this, _DevicePair_eventDispatcher, "f");
    }
    get sides() {
        return Sides;
    }
    get type() {
        return __classPrivateFieldGet(this, _DevicePair_type, "f");
    }
    get addEventListener() {
        return __classPrivateFieldGet(this, _DevicePair_eventDispatcher, "f").addEventListener;
    }
    get removeEventListener() {
        return __classPrivateFieldGet(this, _DevicePair_eventDispatcher, "f").removeEventListener;
    }
    get waitForEvent() {
        return __classPrivateFieldGet(this, _DevicePair_eventDispatcher, "f").waitForEvent;
    }
    get removeEventListeners() {
        return __classPrivateFieldGet(this, _DevicePair_eventDispatcher, "f").removeEventListeners;
    }
    get removeAllEventListeners() {
        return __classPrivateFieldGet(this, _DevicePair_eventDispatcher, "f").removeAllEventListeners;
    }
    get left() {
        return __classPrivateFieldGet(this, _DevicePair_left, "f");
    }
    get right() {
        return __classPrivateFieldGet(this, _DevicePair_right, "f");
    }
    get isConnected() {
        return Sides.every((side) => this[side]?.isConnected);
    }
    get isPartiallyConnected() {
        return Sides.some((side) => this[side]?.isConnected);
    }
    get isHalfConnected() {
        return this.isPartiallyConnected && !this.isConnected;
    }
    assignDevice(device) {
        if (!__classPrivateFieldGet(this, _DevicePair_instances, "m", _DevicePair_isDeviceCorrectType).call(this, device)) {
            _console$8.log(`device is incorrect type ${device.type} for ${this.type} devicePair`);
            return;
        }
        const side = device.side;
        const currentDevice = this[side];
        if (device == currentDevice) {
            _console$8.log("device already assigned");
            return;
        }
        if (currentDevice) {
            __classPrivateFieldGet(this, _DevicePair_instances, "m", _DevicePair_removeDeviceEventListeners).call(this, currentDevice);
        }
        __classPrivateFieldGet(this, _DevicePair_instances, "m", _DevicePair_addDeviceEventListeners).call(this, device);
        switch (side) {
            case "left":
                __classPrivateFieldSet(this, _DevicePair_left, device, "f");
                break;
            case "right":
                __classPrivateFieldSet(this, _DevicePair_right, device, "f");
                break;
        }
        _console$8.log(`assigned ${side} ${this.type} device`, device);
        this.resetPressureRange();
        __classPrivateFieldGet(this, _DevicePair_instances, "a", _DevicePair_dispatchEvent_get).call(this, "isConnected", { isConnected: this.isConnected });
        __classPrivateFieldGet(this, _DevicePair_instances, "a", _DevicePair_dispatchEvent_get).call(this, "deviceIsConnected", {
            device,
            isConnected: device.isConnected,
            side,
        });
        return currentDevice;
    }
    async setSensorConfiguration(sensorConfiguration) {
        for (let i = 0; i < Sides.length; i++) {
            const side = Sides[i];
            if (this[side]?.isConnected) {
                await this[side].setSensorConfiguration(sensorConfiguration);
            }
        }
    }
    resetPressureRange() {
        Sides.forEach((side) => this[side]?.resetPressureRange());
        __classPrivateFieldGet(this, _DevicePair_sensorDataManager, "f").resetPressureRange();
    }
    async triggerVibration(vibrationConfigurations, sendImmediately) {
        const promises = Sides.map((side) => {
            return this[side]?.triggerVibration(vibrationConfigurations, sendImmediately);
        }).filter(Boolean);
        return Promise.allSettled(promises);
    }
    static get insoles() {
        return __classPrivateFieldGet(this, _a$2, "f", _DevicePair_insoles);
    }
    static get gloves() {
        return __classPrivateFieldGet(this, _a$2, "f", _DevicePair_gloves);
    }
}
_a$2 = DevicePair, _DevicePair_type = new WeakMap(), _DevicePair_eventDispatcher = new WeakMap(), _DevicePair_left = new WeakMap(), _DevicePair_right = new WeakMap(), _DevicePair_boundDeviceEventListeners = new WeakMap(), _DevicePair_sensorDataManager = new WeakMap(), _DevicePair_instances = new WeakSet(), _DevicePair_dispatchEvent_get = function _DevicePair_dispatchEvent_get() {
    return __classPrivateFieldGet(this, _DevicePair_eventDispatcher, "f").dispatchEvent;
}, _DevicePair_isDeviceCorrectType = function _DevicePair_isDeviceCorrectType(device) {
    switch (this.type) {
        case "insoles":
            return device.isInsole;
        case "gloves":
            return device.isGlove;
    }
}, _DevicePair_addDeviceEventListeners = function _DevicePair_addDeviceEventListeners(device) {
    addEventListeners(device, __classPrivateFieldGet(this, _DevicePair_boundDeviceEventListeners, "f"));
    DeviceEventTypes.forEach((deviceEventType) => {
        device.addEventListener(deviceEventType, __classPrivateFieldGet(this, _DevicePair_instances, "m", _DevicePair_redispatchDeviceEvent).bind(this));
    });
}, _DevicePair_removeDeviceEventListeners = function _DevicePair_removeDeviceEventListeners(device) {
    removeEventListeners(device, __classPrivateFieldGet(this, _DevicePair_boundDeviceEventListeners, "f"));
    DeviceEventTypes.forEach((deviceEventType) => {
        device.removeEventListener(
        deviceEventType, __classPrivateFieldGet(this, _DevicePair_instances, "m", _DevicePair_redispatchDeviceEvent).bind(this));
    });
}, _DevicePair_removeDevice = function _DevicePair_removeDevice(device) {
    const foundDevice = Sides.some((side) => {
        if (this[side] != device) {
            return false;
        }
        _console$8.log(`removing ${side} ${this.type} device`, device);
        removeEventListeners(device, __classPrivateFieldGet(this, _DevicePair_boundDeviceEventListeners, "f"));
        switch (side) {
            case "left":
                __classPrivateFieldSet(this, _DevicePair_left, undefined, "f");
                break;
            case "right":
                __classPrivateFieldSet(this, _DevicePair_right, undefined, "f");
                break;
        }
        return true;
    });
    if (foundDevice) {
        __classPrivateFieldGet(this, _DevicePair_instances, "a", _DevicePair_dispatchEvent_get).call(this, "isConnected", { isConnected: this.isConnected });
    }
    return foundDevice;
}, _DevicePair_redispatchDeviceEvent = function _DevicePair_redispatchDeviceEvent(deviceEvent) {
    const { type, target: device, message } = deviceEvent;
    __classPrivateFieldGet(this, _DevicePair_instances, "a", _DevicePair_dispatchEvent_get).call(this, getDevicePairDeviceEventType(type), {
        ...message,
        device,
        side: device.side,
    });
}, _DevicePair_onDeviceIsConnected = function _DevicePair_onDeviceIsConnected(deviceEvent) {
    __classPrivateFieldGet(this, _DevicePair_instances, "a", _DevicePair_dispatchEvent_get).call(this, "isConnected", { isConnected: this.isConnected });
}, _DevicePair_onDeviceType = function _DevicePair_onDeviceType(deviceEvent) {
    const { target: device } = deviceEvent;
    if (this[device.side] == device) {
        return;
    }
    const foundDevice = __classPrivateFieldGet(this, _DevicePair_instances, "m", _DevicePair_removeDevice).call(this, device);
    if (!foundDevice) {
        return;
    }
    this.assignDevice(device);
}, _DevicePair_onDeviceSensorData = function _DevicePair_onDeviceSensorData(deviceEvent) {
    if (this.isConnected) {
        __classPrivateFieldGet(this, _DevicePair_sensorDataManager, "f").onDeviceSensorData(deviceEvent);
    }
};
_DevicePair_insoles = { value: new _a$2("insoles") };
_DevicePair_gloves = { value: new _a$2("gloves") };
(() => {
    DeviceManager$1.AddEventListener("deviceConnected", (event) => {
        const { device } = event.message;
        if (device.isInsole) {
            __classPrivateFieldGet(_a$2, _a$2, "f", _DevicePair_insoles).assignDevice(device);
        }
        if (device.isGlove) {
            __classPrivateFieldGet(_a$2, _a$2, "f", _DevicePair_gloves).assignDevice(device);
        }
    });
})();

var _BaseScanner_instances, _a$1, _BaseScanner_assertIsSupported, _BaseScanner_assertIsSubclass, _BaseScanner_boundEventListeners, _BaseScanner_eventDispatcher, _BaseScanner_assertIsAvailable, _BaseScanner_assertIsScanning, _BaseScanner_assertIsNotScanning, _BaseScanner_onIsScanning, _BaseScanner_discoveredDevices, _BaseScanner_onDiscoveredDevice, _BaseScanner_discoveredDeviceTimestamps, _BaseScanner_DiscoveredDeviceExpirationTimeout, _BaseScanner_discoveredDeviceExpirationTimeout_get, _BaseScanner_checkDiscoveredDevicesExpirationTimer, _BaseScanner_checkDiscoveredDevicesExpiration;
const _console$7 = createConsole("BaseScanner");
const ScannerEventTypes = [
    "isScanningAvailable",
    "isScanning",
    "discoveredDevice",
    "expiredDiscoveredDevice",
];
class BaseScanner {
    get baseConstructor() {
        return this.constructor;
    }
    static get isSupported() {
        return false;
    }
    get isSupported() {
        return this.baseConstructor.isSupported;
    }
    constructor() {
        _BaseScanner_instances.add(this);
        _BaseScanner_boundEventListeners.set(this, {
            discoveredDevice: __classPrivateFieldGet(this, _BaseScanner_instances, "m", _BaseScanner_onDiscoveredDevice).bind(this),
            isScanning: __classPrivateFieldGet(this, _BaseScanner_instances, "m", _BaseScanner_onIsScanning).bind(this),
        });
        _BaseScanner_eventDispatcher.set(this, new EventDispatcher(this, ScannerEventTypes));
        _BaseScanner_discoveredDevices.set(this, {});
        _BaseScanner_discoveredDeviceTimestamps.set(this, {});
        _BaseScanner_checkDiscoveredDevicesExpirationTimer.set(this, new Timer(__classPrivateFieldGet(this, _BaseScanner_instances, "m", _BaseScanner_checkDiscoveredDevicesExpiration).bind(this), 1000));
        __classPrivateFieldGet(this, _BaseScanner_instances, "m", _BaseScanner_assertIsSubclass).call(this);
        __classPrivateFieldGet(this, _BaseScanner_instances, "m", _BaseScanner_assertIsSupported).call(this);
        addEventListeners(this, __classPrivateFieldGet(this, _BaseScanner_boundEventListeners, "f"));
    }
    get addEventListener() {
        return __classPrivateFieldGet(this, _BaseScanner_eventDispatcher, "f").addEventListener;
    }
    get dispatchEvent() {
        return __classPrivateFieldGet(this, _BaseScanner_eventDispatcher, "f").dispatchEvent;
    }
    get removeEventListener() {
        return __classPrivateFieldGet(this, _BaseScanner_eventDispatcher, "f").removeEventListener;
    }
    get waitForEvent() {
        return __classPrivateFieldGet(this, _BaseScanner_eventDispatcher, "f").waitForEvent;
    }
    get isScanningAvailable() {
        return false;
    }
    get isScanning() {
        return false;
    }
    startScan() {
        __classPrivateFieldGet(this, _BaseScanner_instances, "m", _BaseScanner_assertIsAvailable).call(this);
        __classPrivateFieldGet(this, _BaseScanner_instances, "m", _BaseScanner_assertIsNotScanning).call(this);
    }
    stopScan() {
        __classPrivateFieldGet(this, _BaseScanner_instances, "m", _BaseScanner_assertIsScanning).call(this);
    }
    get discoveredDevices() {
        return __classPrivateFieldGet(this, _BaseScanner_discoveredDevices, "f");
    }
    get discoveredDevicesArray() {
        return Object.values(__classPrivateFieldGet(this, _BaseScanner_discoveredDevices, "f")).sort((a, b) => {
            return (__classPrivateFieldGet(this, _BaseScanner_discoveredDeviceTimestamps, "f")[a.bluetoothId] -
                __classPrivateFieldGet(this, _BaseScanner_discoveredDeviceTimestamps, "f")[b.bluetoothId]);
        });
    }
    static get DiscoveredDeviceExpirationTimeout() {
        return __classPrivateFieldGet(this, _a$1, "f", _BaseScanner_DiscoveredDeviceExpirationTimeout);
    }
    async connectToDevice(deviceId, connectionType) {
        __classPrivateFieldGet(this, _BaseScanner_instances, "m", _BaseScanner_assertIsAvailable).call(this);
    }
    get canReset() {
        return false;
    }
    reset() {
        _console$7.log("resetting...");
    }
}
_a$1 = BaseScanner, _BaseScanner_boundEventListeners = new WeakMap(), _BaseScanner_eventDispatcher = new WeakMap(), _BaseScanner_discoveredDevices = new WeakMap(), _BaseScanner_discoveredDeviceTimestamps = new WeakMap(), _BaseScanner_checkDiscoveredDevicesExpirationTimer = new WeakMap(), _BaseScanner_instances = new WeakSet(), _BaseScanner_assertIsSupported = function _BaseScanner_assertIsSupported() {
    _console$7.assertWithError(this.isSupported, `${this.constructor.name} is not supported`);
}, _BaseScanner_assertIsSubclass = function _BaseScanner_assertIsSubclass() {
    _console$7.assertWithError(this.constructor != _a$1, `${this.constructor.name} must be subclassed`);
}, _BaseScanner_assertIsAvailable = function _BaseScanner_assertIsAvailable() {
    _console$7.assertWithError(this.isScanningAvailable, "not available");
}, _BaseScanner_assertIsScanning = function _BaseScanner_assertIsScanning() {
    _console$7.assertWithError(this.isScanning, "not scanning");
}, _BaseScanner_assertIsNotScanning = function _BaseScanner_assertIsNotScanning() {
    _console$7.assertWithError(!this.isScanning, "already scanning");
}, _BaseScanner_onIsScanning = function _BaseScanner_onIsScanning(event) {
    if (this.isScanning) {
        __classPrivateFieldSet(this, _BaseScanner_discoveredDevices, {}, "f");
        __classPrivateFieldSet(this, _BaseScanner_discoveredDeviceTimestamps, {}, "f");
    }
    else {
        __classPrivateFieldGet(this, _BaseScanner_checkDiscoveredDevicesExpirationTimer, "f").stop();
    }
}, _BaseScanner_onDiscoveredDevice = function _BaseScanner_onDiscoveredDevice(event) {
    const { discoveredDevice } = event.message;
    __classPrivateFieldGet(this, _BaseScanner_discoveredDevices, "f")[discoveredDevice.bluetoothId] = discoveredDevice;
    __classPrivateFieldGet(this, _BaseScanner_discoveredDeviceTimestamps, "f")[discoveredDevice.bluetoothId] = Date.now();
    __classPrivateFieldGet(this, _BaseScanner_checkDiscoveredDevicesExpirationTimer, "f").start();
}, _BaseScanner_discoveredDeviceExpirationTimeout_get = function _BaseScanner_discoveredDeviceExpirationTimeout_get() {
    return _a$1.DiscoveredDeviceExpirationTimeout;
}, _BaseScanner_checkDiscoveredDevicesExpiration = function _BaseScanner_checkDiscoveredDevicesExpiration() {
    const entries = Object.entries(__classPrivateFieldGet(this, _BaseScanner_discoveredDevices, "f"));
    if (entries.length == 0) {
        __classPrivateFieldGet(this, _BaseScanner_checkDiscoveredDevicesExpirationTimer, "f").stop();
        return;
    }
    const now = Date.now();
    entries.forEach(([id, discoveredDevice]) => {
        const timestamp = __classPrivateFieldGet(this, _BaseScanner_discoveredDeviceTimestamps, "f")[id];
        if (now - timestamp > __classPrivateFieldGet(this, _BaseScanner_instances, "a", _BaseScanner_discoveredDeviceExpirationTimeout_get)) {
            _console$7.log("discovered device timeout");
            delete __classPrivateFieldGet(this, _BaseScanner_discoveredDevices, "f")[id];
            delete __classPrivateFieldGet(this, _BaseScanner_discoveredDeviceTimestamps, "f")[id];
            this.dispatchEvent("expiredDiscoveredDevice", { discoveredDevice });
        }
    });
};
_BaseScanner_DiscoveredDeviceExpirationTimeout = { value: 5000 };

var _NobleConnectionManager_instances, _NobleConnectionManager_noblePeripheral, _NobleConnectionManager_unboundNoblePeripheralListeners, _NobleConnectionManager_onNoblePeripheralConnect, _NobleConnectionManager_onNoblePeripheralDisconnect, _NobleConnectionManager_onNoblePeripheralState, _NobleConnectionManager_removeEventListeners, _NobleConnectionManager_onNoblePeripheralRssiUpdate, _NobleConnectionManager_onNoblePeripheralServicesDiscover, _NobleConnectionManager_services, _NobleConnectionManager_unboundNobleServiceListeners, _NobleConnectionManager_onNobleServiceCharacteristicsDiscover, _NobleConnectionManager_unboundNobleCharacteristicListeners, _NobleConnectionManager_characteristics, _NobleConnectionManager_hasAllCharacteristics_get, _NobleConnectionManager_onNobleCharacteristicData, _NobleConnectionManager_onNobleCharacteristicWrite, _NobleConnectionManager_onNobleCharacteristicNotify;
const _console$6 = createConsole("NobleConnectionManager", { log: false });
class NobleConnectionManager extends BluetoothConnectionManager {
    constructor() {
        super(...arguments);
        _NobleConnectionManager_instances.add(this);
        _NobleConnectionManager_noblePeripheral.set(this, void 0);
        _NobleConnectionManager_unboundNoblePeripheralListeners.set(this, {
            connect: __classPrivateFieldGet(this, _NobleConnectionManager_instances, "m", _NobleConnectionManager_onNoblePeripheralConnect),
            disconnect: __classPrivateFieldGet(this, _NobleConnectionManager_instances, "m", _NobleConnectionManager_onNoblePeripheralDisconnect),
            rssiUpdate: __classPrivateFieldGet(this, _NobleConnectionManager_instances, "m", _NobleConnectionManager_onNoblePeripheralRssiUpdate),
            servicesDiscover: __classPrivateFieldGet(this, _NobleConnectionManager_instances, "m", _NobleConnectionManager_onNoblePeripheralServicesDiscover),
        });
        _NobleConnectionManager_services.set(this, new Map());
        _NobleConnectionManager_unboundNobleServiceListeners.set(this, {
            characteristicsDiscover: __classPrivateFieldGet(this, _NobleConnectionManager_instances, "m", _NobleConnectionManager_onNobleServiceCharacteristicsDiscover),
        });
        _NobleConnectionManager_unboundNobleCharacteristicListeners.set(this, {
            data: __classPrivateFieldGet(this, _NobleConnectionManager_instances, "m", _NobleConnectionManager_onNobleCharacteristicData),
            write: __classPrivateFieldGet(this, _NobleConnectionManager_instances, "m", _NobleConnectionManager_onNobleCharacteristicWrite),
            notify: __classPrivateFieldGet(this, _NobleConnectionManager_instances, "m", _NobleConnectionManager_onNobleCharacteristicNotify),
        });
        _NobleConnectionManager_characteristics.set(this, new Map());
    }
    get bluetoothId() {
        return __classPrivateFieldGet(this, _NobleConnectionManager_noblePeripheral, "f").id;
    }
    get canUpdateFirmware() {
        return __classPrivateFieldGet(this, _NobleConnectionManager_characteristics, "f").has("smp");
    }
    static get isSupported() {
        return isInNode;
    }
    static get type() {
        return "noble";
    }
    get isConnected() {
        return __classPrivateFieldGet(this, _NobleConnectionManager_noblePeripheral, "f")?.state == "connected";
    }
    async connect() {
        await super.connect();
        await __classPrivateFieldGet(this, _NobleConnectionManager_noblePeripheral, "f").connectAsync();
    }
    async disconnect() {
        await super.disconnect();
        await __classPrivateFieldGet(this, _NobleConnectionManager_noblePeripheral, "f").disconnectAsync();
    }
    async writeCharacteristic(characteristicName, data) {
        const characteristic = __classPrivateFieldGet(this, _NobleConnectionManager_characteristics, "f").get(characteristicName);
        _console$6.assertWithError(characteristic, `no characteristic found with name "${characteristicName}"`);
        const properties = getCharacteristicProperties(characteristicName);
        const buffer = Buffer.from(data);
        const writeWithoutResponse = properties.writeWithoutResponse;
        _console$6.log(`writing to ${characteristicName} ${writeWithoutResponse ? "without" : "with"} response`, buffer);
        await characteristic.writeAsync(buffer, writeWithoutResponse);
        if (characteristic.properties.includes("read")) {
            await characteristic.readAsync();
        }
    }
    get canReconnect() {
        return __classPrivateFieldGet(this, _NobleConnectionManager_noblePeripheral, "f").connectable;
    }
    async reconnect() {
        await super.reconnect();
        await __classPrivateFieldGet(this, _NobleConnectionManager_noblePeripheral, "f").connectAsync();
    }
    get noblePeripheral() {
        return __classPrivateFieldGet(this, _NobleConnectionManager_noblePeripheral, "f");
    }
    set noblePeripheral(newNoblePeripheral) {
        _console$6.assertTypeWithError(newNoblePeripheral, "object");
        if (this.noblePeripheral == newNoblePeripheral) {
            _console$6.log("attempted to assign duplicate noblePeripheral");
            return;
        }
        _console$6.log("newNoblePeripheral", newNoblePeripheral.id);
        if (__classPrivateFieldGet(this, _NobleConnectionManager_noblePeripheral, "f")) {
            removeEventListeners(__classPrivateFieldGet(this, _NobleConnectionManager_noblePeripheral, "f"), __classPrivateFieldGet(this, _NobleConnectionManager_unboundNoblePeripheralListeners, "f"));
            delete __classPrivateFieldGet(this, _NobleConnectionManager_noblePeripheral, "f").connectionManager;
        }
        if (newNoblePeripheral) {
            newNoblePeripheral.connectionManager = this;
            addEventListeners(newNoblePeripheral, __classPrivateFieldGet(this, _NobleConnectionManager_unboundNoblePeripheralListeners, "f"));
        }
        __classPrivateFieldSet(this, _NobleConnectionManager_noblePeripheral, newNoblePeripheral, "f");
    }
    async onNoblePeripheralConnect(noblePeripheral) {
        _console$6.log("onNoblePeripheralConnect", noblePeripheral.id, noblePeripheral.state);
        if (noblePeripheral.state == "connected") {
            await __classPrivateFieldGet(this, _NobleConnectionManager_noblePeripheral, "f").discoverServicesAsync(allServiceUUIDs);
        }
        await __classPrivateFieldGet(this, _NobleConnectionManager_instances, "m", _NobleConnectionManager_onNoblePeripheralState).call(this);
    }
    async onNoblePeripheralDisconnect(noblePeripheral) {
        _console$6.log("onNoblePeripheralDisconnect", noblePeripheral.id);
        await __classPrivateFieldGet(this, _NobleConnectionManager_instances, "m", _NobleConnectionManager_onNoblePeripheralState).call(this);
    }
    async onNoblePeripheralRssiUpdate(noblePeripheral, rssi) {
        _console$6.log("onNoblePeripheralRssiUpdate", noblePeripheral.id, rssi);
    }
    async onNoblePeripheralServicesDiscover(noblePeripheral, services) {
        _console$6.log("onNoblePeripheralServicesDiscover", noblePeripheral.id, services.map((service) => service.uuid));
        for (const index in services) {
            const service = services[index];
            _console$6.log("service", service.uuid);
            const serviceName = getServiceNameFromUUID(service.uuid);
            _console$6.assertWithError(serviceName, `no name found for service uuid "${service.uuid}"`);
            _console$6.log({ serviceName });
            __classPrivateFieldGet(this, _NobleConnectionManager_services, "f").set(serviceName, service);
            service.name = serviceName;
            service.connectionManager = this;
            addEventListeners(service, __classPrivateFieldGet(this, _NobleConnectionManager_unboundNobleServiceListeners, "f"));
            await service.discoverCharacteristicsAsync();
        }
    }
    async onNobleServiceCharacteristicsDiscover(service, characteristics) {
        _console$6.log("onNobleServiceCharacteristicsDiscover", service.uuid, characteristics.map((characteristic) => characteristic.uuid));
        for (const index in characteristics) {
            const characteristic = characteristics[index];
            _console$6.log("characteristic", characteristic.uuid);
            const characteristicName = getCharacteristicNameFromUUID(characteristic.uuid);
            _console$6.assertWithError(Boolean(characteristicName), `no name found for characteristic uuid "${characteristic.uuid}"`);
            _console$6.log({ characteristicName });
            __classPrivateFieldGet(this, _NobleConnectionManager_characteristics, "f").set(characteristicName, characteristic);
            characteristic.name = characteristicName;
            characteristic.connectionManager = this;
            _console$6.log(`adding listeners to characteristic "${characteristic.name}" (currently has ${characteristic.listeners.length} listeners)`);
            addEventListeners(characteristic, __classPrivateFieldGet(this, _NobleConnectionManager_unboundNobleCharacteristicListeners, "f"));
            if (characteristic.properties.includes("read")) {
                await characteristic.readAsync();
            }
            if (characteristic.properties.includes("notify")) {
                await characteristic.subscribeAsync();
            }
        }
        if (__classPrivateFieldGet(this, _NobleConnectionManager_instances, "a", _NobleConnectionManager_hasAllCharacteristics_get)) {
            this.status = "connected";
        }
    }
    onNobleCharacteristicData(characteristic, data, isNotification) {
        _console$6.log("onNobleCharacteristicData", characteristic.uuid, data, isNotification);
        const dataView = new DataView(dataToArrayBuffer(data));
        const characteristicName = characteristic.name;
        _console$6.assertWithError(Boolean(characteristicName), `no name found for characteristic with uuid "${characteristic.uuid}"`);
        this.onCharacteristicValueChanged(characteristicName, dataView);
    }
    onNobleCharacteristicWrite(characteristic) {
        _console$6.log("onNobleCharacteristicWrite", characteristic.uuid);
    }
    onNobleCharacteristicNotify(characteristic, isSubscribed) {
        _console$6.log("onNobleCharacteristicNotify", characteristic.uuid, isSubscribed);
    }
}
_NobleConnectionManager_noblePeripheral = new WeakMap(), _NobleConnectionManager_unboundNoblePeripheralListeners = new WeakMap(), _NobleConnectionManager_services = new WeakMap(), _NobleConnectionManager_unboundNobleServiceListeners = new WeakMap(), _NobleConnectionManager_unboundNobleCharacteristicListeners = new WeakMap(), _NobleConnectionManager_characteristics = new WeakMap(), _NobleConnectionManager_instances = new WeakSet(), _NobleConnectionManager_onNoblePeripheralConnect = async function _NobleConnectionManager_onNoblePeripheralConnect() {
    await this.connectionManager.onNoblePeripheralConnect(this);
}, _NobleConnectionManager_onNoblePeripheralDisconnect = async function _NobleConnectionManager_onNoblePeripheralDisconnect() {
    await this.connectionManager.onNoblePeripheralConnect(this);
}, _NobleConnectionManager_onNoblePeripheralState = async function _NobleConnectionManager_onNoblePeripheralState() {
    _console$6.log(`noblePeripheral ${this.bluetoothId} state ${__classPrivateFieldGet(this, _NobleConnectionManager_noblePeripheral, "f").state}`);
    switch (__classPrivateFieldGet(this, _NobleConnectionManager_noblePeripheral, "f").state) {
        case "connected":
            break;
        case "connecting":
            break;
        case "disconnected":
            __classPrivateFieldGet(this, _NobleConnectionManager_instances, "m", _NobleConnectionManager_removeEventListeners).call(this);
            this.status = "notConnected";
            break;
        case "disconnecting":
            this.status = "disconnecting";
            break;
        case "error":
            _console$6.error("noblePeripheral error");
            break;
        default:
            _console$6.log(`uncaught noblePeripheral state ${__classPrivateFieldGet(this, _NobleConnectionManager_noblePeripheral, "f").state}`);
            break;
    }
}, _NobleConnectionManager_removeEventListeners = function _NobleConnectionManager_removeEventListeners() {
    _console$6.log("removing noblePeripheral eventListeners");
    __classPrivateFieldGet(this, _NobleConnectionManager_services, "f").forEach((service) => {
        removeEventListeners(service, __classPrivateFieldGet(this, _NobleConnectionManager_unboundNobleServiceListeners, "f"));
    });
    __classPrivateFieldGet(this, _NobleConnectionManager_services, "f").clear();
    __classPrivateFieldGet(this, _NobleConnectionManager_characteristics, "f").forEach((characteristic) => {
        _console$6.log(`removing listeners from characteristic "${characteristic.name}" has ${characteristic.listeners.length} listeners`);
        removeEventListeners(characteristic, __classPrivateFieldGet(this, _NobleConnectionManager_unboundNobleCharacteristicListeners, "f"));
    });
    __classPrivateFieldGet(this, _NobleConnectionManager_characteristics, "f").clear();
}, _NobleConnectionManager_onNoblePeripheralRssiUpdate = async function _NobleConnectionManager_onNoblePeripheralRssiUpdate(rssi) {
    await this.connectionManager.onNoblePeripheralRssiUpdate(this, rssi);
}, _NobleConnectionManager_onNoblePeripheralServicesDiscover = async function _NobleConnectionManager_onNoblePeripheralServicesDiscover(services) {
    await this.connectionManager.onNoblePeripheralServicesDiscover(this, services);
}, _NobleConnectionManager_onNobleServiceCharacteristicsDiscover = async function _NobleConnectionManager_onNobleServiceCharacteristicsDiscover(characteristics) {
    await this.connectionManager.onNobleServiceCharacteristicsDiscover(this, characteristics);
}, _NobleConnectionManager_hasAllCharacteristics_get = function _NobleConnectionManager_hasAllCharacteristics_get() {
    return allCharacteristicNames.every((characteristicName) => {
        if (characteristicName == "smp") {
            return true;
        }
        return __classPrivateFieldGet(this, _NobleConnectionManager_characteristics, "f").has(characteristicName);
    });
}, _NobleConnectionManager_onNobleCharacteristicData = function _NobleConnectionManager_onNobleCharacteristicData(data, isNotification) {
    this.connectionManager.onNobleCharacteristicData(this, data, isNotification);
}, _NobleConnectionManager_onNobleCharacteristicWrite = function _NobleConnectionManager_onNobleCharacteristicWrite() {
    this.connectionManager.onNobleCharacteristicWrite(this);
}, _NobleConnectionManager_onNobleCharacteristicNotify = function _NobleConnectionManager_onNobleCharacteristicNotify(isSubscribed) {
    this.connectionManager.onNobleCharacteristicNotify(this, isSubscribed);
};

var _NobleScanner_instances, _NobleScanner__isScanning, _NobleScanner_isScanning_get, _NobleScanner_isScanning_set, _NobleScanner__nobleState, _NobleScanner_nobleState_get, _NobleScanner_nobleState_set, _NobleScanner_boundNobleListeners, _NobleScanner_onNobleScanStart, _NobleScanner_onNobleScanStop, _NobleScanner_onNobleStateChange, _NobleScanner_onNobleDiscover, _NobleScanner_boundBaseScannerListeners, _NobleScanner_onExpiredDiscoveredDevice, _NobleScanner_noblePeripherals, _NobleScanner_assertValidNoblePeripheralId, _NobleScanner_createDevice;
const _console$5 = createConsole("NobleScanner", { log: false });
let isSupported = false;
isSupported = true;
class NobleScanner extends BaseScanner {
    static get isSupported() {
        return isSupported;
    }
    get isScanning() {
        return __classPrivateFieldGet(this, _NobleScanner_instances, "a", _NobleScanner_isScanning_get);
    }
    constructor() {
        super();
        _NobleScanner_instances.add(this);
        _NobleScanner__isScanning.set(this, false);
        _NobleScanner__nobleState.set(this, "unknown");
        _NobleScanner_boundNobleListeners.set(this, {
            scanStart: __classPrivateFieldGet(this, _NobleScanner_instances, "m", _NobleScanner_onNobleScanStart).bind(this),
            scanStop: __classPrivateFieldGet(this, _NobleScanner_instances, "m", _NobleScanner_onNobleScanStop).bind(this),
            stateChange: __classPrivateFieldGet(this, _NobleScanner_instances, "m", _NobleScanner_onNobleStateChange).bind(this),
            discover: __classPrivateFieldGet(this, _NobleScanner_instances, "m", _NobleScanner_onNobleDiscover).bind(this),
        });
        _NobleScanner_boundBaseScannerListeners.set(this, {
            expiredDiscoveredDevice: __classPrivateFieldGet(this, _NobleScanner_instances, "m", _NobleScanner_onExpiredDiscoveredDevice).bind(this),
        });
        _NobleScanner_noblePeripherals.set(this, {});
        addEventListeners(noble, __classPrivateFieldGet(this, _NobleScanner_boundNobleListeners, "f"));
        addEventListeners(this, __classPrivateFieldGet(this, _NobleScanner_boundBaseScannerListeners, "f"));
    }
    get isScanningAvailable() {
        return __classPrivateFieldGet(this, _NobleScanner_instances, "a", _NobleScanner_nobleState_get) == "poweredOn";
    }
    startScan() {
        super.startScan();
        noble.startScanningAsync(serviceUUIDs, true);
    }
    stopScan() {
        super.stopScan();
        noble.stopScanningAsync();
    }
    get canReset() {
        return true;
    }
    reset() {
        super.reset();
        noble.reset();
    }
    async connectToDevice(deviceId, connectionType) {
        super.connectToDevice(deviceId, connectionType);
        __classPrivateFieldGet(this, _NobleScanner_instances, "m", _NobleScanner_assertValidNoblePeripheralId).call(this, deviceId);
        const noblePeripheral = __classPrivateFieldGet(this, _NobleScanner_noblePeripherals, "f")[deviceId];
        _console$5.log("connecting to discoveredDevice...", deviceId);
        let device = DeviceManager$1.AvailableDevices.filter((device) => device.connectionType == "noble").find((device) => device.bluetoothId == deviceId);
        if (!device) {
            device = __classPrivateFieldGet(this, _NobleScanner_instances, "m", _NobleScanner_createDevice).call(this, noblePeripheral);
            const { ipAddress, isWifiSecure } = this.discoveredDevices[device.bluetoothId];
            if (connectionType && connectionType != "noble" && ipAddress) {
                await device.connect({ type: connectionType, ipAddress, isWifiSecure });
            }
            else {
                await device.connect();
            }
        }
        else {
            await device.reconnect();
        }
    }
}
_NobleScanner__isScanning = new WeakMap(), _NobleScanner__nobleState = new WeakMap(), _NobleScanner_boundNobleListeners = new WeakMap(), _NobleScanner_boundBaseScannerListeners = new WeakMap(), _NobleScanner_noblePeripherals = new WeakMap(), _NobleScanner_instances = new WeakSet(), _NobleScanner_isScanning_get = function _NobleScanner_isScanning_get() {
    return __classPrivateFieldGet(this, _NobleScanner__isScanning, "f");
}, _NobleScanner_isScanning_set = function _NobleScanner_isScanning_set(newIsScanning) {
    _console$5.assertTypeWithError(newIsScanning, "boolean");
    if (this.isScanning == newIsScanning) {
        _console$5.log("duplicate isScanning assignment");
        return;
    }
    __classPrivateFieldSet(this, _NobleScanner__isScanning, newIsScanning, "f");
    this.dispatchEvent("isScanning", { isScanning: this.isScanning });
}, _NobleScanner_nobleState_get = function _NobleScanner_nobleState_get() {
    return __classPrivateFieldGet(this, _NobleScanner__nobleState, "f");
}, _NobleScanner_nobleState_set = function _NobleScanner_nobleState_set(newNobleState) {
    _console$5.assertTypeWithError(newNobleState, "string");
    if (__classPrivateFieldGet(this, _NobleScanner_instances, "a", _NobleScanner_nobleState_get) == newNobleState) {
        _console$5.log("duplicate nobleState assignment");
        return;
    }
    __classPrivateFieldSet(this, _NobleScanner__nobleState, newNobleState, "f");
    _console$5.log({ newNobleState });
    this.dispatchEvent("isScanningAvailable", {
        isScanningAvailable: this.isScanningAvailable,
    });
}, _NobleScanner_onNobleScanStart = function _NobleScanner_onNobleScanStart() {
    _console$5.log("OnNobleScanStart");
    __classPrivateFieldSet(this, _NobleScanner_instances, true, "a", _NobleScanner_isScanning_set);
}, _NobleScanner_onNobleScanStop = function _NobleScanner_onNobleScanStop() {
    _console$5.log("OnNobleScanStop");
    __classPrivateFieldSet(this, _NobleScanner_instances, false, "a", _NobleScanner_isScanning_set);
}, _NobleScanner_onNobleStateChange = function _NobleScanner_onNobleStateChange(state) {
    _console$5.log("onNobleStateChange", state);
    __classPrivateFieldSet(this, _NobleScanner_instances, state, "a", _NobleScanner_nobleState_set);
}, _NobleScanner_onNobleDiscover = function _NobleScanner_onNobleDiscover(noblePeripheral) {
    _console$5.log("onNobleDiscover", noblePeripheral.id);
    if (!__classPrivateFieldGet(this, _NobleScanner_noblePeripherals, "f")[noblePeripheral.id]) {
        noblePeripheral.scanner = this;
        __classPrivateFieldGet(this, _NobleScanner_noblePeripherals, "f")[noblePeripheral.id] = noblePeripheral;
    }
    _console$5.log("advertisement", noblePeripheral.advertisement);
    let deviceType;
    let ipAddress;
    let isWifiSecure;
    const { manufacturerData, serviceData } = noblePeripheral.advertisement;
    if (manufacturerData) {
        _console$5.log("manufacturerData", manufacturerData);
        if (manufacturerData.byteLength >= 3) {
            const deviceTypeEnum = manufacturerData.readUint8(2);
            deviceType = DeviceTypes[deviceTypeEnum];
        }
        if (manufacturerData.byteLength >= 3 + 4) {
            ipAddress = new Uint8Array(manufacturerData.buffer.slice(3, 3 + 4)).join(".");
        }
        if (manufacturerData.byteLength >= 3 + 4 + 1) {
            isWifiSecure = manufacturerData.readUint8(3 + 4) != 0;
            _console$5.log({ isWifiSecure });
        }
    }
    if (serviceData) {
        _console$5.log("serviceData", serviceData);
        const deviceTypeServiceData = serviceData.find((serviceDatum) => {
            return serviceDatum.uuid == serviceDataUUID;
        });
        _console$5.log("deviceTypeServiceData", deviceTypeServiceData);
        if (deviceTypeServiceData) {
            const deviceTypeEnum = deviceTypeServiceData.data.readUint8(0);
            deviceType = DeviceTypes[deviceTypeEnum];
        }
    }
    if (deviceType == undefined) {
        _console$5.log("skipping device - no deviceType");
        return;
    }
    const discoveredDevice = {
        name: noblePeripheral.advertisement.localName,
        bluetoothId: noblePeripheral.id,
        deviceType,
        rssi: noblePeripheral.rssi,
        ipAddress,
        isWifiSecure,
    };
    this.dispatchEvent("discoveredDevice", { discoveredDevice });
}, _NobleScanner_onExpiredDiscoveredDevice = function _NobleScanner_onExpiredDiscoveredDevice(event) {
    const { discoveredDevice } = event.message;
    const noblePeripheral = __classPrivateFieldGet(this, _NobleScanner_noblePeripherals, "f")[discoveredDevice.bluetoothId];
    if (noblePeripheral) {
        delete __classPrivateFieldGet(this, _NobleScanner_noblePeripherals, "f")[discoveredDevice.bluetoothId];
    }
}, _NobleScanner_assertValidNoblePeripheralId = function _NobleScanner_assertValidNoblePeripheralId(noblePeripheralId) {
    _console$5.assertTypeWithError(noblePeripheralId, "string");
    _console$5.assertWithError(__classPrivateFieldGet(this, _NobleScanner_noblePeripherals, "f")[noblePeripheralId], `no noblePeripheral found with id "${noblePeripheralId}"`);
}, _NobleScanner_createDevice = function _NobleScanner_createDevice(noblePeripheral) {
    const device = new Device();
    const nobleConnectionManager = new NobleConnectionManager();
    nobleConnectionManager.noblePeripheral = noblePeripheral;
    device.connectionManager = nobleConnectionManager;
    return device;
};

const _console$4 = createConsole("Scanner", { log: false });
let scanner;
if (NobleScanner.isSupported) {
    _console$4.log("using NobleScanner");
    scanner = new NobleScanner();
}
else {
    _console$4.log("Scanner not available");
}
var scanner$1 = scanner;

var _BaseServer_instances, _a, _BaseServer_ClearSensorConfigurationsWhenNoClients, _BaseServer_clearSensorConfigurationsWhenNoClients, _BaseServer_boundServerListeners, _BaseServer_onClientConnected, _BaseServer_onClientDisconnected, _BaseServer_boundScannerListeners, _BaseServer_onScannerIsAvailable, _BaseServer_isScanningAvailableMessage_get, _BaseServer_onScannerIsScanning, _BaseServer_isScanningMessage_get, _BaseServer_onScannerDiscoveredDevice, _BaseServer_createDiscoveredDeviceMessage, _BaseServer_onExpiredDiscoveredDevice, _BaseServer_createExpiredDiscoveredDeviceMessage, _BaseServer_discoveredDevicesMessage_get, _BaseServer_connectedDevicesMessage_get, _BaseServer_boundDeviceListeners, _BaseServer_createDeviceMessage, _BaseServer_onDeviceConnectionMessage, _BaseServer_boundDeviceManagerListeners, _BaseServer_onDeviceConnected, _BaseServer_onDeviceDisconnected, _BaseServer_onDeviceIsConnected, _BaseServer_createDeviceIsConnectedMessage, _BaseServer_createDeviceServerMessage, _BaseServer_onClientMessage, _BaseServer_parseClientDeviceMessageCallback;
const _console$3 = createConsole("BaseServer", { log: false });
const ServerEventTypes = [
    "clientConnected",
    "clientDisconnected",
];
class BaseServer {
    get addEventListener() {
        return this.eventDispatcher.addEventListener;
    }
    get dispatchEvent() {
        return this.eventDispatcher.dispatchEvent;
    }
    get removeEventListener() {
        return this.eventDispatcher.removeEventListener;
    }
    get waitForEvent() {
        return this.eventDispatcher.waitForEvent;
    }
    constructor() {
        _BaseServer_instances.add(this);
        this.eventDispatcher = new EventDispatcher(this, ServerEventTypes);
        _BaseServer_clearSensorConfigurationsWhenNoClients.set(this, __classPrivateFieldGet(_a, _a, "f", _BaseServer_ClearSensorConfigurationsWhenNoClients));
        _BaseServer_boundServerListeners.set(this, {
            clientConnected: __classPrivateFieldGet(this, _BaseServer_instances, "m", _BaseServer_onClientConnected).bind(this),
            clientDisconnected: __classPrivateFieldGet(this, _BaseServer_instances, "m", _BaseServer_onClientDisconnected).bind(this),
        });
        _BaseServer_boundScannerListeners.set(this, {
            isScanningAvailable: __classPrivateFieldGet(this, _BaseServer_instances, "m", _BaseServer_onScannerIsAvailable).bind(this),
            isScanning: __classPrivateFieldGet(this, _BaseServer_instances, "m", _BaseServer_onScannerIsScanning).bind(this),
            discoveredDevice: __classPrivateFieldGet(this, _BaseServer_instances, "m", _BaseServer_onScannerDiscoveredDevice).bind(this),
            expiredDiscoveredDevice: __classPrivateFieldGet(this, _BaseServer_instances, "m", _BaseServer_onExpiredDiscoveredDevice).bind(this),
        });
        _BaseServer_boundDeviceListeners.set(this, {
            connectionMessage: __classPrivateFieldGet(this, _BaseServer_instances, "m", _BaseServer_onDeviceConnectionMessage).bind(this),
        });
        _BaseServer_boundDeviceManagerListeners.set(this, {
            deviceConnected: __classPrivateFieldGet(this, _BaseServer_instances, "m", _BaseServer_onDeviceConnected).bind(this),
            deviceDisconnected: __classPrivateFieldGet(this, _BaseServer_instances, "m", _BaseServer_onDeviceDisconnected).bind(this),
            deviceIsConnected: __classPrivateFieldGet(this, _BaseServer_instances, "m", _BaseServer_onDeviceIsConnected).bind(this),
        });
        _console$3.assertWithError(scanner$1, "no scanner defined");
        addEventListeners(scanner$1, __classPrivateFieldGet(this, _BaseServer_boundScannerListeners, "f"));
        addEventListeners(DeviceManager$1, __classPrivateFieldGet(this, _BaseServer_boundDeviceManagerListeners, "f"));
        addEventListeners(this, __classPrivateFieldGet(this, _BaseServer_boundServerListeners, "f"));
    }
    get numberOfClients() {
        return 0;
    }
    static get ClearSensorConfigurationsWhenNoClients() {
        return __classPrivateFieldGet(this, _a, "f", _BaseServer_ClearSensorConfigurationsWhenNoClients);
    }
    static set ClearSensorConfigurationsWhenNoClients(newValue) {
        _console$3.assertTypeWithError(newValue, "boolean");
        __classPrivateFieldSet(this, _a, newValue, "f", _BaseServer_ClearSensorConfigurationsWhenNoClients);
    }
    get clearSensorConfigurationsWhenNoClients() {
        return __classPrivateFieldGet(this, _BaseServer_clearSensorConfigurationsWhenNoClients, "f");
    }
    set clearSensorConfigurationsWhenNoClients(newValue) {
        _console$3.assertTypeWithError(newValue, "boolean");
        __classPrivateFieldSet(this, _BaseServer_clearSensorConfigurationsWhenNoClients, newValue, "f");
    }
    broadcastMessage(message) {
        _console$3.log("broadcasting", message);
    }
    parseClientMessage(dataView) {
        let responseMessages = [];
        parseMessage(dataView, ServerMessageTypes, __classPrivateFieldGet(this, _BaseServer_instances, "m", _BaseServer_onClientMessage).bind(this), { responseMessages }, true);
        responseMessages = responseMessages.filter(Boolean);
        if (responseMessages.length > 0) {
            return concatenateArrayBuffers(responseMessages);
        }
    }
    parseClientDeviceMessage(device, dataView) {
        _console$3.log("onDeviceMessage", device.bluetoothId, dataView);
        let responseMessages = [];
        parseMessage(dataView, ConnectionMessageTypes, __classPrivateFieldGet(this, _BaseServer_instances, "m", _BaseServer_parseClientDeviceMessageCallback).bind(this), { responseMessages, device }, true);
        if (responseMessages.length > 0) {
            return __classPrivateFieldGet(this, _BaseServer_instances, "m", _BaseServer_createDeviceServerMessage).call(this, device, ...responseMessages);
        }
    }
}
_a = BaseServer, _BaseServer_clearSensorConfigurationsWhenNoClients = new WeakMap(), _BaseServer_boundServerListeners = new WeakMap(), _BaseServer_boundScannerListeners = new WeakMap(), _BaseServer_boundDeviceListeners = new WeakMap(), _BaseServer_boundDeviceManagerListeners = new WeakMap(), _BaseServer_instances = new WeakSet(), _BaseServer_onClientConnected = function _BaseServer_onClientConnected(event) {
    event.message.client;
    _console$3.log("onClientConnected");
}, _BaseServer_onClientDisconnected = function _BaseServer_onClientDisconnected(event) {
    event.message.client;
    _console$3.log("onClientDisconnected");
    if (this.numberOfClients == 0 &&
        this.clearSensorConfigurationsWhenNoClients) {
        DeviceManager$1.ConnectedDevices.forEach((device) => {
            device.clearSensorConfiguration();
            device.setTfliteInferencingEnabled(false);
        });
    }
}, _BaseServer_onScannerIsAvailable = function _BaseServer_onScannerIsAvailable(event) {
    this.broadcastMessage(__classPrivateFieldGet(this, _BaseServer_instances, "a", _BaseServer_isScanningAvailableMessage_get));
}, _BaseServer_isScanningAvailableMessage_get = function _BaseServer_isScanningAvailableMessage_get() {
    return createServerMessage({
        type: "isScanningAvailable",
        data: scanner$1.isScanningAvailable,
    });
}, _BaseServer_onScannerIsScanning = function _BaseServer_onScannerIsScanning(event) {
    this.broadcastMessage(__classPrivateFieldGet(this, _BaseServer_instances, "a", _BaseServer_isScanningMessage_get));
}, _BaseServer_isScanningMessage_get = function _BaseServer_isScanningMessage_get() {
    return createServerMessage({
        type: "isScanning",
        data: scanner$1.isScanning,
    });
}, _BaseServer_onScannerDiscoveredDevice = function _BaseServer_onScannerDiscoveredDevice(event) {
    const { discoveredDevice } = event.message;
    _console$3.log(discoveredDevice);
    this.broadcastMessage(__classPrivateFieldGet(this, _BaseServer_instances, "m", _BaseServer_createDiscoveredDeviceMessage).call(this, discoveredDevice));
}, _BaseServer_createDiscoveredDeviceMessage = function _BaseServer_createDiscoveredDeviceMessage(discoveredDevice) {
    return createServerMessage({
        type: "discoveredDevice",
        data: discoveredDevice,
    });
}, _BaseServer_onExpiredDiscoveredDevice = function _BaseServer_onExpiredDiscoveredDevice(event) {
    const { discoveredDevice } = event.message;
    _console$3.log("expired", discoveredDevice);
    this.broadcastMessage(__classPrivateFieldGet(this, _BaseServer_instances, "m", _BaseServer_createExpiredDiscoveredDeviceMessage).call(this, discoveredDevice));
}, _BaseServer_createExpiredDiscoveredDeviceMessage = function _BaseServer_createExpiredDiscoveredDeviceMessage(discoveredDevice) {
    return createServerMessage({
        type: "expiredDiscoveredDevice",
        data: discoveredDevice.bluetoothId,
    });
}, _BaseServer_discoveredDevicesMessage_get = function _BaseServer_discoveredDevicesMessage_get() {
    const serverMessages = scanner$1.discoveredDevicesArray
        .filter((discoveredDevice) => {
        const existingConnectedDevice = DeviceManager$1.ConnectedDevices.find((device) => device.bluetoothId == discoveredDevice.bluetoothId);
        return !existingConnectedDevice;
    })
        .map((discoveredDevice) => {
        return { type: "discoveredDevice", data: discoveredDevice };
    });
    return createServerMessage(...serverMessages);
}, _BaseServer_connectedDevicesMessage_get = function _BaseServer_connectedDevicesMessage_get() {
    return createServerMessage({
        type: "connectedDevices",
        data: JSON.stringify({
            connectedDevices: DeviceManager$1.ConnectedDevices.map((device) => device.bluetoothId),
        }),
    });
}, _BaseServer_createDeviceMessage = function _BaseServer_createDeviceMessage(device, messageType, dataView) {
    return {
        type: messageType,
        data: dataView || device.latestConnectionMessages.get(messageType),
    };
}, _BaseServer_onDeviceConnectionMessage = function _BaseServer_onDeviceConnectionMessage(deviceEvent) {
    const { target: device, message } = deviceEvent;
    _console$3.log("onDeviceConnectionMessage", deviceEvent.message);
    if (!device.isConnected) {
        return;
    }
    const { messageType, dataView } = message;
    this.broadcastMessage(__classPrivateFieldGet(this, _BaseServer_instances, "m", _BaseServer_createDeviceServerMessage).call(this, device, __classPrivateFieldGet(this, _BaseServer_instances, "m", _BaseServer_createDeviceMessage).call(this, device, messageType, dataView)));
}, _BaseServer_onDeviceConnected = function _BaseServer_onDeviceConnected(staticDeviceEvent) {
    const { device } = staticDeviceEvent.message;
    _console$3.log("onDeviceConnected", device.bluetoothId);
    addEventListeners(device, __classPrivateFieldGet(this, _BaseServer_boundDeviceListeners, "f"));
    device.isServerSide = true;
}, _BaseServer_onDeviceDisconnected = function _BaseServer_onDeviceDisconnected(staticDeviceEvent) {
    const { device } = staticDeviceEvent.message;
    _console$3.log("onDeviceDisconnected", device.bluetoothId);
    removeEventListeners(device, __classPrivateFieldGet(this, _BaseServer_boundDeviceListeners, "f"));
}, _BaseServer_onDeviceIsConnected = function _BaseServer_onDeviceIsConnected(staticDeviceEvent) {
    const { device } = staticDeviceEvent.message;
    _console$3.log("onDeviceIsConnected", device.bluetoothId);
    this.broadcastMessage(__classPrivateFieldGet(this, _BaseServer_instances, "m", _BaseServer_createDeviceIsConnectedMessage).call(this, device));
}, _BaseServer_createDeviceIsConnectedMessage = function _BaseServer_createDeviceIsConnectedMessage(device) {
    return __classPrivateFieldGet(this, _BaseServer_instances, "m", _BaseServer_createDeviceServerMessage).call(this, device, {
        type: "isConnected",
        data: device.isConnected,
    });
}, _BaseServer_createDeviceServerMessage = function _BaseServer_createDeviceServerMessage(device, ...messages) {
    return createServerMessage({
        type: "deviceMessage",
        data: [device.bluetoothId, createDeviceMessage(...messages)],
    });
}, _BaseServer_onClientMessage = function _BaseServer_onClientMessage(messageType, dataView, context) {
    const { responseMessages } = context;
    switch (messageType) {
        case "isScanningAvailable":
            responseMessages.push(__classPrivateFieldGet(this, _BaseServer_instances, "a", _BaseServer_isScanningAvailableMessage_get));
            break;
        case "isScanning":
            responseMessages.push(__classPrivateFieldGet(this, _BaseServer_instances, "a", _BaseServer_isScanningMessage_get));
            break;
        case "startScan":
            scanner$1.startScan();
            break;
        case "stopScan":
            scanner$1.stopScan();
            break;
        case "discoveredDevices":
            responseMessages.push(__classPrivateFieldGet(this, _BaseServer_instances, "a", _BaseServer_discoveredDevicesMessage_get));
            break;
        case "connectToDevice":
            {
                const { string: deviceId, byteOffset } = parseStringFromDataView(dataView);
                let connectionType = undefined;
                if (byteOffset < dataView.byteLength) {
                    connectionType = ConnectionTypes[dataView.getUint8(byteOffset)];
                }
                scanner$1.connectToDevice(deviceId, connectionType);
            }
            break;
        case "disconnectFromDevice":
            {
                const { string: deviceId } = parseStringFromDataView(dataView);
                const device = DeviceManager$1.ConnectedDevices.find((device) => device.bluetoothId == deviceId);
                if (!device) {
                    _console$3.error(`no device found with id ${deviceId}`);
                    break;
                }
                device.disconnect();
            }
            break;
        case "connectedDevices":
            responseMessages.push(__classPrivateFieldGet(this, _BaseServer_instances, "a", _BaseServer_connectedDevicesMessage_get));
            break;
        case "deviceMessage":
            {
                const { string: deviceId, byteOffset } = parseStringFromDataView(dataView);
                const device = DeviceManager$1.ConnectedDevices.find((device) => device.bluetoothId == deviceId);
                if (!device) {
                    _console$3.error(`no device found with id ${deviceId}`);
                    break;
                }
                const _dataView = new DataView(dataView.buffer, dataView.byteOffset + byteOffset);
                const responseMessage = this.parseClientDeviceMessage(device, _dataView);
                if (responseMessage) {
                    responseMessages.push(responseMessage);
                }
            }
            break;
        default:
            _console$3.error(`uncaught messageType "${messageType}"`);
            break;
    }
}, _BaseServer_parseClientDeviceMessageCallback = function _BaseServer_parseClientDeviceMessageCallback(messageType, dataView, context) {
    _console$3.log(`clientDeviceMessage ${messageType} (${dataView.byteLength} bytes)`);
    switch (messageType) {
        case "smp":
            context.device.connectionManager.sendSmpMessage(dataView.buffer);
            break;
        case "tx":
            context.device.connectionManager.sendTxData(dataView.buffer);
            break;
        default:
            context.responseMessages.push(__classPrivateFieldGet(this, _BaseServer_instances, "m", _BaseServer_createDeviceMessage).call(this, context.device, messageType));
            break;
    }
};
_BaseServer_ClearSensorConfigurationsWhenNoClients = { value: true };

var _WebSocketServer_instances, _WebSocketServer_server, _WebSocketServer_boundWebSocketServerListeners, _WebSocketServer_onWebSocketServerClose, _WebSocketServer_onWebSocketServerConnection, _WebSocketServer_onWebSocketServerError, _WebSocketServer_onWebSocketServerHeaders, _WebSocketServer_onWebSocketServerListening, _WebSocketServer_boundWebSocketClientListeners, _WebSocketServer_onWebSocketClientOpen, _WebSocketServer_onWebSocketClientMessage, _WebSocketServer_onWebSocketClientClose, _WebSocketServer_onWebSocketClientError, _WebSocketServer_parseWebSocketClientMessage, _WebSocketServer_onClientMessage, _WebSocketServer_pingClient;
const _console$2 = createConsole("WebSocketServer", { log: false });
class WebSocketServer extends BaseServer {
    constructor() {
        super(...arguments);
        _WebSocketServer_instances.add(this);
        _WebSocketServer_server.set(this, void 0);
        _WebSocketServer_boundWebSocketServerListeners.set(this, {
            close: __classPrivateFieldGet(this, _WebSocketServer_instances, "m", _WebSocketServer_onWebSocketServerClose).bind(this),
            connection: __classPrivateFieldGet(this, _WebSocketServer_instances, "m", _WebSocketServer_onWebSocketServerConnection).bind(this),
            error: __classPrivateFieldGet(this, _WebSocketServer_instances, "m", _WebSocketServer_onWebSocketServerError).bind(this),
            headers: __classPrivateFieldGet(this, _WebSocketServer_instances, "m", _WebSocketServer_onWebSocketServerHeaders).bind(this),
            listening: __classPrivateFieldGet(this, _WebSocketServer_instances, "m", _WebSocketServer_onWebSocketServerListening).bind(this),
        });
        _WebSocketServer_boundWebSocketClientListeners.set(this, {
            open: __classPrivateFieldGet(this, _WebSocketServer_instances, "m", _WebSocketServer_onWebSocketClientOpen).bind(this),
            message: __classPrivateFieldGet(this, _WebSocketServer_instances, "m", _WebSocketServer_onWebSocketClientMessage).bind(this),
            close: __classPrivateFieldGet(this, _WebSocketServer_instances, "m", _WebSocketServer_onWebSocketClientClose).bind(this),
            error: __classPrivateFieldGet(this, _WebSocketServer_instances, "m", _WebSocketServer_onWebSocketClientError).bind(this),
        });
    }
    get numberOfClients() {
        return __classPrivateFieldGet(this, _WebSocketServer_server, "f")?.clients.size || 0;
    }
    get server() {
        return __classPrivateFieldGet(this, _WebSocketServer_server, "f");
    }
    set server(newServer) {
        if (__classPrivateFieldGet(this, _WebSocketServer_server, "f") == newServer) {
            _console$2.log("redundant WebSocket server assignment");
            return;
        }
        _console$2.log("assigning WebSocket server...");
        if (__classPrivateFieldGet(this, _WebSocketServer_server, "f")) {
            _console$2.log("clearing existing WebSocket server...");
            removeEventListeners(__classPrivateFieldGet(this, _WebSocketServer_server, "f"), __classPrivateFieldGet(this, _WebSocketServer_boundWebSocketServerListeners, "f"));
        }
        addEventListeners(newServer, __classPrivateFieldGet(this, _WebSocketServer_boundWebSocketServerListeners, "f"));
        __classPrivateFieldSet(this, _WebSocketServer_server, newServer, "f");
        _console$2.log("assigned WebSocket server");
    }
    broadcastMessage(message) {
        super.broadcastMessage(message);
        this.server.clients.forEach((client) => {
            client.send(createWebSocketMessage$1({ type: "serverMessage", data: message }));
        });
    }
}
_WebSocketServer_server = new WeakMap(), _WebSocketServer_boundWebSocketServerListeners = new WeakMap(), _WebSocketServer_boundWebSocketClientListeners = new WeakMap(), _WebSocketServer_instances = new WeakSet(), _WebSocketServer_onWebSocketServerClose = function _WebSocketServer_onWebSocketServerClose() {
    _console$2.log("server.close");
}, _WebSocketServer_onWebSocketServerConnection = function _WebSocketServer_onWebSocketServerConnection(client) {
    _console$2.log("server.connection");
    client.isAlive = true;
    client.pingClientTimer = new Timer(() => __classPrivateFieldGet(this, _WebSocketServer_instances, "m", _WebSocketServer_pingClient).call(this, client), webSocketPingTimeout);
    client.pingClientTimer.start();
    addEventListeners(client, __classPrivateFieldGet(this, _WebSocketServer_boundWebSocketClientListeners, "f"));
    this.dispatchEvent("clientConnected", { client });
}, _WebSocketServer_onWebSocketServerError = function _WebSocketServer_onWebSocketServerError(error) {
    _console$2.error(error);
}, _WebSocketServer_onWebSocketServerHeaders = function _WebSocketServer_onWebSocketServerHeaders() {
}, _WebSocketServer_onWebSocketServerListening = function _WebSocketServer_onWebSocketServerListening() {
    _console$2.log("server.listening");
}, _WebSocketServer_onWebSocketClientOpen = function _WebSocketServer_onWebSocketClientOpen(event) {
    _console$2.log("client.open");
}, _WebSocketServer_onWebSocketClientMessage = function _WebSocketServer_onWebSocketClientMessage(event) {
    _console$2.log("client.message");
    const client = event.target;
    client.isAlive = true;
    client.pingClientTimer.restart();
    const dataView = new DataView(dataToArrayBuffer(event.data));
    _console$2.log(`received ${dataView.byteLength} bytes`, dataView.buffer);
    __classPrivateFieldGet(this, _WebSocketServer_instances, "m", _WebSocketServer_parseWebSocketClientMessage).call(this, client, dataView);
}, _WebSocketServer_onWebSocketClientClose = function _WebSocketServer_onWebSocketClientClose(event) {
    _console$2.log("client.close");
    const client = event.target;
    client.pingClientTimer.stop();
    removeEventListeners(client, __classPrivateFieldGet(this, _WebSocketServer_boundWebSocketClientListeners, "f"));
    this.dispatchEvent("clientDisconnected", { client });
}, _WebSocketServer_onWebSocketClientError = function _WebSocketServer_onWebSocketClientError(event) {
    _console$2.error("client.error", event.message);
}, _WebSocketServer_parseWebSocketClientMessage = function _WebSocketServer_parseWebSocketClientMessage(client, dataView) {
    let responseMessages = [];
    parseMessage(dataView, WebSocketMessageTypes$1, __classPrivateFieldGet(this, _WebSocketServer_instances, "m", _WebSocketServer_onClientMessage).bind(this), { responseMessages }, true);
    responseMessages = responseMessages.filter(Boolean);
    if (responseMessages.length == 0) {
        _console$2.log("nothing to send back");
        return;
    }
    const responseMessage = concatenateArrayBuffers(responseMessages);
    _console$2.log(`sending ${responseMessage.byteLength} bytes to client...`);
    try {
        client.send(responseMessage);
    }
    catch (error) {
        _console$2.log("error sending message", error);
    }
}, _WebSocketServer_onClientMessage = function _WebSocketServer_onClientMessage(messageType, dataView, context) {
    const { responseMessages } = context;
    switch (messageType) {
        case "ping":
            responseMessages.push(webSocketPongMessage);
            break;
        case "pong":
            break;
        case "serverMessage":
            const responseMessage = this.parseClientMessage(dataView);
            if (responseMessage) {
                responseMessages.push(createWebSocketMessage$1({ type: "serverMessage", data: responseMessage }));
            }
            break;
        default:
            _console$2.error(`uncaught messageType "${messageType}"`);
            break;
    }
}, _WebSocketServer_pingClient = function _WebSocketServer_pingClient(client) {
    if (!client.isAlive) {
        client.terminate();
        return;
    }
    client.isAlive = false;
    client.send(webSocketPingMessage);
};

const _console$1 = createConsole("UDPUtils", { log: false });
const removeUDPClientTimeout = 3_000;
const UDPServerMessageTypes = ["ping", "pong", "setRemoteReceivePort", "serverMessage"];
function createUDPServerMessage(...messages) {
    _console$1.log("createUDPServerMessage", ...messages);
    return createMessage(UDPServerMessageTypes, ...messages);
}
createUDPServerMessage("ping");
const udpPongMessage = createUDPServerMessage("pong");

var _UDPServer_instances, _UDPServer_clients, _UDPServer_getClientByRemoteInfo, _UDPServer_remoteInfoToString, _UDPServer_clientToString, _UDPServer_socket, _UDPServer_boundSocketListeners, _UDPServer_onSocketClose, _UDPServer_onSocketConnect, _UDPServer_onSocketError, _UDPServer_onSocketListening, _UDPServer_onSocketMessage, _UDPServer_onClientData, _UDPServer_onClientUDPMessage, _UDPServer_createPongMessage, _UDPServer_parseRemoteReceivePort, _UDPServer_sendToClient, _UDPServer_removeClient;
const _console = createConsole("UDPServer", { log: false });
class UDPServer extends BaseServer {
    constructor() {
        super(...arguments);
        _UDPServer_instances.add(this);
        _UDPServer_clients.set(this, []);
        _UDPServer_socket.set(this, void 0);
        _UDPServer_boundSocketListeners.set(this, {
            close: __classPrivateFieldGet(this, _UDPServer_instances, "m", _UDPServer_onSocketClose).bind(this),
            connect: __classPrivateFieldGet(this, _UDPServer_instances, "m", _UDPServer_onSocketConnect).bind(this),
            error: __classPrivateFieldGet(this, _UDPServer_instances, "m", _UDPServer_onSocketError).bind(this),
            listening: __classPrivateFieldGet(this, _UDPServer_instances, "m", _UDPServer_onSocketListening).bind(this),
            message: __classPrivateFieldGet(this, _UDPServer_instances, "m", _UDPServer_onSocketMessage).bind(this),
        });
    }
    get numberOfClients() {
        return __classPrivateFieldGet(this, _UDPServer_clients, "f").length;
    }
    get socket() {
        return __classPrivateFieldGet(this, _UDPServer_socket, "f");
    }
    set socket(newSocket) {
        if (__classPrivateFieldGet(this, _UDPServer_socket, "f") == newSocket) {
            _console.log("redundant udp socket assignment");
            return;
        }
        _console.log("assigning udp socket...");
        if (__classPrivateFieldGet(this, _UDPServer_socket, "f")) {
            _console.log("clearing existing udp socket...");
            removeEventListeners(__classPrivateFieldGet(this, _UDPServer_socket, "f"), __classPrivateFieldGet(this, _UDPServer_boundSocketListeners, "f"));
        }
        addEventListeners(newSocket, __classPrivateFieldGet(this, _UDPServer_boundSocketListeners, "f"));
        __classPrivateFieldSet(this, _UDPServer_socket, newSocket, "f");
        _console.log("assigned udp socket");
    }
    broadcastMessage(message) {
        super.broadcastMessage(message);
        __classPrivateFieldGet(this, _UDPServer_clients, "f").forEach((client) => {
            __classPrivateFieldGet(this, _UDPServer_instances, "m", _UDPServer_sendToClient).call(this, client, createUDPServerMessage({ type: "serverMessage", data: message }));
        });
    }
}
_UDPServer_clients = new WeakMap(), _UDPServer_socket = new WeakMap(), _UDPServer_boundSocketListeners = new WeakMap(), _UDPServer_instances = new WeakSet(), _UDPServer_getClientByRemoteInfo = function _UDPServer_getClientByRemoteInfo(remoteInfo, createIfNotFound = false) {
    const { address, port } = remoteInfo;
    let client = __classPrivateFieldGet(this, _UDPServer_clients, "f").find((client) => client.address == address && client.port == port);
    if (!client && createIfNotFound) {
        client = {
            ...remoteInfo,
            isAlive: true,
            removeSelfTimer: new Timer(() => __classPrivateFieldGet(this, _UDPServer_instances, "m", _UDPServer_removeClient).call(this, client), removeUDPClientTimeout),
            lastTimeSentData: 0,
        };
        _console.log("created new client", client);
        __classPrivateFieldGet(this, _UDPServer_clients, "f").push(client);
        _console.log(`currently have ${this.numberOfClients} clients`);
        this.dispatchEvent("clientConnected", { client });
    }
    return client;
}, _UDPServer_remoteInfoToString = function _UDPServer_remoteInfoToString(client) {
    const { address, port } = client;
    return `${address}:${port}`;
}, _UDPServer_clientToString = function _UDPServer_clientToString(client) {
    const { address, port, receivePort } = client;
    return `${address}:${port}=>${receivePort}`;
}, _UDPServer_onSocketClose = function _UDPServer_onSocketClose() {
    _console.log("socket close");
}, _UDPServer_onSocketConnect = function _UDPServer_onSocketConnect() {
    _console.log("socket connect");
}, _UDPServer_onSocketError = function _UDPServer_onSocketError(error) {
    _console.error("socket error", error);
}, _UDPServer_onSocketListening = function _UDPServer_onSocketListening() {
    const address = __classPrivateFieldGet(this, _UDPServer_socket, "f").address();
    _console.log(`socket listening on port ${address.address}:${address.port}`);
}, _UDPServer_onSocketMessage = function _UDPServer_onSocketMessage(message, remoteInfo) {
    _console.log(`received ${message.length} bytes from ${__classPrivateFieldGet(this, _UDPServer_instances, "m", _UDPServer_remoteInfoToString).call(this, remoteInfo)}`);
    const client = __classPrivateFieldGet(this, _UDPServer_instances, "m", _UDPServer_getClientByRemoteInfo).call(this, remoteInfo, true);
    if (!client) {
        _console.error("no client found");
        return;
    }
    client.removeSelfTimer.restart();
    const dataView = new DataView(dataToArrayBuffer(message));
    __classPrivateFieldGet(this, _UDPServer_instances, "m", _UDPServer_onClientData).call(this, client, dataView);
}, _UDPServer_onClientData = function _UDPServer_onClientData(client, dataView) {
    _console.log(`parsing ${dataView.byteLength} bytes from ${__classPrivateFieldGet(this, _UDPServer_instances, "m", _UDPServer_clientToString).call(this, client)}`, dataView.buffer);
    let responseMessages = [];
    parseMessage(dataView, UDPServerMessageTypes, __classPrivateFieldGet(this, _UDPServer_instances, "m", _UDPServer_onClientUDPMessage).bind(this), { responseMessages, client }, true);
    responseMessages = responseMessages.filter(Boolean);
    if (responseMessages.length == 0) {
        _console.log("no response to send");
        return;
    }
    if (client.receivePort == undefined) {
        _console.log("client has no defined receivePort");
        return;
    }
    const response = concatenateArrayBuffers(responseMessages);
    _console.log(`responding with ${response.byteLength} bytes...`, response);
    __classPrivateFieldGet(this, _UDPServer_instances, "m", _UDPServer_sendToClient).call(this, client, response);
}, _UDPServer_onClientUDPMessage = function _UDPServer_onClientUDPMessage(messageType, dataView, context) {
    const { client, responseMessages } = context;
    _console.log(`received "${messageType}" message from ${client.address}:${client.port}`);
    switch (messageType) {
        case "ping":
            responseMessages.push(__classPrivateFieldGet(this, _UDPServer_instances, "m", _UDPServer_createPongMessage).call(this, context));
            break;
        case "pong":
            break;
        case "setRemoteReceivePort":
            responseMessages.push(__classPrivateFieldGet(this, _UDPServer_instances, "m", _UDPServer_parseRemoteReceivePort).call(this, dataView, client));
            break;
        case "serverMessage":
            const responseMessage = this.parseClientMessage(dataView);
            if (responseMessage) {
                responseMessages.push(createUDPServerMessage({ type: "serverMessage", data: responseMessage }));
            }
            break;
        default:
            _console.error(`uncaught messageType "${messageType}"`);
            break;
    }
}, _UDPServer_createPongMessage = function _UDPServer_createPongMessage(context) {
    return udpPongMessage;
}, _UDPServer_parseRemoteReceivePort = function _UDPServer_parseRemoteReceivePort(dataView, client) {
    const receivePort = dataView.getUint16(0);
    client.receivePort = receivePort;
    _console.log(`updated ${client.address}:${client.port} receivePort to ${receivePort}`);
    const responseDataView = new DataView(new ArrayBuffer(2));
    responseDataView.setUint16(0, client.receivePort);
    return createUDPServerMessage({ type: "setRemoteReceivePort", data: responseDataView });
}, _UDPServer_sendToClient = function _UDPServer_sendToClient(client, message) {
    _console.log(`sending ${message.byteLength} bytes to ${__classPrivateFieldGet(this, _UDPServer_instances, "m", _UDPServer_clientToString).call(this, client)}...`);
    try {
        __classPrivateFieldGet(this, _UDPServer_socket, "f").send(new Uint8Array(message), client.receivePort, client.address, (error, bytes) => {
            if (error) {
                _console.error("error sending data", error);
                return;
            }
            _console.log(`sent ${bytes} bytes`);
            client.lastTimeSentData = Date.now();
        });
    }
    catch (error) {
        _console.error("serious error sending data", error);
    }
}, _UDPServer_removeClient = function _UDPServer_removeClient(client) {
    _console.log(`removing client ${__classPrivateFieldGet(this, _UDPServer_instances, "m", _UDPServer_clientToString).call(this, client)}...`);
    client.removeSelfTimer.stop();
    __classPrivateFieldSet(this, _UDPServer_clients, __classPrivateFieldGet(this, _UDPServer_clients, "f").filter((_client) => _client != client), "f");
    _console.log(`currently have ${this.numberOfClients} clients`);
    this.dispatchEvent("clientDisconnected", { client });
};

exports.ContinuousSensorTypes = ContinuousSensorTypes;
exports.DefaultNumberOfPressureSensors = DefaultNumberOfPressureSensors;
exports.Device = Device;
exports.DeviceManager = DeviceManager$1;
exports.DevicePair = DevicePair;
exports.DevicePairTypes = DevicePairTypes;
exports.DeviceTypes = DeviceTypes;
exports.Environment = environment;
exports.FileTransferDirections = FileTransferDirections;
exports.FileTypes = FileTypes;
exports.MaxNameLength = MaxNameLength;
exports.MaxNumberOfVibrationWaveformEffectSegments = MaxNumberOfVibrationWaveformEffectSegments;
exports.MaxNumberOfVibrationWaveformSegments = MaxNumberOfVibrationWaveformSegments;
exports.MaxSensorRate = MaxSensorRate;
exports.MaxVibrationWaveformEffectSegmentDelay = MaxVibrationWaveformEffectSegmentDelay;
exports.MaxVibrationWaveformEffectSegmentLoopCount = MaxVibrationWaveformEffectSegmentLoopCount;
exports.MaxVibrationWaveformEffectSequenceLoopCount = MaxVibrationWaveformEffectSequenceLoopCount;
exports.MaxVibrationWaveformSegmentDuration = MaxVibrationWaveformSegmentDuration;
exports.MaxWifiPasswordLength = MaxWifiPasswordLength;
exports.MaxWifiSSIDLength = MaxWifiSSIDLength;
exports.MinNameLength = MinNameLength;
exports.MinWifiPasswordLength = MinWifiPasswordLength;
exports.MinWifiSSIDLength = MinWifiSSIDLength;
exports.RangeHelper = RangeHelper;
exports.Scanner = scanner$1;
exports.SensorRateStep = SensorRateStep;
exports.SensorTypes = SensorTypes;
exports.Sides = Sides;
exports.TfliteSensorTypes = TfliteSensorTypes;
exports.TfliteTasks = TfliteTasks;
exports.UDPServer = UDPServer;
exports.VibrationLocations = VibrationLocations;
exports.VibrationTypes = VibrationTypes;
exports.VibrationWaveformEffects = VibrationWaveformEffects;
exports.WebSocketServer = WebSocketServer;
exports.setAllConsoleLevelFlags = setAllConsoleLevelFlags;
exports.setConsoleLevelFlagsForType = setConsoleLevelFlagsForType;
//# sourceMappingURL=brilliantsole.cjs.map
