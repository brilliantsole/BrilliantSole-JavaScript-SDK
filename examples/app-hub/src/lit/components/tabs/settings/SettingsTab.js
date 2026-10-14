import { waitForGlobals } from "../../../../utils/cross-origin-storage-utils.js";
import { createTouchEnabledContextConsumer } from "../../../contexts/touchEnabledContext.js";

const { lit } = await waitForGlobals();

const { LitElement, html } = lit;

import "./appearance/SettingsAppearance.js";
import "./interface/SettingsInterface.js";
import "./gestures/SettingsGestures.js";
import "./system/SettingsSystem.js";
import "./action-buttons/SettingsActionButtons.js";

class SettingsTab extends LitElement {
  createRenderRoot() {
    return this;
  }

  _touchEnabledConsumer = createTouchEnabledContextConsumer(this, true);
  get touchEnabled() {
    return this._touchEnabledConsumer.value.state.touchEnabled;
  }

  render() {
    const settingsInterface = this.touchEnabled
      ? html`<bw-settings-interface></bw-settings-interface>`
      : "";
    const settingsActionButtons = this.touchEnabled
      ? html`<bw-settings-action-buttons></bw-settings-action-buttons>`
      : "";
    const settingsGestures = this.touchEnabled
      ? html`<bw-settings-gestures></bw-settings-gestures>`
      : "";

    return html`
      <div class="bw-grid-lanes">
        <bw-settings-appearance></bw-settings-appearance>
        ${settingsInterface} ${settingsGestures} ${settingsActionButtons}
        <bw-settings-system></bw-settings-system>
      </div>
    `;
  }
}

customElements.define("bw-settings-tab", SettingsTab);
