import { waitForGlobals } from "../../../../utils/cross-origin-storage-utils.js";
import { createBluetoothContextConsumer } from "../../../contexts/bluetoothContext.js";
import { tabIcons, tabVariants } from "../../tabs/tabs.js";
const { lit, litSignals } = await waitForGlobals();
const { SignalWatcher } = litSignals;

const { LitElement, html, nothing } = lit;

import { connectedDeviceBluetoothIdsSignal } from "../../tabs/devices/DevicesSignals.js";

import "../HeaderButton.js";

class NavButtonDevices extends SignalWatcher(LitElement) {
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

    const deviceBluetoothIds = connectedDeviceBluetoothIdsSignal.get();
    // console.log("deviceBluetoothIds", deviceBluetoothIds);

    const variant = this.isBluetoothEnabled
      ? tabVariants["devices"]
      : "neutral";

    return html`<bw-header-button
      href="/devices"
      icon-name=${name}
      icon-family=${family}
      variant=${variant}
      ?use-slot=${deviceBluetoothIds.length > 0}
    >
      Devices
      <div slot="badge">${deviceBluetoothIds.length}</div>
    </bw-header-button>`;
  }
}
customElements.define("bw-nav-button-devices", NavButtonDevices);
