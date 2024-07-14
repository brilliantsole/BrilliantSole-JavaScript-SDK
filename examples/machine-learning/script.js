import * as BS from "../../build/brilliantsole.module.js";
import * as THREE from "../utils/three/three.module.min.js";
window.BS = BS;
console.log({ BS });
//BS.setAllConsoleLevelFlags({ log: false });

// VIBRATION

/**
 * vibrates all connected insoles with a single waveformEffect - use to indicate stuff
 * @param {BS.VibrationWaveformEffect} effect
 */
function vibrate(effect) {
  BS.DeviceManager.ConnectedDevices.forEach((device) => {
    device.triggerVibration([
      {
        type: "waveformEffect",
        segments: [{ effect }],
      },
    ]);
  });
}

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
      window.addEventListener("createNeuralNetwork", () => {
        toggleConnectionButton.disabled = true;
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
  const device = new BS.Device();
  device.connect();
});
window.addEventListener("createNeuralNetwork", () => {
  addDeviceButton.disabled = true;
});

// CONNECTED DEVICES

const connectedDevicesContainer = document.getElementById("connectedDevices");
/** @type {HTMLTemplateElement} */
const connectedDeviceTemplate = document.getElementById("connectedDeviceTemplate");

BS.DeviceManager.AddEventListener("deviceConnected", (event) => {
  const { device } = event.message;
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
  device.addEventListener("notConnected", () => {
    connectedDeviceContainer.remove();
  });

  /** @type {HTMLButtonElement} */
  const toggleSelectonButton = connectedDeviceContainer.querySelector(".toggleSelection");
  toggleSelectonButton.addEventListener("click", () => {
    toggleSelectonButton.disabled = true;
    toggleDeviceSelection(device);
  });
  window.addEventListener("createNeuralNetwork", () => {
    toggleSelectonButton.disabled = true;
  });
  window.addEventListener("deviceSelection", (event) => {
    if (device != event.detail.device) {
      return;
    }
    toggleSelectonButton.innerText = isDeviceSelected(device) ? "deselect" : "select";
    toggleSelectonButton.disabled = false;
  });

  window.addEventListener("createNeuralNetwork", () => {
    disconnectButton.disabled = true;
  });

  connectedDevicesContainer.appendChild(connectedDeviceContainer);
});

// SELECTED DEVICES

const selectedDevicesContainer = document.getElementById("selectedDevices");
/** @type {HTMLTemplateElement} */
const selectedDeviceTemplate = document.getElementById("selectedDeviceTemplate");

/** @type {Object.<string, HTMLElement>} */
const selectedDeviceContainers = {};

/** @type {BS.Device[]} */
const selectedDevices = [];
/** @param {BS.Device} device */
function isDeviceSelected(device) {
  return selectedDevices.includes(device);
}

/** @param {BS.Device} device */
function selectDevice(device) {
  if (isDeviceSelected(device)) {
    console.log("device already selected");
    return;
  }
  selectedDevices.push(device);

  let selectedDeviceContainer = selectedDeviceContainers[device.id];
  if (!selectedDeviceContainer) {
    selectedDeviceContainer = selectedDeviceTemplate.content.cloneNode(true).querySelector(".selectedDevice");

    selectedDeviceContainer.querySelector(".name").innerText = device.name;
    selectedDeviceContainer.querySelector(".type").innerText = device.type;
    selectedDeviceContainer.querySelector(".index").innerText = selectedDevices.indexOf(device);

    /** @type {HTMLPreElement} */
    const sensorConfigurationPre = selectedDeviceContainer.querySelector("pre.sensorConfiguration");
    const updateSensorConfigurationPre = () => {
      sensorConfigurationPre.textContent = JSON.stringify(device.sensorConfiguration, null, 2);
    };
    device.addEventListener("getSensorConfiguration", () => {
      updateSensorConfigurationPre();
    });
    updateSensorConfigurationPre();

    /** @type {HTMLButtonElement} */
    const deselectButton = selectedDeviceContainer.querySelector(".deselect");
    deselectButton.addEventListener("click", () => {
      deselectDevice(device);
    });
    window.addEventListener("createNeuralNetwork", () => {
      deselectButton.disabled = true;
    });

    selectedDeviceContainers[device.id] = selectedDeviceContainer;
  }

  selectedDevicesContainer.appendChild(selectedDeviceContainer);

  window.dispatchEvent(new CustomEvent("deviceSelection", { detail: { device } }));
}

/** @param {BS.Device} device */
function deselectDevice(device) {
  if (!isDeviceSelected(device)) {
    console.log("device already not selected");
    return;
  }
  selectedDevices.splice(selectedDevices.indexOf(device), 1);

  const selectedDeviceContainer = selectedDeviceContainers[device.id];
  if (!selectedDeviceContainer) {
    console.log("selectedDeviceContainer not found for device");
    return;
  }
  selectedDeviceContainer.remove();

  window.dispatchEvent(new CustomEvent("deviceSelection", { detail: { device } }));
}

/** @param {BS.Device} device */
function toggleDeviceSelection(device) {
  if (isDeviceSelected(device)) {
    deselectDevice(device);
  } else {
    selectDevice(device);
  }
}

// TASK

/** @type {BS.TfliteTask} */
let task = "classification";

/** @type {HTMLSelectElement} */
const taskSelect = document.getElementById("task");
/** @type {HTMLOptGroupElement} */
const taskSelectOptgroup = taskSelect.querySelector("optgroup");
BS.TfliteTasks.forEach((task) => {
  taskSelectOptgroup.appendChild(new Option(task));
});
taskSelect.addEventListener("input", () => {
  task = taskSelect.value;
  console.log({ task });
  window.dispatchEvent(new CustomEvent("task", { detail: { task } }));
});
taskSelect.dispatchEvent(new Event("input"));

window.addEventListener("createNeuralNetwork", () => {
  taskSelect.disabled = true;
});

window.addEventListener("loadConfig", () => {
  taskSelect.value = config.task;
  taskSelect.dispatchEvent(new Event("input"));
});

// INPUTS

