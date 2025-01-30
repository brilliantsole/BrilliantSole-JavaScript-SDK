import * as BS from "../../build/brilliantsole.module.js";
window.BS = BS;
console.log(BS);

import * as THREE from "../utils/three/three.module.min.js";

const device = new BS.Device();
console.log({ device });
window.device = device;

BS.setAllConsoleLevelFlags({ log: false });
//BS.setConsoleLevelFlagsForType("PressureDataManager", { log: true });

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
      const availableDeviceContainer = availableDeviceTemplate.content
        .cloneNode(true)
        .querySelector(".availableDevice");
      availableDeviceContainer.querySelector(".name").innerText = availableDevice.name;
      availableDeviceContainer.querySelector(".type").innerText = availableDevice.type;

      /** @type {HTMLButtonElement} */
      const toggleConnectionButton = availableDeviceContainer.querySelector(".toggleConnection");
      toggleConnectionButton.addEventListener("click", () => {
        device.connectionManager = availableDevice.connectionManager;
        device.reconnect();
      });
      device.addEventListener("connectionStatus", () => {
        toggleConnectionButton.disabled = device.connectionStatus != "notConnected";
      });
      toggleConnectionButton.disabled = device.connectionStatus != "notConnected";

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
  const devices = event.message.availableDevices;
  onAvailableDevices(devices);
});
getDevices();

// CONNECTION

/** @type {HTMLButtonElement} */
const toggleConnectionButton = document.getElementById("toggleConnection");
toggleConnectionButton.addEventListener("click", () => {
  switch (device.connectionStatus) {
    case "notConnected":
      device.connect();
      break;
    case "connected":
      device.disconnect();
      break;
  }
});

/** @type {HTMLButtonElement} */
const reconnectButton = document.getElementById("reconnect");
reconnectButton.addEventListener("click", () => {
  device.reconnect();
});
device.addEventListener("connectionStatus", () => {
  reconnectButton.disabled = !device.canReconnect;
});

device.addEventListener("connectionStatus", () => {
  switch (device.connectionStatus) {
    case "connected":
    case "notConnected":
      toggleConnectionButton.disabled = false;
      toggleConnectionButton.innerText = device.isConnected ? "disconnect" : "connect";
      break;
    case "connecting":
    case "disconnecting":
      toggleConnectionButton.disabled = true;
      toggleConnectionButton.innerText = device.connectionStatus;
      break;
  }
});

/** @type {HTMLInputElement} */
const reconnectOnDisconnectionCheckbox = document.getElementById("reconnectOnDisconnection");
reconnectOnDisconnectionCheckbox.addEventListener("input", () => {
  device.reconnectOnDisconnection = reconnectOnDisconnectionCheckbox.checked;
});

/** @type {HTMLButtonElement} */
const resetDeviceButton = document.getElementById("resetDevice");
device.addEventListener("isConnected", () => {
  resetDeviceButton.disabled = !device.isConnected;
});
resetDeviceButton.addEventListener("click", () => {
  device.reset();
});

// SENSOR CONFIGURATION

/** @type {HTMLPreElement} */
const sensorConfigurationPre = document.getElementById("sensorConfigurationPre");
device.addEventListener("getSensorConfiguration", () => {
  sensorConfigurationPre.textContent = JSON.stringify(device.sensorConfiguration, null, 2);
});

/** @type {HTMLTemplateElement} */
const sensorTypeConfigurationTemplate = document.getElementById("sensorTypeConfigurationTemplate");
BS.SensorTypes.forEach((sensorType) => {
  /** @type {HTMLElement} */
  const sensorTypeConfigurationContainer = sensorTypeConfigurationTemplate.content
    .cloneNode(true)
    .querySelector(".sensorTypeConfiguration");
  sensorTypeConfigurationContainer.querySelector(".sensorType").innerText = sensorType;

  /** @type {HTMLInputElement} */
  const sensorRateInput = sensorTypeConfigurationContainer.querySelector(".sensorRate");
  sensorRateInput.value = 0;
  sensorRateInput.max = BS.MaxSensorRate;
  sensorRateInput.step = BS.SensorRateStep;
  sensorRateInput.addEventListener("input", () => {
    const sensorRate = Number(sensorRateInput.value);
    console.log({ sensorType, sensorRate });
    device.setSensorConfiguration({ [sensorType]: sensorRate });
  });

  device.addEventListener("connected", () => {
    if (device.sensorTypes.includes(sensorType)) {
      sensorTypeConfigurationContainer.classList.remove("hidden");
    } else {
      sensorTypeConfigurationContainer.classList.add("hidden");
    }
  });

  sensorTypeConfigurationTemplate.parentElement.appendChild(sensorTypeConfigurationContainer);
  sensorTypeConfigurationContainer.dataset.sensorType = sensorType;
});
device.addEventListener("getSensorConfiguration", () => {
  for (const sensorType in device.sensorConfiguration) {
    document.querySelector(`.sensorTypeConfiguration[data-sensor-type="${sensorType}"] .input`).value =
      device.sensorConfiguration[sensorType];
  }
});
device.addEventListener("isConnected", () => {
  for (const sensorType in device.sensorConfiguration) {
    document.querySelector(`[data-sensor-type="${sensorType}"] .input`).disabled = !device.isConnected;
  }
});

