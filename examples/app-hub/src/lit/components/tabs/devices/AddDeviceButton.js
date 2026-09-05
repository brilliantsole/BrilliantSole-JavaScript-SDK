import { waitForGlobals } from "../../../../utils/cross-origin-storage-utils.js";

const { lit, BW, litRef } = await waitForGlobals();

const { ref, createRef } = litRef;

const { LitElement, html, css } = lit;

import "https://ka-f.webawesome.com/webawesome@3.12.0/components/button/button.js";
import "https://ka-f.webawesome.com/webawesome@3.12.0/components/spinner/spinner.js";
import "https://ka-f.webawesome.com/webawesome@3.12.0/components/animation/animation.js";
import { createDisableTransitionsContextConsumer } from "../../../contexts/disableTransitionsContext.js";

class AddDeviceButton extends LitElement {
  createRenderRoot() {
    return this;
  }

  static properties = {
    isConnecting: { type: Boolean },
  };

  animationRef = createRef();

  _disableTransitionsConsumer = createDisableTransitionsContextConsumer(this);
  /** @type {import("../../../contexts/disableTransitionsContext.js").DisableTransitionsContextState} */
  get _disableTransitionsState() {
    return this._disableTransitionsConsumer.value.state;
  }
  get disableTransitions() {
    return this._disableTransitionsState.disableTransitions;
  }

  /** @type {AbortController?} */
  _abortController;
  async _onClick() {
    if (this.isConnecting) {
      console.log("cancelling existing device connection");
      this._abortController?.abort();
      this._abortController = undefined;
      return;
    }

    try {
      if (!this.disableTransitions) {
        this.animationRef.value.play = true;
      }
      this.isConnecting = true;

      const device = await BW.Device.Connect();
    } catch (error) {
      console.error("failed to connect to device", error);
    } finally {
      this.isConnecting = false;
      this.animationRef.value.play = false;
      this._abortController = undefined;
    }
  }

  render() {
    const slot = this.isConnecting
      ? html`<wa-spinner slot="start"></wa-spinner>`
      : html`<wa-icon slot="start" name="plus"></wa-icon>`;
    return html`
      <wa-animation
        name="pulse"
        easing="ease-in-out"
        duration="2000"
        ${ref(this.animationRef)}
      >
        <wa-button
          data-bluetooth-available-only
          variant="brand"
          size="s"
          @click=${this._onClick}
          ?disabled=${!BW.Device.CanConnect}
        >
          ${slot} ${this.isConnecting ? "Adding Device" : "Add Device"}
        </wa-button>
      </wa-animation>
    `;
  }
}

customElements.define("bw-add-device-button", AddDeviceButton);
