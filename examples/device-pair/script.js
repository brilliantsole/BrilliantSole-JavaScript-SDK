import BS from "../../build/brilliantsole.module.js";
window.BS = BS;
console.log({ BS });
//BS.setAllConsoleLevelFlags({ log: true });

// GET DEVICES

/** @type {HTMLTemplateElement} */
const availableDeviceTemplate = document.getElementById("availableDeviceTemplate");
const availableDevicesContainer = document.getElementById("availableDevices");
/** @type {Object.<string, HTMLElement>} */
const availableDeviceContainers = {};
/** @param {Device[]} availableDevices */
function onAvailableDevices(availableDevices) {
    availableDevicesContainer.innerHTML = "";
    if (availableDevices.length == 0) {
        availableDevicesContainer.innerText = "no devices available";
    } else {
        availableDevices.forEach((availableDevice) => {
            let availableDeviceContainer = availableDeviceContainers[availableDevice.id];
            if (!availableDeviceContainer) {
                availableDeviceContainer = availableDeviceTemplate.content
                    .cloneNode(true)
                    .querySelector(".availableDevice");
                availableDeviceContainers[availableDevice.id] = availableDeviceContainer;
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
                            toggleConnectionButton.innerText = availableDevice.isConnected ? "disconnect" : "reconnect";
                            break;
                        case "connecting":
                        case "disconnecting":
                            toggleConnectionButton.disabled = true;
                            toggleConnectionButton.innerText = availableDevice.connectionStatus;
                            break;
                    }
                });
                toggleConnectionButton.disabled = availableDevice.connectionStatus != "not connected";
            }
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
const devicePair = BS.DevicePair.shared;

/** @type {HTMLButtonElement} */
const addDeviceButton = document.getElementById("addDevice");
devicePair.addEventListener("isConnected", () => {
    addDeviceButton.disabled = devicePair.isConnected;
});
addDeviceButton.addEventListener("click", () => {
    BS.Device.Connect();
});
