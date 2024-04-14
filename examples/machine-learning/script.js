import BS from "../../build/brilliantsole.module.js";
import * as THREE from "../utils/three/three.module.min.js";
window.BS = BS;
console.log({ BS });
BS.setAllConsoleLevelFlags({ log: false });

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
            window.addEventListener("createNeuralNetwork", () => {
                toggleConnectionButton.disabled = true;
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
        window.addEventListener("createNeuralNetwork", () => {
            deselectButton.disabled = true;
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
let sensorTypes = [];
function getInputs() {
    /** @type {string[]} */
    const _inputs = [];
    sensorTypes.forEach((sensorType) => {
        switch (sensorType) {
            case "pressure":
                for (let index = 0; index < BS.Device.DefaultNumberOfPressureSensors; index++) {
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

BS.Device.SensorTypes.forEach((sensorType) => {
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
        sensorTypes.sort((a, b) => BS.Device.SensorTypes.indexOf(a) - BS.Device.SensorTypes.indexOf(b));
        console.log("sensorTypes", sensorTypes);
        window.dispatchEvent(new CustomEvent("sensorTypes", { detail: { sensorTypes } }));
    });

    window.addEventListener("createNeuralNetwork", () => {
        isSensorEnabledInput.disabled = true;
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
    console.log({ outputLabels });

    window.dispatchEvent(new CustomEvent("outputLabels", { detail: { outputLabels } }));
}

function getOutputValues() {
    /** @type {number[]} */
    const outputValues = [];
    outputContainers.some((container) => {
        const outputValue = Number(container.querySelector(".value").value);
        outputValues.push(outputValue);
        return outputValues.length == numberOfOutputs;
    });
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

        /** @type {HTMLInputElement} */
        const valueInput = outputContainer.querySelector(".value");

        window.addEventListener("createNeuralNetwork", () => {
            labelInput.disabled = true;
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

    updateOutputLabels();
}

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

window.addEventListener("createNeuralNetwork", () => {
    hiddenUnitsInput.disabled = true;
    learningRateInput.disabled = true;
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
        outputs: outputLabels.length,
        hiddenUnits,
        learningRate,
    });
    console.log({ neuralNetwork });
    window.dispatchEvent(new CustomEvent("createNeuralNetwork", { detail: { neuralNetwork } }));
});

window.addEventListener("createNeuralNetwork", () => {
    createNeuralNetworkButton.disabled = true;
});

// ADD DATA

/** @typedef {import("../../build/brilliantsole.module.js").SensorConfiguration} SensorConfiguration */

/** @type {SensorConfiguration} */
const sensorConfiguration = {};
window.addEventListener("createNeuralNetwork", () => {
    sensorTypes.forEach((sensorType) => {
        sensorConfiguration[sensorType] = samplingRate;
    });
    console.log({ sensorConfiguration });
});

let isSensorDataEnabled = false;

/** @type {HTMLButtonElement} */
const toggleSensorDataInput = document.getElementById("toggleSensorData");
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

/** @param {SensorConfiguration} sensorConfiguration */
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
window.addEventListener("isSensorDataEnabled", () => {
    addDataButton.disabled = !isSensorDataEnabled;
});
window.addEventListener("createNeuralNetwork", () => {
    toggleSensorDataInput.disabled = false;
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

    if (addDataContinuously) {
        addData();
    }
}

/** @typedef {Object.<string, number>} SensorData */
/** @typedef {Object.<string, SensorData[]>} DeviceData */
/** @typedef {DeviceData[]} DevicesData */

/** @param {DeviceData} deviceData */
function didFinishCollectingDeviceData(deviceData) {
    return Object.values(deviceData).every((sensorData) => sensorData.length >= numberOfSamples);
}
/** @param {DevicesData} devicesData */
function didFinishCollectingDevicesData(devicesData) {
    return devicesData.every((deviceData) => {
        return didFinishCollectingDeviceData(deviceData);
    });
}
/** @param {DevicesData} devicesData */
function flattenDevicesData(devicesData) {
    /** @type {number[]} */
    const flattenedDevicesData = [];
    devicesData.forEach((deviceData) => {
        flattenedDevicesData.push(...flattenDeviceData(deviceData));
    });
    console.log({ flattenedDevicesData });
    return flattenedDevicesData;
}
/** @param {DeviceData} deviceData */
function flattenDeviceData(deviceData) {
    /** @type {number[]} */
    const flattenedDeviceData = [];
    for (let sampleIndex = 0; sampleIndex < numberOfSamples; sampleIndex++) {
        sensorTypes.forEach((sensorType) => {
            const sensorData = deviceData[sensorType][sampleIndex];
            switch (sensorType) {
                case "acceleration":
                case "gravity":
                case "linearAcceleration":
                case "gyroscope":
                case "magnetometer":
                    {
                        /** @type {import("../../build/brilliantsole.module.js").Vector3} */
                        const vector3 = sensorData;
                        const { x, y, z } = vector3;
                        flattenedDeviceData.push(x, y, z);
                    }
                    break;
                case "gameRotation":
                case "rotation":
                    {
                        /** @type {import("../../build/brilliantsole.module.js").Quaternion} */
                        const quaternion = sensorData;
                        const { x, y, z, w } = quaternion;
                        flattenedDeviceData.push(x, y, z, w);
                    }
                    break;
                case "pressure":
                    {
                        /** @type {import("../../build/brilliantsole.module.js").PressureData} */
                        const pressure = sensorData;
                        flattenedDeviceData.push(...pressure.sensors.map((sensor) => sensor.rawValue));
                    }
                    break;
                case "barometer":
                    // FILL
                    break;
            }
        });
    }
    return flattenedDeviceData.map((value) => (value == 0 ? 0.000001 * Math.random() : 0));
}

/** @returns {Promise<number[]>} */
async function collectData() {
    return new Promise((resolve) => {
        /** @type {DevicesData} */
        const devicesData = [];

        selectedDevices.forEach((device, index) => {
            /** @type {DeviceData} */
            const deviceData = {};
            sensorTypes.forEach((sensorType) => {
                deviceData[sensorType] = [];
            });
            devicesData[index] = deviceData;

            const onDeviceSensorData = (event) => {
                /** @type {SensorType} */
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
});
captureDelayInput.dispatchEvent(new Event("input"));

/** @type {SensorType[]} */
const thresholdSensorTypes = ["linearAcceleration", "gyroscope"];

const thresholdsContainer = document.getElementById("thresholds");
const thresholdTemplate = document.getElementById("thresholdTemplate");
/** @type {Object.<string, HTMLElement>} */
const thresholdContainers = {};

thresholdSensorTypes.forEach((sensorType) => {
    const thresholdContainer = thresholdTemplate.content.cloneNode(true).querySelector(".threshold");

    thresholdContainer.querySelector(".sensorType").innerText = sensorType;

    /** @type {HTMLMeterElement} */
    const meterElement = thresholdContainer.querySelector(".meter");

    let enabled = false;
    /** @type {HTMLInputElement} */
    const toggleThresholdInput = thresholdContainer.querySelector(".toggle");
    toggleThresholdInput.addEventListener("input", () => {
        enabled = toggleThresholdInput.checked;
        console.log({ sensorType, enabled });
        thresholdInput.disabled = !enabled;
        meterElement.disabled = !enabled;
    });

    let threshold = 0;
    /** @type {HTMLInputElement} */
    const thresholdInput = thresholdContainer.querySelector(".threshold");
    thresholdInput.addEventListener("input", () => {
        threshold = Number(thresholdInput.value);
        meterElement.low = threshold;
        console.log({ sensorType, threshold });
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
    thresholdInput.min = min;
    thresholdInput.max = max;
    thresholdInput.value = max;

    meterElement.min = min;
    meterElement.max = max;
    meterElement.value = min;
    meterElement.low = Number(thresholdInput.value);

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
/** @param {import("../../build/brilliantsole.module.js").Vector3} vector */
function getVectorMagnitude(vector) {
    const { x, y, z } = vector;
    thresholdVector.set(x, y, z);
    return thresholdVector.length();
}

const thresholdEuler = new THREE.Euler();
const thresholdQuaternion = new THREE.Quaternion();
const identityQuaternion = new THREE.Quaternion();
/** @param {import("../../build/brilliantsole.module.js").Vector3} euler */
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

                /** @type {SensorType} */
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
        () => {
            isTraining = false;
            window.dispatchEvent(new CustomEvent("finishedTraining"));
        }
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

let isTesting = false;
function test(allowOverlapping = true) {
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
