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
            let deviceRecording = currentRecording.find((_deviceRecording) => _deviceRecording.id == device.id);
            if (!deviceRecording) {
                deviceRecording = { id: device.id, sensorData: [] };
                currentRecording.push(deviceRecording);
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
                const pressureSensors = pressure.sensors.map((sensor) => {
                    const { name, rawValue, normalizedValue } = sensor;
                    return { name, rawValue, normalizedValue };
                });
                sensorTypeData.data.push(pressureSensors);
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

let recordingDuration = 0;
/** @type {HTMLInputElement} */
const recordingDurationInput = document.getElementById("recordingDuration");
recordingDurationInput.addEventListener("input", () => {
    recordingDuration = Number(recordingDurationInput.value);
    console.log({ recordingDuration });
});

// RECORDING

/** @typedef {import("../../build/brilliantsole.module.js").SensorType} SensorType */

let isRecording = false;

/**
 * @typedef DevicesSensorData
 * @type {DeviceSensorData[]}
 */

/**
 * @typedef DeviceSensorData
 * @type {Object}
 * @property {string} id
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
function startRecording() {
    if (isRecording) {
        console.log("already recording");
        return;
    }

    currentRecording = [];
    isRecording = true;

    vibrate("strongClick100");

    toggleRecordingButton.innerText = "stop recording";
}
function stopRecording() {
    if (!isRecording) {
        console.log("already not recording");
        return;
    }

    if (currentRecording) {
        console.log({ currentRecording });
        recordings.push(currentRecording);
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

/** @param {import("../../build/brilliantsole.module.js").VibrationWaveformEffect} effect */
function vibrate(effect) {
    BS.Device.ConnectedDevices.forEach((device) => {
        device.triggerVibration({
            type: "waveformEffect",
            locations: ["front", "rear"],
            waveformEffect: { segments: [{ effect }] },
        });
    });
}
