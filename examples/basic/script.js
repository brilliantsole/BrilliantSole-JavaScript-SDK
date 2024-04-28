import BS from "../../build/brilliantsole.module.js";
//import BS.Device from "../../src/BS.Device.js";
window.BS = BS;
console.log(BS);

const device = new BS.Device();
console.log({ device });
window.device = device;

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
                toggleConnectionButton.disabled = device.connectionStatus != "not connected";
            });
            toggleConnectionButton.disabled = device.connectionStatus != "not connected";

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

// CONNECTION

/** @type {HTMLButtonElement} */
const toggleConnectionButton = document.getElementById("toggleConnection");
toggleConnectionButton.addEventListener("click", () => {
    switch (device.connectionStatus) {
        case "not connected":
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
        case "not connected":
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

// DEVICE INFORMATION

/** @type {HTMLPreElement} */
const deviceInformationPre = document.getElementById("deviceInformationPre");
device.addEventListener("deviceInformation", () => {
    deviceInformationPre.textContent = JSON.stringify(device.deviceInformation, null, 2);
});

// BATTERY LEVEL

/** @type {HTMLSpanElement} */
const batteryLevelSpan = document.getElementById("batteryLevel");
device.addEventListener("batteryLevel", () => {
    console.log(`batteryLevel updated to ${device.batteryLevel}%`);
    batteryLevelSpan.innerText = `${device.batteryLevel}%`;
});

// NAME

/** @type {HTMLSpanElement} */
const nameSpan = document.getElementById("name");
device.addEventListener("getName", () => {
    console.log(`name updated to ${device.name}`);
    nameSpan.innerText = device.name;
});

/** @type {HTMLInputElement} */
const setNameInput = document.getElementById("setNameInput");
setNameInput.minLength = BS.Device.MinNameLength;
setNameInput.maxLength = BS.Device.MaxNameLength;

/** @type {HTMLButtonElement} */
const setNameButton = document.getElementById("setNameButton");

device.addEventListener("isConnected", () => {
    setNameInput.disabled = !device.isConnected;
});
device.addEventListener("not connected", () => {
    setNameInput.value = "";
});

setNameInput.addEventListener("input", () => {
    setNameButton.disabled = setNameInput.value.length < device.minNameLength;
});

setNameButton.addEventListener("click", () => {
    console.log(`setting name to ${setNameInput.value}`);
    device.setName(setNameInput.value);
    setNameInput.value = "";
    setNameButton.disabled = true;
});

// TYPE

/** @type {HTMLSpanElement} */
const typeSpan = document.getElementById("type");
device.addEventListener("getType", () => {
    console.log(`type updated to ${device.type}`);
    typeSpan.innerText = device.type;
});

/** @type {HTMLButtonElement} */
const setTypeButton = document.getElementById("setTypeButton");

/** @type {HTMLSelectElement} */
const setTypeSelect = document.getElementById("setTypeSelect");
/** @type {HTMLOptGroupElement} */
const setTypeSelectOptgroup = setTypeSelect.querySelector("optgroup");
BS.Device.Types.forEach((type) => {
    setTypeSelectOptgroup.appendChild(new Option(type));
});

device.addEventListener("isConnected", () => {
    setTypeSelect.disabled = !device.isConnected;
});

device.addEventListener("getType", () => {
    setTypeSelect.value = device.type;
});

setTypeSelect.addEventListener("input", () => {
    setTypeButton.disabled = setTypeSelect.value == device.type;
});

setTypeButton.addEventListener("click", () => {
    console.log(`setting type to ${setTypeSelect.value}`);
    device.setType(setTypeSelect.value);
    setTypeButton.disabled = true;
});

// SENSOR CONFIGURATION

/** @type {HTMLPreElement} */
const sensorConfigurationPre = document.getElementById("sensorConfigurationPre");
device.addEventListener("getSensorConfiguration", () => {
    sensorConfigurationPre.textContent = JSON.stringify(device.sensorConfiguration, null, 2);
});

/** @type {HTMLTemplateElement} */
const sensorTypeConfigurationTemplate = document.getElementById("sensorTypeConfigurationTemplate");
BS.Device.SensorTypes.forEach((sensorType) => {
    /** @type {HTMLElement} */
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
        const sensorRate = Number(sensorRateInput.value);
        console.log({ sensorType, sensorRate });
        device.setSensorConfiguration({ [sensorType]: sensorRate });
    });

    device.addEventListener("isConnected", () => {
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
        document.querySelector(`.sensorTypeConfiguration[data-sensor-type="${sensorType}"] input`).value =
            device.sensorConfiguration[sensorType];
    }
});
device.addEventListener("isConnected", () => {
    for (const sensorType in device.sensorConfiguration) {
        document.querySelector(`[data-sensor-type="${sensorType}"] input`).disabled = !device.isConnected;
    }
});

// SENSOR DATA

/** @type {HTMLTemplateElement} */
const sensorTypeDataTemplate = document.getElementById("sensorTypeDataTemplate");
BS.Device.SensorTypes.forEach((sensorType) => {
    const sensorTypeDataContainer = sensorTypeDataTemplate.content.cloneNode(true).querySelector(".sensorTypeData");
    sensorTypeDataContainer.querySelector(".sensorType").innerText = sensorType;

    /** @type {HTMLPreElement} */
    const sensorDataPre = sensorTypeDataContainer.querySelector(".sensorData");
    device.addEventListener(sensorType, (event) => {
        const sensorData = event.message;
        sensorDataPre.textContent = JSON.stringify(sensorData, null, 2);
    });

    sensorTypeDataTemplate.parentElement.appendChild(sensorTypeDataContainer);
    sensorTypeDataContainer.dataset.sensorType = sensorType;
});

// VIBRATION
/** @type {HTMLTemplateElement} */
const vibrationTemplate = document.getElementById("vibrationTemplate");
{
    /** @type {HTMLInputElement} */
    const waveformEffectSequenceLoopCountInput = vibrationTemplate.content.querySelector(
        ".waveformEffect .sequenceLoopCount"
    );
    waveformEffectSequenceLoopCountInput.max = BS.Device.MaxVibrationWaveformEffectSequenceLoopCount;
}
/** @type {HTMLTemplateElement} */
const vibrationLocationTemplate = document.getElementById("vibrationLocationTemplate");

/** @type {HTMLTemplateElement} */
const waveformEffectSegmentTemplate = document.getElementById("waveformEffectSegmentTemplate");
{
    /** @type {HTMLSelectElement} */
    const waveformEffectSelect = waveformEffectSegmentTemplate.content.querySelector(".effect");
    const waveformEffectOptgroup = waveformEffectSelect.querySelector("optgroup");
    BS.Device.VibrationWaveformEffects.forEach((waveformEffect) => {
        waveformEffectOptgroup.appendChild(new Option(waveformEffect));
    });

    /** @type {HTMLInputElement} */
    const waveformEffectSegmentDelayInput = waveformEffectSegmentTemplate.content.querySelector(".delay");
    waveformEffectSegmentDelayInput.max = BS.Device.MaxVibrationWaveformEffectSegmentDelay;

    /** @type {HTMLInputElement} */
    const waveformEffectLoopCountInput = waveformEffectSegmentTemplate.content.querySelector(".loopCount");
    waveformEffectLoopCountInput.max = BS.Device.MaxVibrationWaveformEffectSegmentLoopCount;
}

/** @type {HTMLTemplateElement} */
const waveformSegmentTemplate = document.getElementById("waveformSegmentTemplate");
{
    /** @type {HTMLInputElement} */
    const waveformDurationSegmentInput = waveformSegmentTemplate.content.querySelector(".duration");
    waveformDurationSegmentInput.max = BS.Device.MaxVibrationWaveformSegmentDuration;
}

/** @type {HTMLButtonElement} */
const addVibrationButton = document.getElementById("addVibration");
addVibrationButton.addEventListener("click", () => {
    /** @type {HTMLElement} */
    const vibrationContainer = vibrationTemplate.content.cloneNode(true).querySelector(".vibration");

    /** @type {HTMLButtonElement} */
    const deleteButton = vibrationContainer.querySelector(".delete");
    deleteButton.addEventListener("click", () => {
        vibrationContainer.remove();
        updateTriggerVibrationsButtonDisabled();
    });

    /** @type {HTMLUListElement} */
    const vibrationLocationsContainer = vibrationContainer.querySelector(".locations");
    BS.Device.VibrationLocations.forEach((vibrationLocation) => {
        const vibrationLocationContainer = vibrationLocationTemplate.content
            .cloneNode(true)
            .querySelector(".vibrationLocation");
        vibrationLocationContainer.querySelector("span").innerText = vibrationLocation;
        vibrationLocationContainer.querySelector("input").dataset.vibrationLocation = vibrationLocation;
        vibrationLocationsContainer.appendChild(vibrationLocationContainer);
    });

    /** @type {HTMLElement} */
    const waveformEffectContainer = vibrationContainer.querySelector(".waveformEffect");
    /** @type {HTMLUListElement} */
    const waveformEffectSegmentsContainer = waveformEffectContainer.querySelector(".segments");
    /** @type {HTMLButtonElement} */
    const addWaveformEffectSegmentButton = waveformEffectContainer.querySelector(".add");
    const updateAddWaveformEffectSegmentButton = () => {
        addWaveformEffectSegmentButton.disabled =
            waveformEffectSegmentsContainer.children.length >= BS.Device.MaxNumberOfVibrationWaveformEffectSegments;
    };
    addWaveformEffectSegmentButton.addEventListener("click", () => {
        /** @type {HTMLElement} */
        const waveformEffectSegmentContainer = waveformEffectSegmentTemplate.content
            .cloneNode(true)
            .querySelector(".waveformEffectSegment");

        const effectContainer = waveformEffectSegmentContainer.querySelector(".effect").parentElement;
        const delayContainer = waveformEffectSegmentContainer.querySelector(".delay").parentElement;

        /** @type {HTMLSelectElement} */
        const waveformEffectTypeSelect = waveformEffectSegmentContainer.querySelector(".type");
        waveformEffectTypeSelect.addEventListener("input", () => {
            let shouldShowEffectContainer = false;
            let shouldShowDelayContainer = false;

            switch (waveformEffectTypeSelect.value) {
                case "effect":
                    shouldShowEffectContainer = true;
                    break;
                case "delay":
                    shouldShowDelayContainer = true;
                    break;
                default:
                    throw Error(`uncaught waveformEffectTypeSelect value "${waveformEffectTypeSelect.value}"`);
            }

            effectContainer.style.display = shouldShowEffectContainer ? "" : "none";
            delayContainer.style.display = shouldShowDelayContainer ? "" : "none";
        });
        waveformEffectTypeSelect.dispatchEvent(new Event("input"));

        waveformEffectSegmentContainer.querySelector(".delete").addEventListener("click", () => {
            waveformEffectSegmentContainer.remove();
            updateAddWaveformEffectSegmentButton();
        });

        waveformEffectSegmentsContainer.appendChild(waveformEffectSegmentContainer);
        updateAddWaveformEffectSegmentButton();
    });

    /** @type {HTMLElement} */
    const waveformContainer = vibrationContainer.querySelector(".waveform");
    /** @type {HTMLUListElement} */
    const waveformSegmentsContainer = waveformContainer.querySelector(".segments");

    /** @type {HTMLButtonElement} */
    const addWaveformSegmentButton = waveformContainer.querySelector(".add");
    const updateAddWaveformSegmentButton = () => {
        addWaveformSegmentButton.disabled =
            waveformSegmentsContainer.children.length >= BS.Device.MaxNumberOfVibrationWaveformSegments;
    };
    addWaveformSegmentButton.addEventListener("click", () => {
        /** @type {HTMLElement} */
        const waveformSegmentContainer = waveformSegmentTemplate.content
            .cloneNode(true)
            .querySelector(".waveformSegment");

        waveformSegmentContainer.querySelector(".delete").addEventListener("click", () => {
            waveformSegmentContainer.remove();
            updateAddWaveformSegmentButton();
        });

        waveformSegmentsContainer.appendChild(waveformSegmentContainer);
        updateAddWaveformSegmentButton();
    });

    /** @type {HTMLSelectElement} */
    const vibrationTypeSelect = vibrationContainer.querySelector(".type");
    /** @type {HTMLOptGroupElement} */
    const vibrationTypeSelectOptgroup = vibrationTypeSelect.querySelector("optgroup");
    BS.Device.VibrationTypes.forEach((vibrationType) => {
        vibrationTypeSelectOptgroup.appendChild(new Option(vibrationType));
    });

    vibrationTypeSelect.addEventListener("input", () => {
        let showWaveformContainer = false;
        let showWaveformEffectContainer = false;

        /** @type {import("../../build/brilliantsole.module.js").BS.DeviceVibrationType} */
        const vibrationType = vibrationTypeSelect.value;
        switch (vibrationType) {
            case "waveform":
                showWaveformContainer = true;
                break;
            case "waveformEffect":
                showWaveformEffectContainer = true;
                break;
            default:
                throw Error(`invalid vibrationType "${vibrationType}"`);
        }

        waveformEffectContainer.style.display = showWaveformEffectContainer ? "" : "none";
        waveformContainer.style.display = showWaveformContainer ? "" : "none";
    });
    vibrationTypeSelect.dispatchEvent(new Event("input"));

    vibrationTemplate.parentElement.appendChild(vibrationContainer);

    updateTriggerVibrationsButtonDisabled();
});

const triggerVibrationsButton = document.getElementById("triggerVibrations");
triggerVibrationsButton.addEventListener("click", () => {
    /** @type {import("../../build/brilliantsole.module.js").BS.DeviceVibrationConfiguration[]} */
    let vibrationConfigurations = [];
    Array.from(vibrationTemplate.parentElement.querySelectorAll(".vibration"))
        .filter((vibrationContainer) => vibrationContainer.querySelector(".shouldTrigger").checked)
        .forEach((vibrationContainer) => {
            /** @type {import("../../build/brilliantsole.module.js").BS.DeviceVibrationConfiguration} */
            const vibrationConfiguration = {
                locations: [],
            };
            Array.from(vibrationContainer.querySelectorAll(`[data-vibration-location]`))
                .filter((input) => input.checked)
                .forEach((input) => {
                    vibrationConfiguration.locations.push(input.dataset.vibrationLocation);
                });
            if (vibrationConfiguration.locations.length == 0) {
                return;
            }

            vibrationConfiguration.type = vibrationContainer.querySelector("select.type").value;
            switch (vibrationConfiguration.type) {
                case "waveformEffect":
                    vibrationConfiguration.waveformEffect = {
                        segments: Array.from(
                            vibrationContainer.querySelectorAll(".waveformEffect .waveformEffectSegment")
                        ).map((waveformEffectSegmentContainer) => {
                            /** @type {import("../../build/brilliantsole.module.js").BS.DeviceVibrationWaveformEffectSegment} */
                            const waveformEffectSegment = {
                                loopCount: Number(waveformEffectSegmentContainer.querySelector(".loopCount").value),
                            };
                            if (waveformEffectSegmentContainer.querySelector(".type").value == "effect") {
                                waveformEffectSegment.effect =
                                    waveformEffectSegmentContainer.querySelector(".effect").value;
                            } else {
                                waveformEffectSegment.delay = Number(
                                    waveformEffectSegmentContainer.querySelector(".delay").value
                                );
                            }
                            return waveformEffectSegment;
                        }),
                        loopCount: Number(vibrationContainer.querySelector(".waveformEffect .sequenceLoopCount").value),
                    };
                    break;
                case "waveform":
                    vibrationConfiguration.waveform = {
                        segments: Array.from(vibrationContainer.querySelectorAll(".waveform .waveformSegment")).map(
                            (waveformSegmentContainer) => {
                                return {
                                    amplitude: Number(waveformSegmentContainer.querySelector(".amplitude").value),
                                    duration: Number(waveformSegmentContainer.querySelector(".duration").value),
                                };
                            }
                        ),
                    };
                    break;
                default:
                    throw Error(`invalid vibrationType "${vibrationConfiguration.type}"`);
            }
            vibrationConfigurations.push(vibrationConfiguration);
        });
    console.log({ vibrationConfigurations });
    if (vibrationConfigurations.length > 0) {
        device.triggerVibration(...vibrationConfigurations);
    }
});
device.addEventListener("isConnected", () => {
    updateTriggerVibrationsButtonDisabled();
});

function updateTriggerVibrationsButtonDisabled() {
    triggerVibrationsButton.disabled =
        !device.isConnected || vibrationTemplate.parentElement.querySelectorAll(".vibration").length == 0;
}

// FILE TRANSFER

/** @type {File?} */
let file;

/** @type {HTMLInputElement} */
const fileInput = document.getElementById("file");
fileInput.addEventListener("input", () => {
    if (fileInput.files[0].size > device.maxFileLength) {
        console.log("file size too large");
        return;
    }
    file = fileInput.files[0];
    console.log("file", file);
    updateToggleFileTransferButton();
});

const maxFileLengthSpan = document.getElementById("maxFileLength");
const updateMaxFileLengthSpan = () => {
    maxFileLengthSpan.innerText = (device.maxFileLength / 1024).toLocaleString();
};
updateMaxFileLengthSpan();
device.addEventListener("isConnected", () => {
    updateMaxFileLengthSpan();
});

/** @type {import("../../build/brilliantsole.module.js").FileType} */
let fileType;

/** @type {HTMLSelectElement} */
const fileTransferTypesSelect = document.getElementById("fileTransferTypes");
fileTransferTypesSelect.addEventListener("input", () => {
    fileType = fileTransferTypesSelect.value;
    console.log({ fileType });
    switch (fileType) {
        case "tflite":
            fileInput.accept = ".tflite";
            break;
    }
});
/** @type {HTMLOptGroupElement} */
const fileTransferTypesOptgroup = fileTransferTypesSelect.querySelector("optgroup");
BS.Device.FileTypes.forEach((fileType) => {
    fileTransferTypesOptgroup.appendChild(new Option(fileType));
});
fileTransferTypesSelect.dispatchEvent(new Event("input"));

/** @type {HTMLProgressElement} */
const fileTransferProgress = document.getElementById("fileTransferProgress");
device.addEventListener("fileTransferProgress", (event) => {
    const progress = event.message.progress;
    console.log({ progress });
    fileTransferProgress.value = progress == 1 ? 0 : progress;
});
device.addEventListener("fileTransferStatus", () => {
    if (device.fileTransferStatus == "idle") {
        fileTransferProgress.value = 0;
    }
});

/** @type {HTMLButtonElement} */
const toggleFileTransferButton = document.getElementById("toggleFileTransfer");
toggleFileTransferButton.addEventListener("click", () => {
    if (device.fileTransferStatus == "idle") {
        if (fileTransferDirection == "send") {
            device.sendFile(fileType, file);
        } else {
            device.receiveFile(fileType);
        }
    } else {
        device.cancelFileTransfer();
    }
});
const updateToggleFileTransferButton = () => {
    const enabled = device.isConnected && (file || fileTransferDirection == "receive");
    toggleFileTransferButton.disabled = !enabled;

    /** @type {String} */
    let innerText;
    switch (device.fileTransferStatus) {
        case "idle":
            innerText = `${fileTransferDirection} file`;
            break;
        case "sending":
            innerText = "stop sending file";
            break;
        case "receiving":
            innerText = "stop receiving file";
            break;
    }
    toggleFileTransferButton.innerText = innerText;
};
device.addEventListener("isConnected", () => {
    updateToggleFileTransferButton();
});
device.addEventListener("fileTransferStatus", () => {
    updateToggleFileTransferButton();
});

/** @type {"send" | "receive"} */
let fileTransferDirection;
/** @type {HTMLSelectElement} */
const fileTransferDirectionSelect = document.getElementById("fileTransferDirection");
fileTransferDirectionSelect.addEventListener("input", () => {
    fileTransferDirection = fileTransferDirectionSelect.value;
    console.log({ fileTransferDirection });
    updateToggleFileTransferButton();
});
fileTransferDirectionSelect.dispatchEvent(new Event("input"));

/** @param {File} file */
function downloadFile(file) {
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    const url = window.URL.createObjectURL(file);
    a.href = url;
    a.download = file.name;
    a.click();
    window.URL.revokeObjectURL(url);
}

device.addEventListener("fileReceived", (event) => {
    const file = event.message.file;
    downloadFile(file);
});

// TFLITE

/** @type {HTMLSpanElement} */
const tfliteNameSpan = document.getElementById("tfliteName");
/** @type {HTMLInputElement} */
const setTfliteNameInput = document.getElementById("setTfliteNameInput");
/** @type {HTMLButtonElement} */
const setTfliteNameButton = document.getElementById("setTfliteNameButton");

device.addEventListener("isConnected", () => {
    const disabled = !device.isConnected;
    setTfliteNameInput.disabled = disabled;
    setTfliteNameButton.disabled = disabled;
});

device.addEventListener("getTfliteName", () => {
    tfliteNameSpan.innerText = device.tfliteName;

    setTfliteNameButton.innerText = "set name";
    setTfliteNameButton.disabled = !device.isConnected;

    setTfliteNameInput.value = "";
    setTfliteNameInput.disabled = !device.isConnected;
});

setTfliteNameButton.addEventListener("click", () => {
    device.setTfliteName(setTfliteNameInput.value);

    setTfliteNameInput.disabled = true;

    setTfliteNameButton.innerText = "setting name...";
    setTfliteNameButton.disabled = true;
});

/** @type {HTMLSpanElement} */
const tfliteModelTaskSpan = document.getElementById("tfliteTask");
/** @type {HTMLSelectElement} */
const setTfliteTaskSelect = document.getElementById("setTfliteTaskSelect");
/** @type {HTMLOptGroupElement} */
const setTfliteTaskOptgroup = setTfliteTaskSelect.querySelector("optgroup");
/** @type {HTMLButtonElement} */
const setTfliteTaskButton = document.getElementById("setTfliteTaskButton");

device.addEventListener("isConnected", () => {
    const disabled = !device.isConnected;
    setTfliteTaskSelect.disabled = disabled;
    setTfliteTaskButton.disabled = disabled;
});

BS.Device.TfliteTasks.forEach((task) => {
    setTfliteTaskOptgroup.appendChild(new Option(task));
});

device.addEventListener("getTfliteTask", () => {
    const task = device.tfliteTask;
    setTfliteTaskSelect.value = task;
    tfliteModelTaskSpan.innerText = task;
});

setTfliteTaskButton.addEventListener("click", () => {
    device.setTfliteTask(setTfliteTaskSelect.value);
});
device.addEventListener("getTfliteInferencingEnabled", () => {
    setTfliteTaskButton.disabled = device.tfliteInferencingEnabled;
});

/** @type {HTMLSpanElement} */
const tfliteNumberOfSamplesSpan = document.getElementById("tfliteNumberOfSamples");
/** @type {HTMLInputElement} */
const setTfliteNumberOfSamplesInput = document.getElementById("setTfliteNumberOfSamplesInput");
/** @type {HTMLButtonElement} */
const setTfliteNumberOfSamplesButton = document.getElementById("setTfliteNumberOfSamplesButton");

device.addEventListener("isConnected", () => {
    const disabled = !device.isConnected;
    setTfliteNumberOfSamplesInput.disabled = disabled;
    setTfliteNumberOfSamplesButton.disabled = disabled;
});

device.addEventListener("getTfliteNumberOfSamples", () => {
    tfliteNumberOfSamplesSpan.innerText = device.tfliteNumberOfSamples;

    setTfliteNumberOfSamplesInput.value = "";
    setTfliteNumberOfSamplesInput.disabled = false;

    setTfliteNumberOfSamplesButton.disabled = false;
    setTfliteNumberOfSamplesButton.innerText = "set number of samples";
});

setTfliteNumberOfSamplesButton.addEventListener("click", () => {
    device.setTfliteNumberOfSamples(Number(setTfliteNumberOfSamplesInput.value));

    setTfliteNumberOfSamplesInput.disabled = true;

    setTfliteNumberOfSamplesButton.disabled = true;
    setTfliteNumberOfSamplesButton.innerText = "setting number of samples...";
});
device.addEventListener("getTfliteInferencingEnabled", () => {
    setTfliteNumberOfSamplesButton.disabled = device.tfliteInferencingEnabled;
});

/** @type {HTMLSpanElement} */
const tfliteNumberOfClassesSpan = document.getElementById("tfliteNumberOfClasses");
/** @type {HTMLInputElement} */
const setTfliteNumberOfClassesInput = document.getElementById("setTfliteNumberOfClassesInput");
/** @type {HTMLButtonElement} */
const setTfliteNumberOfClassesButton = document.getElementById("setTfliteNumberOfClassesButton");

device.addEventListener("isConnected", () => {
    const disabled = !device.isConnected;
    setTfliteNumberOfClassesInput.disabled = disabled;
    setTfliteNumberOfClassesButton.disabled = disabled;
});

device.addEventListener("getTfliteNumberOfClasses", () => {
    tfliteNumberOfClassesSpan.innerText = device.tfliteNumberOfClasses;

    setTfliteNumberOfClassesInput.value = "";
    setTfliteNumberOfClassesInput.disabled = false;

    setTfliteNumberOfClassesButton.disabled = false;
    setTfliteNumberOfClassesButton.innerText = "set number of classes";
});

setTfliteNumberOfClassesButton.addEventListener("click", () => {
    device.setTfliteNumberOfClasses(Number(setTfliteNumberOfClassesInput.value));

    setTfliteNumberOfClassesInput.disabled = true;

    setTfliteNumberOfClassesButton.disabled = true;
    setTfliteNumberOfClassesButton.innerText = "setting number of classes...";
});
device.addEventListener("getTfliteInferencingEnabled", () => {
    setTfliteNumberOfClassesButton.disabled = device.tfliteInferencingEnabled;
});

/** @type {HTMLSpanElement} */
const tfliteSampleRateSpan = document.getElementById("tfliteSampleRate");
/** @type {HTMLInputElement} */
const setTfliteSampleRateInput = document.getElementById("setTfliteSampleRateInput");
/** @type {HTMLButtonElement} */
const setTfliteSampleRateButton = document.getElementById("setTfliteSampleRateButton");

device.addEventListener("isConnected", () => {
    const disabled = !device.isConnected;
    setTfliteSampleRateInput.disabled = disabled;
    setTfliteSampleRateButton.disabled = disabled;
});

device.addEventListener("getTfliteSampleRate", () => {
    tfliteSampleRateSpan.innerText = device.tfliteSampleRate;

    setTfliteSampleRateInput.value = "";
    setTfliteSampleRateInput.disabled = false;

    setTfliteSampleRateButton.disabled = false;
    setTfliteSampleRateButton.innerText = "set sample rate";
});

setTfliteSampleRateButton.addEventListener("click", () => {
    device.setTfliteSampleRate(Number(setTfliteSampleRateInput.value));

    setTfliteSampleRateInput.disabled = true;

    setTfliteSampleRateButton.disabled = true;
    setTfliteSampleRateButton.innerText = "setting sample rate...";
});
device.addEventListener("getTfliteInferencingEnabled", () => {
    setTfliteSampleRateButton.disabled = device.tfliteInferencingEnabled;
});

/** @typedef {import("../../build/brilliantsole.module.js").SensorType} SensorType */

const tfliteSensorTypesContainer = document.getElementById("tfliteSensorTypes");
/** @type {HTMLTemplateElement} */
const tfliteSensorTypeTemplate = document.getElementById("tfliteSensorTypeTemplate");
/** @type {Object.<string, HTMLElement>} */
const tfliteSensorTypeContainers = {};
/** @type {SensorType[]} */
let tfliteSensorTypes = [];
/** @type {HTMLButtonElement} */
const setTfliteSensorTypesButton = document.getElementById("setTfliteSensorTypes");

BS.Device.TfliteSensorTypes.forEach((sensorType) => {
    const sensorTypeContainer = tfliteSensorTypeTemplate.content.cloneNode(true).querySelector(".sensorType");
    sensorTypeContainer.querySelector(".name").innerText = sensorType;

    /** @type {HTMLInputElement} */
    const isSensorEnabledInput = sensorTypeContainer.querySelector(".enabled");
    isSensorEnabledInput.addEventListener("input", () => {
        if (isSensorEnabledInput.checked) {
            tfliteSensorTypes.push(sensorType);
        } else {
            tfliteSensorTypes.splice(tfliteSensorTypes.indexOf(sensorType), 1);
        }
        console.log("tfliteSensorTypes", tfliteSensorTypes);
    });

    device.addEventListener("getTfliteSensorTypes", () => {
        isSensorEnabledInput.checked = device.tfliteSensorTypes.includes(sensorType);
    });
    isSensorEnabledInput.checked = device.tfliteSensorTypes.includes(sensorType);

    tfliteSensorTypeContainers[sensorType] = sensorTypeContainer;

    tfliteSensorTypesContainer.appendChild(sensorTypeContainer);
});

device.addEventListener("getTfliteSensorTypes", () => {
    tfliteSensorTypes = device.tfliteSensorTypes;
});

setTfliteSensorTypesButton.addEventListener("click", () => {
    setTfliteSensorTypesButton.disabled = true;
    setTfliteSensorTypesButton.innerText = "setting sensor types...";
    device.setTfliteSensorTypes(tfliteSensorTypes);
});
device.addEventListener("getTfliteSensorTypes", () => {
    setTfliteSensorTypesButton.disabled = false;
    setTfliteSensorTypesButton.innerText = "set sensor types";
});
device.addEventListener("getTfliteInferencingEnabled", () => {
    setTfliteSensorTypesButton.disabled = device.tfliteInferencingEnabled;
});

/** @type {HTMLInputElement} */
const setTfliteIsReadyInput = document.getElementById("tfliteIsReady");
device.addEventListener("tfliteModelIsReady", () => {
    setTfliteIsReadyInput.checked = device.tfliteIsReady;
});

/** @type {HTMLSpanElement} */
const tfliteThresholdSpan = document.getElementById("tfliteThreshold");
/** @type {HTMLInputElement} */
const setTfliteThresholdInput = document.getElementById("setTfliteThresholdInput");
/** @type {HTMLButtonElement} */
const setTfliteThresholdButton = document.getElementById("setTfliteThresholdButton");

device.addEventListener("isConnected", () => {
    const disabled = !device.isConnected;
    setTfliteThresholdInput.disabled = disabled;
    setTfliteThresholdButton.disabled = disabled;
});

device.addEventListener("getTfliteThreshold", () => {
    tfliteThresholdSpan.innerText = device.tfliteThreshold;

    setTfliteThresholdInput.value = "";
    setTfliteThresholdInput.disabled = false;

    setTfliteThresholdButton.disabled = false;
    setTfliteThresholdButton.innerText = "set threshold";
});

setTfliteThresholdButton.addEventListener("click", () => {
    device.setTfliteThreshold(Number(setTfliteThresholdInput.value));

    setTfliteThresholdInput.disabled = true;

    setTfliteThresholdButton.disabled = true;
    setTfliteThresholdButton.innerText = "setting threshold...";
});

/** @type {HTMLSpanElement} */
const tfliteCaptureDelaySpan = document.getElementById("tfliteCaptureDelay");
/** @type {HTMLInputElement} */
const setTfliteCaptureDelayInput = document.getElementById("setTfliteCaptureDelayInput");
/** @type {HTMLButtonElement} */
const setTfliteCaptureDelayButton = document.getElementById("setTfliteCaptureDelayButton");

device.addEventListener("isConnected", () => {
    const disabled = !device.isConnected;
    setTfliteCaptureDelayInput.disabled = disabled;
    setTfliteCaptureDelayButton.disabled = disabled;
});

device.addEventListener("getTfliteCaptureDelay", () => {
    tfliteCaptureDelaySpan.innerText = device.tfliteCaptureDelay;

    setTfliteCaptureDelayInput.value = "";
    setTfliteCaptureDelayInput.disabled = false;

    setTfliteCaptureDelayButton.disabled = false;
    setTfliteCaptureDelayButton.innerText = "set capture delay";
});

setTfliteCaptureDelayButton.addEventListener("click", () => {
    device.setTfliteCaptureDelay(Number(setTfliteCaptureDelayInput.value));

    setTfliteCaptureDelayInput.disabled = true;

    setTfliteCaptureDelayButton.disabled = true;
    setTfliteCaptureDelayButton.innerText = "setting capture delay...";
});

/** @type {HTMLInputElement} */
const tfliteInferencingEnabledInput = document.getElementById("tfliteInferencingEnabled");
/** @type {HTMLButtonElement} */
const toggleTfliteInferencingEnabledButton = document.getElementById("toggleTfliteInferencingEnabled");

device.addEventListener("tfliteModelIsReady", () => {
    toggleTfliteInferencingEnabledButton.disabled = !device.tfliteIsReady;
});
device.addEventListener("getTfliteInferencingEnabled", () => {
    tfliteInferencingEnabledInput.checked = device.tfliteInferencingEnabled;
    toggleTfliteInferencingEnabledButton.innerText = device.tfliteInferencingEnabled
        ? "disable inferencing"
        : "enable inferencing";
});

toggleTfliteInferencingEnabledButton.addEventListener("click", () => {
    device.toggleTfliteInferencing();
});

/** @type {HTMLPreElement} */
const tfliteInferencePre = document.getElementById("tfliteInference");
device.addEventListener("tfliteModelInference", (event) => {
    tfliteInferencePre.textContent = JSON.stringify(event.message.tfliteModelInference, null, 2);
});

// FIRMWARE

/** @type {File?} */
let firmware;

/** @type {HTMLInputElement} */
const firmwareInput = document.getElementById("firmwareInput");
firmwareInput.addEventListener("input", () => {
    firmware = firmwareInput.files[0];
    updateToggleFirmwareUpdateButton();
});
/** @type {HTMLButtonElement} */
const toggleFirmwareUpdateButton = document.getElementById("toggleFirmwareUpdate");
toggleFirmwareUpdateButton.addEventListener("click", () => {
    device.updateFirmware(firmware);
});
const updateToggleFirmwareUpdateButton = () => {
    const enabled = device.isConnected && Boolean(firmware);
    toggleFirmwareUpdateButton.disabled = !enabled;
};
device.addEventListener("isConnected", () => {
    updateToggleFirmwareUpdateButton();
});

/** @type {HTMLProgressElement} */
const firmwareUpdateProgress = document.getElementById("firmwareUpdateProgress");
device.addEventListener("firmwareUpdateProgress", (event) => {
    firmwareUpdateProgress.value = event.message.firmwareUpdateProgress;
});
device.addEventListener("firmwareUploadComplete", () => {
    firmwareUpdateProgress.value = 0;
});
