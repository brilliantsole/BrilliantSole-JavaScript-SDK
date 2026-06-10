import { createConsole } from "../../utils/Console.ts";
import { createMessage, Message } from "../ServerUtils.ts";

const _console = createConsole("WindowUtils", { log: false });

export const WindowMessageTypes = ["ping", "pong", "serverMessage"] as const;
export type WindowMessageType = (typeof WindowMessageTypes)[number];

export type WindowMessage = WindowMessageType | Message<WindowMessageType>;
export function createWindowMessage(...messages: WindowMessage[]) {
  _console.log("createWindowMessage", ...messages);
  return createMessage(WindowMessageTypes, true, ...messages);
}

export const windowMessageKey = "BrilliantWear";

// STATIC MESSAGES
export const windowPingMessage = createWindowMessage("ping");
export const windowPongMessage = createWindowMessage("pong");
