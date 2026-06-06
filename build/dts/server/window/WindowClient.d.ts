import BaseClient from "../BaseClient.ts";
import { ServerMessage } from "../ServerUtils.ts";
declare class WindowClient extends BaseClient {
    #private;
    static readonly shared: WindowClient;
    constructor();
    get isConnected(): boolean;
    get isDisconnected(): boolean;
    connect(): void;
    disconnect(): void;
    reconnect(): void;
    toggleConnection(): void;
    sendServerMessage(...messages: ServerMessage[]): void;
}
declare const _default: WindowClient;
export default _default;
