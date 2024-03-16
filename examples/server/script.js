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
        // FILL
    } else {
        // FILL
    }
});
client.addEventListener("isScanningAvailable", () => {
    toggleScanButton.disabled = !client.isScanningAvailable;
});
client.addEventListener("isScanning", () => {
    toggleScanButton.innerText = client.isScanning ? "stop scanning" : "scan";
});
