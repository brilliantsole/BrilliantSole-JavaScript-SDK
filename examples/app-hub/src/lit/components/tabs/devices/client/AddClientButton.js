import { waitForGlobals } from "../../../../../utils/cross-origin-storage-utils.js";

const { lit, BW, litRef, litSignals } = await waitForGlobals();
const { SignalWatcher } = litSignals;
const { LitElement, html, css } = lit;

import "https://ka-f.webawesome.com/webawesome@3.12.0/components/button/button.js";
import { createIsLeftHandedContextConsumer } from "../../../../contexts/isLeftHandedContext.js";
import { waitForAnimationFrames } from "../../../../../utils/rendering.js";
import { isAddingClientSignal } from "./AddClientSignals.js";
import { createDirectionContextConsumer } from "../../../../contexts/directionContext.js";

class AddClientButton extends SignalWatcher(LitElement) {
  createRenderRoot() {
    return this;
  }

  static properties = {
    isLeftHanded: { type: Boolean },
    useHandedness: { type: Boolean, attribute: "use-handedness" },
  };

  async _onClick() {
    isAddingClientSignal.set(!isAddingClientSignal.get());
  }

  _isLeftHandedConsumer = createIsLeftHandedContextConsumer(
    this,
    true,
    async () => {
      await waitForAnimationFrames(2);
      this.isLeftHanded = this.isLeftHandedState.isLeftHanded;
    },
  );
  /** @type {import("../../../../contexts/isLeftHandedContext.js").IsLeftHandedContextState} */
  get isLeftHandedState() {
    return this._isLeftHandedConsumer.value.state;
  }

  _directionConsumer = createDirectionContextConsumer(this, true);
  /** @type {import("../../../../contexts/directionContext.js").DirectionContextState} */
  get directionState() {
    return this._directionConsumer.value.state;
  }

  render() {
    const isAddingClient = isAddingClientSignal.get();
    let slotName = "start";
    if (this.useHandedness) {
      if (this.directionState.isLeftToRight) {
        slotName = this.isLeftHanded ? "start" : "end";
      } else {
        slotName = !this.isLeftHanded ? "start" : "end";
      }
    }
    return html`
      <wa-button variant="neutral" size="s" @click=${this._onClick}>
        ${isAddingClient ? "Remove Client" : "Add Client"}
        <wa-icon
          slot=${slotName}
          name=${isAddingClient ? "minus" : "plus"}
        ></wa-icon>
      </wa-button>
    `;
  }
}

customElements.define("bw-add-client-button", AddClientButton);
