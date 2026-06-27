import * as BS from "../../build/brilliantsole.module.js";
window.BS = BS;
// console.log(BS);

// const device = new BS.Device();
// console.log({ device });
// window.device = device;

//BS.setAllConsoleLevelFlags({ log: false });
//BS.setConsoleLevelFlagsForType("PressureDataManager", { log: true });

BS.setConsoleLevelFlagsForType("DisplayManager", { log: true });
BS.setConsoleLevelFlagsForType("DisplayCanvasHelper", { log: true });
BS.setConsoleLevelFlagsForType("DisplayContextStateHelper", { log: true });
BS.setConsoleLevelFlagsForType("DisplayContextCommand", { log: true });
// BS.setConsoleLevelFlagsForType("Device", { log: true });

// GET DEVICES
/** @type {HTMLTemplateElement} */
const availableDeviceTemplate = document.getElementById(
  "availableDeviceTemplate",
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
        availableDevice.toggleConnection(true);
      });
      availableDevice.addEventListener(
        "connectionStatus",
        () => {
          let innerText = availableDevice.connectionStatus;
          switch (availableDevice.connectionStatus) {
            case "notConnected":
              innerText = "connect";
              break;
            case "connected":
              innerText = "disconnect";
              break;
          }
          toggleConnectionButton.innerText = innerText;
        },
        { immediate: true },
      );

      availableDevicesContainer.appendChild(availableDeviceContainer);
    });
  }
}
async function getDevices() {
  const availableDevices = await BS.DeviceManager.getDevices();
  if (!availableDevices) {
    return;
  }
  onAvailableDevices(availableDevices);
}

BS.DeviceManager.addEventListener("availableDevices", (event) => {
  const { availableDevices } = event.message;
  onAvailableDevices(availableDevices);
});
getDevices();

// DEVICE

/** @type {BS.Device?} */
let currentDevice;

/** @param {function} callback */
const onCurrentDevice = (callback) => {
  BS.DeviceManager.addEventListener("deviceConnected", (event) => {
    if (event.message.device == currentDevice) {
      callback();
    }
  });
};

BS.DeviceManager.addEventListener("deviceConnected", (event) => {
  const { device } = event.message;
  if (!currentDevice?.isConnected) {
    onDevice(device);
  }
});
BS.DeviceManager.addEventListener("deviceNotConnected", (event) => {
  const { device } = event.message;
  if (currentDevice == device) {
    console.log("currentDevice is gone");
    currentDevice.removeAllEventListeners();
    const nextConnectedDevice = BS.DeviceManager.connectedDevices[0];
    console.log("nextConnectedDevice", nextConnectedDevice);
    if (nextConnectedDevice) {
      onDevice(nextConnectedDevice);
    }
  }
});

/** @param {BS.Device} device */
const onDevice = (device, replaceCurrentDevice = false) => {
  if (currentDevice?.isConnected) {
    if (!replaceCurrentDevice) {
      return;
    }
    currentDevice.removeAllEventListeners();
  }
  currentDevice = device;
  console.log("currentDevice", currentDevice);
};

// CONNECTION

/** @type {HTMLButtonElement} */
const toggleConnectionButton = document.getElementById("toggleConnection");
toggleConnectionButton.addEventListener("click", async () => {
  if (currentDevice) {
    currentDevice.toggleConnection();
  } else {
    toggleConnectionButton.innerText = "connecting...";
    await BS.Device.Connect();
    if (!currentDevice) {
      toggleConnectionButton.innerText = "connect";
    }
  }
});

/** @type {HTMLButtonElement} */
const reconnectButton = document.getElementById("reconnect");
reconnectButton.addEventListener("click", () => {
  currentDevice.reconnect();
});

onCurrentDevice(() => {
  currentDevice.addEventListener(
    "connectionStatus",
    () => {
      reconnectButton.disabled = !currentDevice.canReconnect;
    },
    { immediate: true },
  );
});

onCurrentDevice(() => {
  currentDevice.addEventListener(
    "connectionStatus",
    () => {
      switch (currentDevice.connectionStatus) {
        case "connected":
        case "notConnected":
          toggleConnectionButton.disabled = false;
          toggleConnectionButton.innerText = currentDevice.isConnected
            ? "disconnect"
            : "connect";
          break;
        case "connecting":
        case "disconnecting":
          toggleConnectionButton.disabled = true;
          toggleConnectionButton.innerText = currentDevice.connectionStatus;
          break;
      }
    },
    { immediate: true },
  );
});

/** @type {HTMLInputElement} */
const connectIpAddressInput = document.getElementById("connectIpAddress");
connectIpAddressInput.addEventListener("input", () => {
  const isValid = connectIpAddressInput.checkValidity();
  connectViaIpAddressButton.disabled = !isValid;
});
/** @type {HTMLButtonElement} */
const connectViaIpAddressButton = document.getElementById(
  "connectViaIpAddress",
);
connectViaIpAddressButton.addEventListener("click", () => {
  connectViaIpAddressButton.disabled = true;
  console.log(`connecting via ipAddress "${connectIpAddressInput.value}"`);
  currentDevice.connect({
    type: "webSocket",
    ipAddress: connectIpAddressInput.value,
  });
});

onCurrentDevice(() => {
  currentDevice.addEventListener(
    "isConnected",
    () => {
      connectIpAddressInput.disabled = currentDevice.isConnected;
      connectViaIpAddressButton.disabled = currentDevice.isConnected;
    },
    { immediate: true },
  );
});

/** @type {HTMLInputElement} */
const reconnectOnDisconnectionCheckbox = document.getElementById(
  "reconnectOnDisconnection",
);
reconnectOnDisconnectionCheckbox.addEventListener("input", () => {
  currentDevice.reconnectOnDisconnection =
    reconnectOnDisconnectionCheckbox.checked;
});

/** @type {HTMLButtonElement} */
const resetDeviceButton = document.getElementById("resetDevice");
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "isConnected",
    () => {
      resetDeviceButton.disabled =
        !currentDevice.isConnected || !currentDevice.canReset;
    },
    { immediate: true },
  );
});
resetDeviceButton.addEventListener("click", () => {
  currentDevice.reset();
});

// DEVICE INFORMATION

/** @type {HTMLPreElement} */
const deviceInformationPre = document.getElementById("deviceInformationPre");
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "deviceInformation",
    () => {
      deviceInformationPre.textContent = JSON.stringify(
        currentDevice.deviceInformation,
        null,
        2,
      );
    },
    { immediate: true },
  );
});

// MTU
const deviceMtuSpan = document.getElementById("mtu");
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "getMtu",
    () => {
      deviceMtuSpan.innerText = currentDevice.mtu;
    },
    { immediate: true },
  );
});

// ID
const deviceIdSpan = document.getElementById("deviceId");
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "getId",
    () => {
      deviceIdSpan.innerText = currentDevice.id;
    },
    { immediate: true },
  );
});

// BATTERY LEVEL

/** @type {HTMLSpanElement} */
const batteryLevelSpan = document.getElementById("batteryLevel");
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "batteryLevel",
    () => {
      console.log(`batteryLevel updated to ${currentDevice.batteryLevel}%`);
      batteryLevelSpan.innerText = `${currentDevice.batteryLevel}%`;
    },
    { immediate: true },
  );
});

/** @type {HTMLSpanElement} */
const isChargingSpan = document.getElementById("isCharging");
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "isCharging",
    () => {
      console.log(`isCharging updated to ${currentDevice.isCharging}`);
      isChargingSpan.innerText = currentDevice.isCharging;
    },
    { immediate: true },
  );
});

/** @type {HTMLSpanElement} */
const batteryCurrentSpan = document.getElementById("batteryCurrent");
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "getBatteryCurrent",
    () => {
      console.log(
        `batteryCurrent updated to ${currentDevice.batteryCurrent}mAh`,
      );
      batteryCurrentSpan.innerText = `${currentDevice.batteryCurrent}mAh`;
    },
    { immediate: true },
  );
});

/** @type {HTMLButtonElement} */
const updateBatteryCurrentButton = document.getElementById(
  "updateBatteryCurrent",
);
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "isConnected",
    () => {
      updateBatteryCurrentButton.disabled = !currentDevice.isConnected;
    },
    { immediate: true },
  );
});
updateBatteryCurrentButton.addEventListener("click", () => {
  currentDevice.getBatteryCurrent();
});

// NAME

/** @type {HTMLSpanElement} */
const nameSpan = document.getElementById("name");
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "getName",
    () => {
      console.log(`name updated to ${currentDevice.name}`);
      nameSpan.innerText = currentDevice.name;
    },
    { immediate: true },
  );
});

/** @type {HTMLInputElement} */
const setNameInput = document.getElementById("setNameInput");
setNameInput.minLength = BS.MinNameLength;
setNameInput.maxLength = BS.MaxNameLength;

/** @type {HTMLButtonElement} */
const setNameButton = document.getElementById("setNameButton");

onCurrentDevice(() => {
  currentDevice.addEventListener(
    "isConnected",
    () => {
      setNameInput.disabled = !currentDevice.isConnected;
    },
    { immediate: true },
  );
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "notConnected",
    () => {
      setNameInput.value = "";
    },
    { immediate: true },
  );
});

setNameInput.addEventListener("input", () => {
  setNameButton.disabled =
    setNameInput.value.length < currentDevice.minNameLength;
});

setNameButton.addEventListener("click", () => {
  console.log(`setting name to ${setNameInput.value}`);
  currentDevice.setName(setNameInput.value);
  setNameInput.value = "";
  setNameButton.disabled = true;
});

// TYPE

/** @type {HTMLSpanElement} */
const typeSpan = document.getElementById("type");
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "getType",
    () => {
      console.log(`type updated to ${currentDevice.type}`);
      typeSpan.innerText = currentDevice.type;
    },
    { immediate: true },
  );
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

onCurrentDevice(() => {
  currentDevice.addEventListener(
    "isConnected",
    () => {
      setTypeSelect.disabled = !currentDevice.isConnected;
    },
    { immediate: true },
  );
});

onCurrentDevice(() => {
  currentDevice.addEventListener(
    "getType",
    () => {
      setTypeSelect.value = currentDevice.type;
    },
    { immediate: true },
  );
});

setTypeSelect.addEventListener("input", () => {
  setTypeButton.disabled = setTypeSelect.value == currentDevice.type;
});

setTypeButton.addEventListener("click", () => {
  console.log(`setting type to ${setTypeSelect.value}`);
  currentDevice.setType(setTypeSelect.value);
  setTypeButton.disabled = true;
});

// SENSOR CONFIGURATION

/** @type {HTMLPreElement} */
const sensorConfigurationPre = document.getElementById(
  "sensorConfigurationPre",
);
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "getSensorConfiguration",
    () => {
      sensorConfigurationPre.textContent = JSON.stringify(
        currentDevice.sensorConfiguration,
        null,
        2,
      );
    },
    { immediate: true },
  );
});

/** @type {HTMLTemplateElement} */
const sensorTypeConfigurationTemplate = document.getElementById(
  "sensorTypeConfigurationTemplate",
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
    currentDevice.setSensorConfiguration({ [sensorType]: sensorRate });
  });

  onCurrentDevice(() => {
    currentDevice.addEventListener(
      "connected",
      () => {
        if (currentDevice.sensorTypes.includes(sensorType)) {
          sensorTypeConfigurationContainer.classList.remove("hidden");
        } else {
          sensorTypeConfigurationContainer.classList.add("hidden");
        }
      },
      { immediate: true },
    );
  });

  sensorTypeConfigurationTemplate.parentElement.appendChild(
    sensorTypeConfigurationContainer,
  );
  sensorTypeConfigurationContainer.dataset.sensorType = sensorType;
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "getSensorConfiguration",
    () => {
      for (const sensorType in currentDevice.sensorConfiguration) {
        document.querySelector(
          `.sensorTypeConfiguration[data-sensor-type="${sensorType}"] .input`,
        ).value = currentDevice.sensorConfiguration[sensorType];
      }
    },
    { immediate: true },
  );
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "isConnected",
    () => {
      for (const sensorType in currentDevice.sensorConfiguration) {
        document.querySelector(
          `[data-sensor-type="${sensorType}"] .input`,
        ).disabled = !currentDevice.isConnected;
      }
    },
    { immediate: true },
  );
});

// PRESSURE RANGE

/** @type {HTMLButtonElement} */
const resetPressureRangeButton = document.getElementById("resetPressureRange");
resetPressureRangeButton.addEventListener("click", () => {
  currentDevice.resetPressureRange();
});

// SENSOR DATA

