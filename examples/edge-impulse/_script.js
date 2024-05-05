import BS from "../../build/brilliantsole.module.js";
//import BS.Device from "../../src/BS.Device.js";
window.BS = BS;
console.log(BS);

BS.setAllConsoleLevelFlags({ log: false });

// DEVICE

const device = new BS.Device();
console.log({ device });
window.device = device;

// GET DEVICES

/** @type {HTMLTemplateElement} */
const availableDeviceTemplate = document.getElementById("availableDeviceTemplate");
const availableDevicesContainer = document.getElementById("availableDevices");
/** @param {Device[]} availableDevices */
function onAvailableDevices(availableDevices) {
    availableDevicesContainer.innerHTML = "";
    if (availableDevices.length == 0) {
        availableDevicesContainer.innerText = "no devices available";
    } else {
        availableDevices.forEach((availableDevice) => {
            const availableDeviceContainer = availableDeviceTemplate.content
                .cloneNode(true)
                .querySelector(".availableDevice");
            availableDeviceContainer.querySelector(".name").innerText = availableDevice.name;
            availableDeviceContainer.querySelector(".type").innerText = availableDevice.type;

            /** @type {HTMLButtonElement} */
            const toggleConnectionButton = availableDeviceContainer.querySelector(".toggleConnection");
            toggleConnectionButton.addEventListener("click", () => {
                device.connectionManager = availableDevice.connectionManager;
                device.reconnect();
            });
            device.addEventListener("connectionStatus", () => {
                toggleConnectionButton.disabled = device.connectionStatus != "not connected";
            });
            toggleConnectionButton.disabled = device.connectionStatus != "not connected";

            availableDevicesContainer.appendChild(availableDeviceContainer);
        });
    }
}
async function getDevices() {
    const availableDevices = await BS.Device.GetDevices();
    if (!availableDevices) {
        return;
    }
    onAvailableDevices(availableDevices);
}

BS.Device.AddEventListener("availableDevices", (event) => {
    const devices = event.message.devices;
    onAvailableDevices(devices);
});
getDevices();

// CONNECTION

/** @type {HTMLButtonElement} */
const toggleConnectionButton = document.getElementById("toggleConnection");
toggleConnectionButton.addEventListener("click", () => {
    switch (device.connectionStatus) {
        case "not connected":
            device.connect();
            break;
        case "connected":
            device.disconnect();
            break;
    }
});

/** @type {HTMLButtonElement} */
const reconnectButton = document.getElementById("reconnect");
reconnectButton.addEventListener("click", () => {
    device.reconnect();
});
device.addEventListener("connectionStatus", () => {
    reconnectButton.disabled = !device.canReconnect;
});

device.addEventListener("connectionStatus", () => {
    switch (device.connectionStatus) {
        case "connected":
        case "not connected":
            toggleConnectionButton.disabled = false;
            toggleConnectionButton.innerText = device.isConnected ? "disconnect" : "connect";
            break;
        case "connecting":
        case "disconnecting":
            toggleConnectionButton.disabled = true;
            toggleConnectionButton.innerText = device.connectionStatus;
            break;
    }
});

/** @type {HTMLInputElement} */
const reconnectOnDisconnectionCheckbox = document.getElementById("reconnectOnDisconnection");
reconnectOnDisconnectionCheckbox.addEventListener("input", () => {
    device.reconnectOnDisconnection = reconnectOnDisconnectionCheckbox.checked;
});

// DEVICE INFORMATION

// FILL

// SEARCH PARAMS

const url = new URL(location);
console.log({ url });
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

// PROJECT ID

/** @type {string?} */
let projectId;

/** @type {HTMLInputElement} */
const projectIdInput = document.getElementById("projectId");
projectIdInput.addEventListener("input", (event) => {
    setProjectId(event.target.value);
    setSocketToken();
});
/** @param {string} newProjectId */
function setProjectId(newProjectId) {
    projectId = newProjectId;
    console.log({ projectId });
    window.dispatchEvent(new Event("projectId"));
    projectIdInput.value = projectId;
    setUrlParam("projectId", projectId);
}
window.addEventListener("loadConfig", () => {
    if (config.projectId) {
        projectIdInput.value = config.projectId;
    }
});
window.addEventListener("load", () => {
    if (url.searchParams.has("projectId")) {
        setProjectId(url.searchParams.get("projectId"));
    }
});

// KEYS

/** @type {string?} */
let hmacKey;

