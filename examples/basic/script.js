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

// MICROPHONE

/** @type {HTMLSpanElement} */
const isMicrophoneAvailableSpan = document.getElementById(
  "isMicrophoneAvailable"
);
device.addEventListener("connected", () => {
  isMicrophoneAvailableSpan.innerText = device.hasMicrophone;
});

/** @type {HTMLSpanElement} */
const microphoneStatusSpan = document.getElementById("microphoneStatus");
device.addEventListener("microphoneStatus", () => {
  microphoneStatusSpan.innerText = device.microphoneStatus;
});

/** @type {HTMLPreElement} */
const microphoneConfigurationPre = document.getElementById(
  "microphoneConfigurationPre"
);
device.addEventListener("getMicrophoneConfiguration", () => {
  microphoneConfigurationPre.textContent = JSON.stringify(
    device.microphoneConfiguration,
    null,
    2
  );
});

const microphoneConfigurationContainer = document.getElementById(
  "microphoneConfiguration"
);
/** @type {HTMLTemplateElement} */
const microphoneConfigurationTypeTemplate = document.getElementById(
  "microphoneConfigurationTypeTemplate"
);
BS.MicrophoneConfigurationTypes.forEach((microphoneConfigurationType) => {
  const microphoneConfigurationTypeContainer =
    microphoneConfigurationTypeTemplate.content
      .cloneNode(true)
      .querySelector(".microphoneConfigurationType");

  microphoneConfigurationContainer.appendChild(
    microphoneConfigurationTypeContainer
  );

  microphoneConfigurationTypeContainer.querySelector(".type").innerText =
    microphoneConfigurationType;

  /** @type {HTMLSelectElement} */
  const select = microphoneConfigurationTypeContainer.querySelector("select");
  /** @type {HTMLOptGroupElement} */
  const optgroup = select.querySelector("optgroup");
  optgroup.label = microphoneConfigurationType;

  BS.MicrophoneConfigurationValues[microphoneConfigurationType].forEach(
    (value) => {
      optgroup.appendChild(new Option(value));
    }
  );

  /** @type {HTMLSpanElement} */
  const span = microphoneConfigurationTypeContainer.querySelector("span");

  device.addEventListener("isConnected", () => {
    updateisInputDisabled();
  });
  device.addEventListener("microphoneStatus", () => {
    updateisInputDisabled();
  });
  const updateisInputDisabled = () => {
    select.disabled =
      !device.isConnected ||
      !device.hasMicrophone ||
      device.microphoneStatus != "idle";
  };

  const updateSelect = () => {
    const value = device.microphoneConfiguration[microphoneConfigurationType];
    span.innerText = value;
    select.value = value;
  };

  device.addEventListener("connected", () => {
    if (!device.hasMicrophone) {
      return;
    }
    updateSelect();
  });

  device.addEventListener("getMicrophoneConfiguration", () => {
    updateSelect();
  });

  select.addEventListener("input", () => {
    const value = select.value;
    // console.log(`updating ${microphoneConfigurationType} to ${value}`);
    device.setMicrophoneConfiguration({
      [microphoneConfigurationType]: value,
    });
  });
});

/** @type {HTMLButtonElement} */
const toggleMicrophoneButton = document.getElementById("toggleMicrophone");
toggleMicrophoneButton.addEventListener("click", () => {
  device.toggleMicrophone();
});
device.addEventListener("connected", () => {
  updateToggleMicrophoneButton();
});
device.addEventListener("getSensorConfiguration", () => {
  updateToggleMicrophoneButton();
});
const updateToggleMicrophoneButton = () => {
  let disabled =
    !device.isConnected ||
    device.sensorConfiguration.microphone == 0 ||
    !device.hasMicrophone;

  switch (device.microphoneStatus) {
    case "streaming":
      toggleMicrophoneButton.innerText = "stop microphone";
      break;
    case "idle":
      toggleMicrophoneButton.innerText = "start microphone";
      break;
  }
  toggleMicrophoneButton.disabled = disabled;
};
device.addEventListener("microphoneStatus", () => {
  updateToggleMicrophoneButton();
});

/** @type {HTMLButtonElement} */
const startMicrophoneButton = document.getElementById("startMicrophone");
startMicrophoneButton.addEventListener("click", () => {
  device.startMicrophone();
});
/** @type {HTMLButtonElement} */
const stopMicrophoneButton = document.getElementById("stopMicrophone");
stopMicrophoneButton.addEventListener("click", () => {
  device.stopMicrophone();
});
/** @type {HTMLButtonElement} */
const enableMicrophoneVadButton = document.getElementById("enableMicrphoneVad");
enableMicrophoneVadButton.addEventListener("click", () => {
  device.enableMicrophoneVad();
});