/** @type {BS.ContinuousSensorType[]} */
let sensorTypes = [];
function getInputs() {
  /** @type {string[]} */
  const _inputs = [];
  sensorTypes.forEach((sensorType) => {
    switch (sensorType) {
      case "pressure":
        for (let index = 0; index < BS.DefaultNumberOfPressureSensors; index++) {
          _inputs.push(`${sensorType}.${index}`);
        }
        break;
      case "acceleration":
      case "gravity":
      case "linearAcceleration":
      case "gyroscope":
      case "magnetometer":
        ["x", "y", "z"].forEach((component) => {
          _inputs.push(`${sensorType}.${component}`);
        });
        break;
      case "gameRotation":
      case "rotation":
        ["x", "y", "z", "w"].forEach((component) => {
          _inputs.push(`${sensorType}.${component}`);
        });
        break;
      case "barometer":
        // FILL
        break;
    }
  });

  /** @type {string[]} */
  let inputs = [];

  for (let index = 0; index < selectedDevices.length; index++) {
    inputs.push(..._inputs.map((input) => `${index}.${input}`));
  }

  console.log({ inputs });
  return inputs;
}

const sensorTypesContainer = document.getElementById("sensorTypes");
/** @type {HTMLTemplateElement} */
const sensorTypeTemplate = document.getElementById("sensorTypeTemplate");
/** @type {Object.<string, HTMLElement>} */
const sensorTypeContainers = {};

BS.TfliteSensorTypes.forEach((sensorType) => {
  const sensorTypeContainer = sensorTypeTemplate.content.cloneNode(true).querySelector(".sensorType");
  sensorTypeContainer.querySelector(".name").innerText = sensorType;

  /** @type {HTMLInputElement} */
  const isSensorEnabledInput = sensorTypeContainer.querySelector(".enabled");
  isSensorEnabledInput.addEventListener("input", () => {
    if (isSensorEnabledInput.checked) {
      sensorTypes.push(sensorType);
    } else {
      sensorTypes.splice(sensorTypes.indexOf(sensorType), 1);
    }
    sensorTypes.sort((a, b) => BS.ContinuousSensorTypes.indexOf(a) - BS.ContinuousSensorTypes.indexOf(b));
    console.log("sensorTypes", sensorTypes);
    window.dispatchEvent(new CustomEvent("sensorTypes", { detail: { sensorTypes } }));
  });

  window.addEventListener("createNeuralNetwork", () => {
    isSensorEnabledInput.disabled = true;
  });

  window.addEventListener("loadConfig", () => {
    if (config.sensorTypes.includes(sensorType)) {
      isSensorEnabledInput.checked = true;
      isSensorEnabledInput.dispatchEvent(new Event("input"));
    }
  });

  sensorTypeContainers[sensorType] = sensorTypeContainer;

  sensorTypesContainer.appendChild(sensorTypeContainer);
});

// OUTPUTS

/** @type {HTMLTemplateElement} */
const outputTemplate = document.getElementById("outputTemplate");
/** @type {HTMLElement[]} */
const outputContainers = [];

const outputsContainer = document.getElementById("outputs");

let numberOfOutputs = 0;
/** @type {string[]} */
let outputLabels = [];
function updateOutputLabels() {
  /** @type {string[]} */
  const updatedOutputsLabels = [];

  outputContainers.some((container) => {
    updatedOutputsLabels.push(container.querySelector(".label").value);
    return updatedOutputsLabels.length == numberOfOutputs;
  });

  outputLabels = updatedOutputsLabels;
  //console.log({ outputLabels });

  window.dispatchEvent(new CustomEvent("outputLabels", { detail: { outputLabels } }));
}

function getOutputValues() {
  /** @type {number[]} */
  let outputValues = [];
  outputContainers.some((container) => {
    const outputValue = Number(container.querySelector(".value").value);
    outputValues.push(outputValue);
    return outputValues.length == numberOfOutputs;
  });

  if (task == "classification") {
    outputValues = outputValues.reduce((_outputValues, outputValue, index) => {
      if (outputValue) {
        _outputValues.push(outputLabels[index]);
      }
      return _outputValues;
    }, []);
  } else {
    outputValues = outputValues.reduce((_outputValues, outputValue, index) => {
      _outputValues[outputLabels[index]] = outputValue;
      return _outputValues;
    }, {});
  }

  console.log({ outputValues });
  return outputValues;
}

/** @type {HTMLInputElement} */
const numberOfOutputsInput = document.getElementById("numberOfOutputs");
numberOfOutputsInput.addEventListener("input", () => {
  setNumberOfOutputs(Number(numberOfOutputsInput.value));
});
numberOfOutputsInput.dispatchEvent(new Event("input"));

window.addEventListener("createNeuralNetwork", () => {
  numberOfOutputsInput.disabled = true;
});

/** @param {number} newNumberOfOutputs */
function setNumberOfOutputs(newNumberOfOutputs) {
  numberOfOutputs = newNumberOfOutputs;
  console.log({ numberOfOutputs });

  while (outputContainers.length < numberOfOutputs) {
    /** @type {HTMLElement} */
    const outputContainer = outputTemplate.content.cloneNode(true).querySelector(".output");

    const index = outputContainers.length;
    outputContainer.setAttribute("order", index);

    /** @type {HTMLInputElement} */
    const labelInput = outputContainer.querySelector(".label");
    labelInput.value = `output${index}`;
    labelInput.addEventListener("input", () => updateOutputLabels());

    window.addEventListener("loadConfig", () => {
      labelInput.value = config.outputLabels[index];
    });

    /** @type {HTMLInputElement} */
    const valueInput = outputContainer.querySelector(".value");

    window.addEventListener("createNeuralNetwork", () => {
      labelInput.disabled = true;
      valueInput.disabled = false;

      if (task == "classification") {
        valueInput.step = 1;
      } else {
        valueInput.step = 0.01;
      }
    });

    outputsContainer.appendChild(outputContainer);
    outputContainers.push(outputContainer);
  }

  outputContainers.forEach((outputContainer, index) => {
    if (index < numberOfOutputs) {
      outputsContainer.appendChild(outputContainer);
    } else {
      outputContainer.remove();
    }
  });

  window.dispatchEvent(new CustomEvent("numberOfOutputs", { detail: { numberOfOutputs } }));

  updateOutputLabels();
}

window.addEventListener("loadConfig", () => {
  numberOfOutputsInput.value = config.numberOfOutputs;
  numberOfOutputsInput.dispatchEvent(new Event("input"));
});

window.addEventListener("task", () => {
  if (task == "classification" && numberOfOutputs < 2) {
    setNumberOfOutputs(2);
  }
  numberOfOutputsInput.min = task == "classification" ? 2 : 1;
});

// SAMPLING

let numberOfSamples = 0;
let samplingPeriod = 0;
let samplingRate = 0;

