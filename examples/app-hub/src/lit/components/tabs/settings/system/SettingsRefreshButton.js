import { waitForGlobals } from "../../../../../utils/cross-origin-storage-utils.js";

const { lit, litRef } = await waitForGlobals();

const { LitElement, html } = lit;

class SettingsRefreshButton extends LitElement {
  createRenderRoot() {
    return this;
  }

  click(event) {
    window.location.reload();
  }

  render() {
    return html`<wa-button
      size="s"
      appearance="accent"
      variant="warning"
      @click=${this.click}
      >Refresh page</wa-button
    >`;
  }
}

customElements.define("bw-settings-refresh-button", SettingsRefreshButton);
