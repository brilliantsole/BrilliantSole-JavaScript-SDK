var _TextEncoder;
if (typeof TextEncoder == "undefined") {
  _TextEncoder = class {
    encode(string: string) {
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
    decode(data: ArrayBuffer) {
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
