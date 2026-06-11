import BaseServer, { BaseServerClient } from "../BaseServer.ts";
import { WindowManagerServerClient } from "../../window/WindowManagerServer.ts";
interface WindowServerClient extends BaseServerClient, WindowManagerServerClient {
}
declare class WindowServer extends BaseServer<WindowServerClient> {
    #private;
    static readonly shared: WindowServer;
    init(): void;
    constructor();
    protected sendToClient(client: WindowServerClient, message: ArrayBuffer): void;
}
declare const _default: WindowServer;
export default _default;
