import * as BS from "../../build/brilliantsole.module.js";
window.BS = BS;
console.log(BS);

const device = new BS.Device();
console.log({ device });
window.device = device;

//BS.setAllConsoleLevelFlags({ log: false });
//BS.setConsoleLevelFlagsForType("PressureDataManager", { log: true });

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
      const availableDeviceContainer = availableDeviceTemplate.content
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
        device.connectionManager = availableDevice.connectionManager;
        device.reconnect();
      });
      device.addEventListener("connectionStatus", () => {
        toggleConnectionButton.disabled =
          device.connectionStatus != "notConnected";
      });
      toggleConnectionButton.disabled =
        device.connectionStatus != "notConnected";

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
      toggleConnectionButton.innerText = device.isConnected
        ? "disconnect"
        : "connect";
      break;
    case "connecting":
    case "disconnecting":
      toggleConnectionButton.disabled = true;
      toggleConnectionButton.innerText = device.connectionStatus;
      break;
  }
});

/** @type {HTMLInputElement} */
const connectIpAddressInput = document.getElementById("connectIpAddress");
connectIpAddressInput.addEventListener("input", () => {
  const isValid = connectIpAddressInput.checkValidity();
  connectViaIpAddressButton.disabled = !isValid;
});
/** @type {HTMLButtonElement} */
const connectViaIpAddressButton = document.getElementById(
  "connectViaIpAddress"
);
connectViaIpAddressButton.addEventListener("click", () => {
  connectViaIpAddressButton.disabled = true;
  console.log(`connecting via ipAddress "${connectIpAddressInput.value}"`);
  device.connect({ type: "webSocket", ipAddress: connectIpAddressInput.value });
});
device.addEventListener("isConnected", () => {
  connectIpAddressInput.disabled = device.isConnected;
  connectViaIpAddressButton.disabled = device.isConnected;
});

/** @type {HTMLInputElement} */
const reconnectOnDisconnectionCheckbox = document.getElementById(
  "reconnectOnDisconnection"
);
reconnectOnDisconnectionCheckbox.addEventListener("input", () => {
  device.reconnectOnDisconnection = reconnectOnDisconnectionCheckbox.checked;
});

/** @type {HTMLButtonElement} */
const resetDeviceButton = document.getElementById("resetDevice");
device.addEventListener("isConnected", () => {
  resetDeviceButton.disabled = !device.isConnected || !device.canReset;
});
resetDeviceButton.addEventListener("click", () => {
  device.reset();
});

// DEVICE INFORMATION

/** @type {HTMLPreElement} */
const deviceInformationPre = document.getElementById("deviceInformationPre");
device.addEventListener("deviceInformation", () => {
  deviceInformationPre.textContent = JSON.stringify(
    device.deviceInformation,
    null,
    2
  );
});

// MTU
const deviceMtuSpan = document.getElementById("mtu");
device.addEventListener("getMtu", () => {
  deviceMtuSpan.innerText = device.mtu;
});

// BATTERY LEVEL

/** @type {HTMLSpanElement} */
const batteryLevelSpan = document.getElementById("batteryLevel");
device.addEventListener("batteryLevel", () => {
  console.log(`batteryLevel updated to ${device.batteryLevel}%`);
  batteryLevelSpan.innerText = `${device.batteryLevel}%`;
});

/** @type {HTMLSpanElement} */
const isChargingSpan = document.getElementById("isCharging");
device.addEventListener("isCharging", () => {
  console.log(`isCharging updated to ${device.isCharging}`);
  isChargingSpan.innerText = device.isCharging;
});

/** @type {HTMLSpanElement} */
const batteryCurrentSpan = document.getElementById("batteryCurrent");
device.addEventListener("getBatteryCurrent", () => {
  console.log(`batteryCurrent updated to ${device.batteryCurrent}mAh`);
  batteryCurrentSpan.innerText = `${device.batteryCurrent}mAh`;
});