const updateMicrophoneButtons = () => {
  let disabled =
    !device.isConnected ||
    device.sensorConfiguration.microphone == 0 ||
    !device.hasMicrophone;

  startMicrophoneButton.disabled =
    disabled || device.microphoneStatus == "streaming";
  stopMicrophoneButton.disabled = disabled || device.microphoneStatus == "idle";
  enableMicrophoneVadButton.disabled =
    disabled || device.microphoneStatus == "vad";
};
device.addEventListener("microphoneStatus", () => {
  updateMicrophoneButtons();
});
device.addEventListener("connected", () => {
  updateMicrophoneButtons();
});
device.addEventListener("getSensorConfiguration", () => {
  updateMicrophoneButtons();
});

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const checkAudioContextState = () => {
  const { state } = audioContext;
  console.log({ audioContextState: state });
  if (state != "running") {
    document.addEventListener("click", () => audioContext.resume(), {
      once: true,
    });
  }
};
audioContext.addEventListener("statechange", () => {
  checkAudioContextState();
});
checkAudioContextState();

device.audioContext = audioContext;

/** @type {HTMLAudioElement} */
const microphoneStreamAudioElement =
  document.getElementById("microphoneStream");
microphoneStreamAudioElement.srcObject =
  device.microphoneMediaStreamDestination.stream;

/** @type {HTMLAudioElement} */
const microphoneRecordingAudioElement = document.getElementById(
  "microphoneRecording"
);
/** @type {HTMLInputElement} */
const autoPlayMicrphoneRecordingCheckbox = document.getElementById(
  "autoPlayMicrphoneRecording"
);
let autoPlayMicrphoneRecording = autoPlayMicrphoneRecordingCheckbox.checked;
console.log("autoPlayMicrphoneRecording", autoPlayMicrphoneRecording);
autoPlayMicrphoneRecordingCheckbox.addEventListener("input", () => {
  autoPlayMicrphoneRecording = autoPlayMicrphoneRecordingCheckbox.checked;
  console.log({ autoPlayMicrphoneRecording });
});
device.addEventListener("microphoneRecording", (event) => {
  microphoneRecordingAudioElement.src = event.message.url;
  if (autoPlayMicrphoneRecording) {
    microphoneRecordingAudioElement.play();
  }
});

/** @type {HTMLButtonElement} */
const toggleMicrophoneRecordingButton = document.getElementById(
  "toggleMicrophoneRecording"
);
toggleMicrophoneRecordingButton.addEventListener("click", () => {
  device.toggleMicrophoneRecording();
});
device.addEventListener("connected", () => {
  updateToggleMicrophoneRecordingButton();
});
device.addEventListener("getSensorConfiguration", () => {
  updateToggleMicrophoneRecordingButton();
});
const updateToggleMicrophoneRecordingButton = () => {
  let disabled =
    !device.isConnected ||
    device.sensorConfiguration.microphone == 0 ||
    !device.hasMicrophone ||
    device.microphoneStatus != "streaming";

  toggleMicrophoneRecordingButton.innerText = device.isRecordingMicrophone
    ? "stop recording"
    : "start recording";

  toggleMicrophoneRecordingButton.disabled = disabled;
};
device.addEventListener("isRecordingMicrophone", () => {
  updateToggleMicrophoneRecordingButton();
});
device.addEventListener("microphoneStatus", () => {
  updateToggleMicrophoneRecordingButton();
});

// DISPLAY

/** @type {HTMLSpanElement} */
const isDisplayAvailableSpan = document.getElementById("isDisplayAvailable");
device.addEventListener("connected", () => {
  isDisplayAvailableSpan.innerText = device.isDisplayAvailable;
});

/** @type {HTMLSpanElement} */
const displayStatusSpan = document.getElementById("displayStatus");
device.addEventListener("displayStatus", () => {
  if (!device.isDisplayAvailable) {
    return;
  }
  displayStatusSpan.innerText = device.displayStatus;
});

