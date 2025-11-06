import * as BS from "../../build/brilliantsole.module.js";

// DEVICE
const device = new BS.Device();
window.device = device;
window.BS = BS;

// CONNECT
const toggleConnectionButton = document.getElementById("toggleConnection");
toggleConnectionButton.addEventListener("click", () =>
  device.toggleConnection()
);
device.addEventListener("connectionStatus", (event) => {
  const { connectionStatus } = event.message;

  let disabled = false;
  let innerText = connectionStatus;
  switch (connectionStatus) {
    case "notConnected":
      innerText = "connect";
      break;
    case "connected":
      innerText = "disconnect";
      break;
  }
  toggleConnectionButton.disabled = disabled;
  toggleConnectionButton.innerText = innerText;
});

// CANVAS
/** @type {HTMLCanvasElement} */
const displayCanvas = document.getElementById("display");

// DISPLAY CANVAS HELPER
const displayCanvasHelper = new BS.DisplayCanvasHelper();
// displayCanvasHelper.setBrightness("veryLow");
displayCanvasHelper.canvas = displayCanvas;
window.displayCanvasHelper = displayCanvasHelper;

device.addEventListener("connected", () => {
  if (device.isDisplayAvailable) {
    displayCanvasHelper.device = device;
  } else {
    console.error("device doesn't have a display");
    device.disconnect();
  }
});

// BRIGHTNESS
/** @type {HTMLSelectElement} */
const setDisplayBrightnessSelect = document.getElementById(
  "setDisplayBrightnessSelect"
);
/** @type {HTMLOptGroupElement} */
const setDisplayBrightnessSelectOptgroup =
  setDisplayBrightnessSelect.querySelector("optgroup");
BS.DisplayBrightnesses.forEach((displayBrightness) => {
  setDisplayBrightnessSelectOptgroup.appendChild(new Option(displayBrightness));
});
setDisplayBrightnessSelect.addEventListener("input", () => {
  displayCanvasHelper.setBrightness(setDisplayBrightnessSelect.value);
});

setDisplayBrightnessSelect.value = displayCanvasHelper.brightness;

// COLORS
/** @type {HTMLTemplateElement} */
const displayColorTemplate = document.getElementById("displayColorTemplate");
const displayColorsContainer = document.getElementById("displayColors");
const setDisplayColor = BS.ThrottleUtils.throttle(
  (colorIndex, colorString) => {
    console.log({ colorIndex, colorString });
    displayCanvasHelper.setColor(colorIndex, colorString, true);
  },
  100,
  true
);
/** @type {HTMLInputElement[]} */
const displayColorInputs = [];
const setupColors = () => {
  displayColorsContainer.innerHTML = "";
  for (
    let colorIndex = 0;
    colorIndex < displayCanvasHelper.numberOfColors;
    colorIndex++
  ) {
    const displayColorContainer = displayColorTemplate.content
      .cloneNode(true)
      .querySelector(".displayColor");

    const colorInput = displayColorContainer.querySelector(".color");
    displayColorInputs[colorIndex] = colorInput;
    colorInput.addEventListener("input", () => {
      setDisplayColor(colorIndex, colorInput.value);
    });

    displayColorsContainer.appendChild(displayColorContainer);
  }
};
displayCanvasHelper.addEventListener("numberOfColors", () => setupColors());
displayCanvasHelper.addEventListener("color", (event) => {
  const { colorHex, colorIndex } = event.message;
  displayColorInputs[colorIndex].value = colorHex;
});
setupColors();
displayCanvasHelper.setColor(1, "white");
displayCanvasHelper.flushContextCommands();

// DRAW
let isDrawing = false;
let isWaitingToRedraw = false;

let isUploading = false;
displayCanvasHelper.addEventListener("deviceSpriteSheetUploadStart", () => {
  isUploading = true;
});
displayCanvasHelper.addEventListener("deviceSpriteSheetUploadComplete", () => {
  isUploading = false;
});

let didLoad = false;
const draw = async () => {
  if (isUploading) {
    return;
  }
  if (!didLoad) {
    console.log("hasn't loaded yet");
    return;
  }

  if (isDrawing) {
    console.warn("busy drawing");
    isWaitingToRedraw = true;
    return;
  }
  isDrawing = true;

  // FILL

  await displayCanvasHelper.show();
};

displayCanvasHelper.addEventListener("ready", () => {
  isDrawing = false;
  if (isWaitingToRedraw) {
    isWaitingToRedraw = false;
    draw();
  }
});

// PROGRESS
/** @type {HTMLProgressElement} */
const fileTransferProgress = document.getElementById("fileTransferProgress");

device.addEventListener("fileTransferProgress", (event) => {
  const progress = event.message.progress;
  //console.log({ progress });
  fileTransferProgress.value = progress == 1 ? 0 : progress;
});
device.addEventListener("fileTransferStatus", () => {
  if (device.fileTransferStatus == "idle") {
    fileTransferProgress.value = 0;
  }
});

// PASTE
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

window.addEventListener("paste", (event) => {
  const string = event.clipboardData.getData("text");
  // FILL
});
window.addEventListener("paste", async (event) => {
  const items = event.clipboardData.items;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    console.log("item.type", item.type);
    // FILL
  }
});

