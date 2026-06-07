import { Timer } from "../../utils/Timer.ts";
import BaseServer, { BaseServerClient } from "../BaseServer.ts";
/** NODE_START */
import type * as ws from "ws";
/** NODE_END */
interface WebSocketServerClient extends ws.WebSocket, BaseServerClient {
    isAlive: boolean;
    pingClientTimer?: Timer;
}
declare class WebSocketServer extends BaseServer<WebSocketServerClient> {
    #private;
    get server(): ws.WebSocketServer | undefined;
    set server(newServer: ws.WebSocketServer | undefined);
    broadcastMessage(message: ArrayBuffer): void;
}
export default WebSocketServer;
