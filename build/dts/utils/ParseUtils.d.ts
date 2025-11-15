export declare function parseStringFromDataView(dataView: DataView, byteOffset?: number): {
    string: string;
    byteOffset: number;
};
export declare function parseMessage<MessageType extends string>(dataView: DataView, messageTypes: readonly MessageType[], callback: (messageType: MessageType, dataView: DataView, context?: any, isLast?: boolean) => void, context?: any, parseMessageLengthAsUint16?: boolean): void;