/** @type {HTMLTemplateElement} */
const sensorTypeDataTemplate = document.getElementById(
  "sensorTypeDataTemplate",
);
BS.SensorTypes.forEach((sensorType) => {
  const sensorTypeDataContainer = sensorTypeDataTemplate.content
    .cloneNode(true)
    .querySelector(".sensorTypeData");
  sensorTypeDataContainer.querySelector(".sensorType").innerText = sensorType;

  /** @type {HTMLPreElement} */
  const sensorDataPre = sensorTypeDataContainer.querySelector(".sensorData");
  onCurrentDevice(() => {
    currentDevice.addEventListener(
      sensorType,
      (event) => {
        const sensorData = event.message;
        sensorDataPre.textContent = JSON.stringify(sensorData, null, 2);
      },
      { immediate: true },
    );
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
      ".waveformEffect .sequenceLoopCount",
    );
  waveformEffectSequenceLoopCountInput.max =
    BS.MaxVibrationWaveformEffectSequenceLoopCount;
}
/** @type {HTMLTemplateElement} */
const vibrationLocationTemplate = document.getElementById(
  "vibrationLocationTemplate",
);

/** @type {HTMLTemplateElement} */
const waveformEffectSegmentTemplate = document.getElementById(
  "waveformEffectSegmentTemplate",
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
  "waveformSegmentTemplate",
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
  currentDevice.vibrationLocations.forEach((vibrationLocation) => {
    const vibrationLocationContainer = vibrationLocationTemplate.content
      .cloneNode(true)
      .querySelector(".vibrationLocation");
    vibrationLocationContainer.querySelector("span").innerText =
      vibrationLocation;
    vibrationLocationContainer.querySelector(
      "input",
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
            `uncaught waveformEffectTypeSelect value "${waveformEffectTypeSelect.value}"`,
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
        vibrationContainer.querySelector(".shouldTrigger").checked,
    )
    .forEach((vibrationContainer) => {
      /** @type {BS.VibrationConfiguration} */
      const vibrationConfiguration = {
        locations: [],
      };
      Array.from(
        vibrationContainer.querySelectorAll(`[data-vibration-location]`),
      )
        .filter((input) => input.checked)
        .forEach((input) => {
          vibrationConfiguration.locations.push(
            input.dataset.vibrationLocation,
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
              ".waveformEffect .waveformEffectSegment",
            ),
          ).map((waveformEffectSegmentContainer) => {
            /** @type {BS.VibrationWaveformEffectSegment} */
            const waveformEffectSegment = {
              loopCount: Number(
                waveformEffectSegmentContainer.querySelector(".loopCount")
                  .value,
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
                waveformEffectSegmentContainer.querySelector(".delay").value,
              );
            }
            return waveformEffectSegment;
          });
          vibrationConfiguration.loopCount = Number(
            vibrationContainer.querySelector(
              ".waveformEffect .sequenceLoopCount",
            ).value,
          );
          break;
        case "waveform":
          vibrationConfiguration.segments = Array.from(
            vibrationContainer.querySelectorAll(".waveform .waveformSegment"),
          ).map((waveformSegmentContainer) => {
            return {
              amplitude: Number(
                waveformSegmentContainer.querySelector(".amplitude").value,
              ),
              duration: Number(
                waveformSegmentContainer.querySelector(".duration").value,
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
    currentDevice.triggerVibration(vibrationConfigurations);
  }
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "isConnected",
    () => {
      updateTriggerVibrationsButtonDisabled();
    },
    { immediate: true },
  );
});

function updateTriggerVibrationsButtonDisabled() {
  triggerVibrationsButton.disabled =
    !currentDevice.isConnected ||
    vibrationTemplate.parentElement.querySelectorAll(".vibration").length == 0;
}

// FILE TRANSFER

/** @type {File?} */
let file;

/** @type {HTMLInputElement} */
const fileInput = document.getElementById("file");
fileInput.addEventListener("input", () => {
  if (fileInput.files[0].size > currentDevice.maxFileLength) {
    console.log("file size too large");
    return;
  }
  file = fileInput.files[0];
  console.log("file", file);
  updateToggleFileTransferButton();
});

const maxFileLengthSpan = document.getElementById("maxFileLength");
const updateMaxFileLengthSpan = () => {
  maxFileLengthSpan.innerText = (
    currentDevice.maxFileLength / 1024
  ).toLocaleString();
};
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "isConnected",
    () => {
      updateMaxFileLengthSpan();
    },
    { immediate: true },
  );
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
onCurrentDevice(() => {
  currentDevice.addEventListener("connected", () => {
    fileTransferTypesSelect.querySelectorAll("option").forEach(
      (option) => {
        option.hidden =
          BS.FileTypes.includes(option.value) &&
          !currentDevice.fileTypes.includes(option.value);
      },
      { immediate: true },
    );
  });
});

/** @type {HTMLProgressElement} */
const fileTransferProgress = document.getElementById("fileTransferProgress");

onCurrentDevice(() => {
  currentDevice.addEventListener("fileTransferProgress", (event) => {
    const progress = event.message.progress;
    console.log({ progress }, { immediate: true });
    fileTransferProgress.value = progress == 1 ? 0 : progress;
  });
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "fileTransferStatus",
    () => {
      if (currentDevice.fileTransferStatus == "idle") {
        fileTransferProgress.value = 0;
      }
    },
    { immediate: true },
  );
});

/** @type {HTMLButtonElement} */
const toggleFileTransferButton = document.getElementById("toggleFileTransfer");
toggleFileTransferButton.addEventListener("click", async () => {
  if (currentDevice.fileTransferStatus == "idle") {
    if (fileTransferDirection == "send") {
      if (fileType == "tflite") {
        await currentDevice.setTfliteName(file.name.replaceAll(".tflite", ""));
      }
      currentDevice.sendFile(fileType, file);
    } else {
      currentDevice.receiveFile(fileType);
    }
  } else {
    currentDevice.cancelFileTransfer();
  }
});
const updateToggleFileTransferButton = () => {
  if (!currentDevice) {
    return;
  }
  const enabled =
    currentDevice.isConnected && (file || fileTransferDirection == "receive");
  toggleFileTransferButton.disabled = !enabled;

  /** @type {String} */
  let innerText;
  switch (currentDevice.fileTransferStatus) {
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
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "isConnected",
    () => {
      updateToggleFileTransferButton();
    },
    { immediate: true },
  );
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "fileTransferStatus",
    () => {
      updateToggleFileTransferButton();
    },
    { immediate: true },
  );
});

/** @type {BS.FileTransferDirection} */
let fileTransferDirection;
/** @type {HTMLSelectElement} */
const fileTransferDirectionSelect = document.getElementById(
  "fileTransferDirection",
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

onCurrentDevice(() => {
  currentDevice.addEventListener(
    "fileReceived",
    (event) => {
      const { file, fileType } = event.message;
      switch (fileType) {
        case "tflite":
          downloadFile(file);

          break;
      }
    },
    { immediate: true },
  );
});

// TFLITE

/** @type {HTMLSpanElement} */
const tfliteNameSpan = document.getElementById("tfliteName");
/** @type {HTMLInputElement} */
const setTfliteNameInput = document.getElementById("setTfliteNameInput");
/** @type {HTMLButtonElement} */
const setTfliteNameButton = document.getElementById("setTfliteNameButton");

function updateSetTfliteNameButton() {
  const enabled =
    currentDevice.isConnected && setTfliteNameInput.value.length > 0;
  setTfliteNameButton.disabled = !enabled;
}

onCurrentDevice(() => {
  currentDevice.addEventListener(
    "isConnected",
    () => {
      const disabled = !currentDevice.isConnected;
      setTfliteNameInput.disabled = disabled;
      updateSetTfliteNameButton();
    },
    { immediate: true },
  );
});

setTfliteNameInput.addEventListener("input", () => {
  updateSetTfliteNameButton();
});

onCurrentDevice(() => {
  currentDevice.addEventListener(
    "getTfliteName",
    () => {
      tfliteNameSpan.innerText = currentDevice.tfliteName;

      setTfliteNameButton.innerText = "set name";
      setTfliteNameButton.disabled = !currentDevice.isConnected;

      setTfliteNameInput.value = "";
      setTfliteNameInput.disabled = false;
      updateSetTfliteNameButton();
    },
    { immediate: true },
  );
});

setTfliteNameButton.addEventListener("click", () => {
  currentDevice.setTfliteName(setTfliteNameInput.value);

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

onCurrentDevice(() => {
  currentDevice.addEventListener(
    "isConnected",
    () => {
      const disabled = !currentDevice.isConnected;
      setTfliteTaskSelect.disabled = disabled;
      setTfliteTaskButton.disabled = disabled;
    },
    { immediate: true },
  );
});

BS.TfliteTasks.forEach((task) => {
  setTfliteTaskOptgroup.appendChild(new Option(task));
});

onCurrentDevice(() => {
  currentDevice.addEventListener(
    "getTfliteTask",
    () => {
      const task = currentDevice.tfliteTask;
      setTfliteTaskSelect.value = task;
      tfliteTaskSpan.innerText = task;
    },
    { immediate: true },
  );
});

setTfliteTaskButton.addEventListener("click", () => {
  currentDevice.setTfliteTask(setTfliteTaskSelect.value);
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "getTfliteInferencingEnabled",
    () => {
      setTfliteTaskButton.disabled = currentDevice.tfliteInferencingEnabled;
    },
    { immediate: true },
  );
});

/** @type {HTMLSpanElement} */
const tfliteSampleRateSpan = document.getElementById("tfliteSampleRate");
/** @type {HTMLInputElement} */
const setTfliteSampleRateInput = document.getElementById(
  "setTfliteSampleRateInput",
);
/** @type {HTMLButtonElement} */
const setTfliteSampleRateButton = document.getElementById(
  "setTfliteSampleRateButton",
);

onCurrentDevice(() => {
  currentDevice.addEventListener(
    "isConnected",
    () => {
      const disabled = !currentDevice.isConnected;
      setTfliteSampleRateInput.disabled = disabled;
      setTfliteSampleRateButton.disabled = disabled;
    },
    { immediate: true },
  );
});

onCurrentDevice(() => {
  currentDevice.addEventListener(
    "getTfliteSampleRate",
    () => {
      tfliteSampleRateSpan.innerText = currentDevice.tfliteSampleRate;

      setTfliteSampleRateInput.value = "";
      setTfliteSampleRateInput.disabled = false;

      setTfliteSampleRateButton.disabled = false;
      setTfliteSampleRateButton.innerText = "set sample rate";
    },
    { immediate: true },
  );
});

setTfliteSampleRateButton.addEventListener("click", () => {
  currentDevice.setTfliteSampleRate(Number(setTfliteSampleRateInput.value));

  setTfliteSampleRateInput.disabled = true;

  setTfliteSampleRateButton.disabled = true;
  setTfliteSampleRateButton.innerText = "setting sample rate...";
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "getTfliteInferencingEnabled",
    () => {
      setTfliteSampleRateButton.disabled =
        currentDevice.tfliteInferencingEnabled;
    },
    { immediate: true },
  );
});

const tfliteSensorTypesContainer = document.getElementById("tfliteSensorTypes");
/** @type {HTMLTemplateElement} */
const tfliteSensorTypeTemplate = document.getElementById(
  "tfliteSensorTypeTemplate",
);
/** @type {Object.<string, HTMLElement>} */
const tfliteSensorTypeContainers = {};
/** @type {BS.SensorType[]} */
let tfliteSensorTypes = [];
/** @type {HTMLButtonElement} */
const setTfliteSensorTypesButton = document.getElementById(
  "setTfliteSensorTypes",
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

  onCurrentDevice(() => {
    currentDevice.addEventListener(
      "connected",
      () => {
        const isIncluded =
          currentDevice.allowedTfliteSensorTypes.includes(sensorType);
        // console.log({ sensorType, isIncluded });
        if (isIncluded) {
          sensorTypeContainer.classList.remove("hidden");
        } else {
          sensorTypeContainer.classList.add("hidden");
        }
      },
      { immediate: true },
    );
    currentDevice.addEventListener(
      "getTfliteSensorTypes",
      () => {
        isSensorEnabledInput.checked =
          currentDevice.tfliteSensorTypes.includes(sensorType);
      },
      { immediate: true },
    );

    isSensorEnabledInput.checked =
      currentDevice.tfliteSensorTypes.includes(sensorType);
  });

  tfliteSensorTypeContainers[sensorType] = sensorTypeContainer;

  tfliteSensorTypesContainer.appendChild(sensorTypeContainer);
});

onCurrentDevice(() => {
  currentDevice.addEventListener(
    "getTfliteSensorTypes",
    () => {
      tfliteSensorTypes = currentDevice.tfliteSensorTypes;
    },
    { immediate: true },
  );
});

setTfliteSensorTypesButton.addEventListener("click", () => {
  setTfliteSensorTypesButton.disabled = true;
  setTfliteSensorTypesButton.innerText = "setting sensor types...";
  currentDevice.setTfliteSensorTypes(tfliteSensorTypes);
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "getTfliteSensorTypes",
    () => {
      setTfliteSensorTypesButton.disabled = false;
      setTfliteSensorTypesButton.innerText = "set sensor types";
    },
    { immediate: true },
  );
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "getTfliteInferencingEnabled",
    () => {
      setTfliteSensorTypesButton.disabled =
        currentDevice.tfliteInferencingEnabled;
    },
    { immediate: true },
  );
});

/** @type {HTMLInputElement} */
const setTfliteIsReadyInput = document.getElementById("tfliteIsReady");
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "tfliteIsReady",
    () => {
      setTfliteIsReadyInput.checked = currentDevice.tfliteIsReady;
    },
    { immediate: true },
  );
});

/** @type {HTMLSpanElement} */
const tfliteThresholdSpan = document.getElementById("tfliteThreshold");
/** @type {HTMLInputElement} */
const setTfliteThresholdInput = document.getElementById(
  "setTfliteThresholdInput",
);
/** @type {HTMLButtonElement} */
const setTfliteThresholdButton = document.getElementById(
  "setTfliteThresholdButton",
);

onCurrentDevice(() => {
  currentDevice.addEventListener(
    "isConnected",
    () => {
      const disabled = !currentDevice.isConnected;
      setTfliteThresholdInput.disabled = disabled;
      setTfliteThresholdButton.disabled = disabled;
    },
    { immediate: true },
  );
});

