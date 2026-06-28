/** NODE_START */
import { default as UDPServer } from "./udp/UDPServer.ts";
import { default as WebSocketServer } from "./websocket/WebSocketServer.ts";
/** NODE_END */
/** BROWSER_START */
import { WindowServer } from "./window/WindowServer.ts";
/** BROWSER_END */
export declare const Servers: readonly [typeof WindowServer, typeof WebSocketServer, typeof UDPServer];
export type Server = InstanceType<(typeof Servers)[number]>;
