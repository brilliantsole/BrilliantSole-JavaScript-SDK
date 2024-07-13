import * as BS from "../../build/brilliantsole.module.js";
window.BS = BS;
console.log({ BS });
//BS.setAllConsoleLevelFlags({ log: true });

const client = new BS.WebSocketClient();
console.log({ client });

window.client = client;

/** @typedef {import("../../build/brilliantsole.module.js").Device} Device */

// SEARCH PARAMS

const url = new URL(location);
function setUrlParam(key, value) {
  if (history.pushState) {
    let searchParams = new URLSearchParams(window.location.search);
    if (value) {
      searchParams.set(key, value);
    } else {
      searchParams.delete(key);
    }
    let newUrl =
      window.location.protocol + "//" + window.location.host + window.location.pathname + "?" + searchParams.toString();
    window.history.pushState({ path: newUrl }, "", newUrl);
  }
}
client.addEventListener("isConnected", () => {
  if (client.isConnected) {
    setUrlParam("webSocketUrl", client.webSocket.url);
    webSocketUrlInput.value = client.webSocket.url;
  } else {
    setUrlParam("webSocketUrl");
  }
});

// CONNECTION

/** @type {HTMLInputElement} */
const webSocketUrlInput = document.getElementById("webSocketUrl");
webSocketUrlInput.value = url.searchParams.get("webSocketUrl") || "";
client.addEventListener("isConnected", () => {
  webSocketUrlInput.disabled = client.isConnected;
});

/** @type {HTMLButtonElement} */
const toggleConnectionButton = document.getElementById("toggleConnection");
toggleConnectionButton.addEventListener("click", () => {
  if (client.isConnected) {
    client.disconnect();
  } else {
    /** @type {string?} */
    let webSocketUrl;
    if (webSocketUrlInput.value.length > 0) {
      webSocketUrl = webSocketUrlInput.value;
    }
    client.connect(webSocketUrl);
  }
});
client.addEventListener("connectionStatus", () => {
  switch (client.connectionStatus) {
    case "connected":
    case "not connected":
      toggleConnectionButton.disabled = false;
      toggleConnectionButton.innerText = client.isConnected ? "disconnect" : "connect";
      break;
    case "connecting":
    case "disconnecting":
      toggleConnectionButton.innerText = client.connectionStatus;
      toggleConnectionButton.disabled = true;
      break;
  }
});

// SCANNER

/** @type {HTMLInputElement} */
const isScanningAvailableCheckbox = document.getElementById("isScanningAvailable");
client.addEventListener("isScanningAvailable", () => {
  isScanningAvailableCheckbox.checked = client.isScanningAvailable;
});

/** @type {HTMLButtonElement} */
const toggleScanButton = document.getElementById("toggleScan");
toggleScanButton.addEventListener("click", () => {
  client.toggleScan();
});
client.addEventListener("isScanningAvailable", () => {
  toggleScanButton.disabled = !client.isScanningAvailable;
});
client.addEventListener("isScanning", () => {
  toggleScanButton.innerText = client.isScanning ? "stop scanning" : "scan";
});

// DISCOVERED DEVICES

/** @typedef {import("../../build/brilliantsole.module.js").DiscoveredDevice} DiscoveredDevice */

/** @type {HTMLTemplateElement} */
const discoveredDeviceTemplate = document.getElementById("discoveredDeviceTemplate");
const discoveredDevicesContainer = document.getElementById("discoveredDevices");
/** @type {Object.<string, HTMLElement>} */
let discoveredDeviceContainers = {};