/** @type {HTMLButtonElement} */
const toggleDisplayButton = document.getElementById("toggleDisplay");
toggleDisplayButton.addEventListener("click", () => {
  device.toggleDisplay();
});
device.addEventListener("connected", () => {
  updateToggleDisplayButton();
});
device.addEventListener("displayStatus", () => {
  updateToggleDisplayButton();
});
const updateToggleDisplayButton = () => {
  if (!device.isDisplayAvailable) {
    return;
  }
  let disabled = !device.isConnected || !device.isDisplayAvailable;
  switch (device.displayStatus) {
    case "asleep":
      toggleDisplayButton.innerText = "enable display";
      break;
    case "awake":
      toggleDisplayButton.innerText = "disable display";
      break;
    default:
      disabled = true;
      break;
  }
  toggleDisplayButton.disabled = disabled;
};

/** @type {HTMLPreElement} */
const displayInformationPre = document.getElementById("displayInformationPre");
device.addEventListener("displayInformation", () => {
  displayInformationPre.textContent = JSON.stringify(
    device.displayInformation,
    null,
    2
  );
});

/** @type {HTMLSpanElement} */
const displayBrightnessSpan = document.getElementById("displayBrightness");
device.addEventListener("getDisplayBrightness", () => {
  if (!device.isDisplayAvailable) {
    return;
  }
  console.log(`displayBrightness updated to ${device.displayBrightness}`);
  displayBrightnessSpan.innerText = device.displayBrightness;
});

/** @type {HTMLButtonElement} */
const setDisplayBrightnessButton = document.getElementById(
  "setDisplayBrightnessButton"
);

/** @type {HTMLSelectElement} */
const setDisplayBrightnessSelect = document.getElementById(
  "setDisplayBrightnessSelect"
);
/** @type {HTMLOptGroupElement} */
const setDisplayBrightnessSelectOptgroup =
  setDisplayBrightnessSelect.querySelector("optgroup");
BS.DisplayBrightnesses.forEach((displayBrightness) => {
  setDisplayBrightnessSelectOptgroup.appendChild(new Option(displayBrightness));
});

device.addEventListener("isConnected", () => {
  setDisplayBrightnessSelect.disabled = !device.isConnected;
});

device.addEventListener("getDisplayBrightness", () => {
  setDisplayBrightnessSelect.value = device.displayBrightness;
});

setDisplayBrightnessSelect.addEventListener("input", () => {
  setDisplayBrightnessButton.disabled =
    setDisplayBrightnessSelect.value == device.displayBrightness;
});

setDisplayBrightnessButton.addEventListener("click", () => {
  console.log(
    `setting displayBrightness to ${setDisplayBrightnessSelect.value}`
  );
  device.setDisplayBrightness(setDisplayBrightnessSelect.value);
  setDisplayBrightnessButton.disabled = true;
});

/** @type {HTMLTemplateElement} */
const displayColorTemplate = document.getElementById("displayColorTemplate");
const displayColorsContainer = document.getElementById("displayColors");
const setDisplayColor = BS.ThrottleUtils.throttle(
  (colorIndex, colorString) => {
    console.log({ colorIndex, colorString });
    device.setDisplayColor(colorIndex, colorString, true);
  },
  100,
  true
);
device.addEventListener("notConnected", () => {
  displayColorsContainer.innerHTML = "";
});
device.addEventListener("connected", () => {
  displayColorsContainer.innerHTML = "";
  if (device.isDisplayAvailable) {
    for (
      let colorIndex = 0;
      colorIndex < device.numberOfDisplayColors;
      colorIndex++
    ) {
      const displayColorContainer = displayColorTemplate.content
        .cloneNode(true)
        .querySelector(".displayColor");

      const displayColorIndex =
        displayColorContainer.querySelector(".colorIndex");
      displayColorIndex.innerText = `color #${colorIndex}`;
      const displayColorInput = displayColorContainer.querySelector("input");
      displayColorInput.addEventListener("input", () => {
        setDisplayColor(colorIndex, displayColorInput.value);
        if (colorIndex == fillColorIndex) {
          fillColorInput.value = displayColorInput.value;
        }
        if (colorIndex == lineColorIndex) {
          lineColorInput.value = displayColorInput.value;
        }
      });
      displayColorsContainer.appendChild(displayColorContainer);
    }
  }
});

