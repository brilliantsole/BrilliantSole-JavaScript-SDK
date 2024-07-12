import { createConsole } from "../../utils/Console.ts";
import { addEventListeners, removeEventListeners } from "../../utils/EventUtils.ts";
import { pingTimeout, pingMessage } from "../ServerUtils.ts";
import { dataToArrayBuffer } from "../../utils/ArrayBufferUtils.ts";
import Timer from "../../utils/Timer.ts";
import BaseServer from "../BaseServer.ts";

const _console = createConsole("WebSocketServer", { log: true });

// NODE_START
import * as ws from "ws";
// NODE_END

interface WebSocketClient extends ws.WebSocket {
  isAlive: boolean;
  pingClientTimer?: Timer;
}
interface WebSocketServer extends ws.WebSocketServer {}

class WebSocketServer extends BaseServer {
  get numberOfClients() {
    return this.#server?.clients.size || 0;
  }

  // WEBSOCKET SERVER

  #server?: WebSocketServer;
  get server() {
    return this.#server;
  }
  set server(newServer) {
    if (this.#server == newServer) {
      _console.log("redundant WebSocket assignment");
      return;
    }
    _console.log("assigning server...");

    if (this.#server) {
      _console.log("clearing existing server...");
      removeEventListeners(this.#server, this.#boundServerListeners);
    }

    addEventListeners(newServer, this.#boundServerListeners);
    this.#server = newServer;

    _console.log("assigned server");
  }

  // WEBSOCKET SERVER LISTENERS

  #boundServerListeners = {
    close: this.#onServerClose.bind(this),
    connection: this.#onServerConnection.bind(this),
    error: this.#onServerError.bind(this),
    headers: this.#onServerHeaders.bind(this),
    listening: this.#onServerListening.bind(this),
  };

  #onServerClose() {
    _console.log("server.close");
  }
  #onServerConnection(client: WebSocketClient) {
    _console.log("server.connection");
    client.isAlive = true;
    client.pingClientTimer = new Timer(() => this.#pingClient(client), pingTimeout);
    client.pingClientTimer.start();
    addEventListeners(client, this.#boundClientListeners);
    this.dispatchEvent("clientConnected", { client });
  }
  #onServerError(error: Error) {
    _console.error(error);
  }
  #onServerHeaders() {
    //_console.log("server.headers");
  }
  #onServerListening() {
    _console.log("server.listening");
  }

  // WEBSOCKET CLIENT LISTENERS

  #boundClientListeners: { [eventType: string]: Function } = {
    open: this.#onClientOpen.bind(this),
    message: this.#onClientMessage.bind(this),
    close: this.#onClientClose.bind(this),
    error: this.#onClientError.bind(this),
  };
  #onClientOpen(event: ws.Event) {
    _console.log("client.open");
  }
  #onClientMessage(event: ws.MessageEvent) {
    _console.log("client.message");
    const client = event.target as WebSocketClient;
    client.isAlive = true;
    client.pingClientTimer!.restart();
    const dataView = new DataView(dataToArrayBuffer(event.data as Buffer));
    this.#parseClientMessage(client, dataView);
  }
  #onClientClose(event: ws.CloseEvent) {
    _console.log("client.close");
    const client = event.target as WebSocketClient;
    client.pingClientTimer!.stop();
    removeEventListeners(client, this.#boundClientListeners);
    this.dispatchEvent("clientDisconnected", { client });
  }
  #onClientError(event: ws.ErrorEvent) {
    _console.error("client.error", event.message);
  }

  // PARSING
  #parseClientMessage(client: WebSocketClient, dataView: DataView) {
    const responseMessage = this.parseClientMessage(dataView);
    if (responseMessage) {
      client.send(responseMessage);
    }
  }

  // CLIENT MESSAGING
  broadcastMessage(message: ArrayBuffer) {
    super.broadcastMessage(message);
    this.server!.clients.forEach((client) => {
      client.send(message);
    });
  }

  // PING
  #pingClient(client: WebSocketClient) {
    if (!client.isAlive) {
      client.terminate();
      return;
    }
    client.isAlive = false;
    client.send(pingMessage);
  }
}

export default WebSocketServer;
