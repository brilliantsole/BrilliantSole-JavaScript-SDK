import { waitForGlobals } from "../../../../../utils/cross-origin-storage-utils.js";

const { lit, litRef } = await waitForGlobals();

const { LitElement, html } = lit;
const { ref, createRef } = litRef;

import "../../../utils/Toggle.js";

import { createIsLeftHandedContextConsumer } from "../../../../contexts/isLeftHandedContext.js";
import { createDirectionContextConsumer } from "../../../../contexts/directionContext.js";

class SettingsThemeToggle extends LitElement {
  createRenderRoot() {
    return this;
  }

  static properties = {
    switch: { type: Boolean },
  };

  _directionConsumer = createDirectionContextConsumer(this, true, () => {
    this._updateChecked();
  });
  /** @type {import("../../../../contexts/directionContext.js").DirectionContextState} */
  get directionState() {
    return this._directionConsumer.value.state;
  }
  get isLeftToRight() {
    return this.directionState.isLeftToRight;
  }

  ref = createRef();
  _updateChecked() {
    if (this.ref.value) {
      this.ref.value.checked = this.checked;
    }
  }

  _isLeftHandedConsumer = createIsLeftHandedContextConsumer(this, true, () => {
    this._updateChecked();
  });

  /** @type {import("../../../../contexts/isLeftHandedContext.js").IsLeftHandedContextState} */
  get isLeftHandedState() {
    return this._isLeftHandedConsumer.value.state;
  }
  get isLeftHanded() {
    return this.isLeftHandedState.isLeftHanded;
  }

  _onChange(event) {
    const { checked } = event.target;
    const isLeftHanded = this.isLeftToRight ? !checked : checked;
    event.target.checked = this.checked;
    this.isLeftHandedState.isLeftHanded = isLeftHanded;
    this._isLeftHandedConsumer.value.update(this.isLeftHandedState, true);
  }

  get checked() {
    return this.isLeftToRight ? !this.isLeftHanded : this.isLeftHanded;
  }

  render() {
    return html`<bw-toggle
      data-touch-only
      ${ref(this.ref)}
      ?checked=${this.checked}
      @change=${this._onChange}
      label=${this.isLeftToRight ? "Right Handed" : "Left Handed"}
      ?switch=${this.switch}
    ></bw-toggle>`;
  }
}

customElements.define("bw-settings-left-handed-toggle", SettingsThemeToggle);