client.addEventListener("discoveredDevice", (event) => {
  /** @type {DiscoveredDevice} */
  const discoveredDevice = event.message.discoveredDevice;

  let discoveredDeviceContainer = discoveredDeviceContainers[discoveredDevice.bluetoothId];
  if (!discoveredDeviceContainer) {
    discoveredDeviceContainer = discoveredDeviceTemplate.content.cloneNode(true).querySelector(".discoveredDevice");

    /** @type {HTMLButtonElement} */
    const toggleConnectionButton = discoveredDeviceContainer.querySelector(".toggleConnection");
    toggleConnectionButton.addEventListener("click", () => {
      let device = client.devices[discoveredDevice.bluetoothId];
      if (device) {
        device.toggleConnection();
      } else {
        console.log("FUCK", discoveredDevice);
        device = client.connectToDevice(discoveredDevice.bluetoothId);
        onDevice(device);
      }
    });

    /** @param {Device} device */
    const onDevice = (device) => {
      device.addEventListener("connectionStatus", () => {
        updateToggleConnectionButton(device);
      });
      updateToggleConnectionButton(device);
    };

    discoveredDeviceContainer._onDevice = onDevice;

    /** @param {Device} device */
    const updateToggleConnectionButton = (device) => {
      console.log({ deviceConnectionStatus: device.connectionStatus });
      switch (device.connectionStatus) {
        case "connected":
        case "not connected":
          toggleConnectionButton.innerText = device.isConnected ? "disconnect" : "connect";
          toggleConnectionButton.disabled = false;
          break;
        case "connecting":
        case "disconnecting":
          toggleConnectionButton.innerText = device.connectionStatus;
          toggleConnectionButton.disabled = true;
          break;
      }
    };

    discoveredDeviceContainers[discoveredDevice.bluetoothId] = discoveredDeviceContainer;
    discoveredDevicesContainer.appendChild(discoveredDeviceContainer);
  }

  updateDiscoveredDeviceContainer(discoveredDevice);
});

/** @param {DiscoveredDevice} discoveredDevice */
function updateDiscoveredDeviceContainer(discoveredDevice) {
  const discoveredDeviceContainer = discoveredDeviceContainers[discoveredDevice.bluetoothId];
  if (!discoveredDeviceContainer) {
    console.warn(`no discoveredDeviceContainer for device id ${discoveredDevice.bluetoothId}`);
    return;
  }
  discoveredDeviceContainer.querySelector(".name").innerText = discoveredDevice.name;
  discoveredDeviceContainer.querySelector(".rssi").innerText = discoveredDevice.rssi;
  discoveredDeviceContainer.querySelector(".deviceType").innerText = discoveredDevice.deviceType;
}

/** @param {DiscoveredDevice} discoveredDevice */
function removeDiscoveredDeviceContainer(discoveredDevice) {
  const discoveredDeviceContainer = discoveredDeviceContainers[discoveredDevice.bluetoothId];
  if (!discoveredDeviceContainer) {
    console.warn(`no discoveredDeviceContainer for device id ${discoveredDevice.bluetoothId}`);
    return;
  }

  discoveredDeviceContainer.remove();
  delete discoveredDeviceContainers[discoveredDevice.bluetoothId];
}

client.addEventListener("expiredDiscoveredDevice", (event) => {
  /** @type {DiscoveredDevice} */
  const discoveredDevice = event.message.discoveredDevice;
  removeDiscoveredDeviceContainer(discoveredDevice);
});

function clearDiscoveredDevices() {
  discoveredDevicesContainer.innerHTML = "";
  discoveredDeviceContainers = {};
}

client.addEventListener("not connected", () => {
  clearDiscoveredDevices();
});

client.addEventListener("isScanning", () => {
  if (client.isScanning) {
    clearDiscoveredDevices();
  }
});

BS.Device.AddEventListener("deviceIsConnected", (event) => {
  /** @type {Device} */
  const device = event.message.device;
  console.log("deviceIsConnected", device);
  const discoveredDeviceContainer = discoveredDeviceContainers[device.bluetoothId];
  if (!discoveredDeviceContainer) {
    return;
  }
  discoveredDeviceContainer._onDevice(device);
});

// AVAILABLE DEVICES

/** @type {HTMLTemplateElement} */
const availableDeviceTemplate = document.getElementById("availableDeviceTemplate");
const availableDevicesContainer = document.getElementById("availableDevices");
/** @type {Object.<string, HTMLElement>} */
let availableDeviceContainers = {};