function updateSamplingPeriod() {
  samplingPeriod = (numberOfSamples - 1) * samplingRate;
  samplingPeriodInput.value = samplingPeriod;
  //console.log({ samplingPeriod });
}

/** @type {HTMLInputElement} */
const numberOfSamplesInput = document.getElementById("numberOfSamples");
numberOfSamplesInput.addEventListener("input", () => {
  numberOfSamples = Number(numberOfSamplesInput.value);
  //console.log({ numberOfSamples });
  window.dispatchEvent(new CustomEvent("numberOfSamples", { detail: { numberOfSamples } }));
  updateSamplingPeriod();
});
numberOfSamples = Number(numberOfSamplesInput.value);

/** @type {HTMLInputElement} */
const samplingPeriodInput = document.getElementById("samplingPeriod");

/** @type {HTMLInputElement} */
const samplingRateInput = document.getElementById("samplingRate");

samplingRateInput.addEventListener("input", () => {
  samplingRate = Number(samplingRateInput.value);
  //console.log({ samplingRate });
  samplingPeriodInput.step = samplingRate;
  window.dispatchEvent(new CustomEvent("samplingRate", { detail: { samplingRate } }));
  updateSamplingPeriod();
});
samplingRate = Number(samplingRateInput.value);

updateSamplingPeriod();

window.addEventListener("createNeuralNetwork", () => {
  numberOfSamplesInput.disabled = true;
  samplingRateInput.disabled = true;
});

window.addEventListener("loadConfig", () => {
  numberOfSamplesInput.value = config.numberOfSamples;
  numberOfSamplesInput.dispatchEvent(new Event("input"));

  samplingRateInput.value = config.samplingRate;
  samplingRateInput.dispatchEvent(new Event("input"));
});

// NEURAL NETWORK PARAMETERS

/** @type {number} */
let hiddenUnits;
/** @type {number} */
let learningRate;

/** @type {HTMLInputElement} */
const hiddenUnitsInput = document.getElementById("hiddenUnits");
hiddenUnitsInput.addEventListener("input", () => {
  hiddenUnits = Number(hiddenUnitsInput.value);
  console.log({ hiddenUnits });
  window.dispatchEvent(new CustomEvent("hiddenUnits", { detail: { hiddenUnits } }));
});
hiddenUnitsInput.dispatchEvent(new Event("input"));

/** @type {HTMLInputElement} */
const learningRateInput = document.getElementById("learningRate");
learningRateInput.addEventListener("input", () => {
  learningRate = Number(learningRateInput.value);
  console.log({ learningRate });
  window.dispatchEvent(new CustomEvent("learningRate", { detail: { learningRate } }));
});
learningRateInput.dispatchEvent(new Event("input"));

window.addEventListener("createNeuralNetwork", () => {
  hiddenUnitsInput.disabled = true;
  learningRateInput.disabled = true;
});

window.addEventListener("loadConfig", () => {
  hiddenUnitsInput.value = config.hiddenUnits;
  hiddenUnitsInput.dispatchEvent(new Event("input"));

  learningRateInput.value = config.learningRate;
  learningRateInput.dispatchEvent(new Event("input"));
});

// CREATE NEURAL NETWORK

let neuralNetwork;

function canCreateNeuralNetwork() {
  return (
    !neuralNetwork &&
    selectedDevices.length > 0 &&
    sensorTypes.length > 0 &&
    outputLabels.length >= (task == "classification" ? 2 : 1)
  );
}
function checkIfCanCreateNeuralNetwork() {
  createNeuralNetworkButton.disabled = !canCreateNeuralNetwork();
}

["task", "sensorTypes", "outputLabels", "deviceSelection", "createNeuralNetwork"].forEach((eventType) => {
  window.addEventListener(eventType, () => {
    checkIfCanCreateNeuralNetwork();
  });
});

/** @type {HTMLButtonElement} */
const createNeuralNetworkButton = document.getElementById("createNeuralNetwork");
createNeuralNetworkButton.addEventListener("click", () => {
  if (!canCreateNeuralNetwork()) {
    return;
  }
  neuralNetwork = ml5.neuralNetwork({
    task,
    inputs: getInputs().length,
    outputs: outputLabels,
    hiddenUnits,
    learningRate,
    debug: true,
  });
  console.log({ neuralNetwork });
  window.neuralNetwork = neuralNetwork;
  window.dispatchEvent(new CustomEvent("createNeuralNetwork", { detail: { neuralNetwork } }));
});

window.addEventListener("createNeuralNetwork", () => {
  createNeuralNetworkButton.disabled = true;
});

// ADD DATA

/** @type {BS.SensorConfiguration} */
const sensorConfiguration = {};
window.addEventListener("createNeuralNetwork", () => {
  sensorTypes.forEach((sensorType) => {
    sensorConfiguration[sensorType] = samplingRate;
  });
  console.log({ sensorConfiguration });
});

let isSensorDataEnabled = false;

/** @type {HTMLButtonElement[]} */
const toggleSensorDataInputs = document.querySelectorAll(".toggleSensorData");
toggleSensorDataInputs.forEach((toggleSensorDataInput) => {
  toggleSensorDataInput.addEventListener("input", () => {
    isSensorDataEnabled = toggleSensorDataInput.checked;
    console.log({ isSensorDataEnabled });
    if (isSensorDataEnabled) {
      setSensorConfiguration(sensorConfiguration);
    } else {
      clearSensorConfiguration();
    }
    window.dispatchEvent(new CustomEvent("isSensorDataEnabled", { detail: { isSensorDataEnabled } }));
  });

  window.addEventListener("createNeuralNetwork", () => {
    toggleSensorDataInput.disabled = false;
  });
  window.addEventListener("isSensorDataEnabled", () => {
    toggleSensorDataInput.checked = isSensorDataEnabled;
  });
});

/** @param {BS.SensorConfiguration} sensorConfiguration */
function setSensorConfiguration(sensorConfiguration) {
  selectedDevices.forEach((device) => {
    device.setSensorConfiguration(sensorConfiguration);
  });
}
function clearSensorConfiguration() {
  selectedDevices.forEach((device) => {
    device.clearSensorConfiguration();
  });
}