/** @type {HTMLTemplateElement} */
const displayColorOpacityTemplate = document.getElementById(
  "displayColorOpacityTemplate"
);
const displayColorOpacitiesContainer = document.getElementById(
  "displayColorOpacities"
);
const setDisplayColorOpacity = BS.ThrottleUtils.throttle(
  (colorIndex, opacity) => {
    console.log({ colorIndex, opacity });
    device.setDisplayColorOpacity(colorIndex, opacity, true);
  },
  100,
  true
);
device.addEventListener("notConnected", () => {
  displayColorOpacitiesContainer.innerHTML = "";
});
device.addEventListener("connected", () => {
  displayColorOpacitiesContainer.innerHTML = "";
  if (device.isDisplayAvailable) {
    for (
      let colorIndex = 0;
      colorIndex < device.numberOfDisplayColors;
      colorIndex++
    ) {
      const displayColorOpacityContainer = displayColorOpacityTemplate.content
        .cloneNode(true)
        .querySelector(".displayColorOpacity");

      const displayColorOpacityIndex =
        displayColorOpacityContainer.querySelector(".colorIndex");
      displayColorOpacityIndex.innerText = `color opacity #${colorIndex}`;
      const displayColorOpacityInput =
        displayColorOpacityContainer.querySelector("input");
      const displayColorOpacitySpan =
        displayColorOpacityContainer.querySelector("span");
      displayColorOpacityInput.addEventListener("input", () => {
        const opacity = Number(displayColorOpacityInput.value);
        displayColorOpacitySpan.innerText = Math.round(opacity * 100);
        setDisplayColorOpacity(colorIndex, opacity);
      });
      displayColorOpacitiesContainer.appendChild(displayColorOpacityContainer);
    }
  }
});

const displayOpacityContainer = document.getElementById("displayOpacity");
const displayOpacitySpan = displayOpacityContainer.querySelector("span");
const displayOpacityInput = displayOpacityContainer.querySelector("input");

const setDisplayOpacity = BS.ThrottleUtils.throttle(
  (opacity) => {
    console.log({ opacity });
    device.setDisplayOpacity(opacity, true);
  },
  100,
  true
);
displayOpacityInput.addEventListener("input", () => {
  const opacity = Number(displayOpacityInput.value);
  displayOpacitySpan.innerText = Math.round(opacity * 100);
  setDisplayOpacity(opacity);
  displayColorOpacitiesContainer
    .querySelectorAll(".displayColorOpacity")
    .forEach((container) => {
      const input = container.querySelector("input");
      const span = container.querySelector("span");
      input.value = opacity;
      span.innerText = Math.round(opacity * 100);
    });
});

device.addEventListener("isConnected", () => {
  const enabled = device.isConnected && device.isDisplayAvailable;
  displayOpacityInput.disabled = !enabled;
});

const fillColorContainer = document.getElementById("fillColor");
const fillColorSelect = fillColorContainer.querySelector("select");
const fillColorOptgroup = fillColorSelect.querySelector("optgroup");
device.addEventListener("connected", () => {
  if (!device.isDisplayAvailable) {
    return;
  }
  fillColorOptgroup.innerHTML = "";
  for (
    let colorIndex = 0;
    colorIndex < device.numberOfDisplayColors;
    colorIndex++
  ) {
    fillColorOptgroup.appendChild(new Option(colorIndex));
  }
  fillColorSelect.value = fillColorIndex;
});
const fillColorInput = fillColorContainer.querySelector("input");
let fillColorIndex = 1;
fillColorSelect.addEventListener("input", () => {
  fillColorIndex = Number(fillColorSelect.value);
  console.log({ fillColorIndex });
  device.selectDisplayFillColor(fillColorIndex);
  drawShape();
  fillColorInput.value = displayColorsContainer.querySelectorAll(
    ".displayColor input"
  )[fillColorIndex].value;
});
device.addEventListener("isConnected", () => {
  const enabled = device.isConnected && device.isDisplayAvailable;
  fillColorSelect.disabled = !enabled;
});

const lineColorContainer = document.getElementById("lineColor");
const lineColorSelect = lineColorContainer.querySelector("select");
const lineColorOptgroup = lineColorSelect.querySelector("optgroup");
let lineColorIndex = 1;
device.addEventListener("connected", () => {
  if (!device.isDisplayAvailable) {
    return;
  }
  lineColorOptgroup.innerHTML = "";
  for (
    let colorIndex = 0;
    colorIndex < device.numberOfDisplayColors;
    colorIndex++
  ) {
    lineColorOptgroup.appendChild(new Option(colorIndex));
  }
  lineColorSelect.value = lineColorIndex;
});
const lineColorInput = lineColorContainer.querySelector("input");
lineColorSelect.addEventListener("input", () => {
  lineColorIndex = Number(lineColorSelect.value);
  console.log({ lineColorIndex });
  device.selectDisplayLineColor(lineColorIndex);
  drawShape();
  lineColorInput.value = displayColorsContainer.querySelectorAll(
    ".displayColor input"
  )[lineColorIndex].value;
});
device.addEventListener("isConnected", () => {
  const enabled = device.isConnected && device.isDisplayAvailable;
  lineColorSelect.disabled = !enabled;
});

