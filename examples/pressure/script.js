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
/** @type {Object.<string, HTMLElement>} */
const centerOfPressureElementsContainers = {};
/** @type {Object.<string, HTMLElement>} */
const devicePairCenterOfPressureElementsContainers = {};

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

  centerOfPressureElementsContainers[side] = insoleContainer.querySelector(".center");
  devicePairCenterOfPressureElementsContainers[side] = insoleContainer.querySelector(".devicePairCenter");
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

  if (pressureVisualizationMode != "devicePairWeightedValue") {
    pressure.sensors.forEach((sensor, index) => {
      var value = 0;
      switch (pressureVisualizationMode) {
        case "normalizedValue":
          value = sensor.normalizedValue;
          break;
        case "scaledValue":
          value = sensor.scaledValue * pressure.sensors.length;
          break;
        case "weightedValue":
          value = (sensor.weightedValue * pressure.sensors.length) / 2;
          break;
      }
      pressureSensorElementsContainers[side][index].style.opacity = value;
    });
  }
});

devicePair.addEventListener("devicePressure", (event) => {
  const { pressure, side } = event.message;

  const container = centerOfPressureElementsContainers[side];
  container.style.opacity = pressure.normalizedSum;

  var center;
  switch (centerOfPressureVisualizationMode) {
    case "center":
      center = pressure.center;
      break;
    case "normalizedCenter":
      center = pressure.normalizedCenter;
      break;
  }
  if (!center) {
    return;
  }

  container.style.left = `${center.x * 100}%`;
  container.style.bottom = `${center.y * 100}%`;
});

devicePair.addEventListener("pressure", (event) => {
  const { pressure } = event.message;
  if (pressureVisualizationMode == "devicePairWeightedValue") {
    pressure.sensors.forEach((sensor) => {
      pressureSensorElementsContainers[sensor.side][sensor.index].style.opacity =
        (sensor.weightedValue * pressure.sensors.length) / 2;
    });
  }
});

devicePair.addEventListener("pressure", (event) => {
  const { pressure } = event.message;

  var center;
  switch (centerOfPressureVisualizationMode) {
    case "center":
      center = pressure.center;
      break;
    case "normalizedCenter":
      center = pressure.normalizedCenter;
      break;
  }
  var side;
  if (center) {
    side = center.x < 0.5 ? "left" : "right";
  }
  devicePair.sides.forEach((_side) => {
    const container = devicePairCenterOfPressureElementsContainers[_side];
    if (side == _side) {
      container.style.opacity = pressure.normalizedSum;
      container.style.left = `${(center.x % 0.5) * 2 * 100}%`;
      container.style.bottom = `${center.y * 100}%`;
    } else {
      container.style.opacity = 0;
    }
  });
});

// SERVER

const websocketClient = new BS.WebSocketClient();
/** @type {HTMLButtonElement} */
const toggleServerConnectionButton = document.getElementById("toggleServerConnection");
toggleServerConnectionButton.addEventListener("click", () => {
  websocketClient.toggleConnection();
});
websocketClient.addEventListener("isConnected", () => {
  toggleServerConnectionButton.innerText = websocketClient.isConnected ? "disconnect from server" : "connect to server";
});
websocketClient.addEventListener("connectionStatus", () => {
  let disabled;
  switch (websocketClient.connectionStatus) {
    case "notConnected":
    case "connected":
      disabled = false;
      break;
    case "connecting":
    case "disconnecting":
      disabled = true;
      break;
  }
  toggleServerConnectionButton.disabled = disabled;
});

// PRESSURE VISUALIZATION

const pressureVisualizationModes = ["scaledValue", "normalizedValue", "weightedValue", "devicePairWeightedValue"];
let pressureVisualizationMode = "normalizedValue";

/** @type {HTMLSelectElement} */
const visualizationModeSelect = document.getElementById("pressureVisualizationMode");
visualizationModeSelect.addEventListener("input", (event) => {
  pressureVisualizationMode = event.target.value;
  console.log({ pressureVisualizationMode });
});
/** @type {HTMLOptGroupElement} */
const visualizationModeOptGroup = visualizationModeSelect.querySelector("optgroup");
pressureVisualizationModes.forEach((pressureVisualizationMode) => {
  visualizationModeOptGroup.appendChild(new Option(pressureVisualizationMode));
});
visualizationModeSelect.value = pressureVisualizationMode;

// CENTER OF PRESSURE VISUALIZATION

const centerOfPressureVisualizationModes = ["normalizedCenter", "center"];
let centerOfPressureVisualizationMode = "normalizedCenter";

/** @type {HTMLSelectElement} */
const centerOfPressureVisualizationModeSelect = document.getElementById("centerOfPressureVisualizationMode");
centerOfPressureVisualizationModeSelect.addEventListener("input", (event) => {
  centerOfPressureVisualizationMode = event.target.value;
  console.log({ centerOfPressureVisualizationMode });
});
/** @type {HTMLOptGroupElement} */
const centerOfPressureVisualizationModeOptGroup = centerOfPressureVisualizationModeSelect.querySelector("optgroup");
centerOfPressureVisualizationModes.forEach((centerOfPressureVisualizationMode) => {
  centerOfPressureVisualizationModeOptGroup.appendChild(new Option(centerOfPressureVisualizationMode));
});
centerOfPressureVisualizationModeSelect.value = centerOfPressureVisualizationMode;
