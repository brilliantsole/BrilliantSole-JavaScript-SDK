export declare function concatenateArrayBuffers(...arrayBuffers: any[]): ArrayBuffer;
export declare function dataToArrayBuffer(data: Buffer): ArrayBuffer;
export declare function stringToArrayBuffer(string: string): ArrayBuffer;
export declare function objectToArrayBuffer(object: object): ArrayBuffer;
export declare function sliceDataView(dataView: DataView, begin: number, length?: number): DataView;
export type FileLike = number[] | ArrayBuffer | DataView | URL | string | File;
export declare function getFileBuffer(file: FileLike): Promise<ArrayBuffer>;
export declare function UInt8ByteBuffer(value: number): ArrayBufferLike;