const drawShape = BS.ThrottleUtils.throttle(
  (updatedParams) => {
    if (device.isConnected && device.isDisplayAvailable) {
      console.log("draw", {
        drawShapeType,
        drawWidth,
        drawHeight,
        drawX,
        drawY,
        drawBorderRadius,
      });
      if (updatedParams?.includes("lineWidth")) {
        device.setDisplayLineWidth(lineWidth);
      }
      if (updatedParams?.includes("rotation")) {
        device.setDisplayRotation(rotation);
      }
      if (updatedParams?.includes("segmentStartCap")) {
        device.setDisplaySegmentStartCap(segmentStartCap);
      }
      if (updatedParams?.includes("segmentEndCap")) {
        device.setDisplaySegmentEndCap(segmentEndCap);
      }
      if (updatedParams?.includes("segmentStartRadius")) {
        device.setDisplaySegmentStartRadius(drawSegmentStartRadius);
      }
      if (updatedParams?.includes("segmentEndRadius")) {
        device.setDisplaySegmentEndRadius(drawSegmentEndRadius);
      }

      if (updatedParams?.includes("cropTop")) {
        device.setDisplayCropTop(drawCropTop);
      }
      if (updatedParams?.includes("cropRight")) {
        device.setDisplayCropRight(drawCropRight);
      }
      if (updatedParams?.includes("cropBottom")) {
        device.setDisplayCropBottom(drawCropBottom);
      }
      if (updatedParams?.includes("cropLeft")) {
        device.setDisplayCropLeft(drawCropLeft);
      }

      if (updatedParams?.includes("rotationCropTop")) {
        device.setDisplayRotationCropTop(drawRotationCropTop);
      }
      if (updatedParams?.includes("rotationCropRight")) {
        device.setDisplayRotationCropRight(drawRotationCropRight);
      }
      if (updatedParams?.includes("rotationCropBottom")) {
        device.setDisplayRotationCropBottom(drawRotationCropBottom);
      }
      if (updatedParams?.includes("rotationCropLeft")) {
        device.setDisplayRotationCropLeft(drawRotationCropLeft);
      }

      switch (drawShapeType) {
        case "drawRect":
          device.drawDisplayRect(drawX, drawY, drawWidth, drawHeight);
          break;
        case "drawRoundRect":
          device.drawDisplayRoundRect(
            drawX,
            drawY,
            drawWidth,
            drawHeight,
            drawBorderRadius
          );
          break;
        case "drawCircle":
          device.drawDisplayCircle(drawX, drawY, drawRadius);
          break;
        case "drawEllipse":
          device.drawDisplayEllipse(drawX, drawY, drawWidth, drawHeight);
          break;
        case "drawPolygon":
          device.drawDisplayPolygon(
            drawX,
            drawY,
            drawRadius,
            drawNumberOfSides
          );
          break;
        case "drawLine":
          device.drawDisplayLine(drawX, drawY, drawEndX, drawEndY);
          break;
        default:
          console.error(`uncaught drawShapeType ${drawShapeType}`);
          break;
      }
      device.showDisplay();
    }
  },
  100,
  true
);

const lineWidthContainer = document.getElementById("lineWidth");
const lineWidthInput = lineWidthContainer.querySelector("input");
const lineWidthSpan = lineWidthContainer.querySelector("span");
let lineWidth = Number(lineWidthInput.value);

lineWidthInput.addEventListener("input", () => {
  lineWidth = Number(lineWidthInput.value);
  //console.log({ lineWidth });
  lineWidthSpan.innerText = lineWidth;

  drawShape(["lineWidth"]);
});

const rotationContainer = document.getElementById("rotation");
const rotationInput = rotationContainer.querySelector("input");
const rotationSpan = rotationContainer.querySelector("span");
let rotation = Number(rotationInput.value);

rotationInput.addEventListener("input", () => {
  rotation = Number(rotationInput.value);
  // console.log({ rotation });
  rotationSpan.innerText = rotation;

  drawShape(["rotation"]);
});

