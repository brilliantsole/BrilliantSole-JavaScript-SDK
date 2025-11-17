export declare function concatenateArrayBuffers(...arrayBuffers: any[]): ArrayBuffer;
export declare function dataToArrayBuffer(data: Buffer): ArrayBuffer | SharedArrayBuffer;
export declare function stringToArrayBuffer(string: string): ArrayBuffer;
export declare function objectToArrayBuffer(object: object): ArrayBuffer;
export declare function sliceDataView(dataView: DataView, begin: number, length?: number): DataView<ArrayBuffer | SharedArrayBuffer>;
export type FileLike = number[] | ArrayBuffer | DataView | URL | string | File | Buffer;
export declare function getFileBuffer(file: FileLike): Promise<ArrayBufferLike | Uint8Array<ArrayBuffer>>;
export declare function UInt8ByteBuffer(value: number): ArrayBuffer;
