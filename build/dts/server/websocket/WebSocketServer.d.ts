import BaseServer from "../BaseServer.ts";
/** NODE_START */
import type * as ws from "ws";
interface WebSocketServer extends ws.WebSocketServer {
}
declare class WebSocketServer extends BaseServer {
    #private;
    get numberOfClients(): number;
    get server(): WebSocketServer | undefined;
    set server(newServer: WebSocketServer | undefined);
    broadcastMessage(message: ArrayBuffer): void;
}
export default WebSocketServer;
