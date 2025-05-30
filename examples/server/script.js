import * as BS from "../../build/brilliantsole.module.js";
window.BS = BS;
console.log({ BS });
//BS.setAllConsoleLevelFlags({ log: true });

const client = new BS.WebSocketClient();
console.log({ client });

window.client = client;

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
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname +
      "?" +
      searchParams.toString();
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
    case "notConnected":
      toggleConnectionButton.disabled = false;
      toggleConnectionButton.innerText = client.isConnected
        ? "disconnect"
        : "connect";
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
const isScanningAvailableCheckbox = document.getElementById(
  "isScanningAvailable"
);
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

/** @type {HTMLTemplateElement} */
const discoveredDeviceTemplate = document.getElementById(
  "discoveredDeviceTemplate"
);
const discoveredDevicesContainer = document.getElementById("discoveredDevices");
/** @type {Object.<string, HTMLElement>} */
let discoveredDeviceContainers = {};

client.addEventListener("discoveredDevice", (event) => {
  const discoveredDevice = event.message.discoveredDevice;

  let discoveredDeviceContainer =
    discoveredDeviceContainers[discoveredDevice.bluetoothId];
  if (!discoveredDeviceContainer) {
    discoveredDeviceContainer = discoveredDeviceTemplate.content
      .cloneNode(true)
      .querySelector(".discoveredDevice");

    /** @type {HTMLButtonElement} */
    const toggleConnectionButton =
      discoveredDeviceContainer.querySelector(".toggleConnection");
    toggleConnectionButton.addEventListener("click", () => {
      let device = client.devices[discoveredDevice.bluetoothId];
      if (device) {
        device.toggleConnection();
      } else {
        device = client.connectToDevice(discoveredDevice.bluetoothId);
        onDevice(device);
      }
    });

    /** @type {HTMLButtonElement} */
    const connectViaWebSocketsButton = discoveredDeviceContainer.querySelector(
      ".connectViaWebSockets"
    );
    connectViaWebSocketsButton.addEventListener("click", () => {
      let device = client.devices[discoveredDevice.bluetoothId];
      if (device) {
        device.connect({ type: "client", subType: "webSocket" });
      } else {
        device = client.connectToDevice(
          discoveredDevice.bluetoothId,
          "webSocket"
        );
        onDevice(device);
      }
      connectViaWebSocketsButton.disabled = true;
    });

    /** @type {HTMLButtonElement} */
    const connectViaUDPButton =
      discoveredDeviceContainer.querySelector(".connectViaUDP");
    connectViaUDPButton.addEventListener("click", () => {
      let device = client.devices[discoveredDevice.bluetoothId];
      if (device) {
        device.connect({ type: "client", subType: "udp" });
      } else {
        device = client.connectToDevice(discoveredDevice.bluetoothId, "udp");
        onDevice(device);
      }
      connectViaUDPButton.disabled = true;
    });

    /** @param {BS.Device} device */
    const onDevice = (device) => {
      device.addEventListener("connectionStatus", () => {
        updateToggleConnectionButton(device);
      });
      updateToggleConnectionButton(device);
      delete discoveredDeviceContainer._onDevice;
    };

    discoveredDeviceContainer._onDevice = onDevice;

    /** @param {BS.Device} device */
    const updateToggleConnectionButton = (device) => {
      console.log({ deviceConnectionStatus: device.connectionStatus });
      switch (device.connectionStatus) {
        case "connected":
        case "notConnected":
          toggleConnectionButton.innerText = device.isConnected
            ? "disconnect"
            : "connect";
          toggleConnectionButton.disabled = false;
          break;
        case "connecting":
        case "disconnecting":
          toggleConnectionButton.innerText = device.connectionStatus;
          toggleConnectionButton.disabled = true;
          break;
      }
      connectViaWebSocketsButton.disabled = device.isConnected;
      connectViaUDPButton.disabled = device.isConnected;
    };

    discoveredDeviceContainers[discoveredDevice.bluetoothId] =
      discoveredDeviceContainer;
    discoveredDevicesContainer.appendChild(discoveredDeviceContainer);
  }

  updateDiscoveredDeviceContainer(discoveredDevice);
});