const segmentStartCapContainer = document.getElementById("segmentStartCap");
const segmentStartCapSelect = segmentStartCapContainer.querySelector("select");
const segmentStartCapOptgroup = segmentStartCapSelect.querySelector("optgroup");

BS.DisplaySegmentCaps.forEach((segmentStartCap) => {
  segmentStartCapOptgroup.appendChild(new Option(segmentStartCap));
});
let segmentStartCap = segmentStartCapSelect.value;
console.log({ segmentStartCap });

segmentStartCapSelect.addEventListener("input", () => {
  segmentStartCap = segmentStartCapSelect.value;
  console.log({ segmentStartCap });
  drawShape(["segmentStartCap"]);
});

const segmentEndCapContainer = document.getElementById("segmentEndCap");
const segmentEndCapSelect = segmentEndCapContainer.querySelector("select");
const segmentEndCapOptgroup = segmentEndCapSelect.querySelector("optgroup");

BS.DisplaySegmentCaps.forEach((segmentEndCap) => {
  segmentEndCapOptgroup.appendChild(new Option(segmentEndCap));
});
let segmentEndCap = segmentEndCapSelect.value;
console.log({ segmentEndCap });

segmentEndCapSelect.addEventListener("input", () => {
  segmentEndCap = segmentEndCapSelect.value;
  console.log({ segmentEndCap });
  drawShape(["segmentEndCap"]);
});

const drawSegmentStartRadiusContainer = document.getElementById(
  "drawSegmentStartRadius"
);
const drawSegmentStartRadiusInput =
  drawSegmentStartRadiusContainer.querySelector("input");
const drawSegmentStartRadiusSpan =
  drawSegmentStartRadiusContainer.querySelector("span");
let drawSegmentStartRadius = Number(drawSegmentStartRadiusInput.value);

drawSegmentStartRadiusInput.addEventListener("input", () => {
  drawSegmentStartRadius = Number(drawSegmentStartRadiusInput.value);
  //console.log({ drawSegmentStartRadius });
  drawSegmentStartRadiusSpan.innerText = drawSegmentStartRadius;
  drawShape(["segmentStartRadius"]);
});

const drawSegmentEndRadiusContainer = document.getElementById(
  "drawSegmentEndRadius"
);
const drawSegmentEndRadiusInput =
  drawSegmentEndRadiusContainer.querySelector("input");
const drawSegmentEndRadiusSpan =
  drawSegmentEndRadiusContainer.querySelector("span");
let drawSegmentEndRadius = Number(drawSegmentEndRadiusInput.value);

drawSegmentEndRadiusInput.addEventListener("input", () => {
  drawSegmentEndRadius = Number(drawSegmentEndRadiusInput.value);
  //console.log({ drawSegmentEndRadius });
  drawSegmentEndRadiusSpan.innerText = drawSegmentEndRadius;
  drawShape(["segmentEndRadius"]);
});

const drawCropTopContainer = document.getElementById("drawCropTop");
const drawCropTopInput = drawCropTopContainer.querySelector("input");
const drawCropTopSpan = drawCropTopContainer.querySelector("span");
let drawCropTop = Number(drawCropTopInput.value);

drawCropTopInput.addEventListener("input", () => {
  drawCropTop = Number(drawCropTopInput.value);
  //console.log({ drawCropTop });
  drawCropTopSpan.innerText = drawCropTop;
  drawShape(["cropTop"]);
});

const drawCropRightContainer = document.getElementById("drawCropRight");
const drawCropRightInput = drawCropRightContainer.querySelector("input");
const drawCropRightSpan = drawCropRightContainer.querySelector("span");
let drawCropRight = Number(drawCropRightInput.value);

drawCropRightInput.addEventListener("input", () => {
  drawCropRight = Number(drawCropRightInput.value);
  //console.log({ drawCropRight });
  drawCropRightSpan.innerText = drawCropRight;
  drawShape(["cropRight"]);
});

const drawCropBottomContainer = document.getElementById("drawCropBottom");
const drawCropBottomInput = drawCropBottomContainer.querySelector("input");
const drawCropBottomSpan = drawCropBottomContainer.querySelector("span");
let drawCropBottom = Number(drawCropBottomInput.value);

