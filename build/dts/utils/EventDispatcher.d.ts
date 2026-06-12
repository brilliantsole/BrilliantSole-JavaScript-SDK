export declare const wildcardEventType: "*";
export type WildcardEventType = typeof wildcardEventType;
export type EventMap<Target extends any, EventType extends string, EventMessages extends Partial<Record<EventType, any>>> = {
    [T in keyof EventMessages]: {
        type: T;
        target: Target;
        message: EventMessages[T];
    };
};
export type EventListenerMap<Target extends any, EventType extends string, EventMessages extends Partial<Record<EventType, any>>> = {
    [T in keyof EventMessages]: (event: {
        type: T;
        target: Target;
        message: EventMessages[T];
    }) => void;
} & {
    [wildcardEventType]: (event: Event<Target, EventType, EventMessages>) => void;
};
export type Event<Target extends any, EventType extends string, EventMessages extends Partial<Record<EventType, any>>> = EventMap<Target, EventType, EventMessages>[keyof EventMessages];
type SpecificEvent<Target extends any, EventType extends string, EventMessages extends Partial<Record<EventType, any>>, SpecificEventType extends EventType> = {
    type: SpecificEventType;
    target: Target;
    message: EventMessages[SpecificEventType];
};
export type ListenerEvent<Target, EventType extends string, EventMessages extends Partial<Record<EventType, any>>, T extends EventType | WildcardEventType> = T extends WildcardEventType ? Event<Target, EventType, EventMessages> : SpecificEvent<Target, EventType, EventMessages, T & EventType>;
export type ListenerObject<Target, EventType extends string, EventMessages extends Partial<Record<EventType, any>>, T extends EventType | WildcardEventType> = {
    listener: (event: ListenerEvent<Target, EventType, EventMessages, T>) => void;
    once?: boolean;
    shouldRemove?: boolean;
};
export type BoundEventListeners<Target, EventType extends string, EventMessages extends Partial<Record<EventType, any>>> = {
    [K in EventType | typeof wildcardEventType]?: K extends typeof wildcardEventType ? (event: Event<Target, EventType, EventMessages>) => void : (event: SpecificEvent<Target, EventType, EventMessages, K & EventType>) => void;
};
declare class EventDispatcher<Target extends any, EventType extends string, EventMessages extends Partial<Record<EventType, any>>> {
    #private;
    constructor(target: Target, validEventTypes: readonly EventType[]);
    addEventListener<T extends EventType | WildcardEventType>(type: T, listener: (event: ListenerEvent<Target, EventType, EventMessages, T>) => void, options?: {
        once?: boolean;
    }): void;
    removeEventListener<T extends EventType | WildcardEventType>(type: T, listener: (event: ListenerEvent<Target, EventType, EventMessages, T>) => void): void;
    removeEventListeners<T extends EventType | WildcardEventType>(type: T): void;
    removeAllEventListeners(): void;
    dispatchEvent<T extends EventType>(type: T, message: EventMessages[T]): void;
    waitForEvent<T extends EventType>(type: T): Promise<ListenerEvent<Target, EventType, EventMessages, T>>;
}
export default EventDispatcher;
