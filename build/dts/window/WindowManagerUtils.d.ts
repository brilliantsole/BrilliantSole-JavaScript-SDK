import { MessageOrMessageType } from "../server/ServerUtils.ts";
export declare const WindowManagerMessageTypes: readonly ["ping", "pong", "serverMessage"];
export type WindowManagerMessageType = (typeof WindowManagerMessageTypes)[number];
export type WindowManagerMessage = MessageOrMessageType<WindowManagerMessageType>;
export declare function createWindowManagerMessage(...messages: WindowManagerMessage[]): ArrayBuffer;
export declare const windowManagerMessageKey = "BrilliantWear";
export declare const windowManagerPingMessage: ArrayBuffer;
export declare const windowManagerPongMessage: ArrayBuffer;