/** @type {HTMLButtonElement} */
const addDataButton = document.getElementById("addData");
addDataButton.addEventListener("click", () => {
  addData();
});
const updateAddDataButton = () => {
  addDataButton.disabled = !isSensorDataEnabled || isTraining || neuralNetwork.neuralNetwork.isTrained;
};
["isSensorDataEnabled", "training"].forEach((eventType) => {
  window.addEventListener(eventType, () => {
    updateAddDataButton();
  });
});

let addDataContinuously = false;

/** @type {HTMLButtonElement} */
const toggleAddDataContinuouslyInput = document.getElementById("toggleAddDataContinuously");
toggleAddDataContinuouslyInput.addEventListener("input", () => {
  addDataContinuously = toggleAddDataContinuouslyInput.checked;
  console.log({ addDataContinuously });
});
window.addEventListener("createNeuralNetwork", () => {
  toggleAddDataContinuouslyInput.disabled = false;
});

async function addData() {
  addDataButton.disabled = true;
  addDataButton.innerText = "collecting data...";

  const xs = await collectData();
  const ys = getOutputValues();
  console.log({ xs, ys });
  neuralNetwork.addData(xs, ys);

  addDataButton.innerText = "add data";
  addDataButton.disabled = false;

  window.dispatchEvent(new CustomEvent("addData", { detail: { xs, ys } }));

  if (addDataContinuously) {
    addData();
  }
}

/** @typedef {Object.<string, number>} SensorData */
/** @typedef {Object.<string, SensorData[]>} DeviceData */
/** @typedef {BS.DeviceData[]} DevicesData */

/** @param {BS.DeviceData} deviceData */
function didFinishCollectingDeviceData(deviceData) {
  return Object.values(deviceData).every((sensorData) => sensorData.length >= numberOfSamples);
}
/** @param {BS.DevicesData} devicesData */
function didFinishCollectingDevicesData(devicesData) {
  return devicesData.every((deviceData) => {
    return didFinishCollectingDeviceData(deviceData);
  });
}
/** @param {BS.DevicesData} devicesData */
function flattenDevicesData(devicesData) {
  /** @type {number[]} */
  const flattenedDevicesData = [];
  devicesData.forEach((deviceData) => {
    flattenedDevicesData.push(...flattenDeviceData(deviceData));
  });
  console.log({ flattenedDevicesData });
  return flattenedDevicesData;
}

const scalars = {
  pressure: 1 / (2 ** 16 - 1),
  linearAcceleration: 1 / 4,
  gyroscope: 1 / 720,
  magnetometer: 1, // FILL LATER
};
/** @param {BS.DeviceData} deviceData */
function flattenDeviceData(deviceData) {
  /** @type {number[]} */
  const flattenedDeviceData = [];
  for (let sampleIndex = 0; sampleIndex < numberOfSamples; sampleIndex++) {
    sensorTypes.forEach((sensorType) => {
      const sensorData = deviceData[sensorType][sampleIndex];
      const scalar = scalars[sensorType] || 1;
      switch (sensorType) {
        case "acceleration":
        case "gravity":
        case "linearAcceleration":
        case "gyroscope":
        case "magnetometer":
          {
            /** @type {BS.Vector3} */
            const vector3 = sensorData;
            const { x, y, z } = vector3;

            flattenedDeviceData.push(...[x, y, z].map((value) => value * scalar));
          }
          break;
        case "gameRotation":
        case "rotation":
          {
            /** @type {BS.Quaternion} */
            const quaternion = sensorData;
            const { x, y, z, w } = quaternion;
            flattenedDeviceData.push(...[x, y, z, w].map((value) => value * scalar));
          }
          break;
        case "pressure":
          {
            /** @type {BS.PressureData} */
            const pressure = sensorData;
            flattenedDeviceData.push(...pressure.sensors.map((sensor) => sensor.rawValue * scalar));
          }
          break;
        case "barometer":
          {
            // FILL
          }
          break;
      }
    });
  }
  return flattenedDeviceData.map((value) => (value == 0 ? 0.000001 * Math.random() : value));
}

/** @returns {Promise<number[]>} */
async function collectData() {
  return new Promise((resolve) => {
    /** @type {BS.DevicesData} */
    const devicesData = [];

    selectedDevices.forEach((device, index) => {
      /** @type {BS.DeviceData} */
      const deviceData = {};
      sensorTypes.forEach((sensorType) => {
        deviceData[sensorType] = [];
      });
      devicesData[index] = deviceData;

      const onDeviceSensorData = (event) => {
        /** @type {BS.ContinuousSensorType} */
        const sensorType = event.message.sensorType;

        if (!(sensorType in deviceData)) {
          return;
        }

        if (didFinishCollectingDeviceData(deviceData)) {
          console.log(`finished collecting data for device #${index}`);
          device.removeEventListener("sensorData", onDeviceSensorData);

          if (didFinishCollectingDevicesData(devicesData)) {
            console.log(`finished collecting devices data`);
            const flattenedDevicesData = flattenDevicesData(devicesData);
            resolve(flattenedDevicesData);
          }
          return;
        }

        if (deviceData[sensorType].length == numberOfSamples) {
          console.log(`finished collecting ${sensorType} data for device #${index}`);
          return;
        }

        const { [sensorType]: data } = event.message;
        deviceData[sensorType].push(data);
      };

      device.addEventListener("sensorData", onDeviceSensorData);
    });
  });
}

// THROTTLED FUNCTION

class ThrottledFunction {
  /**
   * @param {()=>{}} callback
   * @param {number} interval
   */
  constructor(callback, interval = 0) {
    this.callback = callback;
    this.interval = interval;
  }

  interval = 0;

  /** @type {()=>{}} */
  callback;

  #lastTimeTriggered = 0;

  trigger() {
    const now = Date.now();
    const timeSinceLastTimeTriggered = now - this.#lastTimeTriggered;
    if (timeSinceLastTimeTriggered < this.interval) {
      return;
    }
    this.callback();
    this.#lastTimeTriggered = now;
  }
}

// THRESHOLDS

const onThresholdReached = () => {
  if (!neuralNetwork) {
    return;
  }

  if (!neuralNetwork.neuralNetwork.isTrained) {
    if (!isTraining) {
      addData();
    }
  } else {
    test(false);
  }
};
const throttledOnThresholdReached = new ThrottledFunction(onThresholdReached);