BS.Device.AddEventListener("availableDevices", (event) => {
  /** @type {Device[]} */
  const availableDevices = event.message.availableDevices;
  console.log({ availableDevices });

  availableDevices.forEach((device) => {
    if (device.connectionType != "webSocketClient" || !device.bluetoothId) {
      return;
    }
    let availableDeviceContainer = availableDeviceContainers[device.bluetoothId];
    if (!availableDeviceContainer) {
      availableDeviceContainer = availableDeviceTemplate.content.cloneNode(true).querySelector(".availableDevice");
      availableDeviceContainers[device.bluetoothId] = availableDeviceContainer;

      /** @type {HTMLPreElement} */
      const deviceInformationPre = availableDeviceContainer.querySelector(".deviceInformation");
      const setDeviceInformationPre = () =>
        (deviceInformationPre.textContent = JSON.stringify(device.deviceInformation, null, 2));
      setDeviceInformationPre();
      device.addEventListener("deviceInformation", () => setDeviceInformationPre());

      /** @type {HTMLSpanElement} */
      const batteryLevelSpan = availableDeviceContainer.querySelector(".batteryLevel");
      const setBatteryLevelSpan = () => (batteryLevelSpan.innerText = device.batteryLevel);
      setBatteryLevelSpan();
      device.addEventListener("batteryLevel", () => setBatteryLevelSpan());

      /** @type {HTMLSpanElement} */
      const nameSpan = availableDeviceContainer.querySelector(".name");
      const setNameSpan = () => (nameSpan.innerText = device.name);
      setNameSpan();
      device.addEventListener("getName", () => setNameSpan());

      /** @type {HTMLInputElement} */
      const setNameInput = availableDeviceContainer.querySelector(".setNameInput");
      setNameInput.minLength = BS.MinNameLength;
      setNameInput.maxLength = BS.MaxNameLength;
      setNameInput.disabled = !device.isConnected;

      /** @type {HTMLButtonElement} */
      const setNameButton = availableDeviceContainer.querySelector(".setNameButton");
      setNameButton.disabled = !device.isConnected;

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

      /** @type {HTMLSpanElement} */
      const deviceTypeSpan = availableDeviceContainer.querySelector(".deviceType");
      const setDeviceTypeSpan = () => (deviceTypeSpan.innerText = device.type);
      setDeviceTypeSpan();
      device.addEventListener("getType", () => setDeviceTypeSpan());

      /** @type {HTMLButtonElement} */
      const setTypeButton = availableDeviceContainer.querySelector(".setTypeButton");

      /** @type {HTMLSelectElement} */
      const setTypeSelect = availableDeviceContainer.querySelector(".setTypeSelect");
      /** @type {HTMLOptGroupElement} */
      const setTypeSelectOptgroup = setTypeSelect.querySelector("optgroup");
      BS.DeviceTypes.forEach((type) => {
        setTypeSelectOptgroup.appendChild(new Option(type));
      });

      device.addEventListener("isConnected", () => {
        setTypeSelect.disabled = !device.isConnected;
      });
      setTypeSelect.disabled = !device.isConnected;

      device.addEventListener("getType", () => {
        setTypeSelect.value = device.type;
      });

      setTypeSelect.addEventListener("input", () => {
        setTypeButton.disabled = setTypeSelect.value == device.type;
      });
      setTypeSelect.value = device.type;

      setTypeButton.addEventListener("click", () => {
        device.setType(setTypeSelect.value);
        setTypeButton.disabled = true;
      });

      /** @type {HTMLPreElement} */
      const sensorConfigurationPre = availableDeviceContainer.querySelector(".sensorConfiguration");
      const setSensorConfigurationPre = () =>
        (sensorConfigurationPre.textContent = JSON.stringify(device.sensorConfiguration, null, 2));
      setSensorConfigurationPre();
      device.addEventListener("getSensorConfiguration", () => setSensorConfigurationPre());

      /** @type {HTMLTemplateElement} */
      const sensorTypeConfigurationTemplate = availableDeviceContainer.querySelector(
        ".sensorTypeConfigurationTemplate"
      );
      device.sensorTypes.forEach((sensorType) => {
        const sensorTypeConfigurationContainer = sensorTypeConfigurationTemplate.content
          .cloneNode(true)
          .querySelector(".sensorTypeConfiguration");
        sensorTypeConfigurationContainer.querySelector(".sensorType").innerText = sensorType;

        /** @type {HTMLInputElement} */
        const sensorRateInput = sensorTypeConfigurationContainer.querySelector(".sensorRate");
        sensorRateInput.value = 0;
        sensorRateInput.max = BS.MaxSensorRate;
        sensorRateInput.step = BS.SensorRateStep;
        sensorRateInput.addEventListener("input", () => {
          const sensorRate = Number(sensorRateInput.value);
          console.log({ sensorType, sensorRate });
          device.setSensorConfiguration({ [sensorType]: sensorRate });
        });
        sensorRateInput.disabled = !device.isConnected;

        sensorTypeConfigurationTemplate.parentElement.insertBefore(
          sensorTypeConfigurationContainer,
          sensorTypeConfigurationTemplate
        );
        sensorTypeConfigurationContainer.dataset.sensorType = sensorType;
      });

      device.addEventListener("isConnected", () => {
        availableDeviceContainer.querySelectorAll("input").forEach((input) => (input.disabled = !device.isConnected));
      });

      device.addEventListener("getSensorConfiguration", () => {
        for (const sensorType in device.sensorConfiguration) {
          availableDeviceContainer.querySelector(
            `.sensorTypeConfiguration[data-sensor-type="${sensorType}"] input`
          ).value = device.sensorConfiguration[sensorType];
        }
      });

      /** @type {HTMLPreElement} */
      const sensorDataPre = availableDeviceContainer.querySelector(".sensorData");
      const setSensorDataPre = (event) => (sensorDataPre.textContent = JSON.stringify(event.message, null, 2));
      device.addEventListener("sensorData", (event) => setSensorDataPre(event));

      /** @type {HTMLButtonElement} */
      const triggerVibrationButton = availableDeviceContainer.querySelector(".triggerVibration");
      triggerVibrationButton.addEventListener("click", () => {
        device.triggerVibration([
          {
            type: "waveformEffect",
            waveformEffect: { segments: [{ effect: "doubleClick100" }] },
          },
        ]);
      });
      device.addEventListener("isConnected", () => {
        triggerVibrationButton.disabled = !device.isConnected;
      });
      triggerVibrationButton.disabled = !device.isConnected;

      /** @type {HTMLButtonElement} */
      const toggleConnectionButton = availableDeviceContainer.querySelector(".toggleConnection");
      toggleConnectionButton.addEventListener("click", () => {
        device.toggleConnection();
      });
      const updateToggleConnectionButton = () => {
        switch (device.connectionStatus) {
          case "connected":
          case "not connected":
            toggleConnectionButton.disabled = false;
            toggleConnectionButton.innerText = device.isConnected ? "disconnect" : "connect";
            break;
          case "connecting":
          case "disconnecting":
            toggleConnectionButton.innerText = device.connectionStatus;
            toggleConnectionButton.disabled = true;
            break;
        }
      };
      updateToggleConnectionButton();
      device.addEventListener("connectionStatus", () => updateToggleConnectionButton());

      /** @type {File?} */
      let file;

      /** @type {HTMLInputElement} */
      const fileInput = availableDeviceContainer.querySelector(".file");
      fileInput.addEventListener("input", () => {
        if (fileInput.files[0].size > device.maxFileLength) {
          console.log("file size too large");
          return;
        }
        file = fileInput.files[0];
        console.log("file", file);
        updateToggleFileTransferButton();
      });

      const maxFileLengthSpan = availableDeviceContainer.querySelector(".maxFileLength");
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
      const fileTransferTypesSelect = availableDeviceContainer.querySelector(".fileTransferTypes");
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
      BS.FileTypes.forEach((fileType) => {
        fileTransferTypesOptgroup.appendChild(new Option(fileType));
      });
      fileTransferTypesSelect.dispatchEvent(new Event("input"));

      /** @type {HTMLProgressElement} */
      const fileTransferProgress = availableDeviceContainer.querySelector(".fileTransferProgress");
      console.log("fileTransferProgress", fileTransferProgress);

      device.addEventListener("fileTransferProgress", (event) => {
        const progress = event.message.progress;
        console.log("fileTransferProgress", progress, fileTransferProgress);
        fileTransferProgress.value = progress == 1 ? 0 : progress;
      });
      device.addEventListener("fileTransferStatus", () => {
        if (device.fileTransferStatus == "idle") {
          fileTransferProgress.value = 0;
        }
      });

      /** @type {HTMLButtonElement} */
      const toggleFileTransferButton = availableDeviceContainer.querySelector(".toggleFileTransfer");
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
      const fileTransferDirectionSelect = availableDeviceContainer.querySelector(".fileTransferDirection");
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
      const tfliteNameSpan = availableDeviceContainer.querySelector(".tfliteName");
      /** @type {HTMLInputElement} */
      const setTfliteNameInput = availableDeviceContainer.querySelector(".setTfliteNameInput");
      /** @type {HTMLButtonElement} */
      const setTfliteNameButton = availableDeviceContainer.querySelector(".setTfliteNameButton");

      device.addEventListener("getTfliteName", () => {
        tfliteNameSpan.innerText = device.tfliteName;

        setTfliteNameButton.innerText = "set name";
        setTfliteNameButton.disabled = !device.isConnected;

        setTfliteNameInput.value = "";
        setTfliteNameInput.disabled = !device.isConnected;
      });
      tfliteNameSpan.innerText = device.tfliteName;

      setTfliteNameButton.addEventListener("click", () => {
        device.setTfliteName(setTfliteNameInput.value);

        setTfliteNameInput.disabled = true;

        setTfliteNameButton.innerText = "setting name...";
        setTfliteNameButton.disabled = true;
      });

      /** @type {HTMLSpanElement} */
      const tfliteTaskSpan = availableDeviceContainer.querySelector(".tfliteTask");
      /** @type {HTMLSelectElement} */
      const setTfliteTaskSelect = availableDeviceContainer.querySelector(".setTfliteTaskSelect");
      /** @type {HTMLOptGroupElement} */
      const setTfliteTaskOptgroup = setTfliteTaskSelect.querySelector("optgroup");
      /** @type {HTMLButtonElement} */
      const setTfliteTaskButton = availableDeviceContainer.querySelector(".setTfliteTaskButton");

      BS.Device.TfliteTasks.forEach((task) => {
        setTfliteTaskOptgroup.appendChild(new Option(task));
      });

      device.addEventListener("getTfliteTask", () => {
        const task = device.tfliteTask;
        setTfliteTaskSelect.value = task;
        tfliteTaskSpan.innerText = task;
      });
      setTfliteTaskSelect.value = device.tfliteTask;
      tfliteTaskSpan.innerText = device.tfliteTask;

      setTfliteTaskButton.addEventListener("click", () => {
        device.setTfliteTask(setTfliteTaskSelect.value);
      });
      device.addEventListener("getTfliteInferencingEnabled", () => {
        setTfliteTaskButton.disabled = device.tfliteInferencingEnabled;
      });

      /** @type {HTMLSpanElement} */
      const tfliteSampleRateSpan = availableDeviceContainer.querySelector(".tfliteSampleRate");
      /** @type {HTMLInputElement} */
      const setTfliteSampleRateInput = availableDeviceContainer.querySelector(".setTfliteSampleRateInput");
      /** @type {HTMLButtonElement} */
      const setTfliteSampleRateButton = availableDeviceContainer.querySelector(".setTfliteSampleRateButton");

      device.addEventListener("getTfliteSampleRate", () => {
        tfliteSampleRateSpan.innerText = device.tfliteSampleRate;

        setTfliteSampleRateInput.value = "";
        setTfliteSampleRateInput.disabled = false;

        setTfliteSampleRateButton.disabled = false;
        setTfliteSampleRateButton.innerText = "set sample rate";
      });
      tfliteSampleRateSpan.innerText = device.tfliteSampleRate;

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

      const tfliteSensorTypesContainer = availableDeviceContainer.querySelector(".tfliteSensorTypes");
      /** @type {HTMLTemplateElement} */
      const tfliteSensorTypeTemplate = availableDeviceContainer.querySelector(".tfliteSensorTypeTemplate");
      /** @type {Object.<string, HTMLElement>} */
      const tfliteSensorTypeContainers = {};
      /** @type {SensorType[]} */
      let tfliteSensorTypes = [];
      /** @type {HTMLButtonElement} */
      const setTfliteSensorTypesButton = availableDeviceContainer.querySelector(".setTfliteSensorTypes");

      BS.TfliteSensorTypes.forEach((sensorType) => {
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
      setTfliteSensorTypesButton.disabled = false;

      /** @type {HTMLInputElement} */
      const setTfliteIsReadyInput = availableDeviceContainer.querySelector(".tfliteIsReady");
      device.addEventListener("tfliteIsReady", () => {
        setTfliteIsReadyInput.checked = device.tfliteIsReady;
      });
      setTfliteIsReadyInput.checked = device.tfliteIsReady;

      /** @type {HTMLSpanElement} */
      const tfliteThresholdSpan = availableDeviceContainer.querySelector(".tfliteThreshold");
      /** @type {HTMLInputElement} */
      const setTfliteThresholdInput = availableDeviceContainer.querySelector(".setTfliteThresholdInput");
      /** @type {HTMLButtonElement} */
      const setTfliteThresholdButton = availableDeviceContainer.querySelector(".setTfliteThresholdButton");

      device.addEventListener("getTfliteThreshold", () => {
        tfliteThresholdSpan.innerText = device.tfliteThreshold;

        setTfliteThresholdInput.value = "";
        setTfliteThresholdInput.disabled = false;

        setTfliteThresholdButton.disabled = false;
        setTfliteThresholdButton.innerText = "set threshold";
      });
      tfliteThresholdSpan.innerText = device.tfliteThreshold;

      setTfliteThresholdButton.addEventListener("click", () => {
        device.setTfliteThreshold(Number(setTfliteThresholdInput.value));

        setTfliteThresholdInput.disabled = true;

        setTfliteThresholdButton.disabled = true;
        setTfliteThresholdButton.innerText = "setting threshold...";
      });

      /** @type {HTMLSpanElement} */
      const tfliteCaptureDelaySpan = availableDeviceContainer.querySelector(".tfliteCaptureDelay");
      /** @type {HTMLInputElement} */
      const setTfliteCaptureDelayInput = availableDeviceContainer.querySelector(".setTfliteCaptureDelayInput");
      /** @type {HTMLButtonElement} */
      const setTfliteCaptureDelayButton = availableDeviceContainer.querySelector(".setTfliteCaptureDelayButton");

      device.addEventListener("getTfliteCaptureDelay", () => {
        tfliteCaptureDelaySpan.innerText = device.tfliteCaptureDelay;

        setTfliteCaptureDelayInput.value = "";
        setTfliteCaptureDelayInput.disabled = false;

        setTfliteCaptureDelayButton.disabled = false;
        setTfliteCaptureDelayButton.innerText = "set capture delay";
      });
      tfliteCaptureDelaySpan.innerText = device.tfliteCaptureDelay;

      setTfliteCaptureDelayButton.addEventListener("click", () => {
        device.setTfliteCaptureDelay(Number(setTfliteCaptureDelayInput.value));

        setTfliteCaptureDelayInput.disabled = true;

        setTfliteCaptureDelayButton.disabled = true;
        setTfliteCaptureDelayButton.innerText = "setting capture delay...";
      });

      /** @type {HTMLInputElement} */
      const tfliteInferencingEnabledInput = availableDeviceContainer.querySelector(".tfliteInferencingEnabled");
      /** @type {HTMLButtonElement} */
      const toggleTfliteInferencingEnabledButton = availableDeviceContainer.querySelector(
        ".toggleTfliteInferencingEnabled"
      );

      const updateTfliteInferencingUI = () => {
        toggleTfliteInferencingEnabledButton.disabled = !device.tfliteIsReady;

        tfliteInferencingEnabledInput.checked = device.tfliteInferencingEnabled;
        toggleTfliteInferencingEnabledButton.innerText = device.tfliteInferencingEnabled
          ? "disable inferencing"
          : "enable inferencing";
      };

      device.addEventListener("tfliteIsReady", () => {
        toggleTfliteInferencingEnabledButton.disabled = !device.tfliteIsReady;
      });
      device.addEventListener("getTfliteInferencingEnabled", () => {
        tfliteInferencingEnabledInput.checked = device.tfliteInferencingEnabled;
        toggleTfliteInferencingEnabledButton.innerText = device.tfliteInferencingEnabled
          ? "disable inferencing"
          : "enable inferencing";
      });
      updateTfliteInferencingUI();

      toggleTfliteInferencingEnabledButton.addEventListener("click", () => {
        device.toggleTfliteInferencing();
      });

      /** @type {HTMLPreElement} */
      const tfliteInferencePre = availableDeviceContainer.querySelector(".tfliteInference");
      device.addEventListener("tfliteInference", (event) => {
        console.log("inference", event.message.tfliteInference);
        tfliteInferencePre.textContent = JSON.stringify(event.message.tfliteInference, null, 2);
      });

      const updateTfliteUI = () => {
        const disabled = !device.isConnected;
        setTfliteCaptureDelayInput.disabled = disabled;
        setTfliteCaptureDelayButton.disabled = disabled;

        setTfliteTaskSelect.disabled = disabled;
        setTfliteTaskButton.disabled = disabled;

        setTfliteThresholdInput.disabled = disabled;
        setTfliteThresholdButton.disabled = disabled;

        setTfliteNameInput.disabled = disabled;
        setTfliteNameButton.disabled = disabled;

        setTfliteSampleRateInput.disabled = disabled;
        setTfliteSampleRateButton.disabled = disabled;
      };
      device.addEventListener("isConnected", () => {
        updateTfliteUI();
      });
      updateTfliteUI();

      // FIRMWARE

      /** @type {File?} */
      let firmware;

      /** @type {HTMLInputElement} */
      const firmwareInput = availableDeviceContainer.querySelector(".firmwareInput");
      firmwareInput.addEventListener("input", () => {
        firmware = firmwareInput.files[0];
        updateToggleFirmwareUploadButton();
      });
      /** @type {HTMLButtonElement} */
      const toggleFirmwareUploadButton = availableDeviceContainer.querySelector(".toggleFirmwareUpload");
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
      const firmwareUploadProgress = availableDeviceContainer.querySelector(".firmwareUploadProgress");
      /** @type {HTMLSpanElement} */
      const firmwareUploadProgressPercentageSpan = availableDeviceContainer.querySelector(
        ".firmwareUploadProgressPercentage"
      );
      device.addEventListener("firmwareUploadProgress", (event) => {
        const progress = event.message.firmwareUploadProgress;
        firmwareUploadProgress.value = progress;
        firmwareUploadProgressPercentageSpan.innerText = `${Math.floor(100 * progress)}%`;
      });
      device.addEventListener("firmwareUploadComplete", () => {
        firmwareUploadProgress.value = 0;
      });
      device.addEventListener("firmwareStatus", () => {
        const isUploading = device.firmwareStatus == "uploading";
        firmwareUploadProgressPercentageSpan.style.display = isUploading ? "" : "none";
      });

      /** @type {HTMLPreElement} */
      const firmwareImagesPre = availableDeviceContainer.querySelector(".firmwareImages");
      device.addEventListener("firmwareImages", () => {
        firmwareImagesPre.textContent = JSON.stringify(
          device.firmwareImages,
          (key, value) => (key == "hash" ? Array.from(value).join(",") : value),
          2
        );
      });

      device.addEventListener("isConnected", () => {
        if (device.isConnected) {
          device.getFirmwareImages();
        }
      });

      /** @type {HTMLSpanElement} */
      const firmwareStatusSpan = availableDeviceContainer.querySelector(".firmwareStatus");

      /** @type {HTMLButtonElement} */
      const resetButton = availableDeviceContainer.querySelector(".reset");
      resetButton.addEventListener("click", () => {
        device.reset();
        resetButton.disabled = true;
      });
      const updateResetButton = () => {
        const status = device.firmwareStatus;
        const enabled = status == "pending" || status == "testing";
        resetButton.disabled = !enabled;
      };

      /** @type {HTMLButtonElement} */
      const testFirmwareImageButton = availableDeviceContainer.querySelector(".testFirmwareImage");
      testFirmwareImageButton.addEventListener("click", () => {
        device.testFirmwareImage();
      });
      const updateTestFirmwareImageButton = () => {
        const enabled = device.firmwareStatus == "uploaded";
        testFirmwareImageButton.disabled = !enabled;
      };

      /** @type {HTMLButtonElement} */
      const confirmFirmwareImageButton = availableDeviceContainer.querySelector(".confirmFirmwareImage");
      confirmFirmwareImageButton.addEventListener("click", () => {
        device.confirmFirmwareImage();
      });
      const updateConfirmFirmwareImageButton = () => {
        const enabled = device.firmwareStatus == "testing";
        confirmFirmwareImageButton.disabled = !enabled;
      };

      /** @type {HTMLButtonElement} */
      const eraseFirmwareImageButton = availableDeviceContainer.querySelector(".eraseFirmwareImage");
      eraseFirmwareImageButton.addEventListener("click", () => {
        device.eraseFirmwareImage();
      });
      const updateEraseFirmwareImageButton = () => {
        const enabled = device.firmwareStatus == "uploaded";
        eraseFirmwareImageButton.disabled = !enabled;
      };

      const updateFirmwareUI = () => {
        firmwareStatusSpan.innerText = device.firmwareStatus;

        updateResetButton();
        updateTestFirmwareImageButton();
        updateConfirmFirmwareImageButton();
        updateEraseFirmwareImageButton();
      };
      device.addEventListener("firmwareStatus", () => {
        updateFirmwareUI();
      });
      updateFirmwareUI();

      device.getFirmwareImages();

      availableDevicesContainer.appendChild(availableDeviceContainer);
    }
  });
});
