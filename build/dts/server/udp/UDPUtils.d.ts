import { Message } from "../ServerUtils.ts";
export declare const pongUDPClientTimeout = 2000;
export declare const removeUDPClientTimeout = 4000;
export declare const UDPServerMessageTypes: readonly ["ping", "pong", "setRemoteReceivePort", "serverMessage"];
export type UDPServerMessageType = (typeof UDPServerMessageTypes)[number];
export type UDPServerMessage = UDPServerMessageType | Message<UDPServerMessageType>;
export declare function createUDPServerMessage(...messages: UDPServerMessage[]): ArrayBuffer;
export declare const udpPingMessage: ArrayBuffer;
export declare const udpPongMessage: ArrayBuffer;