drawCropBottomInput.addEventListener("input", () => {
  drawCropBottom = Number(drawCropBottomInput.value);
  //console.log({ drawCropBottom });
  drawCropBottomSpan.innerText = drawCropBottom;
  drawShape(["cropBottom"]);
});

const drawCropLeftContainer = document.getElementById("drawCropLeft");
const drawCropLeftInput = drawCropLeftContainer.querySelector("input");
const drawCropLeftSpan = drawCropLeftContainer.querySelector("span");
let drawCropLeft = Number(drawCropLeftInput.value);

drawCropLeftInput.addEventListener("input", () => {
  drawCropLeft = Number(drawCropLeftInput.value);
  //console.log({ drawCropLeft });
  drawCropLeftSpan.innerText = drawCropLeft;
  drawShape(["cropLeft"]);
});

const drawRotationCropTopContainer = document.getElementById(
  "drawRotationCropTop"
);
const drawRotationCropTopInput =
  drawRotationCropTopContainer.querySelector("input");
const drawRotationCropTopSpan =
  drawRotationCropTopContainer.querySelector("span");
let drawRotationCropTop = Number(drawRotationCropTopInput.value);

drawRotationCropTopInput.addEventListener("input", () => {
  drawRotationCropTop = Number(drawRotationCropTopInput.value);
  //console.log({ drawRotationCropTop });
  drawRotationCropTopSpan.innerText = drawRotationCropTop;
  drawShape(["rotationCropTop"]);
});

const drawRotationCropRightContainer = document.getElementById(
  "drawRotationCropRight"
);
const drawRotationCropRightInput =
  drawRotationCropRightContainer.querySelector("input");
const drawRotationCropRightSpan =
  drawRotationCropRightContainer.querySelector("span");
let drawRotationCropRight = Number(drawRotationCropRightInput.value);

drawRotationCropRightInput.addEventListener("input", () => {
  drawRotationCropRight = Number(drawRotationCropRightInput.value);
  //console.log({ drawRotationCropRight });
  drawRotationCropRightSpan.innerText = drawRotationCropRight;
  drawShape(["rotationCropRight"]);
});

const drawRotationCropBottomContainer = document.getElementById(
  "drawRotationCropBottom"
);
const drawRotationCropBottomInput =
  drawRotationCropBottomContainer.querySelector("input");
const drawRotationCropBottomSpan =
  drawRotationCropBottomContainer.querySelector("span");
let drawRotationCropBottom = Number(drawRotationCropBottomInput.value);

drawRotationCropBottomInput.addEventListener("input", () => {
  drawRotationCropBottom = Number(drawRotationCropBottomInput.value);
  //console.log({ drawRotationCropBottom });
  drawRotationCropBottomSpan.innerText = drawRotationCropBottom;
  drawShape(["rotationCropBottom"]);
});

const drawRotationCropLeftContainer = document.getElementById(
  "drawRotationCropLeft"
);
const drawRotationCropLeftInput =
  drawRotationCropLeftContainer.querySelector("input");
const drawRotationCropLeftSpan =
  drawRotationCropLeftContainer.querySelector("span");
let drawRotationCropLeft = Number(drawRotationCropLeftInput.value);

drawRotationCropLeftInput.addEventListener("input", () => {
  drawRotationCropLeft = Number(drawRotationCropLeftInput.value);
  //console.log({ drawRotationCropLeft });
  drawRotationCropLeftSpan.innerText = drawRotationCropLeft;
  drawShape(["rotationCropLeft"]);
});

const drawXContainer = document.getElementById("drawX");
const drawXInput = drawXContainer.querySelector("input");
const drawXSpan = drawXContainer.querySelector("span");
let drawX = Number(drawXInput.value);

drawXInput.addEventListener("input", () => {
  drawX = Number(drawXInput.value);
  //console.log({ drawX });
  drawXSpan.innerText = drawX;
  drawShape();
});

const drawYContainer = document.getElementById("drawY");
const drawYInput = drawYContainer.querySelector("input");
const drawYSpan = drawYContainer.querySelector("span");
let drawY = Number(drawYInput.value);

drawYInput.addEventListener("input", () => {
  drawY = Number(drawYInput.value);
  //console.log({ drawY });
  drawYSpan.innerText = drawY;
  drawShape();
});

const drawWidthContainer = document.getElementById("drawWidth");
const drawWidthInput = drawWidthContainer.querySelector("input");
const drawWidthSpan = drawWidthContainer.querySelector("span");
let drawWidth = Number(drawWidthInput.value);

