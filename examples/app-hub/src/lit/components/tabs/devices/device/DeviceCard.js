import { waitForGlobals } from "../../../../../utils/cross-origin-storage-utils.js";

const { lit, BW, litSignals, litRepeat, litClassMap } = await waitForGlobals();
const { SignalWatcher, signal } = litSignals;
const { repeat } = litRepeat;
const { classMap } = litClassMap;

const { LitElement, html, nothing } = lit;

/** @typedef {import("../../../../../../../../build/brilliantwear.module.js").ConnectionStatus} ConnectionStatus */
/** @typedef {import("../../../../../../../../build/brilliantwear.module.js").EventDispatcherOptions} EventDispatcherOptions */
/** @typedef {import("../../../../../../../../build/brilliantwear.module.js").DeviceType} DeviceType */
/** @typedef {import("../../../../../../../../build/brilliantwear.module.js").Device} Device */
/** @typedef {import("../../../../../../../../build/brilliantwear.module.js").DiscoveredDevice} DiscoveredDevice */

import "https://ka-f.webawesome.com/webawesome@3.12.0/components/card/card.js";
import "https://ka-f.webawesome.com/webawesome@3.12.0/components/spinner/spinner.js";
import "https://ka-f.webawesome.com/webawesome@3.12.0/components/animation/animation.js";
import "https://ka-f.webawesome.com/webawesome@3.12.0/components/button-group/button-group.js";
import "https://ka-f.webawesome.com/webawesome@3.12.0/components/divider/divider.js";

import { createIsLeftHandedContextConsumer } from "../../../../contexts/isLeftHandedContext.js";
import { createTouchEnabledContextConsumer } from "../../../../contexts/touchEnabledContext.js";
import { waitForAnimationFrames } from "../../../../../utils/rendering.js";

class DeviceCard extends LitElement {
  createRenderRoot() {
    return this;
  }

  static properties = {
    bluetoothId: {},
    deviceType: {},
    name: {},
    rssi: { type: Number },
    rssiInterval: { type: Number },
    isCharging: { type: Boolean },
    batteryLevel: { type: Number },
    connectionStatus: {},
    isDeviceConnected: { type: Boolean },
    ipAddress: {},
    name: {},
    source: {},
    isWifiSecure: { type: Boolean },
    isScanning: { type: Boolean },
    isLeftHanded: { type: Boolean },
    touchEnabled: { type: Boolean },
    includeRssiInterval: { type: Boolean },
  };

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

  _touchEnabledConsumer = createTouchEnabledContextConsumer(
    this,
    true,
    async () => {
      this.touchEnabled = this.touchEnabledState.touchEnabled;
    },
  );
  /** @type {import("../../../../contexts/touchEnabledContext.js").TouchEnabledContextState} */
  get touchEnabledState() {
    return this._touchEnabledConsumer.value.state;
  }

  getDevice() {
    return BW.DeviceManager.availableDevices.find(
      (device) => device.bluetoothId == this.bluetoothId,
    );
  }
  getDiscoveredDevice() {
    return BW.ScannerManager.discoveredDevices[this.bluetoothId];
  }

  get isClient() {
    return (
      this._discoveredDevice?.scanner.isClient ||
      this._device?.connectionType == "client"
    );
  }

