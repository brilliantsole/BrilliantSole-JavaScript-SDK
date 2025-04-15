import { Message } from "../ServerUtils.ts";
export declare const webSocketPingTimeout = 30000;
export declare const webSocketReconnectTimeout = 3000;
export declare const WebSocketMessageTypes: readonly ["ping", "pong", "serverMessage"];
export type WebSocketMessageType = (typeof WebSocketMessageTypes)[number];
export type WebSocketMessage = WebSocketMessageType | Message<WebSocketMessageType>;
export declare function createWebSocketMessage(...messages: WebSocketMessage[]): ArrayBuffer;
export declare const webSocketPingMessage: ArrayBuffer;
export declare const webSocketPongMessage: ArrayBuffer;
