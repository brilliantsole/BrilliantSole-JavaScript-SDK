import { waitForGlobals } from "../../../../../utils/cross-origin-storage-utils.js";

const { lit, BW, litRef, litSignals } = await waitForGlobals();

const { ref, createRef } = litRef;
const { SignalWatcher } = litSignals;

const { LitElement, html, css } = lit;

import "https://ka-f.webawesome.com/webawesome@3.12.0/components/button/button.js";
import "https://ka-f.webawesome.com/webawesome@3.12.0/components/spinner/spinner.js";
import "https://ka-f.webawesome.com/webawesome@3.12.0/components/animation/animation.js";

import { createDisableTransitionsContextConsumer } from "../../../../contexts/disableTransitionsContext.js";
import {
  addDeviceAbortControllerSignal,
  isAddingDeviceSignal,
} from "./AddDeviceSignals.js";
import { createIsLeftHandedContextConsumer } from "../../../../contexts/isLeftHandedContext.js";
import { waitForAnimationFrames } from "../../../../../utils/rendering.js";
import { createDirectionContextConsumer } from "../../../../contexts/directionContext.js";

class AddDeviceButton extends SignalWatcher(LitElement) {
  createRenderRoot() {
    return this;
  }

  static properties = {
    isLeftHanded: { type: Boolean },
    useHandedness: { type: Boolean, attribute: "use-handedness" },
  };

  animationRef = createRef();

  _disableTransitionsConsumer = createDisableTransitionsContextConsumer(this);
  /** @type {import("../../../../contexts/disableTransitionsContext.js").DisableTransitionsContextState} */
  get _disableTransitionsState() {
    return this._disableTransitionsConsumer.value.state;
  }
  get disableTransitions() {
    return this._disableTransitionsState.disableTransitions;
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

  async _onClick() {
    const abortController = addDeviceAbortControllerSignal.get();
    if (abortController) {
      console.log("cancelling existing device connection");
      abortController.abort();
      addDeviceAbortControllerSignal.set();
      return;
    }

    try {
      if (!this.disableTransitions) {
        this.animationRef.value.play = true;
      }
      isAddingDeviceSignal.set(true);

      const abortController = new AbortController();
      addDeviceAbortControllerSignal.set(abortController);

      const device = await BW.Device.Connect({
        signal: abortController.signal,
      });
    } catch (error) {
      console.error("failed to connect to device", error);
    } finally {
      isAddingDeviceSignal.set(false);
      if (this.animationRef.value) {
        this.animationRef.value.play = false;
      }
      addDeviceAbortControllerSignal.set();
    }
  }

  _directionConsumer = createDirectionContextConsumer(this, true);
  /** @type {import("../../../../contexts/directionContext.js").DirectionContextState} */
  get directionState() {
    return this._directionConsumer.value.state;
  }

  render() {
    const isAddingDevice = isAddingDeviceSignal.get();
    let slotName = "start";
    if (this.useHandedness) {
      if (this.directionState.isLeftToRight) {
        slotName = this.isLeftHanded ? "start" : "end";
      } else {
        slotName = !this.isLeftHanded ? "start" : "end";
      }
    }
    const slot = isAddingDevice
      ? html`<wa-spinner slot=${slotName}></wa-spinner>`
      : html`<wa-icon slot=${slotName} name="plus"></wa-icon>`;
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
          ${slot} ${isAddingDevice ? "Adding Device" : "Add Device"}
        </wa-button>
      </wa-animation>
    `;
  }
}

customElements.define("bw-add-device-button", AddDeviceButton);
