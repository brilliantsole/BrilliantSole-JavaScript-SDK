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

// BALANCE VISUALIZATION

const balanceContainer = document.getElementById("balanceContainer");
/** @type {HTMLTemplateElement} */
const balanceSideTemplate = document.getElementById("balanceSideTemplate");

const balanceSideElements = {};
window.balanceSideElements = balanceSideElements;

devicePair.sides.forEach((side) => {
  /** @type {HTMLElement} */
  const balanceSideContainer = balanceSideTemplate.content.cloneNode(true).querySelector(".balanceSide");
  balanceSideContainer.classList.add(side);
  balanceContainer.appendChild(balanceSideContainer);
  const target = balanceSideContainer.querySelector(".target");
  const fill = balanceSideContainer.querySelector(".fill");
  balanceSideElements[side] = { target, fill };
});

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

/** @param {BS.CenterOfPressure} center  */
function updateUIOnCenterOfPressure(center) {
  devicePair.sides.forEach((side) => {
    let height = center.x;
    if (side == "left") {
      height = 1 - height;
    }
    balanceSideElements[side].fill.style.height = `${height * 100}%`;
  });
}
window.updateUIOnCenterOfPressure = updateUIOnCenterOfPressure;

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
    balanceContainer.classList.add("game");
  } else {
    balanceContainer.classList.remove("game");
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
  height: 0,
  start: 0,

  /** @param {BS.CenterOfPressure} center  */
  isInside(center) {
    console.log(center, this);
    return center.x >= this.start && center.x <= this.start + this.height;
  },

  reset() {
    balanceContainer.classList.remove("hover");

    this.height = randomValueBetween(0.1, 0.2);
    this.start = randomValueBetween(0, 1 - this.height);

    devicePair.sides.forEach((side) => {
      let bottom = this.start;
      if (side == "left") {
        bottom = 1 - bottom - this.height;
      }
      balanceSideElements[side].target.style.bottom = `${bottom * 100}%`;
      balanceSideElements[side].target.style.height = `${this.height * 100}%`;
    });
  },
};

let isCenterOfPressureInsideTarget = false;
let insideTargetTimeoutId;

devicePair.addEventListener("pressure", (event) => {
  const { pressure } = event.message;
  console.log({ pressure });
  if (pressure.normalizedCenter) {
    console.log("center", pressure.normalizedCenter);
    onCenterOfPressure(pressure.normalizedCenter);
  }
});

/** @param {BS.CenterOfPressure} center */
function onCenterOfPressure(center) {
  updateUIOnCenterOfPressure(center);

  if (isPlayingGame) {
    isCenterOfPressureInsideTarget = target.isInside(center);
    console.log({ isCenterOfPressureInsideTarget });
    if (isCenterOfPressureInsideTarget) {
      if (insideTargetTimeoutId == undefined) {
        balanceContainer.classList.add("hover");
        insideTargetTimeoutId = setTimeout(() => {
          target.reset();
        }, 3000);
      }
    } else {
      if (insideTargetTimeoutId != undefined) {
        balanceContainer.classList.remove("hover");
        clearTimeout(insideTargetTimeoutId);
        insideTargetTimeoutId = undefined;
      }
    }
  }
}
window.onCenterOfPressure = onCenterOfPressure; // for manual testing