onCurrentDevice(() => {
  currentDevice.addEventListener(
    "getTfliteThreshold",
    () => {
      tfliteThresholdSpan.innerText = currentDevice.tfliteThreshold;

      setTfliteThresholdInput.value = "";
      setTfliteThresholdInput.disabled = false;

      setTfliteThresholdButton.disabled = false;
      setTfliteThresholdButton.innerText = "set threshold";
    },
    { immediate: true },
  );
});

setTfliteThresholdButton.addEventListener("click", () => {
  currentDevice.setTfliteThreshold(Number(setTfliteThresholdInput.value));

  setTfliteThresholdInput.disabled = true;

  setTfliteThresholdButton.disabled = true;
  setTfliteThresholdButton.innerText = "setting threshold...";
});

/** @type {HTMLSpanElement} */
const tfliteCaptureDelaySpan = document.getElementById("tfliteCaptureDelay");
/** @type {HTMLInputElement} */
const setTfliteCaptureDelayInput = document.getElementById(
  "setTfliteCaptureDelayInput",
);
/** @type {HTMLButtonElement} */
const setTfliteCaptureDelayButton = document.getElementById(
  "setTfliteCaptureDelayButton",
);

onCurrentDevice(() => {
  currentDevice.addEventListener(
    "isConnected",
    () => {
      const disabled = !currentDevice.isConnected;
      setTfliteCaptureDelayInput.disabled = disabled;
      setTfliteCaptureDelayButton.disabled = disabled;
    },
    { immediate: true },
  );
});

onCurrentDevice(() => {
  currentDevice.addEventListener(
    "getTfliteCaptureDelay",
    () => {
      tfliteCaptureDelaySpan.innerText = currentDevice.tfliteCaptureDelay;

      setTfliteCaptureDelayInput.value = "";
      setTfliteCaptureDelayInput.disabled = false;

      setTfliteCaptureDelayButton.disabled = false;
      setTfliteCaptureDelayButton.innerText = "set capture delay";
    },
    { immediate: true },
  );
});

setTfliteCaptureDelayButton.addEventListener("click", () => {
  currentDevice.setTfliteCaptureDelay(Number(setTfliteCaptureDelayInput.value));

  setTfliteCaptureDelayInput.disabled = true;

  setTfliteCaptureDelayButton.disabled = true;
  setTfliteCaptureDelayButton.innerText = "setting capture delay...";
});

/** @type {HTMLInputElement} */
const tfliteInferencingEnabledInput = document.getElementById(
  "tfliteInferencingEnabled",
);
/** @type {HTMLButtonElement} */
const toggleTfliteInferencingEnabledButton = document.getElementById(
  "toggleTfliteInferencingEnabled",
);

onCurrentDevice(() => {
  currentDevice.addEventListener(
    "tfliteIsReady",
    () => {
      toggleTfliteInferencingEnabledButton.disabled =
        !currentDevice.tfliteIsReady;
    },
    { immediate: true },
  );
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "getTfliteInferencingEnabled",
    () => {
      tfliteInferencingEnabledInput.checked =
        currentDevice.tfliteInferencingEnabled;
      toggleTfliteInferencingEnabledButton.innerText =
        currentDevice.tfliteInferencingEnabled
          ? "disable inferencing"
          : "enable inferencing";
    },
    { immediate: true },
  );
});

toggleTfliteInferencingEnabledButton.addEventListener("click", () => {
  currentDevice.toggleTfliteInferencing();
});

/** @type {String[]} */
let inferenceClasses = [];

/** @type {HTMLTextAreaElement} */
const inferenceClassesTextArea = document.getElementById("inferenceClasses");
inferenceClassesTextArea.addEventListener("input", () => {
  inferenceClasses = inferenceClassesTextArea.value.split("\n").filter(Boolean);
  console.log("inferenceClasses", inferenceClasses);
  currentDevice.setTfliteClasses(inferenceClasses);
  localStorage.setItem("BS.inferenceClasses", JSON.stringify(inferenceClasses));
});
onCurrentDevice(() => {
  if (localStorage.getItem("BS.inferenceClasses")) {
    inferenceClasses = JSON.parse(localStorage.getItem("BS.inferenceClasses"));
    currentDevice.setTfliteClasses(inferenceClasses);
    inferenceClassesTextArea.value = inferenceClasses.join("\n");
  }
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "connected",
    () => {
      currentDevice.setTfliteClasses(inferenceClasses);
    },
    { immediate: true },
  );
});

/** @type {HTMLElement} */
const topInferenceClassElement = document.getElementById("topInferenceClass");
let topInferenceClassTimeoutId;
/** @type {HTMLPreElement} */
const tfliteInferencePre = document.getElementById("tfliteInference");
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "tfliteInference",
    (event) => {
      const { tfliteInference } = event.message;
      console.log("inference", tfliteInference);
      tfliteInferencePre.textContent = JSON.stringify(tfliteInference, null, 2);
      clearTimeout(topInferenceClassTimeoutId);
      if (currentDevice.tfliteTask == "classification") {
        topInferenceClassElement.innerText = tfliteInference.maxClass ?? "";
        topInferenceClassTimeoutId = setTimeout(
          () => {
            topInferenceClassElement.innerText = "";
          },
          Math.max(currentDevice.tfliteCaptureDelay, 500),
        );
      }
    },
    { immediate: true },
  );
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
  "toggleFirmwareUpload",
);
toggleFirmwareUploadButton.addEventListener("click", () => {
  currentDevice.uploadFirmware(firmware);
});
const updateToggleFirmwareUploadButton = () => {
  const enabled = currentDevice.isConnected && Boolean(firmware);
  toggleFirmwareUploadButton.disabled = !enabled;
};
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "isConnected",
    () => {
      updateToggleFirmwareUploadButton();
    },
    { immediate: true },
  );
});

/** @type {HTMLProgressElement} */
const firmwareUploadProgress = document.getElementById(
  "firmwareUploadProgress",
);
/** @type {HTMLSpanElement} */
const firmwareUploadProgressPercentageSpan = document.getElementById(
  "firmwareUploadProgressPercentage",
);
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "firmwareUploadProgress",
    (event) => {
      const progress = event.message.progress;
      firmwareUploadProgress.value = progress;
      firmwareUploadProgressPercentageSpan.innerText = `${Math.floor(
        100 * progress,
      )}%`;
    },
    { immediate: true },
  );
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "firmwareUploadComplete",
    () => {
      firmwareUploadProgress.value = 0;
    },
    { immediate: true },
  );
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "firmwareStatus",
    () => {
      const isUploading = currentDevice.firmwareStatus == "uploading";
      firmwareUploadProgressPercentageSpan.style.display = isUploading
        ? ""
        : "none";
    },
    { immediate: true },
  );
});

/** @type {HTMLPreElement} */
const firmwareImagesPre = document.getElementById("firmwareImages");
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "firmwareImages",
    () => {
      firmwareImagesPre.textContent = JSON.stringify(
        currentDevice.firmwareImages,
        (key, value) => (key == "hash" ? Array.from(value).join(",") : value),
        2,
      );
    },
    { immediate: true },
  );
});

onCurrentDevice(() => {
  currentDevice.addEventListener(
    "isConnected",
    () => {
      if (currentDevice.isConnected && currentDevice.canUpdateFirmware) {
        currentDevice.getFirmwareImages();
      }
    },
    { immediate: true },
  );
});

/** @type {HTMLSpanElement} */
const firmwareStatusSpan = document.getElementById("firmwareStatus");
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "firmwareStatus",
    () => {
      firmwareStatusSpan.innerText = currentDevice.firmwareStatus;

      updateResetButton();
      updateTestFirmwareImageButton();
      updateConfirmFirmwareImageButton();
      updateEraseFirmwareImageButton();
      updateSelectImageSelect();
    },
    { immediate: true },
  );
});

/** @type {HTMLButtonElement} */
const resetButton = document.getElementById("reset");
resetButton.addEventListener("click", () => {
  currentDevice.reset();
  resetButton.disabled = true;
});
const updateResetButton = () => {
  const status = currentDevice.firmwareStatus;
  const enabled = status == "pending" || status == "testing";
  resetButton.disabled = !enabled || !currentDevice.canReset;
};

/** @type {HTMLButtonElement} */
const testFirmwareImageButton = document.getElementById("testFirmwareImage");
testFirmwareImageButton.addEventListener("click", () => {
  currentDevice.testFirmwareImage(selectedImageIndex);
});
const updateTestFirmwareImageButton = () => {
  const enabled = currentDevice.firmwareStatus == "uploaded";
  testFirmwareImageButton.disabled = !enabled;
};

/** @type {HTMLButtonElement} */
const confirmFirmwareImageButton = document.getElementById(
  "confirmFirmwareImage",
);
confirmFirmwareImageButton.addEventListener("click", () => {
  currentDevice.confirmFirmwareImage(selectedImageIndex);
});
const updateConfirmFirmwareImageButton = () => {
  const enabled =
    currentDevice.firmwareStatus == "testing" ||
    currentDevice.firmwareStatus == "uploaded";
  confirmFirmwareImageButton.disabled = !enabled;
};

/** @type {HTMLButtonElement} */
const eraseFirmwareImageButton = document.getElementById("eraseFirmwareImage");
eraseFirmwareImageButton.addEventListener("click", () => {
  currentDevice.eraseFirmwareImage();
});
const updateEraseFirmwareImageButton = () => {
  const enabled = currentDevice.firmwareStatus == "uploaded";
  eraseFirmwareImageButton.disabled = !enabled;
};

/** @type {HTMLSelectElement} */
const imageSelectionSelect = document.getElementById("imageSelection");
/** @type {HTMLOptGroupElement} */
const imageSelectionOptGroup = imageSelectionSelect.querySelector("optgroup");
onCurrentDevice(() => {
  currentDevice.addEventListener("firmwareImages", () => {
    imageSelectionOptGroup.innerHTML = "";
    currentDevice.firmwareImages.forEach(
      (firmwareImage, index) => {
        const option = new Option(
          `${firmwareImage.version} (slot ${index})`,
          index,
        );
        option.disabled = firmwareImage.empty;
        imageSelectionOptGroup.appendChild(option);
      },
      { immediate: true },
    );
  });
  imageSelectionSelect.dispatchEvent(new Event("input"));
});
imageSelectionSelect.addEventListener("input", () => {
  selectedImageIndex = Number(imageSelectionSelect.value);
  console.log({ selectedImageIndex });
});
let selectedImageIndex = 0;
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "isConnected",
    () => {
      imageSelectionSelect.disabled = !currentDevice.isConnected;
    },
    { immediate: true },
  );
});

function updateSelectImageSelect() {
  let enabled = true;
  switch (currentDevice.firmwareStatus) {
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
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "isWifiAvailable",
    (event) => {
      isWifiAvailableSpan.innerText = event.message.isWifiAvailable;
    },
    { immediate: true },
  );
});

/** @type {HTMLSpanElement} */
const wifiSSIDSpan = document.getElementById("wifiSSID");
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "getWifiSSID",
    (event) => {
      wifiSSIDSpan.innerText = event.message.wifiSSID;
    },
    { immediate: true },
  );
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
  await currentDevice.setWifiSSID(setWifiSSIDInput.value);
  setWifiSSIDInput.value = "";
  setWifiSSIDButton.disabled = false;
  setWifiSSIDButton.innerText = "set wifi ssid";
});

/** @type {HTMLSpanElement} */
const wifiPasswordSpan = document.getElementById("wifiPassword");
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "getWifiPassword",
    (event) => {
      wifiPasswordSpan.innerText = event.message.wifiPassword;
    },
    { immediate: true },
  );
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
  await currentDevice.setWifiPassword(setWifiPasswordInput.value);
  setWifiPasswordInput.value = "";
  setWifiPasswordButton.disabled = false;
  setWifiPasswordButton.innerText = "set wifi password";
});

const updateWifiInputs = () => {
  const enabled =
    currentDevice.isConnected &&
    currentDevice.isWifiAvailable &&
    !currentDevice.wifiConnectionEnabled;
  const disabled = !enabled;

  setWifiPasswordInput.disabled = disabled;
  setWifiPasswordButton.disabled = disabled;

  setWifiSSIDInput.disabled = disabled;
  setWifiSSIDButton.disabled = disabled;

  toggleWifiConnectionButton.disabled = !(
    currentDevice.isConnected && currentDevice.isWifiAvailable
  );
};
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "isConnected",
    () => {
      updateWifiInputs();
    },
    { immediate: true },
  );
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "getWifiConnectionEnabled",
    () => {
      updateWifiInputs();
    },
    { immediate: true },
  );
});

/** @type {HTMLSpanElement} */
const wifiConnectionEnabledSpan = document.getElementById(
  "wifiConnectionEnabled",
);
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "getWifiConnectionEnabled",
    (event) => {
      wifiConnectionEnabledSpan.innerText = event.message.wifiConnectionEnabled;
    },
    { immediate: true },
  );
});

/** @type {HTMLSpanElement} */
const isWifiConnectedSpan = document.getElementById("isWifiConnected");
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "isWifiConnected",
    (event) => {
      isWifiConnectedSpan.innerText = event.message.isWifiConnected;
    },
    { immediate: true },
  );
});

/** @type {HTMLSpanElement} */
const ipAddressSpan = document.getElementById("ipAddress");
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "ipAddress",
    (event) => {
      ipAddressSpan.innerText = event.message.ipAddress || "none";
    },
    { immediate: true },
  );
});

