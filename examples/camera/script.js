import * as BS from "../../build/brilliantsole.module.js";
window.BS = BS;
console.log(BS);

// DEVICE

const device = new BS.Device();
console.log({ device });
window.device = device;

// CONNECT

const toggleConnectionButton = document.getElementById("toggleConnection");
toggleConnectionButton.addEventListener("click", () =>
  device.toggleConnection()
);
device.addEventListener("connectionStatus", () => {
  let disabled = false;
  let innerText = device.connectionStatus;
  switch (device.connectionStatus) {
    case "notConnected":
      innerText = "connect";
      break;
    case "connected":
      innerText = "disconnect";
      break;
  }
  toggleConnectionButton.disabled = disabled;
  toggleConnectionButton.innerText = innerText;
});

// CAMERA

device.addEventListener("connected", () => {
  if (device.hasCamera) {
  } else {
    console.error("device doesn't have camera");
    device.disconnect();
  }
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
  takePictureButton.disabled = !device.isConnected;
  // device.sensorConfiguration.camera == 0 ||
  // device.cameraStatus != "idle";
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
