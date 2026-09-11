import { waitForGlobals } from "../../../../utils/cross-origin-storage-utils.js";
import { createBluetoothContextConsumer } from "../../../contexts/bluetoothContext.js";
import { tabIcons, tabVariants } from "../../tabs/tabs.js";
const { lit } = await waitForGlobals();

const { LitElement, html, nothing } = lit;

import "../HeaderButton.js";

class NavButtonDevices extends LitElement {
  createRenderRoot() {
    return this;
  }

  _bluetoothConsumer = createBluetoothContextConsumer(this, true);
  /** @type {import("../../../contexts/bluetoothContext.js").BluetoothContextState} */
  get _bluetoothState() {
    return this._bluetoothConsumer.value.state;
  }
  get isBluetoothEnabled() {
    return this._bluetoothState.isBluetoothEnabled;
  }

  render() {
    const { name, family } = tabIcons["devices"];

    return html`<bw-header-button
      href="/devices"
      icon-name=${name}
      icon-family=${family}
      variant=${this.isBluetoothEnabled ? tabVariants["devices"] : "neutral"}
    >
      Devices
    </bw-header-button>`;
  }
}
customElements.define("bw-nav-button-devices", NavButtonDevices);
