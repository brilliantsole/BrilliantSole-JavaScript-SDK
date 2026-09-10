import { waitForGlobals } from "../../../../../utils/cross-origin-storage-utils.js";

const { lit, BW, litRef, litSignals } = await waitForGlobals();
const { SignalWatcher } = litSignals;
const { LitElement, html, css, nothing } = lit;
const { ref, createRef } = litRef;

import "https://ka-f.webawesome.com/webawesome@3.12.0/components/input/input.js";
import "https://ka-f.webawesome.com/webawesome@3.12.0/components/dropdown/dropdown.js";
import "https://ka-f.webawesome.com/webawesome@3.12.0/components/spinner/spinner.js";
import "https://ka-f.webawesome.com/webawesome@3.12.0/components/divider/divider.js";
import "https://ka-f.webawesome.com/webawesome@3.12.0/components/animation/animation.js";

import {
  addClientConfigSignal,
  defaultAddClientConfig,
  isAddingClientSignal,
} from "./AddClientSignals.js";
import { waitForAnimationFrames } from "../../../../../utils/rendering.js";
import { createDirectionContextConsumer } from "../../../../contexts/directionContext.js";

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

    :host([connection-status="connected"]) wa-input::part(input-wrapper) {
      border-color: var(--wa-color-brand-on-quiet);
    }
    :host(:not([valid])) wa-input::part(input-wrapper) {
      border-color: var(--wa-color-danger-on-quiet);
    }

    wa-input::part(input):disabled {
      opacity: 0.5;
    }

    wa-input::part(input) {
      text-overflow: ellipsis;
    }

    [checked] {
      font-weight: var(--wa-font-weight-bold);
    }

    [slot="end"] {
      display: flex;
      flex-direction: row;
      margin-inline-start: var(--wa-space-3xs);

      [data-connection] wa-icon {
        &:not([valid]) {
          color: var(--wa-color-danger-on-quiet);
        }
        &[connected] {
          color: var(--wa-color-brand-on-quiet);
        }
      }
    }

    wa-dropdown-item[value="remove"] {
      padding-inline-start: 0.5em;
      font-weight: var(--wa-font-weight-semibold);
    }

    :host([scanning]) [data-toggle-scan] {
      wa-icon {
        color: var(--wa-color-brand-on-quiet);
      }
    }
    :host(:not([connection-status="connected"])) [data-toggle-scan] {
      display: none;
    }
  `;

  static properties = {
    client: { attribute: false },
    isValid: { type: Boolean, attribute: "valid", reflect: true },
    connectionStatus: { reflect: true, attribute: "connection-status" },
    isDropdownShowing: { type: Boolean },
    isScanning: { type: Boolean, reflect: true, attribute: "scanning" },
    isScanningAvailable: {
      type: Boolean,
      reflect: true,
      attribute: "scanning-available",
    },
  };

  inputRef = createRef();
  animationRef = createRef();

  get isClientConnected() {
    return this.connectionStatus == "connected";
  }

  _remove() {
    addClientConfigSignal.set({ ...defaultAddClientConfig });
    isAddingClientSignal.set(false);
  }

  async addClientEventListeners(immediate) {
    const client = this.getClient();
    if (!client) {
      return;
    }
    await this.updateComplete;
    console.log("addClientEventListeners", client);
    const options = {
      ...this.clientAddEventListenerOptions,
      immediate,
    };
    client.addEventListener(
      "connectionStatus",
      (event) => {
        const { connectionStatus } = event.message;
        console.log({ connectionStatus });
        this.connectionStatus = connectionStatus;
        if (connectionStatus == "connected") {
          this.inputRef.value.value = client.url.host;
          if (this.isAddingClient) {
            this._remove();
          }
        }
      },
      options,
    );
    client.addEventListener(
      "isScanningAvailable",
      (event) => {
        const { isScanningAvailable } = event.message;
        console.log({ isScanningAvailable });
        this.isScanningAvailable = isScanningAvailable;
      },
      options,
    );
    client.addEventListener(
      "isScanning",
      (event) => {
        const { isScanning } = event.message;
        console.log({ isScanning });
        this.isScanning = isScanning;
        if (this.isScanning) {
          this.animationRef.value.play = true;
        } else {
          this.animationRef.value.cancel();
        }
      },
      options,
    );
  }
  /** @type {import('../../../../../../../../build/brilliantwear.module.js').WebSocketClient} */
  get _client() {
    return this.client;
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

    if (this._client) {
      this.isValid = true;
      this.url = this._client.url;
    } else {
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
          const _url = `${protocol}//${host}`;
          // console.log({ _url });
          const url = new URL(_url);
          const hostname = url.hostname;
          const validHostname =
            hostname === "localhost" ||
            hostname.includes(".") ||
            /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname);

          // console.log(url, "url");
          isValid =
            url.protocol === protocol &&
            validHostname &&
            url.pathname === "/" &&
            !url.search &&
            !url.hash;

          isValid =
            isValid &&
            !BW.ClientManager.clients
              .filter((client) => client.type == "webSocket")
              .some((client) => {
                if (client.url) {
                  return (
                    client.url.protocol == protocol && client.url.host == host
                  );
                }
              });
          if (isValid) {
            this.url = url;
          }
        } catch (error) {
          // console.log("error creating url", error);
          isValid = false;
        }
        // console.log({ isValid }, this.url);
        this.isValid = isValid;
      });
    }

    this.addClientEventListeners(true);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.abortController.abort();
  }

  /** @returns {import("./AddClientSignals.js").ClientConfig} */
  getClientConfig() {
    if (this.isAddingClient) {
      return addClientConfigSignal.get();
    } else if (this._client) {
      if (this._client.url) {
        const { protocol, host } = this._client.url;
        return { protocol, host };
      } else {
        throw "client doesn't have a url";
      }
    } else {
      throw "no client";
    }
  }

  onSelectProtocol(event) {
    const { item } = event.detail;
    // console.log("onSelectProtocol", item, { value: item.value });
    const { value } = item;
    if (value == "remove") {
      this._remove();
      return;
    }
    const addClientConfig = addClientConfigSignal.get();
    addClientConfig.protocol = value;
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
    client.toggleConnection(this.url.origin);
  }

  onKeyDown(event) {
    // console.log(event);
    switch (event.key) {
      case "Enter":
        if (!this.isClientConnected) {
          event.preventDefault();
          this.toggleConnection();
        }
        break;
    }
  }

  onDropdownHide() {
    this.isDropdownShowing = false;
  }
  onDropdownShow() {
    this.isDropdownShowing = true;
  }

  _directionConsumer = createDirectionContextConsumer(this, true);
  /** @type {import("../../../../contexts/directionContext.js").DirectionContextState} */
  get directionState() {
    return this._directionConsumer.value.state;
  }

  toggleScan() {
    const client = this.getClient();
    client.toggleScan();
  }

  render() {
    const disabled =
      !this.isAddingClient || this.connectionStatus != "notConnected";

    const clientConfig = this.getClientConfig();
    // console.log("clientConfig", clientConfig);

    let connectionElement = nothing;
    switch (this.connectionStatus) {
      case "notConnected":
      case "connected":
        connectionElement = html`<wa-icon
              name="globe"
              ?valid=${this.isValid}
              ?connected=${this.isClientConnected}
            ></wa-icon>
          </wa-button>`;
        break;
      case "connecting":
      case "disconnecting":
        connectionElement = html`<wa-spinner></wa-spinner>`;
        break;
    }

    return html`
      <wa-input
        appearance="filled-outline"
        type="url"
        inputmode="url"
        with-clear
        placeholder="192.168.x.x"
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
          ${clientConfig.protocol}//
          <wa-icon slot="start" library="system" name="chevron-down"></wa-icon>
        </wa-button>

        <wa-dropdown
          @dblclick=${() => {}}
          @wa-show=${this.onDropdownShow}
          @wa-hide=${this.onDropdownHide}
          slot="start"
          value=${clientConfig.protocol}
          @wa-select=${this.onSelectProtocol}
        >
          <wa-button
            appearance="plain"
            slot="trigger"
            ?disabled=${isAddingClientSignal && disabled}
          >
            ${clientConfig.protocol}//
            <wa-icon
              slot="start"
              library="system"
              name=${this.isDropdownShowing
                ? "chevron-down"
                : this.directionState.isLeftToRight
                  ? "chevron-right"
                  : "chevron-left"}
            ></wa-icon>
          </wa-button>

          <wa-dropdown-item
            value="wss:"
            type="checkbox"
            ?checked=${clientConfig.protocol == "wss:"}
            ?disabled=${disabled}
            >wss</wa-dropdown-item
          >
          <wa-dropdown-item
            value="ws:"
            type="checkbox"
            ?checked=${clientConfig.protocol == "ws:"}
            ?disabled=${disabled}
            >ws</wa-dropdown-item
          >
          ${this.isAddingClient
            ? html`<wa-divider></wa-divider>
                <wa-dropdown-item value="remove" variant="danger">
                  <wa-icon slot="icon" name="trash"></wa-icon>
                  Remove
                </wa-dropdown-item>`
            : nothing}
        </wa-dropdown>
        <div slot="end">
          <wa-animation
            name="pulse"
            easing="ease-in-out"
            duration="1000"
            ${ref(this.animationRef)}
          >
            ${this.isScanningAvailable
              ? html`<wa-button
                  label="toggle client scan"
                  appearance="plain"
                  data-toggle-scan
                  @click=${this.toggleScan}
                >
                  <wa-icon name="bluetooth" family="brands"></wa-icon>
                </wa-button>`
              : nothing}
          </wa-animation>
          <wa-button
            data-connection
            label="toggle client connection"
            appearance="plain"
            @click=${this.onEndClick}
            ?disabled=${!this.isValid}
          >
            ${connectionElement}
          </wa-button>
        </div>
      </wa-input>
    `;
  }
}

customElements.define("bw-client-input", ClientInput);
