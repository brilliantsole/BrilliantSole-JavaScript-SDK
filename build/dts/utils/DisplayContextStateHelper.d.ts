import { DisplayContextState, PartialDisplayContextState } from "./DisplayContextState.ts";
declare class DisplayContextStateHelper {
    #private;
    get state(): DisplayContextState;
    get isSegmentUniform(): boolean;
    diff(other: PartialDisplayContextState): (keyof DisplayContextState)[];
    update(newState: PartialDisplayContextState): (keyof DisplayContextState)[];
    reset(): void;
}
export default DisplayContextStateHelper;