let thresholdsEnabled = true;
/** @param {boolean} newThresholdsEnabled */
function setThresholdsEnabled(newThresholdsEnabled) {
  thresholdsEnabled = newThresholdsEnabled;
  console.log({ thresholdsEnabled });
  window.dispatchEvent(new CustomEvent("thresholdsEnabled", { detail: { thresholdsEnabled } }));
}
window.addEventListener("loadConfig", () => {
  toggleThresholdsInput.checked = config.thresholdsEnabled;
  toggleThresholdsInput.dispatchEvent(new Event("input"));
});

/** @type {HTMLInputElement} */
const toggleThresholdsInput = document.getElementById("toggleThresholds");
toggleThresholdsInput.addEventListener("input", () => {
  setThresholdsEnabled(toggleThresholdsInput.checked);
});

let captureDelay = 0;

/** @type {HTMLInputElement} */
const captureDelayInput = document.getElementById("captureDelay");
captureDelayInput.addEventListener("input", () => {
  captureDelay = Number(captureDelayInput.value);
  console.log({ captureDelay });
  throttledOnThresholdReached.interval = captureDelay;
  window.dispatchEvent(new CustomEvent("captureDelay", { detail: { captureDelay } }));
});
captureDelayInput.dispatchEvent(new Event("input"));
window.addEventListener("loadConfig", () => {
  captureDelayInput.value = config.captureDelay;
  captureDelayInput.dispatchEvent(new Event("input"));
});

/** @type {BS.ContinuousSensorType[]} */
const thresholdSensorTypes = ["linearAcceleration"];

const thresholdsContainer = document.getElementById("thresholds");
const thresholdTemplate = document.getElementById("thresholdTemplate");
/** @type {Object.<string, HTMLElement>} */
const thresholdContainers = {};

thresholdSensorTypes.forEach((sensorType) => {
  const thresholdContainer = thresholdTemplate.content.cloneNode(true).querySelector(".threshold");

  thresholdContainer.querySelector(".sensorType").innerText = sensorType;

  /** @type {HTMLMeterElement} */
  const meterElement = thresholdContainer.querySelector(".meter");

  const dispatchEvent = () =>
    window.dispatchEvent(new CustomEvent("threshold", { detail: { sensorType, enabled, threshold } }));

  let enabled = false;
  /** @type {HTMLInputElement} */
  const toggleThresholdInput = thresholdContainer.querySelector(".toggle");
  toggleThresholdInput.addEventListener("input", () => {
    enabled = toggleThresholdInput.checked;
    console.log({ sensorType, enabled });
    thresholdInput.disabled = !enabled;
    meterElement.disabled = !enabled;
    dispatchEvent();
  });

  let threshold = 0;
  /** @type {HTMLInputElement} */
  const thresholdInput = thresholdContainer.querySelector(".threshold");
  thresholdInput.addEventListener("input", () => {
    threshold = Number(thresholdInput.value);
    meterElement.low = threshold;
    console.log({ sensorType, threshold });
    dispatchEvent();
  });

  let min = 0;
  let max = 0;
  switch (sensorType) {
    case "linearAcceleration":
      min = 0.01;
      max = 0.5;
      break;
    case "gyroscope":
      min = 0.5;
      max = 1.5;
      break;
  }
  threshold = min;

  thresholdInput.min = min;
  thresholdInput.max = max;
  thresholdInput.value = max;

  meterElement.min = min;
  meterElement.max = max;
  meterElement.value = min;
  meterElement.low = Number(thresholdInput.value);

  window.addEventListener("loadConfig", () => {
    const thresholdInfo = config.thresholds[sensorType];
    if (!thresholdInfo) {
      return;
    }

    const { enabled, threshold } = thresholdInfo;

    thresholdInput.value = threshold;
    thresholdInput.dispatchEvent(new Event("input"));

    toggleThresholdInput.checked = enabled;
    toggleThresholdInput.dispatchEvent(new Event("input"));
  });

  window.addEventListener("thresholdsEnabled", () => {
    toggleThresholdInput.disabled = !thresholdsEnabled;

    const disabled = toggleThresholdInput.disabled || !toggleThresholdInput.checked;
    thresholdInput.disabled = disabled;
    meterElement.disabled = disabled;
  });

  window.addEventListener(`threshold.${sensorType}`, (event) => {
    if (!enabled) {
      return;
    }

    /** @type {number} */
    const value = event.detail.value;
    meterElement.value = value;

    //console.log({ sensorType, value });

    const reachedThreshold = value >= threshold;
    if (reachedThreshold) {
      //console.log(`reached ${sensorType} threshold`);
      throttledOnThresholdReached.trigger();
    }
  });

  thresholdContainers[sensorType] = thresholdContainer;
  thresholdsContainer.appendChild(thresholdContainer);
});

const thresholdVector = new THREE.Vector3();
/** @param {BS.Vector3} vector */
function getVectorMagnitude(vector) {
  const { x, y, z } = vector;
  thresholdVector.set(x, y, z);
  return thresholdVector.length();
}

const thresholdEuler = new THREE.Euler();
const thresholdQuaternion = new THREE.Quaternion();
const identityQuaternion = new THREE.Quaternion();
/** @param {BS.Vector3} euler */
function getEulerMagnitude(euler) {
  const { x, y, z } = euler;
  thresholdEuler.set(...[x, y, z].map((value) => THREE.MathUtils.degToRad(value)));
  thresholdQuaternion.setFromEuler(thresholdEuler);
  return thresholdQuaternion.angleTo(identityQuaternion);
}

window.addEventListener(
  "createNeuralNetwork",
  () => {
    if (selectedDevices.length == 1) {
      selectedDevices[0].addEventListener("sensorData", (event) => {
        if (!thresholdsEnabled) {
          return;
        }

        /** @type {BS.ContinuousSensorType} */
        const sensorType = event.message.sensorType;
        if (!thresholdSensorTypes.includes(sensorType)) {
          return;
        }

        const { [sensorType]: data } = event.message;
        let value = 0;
        switch (sensorType) {
          case "linearAcceleration":
            value = getVectorMagnitude(data);
            break;
          case "gyroscope":
            value = getEulerMagnitude(data);
            break;
          default:
            throw Error(`uncaught sensorType ${sensorType}`);
        }
        window.dispatchEvent(new CustomEvent(`threshold.${sensorType}`, { detail: { value } }));
      });
    }
  },
  { once: true }
);

// TRAIN NEURAL NETWORK

/** @type {number} */
let epochs;
/** @type {number} */
let batchSize;

