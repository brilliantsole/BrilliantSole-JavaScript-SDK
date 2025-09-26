export declare const textEncoder: {
    encode(string: string): Uint8Array<ArrayBuffer>;
};
export declare const textDecoder: {
    decode(data: ArrayBuffer): string;
} | TextDecoder;