  /** @type {Device?} */
  _device;
  /** @param {Device} device */
  _onDevice(device) {
    if (this._device == device) {
      return;
    }
    // console.log("_onDevice", device);
    this._device = device;

    if (this._deviceAbortController) {
      this._deviceAbortController.abort();
    }
    this._deviceAbortController = new AbortController();
    /** @type {EventDispatcherOptions} */
    const options = {
      signal: this._deviceAbortController.signal,
      immediate: true,
    };

    this._device.addEventListener(
      "getType",
      () => {
        this.deviceType = this._device.type;
      },
      options,
    );
    this._device.addEventListener(
      "getName",
      () => {
        this.name = this._device.name;
      },
      options,
    );
    this._device.addEventListener(
      "isCharging",
      () => {
        this.isCharging = this._device.isCharging;
      },
      options,
    );
    this._device.addEventListener(
      "batteryLevel",
      () => {
        this.batteryLevel = this._device.batteryLevel;
      },
      options,
    );
    this._device.addEventListener(
      "ipAddress",
      () => {
        this.ipAddress = this._device.ipAddress;
      },
      options,
    );

    this._device.addEventListener(
      "connectionStatus",
      () => {
        this.connectionStatus = this._device.connectionStatus;
      },
      options,
    );
    this._device.addEventListener(
      "isConnected",
      () => {
        this.isDeviceConnected = this._device.isConnected;
      },
      options,
    );
  }
  /** @type {DiscoveredDevice?} */
  _discoveredDevice;
  /** @param {DiscoveredDevice} discoveredDevice */
  _onDiscoveredDevice(discoveredDevice) {
    if (this._discoveredDevice == discoveredDevice) {
      return;
    }
    // console.log("_onDiscoveredDevice", discoveredDevice);
    this._discoveredDevice = discoveredDevice;

    if (this._discoveredDeviceAbortController) {
      this._discoveredDeviceAbortController.abort();
    }
    this._discoveredDeviceAbortController = new AbortController();
    /** @type {AddEventListenerOptions} */
    const options = {
      signal: this._discoveredDeviceAbortController.signal,
      immediate: true,
    };

    this._discoveredDevice.addEventListener(
      "deviceType",
      () => {
        this.deviceType = this._discoveredDevice.deviceType;
      },
      options,
    );

    if (this._discoveredDevice.scanner.isClient) {
      this._discoveredDevice.scanner.addEventListener("isScanning", (event) => {
        this.isScanning = event.message.isScanning;
      });
    } else {
      this._discoveredDevice.scanner.addEventListener("isScanning", (event) => {
        this.isScanning = event.message.isScanning;
      });
    }

    this._discoveredDevice.addEventListener(
      "name",
      () => {
        this.name = this._discoveredDevice.name;
      },
      options,
    );
    this._discoveredDevice.addEventListener(
      "connectionStatus",
      () => {
        this.connectionStatus = this._discoveredDevice.connectionStatus;
      },
      options,
    );
    this._discoveredDevice.addEventListener(
      "isConnected",
      () => {
        this.isDeviceConnected = this._discoveredDevice.isConnected;
      },
      options,
    );
    this._discoveredDevice.addEventListener(
      "ipAddress",
      () => {
        this.ipAddress = this._discoveredDevice.ipAddress;
      },
      options,
    );
    this._discoveredDevice.addEventListener(
      "isWifiSecure",
      () => {
        this.isWifiSecure = this._discoveredDevice.isWifiSecure;
      },
      options,
    );
    this._lastRssiTimestamp = undefined;
    this._discoveredDevice.addEventListener(
      "rssi",
      () => {
        this.rssi = this._discoveredDevice.rssi;
        const now = Date.now();
        if (this.includeRssiInterval && this._lastRssiTimestamp != undefined) {
          this.rssiInterval = now - this._lastRssiTimestamp;
        }
        // console.log({ rssiInterval: this.rssiInterval, rssi: this.rssi });
        this._lastRssiTimestamp = now;
      },
      { ...options, immediate: false },
    );
  }

  connectedCallback() {
    super.connectedCallback();

    this._abortController = new AbortController();
    /** @type {AddEventListenerOptions} */
    const options = { signal: this._abortController.signal };

    const device = this.getDevice();
    this._onDevice(device);

    const discoveredDevice = this.getDiscoveredDevice();
    this._onDiscoveredDevice(discoveredDevice);

    BW.ScannerManager.addEventListener(
      "scannerDiscoveredDevice",
      (event) => {
        const { discoveredDevice } = event.message;
        if (discoveredDevice.bluetoothId == this.bluetoothId) {
          this._onDiscoveredDevice(discoveredDevice);
        }
      },
      options,
    );

    BW.DeviceManager.addEventListener(
      "availableDevice",
      (event) => {
        const { device } = event.message;
        if (device.bluetoothId == this.bluetoothId) {
          this._onDevice(device);
        }
      },
      options,
    );
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this._abortController.abort();
    this._discoveredDeviceAbortController?.abort();
    this._deviceAbortController?.abort();
  }

  /** @type {DeviceType} */
  get _deviceType() {
    return this.deviceType;
  }

  renderDeviceTypeIcon() {
    const deviceType = this._deviceType;
    switch (deviceType) {
      case "leftInsole":
      case "rightInsole":
        return html`<wa-icon
          src="./assets/icons/shoe.svg"
          flip=${deviceType == "leftInsole" ? "x" : ""}
        ></wa-icon>`;
        break;
      case "leftGlove":
      case "rightGlove":
        return html`<wa-icon
          name="hand"
          variant="regular"
          style="font-size: 1rem;"
          flip=${deviceType == "leftGlove" ? "x" : ""}
        ></wa-icon>`;
        break;
      case "glasses":
        return html`<wa-icon name="glasses"></wa-icon>`;
        break;
      case "generic":
        return html`<wa-icon
          name="circle-question"
          variant="regular"
        ></wa-icon>`;
        break;
      default:
        console.error(`uncaught deviceType "${this._deviceType}"`);
        return nothing;
    }
  }