/** @type {HTMLInputElement} */
const epochsInput = document.getElementById("epochs");
epochsInput.addEventListener("input", () => {
  epochs = Number(epochsInput.value);
  console.log({ epochs });
  window.dispatchEvent(new CustomEvent("epochs", { detail: { epochs } }));
});
epochsInput.dispatchEvent(new Event("input"));

/** @type {HTMLInputElement} */
const batchSizeInput = document.getElementById("batchSize");
batchSizeInput.addEventListener("input", () => {
  batchSize = Number(batchSizeInput.value);
  console.log({ batchSize });
  window.dispatchEvent(new CustomEvent("batchSize", { detail: { batchSize } }));
});
batchSizeInput.dispatchEvent(new Event("input"));

window.addEventListener("loadConfig", () => {
  batchSizeInput.value = config.batchSize;
  batchSizeInput.dispatchEvent(new Event("input"));

  epochsInput.value = config.epochs;
  epochsInput.dispatchEvent(new Event("input"));
});

let isTraining = false;

/** @type {HTMLButtonElement} */
const trainButton = document.getElementById("train");
trainButton.addEventListener("click", () => {
  train();
});

let didNormalizeData = false;
function train() {
  if (!didNormalizeData) {
    //neuralNetwork.normalizeData(); // pre-normalize data
    didNormalizeData = true;
  }

  isTraining = true;
  window.dispatchEvent(new CustomEvent("training", { detail: { isTraining } }));

  setTimeout(() => {
    neuralNetwork.train(
      {
        epochs,
        batchSize,
      },
      () => {
        isTraining = false;
        window.dispatchEvent(new CustomEvent("finishedTraining"));
      }
    );
  }, 0);
}

window.addEventListener(
  "addData",
  () => {
    trainButton.disabled = false;
  },
  { once: true }
);
window.addEventListener("loadData", () => {
  trainButton.disabled = false;
});

window.addEventListener("training", () => {
  batchSizeInput.disabled = true;
  epochsInput.disabled = true;

  trainButton.disabled = true;
  trainButton.innerText = "training...";
});

window.addEventListener("finishedTraining", () => {
  batchSizeInput.disabled = false;
  epochsInput.disabled = false;

  trainButton.disabled = false;
  trainButton.innerText = "train";
});

// CLASSIFY & PREDICT

let testContinuously = false;
/** @type {HTMLInputElement} */
const toggleTestContinuouslyInput = document.getElementById("toggleTestContinuously");
toggleTestContinuouslyInput.addEventListener("input", () => {
  testContinuously = toggleTestContinuouslyInput.checked;
  console.log({ testContinuously });
});
window.addEventListener("training", () => {
  toggleAddDataContinuouslyInput.disabled = true;
});
window.addEventListener("finishedTraining", () => {
  toggleAddDataContinuouslyInput.disabled = false;
});

/** @type {HTMLButtonElement} */
const testButton = document.getElementById("test");
testButton.addEventListener("click", () => {
  test();
});
const updateTestButton = () => {
  const enabled = neuralNetwork?.neuralNetwork?.isTrained && isSensorDataEnabled && !isTesting;
  testButton.disabled = !enabled;
};
["training", "loadModel", "finishedTraining", "isSensorDataEnabled"].forEach((eventType) => {
  window.addEventListener(eventType, () => {
    updateTestButton();
  });
});

/** @type {HTMLPreElement} */
const resultsPreElement = document.getElementById("results");

/**
 * @typedef Result
 * @type {Object}
 * @property {string} label
 * @property {number} confidence
 */

/**
 * @param {string} error
 * @param {Result[]} results
 */
const handleResults = (error, results) => {
  isTesting = false;

  testButton.disabled = false;
  testButton.innerText = "test";

  if (error) {
    console.error(error);
    return;
  }

  console.log({ results });
  resultsPreElement.textContent = JSON.stringify(results, null, 2);

  if (testContinuously) {
    test();
  }
};

let isTesting = false;
async function test(allowOverlapping = true) {
  if (isTesting && !allowOverlapping) {
    return;
  }

  testButton.disabled = true;
  testButton.innerText = "testing...";

  const data = await collectData();
  console.log({ data });
  if (task == "classification") {
    neuralNetwork.classify(data, handleResults);
  } else {
    neuralNetwork.predict(data, handleResults);
  }
}

// SAVE

/** @type {HTMLButtonElement} */
const saveDataButton = document.getElementById("saveData");
saveDataButton.addEventListener("click", () => {
  console.log("saveData");
  neuralNetwork.saveData();
});
window.addEventListener("finishedTraining", () => {
  saveDataButton.disabled = false;
});

/** @type {HTMLButtonElement} */
const saveModelButton = document.getElementById("saveModel");
saveModelButton.addEventListener("click", () => {
  console.log("saveModel");
  neuralNetwork.save();
});
window.addEventListener("finishedTraining", () => {
  saveModelButton.disabled = false;
});

// LOAD

/** @type {HTMLInputElement} */
const loadDataInput = document.getElementById("loadData");
loadDataInput.addEventListener("input", () => {
  neuralNetwork.loadData(loadDataInput.files, () => {
    console.log("loaded data");
    loadDataInput.value = "";
    window.dispatchEvent(new CustomEvent("loadData"));
  });
});
window.addEventListener("createNeuralNetwork", () => {
  loadDataInput.disabled = false;
});

/** @type {HTMLInputElement} */
const loadModelInput = document.getElementById("loadModel");
loadModelInput.addEventListener("input", () => {
  neuralNetwork.load(loadModelInput.files, () => {
    console.log("loaded model");
    loadModelInput.value = "";
    window.dispatchEvent(new CustomEvent("loadModel"));
  });
});
window.addEventListener("createNeuralNetwork", () => {
  loadModelInput.disabled = false;
});

// TENSORFLOW LITE

/** @param {()=>{}} callback */
function getModel(callback) {
  if (selectedDevices.length == 1 && neuralNetwork?.neuralNetwork.isTrained) {
    neuralNetwork.neuralNetwork.model.save(
      ml5.tf.io.withSaveHandler(async (data) => {
        const weightsManifest = {
          modelTopology: data.modelTopology,
          weightsManifest: [
            {
              paths: [`./model.weights.bin`],
              weights: data.weightSpecs,
            },
          ],
        };
        callback(data.weightData, weightsManifest);
      })
    );
  }
}

const { seedrandom } = Math;
const SEED = "brilliantsole";

/**
 * @param {number[]} inputs
 * @param {number[]} outputs
 */