/** @param {BS.DiscoveredDevice} discoveredDevice */
function updateDiscoveredDeviceContainer(discoveredDevice) {
  const discoveredDeviceContainer =
    discoveredDeviceContainers[discoveredDevice.bluetoothId];
  if (!discoveredDeviceContainer) {
    console.warn(
      `no discoveredDeviceContainer for device id ${discoveredDevice.bluetoothId}`
    );
    return;
  }
  discoveredDeviceContainer.querySelector(".name").innerText =
    discoveredDevice.name;
  discoveredDeviceContainer.querySelector(".rssi").innerText =
    discoveredDevice.rssi;
  discoveredDeviceContainer.querySelector(".deviceType").innerText =
    discoveredDevice.deviceType;

  const connectViaWebSocketsButton = discoveredDeviceContainer.querySelector(
    ".connectViaWebSockets"
  );
  const connectViaUDPButton =
    discoveredDeviceContainer.querySelector(".connectViaUDP");

  const ipAddressSpan = discoveredDeviceContainer.querySelector(".ipAddress");
  if (discoveredDevice.ipAddress) {
    ipAddressSpan.closest("label").classList.remove("hidden");
    ipAddressSpan.innerText = discoveredDevice.ipAddress;
    connectViaWebSocketsButton.classList.remove("hidden");
    connectViaUDPButton.classList.remove("hidden");
  } else {
    ipAddressSpan.closest("label").classList.add("hidden");
    connectViaWebSocketsButton.classList.add("hidden");
    connectViaUDPButton.classList.add("hidden");
  }

  const isWifiSecureSpan =
    discoveredDeviceContainer.querySelector(".isWifiSecure");
  discoveredDeviceContainer.querySelector(".isWifiSecure");
  if (discoveredDevice.isWifiSecure) {
    isWifiSecureSpan.closest("label").classList.remove("hidden");
    ipAddressSpan.innerText = discoveredDevice.isWifiSecure;
  } else {
    isWifiSecureSpan.closest("label").classList.add("hidden");
  }
}

/** @param {BS.DiscoveredDevice} discoveredDevice */
function removeDiscoveredDeviceContainer(discoveredDevice) {
  const discoveredDeviceContainer =
    discoveredDeviceContainers[discoveredDevice.bluetoothId];
  if (!discoveredDeviceContainer) {
    console.warn(
      `no discoveredDeviceContainer for device id ${discoveredDevice.bluetoothId}`
    );
    return;
  }

  discoveredDeviceContainer.remove();
  delete discoveredDeviceContainers[discoveredDevice.bluetoothId];
}

client.addEventListener("expiredDiscoveredDevice", (event) => {
  const discoveredDevice = event.message.discoveredDevice;
  removeDiscoveredDeviceContainer(discoveredDevice);
});

function clearDiscoveredDevices() {
  discoveredDevicesContainer.innerHTML = "";
  discoveredDeviceContainers = {};
}

client.addEventListener("notConnected", () => {
  clearDiscoveredDevices();
});

client.addEventListener("isScanning", () => {
  if (client.isScanning) {
    clearDiscoveredDevices();
  }
});

BS.DeviceManager.AddEventListener("deviceIsConnected", (event) => {
  const device = event.message.device;
  console.log("deviceIsConnected", device);
  const discoveredDeviceContainer =
    discoveredDeviceContainers[device.bluetoothId];
  if (!discoveredDeviceContainer) {
    return;
  }
  discoveredDeviceContainer._onDevice?.(device);
});

// AVAILABLE DEVICES

/** @type {HTMLTemplateElement} */
const connectedDeviceTemplate = document.getElementById(
  "connectedDeviceTemplate"
);
const connectedDevicesContainer = document.getElementById("connectedDevices");
/** @type {Object.<string, HTMLElement>} */
let connectedDeviceContainers = {};

