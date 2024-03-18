import BS from "../../build/brilliantsole.module.js";
window.BS = BS;
console.log({ BS });
//BS.setAllConsoleLevelFlags({ log: true });

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
    if (client.isScanning) {
        client.stopScan();
    } else {
        client.startScan();
    }
});
client.addEventListener("isScanningAvailable", () => {
    toggleScanButton.disabled = !client.isScanningAvailable;
});
client.addEventListener("isScanning", () => {
    toggleScanButton.innerText = client.isScanning ? "stop scanning" : "scan";
});

// DISCOVERED PERIPHERALS

/** @typedef {import("../../build/brilliantsole.module.js").DiscoveredPeripheral} DiscoveredPeripheral */

/** @type {HTMLTemplateElement} */
const discoveredPeripheralTemplate = document.getElementById("discoveredPeripheralTemplate");
const discoveredPeripheralsContainer = document.getElementById("discoveredPeripherals");
/** @type {Object.<string, HTMLElement>} */
let discoveredPeripheralContainers = {};

client.addEventListener("discoveredPeripheral", (event) => {
    /** @type {DiscoveredPeripheral} */
    const discoveredPeripheral = event.message.discoveredPeripheral;
    if (!discoveredPeripheral.name) {
        return;
    }

    let discoveredPeripheralContainer = discoveredPeripheralContainers[discoveredPeripheral.id];
    if (!discoveredPeripheralContainer) {
        discoveredPeripheralContainer = discoveredPeripheralTemplate.content
            .cloneNode(true)
            .querySelector(".discoveredPeripheral");
        discoveredPeripheralContainer.dataset.discoveredPeripheralId = discoveredPeripheral.id;
        discoveredPeripheralContainers[discoveredPeripheral.id] = discoveredPeripheralContainer;
        discoveredPeripheralsContainer.appendChild(discoveredPeripheralContainer);
    }

    updateDiscoveredPeripheralContainer(discoveredPeripheralContainer, discoveredPeripheral);
});
function clearDiscoveredPeripherals() {
    discoveredPeripheralsContainer.innerHTML = "";
    discoveredPeripheralContainers = {};
}
client.addEventListener("not connected", () => {
    clearDiscoveredPeripherals();
});
client.addEventListener("isScanning", () => {
    if (client.isScanning) {
        clearDiscoveredPeripherals();
    }
});

client.addEventListener("expiredDiscoveredPeripheral", (event) => {
    /** @type {DiscoveredPeripheral} */
    const discoveredPeripheral = event.message.discoveredPeripheral;
    if (!discoveredPeripheral.name) {
        return;
    }

    let discoveredPeripheralContainer = discoveredPeripheralContainers[discoveredPeripheral.id];
    if (discoveredPeripheralContainer) {
        discoveredPeripheralContainer.remove();
        delete discoveredPeripheralContainers[discoveredPeripheral.id];
    } else {
        console.warn(`no discoveredPeripheral container found with id "${discoveredPeripheral.id}"`);
    }
});

/**
 * @param {HTMLElement} discoveredPeripheralContainer
 * @param {DiscoveredPeripheral} discoveredPeripheral
 */
function updateDiscoveredPeripheralContainer(discoveredPeripheralContainer, discoveredPeripheral) {
    discoveredPeripheralContainer.querySelector(".name").innerText = discoveredPeripheral.name;
    discoveredPeripheralContainer.querySelector(".rssi").innerText = discoveredPeripheral.rssi;
    discoveredPeripheralContainer.querySelector(".deviceType").innerText = discoveredPeripheral.deviceType;
}
