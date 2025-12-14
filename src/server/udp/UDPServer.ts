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
import BaseServer from "../BaseServer.ts";
import {
  createUDPServerMessage,
  pongUDPClientTimeout,
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

interface UDPClient extends dgram.RemoteInfo {
  receivePort?: number;
  isAlive?: boolean;
  removeSelfTimer: Timer;
  lastTimeSentData: number;
}

interface UDPClientContext {
  client: UDPClient;
  responseMessages: (ArrayBuffer | undefined)[];
}

class UDPServer extends BaseServer {
  // CLIENTS
  #clients: UDPClient[] = [];
  get numberOfClients() {
    return this.#clients.length;
  }

  #getClientByRemoteInfo(
    remoteInfo: dgram.RemoteInfo,
    createIfNotFound = false
  ) {
    const { address, port } = remoteInfo;
    let client = this.#clients.find(
      (client) => client.address == address && client.port == port
    );
    if (!client && createIfNotFound) {
      client = {
        ...remoteInfo,
        isAlive: true,
        removeSelfTimer: new Timer(() => {
          _console.log("removing client due to timeout...");
          this.#removeClient(client!);
        }, removeUDPClientTimeout),
        lastTimeSentData: 0,
      };
      _console.log("created new client", client);

      this.#clients.push(client);
      _console.log(`currently have ${this.numberOfClients} clients`);
      this.dispatchEvent("clientConnected", { client });
    }
    return client;
  }

  #remoteInfoToString(client: dgram.RemoteInfo) {
    const { address, port } = client;
    return `${address}:${port}`;
  }
  #clientToString(client: UDPClient) {
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
        remoteInfo
      )}`
    );
    const client = this.#getClientByRemoteInfo(remoteInfo, true);
    if (!client) {
      _console.error("no client found");
      return;
    }
    client.removeSelfTimer.restart();
    const dataView = new DataView(
      dataToArrayBuffer(message)
    ) as DataView<ArrayBuffer>;
    this.#onClientData(client, dataView);
  }

  // PARSING
  #onClientData(client: UDPClient, dataView: DataView<ArrayBuffer>) {
    _console.log(
      `parsing ${dataView.byteLength} bytes from ${this.#clientToString(
        client
      )}`,
      dataView.buffer
    );
    let responseMessages: ArrayBuffer[] = [];
    parseMessage(
      dataView,
      UDPServerMessageTypes,
      this.#onClientUDPMessage.bind(this),
      { responseMessages, client },
      true
    );

    responseMessages = responseMessages.filter(Boolean);

    if (responseMessages.length == 0) {
      _console.log("no response to send");
      return;
    }

    if (client.receivePort == undefined) {
      _console.log("client has no defined receivePort");
      return;
    }

    const response = concatenateArrayBuffers(responseMessages);
    _console.log(`responding with ${response.byteLength} bytes...`, response);
    this.#sendToClient(client, response);
  }
  #onClientUDPMessage(
    messageType: UDPServerMessageType,
    dataView: DataView<ArrayBuffer>,
    context: UDPClientContext
  ) {
    const { client, responseMessages } = context;
    _console.log(
      `received "${messageType}" message from ${client.address}:${client.port}`
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
        const responseMessage = this.parseClientMessage(dataView);
        if (responseMessage) {
          responseMessages.push(
            createUDPServerMessage({
              type: "serverMessage",
              data: responseMessage,
            })
          );
        }
        break;

      default:
        _console.error(`uncaught messageType "${messageType}"`);
        break;
    }
  }

  #createPongMessage(context: UDPClientContext) {
    const { client } = context;
    // TODO: - no need to ping if streaming sensor data
    return udpPongMessage;
  }

  #parseRemoteReceivePort(dataView: DataView<ArrayBuffer>, client: UDPClient) {
    const receivePort = dataView.getUint16(0);
    client.receivePort = receivePort;
    _console.log(
      `updated ${client.address}:${client.port} receivePort to ${receivePort}`
    );
    const responseDataView = new DataView(new ArrayBuffer(2));
    responseDataView.setUint16(0, client.receivePort);
    return createUDPServerMessage({
      type: "setRemoteReceivePort",
      data: responseDataView,
    });
  }

  // CLIENT MESSAGING
  #sendToClient(client: UDPClient, message: ArrayBuffer) {
    _console.log(
      `sending ${message.byteLength} bytes to ${this.#clientToString(
        client
      )}...`
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
        }
      );
    } catch (error) {
      _console.error("serious error sending data", error);
    }
  }
  broadcastMessage(message: ArrayBuffer) {
    super.broadcastMessage(message);
    this.#clients.forEach((client) => {
      this.#sendToClient(
        client,
        createUDPServerMessage({ type: "serverMessage", data: message })
      );
    });
  }

  // REMOVE CLIENT
  #removeClient(client: UDPClient) {
    _console.log(`removing client ${this.#clientToString(client)}...`);
    client.removeSelfTimer.stop();
    this.#clients = this.#clients.filter((_client) => _client != client);
    _console.log(`currently have ${this.numberOfClients} clients`);
    this.dispatchEvent("clientDisconnected", { client });
  }
}

export default UDPServer;
