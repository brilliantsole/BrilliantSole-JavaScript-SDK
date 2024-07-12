import { MessageLike } from "../ServerUtils";
import Device from "../../Device";
import BaseClient, { ServerURL } from "../BaseClient";
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
    createDevice(bluetoothId: string): Device;
}
export default WebSocketClient;
