import BS from "../../build/brilliantsole.module.js";
window.BS = BS;
console.log({ BS });
BS.setAllConsoleLevelFlags({ log: false });

/** @typedef {import("../../build/brilliantsole.module.js").Device} Device */

// GET DEVICES

/** @type {HTMLButtonElement} */
const getDevicesButton = document.getElementById("getDevices");
getDevicesButton.disabled = !BS.Device.CanGetDevices;
/** @type {HTMLTemplateElement} */
const availableDeviceTemplate = document.getElementById("availableDeviceTemplate");
const availableDevicesContainer = document.getElementById("availableDevices");
/** @type {Object.<string, HTMLElement>} */
const availableDeviceContainers = {};
getDevicesButton.addEventListener("click", () => {
    getDevices();
});

async function getDevices() {
    const availableDevices = await BS.Device.GetDevices();
    if (!availableDevices) {
        return;
    }
    onAvailableDevices(availableDevices);
}

getDevices();

/** @param {Device[]} availableDevices */
function onAvailableDevices(availableDevices) {
    availableDevicesContainer.innerHTML = "";
    if (availableDevices.length == 0) {
        availableDevicesContainer.innerText = "no devices available";
    } else {
        availableDevices.forEach((availableDevice) => {
            let availableDeviceContainer = availableDeviceContainers[availableDevice.id];
            if (!availableDeviceContainer) {
                availableDeviceContainer = availableDeviceTemplate.content
                    .cloneNode(true)
                    .querySelector(".availableDevice");
                availableDeviceContainer.querySelector(".name").innerText = availableDevice.name;
                availableDeviceContainer.querySelector(".type").innerText = availableDevice.type;

                /** @type {HTMLButtonElement} */
                const toggleConnectionButton = availableDeviceContainer.querySelector(".toggleConnection");
                toggleConnectionButton.addEventListener("click", () => {
                    availableDevice.toggleConnection();
                });

                const updateToggleConnectonButton = () => {
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

                    if (isSensorDataEnabled) {
                        toggleConnectionButton.disabled = true;
                    }
                };

                window.addEventListener("isSensorDataEnabled", () => {
                    updateToggleConnectonButton();
                });
                updateToggleConnectonButton();

                availableDevice.addEventListener("connectionStatus", () => updateToggleConnectonButton());

                availableDeviceContainers[availableDevice.id] = availableDeviceContainer;
            }
            availableDevicesContainer.appendChild(availableDeviceContainer);
        });
    }
}

BS.Device.AddEventListener("availableDevices", (event) => {
    /** @type {Device[]} */
    const devices = event.message.devices;
    onAvailableDevices(devices);
});

// ADD DEVICE

/** @type {HTMLButtonElement} */
const addDeviceButton = document.getElementById("addDevice");
addDeviceButton.addEventListener("click", () => {
    const device = new BS.Device();
    device.connect();
});
window.addEventListener("isSensorDataEnabled", () => {
    addDeviceButton.disabled = isSensorDataEnabled;
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

    window.addEventListener("isSensorDataEnabled", () => {
        disconnectButton.disabled = isSensorDataEnabled;
    });

    /** @type {HTMLPreElement} */
    const sensorConfigurationPre = connectedDeviceContainer.querySelector("pre.sensorConfiguration");
    const updateSensorConfigurationPre = () => {
        sensorConfigurationPre.textContent = JSON.stringify(device.sensorConfiguration, null, 2);
    };
    device.addEventListener("getSensorConfiguration", () => {
        updateSensorConfigurationPre();
    });
    updateSensorConfigurationPre();

    device.addEventListener("sensorData", (event) => {
        /** @type {SensorType} */
        const sensorType = event.message.sensorType;
        /** @type {number} */
        const timestamp = event.message.timestamp;

        const { [sensorType]: data } = event.message;
        //console.log({ name: device.name, sensorType, timestamp, data });
        if (isRecording && currentRecording) {
            let deviceRecording = currentRecording.devices.find((_deviceRecording) => _deviceRecording.id == device.id);
            if (!deviceRecording) {
                deviceRecording = { id: device.id, type: device.type, name: device.name, sensorData: [] };
                currentRecording.devices.push(deviceRecording);
            }
            let sensorTypeData = deviceRecording.sensorData.find(
                (_sensorTypeData) => _sensorTypeData.sensorType == sensorType
            );
            if (!sensorTypeData) {
                sensorTypeData = {
                    sensorType,
                    initialTimestamp: Date.now(),
                    data: [],
                    dataRate: device.sensorConfiguration[sensorType],
                };
                deviceRecording.sensorData.push(sensorTypeData);
            }

            if (sensorType == "pressure") {
                /** @type {import("../../build/brilliantsole.module.js").PressureData} */
                const pressure = data;
                const pressureSensorData = pressure.sensors.map((sensor) => {
                    const { name, normalizedValue } = sensor;
                    return normalizedValue;
                });
                sensorTypeData.data.push(pressureSensorData);
            } else {
                sensorTypeData.data.push(data);
            }
        }
    });

    connectedDevicesContainer.appendChild(connectedDeviceContainer);
});

