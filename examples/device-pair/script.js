import BS from "../../build/brilliantsole.module.js";
window.BS = BS;
console.log({ BS });
//BS.setAllConsoleLevelFlags({ log: true });

/** @typedef {import("../../build/brilliantsole.module.js").Device} Device */

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
            let availableDeviceContainer = availableDeviceTemplate.content
                .cloneNode(true)
                .querySelector(".availableDevice");
            availableDeviceContainer.querySelector(".name").innerText = availableDevice.name;
            availableDeviceContainer.querySelector(".type").innerText = availableDevice.type;

            /** @type {HTMLButtonElement} */
            const toggleConnectionButton = availableDeviceContainer.querySelector(".toggleConnection");
            toggleConnectionButton.addEventListener("click", () => {
                availableDevice.toggleConnection();
            });
            const onConnectionStatusUpdate = () => {
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
            };
            availableDevice.addEventListener("connectionStatus", () => onConnectionStatusUpdate());
            onConnectionStatusUpdate();
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

// PRESSURE

let isPressureDataEnabled = false;

/** @type {HTMLButtonElement} */
const togglePressureDataButton = document.getElementById("togglePressureData");
devicePair.addEventListener("isConnected", () => {
    togglePressureDataButton.disabled = !devicePair.isConnected;
});
togglePressureDataButton.addEventListener("click", () => {
    isPressureDataEnabled = !isPressureDataEnabled;
    togglePressureDataButton.innerText = isPressureDataEnabled ? "disable pressure data" : "enable pressure data";
    devicePair.setSensorConfiguration({ pressure: isPressureDataEnabled ? 20 : 0 });
});

/** @type {HTMLButtonElement} */
const resetPressureRangeButton = document.getElementById("resetPressureRange");
devicePair.addEventListener("isConnected", () => {
    resetPressureRangeButton.disabled = !devicePair.isConnected;
});
resetPressureRangeButton.addEventListener("click", () => {
    devicePair.resetPressureRange();
});

// DEVICES

const devicesContainer = document.getElementById("devices");
/** @type {HTMLTemplateElement} */
const deviceTemplate = document.getElementById("deviceTemplate");

devicePair.sides.forEach((side) => {
    /** @type {HTMLElement} */
    const deviceContainer = deviceTemplate.content.cloneNode(true).querySelector(".device");
    deviceContainer.classList.add(side);
    devicesContainer.appendChild(deviceContainer);

    deviceContainer.querySelector(".side").innerText = side;

    /** @type {HTMLButtonElement} */
    const toggleConnectionButton = deviceContainer.querySelector(".toggleConnection");
    toggleConnectionButton.addEventListener("click", () => {
        devicePair[side].toggleConnection();
    });

    devicePair.addEventListener("deviceIsConnected", (event) => {
        /** @type {Device} */
        const device = event.message.device;
        if (device.insoleSide != side) {
            return;
        }

        if (device.isConnected) {
            toggleConnectionButton.disabled = false;
        }
        toggleConnectionButton.innerText = device.isConnected ? "disconnect" : "reconnect";
    });

    devicePair.addEventListener("deviceConnectionStatus", (event) => {
        /** @type {Device} */
        const device = event.message.device;
        if (device.insoleSide != side) {
            return;
        }

        switch (device.connectionStatus) {
            case "connected":
            case "not connected":
                toggleConnectionButton.disabled = false;
                toggleConnectionButton.innerText = device.isConnected ? "disconnect" : "reconnect";
                break;
            case "connecting":
            case "disconnecting":
                toggleConnectionButton.disabled = true;
                toggleConnectionButton.innerText = device.connectionStatus;
                break;
        }
    });

    /** @type {HTMLPreElement} */
    const pressurePre = deviceContainer.querySelector(".pressure");
    devicePair.addEventListener("devicePressure", (event) => {
        /** @type {Device} */
        const device = event.message.device;
        if (device.insoleSide != side) {
            return;
        }

        /** @type {import("../../build/brilliantsole.module.js").PressureData} */
        const pressure = event.message.pressure;

        pressurePre.textContent = JSON.stringify(
            {
                center: pressure.normalizedCenter,
                sum: pressure.normalizedSum,
            },
            (key, value) => value?.toFixed?.(3) || value,
            2
        );
    });
});

// DEVICE PAIR

const devicePairContainer = document.getElementById("devicePair");
/** @type {HTMLPreElement} */
const devicePairPressurePre = devicePairContainer.querySelector(".pressure");

devicePair.addEventListener("pressure", (event) => {
    /** @type {import("../../build/brilliantsole.module.js").DevicePairPressureData} */
    const pressure = event.message.pressure;

    devicePairPressurePre.textContent = JSON.stringify(
        {
            center: pressure.normalizedCenter,
            sum: pressure.normalizedSum,
        },
        (key, value) => value?.toFixed?.(3) || value,
        2
    );
});