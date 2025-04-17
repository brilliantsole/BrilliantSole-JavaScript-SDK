import { DeviceInformationTypes } from "../../DeviceInformationManager.ts";
import {
  createMessage,
  Message,
  MessageLike,
} from "../../server/ServerUtils.ts";
import { createConsole } from "../../utils/Console.ts";
import { isInNode } from "../../utils/environment.ts";
import {
  addEventListeners,
  removeEventListeners,
} from "../../utils/EventUtils.ts";
import { parseMessage } from "../../utils/ParseUtils.ts";
import Timer from "../../utils/Timer.ts";
import BaseConnectionManager, {
  ConnectionType,
} from "../BaseConnectionManager.ts";

import * as dgram from "dgram";

const _console = createConsole("UDPConnectionManager", { log: true });

export const UDPSendPort = 3000;
export const DefaultUDPReceivePort = 3002;

export const UDPPingInterval = 2_000;

const SocketMessageTypes = [
  "ping",
  "pong",
  "setRemoteReceivePort",
  "batteryLevel",
  "deviceInformation",
  "message",
] as const;
type SocketMessageType = (typeof SocketMessageTypes)[number];

type SocketMessage = SocketMessageType | Message<SocketMessageType>;
function createSocketMessage(...messages: SocketMessage[]) {
  _console.log("createSocketMessage", ...messages);
  return createMessage(SocketMessageTypes, ...messages);
}

const SocketDeviceInformationMessageTypes: SocketMessageType[] = [
  "deviceInformation",
  "batteryLevel",
];

class UDPConnectionManager extends BaseConnectionManager {
  #bluetoothId?: string;
  get bluetoothId() {
    return this.#bluetoothId ?? "";
  }

  defaultMtu = 2 ** 10;

  constructor(
    ipAddress: string,
    bluetoothId?: string,
    receivePort = DefaultUDPReceivePort
  ) {
    super();
    this.ipAddress = ipAddress;
    this.mtu = this.defaultMtu;
    this.#bluetoothId = bluetoothId;
    this.receivePort = receivePort;
  }

  get isAvailable() {
    return true;
  }
  static get isSupported() {
    return isInNode;
  }
  static get type(): ConnectionType {
    return "udp";
  }

  // IP ADDRESS
  #ipAddress!: string;
  get ipAddress() {
    return this.#ipAddress;
  }
  set ipAddress(newIpAddress) {
    this.assertIsNotConnected();
    if (this.#ipAddress == newIpAddress) {
      _console.log(`redundnant ipAddress assignment "${newIpAddress}"`);
      return;
    }
    this.#ipAddress = newIpAddress;
    _console.log(`updated ipAddress to "${this.ipAddress}"`);
  }

  // RECEIVE PORT
  #receivePort!: number;
  get receivePort() {
    return this.#receivePort;
  }
  set receivePort(newReceivePort) {
    this.assertIsNotConnected();
    if (this.#receivePort == newReceivePort) {
      _console.log(`redundnant receivePort assignment ${newReceivePort}`);
      return;
    }
    this.#receivePort = newReceivePort;
    _console.log(`updated receivePort to ${this.#receivePort}`);
    if (this.#receivePort) {
      this.#setRemoteReceivePortDataView.setUint16(0, this.receivePort, true);
    }
  }

