import BaseServer, { BaseServerClient } from "../BaseServer.ts";
interface WindowServerClient extends BaseServerClient {
    iframe: HTMLIFrameElement;
    messageChannel?: MessageChannel;
    didSendMessagePort?: boolean;
}
declare class WindowServer extends BaseServer<WindowServerClient> {
    #private;
    static readonly shared: WindowServer;
    constructor();
    broadcastMessage(message: ArrayBuffer): void;
}
declare const _default: WindowServer;
export default _default;
