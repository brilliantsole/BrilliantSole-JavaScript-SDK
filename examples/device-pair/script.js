import * as BS from "../../build/brilliantsole.module.js";
window.BS = BS;
console.log({ BS });
//BS.setAllConsoleLevelFlags({ log: true });

// GET DEVICES

/** @type {HTMLTemplateElement} */
const availableDeviceTemplate = document.getElementById(
  "availableDeviceTemplate"
);
const availableDevicesContainer = document.getElementById("availableDevices");
/** @param {BS.Device[]} availableDevices */
function onAvailableDevices(availableDevices) {
  availableDevicesContainer.innerHTML = "";
  if (availableDevices.length == 0) {
    availableDevicesContainer.innerText = "no devices available";
  } else {
    availableDevices.forEach((availableDevice) => {
      let availableDeviceContainer = availableDeviceTemplate.content
        .cloneNode(true)
        .querySelector(".availableDevice");
      availableDeviceContainer.querySelector(".name").innerText =
        availableDevice.name;
      availableDeviceContainer.querySelector(".type").innerText =
        availableDevice.type;

      /** @type {HTMLButtonElement} */
      const toggleConnectionButton =
        availableDeviceContainer.querySelector(".toggleConnection");
      toggleConnectionButton.addEventListener("click", () => {
        availableDevice.toggleConnection();
      });
      const onConnectionStatusUpdate = () => {
        switch (availableDevice.connectionStatus) {
          case "connected":
          case "notConnected":
            toggleConnectionButton.disabled = false;
            toggleConnectionButton.innerText = availableDevice.isConnected
              ? "disconnect"
              : "connect";
            break;
          case "connecting":
          case "disconnecting":
            toggleConnectionButton.disabled = true;
            toggleConnectionButton.innerText = availableDevice.connectionStatus;
            break;
        }
      };
      availableDevice.addEventListener("connectionStatus", () =>
        onConnectionStatusUpdate()
      );
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
const devicePair = BS.DevicePair.insoles;

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
const togglePressureButton = document.getElementById("togglePressure");
devicePair.addEventListener("isConnected", () => {
  togglePressureButton.disabled = !devicePair.isConnected;
});
togglePressureButton.addEventListener("click", () => {
  isPressureDataEnabled = !isPressureDataEnabled;
  togglePressureButton.innerText = isPressureDataEnabled
    ? "disable pressure"
    : "enable pressure";
  devicePair.setSensorConfiguration({
    pressure: isPressureDataEnabled ? 20 : 0,
  });
});

/** @type {HTMLButtonElement} */
const resetPressureRangeButton = document.getElementById("resetPressureRange");
devicePair.addEventListener("isConnected", () => {
  resetPressureRangeButton.disabled = !devicePair.isConnected;
});
resetPressureRangeButton.addEventListener("click", () => {
  devicePair.resetPressureRange();
});

let pressureAutoRange = true;
/** @type {HTMLButtonElement} */
const togglePressureAutoRangeButton = document.getElementById(
  "togglePressureAutoRange"
);
devicePair.addEventListener("isConnected", () => {
  togglePressureAutoRangeButton.disabled = !devicePair.isConnected;
});
togglePressureAutoRangeButton.addEventListener("click", () => {
  pressureAutoRange = !pressureAutoRange;
  devicePair.setPressureAutoRange(pressureAutoRange);
  togglePressureAutoRangeButton.innerText = pressureAutoRange
    ? "disable pressure autoRange"
    : "enable pressure autoRange";
});

// GAME ROTATION
let isGameRotationDataEnabled = false;

/** @type {HTMLButtonElement} */
const toggleGameRotationButton = document.getElementById("toggleGameRotation");
devicePair.addEventListener("isConnected", () => {
  toggleGameRotationButton.disabled = !devicePair.isConnected;
});
toggleGameRotationButton.addEventListener("click", () => {
  isGameRotationDataEnabled = !isGameRotationDataEnabled;
  toggleGameRotationButton.innerText = isGameRotationDataEnabled
    ? "disable gameRotation"
    : "enable gameRotation";
  devicePair.setSensorConfiguration({
    gameRotation: isGameRotationDataEnabled ? 20 : 0,
  });
});

// DEVICES

const devicesContainer = document.getElementById("devices");
/** @type {HTMLTemplateElement} */
const deviceTemplate = document.getElementById("deviceTemplate");

devicePair.sides.forEach((side) => {
  /** @type {HTMLElement} */
  const deviceContainer = deviceTemplate.content
    .cloneNode(true)
    .querySelector(".device");
  deviceContainer.classList.add(side);
  devicesContainer.appendChild(deviceContainer);

  deviceContainer.querySelector(".side").innerText = side;

  /** @type {HTMLButtonElement} */
  const toggleConnectionButton =
    deviceContainer.querySelector(".toggleConnection");
  toggleConnectionButton.addEventListener("click", () => {
    devicePair[side].toggleConnection();
  });

  devicePair.addEventListener("deviceIsConnected", (event) => {
    const { device } = event.message;
    if (device.side != side) {
      return;
    }

    if (device.isConnected) {
      toggleConnectionButton.disabled = false;
    }
    toggleConnectionButton.innerText = device.isConnected
      ? "disconnect"
      : "reconnect";
  });

  devicePair.addEventListener("deviceConnectionStatus", (event) => {
    const { device } = event.message;
    if (device.side != side) {
      return;
    }

    switch (device.connectionStatus) {
      case "connected":
      case "notConnected":
        toggleConnectionButton.disabled = false;
        toggleConnectionButton.innerText = device.isConnected
          ? "disconnect"
          : "reconnect";
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
    const { device } = event.message;
    if (device.side != side) {
      return;
    }

    const { pressure } = event.message;

    pressurePre.textContent = JSON.stringify(
      {
        center: pressure.center,
        scaledSum: pressure.scaledSum,
        normalizedCenter: pressure.normalizedCenter,
        normalizedSum: pressure.normalizedSum,
        motionCenter: pressure.motionCenter,
        calibratedCenter: pressure.calibratedCenter,
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
  const { pressure } = event.message;

  devicePairPressurePre.textContent = JSON.stringify(
    {
      center: pressure.center,
      scaledSum: pressure.scaledSum,
      normalizedCenter: pressure.normalizedCenter,
      normalizedSum: pressure.normalizedSum,
    },
    (key, value) => value?.toFixed?.(3) || value,
    2
  );
});
