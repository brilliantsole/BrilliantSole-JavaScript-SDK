import { ServerMessageOrMessageType } from "../ServerUtils.ts";
import BaseClient, { ServerURL } from "../BaseClient.ts";
declare class WebSocketClient extends BaseClient {
    #private;
    get webSocket(): WebSocket | undefined;
    set webSocket(newWebSocket: WebSocket | undefined);
    get isConnected(): boolean;
    get isDisconnected(): boolean;
    connect(url?: string | URL): void;
    disconnect(): void;
    reconnect(): void;
    toggleConnection(url?: ServerURL): void;
    sendServerMessage(...messages: ServerMessageOrMessageType[]): void;
}
export default WebSocketClient;
