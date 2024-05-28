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

export const textEncoder = new _TextEncoder();
export const textDecoder = new _TextDecoder();