/** @type {HTMLButtonElement} */
const toggleWifiConnectionButton = document.getElementById(
  "toggleWifiConnection",
);
toggleWifiConnectionButton.addEventListener("click", async () => {
  toggleWifiConnectionButton.disabled = true;
  await currentDevice.toggleWifiConnection();
  toggleWifiConnectionButton.disabled = false;
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "getWifiConnectionEnabled",
    (event) => {
      toggleWifiConnectionButton.innerText = event.message.wifiConnectionEnabled
        ? "disable wifi connection"
        : "enable wifi connection";
    },
    { immediate: true },
  );
});

/** @type {HTMLButtonElement} */
const connectViaWebSocketsButton = document.getElementById(
  "connectViaWebSockets",
);
connectViaWebSocketsButton.addEventListener("click", async () => {
  toggleWifiConnectionButton.disabled = true;
  currentDevice.reconnectViaWebSockets();
});
const updateConnectViaWebSocketsButton = () => {
  const enabled =
    currentDevice.isConnected &&
    currentDevice.connectionType == "webBluetooth" &&
    currentDevice.isWifiConnected;
  // console.log({ enabled });
  connectViaWebSocketsButton.disabled = !enabled;
};
onCurrentDevice(() => {
  currentDevice.addEventListener("isWifiConnected", () =>
    updateConnectViaWebSocketsButton(),
  );
  currentDevice.addEventListener("isConnected", () =>
    updateConnectViaWebSocketsButton(),
  );

  // CAMERA
  /** @type {HTMLSpanElement} */
  const isCameraAvailableSpan = document.getElementById("isCameraAvailable");
  currentDevice.addEventListener(
    "connected",
    () => {
      isCameraAvailableSpan.innerText = currentDevice.hasCamera;
    },
    { immediate: true },
  );
});

/** @type {HTMLSpanElement} */
const cameraStatusSpan = document.getElementById("cameraStatus");
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "cameraStatus",
    () => {
      cameraStatusSpan.innerText = currentDevice.cameraStatus;
    },
    { immediate: true },
  );
});

/** @type {HTMLButtonElement} */
const takePictureButton = document.getElementById("takePicture");
takePictureButton.addEventListener("click", () => {
  if (currentDevice.cameraStatus == "idle") {
    currentDevice.takePicture();
  } else {
    currentDevice.stopCamera();
  }
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "connected",
    () => {
      updateTakePictureButton();
    },
    { immediate: true },
  );
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "getSensorConfiguration",
    () => {
      updateTakePictureButton();
    },
    { immediate: true },
  );
});
const updateTakePictureButton = () => {
  takePictureButton.disabled = !currentDevice.isConnected;
  // currentDevice.sensorConfiguration.camera == 0 ||
  // currentDevice.cameraStatus != "idle";
};
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "cameraStatus",
    () => {
      updateTakePictureButton();
    },
    { immediate: true },
  );
});

/** @type {HTMLButtonElement} */
const focusCameraButton = document.getElementById("focusCamera");
focusCameraButton.addEventListener("click", () => {
  if (currentDevice.cameraStatus == "idle") {
    currentDevice.focusCamera();
  } else {
    currentDevice.stopCamera();
  }
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "connected",
    () => {
      updateFocusCameraButton();
    },
    { immediate: true },
  );
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "getSensorConfiguration",
    () => {
      updateFocusCameraButton();
    },
    { immediate: true },
  );
});
const updateFocusCameraButton = () => {
  focusCameraButton.disabled =
    !currentDevice.isConnected ||
    //currentDevice.sensorConfiguration.camera == 0 ||
    currentDevice.cameraStatus != "idle";
};
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "cameraStatus",
    (event) => {
      updateFocusCameraButton();
      if (
        currentDevice.cameraStatus == "idle" &&
        event.message.previousCameraStatus == "focusing"
      ) {
        currentDevice.takePicture();
      }
    },
    { immediate: true },
  );
});

/** @type {HTMLButtonElement} */
const sleepCameraButton = document.getElementById("sleepCamera");
sleepCameraButton.addEventListener("click", () => {
  if (currentDevice.cameraStatus == "asleep") {
    currentDevice.wakeCamera();
  } else {
    currentDevice.sleepCamera();
  }
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "connected",
    () => {
      updateSleepCameraButton();
    },
    { immediate: true },
  );
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "getSensorConfiguration",
    () => {
      updateSleepCameraButton();
    },
    { immediate: true },
  );
});
const updateSleepCameraButton = () => {
  let disabled = !currentDevice.isConnected || !currentDevice.hasCamera;
  switch (currentDevice.cameraStatus) {
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
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "cameraStatus",
    () => {
      updateSleepCameraButton();
    },
    { immediate: true },
  );
});

/** @type {HTMLImageElement} */
const cameraImage = document.getElementById("cameraImage");
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "cameraImage",
    (event) => {
      cameraImage.src = event.message.url;
    },
    { immediate: true },
  );
});

/** @type {HTMLProgressElement} */
const cameraImageProgress = document.getElementById("cameraImageProgress");
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "cameraImageProgress",
    (event) => {
      if (event.message.type == "image") {
        cameraImageProgress.value = event.message.progress;
      }
    },
    { immediate: true },
  );
});

/** @type {HTMLInputElement} */
const autoPictureCheckbox = document.getElementById("autoPicture");
autoPictureCheckbox.addEventListener("input", () => {
  currentDevice.autoPicture = autoPictureCheckbox.checked;
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "autoPicture",
    () => {
      autoPictureCheckbox.checked = currentDevice.autoPicture;
    },
    { immediate: true },
  );
});

/** @type {HTMLPreElement} */
const cameraConfigurationPre = document.getElementById(
  "cameraConfigurationPre",
);
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "getCameraConfiguration",
    () => {
      cameraConfigurationPre.textContent = JSON.stringify(
        currentDevice.cameraConfiguration,
        null,
        2,
      );
    },
    { immediate: true },
  );
});

const cameraConfigurationContainer = document.getElementById(
  "cameraConfiguration",
);
/** @type {HTMLTemplateElement} */
const cameraConfigurationTypeTemplate = document.getElementById(
  "cameraConfigurationTypeTemplate",
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

  onCurrentDevice(() => {
    currentDevice.addEventListener(
      "isConnected",
      () => {
        updateIsInputDisabled();
      },
      { immediate: true },
    );
    currentDevice.addEventListener(
      "connected",
      () => {
        updateContainerVisibility();
      },
      { immediate: true },
    );
    currentDevice.addEventListener(
      "cameraStatus",
      () => {
        updateIsInputDisabled();
      },
      { immediate: true },
    );
  });
  const updateIsInputDisabled = () => {
    input.disabled =
      !currentDevice.isConnected ||
      !currentDevice.hasCamera ||
      currentDevice.cameraStatus != "idle";
  };

  const updateContainerVisibility = () => {
    const isVisible =
      cameraConfigurationType in currentDevice.cameraConfiguration;
    cameraConfigurationTypeContainer.style.display = isVisible ? "" : "none";
  };
  const updateInput = () => {
    const value = currentDevice.cameraConfiguration[cameraConfigurationType];
    span.innerText = value;
    input.value = value;
  };

  onCurrentDevice(() => {
    currentDevice.addEventListener(
      "connected",
      () => {
        if (!currentDevice.hasCamera) {
          return;
        }
        const range =
          currentDevice.cameraConfigurationRanges[cameraConfigurationType];
        input.min = range.min;
        input.max = range.max;

        updateInput();
      },
      { immediate: true },
    );

    currentDevice.addEventListener(
      "getCameraConfiguration",
      () => {
        updateInput();
      },
      { immediate: true },
    );
  });

  input.addEventListener("change", () => {
    const value = Number(input.value);
    // console.log(`updating ${cameraConfigurationType} to ${value}`);
    currentDevice.setCameraConfiguration({
      [cameraConfigurationType]: value,
    });
    if (takePictureAfterUpdate) {
      currentDevice.addEventListener(
        "getCameraConfiguration",
        () => {
          (setTimeout(() => currentDevice.takePicture()), 100);
        },
        { once: true },
      );
    }
  });
});

/** @type {HTMLInputElement} */
const takePictureAfterUpdateCheckbox = document.getElementById(
  "takePictureAfterUpdate",
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
    if (currentDevice.cameraStatus != "idle") {
      return;
    }

    currentDevice.setCameraConfiguration(config);

    if (takePictureAfterUpdate) {
      currentDevice.addEventListener(
        "getCameraConfiguration",
        () => {
          (setTimeout(() => currentDevice.takePicture()), 100);
        },
        { once: true },
      );
    }
  },
  200,
  true,
);
cameraWhiteBalanceInput.addEventListener("input", () => {
  let [redGain, greenGain, blueGain] = cameraWhiteBalanceInput.value
    .replace("#", "")
    .match(/.{1,2}/g)
    .map((value) => Number(`0x${value}`))
    .map((value) => value / 255)
    .map(
      (value) => value * currentDevice.cameraConfigurationRanges.blueGain.max,
    )
    .map((value) => Math.round(value));

  updateWhiteBalance({ redGain, greenGain, blueGain });
});
const updateCameraWhiteBalanceInput = () => {
  if (!currentDevice.hasCamera) {
    return;
  }
  cameraWhiteBalanceInput.disabled =
    !currentDevice.isConnected ||
    !currentDevice.hasCamera ||
    currentDevice.cameraStatus != "idle";

  const { redGain, blueGain, greenGain } = currentDevice.cameraConfiguration;
  const cameraWhiteBalanceHex = `#${[redGain, blueGain, greenGain]
    .map((value) => value / currentDevice.cameraConfigurationRanges.redGain.max)
    .map((value) => value * 255)
    .map((value) => Math.round(value))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")}`;
  console.log({ cameraWhiteBalanceHex });
  cameraWhiteBalanceInput.value = cameraWhiteBalanceHex;
};
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "connected",
    () => {
      updateCameraWhiteBalanceInput();
    },
    { immediate: true },
  );
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "getCameraConfiguration",
    () => {
      updateCameraWhiteBalanceInput();
    },
    { immediate: true },
  );
});

/** @type {HTMLVideoElement} */
const cameraRecordingVideoElement = document.getElementById("cameraRecording");
/** @type {HTMLInputElement} */
const autoPlayCameraRecordingCheckbox = document.getElementById(
  "autoPlayCameraRecording",
);
let autoPlayCameraRecording = autoPlayCameraRecordingCheckbox.checked;
autoPlayCameraRecordingCheckbox.addEventListener("input", () => {
  autoPlayCameraRecording = autoPlayCameraRecordingCheckbox.checked;
  console.log({ autoPlayCameraRecording });
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "cameraRecording",
    (event) => {
      cameraRecordingVideoElement.src = event.message.url;
      cameraRecordingVideoElement.removeAttribute("hidden");
      if (autoPlayCameraRecording) {
        cameraRecordingVideoElement.play();
      }
    },
    { immediate: true },
  );
});

/** @type {HTMLButtonElement} */
const toggleCameraRecordingButton = document.getElementById(
  "toggleCameraRecording",
);
toggleCameraRecordingButton.addEventListener("click", () => {
  currentDevice.toggleCameraRecording(microphoneStream);
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "connected",
    () => {
      updateToggleCameraRecordingButton();
    },
    { immediate: true },
  );
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "getSensorConfiguration",
    () => {
      updateToggleCameraRecordingButton();
    },
    { immediate: true },
  );
});
const updateToggleCameraRecordingButton = () => {
  let disabled = !currentDevice.isConnected || !currentDevice.hasCamera;

  toggleCameraRecordingButton.innerText = currentDevice.isRecordingCamera
    ? "stop recording"
    : "start recording";

  toggleCameraRecordingButton.disabled = disabled;
};
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "isRecordingCamera",
    () => {
      updateToggleCameraRecordingButton();
    },
    { immediate: true },
  );
});

/** @type {HTMLSelectElement} */
const selectMicrophoneSelect = document.getElementById("selectMicrophone");
/** @type {HTMLOptGroupElement} */
const selectMicrophoneOptgroup =
  selectMicrophoneSelect.querySelector("optgroup");
selectMicrophoneSelect.addEventListener("input", () => {
  selectMicrophone(selectMicrophoneSelect.value);
});

selectMicrophoneSelect.addEventListener("click", async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const audioDevices = devices.filter((device) => device.kind == "audioinput");
  console.log("audioDevices", audioDevices);
  if (audioDevices.length == 1 && audioDevices[0].deviceId == "") {
    console.log("getting audio");
    const microphoneStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    microphoneStream.getAudioTracks().forEach((track) => track.stop());
    updateMicrophoneSources();
  }
});
const updateMicrophoneSources = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const audioDevices = devices.filter((device) => device.kind == "audioinput");
  selectMicrophoneOptgroup.innerHTML = "";
  selectMicrophoneOptgroup.appendChild(new Option("none"));
  selectMicrophoneOptgroup.appendChild(new Option("device"));
  audioDevices.forEach((audioInputDevice) => {
    selectMicrophoneOptgroup.appendChild(
      new Option(audioInputDevice.label, audioInputDevice.deviceId),
    );
  });
  selectMicrophoneSelect.value = "none";
  selectMicrophone(selectMicrophoneSelect.value);
};
/** @type {MediaStream?} */
let microphoneStream;
const selectMicrophone = async (deviceId) => {
  stopMicrophoneStream();
  if (deviceId == "none") {
    microphoneAudio.setAttribute("hidden", "");
  } else if (deviceId == "device") {
    microphoneStream = currentDevice.microphoneMediaStreamDestination.stream;
  } else {
    microphoneStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: { exact: deviceId },
        // noiseSuppression: false,
        // echoCancellation: false,
        // autoGainControl: false,
      },
    });
    microphoneAudio.srcObject = microphoneStream;
    microphoneAudio.removeAttribute("hidden");
    console.log("got microphoneStream", deviceId, microphoneStream);
  }
};
const stopMicrophoneStream = () => {
  if (microphoneStream) {
    console.log("stopping microphoneStream");
    if (
      microphoneStream != currentDevice.microphoneMediaStreamDestination.stream
    ) {
      microphoneStream.getAudioTracks().forEach((track) => track.stop());
    }
    microphoneStream = undefined;
  }
  microphoneAudio.srcObject = undefined;
  microphoneAudio.setAttribute("hidden", "");
};
navigator.mediaDevices.addEventListener("devicechange", () =>
  updateMicrophoneSources(),
);
updateMicrophoneSources();

