import BaseServer, { BaseServerClient, BaseServerClientContext } from "../BaseServer.ts";
import { Timer } from "../../utils/Timer.ts";
/** NODE_START */
import type * as dgram from "dgram";
export interface UDPServerClient extends dgram.RemoteInfo, BaseServerClient {
    type: "udp";
    receivePort?: number;
    isAlive?: boolean;
    removeSelfTimer: Timer;
    lastTimeSentData: number;
}
export interface UDPServerClientContext extends BaseServerClientContext<UDPServerClient> {
}
declare class UDPServer extends BaseServer<UDPServerClient> {
    #private;
    static type: "udp";
    readonly type: "udp";
    get socket(): dgram.Socket | undefined;
    set socket(newSocket: dgram.Socket | undefined);
    protected sendToClient(client: UDPServerClient, arrayBuffer: ArrayBuffer, isWrapped?: boolean): boolean;
}
export default UDPServer;