  get deviceTypeLabel() {
    const deviceType = this._deviceType;
    switch (deviceType) {
      case "leftInsole":
        return "left insole";
        break;
      case "rightInsole":
        return "right insole";
        break;
      case "leftGlove":
        return "left glove";
        break;
      case "rightGlove":
        return "right glove";
        break;
      case "glasses":
        return "glasses";
        break;
      case "generic":
        return "generic device";
        break;
    }
  }

  _renderLabelWrapper(content) {
    return html`<div class="wa-cluster wa-gap-2xs">${content}</div>`;
  }

  renderRssi() {
    if (this._connectionStatus != "notConnected" || this.rssi == undefined) {
      return nothing;
    }
    if (!this._discoveredDevice.scanner?.isScanning) {
      return nothing;
    }
    return this._renderLabelWrapper(
      html`<wa-icon name="signal"></wa-icon>
        <div style="width: 1.5em;">${this.rssi}</div>`,
    );
  }
  renderRssiInterval() {
    if (
      this._connectionStatus != "notConnected" ||
      this.rssiInterval == undefined
    ) {
      return nothing;
    }
    return this._renderLabelWrapper(
      html`<wa-icon name="clock" variant="regular"></wa-icon>
        <div style="width: 2em;">${this.rssiInterval}</div>`,
    );
  }
  renderIpAddress() {
    if (this.ipAddress == undefined) {
      return nothing;
    }

    const classes = {
      "bw-wa-color": true,
    };
    if (this.isDeviceConnected && this._device.connectionType == "webSocket") {
      if (this._device.isWifiSecure) {
        classes["wa-success"] = true;
      } else {
        classes["wa-brand"] = true;
      }
    }

    return this._renderLabelWrapper(
      html`<wa-icon name="wifi" class=${classMap(classes)}></wa-icon>
        <div class=${classMap(classes)}>${this.ipAddress}</div>`,
    );
  }
  renderClientIpAddress() {
    const client = this.getClient();
    if (client?.type != "webSocket") {
      return nothing;
    }
    return this._renderLabelWrapper(
      html`<wa-icon name="globe"></wa-icon>
        <div>
          ${client.url.protocol}//${client.url.host}${client.url.port
            ? `:${client.url.port}`
            : nothing}
        </div>`,
    );
  }
  renderBattery() {
    if (!this.isDeviceConnected || this.batteryLevel == undefined) {
      return nothing;
    }

    const classes = {
      "bw-wa-color": true,
    };
    let colorName;

    let iconName;
    if (this.batteryLevel < 5) {
      iconName = "battery-empty";
      colorName = "wa-danger";
    } else if (this.batteryLevel < 30) {
      iconName = "battery-quarter";
      colorName = "wa-warning";
    } else if (this.batteryLevel < 55) {
      iconName = "battery-half";
    } else if (this.batteryLevel < 80) {
      iconName = "battery-three-quarters";
      colorName = "wa-warning";
    } else {
      iconName = "battery-full";
      colorName = "wa-success";
    }

    const greenIfCharging = true;
    if (greenIfCharging) {
      if (this.isCharging) {
        classes["wa-success"] = true;
      }
    } else {
      classes[colorName] = true;
    }

    return this._renderLabelWrapper(
      html`<wa-icon name=${iconName} class=${classMap(classes)}></wa-icon>
        <div class=${classMap(classes)}>${this.batteryLevel}%</div>
        ${!greenIfCharging && this.isCharging
          ? html`<wa-icon name="bolt" class=${classMap(classes)}></wa-icon>`
          : nothing} `,
    );
  }

  /** @type {ConnectionStatus} */
  get _connectionStatus() {
    return this.connectionStatus ?? "notConnected";
  }
  toggleConnection() {
    // console.log("toggleConnection");
    if (this._device) {
      this._device.toggleConnection();
    } else {
      this._discoveredDevice.connect();
    }
  }

