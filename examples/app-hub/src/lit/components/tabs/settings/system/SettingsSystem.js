import { waitForGlobals } from "../../../../../utils/cross-origin-storage-utils.js";

const { lit } = await waitForGlobals();

const { LitElement, html } = lit;

import "../SettingsCard.js";

import "./SettingsRefreshButton.js";

class SettingsSystem extends LitElement {
  createRenderRoot() {
    return this;
  }

  clear() {}

  render() {
    return html`
      <bw-settings-card label="System" @clear=${this.clear} hide-clear>
        <bw-settings-refresh-button></bw-settings-refresh-button>
      </bw-settings-card>
    `;
  }
}

customElements.define("bw-settings-system", SettingsSystem);
