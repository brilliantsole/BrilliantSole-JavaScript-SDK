export type BoundGenericEventListeners = {
    [eventType: string]: Function;
};
export declare function bindEventListeners(eventTypes: readonly string[], boundEventListeners: BoundGenericEventListeners, target: any): void;
export declare function addEventListeners(target: any, boundEventListeners: BoundGenericEventListeners): void;
export declare function removeEventListeners(target: any, boundEventListeners: BoundGenericEventListeners): void;
