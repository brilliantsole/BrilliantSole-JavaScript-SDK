import { MessageLike, ServerMessage } from "../ServerUtils.ts";
import Device from "../../Device.ts";
import BaseClient, { ServerURL } from "../BaseClient.ts";
declare class WebSocketClient extends BaseClient {
    #private;
    get webSocket(): WebSocket | undefined;
    set webSocket(newWebSocket: WebSocket | undefined);
    get readyState(): number | undefined;
    get isConnected(): boolean;
    get isDisconnected(): boolean;
    connect(url?: string | URL): void;
    disconnect(): void;
    reconnect(): void;
    toggleConnection(url?: ServerURL): void;
    sendMessage(message: MessageLike): void;
    sendServerMessage(...messages: ServerMessage[]): void;
    createDevice(bluetoothId: string): Device;
}
export default WebSocketClient;