  onConnectionSelect(event) {
    const { item } = event.detail;
    const connectionType = item.value;
    console.log("onConnectionSelect", item, { connectionType });

    if (this._device) {
      if (this._device.connectionType == "client") {
        this._device.connect({ type: "client", subType: connectionType });
      } else {
        this._device.connect({
          type: connectionType,
          ipAddress: this.ipAddress,
        });
      }
    } else {
      this._discoveredDevice.connect(connectionType);
    }
  }
  buttonSize = "s";
  renderConnection() {
    const size = this.buttonSize;
    const variant = "brand";
    const disconnectVariant = "danger";
    switch (this._connectionStatus) {
      case "notConnected":
        const connectButton = html`<wa-button
          @click=${this.toggleConnection}
          size=${size}
          variant=${variant}
          >Connect</wa-button
        >`;
        if (this.ipAddress) {
          return html`
            <wa-button-group label="Connect" size=${size}>
              ${connectButton}
              <wa-dropdown
                placement="bottom-end"
                size=${size}
                @wa-select=${this.onConnectionSelect}
              >
                <wa-button slot="trigger" variant=${variant} size=${size}>
                  <wa-icon
                    name="chevron-down"
                    label="Connection options"
                  ></wa-icon>
                </wa-button>

                <wa-dropdown-item value="bluetooth">
                  <wa-icon name="bluetooth" family="brands"></wa-icon>
                  Bluetooth
                </wa-dropdown-item>

                ${!this.isClient
                  ? html`<wa-dropdown-item value="webSocket">
                      <wa-icon name="wifi"></wa-icon>
                      WebSocket
                    </wa-dropdown-item>`
                  : nothing}
                ${this.isClient
                  ? html`<wa-dropdown-item value="udp">
                      <wa-icon name="wifi"></wa-icon>
                      UDP
                    </wa-dropdown-item>`
                  : nothing}
              </wa-dropdown>
            </wa-button-group>
          `;
        } else {
          return connectButton;
        }
        break;
      case "connecting":
        return html`<wa-animation
          name="pulse"
          easing="ease-in-out"
          duration="2000"
          play
          ><wa-button
            @click=${this.toggleConnection}
            size=${size}
            variant=${variant}
          >
            <wa-spinner slot="start"></wa-spinner>
            Connecting
          </wa-button>
        </wa-animation>`;
        break;
      case "connected":
        return html`<wa-button
          @click=${this.toggleConnection}
          size=${size}
          variant=${disconnectVariant}
          >Disconnect</wa-button
        >`;
        break;
      case "disconnecting":
        return html`<wa-animation
          name="pulse"
          easing="ease-in-out"
          duration="2000"
          play
          ><wa-button
            @click=${this.toggleConnection}
            size=${size}
            variant=${disconnectVariant}
          >
            <wa-spinner slot="start"></wa-spinner>
            Disconnecting
          </wa-button>
        </wa-animation>`;
        break;
    }
  }
  renderSelect() {
    if (this._connectionStatus != "connected") {
      return nothing;
    }
    const size = this.buttonSize;
    return html`<wa-button size=${size}>Select</wa-button>`;
  }

  getClient() {
    if (this._discoveredDevice) {
      if (this._discoveredDevice.scanner.isClient) {
        return this._discoveredDevice.scanner;
      }
    } else {
      if (this._device.connectionManager?.type == "client") {
        return this._device.connectionManager.client;
      }
    }
  }

  renderConnectionTypeIcon() {
    const client = this.getClient();
    if (client) {
      if (this.isDeviceConnected) {
        switch (client.type) {
          case "webSocket":
            return html`<wa-icon name="globe"></wa-icon>`;
            break;
          case "window":
            return html`<wa-icon name="window-maximize"></wa-icon>`;
            break;
        }
      } else {
        return html`<wa-icon name="bluetooth" family="brands"></wa-icon>`;
      }
    } else if (this.isDeviceConnected) {
      switch (this._device.connectionType) {
        case "bluetooth":
          return html`<wa-icon name="bluetooth" family="brands"></wa-icon>`;
          break;
        case "webSocket":
          return html`<wa-icon name="wifi"></wa-icon>`;
          break;
        case "client":
          return html`<wa-icon name="globe"></wa-icon>`;
        case "none":
          return nothing;
          break;
      }
    } else {
      return html`<wa-icon name="bluetooth" family="brands"></wa-icon>`;
    }
  }

  render() {
    return html`<wa-card>
      <div class="wa-stack wa-gap-2xs">
        <div class="wa-cluster wa-gap-2xs wa-flex-nowrap wa-heading-m">
          ${this.renderConnectionTypeIcon()}
          <div class="wa-text-truncate">${this.name}</div>
        </div>
        <div class="wa-cluster wa-gap-2xs wa-flex-nowrap wa-body-m">
          ${this.renderDeviceTypeIcon()}
          <div>${this.deviceTypeLabel}</div>
        </div>
        <wa-divider></wa-divider>
        <div class="wa-cluster wa-gap-xs wa-flex-nowrap">
          ${this.renderConnection()} ${this.renderSelect()}
        </div>
        <div class="wa-cluster wa-gap-m bw-row-gap-normal">
          ${this.renderClientIpAddress()} ${this.renderIpAddress()}
          ${this.renderBattery()} ${this.renderRssi()}
          ${this.includeRssiInterval ? this.renderRssiInterval() : nothing}
        </div>
      </div>
    </wa-card>`;
  }
}

customElements.define("bw-device-card", DeviceCard);