/** @type {HTMLAudioElement} */
const microphoneAudio = document.getElementById("microphoneAudio");
let isMicrophoneLoaded = false;
microphoneAudio.addEventListener("loadstart", () => {
  isMicrophoneLoaded = true;
});
microphoneAudio.addEventListener("emptied", () => {
  isMicrophoneLoaded = false;
});

// MICROPHONE

/** @type {HTMLSpanElement} */
const isMicrophoneAvailableSpan = document.getElementById(
  "isMicrophoneAvailable",
);
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "connected",
    () => {
      isMicrophoneAvailableSpan.innerText = currentDevice.hasMicrophone;
    },
    { immediate: true },
  );
});

/** @type {HTMLSpanElement} */
const microphoneStatusSpan = document.getElementById("microphoneStatus");
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "microphoneStatus",
    () => {
      microphoneStatusSpan.innerText = currentDevice.microphoneStatus;
    },
    { immediate: true },
  );
});

/** @type {HTMLPreElement} */
const microphoneConfigurationPre = document.getElementById(
  "microphoneConfigurationPre",
);
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "getMicrophoneConfiguration",
    () => {
      microphoneConfigurationPre.textContent = JSON.stringify(
        currentDevice.microphoneConfiguration,
        null,
        2,
      );
    },
    { immediate: true },
  );
});

const microphoneConfigurationContainer = document.getElementById(
  "microphoneConfiguration",
);
/** @type {HTMLTemplateElement} */
const microphoneConfigurationTypeTemplate = document.getElementById(
  "microphoneConfigurationTypeTemplate",
);
BS.MicrophoneConfigurationTypes.forEach((microphoneConfigurationType) => {
  const microphoneConfigurationTypeContainer =
    microphoneConfigurationTypeTemplate.content
      .cloneNode(true)
      .querySelector(".microphoneConfigurationType");

  microphoneConfigurationContainer.appendChild(
    microphoneConfigurationTypeContainer,
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
    },
  );

  /** @type {HTMLSpanElement} */
  const span = microphoneConfigurationTypeContainer.querySelector("span");

  onCurrentDevice(() => {
    currentDevice.addEventListener(
      "isConnected",
      () => {
        updateisInputDisabled();
      },
      { immediate: true },
    );
  });
  onCurrentDevice(() => {
    currentDevice.addEventListener(
      "microphoneStatus",
      () => {
        updateisInputDisabled();
      },
      { immediate: true },
    );
  });
  const updateisInputDisabled = () => {
    select.disabled =
      !currentDevice.isConnected ||
      !currentDevice.hasMicrophone ||
      currentDevice.microphoneStatus != "idle";
  };

  const updateSelect = () => {
    const value =
      currentDevice.microphoneConfiguration[microphoneConfigurationType];
    span.innerText = value;
    select.value = value;
  };

  onCurrentDevice(() => {
    currentDevice.addEventListener(
      "connected",
      () => {
        if (!currentDevice.hasMicrophone) {
          return;
        }
        updateSelect();
      },
      { immediate: true },
    );
  });

  onCurrentDevice(() => {
    currentDevice.addEventListener(
      "getMicrophoneConfiguration",
      () => {
        updateSelect();
      },
      { immediate: true },
    );
  });

  select.addEventListener("input", () => {
    const value = select.value;
    // console.log(`updating ${microphoneConfigurationType} to ${value}`);
    currentDevice.setMicrophoneConfiguration({
      [microphoneConfigurationType]: value,
    });
  });
});

/** @type {HTMLButtonElement} */
const toggleMicrophoneButton = document.getElementById("toggleMicrophone");
toggleMicrophoneButton.addEventListener("click", () => {
  currentDevice.toggleMicrophone();
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "connected",
    () => {
      updateToggleMicrophoneButton();
    },
    { immediate: true },
  );
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "getSensorConfiguration",
    () => {
      updateToggleMicrophoneButton();
    },
    { immediate: true },
  );
});
const updateToggleMicrophoneButton = () => {
  let disabled =
    !currentDevice.isConnected ||
    currentDevice.sensorConfiguration.microphone == 0 ||
    !currentDevice.hasMicrophone;

  switch (currentDevice.microphoneStatus) {
    case "streaming":
      toggleMicrophoneButton.innerText = "stop microphone";
      break;
    case "idle":
      toggleMicrophoneButton.innerText = "start microphone";
      break;
  }
  toggleMicrophoneButton.disabled = disabled;
};
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "microphoneStatus",
    () => {
      updateToggleMicrophoneButton();
    },
    { immediate: true },
  );
});

/** @type {HTMLButtonElement} */
const startMicrophoneButton = document.getElementById("startMicrophone");
startMicrophoneButton.addEventListener("click", () => {
  currentDevice.startMicrophone();
});
/** @type {HTMLButtonElement} */
const stopMicrophoneButton = document.getElementById("stopMicrophone");
stopMicrophoneButton.addEventListener("click", () => {
  currentDevice.stopMicrophone();
});
/** @type {HTMLButtonElement} */
const enableMicrophoneVadButton = document.getElementById(
  "enableMicrophoneVad",
);
enableMicrophoneVadButton.addEventListener("click", () => {
  currentDevice.enableMicrophoneVad();
});

const updateMicrophoneButtons = () => {
  let disabled = !currentDevice.isConnected || !currentDevice.hasMicrophone;

  startMicrophoneButton.disabled =
    disabled || currentDevice.microphoneStatus == "streaming";
  stopMicrophoneButton.disabled =
    disabled || currentDevice.microphoneStatus == "idle";
  enableMicrophoneVadButton.disabled =
    disabled || currentDevice.microphoneStatus == "vad";
};
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "microphoneStatus",
    () => {
      updateMicrophoneButtons();
    },
    { immediate: true },
  );
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "connected",
    () => {
      updateMicrophoneButtons();
    },
    { immediate: true },
  );
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "getSensorConfiguration",
    () => {
      updateMicrophoneButtons();
    },
    { immediate: true },
  );
});

const audioContext = new (window.AudioContext || window.webkitAudioContext)({
  sampleRate: 16_000,
  latencyHint: "interactive",
});
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

onCurrentDevice(() => {
  currentDevice.audioContext = audioContext;
});

/** @type {HTMLAudioElement} */
const microphoneStreamAudioElement =
  document.getElementById("microphoneStream");
onCurrentDevice(() => {
  microphoneStreamAudioElement.srcObject =
    currentDevice.microphoneMediaStreamDestination.stream;
});

/** @type {HTMLAudioElement} */
const microphoneRecordingAudioElement = document.getElementById(
  "microphoneRecording",
);
/** @type {HTMLInputElement} */
const autoPlayMicrophoneRecordingCheckbox = document.getElementById(
  "autoPlayMicrophoneRecording",
);
let autoPlayMicrophoneRecording = autoPlayMicrophoneRecordingCheckbox.checked;
console.log("autoPlayMicrophoneRecording", autoPlayMicrophoneRecording);
autoPlayMicrophoneRecordingCheckbox.addEventListener("input", () => {
  autoPlayMicrophoneRecording = autoPlayMicrophoneRecordingCheckbox.checked;
  console.log({ autoPlayMicrophoneRecording });
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "microphoneRecording",
    (event) => {
      microphoneRecordingAudioElement.src = event.message.url;
      if (autoPlayMicrophoneRecording) {
        microphoneRecordingAudioElement.play();
      }
    },
    { immediate: true },
  );
});

/** @type {HTMLButtonElement} */
const toggleMicrophoneRecordingButton = document.getElementById(
  "toggleMicrophoneRecording",
);
toggleMicrophoneRecordingButton.addEventListener("click", () => {
  currentDevice.toggleMicrophoneRecording();
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "connected",
    () => {
      updateToggleMicrophoneRecordingButton();
    },
    { immediate: true },
  );
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "getSensorConfiguration",
    () => {
      updateToggleMicrophoneRecordingButton();
    },
    { immediate: true },
  );
});
const updateToggleMicrophoneRecordingButton = () => {
  let disabled =
    !currentDevice.isConnected ||
    currentDevice.sensorConfiguration.microphone == 0 ||
    !currentDevice.hasMicrophone ||
    currentDevice.microphoneStatus != "streaming";

  toggleMicrophoneRecordingButton.innerText =
    currentDevice.isRecordingMicrophone ? "stop recording" : "start recording";

  toggleMicrophoneRecordingButton.disabled = disabled;
};
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "isRecordingMicrophone",
    () => {
      updateToggleMicrophoneRecordingButton();
    },
    { immediate: true },
  );
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "microphoneStatus",
    () => {
      updateToggleMicrophoneRecordingButton();
    },
    { immediate: true },
  );
});

// DISPLAY CANVAS HELPER
const displayCanvasHelper = new BS.DisplayCanvasHelper();
// displayCanvasHelper.setBrightness("veryLow");
displayCanvasHelper.canvas = displayCanvas;
window.displayCanvasHelper = displayCanvasHelper;

BS.DeviceManager.addEventListener("deviceConnected", async (event) => {
  const { device } = event.message;
  if (device.isGlasses && device.isDisplayAvailable) {
    displayCanvasHelper.device = device;
  }
});

// DISPLAY

/** @type {HTMLSpanElement} */
const isDisplayAvailableSpan = document.getElementById("isDisplayAvailable");
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "connected",
    () => {
      isDisplayAvailableSpan.innerText = currentDevice.isDisplayAvailable;
    },
    { immediate: true },
  );
});

/** @type {HTMLSpanElement} */
const displayStatusSpan = document.getElementById("displayStatus");
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "displayStatus",
    () => {
      if (!currentDevice.isDisplayAvailable) {
        return;
      }
      displayStatusSpan.innerText = currentDevice.displayStatus;
    },
    { immediate: true },
  );
});

/** @type {HTMLButtonElement} */
const toggleDisplayButton = document.getElementById("toggleDisplay");
toggleDisplayButton.addEventListener("click", () => {
  currentDevice.toggleDisplay();
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "connected",
    () => {
      updateToggleDisplayButton();
    },
    { immediate: true },
  );
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "displayStatus",
    () => {
      updateToggleDisplayButton();
    },
    { immediate: true },
  );
});
const updateToggleDisplayButton = () => {
  if (!currentDevice.isDisplayAvailable) {
    return;
  }
  let disabled =
    !currentDevice.isConnected || !currentDevice.isDisplayAvailable;
  switch (currentDevice.displayStatus) {
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
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "displayInformation",
    () => {
      displayInformationPre.textContent = JSON.stringify(
        currentDevice.displayInformation,
        null,
        2,
      );
    },
    { immediate: true },
  );
});

/** @type {HTMLSelectElement} */
const setDisplayBrightnessSelect = document.getElementById(
  "setDisplayBrightnessSelect",
);
/** @type {HTMLOptGroupElement} */
const setDisplayBrightnessSelectOptgroup =
  setDisplayBrightnessSelect.querySelector("optgroup");
BS.DisplayBrightnesses.forEach((displayBrightness) => {
  setDisplayBrightnessSelectOptgroup.appendChild(new Option(displayBrightness));
});

onCurrentDevice(() => {
  currentDevice.addEventListener(
    "isConnected",
    () => {
      setDisplayBrightnessSelect.disabled = !currentDevice.isConnected;
    },
    { immediate: true },
  );
});

onCurrentDevice(() => {
  currentDevice.addEventListener(
    "getDisplayBrightness",
    () => {
      setDisplayBrightnessSelect.value = currentDevice.displayBrightness;
    },
    { immediate: true },
  );
});

setDisplayBrightnessSelect.addEventListener("input", () => {
  currentDevice.setDisplayBrightness(setDisplayBrightnessSelect.value);
});

