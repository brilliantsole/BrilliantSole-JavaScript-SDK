import BS from "../../build/brilliantsole.module.js";
//import BS.Device from "../../src/BS.Device.js";
window.BS = BS;
console.log(BS);

const device = new BS.Device();
console.log({ device });
window.device = device;

/** @typedef {import("../../build/brilliantsole.module.js").Device} Device */

// GET DEVICES

/** @type {HTMLButtonElement} */
const getDevicesButton = document.getElementById("getDevices");
/** @type {HTMLTemplateElement} */
const availableDeviceTemplate = document.getElementById("availableDeviceTemplate");
const availableDevicesContainer = document.getElementById("availableDevices");
getDevicesButton.addEventListener("click", async () => {
    getDevices();
});
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
device.addEventListener("isConnected", () => {
    getDevicesButton.disabled = device.isConnected;
});

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
