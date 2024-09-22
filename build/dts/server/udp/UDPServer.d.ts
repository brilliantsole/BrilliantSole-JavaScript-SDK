import BaseServer from "../BaseServer.ts";
/** NODE_START */
import type * as dgram from "dgram";
declare class UDPServer extends BaseServer {
    #private;
    get numberOfClients(): number;
    get socket(): dgram.Socket | undefined;
    set socket(newSocket: dgram.Socket | undefined);
    broadcastMessage(message: ArrayBuffer): void;
}
export default UDPServer;
