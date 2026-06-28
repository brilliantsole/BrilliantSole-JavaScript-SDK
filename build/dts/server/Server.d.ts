/** NODE_START */
import { default as UDPServer, UDPServerClient } from "./udp/UDPServer.ts";
import { default as WebSocketServer, WebSocketServerClient } from "./websocket/WebSocketServer.ts";
/** NODE_END */
/** BROWSER_START */
import { WindowServer, WindowServerClient } from "./window/WindowServer.ts";
/** BROWSER_END */
export declare const Servers: readonly [typeof WindowServer, typeof WebSocketServer, typeof UDPServer];
export type Server = InstanceType<(typeof Servers)[number]>;
export type ServerClient = 
/** BROWSER_START */
WindowServerClient
/** BROWSER_END */
/** NODE_START */
 | WebSocketServerClient | UDPServerClient
/** NODE_END */
 | never;
