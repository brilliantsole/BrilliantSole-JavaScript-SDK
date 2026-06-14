export declare function parseStringFromDataView(dataView: DataView<ArrayBuffer>, byteOffset?: number): {
    string: string;
    byteOffset: number;
};
export declare function parseMessage<MessageType extends string>(dataView: DataView<ArrayBuffer>, messageTypes: readonly MessageType[], callback: (messageType: MessageType, dataView: DataView<ArrayBuffer>, context?: any, isLast?: boolean) => void, context?: any, parseMessageLengthAsUint16?: boolean): void;
