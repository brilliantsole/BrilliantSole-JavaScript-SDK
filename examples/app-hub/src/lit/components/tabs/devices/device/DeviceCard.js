import { waitForGlobals } from "../../../../../utils/cross-origin-storage-utils.js";

const { lit, BW, litSignals, litRepeat, litStyleMap } = await waitForGlobals();
const { SignalWatcher, signal } = litSignals;
const { repeat } = litRepeat;
const { styleMap } = litStyleMap;

const { LitElement, html, nothing } = lit;

class DeviceCard extends LitElement {
  createRenderRoot() {
    return this;
  }

  static properties = {
    device: { attribute: false },
  };

  connectedCallback() {
    super.connectedCallback();

    this._abortController = new AbortController();
    /** @type {AddEventListenerOptions} */
    const options = { signal: this._abortController.signal };
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this._abortController.abort();
  }

  /** @type {import("../../../../../../../../build/brilliantwear.module.js").Device} */
  get _device() {
    return this.device;
  }

  render() {
    return html`${this._device.name}`;
  }
}

customElements.define("bw-device-card", DeviceCard);
