/** NODE_START */
import { default as UDPServer } from "./udp/UDPServer.ts";
import { default as WebSocketServer } from "./websocket/WebSocketServer.ts";
/** NODE_END */

/** BROWSER_START */
import { WindowServer } from "./window/WindowServer.ts";
/** BROWSER_END */

export const Servers = [
  /** BROWSER_START */
  WindowServer,
  /** BROWSER_END */

  /** NODE_START */
  WebSocketServer,
  UDPServer,
  /** NODE_END */
] as const;

export type Server = InstanceType<(typeof Servers)[number]>;
