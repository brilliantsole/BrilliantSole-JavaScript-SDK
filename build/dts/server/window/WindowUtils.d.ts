import { Message } from "../ServerUtils.ts";
export declare const WindowMessageTypes: readonly ["ping", "pong", "serverMessage"];
export type WindowMessageType = (typeof WindowMessageTypes)[number];
export type WindowMessage = WindowMessageType | Message<WindowMessageType>;
export declare function createWindowMessage(...messages: WindowMessage[]): ArrayBuffer;
export declare const windowMessageKey = "BrilliantWear";
export declare const windowPingMessage: ArrayBuffer;
export declare const windowPongMessage: ArrayBuffer;
