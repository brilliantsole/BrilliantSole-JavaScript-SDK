import { waitForGlobals } from "../../../../utils/cross-origin-storage-utils.js";
import { createBluetoothContextConsumer } from "../../../contexts/bluetoothContext.js";

import "https://ka-f.webawesome.com/webawesome@3.12.0/components/resize-observer/resize-observer.js";

const { lit, BW, litSignals, litRepeat, litStyleMap } = await waitForGlobals();
const { SignalWatcher, signal, Signal } = litSignals;
const { repeat } = litRepeat;
const { styleMap } = litStyleMap;

const { LitElement, html, nothing } = lit;

import "./bluetooth/AddDeviceButton.js";

import "./client/AddClientButton.js";
import "./client/ClientInput.js";

import "./scanner/ToggleScannerButton.js";

import "./device/DeviceCard.js";

import {
  isAddingClientSignal,
  addClientConfigSignal,
  defaultAddClientConfig,
} from "./client/AddClientSignals.js";
import { createDisableViewTransitionsContextConsumer } from "../../../contexts/disableViewTransitionsContext.js";
import { availableDeviceBluetoothIdsSignal } from "./DevicesSignals.js";
import { waitForAnimationFrames } from "../../../../utils/rendering.js";

import {
  isScanningAvailableSignal,
  isScanningSignal,
} from "./scanner/ScannerSignals.js";

/** @typedef {import("../../../../../../../build/brilliantwear.module.js").WebSocketClient} WebSocketClient */

class DevicesTab extends LitElement {
  createRenderRoot() {
    return this;
  }

  static properties = {
    isScanning: { type: Boolean },
    isScanningAvailable: { type: Boolean },
  };