BS.DeviceManager.AddEventListener("connectedDevices", (event) => {
  const { connectedDevices } = event.message;
  console.log({ connectedDevices });

  connectedDevices.forEach((device) => {
    if (device.connectionType != "client" || !device.bluetoothId) {
      return;
    }
    let connectedDeviceContainer =
      connectedDeviceContainers[device.bluetoothId];
    if (!connectedDeviceContainer) {
      connectedDeviceContainer = connectedDeviceTemplate.content
        .cloneNode(true)
        .querySelector(".connectedDevice");
      connectedDeviceContainers[device.bluetoothId] = connectedDeviceContainer;

      /** @type {HTMLPreElement} */
      const deviceInformationPre =
        connectedDeviceContainer.querySelector(".deviceInformation");
      const setDeviceInformationPre = () =>
        (deviceInformationPre.textContent = JSON.stringify(
          device.deviceInformation,
          null,
          2
        ));
      setDeviceInformationPre();
      device.addEventListener("deviceInformation", () =>
        setDeviceInformationPre()
      );

      /** @type {HTMLSpanElement} */
      const batteryLevelSpan =
        connectedDeviceContainer.querySelector(".batteryLevel");
      const setBatteryLevelSpan = () =>
        (batteryLevelSpan.innerText = device.batteryLevel);
      setBatteryLevelSpan();
      device.addEventListener("batteryLevel", () => setBatteryLevelSpan());

      /** @type {HTMLSpanElement} */
      const nameSpan = connectedDeviceContainer.querySelector(".name");
      const setNameSpan = () => (nameSpan.innerText = device.name);
      setNameSpan();
      device.addEventListener("getName", () => setNameSpan());

      /** @type {HTMLInputElement} */
      const setNameInput =
        connectedDeviceContainer.querySelector(".setNameInput");
      setNameInput.minLength = BS.MinNameLength;
      setNameInput.maxLength = BS.MaxNameLength;
      setNameInput.disabled = !device.isConnected;

      /** @type {HTMLButtonElement} */
      const setNameButton =
        connectedDeviceContainer.querySelector(".setNameButton");
      setNameButton.disabled = !device.isConnected;

      device.addEventListener("isConnected", () => {
        setNameInput.disabled = !device.isConnected;
      });
      device.addEventListener("notConnected", () => {
        setNameInput.value = "";
      });

      setNameInput.addEventListener("input", () => {
        setNameButton.disabled =
          setNameInput.value.length < device.minNameLength;
      });

      setNameButton.addEventListener("click", () => {
        console.log(`setting name to ${setNameInput.value}`);
        device.setName(setNameInput.value);
        setNameInput.value = "";
        setNameButton.disabled = true;
      });

      /** @type {HTMLSpanElement} */
      const deviceTypeSpan =
        connectedDeviceContainer.querySelector(".deviceType");
      const setDeviceTypeSpan = () => (deviceTypeSpan.innerText = device.type);
      setDeviceTypeSpan();
      device.addEventListener("getType", () => setDeviceTypeSpan());

      /** @type {HTMLButtonElement} */
      const setTypeButton =
        connectedDeviceContainer.querySelector(".setTypeButton");

      /** @type {HTMLSelectElement} */
      const setTypeSelect =
        connectedDeviceContainer.querySelector(".setTypeSelect");
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
      const sensorConfigurationPre = connectedDeviceContainer.querySelector(
        ".sensorConfiguration"
      );
      const setSensorConfigurationPre = () =>
        (sensorConfigurationPre.textContent = JSON.stringify(
          device.sensorConfiguration,
          null,
          2
        ));
      setSensorConfigurationPre();
      device.addEventListener("getSensorConfiguration", () =>
        setSensorConfigurationPre()
      );

      /** @type {HTMLTemplateElement} */
      const sensorTypeConfigurationTemplate =
        connectedDeviceContainer.querySelector(
          ".sensorTypeConfigurationTemplate"
        );
      device.sensorTypes.forEach((sensorType) => {
        const sensorTypeConfigurationContainer =
          sensorTypeConfigurationTemplate.content
            .cloneNode(true)
            .querySelector(".sensorTypeConfiguration");
        sensorTypeConfigurationContainer.querySelector(
          ".sensorType"
        ).innerText = sensorType;

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
        sensorRateInput.disabled = !device.isConnected;

        sensorTypeConfigurationTemplate.parentElement.insertBefore(
          sensorTypeConfigurationContainer,
          sensorTypeConfigurationTemplate
        );
        sensorTypeConfigurationContainer.dataset.sensorType = sensorType;
      });

      device.addEventListener("isConnected", () => {
        connectedDeviceContainer
          .querySelectorAll("input")
          .forEach((input) => (input.disabled = !device.isConnected));
      });

      device.addEventListener("getSensorConfiguration", () => {
        for (const sensorType in device.sensorConfiguration) {
          connectedDeviceContainer.querySelector(
            `.sensorTypeConfiguration[data-sensor-type="${sensorType}"] .input`
          ).value = device.sensorConfiguration[sensorType];
        }
      });

      /** @type {HTMLPreElement} */
      const sensorDataPre =
        connectedDeviceContainer.querySelector(".sensorData");
      const setSensorDataPre = (event) =>
        (sensorDataPre.textContent = JSON.stringify(event.message, null, 2));
      device.addEventListener("sensorData", (event) => setSensorDataPre(event));

      /** @type {HTMLButtonElement} */
      const triggerVibrationButton =
        connectedDeviceContainer.querySelector(".triggerVibration");
      triggerVibrationButton.addEventListener("click", () => {
        device.triggerVibration([
          {
            type: "waveformEffect",
            segments: [{ effect: "doubleClick100" }],
          },
        ]);
      });
      device.addEventListener("isConnected", () => {
        triggerVibrationButton.disabled = !device.isConnected;
      });
      triggerVibrationButton.disabled = !device.isConnected;

      /** @type {HTMLButtonElement} */
      const toggleConnectionButton =
        connectedDeviceContainer.querySelector(".toggleConnection");
      toggleConnectionButton.addEventListener("click", () => {
        device.toggleConnection();
      });
      const updateToggleConnectionButton = () => {
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
            toggleConnectionButton.innerText = device.connectionStatus;
            toggleConnectionButton.disabled = true;
            break;
        }
      };
      updateToggleConnectionButton();
      device.addEventListener("connectionStatus", () =>
        updateToggleConnectionButton()
      );

      /** @type {File?} */
      let file;

      /** @type {HTMLInputElement} */
      const fileInput = connectedDeviceContainer.querySelector(".file");
      fileInput.addEventListener("input", () => {
        if (fileInput.files[0].size > device.maxFileLength) {
          console.log("file size too large");
          return;
        }
        file = fileInput.files[0];
        console.log("file", file);
        updateToggleFileTransferButton();
      });

      const maxFileLengthSpan =
        connectedDeviceContainer.querySelector(".maxFileLength");
      const updateMaxFileLengthSpan = () => {
        maxFileLengthSpan.innerText = (
          device.maxFileLength / 1024
        ).toLocaleString();
      };
      updateMaxFileLengthSpan();
      device.addEventListener("isConnected", () => {
        updateMaxFileLengthSpan();
      });

      /** @type {BS.FileType} */
      let fileType;

      /** @type {HTMLSelectElement} */
      const fileTransferTypesSelect =
        connectedDeviceContainer.querySelector(".fileTransferTypes");
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
      const fileTransferTypesOptgroup =
        fileTransferTypesSelect.querySelector("optgroup");
      BS.FileTypes.forEach((fileType) => {
        fileTransferTypesOptgroup.appendChild(new Option(fileType));
      });
      fileTransferTypesSelect.dispatchEvent(new Event("input"));

      /** @type {HTMLProgressElement} */
      const fileTransferProgress = connectedDeviceContainer.querySelector(
        ".fileTransferProgress"
      );
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
      const toggleFileTransferButton = connectedDeviceContainer.querySelector(
        ".toggleFileTransfer"
      );
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
      const fileTransferDirectionSelect =
        connectedDeviceContainer.querySelector(".fileTransferDirection");
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
      const tfliteNameSpan =
        connectedDeviceContainer.querySelector(".tfliteName");
      /** @type {HTMLInputElement} */
      const setTfliteNameInput = connectedDeviceContainer.querySelector(
        ".setTfliteNameInput"
      );
      /** @type {HTMLButtonElement} */
      const setTfliteNameButton = connectedDeviceContainer.querySelector(
        ".setTfliteNameButton"
      );

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
      const tfliteTaskSpan =
        connectedDeviceContainer.querySelector(".tfliteTask");
      /** @type {HTMLSelectElement} */
      const setTfliteTaskSelect = connectedDeviceContainer.querySelector(
        ".setTfliteTaskSelect"
      );
      /** @type {HTMLOptGroupElement} */
      const setTfliteTaskOptgroup =
        setTfliteTaskSelect.querySelector("optgroup");
      /** @type {HTMLButtonElement} */
      const setTfliteTaskButton = connectedDeviceContainer.querySelector(
        ".setTfliteTaskButton"
      );

      BS.TfliteTasks.forEach((task) => {
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
      const tfliteSampleRateSpan =
        connectedDeviceContainer.querySelector(".tfliteSampleRate");
      /** @type {HTMLInputElement} */
      const setTfliteSampleRateInput = connectedDeviceContainer.querySelector(
        ".setTfliteSampleRateInput"
      );
      /** @type {HTMLButtonElement} */
      const setTfliteSampleRateButton = connectedDeviceContainer.querySelector(
        ".setTfliteSampleRateButton"
      );

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

      const tfliteSensorTypesContainer =
        connectedDeviceContainer.querySelector(".tfliteSensorTypes");
      /** @type {HTMLTemplateElement} */
      const tfliteSensorTypeTemplate = connectedDeviceContainer.querySelector(
        ".tfliteSensorTypeTemplate"
      );
      /** @type {Object.<string, HTMLElement>} */
      const tfliteSensorTypeContainers = {};
      /** @type {BS.SensorType[]} */
      let tfliteSensorTypes = [];
      /** @type {HTMLButtonElement} */
      const setTfliteSensorTypesButton = connectedDeviceContainer.querySelector(
        ".setTfliteSensorTypes"
      );

      BS.TfliteSensorTypes.forEach((sensorType) => {
        const sensorTypeContainer = tfliteSensorTypeTemplate.content
          .cloneNode(true)
          .querySelector(".sensorType");
        sensorTypeContainer.querySelector(".name").innerText = sensorType;

        /** @type {HTMLInputElement} */
        const isSensorEnabledInput =
          sensorTypeContainer.querySelector(".enabled");
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
        isSensorEnabledInput.checked =
          device.tfliteSensorTypes.includes(sensorType);

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
      const setTfliteIsReadyInput =
        connectedDeviceContainer.querySelector(".tfliteIsReady");
      device.addEventListener("tfliteIsReady", () => {
        setTfliteIsReadyInput.checked = device.tfliteIsReady;
      });
      setTfliteIsReadyInput.checked = device.tfliteIsReady;

      /** @type {HTMLSpanElement} */
      const tfliteThresholdSpan =
        connectedDeviceContainer.querySelector(".tfliteThreshold");
      /** @type {HTMLInputElement} */
      const setTfliteThresholdInput = connectedDeviceContainer.querySelector(
        ".setTfliteThresholdInput"
      );
      /** @type {HTMLButtonElement} */
      const setTfliteThresholdButton = connectedDeviceContainer.querySelector(
        ".setTfliteThresholdButton"
      );

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
      const tfliteCaptureDelaySpan = connectedDeviceContainer.querySelector(
        ".tfliteCaptureDelay"
      );
      /** @type {HTMLInputElement} */
      const setTfliteCaptureDelayInput = connectedDeviceContainer.querySelector(
        ".setTfliteCaptureDelayInput"
      );
      /** @type {HTMLButtonElement} */
      const setTfliteCaptureDelayButton =
        connectedDeviceContainer.querySelector(".setTfliteCaptureDelayButton");

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
      const tfliteInferencingEnabledInput =
        connectedDeviceContainer.querySelector(".tfliteInferencingEnabled");
      /** @type {HTMLButtonElement} */
      const toggleTfliteInferencingEnabledButton =
        connectedDeviceContainer.querySelector(
          ".toggleTfliteInferencingEnabled"
        );

      const updateTfliteInferencingUI = () => {
        toggleTfliteInferencingEnabledButton.disabled = !device.tfliteIsReady;

        tfliteInferencingEnabledInput.checked = device.tfliteInferencingEnabled;
        toggleTfliteInferencingEnabledButton.innerText =
          device.tfliteInferencingEnabled
            ? "disable inferencing"
            : "enable inferencing";
      };

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
      updateTfliteInferencingUI();

      toggleTfliteInferencingEnabledButton.addEventListener("click", () => {
        device.toggleTfliteInferencing();
      });

      /** @type {HTMLPreElement} */
      const tfliteInferencePre =
        connectedDeviceContainer.querySelector(".tfliteInference");
      device.addEventListener("tfliteInference", (event) => {
        console.log("inference", event.message.tfliteInference);
        tfliteInferencePre.textContent = JSON.stringify(
          event.message.tfliteInference,
          null,
          2
        );
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
      const firmwareInput =
        connectedDeviceContainer.querySelector(".firmwareInput");
      firmwareInput.addEventListener("input", () => {
        firmware = firmwareInput.files[0];
        updateToggleFirmwareUploadButton();
      });
      /** @type {HTMLButtonElement} */
      const toggleFirmwareUploadButton = connectedDeviceContainer.querySelector(
        ".toggleFirmwareUpload"
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
      const firmwareUploadProgress = connectedDeviceContainer.querySelector(
        ".firmwareUploadProgress"
      );
      /** @type {HTMLSpanElement} */
      const firmwareUploadProgressPercentageSpan =
        connectedDeviceContainer.querySelector(
          ".firmwareUploadProgressPercentage"
        );
      device.addEventListener("firmwareUploadProgress", (event) => {
        const progress = event.message.firmwareUploadProgress;
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
      const firmwareImagesPre =
        connectedDeviceContainer.querySelector(".firmwareImages");
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
      const firmwareStatusSpan =
        connectedDeviceContainer.querySelector(".firmwareStatus");

      /** @type {HTMLButtonElement} */
      const resetButton = connectedDeviceContainer.querySelector(".reset");
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
      const testFirmwareImageButton =
        connectedDeviceContainer.querySelector(".testFirmwareImage");
      testFirmwareImageButton.addEventListener("click", () => {
        device.testFirmwareImage();
      });
      const updateTestFirmwareImageButton = () => {
        const enabled = device.firmwareStatus == "uploaded";
        testFirmwareImageButton.disabled = !enabled;
      };

      /** @type {HTMLButtonElement} */
      const confirmFirmwareImageButton = connectedDeviceContainer.querySelector(
        ".confirmFirmwareImage"
      );
      confirmFirmwareImageButton.addEventListener("click", () => {
        device.confirmFirmwareImage();
      });
      const updateConfirmFirmwareImageButton = () => {
        const enabled = device.firmwareStatus == "testing";
        confirmFirmwareImageButton.disabled = !enabled;
      };

      /** @type {HTMLButtonElement} */
      const eraseFirmwareImageButton = connectedDeviceContainer.querySelector(
        ".eraseFirmwareImage"
      );
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

      if (device.canUpdateFirmware) {
        device.getFirmwareImages();
      }
    }
    connectedDevicesContainer.appendChild(connectedDeviceContainer);
  });

  for (const id in connectedDeviceContainers) {
    const connectedDevice = connectedDevices.find(
      (connectedDevice) => connectedDevice.bluetoothId == id
    );
    if (!connectedDevice) {
      console.log("remove", id);
      connectedDeviceContainers[id].remove();
      //delete connectedDeviceContainers[id];
    }
  }
});
