import { createConsole } from "../utils/Console.ts";
import { concatenateArrayBuffers } from "../utils/ArrayBufferUtils.ts";
import EventDispatcher, {
  EventDispatcherTypes,
} from "../utils/EventDispatcher.ts";
import {
  addEventListeners,
  removeEventListeners,
} from "../utils/EventUtils.ts";
import { parseMessage } from "../utils/ParseUtils.ts";
import {
  createWindowManagerMessage,
  windowManagerMessageKey,
  WindowManagerMessageType,
  WindowManagerMessageTypes,
  windowManagerPongMessage,
} from "./WindowManagerUtils.ts";

import { default as WindowServer } from "../server/window/WindowServer.ts";
import { Singleton } from "../utils/TypeScriptUtils.ts";
import { BaseServerClientContext } from "../server/BaseServer.ts";

const _console = createConsole("WindowManagerServer", { log: false });

export interface WindowManagerServerClient {
  type: "window";
  iframe: HTMLIFrameElement;
  messageChannel?: MessageChannel;
  didSendMessagePort?: boolean;
  didLoad?: boolean;
  transfer?: Transferable[];
  origin: string;
}
export interface WindowManagerServerClientContext extends BaseServerClientContext<WindowManagerServerClient> {
  transfer: Transferable[];
}

export const WindowManagerServerEventTypes = [
  "clientConnected",
  "clientDisconnected",
] as const;
export type WindowManagerServerEventType =
  (typeof WindowManagerServerEventTypes)[number];

interface WindowManagerServerEventMessages {
  clientConnected: { client: WindowManagerServerClient };
  clientDisconnected: { client: WindowManagerServerClient };
}

export type WindowManagerServerEventDispatcherTypes = EventDispatcherTypes<
  WindowManagerServer,
  WindowManagerServerEventType,
  WindowManagerServerEventMessages
>;
export type WindowManagerServerEvent =
  WindowManagerServerEventDispatcherTypes["Event"];
export type WindowManagerServerEventMap =
  WindowManagerServerEventDispatcherTypes["EventMap"];
export type WindowManagerServerEventListenerMap =
  WindowManagerServerEventDispatcherTypes["EventListenerMap"];
export type WindowManagerServerEventDispatcher =
  WindowManagerServerEventDispatcherTypes["EventDispatcher"];
export type BoundWindowManagerServerEventListeners =
  WindowManagerServerEventDispatcherTypes["BoundEventListeners"];

