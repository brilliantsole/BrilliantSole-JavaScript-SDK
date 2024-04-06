import BS from "../../build/brilliantsole.module.js";
window.BS = BS;
console.log({ BS });
//BS.setAllConsoleLevelFlags({ log: true });

const client = new BS.WebSocketClient();
console.log({ client });

window.client = client;

/** @typedef {import("../../build/brilliantsole.module.js").Device} Device */

// SEARCH PARAMS

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
client.addEventListener("isConnected", () => {
    if (client.isConnected) {
        setUrlParam("webSocketUrl", client.webSocket.url);
        webSocketUrlInput.value = client.webSocket.url;
    } else {
        setUrlParam("webSocketUrl");
    }
});

// CONNECTION

/** @type {HTMLInputElement} */
const webSocketUrlInput = document.getElementById("webSocketUrl");
webSocketUrlInput.value = url.searchParams.get("webSocketUrl") || "";
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

// DISCOVERED DEVICES

/** @typedef {import("../../build/brilliantsole.module.js").DiscoveredDevice} DiscoveredDevice */

/** @type {HTMLTemplateElement} */
const discoveredDeviceTemplate = document.getElementById("discoveredDeviceTemplate");
const discoveredDevicesContainer = document.getElementById("discoveredDevices");
/** @type {Object.<string, HTMLElement>} */
let discoveredDeviceContainers = {};

client.addEventListener("discoveredDevice", (event) => {
    /** @type {DiscoveredDevice} */
    const discoveredDevice = event.message.discoveredDevice;

    let discoveredDeviceContainer = discoveredDeviceContainers[discoveredDevice.id];
    if (!discoveredDeviceContainer) {
        discoveredDeviceContainer = discoveredDeviceTemplate.content.cloneNode(true).querySelector(".discoveredDevice");

        /** @type {HTMLButtonElement} */
        const toggleConnectionButton = discoveredDeviceContainer.querySelector(".toggleConnection");
        toggleConnectionButton.addEventListener("click", () => {
            let device = client.devices[discoveredDevice.id];
            if (device) {
                device.toggleConnection();
            } else {
                device = client.connectToDevice(discoveredDevice.id);
                onDevice(device);
            }
        });

        /** @param {Device} device */
        const onDevice = (device) => {
            device.addEventListener("connectionStatus", () => {
                updateToggleConnectionButton(device);
            });
            updateToggleConnectionButton(device);
        };

        discoveredDeviceContainer._onDevice = onDevice;

        /** @param {Device} device */
        const updateToggleConnectionButton = (device) => {
            console.log({ deviceConnectionStatus: device.connectionStatus });
            switch (device.connectionStatus) {
                case "connected":
                case "not connected":
                    toggleConnectionButton.innerText = device.isConnected ? "disconnect" : "connect";
                    toggleConnectionButton.disabled = false;
                    break;
                case "connecting":
                case "disconnecting":
                    toggleConnectionButton.innerText = device.connectionStatus;
                    toggleConnectionButton.disabled = true;
                    break;
            }
        };

        discoveredDeviceContainers[discoveredDevice.id] = discoveredDeviceContainer;
        discoveredDevicesContainer.appendChild(discoveredDeviceContainer);
    }

    updateDiscoveredDeviceContainer(discoveredDevice);
});

/** @param {DiscoveredDevice} discoveredDevice */
function updateDiscoveredDeviceContainer(discoveredDevice) {
    const discoveredDeviceContainer = discoveredDeviceContainers[discoveredDevice.id];
    if (!discoveredDeviceContainer) {
        console.warn(`no discoveredDeviceContainer for device id ${discoveredDevice.id}`);
        return;
    }
    discoveredDeviceContainer.querySelector(".name").innerText = discoveredDevice.name;
    discoveredDeviceContainer.querySelector(".rssi").innerText = discoveredDevice.rssi;
    discoveredDeviceContainer.querySelector(".deviceType").innerText = discoveredDevice.deviceType;
}

/** @param {DiscoveredDevice} discoveredDevice */
function removeDiscoveredDeviceContainer(discoveredDevice) {
    const discoveredDeviceContainer = discoveredDeviceContainers[discoveredDevice.id];
    if (!discoveredDeviceContainer) {
        console.warn(`no discoveredDeviceContainer for device id ${discoveredDevice.id}`);
        return;
    }

    discoveredDeviceContainer.remove();
    delete discoveredDeviceContainers[discoveredDevice.id];
}