/** @type {HTMLTemplateElement} */
const displayColorTemplate = document.getElementById("displayColorTemplate");
const displayColorsContainer = document.getElementById("displayColors");
/** @type {string[]} */
const setDisplayColor = BS.ThrottleUtils.throttle(
  (colorIndex, colorString) => {
    // console.log({ colorIndex, colorString });
    currentDevice.setDisplayColor(colorIndex, colorString, true);
    updateBitmapCanvas();
  },
  100,
  true,
);
onCurrentDevice(() => {
  currentDevice.addEventListener("notConnected", () => {
    displayColorsContainer.innerHTML = "";
  });
  currentDevice.addEventListener(
    "connected",
    () => {
      displayColorsContainer.innerHTML = "";
      if (currentDevice.isDisplayAvailable) {
        for (
          let colorIndex = 0;
          colorIndex < currentDevice.numberOfDisplayColors;
          colorIndex++
        ) {
          const displayColorContainer = displayColorTemplate.content
            .cloneNode(true)
            .querySelector(".displayColor");

          const displayColorIndex =
            displayColorContainer.querySelector(".colorIndex");
          displayColorIndex.innerText = `color #${colorIndex}`;
          const displayColorInput =
            displayColorContainer.querySelector("input");
          displayColorInput.addEventListener("input", () => {
            setDisplayColor(colorIndex, displayColorInput.value);
            if (colorIndex == fillColorIndex) {
              fillColorInput.value = displayColorInput.value;
            }
            if (colorIndex == lineColorIndex) {
              lineColorInput.value = displayColorInput.value;
            }

            const bitmapColorIndexContainers = Array.from(
              bitmapColorIndicesContainer.querySelectorAll(".bitmapColorIndex"),
            );

            bitmapColorIndexContainers.forEach(
              (bitmapColorIndexContainer, bitmapColorIndex) => {
                if (
                  bitmapColorIndexContainer.querySelector("select").value !=
                  colorIndex
                ) {
                  return;
                }

                const bitmapColorIndexColorInput =
                  bitmapColorIndexContainer.querySelector("input");
                bitmapColorIndexColorInput.value = displayColorInput.value;

                const bitmapColorIndexSelect =
                  bitmapColorIndexContainer.querySelector("select");
                bitmapColorIndexSelect.value = colorIndex;

                if (bitmapColorIndex == currentBitmapColorIndex) {
                  currentBitmapColorIndexColorInput.value =
                    displayColorInput.value;
                }
              },
            );
          });
          displayColorsContainer.appendChild(displayColorContainer);
        }
      }
    },
    { immediate: true },
  );
  currentDevice.addEventListener("displayColor", (event) => {
    const { colorIndex, color, colorHex } = event.message;
    displayColorsContainer
      .querySelectorAll(".displayColor")
      [colorIndex].querySelector("input").value = colorHex;
  });
});

/** @type {HTMLTemplateElement} */
const displayColorOpacityTemplate = document.getElementById(
  "displayColorOpacityTemplate",
);
const displayColorOpacitiesContainer = document.getElementById(
  "displayColorOpacities",
);
const setDisplayColorOpacity = BS.ThrottleUtils.throttle(
  (colorIndex, opacity) => {
    console.log({ colorIndex, opacity });
    currentDevice.setDisplayColorOpacity(colorIndex, opacity, true);
  },
  100,
  true,
);
onCurrentDevice(() => {
  currentDevice.addEventListener("notConnected", () => {
    displayColorOpacitiesContainer.innerHTML = "";
  });
  currentDevice.addEventListener(
    "connected",
    () => {
      displayColorOpacitiesContainer.innerHTML = "";
      if (currentDevice.isDisplayAvailable) {
        for (
          let colorIndex = 0;
          colorIndex < currentDevice.numberOfDisplayColors;
          colorIndex++
        ) {
          const displayColorOpacityContainer =
            displayColorOpacityTemplate.content
              .cloneNode(true)
              .querySelector(".displayColorOpacity");

          const displayColorOpacityIndex =
            displayColorOpacityContainer.querySelector(".colorIndex");
          displayColorOpacityIndex.innerText = `opacity #${colorIndex}`;
          const displayColorOpacityInput =
            displayColorOpacityContainer.querySelector("input");
          const displayColorOpacitySpan =
            displayColorOpacityContainer.querySelector("span");
          displayColorOpacityInput.addEventListener("input", () => {
            const opacity = Number(displayColorOpacityInput.value);
            displayColorOpacitySpan.innerText = Math.round(opacity * 100);
            setDisplayColorOpacity(colorIndex, opacity);
          });
          displayColorOpacitiesContainer.appendChild(
            displayColorOpacityContainer,
          );
        }
      }
    },
    { immediate: true },
  );
});

const displayOpacityContainer = document.getElementById("displayOpacity");
const displayOpacitySpan = displayOpacityContainer.querySelector("span");
const displayOpacityInput = displayOpacityContainer.querySelector("input");

const setDisplayOpacity = BS.ThrottleUtils.throttle(
  (opacity) => {
    console.log({ opacity });
    currentDevice.setDisplayOpacity(opacity, true);
  },
  100,
  true,
);
displayOpacityInput.addEventListener("input", () => {
  const opacity = Number(displayOpacityInput.value);
  displayOpacitySpan.innerText = Math.round(opacity * 100);
  setDisplayOpacity(opacity);
  displayColorOpacitiesContainer
    .querySelectorAll(".displayColorOpacity")
    .forEach((container) => {
      const input = container.querySelector("input");
      const opacitySpan = container.querySelector("span.opacity");
      input.value = opacity;
      opacitySpan.innerText = Math.round(opacity * 100);
    });
});

onCurrentDevice(() => {
  currentDevice.addEventListener(
    "isConnected",
    () => {
      const enabled =
        currentDevice.isConnected && currentDevice.isDisplayAvailable;
      displayOpacityInput.disabled = !enabled;
    },
    { immediate: true },
  );
});

const fillColorContainer = document.getElementById("fillColor");
const fillColorSelect = fillColorContainer.querySelector("select");
const fillColorOptgroup = fillColorSelect.querySelector("optgroup");
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "connected",
    () => {
      if (!currentDevice.isDisplayAvailable) {
        return;
      }
      fillColorOptgroup.innerHTML = "";
      for (
        let colorIndex = 0;
        colorIndex < currentDevice.numberOfDisplayColors;
        colorIndex++
      ) {
        fillColorOptgroup.appendChild(new Option(colorIndex));
      }
      fillColorSelect.value = fillColorIndex;
    },
    { immediate: true },
  );
});
const fillColorInput = fillColorContainer.querySelector("input");
let fillColorIndex = 1;
fillColorSelect.addEventListener("input", () => {
  fillColorIndex = Number(fillColorSelect.value);
  console.log({ fillColorIndex });
  currentDevice.selectDisplayFillColor(fillColorIndex);
  drawShape();
  fillColorInput.value = currentDevice.displayColors[fillColorIndex];
});

onCurrentDevice(
  () => {
    currentDevice.addEventListener("isConnected", () => {
      const enabled =
        currentDevice.isConnected && currentDevice.isDisplayAvailable;
      fillColorSelect.disabled = !enabled;
      // console.log({ enabled });
    });
  },
  { immediate: true },
);

const lineColorContainer = document.getElementById("lineColor");
const lineColorSelect = lineColorContainer.querySelector("select");
const lineColorOptgroup = lineColorSelect.querySelector("optgroup");
let lineColorIndex = 1;
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "connected",
    () => {
      if (!currentDevice.isDisplayAvailable) {
        return;
      }
      lineColorOptgroup.innerHTML = "";
      for (
        let colorIndex = 0;
        colorIndex < currentDevice.numberOfDisplayColors;
        colorIndex++
      ) {
        lineColorOptgroup.appendChild(new Option(colorIndex));
      }
      lineColorSelect.value = lineColorIndex;
    },
    { immediate: true },
  );
});
const lineColorInput = lineColorContainer.querySelector("input");
lineColorSelect.addEventListener("input", () => {
  lineColorIndex = Number(lineColorSelect.value);
  console.log({ lineColorIndex });
  currentDevice.selectDisplayLineColor(lineColorIndex);
  drawShape();
  lineColorInput.value = currentDevice.displayColors[lineColorIndex];
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "isConnected",
    () => {
      const enabled =
        currentDevice.isConnected && currentDevice.isDisplayAvailable;
      lineColorSelect.disabled = !enabled;
    },
    { immediate: true },
  );
});

const backgroundColorContainer = document.getElementById("backgroundColor");
const backgroundColorSelect = backgroundColorContainer.querySelector("select");
const backgroundColorOptgroup = backgroundColorSelect.querySelector("optgroup");
let backgroundColorIndex = 0;
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "connected",
    () => {
      if (!currentDevice.isDisplayAvailable) {
        return;
      }
      backgroundColorOptgroup.innerHTML = "";
      for (
        let colorIndex = 0;
        colorIndex < currentDevice.numberOfDisplayColors;
        colorIndex++
      ) {
        backgroundColorOptgroup.appendChild(new Option(colorIndex));
      }
      backgroundColorSelect.value = backgroundColorIndex;
    },
    { immediate: true },
  );
});
const backgroundColorInput = backgroundColorContainer.querySelector("input");
backgroundColorSelect.addEventListener("input", () => {
  backgroundColorIndex = Number(backgroundColorSelect.value);
  console.log({ backgroundColorIndex });
  currentDevice.setDisplayFillBackground(backgroundColorIndex != 0);
  currentDevice.selectDisplayBackgroundColor(backgroundColorIndex);
  drawShape();
  backgroundColorInput.value =
    currentDevice.displayColors[backgroundColorIndex];
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "isConnected",
    () => {
      const enabled =
        currentDevice.isConnected && currentDevice.isDisplayAvailable;
      backgroundColorSelect.disabled = !enabled;
    },
    { immediate: true },
  );
});

let drawWhenReady = false;
let lastDrawTime = 0;
let lastDrawReadyTime = 0;
let pendingParams;
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "displayReady",
    () => {
      lastDrawReadyTime = Date.now();
      // console.log("ready", lastDrawReadyTime - lastDrawTime);
      if (drawWhenReady) {
        drawWhenReady = false;
        drawShape(pendingParams);
      }
    },
    { immediate: true },
  );
});
const drawShape = (updatedParams) => {
  if (currentDevice.isConnected && currentDevice.isDisplayAvailable) {
    // console.log(currentDevice.isDisplayReady);
    if (!currentDevice.isDisplayReady) {
      drawWhenReady = true;
      pendingParams = updatedParams;
      return;
    }
    lastDrawTime = Date.now();

    if (true)
      console.log("draw", {
        drawShapeType,
        drawWidth,
        drawHeight,
        drawX,
        drawY,
        drawBorderRadius,
        drawStartAngle,
        drawAngleOffset,
        drawBitmapScaleX,
        drawBitmapScaleY,
        drawBitmapScale,
      });
    if (updatedParams?.includes("lineWidth")) {
      currentDevice.setDisplayLineWidth(lineWidth);
    }
    if (updatedParams?.includes("rotation")) {
      currentDevice.setDisplayRotation(rotation);
    }
    if (updatedParams?.includes("segmentStartCap")) {
      currentDevice.setDisplaySegmentStartCap(segmentStartCap);
    }
    if (updatedParams?.includes("segmentEndCap")) {
      currentDevice.setDisplaySegmentEndCap(segmentEndCap);
    }
    if (updatedParams?.includes("verticalAlignment")) {
      currentDevice.setDisplayVerticalAlignment(verticalAlignment);
    }
    if (updatedParams?.includes("horizontalAlignment")) {
      currentDevice.setDisplayHorizontalAlignment(horizontalAlignment);
    }
    if (updatedParams?.includes("segmentStartRadius")) {
      currentDevice.setDisplaySegmentStartRadius(drawSegmentStartRadius);
    }
    if (updatedParams?.includes("segmentEndRadius")) {
      currentDevice.setDisplaySegmentEndRadius(drawSegmentEndRadius);
    }

    if (updatedParams?.includes("cropTop")) {
      currentDevice.setDisplayCropTop(drawCropTop);
    }
    if (updatedParams?.includes("cropRight")) {
      currentDevice.setDisplayCropRight(drawCropRight);
    }
    if (updatedParams?.includes("cropBottom")) {
      currentDevice.setDisplayCropBottom(drawCropBottom);
    }
    if (updatedParams?.includes("cropLeft")) {
      currentDevice.setDisplayCropLeft(drawCropLeft);
    }

    if (updatedParams?.includes("rotationCropTop")) {
      currentDevice.setDisplayRotationCropTop(drawRotationCropTop);
    }
    if (updatedParams?.includes("rotationCropRight")) {
      currentDevice.setDisplayRotationCropRight(drawRotationCropRight);
    }
    if (updatedParams?.includes("rotationCropBottom")) {
      currentDevice.setDisplayRotationCropBottom(drawRotationCropBottom);
    }
    if (updatedParams?.includes("rotationCropLeft")) {
      currentDevice.setDisplayRotationCropLeft(drawRotationCropLeft);
    }

    if (updatedParams?.includes("bitmapScaleX")) {
      currentDevice.setDisplayBitmapScaleX(drawBitmapScaleX);
    }
    if (updatedParams?.includes("bitmapScaleY")) {
      currentDevice.setDisplayBitmapScaleY(drawBitmapScaleY);
    }
    if (updatedParams?.includes("bitmapScale")) {
      currentDevice.setDisplayBitmapScale(drawBitmapScale);
    }

    switch (drawShapeType) {
      case "drawRect":
        currentDevice.drawDisplayRect(drawX, drawY, drawWidth, drawHeight);
        break;
      case "drawRoundRect":
        currentDevice.drawDisplayRoundRect(
          drawX,
          drawY,
          drawWidth,
          drawHeight,
          drawBorderRadius,
        );
        break;
      case "drawCircle":
        currentDevice.drawDisplayCircle(drawX, drawY, drawRadius);
        break;
      case "drawEllipse":
        currentDevice.drawDisplayEllipse(drawX, drawY, drawWidth, drawHeight);
        break;
      case "drawRegularPolygon":
        currentDevice.drawDisplayRegularPolygon(
          drawX,
          drawY,
          drawRadius,
          drawNumberOfSides,
        );
        break;
      case "drawSegment":
        currentDevice.drawDisplaySegment(drawX, drawY, drawEndX, drawEndY);
        break;
      case "drawArc":
        currentDevice.drawDisplayArc(
          drawX,
          drawY,
          drawRadius,
          drawStartAngle,
          drawAngleOffset,
        );
        break;
      case "drawArcEllipse":
        currentDevice.drawDisplayArcEllipse(
          drawX,
          drawY,
          drawWidth,
          drawHeight,
          drawStartAngle,
          drawAngleOffset,
        );
        break;
      case "drawBitmap":
        currentDevice.drawDisplayBitmap(drawX, drawY, {
          numberOfColors: bitmapNumberOfColors,
          pixels: bitmapPixels,
          width: bitmapWidth,
          height: bitmapHeight,
        });
        break;
      default:
        console.error(`uncaught drawShapeType ${drawShapeType}`);
        break;
    }
    currentDevice.showDisplay();
  }
};

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

