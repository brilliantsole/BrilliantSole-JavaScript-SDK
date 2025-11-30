import * as BS from "../../build/brilliantsole.module.js";
window.BS = BS;
console.log({ BS });
//BS.setAllConsoleLevelFlags({ log: true });

const client = new BS.WebSocketClient();
console.log({ client });

window.client = client;

// WEBSOCKET URL SEARCH PARAMS

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
    webSocketUrlInput.dispatchEvent(new Event("input"));
  } else {
    setUrlParam("webSocketUrl");
  }
});

// WEBSOCKET SERVER URL

/** @type {HTMLInputElement} */
const webSocketUrlInput = document.getElementById("webSocketUrl");
webSocketUrlInput.value = url.searchParams.get("webSocketUrl") || "";
webSocketUrlInput.dispatchEvent(new Event("input"));

// WEBSOCKET CONNECTION

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

// DEVICES

/** @type {BS.Device?} */
let device;

client.addEventListener("discoveredDevice", (event) => {
  if (device) {
    return;
  }
  const { discoveredDevice } = event.message;
  if (discoveredDevice.deviceType == "glasses") {
    console.log("connecting to discoveredDevice", discoveredDevice);
    device = client.connectToDevice(discoveredDevice.bluetoothId);
  }
});

BS.DeviceManager.AddEventListener("deviceConnected", (event) => {
  if (event.message.device.hasCamera) {
    device = event.message.device;
    onDevice();
  }
});

const onDevice = () => {
  console.log("onDevice", device);
  if (client.isScanning) {
    client.stopScan();
  }

  // CAMERA

  /** @type {HTMLSpanElement} */
  const isCameraAvailableSpan = document.getElementById("isCameraAvailable");
  const updateIsCameraAvailableSpan = () => {
    isCameraAvailableSpan.innerText = device.hasCamera;
  };
  device.addEventListener("connected", () => {
    updateIsCameraAvailableSpan();
  });

  /** @type {HTMLSpanElement} */
  const cameraStatusSpan = document.getElementById("cameraStatus");
  const updateCameraStatusSpan = () => {
    cameraStatusSpan.innerText = device.cameraStatus;
  };
  device.addEventListener("cameraStatus", () => {
    updateCameraStatusSpan();
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
    takePictureButton.disabled = !device.isConnected;
    // device.sensorConfiguration.camera == 0 ||
    // device.cameraStatus != "idle";
  };
  device.addEventListener("cameraStatus", () => {
    updateTakePictureButton();
  });
  updateTakePictureButton();

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
  updateFocusCameraButton();

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
  updateSleepCameraButton();

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
  const updateCameraConfigurationPre = () => {
    cameraConfigurationPre.textContent = JSON.stringify(
      device.cameraConfiguration,
      null,
      2
    );
  };
  device.addEventListener("getCameraConfiguration", () => {
    updateCameraConfigurationPre();
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
        !device.isConnected ||
        !device.hasCamera ||
        device.cameraStatus != "idle";
    };

    const updateInput = () => {
      const value = device.cameraConfiguration[cameraConfigurationType];
      span.innerText = value;
      input.value = value;
    };
    const range = device.cameraConfigurationRanges[cameraConfigurationType];
    input.min = range.min;
    input.max = range.max;
    updateInput();

    device.addEventListener("connected", () => {
      if (!device.hasCamera) {
        return;
      }

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
  updateCameraWhiteBalanceInput();
};