// BOTTANGO
let bottangoPort = 0;
/** @type {HTMLInputElement} */
const bottangoPortInput = document.getElementById("bottangoPort");
bottangoPortInput.addEventListener("input", () => {
  bottangoPort = Number(bottangoPortInput.value);
  console.log({ bottangoPort });
});
bottangoPortInput.dispatchEvent(new Event("input"));

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}
async function sendBottangoControlInput(identifier, value) {
  value = clamp(value);
  console.log(`setting ${identifier} to ${value}...`);
  const json = { identifier, value, port: bottangoPort };
  const jsonString = JSON.stringify(json);
  console.log("sending", json, jsonString);

  const url = `https://localhost/bottango/`;
  console.log(url);

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: jsonString,
  });
}

window.sendBottangoControlInput = sendBottangoControlInput;

/** @type {HTMLElement} */
const mappingsContainer = document.getElementById("mappings");
/** @type {HTMLTemplateElement} */
const mappingTemplate = document.getElementById("mappingTemplate");

function addMapping() {
  const mappingContainer = mappingTemplate.content.cloneNode(true).querySelector(".mapping");

  const deleteButton = mappingContainer.querySelector(".delete");
  deleteButton.addEventListener("click", () => mappingContainer.remove());

  const identifierInput = mappingContainer.querySelector(".identifier");
  let identifier = "";
  identifierInput.addEventListener("input", () => {
    identifier = identifierInput.value;
    console.log({ identifier });
  });

  const valueInput = mappingContainer.querySelector(".value");
  valueInput.addEventListener("input", () => {
    const value = Number(valueInput.value);
    setValue(value);
  });

  const range = new BS.RangeHelper();
  let latestRawValue = 0;
  const setValue = (newValue, invert = false) => {
    latestRawValue = newValue;
    let value = 0;
    if (autoRange) {
      value = range.updateAndGetNormalization(latestRawValue);
    } else {
      value = range.getNormalization(latestRawValue);
    }
    if (invert) {
      value = 1 - value;
    }
    valueInput.value = value;
    sendBottangoControlInput(identifier, value);
  };

  const setMinButton = mappingContainer.querySelector(".setMin");
  setMinButton.addEventListener("click", () => {
    console.log("setting min", latestRawValue);
    range.min = latestRawValue;
  });
  const setMaxButton = mappingContainer.querySelector(".setMax");
  setMaxButton.addEventListener("click", () => {
    console.log("setting max", latestRawValue);
    range.max = latestRawValue;
  });
  const resetButton = mappingContainer.querySelector(".reset");
  resetButton.addEventListener("click", () => {
    console.log("resetting");
    range.reset();
  });

  const euler = new THREE.Euler(0, 0, 0, "YXZ");
  const quaternion = new THREE.Quaternion();

  let type = "";
  const setType = (newType) => {
    range.reset();
    type = newType;
    console.log({ type });
  };
  const typeSelect = mappingContainer.querySelector(".type");
  typeSelect.addEventListener("input", () => {
    setType(typeSelect.value);
  });
  typeSelect.dispatchEvent(new Event("input"));
  mappingsContainer.appendChild(mappingContainer);

  let autoRange = false;
  const autoRangeInput = mappingContainer.querySelector(".autoRange");
  autoRangeInput.addEventListener("input", () => {
    autoRange = autoRangeInput.checked;
    console.log({ autoRange });
  });
  autoRangeInput.dispatchEvent(new Event("input"));

  device.addEventListener("sensorData", (event) => {
    const { sensorType } = event.message;

    console.log({ sensorType, type });

    if (!type.includes(sensorType)) {
      return;
    }

    const [_, subType, subSubType] = type.split(".");
    console.log({ sensorType, type, subType, subSubType });

    switch (sensorType) {
      case "pressure":
        switch (subType) {
          case "centerOfPressure":
            if (event.message.pressure.normalizedCenter) {
              switch (subSubType) {
                case "x":
                  setValue(event.message.pressure.normalizedCenter.x);
                  break;
                case "y":
                  setValue(event.message.pressure.normalizedCenter.y);
                  break;
              }
            }
            break;
          default:
            const pressureSensorIndex = Number(subType);
            setValue(event.message.pressure.sensors[pressureSensorIndex].normalizedValue, true);
            break;
        }
        break;
      case "linearAcceleration":
        const { linearAcceleration } = event.message;
        setValue(linearAcceleration[subType]);
        break;
      case "gyroscope":
        const { gyroscope } = event.message;
        setValue(gyroscope[subType]);
        break;
      case "gameRotation":
        const { gameRotation } = event.message;
        quaternion.copy(gameRotation);
        euler.setFromQuaternion(quaternion);
        console.log(euler);
        switch (subType) {
          case "pitch":
            setValue(euler.x, true);
            break;
          case "roll":
            setValue(euler.z);
            break;
          case "yaw":
            setValue(euler.y);
            break;
        }
        break;
    }
  });
}
/** @type {HTMLButtonElement} */
const addMappingButton = document.getElementById("addMapping");
addMappingButton.addEventListener("click", () => {
  addMapping();
});
