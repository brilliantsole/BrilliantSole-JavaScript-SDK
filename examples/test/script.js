import BrilliantSole from "../../src/BrilliantSole.js";
window.BrilliantSole = BrilliantSole;
console.log("BrilliantSole", BrilliantSole);

const brilliantSole = new BrilliantSole();
console.log("brilliantSole", brilliantSole);
window.brilliantSole = brilliantSole;

// CONNECTION

/** @type {HTMLButtonElement} */
const toggleConnectionButton = document.getElementById("toggleConnection");
toggleConnectionButton.addEventListener("click", () => {
    switch (brilliantSole.connectionStatus) {
        case "not connected":
            if (brilliantSole.canReconnect) {
                brilliantSole.reconnect();
            } else {
                brilliantSole.connect();
            }
            break;
        case "connected":
            brilliantSole.disconnect();
            break;
    }
});

brilliantSole.addEventListener("connecting", () => {
    console.log("connecting");
    toggleConnectionButton.innerText = "connecting...";
    toggleConnectionButton.disabled = true;
});
brilliantSole.addEventListener("connected", () => {
    console.log("connected");
    toggleConnectionButton.innerText = "disconnect";
    toggleConnectionButton.disabled = false;
});
brilliantSole.addEventListener("disconnecting", () => {
    console.log("disconnecting");
    toggleConnectionButton.innerText = "disconnecting...";
    toggleConnectionButton.disabled = true;
});
brilliantSole.addEventListener("not connected", () => {
    console.log("not connected");
    toggleConnectionButton.innerText = brilliantSole.canReconnect ? "reconnect" : "connect";
    toggleConnectionButton.disabled = false;
});

// DEVICE INFORMATION

/** @type {HTMLPreElement} */
const deviceInformationPre = document.getElementById("deviceInformationPre");
brilliantSole.addEventListener("deviceInformation", () => {
    deviceInformationPre.textContent = JSON.stringify(brilliantSole.deviceInformation, null, 2);
});

// BATTERY LEVEL

/** @type {HTMLSpanElement} */
const batteryLevelSpan = document.getElementById("batteryLevel");
brilliantSole.addEventListener("batteryLevel", () => {
    console.log(`batteryLevel updated to ${brilliantSole.batteryLevel}%`);
    batteryLevelSpan.innerText = `${brilliantSole.batteryLevel}%`;
});

// NAME

/** @type {HTMLSpanElement} */
const nameSpan = document.getElementById("name");
brilliantSole.addEventListener("getName", () => {
    console.log(`name updated to ${brilliantSole.name}`);
    nameSpan.innerText = brilliantSole.name;
});

/** @type {HTMLInputElement} */
const setNameInput = document.getElementById("setNameInput");
setNameInput.minLength = brilliantSole.minNameLength;
setNameInput.maxLength = brilliantSole.maxNameLength;

/** @type {HTMLButtonElement} */
const setNameButton = document.getElementById("setNameButton");

brilliantSole.addEventListener("isConnected", () => {
    setNameInput.disabled = !brilliantSole.isConnected;
});
brilliantSole.addEventListener("not connected", () => {
    setNameInput.value = "";
});

setNameInput.addEventListener("input", () => {
    setNameButton.disabled = setNameInput.value.length < brilliantSole.minNameLength;
});

setNameButton.addEventListener("click", () => {
    console.log(`setting name to ${setNameInput.value}`);
    brilliantSole.setName(setNameInput.value);
    setNameInput.value = "";
    setNameButton.disabled = true;
});

// TYPE

/** @type {HTMLSpanElement} */
const typeSpan = document.getElementById("type");
brilliantSole.addEventListener("getType", () => {
    console.log(`type updated to ${brilliantSole.type}`);
    typeSpan.innerText = brilliantSole.type;
});

/** @type {HTMLButtonElement} */
const setTypeButton = document.getElementById("setTypeButton");

/** @type {HTMLSelectElement} */
const setTypeSelect = document.getElementById("setTypeSelect");
/** @type {HTMLOptGroupElement} */
const setTypeSelectOptgroup = setTypeSelect.querySelector("optgroup");
BrilliantSole.Types.forEach((type) => {
    setTypeSelectOptgroup.appendChild(new Option(type));
});

brilliantSole.addEventListener("isConnected", () => {
    setTypeSelect.disabled = !brilliantSole.isConnected;
});

brilliantSole.addEventListener("getType", () => {
    setTypeSelect.value = brilliantSole.type;
});

setTypeSelect.addEventListener("input", () => {
    setTypeButton.disabled = setTypeSelect.value == brilliantSole.type;
});

setTypeButton.addEventListener("click", () => {
    console.log(`setting type to ${setTypeSelect.value}`);
    brilliantSole.setType(setTypeSelect.value);
    setTypeButton.disabled = true;
});

// SENSOR CONFIGURATION

/** @type {HTMLPreElement} */
const sensorConfigurationPre = document.getElementById("sensorConfigurationPre");
brilliantSole.addEventListener("getSensorConfiguration", () => {
    sensorConfigurationPre.textContent = JSON.stringify(brilliantSole.sensorConfiguration, null, 2);
});

