import { waitForGlobals } from "../../../../../utils/cross-origin-storage-utils.js";

const { lit, BW, litRef, litSignals } = await waitForGlobals();
const { SignalWatcher } = litSignals;
const { LitElement, html, css, nothing } = lit;

import "https://ka-f.webawesome.com/webawesome@3.12.0/components/input/input.js";
import "https://ka-f.webawesome.com/webawesome@3.12.0/components/dropdown/dropdown.js";

import { addClientConfigSignal } from "./AddClientSignals.js";

class ClientInput extends SignalWatcher(LitElement) {
  static styles = css`
    wa-button::part(button) {
      padding: 0;
      padding-inline-end: var(--wa-space-3xs);
    }

    wa-button wa-icon {
      margin-inline-end: var(--wa-space-2xs);
      padding-inline-start: var(--wa-space-xs);
    }

    wa-input::part(input-wrapper) {
      padding-inline-end: var(--wa-space-xs);
      padding-inline-start: 0px;
    }

    [checked] {
      font-weight: var(--wa-font-weight-bold);
    }
  `;

  static properties = {
    client: { attribute: false },
  };
  /** @returns {import('../../../../../../../../build/brilliantwear.module.js').WebSocketClient} */
  get _client() {
    return this.client;
  }

  get isAddingClient() {
    return !Boolean(this.client);
  }

  connectedCallback() {
    super.connectedCallback();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
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
    console.log("onSelectProtocol", item, { value: item.value });
    const addClientConfig = addClientConfigSignal.get();
    addClientConfig.protocol = item.value;
    addClientConfigSignal.set({ ...addClientConfig });
  }

  onFocusOut(event) {
    console.log("onFocusOut", event.target.value);
  }

  render() {
    let disabled = false;

    const clientConfig = this.getClientConfig();
    console.log("clientConfig", clientConfig);

    return html`
      <wa-input
        appearance="filled-outline"
        type="url"
        with-clear
        placeholder="192.168.5.10"
      >
        <wa-button appearance="plain" slot="trigger">
          ${clientConfig.protocol}://
          <wa-icon slot="start" library="system" name="chevron-down"></wa-icon>
        </wa-button>

        <wa-dropdown
          slot="start"
          ?disabled=${disabled}
          value=${clientConfig.protocol}
          @wa-select=${this.onSelectProtocol}
        >
          <wa-button appearance="plain" slot="trigger">
            ${clientConfig.protocol}://
            <wa-icon
              slot="start"
              library="system"
              name="chevron-down"
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
        <wa-icon slot="end" name="globe"></wa-icon>
      </wa-input>
    `;
  }
}

customElements.define("bw-client-input", ClientInput);
