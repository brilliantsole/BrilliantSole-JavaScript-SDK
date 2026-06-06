import BaseServer from "../BaseServer.ts";
declare class WindowServer extends BaseServer {
    #private;
    static readonly shared: WindowServer;
    constructor();
    get numberOfClients(): number;
    broadcastMessage(message: ArrayBuffer): void;
}
declare const _default: WindowServer;
export default _default;
