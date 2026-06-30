import BaseServer, { BaseServerClient } from "../BaseServer.ts";
import { WindowManagerServerClient } from "../../window/WindowManagerServer.ts";
export interface WindowServerClient extends BaseServerClient, WindowManagerServerClient {
    type: "window";
}
declare class WindowServer extends BaseServer<WindowServerClient> {
    #private;
    static type: "window";
    readonly type: "window";
    static readonly shared: WindowServer;
    protected init(): void;
    constructor();
    protected sendToClient(client: WindowServerClient, message: ArrayBuffer): boolean;
}
export { WindowServer };
declare const _default: WindowServer;
export default _default;
