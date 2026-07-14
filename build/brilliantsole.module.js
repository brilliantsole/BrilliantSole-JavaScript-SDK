/**
 * @copyright Zack Qattan 2024
 * @license MIT
 */
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
const table$1 = isInNode
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
        return this.#levelFlags.table ? table$1 : emptyFunction;
    }
    assertWithError(condition, message) {
        assertWithError(condition, message);
    }
    assertTypeWithError(value, type) {
        this.assertWithError(typeof value == type, `value ${value} of type "${typeof value}" not of type "${type}"`);
    }
    assertEnumWithError(enumeration, value) {
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

const _console$Z = createConsole("EventDispatcher", { log: false });
const wildcardEventType = "*";
class EventDispatcher {
    #listeners = {};
    #latestEvents = {};
    #target;
    #validEventTypes;
    constructor(target, validEventTypes) {
        autoBind(this);
        this.#target = target;
        this.#validEventTypes = validEventTypes;
        _console$Z.assertWithError(
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
            _console$Z.log(`creating "${type}" listeners array`, this.#listeners[type]);
        }
        const alreadyAdded = this.#listeners[type].find((listenerObject) => {
            return (listenerObject.listener === listener &&
                listenerObject.once === options.once &&
                listenerObject.immediate === options.immediate
            );
        });
        if (alreadyAdded) {
            _console$Z.log("already added listener");
            return;
        }
        if (options.signal) {
            _console$Z.log(`listening to "abort" signal`);
            options.signal.addEventListener("abort", () => {
                _console$Z.log(`removing listener after receiving "abort" signal`);
                this.removeEventListener(type, listener);
            }, { once: true });
        }
        const listenerObj = {
            listener,
            once: options.once,
            immediate: options.immediate,
            signal: options.signal,
        };
        _console$Z.log(`adding "${type}" listener`, listenerObj);
        this.#listeners[type].push(listenerObj);
        _console$Z.log(`currently have ${this.#listeners[type].length} "${type}" listeners`);
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
        _console$Z.log(`removing "${type}" listener...`, listener);
        let foundListener = false;
        this.#listeners[type].forEach((listenerObj) => {
            const isListenerToRemove = listenerObj.listener === listener;
            if (isListenerToRemove) {
                _console$Z.log(`flagging "${type}" listener`, listener);
                listenerObj.shouldRemove = true;
                foundListener = true;
            }
        });
        if (foundListener) {
            this.#updateEventListeners(type);
        }
    }
    removeEventListeners(type) {
        if (!this.#isValidListenerType(type)) {
            throw new Error(`Invalid event type: ${type}`);
        }
        if (!this.#listeners[type])
            return;
        _console$Z.log(`removing "${type}" listeners...`);
        this.#listeners[type] = [];
    }
    removeAllEventListeners() {
        _console$Z.log(`removing listeners...`);
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
        _console$Z.log(`dispatching "${type}" listener`, listenerObj);
        try {
            listenerObj.listener({ type, target: this.#target, message });
        }
        catch (error) {
            console.error(error);
        }
        if (listenerObj.once) {
            _console$Z.log(`flagging "${type}" listener`, listenerObj);
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

const _console$Y = createConsole("Timer", { log: false });
async function wait(delay) {
    _console$Y.log(`waiting for ${delay}ms`);
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
        _console$Y.assertTypeWithError(newCallback, "function");
        _console$Y.log({ newCallback });
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
        _console$Y.assertTypeWithError(newInterval, "number");
        _console$Y.assertWithError(newInterval > 0, "interval must be above 0");
        _console$Y.log({ newInterval });
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
            _console$Y.log("interval already running");
            return;
        }
        _console$Y.log(`starting interval every ${this.#interval}ms`);
        this.#intervalId = setInterval(this.#callback, this.#interval);
        if (immediately) {
            this.#callback();
        }
    }
    stop() {
        if (!this.isRunning) {
            _console$Y.log("interval already not running");
            return;
        }
        _console$Y.log("stopping interval");
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

const _console$X = createConsole("ArrayBufferUtils", { log: false });
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
    _console$X.log({ dataView, begin, end, length });
    return new DataView(dataView.buffer.slice(dataView.byteOffset + begin, end));
}
async function getFileBuffer(file) {
    let fileBuffer;
    if (file instanceof Array) {
        fileBuffer = Uint8Array.from(file).buffer;
    }
    else if (file instanceof DataView) {
        fileBuffer = file.buffer;
    }
    else if (typeof file == "string" || file instanceof URL) {
        const response = await fetch(file);
        fileBuffer = await response.arrayBuffer();
    }
    else if (file instanceof File || file instanceof Blob) {
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

var _a$7;
const _console$W = createConsole("FileTransferManager", { log: false });
const emptyHeaderDataView = new DataView(new ArrayBuffer(2));
emptyHeaderDataView.setUint16(0, 2, true);
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
const FileTransferDirections = ["sending", "receiving"];
const FileTransferEventTypes = [
    ...FileTransferMessageTypes,
    "fileTransferProgress",
    "fileTransferComplete",
    "fileReceived",
    "fileSent",
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
    get removeEventListener() {
        return this.eventDispatcher.removeEventListener;
    }
    get waitForEvent() {
        return this.eventDispatcher.waitForEvent;
    }
    #assertValidType(type) {
        _console$W.assertEnumWithError(FileTypes, type);
    }
    #isValidType(type) {
        return FileTypes.includes(type);
    }
    #assertValidTypeEnum(typeEnum) {
        _console$W.assertWithError(typeEnum in FileTypes, `invalid typeEnum ${typeEnum}`);
    }
    #assertValidStatusEnum(statusEnum) {
        _console$W.assertWithError(statusEnum in FileTransferStatuses, `invalid statusEnum ${statusEnum}`);
    }
    #assertValidCommand(command) {
        _console$W.assertEnumWithError(FileTransferCommands, command);
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
        _console$W.log("fileTypes", fileTypes);
        this.#dispatchEvent("getFileTypes", {
            fileTypes: this.#fileTypes,
        });
    }
    static #MaxLength = 0;
    static get MaxLength() {
        return this.#MaxLength;
    }
    #maxLength = _a$7.MaxLength;
    get maxLength() {
        return this.#maxLength;
    }
    #parseMaxLength(dataView) {
        _console$W.log("parseFileMaxLength", dataView);
        const maxLength = dataView.getUint32(0, true);
        _console$W.log(`maxLength: ${maxLength / 1024}kB`);
        this.#updateMaxLength(maxLength);
    }
    #updateMaxLength(maxLength) {
        _console$W.log({ maxLength });
        this.#maxLength = maxLength;
        this.#dispatchEvent("maxFileLength", { maxFileLength: maxLength });
    }
    #assertValidLength(length) {
        _console$W.assertWithError(length <= this.maxLength, `file length ${length}kB too large - must be ${this.maxLength}kB or less`);
    }
    #type;
    get type() {
        return this.#type;
    }
    #parseType(dataView) {
        _console$W.log("parseFileType", dataView);
        const typeEnum = dataView.getUint8(0);
        this.#assertValidTypeEnum(typeEnum);
        const type = FileTypes[typeEnum];
        this.#updateType(type);
    }
    #updateType(type) {
        _console$W.log({ fileTransferType: type });
        this.#type = type;
        this.#dispatchEvent("getFileType", { fileType: type });
    }
    async #setType(newType, sendImmediately) {
        this.#assertValidType(newType);
        if (this.type == newType) {
            _console$W.log(`redundant type assignment ${newType}`);
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
        _console$W.log("parseFileLength", dataView);
        const length = dataView.getUint32(0, true);
        this.#updateLength(length);
    }
    #updateLength(length) {
        _console$W.log(`length: ${length / 1024}kB (${length} bytes)`);
        this.#length = length;
        this.#dispatchEvent("getFileLength", { fileLength: length });
    }
    async #setLength(newLength, sendImmediately) {
        _console$W.assertTypeWithError(newLength, "number");
        this.#assertValidLength(newLength);
        if (this.length == newLength) {
            _console$W.log(`redundant length assignment ${newLength}`);
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
        _console$W.log("checksum", dataView);
        const checksum = dataView.getUint32(0, true);
        this.#updateChecksum(checksum);
    }
    #updateChecksum(checksum) {
        _console$W.log({ checksum });
        this.#checksum = checksum;
        this.#dispatchEvent("getFileChecksum", { fileChecksum: checksum });
    }
    async #setChecksum(newChecksum, sendImmediately) {
        _console$W.assertTypeWithError(newChecksum, "number");
        if (this.checksum == newChecksum) {
            _console$W.log(`redundant checksum assignment ${newChecksum}`);
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
        _console$W.log(`setting command ${command}`);
        const commandEnum = FileTransferCommands.indexOf(command);
        this.sendMessage([
            {
                type: "setFileTransferCommand",
                data: UInt8ByteBuffer(commandEnum),
            },
        ], sendImmediately);
        await promise;
    }
    #parseFileTransferCommand(dataView) {
        _console$W.log("parseFileTransferCommand", dataView);
        const commandEnum = dataView.getUint8(0);
        const command = FileTransferCommands[commandEnum];
        _console$W.assertEnumWithError(FileTransferCommands, command);
        _console$W.log({ command });
    }
    #status = "idle";
    get status() {
        return this.#status;
    }
    #parseStatus(dataView) {
        _console$W.log("parseFileStatus", dataView);
        const statusEnum = dataView.getUint8(0);
        this.#assertValidStatusEnum(statusEnum);
        const status = FileTransferStatuses[statusEnum];
        this.#updateStatus(status);
    }
    #updateStatus(status) {
        _console$W.log({ status });
        this.#status = status;
        this.#receivedBlocks.length = 0;
        this.#isCancelling = false;
        this.#buffer = undefined;
        this.#bytesTransferred = 0;
        this.#dispatchEvent("fileTransferStatus", {
            fileTransferStatus: status,
            fileType: this.type,
        });
        if (this.#isRequestingReceive && this.status != "receiving") {
            this.#isRequestingReceive = false;
        }
    }
    #assertIsIdle() {
        _console$W.assertWithError(this.#status == "idle", "status is not idle");
    }
    #assertIsNotIdle() {
        _console$W.assertWithError(this.#status != "idle", "status is idle");
    }
    #receivedBlocks = [];
    async #parseFileBlock(dataView) {
        _console$W.log("parseFileBlock", dataView);
        this.#receivedBlocks.push(dataView.buffer);
        const bytesReceived = this.#receivedBlocks.reduce((sum, arrayBuffer) => (sum += arrayBuffer.byteLength), 0);
        this.#bytesTransferred = bytesReceived;
        const progress = bytesReceived / this.#length;
        _console$W.log(`received ${bytesReceived}/${this.#length} bytes (${progress * 100}%) - ${this.#length - bytesReceived} bytes remaining`);
        const indirectly = !this.#isRequestingReceive;
        const fileType = this.type;
        let file;
        const isComplete = progress == 1;
        _console$W.log({ isComplete });
        if (isComplete) {
            file = await this.#createFile(this.#receivedBlocks);
            _console$W.assertWithError(file, "file not created");
            _console$W.log("received file", file);
        }
        else {
            if (this.#isRequestingReceive) {
                const dataView = new DataView(new ArrayBuffer(4));
                dataView.setUint32(0, bytesReceived, true);
                _console$W.log("sending fileBytesTransferred", { bytesReceived });
                await this.sendMessage([
                    { type: "fileBytesTransferred", data: dataView.buffer },
                ]);
            }
            else {
                _console$W.log("not sending fileBytesTransferred (not requesting)");
            }
        }
        const direction = "receiving";
        this.#dispatchEvent("fileTransferProgress", {
            progress,
            fileType,
            direction,
            bytesTransferred: this.#bytesTransferred,
            isComplete,
            file,
            indirectly,
        });
        this.#dispatchEvent("getFileBlock", { fileTransferBlock: dataView });
        if (isComplete) {
            file = file;
            this.#dispatchEvent("fileTransferComplete", {
                direction,
                fileType,
                file,
                indirectly,
            });
            this.#dispatchEvent("fileReceived", {
                fileType,
                file,
                indirectly,
            });
        }
    }
    parseMessage(messageType, dataView, isSending) {
        _console$W.log({ messageType, isSending }, dataView);
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
                this.#parseFileBlock(dataView);
                break;
            case "fileBytesTransferred":
                this.#parseBytesTransferred(dataView, isSending);
                break;
            case "setFileBlock":
                this.#parseSentFileBlock(dataView, isSending);
                break;
            case "setFileTransferCommand":
                this.#parseFileTransferCommand(dataView);
                break;
            default:
                throw Error(`uncaught messageType ${messageType}`);
        }
    }
    #file;
    async send(type, file, includesHeader) {
        _console$W.log("send", { type, includesHeader }, file);
        {
            this.#assertIsIdle();
            this.#assertValidType(type);
        }
        let fileBuffer = await getFileBuffer(file);
        let fileBufferWithoutHeader;
        if (includesHeader) {
            const fileDataView = new DataView(fileBuffer);
            let offset = 0;
            const headerLength = fileDataView.getUint16(offset, true);
            _console$W.log({ headerLength });
            this.#headerLength = headerLength;
            offset += headerLength;
            fileBufferWithoutHeader = fileBuffer.slice(offset);
        }
        else {
            this.#headerLength = 2;
            fileBufferWithoutHeader = fileBuffer;
            fileBuffer = concatenateArrayBuffers(emptyHeaderDataView.buffer, fileBufferWithoutHeader);
        }
        _console$W.log({ fileBuffer, fileBufferWithoutHeader });
        const fileLength = fileBufferWithoutHeader.byteLength;
        const checksum = crc32(fileBufferWithoutHeader);
        _console$W.log({ checksum, fileLength });
        this.#assertValidLength(fileLength);
        if (type != this.type) {
            _console$W.log("different fileTypes - sending");
        }
        else if (fileLength != this.length) {
            _console$W.log("different fileLengths - sending");
        }
        else if (checksum != this.checksum) {
            _console$W.log("different fileChecksums - sending");
        }
        else {
            _console$W.log("already attempted to send file");
        }
        const promises = [];
        promises.push(this.#setType(type, false));
        promises.push(this.#setLength(fileLength, false));
        promises.push(this.#setChecksum(checksum, false));
        promises.push(this.#setCommand("startSend", false));
        promises.push(this.waitForEvent("fileTransferStatus"));
        this.sendMessage();
        await Promise.all(promises);
        if (this.#status != "sending") {
            _console$W.log(`status is not "sending" - not gonna send file`);
            return false;
        }
        if (this.#buffer) {
            _console$W.log("existing buffer");
            await this.cancel();
            return false;
        }
        if (this.#length != fileLength) {
            _console$W.log("wrong fileLength");
            await this.cancel();
            return false;
        }
        if (this.#checksum != checksum) {
            _console$W.log("wrong checksum");
            await this.cancel();
            return false;
        }
        this.#file = await this.#createFile([fileBuffer]);
        await this.#send(this.isClientConnectionType ? fileBuffer : fileBufferWithoutHeader);
        return true;
    }
    #buffer;
    #bytesTransferred = 0;
    get bytesTransferred() {
        return this.#bytesTransferred;
    }
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
            _console$W.error("not sending block - busy cancelling");
            return;
        }
        if (!this.#buffer) {
            _console$W.log("can't send block - no buffer defined");
            return;
        }
        const buffer = this.#buffer;
        let offset = this.#bytesTransferred;
        _console$W.log("sending block", { buffer, offset, mtu: this.mtu });
        const slicedBuffer = buffer.slice(offset, offset + (this.mtu - 3 - 3));
        _console$W.log("slicedBuffer", slicedBuffer);
        const bytesLeft = buffer.byteLength - offset;
        const progress = 1 - bytesLeft / buffer.byteLength;
        _console$W.log(`sending bytes ${offset}-${offset + slicedBuffer.byteLength} of ${buffer.byteLength} bytes (${progress * 100}%)`);
        const isComplete = progress == 1;
        const fileType = this.type;
        const file = this.#file;
        const direction = "sending";
        this.#dispatchEvent("fileTransferProgress", {
            progress,
            fileType,
            direction,
            bytesTransferred: this.#bytesTransferred,
            isComplete,
            file: isComplete ? file : undefined,
        });
        if (isComplete) {
            _console$W.log("finished sending buffer");
            const sentFileConfiguration = {
                file,
                fileType,
                length: this.#length,
                checksum: this.#checksum,
            };
            _console$W.log("sent file directly", sentFileConfiguration);
            this.sentFileConfigurations.push(sentFileConfiguration);
            this.#dispatchEvent("fileTransferComplete", {
                direction,
                fileType,
                file,
            });
            this.#dispatchEvent("fileSent", {
                fileType,
                file,
            });
        }
        else {
            this.#bytesTransferred = offset + slicedBuffer.byteLength;
            await this.sendMessage([{ type: "setFileBlock", data: slicedBuffer }]);
        }
    }
    async #createFile(blocks) {
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
            file = new File(blocks, fileName);
        }
        else {
            file = new Blob(blocks);
        }
        const arrayBuffer = await file.arrayBuffer();
        const arrayBufferWithoutHeader = arrayBuffer.slice(this.#headerLength);
        const checksum = crc32(arrayBufferWithoutHeader);
        _console$W.log({
            arrayBuffer,
            arrayBufferWithoutHeader,
            checksum,
            headerLength: this.#headerLength,
        });
        if (checksum != this.#checksum) {
            _console$W.error(`wrong checksum - expected ${this.#checksum}, got ${checksum}`);
            return;
        }
        _console$W.log("created file", file);
        return file;
    }
    #indirectSentBlocks = [];
    get indirectSentBlocks() {
        return this.#indirectSentBlocks;
    }
    sentFileConfigurations = [];
    getCurrentSentFileConfiguration() {
        const sentFileConfiguration = this.sentFileConfigurations.find(({ fileType, checksum, length }) => {
            return (fileType == this.type &&
                checksum == this.checksum &&
                length == this.length);
        });
        _console$W.log("sentFileConfiguration", sentFileConfiguration);
        return sentFileConfiguration;
    }
    #headerLength;
    get headerLength() {
        return this.#headerLength;
    }
    async #parseSentFileBlock(dataView, isSending) {
        _console$W.log("parseFileBlock", dataView, { isSending });
        if (!isSending) {
            return;
        }
        if (this.#indirectSentBlocks.length == 0) {
            const headerLength = dataView.getUint16(0, true);
            _console$W.log({ headerLength });
            this.#headerLength = headerLength;
        }
        this.#indirectSentBlocks.push(dataView);
        const bytesReceived = this.#indirectSentBlocks.reduce((sum, dataView) => (sum += dataView.byteLength), 0);
        this.#bytesTransferred = bytesReceived;
        const lengthPlusHeader = this.#length + (this.headerLength ?? 0);
        const progress = bytesReceived / lengthPlusHeader;
        const isComplete = progress == 1;
        _console$W.log(`sent ${bytesReceived}/${lengthPlusHeader} bytes indirectly (${progress * 100}%) - ${lengthPlusHeader - bytesReceived} bytes remaining`);
        let file;
        const fileType = this.type;
        const indirectly = true;
        if (isComplete) {
            file = await this.#createFile(this.#indirectSentBlocks.map((dataView) => dataView.buffer));
            _console$W.assertWithError(file, "file not created");
            _console$W.log("file transfer complete", file);
        }
        const direction = "sending";
        this.#dispatchEvent("fileTransferProgress", {
            isComplete,
            progress,
            fileType,
            direction,
            bytesTransferred: this.#bytesTransferred,
            indirectly,
            file,
        });
        this.#dispatchEvent("setFileBlock", { fileTransferBlock: dataView });
        if (isComplete) {
            this.#indirectSentBlocks.length = 0;
            file = file;
            const sentFileConfiguration = {
                file,
                fileType,
                length: this.#length,
                checksum: this.#checksum,
            };
            const currentSentFileConfiguration = this.getCurrentSentFileConfiguration();
            if (currentSentFileConfiguration) {
                _console$W.log("replacing currentSentFileConfiguration...", currentSentFileConfiguration);
                this.sentFileConfigurations.splice(this.sentFileConfigurations.indexOf(currentSentFileConfiguration), 1);
            }
            this.sentFileConfigurations.push(sentFileConfiguration);
            _console$W.log("sent file indirectly", sentFileConfiguration);
            this.#dispatchEvent("fileTransferComplete", {
                direction,
                fileType,
                file,
                indirectly,
            });
            this.#dispatchEvent("fileSent", { fileType, file, indirectly });
        }
    }
    async #parseBytesTransferred(dataView, isSending) {
        _console$W.log("parseBytesTransferred", dataView);
        const bytesTransferred = dataView.getUint32(0, true);
        _console$W.log({ bytesTransferred });
        this.#dispatchEvent("fileBytesTransferred", { bytesTransferred });
        if (isSending) {
            _console$W.log("skipping parseBytesTransferred (isSending)");
            return;
        }
        if (this.status != "sending") {
            _console$W.log("skipping parseBytesTransferred (not currently sending file)");
            return;
        }
        if (!this.#buffer) {
            _console$W.log("skipping parseBytesTransferred (no buffer defined)");
            return;
        }
        if (this.#bytesTransferred != bytesTransferred) {
            _console$W.error(`bytesTransferred are not equal - got ${bytesTransferred}, expected ${this.#bytesTransferred}`);
            this.cancel();
            return;
        }
        this.#sendBlock();
    }
    #isRequestingReceive = false;
    async receive(type) {
        this.#assertIsIdle();
        this.#assertValidType(type);
        this.#isRequestingReceive = true;
        await this.#setType(type);
        await this.#setCommand("startReceive");
    }
    #isCancelling = false;
    async cancel() {
        this.#assertIsNotIdle();
        _console$W.log("cancelling file transfer...");
        this.#isCancelling = true;
        await this.#setCommand("cancel");
    }
    requestRequiredInformation() {
        _console$W.log("requesting required fileTransfer information");
        const messages = RequiredFileTransferMessageTypes.map((messageType) => ({
            type: messageType,
        }));
        this.sendMessage(messages, false);
    }
    clear() {
        this.#receivedBlocks.length = 0;
        this.#indirectSentBlocks.length = 0;
        this.sentFileConfigurations.length = 0;
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
        this.#file = undefined;
        this.#isRequestingReceive = false;
        this.#headerLength = undefined;
    }
    connectionType;
    get isClientConnectionType() {
        return this.connectionType == "client";
    }
}
_a$7 = FileTransferManager;

const _console$V = createConsole("MathUtils", { log: false });
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
        _console$V.log("correcting timestamp delta");
        timestamp += Uint16Max * Math.sign(now - timestamp);
    }
    _console$V.log({
        now,
        nowWithoutLower2Bytes,
        lower2Bytes,
        timestamp,
        timestampDifference,
    });
    return timestamp;
}
function getVector2Distance(a, b) {
    return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}
function getVector2DistanceSquared(a, b) {
    return (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
}
function getVector2Midpoint(a, b) {
    return {
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2,
    };
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
function quaternionToEulerYXZ(q) {
    const { x, y, z, w } = q;
    const m11 = 1 - 2 * (y * y + z * z);
    const m13 = 2 * (x * z + y * w);
    const m21 = 2 * (x * y + z * w);
    const m22 = 1 - 2 * (x * x + z * z);
    const m23 = 2 * (y * z - x * w);
    const m31 = 2 * (x * z - y * w);
    const m33 = 1 - 2 * (x * x + y * y);
    const eulerX = Math.asin(-clamp(m23, -1, 1));
    let eulerY;
    let eulerZ;
    if (Math.abs(m23) < 0.9999999) {
        eulerY = Math.atan2(m13, m33);
        eulerZ = Math.atan2(m21, m22);
    }
    else {
        eulerY = Math.atan2(-m31, m11);
        eulerZ = 0;
    }
    return {
        pitch: eulerX,
        heading: eulerY,
        roll: eulerZ,
    };
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

const _console$U = createConsole("CenterOfPressureModel", { log: false });
class CenterOfPressureModel {
    constructor() {
        autoBind(this);
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
        _console$U.log({ numberOfSensors: this.numberOfSensors });
        this.#createModel();
    }
    async #createModel() {
        if (!isTensorFlowAvailable()) {
            _console$U.warn("tensorflow is not available");
            return;
        }
        if (this.#model) {
            _console$U.log("disposing model", this.#model);
            this.#model.dispose();
            this.#data.inputs.length = this.#data.outputs.length = 0;
            this.#model = undefined;
            this.#isTrained;
        }
        if (this.numberOfSensors == 0) {
            _console$U.log("zero numberOfSensors - no model needed");
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
        _console$U.log("created model", this.#model);
    }
    #maxDataLength = 2000;
    #data = { inputs: [], outputs: [] };
    get data() {
        return this.#data;
    }
    clearData() {
        _console$U.log("clearData");
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
        _console$U.log({
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
            _console$U.error("no model defined");
            return;
        }
        if (this.isTraining) {
            _console$U.warn("already training");
            return;
        }
        await tf.nextFrame();
        const { inputs, outputs } = this.#data;
        if (inputs.length == 0) {
            _console$U.log("no data to train on");
            return;
        }
        _console$U.log("train");
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
                        _console$U.log("onTrainBegin", logs);
                    },
                    onTrainEnd: (logs) => {
                        _console$U.log("onTrainEnd", logs);
                    },
                    onEpochBegin: (epoch, logs) => {
                    },
                    onEpochEnd: (epoch, logs) => {
                        const { loss } = logs;
                        _console$U.log("onEpochEnd", { epoch, loss }, logs);
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
                        _console$U.log("onYield", { epoch, batch }, logs);
                    },
                },
            });
        }
        catch (error) {
            _console$U.error("error training", error);
        }
        xs.dispose();
        ys.dispose();
        this.#isTraining = false;
        _console$U.log("finished training");
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
            _console$U.log("no model defined");
            return;
        }
        if (!this.#isTrained) {
            return;
        }
        const inputs = this.#getInputs(pressureData);
        _console$U.log("predict", inputs);
        const input = tf.tensor2d([inputs]);
        const prediction = this.#model.predict(input);
        const [x, y] = prediction.dataSync().map((value) => clamp(value, 0, 1));
        _console$U.log({ x, y });
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
            _console$U.error("model not found");
            return false;
        }
        if (!this.isTrained) {
            _console$U.error("model not trained");
            return false;
        }
        try {
            await this.model.save(handlerOrURL, config);
        }
        catch (error) {
            _console$U.error("failed to save model", error);
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
            _console$U.error("model not found");
            return false;
        }
        let pathOrIOHandler;
        if (pathOrIOHandlerOrFileList instanceof FileList) {
            const fileList = Array.from(pathOrIOHandlerOrFileList);
            const jsonFile = fileList.find((f) => f.name.endsWith(".json"));
            const weightsFile = fileList.find((f) => f.name.endsWith(".bin"));
            if (!jsonFile) {
                _console$U.error("no model.json found");
                return false;
            }
            if (!weightsFile) {
                _console$U.error("no weights.bin found");
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
            _console$U.log("loadedModel", loadedModel);
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
            _console$U.log("weights successfully loaded into model");
            this.#onTrainedModel(true);
        }
        catch (error) {
            _console$U.error("error loading model", error);
            loadedModel?.dispose();
            return false;
        }
        finally {
            loadedModel?.dispose();
        }
        return true;
    }
}

const _console$T = createConsole("PressureSensorDataManager", { log: false });
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
const DefaultNumberOfPressureSensors = 8;
class PressureSensorDataManager {
    constructor() {
        autoBind(this);
    }
    #eventDispatcher;
    get eventDispatcher() {
        return this.#eventDispatcher;
    }
    set eventDispatcher(eventDispatcher) {
        if (this.#eventDispatcher == eventDispatcher) {
            return;
        }
        _console$T.assertWithError(!this.#eventDispatcher, "eventDispatcher already defined");
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
        _console$T.log({ positions });
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
        _console$T.log({ autoRange: this.autoRange });
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
        _console$T.log({ motionAutoRange: this.motionAutoRange });
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
        _console$T.log({
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
            _console$T.error("cannot calibrate pressure - tensorflow is not available");
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

const _console$S = createConsole("MotionSensorDataManager", { log: false });
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
        _console$S.log({ vector });
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
        _console$S.log({ quaternion });
        return quaternion;
    }
    quaternionToEuler(quaternion, absolute) {
        const { heading, pitch, roll } = quaternionToEulerYXZ(quaternion);
        return {
            heading: radToDeg(heading),
            pitch: radToDeg(pitch),
            roll: radToDeg(roll),
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
        _console$S.log({ euler });
        return euler;
    }
    parseStepCounter(dataView) {
        _console$S.log("parseStepCounter", dataView);
        const stepCount = dataView.getUint32(0, true);
        _console$S.log({ stepCount });
        return stepCount;
    }
    parseActivity(dataView) {
        _console$S.log("parseActivity", dataView);
        const activity = {};
        const activityBitfield = dataView.getUint8(0);
        _console$S.log("activityBitfield", activityBitfield.toString(2));
        ActivityTypes.forEach((activityType, index) => {
            activity[activityType] = Boolean(activityBitfield & (1 << index));
        });
        _console$S.log("activity", activity);
        return activity;
    }
    parseDeviceOrientation(dataView) {
        _console$S.log("parseDeviceOrientation", dataView);
        const index = dataView.getUint8(0);
        const deviceOrientation = DeviceOrientations[index];
        _console$S.assertWithError(deviceOrientation, "undefined deviceOrientation");
        _console$S.log({ deviceOrientation });
        return deviceOrientation;
    }
}

const BarometerSensorTypes = ["barometer"];
const ContinuousBarometerSensorTypes = BarometerSensorTypes;
const _console$R = createConsole("BarometerSensorDataManager", { log: false });
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
        _console$R.log({ pressure, altitude });
        return { pressure };
    }
}

const _console$Q = createConsole("ParseUtils", { log: false });
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
        _console$Q.assertWithError(messageTypeEnum in messageTypes, `invalid messageTypeEnum ${messageTypeEnum}`);
        const messageType = messageTypes[messageTypeEnum];
        let messageLength;
        if (parseMessageLengthAsUint16) {
            messageLength = dataView.getUint16(byteOffset, true);
            byteOffset += 2;
        }
        else {
            messageLength = dataView.getUint8(byteOffset++);
        }
        _console$Q.log({
            messageTypeEnum,
            messageType,
            messageLength,
            dataView,
            byteOffset,
        });
        const _dataView = sliceDataView(dataView, byteOffset, messageLength);
        _console$Q.log({ _dataView });
        byteOffset += messageLength;
        const isLast = byteOffset >= dataView.byteLength;
        callback(messageType, _dataView, context, isLast);
    }
}
function enumToArrayBuffer(enumeration, value) {
    _console$Q.assertEnumWithError(enumeration, value);
    const valueEnum = enumeration.indexOf(value);
    return Uint8Array.from([valueEnum]).buffer;
}
function enumToDataView(enumeration, value) {
    return new DataView(enumToArrayBuffer(enumeration, value));
}

const ButtonSensorTypes = ["buttons"];
const ButtonSensorEventTypes = [
    "numberOfButtons",
    "button",
    "buttonDown",
    "buttonUp",
];
const _console$P = createConsole("ButtonSensorDataManager", { log: false });
class ButtonSensorDataManager {
    constructor() {
        autoBind(this);
    }
    #eventDispatcher;
    get eventDispatcher() {
        return this.#eventDispatcher;
    }
    set eventDispatcher(eventDispatcher) {
        if (this.#eventDispatcher == eventDispatcher) {
            return;
        }
        _console$P.assertWithError(!this.#eventDispatcher, "eventDispatcher already defined");
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
            _console$P.log("button", button);
            buttons.push(button);
        }
        buttons.forEach((button) => {
            _console$P.assertRangeWithError("button.index", button.index, 0, this.numberOfButtons - 1);
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
        _console$P.log({ numberOfButtons: this.numberOfButtons });
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
        _console$P.log("clear");
    }
}

const TouchSensorTypes = ["touches"];
const TouchSensorEventTypes = [
    "numberOfTouches",
    "touch",
    "touchDown",
    "touchUp",
];
const _console$O = createConsole("TouchSensorDataManager", { log: false });
class TouchSensorDataManager {
    constructor() {
        autoBind(this);
    }
    #eventDispatcher;
    get eventDispatcher() {
        return this.#eventDispatcher;
    }
    set eventDispatcher(eventDispatcher) {
        if (this.#eventDispatcher == eventDispatcher) {
            return;
        }
        _console$O.assertWithError(!this.#eventDispatcher, "eventDispatcher already defined");
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
            _console$O.log("touch", touch);
            touches.push(touch);
        }
        touches.forEach((touch) => {
            _console$O.assertRangeWithError("touch.index", touch.index, 0, this.numberOfTouches - 1);
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
        _console$O.log({ numberOfTouches: this.numberOfTouches });
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
        _console$O.log("clear");
    }
}

var _a$6;
const _console$N = createConsole("CameraManager", { log: false });
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
        autoBind(this);
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
        _console$N.log("requesting required camera information");
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
        _console$N.assertEnumWithError(CameraStatuses, newCameraStatus);
        if (newCameraStatus == this.#cameraStatus) {
            _console$N.log(`redundant cameraStatus ${newCameraStatus}`);
            return;
        }
        const previousCameraStatus = this.#cameraStatus;
        this.#cameraStatus = newCameraStatus;
        _console$N.log(`updated cameraStatus to "${this.cameraStatus}"`);
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
        _console$N.assertEnumWithError(CameraCommands, command);
        _console$N.log(`sending camera command "${command}"`);
        const promise = this.waitForEvent("cameraStatus");
        _console$N.log(`setting command "${command}"`);
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
        _console$N.assertWithError(this.#cameraStatus == "asleep", `camera is not asleep - currently ${this.#cameraStatus}`);
    }
    #assertIsAwake() {
        _console$N.assertWithError(this.#cameraStatus != "asleep", `camera is not awake - currently ${this.#cameraStatus}`);
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
        _console$N.log({ sensorRate: this.sensorRate });
    }
    #parseCameraData(dataView) {
        _console$N.log("parsing camera data", dataView);
        parseMessage(dataView, CameraDataTypes, this.#onCameraData.bind(this), null, true);
    }
    #buildImageTimeout;
    #clearBuildImageTimeout() {
        if (this.#buildImageTimeout == undefined) {
            return;
        }
        _console$N.log("clearBuildImageTimeout", this.#buildImageTimeout);
        clearTimeout(this.#buildImageTimeout);
        this.#buildImageTimeout = undefined;
    }
    #setBuildImageTimeout() {
        this.#clearBuildImageTimeout();
        if (this.sensorRate == 0) {
            return;
        }
        const timeoutInterval = Math.max(4 * this.sensorRate, 300);
        _console$N.log("setBuildImageTimeout", {
            timeoutInterval,
        });
        const now = Date.now();
        this.#buildImageTimeout = setTimeout(() => {
            const _now = Date.now();
            _console$N.log("buildImageTimeout triggered", {
                now: _now,
                span: _now - now,
            });
            this.#buildImage();
            this.#buildImageTimeout = undefined;
        }, timeoutInterval);
    }
    #onCameraData(cameraDataType, dataView) {
        _console$N.log({ cameraDataType, dataView });
        this.#clearBuildImageTimeout();
        switch (cameraDataType) {
            case "headerSize":
                this.#headerSize = dataView.getUint16(0, true);
                _console$N.log({ headerSize: this.#headerSize });
                this.#headerData = undefined;
                this.#headerProgress == 0;
                break;
            case "header":
                this.#headerData = concatenateArrayBuffers(this.#headerData, dataView);
                _console$N.log({ headerData: this.#headerData });
                this.#headerProgress = this.#headerData?.byteLength / this.#headerSize;
                _console$N.log({ headerProgress: this.#headerProgress });
                this.#dispatchEvent("cameraImageProgress", {
                    progress: this.#headerProgress,
                    type: "header",
                });
                if (this.#headerProgress == 1) {
                    _console$N.log("finished getting header data");
                }
                break;
            case "imageSize":
                this.#imageSize = dataView.getUint32(0, true);
                _console$N.log({ imageSize: this.#imageSize });
                this.#imageData = undefined;
                this.#imageProgress == 0;
                this.#didBuildImage = false;
                break;
            case "image":
                this.#imageData = concatenateArrayBuffers(this.#imageData, dataView);
                _console$N.log({ imageData: this.#imageData });
                this.#imageProgress = this.#imageData?.byteLength / this.#imageSize;
                _console$N.log({ imageProgress: this.#imageProgress });
                this.#dispatchEvent("cameraImageProgress", {
                    progress: this.#imageProgress,
                    type: "image",
                });
                if (this.#imageProgress == 1) {
                    _console$N.log("finished getting image data");
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
                _console$N.log({ footerSize: this.#footerSize });
                this.#footerData = undefined;
                this.#footerProgress == 0;
                break;
            case "footer":
                this.#footerData = concatenateArrayBuffers(this.#footerData, dataView);
                _console$N.log({ footerData: this.#footerData });
                this.#footerProgress = this.#footerData?.byteLength / this.#footerSize;
                _console$N.log({ footerProgress: this.#footerProgress });
                this.#dispatchEvent("cameraImageProgress", {
                    progress: this.#footerProgress,
                    type: "footer",
                });
                if (this.#footerProgress == 1) {
                    _console$N.log("finished getting footer data");
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
        _console$N.log("building image...");
        const now = Date.now();
        const timestamp = this.#latestTakingPictureTimestamp;
        const imageData = concatenateArrayBuffers(this.#headerData, this.#imageData, this.#footerData);
        _console$N.log({ imageData });
        this.#didBuildImage = true;
        let blob = new Blob([imageData], { type: "image/jpg" });
        _console$N.log("created blob", blob);
        const url = URL.createObjectURL(blob);
        _console$N.log("created url", url);
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
                    _console$N.error("camera recording failed - recording image/canvas/context not found");
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
            _console$N.assertWithError(cameraConfigurationType, `invalid cameraConfigurationTypeIndex ${cameraConfigurationTypeIndex}`);
            _console$N.log({ cameraConfigurationType });
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
            _console$N.log({ [cameraConfigurationType]: value });
            _console$N.assertTypeWithError(value, "number");
            parsedCameraConfiguration[cameraConfigurationType] = value;
            byteOffset += size;
        }
        _console$N.log({ parsedCameraConfiguration });
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
        _console$N.log({ newCameraConfiguration });
        if (this.#isCameraConfigurationRedundant(newCameraConfiguration)) {
            _console$N.log("redundant camera configuration");
            return;
        }
        const setCameraConfigurationData = this.#createData(newCameraConfiguration);
        _console$N.log({ setCameraConfigurationData });
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
        _console$N.assertWithError(this.#availableCameraConfigurationTypes, "must get initial cameraConfiguration");
        const isCameraConfigurationTypeAvailable = this.#availableCameraConfigurationTypes?.includes(cameraConfigurationType);
        _console$N.assertWithError(isCameraConfigurationTypeAvailable, `unavailable camera configuration type "${cameraConfigurationType}"`);
        return isCameraConfigurationTypeAvailable;
    }
    static AssertValidCameraConfigurationType(cameraConfigurationType) {
        _console$N.assertEnumWithError(CameraConfigurationTypes, cameraConfigurationType);
    }
    static AssertValidCameraConfigurationTypeEnum(cameraConfigurationTypeEnum) {
        _console$N.assertTypeWithError(cameraConfigurationTypeEnum, "number");
        _console$N.assertWithError(cameraConfigurationTypeEnum in CameraConfigurationTypes, `invalid cameraConfigurationTypeEnum ${cameraConfigurationTypeEnum}`);
    }
    #createData(cameraConfiguration) {
        let cameraConfigurationTypes = Object.keys(cameraConfiguration);
        cameraConfigurationTypes = cameraConfigurationTypes.filter((cameraConfigurationType) => this.#assertAvailableCameraConfigurationType(cameraConfigurationType));
        const dataView = new DataView(new ArrayBuffer(cameraConfigurationTypes.length * 3));
        cameraConfigurationTypes.forEach((cameraConfigurationType, index) => {
            _a$6.AssertValidCameraConfigurationType(cameraConfigurationType);
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
        _console$N.log({ sensorConfigurationData: dataView });
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
            _console$N.error("camera recording is not available");
            return;
        }
        if (this.isRecording) {
            _console$N.log("already recording camera");
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
                _console$N.log("adding chunk", e.data);
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
            _console$N.log("already not recording");
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
                        _console$N.log("recordingMediaRecorder onstop");
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
        _console$N.log({ autoPicture: this.#autoPicture });
        this.#dispatchEvent("autoPicture", { autoPicture: this.autoPicture });
    }
    parseMessage(messageType, dataView, isSending) {
        _console$N.log({ messageType, isSending }, dataView);
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
_a$6 = CameraManager;

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

const BIAS = 0x84;
const CLIP = 32635;
const encodeTable = [
    0,0,1,1,2,2,2,2,3,3,3,3,3,3,3,3,
    4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,
    5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,
    5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,
    6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,
    6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,
    6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,
    6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,
    7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,
    7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,
    7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,
    7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,
    7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,
    7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,
    7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,
    7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7];
const decodeTable = [0,132,396,924,1980,4092,8316,16764];
function encodeSample(sample) {
  let sign;
  let exponent;
  let mantissa;
  let muLawSample;
  sign = (sample >> 8) & 0x80;
  if (sign != 0) sample = -sample;
  sample = sample + BIAS;
  if (sample > CLIP) sample = CLIP;
  exponent = encodeTable[(sample>>7) & 0xFF];
  mantissa = (sample >> (exponent+3)) & 0x0F;
  muLawSample = ~(sign | (exponent << 4) | mantissa);
  return muLawSample;
}
function decodeSample(muLawSample) {
  let sign;
  let exponent;
  let mantissa;
  let sample;
  muLawSample = ~muLawSample;
  sign = (muLawSample & 0x80);
  exponent = (muLawSample >> 4) & 0x07;
  mantissa = muLawSample & 0x0F;
  sample = decodeTable[exponent] + (mantissa << (exponent+3));
  if (sign != 0) sample = -sample;
  return sample;
}
function encode$2(samples) {
  let muLawSamples = new Uint8Array(samples.length);
  for (let i=0; i<samples.length; i++) {
    muLawSamples[i] = encodeSample(samples[i]);
  }
  return muLawSamples;
}
function decode$2(samples) {
  let pcmSamples = new Int16Array(samples.length);
  for (let i=0; i<samples.length; i++) {
    pcmSamples[i] = decodeSample(samples[i]);
  }
  return pcmSamples;
}

var mulaw$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    decode: decode$2,
    decodeSample: decodeSample,
    encode: encode$2,
    encodeSample: encodeSample
});

var _alawmulaw = /*#__PURE__*/Object.freeze({
    __proto__: null,
    mulaw: mulaw$1
});

var _a$5;
const alawmulaw = _alawmulaw;
const { mulaw } = alawmulaw;
const _console$M = createConsole("MicrophoneManager", { log: false });
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
        autoBind(this);
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
        _console$M.log("requesting required microphone information");
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
        _console$M.assertEnumWithError(MicrophoneStatuses, newMicrophoneStatus);
        if (newMicrophoneStatus == this.#microphoneStatus) {
            _console$M.log(`redundant microphoneStatus ${newMicrophoneStatus}`);
            return;
        }
        const previousMicrophoneStatus = this.#microphoneStatus;
        this.#microphoneStatus = newMicrophoneStatus;
        _console$M.log(`updated microphoneStatus to "${this.microphoneStatus}"`);
        this.#dispatchEvent("microphoneStatus", {
            microphoneStatus: this.microphoneStatus,
            previousMicrophoneStatus,
        });
    }
    async #sendMicrophoneCommand(command, sendImmediately) {
        _console$M.assertEnumWithError(MicrophoneCommands, command);
        _console$M.log(`sending microphone command "${command}"`);
        const promise = this.waitForEvent("microphoneStatus");
        _console$M.log(`setting command "${command}"`);
        const commandEnum = MicrophoneCommands.indexOf(command);
        this.sendMessage([
            {
                type: "microphoneCommand",
                data: UInt8ByteBuffer(commandEnum),
            },
        ], sendImmediately);
        await promise;
    }
    #parseMicrophoneCommand(dataView) {
        _console$M.log("parseMicrophoneCommand", dataView);
        const commandEnum = dataView.getUint8(0);
        const command = MicrophoneCommands[commandEnum];
        _console$M.assertEnumWithError(MicrophoneCommands, command);
        _console$M.log({ command });
    }
    #assertIsIdle() {
        _console$M.assertWithError(this.#microphoneStatus == "idle", `microphone is not idle - currently ${this.#microphoneStatus}`);
    }
    #assertIsNotIdle() {
        _console$M.assertWithError(this.#microphoneStatus != "idle", `microphone is idle`);
    }
    #assertIsStreaming() {
        _console$M.assertWithError(this.#microphoneStatus == "streaming", `microphone is not recording - currently ${this.#microphoneStatus}`);
    }
    async start() {
        await this.#sendMicrophoneCommand("start");
    }
    async stop() {
        if (this.microphoneStatus == "idle") {
            _console$M.log("microphone is already idle");
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
        _console$M.assertEnumWithError(MicrophoneBitDepths, this.bitDepth);
    }
    #fadeDuration = 0.01;
    #playbackTime = 0;
    #parseMicrophoneData(dataView) {
        this.#assertValidBitDepth();
        _console$M.log("parsing microphone data", dataView);
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
        _console$M.log("samples", samples);
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
            _console$M.assertWithError(microphoneConfigurationType, `invalid microphoneConfigurationTypeIndex ${microphoneConfigurationTypeIndex}`);
            let rawValue = dataView.getUint8(byteOffset++);
            const values = MicrophoneConfigurationValues[microphoneConfigurationType];
            const value = values[rawValue];
            _console$M.assertEnumWithError(values, value);
            _console$M.log({ microphoneConfigurationType, value });
            parsedMicrophoneConfiguration[microphoneConfigurationType] = value;
        }
        _console$M.log({ parsedMicrophoneConfiguration });
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
        _console$M.log({ newMicrophoneConfiguration });
        if (this.#isMicrophoneConfigurationRedundant(newMicrophoneConfiguration)) {
            _console$M.log("redundant microphone configuration");
            return;
        }
        const setMicrophoneConfigurationData = this.#createData(newMicrophoneConfiguration);
        _console$M.log({ setMicrophoneConfigurationData });
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
        _console$M.assertWithError(this.#availableMicrophoneConfigurationTypes, "must get initial microphoneConfiguration");
        const isMicrophoneConfigurationTypeAvailable = this.#availableMicrophoneConfigurationTypes?.includes(microphoneConfigurationType);
        _console$M.assertWithError(isMicrophoneConfigurationTypeAvailable, `unavailable microphone configuration type "${microphoneConfigurationType}"`);
        return isMicrophoneConfigurationTypeAvailable;
    }
    static AssertValidMicrophoneConfigurationType(microphoneConfigurationType) {
        _console$M.assertEnumWithError(MicrophoneConfigurationTypes, microphoneConfigurationType);
    }
    static AssertValidMicrophoneConfigurationTypeEnum(microphoneConfigurationTypeEnum) {
        _console$M.assertTypeWithError(microphoneConfigurationTypeEnum, "number");
        _console$M.assertWithError(microphoneConfigurationTypeEnum in MicrophoneConfigurationTypes, `invalid microphoneConfigurationTypeEnum ${microphoneConfigurationTypeEnum}`);
    }
    #createData(microphoneConfiguration) {
        let microphoneConfigurationTypes = Object.keys(microphoneConfiguration);
        microphoneConfigurationTypes = microphoneConfigurationTypes.filter((microphoneConfigurationType) => this.#assertAvailableMicrophoneConfigurationType(microphoneConfigurationType));
        const dataView = new DataView(new ArrayBuffer(microphoneConfigurationTypes.length * 2));
        microphoneConfigurationTypes.forEach((microphoneConfigurationType, index) => {
            _a$5.AssertValidMicrophoneConfigurationType(microphoneConfigurationType);
            const microphoneConfigurationTypeEnum = MicrophoneConfigurationTypes.indexOf(microphoneConfigurationType);
            dataView.setUint8(index * 2, microphoneConfigurationTypeEnum);
            let value = microphoneConfiguration[microphoneConfigurationType];
            if (typeof value == "number") {
                value = value.toString();
            }
            const values = MicrophoneConfigurationValues[microphoneConfigurationType];
            _console$M.assertEnumWithError(values, value);
            const rawValue = values.indexOf(value);
            dataView.setUint8(index * 2 + 1, rawValue);
        });
        _console$M.log({ sensorConfigurationData: dataView });
        return dataView;
    }
    parseMessage(messageType, dataView, isSending) {
        _console$M.log({ messageType, isSending }, dataView);
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
            case "microphoneCommand":
                this.#parseMicrophoneCommand(dataView);
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
            _console$M.log("redundant audioContext assignment", this.#audioContext);
            return;
        }
        this.#audioContext = newAudioContext;
        _console$M.log("assigned new audioContext", this.#audioContext);
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
        _console$M.assertWithError(this.#audioContext, "audioContext assignment required for gainNode");
        if (!this.#gainNode) {
            _console$M.log("creating gainNode...");
            this.#gainNode = this.#audioContext.createGain();
            _console$M.log("created gainNode", this.#gainNode);
        }
        return this.#gainNode;
    }
    #mediaStreamDestination;
    get mediaStreamDestination() {
        _console$M.assertWithError(this.#audioContext, "audioContext assignment required for mediaStreamDestination");
        if (!this.#mediaStreamDestination) {
            _console$M.log("creating mediaStreamDestination...");
            this.#mediaStreamDestination =
                this.#audioContext.createMediaStreamDestination();
            this.gainNode?.connect(this.#mediaStreamDestination);
            _console$M.log("created mediaStreamDestination", this.#mediaStreamDestination);
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
            _console$M.log("already recording microphone");
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
            _console$M.log("already not recording");
            return;
        }
        this.#isRecording = false;
        if (this.#microphoneRecordingData &&
            this.#microphoneRecordingData.length > 0) {
            _console$M.log("parsing microphone data...", this.#microphoneRecordingData.length);
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
_a$5 = MicrophoneManager;

const LightSensorTypes = ["light"];
const ContinuousLightSensorTypes = LightSensorTypes;
const _console$L = createConsole("LightSensorDataManager", { log: false });
class LightSensorDataManager {
    parseData(dataView, scalar) {
        const light = dataView.getFloat32(0, true) * scalar;
        _console$L.log({ light });
        return { light };
    }
}

const _console$K = createConsole("SensorDataManager", { log: false });
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
    _console$K.log("sensorData", Array.from(new Uint8Array(dataView.buffer)));
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
        autoBind(this);
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
        _console$K.assertEnumWithError(SensorTypes, sensorType);
    }
    static AssertValidSensorTypeEnum(sensorTypeEnum) {
        _console$K.assertTypeWithError(sensorTypeEnum, "number");
        _console$K.assertWithError(sensorTypeEnum in SensorTypes, `invalid sensorTypeEnum ${sensorTypeEnum}`);
    }
    #eventDispatcher;
    get eventDispatcher() {
        return this.#eventDispatcher;
    }
    set eventDispatcher(eventDispatcher) {
        if (this.#eventDispatcher == eventDispatcher) {
            return;
        }
        _console$K.assertWithError(!this.#eventDispatcher, "eventDispatcher already defined");
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
        _console$K.log({ messageType, isSending }, dataView);
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
                _console$K.warn(`unknown sensorType index ${sensorTypeIndex}`);
                continue;
            }
            const sensorScalar = dataView.getFloat32(byteOffset + 1, true);
            _console$K.log({ sensorType, sensorScalar });
            this.#scalars.set(sensorType, sensorScalar);
        }
    }
    #parseCounts(dataView) {
        for (let byteOffset = 0; byteOffset < dataView.byteLength; byteOffset += 2) {
            const sensorTypeIndex = dataView.getUint8(byteOffset);
            const sensorType = SensorTypes[sensorTypeIndex];
            if (!sensorType) {
                _console$K.warn(`unknown sensorType index ${sensorTypeIndex}`);
                continue;
            }
            const sensorCount = dataView.getUint8(byteOffset + 1);
            _console$K.log({ sensorType, sensorCount });
            this.#counts.set(sensorType, sensorCount);
            switch (sensorType) {
                case "buttons":
                    this.buttonSensorDataManager.numberOfButtons = sensorCount;
                    break;
                case "touches":
                    this.touchSensorDataManager.numberOfTouches = sensorCount;
                    break;
                default:
                    _console$K.warn(`uncaught count for sensorType "${sensorType}"`);
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
                _console$K.error(`uncaught sensorType "${sensorType}"`);
        }
        _console$K.assertWithError(sensorData != null || sensorType == "pressure", `no sensorData defined for sensorType "${sensorType}"`);
        _console$K.log({ sensorType, sensorData });
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
        _console$K.log("clear");
        this.buttonSensorDataManager.clear();
        this.touchSensorDataManager.clear();
    }
}

var _a$4;
const _console$J = createConsole("SensorConfigurationManager", { log: false });
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
        _console$J.log({ sensorType, sensorRate });
        if (!sensorType) {
            _console$J.warn(`unknown sensorType index ${sensorTypeIndex}`);
            continue;
        }
        if (callback && !callback(sensorType, sensorRate, context)) {
            continue;
        }
        parsedSensorConfiguration[sensorType] = sensorRate;
    }
    _console$J.log({ parsedSensorConfiguration });
    return parsedSensorConfiguration;
}
function assertValidSensorRate(sensorRate) {
    _console$J.assertTypeWithError(sensorRate, "number");
    _console$J.assertWithError(sensorRate >= 0, `sensorRate must be 0 or greater (got ${sensorRate})`);
    _console$J.assertWithError(sensorRate < MaxSensorRate, `sensorRate must be 0 or greater (got ${sensorRate})`);
    _console$J.assertWithError(sensorRate % SensorRateStep == 0, `sensorRate must be multiple of ${SensorRateStep}`);
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
    _console$J.log({ sensorConfigurationData: dataView });
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
        _console$J.log({ updatedConfiguration: this.#configuration });
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
        _console$J.log({ newSensorConfiguration });
        if (this.#isRedundant(newSensorConfiguration)) {
            _console$J.log("redundant sensor configuration");
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
        _console$J.log({ setSensorConfigurationData });
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
        _console$J.log({ parsedSensorConfiguration });
        this.#availableSensorTypes = Object.keys(parsedSensorConfiguration);
        _console$J.log("availableSensorTypes", this.#availableSensorTypes);
        return parsedSensorConfiguration;
    }
    static #AssertValidSensorRate(sensorRate) {
        _console$J.assertTypeWithError(sensorRate, "number");
        _console$J.assertWithError(sensorRate >= 0, `sensorRate must be 0 or greater (got ${sensorRate})`);
        _console$J.assertWithError(sensorRate < MaxSensorRate, `sensorRate must be 0 or greater (got ${sensorRate})`);
        _console$J.assertWithError(sensorRate % SensorRateStep == 0, `sensorRate must be multiple of ${SensorRateStep}`);
    }
    #assertValidSensorRate(sensorRate) {
        _a$4.#AssertValidSensorRate(sensorRate);
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
        _console$J.log({ messageType, isSending }, dataView);
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
_a$4 = SensorConfigurationManager;

const _console$I = createConsole("TfliteManager", { log: false });
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
        autoBind(this);
    }
    sendMessage;
    #assertValidTask(task) {
        _console$I.assertEnumWithError(TfliteTasks, task);
    }
    #assertValidTaskEnum(taskEnum) {
        _console$I.assertWithError(taskEnum in TfliteTasks, `invalid taskEnum ${taskEnum}`);
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
        _console$I.log("classes", this.classes);
    }
    #name;
    get name() {
        return this.#name;
    }
    #parseName(dataView) {
        _console$I.log("parseName", dataView);
        const name = textDecoder.decode(dataView.buffer);
        this.#updateName(name);
    }
    #updateName(name) {
        _console$I.log({ name });
        this.#name = name;
        this.#dispatchEvent("getTfliteName", { tfliteName: name });
    }
    async setName(newName, sendImmediately) {
        _console$I.assertTypeWithError(newName, "string");
        if (this.name == newName) {
            _console$I.log(`redundant name assignment ${newName}`);
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
        _console$I.log("parseTask", dataView);
        const taskEnum = dataView.getUint8(0);
        this.#assertValidTaskEnum(taskEnum);
        const task = TfliteTasks[taskEnum];
        this.#updateTask(task);
    }
    #updateTask(task) {
        _console$I.log({ task });
        this.#task = task;
        this.#dispatchEvent("getTfliteTask", { tfliteTask: task });
    }
    async setTask(newTask, sendImmediately) {
        this.#assertValidTask(newTask);
        if (this.task == newTask) {
            _console$I.log(`redundant task assignment ${newTask}`);
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
        _console$I.log("parseSampleRate", dataView);
        const sampleRate = dataView.getUint16(0, true);
        this.#updateSampleRate(sampleRate);
    }
    #updateSampleRate(sampleRate) {
        _console$I.log({ sampleRate });
        this.#sampleRate = sampleRate;
        this.#dispatchEvent("getTfliteSampleRate", {
            tfliteSampleRate: sampleRate,
        });
    }
    async setSampleRate(newSampleRate, sendImmediately) {
        _console$I.assertTypeWithError(newSampleRate, "number");
        newSampleRate -= newSampleRate % SensorRateStep;
        _console$I.assertWithError(newSampleRate >= SensorRateStep, `sampleRate must be multiple of ${SensorRateStep} greater than 0 (got ${newSampleRate})`);
        if (this.#sampleRate == newSampleRate) {
            _console$I.log(`redundant sampleRate assignment ${newSampleRate}`);
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
        _console$I.assertWithError(TfliteSensorTypes.includes(tfliteSensorType), `invalid tflite sensorType "${sensorType}"`);
    }
    #sensorTypes = [];
    get sensorTypes() {
        return this.#sensorTypes.slice();
    }
    #parseSensorTypes(dataView) {
        _console$I.log("parseSensorTypes", dataView);
        const sensorTypes = [];
        for (let index = 0; index < dataView.byteLength; index++) {
            const sensorTypeEnum = dataView.getUint8(index);
            const sensorType = SensorTypes[sensorTypeEnum];
            if (sensorType) {
                if (TfliteSensorTypes.includes(sensorType)) {
                    sensorTypes.push(sensorType);
                }
                else {
                    _console$I.error(`invalid tfliteSensorType ${sensorType}`);
                }
            }
            else {
                _console$I.error(`invalid sensorTypeEnum ${sensorTypeEnum}`);
            }
        }
        this.#updateSensorTypes(sensorTypes);
    }
    #updateSensorTypes(sensorTypes) {
        _console$I.log({ sensorTypes });
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
                _console$I.log(`redundant tflite sensorTypes`, newSensorTypes);
                return;
            }
        }
        const promise = this.waitForEvent("getTfliteSensorTypes");
        const newSensorTypeEnums = newSensorTypes
            .map((sensorType) => SensorTypes.indexOf(sensorType))
            .sort();
        _console$I.log(newSensorTypes, newSensorTypeEnums);
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
        _console$I.log("parseIsReady", dataView);
        const isReady = Boolean(dataView.getUint8(0));
        this.#updateIsReady(isReady);
    }
    #updateIsReady(isReady) {
        _console$I.log({ isReady });
        this.#isReady = isReady;
        this.#dispatchEvent("tfliteIsReady", { tfliteIsReady: isReady });
    }
    #assertIsReady() {
        _console$I.assertWithError(this.isReady, `tflite is not ready`);
    }
    #captureDelay;
    get captureDelay() {
        return this.#captureDelay;
    }
    #parseCaptureDelay(dataView) {
        _console$I.log("parseCaptureDelay", dataView);
        const captureDelay = dataView.getUint16(0, true);
        this.#updateCaptueDelay(captureDelay);
    }
    #updateCaptueDelay(captureDelay) {
        _console$I.log({ captureDelay });
        this.#captureDelay = captureDelay;
        this.#dispatchEvent("getTfliteCaptureDelay", {
            tfliteCaptureDelay: captureDelay,
        });
    }
    async setCaptureDelay(newCaptureDelay, sendImmediately) {
        _console$I.assertTypeWithError(newCaptureDelay, "number");
        if (this.#captureDelay == newCaptureDelay) {
            _console$I.log(`redundant captureDelay assignment ${newCaptureDelay}`);
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
        _console$I.log("parseThreshold", dataView);
        const threshold = dataView.getFloat32(0, true);
        this.#updateThreshold(threshold);
    }
    #updateThreshold(threshold) {
        _console$I.log({ threshold });
        this.#threshold = threshold;
        this.#dispatchEvent("getTfliteThreshold", { tfliteThreshold: threshold });
    }
    async setThreshold(newThreshold, sendImmediately) {
        _console$I.assertTypeWithError(newThreshold, "number");
        _console$I.assertWithError(newThreshold >= 0, `threshold must be positive (got ${newThreshold})`);
        if (this.#threshold == newThreshold) {
            _console$I.log(`redundant threshold assignment ${newThreshold}`);
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
        _console$I.log("parseInferencingEnabled", dataView);
        const inferencingEnabled = Boolean(dataView.getUint8(0));
        this.#updateInferencingEnabled(inferencingEnabled);
    }
    #updateInferencingEnabled(inferencingEnabled) {
        _console$I.log({ inferencingEnabled });
        this.#inferencingEnabled = inferencingEnabled;
        this.#dispatchEvent("getTfliteInferencingEnabled", {
            tfliteInferencingEnabled: inferencingEnabled,
        });
    }
    async setInferencingEnabled(newInferencingEnabled, sendImmediately = true) {
        _console$I.assertTypeWithError(newInferencingEnabled, "boolean");
        if (!newInferencingEnabled && !this.isReady) {
            return;
        }
        this.#assertIsReady();
        if (this.#inferencingEnabled == newInferencingEnabled) {
            _console$I.log(`redundant inferencingEnabled assignment ${newInferencingEnabled}`);
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
        _console$I.log("parseInference", dataView);
        const timestamp = parseTimestamp(dataView, 0);
        _console$I.log({ timestamp });
        const values = [];
        for (let index = 0, byteOffset = 2; byteOffset < dataView.byteLength; index++, byteOffset += 4) {
            const value = dataView.getFloat32(byteOffset, true);
            values.push(value);
        }
        _console$I.log("values", values);
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
            _console$I.log({ maxIndex, maxValue });
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
        _console$I.log({ messageType, isSending }, dataView);
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
            _console$I.log("redundant tflite configuration assignment");
            return;
        }
        this.#configuration = configuration;
        _console$I.log("assigned new tflite configuration", this.configuration);
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
        _console$I.log("requesting required tflite information");
        const messages = RequiredTfliteMessageTypes.map((messageType) => ({
            type: messageType,
        }));
        this.sendMessage(messages, false);
    }
}

const _console$H = createConsole("DeviceInformationManager", { log: false });
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
        _console$H.log({ partialDeviceInformation });
        const deviceInformationNames = Object.keys(partialDeviceInformation);
        deviceInformationNames.forEach((deviceInformationName) => {
            this.#dispatchEvent(deviceInformationName, {
                [deviceInformationName]: partialDeviceInformation[deviceInformationName],
            });
        });
        Object.assign(this.#information, partialDeviceInformation);
        _console$H.log({ deviceInformation: this.#information });
        if (this.#isComplete) {
            _console$H.log("completed deviceInformation");
            this.#dispatchEvent("deviceInformation", {
                deviceInformation: this.information,
            });
        }
    }
    parseMessage(messageType, dataView, isSending) {
        _console$H.log({ messageType, isSending }, dataView);
        switch (messageType) {
            case "manufacturerName":
                const manufacturerName = textDecoder.decode(dataView.buffer);
                _console$H.log({ manufacturerName });
                this.#update({ manufacturerName });
                break;
            case "modelNumber":
                const modelNumber = textDecoder.decode(dataView.buffer);
                _console$H.log({ modelNumber });
                this.#update({ modelNumber });
                break;
            case "softwareRevision":
                const softwareRevision = textDecoder.decode(dataView.buffer);
                _console$H.log({ softwareRevision });
                this.#update({ softwareRevision });
                break;
            case "hardwareRevision":
                const hardwareRevision = textDecoder.decode(dataView.buffer);
                _console$H.log({ hardwareRevision });
                this.#update({ hardwareRevision });
                break;
            case "firmwareRevision":
                const firmwareRevision = textDecoder.decode(dataView.buffer);
                _console$H.log({ firmwareRevision });
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
                _console$H.log({ pnpId });
                this.#update({ pnpId });
                break;
            case "serialNumber":
                const serialNumber = textDecoder.decode(dataView.buffer);
                _console$H.log({ serialNumber });
                break;
            default:
                throw Error(`uncaught messageType ${messageType}`);
        }
    }
}

const _console$G = createConsole("InformationManager", { log: false });
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
        autoBind(this);
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
        _console$G.assertTypeWithError(updatedIsCharging, "boolean");
        this.#isCharging = updatedIsCharging;
        _console$G.log({ isCharging: this.#isCharging });
        this.#dispatchEvent("isCharging", { isCharging: this.#isCharging });
    }
    #batteryCurrent;
    get batteryCurrent() {
        return this.#batteryCurrent;
    }
    async getBatteryCurrent() {
        _console$G.log("getting battery current...");
        const promise = this.waitForEvent("getBatteryCurrent");
        this.sendMessage([{ type: "getBatteryCurrent" }]);
        await promise;
    }
    #updateBatteryCurrent(updatedBatteryCurrent) {
        _console$G.assertTypeWithError(updatedBatteryCurrent, "number");
        this.#batteryCurrent = updatedBatteryCurrent;
        _console$G.log({ batteryCurrent: this.#batteryCurrent });
        this.#dispatchEvent("getBatteryCurrent", {
            batteryCurrent: this.#batteryCurrent,
        });
    }
    #id;
    get id() {
        return this.#id;
    }
    #updateId(updatedId) {
        _console$G.assertTypeWithError(updatedId, "string");
        this.#id = updatedId;
        _console$G.log({ id: this.#id });
        this.#dispatchEvent("getId", { id: this.#id });
    }
    #name = "";
    get name() {
        return this.#name;
    }
    updateName(updatedName) {
        _console$G.assertTypeWithError(updatedName, "string");
        this.#name = updatedName;
        _console$G.log({ updatedName: this.#name });
        this.#dispatchEvent("getName", { name: this.#name });
    }
    async setName(newName) {
        _console$G.assertTypeWithError(newName, "string");
        _console$G.assertRangeWithError("newName", newName.length, MinNameLength, MaxNameLength);
        const setNameData = textEncoder.encode(newName);
        _console$G.log({ setNameData });
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
        _console$G.assertEnumWithError(DeviceTypes, type);
    }
    #assertValidDeviceTypeEnum(typeEnum) {
        _console$G.assertTypeWithError(typeEnum, "number");
        _console$G.assertWithError(typeEnum in DeviceTypes, `invalid typeEnum ${typeEnum}`);
    }
    updateType(updatedType) {
        this.#assertValidDeviceType(updatedType);
        this.#type = updatedType;
        _console$G.log({ updatedType: this.#type });
        this.#dispatchEvent("getType", { type: this.#type });
    }
    async #setTypeEnum(newTypeEnum) {
        this.#assertValidDeviceTypeEnum(newTypeEnum);
        const setTypeData = UInt8ByteBuffer(newTypeEnum);
        _console$G.log({ setTypeData });
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
        _console$G.assertTypeWithError(newMtu, "number");
        this.#mtu = newMtu;
        this.#dispatchEvent("getMtu", { mtu: this.#mtu });
    }
    #isCurrentTimeSet = false;
    get isCurrentTimeSet() {
        return this.#isCurrentTimeSet;
    }
    #currentTimeThreshold = 10_000;
    #onCurrentTime(currentTime) {
        _console$G.log({ currentTime });
        const timeDifference = Date.now() - currentTime;
        const absTimeDifference = Math.abs(timeDifference);
        _console$G.log({ timeDifference, absTimeDifference });
        this.#isCurrentTimeSet = currentTime != 0;
        _console$G.log("isCurrentTimeSet", this.#isCurrentTimeSet);
        if (!this.#isCurrentTimeSet) {
            this.#setCurrentTime(false);
        }
    }
    async #setCurrentTime(sendImmediately) {
        const now = Date.now();
        _console$G.log("setting current time...", { now });
        const dataView = new DataView(new ArrayBuffer(8));
        dataView.setBigUint64(0, BigInt(now), true);
        const promise = this.waitForEvent("getCurrentTime");
        this.sendMessage([{ type: "setCurrentTime", data: dataView.buffer }], sendImmediately);
        await promise;
    }
    parseMessage(messageType, dataView, isSending) {
        _console$G.log({ messageType, isSending }, dataView);
        switch (messageType) {
            case "isCharging":
                const isCharging = Boolean(dataView.getUint8(0));
                _console$G.log({ isCharging });
                this.#updateIsCharging(isCharging);
                break;
            case "getBatteryCurrent":
                const batteryCurrent = dataView.getFloat32(0, true);
                _console$G.log({ batteryCurrent });
                this.#updateBatteryCurrent(batteryCurrent);
                break;
            case "getId":
                const id = textDecoder.decode(dataView.buffer);
                _console$G.log({ id });
                this.#updateId(id);
                break;
            case "getName":
            case "setName":
                const name = textDecoder.decode(dataView.buffer);
                _console$G.log({ name });
                this.updateName(name);
                break;
            case "getType":
            case "setType":
                const typeEnum = dataView.getUint8(0);
                const type = DeviceTypes[typeEnum];
                _console$G.log({ typeEnum, type });
                this.updateType(type);
                break;
            case "getMtu":
                let mtu = dataView.getUint16(0, true);
                if (this.connectionType != "client" &&
                    this.connectionType != "webSocket" &&
                    this.connectionType != "udp") {
                    mtu = Math.min(mtu, 512);
                }
                _console$G.log({ mtu });
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

const _console$F = createConsole("VibrationManager", { log: false });
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
        autoBind(this);
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
            _console$F.assertEnumWithError(VibrationLocations, location);
        });
    }
    #createLocationsBitmask(locations) {
        this.#verifyLocations(locations);
        let locationsBitmask = 0;
        locations.forEach((location) => {
            const locationIndex = VibrationLocations.indexOf(location);
            locationsBitmask |= 1 << locationIndex;
        });
        _console$F.log({ locationsBitmask });
        _console$F.assertWithError(locationsBitmask > 0, `locationsBitmask must not be zero`);
        return locationsBitmask;
    }
    #assertNonEmptyArray(array) {
        _console$F.assertWithError(Array.isArray(array), "passed non-array");
        _console$F.assertWithError(array.length > 0, "passed empty array");
    }
    #verifyWaveformEffect(waveformEffect) {
        _console$F.assertEnumWithError(VibrationWaveformEffects, waveformEffect);
    }
    #verifyWaveformEffectSegment(waveformEffectSegment) {
        if (waveformEffectSegment.effect != undefined) {
            const waveformEffect = waveformEffectSegment.effect;
            this.#verifyWaveformEffect(waveformEffect);
        }
        else if (waveformEffectSegment.delay != undefined) {
            const { delay } = waveformEffectSegment;
            _console$F.assertWithError(delay >= 0, `delay must be 0ms or greater (got ${delay})`);
            _console$F.assertWithError(delay <= MaxVibrationWaveformEffectSegmentDelay, `delay must be ${MaxVibrationWaveformEffectSegmentDelay}ms or less (got ${delay})`);
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
        _console$F.assertRangeWithError("waveformEffectSegmentLoopCount", waveformEffectSegmentLoopCount, 0, MaxVibrationWaveformEffectSegmentLoopCount);
    }
    #verifyWaveformEffectSegments(waveformEffectSegments) {
        _console$F.assertRangeWithError("waveformEffectSegments.length", waveformEffectSegments.length, 0, MaxNumberOfVibrationWaveformEffectSegments);
        waveformEffectSegments.forEach((waveformEffectSegment) => {
            this.#verifyWaveformEffectSegment(waveformEffectSegment);
        });
    }
    #verifyWaveformEffectSequenceLoopCount(waveformEffectSequenceLoopCount) {
        _console$F.assertRangeWithError("waveformEffectSequenceLoopCount", waveformEffectSequenceLoopCount, 0, MaxVibrationWaveformEffectSequenceLoopCount);
    }
    #verifyWaveformSegment(waveformSegment) {
        _console$F.assertRangeWithError("waveformSegment.amplitude", waveformSegment.amplitude, 0, 1);
        _console$F.assertRangeWithError("waveformSegment.duration", waveformSegment.duration, 0, MaxVibrationWaveformSegmentDuration);
    }
    #verifyWaveformSegments(waveformSegments) {
        _console$F.assertRangeWithError("waveformSegments.length", waveformSegments.length, 0, MaxNumberOfVibrationWaveformSegments);
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
        _console$F.log({ dataArray, dataView });
        return this.#createData(locations, "waveformEffect", dataView);
    }
    #createWaveformData(locations, waveformSegments) {
        this.#verifyWaveformSegments(waveformSegments);
        const dataView = new DataView(new ArrayBuffer(waveformSegments.length * 2));
        waveformSegments.forEach((waveformSegment, index) => {
            dataView.setUint8(index * 2, Math.floor(waveformSegment.amplitude * 127));
            dataView.setUint8(index * 2 + 1, Math.floor(waveformSegment.duration / 10));
        });
        _console$F.log({ dataView });
        return this.#createData(locations, "waveform", dataView);
    }
    #createData(locations, vibrationType, dataView) {
        _console$F.assertWithError(dataView?.byteLength > 0, "no data received");
        const locationsBitmask = this.#createLocationsBitmask(locations);
        _console$F.assertEnumWithError(VibrationTypes, vibrationType);
        const vibrationTypeIndex = VibrationTypes.indexOf(vibrationType);
        _console$F.log({ locationsBitmask, vibrationTypeIndex, dataView });
        const data = concatenateArrayBuffers(locationsBitmask, vibrationTypeIndex, dataView.byteLength, dataView);
        _console$F.log({ data });
        return data;
    }
    async triggerVibration(vibrationConfigurations, sendImmediately = true) {
        if (!Array.isArray(vibrationConfigurations)) {
            vibrationConfigurations = [vibrationConfigurations];
        }
        if (vibrationConfigurations.length == 0) {
            _console$F.log("empty vibrationConfigurations");
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
                            _console$F.log("no segments");
                            return;
                        }
                        arrayBuffer = this.#createWaveformEffectsData(locations, segments, loopCount);
                    }
                    break;
                case "waveform":
                    {
                        const { segments } = vibrationConfiguration;
                        if (segments.length == 0) {
                            _console$F.log("no segments");
                            return;
                        }
                        arrayBuffer = this.#createWaveformData(locations, segments);
                    }
                    break;
                default:
                    throw Error(`invalid vibration type "${type}"`);
            }
            _console$F.log({ type, arrayBuffer });
            if (arrayBuffer.byteLength == 0) {
                _console$F.log("empty arrayBuffer");
                return;
            }
            triggerVibrationData = concatenateArrayBuffers(triggerVibrationData, arrayBuffer);
        });
        if (!triggerVibrationData) {
            _console$F.log("no triggerVibrationData");
            return;
        }
        if (triggerVibrationData.byteLength == 0) {
            _console$F.log("empty triggerVibrationData");
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
        _console$F.log("vibrationLocations", vibrationLocations);
        this.#dispatchEvent("getVibrationLocations", {
            vibrationLocations: this.#vibrationLocations,
        });
    }
    #parseVibrationLocations(dataView) {
        _console$F.log("parseVibrationLocations", dataView);
        const vibrationLocations = Array.from(new Uint8Array(dataView.buffer))
            .map((index) => VibrationLocations[index])
            .filter(Boolean);
        this.#onVibrationLocations(vibrationLocations);
    }
    parseMessage(messageType, dataView, isSending) {
        _console$F.log({ messageType, isSending }, dataView);
        switch (messageType) {
            case "getVibrationLocations":
                this.#parseVibrationLocations(dataView);
                break;
            case "triggerVibration":
                break;
            default:
                throw Error(`uncaught messageType ${messageType}`);
        }
    }
}

const _console$E = createConsole("WifiManager", { log: false });
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
        autoBind(this);
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
        _console$E.log("requesting required wifi information");
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
        _console$E.assertTypeWithError(updatedIsWifiAvailable, "boolean");
        this.#isWifiAvailable = updatedIsWifiAvailable;
        _console$E.log({ isWifiAvailable: this.#isWifiAvailable });
        this.#dispatchEvent("isWifiAvailable", {
            isWifiAvailable: this.#isWifiAvailable,
        });
    }
    #assertWifiIsAvailable() {
        _console$E.assertWithError(this.#isWifiAvailable, "wifi is not available");
    }
    #wifiSSID = "";
    get wifiSSID() {
        return this.#wifiSSID;
    }
    #updateWifiSSID(updatedWifiSSID) {
        _console$E.assertTypeWithError(updatedWifiSSID, "string");
        this.#wifiSSID = updatedWifiSSID;
        _console$E.log({ wifiSSID: this.#wifiSSID });
        this.#dispatchEvent("getWifiSSID", { wifiSSID: this.#wifiSSID });
    }
    async setWifiSSID(newWifiSSID) {
        this.#assertWifiIsAvailable();
        if (this.#wifiConnectionEnabled) {
            _console$E.error("cannot change ssid while wifi connection is enabled");
            return;
        }
        _console$E.assertTypeWithError(newWifiSSID, "string");
        if (newWifiSSID.length > 0) {
            _console$E.assertRangeWithError("wifiSSID", newWifiSSID.length, MinWifiSSIDLength, MaxWifiSSIDLength);
        }
        const setWifiSSIDData = textEncoder.encode(newWifiSSID);
        _console$E.log({ setWifiSSIDData });
        const promise = this.waitForEvent("getWifiSSID");
        this.sendMessage([{ type: "setWifiSSID", data: setWifiSSIDData.buffer }]);
        await promise;
    }
    #wifiPassword = "";
    get wifiPassword() {
        return this.#wifiPassword;
    }
    #updateWifiPassword(updatedWifiPassword) {
        _console$E.assertTypeWithError(updatedWifiPassword, "string");
        this.#wifiPassword = updatedWifiPassword;
        _console$E.log({ wifiPassword: this.#wifiPassword });
        this.#dispatchEvent("getWifiPassword", {
            wifiPassword: this.#wifiPassword,
        });
    }
    async setWifiPassword(newWifiPassword) {
        this.#assertWifiIsAvailable();
        if (this.#wifiConnectionEnabled) {
            _console$E.error("cannot change password while wifi connection is enabled");
            return;
        }
        _console$E.assertTypeWithError(newWifiPassword, "string");
        if (newWifiPassword.length > 0) {
            _console$E.assertRangeWithError("wifiPassword", newWifiPassword.length, MinWifiPasswordLength, MaxWifiPasswordLength);
        }
        const setWifiPasswordData = textEncoder.encode(newWifiPassword);
        _console$E.log({ setWifiPasswordData });
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
        _console$E.log({ wifiConnectionEnabled });
        this.#wifiConnectionEnabled = wifiConnectionEnabled;
        this.#dispatchEvent("getWifiConnectionEnabled", {
            wifiConnectionEnabled: wifiConnectionEnabled,
        });
    }
    async setWifiConnectionEnabled(newWifiConnectionEnabled, sendImmediately = true) {
        this.#assertWifiIsAvailable();
        _console$E.assertTypeWithError(newWifiConnectionEnabled, "boolean");
        if (this.#wifiConnectionEnabled == newWifiConnectionEnabled) {
            _console$E.log(`redundant wifiConnectionEnabled assignment ${newWifiConnectionEnabled}`);
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
        _console$E.assertTypeWithError(updatedIsWifiConnected, "boolean");
        this.#isWifiConnected = updatedIsWifiConnected;
        _console$E.log({ isWifiConnected: this.#isWifiConnected });
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
        _console$E.log({ ipAddress: this.#ipAddress });
        this.#dispatchEvent("ipAddress", {
            ipAddress: this.#ipAddress,
        });
    }
    #isWifiSecure = false;
    get isWifiSecure() {
        return this.#isWifiSecure;
    }
    #updateIsWifiSecure(updatedIsWifiSecure) {
        _console$E.assertTypeWithError(updatedIsWifiSecure, "boolean");
        this.#isWifiSecure = updatedIsWifiSecure;
        _console$E.log({ isWifiSecure: this.#isWifiSecure });
        this.#dispatchEvent("isWifiSecure", {
            isWifiSecure: this.#isWifiSecure,
        });
    }
    parseMessage(messageType, dataView, isSending) {
        _console$E.log({ messageType, isSending }, dataView);
        switch (messageType) {
            case "isWifiAvailable":
                const isWifiAvailable = Boolean(dataView.getUint8(0));
                _console$E.log({ isWifiAvailable });
                this.#updateIsWifiAvailable(isWifiAvailable);
                break;
            case "getWifiSSID":
            case "setWifiSSID":
                const ssid = textDecoder.decode(dataView.buffer);
                _console$E.log({ ssid });
                this.#updateWifiSSID(ssid);
                break;
            case "getWifiPassword":
            case "setWifiPassword":
                const password = textDecoder.decode(dataView.buffer);
                _console$E.log({ password });
                this.#updateWifiPassword(password);
                break;
            case "getWifiConnectionEnabled":
            case "setWifiConnectionEnabled":
                const enableWifiConnection = Boolean(dataView.getUint8(0));
                _console$E.log({ enableWifiConnection });
                this.#updateWifiConnectionEnabled(enableWifiConnection);
                break;
            case "isWifiConnected":
                const isWifiConnected = Boolean(dataView.getUint8(0));
                _console$E.log({ isWifiConnected });
                this.#updateIsWifiConnected(isWifiConnected);
                break;
            case "ipAddress":
                let ipAddress = undefined;
                if (dataView.byteLength == 4) {
                    ipAddress = new Uint8Array(dataView.buffer.slice(0, 4)).join(".");
                }
                _console$E.log({ ipAddress });
                this.#updateIpAddress(ipAddress);
                break;
            case "isWifiSecure":
                const isWifiSecure = Boolean(dataView.getUint8(0));
                _console$E.log({ isWifiSecure });
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

const _console$D = createConsole("ColorUtils", { log: false });
function hexToRGB(hex) {
    hex = hex.replace(/^#/, "");
    if (hex.length == 3) {
        hex = hex
            .split("")
            .map((char) => char + char)
            .join("");
    }
    _console$D.assertWithError(hex.length == 6, `hex length must be 6 (got ${hex.length})`);
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
    _console$D.assertWithError([r, g, b].every((v) => v >= 0 && v <= 255), `RGB values must be between 0 and 255 (got r=${r}, g=${g}, b=${b})`);
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
function colorDistanceSq(a, b) {
    return (a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2;
}
const defaultKMeansOptions = {
    useInputColors: true,
    maxIterations: 20,
};
function kMeansColors(colors, k, options) {
    _console$D.assertTypeWithError(k, "number");
    _console$D.assertWithError(k > 0, `invalid k ${k}`);
    options = { ...defaultKMeansOptions, ...options };
    const maxIter = options.maxIterations;
    const useInputColors = options.useInputColors;
    const colorMap = new Map();
    for (const c of colors) {
        if (!colorMap.has(c)) {
            colorMap.set(c, stringToRGB(c));
        }
    }
    const uniqueColors = Array.from(colorMap.values());
    const uniqueKeys = Array.from(colorMap.keys());
    if (uniqueColors.length <= k) {
        const mapping = {};
        uniqueKeys.forEach((key, idx) => (mapping[key] = idx));
        return { palette: uniqueKeys, mapping };
    }
    let centroids = uniqueColors.slice(0, k);
    for (let iter = 0; iter < maxIter; iter++) {
        const clusters = Array.from({ length: k }, () => []);
        uniqueColors.forEach((p, idx) => {
            let best = 0;
            let bestDist = Infinity;
            centroids.forEach((c, ci) => {
                const d = colorDistanceSq(p, c);
                if (d < bestDist) {
                    bestDist = d;
                    best = ci;
                }
            });
            clusters[best].push(idx);
        });
        centroids = clusters.map((cluster) => {
            if (cluster.length === 0)
                return { ...blackColor };
            if (useInputColors) {
                let bestIdx = cluster[0];
                let bestDist = Infinity;
                cluster.forEach((idx) => {
                    const d = colorDistanceSq(uniqueColors[idx], centroids[0]);
                    if (d < bestDist) {
                        bestDist = d;
                        bestIdx = idx;
                    }
                });
                return uniqueColors[bestIdx];
            }
            else {
                const sum = cluster.reduce((acc, idx) => {
                    const p = uniqueColors[idx];
                    return {
                        r: acc.r + p.r,
                        g: acc.g + p.g,
                        b: acc.b + p.b,
                    };
                }, { ...blackColor });
                return {
                    r: sum.r / cluster.length,
                    g: sum.g / cluster.length,
                    b: sum.b / cluster.length,
                };
            }
        });
    }
    const palette = centroids.map((c) => rgbToHex(c));
    const mapping = {};
    for (const [orig, DisplayColorRGB] of colorMap.entries()) {
        let bestIdx = 0;
        let bestDist = Infinity;
        centroids.forEach((c, ci) => {
            const d = colorDistanceSq(c, DisplayColorRGB);
            if (d < bestDist) {
                bestDist = d;
                bestIdx = ci;
            }
        });
        mapping[orig] = bestIdx;
    }
    return { palette, mapping };
}
function mapToClosestPaletteIndex(colors, palette) {
    const paletteRGB = palette.map(stringToRGB);
    const mapping = {};
    for (const color of colors) {
        const rgb = stringToRGB(color);
        let bestIdx = 0;
        let bestDist = Infinity;
        paletteRGB.forEach((p, idx) => {
            const d = colorDistanceSq(rgb, p);
            if (d < bestDist) {
                bestDist = d;
                bestIdx = idx;
            }
        });
        mapping[color] = bestIdx;
    }
    return mapping;
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var rgbquant = {exports: {}};

(function (module) {
	(function(){
		function RgbQuant(opts) {
			opts = opts || {};
			this.method = opts.method || 2;
			this.colors = opts.colors || 256;
			this.initColors = opts.initColors || 4096;
			this.initDist = opts.initDist || 0.01;
			this.distIncr = opts.distIncr || 0.005;
			this.hueGroups = opts.hueGroups || 10;
			this.satGroups = opts.satGroups || 10;
			this.lumGroups = opts.lumGroups || 10;
			this.minHueCols = opts.minHueCols || 0;
			this.hueStats = this.minHueCols ? new HueStats(this.hueGroups, this.minHueCols) : null;
			this.boxSize = opts.boxSize || [64,64];
			this.boxPxls = opts.boxPxls || 2;
			this.palLocked = false;
			this.dithKern = opts.dithKern || null;
			this.dithSerp = opts.dithSerp || false;
			this.dithDelta = opts.dithDelta || 0;
			this.histogram = {};
			this.idxrgb = opts.palette ? opts.palette.slice(0) : [];
			this.idxi32 = [];
			this.i32idx = {};
			this.i32rgb = {};
			this.useCache = opts.useCache !== false;
			this.cacheFreq = opts.cacheFreq || 10;
			this.reIndex = opts.reIndex || this.idxrgb.length == 0;
			this.colorDist = opts.colorDist == "manhattan" ? distManhattan : distEuclidean;
			if (this.idxrgb.length > 0) {
				var self = this;
				this.idxrgb.forEach(function(rgb, i) {
					var i32 = (
						(255    << 24) |
						(rgb[2] << 16) |
						(rgb[1] <<  8) |
						 rgb[0]
					) >>> 0;
					self.idxi32[i]		= i32;
					self.i32idx[i32]	= i;
					self.i32rgb[i32]	= rgb;
				});
			}
		}
		RgbQuant.prototype.sample = function sample(img, width) {
			if (this.palLocked)
				throw "Cannot sample additional images, palette already assembled.";
			var data = getImageData(img, width);
			switch (this.method) {
				case 1: this.colorStats1D(data.buf32); break;
				case 2: this.colorStats2D(data.buf32, data.width); break;
			}
		};
		RgbQuant.prototype.reduce = function reduce(img, retType, dithKern, dithSerp) {
			if (!this.palLocked)
				this.buildPal();
			dithKern = dithKern || this.dithKern;
			dithSerp = typeof dithSerp != "undefined" ? dithSerp : this.dithSerp;
			retType = retType || 1;
			if (dithKern)
				var out32 = this.dither(img, dithKern, dithSerp);
			else {
				var data = getImageData(img),
					buf32 = data.buf32,
					len = buf32.length,
					out32 = new Uint32Array(len);
				for (var i = 0; i < len; i++) {
					var i32 = buf32[i];
					out32[i] = this.nearestColor(i32);
				}
			}
			if (retType == 1)
				return new Uint8Array(out32.buffer);
			if (retType == 2) {
				var out = [],
					len = out32.length;
				for (var i = 0; i < len; i++) {
					var i32 = out32[i];
					out[i] = this.i32idx[i32];
				}
				return out;
			}
		};
		RgbQuant.prototype.dither = function(img, kernel, serpentine) {
			var kernels = {
				FloydSteinberg: [
					[7 / 16, 1, 0],
					[3 / 16, -1, 1],
					[5 / 16, 0, 1],
					[1 / 16, 1, 1]
				],
				FalseFloydSteinberg: [
					[3 / 8, 1, 0],
					[3 / 8, 0, 1],
					[2 / 8, 1, 1]
				],
				Stucki: [
					[8 / 42, 1, 0],
					[4 / 42, 2, 0],
					[2 / 42, -2, 1],
					[4 / 42, -1, 1],
					[8 / 42, 0, 1],
					[4 / 42, 1, 1],
					[2 / 42, 2, 1],
					[1 / 42, -2, 2],
					[2 / 42, -1, 2],
					[4 / 42, 0, 2],
					[2 / 42, 1, 2],
					[1 / 42, 2, 2]
				],
				Atkinson: [
					[1 / 8, 1, 0],
					[1 / 8, 2, 0],
					[1 / 8, -1, 1],
					[1 / 8, 0, 1],
					[1 / 8, 1, 1],
					[1 / 8, 0, 2]
				],
				Jarvis: [
					[7 / 48, 1, 0],
					[5 / 48, 2, 0],
					[3 / 48, -2, 1],
					[5 / 48, -1, 1],
					[7 / 48, 0, 1],
					[5 / 48, 1, 1],
					[3 / 48, 2, 1],
					[1 / 48, -2, 2],
					[3 / 48, -1, 2],
					[5 / 48, 0, 2],
					[3 / 48, 1, 2],
					[1 / 48, 2, 2]
				],
				Burkes: [
					[8 / 32, 1, 0],
					[4 / 32, 2, 0],
					[2 / 32, -2, 1],
					[4 / 32, -1, 1],
					[8 / 32, 0, 1],
					[4 / 32, 1, 1],
					[2 / 32, 2, 1],
				],
				Sierra: [
					[5 / 32, 1, 0],
					[3 / 32, 2, 0],
					[2 / 32, -2, 1],
					[4 / 32, -1, 1],
					[5 / 32, 0, 1],
					[4 / 32, 1, 1],
					[2 / 32, 2, 1],
					[2 / 32, -1, 2],
					[3 / 32, 0, 2],
					[2 / 32, 1, 2],
				],
				TwoSierra: [
					[4 / 16, 1, 0],
					[3 / 16, 2, 0],
					[1 / 16, -2, 1],
					[2 / 16, -1, 1],
					[3 / 16, 0, 1],
					[2 / 16, 1, 1],
					[1 / 16, 2, 1],
				],
				SierraLite: [
					[2 / 4, 1, 0],
					[1 / 4, -1, 1],
					[1 / 4, 0, 1],
				],
			};
			if (!kernel || !kernels[kernel]) {
				throw 'Unknown dithering kernel: ' + kernel;
			}
			var ds = kernels[kernel];
			var data = getImageData(img),
				buf32 = data.buf32,
				width = data.width,
				height = data.height;
				buf32.length;
			var dir = serpentine ? -1 : 1;
			for (var y = 0; y < height; y++) {
				if (serpentine)
					dir = dir * -1;
				var lni = y * width;
				for (var x = (dir == 1 ? 0 : width - 1), xend = (dir == 1 ? width : 0); x !== xend; x += dir) {
					var idx = lni + x,
						i32 = buf32[idx],
						r1 = (i32 & 0xff),
						g1 = (i32 & 0xff00) >> 8,
						b1 = (i32 & 0xff0000) >> 16;
					var i32x = this.nearestColor(i32),
						r2 = (i32x & 0xff),
						g2 = (i32x & 0xff00) >> 8,
						b2 = (i32x & 0xff0000) >> 16;
					buf32[idx] =
						(255 << 24)	|
						(b2  << 16)	|
						(g2  <<  8)	|
						 r2;
					if (this.dithDelta) {
						var dist = this.colorDist([r1, g1, b1], [r2, g2, b2]);
						if (dist < this.dithDelta)
							continue;
					}
					var er = r1 - r2,
						eg = g1 - g2,
						eb = b1 - b2;
					for (var i = (dir == 1 ? 0 : ds.length - 1), end = (dir == 1 ? ds.length : 0); i !== end; i += dir) {
						var x1 = ds[i][1] * dir,
							y1 = ds[i][2];
						var lni2 = y1 * width;
						if (x1 + x >= 0 && x1 + x < width && y1 + y >= 0 && y1 + y < height) {
							var d = ds[i][0];
							var idx2 = idx + (lni2 + x1);
							var r3 = (buf32[idx2] & 0xff),
								g3 = (buf32[idx2] & 0xff00) >> 8,
								b3 = (buf32[idx2] & 0xff0000) >> 16;
							var r4 = Math.max(0, Math.min(255, r3 + er * d)),
								g4 = Math.max(0, Math.min(255, g3 + eg * d)),
								b4 = Math.max(0, Math.min(255, b3 + eb * d));
							buf32[idx2] =
								(255 << 24)	|
								(b4  << 16)	|
								(g4  <<  8)	|
								 r4;
						}
					}
				}
			}
			return buf32;
		};
		RgbQuant.prototype.buildPal = function buildPal(noSort) {
			if (this.palLocked || this.idxrgb.length > 0 && this.idxrgb.length <= this.colors) return;
			var histG  = this.histogram,
				sorted = sortedHashKeys(histG);
			if (sorted.length == 0)
				throw "Nothing has been sampled, palette cannot be built.";
			switch (this.method) {
				case 1:
					var cols = this.initColors,
						last = sorted[cols - 1],
						freq = histG[last];
					var idxi32 = sorted.slice(0, cols);
					var pos = cols, len = sorted.length;
					while (pos < len && histG[sorted[pos]] == freq)
						idxi32.push(sorted[pos++]);
					if (this.hueStats)
						this.hueStats.inject(idxi32);
					break;
				case 2:
					var idxi32 = sorted;
					break;
			}
			idxi32 = idxi32.map(function(v){return +v;});
			this.reducePal(idxi32);
			if (!noSort && this.reIndex)
				this.sortPal();
			if (this.useCache)
				this.cacheHistogram(idxi32);
			this.palLocked = true;
		};
		RgbQuant.prototype.palette = function palette(tuples, noSort) {
			this.buildPal(noSort);
			return tuples ? this.idxrgb : new Uint8Array((new Uint32Array(this.idxi32)).buffer);
		};
		RgbQuant.prototype.prunePal = function prunePal(keep) {
			var i32;
			for (var j = 0; j < this.idxrgb.length; j++) {
				if (!keep[j]) {
					i32 = this.idxi32[j];
					this.idxrgb[j] = null;
					this.idxi32[j] = null;
					delete this.i32idx[i32];
				}
			}
			if (this.reIndex) {
				var idxrgb = [],
					idxi32 = [],
					i32idx = {};
				for (var j = 0, i = 0; j < this.idxrgb.length; j++) {
					if (this.idxrgb[j]) {
						i32 = this.idxi32[j];
						idxrgb[i] = this.idxrgb[j];
						i32idx[i32] = i;
						idxi32[i] = i32;
						i++;
					}
				}
				this.idxrgb = idxrgb;
				this.idxi32 = idxi32;
				this.i32idx = i32idx;
			}
		};
		RgbQuant.prototype.reducePal = function reducePal(idxi32) {
			if (this.idxrgb.length > this.colors) {
				var len = idxi32.length, keep = {}, uniques = 0, idx, pruned = false;
				for (var i = 0; i < len; i++) {
					if (uniques == this.colors && !pruned) {
						this.prunePal(keep);
						pruned = true;
					}
					idx = this.nearestIndex(idxi32[i]);
					if (uniques < this.colors && !keep[idx]) {
						keep[idx] = true;
						uniques++;
					}
				}
				if (!pruned) {
					this.prunePal(keep);
					pruned = true;
				}
			}
			else {
				var idxrgb = idxi32.map(function(i32) {
					return [
						(i32 & 0xff),
						(i32 & 0xff00) >> 8,
						(i32 & 0xff0000) >> 16,
					];
				});
				var len = idxrgb.length,
					palLen = len,
					thold = this.initDist;
				if (palLen > this.colors) {
					while (palLen > this.colors) {
						var memDist = [];
						for (var i = 0; i < len; i++) {
							var pxi = idxrgb[i]; idxi32[i];
							if (!pxi) continue;
							for (var j = i + 1; j < len; j++) {
								var pxj = idxrgb[j], i32j = idxi32[j];
								if (!pxj) continue;
								var dist = this.colorDist(pxi, pxj);
								if (dist < thold) {
									memDist.push([j, pxj, i32j, dist]);
									delete(idxrgb[j]);
									palLen--;
								}
							}
						}
						thold += (palLen > this.colors * 3) ? this.initDist : this.distIncr;
					}
					if (palLen < this.colors) {
						sort.call(memDist, function(a,b) {
							return b[3] - a[3];
						});
						var k = 0;
						while (palLen < this.colors) {
							idxrgb[memDist[k][0]] = memDist[k][1];
							palLen++;
							k++;
						}
					}
				}
				var len = idxrgb.length;
				for (var i = 0; i < len; i++) {
					if (!idxrgb[i]) continue;
					this.idxrgb.push(idxrgb[i]);
					this.idxi32.push(idxi32[i]);
					this.i32idx[idxi32[i]] = this.idxi32.length - 1;
					this.i32rgb[idxi32[i]] = idxrgb[i];
				}
			}
		};
		RgbQuant.prototype.colorStats1D = function colorStats1D(buf32) {
			var histG = this.histogram,
				col,
				len = buf32.length;
			for (var i = 0; i < len; i++) {
				col = buf32[i];
				if ((col & 0xff000000) >> 24 == 0) continue;
				if (this.hueStats)
					this.hueStats.check(col);
				if (col in histG)
					histG[col]++;
				else
					histG[col] = 1;
			}
		};
		RgbQuant.prototype.colorStats2D = function colorStats2D(buf32, width) {
			var boxW = this.boxSize[0],
				boxH = this.boxSize[1],
				area = boxW * boxH,
				boxes = makeBoxes(width, buf32.length / width, boxW, boxH),
				histG = this.histogram,
				self = this;
			boxes.forEach(function(box) {
				var effc = Math.max(Math.round((box.w * box.h) / area) * self.boxPxls, 2),
					histL = {}, col;
				iterBox(box, width, function(i) {
					col = buf32[i];
					if ((col & 0xff000000) >> 24 == 0) return;
					if (self.hueStats)
						self.hueStats.check(col);
					if (col in histG)
						histG[col]++;
					else if (col in histL) {
						if (++histL[col] >= effc)
							histG[col] = histL[col];
					}
					else
						histL[col] = 1;
				});
			});
			if (this.hueStats)
				this.hueStats.inject(histG);
		};
		RgbQuant.prototype.sortPal = function sortPal() {
			var self = this;
			this.idxi32.sort(function(a,b) {
				var idxA = self.i32idx[a],
					idxB = self.i32idx[b],
					rgbA = self.idxrgb[idxA],
					rgbB = self.idxrgb[idxB];
				var hslA = rgb2hsl(rgbA[0],rgbA[1],rgbA[2]),
					hslB = rgb2hsl(rgbB[0],rgbB[1],rgbB[2]);
				var hueA = (rgbA[0] == rgbA[1] && rgbA[1] == rgbA[2]) ? -1 : hueGroup(hslA.h, self.hueGroups);
				var hueB = (rgbB[0] == rgbB[1] && rgbB[1] == rgbB[2]) ? -1 : hueGroup(hslB.h, self.hueGroups);
				var hueDiff = hueB - hueA;
				if (hueDiff) return -hueDiff;
				var lumDiff = lumGroup(+hslB.l.toFixed(2)) - lumGroup(+hslA.l.toFixed(2));
				if (lumDiff) return -lumDiff;
				var satDiff = satGroup(+hslB.s.toFixed(2)) - satGroup(+hslA.s.toFixed(2));
				if (satDiff) return -satDiff;
			});
			this.idxi32.forEach(function(i32, i) {
				self.idxrgb[i] = self.i32rgb[i32];
				self.i32idx[i32] = i;
			});
		};
		RgbQuant.prototype.nearestColor = function nearestColor(i32) {
			var idx = this.nearestIndex(i32);
			return idx === null ? 0 : this.idxi32[idx];
		};
		RgbQuant.prototype.nearestIndex = function nearestIndex(i32) {
			if ((i32 & 0xff000000) >> 24 == 0)
				return null;
			if (this.useCache && (""+i32) in this.i32idx)
				return this.i32idx[i32];
			var min = 1000,
				idx,
				rgb = [
					(i32 & 0xff),
					(i32 & 0xff00) >> 8,
					(i32 & 0xff0000) >> 16,
				],
				len = this.idxrgb.length;
			for (var i = 0; i < len; i++) {
				if (!this.idxrgb[i]) continue;
				var dist = this.colorDist(rgb, this.idxrgb[i]);
				if (dist < min) {
					min = dist;
					idx = i;
				}
			}
			return idx;
		};
		RgbQuant.prototype.cacheHistogram = function cacheHistogram(idxi32) {
			for (var i = 0, i32 = idxi32[i]; i < idxi32.length && this.histogram[i32] >= this.cacheFreq; i32 = idxi32[i++])
				this.i32idx[i32] = this.nearestIndex(i32);
		};
		function HueStats(numGroups, minCols) {
			this.numGroups = numGroups;
			this.minCols = minCols;
			this.stats = {};
			for (var i = -1; i < numGroups; i++)
				this.stats[i] = {num: 0, cols: []};
			this.groupsFull = 0;
		}
		HueStats.prototype.check = function checkHue(i32) {
			if (this.groupsFull == this.numGroups + 1)
				this.check = function() {return;};
			var r = (i32 & 0xff),
				g = (i32 & 0xff00) >> 8,
				b = (i32 & 0xff0000) >> 16,
				hg = (r == g && g == b) ? -1 : hueGroup(rgb2hsl(r,g,b).h, this.numGroups),
				gr = this.stats[hg],
				min = this.minCols;
			gr.num++;
			if (gr.num > min)
				return;
			if (gr.num == min)
				this.groupsFull++;
			if (gr.num <= min)
				this.stats[hg].cols.push(i32);
		};
		HueStats.prototype.inject = function injectHues(histG) {
			for (var i = -1; i < this.numGroups; i++) {
				if (this.stats[i].num <= this.minCols) {
					switch (typeOf(histG)) {
						case "Array":
							this.stats[i].cols.forEach(function(col){
								if (histG.indexOf(col) == -1)
									histG.push(col);
							});
							break;
						case "Object":
							this.stats[i].cols.forEach(function(col){
								if (!histG[col])
									histG[col] = 1;
								else
									histG[col]++;
							});
							break;
					}
				}
			}
		};
		var Pr = .2126,
			Pg = .7152,
			Pb = .0722;
		function rgb2lum(r,g,b) {
			return Math.sqrt(
				Pr * r*r +
				Pg * g*g +
				Pb * b*b
			);
		}
		var rd = 255,
			gd = 255,
			bd = 255;
		var euclMax = Math.sqrt(Pr*rd*rd + Pg*gd*gd + Pb*bd*bd);
		function distEuclidean(rgb0, rgb1) {
			var rd = rgb1[0]-rgb0[0],
				gd = rgb1[1]-rgb0[1],
				bd = rgb1[2]-rgb0[2];
			return Math.sqrt(Pr*rd*rd + Pg*gd*gd + Pb*bd*bd) / euclMax;
		}
		var manhMax = Pr*rd + Pg*gd + Pb*bd;
		function distManhattan(rgb0, rgb1) {
			var rd = Math.abs(rgb1[0]-rgb0[0]),
				gd = Math.abs(rgb1[1]-rgb0[1]),
				bd = Math.abs(rgb1[2]-rgb0[2]);
			return (Pr*rd + Pg*gd + Pb*bd) / manhMax;
		}
		function rgb2hsl(r, g, b) {
			var max, min, h, s, l, d;
			r /= 255;
			g /= 255;
			b /= 255;
			max = Math.max(r, g, b);
			min = Math.min(r, g, b);
			l = (max + min) / 2;
			if (max == min) {
				h = s = 0;
			} else {
				d = max - min;
				s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
				switch (max) {
					case r: h = (g - b) / d + (g < b ? 6 : 0); break;
					case g:	h = (b - r) / d + 2; break;
					case b:	h = (r - g) / d + 4; break
				}
				h /= 6;
			}
			return {
				h: h,
				s: s,
				l: rgb2lum(r,g,b),
			};
		}
		function hueGroup(hue, segs) {
			var seg = 1/segs,
				haf = seg/2;
			if (hue >= 1 - haf || hue <= haf)
				return 0;
			for (var i = 1; i < segs; i++) {
				var mid = i*seg;
				if (hue >= mid - haf && hue <= mid + haf)
					return i;
			}
		}
		function satGroup(sat) {
			return sat;
		}
		function lumGroup(lum) {
			return lum;
		}
		function typeOf(val) {
			return Object.prototype.toString.call(val).slice(8,-1);
		}
		var sort = isArrSortStable() ? Array.prototype.sort : stableSort;
		function stableSort(fn) {
			var type = typeOf(this[0]);
			if (type == "Number" || type == "String") {
				var ord = {}, len = this.length, val;
				for (var i = 0; i < len; i++) {
					val = this[i];
					if (ord[val] || ord[val] === 0) continue;
					ord[val] = i;
				}
				return this.sort(function(a,b) {
					return fn(a,b) || ord[a] - ord[b];
				});
			}
			else {
				var ord = this.map(function(v){return v});
				return this.sort(function(a,b) {
					return fn(a,b) || ord.indexOf(a) - ord.indexOf(b);
				});
			}
		}
		function isArrSortStable() {
			var str = "abcdefghijklmnopqrstuvwxyz";
			return "xyzvwtursopqmnklhijfgdeabc" == str.split("").sort(function(a,b) {
				return ~~(str.indexOf(b)/2.3) - ~~(str.indexOf(a)/2.3);
			}).join("");
		}
		function getImageData(img, width) {
			var can, ctx, imgd, buf8, buf32, height;
			switch (typeOf(img)) {
				case "HTMLImageElement":
					can = document.createElement("canvas");
					can.width = img.naturalWidth;
					can.height = img.naturalHeight;
					ctx = can.getContext("2d");
					ctx.drawImage(img,0,0);
				case "Canvas":
				case "HTMLCanvasElement":
					can = can || img;
					ctx = ctx || can.getContext("2d");
				case "CanvasRenderingContext2D":
					ctx = ctx || img;
					can = can || ctx.canvas;
					imgd = ctx.getImageData(0, 0, can.width, can.height);
				case "ImageData":
					imgd = imgd || img;
					width = imgd.width;
					if (typeOf(imgd.data) == "CanvasPixelArray")
						buf8 = new Uint8Array(imgd.data);
					else
						buf8 = imgd.data;
				case "Array":
				case "CanvasPixelArray":
					buf8 = buf8 || new Uint8Array(img);
				case "Uint8Array":
				case "Uint8ClampedArray":
					buf8 = buf8 || img;
					buf32 = new Uint32Array(buf8.buffer);
				case "Uint32Array":
					buf32 = buf32 || img;
					buf8 = buf8 || new Uint8Array(buf32.buffer);
					width = width || buf32.length;
					height = buf32.length / width;
			}
			return {
				can: can,
				ctx: ctx,
				imgd: imgd,
				buf8: buf8,
				buf32: buf32,
				width: width,
				height: height,
			};
		}
		function makeBoxes(wid, hgt, w0, h0) {
			var wrem = wid%w0,
				hrem = hgt%h0,
				xend = wid-wrem, yend = hgt-hrem;
			var bxs = [];
			for (var y = 0; y < hgt; y += h0)
				for (var x = 0; x < wid; x += w0)
					bxs.push({x:x, y:y, w:(x==xend?wrem:w0), h:(y==yend?hrem:h0)});
			return bxs;
		}
		function iterBox(bbox, wid, fn) {
			var b = bbox,
				i0 = b.y * wid + b.x,
				i1 = (b.y + b.h - 1) * wid + (b.x + b.w - 1),
				cnt = 0, incr = wid - b.w + 1, i = i0;
			do {
				fn.call(this, i);
				i += (++cnt % b.w == 0) ? incr : 1;
			} while (i <= i1);
		}
		function sortedHashKeys(obj, desc) {
			var keys = [];
			for (var key in obj)
				keys.push(key);
			return sort.call(keys, function(a,b) {
				return obj[b] - obj[a] ;
			});
		}
		this.RgbQuant = RgbQuant;
		if (module.exports) {
			module.exports = RgbQuant;
		}
	}).call(commonjsGlobal);
} (rgbquant));
var rgbquantExports = rgbquant.exports;
var RGBQuant = getDefaultExportFromCjs(rgbquantExports);

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

const _console$C = createConsole("DisplayContextState", { log: false });
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
function diffContextState(state, other = DefaultDisplayContextState) {
    let differences = [];
    const keys = Object.keys(other);
    keys.forEach((key) => {
        const value = other[key];
        if (!deepEqual(state[key], value)) {
            differences.push(key);
        }
    });
    _console$C.log("diff displayContextState", other, differences);
    return differences;
}
function updateContextState(state, newState) {
    let differences = diffContextState(state, newState);
    if (differences.length == 0) {
        _console$C.log("redundant contextState", newState);
    }
    else {
        _console$C.log("found contextState differences", newState);
    }
    differences.forEach((key) => {
        const value = newState[key];
        state[key] = value;
        _console$C.log("updated state", { key, value }, state);
    });
    return differences;
}
function resetContextState(state, numberOfColors, keepColorIndices, keepSpriteColorIndices) {
    _console$C.log("reset", {
        numberOfColors,
        keepColorIndices,
        keepSpriteColorIndices,
    });
    const spriteColorIndices = state.spriteColorIndices.slice();
    const { fillColorIndex, lineColorIndex, backgroundColorIndex } = state;
    const differences = diffContextState(state, DefaultDisplayContextState);
    _console$C.log("reset differences", differences);
    Object.assign(state, DefaultDisplayContextState);
    if (keepColorIndices) {
        state.fillColorIndex = fillColorIndex;
        state.lineColorIndex = lineColorIndex;
        state.backgroundColorIndex = backgroundColorIndex;
    }
    if (keepSpriteColorIndices) {
        state.spriteColorIndices = spriteColorIndices;
    }
    else {
        state.spriteColorIndices = new Array(numberOfColors).fill(0);
    }
    state.bitmapColorIndices = new Array(numberOfColors).fill(0);
    return differences;
}

const _console$B = createConsole("DisplayUtils", { log: false });
function formatRotation(rotation, isRadians, isSigned) {
    if (isRadians) {
        const rotationRad = rotation;
        _console$B.log({ rotationRad });
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
        _console$B.log({ rotationDeg });
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
    _console$B.log({ formattedRotation: rotation });
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
    _console$B.log({ parsedRotation: rotation });
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
    _console$B.assertEnumWithError(DisplaySegmentCaps, segmentCap);
}
function assertValidDisplayBrightness(displayBrightness) {
    _console$B.assertEnumWithError(DisplayBrightnesses, displayBrightness);
}
function assertValidColorValue(name, value) {
    _console$B.assertRangeWithError(name, value, 0, 255);
}
function assertValidColor(color) {
    assertValidColorValue("red", color.r);
    assertValidColorValue("green", color.g);
    assertValidColorValue("blue", color.b);
}
function assertValidOpacity(value) {
    _console$B.assertRangeWithError("opacity", value, 0, 1);
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
    _console$B.assertEnumWithError(DisplayAlignments, alignment);
}
function assertValidDirection(direction) {
    _console$B.assertEnumWithError(DisplayDirections, direction);
}
function assertValidAlignmentDirection(direction) {
    _console$B.assertEnumWithError(DisplayAlignmentDirections, direction);
}
const displayCurveTypeToNumberOfControlPoints = {
    segment: 2,
    quadratic: 3,
    cubic: 4,
};
const displayCurveTolerance = 2.0;
const displayCurveToleranceSquared = displayCurveTolerance ** 2;
const maxNumberOfDisplayCurvePoints = 200;
function assertValidNumberOfControlPoints(curveType, controlPoints, isPath = false) {
    const numberOfControlPoints = getNumberOfConrolPoints(curveType, isPath);
    _console$B.assertWithError(controlPoints.length == numberOfControlPoints, `invalid number of control points ${controlPoints.length}, expected ${numberOfControlPoints}`);
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
    _console$B.assertWithError((controlPoints.length - 1) % (numberOfControlPoints - 1) == 0, `invalid number of path control points ${controlPoints.length} for path "${curveType}"`);
}
function assertValidPath(curves) {
    curves.forEach((curve, index) => {
        const { type, controlPoints } = curve;
        assertValidNumberOfControlPoints(type, controlPoints, index > 0);
    });
}
function assertValidWireframe({ points, edges }) {
    _console$B.assertRangeWithError("numberOfPoints", points.length, 2, 255);
    _console$B.assertRangeWithError("numberOfEdges", edges.length, 1, 255);
    edges.forEach((edge, index) => {
        _console$B.assertRangeWithError(`edgeStartIndex.${index}`, edge.startIndex, 0, points.length);
        _console$B.assertRangeWithError(`edgeEndIndex.${index}`, edge.endIndex, 0, points.length);
    });
}
function isWireframePolygon({ points, edges, }) {
    _console$B.log("isWireframePolygon?", points, edges);
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
            _console$B.log(i, "edge", edge);
            if (edge) {
                _edges.splice(_edges.indexOf(edge), 1);
                const endIndex = edge.startIndex == startIndex ? edge.endIndex : edge.startIndex;
                if (i == points.length - 1) {
                    if (endIndex != pointIndices[0]) {
                        return;
                    }
                }
                else if (pointIndices.includes(endIndex)) {
                    _console$B.log("duplicate endIndex", endIndex);
                    return;
                }
                pointIndices.push(endIndex);
            }
            else {
                _console$B.log("no edge found");
                return;
            }
        }
        _console$B.log("remaining edges", _edges);
    }
    _console$B.log("pointIndices", pointIndices);
    const polygon = pointIndices
        .map((pointIndex) => points[pointIndex])
        .filter((point, index, polygon) => polygon.indexOf(point) == index);
    if (polygon.length == points.length) {
        polygon.push(polygon[0]);
        _console$B.log("polygon", polygon);
        return polygon;
    }
}
function mergeWireframes(a, b) {
    const wireframe = structuredClone(a);
    const pointIndexOffset = a.points.length;
    b.points.forEach((point) => {
        wireframe.points.push(point);
    });
    b.edges.forEach(({ startIndex, endIndex }) => {
        wireframe.edges.push({
            startIndex: startIndex + pointIndexOffset,
            endIndex: endIndex + pointIndexOffset,
        });
    });
    return trimWireframe(wireframe);
}
function intersectWireframes(a, b, ignoreDirection = true) {
    a = trimWireframe(a);
    b = trimWireframe(b);
    const wireframe = { points: [], edges: [] };
    const aPointIndices = [];
    const bPointIndices = [];
    a.points.forEach((point, aPointIndex) => {
        const bPointIndex = b.points.findIndex((_point) => {
            const distance = getVector2Distance(point, _point);
            return distance == 0;
        });
        if (bPointIndex != -1) {
            aPointIndices.push(aPointIndex);
            bPointIndices.push(bPointIndex);
            wireframe.points.push(structuredClone(point));
        }
    });
    a.edges.forEach((aEdge) => {
        if (!aPointIndices.includes(aEdge.startIndex) ||
            !aPointIndices.includes(aEdge.endIndex)) {
            return;
        }
        const startIndex = aPointIndices.indexOf(aEdge.startIndex);
        const endIndex = aPointIndices.indexOf(aEdge.endIndex);
        const bEdge = b.edges.find((bEdge) => {
            if (!bPointIndices.includes(bEdge.startIndex) ||
                !bPointIndices.includes(bEdge.endIndex)) {
                return false;
            }
            const bStartIndex = bPointIndices.indexOf(bEdge.startIndex);
            const bEndIndex = bPointIndices.indexOf(bEdge.endIndex);
            if (ignoreDirection) {
                return ((startIndex == bStartIndex && endIndex == bEndIndex) ||
                    (startIndex == bEndIndex && endIndex == bStartIndex));
            }
            else {
                return startIndex == bStartIndex && endIndex == bEndIndex;
            }
        });
        if (!bEdge) {
            return;
        }
        wireframe.edges.push({
            startIndex,
            endIndex,
        });
    });
    return wireframe;
}
function trimWireframe(wireframe) {
    _console$B.log("trimming wireframe", wireframe);
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
    _console$B.log("trimmedWireframe", trimmedPoints, trimmedEdges);
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
    _console$B.log("pointDataType", pointDataType, points);
    return pointDataType;
}
function serializePoints(points, pointDataType, isPath = false) {
    pointDataType = pointDataType || getPointDataType(points);
    _console$B.log("serializePoints", points, { pointDataType, isPath });
    _console$B.assertEnumWithError(DisplayPointDataTypes, pointDataType);
    const pointDataSize = displayPointDataTypeToSize[pointDataType];
    let dataViewLength = points.length * pointDataSize;
    if (!isPath) {
        dataViewLength += 2;
    }
    const dataView = new DataView(new ArrayBuffer(dataViewLength));
    _console$B.log(`serializing ${points.length} ${pointDataType} points (${dataView.byteLength} bytes)...`);
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
function parsePoints(dataView, offset, isPath, pointDataType, numberOfPoints) {
    _console$B.log("parsePoints", dataView, {
        offset,
        isPath,
        pointDataType,
        numberOfPoints,
    });
    const points = [];
    if (pointDataType == undefined) {
        pointDataType = DisplayPointDataTypes[dataView.getUint8(offset++)];
    }
    _console$B.log({ pointDataType });
    _console$B.assertEnumWithError(DisplayPointDataTypes, pointDataType);
    if (numberOfPoints == undefined) {
        numberOfPoints = dataView.getUint8(offset++);
    }
    _console$B.log({ numberOfPoints });
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
    _console$B.log("parsedPoints", points, { offset });
    return { points, offset };
}

if (!String.prototype.codePointAt) {
	(function() {
		var defineProperty = (function() {
			try {
				var object = {};
				var $defineProperty = Object.defineProperty;
				var result = $defineProperty(object, object, object) && $defineProperty;
			} catch(error) {}
			return result;
		}());
		var codePointAt = function(position) {
			if (this == null) {
				throw TypeError();
			}
			var string = String(this);
			var size = string.length;
			var index = position ? Number(position) : 0;
			if (index != index) {
				index = 0;
			}
			if (index < 0 || index >= size) {
				return undefined;
			}
			var first = string.charCodeAt(index);
			var second;
			if (
				first >= 0xD800 && first <= 0xDBFF &&
				size > index + 1
			) {
				second = string.charCodeAt(index + 1);
				if (second >= 0xDC00 && second <= 0xDFFF) {
					return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
				}
			}
			return first;
		};
		if (defineProperty) {
			defineProperty(String.prototype, 'codePointAt', {
				'value': codePointAt,
				'configurable': true,
				'writable': true
			});
		} else {
			String.prototype.codePointAt = codePointAt;
		}
	}());
}
var TINF_OK = 0;
var TINF_DATA_ERROR = -3;
function Tree() {
  this.table = new Uint16Array(16);
  this.trans = new Uint16Array(288);
}
function Data(source, dest) {
  this.source = source;
  this.sourceIndex = 0;
  this.tag = 0;
  this.bitcount = 0;
  this.dest = dest;
  this.destLen = 0;
  this.ltree = new Tree();
  this.dtree = new Tree();
}
var sltree = new Tree();
var sdtree = new Tree();
var length_bits = new Uint8Array(30);
var length_base = new Uint16Array(30);
var dist_bits = new Uint8Array(30);
var dist_base = new Uint16Array(30);
var clcidx = new Uint8Array([
  16, 17, 18, 0, 8, 7, 9, 6,
  10, 5, 11, 4, 12, 3, 13, 2,
  14, 1, 15
]);
var code_tree = new Tree();
var lengths = new Uint8Array(288 + 32);
function tinf_build_bits_base(bits, base, delta, first) {
  var i, sum;
  for (i = 0; i < delta; ++i) { bits[i] = 0; }
  for (i = 0; i < 30 - delta; ++i) { bits[i + delta] = i / delta | 0; }
  for (sum = first, i = 0; i < 30; ++i) {
    base[i] = sum;
    sum += 1 << bits[i];
  }
}
function tinf_build_fixed_trees(lt, dt) {
  var i;
  for (i = 0; i < 7; ++i) { lt.table[i] = 0; }
  lt.table[7] = 24;
  lt.table[8] = 152;
  lt.table[9] = 112;
  for (i = 0; i < 24; ++i) { lt.trans[i] = 256 + i; }
  for (i = 0; i < 144; ++i) { lt.trans[24 + i] = i; }
  for (i = 0; i < 8; ++i) { lt.trans[24 + 144 + i] = 280 + i; }
  for (i = 0; i < 112; ++i) { lt.trans[24 + 144 + 8 + i] = 144 + i; }
  for (i = 0; i < 5; ++i) { dt.table[i] = 0; }
  dt.table[5] = 32;
  for (i = 0; i < 32; ++i) { dt.trans[i] = i; }
}
var offs = new Uint16Array(16);
function tinf_build_tree(t, lengths, off, num) {
  var i, sum;
  for (i = 0; i < 16; ++i) { t.table[i] = 0; }
  for (i = 0; i < num; ++i) { t.table[lengths[off + i]]++; }
  t.table[0] = 0;
  for (sum = 0, i = 0; i < 16; ++i) {
    offs[i] = sum;
    sum += t.table[i];
  }
  for (i = 0; i < num; ++i) {
    if (lengths[off + i]) { t.trans[offs[lengths[off + i]]++] = i; }
  }
}
function tinf_getbit(d) {
  if (!d.bitcount--) {
    d.tag = d.source[d.sourceIndex++];
    d.bitcount = 7;
  }
  var bit = d.tag & 1;
  d.tag >>>= 1;
  return bit;
}
function tinf_read_bits(d, num, base) {
  if (!num)
    { return base; }
  while (d.bitcount < 24) {
    d.tag |= d.source[d.sourceIndex++] << d.bitcount;
    d.bitcount += 8;
  }
  var val = d.tag & (0xffff >>> (16 - num));
  d.tag >>>= num;
  d.bitcount -= num;
  return val + base;
}
function tinf_decode_symbol(d, t) {
  while (d.bitcount < 24) {
    d.tag |= d.source[d.sourceIndex++] << d.bitcount;
    d.bitcount += 8;
  }
  var sum = 0, cur = 0, len = 0;
  var tag = d.tag;
  do {
    cur = 2 * cur + (tag & 1);
    tag >>>= 1;
    ++len;
    sum += t.table[len];
    cur -= t.table[len];
  } while (cur >= 0);
  d.tag = tag;
  d.bitcount -= len;
  return t.trans[sum + cur];
}
function tinf_decode_trees(d, lt, dt) {
  var hlit, hdist, hclen;
  var i, num, length;
  hlit = tinf_read_bits(d, 5, 257);
  hdist = tinf_read_bits(d, 5, 1);
  hclen = tinf_read_bits(d, 4, 4);
  for (i = 0; i < 19; ++i) { lengths[i] = 0; }
  for (i = 0; i < hclen; ++i) {
    var clen = tinf_read_bits(d, 3, 0);
    lengths[clcidx[i]] = clen;
  }
  tinf_build_tree(code_tree, lengths, 0, 19);
  for (num = 0; num < hlit + hdist;) {
    var sym = tinf_decode_symbol(d, code_tree);
    switch (sym) {
      case 16:
        var prev = lengths[num - 1];
        for (length = tinf_read_bits(d, 2, 3); length; --length) {
          lengths[num++] = prev;
        }
        break;
      case 17:
        for (length = tinf_read_bits(d, 3, 3); length; --length) {
          lengths[num++] = 0;
        }
        break;
      case 18:
        for (length = tinf_read_bits(d, 7, 11); length; --length) {
          lengths[num++] = 0;
        }
        break;
      default:
        lengths[num++] = sym;
        break;
    }
  }
  tinf_build_tree(lt, lengths, 0, hlit);
  tinf_build_tree(dt, lengths, hlit, hdist);
}
function tinf_inflate_block_data(d, lt, dt) {
  while (1) {
    var sym = tinf_decode_symbol(d, lt);
    if (sym === 256) {
      return TINF_OK;
    }
    if (sym < 256) {
      d.dest[d.destLen++] = sym;
    } else {
      var length, dist, offs;
      var i;
      sym -= 257;
      length = tinf_read_bits(d, length_bits[sym], length_base[sym]);
      dist = tinf_decode_symbol(d, dt);
      offs = d.destLen - tinf_read_bits(d, dist_bits[dist], dist_base[dist]);
      for (i = offs; i < offs + length; ++i) {
        d.dest[d.destLen++] = d.dest[i];
      }
    }
  }
}
function tinf_inflate_uncompressed_block(d) {
  var length, invlength;
  var i;
  while (d.bitcount > 8) {
    d.sourceIndex--;
    d.bitcount -= 8;
  }
  length = d.source[d.sourceIndex + 1];
  length = 256 * length + d.source[d.sourceIndex];
  invlength = d.source[d.sourceIndex + 3];
  invlength = 256 * invlength + d.source[d.sourceIndex + 2];
  if (length !== (~invlength & 0x0000ffff))
    { return TINF_DATA_ERROR; }
  d.sourceIndex += 4;
  for (i = length; i; --i)
    { d.dest[d.destLen++] = d.source[d.sourceIndex++]; }
  d.bitcount = 0;
  return TINF_OK;
}
function tinf_uncompress(source, dest) {
  var d = new Data(source, dest);
  var bfinal, btype, res;
  do {
    bfinal = tinf_getbit(d);
    btype = tinf_read_bits(d, 2, 0);
    switch (btype) {
      case 0:
        res = tinf_inflate_uncompressed_block(d);
        break;
      case 1:
        res = tinf_inflate_block_data(d, sltree, sdtree);
        break;
      case 2:
        tinf_decode_trees(d, d.ltree, d.dtree);
        res = tinf_inflate_block_data(d, d.ltree, d.dtree);
        break;
      default:
        res = TINF_DATA_ERROR;
    }
    if (res !== TINF_OK)
      { throw new Error('Data error'); }
  } while (!bfinal);
  if (d.destLen < d.dest.length) {
    if (typeof d.dest.slice === 'function')
      { return d.dest.slice(0, d.destLen); }
    else
      { return d.dest.subarray(0, d.destLen); }
  }
  return d.dest;
}
tinf_build_fixed_trees(sltree, sdtree);
tinf_build_bits_base(length_bits, length_base, 4, 3);
tinf_build_bits_base(dist_bits, dist_base, 2, 1);
length_bits[28] = 0;
length_base[28] = 258;
var tinyInflate = tinf_uncompress;
function derive(v0, v1, v2, v3, t) {
    return Math.pow(1 - t, 3) * v0 +
        3 * Math.pow(1 - t, 2) * t * v1 +
        3 * (1 - t) * Math.pow(t, 2) * v2 +
        Math.pow(t, 3) * v3;
}
function BoundingBox() {
    this.x1 = Number.NaN;
    this.y1 = Number.NaN;
    this.x2 = Number.NaN;
    this.y2 = Number.NaN;
}
BoundingBox.prototype.isEmpty = function() {
    return isNaN(this.x1) || isNaN(this.y1) || isNaN(this.x2) || isNaN(this.y2);
};
BoundingBox.prototype.addPoint = function(x, y) {
    if (typeof x === 'number') {
        if (isNaN(this.x1) || isNaN(this.x2)) {
            this.x1 = x;
            this.x2 = x;
        }
        if (x < this.x1) {
            this.x1 = x;
        }
        if (x > this.x2) {
            this.x2 = x;
        }
    }
    if (typeof y === 'number') {
        if (isNaN(this.y1) || isNaN(this.y2)) {
            this.y1 = y;
            this.y2 = y;
        }
        if (y < this.y1) {
            this.y1 = y;
        }
        if (y > this.y2) {
            this.y2 = y;
        }
    }
};
BoundingBox.prototype.addX = function(x) {
    this.addPoint(x, null);
};
BoundingBox.prototype.addY = function(y) {
    this.addPoint(null, y);
};
BoundingBox.prototype.addBezier = function(x0, y0, x1, y1, x2, y2, x, y) {
    var p0 = [x0, y0];
    var p1 = [x1, y1];
    var p2 = [x2, y2];
    var p3 = [x, y];
    this.addPoint(x0, y0);
    this.addPoint(x, y);
    for (var i = 0; i <= 1; i++) {
        var b = 6 * p0[i] - 12 * p1[i] + 6 * p2[i];
        var a = -3 * p0[i] + 9 * p1[i] - 9 * p2[i] + 3 * p3[i];
        var c = 3 * p1[i] - 3 * p0[i];
        if (a === 0) {
            if (b === 0) { continue; }
            var t = -c / b;
            if (0 < t && t < 1) {
                if (i === 0) { this.addX(derive(p0[i], p1[i], p2[i], p3[i], t)); }
                if (i === 1) { this.addY(derive(p0[i], p1[i], p2[i], p3[i], t)); }
            }
            continue;
        }
        var b2ac = Math.pow(b, 2) - 4 * c * a;
        if (b2ac < 0) { continue; }
        var t1 = (-b + Math.sqrt(b2ac)) / (2 * a);
        if (0 < t1 && t1 < 1) {
            if (i === 0) { this.addX(derive(p0[i], p1[i], p2[i], p3[i], t1)); }
            if (i === 1) { this.addY(derive(p0[i], p1[i], p2[i], p3[i], t1)); }
        }
        var t2 = (-b - Math.sqrt(b2ac)) / (2 * a);
        if (0 < t2 && t2 < 1) {
            if (i === 0) { this.addX(derive(p0[i], p1[i], p2[i], p3[i], t2)); }
            if (i === 1) { this.addY(derive(p0[i], p1[i], p2[i], p3[i], t2)); }
        }
    }
};
BoundingBox.prototype.addQuad = function(x0, y0, x1, y1, x, y) {
    var cp1x = x0 + 2 / 3 * (x1 - x0);
    var cp1y = y0 + 2 / 3 * (y1 - y0);
    var cp2x = cp1x + 1 / 3 * (x - x0);
    var cp2y = cp1y + 1 / 3 * (y - y0);
    this.addBezier(x0, y0, cp1x, cp1y, cp2x, cp2y, x, y);
};
function Path() {
    this.commands = [];
    this.fill = 'black';
    this.stroke = null;
    this.strokeWidth = 1;
}
Path.prototype.moveTo = function(x, y) {
    this.commands.push({
        type: 'M',
        x: x,
        y: y
    });
};
Path.prototype.lineTo = function(x, y) {
    this.commands.push({
        type: 'L',
        x: x,
        y: y
    });
};
Path.prototype.curveTo = Path.prototype.bezierCurveTo = function(x1, y1, x2, y2, x, y) {
    this.commands.push({
        type: 'C',
        x1: x1,
        y1: y1,
        x2: x2,
        y2: y2,
        x: x,
        y: y
    });
};
Path.prototype.quadTo = Path.prototype.quadraticCurveTo = function(x1, y1, x, y) {
    this.commands.push({
        type: 'Q',
        x1: x1,
        y1: y1,
        x: x,
        y: y
    });
};
Path.prototype.close = Path.prototype.closePath = function() {
    this.commands.push({
        type: 'Z'
    });
};
Path.prototype.extend = function(pathOrCommands) {
    if (pathOrCommands.commands) {
        pathOrCommands = pathOrCommands.commands;
    } else if (pathOrCommands instanceof BoundingBox) {
        var box = pathOrCommands;
        this.moveTo(box.x1, box.y1);
        this.lineTo(box.x2, box.y1);
        this.lineTo(box.x2, box.y2);
        this.lineTo(box.x1, box.y2);
        this.close();
        return;
    }
    Array.prototype.push.apply(this.commands, pathOrCommands);
};
Path.prototype.getBoundingBox = function() {
    var box = new BoundingBox();
    var startX = 0;
    var startY = 0;
    var prevX = 0;
    var prevY = 0;
    for (var i = 0; i < this.commands.length; i++) {
        var cmd = this.commands[i];
        switch (cmd.type) {
            case 'M':
                box.addPoint(cmd.x, cmd.y);
                startX = prevX = cmd.x;
                startY = prevY = cmd.y;
                break;
            case 'L':
                box.addPoint(cmd.x, cmd.y);
                prevX = cmd.x;
                prevY = cmd.y;
                break;
            case 'Q':
                box.addQuad(prevX, prevY, cmd.x1, cmd.y1, cmd.x, cmd.y);
                prevX = cmd.x;
                prevY = cmd.y;
                break;
            case 'C':
                box.addBezier(prevX, prevY, cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
                prevX = cmd.x;
                prevY = cmd.y;
                break;
            case 'Z':
                prevX = startX;
                prevY = startY;
                break;
            default:
                throw new Error('Unexpected path command ' + cmd.type);
        }
    }
    if (box.isEmpty()) {
        box.addPoint(0, 0);
    }
    return box;
};
Path.prototype.draw = function(ctx) {
    ctx.beginPath();
    for (var i = 0; i < this.commands.length; i += 1) {
        var cmd = this.commands[i];
        if (cmd.type === 'M') {
            ctx.moveTo(cmd.x, cmd.y);
        } else if (cmd.type === 'L') {
            ctx.lineTo(cmd.x, cmd.y);
        } else if (cmd.type === 'C') {
            ctx.bezierCurveTo(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
        } else if (cmd.type === 'Q') {
            ctx.quadraticCurveTo(cmd.x1, cmd.y1, cmd.x, cmd.y);
        } else if (cmd.type === 'Z') {
            ctx.closePath();
        }
    }
    if (this.fill) {
        ctx.fillStyle = this.fill;
        ctx.fill();
    }
    if (this.stroke) {
        ctx.strokeStyle = this.stroke;
        ctx.lineWidth = this.strokeWidth;
        ctx.stroke();
    }
};
Path.prototype.toPathData = function(decimalPlaces) {
    decimalPlaces = decimalPlaces !== undefined ? decimalPlaces : 2;
    function floatToString(v) {
        if (Math.round(v) === v) {
            return '' + Math.round(v);
        } else {
            return v.toFixed(decimalPlaces);
        }
    }
    function packValues() {
        var arguments$1 = arguments;
        var s = '';
        for (var i = 0; i < arguments.length; i += 1) {
            var v = arguments$1[i];
            if (v >= 0 && i > 0) {
                s += ' ';
            }
            s += floatToString(v);
        }
        return s;
    }
    var d = '';
    for (var i = 0; i < this.commands.length; i += 1) {
        var cmd = this.commands[i];
        if (cmd.type === 'M') {
            d += 'M' + packValues(cmd.x, cmd.y);
        } else if (cmd.type === 'L') {
            d += 'L' + packValues(cmd.x, cmd.y);
        } else if (cmd.type === 'C') {
            d += 'C' + packValues(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
        } else if (cmd.type === 'Q') {
            d += 'Q' + packValues(cmd.x1, cmd.y1, cmd.x, cmd.y);
        } else if (cmd.type === 'Z') {
            d += 'Z';
        }
    }
    return d;
};
Path.prototype.toSVG = function(decimalPlaces) {
    var svg = '<path d="';
    svg += this.toPathData(decimalPlaces);
    svg += '"';
    if (this.fill && this.fill !== 'black') {
        if (this.fill === null) {
            svg += ' fill="none"';
        } else {
            svg += ' fill="' + this.fill + '"';
        }
    }
    if (this.stroke) {
        svg += ' stroke="' + this.stroke + '" stroke-width="' + this.strokeWidth + '"';
    }
    svg += '/>';
    return svg;
};
Path.prototype.toDOMElement = function(decimalPlaces) {
    var temporaryPath = this.toPathData(decimalPlaces);
    var newPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    newPath.setAttribute('d', temporaryPath);
    return newPath;
};
function fail(message) {
    throw new Error(message);
}
function argument(predicate, message) {
    if (!predicate) {
        fail(message);
    }
}
var check = { fail: fail, argument: argument, assert: argument };
var LIMIT16 = 32768;
var LIMIT32 = 2147483648;
var decode$1 = {};
var encode$1 = {};
var sizeOf = {};
function constant(v) {
    return function() {
        return v;
    };
}
encode$1.BYTE = function(v) {
    check.argument(v >= 0 && v <= 255, 'Byte value should be between 0 and 255.');
    return [v];
};
sizeOf.BYTE = constant(1);
encode$1.CHAR = function(v) {
    return [v.charCodeAt(0)];
};
sizeOf.CHAR = constant(1);
encode$1.CHARARRAY = function(v) {
    if (typeof v === 'undefined') {
        v = '';
        console.warn('Undefined CHARARRAY encountered and treated as an empty string. This is probably caused by a missing glyph name.');
    }
    var b = [];
    for (var i = 0; i < v.length; i += 1) {
        b[i] = v.charCodeAt(i);
    }
    return b;
};
sizeOf.CHARARRAY = function(v) {
    if (typeof v === 'undefined') {
        return 0;
    }
    return v.length;
};
encode$1.USHORT = function(v) {
    return [(v >> 8) & 0xFF, v & 0xFF];
};
sizeOf.USHORT = constant(2);
encode$1.SHORT = function(v) {
    if (v >= LIMIT16) {
        v = -(2 * LIMIT16 - v);
    }
    return [(v >> 8) & 0xFF, v & 0xFF];
};
sizeOf.SHORT = constant(2);
encode$1.UINT24 = function(v) {
    return [(v >> 16) & 0xFF, (v >> 8) & 0xFF, v & 0xFF];
};
sizeOf.UINT24 = constant(3);
encode$1.ULONG = function(v) {
    return [(v >> 24) & 0xFF, (v >> 16) & 0xFF, (v >> 8) & 0xFF, v & 0xFF];
};
sizeOf.ULONG = constant(4);
encode$1.LONG = function(v) {
    if (v >= LIMIT32) {
        v = -(2 * LIMIT32 - v);
    }
    return [(v >> 24) & 0xFF, (v >> 16) & 0xFF, (v >> 8) & 0xFF, v & 0xFF];
};
sizeOf.LONG = constant(4);
encode$1.FIXED = encode$1.ULONG;
sizeOf.FIXED = sizeOf.ULONG;
encode$1.FWORD = encode$1.SHORT;
sizeOf.FWORD = sizeOf.SHORT;
encode$1.UFWORD = encode$1.USHORT;
sizeOf.UFWORD = sizeOf.USHORT;
encode$1.LONGDATETIME = function(v) {
    return [0, 0, 0, 0, (v >> 24) & 0xFF, (v >> 16) & 0xFF, (v >> 8) & 0xFF, v & 0xFF];
};
sizeOf.LONGDATETIME = constant(8);
encode$1.TAG = function(v) {
    check.argument(v.length === 4, 'Tag should be exactly 4 ASCII characters.');
    return [v.charCodeAt(0),
            v.charCodeAt(1),
            v.charCodeAt(2),
            v.charCodeAt(3)];
};
sizeOf.TAG = constant(4);
encode$1.Card8 = encode$1.BYTE;
sizeOf.Card8 = sizeOf.BYTE;
encode$1.Card16 = encode$1.USHORT;
sizeOf.Card16 = sizeOf.USHORT;
encode$1.OffSize = encode$1.BYTE;
sizeOf.OffSize = sizeOf.BYTE;
encode$1.SID = encode$1.USHORT;
sizeOf.SID = sizeOf.USHORT;
encode$1.NUMBER = function(v) {
    if (v >= -107 && v <= 107) {
        return [v + 139];
    } else if (v >= 108 && v <= 1131) {
        v = v - 108;
        return [(v >> 8) + 247, v & 0xFF];
    } else if (v >= -1131 && v <= -108) {
        v = -v - 108;
        return [(v >> 8) + 251, v & 0xFF];
    } else if (v >= -32768 && v <= 32767) {
        return encode$1.NUMBER16(v);
    } else {
        return encode$1.NUMBER32(v);
    }
};
sizeOf.NUMBER = function(v) {
    return encode$1.NUMBER(v).length;
};
encode$1.NUMBER16 = function(v) {
    return [28, (v >> 8) & 0xFF, v & 0xFF];
};
sizeOf.NUMBER16 = constant(3);
encode$1.NUMBER32 = function(v) {
    return [29, (v >> 24) & 0xFF, (v >> 16) & 0xFF, (v >> 8) & 0xFF, v & 0xFF];
};
sizeOf.NUMBER32 = constant(5);
encode$1.REAL = function(v) {
    var value = v.toString();
    var m = /\.(\d*?)(?:9{5,20}|0{5,20})\d{0,2}(?:e(.+)|$)/.exec(value);
    if (m) {
        var epsilon = parseFloat('1e' + ((m[2] ? +m[2] : 0) + m[1].length));
        value = (Math.round(v * epsilon) / epsilon).toString();
    }
    var nibbles = '';
    for (var i = 0, ii = value.length; i < ii; i += 1) {
        var c = value[i];
        if (c === 'e') {
            nibbles += value[++i] === '-' ? 'c' : 'b';
        } else if (c === '.') {
            nibbles += 'a';
        } else if (c === '-') {
            nibbles += 'e';
        } else {
            nibbles += c;
        }
    }
    nibbles += (nibbles.length & 1) ? 'f' : 'ff';
    var out = [30];
    for (var i$1 = 0, ii$1 = nibbles.length; i$1 < ii$1; i$1 += 2) {
        out.push(parseInt(nibbles.substr(i$1, 2), 16));
    }
    return out;
};
sizeOf.REAL = function(v) {
    return encode$1.REAL(v).length;
};
encode$1.NAME = encode$1.CHARARRAY;
sizeOf.NAME = sizeOf.CHARARRAY;
encode$1.STRING = encode$1.CHARARRAY;
sizeOf.STRING = sizeOf.CHARARRAY;
decode$1.UTF8 = function(data, offset, numBytes) {
    var codePoints = [];
    var numChars = numBytes;
    for (var j = 0; j < numChars; j++, offset += 1) {
        codePoints[j] = data.getUint8(offset);
    }
    return String.fromCharCode.apply(null, codePoints);
};
decode$1.UTF16 = function(data, offset, numBytes) {
    var codePoints = [];
    var numChars = numBytes / 2;
    for (var j = 0; j < numChars; j++, offset += 2) {
        codePoints[j] = data.getUint16(offset);
    }
    return String.fromCharCode.apply(null, codePoints);
};
encode$1.UTF16 = function(v) {
    var b = [];
    for (var i = 0; i < v.length; i += 1) {
        var codepoint = v.charCodeAt(i);
        b[b.length] = (codepoint >> 8) & 0xFF;
        b[b.length] = codepoint & 0xFF;
    }
    return b;
};
sizeOf.UTF16 = function(v) {
    return v.length * 2;
};
var eightBitMacEncodings = {
    'x-mac-croatian':
    'ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®Š™´¨≠ŽØ∞±≤≥∆µ∂∑∏š∫ªºΩžø' +
    '¿¡¬√ƒ≈Ć«Č… ÀÃÕŒœĐ—“”‘’÷◊©⁄€‹›Æ»–·‚„‰ÂćÁčÈÍÎÏÌÓÔđÒÚÛÙıˆ˜¯πË˚¸Êæˇ',
    'x-mac-cyrillic':
    'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ†°Ґ£§•¶І®©™Ђђ≠Ѓѓ∞±≤≥іµґЈЄєЇїЉљЊњ' +
    'јЅ¬√ƒ≈∆«»… ЋћЌќѕ–—“”‘’÷„ЎўЏџ№Ёёяабвгдежзийклмнопрстуфхцчшщъыьэю',
    'x-mac-gaelic':
    'ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®©™´¨≠ÆØḂ±≤≥ḃĊċḊḋḞḟĠġṀæø' +
    'ṁṖṗɼƒſṠ«»… ÀÃÕŒœ–—“”‘’ṡẛÿŸṪ€‹›Ŷŷṫ·Ỳỳ⁊ÂÊÁËÈÍÎÏÌÓÔ♣ÒÚÛÙıÝýŴŵẄẅẀẁẂẃ',
    'x-mac-greek':
    'Ä¹²É³ÖÜ΅àâä΄¨çéèêë£™îï•½‰ôö¦€ùûü†ΓΔΘΛΞΠß®©ΣΪ§≠°·Α±≤≥¥ΒΕΖΗΙΚΜΦΫΨΩ' +
    'άΝ¬ΟΡ≈Τ«»… ΥΧΆΈœ–―“”‘’÷ΉΊΌΎέήίόΏύαβψδεφγηιξκλμνοπώρστθωςχυζϊϋΐΰ\u00AD',
    'x-mac-icelandic':
    'ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûüÝ°¢£§•¶ß®©™´¨≠ÆØ∞±≤≥¥µ∂∑∏π∫ªºΩæø' +
    '¿¡¬√ƒ≈∆«»… ÀÃÕŒœ–—“”‘’÷◊ÿŸ⁄€ÐðÞþý·‚„‰ÂÊÁËÈÍÎÏÌÓÔÒÚÛÙıˆ˜¯˘˙˚¸˝˛ˇ',
    'x-mac-inuit':
    'ᐃᐄᐅᐆᐊᐋᐱᐲᐳᐴᐸᐹᑉᑎᑏᑐᑑᑕᑖᑦᑭᑮᑯᑰᑲᑳᒃᒋᒌᒍᒎᒐᒑ°ᒡᒥᒦ•¶ᒧ®©™ᒨᒪᒫᒻᓂᓃᓄᓅᓇᓈᓐᓯᓰᓱᓲᓴᓵᔅᓕᓖᓗ' +
    'ᓘᓚᓛᓪᔨᔩᔪᔫᔭ… ᔮᔾᕕᕖᕗ–—“”‘’ᕘᕙᕚᕝᕆᕇᕈᕉᕋᕌᕐᕿᖀᖁᖂᖃᖄᖅᖏᖐᖑᖒᖓᖔᖕᙱᙲᙳᙴᙵᙶᖖᖠᖡᖢᖣᖤᖥᖦᕼŁł',
    'x-mac-ce':
    'ÄĀāÉĄÖÜáąČäčĆćéŹźĎíďĒēĖóėôöõúĚěü†°Ę£§•¶ß®©™ę¨≠ģĮįĪ≤≥īĶ∂∑łĻļĽľĹĺŅ' +
    'ņŃ¬√ńŇ∆«»… ňŐÕőŌ–—“”‘’÷◊ōŔŕŘ‹›řŖŗŠ‚„šŚśÁŤťÍŽžŪÓÔūŮÚůŰűŲųÝýķŻŁżĢˇ',
    macintosh:
    'ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®©™´¨≠ÆØ∞±≤≥¥µ∂∑∏π∫ªºΩæø' +
    '¿¡¬√ƒ≈∆«»… ÀÃÕŒœ–—“”‘’÷◊ÿŸ⁄€‹›ﬁﬂ‡·‚„‰ÂÊÁËÈÍÎÏÌÓÔÒÚÛÙıˆ˜¯˘˙˚¸˝˛ˇ',
    'x-mac-romanian':
    'ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®©™´¨≠ĂȘ∞±≤≥¥µ∂∑∏π∫ªºΩăș' +
    '¿¡¬√ƒ≈∆«»… ÀÃÕŒœ–—“”‘’÷◊ÿŸ⁄€‹›Țț‡·‚„‰ÂÊÁËÈÍÎÏÌÓÔÒÚÛÙıˆ˜¯˘˙˚¸˝˛ˇ',
    'x-mac-turkish':
    'ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®©™´¨≠ÆØ∞±≤≥¥µ∂∑∏π∫ªºΩæø' +
    '¿¡¬√ƒ≈∆«»… ÀÃÕŒœ–—“”‘’÷◊ÿŸĞğİıŞş‡·‚„‰ÂÊÁËÈÍÎÏÌÓÔÒÚÛÙˆ˜¯˘˙˚¸˝˛ˇ'
};
decode$1.MACSTRING = function(dataView, offset, dataLength, encoding) {
    var table = eightBitMacEncodings[encoding];
    if (table === undefined) {
        return undefined;
    }
    var result = '';
    for (var i = 0; i < dataLength; i++) {
        var c = dataView.getUint8(offset + i);
        if (c <= 0x7F) {
            result += String.fromCharCode(c);
        } else {
            result += table[c & 0x7F];
        }
    }
    return result;
};
var macEncodingTableCache = typeof WeakMap === 'function' && new WeakMap();
var macEncodingCacheKeys;
var getMacEncodingTable = function (encoding) {
    if (!macEncodingCacheKeys) {
        macEncodingCacheKeys = {};
        for (var e in eightBitMacEncodings) {
            macEncodingCacheKeys[e] = new String(e);
        }
    }
    var cacheKey = macEncodingCacheKeys[encoding];
    if (cacheKey === undefined) {
        return undefined;
    }
    if (macEncodingTableCache) {
        var cachedTable = macEncodingTableCache.get(cacheKey);
        if (cachedTable !== undefined) {
            return cachedTable;
        }
    }
    var decodingTable = eightBitMacEncodings[encoding];
    if (decodingTable === undefined) {
        return undefined;
    }
    var encodingTable = {};
    for (var i = 0; i < decodingTable.length; i++) {
        encodingTable[decodingTable.charCodeAt(i)] = i + 0x80;
    }
    if (macEncodingTableCache) {
        macEncodingTableCache.set(cacheKey, encodingTable);
    }
    return encodingTable;
};
encode$1.MACSTRING = function(str, encoding) {
    var table = getMacEncodingTable(encoding);
    if (table === undefined) {
        return undefined;
    }
    var result = [];
    for (var i = 0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        if (c >= 0x80) {
            c = table[c];
            if (c === undefined) {
                return undefined;
            }
        }
        result[i] = c;
    }
    return result;
};
sizeOf.MACSTRING = function(str, encoding) {
    var b = encode$1.MACSTRING(str, encoding);
    if (b !== undefined) {
        return b.length;
    } else {
        return 0;
    }
};
function isByteEncodable(value) {
    return value >= -128 && value <= 127;
}
function encodeVarDeltaRunAsZeroes(deltas, pos, result) {
    var runLength = 0;
    var numDeltas = deltas.length;
    while (pos < numDeltas && runLength < 64 && deltas[pos] === 0) {
        ++pos;
        ++runLength;
    }
    result.push(0x80 | (runLength - 1));
    return pos;
}
function encodeVarDeltaRunAsBytes(deltas, offset, result) {
    var runLength = 0;
    var numDeltas = deltas.length;
    var pos = offset;
    while (pos < numDeltas && runLength < 64) {
        var value = deltas[pos];
        if (!isByteEncodable(value)) {
            break;
        }
        if (value === 0 && pos + 1 < numDeltas && deltas[pos + 1] === 0) {
            break;
        }
        ++pos;
        ++runLength;
    }
    result.push(runLength - 1);
    for (var i = offset; i < pos; ++i) {
        result.push((deltas[i] + 256) & 0xff);
    }
    return pos;
}
function encodeVarDeltaRunAsWords(deltas, offset, result) {
    var runLength = 0;
    var numDeltas = deltas.length;
    var pos = offset;
    while (pos < numDeltas && runLength < 64) {
        var value = deltas[pos];
        if (value === 0) {
            break;
        }
        if (isByteEncodable(value) && pos + 1 < numDeltas && isByteEncodable(deltas[pos + 1])) {
            break;
        }
        ++pos;
        ++runLength;
    }
    result.push(0x40 | (runLength - 1));
    for (var i = offset; i < pos; ++i) {
        var val = deltas[i];
        result.push(((val + 0x10000) >> 8) & 0xff, (val + 0x100) & 0xff);
    }
    return pos;
}
encode$1.VARDELTAS = function(deltas) {
    var pos = 0;
    var result = [];
    while (pos < deltas.length) {
        var value = deltas[pos];
        if (value === 0) {
            pos = encodeVarDeltaRunAsZeroes(deltas, pos, result);
        } else if (value >= -128 && value <= 127) {
            pos = encodeVarDeltaRunAsBytes(deltas, pos, result);
        } else {
            pos = encodeVarDeltaRunAsWords(deltas, pos, result);
        }
    }
    return result;
};
encode$1.INDEX = function(l) {
    var offset = 1;
    var offsets = [offset];
    var data = [];
    for (var i = 0; i < l.length; i += 1) {
        var v = encode$1.OBJECT(l[i]);
        Array.prototype.push.apply(data, v);
        offset += v.length;
        offsets.push(offset);
    }
    if (data.length === 0) {
        return [0, 0];
    }
    var encodedOffsets = [];
    var offSize = (1 + Math.floor(Math.log(offset) / Math.log(2)) / 8) | 0;
    var offsetEncoder = [undefined, encode$1.BYTE, encode$1.USHORT, encode$1.UINT24, encode$1.ULONG][offSize];
    for (var i$1 = 0; i$1 < offsets.length; i$1 += 1) {
        var encodedOffset = offsetEncoder(offsets[i$1]);
        Array.prototype.push.apply(encodedOffsets, encodedOffset);
    }
    return Array.prototype.concat(encode$1.Card16(l.length),
                           encode$1.OffSize(offSize),
                           encodedOffsets,
                           data);
};
sizeOf.INDEX = function(v) {
    return encode$1.INDEX(v).length;
};
encode$1.DICT = function(m) {
    var d = [];
    var keys = Object.keys(m);
    var length = keys.length;
    for (var i = 0; i < length; i += 1) {
        var k = parseInt(keys[i], 0);
        var v = m[k];
        d = d.concat(encode$1.OPERAND(v.value, v.type));
        d = d.concat(encode$1.OPERATOR(k));
    }
    return d;
};
sizeOf.DICT = function(m) {
    return encode$1.DICT(m).length;
};
encode$1.OPERATOR = function(v) {
    if (v < 1200) {
        return [v];
    } else {
        return [12, v - 1200];
    }
};
encode$1.OPERAND = function(v, type) {
    var d = [];
    if (Array.isArray(type)) {
        for (var i = 0; i < type.length; i += 1) {
            check.argument(v.length === type.length, 'Not enough arguments given for type' + type);
            d = d.concat(encode$1.OPERAND(v[i], type[i]));
        }
    } else {
        if (type === 'SID') {
            d = d.concat(encode$1.NUMBER(v));
        } else if (type === 'offset') {
            d = d.concat(encode$1.NUMBER32(v));
        } else if (type === 'number') {
            d = d.concat(encode$1.NUMBER(v));
        } else if (type === 'real') {
            d = d.concat(encode$1.REAL(v));
        } else {
            throw new Error('Unknown operand type ' + type);
        }
    }
    return d;
};
encode$1.OP = encode$1.BYTE;
sizeOf.OP = sizeOf.BYTE;
var wmm = typeof WeakMap === 'function' && new WeakMap();
encode$1.CHARSTRING = function(ops) {
    if (wmm) {
        var cachedValue = wmm.get(ops);
        if (cachedValue !== undefined) {
            return cachedValue;
        }
    }
    var d = [];
    var length = ops.length;
    for (var i = 0; i < length; i += 1) {
        var op = ops[i];
        d = d.concat(encode$1[op.type](op.value));
    }
    if (wmm) {
        wmm.set(ops, d);
    }
    return d;
};
sizeOf.CHARSTRING = function(ops) {
    return encode$1.CHARSTRING(ops).length;
};
encode$1.OBJECT = function(v) {
    var encodingFunction = encode$1[v.type];
    check.argument(encodingFunction !== undefined, 'No encoding function for type ' + v.type);
    return encodingFunction(v.value);
};
sizeOf.OBJECT = function(v) {
    var sizeOfFunction = sizeOf[v.type];
    check.argument(sizeOfFunction !== undefined, 'No sizeOf function for type ' + v.type);
    return sizeOfFunction(v.value);
};
encode$1.TABLE = function(table) {
    var d = [];
    var length = table.fields.length;
    var subtables = [];
    var subtableOffsets = [];
    for (var i = 0; i < length; i += 1) {
        var field = table.fields[i];
        var encodingFunction = encode$1[field.type];
        check.argument(encodingFunction !== undefined, 'No encoding function for field type ' + field.type + ' (' + field.name + ')');
        var value = table[field.name];
        if (value === undefined) {
            value = field.value;
        }
        var bytes = encodingFunction(value);
        if (field.type === 'TABLE') {
            subtableOffsets.push(d.length);
            d = d.concat([0, 0]);
            subtables.push(bytes);
        } else {
            d = d.concat(bytes);
        }
    }
    for (var i$1 = 0; i$1 < subtables.length; i$1 += 1) {
        var o = subtableOffsets[i$1];
        var offset = d.length;
        check.argument(offset < 65536, 'Table ' + table.tableName + ' too big.');
        d[o] = offset >> 8;
        d[o + 1] = offset & 0xff;
        d = d.concat(subtables[i$1]);
    }
    return d;
};
sizeOf.TABLE = function(table) {
    var numBytes = 0;
    var length = table.fields.length;
    for (var i = 0; i < length; i += 1) {
        var field = table.fields[i];
        var sizeOfFunction = sizeOf[field.type];
        check.argument(sizeOfFunction !== undefined, 'No sizeOf function for field type ' + field.type + ' (' + field.name + ')');
        var value = table[field.name];
        if (value === undefined) {
            value = field.value;
        }
        numBytes += sizeOfFunction(value);
        if (field.type === 'TABLE') {
            numBytes += 2;
        }
    }
    return numBytes;
};
encode$1.RECORD = encode$1.TABLE;
sizeOf.RECORD = sizeOf.TABLE;
encode$1.LITERAL = function(v) {
    return v;
};
sizeOf.LITERAL = function(v) {
    return v.length;
};
function Table(tableName, fields, options) {
    if (fields.length && (fields[0].name !== 'coverageFormat' || fields[0].value === 1)) {
        for (var i = 0; i < fields.length; i += 1) {
            var field = fields[i];
            this[field.name] = field.value;
        }
    }
    this.tableName = tableName;
    this.fields = fields;
    if (options) {
        var optionKeys = Object.keys(options);
        for (var i$1 = 0; i$1 < optionKeys.length; i$1 += 1) {
            var k = optionKeys[i$1];
            var v = options[k];
            if (this[k] !== undefined) {
                this[k] = v;
            }
        }
    }
}
Table.prototype.encode = function() {
    return encode$1.TABLE(this);
};
Table.prototype.sizeOf = function() {
    return sizeOf.TABLE(this);
};
function ushortList(itemName, list, count) {
    if (count === undefined) {
        count = list.length;
    }
    var fields = new Array(list.length + 1);
    fields[0] = {name: itemName + 'Count', type: 'USHORT', value: count};
    for (var i = 0; i < list.length; i++) {
        fields[i + 1] = {name: itemName + i, type: 'USHORT', value: list[i]};
    }
    return fields;
}
function tableList(itemName, records, itemCallback) {
    var count = records.length;
    var fields = new Array(count + 1);
    fields[0] = {name: itemName + 'Count', type: 'USHORT', value: count};
    for (var i = 0; i < count; i++) {
        fields[i + 1] = {name: itemName + i, type: 'TABLE', value: itemCallback(records[i], i)};
    }
    return fields;
}
function recordList(itemName, records, itemCallback) {
    var count = records.length;
    var fields = [];
    fields[0] = {name: itemName + 'Count', type: 'USHORT', value: count};
    for (var i = 0; i < count; i++) {
        fields = fields.concat(itemCallback(records[i], i));
    }
    return fields;
}
function Coverage(coverageTable) {
    if (coverageTable.format === 1) {
        Table.call(this, 'coverageTable',
            [{name: 'coverageFormat', type: 'USHORT', value: 1}]
            .concat(ushortList('glyph', coverageTable.glyphs))
        );
    } else if (coverageTable.format === 2) {
        Table.call(this, 'coverageTable',
            [{name: 'coverageFormat', type: 'USHORT', value: 2}]
            .concat(recordList('rangeRecord', coverageTable.ranges, function(RangeRecord) {
                return [
                    {name: 'startGlyphID', type: 'USHORT', value: RangeRecord.start},
                    {name: 'endGlyphID', type: 'USHORT', value: RangeRecord.end},
                    {name: 'startCoverageIndex', type: 'USHORT', value: RangeRecord.index} ];
            }))
        );
    } else {
        check.assert(false, 'Coverage format must be 1 or 2.');
    }
}
Coverage.prototype = Object.create(Table.prototype);
Coverage.prototype.constructor = Coverage;
function ScriptList(scriptListTable) {
    Table.call(this, 'scriptListTable',
        recordList('scriptRecord', scriptListTable, function(scriptRecord, i) {
            var script = scriptRecord.script;
            var defaultLangSys = script.defaultLangSys;
            check.assert(!!defaultLangSys, 'Unable to write GSUB: script ' + scriptRecord.tag + ' has no default language system.');
            return [
                {name: 'scriptTag' + i, type: 'TAG', value: scriptRecord.tag},
                {name: 'script' + i, type: 'TABLE', value: new Table('scriptTable', [
                    {name: 'defaultLangSys', type: 'TABLE', value: new Table('defaultLangSys', [
                        {name: 'lookupOrder', type: 'USHORT', value: 0},
                        {name: 'reqFeatureIndex', type: 'USHORT', value: defaultLangSys.reqFeatureIndex}]
                        .concat(ushortList('featureIndex', defaultLangSys.featureIndexes)))}
                    ].concat(recordList('langSys', script.langSysRecords, function(langSysRecord, i) {
                        var langSys = langSysRecord.langSys;
                        return [
                            {name: 'langSysTag' + i, type: 'TAG', value: langSysRecord.tag},
                            {name: 'langSys' + i, type: 'TABLE', value: new Table('langSys', [
                                {name: 'lookupOrder', type: 'USHORT', value: 0},
                                {name: 'reqFeatureIndex', type: 'USHORT', value: langSys.reqFeatureIndex}
                                ].concat(ushortList('featureIndex', langSys.featureIndexes)))}
                        ];
                    })))}
            ];
        })
    );
}
ScriptList.prototype = Object.create(Table.prototype);
ScriptList.prototype.constructor = ScriptList;
function FeatureList(featureListTable) {
    Table.call(this, 'featureListTable',
        recordList('featureRecord', featureListTable, function(featureRecord, i) {
            var feature = featureRecord.feature;
            return [
                {name: 'featureTag' + i, type: 'TAG', value: featureRecord.tag},
                {name: 'feature' + i, type: 'TABLE', value: new Table('featureTable', [
                    {name: 'featureParams', type: 'USHORT', value: feature.featureParams} ].concat(ushortList('lookupListIndex', feature.lookupListIndexes)))}
            ];
        })
    );
}
FeatureList.prototype = Object.create(Table.prototype);
FeatureList.prototype.constructor = FeatureList;
function LookupList(lookupListTable, subtableMakers) {
    Table.call(this, 'lookupListTable', tableList('lookup', lookupListTable, function(lookupTable) {
        var subtableCallback = subtableMakers[lookupTable.lookupType];
        check.assert(!!subtableCallback, 'Unable to write GSUB lookup type ' + lookupTable.lookupType + ' tables.');
        return new Table('lookupTable', [
            {name: 'lookupType', type: 'USHORT', value: lookupTable.lookupType},
            {name: 'lookupFlag', type: 'USHORT', value: lookupTable.lookupFlag}
        ].concat(tableList('subtable', lookupTable.subtables, subtableCallback)));
    }));
}
LookupList.prototype = Object.create(Table.prototype);
LookupList.prototype.constructor = LookupList;
var table = {
    Table: Table,
    Record: Table,
    Coverage: Coverage,
    ScriptList: ScriptList,
    FeatureList: FeatureList,
    LookupList: LookupList,
    ushortList: ushortList,
    tableList: tableList,
    recordList: recordList,
};
function getByte(dataView, offset) {
    return dataView.getUint8(offset);
}
function getUShort(dataView, offset) {
    return dataView.getUint16(offset, false);
}
function getShort(dataView, offset) {
    return dataView.getInt16(offset, false);
}
function getULong(dataView, offset) {
    return dataView.getUint32(offset, false);
}
function getFixed(dataView, offset) {
    var decimal = dataView.getInt16(offset, false);
    var fraction = dataView.getUint16(offset + 2, false);
    return decimal + fraction / 65535;
}
function getTag(dataView, offset) {
    var tag = '';
    for (var i = offset; i < offset + 4; i += 1) {
        tag += String.fromCharCode(dataView.getInt8(i));
    }
    return tag;
}
function getOffset(dataView, offset, offSize) {
    var v = 0;
    for (var i = 0; i < offSize; i += 1) {
        v <<= 8;
        v += dataView.getUint8(offset + i);
    }
    return v;
}
function getBytes(dataView, startOffset, endOffset) {
    var bytes = [];
    for (var i = startOffset; i < endOffset; i += 1) {
        bytes.push(dataView.getUint8(i));
    }
    return bytes;
}
function bytesToString(bytes) {
    var s = '';
    for (var i = 0; i < bytes.length; i += 1) {
        s += String.fromCharCode(bytes[i]);
    }
    return s;
}
var typeOffsets = {
    byte: 1,
    uShort: 2,
    short: 2,
    uLong: 4,
    fixed: 4,
    longDateTime: 8,
    tag: 4
};
function Parser(data, offset) {
    this.data = data;
    this.offset = offset;
    this.relativeOffset = 0;
}
Parser.prototype.parseByte = function() {
    var v = this.data.getUint8(this.offset + this.relativeOffset);
    this.relativeOffset += 1;
    return v;
};
Parser.prototype.parseChar = function() {
    var v = this.data.getInt8(this.offset + this.relativeOffset);
    this.relativeOffset += 1;
    return v;
};
Parser.prototype.parseCard8 = Parser.prototype.parseByte;
Parser.prototype.parseUShort = function() {
    var v = this.data.getUint16(this.offset + this.relativeOffset);
    this.relativeOffset += 2;
    return v;
};
Parser.prototype.parseCard16 = Parser.prototype.parseUShort;
Parser.prototype.parseSID = Parser.prototype.parseUShort;
Parser.prototype.parseOffset16 = Parser.prototype.parseUShort;
Parser.prototype.parseShort = function() {
    var v = this.data.getInt16(this.offset + this.relativeOffset);
    this.relativeOffset += 2;
    return v;
};
Parser.prototype.parseF2Dot14 = function() {
    var v = this.data.getInt16(this.offset + this.relativeOffset) / 16384;
    this.relativeOffset += 2;
    return v;
};
Parser.prototype.parseULong = function() {
    var v = getULong(this.data, this.offset + this.relativeOffset);
    this.relativeOffset += 4;
    return v;
};
Parser.prototype.parseOffset32 = Parser.prototype.parseULong;
Parser.prototype.parseFixed = function() {
    var v = getFixed(this.data, this.offset + this.relativeOffset);
    this.relativeOffset += 4;
    return v;
};
Parser.prototype.parseString = function(length) {
    var dataView = this.data;
    var offset = this.offset + this.relativeOffset;
    var string = '';
    this.relativeOffset += length;
    for (var i = 0; i < length; i++) {
        string += String.fromCharCode(dataView.getUint8(offset + i));
    }
    return string;
};
Parser.prototype.parseTag = function() {
    return this.parseString(4);
};
Parser.prototype.parseLongDateTime = function() {
    var v = getULong(this.data, this.offset + this.relativeOffset + 4);
    v -= 2082844800;
    this.relativeOffset += 8;
    return v;
};
Parser.prototype.parseVersion = function(minorBase) {
    var major = getUShort(this.data, this.offset + this.relativeOffset);
    var minor = getUShort(this.data, this.offset + this.relativeOffset + 2);
    this.relativeOffset += 4;
    if (minorBase === undefined) { minorBase = 0x1000; }
    return major + minor / minorBase / 10;
};
Parser.prototype.skip = function(type, amount) {
    if (amount === undefined) {
        amount = 1;
    }
    this.relativeOffset += typeOffsets[type] * amount;
};
Parser.prototype.parseULongList = function(count) {
    if (count === undefined) { count = this.parseULong(); }
    var offsets = new Array(count);
    var dataView = this.data;
    var offset = this.offset + this.relativeOffset;
    for (var i = 0; i < count; i++) {
        offsets[i] = dataView.getUint32(offset);
        offset += 4;
    }
    this.relativeOffset += count * 4;
    return offsets;
};
Parser.prototype.parseOffset16List =
Parser.prototype.parseUShortList = function(count) {
    if (count === undefined) { count = this.parseUShort(); }
    var offsets = new Array(count);
    var dataView = this.data;
    var offset = this.offset + this.relativeOffset;
    for (var i = 0; i < count; i++) {
        offsets[i] = dataView.getUint16(offset);
        offset += 2;
    }
    this.relativeOffset += count * 2;
    return offsets;
};
Parser.prototype.parseShortList = function(count) {
    var list = new Array(count);
    var dataView = this.data;
    var offset = this.offset + this.relativeOffset;
    for (var i = 0; i < count; i++) {
        list[i] = dataView.getInt16(offset);
        offset += 2;
    }
    this.relativeOffset += count * 2;
    return list;
};
Parser.prototype.parseByteList = function(count) {
    var list = new Array(count);
    var dataView = this.data;
    var offset = this.offset + this.relativeOffset;
    for (var i = 0; i < count; i++) {
        list[i] = dataView.getUint8(offset++);
    }
    this.relativeOffset += count;
    return list;
};
Parser.prototype.parseList = function(count, itemCallback) {
    if (!itemCallback) {
        itemCallback = count;
        count = this.parseUShort();
    }
    var list = new Array(count);
    for (var i = 0; i < count; i++) {
        list[i] = itemCallback.call(this);
    }
    return list;
};
Parser.prototype.parseList32 = function(count, itemCallback) {
    if (!itemCallback) {
        itemCallback = count;
        count = this.parseULong();
    }
    var list = new Array(count);
    for (var i = 0; i < count; i++) {
        list[i] = itemCallback.call(this);
    }
    return list;
};
Parser.prototype.parseRecordList = function(count, recordDescription) {
    if (!recordDescription) {
        recordDescription = count;
        count = this.parseUShort();
    }
    var records = new Array(count);
    var fields = Object.keys(recordDescription);
    for (var i = 0; i < count; i++) {
        var rec = {};
        for (var j = 0; j < fields.length; j++) {
            var fieldName = fields[j];
            var fieldType = recordDescription[fieldName];
            rec[fieldName] = fieldType.call(this);
        }
        records[i] = rec;
    }
    return records;
};
Parser.prototype.parseRecordList32 = function(count, recordDescription) {
    if (!recordDescription) {
        recordDescription = count;
        count = this.parseULong();
    }
    var records = new Array(count);
    var fields = Object.keys(recordDescription);
    for (var i = 0; i < count; i++) {
        var rec = {};
        for (var j = 0; j < fields.length; j++) {
            var fieldName = fields[j];
            var fieldType = recordDescription[fieldName];
            rec[fieldName] = fieldType.call(this);
        }
        records[i] = rec;
    }
    return records;
};
Parser.prototype.parseStruct = function(description) {
    if (typeof description === 'function') {
        return description.call(this);
    } else {
        var fields = Object.keys(description);
        var struct = {};
        for (var j = 0; j < fields.length; j++) {
            var fieldName = fields[j];
            var fieldType = description[fieldName];
            struct[fieldName] = fieldType.call(this);
        }
        return struct;
    }
};
Parser.prototype.parseValueRecord = function(valueFormat) {
    if (valueFormat === undefined) {
        valueFormat = this.parseUShort();
    }
    if (valueFormat === 0) {
        return;
    }
    var valueRecord = {};
    if (valueFormat & 0x0001) { valueRecord.xPlacement = this.parseShort(); }
    if (valueFormat & 0x0002) { valueRecord.yPlacement = this.parseShort(); }
    if (valueFormat & 0x0004) { valueRecord.xAdvance = this.parseShort(); }
    if (valueFormat & 0x0008) { valueRecord.yAdvance = this.parseShort(); }
    if (valueFormat & 0x0010) { valueRecord.xPlaDevice = undefined; this.parseShort(); }
    if (valueFormat & 0x0020) { valueRecord.yPlaDevice = undefined; this.parseShort(); }
    if (valueFormat & 0x0040) { valueRecord.xAdvDevice = undefined; this.parseShort(); }
    if (valueFormat & 0x0080) { valueRecord.yAdvDevice = undefined; this.parseShort(); }
    return valueRecord;
};
Parser.prototype.parseValueRecordList = function() {
    var valueFormat = this.parseUShort();
    var valueCount = this.parseUShort();
    var values = new Array(valueCount);
    for (var i = 0; i < valueCount; i++) {
        values[i] = this.parseValueRecord(valueFormat);
    }
    return values;
};
Parser.prototype.parsePointer = function(description) {
    var structOffset = this.parseOffset16();
    if (structOffset > 0) {
        return new Parser(this.data, this.offset + structOffset).parseStruct(description);
    }
    return undefined;
};
Parser.prototype.parsePointer32 = function(description) {
    var structOffset = this.parseOffset32();
    if (structOffset > 0) {
        return new Parser(this.data, this.offset + structOffset).parseStruct(description);
    }
    return undefined;
};
Parser.prototype.parseListOfLists = function(itemCallback) {
    var offsets = this.parseOffset16List();
    var count = offsets.length;
    var relativeOffset = this.relativeOffset;
    var list = new Array(count);
    for (var i = 0; i < count; i++) {
        var start = offsets[i];
        if (start === 0) {
            list[i] = undefined;
            continue;
        }
        this.relativeOffset = start;
        if (itemCallback) {
            var subOffsets = this.parseOffset16List();
            var subList = new Array(subOffsets.length);
            for (var j = 0; j < subOffsets.length; j++) {
                this.relativeOffset = start + subOffsets[j];
                subList[j] = itemCallback.call(this);
            }
            list[i] = subList;
        } else {
            list[i] = this.parseUShortList();
        }
    }
    this.relativeOffset = relativeOffset;
    return list;
};
Parser.prototype.parseCoverage = function() {
    var startOffset = this.offset + this.relativeOffset;
    var format = this.parseUShort();
    var count = this.parseUShort();
    if (format === 1) {
        return {
            format: 1,
            glyphs: this.parseUShortList(count)
        };
    } else if (format === 2) {
        var ranges = new Array(count);
        for (var i = 0; i < count; i++) {
            ranges[i] = {
                start: this.parseUShort(),
                end: this.parseUShort(),
                index: this.parseUShort()
            };
        }
        return {
            format: 2,
            ranges: ranges
        };
    }
    throw new Error('0x' + startOffset.toString(16) + ': Coverage format must be 1 or 2.');
};
Parser.prototype.parseClassDef = function() {
    var startOffset = this.offset + this.relativeOffset;
    var format = this.parseUShort();
    if (format === 1) {
        return {
            format: 1,
            startGlyph: this.parseUShort(),
            classes: this.parseUShortList()
        };
    } else if (format === 2) {
        return {
            format: 2,
            ranges: this.parseRecordList({
                start: Parser.uShort,
                end: Parser.uShort,
                classId: Parser.uShort
            })
        };
    }
    throw new Error('0x' + startOffset.toString(16) + ': ClassDef format must be 1 or 2.');
};
Parser.list = function(count, itemCallback) {
    return function() {
        return this.parseList(count, itemCallback);
    };
};
Parser.list32 = function(count, itemCallback) {
    return function() {
        return this.parseList32(count, itemCallback);
    };
};
Parser.recordList = function(count, recordDescription) {
    return function() {
        return this.parseRecordList(count, recordDescription);
    };
};
Parser.recordList32 = function(count, recordDescription) {
    return function() {
        return this.parseRecordList32(count, recordDescription);
    };
};
Parser.pointer = function(description) {
    return function() {
        return this.parsePointer(description);
    };
};
Parser.pointer32 = function(description) {
    return function() {
        return this.parsePointer32(description);
    };
};
Parser.tag = Parser.prototype.parseTag;
Parser.byte = Parser.prototype.parseByte;
Parser.uShort = Parser.offset16 = Parser.prototype.parseUShort;
Parser.uShortList = Parser.prototype.parseUShortList;
Parser.uLong = Parser.offset32 = Parser.prototype.parseULong;
Parser.uLongList = Parser.prototype.parseULongList;
Parser.struct = Parser.prototype.parseStruct;
Parser.coverage = Parser.prototype.parseCoverage;
Parser.classDef = Parser.prototype.parseClassDef;
var langSysTable = {
    reserved: Parser.uShort,
    reqFeatureIndex: Parser.uShort,
    featureIndexes: Parser.uShortList
};
Parser.prototype.parseScriptList = function() {
    return this.parsePointer(Parser.recordList({
        tag: Parser.tag,
        script: Parser.pointer({
            defaultLangSys: Parser.pointer(langSysTable),
            langSysRecords: Parser.recordList({
                tag: Parser.tag,
                langSys: Parser.pointer(langSysTable)
            })
        })
    })) || [];
};
Parser.prototype.parseFeatureList = function() {
    return this.parsePointer(Parser.recordList({
        tag: Parser.tag,
        feature: Parser.pointer({
            featureParams: Parser.offset16,
            lookupListIndexes: Parser.uShortList
        })
    })) || [];
};
Parser.prototype.parseLookupList = function(lookupTableParsers) {
    return this.parsePointer(Parser.list(Parser.pointer(function() {
        var lookupType = this.parseUShort();
        check.argument(1 <= lookupType && lookupType <= 9, 'GPOS/GSUB lookup type ' + lookupType + ' unknown.');
        var lookupFlag = this.parseUShort();
        var useMarkFilteringSet = lookupFlag & 0x10;
        return {
            lookupType: lookupType,
            lookupFlag: lookupFlag,
            subtables: this.parseList(Parser.pointer(lookupTableParsers[lookupType])),
            markFilteringSet: useMarkFilteringSet ? this.parseUShort() : undefined
        };
    }))) || [];
};
Parser.prototype.parseFeatureVariationsList = function() {
    return this.parsePointer32(function() {
        var majorVersion = this.parseUShort();
        var minorVersion = this.parseUShort();
        check.argument(majorVersion === 1 && minorVersion < 1, 'GPOS/GSUB feature variations table unknown.');
        var featureVariations = this.parseRecordList32({
            conditionSetOffset: Parser.offset32,
            featureTableSubstitutionOffset: Parser.offset32
        });
        return featureVariations;
    }) || [];
};
var parse = {
    getByte: getByte,
    getCard8: getByte,
    getUShort: getUShort,
    getCard16: getUShort,
    getShort: getShort,
    getULong: getULong,
    getFixed: getFixed,
    getTag: getTag,
    getOffset: getOffset,
    getBytes: getBytes,
    bytesToString: bytesToString,
    Parser: Parser,
};
function parseCmapTableFormat12(cmap, p) {
    p.parseUShort();
    cmap.length = p.parseULong();
    cmap.language = p.parseULong();
    var groupCount;
    cmap.groupCount = groupCount = p.parseULong();
    cmap.glyphIndexMap = {};
    for (var i = 0; i < groupCount; i += 1) {
        var startCharCode = p.parseULong();
        var endCharCode = p.parseULong();
        var startGlyphId = p.parseULong();
        for (var c = startCharCode; c <= endCharCode; c += 1) {
            cmap.glyphIndexMap[c] = startGlyphId;
            startGlyphId++;
        }
    }
}
function parseCmapTableFormat4(cmap, p, data, start, offset) {
    cmap.length = p.parseUShort();
    cmap.language = p.parseUShort();
    var segCount;
    cmap.segCount = segCount = p.parseUShort() >> 1;
    p.skip('uShort', 3);
    cmap.glyphIndexMap = {};
    var endCountParser = new parse.Parser(data, start + offset + 14);
    var startCountParser = new parse.Parser(data, start + offset + 16 + segCount * 2);
    var idDeltaParser = new parse.Parser(data, start + offset + 16 + segCount * 4);
    var idRangeOffsetParser = new parse.Parser(data, start + offset + 16 + segCount * 6);
    var glyphIndexOffset = start + offset + 16 + segCount * 8;
    for (var i = 0; i < segCount - 1; i += 1) {
        var glyphIndex = (void 0);
        var endCount = endCountParser.parseUShort();
        var startCount = startCountParser.parseUShort();
        var idDelta = idDeltaParser.parseShort();
        var idRangeOffset = idRangeOffsetParser.parseUShort();
        for (var c = startCount; c <= endCount; c += 1) {
            if (idRangeOffset !== 0) {
                glyphIndexOffset = (idRangeOffsetParser.offset + idRangeOffsetParser.relativeOffset - 2);
                glyphIndexOffset += idRangeOffset;
                glyphIndexOffset += (c - startCount) * 2;
                glyphIndex = parse.getUShort(data, glyphIndexOffset);
                if (glyphIndex !== 0) {
                    glyphIndex = (glyphIndex + idDelta) & 0xFFFF;
                }
            } else {
                glyphIndex = (c + idDelta) & 0xFFFF;
            }
            cmap.glyphIndexMap[c] = glyphIndex;
        }
    }
}
function parseCmapTable(data, start) {
    var cmap = {};
    cmap.version = parse.getUShort(data, start);
    check.argument(cmap.version === 0, 'cmap table version should be 0.');
    cmap.numTables = parse.getUShort(data, start + 2);
    var offset = -1;
    for (var i = cmap.numTables - 1; i >= 0; i -= 1) {
        var platformId = parse.getUShort(data, start + 4 + (i * 8));
        var encodingId = parse.getUShort(data, start + 4 + (i * 8) + 2);
        if ((platformId === 3 && (encodingId === 0 || encodingId === 1 || encodingId === 10)) ||
            (platformId === 0 && (encodingId === 0 || encodingId === 1 || encodingId === 2 || encodingId === 3 || encodingId === 4))) {
            offset = parse.getULong(data, start + 4 + (i * 8) + 4);
            break;
        }
    }
    if (offset === -1) {
        throw new Error('No valid cmap sub-tables found.');
    }
    var p = new parse.Parser(data, start + offset);
    cmap.format = p.parseUShort();
    if (cmap.format === 12) {
        parseCmapTableFormat12(cmap, p);
    } else if (cmap.format === 4) {
        parseCmapTableFormat4(cmap, p, data, start, offset);
    } else {
        throw new Error('Only format 4 and 12 cmap tables are supported (found format ' + cmap.format + ').');
    }
    return cmap;
}
function addSegment(t, code, glyphIndex) {
    t.segments.push({
        end: code,
        start: code,
        delta: -(code - glyphIndex),
        offset: 0,
        glyphIndex: glyphIndex
    });
}
function addTerminatorSegment(t) {
    t.segments.push({
        end: 0xFFFF,
        start: 0xFFFF,
        delta: 1,
        offset: 0
    });
}
function makeCmapTable(glyphs) {
    var isPlan0Only = true;
    var i;
    for (i = glyphs.length - 1; i > 0; i -= 1) {
        var g = glyphs.get(i);
        if (g.unicode > 65535) {
            console.log('Adding CMAP format 12 (needed!)');
            isPlan0Only = false;
            break;
        }
    }
    var cmapTable = [
        {name: 'version', type: 'USHORT', value: 0},
        {name: 'numTables', type: 'USHORT', value: isPlan0Only ? 1 : 2},
        {name: 'platformID', type: 'USHORT', value: 3},
        {name: 'encodingID', type: 'USHORT', value: 1},
        {name: 'offset', type: 'ULONG', value: isPlan0Only ? 12 : (12 + 8)}
    ];
    if (!isPlan0Only)
        { cmapTable = cmapTable.concat([
            {name: 'cmap12PlatformID', type: 'USHORT', value: 3},
            {name: 'cmap12EncodingID', type: 'USHORT', value: 10},
            {name: 'cmap12Offset', type: 'ULONG', value: 0}
        ]); }
    cmapTable = cmapTable.concat([
        {name: 'format', type: 'USHORT', value: 4},
        {name: 'cmap4Length', type: 'USHORT', value: 0},
        {name: 'language', type: 'USHORT', value: 0},
        {name: 'segCountX2', type: 'USHORT', value: 0},
        {name: 'searchRange', type: 'USHORT', value: 0},
        {name: 'entrySelector', type: 'USHORT', value: 0},
        {name: 'rangeShift', type: 'USHORT', value: 0}
    ]);
    var t = new table.Table('cmap', cmapTable);
    t.segments = [];
    for (i = 0; i < glyphs.length; i += 1) {
        var glyph = glyphs.get(i);
        for (var j = 0; j < glyph.unicodes.length; j += 1) {
            addSegment(t, glyph.unicodes[j], i);
        }
        t.segments = t.segments.sort(function (a, b) {
            return a.start - b.start;
        });
    }
    addTerminatorSegment(t);
    var segCount = t.segments.length;
    var segCountToRemove = 0;
    var endCounts = [];
    var startCounts = [];
    var idDeltas = [];
    var idRangeOffsets = [];
    var glyphIds = [];
    var cmap12Groups = [];
    for (i = 0; i < segCount; i += 1) {
        var segment = t.segments[i];
        if (segment.end <= 65535 && segment.start <= 65535) {
            endCounts = endCounts.concat({name: 'end_' + i, type: 'USHORT', value: segment.end});
            startCounts = startCounts.concat({name: 'start_' + i, type: 'USHORT', value: segment.start});
            idDeltas = idDeltas.concat({name: 'idDelta_' + i, type: 'SHORT', value: segment.delta});
            idRangeOffsets = idRangeOffsets.concat({name: 'idRangeOffset_' + i, type: 'USHORT', value: segment.offset});
            if (segment.glyphId !== undefined) {
                glyphIds = glyphIds.concat({name: 'glyph_' + i, type: 'USHORT', value: segment.glyphId});
            }
        } else {
            segCountToRemove += 1;
        }
        if (!isPlan0Only && segment.glyphIndex !== undefined) {
            cmap12Groups = cmap12Groups.concat({name: 'cmap12Start_' + i, type: 'ULONG', value: segment.start});
            cmap12Groups = cmap12Groups.concat({name: 'cmap12End_' + i, type: 'ULONG', value: segment.end});
            cmap12Groups = cmap12Groups.concat({name: 'cmap12Glyph_' + i, type: 'ULONG', value: segment.glyphIndex});
        }
    }
    t.segCountX2 = (segCount - segCountToRemove) * 2;
    t.searchRange = Math.pow(2, Math.floor(Math.log((segCount - segCountToRemove)) / Math.log(2))) * 2;
    t.entrySelector = Math.log(t.searchRange / 2) / Math.log(2);
    t.rangeShift = t.segCountX2 - t.searchRange;
    t.fields = t.fields.concat(endCounts);
    t.fields.push({name: 'reservedPad', type: 'USHORT', value: 0});
    t.fields = t.fields.concat(startCounts);
    t.fields = t.fields.concat(idDeltas);
    t.fields = t.fields.concat(idRangeOffsets);
    t.fields = t.fields.concat(glyphIds);
    t.cmap4Length = 14 +
        endCounts.length * 2 +
        2 +
        startCounts.length * 2 +
        idDeltas.length * 2 +
        idRangeOffsets.length * 2 +
        glyphIds.length * 2;
    if (!isPlan0Only) {
        var cmap12Length = 16 +
            cmap12Groups.length * 4;
        t.cmap12Offset = 12 + (2 * 2) + 4 + t.cmap4Length;
        t.fields = t.fields.concat([
            {name: 'cmap12Format', type: 'USHORT', value: 12},
            {name: 'cmap12Reserved', type: 'USHORT', value: 0},
            {name: 'cmap12Length', type: 'ULONG', value: cmap12Length},
            {name: 'cmap12Language', type: 'ULONG', value: 0},
            {name: 'cmap12nGroups', type: 'ULONG', value: cmap12Groups.length / 3}
        ]);
        t.fields = t.fields.concat(cmap12Groups);
    }
    return t;
}
var cmap = { parse: parseCmapTable, make: makeCmapTable };
var cffStandardStrings = [
    '.notdef', 'space', 'exclam', 'quotedbl', 'numbersign', 'dollar', 'percent', 'ampersand', 'quoteright',
    'parenleft', 'parenright', 'asterisk', 'plus', 'comma', 'hyphen', 'period', 'slash', 'zero', 'one', 'two',
    'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'colon', 'semicolon', 'less', 'equal', 'greater',
    'question', 'at', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S',
    'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'bracketleft', 'backslash', 'bracketright', 'asciicircum', 'underscore',
    'quoteleft', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
    'u', 'v', 'w', 'x', 'y', 'z', 'braceleft', 'bar', 'braceright', 'asciitilde', 'exclamdown', 'cent', 'sterling',
    'fraction', 'yen', 'florin', 'section', 'currency', 'quotesingle', 'quotedblleft', 'guillemotleft',
    'guilsinglleft', 'guilsinglright', 'fi', 'fl', 'endash', 'dagger', 'daggerdbl', 'periodcentered', 'paragraph',
    'bullet', 'quotesinglbase', 'quotedblbase', 'quotedblright', 'guillemotright', 'ellipsis', 'perthousand',
    'questiondown', 'grave', 'acute', 'circumflex', 'tilde', 'macron', 'breve', 'dotaccent', 'dieresis', 'ring',
    'cedilla', 'hungarumlaut', 'ogonek', 'caron', 'emdash', 'AE', 'ordfeminine', 'Lslash', 'Oslash', 'OE',
    'ordmasculine', 'ae', 'dotlessi', 'lslash', 'oslash', 'oe', 'germandbls', 'onesuperior', 'logicalnot', 'mu',
    'trademark', 'Eth', 'onehalf', 'plusminus', 'Thorn', 'onequarter', 'divide', 'brokenbar', 'degree', 'thorn',
    'threequarters', 'twosuperior', 'registered', 'minus', 'eth', 'multiply', 'threesuperior', 'copyright',
    'Aacute', 'Acircumflex', 'Adieresis', 'Agrave', 'Aring', 'Atilde', 'Ccedilla', 'Eacute', 'Ecircumflex',
    'Edieresis', 'Egrave', 'Iacute', 'Icircumflex', 'Idieresis', 'Igrave', 'Ntilde', 'Oacute', 'Ocircumflex',
    'Odieresis', 'Ograve', 'Otilde', 'Scaron', 'Uacute', 'Ucircumflex', 'Udieresis', 'Ugrave', 'Yacute',
    'Ydieresis', 'Zcaron', 'aacute', 'acircumflex', 'adieresis', 'agrave', 'aring', 'atilde', 'ccedilla', 'eacute',
    'ecircumflex', 'edieresis', 'egrave', 'iacute', 'icircumflex', 'idieresis', 'igrave', 'ntilde', 'oacute',
    'ocircumflex', 'odieresis', 'ograve', 'otilde', 'scaron', 'uacute', 'ucircumflex', 'udieresis', 'ugrave',
    'yacute', 'ydieresis', 'zcaron', 'exclamsmall', 'Hungarumlautsmall', 'dollaroldstyle', 'dollarsuperior',
    'ampersandsmall', 'Acutesmall', 'parenleftsuperior', 'parenrightsuperior', '266 ff', 'onedotenleader',
    'zerooldstyle', 'oneoldstyle', 'twooldstyle', 'threeoldstyle', 'fouroldstyle', 'fiveoldstyle', 'sixoldstyle',
    'sevenoldstyle', 'eightoldstyle', 'nineoldstyle', 'commasuperior', 'threequartersemdash', 'periodsuperior',
    'questionsmall', 'asuperior', 'bsuperior', 'centsuperior', 'dsuperior', 'esuperior', 'isuperior', 'lsuperior',
    'msuperior', 'nsuperior', 'osuperior', 'rsuperior', 'ssuperior', 'tsuperior', 'ff', 'ffi', 'ffl',
    'parenleftinferior', 'parenrightinferior', 'Circumflexsmall', 'hyphensuperior', 'Gravesmall', 'Asmall',
    'Bsmall', 'Csmall', 'Dsmall', 'Esmall', 'Fsmall', 'Gsmall', 'Hsmall', 'Ismall', 'Jsmall', 'Ksmall', 'Lsmall',
    'Msmall', 'Nsmall', 'Osmall', 'Psmall', 'Qsmall', 'Rsmall', 'Ssmall', 'Tsmall', 'Usmall', 'Vsmall', 'Wsmall',
    'Xsmall', 'Ysmall', 'Zsmall', 'colonmonetary', 'onefitted', 'rupiah', 'Tildesmall', 'exclamdownsmall',
    'centoldstyle', 'Lslashsmall', 'Scaronsmall', 'Zcaronsmall', 'Dieresissmall', 'Brevesmall', 'Caronsmall',
    'Dotaccentsmall', 'Macronsmall', 'figuredash', 'hypheninferior', 'Ogoneksmall', 'Ringsmall', 'Cedillasmall',
    'questiondownsmall', 'oneeighth', 'threeeighths', 'fiveeighths', 'seveneighths', 'onethird', 'twothirds',
    'zerosuperior', 'foursuperior', 'fivesuperior', 'sixsuperior', 'sevensuperior', 'eightsuperior', 'ninesuperior',
    'zeroinferior', 'oneinferior', 'twoinferior', 'threeinferior', 'fourinferior', 'fiveinferior', 'sixinferior',
    'seveninferior', 'eightinferior', 'nineinferior', 'centinferior', 'dollarinferior', 'periodinferior',
    'commainferior', 'Agravesmall', 'Aacutesmall', 'Acircumflexsmall', 'Atildesmall', 'Adieresissmall',
    'Aringsmall', 'AEsmall', 'Ccedillasmall', 'Egravesmall', 'Eacutesmall', 'Ecircumflexsmall', 'Edieresissmall',
    'Igravesmall', 'Iacutesmall', 'Icircumflexsmall', 'Idieresissmall', 'Ethsmall', 'Ntildesmall', 'Ogravesmall',
    'Oacutesmall', 'Ocircumflexsmall', 'Otildesmall', 'Odieresissmall', 'OEsmall', 'Oslashsmall', 'Ugravesmall',
    'Uacutesmall', 'Ucircumflexsmall', 'Udieresissmall', 'Yacutesmall', 'Thornsmall', 'Ydieresissmall', '001.000',
    '001.001', '001.002', '001.003', 'Black', 'Bold', 'Book', 'Light', 'Medium', 'Regular', 'Roman', 'Semibold'];
var cffStandardEncoding = [
    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    '', '', '', '', 'space', 'exclam', 'quotedbl', 'numbersign', 'dollar', 'percent', 'ampersand', 'quoteright',
    'parenleft', 'parenright', 'asterisk', 'plus', 'comma', 'hyphen', 'period', 'slash', 'zero', 'one', 'two',
    'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'colon', 'semicolon', 'less', 'equal', 'greater',
    'question', 'at', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S',
    'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'bracketleft', 'backslash', 'bracketright', 'asciicircum', 'underscore',
    'quoteleft', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
    'u', 'v', 'w', 'x', 'y', 'z', 'braceleft', 'bar', 'braceright', 'asciitilde', '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    'exclamdown', 'cent', 'sterling', 'fraction', 'yen', 'florin', 'section', 'currency', 'quotesingle',
    'quotedblleft', 'guillemotleft', 'guilsinglleft', 'guilsinglright', 'fi', 'fl', '', 'endash', 'dagger',
    'daggerdbl', 'periodcentered', '', 'paragraph', 'bullet', 'quotesinglbase', 'quotedblbase', 'quotedblright',
    'guillemotright', 'ellipsis', 'perthousand', '', 'questiondown', '', 'grave', 'acute', 'circumflex', 'tilde',
    'macron', 'breve', 'dotaccent', 'dieresis', '', 'ring', 'cedilla', '', 'hungarumlaut', 'ogonek', 'caron',
    'emdash', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'AE', '', 'ordfeminine', '', '', '',
    '', 'Lslash', 'Oslash', 'OE', 'ordmasculine', '', '', '', '', '', 'ae', '', '', '', 'dotlessi', '', '',
    'lslash', 'oslash', 'oe', 'germandbls'];
var cffExpertEncoding = [
    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    '', '', '', '', 'space', 'exclamsmall', 'Hungarumlautsmall', '', 'dollaroldstyle', 'dollarsuperior',
    'ampersandsmall', 'Acutesmall', 'parenleftsuperior', 'parenrightsuperior', 'twodotenleader', 'onedotenleader',
    'comma', 'hyphen', 'period', 'fraction', 'zerooldstyle', 'oneoldstyle', 'twooldstyle', 'threeoldstyle',
    'fouroldstyle', 'fiveoldstyle', 'sixoldstyle', 'sevenoldstyle', 'eightoldstyle', 'nineoldstyle', 'colon',
    'semicolon', 'commasuperior', 'threequartersemdash', 'periodsuperior', 'questionsmall', '', 'asuperior',
    'bsuperior', 'centsuperior', 'dsuperior', 'esuperior', '', '', 'isuperior', '', '', 'lsuperior', 'msuperior',
    'nsuperior', 'osuperior', '', '', 'rsuperior', 'ssuperior', 'tsuperior', '', 'ff', 'fi', 'fl', 'ffi', 'ffl',
    'parenleftinferior', '', 'parenrightinferior', 'Circumflexsmall', 'hyphensuperior', 'Gravesmall', 'Asmall',
    'Bsmall', 'Csmall', 'Dsmall', 'Esmall', 'Fsmall', 'Gsmall', 'Hsmall', 'Ismall', 'Jsmall', 'Ksmall', 'Lsmall',
    'Msmall', 'Nsmall', 'Osmall', 'Psmall', 'Qsmall', 'Rsmall', 'Ssmall', 'Tsmall', 'Usmall', 'Vsmall', 'Wsmall',
    'Xsmall', 'Ysmall', 'Zsmall', 'colonmonetary', 'onefitted', 'rupiah', 'Tildesmall', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    'exclamdownsmall', 'centoldstyle', 'Lslashsmall', '', '', 'Scaronsmall', 'Zcaronsmall', 'Dieresissmall',
    'Brevesmall', 'Caronsmall', '', 'Dotaccentsmall', '', '', 'Macronsmall', '', '', 'figuredash', 'hypheninferior',
    '', '', 'Ogoneksmall', 'Ringsmall', 'Cedillasmall', '', '', '', 'onequarter', 'onehalf', 'threequarters',
    'questiondownsmall', 'oneeighth', 'threeeighths', 'fiveeighths', 'seveneighths', 'onethird', 'twothirds', '',
    '', 'zerosuperior', 'onesuperior', 'twosuperior', 'threesuperior', 'foursuperior', 'fivesuperior',
    'sixsuperior', 'sevensuperior', 'eightsuperior', 'ninesuperior', 'zeroinferior', 'oneinferior', 'twoinferior',
    'threeinferior', 'fourinferior', 'fiveinferior', 'sixinferior', 'seveninferior', 'eightinferior',
    'nineinferior', 'centinferior', 'dollarinferior', 'periodinferior', 'commainferior', 'Agravesmall',
    'Aacutesmall', 'Acircumflexsmall', 'Atildesmall', 'Adieresissmall', 'Aringsmall', 'AEsmall', 'Ccedillasmall',
    'Egravesmall', 'Eacutesmall', 'Ecircumflexsmall', 'Edieresissmall', 'Igravesmall', 'Iacutesmall',
    'Icircumflexsmall', 'Idieresissmall', 'Ethsmall', 'Ntildesmall', 'Ogravesmall', 'Oacutesmall',
    'Ocircumflexsmall', 'Otildesmall', 'Odieresissmall', 'OEsmall', 'Oslashsmall', 'Ugravesmall', 'Uacutesmall',
    'Ucircumflexsmall', 'Udieresissmall', 'Yacutesmall', 'Thornsmall', 'Ydieresissmall'];
var standardNames = [
    '.notdef', '.null', 'nonmarkingreturn', 'space', 'exclam', 'quotedbl', 'numbersign', 'dollar', 'percent',
    'ampersand', 'quotesingle', 'parenleft', 'parenright', 'asterisk', 'plus', 'comma', 'hyphen', 'period', 'slash',
    'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'colon', 'semicolon', 'less',
    'equal', 'greater', 'question', 'at', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
    'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'bracketleft', 'backslash', 'bracketright',
    'asciicircum', 'underscore', 'grave', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
    'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'braceleft', 'bar', 'braceright', 'asciitilde',
    'Adieresis', 'Aring', 'Ccedilla', 'Eacute', 'Ntilde', 'Odieresis', 'Udieresis', 'aacute', 'agrave',
    'acircumflex', 'adieresis', 'atilde', 'aring', 'ccedilla', 'eacute', 'egrave', 'ecircumflex', 'edieresis',
    'iacute', 'igrave', 'icircumflex', 'idieresis', 'ntilde', 'oacute', 'ograve', 'ocircumflex', 'odieresis',
    'otilde', 'uacute', 'ugrave', 'ucircumflex', 'udieresis', 'dagger', 'degree', 'cent', 'sterling', 'section',
    'bullet', 'paragraph', 'germandbls', 'registered', 'copyright', 'trademark', 'acute', 'dieresis', 'notequal',
    'AE', 'Oslash', 'infinity', 'plusminus', 'lessequal', 'greaterequal', 'yen', 'mu', 'partialdiff', 'summation',
    'product', 'pi', 'integral', 'ordfeminine', 'ordmasculine', 'Omega', 'ae', 'oslash', 'questiondown',
    'exclamdown', 'logicalnot', 'radical', 'florin', 'approxequal', 'Delta', 'guillemotleft', 'guillemotright',
    'ellipsis', 'nonbreakingspace', 'Agrave', 'Atilde', 'Otilde', 'OE', 'oe', 'endash', 'emdash', 'quotedblleft',
    'quotedblright', 'quoteleft', 'quoteright', 'divide', 'lozenge', 'ydieresis', 'Ydieresis', 'fraction',
    'currency', 'guilsinglleft', 'guilsinglright', 'fi', 'fl', 'daggerdbl', 'periodcentered', 'quotesinglbase',
    'quotedblbase', 'perthousand', 'Acircumflex', 'Ecircumflex', 'Aacute', 'Edieresis', 'Egrave', 'Iacute',
    'Icircumflex', 'Idieresis', 'Igrave', 'Oacute', 'Ocircumflex', 'apple', 'Ograve', 'Uacute', 'Ucircumflex',
    'Ugrave', 'dotlessi', 'circumflex', 'tilde', 'macron', 'breve', 'dotaccent', 'ring', 'cedilla', 'hungarumlaut',
    'ogonek', 'caron', 'Lslash', 'lslash', 'Scaron', 'scaron', 'Zcaron', 'zcaron', 'brokenbar', 'Eth', 'eth',
    'Yacute', 'yacute', 'Thorn', 'thorn', 'minus', 'multiply', 'onesuperior', 'twosuperior', 'threesuperior',
    'onehalf', 'onequarter', 'threequarters', 'franc', 'Gbreve', 'gbreve', 'Idotaccent', 'Scedilla', 'scedilla',
    'Cacute', 'cacute', 'Ccaron', 'ccaron', 'dcroat'];
function DefaultEncoding(font) {
    this.font = font;
}
DefaultEncoding.prototype.charToGlyphIndex = function(c) {
    var code = c.codePointAt(0);
    var glyphs = this.font.glyphs;
    if (glyphs) {
        for (var i = 0; i < glyphs.length; i += 1) {
            var glyph = glyphs.get(i);
            for (var j = 0; j < glyph.unicodes.length; j += 1) {
                if (glyph.unicodes[j] === code) {
                    return i;
                }
            }
        }
    }
    return null;
};
function CmapEncoding(cmap) {
    this.cmap = cmap;
}
CmapEncoding.prototype.charToGlyphIndex = function(c) {
    return this.cmap.glyphIndexMap[c.codePointAt(0)] || 0;
};
function CffEncoding(encoding, charset) {
    this.encoding = encoding;
    this.charset = charset;
}
CffEncoding.prototype.charToGlyphIndex = function(s) {
    var code = s.codePointAt(0);
    var charName = this.encoding[code];
    return this.charset.indexOf(charName);
};
function GlyphNames(post) {
    switch (post.version) {
        case 1:
            this.names = standardNames.slice();
            break;
        case 2:
            this.names = new Array(post.numberOfGlyphs);
            for (var i = 0; i < post.numberOfGlyphs; i++) {
                if (post.glyphNameIndex[i] < standardNames.length) {
                    this.names[i] = standardNames[post.glyphNameIndex[i]];
                } else {
                    this.names[i] = post.names[post.glyphNameIndex[i] - standardNames.length];
                }
            }
            break;
        case 2.5:
            this.names = new Array(post.numberOfGlyphs);
            for (var i$1 = 0; i$1 < post.numberOfGlyphs; i$1++) {
                this.names[i$1] = standardNames[i$1 + post.glyphNameIndex[i$1]];
            }
            break;
        case 3:
            this.names = [];
            break;
        default:
            this.names = [];
            break;
    }
}
GlyphNames.prototype.nameToGlyphIndex = function(name) {
    return this.names.indexOf(name);
};
GlyphNames.prototype.glyphIndexToName = function(gid) {
    return this.names[gid];
};
function addGlyphNamesAll(font) {
    var glyph;
    var glyphIndexMap = font.tables.cmap.glyphIndexMap;
    var charCodes = Object.keys(glyphIndexMap);
    for (var i = 0; i < charCodes.length; i += 1) {
        var c = charCodes[i];
        var glyphIndex = glyphIndexMap[c];
        glyph = font.glyphs.get(glyphIndex);
        glyph.addUnicode(parseInt(c));
    }
    for (var i$1 = 0; i$1 < font.glyphs.length; i$1 += 1) {
        glyph = font.glyphs.get(i$1);
        if (font.cffEncoding) {
            if (font.isCIDFont) {
                glyph.name = 'gid' + i$1;
            } else {
                glyph.name = font.cffEncoding.charset[i$1];
            }
        } else if (font.glyphNames.names) {
            glyph.name = font.glyphNames.glyphIndexToName(i$1);
        }
    }
}
function addGlyphNamesToUnicodeMap(font) {
    font._IndexToUnicodeMap = {};
    var glyphIndexMap = font.tables.cmap.glyphIndexMap;
    var charCodes = Object.keys(glyphIndexMap);
    for (var i = 0; i < charCodes.length; i += 1) {
        var c = charCodes[i];
        var glyphIndex = glyphIndexMap[c];
        if (font._IndexToUnicodeMap[glyphIndex] === undefined) {
            font._IndexToUnicodeMap[glyphIndex] = {
                unicodes: [parseInt(c)]
            };
        } else {
            font._IndexToUnicodeMap[glyphIndex].unicodes.push(parseInt(c));
        }
    }
}
function addGlyphNames(font, opt) {
    if (opt.lowMemory) {
        addGlyphNamesToUnicodeMap(font);
    } else {
        addGlyphNamesAll(font);
    }
}
function line(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}
var draw = { line: line };
function getPathDefinition(glyph, path) {
    var _path = path || new Path();
    return {
        configurable: true,
        get: function() {
            if (typeof _path === 'function') {
                _path = _path();
            }
            return _path;
        },
        set: function(p) {
            _path = p;
        }
    };
}
function Glyph(options) {
    this.bindConstructorValues(options);
}
Glyph.prototype.bindConstructorValues = function(options) {
    this.index = options.index || 0;
    this.name = options.name || null;
    this.unicode = options.unicode || undefined;
    this.unicodes = options.unicodes || options.unicode !== undefined ? [options.unicode] : [];
    if ('xMin' in options) {
        this.xMin = options.xMin;
    }
    if ('yMin' in options) {
        this.yMin = options.yMin;
    }
    if ('xMax' in options) {
        this.xMax = options.xMax;
    }
    if ('yMax' in options) {
        this.yMax = options.yMax;
    }
    if ('advanceWidth' in options) {
        this.advanceWidth = options.advanceWidth;
    }
    Object.defineProperty(this, 'path', getPathDefinition(this, options.path));
};
Glyph.prototype.addUnicode = function(unicode) {
    if (this.unicodes.length === 0) {
        this.unicode = unicode;
    }
    this.unicodes.push(unicode);
};
Glyph.prototype.getBoundingBox = function() {
    return this.path.getBoundingBox();
};
Glyph.prototype.getPath = function(x, y, fontSize, options, font) {
    x = x !== undefined ? x : 0;
    y = y !== undefined ? y : 0;
    fontSize = fontSize !== undefined ? fontSize : 72;
    var commands;
    var hPoints;
    if (!options) { options = { }; }
    var xScale = options.xScale;
    var yScale = options.yScale;
    if (options.hinting && font && font.hinting) {
        hPoints = this.path && font.hinting.exec(this, fontSize);
    }
    if (hPoints) {
        commands = font.hinting.getCommands(hPoints);
        x = Math.round(x);
        y = Math.round(y);
        xScale = yScale = 1;
    } else {
        commands = this.path.commands;
        var scale = 1 / (this.path.unitsPerEm || 1000) * fontSize;
        if (xScale === undefined) { xScale = scale; }
        if (yScale === undefined) { yScale = scale; }
    }
    var p = new Path();
    for (var i = 0; i < commands.length; i += 1) {
        var cmd = commands[i];
        if (cmd.type === 'M') {
            p.moveTo(x + (cmd.x * xScale), y + (-cmd.y * yScale));
        } else if (cmd.type === 'L') {
            p.lineTo(x + (cmd.x * xScale), y + (-cmd.y * yScale));
        } else if (cmd.type === 'Q') {
            p.quadraticCurveTo(x + (cmd.x1 * xScale), y + (-cmd.y1 * yScale),
                               x + (cmd.x * xScale), y + (-cmd.y * yScale));
        } else if (cmd.type === 'C') {
            p.curveTo(x + (cmd.x1 * xScale), y + (-cmd.y1 * yScale),
                      x + (cmd.x2 * xScale), y + (-cmd.y2 * yScale),
                      x + (cmd.x * xScale), y + (-cmd.y * yScale));
        } else if (cmd.type === 'Z') {
            p.closePath();
        }
    }
    return p;
};
Glyph.prototype.getContours = function() {
    if (this.points === undefined) {
        return [];
    }
    var contours = [];
    var currentContour = [];
    for (var i = 0; i < this.points.length; i += 1) {
        var pt = this.points[i];
        currentContour.push(pt);
        if (pt.lastPointOfContour) {
            contours.push(currentContour);
            currentContour = [];
        }
    }
    check.argument(currentContour.length === 0, 'There are still points left in the current contour.');
    return contours;
};
Glyph.prototype.getMetrics = function() {
    var commands = this.path.commands;
    var xCoords = [];
    var yCoords = [];
    for (var i = 0; i < commands.length; i += 1) {
        var cmd = commands[i];
        if (cmd.type !== 'Z') {
            xCoords.push(cmd.x);
            yCoords.push(cmd.y);
        }
        if (cmd.type === 'Q' || cmd.type === 'C') {
            xCoords.push(cmd.x1);
            yCoords.push(cmd.y1);
        }
        if (cmd.type === 'C') {
            xCoords.push(cmd.x2);
            yCoords.push(cmd.y2);
        }
    }
    var metrics = {
        xMin: Math.min.apply(null, xCoords),
        yMin: Math.min.apply(null, yCoords),
        xMax: Math.max.apply(null, xCoords),
        yMax: Math.max.apply(null, yCoords),
        leftSideBearing: this.leftSideBearing
    };
    if (!isFinite(metrics.xMin)) {
        metrics.xMin = 0;
    }
    if (!isFinite(metrics.xMax)) {
        metrics.xMax = this.advanceWidth;
    }
    if (!isFinite(metrics.yMin)) {
        metrics.yMin = 0;
    }
    if (!isFinite(metrics.yMax)) {
        metrics.yMax = 0;
    }
    metrics.rightSideBearing = this.advanceWidth - metrics.leftSideBearing - (metrics.xMax - metrics.xMin);
    return metrics;
};
Glyph.prototype.draw = function(ctx, x, y, fontSize, options) {
    this.getPath(x, y, fontSize, options).draw(ctx);
};
Glyph.prototype.drawPoints = function(ctx, x, y, fontSize) {
    function drawCircles(l, x, y, scale) {
        ctx.beginPath();
        for (var j = 0; j < l.length; j += 1) {
            ctx.moveTo(x + (l[j].x * scale), y + (l[j].y * scale));
            ctx.arc(x + (l[j].x * scale), y + (l[j].y * scale), 2, 0, Math.PI * 2, false);
        }
        ctx.closePath();
        ctx.fill();
    }
    x = x !== undefined ? x : 0;
    y = y !== undefined ? y : 0;
    fontSize = fontSize !== undefined ? fontSize : 24;
    var scale = 1 / this.path.unitsPerEm * fontSize;
    var blueCircles = [];
    var redCircles = [];
    var path = this.path;
    for (var i = 0; i < path.commands.length; i += 1) {
        var cmd = path.commands[i];
        if (cmd.x !== undefined) {
            blueCircles.push({x: cmd.x, y: -cmd.y});
        }
        if (cmd.x1 !== undefined) {
            redCircles.push({x: cmd.x1, y: -cmd.y1});
        }
        if (cmd.x2 !== undefined) {
            redCircles.push({x: cmd.x2, y: -cmd.y2});
        }
    }
    ctx.fillStyle = 'blue';
    drawCircles(blueCircles, x, y, scale);
    ctx.fillStyle = 'red';
    drawCircles(redCircles, x, y, scale);
};
Glyph.prototype.drawMetrics = function(ctx, x, y, fontSize) {
    var scale;
    x = x !== undefined ? x : 0;
    y = y !== undefined ? y : 0;
    fontSize = fontSize !== undefined ? fontSize : 24;
    scale = 1 / this.path.unitsPerEm * fontSize;
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black';
    draw.line(ctx, x, -1e4, x, 10000);
    draw.line(ctx, -1e4, y, 10000, y);
    var xMin = this.xMin || 0;
    var yMin = this.yMin || 0;
    var xMax = this.xMax || 0;
    var yMax = this.yMax || 0;
    var advanceWidth = this.advanceWidth || 0;
    ctx.strokeStyle = 'blue';
    draw.line(ctx, x + (xMin * scale), -1e4, x + (xMin * scale), 10000);
    draw.line(ctx, x + (xMax * scale), -1e4, x + (xMax * scale), 10000);
    draw.line(ctx, -1e4, y + (-yMin * scale), 10000, y + (-yMin * scale));
    draw.line(ctx, -1e4, y + (-yMax * scale), 10000, y + (-yMax * scale));
    ctx.strokeStyle = 'green';
    draw.line(ctx, x + (advanceWidth * scale), -1e4, x + (advanceWidth * scale), 10000);
};
function defineDependentProperty(glyph, externalName, internalName) {
    Object.defineProperty(glyph, externalName, {
        get: function() {
            glyph.path;
            return glyph[internalName];
        },
        set: function(newValue) {
            glyph[internalName] = newValue;
        },
        enumerable: true,
        configurable: true
    });
}
function GlyphSet(font, glyphs) {
    this.font = font;
    this.glyphs = {};
    if (Array.isArray(glyphs)) {
        for (var i = 0; i < glyphs.length; i++) {
            var glyph = glyphs[i];
            glyph.path.unitsPerEm = font.unitsPerEm;
            this.glyphs[i] = glyph;
        }
    }
    this.length = (glyphs && glyphs.length) || 0;
}
GlyphSet.prototype.get = function(index) {
    if (this.glyphs[index] === undefined) {
        this.font._push(index);
        if (typeof this.glyphs[index] === 'function') {
            this.glyphs[index] = this.glyphs[index]();
        }
        var glyph = this.glyphs[index];
        var unicodeObj = this.font._IndexToUnicodeMap[index];
        if (unicodeObj) {
            for (var j = 0; j < unicodeObj.unicodes.length; j++)
                { glyph.addUnicode(unicodeObj.unicodes[j]); }
        }
        if (this.font.cffEncoding) {
            if (this.font.isCIDFont) {
                glyph.name = 'gid' + index;
            } else {
                glyph.name = this.font.cffEncoding.charset[index];
            }
        } else if (this.font.glyphNames.names) {
            glyph.name = this.font.glyphNames.glyphIndexToName(index);
        }
        this.glyphs[index].advanceWidth = this.font._hmtxTableData[index].advanceWidth;
        this.glyphs[index].leftSideBearing = this.font._hmtxTableData[index].leftSideBearing;
    } else {
        if (typeof this.glyphs[index] === 'function') {
            this.glyphs[index] = this.glyphs[index]();
        }
    }
    return this.glyphs[index];
};
GlyphSet.prototype.push = function(index, loader) {
    this.glyphs[index] = loader;
    this.length++;
};
function glyphLoader(font, index) {
    return new Glyph({index: index, font: font});
}
function ttfGlyphLoader(font, index, parseGlyph, data, position, buildPath) {
    return function() {
        var glyph = new Glyph({index: index, font: font});
        glyph.path = function() {
            parseGlyph(glyph, data, position);
            var path = buildPath(font.glyphs, glyph);
            path.unitsPerEm = font.unitsPerEm;
            return path;
        };
        defineDependentProperty(glyph, 'xMin', '_xMin');
        defineDependentProperty(glyph, 'xMax', '_xMax');
        defineDependentProperty(glyph, 'yMin', '_yMin');
        defineDependentProperty(glyph, 'yMax', '_yMax');
        return glyph;
    };
}
function cffGlyphLoader(font, index, parseCFFCharstring, charstring) {
    return function() {
        var glyph = new Glyph({index: index, font: font});
        glyph.path = function() {
            var path = parseCFFCharstring(font, glyph, charstring);
            path.unitsPerEm = font.unitsPerEm;
            return path;
        };
        return glyph;
    };
}
var glyphset = { GlyphSet: GlyphSet, glyphLoader: glyphLoader, ttfGlyphLoader: ttfGlyphLoader, cffGlyphLoader: cffGlyphLoader };
function equals(a, b) {
    if (a === b) {
        return true;
    } else if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) {
            return false;
        }
        for (var i = 0; i < a.length; i += 1) {
            if (!equals(a[i], b[i])) {
                return false;
            }
        }
        return true;
    } else {
        return false;
    }
}
function calcCFFSubroutineBias(subrs) {
    var bias;
    if (subrs.length < 1240) {
        bias = 107;
    } else if (subrs.length < 33900) {
        bias = 1131;
    } else {
        bias = 32768;
    }
    return bias;
}
function parseCFFIndex(data, start, conversionFn) {
    var offsets = [];
    var objects = [];
    var count = parse.getCard16(data, start);
    var objectOffset;
    var endOffset;
    if (count !== 0) {
        var offsetSize = parse.getByte(data, start + 2);
        objectOffset = start + ((count + 1) * offsetSize) + 2;
        var pos = start + 3;
        for (var i = 0; i < count + 1; i += 1) {
            offsets.push(parse.getOffset(data, pos, offsetSize));
            pos += offsetSize;
        }
        endOffset = objectOffset + offsets[count];
    } else {
        endOffset = start + 2;
    }
    for (var i$1 = 0; i$1 < offsets.length - 1; i$1 += 1) {
        var value = parse.getBytes(data, objectOffset + offsets[i$1], objectOffset + offsets[i$1 + 1]);
        if (conversionFn) {
            value = conversionFn(value);
        }
        objects.push(value);
    }
    return {objects: objects, startOffset: start, endOffset: endOffset};
}
function parseCFFIndexLowMemory(data, start) {
    var offsets = [];
    var count = parse.getCard16(data, start);
    var objectOffset;
    var endOffset;
    if (count !== 0) {
        var offsetSize = parse.getByte(data, start + 2);
        objectOffset = start + ((count + 1) * offsetSize) + 2;
        var pos = start + 3;
        for (var i = 0; i < count + 1; i += 1) {
            offsets.push(parse.getOffset(data, pos, offsetSize));
            pos += offsetSize;
        }
        endOffset = objectOffset + offsets[count];
    } else {
        endOffset = start + 2;
    }
    return {offsets: offsets, startOffset: start, endOffset: endOffset};
}
function getCffIndexObject(i, offsets, data, start, conversionFn) {
    var count = parse.getCard16(data, start);
    var objectOffset = 0;
    if (count !== 0) {
        var offsetSize = parse.getByte(data, start + 2);
        objectOffset = start + ((count + 1) * offsetSize) + 2;
    }
    var value = parse.getBytes(data, objectOffset + offsets[i], objectOffset + offsets[i + 1]);
    return value;
}
function parseFloatOperand(parser) {
    var s = '';
    var eof = 15;
    var lookup = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', 'E', 'E-', null, '-'];
    while (true) {
        var b = parser.parseByte();
        var n1 = b >> 4;
        var n2 = b & 15;
        if (n1 === eof) {
            break;
        }
        s += lookup[n1];
        if (n2 === eof) {
            break;
        }
        s += lookup[n2];
    }
    return parseFloat(s);
}
function parseOperand(parser, b0) {
    var b1;
    var b2;
    var b3;
    var b4;
    if (b0 === 28) {
        b1 = parser.parseByte();
        b2 = parser.parseByte();
        return b1 << 8 | b2;
    }
    if (b0 === 29) {
        b1 = parser.parseByte();
        b2 = parser.parseByte();
        b3 = parser.parseByte();
        b4 = parser.parseByte();
        return b1 << 24 | b2 << 16 | b3 << 8 | b4;
    }
    if (b0 === 30) {
        return parseFloatOperand(parser);
    }
    if (b0 >= 32 && b0 <= 246) {
        return b0 - 139;
    }
    if (b0 >= 247 && b0 <= 250) {
        b1 = parser.parseByte();
        return (b0 - 247) * 256 + b1 + 108;
    }
    if (b0 >= 251 && b0 <= 254) {
        b1 = parser.parseByte();
        return -(b0 - 251) * 256 - b1 - 108;
    }
    throw new Error('Invalid b0 ' + b0);
}
function entriesToObject(entries) {
    var o = {};
    for (var i = 0; i < entries.length; i += 1) {
        var key = entries[i][0];
        var values = entries[i][1];
        var value = (void 0);
        if (values.length === 1) {
            value = values[0];
        } else {
            value = values;
        }
        if (o.hasOwnProperty(key) && !isNaN(o[key])) {
            throw new Error('Object ' + o + ' already has key ' + key);
        }
        o[key] = value;
    }
    return o;
}
function parseCFFDict(data, start, size) {
    start = start !== undefined ? start : 0;
    var parser = new parse.Parser(data, start);
    var entries = [];
    var operands = [];
    size = size !== undefined ? size : data.length;
    while (parser.relativeOffset < size) {
        var op = parser.parseByte();
        if (op <= 21) {
            if (op === 12) {
                op = 1200 + parser.parseByte();
            }
            entries.push([op, operands]);
            operands = [];
        } else {
            operands.push(parseOperand(parser, op));
        }
    }
    return entriesToObject(entries);
}
function getCFFString(strings, index) {
    if (index <= 390) {
        index = cffStandardStrings[index];
    } else {
        index = strings[index - 391];
    }
    return index;
}
function interpretDict(dict, meta, strings) {
    var newDict = {};
    var value;
    for (var i = 0; i < meta.length; i += 1) {
        var m = meta[i];
        if (Array.isArray(m.type)) {
            var values = [];
            values.length = m.type.length;
            for (var j = 0; j < m.type.length; j++) {
                value = dict[m.op] !== undefined ? dict[m.op][j] : undefined;
                if (value === undefined) {
                    value = m.value !== undefined && m.value[j] !== undefined ? m.value[j] : null;
                }
                if (m.type[j] === 'SID') {
                    value = getCFFString(strings, value);
                }
                values[j] = value;
            }
            newDict[m.name] = values;
        } else {
            value = dict[m.op];
            if (value === undefined) {
                value = m.value !== undefined ? m.value : null;
            }
            if (m.type === 'SID') {
                value = getCFFString(strings, value);
            }
            newDict[m.name] = value;
        }
    }
    return newDict;
}
function parseCFFHeader(data, start) {
    var header = {};
    header.formatMajor = parse.getCard8(data, start);
    header.formatMinor = parse.getCard8(data, start + 1);
    header.size = parse.getCard8(data, start + 2);
    header.offsetSize = parse.getCard8(data, start + 3);
    header.startOffset = start;
    header.endOffset = start + 4;
    return header;
}
var TOP_DICT_META = [
    {name: 'version', op: 0, type: 'SID'},
    {name: 'notice', op: 1, type: 'SID'},
    {name: 'copyright', op: 1200, type: 'SID'},
    {name: 'fullName', op: 2, type: 'SID'},
    {name: 'familyName', op: 3, type: 'SID'},
    {name: 'weight', op: 4, type: 'SID'},
    {name: 'isFixedPitch', op: 1201, type: 'number', value: 0},
    {name: 'italicAngle', op: 1202, type: 'number', value: 0},
    {name: 'underlinePosition', op: 1203, type: 'number', value: -100},
    {name: 'underlineThickness', op: 1204, type: 'number', value: 50},
    {name: 'paintType', op: 1205, type: 'number', value: 0},
    {name: 'charstringType', op: 1206, type: 'number', value: 2},
    {
        name: 'fontMatrix',
        op: 1207,
        type: ['real', 'real', 'real', 'real', 'real', 'real'],
        value: [0.001, 0, 0, 0.001, 0, 0]
    },
    {name: 'uniqueId', op: 13, type: 'number'},
    {name: 'fontBBox', op: 5, type: ['number', 'number', 'number', 'number'], value: [0, 0, 0, 0]},
    {name: 'strokeWidth', op: 1208, type: 'number', value: 0},
    {name: 'xuid', op: 14, type: [], value: null},
    {name: 'charset', op: 15, type: 'offset', value: 0},
    {name: 'encoding', op: 16, type: 'offset', value: 0},
    {name: 'charStrings', op: 17, type: 'offset', value: 0},
    {name: 'private', op: 18, type: ['number', 'offset'], value: [0, 0]},
    {name: 'ros', op: 1230, type: ['SID', 'SID', 'number']},
    {name: 'cidFontVersion', op: 1231, type: 'number', value: 0},
    {name: 'cidFontRevision', op: 1232, type: 'number', value: 0},
    {name: 'cidFontType', op: 1233, type: 'number', value: 0},
    {name: 'cidCount', op: 1234, type: 'number', value: 8720},
    {name: 'uidBase', op: 1235, type: 'number'},
    {name: 'fdArray', op: 1236, type: 'offset'},
    {name: 'fdSelect', op: 1237, type: 'offset'},
    {name: 'fontName', op: 1238, type: 'SID'}
];
var PRIVATE_DICT_META = [
    {name: 'subrs', op: 19, type: 'offset', value: 0},
    {name: 'defaultWidthX', op: 20, type: 'number', value: 0},
    {name: 'nominalWidthX', op: 21, type: 'number', value: 0}
];
function parseCFFTopDict(data, strings) {
    var dict = parseCFFDict(data, 0, data.byteLength);
    return interpretDict(dict, TOP_DICT_META, strings);
}
function parseCFFPrivateDict(data, start, size, strings) {
    var dict = parseCFFDict(data, start, size);
    return interpretDict(dict, PRIVATE_DICT_META, strings);
}
function gatherCFFTopDicts(data, start, cffIndex, strings) {
    var topDictArray = [];
    for (var iTopDict = 0; iTopDict < cffIndex.length; iTopDict += 1) {
        var topDictData = new DataView(new Uint8Array(cffIndex[iTopDict]).buffer);
        var topDict = parseCFFTopDict(topDictData, strings);
        topDict._subrs = [];
        topDict._subrsBias = 0;
        topDict._defaultWidthX = 0;
        topDict._nominalWidthX = 0;
        var privateSize = topDict.private[0];
        var privateOffset = topDict.private[1];
        if (privateSize !== 0 && privateOffset !== 0) {
            var privateDict = parseCFFPrivateDict(data, privateOffset + start, privateSize, strings);
            topDict._defaultWidthX = privateDict.defaultWidthX;
            topDict._nominalWidthX = privateDict.nominalWidthX;
            if (privateDict.subrs !== 0) {
                var subrOffset = privateOffset + privateDict.subrs;
                var subrIndex = parseCFFIndex(data, subrOffset + start);
                topDict._subrs = subrIndex.objects;
                topDict._subrsBias = calcCFFSubroutineBias(topDict._subrs);
            }
            topDict._privateDict = privateDict;
        }
        topDictArray.push(topDict);
    }
    return topDictArray;
}
function parseCFFCharset(data, start, nGlyphs, strings) {
    var sid;
    var count;
    var parser = new parse.Parser(data, start);
    nGlyphs -= 1;
    var charset = ['.notdef'];
    var format = parser.parseCard8();
    if (format === 0) {
        for (var i = 0; i < nGlyphs; i += 1) {
            sid = parser.parseSID();
            charset.push(getCFFString(strings, sid));
        }
    } else if (format === 1) {
        while (charset.length <= nGlyphs) {
            sid = parser.parseSID();
            count = parser.parseCard8();
            for (var i$1 = 0; i$1 <= count; i$1 += 1) {
                charset.push(getCFFString(strings, sid));
                sid += 1;
            }
        }
    } else if (format === 2) {
        while (charset.length <= nGlyphs) {
            sid = parser.parseSID();
            count = parser.parseCard16();
            for (var i$2 = 0; i$2 <= count; i$2 += 1) {
                charset.push(getCFFString(strings, sid));
                sid += 1;
            }
        }
    } else {
        throw new Error('Unknown charset format ' + format);
    }
    return charset;
}
function parseCFFEncoding(data, start, charset) {
    var code;
    var enc = {};
    var parser = new parse.Parser(data, start);
    var format = parser.parseCard8();
    if (format === 0) {
        var nCodes = parser.parseCard8();
        for (var i = 0; i < nCodes; i += 1) {
            code = parser.parseCard8();
            enc[code] = i;
        }
    } else if (format === 1) {
        var nRanges = parser.parseCard8();
        code = 1;
        for (var i$1 = 0; i$1 < nRanges; i$1 += 1) {
            var first = parser.parseCard8();
            var nLeft = parser.parseCard8();
            for (var j = first; j <= first + nLeft; j += 1) {
                enc[j] = code;
                code += 1;
            }
        }
    } else {
        throw new Error('Unknown encoding format ' + format);
    }
    return new CffEncoding(enc, charset);
}
function parseCFFCharstring(font, glyph, code) {
    var c1x;
    var c1y;
    var c2x;
    var c2y;
    var p = new Path();
    var stack = [];
    var nStems = 0;
    var haveWidth = false;
    var open = false;
    var x = 0;
    var y = 0;
    var subrs;
    var subrsBias;
    var defaultWidthX;
    var nominalWidthX;
    if (font.isCIDFont) {
        var fdIndex = font.tables.cff.topDict._fdSelect[glyph.index];
        var fdDict = font.tables.cff.topDict._fdArray[fdIndex];
        subrs = fdDict._subrs;
        subrsBias = fdDict._subrsBias;
        defaultWidthX = fdDict._defaultWidthX;
        nominalWidthX = fdDict._nominalWidthX;
    } else {
        subrs = font.tables.cff.topDict._subrs;
        subrsBias = font.tables.cff.topDict._subrsBias;
        defaultWidthX = font.tables.cff.topDict._defaultWidthX;
        nominalWidthX = font.tables.cff.topDict._nominalWidthX;
    }
    var width = defaultWidthX;
    function newContour(x, y) {
        if (open) {
            p.closePath();
        }
        p.moveTo(x, y);
        open = true;
    }
    function parseStems() {
        var hasWidthArg;
        hasWidthArg = stack.length % 2 !== 0;
        if (hasWidthArg && !haveWidth) {
            width = stack.shift() + nominalWidthX;
        }
        nStems += stack.length >> 1;
        stack.length = 0;
        haveWidth = true;
    }
    function parse(code) {
        var b1;
        var b2;
        var b3;
        var b4;
        var codeIndex;
        var subrCode;
        var jpx;
        var jpy;
        var c3x;
        var c3y;
        var c4x;
        var c4y;
        var i = 0;
        while (i < code.length) {
            var v = code[i];
            i += 1;
            switch (v) {
                case 1:
                    parseStems();
                    break;
                case 3:
                    parseStems();
                    break;
                case 4:
                    if (stack.length > 1 && !haveWidth) {
                        width = stack.shift() + nominalWidthX;
                        haveWidth = true;
                    }
                    y += stack.pop();
                    newContour(x, y);
                    break;
                case 5:
                    while (stack.length > 0) {
                        x += stack.shift();
                        y += stack.shift();
                        p.lineTo(x, y);
                    }
                    break;
                case 6:
                    while (stack.length > 0) {
                        x += stack.shift();
                        p.lineTo(x, y);
                        if (stack.length === 0) {
                            break;
                        }
                        y += stack.shift();
                        p.lineTo(x, y);
                    }
                    break;
                case 7:
                    while (stack.length > 0) {
                        y += stack.shift();
                        p.lineTo(x, y);
                        if (stack.length === 0) {
                            break;
                        }
                        x += stack.shift();
                        p.lineTo(x, y);
                    }
                    break;
                case 8:
                    while (stack.length > 0) {
                        c1x = x + stack.shift();
                        c1y = y + stack.shift();
                        c2x = c1x + stack.shift();
                        c2y = c1y + stack.shift();
                        x = c2x + stack.shift();
                        y = c2y + stack.shift();
                        p.curveTo(c1x, c1y, c2x, c2y, x, y);
                    }
                    break;
                case 10:
                    codeIndex = stack.pop() + subrsBias;
                    subrCode = subrs[codeIndex];
                    if (subrCode) {
                        parse(subrCode);
                    }
                    break;
                case 11:
                    return;
                case 12:
                    v = code[i];
                    i += 1;
                    switch (v) {
                        case 35:
                            c1x = x   + stack.shift();
                            c1y = y   + stack.shift();
                            c2x = c1x + stack.shift();
                            c2y = c1y + stack.shift();
                            jpx = c2x + stack.shift();
                            jpy = c2y + stack.shift();
                            c3x = jpx + stack.shift();
                            c3y = jpy + stack.shift();
                            c4x = c3x + stack.shift();
                            c4y = c3y + stack.shift();
                            x = c4x   + stack.shift();
                            y = c4y   + stack.shift();
                            stack.shift();
                            p.curveTo(c1x, c1y, c2x, c2y, jpx, jpy);
                            p.curveTo(c3x, c3y, c4x, c4y, x, y);
                            break;
                        case 34:
                            c1x = x   + stack.shift();
                            c1y = y;
                            c2x = c1x + stack.shift();
                            c2y = c1y + stack.shift();
                            jpx = c2x + stack.shift();
                            jpy = c2y;
                            c3x = jpx + stack.shift();
                            c3y = c2y;
                            c4x = c3x + stack.shift();
                            c4y = y;
                            x = c4x + stack.shift();
                            p.curveTo(c1x, c1y, c2x, c2y, jpx, jpy);
                            p.curveTo(c3x, c3y, c4x, c4y, x, y);
                            break;
                        case 36:
                            c1x = x   + stack.shift();
                            c1y = y   + stack.shift();
                            c2x = c1x + stack.shift();
                            c2y = c1y + stack.shift();
                            jpx = c2x + stack.shift();
                            jpy = c2y;
                            c3x = jpx + stack.shift();
                            c3y = c2y;
                            c4x = c3x + stack.shift();
                            c4y = c3y + stack.shift();
                            x = c4x + stack.shift();
                            p.curveTo(c1x, c1y, c2x, c2y, jpx, jpy);
                            p.curveTo(c3x, c3y, c4x, c4y, x, y);
                            break;
                        case 37:
                            c1x = x   + stack.shift();
                            c1y = y   + stack.shift();
                            c2x = c1x + stack.shift();
                            c2y = c1y + stack.shift();
                            jpx = c2x + stack.shift();
                            jpy = c2y + stack.shift();
                            c3x = jpx + stack.shift();
                            c3y = jpy + stack.shift();
                            c4x = c3x + stack.shift();
                            c4y = c3y + stack.shift();
                            if (Math.abs(c4x - x) > Math.abs(c4y - y)) {
                                x = c4x + stack.shift();
                            } else {
                                y = c4y + stack.shift();
                            }
                            p.curveTo(c1x, c1y, c2x, c2y, jpx, jpy);
                            p.curveTo(c3x, c3y, c4x, c4y, x, y);
                            break;
                        default:
                            console.log('Glyph ' + glyph.index + ': unknown operator ' + 1200 + v);
                            stack.length = 0;
                    }
                    break;
                case 14:
                    if (stack.length > 0 && !haveWidth) {
                        width = stack.shift() + nominalWidthX;
                        haveWidth = true;
                    }
                    if (open) {
                        p.closePath();
                        open = false;
                    }
                    break;
                case 18:
                    parseStems();
                    break;
                case 19:
                case 20:
                    parseStems();
                    i += (nStems + 7) >> 3;
                    break;
                case 21:
                    if (stack.length > 2 && !haveWidth) {
                        width = stack.shift() + nominalWidthX;
                        haveWidth = true;
                    }
                    y += stack.pop();
                    x += stack.pop();
                    newContour(x, y);
                    break;
                case 22:
                    if (stack.length > 1 && !haveWidth) {
                        width = stack.shift() + nominalWidthX;
                        haveWidth = true;
                    }
                    x += stack.pop();
                    newContour(x, y);
                    break;
                case 23:
                    parseStems();
                    break;
                case 24:
                    while (stack.length > 2) {
                        c1x = x + stack.shift();
                        c1y = y + stack.shift();
                        c2x = c1x + stack.shift();
                        c2y = c1y + stack.shift();
                        x = c2x + stack.shift();
                        y = c2y + stack.shift();
                        p.curveTo(c1x, c1y, c2x, c2y, x, y);
                    }
                    x += stack.shift();
                    y += stack.shift();
                    p.lineTo(x, y);
                    break;
                case 25:
                    while (stack.length > 6) {
                        x += stack.shift();
                        y += stack.shift();
                        p.lineTo(x, y);
                    }
                    c1x = x + stack.shift();
                    c1y = y + stack.shift();
                    c2x = c1x + stack.shift();
                    c2y = c1y + stack.shift();
                    x = c2x + stack.shift();
                    y = c2y + stack.shift();
                    p.curveTo(c1x, c1y, c2x, c2y, x, y);
                    break;
                case 26:
                    if (stack.length % 2) {
                        x += stack.shift();
                    }
                    while (stack.length > 0) {
                        c1x = x;
                        c1y = y + stack.shift();
                        c2x = c1x + stack.shift();
                        c2y = c1y + stack.shift();
                        x = c2x;
                        y = c2y + stack.shift();
                        p.curveTo(c1x, c1y, c2x, c2y, x, y);
                    }
                    break;
                case 27:
                    if (stack.length % 2) {
                        y += stack.shift();
                    }
                    while (stack.length > 0) {
                        c1x = x + stack.shift();
                        c1y = y;
                        c2x = c1x + stack.shift();
                        c2y = c1y + stack.shift();
                        x = c2x + stack.shift();
                        y = c2y;
                        p.curveTo(c1x, c1y, c2x, c2y, x, y);
                    }
                    break;
                case 28:
                    b1 = code[i];
                    b2 = code[i + 1];
                    stack.push(((b1 << 24) | (b2 << 16)) >> 16);
                    i += 2;
                    break;
                case 29:
                    codeIndex = stack.pop() + font.gsubrsBias;
                    subrCode = font.gsubrs[codeIndex];
                    if (subrCode) {
                        parse(subrCode);
                    }
                    break;
                case 30:
                    while (stack.length > 0) {
                        c1x = x;
                        c1y = y + stack.shift();
                        c2x = c1x + stack.shift();
                        c2y = c1y + stack.shift();
                        x = c2x + stack.shift();
                        y = c2y + (stack.length === 1 ? stack.shift() : 0);
                        p.curveTo(c1x, c1y, c2x, c2y, x, y);
                        if (stack.length === 0) {
                            break;
                        }
                        c1x = x + stack.shift();
                        c1y = y;
                        c2x = c1x + stack.shift();
                        c2y = c1y + stack.shift();
                        y = c2y + stack.shift();
                        x = c2x + (stack.length === 1 ? stack.shift() : 0);
                        p.curveTo(c1x, c1y, c2x, c2y, x, y);
                    }
                    break;
                case 31:
                    while (stack.length > 0) {
                        c1x = x + stack.shift();
                        c1y = y;
                        c2x = c1x + stack.shift();
                        c2y = c1y + stack.shift();
                        y = c2y + stack.shift();
                        x = c2x + (stack.length === 1 ? stack.shift() : 0);
                        p.curveTo(c1x, c1y, c2x, c2y, x, y);
                        if (stack.length === 0) {
                            break;
                        }
                        c1x = x;
                        c1y = y + stack.shift();
                        c2x = c1x + stack.shift();
                        c2y = c1y + stack.shift();
                        x = c2x + stack.shift();
                        y = c2y + (stack.length === 1 ? stack.shift() : 0);
                        p.curveTo(c1x, c1y, c2x, c2y, x, y);
                    }
                    break;
                default:
                    if (v < 32) {
                        console.log('Glyph ' + glyph.index + ': unknown operator ' + v);
                    } else if (v < 247) {
                        stack.push(v - 139);
                    } else if (v < 251) {
                        b1 = code[i];
                        i += 1;
                        stack.push((v - 247) * 256 + b1 + 108);
                    } else if (v < 255) {
                        b1 = code[i];
                        i += 1;
                        stack.push(-(v - 251) * 256 - b1 - 108);
                    } else {
                        b1 = code[i];
                        b2 = code[i + 1];
                        b3 = code[i + 2];
                        b4 = code[i + 3];
                        i += 4;
                        stack.push(((b1 << 24) | (b2 << 16) | (b3 << 8) | b4) / 65536);
                    }
            }
        }
    }
    parse(code);
    glyph.advanceWidth = width;
    return p;
}
function parseCFFFDSelect(data, start, nGlyphs, fdArrayCount) {
    var fdSelect = [];
    var fdIndex;
    var parser = new parse.Parser(data, start);
    var format = parser.parseCard8();
    if (format === 0) {
        for (var iGid = 0; iGid < nGlyphs; iGid++) {
            fdIndex = parser.parseCard8();
            if (fdIndex >= fdArrayCount) {
                throw new Error('CFF table CID Font FDSelect has bad FD index value ' + fdIndex + ' (FD count ' + fdArrayCount + ')');
            }
            fdSelect.push(fdIndex);
        }
    } else if (format === 3) {
        var nRanges = parser.parseCard16();
        var first = parser.parseCard16();
        if (first !== 0) {
            throw new Error('CFF Table CID Font FDSelect format 3 range has bad initial GID ' + first);
        }
        var next;
        for (var iRange = 0; iRange < nRanges; iRange++) {
            fdIndex = parser.parseCard8();
            next = parser.parseCard16();
            if (fdIndex >= fdArrayCount) {
                throw new Error('CFF table CID Font FDSelect has bad FD index value ' + fdIndex + ' (FD count ' + fdArrayCount + ')');
            }
            if (next > nGlyphs) {
                throw new Error('CFF Table CID Font FDSelect format 3 range has bad GID ' + next);
            }
            for (; first < next; first++) {
                fdSelect.push(fdIndex);
            }
            first = next;
        }
        if (next !== nGlyphs) {
            throw new Error('CFF Table CID Font FDSelect format 3 range has bad final GID ' + next);
        }
    } else {
        throw new Error('CFF Table CID Font FDSelect table has unsupported format ' + format);
    }
    return fdSelect;
}
function parseCFFTable(data, start, font, opt) {
    font.tables.cff = {};
    var header = parseCFFHeader(data, start);
    var nameIndex = parseCFFIndex(data, header.endOffset, parse.bytesToString);
    var topDictIndex = parseCFFIndex(data, nameIndex.endOffset);
    var stringIndex = parseCFFIndex(data, topDictIndex.endOffset, parse.bytesToString);
    var globalSubrIndex = parseCFFIndex(data, stringIndex.endOffset);
    font.gsubrs = globalSubrIndex.objects;
    font.gsubrsBias = calcCFFSubroutineBias(font.gsubrs);
    var topDictArray = gatherCFFTopDicts(data, start, topDictIndex.objects, stringIndex.objects);
    if (topDictArray.length !== 1) {
        throw new Error('CFF table has too many fonts in \'FontSet\' - count of fonts NameIndex.length = ' + topDictArray.length);
    }
    var topDict = topDictArray[0];
    font.tables.cff.topDict = topDict;
    if (topDict._privateDict) {
        font.defaultWidthX = topDict._privateDict.defaultWidthX;
        font.nominalWidthX = topDict._privateDict.nominalWidthX;
    }
    if (topDict.ros[0] !== undefined && topDict.ros[1] !== undefined) {
        font.isCIDFont = true;
    }
    if (font.isCIDFont) {
        var fdArrayOffset = topDict.fdArray;
        var fdSelectOffset = topDict.fdSelect;
        if (fdArrayOffset === 0 || fdSelectOffset === 0) {
            throw new Error('Font is marked as a CID font, but FDArray and/or FDSelect information is missing');
        }
        fdArrayOffset += start;
        var fdArrayIndex = parseCFFIndex(data, fdArrayOffset);
        var fdArray = gatherCFFTopDicts(data, start, fdArrayIndex.objects, stringIndex.objects);
        topDict._fdArray = fdArray;
        fdSelectOffset += start;
        topDict._fdSelect = parseCFFFDSelect(data, fdSelectOffset, font.numGlyphs, fdArray.length);
    }
    var privateDictOffset = start + topDict.private[1];
    var privateDict = parseCFFPrivateDict(data, privateDictOffset, topDict.private[0], stringIndex.objects);
    font.defaultWidthX = privateDict.defaultWidthX;
    font.nominalWidthX = privateDict.nominalWidthX;
    if (privateDict.subrs !== 0) {
        var subrOffset = privateDictOffset + privateDict.subrs;
        var subrIndex = parseCFFIndex(data, subrOffset);
        font.subrs = subrIndex.objects;
        font.subrsBias = calcCFFSubroutineBias(font.subrs);
    } else {
        font.subrs = [];
        font.subrsBias = 0;
    }
    var charStringsIndex;
    if (opt.lowMemory) {
        charStringsIndex = parseCFFIndexLowMemory(data, start + topDict.charStrings);
        font.nGlyphs = charStringsIndex.offsets.length;
    } else {
        charStringsIndex = parseCFFIndex(data, start + topDict.charStrings);
        font.nGlyphs = charStringsIndex.objects.length;
    }
    var charset = parseCFFCharset(data, start + topDict.charset, font.nGlyphs, stringIndex.objects);
    if (topDict.encoding === 0) {
        font.cffEncoding = new CffEncoding(cffStandardEncoding, charset);
    } else if (topDict.encoding === 1) {
        font.cffEncoding = new CffEncoding(cffExpertEncoding, charset);
    } else {
        font.cffEncoding = parseCFFEncoding(data, start + topDict.encoding, charset);
    }
    font.encoding = font.encoding || font.cffEncoding;
    font.glyphs = new glyphset.GlyphSet(font);
    if (opt.lowMemory) {
        font._push = function(i) {
            var charString = getCffIndexObject(i, charStringsIndex.offsets, data, start + topDict.charStrings);
            font.glyphs.push(i, glyphset.cffGlyphLoader(font, i, parseCFFCharstring, charString));
        };
    } else {
        for (var i = 0; i < font.nGlyphs; i += 1) {
            var charString = charStringsIndex.objects[i];
            font.glyphs.push(i, glyphset.cffGlyphLoader(font, i, parseCFFCharstring, charString));
        }
    }
}
function encodeString(s, strings) {
    var sid;
    var i = cffStandardStrings.indexOf(s);
    if (i >= 0) {
        sid = i;
    }
    i = strings.indexOf(s);
    if (i >= 0) {
        sid = i + cffStandardStrings.length;
    } else {
        sid = cffStandardStrings.length + strings.length;
        strings.push(s);
    }
    return sid;
}
function makeHeader() {
    return new table.Record('Header', [
        {name: 'major', type: 'Card8', value: 1},
        {name: 'minor', type: 'Card8', value: 0},
        {name: 'hdrSize', type: 'Card8', value: 4},
        {name: 'major', type: 'Card8', value: 1}
    ]);
}
function makeNameIndex(fontNames) {
    var t = new table.Record('Name INDEX', [
        {name: 'names', type: 'INDEX', value: []}
    ]);
    t.names = [];
    for (var i = 0; i < fontNames.length; i += 1) {
        t.names.push({name: 'name_' + i, type: 'NAME', value: fontNames[i]});
    }
    return t;
}
function makeDict(meta, attrs, strings) {
    var m = {};
    for (var i = 0; i < meta.length; i += 1) {
        var entry = meta[i];
        var value = attrs[entry.name];
        if (value !== undefined && !equals(value, entry.value)) {
            if (entry.type === 'SID') {
                value = encodeString(value, strings);
            }
            m[entry.op] = {name: entry.name, type: entry.type, value: value};
        }
    }
    return m;
}
function makeTopDict(attrs, strings) {
    var t = new table.Record('Top DICT', [
        {name: 'dict', type: 'DICT', value: {}}
    ]);
    t.dict = makeDict(TOP_DICT_META, attrs, strings);
    return t;
}
function makeTopDictIndex(topDict) {
    var t = new table.Record('Top DICT INDEX', [
        {name: 'topDicts', type: 'INDEX', value: []}
    ]);
    t.topDicts = [{name: 'topDict_0', type: 'TABLE', value: topDict}];
    return t;
}
function makeStringIndex(strings) {
    var t = new table.Record('String INDEX', [
        {name: 'strings', type: 'INDEX', value: []}
    ]);
    t.strings = [];
    for (var i = 0; i < strings.length; i += 1) {
        t.strings.push({name: 'string_' + i, type: 'STRING', value: strings[i]});
    }
    return t;
}
function makeGlobalSubrIndex() {
    return new table.Record('Global Subr INDEX', [
        {name: 'subrs', type: 'INDEX', value: []}
    ]);
}
function makeCharsets(glyphNames, strings) {
    var t = new table.Record('Charsets', [
        {name: 'format', type: 'Card8', value: 0}
    ]);
    for (var i = 0; i < glyphNames.length; i += 1) {
        var glyphName = glyphNames[i];
        var glyphSID = encodeString(glyphName, strings);
        t.fields.push({name: 'glyph_' + i, type: 'SID', value: glyphSID});
    }
    return t;
}
function glyphToOps(glyph) {
    var ops = [];
    var path = glyph.path;
    ops.push({name: 'width', type: 'NUMBER', value: glyph.advanceWidth});
    var x = 0;
    var y = 0;
    for (var i = 0; i < path.commands.length; i += 1) {
        var dx = (void 0);
        var dy = (void 0);
        var cmd = path.commands[i];
        if (cmd.type === 'Q') {
            var _13 = 1 / 3;
            var _23 = 2 / 3;
            cmd = {
                type: 'C',
                x: cmd.x,
                y: cmd.y,
                x1: Math.round(_13 * x + _23 * cmd.x1),
                y1: Math.round(_13 * y + _23 * cmd.y1),
                x2: Math.round(_13 * cmd.x + _23 * cmd.x1),
                y2: Math.round(_13 * cmd.y + _23 * cmd.y1)
            };
        }
        if (cmd.type === 'M') {
            dx = Math.round(cmd.x - x);
            dy = Math.round(cmd.y - y);
            ops.push({name: 'dx', type: 'NUMBER', value: dx});
            ops.push({name: 'dy', type: 'NUMBER', value: dy});
            ops.push({name: 'rmoveto', type: 'OP', value: 21});
            x = Math.round(cmd.x);
            y = Math.round(cmd.y);
        } else if (cmd.type === 'L') {
            dx = Math.round(cmd.x - x);
            dy = Math.round(cmd.y - y);
            ops.push({name: 'dx', type: 'NUMBER', value: dx});
            ops.push({name: 'dy', type: 'NUMBER', value: dy});
            ops.push({name: 'rlineto', type: 'OP', value: 5});
            x = Math.round(cmd.x);
            y = Math.round(cmd.y);
        } else if (cmd.type === 'C') {
            var dx1 = Math.round(cmd.x1 - x);
            var dy1 = Math.round(cmd.y1 - y);
            var dx2 = Math.round(cmd.x2 - cmd.x1);
            var dy2 = Math.round(cmd.y2 - cmd.y1);
            dx = Math.round(cmd.x - cmd.x2);
            dy = Math.round(cmd.y - cmd.y2);
            ops.push({name: 'dx1', type: 'NUMBER', value: dx1});
            ops.push({name: 'dy1', type: 'NUMBER', value: dy1});
            ops.push({name: 'dx2', type: 'NUMBER', value: dx2});
            ops.push({name: 'dy2', type: 'NUMBER', value: dy2});
            ops.push({name: 'dx', type: 'NUMBER', value: dx});
            ops.push({name: 'dy', type: 'NUMBER', value: dy});
            ops.push({name: 'rrcurveto', type: 'OP', value: 8});
            x = Math.round(cmd.x);
            y = Math.round(cmd.y);
        }
    }
    ops.push({name: 'endchar', type: 'OP', value: 14});
    return ops;
}
function makeCharStringsIndex(glyphs) {
    var t = new table.Record('CharStrings INDEX', [
        {name: 'charStrings', type: 'INDEX', value: []}
    ]);
    for (var i = 0; i < glyphs.length; i += 1) {
        var glyph = glyphs.get(i);
        var ops = glyphToOps(glyph);
        t.charStrings.push({name: glyph.name, type: 'CHARSTRING', value: ops});
    }
    return t;
}
function makePrivateDict(attrs, strings) {
    var t = new table.Record('Private DICT', [
        {name: 'dict', type: 'DICT', value: {}}
    ]);
    t.dict = makeDict(PRIVATE_DICT_META, attrs, strings);
    return t;
}
function makeCFFTable(glyphs, options) {
    var t = new table.Table('CFF ', [
        {name: 'header', type: 'RECORD'},
        {name: 'nameIndex', type: 'RECORD'},
        {name: 'topDictIndex', type: 'RECORD'},
        {name: 'stringIndex', type: 'RECORD'},
        {name: 'globalSubrIndex', type: 'RECORD'},
        {name: 'charsets', type: 'RECORD'},
        {name: 'charStringsIndex', type: 'RECORD'},
        {name: 'privateDict', type: 'RECORD'}
    ]);
    var fontScale = 1 / options.unitsPerEm;
    var attrs = {
        version: options.version,
        fullName: options.fullName,
        familyName: options.familyName,
        weight: options.weightName,
        fontBBox: options.fontBBox || [0, 0, 0, 0],
        fontMatrix: [fontScale, 0, 0, fontScale, 0, 0],
        charset: 999,
        encoding: 0,
        charStrings: 999,
        private: [0, 999]
    };
    var privateAttrs = {};
    var glyphNames = [];
    var glyph;
    for (var i = 1; i < glyphs.length; i += 1) {
        glyph = glyphs.get(i);
        glyphNames.push(glyph.name);
    }
    var strings = [];
    t.header = makeHeader();
    t.nameIndex = makeNameIndex([options.postScriptName]);
    var topDict = makeTopDict(attrs, strings);
    t.topDictIndex = makeTopDictIndex(topDict);
    t.globalSubrIndex = makeGlobalSubrIndex();
    t.charsets = makeCharsets(glyphNames, strings);
    t.charStringsIndex = makeCharStringsIndex(glyphs);
    t.privateDict = makePrivateDict(privateAttrs, strings);
    t.stringIndex = makeStringIndex(strings);
    var startOffset = t.header.sizeOf() +
        t.nameIndex.sizeOf() +
        t.topDictIndex.sizeOf() +
        t.stringIndex.sizeOf() +
        t.globalSubrIndex.sizeOf();
    attrs.charset = startOffset;
    attrs.encoding = 0;
    attrs.charStrings = attrs.charset + t.charsets.sizeOf();
    attrs.private[1] = attrs.charStrings + t.charStringsIndex.sizeOf();
    topDict = makeTopDict(attrs, strings);
    t.topDictIndex = makeTopDictIndex(topDict);
    return t;
}
var cff = { parse: parseCFFTable, make: makeCFFTable };
function parseHeadTable(data, start) {
    var head = {};
    var p = new parse.Parser(data, start);
    head.version = p.parseVersion();
    head.fontRevision = Math.round(p.parseFixed() * 1000) / 1000;
    head.checkSumAdjustment = p.parseULong();
    head.magicNumber = p.parseULong();
    check.argument(head.magicNumber === 0x5F0F3CF5, 'Font header has wrong magic number.');
    head.flags = p.parseUShort();
    head.unitsPerEm = p.parseUShort();
    head.created = p.parseLongDateTime();
    head.modified = p.parseLongDateTime();
    head.xMin = p.parseShort();
    head.yMin = p.parseShort();
    head.xMax = p.parseShort();
    head.yMax = p.parseShort();
    head.macStyle = p.parseUShort();
    head.lowestRecPPEM = p.parseUShort();
    head.fontDirectionHint = p.parseShort();
    head.indexToLocFormat = p.parseShort();
    head.glyphDataFormat = p.parseShort();
    return head;
}
function makeHeadTable(options) {
    var timestamp = Math.round(new Date().getTime() / 1000) + 2082844800;
    var createdTimestamp = timestamp;
    if (options.createdTimestamp) {
        createdTimestamp = options.createdTimestamp + 2082844800;
    }
    return new table.Table('head', [
        {name: 'version', type: 'FIXED', value: 0x00010000},
        {name: 'fontRevision', type: 'FIXED', value: 0x00010000},
        {name: 'checkSumAdjustment', type: 'ULONG', value: 0},
        {name: 'magicNumber', type: 'ULONG', value: 0x5F0F3CF5},
        {name: 'flags', type: 'USHORT', value: 0},
        {name: 'unitsPerEm', type: 'USHORT', value: 1000},
        {name: 'created', type: 'LONGDATETIME', value: createdTimestamp},
        {name: 'modified', type: 'LONGDATETIME', value: timestamp},
        {name: 'xMin', type: 'SHORT', value: 0},
        {name: 'yMin', type: 'SHORT', value: 0},
        {name: 'xMax', type: 'SHORT', value: 0},
        {name: 'yMax', type: 'SHORT', value: 0},
        {name: 'macStyle', type: 'USHORT', value: 0},
        {name: 'lowestRecPPEM', type: 'USHORT', value: 0},
        {name: 'fontDirectionHint', type: 'SHORT', value: 2},
        {name: 'indexToLocFormat', type: 'SHORT', value: 0},
        {name: 'glyphDataFormat', type: 'SHORT', value: 0}
    ], options);
}
var head = { parse: parseHeadTable, make: makeHeadTable };
function parseHheaTable(data, start) {
    var hhea = {};
    var p = new parse.Parser(data, start);
    hhea.version = p.parseVersion();
    hhea.ascender = p.parseShort();
    hhea.descender = p.parseShort();
    hhea.lineGap = p.parseShort();
    hhea.advanceWidthMax = p.parseUShort();
    hhea.minLeftSideBearing = p.parseShort();
    hhea.minRightSideBearing = p.parseShort();
    hhea.xMaxExtent = p.parseShort();
    hhea.caretSlopeRise = p.parseShort();
    hhea.caretSlopeRun = p.parseShort();
    hhea.caretOffset = p.parseShort();
    p.relativeOffset += 8;
    hhea.metricDataFormat = p.parseShort();
    hhea.numberOfHMetrics = p.parseUShort();
    return hhea;
}
function makeHheaTable(options) {
    return new table.Table('hhea', [
        {name: 'version', type: 'FIXED', value: 0x00010000},
        {name: 'ascender', type: 'FWORD', value: 0},
        {name: 'descender', type: 'FWORD', value: 0},
        {name: 'lineGap', type: 'FWORD', value: 0},
        {name: 'advanceWidthMax', type: 'UFWORD', value: 0},
        {name: 'minLeftSideBearing', type: 'FWORD', value: 0},
        {name: 'minRightSideBearing', type: 'FWORD', value: 0},
        {name: 'xMaxExtent', type: 'FWORD', value: 0},
        {name: 'caretSlopeRise', type: 'SHORT', value: 1},
        {name: 'caretSlopeRun', type: 'SHORT', value: 0},
        {name: 'caretOffset', type: 'SHORT', value: 0},
        {name: 'reserved1', type: 'SHORT', value: 0},
        {name: 'reserved2', type: 'SHORT', value: 0},
        {name: 'reserved3', type: 'SHORT', value: 0},
        {name: 'reserved4', type: 'SHORT', value: 0},
        {name: 'metricDataFormat', type: 'SHORT', value: 0},
        {name: 'numberOfHMetrics', type: 'USHORT', value: 0}
    ], options);
}
var hhea = { parse: parseHheaTable, make: makeHheaTable };
function parseHmtxTableAll(data, start, numMetrics, numGlyphs, glyphs) {
    var advanceWidth;
    var leftSideBearing;
    var p = new parse.Parser(data, start);
    for (var i = 0; i < numGlyphs; i += 1) {
        if (i < numMetrics) {
            advanceWidth = p.parseUShort();
            leftSideBearing = p.parseShort();
        }
        var glyph = glyphs.get(i);
        glyph.advanceWidth = advanceWidth;
        glyph.leftSideBearing = leftSideBearing;
    }
}
function parseHmtxTableOnLowMemory(font, data, start, numMetrics, numGlyphs) {
    font._hmtxTableData = {};
    var advanceWidth;
    var leftSideBearing;
    var p = new parse.Parser(data, start);
    for (var i = 0; i < numGlyphs; i += 1) {
        if (i < numMetrics) {
            advanceWidth = p.parseUShort();
            leftSideBearing = p.parseShort();
        }
        font._hmtxTableData[i] = {
            advanceWidth: advanceWidth,
            leftSideBearing: leftSideBearing
        };
    }
}
function parseHmtxTable(font, data, start, numMetrics, numGlyphs, glyphs, opt) {
    if (opt.lowMemory)
        { parseHmtxTableOnLowMemory(font, data, start, numMetrics, numGlyphs); }
    else
        { parseHmtxTableAll(data, start, numMetrics, numGlyphs, glyphs); }
}
function makeHmtxTable(glyphs) {
    var t = new table.Table('hmtx', []);
    for (var i = 0; i < glyphs.length; i += 1) {
        var glyph = glyphs.get(i);
        var advanceWidth = glyph.advanceWidth || 0;
        var leftSideBearing = glyph.leftSideBearing || 0;
        t.fields.push({name: 'advanceWidth_' + i, type: 'USHORT', value: advanceWidth});
        t.fields.push({name: 'leftSideBearing_' + i, type: 'SHORT', value: leftSideBearing});
    }
    return t;
}
var hmtx = { parse: parseHmtxTable, make: makeHmtxTable };
function makeLtagTable(tags) {
    var result = new table.Table('ltag', [
        {name: 'version', type: 'ULONG', value: 1},
        {name: 'flags', type: 'ULONG', value: 0},
        {name: 'numTags', type: 'ULONG', value: tags.length}
    ]);
    var stringPool = '';
    var stringPoolOffset = 12 + tags.length * 4;
    for (var i = 0; i < tags.length; ++i) {
        var pos = stringPool.indexOf(tags[i]);
        if (pos < 0) {
            pos = stringPool.length;
            stringPool += tags[i];
        }
        result.fields.push({name: 'offset ' + i, type: 'USHORT', value: stringPoolOffset + pos});
        result.fields.push({name: 'length ' + i, type: 'USHORT', value: tags[i].length});
    }
    result.fields.push({name: 'stringPool', type: 'CHARARRAY', value: stringPool});
    return result;
}
function parseLtagTable(data, start) {
    var p = new parse.Parser(data, start);
    var tableVersion = p.parseULong();
    check.argument(tableVersion === 1, 'Unsupported ltag table version.');
    p.skip('uLong', 1);
    var numTags = p.parseULong();
    var tags = [];
    for (var i = 0; i < numTags; i++) {
        var tag = '';
        var offset = start + p.parseUShort();
        var length = p.parseUShort();
        for (var j = offset; j < offset + length; ++j) {
            tag += String.fromCharCode(data.getInt8(j));
        }
        tags.push(tag);
    }
    return tags;
}
var ltag = { make: makeLtagTable, parse: parseLtagTable };
function parseMaxpTable(data, start) {
    var maxp = {};
    var p = new parse.Parser(data, start);
    maxp.version = p.parseVersion();
    maxp.numGlyphs = p.parseUShort();
    if (maxp.version === 1.0) {
        maxp.maxPoints = p.parseUShort();
        maxp.maxContours = p.parseUShort();
        maxp.maxCompositePoints = p.parseUShort();
        maxp.maxCompositeContours = p.parseUShort();
        maxp.maxZones = p.parseUShort();
        maxp.maxTwilightPoints = p.parseUShort();
        maxp.maxStorage = p.parseUShort();
        maxp.maxFunctionDefs = p.parseUShort();
        maxp.maxInstructionDefs = p.parseUShort();
        maxp.maxStackElements = p.parseUShort();
        maxp.maxSizeOfInstructions = p.parseUShort();
        maxp.maxComponentElements = p.parseUShort();
        maxp.maxComponentDepth = p.parseUShort();
    }
    return maxp;
}
function makeMaxpTable(numGlyphs) {
    return new table.Table('maxp', [
        {name: 'version', type: 'FIXED', value: 0x00005000},
        {name: 'numGlyphs', type: 'USHORT', value: numGlyphs}
    ]);
}
var maxp = { parse: parseMaxpTable, make: makeMaxpTable };
var nameTableNames = [
    'copyright',
    'fontFamily',
    'fontSubfamily',
    'uniqueID',
    'fullName',
    'version',
    'postScriptName',
    'trademark',
    'manufacturer',
    'designer',
    'description',
    'manufacturerURL',
    'designerURL',
    'license',
    'licenseURL',
    'reserved',
    'preferredFamily',
    'preferredSubfamily',
    'compatibleFullName',
    'sampleText',
    'postScriptFindFontName',
    'wwsFamily',
    'wwsSubfamily'
];
var macLanguages = {
    0: 'en',
    1: 'fr',
    2: 'de',
    3: 'it',
    4: 'nl',
    5: 'sv',
    6: 'es',
    7: 'da',
    8: 'pt',
    9: 'no',
    10: 'he',
    11: 'ja',
    12: 'ar',
    13: 'fi',
    14: 'el',
    15: 'is',
    16: 'mt',
    17: 'tr',
    18: 'hr',
    19: 'zh-Hant',
    20: 'ur',
    21: 'hi',
    22: 'th',
    23: 'ko',
    24: 'lt',
    25: 'pl',
    26: 'hu',
    27: 'es',
    28: 'lv',
    29: 'se',
    30: 'fo',
    31: 'fa',
    32: 'ru',
    33: 'zh',
    34: 'nl-BE',
    35: 'ga',
    36: 'sq',
    37: 'ro',
    38: 'cz',
    39: 'sk',
    40: 'si',
    41: 'yi',
    42: 'sr',
    43: 'mk',
    44: 'bg',
    45: 'uk',
    46: 'be',
    47: 'uz',
    48: 'kk',
    49: 'az-Cyrl',
    50: 'az-Arab',
    51: 'hy',
    52: 'ka',
    53: 'mo',
    54: 'ky',
    55: 'tg',
    56: 'tk',
    57: 'mn-CN',
    58: 'mn',
    59: 'ps',
    60: 'ks',
    61: 'ku',
    62: 'sd',
    63: 'bo',
    64: 'ne',
    65: 'sa',
    66: 'mr',
    67: 'bn',
    68: 'as',
    69: 'gu',
    70: 'pa',
    71: 'or',
    72: 'ml',
    73: 'kn',
    74: 'ta',
    75: 'te',
    76: 'si',
    77: 'my',
    78: 'km',
    79: 'lo',
    80: 'vi',
    81: 'id',
    82: 'tl',
    83: 'ms',
    84: 'ms-Arab',
    85: 'am',
    86: 'ti',
    87: 'om',
    88: 'so',
    89: 'sw',
    90: 'rw',
    91: 'rn',
    92: 'ny',
    93: 'mg',
    94: 'eo',
    128: 'cy',
    129: 'eu',
    130: 'ca',
    131: 'la',
    132: 'qu',
    133: 'gn',
    134: 'ay',
    135: 'tt',
    136: 'ug',
    137: 'dz',
    138: 'jv',
    139: 'su',
    140: 'gl',
    141: 'af',
    142: 'br',
    143: 'iu',
    144: 'gd',
    145: 'gv',
    146: 'ga',
    147: 'to',
    148: 'el-polyton',
    149: 'kl',
    150: 'az',
    151: 'nn'
};
var macLanguageToScript = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
    10: 5,
    11: 1,
    12: 4,
    13: 0,
    14: 6,
    15: 0,
    16: 0,
    17: 0,
    18: 0,
    19: 2,
    20: 4,
    21: 9,
    22: 21,
    23: 3,
    24: 29,
    25: 29,
    26: 29,
    27: 29,
    28: 29,
    29: 0,
    30: 0,
    31: 4,
    32: 7,
    33: 25,
    34: 0,
    35: 0,
    36: 0,
    37: 0,
    38: 29,
    39: 29,
    40: 0,
    41: 5,
    42: 7,
    43: 7,
    44: 7,
    45: 7,
    46: 7,
    47: 7,
    48: 7,
    49: 7,
    50: 4,
    51: 24,
    52: 23,
    53: 7,
    54: 7,
    55: 7,
    56: 7,
    57: 27,
    58: 7,
    59: 4,
    60: 4,
    61: 4,
    62: 4,
    63: 26,
    64: 9,
    65: 9,
    66: 9,
    67: 13,
    68: 13,
    69: 11,
    70: 10,
    71: 12,
    72: 17,
    73: 16,
    74: 14,
    75: 15,
    76: 18,
    77: 19,
    78: 20,
    79: 22,
    80: 30,
    81: 0,
    82: 0,
    83: 0,
    84: 4,
    85: 28,
    86: 28,
    87: 28,
    88: 0,
    89: 0,
    90: 0,
    91: 0,
    92: 0,
    93: 0,
    94: 0,
    128: 0,
    129: 0,
    130: 0,
    131: 0,
    132: 0,
    133: 0,
    134: 0,
    135: 7,
    136: 4,
    137: 26,
    138: 0,
    139: 0,
    140: 0,
    141: 0,
    142: 0,
    143: 28,
    144: 0,
    145: 0,
    146: 0,
    147: 0,
    148: 6,
    149: 0,
    150: 0,
    151: 0
};
var windowsLanguages = {
    0x0436: 'af',
    0x041C: 'sq',
    0x0484: 'gsw',
    0x045E: 'am',
    0x1401: 'ar-DZ',
    0x3C01: 'ar-BH',
    0x0C01: 'ar',
    0x0801: 'ar-IQ',
    0x2C01: 'ar-JO',
    0x3401: 'ar-KW',
    0x3001: 'ar-LB',
    0x1001: 'ar-LY',
    0x1801: 'ary',
    0x2001: 'ar-OM',
    0x4001: 'ar-QA',
    0x0401: 'ar-SA',
    0x2801: 'ar-SY',
    0x1C01: 'aeb',
    0x3801: 'ar-AE',
    0x2401: 'ar-YE',
    0x042B: 'hy',
    0x044D: 'as',
    0x082C: 'az-Cyrl',
    0x042C: 'az',
    0x046D: 'ba',
    0x042D: 'eu',
    0x0423: 'be',
    0x0845: 'bn',
    0x0445: 'bn-IN',
    0x201A: 'bs-Cyrl',
    0x141A: 'bs',
    0x047E: 'br',
    0x0402: 'bg',
    0x0403: 'ca',
    0x0C04: 'zh-HK',
    0x1404: 'zh-MO',
    0x0804: 'zh',
    0x1004: 'zh-SG',
    0x0404: 'zh-TW',
    0x0483: 'co',
    0x041A: 'hr',
    0x101A: 'hr-BA',
    0x0405: 'cs',
    0x0406: 'da',
    0x048C: 'prs',
    0x0465: 'dv',
    0x0813: 'nl-BE',
    0x0413: 'nl',
    0x0C09: 'en-AU',
    0x2809: 'en-BZ',
    0x1009: 'en-CA',
    0x2409: 'en-029',
    0x4009: 'en-IN',
    0x1809: 'en-IE',
    0x2009: 'en-JM',
    0x4409: 'en-MY',
    0x1409: 'en-NZ',
    0x3409: 'en-PH',
    0x4809: 'en-SG',
    0x1C09: 'en-ZA',
    0x2C09: 'en-TT',
    0x0809: 'en-GB',
    0x0409: 'en',
    0x3009: 'en-ZW',
    0x0425: 'et',
    0x0438: 'fo',
    0x0464: 'fil',
    0x040B: 'fi',
    0x080C: 'fr-BE',
    0x0C0C: 'fr-CA',
    0x040C: 'fr',
    0x140C: 'fr-LU',
    0x180C: 'fr-MC',
    0x100C: 'fr-CH',
    0x0462: 'fy',
    0x0456: 'gl',
    0x0437: 'ka',
    0x0C07: 'de-AT',
    0x0407: 'de',
    0x1407: 'de-LI',
    0x1007: 'de-LU',
    0x0807: 'de-CH',
    0x0408: 'el',
    0x046F: 'kl',
    0x0447: 'gu',
    0x0468: 'ha',
    0x040D: 'he',
    0x0439: 'hi',
    0x040E: 'hu',
    0x040F: 'is',
    0x0470: 'ig',
    0x0421: 'id',
    0x045D: 'iu',
    0x085D: 'iu-Latn',
    0x083C: 'ga',
    0x0434: 'xh',
    0x0435: 'zu',
    0x0410: 'it',
    0x0810: 'it-CH',
    0x0411: 'ja',
    0x044B: 'kn',
    0x043F: 'kk',
    0x0453: 'km',
    0x0486: 'quc',
    0x0487: 'rw',
    0x0441: 'sw',
    0x0457: 'kok',
    0x0412: 'ko',
    0x0440: 'ky',
    0x0454: 'lo',
    0x0426: 'lv',
    0x0427: 'lt',
    0x082E: 'dsb',
    0x046E: 'lb',
    0x042F: 'mk',
    0x083E: 'ms-BN',
    0x043E: 'ms',
    0x044C: 'ml',
    0x043A: 'mt',
    0x0481: 'mi',
    0x047A: 'arn',
    0x044E: 'mr',
    0x047C: 'moh',
    0x0450: 'mn',
    0x0850: 'mn-CN',
    0x0461: 'ne',
    0x0414: 'nb',
    0x0814: 'nn',
    0x0482: 'oc',
    0x0448: 'or',
    0x0463: 'ps',
    0x0415: 'pl',
    0x0416: 'pt',
    0x0816: 'pt-PT',
    0x0446: 'pa',
    0x046B: 'qu-BO',
    0x086B: 'qu-EC',
    0x0C6B: 'qu',
    0x0418: 'ro',
    0x0417: 'rm',
    0x0419: 'ru',
    0x243B: 'smn',
    0x103B: 'smj-NO',
    0x143B: 'smj',
    0x0C3B: 'se-FI',
    0x043B: 'se',
    0x083B: 'se-SE',
    0x203B: 'sms',
    0x183B: 'sma-NO',
    0x1C3B: 'sms',
    0x044F: 'sa',
    0x1C1A: 'sr-Cyrl-BA',
    0x0C1A: 'sr',
    0x181A: 'sr-Latn-BA',
    0x081A: 'sr-Latn',
    0x046C: 'nso',
    0x0432: 'tn',
    0x045B: 'si',
    0x041B: 'sk',
    0x0424: 'sl',
    0x2C0A: 'es-AR',
    0x400A: 'es-BO',
    0x340A: 'es-CL',
    0x240A: 'es-CO',
    0x140A: 'es-CR',
    0x1C0A: 'es-DO',
    0x300A: 'es-EC',
    0x440A: 'es-SV',
    0x100A: 'es-GT',
    0x480A: 'es-HN',
    0x080A: 'es-MX',
    0x4C0A: 'es-NI',
    0x180A: 'es-PA',
    0x3C0A: 'es-PY',
    0x280A: 'es-PE',
    0x500A: 'es-PR',
    0x0C0A: 'es',
    0x040A: 'es',
    0x540A: 'es-US',
    0x380A: 'es-UY',
    0x200A: 'es-VE',
    0x081D: 'sv-FI',
    0x041D: 'sv',
    0x045A: 'syr',
    0x0428: 'tg',
    0x085F: 'tzm',
    0x0449: 'ta',
    0x0444: 'tt',
    0x044A: 'te',
    0x041E: 'th',
    0x0451: 'bo',
    0x041F: 'tr',
    0x0442: 'tk',
    0x0480: 'ug',
    0x0422: 'uk',
    0x042E: 'hsb',
    0x0420: 'ur',
    0x0843: 'uz-Cyrl',
    0x0443: 'uz',
    0x042A: 'vi',
    0x0452: 'cy',
    0x0488: 'wo',
    0x0485: 'sah',
    0x0478: 'ii',
    0x046A: 'yo'
};
function getLanguageCode(platformID, languageID, ltag) {
    switch (platformID) {
        case 0:
            if (languageID === 0xFFFF) {
                return 'und';
            } else if (ltag) {
                return ltag[languageID];
            }
            break;
        case 1:
            return macLanguages[languageID];
        case 3:
            return windowsLanguages[languageID];
    }
    return undefined;
}
var utf16 = 'utf-16';
var macScriptEncodings = {
    0: 'macintosh',
    1: 'x-mac-japanese',
    2: 'x-mac-chinesetrad',
    3: 'x-mac-korean',
    6: 'x-mac-greek',
    7: 'x-mac-cyrillic',
    9: 'x-mac-devanagai',
    10: 'x-mac-gurmukhi',
    11: 'x-mac-gujarati',
    12: 'x-mac-oriya',
    13: 'x-mac-bengali',
    14: 'x-mac-tamil',
    15: 'x-mac-telugu',
    16: 'x-mac-kannada',
    17: 'x-mac-malayalam',
    18: 'x-mac-sinhalese',
    19: 'x-mac-burmese',
    20: 'x-mac-khmer',
    21: 'x-mac-thai',
    22: 'x-mac-lao',
    23: 'x-mac-georgian',
    24: 'x-mac-armenian',
    25: 'x-mac-chinesesimp',
    26: 'x-mac-tibetan',
    27: 'x-mac-mongolian',
    28: 'x-mac-ethiopic',
    29: 'x-mac-ce',
    30: 'x-mac-vietnamese',
    31: 'x-mac-extarabic'
};
var macLanguageEncodings = {
    15: 'x-mac-icelandic',
    17: 'x-mac-turkish',
    18: 'x-mac-croatian',
    24: 'x-mac-ce',
    25: 'x-mac-ce',
    26: 'x-mac-ce',
    27: 'x-mac-ce',
    28: 'x-mac-ce',
    30: 'x-mac-icelandic',
    37: 'x-mac-romanian',
    38: 'x-mac-ce',
    39: 'x-mac-ce',
    40: 'x-mac-ce',
    143: 'x-mac-inuit',
    146: 'x-mac-gaelic'
};
function getEncoding(platformID, encodingID, languageID) {
    switch (platformID) {
        case 0:
            return utf16;
        case 1:
            return macLanguageEncodings[languageID] || macScriptEncodings[encodingID];
        case 3:
            if (encodingID === 1 || encodingID === 10) {
                return utf16;
            }
            break;
    }
    return undefined;
}
function parseNameTable(data, start, ltag) {
    var name = {};
    var p = new parse.Parser(data, start);
    var format = p.parseUShort();
    var count = p.parseUShort();
    var stringOffset = p.offset + p.parseUShort();
    for (var i = 0; i < count; i++) {
        var platformID = p.parseUShort();
        var encodingID = p.parseUShort();
        var languageID = p.parseUShort();
        var nameID = p.parseUShort();
        var property = nameTableNames[nameID] || nameID;
        var byteLength = p.parseUShort();
        var offset = p.parseUShort();
        var language = getLanguageCode(platformID, languageID, ltag);
        var encoding = getEncoding(platformID, encodingID, languageID);
        if (encoding !== undefined && language !== undefined) {
            var text = (void 0);
            if (encoding === utf16) {
                text = decode$1.UTF16(data, stringOffset + offset, byteLength);
            } else {
                text = decode$1.MACSTRING(data, stringOffset + offset, byteLength, encoding);
            }
            if (text) {
                var translations = name[property];
                if (translations === undefined) {
                    translations = name[property] = {};
                }
                translations[language] = text;
            }
        }
    }
    if (format === 1) {
        p.parseUShort();
    }
    return name;
}
function reverseDict(dict) {
    var result = {};
    for (var key in dict) {
        result[dict[key]] = parseInt(key);
    }
    return result;
}
function makeNameRecord(platformID, encodingID, languageID, nameID, length, offset) {
    return new table.Record('NameRecord', [
        {name: 'platformID', type: 'USHORT', value: platformID},
        {name: 'encodingID', type: 'USHORT', value: encodingID},
        {name: 'languageID', type: 'USHORT', value: languageID},
        {name: 'nameID', type: 'USHORT', value: nameID},
        {name: 'length', type: 'USHORT', value: length},
        {name: 'offset', type: 'USHORT', value: offset}
    ]);
}
function findSubArray(needle, haystack) {
    var needleLength = needle.length;
    var limit = haystack.length - needleLength + 1;
    loop:
    for (var pos = 0; pos < limit; pos++) {
        for (; pos < limit; pos++) {
            for (var k = 0; k < needleLength; k++) {
                if (haystack[pos + k] !== needle[k]) {
                    continue loop;
                }
            }
            return pos;
        }
    }
    return -1;
}
function addStringToPool(s, pool) {
    var offset = findSubArray(s, pool);
    if (offset < 0) {
        offset = pool.length;
        var i = 0;
        var len = s.length;
        for (; i < len; ++i) {
            pool.push(s[i]);
        }
    }
    return offset;
}
function makeNameTable(names, ltag) {
    var nameID;
    var nameIDs = [];
    var namesWithNumericKeys = {};
    var nameTableIds = reverseDict(nameTableNames);
    for (var key in names) {
        var id = nameTableIds[key];
        if (id === undefined) {
            id = key;
        }
        nameID = parseInt(id);
        if (isNaN(nameID)) {
            throw new Error('Name table entry "' + key + '" does not exist, see nameTableNames for complete list.');
        }
        namesWithNumericKeys[nameID] = names[key];
        nameIDs.push(nameID);
    }
    var macLanguageIds = reverseDict(macLanguages);
    var windowsLanguageIds = reverseDict(windowsLanguages);
    var nameRecords = [];
    var stringPool = [];
    for (var i = 0; i < nameIDs.length; i++) {
        nameID = nameIDs[i];
        var translations = namesWithNumericKeys[nameID];
        for (var lang in translations) {
            var text = translations[lang];
            var macPlatform = 1;
            var macLanguage = macLanguageIds[lang];
            var macScript = macLanguageToScript[macLanguage];
            var macEncoding = getEncoding(macPlatform, macScript, macLanguage);
            var macName = encode$1.MACSTRING(text, macEncoding);
            if (macName === undefined) {
                macPlatform = 0;
                macLanguage = ltag.indexOf(lang);
                if (macLanguage < 0) {
                    macLanguage = ltag.length;
                    ltag.push(lang);
                }
                macScript = 4;
                macName = encode$1.UTF16(text);
            }
            var macNameOffset = addStringToPool(macName, stringPool);
            nameRecords.push(makeNameRecord(macPlatform, macScript, macLanguage,
                                            nameID, macName.length, macNameOffset));
            var winLanguage = windowsLanguageIds[lang];
            if (winLanguage !== undefined) {
                var winName = encode$1.UTF16(text);
                var winNameOffset = addStringToPool(winName, stringPool);
                nameRecords.push(makeNameRecord(3, 1, winLanguage,
                                                nameID, winName.length, winNameOffset));
            }
        }
    }
    nameRecords.sort(function(a, b) {
        return ((a.platformID - b.platformID) ||
                (a.encodingID - b.encodingID) ||
                (a.languageID - b.languageID) ||
                (a.nameID - b.nameID));
    });
    var t = new table.Table('name', [
        {name: 'format', type: 'USHORT', value: 0},
        {name: 'count', type: 'USHORT', value: nameRecords.length},
        {name: 'stringOffset', type: 'USHORT', value: 6 + nameRecords.length * 12}
    ]);
    for (var r = 0; r < nameRecords.length; r++) {
        t.fields.push({name: 'record_' + r, type: 'RECORD', value: nameRecords[r]});
    }
    t.fields.push({name: 'strings', type: 'LITERAL', value: stringPool});
    return t;
}
var _name = { parse: parseNameTable, make: makeNameTable };
var unicodeRanges = [
    {begin: 0x0000, end: 0x007F},
    {begin: 0x0080, end: 0x00FF},
    {begin: 0x0100, end: 0x017F},
    {begin: 0x0180, end: 0x024F},
    {begin: 0x0250, end: 0x02AF},
    {begin: 0x02B0, end: 0x02FF},
    {begin: 0x0300, end: 0x036F},
    {begin: 0x0370, end: 0x03FF},
    {begin: 0x2C80, end: 0x2CFF},
    {begin: 0x0400, end: 0x04FF},
    {begin: 0x0530, end: 0x058F},
    {begin: 0x0590, end: 0x05FF},
    {begin: 0xA500, end: 0xA63F},
    {begin: 0x0600, end: 0x06FF},
    {begin: 0x07C0, end: 0x07FF},
    {begin: 0x0900, end: 0x097F},
    {begin: 0x0980, end: 0x09FF},
    {begin: 0x0A00, end: 0x0A7F},
    {begin: 0x0A80, end: 0x0AFF},
    {begin: 0x0B00, end: 0x0B7F},
    {begin: 0x0B80, end: 0x0BFF},
    {begin: 0x0C00, end: 0x0C7F},
    {begin: 0x0C80, end: 0x0CFF},
    {begin: 0x0D00, end: 0x0D7F},
    {begin: 0x0E00, end: 0x0E7F},
    {begin: 0x0E80, end: 0x0EFF},
    {begin: 0x10A0, end: 0x10FF},
    {begin: 0x1B00, end: 0x1B7F},
    {begin: 0x1100, end: 0x11FF},
    {begin: 0x1E00, end: 0x1EFF},
    {begin: 0x1F00, end: 0x1FFF},
    {begin: 0x2000, end: 0x206F},
    {begin: 0x2070, end: 0x209F},
    {begin: 0x20A0, end: 0x20CF},
    {begin: 0x20D0, end: 0x20FF},
    {begin: 0x2100, end: 0x214F},
    {begin: 0x2150, end: 0x218F},
    {begin: 0x2190, end: 0x21FF},
    {begin: 0x2200, end: 0x22FF},
    {begin: 0x2300, end: 0x23FF},
    {begin: 0x2400, end: 0x243F},
    {begin: 0x2440, end: 0x245F},
    {begin: 0x2460, end: 0x24FF},
    {begin: 0x2500, end: 0x257F},
    {begin: 0x2580, end: 0x259F},
    {begin: 0x25A0, end: 0x25FF},
    {begin: 0x2600, end: 0x26FF},
    {begin: 0x2700, end: 0x27BF},
    {begin: 0x3000, end: 0x303F},
    {begin: 0x3040, end: 0x309F},
    {begin: 0x30A0, end: 0x30FF},
    {begin: 0x3100, end: 0x312F},
    {begin: 0x3130, end: 0x318F},
    {begin: 0xA840, end: 0xA87F},
    {begin: 0x3200, end: 0x32FF},
    {begin: 0x3300, end: 0x33FF},
    {begin: 0xAC00, end: 0xD7AF},
    {begin: 0xD800, end: 0xDFFF},
    {begin: 0x10900, end: 0x1091F},
    {begin: 0x4E00, end: 0x9FFF},
    {begin: 0xE000, end: 0xF8FF},
    {begin: 0x31C0, end: 0x31EF},
    {begin: 0xFB00, end: 0xFB4F},
    {begin: 0xFB50, end: 0xFDFF},
    {begin: 0xFE20, end: 0xFE2F},
    {begin: 0xFE10, end: 0xFE1F},
    {begin: 0xFE50, end: 0xFE6F},
    {begin: 0xFE70, end: 0xFEFF},
    {begin: 0xFF00, end: 0xFFEF},
    {begin: 0xFFF0, end: 0xFFFF},
    {begin: 0x0F00, end: 0x0FFF},
    {begin: 0x0700, end: 0x074F},
    {begin: 0x0780, end: 0x07BF},
    {begin: 0x0D80, end: 0x0DFF},
    {begin: 0x1000, end: 0x109F},
    {begin: 0x1200, end: 0x137F},
    {begin: 0x13A0, end: 0x13FF},
    {begin: 0x1400, end: 0x167F},
    {begin: 0x1680, end: 0x169F},
    {begin: 0x16A0, end: 0x16FF},
    {begin: 0x1780, end: 0x17FF},
    {begin: 0x1800, end: 0x18AF},
    {begin: 0x2800, end: 0x28FF},
    {begin: 0xA000, end: 0xA48F},
    {begin: 0x1700, end: 0x171F},
    {begin: 0x10300, end: 0x1032F},
    {begin: 0x10330, end: 0x1034F},
    {begin: 0x10400, end: 0x1044F},
    {begin: 0x1D000, end: 0x1D0FF},
    {begin: 0x1D400, end: 0x1D7FF},
    {begin: 0xFF000, end: 0xFFFFD},
    {begin: 0xFE00, end: 0xFE0F},
    {begin: 0xE0000, end: 0xE007F},
    {begin: 0x1900, end: 0x194F},
    {begin: 0x1950, end: 0x197F},
    {begin: 0x1980, end: 0x19DF},
    {begin: 0x1A00, end: 0x1A1F},
    {begin: 0x2C00, end: 0x2C5F},
    {begin: 0x2D30, end: 0x2D7F},
    {begin: 0x4DC0, end: 0x4DFF},
    {begin: 0xA800, end: 0xA82F},
    {begin: 0x10000, end: 0x1007F},
    {begin: 0x10140, end: 0x1018F},
    {begin: 0x10380, end: 0x1039F},
    {begin: 0x103A0, end: 0x103DF},
    {begin: 0x10450, end: 0x1047F},
    {begin: 0x10480, end: 0x104AF},
    {begin: 0x10800, end: 0x1083F},
    {begin: 0x10A00, end: 0x10A5F},
    {begin: 0x1D300, end: 0x1D35F},
    {begin: 0x12000, end: 0x123FF},
    {begin: 0x1D360, end: 0x1D37F},
    {begin: 0x1B80, end: 0x1BBF},
    {begin: 0x1C00, end: 0x1C4F},
    {begin: 0x1C50, end: 0x1C7F},
    {begin: 0xA880, end: 0xA8DF},
    {begin: 0xA900, end: 0xA92F},
    {begin: 0xA930, end: 0xA95F},
    {begin: 0xAA00, end: 0xAA5F},
    {begin: 0x10190, end: 0x101CF},
    {begin: 0x101D0, end: 0x101FF},
    {begin: 0x102A0, end: 0x102DF},
    {begin: 0x1F030, end: 0x1F09F}
];
function getUnicodeRange(unicode) {
    for (var i = 0; i < unicodeRanges.length; i += 1) {
        var range = unicodeRanges[i];
        if (unicode >= range.begin && unicode < range.end) {
            return i;
        }
    }
    return -1;
}
function parseOS2Table(data, start) {
    var os2 = {};
    var p = new parse.Parser(data, start);
    os2.version = p.parseUShort();
    os2.xAvgCharWidth = p.parseShort();
    os2.usWeightClass = p.parseUShort();
    os2.usWidthClass = p.parseUShort();
    os2.fsType = p.parseUShort();
    os2.ySubscriptXSize = p.parseShort();
    os2.ySubscriptYSize = p.parseShort();
    os2.ySubscriptXOffset = p.parseShort();
    os2.ySubscriptYOffset = p.parseShort();
    os2.ySuperscriptXSize = p.parseShort();
    os2.ySuperscriptYSize = p.parseShort();
    os2.ySuperscriptXOffset = p.parseShort();
    os2.ySuperscriptYOffset = p.parseShort();
    os2.yStrikeoutSize = p.parseShort();
    os2.yStrikeoutPosition = p.parseShort();
    os2.sFamilyClass = p.parseShort();
    os2.panose = [];
    for (var i = 0; i < 10; i++) {
        os2.panose[i] = p.parseByte();
    }
    os2.ulUnicodeRange1 = p.parseULong();
    os2.ulUnicodeRange2 = p.parseULong();
    os2.ulUnicodeRange3 = p.parseULong();
    os2.ulUnicodeRange4 = p.parseULong();
    os2.achVendID = String.fromCharCode(p.parseByte(), p.parseByte(), p.parseByte(), p.parseByte());
    os2.fsSelection = p.parseUShort();
    os2.usFirstCharIndex = p.parseUShort();
    os2.usLastCharIndex = p.parseUShort();
    os2.sTypoAscender = p.parseShort();
    os2.sTypoDescender = p.parseShort();
    os2.sTypoLineGap = p.parseShort();
    os2.usWinAscent = p.parseUShort();
    os2.usWinDescent = p.parseUShort();
    if (os2.version >= 1) {
        os2.ulCodePageRange1 = p.parseULong();
        os2.ulCodePageRange2 = p.parseULong();
    }
    if (os2.version >= 2) {
        os2.sxHeight = p.parseShort();
        os2.sCapHeight = p.parseShort();
        os2.usDefaultChar = p.parseUShort();
        os2.usBreakChar = p.parseUShort();
        os2.usMaxContent = p.parseUShort();
    }
    return os2;
}
function makeOS2Table(options) {
    return new table.Table('OS/2', [
        {name: 'version', type: 'USHORT', value: 0x0003},
        {name: 'xAvgCharWidth', type: 'SHORT', value: 0},
        {name: 'usWeightClass', type: 'USHORT', value: 0},
        {name: 'usWidthClass', type: 'USHORT', value: 0},
        {name: 'fsType', type: 'USHORT', value: 0},
        {name: 'ySubscriptXSize', type: 'SHORT', value: 650},
        {name: 'ySubscriptYSize', type: 'SHORT', value: 699},
        {name: 'ySubscriptXOffset', type: 'SHORT', value: 0},
        {name: 'ySubscriptYOffset', type: 'SHORT', value: 140},
        {name: 'ySuperscriptXSize', type: 'SHORT', value: 650},
        {name: 'ySuperscriptYSize', type: 'SHORT', value: 699},
        {name: 'ySuperscriptXOffset', type: 'SHORT', value: 0},
        {name: 'ySuperscriptYOffset', type: 'SHORT', value: 479},
        {name: 'yStrikeoutSize', type: 'SHORT', value: 49},
        {name: 'yStrikeoutPosition', type: 'SHORT', value: 258},
        {name: 'sFamilyClass', type: 'SHORT', value: 0},
        {name: 'bFamilyType', type: 'BYTE', value: 0},
        {name: 'bSerifStyle', type: 'BYTE', value: 0},
        {name: 'bWeight', type: 'BYTE', value: 0},
        {name: 'bProportion', type: 'BYTE', value: 0},
        {name: 'bContrast', type: 'BYTE', value: 0},
        {name: 'bStrokeVariation', type: 'BYTE', value: 0},
        {name: 'bArmStyle', type: 'BYTE', value: 0},
        {name: 'bLetterform', type: 'BYTE', value: 0},
        {name: 'bMidline', type: 'BYTE', value: 0},
        {name: 'bXHeight', type: 'BYTE', value: 0},
        {name: 'ulUnicodeRange1', type: 'ULONG', value: 0},
        {name: 'ulUnicodeRange2', type: 'ULONG', value: 0},
        {name: 'ulUnicodeRange3', type: 'ULONG', value: 0},
        {name: 'ulUnicodeRange4', type: 'ULONG', value: 0},
        {name: 'achVendID', type: 'CHARARRAY', value: 'XXXX'},
        {name: 'fsSelection', type: 'USHORT', value: 0},
        {name: 'usFirstCharIndex', type: 'USHORT', value: 0},
        {name: 'usLastCharIndex', type: 'USHORT', value: 0},
        {name: 'sTypoAscender', type: 'SHORT', value: 0},
        {name: 'sTypoDescender', type: 'SHORT', value: 0},
        {name: 'sTypoLineGap', type: 'SHORT', value: 0},
        {name: 'usWinAscent', type: 'USHORT', value: 0},
        {name: 'usWinDescent', type: 'USHORT', value: 0},
        {name: 'ulCodePageRange1', type: 'ULONG', value: 0},
        {name: 'ulCodePageRange2', type: 'ULONG', value: 0},
        {name: 'sxHeight', type: 'SHORT', value: 0},
        {name: 'sCapHeight', type: 'SHORT', value: 0},
        {name: 'usDefaultChar', type: 'USHORT', value: 0},
        {name: 'usBreakChar', type: 'USHORT', value: 0},
        {name: 'usMaxContext', type: 'USHORT', value: 0}
    ], options);
}
var os2 = { parse: parseOS2Table, make: makeOS2Table, unicodeRanges: unicodeRanges, getUnicodeRange: getUnicodeRange };
function parsePostTable(data, start) {
    var post = {};
    var p = new parse.Parser(data, start);
    post.version = p.parseVersion();
    post.italicAngle = p.parseFixed();
    post.underlinePosition = p.parseShort();
    post.underlineThickness = p.parseShort();
    post.isFixedPitch = p.parseULong();
    post.minMemType42 = p.parseULong();
    post.maxMemType42 = p.parseULong();
    post.minMemType1 = p.parseULong();
    post.maxMemType1 = p.parseULong();
    switch (post.version) {
        case 1:
            post.names = standardNames.slice();
            break;
        case 2:
            post.numberOfGlyphs = p.parseUShort();
            post.glyphNameIndex = new Array(post.numberOfGlyphs);
            for (var i = 0; i < post.numberOfGlyphs; i++) {
                post.glyphNameIndex[i] = p.parseUShort();
            }
            post.names = [];
            for (var i$1 = 0; i$1 < post.numberOfGlyphs; i$1++) {
                if (post.glyphNameIndex[i$1] >= standardNames.length) {
                    var nameLength = p.parseChar();
                    post.names.push(p.parseString(nameLength));
                }
            }
            break;
        case 2.5:
            post.numberOfGlyphs = p.parseUShort();
            post.offset = new Array(post.numberOfGlyphs);
            for (var i$2 = 0; i$2 < post.numberOfGlyphs; i$2++) {
                post.offset[i$2] = p.parseChar();
            }
            break;
    }
    return post;
}
function makePostTable() {
    return new table.Table('post', [
        {name: 'version', type: 'FIXED', value: 0x00030000},
        {name: 'italicAngle', type: 'FIXED', value: 0},
        {name: 'underlinePosition', type: 'FWORD', value: 0},
        {name: 'underlineThickness', type: 'FWORD', value: 0},
        {name: 'isFixedPitch', type: 'ULONG', value: 0},
        {name: 'minMemType42', type: 'ULONG', value: 0},
        {name: 'maxMemType42', type: 'ULONG', value: 0},
        {name: 'minMemType1', type: 'ULONG', value: 0},
        {name: 'maxMemType1', type: 'ULONG', value: 0}
    ]);
}
var post = { parse: parsePostTable, make: makePostTable };
var subtableParsers = new Array(9);
subtableParsers[1] = function parseLookup1() {
    var start = this.offset + this.relativeOffset;
    var substFormat = this.parseUShort();
    if (substFormat === 1) {
        return {
            substFormat: 1,
            coverage: this.parsePointer(Parser.coverage),
            deltaGlyphId: this.parseUShort()
        };
    } else if (substFormat === 2) {
        return {
            substFormat: 2,
            coverage: this.parsePointer(Parser.coverage),
            substitute: this.parseOffset16List()
        };
    }
    check.assert(false, '0x' + start.toString(16) + ': lookup type 1 format must be 1 or 2.');
};
subtableParsers[2] = function parseLookup2() {
    var substFormat = this.parseUShort();
    check.argument(substFormat === 1, 'GSUB Multiple Substitution Subtable identifier-format must be 1');
    return {
        substFormat: substFormat,
        coverage: this.parsePointer(Parser.coverage),
        sequences: this.parseListOfLists()
    };
};
subtableParsers[3] = function parseLookup3() {
    var substFormat = this.parseUShort();
    check.argument(substFormat === 1, 'GSUB Alternate Substitution Subtable identifier-format must be 1');
    return {
        substFormat: substFormat,
        coverage: this.parsePointer(Parser.coverage),
        alternateSets: this.parseListOfLists()
    };
};
subtableParsers[4] = function parseLookup4() {
    var substFormat = this.parseUShort();
    check.argument(substFormat === 1, 'GSUB ligature table identifier-format must be 1');
    return {
        substFormat: substFormat,
        coverage: this.parsePointer(Parser.coverage),
        ligatureSets: this.parseListOfLists(function() {
            return {
                ligGlyph: this.parseUShort(),
                components: this.parseUShortList(this.parseUShort() - 1)
            };
        })
    };
};
var lookupRecordDesc = {
    sequenceIndex: Parser.uShort,
    lookupListIndex: Parser.uShort
};
subtableParsers[5] = function parseLookup5() {
    var start = this.offset + this.relativeOffset;
    var substFormat = this.parseUShort();
    if (substFormat === 1) {
        return {
            substFormat: substFormat,
            coverage: this.parsePointer(Parser.coverage),
            ruleSets: this.parseListOfLists(function() {
                var glyphCount = this.parseUShort();
                var substCount = this.parseUShort();
                return {
                    input: this.parseUShortList(glyphCount - 1),
                    lookupRecords: this.parseRecordList(substCount, lookupRecordDesc)
                };
            })
        };
    } else if (substFormat === 2) {
        return {
            substFormat: substFormat,
            coverage: this.parsePointer(Parser.coverage),
            classDef: this.parsePointer(Parser.classDef),
            classSets: this.parseListOfLists(function() {
                var glyphCount = this.parseUShort();
                var substCount = this.parseUShort();
                return {
                    classes: this.parseUShortList(glyphCount - 1),
                    lookupRecords: this.parseRecordList(substCount, lookupRecordDesc)
                };
            })
        };
    } else if (substFormat === 3) {
        var glyphCount = this.parseUShort();
        var substCount = this.parseUShort();
        return {
            substFormat: substFormat,
            coverages: this.parseList(glyphCount, Parser.pointer(Parser.coverage)),
            lookupRecords: this.parseRecordList(substCount, lookupRecordDesc)
        };
    }
    check.assert(false, '0x' + start.toString(16) + ': lookup type 5 format must be 1, 2 or 3.');
};
subtableParsers[6] = function parseLookup6() {
    var start = this.offset + this.relativeOffset;
    var substFormat = this.parseUShort();
    if (substFormat === 1) {
        return {
            substFormat: 1,
            coverage: this.parsePointer(Parser.coverage),
            chainRuleSets: this.parseListOfLists(function() {
                return {
                    backtrack: this.parseUShortList(),
                    input: this.parseUShortList(this.parseShort() - 1),
                    lookahead: this.parseUShortList(),
                    lookupRecords: this.parseRecordList(lookupRecordDesc)
                };
            })
        };
    } else if (substFormat === 2) {
        return {
            substFormat: 2,
            coverage: this.parsePointer(Parser.coverage),
            backtrackClassDef: this.parsePointer(Parser.classDef),
            inputClassDef: this.parsePointer(Parser.classDef),
            lookaheadClassDef: this.parsePointer(Parser.classDef),
            chainClassSet: this.parseListOfLists(function() {
                return {
                    backtrack: this.parseUShortList(),
                    input: this.parseUShortList(this.parseShort() - 1),
                    lookahead: this.parseUShortList(),
                    lookupRecords: this.parseRecordList(lookupRecordDesc)
                };
            })
        };
    } else if (substFormat === 3) {
        return {
            substFormat: 3,
            backtrackCoverage: this.parseList(Parser.pointer(Parser.coverage)),
            inputCoverage: this.parseList(Parser.pointer(Parser.coverage)),
            lookaheadCoverage: this.parseList(Parser.pointer(Parser.coverage)),
            lookupRecords: this.parseRecordList(lookupRecordDesc)
        };
    }
    check.assert(false, '0x' + start.toString(16) + ': lookup type 6 format must be 1, 2 or 3.');
};
subtableParsers[7] = function parseLookup7() {
    var substFormat = this.parseUShort();
    check.argument(substFormat === 1, 'GSUB Extension Substitution subtable identifier-format must be 1');
    var extensionLookupType = this.parseUShort();
    var extensionParser = new Parser(this.data, this.offset + this.parseULong());
    return {
        substFormat: 1,
        lookupType: extensionLookupType,
        extension: subtableParsers[extensionLookupType].call(extensionParser)
    };
};
subtableParsers[8] = function parseLookup8() {
    var substFormat = this.parseUShort();
    check.argument(substFormat === 1, 'GSUB Reverse Chaining Contextual Single Substitution Subtable identifier-format must be 1');
    return {
        substFormat: substFormat,
        coverage: this.parsePointer(Parser.coverage),
        backtrackCoverage: this.parseList(Parser.pointer(Parser.coverage)),
        lookaheadCoverage: this.parseList(Parser.pointer(Parser.coverage)),
        substitutes: this.parseUShortList()
    };
};
function parseGsubTable(data, start) {
    start = start || 0;
    var p = new Parser(data, start);
    var tableVersion = p.parseVersion(1);
    check.argument(tableVersion === 1 || tableVersion === 1.1, 'Unsupported GSUB table version.');
    if (tableVersion === 1) {
        return {
            version: tableVersion,
            scripts: p.parseScriptList(),
            features: p.parseFeatureList(),
            lookups: p.parseLookupList(subtableParsers)
        };
    } else {
        return {
            version: tableVersion,
            scripts: p.parseScriptList(),
            features: p.parseFeatureList(),
            lookups: p.parseLookupList(subtableParsers),
            variations: p.parseFeatureVariationsList()
        };
    }
}
var subtableMakers = new Array(9);
subtableMakers[1] = function makeLookup1(subtable) {
    if (subtable.substFormat === 1) {
        return new table.Table('substitutionTable', [
            {name: 'substFormat', type: 'USHORT', value: 1},
            {name: 'coverage', type: 'TABLE', value: new table.Coverage(subtable.coverage)},
            {name: 'deltaGlyphID', type: 'USHORT', value: subtable.deltaGlyphId}
        ]);
    } else {
        return new table.Table('substitutionTable', [
            {name: 'substFormat', type: 'USHORT', value: 2},
            {name: 'coverage', type: 'TABLE', value: new table.Coverage(subtable.coverage)}
        ].concat(table.ushortList('substitute', subtable.substitute)));
    }
};
subtableMakers[2] = function makeLookup2(subtable) {
    check.assert(subtable.substFormat === 1, 'Lookup type 2 substFormat must be 1.');
    return new table.Table('substitutionTable', [
        {name: 'substFormat', type: 'USHORT', value: 1},
        {name: 'coverage', type: 'TABLE', value: new table.Coverage(subtable.coverage)}
    ].concat(table.tableList('seqSet', subtable.sequences, function(sequenceSet) {
        return new table.Table('sequenceSetTable', table.ushortList('sequence', sequenceSet));
    })));
};
subtableMakers[3] = function makeLookup3(subtable) {
    check.assert(subtable.substFormat === 1, 'Lookup type 3 substFormat must be 1.');
    return new table.Table('substitutionTable', [
        {name: 'substFormat', type: 'USHORT', value: 1},
        {name: 'coverage', type: 'TABLE', value: new table.Coverage(subtable.coverage)}
    ].concat(table.tableList('altSet', subtable.alternateSets, function(alternateSet) {
        return new table.Table('alternateSetTable', table.ushortList('alternate', alternateSet));
    })));
};
subtableMakers[4] = function makeLookup4(subtable) {
    check.assert(subtable.substFormat === 1, 'Lookup type 4 substFormat must be 1.');
    return new table.Table('substitutionTable', [
        {name: 'substFormat', type: 'USHORT', value: 1},
        {name: 'coverage', type: 'TABLE', value: new table.Coverage(subtable.coverage)}
    ].concat(table.tableList('ligSet', subtable.ligatureSets, function(ligatureSet) {
        return new table.Table('ligatureSetTable', table.tableList('ligature', ligatureSet, function(ligature) {
            return new table.Table('ligatureTable',
                [{name: 'ligGlyph', type: 'USHORT', value: ligature.ligGlyph}]
                .concat(table.ushortList('component', ligature.components, ligature.components.length + 1))
            );
        }));
    })));
};
subtableMakers[6] = function makeLookup6(subtable) {
    if (subtable.substFormat === 1) {
        var returnTable = new table.Table('chainContextTable', [
            {name: 'substFormat', type: 'USHORT', value: subtable.substFormat},
            {name: 'coverage', type: 'TABLE', value: new table.Coverage(subtable.coverage)}
        ].concat(table.tableList('chainRuleSet', subtable.chainRuleSets, function(chainRuleSet) {
            return new table.Table('chainRuleSetTable', table.tableList('chainRule', chainRuleSet, function(chainRule) {
                var tableData = table.ushortList('backtrackGlyph', chainRule.backtrack, chainRule.backtrack.length)
                    .concat(table.ushortList('inputGlyph', chainRule.input, chainRule.input.length + 1))
                    .concat(table.ushortList('lookaheadGlyph', chainRule.lookahead, chainRule.lookahead.length))
                    .concat(table.ushortList('substitution', [], chainRule.lookupRecords.length));
                chainRule.lookupRecords.forEach(function (record, i) {
                    tableData = tableData
                        .concat({name: 'sequenceIndex' + i, type: 'USHORT', value: record.sequenceIndex})
                        .concat({name: 'lookupListIndex' + i, type: 'USHORT', value: record.lookupListIndex});
                });
                return new table.Table('chainRuleTable', tableData);
            }));
        })));
        return returnTable;
    } else if (subtable.substFormat === 2) {
        check.assert(false, 'lookup type 6 format 2 is not yet supported.');
    } else if (subtable.substFormat === 3) {
        var tableData = [
            {name: 'substFormat', type: 'USHORT', value: subtable.substFormat} ];
        tableData.push({name: 'backtrackGlyphCount', type: 'USHORT', value: subtable.backtrackCoverage.length});
        subtable.backtrackCoverage.forEach(function (coverage, i) {
            tableData.push({name: 'backtrackCoverage' + i, type: 'TABLE', value: new table.Coverage(coverage)});
        });
        tableData.push({name: 'inputGlyphCount', type: 'USHORT', value: subtable.inputCoverage.length});
        subtable.inputCoverage.forEach(function (coverage, i) {
            tableData.push({name: 'inputCoverage' + i, type: 'TABLE', value: new table.Coverage(coverage)});
        });
        tableData.push({name: 'lookaheadGlyphCount', type: 'USHORT', value: subtable.lookaheadCoverage.length});
        subtable.lookaheadCoverage.forEach(function (coverage, i) {
            tableData.push({name: 'lookaheadCoverage' + i, type: 'TABLE', value: new table.Coverage(coverage)});
        });
        tableData.push({name: 'substitutionCount', type: 'USHORT', value: subtable.lookupRecords.length});
        subtable.lookupRecords.forEach(function (record, i) {
            tableData = tableData
                .concat({name: 'sequenceIndex' + i, type: 'USHORT', value: record.sequenceIndex})
                .concat({name: 'lookupListIndex' + i, type: 'USHORT', value: record.lookupListIndex});
        });
        var returnTable$1 = new table.Table('chainContextTable', tableData);
        return returnTable$1;
    }
    check.assert(false, 'lookup type 6 format must be 1, 2 or 3.');
};
function makeGsubTable(gsub) {
    return new table.Table('GSUB', [
        {name: 'version', type: 'ULONG', value: 0x10000},
        {name: 'scripts', type: 'TABLE', value: new table.ScriptList(gsub.scripts)},
        {name: 'features', type: 'TABLE', value: new table.FeatureList(gsub.features)},
        {name: 'lookups', type: 'TABLE', value: new table.LookupList(gsub.lookups, subtableMakers)}
    ]);
}
var gsub = { parse: parseGsubTable, make: makeGsubTable };
function parseMetaTable(data, start) {
    var p = new parse.Parser(data, start);
    var tableVersion = p.parseULong();
    check.argument(tableVersion === 1, 'Unsupported META table version.');
    p.parseULong();
    p.parseULong();
    var numDataMaps = p.parseULong();
    var tags = {};
    for (var i = 0; i < numDataMaps; i++) {
        var tag = p.parseTag();
        var dataOffset = p.parseULong();
        var dataLength = p.parseULong();
        var text = decode$1.UTF8(data, start + dataOffset, dataLength);
        tags[tag] = text;
    }
    return tags;
}
function makeMetaTable(tags) {
    var numTags = Object.keys(tags).length;
    var stringPool = '';
    var stringPoolOffset = 16 + numTags * 12;
    var result = new table.Table('meta', [
        {name: 'version', type: 'ULONG', value: 1},
        {name: 'flags', type: 'ULONG', value: 0},
        {name: 'offset', type: 'ULONG', value: stringPoolOffset},
        {name: 'numTags', type: 'ULONG', value: numTags}
    ]);
    for (var tag in tags) {
        var pos = stringPool.length;
        stringPool += tags[tag];
        result.fields.push({name: 'tag ' + tag, type: 'TAG', value: tag});
        result.fields.push({name: 'offset ' + tag, type: 'ULONG', value: stringPoolOffset + pos});
        result.fields.push({name: 'length ' + tag, type: 'ULONG', value: tags[tag].length});
    }
    result.fields.push({name: 'stringPool', type: 'CHARARRAY', value: stringPool});
    return result;
}
var meta = { parse: parseMetaTable, make: makeMetaTable };
function log2(v) {
    return Math.log(v) / Math.log(2) | 0;
}
function computeCheckSum(bytes) {
    while (bytes.length % 4 !== 0) {
        bytes.push(0);
    }
    var sum = 0;
    for (var i = 0; i < bytes.length; i += 4) {
        sum += (bytes[i] << 24) +
            (bytes[i + 1] << 16) +
            (bytes[i + 2] << 8) +
            (bytes[i + 3]);
    }
    sum %= Math.pow(2, 32);
    return sum;
}
function makeTableRecord(tag, checkSum, offset, length) {
    return new table.Record('Table Record', [
        {name: 'tag', type: 'TAG', value: tag !== undefined ? tag : ''},
        {name: 'checkSum', type: 'ULONG', value: checkSum !== undefined ? checkSum : 0},
        {name: 'offset', type: 'ULONG', value: offset !== undefined ? offset : 0},
        {name: 'length', type: 'ULONG', value: length !== undefined ? length : 0}
    ]);
}
function makeSfntTable(tables) {
    var sfnt = new table.Table('sfnt', [
        {name: 'version', type: 'TAG', value: 'OTTO'},
        {name: 'numTables', type: 'USHORT', value: 0},
        {name: 'searchRange', type: 'USHORT', value: 0},
        {name: 'entrySelector', type: 'USHORT', value: 0},
        {name: 'rangeShift', type: 'USHORT', value: 0}
    ]);
    sfnt.tables = tables;
    sfnt.numTables = tables.length;
    var highestPowerOf2 = Math.pow(2, log2(sfnt.numTables));
    sfnt.searchRange = 16 * highestPowerOf2;
    sfnt.entrySelector = log2(highestPowerOf2);
    sfnt.rangeShift = sfnt.numTables * 16 - sfnt.searchRange;
    var recordFields = [];
    var tableFields = [];
    var offset = sfnt.sizeOf() + (makeTableRecord().sizeOf() * sfnt.numTables);
    while (offset % 4 !== 0) {
        offset += 1;
        tableFields.push({name: 'padding', type: 'BYTE', value: 0});
    }
    for (var i = 0; i < tables.length; i += 1) {
        var t = tables[i];
        check.argument(t.tableName.length === 4, 'Table name' + t.tableName + ' is invalid.');
        var tableLength = t.sizeOf();
        var tableRecord = makeTableRecord(t.tableName, computeCheckSum(t.encode()), offset, tableLength);
        recordFields.push({name: tableRecord.tag + ' Table Record', type: 'RECORD', value: tableRecord});
        tableFields.push({name: t.tableName + ' table', type: 'RECORD', value: t});
        offset += tableLength;
        check.argument(!isNaN(offset), 'Something went wrong calculating the offset.');
        while (offset % 4 !== 0) {
            offset += 1;
            tableFields.push({name: 'padding', type: 'BYTE', value: 0});
        }
    }
    recordFields.sort(function(r1, r2) {
        if (r1.value.tag > r2.value.tag) {
            return 1;
        } else {
            return -1;
        }
    });
    sfnt.fields = sfnt.fields.concat(recordFields);
    sfnt.fields = sfnt.fields.concat(tableFields);
    return sfnt;
}
function metricsForChar(font, chars, notFoundMetrics) {
    for (var i = 0; i < chars.length; i += 1) {
        var glyphIndex = font.charToGlyphIndex(chars[i]);
        if (glyphIndex > 0) {
            var glyph = font.glyphs.get(glyphIndex);
            return glyph.getMetrics();
        }
    }
    return notFoundMetrics;
}
function average(vs) {
    var sum = 0;
    for (var i = 0; i < vs.length; i += 1) {
        sum += vs[i];
    }
    return sum / vs.length;
}
function fontToSfntTable(font) {
    var xMins = [];
    var yMins = [];
    var xMaxs = [];
    var yMaxs = [];
    var advanceWidths = [];
    var leftSideBearings = [];
    var rightSideBearings = [];
    var firstCharIndex;
    var lastCharIndex = 0;
    var ulUnicodeRange1 = 0;
    var ulUnicodeRange2 = 0;
    var ulUnicodeRange3 = 0;
    var ulUnicodeRange4 = 0;
    for (var i = 0; i < font.glyphs.length; i += 1) {
        var glyph = font.glyphs.get(i);
        var unicode = glyph.unicode | 0;
        if (isNaN(glyph.advanceWidth)) {
            throw new Error('Glyph ' + glyph.name + ' (' + i + '): advanceWidth is not a number.');
        }
        if (firstCharIndex > unicode || firstCharIndex === undefined) {
            if (unicode > 0) {
                firstCharIndex = unicode;
            }
        }
        if (lastCharIndex < unicode) {
            lastCharIndex = unicode;
        }
        var position = os2.getUnicodeRange(unicode);
        if (position < 32) {
            ulUnicodeRange1 |= 1 << position;
        } else if (position < 64) {
            ulUnicodeRange2 |= 1 << position - 32;
        } else if (position < 96) {
            ulUnicodeRange3 |= 1 << position - 64;
        } else if (position < 123) {
            ulUnicodeRange4 |= 1 << position - 96;
        } else {
            throw new Error('Unicode ranges bits > 123 are reserved for internal usage');
        }
        if (glyph.name === '.notdef') { continue; }
        var metrics = glyph.getMetrics();
        xMins.push(metrics.xMin);
        yMins.push(metrics.yMin);
        xMaxs.push(metrics.xMax);
        yMaxs.push(metrics.yMax);
        leftSideBearings.push(metrics.leftSideBearing);
        rightSideBearings.push(metrics.rightSideBearing);
        advanceWidths.push(glyph.advanceWidth);
    }
    var globals = {
        xMin: Math.min.apply(null, xMins),
        yMin: Math.min.apply(null, yMins),
        xMax: Math.max.apply(null, xMaxs),
        yMax: Math.max.apply(null, yMaxs),
        advanceWidthMax: Math.max.apply(null, advanceWidths),
        advanceWidthAvg: average(advanceWidths),
        minLeftSideBearing: Math.min.apply(null, leftSideBearings),
        maxLeftSideBearing: Math.max.apply(null, leftSideBearings),
        minRightSideBearing: Math.min.apply(null, rightSideBearings)
    };
    globals.ascender = font.ascender;
    globals.descender = font.descender;
    var headTable = head.make({
        flags: 3,
        unitsPerEm: font.unitsPerEm,
        xMin: globals.xMin,
        yMin: globals.yMin,
        xMax: globals.xMax,
        yMax: globals.yMax,
        lowestRecPPEM: 3,
        createdTimestamp: font.createdTimestamp
    });
    var hheaTable = hhea.make({
        ascender: globals.ascender,
        descender: globals.descender,
        advanceWidthMax: globals.advanceWidthMax,
        minLeftSideBearing: globals.minLeftSideBearing,
        minRightSideBearing: globals.minRightSideBearing,
        xMaxExtent: globals.maxLeftSideBearing + (globals.xMax - globals.xMin),
        numberOfHMetrics: font.glyphs.length
    });
    var maxpTable = maxp.make(font.glyphs.length);
    var os2Table = os2.make(Object.assign({
        xAvgCharWidth: Math.round(globals.advanceWidthAvg),
        usFirstCharIndex: firstCharIndex,
        usLastCharIndex: lastCharIndex,
        ulUnicodeRange1: ulUnicodeRange1,
        ulUnicodeRange2: ulUnicodeRange2,
        ulUnicodeRange3: ulUnicodeRange3,
        ulUnicodeRange4: ulUnicodeRange4,
        sTypoAscender: globals.ascender,
        sTypoDescender: globals.descender,
        sTypoLineGap: 0,
        usWinAscent: globals.yMax,
        usWinDescent: Math.abs(globals.yMin),
        ulCodePageRange1: 1,
        sxHeight: metricsForChar(font, 'xyvw', {yMax: Math.round(globals.ascender / 2)}).yMax,
        sCapHeight: metricsForChar(font, 'HIKLEFJMNTZBDPRAGOQSUVWXY', globals).yMax,
        usDefaultChar: font.hasChar(' ') ? 32 : 0,
        usBreakChar: font.hasChar(' ') ? 32 : 0,
    }, font.tables.os2));
    var hmtxTable = hmtx.make(font.glyphs);
    var cmapTable = cmap.make(font.glyphs);
    var englishFamilyName = font.getEnglishName('fontFamily');
    var englishStyleName = font.getEnglishName('fontSubfamily');
    var englishFullName = englishFamilyName + ' ' + englishStyleName;
    var postScriptName = font.getEnglishName('postScriptName');
    if (!postScriptName) {
        postScriptName = englishFamilyName.replace(/\s/g, '') + '-' + englishStyleName;
    }
    var names = {};
    for (var n in font.names) {
        names[n] = font.names[n];
    }
    if (!names.uniqueID) {
        names.uniqueID = {en: font.getEnglishName('manufacturer') + ':' + englishFullName};
    }
    if (!names.postScriptName) {
        names.postScriptName = {en: postScriptName};
    }
    if (!names.preferredFamily) {
        names.preferredFamily = font.names.fontFamily;
    }
    if (!names.preferredSubfamily) {
        names.preferredSubfamily = font.names.fontSubfamily;
    }
    var languageTags = [];
    var nameTable = _name.make(names, languageTags);
    var ltagTable = (languageTags.length > 0 ? ltag.make(languageTags) : undefined);
    var postTable = post.make();
    var cffTable = cff.make(font.glyphs, {
        version: font.getEnglishName('version'),
        fullName: englishFullName,
        familyName: englishFamilyName,
        weightName: englishStyleName,
        postScriptName: postScriptName,
        unitsPerEm: font.unitsPerEm,
        fontBBox: [0, globals.yMin, globals.ascender, globals.advanceWidthMax]
    });
    var metaTable = (font.metas && Object.keys(font.metas).length > 0) ? meta.make(font.metas) : undefined;
    var tables = [headTable, hheaTable, maxpTable, os2Table, nameTable, cmapTable, postTable, cffTable, hmtxTable];
    if (ltagTable) {
        tables.push(ltagTable);
    }
    if (font.tables.gsub) {
        tables.push(gsub.make(font.tables.gsub));
    }
    if (metaTable) {
        tables.push(metaTable);
    }
    var sfntTable = makeSfntTable(tables);
    var bytes = sfntTable.encode();
    var checkSum = computeCheckSum(bytes);
    var tableFields = sfntTable.fields;
    var checkSumAdjusted = false;
    for (var i$1 = 0; i$1 < tableFields.length; i$1 += 1) {
        if (tableFields[i$1].name === 'head table') {
            tableFields[i$1].value.checkSumAdjustment = 0xB1B0AFBA - checkSum;
            checkSumAdjusted = true;
            break;
        }
    }
    if (!checkSumAdjusted) {
        throw new Error('Could not find head table with checkSum to adjust.');
    }
    return sfntTable;
}
var sfnt = { make: makeSfntTable, fontToTable: fontToSfntTable, computeCheckSum: computeCheckSum };
function searchTag(arr, tag) {
    var imin = 0;
    var imax = arr.length - 1;
    while (imin <= imax) {
        var imid = (imin + imax) >>> 1;
        var val = arr[imid].tag;
        if (val === tag) {
            return imid;
        } else if (val < tag) {
            imin = imid + 1;
        } else { imax = imid - 1; }
    }
    return -imin - 1;
}
function binSearch(arr, value) {
    var imin = 0;
    var imax = arr.length - 1;
    while (imin <= imax) {
        var imid = (imin + imax) >>> 1;
        var val = arr[imid];
        if (val === value) {
            return imid;
        } else if (val < value) {
            imin = imid + 1;
        } else { imax = imid - 1; }
    }
    return -imin - 1;
}
function searchRange(ranges, value) {
    var range;
    var imin = 0;
    var imax = ranges.length - 1;
    while (imin <= imax) {
        var imid = (imin + imax) >>> 1;
        range = ranges[imid];
        var start = range.start;
        if (start === value) {
            return range;
        } else if (start < value) {
            imin = imid + 1;
        } else { imax = imid - 1; }
    }
    if (imin > 0) {
        range = ranges[imin - 1];
        if (value > range.end) { return 0; }
        return range;
    }
}
function Layout(font, tableName) {
    this.font = font;
    this.tableName = tableName;
}
Layout.prototype = {
    searchTag: searchTag,
    binSearch: binSearch,
    getTable: function(create) {
        var layout = this.font.tables[this.tableName];
        if (!layout && create) {
            layout = this.font.tables[this.tableName] = this.createDefaultTable();
        }
        return layout;
    },
    getScriptNames: function() {
        var layout = this.getTable();
        if (!layout) { return []; }
        return layout.scripts.map(function(script) {
            return script.tag;
        });
    },
    getDefaultScriptName: function() {
        var layout = this.getTable();
        if (!layout) { return; }
        var hasLatn = false;
        for (var i = 0; i < layout.scripts.length; i++) {
            var name = layout.scripts[i].tag;
            if (name === 'DFLT') { return name; }
            if (name === 'latn') { hasLatn = true; }
        }
        if (hasLatn) { return 'latn'; }
    },
    getScriptTable: function(script, create) {
        var layout = this.getTable(create);
        if (layout) {
            script = script || 'DFLT';
            var scripts = layout.scripts;
            var pos = searchTag(layout.scripts, script);
            if (pos >= 0) {
                return scripts[pos].script;
            } else if (create) {
                var scr = {
                    tag: script,
                    script: {
                        defaultLangSys: {reserved: 0, reqFeatureIndex: 0xffff, featureIndexes: []},
                        langSysRecords: []
                    }
                };
                scripts.splice(-1 - pos, 0, scr);
                return scr.script;
            }
        }
    },
    getLangSysTable: function(script, language, create) {
        var scriptTable = this.getScriptTable(script, create);
        if (scriptTable) {
            if (!language || language === 'dflt' || language === 'DFLT') {
                return scriptTable.defaultLangSys;
            }
            var pos = searchTag(scriptTable.langSysRecords, language);
            if (pos >= 0) {
                return scriptTable.langSysRecords[pos].langSys;
            } else if (create) {
                var langSysRecord = {
                    tag: language,
                    langSys: {reserved: 0, reqFeatureIndex: 0xffff, featureIndexes: []}
                };
                scriptTable.langSysRecords.splice(-1 - pos, 0, langSysRecord);
                return langSysRecord.langSys;
            }
        }
    },
    getFeatureTable: function(script, language, feature, create) {
        var langSysTable = this.getLangSysTable(script, language, create);
        if (langSysTable) {
            var featureRecord;
            var featIndexes = langSysTable.featureIndexes;
            var allFeatures = this.font.tables[this.tableName].features;
            for (var i = 0; i < featIndexes.length; i++) {
                featureRecord = allFeatures[featIndexes[i]];
                if (featureRecord.tag === feature) {
                    return featureRecord.feature;
                }
            }
            if (create) {
                var index = allFeatures.length;
                check.assert(index === 0 || feature >= allFeatures[index - 1].tag, 'Features must be added in alphabetical order.');
                featureRecord = {
                    tag: feature,
                    feature: { params: 0, lookupListIndexes: [] }
                };
                allFeatures.push(featureRecord);
                featIndexes.push(index);
                return featureRecord.feature;
            }
        }
    },
    getLookupTables: function(script, language, feature, lookupType, create) {
        var featureTable = this.getFeatureTable(script, language, feature, create);
        var tables = [];
        if (featureTable) {
            var lookupTable;
            var lookupListIndexes = featureTable.lookupListIndexes;
            var allLookups = this.font.tables[this.tableName].lookups;
            for (var i = 0; i < lookupListIndexes.length; i++) {
                lookupTable = allLookups[lookupListIndexes[i]];
                if (lookupTable.lookupType === lookupType) {
                    tables.push(lookupTable);
                }
            }
            if (tables.length === 0 && create) {
                lookupTable = {
                    lookupType: lookupType,
                    lookupFlag: 0,
                    subtables: [],
                    markFilteringSet: undefined
                };
                var index = allLookups.length;
                allLookups.push(lookupTable);
                lookupListIndexes.push(index);
                return [lookupTable];
            }
        }
        return tables;
    },
    getGlyphClass: function(classDefTable, glyphIndex) {
        switch (classDefTable.format) {
            case 1:
                if (classDefTable.startGlyph <= glyphIndex && glyphIndex < classDefTable.startGlyph + classDefTable.classes.length) {
                    return classDefTable.classes[glyphIndex - classDefTable.startGlyph];
                }
                return 0;
            case 2:
                var range = searchRange(classDefTable.ranges, glyphIndex);
                return range ? range.classId : 0;
        }
    },
    getCoverageIndex: function(coverageTable, glyphIndex) {
        switch (coverageTable.format) {
            case 1:
                var index = binSearch(coverageTable.glyphs, glyphIndex);
                return index >= 0 ? index : -1;
            case 2:
                var range = searchRange(coverageTable.ranges, glyphIndex);
                return range ? range.index + glyphIndex - range.start : -1;
        }
    },
    expandCoverage: function(coverageTable) {
        if (coverageTable.format === 1) {
            return coverageTable.glyphs;
        } else {
            var glyphs = [];
            var ranges = coverageTable.ranges;
            for (var i = 0; i < ranges.length; i++) {
                var range = ranges[i];
                var start = range.start;
                var end = range.end;
                for (var j = start; j <= end; j++) {
                    glyphs.push(j);
                }
            }
            return glyphs;
        }
    }
};
function Position(font) {
    Layout.call(this, font, 'gpos');
}
Position.prototype = Layout.prototype;
Position.prototype.init = function() {
    var script = this.getDefaultScriptName();
    this.defaultKerningTables = this.getKerningTables(script);
};
Position.prototype.getKerningValue = function(kerningLookups, leftIndex, rightIndex) {
    for (var i = 0; i < kerningLookups.length; i++) {
        var subtables = kerningLookups[i].subtables;
        for (var j = 0; j < subtables.length; j++) {
            var subtable = subtables[j];
            var covIndex = this.getCoverageIndex(subtable.coverage, leftIndex);
            if (covIndex < 0) { continue; }
            switch (subtable.posFormat) {
                case 1:
                    var pairSet = subtable.pairSets[covIndex];
                    for (var k = 0; k < pairSet.length; k++) {
                        var pair = pairSet[k];
                        if (pair.secondGlyph === rightIndex) {
                            return pair.value1 && pair.value1.xAdvance || 0;
                        }
                    }
                    break;
                case 2:
                    var class1 = this.getGlyphClass(subtable.classDef1, leftIndex);
                    var class2 = this.getGlyphClass(subtable.classDef2, rightIndex);
                    var pair$1 = subtable.classRecords[class1][class2];
                    return pair$1.value1 && pair$1.value1.xAdvance || 0;
            }
        }
    }
    return 0;
};
Position.prototype.getKerningTables = function(script, language) {
    if (this.font.tables.gpos) {
        return this.getLookupTables(script, language, 'kern', 2);
    }
};
function Substitution(font) {
    Layout.call(this, font, 'gsub');
}
function arraysEqual(ar1, ar2) {
    var n = ar1.length;
    if (n !== ar2.length) { return false; }
    for (var i = 0; i < n; i++) {
        if (ar1[i] !== ar2[i]) { return false; }
    }
    return true;
}
function getSubstFormat(lookupTable, format, defaultSubtable) {
    var subtables = lookupTable.subtables;
    for (var i = 0; i < subtables.length; i++) {
        var subtable = subtables[i];
        if (subtable.substFormat === format) {
            return subtable;
        }
    }
    if (defaultSubtable) {
        subtables.push(defaultSubtable);
        return defaultSubtable;
    }
    return undefined;
}
Substitution.prototype = Layout.prototype;
Substitution.prototype.createDefaultTable = function() {
    return {
        version: 1,
        scripts: [{
            tag: 'DFLT',
            script: {
                defaultLangSys: { reserved: 0, reqFeatureIndex: 0xffff, featureIndexes: [] },
                langSysRecords: []
            }
        }],
        features: [],
        lookups: []
    };
};
Substitution.prototype.getSingle = function(feature, script, language) {
    var substitutions = [];
    var lookupTables = this.getLookupTables(script, language, feature, 1);
    for (var idx = 0; idx < lookupTables.length; idx++) {
        var subtables = lookupTables[idx].subtables;
        for (var i = 0; i < subtables.length; i++) {
            var subtable = subtables[i];
            var glyphs = this.expandCoverage(subtable.coverage);
            var j = (void 0);
            if (subtable.substFormat === 1) {
                var delta = subtable.deltaGlyphId;
                for (j = 0; j < glyphs.length; j++) {
                    var glyph = glyphs[j];
                    substitutions.push({ sub: glyph, by: glyph + delta });
                }
            } else {
                var substitute = subtable.substitute;
                for (j = 0; j < glyphs.length; j++) {
                    substitutions.push({ sub: glyphs[j], by: substitute[j] });
                }
            }
        }
    }
    return substitutions;
};
Substitution.prototype.getMultiple = function(feature, script, language) {
    var substitutions = [];
    var lookupTables = this.getLookupTables(script, language, feature, 2);
    for (var idx = 0; idx < lookupTables.length; idx++) {
        var subtables = lookupTables[idx].subtables;
        for (var i = 0; i < subtables.length; i++) {
            var subtable = subtables[i];
            var glyphs = this.expandCoverage(subtable.coverage);
            var j = (void 0);
            for (j = 0; j < glyphs.length; j++) {
                var glyph = glyphs[j];
                var replacements = subtable.sequences[j];
                substitutions.push({ sub: glyph, by: replacements });
            }
        }
    }
    return substitutions;
};
Substitution.prototype.getAlternates = function(feature, script, language) {
    var alternates = [];
    var lookupTables = this.getLookupTables(script, language, feature, 3);
    for (var idx = 0; idx < lookupTables.length; idx++) {
        var subtables = lookupTables[idx].subtables;
        for (var i = 0; i < subtables.length; i++) {
            var subtable = subtables[i];
            var glyphs = this.expandCoverage(subtable.coverage);
            var alternateSets = subtable.alternateSets;
            for (var j = 0; j < glyphs.length; j++) {
                alternates.push({ sub: glyphs[j], by: alternateSets[j] });
            }
        }
    }
    return alternates;
};
Substitution.prototype.getLigatures = function(feature, script, language) {
    var ligatures = [];
    var lookupTables = this.getLookupTables(script, language, feature, 4);
    for (var idx = 0; idx < lookupTables.length; idx++) {
        var subtables = lookupTables[idx].subtables;
        for (var i = 0; i < subtables.length; i++) {
            var subtable = subtables[i];
            var glyphs = this.expandCoverage(subtable.coverage);
            var ligatureSets = subtable.ligatureSets;
            for (var j = 0; j < glyphs.length; j++) {
                var startGlyph = glyphs[j];
                var ligSet = ligatureSets[j];
                for (var k = 0; k < ligSet.length; k++) {
                    var lig = ligSet[k];
                    ligatures.push({
                        sub: [startGlyph].concat(lig.components),
                        by: lig.ligGlyph
                    });
                }
            }
        }
    }
    return ligatures;
};
Substitution.prototype.addSingle = function(feature, substitution, script, language) {
    var lookupTable = this.getLookupTables(script, language, feature, 1, true)[0];
    var subtable = getSubstFormat(lookupTable, 2, {
        substFormat: 2,
        coverage: {format: 1, glyphs: []},
        substitute: []
    });
    check.assert(subtable.coverage.format === 1, 'Single: unable to modify coverage table format ' + subtable.coverage.format);
    var coverageGlyph = substitution.sub;
    var pos = this.binSearch(subtable.coverage.glyphs, coverageGlyph);
    if (pos < 0) {
        pos = -1 - pos;
        subtable.coverage.glyphs.splice(pos, 0, coverageGlyph);
        subtable.substitute.splice(pos, 0, 0);
    }
    subtable.substitute[pos] = substitution.by;
};
Substitution.prototype.addMultiple = function(feature, substitution, script, language) {
    check.assert(substitution.by instanceof Array && substitution.by.length > 1, 'Multiple: "by" must be an array of two or more ids');
    var lookupTable = this.getLookupTables(script, language, feature, 2, true)[0];
    var subtable = getSubstFormat(lookupTable, 1, {
        substFormat: 1,
        coverage: {format: 1, glyphs: []},
        sequences: []
    });
    check.assert(subtable.coverage.format === 1, 'Multiple: unable to modify coverage table format ' + subtable.coverage.format);
    var coverageGlyph = substitution.sub;
    var pos = this.binSearch(subtable.coverage.glyphs, coverageGlyph);
    if (pos < 0) {
        pos = -1 - pos;
        subtable.coverage.glyphs.splice(pos, 0, coverageGlyph);
        subtable.sequences.splice(pos, 0, 0);
    }
    subtable.sequences[pos] = substitution.by;
};
Substitution.prototype.addAlternate = function(feature, substitution, script, language) {
    var lookupTable = this.getLookupTables(script, language, feature, 3, true)[0];
    var subtable = getSubstFormat(lookupTable, 1, {
        substFormat: 1,
        coverage: {format: 1, glyphs: []},
        alternateSets: []
    });
    check.assert(subtable.coverage.format === 1, 'Alternate: unable to modify coverage table format ' + subtable.coverage.format);
    var coverageGlyph = substitution.sub;
    var pos = this.binSearch(subtable.coverage.glyphs, coverageGlyph);
    if (pos < 0) {
        pos = -1 - pos;
        subtable.coverage.glyphs.splice(pos, 0, coverageGlyph);
        subtable.alternateSets.splice(pos, 0, 0);
    }
    subtable.alternateSets[pos] = substitution.by;
};
Substitution.prototype.addLigature = function(feature, ligature, script, language) {
    var lookupTable = this.getLookupTables(script, language, feature, 4, true)[0];
    var subtable = lookupTable.subtables[0];
    if (!subtable) {
        subtable = {
            substFormat: 1,
            coverage: { format: 1, glyphs: [] },
            ligatureSets: []
        };
        lookupTable.subtables[0] = subtable;
    }
    check.assert(subtable.coverage.format === 1, 'Ligature: unable to modify coverage table format ' + subtable.coverage.format);
    var coverageGlyph = ligature.sub[0];
    var ligComponents = ligature.sub.slice(1);
    var ligatureTable = {
        ligGlyph: ligature.by,
        components: ligComponents
    };
    var pos = this.binSearch(subtable.coverage.glyphs, coverageGlyph);
    if (pos >= 0) {
        var ligatureSet = subtable.ligatureSets[pos];
        for (var i = 0; i < ligatureSet.length; i++) {
            if (arraysEqual(ligatureSet[i].components, ligComponents)) {
                return;
            }
        }
        ligatureSet.push(ligatureTable);
    } else {
        pos = -1 - pos;
        subtable.coverage.glyphs.splice(pos, 0, coverageGlyph);
        subtable.ligatureSets.splice(pos, 0, [ligatureTable]);
    }
};
Substitution.prototype.getFeature = function(feature, script, language) {
    if (/ss\d\d/.test(feature)) {
        return this.getSingle(feature, script, language);
    }
    switch (feature) {
        case 'aalt':
        case 'salt':
            return this.getSingle(feature, script, language)
                    .concat(this.getAlternates(feature, script, language));
        case 'dlig':
        case 'liga':
        case 'rlig':
            return this.getLigatures(feature, script, language);
        case 'ccmp':
            return this.getMultiple(feature, script, language)
                .concat(this.getLigatures(feature, script, language));
        case 'stch':
            return this.getMultiple(feature, script, language);
    }
    return undefined;
};
Substitution.prototype.add = function(feature, sub, script, language) {
    if (/ss\d\d/.test(feature)) {
        return this.addSingle(feature, sub, script, language);
    }
    switch (feature) {
        case 'aalt':
        case 'salt':
            if (typeof sub.by === 'number') {
                return this.addSingle(feature, sub, script, language);
            }
            return this.addAlternate(feature, sub, script, language);
        case 'dlig':
        case 'liga':
        case 'rlig':
            return this.addLigature(feature, sub, script, language);
        case 'ccmp':
            if (sub.by instanceof Array) {
                return this.addMultiple(feature, sub, script, language);
            }
            return this.addLigature(feature, sub, script, language);
    }
    return undefined;
};
function isBrowser() {
    return typeof window !== 'undefined';
}
function nodeBufferToArrayBuffer(buffer) {
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return ab;
}
function arrayBufferToNodeBuffer(ab) {
    var buffer = new Buffer(ab.byteLength);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        buffer[i] = view[i];
    }
    return buffer;
}
function checkArgument(expression, message) {
    if (!expression) {
        throw message;
    }
}
function parseGlyphCoordinate(p, flag, previousValue, shortVectorBitMask, sameBitMask) {
    var v;
    if ((flag & shortVectorBitMask) > 0) {
        v = p.parseByte();
        if ((flag & sameBitMask) === 0) {
            v = -v;
        }
        v = previousValue + v;
    } else {
        if ((flag & sameBitMask) > 0) {
            v = previousValue;
        } else {
            v = previousValue + p.parseShort();
        }
    }
    return v;
}
function parseGlyph(glyph, data, start) {
    var p = new parse.Parser(data, start);
    glyph.numberOfContours = p.parseShort();
    glyph._xMin = p.parseShort();
    glyph._yMin = p.parseShort();
    glyph._xMax = p.parseShort();
    glyph._yMax = p.parseShort();
    var flags;
    var flag;
    if (glyph.numberOfContours > 0) {
        var endPointIndices = glyph.endPointIndices = [];
        for (var i = 0; i < glyph.numberOfContours; i += 1) {
            endPointIndices.push(p.parseUShort());
        }
        glyph.instructionLength = p.parseUShort();
        glyph.instructions = [];
        for (var i$1 = 0; i$1 < glyph.instructionLength; i$1 += 1) {
            glyph.instructions.push(p.parseByte());
        }
        var numberOfCoordinates = endPointIndices[endPointIndices.length - 1] + 1;
        flags = [];
        for (var i$2 = 0; i$2 < numberOfCoordinates; i$2 += 1) {
            flag = p.parseByte();
            flags.push(flag);
            if ((flag & 8) > 0) {
                var repeatCount = p.parseByte();
                for (var j = 0; j < repeatCount; j += 1) {
                    flags.push(flag);
                    i$2 += 1;
                }
            }
        }
        check.argument(flags.length === numberOfCoordinates, 'Bad flags.');
        if (endPointIndices.length > 0) {
            var points = [];
            var point;
            if (numberOfCoordinates > 0) {
                for (var i$3 = 0; i$3 < numberOfCoordinates; i$3 += 1) {
                    flag = flags[i$3];
                    point = {};
                    point.onCurve = !!(flag & 1);
                    point.lastPointOfContour = endPointIndices.indexOf(i$3) >= 0;
                    points.push(point);
                }
                var px = 0;
                for (var i$4 = 0; i$4 < numberOfCoordinates; i$4 += 1) {
                    flag = flags[i$4];
                    point = points[i$4];
                    point.x = parseGlyphCoordinate(p, flag, px, 2, 16);
                    px = point.x;
                }
                var py = 0;
                for (var i$5 = 0; i$5 < numberOfCoordinates; i$5 += 1) {
                    flag = flags[i$5];
                    point = points[i$5];
                    point.y = parseGlyphCoordinate(p, flag, py, 4, 32);
                    py = point.y;
                }
            }
            glyph.points = points;
        } else {
            glyph.points = [];
        }
    } else if (glyph.numberOfContours === 0) {
        glyph.points = [];
    } else {
        glyph.isComposite = true;
        glyph.points = [];
        glyph.components = [];
        var moreComponents = true;
        while (moreComponents) {
            flags = p.parseUShort();
            var component = {
                glyphIndex: p.parseUShort(),
                xScale: 1,
                scale01: 0,
                scale10: 0,
                yScale: 1,
                dx: 0,
                dy: 0
            };
            if ((flags & 1) > 0) {
                if ((flags & 2) > 0) {
                    component.dx = p.parseShort();
                    component.dy = p.parseShort();
                } else {
                    component.matchedPoints = [p.parseUShort(), p.parseUShort()];
                }
            } else {
                if ((flags & 2) > 0) {
                    component.dx = p.parseChar();
                    component.dy = p.parseChar();
                } else {
                    component.matchedPoints = [p.parseByte(), p.parseByte()];
                }
            }
            if ((flags & 8) > 0) {
                component.xScale = component.yScale = p.parseF2Dot14();
            } else if ((flags & 64) > 0) {
                component.xScale = p.parseF2Dot14();
                component.yScale = p.parseF2Dot14();
            } else if ((flags & 128) > 0) {
                component.xScale = p.parseF2Dot14();
                component.scale01 = p.parseF2Dot14();
                component.scale10 = p.parseF2Dot14();
                component.yScale = p.parseF2Dot14();
            }
            glyph.components.push(component);
            moreComponents = !!(flags & 32);
        }
        if (flags & 0x100) {
            glyph.instructionLength = p.parseUShort();
            glyph.instructions = [];
            for (var i$6 = 0; i$6 < glyph.instructionLength; i$6 += 1) {
                glyph.instructions.push(p.parseByte());
            }
        }
    }
}
function transformPoints(points, transform) {
    var newPoints = [];
    for (var i = 0; i < points.length; i += 1) {
        var pt = points[i];
        var newPt = {
            x: transform.xScale * pt.x + transform.scale01 * pt.y + transform.dx,
            y: transform.scale10 * pt.x + transform.yScale * pt.y + transform.dy,
            onCurve: pt.onCurve,
            lastPointOfContour: pt.lastPointOfContour
        };
        newPoints.push(newPt);
    }
    return newPoints;
}
function getContours(points) {
    var contours = [];
    var currentContour = [];
    for (var i = 0; i < points.length; i += 1) {
        var pt = points[i];
        currentContour.push(pt);
        if (pt.lastPointOfContour) {
            contours.push(currentContour);
            currentContour = [];
        }
    }
    check.argument(currentContour.length === 0, 'There are still points left in the current contour.');
    return contours;
}
function getPath(points) {
    var p = new Path();
    if (!points) {
        return p;
    }
    var contours = getContours(points);
    for (var contourIndex = 0; contourIndex < contours.length; ++contourIndex) {
        var contour = contours[contourIndex];
        var prev = null;
        var curr = contour[contour.length - 1];
        var next = contour[0];
        if (curr.onCurve) {
            p.moveTo(curr.x, curr.y);
        } else {
            if (next.onCurve) {
                p.moveTo(next.x, next.y);
            } else {
                var start = {x: (curr.x + next.x) * 0.5, y: (curr.y + next.y) * 0.5};
                p.moveTo(start.x, start.y);
            }
        }
        for (var i = 0; i < contour.length; ++i) {
            prev = curr;
            curr = next;
            next = contour[(i + 1) % contour.length];
            if (curr.onCurve) {
                p.lineTo(curr.x, curr.y);
            } else {
                var next2 = next;
                if (!prev.onCurve) {
                    ({ x: (curr.x + prev.x) * 0.5, y: (curr.y + prev.y) * 0.5 });
                }
                if (!next.onCurve) {
                    next2 = { x: (curr.x + next.x) * 0.5, y: (curr.y + next.y) * 0.5 };
                }
                p.quadraticCurveTo(curr.x, curr.y, next2.x, next2.y);
            }
        }
        p.closePath();
    }
    return p;
}
function buildPath(glyphs, glyph) {
    if (glyph.isComposite) {
        for (var j = 0; j < glyph.components.length; j += 1) {
            var component = glyph.components[j];
            var componentGlyph = glyphs.get(component.glyphIndex);
            componentGlyph.getPath();
            if (componentGlyph.points) {
                var transformedPoints = (void 0);
                if (component.matchedPoints === undefined) {
                    transformedPoints = transformPoints(componentGlyph.points, component);
                } else {
                    if ((component.matchedPoints[0] > glyph.points.length - 1) ||
                        (component.matchedPoints[1] > componentGlyph.points.length - 1)) {
                        throw Error('Matched points out of range in ' + glyph.name);
                    }
                    var firstPt = glyph.points[component.matchedPoints[0]];
                    var secondPt = componentGlyph.points[component.matchedPoints[1]];
                    var transform = {
                        xScale: component.xScale, scale01: component.scale01,
                        scale10: component.scale10, yScale: component.yScale,
                        dx: 0, dy: 0
                    };
                    secondPt = transformPoints([secondPt], transform)[0];
                    transform.dx = firstPt.x - secondPt.x;
                    transform.dy = firstPt.y - secondPt.y;
                    transformedPoints = transformPoints(componentGlyph.points, transform);
                }
                glyph.points = glyph.points.concat(transformedPoints);
            }
        }
    }
    return getPath(glyph.points);
}
function parseGlyfTableAll(data, start, loca, font) {
    var glyphs = new glyphset.GlyphSet(font);
    for (var i = 0; i < loca.length - 1; i += 1) {
        var offset = loca[i];
        var nextOffset = loca[i + 1];
        if (offset !== nextOffset) {
            glyphs.push(i, glyphset.ttfGlyphLoader(font, i, parseGlyph, data, start + offset, buildPath));
        } else {
            glyphs.push(i, glyphset.glyphLoader(font, i));
        }
    }
    return glyphs;
}
function parseGlyfTableOnLowMemory(data, start, loca, font) {
    var glyphs = new glyphset.GlyphSet(font);
    font._push = function(i) {
        var offset = loca[i];
        var nextOffset = loca[i + 1];
        if (offset !== nextOffset) {
            glyphs.push(i, glyphset.ttfGlyphLoader(font, i, parseGlyph, data, start + offset, buildPath));
        } else {
            glyphs.push(i, glyphset.glyphLoader(font, i));
        }
    };
    return glyphs;
}
function parseGlyfTable(data, start, loca, font, opt) {
    if (opt.lowMemory)
        { return parseGlyfTableOnLowMemory(data, start, loca, font); }
    else
        { return parseGlyfTableAll(data, start, loca, font); }
}
var glyf = { getPath: getPath, parse: parseGlyfTable};
var instructionTable;
var exec;
var execGlyph;
var execComponent;
function Hinting(font) {
    this.font = font;
    this.getCommands = function (hPoints) {
        return glyf.getPath(hPoints).commands;
    };
    this._fpgmState  =
    this._prepState  =
        undefined;
    this._errorState = 0;
}
function roundOff(v) {
    return v;
}
function roundToGrid(v) {
    return Math.sign(v) * Math.round(Math.abs(v));
}
function roundToDoubleGrid(v) {
    return Math.sign(v) * Math.round(Math.abs(v * 2)) / 2;
}
function roundToHalfGrid(v) {
    return Math.sign(v) * (Math.round(Math.abs(v) + 0.5) - 0.5);
}
function roundUpToGrid(v) {
    return Math.sign(v) * Math.ceil(Math.abs(v));
}
function roundDownToGrid(v) {
    return Math.sign(v) * Math.floor(Math.abs(v));
}
var roundSuper = function (v) {
    var period = this.srPeriod;
    var phase = this.srPhase;
    var threshold = this.srThreshold;
    var sign = 1;
    if (v < 0) {
        v = -v;
        sign = -1;
    }
    v += threshold - phase;
    v = Math.trunc(v / period) * period;
    v += phase;
    if (v < 0) { return phase * sign; }
    return v * sign;
};
var xUnitVector = {
    x: 1,
    y: 0,
    axis: 'x',
    distance: function (p1, p2, o1, o2) {
        return (o1 ? p1.xo : p1.x) - (o2 ? p2.xo : p2.x);
    },
    interpolate: function (p, rp1, rp2, pv) {
        var do1;
        var do2;
        var doa1;
        var doa2;
        var dm1;
        var dm2;
        var dt;
        if (!pv || pv === this) {
            do1 = p.xo - rp1.xo;
            do2 = p.xo - rp2.xo;
            dm1 = rp1.x - rp1.xo;
            dm2 = rp2.x - rp2.xo;
            doa1 = Math.abs(do1);
            doa2 = Math.abs(do2);
            dt = doa1 + doa2;
            if (dt === 0) {
                p.x = p.xo + (dm1 + dm2) / 2;
                return;
            }
            p.x = p.xo + (dm1 * doa2 + dm2 * doa1) / dt;
            return;
        }
        do1 = pv.distance(p, rp1, true, true);
        do2 = pv.distance(p, rp2, true, true);
        dm1 = pv.distance(rp1, rp1, false, true);
        dm2 = pv.distance(rp2, rp2, false, true);
        doa1 = Math.abs(do1);
        doa2 = Math.abs(do2);
        dt = doa1 + doa2;
        if (dt === 0) {
            xUnitVector.setRelative(p, p, (dm1 + dm2) / 2, pv, true);
            return;
        }
        xUnitVector.setRelative(p, p, (dm1 * doa2 + dm2 * doa1) / dt, pv, true);
    },
    normalSlope: Number.NEGATIVE_INFINITY,
    setRelative: function (p, rp, d, pv, org) {
        if (!pv || pv === this) {
            p.x = (org ? rp.xo : rp.x) + d;
            return;
        }
        var rpx = org ? rp.xo : rp.x;
        var rpy = org ? rp.yo : rp.y;
        var rpdx = rpx + d * pv.x;
        var rpdy = rpy + d * pv.y;
        p.x = rpdx + (p.y - rpdy) / pv.normalSlope;
    },
    slope: 0,
    touch: function (p) {
        p.xTouched = true;
    },
    touched: function (p) {
        return p.xTouched;
    },
    untouch: function (p) {
        p.xTouched = false;
    }
};
var yUnitVector = {
    x: 0,
    y: 1,
    axis: 'y',
    distance: function (p1, p2, o1, o2) {
        return (o1 ? p1.yo : p1.y) - (o2 ? p2.yo : p2.y);
    },
    interpolate: function (p, rp1, rp2, pv) {
        var do1;
        var do2;
        var doa1;
        var doa2;
        var dm1;
        var dm2;
        var dt;
        if (!pv || pv === this) {
            do1 = p.yo - rp1.yo;
            do2 = p.yo - rp2.yo;
            dm1 = rp1.y - rp1.yo;
            dm2 = rp2.y - rp2.yo;
            doa1 = Math.abs(do1);
            doa2 = Math.abs(do2);
            dt = doa1 + doa2;
            if (dt === 0) {
                p.y = p.yo + (dm1 + dm2) / 2;
                return;
            }
            p.y = p.yo + (dm1 * doa2 + dm2 * doa1) / dt;
            return;
        }
        do1 = pv.distance(p, rp1, true, true);
        do2 = pv.distance(p, rp2, true, true);
        dm1 = pv.distance(rp1, rp1, false, true);
        dm2 = pv.distance(rp2, rp2, false, true);
        doa1 = Math.abs(do1);
        doa2 = Math.abs(do2);
        dt = doa1 + doa2;
        if (dt === 0) {
            yUnitVector.setRelative(p, p, (dm1 + dm2) / 2, pv, true);
            return;
        }
        yUnitVector.setRelative(p, p, (dm1 * doa2 + dm2 * doa1) / dt, pv, true);
    },
    normalSlope: 0,
    setRelative: function (p, rp, d, pv, org) {
        if (!pv || pv === this) {
            p.y = (org ? rp.yo : rp.y) + d;
            return;
        }
        var rpx = org ? rp.xo : rp.x;
        var rpy = org ? rp.yo : rp.y;
        var rpdx = rpx + d * pv.x;
        var rpdy = rpy + d * pv.y;
        p.y = rpdy + pv.normalSlope * (p.x - rpdx);
    },
    slope: Number.POSITIVE_INFINITY,
    touch: function (p) {
        p.yTouched = true;
    },
    touched: function (p) {
        return p.yTouched;
    },
    untouch: function (p) {
        p.yTouched = false;
    }
};
Object.freeze(xUnitVector);
Object.freeze(yUnitVector);
function UnitVector(x, y) {
    this.x = x;
    this.y = y;
    this.axis = undefined;
    this.slope = y / x;
    this.normalSlope = -x / y;
    Object.freeze(this);
}
UnitVector.prototype.distance = function(p1, p2, o1, o2) {
    return (
        this.x * xUnitVector.distance(p1, p2, o1, o2) +
        this.y * yUnitVector.distance(p1, p2, o1, o2)
    );
};
UnitVector.prototype.interpolate = function(p, rp1, rp2, pv) {
    var dm1;
    var dm2;
    var do1;
    var do2;
    var doa1;
    var doa2;
    var dt;
    do1 = pv.distance(p, rp1, true, true);
    do2 = pv.distance(p, rp2, true, true);
    dm1 = pv.distance(rp1, rp1, false, true);
    dm2 = pv.distance(rp2, rp2, false, true);
    doa1 = Math.abs(do1);
    doa2 = Math.abs(do2);
    dt = doa1 + doa2;
    if (dt === 0) {
        this.setRelative(p, p, (dm1 + dm2) / 2, pv, true);
        return;
    }
    this.setRelative(p, p, (dm1 * doa2 + dm2 * doa1) / dt, pv, true);
};
UnitVector.prototype.setRelative = function(p, rp, d, pv, org) {
    pv = pv || this;
    var rpx = org ? rp.xo : rp.x;
    var rpy = org ? rp.yo : rp.y;
    var rpdx = rpx + d * pv.x;
    var rpdy = rpy + d * pv.y;
    var pvns = pv.normalSlope;
    var fvs = this.slope;
    var px = p.x;
    var py = p.y;
    p.x = (fvs * px - pvns * rpdx + rpdy - py) / (fvs - pvns);
    p.y = fvs * (p.x - px) + py;
};
UnitVector.prototype.touch = function(p) {
    p.xTouched = true;
    p.yTouched = true;
};
function getUnitVector(x, y) {
    var d = Math.sqrt(x * x + y * y);
    x /= d;
    y /= d;
    if (x === 1 && y === 0) { return xUnitVector; }
    else if (x === 0 && y === 1) { return yUnitVector; }
    else { return new UnitVector(x, y); }
}
function HPoint(
    x,
    y,
    lastPointOfContour,
    onCurve
) {
    this.x = this.xo = Math.round(x * 64) / 64;
    this.y = this.yo = Math.round(y * 64) / 64;
    this.lastPointOfContour = lastPointOfContour;
    this.onCurve = onCurve;
    this.prevPointOnContour = undefined;
    this.nextPointOnContour = undefined;
    this.xTouched = false;
    this.yTouched = false;
    Object.preventExtensions(this);
}
HPoint.prototype.nextTouched = function(v) {
    var p = this.nextPointOnContour;
    while (!v.touched(p) && p !== this) { p = p.nextPointOnContour; }
    return p;
};
HPoint.prototype.prevTouched = function(v) {
    var p = this.prevPointOnContour;
    while (!v.touched(p) && p !== this) { p = p.prevPointOnContour; }
    return p;
};
var HPZero = Object.freeze(new HPoint(0, 0));
var defaultState = {
    cvCutIn: 17 / 16,
    deltaBase: 9,
    deltaShift: 0.125,
    loop: 1,
    minDis: 1,
    autoFlip: true
};
function State(env, prog) {
    this.env = env;
    this.stack = [];
    this.prog = prog;
    switch (env) {
        case 'glyf' :
            this.zp0 = this.zp1 = this.zp2 = 1;
            this.rp0 = this.rp1 = this.rp2 = 0;
        case 'prep' :
            this.fv = this.pv = this.dpv = xUnitVector;
            this.round = roundToGrid;
    }
}
Hinting.prototype.exec = function(glyph, ppem) {
    if (typeof ppem !== 'number') {
        throw new Error('Point size is not a number!');
    }
    if (this._errorState > 2) { return; }
    var font = this.font;
    var prepState = this._prepState;
    if (!prepState || prepState.ppem !== ppem) {
        var fpgmState = this._fpgmState;
        if (!fpgmState) {
            State.prototype = defaultState;
            fpgmState =
            this._fpgmState =
                new State('fpgm', font.tables.fpgm);
            fpgmState.funcs = [ ];
            fpgmState.font = font;
            if (exports.DEBUG) {
                console.log('---EXEC FPGM---');
                fpgmState.step = -1;
            }
            try {
                exec(fpgmState);
            } catch (e) {
                console.log('Hinting error in FPGM:' + e);
                this._errorState = 3;
                return;
            }
        }
        State.prototype = fpgmState;
        prepState =
        this._prepState =
            new State('prep', font.tables.prep);
        prepState.ppem = ppem;
        var oCvt = font.tables.cvt;
        if (oCvt) {
            var cvt = prepState.cvt = new Array(oCvt.length);
            var scale = ppem / font.unitsPerEm;
            for (var c = 0; c < oCvt.length; c++) {
                cvt[c] = oCvt[c] * scale;
            }
        } else {
            prepState.cvt = [];
        }
        if (exports.DEBUG) {
            console.log('---EXEC PREP---');
            prepState.step = -1;
        }
        try {
            exec(prepState);
        } catch (e) {
            if (this._errorState < 2) {
                console.log('Hinting error in PREP:' + e);
            }
            this._errorState = 2;
        }
    }
    if (this._errorState > 1) { return; }
    try {
        return execGlyph(glyph, prepState);
    } catch (e) {
        if (this._errorState < 1) {
            console.log('Hinting error:' + e);
            console.log('Note: further hinting errors are silenced');
        }
        this._errorState = 1;
        return undefined;
    }
};
execGlyph = function(glyph, prepState) {
    var xScale = prepState.ppem / prepState.font.unitsPerEm;
    var yScale = xScale;
    var components = glyph.components;
    var contours;
    var gZone;
    var state;
    State.prototype = prepState;
    if (!components) {
        state = new State('glyf', glyph.instructions);
        if (exports.DEBUG) {
            console.log('---EXEC GLYPH---');
            state.step = -1;
        }
        execComponent(glyph, state, xScale, yScale);
        gZone = state.gZone;
    } else {
        var font = prepState.font;
        gZone = [];
        contours = [];
        for (var i = 0; i < components.length; i++) {
            var c = components[i];
            var cg = font.glyphs.get(c.glyphIndex);
            state = new State('glyf', cg.instructions);
            if (exports.DEBUG) {
                console.log('---EXEC COMP ' + i + '---');
                state.step = -1;
            }
            execComponent(cg, state, xScale, yScale);
            var dx = Math.round(c.dx * xScale);
            var dy = Math.round(c.dy * yScale);
            var gz = state.gZone;
            var cc = state.contours;
            for (var pi = 0; pi < gz.length; pi++) {
                var p = gz[pi];
                p.xTouched = p.yTouched = false;
                p.xo = p.x = p.x + dx;
                p.yo = p.y = p.y + dy;
            }
            var gLen = gZone.length;
            gZone.push.apply(gZone, gz);
            for (var j = 0; j < cc.length; j++) {
                contours.push(cc[j] + gLen);
            }
        }
        if (glyph.instructions && !state.inhibitGridFit) {
            state = new State('glyf', glyph.instructions);
            state.gZone = state.z0 = state.z1 = state.z2 = gZone;
            state.contours = contours;
            gZone.push(
                new HPoint(0, 0),
                new HPoint(Math.round(glyph.advanceWidth * xScale), 0)
            );
            if (exports.DEBUG) {
                console.log('---EXEC COMPOSITE---');
                state.step = -1;
            }
            exec(state);
            gZone.length -= 2;
        }
    }
    return gZone;
};
execComponent = function(glyph, state, xScale, yScale)
{
    var points = glyph.points || [];
    var pLen = points.length;
    var gZone = state.gZone = state.z0 = state.z1 = state.z2 = [];
    var contours = state.contours = [];
    var cp;
    for (var i = 0; i < pLen; i++) {
        cp = points[i];
        gZone[i] = new HPoint(
            cp.x * xScale,
            cp.y * yScale,
            cp.lastPointOfContour,
            cp.onCurve
        );
    }
    var sp;
    var np;
    for (var i$1 = 0; i$1 < pLen; i$1++) {
        cp = gZone[i$1];
        if (!sp) {
            sp = cp;
            contours.push(i$1);
        }
        if (cp.lastPointOfContour) {
            cp.nextPointOnContour = sp;
            sp.prevPointOnContour = cp;
            sp = undefined;
        } else {
            np = gZone[i$1 + 1];
            cp.nextPointOnContour = np;
            np.prevPointOnContour = cp;
        }
    }
    if (state.inhibitGridFit) { return; }
    if (exports.DEBUG) {
        console.log('PROCESSING GLYPH', state.stack);
        for (var i$2 = 0; i$2 < pLen; i$2++) {
            console.log(i$2, gZone[i$2].x, gZone[i$2].y);
        }
    }
    gZone.push(
        new HPoint(0, 0),
        new HPoint(Math.round(glyph.advanceWidth * xScale), 0)
    );
    exec(state);
    gZone.length -= 2;
    if (exports.DEBUG) {
        console.log('FINISHED GLYPH', state.stack);
        for (var i$3 = 0; i$3 < pLen; i$3++) {
            console.log(i$3, gZone[i$3].x, gZone[i$3].y);
        }
    }
};
exec = function(state) {
    var prog = state.prog;
    if (!prog) { return; }
    var pLen = prog.length;
    var ins;
    for (state.ip = 0; state.ip < pLen; state.ip++) {
        if (exports.DEBUG) { state.step++; }
        ins = instructionTable[prog[state.ip]];
        if (!ins) {
            throw new Error(
                'unknown instruction: 0x' +
                Number(prog[state.ip]).toString(16)
            );
        }
        ins(state);
    }
};
function initTZone(state)
{
    var tZone = state.tZone = new Array(state.gZone.length);
    for (var i = 0; i < tZone.length; i++)
    {
        tZone[i] = new HPoint(0, 0);
    }
}
function skip(state, handleElse)
{
    var prog = state.prog;
    var ip = state.ip;
    var nesting = 1;
    var ins;
    do {
        ins = prog[++ip];
        if (ins === 0x58)
            { nesting++; }
        else if (ins === 0x59)
            { nesting--; }
        else if (ins === 0x40)
            { ip += prog[ip + 1] + 1; }
        else if (ins === 0x41)
            { ip += 2 * prog[ip + 1] + 1; }
        else if (ins >= 0xB0 && ins <= 0xB7)
            { ip += ins - 0xB0 + 1; }
        else if (ins >= 0xB8 && ins <= 0xBF)
            { ip += (ins - 0xB8 + 1) * 2; }
        else if (handleElse && nesting === 1 && ins === 0x1B)
            { break; }
    } while (nesting > 0);
    state.ip = ip;
}
function SVTCA(v, state) {
    if (exports.DEBUG) { console.log(state.step, 'SVTCA[' + v.axis + ']'); }
    state.fv = state.pv = state.dpv = v;
}
function SPVTCA(v, state) {
    if (exports.DEBUG) { console.log(state.step, 'SPVTCA[' + v.axis + ']'); }
    state.pv = state.dpv = v;
}
function SFVTCA(v, state) {
    if (exports.DEBUG) { console.log(state.step, 'SFVTCA[' + v.axis + ']'); }
    state.fv = v;
}
function SPVTL(a, state) {
    var stack = state.stack;
    var p2i = stack.pop();
    var p1i = stack.pop();
    var p2 = state.z2[p2i];
    var p1 = state.z1[p1i];
    if (exports.DEBUG) { console.log('SPVTL[' + a + ']', p2i, p1i); }
    var dx;
    var dy;
    if (!a) {
        dx = p1.x - p2.x;
        dy = p1.y - p2.y;
    } else {
        dx = p2.y - p1.y;
        dy = p1.x - p2.x;
    }
    state.pv = state.dpv = getUnitVector(dx, dy);
}
function SFVTL(a, state) {
    var stack = state.stack;
    var p2i = stack.pop();
    var p1i = stack.pop();
    var p2 = state.z2[p2i];
    var p1 = state.z1[p1i];
    if (exports.DEBUG) { console.log('SFVTL[' + a + ']', p2i, p1i); }
    var dx;
    var dy;
    if (!a) {
        dx = p1.x - p2.x;
        dy = p1.y - p2.y;
    } else {
        dx = p2.y - p1.y;
        dy = p1.x - p2.x;
    }
    state.fv = getUnitVector(dx, dy);
}
function SPVFS(state) {
    var stack = state.stack;
    var y = stack.pop();
    var x = stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'SPVFS[]', y, x); }
    state.pv = state.dpv = getUnitVector(x, y);
}
function SFVFS(state) {
    var stack = state.stack;
    var y = stack.pop();
    var x = stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'SPVFS[]', y, x); }
    state.fv = getUnitVector(x, y);
}
function GPV(state) {
    var stack = state.stack;
    var pv = state.pv;
    if (exports.DEBUG) { console.log(state.step, 'GPV[]'); }
    stack.push(pv.x * 0x4000);
    stack.push(pv.y * 0x4000);
}
function GFV(state) {
    var stack = state.stack;
    var fv = state.fv;
    if (exports.DEBUG) { console.log(state.step, 'GFV[]'); }
    stack.push(fv.x * 0x4000);
    stack.push(fv.y * 0x4000);
}
function SFVTPV(state) {
    state.fv = state.pv;
    if (exports.DEBUG) { console.log(state.step, 'SFVTPV[]'); }
}
function ISECT(state)
{
    var stack = state.stack;
    var pa0i = stack.pop();
    var pa1i = stack.pop();
    var pb0i = stack.pop();
    var pb1i = stack.pop();
    var pi = stack.pop();
    var z0 = state.z0;
    var z1 = state.z1;
    var pa0 = z0[pa0i];
    var pa1 = z0[pa1i];
    var pb0 = z1[pb0i];
    var pb1 = z1[pb1i];
    var p = state.z2[pi];
    if (exports.DEBUG) { console.log('ISECT[], ', pa0i, pa1i, pb0i, pb1i, pi); }
    var x1 = pa0.x;
    var y1 = pa0.y;
    var x2 = pa1.x;
    var y2 = pa1.y;
    var x3 = pb0.x;
    var y3 = pb0.y;
    var x4 = pb1.x;
    var y4 = pb1.y;
    var div = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    var f1 = x1 * y2 - y1 * x2;
    var f2 = x3 * y4 - y3 * x4;
    p.x = (f1 * (x3 - x4) - f2 * (x1 - x2)) / div;
    p.y = (f1 * (y3 - y4) - f2 * (y1 - y2)) / div;
}
function SRP0(state) {
    state.rp0 = state.stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'SRP0[]', state.rp0); }
}
function SRP1(state) {
    state.rp1 = state.stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'SRP1[]', state.rp1); }
}
function SRP2(state) {
    state.rp2 = state.stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'SRP2[]', state.rp2); }
}
function SZP0(state) {
    var n = state.stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'SZP0[]', n); }
    state.zp0 = n;
    switch (n) {
        case 0:
            if (!state.tZone) { initTZone(state); }
            state.z0 = state.tZone;
            break;
        case 1 :
            state.z0 = state.gZone;
            break;
        default :
            throw new Error('Invalid zone pointer');
    }
}
function SZP1(state) {
    var n = state.stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'SZP1[]', n); }
    state.zp1 = n;
    switch (n) {
        case 0:
            if (!state.tZone) { initTZone(state); }
            state.z1 = state.tZone;
            break;
        case 1 :
            state.z1 = state.gZone;
            break;
        default :
            throw new Error('Invalid zone pointer');
    }
}
function SZP2(state) {
    var n = state.stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'SZP2[]', n); }
    state.zp2 = n;
    switch (n) {
        case 0:
            if (!state.tZone) { initTZone(state); }
            state.z2 = state.tZone;
            break;
        case 1 :
            state.z2 = state.gZone;
            break;
        default :
            throw new Error('Invalid zone pointer');
    }
}
function SZPS(state) {
    var n = state.stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'SZPS[]', n); }
    state.zp0 = state.zp1 = state.zp2 = n;
    switch (n) {
        case 0:
            if (!state.tZone) { initTZone(state); }
            state.z0 = state.z1 = state.z2 = state.tZone;
            break;
        case 1 :
            state.z0 = state.z1 = state.z2 = state.gZone;
            break;
        default :
            throw new Error('Invalid zone pointer');
    }
}
function SLOOP(state) {
    state.loop = state.stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'SLOOP[]', state.loop); }
}
function RTG(state) {
    if (exports.DEBUG) { console.log(state.step, 'RTG[]'); }
    state.round = roundToGrid;
}
function RTHG(state) {
    if (exports.DEBUG) { console.log(state.step, 'RTHG[]'); }
    state.round = roundToHalfGrid;
}
function SMD(state) {
    var d = state.stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'SMD[]', d); }
    state.minDis = d / 0x40;
}
function ELSE(state) {
    if (exports.DEBUG) { console.log(state.step, 'ELSE[]'); }
    skip(state, false);
}
function JMPR(state) {
    var o = state.stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'JMPR[]', o); }
    state.ip += o - 1;
}
function SCVTCI(state) {
    var n = state.stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'SCVTCI[]', n); }
    state.cvCutIn = n / 0x40;
}
function DUP(state) {
    var stack = state.stack;
    if (exports.DEBUG) { console.log(state.step, 'DUP[]'); }
    stack.push(stack[stack.length - 1]);
}
function POP(state) {
    if (exports.DEBUG) { console.log(state.step, 'POP[]'); }
    state.stack.pop();
}
function CLEAR(state) {
    if (exports.DEBUG) { console.log(state.step, 'CLEAR[]'); }
    state.stack.length = 0;
}
function SWAP(state) {
    var stack = state.stack;
    var a = stack.pop();
    var b = stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'SWAP[]'); }
    stack.push(a);
    stack.push(b);
}
function DEPTH(state) {
    var stack = state.stack;
    if (exports.DEBUG) { console.log(state.step, 'DEPTH[]'); }
    stack.push(stack.length);
}
function LOOPCALL(state) {
    var stack = state.stack;
    var fn = stack.pop();
    var c = stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'LOOPCALL[]', fn, c); }
    var cip = state.ip;
    var cprog = state.prog;
    state.prog = state.funcs[fn];
    for (var i = 0; i < c; i++) {
        exec(state);
        if (exports.DEBUG) { console.log(
            ++state.step,
            i + 1 < c ? 'next loopcall' : 'done loopcall',
            i
        ); }
    }
    state.ip = cip;
    state.prog = cprog;
}
function CALL(state) {
    var fn = state.stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'CALL[]', fn); }
    var cip = state.ip;
    var cprog = state.prog;
    state.prog = state.funcs[fn];
    exec(state);
    state.ip = cip;
    state.prog = cprog;
    if (exports.DEBUG) { console.log(++state.step, 'returning from', fn); }
}
function CINDEX(state) {
    var stack = state.stack;
    var k = stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'CINDEX[]', k); }
    stack.push(stack[stack.length - k]);
}
function MINDEX(state) {
    var stack = state.stack;
    var k = stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'MINDEX[]', k); }
    stack.push(stack.splice(stack.length - k, 1)[0]);
}
function FDEF(state) {
    if (state.env !== 'fpgm') { throw new Error('FDEF not allowed here'); }
    var stack = state.stack;
    var prog = state.prog;
    var ip = state.ip;
    var fn = stack.pop();
    var ipBegin = ip;
    if (exports.DEBUG) { console.log(state.step, 'FDEF[]', fn); }
    while (prog[++ip] !== 0x2D){ }
    state.ip = ip;
    state.funcs[fn] = prog.slice(ipBegin + 1, ip);
}
function MDAP(round, state) {
    var pi = state.stack.pop();
    var p = state.z0[pi];
    var fv = state.fv;
    var pv = state.pv;
    if (exports.DEBUG) { console.log(state.step, 'MDAP[' + round + ']', pi); }
    var d = pv.distance(p, HPZero);
    if (round) { d = state.round(d); }
    fv.setRelative(p, HPZero, d, pv);
    fv.touch(p);
    state.rp0 = state.rp1 = pi;
}
function IUP(v, state) {
    var z2 = state.z2;
    var pLen = z2.length - 2;
    var cp;
    var pp;
    var np;
    if (exports.DEBUG) { console.log(state.step, 'IUP[' + v.axis + ']'); }
    for (var i = 0; i < pLen; i++) {
        cp = z2[i];
        if (v.touched(cp)) { continue; }
        pp = cp.prevTouched(v);
        if (pp === cp) { continue; }
        np = cp.nextTouched(v);
        if (pp === np) {
            v.setRelative(cp, cp, v.distance(pp, pp, false, true), v, true);
        }
        v.interpolate(cp, pp, np, v);
    }
}
function SHP(a, state) {
    var stack = state.stack;
    var rpi = a ? state.rp1 : state.rp2;
    var rp = (a ? state.z0 : state.z1)[rpi];
    var fv = state.fv;
    var pv = state.pv;
    var loop = state.loop;
    var z2 = state.z2;
    while (loop--)
    {
        var pi = stack.pop();
        var p = z2[pi];
        var d = pv.distance(rp, rp, false, true);
        fv.setRelative(p, p, d, pv);
        fv.touch(p);
        if (exports.DEBUG) {
            console.log(
                state.step,
                (state.loop > 1 ?
                   'loop ' + (state.loop - loop) + ': ' :
                   ''
                ) +
                'SHP[' + (a ? 'rp1' : 'rp2') + ']', pi
            );
        }
    }
    state.loop = 1;
}
function SHC(a, state) {
    var stack = state.stack;
    var rpi = a ? state.rp1 : state.rp2;
    var rp = (a ? state.z0 : state.z1)[rpi];
    var fv = state.fv;
    var pv = state.pv;
    var ci = stack.pop();
    var sp = state.z2[state.contours[ci]];
    var p = sp;
    if (exports.DEBUG) { console.log(state.step, 'SHC[' + a + ']', ci); }
    var d = pv.distance(rp, rp, false, true);
    do {
        if (p !== rp) { fv.setRelative(p, p, d, pv); }
        p = p.nextPointOnContour;
    } while (p !== sp);
}
function SHZ(a, state) {
    var stack = state.stack;
    var rpi = a ? state.rp1 : state.rp2;
    var rp = (a ? state.z0 : state.z1)[rpi];
    var fv = state.fv;
    var pv = state.pv;
    var e = stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'SHZ[' + a + ']', e); }
    var z;
    switch (e) {
        case 0 : z = state.tZone; break;
        case 1 : z = state.gZone; break;
        default : throw new Error('Invalid zone');
    }
    var p;
    var d = pv.distance(rp, rp, false, true);
    var pLen = z.length - 2;
    for (var i = 0; i < pLen; i++)
    {
        p = z[i];
        fv.setRelative(p, p, d, pv);
    }
}
function SHPIX(state) {
    var stack = state.stack;
    var loop = state.loop;
    var fv = state.fv;
    var d = stack.pop() / 0x40;
    var z2 = state.z2;
    while (loop--) {
        var pi = stack.pop();
        var p = z2[pi];
        if (exports.DEBUG) {
            console.log(
                state.step,
                (state.loop > 1 ? 'loop ' + (state.loop - loop) + ': ' : '') +
                'SHPIX[]', pi, d
            );
        }
        fv.setRelative(p, p, d);
        fv.touch(p);
    }
    state.loop = 1;
}
function IP(state) {
    var stack = state.stack;
    var rp1i = state.rp1;
    var rp2i = state.rp2;
    var loop = state.loop;
    var rp1 = state.z0[rp1i];
    var rp2 = state.z1[rp2i];
    var fv = state.fv;
    var pv = state.dpv;
    var z2 = state.z2;
    while (loop--) {
        var pi = stack.pop();
        var p = z2[pi];
        if (exports.DEBUG) {
            console.log(
                state.step,
                (state.loop > 1 ? 'loop ' + (state.loop - loop) + ': ' : '') +
                'IP[]', pi, rp1i, '<->', rp2i
            );
        }
        fv.interpolate(p, rp1, rp2, pv);
        fv.touch(p);
    }
    state.loop = 1;
}
function MSIRP(a, state) {
    var stack = state.stack;
    var d = stack.pop() / 64;
    var pi = stack.pop();
    var p = state.z1[pi];
    var rp0 = state.z0[state.rp0];
    var fv = state.fv;
    var pv = state.pv;
    fv.setRelative(p, rp0, d, pv);
    fv.touch(p);
    if (exports.DEBUG) { console.log(state.step, 'MSIRP[' + a + ']', d, pi); }
    state.rp1 = state.rp0;
    state.rp2 = pi;
    if (a) { state.rp0 = pi; }
}
function ALIGNRP(state) {
    var stack = state.stack;
    var rp0i = state.rp0;
    var rp0 = state.z0[rp0i];
    var loop = state.loop;
    var fv = state.fv;
    var pv = state.pv;
    var z1 = state.z1;
    while (loop--) {
        var pi = stack.pop();
        var p = z1[pi];
        if (exports.DEBUG) {
            console.log(
                state.step,
                (state.loop > 1 ? 'loop ' + (state.loop - loop) + ': ' : '') +
                'ALIGNRP[]', pi
            );
        }
        fv.setRelative(p, rp0, 0, pv);
        fv.touch(p);
    }
    state.loop = 1;
}
function RTDG(state) {
    if (exports.DEBUG) { console.log(state.step, 'RTDG[]'); }
    state.round = roundToDoubleGrid;
}
function MIAP(round, state) {
    var stack = state.stack;
    var n = stack.pop();
    var pi = stack.pop();
    var p = state.z0[pi];
    var fv = state.fv;
    var pv = state.pv;
    var cv = state.cvt[n];
    if (exports.DEBUG) {
        console.log(
            state.step,
            'MIAP[' + round + ']',
            n, '(', cv, ')', pi
        );
    }
    var d = pv.distance(p, HPZero);
    if (round) {
        if (Math.abs(d - cv) < state.cvCutIn) { d = cv; }
        d = state.round(d);
    }
    fv.setRelative(p, HPZero, d, pv);
    if (state.zp0 === 0) {
        p.xo = p.x;
        p.yo = p.y;
    }
    fv.touch(p);
    state.rp0 = state.rp1 = pi;
}
function NPUSHB(state) {
    var prog = state.prog;
    var ip = state.ip;
    var stack = state.stack;
    var n = prog[++ip];
    if (exports.DEBUG) { console.log(state.step, 'NPUSHB[]', n); }
    for (var i = 0; i < n; i++) { stack.push(prog[++ip]); }
    state.ip = ip;
}
function NPUSHW(state) {
    var ip = state.ip;
    var prog = state.prog;
    var stack = state.stack;
    var n = prog[++ip];
    if (exports.DEBUG) { console.log(state.step, 'NPUSHW[]', n); }
    for (var i = 0; i < n; i++) {
        var w = (prog[++ip] << 8) | prog[++ip];
        if (w & 0x8000) { w = -((w ^ 0xffff) + 1); }
        stack.push(w);
    }
    state.ip = ip;
}
function WS(state) {
    var stack = state.stack;
    var store = state.store;
    if (!store) { store = state.store = []; }
    var v = stack.pop();
    var l = stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'WS', v, l); }
    store[l] = v;
}
function RS(state) {
    var stack = state.stack;
    var store = state.store;
    var l = stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'RS', l); }
    var v = (store && store[l]) || 0;
    stack.push(v);
}
function WCVTP(state) {
    var stack = state.stack;
    var v = stack.pop();
    var l = stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'WCVTP', v, l); }
    state.cvt[l] = v / 0x40;
}
function RCVT(state) {
    var stack = state.stack;
    var cvte = stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'RCVT', cvte); }
    stack.push(state.cvt[cvte] * 0x40);
}
function GC(a, state) {
    var stack = state.stack;
    var pi = stack.pop();
    var p = state.z2[pi];
    if (exports.DEBUG) { console.log(state.step, 'GC[' + a + ']', pi); }
    stack.push(state.dpv.distance(p, HPZero, a, false) * 0x40);
}
function MD(a, state) {
    var stack = state.stack;
    var pi2 = stack.pop();
    var pi1 = stack.pop();
    var p2 = state.z1[pi2];
    var p1 = state.z0[pi1];
    var d = state.dpv.distance(p1, p2, a, a);
    if (exports.DEBUG) { console.log(state.step, 'MD[' + a + ']', pi2, pi1, '->', d); }
    state.stack.push(Math.round(d * 64));
}
function MPPEM(state) {
    if (exports.DEBUG) { console.log(state.step, 'MPPEM[]'); }
    state.stack.push(state.ppem);
}
function FLIPON(state) {
    if (exports.DEBUG) { console.log(state.step, 'FLIPON[]'); }
    state.autoFlip = true;
}
function LT(state) {
    var stack = state.stack;
    var e2 = stack.pop();
    var e1 = stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'LT[]', e2, e1); }
    stack.push(e1 < e2 ? 1 : 0);
}
function LTEQ(state) {
    var stack = state.stack;
    var e2 = stack.pop();
    var e1 = stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'LTEQ[]', e2, e1); }
    stack.push(e1 <= e2 ? 1 : 0);
}
function GT(state) {
    var stack = state.stack;
    var e2 = stack.pop();
    var e1 = stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'GT[]', e2, e1); }
    stack.push(e1 > e2 ? 1 : 0);
}
function GTEQ(state) {
    var stack = state.stack;
    var e2 = stack.pop();
    var e1 = stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'GTEQ[]', e2, e1); }
    stack.push(e1 >= e2 ? 1 : 0);
}
function EQ(state) {
    var stack = state.stack;
    var e2 = stack.pop();
    var e1 = stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'EQ[]', e2, e1); }
    stack.push(e2 === e1 ? 1 : 0);
}
function NEQ(state) {
    var stack = state.stack;
    var e2 = stack.pop();
    var e1 = stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'NEQ[]', e2, e1); }
    stack.push(e2 !== e1 ? 1 : 0);
}
function ODD(state) {
    var stack = state.stack;
    var n = stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'ODD[]', n); }
    stack.push(Math.trunc(n) % 2 ? 1 : 0);
}
function EVEN(state) {
    var stack = state.stack;
    var n = stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'EVEN[]', n); }
    stack.push(Math.trunc(n) % 2 ? 0 : 1);
}
function IF(state) {
    var test = state.stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'IF[]', test); }
    if (!test) {
        skip(state, true);
        if (exports.DEBUG) { console.log(state.step,  'EIF[]'); }
    }
}
function EIF(state) {
    if (exports.DEBUG) { console.log(state.step, 'EIF[]'); }
}
function AND(state) {
    var stack = state.stack;
    var e2 = stack.pop();
    var e1 = stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'AND[]', e2, e1); }
    stack.push(e2 && e1 ? 1 : 0);
}
function OR(state) {
    var stack = state.stack;
    var e2 = stack.pop();
    var e1 = stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'OR[]', e2, e1); }
    stack.push(e2 || e1 ? 1 : 0);
}
function NOT(state) {
    var stack = state.stack;
    var e = stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'NOT[]', e); }
    stack.push(e ? 0 : 1);
}
function DELTAP123(b, state) {
    var stack = state.stack;
    var n = stack.pop();
    var fv = state.fv;
    var pv = state.pv;
    var ppem = state.ppem;
    var base = state.deltaBase + (b - 1) * 16;
    var ds = state.deltaShift;
    var z0 = state.z0;
    if (exports.DEBUG) { console.log(state.step, 'DELTAP[' + b + ']', n, stack); }
    for (var i = 0; i < n; i++) {
        var pi = stack.pop();
        var arg = stack.pop();
        var appem = base + ((arg & 0xF0) >> 4);
        if (appem !== ppem) { continue; }
        var mag = (arg & 0x0F) - 8;
        if (mag >= 0) { mag++; }
        if (exports.DEBUG) { console.log(state.step, 'DELTAPFIX', pi, 'by', mag * ds); }
        var p = z0[pi];
        fv.setRelative(p, p, mag * ds, pv);
    }
}
function SDB(state) {
    var stack = state.stack;
    var n = stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'SDB[]', n); }
    state.deltaBase = n;
}
function SDS(state) {
    var stack = state.stack;
    var n = stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'SDS[]', n); }
    state.deltaShift = Math.pow(0.5, n);
}
function ADD(state) {
    var stack = state.stack;
    var n2 = stack.pop();
    var n1 = stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'ADD[]', n2, n1); }
    stack.push(n1 + n2);
}
function SUB(state) {
    var stack = state.stack;
    var n2 = stack.pop();
    var n1 = stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'SUB[]', n2, n1); }
    stack.push(n1 - n2);
}
function DIV(state) {
    var stack = state.stack;
    var n2 = stack.pop();
    var n1 = stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'DIV[]', n2, n1); }
    stack.push(n1 * 64 / n2);
}
function MUL(state) {
    var stack = state.stack;
    var n2 = stack.pop();
    var n1 = stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'MUL[]', n2, n1); }
    stack.push(n1 * n2 / 64);
}
function ABS(state) {
    var stack = state.stack;
    var n = stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'ABS[]', n); }
    stack.push(Math.abs(n));
}
function NEG(state) {
    var stack = state.stack;
    var n = stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'NEG[]', n); }
    stack.push(-n);
}
function FLOOR(state) {
    var stack = state.stack;
    var n = stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'FLOOR[]', n); }
    stack.push(Math.floor(n / 0x40) * 0x40);
}
function CEILING(state) {
    var stack = state.stack;
    var n = stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'CEILING[]', n); }
    stack.push(Math.ceil(n / 0x40) * 0x40);
}
function ROUND$1(dt, state) {
    var stack = state.stack;
    var n = stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'ROUND[]'); }
    stack.push(state.round(n / 0x40) * 0x40);
}
function WCVTF(state) {
    var stack = state.stack;
    var v = stack.pop();
    var l = stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'WCVTF[]', v, l); }
    state.cvt[l] = v * state.ppem / state.font.unitsPerEm;
}
function DELTAC123(b, state) {
    var stack = state.stack;
    var n = stack.pop();
    var ppem = state.ppem;
    var base = state.deltaBase + (b - 1) * 16;
    var ds = state.deltaShift;
    if (exports.DEBUG) { console.log(state.step, 'DELTAC[' + b + ']', n, stack); }
    for (var i = 0; i < n; i++) {
        var c = stack.pop();
        var arg = stack.pop();
        var appem = base + ((arg & 0xF0) >> 4);
        if (appem !== ppem) { continue; }
        var mag = (arg & 0x0F) - 8;
        if (mag >= 0) { mag++; }
        var delta = mag * ds;
        if (exports.DEBUG) { console.log(state.step, 'DELTACFIX', c, 'by', delta); }
        state.cvt[c] += delta;
    }
}
function SROUND(state) {
    var n = state.stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'SROUND[]', n); }
    state.round = roundSuper;
    var period;
    switch (n & 0xC0) {
        case 0x00:
            period = 0.5;
            break;
        case 0x40:
            period = 1;
            break;
        case 0x80:
            period = 2;
            break;
        default:
            throw new Error('invalid SROUND value');
    }
    state.srPeriod = period;
    switch (n & 0x30) {
        case 0x00:
            state.srPhase = 0;
            break;
        case 0x10:
            state.srPhase = 0.25 * period;
            break;
        case 0x20:
            state.srPhase = 0.5  * period;
            break;
        case 0x30:
            state.srPhase = 0.75 * period;
            break;
        default: throw new Error('invalid SROUND value');
    }
    n &= 0x0F;
    if (n === 0) { state.srThreshold = 0; }
    else { state.srThreshold = (n / 8 - 0.5) * period; }
}
function S45ROUND(state) {
    var n = state.stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'S45ROUND[]', n); }
    state.round = roundSuper;
    var period;
    switch (n & 0xC0) {
        case 0x00:
            period = Math.sqrt(2) / 2;
            break;
        case 0x40:
            period = Math.sqrt(2);
            break;
        case 0x80:
            period = 2 * Math.sqrt(2);
            break;
        default:
            throw new Error('invalid S45ROUND value');
    }
    state.srPeriod = period;
    switch (n & 0x30) {
        case 0x00:
            state.srPhase = 0;
            break;
        case 0x10:
            state.srPhase = 0.25 * period;
            break;
        case 0x20:
            state.srPhase = 0.5  * period;
            break;
        case 0x30:
            state.srPhase = 0.75 * period;
            break;
        default:
            throw new Error('invalid S45ROUND value');
    }
    n &= 0x0F;
    if (n === 0) { state.srThreshold = 0; }
    else { state.srThreshold = (n / 8 - 0.5) * period; }
}
function ROFF(state) {
    if (exports.DEBUG) { console.log(state.step, 'ROFF[]'); }
    state.round = roundOff;
}
function RUTG(state) {
    if (exports.DEBUG) { console.log(state.step, 'RUTG[]'); }
    state.round = roundUpToGrid;
}
function RDTG(state) {
    if (exports.DEBUG) { console.log(state.step, 'RDTG[]'); }
    state.round = roundDownToGrid;
}
function SCANCTRL(state) {
    var n = state.stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'SCANCTRL[]', n); }
}
function SDPVTL(a, state) {
    var stack = state.stack;
    var p2i = stack.pop();
    var p1i = stack.pop();
    var p2 = state.z2[p2i];
    var p1 = state.z1[p1i];
    if (exports.DEBUG) { console.log(state.step, 'SDPVTL[' + a + ']', p2i, p1i); }
    var dx;
    var dy;
    if (!a) {
        dx = p1.x - p2.x;
        dy = p1.y - p2.y;
    } else {
        dx = p2.y - p1.y;
        dy = p1.x - p2.x;
    }
    state.dpv = getUnitVector(dx, dy);
}
function GETINFO(state) {
    var stack = state.stack;
    var sel = stack.pop();
    var r = 0;
    if (exports.DEBUG) { console.log(state.step, 'GETINFO[]', sel); }
    if (sel & 0x01) { r = 35; }
    if (sel & 0x20) { r |= 0x1000; }
    stack.push(r);
}
function ROLL(state) {
    var stack = state.stack;
    var a = stack.pop();
    var b = stack.pop();
    var c = stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'ROLL[]'); }
    stack.push(b);
    stack.push(a);
    stack.push(c);
}
function MAX(state) {
    var stack = state.stack;
    var e2 = stack.pop();
    var e1 = stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'MAX[]', e2, e1); }
    stack.push(Math.max(e1, e2));
}
function MIN(state) {
    var stack = state.stack;
    var e2 = stack.pop();
    var e1 = stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'MIN[]', e2, e1); }
    stack.push(Math.min(e1, e2));
}
function SCANTYPE(state) {
    var n = state.stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'SCANTYPE[]', n); }
}
function INSTCTRL(state) {
    var s = state.stack.pop();
    var v = state.stack.pop();
    if (exports.DEBUG) { console.log(state.step, 'INSTCTRL[]', s, v); }
    switch (s) {
        case 1 : state.inhibitGridFit = !!v; return;
        case 2 : state.ignoreCvt = !!v; return;
        default: throw new Error('invalid INSTCTRL[] selector');
    }
}
function PUSHB(n, state) {
    var stack = state.stack;
    var prog = state.prog;
    var ip = state.ip;
    if (exports.DEBUG) { console.log(state.step, 'PUSHB[' + n + ']'); }
    for (var i = 0; i < n; i++) { stack.push(prog[++ip]); }
    state.ip = ip;
}
function PUSHW(n, state) {
    var ip = state.ip;
    var prog = state.prog;
    var stack = state.stack;
    if (exports.DEBUG) { console.log(state.ip, 'PUSHW[' + n + ']'); }
    for (var i = 0; i < n; i++) {
        var w = (prog[++ip] << 8) | prog[++ip];
        if (w & 0x8000) { w = -((w ^ 0xffff) + 1); }
        stack.push(w);
    }
    state.ip = ip;
}
function MDRP_MIRP(indirect, setRp0, keepD, ro, dt, state) {
    var stack = state.stack;
    var cvte = indirect && stack.pop();
    var pi = stack.pop();
    var rp0i = state.rp0;
    var rp = state.z0[rp0i];
    var p = state.z1[pi];
    var md = state.minDis;
    var fv = state.fv;
    var pv = state.dpv;
    var od;
    var d;
    var sign;
    var cv;
    d = od = pv.distance(p, rp, true, true);
    sign = d >= 0 ? 1 : -1;
    d = Math.abs(d);
    if (indirect) {
        cv = state.cvt[cvte];
        if (ro && Math.abs(d - cv) < state.cvCutIn) { d = cv; }
    }
    if (keepD && d < md) { d = md; }
    if (ro) { d = state.round(d); }
    fv.setRelative(p, rp, sign * d, pv);
    fv.touch(p);
    if (exports.DEBUG) {
        console.log(
            state.step,
            (indirect ? 'MIRP[' : 'MDRP[') +
            (setRp0 ? 'M' : 'm') +
            (keepD ? '>' : '_') +
            (ro ? 'R' : '_') +
            (dt === 0 ? 'Gr' : (dt === 1 ? 'Bl' : (dt === 2 ? 'Wh' : ''))) +
            ']',
            indirect ?
                cvte + '(' + state.cvt[cvte] + ',' +  cv + ')' :
                '',
            pi,
            '(d =', od, '->', sign * d, ')'
        );
    }
    state.rp1 = state.rp0;
    state.rp2 = pi;
    if (setRp0) { state.rp0 = pi; }
}
instructionTable = [
     SVTCA.bind(undefined, yUnitVector),
     SVTCA.bind(undefined, xUnitVector),
     SPVTCA.bind(undefined, yUnitVector),
     SPVTCA.bind(undefined, xUnitVector),
     SFVTCA.bind(undefined, yUnitVector),
     SFVTCA.bind(undefined, xUnitVector),
     SPVTL.bind(undefined, 0),
     SPVTL.bind(undefined, 1),
     SFVTL.bind(undefined, 0),
     SFVTL.bind(undefined, 1),
     SPVFS,
     SFVFS,
     GPV,
     GFV,
     SFVTPV,
     ISECT,
     SRP0,
     SRP1,
     SRP2,
     SZP0,
     SZP1,
     SZP2,
     SZPS,
     SLOOP,
     RTG,
     RTHG,
     SMD,
     ELSE,
     JMPR,
     SCVTCI,
     undefined,
     undefined,
     DUP,
     POP,
     CLEAR,
     SWAP,
     DEPTH,
     CINDEX,
     MINDEX,
     undefined,
     undefined,
     undefined,
     LOOPCALL,
     CALL,
     FDEF,
     undefined,
     MDAP.bind(undefined, 0),
     MDAP.bind(undefined, 1),
     IUP.bind(undefined, yUnitVector),
     IUP.bind(undefined, xUnitVector),
     SHP.bind(undefined, 0),
     SHP.bind(undefined, 1),
     SHC.bind(undefined, 0),
     SHC.bind(undefined, 1),
     SHZ.bind(undefined, 0),
     SHZ.bind(undefined, 1),
     SHPIX,
     IP,
     MSIRP.bind(undefined, 0),
     MSIRP.bind(undefined, 1),
     ALIGNRP,
     RTDG,
     MIAP.bind(undefined, 0),
     MIAP.bind(undefined, 1),
     NPUSHB,
     NPUSHW,
     WS,
     RS,
     WCVTP,
     RCVT,
     GC.bind(undefined, 0),
     GC.bind(undefined, 1),
     undefined,
     MD.bind(undefined, 0),
     MD.bind(undefined, 1),
     MPPEM,
     undefined,
     FLIPON,
     undefined,
     undefined,
     LT,
     LTEQ,
     GT,
     GTEQ,
     EQ,
     NEQ,
     ODD,
     EVEN,
     IF,
     EIF,
     AND,
     OR,
     NOT,
     DELTAP123.bind(undefined, 1),
     SDB,
     SDS,
     ADD,
     SUB,
     DIV,
     MUL,
     ABS,
     NEG,
     FLOOR,
     CEILING,
     ROUND$1.bind(undefined, 0),
     ROUND$1.bind(undefined, 1),
     ROUND$1.bind(undefined, 2),
     ROUND$1.bind(undefined, 3),
     undefined,
     undefined,
     undefined,
     undefined,
     WCVTF,
     DELTAP123.bind(undefined, 2),
     DELTAP123.bind(undefined, 3),
     DELTAC123.bind(undefined, 1),
     DELTAC123.bind(undefined, 2),
     DELTAC123.bind(undefined, 3),
     SROUND,
     S45ROUND,
     undefined,
     undefined,
     ROFF,
     undefined,
     RUTG,
     RDTG,
     POP,
     POP,
     undefined,
     undefined,
     undefined,
     undefined,
     undefined,
     SCANCTRL,
     SDPVTL.bind(undefined, 0),
     SDPVTL.bind(undefined, 1),
     GETINFO,
     undefined,
     ROLL,
     MAX,
     MIN,
     SCANTYPE,
     INSTCTRL,
     undefined,
     undefined,
     undefined,
     undefined,
     undefined,
     undefined,
     undefined,
     undefined,
     undefined,
     undefined,
     undefined,
     undefined,
     undefined,
     undefined,
     undefined,
     undefined,
     undefined,
     undefined,
     undefined,
     undefined,
     undefined,
     undefined,
     undefined,
     undefined,
     undefined,
     undefined,
     undefined,
     undefined,
     undefined,
     undefined,
     undefined,
     undefined,
     undefined,
     PUSHB.bind(undefined, 1),
     PUSHB.bind(undefined, 2),
     PUSHB.bind(undefined, 3),
     PUSHB.bind(undefined, 4),
     PUSHB.bind(undefined, 5),
     PUSHB.bind(undefined, 6),
     PUSHB.bind(undefined, 7),
     PUSHB.bind(undefined, 8),
     PUSHW.bind(undefined, 1),
     PUSHW.bind(undefined, 2),
     PUSHW.bind(undefined, 3),
     PUSHW.bind(undefined, 4),
     PUSHW.bind(undefined, 5),
     PUSHW.bind(undefined, 6),
     PUSHW.bind(undefined, 7),
     PUSHW.bind(undefined, 8),
     MDRP_MIRP.bind(undefined, 0, 0, 0, 0, 0),
     MDRP_MIRP.bind(undefined, 0, 0, 0, 0, 1),
     MDRP_MIRP.bind(undefined, 0, 0, 0, 0, 2),
     MDRP_MIRP.bind(undefined, 0, 0, 0, 0, 3),
     MDRP_MIRP.bind(undefined, 0, 0, 0, 1, 0),
     MDRP_MIRP.bind(undefined, 0, 0, 0, 1, 1),
     MDRP_MIRP.bind(undefined, 0, 0, 0, 1, 2),
     MDRP_MIRP.bind(undefined, 0, 0, 0, 1, 3),
     MDRP_MIRP.bind(undefined, 0, 0, 1, 0, 0),
     MDRP_MIRP.bind(undefined, 0, 0, 1, 0, 1),
     MDRP_MIRP.bind(undefined, 0, 0, 1, 0, 2),
     MDRP_MIRP.bind(undefined, 0, 0, 1, 0, 3),
     MDRP_MIRP.bind(undefined, 0, 0, 1, 1, 0),
     MDRP_MIRP.bind(undefined, 0, 0, 1, 1, 1),
     MDRP_MIRP.bind(undefined, 0, 0, 1, 1, 2),
     MDRP_MIRP.bind(undefined, 0, 0, 1, 1, 3),
     MDRP_MIRP.bind(undefined, 0, 1, 0, 0, 0),
     MDRP_MIRP.bind(undefined, 0, 1, 0, 0, 1),
     MDRP_MIRP.bind(undefined, 0, 1, 0, 0, 2),
     MDRP_MIRP.bind(undefined, 0, 1, 0, 0, 3),
     MDRP_MIRP.bind(undefined, 0, 1, 0, 1, 0),
     MDRP_MIRP.bind(undefined, 0, 1, 0, 1, 1),
     MDRP_MIRP.bind(undefined, 0, 1, 0, 1, 2),
     MDRP_MIRP.bind(undefined, 0, 1, 0, 1, 3),
     MDRP_MIRP.bind(undefined, 0, 1, 1, 0, 0),
     MDRP_MIRP.bind(undefined, 0, 1, 1, 0, 1),
     MDRP_MIRP.bind(undefined, 0, 1, 1, 0, 2),
     MDRP_MIRP.bind(undefined, 0, 1, 1, 0, 3),
     MDRP_MIRP.bind(undefined, 0, 1, 1, 1, 0),
     MDRP_MIRP.bind(undefined, 0, 1, 1, 1, 1),
     MDRP_MIRP.bind(undefined, 0, 1, 1, 1, 2),
     MDRP_MIRP.bind(undefined, 0, 1, 1, 1, 3),
     MDRP_MIRP.bind(undefined, 1, 0, 0, 0, 0),
     MDRP_MIRP.bind(undefined, 1, 0, 0, 0, 1),
     MDRP_MIRP.bind(undefined, 1, 0, 0, 0, 2),
     MDRP_MIRP.bind(undefined, 1, 0, 0, 0, 3),
     MDRP_MIRP.bind(undefined, 1, 0, 0, 1, 0),
     MDRP_MIRP.bind(undefined, 1, 0, 0, 1, 1),
     MDRP_MIRP.bind(undefined, 1, 0, 0, 1, 2),
     MDRP_MIRP.bind(undefined, 1, 0, 0, 1, 3),
     MDRP_MIRP.bind(undefined, 1, 0, 1, 0, 0),
     MDRP_MIRP.bind(undefined, 1, 0, 1, 0, 1),
     MDRP_MIRP.bind(undefined, 1, 0, 1, 0, 2),
     MDRP_MIRP.bind(undefined, 1, 0, 1, 0, 3),
     MDRP_MIRP.bind(undefined, 1, 0, 1, 1, 0),
     MDRP_MIRP.bind(undefined, 1, 0, 1, 1, 1),
     MDRP_MIRP.bind(undefined, 1, 0, 1, 1, 2),
     MDRP_MIRP.bind(undefined, 1, 0, 1, 1, 3),
     MDRP_MIRP.bind(undefined, 1, 1, 0, 0, 0),
     MDRP_MIRP.bind(undefined, 1, 1, 0, 0, 1),
     MDRP_MIRP.bind(undefined, 1, 1, 0, 0, 2),
     MDRP_MIRP.bind(undefined, 1, 1, 0, 0, 3),
     MDRP_MIRP.bind(undefined, 1, 1, 0, 1, 0),
     MDRP_MIRP.bind(undefined, 1, 1, 0, 1, 1),
     MDRP_MIRP.bind(undefined, 1, 1, 0, 1, 2),
     MDRP_MIRP.bind(undefined, 1, 1, 0, 1, 3),
     MDRP_MIRP.bind(undefined, 1, 1, 1, 0, 0),
     MDRP_MIRP.bind(undefined, 1, 1, 1, 0, 1),
     MDRP_MIRP.bind(undefined, 1, 1, 1, 0, 2),
     MDRP_MIRP.bind(undefined, 1, 1, 1, 0, 3),
     MDRP_MIRP.bind(undefined, 1, 1, 1, 1, 0),
     MDRP_MIRP.bind(undefined, 1, 1, 1, 1, 1),
     MDRP_MIRP.bind(undefined, 1, 1, 1, 1, 2),
     MDRP_MIRP.bind(undefined, 1, 1, 1, 1, 3)
];
function Token(char) {
    this.char = char;
    this.state = {};
    this.activeState = null;
}
function ContextRange(startIndex, endOffset, contextName) {
    this.contextName = contextName;
    this.startIndex = startIndex;
    this.endOffset = endOffset;
}
function ContextChecker(contextName, checkStart, checkEnd) {
    this.contextName = contextName;
    this.openRange = null;
    this.ranges = [];
    this.checkStart = checkStart;
    this.checkEnd = checkEnd;
}
function ContextParams(context, currentIndex) {
    this.context = context;
    this.index = currentIndex;
    this.length = context.length;
    this.current = context[currentIndex];
    this.backtrack = context.slice(0, currentIndex);
    this.lookahead = context.slice(currentIndex + 1);
}
function Event(eventId) {
    this.eventId = eventId;
    this.subscribers = [];
}
function initializeCoreEvents(events) {
    var this$1$1 = this;
    var coreEvents = [
        'start', 'end', 'next', 'newToken', 'contextStart',
        'contextEnd', 'insertToken', 'removeToken', 'removeRange',
        'replaceToken', 'replaceRange', 'composeRUD', 'updateContextsRanges'
    ];
    coreEvents.forEach(function (eventId) {
        Object.defineProperty(this$1$1.events, eventId, {
            value: new Event(eventId)
        });
    });
    if (!!events) {
        coreEvents.forEach(function (eventId) {
            var event = events[eventId];
            if (typeof event === 'function') {
                this$1$1.events[eventId].subscribe(event);
            }
        });
    }
    var requiresContextUpdate = [
        'insertToken', 'removeToken', 'removeRange',
        'replaceToken', 'replaceRange', 'composeRUD'
    ];
    requiresContextUpdate.forEach(function (eventId) {
        this$1$1.events[eventId].subscribe(
            this$1$1.updateContextsRanges
        );
    });
}
function Toke