/** @type {HTMLButtonElement} */
const updateBatteryCurrentButton = document.getElementById(
  "updateBatteryCurrent"
);
device.addEventListener("isConnected", () => {
  updateBatteryCurrentButton.disabled = !device.isConnected;
});
updateBatteryCurrentButton.addEventListener("click", () => {
  device.getBatteryCurrent();
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
setNameInput.minLength = BS.MinNameLength;
setNameInput.maxLength = BS.MaxNameLength;

/** @type {HTMLButtonElement} */
const setNameButton = document.getElementById("setNameButton");

device.addEventListener("isConnected", () => {
  setNameInput.disabled = !device.isConnected;
});
device.addEventListener("notConnected", () => {
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
BS.DeviceTypes.forEach((type) => {
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
const sensorConfigurationPre = document.getElementById(
  "sensorConfigurationPre"
);
device.addEventListener("getSensorConfiguration", () => {
  sensorConfigurationPre.textContent = JSON.stringify(
    device.sensorConfiguration,
    null,
    2
  );
});

/** @type {HTMLTemplateElement} */
const sensorTypeConfigurationTemplate = document.getElementById(
  "sensorTypeConfigurationTemplate"
);
BS.SensorTypes.forEach((sensorType) => {
  /** @type {HTMLElement} */
  const sensorTypeConfigurationContainer =
    sensorTypeConfigurationTemplate.content
      .cloneNode(true)
      .querySelector(".sensorTypeConfiguration");
  sensorTypeConfigurationContainer.querySelector(".sensorType").innerText =
    sensorType;

  /** @type {HTMLInputElement} */
  const sensorRateInput =
    sensorTypeConfigurationContainer.querySelector(".sensorRate");
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

  sensorTypeConfigurationTemplate.parentElement.appendChild(
    sensorTypeConfigurationContainer
  );
  sensorTypeConfigurationContainer.dataset.sensorType = sensorType;
});
device.addEventListener("getSensorConfiguration", () => {
  for (const sensorType in device.sensorConfiguration) {
    document.querySelector(
      `.sensorTypeConfiguration[data-sensor-type="${sensorType}"] .input`
    ).value = device.sensorConfiguration[sensorType];
  }
});
device.addEventListener("isConnected", () => {
  for (const sensorType in device.sensorConfiguration) {
    document.querySelector(
      `[data-sensor-type="${sensorType}"] .input`
    ).disabled = !device.isConnected;
  }
});

// PRESSURE RANGE

/** @type {HTMLButtonElement} */
const resetPressureRangeButton = document.getElementById("resetPressureRange");
resetPressureRangeButton.addEventListener("click", () => {
  device.resetPressureRange();
});

// SENSOR DATA

/** @type {HTMLTemplateElement} */
const sensorTypeDataTemplate = document.getElementById(
  "sensorTypeDataTemplate"
);
BS.SensorTypes.forEach((sensorType) => {
  const sensorTypeDataContainer = sensorTypeDataTemplate.content
    .cloneNode(true)
    .querySelector(".sensorTypeData");
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
  const waveformEffectSequenceLoopCountInput =
    vibrationTemplate.content.querySelector(
      ".waveformEffect .sequenceLoopCount"
    );
  waveformEffectSequenceLoopCountInput.max =
    BS.MaxVibrationWaveformEffectSequenceLoopCount;
}
/** @type {HTMLTemplateElement} */
const vibrationLocationTemplate = document.getElementById(
  "vibrationLocationTemplate"
);

/** @type {HTMLTemplateElement} */
const waveformEffectSegmentTemplate = document.getElementById(
  "waveformEffectSegmentTemplate"
);
{
  /** @type {HTMLSelectElement} */
  const waveformEffectSelect =
    waveformEffectSegmentTemplate.content.querySelector(".effect");
  const waveformEffectOptgroup = waveformEffectSelect.querySelector("optgroup");
  BS.VibrationWaveformEffects.forEach((waveformEffect) => {
    waveformEffectOptgroup.appendChild(new Option(waveformEffect));
  });

  /** @type {HTMLInputElement} */
  const waveformEffectSegmentDelayInput =
    waveformEffectSegmentTemplate.content.querySelector(".delay");
  waveformEffectSegmentDelayInput.max =
    BS.MaxVibrationWaveformEffectSegmentDelay;

  /** @type {HTMLInputElement} */
  const waveformEffectLoopCountInput =
    waveformEffectSegmentTemplate.content.querySelector(".loopCount");
  waveformEffectLoopCountInput.max =
    BS.MaxVibrationWaveformEffectSegmentLoopCount;
}

/** @type {HTMLTemplateElement} */
const waveformSegmentTemplate = document.getElementById(
  "waveformSegmentTemplate"
);
{
  /** @type {HTMLInputElement} */
  const waveformDurationSegmentInput =
    waveformSegmentTemplate.content.querySelector(".duration");
  waveformDurationSegmentInput.max = BS.MaxVibrationWaveformSegmentDuration;
}

/** @type {HTMLButtonElement} */
const addVibrationButton = document.getElementById("addVibration");
addVibrationButton.addEventListener("click", () => {
  /** @type {HTMLElement} */
  const vibrationContainer = vibrationTemplate.content
    .cloneNode(true)
    .querySelector(".vibration");

  /** @type {HTMLButtonElement} */
  const deleteButton = vibrationContainer.querySelector(".delete");
  deleteButton.addEventListener("click", () => {
    vibrationContainer.remove();
    updateTriggerVibrationsButtonDisabled();
  });

  /** @type {HTMLUListElement} */
  const vibrationLocationsContainer =
    vibrationContainer.querySelector(".locations");
  device.vibrationLocations.forEach((vibrationLocation) => {
    const vibrationLocationContainer = vibrationLocationTemplate.content
      .cloneNode(true)
      .querySelector(".vibrationLocation");
    vibrationLocationContainer.querySelector("span").innerText =
      vibrationLocation;
    vibrationLocationContainer.querySelector(
      "input"
    ).dataset.vibrationLocation = vibrationLocation;
    vibrationLocationsContainer.appendChild(vibrationLocationContainer);
  });

  /** @type {HTMLElement} */
  const waveformEffectContainer =
    vibrationContainer.querySelector(".waveformEffect");
  /** @type {HTMLUListElement} */
  const waveformEffectSegmentsContainer =
    waveformEffectContainer.querySelector(".segments");
  /** @type {HTMLButtonElement} */
  const addWaveformEffectSegmentButton =
    waveformEffectContainer.querySelector(".add");
  const updateAddWaveformEffectSegmentButton = () => {
    addWaveformEffectSegmentButton.disabled =
      waveformEffectSegmentsContainer.children.length >=
      BS.MaxNumberOfVibrationWaveformEffectSegments;
  };
  addWaveformEffectSegmentButton.addEventListener("click", () => {
    /** @type {HTMLElement} */
    const waveformEffectSegmentContainer = waveformEffectSegmentTemplate.content
      .cloneNode(true)
      .querySelector(".waveformEffectSegment");

    const effectContainer =
      waveformEffectSegmentContainer.querySelector(".effect").parentElement;
    const delayContainer =
      waveformEffectSegmentContainer.querySelector(".delay").parentElement;

    /** @type {HTMLSelectElement} */
    const waveformEffectTypeSelect =
      waveformEffectSegmentContainer.querySelector(".type");
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
          throw Error(
            `uncaught waveformEffectTypeSelect value "${waveformEffectTypeSelect.value}"`
          );
      }

      effectContainer.style.display = shouldShowEffectContainer ? "" : "none";
      delayContainer.style.display = shouldShowDelayContainer ? "" : "none";
    });
    waveformEffectTypeSelect.dispatchEvent(new Event("input"));

    waveformEffectSegmentContainer
      .querySelector(".delete")
      .addEventListener("click", () => {
        waveformEffectSegmentContainer.remove();
        updateAddWaveformEffectSegmentButton();
      });

    waveformEffectSegmentsContainer.appendChild(waveformEffectSegmentContainer);
    updateAddWaveformEffectSegmentButton();
  });

  /** @type {HTMLElement} */
  const waveformContainer = vibrationContainer.querySelector(".waveform");
  /** @type {HTMLUListElement} */
  const waveformSegmentsContainer =
    waveformContainer.querySelector(".segments");

  /** @type {HTMLButtonElement} */
  const addWaveformSegmentButton = waveformContainer.querySelector(".add");
  const updateAddWaveformSegmentButton = () => {
    addWaveformSegmentButton.disabled =
      waveformSegmentsContainer.children.length >=
      BS.MaxNumberOfVibrationWaveformSegments;
  };
  addWaveformSegmentButton.addEventListener("click", () => {
    /** @type {HTMLElement} */
    const waveformSegmentContainer = waveformSegmentTemplate.content
      .cloneNode(true)
      .querySelector(".waveformSegment");

    waveformSegmentContainer
      .querySelector(".delete")
      .addEventListener("click", () => {
        waveformSegmentContainer.remove();
        updateAddWaveformSegmentButton();
      });

    waveformSegmentsContainer.appendChild(waveformSegmentContainer);
    updateAddWaveformSegmentButton();
  });

  /** @type {HTMLSelectElement} */
  const vibrationTypeSelect = vibrationContainer.querySelector(".type");
  /** @type {HTMLOptGroupElement} */
  const vibrationTypeSelectOptgroup =
    vibrationTypeSelect.querySelector("optgroup");
  BS.VibrationTypes.forEach((vibrationType) => {
    vibrationTypeSelectOptgroup.appendChild(new Option(vibrationType));
  });

  vibrationTypeSelect.addEventListener("input", () => {
    let showWaveformContainer = false;
    let showWaveformEffectContainer = false;

    /** @type {BS.VibrationType} */
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

    waveformEffectContainer.style.display = showWaveformEffectContainer
      ? ""
      : "none";
    waveformContainer.style.display = showWaveformContainer ? "" : "none";
  });
  vibrationTypeSelect.dispatchEvent(new Event("input"));

  vibrationTemplate.parentElement.appendChild(vibrationContainer);

  updateTriggerVibrationsButtonDisabled();
});

const triggerVibrationsButton = document.getElementById("triggerVibrations");
triggerVibrationsButton.addEventListener("click", () => {
  /** @type {BS.VibrationConfiguration[]} */
  let vibrationConfigurations = [];
  Array.from(vibrationTemplate.parentElement.querySelectorAll(".vibration"))
    .filter(
      (vibrationContainer) =>
        vibrationContainer.querySelector(".shouldTrigger").checked
    )
    .forEach((vibrationContainer) => {
      /** @type {BS.VibrationConfiguration} */
      const vibrationConfiguration = {
        locations: [],
      };
      Array.from(
        vibrationContainer.querySelectorAll(`[data-vibration-location]`)
      )
        .filter((input) => input.checked)
        .forEach((input) => {
          vibrationConfiguration.locations.push(
            input.dataset.vibrationLocation
          );
        });
      if (vibrationConfiguration.locations.length == 0) {
        return;
      }

      vibrationConfiguration.type =
        vibrationContainer.querySelector("select.type").value;
      switch (vibrationConfiguration.type) {
        case "waveformEffect":
          vibrationConfiguration.segments = Array.from(
            vibrationContainer.querySelectorAll(
              ".waveformEffect .waveformEffectSegment"
            )
          ).map((waveformEffectSegmentContainer) => {
            /** @type {BS.VibrationWaveformEffectSegment} */
            const waveformEffectSegment = {
              loopCount: Number(
                waveformEffectSegmentContainer.querySelector(".loopCount").value
              ),
            };
            if (
              waveformEffectSegmentContainer.querySelector(".type").value ==
              "effect"
            ) {
              waveformEffectSegment.effect =
                waveformEffectSegmentContainer.querySelector(".effect").value;
            } else {
              waveformEffectSegment.delay = Number(
                waveformEffectSegmentContainer.querySelector(".delay").value
              );
            }
            return waveformEffectSegment;
          });
          vibrationConfiguration.loopCount = Number(
            vibrationContainer.querySelector(
              ".waveformEffect .sequenceLoopCount"
            ).value
          );
          break;
        case "waveform":
          vibrationConfiguration.segments = Array.from(
            vibrationContainer.querySelectorAll(".waveform .waveformSegment")
          ).map((waveformSegmentContainer) => {
            return {
              amplitude: Number(
                waveformSegmentContainer.querySelector(".amplitude").value
              ),
              duration: Number(
                waveformSegmentContainer.querySelector(".duration").value
              ),
            };
          });
          break;
        default:
          throw Error(`invalid vibrationType "${vibrationConfiguration.type}"`);
      }
      vibrationConfigurations.push(vibrationConfiguration);
    });
  console.log({ vibrationConfigurations });
  if (vibrationConfigurations.length > 0) {
    device.triggerVibration(vibrationConfigurations);
  }
});
device.addEventListener("isConnected", () => {
  updateTriggerVibrationsButtonDisabled();
});

function updateTriggerVibrationsButtonDisabled() {
  triggerVibrationsButton.disabled =
    !device.isConnected ||
    vibrationTemplate.parentElement.querySelectorAll(".vibration").length == 0;
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

/** @type {BS.FileType} */
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
    case "wifiServerCert":
      fileInput.accept = ".crt";
      break;
    case "wifiServerKey":
      fileInput.accept = ".key";
      break;
  }
});
/** @type {HTMLOptGroupElement} */
const fileTransferTypesOptgroup =
  fileTransferTypesSelect.querySelector("optgroup");
BS.FileTypes.forEach((fileType) => {
  fileTransferTypesOptgroup.appendChild(new Option(fileType));
});
fileTransferTypesSelect.dispatchEvent(new Event("input"));
device.addEventListener("connected", () => {
  fileTransferTypesSelect.querySelectorAll("option").forEach((option) => {
    option.hidden =
      BS.FileTypes.includes(option.value) &&
      !device.fileTypes.includes(option.value);
  });
});

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
toggleFileTransferButton.addEventListener("click", async () => {
  if (device.fileTransferStatus == "idle") {
    if (fileTransferDirection == "send") {
      if (fileType == "tflite") {
        await device.setTfliteName(file.name.replaceAll(".tflite", ""));
      }
      device.sendFile(fileType, file);
    } else {
      device.receiveFile(fileType);
    }
  } else {
    device.cancelFileTransfer();
  }
});
const updateToggleFileTransferButton = () => {
  const enabled =
    device.isConnected && (file || fileTransferDirection == "receive");
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

/** @type {BS.FileTransferDirection} */
let fileTransferDirection;
/** @type {HTMLSelectElement} */
const fileTransferDirectionSelect = document.getElementById(
  "fileTransferDirection"
);
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

function updateSetTfliteNameButton() {
  const enabled = device.isConnected && setTfliteNameInput.value.length > 0;
  setTfliteNameButton.disabled = !enabled;
}

device.addEventListener("isConnected", () => {
  const disabled = !device.isConnected;
  setTfliteNameInput.disabled = disabled;
  updateSetTfliteNameButton();
});

setTfliteNameInput.addEventListener("input", () => {
  updateSetTfliteNameButton();
});

device.addEventListener("getTfliteName", () => {
  tfliteNameSpan.innerText = device.tfliteName;

  setTfliteNameButton.innerText = "set name";
  setTfliteNameButton.disabled = !device.isConnected;

  setTfliteNameInput.value = "";
  setTfliteNameInput.disabled = false;
  updateSetTfliteNameButton();
});

setTfliteNameButton.addEventListener("click", () => {
  device.setTfliteName(setTfliteNameInput.value);

  setTfliteNameInput.disabled = true;

  setTfliteNameButton.innerText = "setting name...";
  setTfliteNameButton.disabled = true;
});

/** @type {HTMLSpanElement} */
const tfliteTaskSpan = document.getElementById("tfliteTask");
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

BS.TfliteTasks.forEach((task) => {
  setTfliteTaskOptgroup.appendChild(new Option(task));
});

device.addEventListener("getTfliteTask", () => {
  const task = device.tfliteTask;
  setTfliteTaskSelect.value = task;
  tfliteTaskSpan.innerText = task;
});

setTfliteTaskButton.addEventListener("click", () => {
  device.setTfliteTask(setTfliteTaskSelect.value);
});
device.addEventListener("getTfliteInferencingEnabled", () => {
  setTfliteTaskButton.disabled = device.tfliteInferencingEnabled;
});

/** @type {HTMLSpanElement} */
const tfliteSampleRateSpan = document.getElementById("tfliteSampleRate");
/** @type {HTMLInputElement} */
const setTfliteSampleRateInput = document.getElementById(
  "setTfliteSampleRateInput"
);
/** @type {HTMLButtonElement} */
const setTfliteSampleRateButton = document.getElementById(
  "setTfliteSampleRateButton"
);

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

const tfliteSensorTypesContainer = document.getElementById("tfliteSensorTypes");
/** @type {HTMLTemplateElement} */
const tfliteSensorTypeTemplate = document.getElementById(
  "tfliteSensorTypeTemplate"
);
/** @type {Object.<string, HTMLElement>} */
const tfliteSensorTypeContainers = {};
/** @type {BS.SensorType[]} */
let tfliteSensorTypes = [];
/** @type {HTMLButtonElement} */
const setTfliteSensorTypesButton = document.getElementById(
  "setTfliteSensorTypes"
);

BS.TfliteSensorTypes.forEach((sensorType) => {
  const sensorTypeContainer = tfliteSensorTypeTemplate.content
    .cloneNode(true)
    .querySelector(".sensorType");
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
    isSensorEnabledInput.checked =
      device.tfliteSensorTypes.includes(sensorType);
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
device.addEventListener("tfliteIsReady", () => {
  setTfliteIsReadyInput.checked = device.tfliteIsReady;
});

/** @type {HTMLSpanElement} */
const tfliteThresholdSpan = document.getElementById("tfliteThreshold");
/** @type {HTMLInputElement} */
const setTfliteThresholdInput = document.getElementById(
  "setTfliteThresholdInput"
);
/** @type {HTMLButtonElement} */
const setTfliteThresholdButton = document.getElementById(
  "setTfliteThresholdButton"
);

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
const setTfliteCaptureDelayInput = document.getElementById(
  "setTfliteCaptureDelayInput"
);
/** @type {HTMLButtonElement} */
const setTfliteCaptureDelayButton = document.getElementById(
  "setTfliteCaptureDelayButton"
);

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
const tfliteInferencingEnabledInput = document.getElementById(
  "tfliteInferencingEnabled"
);
/** @type {HTMLButtonElement} */
const toggleTfliteInferencingEnabledButton = document.getElementById(
  "toggleTfliteInferencingEnabled"
);

device.addEventListener("tfliteIsReady", () => {
  toggleTfliteInferencingEnabledButton.disabled = !device.tfliteIsReady;
});
device.addEventListener("getTfliteInferencingEnabled", () => {
  tfliteInferencingEnabledInput.checked = device.tfliteInferencingEnabled;
  toggleTfliteInferencingEnabledButton.innerText =
    device.tfliteInferencingEnabled
      ? "disable inferencing"
      : "enable inferencing";
});

toggleTfliteInferencingEnabledButton.addEventListener("click", () => {
  device.toggleTfliteInferencing();
});

/** @type {String[]} */
let inferenceClasses = [];

/** @type {HTMLTextAreaElement} */
const inferenceClassesTextArea = document.getElementById("inferenceClasses");
inferenceClassesTextArea.addEventListener("input", () => {
  inferenceClasses = inferenceClassesTextArea.value.split("\n").filter(Boolean);
  console.log("inferenceClasses", inferenceClasses);
  localStorage.setItem("BS.inferenceClasses", JSON.stringify(inferenceClasses));
});
if (localStorage.getItem("BS.inferenceClasses")) {
  inferenceClasses = JSON.parse(localStorage.getItem("BS.inferenceClasses"));
  inferenceClassesTextArea.value = inferenceClasses.join("\n");
}

/** @type {HTMLElement} */
const topInferenceClassElement = document.getElementById("topInferenceClass");

/** @type {HTMLPreElement} */
const tfliteInferencePre = document.getElementById("tfliteInference");
device.addEventListener("tfliteInference", (event) => {
  const { tfliteInference } = event.message;
  console.log("inference", tfliteInference);
  tfliteInferencePre.textContent = JSON.stringify(tfliteInference, null, 2);

  if (device.tfliteTask == "classification") {
    topInferenceClassElement.innerText =
      inferenceClasses[tfliteInference.maxIndex - 1] ?? "";
  }
});

// FIRMWARE

/** @type {File?} */
let firmware;

/** @type {HTMLInputElement} */
const firmwareInput = document.getElementById("firmwareInput");
firmwareInput.addEventListener("input", () => {
  firmware = firmwareInput.files[0];
  updateToggleFirmwareUploadButton();
});
/** @type {HTMLButtonElement} */
const toggleFirmwareUploadButton = document.getElementById(
  "toggleFirmwareUpload"
);
toggleFirmwareUploadButton.addEventListener("click", () => {
  device.uploadFirmware(firmware);
});
const updateToggleFirmwareUploadButton = () => {
  const enabled = device.isConnected && Boolean(firmware);
  toggleFirmwareUploadButton.disabled = !enabled;
};
device.addEventListener("isConnected", () => {
  updateToggleFirmwareUploadButton();
});

/** @type {HTMLProgressElement} */
const firmwareUploadProgress = document.getElementById(
  "firmwareUploadProgress"
);
/** @type {HTMLSpanElement} */
const firmwareUploadProgressPercentageSpan = document.getElementById(
  "firmwareUploadProgressPercentage"
);
device.addEventListener("firmwareUploadProgress", (event) => {
  const progress = event.message.progress;
  firmwareUploadProgress.value = progress;
  firmwareUploadProgressPercentageSpan.innerText = `${Math.floor(
    100 * progress
  )}%`;
});
device.addEventListener("firmwareUploadComplete", () => {
  firmwareUploadProgress.value = 0;
});
device.addEventListener("firmwareStatus", () => {
  const isUploading = device.firmwareStatus == "uploading";
  firmwareUploadProgressPercentageSpan.style.display = isUploading
    ? ""
    : "none";
});

/** @type {HTMLPreElement} */
const firmwareImagesPre = document.getElementById("firmwareImages");
device.addEventListener("firmwareImages", () => {
  firmwareImagesPre.textContent = JSON.stringify(
    device.firmwareImages,
    (key, value) => (key == "hash" ? Array.from(value).join(",") : value),
    2
  );
});

device.addEventListener("isConnected", () => {
  if (device.isConnected && device.canUpdateFirmware) {
    device.getFirmwareImages();
  }
});

/** @type {HTMLSpanElement} */
const firmwareStatusSpan = document.getElementById("firmwareStatus");
device.addEventListener("firmwareStatus", () => {
  firmwareStatusSpan.innerText = device.firmwareStatus;

  updateResetButton();
  updateTestFirmwareImageButton();
  updateConfirmFirmwareImageButton();
  updateEraseFirmwareImageButton();
  updateSelectImageSelect();
});

/** @type {HTMLButtonElement} */
const resetButton = document.getElementById("reset");
resetButton.addEventListener("click", () => {
  device.reset();
  resetButton.disabled = true;
});
const updateResetButton = () => {
  const status = device.firmwareStatus;
  const enabled = status == "pending" || status == "testing";
  resetButton.disabled = !enabled || !device.canReset;
};

/** @type {HTMLButtonElement} */
const testFirmwareImageButton = document.getElementById("testFirmwareImage");
testFirmwareImageButton.addEventListener("click", () => {
  device.testFirmwareImage(selectedImageIndex);
});
const updateTestFirmwareImageButton = () => {
  const enabled = device.firmwareStatus == "uploaded";
  testFirmwareImageButton.disabled = !enabled;
};

/** @type {HTMLButtonElement} */
const confirmFirmwareImageButton = document.getElementById(
  "confirmFirmwareImage"
);
confirmFirmwareImageButton.addEventListener("click", () => {
  device.confirmFirmwareImage(selectedImageIndex);
});
const updateConfirmFirmwareImageButton = () => {
  const enabled =
    device.firmwareStatus == "testing" || device.firmwareStatus == "uploaded";
  confirmFirmwareImageButton.disabled = !enabled;
};

/** @type {HTMLButtonElement} */
const eraseFirmwareImageButton = document.getElementById("eraseFirmwareImage");
eraseFirmwareImageButton.addEventListener("click", () => {
  device.eraseFirmwareImage();
});
const updateEraseFirmwareImageButton = () => {
  const enabled = device.firmwareStatus == "uploaded";
  eraseFirmwareImageButton.disabled = !enabled;
};

/** @type {HTMLSelectElement} */
const imageSelectionSelect = document.getElementById("imageSelection");
/** @type {HTMLOptGroupElement} */
const imageSelectionOptGroup = imageSelectionSelect.querySelector("optgroup");
device.addEventListener("firmwareImages", () => {
  imageSelectionOptGroup.innerHTML = "";
  device.firmwareImages.forEach((firmwareImage, index) => {
    const option = new Option(
      `${firmwareImage.version} (slot ${index})`,
      index
    );
    option.disabled = firmwareImage.empty;
    imageSelectionOptGroup.appendChild(option);
  });
  imageSelectionSelect.dispatchEvent(new Event("input"));
});
imageSelectionSelect.addEventListener("input", () => {
  selectedImageIndex = Number(imageSelectionSelect.value);
  console.log({ selectedImageIndex });
});
let selectedImageIndex = 0;
device.addEventListener("isConnected", () => {
  imageSelectionSelect.disabled = !device.isConnected;
});

function updateSelectImageSelect() {
  let enabled = true;
  switch (device.firmwareStatus) {
    case "uploading":
    case "erasing":
      enabled = false;
      break;
  }
  imageSelectionSelect.disabled = !enabled;
}

// WIFI

/** @type {HTMLSpanElement} */
const isWifiAvailableSpan = document.getElementById("isWifiAvailable");
device.addEventListener("isWifiAvailable", (event) => {
  isWifiAvailableSpan.innerText = event.message.isWifiAvailable;
});

/** @type {HTMLSpanElement} */
const wifiSSIDSpan = document.getElementById("wifiSSID");
device.addEventListener("getWifiSSID", (event) => {
  wifiSSIDSpan.innerText = event.message.wifiSSID;
});
/** @type {HTMLInputElement} */
const setWifiSSIDInput = document.getElementById("setWifiSSIDInput");
setWifiSSIDInput.min = BS.MinWifiSSIDLength;
setWifiSSIDInput.max = BS.MaxWifiSSIDLength;
setWifiSSIDInput.addEventListener("input", () => {
  setWifiSSIDButton.disabled = !(
    setWifiSSIDInput.value.length > BS.MinWifiSSIDLength &&
    setWifiSSIDInput.value.length < BS.MaxWifiSSIDLength
  );
});
/** @type {HTMLButtonElement} */
const setWifiSSIDButton = document.getElementById("setWifiSSIDButton");
setWifiSSIDButton.addEventListener("click", async () => {
  setWifiSSIDButton.disabled = true;
  setWifiSSIDButton.innerText = "setting wifi ssid";
  await device.setWifiSSID(setWifiSSIDInput.value);
  setWifiSSIDInput.value = "";
  setWifiSSIDButton.disabled = false;
  setWifiSSIDButton.innerText = "set wifi ssid";
});

/** @type {HTMLSpanElement} */
const wifiPasswordSpan = document.getElementById("wifiPassword");
device.addEventListener("getWifiPassword", (event) => {
  wifiPasswordSpan.innerText = event.message.wifiPassword;
});
/** @type {HTMLInputElement} */
const setWifiPasswordInput = document.getElementById("setWifiPasswordInput");
setWifiPasswordInput.min = BS.MinWifiPasswordLength;
setWifiPasswordInput.max = BS.MaxWifiPasswordLength;
setWifiPasswordInput.addEventListener("input", () => {
  const length = setWifiPasswordInput.value.length;
  setWifiPasswordButton.disabled = !(
    length == 0 ||
    (length > BS.MinWifiPasswordLength && length < BS.MaxWifiPasswordLength)
  );
});
/** @type {HTMLButtonElement} */
const setWifiPasswordButton = document.getElementById("setWifiPasswordButton");
setWifiPasswordButton.addEventListener("click", async () => {
  setWifiPasswordButton.disabled = true;
  setWifiPasswordButton.innerText = "setting wifi password";
  await device.setWifiPassword(setWifiPasswordInput.value);
  setWifiPasswordInput.value = "";
  setWifiPasswordButton.disabled = false;
  setWifiPasswordButton.innerText = "set wifi password";
});

const updateWifiInputs = () => {
  const enabled =
    device.isConnected &&
    device.isWifiAvailable &&
    !device.wifiConnectionEnabled;
  const disabled = !enabled;

  setWifiPasswordInput.disabled = disabled;
  setWifiPasswordButton.disabled = disabled;

  setWifiSSIDInput.disabled = disabled;
  setWifiSSIDButton.disabled = disabled;

  toggleWifiConnectionButton.disabled = !(
    device.isConnected && device.isWifiAvailable
  );
};
device.addEventListener("isConnected", () => {
  updateWifiInputs();
});
device.addEventListener("getWifiConnectionEnabled", () => {
  updateWifiInputs();
});

/** @type {HTMLSpanElement} */
const wifiConnectionEnabledSpan = document.getElementById(
  "wifiConnectionEnabled"
);
device.addEventListener("getWifiConnectionEnabled", (event) => {
  wifiConnectionEnabledSpan.innerText = event.message.wifiConnectionEnabled;
});

/** @type {HTMLSpanElement} */
const isWifiConnectedSpan = document.getElementById("isWifiConnected");
device.addEventListener("isWifiConnected", (event) => {
  isWifiConnectedSpan.innerText = event.message.isWifiConnected;
});

/** @type {HTMLSpanElement} */
const ipAddressSpan = document.getElementById("ipAddress");
device.addEventListener("ipAddress", (event) => {
  ipAddressSpan.innerText = event.message.ipAddress || "none";
});

/** @type {HTMLButtonElement} */
const toggleWifiConnectionButton = document.getElementById(
  "toggleWifiConnection"
);
toggleWifiConnectionButton.addEventListener("click", async () => {
  toggleWifiConnectionButton.disabled = true;
  await device.toggleWifiConnection();
  toggleWifiConnectionButton.disabled = false;
});
device.addEventListener("getWifiConnectionEnabled", (event) => {
  toggleWifiConnectionButton.innerText = event.message.wifiConnectionEnabled
    ? "disable wifi connection"
    : "enable wifi connection";
});

/** @type {HTMLButtonElement} */
const connectViaWebSocketsButton = document.getElementById(
  "connectViaWebSockets"
);
connectViaWebSocketsButton.addEventListener("click", async () => {
  toggleWifiConnectionButton.disabled = true;
  device.reconnectViaWebSockets();
});
const updateConnectViaWebSocketsButton = () => {
  const enabled =
    device.isConnected &&
    device.connectionType == "webBluetooth" &&
    device.isWifiConnected;
  console.log({ enabled });
  connectViaWebSocketsButton.disabled = !enabled;
};
device.addEventListener("isWifiConnected", () =>
  updateConnectViaWebSocketsButton()
);
device.addEventListener("isConnected", () =>
  updateConnectViaWebSocketsButton()
);

// CAMERA
/** @type {HTMLSpanElement} */
const isCameraAvailableSpan = document.getElementById("isCameraAvailable");
device.addEventListener("connected", () => {
  isCameraAvailableSpan.innerText = device.hasCamera;
});

/** @type {HTMLSpanElement} */
const cameraStatusSpan = document.getElementById("cameraStatus");
device.addEventListener("cameraStatus", () => {
  cameraStatusSpan.innerText = device.cameraStatus;
});

/** @type {HTMLButtonElement} */
const takePictureButton = document.getElementById("takePicture");
takePictureButton.addEventListener("click", () => {
  if (device.cameraStatus == "idle") {
    device.takePicture();
  } else {
    device.stopCamera();
  }
});
device.addEventListener("connected", () => {
  updateTakePictureButton();
});
device.addEventListener("getSensorConfiguration", () => {
  updateTakePictureButton();
});
const updateTakePictureButton = () => {
  takePictureButton.disabled =
    !device.isConnected ||
    device.sensorConfiguration.camera == 0 ||
    device.cameraStatus != "idle";
};
device.addEventListener("cameraStatus", () => {
  updateTakePictureButton();
});

/** @type {HTMLButtonElement} */
const focusCameraButton = document.getElementById("focusCamera");
focusCameraButton.addEventListener("click", () => {
  if (device.cameraStatus == "idle") {
    device.focusCamera();
  } else {
    device.stopCamera();
  }
});
device.addEventListener("connected", () => {
  updateFocusCameraButton();
});
device.addEventListener("getSensorConfiguration", () => {
  updateFocusCameraButton();
});
const updateFocusCameraButton = () => {
  focusCameraButton.disabled =
    !device.isConnected ||
    device.sensorConfiguration.camera == 0 ||
    device.cameraStatus != "idle";
};
device.addEventListener("cameraStatus", (event) => {
  updateFocusCameraButton();
  if (
    device.cameraStatus == "idle" &&
    event.message.previousCameraStatus == "focusing"
  ) {
    device.takePicture();
  }
});

/** @type {HTMLButtonElement} */
const sleepCameraButton = document.getElementById("sleepCamera");
sleepCameraButton.addEventListener("click", () => {
  if (device.cameraStatus == "asleep") {
    device.wakeCamera();
  } else {
    device.sleepCamera();
  }
});
device.addEventListener("connected", () => {
  updateSleepCameraButton();
});
device.addEventListener("getSensorConfiguration", () => {
  updateSleepCameraButton();
});
const updateSleepCameraButton = () => {
  let disabled = !device.isConnected || !device.hasCamera;
  switch (device.cameraStatus) {
    case "asleep":
      sleepCameraButton.innerText = "wake camera";
      break;
    case "idle":
      sleepCameraButton.innerText = "sleep camera";
      break;
    default:
      disabled = true;
      break;
  }
  sleepCameraButton.disabled = disabled;
};
device.addEventListener("cameraStatus", () => {
  updateSleepCameraButton();
});

/** @type {HTMLImageElement} */
const cameraImage = document.getElementById("cameraImage");
device.addEventListener("cameraImage", (event) => {
  cameraImage.src = event.message.url;
});

/** @type {HTMLProgressElement} */
const cameraImageProgress = document.getElementById("cameraImageProgress");
device.addEventListener("cameraImageProgress", (event) => {
  if (event.message.type == "image") {
    cameraImageProgress.value = event.message.progress;
  }
});

/** @type {HTMLInputElement} */
const autoPictureCheckbox = document.getElementById("autoPicture");
let autoPicture = autoPictureCheckbox.checked;
autoPictureCheckbox.addEventListener("input", () => {
  autoPicture = autoPictureCheckbox.checked;
});
device.addEventListener("cameraImage", () => {
  if (autoPicture) {
    device.takePicture();
  }
});

/** @type {HTMLPreElement} */
const cameraConfigurationPre = document.getElementById(
  "cameraConfigurationPre"
);
device.addEventListener("getCameraConfiguration", () => {
  cameraConfigurationPre.textContent = JSON.stringify(
    device.cameraConfiguration,
    null,
    2
  );
});

const cameraConfigurationContainer = document.getElementById(
  "cameraConfiguration"
);
/** @type {HTMLTemplateElement} */
const cameraConfigurationTypeTemplate = document.getElementById(
  "cameraConfigurationTypeTemplate"
);
BS.CameraConfigurationTypes.forEach((cameraConfigurationType) => {
  const cameraConfigurationTypeContainer =
    cameraConfigurationTypeTemplate.content
      .cloneNode(true)
      .querySelector(".cameraConfigurationType");

  cameraConfigurationContainer.appendChild(cameraConfigurationTypeContainer);

  cameraConfigurationTypeContainer.querySelector(".type").innerText =
    cameraConfigurationType;

  /** @type {HTMLInputElement} */
  const input = cameraConfigurationTypeContainer.querySelector("input");

  /** @type {HTMLSpanElement} */
  const span = cameraConfigurationTypeContainer.querySelector("span");

  device.addEventListener("isConnected", () => {
    updateisInputDisabled();
  });
  device.addEventListener("cameraStatus", () => {
    updateisInputDisabled();
  });
  const updateisInputDisabled = () => {
    input.disabled =
      !device.isConnected || !device.hasCamera || device.cameraStatus != "idle";
  };

  const updateInput = () => {
    const value = device.cameraConfiguration[cameraConfigurationType];
    span.innerText = value;
    input.value = value;
  };

  device.addEventListener("connected", () => {
    if (!device.hasCamera) {
      return;
    }
    const range = device.cameraConfigurationRanges[cameraConfigurationType];
    input.min = range.min;
    input.max = range.max;

    updateInput();
  });

  device.addEventListener("getCameraConfiguration", () => {
    updateInput();
  });

  input.addEventListener("change", () => {
    const value = Number(input.value);
    // console.log(`updating ${cameraConfigurationType} to ${value}`);
    device.setCameraConfiguration({
      [cameraConfigurationType]: value,
    });
    if (takePictureAfterUpdate) {
      device.addEventListener(
        "getCameraConfiguration",
        () => {
          setTimeout(() => device.takePicture()), 100;
        },
        { once: true }
      );
    }
  });
});

/** @type {HTMLInputElement} */
const takePictureAfterUpdateCheckbox = document.getElementById(
  "takePictureAfterUpdate"
);
let takePictureAfterUpdate = false;
takePictureAfterUpdateCheckbox.addEventListener("input", () => {
  takePictureAfterUpdate = takePictureAfterUpdateCheckbox.checked;
  console.log({ takePictureAfterUpdate });
});

/** @type {HTMLInputElement} */
const cameraWhiteBalanceInput = document.getElementById("cameraWhiteBalance");
const updateWhiteBalance = BS.ThrottleUtils.throttle(
  (config) => {
    if (device.cameraStatus != "idle") {
      return;
    }

    device.setCameraConfiguration(config);

    if (takePictureAfterUpdate) {
      device.addEventListener(
        "getCameraConfiguration",
        () => {
          setTimeout(() => device.takePicture()), 100;
        },
        { once: true }
      );
    }
  },
  200,
  true
);
cameraWhiteBalanceInput.addEventListener("input", () => {
  let [redGain, greenGain, blueGain] = cameraWhiteBalanceInput.value
    .replace("#", "")
    .match(/.{1,2}/g)
    .map((value) => Number(`0x${value}`))
    .map((value) => value / 255)
    .map((value) => value * device.cameraConfigurationRanges.blueGain.max)
    .map((value) => Math.round(value));

  updateWhiteBalance({ redGain, greenGain, blueGain });
});
const updateCameraWhiteBalanceInput = () => {
  if (!device.hasCamera) {
    return;
  }
  cameraWhiteBalanceInput.disabled =
    !device.isConnected || !device.hasCamera || device.cameraStatus != "idle";

  const { redGain, blueGain, greenGain } = device.cameraConfiguration;

  cameraWhiteBalanceInput.value = `#${[redGain, blueGain, greenGain]
    .map((value) => value / device.cameraConfigurationRanges.redGain.max)
    .map((value) => value * 255)
    .map((value) => Math.round(value))
    .map((value) => value.toString(16))
    .join("")}`;
};
device.addEventListener("connected", () => {
  updateCameraWhiteBalanceInput();
});
device.addEventListener("getCameraConfiguration", () => {
  updateCameraWhiteBalanceInput();
});
