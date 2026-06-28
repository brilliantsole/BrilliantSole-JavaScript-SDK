/**
 * @copyright Zack Qattan 2024
 * @license MIT
 */
import autoBind$1 from 'auto-bind';
import * as tf from '@tensorflow/tfjs';
import * as webbluetooth from 'webbluetooth';
import RGBQuant from 'rgbquant';
import opentype from 'opentype.js';
import { decompress } from 'woff2-encoder';
import simplify from 'simplify-js';
import fitCurve from 'fit-curve';
import 'svgson';
import 'svg-pathdata';
import * as dgram from 'dgram';
import * as noble from '@stoprocent/noble';
import noble__default from '@stoprocent/noble';
import os from 'os';
import sharp from 'sharp';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import * as _alawmulaw from 'alawmulaw';
import { Euler, Quaternion } from 'three';

const __BRILLIANTSOLE__ENVIRONMENT__ = "__BRILLIANTSOLE__DEV__";
const isInProduction =
__BRILLIANTSOLE__ENVIRONMENT__ == "__BRILLIANTSOLE__PROD__";
const isInDev = __BRILLIANTSOLE__ENVIRONMENT__ == "__BRILLIANTSOLE__DEV__";
const isInBrowser = typeof window !== "undefined" && typeof window?.document !== "undefined";
let isInIframe = false;
try {
    isInIframe = window.self !== window.top;
}
catch {
    isInIframe = true;
}
const isWKWebView = typeof window !== "undefined" &&
    typeof window?.webkit?.messageHandlers !== "undefined";
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

var environment = /*#__PURE__*/Object.freeze({
    __proto__: null,
    isAndroid: isAndroid,
    get isBluetoothSupported () { return isBluetoothSupported; },
    isIOS: isIOS,
    isInBluefy: isInBluefy,
    isInBrowser: isInBrowser,
    isInDev: isInDev,
    get isInIframe () { return isInIframe; },
    isInNode: isInNode,
    isInProduction: isInProduction,
    isInWebBLE: isInWebBLE,
    isMac: isMac,
    isSafari: isSafari,
    isWKWebView: isWKWebView
});

var __console;
__console = console;
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
function assertWithError(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
class Console {
    static #consoles = {};
    constructor(type) {
        if (Console.#consoles[type]) {
            throw new Error(`"${type}" console already exists`);
        }
        Console.#consoles[type] = this;
    }
    #levelFlags = {
        log: isInDev,
        warn: isInDev,
        assert: true,
        error: true,
        table: true,
    };
    setLevelFlags(levelFlags) {
        Object.assign(this.#levelFlags, levelFlags);
    }
    static setLevelFlagsForType(type, levelFlags) {
        if (!this.#consoles[type]) {
            throw new Error(`no console found with type "${type}"`);
        }
        this.#consoles[type].setLevelFlags(levelFlags);
    }
    static setAllLevelFlags(levelFlags) {
        for (const type in this.#consoles) {
            this.#consoles[type].setLevelFlags(levelFlags);
        }
    }
    static create(type, levelFlags) {
        const console = this.#consoles[type] || new Console(type);
        if (levelFlags) {
            console.setLevelFlags(levelFlags);
        }
        return console;
    }
    get log() {
        return this.#levelFlags.log ? log : emptyFunction;
    }
    get warn() {
        return this.#levelFlags.warn ? warn : emptyFunction;
    }
    get error() {
        return this.#levelFlags.error ? error : emptyFunction;
    }
    get assert() {
        return this.#levelFlags.assert ? assert : emptyFunction;
    }
    get table() {
        return this.#levelFlags.table ? table : emptyFunction;
    }
    assertWithError(condition, message) {
        assertWithError(condition, message);
    }
    assertTypeWithError(value, type) {
        this.assertWithError(typeof value == type, `value ${value} of type "${typeof value}" not of type "${type}"`);
    }
    assertEnumWithError(value, enumeration) {
        this.assertWithError(enumeration.includes(value), `invalid enum "${value}"`);
    }
    assertRangeWithError(name, value, min, max) {
        this.assertTypeWithError(value, "number");
        this.assertWithError(value >= min && value <= max, `${name} ${value} must be within [${min}, ${max}]`);
    }
}
function createConsole(type, levelFlags) {
    return Console.create(type, levelFlags);
}
function setConsoleLevelFlagsForType(type, levelFlags) {
    Console.setLevelFlagsForType(type, levelFlags);
}
function setAllConsoleLevelFlags(levelFlags) {
    Console.setAllLevelFlags(levelFlags);
}

const _console$T = createConsole("EventDispatcher", { log: false });
const wildcardEventType = "*";
class EventDispatcher {
    #listeners = {};
    #latestEvents = {};
    #target;
    #validEventTypes;
    constructor(target, validEventTypes) {
        autoBind$1(this);
        this.#target = target;
        this.#validEventTypes = validEventTypes;
        _console$T.assertWithError(
        !validEventTypes.includes(wildcardEventType), `eventTypes cannot include the wildcardSymbol "${wildcardEventType}"`);
    }
    #isValidEventType(type) {
        return this.#validEventTypes.includes(type);
    }
    #isValidListenerType(type) {
        return (type === wildcardEventType ||
            this.#validEventTypes.includes(type));
    }
    #updateEventListeners(type) {
        if (!this.#listeners[type])
            return;
        this.#listeners[type] = this.#listeners[type].filter((listenerObj) => !listenerObj.shouldRemove);
    }
    addEventListener(type, listener, options = { once: false, immediate: false }) {
        if (!this.#isValidListenerType(type)) {
            throw new Error(`Invalid event type: ${type}`);
        }
        if (!this.#listeners[type]) {
            this.#listeners[type] = [];
            _console$T.log(`creating "${type}" listeners array`, this.#listeners[type]);
        }
        const alreadyAdded = this.#listeners[type].find((listenerObject) => {
            return (listenerObject.listener === listener &&
                listenerObject.once === options.once &&
                listenerObject.immediate === options.immediate);
        });
        if (alreadyAdded) {
            _console$T.log("already added listener");
            return;
        }
        const listenerObj = {
            listener,
            once: options.once,
            immediate: options.immediate,
        };
        _console$T.log(`adding "${type}" listener`, listenerObj);
        this.#listeners[type].push(listenerObj);
        _console$T.log(`currently have ${this.#listeners[type].length} "${type}" listeners`);
        if (options.immediate && type != wildcardEventType) {
            const latestEvent = this.#latestEvents[type];
            if (latestEvent) {
                this.#invokeListener(listenerObj, latestEvent.type, latestEvent.message);
                this.#updateEventListeners(type);
            }
        }
    }
    removeEventListener(type, listener) {
        if (!this.#isValidListenerType(type)) {
            throw new Error(`Invalid event type: ${type}`);
        }
        if (!this.#listeners[type])
            return;
        _console$T.log(`removing "${type}" listener...`, listener);
        this.#listeners[type].forEach((listenerObj) => {
            const isListenerToRemove = listenerObj.listener === listener;
            if (isListenerToRemove) {
                _console$T.log(`flagging "${type}" listener`, listener);
                listenerObj.shouldRemove = true;
            }
        });
        this.#updateEventListeners(type);
    }
    removeEventListeners(type) {
        if (!this.#isValidListenerType(type)) {
            throw new Error(`Invalid event type: ${type}`);
        }
        if (!this.#listeners[type])
            return;
        _console$T.log(`removing "${type}" listeners...`);
        this.#listeners[type] = [];
    }
    removeAllEventListeners() {
        _console$T.log(`removing listeners...`);
        this.#listeners = {};
    }
    dispatchEvent(type, message) {
        if (!this.#isValidEventType(type)) {
            throw new Error(`Invalid event type: ${type}`);
        }
        this.#latestEvents[type] = {
            type,
            target: this.#target,
            message,
        };
        this.#dispatchEvent(type, message);
        this.#dispatchEvent(type, message, true);
    }
    #invokeListener(listenerObj, type, message) {
        _console$T.log(`dispatching "${type}" listener`, listenerObj);
        try {
            listenerObj.listener({ type, target: this.#target, message });
        }
        catch (error) {
            console.error(error);
        }
        if (listenerObj.once) {
            _console$T.log(`flagging "${type}" listener`, listenerObj);
            listenerObj.shouldRemove = true;
        }
    }
    #dispatchEvent(type, message, isWildcard = false) {
        if (!this.#isValidEventType(type)) {
            throw new Error(`Invalid event type: ${type}`);
        }
        const listenersType = isWildcard ? wildcardEventType : type;
        if (!this.#listeners[listenersType])
            return;
        const listenersSnapshot = [...this.#listeners[listenersType]];
        listenersSnapshot.forEach((listenerObj) => {
            if (listenerObj.shouldRemove) {
                return;
            }
            this.#invokeListener(listenerObj, type, message);
        });
        this.#updateEventListeners(type);
    }
    waitForEvent(type, options = {}) {
        return new Promise((resolve) => {
            this.addEventListener(type, resolve, {
                once: true,
                immediate: options.immediate,
            });
        });
    }
}

const _console$S = createConsole("Timer", { log: false });
async function wait(delay) {
    _console$S.log(`waiting for ${delay}ms`);
    return new Promise((resolve) => {
        setTimeout(() => resolve(), delay);
    });
}
class Timer {
    #callback;
    get callback() {
        return this.#callback;
    }
    set callback(newCallback) {
        _console$S.assertTypeWithError(newCallback, "function");
        _console$S.log({ newCallback });
        this.#callback = newCallback;
        if (this.isRunning) {
            this.restart();
        }
    }
    #interval;
    get interval() {
        return this.#interval;
    }
    set interval(newInterval) {
        _console$S.assertTypeWithError(newInterval, "number");
        _console$S.assertWithError(newInterval > 0, "interval must be above 0");
        _console$S.log({ newInterval });
        this.#interval = newInterval;
        if (this.isRunning) {
            this.restart();
        }
    }
    constructor(callback, interval) {
        this.interval = interval;
        this.callback = callback;
    }
    #intervalId;
    get isRunning() {
        return this.#intervalId != undefined;
    }
    start(immediately = false) {
        if (this.isRunning) {
            _console$S.log("interval already running");
            return;
        }
        _console$S.log(`starting interval every ${this.#interval}ms`);
        this.#intervalId = setInterval(this.#callback, this.#interval);
        if (immediately) {
            this.#callback();
        }
    }
    stop() {
        if (!this.isRunning) {
            _console$S.log("interval already not running");
            return;
        }
        _console$S.log("stopping interval");
        clearInterval(this.#intervalId);
        this.#intervalId = undefined;
    }
    restart(startImmediately = false) {
        this.stop();
        this.start(startImmediately);
    }
}

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

const _console$R = createConsole("ArrayBufferUtils", { log: false });
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
        else if ("buffer" in arrayBuffer &&
            arrayBuffer.buffer instanceof ArrayBuffer) {
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
    _console$R.log({ dataView, begin, end, length });
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
    else if (file.buffer instanceof ArrayBuffer) {
        fileBuffer = file.buffer;
    }
    else {
        throw { error: "invalid file type", file };
    }
    return fileBuffer;
}
function UInt8ByteBuffer(value) {
    return Uint8Array.from([value]).buffer;
}
function areArrayBuffersEqual(a, b) {
    if (a === b)
        return true;
    if (a.byteLength !== b.byteLength)
        return false;
    const viewA = new Uint8Array(a);
    const viewB = new Uint8Array(b);
    for (let i = 0; i < viewA.length; i++) {
        if (viewA[i] !== viewB[i])
            return false;
    }
    return true;
}

var _a$6;
const _console$Q = createConsole("FileTransferManager", { log: false });
const FileTransferMessageTypes = [
    "getFileTypes",
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
const FileTypes = [
    "tflite",
    "wifiServerCert",
    "wifiServerKey",
    "spriteSheet",
    "cameraImage",
];
const FileTransferStatuses = ["idle", "sending", "receiving"];
const FileTransferCommands = [
    "startSend",
    "startReceive",
    "cancel",
];
const FileTransferEventTypes = [
    ...FileTransferMessageTypes,
    "fileTransferProgress",
    "fileTransferComplete",
    "fileReceived",
];
const RequiredFileTransferMessageTypes = [
    "maxFileLength",
    "getFileLength",
    "getFileChecksum",
    "getFileType",
    "fileTransferStatus",
];
class FileTransferManager {
    constructor() {
        autoBind$1(this);
    }
    sendMessage;
    eventDispatcher;
    get addEventListener() {
        return this.eventDispatcher.addEventListener;
    }
    get #dispatchEvent() {
        return this.eventDispatcher.dispatchEvent;
    }
    get removeEventListener() {
        return this.eventDispatcher.removeEventListener;
    }
    get waitForEvent() {
        return this.eventDispatcher.waitForEvent;
    }
    #assertValidType(type) {
        _console$Q.assertEnumWithError(type, FileTypes);
    }
    #isValidType(type) {
        return FileTypes.includes(type);
    }
    #assertValidTypeEnum(typeEnum) {
        _console$Q.assertWithError(typeEnum in FileTypes, `invalid typeEnum ${typeEnum}`);
    }
    #assertValidStatusEnum(statusEnum) {
        _console$Q.assertWithError(statusEnum in FileTransferStatuses, `invalid statusEnum ${statusEnum}`);
    }
    #assertValidCommand(command) {
        _console$Q.assertEnumWithError(command, FileTransferCommands);
    }
    #fileTypes = [];
    get fileTypes() {
        return this.#fileTypes;
    }
    #parseFileTypes(dataView) {
        const fileTypes = Array.from(new Uint8Array(dataView.buffer))
            .map((index) => FileTypes[index])
            .filter(Boolean);
        this.#fileTypes = fileTypes;
        _console$Q.log("fileTypes", fileTypes);
        this.#dispatchEvent("getFileTypes", {
            fileTypes: this.#fileTypes,
        });
    }
    static #MaxLength = 0;
    static get MaxLength() {
        return this.#MaxLength;
    }
    #maxLength = _a$6.MaxLength;
    get maxLength() {
        return this.#maxLength;
    }
    #parseMaxLength(dataView) {
        _console$Q.log("parseFileMaxLength", dataView);
        const maxLength = dataView.getUint32(0, true);
        _console$Q.log(`maxLength: ${maxLength / 1024}kB`);
        this.#updateMaxLength(maxLength);
    }
    #updateMaxLength(maxLength) {
        _console$Q.log({ maxLength });
        this.#maxLength = maxLength;
        this.#dispatchEvent("maxFileLength", { maxFileLength: maxLength });
    }
    #assertValidLength(length) {
        _console$Q.assertWithError(length <= this.maxLength, `file length ${length}kB too large - must be ${this.maxLength}kB or less`);
    }
    #type;
    get type() {
        return this.#type;
    }
    #parseType(dataView) {
        _console$Q.log("parseFileType", dataView);
        const typeEnum = dataView.getUint8(0);
        this.#assertValidTypeEnum(typeEnum);
        const type = FileTypes[typeEnum];
        this.#updateType(type);
    }
    #updateType(type) {
        _console$Q.log({ fileTransferType: type });
        this.#type = type;
        this.#dispatchEvent("getFileType", { fileType: type });
    }
    async #setType(newType, sendImmediately) {
        this.#assertValidType(newType);
        if (this.type == newType) {
            _console$Q.log(`redundant type assignment ${newType}`);
            return;
        }
        const promise = this.waitForEvent("getFileType");
        const typeEnum = FileTypes.indexOf(newType);
        this.sendMessage([{ type: "setFileType", data: UInt8ByteBuffer(typeEnum) }], sendImmediately);
        await promise;
    }
    #length = 0;
    get length() {
        return this.#length;
    }
    #parseLength(dataView) {
        _console$Q.log("parseFileLength", dataView);
        const length = dataView.getUint32(0, true);
        this.#updateLength(length);
    }
    #updateLength(length) {
        _console$Q.log(`length: ${length / 1024}kB (${length} bytes)`);
        this.#length = length;
        this.#dispatchEvent("getFileLength", { fileLength: length });
    }
    async #setLength(newLength, sendImmediately) {
        _console$Q.assertTypeWithError(newLength, "number");
        this.#assertValidLength(newLength);
        if (this.length == newLength) {
            _console$Q.log(`redundant length assignment ${newLength}`);
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
    #parseChecksum(dataView) {
        _console$Q.log("checksum", dataView);
        const checksum = dataView.getUint32(0, true);
        this.#updateChecksum(checksum);
    }
    #updateChecksum(checksum) {
        _console$Q.log({ checksum });
        this.#checksum = checksum;
        this.#dispatchEvent("getFileChecksum", { fileChecksum: checksum });
    }
    async #setChecksum(newChecksum, sendImmediately) {
        _console$Q.assertTypeWithError(newChecksum, "number");
        if (this.checksum == newChecksum) {
            _console$Q.log(`redundant checksum assignment ${newChecksum}`);
            return;
        }
        const promise = this.waitForEvent("getFileChecksum");
        const dataView = new DataView(new ArrayBuffer(4));
        dataView.setUint32(0, newChecksum, true);
        this.sendMessage([{ type: "setFileChecksum", data: dataView.buffer }], sendImmediately);
        await promise;
    }
    async #setCommand(command, sendImmediately) {
        this.#assertValidCommand(command);
        const promise = this.waitForEvent("fileTransferStatus");
        _console$Q.log(`setting command ${command}`);
        const commandEnum = FileTransferCommands.indexOf(command);
        this.sendMessage([
            {
                type: "setFileTransferCommand",
                data: UInt8ByteBuffer(commandEnum),
            },
        ], sendImmediately);
        await promise;
    }
    #status = "idle";
    get status() {
        return this.#status;
    }
    #parseStatus(dataView) {
        _console$Q.log("parseFileStatus", dataView);
        const statusEnum = dataView.getUint8(0);
        this.#assertValidStatusEnum(statusEnum);
        const status = FileTransferStatuses[statusEnum];
        this.#updateStatus(status);
    }
    #updateStatus(status) {
        _console$Q.log({ status });
        this.#status = status;
        this.#receivedBlocks.length = 0;
        this.#isCancelling = false;
        this.#buffer = undefined;
        this.#bytesTransferred = 0;
        this.#dispatchEvent("fileTransferStatus", {
            fileTransferStatus: status,
            fileType: this.type,
        });
    }
    #assertIsIdle() {
        _console$Q.assertWithError(this.#status == "idle", "status is not idle");
    }
    #assertIsNotIdle() {
        _console$Q.assertWithError(this.#status != "idle", "status is idle");
    }
    #receivedBlocks = [];
    async #parseBlock(dataView) {
        _console$Q.log("parseFileBlock", dataView);
        this.#receivedBlocks.push(dataView.buffer);
        const bytesReceived = this.#receivedBlocks.reduce((sum, arrayBuffer) => (sum += arrayBuffer.byteLength), 0);
        const progress = bytesReceived / this.#length;
        _console$Q.log(`received ${bytesReceived}/${this.#length} bytes (${progress * 100}%) - ${this.#length - bytesReceived} bytes remaining`);
        this.#dispatchEvent("fileTransferProgress", {
            progress,
            fileType: this.type,
        });
        if (bytesReceived != this.#length) {
            const dataView = new DataView(new ArrayBuffer(4));
            dataView.setUint32(0, bytesReceived, true);
            if (!this.#buffer) {
                _console$Q.log("no buffer defined");
                return;
            }
            await this.sendMessage([
                { type: "fileBytesTransferred", data: dataView.buffer },
            ]);
            return;
        }
        _console$Q.log("file transfer complete");
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
            file = new File(this.#receivedBlocks, fileName);
        }
        else {
            file = new Blob(this.#receivedBlocks);
        }
        const arrayBuffer = await file.arrayBuffer();
        const checksum = crc32(arrayBuffer);
        _console$Q.log({ checksum });
        if (checksum != this.#checksum) {
            _console$Q.error(`wrong checksum - expected ${this.#checksum}, got ${checksum}`);
            return;
        }
        _console$Q.log("received file", file);
        this.#dispatchEvent("getFileBlock", { fileTransferBlock: dataView });
        this.#dispatchEvent("fileTransferComplete", {
            direction: "receiving",
            fileType: this.type,
        });
        this.#dispatchEvent("fileReceived", { file, fileType: this.type });
    }
    parseMessage(messageType, dataView, isSending) {
        _console$Q.log({ messageType, isSending }, dataView);
        switch (messageType) {
            case "getFileTypes":
                this.#parseFileTypes(dataView);
                break;
            case "maxFileLength":
                this.#parseMaxLength(dataView);
                break;
            case "getFileType":
            case "setFileType":
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
            case "getFileBlock":
                this.#parseBlock(dataView);
                break;
            case "fileBytesTransferred":
                this.#parseBytesTransferred(dataView);
                break;
            default:
                throw Error(`uncaught messageType ${messageType}`);
        }
    }
    async send(type, file, override) {
        {
            this.#assertIsIdle();
            this.#assertValidType(type);
        }
        const fileBuffer = await getFileBuffer(file);
        const fileLength = fileBuffer.byteLength;
        const checksum = crc32(fileBuffer);
        this.#assertValidLength(fileLength);
        if (!override) {
            if (type != this.type) {
                _console$Q.log("different fileTypes - sending");
            }
            else if (fileLength != this.length) {
                _console$Q.log("different fileLengths - sending");
            }
            else if (checksum != this.checksum) {
                _console$Q.log("different fileChecksums - sending");
            }
            else {
                _console$Q.log("already sent file");
                return false;
            }
        }
        const promises = [];
        promises.push(this.#setType(type, false));
        promises.push(this.#setLength(fileLength, false));
        promises.push(this.#setChecksum(checksum, false));
        promises.push(this.#setCommand("startSend", false));
        this.sendMessage();
        await Promise.all(promises);
        if (this.#buffer) {
            return false;
        }
        if (this.#length != fileLength) {
            return false;
        }
        if (this.#checksum != checksum) {
            return false;
        }
        await this.#send(fileBuffer);
        return true;
    }
    #buffer;
    #bytesTransferred = 0;
    async #send(buffer) {
        this.#buffer = buffer;
        return this.#sendBlock();
    }
    mtu;
    async #sendBlock() {
        if (this.status != "sending") {
            return;
        }
        if (this.#isCancelling) {
            _console$Q.error("not sending block - busy cancelling");
            return;
        }
        if (!this.#buffer) {
            _console$Q.log("no buffer defined");
            return;
        }
        const buffer = this.#buffer;
        let offset = this.#bytesTransferred;
        _console$Q.log("sending block", { buffer, offset, mtu: this.mtu });
        const slicedBuffer = buffer.slice(offset, offset + (this.mtu - 3 - 3));
        _console$Q.log("slicedBuffer", slicedBuffer);
        const bytesLeft = buffer.byteLength - offset;
        const progress = 1 - bytesLeft / buffer.byteLength;
        _console$Q.log(`sending bytes ${offset}-${offset + slicedBuffer.byteLength} of ${buffer.byteLength} bytes (${progress * 100}%)`);
        this.#dispatchEvent("fileTransferProgress", {
            progress,
            fileType: this.type,
        });
        if (slicedBuffer.byteLength == 0) {
            _console$Q.log("finished sending buffer");
            this.#dispatchEvent("fileTransferComplete", {
                direction: "sending",
                fileType: this.type,
            });
        }
        else {
            this.#bytesTransferred = offset + slicedBuffer.byteLength;
            await this.sendMessage([{ type: "setFileBlock", data: slicedBuffer }]);
        }
    }
    async #parseBytesTransferred(dataView) {
        _console$Q.log("parseBytesTransferred", dataView);
        const bytesTransferred = dataView.getUint32(0, true);
        _console$Q.log({ bytesTransferred });
        if (this.status != "sending") {
            _console$Q.error(`not currently sending file`);
            return;
        }
        if (this.#buffer && this.#bytesTransferred != bytesTransferred) {
            _console$Q.error(`bytesTransferred are not equal - got ${bytesTransferred}, expected ${this.#bytesTransferred}`);
            this.cancel();
            return;
        }
        this.#sendBlock();
    }
    async receive(type) {
        this.#assertIsIdle();
        this.#assertValidType(type);
        await this.#setType(type);
        await this.#setCommand("startReceive");
    }
    #isCancelling = false;
    async cancel() {
        this.#assertIsNotIdle();
        _console$Q.log("cancelling file transfer...");
        this.#isCancelling = true;
        await this.#setCommand("cancel");
    }
    requestRequiredInformation() {
        _console$Q.log("requesting required fileTransfer information");
        const messages = RequiredFileTransferMessageTypes.map((messageType) => ({
            type: messageType,
        }));
        this.sendMessage(messages, false);
    }
    clear() {
        this.#receivedBlocks.length = 0;
        this.#isCancelling = false;
        this.#buffer = undefined;
        this.#bytesTransferred = 0;
        this.#checksum = 0;
        this.#fileTypes.length = 0;
        this.#type = undefined;
        this.#length = 0;
        this.#checksum = 0;
        this.#status = "idle";
        this.mtu = undefined;
    }
}
_a$6 = FileTransferManager;

const _console$P = createConsole("MathUtils", { log: false });
function getInterpolation(value, min, max, span) {
    if (span == undefined) {
        span = max - min;
    }
    return (value - min) / span;
}
const Uint16Max = 2 ** 16;
const Int16Max = 2 ** 15;
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
    const timestampDifference = Math.abs(now - timestamp);
    if (timestampDifference > timestampThreshold) {
        _console$P.log("correcting timestamp delta");
        timestamp += Uint16Max * Math.sign(now - timestamp);
    }
    _console$P.log({
        now,
        nowWithoutLower2Bytes,
        lower2Bytes,
        timestamp,
        timestampDifference,
    });
    return timestamp;
}
const defaultEuler = {
    heading: 0,
    pitch: 0,
    roll: 0,
    absolute: false,
};
function getVector3Length(vector) {
    const { x, y, z } = vector;
    return Math.sqrt(x ** 2 + y ** 2 + z ** 2);
}
function clamp(value, min = 0, max = 1) {
    return Math.min(Math.max(value, min), max);
}
function degToRad(deg) {
    return deg * (Math.PI / 180);
}
function radToDeg(rad) {
    return rad * (180 / Math.PI);
}
const twoPi = Math.PI * 2;
function normalizeRadians(rad) {
    return ((rad % twoPi) + twoPi) % twoPi;
}
function pointInPolygon(pt, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y;
        const xj = polygon[j].x, yj = polygon[j].y;
        const intersect = yi > pt.y !== yj > pt.y &&
            pt.x < ((xj - xi) * (pt.y - yi)) / (yj - yi) + xi;
        if (intersect)
            inside = !inside;
    }
    return inside;
}

const initialRange = { min: Infinity, max: -Infinity, span: 0 };
class RangeHelper {
    #updatedAtLeastOnce = false;
    get updatedAtLeastOnce() {
        return this.#updatedAtLeastOnce;
    }
    #range = structuredClone(initialRange);
    get min() {
        return this.#range.min;
    }
    get max() {
        return this.#range.max;
    }
    get span() {
        return this.#range.span;
    }
    get range() {
        return structuredClone(this.#range);
    }
    set min(newMin) {
        this.#range.min = newMin;
        this.#range.max = Math.max(newMin, this.#range.max);
        this.#updateSpan();
    }
    set max(newMax) {
        this.#range.max = newMax;
        this.#range.min = Math.min(newMax, this.#range.min);
        this.#updateSpan();
    }
    #updateSpan() {
        this.#range.span = this.#range.max - this.#range.min;
    }
    reset() {
        Object.assign(this.#range, initialRange);
        this.#updatedAtLeastOnce = false;
    }
    update(value) {
        this.#range.min = Math.min(value, this.#range.min);
        this.#range.max = Math.max(value, this.#range.max);
        this.#updateSpan();
        this.#updatedAtLeastOnce = true;
    }
    getNormalization(value, weightByRange, clampValue = true) {
        let normalization = getInterpolation(value, this.#range.min, this.#range.max, this.#range.span);
        if (weightByRange) {
            normalization *= this.#range.span;
        }
        normalization = normalization || 0;
        if (clampValue) {
            normalization = clamp(normalization, 0, 1);
        }
        return normalization || 0;
    }
    updateAndGetNormalization(value, weightByRange) {
        this.update(value);
        return this.getNormalization(value, weightByRange);
    }
}

class RangeHelper2 {
    #range = {
        x: new RangeHelper(),
        y: new RangeHelper(),
    };
    #updatedAtLeastOnce = false;
    get updatedAtLeastOnce() {
        return this.#updatedAtLeastOnce;
    }
    reset() {
        this.#range.x.reset();
        this.#range.y.reset();
        this.#updatedAtLeastOnce = false;
    }
    update(vector2) {
        this.#range.x.update(vector2.x);
        this.#range.y.update(vector2.y);
        this.#updatedAtLeastOnce = true;
    }
    getNormalization(vector2, weightByRange, clampValue) {
        return {
            x: this.#range.x.getNormalization(vector2.x, weightByRange, clampValue),
            y: this.#range.y.getNormalization(vector2.y, weightByRange, clampValue),
        };
    }
    updateAndGetNormalization(vector2, weightByRange) {
        this.update(vector2);
        return this.getNormalization(vector2, weightByRange);
    }
}

const CenterOfPressureHelper = RangeHelper2;

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

function isTensorFlowAvailable() {
    if (isInBrowser) {
        return Boolean(window.tf);
    }
    return Boolean(tf);
}
async function listTensorflowModels() {
    if (!isTensorFlowAvailable()) {
        return {};
    }
    const models = await tf.io.listModels();
    return models;
}
async function getTensorFlowModel(url) {
    const models = await listTensorflowModels();
    const model = models[url];
    if (model) {
        return model;
    }
}
async function isTensorFlowModelAvailable(url) {
    const model = await getTensorFlowModel(url);
    return Boolean(model);
}

const _console$O = createConsole("CenterOfPressureModel", { log: false });
class CenterOfPressureModel {
    constructor() {
        autoBind$1(this);
    }
    eventDispatcher;
    get dispatchEvent() {
        return this.eventDispatcher.dispatchEvent;
    }
    #model;
    get model() {
        return this.#model;
    }
    #hiddenUnitScalars = [4, 2];
    #numberOfSensors = 0;
    get numberOfSensors() {
        return this.#numberOfSensors;
    }
    set numberOfSensors(newNumberOfSensors) {
        if (this.#numberOfSensors == newNumberOfSensors) {
            return;
        }
        this.#numberOfSensors = newNumberOfSensors;
        _console$O.log({ numberOfSensors: this.numberOfSensors });
        this.#createModel();
    }
    async #createModel() {
        if (!isTensorFlowAvailable()) {
            _console$O.warn("tensorflow is not available");
            return;
        }
        if (this.#model) {
            _console$O.log("disposing model", this.#model);
            this.#model.dispose();
            this.#data.inputs.length = this.#data.outputs.length = 0;
            this.#model = undefined;
            this.#isTrained;
        }
        if (this.numberOfSensors == 0) {
            _console$O.log("zero numberOfSensors - no model needed");
            return;
        }
        await tf.ready();
        const model = tf.sequential();
        model.name = "centerOfPressure";
        this.#hiddenUnitScalars.forEach((hiddenUnitScalar, index) => {
            const isFirst = index == 0;
            model.add(tf.layers.dense({
                units: Math.round(this.numberOfSensors * hiddenUnitScalar),
                activation: "relu",
                inputShape: isFirst ? [this.numberOfSensors] : undefined,
            }));
        });
        model.add(tf.layers.dense({ units: 2 }));
        model.compile({
            optimizer: tf.train.adam(0.001),
            loss: "meanSquaredError",
        });
        this.#model = model;
        _console$O.log("created model", this.#model);
    }
    #maxDataLength = 2000;
    #data = { inputs: [], outputs: [] };
    get data() {
        return this.#data;
    }
    clearData() {
        _console$O.log("clearData");
        this.#data.outputs.length = 0;
        this.#data.inputs.length = 0;
        this.#dispatchRecordingProgress();
    }
    #dispatchRecordingProgress() {
        this.dispatchEvent("pressureCalibrationDataRecordingProgress", {
            numberOfSamples: this.numberOfSamples,
            data: this.data,
        });
    }
    #getInputs(pressureData) {
        return pressureData.sensors.map((sensor) => sensor.truncatedScaledValue);
    }
    #getOutputs(euler) {
        return [-euler.roll, -euler.pitch];
    }
    onSensorData(pressureData, euler) {
        this.addData(this.#getInputs(pressureData), this.#getOutputs(euler));
    }
    get numberOfSamples() {
        return this.#data.inputs.length;
    }
    #areDataInputsRedundant(inputs) {
        return false;
    }
    #dataOutputsThreshold = 0.008;
    #areDataOutputsRedundant(outputs) {
        if (this.#data.outputs.length == 0) {
            return false;
        }
        return this.#data.outputs.some((_outputs) => {
            const differences = outputs.map((value, index) => value - _outputs[index]);
            let differencesSquareSum = 0;
            differences.forEach((difference) => {
                differencesSquareSum += difference ** 2;
            });
            const isRedundant = differencesSquareSum < this.#dataOutputsThreshold;
            return isRedundant;
        });
    }
    #isDataRedundant(inputs, outputs) {
        const areDataInputsRedundant = this.#areDataInputsRedundant(inputs);
        const areDataOutputsRedundant = this.#areDataOutputsRedundant(outputs);
        return areDataInputsRedundant || areDataOutputsRedundant;
    }
    addData(inputs, outputs) {
        if (!isTensorFlowAvailable()) {
            return;
        }
        if (this.#isDataRedundant(inputs, outputs)) {
            return;
        }
        this.#data.inputs.push(inputs);
        this.#data.outputs.push(outputs);
        while (this.numberOfSamples > this.#maxDataLength) {
            this.#data.inputs.shift();
            this.#data.outputs.shift();
        }
        _console$O.log({
            numberOfSamples: this.numberOfSamples,
        });
        this.#dispatchRecordingProgress();
    }
    #isTrained = false;
    get isTrained() {
        return this.#isTrained;
    }
    #isTraining = false;
    get isTraining() {
        return this.#isTraining;
    }
    async train() {
        if (!isTensorFlowAvailable()) {
            return;
        }
        if (!this.#model) {
            _console$O.error("no model defined");
            return;
        }
        if (this.isTraining) {
            _console$O.warn("already training");
            return;
        }
        await tf.nextFrame();
        const { inputs, outputs } = this.#data;
        if (inputs.length == 0) {
            _console$O.log("no data to train on");
            return;
        }
        _console$O.log("train");
        const xs = tf.tensor2d(inputs);
        const ys = tf.tidy(() => {
            const ys = tf.tensor2d(outputs);
            const minYs = ys.min();
            const maxYs = ys.max();
            return ys.sub(minYs).div(maxYs.sub(minYs));
        });
        const epochs = 64;
        const batchSize = 32;
        this.#isTrained = false;
        this.dispatchEvent("pressureCalibrationTrainStart", {
            epochs,
            batchSize,
        });
        this.#isTraining = true;
        try {
            await this.#model.fit(xs, ys, {
                epochs,
                batchSize,
                shuffle: true,
                callbacks: {
                    onTrainBegin: (logs) => {
                        _console$O.log("onTrainBegin", logs);
                    },
                    onTrainEnd: (logs) => {
                        _console$O.log("onTrainEnd", logs);
                    },
                    onEpochBegin: (epoch, logs) => {
                    },
                    onEpochEnd: (epoch, logs) => {
                        const { loss } = logs;
                        _console$O.log("onEpochEnd", { epoch, loss }, logs);
                        this.dispatchEvent("pressureCalibrationTrainProgress", {
                            pressureCalibrationTrainProgress: (epoch + 1) / epochs,
                            epoch,
                            epochs,
                            batchSize,
                            loss,
                        });
                    },
                    onBatchBegin: (batch, logs) => {
                    },
                    onBatchEnd: (batch, logs) => {
                        const { size, loss } = logs;
                    },
                    onYield: (epoch, batch, logs) => {
                        _console$O.log("onYield", { epoch, batch }, logs);
                    },
                },
            });
        }
        catch (error) {
            _console$O.error("error training", error);
        }
        xs.dispose();
        ys.dispose();
        this.#isTraining = false;
        _console$O.log("finished training");
        this.#onTrainedModel();
    }
    #onTrainedModel(wasLoaded = false) {
        this.#isTrained = true;
        this.dispatchEvent("calibratedPressureModel", {
            model: this.#model,
            wasLoaded,
        });
    }
    predict(pressureData) {
        if (!isTensorFlowAvailable()) {
            return;
        }
        if (!this.#model) {
            _console$O.log("no model defined");
            return;
        }
        if (!this.#isTrained) {
            return;
        }
        const inputs = this.#getInputs(pressureData);
        _console$O.log("predict", inputs);
        const input = tf.tensor2d([inputs]);
        const prediction = this.#model.predict(input);
        const [x, y] = prediction.dataSync().map((value) => clamp(value, 0, 1));
        _console$O.log({ x, y });
        input.dispose();
        prediction.dispose();
        return { x, y };
    }
    async saveModel(handlerOrURL, config) {
        if (!isTensorFlowAvailable()) {
            return false;
        }
        await tf.ready();
        if (!this.model) {
            _console$O.error("model not found");
            return false;
        }
        if (!this.isTrained) {
            _console$O.error("model not trained");
            return false;
        }
        try {
            await this.model.save(handlerOrURL, config);
        }
        catch (error) {
            _console$O.error("failed to save model", error);
            return false;
        }
        return true;
    }
    async loadModel(pathOrIOHandlerOrFileList, options) {
        if (!isTensorFlowAvailable()) {
            return false;
        }
        await tf.ready();
        if (!this.model) {
            _console$O.error("model not found");
            return false;
        }
        let pathOrIOHandler;
        if (pathOrIOHandlerOrFileList instanceof FileList) {
            const fileList = Array.from(pathOrIOHandlerOrFileList);
            const jsonFile = fileList.find((f) => f.name.endsWith(".json"));
            const weightsFile = fileList.find((f) => f.name.endsWith(".bin"));
            if (!jsonFile) {
                _console$O.error("no model.json found");
                return false;
            }
            if (!weightsFile) {
                _console$O.error("no weights.bin found");
                return false;
            }
            pathOrIOHandler = tf.io.browserFiles([jsonFile, weightsFile]);
        }
        else {
            pathOrIOHandler = pathOrIOHandlerOrFileList;
        }
        let loadedModel;
        try {
            loadedModel = await tf.loadLayersModel(pathOrIOHandler, options);
            _console$O.log("loadedModel", loadedModel);
            if (this.model.layers.length != loadedModel.layers.length) {
                throw Error("layer count mismatch");
            }
            for (let i = 0; i < this.model.layers.length; i++) {
                const weights = this.model.layers[i].getWeights();
                const loadedWeights = loadedModel.layers[i].getWeights();
                if (weights.length != loadedWeights.length) {
                    throw Error(`weight count mismatch in layer ${i} (${this.model.layers[i].name})`);
                }
                for (let j = 0; j < weights.length; j++) {
                    const shapeA = weights[j].shape;
                    const shapeB = loadedWeights[j].shape;
                    if (!shapeA.every((v, idx) => v === shapeB[idx])) {
                        throw Error(`weight shape mismatch in layer ${i} weight ${j}`);
                    }
                }
            }
            this.model.setWeights(loadedModel.getWeights());
            _console$O.log("weights successfully loaded into model");
            this.#onTrainedModel(true);
        }
        catch (error) {
            _console$O.error("error loading model", error);
            loadedModel?.dispose();
            return false;
        }
        finally {
            loadedModel?.dispose();
        }
        return true;
    }
}

const _console$N = createConsole("PressureSensorDataManager", { log: false });
const PressureSensorTypes = ["pressure"];
const ContinuousPressureSensorTypes = PressureSensorTypes;
const PressureSensorEventTypes = [
    "pressureAutoRangeEnabled",
    "pressureAutoRangeDisabled",
    "pressureAutoRange",
    "pressureMotionAutoRangeEnabled",
    "pressureMotionAutoRangeDisabled",
    "pressureMotionAutoRange",
    "isRecordingPressureCalibrationData",
    "pressureCalibrationDataRecordStart",
    "pressureCalibrationDataRecordStop",
    "pressureCalibrationDataRecordingProgress",
    "isTrainingPressureCalibration",
    "pressureCalibrationTrainStart",
    "pressureCalibrationTrainEnd",
    "pressureCalibrationTrainProgress",
    "calibratedPressureModel",
];
class PressureSensorDataManager {
    constructor() {
        autoBind$1(this);
    }
    #eventDispatcher;
    get eventDispatcher() {
        return this.#eventDispatcher;
    }
    set eventDispatcher(eventDispatcher) {
        if (this.#eventDispatcher == eventDispatcher) {
            return;
        }
        _console$N.assertWithError(!this.#eventDispatcher, "eventDispatcher already defined");
        this.#eventDispatcher = eventDispatcher;
        this.#centerOfPressureModel.eventDispatcher =
            eventDispatcher;
    }
    get dispatchEvent() {
        return this.eventDispatcher.dispatchEvent;
    }
    #positions = [];
    get positions() {
        return this.#positions;
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
        _console$N.log({ positions });
        this.#positions = positions;
        this.#centerOfPressureModel.numberOfSensors = this.numberOfSensors;
        this.#sensorRangeHelpers = createArray(this.numberOfSensors, () => new RangeHelper());
        this.resetRange();
    }
    #sensorRangeHelpers;
    #normalizedSumRangeHelper = new RangeHelper();
    #centerOfPressureHelper = new CenterOfPressureHelper();
    resetRange() {
        this.stopRecordingCalibrationData();
        this.#sensorRangeHelpers?.forEach((rangeHelper) => rangeHelper.reset());
        this.#centerOfPressureHelper.reset();
        this.#normalizedSumRangeHelper.reset();
        Object.assign(this.#euler, defaultEuler);
        this.#eulerCenterOfPressureRangeHelper.reset();
    }
    #autoRange = true;
    get autoRange() {
        return this.#autoRange;
    }
    setAutoRange(newAutoRange) {
        if (this.#autoRange == newAutoRange) {
            return;
        }
        this.#autoRange = newAutoRange;
        _console$N.log({ autoRange: this.autoRange });
        this.dispatchEvent("pressureAutoRange", {
            pressureAutoRange: this.autoRange,
        });
        if (this.autoRange) {
            this.dispatchEvent("pressureAutoRangeEnabled", {});
        }
        else {
            this.dispatchEvent("pressureAutoRangeDisabled", {});
        }
    }
    toggleAutoRange() {
        this.setAutoRange(!this.autoRange);
    }
    #motionAutoRange = false;
    get motionAutoRange() {
        return this.#motionAutoRange;
    }
    setMotionAutoRange(newMotionAutoRange) {
        if (this.#motionAutoRange == newMotionAutoRange) {
            return;
        }
        this.#motionAutoRange = newMotionAutoRange;
        _console$N.log({ motionAutoRange: this.motionAutoRange });
        this.dispatchEvent("pressureMotionAutoRange", {
            pressureMotionAutoRange: this.motionAutoRange,
        });
        if (this.motionAutoRange) {
            this.dispatchEvent("pressureMotionAutoRangeEnabled", {});
        }
        else {
            this.dispatchEvent("pressureMotionAutoRangeDisabled", {});
        }
    }
    toggleMotionAutoRange() {
        this.setMotionAutoRange(!this.motionAutoRange);
    }
    #euler = structuredClone(defaultEuler);
    #eulerTimestamp = 0;
    #eulerCenterOfPressureRangeHelper = new CenterOfPressureHelper();
    onEuler(euler, timestamp) {
        Object.assign(this.#euler, euler);
        this.#eulerTimestamp = timestamp;
    }
    #centerOfPressureModel = new CenterOfPressureModel();
    get calibrationModel() {
        return this.#centerOfPressureModel.model;
    }
    get isCalibrationModelTrained() {
        return this.#centerOfPressureModel.isTrained;
    }
    get isTrainingCalibrationModel() {
        return this.#centerOfPressureModel.isTraining;
    }
    get addCalibrationModelData() {
        return this.#centerOfPressureModel.addData;
    }
    get clearCalibrationModelData() {
        return this.#centerOfPressureModel.clearData;
    }
    get calibrationModelData() {
        return this.#centerOfPressureModel.data;
    }
    saveCalibrationModel(handlerOrURL, config) {
        return this.#centerOfPressureModel.saveModel(handlerOrURL, config);
    }
    loadCalibrationModel(pathOrIOHandlerOrFileList, options) {
        return this.#centerOfPressureModel.loadModel(pathOrIOHandlerOrFileList, options);
    }
    #isRecordingCalibrationData = false;
    get isRecordingCalibrationData() {
        return this.#isRecordingCalibrationData;
    }
    #setIsRecordingCalibrationData(newIsRecordingCalibrationData) {
        if (this.#isRecordingCalibrationData == newIsRecordingCalibrationData) {
            return;
        }
        this.#isRecordingCalibrationData = newIsRecordingCalibrationData;
        _console$N.log({
            isRecordingCalibrationData: this.isRecordingCalibrationData,
        });
        this.dispatchEvent("isRecordingPressureCalibrationData", {
            isRecordingPressureCalibrationData: this.isRecordingCalibrationData,
        });
        if (this.isRecordingCalibrationData) {
            this.dispatchEvent("pressureCalibrationDataRecordStart", {});
        }
        else {
            this.dispatchEvent("pressureCalibrationDataRecordStop", {});
        }
    }
    get canCalibrate() {
        return isTensorFlowAvailable();
    }
    startRecordingCalibrationData() {
        if (!this.canCalibrate) {
            _console$N.error("cannot calibrate pressure - tensorflow is not available");
            return;
        }
        this.#setIsRecordingCalibrationData(true);
    }
    stopRecordingCalibrationData() {
        this.#setIsRecordingCalibrationData(false);
    }
    toggleRecordingCalibrationData() {
        if (this.isRecordingCalibrationData) {
            this.stopRecordingCalibrationData();
        }
        else {
            this.startRecordingCalibrationData();
        }
    }
    async train() {
        if (this.isRecordingCalibrationData) {
            this.stopRecordingCalibrationData();
        }
        await this.#centerOfPressureModel.train();
    }
    #scaledSumThreshold = 0.05;
    parseData(dataView, scalar, timestamp) {
        const pressureData = {
            sensors: [],
            scaledSum: 0,
            normalizedSum: 0,
        };
        for (let index = 0, byteOffset = 0; byteOffset < dataView.byteLength; index++, byteOffset += 2) {
            const rawValue = dataView.getUint16(byteOffset, true);
            const scaledValue = (rawValue * scalar) / this.numberOfSensors;
            const rangeHelper = this.#sensorRangeHelpers[index];
            if (this.autoRange) {
                rangeHelper.update(scaledValue);
            }
            const normalizedValue = rangeHelper.getNormalization(scaledValue);
            const truncatedScaledValue = scaledValue - rangeHelper.min;
            const position = this.positions[index];
            pressureData.sensors[index] = {
                rawValue,
                scaledValue,
                truncatedScaledValue,
                normalizedValue,
                position,
                weightedValue: 0,
            };
            pressureData.scaledSum += truncatedScaledValue;
        }
        if (this.autoRange) {
            this.#normalizedSumRangeHelper.update(pressureData.scaledSum);
        }
        pressureData.normalizedSum =
            this.#normalizedSumRangeHelper.getNormalization(pressureData.scaledSum);
        const isPressureAboveThreshold = pressureData.scaledSum > this.#scaledSumThreshold;
        const hasEuler = this.#euler && Math.abs(timestamp - this.#eulerTimestamp) < 100;
        if (hasEuler) {
            if (isPressureAboveThreshold) {
                if (this.motionAutoRange) {
                    this.#eulerCenterOfPressureRangeHelper.update({
                        x: -this.#euler.roll,
                        y: -this.#euler.pitch,
                    });
                }
                if (this.#eulerCenterOfPressureRangeHelper.updatedAtLeastOnce) {
                    pressureData.motionCenter =
                        this.#eulerCenterOfPressureRangeHelper.getNormalization({
                            x: -this.#euler.roll,
                            y: -this.#euler.pitch,
                        });
                }
            }
        }
        if (isPressureAboveThreshold) {
            pressureData.center = { x: 0, y: 0 };
            pressureData.sensors.forEach((sensor) => {
                sensor.weightedValue =
                    sensor.truncatedScaledValue / pressureData.scaledSum;
                pressureData.center.x += sensor.position.x * sensor.weightedValue;
                pressureData.center.y += sensor.position.y * sensor.weightedValue;
            });
            if (this.autoRange) {
                this.#centerOfPressureHelper.update(pressureData.center);
            }
            pressureData.normalizedCenter =
                this.#centerOfPressureHelper.getNormalization(pressureData.center);
        }
        if (this.isRecordingCalibrationData &&
            hasEuler &&
            isPressureAboveThreshold) {
            this.#centerOfPressureModel.onSensorData(pressureData, this.#euler);
        }
        if (isPressureAboveThreshold &&
            !this.isRecordingCalibrationData &&
            !this.isTrainingCalibrationModel) {
            pressureData.calibratedCenter =
                this.#centerOfPressureModel.predict(pressureData);
        }
        return pressureData;
    }
}

const _console$M = createConsole("MotionSensorDataManager", { log: false });
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
    "tapDetector",
];
const ContinuousMotionTypes = [
    "acceleration",
    "gravity",
    "linearAcceleration",
    "gyroscope",
    "magnetometer",
    "gameRotation",
    "rotation",
    "orientation",
];
const ActivityTypes = [
    "still",
    "walking",
    "running",
    "bicycle",
    "vehicle",
    "tilting",
];
const DeviceOrientations = [
    "portraitUpright",
    "landscapeLeft",
    "portraitUpsideDown",
    "landscapeRight",
    "unknown",
];
class MotionSensorDataManager {
    parseVector3(dataView, scalar) {
        let [x, y, z] = [
            dataView.getInt16(0, true),
            dataView.getInt16(2, true),
            dataView.getInt16(4, true),
        ].map((value) => value * scalar);
        const vector = { x, y, z };
        _console$M.log({ vector });
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
        _console$M.log({ quaternion });
        return quaternion;
    }
    #euler = new Euler(0, 0, 0, "YXZ");
    #quaternion = new Quaternion();
    quaternionToEuler(quaternion, absolute) {
        this.#quaternion.copy(quaternion);
        this.#euler.setFromQuaternion(this.#quaternion);
        const { x, y, z } = this.#euler;
        return {
            heading: radToDeg(y),
            pitch: radToDeg(x),
            roll: radToDeg(z),
            absolute,
        };
    }
    parseEuler(dataView, scalar, absolute) {
        let [heading, pitch, roll] = [
            dataView.getInt16(0, true),
            dataView.getInt16(2, true),
            dataView.getInt16(4, true),
        ].map((value) => value * scalar);
        pitch *= -1;
        heading *= -1;
        if (heading < -180) {
            heading += 360;
        }
        const euler = { heading, pitch, roll, absolute };
        _console$M.log({ euler });
        return euler;
    }
    parseStepCounter(dataView) {
        _console$M.log("parseStepCounter", dataView);
        const stepCount = dataView.getUint32(0, true);
        _console$M.log({ stepCount });
        return stepCount;
    }
    parseActivity(dataView) {
        _console$M.log("parseActivity", dataView);
        const activity = {};
        const activityBitfield = dataView.getUint8(0);
        _console$M.log("activityBitfield", activityBitfield.toString(2));
        ActivityTypes.forEach((activityType, index) => {
            activity[activityType] = Boolean(activityBitfield & (1 << index));
        });
        _console$M.log("activity", activity);
        return activity;
    }
    parseDeviceOrientation(dataView) {
        _console$M.log("parseDeviceOrientation", dataView);
        const index = dataView.getUint8(0);
        const deviceOrientation = DeviceOrientations[index];
        _console$M.assertWithError(deviceOrientation, "undefined deviceOrientation");
        _console$M.log({ deviceOrientation });
        return deviceOrientation;
    }
}

const BarometerSensorTypes = ["barometer"];
const ContinuousBarometerSensorTypes = BarometerSensorTypes;
const _console$L = createConsole("BarometerSensorDataManager", { log: false });
class BarometerSensorDataManager {
    #calculcateAltitude(pressure) {
        const P0 = 101325;
        const T0 = 288.15;
        const L = 0.0065;
        const R = 8.3144598;
        const g = 9.80665;
        const M = 0.0289644;
        const exponent = (R * L) / (g * M);
        const h = (T0 / L) * (1 - Math.pow(pressure / P0, exponent));
        return h;
    }
    parseData(dataView, scalar) {
        const pressure = dataView.getUint32(0, true) * scalar;
        const altitude = this.#calculcateAltitude(pressure);
        _console$L.log({ pressure, altitude });
        return { pressure };
    }
}

const _console$K = createConsole("ParseUtils", { log: false });
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
        _console$K.assertWithError(messageTypeEnum in messageTypes, `invalid messageTypeEnum ${messageTypeEnum}`);
        const messageType = messageTypes[messageTypeEnum];
        let messageLength;
        if (parseMessageLengthAsUint16) {
            messageLength = dataView.getUint16(byteOffset, true);
            byteOffset += 2;
        }
        else {
            messageLength = dataView.getUint8(byteOffset++);
        }
        _console$K.log({
            messageTypeEnum,
            messageType,
            messageLength,
            dataView,
            byteOffset,
        });
        const _dataView = sliceDataView(dataView, byteOffset, messageLength);
        _console$K.log({ _dataView });
        byteOffset += messageLength;
        const isLast = byteOffset >= dataView.byteLength;
        callback(messageType, _dataView, context, isLast);
    }
}

const ButtonSensorTypes = ["buttons"];
const ButtonSensorEventTypes = [
    "numberOfButtons",
    "button",
    "buttonDown",
    "buttonUp",
];
const _console$J = createConsole("ButtonSensorDataManager", { log: false });
class ButtonSensorDataManager {
    constructor() {
        autoBind$1(this);
    }
    #eventDispatcher;
    get eventDispatcher() {
        return this.#eventDispatcher;
    }
    set eventDispatcher(eventDispatcher) {
        if (this.#eventDispatcher == eventDispatcher) {
            return;
        }
        _console$J.assertWithError(!this.#eventDispatcher, "eventDispatcher already defined");
        this.#eventDispatcher = eventDispatcher;
    }
    get dispatchEvent() {
        return this.eventDispatcher.dispatchEvent;
    }
    parseData(dataView) {
        const buttons = [];
        let offset = 0;
        while (offset < dataView.byteLength) {
            const index = dataView.getUint8(offset++);
            const value = dataView.getUint8(offset++);
            const isDown = value > 0;
            const button = { index, isDown, value };
            _console$J.log("button", button);
            buttons.push(button);
        }
        buttons.forEach((button) => {
            _console$J.assertRangeWithError("button.index", button.index, 0, this.numberOfButtons - 1);
            this.dispatchEvent("button", { button });
            const internalButton = this.buttons[button.index];
            if (button.isDown) {
                internalButton.lastTimeDown = Date.now();
                this.dispatchEvent("buttonDown", { button });
            }
            else {
                let duration = 0;
                if (internalButton.lastTimeDown != undefined) {
                    duration = Date.now() - internalButton.lastTimeDown;
                }
                this.dispatchEvent("buttonUp", { button, duration });
            }
        });
        return buttons;
    }
    #numberOfButtons = 0;
    get numberOfButtons() {
        return this.#numberOfButtons;
    }
    set numberOfButtons(newNumberOfButtons) {
        this.#numberOfButtons = newNumberOfButtons;
        _console$J.log({ numberOfButtons: this.numberOfButtons });
        this.buttons = Array.from({ length: this.numberOfButtons }, (_, index) => ({
            index,
            value: 0,
            isDown: false,
        }));
        this.dispatchEvent("numberOfButtons", {
            numberOfButtons: this.numberOfButtons,
        });
    }
    buttons = [];
    clear() {
        _console$J.log("clear");
    }
}

const TouchSensorTypes = ["touches"];
const TouchSensorEventTypes = [
    "numberOfTouches",
    "touch",
    "touchDown",
    "touchUp",
];
const _console$I = createConsole("TouchSensorDataManager", { log: false });
class TouchSensorDataManager {
    constructor() {
        autoBind$1(this);
    }
    #eventDispatcher;
    get eventDispatcher() {
        return this.#eventDispatcher;
    }
    set eventDispatcher(eventDispatcher) {
        if (this.#eventDispatcher == eventDispatcher) {
            return;
        }
        _console$I.assertWithError(!this.#eventDispatcher, "eventDispatcher already defined");
        this.#eventDispatcher = eventDispatcher;
    }
    get dispatchEvent() {
        return this.eventDispatcher.dispatchEvent;
    }
    parseData(dataView) {
        const touches = [];
        let offset = 0;
        while (offset < dataView.byteLength) {
            const index = dataView.getUint8(offset++);
            const value = dataView.getUint8(offset++);
            const isDown = value > 0;
            const touch = { index, isDown, value };
            _console$I.log("touch", touch);
            touches.push(touch);
        }
        touches.forEach((touch) => {
            _console$I.assertRangeWithError("touch.index", touch.index, 0, this.numberOfTouches - 1);
            this.dispatchEvent("touch", { touch });
            const internalTouch = this.touches[touch.index];
            if (touch.isDown) {
                internalTouch.lastTimeDown = Date.now();
                this.dispatchEvent("touchDown", { touch });
            }
            else {
                let duration = 0;
                if (internalTouch.lastTimeDown != undefined) {
                    duration = Date.now() - internalTouch.lastTimeDown;
                }
                this.dispatchEvent("touchUp", { touch, duration });
            }
        });
        return touches;
    }
    #numberOfTouches = 0;
    get numberOfTouches() {
        return this.#numberOfTouches;
    }
    set numberOfTouches(newNumberOfTouches) {
        this.#numberOfTouches = newNumberOfTouches;
        _console$I.log({ numberOfTouches: this.numberOfTouches });
        this.touches = Array.from({ length: this.numberOfTouches }, (_, index) => ({
            index,
            value: 0,
            isDown: false,
        }));
        this.dispatchEvent("numberOfTouches", {
            numberOfTouches: this.numberOfTouches,
        });
    }
    touches = [];
    clear() {
        _console$I.log("clear");
    }
}

var _a$5;
const _console$H = createConsole("CameraManager", { log: false });
const CameraSensorTypes = ["camera"];
const CameraCommands = [
    "focus",
    "takePicture",
    "stop",
    "sleep",
    "wake",
];
const CameraStatuses = [
    "idle",
    "focusing",
    "takingPicture",
    "asleep",
];
const CameraDataTypes = [
    "headerSize",
    "header",
    "imageSize",
    "image",
    "footerSize",
    "footer",
];
const CameraConfigurationTypes = [
    "resolution",
    "qualityFactor",
    "shutter",
    "gain",
    "redGain",
    "greenGain",
    "blueGain",
    "autoWhiteBalanceEnabled",
    "autoGainEnabled",
    "exposure",
    "autoExposureEnabled",
    "autoExposureLevel",
    "brightness",
    "saturation",
    "contrast",
    "sharpness",
];
const CameraMessageTypes = [
    "cameraStatus",
    "cameraCommand",
    "getCameraConfiguration",
    "setCameraConfiguration",
    "cameraData",
];
const RequiredCameraMessageTypes = [
    "getCameraConfiguration",
    "cameraStatus",
];
const CameraEventTypes = [
    ...CameraMessageTypes,
    "cameraImageProgress",
    "cameraImage",
    "isRecordingCamera",
    "startRecordingCamera",
    "stopRecordingCamera",
    "cameraRecording",
    "autoPicture",
];
class CameraManager {
    constructor() {
        autoBind$1(this);
    }
    sendMessage;
    eventDispatcher;
    get #dispatchEvent() {
        return this.eventDispatcher.dispatchEvent;
    }
    get waitForEvent() {
        return this.eventDispatcher.waitForEvent;
    }
    requestRequiredInformation(sendImmediately) {
        _console$H.log("requesting required camera information");
        const messages = RequiredCameraMessageTypes.map((messageType) => ({
            type: messageType,
        }));
        this.sendMessage(messages, sendImmediately);
    }
    #cameraStatus;
    get cameraStatus() {
        return this.#cameraStatus;
    }
    #parseCameraStatus(dataView) {
        const cameraStatusIndex = dataView.getUint8(0);
        const newCameraStatus = CameraStatuses[cameraStatusIndex];
        this.#updateCameraStatus(newCameraStatus);
    }
    #latestTakingPictureTimestamp = 0;
    #updateCameraStatus(newCameraStatus) {
        _console$H.assertEnumWithError(newCameraStatus, CameraStatuses);
        if (newCameraStatus == this.#cameraStatus) {
            _console$H.log(`redundant cameraStatus ${newCameraStatus}`);
            return;
        }
        const previousCameraStatus = this.#cameraStatus;
        this.#cameraStatus = newCameraStatus;
        _console$H.log(`updated cameraStatus to "${this.cameraStatus}"`);
        this.#dispatchEvent("cameraStatus", {
            cameraStatus: this.cameraStatus,
            previousCameraStatus,
        });
        if (this.cameraStatus == "takingPicture") {
            this.#latestTakingPictureTimestamp = Date.now();
        }
        if (this.#cameraStatus != "takingPicture" &&
            this.#imageProgress > 0 &&
            !this.#didBuildImage) {
            this.#buildImage();
        }
    }
    async #sendCameraCommand(command, sendImmediately) {
        _console$H.assertEnumWithError(command, CameraCommands);
        _console$H.log(`sending camera command "${command}"`);
        const promise = this.waitForEvent("cameraStatus");
        _console$H.log(`setting command "${command}"`);
        const commandEnum = CameraCommands.indexOf(command);
        this.sendMessage([
            {
                type: "cameraCommand",
                data: UInt8ByteBuffer(commandEnum),
            },
        ], sendImmediately);
        await promise;
    }
    #assertIsAsleep() {
        _console$H.assertWithError(this.#cameraStatus == "asleep", `camera is not asleep - currently ${this.#cameraStatus}`);
    }
    #assertIsAwake() {
        _console$H.assertWithError(this.#cameraStatus != "asleep", `camera is not awake - currently ${this.#cameraStatus}`);
    }
    async focus() {
        this.#assertIsAwake();
        await this.#sendCameraCommand("focus");
    }
    async takePicture() {
        this.#assertIsAwake();
        await this.#sendCameraCommand("takePicture");
    }
    async stop() {
        this.#assertIsAwake();
        await this.#sendCameraCommand("stop");
    }
    async sleep() {
        this.#assertIsAwake();
        await this.#sendCameraCommand("sleep");
    }
    async wake() {
        this.#assertIsAsleep();
        await this.#sendCameraCommand("wake");
    }
    #sensorRate = 0;
    get sensorRate() {
        return this.#sensorRate;
    }
    set sensorRate(newSensorRate) {
        if (this.#sensorRate == newSensorRate) {
            return;
        }
        this.#sensorRate = newSensorRate;
        _console$H.log({ sensorRate: this.sensorRate });
    }
    #parseCameraData(dataView) {
        _console$H.log("parsing camera data", dataView);
        parseMessage(dataView, CameraDataTypes, this.#onCameraData.bind(this), null, true);
    }
    #buildImageTimeout;
    #clearBuildImageTimeout() {
        if (this.#buildImageTimeout == undefined) {
            return;
        }
        _console$H.log("clearBuildImageTimeout", this.#buildImageTimeout);
        clearTimeout(this.#buildImageTimeout);
        this.#buildImageTimeout = undefined;
    }
    #setBuildImageTimeout() {
        this.#clearBuildImageTimeout();
        if (this.sensorRate == 0) {
            return;
        }
        const timeoutInterval = Math.max(4 * this.sensorRate, 300);
        _console$H.log("setBuildImageTimeout", {
            timeoutInterval,
        });
        const now = Date.now();
        this.#buildImageTimeout = setTimeout(() => {
            const _now = Date.now();
            _console$H.log("buildImageTimeout triggered", {
                now: _now,
                span: _now - now,
            });
            this.#buildImage();
            this.#buildImageTimeout = undefined;
        }, timeoutInterval);
    }
    #onCameraData(cameraDataType, dataView) {
        _console$H.log({ cameraDataType, dataView });
        this.#clearBuildImageTimeout();
        switch (cameraDataType) {
            case "headerSize":
                this.#headerSize = dataView.getUint16(0, true);
                _console$H.log({ headerSize: this.#headerSize });
                this.#headerData = undefined;
                this.#headerProgress == 0;
                break;
            case "header":
                this.#headerData = concatenateArrayBuffers(this.#headerData, dataView);
                _console$H.log({ headerData: this.#headerData });
                this.#headerProgress = this.#headerData?.byteLength / this.#headerSize;
                _console$H.log({ headerProgress: this.#headerProgress });
                this.#dispatchEvent("cameraImageProgress", {
                    progress: this.#headerProgress,
                    type: "header",
                });
                if (this.#headerProgress == 1) {
                    _console$H.log("finished getting header data");
                }
                break;
            case "imageSize":
                this.#imageSize = dataView.getUint32(0, true);
                _console$H.log({ imageSize: this.#imageSize });
                this.#imageData = undefined;
                this.#imageProgress == 0;
                this.#didBuildImage = false;
                break;
            case "image":
                this.#imageData = concatenateArrayBuffers(this.#imageData, dataView);
                _console$H.log({ imageData: this.#imageData });
                this.#imageProgress = this.#imageData?.byteLength / this.#imageSize;
                _console$H.log({ imageProgress: this.#imageProgress });
                this.#dispatchEvent("cameraImageProgress", {
                    progress: this.#imageProgress,
                    type: "image",
                });
                if (this.#imageProgress == 1) {
                    _console$H.log("finished getting image data");
                    if (this.#headerProgress == 1 && this.#footerProgress == 1) {
                        this.#buildImage();
                    }
                }
                else {
                    this.#setBuildImageTimeout();
                }
                break;
            case "footerSize":
                this.#footerSize = dataView.getUint16(0, true);
                _console$H.log({ footerSize: this.#footerSize });
                this.#footerData = undefined;
                this.#footerProgress == 0;
                break;
            case "footer":
                this.#footerData = concatenateArrayBuffers(this.#footerData, dataView);
                _console$H.log({ footerData: this.#footerData });
                this.#footerProgress = this.#footerData?.byteLength / this.#footerSize;
                _console$H.log({ footerProgress: this.#footerProgress });
                this.#dispatchEvent("cameraImageProgress", {
                    progress: this.#footerProgress,
                    type: "footer",
                });
                if (this.#footerProgress == 1) {
                    _console$H.log("finished getting footer data");
                    if (this.#imageProgress == 1) {
                        this.#buildImage();
                    }
                }
                break;
        }
    }
    #headerSize = 0;
    #headerData;
    #headerProgress = 0;
    #imageSize = 0;
    #imageData;
    #imageProgress = 0;
    #footerSize = 0;
    #footerData;
    #footerProgress = 0;
    #didBuildImage = false;
    #buildImage() {
        _console$H.log("building image...");
        const now = Date.now();
        const timestamp = this.#latestTakingPictureTimestamp;
        const imageData = concatenateArrayBuffers(this.#headerData, this.#imageData, this.#footerData);
        _console$H.log({ imageData });
        this.#didBuildImage = true;
        let blob = new Blob([imageData], { type: "image/jpg" });
        _console$H.log("created blob", blob);
        const url = URL.createObjectURL(blob);
        _console$H.log("created url", url);
        const cameraImage = {
            url,
            blob,
            timestamp,
            latency: now - timestamp,
            arrayBuffer: imageData,
        };
        this.#dispatchEvent("cameraImage", cameraImage);
        if (this.isRecording) {
            this.#cameraRecordingData.push(cameraImage);
            if (isInBrowser) {
                if (this.#recordingImage &&
                    this.#recordingCanvasContext &&
                    this.#recordingCanvas) {
                    const promise = new Promise((resolve) => {
                        this.#recordingImage.onload = () => resolve();
                    });
                    this.#recordingImage.src = cameraImage.url;
                    promise.then(() => {
                        const { width, height } = this.#recordingImage;
                        if (this.#recordingCanvas.width != width) {
                            this.#recordingCanvas.width = width;
                        }
                        if (this.#recordingCanvas.height != height) {
                            this.#recordingCanvas.height = height;
                        }
                        this.#recordingCanvasContext.drawImage(this.#recordingImage, 0, 0, width, height);
                    });
                }
                else {
                    _console$H.error("camera recording failed - recording image/canvas/context not found");
                    this.stopRecording();
                }
            }
        }
        if (this.autoPicture) {
            this.takePicture();
        }
    }
    #buildHeaderCameraData() {
        if (this.#headerSize && this.#headerProgress == 1 && this.#headerData) {
            const headerDataView = new DataView(new ArrayBuffer(8));
            headerDataView.setUint8(0, CameraDataTypes.indexOf("headerSize"));
            headerDataView.setUint16(1, 2, true);
            headerDataView.setUint16(3, this.#headerSize, true);
            headerDataView.setUint8(5, CameraDataTypes.indexOf("header"));
            headerDataView.setUint16(6, this.#headerSize, true);
            return concatenateArrayBuffers(headerDataView, this.#headerData);
        }
    }
    #buildFooterCameraData() {
        if (this.#footerSize && this.#footerProgress == 1 && this.#footerData) {
            const footerDataView = new DataView(new ArrayBuffer(8));
            footerDataView.setUint8(0, CameraDataTypes.indexOf("footerSize"));
            footerDataView.setUint16(1, 2, true);
            footerDataView.setUint16(3, this.#footerSize, true);
            footerDataView.setUint8(5, CameraDataTypes.indexOf("footer"));
            footerDataView.setUint16(6, this.#footerSize, true);
            return concatenateArrayBuffers(footerDataView, this.#footerData);
        }
    }
    buildCameraData() {
        const cameraData = [
            this.#buildHeaderCameraData(),
            this.#buildFooterCameraData(),
        ];
        return concatenateArrayBuffers(cameraData);
    }
    #cameraConfiguration = {};
    get cameraConfiguration() {
        return this.#cameraConfiguration;
    }
    #availableCameraConfigurationTypes;
    get availableCameraConfigurationTypes() {
        return this.#availableCameraConfigurationTypes;
    }
    #cameraConfigurationRanges = {
        resolution: { min: 96, max: 2560 },
        qualityFactor: { min: 0, max: 100 },
        shutter: { min: 4, max: 16383 },
        gain: { min: 0, max: 248 },
        redGain: { min: 0, max: 2047 },
        greenGain: { min: 0, max: 2047 },
        blueGain: { min: 0, max: 2047 },
        autoWhiteBalanceEnabled: { min: 0, max: 1 },
        autoGainEnabled: { min: 0, max: 1 },
        exposure: { min: 0, max: 1200 },
        autoExposureEnabled: { min: 0, max: 1 },
        autoExposureLevel: { min: -4, max: 4 },
        brightness: { min: -3, max: 3 },
        saturation: { min: -4, max: 4 },
        contrast: { min: -3, max: 3 },
        sharpness: { min: -3, max: 3 },
    };
    get cameraConfigurationRanges() {
        return this.#cameraConfigurationRanges;
    }
    #parseCameraConfiguration(dataView) {
        const parsedCameraConfiguration = {};
        let byteOffset = 0;
        const size = 2;
        while (byteOffset < dataView.byteLength) {
            const cameraConfigurationTypeIndex = dataView.getUint8(byteOffset++);
            const cameraConfigurationType = CameraConfigurationTypes[cameraConfigurationTypeIndex];
            _console$H.assertWithError(cameraConfigurationType, `invalid cameraConfigurationTypeIndex ${cameraConfigurationTypeIndex}`);
            _console$H.log({ cameraConfigurationType });
            let value;
            switch (cameraConfigurationType) {
                case "autoExposureLevel":
                case "brightness":
                case "saturation":
                case "contrast":
                case "sharpness":
                    value = dataView.getInt16(byteOffset, true);
                    break;
                default:
                    value = dataView.getUint16(byteOffset, true);
                    break;
            }
            _console$H.log({ [cameraConfigurationType]: value });
            _console$H.assertTypeWithError(value, "number");
            parsedCameraConfiguration[cameraConfigurationType] = value;
            byteOffset += size;
        }
        _console$H.log({ parsedCameraConfiguration });
        this.#availableCameraConfigurationTypes = Object.keys(parsedCameraConfiguration);
        this.#cameraConfiguration = parsedCameraConfiguration;
        this.#dispatchEvent("getCameraConfiguration", {
            cameraConfiguration: this.#cameraConfiguration,
        });
    }
    #isCameraConfigurationRedundant(cameraConfiguration) {
        let cameraConfigurationTypes = Object.keys(cameraConfiguration);
        return cameraConfigurationTypes.every((cameraConfigurationType) => {
            return (this.cameraConfiguration[cameraConfigurationType] ==
                cameraConfiguration[cameraConfigurationType]);
        });
    }
    async setCameraConfiguration(newCameraConfiguration, sendImmediately) {
        _console$H.log({ newCameraConfiguration });
        if (this.#isCameraConfigurationRedundant(newCameraConfiguration)) {
            _console$H.log("redundant camera configuration");
            return;
        }
        const setCameraConfigurationData = this.#createData(newCameraConfiguration);
        _console$H.log({ setCameraConfigurationData });
        const promise = this.waitForEvent("getCameraConfiguration");
        this.sendMessage([
            {
                type: "setCameraConfiguration",
                data: setCameraConfigurationData.buffer,
            },
        ], sendImmediately);
        await promise;
    }
    #assertAvailableCameraConfigurationType(cameraConfigurationType) {
        _console$H.assertWithError(this.#availableCameraConfigurationTypes, "must get initial cameraConfiguration");
        const isCameraConfigurationTypeAvailable = this.#availableCameraConfigurationTypes?.includes(cameraConfigurationType);
        _console$H.assertWithError(isCameraConfigurationTypeAvailable, `unavailable camera configuration type "${cameraConfigurationType}"`);
        return isCameraConfigurationTypeAvailable;
    }
    static AssertValidCameraConfigurationType(cameraConfigurationType) {
        _console$H.assertEnumWithError(cameraConfigurationType, CameraConfigurationTypes);
    }
    static AssertValidCameraConfigurationTypeEnum(cameraConfigurationTypeEnum) {
        _console$H.assertTypeWithError(cameraConfigurationTypeEnum, "number");
        _console$H.assertWithError(cameraConfigurationTypeEnum in CameraConfigurationTypes, `invalid cameraConfigurationTypeEnum ${cameraConfigurationTypeEnum}`);
    }
    #createData(cameraConfiguration) {
        let cameraConfigurationTypes = Object.keys(cameraConfiguration);
        cameraConfigurationTypes = cameraConfigurationTypes.filter((cameraConfigurationType) => this.#assertAvailableCameraConfigurationType(cameraConfigurationType));
        const dataView = new DataView(new ArrayBuffer(cameraConfigurationTypes.length * 3));
        cameraConfigurationTypes.forEach((cameraConfigurationType, index) => {
            _a$5.AssertValidCameraConfigurationType(cameraConfigurationType);
            const cameraConfigurationTypeEnum = CameraConfigurationTypes.indexOf(cameraConfigurationType);
            dataView.setUint8(index * 3, cameraConfigurationTypeEnum);
            const value = cameraConfiguration[cameraConfigurationType];
            const offset = index * 3 + 1;
            switch (cameraConfigurationType) {
                case "autoExposureLevel":
                    dataView.setInt16(offset, value, true);
                    break;
                default:
                    dataView.setUint16(offset, value, true);
                    break;
            }
        });
        _console$H.log({ sensorConfigurationData: dataView });
        return dataView;
    }
    #isRecording = false;
    get isRecording() {
        return this.#isRecording;
    }
    #cameraRecordingData;
    get isRecordingAvailable() {
        return Boolean((isInBrowser && window.MediaRecorder) || isInNode);
    }
    #recordingCanvas;
    #recordingImage;
    #recordingCanvasContext;
    #recordingCanvasStream;
    #recordingMediaRecorder;
    #recordingChunks;
    startRecording(audioStream) {
        if (!this.isRecordingAvailable) {
            _console$H.error("camera recording is not available");
            return;
        }
        if (this.isRecording) {
            _console$H.log("already recording camera");
            return;
        }
        this.#cameraRecordingData = [];
        if (isInBrowser) {
            this.#recordingCanvas =
                this.#recordingCanvas ?? document.createElement("canvas");
            this.#recordingCanvasContext =
                this.#recordingCanvasContext ?? this.#recordingCanvas.getContext("2d");
            this.#recordingImage =
                this.#recordingImage ?? document.createElement("img");
            this.#recordingCanvasStream = this.#recordingCanvas.captureStream(30);
            const mediaStream = audioStream
                ? new MediaStream([
                    ...this.#recordingCanvasStream.getVideoTracks(),
                    ...audioStream.getAudioTracks(),
                ])
                : this.#recordingCanvasStream;
            this.#recordingMediaRecorder = new MediaRecorder(mediaStream, {
                mimeType: "video/webm; codecs=vp9,opus",
            });
            this.#recordingChunks = [];
            this.#recordingMediaRecorder.ondataavailable = (e) => {
                _console$H.log("adding chunk", e.data);
                this.#recordingChunks.push(e.data);
            };
            this.#recordingMediaRecorder.start();
        }
        this.#isRecording = true;
        this.#dispatchEvent("isRecordingCamera", {
            isRecordingCamera: this.isRecording,
        });
        this.#dispatchEvent("startRecordingCamera", {});
    }
    async stopRecording() {
        if (!this.isRecording) {
            _console$H.log("already not recording");
            return;
        }
        if (this.#cameraRecordingData && this.#cameraRecordingData.length > 0) {
            const images = this.#cameraRecordingData;
            if (images.length > 0) {
                const imageFrames = images.map((image, index) => {
                    const isLast = index == images.length - 1;
                    const timeOffset = image.timestamp - images[0].timestamp;
                    const duration = isLast
                        ? 0
                        : images[index + 1].timestamp - images[index].timestamp;
                    return {
                        ...image,
                        timeOffset,
                        duration,
                    };
                });
                if (isInBrowser) {
                    this.#recordingMediaRecorder.onstop = () => {
                        _console$H.log("recordingMediaRecorder onstop");
                        const blob = new Blob(this.#recordingChunks, {
                            type: this.#recordingMediaRecorder?.mimeType,
                        });
                        const url = URL.createObjectURL(blob);
                        this.#dispatchEvent("cameraRecording", {
                            imageFrames,
                            configuration: structuredClone(this.cameraConfiguration),
                            blob,
                            url,
                        });
                        this.#recordingCanvasStream
                            ?.getVideoTracks()
                            .forEach((track) => track.stop());
                    };
                    this.#recordingMediaRecorder?.stop();
                }
                else if (isInNode) {
                    const metadata = await sharp(images[0].arrayBuffer).metadata();
                    const { width, height } = metadata;
                    const fps = 30;
                    const filename = `${new Date()
                        .toLocaleString()
                        .replaceAll("/", "-")}.mp4`;
                    const ffmpeg = spawn("ffmpeg", [
                        "-f",
                        "rawvideo",
                        "-pix_fmt",
                        "rgba",
                        "-s",
                        `${width}x${height}`,
                        "-r",
                        `${fps}`,
                        "-i",
                        "-",
                        "-c:v",
                        "libx264",
                        "-pix_fmt",
                        "yuv420p",
                        "-movflags",
                        "+faststart",
                        filename,
                    ]);
                    for (let i = 0; i < imageFrames.length; i++) {
                        const imageFrame = imageFrames[i];
                        const rawRGBA = await sharp(imageFrame.arrayBuffer, {
                            failOn: "none",
                        })
                            .resize(width, height)
                            .ensureAlpha()
                            .raw()
                            .toBuffer();
                        const frames = Math.max(1, Math.round(Math.max(0, imageFrame.duration) / (1000 / fps)));
                        for (let j = 0; j < frames; j++) {
                            ffmpeg.stdin.write(rawRGBA);
                        }
                    }
                    const promise = new Promise((resolve, reject) => {
                        ffmpeg.on("close", (code) => {
                            if (code === 0)
                                resolve();
                            else
                                reject(new Error(`ffmpeg exited with ${code}`));
                        });
                        ffmpeg.on("error", reject);
                    });
                    ffmpeg.stdin.end();
                    await promise;
                    const videoData = await fs.readFile(filename);
                    const blob = new Blob([videoData], { type: "video/mp4" });
                    const url = URL.createObjectURL(blob);
                    this.#dispatchEvent("cameraRecording", {
                        imageFrames,
                        configuration: structuredClone(this.cameraConfiguration),
                        blob,
                        url,
                    });
                    await fs.unlink(filename);
                }
            }
        }
        this.#isRecording = false;
        this.#cameraRecordingData = undefined;
        this.#dispatchEvent("isRecordingCamera", {
            isRecordingCamera: this.isRecording,
        });
        this.#dispatchEvent("stopRecordingCamera", {});
    }
    toggleRecording(audioStream) {
        if (this.isRecording) {
            this.stopRecording();
        }
        else {
            this.startRecording(audioStream);
        }
    }
    #autoPicture = false;
    get autoPicture() {
        return this.#autoPicture;
    }
    set autoPicture(newAutoPicture) {
        if (this.#autoPicture == newAutoPicture) {
            return;
        }
        this.#autoPicture = newAutoPicture;
        _console$H.log({ autoPicture: this.#autoPicture });
        this.#dispatchEvent("autoPicture", { autoPicture: this.autoPicture });
    }
    parseMessage(messageType, dataView, isSending) {
        _console$H.log({ messageType, isSending }, dataView);
        switch (messageType) {
            case "cameraStatus":
                this.#parseCameraStatus(dataView);
                break;
            case "getCameraConfiguration":
            case "setCameraConfiguration":
                this.#parseCameraConfiguration(dataView);
                break;
            case "cameraData":
                this.#parseCameraData(dataView);
                break;
            case "cameraCommand":
                break;
            default:
                throw Error(`uncaught messageType ${messageType}`);
        }
    }
    clear() {
        this.#cameraStatus = undefined;
        this.#cameraConfiguration = {};
        this.#headerProgress = 0;
        this.#imageProgress = 0;
        this.#footerProgress = 0;
        this.#sensorRate = 0;
        this.#clearBuildImageTimeout();
        if (this.isRecording) {
            this.stopRecording();
        }
    }
}
_a$5 = CameraManager;

createConsole("AudioUtils", { log: false });
function float32ArrayToWav(audioData, sampleRate, numChannels) {
    const wavBuffer = encodeWAV(audioData, sampleRate, numChannels);
    return new Blob([wavBuffer], { type: "audio/wav" });
}
function encodeWAV(interleaved, sampleRate, numChannels) {
    const buffer = new ArrayBuffer(44 + interleaved.length * 2);
    const view = new DataView(buffer);
    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + interleaved.length * 2, true);
    writeString(view, 8, "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, "data");
    view.setUint32(40, interleaved.length * 2, true);
    for (let i = 0; i < interleaved.length; i++) {
        view.setInt16(44 + i * 2, interleaved[i] * 0x7fff, true);
    }
    return buffer;
}
function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

var _a$4;
const alawmulaw = _alawmulaw.default ?? _alawmulaw;
const { mulaw } = alawmulaw;
const _console$G = createConsole("MicrophoneManager", { log: false });
const MicrophoneSensorTypes = ["microphone"];
const MicrophoneCommands = [
    "start",
    "stop",
    "vad",
    "inferencing",
];
const MicrophoneStatuses = [
    "idle",
    "streaming",
    "vad",
    "inferencing",
];
const MicrophoneConfigurationTypes = ["sampleRate", "bitDepth"];
const MicrophoneSampleRates = ["8000", "16000"];
const MicrophoneBitDepths = ["8", "16"];
const MicrophoneMessageTypes = [
    "microphoneStatus",
    "microphoneCommand",
    "getMicrophoneConfiguration",
    "setMicrophoneConfiguration",
    "microphoneData",
];
const MicrophoneConfigurationValues = {
    sampleRate: MicrophoneSampleRates,
    bitDepth: MicrophoneBitDepths,
};
const RequiredMicrophoneMessageTypes = [
    "getMicrophoneConfiguration",
    "microphoneStatus",
];
const MicrophoneEventTypes = [
    ...MicrophoneMessageTypes,
    "isRecordingMicrophone",
    "startRecordingMicrophone",
    "stopRecordingMicrophone",
    "microphoneRecording",
];
class MicrophoneManager {
    constructor() {
        autoBind$1(this);
    }
    sendMessage;
    eventDispatcher;
    get #dispatchEvent() {
        return this.eventDispatcher.dispatchEvent;
    }
    get waitForEvent() {
        return this.eventDispatcher.waitForEvent;
    }
    requestRequiredInformation() {
        _console$G.log("requesting required microphone information");
        const messages = RequiredMicrophoneMessageTypes.map((messageType) => ({
            type: messageType,
        }));
        this.sendMessage(messages, false);
    }
    #microphoneStatus;
    get microphoneStatus() {
        return this.#microphoneStatus;
    }
    #parseMicrophoneStatus(dataView) {
        const microphoneStatusIndex = dataView.getUint8(0);
        const newMicrophoneStatus = MicrophoneStatuses[microphoneStatusIndex];
        this.#updateMicrophoneStatus(newMicrophoneStatus);
    }
    #updateMicrophoneStatus(newMicrophoneStatus) {
        _console$G.assertEnumWithError(newMicrophoneStatus, MicrophoneStatuses);
        if (newMicrophoneStatus == this.#microphoneStatus) {
            _console$G.log(`redundant microphoneStatus ${newMicrophoneStatus}`);
            return;
        }
        const previousMicrophoneStatus = this.#microphoneStatus;
        this.#microphoneStatus = newMicrophoneStatus;
        _console$G.log(`updated microphoneStatus to "${this.microphoneStatus}"`);
        this.#dispatchEvent("microphoneStatus", {
            microphoneStatus: this.microphoneStatus,
            previousMicrophoneStatus,
        });
    }
    async #sendMicrophoneCommand(command, sendImmediately) {
        _console$G.assertEnumWithError(command, MicrophoneCommands);
        _console$G.log(`sending microphone command "${command}"`);
        const promise = this.waitForEvent("microphoneStatus");
        _console$G.log(`setting command "${command}"`);
        const commandEnum = MicrophoneCommands.indexOf(command);
        this.sendMessage([
            {
                type: "microphoneCommand",
                data: UInt8ByteBuffer(commandEnum),
            },
        ], sendImmediately);
        await promise;
    }
    #assertIsIdle() {
        _console$G.assertWithError(this.#microphoneStatus == "idle", `microphone is not idle - currently ${this.#microphoneStatus}`);
    }
    #assertIsNotIdle() {
        _console$G.assertWithError(this.#microphoneStatus != "idle", `microphone is idle`);
    }
    #assertIsStreaming() {
        _console$G.assertWithError(this.#microphoneStatus == "streaming", `microphone is not recording - currently ${this.#microphoneStatus}`);
    }
    async start() {
        await this.#sendMicrophoneCommand("start");
    }
    async stop() {
        if (this.microphoneStatus == "idle") {
            _console$G.log("microphone is already idle");
            return;
        }
        await this.#sendMicrophoneCommand("stop");
    }
    async vad() {
        await this.#sendMicrophoneCommand("vad");
    }
    async toggle() {
        switch (this.microphoneStatus) {
            case "idle":
                this.start();
                break;
            case "streaming":
                this.stop();
                break;
        }
    }
    #assertValidBitDepth() {
        _console$G.assertEnumWithError(this.bitDepth, MicrophoneBitDepths);
    }
    #fadeDuration = 0.01;
    #playbackTime = 0;
    #parseMicrophoneData(dataView) {
        this.#assertValidBitDepth();
        _console$G.log("parsing microphone data", dataView);
        const numberOfSamples = dataView.byteLength / this.#bytesPerSample;
        const samples = new Float32Array(numberOfSamples);
        for (let i = 0; i < numberOfSamples; i++) {
            let sample;
            switch (this.bitDepth) {
                case "16":
                    sample = dataView.getInt16(i * 2, true);
                    samples[i] = sample / 2 ** 15;
                    break;
                case "8":
                    {
                        sample = dataView.getUint8(i);
                        sample = mulaw.decodeSample(sample);
                        sample = sample / 2 ** 15;
                    }
                    samples[i] = sample;
                    break;
            }
        }
        _console$G.log("samples", samples);
        if (this.#isRecording && this.#microphoneRecordingData) {
            this.#microphoneRecordingData.push(samples);
        }
        if (this.#audioContext) {
            if (this.#gainNode) {
                const audioBuffer = this.#audioContext.createBuffer(1, samples.length, Number(this.sampleRate));
                audioBuffer.getChannelData(0).set(samples);
                const bufferSource = this.#audioContext.createBufferSource();
                bufferSource.buffer = audioBuffer;
                const channelData = audioBuffer.getChannelData(0);
                const sampleRate = Number(this.sampleRate);
                for (let i = 0; i < this.#fadeDuration * sampleRate; i++) {
                    channelData[i] *= i / (this.#fadeDuration * sampleRate);
                }
                for (let i = channelData.length - 1; i >= channelData.length - this.#fadeDuration * sampleRate; i--) {
                    channelData[i] *=
                        (channelData.length - i) / (this.#fadeDuration * sampleRate);
                }
                bufferSource.connect(this.#gainNode);
                if (this.#playbackTime < this.#audioContext.currentTime) {
                    this.#playbackTime = this.#audioContext.currentTime;
                }
                bufferSource.start(this.#playbackTime);
                this.#playbackTime += audioBuffer.duration;
            }
        }
        this.#dispatchEvent("microphoneData", {
            samples,
            sampleRate: this.sampleRate,
            bitDepth: this.bitDepth,
        });
    }
    get #bytesPerSample() {
        switch (this.bitDepth) {
            case "8":
                return 1;
            case "16":
                return 2;
        }
    }
    #microphoneConfiguration = {};
    get microphoneConfiguration() {
        return this.#microphoneConfiguration;
    }
    #availableMicrophoneConfigurationTypes;
    get availableMicrophoneConfigurationTypes() {
        return this.#availableMicrophoneConfigurationTypes;
    }
    get bitDepth() {
        return this.#microphoneConfiguration.bitDepth;
    }
    get sampleRate() {
        return this.#microphoneConfiguration.sampleRate;
    }
    #parseMicrophoneConfiguration(dataView) {
        const parsedMicrophoneConfiguration = {};
        let byteOffset = 0;
        while (byteOffset < dataView.byteLength) {
            const microphoneConfigurationTypeIndex = dataView.getUint8(byteOffset++);
            const microphoneConfigurationType = MicrophoneConfigurationTypes[microphoneConfigurationTypeIndex];
            _console$G.assertWithError(microphoneConfigurationType, `invalid microphoneConfigurationTypeIndex ${microphoneConfigurationTypeIndex}`);
            let rawValue = dataView.getUint8(byteOffset++);
            const values = MicrophoneConfigurationValues[microphoneConfigurationType];
            const value = values[rawValue];
            _console$G.assertEnumWithError(value, values);
            _console$G.log({ microphoneConfigurationType, value });
            parsedMicrophoneConfiguration[microphoneConfigurationType] = value;
        }
        _console$G.log({ parsedMicrophoneConfiguration });
        this.#availableMicrophoneConfigurationTypes = Object.keys(parsedMicrophoneConfiguration);
        this.#microphoneConfiguration = parsedMicrophoneConfiguration;
        this.#dispatchEvent("getMicrophoneConfiguration", {
            microphoneConfiguration: this.#microphoneConfiguration,
        });
    }
    #isMicrophoneConfigurationRedundant(microphoneConfiguration) {
        let microphoneConfigurationTypes = Object.keys(microphoneConfiguration);
        return microphoneConfigurationTypes.every((microphoneConfigurationType) => {
            return (this.microphoneConfiguration[microphoneConfigurationType] ==
                microphoneConfiguration[microphoneConfigurationType]);
        });
    }
    async setMicrophoneConfiguration(newMicrophoneConfiguration) {
        _console$G.log({ newMicrophoneConfiguration });
        if (this.#isMicrophoneConfigurationRedundant(newMicrophoneConfiguration)) {
            _console$G.log("redundant microphone configuration");
            return;
        }
        const setMicrophoneConfigurationData = this.#createData(newMicrophoneConfiguration);
        _console$G.log({ setMicrophoneConfigurationData });
        const promise = this.waitForEvent("getMicrophoneConfiguration");
        this.sendMessage([
            {
                type: "setMicrophoneConfiguration",
                data: setMicrophoneConfigurationData.buffer,
            },
        ]);
        await promise;
    }
    #assertAvailableMicrophoneConfigurationType(microphoneConfigurationType) {
        _console$G.assertWithError(this.#availableMicrophoneConfigurationTypes, "must get initial microphoneConfiguration");
        const isMicrophoneConfigurationTypeAvailable = this.#availableMicrophoneConfigurationTypes?.includes(microphoneConfigurationType);
        _console$G.assertWithError(isMicrophoneConfigurationTypeAvailable, `unavailable microphone configuration type "${microphoneConfigurationType}"`);
        return isMicrophoneConfigurationTypeAvailable;
    }
    static AssertValidMicrophoneConfigurationType(microphoneConfigurationType) {
        _console$G.assertEnumWithError(microphoneConfigurationType, MicrophoneConfigurationTypes);
    }
    static AssertValidMicrophoneConfigurationTypeEnum(microphoneConfigurationTypeEnum) {
        _console$G.assertTypeWithError(microphoneConfigurationTypeEnum, "number");
        _console$G.assertWithError(microphoneConfigurationTypeEnum in MicrophoneConfigurationTypes, `invalid microphoneConfigurationTypeEnum ${microphoneConfigurationTypeEnum}`);
    }
    #createData(microphoneConfiguration) {
        let microphoneConfigurationTypes = Object.keys(microphoneConfiguration);
        microphoneConfigurationTypes = microphoneConfigurationTypes.filter((microphoneConfigurationType) => this.#assertAvailableMicrophoneConfigurationType(microphoneConfigurationType));
        const dataView = new DataView(new ArrayBuffer(microphoneConfigurationTypes.length * 2));
        microphoneConfigurationTypes.forEach((microphoneConfigurationType, index) => {
            _a$4.AssertValidMicrophoneConfigurationType(microphoneConfigurationType);
            const microphoneConfigurationTypeEnum = MicrophoneConfigurationTypes.indexOf(microphoneConfigurationType);
            dataView.setUint8(index * 2, microphoneConfigurationTypeEnum);
            let value = microphoneConfiguration[microphoneConfigurationType];
            if (typeof value == "number") {
                value = value.toString();
            }
            const values = MicrophoneConfigurationValues[microphoneConfigurationType];
            _console$G.assertEnumWithError(value, values);
            const rawValue = values.indexOf(value);
            dataView.setUint8(index * 2 + 1, rawValue);
        });
        _console$G.log({ sensorConfigurationData: dataView });
        return dataView;
    }
    parseMessage(messageType, dataView, isSending) {
        _console$G.log({ messageType, isSending }, dataView);
        switch (messageType) {
            case "microphoneStatus":
                this.#parseMicrophoneStatus(dataView);
                break;
            case "getMicrophoneConfiguration":
            case "setMicrophoneConfiguration":
                this.#parseMicrophoneConfiguration(dataView);
                break;
            case "microphoneData":
                this.#parseMicrophoneData(dataView);
                break;
            default:
                throw Error(`uncaught messageType ${messageType}`);
        }
    }
    #audioContext;
    get audioContext() {
        return this.#audioContext;
    }
    set audioContext(newAudioContext) {
        if (this.#audioContext == newAudioContext) {
            _console$G.log("redundant audioContext assignment", this.#audioContext);
            return;
        }
        this.#audioContext = newAudioContext;
        _console$G.log("assigned new audioContext", this.#audioContext);
        if (this.#audioContext) {
            this.#playbackTime = this.#audioContext.currentTime;
        }
        else {
            if (this.#mediaStreamDestination) {
                this.#mediaStreamDestination.disconnect();
                this.#mediaStreamDestination = undefined;
            }
            if (this.#gainNode) {
                this.#gainNode.disconnect();
                this.#gainNode = undefined;
            }
        }
    }
    #gainNode;
    get gainNode() {
        _console$G.assertWithError(this.#audioContext, "audioContext assignment required for gainNode");
        if (!this.#gainNode) {
            _console$G.log("creating gainNode...");
            this.#gainNode = this.#audioContext.createGain();
            _console$G.log("created gainNode", this.#gainNode);
        }
        return this.#gainNode;
    }
    #mediaStreamDestination;
    get mediaStreamDestination() {
        _console$G.assertWithError(this.#audioContext, "audioContext assignment required for mediaStreamDestination");
        if (!this.#mediaStreamDestination) {
            _console$G.log("creating mediaStreamDestination...");
            this.#mediaStreamDestination =
                this.#audioContext.createMediaStreamDestination();
            this.gainNode?.connect(this.#mediaStreamDestination);
            _console$G.log("created mediaStreamDestination", this.#mediaStreamDestination);
        }
        return this.#mediaStreamDestination;
    }
    #isRecording = false;
    get isRecording() {
        return this.#isRecording;
    }
    #microphoneRecordingData;
    startRecording() {
        if (this.isRecording) {
            _console$G.log("already recording microphone");
            return;
        }
        this.#microphoneRecordingData = [];
        this.#isRecording = true;
        this.#dispatchEvent("isRecordingMicrophone", {
            isRecordingMicrophone: this.isRecording,
        });
        this.#dispatchEvent("startRecordingMicrophone", {});
    }
    stopRecording() {
        if (!this.isRecording) {
            _console$G.log("already not recording");
            return;
        }
        this.#isRecording = false;
        if (this.#microphoneRecordingData &&
            this.#microphoneRecordingData.length > 0) {
            _console$G.log("parsing microphone data...", this.#microphoneRecordingData.length);
            const arrayBuffer = concatenateArrayBuffers(...this.#microphoneRecordingData);
            const samples = new Float32Array(arrayBuffer);
            const blob = float32ArrayToWav(samples, Number(this.sampleRate), 1);
            const url = URL.createObjectURL(blob);
            this.#dispatchEvent("microphoneRecording", {
                samples,
                configuration: structuredClone(this.microphoneConfiguration),
                blob,
                url,
            });
        }
        this.#microphoneRecordingData = undefined;
        this.#dispatchEvent("isRecordingMicrophone", {
            isRecordingMicrophone: this.isRecording,
        });
        this.#dispatchEvent("stopRecordingMicrophone", {});
    }
    toggleRecording() {
        if (this.#isRecording) {
            this.stopRecording();
        }
        else {
            this.startRecording();
        }
    }
    clear() {
        this.#microphoneStatus = undefined;
        this.#microphoneConfiguration = {};
        if (this.isRecording) {
            this.stopRecording();
        }
    }
}
_a$4 = MicrophoneManager;

const LightSensorTypes = ["light"];
const ContinuousLightSensorTypes = LightSensorTypes;
const _console$F = createConsole("LightSensorDataManager", { log: false });
class LightSensorDataManager {
    parseData(dataView, scalar) {
        const light = dataView.getFloat32(0, true) * scalar;
        _console$F.log({ light });
        return { light };
    }
}

const _console$E = createConsole("SensorDataManager", { log: false });
const SensorTypes = [
    ...PressureSensorTypes,
    ...MotionSensorTypes,
    ...BarometerSensorTypes,
    ...CameraSensorTypes,
    ...MicrophoneSensorTypes,
    ...ButtonSensorTypes,
    ...TouchSensorTypes,
    ...LightSensorTypes,
];
const ContinuousSensorTypes = [
    ...ContinuousPressureSensorTypes,
    ...ContinuousMotionTypes,
    ...ContinuousBarometerSensorTypes,
    ...ContinuousLightSensorTypes,
];
const SensorDataMessageTypes = [
    "getPressurePositions",
    "getSensorScalars",
    "sensorData",
];
const RequiredPressureMessageTypes = [
    "getPressurePositions",
];
const SensorDataEventTypes = [
    ...SensorDataMessageTypes,
    ...SensorTypes,
    ...PressureSensorEventTypes,
    ...ButtonSensorEventTypes,
    ...TouchSensorEventTypes,
];
const SensorMetaDataMessageTypes = ["getSensorCounts"];
const RequiredSensorMetaDataMessageTypes = [
    "getSensorCounts",
];
const SensorMetaDataEventTypes = [
    ...SensorMetaDataMessageTypes,
];
function parseSensorData(dataView, callback) {
    _console$E.log("sensorData", Array.from(new Uint8Array(dataView.buffer)));
    let byteOffset = 0;
    const timestamp = parseTimestamp(dataView, byteOffset);
    byteOffset += 2;
    const _dataView = new DataView(dataView.buffer, byteOffset);
    const context = {
        timestamp,
        messages: [],
    };
    parseMessage(_dataView, SensorTypes, callback, context);
    return context;
}
class SensorDataManager {
    constructor() {
        autoBind$1(this);
    }
    pressureSensorDataManager = new PressureSensorDataManager();
    motionSensorDataManager = new MotionSensorDataManager();
    barometerSensorDataManager = new BarometerSensorDataManager();
    buttonSensorDataManager = new ButtonSensorDataManager();
    touchSensorDataManager = new TouchSensorDataManager();
    lightSensorDataManager = new LightSensorDataManager();
    #scalars = new Map();
    #counts = new Map();
    static AssertValidSensorType(sensorType) {
        _console$E.assertEnumWithError(sensorType, SensorTypes);
    }
    static AssertValidSensorTypeEnum(sensorTypeEnum) {
        _console$E.assertTypeWithError(sensorTypeEnum, "number");
        _console$E.assertWithError(sensorTypeEnum in SensorTypes, `invalid sensorTypeEnum ${sensorTypeEnum}`);
    }
    #eventDispatcher;
    get eventDispatcher() {
        return this.#eventDispatcher;
    }
    set eventDispatcher(eventDispatcher) {
        if (this.#eventDispatcher == eventDispatcher) {
            return;
        }
        _console$E.assertWithError(!this.#eventDispatcher, "eventDispatcher already defined");
        this.#eventDispatcher = eventDispatcher;
        this.pressureSensorDataManager.eventDispatcher =
            eventDispatcher;
        this.buttonSensorDataManager.eventDispatcher =
            eventDispatcher;
        this.touchSensorDataManager.eventDispatcher =
            eventDispatcher;
    }
    get dispatchEvent() {
        return this.eventDispatcher.dispatchEvent;
    }
    parseMessage(messageType, dataView, isSending) {
        _console$E.log({ messageType, isSending }, dataView);
        switch (messageType) {
            case "getSensorScalars":
                this.#parseScalars(dataView);
                break;
            case "getPressurePositions":
                this.pressureSensorDataManager.parsePositions(dataView);
                break;
            case "sensorData":
                this.#parseData(dataView);
                break;
            case "getSensorCounts":
                this.#parseCounts(dataView);
                break;
            default:
                throw Error(`uncaught messageType ${messageType}`);
        }
    }
    #parseScalars(dataView) {
        for (let byteOffset = 0; byteOffset < dataView.byteLength; byteOffset += 5) {
            const sensorTypeIndex = dataView.getUint8(byteOffset);
            const sensorType = SensorTypes[sensorTypeIndex];
            if (!sensorType) {
                _console$E.warn(`unknown sensorType index ${sensorTypeIndex}`);
                continue;
            }
            const sensorScalar = dataView.getFloat32(byteOffset + 1, true);
            _console$E.log({ sensorType, sensorScalar });
            this.#scalars.set(sensorType, sensorScalar);
        }
    }
    #parseCounts(dataView) {
        for (let byteOffset = 0; byteOffset < dataView.byteLength; byteOffset += 2) {
            const sensorTypeIndex = dataView.getUint8(byteOffset);
            const sensorType = SensorTypes[sensorTypeIndex];
            if (!sensorType) {
                _console$E.warn(`unknown sensorType index ${sensorTypeIndex}`);
                continue;
            }
            const sensorCount = dataView.getUint8(byteOffset + 1);
            _console$E.log({ sensorType, sensorCount });
            this.#counts.set(sensorType, sensorCount);
            switch (sensorType) {
                case "buttons":
                    this.buttonSensorDataManager.numberOfButtons = sensorCount;
                    break;
                case "touches":
                    this.touchSensorDataManager.numberOfTouches = sensorCount;
                    break;
                default:
                    _console$E.warn(`uncaught count for sensorType "${sensorType}"`);
                    break;
            }
        }
    }
    #parseData(dataView) {
        const context = parseSensorData(dataView, this.#parseDataCallback.bind(this));
        const { messages, timestamp, euler } = context;
        messages.forEach(({ sensorType, message, dataView }) => {
            if (sensorType == "pressure") {
                if (euler) {
                    this.pressureSensorDataManager.onEuler(euler, timestamp);
                }
                const scalar = this.#scalars.get("pressure") || 1;
                message.pressure = this.pressureSensorDataManager.parseData(dataView, scalar, timestamp);
            }
            this.dispatchEvent(sensorType, message);
            this.dispatchEvent("sensorData", message);
        });
    }
    #parseDataCallback(sensorType, dataView, context, isLast) {
        const { timestamp, messages } = context;
        const scalar = this.#scalars.get(sensorType) || 1;
        let sensorData = null;
        let sensorDataEuler = null;
        switch (sensorType) {
            case "pressure":
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
                sensorDataEuler = this.motionSensorDataManager.quaternionToEuler(sensorData, sensorType == "rotation");
                break;
            case "orientation":
                sensorData = this.motionSensorDataManager.parseEuler(dataView, scalar, true);
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
                sensorData =
                    this.motionSensorDataManager.parseDeviceOrientation(dataView);
                break;
            case "tapDetector":
                sensorData = {};
                break;
            case "barometer":
                sensorData = this.barometerSensorDataManager.parseData(dataView, scalar);
                break;
            case "buttons":
                sensorData = this.buttonSensorDataManager.parseData(dataView);
                break;
            case "touches":
                sensorData = this.touchSensorDataManager.parseData(dataView);
                break;
            case "camera":
                return;
            case "microphone":
                return;
            case "light":
                sensorData = this.lightSensorDataManager.parseData(dataView, scalar);
                break;
            default:
                _console$E.error(`uncaught sensorType "${sensorType}"`);
        }
        _console$E.assertWithError(sensorData != null || sensorType == "pressure", `no sensorData defined for sensorType "${sensorType}"`);
        _console$E.log({ sensorType, sensorData });
        const message = {
            sensorType,
            [sensorType]: sensorData,
            timestamp,
            isLast: isLast,
        };
        if (sensorType == "pressure") {
            message.dataView = dataView;
        }
        if (sensorDataEuler) {
            message[`${sensorType}Euler`] = sensorDataEuler;
            context.euler = sensorDataEuler;
        }
        messages.push({
            sensorType,
            message,
            dataView: sensorType == "pressure" ? dataView : undefined,
        });
    }
    clear() {
        _console$E.log("clear");
        this.buttonSensorDataManager.clear();
        this.touchSensorDataManager.clear();
    }
}

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

var _a$3;
const _console$D = createConsole("SensorConfigurationManager", { log: false });
const MaxSensorRate = 2 ** 16 - 1;
const SensorRateStep = 5;
const SensorConfigurationMessageTypes = [
    "getSensorConfiguration",
    "setSensorConfiguration",
];
const SensorConfigurationEventTypes = SensorConfigurationMessageTypes;
function parseSensorConfiguration(dataView, callback, context) {
    const parsedSensorConfiguration = {};
    for (let byteOffset = 0; byteOffset < dataView.byteLength; byteOffset += 3) {
        const sensorTypeIndex = dataView.getUint8(byteOffset);
        const sensorType = SensorTypes[sensorTypeIndex];
        const sensorRate = dataView.getUint16(byteOffset + 1, true);
        _console$D.log({ sensorType, sensorRate });
        if (!sensorType) {
            _console$D.warn(`unknown sensorType index ${sensorTypeIndex}`);
            continue;
        }
        if (callback && !callback(sensorType, sensorRate, context)) {
            continue;
        }
        parsedSensorConfiguration[sensorType] = sensorRate;
    }
    _console$D.log({ parsedSensorConfiguration });
    return parsedSensorConfiguration;
}
function assertValidSensorRate(sensorRate) {
    _console$D.assertTypeWithError(sensorRate, "number");
    _console$D.assertWithError(sensorRate >= 0, `sensorRate must be 0 or greater (got ${sensorRate})`);
    _console$D.assertWithError(sensorRate < MaxSensorRate, `sensorRate must be 0 or greater (got ${sensorRate})`);
    _console$D.assertWithError(sensorRate % SensorRateStep == 0, `sensorRate must be multiple of ${SensorRateStep}`);
}
function serializeSensorConfiguration(sensorConfiguration, availableSensorTypes) {
    let sensorTypes = Object.keys(sensorConfiguration);
    if (availableSensorTypes) {
        sensorTypes = sensorTypes.filter((sensorType) => availableSensorTypes.includes(sensorType));
    }
    const dataView = new DataView(new ArrayBuffer(sensorTypes.length * 3));
    sensorTypes.forEach((sensorType, index) => {
        SensorDataManager.AssertValidSensorType(sensorType);
        const sensorTypeEnum = SensorTypes.indexOf(sensorType);
        dataView.setUint8(index * 3, sensorTypeEnum);
        const sensorRate = sensorConfiguration[sensorType];
        assertValidSensorRate(sensorRate);
        dataView.setUint16(index * 3 + 1, sensorRate, true);
    });
    _console$D.log({ sensorConfigurationData: dataView });
    return dataView;
}
class SensorConfigurationManager {
    constructor() {
        autoBind(this);
    }
    sendMessage;
    eventDispatcher;
    get addEventListener() {
        return this.eventDispatcher.addEventListener;
    }
    get #dispatchEvent() {
        return this.eventDispatcher.dispatchEvent;
    }
    get waitForEvent() {
        return this.eventDispatcher.waitForEvent;
    }
    #availableSensorTypes;
    get availableSensorTypes() {
        return this.#availableSensorTypes || [];
    }
    hasSensorType(sensorType) {
        return this.availableSensorTypes.includes(sensorType);
    }
    #configuration = {};
    get configuration() {
        return this.#configuration;
    }
    #updateConfiguration(updatedConfiguration) {
        this.#configuration = updatedConfiguration;
        _console$D.log({ updatedConfiguration: this.#configuration });
        this.#dispatchEvent("getSensorConfiguration", {
            sensorConfiguration: this.configuration,
        });
    }
    clear() {
        this.#updateConfiguration({});
    }
    #isRedundant(sensorConfiguration) {
        let sensorTypes = Object.keys(sensorConfiguration);
        return sensorTypes.every((sensorType) => {
            return this.configuration[sensorType] == sensorConfiguration[sensorType];
        });
    }
    async setConfiguration(newSensorConfiguration, clearRest, sendImmediately) {
        newSensorConfiguration = structuredClone(newSensorConfiguration);
        if (clearRest) {
            newSensorConfiguration = Object.assign(structuredClone(this.zeroSensorConfiguration), newSensorConfiguration);
        }
        _console$D.log({ newSensorConfiguration });
        if (this.#isRedundant(newSensorConfiguration)) {
            _console$D.log("redundant sensor configuration");
            return;
        }
        const sensorTypes = Object.keys(newSensorConfiguration);
        sensorTypes.forEach((sensorType) => {
            const sensorRate = newSensorConfiguration[sensorType];
            if (this.configuration[sensorType] == sensorRate) {
                delete newSensorConfiguration[sensorType];
            }
        });
        const setSensorConfigurationData = serializeSensorConfiguration(newSensorConfiguration, this.availableSensorTypes);
        _console$D.log({ setSensorConfigurationData });
        const promise = this.waitForEvent("getSensorConfiguration");
        this.sendMessage([
            {
                type: "setSensorConfiguration",
                data: setSensorConfigurationData.buffer,
            },
        ], sendImmediately);
        await promise;
    }
    async toggleSensor(sensorType, sensorRate, clearRest, sendImmediately) {
        const newSensorConfiguration = {};
        if (this.configuration[sensorType]) {
            newSensorConfiguration[sensorType] = 0;
        }
        else {
            newSensorConfiguration[sensorType] = sensorRate;
        }
        await this.setConfiguration(newSensorConfiguration, clearRest, sendImmediately);
    }
    #parse(dataView) {
        const parsedSensorConfiguration = parseSensorConfiguration(dataView);
        _console$D.log({ parsedSensorConfiguration });
        this.#availableSensorTypes = Object.keys(parsedSensorConfiguration);
        _console$D.log("availableSensorTypes", this.#availableSensorTypes);
        return parsedSensorConfiguration;
    }
    static #AssertValidSensorRate(sensorRate) {
        _console$D.assertTypeWithError(sensorRate, "number");
        _console$D.assertWithError(sensorRate >= 0, `sensorRate must be 0 or greater (got ${sensorRate})`);
        _console$D.assertWithError(sensorRate < MaxSensorRate, `sensorRate must be 0 or greater (got ${sensorRate})`);
        _console$D.assertWithError(sensorRate % SensorRateStep == 0, `sensorRate must be multiple of ${SensorRateStep}`);
    }
    #assertValidSensorRate(sensorRate) {
        _a$3.#AssertValidSensorRate(sensorRate);
    }
    static #ZeroSensorConfiguration = {};
    static get ZeroSensorConfiguration() {
        return this.#ZeroSensorConfiguration;
    }
    static {
        SensorTypes.forEach((sensorType) => {
            this.#ZeroSensorConfiguration[sensorType] = 0;
        });
    }
    get zeroSensorConfiguration() {
        const zeroSensorConfiguration = {};
        this.#availableSensorTypes.forEach((sensorType) => {
            zeroSensorConfiguration[sensorType] = 0;
        });
        return zeroSensorConfiguration;
    }
    async clearSensorConfiguration() {
        return this.setConfiguration(this.zeroSensorConfiguration);
    }
    parseMessage(messageType, dataView, isSending) {
        _console$D.log({ messageType, isSending }, dataView);
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
}
_a$3 = SensorConfigurationManager;

const _console$C = createConsole("TfliteManager", { log: false });
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
const RequiredTfliteMessageTypes = [
    "getTfliteName",
    "getTfliteTask",
    "getTfliteSampleRate",
    "getTfliteSensorTypes",
    "tfliteIsReady",
    "getTfliteCaptureDelay",
    "getTfliteThreshold",
    "getTfliteInferencingEnabled",
];
const TfliteTasks = ["classification", "regression"];
const TfliteSensorTypes = [
    "pressure",
    "linearAcceleration",
    "gyroscope",
    "magnetometer",
    "microphone",
    "camera",
];
class TfliteManager {
    constructor() {
        autoBind$1(this);
    }
    sendMessage;
    #assertValidTask(task) {
        _console$C.assertEnumWithError(task, TfliteTasks);
    }
    #assertValidTaskEnum(taskEnum) {
        _console$C.assertWithError(taskEnum in TfliteTasks, `invalid taskEnum ${taskEnum}`);
    }
    eventDispatcher;
    get addEventListenter() {
        return this.eventDispatcher.addEventListener;
    }
    get #dispatchEvent() {
        return this.eventDispatcher.dispatchEvent;
    }
    get removeEventListener() {
        return this.eventDispatcher.removeEventListener;
    }
    get waitForEvent() {
        return this.eventDispatcher.waitForEvent;
    }
    #classes;
    get classes() {
        return this.#classes;
    }
    setClasses(newClasses) {
        this.#classes = newClasses?.slice();
        _console$C.log("classes", this.classes);
    }
    #name;
    get name() {
        return this.#name;
    }
    #parseName(dataView) {
        _console$C.log("parseName", dataView);
        const name = textDecoder.decode(dataView.buffer);
        this.#updateName(name);
    }
    #updateName(name) {
        _console$C.log({ name });
        this.#name = name;
        this.#dispatchEvent("getTfliteName", { tfliteName: name });
    }
    async setName(newName, sendImmediately) {
        _console$C.assertTypeWithError(newName, "string");
        if (this.name == newName) {
            _console$C.log(`redundant name assignment ${newName}`);
            return;
        }
        const promise = this.waitForEvent("getTfliteName");
        const setNameData = textEncoder.encode(newName);
        this.sendMessage([{ type: "setTfliteName", data: setNameData.buffer }], sendImmediately);
        await promise;
    }
    #task;
    get task() {
        return this.#task;
    }
    #parseTask(dataView) {
        _console$C.log("parseTask", dataView);
        const taskEnum = dataView.getUint8(0);
        this.#assertValidTaskEnum(taskEnum);
        const task = TfliteTasks[taskEnum];
        this.#updateTask(task);
    }
    #updateTask(task) {
        _console$C.log({ task });
        this.#task = task;
        this.#dispatchEvent("getTfliteTask", { tfliteTask: task });
    }
    async setTask(newTask, sendImmediately) {
        this.#assertValidTask(newTask);
        if (this.task == newTask) {
            _console$C.log(`redundant task assignment ${newTask}`);
            return;
        }
        const promise = this.waitForEvent("getTfliteTask");
        const taskEnum = TfliteTasks.indexOf(newTask);
        this.sendMessage([{ type: "setTfliteTask", data: UInt8ByteBuffer(taskEnum) }], sendImmediately);
        await promise;
    }
    #sampleRate;
    get sampleRate() {
        return this.#sampleRate;
    }
    #parseSampleRate(dataView) {
        _console$C.log("parseSampleRate", dataView);
        const sampleRate = dataView.getUint16(0, true);
        this.#updateSampleRate(sampleRate);
    }
    #updateSampleRate(sampleRate) {
        _console$C.log({ sampleRate });
        this.#sampleRate = sampleRate;
        this.#dispatchEvent("getTfliteSampleRate", {
            tfliteSampleRate: sampleRate,
        });
    }
    async setSampleRate(newSampleRate, sendImmediately) {
        _console$C.assertTypeWithError(newSampleRate, "number");
        newSampleRate -= newSampleRate % SensorRateStep;
        _console$C.assertWithError(newSampleRate >= SensorRateStep, `sampleRate must be multiple of ${SensorRateStep} greater than 0 (got ${newSampleRate})`);
        if (this.#sampleRate == newSampleRate) {
            _console$C.log(`redundant sampleRate assignment ${newSampleRate}`);
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
        const tfliteSensorType = sensorType;
        _console$C.assertWithError(TfliteSensorTypes.includes(tfliteSensorType), `invalid tflite sensorType "${sensorType}"`);
    }
    #sensorTypes = [];
    get sensorTypes() {
        return this.#sensorTypes.slice();
    }
    #parseSensorTypes(dataView) {
        _console$C.log("parseSensorTypes", dataView);
        const sensorTypes = [];
        for (let index = 0; index < dataView.byteLength; index++) {
            const sensorTypeEnum = dataView.getUint8(index);
            const sensorType = SensorTypes[sensorTypeEnum];
            if (sensorType) {
                if (TfliteSensorTypes.includes(sensorType)) {
                    sensorTypes.push(sensorType);
                }
                else {
                    _console$C.error(`invalid tfliteSensorType ${sensorType}`);
                }
            }
            else {
                _console$C.error(`invalid sensorTypeEnum ${sensorTypeEnum}`);
            }
        }
        this.#updateSensorTypes(sensorTypes);
    }
    #updateSensorTypes(sensorTypes) {
        _console$C.log({ sensorTypes });
        this.#sensorTypes = sensorTypes;
        this.#dispatchEvent("getTfliteSensorTypes", {
            tfliteSensorTypes: sensorTypes,
        });
    }
    async setSensorTypes(newSensorTypes, sendImmediately) {
        newSensorTypes.forEach((sensorType) => {
            TfliteManager.AssertValidSensorType(sensorType);
        });
        newSensorTypes = arrayWithoutDuplicates(newSensorTypes);
        if (newSensorTypes.length == this.sensorTypes.length) {
            if (this.sensorTypes.every((value) => newSensorTypes.includes(value))) {
                _console$C.log(`redundant tflite sensorTypes`, newSensorTypes);
                return;
            }
        }
        const promise = this.waitForEvent("getTfliteSensorTypes");
        const newSensorTypeEnums = newSensorTypes
            .map((sensorType) => SensorTypes.indexOf(sensorType))
            .sort();
        _console$C.log(newSensorTypes, newSensorTypeEnums);
        this.sendMessage([
            {
                type: "setTfliteSensorTypes",
                data: Uint8Array.from(newSensorTypeEnums).buffer,
            },
        ], sendImmediately);
        await promise;
    }
    #isReady;
    get isReady() {
        return this.#isReady;
    }
    #parseIsReady(dataView) {
        _console$C.log("parseIsReady", dataView);
        const isReady = Boolean(dataView.getUint8(0));
        this.#updateIsReady(isReady);
    }
    #updateIsReady(isReady) {
        _console$C.log({ isReady });
        this.#isReady = isReady;
        this.#dispatchEvent("tfliteIsReady", { tfliteIsReady: isReady });
    }
    #assertIsReady() {
        _console$C.assertWithError(this.isReady, `tflite is not ready`);
    }
    #captureDelay;
    get captureDelay() {
        return this.#captureDelay;
    }
    #parseCaptureDelay(dataView) {
        _console$C.log("parseCaptureDelay", dataView);
        const captureDelay = dataView.getUint16(0, true);
        this.#updateCaptueDelay(captureDelay);
    }
    #updateCaptueDelay(captureDelay) {
        _console$C.log({ captureDelay });
        this.#captureDelay = captureDelay;
        this.#dispatchEvent("getTfliteCaptureDelay", {
            tfliteCaptureDelay: captureDelay,
        });
    }
    async setCaptureDelay(newCaptureDelay, sendImmediately) {
        _console$C.assertTypeWithError(newCaptureDelay, "number");
        if (this.#captureDelay == newCaptureDelay) {
            _console$C.log(`redundant captureDelay assignment ${newCaptureDelay}`);
            return;
        }
        const promise = this.waitForEvent("getTfliteCaptureDelay");
        const dataView = new DataView(new ArrayBuffer(2));
        dataView.setUint16(0, newCaptureDelay, true);
        this.sendMessage([{ type: "setTfliteCaptureDelay", data: dataView.buffer }], sendImmediately);
        await promise;
    }
    #threshold;
    get threshold() {
        return this.#threshold;
    }
    #parseThreshold(dataView) {
        _console$C.log("parseThreshold", dataView);
        const threshold = dataView.getFloat32(0, true);
        this.#updateThreshold(threshold);
    }
    #updateThreshold(threshold) {
        _console$C.log({ threshold });
        this.#threshold = threshold;
        this.#dispatchEvent("getTfliteThreshold", { tfliteThreshold: threshold });
    }
    async setThreshold(newThreshold, sendImmediately) {
        _console$C.assertTypeWithError(newThreshold, "number");
        _console$C.assertWithError(newThreshold >= 0, `threshold must be positive (got ${newThreshold})`);
        if (this.#threshold == newThreshold) {
            _console$C.log(`redundant threshold assignment ${newThreshold}`);
            return;
        }
        const promise = this.waitForEvent("getTfliteThreshold");
        const dataView = new DataView(new ArrayBuffer(4));
        dataView.setFloat32(0, newThreshold, true);
        this.sendMessage([{ type: "setTfliteThreshold", data: dataView.buffer }], sendImmediately);
        await promise;
    }
    #inferencingEnabled;
    get inferencingEnabled() {
        return this.#inferencingEnabled;
    }
    #parseInferencingEnabled(dataView) {
        _console$C.log("parseInferencingEnabled", dataView);
        const inferencingEnabled = Boolean(dataView.getUint8(0));
        this.#updateInferencingEnabled(inferencingEnabled);
    }
    #updateInferencingEnabled(inferencingEnabled) {
        _console$C.log({ inferencingEnabled });
        this.#inferencingEnabled = inferencingEnabled;
        this.#dispatchEvent("getTfliteInferencingEnabled", {
            tfliteInferencingEnabled: inferencingEnabled,
        });
    }
    async setInferencingEnabled(newInferencingEnabled, sendImmediately = true) {
        _console$C.assertTypeWithError(newInferencingEnabled, "boolean");
        if (!newInferencingEnabled && !this.isReady) {
            return;
        }
        this.#assertIsReady();
        if (this.#inferencingEnabled == newInferencingEnabled) {
            _console$C.log(`redundant inferencingEnabled assignment ${newInferencingEnabled}`);
            return;
        }
        const promise = this.waitForEvent("getTfliteInferencingEnabled");
        this.sendMessage([
            {
                type: "setTfliteInferencingEnabled",
                data: UInt8ByteBuffer(Number(newInferencingEnabled)),
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
    #parseInference(dataView) {
        _console$C.log("parseInference", dataView);
        const timestamp = parseTimestamp(dataView, 0);
        _console$C.log({ timestamp });
        const values = [];
        for (let index = 0, byteOffset = 2; byteOffset < dataView.byteLength; index++, byteOffset += 4) {
            const value = dataView.getFloat32(byteOffset, true);
            values.push(value);
        }
        _console$C.log("values", values);
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
            _console$C.log({ maxIndex, maxValue });
            inference.maxIndex = maxIndex;
            inference.maxValue = maxValue;
            if (this.classes) {
                const { classes } = this;
                inference.maxClass = classes[maxIndex];
                inference.classValues = {};
                values.forEach((value, index) => {
                    const key = classes[index];
                    inference.classValues[key] = value;
                });
            }
        }
        this.#dispatchEvent("tfliteInference", { tfliteInference: inference });
    }
    parseMessage(messageType, dataView, isSending) {
        _console$C.log({ messageType, isSending }, dataView);
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
    #configuration;
    get configuration() {
        return this.#configuration;
    }
    sendConfiguration(configuration, sendImmediately) {
        if (configuration == this.#configuration) {
            _console$C.log("redundant tflite configuration assignment");
            return;
        }
        this.#configuration = configuration;
        _console$C.log("assigned new tflite configuration", this.configuration);
        if (!this.configuration) {
            return;
        }
        const { name, task, captureDelay, sampleRate, threshold, sensorTypes, classes, } = this.configuration;
        this.setClasses(classes);
        this.setTask(task, false);
        if (captureDelay != undefined) {
            this.setCaptureDelay(captureDelay, false);
        }
        this.setSampleRate(sampleRate, false);
        if (threshold != undefined) {
            this.setThreshold(threshold, false);
        }
        this.setSensorTypes(sensorTypes, false);
        this.setName(name, sendImmediately);
    }
    clear() {
        this.#classes = undefined;
        this.#inferencingEnabled = false;
        this.#sensorTypes = [];
        this.#sampleRate = 0;
        this.#isReady = false;
        this.#name = undefined;
        this.#task = undefined;
        this.#sampleRate = undefined;
        this.#sensorTypes.length = 0;
        this.#isReady = undefined;
        this.#captureDelay = undefined;
        this.#threshold = undefined;
        this.#inferencingEnabled = undefined;
        this.#configuration = undefined;
    }
    requestRequiredInformation() {
        _console$C.log("requesting required tflite information");
        const messages = RequiredTfliteMessageTypes.map((messageType) => ({
            type: messageType,
        }));
        this.sendMessage(messages, false);
    }
}

const _console$B = createConsole("DeviceInformationManager", { log: false });
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
    eventDispatcher;
    get #dispatchEvent() {
        return this.eventDispatcher.dispatchEvent;
    }
    #information = {};
    get information() {
        return this.#information;
    }
    clear() {
        this.#information = {};
    }
    get #isComplete() {
        return DeviceInformationTypes.filter((key) => key != "serialNumber").every((key) => key in this.#information);
    }
    #update(partialDeviceInformation) {
        _console$B.log({ partialDeviceInformation });
        const deviceInformationNames = Object.keys(partialDeviceInformation);
        deviceInformationNames.forEach((deviceInformationName) => {
            this.#dispatchEvent(deviceInformationName, {
                [deviceInformationName]: partialDeviceInformation[deviceInformationName],
            });
        });
        Object.assign(this.#information, partialDeviceInformation);
        _console$B.log({ deviceInformation: this.#information });
        if (this.#isComplete) {
            _console$B.log("completed deviceInformation");
            this.#dispatchEvent("deviceInformation", {
                deviceInformation: this.information,
            });
        }
    }
    parseMessage(messageType, dataView, isSending) {
        _console$B.log({ messageType, isSending }, dataView);
        switch (messageType) {
            case "manufacturerName":
                const manufacturerName = textDecoder.decode(dataView.buffer);
                _console$B.log({ manufacturerName });
                this.#update({ manufacturerName });
                break;
            case "modelNumber":
                const modelNumber = textDecoder.decode(dataView.buffer);
                _console$B.log({ modelNumber });
                this.#update({ modelNumber });
                break;
            case "softwareRevision":
                const softwareRevision = textDecoder.decode(dataView.buffer);
                _console$B.log({ softwareRevision });
                this.#update({ softwareRevision });
                break;
            case "hardwareRevision":
                const hardwareRevision = textDecoder.decode(dataView.buffer);
                _console$B.log({ hardwareRevision });
                this.#update({ hardwareRevision });
                break;
            case "firmwareRevision":
                const firmwareRevision = textDecoder.decode(dataView.buffer);
                _console$B.log({ firmwareRevision });
                this.#update({ firmwareRevision });
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
                _console$B.log({ pnpId });
                this.#update({ pnpId });
                break;
            case "serialNumber":
                const serialNumber = textDecoder.decode(dataView.buffer);
                _console$B.log({ serialNumber });
                break;
            default:
                throw Error(`uncaught messageType ${messageType}`);
        }
    }
}

const _console$A = createConsole("InformationManager", { log: false });
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
        autoBind$1(this);
    }
    sendMessage;
    eventDispatcher;
    get #dispatchEvent() {
        return this.eventDispatcher.dispatchEvent;
    }
    get waitForEvent() {
        return this.eventDispatcher.waitForEvent;
    }
    #isCharging = false;
    get isCharging() {
        return this.#isCharging;
    }
    #updateIsCharging(updatedIsCharging) {
        _console$A.assertTypeWithError(updatedIsCharging, "boolean");
        this.#isCharging = updatedIsCharging;
        _console$A.log({ isCharging: this.#isCharging });
        this.#dispatchEvent("isCharging", { isCharging: this.#isCharging });
    }
    #batteryCurrent;
    get batteryCurrent() {
        return this.#batteryCurrent;
    }
    async getBatteryCurrent() {
        _console$A.log("getting battery current...");
        const promise = this.waitForEvent("getBatteryCurrent");
        this.sendMessage([{ type: "getBatteryCurrent" }]);
        await promise;
    }
    #updateBatteryCurrent(updatedBatteryCurrent) {
        _console$A.assertTypeWithError(updatedBatteryCurrent, "number");
        this.#batteryCurrent = updatedBatteryCurrent;
        _console$A.log({ batteryCurrent: this.#batteryCurrent });
        this.#dispatchEvent("getBatteryCurrent", {
            batteryCurrent: this.#batteryCurrent,
        });
    }
    #id;
    get id() {
        return this.#id;
    }
    #updateId(updatedId) {
        _console$A.assertTypeWithError(updatedId, "string");
        this.#id = updatedId;
        _console$A.log({ id: this.#id });
        this.#dispatchEvent("getId", { id: this.#id });
    }
    #name = "";
    get name() {
        return this.#name;
    }
    updateName(updatedName) {
        _console$A.assertTypeWithError(updatedName, "string");
        this.#name = updatedName;
        _console$A.log({ updatedName: this.#name });
        this.#dispatchEvent("getName", { name: this.#name });
    }
    async setName(newName) {
        _console$A.assertTypeWithError(newName, "string");
        _console$A.assertRangeWithError("newName", newName.length, MinNameLength, MaxNameLength);
        const setNameData = textEncoder.encode(newName);
        _console$A.log({ setNameData });
        const promise = this.waitForEvent("getName");
        this.sendMessage([{ type: "setName", data: setNameData.buffer }]);
        await promise;
    }
    #type;
    get type() {
        return this.#type;
    }
    get typeEnum() {
        return DeviceTypes.indexOf(this.type);
    }
    #assertValidDeviceType(type) {
        _console$A.assertEnumWithError(type, DeviceTypes);
    }
    #assertValidDeviceTypeEnum(typeEnum) {
        _console$A.assertTypeWithError(typeEnum, "number");
        _console$A.assertWithError(typeEnum in DeviceTypes, `invalid typeEnum ${typeEnum}`);
    }
    updateType(updatedType) {
        this.#assertValidDeviceType(updatedType);
        this.#type = updatedType;
        _console$A.log({ updatedType: this.#type });
        this.#dispatchEvent("getType", { type: this.#type });
    }
    async #setTypeEnum(newTypeEnum) {
        this.#assertValidDeviceTypeEnum(newTypeEnum);
        const setTypeData = UInt8ByteBuffer(newTypeEnum);
        _console$A.log({ setTypeData });
        const promise = this.waitForEvent("getType");
        this.sendMessage([{ type: "setType", data: setTypeData }]);
        await promise;
    }
    async setType(newType) {
        this.#assertValidDeviceType(newType);
        const newTypeEnum = DeviceTypes.indexOf(newType);
        this.#setTypeEnum(newTypeEnum);
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
    get isGlasses() {
        switch (this.type) {
            case "glasses":
                return true;
            default:
                return false;
        }
    }
    get isGeneric() {
        switch (this.type) {
            case "generic":
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
    #mtu = 0;
    get mtu() {
        return this.#mtu;
    }
    #updateMtu(newMtu) {
        _console$A.assertTypeWithError(newMtu, "number");
        this.#mtu = newMtu;
        this.#dispatchEvent("getMtu", { mtu: this.#mtu });
    }
    #isCurrentTimeSet = false;
    get isCurrentTimeSet() {
        return this.#isCurrentTimeSet;
    }
    #currentTimeThreshold = 10_000;
    #onCurrentTime(currentTime) {
        _console$A.log({ currentTime });
        const timeDifference = Date.now() - currentTime;
        const absTimeDifference = Math.abs(timeDifference);
        _console$A.log({ timeDifference, absTimeDifference });
        this.#isCurrentTimeSet = currentTime != 0;
        _console$A.log("isCurrentTimeSet", this.#isCurrentTimeSet);
        if (!this.#isCurrentTimeSet) {
            this.#setCurrentTime(false);
        }
    }
    async #setCurrentTime(sendImmediately) {
        const now = Date.now();
        _console$A.log("setting current time...", { now });
        const dataView = new DataView(new ArrayBuffer(8));
        dataView.setBigUint64(0, BigInt(now), true);
        const promise = this.waitForEvent("getCurrentTime");
        this.sendMessage([{ type: "setCurrentTime", data: dataView.buffer }], sendImmediately);
        await promise;
    }
    parseMessage(messageType, dataView, isSending) {
        _console$A.log({ messageType, isSending }, dataView);
        switch (messageType) {
            case "isCharging":
                const isCharging = Boolean(dataView.getUint8(0));
                _console$A.log({ isCharging });
                this.#updateIsCharging(isCharging);
                break;
            case "getBatteryCurrent":
                const batteryCurrent = dataView.getFloat32(0, true);
                _console$A.log({ batteryCurrent });
                this.#updateBatteryCurrent(batteryCurrent);
                break;
            case "getId":
                const id = textDecoder.decode(dataView.buffer);
                _console$A.log({ id });
                this.#updateId(id);
                break;
            case "getName":
            case "setName":
                const name = textDecoder.decode(dataView.buffer);
                _console$A.log({ name });
                this.updateName(name);
                break;
            case "getType":
            case "setType":
                const typeEnum = dataView.getUint8(0);
                const type = DeviceTypes[typeEnum];
                _console$A.log({ typeEnum, type });
                this.updateType(type);
                break;
            case "getMtu":
                let mtu = dataView.getUint16(0, true);
                if (this.connectionType != "webSocket" &&
                    this.connectionType != "udp") {
                    mtu = Math.min(mtu, 512);
                }
                _console$A.log({ mtu });
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
    clear() {
        this.#isCurrentTimeSet = false;
        this.#mtu = 0;
    }
    connectionType;
}

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

const _console$z = createConsole("VibrationManager", { log: false });
const VibrationLocations = ["front", "rear", "left", "right"];
const VibrationTypes = ["waveformEffect", "waveform"];
const VibrationMessageTypes = [
    "getVibrationLocations",
    "triggerVibration",
];
const VibrationEventTypes = VibrationMessageTypes;
const MaxNumberOfVibrationWaveformEffectSegments = 8;
const MaxVibrationWaveformSegmentDuration = 2550;
const MaxVibrationWaveformEffectSegmentDelay = 1270;
const MaxVibrationWaveformEffectSegmentLoopCount = 3;
const MaxNumberOfVibrationWaveformSegments = 20;
const MaxVibrationWaveformEffectSequenceLoopCount = 6;
class VibrationManager {
    constructor() {
        autoBind$1(this);
    }
    sendMessage;
    eventDispatcher;
    get #dispatchEvent() {
        return this.eventDispatcher.dispatchEvent;
    }
    get waitForEvent() {
        return this.eventDispatcher.waitForEvent;
    }
    #verifyLocations(locations) {
        this.#assertNonEmptyArray(locations);
        locations.forEach((location) => {
            _console$z.assertEnumWithError(location, VibrationLocations);
        });
    }
    #createLocationsBitmask(locations) {
        this.#verifyLocations(locations);
        let locationsBitmask = 0;
        locations.forEach((location) => {
            const locationIndex = VibrationLocations.indexOf(location);
            locationsBitmask |= 1 << locationIndex;
        });
        _console$z.log({ locationsBitmask });
        _console$z.assertWithError(locationsBitmask > 0, `locationsBitmask must not be zero`);
        return locationsBitmask;
    }
    #assertNonEmptyArray(array) {
        _console$z.assertWithError(Array.isArray(array), "passed non-array");
        _console$z.assertWithError(array.length > 0, "passed empty array");
    }
    #verifyWaveformEffect(waveformEffect) {
        _console$z.assertEnumWithError(waveformEffect, VibrationWaveformEffects);
    }
    #verifyWaveformEffectSegment(waveformEffectSegment) {
        if (waveformEffectSegment.effect != undefined) {
            const waveformEffect = waveformEffectSegment.effect;
            this.#verifyWaveformEffect(waveformEffect);
        }
        else if (waveformEffectSegment.delay != undefined) {
            const { delay } = waveformEffectSegment;
            _console$z.assertWithError(delay >= 0, `delay must be 0ms or greater (got ${delay})`);
            _console$z.assertWithError(delay <= MaxVibrationWaveformEffectSegmentDelay, `delay must be ${MaxVibrationWaveformEffectSegmentDelay}ms or less (got ${delay})`);
        }
        else {
            throw Error("no effect or delay found in waveformEffectSegment");
        }
        if (waveformEffectSegment.loopCount != undefined) {
            const { loopCount } = waveformEffectSegment;
            this.#verifyWaveformEffectSegmentLoopCount(loopCount);
        }
    }
    #verifyWaveformEffectSegmentLoopCount(waveformEffectSegmentLoopCount) {
        _console$z.assertRangeWithError("waveformEffectSegmentLoopCount", waveformEffectSegmentLoopCount, 0, MaxVibrationWaveformEffectSegmentLoopCount);
    }
    #verifyWaveformEffectSegments(waveformEffectSegments) {
        _console$z.assertRangeWithError("waveformEffectSegments.length", waveformEffectSegments.length, 0, MaxNumberOfVibrationWaveformEffectSegments);
        waveformEffectSegments.forEach((waveformEffectSegment) => {
            this.#verifyWaveformEffectSegment(waveformEffectSegment);
        });
    }
    #verifyWaveformEffectSequenceLoopCount(waveformEffectSequenceLoopCount) {
        _console$z.assertRangeWithError("waveformEffectSequenceLoopCount", waveformEffectSequenceLoopCount, 0, MaxVibrationWaveformEffectSequenceLoopCount);
    }
    #verifyWaveformSegment(waveformSegment) {
        _console$z.assertRangeWithError("waveformSegment.amplitude", waveformSegment.amplitude, 0, 1);
        _console$z.assertRangeWithError("waveformSegment.duration", waveformSegment.duration, 0, MaxVibrationWaveformSegmentDuration);
    }
    #verifyWaveformSegments(waveformSegments) {
        _console$z.assertRangeWithError("waveformSegments.length", waveformSegments.length, 0, MaxNumberOfVibrationWaveformSegments);
        waveformSegments.forEach((waveformSegment) => {
            this.#verifyWaveformSegment(waveformSegment);
        });
    }
    #createWaveformEffectsData(locations, waveformEffectSegments, waveformEffectSequenceLoopCount = 0) {
        this.#verifyWaveformEffectSegments(waveformEffectSegments);
        this.#verifyWaveformEffectSequenceLoopCount(waveformEffectSequenceLoopCount);
        let dataArray = [];
        let byteOffset = 0;
        const hasAtLeast1WaveformEffectWithANonzeroLoopCount = waveformEffectSegments.some((waveformEffectSegment) => {
            const { loopCount } = waveformEffectSegment;
            return loopCount != undefined && loopCount > 0;
        });
        const includeAllWaveformEffectSegments = hasAtLeast1WaveformEffectWithANonzeroLoopCount ||
            waveformEffectSequenceLoopCount != 0;
        for (let index = 0; index < waveformEffectSegments.length ||
            (includeAllWaveformEffectSegments &&
                index < MaxNumberOfVibrationWaveformEffectSegments); index++) {
            const waveformEffectSegment = waveformEffectSegments[index] || {
                effect: "none",
            };
            if (waveformEffectSegment.effect != undefined) {
                const waveformEffect = waveformEffectSegment.effect;
                dataArray[byteOffset++] =
                    VibrationWaveformEffects.indexOf(waveformEffect);
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
            (includeAllWaveformEffectSegmentLoopCounts &&
                index < MaxNumberOfVibrationWaveformEffectSegments); index++) {
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
        _console$z.log({ dataArray, dataView });
        return this.#createData(locations, "waveformEffect", dataView);
    }
    #createWaveformData(locations, waveformSegments) {
        this.#verifyWaveformSegments(waveformSegments);
        const dataView = new DataView(new ArrayBuffer(waveformSegments.length * 2));
        waveformSegments.forEach((waveformSegment, index) => {
            dataView.setUint8(index * 2, Math.floor(waveformSegment.amplitude * 127));
            dataView.setUint8(index * 2 + 1, Math.floor(waveformSegment.duration / 10));
        });
        _console$z.log({ dataView });
        return this.#createData(locations, "waveform", dataView);
    }
    #createData(locations, vibrationType, dataView) {
        _console$z.assertWithError(dataView?.byteLength > 0, "no data received");
        const locationsBitmask = this.#createLocationsBitmask(locations);
        _console$z.assertEnumWithError(vibrationType, VibrationTypes);
        const vibrationTypeIndex = VibrationTypes.indexOf(vibrationType);
        _console$z.log({ locationsBitmask, vibrationTypeIndex, dataView });
        const data = concatenateArrayBuffers(locationsBitmask, vibrationTypeIndex, dataView.byteLength, dataView);
        _console$z.log({ data });
        return data;
    }
    async triggerVibration(vibrationConfigurations, sendImmediately = true) {
        if (!Array.isArray(vibrationConfigurations)) {
            vibrationConfigurations = [vibrationConfigurations];
        }
        if (vibrationConfigurations.length == 0) {
            _console$z.log("empty vibrationConfigurations");
            return;
        }
        let triggerVibrationData;
        vibrationConfigurations.forEach((vibrationConfiguration) => {
            const { type } = vibrationConfiguration;
            let { locations } = vibrationConfiguration;
            locations = locations || this.vibrationLocations.slice();
            locations = locations.filter((location) => this.vibrationLocations.includes(location));
            let arrayBuffer;
            switch (type) {
                case "waveformEffect":
                    {
                        const { segments, loopCount } = vibrationConfiguration;
                        if (segments.length == 0) {
                            _console$z.log("no segments");
                            return;
                        }
                        arrayBuffer = this.#createWaveformEffectsData(locations, segments, loopCount);
                    }
                    break;
                case "waveform":
                    {
                        const { segments } = vibrationConfiguration;
                        if (segments.length == 0) {
                            _console$z.log("no segments");
                            return;
                        }
                        arrayBuffer = this.#createWaveformData(locations, segments);
                    }
                    break;
                default:
                    throw Error(`invalid vibration type "${type}"`);
            }
            _console$z.log({ type, arrayBuffer });
            if (arrayBuffer.byteLength == 0) {
                _console$z.log("empty arrayBuffer");
                return;
            }
            triggerVibrationData = concatenateArrayBuffers(triggerVibrationData, arrayBuffer);
        });
        if (!triggerVibrationData) {
            _console$z.log("no triggerVibrationData");
            return;
        }
        if (triggerVibrationData.byteLength == 0) {
            _console$z.log("empty triggerVibrationData");
            return;
        }
        await this.sendMessage([{ type: "triggerVibration", data: triggerVibrationData }], sendImmediately);
    }
    #vibrationLocations = [];
    get vibrationLocations() {
        return this.#vibrationLocations;
    }
    #onVibrationLocations(vibrationLocations) {
        this.#vibrationLocations = vibrationLocations;
        _console$z.log("vibrationLocations", vibrationLocations);
        this.#dispatchEvent("getVibrationLocations", {
            vibrationLocations: this.#vibrationLocations,
        });
    }
    #parseVibrationLocations(dataView) {
        _console$z.log("parseVibrationLocations", dataView);
        const vibrationLocations = Array.from(new Uint8Array(dataView.buffer))
            .map((index) => VibrationLocations[index])
            .filter(Boolean);
        this.#onVibrationLocations(vibrationLocations);
    }
    parseMessage(messageType, dataView, isSending) {
        _console$z.log({ messageType, isSending }, dataView);
        switch (messageType) {
            case "getVibrationLocations":
                this.#parseVibrationLocations(dataView);
                break;
            default:
                throw Error(`uncaught messageType ${messageType}`);
        }
    }
}

const _console$y = createConsole("WifiManager", { log: false });
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
    "getWifiConnectionEnabled",
    "setWifiConnectionEnabled",
    "isWifiConnected",
    "ipAddress",
    "isWifiSecure",
];
const RequiredWifiMessageTypes = [
    "getWifiSSID",
    "getWifiPassword",
    "getWifiConnectionEnabled",
    "isWifiConnected",
    "ipAddress",
    "isWifiSecure",
];
const WifiEventTypes = WifiMessageTypes;
class WifiManager {
    constructor() {
        autoBind$1(this);
    }
    sendMessage;
    eventDispatcher;
    get #dispatchEvent() {
        return this.eventDispatcher.dispatchEvent;
    }
    get waitForEvent() {
        return this.eventDispatcher.waitForEvent;
    }
    requestRequiredInformation() {
        _console$y.log("requesting required wifi information");
        const messages = RequiredWifiMessageTypes.map((messageType) => ({
            type: messageType,
        }));
        this.sendMessage(messages, false);
    }
    #isWifiAvailable = false;
    get isWifiAvailable() {
        return this.#isWifiAvailable;
    }
    #updateIsWifiAvailable(updatedIsWifiAvailable) {
        _console$y.assertTypeWithError(updatedIsWifiAvailable, "boolean");
        this.#isWifiAvailable = updatedIsWifiAvailable;
        _console$y.log({ isWifiAvailable: this.#isWifiAvailable });
        this.#dispatchEvent("isWifiAvailable", {
            isWifiAvailable: this.#isWifiAvailable,
        });
    }
    #assertWifiIsAvailable() {
        _console$y.assertWithError(this.#isWifiAvailable, "wifi is not available");
    }
    #wifiSSID = "";
    get wifiSSID() {
        return this.#wifiSSID;
    }
    #updateWifiSSID(updatedWifiSSID) {
        _console$y.assertTypeWithError(updatedWifiSSID, "string");
        this.#wifiSSID = updatedWifiSSID;
        _console$y.log({ wifiSSID: this.#wifiSSID });
        this.#dispatchEvent("getWifiSSID", { wifiSSID: this.#wifiSSID });
    }
    async setWifiSSID(newWifiSSID) {
        this.#assertWifiIsAvailable();
        if (this.#wifiConnectionEnabled) {
            _console$y.error("cannot change ssid while wifi connection is enabled");
            return;
        }
        _console$y.assertTypeWithError(newWifiSSID, "string");
        if (newWifiSSID.length > 0) {
            _console$y.assertRangeWithError("wifiSSID", newWifiSSID.length, MinWifiSSIDLength, MaxWifiSSIDLength);
        }
        const setWifiSSIDData = textEncoder.encode(newWifiSSID);
        _console$y.log({ setWifiSSIDData });
        const promise = this.waitForEvent("getWifiSSID");
        this.sendMessage([{ type: "setWifiSSID", data: setWifiSSIDData.buffer }]);
        await promise;
    }
    #wifiPassword = "";
    get wifiPassword() {
        return this.#wifiPassword;
    }
    #updateWifiPassword(updatedWifiPassword) {
        _console$y.assertTypeWithError(updatedWifiPassword, "string");
        this.#wifiPassword = updatedWifiPassword;
        _console$y.log({ wifiPassword: this.#wifiPassword });
        this.#dispatchEvent("getWifiPassword", {
            wifiPassword: this.#wifiPassword,
        });
    }
    async setWifiPassword(newWifiPassword) {
        this.#assertWifiIsAvailable();
        if (this.#wifiConnectionEnabled) {
            _console$y.error("cannot change password while wifi connection is enabled");
            return;
        }
        _console$y.assertTypeWithError(newWifiPassword, "string");
        if (newWifiPassword.length > 0) {
            _console$y.assertRangeWithError("wifiPassword", newWifiPassword.length, MinWifiPasswordLength, MaxWifiPasswordLength);
        }
        const setWifiPasswordData = textEncoder.encode(newWifiPassword);
        _console$y.log({ setWifiPasswordData });
        const promise = this.waitForEvent("getWifiPassword");
        this.sendMessage([
            { type: "setWifiPassword", data: setWifiPasswordData.buffer },
        ]);
        await promise;
    }
    #wifiConnectionEnabled;
    get wifiConnectionEnabled() {
        return this.#wifiConnectionEnabled;
    }
    #updateWifiConnectionEnabled(wifiConnectionEnabled) {
        _console$y.log({ wifiConnectionEnabled });
        this.#wifiConnectionEnabled = wifiConnectionEnabled;
        this.#dispatchEvent("getWifiConnectionEnabled", {
            wifiConnectionEnabled: wifiConnectionEnabled,
        });
    }
    async setWifiConnectionEnabled(newWifiConnectionEnabled, sendImmediately = true) {
        this.#assertWifiIsAvailable();
        _console$y.assertTypeWithError(newWifiConnectionEnabled, "boolean");
        if (this.#wifiConnectionEnabled == newWifiConnectionEnabled) {
            _console$y.log(`redundant wifiConnectionEnabled assignment ${newWifiConnectionEnabled}`);
            return;
        }
        const promise = this.waitForEvent("getWifiConnectionEnabled");
        this.sendMessage([
            {
                type: "setWifiConnectionEnabled",
                data: UInt8ByteBuffer(Number(newWifiConnectionEnabled)),
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
    #isWifiConnected = false;
    get isWifiConnected() {
        return this.#isWifiConnected;
    }
    #updateIsWifiConnected(updatedIsWifiConnected) {
        _console$y.assertTypeWithError(updatedIsWifiConnected, "boolean");
        this.#isWifiConnected = updatedIsWifiConnected;
        _console$y.log({ isWifiConnected: this.#isWifiConnected });
        this.#dispatchEvent("isWifiConnected", {
            isWifiConnected: this.#isWifiConnected,
        });
    }
    #ipAddress;
    get ipAddress() {
        return this.#ipAddress;
    }
    #updateIpAddress(updatedIpAddress) {
        this.#ipAddress = updatedIpAddress;
        _console$y.log({ ipAddress: this.#ipAddress });
        this.#dispatchEvent("ipAddress", {
            ipAddress: this.#ipAddress,
        });
    }
    #isWifiSecure = false;
    get isWifiSecure() {
        return this.#isWifiSecure;
    }
    #updateIsWifiSecure(updatedIsWifiSecure) {
        _console$y.assertTypeWithError(updatedIsWifiSecure, "boolean");
        this.#isWifiSecure = updatedIsWifiSecure;
        _console$y.log({ isWifiSecure: this.#isWifiSecure });
        this.#dispatchEvent("isWifiSecure", {
            isWifiSecure: this.#isWifiSecure,
        });
    }
    parseMessage(messageType, dataView, isSending) {
        _console$y.log({ messageType, isSending }, dataView);
        switch (messageType) {
            case "isWifiAvailable":
                const isWifiAvailable = Boolean(dataView.getUint8(0));
                _console$y.log({ isWifiAvailable });
                this.#updateIsWifiAvailable(isWifiAvailable);
                break;
            case "getWifiSSID":
            case "setWifiSSID":
                const ssid = textDecoder.decode(dataView.buffer);
                _console$y.log({ ssid });
                this.#updateWifiSSID(ssid);
                break;
            case "getWifiPassword":
            case "setWifiPassword":
                const password = textDecoder.decode(dataView.buffer);
                _console$y.log({ password });
                this.#updateWifiPassword(password);
                break;
            case "getWifiConnectionEnabled":
            case "setWifiConnectionEnabled":
                const enableWifiConnection = Boolean(dataView.getUint8(0));
                _console$y.log({ enableWifiConnection });
                this.#updateWifiConnectionEnabled(enableWifiConnection);
                break;
            case "isWifiConnected":
                const isWifiConnected = Boolean(dataView.getUint8(0));
                _console$y.log({ isWifiConnected });
                this.#updateIsWifiConnected(isWifiConnected);
                break;
            case "ipAddress":
                let ipAddress = undefined;
                if (dataView.byteLength == 4) {
                    ipAddress = new Uint8Array(dataView.buffer.slice(0, 4)).join(".");
                }
                _console$y.log({ ipAddress });
                this.#updateIpAddress(ipAddress);
                break;
            case "isWifiSecure":
                const isWifiSecure = Boolean(dataView.getUint8(0));
                _console$y.log({ isWifiSecure });
                this.#updateIsWifiSecure(isWifiSecure);
                break;
            default:
                throw Error(`uncaught messageType ${messageType}`);
        }
    }
    clear() {
        this.#wifiSSID = "";
        this.#wifiPassword = "";
        this.#ipAddress = "";
        this.#isWifiConnected = false;
        this.#isWifiAvailable = false;
    }
}

function __esDecorate(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
}function __runInitializers(thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
}typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

const _console$x = createConsole("ColorUtils", { log: false });
function hexToRGB(hex) {
    hex = hex.replace(/^#/, "");
    if (hex.length == 3) {
        hex = hex
            .split("")
            .map((char) => char + char)
            .join("");
    }
    _console$x.assertWithError(hex.length == 6, `hex length must be 6 (got ${hex.length})`);
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return { r, g, b };
}
const blackColor = { r: 0, g: 0, b: 0 };
const whiteColor = { r: 255, g: 255, b: 255 };
function colorNameToRGB(colorName) {
    const temp = document.createElement("div");
    temp.style.color = colorName;
    document.body.appendChild(temp);
    const computedColor = getComputedStyle(temp).color;
    document.body.removeChild(temp);
    const match = computedColor.match(/^rgba?\((\d+), (\d+), (\d+)/);
    if (!match)
        return blackColor;
    return {
        r: parseInt(match[1], 10),
        g: parseInt(match[2], 10),
        b: parseInt(match[3], 10),
    };
}
function clampColor(color, maxColor) {
    return {
        r: Math.min(color.r, maxColor.r),
        g: Math.min(color.g, maxColor.g),
        b: Math.min(color.b, maxColor.b),
    };
}
function roundColor(color) {
    const { r, g, b } = color;
    return {
        r: r == 0 ? 0 : 255,
        g: g == 0 ? 0 : 255,
        b: b == 0 ? 0 : 255,
    };
}
function projectColor(color, maxColor) {
    const { r, g, b } = clampColor(color, maxColor);
    return (r + g + b) / (maxColor.r + maxColor.g + maxColor.b);
}
function scaleColor(color, scalar) {
    const { r, g, b } = color;
    return {
        r: Math.round(r * scalar),
        g: Math.round(g * scalar),
        b: Math.round(b * scalar),
    };
}
function areColorsEqual(A, B) {
    return A.r == B.r && A.g == B.g && A.b == B.b;
}
function stringToRGB(string) {
    if (string.startsWith("#")) {
        return hexToRGB(string);
    }
    else {
        return colorNameToRGB(string);
    }
}
function rgbToHex({ r, g, b }) {
    const toHex = (value) => value.toString(16).padStart(2, "0").toLowerCase();
    _console$x.assertWithError([r, g, b].every((v) => v >= 0 && v <= 255), `RGB values must be between 0 and 255 (got r=${r}, g=${g}, b=${b})`);
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const DisplaySegmentCaps = ["flat", "round"];
const DisplayAlignments = ["start", "center", "end"];
const DisplayAlignmentDirections = ["horizontal", "vertical"];
const DisplayDirections = ["right", "left", "up", "down"];
const DefaultDisplayContextState = {
    backgroundColorIndex: 0,
    fillColorIndex: 1,
    lineColorIndex: 1,
    ignoreFill: false,
    ignoreLine: false,
    fillBackground: false,
    lineWidth: 0,
    rotation: 0,
    horizontalAlignment: "center",
    verticalAlignment: "center",
    segmentStartCap: "flat",
    segmentEndCap: "flat",
    segmentStartRadius: 1,
    segmentEndRadius: 1,
    cropTop: 0,
    cropRight: 0,
    cropBottom: 0,
    cropLeft: 0,
    rotationCropTop: 0,
    rotationCropRight: 0,
    rotationCropBottom: 0,
    rotationCropLeft: 0,
    bitmapColorIndices: new Array(0).fill(0),
    bitmapScaleX: 1,
    bitmapScaleY: 1,
    spriteColorIndices: new Array(0).fill(0),
    spriteScaleX: 1,
    spriteScaleY: 1,
    spriteSheetName: undefined,
    spritesLineHeight: 0,
    spritesDirection: "right",
    spritesLineDirection: "down",
    spritesSpacing: 0,
    spritesLineSpacing: 0,
    spritesAlignment: "end",
    spritesLineAlignment: "start",
};
function isDirectionPositive(direction) {
    switch (direction) {
        case "right":
        case "down":
            return true;
        case "left":
        case "up":
            return false;
    }
}
function isDirectionHorizontal(direction) {
    switch (direction) {
        case "right":
        case "left":
            return true;
        case "down":
        case "up":
            return false;
    }
}

function deepEqual(obj1, obj2) {
    if (obj1 === obj2) {
        return true;
    }
    if (typeof obj1 !== "object" ||
        obj1 === null ||
        typeof obj2 !== "object" ||
        obj2 === null) {
        return false;
    }
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length)
        return false;
    for (let key of keys1) {
        if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
            return false;
        }
    }
    return true;
}
function removeRedundancies(array) {
    return Array.from(new Set(array));
}

const _console$w = createConsole("DisplayContextStateHelper", { log: false });
class DisplayContextStateHelper {
    #state = Object.assign({}, DefaultDisplayContextState);
    get state() {
        return this.#state;
    }
    get isSegmentUniform() {
        return (this.state.segmentStartRadius == this.state.segmentEndRadius &&
            this.state.segmentStartCap == this.state.segmentEndCap);
    }
    diff(other = DefaultDisplayContextState) {
        let differences = [];
        const keys = Object.keys(other);
        keys.forEach((key) => {
            const value = other[key];
            if (!deepEqual(this.#state[key], value)) {
                differences.push(key);
            }
        });
        _console$w.log("diff displayContextState", other, differences);
        return differences;
    }
    update(newState) {
        let differences = this.diff(newState);
        if (differences.length == 0) {
            _console$w.log("redundant contextState", newState);
        }
        else {
            _console$w.log("found contextState differences", newState);
        }
        differences.forEach((key) => {
            const value = newState[key];
            this.#state[key] = value;
        });
        return differences;
    }
    reset(numberOfColors, keepColorIndices, keepSpriteColorIndices) {
        const spriteColorIndices = this.#state.spriteColorIndices.slice();
        const { fillColorIndex, lineColorIndex, backgroundColorIndex } = this.#state;
        Object.assign(this.#state, DefaultDisplayContextState);
        if (keepColorIndices) {
            this.#state.fillColorIndex = fillColorIndex;
            this.#state.lineColorIndex = lineColorIndex;
            this.#state.backgroundColorIndex = backgroundColorIndex;
        }
        if (keepSpriteColorIndices) {
            this.#state.spriteColorIndices = spriteColorIndices;
        }
        else {
            this.#state.spriteColorIndices = new Array(numberOfColors).fill(0);
        }
        this.#state.bitmapColorIndices = new Array(numberOfColors).fill(0);
    }
    serialize(numberOfColors, other) {
        if (!other) {
            other = structuredClone(DefaultDisplayContextState);
            other.spriteColorIndices = new Array(numberOfColors).fill(0);
            other.bitmapColorIndices = new Array(numberOfColors).fill(0);
        }
        const contextCommands = [];
        const differences = this.diff(other);
        const state = other;
        _console$w.log("serialize displayContextState", other, differences);
        differences.forEach((difference) => {
            if (state[difference] == undefined) {
                return;
            }
            switch (difference) {
                case "backgroundColorIndex":
                    contextCommands.push({
                        type: "selectBackgroundColor",
                        backgroundColorIndex: state[difference],
                    });
                    break;
                case "fillBackground":
                    contextCommands.push({
                        type: "setFillBackground",
                        fillBackground: state[difference],
                    });
                    break;
                case "ignoreFill":
                    contextCommands.push({
                        type: "setIgnoreFill",
                        ignoreFill: state[difference],
                    });
                    break;
                case "ignoreLine":
                    contextCommands.push({
                        type: "setIgnoreLine",
                        ignoreLine: state[difference],
                    });
                    break;
                case "fillColorIndex":
                    contextCommands.push({
                        type: "selectFillColor",
                        fillColorIndex: state[difference],
                    });
                    break;
                case "lineColorIndex":
                    contextCommands.push({
                        type: "selectLineColor",
                        lineColorIndex: state[difference],
                    });
                    break;
                case "lineWidth":
                    contextCommands.push({
                        type: "setLineWidth",
                        lineWidth: state[difference],
                    });
                    break;
                case "horizontalAlignment":
                    contextCommands.push({
                        type: "setHorizontalAlignment",
                        horizontalAlignment: state[difference],
                    });
                    break;
                case "verticalAlignment":
                    contextCommands.push({
                        type: "setVerticalAlignment",
                        verticalAlignment: state[difference],
                    });
                    break;
                case "rotation":
                    contextCommands.push({
                        type: "setRotation",
                        rotation: state[difference],
                    });
                    break;
                case "segmentStartCap":
                    if (differences.includes("segmentEndCap") &&
                        state.segmentStartCap == state.segmentEndCap) {
                        contextCommands.push({
                            type: "setSegmentCap",
                            segmentCap: state[difference],
                        });
                    }
                    else {
                        contextCommands.push({
                            type: "setSegmentStartCap",
                            segmentStartCap: state[difference],
                        });
                    }
                    break;
                case "segmentEndCap":
                    if (!differences.includes("segmentStartCap") ||
                        state.segmentStartCap != state.segmentEndCap) {
                        contextCommands.push({
                            type: "setSegmentEndCap",
                            segmentEndCap: state[difference],
                        });
                    }
                    break;
                case "segmentStartRadius":
                    if (differences.includes("segmentEndRadius") &&
                        state.segmentStartRadius == state.segmentEndRadius) {
                        contextCommands.push({
                            type: "setSegmentRadius",
                            segmentRadius: state[difference],
                        });
                    }
                    else {
                        contextCommands.push({
                            type: "setSegmentStartRadius",
                            segmentStartRadius: state[difference],
                        });
                    }
                    break;
                case "segmentEndRadius":
                    if (!differences.includes("segmentStartRadius") ||
                        state.segmentStartRadius != state.segmentEndRadius) {
                        contextCommands.push({
                            type: "setSegmentEndRadius",
                            segmentEndRadius: state[difference],
                        });
                    }
                    break;
                case "cropTop":
                    contextCommands.push({
                        type: "setCropTop",
                        cropTop: state[difference],
                    });
                    break;
                case "cropRight":
                    contextCommands.push({
                        type: "setCropRight",
                        cropRight: state[difference],
                    });
                    break;
                case "cropBottom":
                    contextCommands.push({
                        type: "setCropBottom",
                        cropBottom: state[difference],
                    });
                    break;
                case "cropLeft":
                    contextCommands.push({
                        type: "setCropLeft",
                        cropLeft: state[difference],
                    });
                    break;
                case "rotationCropTop":
                    contextCommands.push({
                        type: "setRotationCropTop",
                        rotationCropTop: state[difference],
                    });
                    break;
                case "rotationCropRight":
                    contextCommands.push({
                        type: "setRotationCropRight",
                        rotationCropRight: state[difference],
                    });
                    break;
                case "rotationCropBottom":
                    contextCommands.push({
                        type: "setRotationCropBottom",
                        rotationCropBottom: state[difference],
                    });
                    break;
                case "rotationCropLeft":
                    contextCommands.push({
                        type: "setRotationCropLeft",
                        rotationCropLeft: state[difference],
                    });
                    break;
                case "bitmapColorIndices":
                    const bitmapColorPairs = [];
                    state.bitmapColorIndices.forEach((colorIndex, bitmapColorIndex) => {
                        bitmapColorPairs.push({ bitmapColorIndex, colorIndex });
                    });
                    contextCommands.push({
                        type: "selectBitmapColors",
                        bitmapColorPairs,
                    });
                    break;
                case "bitmapScaleX":
                    if (differences.includes("bitmapScaleY") &&
                        state.bitmapScaleX == state.bitmapScaleY) {
                        contextCommands.push({
                            type: "setBitmapScale",
                            bitmapScale: state[difference],
                        });
                    }
                    else {
                        contextCommands.push({
                            type: "setBitmapScaleX",
                            bitmapScaleX: state[difference],
                        });
                    }
                    break;
                case "bitmapScaleY":
                    if (!differences.includes("bitmapScaleX") ||
                        state.bitmapScaleX != state.bitmapScaleY) {
                        contextCommands.push({
                            type: "setBitmapScaleY",
                            bitmapScaleY: state[difference],
                        });
                    }
                    break;
                case "spriteColorIndices":
                    const spriteColorPairs = [];
                    state.spriteColorIndices.forEach((colorIndex, spriteColorIndex) => {
                        spriteColorPairs.push({ spriteColorIndex, colorIndex });
                    });
                    contextCommands.push({
                        type: "selectSpriteColors",
                        spriteColorPairs,
                    });
                    break;
                case "spriteScaleX":
                    if (differences.includes("spriteScaleY") &&
                        state.spriteScaleX == state.spriteScaleY) {
                        contextCommands.push({
                            type: "setSpriteScale",
                            spriteScale: state[difference],
                        });
                    }
                    else {
                        contextCommands.push({
                            type: "setSpriteScaleX",
                            spriteScaleX: state[difference],
                        });
                    }
                    break;
                case "spriteScaleY":
                    if (!differences.includes("spriteScaleX") ||
                        state.spriteScaleX != state.spriteScaleY) {
                        contextCommands.push({
                            type: "setSpriteScaleY",
                            spriteScaleY: state[difference],
                        });
                    }
                    break;
                case "spritesLineHeight":
                    contextCommands.push({
                        type: "setSpritesLineHeight",
                        spritesLineHeight: state[difference],
                    });
                    break;
                case "spritesDirection":
                    contextCommands.push({
                        type: "setSpritesDirection",
                        spritesDirection: state[difference],
                    });
                    break;
                case "spritesLineDirection":
                    contextCommands.push({
                        type: "setSpritesLineDirection",
                        spritesLineDirection: state[difference],
                    });
                    break;
                case "spritesSpacing":
                    contextCommands.push({
                        type: "setSpritesSpacing",
                        spritesSpacing: state[difference],
                    });
                    break;
                case "spritesLineSpacing":
                    contextCommands.push({
                        type: "setSpritesLineSpacing",
                        spritesLineSpacing: state[difference],
                    });
                    break;
                case "spritesAlignment":
                    contextCommands.push({
                        type: "setSpritesAlignment",
                        spritesAlignment: state[difference],
                    });
                    break;
                case "spritesLineAlignment":
                    contextCommands.push({
                        type: "setSpritesLineAlignment",
                        spritesLineAlignment: state[difference],
                    });
                    break;
            }
        });
        _console$w.log("serialized displayContextState", contextCommands);
        return contextCommands;
    }
}

const _console$v = createConsole("DisplayUtils", { log: false });
function formatRotation(rotation, isRadians, isSigned) {
    if (isRadians) {
        const rotationRad = rotation;
        _console$v.log({ rotationRad });
        if (isSigned) {
            rotation = clamp(rotation, -twoPi, twoPi);
        }
        else {
            rotation %= twoPi;
        }
        rotation /= twoPi;
    }
    else {
        const rotationDeg = rotation;
        _console$v.log({ rotationDeg });
        if (isSigned) {
            rotation = clamp(rotation, -360, 360);
        }
        else {
            rotation %= 360;
        }
        rotation /= 360;
    }
    if (isSigned) {
        rotation *= (rotation > 0 ? Int16Max - 1 : 32769) - 1;
    }
    else {
        rotation *= Uint16Max;
    }
    rotation = Math.floor(rotation);
    _console$v.log({ formattedRotation: rotation });
    return rotation;
}
function parseRotation(formattedRotation, isRadians, isSigned) {
    let rotation = formattedRotation;
    if (isSigned) {
        rotation /= Int16Max;
    }
    else {
        rotation /= Uint16Max;
    }
    {
        rotation *= 2 * Math.PI;
    }
    _console$v.log({ parsedRotation: rotation });
    return rotation;
}
function roundToStep(value, step) {
    const roundedValue = Math.round(value / step) * step;
    return roundedValue;
}
const minDisplayScale = -50;
const maxDisplayScale = 50;
const displayScaleStep = 0.002;
function formatScale(scale) {
    scale /= displayScaleStep;
    return scale;
}
function parseScale(scale) {
    scale *= displayScaleStep;
    return scale;
}
function roundScale(scale) {
    return roundToStep(scale, displayScaleStep);
}
function assertValidSegmentCap(segmentCap) {
    _console$v.assertEnumWithError(segmentCap, DisplaySegmentCaps);
}
function assertValidDisplayBrightness(displayBrightness) {
    _console$v.assertEnumWithError(displayBrightness, DisplayBrightnesses);
}
function assertValidColorValue(name, value) {
    _console$v.assertRangeWithError(name, value, 0, 255);
}
function assertValidColor(color) {
    assertValidColorValue("red", color.r);
    assertValidColorValue("green", color.g);
    assertValidColorValue("blue", color.b);
}
function assertValidOpacity(value) {
    _console$v.assertRangeWithError("opacity", value, 0, 1);
}
const DisplayCropDirections = [
    "top",
    "right",
    "bottom",
    "left",
];
const DisplayCropDirectionToStateKey = {
    top: "cropTop",
    right: "cropRight",
    bottom: "cropBottom",
    left: "cropLeft",
};
const DisplayCropDirectionToCommandType = {
    top: "setCropTop",
    right: "setCropRight",
    bottom: "setCropBottom",
    left: "setCropLeft",
};
const DisplayRotationCropDirectionToStateKey = {
    top: "rotationCropTop",
    right: "rotationCropRight",
    bottom: "rotationCropBottom",
    left: "rotationCropLeft",
};
const DisplayRotationCropDirectionToCommandType = {
    top: "setRotationCropTop",
    right: "setRotationCropRight",
    bottom: "setRotationCropBottom",
    left: "setRotationCropLeft",
};
const DisplayAlignmentDirectionToCommandType = {
    horizontal: "setHorizontalAlignment",
    vertical: "setVerticalAlignment",
};
const DisplayAlignmentDirectionToStateKey = {
    horizontal: "horizontalAlignment",
    vertical: "verticalAlignment",
};
function pixelDepthToNumberOfColors(pixelDepth) {
    return 2 ** Number(pixelDepth);
}
function pixelDepthToPixelsPerByte(pixelDepth) {
    return 8 / Number(pixelDepth);
}
function pixelDepthToPixelBitWidth(pixelDepth) {
    return Number(pixelDepth);
}
function numberOfColorsToPixelDepth(numberOfColors) {
    return DisplayPixelDepths.find((pixelDepth) => numberOfColors <= pixelDepthToNumberOfColors(pixelDepth));
}
const DisplayBitmapScaleDirectionToCommandType = {
    x: "setBitmapScaleX",
    y: "setBitmapScaleY",
    all: "setBitmapScale",
};
function assertValidAlignment(alignment) {
    _console$v.assertEnumWithError(alignment, DisplayAlignments);
}
function assertValidDirection(direction) {
    _console$v.assertEnumWithError(direction, DisplayDirections);
}
function assertValidAlignmentDirection(direction) {
    _console$v.assertEnumWithError(direction, DisplayAlignmentDirections);
}
const displayCurveTypeToNumberOfControlPoints = {
    segment: 2,
    quadratic: 3,
    cubic: 4,
};
function assertValidNumberOfControlPoints(curveType, controlPoints, isPath = false) {
    const numberOfControlPoints = getNumberOfConrolPoints(curveType, isPath);
    _console$v.assertWithError(controlPoints.length == numberOfControlPoints, `invalid number of control points ${controlPoints.length}, expected ${numberOfControlPoints}`);
}
function getNumberOfConrolPoints(curveType, isPath = false) {
    let numberOfControlPoints = displayCurveTypeToNumberOfControlPoints[curveType];
    if (isPath) {
        numberOfControlPoints -= 1;
    }
    return numberOfControlPoints;
}
function assertValidPathNumberOfControlPoints(curveType, controlPoints) {
    const numberOfControlPoints = displayCurveTypeToNumberOfControlPoints[curveType];
    _console$v.assertWithError((controlPoints.length - 1) % (numberOfControlPoints - 1) == 0, `invalid number of path control points ${controlPoints.length} for path "${curveType}"`);
}
function assertValidPath(curves) {
    curves.forEach((curve, index) => {
        const { type, controlPoints } = curve;
        assertValidNumberOfControlPoints(type, controlPoints, index > 0);
    });
}
function assertValidWireframe({ points, edges }) {
    _console$v.assertRangeWithError("numberOfPoints", points.length, 2, 255);
    _console$v.assertRangeWithError("numberOfEdges", edges.length, 1, 255);
    edges.forEach((edge, index) => {
        _console$v.assertRangeWithError(`edgeStartIndex.${index}`, edge.startIndex, 0, points.length);
        _console$v.assertRangeWithError(`edgeEndIndex.${index}`, edge.endIndex, 0, points.length);
    });
}
function isWireframePolygon({ points, edges, }) {
    _console$v.log("isWireframePolygon?", points, edges);
    if (points.length != edges.length) {
        return;
    }
    const _edges = edges.slice();
    let pointIndices = [];
    for (let i = 0; i < points.length; i++) {
        if (i == 0) {
            const { startIndex, endIndex } = _edges.shift();
            pointIndices.push(startIndex);
            pointIndices.push(endIndex);
        }
        else {
            const startIndex = pointIndices.at(-1);
            const edge = _edges.find((edge) => edge.startIndex == startIndex || edge.endIndex == startIndex);
            _console$v.log(i, "edge", edge);
            if (edge) {
                _edges.splice(_edges.indexOf(edge), 1);
                const endIndex = edge.startIndex == startIndex ? edge.endIndex : edge.startIndex;
                if (i == points.length - 1) {
                    if (endIndex != pointIndices[0]) {
                        return;
                    }
                }
                else if (pointIndices.includes(endIndex)) {
                    _console$v.log("duplicate endIndex", endIndex);
                    return;
                }
                pointIndices.push(endIndex);
            }
            else {
                _console$v.log("no edge found");
                return;
            }
        }
        _console$v.log("remaining edges", _edges);
    }
    _console$v.log("pointIndices", pointIndices);
    const polygon = pointIndices
        .map((pointIndex) => points[pointIndex])
        .filter((point, index, polygon) => polygon.indexOf(point) == index);
    if (polygon.length == points.length) {
        polygon.push(polygon[0]);
        _console$v.log("polygon", polygon);
        return polygon;
    }
}
function trimWireframe(wireframe) {
    _console$v.log("trimming wireframe", wireframe);
    const { points, edges } = wireframe;
    const trimmedPoints = [];
    const trimmedEdges = [];
    edges.forEach((edge) => {
        const { startIndex, endIndex } = edge;
        let startPoint = points[startIndex];
        let endPoint = points[endIndex];
        let trimmedStartIndex = trimmedPoints.findIndex(({ x, y }) => startPoint.x == x && startPoint.y == y);
        if (trimmedStartIndex == -1) {
            trimmedPoints.push(startPoint);
            trimmedStartIndex = trimmedPoints.length - 1;
        }
        let trimmedEndIndex = trimmedPoints.findIndex(({ x, y }) => endPoint.x == x && endPoint.y == y);
        if (trimmedEndIndex == -1) {
            trimmedPoints.push(endPoint);
            trimmedEndIndex = trimmedPoints.length - 1;
        }
        const trimmedEdge = {
            startIndex: trimmedStartIndex,
            endIndex: trimmedEndIndex,
        };
        let trimmedEdgeIndex = trimmedEdges.findIndex(({ startIndex, endIndex }) => startIndex == trimmedEdge.startIndex &&
            endIndex == trimmedEdge.endIndex);
        if (trimmedEdgeIndex == -1) {
            trimmedEdges.push(trimmedEdge);
            trimmedEdgeIndex = trimmedEdges.length - 1;
        }
    });
    _console$v.log("trimmedWireframe", trimmedPoints, trimmedEdges);
    return { points: trimmedPoints, edges: trimmedEdges };
}
function getPointDataType(points) {
    const range = new RangeHelper();
    points.forEach(({ x, y }) => {
        range.update(x);
        range.update(y);
    });
    const pointDataType = DisplayPointDataTypes.find((pointDataType) => {
        const { min, max } = displayPointDataTypeToRange[pointDataType];
        return range.min >= min && range.max <= max;
    });
    _console$v.log("pointDataType", pointDataType, points);
    return pointDataType;
}
function serializePoints(points, pointDataType, isPath = false) {
    pointDataType = pointDataType || getPointDataType(points);
    _console$v.assertEnumWithError(pointDataType, DisplayPointDataTypes);
    const pointDataSize = displayPointDataTypeToSize[pointDataType];
    let dataViewLength = points.length * pointDataSize;
    if (!isPath) {
        dataViewLength += 2;
    }
    const dataView = new DataView(new ArrayBuffer(dataViewLength));
    _console$v.log(`serializing ${points.length} ${pointDataType} points (${dataView.byteLength} bytes)...`);
    let offset = 0;
    if (!isPath) {
        dataView.setUint8(offset++, DisplayPointDataTypes.indexOf(pointDataType));
        dataView.setUint8(offset++, points.length);
    }
    points.forEach(({ x, y }) => {
        switch (pointDataType) {
            case "int8":
                dataView.setInt8(offset, x);
                offset += 1;
                dataView.setInt8(offset, y);
                offset += 1;
                break;
            case "int16":
                dataView.setInt16(offset, x, true);
                offset += 2;
                dataView.setInt16(offset, y, true);
                offset += 2;
                break;
            case "float":
                dataView.setFloat32(offset, x, true);
                offset += 4;
                dataView.setFloat32(offset, y, true);
                offset += 4;
                break;
        }
    });
    return dataView;
}
function parsePoints(dataView, offset) {
    const points = [];
    const pointDataType = DisplayPointDataTypes[dataView.getUint8(offset++)];
    _console$v.assertEnumWithError(pointDataType, DisplayPointDataTypes);
    const numberOfPoints = dataView.getUint8(offset++);
    _console$v.assertWithError(numberOfPoints >= 3, `numberOfPoints ${numberOfPoints} must be at least 3`);
    for (let i = 0; i < numberOfPoints; i++) {
        let x, y;
        switch (pointDataType) {
            case "int8":
                x = dataView.getInt8(offset++);
                y = dataView.getInt8(offset++);
                break;
            case "int16":
                x = dataView.getInt16(offset, true);
                offset += 2;
                y = dataView.getInt16(offset, true);
                offset += 2;
                break;
            case "float":
                x = dataView.getFloat32(offset, true);
                offset += 4;
                y = dataView.getFloat32(offset, true);
                offset += 4;
                break;
            default:
                throw Error(`uncaught pointDataType "${pointDataType}"`);
        }
        points.push({ x, y });
    }
    return { points, offset };
}

const _console$u = createConsole("DisplayContextCommand", { log: false });
const DisplayContextCommandTypes = [
    "show",
    "clear",
    "setColor",
    "setColorOpacity",
    "setOpacity",
    "saveContext",
    "restoreContext",
    "selectBackgroundColor",
    "selectFillColor",
    "selectLineColor",
    "setIgnoreFill",
    "setIgnoreLine",
    "setFillBackground",
    "setLineWidth",
    "setRotation",
    "clearRotation",
    "setHorizontalAlignment",
    "setVerticalAlignment",
    "resetAlignment",
    "setSegmentStartCap",
    "setSegmentEndCap",
    "setSegmentCap",
    "setSegmentStartRadius",
    "setSegmentEndRadius",
    "setSegmentRadius",
    "setCropTop",
    "setCropRight",
    "setCropBottom",
    "setCropLeft",
    "clearCrop",
    "setRotationCropTop",
    "setRotationCropRight",
    "setRotationCropBottom",
    "setRotationCropLeft",
    "clearRotationCrop",
    "selectBitmapColor",
    "selectBitmapColors",
    "setBitmapScaleX",
    "setBitmapScaleY",
    "setBitmapScale",
    "resetBitmapScale",
    "selectSpriteColor",
    "selectSpriteColors",
    "resetSpriteColors",
    "setSpriteScaleX",
    "setSpriteScaleY",
    "setSpriteScale",
    "resetSpriteScale",
    "setSpritesLineHeight",
    "setSpritesDirection",
    "setSpritesLineDirection",
    "setSpritesSpacing",
    "setSpritesLineSpacing",
    "setSpritesAlignment",
    "setSpritesLineAlignment",
    "clearRect",
    "drawRect",
    "drawRoundRect",
    "drawCircle",
    "drawArc",
    "drawEllipse",
    "drawArcEllipse",
    "drawSegment",
    "drawSegments",
    "drawRegularPolygon",
    "drawPolygon",
    "drawWireframe",
    "drawQuadraticBezierCurve",
    "drawQuadraticBezierCurves",
    "drawCubicBezierCurve",
    "drawCubicBezierCurves",
    "drawPath",
    "drawClosedPath",
    "drawBitmap",
    "selectSpriteSheet",
    "drawSprite",
    "drawSprites",
    "startSprite",
    "endSprite",
    "clearContext",
];
const DisplaySpriteContextCommandTypes = [
    "selectFillColor",
    "selectLineColor",
    "setIgnoreFill",
    "setIgnoreLine",
    "setLineWidth",
    "setRotation",
    "clearRotation",
    "setVerticalAlignment",
    "setHorizontalAlignment",
    "resetAlignment",
    "setSegmentStartCap",
    "setSegmentEndCap",
    "setSegmentCap",
    "setSegmentStartRadius",
    "setSegmentEndRadius",
    "setSegmentRadius",
    "setCropTop",
    "setCropRight",
    "setCropBottom",
    "setCropLeft",
    "clearCrop",
    "setRotationCropTop",
    "setRotationCropRight",
    "setRotationCropBottom",
    "setRotationCropLeft",
    "clearRotationCrop",
    "selectBitmapColor",
    "selectBitmapColors",
    "setBitmapScaleX",
    "setBitmapScaleY",
    "setBitmapScale",
    "resetBitmapScale",
    "selectSpriteColor",
    "selectSpriteColors",
    "resetSpriteColors",
    "setSpriteScaleX",
    "setSpriteScaleY",
    "setSpriteScale",
    "resetSpriteScale",
    "clearRect",
    "drawRect",
    "drawRoundRect",
    "drawCircle",
    "drawEllipse",
    "drawRegularPolygon",
    "drawPolygon",
    "drawWireframe",
    "drawQuadraticBezierCurve",
    "drawQuadraticBezierCurves",
    "drawCubicBezierCurve",
    "drawCubicBezierCurves",
    "drawPath",
    "drawClosedPath",
    "drawSegment",
    "drawSegments",
    "drawArc",
    "drawArcEllipse",
    "drawBitmap",
    "drawSprite",
];
function serializeDisplayContextCommandData(displayManager, command) {
    let dataView;
    switch (command.type) {
        case "show":
        case "clear":
        case "saveContext":
        case "restoreContext":
        case "clearRotation":
        case "clearCrop":
        case "clearRotationCrop":
        case "resetBitmapScale":
        case "resetSpriteColors":
        case "resetSpriteScale":
        case "resetAlignment":
        case "endSprite":
        case "clearContext":
            break;
        case "setColor":
            {
                let { color, colorIndex } = command;
                displayManager.assertValidColorIndex(colorIndex);
                if (typeof color == "string") {
                    color = stringToRGB(color);
                }
                displayManager.assertValidColorIndex(colorIndex);
                assertValidColor(color);
                dataView = new DataView(new ArrayBuffer(4));
                dataView.setUint8(0, colorIndex);
                dataView.setUint8(1, color.r);
                dataView.setUint8(2, color.g);
                dataView.setUint8(3, color.b);
            }
            break;
        case "setColorOpacity":
            {
                const { colorIndex, opacity } = command;
                displayManager.assertValidColorIndex(colorIndex);
                assertValidOpacity(opacity);
                dataView = new DataView(new ArrayBuffer(2));
                dataView.setUint8(0, colorIndex);
                dataView.setUint8(1, Math.round(opacity * 255));
            }
            break;
        case "setOpacity":
            {
                const { opacity } = command;
                assertValidOpacity(opacity);
                dataView = new DataView(new ArrayBuffer(1));
                dataView.setUint8(0, Math.round(opacity * 255));
            }
            break;
        case "selectFillColor":
            {
                const { fillColorIndex } = command;
                displayManager.assertValidColorIndex(fillColorIndex);
                dataView = new DataView(new ArrayBuffer(1));
                dataView.setUint8(0, fillColorIndex);
            }
            break;
        case "selectBackgroundColor":
            {
                const { backgroundColorIndex } = command;
                displayManager.assertValidColorIndex(backgroundColorIndex);
                dataView = new DataView(new ArrayBuffer(1));
                dataView.setUint8(0, backgroundColorIndex);
            }
            break;
        case "selectLineColor":
            {
                const { lineColorIndex } = command;
                displayManager.assertValidColorIndex(lineColorIndex);
                dataView = new DataView(new ArrayBuffer(1));
                dataView.setUint8(0, lineColorIndex);
            }
            break;
        case "setIgnoreFill":
            {
                const { ignoreFill } = command;
                dataView = new DataView(new ArrayBuffer(1));
                dataView.setUint8(0, ignoreFill ? 1 : 0);
            }
            break;
        case "setIgnoreLine":
            {
                const { ignoreLine } = command;
                dataView = new DataView(new ArrayBuffer(1));
                dataView.setUint8(0, ignoreLine ? 1 : 0);
            }
            break;
        case "setFillBackground":
            {
                const { fillBackground } = command;
                dataView = new DataView(new ArrayBuffer(1));
                dataView.setUint8(0, fillBackground ? 1 : 0);
            }
            break;
        case "setLineWidth":
            {
                const { lineWidth } = command;
                displayManager.assertValidLineWidth(lineWidth);
                dataView = new DataView(new ArrayBuffer(2));
                dataView.setUint16(0, lineWidth, true);
            }
            break;
        case "setHorizontalAlignment":
            {
                const { horizontalAlignment } = command;
                assertValidAlignment(horizontalAlignment);
                dataView = new DataView(new ArrayBuffer(1));
                const alignmentEnum = DisplayAlignments.indexOf(horizontalAlignment);
                dataView.setUint8(0, alignmentEnum);
            }
            break;
        case "setVerticalAlignment":
            {
                const { verticalAlignment } = command;
                assertValidAlignment(verticalAlignment);
                dataView = new DataView(new ArrayBuffer(1));
                const alignmentEnum = DisplayAlignments.indexOf(verticalAlignment);
                dataView.setUint8(0, alignmentEnum);
            }
            break;
        case "setRotation":
            {
                let { rotation, isRadians } = command;
                rotation = isRadians ? rotation : degToRad(rotation);
                rotation = normalizeRadians(rotation);
                isRadians = true;
                dataView = new DataView(new ArrayBuffer(2));
                dataView.setUint16(0, formatRotation(rotation, isRadians), true);
            }
            break;
        case "setSegmentStartCap":
            {
                const { segmentStartCap } = command;
                assertValidSegmentCap(segmentStartCap);
                dataView = new DataView(new ArrayBuffer(1));
                const segmentCapEnum = DisplaySegmentCaps.indexOf(segmentStartCap);
                dataView.setUint8(0, segmentCapEnum);
            }
            break;
        case "setSegmentEndCap":
            {
                const { segmentEndCap } = command;
                assertValidSegmentCap(segmentEndCap);
                dataView = new DataView(new ArrayBuffer(1));
                const segmentCapEnum = DisplaySegmentCaps.indexOf(segmentEndCap);
                dataView.setUint8(0, segmentCapEnum);
            }
            break;
        case "setSegmentCap":
            {
                const { segmentCap } = command;
                assertValidSegmentCap(segmentCap);
                dataView = new DataView(new ArrayBuffer(1));
                const segmentCapEnum = DisplaySegmentCaps.indexOf(segmentCap);
                dataView.setUint8(0, segmentCapEnum);
            }
            break;
        case "setSegmentStartRadius":
            {
                const { segmentStartRadius } = command;
                dataView = new DataView(new ArrayBuffer(2));
                dataView.setUint16(0, segmentStartRadius, true);
            }
            break;
        case "setSegmentEndRadius":
            {
                const { segmentEndRadius } = command;
                dataView = new DataView(new ArrayBuffer(2));
                dataView.setUint16(0, segmentEndRadius, true);
            }
            break;
        case "setSegmentRadius":
            {
                const { segmentRadius } = command;
                dataView = new DataView(new ArrayBuffer(2));
                dataView.setUint16(0, segmentRadius, true);
            }
            break;
        case "setCropTop":
            {
                const { cropTop } = command;
                dataView = new DataView(new ArrayBuffer(2));
                dataView.setUint16(0, cropTop, true);
            }
            break;
        case "setCropRight":
            {
                const { cropRight } = command;
                dataView = new DataView(new ArrayBuffer(2));
                dataView.setUint16(0, cropRight, true);
            }
            break;
        case "setCropBottom":
            {
                const { cropBottom } = command;
                dataView = new DataView(new ArrayBuffer(2));
                dataView.setUint16(0, cropBottom, true);
            }
            break;
        case "setCropLeft":
            {
                const { cropLeft } = command;
                dataView = new DataView(new ArrayBuffer(2));
                dataView.setUint16(0, cropLeft, true);
            }
            break;
        case "setRotationCropTop":
            {
                const { rotationCropTop } = command;
                dataView = new DataView(new ArrayBuffer(2));
                dataView.setUint16(0, rotationCropTop, true);
            }
            break;
        case "setRotationCropRight":
            {
                const { rotationCropRight } = command;
                dataView = new DataView(new ArrayBuffer(2));
                dataView.setUint16(0, rotationCropRight, true);
            }
            break;
        case "setRotationCropBottom":
            {
                const { rotationCropBottom } = command;
                dataView = new DataView(new ArrayBuffer(2));
                dataView.setUint16(0, rotationCropBottom, true);
            }
            break;
        case "setRotationCropLeft":
            {
                const { rotationCropLeft } = command;
                dataView = new DataView(new ArrayBuffer(2));
                dataView.setUint16(0, rotationCropLeft, true);
            }
            break;
        case "selectBitmapColor":
            {
                const { bitmapColorIndex, colorIndex } = command;
                displayManager.assertValidColorIndex(bitmapColorIndex);
                displayManager.assertValidColorIndex(colorIndex);
                dataView = new DataView(new ArrayBuffer(2));
                dataView.setUint8(0, bitmapColorIndex);
                dataView.setUint8(1, colorIndex);
            }
            break;
        case "selectBitmapColors":
            {
                const { bitmapColorPairs } = command;
                _console$u.assertRangeWithError("bitmapColors", bitmapColorPairs.length, 1, displayManager.numberOfColors);
                const bitmapColorIndices = displayManager.contextState.bitmapColorIndices.slice();
                bitmapColorPairs.forEach(({ bitmapColorIndex, colorIndex }) => {
                    displayManager.assertValidColorIndex(bitmapColorIndex);
                    displayManager.assertValidColorIndex(colorIndex);
                    bitmapColorIndices[bitmapColorIndex] = colorIndex;
                });
                dataView = new DataView(new ArrayBuffer(bitmapColorPairs.length * 2 + 1));
                let offset = 0;
                dataView.setUint8(offset++, bitmapColorPairs.length);
                bitmapColorPairs.forEach(({ bitmapColorIndex, colorIndex }) => {
                    dataView.setUint8(offset, bitmapColorIndex);
                    dataView.setUint8(offset + 1, colorIndex);
                    offset += 2;
                });
            }
            break;
        case "setBitmapScaleX":
            {
                let { bitmapScaleX } = command;
                bitmapScaleX = clamp(bitmapScaleX, minDisplayScale, maxDisplayScale);
                bitmapScaleX = roundScale(bitmapScaleX);
                dataView = new DataView(new ArrayBuffer(2));
                dataView.setInt16(0, formatScale(bitmapScaleX), true);
            }
            break;
        case "setBitmapScaleY":
            {
                let { bitmapScaleY } = command;
                bitmapScaleY = clamp(bitmapScaleY, minDisplayScale, maxDisplayScale);
                bitmapScaleY = roundScale(bitmapScaleY);
                dataView = new DataView(new ArrayBuffer(2));
                dataView.setInt16(0, formatScale(bitmapScaleY), true);
            }
            break;
        case "setBitmapScale":
            {
                let { bitmapScale } = command;
                bitmapScale = clamp(bitmapScale, minDisplayScale, maxDisplayScale);
                bitmapScale = roundScale(bitmapScale);
                dataView = new DataView(new ArrayBuffer(2));
                dataView.setInt16(0, formatScale(bitmapScale), true);
            }
            break;
        case "selectSpriteColor":
            {
                const { spriteColorIndex, colorIndex } = command;
                displayManager.assertValidColorIndex(spriteColorIndex);
                displayManager.assertValidColorIndex(colorIndex);
                dataView = new DataView(new ArrayBuffer(2));
                dataView.setUint8(0, spriteColorIndex);
                dataView.setUint8(1, colorIndex);
            }
            break;
        case "selectSpriteColors":
            {
                const { spriteColorPairs } = command;
                _console$u.assertRangeWithError("spriteColors", spriteColorPairs.length, 1, displayManager.numberOfColors);
                const spriteColorIndices = displayManager.contextState.spriteColorIndices.slice();
                spriteColorPairs.forEach(({ spriteColorIndex, colorIndex }) => {
                    displayManager.assertValidColorIndex(spriteColorIndex);
                    displayManager.assertValidColorIndex(colorIndex);
                    spriteColorIndices[spriteColorIndex] = colorIndex;
                });
                dataView = new DataView(new ArrayBuffer(spriteColorPairs.length * 2 + 1));
                let offset = 0;
                dataView.setUint8(offset++, spriteColorPairs.length);
                spriteColorPairs.forEach(({ spriteColorIndex, colorIndex }) => {
                    dataView.setUint8(offset, spriteColorIndex);
                    dataView.setUint8(offset + 1, colorIndex);
                    offset += 2;
                });
            }
            break;
        case "setSpriteScaleX":
            {
                let { spriteScaleX } = command;
                spriteScaleX = clamp(spriteScaleX, minDisplayScale, maxDisplayScale);
                spriteScaleX = roundScale(spriteScaleX);
                dataView = new DataView(new ArrayBuffer(2));
                dataView.setInt16(0, formatScale(spriteScaleX), true);
            }
            break;
        case "setSpriteScaleY":
            {
                let { spriteScaleY } = command;
                spriteScaleY = clamp(spriteScaleY, minDisplayScale, maxDisplayScale);
                spriteScaleY = roundScale(spriteScaleY);
                dataView = new DataView(new ArrayBuffer(2));
                dataView.setInt16(0, formatScale(spriteScaleY), true);
            }
            break;
        case "setSpriteScale":
            {
                let { spriteScale } = command;
                spriteScale = clamp(spriteScale, minDisplayScale, maxDisplayScale);
                spriteScale = roundScale(spriteScale);
                dataView = new DataView(new ArrayBuffer(2));
                dataView.setInt16(0, formatScale(spriteScale), true);
            }
            break;
        case "setSpritesLineHeight":
            {
                const { spritesLineHeight } = command;
                displayManager.assertValidLineWidth(spritesLineHeight);
                dataView = new DataView(new ArrayBuffer(2));
                dataView.setUint16(0, spritesLineHeight, true);
            }
            break;
        case "setSpritesDirection":
            {
                const { spritesDirection } = command;
                assertValidDirection(spritesDirection);
                _console$u.log({ spritesDirection });
                dataView = new DataView(new ArrayBuffer(1));
                const alignmentEnum = DisplayDirections.indexOf(spritesDirection);
                dataView.setUint8(0, alignmentEnum);
            }
            break;
        case "setSpritesLineDirection":
            {
                const { spritesLineDirection } = command;
                assertValidDirection(spritesLineDirection);
                _console$u.log({ spritesLineDirection });
                dataView = new DataView(new ArrayBuffer(1));
                const alignmentEnum = DisplayDirections.indexOf(spritesLineDirection);
                dataView.setUint8(0, alignmentEnum);
            }
            break;
        case "setSpritesSpacing":
            {
                const { spritesSpacing } = command;
                dataView = new DataView(new ArrayBuffer(2));
                dataView.setInt16(0, spritesSpacing, true);
            }
            break;
        case "setSpritesLineSpacing":
            {
                const { spritesLineSpacing } = command;
                dataView = new DataView(new ArrayBuffer(2));
                dataView.setInt16(0, spritesLineSpacing, true);
            }
            break;
        case "setSpritesAlignment":
            {
                const { spritesAlignment } = command;
                assertValidAlignment(spritesAlignment);
                _console$u.log({ spritesAlignment });
                dataView = new DataView(new ArrayBuffer(1));
                const alignmentEnum = DisplayAlignments.indexOf(spritesAlignment);
                dataView.setUint8(0, alignmentEnum);
            }
            break;
        case "setSpritesLineAlignment":
            {
                const { spritesLineAlignment } = command;
                assertValidAlignment(spritesLineAlignment);
                _console$u.log({ spritesLineAlignment });
                dataView = new DataView(new ArrayBuffer(1));
                const alignmentEnum = DisplayAlignments.indexOf(spritesLineAlignment);
                dataView.setUint8(0, alignmentEnum);
            }
            break;
        case "clearRect":
            {
                const { x, y, width, height } = command;
                dataView = new DataView(new ArrayBuffer(2 * 4));
                dataView.setInt16(0, x, true);
                dataView.setInt16(2, y, true);
                dataView.setUint16(4, width, true);
                dataView.setUint16(6, height, true);
            }
            break;
        case "drawRect":
            {
                const { offsetX, offsetY, width, height } = command;
                dataView = new DataView(new ArrayBuffer(2 * 4));
                dataView.setInt16(0, offsetX, true);
                dataView.setInt16(2, offsetY, true);
                dataView.setUint16(4, width, true);
                dataView.setUint16(6, height, true);
            }
            break;
        case "drawRoundRect":
            {
                const { offsetX, offsetY, width, height, borderRadius } = command;
                dataView = new DataView(new ArrayBuffer(2 * 4 + 1));
                dataView.setInt16(0, offsetX, true);
                dataView.setInt16(2, offsetY, true);
                dataView.setUint16(4, width, true);
                dataView.setUint16(6, height, true);
                dataView.setUint8(8, borderRadius);
            }
            break;
        case "drawCircle":
            {
                const { offsetX, offsetY, radius } = command;
                dataView = new DataView(new ArrayBuffer(2 * 3));
                dataView.setInt16(0, offsetX, true);
                dataView.setInt16(2, offsetY, true);
                dataView.setUint16(4, radius, true);
            }
            break;
        case "drawEllipse":
            {
                const { offsetX, offsetY, radiusX, radiusY } = command;
                dataView = new DataView(new ArrayBuffer(2 * 4));
                dataView.setInt16(0, offsetX, true);
                dataView.setInt16(2, offsetY, true);
                dataView.setUint16(4, radiusX, true);
                dataView.setUint16(6, radiusY, true);
            }
            break;
        case "drawRegularPolygon":
            {
                const { offsetX, offsetY, radius, numberOfSides } = command;
                dataView = new DataView(new ArrayBuffer(2 * 3 + 1));
                dataView.setInt16(0, offsetX, true);
                dataView.setInt16(2, offsetY, true);
                dataView.setUint16(4, radius, true);
                dataView.setUint8(6, numberOfSides);
            }
            break;
        case "drawPolygon":
            {
                const { points } = command;
                _console$u.assertRangeWithError("numberOfPoints", points.length, 2, 255);
                dataView = serializePoints(points);
            }
            break;
        case "drawWireframe":
            {
                const { wireframe } = command;
                const { points, edges } = wireframe;
                if (wireframe.points.length == 0) {
                    return;
                }
                assertValidWireframe(wireframe);
                const pointsDataView = serializePoints(points);
                const edgesDataView = new DataView(new ArrayBuffer(1 + 2 * edges.length));
                let edgesDataOffset = 0;
                edgesDataView.setUint8(edgesDataOffset++, edges.length);
                edges.forEach((edge) => {
                    edgesDataView.setUint8(edgesDataOffset++, edge.startIndex);
                    edgesDataView.setUint8(edgesDataOffset++, edge.endIndex);
                });
                dataView = new DataView(concatenateArrayBuffers(pointsDataView, edgesDataView));
            }
            break;
        case "drawQuadraticBezierCurve":
        case "drawCubicBezierCurve":
            {
                const { controlPoints } = command;
                const curveType = command.type == "drawCubicBezierCurve" ? "cubic" : "quadratic";
                assertValidNumberOfControlPoints(curveType, controlPoints);
                dataView = new DataView(new ArrayBuffer(4 * controlPoints.length));
                let offset = 0;
                controlPoints.forEach((controlPoint) => {
                    dataView.setInt16(offset, controlPoint.x, true);
                    offset += 2;
                    dataView.setInt16(offset, controlPoint.y, true);
                    offset += 2;
                });
            }
            break;
        case "drawQuadraticBezierCurves":
        case "drawCubicBezierCurves":
            {
                const { controlPoints } = command;
                const curveType = command.type == "drawCubicBezierCurves" ? "cubic" : "quadratic";
                assertValidPathNumberOfControlPoints(curveType, controlPoints);
                dataView = serializePoints(controlPoints);
            }
            break;
        case "drawPath":
        case "drawClosedPath":
            {
                const { curves } = command;
                assertValidPath(curves);
                const typesDataView = new DataView(new ArrayBuffer(Math.ceil(curves.length / displayCurveTypesPerByte)));
                const controlPointsDataViews = [];
                const allControlPoints = [];
                curves.forEach((curve) => {
                    allControlPoints.push(...curve.controlPoints);
                });
                const pointDataType = getPointDataType(allControlPoints);
                const numberOfControlPoints = allControlPoints.length;
                curves.forEach((curve, index) => {
                    const { type, controlPoints } = curve;
                    const typeByteIndex = Math.floor(index / displayCurveTypesPerByte);
                    const typeBitShift = (index % displayCurveTypesPerByte) * displayCurveTypeBitWidth;
                    let typeValue = typesDataView.getUint8(typeByteIndex) || 0;
                    typeValue |= DisplayBezierCurveTypes.indexOf(type) << typeBitShift;
                    typesDataView.setUint8(typeByteIndex, typeValue);
                    const controlPointsDataView = serializePoints(controlPoints, pointDataType, true);
                    controlPointsDataViews.push(controlPointsDataView);
                });
                const controlPointsBuffer = concatenateArrayBuffers(...controlPointsDataViews);
                const headerDataView = new DataView(new ArrayBuffer(3));
                headerDataView.setUint8(0, DisplayPointDataTypes.indexOf(pointDataType));
                headerDataView.setUint8(1, curves.length);
                headerDataView.setUint8(2, numberOfControlPoints);
                dataView = new DataView(concatenateArrayBuffers(headerDataView, typesDataView, controlPointsBuffer));
            }
            break;
        case "drawSegment":
            {
                const { startX, startY, endX, endY } = command;
                dataView = new DataView(new ArrayBuffer(2 * 4));
                dataView.setInt16(0, startX, true);
                dataView.setInt16(2, startY, true);
                dataView.setInt16(4, endX, true);
                dataView.setInt16(6, endY, true);
            }
            break;
        case "drawSegments":
            {
                const { points } = command;
                _console$u.assertRangeWithError("numberOfPoints", points.length, 2, 255);
                dataView = serializePoints(points);
            }
            break;
        case "drawArc":
            {
                let { offsetX, offsetY, radius, isRadians, startAngle, angleOffset } = command;
                startAngle = isRadians ? startAngle : degToRad(startAngle);
                startAngle = normalizeRadians(startAngle);
                angleOffset = isRadians ? angleOffset : degToRad(angleOffset);
                angleOffset = clamp(angleOffset, -twoPi, twoPi);
                isRadians = true;
                dataView = new DataView(new ArrayBuffer(2 * 5));
                dataView.setInt16(0, offsetX, true);
                dataView.setInt16(2, offsetY, true);
                dataView.setUint16(4, radius, true);
                dataView.setUint16(6, formatRotation(startAngle, isRadians), true);
                dataView.setInt16(8, formatRotation(angleOffset, isRadians, true), true);
            }
            break;
        case "drawArcEllipse":
            {
                let { offsetX, offsetY, radiusX, radiusY, isRadians, startAngle, angleOffset, } = command;
                startAngle = isRadians ? startAngle : degToRad(startAngle);
                startAngle = normalizeRadians(startAngle);
                angleOffset = isRadians ? angleOffset : degToRad(angleOffset);
                angleOffset = clamp(angleOffset, -twoPi, twoPi);
                isRadians = true;
                dataView = new DataView(new ArrayBuffer(2 * 6));
                dataView.setInt16(0, offsetX, true);
                dataView.setInt16(2, offsetY, true);
                dataView.setUint16(4, radiusX, true);
                dataView.setUint16(6, radiusY, true);
                dataView.setUint16(8, formatRotation(startAngle, isRadians), true);
                dataView.setUint16(10, formatRotation(angleOffset, isRadians, true), true);
            }
            break;
        case "drawBitmap":
            {
                const { bitmap, offsetX, offsetY } = command;
                displayManager.assertValidBitmap(bitmap, false);
                dataView = new DataView(new ArrayBuffer(drawBitmapHeaderLength));
                dataView.setInt16(0, offsetX, true);
                dataView.setInt16(2, offsetY, true);
                dataView.setUint16(4, bitmap.width, true);
                dataView.setUint32(6, bitmap.pixels.length, true);
                dataView.setUint8(10, bitmap.numberOfColors);
                const bitmapData = getBitmapData(bitmap);
                dataView.setUint16(11, bitmapData.byteLength, true);
                const buffer = concatenateArrayBuffers(dataView, bitmapData);
                dataView = new DataView(buffer);
            }
            break;
        case "selectSpriteSheet":
            {
                const { spriteSheetIndex } = command;
                dataView = new DataView(new ArrayBuffer(1));
                dataView.setUint8(0, spriteSheetIndex);
            }
            break;
        case "drawSprite":
            {
                const { offsetX, offsetY, spriteIndex, use2Bytes } = command;
                dataView = new DataView(new ArrayBuffer(2 * 2 + (use2Bytes ? 2 : 1)));
                let offset = 0;
                dataView.setInt16(offset, offsetX, true);
                offset += 2;
                dataView.setInt16(offset, offsetY, true);
                offset += 2;
                if (use2Bytes) {
                    dataView.setUint16(offset, spriteIndex, true);
                    offset += 2;
                }
                else {
                    dataView.setUint8(offset++, spriteIndex);
                }
            }
            break;
        case "drawSprites":
            {
                const { offsetX, offsetY, spriteSerializedLines } = command;
                const lineArrayBuffers = [];
                spriteSerializedLines.forEach((spriteLines) => {
                    const subLineArrayBuffers = [];
                    spriteLines.forEach((subSpriteLine) => {
                        const { spriteSheetIndex, spriteIndices, use2Bytes } = subSpriteLine;
                        const subLineSpriteIndicesDataView = new DataView(new ArrayBuffer(spriteIndices.length * (use2Bytes ? 2 : 1)));
                        spriteIndices.forEach((spriteIndex, i) => {
                            if (use2Bytes) {
                                subLineSpriteIndicesDataView.setUint16(i * 2, spriteIndex, true);
                            }
                            else {
                                subLineSpriteIndicesDataView.setUint8(i, spriteIndex);
                            }
                        });
                        const subLineHeaderDataView = new DataView(new ArrayBuffer(2));
                        subLineHeaderDataView.setUint8(0, spriteSheetIndex);
                        subLineHeaderDataView.setUint8(1, spriteIndices.length);
                        subLineArrayBuffers.push(concatenateArrayBuffers(subLineHeaderDataView, subLineSpriteIndicesDataView));
                    });
                    const lineArrayHeaderDataView = new DataView(new ArrayBuffer(2));
                    const concatenatedSubLineArrayBuffers = concatenateArrayBuffers(...subLineArrayBuffers);
                    lineArrayHeaderDataView.setUint16(0, concatenatedSubLineArrayBuffers.byteLength, true);
                    lineArrayBuffers.push(concatenateArrayBuffers(lineArrayHeaderDataView, concatenatedSubLineArrayBuffers));
                });
                const concatenatedLineArrayBuffers = concatenateArrayBuffers(...lineArrayBuffers);
                dataView = new DataView(new ArrayBuffer(2 * 3));
                let offset = 0;
                dataView.setInt16(offset, offsetX, true);
                offset += 2;
                dataView.setInt16(offset, offsetY, true);
                offset += 2;
                dataView.setUint16(offset, concatenatedLineArrayBuffers.byteLength, true);
                offset += 2;
                const buffer = concatenateArrayBuffers(dataView, concatenatedLineArrayBuffers);
                dataView = new DataView(buffer);
            }
            break;
        case "startSprite":
            {
                const { offsetX, offsetY, width, height } = command;
                dataView = new DataView(new ArrayBuffer(2 * 4));
                dataView.setInt16(0, offsetX, true);
                dataView.setInt16(2, offsetY, true);
                dataView.setUint16(4, width, true);
                dataView.setUint16(6, height, true);
            }
            break;
        default:
            throw Error(`uncaught command.type ${command.type}`);
    }
    return dataView;
}
function serializeDisplayContextCommand(displayManager, command) {
    if (command.hide) {
        return;
    }
    _console$u.assertEnumWithError(command.type, DisplayContextCommandTypes);
    const displayContextCommandEnum = DisplayContextCommandTypes.indexOf(command.type);
    const serializedContextCommand = serializeDisplayContextCommandData(displayManager, command);
    return concatenateArrayBuffers(UInt8ByteBuffer(displayContextCommandEnum), serializedContextCommand);
}
function serializeDisplayContextCommands(displayManager, commands) {
    const serializedContextCommandArray = commands.map((command) => serializeDisplayContextCommand(displayManager, command));
    const serializedContextCommands = concatenateArrayBuffers(serializedContextCommandArray);
    _console$u.log("serializedContextCommands", commands, serializedContextCommandArray, serializedContextCommands);
    return serializedContextCommands;
}
function parseDisplayContextCommands(displayManager, dataView) {
    _console$u.log("parseContextCommands", displayManager, dataView);
    const contextCommands = [];
    let offset = 0;
    while (offset < dataView.byteLength) {
        const commandTypeIndex = dataView.getUint8(offset++);
        const type = DisplayContextCommandTypes[commandTypeIndex];
        _console$u.assertWithError(type, `invalid commandTypeIndex ${commandTypeIndex}`);
        let command;
        _console$u.log(`parsing "${type}" (${offset}/${dataView.byteLength})`);
        switch (type) {
            case "show":
            case "clear":
            case "saveContext":
            case "restoreContext":
            case "clearRotation":
            case "clearCrop":
            case "clearRotationCrop":
            case "resetBitmapScale":
            case "resetSpriteColors":
            case "resetSpriteScale":
            case "resetAlignment":
            case "endSprite":
            case "clearContext":
                command = { type };
                break;
            case "setColor":
                {
                    const colorIndex = dataView.getUint8(offset++);
                    const r = dataView.getUint8(offset++);
                    const g = dataView.getUint8(offset++);
                    const b = dataView.getUint8(offset++);
                    command = { type, colorIndex, color: { r, g, b } };
                }
                break;
            case "setColorOpacity":
                {
                    const colorIndex = dataView.getUint8(offset++);
                    const opacity = dataView.getUint8(offset++) / 255;
                    command = { type, colorIndex, opacity };
                }
                break;
            case "setOpacity":
                {
                    const opacity = dataView.getUint8(offset++) / 255;
                    command = { type, opacity };
                }
                break;
            case "selectFillColor":
                {
                    const fillColorIndex = dataView.getUint8(offset++);
                    command = { type, fillColorIndex };
                }
                break;
            case "selectBackgroundColor":
                {
                    const backgroundColorIndex = dataView.getUint8(offset++);
                    command = { type, backgroundColorIndex };
                }
                break;
            case "selectLineColor":
                {
                    const lineColorIndex = dataView.getUint8(offset++);
                    command = { type, lineColorIndex };
                }
                break;
            case "setIgnoreFill":
                {
                    const ignoreFill = Boolean(dataView.getUint8(offset++));
                    command = { type, ignoreFill };
                }
                break;
            case "setIgnoreLine":
                {
                    const ignoreLine = Boolean(dataView.getUint8(offset++));
                    command = { type, ignoreLine };
                }
                break;
            case "setFillBackground":
                {
                    const fillBackground = Boolean(dataView.getUint8(offset++));
                    command = { type, fillBackground };
                }
                break;
            case "setLineWidth":
                {
                    const lineWidth = dataView.getUint16(offset, true);
                    offset += 2;
                    command = { type, lineWidth };
                }
                break;
            case "setHorizontalAlignment":
                {
                    const horizontalAlignment = DisplayAlignments[dataView.getUint8(offset++)];
                    _console$u.assertEnumWithError(horizontalAlignment, DisplayAlignments);
                    command = { type, horizontalAlignment };
                }
                break;
            case "setVerticalAlignment":
                {
                    const verticalAlignment = DisplayAlignments[dataView.getUint8(offset++)];
                    _console$u.assertEnumWithError(verticalAlignment, DisplayAlignments);
                    command = { type, verticalAlignment };
                }
                break;
            case "setRotation":
                {
                    const isRadians = true;
                    const rotation = parseRotation(dataView.getUint16(offset, true));
                    offset += 2;
                    command = { type, rotation, isRadians };
                }
                break;
            case "setSegmentStartCap":
                {
                    const segmentStartCap = DisplaySegmentCaps[dataView.getUint8(offset++)];
                    _console$u.assertEnumWithError(segmentStartCap, DisplaySegmentCaps);
                    command = { type, segmentStartCap };
                }
                break;
            case "setSegmentEndCap":
                {
                    const segmentEndCap = DisplaySegmentCaps[dataView.getUint8(offset++)];
                    _console$u.assertEnumWithError(segmentEndCap, DisplaySegmentCaps);
                    command = { type, segmentEndCap };
                }
                break;
            case "setSegmentCap":
                {
                    const segmentCap = DisplaySegmentCaps[dataView.getUint8(offset++)];
                    _console$u.assertEnumWithError(segmentCap, DisplaySegmentCaps);
                    command = { type, segmentCap };
                }
                break;
            case "setSegmentStartRadius":
                {
                    const segmentStartRadius = dataView.getUint16(offset, true);
                    offset += 2;
                    command = { type, segmentStartRadius };
                }
                break;
            case "setSegmentEndRadius":
                {
                    const segmentEndRadius = dataView.getUint16(offset, true);
                    offset += 2;
                    command = { type, segmentEndRadius };
                }
                break;
            case "setSegmentRadius":
                {
                    const segmentRadius = dataView.getUint16(offset, true);
                    offset += 2;
                    command = { type, segmentRadius };
                }
                break;
            case "setCropTop":
                {
                    const cropTop = dataView.getUint16(offset, true);
                    offset += 2;
                    command = { type, cropTop };
                }
                break;
            case "setCropRight":
                {
                    const cropRight = dataView.getUint16(offset, true);
                    offset += 2;
                    command = { type, cropRight };
                }
                break;
            case "setCropBottom":
                {
                    const cropBottom = dataView.getUint16(offset, true);
                    offset += 2;
                    command = { type, cropBottom };
                }
                break;
            case "setCropLeft":
                {
                    const cropLeft = dataView.getUint16(offset, true);
                    offset += 2;
                    command = { type, cropLeft };
                }
                break;
            case "setRotationCropTop":
                {
                    const rotationCropTop = dataView.getUint16(offset, true);
                    offset += 2;
                    command = { type, rotationCropTop };
                }
                break;
            case "setRotationCropRight":
                {
                    const rotationCropRight = dataView.getUint16(offset, true);
                    offset += 2;
                    command = { type, rotationCropRight };
                }
                break;
            case "setRotationCropBottom":
                {
                    const rotationCropBottom = dataView.getUint16(offset, true);
                    offset += 2;
                    command = { type, rotationCropBottom };
                }
                break;
            case "setRotationCropLeft":
                {
                    const rotationCropLeft = dataView.getUint16(offset, true);
                    offset += 2;
                    command = { type, rotationCropLeft };
                }
                break;
            case "selectBitmapColor":
                {
                    const bitmapColorIndex = dataView.getUint8(offset++);
                    const colorIndex = dataView.getUint8(offset++);
                    command = { type, bitmapColorIndex, colorIndex };
                }
                break;
            case "selectBitmapColors":
                {
                    const numberOfBitmapColorPairs = dataView.getUint8(offset++);
                    const bitmapColorPairs = [];
                    for (let i = 0; i < numberOfBitmapColorPairs; i++) {
                        const bitmapColorIndex = dataView.getUint8(offset++);
                        const colorIndex = dataView.getUint8(offset++);
                        bitmapColorPairs.push({ bitmapColorIndex, colorIndex });
                    }
                    command = { type, bitmapColorPairs };
                }
                break;
            case "setBitmapScaleX":
                {
                    const bitmapScaleX = parseScale(dataView.getInt16(offset, true));
                    offset += 2;
                    command = { type, bitmapScaleX };
                }
                break;
            case "setBitmapScaleY":
                {
                    const bitmapScaleY = parseScale(dataView.getInt16(offset, true));
                    offset += 2;
                    command = { type, bitmapScaleY };
                }
                break;
            case "setBitmapScale":
                {
                    const bitmapScale = parseScale(dataView.getInt16(offset, true));
                    offset += 2;
                    command = { type, bitmapScale };
                }
                break;
            case "selectSpriteColor":
                {
                    const spriteColorIndex = dataView.getUint8(offset++);
                    const colorIndex = dataView.getUint8(offset++);
                    command = { type, spriteColorIndex, colorIndex };
                }
                break;
            case "selectSpriteColors":
                {
                    const numberOfSpriteColorPairs = dataView.getUint8(offset++);
                    const spriteColorPairs = [];
                    for (let i = 0; i < numberOfSpriteColorPairs; i++) {
                        const spriteColorIndex = dataView.getUint8(offset++);
                        const colorIndex = dataView.getUint8(offset++);
                        spriteColorPairs.push({ spriteColorIndex, colorIndex });
                    }
                    command = { type, spriteColorPairs };
                }
                break;
            case "setSpriteScaleX":
                {
                    const spriteScaleX = parseScale(dataView.getInt16(offset, true));
                    offset += 2;
                    command = { type, spriteScaleX };
                }
                break;
            case "setSpriteScaleY":
                {
                    const spriteScaleY = parseScale(dataView.getInt16(offset, true));
                    offset += 2;
                    command = { type, spriteScaleY };
                }
                break;
            case "setSpriteScale":
                {
                    const spriteScale = parseScale(dataView.getInt16(offset, true));
                    offset += 2;
                    command = { type, spriteScale };
                }
                break;
            case "setSpritesLineHeight":
                {
                    const spritesLineHeight = dataView.getUint16(offset, true);
                    offset += 2;
                    command = { type, spritesLineHeight };
                }
                break;
            case "setSpritesDirection":
                {
                    const spritesDirection = DisplayDirections[dataView.getUint8(offset++)];
                    _console$u.assertEnumWithError(spritesDirection, DisplayDirections);
                    command = { type, spritesDirection };
                }
                break;
            case "setSpritesLineDirection":
                {
                    const spritesLineDirection = DisplayDirections[dataView.getUint8(offset++)];
                    _console$u.assertEnumWithError(spritesLineDirection, DisplayDirections);
                    command = { type, spritesLineDirection };
                }
                break;
            case "setSpritesSpacing":
                {
                    const spritesSpacing = dataView.getInt16(offset, true);
                    offset += 2;
                    command = { type, spritesSpacing };
                }
                break;
            case "setSpritesLineSpacing":
                {
                    const spritesLineSpacing = dataView.getInt16(offset, true);
                    offset += 2;
                    command = { type, spritesLineSpacing };
                }
                break;
            case "setSpritesAlignment":
                {
                    const spritesAlignment = DisplayAlignments[dataView.getUint8(offset++)];
                    _console$u.assertEnumWithError(spritesAlignment, DisplayAlignments);
                    command = { type, spritesAlignment };
                }
                break;
            case "setSpritesLineAlignment":
                {
                    const spritesLineAlignment = DisplayAlignments[dataView.getUint8(offset++)];
                    _console$u.assertEnumWithError(spritesLineAlignment, DisplayAlignments);
                    command = { type, spritesLineAlignment };
                }
                break;
            case "clearRect":
                {
                    const x = dataView.getInt16(offset, true);
                    offset += 2;
                    const y = dataView.getInt16(offset, true);
                    offset += 2;
                    const width = dataView.getUint16(offset, true);
                    offset += 2;
                    const height = dataView.getUint16(offset, true);
                    offset += 2;
                    command = { type, x, y, width, height };
                }
                break;
            case "drawRect":
                {
                    const offsetX = dataView.getInt16(offset, true);
                    offset += 2;
                    const offsetY = dataView.getInt16(offset, true);
                    offset += 2;
                    const width = dataView.getUint16(offset, true);
                    offset += 2;
                    const height = dataView.getUint16(offset, true);
                    offset += 2;
                    command = { type, offsetX, offsetY, width, height };
                }
                break;
            case "drawRoundRect":
                {
                    const offsetX = dataView.getInt16(offset, true);
                    offset += 2;
                    const offsetY = dataView.getInt16(offset, true);
                    offset += 2;
                    const width = dataView.getUint16(offset, true);
                    offset += 2;
                    const height = dataView.getUint16(offset, true);
                    offset += 2;
                    const borderRadius = dataView.getUint8(offset++);
                    command = { type, offsetX, offsetY, width, height, borderRadius };
                }
                break;
            case "drawCircle":
                {
                    const offsetX = dataView.getInt16(offset, true);
                    offset += 2;
                    const offsetY = dataView.getInt16(offset, true);
                    offset += 2;
                    const radius = dataView.getUint16(offset, true);
                    offset += 2;
                    command = { type, offsetX, offsetY, radius };
                }
                break;
            case "drawEllipse":
                {
                    const offsetX = dataView.getInt16(offset, true);
                    offset += 2;
                    const offsetY = dataView.getInt16(offset, true);
                    offset += 2;
                    const radiusX = dataView.getUint16(offset, true);
                    offset += 2;
                    const radiusY = dataView.getUint16(offset, true);
                    offset += 2;
                    command = { type, offsetX, offsetY, radiusX, radiusY };
                }
                break;
            case "drawRegularPolygon":
                {
                    const offsetX = dataView.getInt16(offset, true);
                    offset += 2;
                    const offsetY = dataView.getInt16(offset, true);
                    offset += 2;
                    const radius = dataView.getUint16(offset, true);
                    offset += 2;
                    const numberOfSides = dataView.getUint8(offset++);
                    command = { type, offsetX, offsetY, radius, numberOfSides };
                }
                break;
            case "drawPolygon":
                {
                    const { points, offset: newOffset } = parsePoints(dataView, offset);
                    offset = newOffset;
                    command = { type, points };
                }
                break;
            case "drawWireframe":
                {
                    const { points, offset: newOffset } = parsePoints(dataView, offset);
                    offset = newOffset;
                    const numberOfEdges = dataView.getUint8(offset++);
                    _console$u.assertWithError(numberOfEdges >= 2, `numberOfEdges ${numberOfEdges} must be at least 2`);
                    const edges = [];
                    for (let i = 0; i < numberOfEdges; i++) {
                        const startIndex = dataView.getUint8(offset++);
                        const endIndex = dataView.getUint8(offset++);
                        edges.push({ startIndex, endIndex });
                    }
                    const wireframe = { points, edges };
                    command = { type, wireframe };
                }
                break;
            case "drawQuadraticBezierCurve":
            case "drawCubicBezierCurve":
                {
                    const controlPoints = [];
                    const curveType = type == "drawCubicBezierCurve" ? "cubic" : "quadratic";
                    const numberOfConrolPoints = getNumberOfConrolPoints(curveType);
                    for (let i = 0; i < numberOfConrolPoints; i++) {
                        const x = dataView.getInt16(offset, true);
                        offset += 2;
                        const y = dataView.getInt16(offset, true);
                        offset += 2;
                        controlPoints.push({ x, y });
                    }
                    command = { type, controlPoints };
                }
                break;
            case "drawQuadraticBezierCurves":
            case "drawCubicBezierCurves":
                {
                    const { points: controlPoints, offset: newOffset } = parsePoints(dataView, offset);
                    offset = newOffset;
                    command = { type, controlPoints };
                }
                break;
            case "drawPath":
            case "drawClosedPath":
                {
                    const curves = [];
                    const pointDataType = DisplayPointDataTypes[dataView.getUint8(offset++)];
                    _console$u.assertEnumWithError(pointDataType, DisplayPointDataTypes);
                    const numberOfCurves = dataView.getUint8(offset++);
                    const curveTypeDataLength = Math.ceil(numberOfCurves / displayCurveTypesPerByte);
                    const totalNumberOfControlPoints = dataView.getUint8(offset++);
                    const pathDataLength = curveTypeDataLength +
                        totalNumberOfControlPoints *
                            displayPointDataTypeToSize[pointDataType];
                    _console$u.assertWithError(offset + pathDataLength > dataView.byteLength, `offset + pathDataLength ${offset + pathDataLength} exceeds dataView.byteLength ${dataView.byteLength}`);
                    const curveTypeDataOffset = offset;
                    offset += curveTypeDataLength;
                    for (let index = 0; index < numberOfCurves; index++) {
                        const typeByteIndex = Math.floor(index / displayCurveTypesPerByte);
                        const typeBitShift = (index % displayCurveTypesPerByte) * displayCurveTypeBitWidth;
                        const typeValue = dataView.getUint8(curveTypeDataOffset + typeByteIndex);
                        const typeIndex = (typeValue >> typeBitShift) &
                            ((1 << displayCurveTypeBitWidth) - 1);
                        const type = DisplayBezierCurveTypes[typeIndex];
                        const { points: controlPoints, offset: newOffset } = parsePoints(dataView, offset);
                        offset = newOffset;
                        curves.push({ type, controlPoints });
                    }
                    command = { type, curves };
                }
                break;
            case "drawSegment":
                {
                    const startX = dataView.getInt16(offset, true);
                    offset += 2;
                    const startY = dataView.getInt16(offset, true);
                    offset += 2;
                    const endX = dataView.getInt16(offset, true);
                    offset += 2;
                    const endY = dataView.getInt16(offset, true);
                    offset += 2;
                    command = { type, startX, startY, endX, endY };
                }
                break;
            case "drawSegments":
                {
                    const { points, offset: newOffset } = parsePoints(dataView, offset);
                    offset = newOffset;
                    command = { type, points };
                }
                break;
            case "drawArc":
                {
                    const offsetX = dataView.getInt16(offset, true);
                    offset += 2;
                    const offsetY = dataView.getInt16(offset, true);
                    offset += 2;
                    const isRadians = true;
                    const radius = dataView.getUint16(offset, true);
                    offset += 2;
                    const startAngle = parseRotation(dataView.getUint16(offset, true));
                    offset += 2;
                    const angleOffset = parseRotation(dataView.getInt16(offset, true), isRadians, true);
                    offset += 2;
                    command = {
                        type,
                        offsetX,
                        offsetY,
                        radius,
                        isRadians,
                        startAngle,
                        angleOffset,
                    };
                }
                break;
            case "drawArcEllipse":
                {
                    const offsetX = dataView.getInt16(offset, true);
                    offset += 2;
                    const offsetY = dataView.getInt16(offset, true);
                    offset += 2;
                    const isRadians = true;
                    const radiusX = dataView.getUint16(offset, true);
                    offset += 2;
                    const radiusY = dataView.getUint16(offset, true);
                    offset += 2;
                    const startAngle = parseRotation(dataView.getUint16(offset, true));
                    offset += 2;
                    const angleOffset = parseRotation(dataView.getInt16(offset, true), isRadians, true);
                    offset += 2;
                    command = {
                        type,
                        offsetX,
                        offsetY,
                        radiusX,
                        radiusY,
                        isRadians,
                        startAngle,
                        angleOffset,
                    };
                }
                break;
            case "drawBitmap":
                {
                    const offsetX = dataView.getInt16(offset, true);
                    offset += 2;
                    const offsetY = dataView.getInt16(offset, true);
                    offset += 2;
                    const { bitmap, offset: newOffset } = parseBitmap(dataView, offset);
                    offset = newOffset;
                    command = { type, offsetX, offsetY, bitmap };
                }
                break;
            case "selectSpriteSheet":
                {
                    const spriteSheetIndex = dataView.getUint8(offset++);
                    command = { type, spriteSheetIndex };
                }
                break;
            case "drawSprite":
                {
                    const offsetX = dataView.getInt16(offset, true);
                    offset += 2;
                    const offsetY = dataView.getInt16(offset, true);
                    offset += 2;
                    _console$u.assertWithError(displayManager.selectedSpriteSheet, "displayManager doesn't have a selected spriteSheet");
                    const use2Bytes = displayManager.selectedSpriteSheet.sprites.length > 255;
                    let spriteIndex;
                    if (use2Bytes) {
                        spriteIndex = dataView.getUint16(offset, true);
                        offset += 2;
                    }
                    else {
                        spriteIndex = dataView.getUint8(offset++);
                    }
                    command = { type, offsetX, offsetY, spriteIndex, use2Bytes };
                }
                break;
            case "drawSprites":
                {
                    const offsetX = dataView.getInt16(offset, true);
                    offset += 2;
                    const offsetY = dataView.getInt16(offset, true);
                    offset += 2;
                    const linesDataLength = dataView.getUint16(offset, true);
                    offset += 2;
                    const linesDataEnd = offset + linesDataLength;
                    const spriteSerializedLines = [];
                    while (offset < linesDataEnd) {
                        const lineDataLength = dataView.getUint16(offset, true);
                        offset += 2;
                        const lineDataEnd = offset + lineDataLength;
                        const spriteLine = [];
                        while (offset < lineDataEnd) {
                            const spriteSheetIndex = dataView.getUint8(offset++);
                            const spriteCount = dataView.getUint8(offset++);
                            const spriteSheet = displayManager.getSpriteSheetByIndex(spriteSheetIndex);
                            _console$u.assertWithError(spriteSheet, `no spriteSheet found for spriteSheetIndex ${spriteSheetIndex}`);
                            const use2Bytes = spriteSheet.sprites.length > 255;
                            const spriteIndices = [];
                            for (let i = 0; i < spriteCount; i++) {
                                spriteIndices.push(use2Bytes
                                    ? dataView.getUint16(offset, true)
                                    : dataView.getUint8(offset));
                                offset += use2Bytes ? 2 : 1;
                            }
                            spriteLine.push({
                                spriteSheetIndex,
                                spriteIndices,
                                use2Bytes,
                            });
                        }
                        spriteSerializedLines.push(spriteLine);
                    }
                    command = { type, offsetX, offsetY, spriteSerializedLines };
                }
                break;
            case "startSprite":
                {
                    const offsetX = dataView.getInt16(offset, true);
                    offset += 2;
                    const offsetY = dataView.getInt16(offset, true);
                    offset += 2;
                    const width = dataView.getUint16(offset, true);
                    offset += 2;
                    const height = dataView.getUint16(offset, true);
                    offset += 2;
                    command = { type, offsetX, offsetY, width, height };
                }
                break;
            default:
                _console$u.error(`uncaught commandType "${type}"`);
                break;
        }
        _console$u.log("command", command);
        _console$u.assertWithError(command, `no command found for commandType "${type}"`);
        contextCommands.push(command);
    }
    _console$u.log("parsed contextCommands", contextCommands);
    return contextCommands;
}
const DrawDisplayContextCommandTypes = [
    "drawRect",
    "drawRoundRect",
    "drawCircle",
    "drawArc",
    "drawEllipse",
    "drawArcEllipse",
    "drawSegment",
    "drawSegments",
    "drawRegularPolygon",
    "drawPolygon",
    "drawWireframe",
    "drawQuadraticBezierCurve",
    "drawQuadraticBezierCurves",
    "drawCubicBezierCurve",
    "drawCubicBezierCurves",
    "drawPath",
    "drawClosedPath",
    "drawBitmap",
    "drawSprite",
    "drawSprites",
];
const StateDisplayContextCommandTypes = [
    "setColor",
    "setColorOpacity",
    "setOpacity",
    "saveContext",
    "restoreContext",
    "selectBackgroundColor",
    "selectFillColor",
    "selectLineColor",
    "setIgnoreFill",
    "setIgnoreLine",
    "setFillBackground",
    "setLineWidth",
    "setRotation",
    "clearRotation",
    "setHorizontalAlignment",
    "setVerticalAlignment",
    "resetAlignment",
    "setSegmentStartCap",
    "setSegmentEndCap",
    "setSegmentCap",
    "setSegmentStartRadius",
    "setSegmentEndRadius",
    "setSegmentRadius",
    "setCropTop",
    "setCropRight",
    "setCropBottom",
    "setCropLeft",
    "clearCrop",
    "setRotationCropTop",
    "setRotationCropRight",
    "setRotationCropBottom",
    "setRotationCropLeft",
    "clearRotationCrop",
    "selectBitmapColor",
    "selectBitmapColors",
    "setBitmapScaleX",
    "setBitmapScaleY",
    "setBitmapScale",
    "resetBitmapScale",
    "selectSpriteColor",
    "selectSpriteColors",
    "resetSpriteColors",
    "setSpriteScaleX",
    "setSpriteScaleY",
    "setSpriteScale",
    "resetSpriteScale",
    "setSpritesLineHeight",
    "setSpritesDirection",
    "setSpritesLineDirection",
    "setSpritesSpacing",
    "setSpritesLineSpacing",
    "setSpritesAlignment",
    "setSpritesLineAlignment",
    "selectSpriteSheet",
];
const SpritesDisplayContextCommandTypes = [
    "selectSpriteColor",
    "selectSpriteColors",
    "resetSpriteColors",
    "setSpriteScaleX",
    "setSpriteScaleY",
    "setSpriteScale",
    "resetSpriteScale",
    "setSpritesLineHeight",
    "setSpritesDirection",
    "setSpritesLineDirection",
    "setSpritesSpacing",
    "setSpritesLineSpacing",
    "setSpritesAlignment",
    "setSpritesLineAlignment",
    "selectSpriteSheet",
];
const PathDrawDisplayContextCommandTypes = [
    "drawSegment",
    "drawSegments",
    "drawQuadraticBezierCurve",
    "drawQuadraticBezierCurves",
    "drawCubicBezierCurve",
    "drawCubicBezierCurves",
    "drawPath",
    "drawWireframe",
];
const PathStateDisplayContextCommandTypes = [
    "setSegmentRadius",
    "setSegmentEndRadius",
    "setSegmentStartRadius",
    "setSegmentCap",
    "setSegmentStartCap",
    "setSegmentEndCap",
];
const BitmapDisplayContextCommandTypes = [
    "selectBitmapColor",
    "selectBitmapColors",
    "setBitmapScaleX",
    "setBitmapScaleY",
    "setBitmapScale",
    "resetBitmapScale",
];
const contextCommandDependencies = new Map();
function appendContextCommandDependencyPair(key, value) {
    contextCommandDependencies.set(new Set(key), new Set(value));
}
appendContextCommandDependencyPair([...PathStateDisplayContextCommandTypes], [...PathDrawDisplayContextCommandTypes]);
appendContextCommandDependencyPair([...StateDisplayContextCommandTypes], [...DrawDisplayContextCommandTypes]);
appendContextCommandDependencyPair([...SpritesDisplayContextCommandTypes], ["drawSprite", "drawSprites"]);
appendContextCommandDependencyPair([...BitmapDisplayContextCommandTypes], ["drawBitmap"]);

createConsole("PathUtils", { log: false });
function perpendicularDistance(p, p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    if (dx === 0 && dy === 0)
        return Math.hypot(p.x - p1.x, p.y - p1.y);
    const t = ((p.x - p1.x) * dx + (p.y - p1.y) * dy) / (dx * dx + dy * dy);
    const projX = p1.x + t * dx;
    const projY = p1.y + t * dy;
    return Math.hypot(p.x - projX, p.y - projY);
}
function rdp(points, epsilon) {
    if (points.length < 3)
        return points;
    let maxDist = 0;
    let index = 0;
    for (let i = 1; i < points.length - 1; i++) {
        const d = perpendicularDistance(points[i], points[0], points[points.length - 1]);
        if (d > maxDist) {
            maxDist = d;
            index = i;
        }
    }
    if (maxDist > epsilon) {
        const left = rdp(points.slice(0, index + 1), epsilon);
        const right = rdp(points.slice(index), epsilon);
        return left.slice(0, -1).concat(right);
    }
    return [points[0], points[points.length - 1]];
}
function sampleQuadratic(p0, p1, p2, steps = 5) {
    const points = [];
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * p1.x + t ** 2 * p2.x;
        const y = (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * p1.y + t ** 2 * p2.y;
        points.push({ x, y });
    }
    return points;
}
function sampleCubic(p0, p1, p2, p3, steps = 5) {
    const points = [];
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const mt = 1 - t;
        const x = mt ** 3 * p0.x +
            3 * mt ** 2 * t * p1.x +
            3 * mt * t ** 2 * p2.x +
            t ** 3 * p3.x;
        const y = mt ** 3 * p0.y +
            3 * mt ** 2 * t * p1.y +
            3 * mt * t ** 2 * p2.y +
            t ** 3 * p3.y;
        points.push({ x, y });
    }
    return points;
}
function areCollinear(p1, p2, p3, epsilon = 1e-6) {
    const dx1 = p2.x - p1.x;
    const dy1 = p2.y - p1.y;
    const dx2 = p3.x - p2.x;
    const dy2 = p3.y - p2.y;
    const cross = dx1 * dy2 - dy1 * dx2;
    return Math.abs(cross) < epsilon;
}
function simplifyCurves(curves, epsilon = 1) {
    const simplified = [];
    let cursor;
    curves.forEach((curve, index) => {
        const { controlPoints } = curve;
        const isFirst = index == 0;
        if (isFirst) {
            cursor = controlPoints[0];
        }
        switch (curve.type) {
            case "segment":
                {
                    const lastPoint = controlPoints.at(-1);
                    const lastCommand = simplified.at(-1);
                    if (lastCommand?.type == "segment" && simplified.length >= 2) {
                        const [c1, c2] = [simplified.at(-1), simplified.at(-2)];
                        if (areCollinear(c2.controlPoints.at(-1), c1.controlPoints.at(-1), lastPoint)) {
                            simplified.pop();
                        }
                    }
                    simplified.push({ ...curve });
                    cursor = lastPoint;
                }
                break;
            case "quadratic":
                {
                    const p0 = cursor;
                    const p1 = controlPoints.at(-2);
                    const p2 = controlPoints.at(-1);
                    const sampled = sampleQuadratic(p0, p1, p2, 5);
                    const simplifiedPoints = rdp(sampled, epsilon);
                    if (simplifiedPoints.length === 2) {
                        simplified.push({
                            type: "segment",
                            controlPoints: [{ x: p2.x, y: p2.y }],
                        });
                        if (isFirst) {
                            simplified.at(-1).controlPoints.unshift({ ...p0 });
                        }
                    }
                    else {
                        simplified.push({ ...curve });
                    }
                    cursor = p2;
                }
                break;
            case "cubic":
                {
                    const p0 = cursor;
                    const p1 = controlPoints.at(-3);
                    const p2 = controlPoints.at(-2);
                    const p3 = controlPoints.at(-1);
                    const sampled = sampleCubic(p0, p1, p2, p3, 5);
                    const simplifiedPoints = rdp(sampled, epsilon);
                    if (simplifiedPoints.length === 2) {
                        simplified.push({
                            type: "segment",
                            controlPoints: [{ x: p3.x, y: p3.y }],
                        });
                        if (isFirst) {
                            simplified.at(-1).controlPoints.unshift({ ...p0 });
                        }
                    }
                    else {
                        simplified.push({ ...curve });
                    }
                    cursor = p3;
                }
                break;
        }
        cursor = curve.controlPoints[curve.controlPoints.length - 1];
    });
    return simplified;
}
function simplifyPoints(points, tolerance) {
    points = simplify(points, tolerance, false);
    return points;
}
function simplifyPointsAsCubicCurveControlPoints(points, error) {
    const flatPoints = points.map(({ x, y }) => [x, y]);
    const curves = fitCurve(flatPoints, error ?? 50);
    const controlPoints = [];
    curves.forEach((curve, index) => {
        const points = curve.map(([x, y]) => ({ x, y }));
        if (index != 0) {
            points.shift();
        }
        controlPoints.push(...points);
    });
    return controlPoints;
}

createConsole("SvgUtils", { log: false });
function getBoundingBox(path) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of path) {
        if (p.x < minX)
            minX = p.x;
        if (p.y < minY)
            minY = p.y;
        if (p.x > maxX)
            maxX = p.x;
        if (p.y > maxY)
            maxY = p.y;
    }
    return { minX, minY, maxX, maxY };
}
function bboxContains(a, b) {
    return (a.minX <= b.minX && a.minY <= b.minY && a.maxX >= b.maxX && a.maxY >= b.maxY);
}
function classifySubpath(subpath, previous, fillRule) {
    const centroid = subpath.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
    centroid.x /= subpath.length;
    centroid.y /= subpath.length;
    const subBBox = getBoundingBox(subpath);
    for (const other of previous) {
        const otherBBox = getBoundingBox(other.path);
        if (!bboxContains(otherBBox, subBBox))
            continue;
        const insidePoints = subpath.filter((p) => pointInPolygon(p, other.path)).length;
        const allInside = insidePoints > subpath.length * 0.8;
        if (!allInside)
            continue;
    }
    {
        let winding = 0;
        for (const other of previous) {
            const otherBBox = getBoundingBox(other.path);
            if (!bboxContains(otherBBox, subBBox))
                continue;
            if (pointInPolygon(centroid, other.path)) {
                winding += contourArea(other.path) > 0 ? 1 : -1;
            }
        }
        return winding !== 0;
    }
}

function capitalizeFirstCharacter(string) {
    return string[0].toUpperCase() + string.slice(1);
}
function removeRedundantCharacters(string) {
    return removeRedundancies(Array.from(string)).join("");
}
function removeSubstrings(string, substrings) {
    let result = string;
    for (const sub of substrings) {
        result = result.split(sub).join("");
    }
    return result;
}

const _console$t = createConsole("DisplaySpriteSheetUtils", { log: false });
const spriteHeaderLength = 3 * 2;
function getCurvesPoints(curves) {
    const curvePoints = [];
    curves.forEach((curve, index) => {
        if (index == 0) {
            curvePoints.push(curve.controlPoints[0]);
        }
        curvePoints.push(curve.controlPoints.at(-1));
    });
    return curvePoints;
}
function serializeSpriteSheet(displayManager, spriteSheet) {
    const { name, sprites } = spriteSheet;
    _console$t.log(`serializing ${name} spriteSheet`, spriteSheet);
    const numberOfSprites = sprites.length;
    const numberOfSpritesDataView = new DataView(new ArrayBuffer(2));
    numberOfSpritesDataView.setUint16(0, numberOfSprites, true);
    const spritePayloads = sprites.map((sprite, index) => {
        const commandsData = serializeDisplayContextCommands(displayManager, sprite.commands);
        const dataView = new DataView(new ArrayBuffer(spriteHeaderLength));
        dataView.setUint16(0, sprite.width, true);
        dataView.setUint16(2, sprite.height, true);
        dataView.setUint16(4, commandsData.byteLength, true);
        const serializedSprite = concatenateArrayBuffers(dataView, commandsData);
        _console$t.log("serializedSprite", sprite, serializedSprite);
        return serializedSprite;
    });
    const spriteOffsetsDataView = new DataView(new ArrayBuffer(sprites.length * 2));
    let offset = numberOfSpritesDataView.byteLength + spriteOffsetsDataView.byteLength;
    spritePayloads.forEach((spritePayload, index) => {
        spriteOffsetsDataView.setUint16(index * 2, offset, true);
        offset += spritePayload.byteLength;
    });
    const serializedSpriteSheet = concatenateArrayBuffers(numberOfSpritesDataView, spriteOffsetsDataView, spritePayloads);
    _console$t.log("serializedSpriteSheet", serializedSpriteSheet);
    return serializedSpriteSheet;
}
const defaultFontToSpriteSheetOptions = {
    stroke: false,
    strokeWidth: 1,
    unicodeOnly: true,
    englishOnly: true,
    usePath: true,
    overrideMaxSpriteHeight: true,
};
function isWoff2(arrayBuffer) {
    if (arrayBuffer.byteLength < 4)
        return false;
    const header = new Uint8Array(arrayBuffer, 0, 4);
    return (header[0] === 0x77 &&
        header[1] === 0x4f &&
        header[2] === 0x46 &&
        header[3] === 0x32
    );
}
async function parseFont(arrayBuffer) {
    if (isWoff2(arrayBuffer)) {
        const result = await decompress(arrayBuffer);
        arrayBuffer = result.buffer;
    }
    const font = opentype.parse(arrayBuffer);
    return font;
}
function getFontUnicodeRange(font) {
    const rangeHelper = new RangeHelper();
    for (let i = 0; i < font.glyphs.length; i++) {
        const glyph = font.glyphs.get(i);
        if (!glyph.unicodes || glyph.unicodes.length === 0)
            continue;
        glyph.unicodes
            .filter((unicode) => {
            const char = String.fromCodePoint(unicode);
            return /\p{Letter}/u.test(char);
        })
            .forEach((unicode) => rangeHelper.update(unicode));
    }
    return rangeHelper.span > 0 ? rangeHelper.range : undefined;
}
const englishRegex = /^[A-Za-z0-9 !"#$%&'()*+,\-./:;?@[\]^_`{|}~\\]+$/;
function contourArea(points) {
    let area = 0;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        area += (points[j].x - points[i].x) * (points[j].y + points[i].y);
    }
    return area;
}
function getFontMetrics(font, fontSize, options) {
    _console$t.assertTypeWithError(fontSize, "number");
    options = options
        ? { ...defaultFontToSpriteSheetOptions, ...options }
        : defaultFontToSpriteSheetOptions;
    const fonts = Array.isArray(font) ? font : [font];
    let minSpriteY = Infinity;
    let maxSpriteY = -Infinity;
    const strokeWidth = options.stroke ? options.strokeWidth || 1 : 0;
    let string = options.string;
    if (string) {
        string = removeRedundantCharacters(string);
        _console$t.log("filtered string", string);
    }
    for (let font of fonts) {
        const fontScale = (1 / font.unitsPerEm) * fontSize;
        let filteredGlyphs;
        if (string != undefined) {
            try {
                filteredGlyphs = font
                    .stringToGlyphs(string)
                    .filter((glyph) => glyph.unicode != undefined);
                string = removeSubstrings(string, filteredGlyphs.map((glyph) => String.fromCharCode(glyph.unicode)));
            }
            catch (error) {
                _console$t.error(error);
            }
        }
        for (let index = 0; index < font.glyphs.length; index++) {
            const glyph = font.glyphs.get(index);
            const hasUnicode = glyph.unicode != undefined;
            if (filteredGlyphs) {
                if (!filteredGlyphs.includes(glyph)) {
                    continue;
                }
            }
            if (options.unicodeOnly || options.englishOnly) {
                if (!hasUnicode) {
                    continue;
                }
            }
            if (options.script && hasUnicode) {
                const regex = new RegExp(`\\p{Script=${options.script}}`, "u");
                if (!regex.test(String.fromCharCode(glyph.unicode))) {
                    continue;
                }
            }
            if (options.englishOnly) {
                if (!englishRegex.test(String.fromCharCode(glyph.unicode))) {
                    continue;
                }
            }
            const bbox = glyph.getBoundingBox();
            minSpriteY = Math.min(minSpriteY, bbox.y1 * fontScale);
            maxSpriteY = Math.max(maxSpriteY, bbox.y2 * fontScale);
        }
        _console$t.log({
            fontName: font.getEnglishName("fullName"),
            minSpriteY,
            maxSpriteY,
        });
    }
    minSpriteY = options.minSpriteY ?? minSpriteY;
    maxSpriteY = options.maxSpriteY ?? maxSpriteY;
    if (minSpriteY == Infinity) {
        minSpriteY = 0;
    }
    if (maxSpriteY == -Infinity) {
        maxSpriteY = 0;
    }
    let maxSpriteHeight = options.maxSpriteHeight ?? maxSpriteY - minSpriteY + strokeWidth;
    if (options.maxSpriteHeight) {
        if (options.overrideMaxSpriteHeight) {
            maxSpriteHeight = options.maxSpriteHeight;
        }
        else {
            maxSpriteHeight = Math.max(options.maxSpriteHeight, maxSpriteHeight);
        }
    }
    _console$t.log({ maxSpriteHeight, minSpriteY, maxSpriteY }, options);
    return { maxSpriteHeight, maxSpriteY, minSpriteY };
}
async function fontToSpriteSheet(font, fontSize, spriteSheetName, options) {
    _console$t.assertTypeWithError(fontSize, "number");
    options = options
        ? { ...defaultFontToSpriteSheetOptions, ...options }
        : defaultFontToSpriteSheetOptions;
    const fonts = Array.isArray(font) ? font : [font];
    font = fonts[0];
    spriteSheetName = spriteSheetName || font.getEnglishName("fullName");
    const spriteSheet = {
        name: spriteSheetName,
        sprites: [],
    };
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const { maxSpriteHeight, maxSpriteY, minSpriteY } = getFontMetrics(fonts, fontSize, options);
    const strokeWidth = options.stroke ? options.strokeWidth || 1 : 0;
    let string = options.string;
    if (string) {
        string = removeRedundantCharacters(string);
        _console$t.log("filtered string", string);
    }
    for (let font of fonts) {
        const fontScale = (1 / font.unitsPerEm) * fontSize;
        const glyphs = [];
        let filteredGlyphs;
        if (string != undefined) {
            filteredGlyphs = font
                .stringToGlyphs(string)
                .filter((glyph) => glyph.unicode != undefined);
            string = removeSubstrings(string, filteredGlyphs.map((glyph) => String.fromCharCode(glyph.unicode)));
        }
        for (let index = 0; index < font.glyphs.length; index++) {
            const glyph = font.glyphs.get(index);
            const hasUnicode = glyph.unicode != undefined;
            if (filteredGlyphs) {
                if (!filteredGlyphs.includes(glyph)) {
                    continue;
                }
            }
            if (options.unicodeOnly || options.englishOnly) {
                if (!hasUnicode) {
                    continue;
                }
            }
            if (options.script && hasUnicode) {
                const regex = new RegExp(`\\p{Script=${options.script}}`, "u");
                if (!regex.test(String.fromCharCode(glyph.unicode))) {
                    continue;
                }
            }
            if (options.englishOnly) {
                if (!englishRegex.test(String.fromCharCode(glyph.unicode))) {
                    continue;
                }
            }
            glyphs.push(glyph);
        }
        for (let i = 0; i < glyphs.length; i++) {
            const glyph = glyphs[i];
            let name = glyph.name;
            if (glyph.unicode != undefined) {
                name = String.fromCharCode(glyph.unicode);
            }
            if (typeof name != "string") {
                continue;
            }
            const bbox = glyph.getBoundingBox();
            const spriteWidth = Math.max(Math.max(bbox.x2, bbox.x2 - bbox.x1), glyph.advanceWidth ?? 0) *
                fontScale +
                strokeWidth;
            const spriteHeight = maxSpriteHeight;
            const commands = [];
            const path = glyph.getPath(-bbox.x1 * fontScale, bbox.y2 * fontScale, fontSize);
            if (options.stroke) {
                path.stroke = "white";
                path.strokeWidth = strokeWidth;
                commands.push({ type: "setLineWidth", lineWidth: strokeWidth });
                commands.push({ type: "setIgnoreFill", ignoreFill: true });
            }
            else {
                path.fill = "white";
            }
            const bitmapWidth = (bbox.x2 - bbox.x1) * fontScale + strokeWidth;
            const bitmapHeight = (bbox.y2 - bbox.y1) * fontScale + strokeWidth;
            const bitmapX = (spriteWidth - bitmapWidth) / 2;
            const bitmapY = (spriteHeight - bitmapHeight) / 2 - (bbox.y1 * fontScale - minSpriteY);
            if (options.usePath) {
                const pathOffset = {
                    x: -bitmapWidth / 2 + bitmapX,
                    y: -bitmapHeight / 2 + bitmapY,
                };
                _console$t.log(`${name} path.commands`, path.commands);
                let curves = [];
                let startPoint = { x: 0, y: 0 };
                const allCurves = [];
                const parsedPaths = [];
                let wasHole = false;
                let pathCommands = path.commands;
                pathCommands.forEach((cmd) => {
                    switch (cmd.type) {
                        case "M":
                            {
                                startPoint.x = cmd.x;
                                startPoint.y = cmd.y;
                            }
                            break;
                        case "L":
                            {
                                const controlPoints = [{ x: cmd.x, y: cmd.y }];
                                if (curves.length === 0) {
                                    controlPoints.unshift({ ...startPoint });
                                }
                                curves.push({ type: "segment", controlPoints });
                            }
                            break;
                        case "Q":
                            {
                                const controlPoints = [
                                    { x: cmd.x1, y: cmd.y1 },
                                    { x: cmd.x, y: cmd.y },
                                ];
                                if (curves.length === 0) {
                                    controlPoints.unshift({ ...startPoint });
                                }
                                curves.push({ type: "quadratic", controlPoints });
                            }
                            break;
                        case "C":
                            {
                                const controlPoints = [
                                    { x: cmd.x1, y: cmd.y1 },
                                    { x: cmd.x2, y: cmd.y2 },
                                    { x: cmd.x, y: cmd.y },
                                ];
                                if (curves.length === 0) {
                                    controlPoints.unshift({ ...startPoint });
                                }
                                curves.push({ type: "cubic", controlPoints });
                            }
                            break;
                        case "Z":
                            {
                                if (curves.length === 0) {
                                    break;
                                }
                                curves = simplifyCurves(curves);
                                const controlPoints = curves.flatMap((c) => c.controlPoints);
                                controlPoints.forEach((pt) => {
                                    pt.x = pt.x + pathOffset.x;
                                    pt.y = pt.y + pathOffset.y;
                                });
                                allCurves.push(curves);
                                curves = [];
                            }
                            break;
                    }
                });
                _console$t.log("allCurves", allCurves);
                allCurves.sort((a, b) => {
                    const aPoints = getCurvesPoints(a);
                    const bPoints = getCurvesPoints(b);
                    return contourArea(bPoints) - contourArea(aPoints);
                });
                _console$t.log("sorted allCurves", allCurves);
                allCurves.forEach((curves) => {
                    let controlPoints = curves.flatMap((c) => c.controlPoints);
                    const isHole = classifySubpath(controlPoints, parsedPaths);
                    parsedPaths.push({ path: controlPoints, isHole });
                    if (isHole != wasHole) {
                        wasHole = isHole;
                        if (isHole) {
                            commands.push({
                                type: "selectFillColor",
                                fillColorIndex: 0,
                            });
                        }
                        else {
                            commands.push({
                                type: "selectFillColor",
                                fillColorIndex: 1,
                            });
                        }
                    }
                    const isSegments = curves.every((c) => c.type === "segment");
                    controlPoints.forEach((controlPoint) => {
                        controlPoint.x = Math.round(controlPoint.x);
                        controlPoint.y = Math.round(controlPoint.y);
                    });
                    controlPoints = controlPoints.map(({ x, y }) => ({
                        x: Math.round(x),
                        y: Math.round(y),
                    }));
                    if (isSegments) {
                        commands.push({
                            type: "drawPolygon",
                            points: controlPoints,
                        });
                    }
                    else {
                        commands.push({ type: "drawClosedPath", curves });
                    }
                });
            }
            else {
                if (bitmapWidth > 0 && bitmapHeight > 0) {
                    const _bitmapWidth = Math.ceil(bitmapWidth);
                    const _bitmapHeight = Math.ceil(bitmapHeight);
                    canvas.width = _bitmapWidth;
                    canvas.height = _bitmapHeight;
                    ctx.imageSmoothingEnabled = false;
                    ctx.fillStyle = "black";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    path.draw(ctx);
                    const { colorIndices } = await quantizeCanvas(canvas, 2, [
                        "#000000",
                        "#ffffff",
                    ]);
                    const bitmap = {
                        width: _bitmapWidth,
                        height: _bitmapHeight,
                        numberOfColors: 2,
                        pixels: colorIndices,
                    };
                    commands.push({
                        type: "selectBitmapColor",
                        bitmapColorIndex: 1,
                        colorIndex: 1,
                    });
                    commands.push({
                        type: "drawBitmap",
                        offsetX: bitmapX,
                        offsetY: bitmapY,
                        bitmap,
                    });
                }
            }
            const sprite = {
                name,
                commands,
                width: Math.ceil(spriteWidth),
                height: Math.ceil(spriteHeight),
            };
            spriteSheet.sprites.push(sprite);
        }
        if (string != undefined && string.length == 0) {
            break;
        }
    }
    return spriteSheet;
}
function stringToSprites(string, spriteSheet, requireAll = false) {
    const sprites = [];
    let substring = string;
    while (substring.length > 0) {
        let longestSprite;
        spriteSheet.sprites.forEach((sprite) => {
            if (substring.startsWith(sprite.name)) {
                if (!longestSprite || sprite.name.length > longestSprite.name.length) {
                    longestSprite = sprite;
                }
            }
        });
        if (requireAll) {
            _console$t.assertWithError(longestSprite, `couldn't find sprite with name prefixing "${substring}"`);
        }
        if (longestSprite) {
            sprites.push(longestSprite);
            substring = substring.substring(longestSprite.name.length);
        }
        else {
            substring = substring.substring(1);
        }
    }
    return sprites;
}
function getReferencedSprites(sprite, spriteSheet) {
    const sprites = [];
    sprite.commands
        .filter((command) => command.type == "drawSprite")
        .map((command) => command.spriteIndex)
        .map((spriteIndex) => spriteSheet.sprites[spriteIndex])
        .forEach((_sprite) => {
        if (!sprites.includes(_sprite)) {
            sprites.push(_sprite);
            sprites.push(...getReferencedSprites(_sprite, spriteSheet));
        }
    });
    _console$t.log("referencedSprites", sprite, sprites);
    return sprites;
}
function reduceSpriteSheet(spriteSheet, spriteNames, requireAll = false) {
    const reducedSpriteSheet = Object.assign({}, spriteSheet);
    if (!(spriteNames instanceof Array)) {
        spriteNames = stringToSprites(spriteNames, spriteSheet, requireAll).map((sprite) => sprite.name);
    }
    _console$t.log("reducingSpriteSheet", spriteSheet, spriteNames);
    reducedSpriteSheet.sprites = [];
    spriteSheet.sprites.forEach((sprite) => {
        if (spriteNames.includes(sprite.name)) {
            reducedSpriteSheet.sprites.push(sprite);
            reducedSpriteSheet.sprites.push(...getReferencedSprites(sprite, spriteSheet));
        }
    });
    _console$t.log("reducedSpriteSheet", reducedSpriteSheet);
    return reducedSpriteSheet;
}
function stringToSpriteLines(string, spriteSheets, contextState, requireAll = false, maxLineBreadth = Infinity, separators = [" "]) {
    _console$t.log("stringToSpriteLines", string);
    const isSpritesDirectionHorizontal = isDirectionHorizontal(contextState.spritesDirection);
    const isSpritesLineDirectionHorizontal = isDirectionHorizontal(contextState.spritesLineDirection);
    const areSpritesDirectionsOrthogonal = isSpritesDirectionHorizontal != isSpritesLineDirectionHorizontal;
    const lineStrings = string.split("\n");
    let lineBreadth = 0;
    if (isSpritesDirectionHorizontal) {
        maxLineBreadth /= contextState.spriteScaleX;
    }
    else {
        maxLineBreadth /= contextState.spriteScaleY;
    }
    const sprites = [];
    let latestSeparatorIndex = -1;
    let latestSeparator;
    let latestSeparatorLineBreadth;
    let latestSeparatorBreadth;
    const spritesLineIndices = [];
    lineStrings.forEach((lineString) => {
        sprites.push([]);
        spritesLineIndices.push([]);
        const i = sprites.length - 1;
        if (areSpritesDirectionsOrthogonal) {
            lineBreadth = 0;
        }
        else {
            lineBreadth += contextState.spritesLineSpacing;
        }
        let lineSubstring = lineString;
        while (lineSubstring.length > 0) {
            let longestSprite;
            let longestSpriteSheet;
            for (let spriteSheetName in spriteSheets) {
                const spriteSheet = spriteSheets[spriteSheetName];
                spriteSheet.sprites.forEach((sprite) => {
                    if (lineSubstring.startsWith(sprite.name)) {
                        if (!longestSprite ||
                            sprite.name.length > longestSprite.name.length) {
                            longestSprite = sprite;
                            longestSpriteSheet = spriteSheet;
                        }
                    }
                });
            }
            if (requireAll) {
                _console$t.assertWithError(longestSprite, `couldn't find sprite with name prefixing "${lineSubstring}"`);
            }
            if (longestSprite && longestSpriteSheet) {
                const isSeparator = separators.length > 0
                    ? separators.includes(longestSprite.name)
                    : true;
                sprites[i].push({
                    sprite: longestSprite,
                    spriteSheet: longestSpriteSheet,
                });
                let newLineBreadth = lineBreadth;
                const longestSpriteBreadth = isSpritesDirectionHorizontal
                    ? longestSprite.width
                    : longestSprite.height;
                newLineBreadth += longestSpriteBreadth;
                newLineBreadth += contextState.spritesSpacing;
                if (newLineBreadth >= maxLineBreadth) {
                    if (isSeparator) {
                        if (longestSprite.name.trim().length == 0) {
                            sprites[i].pop();
                        }
                        spritesLineIndices[i].push(sprites[i].length);
                        lineBreadth = 0;
                    }
                    else {
                        if (latestSeparatorIndex != -1) {
                            if (latestSeparator.trim().length == 0) {
                                sprites[i].splice(latestSeparatorIndex, 1);
                                lineBreadth -= latestSeparatorBreadth;
                            }
                            spritesLineIndices[i].push(latestSeparatorIndex);
                            lineBreadth = newLineBreadth - latestSeparatorLineBreadth;
                        }
                        else {
                            spritesLineIndices[i].push(sprites[i].length - 1);
                            lineBreadth = 0;
                        }
                    }
                    latestSeparatorIndex = -1;
                    latestSeparator = undefined;
                }
                else {
                    lineBreadth = newLineBreadth;
                    if (isSeparator) {
                        latestSeparator = longestSprite.name;
                        latestSeparatorIndex = sprites[i].length - 1;
                        latestSeparatorLineBreadth = lineBreadth;
                        latestSeparatorBreadth = longestSpriteBreadth;
                    }
                }
                lineSubstring = lineSubstring.substring(longestSprite.name.length);
            }
            else {
                lineSubstring = lineSubstring.substring(1);
            }
        }
    });
    const spriteLines = [];
    sprites.forEach((_sprites, i) => {
        let spriteLine = [];
        spriteLines.push(spriteLine);
        let spriteSubLine;
        _sprites.forEach(({ sprite, spriteSheet }, index) => {
            if (spritesLineIndices[i].includes(index)) {
                spriteLine = [];
                spriteLines.push(spriteLine);
                spriteSubLine = undefined;
            }
            if (!spriteSubLine || spriteSubLine.spriteSheetName != spriteSheet.name) {
                spriteSubLine = {
                    spriteSheetName: spriteSheet.name,
                    spriteNames: [],
                };
                spriteLine.push(spriteSubLine);
            }
            spriteSubLine.spriteNames.push(sprite.name);
        });
    });
    _console$t.log(`spriteLines for "${string}"`, spriteLines);
    return spriteLines;
}
function getFontMaxHeight(font, fontSize) {
    const scale = (1 / font.unitsPerEm) * fontSize;
    const maxHeight = (font.ascender - font.descender) * scale;
    _console$t.log({ font: font.getEnglishName("fullName"), maxHeight, fontSize });
    return maxHeight;
}
function getMaxSpriteSheetSize(spriteSheet) {
    const size = { width: 0, height: 0 };
    spriteSheet.sprites.forEach((sprite) => {
        size.width = Math.max(size.width, sprite.width);
        size.height = Math.max(size.height, sprite.height);
    });
    return size;
}
function getExpandedSpriteLines(spriteLines, spriteSheets) {
    const expandedSpritesLines = [];
    spriteLines.forEach((spriteLine) => {
        const _spritesLine = [];
        spriteLine.forEach(({ spriteSheetName, spriteNames }) => {
            const spriteSheet = spriteSheets[spriteSheetName];
            _console$t.assertWithError(spriteSheet, `no spriteSheet found with name "${spriteSheetName}"`);
            spriteNames.forEach((spriteName) => {
                const sprite = spriteSheet.sprites.find((sprite) => sprite.name == spriteName);
                _console$t.assertWithError(sprite, `no sprite found with name "${spriteName} in "${spriteSheetName}" spriteSheet`);
                _spritesLine.push(sprite);
            });
        });
        expandedSpritesLines.push(_spritesLine);
    });
    return expandedSpritesLines;
}
function getExpandedSpriteLinesSize(expandedSpritesLines, contextState) {
    const localSize = { width: 0, height: 0 };
    const isSpritesDirectionHorizontal = isDirectionHorizontal(contextState.spritesDirection);
    const isSpritesLineDirectionHorizontal = isDirectionHorizontal(contextState.spritesLineDirection);
    const areSpritesDirectionsOrthogonal = isSpritesDirectionHorizontal != isSpritesLineDirectionHorizontal;
    const breadthSizeKey = isSpritesDirectionHorizontal ? "width" : "height";
    const depthSizeKey = isSpritesLineDirectionHorizontal ? "width" : "height";
    if (!areSpritesDirectionsOrthogonal) {
        if (isSpritesDirectionHorizontal) {
            localSize.height += contextState.spritesLineHeight;
        }
        else {
            localSize.width += contextState.spritesLineHeight;
        }
    }
    const lineBreadths = [];
    expandedSpritesLines.forEach((expandedSpriteLine, lineIndex) => {
        let spritesLineBreadth = 0;
        expandedSpriteLine.forEach((sprite) => {
            spritesLineBreadth += isSpritesDirectionHorizontal
                ? sprite.width
                : sprite.height;
            spritesLineBreadth += contextState.spritesSpacing;
        });
        spritesLineBreadth -= contextState.spritesSpacing;
        if (areSpritesDirectionsOrthogonal) {
            localSize[breadthSizeKey] = Math.max(localSize[breadthSizeKey], spritesLineBreadth);
            localSize[depthSizeKey] += contextState.spritesLineHeight;
        }
        else {
            localSize[breadthSizeKey] += spritesLineBreadth;
        }
        localSize[depthSizeKey] += contextState.spritesLineSpacing;
        lineBreadths.push(spritesLineBreadth);
    });
    localSize[depthSizeKey] -= contextState.spritesLineSpacing;
    const spritesScaledWidth = localSize.width * Math.abs(contextState.spriteScaleX);
    const spritesScaledHeight = localSize.height * Math.abs(contextState.spriteScaleY);
    const size = {
        width: spritesScaledWidth,
        height: spritesScaledHeight,
    };
    return { localSize, size, lineBreadths };
}
function getSpriteLinesMetrics(spriteLines, spriteSheets, contextState) {
    const expandedSpritesLines = getExpandedSpriteLines(spriteLines, spriteSheets);
    return {
        expandedSpritesLines,
        numberOfLines: expandedSpritesLines.length,
        ...getExpandedSpriteLinesSize(expandedSpritesLines, contextState),
    };
}
function stringToSpriteLinesMetrics(string, spriteSheets, contextState, requireAll, maxLineBreadth, separators) {
    return getSpriteLinesMetrics(stringToSpriteLines(string, spriteSheets, contextState, requireAll, maxLineBreadth, separators), spriteSheets, contextState);
}
function spriteLinesToSerializedLines(displayManager, spriteLines) {
    const spriteSerializedLines = [];
    spriteLines.forEach((spriteLine) => {
        const serializedLine = [];
        spriteLine.forEach((spriteSubLine) => {
            displayManager.assertLoadedSpriteSheet(spriteSubLine.spriteSheetName);
            const spriteSheet = displayManager.spriteSheets[spriteSubLine.spriteSheetName];
            const spriteSheetIndex = displayManager.spriteSheetIndices[spriteSheet.name];
            const serializedSubLine = {
                spriteSheetIndex,
                spriteIndices: [],
                use2Bytes: spriteSheet.sprites.length > 255,
            };
            spriteSubLine.spriteNames.forEach((spriteName) => {
                let spriteIndex = spriteSheet.sprites.findIndex((sprite) => sprite.name == spriteName);
                _console$t.assertWithError(spriteIndex != -1, `sprite "${spriteName}" not found`);
                spriteIndex = spriteIndex;
                serializedSubLine.spriteIndices.push(spriteIndex);
            });
            serializedLine.push(serializedSubLine);
        });
        spriteSerializedLines.push(serializedLine);
    });
    _console$t.log("spriteSerializedLines", spriteSerializedLines);
    return spriteSerializedLines;
}

const _console$s = createConsole("DisplayBitmapUtils", { log: false });
const drawBitmapHeaderLength = 2 + 2 + 2 + 4 + 1 + 2;
function getBitmapData(bitmap) {
    const pixelDataLength = getBitmapNumberOfBytes(bitmap);
    const dataView = new DataView(new ArrayBuffer(pixelDataLength));
    const pixelDepth = numberOfColorsToPixelDepth(bitmap.numberOfColors);
    const pixelsPerByte = pixelDepthToPixelsPerByte(pixelDepth);
    const pixelBitWidth = pixelDepthToPixelBitWidth(pixelDepth);
    bitmap.pixels.forEach((bitmapColorIndex, pixelIndex) => {
        const byteIndex = Math.floor(pixelIndex / pixelsPerByte);
        const byteSlot = pixelIndex % pixelsPerByte;
        const bitOffset = pixelBitWidth * byteSlot;
        const shift = 8 - pixelBitWidth - bitOffset;
        let value = dataView.getUint8(byteIndex);
        value |= bitmapColorIndex << shift;
        dataView.setUint8(byteIndex, value);
    });
    _console$s.log("getBitmapData", bitmap, dataView);
    return dataView;
}
function parseBitmap(dataView, offset) {
    const width = dataView.getUint16(offset, true);
    offset += 2;
    const numberOfPixels = dataView.getUint32(offset, true);
    offset += 4;
    const numberOfColors = dataView.getUint8(offset++);
    const pixelDataLength = dataView.getUint16(offset, true);
    offset += 2;
    const height = Math.round(numberOfPixels / width);
    const pixelDepth = numberOfColorsToPixelDepth(numberOfColors);
    const pixelsPerByte = pixelDepthToPixelsPerByte(pixelDepth);
    const pixelBitWidth = pixelDepthToPixelBitWidth(pixelDepth);
    const pixels = [];
    let pixelIndex = 0;
    for (let byteIndex = 0; byteIndex < pixelDataLength; byteIndex++) {
        const value = dataView.getUint8(offset++);
        for (let byteSlot = 0; byteSlot < pixelsPerByte; byteSlot++) {
            const bitOffset = pixelBitWidth * byteSlot;
            const shift = 8 - pixelBitWidth - bitOffset;
            const bitmapColorIndex = (value >> shift) & ((1 << pixelBitWidth) - 1);
            pixels[pixelIndex++] = bitmapColorIndex;
        }
    }
    const bitmap = {
        width,
        height,
        numberOfColors,
        pixels,
    };
    return { bitmap, offset };
}
async function quantizeCanvas(canvas, numberOfColors, colors) {
    _console$s.assertWithError(numberOfColors > 1, "numberOfColors must be greater than 1");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    removeAlphaFromCanvas(canvas);
    const isSmall = canvas.width * canvas.height < 4;
    const quantOptions = {
        method: isSmall ? 1 : 2,
        colors: numberOfColors,
        dithKern: null,
        useCache: false,
        reIndex: true,
        orDist: "manhattan",
    };
    if (colors) {
        quantOptions.palette = colors.map((color) => {
            const rgb = hexToRGB(color);
            if (rgb) {
                const { r, g, b } = rgb;
                return [r, g, b];
            }
            else {
                _console$s.error(`invalid rgb hex "${color}"`);
            }
        });
    }
    const quantizer = new RGBQuant(quantOptions);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    quantizer.sample(imageData);
    const quantizedPixels = quantizer.reduce(imageData.data);
    const quantizedImageData = new ImageData(new Uint8ClampedArray(quantizedPixels.buffer), canvas.width, canvas.height);
    ctx.putImageData(quantizedImageData, 0, 0);
    const pixels = quantizedImageData.data;
    const quantizedPaletteData = quantizer.palette();
    const numberOfQuantizedPaletteColors = quantizedPaletteData.byteLength / 4;
    const quantizedPaletteColors = [];
    let closestColorIndexToBlack = 0;
    let closestColorDistanceToBlack = Infinity;
    const vector3 = { x: 0, y: 0, z: 0 };
    for (let colorIndex = 0; colorIndex < numberOfQuantizedPaletteColors; colorIndex++) {
        const rgb = {
            r: quantizedPaletteData[colorIndex * 4],
            g: quantizedPaletteData[colorIndex * 4 + 1],
            b: quantizedPaletteData[colorIndex * 4 + 2],
        };
        quantizedPaletteColors.push(rgb);
        vector3.x = rgb.r;
        vector3.y = rgb.g;
        vector3.z = rgb.b;
        const distanceToBlack = getVector3Length(vector3);
        if (distanceToBlack < closestColorDistanceToBlack) {
            closestColorDistanceToBlack = distanceToBlack;
            closestColorIndexToBlack = colorIndex;
        }
    }
    if (closestColorIndexToBlack != 0) {
        const [currentBlack, newBlack] = [
            quantizedPaletteColors[0],
            quantizedPaletteColors[closestColorIndexToBlack],
        ];
        quantizedPaletteColors[0] = newBlack;
        quantizedPaletteColors[closestColorIndexToBlack] = currentBlack;
    }
    const quantizedColors = quantizedPaletteColors.map((rgb, index) => {
        const hex = rgbToHex(rgb);
        return hex;
    });
    const quantizedColorIndices = [];
    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        pixels[i + 3];
        const hex = rgbToHex({ r, g, b });
        quantizedColorIndices.push(quantizedColors.indexOf(hex));
    }
    const promise = new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
            }
            else {
                reject();
            }
        }, "image/png");
    });
    const blob = await promise;
    return {
        blob,
        colors: quantizedColors,
        colorIndices: quantizedColorIndices,
    };
}
async function quantizeImage(image, width, height, numberOfColors, colors, canvas) {
    canvas = canvas || document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    let { naturalWidth: imageWidth, naturalHeight: imageHeight } = image;
    _console$s.log({ imageWidth, imageHeight });
    canvas.width = width;
    canvas.height = height;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, 0, 0, width, height);
    return quantizeCanvas(canvas, numberOfColors, colors);
}
function resizeImage(image, width, height, canvas) {
    canvas = canvas || document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    canvas.width = width;
    canvas.height = height;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, 0, 0, width, height);
    return canvas;
}
function removeAlphaFromCanvas(canvas) {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        if (alpha < 255) {
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
            data[i + 3] = 255;
        }
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas;
}
async function resizeAndQuantizeImage(image, width, height, numberOfColors, colors, canvas) {
    canvas = canvas || document.createElement("canvas");
    resizeImage(image, width, height, canvas);
    removeAlphaFromCanvas(canvas);
    return quantizeCanvas(canvas, numberOfColors, colors);
}
async function imageToBitmap(image, width, height, colors, bitmapColorIndices, numberOfColors) {
    if (numberOfColors == undefined) {
        numberOfColors = colors.length;
    }
    const bitmapColors = bitmapColorIndices
        .map((bitmapColorIndex) => colors[bitmapColorIndex])
        .slice(0, numberOfColors);
    const { blob, colorIndices } = await resizeAndQuantizeImage(image, width, height, numberOfColors, bitmapColors);
    const bitmap = {
        numberOfColors,
        pixels: colorIndices,
        width,
        height,
    };
    return { blob, bitmap };
}
function getBitmapNumberOfBytes(bitmap) {
    const pixelDepth = numberOfColorsToPixelDepth(bitmap.numberOfColors);
    const pixelsPerByte = pixelDepthToPixelsPerByte(pixelDepth);
    const numberOfPixels = bitmap.pixels.length;
    const pixelDataLength = Math.ceil(numberOfPixels / pixelsPerByte);
    _console$s.log({
        pixelDepth,
        pixelsPerByte,
        numberOfPixels,
        pixelDataLength,
    });
    return pixelDataLength;
}
function assertValidBitmapPixels(bitmap) {
    _console$s.assertRangeWithError("bitmap.pixels.length", bitmap.pixels.length, bitmap.width * (bitmap.height - 1) + 1, bitmap.width * bitmap.height);
    bitmap.pixels.forEach((pixel, index) => {
        _console$s.assertRangeWithError(`bitmap.pixels[${index}]`, pixel, 0, bitmap.numberOfColors - 1);
    });
}

const _console$r = createConsole("DisplayManagerInterface", { log: false });
async function runDisplayContextCommand(displayManager, command, sendImmediately, isSending) {
    if (command.hide) {
        return;
    }
    switch (command.type) {
        case "show":
            await displayManager.show(sendImmediately, false, isSending);
            break;
        case "clear":
            await displayManager.clear(sendImmediately, false, isSending);
            break;
        case "saveContext":
            break;
        case "restoreContext":
            break;
        case "clearRotation":
            await displayManager.clearRotation(sendImmediately, isSending);
            break;
        case "clearCrop":
            await displayManager.clearCrop(sendImmediately, isSending);
            break;
        case "clearRotationCrop":
            await displayManager.clearRotationCrop(sendImmediately, isSending);
            break;
        case "resetBitmapScale":
            await displayManager.resetBitmapScale(sendImmediately, isSending);
            break;
        case "resetSpriteScale":
            await displayManager.resetSpriteScale(sendImmediately, isSending);
            break;
        case "setColor":
            {
                const { colorIndex, color } = command;
                await displayManager.setColor(colorIndex, color, sendImmediately, isSending);
            }
            break;
        case "setColorOpacity":
            {
                const { colorIndex, opacity } = command;
                await displayManager.setColorOpacity(colorIndex, opacity, sendImmediately, isSending);
            }
            break;
        case "setOpacity":
            {
                const { opacity } = command;
                await displayManager.setOpacity(opacity, sendImmediately, isSending);
            }
            break;
        case "selectBackgroundColor":
            {
                const { backgroundColorIndex } = command;
                await displayManager.selectBackgroundColor(backgroundColorIndex, sendImmediately, isSending);
            }
            break;
        case "selectFillColor":
            {
                const { fillColorIndex } = command;
                await displayManager.selectFillColor(fillColorIndex, sendImmediately, isSending);
            }
            break;
        case "selectLineColor":
            {
                const { lineColorIndex } = command;
                await displayManager.selectLineColor(lineColorIndex, sendImmediately, isSending);
            }
            break;
        case "setIgnoreFill":
            {
                const { ignoreFill } = command;
                await displayManager.setIgnoreFill(ignoreFill, sendImmediately, isSending);
            }
            break;
        case "setIgnoreLine":
            {
                const { ignoreLine } = command;
                await displayManager.setIgnoreLine(ignoreLine, sendImmediately, isSending);
            }
            break;
        case "setFillBackground":
            {
                const { fillBackground } = command;
                await displayManager.setFillBackground(fillBackground, sendImmediately, isSending);
            }
            break;
        case "setLineWidth":
            {
                const { lineWidth } = command;
                await displayManager.setLineWidth(lineWidth, sendImmediately, isSending);
            }
            break;
        case "setRotation":
            {
                let { rotation, isRadians } = command;
                rotation = isRadians ? rotation : degToRad(rotation);
                await displayManager.setRotation(rotation, true, sendImmediately, isSending);
            }
            break;
        case "setSegmentStartCap":
            {
                const { segmentStartCap } = command;
                await displayManager.setSegmentStartCap(segmentStartCap, sendImmediately, isSending);
            }
            break;
        case "setSegmentEndCap":
            {
                const { segmentEndCap } = command;
                await displayManager.setSegmentEndCap(segmentEndCap, sendImmediately, isSending);
            }
            break;
        case "setSegmentCap":
            {
                const { segmentCap } = command;
                await displayManager.setSegmentCap(segmentCap, sendImmediately, isSending);
            }
            break;
        case "setSegmentStartRadius":
            {
                const { segmentStartRadius } = command;
                await displayManager.setSegmentStartRadius(segmentStartRadius, sendImmediately, isSending);
            }
            break;
        case "setSegmentEndRadius":
            {
                const { segmentEndRadius } = command;
                await displayManager.setSegmentEndRadius(segmentEndRadius, sendImmediately, isSending);
            }
            break;
        case "setSegmentRadius":
            {
                const { segmentRadius } = command;
                await displayManager.setSegmentRadius(segmentRadius, sendImmediately, isSending);
            }
            break;
        case "setHorizontalAlignment":
            {
                const { horizontalAlignment } = command;
                await displayManager.setHorizontalAlignment(horizontalAlignment, sendImmediately, isSending);
            }
            break;
        case "setVerticalAlignment":
            {
                const { verticalAlignment } = command;
                await displayManager.setVerticalAlignment(verticalAlignment, sendImmediately, isSending);
            }
            break;
        case "resetAlignment":
            {
                await displayManager.resetAlignment(sendImmediately, isSending);
            }
            break;
        case "setCropTop":
            {
                const { cropTop } = command;
                await displayManager.setCropTop(cropTop, sendImmediately, isSending);
            }
            break;
        case "setCropRight":
            {
                const { cropRight } = command;
                await displayManager.setCropRight(cropRight, sendImmediately, isSending);
            }
            break;
        case "setCropBottom":
            {
                const { cropBottom } = command;
                await displayManager.setCropBottom(cropBottom, sendImmediately, isSending);
            }
            break;
        case "setCropLeft":
            {
                const { cropLeft } = command;
                await displayManager.setCropLeft(cropLeft, sendImmediately, isSending);
            }
            break;
        case "setRotationCropTop":
            {
                const { rotationCropTop } = command;
                await displayManager.setRotationCropTop(rotationCropTop, sendImmediately, isSending);
            }
            break;
        case "setRotationCropRight":
            {
                const { rotationCropRight } = command;
                await displayManager.setRotationCropRight(rotationCropRight, sendImmediately, isSending);
            }
            break;
        case "setRotationCropBottom":
            {
                const { rotationCropBottom } = command;
                await displayManager.setRotationCropBottom(rotationCropBottom, sendImmediately, isSending);
            }
            break;
        case "setRotationCropLeft":
            {
                const { rotationCropLeft } = command;
                await displayManager.setRotationCropLeft(rotationCropLeft, sendImmediately, isSending);
            }
            break;
        case "selectBitmapColor":
            {
                const { bitmapColorIndex, colorIndex } = command;
                await displayManager.selectBitmapColor(bitmapColorIndex, colorIndex, sendImmediately, isSending);
            }
            break;
        case "selectBitmapColors":
            {
                const { bitmapColorPairs } = command;
                await displayManager.selectBitmapColors(bitmapColorPairs, sendImmediately, isSending);
            }
            break;
        case "setBitmapScaleX":
            {
                const { bitmapScaleX } = command;
                await displayManager.setBitmapScaleX(bitmapScaleX, sendImmediately, isSending);
            }
            break;
        case "setBitmapScaleY":
            {
                const { bitmapScaleY } = command;
                await displayManager.setBitmapScaleY(bitmapScaleY, sendImmediately, isSending);
            }
            break;
        case "setBitmapScale":
            {
                const { bitmapScale } = command;
                await displayManager.setBitmapScale(bitmapScale, sendImmediately, isSending);
            }
            break;
        case "selectSpriteColor":
            {
                const { spriteColorIndex, colorIndex } = command;
                await displayManager.selectSpriteColor(spriteColorIndex, colorIndex, sendImmediately, isSending);
            }
            break;
        case "selectSpriteColors":
            {
                const { spriteColorPairs } = command;
                await displayManager.selectSpriteColors(spriteColorPairs, sendImmediately, isSending);
            }
            break;
        case "setSpriteScaleX":
            {
                const { spriteScaleX } = command;
                await displayManager.setSpriteScaleX(spriteScaleX, sendImmediately, isSending);
            }
            break;
        case "setSpriteScaleY":
            {
                const { spriteScaleY } = command;
                await displayManager.setSpriteScaleY(spriteScaleY, sendImmediately, isSending);
            }
            break;
        case "setSpriteScale":
            {
                const { spriteScale } = command;
                await displayManager.setSpriteScale(spriteScale, sendImmediately, isSending);
            }
            break;
        case "clearRect":
            {
                const { x, y, width, height } = command;
                await displayManager.clearRect(x, y, width, height, sendImmediately, isSending);
            }
            break;
        case "drawRect":
            {
                const { offsetX, offsetY, width, height } = command;
                await displayManager.drawRect(offsetX, offsetY, width, height, sendImmediately, isSending);
            }
            break;
        case "drawRoundRect":
            {
                const { offsetX, offsetY, width, height, borderRadius } = command;
                await displayManager.drawRoundRect(offsetX, offsetY, width, height, borderRadius, sendImmediately, isSending);
            }
            break;
        case "drawCircle":
            {
                const { offsetX, offsetY, radius } = command;
                await displayManager.drawCircle(offsetX, offsetY, radius, sendImmediately, isSending);
            }
            break;
        case "drawEllipse":
            {
                const { offsetX, offsetY, radiusX, radiusY } = command;
                await displayManager.drawEllipse(offsetX, offsetY, radiusX, radiusY, sendImmediately, isSending);
            }
            break;
        case "drawPolygon":
            {
                const { points } = command;
                await displayManager.drawPolygon(points, sendImmediately, isSending);
            }
            break;
        case "drawRegularPolygon":
            {
                const { offsetX, offsetY, radius, numberOfSides } = command;
                await displayManager.drawRegularPolygon(offsetX, offsetY, radius, numberOfSides, sendImmediately, isSending);
            }
            break;
        case "drawWireframe":
            {
                const { wireframe } = command;
                await displayManager.drawWireframe(wireframe, sendImmediately, isSending);
            }
            break;
        case "drawSegment":
            {
                const { startX, startY, endX, endY } = command;
                await displayManager.drawSegment(startX, startY, endX, endY, sendImmediately, isSending);
            }
            break;
        case "drawSegments":
            {
                const { points } = command;
                await displayManager.drawSegments(points.map(({ x, y }) => ({ x: x, y: y })), sendImmediately, isSending);
            }
            break;
        case "drawArc":
            {
                let { offsetX, offsetY, radius, startAngle, angleOffset, isRadians } = command;
                startAngle = isRadians ? startAngle : degToRad(startAngle);
                angleOffset = isRadians ? angleOffset : degToRad(angleOffset);
                await displayManager.drawArc(offsetX, offsetY, radius, startAngle, angleOffset, true, sendImmediately, isSending);
            }
            break;
        case "drawArcEllipse":
            {
                let { offsetX, offsetY, radiusX, radiusY, startAngle, angleOffset, isRadians, } = command;
                startAngle = isRadians ? startAngle : degToRad(startAngle);
                angleOffset = isRadians ? angleOffset : degToRad(angleOffset);
                await displayManager.drawArcEllipse(offsetX, offsetY, radiusX, radiusY, startAngle, angleOffset, true, sendImmediately, isSending);
            }
            break;
        case "drawBitmap":
            {
                const { offsetX, offsetY, bitmap } = command;
                await displayManager.drawBitmap(offsetX, offsetY, bitmap, sendImmediately, isSending);
            }
            break;
        case "drawSprite":
            {
                const { offsetX, offsetY, spriteIndex } = command;
                const spriteName = displayManager.selectedSpriteSheet?.sprites[spriteIndex].name;
                await displayManager.drawSprite(offsetX, offsetY, spriteName, sendImmediately, isSending);
            }
            break;
        case "setSpritesLineHeight":
            {
                const { spritesLineHeight } = command;
                await displayManager.setSpritesLineHeight(spritesLineHeight, sendImmediately, isSending);
            }
            break;
        case "setSpritesSpacing":
            {
                const { spritesSpacing } = command;
                await displayManager.setSpritesSpacing(spritesSpacing, sendImmediately, isSending);
            }
            break;
        case "setSpritesAlignment":
            {
                const { spritesAlignment } = command;
                await displayManager.setSpritesAlignment(spritesAlignment, sendImmediately, isSending);
            }
            break;
        case "setSpritesDirection":
            {
                const { spritesDirection } = command;
                await displayManager.setSpritesDirection(spritesDirection, sendImmediately, isSending);
            }
            break;
        case "setSpritesLineAlignment":
            {
                const { spritesLineAlignment } = command;
                await displayManager.setSpritesLineAlignment(spritesLineAlignment, sendImmediately, isSending);
            }
            break;
        case "setSpritesLineDirection":
            {
                const { spritesLineDirection } = command;
                await displayManager.setSpritesLineDirection(spritesLineDirection, sendImmediately, isSending);
            }
            break;
        case "setSpritesLineSpacing":
            {
                const { spritesLineSpacing } = command;
                await displayManager.setSpritesLineSpacing(spritesLineSpacing, sendImmediately, isSending);
            }
            break;
        case "drawSprites":
            {
                const { offsetX, offsetY, spriteSerializedLines } = command;
                const spriteLines = [];
                spriteSerializedLines.forEach((spriteSerializedLine) => {
                    const spriteLine = [];
                    spriteSerializedLine.forEach((spriteSerializedSubLine) => {
                        const { spriteIndices, spriteSheetIndex } = spriteSerializedSubLine;
                        const spriteSheetName = Object.entries(displayManager.spriteSheetIndices).find(([_spriteSheetName, _spriteSheetIndex]) => {
                            return _spriteSheetIndex == spriteSheetIndex;
                        })[0];
                        const spriteSheet = displayManager.spriteSheets[spriteSheetName];
                        const spriteSubLine = {
                            spriteSheetName: spriteSheet.name,
                            spriteNames: spriteIndices.map((spriteIndex) => spriteSheet.sprites[spriteIndex].name),
                        };
                        spriteLine.push(spriteSubLine);
                    });
                    spriteLines.push(spriteLine);
                });
                await displayManager.drawSprites(offsetX, offsetY, spriteLines, sendImmediately, isSending);
            }
            break;
        case "selectSpriteSheet":
            {
                const { spriteSheetIndex } = command;
                const spriteSheetName = Object.entries(displayManager.spriteSheetIndices).find((entry) => entry[1] == spriteSheetIndex)?.[0];
                await displayManager.selectSpriteSheet(spriteSheetName, sendImmediately, isSending);
            }
            break;
        case "resetSpriteColors":
            await displayManager.resetSpriteColors(sendImmediately, isSending);
            break;
        case "drawQuadraticBezierCurve":
            {
                const { controlPoints } = command;
                await displayManager.drawQuadraticBezierCurve(controlPoints, sendImmediately, isSending);
            }
            break;
        case "drawQuadraticBezierCurves":
            {
                const { controlPoints } = command;
                await displayManager.drawQuadraticBezierCurves(controlPoints, sendImmediately, isSending);
            }
            break;
        case "drawCubicBezierCurve":
            {
                const { controlPoints } = command;
                await displayManager.drawCubicBezierCurve(controlPoints, sendImmediately, isSending);
            }
            break;
        case "drawCubicBezierCurves":
            {
                const { controlPoints } = command;
                await displayManager.drawCubicBezierCurves(controlPoints, sendImmediately, isSending);
            }
            break;
        case "drawClosedPath":
            {
                const { curves } = command;
                await displayManager.drawClosedPath(curves, sendImmediately, isSending);
            }
            break;
        case "drawPath":
            {
                const { curves } = command;
                await displayManager.drawPath(curves, sendImmediately, isSending);
            }
            break;
        case "startSprite":
            {
                const { offsetX, offsetY, width, height } = command;
                await displayManager.startSprite(offsetX, offsetY, width, height, sendImmediately, isSending);
            }
            break;
        case "endSprite":
            await displayManager.endSprite(sendImmediately, isSending);
            break;
        case "clearContext":
            await displayManager.clearContext(sendImmediately, isSending);
            break;
    }
}
async function runDisplayContextCommands(displayManager, commands, sendImmediately, isSending) {
    _console$r.log("runDisplayContextCommands", commands, {
        sendImmediately,
        isSending,
    });
    commands = commands.filter((command) => !command.hide);
    for (let command of commands) {
        await runDisplayContextCommand(displayManager, command, false, isSending);
    }
    if (sendImmediately) {
        await displayManager.flushContextCommands();
    }
}
function assertLoadedSpriteSheet(displayManager, spriteSheetName) {
    _console$r.assertWithError(displayManager.spriteSheets[spriteSheetName], `spriteSheet "${spriteSheetName}" not loaded`);
}
function assertSelectedSpriteSheet(displayManager, spriteSheetName) {
    displayManager.assertLoadedSpriteSheet(spriteSheetName);
    _console$r.assertWithError(displayManager.selectedSpriteSheetName == spriteSheetName, `spriteSheet "${spriteSheetName}" not selected`);
}
function assertAnySelectedSpriteSheet(displayManager) {
    _console$r.assertWithError(displayManager.selectedSpriteSheet, "no spriteSheet selected");
}
function getSprite(displayManager, spriteName) {
    displayManager.assertAnySelectedSpriteSheet();
    return displayManager.selectedSpriteSheet.sprites.find((sprite) => sprite.name == spriteName);
}
function assertSprite(displayManager, spriteName) {
    displayManager.assertAnySelectedSpriteSheet();
    const sprite = displayManager.getSprite(spriteName);
    _console$r.assertWithError(sprite, `no sprite found with name "${spriteName}"`);
}
function getSpriteSheetPalette(displayManager, paletteName) {
    return displayManager.selectedSpriteSheet?.palettes?.find((palette) => palette.name == paletteName);
}
function getSpriteSheetPaletteSwap(displayManager, paletteSwapName) {
    return displayManager.selectedSpriteSheet?.paletteSwaps?.find((paletteSwap) => paletteSwap.name == paletteSwapName);
}
function getSpritePaletteSwap(displayManager, spriteName, paletteSwapName) {
    return displayManager
        .getSprite(spriteName)
        ?.paletteSwaps?.find((paletteSwap) => paletteSwap.name == paletteSwapName);
}
function assertSpriteSheetPalette(displayManagerInterface, paletteName) {
    const spriteSheetPalette = displayManagerInterface.getSpriteSheetPalette(paletteName);
    _console$r.assertWithError(spriteSheetPalette, `no spriteSheetPalette found with name "${paletteName}"`);
}
function assertSpriteSheetPaletteSwap(displayManagerInterface, paletteSwapName) {
    const spriteSheetPaletteSwap = displayManagerInterface.getSpriteSheetPaletteSwap(paletteSwapName);
    _console$r.assertWithError(spriteSheetPaletteSwap, `no paletteSwapName found with name "${paletteSwapName}"`);
}
function assertSpritePaletteSwap(displayManagerInterface, spriteName, paletteSwapName) {
    const spritePaletteSwap = displayManagerInterface.getSpritePaletteSwap(spriteName, paletteSwapName);
    _console$r.assertWithError(spritePaletteSwap, `no spritePaletteSwap found for sprite "${spriteName}" name "${paletteSwapName}"`);
}
async function selectSpriteSheetPalette(displayManagerInterface, paletteName, offset, indicesOnly, sendImmediately, isSending) {
    offset = offset || 0;
    displayManagerInterface.assertAnySelectedSpriteSheet();
    displayManagerInterface.assertSpriteSheetPalette(paletteName);
    const palette = displayManagerInterface.getSpriteSheetPalette(paletteName);
    _console$r.assertWithError(palette.numberOfColors + offset <= displayManagerInterface.numberOfColors, `invalid offset ${offset} and palette.numberOfColors ${palette.numberOfColors} (max ${displayManagerInterface.numberOfColors})`);
    for (let index = 0; index < palette.numberOfColors; index++) {
        if (!indicesOnly) {
            const color = palette.colors[index];
            let opacity = palette.opacities?.[index];
            if (opacity == undefined) {
                opacity = 1;
            }
            displayManagerInterface.setColor(index + offset, color, false, isSending);
            displayManagerInterface.setColorOpacity(index + offset, opacity, false, isSending);
        }
        displayManagerInterface.selectSpriteColor(index, index + offset, false, isSending);
    }
    if (sendImmediately) {
        displayManagerInterface.flushContextCommands();
    }
}
async function selectSpriteSheetPaletteSwap(displayManagerInterface, paletteSwapName, offset, sendImmediately, isSending) {
    offset = offset || 0;
    displayManagerInterface.assertAnySelectedSpriteSheet();
    displayManagerInterface.assertSpriteSheetPaletteSwap(paletteSwapName);
    const paletteSwap = displayManagerInterface.getSpriteSheetPaletteSwap(paletteSwapName);
    const spriteColorPairs = [];
    for (let spriteColorIndex = 0; spriteColorIndex < paletteSwap.numberOfColors; spriteColorIndex++) {
        const colorIndex = paletteSwap.spriteColorIndices[spriteColorIndex];
        spriteColorPairs.push({
            spriteColorIndex: spriteColorIndex + offset,
            colorIndex,
        });
    }
    displayManagerInterface.selectSpriteColors(spriteColorPairs, false, isSending);
    if (sendImmediately) {
        displayManagerInterface.flushContextCommands();
    }
}
async function selectSpritePaletteSwap(displayManagerInterface, spriteName, paletteSwapName, offset, sendImmediately, isSending) {
    offset = offset || 0;
    displayManagerInterface.assertAnySelectedSpriteSheet();
    const paletteSwap = displayManagerInterface.getSpritePaletteSwap(spriteName, paletteSwapName);
    const spriteColorPairs = [];
    for (let spriteColorIndex = 0; spriteColorIndex < paletteSwap.numberOfColors; spriteColorIndex++) {
        const colorIndex = paletteSwap.spriteColorIndices[spriteColorIndex];
        spriteColorPairs.push({
            spriteColorIndex: spriteColorIndex + offset,
            colorIndex,
        });
    }
    displayManagerInterface.selectSpriteColors(spriteColorPairs, false, isSending);
    if (sendImmediately) {
        displayManagerInterface.flushContextCommands();
    }
}
async function drawSpriteFromSpriteSheet(displayManagerInterface, offsetX, offsetY, spriteName, spriteSheet, paletteName, sendImmediately, isSending) {
    const reducedSpriteSheet = reduceSpriteSheet(spriteSheet, [spriteName]);
    await displayManagerInterface.uploadSpriteSheet(reducedSpriteSheet);
    await displayManagerInterface.selectSpriteSheet(spriteSheet.name);
    await displayManagerInterface.drawSprite(offsetX, offsetY, spriteName, false);
    if (paletteName != undefined) {
        await displayManagerInterface.selectSpriteSheetPalette(paletteName, undefined, false, isSending);
    }
    if (sendImmediately) {
        await displayManagerInterface.flushContextCommands();
    }
}
function getSpriteSheetByIndex(displayManagerInterface, index) {
    for (const [spriteSheetName, _index] of Object.entries(displayManagerInterface.spriteSheetIndices)) {
        if (_index == index) {
            return displayManagerInterface.spriteSheets[spriteSheetName];
        }
    }
}
function serializeColors(displayManager, other) {
    other = other ?? new Array(displayManager.numberOfColors).fill("#000000");
    const commands = [];
    displayManager.colors.forEach((color, colorIndex) => {
        if (color != other[colorIndex]) {
            commands.push({ type: "setColor", colorIndex, color });
        }
    });
    return commands;
}
function serializeOpacities(displayManager, other) {
    other = other ?? new Array(displayManager.numberOfColors).fill(1);
    const commands = [];
    displayManager.opacities.forEach((opacity, colorIndex) => {
        if (opacity != other[colorIndex]) {
            commands.push({ type: "setColorOpacity", colorIndex, opacity });
        }
    });
    return commands;
}

const _console$q = createConsole("DisplayManager", { log: false });
const DisplayCommands = ["sleep", "wake"];
const DisplayStatuses = ["awake", "asleep"];
const DisplayInformationTypes = [
    "type",
    "width",
    "height",
    "pixelDepth",
];
const DisplayTypes = [
    "none",
    "generic",
    "monocularLeft",
    "monocularRight",
    "binocular",
];
const DisplayPixelDepths = ["1", "2", "4"];
const DisplayBrightnesses = [
    "veryLow",
    "low",
    "medium",
    "high",
    "veryHigh",
];
const DisplayMessageTypes = [
    "isDisplayAvailable",
    "displayStatus",
    "displayInformation",
    "displayCommand",
    "getDisplayBrightness",
    "setDisplayBrightness",
    "displayContextCommands",
    "displayReady",
    "getSpriteSheetName",
    "setSpriteSheetName",
    "spriteSheetIndex",
];
const DisplayBezierCurveTypes = [
    "segment",
    "quadratic",
    "cubic",
];
const displayCurveTypeBitWidth = 2;
const displayCurveTypesPerByte = 8 / displayCurveTypeBitWidth;
const DisplayPointDataTypes = ["int8", "int16", "float"];
const displayPointDataTypeToSize = {
    int8: 1 * 2,
    int16: 2 * 2,
    float: 4 * 2,
};
const displayPointDataTypeToRange = {
    int8: { min: -128, max: 2 ** 7 - 1 },
    int16: { min: -32768, max: 2 ** 15 - 1 },
    float: { min: -Infinity, max: Infinity },
};
const DisplayInformationValues = {
    type: DisplayTypes,
    pixelDepth: DisplayPixelDepths,
};
const RequiredDisplayMessageTypes = [
    "displayInformation",
    "displayStatus",
    "getDisplayBrightness",
];
const DisplayEventTypes = [
    ...DisplayMessageTypes,
    "displayContextState",
    "displayColor",
    "displayColorOpacity",
    "displayOpacity",
    "displaySpriteSheetUploadStart",
    "displaySpriteSheetUploadProgress",
    "displaySpriteSheetUploadComplete",
];
const MinSpriteSheetNameLength = 1;
const MaxSpriteSheetNameLength = 30;
function ForwardToHelper(originalMethod, context) {
    return function (...args) {
        const helper = this.displayCanvasHelper;
        if (helper && helper !== args[args.length - 1]) {
            return helper[context.name](...args);
        }
        return originalMethod.apply(this, args);
    };
}
let DisplayManager = (() => {
    let _instanceExtraInitializers = [];
    let _setContextState_decorators;
    let _setBrightness_decorators;
    let _show_decorators;
    let _clear_decorators;
    let _setColor_decorators;
    let _setColorOpacity_decorators;
    let _setOpacity_decorators;
    let _saveContext_decorators;
    let _restoreContext_decorators;
    let _clearContext_decorators;
    let _selectFillColor_decorators;
    let _selectBackgroundColor_decorators;
    let _selectLineColor_decorators;
    let _setIgnoreFill_decorators;
    let _setIgnoreLine_decorators;
    let _setFillBackground_decorators;
    let _setLineWidth_decorators;
    let _setAlignment_decorators;
    let _setHorizontalAlignment_decorators;
    let _setVerticalAlignment_decorators;
    let _resetAlignment_decorators;
    let _setRotation_decorators;
    let _clearRotation_decorators;
    let _setSegmentStartCap_decorators;
    let _setSegmentEndCap_decorators;
    let _setSegmentCap_decorators;
    let _setSegmentStartRadius_decorators;
    let _setSegmentEndRadius_decorators;
    let _setSegmentRadius_decorators;
    let _setCrop_decorators;
    let _setCropTop_decorators;
    let _setCropRight_decorators;
    let _setCropBottom_decorators;
    let _setCropLeft_decorators;
    let _clearCrop_decorators;
    let _setRotationCrop_decorators;
    let _setRotationCropTop_decorators;
    let _setRotationCropRight_decorators;
    let _setRotationCropBottom_decorators;
    let _setRotationCropLeft_decorators;
    let _clearRotationCrop_decorators;
    let _selectBitmapColor_decorators;
    let _selectBitmapColors_decorators;
    let _setBitmapColor_decorators;
    let _setBitmapColorOpacity_decorators;
    let _setBitmapScaleDirection_decorators;
    let _setBitmapScaleX_decorators;
    let _setBitmapScaleY_decorators;
    let _setBitmapScale_decorators;
    let _resetBitmapScale_decorators;
    let _selectSpriteColor_decorators;
    let _selectSpriteColors_decorators;
    let _setSpriteColor_decorators;
    let _setSpriteColorOpacity_decorators;
    let _resetSpriteColors_decorators;
    let _setSpriteScaleDirection_decorators;
    let _setSpriteScaleX_decorators;
    let _setSpriteScaleY_decorators;
    let _setSpriteScale_decorators;
    let _resetSpriteScale_decorators;
    let _setSpritesLineHeight_decorators;
    let _setSpritesDirectionGeneric_decorators;
    let _setSpritesDirection_decorators;
    let _setSpritesLineDirection_decorators;
    let _setSpritesSpacingGeneric_decorators;
    let _setSpritesSpacing_decorators;
    let _setSpritesLineSpacing_decorators;
    let _setSpritesAlignmentGeneric_decorators;
    let _setSpritesAlignment_decorators;
    let _setSpritesLineAlignment_decorators;
    let _clearRect_decorators;
    let _drawRect_decorators;
    let _drawRoundRect_decorators;
    let _drawCircle_decorators;
    let _drawEllipse_decorators;
    let _drawRegularPolygon_decorators;
    let _drawPolygon_decorators;
    let _drawWireframe_decorators;
    let _drawCurve_decorators;
    let _drawCurves_decorators;
    let _drawQuadraticBezierCurve_decorators;
    let _drawQuadraticBezierCurves_decorators;
    let _drawCubicBezierCurve_decorators;
    let _drawCubicBezierCurves_decorators;
    let __drawPath_decorators;
    let _drawPath_decorators;
    let _drawClosedPath_decorators;
    let _drawSegment_decorators;
    let _drawSegments_decorators;
    let _drawArc_decorators;
    let _drawArcEllipse_decorators;
    let _drawBitmap_decorators;
    let _uploadSpriteSheet_decorators;
    let _selectSpriteSheet_decorators;
    let _drawSprite_decorators;
    let _drawSprites_decorators;
    let _drawSpritesString_decorators;
    let _drawSpriteFromSpriteSheet_decorators;
    let _selectSpriteSheetPalette_decorators;
    let _selectSpriteSheetPaletteSwap_decorators;
    let _selectSpritePaletteSwap_decorators;
    let _startSprite_decorators;
    let _endSprite_decorators;
    return class DisplayManager {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _setContextState_decorators = [ForwardToHelper];
            _setBrightness_decorators = [ForwardToHelper];
            _show_decorators = [ForwardToHelper];
            _clear_decorators = [ForwardToHelper];
            _setColor_decorators = [ForwardToHelper];
            _setColorOpacity_decorators = [ForwardToHelper];
            _setOpacity_decorators = [ForwardToHelper];
            _saveContext_decorators = [ForwardToHelper];
            _restoreContext_decorators = [ForwardToHelper];
            _clearContext_decorators = [ForwardToHelper];
            _selectFillColor_decorators = [ForwardToHelper];
            _selectBackgroundColor_decorators = [ForwardToHelper];
            _selectLineColor_decorators = [ForwardToHelper];
            _setIgnoreFill_decorators = [ForwardToHelper];
            _setIgnoreLine_decorators = [ForwardToHelper];
            _setFillBackground_decorators = [ForwardToHelper];
            _setLineWidth_decorators = [ForwardToHelper];
            _setAlignment_decorators = [ForwardToHelper];
            _setHorizontalAlignment_decorators = [ForwardToHelper];
            _setVerticalAlignment_decorators = [ForwardToHelper];
            _resetAlignment_decorators = [ForwardToHelper];
            _setRotation_decorators = [ForwardToHelper];
            _clearRotation_decorators = [ForwardToHelper];
            _setSegmentStartCap_decorators = [ForwardToHelper];
            _setSegmentEndCap_decorators = [ForwardToHelper];
            _setSegmentCap_decorators = [ForwardToHelper];
            _setSegmentStartRadius_decorators = [ForwardToHelper];
            _setSegmentEndRadius_decorators = [ForwardToHelper];
            _setSegmentRadius_decorators = [ForwardToHelper];
            _setCrop_decorators = [ForwardToHelper];
            _setCropTop_decorators = [ForwardToHelper];
            _setCropRight_decorators = [ForwardToHelper];
            _setCropBottom_decorators = [ForwardToHelper];
            _setCropLeft_decorators = [ForwardToHelper];
            _clearCrop_decorators = [ForwardToHelper];
            _setRotationCrop_decorators = [ForwardToHelper];
            _setRotationCropTop_decorators = [ForwardToHelper];
            _setRotationCropRight_decorators = [ForwardToHelper];
            _setRotationCropBottom_decorators = [ForwardToHelper];
            _setRotationCropLeft_decorators = [ForwardToHelper];
            _clearRotationCrop_decorators = [ForwardToHelper];
            _selectBitmapColor_decorators = [ForwardToHelper];
            _selectBitmapColors_decorators = [ForwardToHelper];
            _setBitmapColor_decorators = [ForwardToHelper];
            _setBitmapColorOpacity_decorators = [ForwardToHelper];
            _setBitmapScaleDirection_decorators = [ForwardToHelper];
            _setBitmapScaleX_decorators = [ForwardToHelper];
            _setBitmapScaleY_decorators = [ForwardToHelper];
            _setBitmapScale_decorators = [ForwardToHelper];
            _resetBitmapScale_decorators = [ForwardToHelper];
            _selectSpriteColor_decorators = [ForwardToHelper];
            _selectSpriteColors_decorators = [ForwardToHelper];
            _setSpriteColor_decorators = [ForwardToHelper];
            _setSpriteColorOpacity_decorators = [ForwardToHelper];
            _resetSpriteColors_decorators = [ForwardToHelper];
            _setSpriteScaleDirection_decorators = [ForwardToHelper];
            _setSpriteScaleX_decorators = [ForwardToHelper];
            _setSpriteScaleY_decorators = [ForwardToHelper];
            _setSpriteScale_decorators = [ForwardToHelper];
            _resetSpriteScale_decorators = [ForwardToHelper];
            _setSpritesLineHeight_decorators = [ForwardToHelper];
            _setSpritesDirectionGeneric_decorators = [ForwardToHelper];
            _setSpritesDirection_decorators = [ForwardToHelper];
            _setSpritesLineDirection_decorators = [ForwardToHelper];
            _setSpritesSpacingGeneric_decorators = [ForwardToHelper];
            _setSpritesSpacing_decorators = [ForwardToHelper];
            _setSpritesLineSpacing_decorators = [ForwardToHelper];
            _setSpritesAlignmentGeneric_decorators = [ForwardToHelper];
            _setSpritesAlignment_decorators = [ForwardToHelper];
            _setSpritesLineAlignment_decorators = [ForwardToHelper];
            _clearRect_decorators = [ForwardToHelper];
            _drawRect_decorators = [ForwardToHelper];
            _drawRoundRect_decorators = [ForwardToHelper];
            _drawCircle_decorators = [ForwardToHelper];
            _drawEllipse_decorators = [ForwardToHelper];
            _drawRegularPolygon_decorators = [ForwardToHelper];
            _drawPolygon_decorators = [ForwardToHelper];
            _drawWireframe_decorators = [ForwardToHelper];
            _drawCurve_decorators = [ForwardToHelper];
            _drawCurves_decorators = [ForwardToHelper];
            _drawQuadraticBezierCurve_decorators = [ForwardToHelper];
            _drawQuadraticBezierCurves_decorators = [ForwardToHelper];
            _drawCubicBezierCurve_decorators = [ForwardToHelper];
            _drawCubicBezierCurves_decorators = [ForwardToHelper];
            __drawPath_decorators = [ForwardToHelper];
            _drawPath_decorators = [ForwardToHelper];
            _drawClosedPath_decorators = [ForwardToHelper];
            _drawSegment_decorators = [ForwardToHelper];
            _drawSegments_decorators = [ForwardToHelper];
            _drawArc_decorators = [ForwardToHelper];
            _drawArcEllipse_decorators = [ForwardToHelper];
            _drawBitmap_decorators = [ForwardToHelper];
            _uploadSpriteSheet_decorators = [ForwardToHelper];
            _selectSpriteSheet_decorators = [ForwardToHelper];
            _drawSprite_decorators = [ForwardToHelper];
            _drawSprites_decorators = [ForwardToHelper];
            _drawSpritesString_decorators = [ForwardToHelper];
            _drawSpriteFromSpriteSheet_decorators = [ForwardToHelper];
            _selectSpriteSheetPalette_decorators = [ForwardToHelper];
            _selectSpriteSheetPaletteSwap_decorators = [ForwardToHelper];
            _selectSpritePaletteSwap_decorators = [ForwardToHelper];
            _startSprite_decorators = [ForwardToHelper];
            _endSprite_decorators = [ForwardToHelper];
            __esDecorate(this, null, _setContextState_decorators, { kind: "method", name: "setContextState", static: false, private: false, access: { has: obj => "setContextState" in obj, get: obj => obj.setContextState }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setBrightness_decorators, { kind: "method", name: "setBrightness", static: false, private: false, access: { has: obj => "setBrightness" in obj, get: obj => obj.setBrightness }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _show_decorators, { kind: "method", name: "show", static: false, private: false, access: { has: obj => "show" in obj, get: obj => obj.show }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _clear_decorators, { kind: "method", name: "clear", static: false, private: false, access: { has: obj => "clear" in obj, get: obj => obj.clear }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setColor_decorators, { kind: "method", name: "setColor", static: false, private: false, access: { has: obj => "setColor" in obj, get: obj => obj.setColor }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setColorOpacity_decorators, { kind: "method", name: "setColorOpacity", static: false, private: false, access: { has: obj => "setColorOpacity" in obj, get: obj => obj.setColorOpacity }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setOpacity_decorators, { kind: "method", name: "setOpacity", static: false, private: false, access: { has: obj => "setOpacity" in obj, get: obj => obj.setOpacity }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _saveContext_decorators, { kind: "method", name: "saveContext", static: false, private: false, access: { has: obj => "saveContext" in obj, get: obj => obj.saveContext }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _restoreContext_decorators, { kind: "method", name: "restoreContext", static: false, private: false, access: { has: obj => "restoreContext" in obj, get: obj => obj.restoreContext }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _clearContext_decorators, { kind: "method", name: "clearContext", static: false, private: false, access: { has: obj => "clearContext" in obj, get: obj => obj.clearContext }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _selectFillColor_decorators, { kind: "method", name: "selectFillColor", static: false, private: false, access: { has: obj => "selectFillColor" in obj, get: obj => obj.selectFillColor }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _selectBackgroundColor_decorators, { kind: "method", name: "selectBackgroundColor", static: false, private: false, access: { has: obj => "selectBackgroundColor" in obj, get: obj => obj.selectBackgroundColor }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _selectLineColor_decorators, { kind: "method", name: "selectLineColor", static: false, private: false, access: { has: obj => "selectLineColor" in obj, get: obj => obj.selectLineColor }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setIgnoreFill_decorators, { kind: "method", name: "setIgnoreFill", static: false, private: false, access: { has: obj => "setIgnoreFill" in obj, get: obj => obj.setIgnoreFill }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setIgnoreLine_decorators, { kind: "method", name: "setIgnoreLine", static: false, private: false, access: { has: obj => "setIgnoreLine" in obj, get: obj => obj.setIgnoreLine }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setFillBackground_decorators, { kind: "method", name: "setFillBackground", static: false, private: false, access: { has: obj => "setFillBackground" in obj, get: obj => obj.setFillBackground }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setLineWidth_decorators, { kind: "method", name: "setLineWidth", static: false, private: false, access: { has: obj => "setLineWidth" in obj, get: obj => obj.setLineWidth }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setAlignment_decorators, { kind: "method", name: "setAlignment", static: false, private: false, access: { has: obj => "setAlignment" in obj, get: obj => obj.setAlignment }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setHorizontalAlignment_decorators, { kind: "method", name: "setHorizontalAlignment", static: false, private: false, access: { has: obj => "setHorizontalAlignment" in obj, get: obj => obj.setHorizontalAlignment }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setVerticalAlignment_decorators, { kind: "method", name: "setVerticalAlignment", static: false, private: false, access: { has: obj => "setVerticalAlignment" in obj, get: obj => obj.setVerticalAlignment }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _resetAlignment_decorators, { kind: "method", name: "resetAlignment", static: false, private: false, access: { has: obj => "resetAlignment" in obj, get: obj => obj.resetAlignment }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setRotation_decorators, { kind: "method", name: "setRotation", static: false, private: false, access: { has: obj => "setRotation" in obj, get: obj => obj.setRotation }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _clearRotation_decorators, { kind: "method", name: "clearRotation", static: false, private: false, access: { has: obj => "clearRotation" in obj, get: obj => obj.clearRotation }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setSegmentStartCap_decorators, { kind: "method", name: "setSegmentStartCap", static: false, private: false, access: { has: obj => "setSegmentStartCap" in obj, get: obj => obj.setSegmentStartCap }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setSegmentEndCap_decorators, { kind: "method", name: "setSegmentEndCap", static: false, private: false, access: { has: obj => "setSegmentEndCap" in obj, get: obj => obj.setSegmentEndCap }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setSegmentCap_decorators, { kind: "method", name: "setSegmentCap", static: false, private: false, access: { has: obj => "setSegmentCap" in obj, get: obj => obj.setSegmentCap }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setSegmentStartRadius_decorators, { kind: "method", name: "setSegmentStartRadius", static: false, private: false, access: { has: obj => "setSegmentStartRadius" in obj, get: obj => obj.setSegmentStartRadius }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setSegmentEndRadius_decorators, { kind: "method", name: "setSegmentEndRadius", static: false, private: false, access: { has: obj => "setSegmentEndRadius" in obj, get: obj => obj.setSegmentEndRadius }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setSegmentRadius_decorators, { kind: "method", name: "setSegmentRadius", static: false, private: false, access: { has: obj => "setSegmentRadius" in obj, get: obj => obj.setSegmentRadius }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setCrop_decorators, { kind: "method", name: "setCrop", static: false, private: false, access: { has: obj => "setCrop" in obj, get: obj => obj.setCrop }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setCropTop_decorators, { kind: "method", name: "setCropTop", static: false, private: false, access: { has: obj => "setCropTop" in obj, get: obj => obj.setCropTop }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setCropRight_decorators, { kind: "method", name: "setCropRight", static: false, private: false, access: { has: obj => "setCropRight" in obj, get: obj => obj.setCropRight }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setCropBottom_decorators, { kind: "method", name: "setCropBottom", static: false, private: false, access: { has: obj => "setCropBottom" in obj, get: obj => obj.setCropBottom }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setCropLeft_decorators, { kind: "method", name: "setCropLeft", static: false, private: false, access: { has: obj => "setCropLeft" in obj, get: obj => obj.setCropLeft }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _clearCrop_decorators, { kind: "method", name: "clearCrop", static: false, private: false, access: { has: obj => "clearCrop" in obj, get: obj => obj.clearCrop }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setRotationCrop_decorators, { kind: "method", name: "setRotationCrop", static: false, private: false, access: { has: obj => "setRotationCrop" in obj, get: obj => obj.setRotationCrop }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setRotationCropTop_decorators, { kind: "method", name: "setRotationCropTop", static: false, private: false, access: { has: obj => "setRotationCropTop" in obj, get: obj => obj.setRotationCropTop }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setRotationCropRight_decorators, { kind: "method", name: "setRotationCropRight", static: false, private: false, access: { has: obj => "setRotationCropRight" in obj, get: obj => obj.setRotationCropRight }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setRotationCropBottom_decorators, { kind: "method", name: "setRotationCropBottom", static: false, private: false, access: { has: obj => "setRotationCropBottom" in obj, get: obj => obj.setRotationCropBottom }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setRotationCropLeft_decorators, { kind: "method", name: "setRotationCropLeft", static: false, private: false, access: { has: obj => "setRotationCropLeft" in obj, get: obj => obj.setRotationCropLeft }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _clearRotationCrop_decorators, { kind: "method", name: "clearRotationCrop", static: false, private: false, access: { has: obj => "clearRotationCrop" in obj, get: obj => obj.clearRotationCrop }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _selectBitmapColor_decorators, { kind: "method", name: "selectBitmapColor", static: false, private: false, access: { has: obj => "selectBitmapColor" in obj, get: obj => obj.selectBitmapColor }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _selectBitmapColors_decorators, { kind: "method", name: "selectBitmapColors", static: false, private: false, access: { has: obj => "selectBitmapColors" in obj, get: obj => obj.selectBitmapColors }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setBitmapColor_decorators, { kind: "method", name: "setBitmapColor", static: false, private: false, access: { has: obj => "setBitmapColor" in obj, get: obj => obj.setBitmapColor }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setBitmapColorOpacity_decorators, { kind: "method", name: "setBitmapColorOpacity", static: false, private: false, access: { has: obj => "setBitmapColorOpacity" in obj, get: obj => obj.setBitmapColorOpacity }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setBitmapScaleDirection_decorators, { kind: "method", name: "setBitmapScaleDirection", static: false, private: false, access: { has: obj => "setBitmapScaleDirection" in obj, get: obj => obj.setBitmapScaleDirection }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setBitmapScaleX_decorators, { kind: "method", name: "setBitmapScaleX", static: false, private: false, access: { has: obj => "setBitmapScaleX" in obj, get: obj => obj.setBitmapScaleX }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setBitmapScaleY_decorators, { kind: "method", name: "setBitmapScaleY", static: false, private: false, access: { has: obj => "setBitmapScaleY" in obj, get: obj => obj.setBitmapScaleY }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setBitmapScale_decorators, { kind: "method", name: "setBitmapScale", static: false, private: false, access: { has: obj => "setBitmapScale" in obj, get: obj => obj.setBitmapScale }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _resetBitmapScale_decorators, { kind: "method", name: "resetBitmapScale", static: false, private: false, access: { has: obj => "resetBitmapScale" in obj, get: obj => obj.resetBitmapScale }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _selectSpriteColor_decorators, { kind: "method", name: "selectSpriteColor", static: false, private: false, access: { has: obj => "selectSpriteColor" in obj, get: obj => obj.selectSpriteColor }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _selectSpriteColors_decorators, { kind: "method", name: "selectSpriteColors", static: false, private: false, access: { has: obj => "selectSpriteColors" in obj, get: obj => obj.selectSpriteColors }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setSpriteColor_decorators, { kind: "method", name: "setSpriteColor", static: false, private: false, access: { has: obj => "setSpriteColor" in obj, get: obj => obj.setSpriteColor }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setSpriteColorOpacity_decorators, { kind: "method", name: "setSpriteColorOpacity", static: false, private: false, access: { has: obj => "setSpriteColorOpacity" in obj, get: obj => obj.setSpriteColorOpacity }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _resetSpriteColors_decorators, { kind: "method", name: "resetSpriteColors", static: false, private: false, access: { has: obj => "resetSpriteColors" in obj, get: obj => obj.resetSpriteColors }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setSpriteScaleDirection_decorators, { kind: "method", name: "setSpriteScaleDirection", static: false, private: false, access: { has: obj => "setSpriteScaleDirection" in obj, get: obj => obj.setSpriteScaleDirection }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setSpriteScaleX_decorators, { kind: "method", name: "setSpriteScaleX", static: false, private: false, access: { has: obj => "setSpriteScaleX" in obj, get: obj => obj.setSpriteScaleX }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setSpriteScaleY_decorators, { kind: "method", name: "setSpriteScaleY", static: false, private: false, access: { has: obj => "setSpriteScaleY" in obj, get: obj => obj.setSpriteScaleY }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setSpriteScale_decorators, { kind: "method", name: "setSpriteScale", static: false, private: false, access: { has: obj => "setSpriteScale" in obj, get: obj => obj.setSpriteScale }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _resetSpriteScale_decorators, { kind: "method", name: "resetSpriteScale", static: false, private: false, access: { has: obj => "resetSpriteScale" in obj, get: obj => obj.resetSpriteScale }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setSpritesLineHeight_decorators, { kind: "method", name: "setSpritesLineHeight", static: false, private: false, access: { has: obj => "setSpritesLineHeight" in obj, get: obj => obj.setSpritesLineHeight }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setSpritesDirectionGeneric_decorators, { kind: "method", name: "setSpritesDirectionGeneric", static: false, private: false, access: { has: obj => "setSpritesDirectionGeneric" in obj, get: obj => obj.setSpritesDirectionGeneric }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setSpritesDirection_decorators, { kind: "method", name: "setSpritesDirection", static: false, private: false, access: { has: obj => "setSpritesDirection" in obj, get: obj => obj.setSpritesDirection }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setSpritesLineDirection_decorators, { kind: "method", name: "setSpritesLineDirection", static: false, private: false, access: { has: obj => "setSpritesLineDirection" in obj, get: obj => obj.setSpritesLineDirection }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setSpritesSpacingGeneric_decorators, { kind: "method", name: "setSpritesSpacingGeneric", static: false, private: false, access: { has: obj => "setSpritesSpacingGeneric" in obj, get: obj => obj.setSpritesSpacingGeneric }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setSpritesSpacing_decorators, { kind: "method", name: "setSpritesSpacing", static: false, private: false, access: { has: obj => "setSpritesSpacing" in obj, get: obj => obj.setSpritesSpacing }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setSpritesLineSpacing_decorators, { kind: "method", name: "setSpritesLineSpacing", static: false, private: false, access: { has: obj => "setSpritesLineSpacing" in obj, get: obj => obj.setSpritesLineSpacing }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setSpritesAlignmentGeneric_decorators, { kind: "method", name: "setSpritesAlignmentGeneric", static: false, private: false, access: { has: obj => "setSpritesAlignmentGeneric" in obj, get: obj => obj.setSpritesAlignmentGeneric }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setSpritesAlignment_decorators, { kind: "method", name: "setSpritesAlignment", static: false, private: false, access: { has: obj => "setSpritesAlignment" in obj, get: obj => obj.setSpritesAlignment }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setSpritesLineAlignment_decorators, { kind: "method", name: "setSpritesLineAlignment", static: false, private: false, access: { has: obj => "setSpritesLineAlignment" in obj, get: obj => obj.setSpritesLineAlignment }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _clearRect_decorators, { kind: "method", name: "clearRect", static: false, private: false, access: { has: obj => "clearRect" in obj, get: obj => obj.clearRect }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _drawRect_decorators, { kind: "method", name: "drawRect", static: false, private: false, access: { has: obj => "drawRect" in obj, get: obj => obj.drawRect }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _drawRoundRect_decorators, { kind: "method", name: "drawRoundRect", static: false, private: false, access: { has: obj => "drawRoundRect" in obj, get: obj => obj.drawRoundRect }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _drawCircle_decorators, { kind: "method", name: "drawCircle", static: false, private: false, access: { has: obj => "drawCircle" in obj, get: obj => obj.drawCircle }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _drawEllipse_decorators, { kind: "method", name: "drawEllipse", static: false, private: false, access: { has: obj => "drawEllipse" in obj, get: obj => obj.drawEllipse }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _drawRegularPolygon_decorators, { kind: "method", name: "drawRegularPolygon", static: false, private: false, access: { has: obj => "drawRegularPolygon" in obj, get: obj => obj.drawRegularPolygon }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _drawPolygon_decorators, { kind: "method", name: "drawPolygon", static: false, private: false, access: { has: obj => "drawPolygon" in obj, get: obj => obj.drawPolygon }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _drawWireframe_decorators, { kind: "method", name: "drawWireframe", static: false, private: false, access: { has: obj => "drawWireframe" in obj, get: obj => obj.drawWireframe }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _drawCurve_decorators, { kind: "method", name: "drawCurve", static: false, private: false, access: { has: obj => "drawCurve" in obj, get: obj => obj.drawCurve }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _drawCurves_decorators, { kind: "method", name: "drawCurves", static: false, private: false, access: { has: obj => "drawCurves" in obj, get: obj => obj.drawCurves }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _drawQuadraticBezierCurve_decorators, { kind: "method", name: "drawQuadraticBezierCurve", static: false, private: false, access: { has: obj => "drawQuadraticBezierCurve" in obj, get: obj => obj.drawQuadraticBezierCurve }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _drawQuadraticBezierCurves_decorators, { kind: "method", name: "drawQuadraticBezierCurves", static: false, private: false, access: { has: obj => "drawQuadraticBezierCurves" in obj, get: obj => obj.drawQuadraticBezierCurves }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _drawCubicBezierCurve_decorators, { kind: "method", name: "drawCubicBezierCurve", static: false, private: false, access: { has: obj => "drawCubicBezierCurve" in obj, get: obj => obj.drawCubicBezierCurve }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _drawCubicBezierCurves_decorators, { kind: "method", name: "drawCubicBezierCurves", static: false, private: false, access: { has: obj => "drawCubicBezierCurves" in obj, get: obj => obj.drawCubicBezierCurves }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, __drawPath_decorators, { kind: "method", name: "_drawPath", static: false, private: false, access: { has: obj => "_drawPath" in obj, get: obj => obj._drawPath }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _drawPath_decorators, { kind: "method", name: "drawPath", static: false, private: false, access: { has: obj => "drawPath" in obj, get: obj => obj.drawPath }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _drawClosedPath_decorators, { kind: "method", name: "drawClosedPath", static: false, private: false, access: { has: obj => "drawClosedPath" in obj, get: obj => obj.drawClosedPath }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _drawSegment_decorators, { kind: "method", name: "drawSegment", static: false, private: false, access: { has: obj => "drawSegment" in obj, get: obj => obj.drawSegment }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _drawSegments_decorators, { kind: "method", name: "drawSegments", static: false, private: false, access: { has: obj => "drawSegments" in obj, get: obj => obj.drawSegments }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _drawArc_decorators, { kind: "method", name: "drawArc", static: false, private: false, access: { has: obj => "drawArc" in obj, get: obj => obj.drawArc }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _drawArcEllipse_decorators, { kind: "method", name: "drawArcEllipse", static: false, private: false, access: { has: obj => "drawArcEllipse" in obj, get: obj => obj.drawArcEllipse }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _drawBitmap_decorators, { kind: "method", name: "drawBitmap", static: false, private: false, access: { has: obj => "drawBitmap" in obj, get: obj => obj.drawBitmap }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _uploadSpriteSheet_decorators, { kind: "method", name: "uploadSpriteSheet", static: false, private: false, access: { has: obj => "uploadSpriteSheet" in obj, get: obj => obj.uploadSpriteSheet }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _selectSpriteSheet_decorators, { kind: "method", name: "selectSpriteSheet", static: false, private: false, access: { has: obj => "selectSpriteSheet" in obj, get: obj => obj.selectSpriteSheet }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _drawSprite_decorators, { kind: "method", name: "drawSprite", static: false, private: false, access: { has: obj => "drawSprite" in obj, get: obj => obj.drawSprite }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _drawSprites_decorators, { kind: "method", name: "drawSprites", static: false, private: false, access: { has: obj => "drawSprites" in obj, get: obj => obj.drawSprites }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _drawSpritesString_decorators, { kind: "method", name: "drawSpritesString", static: false, private: false, access: { has: obj => "drawSpritesString" in obj, get: obj => obj.drawSpritesString }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _drawSpriteFromSpriteSheet_decorators, { kind: "method", name: "drawSpriteFromSpriteSheet", static: false, private: false, access: { has: obj => "drawSpriteFromSpriteSheet" in obj, get: obj => obj.drawSpriteFromSpriteSheet }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _selectSpriteSheetPalette_decorators, { kind: "method", name: "selectSpriteSheetPalette", static: false, private: false, access: { has: obj => "selectSpriteSheetPalette" in obj, get: obj => obj.selectSpriteSheetPalette }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _selectSpriteSheetPaletteSwap_decorators, { kind: "method", name: "selectSpriteSheetPaletteSwap", static: false, private: false, access: { has: obj => "selectSpriteSheetPaletteSwap" in obj, get: obj => obj.selectSpriteSheetPaletteSwap }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _selectSpritePaletteSwap_decorators, { kind: "method", name: "selectSpritePaletteSwap", static: false, private: false, access: { has: obj => "selectSpritePaletteSwap" in obj, get: obj => obj.selectSpritePaletteSwap }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _startSprite_decorators, { kind: "method", name: "startSprite", static: false, private: false, access: { has: obj => "startSprite" in obj, get: obj => obj.startSprite }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _endSprite_decorators, { kind: "method", name: "endSprite", static: false, private: false, access: { has: obj => "endSprite" in obj, get: obj => obj.endSprite }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        constructor() {
            autoBind$1(this);
        }
        sendMessage = __runInitializers(this, _instanceExtraInitializers);
        eventDispatcher;
        get #dispatchEvent() {
            return this.eventDispatcher.dispatchEvent;
        }
        get waitForEvent() {
            return this.eventDispatcher.waitForEvent;
        }
        requestRequiredInformation() {
            _console$q.log("requesting required display information");
            const messages = RequiredDisplayMessageTypes.map((messageType) => ({
                type: messageType,
            }));
            this.sendMessage(messages, false);
        }
        #isAvailable = false;
        get isAvailable() {
            return this.#isAvailable;
        }
        #assertDisplayIsAvailable() {
            _console$q.assertWithError(this.#isAvailable, "display is not available");
        }
        #parseIsDisplayAvailable(dataView) {
            const newIsDisplayAvailable = dataView.getUint8(0) == 1;
            this.#isAvailable = newIsDisplayAvailable;
            _console$q.log({ isDisplayAvailable: this.#isAvailable });
            this.#dispatchEvent("isDisplayAvailable", {
                isDisplayAvailable: this.#isAvailable,
            });
        }
        #contextStateHelper = new DisplayContextStateHelper();
        get contextState() {
            return this.#contextStateHelper.state;
        }
        #resetContextState(keepColorIndices, keepSpriteColorIndices) {
            _console$q.log("resetContextState", {
                keepColorIndices,
                keepSpriteColorIndices,
            });
            this.#contextStateHelper.reset(this.numberOfColors, keepColorIndices, keepSpriteColorIndices);
        }
        #onContextStateUpdate(differences) {
            this.#dispatchEvent("displayContextState", {
                displayContextState: structuredClone(this.contextState),
                differences,
            });
        }
        serializeContextState() {
            return this.#contextStateHelper.serialize(this.numberOfColors);
        }
        async setContextState(newState, sendImmediately, displayCanvasHelper) {
            const contextCommands = this.#contextStateHelper.serialize(this.numberOfColors, newState);
            if (contextCommands.length == 0) {
                return;
            }
            await this.runContextCommands(contextCommands, sendImmediately);
        }
        #displayStatus;
        get displayStatus() {
            return this.#displayStatus;
        }
        get isDisplayAwake() {
            return this.#displayStatus == "awake";
        }
        #parseDisplayStatus(dataView) {
            const displayStatusIndex = dataView.getUint8(0);
            const newDisplayStatus = DisplayStatuses[displayStatusIndex];
            this.#updateDisplayStatus(newDisplayStatus);
        }
        #updateDisplayStatus(newDisplayStatus) {
            _console$q.assertEnumWithError(newDisplayStatus, DisplayStatuses);
            if (newDisplayStatus == this.#displayStatus) {
                _console$q.log(`redundant displayStatus ${newDisplayStatus}`);
                return;
            }
            const previousDisplayStatus = this.#displayStatus;
            this.#displayStatus = newDisplayStatus;
            _console$q.log(`updated displayStatus to "${this.displayStatus}"`);
            this.#dispatchEvent("displayStatus", {
                displayStatus: this.displayStatus,
                previousDisplayStatus,
            });
        }
        async #sendDisplayCommand(command, sendImmediately) {
            _console$q.assertEnumWithError(command, DisplayCommands);
            _console$q.log(`sending display command "${command}"`);
            const promise = this.waitForEvent("displayStatus");
            _console$q.log(`setting command "${command}"`);
            const commandEnum = DisplayCommands.indexOf(command);
            this.sendMessage([
                {
                    type: "displayCommand",
                    data: UInt8ByteBuffer(commandEnum),
                },
            ], sendImmediately);
            await promise;
        }
        #assertIsAwake() {
            _console$q.assertWithError(this.#displayStatus == "awake", `display is not awake - currently ${this.#displayStatus}`);
        }
        #assertIsNotAwake() {
            _console$q.assertWithError(this.#displayStatus != "awake", `display is awake`);
        }
        async wake() {
            this.#assertIsNotAwake();
            await this.#sendDisplayCommand("wake");
        }
        async sleep() {
            this.#assertIsAwake();
            await this.#sendDisplayCommand("sleep");
        }
        async toggle() {
            switch (this.displayStatus) {
                case "asleep":
                    this.wake();
                    break;
                case "awake":
                    this.sleep();
                    break;
            }
        }
        get numberOfColors() {
            return 2 ** Number(this.pixelDepth ?? 0);
        }
        #displayInformation;
        get displayInformation() {
            return this.#displayInformation;
        }
        get pixelDepth() {
            return this.#displayInformation?.pixelDepth;
        }
        get width() {
            return this.#displayInformation?.width;
        }
        get height() {
            return this.#displayInformation?.width;
        }
        get size() {
            return {
                width: this.width,
                height: this.height,
            };
        }
        get type() {
            return this.#displayInformation?.type;
        }
        #parseDisplayInformation(dataView) {
            const parsedDisplayInformation = {};
            let byteOffset = 0;
            while (byteOffset < dataView.byteLength) {
                const displayInformationTypeIndex = dataView.getUint8(byteOffset++);
                const displayInformationType = DisplayInformationTypes[displayInformationTypeIndex];
                _console$q.assertWithError(displayInformationType, `invalid displayInformationTypeIndex ${displayInformationType}`);
                _console$q.log({ displayInformationType });
                switch (displayInformationType) {
                    case "width":
                    case "height":
                        {
                            const value = dataView.getUint16(byteOffset, true);
                            parsedDisplayInformation[displayInformationType] = value;
                            byteOffset += 2;
                        }
                        break;
                    case "pixelDepth":
                    case "type":
                        {
                            const values = DisplayInformationValues[displayInformationType];
                            let rawValue = dataView.getUint8(byteOffset++);
                            const value = values[rawValue];
                            _console$q.assertEnumWithError(value, values);
                            parsedDisplayInformation[displayInformationType] = value;
                        }
                        break;
                }
            }
            _console$q.log({ parsedDisplayInformation });
            const missingDisplayInformationType = DisplayInformationTypes.find((type) => !(type in parsedDisplayInformation));
            _console$q.assertWithError(!missingDisplayInformationType, `missingDisplayInformationType ${missingDisplayInformationType}`);
            this.#displayInformation = parsedDisplayInformation;
            this.#colors = new Array(this.numberOfColors).fill("#000000");
            this.#opacities = new Array(this.numberOfColors).fill(1);
            this.contextState.bitmapColorIndices = new Array(this.numberOfColors).fill(0);
            this.contextState.spriteColorIndices = new Array(this.numberOfColors).fill(0);
            this.#dispatchEvent("displayInformation", {
                displayInformation: this.#displayInformation,
            });
        }
        #brightness;
        get brightness() {
            return this.#brightness;
        }
        #parseDisplayBrightness(dataView) {
            const newDisplayBrightnessEnum = dataView.getUint8(0);
            const newDisplayBrightness = DisplayBrightnesses[newDisplayBrightnessEnum];
            assertValidDisplayBrightness(newDisplayBrightness);
            this.#brightness = newDisplayBrightness;
            _console$q.log({ displayBrightness: this.#brightness });
            this.#dispatchEvent("getDisplayBrightness", {
                displayBrightness: this.#brightness,
            });
        }
        async setBrightness(newDisplayBrightness, sendImmediately, displayCanvasHelper) {
            this.#assertDisplayIsAvailable();
            assertValidDisplayBrightness(newDisplayBrightness);
            if (this.brightness == newDisplayBrightness) {
                _console$q.log(`redundant displayBrightness ${newDisplayBrightness}`);
                return;
            }
            const newDisplayBrightnessEnum = DisplayBrightnesses.indexOf(newDisplayBrightness);
            const newDisplayBrightnessData = UInt8ByteBuffer(newDisplayBrightnessEnum);
            const promise = this.waitForEvent("getDisplayBrightness");
            this.sendMessage([{ type: "setDisplayBrightness", data: newDisplayBrightnessData }], sendImmediately);
            await promise;
        }
        get #maxCommandDataLength() {
            return this.mtu - 7;
        }
        #contextCommandBuffers = [];
        #contextCommands = [];
        async #sendContextCommand(contextCommand, sendImmediately, isSending) {
            _console$q.log("sendContextCommand", contextCommand, {
                sendImmediately,
                isSending,
            });
            if (!isSending) {
                const serializedContextCommand = serializeDisplayContextCommand(this, contextCommand);
                if (!serializedContextCommand) {
                    return;
                }
                if (serializedContextCommand.byteLength > this.#maxCommandDataLength) {
                    _console$q.error(`serializedContextCommand ${serializedContextCommand.byteLength} too large (max ${this.#maxCommandDataLength})`);
                    return;
                }
                const newLength = this.#contextCommandBuffers.reduce((sum, buffer) => sum + buffer.byteLength, serializedContextCommand.byteLength);
                if (newLength > this.#maxCommandDataLength) {
                    _console$q.log("displayContextCommandBuffers too full - sending now");
                    await this.#sendContextCommands();
                }
                this.#contextCommandBuffers.push(serializedContextCommand);
            }
            this.#contextCommands.push(contextCommand);
            if (sendImmediately) {
                await this.#sendContextCommands();
            }
        }
        async #sendContextCommands() {
            const displayContextCommands = this.#contextCommands.slice();
            _console$q.log("sendContextCommands", { displayContextCommands });
            if (displayContextCommands.length == 0) {
                return;
            }
            this.#contextCommands.length = 0;
            if (this.#contextCommandBuffers.length > 0) {
                const data = concatenateArrayBuffers(this.#contextCommandBuffers);
                _console$q.log(`sending displayContextCommands`, this.#contextCommandBuffers.slice(), data);
                this.#contextCommandBuffers.length = 0;
                await this.sendMessage([{ type: "displayContextCommands", data }], true);
            }
            this.#dispatchEvent("displayContextCommands", {
                displayContextCommands,
            });
        }
        async flushContextCommands() {
            await this.#sendContextCommands();
        }
        async show(sendImmediately = true, waitUntilReady = false, isSending, displayCanvasHelper) {
            _console$q.log("showDisplay", { sendImmediately, waitUntilReady, isSending });
            let promise;
            if (waitUntilReady) {
                promise = this.waitForEvent("displayReady");
            }
            this.#isReady = false;
            this.#lastShowRequestTime = Date.now();
            await this.#sendContextCommand({ type: "show" }, sendImmediately, isSending);
            if (isSending) {
                this.#isReady = true;
            }
            else if (waitUntilReady) {
                await promise;
            }
        }
        async clear(sendImmediately = true, waitUntilReady = false, isSending, displayCanvasHelper) {
            _console$q.log("clearDisplay", {
                sendImmediately,
                waitUntilReady,
                isSending,
            });
            let promise;
            if (waitUntilReady) {
                promise = this.waitForEvent("displayReady");
            }
            this.#isReady = false;
            this.#lastShowRequestTime = Date.now();
            await this.#sendContextCommand({ type: "clear" }, sendImmediately, isSending);
            if (isSending) {
                this.#isReady = true;
            }
            else if (waitUntilReady) {
                await promise;
            }
        }
        assertValidColorIndex(colorIndex) {
            _console$q.assertRangeWithError("colorIndex", colorIndex, 0, this.numberOfColors);
        }
        #colors = [];
        get colors() {
            return this.#colors;
        }
        async setColor(colorIndex, color, sendImmediately, isSending, displayCanvasHelper) {
            if (typeof color == "string") {
                color = stringToRGB(color);
            }
            else {
                color = color;
            }
            const colorHex = rgbToHex(color);
            if (this.colors[colorIndex] == colorHex) {
                return;
            }
            await this.#sendContextCommand({ type: "setColor", color, colorIndex }, sendImmediately, isSending);
            this.colors[colorIndex] = colorHex;
            this.#dispatchEvent("displayColor", {
                colorIndex,
                color,
                colorHex,
            });
        }
        serializeColors() {
            return serializeColors(this);
        }
        #opacities = [];
        get opacities() {
            return this.#opacities;
        }
        serializeOpacities() {
            return serializeOpacities(this);
        }
        async setColorOpacity(colorIndex, opacity, sendImmediately, isSending, displayCanvasHelper) {
            if (Math.floor(255 * this.#opacities[colorIndex]) == Math.floor(255 * opacity)) {
                return;
            }
            await this.#sendContextCommand({ type: "setColorOpacity", colorIndex, opacity }, sendImmediately, isSending);
            this.#opacities[colorIndex] = opacity;
            this.#dispatchEvent("displayColorOpacity", { colorIndex, opacity });
        }
        async setOpacity(opacity, sendImmediately, isSending, displayCanvasHelper) {
            if (this.opacities.every((_opacity) => opacity == _opacity)) {
                return;
            }
            await this.#sendContextCommand({ type: "setOpacity", opacity }, sendImmediately, isSending);
            this.#opacities.fill(opacity);
            this.#dispatchEvent("displayOpacity", { opacity });
        }
        #contextStack = [];
        async #saveContext(sendImmediately) {
            this.#contextStack.push(structuredClone(this.contextState));
        }
        async saveContext(sendImmediately, isSending, displayCanvasHelper) {
            {
                await this.#saveContext(sendImmediately);
            }
        }
        async #restoreContext(sendImmediately) {
            const contextState = this.#contextStack.pop();
            if (!contextState) {
                _console$q.warn("#contextStack empty");
                return;
            }
            await this.setContextState(contextState, sendImmediately);
        }
        async restoreContext(sendImmediately, isSending, displayCanvasHelper) {
            {
                await this.#sendContextCommand({ type: "restoreContext" }, sendImmediately, isSending);
            }
        }
        async #clearContext(sendImmediately) {
            const contextState = this.#contextStack.pop();
            if (!contextState) {
                _console$q.warn("#contextStack empty");
                return;
            }
            await this.setContextState(contextState, sendImmediately);
        }
        async clearContext(sendImmediately, isSending, displayCanvasHelper) {
            await this.#clearContext(sendImmediately);
            await this.#sendContextCommand({ type: "clearContext" }, sendImmediately, isSending);
        }
        async selectFillColor(fillColorIndex, sendImmediately, isSending, displayCanvasHelper) {
            this.assertValidColorIndex(fillColorIndex);
            const differences = this.#contextStateHelper.update({
                fillColorIndex,
            });
            if (differences.length == 0) {
                return;
            }
            await this.#sendContextCommand({ type: "selectFillColor", fillColorIndex }, sendImmediately, isSending);
            this.#onContextStateUpdate(differences);
        }
        async selectBackgroundColor(backgroundColorIndex, sendImmediately, isSending, displayCanvasHelper) {
            this.assertValidColorIndex(backgroundColorIndex);
            const differences = this.#contextStateHelper.update({
                backgroundColorIndex,
            });
            if (differences.length == 0) {
                return;
            }
            await this.#sendContextCommand({ type: "selectBackgroundColor", backgroundColorIndex }, sendImmediately, isSending);
            this.#onContextStateUpdate(differences);
        }
        async selectLineColor(lineColorIndex, sendImmediately, isSending, displayCanvasHelper) {
            this.assertValidColorIndex(lineColorIndex);
            const differences = this.#contextStateHelper.update({
                lineColorIndex,
            });
            if (differences.length == 0) {
                return;
            }
            await this.#sendContextCommand({ type: "selectLineColor", lineColorIndex }, sendImmediately, isSending);
            this.#onContextStateUpdate(differences);
        }
        async setIgnoreFill(ignoreFill, sendImmediately, isSending, displayCanvasHelper) {
            const differences = this.#contextStateHelper.update({
                ignoreFill,
            });
            if (differences.length == 0) {
                return;
            }
            await this.#sendContextCommand({ type: "setIgnoreFill", ignoreFill }, sendImmediately, isSending);
            this.#onContextStateUpdate(differences);
        }
        async setIgnoreLine(ignoreLine, sendImmediately, isSending, displayCanvasHelper) {
            const differences = this.#contextStateHelper.update({
                ignoreLine,
            });
            if (differences.length == 0) {
                return;
            }
            await this.#sendContextCommand({ type: "setIgnoreLine", ignoreLine }, sendImmediately, isSending);
            this.#onContextStateUpdate(differences);
        }
        async setFillBackground(fillBackground, sendImmediately, isSending, displayCanvasHelper) {
            const differences = this.#contextStateHelper.update({
                fillBackground,
            });
            if (differences.length == 0) {
                return;
            }
            await this.#sendContextCommand({ type: "setFillBackground", fillBackground }, sendImmediately, isSending);
            this.#onContextStateUpdate(differences);
        }
        assertValidLineWidth(lineWidth) {
            _console$q.assertRangeWithError("lineWidth", lineWidth, 0, Math.max(this.width, this.height));
        }
        async setLineWidth(lineWidth, sendImmediately, isSending, displayCanvasHelper) {
            this.assertValidLineWidth(lineWidth);
            const differences = this.#contextStateHelper.update({
                lineWidth,
            });
            if (differences.length == 0) {
                return;
            }
            await this.#sendContextCommand({ type: "setLineWidth", lineWidth }, sendImmediately, isSending);
            this.#onContextStateUpdate(differences);
        }
        async setAlignment(alignmentDirection, alignment, sendImmediately, isSending, displayCanvasHelper) {
            assertValidAlignmentDirection(alignmentDirection);
            const alignmentCommand = DisplayAlignmentDirectionToCommandType[alignmentDirection];
            const alignmentKey = DisplayAlignmentDirectionToStateKey[alignmentDirection];
            const differences = this.#contextStateHelper.update({
                [alignmentKey]: alignment,
            });
            _console$q.log({ alignmentKey, alignment, differences });
            if (differences.length == 0) {
                return;
            }
            await this.#sendContextCommand(
            { type: alignmentCommand, [alignmentKey]: alignment }, sendImmediately, isSending);
            this.#onContextStateUpdate(differences);
        }
        async setHorizontalAlignment(horizontalAlignment, sendImmediately, isSending, displayCanvasHelper) {
            await this.setAlignment("horizontal", horizontalAlignment, sendImmediately, isSending);
        }
        async setVerticalAlignment(verticalAlignment, sendImmediately, isSending, displayCanvasHelper) {
            await this.setAlignment("vertical", verticalAlignment, sendImmediately, isSending);
        }
        async resetAlignment(sendImmediately, isSending, displayCanvasHelper) {
            const differences = this.#contextStateHelper.update({
                verticalAlignment: DefaultDisplayContextState.verticalAlignment,
                horizontalAlignment: DefaultDisplayContextState.horizontalAlignment,
            });
            if (differences.length == 0) {
                return;
            }
            await this.#sendContextCommand({ type: "resetAlignment" }, sendImmediately, isSending);
            this.#onContextStateUpdate(differences);
        }
        async setRotation(rotation, isRadians, sendImmediately, isSending, displayCanvasHelper) {
            rotation = isRadians ? rotation : degToRad(rotation);
            rotation = normalizeRadians(rotation);
            isRadians = true;
            const differences = this.#contextStateHelper.update({
                rotation,
            });
            if (differences.length == 0) {
                return;
            }
            await this.#sendContextCommand({ type: "setRotation", rotation, isRadians }, sendImmediately, isSending);
            this.#onContextStateUpdate(differences);
        }
        async clearRotation(sendImmediately, isSending, displayCanvasHelper) {
            const differences = this.#contextStateHelper.update({
                rotation: 0,
            });
            if (differences.length == 0) {
                return;
            }
            await this.#sendContextCommand({ type: "clearRotation" }, sendImmediately, isSending);
            this.#onContextStateUpdate(differences);
        }
        async setSegmentStartCap(segmentStartCap, sendImmediately, isSending, displayCanvasHelper) {
            assertValidSegmentCap(segmentStartCap);
            const differences = this.#contextStateHelper.update({
                segmentStartCap,
            });
            if (differences.length == 0) {
                return;
            }
            await this.#sendContextCommand({ type: "setSegmentStartCap", segmentStartCap }, sendImmediately, isSending);
            this.#onContextStateUpdate(differences);
        }
        async setSegmentEndCap(segmentEndCap, sendImmediately, isSending, displayCanvasHelper) {
            assertValidSegmentCap(segmentEndCap);
            const differences = this.#contextStateHelper.update({
                segmentEndCap,
            });
            if (differences.length == 0) {
                return;
            }
            await this.#sendContextCommand({ type: "setSegmentEndCap", segmentEndCap }, sendImmediately, isSending);
            this.#onContextStateUpdate(differences);
        }
        async setSegmentCap(segmentCap, sendImmediately, isSending, displayCanvasHelper) {
            assertValidSegmentCap(segmentCap);
            const differences = this.#contextStateHelper.update({
                segmentStartCap: segmentCap,
                segmentEndCap: segmentCap,
            });
            if (differences.length == 0) {
                return;
            }
            await this.#sendContextCommand({ type: "setSegmentCap", segmentCap }, sendImmediately, isSending);
            this.#onContextStateUpdate(differences);
        }
        async setSegmentStartRadius(segmentStartRadius, sendImmediately, isSending, displayCanvasHelper) {
            const differences = this.#contextStateHelper.update({
                segmentStartRadius,
            });
            if (differences.length == 0) {
                return;
            }
            await this.#sendContextCommand({ type: "setSegmentStartRadius", segmentStartRadius }, sendImmediately, isSending);
            this.#onContextStateUpdate(differences);
        }
        async setSegmentEndRadius(segmentEndRadius, sendImmediately, isSending, displayCanvasHelper) {
            const differences = this.#contextStateHelper.update({
                segmentEndRadius,
            });
            if (differences.length == 0) {
                return;
            }
            await this.#sendContextCommand({ type: "setSegmentEndRadius", segmentEndRadius }, sendImmediately, isSending);
            this.#onContextStateUpdate(differences);
        }
        async setSegmentRadius(segmentRadius, sendImmediately, isSending, displayCanvasHelper) {
            const differences = this.#contextStateHelper.update({
                segmentStartRadius: segmentRadius,
                segmentEndRadius: segmentRadius,
            });
            if (differences.length == 0) {
                return;
            }
            await this.#sendContextCommand({ type: "setSegmentRadius", segmentRadius }, sendImmediately, isSending);
            this.#onContextStateUpdate(differences);
        }
        async setCrop(cropDirection, crop, sendImmediately, isSending, displayCanvasHelper) {
            _console$q.assertEnumWithError(cropDirection, DisplayCropDirections);
            crop = Math.max(0, crop);
            const cropCommand = DisplayCropDirectionToCommandType[cropDirection];
            const cropKey = DisplayCropDirectionToStateKey[cropDirection];
            const differences = this.#contextStateHelper.update({
                [cropKey]: crop,
            });
            if (differences.length == 0) {
                return;
            }
            await this.#sendContextCommand(
            { type: cropCommand, [cropKey]: crop }, sendImmediately, isSending);
            this.#onContextStateUpdate(differences);
        }
        async setCropTop(cropTop, sendImmediately, isSending, displayCanvasHelper) {
            await this.setCrop("top", cropTop, sendImmediately, isSending);
        }
        async setCropRight(cropRight, sendImmediately, isSending, displayCanvasHelper) {
            await this.setCrop("right", cropRight, sendImmediately, isSending);
        }
        async setCropBottom(cropBottom, sendImmediately, isSending, displayCanvasHelper) {
            await this.setCrop("bottom", cropBottom, sendImmediately, isSending);
        }
        async setCropLeft(cropLeft, sendImmediately, isSending, displayCanvasHelper) {
            await this.setCrop("left", cropLeft, sendImmediately, isSending);
        }
        async clearCrop(sendImmediately, isSending, displayCanvasHelper) {
            const differences = this.#contextStateHelper.update({
                cropTop: 0,
                cropRight: 0,
                cropBottom: 0,
                cropLeft: 0,
            });
            if (differences.length == 0) {
                return;
            }
            await this.#sendContextCommand({ type: "clearCrop" }, sendImmediately, isSending);
            this.#onContextStateUpdate(differences);
        }
        async setRotationCrop(cropDirection, crop, sendImmediately, isSending, displayCanvasHelper) {
            _console$q.assertEnumWithError(cropDirection, DisplayCropDirections);
            const cropCommand = DisplayRotationCropDirectionToCommandType[cropDirection];
            const cropKey = DisplayRotationCropDirectionToStateKey[cropDirection];
            const differences = this.#contextStateHelper.update({
                [cropKey]: crop,
            });
            if (differences.length == 0) {
                return;
            }
            await this.#sendContextCommand(
            { type: cropCommand, [cropKey]: crop }, sendImmediately, isSending);
            this.#onContextStateUpdate(differences);
        }
        async setRotationCropTop(rotationCropTop, sendImmediately, isSending, displayCanvasHelper) {
            await this.setRotationCrop("top", rotationCropTop, sendImmediately, isSending);
        }
        async setRotationCropRight(rotationCropRight, sendImmediately, isSending, displayCanvasHelper) {
            await this.setRotationCrop("right", rotationCropRight, sendImmediately, isSending);
        }
        async setRotationCropBottom(rotationCropBottom, sendImmediately, isSending, displayCanvasHelper) {
            await this.setRotationCrop("bottom", rotationCropBottom, sendImmediately, isSending);
        }
        async setRotationCropLeft(rotationCropLeft, sendImmediately, isSending, displayCanvasHelper) {
            await this.setRotationCrop("left", rotationCropLeft, sendImmediately, isSending);
        }
        async clearRotationCrop(sendImmediately, isSending, displayCanvasHelper) {
            const differences = this.#contextStateHelper.update({
                rotationCropTop: 0,
                rotationCropRight: 0,
                rotationCropBottom: 0,
                rotationCropLeft: 0,
            });
            if (differences.length == 0) {
                return;
            }
            await this.#sendContextCommand({ type: "clearRotationCrop" }, sendImmediately, isSending);
            this.#onContextStateUpdate(differences);
        }
        async selectBitmapColor(bitmapColorIndex, colorIndex, sendImmediately, isSending, displayCanvasHelper) {
            this.assertValidColorIndex(bitmapColorIndex);
            this.assertValidColorIndex(colorIndex);
            const bitmapColorIndices = this.contextState.bitmapColorIndices.slice();
            bitmapColorIndices[bitmapColorIndex] = colorIndex;
            const differences = this.#contextStateHelper.update({
                bitmapColorIndices,
            });
            if (differences.length == 0) {
                return;
            }
            await this.#sendContextCommand({ type: "selectBitmapColor", bitmapColorIndex, colorIndex }, sendImmediately, isSending);
            this.#onContextStateUpdate(differences);
        }
        get bitmapColorIndices() {
            return this.contextState.bitmapColorIndices;
        }
        get bitmapColors() {
            return this.bitmapColorIndices.map((colorIndex) => this.colors[colorIndex]);
        }
        async selectBitmapColors(bitmapColorPairs, sendImmediately, isSending, displayCanvasHelper) {
            _console$q.assertRangeWithError("bitmapColors", bitmapColorPairs.length, 1, this.numberOfColors);
            const bitmapColorIndices = this.contextState.bitmapColorIndices.slice();
            bitmapColorPairs.forEach(({ bitmapColorIndex, colorIndex }) => {
                this.assertValidColorIndex(bitmapColorIndex);
                this.assertValidColorIndex(colorIndex);
                bitmapColorIndices[bitmapColorIndex] = colorIndex;
            });
            const differences = this.#contextStateHelper.update({
                bitmapColorIndices,
            });
            if (differences.length == 0) {
                return;
            }
            await this.#sendContextCommand({ type: "selectBitmapColors", bitmapColorPairs }, sendImmediately, isSending);
            this.#onContextStateUpdate(differences);
        }
        async setBitmapColor(bitmapColorIndex, color, sendImmediately, isSending, displayCanvasHelper) {
            return this.setColor(this.bitmapColorIndices[bitmapColorIndex], color, sendImmediately, isSending);
        }
        async setBitmapColorOpacity(bitmapColorIndex, opacity, sendImmediately, isSending, displayCanvasHelper) {
            return this.setColorOpacity(this.bitmapColorIndices[bitmapColorIndex], opacity, sendImmediately, isSending);
        }
        async setBitmapScaleDirection(direction, bitmapScale, sendImmediately, isSending, displayCanvasHelper) {
            bitmapScale = clamp(bitmapScale, minDisplayScale, maxDisplayScale);
            bitmapScale = roundScale(bitmapScale);
            const commandType = DisplayBitmapScaleDirectionToCommandType[direction];
            _console$q.log({ [commandType]: bitmapScale });
            const newState = {};
            let command;
            switch (direction) {
                case "all":
                    newState.bitmapScaleX = bitmapScale;
                    newState.bitmapScaleY = bitmapScale;
                    command = { type: "setBitmapScale", bitmapScale };
                    break;
                case "x":
                    newState.bitmapScaleX = bitmapScale;
                    command = { type: "setBitmapScaleX", bitmapScaleX: bitmapScale };
                    break;
                case "y":
                    newState.bitmapScaleY = bitmapScale;
                    command = { type: "setBitmapScaleY", bitmapScaleY: bitmapScale };
                    break;
            }
            const differences = this.#contextStateHelper.update(newState);
            if (differences.length == 0) {
                return;
            }
            const dataView = serializeDisplayContextCommandData(this, command);
            if (!dataView) {
                return;
            }
            await this.#sendContextCommand(command, sendImmediately, isSending);
            this.#onContextStateUpdate(differences);
        }
        async setBitmapScaleX(bitmapScaleX, sendImmediately, isSending, displayCanvasHelper) {
            return this.setBitmapScaleDirection("x", bitmapScaleX, sendImmediately, isSending);
        }
        async setBitmapScaleY(bitmapScaleY, sendImmediately, isSending, displayCanvasHelper) {
            return this.setBitmapScaleDirection("y", bitmapScaleY, sendImmediately, isSending);
        }
        async setBitmapScale(bitmapScale, sendImmediately, isSending, displayCanvasHelper) {
            return this.setBitmapScaleDirection("all", bitmapScale, sendImmediately, isSending);
        }
        async resetBitmapScale(sendImmediately, isSending, displayCanvasHelper) {
            const differences = this.#contextStateHelper.update({
                bitmapScaleX: 1,
                bitmapScaleY: 1,
            });
            if (differences.length == 0) {
                return;
            }
            await this.#sendContextCommand({ type: "resetBitmapScale" }, sendImmediately, isSending);
            this.#onContextStateUpdate(differences);
        }
        async selectSpriteColor(spriteColorIndex, colorIndex, sendImmediately, isSending, displayCanvasHelper) {
            this.assertValidColorIndex(spriteColorIndex);
            this.assertValidColorIndex(colorIndex);
            const spriteColorIndices = this.contextState.spriteColorIndices.slice();
            spriteColorIndices[spriteColorIndex] = colorIndex;
            const differences = this.#contextStateHelper.update({
                spriteColorIndices,
            });
            if (differences.length == 0) {
                return;
            }
            await this.#sendContextCommand({ type: "selectSpriteColor", spriteColorIndex, colorIndex }, sendImmediately, isSending);
            this.#onContextStateUpdate(differences);
        }
        get spriteColorIndices() {
            return this.contextState.spriteColorIndices;
        }
        get spriteColors() {
            return this.spriteColorIndices.map((colorIndex) => this.colors[colorIndex]);
        }
        async selectSpriteColors(spriteColorPairs, sendImmediately, isSending, displayCanvasHelper) {
            _console$q.assertRangeWithError("spriteColors", spriteColorPairs.length, 1, this.numberOfColors);
            const spriteColorIndices = this.contextState.spriteColorIndices.slice();
            spriteColorPairs.forEach(({ spriteColorIndex, colorIndex }) => {
                this.assertValidColorIndex(spriteColorIndex);
                this.assertValidColorIndex(colorIndex);
                spriteColorIndices[spriteColorIndex] = colorIndex;
            });
            const differences = this.#contextStateHelper.update({
                spriteColorIndices,
            });
            if (differences.length == 0) {
                return;
            }
            await this.#sendContextCommand({ type: "selectSpriteColors", spriteColorPairs }, sendImmediately, isSending);
            this.#onContextStateUpdate(differences);
        }
        async setSpriteColor(spriteColorIndex, color, sendImmediately, isSending, displayCanvasHelper) {
            return this.setColor(this.spriteColorIndices[spriteColorIndex], color, sendImmediately, isSending);
        }
        async setSpriteColorOpacity(spriteColorIndex, opacity, sendImmediately, isSending, displayCanvasHelper) {
            return this.setColorOpacity(this.spriteColorIndices[spriteColorIndex], opacity, sendImmediately, isSending);
        }
        async resetSpriteColors(sendImmediately, isSending, displayCanvasHelper) {
            const spriteColorIndices = new Array(this.numberOfColors).fill(0);
            const differences = this.#contextStateHelper.update({
                spriteColorIndices,
            });
            if (differences.length == 0) {
                return;
            }
            await this.#sendContextCommand({ type: "resetSpriteColors" }, sendImmediately, isSending);
            this.#onContextStateUpdate(differences);
        }
        async setSpriteScaleDirection(direction, spriteScale, sendImmediately, isSending, displayCanvasHelper) {
            spriteScale = clamp(spriteScale, minDisplayScale, maxDisplayScale);
            spriteScale = roundScale(spriteScale);
            _console$q.log({ direction, spriteScale });
            const newState = {};
            let command;
            switch (direction) {
                case "all":
                    newState.spriteScaleX = spriteScale;
                    newState.spriteScaleY = spriteScale;
                    command = { type: "setSpriteScale", spriteScale };
                    break;
                case "x":
                    newState.spriteScaleX = spriteScale;
                    command = { type: "setSpriteScaleX", spriteScaleX: spriteScale };
                    break;
                case "y":
                    newState.spriteScaleY = spriteScale;
                    command = { type: "setSpriteScaleY", spriteScaleY: spriteScale };
                    break;
            }
            const differences = this.#contextStateHelper.update(newState);
            if (differences.length == 0) {
                return;
            }
            const dataView = serializeDisplayContextCommandData(this, command);
            if (!dataView) {
                return;
            }
            await this.#sendContextCommand(command, sendImmediately, isSending);
            this.#onContextStateUpdate(differences);
        }
        async setSpriteScaleX(spriteScaleX, sendImmediately, isSending, displayCanvasHelper) {
            return this.setSpriteScaleDirection("x", spriteScaleX, sendImmediately, isSending);
        }
        async setSpriteScaleY(spriteScaleY, sendImmediately, isSending, displayCanvasHelper) {
            return this.setSpriteScaleDirection("y", spriteScaleY, sendImmediately, isSending);
        }
        async setSpriteScale(spriteScale, sendImmediately, isSending, displayCanvasHelper) {
            return this.setSpriteScaleDirection("all", spriteScale, sendImmediately, isSending);
        }
        async resetSpriteScale(sendImmediately, isSending, displayCanvasHelper) {
            const differences = this.#contextStateHelper.update({
                spriteScaleX: 1,
                spriteScaleY: 1,
            });
            if (differences.length == 0) {
                return;
            }
            await this.#sendContextCommand({ type: "resetSpriteScale" }, sendImmediately, isSending);
            this.#onContextStateUpdate(differences);
        }
        async setSpritesLineHeight(spritesLineHeight, sendImmediately, isSending, displayCanvasHelper) {
            spritesLineHeight = Math.round(spritesLineHeight);
            this.assertValidLineWidth(spritesLineHeight);
            const differences = this.#contextStateHelper.update({
                spritesLineHeight,
            });
            if (differences.length == 0) {
                return;
            }
            await this.#sendContextCommand({ type: "setSpritesLineHeight", spritesLineHeight }, sendImmediately, isSending);
            this.#onContextStateUpdate(differences);
        }
        async setSpritesDirectionGeneric(direction, isOrthogonal, sendImmediately, isSending, displayCanvasHelper) {
            assertValidDirection(direction);
            const stateKey = isOrthogonal
                ? "spritesLineDirection"
                : "spritesDirection";
            const commandType = isOrthogonal
                ? "setSpritesLineDirection"
                : "setSpritesDirection";
            const differences = this.#contextStateHelper.update({
                [stateKey]: direction,
            });
            if (differences.length == 0) {
                return;
            }
            await this.#sendContextCommand(
            { type: commandType, [stateKey]: direction }, sendImmediately, isSending);
            this.#onContextStateUpdate(differences);
        }
        async setSpritesDirection(spritesDirection, sendImmediately, isSending, displayCanvasHelper) {
            await this.setSpritesDirectionGeneric(spritesDirection, false, sendImmediately, isSending);
        }
        async setSpritesLineDirection(spritesLineDirection, sendImmediately, isSending, displayCanvasHelper) {
            await this.setSpritesDirectionGeneric(spritesLineDirection, true, sendImmediately, isSending);
        }
        async setSpritesSpacingGeneric(spacing, isOrthogonal, sendImmediately, isSending, displayCanvasHelper) {
            const stateKey = isOrthogonal
                ? "spritesLineSpacing"
                : "spritesSpacing";
            const commandType = isOrthogonal
                ? "setSpritesLineSpacing"
                : "setSpritesSpacing";
            const differences = this.#contextStateHelper.update({
                [stateKey]: spacing,
            });
            if (differences.length == 0) {
                return;
            }
            await this.#sendContextCommand(
            { type: commandType, [stateKey]: spacing }, sendImmediately, isSending);
            this.#onContextStateUpdate(differences);
        }
        async setSpritesSpacing(spritesSpacing, sendImmediately, isSending, displayCanvasHelper) {
            await this.setSpritesSpacingGeneric(spritesSpacing, false, sendImmediately, isSending);
        }
        async setSpritesLineSpacing(spritesSpacing, sendImmediately, isSending, displayCanvasHelper) {
            await this.setSpritesSpacingGeneric(spritesSpacing, true, sendImmediately, isSending);
        }
        async setSpritesAlignmentGeneric(alignment, isOrthogonal, sendImmediately, isSending, displayCanvasHelper) {
            assertValidAlignment(alignment);
            const stateKey = isOrthogonal
                ? "spritesLineAlignment"
                : "spritesAlignment";
            const commandType = isOrthogonal
                ? "setSpritesLineAlignment"
                : "setSpritesAlignment";
            const differences = this.#contextStateHelper.update({
                [stateKey]: alignment,
            });
            if (differences.length == 0) {
                return;
            }
            await this.#sendContextCommand(
            {
                type: commandType,
                [stateKey]: alignment,
            }, sendImmediately, isSending);
            this.#onContextStateUpdate(differences);
        }
        async setSpritesAlignment(spritesAlignment, sendImmediately, isSending, displayCanvasHelper) {
            await this.setSpritesAlignmentGeneric(spritesAlignment, false, sendImmediately, isSending);
        }
        async setSpritesLineAlignment(spritesLineAlignment, sendImmediately, isSending, displayCanvasHelper) {
            await this.setSpritesAlignmentGeneric(spritesLineAlignment, true, sendImmediately, isSending);
        }
        async clearRect(x, y, width, height, sendImmediately, isSending, displayCanvasHelper) {
            await this.#sendContextCommand({
                type: "clearRect",
                x,
                y,
                width,
                height,
            }, sendImmediately, isSending);
        }
        async drawRect(offsetX, offsetY, width, height, sendImmediately, isSending, displayCanvasHelper) {
            await this.#sendContextCommand({
                type: "drawRect",
                offsetX,
                offsetY,
                width,
                height,
            }, sendImmediately, isSending);
        }
        async drawRoundRect(offsetX, offsetY, width, height, borderRadius, sendImmediately, isSending, displayCanvasHelper) {
            await this.#sendContextCommand({
                type: "drawRoundRect",
                offsetX,
                offsetY,
                width,
                height,
                borderRadius,
            }, sendImmediately, isSending);
        }
        async drawCircle(offsetX, offsetY, radius, sendImmediately, isSending, displayCanvasHelper) {
            await this.#sendContextCommand({
                type: "drawCircle",
                offsetX,
                offsetY,
                radius,
            }, sendImmediately, isSending);
        }
        async drawEllipse(offsetX, offsetY, radiusX, radiusY, sendImmediately, isSending, displayCanvasHelper) {
            await this.#sendContextCommand({
                type: "drawEllipse",
                offsetX,
                offsetY,
                radiusX,
                radiusY,
            }, sendImmediately, isSending);
        }
        async drawRegularPolygon(offsetX, offsetY, radius, numberOfSides, sendImmediately, isSending, displayCanvasHelper) {
            await this.#sendContextCommand({
                type: "drawRegularPolygon",
                offsetX,
                offsetY,
                radius,
                numberOfSides,
            }, sendImmediately, isSending);
        }
        async drawPolygon(points, sendImmediately, isSending, displayCanvasHelper) {
            _console$q.assertRangeWithError("numberOfPoints", points.length, 2, 255);
            await this.#sendContextCommand({ type: "drawPolygon", points }, sendImmediately, isSending);
        }
        async drawWireframe(wireframe, sendImmediately, isSending, displayCanvasHelper) {
            wireframe = trimWireframe(wireframe);
            if (wireframe.points.length == 0) {
                return;
            }
            assertValidWireframe(wireframe);
            if (this.#contextStateHelper.isSegmentUniform) {
                const polygon = isWireframePolygon(wireframe);
                if (polygon) {
                    return this.drawSegments(polygon, sendImmediately);
                }
            }
            const commandType = "drawWireframe";
            const dataView = serializeDisplayContextCommandData(this, {
                type: commandType,
                wireframe,
            });
            if (!dataView) {
                return;
            }
            if (dataView.byteLength > this.#maxCommandDataLength) {
                _console$q.error(`wireframe data ${dataView.byteLength} too large (max ${this.#maxCommandDataLength})`);
                return;
            }
            await this.#sendContextCommand({
                type: "drawWireframe",
                wireframe,
            }, sendImmediately, isSending);
        }
        async drawCurve(curveType, controlPoints, sendImmediately, isSending, displayCanvasHelper) {
            assertValidNumberOfControlPoints(curveType, controlPoints);
            const commandType = curveType == "cubic"
                ? "drawCubicBezierCurve"
                : "drawQuadraticBezierCurve";
            await this.#sendContextCommand({
                type: commandType,
                controlPoints,
            }, sendImmediately, isSending);
        }
        async drawCurves(curveType, controlPoints, sendImmediately, isSending, displayCanvasHelper) {
            assertValidPathNumberOfControlPoints(curveType, controlPoints);
            const commandType = curveType == "cubic"
                ? "drawCubicBezierCurves"
                : "drawQuadraticBezierCurves";
            const dataView = serializeDisplayContextCommandData(this, {
                type: commandType,
                controlPoints,
            });
            if (!dataView) {
                return;
            }
            if (dataView.byteLength > this.#maxCommandDataLength) {
                _console$q.error(`curve data ${dataView.byteLength} too large (max ${this.#maxCommandDataLength})`);
                return;
            }
            await this.#sendContextCommand({
                type: commandType,
                controlPoints,
            }, sendImmediately, isSending);
        }
        async drawQuadraticBezierCurve(controlPoints, sendImmediately, isSending, displayCanvasHelper) {
            await this.drawCurve("quadratic", controlPoints, sendImmediately, isSending);
        }
        async drawQuadraticBezierCurves(controlPoints, sendImmediately, isSending, displayCanvasHelper) {
            await this.drawCurves("quadratic", controlPoints, sendImmediately, isSending);
        }
        async drawCubicBezierCurve(controlPoints, sendImmediately, isSending, displayCanvasHelper) {
            await this.drawCurve("cubic", controlPoints, sendImmediately, isSending);
        }
        async drawCubicBezierCurves(controlPoints, sendImmediately, isSending, displayCanvasHelper) {
            await this.drawCurves("cubic", controlPoints, sendImmediately, isSending);
        }
        async _drawPath(isClosed, curves, sendImmediately, isSending, displayCanvasHelper) {
            assertValidPath(curves);
            const commandType = isClosed
                ? "drawClosedPath"
                : "drawPath";
            const dataView = serializeDisplayContextCommandData(this, {
                type: commandType,
                curves,
            });
            if (!dataView) {
                return;
            }
            if (dataView.byteLength > this.#maxCommandDataLength) {
                _console$q.error(`path data ${dataView.byteLength} too large (max ${this.#maxCommandDataLength})`);
                return;
            }
            await this.#sendContextCommand({
                type: commandType,
                curves,
            }, sendImmediately, isSending);
        }
        async drawPath(curves, sendImmediately, isSending, displayCanvasHelper) {
            await this._drawPath(false, curves, sendImmediately, isSending);
        }
        async drawClosedPath(curves, sendImmediately, isSending, displayCanvasHelper) {
            await this._drawPath(true, curves, sendImmediately, isSending);
        }
        async drawSegment(startX, startY, endX, endY, sendImmediately, isSending, displayCanvasHelper) {
            await this.#sendContextCommand({
                type: "drawSegment",
                startX,
                startY,
                endX,
                endY,
            }, sendImmediately, isSending);
        }
        async drawSegments(points, sendImmediately, isSending, displayCanvasHelper) {
            _console$q.assertRangeWithError("numberOfPoints", points.length, 2, 255);
            const commandType = "drawSegments";
            const dataView = serializeDisplayContextCommandData(this, {
                type: commandType,
                points,
            });
            if (!dataView) {
                return;
            }
            if (dataView.byteLength > this.#maxCommandDataLength) {
                const mid = Math.floor(points.length / 2);
                const firstHalf = points.slice(0, mid + 1);
                const secondHalf = points.slice(mid);
                _console$q.log({ firstHalf, secondHalf });
                _console$q.log("sending first half", firstHalf);
                await this.drawSegments(firstHalf, false);
                _console$q.log("sending second half", secondHalf);
                await this.drawSegments(secondHalf, sendImmediately);
            }
            else {
                await this.#sendContextCommand({
                    type: "drawSegments",
                    points,
                }, sendImmediately, isSending);
            }
        }
        async drawArc(offsetX, offsetY, radius, startAngle, angleOffset, isRadians, sendImmediately, isSending, displayCanvasHelper) {
            await this.#sendContextCommand({
                type: "drawArc",
                offsetX,
                offsetY,
                radius,
                startAngle,
                angleOffset,
                isRadians,
            }, sendImmediately, isSending);
        }
        async drawArcEllipse(offsetX, offsetY, radiusX, radiusY, startAngle, angleOffset, isRadians, sendImmediately, isSending, displayCanvasHelper) {
            await this.#sendContextCommand({
                type: "drawArcEllipse",
                offsetX,
                offsetY,
                radiusX,
                radiusY,
                startAngle,
                angleOffset,
                isRadians,
            }, sendImmediately, isSending);
        }
        assertValidNumberOfColors(numberOfColors) {
            _console$q.assertRangeWithError("numberOfColors", numberOfColors, 2, this.numberOfColors);
        }
        assertValidBitmap(bitmap, checkSize) {
            this.assertValidNumberOfColors(bitmap.numberOfColors);
            assertValidBitmapPixels(bitmap);
            if (checkSize) {
                this.#assertValidBitmapSize(bitmap);
            }
        }
        #assertValidBitmapSize(bitmap) {
            const pixelDataLength = getBitmapNumberOfBytes(bitmap);
            _console$q.assertRangeWithError("bitmap.pixels.length", pixelDataLength, 1, this.#maxCommandDataLength - drawBitmapHeaderLength);
        }
        async drawBitmap(offsetX, offsetY, bitmap, sendImmediately, isSending, displayCanvasHelper) {
            this.assertValidBitmap(bitmap, true);
            await this.#sendContextCommand({ type: "drawBitmap", offsetX, offsetY, bitmap }, sendImmediately, isSending);
        }
        async imageToBitmap(image, width, height, numberOfColors) {
            return imageToBitmap(image, width, height, this.colors, this.bitmapColorIndices, numberOfColors);
        }
        async quantizeImage(image, width, height, numberOfColors) {
            return quantizeImage(image, width, height, numberOfColors);
        }
        async resizeAndQuantizeImage(image, width, height, numberOfColors, colors) {
            return resizeAndQuantizeImage(image, width, height, numberOfColors, colors);
        }
        async runContextCommand(command, sendImmediately, isSending) {
            _console$q.log("runContextCommand", command, {
                sendImmediately,
                isSending,
            });
            if (this.displayCanvasHelper) {
                await this.displayCanvasHelper.runContextCommand(command, sendImmediately, isSending);
            }
            else {
                await runDisplayContextCommand(this, command, sendImmediately, isSending);
            }
        }
        async runContextCommands(commands, sendImmediately, isSending) {
            _console$q.log("runContextCommands", commands, {
                sendImmediately,
                isSending,
            });
            if (this.displayCanvasHelper) {
                await this.displayCanvasHelper.runContextCommands(commands, sendImmediately, isSending);
            }
            else {
                await runDisplayContextCommands(this, commands, sendImmediately, isSending);
            }
        }
        async parseContextCommands(dataView, sendImmediately, isSending) {
            _console$q.log("parseContextCommands", dataView, {
                sendImmediately,
                isSending,
            });
            if (this.displayCanvasHelper) {
                await this.displayCanvasHelper.parseContextCommands(dataView, sendImmediately, isSending);
            }
            else {
                const contextCommands = parseDisplayContextCommands(this, dataView);
                await this.runContextCommands(contextCommands, sendImmediately, isSending);
            }
        }
        #isReady = true;
        get isReady() {
            return this.isAvailable && this.#isReady;
        }
        #lastReadyTime = 0;
        #lastShowRequestTime = 0;
        #minReadyInterval = 60;
        #waitBeforeReady = true;
        async #onDisplayReady() {
            _console$q.log("onDisplayReady");
            const now = Date.now();
            const timeSinceLastDraw = now - this.#lastShowRequestTime;
            const timeSinceLastReady = now - this.#lastReadyTime;
            _console$q.log(`${timeSinceLastDraw}ms draw time`);
            if (this.#waitBeforeReady && timeSinceLastReady < this.#minReadyInterval) {
                const timeToWait = this.#minReadyInterval - timeSinceLastReady;
                _console$q.log(`waiting ${timeToWait}ms`);
                await wait(timeToWait);
            }
            this.#isReady = true;
            this.#lastReadyTime = Date.now();
            this.#dispatchEvent("displayReady", {});
        }
        async #parseDisplayReady(dataView) {
            return this.#onDisplayReady();
        }
        #spriteSheets = {};
        #spriteSheetIndices = {};
        get spriteSheets() {
            return this.#spriteSheets;
        }
        get spriteSheetIndices() {
            return this.#spriteSheetIndices;
        }
        getSpriteSheetByIndex(index) {
            return getSpriteSheetByIndex(this, index);
        }
        async #setSpriteSheetName(spriteSheetName, sendImmediately) {
            _console$q.log("setSpriteSheetName", { spriteSheetName, sendImmediately });
            if (typeof spriteSheetName == "number") {
                spriteSheetName = spriteSheetName.toString();
            }
            _console$q.assertTypeWithError(spriteSheetName, "string");
            _console$q.assertRangeWithError("newName", spriteSheetName.length, MinSpriteSheetNameLength, MaxSpriteSheetNameLength);
            const setSpriteSheetNameData = textEncoder.encode(spriteSheetName);
            _console$q.log({ setSpriteSheetNameData });
            const promise = this.waitForEvent("getSpriteSheetName");
            this.sendMessage([{ type: "setSpriteSheetName", data: setSpriteSheetNameData.buffer }], sendImmediately);
            await promise;
        }
        #pendingSpriteSheet;
        get pendingSpriteSheet() {
            return this.#pendingSpriteSheet;
        }
        #pendingSpriteSheetName;
        get pendingSpriteSheetName() {
            return this.#pendingSpriteSheetName;
        }
        #updateSpriteSheetName(updatedSpriteSheetName) {
            _console$q.assertTypeWithError(updatedSpriteSheetName, "string");
            this.#pendingSpriteSheetName = updatedSpriteSheetName;
            _console$q.log({ updatedSpriteSheetName: this.#pendingSpriteSheetName });
            this.#dispatchEvent("getSpriteSheetName", {
                spriteSheetName: this.#pendingSpriteSheetName,
            });
        }
        sendFile;
        serializeSpriteSheet(spriteSheet) {
            return serializeSpriteSheet(this, spriteSheet);
        }
        async uploadSpriteSheet(spriteSheet, displayCanvasHelper) {
            if (spriteSheet.sprites.length == 0) {
                _console$q.log("no sprites in spriteSheet");
                return;
            }
            _console$q.log("uploadSpriteSheet", spriteSheet);
            if (this.#pendingSpriteSheet) {
                await this.waitForEvent("displaySpriteSheetUploadComplete");
                await this.uploadSpriteSheet(spriteSheet);
                return;
            }
            spriteSheet = structuredClone(spriteSheet);
            this.#pendingSpriteSheet = spriteSheet;
            const buffer = this.serializeSpriteSheet(this.#pendingSpriteSheet);
            await this.#setSpriteSheetName(this.#pendingSpriteSheet.name);
            const promise = this.waitForEvent("displaySpriteSheetUploadComplete");
            this.sendFile("spriteSheet", buffer, true);
            await promise;
        }
        async uploadSpriteSheets(spriteSheets) {
            for (const spriteSheet of spriteSheets) {
                await this.uploadSpriteSheet(spriteSheet);
            }
        }
        assertLoadedSpriteSheet(spriteSheetName) {
            assertLoadedSpriteSheet(this, spriteSheetName);
        }
        assertSelectedSpriteSheet(spriteSheetName) {
            assertSelectedSpriteSheet(this, spriteSheetName);
        }
        assertAnySelectedSpriteSheet() {
            assertAnySelectedSpriteSheet(this);
        }
        assertSprite(spriteName) {
            return assertSprite(this, spriteName);
        }
        getSprite(spriteName) {
            return getSprite(this, spriteName);
        }
        getSpriteSheetPalette(paletteName) {
            return getSpriteSheetPalette(this, paletteName);
        }
        getSpriteSheetPaletteSwap(paletteSwapName) {
            return getSpriteSheetPaletteSwap(this, paletteSwapName);
        }
        getSpritePaletteSwap(spriteName, paletteSwapName) {
            return getSpritePaletteSwap(this, spriteName, paletteSwapName);
        }
        get selectedSpriteSheet() {
            if (this.contextState.spriteSheetName) {
                return this.#spriteSheets[this.contextState.spriteSheetName];
            }
        }
        get selectedSpriteSheetName() {
            return this.selectedSpriteSheet?.name;
        }
        async selectSpriteSheet(spriteSheetName, sendImmediately, isSending, displayCanvasHelper) {
            this.assertLoadedSpriteSheet(spriteSheetName);
            const differences = this.#contextStateHelper.update({
                spriteSheetName,
            });
            if (differences.length == 0) {
                return;
            }
            const spriteSheetIndex = this.spriteSheetIndices[spriteSheetName];
            await this.#sendContextCommand({ type: "selectSpriteSheet", spriteSheetIndex }, sendImmediately, isSending);
            this.#onContextStateUpdate(differences);
        }
        async drawSprite(offsetX, offsetY, spriteName, sendImmediately, isSending, displayCanvasHelper) {
            _console$q.assertWithError(this.selectedSpriteSheet, "no spriteSheet selected");
            _console$q.log(`drawing sprite "${spriteName}" in selectedSpriteSheet`, this.selectedSpriteSheet);
            let spriteIndex = this.selectedSpriteSheet.sprites.findIndex((sprite) => sprite.name == spriteName);
            _console$q.assertWithError(spriteIndex != -1, `sprite "${spriteName}" not found in spriteSheet`);
            await this.#sendContextCommand({
                type: "drawSprite",
                offsetX,
                offsetY,
                spriteIndex,
                use2Bytes: this.selectedSpriteSheet.sprites.length > 255,
            }, sendImmediately, isSending);
        }
        async drawSprites(offsetX, offsetY, spriteLines, sendImmediately, isSending, displayCanvasHelper) {
            _console$q.assertWithError(this.contextState.spritesLineHeight > 0, `spritesLineHeight must be >0`);
            const spriteSerializedLines = spriteLinesToSerializedLines(this, spriteLines);
            _console$q.log("spriteSerializedLines", spriteSerializedLines);
            const commandType = "drawSprites";
            const dataView = serializeDisplayContextCommandData(this, {
                type: commandType,
                offsetX,
                offsetY,
                spriteSerializedLines: spriteSerializedLines,
            });
            if (!dataView) {
                return;
            }
            if (dataView.byteLength > this.#maxCommandDataLength) {
                _console$q.log("breaking up sprites...");
                const mid = Math.floor(spriteLines.length / 2);
                const firstHalf = spriteLines.slice(0, mid);
                const secondHalf = spriteLines.slice(mid);
                let firstHalfOffsetX = offsetX;
                let firstHalfOffsetY = offsetY;
                let secondHalfOffsetX = offsetX;
                let secondHalfOffsetY = offsetY;
                let didStartSprite = false;
                if (!this.#isDrawingBlankSprite) {
                    didStartSprite = true;
                    const { localSize } = getSpriteLinesMetrics(spriteLines, this.spriteSheets, this.contextState);
                    const { spritesLineHeight, spritesDirection, spritesLineDirection, spritesAlignment, spritesLineAlignment, spritesLineSpacing, spritesSpacing, horizontalAlignment, verticalAlignment, } = this.contextState;
                    _console$q.log("starting sprites sprite...");
                    await this.startSprite(offsetX, offsetY, localSize.width, localSize.height, false);
                    await this.setSpritesLineHeight(spritesLineHeight, false);
                    await this.setSpritesDirection(spritesDirection, false);
                    await this.setSpritesLineDirection(spritesLineDirection, false);
                    await this.setSpritesAlignment(spritesAlignment, false);
                    await this.setSpritesLineAlignment(spritesLineAlignment, false);
                    await this.setSpritesSpacing(spritesSpacing, false);
                    await this.setSpritesLineSpacing(spritesLineSpacing, false);
                    await this.setHorizontalAlignment(horizontalAlignment, false);
                    await this.setVerticalAlignment(verticalAlignment, false);
                    switch (horizontalAlignment) {
                        case "start":
                            firstHalfOffsetX = -localSize.width / 2;
                            break;
                        case "center":
                            firstHalfOffsetX = -localSize.width / 4;
                            break;
                        case "end":
                            firstHalfOffsetX = 0;
                            break;
                    }
                    switch (verticalAlignment) {
                        case "start":
                            firstHalfOffsetY = -localSize.height / 2;
                            break;
                        case "center":
                            firstHalfOffsetY = -localSize.height / 4;
                            break;
                        case "end":
                            firstHalfOffsetY = 0;
                            break;
                    }
                    secondHalfOffsetX = firstHalfOffsetX;
                    secondHalfOffsetY = firstHalfOffsetY;
                }
                _console$q.log("sending first half sprites", firstHalf);
                await this.drawSprites(firstHalfOffsetX, firstHalfOffsetY, firstHalf, false);
                const { localSize: firstHalfSize } = getSpriteLinesMetrics(firstHalf, this.#spriteSheets, this.contextState);
                const isSpritesLineDirectionPositive = isDirectionPositive(this.contextState.spritesLineDirection);
                const isSpritesLineDirectionHorizontal = isDirectionHorizontal(this.contextState.spritesLineDirection);
                const sign = isSpritesLineDirectionPositive ? 1 : -1;
                if (isSpritesLineDirectionHorizontal) {
                    secondHalfOffsetX += firstHalfSize.width * sign;
                }
                else {
                    secondHalfOffsetY += firstHalfSize.height * sign;
                }
                _console$q.log("sending second half sprites", secondHalf);
                await this.drawSprites(secondHalfOffsetX, secondHalfOffsetY, secondHalf, false);
                if (didStartSprite) {
                    _console$q.log("ending sprites sprite...");
                    await this.endSprite(sendImmediately);
                }
            }
            else {
                await this.#sendContextCommand({ type: "drawSprites", spriteSerializedLines, offsetX, offsetY }, sendImmediately, isSending);
            }
        }
        async drawSpritesString(offsetX, offsetY, string, requireAll, maxLineBreadth, separators, sendImmediately, isSending, displayCanvasHelper) {
            const spriteLines = this.stringToSpriteLines(string, requireAll, maxLineBreadth, separators);
            await this.drawSprites(offsetX, offsetY, spriteLines, sendImmediately, isSending);
        }
        stringToSpriteLines(string, requireAll, maxLineBreadth, separators) {
            return stringToSpriteLines(string, this.spriteSheets, this.contextState, requireAll, maxLineBreadth, separators);
        }
        stringToSpriteLinesMetrics(string, requireAll, maxLineBreadth, separators) {
            return stringToSpriteLinesMetrics(string, this.spriteSheets, this.contextState, requireAll, maxLineBreadth, separators);
        }
        async drawSpriteFromSpriteSheet(offsetX, offsetY, spriteName, spriteSheet, paletteName, sendImmediately, isSending, displayCanvasHelper) {
            return drawSpriteFromSpriteSheet(this, offsetX, offsetY, spriteName, spriteSheet, paletteName, sendImmediately, isSending);
        }
        #parseSpriteSheetIndex(dataView) {
            const spriteSheetIndex = dataView.getUint8(0);
            _console$q.log({
                pendingSpriteSheet: this.#pendingSpriteSheet,
                spriteSheetName: this.#pendingSpriteSheetName,
                spriteSheetIndex,
            });
            if (this.#pendingSpriteSheetName == undefined) {
                _console$q.log("pendingSpriteSheetName is undefined - skipping");
                return;
            }
            if (this.#pendingSpriteSheetName == undefined) {
                _console$q.log("expected spriteSheetName when receiving spriteSheetIndex - skipping");
                return;
            }
            if (this.#pendingSpriteSheet == undefined) {
                _console$q.log("expected pendingSpriteSheet when receiving spriteSheetIndex - skipping");
                return;
            }
            this.#spriteSheets[this.#pendingSpriteSheetName] =
                this.#pendingSpriteSheet;
            this.#spriteSheetIndices[this.#pendingSpriteSheetName] = spriteSheetIndex;
            _console$q.log(`finished uploading "${this.#pendingSpriteSheetName}" spriteSheet`);
            this.#dispatchEvent("displaySpriteSheetUploadComplete", {
                spriteSheetName: this.#pendingSpriteSheetName,
                spriteSheet: this.#pendingSpriteSheet,
            });
            this.#pendingSpriteSheet = undefined;
        }
        parseMessage(messageType, dataView, isSending) {
            _console$q.log({ messageType, isSending }, dataView);
            switch (messageType) {
                case "isDisplayAvailable":
                    this.#parseIsDisplayAvailable(dataView);
                    break;
                case "displayStatus":
                    this.#parseDisplayStatus(dataView);
                    break;
                case "displayInformation":
                    this.#parseDisplayInformation(dataView);
                    break;
                case "getDisplayBrightness":
                case "setDisplayBrightness":
                    this.#parseDisplayBrightness(dataView);
                    break;
                case "displayReady":
                    this.#parseDisplayReady(dataView);
                    break;
                case "getSpriteSheetName":
                case "setSpriteSheetName":
                    const spriteSheetName = textDecoder.decode(dataView.buffer);
                    _console$q.log({ spriteSheetName });
                    this.#updateSpriteSheetName(spriteSheetName);
                    break;
                case "spriteSheetIndex":
                    this.#parseSpriteSheetIndex(dataView);
                    break;
                case "displayCommand":
                    break;
                case "displayContextCommands":
                    this.parseContextCommands(dataView, true, true);
                    break;
                default:
                    throw Error(`uncaught messageType ${messageType}`);
            }
        }
        assertSpriteSheetPalette(paletteName) {
            assertSpriteSheetPalette(this, paletteName);
        }
        assertSpriteSheetPaletteSwap(paletteSwapName) {
            assertSpriteSheetPaletteSwap(this, paletteSwapName);
        }
        assertSpritePaletteSwap(spriteName, paletteSwapName) {
            assertSpritePaletteSwap(this, spriteName, paletteSwapName);
        }
        async selectSpriteSheetPalette(paletteName, offset, indicesOnly, sendImmediately, isSending, displayCanvasHelper) {
            await selectSpriteSheetPalette(this, paletteName, offset, indicesOnly, sendImmediately, isSending);
        }
        async selectSpriteSheetPaletteSwap(paletteSwapName, offset, sendImmediately, isSending, displayCanvasHelper) {
            await selectSpriteSheetPaletteSwap(this, paletteSwapName, offset, sendImmediately, isSending);
        }
        async selectSpritePaletteSwap(spriteName, paletteSwapName, offset, sendImmediately, isSending, displayCanvasHelper) {
            await selectSpritePaletteSwap(this, spriteName, paletteSwapName, offset, sendImmediately, isSending);
        }
        #isDrawingBlankSprite = false;
        async startSprite(offsetX, offsetY, width, height, sendImmediately, isSending, displayCanvasHelper) {
            _console$q.assertWithError(!this.#isDrawingBlankSprite, `already drawing blank sprite`);
            this.#isDrawingBlankSprite = true;
            this.#saveContext(sendImmediately);
            this.#resetContextState();
            await this.#sendContextCommand({ type: "startSprite", offsetX, offsetY, width, height }, sendImmediately, isSending);
        }
        async endSprite(sendImmediately, isSending, displayCanvasHelper) {
            this.#restoreContext(sendImmediately);
            _console$q.assertWithError(this.#isDrawingBlankSprite, `not drawing blank sprite`);
            this.#isDrawingBlankSprite = false;
            await this.#sendContextCommand({ type: "endSprite" }, sendImmediately, isSending);
        }
        #displayCanvasHelper;
        get displayCanvasHelper() {
            return this.#displayCanvasHelper;
        }
        set displayCanvasHelper(displayCanvasHelper) {
            this.#displayCanvasHelper = displayCanvasHelper;
        }
        reset() {
            _console$q.log("clearing displayManager");
            this.#displayStatus = undefined;
            this.#isAvailable = false;
            this.#displayInformation = undefined;
            this.#brightness = undefined;
            this.#contextCommandBuffers = [];
            this.#resetContextState();
            this.#colors.length = 0;
            this.#opacities.length = 0;
            this.#isReady = true;
            this.#pendingSpriteSheet = undefined;
            this.#pendingSpriteSheetName = undefined;
            this.#isDrawingBlankSprite = false;
            Object.keys(this.#spriteSheetIndices).forEach((spriteSheetName) => delete this.#spriteSheetIndices[spriteSheetName]);
            Object.keys(this.#spriteSheets).forEach((spriteSheetName) => delete this.#spriteSheets[spriteSheetName]);
        }
        #mtu;
        get mtu() {
            return this.#mtu;
        }
        set mtu(newMtu) {
            this.#mtu = newMtu;
        }
    };
})();

const _console$p = createConsole("LedManager", { log: false });
const LedTypes = [
    "digitalSingle",
    "analogSingle",
    "digitalRGB",
    "analogRGB",
];
const LedValueTypes = ["color", "brightness"];
const LedMessageTypes = [
    "getLedInformation",
    "setLeds",
    "clearLeds",
];
const LedEventTypes = [...LedMessageTypes, "setLed"];
class LedManager {
    constructor() {
        autoBind$1(this);
    }
    sendMessage;
    eventDispatcher;
    get #dispatchEvent() {
        return this.eventDispatcher.dispatchEvent;
    }
    get waitForEvent() {
        return this.eventDispatcher.waitForEvent;
    }
    #leds = [];
    #pendingColors = [];
    get leds() {
        return this.#leds;
    }
    #updateLeds(newLeds) {
        _console$p.log("updateLeds", newLeds);
        this.#leds = newLeds;
        this.#pendingColors.length = 0;
        _console$p.log("leds", this.leds);
        this.#dispatchEvent("getLedInformation", { leds: this.leds });
    }
    #isLedTypeAnalog(ledType) {
        return ledType.startsWith("analog");
    }
    #isLedTypeDigital(ledType) {
        return ledType.startsWith("digital");
    }
    #isLedTypeSingle(ledType) {
        return ledType.endsWith("Single");
    }
    #isLedTypeRGB(ledType) {
        return ledType.endsWith("RGB");
    }
    #parseLedInformation(dataView) {
        _console$p.log("parseLedInformation", dataView);
        const newLeds = [];
        let offset = 0;
        while (offset < dataView.byteLength) {
            const ledTypeIndex = dataView.getUint8(offset++);
            const ledType = LedTypes[ledTypeIndex];
            _console$p.log({ ledTypeIndex, ledType });
            _console$p.assertEnumWithError(ledType, LedTypes);
            const maxColor = structuredClone(whiteColor);
            switch (ledType) {
                case "digitalSingle":
                case "analogSingle":
                    maxColor.r = dataView.getUint8(offset++);
                    maxColor.g = dataView.getUint8(offset++);
                    maxColor.b = dataView.getUint8(offset++);
                    break;
                case "digitalRGB":
                case "analogRGB":
                    break;
                default:
                    _console$p.error(`uncaught ledType "${ledType}"`);
                    break;
            }
            _console$p.log("maxColor", maxColor);
            const led = {
                index: newLeds.length,
                type: ledType,
                color: structuredClone(blackColor),
                maxColor,
                isAnalog: this.#isLedTypeAnalog(ledType),
                isDigital: this.#isLedTypeDigital(ledType),
                isSingle: this.#isLedTypeSingle(ledType),
                isRGB: this.#isLedTypeRGB(ledType),
            };
            _console$p.log("led", led);
            newLeds.push(led);
        }
        this.#updateLeds(newLeds);
    }
    #clampColor(color, led) {
        const { type, maxColor, index } = led;
        switch (type) {
            case "digitalSingle":
                {
                    const value = Math.floor(projectColor(color, maxColor));
                    {
                        return value;
                    }
                }
            case "analogSingle":
                {
                    const value = projectColor(color, maxColor);
                    {
                        return value;
                    }
                }
            case "digitalRGB":
                return roundColor(clampColor(color, maxColor));
            case "analogRGB":
                return clampColor(color, maxColor);
            default:
                _console$p.error(`uncaught led #${index} type "${type}"`);
                return blackColor;
        }
    }
    #verifyLedIndex(ledIndex) {
        _console$p.assertRangeWithError("ledConfiguration.index", ledIndex, 0, this.leds.length - 1);
    }
    async setLeds(ledConfigurations, sendImmediately) {
        if (ledConfigurations.length == 0) {
            _console$p.log("empty ledConfigurations");
            return;
        }
        _console$p.log("setLeds", ledConfigurations, { sendImmediately });
        let setLedsData;
        ledConfigurations.forEach((ledConfiguration) => {
            const { index } = ledConfiguration;
            this.#verifyLedIndex(index);
            const led = this.#leds[index];
            let arrayBuffer;
            let value;
            if ("color" in ledConfiguration) {
                let { color } = ledConfiguration;
                if (typeof color == "string") {
                    color = stringToRGB(color);
                }
                value = this.#clampColor(color, led);
            }
            else if ("brightness" in ledConfiguration) {
                let { brightness } = ledConfiguration;
                value = clamp(brightness, 0, 255);
            }
            else {
                _console$p.error(`ledConfiguration contains neither a "color" nor "brightness"`, ledConfiguration);
                return;
            }
            if (typeof value == "number") {
                arrayBuffer = concatenateArrayBuffers(led.index, LedValueTypes.indexOf("brightness"), value);
            }
            else {
                arrayBuffer = concatenateArrayBuffers(led.index, LedValueTypes.indexOf("color"), value.r, value.g, value.b);
            }
            let newColor = value;
            if (typeof newColor == "number") {
                newColor = scaleColor(led.maxColor, newColor / 255);
            }
            _console$p.log(`led.index ${led.index} newColor:`, newColor);
            const isColorRedundant = areColorsEqual(led.color, newColor);
            if (!isColorRedundant) {
                this.#pendingColors[led.index] = newColor;
                setLedsData = concatenateArrayBuffers(setLedsData, arrayBuffer);
            }
            else {
                _console$p.log("redundant color - skipping");
            }
        });
        await this.sendMessage([{ type: "setLeds", data: setLedsData }], sendImmediately);
    }
    async setLed(ledConfiguration, sendImmediately) {
        _console$p.log("setLed", ledConfiguration, { sendImmediately });
        return this.setLeds([ledConfiguration], sendImmediately);
    }
    async clearLeds(sendImmediately) {
        _console$p.log("clearLeds");
        this.#pendingColors = this.#leds.map(() => blackColor);
        await this.sendMessage([{ type: "clearLeds" }], sendImmediately);
    }
    parseMessage(messageType, dataView, isSending) {
        _console$p.log({ messageType, isSending }, dataView);
        switch (messageType) {
            case "getLedInformation":
                this.#parseLedInformation(dataView);
                break;
            case "setLeds":
                break;
            case "clearLeds":
                break;
            default:
                throw Error(`uncaught messageType ${messageType}`);
        }
    }
    onSendTxMessages() {
        _console$p.log("onSendTxMessages");
        this.#flushPendingColors();
    }
    #flushPendingColors() {
        _console$p.log("flushPendingColors");
        this.#pendingColors.forEach((color, ledIndex) => {
            this.#verifyLedIndex(ledIndex);
            const led = this.#leds[ledIndex];
            led.color = color;
            this.#dispatchEvent("setLed", {
                ledIndex,
                led,
            });
        });
        this.#pendingColors.length = 0;
    }
    clear() {
        this.#leds.length = 0;
        this.#pendingColors.length = 0;
    }
}

const _console$o = createConsole("ServerUtils", { log: false });
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
    "requiredDeviceInformation",
];
function createMessage(enumeration, use2Bytes, ...messages) {
    _console$o.log("createMessage", ...messages);
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
        _console$o.assertEnumWithError(message.type, enumeration);
        const messageTypeEnum = enumeration.indexOf(message.type);
        let messageDataLengthDataView;
        if (use2Bytes) {
            messageDataLengthDataView = new DataView(new ArrayBuffer(2));
            messageDataLengthDataView.setUint16(0, messageDataArrayBufferByteLength, true);
        }
        else {
            messageDataLengthDataView = new DataView(new ArrayBuffer(1));
            messageDataLengthDataView.setUint8(0, messageDataArrayBufferByteLength);
        }
        return concatenateArrayBuffers(messageTypeEnum, messageDataLengthDataView, messageDataArrayBuffer);
    });
    _console$o.log("messageBuffers", ...messageBuffers);
    return concatenateArrayBuffers(...messageBuffers);
}
function createServerMessage(...messages) {
    _console$o.log("createServerMessage", ...messages);
    return createMessage(ServerMessageTypes, true, ...messages);
}
function createDeviceMessage(...messages) {
    _console$o.log("createDeviceMessage", ...messages);
    return createMessage(DeviceEventTypes, true, ...messages);
}
createServerMessage("isScanningAvailable");
createServerMessage("isScanning");
createServerMessage("startScan");
createServerMessage("stopScan");
createServerMessage("discoveredDevices");

const _console$n = createConsole("BaseConnectionManager", { log: false });
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
    ...FileTransferMessageTypes,
    ...TfliteMessageTypes,
    ...WifiMessageTypes,
    ...CameraMessageTypes,
    ...MicrophoneMessageTypes,
    ...DisplayMessageTypes,
    ...SensorMetaDataMessageTypes,
    ...LedMessageTypes,
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
    static #AssertValidTxRxMessageType(messageType) {
        _console$n.assertEnumWithError(messageType, TxRxMessageTypes);
    }
    onStatusUpdated;
    onMessageReceived;
    onMessagesReceived;
    onMessageSent;
    onMessagesSent;
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
    static type;
    #assertIsSupported() {
        _console$n.assertWithError(this.isSupported, `${this.type} is not supported`);
    }
    constructor() {
        this.#assertIsSupported();
    }
    #status = "notConnected";
    get status() {
        return this.#status;
    }
    set status(newConnectionStatus) {
        _console$n.assertEnumWithError(newConnectionStatus, ConnectionStatuses);
        if (this.#status == newConnectionStatus) {
            _console$n.log(`tried to assign same connection status "${newConnectionStatus}"`);
            return;
        }
        _console$n.log(`new connection status "${newConnectionStatus}"`);
        this.#status = newConnectionStatus;
        this.onStatusUpdated(this.status);
        if (this.isConnected) {
            this.#timer.start();
        }
        else {
            this.#timer.stop();
        }
        if (this.#status == "notConnected") {
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
        _console$n.assertWithError(!this.isConnected, "device is already connected");
    }
    #assertIsNotConnecting() {
        _console$n.assertWithError(this.status != "connecting", "device is already connecting");
    }
    assertIsConnected() {
        _console$n.assertWithError(this.isConnected, "device is not connected");
    }
    #assertIsNotDisconnecting() {
        _console$n.assertWithError(this.status != "disconnecting", "device is already disconnecting");
    }
    assertIsConnectedAndNotDisconnecting() {
        this.assertIsConnected();
        this.#assertIsNotDisconnecting();
    }
    async connect() {
        if (this.isConnected) {
            _console$n.log("already connected");
            return false;
        }
        if (this.#status == "connecting") {
            _console$n.log("already connecting");
            return false;
        }
        this.status = "connecting";
        return true;
    }
    get canReconnect() {
        return false;
    }
    async reconnect() {
        if (this.isConnected) {
            _console$n.log("already connected");
            return false;
        }
        if (this.#status == "connecting") {
            _console$n.log("already connecting");
            return false;
        }
        if (!this.canReconnect) {
            _console$n.warn("unable to reconnect");
            return false;
        }
        this.status = "connecting";
        _console$n.log("attempting to reconnect...");
        return true;
    }
    async disconnect() {
        if (this.#status == "notConnected") {
            _console$n.log("already not connected");
            return false;
        }
        if (this.#status == "disconnecting") {
            _console$n.log("already disconnecting");
            return false;
        }
        this.status = "disconnecting";
        _console$n.log("disconnecting from device...");
        return true;
    }
    async sendSmpMessage(data) {
        this.assertIsConnectedAndNotDisconnecting();
        _console$n.log("sending smp message", data);
    }
    #pendingMessages = [];
    #isSendingMessages = false;
    async sendTxMessages(messages, sendImmediately = true) {
        this.assertIsConnectedAndNotDisconnecting();
        if (messages) {
            this.#pendingMessages.push(...messages);
            _console$n.log(`appended ${messages.length} messages`);
        }
        if (!sendImmediately) {
            _console$n.log("not sending immediately - waiting until later");
            return;
        }
        if (this.#isSendingMessages) {
            _console$n.log("already sending messages - waiting until later");
            return;
        }
        if (this.#pendingMessages.length == 0) {
            _console$n.log("no pendingMessages");
            return;
        }
        this.#isSendingMessages = true;
        const arrayBuffers = [];
        const pendingMessages = this.#pendingMessages.filter((message) => {
            const arrayBuffer = createMessage(TxRxMessageTypes, true, message);
            if (arrayBuffer.byteLength > this.mtu - 3) {
                _console$n.error(`arrayBuffer is too big to send (max ${this.mtu - 3}, got ${arrayBuffer.byteLength})`, {
                    message,
                });
                return false;
            }
            arrayBuffers.push(arrayBuffer);
            return true;
        });
        this.#pendingMessages.length = 0;
        _console$n.log("sendTxMessages", pendingMessages);
        if (this.mtu) {
            while (arrayBuffers.length > 0) {
                _console$n.log("remaining arrayBuffers.length", arrayBuffers.length);
                let arrayBufferByteLength = 0;
                let arrayBufferCount = 0;
                arrayBuffers.some((arrayBuffer) => {
                    if (arrayBufferByteLength + arrayBuffer.byteLength > this.mtu - 3) {
                        _console$n.log(`stopping appending arrayBuffers ( length ${arrayBuffer.byteLength} too much)`);
                        return true;
                    }
                    _console$n.log(`allowing arrayBuffer with length ${arrayBuffer.byteLength}`);
                    arrayBufferCount++;
                    arrayBufferByteLength += arrayBuffer.byteLength;
                });
                const arrayBuffersToSend = arrayBuffers.splice(0, arrayBufferCount);
                _console$n.log({ arrayBufferCount, arrayBuffersToSend });
                const arrayBuffer = concatenateArrayBuffers(...arrayBuffersToSend);
                _console$n.log("sending arrayBuffer (partitioned)", arrayBuffer);
                await this.sendTxData(arrayBuffer);
            }
        }
        else {
            const arrayBuffer = concatenateArrayBuffers(...arrayBuffers);
            _console$n.log("sending arrayBuffer (all)", arrayBuffer);
            await this.sendTxData(arrayBuffer);
        }
        this.#isSendingMessages = false;
        pendingMessages.forEach((pendingMessage) => {
            this.onMessageSent(pendingMessage);
        });
        this.onMessagesSent(pendingMessages);
        this.sendTxMessages(undefined, true);
    }
    defaultMtu = 23;
    mtu = this.defaultMtu;
    async sendTxData(data) {
        _console$n.log("sendTxData", data);
    }
    parseRxMessage(dataView) {
        parseMessage(dataView, TxRxMessageTypes, this.#onRxMessage.bind(this), null, true);
        this.onMessagesReceived();
    }
    #onRxMessage(messageType, dataView) {
        _console$n.log({ messageType, dataView });
        this.onMessageReceived(messageType, dataView);
    }
    #timer = new Timer(this.#checkConnection.bind(this), 5000);
    #checkConnection() {
        if (!this.isConnected) {
            _console$n.log("timer detected disconnection");
            this.status = "notConnected";
        }
    }
    clear() {
        this.#isSendingMessages = false;
        this.#pendingMessages.length = 0;
    }
    remove() {
        this.clear();
        this.onStatusUpdated = undefined;
        this.onMessageReceived = undefined;
        this.onMessagesReceived = undefined;
    }
}

const _console$m = createConsole("EventUtils", { log: false });
function addEventListeners(target, boundEventListeners) {
    let addEventListener = target.addEventListener ||
        target.addListener ||
        target.on ||
        target.addEventListener;
    _console$m.assertWithError(addEventListener, "no add listener function found for target");
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
function removeEventListeners(target, boundEventListeners) {
    let removeEventListener = target.removeEventListener ||
        target.removeListener ||
        target.removeEventListener;
    _console$m.assertWithError(removeEventListener, "no remove listener function found for target");
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

const _console$l = createConsole("bluetoothUUIDs", { log: false });
var BluetoothUUID;
BluetoothUUID = webbluetooth.BluetoothUUID;
if (typeof BluetoothUUID == undefined) {
    BluetoothUUID = {
        getService: (uuid) => toUUID(uuid),
        getCharacteristic: (uuid) => toUUID(uuid),
        getDescriptor: (uuid) => toUUID(uuid),
        canonicalUUID: (alias) => toUUID(alias),
    };
}
function toUUID(uuid) {
    if (typeof uuid === "number") {
        uuid = uuid.toString(16).padStart(4, "0");
    }
    if (/^[0-9a-fA-F]{4,8}$/.test(uuid)) {
        return `0000${uuid.padStart(8, "0")}-0000-1000-8000-00805f9b34fb`;
    }
    return uuid.toLowerCase();
}
function generateBluetoothUUID(value) {
    _console$l.assertTypeWithError(value, "string");
    _console$l.assertWithError(value.length == 4, "value must be 4 characters long");
    return `ea6d${value}-a725-4f9b-893d-c3913e33b39f`;
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

const _console$k = createConsole("BluetoothConnectionManager", { log: false });
class BluetoothConnectionManager extends BaseConnectionManager {
    get isAvailable() {
        return true;
    }
    isInRange = true;
    onCharacteristicValueChanged(characteristicName, dataView) {
        if (characteristicName == "rx") {
            this.parseRxMessage(dataView);
        }
        else {
            this.onMessageReceived?.(characteristicName, dataView);
        }
    }
    async writeCharacteristic(characteristicName, data) {
        _console$k.log("writeCharacteristic", ...arguments);
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

const _console$j = createConsole("WebBluetoothConnectionManager", { log: false });
var bluetooth;
if (isInNode) {
    bluetooth = webbluetooth.bluetooth;
}
class WebBluetoothConnectionManager extends BluetoothConnectionManager {
    get bluetoothId() {
        return this.device?.id ?? "";
    }
    get canUpdateFirmware() {
        return this.#characteristics.has("smp");
    }
    #boundBluetoothCharacteristicEventListeners = {
        characteristicvaluechanged: this.#onCharacteristicvaluechanged.bind(this),
    };
    #boundBluetoothDeviceEventListeners = {
        gattserverdisconnected: this.#onGattserverdisconnected.bind(this),
    };
    static get isSupported() {
        return Boolean(bluetooth);
    }
    static type = "webBluetooth";
    type = WebBluetoothConnectionManager.type;
    #device;
    get device() {
        return this.#device;
    }
    set device(newDevice) {
        if (this.#device == newDevice) {
            _console$j.log("tried to assign the same BluetoothDevice");
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
    get server() {
        return this.#device?.gatt;
    }
    get isConnected() {
        return this.server?.connected || false;
    }
    #services = new Map();
    #characteristics = new Map();
    async connect() {
        const canContinue = super.connect();
        if (!canContinue) {
            return false;
        }
        try {
            const device = await bluetooth.requestDevice({
                filters: [{ services: serviceUUIDs }],
                optionalServices: isInBrowser ? optionalServiceUUIDs : [],
            });
            _console$j.log("got BluetoothDevice");
            this.device = device;
            _console$j.log("connecting to device...");
            const server = await this.server.connect();
            _console$j.log(`connected to device? ${server.connected}`);
            await this.#getServicesAndCharacteristics();
            _console$j.log("fully connected");
            this.status = "connected";
            return true;
        }
        catch (error) {
            _console$j.error(error);
            this.status = "notConnected";
            this.server?.disconnect();
            await this.#removeEventListeners();
            return false;
        }
    }
    async #getServicesAndCharacteristics() {
        this.#removeEventListeners();
        _console$j.log("getting services...");
        const services = await this.server.getPrimaryServices();
        _console$j.log("got services", services.length);
        _console$j.log("getting characteristics...");
        for (const serviceIndex in services) {
            const service = services[serviceIndex];
            _console$j.log({ service });
            const serviceName = getServiceNameFromUUID(service.uuid);
            _console$j.assertWithError(serviceName, `no name found for service uuid "${service.uuid}"`);
            _console$j.log(`got "${serviceName}" service`);
            service.name = serviceName;
            this.#services.set(serviceName, service);
            _console$j.log(`getting characteristics for "${serviceName}" service`);
            const characteristics = await service.getCharacteristics();
            _console$j.log(`got characteristics for "${serviceName}" service`);
            for (const characteristicIndex in characteristics) {
                const characteristic = characteristics[characteristicIndex];
                _console$j.log({ characteristic });
                const characteristicName = getCharacteristicNameFromUUID(characteristic.uuid);
                _console$j.assertWithError(Boolean(characteristicName), `no name found for characteristic uuid "${characteristic.uuid}" in "${serviceName}" service`);
                _console$j.log(`got "${characteristicName}" characteristic in "${serviceName}" service`);
                characteristic.name = characteristicName;
                this.#characteristics.set(characteristicName, characteristic);
                addEventListeners(characteristic, this.#boundBluetoothCharacteristicEventListeners);
                const characteristicProperties = characteristic.properties ||
                    getCharacteristicProperties(characteristicName);
                if (characteristicProperties.notify) {
                    _console$j.log(`starting notifications for "${characteristicName}" characteristic`);
                    await characteristic.startNotifications();
                }
                if (characteristicProperties.read) {
                    _console$j.log(`reading "${characteristicName}" characteristic...`);
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
            const characteristicProperties = characteristic.properties ||
                getCharacteristicProperties(characteristicName);
            if (characteristicProperties.notify) {
                _console$j.log(`stopping notifications for "${characteristicName}" characteristic`);
                return characteristic.stopNotifications();
            }
        });
        return Promise.allSettled(promises);
    }
    async disconnect() {
        const canContinue = await super.disconnect();
        if (!canContinue) {
            return false;
        }
        await this.#removeEventListeners();
        this.server?.disconnect();
        this.status = "notConnected";
        return true;
    }
    #onCharacteristicvaluechanged(event) {
        _console$j.log("oncharacteristicvaluechanged");
        const characteristic = event.target;
        this.#onCharacteristicValueChanged(characteristic);
    }
    #onCharacteristicValueChanged(characteristic) {
        _console$j.log("onCharacteristicValue");
        const characteristicName = characteristic.name;
        _console$j.assertWithError(Boolean(characteristicName), `no name found for characteristic with uuid "${characteristic.uuid}"`);
        _console$j.log(`oncharacteristicvaluechanged for "${characteristicName}" characteristic`);
        const dataView = characteristic.value;
        _console$j.assertWithError(dataView, `no data found for "${characteristicName}" characteristic`);
        _console$j.log(`data for "${characteristicName}" characteristic`, Array.from(new Uint8Array(dataView.buffer)));
        try {
            this.onCharacteristicValueChanged(characteristicName, dataView);
        }
        catch (error) {
            _console$j.error(error);
        }
    }
    async writeCharacteristic(characteristicName, data) {
        super.writeCharacteristic(characteristicName, data);
        const characteristic = this.#characteristics.get(characteristicName);
        _console$j.assertWithError(characteristic, `${characteristicName} characteristic not found`);
        _console$j.log("writing characteristic", characteristic, data);
        const characteristicProperties = characteristic.properties ||
            getCharacteristicProperties(characteristicName);
        if (characteristicProperties.writeWithoutResponse) {
            _console$j.log("writing without response");
            await characteristic.writeValueWithoutResponse(data);
        }
        else {
            _console$j.log("writing with response");
            await characteristic.writeValueWithResponse(data);
        }
        _console$j.log("wrote characteristic");
        if (characteristicProperties.read && !characteristicProperties.notify) {
            _console$j.log("reading value after write...");
            await characteristic.readValue();
            if (isInBluefy || isInWebBLE) {
                this.#onCharacteristicValueChanged(characteristic);
            }
        }
    }
    #onGattserverdisconnected() {
        _console$j.log("gattserverdisconnected");
        this.status = "notConnected";
    }
    get canReconnect() {
        return Boolean(this.server && !this.server.connected && this.isInRange);
    }
    async reconnect() {
        const canContinue = await super.reconnect();
        if (!canContinue) {
            return false;
        }
        try {
            await this.server.connect();
        }
        catch (error) {
            _console$j.error(error);
            this.isInRange = false;
            return false;
        }
        if (this.isConnected) {
            _console$j.log("successfully reconnected!");
            await this.#getServicesAndCharacteristics();
            this.status = "connected";
            return true;
        }
        else {
            _console$j.log("unable to reconnect");
            this.status = "notConnected";
            return false;
        }
    }
    remove() {
        super.remove();
        this.device = undefined;
    }
}

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

const _console$i = createConsole("mcumgr", { log: false });
const constants = {
  MGMT_OP_READ: 0,
  MGMT_OP_READ_RSP: 1,
  MGMT_OP_WRITE: 2,
  MGMT_OP_WRITE_RSP: 3,
  MGMT_GROUP_ID_OS: 0,
  MGMT_GROUP_ID_IMAGE: 1,
  MGMT_GROUP_ID_FS: 8,
  OS_MGMT_ID_ECHO: 0,
  OS_MGMT_ID_TASKSTAT: 2,
  OS_MGMT_ID_MPSTAT: 3,
  OS_MGMT_ID_RESET: 5,
  IMG_MGMT_ID_STATE: 0,
  IMG_MGMT_ID_UPLOAD: 1,
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
    _console$i.log("mcumgr - message received");
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
    _console$i.log("mcumgr - Process Message - Group: " + group + ", Id: " + id + ", Off: " + data.off);
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
      _console$i.log("downloaded " + this._downloadFileOffset + " bytes of " + this._downloadFileLength);
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
    _console$i.log("mcumgr - _uploadNext: Message Length: " + packet.length);
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
      _console$i.error("Upload is already in progress.");
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
      _console$i.error("Upload is already in progress.");
      return;
    }
    this._uploadIsInProgress = true;
    this._uploadFileOffset = 0;
    this._uploadFile = filebuf;
    this._uploadFilename = destFilename;
    this._uploadFileNext();
  }
  async _uploadFileNext() {
    _console$i.log("uploadFileNext - offset: " + this._uploadFileOffset + ", length: " + this._uploadFile.byteLength);
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
    _console$i.log("mcumgr - _uploadNext: Message Length: " + packet.length);
    this._fileUploadNextCallback({ packet });
  }
  async cmdDownloadFile(filename, destFilename) {
    if (this._downloadIsInProgress) {
      _console$i.error("Download is already in progress.");
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
    _console$i.log("mcumgr - _downloadNext: Message Length: " + packet.length);
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

const _console$h = createConsole("FirmwareManager", { log: false });
const FirmwareMessageTypes = ["smp"];
const FirmwareEventTypes = [
    ...FirmwareMessageTypes,
    "firmwareImages",
    "firmwareUploadProgress",
    "firmwareStatus",
    "firmwareUploadComplete",
];
const FirmwareStatuses = [
    "idle",
    "uploading",
    "uploaded",
    "pending",
    "testing",
    "erasing",
];
class FirmwareManager {
    sendMessage;
    constructor() {
        this.#assignMcuManagerCallbacks();
        autoBind$1(this);
    }
    eventDispatcher;
    get addEventListenter() {
        return this.eventDispatcher.addEventListener;
    }
    get #dispatchEvent() {
        return this.eventDispatcher.dispatchEvent;
    }
    get removeEventListener() {
        return this.eventDispatcher.removeEventListener;
    }
    get waitForEvent() {
        return this.eventDispatcher.waitForEvent;
    }
    parseMessage(messageType, dataView, isSending) {
        _console$h.log({ messageType, isSending }, dataView);
        switch (messageType) {
            case "smp":
                this.#mcuManager._notification(Array.from(new Uint8Array(dataView.buffer)));
                this.#dispatchEvent("smp", { dataView });
                break;
            default:
                throw Error(`uncaught messageType ${messageType}`);
        }
    }
    async uploadFirmware(file) {
        _console$h.log("uploadFirmware", file);
        const promise = this.waitForEvent("firmwareUploadComplete");
        await this.getImages();
        const arrayBuffer = await getFileBuffer(file);
        const imageInfo = await this.#mcuManager.imageInfo(arrayBuffer);
        _console$h.log({ imageInfo });
        this.#mcuManager.cmdUpload(arrayBuffer, 1);
        this.#updateStatus("uploading");
        await promise;
    }
    #status = "idle";
    get status() {
        return this.#status;
    }
    #updateStatus(newStatus) {
        _console$h.assertEnumWithError(newStatus, FirmwareStatuses);
        if (this.#status == newStatus) {
            _console$h.log(`redundant firmwareStatus assignment "${newStatus}"`);
            return;
        }
        this.#status = newStatus;
        _console$h.log({ firmwareStatus: this.#status });
        this.#dispatchEvent("firmwareStatus", { firmwareStatus: this.#status });
    }
    #images;
    get images() {
        return this.#images;
    }
    #assertImages() {
        _console$h.assertWithError(this.#images, "didn't get imageState");
    }
    #assertValidImageIndex(imageIndex) {
        _console$h.assertTypeWithError(imageIndex, "number");
        _console$h.assertWithError(imageIndex == 0 || imageIndex == 1, "imageIndex must be 0 or 1");
    }
    async getImages() {
        const promise = this.waitForEvent("firmwareImages");
        _console$h.log("getting firmware image state...");
        this.sendMessage(Uint8Array.from(this.#mcuManager.cmdImageState()).buffer);
        await promise;
    }
    async testImage(imageIndex = 1) {
        this.#assertValidImageIndex(imageIndex);
        this.#assertImages();
        if (!this.#images[imageIndex]) {
            _console$h.log(`image ${imageIndex} not found`);
            return;
        }
        if (this.#images[imageIndex].pending == true) {
            _console$h.log(`image ${imageIndex} is already pending`);
            return;
        }
        if (this.#images[imageIndex].empty) {
            _console$h.log(`image ${imageIndex} is empty`);
            return;
        }
        const promise = this.waitForEvent("smp");
        _console$h.log("testing firmware image...");
        this.sendMessage(Uint8Array.from(this.#mcuManager.cmdImageTest(this.#images[imageIndex].hash)).buffer);
        await promise;
    }
    async eraseImage() {
        this.#assertImages();
        const promise = this.waitForEvent("smp");
        _console$h.log("erasing image...");
        this.sendMessage(Uint8Array.from(this.#mcuManager.cmdImageErase()).buffer);
        this.#updateStatus("erasing");
        await promise;
        await this.getImages();
    }
    async confirmImage(imageIndex = 0) {
        this.#assertValidImageIndex(imageIndex);
        this.#assertImages();
        if (this.#images[imageIndex].confirmed === true) {
            _console$h.log(`image ${imageIndex} is already confirmed`);
            return;
        }
        const promise = this.waitForEvent("smp");
        _console$h.log("confirming image...");
        this.sendMessage(Uint8Array.from(this.#mcuManager.cmdImageConfirm(this.#images[imageIndex].hash)).buffer);
        await promise;
    }
    async echo(string) {
        _console$h.assertTypeWithError(string, "string");
        const promise = this.waitForEvent("smp");
        _console$h.log("sending echo...");
        this.sendMessage(Uint8Array.from(this.#mcuManager.smpEcho(string)).buffer);
        await promise;
    }
    async reset() {
        const promise = this.waitForEvent("smp");
        _console$h.log("resetting...");
        this.sendMessage(Uint8Array.from(this.#mcuManager.cmdReset()).buffer);
        await promise;
    }
    #mtu;
    get mtu() {
        return this.#mtu;
    }
    set mtu(newMtu) {
        this.#mtu = newMtu;
        this.#mcuManager._mtu = newMtu;
    }
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
    #onMcuMessage({ op, group, id, data, length, }) {
        _console$h.log("onMcuMessage", ...arguments);
        switch (group) {
            case constants.MGMT_GROUP_ID_OS:
                switch (id) {
                    case constants.OS_MGMT_ID_ECHO:
                        _console$h.log(`echo "${data.r}"`);
                        break;
                    case constants.OS_MGMT_ID_TASKSTAT:
                        _console$h.table(data.tasks);
                        break;
                    case constants.OS_MGMT_ID_MPSTAT:
                        _console$h.log(data);
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
        _console$h.log("onMcuFileDownloadNext", ...arguments);
    }
    #onMcuFileDownloadProgress() {
        _console$h.log("onMcuFileDownloadProgress", ...arguments);
    }
    #onMcuFileDownloadFinished() {
        _console$h.log("onMcuFileDownloadFinished", ...arguments);
    }
    #onMcuFileUploadNext() {
        _console$h.log("onMcuFileUploadNext");
    }
    #onMcuFileUploadProgress() {
        _console$h.log("onMcuFileUploadProgress");
    }
    #onMcuFileUploadFinished() {
        _console$h.log("onMcuFileUploadFinished");
    }
    #onMcuImageUploadNext({ packet }) {
        _console$h.log("onMcuImageUploadNext");
        this.sendMessage(Uint8Array.from(packet).buffer);
    }
    #onMcuImageUploadProgress({ percentage }) {
        const progress = percentage / 100;
        _console$h.log("onMcuImageUploadProgress", ...arguments);
        this.#dispatchEvent("firmwareUploadProgress", { progress });
    }
    async #onMcuImageUploadFinished() {
        _console$h.log("onMcuImageUploadFinished", ...arguments);
        await this.getImages();
        this.#dispatchEvent("firmwareUploadProgress", { progress: 100 });
        this.#dispatchEvent("firmwareUploadComplete", {});
    }
    #onMcuImageState({ images }) {
        if (images) {
            this.#images = images;
            _console$h.log("images", this.#images);
        }
        else {
            _console$h.log("no images found");
            return;
        }
        let newStatus = "idle";
        if (this.#images.length == 2) {
            if (!this.#images[1].bootable) {
                _console$h.warn('Slot 1 has a invalid image. Click "Erase Image" to erase it or upload a different image');
            }
            else if (!this.#images[0].confirmed) {
                _console$h.log('Slot 0 has a valid image. Click "Confirm Image" to confirm it or wait and the device will swap images back.');
                newStatus = "testing";
            }
            else {
                if (this.#images[1].pending) {
                    _console$h.log("reset to upload to the new firmware image");
                    newStatus = "pending";
                }
                else {
                    _console$h.log("Slot 1 has a valid image. run testImage() to test it or upload a different image.");
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
                active: false,
                permanent: false,
            });
            _console$h.log("Select a firmware upload image to upload to slot 1.");
        }
        this.#updateStatus(newStatus);
        this.#dispatchEvent("firmwareImages", { firmwareImages: this.#images });
    }
}

const _console$g = createConsole("WebSocketUtils", { log: false });
const webSocketPingTimeout = 30_000;
const WebSocketMessageTypes$1 = ["ping", "pong", "serverMessage"];
function createWebSocketMessage$1(...messages) {
    _console$g.log("createWebSocketMessage", ...messages);
    return createMessage(WebSocketMessageTypes$1, true, ...messages);
}
const webSocketPingMessage = createWebSocketMessage$1("ping");
const webSocketPongMessage = createWebSocketMessage$1("pong");

const _console$f = createConsole("WebSocketConnectionManager", { log: false });
const WebSocketMessageTypes = [
    "ping",
    "pong",
    "batteryLevel",
    "deviceInformation",
    "message",
];
function createWebSocketMessage(...messages) {
    _console$f.log("createWebSocketMessage", ...messages);
    return createMessage(WebSocketMessageTypes, true, ...messages);
}
const WebSocketDeviceInformationMessageTypes = [
    "deviceInformation",
    "batteryLevel",
];
class WebSocketConnectionManager extends BaseConnectionManager {
    #bluetoothId;
    get bluetoothId() {
        return this.#bluetoothId ?? "";
    }
    defaultMtu = 2 ** 10;
    constructor(ipAddress = "192.168.4.1", isSecure = false, bluetoothId) {
        super();
        this.ipAddress = ipAddress;
        this.isSecure = isSecure;
        this.mtu = this.defaultMtu;
        this.#bluetoothId = bluetoothId;
    }
    get isAvailable() {
        return true;
    }
    static get isSupported() {
        return true;
    }
    static type = "webSocket";
    type = WebSocketConnectionManager.type;
    #webSocket;
    get webSocket() {
        return this.#webSocket;
    }
    set webSocket(newWebSocket) {
        if (this.#webSocket == newWebSocket) {
            _console$f.log("redundant webSocket assignment");
            return;
        }
        _console$f.log("assigning webSocket", newWebSocket);
        if (this.#webSocket) {
            removeEventListeners(this.#webSocket, this.#boundWebSocketEventListeners);
            if (this.#webSocket.readyState == this.#webSocket.OPEN) {
                this.#webSocket.close();
            }
        }
        if (newWebSocket) {
            addEventListeners(newWebSocket, this.#boundWebSocketEventListeners);
        }
        this.#webSocket = newWebSocket;
        _console$f.log("assigned webSocket");
    }
    #ipAddress;
    get ipAddress() {
        return this.#ipAddress;
    }
    set ipAddress(newIpAddress) {
        this.assertIsNotConnected();
        if (this.#ipAddress == newIpAddress) {
            _console$f.log(`redundnant ipAddress assignment "${newIpAddress}"`);
            return;
        }
        this.#ipAddress = newIpAddress;
        _console$f.log(`updated ipAddress to "${this.ipAddress}"`);
    }
    #isSecure = false;
    get isSecure() {
        return this.#isSecure;
    }
    set isSecure(newIsSecure) {
        this.assertIsNotConnected();
        if (this.#isSecure == newIsSecure) {
            _console$f.log(`redundant isSecure assignment ${newIsSecure}`);
            return;
        }
        this.#isSecure = newIsSecure;
        _console$f.log(`updated isSecure to "${this.isSecure}"`);
    }
    get url() {
        return `${this.isSecure ? "wss" : "ws"}://${this.ipAddress}/ws`;
    }
    async connect() {
        const canContinue = await super.connect();
        if (!canContinue) {
            return false;
        }
        try {
            this.webSocket = new WebSocket(this.url);
            return true;
        }
        catch (error) {
            _console$f.error("error connecting to webSocket", error);
            this.status = "notConnected";
            return false;
        }
    }
    async disconnect() {
        const canContinue = await super.disconnect();
        if (!canContinue) {
            return false;
        }
        _console$f.log("closing websocket");
        this.#pingTimer.stop();
        this.#webSocket?.close();
        return true;
    }
    get canReconnect() {
        return Boolean(this.webSocket);
    }
    async reconnect() {
        const canContinue = await super.reconnect();
        if (!canContinue) {
            return false;
        }
        this.webSocket = new WebSocket(this.url);
        return true;
    }
    async sendSmpMessage(data) {
        super.sendSmpMessage(data);
        _console$f.error("smp not supported on webSockets");
    }
    async sendTxData(data) {
        await super.sendTxData(data);
        if (data.byteLength == 0) {
            return;
        }
        this.#sendWebSocketMessage({ type: "message", data });
    }
    #sendMessage(message) {
        this.assertIsConnected();
        _console$f.log("sending webSocket message", message);
        this.#webSocket.send(message);
        this.#pingTimer.restart();
    }
    #sendWebSocketMessage(...messages) {
        this.#sendMessage(createWebSocketMessage(...messages));
    }
    #boundWebSocketEventListeners = {
        open: this.#onWebSocketOpen.bind(this),
        message: this.#onWebSocketMessage.bind(this),
        close: this.#onWebSocketClose.bind(this),
        error: this.#onWebSocketError.bind(this),
    };
    #onWebSocketOpen(event) {
        _console$f.log("webSocket.open", event);
        this.#pingTimer.start();
        this.status = "connected";
        this.#requestDeviceInformation();
    }
    async #onWebSocketMessage(event) {
        const arrayBuffer = await event.data.arrayBuffer();
        const dataView = new DataView(arrayBuffer);
        _console$f.log(`webSocket.message (${dataView.byteLength} bytes)`);
        this.#parseWebSocketMessage(dataView);
    }
    #onWebSocketClose(event) {
        _console$f.log("webSocket.close", event);
        this.status = "notConnected";
        this.#pingTimer.stop();
    }
    #onWebSocketError(event) {
        _console$f.error("webSocket.error", event);
    }
    #parseWebSocketMessage(dataView) {
        parseMessage(dataView, WebSocketMessageTypes, this.#onMessage.bind(this), null, true);
    }
    #onMessage(messageType, dataView) {
        _console$f.log(`received "${messageType}" message (${dataView.byteLength} bytes)`);
        switch (messageType) {
            case "ping":
                this.#pong();
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
                _console$f.error(`uncaught messageType "${messageType}"`);
                break;
        }
    }
    #pingTimer = new Timer(this.#ping.bind(this), webSocketPingTimeout - 1_000);
    #ping() {
        _console$f.log("pinging");
        this.#sendWebSocketMessage("ping");
    }
    #pong() {
        _console$f.log("ponging");
        this.#sendWebSocketMessage("pong");
    }
    #requestDeviceInformation() {
        this.#sendWebSocketMessage(...WebSocketDeviceInformationMessageTypes);
    }
    remove() {
        super.remove();
        this.webSocket = undefined;
    }
}

const _console$e = createConsole("UDPConnectionManager", { log: false });
const UDPSendPort = 3000;
const UDPPingInterval = 2_000;
const SocketMessageTypes = [
    "ping",
    "pong",
    "setRemoteReceivePort",
    "batteryLevel",
    "deviceInformation",
    "message",
];
function createSocketMessage(...messages) {
    _console$e.log("createSocketMessage", ...messages);
    return createMessage(SocketMessageTypes, true, ...messages);
}
const SocketDeviceInformationMessageTypes = [
    "deviceInformation",
    "batteryLevel",
];
class UDPConnectionManager extends BaseConnectionManager {
    #bluetoothId;
    get bluetoothId() {
        return this.#bluetoothId ?? "";
    }
    defaultMtu = 2 ** 10;
    constructor(ipAddress, bluetoothId, receivePort) {
        super();
        this.ipAddress = ipAddress;
        this.mtu = this.defaultMtu;
        this.#bluetoothId = bluetoothId;
        if (receivePort) {
            this.receivePort = receivePort;
        }
    }
    get isAvailable() {
        return true;
    }
    static get isSupported() {
        return isInNode;
    }
    static type = "udp";
    type = UDPConnectionManager.type;
    #ipAddress;
    get ipAddress() {
        return this.#ipAddress;
    }
    set ipAddress(newIpAddress) {
        this.assertIsNotConnected();
        if (this.#ipAddress == newIpAddress) {
            _console$e.log(`redundnant ipAddress assignment "${newIpAddress}"`);
            return;
        }
        this.#ipAddress = newIpAddress;
        _console$e.log(`updated ipAddress to "${this.ipAddress}"`);
    }
    #receivePort;
    get receivePort() {
        return this.#receivePort;
    }
    set receivePort(newReceivePort) {
        this.assertIsNotConnected();
        if (this.#receivePort == newReceivePort) {
            _console$e.log(`redundnant receivePort assignment ${newReceivePort}`);
            return;
        }
        this.#receivePort = newReceivePort;
        _console$e.log(`updated receivePort to ${this.#receivePort}`);
        if (this.#receivePort) {
            this.#setRemoteReceivePortDataView.setUint16(0, this.#receivePort, true);
        }
    }
    #didSetRemoteReceivePort = false;
    #setRemoteReceivePortDataView = new DataView(new ArrayBuffer(2));
    #parseReceivePort(dataView) {
        const parsedReceivePort = dataView.getUint16(0, true);
        if (parsedReceivePort != this.receivePort) {
            _console$e.error(`incorrect receivePort (expected ${this.receivePort}, got ${parsedReceivePort})`);
            return;
        }
        this.#didSetRemoteReceivePort = true;
    }
    #socket;
    get socket() {
        return this.#socket;
    }
    set socket(newSocket) {
        if (this.#socket == newSocket) {
            _console$e.log("redundant socket assignment");
            return;
        }
        _console$e.log("assigning socket", newSocket);
        if (this.#socket) {
            _console$e.log("removing existing socket...");
            removeEventListeners(this.#socket, this.#boundSocketEventListeners);
            try {
                this.#socket.close();
            }
            catch (error) {
                _console$e.error(error);
            }
        }
        if (newSocket) {
            addEventListeners(newSocket, this.#boundSocketEventListeners);
        }
        this.#socket = newSocket;
        _console$e.log("assigned socket");
    }
    #sendMessage(message) {
        _console$e.log("sending socket message", message);
        const dataView = Buffer.from(message);
        this.#socket.send(dataView);
        this.#pingTimer.restart();
    }
    #sendSocketMessage(...messages) {
        this.#sendMessage(createSocketMessage(...messages));
    }
    async sendSmpMessage(data) {
        super.sendSmpMessage(data);
        _console$e.error("smp not supported on udp");
    }
    async sendTxData(data) {
        super.sendTxData(data);
        if (data.byteLength == 0) {
            return;
        }
        this.#sendSocketMessage({ type: "message", data });
    }
    #boundSocketEventListeners = {
        close: this.#onSocketClose.bind(this),
        connect: this.#onSocketConnect.bind(this),
        error: this.#onSocketError.bind(this),
        listening: this.#onSocketListening.bind(this),
        message: this.#onSocketMessage.bind(this),
    };
    #onSocketClose() {
        _console$e.log("socket.close");
        this.status = "notConnected";
        this.clear();
    }
    #onSocketConnect() {
        _console$e.log("socket.connect");
        this.#pingTimer.start(true);
    }
    #onSocketError(error) {
        _console$e.error("socket.error", error);
    }
    #onSocketListening() {
        const address = this.socket.address();
        _console$e.log(`socket.listening on ${address.address}:${address.port}`);
        this.receivePort = address.port;
        this.socket.connect(UDPSendPort, this.ipAddress);
    }
    #onSocketMessage(message, remoteInfo) {
        this.#pongTimeoutTimer.stop();
        _console$e.log("socket.message", message.byteLength, remoteInfo);
        const arrayBuffer = message.buffer.slice(message.byteOffset, message.byteOffset + message.byteLength);
        const dataView = new DataView(arrayBuffer);
        this.#parseSocketMessage(dataView);
        if (this.status == "connecting" && this.#didSetRemoteReceivePort) {
            this.status = "connected";
            this.#requestDeviceInformation();
        }
    }
    #setupSocket() {
        this.#didSetRemoteReceivePort = false;
        this.socket = dgram.createSocket({
            type: "udp4",
        });
        try {
            if (this.receivePort) {
                this.socket.bind(this.receivePort);
            }
            else {
                this.socket.bind();
            }
        }
        catch (error) {
            _console$e.error(error);
            this.disconnect();
        }
    }
    async connect() {
        const canContinue = await super.connect();
        if (!canContinue) {
            return false;
        }
        this.#setupSocket();
        return true;
    }
    async disconnect() {
        const canContinue = await super.disconnect();
        if (!canContinue) {
            return false;
        }
        _console$e.log("closing socket");
        this.#pingTimer.stop();
        try {
            this.#socket?.close();
            return true;
        }
        catch (error) {
            _console$e.error(error);
            return false;
        }
    }
    get canReconnect() {
        return Boolean(this.socket);
    }
    async reconnect() {
        const canContinue = await super.reconnect();
        if (!canContinue) {
            return false;
        }
        this.#setupSocket();
        return true;
    }
    #parseSocketMessage(dataView) {
        parseMessage(dataView, SocketMessageTypes, this.#onMessage.bind(this), null, true);
    }
    #onMessage(messageType, dataView) {
        _console$e.log(`received "${messageType}" message (${dataView.byteLength} bytes)`);
        switch (messageType) {
            case "ping":
                this.#pong();
                break;
            case "pong":
                break;
            case "setRemoteReceivePort":
                this.#parseReceivePort(dataView);
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
                _console$e.error(`uncaught messageType "${messageType}"`);
                break;
        }
    }
    #pingTimer = new Timer(this.#ping.bind(this), UDPPingInterval);
    #ping() {
        _console$e.log("pinging");
        if (this.#didSetRemoteReceivePort || !this.#receivePort) {
            this.#sendSocketMessage("ping");
        }
        else {
            this.#sendSocketMessage({
                type: "setRemoteReceivePort",
                data: this.#setRemoteReceivePortDataView,
            });
        }
        if (this.isConnected) {
            this.#pongTimeoutTimer.start();
        }
    }
    #pong() {
        _console$e.log("ponging");
        this.#sendSocketMessage("pong");
    }
    #pongTimeout() {
        this.#pongTimeoutTimer.stop();
        _console$e.log("pong timeout");
        this.disconnect();
    }
    #pongTimeoutTimer = new Timer(() => this.#pongTimeout(), 1_000);
    #requestDeviceInformation() {
        this.#sendSocketMessage(...SocketDeviceInformationMessageTypes);
    }
    clear() {
        super.clear();
        this.#didSetRemoteReceivePort = false;
        this.#pingTimer.stop();
        this.#pongTimeoutTimer.stop();
    }
    remove() {
        super.remove();
        this.socket = undefined;
    }
}

var _a$2;
const _console$d = createConsole("Device", { log: false });
const DeviceEventTypes = [
    "connectionMessage",
    ...ConnectionEventTypes,
    ...MetaConnectionMessageTypes,
    ...BatteryLevelMessageTypes,
    ...InformationEventTypes,
    ...DeviceInformationEventTypes,
    ...SensorConfigurationEventTypes,
    ...SensorDataEventTypes,
    ...VibrationEventTypes,
    ...FileTransferEventTypes,
    ...TfliteEventTypes,
    ...WifiEventTypes,
    ...CameraEventTypes,
    ...MicrophoneEventTypes,
    ...DisplayEventTypes,
    ...SensorMetaDataEventTypes,
    ...LedEventTypes,
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
    "getVibrationLocations",
    "getFileTypes",
    "isWifiAvailable",
    "isDisplayAvailable",
    "getLedInformation",
];
class Device {
    static OnDevice;
    static OnDeviceConnectionStatusUpdated;
    get bluetoothId() {
        return this.#connectionManager?.bluetoothId;
    }
    get isAvailable() {
        return this.#connectionManager?.isAvailable;
    }
    constructor() {
        autoBind$1(this);
        this.#deviceInformationManager.eventDispatcher = this
            .#eventDispatcher;
        this._informationManager.sendMessage = this
            .sendTxMessages;
        this._informationManager.eventDispatcher = this
            .#eventDispatcher;
        this.#sensorConfigurationManager.sendMessage = this
            .sendTxMessages;
        this.#sensorConfigurationManager.eventDispatcher = this
            .#eventDispatcher;
        this.#sensorDataManager.eventDispatcher = this
            .#eventDispatcher;
        this.#vibrationManager.sendMessage = this
            .sendTxMessages;
        this.#vibrationManager.eventDispatcher = this
            .#eventDispatcher;
        this.#tfliteManager.sendMessage = this
            .sendTxMessages;
        this.#tfliteManager.eventDispatcher = this
            .#eventDispatcher;
        this.#fileTransferManager.sendMessage = this
            .sendTxMessages;
        this.#fileTransferManager.eventDispatcher = this
            .#eventDispatcher;
        this.#wifiManager.sendMessage = this
            .sendTxMessages;
        this.#wifiManager.eventDispatcher = this
            .#eventDispatcher;
        this.#cameraManager.sendMessage = this
            .sendTxMessages;
        this.#cameraManager.eventDispatcher = this
            .#eventDispatcher;
        this.#microphoneManager.sendMessage = this
            .sendTxMessages;
        this.#microphoneManager.eventDispatcher = this
            .#eventDispatcher;
        this.#displayManager.sendMessage = this
            .sendTxMessages;
        this.#displayManager.eventDispatcher = this
            .#eventDispatcher;
        this.#displayManager.sendFile = this.#fileTransferManager
            .send;
        this.#ledManager.sendMessage = this
            .sendTxMessages;
        this.#ledManager.eventDispatcher = this
            .#eventDispatcher;
        this.#firmwareManager.sendMessage = this
            .sendSmpMessage;
        this.#firmwareManager.eventDispatcher = this
            .#eventDispatcher;
        this.#initThisEventListeners();
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
    static #DefaultConnectionManager() {
        return new WebBluetoothConnectionManager();
    }
    #eventDispatcher = new EventDispatcher(this, DeviceEventTypes);
    get addEventListener() {
        return this.#eventDispatcher.addEventListener;
    }
    get #dispatchEvent() {
        return this.#eventDispatcher.dispatchEvent;
    }
    get removeEventListener() {
        return this.#eventDispatcher.removeEventListener;
    }
    get waitForEvent() {
        return this.#eventDispatcher.waitForEvent;
    }
    get removeEventListeners() {
        return this.#eventDispatcher.removeEventListeners;
    }
    removeAllEventListeners() {
        this.#eventDispatcher.removeAllEventListeners();
        this.#initThisEventListeners();
    }
    #initThisEventListeners() {
        this.addEventListener("getMtu", () => {
            _console$d.log("updating mtu...");
            this.#firmwareManager.mtu = this.mtu;
            this.#fileTransferManager.mtu = this.mtu;
            this.connectionManager.mtu = this.mtu;
            this.#displayManager.mtu = this.mtu;
        });
        this.addEventListener("getSensorConfiguration", () => {
            if (this.connectionType == "client") {
                return;
            }
            if (this.connectionStatus != "connecting") {
                return;
            }
            if (this.sensorTypes.includes("pressure")) {
                _console$d.log("requesting required pressure information");
                const messages = RequiredPressureMessageTypes.map((messageType) => ({
                    type: messageType,
                }));
                this.sendTxMessages(messages, false);
            }
            else {
                _console$d.log("don't need to request pressure infomration");
            }
            if (this.sensorTypes.includes("camera")) {
                _console$d.log("requesting required camera information");
                const messages = RequiredCameraMessageTypes.map((messageType) => ({
                    type: messageType,
                }));
                this.sendTxMessages(messages, false);
            }
            else {
                _console$d.log("don't need to request camera infomration");
            }
            if (this.sensorTypes.includes("microphone")) {
                _console$d.log("requesting required microphone information");
                const messages = RequiredMicrophoneMessageTypes.map((messageType) => ({
                    type: messageType,
                }));
                this.sendTxMessages(messages, false);
            }
            else {
                _console$d.log("don't need to request microphone infomration");
            }
            if (this.sensorTypes.includes("buttons") ||
                this.sensorTypes.includes("touches")) {
                _console$d.log("requesting number of buttons/touches");
                const messages = RequiredSensorMetaDataMessageTypes.map((messageType) => ({
                    type: messageType,
                }));
                this.sendTxMessages(messages, false);
            }
            else {
                _console$d.log("don't need to request number of buttons/touches");
            }
        });
        this.addEventListener("getSensorConfiguration", (event) => {
            const { sensorConfiguration } = event.message;
            this.#cameraManager.sensorRate = sensorConfiguration.camera ?? 0;
        });
        this.addEventListener("isDisplayAvailable", (event) => {
            if (this.connectionType == "client") {
                return;
            }
            if (this.connectionStatus != "connecting") {
                return;
            }
            if (this.isDisplayAvailable) {
                this.#displayManager.requestRequiredInformation();
            }
        });
        this.addEventListener("getFileTypes", () => {
            if (this.connectionType == "client") {
                return;
            }
            if (this.connectionStatus != "connecting") {
                return;
            }
            if (this.fileTypes.length > 0) {
                this.#fileTransferManager.requestRequiredInformation();
            }
            if (this.fileTypes.includes("tflite")) {
                this.#tfliteManager.requestRequiredInformation();
            }
        });
        this.addEventListener("isWifiAvailable", () => {
            if (this.connectionType == "client") {
                return;
            }
            if (this.connectionStatus != "connecting") {
                return;
            }
            if (this.isWifiAvailable) {
                this.#wifiManager.requestRequiredInformation();
            }
        });
        this.addEventListener("fileTransferProgress", (event) => {
            const { fileType, progress } = event.message;
            switch (fileType) {
                case "spriteSheet":
                    this.#dispatchEvent("displaySpriteSheetUploadProgress", {
                        spriteSheet: this.#displayManager.pendingSpriteSheet,
                        spriteSheetName: this.#displayManager.pendingSpriteSheetName,
                        progress,
                    });
                    break;
                case "cameraImage":
                    this.#dispatchEvent("cameraImageProgress", {
                        progress,
                        type: "image",
                    });
                    break;
            }
        });
        this.addEventListener("fileTransferStatus", (event) => {
            const { fileType, fileTransferStatus } = event.message;
            switch (fileType) {
                case "spriteSheet":
                    if (fileTransferStatus == "sending") {
                        this.#dispatchEvent("displaySpriteSheetUploadStart", {
                            spriteSheet: this.#displayManager.pendingSpriteSheet,
                            spriteSheetName: this.#displayManager.pendingSpriteSheetName,
                        });
                    }
                    break;
            }
        });
        this.addEventListener("fileReceived", async (event) => {
            const { fileType, file } = event.message;
            switch (fileType) {
                case "cameraImage":
                    {
                        const arrayBuffer = await file.arrayBuffer();
                        const dataView = new DataView(arrayBuffer);
                        this.#cameraManager.parseMessage("cameraData", dataView);
                    }
                    break;
            }
        });
        _a$2.OnDevice(this);
    }
    #connectionManager;
    get connectionManager() {
        return this.#connectionManager;
    }
    set connectionManager(newConnectionManager) {
        if (this.connectionManager == newConnectionManager) {
            _console$d.log("same connectionManager is already assigned");
            return;
        }
        if (this.connectionManager) {
            this.connectionManager.remove();
        }
        if (newConnectionManager) {
            newConnectionManager.onStatusUpdated =
                this.#onConnectionStatusUpdated.bind(this);
            newConnectionManager.onMessageReceived =
                this.#onConnectionMessageReceived.bind(this);
            newConnectionManager.onMessagesReceived =
                this.#onConnectionMessagesReceived.bind(this);
            newConnectionManager.onMessageSent =
                this.#onConnectionMessageSent.bind(this);
            newConnectionManager.onMessagesSent =
                this.#onConnectionMessagesSent.bind(this);
        }
        this.#connectionManager = newConnectionManager;
        _console$d.log("assigned new connectionManager", this.#connectionManager);
        this._informationManager.connectionType = this.connectionType;
    }
    async #sendTxMessages(messages, sendImmediately = true) {
        _console$d.log("sendTxMessages", messages, { sendImmediately });
        await this.#connectionManager?.sendTxMessages(messages, sendImmediately);
        if (sendImmediately) {
            this.#ledManager.onSendTxMessages();
        }
    }
    sendTxMessages = this.#sendTxMessages.bind(this);
    async connect(options) {
        if (this.isConnected) {
            _console$d.log("already connected");
            return;
        }
        if (this.connectionStatus == "connecting") {
            _console$d.log("already connecting");
            return;
        }
        if (options?.reconnect && this.canReconnect) {
            return this.reconnect();
        }
        _console$d.log("connect options", options);
        if (options) {
            switch (options.type) {
                case "webBluetooth":
                    if (this.connectionManager?.type != "webBluetooth") {
                        this.connectionManager = new WebBluetoothConnectionManager();
                    }
                    break;
                case "webSocket":
                    {
                        let createConnectionManager = false;
                        if (this.connectionManager?.type == "webSocket") {
                            if (this.connectionManager.ipAddress != options.ipAddress ||
                                this.connectionManager.isSecure != options.isWifiSecure) {
                                createConnectionManager = true;
                            }
                        }
                        else {
                            createConnectionManager = true;
                        }
                        if (createConnectionManager) {
                            this.connectionManager = new WebSocketConnectionManager(options.ipAddress, options.isWifiSecure, this.bluetoothId);
                        }
                    }
                    break;
                case "udp":
                    {
                        let createConnectionManager = false;
                        if (this.connectionManager?.type == "udp") {
                            if (this.connectionManager.ipAddress != options.ipAddress) {
                                createConnectionManager = true;
                            }
                            this.reconnectOnDisconnection = true;
                        }
                        else {
                            createConnectionManager = true;
                        }
                        if (createConnectionManager) {
                            this.connectionManager = new UDPConnectionManager(options.ipAddress, this.bluetoothId);
                        }
                    }
                    break;
            }
        }
        if (!this.connectionManager) {
            this.connectionManager = _a$2.#DefaultConnectionManager();
        }
        this.#clear();
        if (options?.type == "client") {
            _console$d.assertWithError(this.connectionManager.type == "client", "expected clientConnectionManager");
            if (this.connectionManager.type == "client") {
                this.connectionManager.subType = options.subType;
                return this.connectionManager.connect();
            }
        }
        _console$d.log("connectionManager type", this.connectionManager.type);
        return this.connectionManager.connect();
    }
    #isConnected = false;
    get isConnected() {
        return this.#isConnected;
    }
    #assertIsConnected() {
        _console$d.assertWithError(this.isConnected, "notConnected");
    }
    #didReceiveMessageTypes(messageTypes) {
        return messageTypes.every((messageType) => {
            let hasConnectionMessage = this.latestConnectionMessages.has(messageType);
            if (!hasConnectionMessage) {
                if (messageType == "getLedInformation" ||
                    messageType == "isDisplayAvailable") {
                    hasConnectionMessage = true;
                }
                else {
                    _console$d.log(`didn't receive "${messageType}" message`);
                }
            }
            return hasConnectionMessage;
        });
    }
    get #hasRequiredInformation() {
        let hasRequiredInformation = this.#didReceiveMessageTypes(RequiredInformationConnectionMessages);
        if (hasRequiredInformation && this.sensorTypes.includes("pressure")) {
            hasRequiredInformation = this.#didReceiveMessageTypes(RequiredPressureMessageTypes);
        }
        if (hasRequiredInformation && this.isWifiAvailable) {
            hasRequiredInformation = this.#didReceiveMessageTypes(RequiredWifiMessageTypes);
        }
        if (hasRequiredInformation && this.fileTypes.length > 0) {
            hasRequiredInformation = this.#didReceiveMessageTypes(RequiredFileTransferMessageTypes);
        }
        if (hasRequiredInformation && this.fileTypes.includes("tflite")) {
            hasRequiredInformation = this.#didReceiveMessageTypes(RequiredTfliteMessageTypes);
        }
        if (hasRequiredInformation && this.hasCamera) {
            hasRequiredInformation = this.#didReceiveMessageTypes(RequiredCameraMessageTypes);
        }
        if (hasRequiredInformation && this.hasMicrophone) {
            hasRequiredInformation = this.#didReceiveMessageTypes(RequiredMicrophoneMessageTypes);
        }
        if (hasRequiredInformation && this.isDisplayAvailable) {
            hasRequiredInformation = this.#didReceiveMessageTypes(RequiredDisplayMessageTypes);
        }
        return hasRequiredInformation;
    }
    #requestRequiredInformation() {
        _console$d.log("requesting required information");
        const messages = RequiredInformationConnectionMessages.map((messageType) => ({
            type: messageType,
        }));
        this.#sendTxMessages(messages);
    }
    get canReconnect() {
        return this.connectionManager?.canReconnect;
    }
    #assertCanReconnect() {
        _console$d.assertWithError(this.canReconnect, "cannot reconnect to device");
    }
    async reconnect() {
        if (this.isConnected) {
            _console$d.log("already connected");
            return;
        }
        if (this.connectionStatus == "connecting") {
            _console$d.log("already connecting");
            return;
        }
        if (!this.canReconnect) {
            _console$d.warn("cannot reconnect");
            return false;
        }
        _console$d.log("attempting to reconnect...");
        this.#clear();
        _console$d.log("reconnecting...");
        return this.connectionManager?.reconnect();
    }
    static async Connect() {
        const device = new _a$2();
        await device.connect();
        return device;
    }
    static #ReconnectOnDisconnection = false;
    static get ReconnectOnDisconnection() {
        return this.#ReconnectOnDisconnection;
    }
    static set ReconnectOnDisconnection(newReconnectOnDisconnection) {
        _console$d.assertTypeWithError(newReconnectOnDisconnection, "boolean");
        this.#ReconnectOnDisconnection = newReconnectOnDisconnection;
    }
    #reconnectOnDisconnection = _a$2.ReconnectOnDisconnection;
    get reconnectOnDisconnection() {
        return this.#reconnectOnDisconnection;
    }
    set reconnectOnDisconnection(newReconnectOnDisconnection) {
        _console$d.assertTypeWithError(newReconnectOnDisconnection, "boolean");
        this.#reconnectOnDisconnection = newReconnectOnDisconnection;
    }
    #reconnectIntervalId;
    get connectionType() {
        return this.connectionManager?.type;
    }
    async disconnect() {
        if (this.connectionStatus == "notConnected") {
            _console$d.log("already not connected");
            return;
        }
        if (this.connectionStatus == "disconnecting") {
            _console$d.log("already disconnecting");
            return;
        }
        if (this.reconnectOnDisconnection) {
            this.reconnectOnDisconnection = false;
            this.addEventListener("isConnected", () => {
                this.reconnectOnDisconnection = true;
            }, { once: true });
        }
        return this.connectionManager.disconnect();
    }
    async toggleConnection(arg = true) {
        let options;
        let reconnect = true;
        switch (typeof arg) {
            case "boolean":
                reconnect = Boolean(arg);
                break;
            case "object":
                options = arg;
                reconnect = false;
                break;
            default:
                _console$d.error("uncaught toggleConnection param", arg);
                break;
        }
        _console$d.log("reconnect", { reconnect, options });
        switch (this.connectionStatus) {
            case "connecting":
            case "connected":
                await this.disconnect();
                break;
            case "disconnecting":
                break;
            case "notConnected":
                if (reconnect && this.canReconnect) {
                    try {
                        await this.reconnect();
                    }
                    catch (error) {
                        _console$d.error("error trying to reconnect", error);
                        await this.connect(options);
                    }
                }
                else {
                    await this.connect(options);
                }
                break;
        }
    }
    get connectionStatus() {
        switch (this.#connectionManager?.status) {
            case "connected":
                return this.isConnected ? "connected" : "connecting";
            case "notConnected":
            case "connecting":
            case "disconnecting":
                return this.#connectionManager.status;
            default:
                return "notConnected";
        }
    }
    get isConnectionBusy() {
        return (this.connectionStatus == "connecting" ||
            this.connectionStatus == "disconnecting");
    }
    async #onConnectionStatusUpdated(connectionStatus) {
        _console$d.log({ connectionStatus });
        if (connectionStatus == "notConnected") {
            this.#clearConnection();
            await this.stopRecordingCamera();
            this.stopRecordingMicrophone();
            if (this.canReconnect && this.reconnectOnDisconnection) {
                _console$d.log("starting reconnect interval...");
                this.#reconnectIntervalId = setInterval(() => {
                    _console$d.log("attempting reconnect...");
                    this.reconnect();
                }, 1000);
            }
        }
        else {
            if (this.#reconnectIntervalId != undefined) {
                _console$d.log("clearing reconnect interval");
                clearInterval(this.#reconnectIntervalId);
                this.#reconnectIntervalId = undefined;
            }
        }
        this.#checkConnection();
        if (connectionStatus == "connected" && !this.#isConnected) {
            if (this.connectionType != "client") {
                this.#requestRequiredInformation();
            }
        }
        _a$2.OnDeviceConnectionStatusUpdated(this, connectionStatus);
    }
    #dispatchConnectionEvents(includeIsConnected = false) {
        this.#dispatchEvent("connectionStatus", {
            connectionStatus: this.connectionStatus,
        });
        this.#dispatchEvent(this.connectionStatus, {});
        if (includeIsConnected) {
            this.#dispatchEvent("isConnected", { isConnected: this.isConnected });
        }
    }
    #checkConnection() {
        this.#isConnected =
            Boolean(this.connectionManager?.isConnected) &&
                this.#hasRequiredInformation &&
                this._informationManager.isCurrentTimeSet;
        switch (this.connectionStatus) {
            case "connected":
                if (this.#isConnected) {
                    this.#dispatchConnectionEvents(true);
                }
                break;
            case "notConnected":
                this.#dispatchConnectionEvents(true);
                break;
            default:
                this.#dispatchConnectionEvents(false);
                break;
        }
    }
    #clear() {
        this.#clearConnection();
        this._informationManager.clear();
        this.#deviceInformationManager.clear();
        this.#tfliteManager.clear();
        this.#fileTransferManager.clear();
        this.#wifiManager.clear();
        this.#cameraManager.clear();
        this.#microphoneManager.clear();
        this.#sensorDataManager.clear();
        this.#sensorConfigurationManager.clear();
        this.#displayManager.reset();
        this.#ledManager.clear();
        this.#batteryLevel = undefined;
    }
    #clearConnection() {
        _console$d.log("clearConnection");
        this.connectionManager?.clear();
        this.latestConnectionMessages.clear();
    }
    #onConnectionMessageReceived(messageType, dataView, isSending) {
        _console$d.log({ messageType, dataView, isSending });
        switch (messageType) {
            case "batteryLevel":
                const batteryLevel = dataView.getUint8(0);
                _console$d.log("received battery level", { batteryLevel });
                this.#updateBatteryLevel(batteryLevel);
                break;
            default:
                if (FileTransferMessageTypes.includes(messageType)) {
                    this.#fileTransferManager.parseMessage(messageType, dataView, isSending);
                }
                else if (TfliteMessageTypes.includes(messageType)) {
                    this.#tfliteManager.parseMessage(messageType, dataView, isSending);
                }
                else if (SensorDataMessageTypes.includes(messageType)) {
                    this.#sensorDataManager.parseMessage(messageType, dataView, isSending);
                }
                else if (SensorMetaDataMessageTypes.includes(messageType)) {
                    this.#sensorDataManager.parseMessage(messageType, dataView, isSending);
                }
                else if (FirmwareMessageTypes.includes(messageType)) {
                    this.#firmwareManager.parseMessage(messageType, dataView, isSending);
                }
                else if (DeviceInformationTypes.includes(messageType)) {
                    this.#deviceInformationManager.parseMessage(messageType, dataView, isSending);
                }
                else if (InformationMessageTypes.includes(messageType)) {
                    this._informationManager.parseMessage(messageType, dataView, isSending);
                }
                else if (SensorConfigurationMessageTypes.includes(messageType)) {
                    this.#sensorConfigurationManager.parseMessage(messageType, dataView, isSending);
                }
                else if (VibrationMessageTypes.includes(messageType)) {
                    this.#vibrationManager.parseMessage(messageType, dataView, isSending);
                }
                else if (WifiMessageTypes.includes(messageType)) {
                    this.#wifiManager.parseMessage(messageType, dataView, isSending);
                }
                else if (CameraMessageTypes.includes(messageType)) {
                    this.#cameraManager.parseMessage(messageType, dataView, isSending);
                }
                else if (MicrophoneMessageTypes.includes(messageType)) {
                    this.#microphoneManager.parseMessage(messageType, dataView, isSending);
                }
                else if (DisplayMessageTypes.includes(messageType)) {
                    this.#displayManager.parseMessage(messageType, dataView, isSending);
                }
                else if (LedMessageTypes.includes(messageType)) {
                    this.#ledManager.parseMessage(messageType, dataView, isSending);
                }
                else {
                    throw Error(`uncaught messageType ${messageType}`);
                }
        }
        if (isSending) {
            return;
        }
        this.latestConnectionMessages.set(messageType, dataView);
        if (messageType.startsWith("set")) {
            this.latestConnectionMessages.set(
            messageType.replace("set", "get"), dataView);
        }
        this.#dispatchEvent("connectionMessage", { messageType, dataView });
    }
    #onConnectionMessagesReceived() {
        if (!this.isConnected && this.#hasRequiredInformation) {
            this.#checkConnection();
        }
        if (this.connectionStatus == "notConnected" ||
            this.connectionStatus == "disconnecting") {
            return;
        }
        this.#sendTxMessages();
    }
    _onRemoteConnectionMessageSent(messageType, dataView) {
        _console$d.log("_onConnectionMessageSent", { messageType }, dataView);
        this.#onConnectionMessageReceived(messageType, dataView, true);
    }
    #onConnectionMessageSent(message) {
        _console$d.log("onConnectionMessageSent", message);
    }
    #onConnectionMessagesSent(messages) {
        _console$d.log("onConnectionMessagesSent", messages);
    }
    latestConnectionMessages = new Map();
    #deviceInformationManager = new DeviceInformationManager();
    get deviceInformation() {
        return this.#deviceInformationManager.information;
    }
    #batteryLevel = undefined;
    get batteryLevel() {
        return this.#batteryLevel ?? 0;
    }
    #updateBatteryLevel(updatedBatteryLevel) {
        _console$d.assertTypeWithError(updatedBatteryLevel, "number");
        if (this.#batteryLevel == updatedBatteryLevel) {
            _console$d.log(`duplicate batteryLevel assignment ${updatedBatteryLevel}`);
            return;
        }
        this.#batteryLevel = updatedBatteryLevel;
        _console$d.log({ updatedBatteryLevel: this.#batteryLevel });
        this.#dispatchEvent("batteryLevel", { batteryLevel: this.#batteryLevel });
    }
    _informationManager = new InformationManager();
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
    get isGlasses() {
        return this._informationManager.isGlasses;
    }
    get isGeneric() {
        return this._informationManager.isGeneric;
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
    #sensorConfigurationManager = new SensorConfigurationManager();
    get sensorConfiguration() {
        return this.#sensorConfigurationManager.configuration;
    }
    get setSensorConfiguration() {
        this.#assertIsConnected();
        return this.#sensorConfigurationManager.setConfiguration;
    }
    get toggleSensor() {
        this.#assertIsConnected();
        return this.#sensorConfigurationManager.toggleSensor;
    }
    get availableSensorTypes() {
        return this.#sensorConfigurationManager.availableSensorTypes;
    }
    get hasSensorType() {
        return this.#sensorConfigurationManager.hasSensorType;
    }
    async clearSensorConfiguration() {
        this.#assertIsConnected();
        return this.#sensorConfigurationManager.clearSensorConfiguration();
    }
    static #ClearSensorConfigurationOnLeave = false;
    static get ClearSensorConfigurationOnLeave() {
        return this.#ClearSensorConfigurationOnLeave;
    }
    static set ClearSensorConfigurationOnLeave(newClearSensorConfigurationOnLeave) {
        _console$d.assertTypeWithError(newClearSensorConfigurationOnLeave, "boolean");
        this.#ClearSensorConfigurationOnLeave = newClearSensorConfigurationOnLeave;
    }
    #clearSensorConfigurationOnLeave = _a$2.ClearSensorConfigurationOnLeave;
    get clearSensorConfigurationOnLeave() {
        return this.#clearSensorConfigurationOnLeave;
    }
    set clearSensorConfigurationOnLeave(newClearSensorConfigurationOnLeave) {
        _console$d.assertTypeWithError(newClearSensorConfigurationOnLeave, "boolean");
        this.#clearSensorConfigurationOnLeave = newClearSensorConfigurationOnLeave;
    }
    #sensorDataManager = new SensorDataManager();
    #assertPressure() {
        _console$d.assertWithError(this.hasSensorType("pressure"), "pressure sensorType not included in device");
    }
    get numberOfPressureSensors() {
        if (this.hasSensorType("pressure")) {
            return this.#sensorDataManager.pressureSensorDataManager.numberOfSensors;
        }
        else {
            return 0;
        }
    }
    get pressureSensorPositions() {
        if (this.hasSensorType("pressure")) {
            return this.#sensorDataManager.pressureSensorDataManager.positions;
        }
        else {
            return [];
        }
    }
    get autoPressureRange() {
        return this.#sensorDataManager.pressureSensorDataManager.autoRange;
    }
    get setPressureAutoRange() {
        return this.#sensorDataManager.pressureSensorDataManager.setAutoRange;
    }
    get togglePressureAutoRange() {
        return this.#sensorDataManager.pressureSensorDataManager.toggleAutoRange;
    }
    get autoPressureMotionRange() {
        return this.#sensorDataManager.pressureSensorDataManager.motionAutoRange;
    }
    get setPressureMotionAutoRange() {
        return this.#sensorDataManager.pressureSensorDataManager.setMotionAutoRange;
    }
    get togglePressureMotionAutoRange() {
        return this.#sensorDataManager.pressureSensorDataManager
            .toggleMotionAutoRange;
    }
    get resetPressureRange() {
        return this.#sensorDataManager.pressureSensorDataManager.resetRange;
    }
    get canCalibratePressure() {
        return this.#sensorDataManager.pressureSensorDataManager.canCalibrate;
    }
    get isRecordingPressureCalibrationData() {
        return this.#sensorDataManager.pressureSensorDataManager
            .isRecordingCalibrationData;
    }
    get isTrainingPressureCalibrationModel() {
        return this.#sensorDataManager.pressureSensorDataManager
            .isTrainingCalibrationModel;
    }
    get startRecordingPressureCalibrationData() {
        return this.#sensorDataManager.pressureSensorDataManager
            .startRecordingCalibrationData;
    }
    get stopRecordingPressureCalibrationData() {
        return this.#sensorDataManager.pressureSensorDataManager
            .stopRecordingCalibrationData;
    }
    toggleRecordingPressureCalibrationData() {
        this.#sensorDataManager.pressureSensorDataManager.toggleRecordingCalibrationData();
    }
    get pressureCalibrationModel() {
        return this.#sensorDataManager.pressureSensorDataManager.calibrationModel;
    }
    get isPressureCalibrationModelTrained() {
        return this.#sensorDataManager.pressureSensorDataManager
            .isCalibrationModelTrained;
    }
    async trainPressureCalibrationModel() {
        await this.#sensorDataManager.pressureSensorDataManager.train();
    }
    get savePressureCalibrationModel() {
        return this.#sensorDataManager.pressureSensorDataManager
            .saveCalibrationModel;
    }
    get loadPressureCalibrationModel() {
        return this.#sensorDataManager.pressureSensorDataManager
            .loadCalibrationModel;
    }
    get addPressureCalibrationModelData() {
        return this.#sensorDataManager.pressureSensorDataManager
            .addCalibrationModelData;
    }
    get clearPressureCalibrationModelData() {
        return this.#sensorDataManager.pressureSensorDataManager
            .clearCalibrationModelData;
    }
    get pressureCalibrationModelData() {
        return this.#sensorDataManager.pressureSensorDataManager
            .calibrationModelData;
    }
    get hasButtons() {
        return this.numberOfButtons > 0;
    }
    get numberOfButtons() {
        return this.#sensorDataManager.buttonSensorDataManager.numberOfButtons;
    }
    get hasTouches() {
        return this.numberOfTouches > 0;
    }
    get numberOfTouches() {
        return this.#sensorDataManager.touchSensorDataManager.numberOfTouches;
    }
    get vibrationLocations() {
        return this.#vibrationManager.vibrationLocations;
    }
    get hasVibration() {
        return this.vibrationLocations.length > 0;
    }
    #vibrationManager = new VibrationManager();
    get triggerVibration() {
        return this.#vibrationManager.triggerVibration;
    }
    #fileTransferManager = new FileTransferManager();
    get fileTypes() {
        return this.#fileTransferManager.fileTypes;
    }
    get maxFileLength() {
        return this.#fileTransferManager.maxLength;
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
        _console$d.assertWithError(this.validFileTypes.includes(fileType), `invalid fileType ${fileType}`);
        const promise = this.waitForEvent("fileTransferComplete");
        this.#fileTransferManager.send(fileType, file);
        await promise;
    }
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
    #tfliteManager = new TfliteManager();
    get isTfliteAvailable() {
        return this.fileTypes.includes("tflite");
    }
    get tfliteName() {
        return this.#tfliteManager.name;
    }
    get setTfliteName() {
        return this.#tfliteManager.setName;
    }
    async sendTfliteConfiguration(configuration) {
        configuration.type = "tflite";
        this.#tfliteManager.sendConfiguration(configuration, false);
        const didSendFile = await this.#fileTransferManager.send(configuration.type, configuration.file);
        _console$d.log({ didSendFile });
        if (!didSendFile) {
            this.#sendTxMessages();
            if (this.tfliteIsReady) {
                this.#dispatchEvent("tfliteIsReady", {
                    tfliteIsReady: this.tfliteIsReady,
                });
            }
        }
    }
    get tfliteClasses() {
        return this.#tfliteManager.classes;
    }
    get setTfliteClasses() {
        return this.#tfliteManager.setClasses;
    }
    get tfliteTask() {
        return this.#tfliteManager.task;
    }
    get setTfliteTask() {
        return this.#tfliteManager.setTask;
    }
    get tfliteSampleRate() {
        return this.#tfliteManager.sampleRate;
    }
    get setTfliteSampleRate() {
        return this.#tfliteManager.setSampleRate;
    }
    get tfliteSensorTypes() {
        return this.#tfliteManager.sensorTypes;
    }
    get allowedTfliteSensorTypes() {
        return this.sensorTypes.filter((sensorType) => TfliteSensorTypes.includes(sensorType));
    }
    get setTfliteSensorTypes() {
        return this.#tfliteManager.setSensorTypes;
    }
    get tfliteIsReady() {
        return this.#tfliteManager.isReady;
    }
    get tfliteInferencingEnabled() {
        return this.#tfliteManager.inferencingEnabled;
    }
    get setTfliteInferencingEnabled() {
        return this.#tfliteManager.setInferencingEnabled;
    }
    async enableTfliteInferencing() {
        return this.setTfliteInferencingEnabled(true);
    }
    async disableTfliteInferencing() {
        return this.setTfliteInferencingEnabled(false);
    }
    get toggleTfliteInferencing() {
        return this.#tfliteManager.toggleInferencingEnabled;
    }
    get tfliteCaptureDelay() {
        return this.#tfliteManager.captureDelay;
    }
    get setTfliteCaptureDelay() {
        return this.#tfliteManager.setCaptureDelay;
    }
    get tfliteThreshold() {
        return this.#tfliteManager.threshold;
    }
    get setTfliteThreshold() {
        return this.#tfliteManager.setThreshold;
    }
    #firmwareManager = new FirmwareManager();
    get canUpdateFirmware() {
        return this.#connectionManager?.canUpdateFirmware;
    }
    #assertCanUpdateFirmware() {
        _console$d.assertWithError(this.canUpdateFirmware, "can't update firmware");
    }
    #sendSmpMessage(data) {
        this.#assertCanUpdateFirmware();
        return this.#connectionManager.sendSmpMessage(data);
    }
    sendSmpMessage = this.#sendSmpMessage.bind(this);
    get uploadFirmware() {
        this.#assertCanUpdateFirmware();
        return this.#firmwareManager.uploadFirmware;
    }
    get canReset() {
        return this.canUpdateFirmware;
    }
    async reset() {
        _console$d.assertWithError(this.canReset, "reset is not enabled for this device");
        await this.#firmwareManager.reset();
        return this.#connectionManager.disconnect();
    }
    get firmwareStatus() {
        return this.#firmwareManager.status;
    }
    get getFirmwareImages() {
        this.#assertCanUpdateFirmware();
        return this.#firmwareManager.getImages;
    }
    get firmwareImages() {
        return this.#firmwareManager.images;
    }
    get eraseFirmwareImage() {
        this.#assertCanUpdateFirmware();
        return this.#firmwareManager.eraseImage;
    }
    get confirmFirmwareImage() {
        this.#assertCanUpdateFirmware();
        return this.#firmwareManager.confirmImage;
    }
    get testFirmwareImage() {
        this.#assertCanUpdateFirmware();
        return this.#firmwareManager.testImage;
    }
    #wifiManager = new WifiManager();
    get isWifiAvailable() {
        return this.#wifiManager.isWifiAvailable;
    }
    get wifiSSID() {
        return this.#wifiManager.wifiSSID;
    }
    async setWifiSSID(newWifiSSID) {
        return this.#wifiManager.setWifiSSID(newWifiSSID);
    }
    get wifiPassword() {
        return this.#wifiManager.wifiPassword;
    }
    async setWifiPassword(newWifiPassword) {
        return this.#wifiManager.setWifiPassword(newWifiPassword);
    }
    get isWifiConnected() {
        return this.#wifiManager.isWifiConnected;
    }
    get ipAddress() {
        return this.#wifiManager.ipAddress;
    }
    get wifiConnectionEnabled() {
        return this.#wifiManager.wifiConnectionEnabled;
    }
    get enableWifiConnection() {
        return this.#wifiManager.enableWifiConnection;
    }
    get setWifiConnectionEnabled() {
        return this.#wifiManager.setWifiConnectionEnabled;
    }
    get disableWifiConnection() {
        return this.#wifiManager.disableWifiConnection;
    }
    get toggleWifiConnection() {
        return this.#wifiManager.toggleWifiConnection;
    }
    get isWifiSecure() {
        return this.#wifiManager.isWifiSecure;
    }
    async reconnectViaWebSockets() {
        _console$d.assertWithError(this.isWifiConnected, "wifi is not connected");
        _console$d.assertWithError(this.connectionType != "webSocket", "already connected via webSockets");
        _console$d.assertTypeWithError(this.ipAddress, "string");
        _console$d.log("reconnecting via websockets...");
        await this.disconnect();
        await this.connect({
            type: "webSocket",
            ipAddress: this.ipAddress,
            isWifiSecure: this.isWifiSecure,
        });
    }
    async reconnectViaUDP() {
        _console$d.assertWithError(isInNode, "udp is only available in node");
        _console$d.assertWithError(this.isWifiConnected, "wifi is not connected");
        _console$d.assertWithError(this.connectionType != "udp", "already connected via udp");
        _console$d.assertTypeWithError(this.ipAddress, "string");
        _console$d.log("reconnecting via udp...");
        await this.disconnect();
        await this.connect({
            type: "udp",
            ipAddress: this.ipAddress,
        });
    }
    #cameraManager = new CameraManager();
    get _buildCameraData() {
        return this.#cameraManager.buildCameraData;
    }
    get hasCamera() {
        return this.sensorTypes.includes("camera");
    }
    get cameraStatus() {
        return this.#cameraManager.cameraStatus;
    }
    #assertHasCamera() {
        _console$d.assertWithError(this.hasCamera, "camera not available");
    }
    async takePicture(sensorRate) {
        this.#assertHasCamera();
        if (sensorRate == undefined && this.sensorConfiguration.camera == 0) {
            sensorRate = 20;
        }
        if (sensorRate != undefined &&
            this.sensorConfiguration.camera != sensorRate) {
            this.setSensorConfiguration({ camera: sensorRate }, false, false);
        }
        await this.#cameraManager.takePicture();
    }
    get autoPicture() {
        return this.#cameraManager.autoPicture;
    }
    set autoPicture(newAutoPicture) {
        this.#cameraManager.autoPicture = newAutoPicture;
    }
    async focusCamera(sensorRate) {
        this.#assertHasCamera();
        if (sensorRate == undefined && this.sensorConfiguration.camera == 0) {
            sensorRate = 20;
        }
        if (sensorRate != undefined &&
            this.sensorConfiguration.camera != sensorRate) {
            this.setSensorConfiguration({ camera: sensorRate }, false, false);
        }
        await this.#cameraManager.focus();
    }
    async stopCamera() {
        this.#assertHasCamera();
        await this.#cameraManager.stop();
    }
    async wakeCamera() {
        this.#assertHasCamera();
        await this.#cameraManager.wake();
    }
    async sleepCamera() {
        this.#assertHasCamera();
        await this.#cameraManager.sleep();
    }
    get cameraConfiguration() {
        return this.#cameraManager.cameraConfiguration;
    }
    get availableCameraConfigurationTypes() {
        return this.#cameraManager.availableCameraConfigurationTypes;
    }
    get cameraConfigurationRanges() {
        return this.#cameraManager.cameraConfigurationRanges;
    }
    get setCameraConfiguration() {
        return this.#cameraManager.setCameraConfiguration;
    }
    get isRecordingCamera() {
        return this.#cameraManager.isRecording;
    }
    get startRecordingCamera() {
        return this.#cameraManager.startRecording;
    }
    get stopRecordingCamera() {
        return this.#cameraManager.stopRecording;
    }
    get toggleCameraRecording() {
        return this.#cameraManager.toggleRecording;
    }
    #microphoneManager = new MicrophoneManager();
    get hasMicrophone() {
        return this.sensorTypes.includes("microphone");
    }
    get microphoneStatus() {
        return this.#microphoneManager.microphoneStatus;
    }
    #assertHasMicrophone() {
        _console$d.assertWithError(this.hasMicrophone, "microphone not available");
    }
    async startMicrophone(sensorRate) {
        this.#assertHasMicrophone();
        if (sensorRate == undefined && this.sensorConfiguration.microphone == 0) {
            sensorRate = 5;
        }
        if (sensorRate != undefined &&
            this.sensorConfiguration.microphone != sensorRate) {
            this.setSensorConfiguration({ microphone: sensorRate }, false, false);
        }
        await this.#microphoneManager.start();
    }
    async stopMicrophone() {
        this.#assertHasMicrophone();
        await this.#microphoneManager.stop();
    }
    async enableMicrophoneVad() {
        this.#assertHasMicrophone();
        await this.#microphoneManager.vad();
    }
    async toggleMicrophone(sensorRate = 20) {
        this.#assertHasMicrophone();
        if (this.sensorConfiguration.microphone == 0 &&
            this.sensorConfiguration.microphone != sensorRate) {
            this.setSensorConfiguration({ microphone: sensorRate }, false, false);
        }
        await this.#microphoneManager.toggle();
    }
    get microphoneConfiguration() {
        return this.#microphoneManager.microphoneConfiguration;
    }
    get availableMicrophoneConfigurationTypes() {
        return this.#microphoneManager.availableMicrophoneConfigurationTypes;
    }
    get setMicrophoneConfiguration() {
        return this.#microphoneManager.setMicrophoneConfiguration;
    }
    #assertWebAudioSupport() {
        _console$d.assertWithError(AudioContext, "WebAudio is not supported");
    }
    get audioContext() {
        this.#assertWebAudioSupport();
        return this.#microphoneManager.audioContext;
    }
    set audioContext(newAudioContext) {
        this.#assertWebAudioSupport();
        this.#microphoneManager.audioContext = newAudioContext;
    }
    get microphoneMediaStreamDestination() {
        this.#assertWebAudioSupport();
        return this.#microphoneManager.mediaStreamDestination;
    }
    get microphoneGainNode() {
        this.#assertWebAudioSupport();
        return this.#microphoneManager.gainNode;
    }
    get isRecordingMicrophone() {
        return this.#microphoneManager.isRecording;
    }
    startRecordingMicrophone() {
        this.#microphoneManager.startRecording();
    }
    stopRecordingMicrophone() {
        this.#microphoneManager.stopRecording();
    }
    toggleMicrophoneRecording() {
        this.#microphoneManager.toggleRecording();
    }
    #displayManager = new DisplayManager();
    get isDisplayAvailable() {
        return this.#displayManager.isAvailable;
    }
    get isDisplayReady() {
        return this.isConnected && this.#displayManager.isReady;
    }
    get displayContextState() {
        return this.#displayManager.contextState;
    }
    get displayColors() {
        return this.#displayManager.colors;
    }
    get displayBitmapColors() {
        return this.#displayManager.bitmapColors;
    }
    get displayBitmapColorIndices() {
        return this.#displayManager.bitmapColorIndices;
    }
    get displayColorOpacities() {
        return this.#displayManager.opacities;
    }
    #assertDisplayIsAvailable() {
        _console$d.assertWithError(this.isDisplayAvailable, "display not available");
    }
    get displayStatus() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.displayStatus;
    }
    get displayBrightness() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.brightness;
    }
    get setDisplayBrightness() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.setBrightness;
    }
    get displayInformation() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.displayInformation;
    }
    get numberOfDisplayColors() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.numberOfColors;
    }
    get wakeDisplay() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.wake;
    }
    get sleepDisplay() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.sleep;
    }
    get toggleDisplay() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.toggle;
    }
    get isDisplayAwake() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.isDisplayAwake;
    }
    get showDisplay() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.show;
    }
    get clearDisplay() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.clear;
    }
    get setDisplayColor() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.setColor;
    }
    get setDisplayColorOpacity() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.setColorOpacity;
    }
    get setDisplayOpacity() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.setOpacity;
    }
    get saveDisplayContext() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.saveContext;
    }
    get restoreDisplayContext() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.restoreContext;
    }
    get clearDisplayRect() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.clearRect;
    }
    get selectDisplayBackgroundColor() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.selectBackgroundColor;
    }
    get selectDisplayFillColor() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.selectFillColor;
    }
    get selectDisplayLineColor() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.selectLineColor;
    }
    get setDisplayIgnoreFill() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.setIgnoreFill;
    }
    get setDisplayIgnoreLine() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.setIgnoreLine;
    }
    get setDisplayFillBackground() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.setFillBackground;
    }
    get setDisplayLineWidth() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.setLineWidth;
    }
    get setDisplayRotation() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.setRotation;
    }
    get clearDisplayRotation() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.clearRotation;
    }
    get setDisplaySegmentStartCap() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.setSegmentStartCap;
    }
    get setDisplaySegmentEndCap() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.setSegmentEndCap;
    }
    get setDisplaySegmentCap() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.setSegmentCap;
    }
    get setDisplaySegmentStartRadius() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.setSegmentStartRadius;
    }
    get setDisplaySegmentEndRadius() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.setSegmentEndRadius;
    }
    get setDisplaySegmentRadius() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.setSegmentRadius;
    }
    get setDisplayCropTop() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.setCropTop;
    }
    get setDisplayCropRight() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.setCropRight;
    }
    get setDisplayCropBottom() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.setCropBottom;
    }
    get setDisplayCropLeft() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.setCropLeft;
    }
    get setDisplayCrop() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.setCrop;
    }
    get clearDisplayCrop() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.clearCrop;
    }
    get setDisplayRotationCropTop() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.setRotationCropTop;
    }
    get setDisplayRotationCropRight() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.setRotationCropRight;
    }
    get setDisplayRotationCropBottom() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.setRotationCropBottom;
    }
    get setDisplayRotationCropLeft() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.setRotationCropLeft;
    }
    get setDisplayRotationCrop() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.setRotationCrop;
    }
    get clearDisplayRotationCrop() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.clearRotationCrop;
    }
    get flushDisplayContextCommands() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.flushContextCommands;
    }
    get drawDisplayRect() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.drawRect;
    }
    get drawDisplayCircle() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.drawCircle;
    }
    get drawDisplayEllipse() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.drawEllipse;
    }
    get drawDisplayRoundRect() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.drawRoundRect;
    }
    get drawDisplayRegularPolygon() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.drawRegularPolygon;
    }
    get drawDisplayPolygon() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.drawPolygon;
    }
    get drawDisplayWireframe() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.drawWireframe;
    }
    get drawDisplaySegment() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.drawSegment;
    }
    get drawDisplaySegments() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.drawSegments;
    }
    get drawDisplayArc() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.drawArc;
    }
    get drawDisplayArcEllipse() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.drawArcEllipse;
    }
    get drawDisplayBitmap() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.drawBitmap;
    }
    get imageToDisplayBitmap() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.imageToBitmap;
    }
    get quantizeDisplayImage() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.quantizeImage;
    }
    get resizeAndQuantizeDisplayImage() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.resizeAndQuantizeImage;
    }
    get setDisplayContextState() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.setContextState;
    }
    get selectDisplayBitmapColor() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.selectBitmapColor;
    }
    get selectDisplayBitmapColors() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.selectBitmapColors;
    }
    get setDisplayBitmapColor() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.setBitmapColor;
    }
    get setDisplayBitmapColorOpacity() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.setBitmapColorOpacity;
    }
    get setDisplayBitmapScaleDirection() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.setBitmapScaleDirection;
    }
    get setDisplayBitmapScaleX() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.setBitmapScaleX;
    }
    get setDisplayBitmapScaleY() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.setBitmapScaleY;
    }
    get setDisplayBitmapScale() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.setBitmapScale;
    }
    get resetDisplayBitmapScale() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.resetBitmapScale;
    }
    get selectDisplaySpriteColor() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.selectSpriteColor;
    }
    get selectDisplaySpriteColors() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.selectSpriteColors;
    }
    get setDisplaySpriteColor() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.setSpriteColor;
    }
    get setDisplaySpriteColorOpacity() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.setSpriteColorOpacity;
    }
    get resetDisplaySpriteColors() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.resetSpriteColors;
    }
    get setDisplaySpriteScaleDirection() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.setSpriteScaleDirection;
    }
    get setDisplaySpriteScaleX() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.setSpriteScaleX;
    }
    get setDisplaySpriteScaleY() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.setSpriteScaleY;
    }
    get setDisplaySpriteScale() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.setSpriteScale;
    }
    get resetDisplaySpriteScale() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.resetSpriteScale;
    }
    get displayManager() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager;
    }
    get uploadDisplaySpriteSheet() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.uploadSpriteSheet;
    }
    get uploadDisplaySpriteSheets() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.uploadSpriteSheets;
    }
    get selectDisplaySpriteSheet() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.selectSpriteSheet;
    }
    get drawDisplaySprite() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.drawSprite;
    }
    get startDisplaySprite() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.startSprite;
    }
    get endDisplaySprite() {
        this.#assertDisplayIsAvailable();
        return this.#displayManager.endSprite;
    }
    get displaySpriteSheets() {
        return this.#displayManager.spriteSheets;
    }
    get serializeDisplaySpriteSheet() {
        return this.#displayManager.serializeSpriteSheet;
    }
    get setDisplayAlignment() {
        return this.#displayManager.setAlignment;
    }
    get setDisplayVerticalAlignment() {
        return this.#displayManager.setVerticalAlignment;
    }
    get setDisplayHorizontalAlignment() {
        return this.#displayManager.setHorizontalAlignment;
    }
    get resetDisplayAlignment() {
        return this.#displayManager.resetAlignment;
    }
    get setDisplaySpritesDirection() {
        return this.#displayManager.setSpritesDirection;
    }
    get setDisplaySpritesLineDirection() {
        return this.#displayManager.setSpritesLineDirection;
    }
    get setDisplaySpritesSpacing() {
        return this.#displayManager.setSpritesSpacing;
    }
    get setDisplaySpritesLineSpacing() {
        return this.#displayManager.setSpritesLineSpacing;
    }
    get setDisplaySpritesAlignment() {
        return this.#displayManager.setSpritesAlignment;
    }
    get drawDisplayQuadraticBezierCurve() {
        return this.#displayManager.drawQuadraticBezierCurve;
    }
    get drawDisplayQuadraticBezierCurves() {
        return this.#displayManager.drawQuadraticBezierCurves;
    }
    get drawDisplayCubicBezierCurve() {
        return this.#displayManager.drawCubicBezierCurve;
    }
    get drawDisplayCubicBezierCurves() {
        return this.#displayManager.drawCubicBezierCurves;
    }
    get drawDisplayPath() {
        return this.#displayManager.drawPath;
    }
    get drawDisplayClosedPath() {
        return this.#displayManager.drawClosedPath;
    }
    #ledManager = new LedManager();
    get leds() {
        return this.#ledManager.leds;
    }
    get hasLeds() {
        return this.leds.length > 0;
    }
    get setLed() {
        return this.#ledManager.setLed;
    }
    get setLeds() {
        return this.#ledManager.setLeds;
    }
    get clearLeds() {
        return this.#ledManager.clearLeds;
    }
}
_a$2 = Device;

const _console$c = createConsole("DeviceManager", { log: false });
function getDeviceManagerDeviceEventTypes(deviceEventType) {
    return ["device"].map((prefix) => `${prefix}${capitalizeFirstCharacter(deviceEventType)}`);
}
const DeviceManagerDeviceEventTypes = DeviceEventTypes.flatMap((eventType) => getDeviceManagerDeviceEventTypes(eventType));
const wildcardDeviceEventType = "device*";
const BaseDeviceManagerEventTypes = [
    "availableDevice",
    "availableDevices",
    "connectedDevices",
    wildcardDeviceEventType,
];
const DeviceManagerEventTypes = [
    ...DeviceManagerDeviceEventTypes,
    ...BaseDeviceManagerEventTypes,
];
let DeviceManager$1 = class DeviceManager {
    static shared = new DeviceManager();
    constructor() {
        if (DeviceManager.shared && this != DeviceManager.shared) {
            throw Error("DeviceManager is a singleton - use DeviceManager.shared");
        }
        Device.OnDevice = this.onDevice.bind(this);
        Device.OnDeviceConnectionStatusUpdated =
            this.onDeviceConnectionStatusUpdated.bind(this);
        if (this.canUseLocalStorage) {
            this.useLocalStorage = true;
        }
    }
    #boundDeviceEventListeners = {
        getType: this.#onDeviceType.bind(this),
        notConnected: this.#onDeviceNotConnected.bind(this),
        connected: this.#onDeviceConnected.bind(this),
        [wildcardEventType]: this.#onDeviceEvent.bind(this),
    };
    onDevice(device) {
        addEventListeners(device, this.#boundDeviceEventListeners);
    }
    #onDeviceType(deviceEvent) {
        if (this.#useLocalStorage) {
            this.#updateLocalStorageConfigurationForDevice(deviceEvent.target);
        }
    }
    onDeviceConnectionStatusUpdated(device, connectionStatus) {
        if (connectionStatus == "notConnected" &&
            !device.canReconnect &&
            this.#availableDevices.includes(device)) {
            const deviceIndex = this.#availableDevices.indexOf(device);
            this.#availableDevices.splice(deviceIndex, 1);
            this.#dispatchAvailableDevices();
        }
    }
    #connectedDevices = [];
    get connectedDevices() {
        return this.#connectedDevices;
    }
    #useLocalStorage = false;
    get useLocalStorage() {
        return this.#useLocalStorage;
    }
    set useLocalStorage(newUseLocalStorage) {
        this.#assertLocalStorage();
        _console$c.assertTypeWithError(newUseLocalStorage, "boolean");
        this.#useLocalStorage = newUseLocalStorage;
        if (this.#useLocalStorage && !this.#localStorageConfiguration) {
            this.#loadFromLocalStorage();
        }
    }
    #defaultLocalStorageConfiguration = {
        devices: [],
    };
    #localStorageConfiguration;
    get canUseLocalStorage() {
        return isInBrowser && window.localStorage;
    }
    #assertLocalStorage() {
        _console$c.assertWithError(isInBrowser, "localStorage is only available in the browser");
        _console$c.assertWithError(window.localStorage, "localStorage not found");
    }
    #localStorageKey = "BS.Device";
    #SaveToLocalStorage() {
        this.#assertLocalStorage();
        localStorage.setItem(this.#localStorageKey, JSON.stringify(this.#localStorageConfiguration));
    }
    async #loadFromLocalStorage() {
        this.#assertLocalStorage();
        let localStorageString = localStorage.getItem(this.#localStorageKey);
        if (typeof localStorageString != "string") {
            _console$c.log("no info found in localStorage");
            this.#localStorageConfiguration = Object.assign({}, this.#defaultLocalStorageConfiguration);
            this.#SaveToLocalStorage();
            return;
        }
        try {
            const configuration = JSON.parse(localStorageString);
            _console$c.log({ configuration });
            this.#localStorageConfiguration = configuration;
            if (this.canGetDevices) {
                await this.getDevices();
            }
        }
        catch (error) {
            _console$c.warn(error);
        }
    }
    #updateLocalStorageConfigurationForDevice(device) {
        if (device.connectionType != "webBluetooth") {
            _console$c.log("localStorage is only for webBluetooth devices");
            return;
        }
        this.#assertLocalStorage();
        const deviceInformationIndex = this.#localStorageConfiguration.devices.findIndex((deviceInformation) => {
            return deviceInformation.bluetoothId == device.bluetoothId;
        });
        if (deviceInformationIndex == -1) {
            return;
        }
        this.#localStorageConfiguration.devices[deviceInformationIndex].type =
            device.type;
        this.#SaveToLocalStorage();
    }
    #availableDevices = [];
    get availableDevices() {
        return this.#availableDevices;
    }
    get canGetDevices() {
        return isInBrowser && navigator.bluetooth?.getDevices;
    }
    async getDevices() {
        if (!isInBrowser) {
            _console$c.warn("GetDevices is only available in the browser");
            return;
        }
        if (!navigator.bluetooth) {
            _console$c.warn("bluetooth is not available in this browser");
            return;
        }
        if (isInBluefy) {
            _console$c.warn("bluefy lists too many devices...");
            return;
        }
        if (!navigator.bluetooth.getDevices) {
            _console$c.warn("bluetooth.getDevices() is not available in this browser");
            return;
        }
        if (!this.canGetDevices) {
            _console$c.log("CanGetDevices is false");
            return;
        }
        if (!this.#localStorageConfiguration) {
            this.#loadFromLocalStorage();
        }
        const configuration = this.#localStorageConfiguration;
        if (!configuration.devices || configuration.devices.length == 0) {
            _console$c.log("no devices found in configuration");
            return;
        }
        let bluetoothDevices = [];
        try {
            bluetoothDevices = await navigator.bluetooth.getDevices();
        }
        catch (error) {
            _console$c.warn(error);
        }
        _console$c.log({ bluetoothDevices });
        bluetoothDevices.forEach((bluetoothDevice) => {
            if (!bluetoothDevice.gatt) {
                return;
            }
            let deviceInformation = configuration.devices.find((deviceInformation) => bluetoothDevice.id == deviceInformation.bluetoothId);
            if (!deviceInformation) {
                return;
            }
            let existingConnectedDevice = this.connectedDevices
                .filter((device) => device.connectionType == "webBluetooth")
                .find((device) => device.bluetoothId == bluetoothDevice.id);
            const existingAvailableDevice = this.availableDevices
                .filter((device) => device.connectionType == "webBluetooth")
                .find((device) => device.bluetoothId == bluetoothDevice.id);
            if (existingAvailableDevice) {
                if (existingConnectedDevice &&
                    existingConnectedDevice?.bluetoothId ==
                        existingAvailableDevice.bluetoothId &&
                    existingConnectedDevice != existingAvailableDevice) {
                    this.availableDevices[this.#availableDevices.indexOf(existingAvailableDevice)] = existingConnectedDevice;
                }
                return;
            }
            if (existingConnectedDevice) {
                this.#pushAvailableDevice(existingConnectedDevice);
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
            this.#pushAvailableDevice(device);
        });
        this.#dispatchAvailableDevices();
        return this.availableDevices;
    }
    #eventDispatcher = new EventDispatcher(this, DeviceManagerEventTypes);
    get addEventListener() {
        return this.#eventDispatcher.addEventListener;
    }
    get #dispatchEvent() {
        return this.#eventDispatcher.dispatchEvent;
    }
    get removeEventListener() {
        return this.#eventDispatcher.removeEventListener;
    }
    get removeEventListeners() {
        return this.#eventDispatcher.removeEventListeners;
    }
    #onDeviceConnected(deviceEvent) {
        const { target: device } = deviceEvent;
        this.#onDeviceIsConnected(device);
    }
    #onDeviceNotConnected(deviceEvent) {
        const { target: device } = deviceEvent;
        this.#onDeviceIsConnected(device);
    }
    #onDeviceIsConnected(device) {
        if (device.isConnected) {
            if (!this.#connectedDevices.includes(device)) {
                _console$c.log("adding device", device);
                this.#connectedDevices.push(device);
                if (this.useLocalStorage && device.connectionType == "webBluetooth") {
                    const deviceInformation = {
                        type: device.type,
                        bluetoothId: device.bluetoothId,
                        ipAddress: device.ipAddress,
                        isWifiSecure: device.isWifiSecure,
                    };
                    const deviceInformationIndex = this.#localStorageConfiguration.devices.findIndex((_deviceInformation) => _deviceInformation.bluetoothId == deviceInformation.bluetoothId);
                    if (deviceInformationIndex == -1) {
                        this.#localStorageConfiguration.devices.push(deviceInformation);
                    }
                    else {
                        this.#localStorageConfiguration.devices[deviceInformationIndex] =
                            deviceInformation;
                    }
                    this.#SaveToLocalStorage();
                }
                this.#dispatchConnectedDevices();
            }
            else {
                _console$c.log("device already included");
            }
        }
        else {
            if (this.#connectedDevices.includes(device)) {
                _console$c.log("removing device", device);
                this.#connectedDevices.splice(this.#connectedDevices.indexOf(device), 1);
                this.#dispatchConnectedDevices();
            }
            else {
                _console$c.log("device already not included");
            }
        }
        if (this.canGetDevices) {
            this.getDevices();
        }
        if (device.isConnected && !this.availableDevices.includes(device)) {
            const existingAvailableDevice = this.availableDevices.find((_device) => _device.bluetoothId == device.bluetoothId);
            _console$c.log({ existingAvailableDevice });
            if (existingAvailableDevice) {
                this.availableDevices[this.availableDevices.indexOf(existingAvailableDevice)] = device;
            }
            else {
                this.#pushAvailableDevice(device);
            }
            this.#dispatchAvailableDevices();
        }
        this._checkDeviceAvailability(device);
    }
    #onDeviceEvent(deviceEvent) {
        const { type: deviceType, target: device, message } = deviceEvent;
        this.#dispatchEvent(wildcardDeviceEventType, {
            ...message,
            device,
            deviceType,
        });
        getDeviceManagerDeviceEventTypes(deviceType).forEach((_type) => {
            this.#dispatchEvent(_type, {
                ...message,
                device,
            });
        });
    }
    _checkDeviceAvailability(device) {
        if (!device.isConnected &&
            !device.isAvailable &&
            this.#availableDevices.includes(device)) {
            _console$c.log("removing device from availableDevices...");
            this.#availableDevices.splice(this.#availableDevices.indexOf(device), 1);
            this.#dispatchAvailableDevices();
        }
    }
    #pushAvailableDevice(availableDevice) {
        _console$c.log({ availableDevice });
        this.availableDevices.push(availableDevice);
        this.#dispatchEvent("availableDevice", { availableDevice });
    }
    #dispatchAvailableDevices() {
        _console$c.log({ availableDevices: this.availableDevices });
        this.#dispatchEvent("availableDevices", {
            availableDevices: this.availableDevices,
        });
    }
    #dispatchConnectedDevices() {
        _console$c.log({ connectedDevices: this.connectedDevices });
        this.#dispatchEvent("connectedDevices", {
            connectedDevices: this.connectedDevices,
        });
    }
};
var DeviceManager = DeviceManager$1.shared;

const _console$b = createConsole("DevicePairPressureSensorDataManager", {
    log: false,
});
class DevicePairPressureSensorDataManager {
    #rawPressure = {};
    #pressureTimestamps = {};
    #centerOfPressureHelper = new CenterOfPressureHelper();
    #normalizedSumRangeHelper = new RangeHelper();
    constructor() {
        this.resetPressureRange();
    }
    resetPressureRange() {
        this.#centerOfPressureHelper.reset();
        this.#normalizedSumRangeHelper.reset();
    }
    onDevicePressureData(event) {
        const { pressure, timestamp } = event.message;
        const { side } = event.target;
        _console$b.log({ pressure, side });
        this.#rawPressure[side] = pressure;
        this.#pressureTimestamps[side] = timestamp;
        if (this.#hasAllPressureData) {
            return this.#updatePressureData();
        }
        else {
            _console$b.log("doesn't have all pressure data yet...");
        }
    }
    get #hasAllPressureData() {
        const now = Date.now();
        const hasBothSides = Sides.every((side) => side in this.#rawPressure);
        const bothSidesAreRecent = Sides.every((side) => now - this.#pressureTimestamps[side] < 500);
        return hasBothSides && bothSidesAreRecent;
    }
    #updatePressureData() {
        const pressureData = {
            scaledSum: 0,
            normalizedSum: 0,
            sensors: { left: [], right: [] },
            sides: { left: this.#rawPressure.left, right: this.#rawPressure.right },
        };
        Sides.forEach((side) => {
            const sidePressure = this.#rawPressure[side];
            pressureData.sensors[side].push(...sidePressure.sensors);
        });
        let numberOfSidesWithCenter = 0;
        Sides.forEach((side) => {
            const sidePressureData = this.#rawPressure[side];
            if (sidePressureData.center) {
                numberOfSidesWithCenter++;
            }
        });
        Sides.forEach((side) => {
            const sidePressure = this.#rawPressure[side];
            pressureData.scaledSum += sidePressure.scaledSum;
        });
        pressureData.normalizedSum +=
            this.#normalizedSumRangeHelper.updateAndGetNormalization(pressureData.scaledSum);
        if (numberOfSidesWithCenter == 2) {
            pressureData.center = { x: 0, y: 0 };
            Sides.forEach((side) => {
                const sidePressureData = this.#rawPressure[side];
                let centerOfPressure;
                if (sidePressureData.calibratedCenter) {
                    centerOfPressure = sidePressureData.calibratedCenter;
                }
                else if (sidePressureData.motionCenter) {
                    centerOfPressure = sidePressureData.motionCenter;
                }
                const sidePressureWeight = sidePressureData.scaledSum / pressureData.scaledSum;
                if (sidePressureWeight > 0) {
                    if (centerOfPressure) {
                        pressureData.center.x += centerOfPressure.x * 0.5;
                        pressureData.center.y += centerOfPressure.y * 0.5;
                    }
                    else {
                        if (sidePressureData.normalizedCenter?.y != undefined) {
                            pressureData.center.y +=
                                sidePressureData.normalizedCenter.y * sidePressureWeight;
                        }
                        if (side == "right") {
                            pressureData.center.x = sidePressureWeight;
                        }
                    }
                }
            });
            pressureData.normalizedCenter =
                this.#centerOfPressureHelper.updateAndGetNormalization(pressureData.center);
        }
        _console$b.log({ devicePairPressureData: pressureData });
        return pressureData;
    }
}

const _console$a = createConsole("DevicePairSensorDataManager", { log: false });
const DevicePairSensorTypes = ["pressure", "sensorData"];
const DevicePairSensorDataEventTypes = DevicePairSensorTypes;
class DevicePairSensorDataManager {
    eventDispatcher;
    get dispatchEvent() {
        return this.eventDispatcher.dispatchEvent;
    }
    #timestamps = {};
    pressureSensorDataManager = new DevicePairPressureSensorDataManager();
    resetPressureRange() {
        this.pressureSensorDataManager.resetPressureRange();
    }
    onDeviceSensorData(event) {
        const { timestamp, sensorType } = event.message;
        _console$a.log({ sensorType, timestamp, event });
        if (!this.#timestamps[sensorType]) {
            this.#timestamps[sensorType] = {};
        }
        this.#timestamps[sensorType][event.target.side] = timestamp;
        let value;
        switch (sensorType) {
            case "pressure":
                value = this.pressureSensorDataManager.onDevicePressureData(event);
                break;
            default:
                _console$a.log(`uncaught sensorType "${sensorType}"`);
                break;
        }
        if (value) {
            const timestamps = Object.assign({}, this.#timestamps[sensorType]);
            this.dispatchEvent(sensorType, {
                sensorType,
                timestamps,
                [sensorType]: value,
            });
            this.dispatchEvent("sensorData", {
                sensorType,
                timestamps,
                [sensorType]: value,
            });
        }
        else {
            _console$a.log("no value received");
        }
    }
}

const _console$9 = createConsole("DevicePair", { log: false });
function getDevicePairDeviceEventTypes(deviceEventType) {
    return ["device", ...Sides].map((prefix) => `${prefix}${capitalizeFirstCharacter(deviceEventType)}`);
}
const DevicePairDeviceEventTypes = DeviceEventTypes.flatMap((eventType) => getDevicePairDeviceEventTypes(eventType));
const DevicePairConnectionEventTypes = [
    "isConnected",
    wildcardDeviceEventType,
];
const DevicePairEventTypes = [
    ...DevicePairConnectionEventTypes,
    ...DevicePairSensorDataEventTypes,
    ...DevicePairDeviceEventTypes,
];
const DevicePairTypes = ["insoles", "gloves"];
class DevicePair {
    constructor(type) {
        this.#type = type;
        this.#sensorDataManager.eventDispatcher = this
            .#eventDispatcher;
    }
    get sides() {
        return Sides;
    }
    #type;
    get type() {
        return this.#type;
    }
    #eventDispatcher = new EventDispatcher(this, DevicePairEventTypes);
    get addEventListener() {
        return this.#eventDispatcher.addEventListener;
    }
    get #dispatchEvent() {
        return this.#eventDispatcher.dispatchEvent;
    }
    get removeEventListener() {
        return this.#eventDispatcher.removeEventListener;
    }
    get waitForEvent() {
        return this.#eventDispatcher.waitForEvent;
    }
    get removeEventListeners() {
        return this.#eventDispatcher.removeEventListeners;
    }
    get removeAllEventListeners() {
        return this.#eventDispatcher.removeAllEventListeners;
    }
    #left;
    get left() {
        return this.#left;
    }
    #right;
    get right() {
        return this.#right;
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
    #assertIsConnected() {
        _console$9.assertWithError(this.isConnected, "devicePair must be connected");
    }
    #isDeviceCorrectType(device) {
        switch (this.type) {
            case "insoles":
                return device.isInsole;
            case "gloves":
                return device.isGlove;
        }
    }
    assignDevice(device) {
        if (!this.#isDeviceCorrectType(device)) {
            _console$9.log(`device is incorrect type ${device.type} for ${this.type} devicePair`);
            return;
        }
        const side = device.side;
        const currentDevice = this[side];
        if (device == currentDevice) {
            _console$9.log("device already assigned");
            return;
        }
        if (currentDevice) {
            this.#removeDeviceEventListeners(currentDevice);
        }
        this.#addDeviceEventListeners(device);
        switch (side) {
            case "left":
                this.#left = device;
                break;
            case "right":
                this.#right = device;
                break;
        }
        _console$9.log(`assigned ${side} ${this.type} device`, device);
        this.resetPressureRange();
        this.#dispatchEvent("isConnected", { isConnected: this.isConnected });
        this.#dispatchEvent("deviceIsConnected", {
            device,
            isConnected: device.isConnected,
            side,
        });
        return currentDevice;
    }
    #addDeviceEventListeners(device) {
        addEventListeners(device, this.#boundDeviceEventListeners);
    }
    #removeDeviceEventListeners(device) {
        removeEventListeners(device, this.#boundDeviceEventListeners);
    }
    #removeDevice(device) {
        const foundDevice = Sides.some((side) => {
            if (this[side] != device) {
                return false;
            }
            _console$9.log(`removing ${side} ${this.type} device`, device);
            removeEventListeners(device, this.#boundDeviceEventListeners);
            switch (side) {
                case "left":
                    this.#left = undefined;
                    break;
                case "right":
                    this.#right = undefined;
                    break;
            }
            return true;
        });
        if (foundDevice) {
            this.#dispatchEvent("isConnected", { isConnected: this.isConnected });
        }
        return foundDevice;
    }
    #boundDeviceEventListeners = {
        isConnected: this.#onDeviceIsConnected.bind(this),
        sensorData: this.#onDeviceSensorData.bind(this),
        getType: this.#onDeviceGetType.bind(this),
        [wildcardEventType]: this.#onDeviceEvent.bind(this),
    };
    #onDeviceIsConnected(deviceEvent) {
        this.#dispatchEvent("isConnected", { isConnected: this.isConnected });
    }
    #onDeviceGetType(deviceEvent) {
        const { target: device } = deviceEvent;
        if (this[device.side] == device) {
            return;
        }
        const foundDevice = this.#removeDevice(device);
        if (!foundDevice) {
            return;
        }
        this.assignDevice(device);
    }
    #onDeviceEvent(deviceEvent) {
        const { type: deviceType, target: device, message } = deviceEvent;
        this.#dispatchEvent(wildcardDeviceEventType, {
            ...message,
            device,
            deviceType,
            side: device.side,
        });
        getDevicePairDeviceEventTypes(deviceType).forEach((_type) => {
            this.#dispatchEvent(_type, {
                ...message,
                device,
                side: device.side,
            });
        });
    }
    async setSensorConfiguration(sensorConfiguration) {
        for (let i = 0; i < Sides.length; i++) {
            const side = Sides[i];
            if (this[side]?.isConnected) {
                await this[side].setSensorConfiguration(sensorConfiguration);
            }
        }
    }
    #sensorDataManager = new DevicePairSensorDataManager();
    #onDeviceSensorData(deviceEvent) {
        if (this.isConnected) {
            this.#sensorDataManager.onDeviceSensorData(deviceEvent);
        }
    }
    resetPressureRange(resetSides = true) {
        if (resetSides) {
            Sides.forEach((side) => this[side]?.resetPressureRange());
        }
        this.#sensorDataManager.resetPressureRange();
    }
    setPressureAutoRange(newPressureAutoRange) {
        Sides.forEach((side) => this[side]?.setPressureAutoRange(newPressureAutoRange));
    }
    togglePressureAutoRange() {
        Sides.forEach((side) => this[side]?.togglePressureAutoRange());
    }
    setPressureMotionAutoRange(newPressureMotionAutoRange) {
        Sides.forEach((side) => this[side]?.setPressureMotionAutoRange(newPressureMotionAutoRange));
    }
    togglePressureMotionAutoRange() {
        Sides.forEach((side) => this[side]?.togglePressureMotionAutoRange());
    }
    async triggerVibration(vibrationConfigurations, sendImmediately) {
        const promises = Sides.map((side) => {
            return this[side]?.triggerVibration(vibrationConfigurations, sendImmediately);
        }).filter(Boolean);
        return Promise.allSettled(promises);
    }
    static #insoles = new DevicePair("insoles");
    static get insoles() {
        return this.#insoles;
    }
    static #gloves = new DevicePair("gloves");
    static get gloves() {
        return this.#gloves;
    }
    static {
        DeviceManager.addEventListener("deviceConnected", (event) => {
            const { device } = event.message;
            if (device.isInsole) {
                this.#insoles.assignDevice(device);
            }
            if (device.isGlove) {
                this.#gloves.assignDevice(device);
            }
        });
    }
}

function throttle(fn, interval, trailing = false) {
    let lastTime = 0;
    let timeout = null;
    let lastArgs = null;
    return function (...args) {
        const now = Date.now();
        const remaining = interval - (now - lastTime);
        if (remaining <= 0) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            lastTime = now;
            fn(...args);
        }
        else if (trailing) {
            lastArgs = args;
            if (!timeout) {
                timeout = setTimeout(() => {
                    lastTime = Date.now();
                    timeout = null;
                    if (lastArgs) {
                        fn(...lastArgs);
                        lastArgs = null;
                    }
                }, remaining);
            }
        }
    };
}
function debounce(fn, interval, callImmediately = false) {
    let timeout = null;
    return function (...args) {
        const callNow = callImmediately && !timeout;
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            timeout = null;
            if (!callImmediately) {
                fn(...args);
            }
        }, interval);
        if (callNow) {
            fn(...args);
        }
    };
}

const _console$7 = createConsole("NobleConnectionManager", { log: false });
let filterUUIDs = true;
const isLinux$1 = os.platform() == "linux";
filterUUIDs = !isLinux$1;
noble.withBindings("default", {
    extended: true,
    userChannel: true,
});
class NobleConnectionManager extends BluetoothConnectionManager {
    get bluetoothId() {
        return this.#noblePeripheral.id;
    }
    get canUpdateFirmware() {
        return this.#characteristics.has("smp");
    }
    static get isSupported() {
        return isInNode;
    }
    static type = "noble";
    type = NobleConnectionManager.type;
    get isConnected() {
        return this.#noblePeripheral?.state == "connected";
    }
    async connect() {
        const canConnect = await super.connect();
        _console$7.log({ canConnect });
        if (!canConnect) {
            return false;
        }
        if (isLinux$1) {
            _console$7.log("setting noblePeripheral.shouldConnect");
            this.#noblePeripheral.shouldConnect = true;
        }
        else {
            _console$7.log("noblePeripheral.connectAsync");
            await this.#noblePeripheral.connectAsync();
            _console$7.log("noblePeripheral.connectAsync done");
        }
        return true;
    }
    async disconnect() {
        const canContinue = await super.disconnect();
        if (!canContinue) {
            return false;
        }
        _console$7.log("noblePeripheral.disconnectAsync");
        await this.#noblePeripheral.disconnectAsync();
        _console$7.log("noblePeripheral.disconnectAsync done");
        return true;
    }
    async writeCharacteristic(characteristicName, data) {
        const characteristic = this.#characteristics.get(characteristicName);
        _console$7.assertWithError(characteristic, `no characteristic found with name "${characteristicName}"`);
        const properties = getCharacteristicProperties(characteristicName);
        const buffer = Buffer.from(data);
        const writeWithoutResponse = properties.writeWithoutResponse;
        _console$7.log(`writing to ${characteristicName} ${writeWithoutResponse ? "without" : "with"} response`, buffer);
        await characteristic.writeAsync(buffer, writeWithoutResponse);
        if (characteristic.properties.includes("read")) {
            await characteristic.readAsync();
        }
    }
    get canReconnect() {
        return this.#noblePeripheral.connectable;
    }
    async reconnect() {
        let canContinue = await super.reconnect();
        if (!canContinue) {
            return false;
        }
        await this.#noblePeripheral.connectAsync();
        return true;
    }
    #noblePeripheral;
    get noblePeripheral() {
        return this.#noblePeripheral;
    }
    set noblePeripheral(newNoblePeripheral) {
        if (newNoblePeripheral) {
            _console$7.assertTypeWithError(newNoblePeripheral, "object");
        }
        if (this.noblePeripheral == newNoblePeripheral) {
            _console$7.log("attempted to assign duplicate noblePeripheral");
            return;
        }
        _console$7.log("newNoblePeripheral", newNoblePeripheral?.id);
        if (this.#noblePeripheral) {
            removeEventListeners(this.#noblePeripheral, this.#unboundNoblePeripheralListeners);
            delete this.#noblePeripheral.connectionManager;
        }
        if (newNoblePeripheral) {
            newNoblePeripheral.connectionManager = this;
            addEventListeners(newNoblePeripheral, this.#unboundNoblePeripheralListeners);
        }
        this.#noblePeripheral = newNoblePeripheral;
    }
    #unboundNoblePeripheralListeners = {
        connect: this.#onNoblePeripheralConnect,
        disconnect: this.#onNoblePeripheralDisconnect,
        rssiUpdate: this.#onNoblePeripheralRssiUpdate,
        servicesDiscover: this.#onNoblePeripheralServicesDiscover,
    };
    async #onNoblePeripheralConnect() {
        await this.connectionManager.onNoblePeripheralConnect(this);
    }
    async onNoblePeripheralConnect(noblePeripheral) {
        _console$7.log("onNoblePeripheralConnect", noblePeripheral.id, noblePeripheral.state);
        if (noblePeripheral.state == "connected") {
            _console$7.log("discoverServicesAsync", noblePeripheral.id, {
                allServiceUUIDs,
            });
            if (filterUUIDs) {
                await this.#noblePeripheral.discoverServicesAsync(allServiceUUIDs);
            }
            else {
                await this.#noblePeripheral.discoverServicesAsync();
            }
        }
        await this.#onNoblePeripheralState();
    }
    async #onNoblePeripheralDisconnect() {
        await this.connectionManager.onNoblePeripheralConnect(this);
    }
    async onNoblePeripheralDisconnect(noblePeripheral) {
        _console$7.log("onNoblePeripheralDisconnect", noblePeripheral.id);
        await this.#onNoblePeripheralState();
    }
    async #onNoblePeripheralState() {
        _console$7.log(`noblePeripheral ${this.bluetoothId} state ${this.#noblePeripheral.state}`);
        switch (this.#noblePeripheral.state) {
            case "connected":
                break;
            case "connecting":
                break;
            case "disconnected":
                this.#removeEventListeners();
                this.status = "notConnected";
                break;
            case "disconnecting":
                this.status = "disconnecting";
                break;
            case "error":
                _console$7.error("noblePeripheral error");
                break;
            default:
                _console$7.log(`uncaught noblePeripheral state ${this.#noblePeripheral.state}`);
                break;
        }
    }
    #removeEventListeners() {
        _console$7.log("removing noblePeripheral eventListeners");
        this.#services.forEach((service) => {
            removeEventListeners(service, this.#unboundNobleServiceListeners);
        });
        this.#services.clear();
        this.#characteristics.forEach((characteristic) => {
            _console$7.log(`removing listeners from characteristic "${characteristic.name}" has ${characteristic.listeners.length} listeners`);
            removeEventListeners(characteristic, this.#unboundNobleCharacteristicListeners);
        });
        this.#characteristics.clear();
    }
    async #onNoblePeripheralRssiUpdate(rssi) {
        await this.connectionManager.onNoblePeripheralRssiUpdate(this, rssi);
    }
    async onNoblePeripheralRssiUpdate(noblePeripheral, rssi) {
        _console$7.log("onNoblePeripheralRssiUpdate", noblePeripheral.id, rssi);
    }
    async #onNoblePeripheralServicesDiscover(services) {
        await this.connectionManager.onNoblePeripheralServicesDiscover(this, services);
    }
    async onNoblePeripheralServicesDiscover(noblePeripheral, services) {
        _console$7.log("onNoblePeripheralServicesDiscover", noblePeripheral.id, services.map((service) => service.uuid));
        for (const index in services) {
            const service = services[index];
            _console$7.log("service", service.uuid);
            if (service.uuid == "1800") {
                _console$7.log("skipping 1800");
                continue;
            }
            if (service.uuid == "1801") {
                _console$7.log("skipping 1801");
                continue;
            }
            const serviceName = getServiceNameFromUUID(service.uuid);
            _console$7.assertWithError(serviceName, `no name found for service uuid "${service.uuid}"`);
            _console$7.log({ serviceName });
            this.#services.set(serviceName, service);
            service.name = serviceName;
            service.connectionManager = this;
            addEventListeners(service, this.#unboundNobleServiceListeners);
            await service.discoverCharacteristicsAsync();
        }
    }
    #services = new Map();
    #unboundNobleServiceListeners = {
        characteristicsDiscover: this.#onNobleServiceCharacteristicsDiscover,
    };
    async #onNobleServiceCharacteristicsDiscover(characteristics) {
        await this.connectionManager.onNobleServiceCharacteristicsDiscover(this, characteristics);
    }
    async onNobleServiceCharacteristicsDiscover(service, characteristics) {
        _console$7.log("onNobleServiceCharacteristicsDiscover", service.uuid, characteristics.map((characteristic) => characteristic.uuid));
        for (const index in characteristics) {
            const characteristic = characteristics[index];
            _console$7.log("characteristic", characteristic.uuid);
            const characteristicName = getCharacteristicNameFromUUID(characteristic.uuid);
            _console$7.assertWithError(Boolean(characteristicName), `no name found for characteristic uuid "${characteristic.uuid}"`);
            _console$7.log({ characteristicName });
            this.#characteristics.set(characteristicName, characteristic);
            characteristic.name = characteristicName;
            characteristic.connectionManager = this;
            _console$7.log(`adding listeners to characteristic "${characteristic.name}" (currently has ${characteristic.listeners.length} listeners)`);
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
    #unboundNobleCharacteristicListeners = {
        data: this.#onNobleCharacteristicData,
        write: this.#onNobleCharacteristicWrite,
        notify: this.#onNobleCharacteristicNotify,
    };
    #characteristics = new Map();
    get #hasAllCharacteristics() {
        return allCharacteristicNames.every((characteristicName) => {
            if (characteristicName == "smp") {
                return true;
            }
            return this.#characteristics.has(characteristicName);
        });
    }
    #onNobleCharacteristicData(data, isNotification) {
        this.connectionManager.onNobleCharacteristicData(this, data, isNotification);
    }
    onNobleCharacteristicData(characteristic, data, isNotification) {
        _console$7.log("onNobleCharacteristicData", characteristic.uuid, data, isNotification);
        const dataView = new DataView(dataToArrayBuffer(data));
        const characteristicName = characteristic.name;
        _console$7.assertWithError(Boolean(characteristicName), `no name found for characteristic with uuid "${characteristic.uuid}"`);
        this.onCharacteristicValueChanged(characteristicName, dataView);
    }
    #onNobleCharacteristicWrite() {
        this.connectionManager.onNobleCharacteristicWrite(this);
    }
    onNobleCharacteristicWrite(characteristic) {
        _console$7.log("onNobleCharacteristicWrite", characteristic.uuid);
    }
    #onNobleCharacteristicNotify(isSubscribed) {
        this.connectionManager.onNobleCharacteristicNotify(this, isSubscribed);
    }
    onNobleCharacteristicNotify(characteristic, isSubscribed) {
        _console$7.log("onNobleCharacteristicNotify", characteristic.uuid, isSubscribed);
    }
    remove() {
        super.remove();
        this.noblePeripheral = undefined;
    }
}

const _console$8 = createConsole("ClientConnectionManager", { log: false });
[
    ...DeviceInformationTypes,
    "batteryLevel",
];
class ClientConnectionManager extends BaseConnectionManager {
    static get isSupported() {
        return isInBrowser;
    }
    static type = "client";
    type = ClientConnectionManager.type;
    subType;
    get canUpdateFirmware() {
        return false;
    }
    client;
    discoveredDevice;
    #bluetoothId;
    get bluetoothId() {
        return this.#bluetoothId;
    }
    set bluetoothId(newBluetoothId) {
        _console$8.assertTypeWithError(newBluetoothId, "string");
        if (this.#bluetoothId == newBluetoothId) {
            _console$8.log("redundant bluetoothId assignment");
            return;
        }
        this.#bluetoothId = newBluetoothId;
    }
    #isConnected = false;
    get isConnected() {
        return this.#isConnected;
    }
    set isConnected(newIsConnected) {
        _console$8.assertTypeWithError(newIsConnected, "boolean");
        if (this.#isConnected == newIsConnected) {
            _console$8.log("redundant newIsConnected assignment", newIsConnected);
            return;
        }
        this.#isConnected = newIsConnected;
        _console$8.log({ isConnected: this.isConnected });
        this.status = this.#isConnected ? "connected" : "notConnected";
        if (this.isConnected) {
            this.#requestDeviceInformation();
        }
        else {
            this.#didRequestDeviceInformation = false;
        }
    }
    get isAvailable() {
        return this.client.isConnected;
    }
    async connect() {
        const canContinue = await super.connect();
        if (!canContinue) {
            return false;
        }
        this.sendClientConnectMessage(this.subType);
        return true;
    }
    async disconnect() {
        const canContinue = await super.disconnect();
        if (!canContinue) {
            return false;
        }
        this.sendClientDisconnectMessage();
        return true;
    }
    get canReconnect() {
        return true;
    }
    async reconnect() {
        const canContinue = await super.reconnect();
        if (!canContinue) {
            return false;
        }
        this.sendClientConnectMessage();
        return true;
    }
    sendClientMessage;
    sendClientConnectMessage;
    sendClientDisconnectMessage;
    sendRequiredDeviceInformationMessage;
    async sendSmpMessage(data) {
        super.sendSmpMessage(data);
        this.sendClientMessage({ type: "smp", data });
    }
    async sendTxData(data) {
        super.sendTxData(data);
        if (data.byteLength == 0) {
            return;
        }
        this.sendClientMessage({ type: "tx", data });
    }
    #didRequestDeviceInformation = false;
    #requestDeviceInformation() {
        _console$8.log("requestDeviceInformation");
        if (this.#didRequestDeviceInformation == false) {
            this.sendRequiredDeviceInformationMessage();
            this.#didRequestDeviceInformation = true;
        }
        else {
            _console$8.log("already requested deviceInformation");
        }
    }
    onClientMessage(dataView) {
        _console$8.log({ dataView });
        parseMessage(dataView, DeviceEventTypes, this.#onClientMessageCallback.bind(this), null, true);
        this.onMessagesReceived();
    }
    #onClientMessageCallback(messageType, dataView) {
        let byteOffset = 0;
        _console$8.log({ messageType }, dataView);
        switch (messageType) {
            case "isConnected":
                const isConnected = Boolean(dataView.getUint8(byteOffset++));
                _console$8.log({ isConnected });
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

const ConnectionManagers = [
    WebBluetoothConnectionManager,
    WebSocketConnectionManager,
    ClientConnectionManager,
    NobleConnectionManager,
    UDPConnectionManager,
];

var _a$1;
const _console$6 = createConsole("BaseScanner", { log: false });
const ScannerEventTypes = [
    "isScanningAvailable",
    "isScanning",
    "discoveredDevice",
    "expiredDiscoveredDevice",
    "scanningAvailable",
    "scanningNotAvailable",
    "scanning",
    "notScanning",
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
    #assertIsSupported() {
        _console$6.assertWithError(this.isSupported, `${this.constructor.name} is not supported`);
    }
    #assertIsSubclass() {
        _console$6.assertWithError(this.constructor != _a$1, `${this.constructor.name} must be subclassed`);
    }
    constructor() {
        this.#assertIsSubclass();
        this.#assertIsSupported();
        addEventListeners(this, this.#boundEventListeners);
    }
    #boundEventListeners = {
        discoveredDevice: this.#onDiscoveredDevice.bind(this),
        isScanning: this.#onIsScanning.bind(this),
        isScanningAvailable: this.#onIsScanningAvailable.bind(this),
    };
    #eventDispatcher = new EventDispatcher(this, ScannerEventTypes);
    get addEventListener() {
        return this.#eventDispatcher.addEventListener;
    }
    get dispatchEvent() {
        return this.#eventDispatcher.dispatchEvent;
    }
    get removeEventListener() {
        return this.#eventDispatcher.removeEventListener;
    }
    get waitForEvent() {
        return this.#eventDispatcher.waitForEvent;
    }
    get isScanningAvailable() {
        return false;
    }
    #assertIsAvailable() {
        _console$6.assertWithError(this.isScanningAvailable, "scanner not available");
    }
    get isScanning() {
        return false;
    }
    #assertIsScanning() {
        _console$6.assertWithError(this.isScanning, "not scanning");
    }
    #assertIsNotScanning() {
        _console$6.assertWithError(!this.isScanning, "already scanning");
    }
    startScan() {
        if (!this.isScanningAvailable) {
            _console$6.warn("scanning is not available");
            return false;
        }
        if (this.isScanning) {
            _console$6.log("already scanning");
            return false;
        }
        _console$6.log("startScan");
        return true;
    }
    stopScan() {
        if (!this.isScanning) {
            _console$6.log("already not scanning");
            return false;
        }
        _console$6.log("stopScan");
        return true;
    }
    #onIsScanning(event) {
        if (this.isScanning) {
            this.#discoveredDevices = {};
            this.#discoveredDeviceTimestamps = {};
        }
        else {
            this.#checkDiscoveredDevicesExpirationTimer.stop();
        }
        if (this.isScanning) {
            this.#eventDispatcher.dispatchEvent("scanning", {});
        }
        else {
            this.#eventDispatcher.dispatchEvent("notScanning", {});
        }
    }
    #onIsScanningAvailable(event) {
        if (this.isScanningAvailable) {
            this.#eventDispatcher.dispatchEvent("scanningAvailable", {});
        }
        else {
            this.#eventDispatcher.dispatchEvent("scanningNotAvailable", {});
        }
    }
    #discoveredDevices = {};
    get discoveredDevices() {
        return this.#discoveredDevices;
    }
    get discoveredDevicesArray() {
        return Object.values(this.#discoveredDevices).sort((a, b) => {
            return (this.#discoveredDeviceTimestamps[a.bluetoothId] -
                this.#discoveredDeviceTimestamps[b.bluetoothId]);
        });
    }
    #assertValidDiscoveredDeviceId(discoveredDeviceId) {
        _console$6.assertWithError(this.#discoveredDevices[discoveredDeviceId], `no discovered device with id "${discoveredDeviceId}"`);
    }
    #onDiscoveredDevice(event) {
        const { discoveredDevice } = event.message;
        this.#discoveredDevices[discoveredDevice.bluetoothId] = discoveredDevice;
        this.#discoveredDeviceTimestamps[discoveredDevice.bluetoothId] = Date.now();
        this.#checkDiscoveredDevicesExpirationTimer.start();
    }
    #discoveredDeviceTimestamps = {};
    static #DiscoveredDeviceExpirationTimeout = 5000;
    static get DiscoveredDeviceExpirationTimeout() {
        return this.#DiscoveredDeviceExpirationTimeout;
    }
    get #discoveredDeviceExpirationTimeout() {
        return _a$1.DiscoveredDeviceExpirationTimeout;
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
                _console$6.log("discovered device timeout");
                delete this.#discoveredDevices[id];
                delete this.#discoveredDeviceTimestamps[id];
                this.dispatchEvent("expiredDiscoveredDevice", { discoveredDevice });
            }
        });
    }
    async connectToDevice(deviceId, connectionType) {
        this.#assertIsAvailable();
    }
    async disconnectFromDevice(deviceId) {
        this.#assertIsAvailable();
    }
    get canReset() {
        return false;
    }
    reset() {
        _console$6.assertWithError(this.canReset, `${this.constructor.name} does not support reset`);
        _console$6.log("resetting...");
    }
}
_a$1 = BaseScanner;

const _console$5 = createConsole("NobleScanner", { log: false });
let isSupported = false;
let filterManually = true;
const filterServiceUuid = serviceUUIDs[0].replaceAll("-", "");
let isLinux = false;
isSupported = true;
const platform = os.platform();
isLinux = platform == "linux";
filterManually = isLinux;
_console$5.log({ platform, filterManually, filterServiceUuid });
class NobleScanner extends BaseScanner {
    static get isSupported() {
        return isSupported;
    }
    #_isScanning = false;
    get #isScanning() {
        return this.#_isScanning;
    }
    set #isScanning(newIsScanning) {
        _console$5.assertTypeWithError(newIsScanning, "boolean");
        if (this.isScanning == newIsScanning) {
            _console$5.log("duplicate isScanning assignment");
            return;
        }
        this.#_isScanning = newIsScanning;
        this.dispatchEvent("isScanning", { isScanning: this.isScanning });
    }
    get isScanning() {
        return this.#isScanning;
    }
    #_nobleState = "unknown";
    get #nobleState() {
        return this.#_nobleState;
    }
    set #nobleState(newNobleState) {
        _console$5.assertTypeWithError(newNobleState, "string");
        if (this.#nobleState == newNobleState) {
            _console$5.log("duplicate nobleState assignment");
            return;
        }
        this.#_nobleState = newNobleState;
        _console$5.log({ newNobleState });
        this.dispatchEvent("isScanningAvailable", {
            isScanningAvailable: this.isScanningAvailable,
        });
    }
    #boundNobleListeners = {
        scanStart: this.#onNobleScanStart.bind(this),
        scanStop: this.#onNobleScanStop.bind(this),
        stateChange: this.#onNobleStateChange.bind(this),
        discover: this.#onNobleDiscover.bind(this),
    };
    #onNobleScanStart() {
        _console$5.log("OnNobleScanStart");
        this.#isScanning = true;
    }
    #onNobleScanStop() {
        _console$5.log("OnNobleScanStop");
        this.#isScanning = false;
    }
    #onNobleStateChange(state) {
        _console$5.log("onNobleStateChange", state);
        this.#nobleState = state;
    }
    #isBusy = false;
    async #onNobleDiscover(noblePeripheral) {
        _console$5.log("advertisement", noblePeripheral.advertisement);
        if (filterManually) {
            const serviceUuid = noblePeripheral.advertisement.serviceUuids?.[0];
            _console$5.log("onNobleDiscover.filterManually", { serviceUuid });
            if (serviceUuid != filterServiceUuid) {
                return;
            }
        }
        _console$5.log("onNobleDiscover", noblePeripheral.id);
        if (!this.#noblePeripherals[noblePeripheral.id]) {
            noblePeripheral.scanner = this;
            this.#noblePeripherals[noblePeripheral.id] = noblePeripheral;
        }
        else {
            const _noblePeripheral = this.#noblePeripherals[noblePeripheral.id];
            if (isLinux &&
                _noblePeripheral.shouldConnect &&
                !this.#isBusy &&
                _noblePeripheral.state == "disconnected") {
                this.#isBusy = true;
                _noblePeripheral.shouldConnect = false;
                _console$5.log("noblePeripheral.connectAsync");
                await _noblePeripheral.connectAsync({ mtu: 512 });
                _console$5.log("noblePeripheral.connectAsync done");
                this.#isBusy = false;
            }
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
                _console$5.log({ ipAddress });
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
    }
    constructor() {
        super();
        addEventListeners(noble__default, this.#boundNobleListeners);
        addEventListeners(this, this.#boundBaseScannerListeners);
    }
    get isScanningAvailable() {
        return this.#nobleState == "poweredOn";
    }
    startScan() {
        if (!super.startScan()) {
            return false;
        }
        _console$5.log("noble.startScan");
        noble__default.startScanningAsync(filterManually ? [] : serviceUUIDs, true);
        return true;
    }
    stopScan() {
        if (!super.stopScan()) {
            return false;
        }
        _console$5.log("noble.stopScan");
        noble__default.stopScanningAsync();
        return true;
    }
    get canReset() {
        return true;
    }
    reset() {
        super.reset();
        noble__default.reset();
    }
    #boundBaseScannerListeners = {
        expiredDiscoveredDevice: this.#onExpiredDiscoveredDevice.bind(this),
    };
    #onExpiredDiscoveredDevice(event) {
        const { discoveredDevice } = event.message;
        const noblePeripheral = this.#noblePeripherals[discoveredDevice.bluetoothId];
        if (noblePeripheral) {
            delete this.#noblePeripherals[discoveredDevice.bluetoothId];
        }
    }
    #noblePeripherals = {};
    #assertValidNoblePeripheralId(noblePeripheralId) {
        _console$5.assertTypeWithError(noblePeripheralId, "string");
        _console$5.assertWithError(this.#noblePeripherals[noblePeripheralId], `no noblePeripheral found with id "${noblePeripheralId}"`);
    }
    #devices = {};
    get devices() {
        return this.#devices;
    }
    async connectToDevice(deviceId, connectionType) {
        super.connectToDevice(deviceId, connectionType);
        this.#assertValidNoblePeripheralId(deviceId);
        const noblePeripheral = this.#noblePeripherals[deviceId];
        _console$5.log("connecting to discoveredDevice...", deviceId);
        let device = DeviceManager.availableDevices
            .filter((device) => device.connectionType == "noble")
            .find((device) => device.bluetoothId == deviceId);
        device = device ?? this.#devices[deviceId];
        if (!device) {
            _console$5.log("creating device for discoveredDevice...", deviceId);
            device = this.#createDevice(noblePeripheral);
            this.#devices[deviceId] = device;
            const { ipAddress, isWifiSecure } = this.discoveredDevices[device.bluetoothId];
            if (connectionType && connectionType != "noble" && ipAddress) {
                await device.connect({ type: connectionType, ipAddress, isWifiSecure });
            }
            else {
                await device.connect();
            }
        }
        else {
            const { ipAddress, isWifiSecure } = this.discoveredDevices[device.bluetoothId];
            if (connectionType &&
                connectionType != "noble" &&
                connectionType != device.connectionType &&
                ipAddress) {
                await device.connect({ type: connectionType, ipAddress, isWifiSecure });
            }
            else {
                await device.reconnect();
            }
        }
    }
    async disconnectFromDevice(deviceId) {
        super.disconnectFromDevice(deviceId);
        this.#assertValidNoblePeripheralId(deviceId);
        let device = DeviceManager.availableDevices
            .filter((device) => device.connectionType == "noble")
            .find((device) => device.bluetoothId == deviceId);
        device = device ?? this.#devices[deviceId];
        if (device) {
            await device.disconnect();
        }
    }
    #createDevice(noblePeripheral) {
        const device = new Device();
        const nobleConnectionManager = new NobleConnectionManager();
        nobleConnectionManager.noblePeripheral = noblePeripheral;
        device.connectionManager = nobleConnectionManager;
        return device;
    }
}

createConsole("NullScanner", { log: false });
class NullScanner extends BaseScanner {
    static get isSupported() {
        return true;
    }
    get isScanning() {
        return false;
    }
    get isScanningAvailable() {
        return false;
    }
    get canReset() {
        return false;
    }
    #devices = {};
    get devices() {
        return this.#devices;
    }
}

const _console$4 = createConsole("Scanner", { log: false });
let scanner$1;
if (NobleScanner.isSupported) {
    _console$4.log("using NobleScanner");
    scanner$1 = new NobleScanner();
}
else {
    _console$4.log("Scanner not available");
    scanner$1 = new NullScanner();
}
var scanner = scanner$1;

class GuardManager {
    #guards = [];
    add(guard) {
        if (this.#guards.includes(guard)) {
            return;
        }
        this.#guards.push(guard);
    }
    remove(guard) {
        if (!this.#guards.includes(guard)) {
            return;
        }
        this.#guards.splice(this.#guards.indexOf(guard), 1);
    }
    evaluate(...args) {
        return this.#guards.every((guard) => guard(...args));
    }
    clear() {
        this.length = 0;
    }
    get length() {
        return this.#guards.length;
    }
    set length(newLength) {
        this.#guards.length = newLength;
    }
    get isEmpty() {
        return this.length == 0;
    }
}

var _a;
const RequiredDeviceInformationMessageTypes = [
    ...DeviceInformationTypes,
    "batteryLevel",
    ...RequiredInformationConnectionMessages,
    ...RequiredPressureMessageTypes,
    ...RequiredWifiMessageTypes,
    ...RequiredFileTransferMessageTypes,
    ...RequiredTfliteMessageTypes,
    ...RequiredCameraMessageTypes,
    ...RequiredMicrophoneMessageTypes,
    ...RequiredDisplayMessageTypes,
];
const _console$3 = createConsole("BaseServer", { log: false });
const ServerEventTypes = [
    "clientConnected",
    "clientDisconnected",
];
class BaseServer {
    #eventDispatcher = new EventDispatcher(this, ServerEventTypes);
    get addEventListener() {
        return this.#eventDispatcher.addEventListener;
    }
    get dispatchEvent() {
        return this.#eventDispatcher.dispatchEvent;
    }
    get removeEventListener() {
        return this.#eventDispatcher.removeEventListener;
    }
    get waitForEvent() {
        return this.#eventDispatcher.waitForEvent;
    }
    constructor() {
        _console$3.assertWithError(scanner, "no scanner defined");
        addEventListeners(scanner, this.#boundScannerListeners);
        addEventListeners(DeviceManager, this.#boundDeviceManagerListeners);
        addEventListeners(this, this.#boundServerListeners);
    }
    clients = [];
    static #ClearSensorConfigurationsWhenNoClients = true;
    static get ClearSensorConfigurationsWhenNoClients() {
        return this.#ClearSensorConfigurationsWhenNoClients;
    }
    static set ClearSensorConfigurationsWhenNoClients(newValue) {
        _console$3.assertTypeWithError(newValue, "boolean");
        this.#ClearSensorConfigurationsWhenNoClients = newValue;
    }
    #clearSensorConfigurationsWhenNoClients = _a.#ClearSensorConfigurationsWhenNoClients;
    get clearSensorConfigurationsWhenNoClients() {
        return this.#clearSensorConfigurationsWhenNoClients;
    }
    set clearSensorConfigurationsWhenNoClients(newValue) {
        _console$3.assertTypeWithError(newValue, "boolean");
        this.#clearSensorConfigurationsWhenNoClients = newValue;
    }
    #boundServerListeners = {
        clientConnected: this.#onClientConnected.bind(this),
        clientDisconnected: this.#onClientDisconnected.bind(this),
    };
    #onClientConnected(event) {
        const client = event.message.client;
        if (!this.clients.includes(client)) {
            this.#recentClientDisplayContextCommandDataArrayBuffers.set(client, []);
            this.clients.push(client);
        }
        _console$3.log("onClientConnected");
        _console$3.log(`currently have ${this.clients.length} clients`);
    }
    #onClientDisconnected(event) {
        const client = event.message.client;
        if (this.clients.includes(client)) {
            this.clients.splice(this.clients.indexOf(client), 1);
            this.#recentClientDisplayContextCommandDataArrayBuffers.delete(client);
        }
        _console$3.log("onClientDisconnected");
        _console$3.log(`currently have ${this.clients.length} clients`);
        if (this.clients.length == 0 &&
            this.clearSensorConfigurationsWhenNoClients) {
            DeviceManager.connectedDevices.forEach((device) => {
                device.clearSensorConfiguration();
                device.setTfliteInferencingEnabled(false);
            });
        }
    }
    #sendToClient(client, message) {
        if (this.#allowServerToClient(client)) {
            this.sendToClient(client, message);
        }
    }
    broadcastMessage(message, clients = this.clients) {
        _console$3.log("broadcasting", message);
        clients.forEach((client) => {
            this.#sendToClient(client, message);
        });
    }
    #boundScannerListeners = {
        isScanningAvailable: this.#onScannerIsAvailable.bind(this),
        isScanning: this.#onScannerIsScanning.bind(this),
        discoveredDevice: this.#onScannerDiscoveredDevice.bind(this),
        expiredDiscoveredDevice: this.#onExpiredDiscoveredDevice.bind(this),
    };
    #onScannerIsAvailable(event) {
        this.broadcastMessage(this.#isScanningAvailableMessage, this.#filterServerToClients("isScanningAvailable"));
    }
    get #isScanningAvailableMessage() {
        return createServerMessage({
            type: "isScanningAvailable",
            data: scanner.isScanningAvailable,
        });
    }
    #onScannerIsScanning(event) {
        this.broadcastMessage(this.#isScanningMessage, this.#filterServerToClients("isScanning"));
    }
    get #isScanningMessage() {
        return createServerMessage({
            type: "isScanning",
            data: scanner.isScanning,
        });
    }
    #onScannerDiscoveredDevice(event) {
        const { discoveredDevice } = event.message;
        _console$3.log(discoveredDevice);
        this.broadcastMessage(this.#createDiscoveredDeviceMessage(discoveredDevice), this.#filterServerToClients("discoveredDevice"));
    }
    #createDiscoveredDeviceMessage(discoveredDevice) {
        return createServerMessage({
            type: "discoveredDevice",
            data: discoveredDevice,
        });
    }
    #onExpiredDiscoveredDevice(event) {
        const { discoveredDevice } = event.message;
        _console$3.log("expired", discoveredDevice);
        this.broadcastMessage(this.#createExpiredDiscoveredDeviceMessage(discoveredDevice), this.#filterServerToClients("discoveredDevice"));
    }
    #createExpiredDiscoveredDeviceMessage(discoveredDevice) {
        return createServerMessage({
            type: "expiredDiscoveredDevice",
            data: discoveredDevice.bluetoothId,
        });
    }
    get #discoveredDevicesMessage() {
        const serverMessages = scanner.discoveredDevicesArray
            .filter((discoveredDevice) => {
            const existingConnectedDevice = DeviceManager.connectedDevices.find((device) => device.bluetoothId == discoveredDevice.bluetoothId);
            return !existingConnectedDevice;
        })
            .map((discoveredDevice) => {
            return { type: "discoveredDevice", data: discoveredDevice };
        });
        return createServerMessage(...serverMessages);
    }
    get #connectedDevicesMessage() {
        return createServerMessage({
            type: "connectedDevices",
            data: JSON.stringify({
                connectedDevices: DeviceManager.connectedDevices.map((device) => device.bluetoothId),
            }),
        });
    }
    #boundDeviceListeners = {
        connectionMessage: this.#onDeviceConnectionMessage.bind(this),
        displayContextCommands: this.#onDeviceDisplayContextCommands.bind(this),
    };
    #createDeviceMessage(device, messageType, dataView) {
        switch (messageType) {
            case "cameraData":
                return {
                    type: "cameraData",
                    data: dataView ?? device._buildCameraData(),
                };
            case "displayContextCommands":
                return {
                    type: "displayContextCommands",
                    data: serializeDisplayContextCommands(device.displayManager, [
                        ...device.displayManager.serializeColors(),
                        ...device.displayManager.serializeOpacities(),
                        ...device.displayManager.serializeContextState(),
                    ]),
                };
            default:
                if (ConnectionMessageTypes.includes(messageType)) {
                    const connectionMessageType = messageType;
                    _console$3.assertWithError(device.latestConnectionMessages.has(connectionMessageType), `device doesn't have messageType "${messageType}"`);
                    dataView =
                        dataView ??
                            device.latestConnectionMessages.get(connectionMessageType);
                }
                return {
                    type: messageType,
                    data: dataView,
                };
        }
    }
    #onDeviceConnectionMessage(deviceEvent) {
        const { target: device, message: deviceConnectionMessage } = deviceEvent;
        _console$3.log("onDeviceConnectionMessage", deviceConnectionMessage);
        if (!device.isConnected) {
            return;
        }
        const { messageType, dataView } = deviceConnectionMessage;
        switch (messageType) {
            case "sensorData":
                if (!this.deviceSensorDataToClientGuardManager.isEmpty) {
                    const clientSensorDataMessageMap = new Map();
                    const timestampArrayBuffer = dataView.buffer.slice(0, 2);
                    parseSensorData(dataView, (sensorType, sensorDataView, context, isLast) => {
                        this.clients.forEach((client) => {
                            if (this.#allowDeviceSensorDataToClient(device, client, sensorType, sensorDataView)) {
                                if (!clientSensorDataMessageMap.has(client)) {
                                    clientSensorDataMessageMap.set(client, []);
                                }
                                clientSensorDataMessageMap.get(client).push(createMessage(SensorTypes, false, {
                                    type: sensorType,
                                    data: sensorDataView,
                                }));
                            }
                        });
                    });
                    clientSensorDataMessageMap.forEach((data, client) => {
                        const dataView = new DataView(concatenateArrayBuffers(timestampArrayBuffer, ...data));
                        const deviceMessage = this.#createDeviceMessage(device, "sensorData", dataView);
                        this.#sendToClient(client, this.#createDeviceServerMessage(device, deviceMessage));
                    });
                    return;
                }
                break;
        }
        const deviceMessage = this.#createDeviceMessage(device, messageType, dataView);
        this.broadcastMessage(this.#createDeviceServerMessage(device, deviceMessage), this.#allowDeviceToClients(device, deviceMessage));
    }
    #recentClientDisplayContextCommandDataArrayBuffers = new Map();
    #onDeviceDisplayContextCommands(deviceEvent) {
        const { target: device, message: deviceConnectionMessage, type, } = deviceEvent;
        _console$3.log("onDeviceDisplayContextCommands", deviceConnectionMessage);
        if (!device.isConnected) {
            return;
        }
        const { displayContextCommands } = deviceConnectionMessage;
        const displayContextCommandsData = serializeDisplayContextCommands(device.displayManager, displayContextCommands);
        this.clients.forEach((client) => {
            const recentClientDisplayContextCommandDataArrayBuffers = this.#recentClientDisplayContextCommandDataArrayBuffers.get(client);
            if (recentClientDisplayContextCommandDataArrayBuffers &&
                recentClientDisplayContextCommandDataArrayBuffers?.length > 0) {
                const arrayBufferIndex = recentClientDisplayContextCommandDataArrayBuffers.findIndex((arrayBuffer) => areArrayBuffersEqual(arrayBuffer, displayContextCommandsData));
                if (arrayBufferIndex != -1) {
                    _console$3.log("skipping displayContextCommands from client", client, {
                        arrayBufferIndex,
                    });
                    recentClientDisplayContextCommandDataArrayBuffers.splice(arrayBufferIndex, 1);
                    return;
                }
            }
            const filteredDisplayContextCommands = displayContextCommands.filter((displayContextCommand) => {
                return this.#allowDeviceDisplayContextCommandToClient(device, client, displayContextCommand);
            });
            _console$3.log("filteredDisplayContextCommands", filteredDisplayContextCommands);
            const filteredDisplayContextCommandsData = serializeDisplayContextCommands(device.displayManager, filteredDisplayContextCommands);
            if (filteredDisplayContextCommandsData.byteLength == 0) {
                _console$3.log("no filteredDisplayContextCommandsData");
                return;
            }
            const deviceMessage = {
                type,
                data: filteredDisplayContextCommandsData,
            };
            if (this.#allowDeviceToClient(device, client, deviceMessage)) {
                this.#sendToClient(client, this.#createDeviceServerMessage(device, deviceMessage));
            }
        });
    }
    #boundDeviceManagerListeners = {
        deviceConnected: this.#onDeviceConnected.bind(this),
        deviceNotConnected: this.#onDeviceNotConnected.bind(this),
        deviceIsConnected: this.#onDeviceIsConnected.bind(this),
    };
    #onDeviceConnected(staticDeviceEvent) {
        const { device } = staticDeviceEvent.message;
        _console$3.log("onDeviceConnected", device.bluetoothId);
        addEventListeners(device, this.#boundDeviceListeners);
    }
    #onDeviceNotConnected(staticDeviceEvent) {
        const { device } = staticDeviceEvent.message;
        _console$3.log("onDeviceNotConnected", device.bluetoothId);
        removeEventListeners(device, this.#boundDeviceListeners);
    }
    #onDeviceIsConnected(staticDeviceEvent) {
        const { device } = staticDeviceEvent.message;
        _console$3.log("onDeviceIsConnected", device.bluetoothId);
        this.broadcastMessage(this.#createDeviceIsConnectedMessage(device), this.#allowDeviceToClients(device, "isConnected"));
    }
    #createDeviceIsConnectedMessage(device) {
        return this.#createDeviceServerMessage(device, {
            type: "isConnected",
            data: device.isConnected,
        });
    }
    #createDeviceServerMessage(device, ...messages) {
        _console$3.log("#createDeviceServerMessage", ...messages);
        return createServerMessage({
            type: "deviceMessage",
            data: [device.bluetoothId, createDeviceMessage(...messages)],
        });
    }
    clientToServerGuardManager = new GuardManager();
    serverToClientGuardManager = new GuardManager();
    #allowServerToClient(client, message) {
        if (typeof message == "string") {
            message = { type: message };
        }
        return this.serverToClientGuardManager.evaluate({
            client,
            message,
            server: this,
        });
    }
    #filterServerToClients(message) {
        return this.clients.filter((client) => this.#allowServerToClient(client, message));
    }
    #allowClientToServer(client, message) {
        return this.clientToServerGuardManager.evaluate({
            message,
            client,
            server: this,
        });
    }
    clientToDeviceGuardManager = new GuardManager();
    #allowClientToDevice(client, device, message) {
        return this.clientToDeviceGuardManager.evaluate({
            device,
            client,
            message,
            server: this,
        });
    }
    deviceToClientGuardManager = new GuardManager();
    #allowDeviceToClient(device, client, message) {
        if (typeof message == "string") {
            message = { type: message };
        }
        return this.deviceToClientGuardManager.evaluate({
            device,
            client,
            message,
            server: this,
        });
    }
    #allowDeviceToClients(device, message) {
        return this.clients.filter((client) => this.#allowDeviceToClient(device, client, message));
    }
    deviceSensorDataToClientGuardManager = new GuardManager();
    #allowDeviceSensorDataToClient(device, client, sensorType, sensorData) {
        return this.deviceSensorDataToClientGuardManager.evaluate({
            device,
            client,
            sensorType,
            sensorData,
            server: this,
        });
    }
    clientSensorConfigurationToDeviceGuardManager = new GuardManager();
    #allowClientSensorConfigurationToDevice(device, client, sensorType, sensorRate) {
        return this.clientSensorConfigurationToDeviceGuardManager.evaluate({
            device,
            client,
            sensorType,
            sensorRate,
            server: this,
        });
    }
    clientDisplayContextCommandToDeviceGuardManager = new GuardManager();
    #allowClientDisplayContextCommandToDevice(device, client, displayContextCommand) {
        return this.clientDisplayContextCommandToDeviceGuardManager.evaluate({
            device,
            client,
            displayContextCommand,
            server: this,
        });
    }
    deviceDisplayContextCommandToClientGuardManager = new GuardManager();
    #allowDeviceDisplayContextCommandToClient(device, client, displayContextCommand) {
        return this.deviceDisplayContextCommandToClientGuardManager.evaluate({
            device,
            client,
            displayContextCommand,
            server: this,
        });
    }
    parseClientMessage(client, dataView) {
        let responseMessages = [];
        const context = {
            responseMessages,
            client,
        };
        if (!this.#allowClientToServer(client)) {
            return;
        }
        parseMessage(dataView, ServerMessageTypes, this.#onClientMessage.bind(this), context, true);
        responseMessages = responseMessages.filter(Boolean);
        if (responseMessages.length > 0) {
            return concatenateArrayBuffers(responseMessages);
        }
    }
    #onClientMessage(messageType, dataView, context) {
        _console$3.log(`onClientMessage "${messageType}" (${dataView.byteLength} bytes)`);
        const { client, responseMessages } = context;
        const message = { type: messageType, data: dataView };
        if (!this.#allowClientToServer(client, message)) {
            return;
        }
        switch (messageType) {
            case "isScanningAvailable":
                if (this.#allowServerToClient(client, "isScanningAvailable")) {
                    responseMessages.push(this.#isScanningAvailableMessage);
                }
                break;
            case "isScanning":
                if (this.#allowServerToClient(client, "isScanning")) {
                    responseMessages.push(this.#isScanningMessage);
                }
                break;
            case "startScan":
                scanner.startScan();
                break;
            case "stopScan":
                scanner.stopScan();
                break;
            case "discoveredDevices":
                if (this.#allowServerToClient(client, "discoveredDevices")) {
                    responseMessages.push(this.#discoveredDevicesMessage);
                }
                break;
            case "connectToDevice":
                {
                    const { string: deviceId, byteOffset } = parseStringFromDataView(dataView);
                    let connectionType = undefined;
                    if (byteOffset < dataView.byteLength) {
                        connectionType = ConnectionTypes[dataView.getUint8(byteOffset)];
                        _console$3.log(`connectToDevice ${deviceId} via ${connectionType}`);
                    }
                    else {
                        _console$3.log(`connecting to device with id ${deviceId}...`);
                    }
                    const device = DeviceManager.availableDevices.find((device) => device.bluetoothId == deviceId);
                    if (device) {
                        device.connect({ type: connectionType, reconnect: true });
                    }
                    else {
                        scanner.connectToDevice(deviceId, connectionType);
                    }
                }
                break;
            case "disconnectFromDevice":
                {
                    const { string: deviceId } = parseStringFromDataView(dataView);
                    if (!deviceId) {
                        break;
                    }
                    let device = DeviceManager.availableDevices.find((device) => device.bluetoothId == deviceId);
                    device = device ?? scanner.devices[deviceId];
                    if (!device) {
                        _console$3.error(`no device found with id ${deviceId}`);
                        break;
                    }
                    _console$3.log(`disconnecting from device with id ${deviceId}...`);
                    device.addEventListener("notConnected", () => {
                        this.broadcastMessage(this.#createDeviceIsConnectedMessage(device), this.#allowDeviceToClients(device, "isConnected"));
                    }, { once: true });
                    device.disconnect();
                }
                break;
            case "connectedDevices":
                if (this.#allowServerToClient(client, "connectedDevices")) {
                    responseMessages.push(this.#connectedDevicesMessage);
                }
                break;
            case "deviceMessage":
                {
                    const { string: deviceId, byteOffset } = parseStringFromDataView(dataView);
                    if (!deviceId) {
                        break;
                    }
                    const device = DeviceManager.connectedDevices.find((device) => device.bluetoothId == deviceId);
                    if (!device) {
                        _console$3.error(`no device found with id ${deviceId}`);
                        break;
                    }
                    const _dataView = new DataView(dataView.buffer, dataView.byteOffset + byteOffset);
                    const responseMessage = this.parseClientDeviceMessage(client, device, _dataView);
                    if (responseMessage) {
                        responseMessages.push(responseMessage);
                    }
                }
                break;
            case "requiredDeviceInformation":
                {
                    const { string: deviceId } = parseStringFromDataView(dataView);
                    if (!deviceId) {
                        break;
                    }
                    const device = DeviceManager.connectedDevices.find((device) => device.bluetoothId == deviceId);
                    if (!device) {
                        _console$3.error(`no device found with id ${deviceId}`);
                        break;
                    }
                    const messages = [];
                    RequiredDeviceInformationMessageTypes.forEach((messageType) => {
                        if (device.latestConnectionMessages.has(messageType) &&
                            this.#allowDeviceToClient(device, client, messageType)) {
                            messages.push(this.#createDeviceMessage(device, messageType));
                        }
                    });
                    if (device.hasCamera) {
                        if (this.#allowDeviceToClient(device, client, "cameraData")) {
                            messages.push(this.#createDeviceMessage(device, "cameraData"));
                        }
                    }
                    if (device.isDisplayAvailable) {
                        if (this.#allowDeviceToClient(device, client, "displayContextCommands")) {
                            messages.push(this.#createDeviceMessage(device, "displayContextCommands"));
                        }
                    }
                    const responseMessage = this.#createDeviceServerMessage(device, ...messages);
                    if (responseMessage) {
                        responseMessages.push(responseMessage);
                    }
                }
                break;
            default:
                _console$3.error(`uncaught messageType "${messageType}"`);
                break;
        }
        _console$3.log("responseMessages", responseMessages);
    }
    parseClientDeviceMessage(client, device, dataView) {
        _console$3.log("onDeviceMessage", device.bluetoothId, dataView);
        let deviceMessages = [];
        if (!this.#allowClientToDevice(client, device)) {
            return;
        }
        const context = {
            deviceMessages,
            device,
            client,
        };
        parseMessage(dataView, ConnectionMessageTypes, this.#parseClientDeviceMessageCallback.bind(this), context, true);
        if (deviceMessages.length > 0) {
            return this.#createDeviceServerMessage(device, ...deviceMessages);
        }
    }
    #filterClientToDeviceTxMessage(client, device, dataView, deviceMessages) {
        const filteredTxMessages = [];
        parseMessage(dataView, TxRxMessageTypes, (messageType, dataView) => {
            _console$3.log("filtering txMessage", { messageType, dataView });
            let message = { type: messageType, data: dataView };
            switch (message.type) {
                case "setSensorConfiguration":
                    if (!this.clientSensorConfigurationToDeviceGuardManager.isEmpty) {
                        _console$3.log("trimming sensorConfiguration...");
                        const sensorConfiguration = parseSensorConfiguration(message.data, (sensorType, sensorRate) => {
                            return this.#allowClientSensorConfigurationToDevice(device, client, sensorType, sensorRate);
                        });
                        _console$3.log("trimmed sensorConfiguration", sensorConfiguration);
                        const sensorConfigurationData = serializeSensorConfiguration(sensorConfiguration);
                        if (sensorConfigurationData.byteLength > 0) {
                            message.data = sensorConfigurationData;
                        }
                        else {
                            _console$3.log("no sensorConfigurationData - sending existing sensorConfiguration");
                            const getSensorConfigurationMessage = this.#createDeviceMessage(device, "getSensorConfiguration");
                            {
                                deviceMessages.push(getSensorConfigurationMessage);
                                return;
                            }
                        }
                    }
                    break;
                case "displayContextCommands":
                    if (!this.clientDisplayContextCommandToDeviceGuardManager.isEmpty) {
                        const displayContextCommands = parseDisplayContextCommands(device.displayManager, dataView);
                        _console$3.log("trimming displayContextCommands...", displayContextCommands);
                        const filteredDisplayContextCommands = displayContextCommands.filter((displayContextCommand) => {
                            return this.#allowClientDisplayContextCommandToDevice(device, client, displayContextCommand);
                        });
                        _console$3.log("filteredDisplayContextCommands", filteredDisplayContextCommands);
                        const filteredDisplayContextCommandsData = serializeDisplayContextCommands(device.displayManager, filteredDisplayContextCommands);
                        if (filteredDisplayContextCommandsData.byteLength == 0) {
                            _console$3.log("no filteredDisplayContextCommandsData");
                            return;
                        }
                        this.#recentClientDisplayContextCommandDataArrayBuffers
                            .get(client)
                            .push(filteredDisplayContextCommandsData);
                        message.data = filteredDisplayContextCommandsData;
                    }
                    break;
            }
            if (this.#allowClientToDevice(client, device, message)) {
                filteredTxMessages.push(createMessage(TxRxMessageTypes, true, message));
                device._onRemoteConnectionMessageSent(messageType, dataView);
            }
        }, null, true);
        return new DataView(concatenateArrayBuffers(...filteredTxMessages));
    }
    #parseClientDeviceMessageCallback(messageType, dataView, context) {
        _console$3.log(`clientDeviceMessage ${messageType} (${dataView.byteLength} bytes)`);
        const { client, device, deviceMessages } = context;
        const message = { type: messageType, data: dataView };
        if (!this.#allowClientToDevice(client, device, message)) {
            return;
        }
        switch (messageType) {
            case "smp":
                device.connectionManager.sendSmpMessage(dataView.buffer);
                break;
            case "tx":
                dataView = this.#filterClientToDeviceTxMessage(client, device, dataView, deviceMessages);
                device.connectionManager.sendTxData(dataView.buffer);
                break;
            default:
                deviceMessages.push(message);
                break;
        }
    }
}
_a = BaseServer;

const _console$2 = createConsole("WebSocketServer", { log: false });
class WebSocketServer extends BaseServer {
    #server;
    get server() {
        return this.#server;
    }
    set server(newServer) {
        if (this.#server == newServer) {
            _console$2.log("redundant WebSocket server assignment");
            return;
        }
        _console$2.log("assigning WebSocket server...");
        if (this.#server) {
            _console$2.log("clearing existing WebSocket server...");
            removeEventListeners(this.#server, this.#boundWebSocketServerListeners);
        }
        addEventListeners(newServer, this.#boundWebSocketServerListeners);
        this.#server = newServer;
        _console$2.log("assigned WebSocket server");
    }
    #boundWebSocketServerListeners = {
        close: this.#onWebSocketServerClose.bind(this),
        connection: this.#onWebSocketServerConnection.bind(this),
        error: this.#onWebSocketServerError.bind(this),
        headers: this.#onWebSocketServerHeaders.bind(this),
        listening: this.#onWebSocketServerListening.bind(this),
    };
    #onWebSocketServerClose() {
        _console$2.log("server.close");
    }
    #onWebSocketServerConnection(client) {
        _console$2.log("server.connection");
        client.isAlive = true;
        client.pingClientTimer = new Timer(() => this.#pingClient(client), webSocketPingTimeout);
        client.pingClientTimer.start();
        addEventListeners(client, this.#boundWebSocketClientListeners);
        this.dispatchEvent("clientConnected", { client });
    }
    #onWebSocketServerError(error) {
        _console$2.error(error);
    }
    #onWebSocketServerHeaders() {
    }
    #onWebSocketServerListening() {
        _console$2.log("server.listening");
    }
    #boundWebSocketClientListeners = {
        open: this.#onWebSocketClientOpen.bind(this),
        message: this.#onWebSocketClientMessage.bind(this),
        close: this.#onWebSocketClientClose.bind(this),
        error: this.#onWebSocketClientError.bind(this),
    };
    #onWebSocketClientOpen(event) {
        _console$2.log("client.open");
    }
    #onWebSocketClientMessage(event) {
        _console$2.log("client.message");
        const client = event.target;
        client.isAlive = true;
        client.pingClientTimer.restart();
        const dataView = new DataView(dataToArrayBuffer(event.data));
        _console$2.log(`received ${dataView.byteLength} bytes`, dataView.buffer);
        this.#parseWebSocketClientMessage(client, dataView);
    }
    #onWebSocketClientClose(event) {
        _console$2.log("client.close");
        const client = event.target;
        client.pingClientTimer.stop();
        removeEventListeners(client, this.#boundWebSocketClientListeners);
        this.dispatchEvent("clientDisconnected", { client });
    }
    #onWebSocketClientError(event) {
        _console$2.error("client.error", event.message);
    }
    #parseWebSocketClientMessage(client, dataView) {
        let responseMessages = [];
        const context = { responseMessages, client };
        parseMessage(dataView, WebSocketMessageTypes$1, this.#onClientMessage.bind(this), context, true);
        responseMessages = responseMessages.filter(Boolean);
        const responseMessage = concatenateArrayBuffers(responseMessages);
        _console$2.log(`sending ${responseMessage.byteLength} bytes to client...`);
        this.#sendToClient(client, responseMessage);
    }
    #onClientMessage(messageType, dataView, context) {
        const { responseMessages, client } = context;
        _console$2.log("onClientMessage", { messageType });
        switch (messageType) {
            case "ping":
                responseMessages.push(webSocketPongMessage);
                break;
            case "pong":
                break;
            case "serverMessage":
                const responseMessage = this.parseClientMessage(client, dataView);
                if (responseMessage) {
                    responseMessages.push(createWebSocketMessage$1({
                        type: "serverMessage",
                        data: responseMessage,
                    }));
                }
                break;
            default:
                _console$2.error(`uncaught messageType "${messageType}"`);
                break;
        }
    }
    #sendToClient(client, message) {
        if (message.byteLength == 0) {
            _console$2.log("nothing to send back");
            return;
        }
        _console$2.log(`sending ${message.byteLength} bytes to client`);
        try {
            client.send(message);
        }
        catch (error) {
            _console$2.log("error sending message", error);
        }
    }
    sendToClient(client, message) {
        this.#sendToClient(client, createWebSocketMessage$1({ type: "serverMessage", data: message }));
    }
    #pingClient(client) {
        if (!client.isAlive) {
            client.terminate();
            return;
        }
        client.isAlive = false;
        this.#sendToClient(client, webSocketPingMessage);
    }
}

const _console$1 = createConsole("UDPUtils", { log: false });
const removeUDPClientTimeout = 4_000;
const UDPServerMessageTypes = [
    "ping",
    "pong",
    "setRemoteReceivePort",
    "serverMessage",
];
function createUDPServerMessage(...messages) {
    _console$1.log("createUDPServerMessage", ...messages);
    return createMessage(UDPServerMessageTypes, true, ...messages);
}
createUDPServerMessage("ping");
const udpPongMessage = createUDPServerMessage("pong");

const _console = createConsole("UDPServer", { log: false });
class UDPServer extends BaseServer {
    #getClientByRemoteInfo(remoteInfo, createIfNotFound = false) {
        const { address, port } = remoteInfo;
        let client = this.clients.find((client) => client.address == address && client.port == port);
        if (!client && createIfNotFound) {
            client = {
                ...remoteInfo,
                isAlive: true,
                removeSelfTimer: new Timer(() => {
                    _console.log("removing client due to timeout...");
                    this.#removeClient(client);
                }, removeUDPClientTimeout),
                lastTimeSentData: 0,
            };
            _console.log("created new client", client);
            this.dispatchEvent("clientConnected", { client });
        }
        return client;
    }
    #remoteInfoToString(client) {
        const { address, port } = client;
        return `${address}:${port}`;
    }
    #clientToString(client) {
        const { address, port, receivePort } = client;
        return `${address}:${port}=>${receivePort}`;
    }
    #socket;
    get socket() {
        return this.#socket;
    }
    set socket(newSocket) {
        if (this.#socket == newSocket) {
            _console.log("redundant udp socket assignment");
            return;
        }
        _console.log("assigning udp socket...");
        if (this.#socket) {
            _console.log("clearing existing udp socket...");
            removeEventListeners(this.#socket, this.#boundSocketListeners);
        }
        addEventListeners(newSocket, this.#boundSocketListeners);
        this.#socket = newSocket;
        _console.log("assigned udp socket");
    }
    #boundSocketListeners = {
        close: this.#onSocketClose.bind(this),
        connect: this.#onSocketConnect.bind(this),
        error: this.#onSocketError.bind(this),
        listening: this.#onSocketListening.bind(this),
        message: this.#onSocketMessage.bind(this),
    };
    #onSocketClose() {
        _console.log("socket close");
    }
    #onSocketConnect() {
        _console.log("socket connect");
    }
    #onSocketError(error) {
        _console.error("socket error", error);
    }
    #onSocketListening() {
        const address = this.#socket.address();
        _console.log(`socket listening on port ${address.address}:${address.port}`);
    }
    #onSocketMessage(message, remoteInfo) {
        _console.log(`received ${message.length} bytes from ${this.#remoteInfoToString(remoteInfo)}`);
        const client = this.#getClientByRemoteInfo(remoteInfo, true);
        if (!client) {
            _console.error("no client found");
            return;
        }
        client.removeSelfTimer.restart();
        const dataView = new DataView(dataToArrayBuffer(message));
        this.#onClientData(client, dataView);
    }
    #onClientData(client, dataView) {
        _console.log(`parsing ${dataView.byteLength} bytes from ${this.#clientToString(client)}`, dataView.buffer);
        let responseMessages = [];
        const context = { responseMessages, client };
        parseMessage(dataView, UDPServerMessageTypes, this.#onClientMessage.bind(this), context, true);
        responseMessages = responseMessages.filter(Boolean);
        const response = concatenateArrayBuffers(responseMessages);
        _console.log(`responding with ${response.byteLength} bytes...`, response);
        this.#sendToClient(client, response);
    }
    #onClientMessage(messageType, dataView, context) {
        const { client, responseMessages } = context;
        _console.log(`received "${messageType}" message from ${client.address}:${client.port}`);
        switch (messageType) {
            case "ping":
                responseMessages.push(this.#createPongMessage(context));
                break;
            case "pong":
                break;
            case "setRemoteReceivePort":
                responseMessages.push(this.#parseRemoteReceivePort(dataView, client));
                break;
            case "serverMessage":
                const responseMessage = this.parseClientMessage(client, dataView);
                if (responseMessage) {
                    responseMessages.push(createUDPServerMessage({
                        type: "serverMessage",
                        data: responseMessage,
                    }));
                }
                break;
            default:
                _console.error(`uncaught messageType "${messageType}"`);
                break;
        }
    }
    #createPongMessage(context) {
        const { client } = context;
        return udpPongMessage;
    }
    #parseRemoteReceivePort(dataView, client) {
        const receivePort = dataView.getUint16(0);
        client.receivePort = receivePort;
        _console.log(`updated ${client.address}:${client.port} receivePort to ${receivePort}`);
        const responseDataView = new DataView(new ArrayBuffer(2));
        responseDataView.setUint16(0, client.receivePort);
        return createUDPServerMessage({
            type: "setRemoteReceivePort",
            data: responseDataView,
        });
    }
    #sendToClient(client, message) {
        if (message.byteLength == 0) {
            _console.log("no response to send");
            return;
        }
        if (client.receivePort == undefined) {
            _console.log("client has no defined receivePort");
            return;
        }
        _console.log(`sending ${message.byteLength} bytes to ${this.#clientToString(client)}...`);
        try {
            this.#socket.send(new Uint8Array(message), client.receivePort, client.address, (error, bytes) => {
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
    }
    sendToClient(client, message) {
        this.#sendToClient(client, createUDPServerMessage({ type: "serverMessage", data: message }));
    }
    #removeClient(client) {
        _console.log(`removing client ${this.#clientToString(client)}...`);
        client.removeSelfTimer.stop();
        this.dispatchEvent("clientDisconnected", { client });
    }
}

const EventUtils = {
    addEventListeners,
    removeEventListeners,
};
const ThrottleUtils = {
    throttle,
    debounce,
};

export { ConnectionEventTypes, ConnectionManagers, ConnectionMessageTypes, Device, DeviceEventTypes, DeviceManager, DevicePair, DevicePairTypes, DisplayContextCommandTypes, DisplaySpriteContextCommandTypes, environment as Environment, EventUtils, LedTypes, LedValueTypes, RangeHelper, RangeHelper2, scanner as Scanner, ThrottleUtils, TxRxMessageTypes, UDPServer, WebSocketServer, englishRegex, fontToSpriteSheet, getFontMaxHeight, getFontMetrics, getFontUnicodeRange, getMaxSpriteSheetSize, getTensorFlowModel, hexToRGB, isTensorFlowAvailable, isTensorFlowModelAvailable, listTensorflowModels, parseFont, projectColor, rgbToHex, setAllConsoleLevelFlags, setConsoleLevelFlagsForType, simplifyCurves, simplifyPoints, simplifyPointsAsCubicCurveControlPoints, stringToSprites, wildcardEventType };
//# sourceMappingURL=brilliantsole.node.module.js.map