  // SET REMOTE RECEIVE PORT
  #didSetRemoteReceivePort = false;
  #setRemoteReceivePortDataView = new DataView(new ArrayBuffer(2));
  #parseReceivePort(dataView: DataView) {
    const parsedReceivePort = dataView.getUint16(0, true);
    if (parsedReceivePort != this.receivePort) {
      _console.error(
        `incorrect receivePort (expected ${this.receivePort}, got ${parsedReceivePort})`
      );
      return;
    }
    this.#didSetRemoteReceivePort = true;
  }

  // SOCKET
  #socket?: dgram.Socket;
  get socket() {
    return this.#socket;
  }
  set socket(newSocket) {
    if (this.#socket == newSocket) {
      _console.log("redundant socket assignment");
      return;
    }

    _console.log("assigning socket", newSocket);

    if (this.#socket) {
      _console.log("removing existing socket...");
      removeEventListeners(this.#socket, this.#boundSocketEventListeners);
      try {
        this.#socket.close();
      } catch (error) {
        _console.error(error);
      }
    }

    if (newSocket) {
      addEventListeners(newSocket, this.#boundSocketEventListeners);
    }
    this.#socket = newSocket;

    _console.log("assigned socket");
  }

  // SOCKET MESSAGING
  #sendMessage(message: MessageLike) {
    // this.assertIsConnected();
    _console.log("sending socket message", message);
    const dataView = Buffer.from(message);
    this.#socket!.send(dataView);
    this.#pingTimer.restart();
  }

  #sendSocketMessage(...messages: SocketMessage[]) {
    this.#sendMessage(createSocketMessage(...messages));
  }

  // BASE CONNECTION MANAGER
  async sendSmpMessage(data: ArrayBuffer) {
    super.sendSmpMessage(data);
    _console.error("smp not supported on udp");
  }

  async sendTxData(data: ArrayBuffer) {
    super.sendTxData(data);
    if (data.byteLength == 0) {
      return;
    }
    this.#sendSocketMessage({ type: "message", data });
  }

  // SOCKET EVENTS
  #boundSocketEventListeners: { [eventType: string]: Function } = {
    close: this.#onSocketClose.bind(this),
    connect: this.#onSocketConnect.bind(this),
    error: this.#onSocketError.bind(this),
    listening: this.#onSocketListening.bind(this),
    message: this.#onSocketMessage.bind(this),
  };

  #onSocketClose() {
    _console.log("socket.close");
    this.status = "notConnected";
    this.clear();
  }
  #onSocketConnect() {
    _console.log("socket.connect");
    this.#pingTimer.start(true);
  }
  #onSocketError(error: Error) {
    _console.error("socket.error", error);
  }
  #onSocketListening() {
    const address = this.socket!.address();
    _console.log(`socket.listening on ${address.address}:${address.port}`);
  }
  #onSocketMessage(message: Buffer, remoteInfo: dgram.RemoteInfo) {
    this.#pongTimeoutTimer.stop();
    _console.log("socket.message", message.byteLength, remoteInfo);
    const arrayBuffer = message.buffer.slice(
      message.byteOffset,
      message.byteOffset + message.byteLength
    );
    const dataView = new DataView(arrayBuffer);
    this.#parseSocketMessage(dataView);

    if (this.status == "connecting" && this.#didSetRemoteReceivePort) {
      this.status = "connected";
      this.#requestDeviceInformation();
    }
  }

  #setupSocket() {
    this.#didSetRemoteReceivePort = false;
    this.socket = dgram.createSocket({
      type: "udp4",
    });
    try {
      this.socket.bind(this.receivePort, () => {
        this.socket!.connect(UDPSendPort, this.ipAddress);
      });
    } catch (error) {
      _console.error(error);
      this.disconnect();
    }
  }

  // CONNECTION
  async connect() {
    await super.connect();
    this.#setupSocket();
  }
  async disconnect() {
    await super.disconnect();
    _console.log("closing socket");
    try {
      this.#socket?.close();
    } catch (error) {
      _console.error(error);
    }
    this.#pingTimer.stop();
  }

  get canReconnect() {
    return Boolean(this.socket);
  }
  async reconnect() {
    await super.reconnect();
    this.#setupSocket();
  }

  // PARSING
  #parseSocketMessage(dataView: DataView) {
    parseMessage(
      dataView,
      SocketMessageTypes,
      this.#onMessage.bind(this),
      null,
      true
    );
  }

  #onMessage(messageType: SocketMessageType, dataView: DataView) {
    _console.log(
      `received "${messageType}" message (${dataView.byteLength} bytes)`
    );
    switch (messageType) {
      case "ping":
        this.#pong();
        break;
      case "pong":
        break;
      case "setRemoteReceivePort":
        this.#parseReceivePort(dataView);
        break;
      case "batteryLevel":
        this.onMessageReceived?.("batteryLevel", dataView);
        break;
      case "deviceInformation":
        parseMessage(
          dataView,
          DeviceInformationTypes,
          (deviceInformationType, dataView) => {
            this.onMessageReceived!(deviceInformationType, dataView);
          }
        );
        break;
      case "message":
        this.parseRxMessage(dataView);
        break;
      default:
        _console.error(`uncaught messageType "${messageType}"`);
        break;
    }
  }

  // PING
  #pingTimer = new Timer(this.#ping.bind(this), UDPPingInterval);
  #ping() {
    _console.log("pinging");
    if (this.#didSetRemoteReceivePort || !this.#receivePort) {
      this.#sendSocketMessage("ping");
    } else {
      this.#sendSocketMessage({
        type: "setRemoteReceivePort",
        data: this.#setRemoteReceivePortDataView,
      });
    }
    if (this.isConnected) {
      this.#pongTimeoutTimer.start();
    }
  }
  #pong() {
    _console.log("ponging");
    this.#sendSocketMessage("pong");
  }

  #pongTimeout() {
    this.#pongTimeoutTimer.stop();
    _console.log("pong timeout");
    this.disconnect();
  }
  #pongTimeoutTimer = new Timer(() => this.#pongTimeout(), 1_000);

  // DEVICE INFORMATION
  #requestDeviceInformation() {
    this.#sendSocketMessage(...SocketDeviceInformationMessageTypes);
  }

  clear() {
    super.clear();
    this.#didSetRemoteReceivePort = false;
    this.#pingTimer.stop();
    this.#pongTimeoutTimer.stop();
  }

  remove() {
    super.remove();
    this.socket = undefined;
  }
}

export default UDPConnectionManager;
