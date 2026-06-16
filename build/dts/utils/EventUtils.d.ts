export type BoundGenericEventListeners = {
    [eventType: string]: Function | Function[];
};
export declare function addEventListeners(target: any, boundEventListeners: BoundGenericEventListeners): void;
export declare function removeEventListeners(target: any, boundEventListeners: BoundGenericEventListeners): void;
