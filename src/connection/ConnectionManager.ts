/** NODE_START */
import UDPConnectionManager from "../connection/udp/UDPConnectionManager.ts";
import NobleConnectionManager from "./bluetooth/NobleConnectionManager.ts";
/** NODE_END */

import ClientConnectionManager from "./ClientConnectionManager.ts";
import WebBluetoothConnectionManager from "./bluetooth/WebBluetoothConnectionManager.ts";
import WebSocketConnectionManager from "./websocket/WebSocketConnectionManager.ts";

export const ConnectionManagers = [
  WebBluetoothConnectionManager,
  WebSocketConnectionManager,
  ClientConnectionManager,
  /** NODE_START */
  NobleConnectionManager,
  UDPConnectionManager,
  /** NODE_END */
] as const;

export type ConnectionManager = InstanceType<
  (typeof ConnectionManagers)[number]
>;
