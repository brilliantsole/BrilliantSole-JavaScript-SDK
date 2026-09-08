import { waitForGlobals } from "../../../../../utils/cross-origin-storage-utils.js";
const { litSignals } = await waitForGlobals();
const { signal } = litSignals;

/** @type {import("@lit-labs/signals").Signal.State<Boolean>} */
export const isAddingClientSignal = signal(true);

/**
 * @typedef {Object} ClientConfig
 * @property {"ws" | "wss"} protocol
 * @property {string} host
 */
/** @type {ClientConfig} */
export const defaultAddClientConfig = {
  protocol: "wss",
  host: "",
};
/** @type {import("@lit-labs/signals").Signal.State<ClientConfig>} */
export const addClientConfigSignal = signal({ ...defaultAddClientConfig });