// SENSOR CONFIGURATION

/** @type {import("../../build/brilliantsole.module.js").SensorConfiguration} */
const sensorConfiguration = {};
const sensorConfigurationContainer = document.getElementById("sensorConfiguration");
/** @type {HTMLTemplateElement} */
const sensorTypeConfigurationTemplate = document.getElementById("sensorTypeConfigurationTemplate");
/** @type {Object.<string, HTMLElement>} */
const sensorTypeConfigurationContainers = {};
BS.Device.SensorTypes.forEach((sensorType) => {
    sensorConfiguration[sensorType] = 0;

    const sensorTypeConfigurationContainer = sensorTypeConfigurationTemplate.content
        .cloneNode(true)
        .querySelector(".sensorTypeConfiguration");
    sensorTypeConfigurationContainer.querySelector(".sensorType").innerText = sensorType;

    /** @type {HTMLInputElement} */
    const sensorRateInput = sensorTypeConfigurationContainer.querySelector(".sensorRate");
    sensorRateInput.value = 0;
    sensorRateInput.max = BS.Device.MaxSensorRate;
    sensorRateInput.step = BS.Device.SensorRateStep;
    sensorRateInput.addEventListener("input", () => {
        sensorConfiguration[sensorType] = Number(sensorRateInput.value);
        console.log({ sensorConfiguration });
        window.dispatchEvent(new CustomEvent("sensorConfiguration", { detail: { sensorConfiguration } }));
    });

    window.addEventListener("isSensorDataEnabled", () => {
        sensorRateInput.disabled = isSensorDataEnabled;
    });

    sensorTypeConfigurationContainers[sensorType] = sensorTypeConfigurationContainer;

    sensorConfigurationContainer.appendChild(sensorTypeConfigurationContainer);
});

let isSensorDataEnabled = false;
/** @param {boolean} newIsSensorDataEnabled */
function setIsSensorDataEnabled(newIsSensorDataEnabled) {
    if (newIsSensorDataEnabled == isSensorDataEnabled) {
        console.log("redundant isSensorDataEnabled assignment");
        return;
    }
    isSensorDataEnabled = newIsSensorDataEnabled;

    BS.Device.ConnectedDevices.forEach((device) => {
        if (isSensorDataEnabled) {
            console.log(device, sensorConfiguration);
            device.setSensorConfiguration(sensorConfiguration);
        } else {
            console.log("clear", device);
            device.clearSensorConfiguration();
        }
    });

    window.dispatchEvent(new CustomEvent("isSensorDataEnabled", { detail: isSensorDataEnabled }));
}
/** @type {HTMLInputElement} */
const toggleSensorDataCheckbox = document.getElementById("toggleSensorData");
toggleSensorDataCheckbox.addEventListener("input", () => {
    setIsSensorDataEnabled(toggleSensorDataCheckbox.checked);
});
function updateToggleSensorDataCheckbox() {
    const isSensorConfigurationZero = Object.values(sensorConfiguration).every((sensorRate) => sensorRate == 0);
    toggleSensorDataCheckbox.disabled = isSensorConfigurationZero || BS.Device.ConnectedDevices.length == 0;
}
window.addEventListener("sensorConfiguration", (event) => {
    updateToggleSensorDataCheckbox();
});