/** @type {HTMLInputElement} */
const hmacKeyInput = document.getElementById("hmacKey");
hmacKeyInput.addEventListener("input", (event) => {
    setHmacKey(event.target.value);
});
function setHmacKey(newHmacKey) {
    hmacKey = newHmacKey;
    hmacKeyInput.value = hmacKey;
    console.log({ hmacKey });
    window.dispatchEvent(new Event("hmacKey"));
    setUrlParam("hmacKey", hmacKey);
}
window.addEventListener("loadConfig", () => {
    if (config.hmacKey) {
        setHmacKey(config.hmacKey);
    }
});
window.addEventListener("load", () => {
    if (url.searchParams.has("hmacKey")) {
        setHmacKey(url.searchParams.get("hmacKey"));
    }
});

/** @type {string?} */
let apiKey;

const apiKeyInput = document.getElementById("apiKey");
apiKeyInput.addEventListener("input", (event) => {
    setApiKey(event.target.value);
    setSocketToken();
});
function setApiKey(newApiKey) {
    apiKey = newApiKey;
    apiKeyInput.value = apiKey;
    console.log({ apiKey });
    window.dispatchEvent(new Event("apiKey"));
    setUrlParam("apiKey", apiKey);
}
window.addEventListener("loadConfig", () => {
    if (config.apiKey) {
        setApiKey(config.apiKey);
    }
});
window.addEventListener("load", () => {
    if (url.searchParams.has("apiKey")) {
        setApiKey(url.searchParams.get("apiKey"));
    }
});

// SOCKET TOKEN

/**
 * @typedef SocketToken
 * @type {Object}
 * @property {string} socketToken
 * @property {string} expires
 */

/** @type {SocketToken?} */
let socketToken;

/** @type {HTMLInputElement} */
const socketTokenInput = document.getElementById("socketToken");
/** @type {HTMLInputElement} */
const socketTokenExpiresInput = document.getElementById("socketTokenExpires");

/** @param {SocketToken} socketToken */
function hasSocketTokenExpired(socketToken) {
    if (!socketToken) {
        return true;
    }
    return Date.now() > Number(new Date(socketToken.expires));
}

function setSocketToken(newSocketToken) {
    if (newSocketToken && hasSocketTokenExpired(newSocketToken)) {
        return;
    }
    socketToken = newSocketToken;
    console.log({ socketToken });
    window.dispatchEvent(new Event("socketToken"));
    socketTokenInput.value = socketToken ? socketToken.socketToken : "";
    socketTokenExpiresInput.value = socketToken ? new Date(socketToken.expires) : "";
}
window.addEventListener("loadConfig", () => {
    if (config.socketToken) {
        setSocketToken(config.socketToken);
    }
});

/** @type {HTMLButtonElement} */
const getSocketTokenButton = document.getElementById("getSocketToken");
getSocketTokenButton.addEventListener("click", async () => {
    getSocketTokenButton.disabled = true;
    getSocketTokenButton.innerText = "getting socket token...";
    await getSocketToken();
    getSocketTokenButton.innerText = "get socket token";
});

["projectId", "apiKey", "socketToken", "loadConfig"].forEach((eventType) => {
    window.addEventListener(eventType, () => {
        const enabled = projectId && apiKey && hasSocketTokenExpired(socketToken);
        getSocketTokenButton.disabled = !enabled;
    });
});

async function getSocketToken() {
    if (socketToken && !hasSocketTokenExpired(socketToken)) {
        return;
    }

    const options = {
        method: "GET",
        headers: {
            accept: "application/json",
            "x-api-key": apiKey,
        },
    };

    console.log({ apiKey, projectId });

    try {
        const response = await fetch(`https://studio.edgeimpulse.com/v1/api/${projectId}/socket-token`, options);
        const json = await response.json();
        console.log({ json });
        const { success, token } = json;
        if (!success) {
            console.log("unsuccessful getSocketToken");
            return;
        }

        setSocketToken(token);
    } catch (error) {
        console.error(error);
    }
}

// WEBSOCKET

