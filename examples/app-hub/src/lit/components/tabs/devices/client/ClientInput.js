import { waitForGlobals } from "../../../../../utils/cross-origin-storage-utils.js";

const { lit, BW, litRef, litSignals } = await waitForGlobals();
const { SignalWatcher } = litSignals;
const { LitElement, html, css, nothing } = lit;
const { ref, createRef } = litRef;

import "https://ka-f.webawesome.com/webawesome@3.12.0/components/input/input.js";
import "https://ka-f.webawesome.com/webawesome@3.12.0/components/dropdown/dropdown.js";
import "https://ka-f.webawesome.com/webawesome@3.12.0/components/spinner/spinner.js";

import {
  addClientConfigSignal,
  isAddingClientSignal,
} from "./AddClientSignals.js";
import { waitForAnimationFrames } from "../../../../../utils/rendering.js";

class ClientInput extends SignalWatcher(LitElement) {
  static styles = css`
    wa-button::part(button) {
      padding: 0;
      padding-inline-end: var(--wa-space-3xs);
    }

    wa-button > wa-icon {
      margin-inline-end: var(--wa-space-2xs);
      padding-inline-start: var(--wa-space-xs);
    }
    :has(> wa-spinner) {
      margin-inline-end: var(--wa-space-xs);
    }

    wa-input::part(input-wrapper) {
      padding-inline-end: 0px;
      padding-inline-start: 0px;
      opacity: initial;
    }

    wa-input::part(input):disabled {
      opacity: 0.5;
    }

    [checked] {
      font-weight: var(--wa-font-weight-bold);
    }

    [slot="end"] {
      margin-inline-start: var(--wa-space-3xs);
      wa-icon {
        &:not([valid]) {
          color: var(--wa-color-danger-on-quiet);
        }
        &[connected] {
          color: var(--wa-color-brand-on-quiet);
        }
      }
    }
  `;

  static properties = {
    client: { attribute: false },
    isValid: { type: Boolean },
    connectionStatus: {},
  };

  inputRef = createRef();

  get isClientConnected() {
    return this.connectionStatus == "connected";
  }

  addClientEventListeners(immediate) {
    const client = this.getClient();
    if (!client) {
      return;
    }
    console.log("addClientEventListeners", client);
    client.addEventListener(
      "connectionStatus",
      (event) => {
        const { connectionStatus } = event.message;
        console.log("clientConnectionStatus", { connectionStatus });
        this.connectionStatus = connectionStatus;
      },
      { ...this.clientAddEventListenerOptions, immediate },
    );
  }
  /**
   * @param {boolean} createIfNotFound
   * @returns {import('../../../../../../../../build/brilliantwear.module.js').WebSocketClient}
   */
  getClient(createIfNotFound) {
    let client = this._client ?? this.__client;
    if (!client && createIfNotFound) {
      this.__client = new BW.WebSocketClient();
      client = this.__client;
      this.addClientEventListeners();
    }
    return client;
  }

  get isAddingClient() {
    return !Boolean(this.client);
  }

  connectedCallback() {
    super.connectedCallback();

    this.connectionStatus = "notConnected";

    console.log(this);

    this.abortController = new AbortController();

    /** @type {AddEventListenerOptions} */
    this.clientAddEventListenerOptions = {
      signal: this.abortController.signal,
    };

    this._didUpdateEffectTrigger = false;
    this.updateEffect(() => {
      const isAddingClient = isAddingClientSignal.get();
      if (!this._didUpdateEffectTrigger) {
        this._didUpdateEffectTrigger = true;
        return;
      }
      console.log({ isAddingClient });
      if (isAddingClient && this.inputRef.value) {
        this.inputRef.value.scrollIntoView({ behavior: "smooth" });
      }
    });

    this.updateEffect(() => {
      const clientConfig = addClientConfigSignal.get();
      // console.log("clientConfig", clientConfig);
      let { host, protocol } = clientConfig;
      let isValid = false;
      if (!host) {
        host = location.host;
      }
      this.url = undefined;
      try {
        const _url = `${protocol}://${host}`;
        console.log({ _url });
        const url = new URL(_url);
        const hostname = url.hostname;
        const validHostname =
          hostname === "localhost" ||
          hostname.includes(".") ||
          /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname);

        console.log(url, "url");
        isValid =
          url.protocol === `${protocol}:` &&
          validHostname &&
          url.pathname === "/" &&
          !url.search &&
          !url.hash;
        if (isValid) {
          this.url = url;
        }
      } catch (error) {
        console.log("error creating url", error);
        isValid = false;
      }
      console.log({ isValid }, this.url);
      this.isValid = isValid;
    });