drawWidthInput.addEventListener("input", () => {
  drawWidth = Number(drawWidthInput.value);
  //console.log({ drawWidth });
  drawWidthSpan.innerText = drawWidth;
  drawShape();
});

const drawHeightContainer = document.getElementById("drawHeight");
const drawHeightInput = drawHeightContainer.querySelector("input");
const drawHeightSpan = drawHeightContainer.querySelector("span");
let drawHeight = Number(drawHeightInput.value);

drawHeightInput.addEventListener("input", () => {
  drawHeight = Number(drawHeightInput.value);
  //console.log({ drawHeight });
  drawHeightSpan.innerText = drawHeight;
  drawShape();
});

const drawRadiusContainer = document.getElementById("drawRadius");
const drawRadiusInput = drawRadiusContainer.querySelector("input");
const drawRadiusSpan = drawRadiusContainer.querySelector("span");
let drawRadius = Number(drawRadiusInput.value);

drawRadiusInput.addEventListener("input", () => {
  drawRadius = Number(drawRadiusInput.value);
  //console.log({ drawRadius });
  drawRadiusSpan.innerText = drawRadius;
  drawShape();
});

const drawBorderRadiusContainer = document.getElementById("drawBorderRadius");
const drawBorderRadiusInput = drawBorderRadiusContainer.querySelector("input");
const drawBorderRadiusSpan = drawBorderRadiusContainer.querySelector("span");
let drawBorderRadius = Number(drawBorderRadiusInput.value);

drawBorderRadiusInput.addEventListener("input", () => {
  drawBorderRadius = Number(drawBorderRadiusInput.value);
  //console.log({ drawBorderRadius });
  drawBorderRadiusSpan.innerText = drawBorderRadius;
  drawShape();
});

const drawNumberOfSidesContainer = document.getElementById("drawNumberOfSides");
const drawNumberOfSidesInput =
  drawNumberOfSidesContainer.querySelector("input");
const drawNumberOfSidesSpan = drawNumberOfSidesContainer.querySelector("span");
let drawNumberOfSides = Number(drawNumberOfSidesInput.value);

drawNumberOfSidesInput.addEventListener("input", () => {
  drawNumberOfSides = Number(drawNumberOfSidesInput.value);
  //console.log({ drawNumberOfSides });
  drawNumberOfSidesSpan.innerText = drawNumberOfSides;
  drawShape();
});

const drawEndXContainer = document.getElementById("drawEndX");
const drawEndXInput = drawEndXContainer.querySelector("input");
const drawEndXSpan = drawEndXContainer.querySelector("span");
let drawEndX = Number(drawEndXInput.value);

drawEndXInput.addEventListener("input", () => {
  drawEndX = Number(drawEndXInput.value);
  //console.log({ drawEndX });
  drawEndXSpan.innerText = drawEndX;
  drawShape();
});

const drawEndYContainer = document.getElementById("drawEndY");
const drawEndYInput = drawEndYContainer.querySelector("input");
const drawEndYSpan = drawEndYContainer.querySelector("span");
let drawEndY = Number(drawEndYInput.value);

drawEndYInput.addEventListener("input", () => {
  drawEndY = Number(drawEndYInput.value);
  //console.log({ drawEndY });
  drawEndYSpan.innerText = drawEndY;
  drawShape();
});

/** @type {HTMLButtonElement} */
const drawShapeButton = document.getElementById("drawShape");
drawShapeButton.addEventListener("click", () => {
  drawShape();
});
device.addEventListener("isConnected", () => {
  const enabled = device.isConnected && device.isDisplayAvailable;
  drawShapeButton.disabled = !enabled;
});

/** @type {HTMLSelectElement} */
const drawShapeTypeSelect = document.getElementById("drawShapeType");
let drawShapeType = drawShapeTypeSelect.value;
drawShapeTypeSelect.addEventListener("input", () => {
  drawShapeType = drawShapeTypeSelect.value;
  console.log({ drawShapeType });
  drawShape();
});
console.log({ drawShapeType });

device.addEventListener("connected", () => {
  if (!device.isDisplayAvailable) {
    return;
  }
  drawXInput.max = device.displayInformation.width;
  drawYInput.max = device.displayInformation.height;

  drawWidthInput.max = device.displayInformation.width;
  drawHeightInput.max = device.displayInformation.height;

  drawRadiusInput.max = Math.min(
    device.displayInformation.height / 2,
    device.displayInformation.width / 2
  );
});
