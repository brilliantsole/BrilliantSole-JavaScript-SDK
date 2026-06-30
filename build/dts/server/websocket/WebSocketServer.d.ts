import { Timer } from "../../utils/Timer.ts";
import BaseServer, { BaseServerClient, BaseServerClientContext } from "../BaseServer.ts";
/** NODE_START */
import type * as ws from "ws";
/** NODE_END */
export interface WebSocketServerClient extends ws.WebSocket, BaseServerClient {
    isAlive: boolean;
    pingClientTimer?: Timer;
    type: "webSocket";
}
export interface WebSocketServerClientContext extends BaseServerClientContext<WebSocketServerClient> {
}
declare class WebSocketServer extends BaseServer<WebSocketServerClient> {
    #private;
    static type: "webSocket";
    readonly type: "webSocket";
    get server(): ws.WebSocketServer | undefined;
    set server(newServer: ws.WebSocketServer | undefined);
    protected sendToClient(client: WebSocketServerClient, message: ArrayBuffer): boolean;
}
export default WebSocketServer;
