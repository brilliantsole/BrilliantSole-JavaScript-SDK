import { waitForGlobals } from "../../../../utils/cross-origin-storage-utils.js";

const { lit } = await waitForGlobals();

const { LitElement, html, css } = lit;

import "../../utils/Card.js";

class SettingsCard extends LitElement {
  static properties = {
    label: {},
  };

  _onClearClick() {
    this.dispatchEvent(new Event("clear"));
  }

  render() {
    return html`<bw-card label=${this.label}>
      <slot></slot>
      <wa-button
        appearance="plain"
        slot="header-actions"
        size="m"
        @click=${this._onClearClick}
      >
        <wa-icon name="rotate-left" variant="solid" label="clear"></wa-icon>
      </wa-button>
    </bw-card>`;
  }
}

customElements.define("bw-settings-card", SettingsCard);
