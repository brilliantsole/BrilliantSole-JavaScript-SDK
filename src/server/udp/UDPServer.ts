import {
  concatenateArrayBuffers,
  dataToArrayBuffer,
} from "../../utils/ArrayBufferUtils.ts";
import { createConsole } from "../../utils/Console.ts";
import {
  addEventListeners,
  removeEventListeners,
} from "../../utils/EventUtils.ts";
import { parseMessage } from "../../utils/ParseUtils.ts";
import BaseServer, {
  BaseServerClient,
  BaseServerClientContext,
} from "../BaseServer.ts";
import {
  createUDPServerMessage,
  removeUDPClientTimeout,
  udpPongMessage,
  UDPServerMessageType,
  UDPServerMessageTypes,
} from "./UDPUtils.ts";
import { Timer } from "../../utils/Timer.ts";

/** NODE_START */
import type * as dgram from "dgram";
/** NODE_END */

const _console = createConsole("UDPServer", { log: false });

export interface UDPServerClient extends dgram.RemoteInfo, BaseServerClient {
  type: "udp";
  receivePort?: number;
  isAlive?: boolean;
  removeSelfTimer: Timer;
  lastTimeSentData: number;
}

export interface UDPServerClientContext extends BaseServerClientContext<UDPServerClient> {}

class UDPServer extends BaseServer<UDPServerClient> {
  static type = "udp" as const;
  readonly type = UDPServer.type;

