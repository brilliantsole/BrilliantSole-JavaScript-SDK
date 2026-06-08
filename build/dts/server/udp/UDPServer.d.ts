import BaseServer, { BaseServerClient, BaseServerClientContext } from "../BaseServer.ts";
import { Timer } from "../../utils/Timer.ts";
/** NODE_START */
import type * as dgram from "dgram";
interface UDPServerClient extends dgram.RemoteInfo, BaseServerClient {
    receivePort?: number;
    isAlive?: boolean;
    removeSelfTimer: Timer;
    lastTimeSentData: number;
}
export interface UDPServerClientContext extends BaseServerClientContext<UDPServerClient> {
}
declare class UDPServer extends BaseServer<UDPServerClient> {
    #private;
    get socket(): dgram.Socket | undefined;
    set socket(newSocket: dgram.Socket | undefined);
    broadcastMessage(message: ArrayBuffer): void;
}
export default UDPServer;
