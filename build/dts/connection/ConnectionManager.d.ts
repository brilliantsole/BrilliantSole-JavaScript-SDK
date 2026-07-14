/** NODE_START */
import UDPConnectionManager from "../connection/udp/UDPConnectionManager.ts";
import NobleConnectionManager from "./bluetooth/NobleConnectionManager.ts";
/** NODE_END */
import ClientConnectionManager from "./ClientConnectionManager.ts";
import WebBluetoothConnectionManager from "./bluetooth/WebBluetoothConnectionManager.ts";
import WebSocketConnectionManager from "./websocket/WebSocketConnectionManager.ts";
export declare const ConnectionManagers: readonly [typeof WebBluetoothConnectionManager, typeof WebSocketConnectionManager, typeof ClientConnectionManager, typeof NobleConnectionManager, typeof UDPConnectionManager];
export type ConnectionManager = InstanceType<(typeof ConnectionManagers)[number]>;
