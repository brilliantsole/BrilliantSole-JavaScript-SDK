import BS from "../../build/brilliantsole.module.js";
window.BS = BS;
console.log({ BS });
//BS.setAllConsoleLevelFlags({ log: false });

// VIBRATION

/**
 * vibrates all connected insoles with a single waveformEffect - use to indicate stuff
 * @param {import("../../build/brilliantsole.module.js").VibrationWaveformEffect} effect
 */
function vibrate(effect) {
    BS.Device.ConnectedDevices.forEach((device) => {
        device.triggerVibration({
            type: "waveformEffect",
            waveformEffect: { segments: [{ effect }] },
        });
    });
}

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

BS.Device.AddEventListener("deviceConnected", (event) => {
    /** @type {Device} */
    const device = event.message.device;
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
    device.addEventListener("not connected", () => {
        connectedDeviceContainer.remove();
    });

    /** @type {HTMLButtonElement} */
    const toggleSelectonButton = connectedDeviceContainer.querySelector(".toggleSelection");
    toggleSelectonButton.addEventListener("click", () => {
        toggleSelectonButton.disabled = true;
        toggleDeviceSelection(device);
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

/** @type {Device[]} */
const selectedDevices = [];
/** @param {Device} device */
function isDeviceSelected(device) {
    return selectedDevices.includes(device);
}

/** @param {Device} device */
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

        selectedDeviceContainers[device.id] = selectedDeviceContainer;
    }

    selectedDevicesContainer.appendChild(selectedDeviceContainer);

    window.dispatchEvent(new CustomEvent("deviceSelection", { detail: { device } }));
}

/** @param {Device} device */
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

/** @param {Device} device */
function toggleDeviceSelection(device) {
    if (isDeviceSelected(device)) {
        deselectDevice(device);
    } else {
        selectDevice(device);
    }
}

// TASK

/** @type {"classification" | "regression"} */
let task = "classification";

/** @type {HTMLSelectElement} */
const taskSelect = document.getElementById("task");
taskSelect.addEventListener("input", () => {
    task = taskSelect.value;
    console.log({ task });
    window.dispatchEvent(new CustomEvent("task", { detail: { task } }));
});
taskSelect.dispatchEvent(new Event("input"));

window.addEventListener("createNeuralNetwork", () => {
    taskSelect.disabled = true;
});

// INPUTS

/** @typedef {import("../../build/brilliantsole.module.js").SensorType} SensorType */

/** @type {SensorType[]} */
let inputs = [];

const sensorInputsContainer = document.getElementById("sensorInputs");
/** @type {HTMLTemplateElement} */
const sensorInputTemplate = document.getElementById("sensorInputTemplate");
/** @type {Object.<string, HTMLElement>} */
const sensorInputContainers = {};

BS.Device.SensorTypes.forEach((sensorType) => {
    const sensorInputContainer = sensorInputTemplate.content.cloneNode(true).querySelector(".sensorInput");
    sensorInputContainer.querySelector(".name").innerText = sensorType;

    /** @type {HTMLInputElement} */
    const isSensorEnabledInput = sensorInputContainer.querySelector(".enabled");
    isSensorEnabledInput.addEventListener("input", () => {
        if (isSensorEnabledInput.checked) {
            inputs.push(sensorType);
        } else {
            inputs.splice(inputs.indexOf(sensorType), 1);
        }
        inputs.sort((a, b) => BS.Device.SensorTypes.indexOf(a) - BS.Device.SensorTypes.indexOf(b));
        console.log("inputs", inputs);
        window.dispatchEvent(new CustomEvent("inputs", { detail: { inputs } }));
    });

    window.addEventListener("createNeuralNetwork", () => {
        isSensorEnabledInput.disabled = true;
    });

    sensorInputContainers[sensorType] = sensorInputContainer;

    sensorInputsContainer.appendChild(sensorInputContainer);
});

// OUTPUTS

/** @type {HTMLTemplateElement} */
const outputTemplate = document.getElementById("outputTemplate");
/** @type {HTMLElement[]} */
const outputContainers = [];

const outputsContainer = document.getElementById("outputs");

let numberOfOutputs = 0;
/** @type {string[]} */
let outputs = [];
function updateOutputs() {
    /** @type {string[]} */
    const updatedOutputs = [];

    outputContainers.some((container) => {
        updatedOutputs.push(container.querySelector(".label").value);
        return updatedOutputs.length == numberOfOutputs;
    });

    outputs = updatedOutputs;
    console.log({ outputs });

    window.dispatchEvent(new CustomEvent("outputs", { detail: { outputs } }));
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
        labelInput.addEventListener("input", () => updateOutputs());

        /** @type {HTMLInputElement} */
        const valueInput = outputContainer.querySelector(".value");

        window.addEventListener("createNeuralNetwork", () => {
            labelInput.disabled = true;
            valueInput.disabled = true;
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

    updateOutputs();
}

window.addEventListener("task", () => {
    if (task == "classification" && numberOfOutputs < 2) {
        setNumberOfOutputs(2);
    }
    numberOfOutputsInput.setAttribute("min", task == "classification" ? 2 : 1);
});

// SAMPLING

let numberOfSamples = 0;
let samplingPeriod = 0;
let samplingRate = 0;

function updateSamplingPeriod() {
    samplingPeriod = (numberOfSamples - 1) * samplingRate;
    samplingPeriodInput.value = samplingPeriod;
    console.log({ samplingPeriod });
}

/** @type {HTMLInputElement} */
const numberOfSamplesInput = document.getElementById("numberOfSamples");
numberOfSamplesInput.addEventListener("input", () => {
    numberOfSamples = Number(numberOfSamplesInput.value);
    console.log({ numberOfSamples });
    updateSamplingPeriod();
});
numberOfSamples = Number(numberOfSamplesInput.value);

/** @type {HTMLInputElement} */
const samplingPeriodInput = document.getElementById("samplingPeriod");

/** @type {HTMLInputElement} */
const samplingRateInput = document.getElementById("samplingRate");

samplingRateInput.addEventListener("input", () => {
    samplingRate = Number(samplingRateInput.value);
    console.log({ samplingRate });
    samplingPeriodInput.step = samplingRate;
    updateSamplingPeriod();
});
samplingRate = Number(samplingRateInput.value);

updateSamplingPeriod();

window.addEventListener("createNeuralNetwork", () => {
    numberOfSamplesInput.disabled = true;
    samplingRateInput.disabled = true;
});

// THRESHOLDS

let thresholdsEnabled = true;
/** @param {boolean} newThresholdsEnabled */
function setThresholdsEnabled(newThresholdsEnabled) {
    thresholdsEnabled = newThresholdsEnabled;
    console.log({ thresholdsEnabled });
    window.dispatchEvent(new CustomEvent("thresholdsEnabled", { detail: { thresholdsEnabled } }));
}

/** @type {HTMLInputElement} */
const toggleThresholdsInput = document.getElementById("toggleThresholds");
toggleThresholdsInput.addEventListener("input", () => {
    setThresholdsEnabled(toggleThresholdsInput.checked);
});

/** @type {SensorType[]} */
const thresholdSensorTypes = ["linearAcceleration", "gyroscope"];

const thresholdsContainer = document.getElementById("thresholds");
const thresholdTemplate = document.getElementById("thresholdTemplate");
/** @type {Object.<string, HTMLElement>} */
const thresholdContainers = {};

thresholdSensorTypes.forEach((sensorType) => {
    const thresholdContainer = thresholdTemplate.content.cloneNode(true).querySelector(".threshold");

    let enabled = false;

    /** @type {HTMLInputElement} */
    const toggleThresholdInput = thresholdContainer.querySelector(".toggle");
    toggleThresholdInput.addEventListener("input", () => {
        enabled = toggleThresholdInput.checked;
        console.log({ sensorType, enabled });
        thresholdInput.disabled = !enabled;
        meterElement.disabled = !enabled;
    });

    // FILL - update thresholds for input and meter based on sensorType

    let threshold = 0;
    /** @type {HTMLInputElement} */
    const thresholdInput = thresholdContainer.querySelector(".threshold");
    thresholdInput.addEventListener("input", () => {
        threshold = thresholdInput.value;
        meterElement.low = threshold;
        console.log({ sensorType, threshold });
    });

    /** @type {HTMLMeterElement} */
    const meterElement = thresholdContainer.querySelector(".meter");

    thresholdContainer.querySelector(".sensorType").innerText = sensorType;

    window.addEventListener("thresholdsEnabled", () => {
        toggleThresholdInput.disabled = !thresholdsEnabled;

        const disabled = toggleThresholdInput.disabled || !toggleThresholdInput.checked;
        thresholdInput.disabled = disabled;
        meterElement.disabled = disabled;
    });

    // FILL - update meter

    // FILL - check thresholds
    let reachedThreshold = false;

    // FILL - listen for primary device sensorData

    thresholdContainers[sensorType] = thresholdContainer;
    thresholdsContainer.appendChild(thresholdContainer);
});

// CAPTURE DELAY

let captureDelay = 0;

/** @type {HTMLInputElement} */
const captureDelayInput = document.getElementById("captureDelay");
captureDelayInput.addEventListener("input", () => {
    captureDelay = Number(captureDelayInput.value);
    console.log({ captureDelay });
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
});
hiddenUnitsInput.dispatchEvent(new Event("input"));

/** @type {HTMLInputElement} */
const learningRateInput = document.getElementById("learningRate");
learningRateInput.addEventListener("input", () => {
    learningRate = Number(learningRateInput.value);
    console.log({ learningRate });
});
learningRateInput.dispatchEvent(new Event("input"));

// CREATE NEURAL NETWORK

let neuralNetwork;

function canCreateNeuralNetwork() {
    return !neuralNetwork && inputs.length > 0 && outputs.length >= (task == "classification" ? 2 : 1);
}
function checkIfCanCreateNeuralNetwork() {
    createNeuralNetworkButton.disabled = !canCreateNeuralNetwork();
}

window.addEventListener("task", () => {
    checkIfCanCreateNeuralNetwork();
});
window.addEventListener("inputs", () => {
    checkIfCanCreateNeuralNetwork();
});
window.addEventListener("outputs", () => {
    checkIfCanCreateNeuralNetwork();
});
window.addEventListener("createNeuralNetwork", () => {
    checkIfCanCreateNeuralNetwork();
});

/** @type {HTMLButtonElement} */
const createNeuralNetworkButton = document.getElementById("createNeuralNetwork");
createNeuralNetworkButton.addEventListener("click", () => {
    if (!canCreateNeuralNetwork()) {
        return;
    }
    neuralNetwork = ml5.neuralNetwork({
        task,
        inputs: inputs.length,
        outputs,
    });
    console.log({ neuralNetwork });
    window.dispatchEvent(new CustomEvent("createNeuralNetwork", { detail: { neuralNetwork } }));
});

window.addEventListener("createNeuralNetwork", () => {
    createNeuralNetworkButton.disabled = true;
});

// ADD DATA

/** @typedef {import("../../build/brilliantsole.module.js").SensorConfiguration} SensorConfiguration */

let isSensorDataEnabled = false;

/** @type {HTMLButtonElement} */
const toggleSensorDataButton = document.getElementById("toggleSensorData");
toggleSensorDataButton.addEventListener("click", () => {
    isSensorDataEnabled = !isSensorDataEnabled;
    console.log({ isSensorDataEnabled });
    // FILL - get sensorConfiguration based on sampleRate and inputs
});

/** @param {SensorConfiguration} sensorConfiguration */
function setSensorConfiguration(sensorConfiguration) {
    selectedDevices.forEach((device) => {
        device.setSensorConfiguration(sensorConfiguration);
    });
}

/** @type {HTMLButtonElement} */
const addDataButton = document.getElementById("addData");
addDataButton.addEventListener("click", () => {
    // FILL
});

let addDataContinuously = false;

/** @type {HTMLButtonElement} */
const toggleAddDataContinuouslyInput = document.getElementById("toggleAddDataContinuously");
toggleAddDataContinuouslyInput.addEventListener("input", () => {
    addDataContinuously = toggleAddDataContinuouslyInput.checked;
    console.log({ addDataContinuously });
});

async function collectData() {
    // FILL
}

window.addEventListener(
    "createNeuralNetwork",
    () => {
        toggleSensorDataButton.disabled = false;

        selectedDevices.forEach((device, index) => {
            device.addEventListener("getSensorConfiguration", () => {
                // FILL - check if all devices have sensor data enabled
            });

            device.addEventListener("sensorData", (event) => {
                /** @type {SensorType} */
                const sensorType = event.message.sensorType;
                /** @type {number} */
                const timestamp = event.message.timestamp;

                const { [sensorType]: data } = event.message;
                //console.log({ name: device.name, sensorType, timestamp, data });

                // FILL

                if (index == 0) {
                    // FILL - check thresholds
                }
            });
        });
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
});

/** @type {HTMLInputElement} */
const batchSizeInput = document.getElementById("batchSize");
batchSizeInput.addEventListener("input", () => {
    batchSize = Number(batchSizeInput.value);
    console.log({ batchSize });
});

let isTraining = false;

/** @type {HTMLButtonElement} */
const trainButton = document.getElementById("train");
trainButton.addEventListener("click", () => {
    neuralNetwork.normalizeData();
    neuralNetwork.train(
        {
            epochs,
            batchSize,
        },
        () => window.dispatchEvent(new CustomEvent("finishedTraining"))
    );
    isTraining = true;
    window.dispatchEvent(new CustomEvent("train", { detail: { isTraining } }));
});

window.addEventListener("train", () => {
    batchSizeInput.disabled = true;
    epochsInput.disabled = true;

    trainButton.disabled = true;
});

window.addEventListener("finishedTraining", () => {
    batchSizeInput.disabled = false;
    epochsInput.disabled = false;

    trainButton.disabled = false;
});

// CLASSIFY & PREDICT

let testContinuously = false;
/** @type {HTMLInputElement} */
const toggleTestContinuouslyInput = document.getElementById("toggleTestContinuously");
toggleTestContinuouslyInput.addEventListener("input", () => {
    testContinuously = toggleTestContinuouslyInput.checked;
    console.log({ testContinuously });
});

/** @type {HTMLButtonElement} */
const testButton = document.getElementById("test");
testButton.addEventListener("click", () => {
    // FILL
});

/** @type {HTMLElement} */
const resultsElement = document.getElementById("results");

function test() {
    // FILL
}

window.addEventListener("train", () => {
    testButton.disabled = true;
    toggleTestContinuouslyInput.disabled = true;
});
window.addEventListener("finishedTraining", () => {
    testButton.disabled = false;
    toggleTestContinuouslyInput.disabled = false;
});

// SAVE

/** @type {HTMLButtonElement} */
const saveDataButton = document.getElementById("saveData");
saveDataButton.addEventListener("click", () => {
    // FILL
});

/** @type {HTMLButtonElement} */
const saveModelButton = document.getElementById("saveModel");
saveModelButton.addEventListener("click", () => {
    // FILL
});

window.addEventListener("finishedTraining", () => {
    saveDataButton.disabled = false;
    saveModelButton.disabled = false;
});

// LOAD

/** @type {HTMLInputElement} */
const loadDataInput = document.getElementById("loadData");
loadDataInput.addEventListener("input", () => {
    // FILL
});

/** @type {HTMLInputElement} */
const loadModelInput = document.getElementById("loadModel");
loadModelInput.addEventListener("input", () => {
    // FILL
});

window.addEventListener("createNeuralNetwork", () => {
    loadDataInput.disabled = false;
    loadModelInput.disabled = false;
});

// TENSORFLOW LITE

/** @type {HTMLButtonElement} */
const convertModelToTfliteButton = document.getElementById("convertModelToTflite");
convertModelToTfliteButton.addEventListener("click", () => {
    // FILL
});

let quantizeModel = false;
/** @type {HTMLInputElement} */
const toggleQuantizeModelInput = document.getElementById("toggleQuantizeModel");
toggleQuantizeModelInput.addEventListener("input", () => {
    quantizeModel = toggleQuantizeModelInput.checked;
    console.log({ quantizeModel });
});

/** @type {HTMLButtonElement} */
const toggleTfliteModelButton = document.getElementById("toggleTfliteModel");
toggleTfliteModelButton.addEventListener("click", () => {
    // FILL
});

/** @type {HTMLButtonElement} */
const makeTfliteInferenceButton = document.getElementById("makeTfliteInference");
makeTfliteInferenceButton.addEventListener("click", () => {
    // FILL
});

const tfliteResultsElement = document.getElementById("tfliteResults");

window.addEventListener("finishedTraining", () => {
    if (selectedDevices.length != 1) {
        return;
    }
    convertModelToTfliteButton.disabled = false;
});