/** @type {HTMLTemplateElement} */
const sensorTypeConfigurationTemplate = document.getElementById("sensorTypeConfigurationTemplate");
BrilliantSole.SensorTypes.forEach((sensorType) => {
    const sensorTypeConfigurationContainer = sensorTypeConfigurationTemplate.content
        .cloneNode(true)
        .querySelector(".sensorTypeConfiguration");
    sensorTypeConfigurationContainer.querySelector(".sensorType").innerText = sensorType;

    /** @type {HTMLInputElement} */
    const sensorRateInput = sensorTypeConfigurationContainer.querySelector(".sensorRate");
    sensorRateInput.value = 0;
    sensorRateInput.max = BrilliantSole.MaxSensorRate;
    sensorRateInput.step = BrilliantSole.SensorRateStep;
    sensorRateInput.addEventListener("input", () => {
        const sensorRate = Number(sensorRateInput.value);
        console.log({ sensorType, sensorRate });
        brilliantSole.setSensorConfiguration({ [sensorType]: sensorRate });
    });

    sensorTypeConfigurationTemplate.parentElement.appendChild(sensorTypeConfigurationContainer);
    sensorTypeConfigurationContainer.dataset.sensorType = sensorType;
});
brilliantSole.addEventListener("getSensorConfiguration", () => {
    for (const sensorType in brilliantSole.sensorConfiguration) {
        document.querySelector(`.sensorTypeConfiguration[data-sensor-type="${sensorType}"] input`).value =
            brilliantSole.sensorConfiguration[sensorType];
    }
});
brilliantSole.addEventListener("isConnected", () => {
    for (const sensorType in brilliantSole.sensorConfiguration) {
        document.querySelector(`[data-sensor-type="${sensorType}"] input`).disabled = !brilliantSole.isConnected;
    }
});

// SENSOR DATA

/** @type {HTMLTemplateElement} */
const sensorTypeDataTemplate = document.getElementById("sensorTypeDataTemplate");
BrilliantSole.SensorTypes.forEach((sensorType) => {
    const sensorTypeDataContainer = sensorTypeDataTemplate.content.cloneNode(true).querySelector(".sensorTypeData");
    sensorTypeDataContainer.querySelector(".sensorType").innerText = sensorType;

    /** @type {HTMLPreElement} */
    const sensorDataPre = sensorTypeDataContainer.querySelector(".sensorData");
    brilliantSole.addEventListener(sensorType, (event) => {
        const sensorData = event.message;
        sensorDataPre.textContent = JSON.stringify(sensorData, null, 2);
    });

    sensorTypeDataTemplate.parentElement.appendChild(sensorTypeDataContainer);
    sensorTypeDataContainer.dataset.sensorType = sensorType;
});

// VIBRATION
/** @type {HTMLTemplateElement} */
const vibrationTemplate = document.getElementById("vibrationTemplate");
/** @type {HTMLTemplateElement} */
const vibrationLocationTemplate = document.getElementById("vibrationLocationTemplate");

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
    BrilliantSole.VibrationLocations.forEach((vibrationLocation) => {
        const vibrationLocationContainer = vibrationLocationTemplate.content
            .cloneNode(true)
            .querySelector(".vibrationLocation");
        vibrationLocationContainer.querySelector("span").innerText = vibrationLocation;
        vibrationLocationContainer.querySelector("input").dataset.vibrationLocation = vibrationLocation;
        vibrationLocationsContainer.appendChild(vibrationLocationContainer);
    });

    /** @type {HTMLElement} */
    const waveformContainer = vibrationContainer.querySelector(".waveform");
    const waveformEffectContainer = vibrationContainer.querySelector(".waveformEffect");

    /** @type {HTMLSelectElement} */
    const vibrationTypeSelect = vibrationContainer.querySelector(".type");
    /** @type {HTMLOptGroupElement} */
    const vibrationTypeSelectOptgroup = vibrationTypeSelect.querySelector("optgroup");
    BrilliantSole.VibrationTypes.forEach((vibrationType) => {
        vibrationTypeSelectOptgroup.appendChild(new Option(vibrationType));
    });

    vibrationTypeSelect.addEventListener("input", () => {
        let showWaveformContainer = false;
        let showWaveformEffectContainer = false;

        /** @type {import("../../src/BrilliantSole.js").BrilliantSoleVibrationType} */
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
    /** @type {import("../../src/BrilliantSole.js").BrilliantSoleVibrationConfiguration[]} */
    let vibrationConfigurations = [];
    vibrationTemplate.parentElement
        .querySelectorAll(".vibration")
        .filter((vibrationContainer) => vibrationContainer.querySelector(".shouldTrigger").checked)
        .forEach((vibrationContainer) => {
            /** @type {import("../../src/BrilliantSole.js").BrilliantSoleVibrationConfiguration} */
            const vibrationConfiguration = {
                locations: [],
            };
            vibrationContainer
                .querySelectorAll(`[data-vibration-location]`)
                .filter((input) => input.checked)
                .forEach((input) => {
                    vibrationConfiguration.locations.push(input.dataset.vibrationLocation);
                });
            vibrationConfiguration.type = vibrationContainer.querySelector("select.type").value;
            switch (vibrationConfiguration.type) {
                case "waveformEffect":
                    // FILL
                    break;
                case "waveform":
                    // FILL
                    break;
                default:
                    throw Error(`invalid vibrationType "${vibrationConfiguration.type}"`);
            }
            vibrationConfigurations.push(vibrationConfiguration);
        });
    console.log({ vibrationConfigurations });
    brilliantSole.triggerVibration(...vibrationConfigurations);
});
brilliantSole.addEventListener("isConnected", () => {
    updateTriggerVibrationsButtonDisabled();
});

function updateTriggerVibrationsButtonDisabled() {
    triggerVibrationsButton.disabled =
        !brilliantSole.isConnected || vibrationTemplate.parentElement.querySelectorAll(".vibration").length == 0;
}