function shuffleData(inputs, outputs) {
  const rand = new seedrandom(SEED);

  const indexes = inputs.map((_, i) => i);
  indexes.sort(() => rand() - 0.5);

  const shuffledInputs = [];
  const shuffledOutputs = [];

  indexes.forEach((i, j) => {
    shuffledInputs[j] = inputs[i];
    shuffledOutputs[j] = outputs[i];
  });

  return [shuffledInputs, shuffledOutputs];
}

function splitArray(data, fract) {
  const splitPoint = Math.round(data.length * fract);
  const a = data.slice(0, splitPoint);
  const b = data.slice(splitPoint, data.length);
  return [a, b];
}

function shuffleAndSplitDataSet([X, Y], splitRatio = 0.8) {
  const [shuffled_X, shuffled_Y] = shuffleData(X, Y);
  const [train_X, test_X] = splitArray(shuffled_X, splitRatio);
  const [train_Y, test_Y] = splitArray(shuffled_Y, splitRatio);

  return [train_X, train_Y, test_X, test_Y];
}

function rescale(minIn, maxIn, minOut, maxOut, [X, Y]) {
  const rescaledX = [];
  const a = minOut - minIn;
  const scaleRatio = (maxOut - minOut) / (maxIn - minIn);

  X.forEach((row) => {
    rescaledX.push(row.map((v) => (v + a) * scaleRatio));
  });
  return [rescaledX, Y];
}

function prepareDataSet() {
  const inputs = [];
  const outputs = [];

  neuralNetwork.data.training.forEach(({ xs, ys }, index) => {
    const input = [];
    for (const key in xs) {
      input.push(xs[key]);
    }
    inputs.push(input);

    const output = [];
    for (const key in ys) {
      const value = ys[key];
      if (value instanceof Array) {
        output.push(...ys[key]);
      } else {
        output.push(ys[key]);
      }
    }
    outputs.push(output);
  });

  console.log({ inputs, outputs });

  return [inputs, outputs];
}

function downloadBlob(blob, fileName) {
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  const url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
}

const defaultPythonServerUrl = `${location.origin}:8080`;
/** @type {string} */
let pythonServerUrl = defaultPythonServerUrl;

/** @type {HTMLInputElement} */
const pythonServerUrlInput = document.getElementById("pythonServerUrl");
pythonServerUrlInput.addEventListener("input", () => {
  pythonServerUrl = pythonServerUrlInput.value || defaultPythonServerUrl;
  console.log({ pythonServerUrl });
  window.dispatchEvent(new CustomEvent("pythonServerUrl", { detail: { pythonServerUrl } }));
});

window.addEventListener("loadConfig", () => {
  pythonServerUrlInput.value = config.pythonServerUrl;
  pythonServerUrlInput.dispatchEvent(new Event("input"));
});

let quantizeModel = false;
/** @type {HTMLInputElement} */
const toggleQuantizeModelInput = document.getElementById("toggleQuantizeModel");
toggleQuantizeModelInput.addEventListener("input", () => {
  quantizeModel = toggleQuantizeModelInput.checked;
  console.log({ quantizeModel });
});

let trainTestSplit = 0.2;
let isConvertingModel = false;
const tfLiteFiles = {
  /** @type {File?} */
  tfLite_model_cpp: null,
  /** @type {File?} */
  model_tflite: null,
};

/** @type {HTMLButtonElement} */
const convertModelToTfliteButton = document.getElementById("convertModelToTflite");
convertModelToTfliteButton.addEventListener("click", () => {
  convertModelToTfliteButton.disabled = true;
  convertModelToTfliteButton.innerText = "converting model to tflite...";
  convertModelToTflite();
});
window.addEventListener("convertModelToTflite", () => {
  convertModelToTfliteButton.disabled = false;
  convertModelToTfliteButton.innerText = "convert model to tflite";
});

async function convertModelToTflite() {
  if (isConvertingModel) {
    return;
  }
  isConvertingModel = true;

  neuralNetwork.neuralNetwork.model
    .save(
      ml5.tf.io.browserHTTPRequest(`${pythonServerUrl}/convert?${quantizeModel ? "quantize=true" : ""}`, {
        fetchFunc: (url, req) => {
          if (quantizeModel) {
            const [, , test_x] = shuffleAndSplitDataSet(prepareDataSet(), 1 - trainTestSplit);
            console.log({ test_x });
            req.body.append("quantize_data", JSON.stringify(test_x));
          }

          console.log({ url, req });

          return fetch(url, req);
        },
      })
    )
    .then((result) => {
      console.log({ result });
      const res = result.responses[0];
      res
        .arrayBuffer() // Download gzipped tar file and get ArrayBuffer
        .then(pako.inflate) // Decompress gzip using pako
        .then((arr) => arr.buffer) // Get ArrayBuffer from the Uint8Array pako returns
        .then(untar) // Untar
        .then((files) => {
          // js-untar returns a list of files (See https://github.com/InvokIT/js-untar#file-object for details)
          console.log("received files", files);
          const tfLite_model_cpp = files.find((file) => file.name === "tfLite_model.cpp");
          const model_tflite = files.find((file) => file.name === "model.tflite");
          console.log({ tfLite_model_cpp, model_tflite });
          isConvertingModel = false;
          Object.assign(tfLiteFiles, { tfLite_model_cpp, model_tflite });
          window.dispatchEvent(new CustomEvent("convertModelToTflite", { detail: { tfLiteFiles, files } }));
          window.dispatchEvent(new CustomEvent("tflite", { detail: { tfliteModel: model_tflite } }));
        });
    })
    .catch((error) => {
      console.log(error);
      isConvertingModel = false;

      convertModelToTfliteButton.disabled = false;
      convertModelToTfliteButton.innerText = "convert model to tflite";
    });
}

/** @type {HTMLButtonElement} */
const downloadTfliteButton = document.getElementById("downloadTflite");
downloadTfliteButton.addEventListener("click", () => {
  downloadBlob(tfLiteFiles.model_tflite.blob, "model.tflite");
  downloadBlob(tfLiteFiles.tfLite_model_cpp.blob, "tflite_model.cpp");
});
window.addEventListener("convertModelToTflite", () => {
  downloadTfliteButton.disabled = false;
});

/** @type {HTMLInputElement} */
const loadTfliteInput = document.getElementById("loadTflite");
loadTfliteInput.addEventListener("input", () => {
  const tfliteModel = loadTfliteInput.files[0];
  if (tfliteModel) {
    console.log({ tfliteModel });
    tfLiteFiles.model_tflite = tfliteModel;
    window.dispatchEvent(new CustomEvent("tflite", { detail: { tfliteModel } }));
  }
});

