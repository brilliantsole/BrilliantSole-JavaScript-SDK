import { waitForGlobals } from "../../../../../utils/cross-origin-storage-utils.js";

const { lit, BW, litSignals, litRepeat, litStyleMap } = await waitForGlobals();
const { SignalWatcher, signal } = litSignals;
const { repeat } = litRepeat;
const { styleMap } = litStyleMap;

const { LitElement, html, nothing } = lit;

/** @typedef {import("../../../../../../../../build/brilliantwear.module.js").Device} Device */
/** @typedef {import("../../../../../../../../build/brilliantwear.module.js").DiscoveredDevice} DiscoveredDevice */

class DeviceCard extends LitElement {
  createRenderRoot() {
    return this;
  }

  static properties = {
    bluetoothId: {},
  };

  connectedCallback() {
    super.connectedCallback();

    this.device = this.getDevice();

    this._abortController = new AbortController();
    /** @type {AddEventListenerOptions} */
    const options = { signal: this._abortController.signal };

    // FILL
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this._abortController.abort();
  }

  getDevice() {
    return BW.DeviceManager.availableDevices.find(
      (device) => device.bluetoothId == this.bluetoothId,
    );
  }
  get discoveredDevice() {
    return BW.ScannerManager.discoveredDevices[this.bluetoothId];
  }

  render() {
    console.log(this.discoveredDevice, this.device);
    return html`${this.bluetoothId}`;
  }
}

customElements.define("bw-device-card", DeviceCard);
