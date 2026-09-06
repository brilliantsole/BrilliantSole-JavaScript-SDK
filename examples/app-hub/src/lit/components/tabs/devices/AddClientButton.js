import { waitForGlobals } from "../../../../utils/cross-origin-storage-utils.js";

const { lit, BW, litRef, litSignals } = await waitForGlobals();

const { SignalWatcher, watch, signal } = litSignals;

const { LitElement, html, css } = lit;

import "https://ka-f.webawesome.com/webawesome@3.12.0/components/button/button.js";

class AddClientButton extends LitElement {
  createRenderRoot() {
    return this;
  }

  async _onClick() {}

  render() {
    return html`
      <wa-button variant="neutral" size="s" @click=${this._onClick}>
        ${true ? "Add Client" : "Remove Client"}
        <wa-icon slot="start" name=${true ? "plus" : "minus"}></wa-icon>
      </wa-button>
    `;
  }
}

customElements.define("bw-add-client-button", AddClientButton);
