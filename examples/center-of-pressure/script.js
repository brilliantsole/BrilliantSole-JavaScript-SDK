import * as BS from "../../build/brilliantsole.module.js";
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
  const devices = event.message.availableDevices;
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

// PRESSURE VISUALIZATION

let isPressureDataEnabled = false;

/** @type {HTMLButtonElement} */
const togglePressureDataButton = document.getElementById("togglePressureData");
devicePair.addEventListener("isConnected", () => {
  togglePressureDataButton.disabled = !devicePair.isConnected;
});
togglePressureDataButton.addEventListener("click", () => {
  isPressureDataEnabled = !isPressureDataEnabled;
  console.log({ isPressureDataEnabled });
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

/** @typedef {import("../../build/brilliantsole.module.js").CenterOfPressure} CenterOfPressure */

const centerOfPressureElement = document.getElementById("centerOfPressure");
/** @param {CenterOfPressure} center  */
function updateCenterOfPressureElement(center) {
  centerOfPressureElement.style.left = `${center.x * 100}%`;
  centerOfPressureElement.style.top = `${(1 - center.y) * 100}%`;
}
window.updateCenterOfPressureElement = updateCenterOfPressureElement;

let isPlayingGame = false;

/** @type {HTMLButtonElement} */
const toggleGameButton = document.getElementById("toggleGame");
devicePair.addEventListener("isConnected", () => {
  //toggleGameButton.disabled = !devicePair.isConnected;
});
toggleGameButton.addEventListener("click", () => {
  isPlayingGame = !isPlayingGame;
  toggleGameButton.innerText = isPlayingGame ? "stop game" : "start game";
  if (isPlayingGame) {
    target.reset();
    target.element.style.display = "block";
  } else {
    target.element.style.display = "none";
  }
});

/**
 * @param {number} min
 * @param {number} max
 */
function randomValueBetween(min, max) {
  const range = max - min;
  return min + Math.random() * range;
}

const target = {
  width: 0,
  height: 0,
  left: 0,
  top: 0,
  bottom: 0,
  element: document.getElementById("target"),

  /** @param {CenterOfPressure} center  */
  isInside(center) {
    return (
      center.x >= this.left &&
      center.x <= this.left + this.width &&
      center.y <= this.bottom &&
      center.y >= this.bottom - this.height
    );
  },

  reset() {
    this.element.classList.remove("hover");

    this.width = randomValueBetween(0.1, 0.3);
    this.height = randomValueBetween(0.1, 0.3);

    this.left = randomValueBetween(0, 1 - this.width);
    this.top = randomValueBetween(0, 1 - this.height);
    this.bottom = 1 - this.top;

    console.log("target", { ...target });

    this.element.style.width = `${this.width * 100}%`;
    this.element.style.height = `${this.height * 100}%`;

    this.element.style.left = `${this.left * 100}%`;
    this.element.style.top = `${this.top * 100}%`;
  },
};

/** @typedef {import("../../build/brilliantsole.module.js").DevicePairPressureData} DevicePairPressureData */

let isCenterOfPressureInsideTarget = false;
let insideTargetTimeoutId;

devicePair.addEventListener("pressure", (event) => {
  /** @type {DevicePairPressureData} */
  const pressure = event.message.pressure;
  console.log({ pressure });
  if (pressure.normalizedCenter) {
    //console.log(pressure.normalizedCenter);
    onCenterOfPressure(pressure.normalizedCenter);
  }
});

/** @param {CenterOfPressure} center */
function onCenterOfPressure(center) {
  updateCenterOfPressureElement(center);

  if (isPlayingGame) {
    isCenterOfPressureInsideTarget = target.isInside(center);
    console.log({ isCenterOfPressureInsideTarget });
    if (isCenterOfPressureInsideTarget) {
      if (insideTargetTimeoutId == undefined) {
        target.element.classList.add("hover");
        insideTargetTimeoutId = setTimeout(() => {
          target.reset();
        }, 3000);
      }
    } else {
      if (insideTargetTimeoutId != undefined) {
        target.element.classList.remove("hover");
        clearTimeout(insideTargetTimeoutId);
        insideTargetTimeoutId = undefined;
      }
    }
  }
}
window.onCenterOfPressure = onCenterOfPressure; // for manual testing
