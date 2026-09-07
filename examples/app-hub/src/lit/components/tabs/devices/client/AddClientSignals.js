import { waitForGlobals } from "../../../../../utils/cross-origin-storage-utils.js";
const { litSignals } = await waitForGlobals();
const { signal } = litSignals;

/** @type {import("@lit-labs/signals").Signal.State<Boolean>} */
export const isAddingClientSignal = signal(false);