BS.Device.AddEventListener("deviceIsConnectedUpdated", () => {
    updateToggleSensorDataCheckbox();
});

// RECORDING SETTINGS

let recordingCountdown = 0;
/** @type {HTMLInputElement} */
const recordingCountdownInput = document.getElementById("recordingCountdownInput");
recordingCountdownInput.addEventListener("input", () => {
    recordingCountdown = Number(recordingCountdownInput.value);
    console.log({ recordingCountdown });
});

let isRecordingFixedDuration = false;

/** @type {HTMLInputElement} */
const isRecordingFixedDurationCheckbox = document.getElementById("isRecordingFixedDuration");
isRecordingFixedDurationCheckbox.addEventListener("input", () => {
    isRecordingFixedDuration = !isRecordingFixedDuration;
    console.log({ isRecordingFixedDuration });
    recordingDurationInput.disabled = !isRecordingFixedDuration;
});

/** (in seconds) */
let recordingDuration = 0;
/** @type {HTMLInputElement} */
const recordingDurationInput = document.getElementById("recordingDuration");
recordingDurationInput.addEventListener("input", () => {
    recordingDuration = Number(recordingDurationInput.value);
    console.log({ recordingDuration });
});
recordingDurationInput.dispatchEvent(new Event("input"));

// RECORDING

/** @typedef {import("../../build/brilliantsole.module.js").SensorType} SensorType */

let isRecording = false;

/**
 * @typedef DevicesSensorData
 * @type {Object}
 * @property {number} timestamp
 * @property {number} finalTimestamp
 * @property {DeviceSensorData[]} devices
 */

/**
 * @typedef DeviceSensorData
 * @type {Object}
 * @property {string} id
 * @property {string} name
 * @property {import("../../build/brilliantsole.module.js").DeviceType} type
 * @property {SensorTypeData[]} sensorData
 */

/**
 * @typedef SensorTypeData
 * @type {Object}
 * @property {SensorType} sensorType
 * @property {number} initialTimestamp ms
 * @property {number} dataRate ms
 * @property {Object[]} data
 */

/** @type {DevicesSensorData[]} */
let recordings = [];

/** @type {DevicesSensorData?} */
let currentRecording;

/** @type {HTMLButtonElement} */
const toggleRecordingButton = document.getElementById("toggleRecording");
toggleRecordingButton.addEventListener("click", () => {
    toggleRecording();
});

const recordingCountdownTimer = {
    /** @param {number} countdown seconds */
    start(countdown) {
        if (this.isRunning) {
            this.stop();
        }
        this.countdown = countdown;
        this.intervalId = setInterval(() => {
            this.countdown--;
            this.onCountdown?.(this.countdown);
            console.log({ countdown: this.countdown });
            if (this.countdown == 0) {
                this.stop();
                this.onEnd();
            }
        }, 1000);
        console.log("starting countdown");
        this.onStart?.(this.countdown);
        this.onCountdown?.(this.countdown);
    },
    /** @type {number} */
    countdown: null,
    stop() {
        if (this.isRunning) {
            console.log("stopping countdown");
            clearInterval(this.intervalId);
            this.intervalId = null;
            this.onStop?.();
        }
    },
    /** @type {(countdown: number)} */
    onCountdown: null,
    /** @type {(countdown: number)} */
    onStart: null,
    /** @type {function} */
    onStop: null,
    /** @type {function} */
    onEnd: null,
    intervalId: null,
    get isRunning() {
        return this.intervalId != null;
    },
};
recordingCountdownTimer.onCountdown = (countdown) => updateRecordingCountdown(countdown);
recordingCountdownTimer.onStop = () => updateRecordingCountdown(0);
recordingCountdownTimer.onEnd = () => startRecording();

