import { createConsole } from "../utils/Console.ts";
import { concatenateArrayBuffers } from "../utils/ArrayBufferUtils.ts";
import EventDispatcher, {
  BoundEventListeners,
  Event,
  EventDispatcherTypes,
  EventListenerMap,
  EventMap,
} from "../utils/EventDispatcher.ts";
import {
  addEventListeners,
  removeEventListeners,
} from "../utils/EventUtils.ts";
import { parseMessage } from "../utils/ParseUtils.ts";
import {
  createWindowManagerMessage,
  WindowManagerMessage,
  windowManagerMessageKey,
  WindowManagerMessageType,
  WindowManagerMessageTypes,
  windowManagerPongMessage,
} from "./WindowManagerUtils.ts";

import { default as WindowServer } from "../server/window/WindowServer.ts";

const _console = createConsole("WindowManager", { log: false });

export interface WindowManagerServerClient {
  iframe: HTMLIFrameElement;
  messageChannel?: MessageChannel;
  didSendMessagePort?: boolean;
  didLoad?: boolean;
  allowRedirects?: boolean;
}
export interface WindowManagerServerClientContext {
  client: WindowManagerServerClient;
  responseMessages: (ArrayBuffer | undefined)[];
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
  get removeAllEventListeners() {
    return this.#eventDispatcher.removeAllEventListeners;
  }

  // CONSTRUCTOR
  static readonly shared = new WindowManagerServer();

  constructor() {
    if (WindowManagerServer.shared && this != WindowManagerServer.shared) {
      throw Error("WindowManager is a singleton - use WindowManager.shared");
    }

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

  #sendToClient(
    client: WindowManagerServerClient,
    message: ArrayBuffer,
    transfer?: Transferable[] | undefined,
  ) {
    if (message.byteLength == 0) {
      _console.log("nothing to send to client");
      return;
    }

    _console.log("sendToClient", client, message, { transfer });
    const { messageChannel, iframe, didSendMessagePort } = client;
    // _console.log({ messageChannel, didSendMessagePort });
    if (messageChannel && didSendMessagePort) {
      messageChannel.port1.postMessage(message, { transfer });
    } else {
      if (messageChannel) {
        client.didSendMessagePort = true;
      }
      iframe.contentWindow!.postMessage(
        {
          [windowManagerMessageKey]: message,
        },
        "*",
        transfer,
      );
    }
  }

  sendToClient(
    client: WindowManagerServerClient,
    ...messages: WindowManagerMessage[]
  ) {
    this.#sendToClient(client, createWindowManagerMessage(...messages));
  }
  broadcast(...messages: WindowManagerMessage[]) {
    this.clients.forEach((client) => {
      this.sendToClient(client, ...messages);
    });
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
    // _console.log("onWindowMessage", event);

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
      addEventListeners(iframe, this.#boundIframeEventListeners);
      client = { iframe, allowRedirects: true };
      this.#clients.push(client);
      this.#dispatchEvent("clientConnected", { client });
    }
    _console.log("onWindowMessage", client, data);
    const dataView = new DataView(data) as DataView<ArrayBuffer>;
    _console.log(`received ${dataView.byteLength} bytes`, dataView.buffer);
    this.#parseWindowManagerClientMessage(client, dataView);
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

    const { messageChannel } = client;
    if (messageChannel) {
      messageChannel.port1.close();
      removeEventListeners(
        messageChannel.port1,
        this.#boundMessageChannelPortEventListeners,
      );
    }

    this.#clients.splice(this.#clients.indexOf(client, 1));
    this.#dispatchEvent("clientDisconnected", { client });
  }
  #boundIframeEventListeners: {
    [K in keyof HTMLElementEventMap]?: (event: HTMLElementEventMap[K]) => void;
  } = {
    load: this.#onIframeLoad.bind(this),
  };

  #onIframeLoad(event: WindowEventMap["load"]) {
    // _console.log("onIframeLoad", event);
    const iframe = event.currentTarget as HTMLIFrameElement;
    const client = this.#getClientByiFrame(iframe);
    if (!client) {
      return;
    }
    _console.log("onIframeLoad", client);
    if (client.didLoad) {
      _console.log("client loaded twice");
      if (!client.allowRedirects) {
        _console.log("force reloading...");
        client.didLoad = false;
        iframe.src = iframe.src;
      }
    } else {
      _console.log("client first load");
      client.didLoad = true;
    }
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
      `received ${dataView.byteLength} bytes`,
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
    let responseMessages: ArrayBuffer[] = [];
    let transfer: Transferable[] = [];
    const context: WindowManagerServerClientContext = {
      responseMessages,
      client,
      transfer,
    };

    parseMessage(
      dataView,
      WindowManagerMessageTypes,
      this.#onClientMessage.bind(this),
      context,
      true,
    );

    responseMessages = responseMessages.filter(Boolean);

    const responseMessage = concatenateArrayBuffers(responseMessages);
    _console.log(`sending ${responseMessage.byteLength} bytes to client...`);
    this.#sendToClient(client, responseMessage, transfer);
  }

  #onClientMessage(
    messageType: WindowManagerMessageType,
    dataView: DataView<ArrayBuffer>,
    context: WindowManagerServerClientContext,
  ) {
    const { responseMessages, transfer, client } = context;
    _console.log("onClientMessage", { messageType }, context);

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
        const responseMessage = WindowServer.parseClientMessage(
          client,
          dataView,
        );
        if (responseMessage) {
          responseMessages.push(
            createWindowManagerMessage({
              type: "serverMessage",
              data: responseMessage,
            }),
          );
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
