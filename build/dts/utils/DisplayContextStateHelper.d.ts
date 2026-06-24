import { DisplayContextCommand } from "./DisplayContextCommand.ts";
import { DisplayContextState, PartialDisplayContextState } from "./DisplayContextState.ts";
declare class DisplayContextStateHelper {
    #private;
    get state(): DisplayContextState;
    get isSegmentUniform(): boolean;
    diff(other?: PartialDisplayContextState): (keyof DisplayContextState)[];
    update(newState: PartialDisplayContextState): (keyof DisplayContextState)[];
    reset(numberOfColors: number, keepColorIndices?: boolean, keepSpriteColorIndices?: boolean): void;
    serialize(numberOfColors: number, other?: PartialDisplayContextState): DisplayContextCommand[];
}
export default DisplayContextStateHelper;
