export declare function parseStringFromDataView(dataView: DataView<ArrayBuffer>, byteOffset?: number): {
    string: string;
    byteOffset: number;
};
export declare function parseMessage<MessageType extends string>(dataView: DataView<ArrayBuffer>, messageTypes: readonly MessageType[], callback: (messageType: MessageType, dataView: DataView<ArrayBuffer>, context?: any, isLast?: boolean) => void, context?: any, parseMessageLengthAsUint16?: boolean): void;
export declare function enumToArrayBuffer<T extends string | number>(enumeration: readonly T[], value: T): ArrayBuffer;
export declare function enumToDataView<T extends string | number>(enumeration: readonly T[], value: T): DataView<ArrayBuffer>;
export declare function valueToUInt16DataView(value: number, littleEndian?: boolean): DataView<ArrayBuffer>;
export declare function valueToUInt16ArrayBuffer(value: number, littleEndian?: boolean): ArrayBuffer;
export declare function valueToInt16DataView(value: number, littleEndian?: boolean): DataView<ArrayBuffer>;
export declare function valueToInt16ArrayBuffer(value: number, littleEndian?: boolean): ArrayBuffer;
export declare function valueToUInt32DataView(value: number, littleEndian?: boolean): DataView<ArrayBuffer>;
export declare function valueToUInt32ArrayBuffer(value: number, littleEndian?: boolean): ArrayBuffer;
