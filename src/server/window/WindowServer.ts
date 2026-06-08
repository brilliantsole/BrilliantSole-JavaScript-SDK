import { concatenateArrayBuffers } from "../../utils/ArrayBufferUtils.ts";
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
  createWindowMessage,
  windowMessageKey,
  WindowMessageType,
  WindowMessageTypes,
  windowPongMessage,
} from "./WindowUtils.ts";

const _console = createConsole("WindowServer", { log: false });

interface WindowServerClient extends BaseServerClient {
  iframe: HTMLIFrameElement;
  messageChannel?: MessageChannel;
  didSendMessagePort?: boolean;
}

export interface WindowServerClientContext extends BaseServerClientContext<WindowServerClient> {
  transfer: Transferable[];
}

class WindowServer extends BaseServer<WindowServerClient> {
  static readonly shared = new WindowServer();

  constructor() {
    super();

    if (WindowServer.shared && this != WindowServer.shared) {
      throw Error("WindowServer is a singleton - use WindowServer.shared");
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
    client: WindowServerClient,
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
          [windowMessageKey]: message,
        },
        "*",
        transfer,
      );
    }
  }

  protected sendToClient(client: WindowServerClient, message: ArrayBuffer) {
    this.#sendToClient(
      client,
      createWindowMessage({ type: "serverMessage", data: message }),
    );
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

    const data: ArrayBuffer | undefined = event.data[windowMessageKey];
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
      client = { iframe };
      this.dispatchEvent("clientConnected", { client });
    }
    _console.log("onWindowMessage", client, data);
    const dataView = new DataView(data) as DataView<ArrayBuffer>;
    _console.log(`received ${dataView.byteLength} bytes`, dataView.buffer);
    this.#parseWindowServerClientMessage(client, dataView);
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

    this.dispatchEvent("clientDisconnected", { client });
  }
  #boundIframeEventListeners: {
    [K in keyof HTMLElementEventMap]?: (event: HTMLElementEventMap[K]) => void;
  } = {
    load: this.#onIframeLoad.bind(this),
  };

  #onIframeLoad(event: Event) {
    // _console.log("onIframeLoad", event);
    const iframe = event.currentTarget as HTMLIFrameElement;
    const client = this.#getClientByiFrame(iframe);
    if (!client) {
      return;
    }
    _console.log("onIframeLoad", client);
  }

  // MESSAGE PORT
  #createMessageChannel(client: WindowServerClient) {
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
    this.#parseWindowServerClientMessage(client, dataView);
  }

  // PARSING
  #parseWindowServerClientMessage(
    client: WindowServerClient,
    dataView: DataView<ArrayBuffer>,
  ) {
    let responseMessages: ArrayBuffer[] = [];
    let transfer: Transferable[] = [];
    const context: WindowServerClientContext = {
      responseMessages,
      client,
      transfer,
    };

    parseMessage(
      dataView,
      WindowMessageTypes,
      this.#onClientMessage.bind(this),
      context,
      true,
    );

    responseMessages = responseMessages.filter(Boolean);

    const responseMessage = concatenateArrayBuffers(responseMessages);
    _console.log(`sending ${responseMessage.byteLength} bytes to client...`);
    try {
      this.#sendToClient(client, responseMessage, transfer);
    } catch (error) {
      _console.log("error sending message", error);
    }
  }

  #onClientMessage(
    messageType: WindowMessageType,
    dataView: DataView<ArrayBuffer>,
    context: WindowServerClientContext,
  ) {
    const { responseMessages, transfer, client } = context;
    _console.log("onClientMessage", { messageType }, context);

    switch (messageType) {
      case "ping":
        this.#createMessageChannel(client);
        transfer.push(client.messageChannel!.port2);
        responseMessages.push(windowPongMessage);
        break;
      case "pong":
        break;
      case "serverMessage":
        {
          const responseMessage = this.parseClientMessage(client, dataView);
          if (responseMessage) {
            responseMessages.push(
              createWindowMessage({
                type: "serverMessage",
                data: responseMessage,
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

export default WindowServer.shared;
