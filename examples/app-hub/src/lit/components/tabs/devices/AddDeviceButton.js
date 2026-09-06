import { waitForGlobals } from "../../../../utils/cross-origin-storage-utils.js";

const { lit, BW, litRef, litSignals } = await waitForGlobals();

const { ref, createRef } = litRef;
const { SignalWatcher, watch, signal } = litSignals;

const { LitElement, html, css } = lit;

import "https://ka-f.webawesome.com/webawesome@3.12.0/components/button/button.js";
import "https://ka-f.webawesome.com/webawesome@3.12.0/components/spinner/spinner.js";
import "https://ka-f.webawesome.com/webawesome@3.12.0/components/animation/animation.js";

import { createDisableTransitionsContextConsumer } from "../../../contexts/disableTransitionsContext.js";

/** @type {import("@lit-labs/signals").Signal.State<Boolean>} */
const isConnecting = signal(false);

/** @type {import("@lit-labs/signals").Signal.State<AbortController?>} */
const abortController = signal();

class AddDeviceButton extends SignalWatcher(LitElement) {
  createRenderRoot() {
    return this;
  }

  animationRef = createRef();

  _disableTransitionsConsumer = createDisableTransitionsContextConsumer(this);
  /** @type {import("../../../contexts/disableTransitionsContext.js").DisableTransitionsContextState} */
  get _disableTransitionsState() {
    return this._disableTransitionsConsumer.value.state;
  }
  get disableTransitions() {
    return this._disableTransitionsState.disableTransitions;
  }

  async _onClick() {
    const _abortController = abortController.get();
    if (_abortController) {
      console.log("cancelling existing device connection");
      _abortController.abort();
      abortController.set();
      return;
    }

    try {
      if (!this.disableTransitions) {
        this.animationRef.value.play = true;
      }
      isConnecting.set(true);

      const _abortController = new AbortController();
      abortController.set(_abortController);

      const device = await BW.Device.Connect({
        signal: _abortController.signal,
      });
    } catch (error) {
      console.error("failed to connect to device", error);
    } finally {
      isConnecting.set(false);
      this.animationRef.value.play = false;
      abortController.set();
    }
  }

  render() {
    const slot = isConnecting.get()
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
