import { createConsole } from "../../utils/Console.ts";
import { createMessage, Message } from "../ServerUtils.ts";

const _console = createConsole("WebSocketUtils", { log: true });

export const webSocketPingTimeout = 30_000_000;
export const webSocketReconnectTimeout = 3_000;

export const WebSocketMessageTypes = ["ping", "pong", "serverMessage"] as const;
export type WebSocketMessageType = (typeof WebSocketMessageTypes)[number];

export type WebSocketMessage = WebSocketMessageType | Message<WebSocketMessageType>;
export function createWebSocketMessage(...messages: WebSocketMessage[]) {
  _console.log("createWebSocketMessage", ...messages);
  return createMessage(WebSocketMessageTypes, ...messages);
}

// STATIC MESSAGES
export const webSocketPingMessage = createWebSocketMessage("ping");
export const webSocketPongMessage = createWebSocketMessage("pong");