/** @type {HTMLButtonElement} */
const transferTfliteButton = document.getElementById("transferTflite");
transferTfliteButton.addEventListener("click", async () => {
  const device = selectedDevices[0];
  if (device.fileTransferStatus == "idle") {
    await device.setTfliteSampleRate(samplingRate);
    await device.setTfliteTask(task);
    await device.setTfliteSensorTypes(sensorTypes);
    device.sendFile("tflite", tfLiteFiles.model_tflite);
  } else {
    device.cancelFileTransfer();
  }
});

["createNeuralNetwork", "tflite"].forEach((eventType) => {
  window.addEventListener(eventType, () => {
    updateTransferTfliteButton();
  });
});
const updateTransferTfliteButton = () => {
  const enabled = tfLiteFiles.model_tflite && neuralNetwork && selectedDevices.length == 1;
  transferTfliteButton.disabled = !enabled;

  if (!enabled) {
    return;
  }

  /** @type {String} */
  let innerText;
  switch (selectedDevices[0].fileTransferStatus) {
    case "idle":
      innerText = "transfer file";
      break;
    case "sending":
      innerText = "stop transferring file";
      break;
  }
  transferTfliteButton.innerText = innerText;
};

/** @type {HTMLProgressElement} */
const transferTfliteProgress = document.getElementById("transferTfliteProgress");
window.addEventListener(
  "createNeuralNetwork",
  () => {
    if (selectedDevices.length == 1) {
      const device = selectedDevices[0];
      device.addEventListener("fileTransferStatus", () => {
        transferTfliteButton.innerText = device.fileTransferStatus == "idle" ? "send file" : "stop sending file";

        switch (device.fileTransferStatus) {
          case "idle":
            transferTfliteButton.innerText = "send file";
            transferTfliteProgress.value = 0;
            break;
          case "sending":
            transferTfliteButton.innerText = "stop sending file";
            break;
        }
      });
      device.addEventListener("fileTransferProgress", (event) => {
        transferTfliteProgress.value = event.message.progress;
      });
    }
  },
  { once: true }
);

/** @type {HTMLButtonElement} */
const toggleTfliteInferencingEnabledButton = document.getElementById("toggleTfliteInferencingEnabled");
toggleTfliteInferencingEnabledButton.addEventListener("click", () => {
  selectedDevices[0].toggleTfliteInferencing();
  toggleTfliteInferencingEnabledButton.disabled = true;
});

/** @type {HTMLInputElement} */
const setTfliteIsReadyInput = document.getElementById("tfliteIsReady");

/** @type {HTMLPreElement} */
const tfliteInferencePre = document.getElementById("tfliteInference");

window.addEventListener(
  "createNeuralNetwork",
  () => {
    if (selectedDevices.length == 1) {
      const device = selectedDevices[0];

      device.addEventListener("tfliteIsReady", (e) => {
        setTfliteIsReadyInput.checked = device.tfliteIsReady;
      });

      device.addEventListener("tfliteIsReady", () => {
        toggleTfliteInferencingEnabledButton.disabled = !device.tfliteIsReady;
      });
      device.addEventListener("getTfliteInferencingEnabled", () => {
        toggleTfliteInferencingEnabledButton.innerText = device.tfliteInferencingEnabled
          ? "disable inferencing"
          : "enable inferencing";
        toggleTfliteInferencingEnabledButton.disabled = false;
      });

      device.addEventListener("tfliteInference", (event) => {
        tfliteInferencePre.textContent = JSON.stringify(event.message.tfliteInference, null, 2);
      });
    }
  },
  { once: true }
);

["finishedTraining", "loadModel"].forEach((eventType) => {
  window.addEventListener(eventType, () => {
    if (selectedDevices.length != 1) {
      return;
    }
    convertModelToTfliteButton.disabled = false;
  });
});

// CONFIG

const configLocalStorageKey = "BS.MachineLearning.Config";

const config = {
  task,

  sensorTypes,

  numberOfOutputs,
  outputLabels,

  numberOfSamples,
  samplingRate,

  learningRate,
  hiddenUnits,

  thresholdsEnabled,
  captureDelay,
  thresholds: {},

  epochs,
  batchSize,

  pythonServerUrl,
};
window.config = config;

function loadConfigFromLocalStorage() {
  const configString = localStorage.getItem(configLocalStorageKey);
  if (!configString) {
    return;
  }
  const loadedConfig = JSON.parse(configString);
  console.log("loaded config", loadedConfig);
  Object.assign(config, loadedConfig);
  window.dispatchEvent(new CustomEvent("loadConfig", { detail: { config } }));
}
loadConfigFromLocalStorage();

Object.keys(config).forEach((type) => {
  let eventType = type;

  switch (type) {
    case "thresholds":
      eventType = "threshold";
      break;
  }

  window.addEventListener(eventType, (event) => {
    switch (type) {
      case "task":
        config.task = task;
        break;

      case "sensorTypes":
        config.sensorTypes = sensorTypes;
        break;

      case "numberOfOutputs":
        config.numberOfOutputs = numberOfOutputs;
        break;
      case "outputLabels":
        config.outputLabels = outputLabels;
        break;

      case "numberOfSamples":
        config.numberOfSamples = numberOfSamples;
        break;
      case "samplingRate":
        config.samplingRate = samplingRate;
        break;

      case "learningRate":
        config.learningRate = learningRate;
        break;
      case "hiddenUnits":
        config.hiddenUnits = hiddenUnits;
        break;

      case "thresholdsEnabled":
        config.thresholdsEnabled = thresholdsEnabled;
        break;
      case "captureDelay":
        config.captureDelay = captureDelay;
        break;
      case "thresholds":
        {
          const { sensorType, threshold, enabled } = event.detail;
          config.thresholds[sensorType] = { threshold, enabled };
        }
        break;

      case "batchSize":
        config.batchSize = batchSize;
        break;
      case "epochs":
        config.epochs = epochs;
        break;

      case "pythonServerUrl":
        config.pythonServerUrl = pythonServerUrl;
        break;
    }

    saveConfigToLocalStorage();
  });
});

function saveConfigToLocalStorage() {
  console.log("saving config", config);
  localStorage.setItem(configLocalStorageKey, JSON.stringify(config));
}
