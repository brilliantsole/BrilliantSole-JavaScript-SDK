import BS from "../../build/brilliantsole.module.js";
window.BS = BS;
console.log({ BS });
BS.setAllConsoleLevelFlags({ log: false });

/** @typedef {import("../../build/brilliantsole.module.js").Device} Device */

// GET DEVICES

/** @type {HTMLButtonElement} */
const getDevicesButton = document.getElementById("getDevices");
getDevicesButton.disabled = !BS.Device.CanGetDevices;
/** @type {HTMLTemplateElement} */
const availableDeviceTemplate = document.getElementById("availableDeviceTemplate");
const availableDevicesContainer = document.getElementById("availableDevices");
/** @type {Object.<string, HTMLElement>} */
const availableDeviceContainers = {};
getDevicesButton.addEventListener("click", () => {
    getDevices();
});

async function getDevices() {
    const availableDevices = await BS.Device.GetDevices();
    if (!availableDevices) {
        return;
    }
    onAvailableDevices(availableDevices);
}

getDevices();

/** @param {Device[]} availableDevices */
function onAvailableDevices(availableDevices) {
    availableDevicesContainer.innerHTML = "";
    if (availableDevices.length == 0) {
        availableDevicesContainer.innerText = "no devices available";
    } else {
        availableDevices.forEach((availableDevice) => {
            let availableDeviceContainer = availableDeviceContainers[availableDevice.connectionManager.device.id];
            if (!availableDeviceContainer) {
                availableDeviceContainer = availableDeviceTemplate.content
                    .cloneNode(true)
                    .querySelector(".availableDevice");
                availableDeviceContainer.querySelector(".name").innerText = availableDevice.name;
                availableDeviceContainer.querySelector(".type").innerText = availableDevice.type;

                /** @type {HTMLButtonElement} */
                const toggleConnectionButton = availableDeviceContainer.querySelector(".toggleConnection");
                toggleConnectionButton.addEventListener("click", () => {
                    availableDevice.toggleConnection();
                });

                availableDevice.addEventListener("connectionStatus", () => {
                    switch (availableDevice.connectionStatus) {
                        case "connected":
                        case "not connected":
                            toggleConnectionButton.disabled = false;
                            toggleConnectionButton.innerText = availableDevice.isConnected ? "disconnect" : "connect";
                            break;
                        case "connecting":
                        case "disconnecting":
                            toggleConnectionButton.disabled = true;
                            toggleConnectionButton.innerText = availableDevice.connectionStatus;
                            break;
                    }
                });

                availableDeviceContainers[availableDevice.connectionManager.device.id] = availableDeviceContainer;
            }
            availableDevicesContainer.appendChild(availableDeviceContainer);
        });
    }
}

BS.Device.AddEventListener("availableDevices", (event) => {
    /** @type {Device[]} */
    const devices = event.message.devices;
    onAvailableDevices(devices);
});

// ADD DEVICE

/** @type {HTMLButtonElement} */
const addDeviceButton = document.getElementById("addDevice");
addDeviceButton.addEventListener("click", () => {
    const device = new BS.Device();
    device.connect();
});

// CONNECTED DEVICES

const connectedDevicesContainer = document.getElementById("connectedDevices");
/** @type {HTMLTemplateElement} */
const connectedDeviceTemplate = document.getElementById("connectedDeviceTemplate");

BS.Device.AddEventListener("deviceConnected", (event) => {
    /** @type {Device} */
    const device = event.message.device;
    console.log("deviceConnected", device);
    const connectedDeviceContainer = connectedDeviceTemplate.content.cloneNode(true).querySelector(".connectedDevice");
    connectedDeviceContainer.querySelector(".name").innerText = device.name;
    connectedDeviceContainer.querySelector(".type").innerText = device.type;

    /** @type {HTMLButtonElement} */
    const disconnectButton = connectedDeviceContainer.querySelector(".disconnect");
    disconnectButton.addEventListener("click", () => {
        disconnectButton.innerText = "disconnecting...";
        disconnectButton.disabled = true;
        device.disconnect();
    });
    device.addEventListener("not connected", () => {
        connectedDeviceContainer.remove();
    });

    /** @type {HTMLPreElement} */
    const sensorConfigurationPre = connectedDeviceContainer.querySelector("pre.sensorConfiguration");
    const updateSensorConfigurationPre = () => {
        sensorConfigurationPre.textContent = JSON.stringify(device.sensorConfiguration, null, 2);
    };
    device.addEventListener("getSensorConfiguration", () => {
        updateSensorConfigurationPre();
    });
    updateSensorConfigurationPre();

    device.addEventListener("sensorData", (event) => {
        console.log(event);
        const { sensorType, timestamp } = event.message;
        const { [sensorType]: data } = event.message;
        console.log({ name: device.name, sensorType, timestamp, data });
    });

    connectedDevicesContainer.appendChild(connectedDeviceContainer);
});

// SENSOR CONFIGURATION

/** @type {import("../../build/brilliantsole.module.js").SensorConfiguration} */
const sensorConfiguration = {};
const sensorConfigurationContainer = document.getElementById("sensorConfiguration");
/** @type {HTMLTemplateElement} */
const sensorTypeConfigurationTemplate = document.getElementById("sensorTypeConfigurationTemplate");
BS.Device.SensorTypes.forEach((sensorType) => {
    sensorConfiguration[sensorType] = 0;

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
        sensorConfiguration[sensorType] = Number(sensorRateInput.value);
        console.log({ sensorConfiguration });
    });

    sensorConfigurationContainer.appendChild(sensorTypeConfigurationContainer);
    sensorTypeConfigurationContainer.dataset.sensorType = sensorType;
});

/** @type {HTMLInputElement} */
const toggleSensorDataCheckbox = document.getElementById("toggleSensorData");
toggleSensorDataCheckbox.addEventListener("input", () => {
    BS.Device.ConnectedDevices.forEach((device) => {
        if (toggleSensorDataCheckbox.checked) {
            console.log(device, sensorConfiguration);
            device.setSensorConfiguration(sensorConfiguration);
        } else {
            console.log("clear", device);
            device.clearSensorConfiguration();
        }
    });
});
