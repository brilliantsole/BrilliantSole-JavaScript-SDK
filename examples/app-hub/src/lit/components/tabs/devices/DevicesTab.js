import { waitForGlobals } from "../../../../utils/cross-origin-storage-utils.js";
import { createBluetoothContextConsumer } from "../../../contexts/bluetoothContext.js";
import "https://ka-f.webawesome.com/webawesome@3.12.0/components/resize-observer/resize-observer.js";

const { lit, BW, litSignals } = await waitForGlobals();
const { SignalWatcher } = litSignals;

const { LitElement, html, nothing } = lit;

import "./bluetooth/AddDeviceButton.js";
import "./client/AddClientButton.js";

import "./client/ClientInput.js";

import { isAddingClientSignal } from "./client/AddClientSignals.js";

class DevicesTab extends SignalWatcher(LitElement) {
  createRenderRoot() {
    return this;
  }

  _bluetoothConsumer = createBluetoothContextConsumer(this, true);
  /** @type {import("../../../contexts/bluetoothContext.js").BluetoothContextState} */
  get bluetoothState() {
    return this._bluetoothConsumer.value.state;
  }
  get isBluetoothEnabled() {
    return this.bluetoothState.isEnabled;
  }

  render() {
    const isAddingClient = isAddingClientSignal.get();
    const addClient = isAddingClient
      ? html`<bw-client-input></bw-client-input>`
      : nothing;

    return html`
      <!--
      <p class="wa-font-size-m" data-bluetooth-not-available-only>
        Bluetooth is not available
      </p>
      <p
        class="wa-font-size-m"
        data-bluetooth-available-only
        data-bluetooth-not-enabled-only
      >
        Bluetooth is not enabled
      </p>
      -->

      <div data-not-touch-not-portrait-only>
        <bw-add-device-button
          data-bluetooth-available-only
        ></bw-add-device-button>
        <bw-add-client-button></bw-add-client-button>
      </div>

      <div class="clients">${addClient}</div>

      <div class="bw-overlay">
        <wa-resize-observer>
          <div
            data-main-align="start"
            data-cross-align="start"
            data-tab-view-transition
            data-portrait-only
            data-touch-only
          >
            <div class="wa-stack wa-gap-2xs" data-align-items>
              <bw-add-client-button use-handedness></bw-add-client-button>
              <bw-add-device-button
                use-handedness
                data-bluetooth-available-only
              ></bw-add-device-button>
            </div>
          </div>
        </wa-resize-observer>
      </div>
    `;
  }
}

customElements.define("bw-devices-tab", DevicesTab);