  #getClientByRemoteInfo(
    remoteInfo: dgram.RemoteInfo,
    createIfNotFound = false,
  ) {
    const { address, port } = remoteInfo;
    let client = this.clients.find(
      (client) => client.address == address && client.port == port,
    );
    if (!client && createIfNotFound) {
      client = {
        type: "udp",
        ...remoteInfo,
        isAlive: true,
        removeSelfTimer: new Timer(() => {
          _console.log("removing client due to timeout...");
          this.#removeClient(client!);
        }, removeUDPClientTimeout),
        lastTimeSentData: 0,
      };
      _console.log("created new client", client);

      this.dispatchEvent("clientConnected", { client });
    }
    return client;
  }

  #remoteInfoToString(client: dgram.RemoteInfo) {
    const { address, port } = client;
    return `${address}:${port}`;
  }
  #clientToString(client: UDPServerClient) {
    const { address, port, receivePort } = client;
    return `${address}:${port}=>${receivePort}`;
  }

  // UDP SOCKET

  #socket?: dgram.Socket;
  get socket() {
    return this.#socket;
  }
  set socket(newSocket) {
    if (this.#socket == newSocket) {
      _console.log("redundant udp socket assignment");
      return;
    }
    _console.log("assigning udp socket...");

    if (this.#socket) {
      _console.log("clearing existing udp socket...");
      removeEventListeners(this.#socket, this.#boundSocketListeners);
    }

    addEventListeners(newSocket, this.#boundSocketListeners);
    this.#socket = newSocket;

    _console.log("assigned udp socket");
  }

  // UDP SOCKET LISTENERS

  #boundSocketListeners = {
    close: this.#onSocketClose.bind(this),
    connect: this.#onSocketConnect.bind(this),
    error: this.#onSocketError.bind(this),
    listening: this.#onSocketListening.bind(this),
    message: this.#onSocketMessage.bind(this),
  };

  #onSocketClose() {
    _console.log("socket close");
  }
  #onSocketConnect() {
    _console.log("socket connect");
  }
  #onSocketError(error: Error) {
    _console.error("socket error", error);
  }
  #onSocketListening() {
    const address = this.#socket!.address();
    _console.log(`socket listening on port ${address.address}:${address.port}`);
  }
  #onSocketMessage(message: Buffer, remoteInfo: dgram.RemoteInfo) {
    _console.log(
      `received ${message.length} bytes from ${this.#remoteInfoToString(
        remoteInfo,
      )}`,
    );
    const client = this.#getClientByRemoteInfo(remoteInfo, true);
    if (!client) {
      _console.error("no client found");
      return;
    }
    client.removeSelfTimer.restart();
    const dataView = new DataView(
      dataToArrayBuffer(message),
    ) as DataView<ArrayBuffer>;
    this.#parseUDPClientMessage(client, dataView);
  }

  // PARSING
  #parseUDPClientMessage(
    client: UDPServerClient,
    dataView: DataView<ArrayBuffer>,
  ) {
    _console.log("parseWebSocketClientMessage", client, dataView);

    const clientContext: UDPServerClientContext = {
      responseMessages: [],
      client,
      localBroadcastMessages: [],
      broadcastMessages: [],
    };

    parseMessage(
      dataView,
      UDPServerMessageTypes,
      this.#onClientMessage.bind(this),
      clientContext,
      true,
    );
    clientContext.responseMessages =
      clientContext.responseMessages.filter(Boolean);
    clientContext.broadcastMessages =
      clientContext.broadcastMessages.filter(Boolean);
    clientContext.localBroadcastMessages =
      clientContext.localBroadcastMessages.filter(Boolean);

    const responseMessage = concatenateArrayBuffers(
      clientContext.responseMessages,
    );
    _console.log(`sending ${responseMessage.byteLength} bytes to client...`);
    this.#sendToClient(client, responseMessage);

    const localBroadcastMessage = concatenateArrayBuffers(
      clientContext.localBroadcastMessages,
    );

    _console.log(
      `locally broadcasting ${localBroadcastMessage.byteLength} bytes...`,
    );
    this.#broadcast(
      localBroadcastMessage,
      this.clients.filter((_client) => _client != client),
    );

    const broadcastMessage = concatenateArrayBuffers(
      clientContext.broadcastMessages,
    );
    _console.log(`broadcasting ${broadcastMessage.byteLength} bytes...`);
    // @ts-expect-error
    ServerManager.broadcast(broadcastMessage);
  }
  #onClientMessage(
    messageType: UDPServerMessageType,
    dataView: DataView<ArrayBuffer>,
    context: UDPServerClientContext,
  ) {
    const {
      client,
      responseMessages,
      broadcastMessages,
      localBroadcastMessages,
    } = context;

    _console.log(
      `received "${messageType}" message from ${client.address}:${client.port}`,
    );

    switch (messageType) {
      case "ping":
        responseMessages.push(this.#createPongMessage(context));
        break;
      case "pong":
        break;
      case "setRemoteReceivePort":
        responseMessages.push(this.#parseRemoteReceivePort(dataView, client));
        break;
      case "serverMessage":
        const _clientContext = this.parseClientMessage(client, dataView);
        if (_clientContext) {
          if (_clientContext.responseMessages.length > 0) {
            responseMessages.push(
              createUDPServerMessage({
                type: "serverMessage",
                data: concatenateArrayBuffers(_clientContext.responseMessages),
              }),
            );
          }
          if (_clientContext.broadcastMessages.length > 0) {
            broadcastMessages.push(
              createUDPServerMessage({
                type: "serverMessage",
                data: concatenateArrayBuffers(_clientContext.broadcastMessages),
              }),
            );
          }
          if (_clientContext.localBroadcastMessages.length > 0) {
            localBroadcastMessages.push(
              createUDPServerMessage({
                type: "serverMessage",
                data: concatenateArrayBuffers(
                  _clientContext.localBroadcastMessages,
                ),
              }),
            );
          }
        }
        break;

      default:
        _console.error(`uncaught messageType "${messageType}"`);
        break;
    }
  }

  #createPongMessage(context: BaseServerClientContext<UDPServerClient>) {
    const { client } = context;
    // TODO: - no need to ping if streaming sensor data
    return udpPongMessage;
  }

  #parseRemoteReceivePort(
    dataView: DataView<ArrayBuffer>,
    client: UDPServerClient,
  ) {
    const receivePort = dataView.getUint16(0);
    client.receivePort = receivePort;
    _console.log(
      `updated ${client.address}:${client.port} receivePort to ${receivePort}`,
    );
    const responseDataView = new DataView(new ArrayBuffer(2));
    responseDataView.setUint16(0, client.receivePort);
    return createUDPServerMessage({
      type: "setRemoteReceivePort",
      data: responseDataView,
    });
  }

  // CLIENT MESSAGING
  #broadcast(message: ArrayBuffer, clients: UDPServerClient[] = this.clients) {
    if (message.byteLength == 0) {
      return;
    }
    clients.forEach((client) => {
      this.#sendToClient(client, message);
    });
  }
  #sendToClient(client: UDPServerClient, message: ArrayBuffer) {
    if (message.byteLength == 0) {
      _console.log("no response to send");
      return;
    }

    if (client.receivePort == undefined) {
      _console.log("client has no defined receivePort");
      return;
    }

    _console.log(
      `sending ${message.byteLength} bytes to ${this.#clientToString(
        client,
      )}...`,
    );
    try {
      this.#socket!.send(
        new Uint8Array(message),
        client.receivePort,
        client.address,
        (error, bytes) => {
          if (error) {
            _console.error("error sending data", error);
            return;
          }
          _console.log(`sent ${bytes} bytes`);
          client.lastTimeSentData = Date.now();
        },
      );
    } catch (error) {
      _console.error("serious error sending data", error);
    }
  }
  protected sendToClient(client: UDPServerClient, message: ArrayBuffer) {
    this.#sendToClient(
      client,
      createUDPServerMessage({ type: "serverMessage", data: message }),
    );
  }

  // REMOVE CLIENT
  #removeClient(client: UDPServerClient) {
    _console.log(`removing client ${this.#clientToString(client)}...`);
    client.removeSelfTimer.stop();
    this.dispatchEvent("clientDisconnected", { client });
  }
}

export default UDPServer;

import { default as ServerManager } from "../ServerManager.ts";