// DRAGOVER
window.addEventListener("dragover", (e) => {
  e.preventDefault();
});

window.addEventListener("drop", async (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) {
    console.log(file.type);
    // FILL
  }
});

// SENSE

const senseDevice = new BS.Device();
window.senseDevice = senseDevice;

// SENSE CONNECTION
const toggleSenseConnectionButton = document.getElementById(
  "toggleSenseConnection"
);
toggleSenseConnectionButton.addEventListener("click", () =>
  senseDevice.toggleConnection()
);
senseDevice.addEventListener("connectionStatus", (event) => {
  const { connectionStatus } = event.message;

  let disabled = false;
  let innerText = connectionStatus;
  switch (connectionStatus) {
    case "notConnected":
      innerText = "connect sense";
      break;
    case "connected":
      innerText = "disconnect sense";
      break;
  }
  toggleSenseConnectionButton.disabled = disabled;
  toggleSenseConnectionButton.innerText = innerText;
});

// SENSE SENSOR CONFIGURATION
/** @type {BS.SensorType[]} */
const requiredSensorTypes = ["linearAcceleration", "gameRotation"];
senseDevice.addEventListener("connected", () => {
  const hasAllSensorTypes = requiredSensorTypes.every((sensorType) =>
    senseDevice.sensorTypes.includes(sensorType)
  );
  if (!hasAllSensorTypes) {
    console.error(
      `senseDevice "${senseDevice.name}" doesn't have requiredSensorTypes`,
      requiredSensorTypes
    );
    senseDevice.disconnect();
  }
});

/** @type {HTMLSelectElement} */
const senseSensorRateSelect = document.getElementById("senseSensorRate");
const senseSensorRateOptgroup = senseSensorRateSelect.querySelector("optgroup");
const senseSensorRates = [5, 10, 20];
senseSensorRates.forEach((sensorRate) => {
  senseSensorRateOptgroup.appendChild(
    new Option(`${sensorRate}ms`, sensorRate)
  );
});
let sensorRate = senseSensorRates[1];
senseSensorRateSelect.addEventListener("input", () => {
  setSensorRate(Number(senseSensorRateSelect.value));
});
const setSensorRate = (newSensorRate) => {
  sensorRate = newSensorRate;
  console.log({ sensorRate });
  senseSensorRateSelect.value = sensorRate;

  if (senseDevice.isConnected && isSensorDataEnabled) {
    setSenseSensorData(true);
  }
};
setSensorRate(sensorRate);

/** @type {HTMLInputElement} */
const toggleSenseSensorDataInput = document.getElementById(
  "toggleSenseSensorData"
);
senseDevice.addEventListener("isConnected", () => {
  toggleSenseSensorDataInput.disabled = !senseDevice.isConnected;
  if (!senseDevice.isConnected) {
    toggleSenseSensorDataInput.checked = false;
  }
});
toggleSenseSensorDataInput.addEventListener("input", () => {
  toggleSenseSensorData();
});
const toggleSenseSensorData = () => {
  setSenseSensorData(!isSensorDataEnabled);
};
const setSenseSensorData = (enable) => {
  if (enable) {
    /** @type {BS.SensorConfiguration} */
    const newSensorConfiguration = {};
    requiredSensorTypes.forEach((sensorType) => {
      newSensorConfiguration[sensorType] = sensorRate;
    });
    console.log("newSensorConfiguration", newSensorConfiguration);
    senseDevice.setSensorConfiguration(newSensorConfiguration);
  } else {
    senseDevice.clearSensorConfiguration();
  }
};

let isSensorDataEnabled = false;
senseDevice.addEventListener("getSensorConfiguration", () => {
  const newIsSensorDataEnabled =
    senseDevice.sensorConfiguration[requiredSensorTypes[0]] > 0;
  setIsSensorDataEnabled(newIsSensorDataEnabled);
});
const setIsSensorDataEnabled = (newIsSensorDataEnabled) => {
  isSensorDataEnabled = newIsSensorDataEnabled;
  console.log({ isSensorDataEnabled });
};

import * as three from "../utils/three/three.module.min.js";
/** @type {import("../utils/three/three.module.min")} */
const THREE = three;
window.THREE = THREE;

// SENSE SENSOR DATA
const quaternion = new THREE.Quaternion();
const linearAcceleration = new THREE.Vector3();
const velocity = new THREE.Vector3();
const position = new THREE.Vector3();
senseDevice.addEventListener("gameRotation", (event) => {
  quaternion.copy(event.message.gameRotation);
});
let latestLinearAccelerationTimestamp = 0;
senseDevice.addEventListener("linearAcceleration", (event) => {
  const { timestamp } = event.message;
  const timestampDifference =
    latestLinearAccelerationTimestamp == 0
      ? sensorRate
      : timestamp - latestLinearAccelerationTimestamp;
  latestLinearAccelerationTimestamp = timestamp;

  linearAcceleration
    .copy(event.message.linearAcceleration)
    .applyQuaternion(quaternion);

  const dt = timestampDifference / 1000;
  velocity.addScaledVector(linearAcceleration, 9.80665 * dt);
  position.addScaledVector(velocity, dt);
  console.log(position, linearAcceleration);
});

// DID LOAD
didLoad = true;