async function toggleRecording() {
    if (recordingCountdownTimer.isRunning) {
        recordingCountdownTimer.stop();
        toggleRecordingButton.innerText = "record";
        return;
    }

    if (isRecording) {
        stopRecording();
    } else {
        if (recordingCountdown > 0) {
            recordingCountdownTimer.start(recordingCountdown);
            toggleRecordingButton.innerText = "cancel countdown";
        } else {
            startRecording();
        }
    }
}
/** @type {number?} */
let recordingTimeoutId = null;
function startRecordingTimeout() {
    clearRecordingTimeout();
    if (recordingDuration <= 0) {
        console.warn("recording duration must be greater than 0");
        return;
    }
    recordingTimeoutId = setTimeout(() => stopRecording(), recordingDuration * 1_000);
}
function clearRecordingTimeout() {
    if (recordingTimeoutId != null) {
        clearTimeout(recordingTimeoutId);
        recordingTimeoutId = null;
    }
}
function startRecording() {
    if (isRecording) {
        console.log("already recording");
        return;
    }

    currentRecording = { timestamp: Date.now(), devices: [] };
    isRecording = true;

    vibrate("strongClick100");

    toggleRecordingButton.innerText = "stop recording";

    if (isRecordingFixedDuration) {
        startRecordingTimeout();
    }
}
function stopRecording() {
    if (!isRecording) {
        console.log("already not recording");
        return;
    }

    clearRecordingTimeout();

    if (currentRecording) {
        console.log({ currentRecording });
        currentRecording.timestamp;
        currentRecording.finalTimestamp = Date.now();
        onRecording(currentRecording);
        currentRecording = null;
    }
    isRecording = false;

    vibrate("tripleClick100");

    toggleRecordingButton.innerText = "record";
}

window.addEventListener("isSensorDataEnabled", () => {
    toggleRecordingButton.disabled = !isSensorDataEnabled;
});

/** @type {HTMLSpanElement} */
const recordingCountdownSpan = document.getElementById("recordingCountdownSpan");

/** @param {number} recordingCountdown */
function updateRecordingCountdown(recordingCountdown) {
    console.log({ recordingCountdown });
    if (recordingCountdown == 0) {
        recordingCountdownSpan.innerText = "";
    } else {
        recordingCountdownSpan.innerText = recordingCountdown;
    }
}

/**
 * vibrates all connected insoles with a single waveformEffect
 * @param {import("../../build/brilliantsole.module.js").VibrationWaveformEffect} effect
 */
function vibrate(effect) {
    BS.Device.ConnectedDevices.forEach((device) => {
        device.triggerVibration({
            type: "waveformEffect",
            locations: ["front", "rear"],
            waveformEffect: { segments: [{ effect }] },
        });
    });
}

/** @type {HTMLTemplateElement} */
const recordingTemplate = document.getElementById("recordingTemplate");
/** @type {HTMLTemplateElement} */
const deviceRecordingTemplate = document.getElementById("deviceRecordingTemplate");
/** @type {HTMLTemplateElement} */
const sensorTypeRecordingTemplate = document.getElementById("sensorTypeRecordingTemplate");
const recordingsContainer = document.getElementById("recordings");

/**
 * @param {DevicesSensorData} recording
 * @param {boolean} saveRecordings
 */