const horizontalAlignmentContainer = document.getElementById(
  "horizontalAlignment",
);
const horizontalAlignmentSelect =
  horizontalAlignmentContainer.querySelector("select");
const horizontalAlignmentOptgroup =
  horizontalAlignmentSelect.querySelector("optgroup");

BS.DisplayAlignments.forEach((horizontalAlignment) => {
  horizontalAlignmentOptgroup.appendChild(new Option(horizontalAlignment));
});
horizontalAlignmentSelect.value = "center";
let horizontalAlignment = horizontalAlignmentSelect.value;
console.log({ horizontalAlignment });

horizontalAlignmentSelect.addEventListener("input", () => {
  horizontalAlignment = horizontalAlignmentSelect.value;
  console.log({ horizontalAlignment });
  drawShape(["horizontalAlignment"]);
});

const verticalAlignmentContainer = document.getElementById("verticalAlignment");
const verticalAlignmentSelect =
  verticalAlignmentContainer.querySelector("select");
const verticalAlignmentOptgroup =
  verticalAlignmentSelect.querySelector("optgroup");

BS.DisplayAlignments.forEach((verticalAlignment) => {
  verticalAlignmentOptgroup.appendChild(new Option(verticalAlignment));
});
verticalAlignmentSelect.value = "center";
let verticalAlignment = verticalAlignmentSelect.value;
console.log({ verticalAlignment });

verticalAlignmentSelect.addEventListener("input", () => {
  verticalAlignment = verticalAlignmentSelect.value;
  console.log({ verticalAlignment });
  drawShape(["verticalAlignment"]);
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
  "drawSegmentStartRadius",
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
  "drawSegmentEndRadius",
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
  "drawRotationCropTop",
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
  "drawRotationCropRight",
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
  "drawRotationCropBottom",
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
  "drawRotationCropLeft",
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

const drawBitmapScaleXContainer = document.getElementById("drawBitmapScaleX");
const drawBitmapScaleXInput = drawBitmapScaleXContainer.querySelector("input");
const drawBitmapScaleXSpan = drawBitmapScaleXContainer.querySelector("span");
let drawBitmapScaleX = Number(drawBitmapScaleXInput.value);

drawBitmapScaleXInput.addEventListener("input", () => {
  drawBitmapScaleX = Number(drawBitmapScaleXInput.value);
  //console.log({ drawBitmapScaleX });
  drawBitmapScaleXSpan.innerText = drawBitmapScaleX;
  drawShape(["bitmapScaleX"]);
});

const drawBitmapScaleYContainer = document.getElementById("drawBitmapScaleY");
const drawBitmapScaleYInput = drawBitmapScaleYContainer.querySelector("input");
const drawBitmapScaleYSpan = drawBitmapScaleYContainer.querySelector("span");
let drawBitmapScaleY = Number(drawBitmapScaleYInput.value);

drawBitmapScaleYInput.addEventListener("input", () => {
  drawBitmapScaleY = Number(drawBitmapScaleYInput.value);
  //console.log({ drawBitmapScaleY });
  drawBitmapScaleYSpan.innerText = drawBitmapScaleY;
  drawShape(["bitmapScaleY"]);
});

const drawBitmapScaleContainer = document.getElementById("drawBitmapScale");
const drawBitmapScaleInput = drawBitmapScaleContainer.querySelector("input");
const drawBitmapScaleSpan = drawBitmapScaleContainer.querySelector("span");
let drawBitmapScale = Number(drawBitmapScaleInput.value);

drawBitmapScaleInput.addEventListener("input", () => {
  drawBitmapScale = Number(drawBitmapScaleInput.value);
  //console.log({ drawBitmapScale });

  drawBitmapScaleXSpan.innerText = drawBitmapScale;
  drawBitmapScaleXInput.value = drawBitmapScale;

  drawBitmapScaleYSpan.innerText = drawBitmapScale;
  drawBitmapScaleYInput.value = drawBitmapScale;

  drawBitmapScaleSpan.innerText = drawBitmapScale;
  drawShape(["bitmapScale"]);
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

const drawStartAngleContainer = document.getElementById("drawStartAngle");
const drawStartAngleInput = drawStartAngleContainer.querySelector("input");
const drawStartAngleSpan = drawStartAngleContainer.querySelector("span");
let drawStartAngle = Number(drawStartAngleInput.value);

drawStartAngleInput.addEventListener("input", () => {
  drawStartAngle = Number(drawStartAngleInput.value);
  //console.log({ drawStartAngle });
  drawStartAngleSpan.innerText = drawStartAngle;
  drawShape();
});

const drawAngleOffsetContainer = document.getElementById("drawAngleOffset");
const drawAngleOffsetInput = drawAngleOffsetContainer.querySelector("input");
const drawAngleOffsetSpan = drawAngleOffsetContainer.querySelector("span");
let drawAngleOffset = Number(drawAngleOffsetInput.value);

drawAngleOffsetInput.addEventListener("input", () => {
  drawAngleOffset = Number(drawAngleOffsetInput.value);
  //console.log({ drawAngleOffset });
  drawAngleOffsetSpan.innerText = drawAngleOffset;
  drawShape();
});

/** @type {HTMLButtonElement} */
const drawShapeButton = document.getElementById("drawShape");
drawShapeButton.addEventListener("click", () => {
  drawShape();
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "isConnected",
    () => {
      const enabled =
        currentDevice.isConnected && currentDevice.isDisplayAvailable;
      drawShapeButton.disabled = !enabled;
    },
    { immediate: true },
  );
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

onCurrentDevice(() => {
  currentDevice.addEventListener(
    "connected",
    () => {
      if (!currentDevice.isDisplayAvailable) {
        return;
      }
      drawXInput.max = currentDevice.displayInformation.width + 50;
      drawYInput.max = currentDevice.displayInformation.height + 50;

      drawWidthInput.max = currentDevice.displayInformation.width;
      drawHeightInput.max = currentDevice.displayInformation.height;

      drawRadiusInput.max = Math.min(
        currentDevice.displayInformation.height / 2,
        currentDevice.displayInformation.width / 2,
      );
    },
    { immediate: true },
  );
});

// BITMAP
const bitmapWidthContainer = document.getElementById("bitmapWidth");
const bitmapWidthInput = bitmapWidthContainer.querySelector("input");
const bitmapWidthSpan = bitmapWidthContainer.querySelector("span");
let bitmapWidth = Number(bitmapWidthInput.value);

bitmapWidthInput.addEventListener("input", () => {
  bitmapWidth = Number(bitmapWidthInput.value);
  console.log({ bitmapWidth });
  bitmapWidthSpan.innerText = bitmapWidth;
  onBitmapCanvasSizeUpdate();
});

const bitmapHeightContainer = document.getElementById("bitmapHeight");
const bitmapHeightInput = bitmapHeightContainer.querySelector("input");
const bitmapHeightSpan = bitmapHeightContainer.querySelector("span");
let bitmapHeight = Number(bitmapHeightInput.value);

bitmapHeightInput.addEventListener("input", () => {
  bitmapHeight = Number(bitmapHeightInput.value);
  console.log({ bitmapHeight });
  bitmapHeightSpan.innerText = bitmapHeight;
  onBitmapCanvasSizeUpdate();
});

let bitmapPixels = [];
const bitmapContainer = document.getElementById("bitmap");
const bitmapCanvas = bitmapContainer.querySelector("canvas");
const bitmapContext = bitmapCanvas.getContext("2d");
const bitmapCanvasHeight = 200;
let bitmapPixelLength = bitmapCanvasHeight / bitmapHeight;
let bitmapAspectRatio = bitmapWidth / bitmapHeight;
let bitmapCanvasWidth = bitmapCanvasHeight * bitmapAspectRatio;
const onBitmapCanvasSizeUpdate = () => {
  bitmapAspectRatio = bitmapWidth / bitmapHeight;
  bitmapCanvasWidth = bitmapCanvasHeight * bitmapAspectRatio;
  bitmapCanvas.style.width = `${bitmapCanvasWidth}px`;

  bitmapPixels = new Array(bitmapWidth * bitmapHeight).fill(0);

  bitmapPixelLength = bitmapCanvasHeight / bitmapHeight;

  bitmapCanvas.width = bitmapPixelLength * bitmapWidth;
  bitmapCanvas.height = bitmapPixelLength * bitmapHeight;

  bitmapImage.width = bitmapCanvas.width;
  bitmapImage.height = bitmapCanvas.height;
  bitmapImage.style.width = `${bitmapCanvas.width}px`;
  quantizedBitmapImage.style.width = `${bitmapCanvas.width}px`;

  updateBitmapCanvas();
};
const updateBitmapCanvas = () => {
  if (!currentDevice) {
    return;
  }
  if (drawShapeType != "bitmap") {
    return;
  }
  bitmapContext.clearRect(0, 0, bitmapCanvasWidth, bitmapCanvasHeight);
  bitmapContext.fillStyle = currentDevice.displayBitmapColors[0];
  bitmapContext.fillRect(0, 0, bitmapCanvasWidth, bitmapCanvasHeight);

  bitmapPixels.forEach((pixel, pixelIndex) => {
    const pixelX = pixelIndex % bitmapWidth;
    const pixelY = Math.floor(pixelIndex / bitmapWidth);
    const x = pixelX * bitmapPixelLength;
    const y = pixelY * bitmapPixelLength;
    bitmapContext.fillStyle = currentDevice.displayBitmapColors[pixel];
    bitmapContext.fillRect(x, y, bitmapPixelLength, bitmapPixelLength);
  });

  bitmapContext.lineWidth = 1.5;
  bitmapContext.strokeStyle = "white";
  for (let row = 1; row < bitmapHeight; row++) {
    bitmapContext.beginPath();
    const y = row * bitmapPixelLength;
    bitmapContext.moveTo(0, y);
    bitmapContext.lineTo(bitmapCanvasWidth, y);
    bitmapContext.stroke();
  }
  for (let col = 1; col < bitmapWidth; col++) {
    bitmapContext.beginPath();
    const x = col * bitmapPixelLength;
    bitmapContext.moveTo(x, 0);
    bitmapContext.lineTo(x, bitmapCanvasHeight);
    bitmapContext.stroke();
  }

  drawShape();
};
let isMouseDown = false;
window.addEventListener("mousedown", () => {
  isMouseDown = true;
});
window.addEventListener("mouseup", () => {
  isMouseDown = false;
});
bitmapCanvas.addEventListener("mousedown", (event) => {
  const { offsetX, offsetY } = event;
  setBitmapPixel(offsetX, offsetY);
});
bitmapCanvas.addEventListener("mousemove", (event) => {
  if (!isMouseDown) {
    return;
  }
  const { offsetX, offsetY } = event;
  setBitmapPixel(offsetX, offsetY);
});
/**
 * @param {number} offsetX
 * @param {number} offsetY
 */
const setBitmapPixel = (offsetX, offsetY) => {
  console.log({ offsetX, offsetY, bitmapCanvasWidth, bitmapCanvasHeight });
  let x = offsetX / bitmapCanvasWidth;
  let y = offsetY / bitmapCanvasHeight;
  if (x >= 1 || y >= 1) {
    return;
  }
  // console.log({ x, y });
  const pixelX = Math.floor(x * bitmapWidth);
  const pixelY = Math.floor(y * bitmapHeight);
  // console.log({ pixelX, pixelY });

  const pixelIndex = bitmapWidth * pixelY + pixelX;
  // console.log({ pixelIndex });

  bitmapPixels[pixelIndex] = currentBitmapColorIndex;
  updateBitmapCanvas();
};

const bitmapNumberOfColorsContainer = document.getElementById(
  "bitmapNumberOfColors",
);
const bitmapNumberOfColorsInput =
  bitmapNumberOfColorsContainer.querySelector("input");
const bitmapNumberOfColorsSpan =
  bitmapNumberOfColorsContainer.querySelector("span");
let bitmapNumberOfColors = Number(bitmapNumberOfColorsInput.value);

bitmapNumberOfColorsInput.addEventListener("input", () => {
  bitmapNumberOfColors = Number(bitmapNumberOfColorsInput.value);
  bitmapPixels.fill(0);
  console.log({ bitmapNumberOfColors });
  bitmapNumberOfColorsSpan.innerText = bitmapNumberOfColors;
  updateBitmapColorIndicesContainer();
  updateCurrentBitmapColorIndex();
  updateCurrentBitmapColor();
  updateBitmapCanvas();
});

const bitmapColorIndicesContainer =
  document.getElementById("bitmapColorIndices");
/** @type {HTMLTemplateElement} */
const bitmapColorIndexTemplate = document.getElementById(
  "bitmapColorIndexTemplate",
);
const updateBitmapColorIndicesContainer = () => {
  bitmapColorIndicesContainer.innerHTML = "";
  if (!currentDevice.isConnected) {
    return;
  }
  if (!currentDevice.isDisplayAvailable) {
    return;
  }
  for (
    let bitmapColorIndex = 0;
    bitmapColorIndex < bitmapNumberOfColors;
    bitmapColorIndex++
  ) {
    /** @type {HTMLElement} */
    const bitmapColorIndexContainer = bitmapColorIndexTemplate.content
      .cloneNode(true)
      .querySelector(".bitmapColorIndex");

    const bitmapColorIndexSpan =
      bitmapColorIndexContainer.querySelector(".colorIndex");
    bitmapColorIndexSpan.innerText = `#${bitmapColorIndex}`;
    const bitmapColorIndexSelect =
      bitmapColorIndexContainer.querySelector("select");
    const bitmapColorIndexOptgroup =
      bitmapColorIndexSelect.querySelector("optgroup");
    const numberOfDisplayColors = currentDevice.isConnected
      ? currentDevice.numberOfDisplayColors
      : 0;
    for (let colorIndex = 0; colorIndex < numberOfDisplayColors; colorIndex++) {
      bitmapColorIndexOptgroup.appendChild(new Option(colorIndex));
    }

    const bitmapColorIndexColorInput =
      bitmapColorIndexContainer.querySelector("input");
    bitmapColorIndexColorInput.value =
      currentDevice.displayBitmapColors[bitmapColorIndex];

    bitmapColorIndexSelect.value =
      currentDevice.displayBitmapColorIndices[bitmapColorIndex];
    bitmapColorIndexSelect.addEventListener("input", () => {
      const colorIndex = Number(bitmapColorIndexSelect.value);
      if (currentDevice.isConnected) {
        currentDevice.selectDisplayBitmapColor(
          bitmapColorIndex,
          colorIndex,
          true,
        );
      }
      bitmapColorIndexColorInput.value =
        currentDevice.displayColors[colorIndex];

      if (currentBitmapColorIndex == bitmapColorIndex) {
        updateCurrentBitmapColor();
      }
      console.log(
        "bitmapColorIndices",
        currentDevice.displayContextState.bitmapColorIndices,
      );
      updateBitmapCanvas();
    });

    bitmapColorIndicesContainer.appendChild(bitmapColorIndexContainer);
  }
};
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "isConnected",
    () => {
      updateBitmapColorIndicesContainer();
    },
    { immediate: true },
  );
});

const currentBitmapColorIndexContainer = document.getElementById(
  "currentBitmapColorIndex",
);
let currentBitmapColorIndex = 0;
const currentBitmapColorIndexSelect =
  currentBitmapColorIndexContainer.querySelector("select");
const currentBitmapColorIndexOptgroup =
  currentBitmapColorIndexContainer.querySelector("optgroup");
const currentBitmapColorIndexColorInput =
  currentBitmapColorIndexContainer.querySelector("input");
const updateCurrentBitmapColorIndex = () => {
  currentBitmapColorIndex = 0;
  currentBitmapColorIndexOptgroup.innerHTML = "";
  for (
    let bitmapColorIndex = 0;
    bitmapColorIndex < bitmapNumberOfColors;
    bitmapColorIndex++
  ) {
    currentBitmapColorIndexOptgroup.appendChild(new Option(bitmapColorIndex));
  }
};
updateCurrentBitmapColorIndex();

currentBitmapColorIndexSelect.addEventListener("input", () => {
  currentBitmapColorIndex = Number(currentBitmapColorIndexSelect.value);
  console.log({ currentBitmapColorIndex });
  updateCurrentBitmapColor();
});
const updateCurrentBitmapColor = () => {
  currentBitmapColorIndexColorInput.value =
    bitmapColorIndicesContainer.querySelectorAll(".bitmapColorIndex input")[
      currentBitmapColorIndex
    ].value;
};

const clearBitmapButton = document.getElementById("clearBitmap");
clearBitmapButton.addEventListener("click", () => {
  bitmapPixels.fill(0);
  updateBitmapCanvas();
});

/** @type {HTMLInputElement} */
const bitmapImageInput = document.getElementById("bitmapImageInput");
bitmapImageInput.addEventListener("input", () => {
  quantizeBitmapImage();
});
/** @type {HTMLButtonElement} */
const quantizeBitmapImageButton = document.getElementById(
  "quantizeBitmapImage",
);
quantizeBitmapImageButton.addEventListener("click", () => {
  quantizeBitmapImage();
});
const quantizeBitmapImage = () => {
  const file = bitmapImageInput.files[0];
  if (!file) {
    return;
  }
  console.log("bitmapImage", file);
  const reader = new FileReader();
  reader.onload = function (e) {
    bitmapImage.style.display = "";
    bitmapImage.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

/** @type {HTMLImageElement} */
const bitmapImage = bitmapContainer.querySelectorAll("img")[0];
/** @type {HTMLImageElement} */
const quantizedBitmapImage = bitmapContainer.querySelectorAll("img")[1];
bitmapImage.addEventListener("load", async () => {
  if (quantizeOverrideDisplayColors) {
    const { blob, colorIndices, colors } =
      await currentDevice.quantizeDisplayImage(
        bitmapImage,
        bitmapWidth,
        bitmapHeight,
        bitmapNumberOfColors,
      );

    quantizedBitmapImage.width = bitmapWidth;
    quantizedBitmapImage.height = bitmapHeight;

    quantizedBitmapImage.src = URL.createObjectURL(blob);
    quantizedBitmapImage.style.display = "";

    colors.forEach((color, colorIndex) => {
      currentDevice.setDisplayColor(colorIndex, color);
      currentDevice.selectDisplayBitmapColor(colorIndex, colorIndex);
    });
    currentDevice.flushDisplayContextCommands();
  } else {
    const { blob, bitmap } = await currentDevice.imageToDisplayBitmap(
      bitmapImage,
      bitmapWidth,
      bitmapHeight,
      bitmapNumberOfColors,
    );

    quantizedBitmapImage.width = bitmapWidth;
    quantizedBitmapImage.height = bitmapHeight;

    quantizedBitmapImage.src = URL.createObjectURL(blob);
    quantizedBitmapImage.style.display = "";

    bitmapPixels = bitmap.pixels;
    updateBitmapCanvas();
  }
});
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "displayContextState",
    (event) => {
      const { differences } = event.message;
      if (differences.includes("bitmapColorIndices")) {
        const bitmapColorIndexContainers = Array.from(
          bitmapColorIndicesContainer.querySelectorAll(".bitmapColorIndex"),
        );

        currentDevice.displayBitmapColorIndices.forEach(
          (colorIndex, bitmapColorIndex) => {
            if (bitmapColorIndex >= bitmapNumberOfColors) {
              return;
            }
            const bitmapColorIndexContainer =
              bitmapColorIndexContainers[bitmapColorIndex];
            bitmapColorIndexContainer.querySelector("input").value =
              currentDevice.displayColors[colorIndex];
            bitmapColorIndexContainer.querySelector("select").value =
              colorIndex;
          },
        );
      }
    },
    { immediate: true },
  );
});

const toggleQuantizeOverrideDisplayColorsCheckbox = document.getElementById(
  "toggleQuantizeOverrideDisplayColors",
);
let quantizeOverrideDisplayColors =
  toggleQuantizeOverrideDisplayColorsCheckbox.checked;
toggleQuantizeOverrideDisplayColorsCheckbox.addEventListener("input", () => {
  quantizeOverrideDisplayColors =
    toggleQuantizeOverrideDisplayColorsCheckbox.checked;
});
onBitmapCanvasSizeUpdate();

// LEDS
const setLedsContainer = document.getElementById("setLeds");

/** @type {Record<BS.LedType, HTMLTemplateElement>} */
const setLedTemplates = {
  analogSingle: document.getElementById("analogSingleLedTemplate"),
  digitalSingle: document.getElementById("digitalSingleLedTemplate"),
  digitalRGB: document.getElementById("digitalRGBLedTemplate"),
  analogRGB: document.getElementById("analogRGBLedTemplate"),
};

let ledInterval = 20;
/** @type {{range?: HTMLInputElement, colorInput?: HTMLInputElement, checkbox?: HTMLInputElement}[]} */
const setLedContainers = [];
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "getLedInformation",
    (event) => {
      setLedsContainer.innerHTML = "";
      currentDevice.leds.forEach((led, index) => {
        const template = setLedTemplates[led.type];
        const setLedContainer = template.content
          .cloneNode(true)
          .querySelector(".setLed");
        /** @type {HTMLInputElement} */
        const range = setLedContainer.querySelector(`input[type="range"]`);
        let onRangeInput = () => {
          if (!range.isChanging) {
            console.log("not changing - ignoring");
            return;
          }
          console.log("setting led", { index, brightness: +range.value });
          currentDevice.setLed({ index, brightness: +range.value });
        };
        onRangeInput = BS.ThrottleUtils.throttle(
          onRangeInput,
          ledInterval,
          true,
        );
        range?.addEventListener("input", () => onRangeInput());
        /** @type {HTMLInputElement} */
        const colorInput = setLedContainer.querySelector(`input[type="color"]`);
        let onColorInput = () => {
          if (!colorInput.isChanging) {
            console.log("not changing - ignoring");
            return;
          }
          console.log("setting led", { index, color: colorInput.value });
          currentDevice.setLed({ index, color: colorInput.value });
        };
        onColorInput = BS.ThrottleUtils.throttle(
          onColorInput,
          ledInterval,
          true,
        );
        colorInput?.addEventListener("input", (event) => onColorInput());
        if (colorInput?.disabled) {
          colorInput.value = BS.rgbToHex(led.maxColor);
        }
        /** @type {HTMLInputElement} */
        const checkbox = setLedContainer.querySelector(
          `input[type="checkbox"]`,
        );
        let onCheckboxInput = () => {
          if (!checkbox.isChanging) {
            console.log("not changing - ignoring");
            return;
          }
          console.log("setting led", {
            index,
            brightness: checkbox.checked ? 255 : 0,
          });
          currentDevice.setLed({
            index,
            brightness: checkbox.checked ? 255 : 0,
          });
        };
        onCheckboxInput = BS.ThrottleUtils.throttle(
          onCheckboxInput,
          ledInterval,
          true,
        );
        checkbox?.addEventListener("input", (event) => onCheckboxInput());

        [range, colorInput, checkbox].forEach((input) => {
          input?.addEventListener("focusin", () => {
            console.log("focusin", input);
            input.isChanging = true;
          });
          input?.addEventListener("focusout", () => {
            console.log("focusout", input);
            input.isChanging = false;
          });
          input?.addEventListener("mousedown", (event) => {
            console.log("mousedown", input);
            input.isChanging = true;
          });
          input?.addEventListener("change", (event) => {
            console.log("change", input);
            input.isChanging = false;
          });
        });

        setLedContainers[index] = { range, colorInput, checkbox };

        setLedsContainer.appendChild(setLedContainer);
      });
    },
    { immediate: true },
  );
});