  _bluetoothConsumer = createBluetoothContextConsumer(this, true);
  /** @type {import("../../../contexts/bluetoothContext.js").BluetoothContextState} */
  get bluetoothState() {
    return this._bluetoothConsumer.value.state;
  }
  get isBluetoothEnabled() {
    return this.bluetoothState.isBluetoothEnabled;
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

  get _viewTransition() {
    return this._addClientViewTransition || this._devicesViewTransition;
  }

  async _toggleAddClient(manual) {
    const newIsAddingClient = !isAddingClientSignal.get();
    const update = async (noViewTransition) => {
      isAddingClientSignal.set(newIsAddingClient);
      if (!newIsAddingClient) {
        addClientConfigSignal.set({ ...defaultAddClientConfig });
      }
      if (noViewTransition) {
        await waitForAnimationFrames(1);
        if (!this._viewTransition) {
          this.requestUpdate();
        }
      } else {
        this.requestUpdate();
      }
    };
    if (this.disableViewTransitions || !manual || this._viewTransition) {
      update(true);
    } else {
      const types = [manual ? "toggle-client-manual" : "toggle-client"];
      // console.log("types", types);
      this._addClientViewTransition = document.startViewTransition({
        update: async () => {
          update();
        },
        types,
      });
      await this._addClientViewTransition.finished;
      this._addClientViewTransition = undefined;
    }
  }

  _onIsScanningAvailableUpdate() {
    // console.log("_onIsScanningAvailableUpdate");
    this.isScanningAvailable = isScanningAvailableSignal.get();
  }
  _onIsScanningUpdate() {
    // console.log("_onIsScanningUpdate");
    this.isScanning = isScanningSignal.get();
  }

  /** @type {string[]} */
  availableDeviceBluetoothIds = [];
  async _onDeviceBluetoothIdsUpdate(requestUpdate = true) {
    // console.log("_onDeviceBluetoothIdsUpdate", { requestUpdate });
    this.availableDeviceBluetoothIds = availableDeviceBluetoothIdsSignal.get();
    // console.log(
    //   "this.availableDeviceBluetoothIds",
    //   this.availableDeviceBluetoothIds,
    // );

    if (requestUpdate) {
      const update = async (noViewTransition) => {
        if (noViewTransition) {
          if (this._viewTransition) {
            await this._viewTransition.finished;
            this._onDeviceBluetoothIdsUpdate();
            return;
          }
        }
        this.requestUpdate();
      };
      if (this.disableViewTransitions || this._viewTransition) {
        update(Boolean(this._viewTransition));
      } else {
        const types = ["devices-update"];
        // console.log("types", types);
        this._devicesViewTransition = document.startViewTransition({
          update: async () => {
            update();
          },
          types,
        });
        await this._devicesViewTransition.finished;
        this._devicesViewTransition = undefined;
      }
    }
  }

  connectedCallback() {
    super.connectedCallback();

    this._deviceBluetoothIdsWatcher = new Signal.subtle.Watcher(async () => {
      await 0;
      this._onDeviceBluetoothIdsUpdate();
      this._deviceBluetoothIdsWatcher.watch();
    });
    this._deviceBluetoothIdsWatcher.watch(availableDeviceBluetoothIdsSignal);
    this._onDeviceBluetoothIdsUpdate(false);

    this._isScanningAvailableWatcher = new Signal.subtle.Watcher(async () => {
      await 0;
      this._onIsScanningAvailableUpdate();
      this._isScanningAvailableWatcher.watch();
    });
    this._isScanningAvailableWatcher.watch(isScanningAvailableSignal);
    this._onIsScanningAvailableUpdate();

    this._isScanningWatcher = new Signal.subtle.Watcher(async () => {
      await 0;
      this._onIsScanningUpdate();
      this._isScanningWatcher.watch();
    });
    this._isScanningWatcher.watch(isScanningSignal);
    this._onIsScanningUpdate();

    this._abortController = new AbortController();
    /** @type {AddEventListenerOptions} */
    const options = { signal: this._abortController.signal };

    this._updateClients();

    BW.ClientManager.addEventListener(
      "clientIsConnected",
      (event) => {
        console.log("clientIsConnected");
        this._updateClients(true);
      },
      { ...options },
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
    this._deviceBluetoothIdsWatcher?.unwatch();
    this._isScanningWatcher?.unwatch();
    this._isScanningAvailableWatcher?.unwatch();
    this._abortController.abort();
  }

  /** @type {WebSocketClient[]} */
  clients = [];
  async _updateClients(requestUpdate = false) {
    this.clients = BW.ClientManager.clients.filter(
      (client) => client.type == "webSocket" && client.hasConnectedOnce,
    );
    // console.log("_updateClients", this.clients);
    await waitForAnimationFrames(2);
    if (requestUpdate && !this._viewTransition) {
      this.requestUpdate();
    }
  }

  render() {
    const isAddingClient = isAddingClientSignal.get();
    const availableDeviceBluetoothIds = this.availableDeviceBluetoothIds;
    // console.log({ isAddingClient }, this.clients, availableDeviceBluetoothIds);

    // console.log({
    //   isScanningAvailable: this.isScanningAvailable,
    //   isScanning: this.isScanning,
    // });

    const clientsStyles = {
      "--bw-grid-lane-width": "17em",
      "justify-items": "stretch !important",
    };
    const devicesStyles = {
      "--bw-grid-lane-width": "15em",
      "justify-items": "stretch !important",
    };

    return html`
      <div class="wa-stack wa-gap-xs">
        <p data-ios-only data-bluetooth-not-available-only data-web-only>
          Bluetooth is not available - download the
          <a href="https://ioswebble.com/" target="_blank">ioswebble</a> app
        </p>
        <div
          data-not-touch-not-portrait-only
          class="wa-cluster wa-gap-xs bw-justify-content"
          data-tab-view-transition-container
        >
          <bw-add-device-button
            data-web-bluetooth-available-only
          ></bw-add-device-button>
          <bw-toggle-scanner-button
            data-bluetooth-scanning-available-only
          ></bw-toggle-scanner-button>
          <bw-add-client-button></bw-add-client-button>
        </div>

        <div
          class="bw-grid-lanes"
          style="${styleMap(clientsStyles)}"
          data-manual-width
          ?data-hidden=${!isAddingClient && this.clients.length == 0}
        >
          ${repeat(
            this.clients.filter((client) => client.type == "webSocket"),
            (client) => client,
            (client) =>
              html`<bw-client-input .client=${client}></bw-client-input>`,
          )}
          ${isAddingClient
            ? html` <bw-client-input></bw-client-input>`
            : nothing}
        </div>

        <div
          class="bw-grid-lanes"
          style="${styleMap(devicesStyles)}"
          data-max-width
          ?data-hidden=${availableDeviceBluetoothIds.length == 0}
        >
          ${repeat(
            availableDeviceBluetoothIds,
            (bluetoothId) => bluetoothId,
            (bluetoothId) =>
              html`<bw-device-card
                .bluetoothId=${bluetoothId}
              ></bw-device-card>`,
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
            <div class="wa-stack wa-gap-xs" data-align-items>
              <bw-add-client-button use-handedness></bw-add-client-button>
              <bw-toggle-scanner-button
                data-bluetooth-scanning-available-only
                use-handedness
              ></bw-toggle-scanner-button>
              <bw-add-device-button
                data-web-bluetooth-available-only
                use-handedness
              ></bw-add-device-button>
            </div>
          </div>
        </wa-resize-observer>
      </div>
    `;
  }
}

customElements.define("bw-devices-tab", DevicesTab);
