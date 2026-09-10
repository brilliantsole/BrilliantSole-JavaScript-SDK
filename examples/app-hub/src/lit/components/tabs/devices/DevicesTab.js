import { waitForGlobals } from "../../../../utils/cross-origin-storage-utils.js";
import { createBluetoothContextConsumer } from "../../../contexts/bluetoothContext.js";

import "https://ka-f.webawesome.com/webawesome@3.12.0/components/resize-observer/resize-observer.js";

const { lit, BW, litSignals, litRepeat, litStyleMap } = await waitForGlobals();
const { SignalWatcher, signal } = litSignals;
const { repeat } = litRepeat;
const { styleMap } = litStyleMap;

const { LitElement, html, nothing } = lit;

import "./bluetooth/AddDeviceButton.js";
import "./client/AddClientButton.js";

import "./client/ClientInput.js";
import "./device/DeviceCard.js";

import {
  isAddingClientSignal,
  addClientConfigSignal,
  defaultAddClientConfig,
} from "./client/AddClientSignals.js";
import { createDisableViewTransitionsContextConsumer } from "../../../contexts/disableViewTransitionsContext.js";

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

  _disableViewTransitionsConsumer =
    createDisableViewTransitionsContextConsumer(this);
  /** @type {import("../../../contexts/disableViewTransitionsContext.js").DisableViewTransitionsContextState} */
  get disableViewTransitionsState() {
    return this._disableViewTransitionsConsumer.value.state;
  }
  get disableViewTransitions() {
    return this.disableViewTransitionsState.disableViewTransitions;
  }

  async _toggleAddClient(manual) {
    const newIsAddingClient = !isAddingClientSignal.get();
    const update = () => {
      isAddingClientSignal.set(newIsAddingClient);
      if (!newIsAddingClient) {
        addClientConfigSignal.set({ ...defaultAddClientConfig });
      }
    };
    if (this.disableViewTransitions || !manual) {
      update();
    } else {
      const types = [newIsAddingClient ? "add-client" : "remove-client"];
      console.log("types", types);
      await document.startViewTransition({
        update: async () => {
          update();
        },
        types,
      }).finished;
    }
  }

  connectedCallback() {
    super.connectedCallback();

    this._abortController = new AbortController();
    /** @type {AddEventListenerOptions} */
    const options = { signal: this._abortController.signal };

    this._updateClients();

    BW.ClientManager.addEventListener(
      "clientIsConnected",
      (event) => {
        this._updateClients();
        this.requestUpdate();
      },
      { ...options },
    );

    BW.DeviceManager.addEventListener(
      "availableDevices",
      (event) => {
        this.requestUpdate();
      },
      { ...options, immediate: true },
    );

    this.addEventListener(
      "bw-toggle-add-client",
      (event) => {
        const { manual } = event.detail;
        event.stopPropagation();
        this._toggleAddClient(manual);
      },
      options,
    );
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this._abortController.abort();
  }

  /** @type {import("../../../../../../../build/brilliantwear.module.js").WebSocketClient[]} */
  clients = [];
  _updateClients() {
    this.clients = BW.ClientManager.clients.filter(
      (client) => client.type == "webSocket" && client.hasConnectedOnce,
    );
  }

  get devices() {
    return BW.DeviceManager.availableDevices;
  }

  render() {
    const isAddingClient = isAddingClientSignal.get();
    console.log({ isAddingClient }, this.clients, this.devices);

    const clientsStyles = {
      "--bw-grid-lane-width": "17em",
      "justify-items": "stretch !important",
    };

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

      <div class="wa-stack wa-gap-xs">
        <div
          data-not-touch-not-portrait-only
          class="wa-cluster wa-gap-xs bw-justify-content"
          data-tab-view-transition-container
        >
          <bw-add-device-button
            data-bluetooth-available-only
          ></bw-add-device-button>
          <bw-add-client-button></bw-add-client-button>
        </div>

        <div
          class="bw-grid-lanes"
          style="${styleMap(clientsStyles)}"
          data-manual-width
        >
          ${repeat(
            this.clients.filter((client) => client.type == "webSocket"),
            (client) => client,
            (client) =>
              html`<bw-client-input .client=${client}></bw-client-input>`,
          )}
          ${isAddingClient
            ? html` <bw-client-input data-pop-on-enter></bw-client-input>`
            : nothing}
        </div>

        <div
          class="bw-grid-lanes"
          style="${styleMap(clientsStyles)}"
          data-manual-width
        >
          ${repeat(
            this.devices,
            (device) => device,
            (device) =>
              html`<bw-device-card .device=${device}></bw-device-card>`,
          )}
        </div>
      </div>

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