@Singleton
class WindowManagerServer {
  // EVENT DISPATCHER
  #eventDispatcher: WindowManagerServerEventDispatcher = new EventDispatcher(
    this as WindowManagerServer,
    WindowManagerServerEventTypes,
  );
  get addEventListener() {
    return this.#eventDispatcher.addEventListener;
  }
  get #dispatchEvent() {
    return this.#eventDispatcher.dispatchEvent;
  }
  get removeEventListener() {
    return this.#eventDispatcher.removeEventListener;
  }
  get waitForEvent() {
    return this.#eventDispatcher.waitForEvent;
  }
  get removeEventListeners() {
    return this.#eventDispatcher.removeEventListeners;
  }
  removeAllEventListeners() {
    this.#eventDispatcher.removeAllEventListeners();
    // @ts-expect-error
    WindowServer.init();
  }

  // CONSTRUCTOR
  static readonly shared: WindowManagerServer;

  constructor() {
    addEventListeners(window, this.#boundWindowEventListeners);

    this.#iframeObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        // Handle added iframes
        for (const node of mutation.addedNodes) {
          this.#collectIframes(node).forEach((iframe) => {
            this.#onIframeAdded(iframe);
          });
        }

        // Handle removed iframes
        for (const node of mutation.removedNodes) {
          this.#collectIframes(node).forEach((iframe) => {
            this.#onIframeRemoved(iframe);
          });
        }
      }
    });

    this.#iframeObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    document.querySelectorAll("iframe").forEach((iframe) => {
      this.#onIframeAdded(iframe);
    });
  }

  // CLIENTS
  #clients: WindowManagerServerClient[] = [];
  get clients() {
    return this.#clients;
  }

  #getClientByiFrame(iframe: HTMLIFrameElement) {
    return this.clients.find((client) => client.iframe == iframe);
  }
  #getClientBySource(source: MessageEventSource) {
    return this.clients.find((client) => client.iframe.contentWindow == source);
  }
  #getClientByMessagePort(port: MessagePort) {
    return this.clients.find((client) => client.messageChannel?.port1 == port);
  }

  #sendToClient(client: WindowManagerServerClient, arrayBuffer: ArrayBuffer) {
    if (arrayBuffer.byteLength == 0) {
      _console.log("nothing to send to client");
      return false;
    }

    _console.log("sendToClient", client, arrayBuffer);
    const { messageChannel, iframe, didSendMessagePort } = client;
    // _console.log({ messageChannel, didSendMessagePort });
    if (messageChannel && didSendMessagePort) {
      messageChannel.port1.postMessage(arrayBuffer, {
        transfer: client.transfer,
      });
    } else {
      if (messageChannel) {
        client.didSendMessagePort = true;
      }
      iframe.contentWindow!.postMessage(
        {
          [windowManagerMessageKey]: arrayBuffer,
        },
        "*",
        client.transfer,
      );
    }
    if (client.transfer) {
      delete client.transfer;
    }
    return true;
  }

  sendToClient(client: WindowManagerServerClient, arrayBuffer: ArrayBuffer) {
    return this.#sendToClient(client, arrayBuffer);
  }

  // WINDOW
  #boundWindowEventListeners: {
    [K in keyof WindowEventMap]?: (event: WindowEventMap[K]) => void;
  } = {
    message: this.#onWindowMessage.bind(this),
  };
  #onWindowMessage(event: WindowEventMap["message"]) {
    if (event.source == window) {
      return;
    }
    if (!event.source) {
      return;
    }
    if (event.source == window.parent) {
      return;
    }
    _console.log("onWindowMessage", event);

    const data: ArrayBuffer | undefined = event.data[windowManagerMessageKey];
    if (!data) {
      return;
    }
    let client = this.#getClientBySource(event.source);
    if (!client) {
      const iframe = this.#iframes.find(
        (iframe) => iframe.contentWindow == event.source,
      );

      if (!iframe) {
        _console.error("no iframe found for event", event);
        return;
      }
      client = this.#createClient(iframe);
      if (!client) {
        return;
      }
    }
    _console.log("onWindowMessage", client, data);
    const dataView = new DataView(data) as DataView<ArrayBuffer>;
    _console.log(
      `received ${dataView.byteLength} bytes via window`,
      dataView.buffer,
    );
    this.#parseWindowManagerClientMessage(client, dataView);
  }

  #createClient(iframe: HTMLIFrameElement) {
    try {
      const { origin } = new URL(iframe.src);
      addEventListeners(iframe, this.#boundIframeEventListeners);
      const client: WindowManagerServerClient = {
        iframe,
        type: "window",
        origin,
      };
      this.#clients.push(client);
      this.#dispatchEvent("clientConnected", { client });
      return client;
    } catch (error) {
      _console.error(`failed to create origin for client ${iframe.src}`);
      return;
    }
  }
  #destroyClient(client: WindowManagerServerClient) {
    _console.log("onClientDisconnected", client);
    const { messageChannel } = client;
    if (messageChannel) {
      messageChannel.port1.close();
      removeEventListeners(
        messageChannel.port1,
        this.#boundMessageChannelPortEventListeners,
      );
    }

    this.#clients.splice(this.#clients.indexOf(client), 1);
    this.#dispatchEvent("clientDisconnected", { client });
    return client;
  }

  // IFRAME
  #iframeObserver: MutationObserver;
  #collectIframes(node: Node): HTMLIFrameElement[] {
    if (node.nodeType !== Node.ELEMENT_NODE) return [];

    const element = node as Element;

    const direct =
      element.tagName === "IFRAME" ? [element as HTMLIFrameElement] : [];

    const nested = Array.from(element.querySelectorAll?.("iframe") ?? []);

    return [...direct, ...nested];
  }
  #iframes: HTMLIFrameElement[] = [];
  #onIframeAdded(iframe: HTMLIFrameElement) {
    if (this.#iframes.includes(iframe)) {
      _console.log("redundant iframe added", iframe);
      return;
    }
    _console.log("iframe added", iframe);
    this.#iframes.push(iframe);
  }
  #onIframeRemoved(iframe: HTMLIFrameElement) {
    if (!this.#iframes.includes(iframe)) {
      return;
    }
    _console.log("iframe removed", iframe);
    this.#iframes.splice(this.#iframes.indexOf(iframe));
    removeEventListeners(iframe, this.#boundIframeEventListeners);

    const client = this.#getClientByiFrame(iframe);
    if (!client) {
      _console.error("no client found for iframe", iframe);
      return;
    }

    this.#destroyClient(client);
  }

  #boundIframeEventListeners: {
    [K in keyof HTMLElementEventMap]?: (event: HTMLElementEventMap[K]) => void;
  } = {
    load: this.#onIframeLoad.bind(this),
  };

  #onIframeLoad(event: WindowEventMap["load"]) {
    _console.log("onIframeLoad", event);
    const iframe = event.currentTarget as HTMLIFrameElement;
    const client = this.#getClientByiFrame(iframe);
    if (!client) {
      return;
    }
    _console.log("onIframeLoad", client);
    this.#destroyClient(client);
  }

  // MESSAGE PORT
  #createMessageChannel(client: WindowManagerServerClient) {
    _console.log("createMessageChannel", client);
    const messageChannel = new MessageChannel();
    addEventListeners(
      messageChannel.port1,
      this.#boundMessageChannelPortEventListeners,
    );
    messageChannel.port1.start();
    client.messageChannel = messageChannel;
    client.didSendMessagePort = false;
  }
  #boundMessageChannelPortEventListeners: {
    [K in keyof MessagePortEventMap]?: (event: MessagePortEventMap[K]) => void;
  } = {
    message: this.#onMessagePortMessage.bind(this),
  };

  #onMessagePortMessage(event: MessagePortEventMap["message"]) {
    // _console.log("onMessagePortMessage", event);
    const port = event.currentTarget as MessagePort;
    const client = this.#getClientByMessagePort(port);
    if (!client) {
      _console.error("no client found for port", port);
      return;
    }
    const arrayBuffer = event.data as ArrayBuffer;
    const dataView = new DataView(arrayBuffer) as DataView<ArrayBuffer>;
    _console.log(
      `received ${dataView.byteLength} bytes via port`,
      dataView.buffer,
      client,
    );
    this.#parseWindowManagerClientMessage(client, dataView);
  }

  // PARSING
  #parseWindowManagerClientMessage(
    client: WindowManagerServerClient,
    dataView: DataView<ArrayBuffer>,
  ) {
    _console.log("parseWindowManagerClientMessage", client, dataView);

    const clientContext: WindowManagerServerClientContext = {
      responseMessages: [],
      client,
      transfer: [],
      localBroadcastMessages: [],
      broadcastMessages: [],
    };

    parseMessage(
      dataView,
      WindowManagerMessageTypes,
      this.#onClientMessage.bind(this),
      clientContext,
      true,
    );

    client.transfer = clientContext.transfer;

    // @ts-expect-error
    WindowServer.sendClientContext(clientContext);
  }

  #onClientMessage(
    messageType: WindowManagerMessageType,
    dataView: DataView<ArrayBuffer>,
    clientContext: WindowManagerServerClientContext,
  ) {
    const {
      responseMessages,
      transfer,
      client,
      localBroadcastMessages,
      broadcastMessages,
    } = clientContext;
    _console.log("onClientMessage", { messageType }, clientContext);

    switch (messageType) {
      case "ping":
        this.#createMessageChannel(client);
        transfer.push(client.messageChannel!.port2);
        responseMessages.push(windowManagerPongMessage);
        break;
      case "pong":
        break;
      case "serverMessage":
        // @ts-expect-error
        const _clientContext = WindowServer.parseClientMessage(
          client,
          dataView,
        );
        if (_clientContext) {
          if (_clientContext.responseMessages.length > 0) {
            responseMessages.push(
              createWindowManagerMessage({
                type: "serverMessage",
                data: concatenateArrayBuffers(_clientContext.responseMessages),
              }),
            );
          }
          if (_clientContext.broadcastMessages.length > 0) {
            broadcastMessages.push(
              createWindowManagerMessage({
                type: "serverMessage",
                data: concatenateArrayBuffers(_clientContext.broadcastMessages),
              }),
            );
          }
          if (_clientContext.localBroadcastMessages.length > 0) {
            localBroadcastMessages.push(
              createWindowManagerMessage({
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
}

export default WindowManagerServer.shared;
// @ts-expect-error
WindowServer.init();
