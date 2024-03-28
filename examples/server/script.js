import BS from "../../build/brilliantsole.module.js";
window.BS = BS;
console.log({ BS });
BS.setAllConsoleLevelFlags({ log: true });

const client = new BS.WebSocketClient();
console.log({ client });

window.client = client;

const url = new URL(location);
function setUrlParam(key, value) {
    if (history.pushState) {
        let searchParams = new URLSearchParams(window.location.search);
        if (value) {
            searchParams.set(key, value);
        } else {
            searchParams.delete(key);
        }
        let newUrl =
            window.location.protocol +
            "//" +
            window.location.host +
            window.location.pathname +
            "?" +
            searchParams.toString();
        window.history.pushState({ path: newUrl }, "", newUrl);
    }
}

// CONNECTION

/** @type {HTMLInputElement} */
const webSocketUrlInput = document.getElementById("webSocketUrl");
webSocketUrlInput.value = url.searchParams.get("webSocketUrl") || "";
client.addEventListener("isConnected", () => {
    if (client.isConnected) {
        setUrlParam("webSocketUrl", client.webSocket.url);
        webSocketUrlInput.value = client.webSocket.url;
    } else {
        setUrlParam("webSocketUrl");
    }
});
client.addEventListener("isConnected", () => {
    webSocketUrlInput.disabled = client.isConnected;
});

/** @type {HTMLButtonElement} */
const toggleConnectionButton = document.getElementById("toggleConnection");
toggleConnectionButton.addEventListener("click", () => {
    if (client.isConnected) {
        client.disconnect();
    } else {
        /** @type {string?} */
        let webSocketUrl;
        if (webSocketUrlInput.value.length > 0) {
            webSocketUrl = webSocketUrlInput.value;
        }
        client.connect(webSocketUrl);
    }
});
client.addEventListener("connectionStatus", () => {
    switch (client.connectionStatus) {
        case "connected":
        case "not connected":
            toggleConnectionButton.disabled = false;
            toggleConnectionButton.innerText = client.isConnected ? "disconnect" : "connect";
            break;
        case "connecting":
        case "disconnecting":
            toggleConnectionButton.innerText = client.connectionStatus;
            toggleConnectionButton.disabled = true;
            break;
        default:
            console.error(`uncaught connectionStatus "${client.connectionStatus}"`);
            break;
    }
});

// SCANNER

/** @type {HTMLInputElement} */
const isScanningAvailableCheckbox = document.getElementById("isScanningAvailable");
client.addEventListener("isScanningAvailable", () => {
    isScanningAvailableCheckbox.checked = client.isScanningAvailable;
});

/** @type {HTMLButtonElement} */
const toggleScanButton = document.getElementById("toggleScan");
toggleScanButton.addEventListener("click", () => {
    client.toggleScan();
});
client.addEventListener("isScanningAvailable", () => {
    toggleScanButton.disabled = !client.isScanningAvailable;
});
client.addEventListener("isScanning", () => {
    toggleScanButton.innerText = client.isScanning ? "stop scanning" : "scan";
});

// DISCOVERED PERIPHERALS

/** @typedef {import("../../build/brilliantsole.module.js").DiscoveredDevice} DiscoveredDevice */

/** @type {HTMLTemplateElement} */
const discoveredDeviceTemplate = document.getElementById("discoveredDeviceTemplate");
const discoveredDevicesContainer = document.getElementById("discoveredDevices");
/** @type {Object.<string, HTMLElement>} */
let discoveredDeviceContainers = {};

client.addEventListener("discoveredDevice", (event) => {
    /** @type {DiscoveredDevice} */
    const discoveredDevice = event.message.discoveredDevice;
    if (!discoveredDevice.name) {
        return;
    }

    let discoveredDeviceContainer = discoveredDeviceContainers[discoveredDevice.id];
    if (!discoveredDeviceContainer) {
        discoveredDeviceContainer = discoveredDeviceTemplate.content.cloneNode(true).querySelector(".discoveredDevice");

        /** @type {HTMLButtonElement} */
        const toggleConnectionButton = discoveredDeviceContainer.querySelector(".toggleConnection");
        toggleConnectionButton.addEventListener("click", () => {
            const device = client.devices[discoveredDevice.id];
            if (device) {
                device.toggleConnection();
            } else {
                client.connectToDevice(discoveredDevice.id);
            }
        });

        discoveredDeviceContainers[discoveredDevice.id] = discoveredDeviceContainer;
        discoveredDevicesContainer.appendChild(discoveredDeviceContainer);
    }

    updateDiscoveredDeviceContainer(discoveredDeviceContainer, discoveredDevice);
});
function clearDiscoveredDevices() {
    discoveredDevicesContainer.innerHTML = "";
    discoveredDeviceContainers = {};
}
client.addEventListener("not connected", () => {
    clearDiscoveredDevices();
});
client.addEventListener("isScanning", () => {
    if (client.isScanning) {
        clearDiscoveredDevices();
    }
});

client.addEventListener("expiredDiscoveredDevice", (event) => {
    /** @type {DiscoveredDevice} */
    const discoveredDevice = event.message.discoveredDevice;
    if (!discoveredDevice.name) {
        return;
    }

    let discoveredDeviceContainer = discoveredDeviceContainers[discoveredDevice.id];
    if (discoveredDeviceContainer) {
        discoveredDeviceContainer.remove();
        delete discoveredDeviceContainers[discoveredDevice.id];
    } else {
        console.warn(`no discoveredDevice container found with id "${discoveredDevice.id}"`);
    }
});

/**
 * @param {HTMLElement} discoveredDeviceContainer
 * @param {DiscoveredDevice} discoveredDevice
 */
function updateDiscoveredDeviceContainer(discoveredDeviceContainer, discoveredDevice) {
    discoveredDeviceContainer.querySelector(".name").innerText = discoveredDevice.name;
    discoveredDeviceContainer.querySelector(".rssi").innerText = discoveredDevice.rssi;
    discoveredDeviceContainer.querySelector(".deviceType").innerText = discoveredDevice.deviceType;
}
