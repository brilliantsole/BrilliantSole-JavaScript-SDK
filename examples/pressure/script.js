import * as BS from "../../build/brilliantsole.module.js";
window.BS = BS;
console.log({ BS });
//BS.setAllConsoleLevelFlags({ log: true });

// GET DEVICES

/** @type {HTMLTemplateElement} */
const availableDeviceTemplate = document.getElementById("availableDeviceTemplate");
const availableDevicesContainer = document.getElementById("availableDevices");
/** @param {BS.Device[]} availableDevices */
function onAvailableDevices(availableDevices) {
  availableDevicesContainer.innerHTML = "";
  if (availableDevices.length == 0) {
    availableDevicesContainer.innerText = "no devices available";
  } else {
    availableDevices.forEach((availableDevice) => {
      let availableDeviceContainer = availableDeviceTemplate.content.cloneNode(true).querySelector(".availableDevice");
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
          case "notConnected":
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
  const availableDevices = await BS.DeviceManager.GetDevices();
  if (!availableDevices) {
    return;
  }
  onAvailableDevices(availableDevices);
}

BS.DeviceManager.AddEventListener("availableDevices", (event) => {
  const { availableDevices } = event.message;
  onAvailableDevices(availableDevices);
});
getDevices();

// ADD DEVICE

/** @type {HTMLButtonElement} */
const addDeviceButton = document.getElementById("addDevice");
addDeviceButton.addEventListener("click", () => {
  BS.Device.Connect();
});

const devicePair = BS.DevicePair.shared;
devicePair.addEventListener("isConnected", () => {
  addDeviceButton.disabled = devicePair.isConnected;
});

// PRESSURE VIZUALIZATION

const insolesContainer = document.getElementById("insoles");
/** @type {HTMLTemplateElement} */
const insoleTemplate = document.getElementById("insoleTemplate");

/** @type {Object.<string, HTMLElement>} */
const insoleContainers = {};
/** @type {Object.<string, HTMLButtonElement>} */
const toggleConnectionButtons = {};
/** @type {Object.<string, HTMLButtonElement>} */
const togglePressureDataButtons = {};
/** @type {Object.<string, HTMLElement[]>} */
const pressureSensorElementsContainers = {};

devicePair.sides.forEach((side) => {
  /** @type {HTMLElement} */
  const insoleContainer = insoleTemplate.content.cloneNode(true).querySelector(".insole");
  insoleContainer.classList.add(side);
  insolesContainer.appendChild(insoleContainer);

  insoleContainers[side] = insoleContainer;

  /** @type {HTMLButtonElement} */
  const toggleConnectionButton = insoleContainer.querySelector(".toggleConnection");
  toggleConnectionButton.addEventListener("click", () => {
    devicePair[side].toggleConnection();
  });
  toggleConnectionButtons[side] = toggleConnectionButton;

  /** @type {HTMLButtonElement} */
  const togglePressureDataButton = insoleContainer.querySelector(".togglePressureData");
  togglePressureDataButton.addEventListener("click", () => {
    const isPressureDataEnabled = devicePair[side].sensorConfiguration.pressure > 0;
    if (isPressureDataEnabled) {
      devicePair[side].setSensorConfiguration({ pressure: 0 });
      togglePressureDataButton.innerText = "disabling pressure data...";
    } else {
      devicePair[side].setSensorConfiguration({ pressure: 20 });
      togglePressureDataButton.innerText = "enabling pressure data...";
    }
    togglePressureDataButton.disabled = true;
  });
  togglePressureDataButtons[side] = togglePressureDataButton;

  /** @type {HTMLElement[]} */
  const pressureSensorElements = Array.from(insoleContainer.querySelectorAll("[data-pressure]"));
  pressureSensorElementsContainers[side] = pressureSensorElements;
});

devicePair.addEventListener("deviceIsConnected", (event) => {
  const { device } = event.message;

  const toggleConnectionButton = toggleConnectionButtons[device.insoleSide];
  if (device.isConnected) {
    toggleConnectionButton.disabled = false;
  }
  toggleConnectionButton.innerText = device.isConnected ? "disconnect" : "reconnect";

  togglePressureDataButtons[device.insoleSide].disabled = !device.isConnected;
});

devicePair.addEventListener("deviceConnectionStatus", (event) => {
  const { device } = event.message;

  const toggleConnectionButton = toggleConnectionButtons[device.insoleSide];

  switch (device.connectionStatus) {
    case "connected":
    case "notConnected":
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

devicePair.addEventListener("deviceGetSensorConfiguration", (event) => {
  const { device } = event.message;

  const togglePressureDataButton = togglePressureDataButtons[device.insoleSide];
  const isPressureDataEnabled = device.sensorConfiguration.pressure > 0;
  if (isPressureDataEnabled) {
    togglePressureDataButton.innerText = "disable pressure data";
  } else {
    togglePressureDataButton.innerText = "enable pressure data";
  }
  togglePressureDataButton.disabled = false;
});

devicePair.addEventListener("devicePressure", (event) => {
  const { pressure, side } = event.message;

  pressure.sensors.forEach((sensor, index) => {
    pressureSensorElementsContainers[side][index].style.opacity = sensor.normalizedValue;
  });
});
