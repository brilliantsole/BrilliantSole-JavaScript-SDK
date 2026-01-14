import * as BS from "../../build/brilliantsole.module.js";
window.BS = BS;
console.log({ BS });
//BS.setAllConsoleLevelFlags({ log: true });

// CLIENT

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
    webSocketUrl = client.connect(webSocketUrl);
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
      console.log("toggleConnection", device);
      if (device) {
        device.toggleConnection();
      } else {
        device = client.connectToDevice(discoveredDevice.bluetoothId);
        onDevice(device);
      }
    });

    /** @param {BS.Device} device */
    const onDevice = (device) => {
      console.log("onDevice", device);
      device.addEventListener("connectionStatus", () => {
        console.log("connectionStatus", device.connectionStatus);
        updateToggleConnectionButton(device);
      });
      updateToggleConnectionButton(device);
      delete discoveredDeviceContainer._onDevice;
    };

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
    };

    discoveredDeviceContainer._onDevice = onDevice;
    let device = client.devices[discoveredDevice.bluetoothId];
    if (device) {
      onDevice(device);
    }

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

// WEB AUDIO

const audioContext = new (window.AudioContext || window.webkitAudioContext)({
  sampleRate: 16_000,
  latencyHint: "interactive",
});
window.audioContext = audioContext;
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

      // DEVICE INFORMATION
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

      // DEVICE BATTERY
      /** @type {HTMLSpanElement} */
      const batteryLevelSpan =
        connectedDeviceContainer.querySelector(".batteryLevel");
      const setBatteryLevelSpan = () =>
        (batteryLevelSpan.innerText = device.batteryLevel);
      setBatteryLevelSpan();
      device.addEventListener("batteryLevel", () => setBatteryLevelSpan());

      // DEVICE NAME
      /** @type {HTMLSpanElement} */
      const nameSpan = connectedDeviceContainer.querySelector(".name");
      const setNameSpan = () => (nameSpan.innerText = device.name);
      setNameSpan();
      device.addEventListener("getName", () => setNameSpan());

      // DEVICE TYPE
      /** @type {HTMLSpanElement} */
      const deviceTypeSpan =
        connectedDeviceContainer.querySelector(".deviceType");
      const setDeviceTypeSpan = () => (deviceTypeSpan.innerText = device.type);
      setDeviceTypeSpan();
      device.addEventListener("getType", () => setDeviceTypeSpan());

      // DEVICE SENSOR CONFIGURATION
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

      // DEVICE SENSOR DATA
      /** @type {HTMLPreElement} */
      const sensorDataPre =
        connectedDeviceContainer.querySelector(".sensorData");
      const setSensorDataPre = (event) =>
        (sensorDataPre.textContent = JSON.stringify(event.message, null, 2));
      device.addEventListener("sensorData", (event) => setSensorDataPre(event));

      // DEVICE CONNECTION
      /** @type {HTMLButtonElement} */
      const toggleConnectionButton =
        connectedDeviceContainer.querySelector(".toggleConnection");
      toggleConnectionButton.addEventListener("click", () => {
        device.toggleConnection();
      });
      const updateToggleConnectionButton = () => {
        console.log({ deviceConnectionStatus2: device.connectionStatus });
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
      device.addEventListener("connectionStatus", () => {
        updateToggleConnectionButton();
      });

      // DEVICE CAMERA
      const deviceCameraContainer =
        connectedDeviceContainer.querySelector(".camera");

      /** @type {HTMLImageElement} */
      const deviceCameraImage =
        deviceCameraContainer.querySelector(".cameraImage");
      device.addEventListener("cameraImage", (event) => {
        deviceCameraImage.src = event.message.url;
      });

      /** @type {HTMLButtonElement} */
      const takePictureButton =
        deviceCameraContainer.querySelector(".takePicture");
      takePictureButton.addEventListener("click", () => {
        device.takePicture();
      });
      const updateTakePictureButton = () => {
        const { cameraStatus } = device;
        let innerText = "take picture";
        let enabled = false;
        switch (cameraStatus) {
          case "takingPicture":
            innerText = "taking picture...";
            enabled = true;
            break;
          case "idle":
            enabled = true;
            break;
          case "focusing":
            break;
          case "asleep":
            break;
        }
        takePictureButton.disabled = !enabled;
        takePictureButton.innerText = innerText;
      };
      device.addEventListener("cameraStatus", () => {
        updateTakePictureButton();
      });

      /** @type {HTMLButtonElement} */
      const focusCameraButton =
        deviceCameraContainer.querySelector(".focusCamera");
      focusCameraButton.addEventListener("click", () => {
        device.focusCamera();
      });
      const updateFocusCameraButton = () => {
        const { cameraStatus } = device;
        let innerText = "focus camera";
        let enabled = false;
        switch (cameraStatus) {
          case "takingPicture":
            break;
          case "idle":
            enabled = true;
            break;
          case "focusing":
            innerText = "focusing...";
            break;
          case "asleep":
            break;
        }
        focusCameraButton.disabled = !enabled;
        focusCameraButton.innerText = innerText;
      };
      device.addEventListener("cameraStatus", () => {
        updateFocusCameraButton();
      });
      device.addEventListener("cameraStatus", (event) => {
        const { previousCameraStatus } = event.message;
        if (previousCameraStatus == "focusing") {
          device.takePicture();
        }
      });

      /** @type {HTMLProgressElement} */
      const cameraProgress =
        deviceCameraContainer.querySelector(".cameraProgress");
      device.addEventListener("cameraImageProgress", (event) => {
        const { progress } = event.message;
        cameraProgress.value = progress;
        if (progress == 1) {
          cameraProgress.value = 0;
        }
      });

      /** @type {HTMLButtonElement} */
      const autoPictureCheckbox =
        deviceCameraContainer.querySelector(".autoPicture");
      autoPictureCheckbox.addEventListener("input", () => {
        device.autoPicture = autoPictureCheckbox.checked;
      });
      device.addEventListener("autoPicture", () => {
        autoPictureCheckbox.checked = device.autoPicture;
      });

      /** @type {HTMLPreElement} */
      const cameraConfigurationPre = deviceCameraContainer.querySelector(
        ".cameraConfigurationPre"
      );
      const updateCameraConfigurationPre = () => {
        cameraConfigurationPre.textContent = JSON.stringify(
          device.cameraConfiguration,
          null,
          2
        );
      };
      device.addEventListener("getCameraConfiguration", () => {
        updateCameraConfigurationPre();
        updateCameraWhiteBalanceInput();
      });

      /** @type {HTMLInputElement} */
      const takePictureAfterUpdateCheckbox =
        deviceCameraContainer.querySelector(".takePictureAfterUpdate");
      let takePictureAfterUpdate = false;
      takePictureAfterUpdateCheckbox.addEventListener("input", () => {
        takePictureAfterUpdate = takePictureAfterUpdateCheckbox.checked;
        console.log({ takePictureAfterUpdate });
      });

      const cameraConfigurationContainer = deviceCameraContainer.querySelector(
        ".cameraConfiguration"
      );
      /** @type {HTMLTemplateElement} */
      const cameraConfigurationTypeTemplate =
        deviceCameraContainer.querySelector(".cameraConfigurationTypeTemplate");
      BS.CameraConfigurationTypes.forEach((cameraConfigurationType) => {
        const cameraConfigurationTypeContainer =
          cameraConfigurationTypeTemplate.content
            .cloneNode(true)
            .querySelector(".cameraConfigurationType");

        cameraConfigurationContainer.appendChild(
          cameraConfigurationTypeContainer
        );

        cameraConfigurationTypeContainer.querySelector(".type").innerText =
          cameraConfigurationType;

        /** @type {HTMLInputElement} */
        const input = cameraConfigurationTypeContainer.querySelector("input");

        /** @type {HTMLSpanElement} */
        const span = cameraConfigurationTypeContainer.querySelector("span");

        device.addEventListener("isConnected", () => {
          updateIsInputDisabled();
        });
        device.addEventListener("connected", () => {
          updateContainerVisibility();
        });
        device.addEventListener("cameraStatus", () => {
          updateIsInputDisabled();
        });
        const updateIsInputDisabled = () => {
          input.disabled =
            !device.isConnected ||
            !device.hasCamera ||
            device.cameraStatus != "idle";
        };

        const updateContainerVisibility = () => {
          const isVisible =
            cameraConfigurationType in device.cameraConfiguration;
          cameraConfigurationTypeContainer.style.display = isVisible
            ? ""
            : "none";
        };

        const updateInput = () => {
          const value = device.cameraConfiguration[cameraConfigurationType];
          span.innerText = value;
          input.value = value;
        };

        const updateRange = () => {
          if (!device.hasCamera) {
            return;
          }
          const range =
            device.cameraConfigurationRanges[cameraConfigurationType];
          input.min = range.min;
          input.max = range.max;
        };
        device.addEventListener("connected", () => {
          updateRange();
          updateInput();
        });
        updateRange();
        updateInput();
        updateIsInputDisabled();
        updateContainerVisibility();

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
      const cameraWhiteBalanceInput = deviceCameraContainer.querySelector(
        ".cameraWhiteBalance"
      );
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
          !device.isConnected ||
          !device.hasCamera ||
          device.cameraStatus != "idle";

        const { redGain, blueGain, greenGain } = device.cameraConfiguration;

        cameraWhiteBalanceInput.value = `#${[redGain, blueGain, greenGain]
          .map((value) => value / device.cameraConfigurationRanges.redGain.max)
          .map((value) => value * 255)
          .map((value) => Math.round(value))
          .map((value) => value.toString(16).padStart(2, "0"))
          .join("")}`;
      };

      device.addEventListener("cameraStatus", () => {
        updateCameraWhiteBalanceInput();
      });

      const updateDeviceCameraContainer = () => {
        if (device.isConnected && device.hasCamera) {
          deviceCameraContainer.removeAttribute("hidden");
        } else {
          deviceCameraContainer.setAttribute("hidden", "");
        }
        updateFocusCameraButton();
        updateTakePictureButton();
        updateCameraConfigurationPre();
        updateCameraWhiteBalanceInput();
      };
      device.addEventListener("isConnected", () => {
        updateDeviceCameraContainer();
      });
      updateDeviceCameraContainer();

      // DEVICE MICROPHONE

      const deviceMicrophoneContainer =
        connectedDeviceContainer.querySelector(".microphone");

      /** @type {HTMLSpanElement} */
      const microphoneStatusSpan =
        deviceMicrophoneContainer.querySelector(".microphoneStatus");
      const updateMicrophoneStatus = () => {
        microphoneStatusSpan.innerText = device.microphoneStatus;
      };
      device.addEventListener("microphoneStatus", () => {
        updateMicrophoneStatus();
      });

      /** @type {HTMLPreElement} */
      const microphoneConfigurationPre =
        deviceMicrophoneContainer.querySelector(".microphoneConfigurationPre");
      device.addEventListener("getMicrophoneConfiguration", () => {
        updateMicrophoneConfiguration();
      });
      const updateMicrophoneConfiguration = () => {
        microphoneConfigurationPre.textContent = JSON.stringify(
          device.microphoneConfiguration,
          null,
          2
        );
      };

      const microphoneConfigurationContainer =
        deviceMicrophoneContainer.querySelector(".microphoneConfiguration");
      /** @type {HTMLTemplateElement} */
      const microphoneConfigurationTypeTemplate =
        deviceMicrophoneContainer.querySelector(
          ".microphoneConfigurationTypeTemplate"
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
        const select =
          microphoneConfigurationTypeContainer.querySelector("select");
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
          const value =
            device.microphoneConfiguration[microphoneConfigurationType];
          span.innerText = value;
          select.value = value;
        };

        device.addEventListener("connected", () => {
          if (!device.hasMicrophone) {
            return;
          }
          updateSelect();
        });

        updateSelect();
        updateisInputDisabled();

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
      const toggleMicrophoneButton =
        deviceMicrophoneContainer.querySelector(".toggleMicrophone");
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
      const startMicrophoneButton =
        deviceMicrophoneContainer.querySelector(".startMicrophone");
      startMicrophoneButton.addEventListener("click", () => {
        device.startMicrophone();
      });
      /** @type {HTMLButtonElement} */
      const stopMicrophoneButton =
        deviceMicrophoneContainer.querySelector(".stopMicrophone");
      stopMicrophoneButton.addEventListener("click", () => {
        device.stopMicrophone();
      });

      /** @type {HTMLButtonElement} */
      const toggleMicrophoneRecordingButton =
        deviceMicrophoneContainer.querySelector(".toggleMicrophoneRecording");
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
          !device.hasMicrophone ||
          device.microphoneStatus != "streaming";

        toggleMicrophoneRecordingButton.innerText = device.isRecordingMicrophone
          ? "stop recording"
          : "start recording";

        toggleMicrophoneRecordingButton.disabled = disabled;
      };
      device.addEventListener("isRecordingMicrophone", () => {
        updateToggleMicrophoneRecordingButton();
        if (!device.isRecordingMicrophone) {
          device.stopMicrophone();
        }
      });
      device.addEventListener("microphoneStatus", () => {
        updateToggleMicrophoneRecordingButton();
      });

      const updateMicrophoneButtons = () => {
        let disabled = !device.isConnected || !device.hasMicrophone;

        startMicrophoneButton.disabled =
          disabled || device.microphoneStatus == "streaming";
        stopMicrophoneButton.disabled =
          disabled || device.microphoneStatus == "idle";
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

      device.audioContext = audioContext;
      device.microphoneGainNode.gain.value = 10;

      /** @type {HTMLAudioElement} */
      const microphoneStreamAudioElement =
        deviceMicrophoneContainer.querySelector(".microphoneStream");
      microphoneStreamAudioElement.srcObject =
        device.microphoneMediaStreamDestination.stream;

      /** @type {HTMLAudioElement} */
      const microphoneRecordingAudioElement =
        deviceMicrophoneContainer.querySelector(".microphoneRecording");
      /** @type {HTMLInputElement} */
      const autoPlayMicrphoneRecordingCheckbox =
        deviceMicrophoneContainer.querySelector(".autoPlayMicrphoneRecording");
      let autoPlayMicrphoneRecording =
        autoPlayMicrphoneRecordingCheckbox.checked;
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

      const peaksOptions = {
        zoomview: {
          container: deviceMicrophoneContainer.querySelector(
            ".zoomview-container"
          ),
        },
        overview: {
          container: deviceMicrophoneContainer.querySelector(
            ".overview-container"
          ),
        },
        mediaElement: deviceMicrophoneContainer.querySelector(
          ".microphoneRecording"
        ),
        webAudio: {
          audioContext: audioContext,
          scale: 128,
          multiChannel: false,
        },
      };

      microphoneRecordingAudioElement.addEventListener("loadeddata", () => {
        peaks.init(peaksOptions, (error, peaksInstance) => {
          if (error) {
            console.error("error initializing peaks", error);
          }
        });
      });

      const updateDeviceMicrophoneContainer = () => {
        if (device.isConnected && device.hasMicrophone) {
          deviceMicrophoneContainer.removeAttribute("hidden");
        } else {
          deviceMicrophoneContainer.setAttribute("hidden", "");
        }
        updateMicrophoneConfiguration();
        updateMicrophoneStatus();
        updateMicrophoneButtons();
        updateToggleMicrophoneRecordingButton();
      };
      device.addEventListener("isConnected", () => {
        updateDeviceMicrophoneContainer();
      });
      updateDeviceMicrophoneContainer();

      // DEVICE FILE TRANSFER
      const deviceFileTransferContainer =
        connectedDeviceContainer.querySelector(".fileTransfer");

      /** @type {File?} */
      let file;

      /** @type {HTMLInputElement} */
      const fileInput = deviceFileTransferContainer.querySelector(".file");
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
        deviceFileTransferContainer.querySelector(".maxFileLength");
      const updateMaxFileLengthSpan = () => {
        maxFileLengthSpan.innerText = (
          device.maxFileLength / 1024
        ).toLocaleString();
      };
      /** @type {BS.FileType} */
      let fileType;

      /** @type {HTMLSelectElement} */
      const fileTransferTypesSelect =
        deviceFileTransferContainer.querySelector(".fileTransferTypes");
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
      const updateFileTransferTypesSelect = () => {
        fileTransferTypesOptgroup.innerHTML = "";
        device.fileTypes.forEach((fileType) => {
          fileTransferTypesOptgroup.appendChild(new Option(fileType));
        });
        fileTransferTypesSelect.dispatchEvent(new Event("input"));
      };

      /** @type {HTMLProgressElement} */
      const fileTransferProgress = deviceFileTransferContainer.querySelector(
        ".fileTransferProgress"
      );
      console.log("fileTransferProgress", fileTransferProgress);

      device.addEventListener("fileTransferProgress", (event) => {
        const progress = event.message.progress;
        console.log("fileTransferProgress", progress, fileTransferProgress);
        fileTransferProgress.value = progress == 1 ? 0 : progress;
      });
      device.addEventListener("fileTransferStatus", () => {
        console.log("fileTransferStatus", device.fileTransferStatus);
        if (device.fileTransferStatus == "idle") {
          fileTransferProgress.value = 0;
        }
      });

      /** @type {HTMLButtonElement} */
      const toggleFileTransferButton =
        deviceFileTransferContainer.querySelector(".toggleFileTransfer");
      toggleFileTransferButton.addEventListener("click", async () => {
        if (device.fileTransferStatus == "idle") {
          if (fileTransferDirection == "send") {
            if (fileType == "tflite") {
              await device.setTfliteName(file.name.replaceAll(".tflite", ""));
            }
            console.log("sending file", fileType, file);
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
      device.addEventListener("fileTransferStatus", () => {
        updateToggleFileTransferButton();
      });

      /** @type {BS.FileTransferDirection} */
      let fileTransferDirection;
      /** @type {HTMLSelectElement} */
      const fileTransferDirectionSelect =
        deviceFileTransferContainer.querySelector(".fileTransferDirection");
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

      const updateDeviceFileTransferContainer = () => {
        if (device.isConnected && device.fileTransferStatus.length > 0) {
          deviceFileTransferContainer.removeAttribute("hidden");
        } else {
          deviceFileTransferContainer.setAttribute("hidden", "");
        }
        updateMaxFileLengthSpan();
        updateToggleFileTransferButton();
        updateFileTransferTypesSelect();
      };
      device.addEventListener("isConnected", () => {
        updateDeviceFileTransferContainer();
      });
      updateDeviceFileTransferContainer();

      // DEVICE TFLITE
      const deviceTfliteContainer =
        connectedDeviceContainer.querySelector(".tflite");

      /** @type {HTMLSpanElement} */
      const tfliteNameSpan = deviceTfliteContainer.querySelector(".tfliteName");
      /** @type {HTMLInputElement} */
      const setTfliteNameInput = deviceTfliteContainer.querySelector(
        ".setTfliteNameInput"
      );
      /** @type {HTMLButtonElement} */
      const setTfliteNameButton = deviceTfliteContainer.querySelector(
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
      const tfliteTaskSpan = deviceTfliteContainer.querySelector(".tfliteTask");
      /** @type {HTMLSelectElement} */
      const setTfliteTaskSelect = deviceTfliteContainer.querySelector(
        ".setTfliteTaskSelect"
      );
      /** @type {HTMLOptGroupElement} */
      const setTfliteTaskOptgroup =
        setTfliteTaskSelect.querySelector("optgroup");
      /** @type {HTMLButtonElement} */
      const setTfliteTaskButton = deviceTfliteContainer.querySelector(
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
        deviceTfliteContainer.querySelector(".tfliteSampleRate");
      /** @type {HTMLInputElement} */
      const setTfliteSampleRateInput = deviceTfliteContainer.querySelector(
        ".setTfliteSampleRateInput"
      );
      /** @type {HTMLButtonElement} */
      const setTfliteSampleRateButton = deviceTfliteContainer.querySelector(
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
        deviceTfliteContainer.querySelector(".tfliteSensorTypes");
      /** @type {HTMLTemplateElement} */
      const tfliteSensorTypeTemplate = deviceTfliteContainer.querySelector(
        ".tfliteSensorTypeTemplate"
      );
      /** @type {Object.<string, HTMLElement>} */
      const tfliteSensorTypeContainers = {};
      /** @type {BS.SensorType[]} */
      let tfliteSensorTypes = [];
      /** @type {HTMLButtonElement} */
      const setTfliteSensorTypesButton = deviceTfliteContainer.querySelector(
        ".setTfliteSensorTypes"
      );

      const updateTfliteSensorTypes = () => {
        device.allowedTfliteSensorTypes.forEach((sensorType) => {
          if (tfliteSensorTypeContainers[sensorType]) {
            return;
          }
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
              tfliteSensorTypes.splice(
                tfliteSensorTypes.indexOf(sensorType),
                1
              );
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
      };

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
        deviceTfliteContainer.querySelector(".tfliteIsReady");
      device.addEventListener("tfliteIsReady", () => {
        setTfliteIsReadyInput.checked = device.tfliteIsReady;
      });
      setTfliteIsReadyInput.checked = device.tfliteIsReady;

      /** @type {HTMLSpanElement} */
      const tfliteThresholdSpan =
        deviceTfliteContainer.querySelector(".tfliteThreshold");
      /** @type {HTMLInputElement} */
      const setTfliteThresholdInput = deviceTfliteContainer.querySelector(
        ".setTfliteThresholdInput"
      );
      /** @type {HTMLButtonElement} */
      const setTfliteThresholdButton = deviceTfliteContainer.querySelector(
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
      const tfliteCaptureDelaySpan = deviceTfliteContainer.querySelector(
        ".tfliteCaptureDelay"
      );
      /** @type {HTMLInputElement} */
      const setTfliteCaptureDelayInput = deviceTfliteContainer.querySelector(
        ".setTfliteCaptureDelayInput"
      );
      /** @type {HTMLButtonElement} */
      const setTfliteCaptureDelayButton = deviceTfliteContainer.querySelector(
        ".setTfliteCaptureDelayButton"
      );

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
      const tfliteInferencingEnabledInput = deviceTfliteContainer.querySelector(
        ".tfliteInferencingEnabled"
      );
      /** @type {HTMLButtonElement} */
      const toggleTfliteInferencingEnabledButton =
        deviceTfliteContainer.querySelector(".toggleTfliteInferencingEnabled");

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
        deviceTfliteContainer.querySelector(".tfliteInference");
      device.addEventListener("tfliteInference", (event) => {
        console.log("inference", event.message.tfliteInference);
        tfliteInferencePre.textContent = JSON.stringify(
          event.message.tfliteInference,
          null,
          2
        );
      });

      const updateDeviceTfliteContainer = () => {
        const enabled = device.isConnected && device.isTfliteAvailable;
        const disabled = !enabled;
        if (enabled) {
          deviceTfliteContainer.removeAttribute("hidden");
        } else {
          deviceTfliteContainer.setAttribute("hidden", "");
        }

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

        updateTfliteSensorTypes();
      };
      device.addEventListener("isConnected", () => {
        updateDeviceTfliteContainer();
      });
      updateDeviceTfliteContainer();

      // DEVICE VIBRATION
      const deviceVibrationContainer =
        connectedDeviceContainer.querySelector(".vibration");

      /** @type {HTMLButtonElement} */
      const triggerVibrationButton =
        deviceVibrationContainer.querySelector(".triggerVibration");
      const updateVibrationButton = () => {
        triggerVibrationButton.disabled = !device.isConnected;
      };
      triggerVibrationButton.addEventListener("click", () => {
        device.triggerVibration([
          {
            type: "waveformEffect",
            segments: [{ effect: "doubleClick100" }],
          },
        ]);
      });

      const updateDeviceVibrationContainer = () => {
        if (device.isConnected && device.vibrationLocations.length > 0) {
          deviceVibrationContainer.removeAttribute("hidden");
        } else {
          deviceVibrationContainer.setAttribute("hidden", "");
        }
        updateVibrationButton();
      };
      device.addEventListener("isConnected", () => {
        updateDeviceVibrationContainer();
      });
      updateDeviceVibrationContainer();
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