client.addEventListener("expiredDiscoveredDevice", (event) => {
    /** @type {DiscoveredDevice} */
    const discoveredDevice = event.message.discoveredDevice;
    removeDiscoveredDeviceContainer(discoveredDevice);
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

BS.Device.AddEventListener("deviceIsConnected", (event) => {
    /** @type {Device} */
    const device = event.message.device;
    console.log("deviceIsConnected", device);
    const discoveredDeviceContainer = discoveredDeviceContainers[device.id];
    if (!discoveredDeviceContainer) {
        return;
    }
    discoveredDeviceContainer._onDevice(device);
});

// AVAILABLE DEVICES

/** @type {HTMLTemplateElement} */
const availableDeviceTemplate = document.getElementById("availableDeviceTemplate");
const availableDevicesContainer = document.getElementById("availableDevices");
/** @type {Object.<string, HTMLElement>} */
let availableDeviceContainers = {};

BS.Device.AddEventListener("availableDevices", (event) => {
    /** @type {Device[]} */
    const availableDevices = event.message.devices;
    console.log({ availableDevices });

    availableDevices.forEach((device) => {
        if (device.connectionType != "webSocketClient" || !device.id) {
            return;
        }
        let availableDeviceContainer = availableDeviceContainers[device.id];
        if (!availableDeviceContainer) {
            availableDeviceContainer = availableDeviceTemplate.content
                .cloneNode(true)
                .querySelector(".availableDevice");
            availableDeviceContainers[device.id] = availableDeviceContainer;

            /** @type {HTMLPreElement} */
            const deviceInformationPre = availableDeviceContainer.querySelector(".deviceInformation");
            const setDeviceInformationPre = () =>
                (deviceInformationPre.textContent = JSON.stringify(device.deviceInformation, null, 2));
            setDeviceInformationPre();
            device.addEventListener("deviceInformation", () => setDeviceInformationPre());

            /** @type {HTMLSpanElement} */
            const batteryLevelSpan = availableDeviceContainer.querySelector(".batteryLevel");
            const setBatteryLevelSpan = () => (batteryLevelSpan.innerText = device.batteryLevel);
            setBatteryLevelSpan();
            device.addEventListener("batteryLevel", () => setBatteryLevelSpan());

            /** @type {HTMLSpanElement} */
            const nameSpan = availableDeviceContainer.querySelector(".name");
            const setNameSpan = () => (nameSpan.innerText = device.name);
            setNameSpan();
            device.addEventListener("getName", () => setNameSpan());

            /** @type {HTMLInputElement} */
            const setNameInput = availableDeviceContainer.querySelector(".setNameInput");
            setNameInput.minLength = BS.Device.MinNameLength;
            setNameInput.maxLength = BS.Device.MaxNameLength;
            setNameInput.disabled = !device.isConnected;

            /** @type {HTMLButtonElement} */
            const setNameButton = availableDeviceContainer.querySelector(".setNameButton");
            setNameButton.disabled = !device.isConnected;

            device.addEventListener("isConnected", () => {
                setNameInput.disabled = !device.isConnected;
            });
            device.addEventListener("not connected", () => {
                setNameInput.value = "";
            });

            setNameInput.addEventListener("input", () => {
                setNameButton.disabled = setNameInput.value.length < device.minNameLength;
            });

            setNameButton.addEventListener("click", () => {
                console.log(`setting name to ${setNameInput.value}`);
                device.setName(setNameInput.value);
                setNameInput.value = "";
                setNameButton.disabled = true;
            });

            /** @type {HTMLSpanElement} */
            const deviceTypeSpan = availableDeviceContainer.querySelector(".deviceType");
            const setDeviceTypeSpan = () => (deviceTypeSpan.innerText = device.type);
            setDeviceTypeSpan();
            device.addEventListener("getType", () => setDeviceTypeSpan());

            /** @type {HTMLButtonElement} */
            const setTypeButton = availableDeviceContainer.querySelector(".setTypeButton");

            /** @type {HTMLSelectElement} */
            const setTypeSelect = availableDeviceContainer.querySelector(".setTypeSelect");
            /** @type {HTMLOptGroupElement} */
            const setTypeSelectOptgroup = setTypeSelect.querySelector("optgroup");
            BS.Device.Types.forEach((type) => {
                setTypeSelectOptgroup.appendChild(new Option(type));
            });

            device.addEventListener("isConnected", () => {
                setTypeSelect.disabled = !device.isConnected;
            });
            setTypeSelect.disabled = !device.isConnected;

            device.addEventListener("getType", () => {
                setTypeSelect.value = device.type;
            });

            setTypeSelect.addEventListener("input", () => {
                setTypeButton.disabled = setTypeSelect.value == device.type;
            });
            setTypeSelect.value = device.type;

            setTypeButton.addEventListener("click", () => {
                device.setType(setTypeSelect.value);
                setTypeButton.disabled = true;
            });

            /** @type {HTMLPreElement} */
            const sensorConfigurationPre = availableDeviceContainer.querySelector(".sensorConfiguration");
            const setSensorConfigurationPre = () =>
                (sensorConfigurationPre.textContent = JSON.stringify(device.sensorConfiguration, null, 2));
            setSensorConfigurationPre();
            device.addEventListener("getSensorConfiguration", () => setSensorConfigurationPre());

            /** @type {HTMLTemplateElement} */
            const sensorTypeConfigurationTemplate = availableDeviceContainer.querySelector(
                ".sensorTypeConfigurationTemplate"
            );
            device.sensorTypes.forEach((sensorType) => {
                const sensorTypeConfigurationContainer = sensorTypeConfigurationTemplate.content
                    .cloneNode(true)
                    .querySelector(".sensorTypeConfiguration");
                sensorTypeConfigurationContainer.querySelector(".sensorType").innerText = sensorType;

                /** @type {HTMLInputElement} */
                const sensorRateInput = sensorTypeConfigurationContainer.querySelector(".sensorRate");
                sensorRateInput.value = 0;
                sensorRateInput.max = BS.Device.MaxSensorRate;
                sensorRateInput.step = BS.Device.SensorRateStep;
                sensorRateInput.addEventListener("input", () => {
                    const sensorRate = Number(sensorRateInput.value);
                    console.log({ sensorType, sensorRate });
                    device.setSensorConfiguration({ [sensorType]: sensorRate });
                });
                sensorRateInput.disabled = !device.isConnected;

                sensorTypeConfigurationTemplate.parentElement.insertBefore(
                    sensorTypeConfigurationContainer,
                    sensorTypeConfigurationTemplate
                );
                sensorTypeConfigurationContainer.dataset.sensorType = sensorType;
            });

            device.addEventListener("isConnected", () => {
                availableDeviceContainer
                    .querySelectorAll("input")
                    .forEach((input) => (input.disabled = !device.isConnected));
            });

            device.addEventListener("getSensorConfiguration", () => {
                for (const sensorType in device.sensorConfiguration) {
                    availableDeviceContainer.querySelector(
                        `.sensorTypeConfiguration[data-sensor-type="${sensorType}"] input`
                    ).value = device.sensorConfiguration[sensorType];
                }
            });

            /** @type {HTMLPreElement} */
            const sensorDataPre = availableDeviceContainer.querySelector(".sensorData");
            const setSensorDataPre = (event) => (sensorDataPre.textContent = JSON.stringify(event.message, null, 2));
            device.addEventListener("sensorData", (event) => setSensorDataPre(event));

            /** @type {HTMLButtonElement} */
            const triggerVibrationButton = availableDeviceContainer.querySelector(".triggerVibration");
            triggerVibrationButton.addEventListener("click", () => {
                device.triggerVibration({
                    type: "waveformEffect",
                    waveformEffect: { segments: [{ effect: "doubleClick100" }] },
                });
            });
            device.addEventListener("isConnected", () => {
                triggerVibrationButton.disabled = !device.isConnected;
            });
            triggerVibrationButton.disabled = !device.isConnected;

            /** @type {HTMLButtonElement} */
            const toggleConnectionButton = availableDeviceContainer.querySelector(".toggleConnection");
            toggleConnectionButton.addEventListener("click", () => {
                device.toggleConnection();
            });
            const updateToggleConnectionButton = () => {
                switch (device.connectionStatus) {
                    case "connected":
                    case "not connected":
                        toggleConnectionButton.disabled = false;
                        toggleConnectionButton.innerText = device.isConnected ? "disconnect" : "connect";
                        break;
                    case "connecting":
                    case "disconnecting":
                        toggleConnectionButton.innerText = device.connectionStatus;
                        toggleConnectionButton.disabled = true;
                        break;
                }
            };
            updateToggleConnectionButton();
            device.addEventListener("connectionStatus", () => updateToggleConnectionButton());

            availableDevicesContainer.appendChild(availableDeviceContainer);
        }
    });
});