function onRecording(recording, saveRecordings = true) {
    recordings.push(recording);
    console.log({ recordings });

    const recordingContainer = recordingTemplate.content.cloneNode(true).querySelector(".recording");
    const deviceRecordingsContainer = recordingContainer.querySelector(".devices");
    const initialDate = new Date(recording.timestamp);
    const duration = recording.finalTimestamp - recording.timestamp;
    recordingContainer.querySelector(".timestamp").innerText = dateToString(initialDate);
    recordingContainer.querySelector(".duration").innerText = (duration / 1000).toFixed(2);
    recording.devices.forEach((deviceRecording) => {
        const deviceRecordingContainer = deviceRecordingTemplate.content
            .cloneNode(true)
            .querySelector(".deviceRecording");

        deviceRecordingContainer.querySelector(".name").innerText = deviceRecording.name;
        deviceRecordingContainer.querySelector(".id").innerText = deviceRecording.id;
        deviceRecordingContainer.querySelector(".type").innerText = deviceRecording.type;
        const sensorTypesContainer = deviceRecordingContainer.querySelector(".sensorTypes");
        deviceRecording.sensorData.forEach((sensorTypeData) => {
            const sensorTypeRecordingContainer = sensorTypeRecordingTemplate.content
                .cloneNode(true)
                .querySelector(".sensorTypeRecording");
            sensorTypeRecordingContainer.querySelector(".sensorType").innerText = sensorTypeData.sensorType;
            sensorTypeRecordingContainer.querySelector(".dataRate").innerText = sensorTypeData.dataRate;
            const date = new Date(sensorTypeData.initialTimestamp);
            sensorTypeRecordingContainer.querySelector(".initialTimestamp").innerText = dateToString(date);

            /** @type {HTMLCanvasElement} */
            const visualizationCanvas = sensorTypeRecordingContainer.querySelector(".visualization canvas");
            const visualizationContainer = visualizationCanvas.closest(".visualization");

            /** @type {HTMLButtonElement} */
            const toggleVisualizationButton = sensorTypeRecordingContainer.querySelector(".toggleVisualization");
            toggleVisualizationButton.addEventListener("click", () => {
                const showVisualization = visualizationContainer.classList.contains("hidden");
                visualizationContainer.classList.toggle("hidden");
                console.log({ showVisualization, visualizationCanvas });
                if (showVisualization) {
                    visualizeSensorTypeData(sensorTypeData, visualizationCanvas);
                }
                toggleVisualizationButton.innerText = showVisualization ? "hide visualization" : "show visualization";
            });

            sensorTypesContainer.appendChild(sensorTypeRecordingContainer);
        });

        deviceRecordingsContainer.appendChild(deviceRecordingContainer);
    });

    /** @type {HTMLButtonElement} */
    const deleteButton = recordingContainer.querySelector(".delete");
    deleteButton.addEventListener("click", () => {
        const confirmDeletion = window.confirm("are you sure you want to delete this recording?");
        if (!confirmDeletion) {
            return;
        }
        recordingContainer.remove();
        recordings.splice(recordings.indexOf(recording), 1);
        saveRecordingsToLocalStorage();
        window.dispatchEvent(new CustomEvent("recordingsUpdate"));
    });

    /** @type {HTMLButtonElement} */
    const saveAsJSONButton = recordingContainer.querySelector(".saveAsJSON");
    saveAsJSONButton.addEventListener("click", () => {
        saveRecordingAsJSON(recording);
    });

    /** @type {HTMLButtonElement} */
    const saveAsCSVButton = recordingContainer.querySelector(".saveAsCSV");
    saveAsCSVButton.addEventListener("click", () => {
        console.log("save as CSV");
    });

    recordingsContainer.appendChild(recordingContainer);

    if (saveRecordings) {
        saveRecordingsToLocalStorage();
    }
    window.dispatchEvent(new CustomEvent("recordingsUpdate"));
}

/** @type {HTMLButtonElement} */
const deleteAllRecordingsButton = document.getElementById("deleteAllRecordings");
deleteAllRecordingsButton.addEventListener("click", () => {
    const confirmDeletion = window.confirm("are you sure you want to delete all recordings?");
    if (!confirmDeletion) {
        return;
    }
    recordings.length = 0;
    recordingsContainer.querySelectorAll(".recording").forEach((recordingContainer) => recordingContainer.remove());
    saveRecordingsToLocalStorage();
    window.dispatchEvent(new CustomEvent("recordingsUpdate"));
});
/** @type {HTMLButtonElement} */
const saveAllAsCSVButton = document.getElementById("saveAllAsCSV");
saveAllAsCSVButton.addEventListener("click", () => {
    console.log("saveAllAsCSV");
});
/** @type {HTMLButtonElement} */
const saveAllAsJSONButton = document.getElementById("saveAllAsJSON");
saveAllAsJSONButton.addEventListener("click", () => {
    console.log("saveAllAsJSONButton");
    recordings.forEach((recording) => {
        saveRecordingAsJSON(recording);
    });
});