    this.addClientEventListeners(true);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.abortController.abort();
  }

  /** @returns {import("./AddClientSignals.js").ClientConfig} */
  getClientConfig() {
    if (this._client) {
      const { protocol, host } = new URL(this._client.webSocket.url);
      return {
        protocol,
        host,
      };
    } else {
      return addClientConfigSignal.get();
    }
  }

  onSelectProtocol(event) {
    const { item } = event.detail;
    // console.log("onSelectProtocol", item, { value: item.value });
    const addClientConfig = addClientConfigSignal.get();
    addClientConfig.protocol = item.value;
    addClientConfigSignal.set({ ...addClientConfig });
  }

  onInputClear(event) {
    // console.log(event);
    const addClientConfig = addClientConfigSignal.get();
    addClientConfig.host = "";
    addClientConfigSignal.set({ ...addClientConfig });
  }
  onInput(event) {
    // console.log(event);
    const addClientConfig = addClientConfigSignal.get();
    addClientConfig.host = this.inputRef.value.value;
    addClientConfigSignal.set({ ...addClientConfig });
  }

  onEndClick(event) {
    this.toggleConnection();
  }

  toggleConnection() {
    console.log("toggleConnection");

    const client = this.getClient(true);
    console.log("client", client);

    client.toggleConnection(this.url.origin);
  }

  onKeyDown(event) {
    console.log(event);
    switch (event.key) {
      case "Enter":
        if (!this.isClientConnected) {
          event.preventDefault();
          this.toggleConnection();
        }
        break;
    }
  }

  render() {
    let disabled = this.connectionStatus != "notConnected";
    console.log({ disabled });

    const clientConfig = this.getClientConfig();
    // console.log("clientConfig", clientConfig);

    let endSlot = nothing;
    switch (this.connectionStatus) {
      case "notConnected":
      case "connected":
        endSlot = html`<wa-icon
            name="globe"
            ?valid=${this.isValid}
            ?connected=${this.isClientConnected}
          ></wa-icon>
        </wa-button>`;
        break;
      case "connecting":
      case "disconnecting":
        endSlot = html`<wa-spinner></wa-spinner>`;
        break;
    }

    return html`
      <wa-input
        appearance="filled-outline"
        type="url"
        inputmode="url"
        with-clear
        placeholder="192.168.5.10"
        enterkeyhint="go"
        autocapitalize="off"
        autocomplete="off"
        autocorrect="off"
        .defaultValue=${clientConfig.host}
        @input=${this.onInput}
        ?disabled=${disabled}
        @keydown=${this.onKeyDown}
        ${ref(this.inputRef)}
      >
        <wa-button appearance="plain" slot="trigger">
          ${clientConfig.protocol}://
          <wa-icon slot="start" library="system" name="chevron-down"></wa-icon>
        </wa-button>

        <wa-dropdown
          slot="start"
          value=${clientConfig.protocol}
          @wa-select=${this.onSelectProtocol}
        >
          <wa-button appearance="plain" slot="trigger" ?disabled=${disabled}>
            ${clientConfig.protocol}://
            <wa-icon
              slot="start"
              library="system"
              name=${disabled ? "chevron-right" : "chevron-down"}
            ></wa-icon>
          </wa-button>

          <wa-dropdown-item
            value="wss"
            type="checkbox"
            ?checked=${clientConfig.protocol == "wss"}
            >wss</wa-dropdown-item
          >
          <wa-dropdown-item
            value="ws"
            type="checkbox"
            ?checked=${clientConfig.protocol == "ws"}
            >ws</wa-dropdown-item
          >
        </wa-dropdown>
        <wa-button
          slot="end"
          label="toggle client connection"
          appearance="plain"
          @click=${this.onEndClick}
          ?disabled=${!this.isValid}
        >
          ${endSlot}
        </wa-button>
      </wa-input>
    `;
  }
}

customElements.define("bw-client-input", ClientInput);