/** @type {WebSocket?} */
let ws;
/** @type {(message: object)=>{}?} */
let sendMessage;
async function connectToWebSocketServer() {
    await getSocketToken();
    if (!socketToken) {
        console.log("no socketToken found");
        return;
    }

    ws?.close();

    /** @type {number?} */
    let intervalId;

    ws = new WebSocket(
        `wss://studio.edgeimpulse.com/socket.io/?token=${socketToken.socketToken}&EIO=3&transport=websocket`
    );
    sendMessage = (message) => {
        console.log("sending message", message);
        ws.send(JSON.stringify(message));
    };
    ws.addEventListener("open", () => {
        console.log("ws.open");
        window.dispatchEvent(new Event("ws.open"));
        sendMessage(helloMessage());
        intervalId = setInterval(() => {
            console.log("ping");
            ws.send("ping");
        }, 3000);
    });
    ws.addEventListener("close", () => {
        console.log("ws.close");
        window.dispatchEvent(new Event("ws.close"));
        clearInterval(intervalId);
        if (reconnectWebSocketOnDisconnection && !ws.dontReconnect) {
            window.setTimeout(() => {
                if (!reconnectWebSocketOnDisconnection) {
                    return;
                }
                connectToWebSocketServer();
            }, 2000);
        }
    });
    ws.addEventListener("error", (event) => {
        console.log("ws.error", event);
        window.dispatchEvent(new Event("ws.close"));
    });
    ws.addEventListener("message", async (event) => {
        console.log("ws.message", event.data);

        /** @type {object?} */
        let data;
        try {
            data = JSON.parse(event.data.replace(/^[0-9]+/, ""));
        } catch (error) {
            console.log("unable to parse message", event.data);
        }

        if (!data) {
            return;
        }

        console.log({ data });
    });
}

function helloMessage() {
    return {
        hello: {
            version: 3,
            apiKey: apiKey,
            deviceId: device.id,
            deviceType: "nrf52840",
            connection: "ip",
            sensors: device.sensorTypes.map((sensorType) => {
                return {
                    name: sensorType,
                    maxSampleLengthS: 1 * 60,
                    frequencies: [50.0],
                };
            }),
            supportsSnapshotStreaming: false,
        },
    };
}

/** @type {HTMLButtonElement} */
const toggleWebSocketConnectionButton = document.getElementById("toggleWebSocketConnection");
toggleWebSocketConnectionButton.addEventListener("click", () => {
    if (ws?.readyState == WebSocket.OPEN) {
        ws.dontReconnect = true;
        ws.close();
        toggleWebSocketConnectionButton.innerText = "disconnecting...";
        toggleWebSocketConnectionButton.disabled = true;
    } else {
        connectToWebSocketServer();
        toggleWebSocketConnectionButton.innerText = "connecting...";
    }
});

window.addEventListener("ws.open", () => {
    toggleWebSocketConnectionButton.innerText = "disconnect";
    toggleWebSocketConnectionButton.disabled = false;
});
window.addEventListener("ws.close", () => {
    toggleWebSocketConnectionButton.innerText = "connect";
    toggleWebSocketConnectionButton.disabled = false;
});

function updateToggleWebSocketConnectionButton() {
    const enabled = Boolean(socketToken) && device.isConnected;
    toggleWebSocketConnectionButton.disabled = !enabled;
}
["socketToken"].forEach((eventType) => {
    window.addEventListener(eventType, () => {
        updateToggleWebSocketConnectionButton();
    });
});
device.addEventListener("isConnected", () => {
    updateToggleWebSocketConnectionButton();
});

let reconnectWebSocketOnDisconnection = false;
/** @type {HTMLIFrameElement} */
const reconnectWebSocketOnDisconnectionInput = document.getElementById("reconnectWebSocketOnDisconnection");
reconnectWebSocketOnDisconnectionInput.addEventListener("input", (event) => {
    setReconnectWebSocketOnDisconnection(event.target.checked);
});
reconnectWebSocketOnDisconnectionInput.checked = reconnectWebSocketOnDisconnection;
/** @param {boolean} newReconnectWebSocketOnDisconnection */
function setReconnectWebSocketOnDisconnection(newReconnectWebSocketOnDisconnection) {
    reconnectWebSocketOnDisconnection = newReconnectWebSocketOnDisconnection;
    console.log({ reconnectWebSocketOnDisconnection });
    dispatchEvent(new Event("reconnectWebSocketOnDisconnection"));
}

// CONFIG

const configLocalStorageKey = "EdgeImpulse";

let config = {
    projectId,
    apiKey,
    hmacKey,
    socketToken,
};
console.log("config", config);
function loadConfigFromLocalStorage() {
    const configString = localStorage.getItem(configLocalStorageKey);
    if (!configString) {
        return;
    }
    const loadedConfig = JSON.parse(configString);
    console.log("loaded config", loadedConfig);
    Object.assign(config, loadedConfig);
    console.log("updated config", config);
    window.dispatchEvent(new Event("loadConfig"));
}
loadConfigFromLocalStorage();

function saveConfigToLocalStorage() {
    console.log("saving config", config);
    localStorage.setItem(configLocalStorageKey, JSON.stringify(config));
}

Object.keys(config).forEach((type) => {
    window.addEventListener(type, () => {
        config = {
            projectId,
            apiKey,
            hmacKey,
            socketToken,
        };
        saveConfigToLocalStorage();
    });
});