window.addEventListener("recordingsUpdate", () => {
    console.log("recordingsUpdate");
    const disabled = recordings.length == 0;
    deleteAllRecordingsButton.disabled = disabled;
    saveAllAsJSONButton.disabled = disabled;
    saveAllAsCSVButton.disabled = disabled;
});

// LOCAL STORAGE

let localStorageKey = "BS.Recordings";

function loadRecordingsFromLocalStorage() {
    const recordingsString = localStorage.getItem(localStorageKey);
    if (!recordingsString) {
        return;
    }
    const loadedRecordings = JSON.parse(recordingsString);
    console.log("loaded recordings", loadedRecordings);
    loadedRecordings.forEach((recording) => {
        onRecording(recording, false);
    });
}
loadRecordingsFromLocalStorage();

function saveRecordingsToLocalStorage() {
    console.log("saving recordings", recordings);
    localStorage.setItem(localStorageKey, JSON.stringify(recordings));
}

// SAVE

/** @param {DevicesSensorData} recording */
function saveRecordingAsJSON(recording) {
    console.log("saveRecordingAsJSON", recording);

    const json = JSON.stringify(recording, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const date = new Date(recording.timestamp);
    a.download = `${dateToString(date).replaceAll(":", "")}.json`;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }, 0);
}

/** @param {Date} date */
function dateToString(date) {
    return date.toISOString();
}

// LOAD

const textDecoder = new TextDecoder();

/** @type {HTMLInputElement} */
const loadAsJSONInput = document.getElementById("loadAsJSON");
loadAsJSONInput.addEventListener("input", async () => {
    const files = loadAsJSONInput.files;
    console.log({ files });
    if (!files) {
        return;
    }

    for (let index = 0; index < files.length; index++) {
        const file = files[index];
        const arrayBuffer = await file.arrayBuffer();
        const json = textDecoder.decode(arrayBuffer);
        console.log({ json });
        try {
            const recording = JSON.parse(json);
            console.log({ recording });
            onRecording(recording, false);
        } catch (error) {
            console.error("unable to parse json", error);
        }
    }
    saveRecordingsToLocalStorage();
});

// VISUALIZATION

/**
 * @param {SensorTypeData} sensorTypeData
 * @param {HTMLCanvasElement} canvas
 */
function visualizeSensorTypeData(sensorTypeData, canvas) {
    console.log("visualize");
    if (canvas.chart) {
        console.log("already visualized");
        return;
    }
    console.log({ sensorTypeData, canvas });

    const { sensorType } = sensorTypeData;

    const scales = {
        y: {
            display: false,
        },
        x: {
            display: false,
        },
    };
    if (sensorType == "pressure") {
        Object.assign(scales.y, {
            min: 0,
            max: 1,
        });
    }

    const config = {
        type: "line",
        data: {
            labels: sensorTypeData.data.map((_, index) => index * sensorTypeData.dataRate),
            datasets: Object.keys(sensorTypeData.data[0]).map((key) => {
                let label = key;
                if (sensorType == "pressure") {
                    label = BS.Device.PressureSensorNames[key];
                }
                let data = sensorTypeData.data.map((value) => {
                    return value[key];
                });
                return {
                    label,
                    data,
                    radius: 1,
                    borderWidth: 2,
                };
            }),
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    align: "start",
                    position: "top",
                    labels: {
                        font: {
                            //size: 20,
                        },
                    },
                },
                title: {
                    display: true,
                    align: "start",
                    text: sensorTypeData.sensorType,
                    font: {
                        //size: 20,
                    },
                },
            },
            scales,
        },
    };

    console.log({ config });

    // FILL - config
    const chart = new Chart(canvas, config);
    canvas.chart = chart;
}