onCurrentDevice(() => {
  currentDevice.addEventListener("setLed", (event) => {
    const { led, ledIndex } = event.message;
    const { range, checkbox, colorInput } = setLedContainers[ledIndex];

    [range, checkbox, colorInput].forEach((input) => {
      if (colorInput && !colorInput.disabled && !colorInput.isChanging) {
        colorInput.value = BS.rgbToHex(led.color);
      }
      if (checkbox && !checkbox.isChanging) {
        checkbox.checked = BS.projectColor(led.color, led.maxColor) > 0;
      }
      if (range && !range.isChanging) {
        range.value = BS.projectColor(led.color, led.maxColor) * 255;
      }
    });
  });
});

// CONTAINERS
const displayContainer = document.getElementById("display");
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "connected",
    () => {
      if (!currentDevice.isDisplayAvailable) {
        displayContainer.setAttribute("hidden", "");
      } else {
        displayContainer.removeAttribute("hidden");
      }
    },
    { immediate: true },
  );
});
const cameraContainer = document.getElementById("camera");
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "connected",
    () => {
      if (!currentDevice.hasCamera) {
        cameraContainer.setAttribute("hidden", "");
      } else {
        cameraContainer.removeAttribute("hidden");
      }
    },
    { immediate: true },
  );
});
const microphoneContainer = document.getElementById("microphone");
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "connected",
    () => {
      if (!currentDevice.hasMicrophone) {
        microphoneContainer.setAttribute("hidden", "");
      } else {
        microphoneContainer.removeAttribute("hidden");
      }
    },
    { immediate: true },
  );
});
const firmwareContainer = document.getElementById("firmware");
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "connected",
    () => {
      if (currentDevice.canUpdateFirmware) {
        firmwareContainer.removeAttribute("hidden");
      } else {
        firmwareContainer.setAttribute("hidden", "");
      }
    },
    { immediate: true },
  );
});
const wifiContainer = document.getElementById("wifi");
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "connected",
    () => {
      if (currentDevice.isWifiAvailable) {
        wifiContainer.removeAttribute("hidden");
      } else {
        wifiContainer.setAttribute("hidden", "");
      }
    },
    { immediate: true },
  );
});
const tfliteContainer = document.getElementById("tflite");
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "connected",
    () => {
      if (currentDevice.isTfliteAvailable) {
        tfliteContainer.removeAttribute("hidden");
      } else {
        tfliteContainer.setAttribute("hidden", "");
      }
    },
    { immediate: true },
  );
});
const vibrationContainer = document.getElementById("vibration");
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "connected",
    () => {
      if (currentDevice.hasVibration) {
        vibrationContainer.removeAttribute("hidden");
      } else {
        vibrationContainer.setAttribute("hidden", "");
      }
    },
    { immediate: true },
  );
});

const ledsContainer = document.getElementById("leds");
onCurrentDevice(() => {
  currentDevice.addEventListener(
    "connected",
    () => {
      if (currentDevice.hasLeds) {
        ledsContainer.removeAttribute("hidden");
      } else {
        ledsContainer.setAttribute("hidden", "");
      }
    },
    { immediate: true },
  );
});
