/** NODE_START */
import { default as WebSocketClient } from "./websocket/WebSocketClient.ts";
/** NODE_END */
/** BROWSER_START */
import { WindowClient } from "./window/WindowClient.ts";
/** BROWSER_END */
export declare const Clients: readonly [typeof WindowClient, typeof WebSocketClient];
export type Client = InstanceType<(typeof Clients)[number]>;
