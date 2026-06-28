/** NODE_START */
// import { default as UDPClient } from "./udp/UDPClient.ts";
import { default as WebSocketClient } from "./websocket/WebSocketClient.ts";
/** NODE_END */

/** BROWSER_START */
import { WindowClient } from "./window/WindowClient.ts";
/** BROWSER_END */

export const Clients = [
  /** BROWSER_START */
  WindowClient,
  /** BROWSER_END */

  /** NODE_START */
  WebSocketClient,
  //   UDPClient,
  /** NODE_END */
] as const;

export type Client = InstanceType<(typeof Clients)[number]>;
